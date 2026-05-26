import { prisma } from "@/lib/prisma";
import { getThemeDefaultArchiveBlocks } from "@/lib/archive-builder-theme-registry";
import { unstable_cache } from "next/cache";

export async function getArchiveBuilderBlocks(activeTheme: string) {
  const cached = unstable_cache(
    async () => {
      return await prisma.homepageBlock.findMany({
        where: {
          isActive: true,
          location: "archive",
          themeId: activeTheme,
        },
        orderBy: { order: "asc" },
      });
    },
    [`archive-blocks:${activeTheme}`],
    { tags: ["homepage"], revalidate: 300 },
  );

  const blocks = await cached();

  if (blocks.length > 0) return blocks;
  return getThemeDefaultArchiveBlocks(activeTheme);
}

export function isArchiveBuilderTheme(themeName: string) {
  return themeName === "pranala";
}

export function getArchivePageSize(blocks: any[], fallback = 12) {
  const safeFallback = Math.max(1, Math.min(30, fallback));
  let maxLimit = safeFallback;
  for (const block of blocks || []) {
    const children = Array.isArray(block?.config?.children) ? block.config.children : [];
    for (const child of children) {
      if (child?.isVisible === false) continue;
      if (child?.type !== "archive_post_grid" && child?.type !== "archive_post_list" && child?.type !== "news_hero_slider" && child?.type !== "news_grid") continue;
      const candidateLimits = [
        child?.config?.limit,
        child?.config?.tabletLimit,
        child?.config?.mobileLimit,
      ];
      for (const rawLimit of candidateLimits) {
        const parsed = typeof rawLimit === "number" ? rawLimit : Number(rawLimit);
        if (Number.isFinite(parsed) && parsed > 0) {
          maxLimit = Math.max(maxLimit, Math.max(1, Math.min(30, Math.round(parsed))));
        }
      }
    }
  }
  return maxLimit;
}
