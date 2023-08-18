import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: import.meta.env.NOTION_TOKEN,
});
