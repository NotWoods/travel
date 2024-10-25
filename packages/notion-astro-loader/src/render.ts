import type {
  HtmlElementNode,
  ListNode,
  TextNode,
} from "@jsdevtools/rehype-toc";
import { toc as rehypeToc } from "@jsdevtools/rehype-toc";
import {
  isFullBlock,
  iteratePaginatedAPI,
  type Client,
} from "@notionhq/client";
import type { MarkdownHeading } from "astro";

// #region Processor
import notionRehype from "notion-rehype-k";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { unified, type Plugin } from "unified";
import { handleImageBlocks } from "./image-handler.js";

const baseProcessor = unified()
  .use(notionRehype, {}) // Parse Notion blocks to rehype AST
  .use(rehypeSlug)
  .use(
    // @ts-ignore
    rehypeKatex,
  ) // Then you can use any rehype plugins to enrich the AST
  .use(rehypeStringify); // Turn AST to HTML string

export type RehypePlugin = Plugin<any[], any>;

export function buildProcessor(
  rehypePlugins: Promise<ReadonlyArray<readonly [RehypePlugin, any]>>,
) {
  let headings: MarkdownHeading[] = [];

  const processorWithToc = baseProcessor().use(rehypeToc, {
    customizeTOC(toc) {
      headings = extractTocHeadings(toc);
      return false;
    },
  });
  const processorPromise = rehypePlugins.then((plugins) => {
    let processor = processorWithToc;
    for (const [plugin, options] of plugins) {
      processor = processor.use(plugin, options);
    }
    return processor;
  });

  return async function process(blocks: unknown[]) {
    const processor = await processorPromise;
    const vFile = await processor.process({ data: blocks } as Record<
      string,
      unknown
    >);
    return { vFile, headings };
  };
}
// #endregion

export async function awaitAll<T>(iterable: AsyncIterable<T>) {
  const result: T[] = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
}

/**
 * Return a generator that yields all blocks in a Notion page, recursively.
 * @param blockId ID of block to get chidren for.
 * @param imagePaths MUTATED. This function will push image paths to this array.
 */
export async function* listBlocks(
  client: Client,
  blockId: string,
  imagePaths: string[],
) {
  for await (const block of iteratePaginatedAPI(client.blocks.children.list, {
    block_id: blockId,
  })) {
    if (!isFullBlock(block)) {
      continue;
    }

    if (block.has_children) {
      const children = await awaitAll(listBlocks(client, block.id, imagePaths));
      // @ts-ignore -- TODO: Make TypeScript happy here
      block[block.type].children = children;
    }

    if (block.type === "image") {
      let url: string;
      switch (block.image.type) {
        case "external":
          url = block.image.external.url;
          break;
        case "file":
          url = block.image.file.url;
          break;
      }
      imagePaths.push(url);

      // notion-rehype-k incorrectly expects "file" to be a string instead of an object
      yield {
        ...block,
        image: { type: block.image.type, [block.image.type]: url },
      };
    } else {
      yield block;
    }
  }
}

function extractTocHeadings(toc: HtmlElementNode): MarkdownHeading[] {
  if (toc.tagName !== "nav") {
    throw new Error(`Expected nav, got ${toc.tagName}`);
  }

  function listElementToTree(ol: ListNode, depth: number): MarkdownHeading[] {
    return ol.children.flatMap((li) => {
      const [_link, subList] = li.children;
      const link = _link as HtmlElementNode;

      const currentHeading: MarkdownHeading = {
        depth,
        text: (link.children![0] as TextNode).value,
        slug: link.properties.href!.slice(1),
      };

      let headings = [currentHeading];
      if (subList) {
        headings = headings.concat(
          listElementToTree(subList as ListNode, depth + 1),
        );
      }
      return headings;
    });
  }

  return listElementToTree(toc.children![0] as ListNode, 0);
}

export interface RenderedNotionEntry {
  html: string;
  metadata: {
    imagePaths: string[];
    headings: MarkdownHeading[];
  };
}

export async function renderNotionEntry(
  client: Client,
  process: ReturnType<typeof buildProcessor>,
  pageId: string,
  saveImagesAsStrings?: boolean,
): Promise<RenderedNotionEntry> {
  const imagePaths: string[] = [];
  let blocks;
  if (saveImagesAsStrings) {
    blocks = await handleImageBlocks(listBlocks(client, pageId, imagePaths));
  } else {
    blocks = await awaitAll(listBlocks(client, pageId, imagePaths));
  }

  const { vFile, headings } = await process(blocks);

  return {
    html: vFile.toString(),
    metadata: {
      headings,
      imagePaths,
    },
  };
}
