export function normalizeContentImageUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
}

export function extractImageUrlsFromHtml(html: unknown): string[] {
  if (typeof html !== "string" || html.trim() === "") return [];
  const matches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
  const urls = matches
    .map((match) => normalizeContentImageUrl(match[1]))
    .filter((src): src is string => Boolean(src));

  return urls.filter((src, index, array) => array.indexOf(src) === index);
}

export function getFirstImageFromHtml(html: unknown): string | undefined {
  return extractImageUrlsFromHtml(html)[0];
}
