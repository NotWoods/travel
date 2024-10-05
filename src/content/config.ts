import { z } from "astro/zod";
import { defineCollection } from "astro:content";
import { notionLoader, notionPageSchema } from "notion-astro-loader";
import * as propertySchema from "notion-astro-loader/schemas/raw-properties";
import * as transformedPropertySchema from "notion-astro-loader/schemas/transformed-properties";
import rehypeShiftHeading from "rehype-shift-heading";

const destinations = defineCollection({
  // The ID is a slug generated from the path of the file relative to `base`
  loader: notionLoader({
    auth: import.meta.env.NOTION_TOKEN,
    database_id: "52550644d5064212b2ca48efbf3bce19",
    filter: {
      property: "Hidden",
      checkbox: { equals: false },
    },
    rehypePlugins: [
      // Normalize headings to start at <h2>
      [rehypeShiftHeading, { shift: 1 }],
    ],
  }),
  schema: notionPageSchema({
    properties: z.object({
      Name: transformedPropertySchema.title,
      Hidden: transformedPropertySchema.checkbox,
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
