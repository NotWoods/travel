import { z } from "astro/zod";
import { pageIcon, pageCover, pageUrl } from "./page.js";

export const baseNotionSchema = z.object({
  icon: pageIcon,
  cover: pageCover,
  url: pageUrl,
});

export const defaultNotionSchema = baseNotionSchema.catchall(
  z
    .object({
      type: z.string(),
      id: z.string(),
    })
    .passthrough(),
);
