import type { CollectionEntry } from "astro:content";
import slug from "slug";

export function destinationSlug(page: CollectionEntry<"destinations">) {
  return page.data.properties.URL || slug(page.data.properties.Name);
}
