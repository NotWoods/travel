import rehypeToc, {
  type HtmlElementNode,
  type ListNode,
  type TextNode,
} from "@jsdevtools/rehype-toc";
import { notion } from "./client";
import { iteratePaginatedAPI, isFullBlock } from "@notionhq/client";
import type { TreeNode } from "../../components/toc/tree-node";
import { processor } from "./processor";

async function awaitAll<T>(iterable: AsyncIterable<T>) {
  const result: T[] = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
}

async function* listBlocks(blockId: string) {
  for await (const block of iteratePaginatedAPI(notion.blocks.children.list, {
    block_id: blockId,
  })) {
    if (!isFullBlock(block)) {
      continue;
    }

    if (block.has_children) {
      const children = await awaitAll(listBlocks(block.id));
      block[block.type].children = children;
    }

    yield block;
  }
}

function extractTocHeadings(toc: HtmlElementNode): TreeNode[] {
  if (toc.tagName !== "nav") {
    throw new Error(`Expected nav, got ${toc.tagName}`);
  }

  function listElementToTree(ol: ListNode): TreeNode[] {
    return ol.children.map((li) => {
      const [_link, subList] = li.children;
      const link = _link as HtmlElementNode;

      return {
        text: (link.children![0] as TextNode).value,
        slug: link.properties.href!.slice(1),
        children: subList ? listElementToTree(subList as ListNode) : [],
      };
    });
  }

  return listElementToTree(toc.children![0] as ListNode);
}

export interface RenderedNotionEntry {
  headings: TreeNode[];
  html: string;
}

export async function renderNotionEntry(
  pageId: string
): Promise<RenderedNotionEntry> {
  const blocks = await awaitAll(listBlocks(pageId));
  let headerTree: TreeNode[] = [];

  const vFile = await processor()
    .use(rehypeToc, {
      customizeTOC(toc) {
        headerTree = extractTocHeadings(toc);
        return false;
      },
    })
    .process({ data: blocks } as Record<string, unknown>);

  return {
    headings: headerTree,
    html: vFile.toString(),
  };
}
