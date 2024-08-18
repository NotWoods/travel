import { z } from "astro/zod";
import { defineCollection } from "astro:content";
import { notionLoader, notionPageSchema } from "notion-astro-loader";
import * as propertySchema from "notion-astro-loader/schemas/raw-properties";
import * as transformedPropertySchema from "notion-astro-loader/schemas/transformed-properties";

const destinations = defineCollection({
  // The ID is a slug generated from the path of the file relative to `base`
  loader: notionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    database_id: "52550644d5064212b2ca48efbf3bce19",
    filter: {
      property: "Hidden",
      checkbox: { equals: false },
    },
  }),
  schema: notionPageSchema({
    properties: z.object({
      Name: transformedPropertySchema.title,
      Created: transformedPropertySchema.created_time.optional(),
      URL: transformedPropertySchema.rich_text.optional(),
      "Short name": transformedPropertySchema.rich_text.optional(),
      "Last visited": propertySchema.date
        .optional()
        .transform((property) =>
          property?.date?.start ? new Date(property.date.start) : undefined,
        ),
      Featured: transformedPropertySchema.checkbox,
    }),
  }),
});

export const collections = { destinations };
