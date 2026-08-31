const CSS_KEYWORDS = new Set([
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
]);

const GENERIC_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "ui-rounded",
  "emoji",
  "math",
  "fangsong",
]);

const SKIP_REMOTE_LOAD_FAMILIES = new Set([
  ...GENERIC_FAMILIES,
  "arial",
  "book antiqua",
  "courier",
  "courier new",
  "georgia",
  "garamond",
  "palatino",
  "tahoma",
  "times",
  "times new roman",
  "trebuchet ms",
  "verdana",
]);

const DEPRECATED_FONT_ALIASES = new Set(["helvetica", "helvetica neue"]);

function stripQuotes(value: string): string {
  return value.replace(/^['"]|['"]$/g, "").trim();
}

function splitFontFamilies(value: string): string[] {
  return value
    .split(",")
    .map((part) => stripQuotes(part))
    .filter(Boolean);
}

function isCssSpecialValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return CSS_KEYWORDS.has(normalized) || normalized.startsWith("var(");
}

export function resolveThemeFontSynthesis(font?: string): "none" {
  void font;
  return "none";
}

function quoteFontFamily(font: string): string {
  return /[\s"'()]/.test(font) ? `"${stripQuotes(font)}"` : stripQuotes(font);
}

function joinFontFamilies(families: string[]): string {
  return families
    .map((family) => {
      const cleanFamily = stripQuotes(family);
      if (!cleanFamily) return "";
      return GENERIC_FAMILIES.has(cleanFamily.toLowerCase()) ? cleanFamily : quoteFontFamily(cleanFamily);
    })
    .filter(Boolean)
    .join(", ");
}

export function normalizeDeprecatedFontChoice(font?: string, fallback = ""): string {
  const value = typeof font === "string" ? font.trim() : "";
  if (!value) return fallback;
  if (isCssSpecialValue(value)) return value;

  const filteredFamilies = splitFontFamilies(value).filter((family) => !DEPRECATED_FONT_ALIASES.has(family.toLowerCase()));
  if (filteredFamilies.length === 0) return fallback;

  return joinFontFamilies(filteredFamilies);
}

function normalizePrimaryFont(font: string, fallback: string): string {
  const cleanFont = stripQuotes(font);
  if (!cleanFont) return fallback;
  if (GENERIC_FAMILIES.has(cleanFont.toLowerCase())) return cleanFont;
  return `${quoteFontFamily(cleanFont)}, ${fallback}`;
}

export function resolveThemeFontFamily(font?: string, fallback = "sans-serif"): string {
  const value = typeof font === "string" ? font.trim() : "";
  if (!value) return fallback;
  if (isCssSpecialValue(value)) return value;

  const normalizedValue = normalizeDeprecatedFontChoice(value, "");
  if (!normalizedValue) return fallback;
  if (normalizedValue.includes(",")) return normalizedValue;
  return normalizePrimaryFont(normalizedValue, fallback);
}

export function getThemeFontLoadFamilies(font?: string): string[] {
  const value = typeof font === "string" ? font.trim() : "";
  if (!value || isCssSpecialValue(value)) return [];

  const normalizedValue = normalizeDeprecatedFontChoice(value, "");
  if (!normalizedValue) return [];

  const families = splitFontFamilies(normalizedValue);
  const primaryFamily = families.find((family) => !GENERIC_FAMILIES.has(family.toLowerCase()));
  if (!primaryFamily) return [];

  const normalizedPrimary = primaryFamily.toLowerCase();
  if (SKIP_REMOTE_LOAD_FAMILIES.has(normalizedPrimary)) return [];

  return [primaryFamily];
}
