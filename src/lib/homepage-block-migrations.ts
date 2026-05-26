type GenericRecord = Record<string, unknown>;

const CATEGORY_KEY_MAPPINGS = [
  ["categoryTextColor", "categoryLabelColor"],
  ["categoryBgColor", "categoryLabelBgColor"],
  ["categoryFontSize", "categoryLabelFontSize"],
  ["categoryBorderRadius", "categoryLabelBorderRadius"],
] as const;

const RESPONSIVE_PREFIXES = ["", "tablet", "mobile"] as const;

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
  if ("config" in normalizedBlock) {
    normalizedBlock.config = normalizeConfigObject(normalizedBlock.config);
  }
  return normalizedBlock as T;
};

export const normalizeHomepageBlocks = <T>(blocks: T[]): T[] => {
  if (!Array.isArray(blocks)) return blocks;
  return blocks.map((block) => normalizeBlockTree(block));
};
