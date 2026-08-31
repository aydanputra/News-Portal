import { resolveBlockTypeAlias } from "@/lib/block-registry";

type GenericRecord = Record<string, unknown>;

const CATEGORY_KEY_MAPPINGS = [
  ["categoryTextColor", "categoryLabelColor"],
  ["categoryBgColor", "categoryLabelBgColor"],
  ["categoryFontSize", "categoryLabelFontSize"],
  ["categoryBorderRadius", "categoryLabelBorderRadius"],
] as const;

const RESPONSIVE_PREFIXES = ["", "tablet", "mobile"] as const;
const LEGACY_AUTO_TITLES_BY_TYPE: Record<string, string[]> = {
  headline_2: ["Headline 2"],
  news_list_highlight: ["News List Highlight"],
  news_slider: ["News Slider"],
};
const ALIASED_DEFAULT_TITLES: Record<string, string> = {
  classic_hero: "Hero",
  news_grid_slider: "Grid Slider",
  news_headline_big: "Headline Big",
  news_list: "Simple List",
};

const isNonEmptyValue = (value: unknown) => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
};

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const normalizeConfigObject = (config: unknown): unknown => {
  if (!config || typeof config !== "object" || Array.isArray(config)) return config;

  const normalized: GenericRecord = { ...(config as GenericRecord) };

  for (const [legacyKey, normalizedKey] of CATEGORY_KEY_MAPPINGS) {
    for (const prefix of RESPONSIVE_PREFIXES) {
      const sourceKey = prefix ? `${prefix}${capitalize(legacyKey)}` : legacyKey;
      const targetKey = prefix ? `${prefix}${capitalize(normalizedKey)}` : normalizedKey;

      if (!isNonEmptyValue(normalized[targetKey]) && isNonEmptyValue(normalized[sourceKey])) {
        normalized[targetKey] = normalized[sourceKey];
      }

      delete normalized[sourceKey];
    }
  }

  const children = normalized.children;
  if (Array.isArray(children)) {
    normalized.children = children.map((child) => normalizeBlockTree(child));
  }

  return normalized;
};

export const normalizeBlockTree = <T>(block: T): T => {
  if (!block || typeof block !== "object" || Array.isArray(block)) return block;

  const normalizedBlock = { ...(block as GenericRecord) };
  const originalType = typeof normalizedBlock.type === "string" ? normalizedBlock.type : "";
  const effectiveType = originalType ? resolveBlockTypeAlias(originalType) : originalType;
  if (typeof normalizedBlock.type === "string") {
    normalizedBlock.type = effectiveType;
  }
  if (typeof normalizedBlock.title === "string") {
    const normalizedTitle = normalizedBlock.title.trim();
    const legacyAutoTitles = LEGACY_AUTO_TITLES_BY_TYPE[originalType] || [];
    if (normalizedTitle !== "" && legacyAutoTitles.includes(normalizedTitle)) {
      normalizedBlock.title = ALIASED_DEFAULT_TITLES[effectiveType] || normalizedBlock.title;
    }
  }
  if ("config" in normalizedBlock) {
    normalizedBlock.config = normalizeConfigObject(normalizedBlock.config);
  }
  return normalizedBlock as T;
};

export const normalizeHomepageBlocks = <T>(blocks: T[]): T[] => {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.map((block) => normalizeBlockTree(block));
};
