/**
 * Extract a plain string from a list of rich text items.
 *
 * @example
 * richTextToPlainText(page.properties.Name.title)
 */
export function richTextToPlainText(
  data: ReadonlyArray<{ plain_text: string }>,
): string {
  return data.map((text) => text.plain_text).join("");
}

/**
 * Extract the URL from a file property.
 */
export function fileToUrl(
  file:
    | { type: "external"; external: { url: string } }
    | { type: "file"; file: { url: string } }
    | null,
): string | undefined {
  switch (file?.type) {
    case "external":
      return file.external.url;
    case "file":
      return file.file.url;
    default:
      return undefined;
  }
}
