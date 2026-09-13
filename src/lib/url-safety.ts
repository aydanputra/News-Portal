/**
 * Helper keamanan URL/CSS yang ringan — TANPA dependensi `sanitize-html`.
 *
 * Modul ini dipisah dari `@/lib/sanitizer` agar komponen client (yang hanya
 * butuh sanitasi URL/CSS) tidak ikut menarik `sanitize-html` (berat) ke bundle
 * browser. Fungsi di sini aman dipakai di client maupun server.
 */

export function sanitizeExternalUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  if (!value) return "";
  if (value.startsWith("/") || value.startsWith("#")) return value;
  if (value.toLowerCase().startsWith("javascript:")) return "";
  if (value.toLowerCase().startsWith("data:")) return "";
  if (value.toLowerCase().startsWith("vbscript:")) return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:" && url.protocol !== "mailto:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function sanitizeCssUrl(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  if (!value) return "";
  const lower = value.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) return "";
  if (/[<>"'()\\\n\r]/.test(value)) return "";
  if (value.startsWith("/")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return "";
}

export function safeStyleTagCss(raw: string): string {
  const value = typeof raw === "string" ? raw : "";
  if (!value) return "";
  return value
    .replace(/\u0000/g, "")
    .replace(/<\/style/gi, "<\\/style")
    .replace(/<\/script/gi, "<\\/script");
}
