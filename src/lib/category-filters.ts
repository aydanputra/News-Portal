export function normalizeSlugArray(value: unknown): string[] {
  const rawItems = Array.isArray(value)
    ? value
    : typeof value === "string"
    ? value.split(",")
    : [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of rawItems) {
    if (typeof item !== "string") continue;
    const slug = item.trim();
    if (!slug || slug === "all" || seen.has(slug)) continue;
    seen.add(slug);
    result.push(slug);
  }

  return result;
}

export function getConfigCategoryIncludeSlugs(config: Record<string, unknown>): string[] {
  const direct = normalizeSlugArray(config.categorySlugs);
  if (direct.length > 0) return direct;

  const legacyCategorySlug = typeof config.categorySlug === "string" ? config.categorySlug.trim() : "";
  if (legacyCategorySlug && legacyCategorySlug !== "all") return [legacyCategorySlug];

  const legacyCategory = typeof config.category === "string" ? config.category.trim() : "";
  if (legacyCategory && legacyCategory !== "all") return [legacyCategory];

  return [];
}

export function getConfigCategoryExcludeSlugs(config: Record<string, unknown>): string[] {
  return normalizeSlugArray(config.excludeCategorySlugs);
}

export function getConfigTagIncludeSlugs(config: Record<string, unknown>): string[] {
  const direct = normalizeSlugArray(config.tagSlugs);
  if (direct.length > 0) return direct;

  const legacyTagSlug = typeof config.tagSlug === "string" ? config.tagSlug.trim() : "";
  if (legacyTagSlug) return [legacyTagSlug];

  return [];
}

export function getConfigTagExcludeSlugs(config: Record<string, unknown>): string[] {
  return normalizeSlugArray(config.excludeTagSlugs);
}

export function getSingleCategoryArchiveSlug(config: Record<string, unknown>): string | null {
  const includeSlugs = getConfigCategoryIncludeSlugs(config);
  return includeSlugs.length === 1 ? includeSlugs[0] : null;
}

export function getSingleTagArchiveSlug(config: Record<string, unknown>): string | null {
  const includeSlugs = getConfigTagIncludeSlugs(config);
  return includeSlugs.length === 1 ? includeSlugs[0] : null;
}

export function applyCategoryFiltersToWhere(
  whereClause: Record<string, unknown>,
  includeSlugs: string[],
  excludeSlugs: string[],
) {
  const andClauses = Array.isArray(whereClause.AND) ? [...whereClause.AND] : [];

  if (includeSlugs.length > 0) {
    andClauses.push({
      OR: [
        { category: { slug: { in: includeSlugs } } },
        { postCategories: { some: { category: { slug: { in: includeSlugs } } } } },
      ],
    });
  }

  if (excludeSlugs.length > 0) {
    andClauses.push({
      NOT: {
        OR: [
          { category: { slug: { in: excludeSlugs } } },
          { postCategories: { some: { category: { slug: { in: excludeSlugs } } } } },
        ],
      },
    });
  }

  if (andClauses.length > 0) {
    whereClause.AND = andClauses;
  }

  return whereClause;
}

export function applyTagFiltersToWhere(
  whereClause: Record<string, unknown>,
  includeSlugs: string[],
  excludeSlugs: string[],
) {
  const andClauses = Array.isArray(whereClause.AND) ? [...whereClause.AND] : [];

  if (includeSlugs.length > 0) {
    andClauses.push({
      tags: {
        some: {
          slug: { in: includeSlugs },
        },
      },
    });
  }

  if (excludeSlugs.length > 0) {
    andClauses.push({
      NOT: {
        tags: {
          some: {
            slug: { in: excludeSlugs },
          },
        },
      },
    });
  }

  if (andClauses.length > 0) {
    whereClause.AND = andClauses;
  }

  return whereClause;
}
