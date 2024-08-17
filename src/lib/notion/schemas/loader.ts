import { z } from "astro/zod";
import { pageIcon, pageCover, pageUrl } from "./page";

export const baseNotionData = z.object({
  icon: pageIcon,
  cover: pageCover,
  url: pageUrl,
});

export const notionData = baseNotionData.catchall(
  z
    .object({
      type: z.string(),
      id: z.string(),
    })
    .passthrough(),
);
