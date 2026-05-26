
export function cleanExcerpt(html: string | null | undefined, length: number = 100): string {
  if (!html) return "";

  // 1. Decode common HTML entities first (to handle escaped tags like &lt;p&gt;)
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&copy;": "©",
    "&reg;": "®",
  };

  let text = html.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return entities[entity] || entity;
  });

  // 2. Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // 2b. Remove incomplete tags at the end (e.g. <a href="...)
  // Matches < followed by letters or /, then any non-> chars until end of string
  text = text.replace(/<[a-zA-Z\/][^>]*$/g, "");

  // 3. Remove multiple spaces and trim
  text = text.replace(/\s+/g, " ").trim();

  // 4. Truncate
  if (text.length > length) {
    return text.substring(0, length) + "...";
  }

  return text;
}
