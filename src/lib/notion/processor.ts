import { unified } from "unified";
import notionRehype from "notion-rehype-k";
import rehypeKatex from "rehype-katex";
import rehypeShiftHeading from "rehype-shift-heading";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";

export const processor = unified()
  .use(notionRehype, {}) // Parse Notion blocks to rehype AST
  .use(rehypeShiftHeading, { shift: 1 })
  .use(rehypeSlug)
  .use(rehypeKatex) // Then you can use any rehype plugins to enrich the AST
  .use(rehypeStringify); // Turn AST to HTML string
