import { Client, isFullPage, iteratePaginatedAPI } from "@notionhq/client";
import type { Loader } from "astro/loaders";
import { renderNotionEntry } from "./entry.js";
import { richTextToPlainText } from "./format.js";
import { defaultNotionSchema } from "./schemas/loader.js";
import type {
  ClientOptions,
  PageObjectResponse,
  QueryDatabaseParameters,
} from "./types.js";

export interface NotionLoaderOptions
  extends ClientOptions,
    Pick<
      QueryDatabaseParameters,
      "database_id" | "filter_properties" | "sorts" | "filter" | "archived"
    > {}

export function notionLoader({
  database_id,
  filter_properties,
  sorts,
  filter,
  archived,
  ...clientOptions
}: NotionLoaderOptions): Loader {
  const notionClient = new Client(clientOptions);

  function pageNameForLogger(page: PageObjectResponse): string {
    const title =
      page.properties.Name && "title" in page.properties.Name
        ? richTextToPlainText(page.properties.Name.title)
        : undefined;

    return `page ${page.id} (Name ${title ?? "unknown"})`;
  }

  return {
    name: "notion-loader",
    schema: defaultNotionSchema,
    async load({ store, logger, parseData }) {
      logger.info("Loading notion pages");

      const existingPageIds = new Set<string>(store.keys());
      const renderPromises: Promise<void>[] = [];

      const pages = iteratePaginatedAPI(notionClient.databases.query, {
        database_id,
        filter_properties,
        sorts,
        filter,
        archived,
      });
      for await (const page of pages) {
        if (!isFullPage(page)) {
          continue;
        }

        existingPageIds.delete(page.id);
        const existingPage = store.get(page.id);

        // If the page has been updated, re-render it
        if (existingPage?.digest !== page.last_edited_time) {
          const data = await parseData({
            id: page.id,
            data: {
              icon: page.icon,
              cover: page.cover,
              url: page.url,
              ...page.properties,
            },
          });

          logger.debug(`Rendering ${pageNameForLogger(page)}`);
          const renderPromise = renderNotionEntry(notionClient, page.id)
            .catch((error: unknown) => {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : typeof error === "string"
                    ? error
                    : "Unknown error";
              logger.error(
                `Failed to render ${pageNameForLogger(page)}: ${errorMessage}`,
              );
              console.error(error);

              return undefined;
            })
            .then((rendered) => {
              if (rendered !== undefined) {
                logger.debug(`Rendered ${pageNameForLogger(page)}`);
              }
              store.set({
                id: page.id,
                digest: page.last_edited_time,
                data,
                rendered,
              });
            });

          renderPromises.push(renderPromise);
        }
      }

      // Remove any pages that have been deleted
      for (const deletedPageId of existingPageIds) {
        store.delete(deletedPageId);
      }

      // Wait for rendering to complete
      await Promise.all(renderPromises);
    },
  };
}
