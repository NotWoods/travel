import type { CollectionEntry } from "astro:content";
import slug from "slug";

export function destinationSlug(page: CollectionEntry<"destinations">): string {
  const result = page.data.properties.URL || slug(page.data.properties.Name);
  if (typeof result !== "string") {
    throw new Error(
      `Expected URL or Name to be a string for ${page.data.properties.Name}`,
    );
  }
  return result;
}
