export const imageURLToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = response.headers.get("content-type");
  return `data:${mimeType};base64,${base64}`;
};
