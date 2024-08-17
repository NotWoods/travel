import { z } from "astro/zod";
import { externalPropertyResponse, filePropertyResponse } from "./file";

export const pageCover = z
  .discriminatedUnion("type", [externalPropertyResponse, filePropertyResponse])
  .nullable();
export const pageIcon = z
  .discriminatedUnion("type", [
    externalPropertyResponse,
    filePropertyResponse,
    z.object({
      type: z.literal("emoji"),
      emoji: z.string(),
    }),
  ])
  .nullable();
export const pageUrl = z.string().url();
