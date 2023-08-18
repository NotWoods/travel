import { collectPaginatedAPI, isFullPage } from "@notionhq/client";
import slug from "slug";
import { z } from "zod";
import { notion } from "./client";

const plainRichTextSchema = z.array(
  z.object({
    type: z.enum(["text"]),
    plain_text: z.string(),
  })
);

const pageProperties = z.object({
  URL: z
    .object({
      type: z.enum(["rich_text"]),
      rich_text: plainRichTextSchema,
    })
    .or(z.null()),
  Name: z.object({
    type: z.enum(["title"]),
    title: plainRichTextSchema,
  }),
  "Short name": z
    .object({
      type: z.enum(["rich_text"]),
      rich_text: plainRichTextSchema,
    })
    .or(z.null()),
  "Last visited": z
    .object({
      type: z.enum(["date"]),
      date: z
        .object({
          start: z.string(),
        })
        .or(z.null()),
    })
    .or(z.null()),
  Featured: z.object({
    type: z.enum(["checkbox"]),
    checkbox: z.boolean(),
  }),
});

function plainText(data: ReadonlyArray<{ plain_text: string }>) {
  return data.map((text) => text.plain_text).join("");
}

function fileUrl(
  file:
    | { type: "external"; external: { url: string } }
    | { type: "file"; file: { url: string } }
    | null
) {
  switch (file?.type) {
    case "external":
      return file.external.url;
    case "file":
      return file.file.url;
    default:
      return undefined;
  }
}

export interface NotionCollectionEntry {
  id: string;
  database: string;
  slug: string;
  data: {
    cover?: string;
    title: string;
    shortName?: string;
    date: Date;
    updatedDate: Date;
    lastVisited?: Date;
    notionLink: string;
    featured: boolean;
  };
}

export interface NotionInvalidCollectionEntry {
  id: string;
  database: string;
  page: unknown;
  errors: z.ZodIssue[];
}

export async function getNotionCollection(databaseId: string) {
  const pages = await collectPaginatedAPI(notion.databases.query, {
    database_id: databaseId,
    filter: {
      property: "Hidden",
      checkbox: { equals: false },
    },
  });

  const successfulPages: NotionCollectionEntry[] = [];
  const failedPages: NotionInvalidCollectionEntry[] = [];

  for (const page of pages) {
    if (!isFullPage(page)) {
      continue;
    }

    const result = pageProperties.safeParse(page.properties);

    if (result.success) {
      const properties = result.data;
      const title = plainText(properties.Name.title);
      console.log(title, slug(title));

      successfulPages.push({
        id: page.id,
        database: databaseId,
        slug:
          properties.URL && properties.URL.rich_text.length > 0
            ? plainText(properties.URL.rich_text)
            : slug(title),
        data: {
          title,
          shortName: properties["Short name"]
            ? plainText(properties["Short name"].rich_text)
            : undefined,
          cover: fileUrl(page.cover),
          date: new Date(page.created_time),
          updatedDate: new Date(page.last_edited_time),
          lastVisited: properties["Last visited"]?.date?.start
            ? new Date(properties["Last visited"].date.start)
            : undefined,
          featured: properties.Featured.checkbox,
          notionLink: page.url.replace(
            "https://www.notion.so",
            "https://tigeroakes.notion.site"
          ),
        },
      });
    } else {
      console.log(page.properties);
      failedPages.push({
        id: page.id,
        database: databaseId,
        page,
        errors: result.error.issues,
      });
    }
  }

  return {
    fulfilled: successfulPages,
    rejected: failedPages,
  };
}
