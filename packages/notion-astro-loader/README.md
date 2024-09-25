# Notion Astro Loader

[Notion](https://developers.notion.com/) loader for the experimental [Astro Content Layer API](https://astro.build/blog/astro-4140/#experimental-content-layer-api). It allows you to load pages from a Notion database then render them as pages in a collection.

To use the new Astro content layer, you need to enable experimental support and use `astro@4.14` or later.

## Installation

```sh
npm install notion-astro-loader
```

## Usage

This package requires that you enable the experimental content layer in Astro. You can do this by adding the following to your `astro.config.js`:

```js
// astro.config.js
import { defineConfig } from "astro";

export default defineConfig({
  experimental: {
    contentLayer: true,
  },
});
```

You will need to create an [internal Notion integration](https://developers.notion.com/docs/authorization#internal-integration-auth-flow-set-up). You will also want to share your database with the integration.

You can then use the loader loader in your content collection configuration:

```ts
// src/content/config.ts
import { defineCollection } from "astro:content";
import { notionLoader } from "notion-astro-loader";

const database = defineCollection({
  loader: notionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_DATABASE_ID,
    // Use Notion sorting and filtering
    filter: {
      property: "Hidden",
      checkbox: { equals: false },
    },
  }),
});

export const collections = { database };
```

You can then use these like any other content collection in Astro. The data is type-safe, and the types are automatically generated based on the schema of the Notion database.

### Advanced Schema

Helper Zod schemas are provided to let you customize and transform Notion page properties.
This can be used instead of the automatic inference.

```ts
// src/content/config.ts
import { z } from "astro/zod";
import { defineCollection } from "astro:content";
import { notionLoader } from "notion-astro-loader";
import {
  notionPageSchema,
  propertySchema,
  transformedPropertySchema,
} from "notion-astro-loader/schemas";

const database = defineCollection({
  loader: notionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    database_id: import.meta.env.NOTION_DATABASE_ID,
  }),
  schema: notionPageSchema({
    properties: z.object({
      // Converts to a primitive string
      Name: transformedPropertySchema.title,
      // Converts to a Notion API created_time object
      Created: propertySchema.created_time.optional(),
    }),
  }),
});

export const collections = { database };
```

### Formatters

A few helper functions are provided for transforming Notion API objects into simple JavaScript types.

- `richTextToPlainText` converts [rich text](https://developers.notion.com/reference/rich-text) into plain strings
- `fileToUrl` converts [file objects](https://developers.notion.com/reference/file-object) to a URL string.
- `dateToDateObjects` converts the strings in a [date property](https://developers.notion.com/reference/page-property-values#date) into `Date`s.

## Options

The `notionLoader` function takes an object with the same options as the [`notionClient.databases.query`](https://developers.notion.com/reference/post-database-query) function, and the same options as the notion [`Client` constructor](https://github.com/makenotion/notion-sdk-js?tab=readme-ov-file#client-options).

- `auth`: The API key for your Notion integration.
- `database_id`: The ID of the database to load pages from.
