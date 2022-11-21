import { Client } from "@notionhq/client";
import { unified } from "unified";
import notionRehype from "notion-rehype";
import rehypeKatex from "rehype-katex";
import rehypeShiftHeading from "rehype-shift-heading";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

export const notion = new Client({
  auth: import.meta.env.NOTION_TOKEN,
});

export const workspaceId = "tigeroakes";
export const databaseId = "52550644d5064212b2ca48efbf3bce19";

export type BlockObjectResponse = Extract<
  Awaited<ReturnType<typeof notion.blocks.children.list>>["results"][number],
  { type: string }
>;

export async function listBlocks(block_id: string) {
  let response = await notion.blocks.children.list({ block_id });
  let blocks: typeof response["results"] = [];
  while (response.results.length > 0) {
    blocks = blocks.concat(response.results);

    if (response.next_cursor) {
      response = await notion.blocks.children.list({
        block_id,
        start_cursor: response.next_cursor,
      });
    } else {
      break;
    }
  }
  return blocks;
}

export const processor = unified()
  .use(notionRehype) // Parse Notion blocks to rehype AST
  .use(rehypeShiftHeading, { shift: 1 })
  .use(rehypeSlug)
  .use(rehypeKatex) // Then you can use any rehype plugins to enrich the AST
  .use(rehypeStringify); // Turn AST to HTML string
