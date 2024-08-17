import { defineCollection } from "astro:content";
import { notionLoader } from "../lib/notion";
import { richTextToPlainText } from "../lib/notion";
import { baseNotionData } from "../lib/notion/schemas";
import * as propertyType from "../lib/notion/schemas/properties";

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
  schema: baseNotionData.extend({
    Name: propertyType.title.transform((property) =>
      richTextToPlainText(property.title),
    ),
    Created: propertyType.created_time.transform(
      (property) => new Date(property.created_time),
    ),
    URL: propertyType.rich_text
      .optional()
      .transform((property) =>
        property ? richTextToPlainText(property.rich_text) : undefined,
      ),
    "Short name": propertyType.rich_text
      .optional()
      .transform((property) =>
        property ? richTextToPlainText(property.rich_text) : undefined,
      ),
    "Last visited": propertyType.date
      .optional()
      .transform((property) =>
        property?.date?.start ? new Date(property.date.start) : undefined,
      ),
    Featured: propertyType.checkbox.transform((property) => property.checkbox),
  }),
});

export const collections = { destinations };
