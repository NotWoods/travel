import type { Client } from "@notionhq/client";
import { z } from "astro/zod";
import * as rawPropertyType from "./schemas/raw-properties.js";
import type { DatabasePropertyConfigResponse } from "./types.js";

export async function propertiesSchemaForDatabase(
  client: Client,
  databaseId: string,
) {
  const database = await client.databases.retrieve({ database_id: databaseId });

  const schemaForDatabaseProperty: (
    propertyConfig: DatabasePropertyConfigResponse,
  ) => z.ZodTypeAny = (propertyConfig) => rawPropertyType[propertyConfig.type];

  const schema = Object.fromEntries(
    Object.entries(database.properties).map(
      ([key, value]: [string, DatabasePropertyConfigResponse]) => {
        let propertySchema = schemaForDatabaseProperty(value);
        if (value.description) {
          propertySchema = propertySchema.describe(value.description);
        }
        if (key !== "Name") {
          // propertySchema = propertySchema.optional();
        }

        return [key, propertySchema];
      },
    ),
  );

  return z.object(schema);
}
