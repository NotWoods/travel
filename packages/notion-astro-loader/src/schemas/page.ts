import { z } from "astro/zod";
import { externalPropertyResponse, filePropertyResponse } from "./file.js";

export const pageObjectSchema = z.object({
  icon: z
    .discriminatedUnion("type", [
      externalPropertyResponse,
      filePropertyResponse,
      z.object({
        type: z.literal("emoji"),
        emoji: z.string(),
      }),
    ])
    .nullable(),
  cover: z
    .discriminatedUnion("type", [
      externalPropertyResponse,
      filePropertyResponse,
    ])
    .nullable(),
  archived: z.boolean(),
  in_trash: z.boolean(),
  url: z.string().url(),
  public_url: z.string().url().nullable(),
  properties: z.object({}).catchall(
    z
      .object({
        type: z.string(),
        id: z.string(),
      })
      .passthrough(),
  ),
});

export function notionPageSchema<Schema extends z.ZodTypeAny>(schema: Schema) {
  return pageObjectSchema.extend({ properties: schema });
}
