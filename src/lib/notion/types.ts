import type { Client, isFullPage } from "@notionhq/client";

/**
 * @module
 * Types from the internal Notion JS API, exposed for use in this project.
 */

export type ClientOptions = NonNullable<
  ConstructorParameters<typeof Client>[0]
>;
export type QueryDatabaseParameters = NonNullable<
  Parameters<Client["databases"]["query"]>[0]
>;

export type PageObjectResponse = Extract<
  Parameters<typeof isFullPage>[0],
  { properties: object }
>;
export type PageProperty = PageObjectResponse["properties"][string];
export type EmojiRequest = Extract<
  PageObjectResponse["icon"],
  { type: "emoji" }
>["emoji"];

export type RichTextItemResponse = Extract<
  PageProperty,
  { type: "rich_text" }
>["rich_text"][number];
