import { prisma } from "@/lib/prisma";
import { getThemeComponent } from "@/lib/theme-registry.server";
import { getSettings } from "@/lib/settings";
import { getCachedCategories } from "@/lib/data";
import { unstable_cache } from "next/cache";
import { getBuilderSourceBlocks } from "@/lib/page-builder-source-blocks";
import { getPublicMenusByLocation } from "@/lib/public-menus";
import { toPublicPostPreviewList } from "@/lib/post-preview";
import TrackPublicPageView from "@/components/TrackPublicPageView";
import {
  applyCategoryFiltersToWhere,
  applyTagFiltersToWhere,
  getConfigCategoryExcludeSlugs,
  getConfigCategoryIncludeSlugs,
  getConfigTagExcludeSlugs,
  getConfigTagIncludeSlugs,
} from "@/lib/category-filters";

export const revalidate = 60;

function hashString(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

function shuffleSeeded<T>(arr: T[], seedStr: string) {
  const a = arr.slice();
  const rand = createSeededRandom(hashString(seedStr));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

// Cached fetch for fallback posts
const getFallbackPosts = unstable_cache(
  async () => {
    const now = new Date();
    return await prisma.post.findMany({
      where: { 
        published: true,
        status: { not: "ARCHIVED" }, // FIX: Exclude trashed posts
        OR: [
          { publishedAt: { lte: now } },
          { publishedAt: null }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        image: true,
        publishedAt: true,
        type: true,
        videoUrl: true,
        category: {
          select: { name: true, slug: true }
        },
        tags: {
          select: { name: true, slug: true }
        },
        author: { select: { name: true, avatar: true, banner: true } },
        featuredImage: {
          select: {
            id: true,
            fileUrl: true,
            width: true,
            height: true,
          }
        },
        views: true,
      },
      orderBy: [
        { publishedAt: "desc" },
        { updatedAt: "desc" }
      ],
      take: 7, 
    });
  },
  ['homepage-fallback-posts'],
  { tags: ['homepage', 'posts'] }
);

const getHeaderFooterBlocks = unstable_cache(
  async (activeTheme: string) => {
    const publicBlockSelect = {
      id: true,
      type: true,
      title: true,
      order: true,
      config: true,
      isActive: true,
    } as const;
    const [headerRows, footerRows] = await Promise.all([
      prisma.homepageBlock.findMany({
        where: { location: "header", isActive: true, themeId: activeTheme as any },
        orderBy: { order: "asc" },
        select: publicBlockSelect,
      }),
      prisma.homepageBlock.findMany({
        where: { location: "footer", themeId: activeTheme as any },
        orderBy: { order: "asc" },
        select: publicBlockSelect,
      }),
    ]);

    return {
      headerConfig: headerRows ?? null,
      footerConfig: footerRows ?? null,
    };
  },
  ["homepage-header-footer"],
  { tags: ["homepage"], revalidate: 300 },
);

async function getData() {
  const now = new Date();
  
  // 1. Parallel Fetch Base Data
  const [setting, categories, menusByLocation] = await Promise.all([
      getSettings(),
      getCachedCategories(),
      getPublicMenusByLocation()
  ]);

  const activeTheme = (setting as any)?.activeTheme || "classic";
  const [{ headerConfig, footerConfig }, sourceBlocksByLocation] = await Promise.all([
    getHeaderFooterBlocks(activeTheme),
    getBuilderSourceBlocks(activeTheme as any),
  ]);
  const blocks = sourceBlocksByLocation.home || [];

  // 3. Fallback: Jika tidak ada blocks, ambil default posts
  let posts: any[] = [];
  if (blocks.length === 0) {
      // @ts-ignore
      posts = toPublicPostPreviewList(await getFallbackPosts());
  }

  // Dynamic Data Fetching based on Blocks
  const MAX_RECURSION_DEPTH = 5;

  const extractBlocksRecursive = (blocks: any[], depth = 0): any[] => {
      if (depth > MAX_RECURSION_DEPTH) return [];
      if (!Array.isArray(blocks)) return [];

      const result: any[] = [];
      for (const block of blocks) {
          if (!block) continue;
          
          if (block.type === 'section') {
              const config = block.config as any || {};
              if (config.children && Array.isArray(config.children)) {
                  // Recursively extract children
                  result.push(...extractBlocksRecursive(config.children, depth + 1));
              }
          } else {
              result.push(block);
          }
      }
      return result;
  };

  const allBlocksToProcess = extractBlocksRecursive(blocks);
  
  const blockData: Record<string, any> = {};

  const blockTypesNeedingData = new Set([
    "news_grid",
    "news_list",
    "news_slider",
    "sidebar_widget",
    "headline_2",
    "news_list_highlight",
    "tag_cloud",
    "news_bullet_list",
    "news_headline_big",
    "news_hero_split_4",
    "news_hero_slider",
    "news_grid_slider",
    "hero",
    "classic_hero",
  ]);

  const offsetEnabledTypes = new Set([
    "news_bullet_list",
    "news_grid",
    "news_list",
    "news_hero_split_4",
    "news_hero_slider",
    "news_grid_slider",
  ]);

  const needsCategoryList =
    allBlocksToProcess.some(
      (b: any) => b?.type === "sidebar_widget" && (b?.config as any)?.widgetType === "category_list",
    ) || false;

  let catsWithCounts: any[] | null = null;
  if (needsCategoryList) {
    const maxLimit = allBlocksToProcess.reduce((acc: number, b: any) => {
      if (b?.type !== "sidebar_widget") return acc;
      const cfg = (b?.config as any) || {};
      if (cfg.widgetType !== "category_list") return acc;
      const baseLimit = Number(cfg.limit) || 6;
      const tabletLimit = Number(cfg.tabletLimit) || baseLimit;
      const mobileLimit = Number(cfg.mobileLimit) || baseLimit;
      const limit = Math.max(baseLimit, tabletLimit, mobileLimit);
      return Math.max(acc, limit);
    }, 6);

    const [cats, allCategories] = await Promise.all([
      prisma.category.findMany({
        take: maxLimit,
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      prisma.category.findMany({
        select: { id: true, parentId: true },
      }),
    ]);

    const allCategoryIds = allCategories.map((c) => c.id);
    const childrenMap = new Map<string, string[]>();
    for (const c of allCategories) {
      if (!c.parentId) continue;
      const arr = childrenMap.get(c.parentId) || [];
      arr.push(c.id);
      childrenMap.set(c.parentId, arr);
    }

    const postGroups =
      allCategoryIds.length > 0
        ? await prisma.post.groupBy({
            by: ["categoryId"],
            _count: { _all: true },
            where: {
              categoryId: { in: allCategoryIds },
              published: true,
              status: { not: "ARCHIVED" },
              OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
            },
          })
        : [];

    const directCount = new Map<string, number>();
    postGroups.forEach((g: { categoryId: string | null; _count: { _all: number } }) => {
      if (g.categoryId) directCount.set(g.categoryId, g._count._all);
    });

    const memo = new Map<string, number>();
    const sumDesc = (categoryId: string): number => {
      const cached = memo.get(categoryId);
      if (cached !== undefined) return cached;
      let total = directCount.get(categoryId) ?? 0;
      const children = childrenMap.get(categoryId) || [];
      for (const childId of children) {
        total += sumDesc(childId);
      }
      memo.set(categoryId, total);
      return total;
    };

    catsWithCounts = cats.map((c) => ({ ...c, postCount: sumDesc(c.id) }));
  }

  const tagCloudBlocks = allBlocksToProcess.filter(
    (b: any) =>
      b?.type === "tag_cloud" || (b?.type === "sidebar_widget" && (b?.config as any)?.widgetType === "tag_cloud"),
  );

  let tagCloudData: any[] | null = null;
  if (tagCloudBlocks.length > 0) {
    const maxLimit = tagCloudBlocks.reduce((acc: number, b: any) => {
      const cfg = (b?.config as any) || {};
      const baseLimit = Number(cfg.limit) || 6;
      const tabletLimit = Number(cfg.tabletLimit) || baseLimit;
      const mobileLimit = Number(cfg.mobileLimit) || baseLimit;
      const limit = Math.max(baseLimit, tabletLimit, mobileLimit);
      const factor = b?.type === "sidebar_widget" ? 2 : 1;
      return Math.max(acc, limit * factor);
    }, 6);

    tagCloudData = await prisma.tag.findMany({
      take: maxLimit,
      orderBy: { posts: { _count: "desc" } },
      select: { id: true, name: true, slug: true, _count: { select: { posts: true } } },
    });
  }

  const postDataBlocks = allBlocksToProcess.filter((b: any) => {
    if (!b || !b.type) return false;
    if (!blockTypesNeedingData.has(b.type)) return false;
    if (b.type === "tag_cloud") return false;
    if (b.type === "sidebar_widget") {
      const cfg = (b.config as any) || {};
      if (cfg.widgetType === "category_list") return false;
      if (cfg.widgetType === "tag_cloud") return false;
    }
    return true;
  });

  const buildPostQueryKey = (block: any) => {
    const cfg = (block?.config as any) || {};
    const includeTagSlugs = cfg.filterType === "tag" ? getConfigTagIncludeSlugs(cfg) : [];
    const excludeTagSlugs = getConfigTagExcludeSlugs(cfg);
    const includeCategorySlugs = includeTagSlugs.length > 0 ? [] : getConfigCategoryIncludeSlugs(cfg);
    const excludeCategorySlugs = getConfigCategoryExcludeSlugs(cfg);

    const sortOrderRaw = cfg.sortOrder ? String(cfg.sortOrder) : "";
    const sortOrder =
      block.type === "sidebar_widget" && cfg.widgetType === "popular_posts"
        ? "popular"
        : sortOrderRaw || "latest";

    return JSON.stringify({
      tags: includeTagSlugs.slice().sort(),
      excludeTags: excludeTagSlugs.slice().sort(),
      includeCategories: includeCategorySlugs.slice().sort(),
      excludeCategories: excludeCategorySlugs.slice().sort(),
      sortOrder,
    });
  };

  const groups = new Map<
    string,
    { blocks: any[]; maxTakeLimit: number | null; sortOrder: string; whereClause: any; orderBy: any }
  >();

  for (const block of postDataBlocks) {
    const cfg = (block.config as any) || {};

    const baseLimit = Number(cfg.limit) || 6;
    const tabletLimit = Number(cfg.tabletLimit) || baseLimit;
    const mobileLimit = Number(cfg.mobileLimit) || baseLimit;
    const limit = Math.max(baseLimit, tabletLimit, mobileLimit);

    const blockOffset = offsetEnabledTypes.has(block.type) ? Math.max(0, Number(cfg.offset) || 0) : 0;

    const whereClause: any = {
      published: true,
      status: { not: "ARCHIVED" },
      OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
    };

    if (cfg.filterType === "tag") {
      const includeTagSlugs = getConfigTagIncludeSlugs(cfg);
      const excludeTagSlugs = getConfigTagExcludeSlugs(cfg);
      applyTagFiltersToWhere(whereClause, includeTagSlugs, excludeTagSlugs);
      const excludeCategorySlugs = getConfigCategoryExcludeSlugs(cfg);
      applyCategoryFiltersToWhere(whereClause, [], excludeCategorySlugs);
    } else {
      const includeCategorySlugs = getConfigCategoryIncludeSlugs(cfg);
      const excludeCategorySlugs = getConfigCategoryExcludeSlugs(cfg);
      applyCategoryFiltersToWhere(whereClause, includeCategorySlugs, excludeCategorySlugs);
    }

    const sortOrderRaw = cfg.sortOrder ? String(cfg.sortOrder) : "";
    const sortOrder =
      block.type === "sidebar_widget" && cfg.widgetType === "popular_posts"
        ? "popular"
        : sortOrderRaw || "latest";

    let orderBy: any = [{ publishedAt: "desc" }, { updatedAt: "desc" }, { id: "desc" }];
    if (sortOrder === "latest") orderBy = [{ publishedAt: "desc" }, { updatedAt: "desc" }, { id: "desc" }];
    else if (sortOrder === "oldest") orderBy = [{ publishedAt: "asc" }, { updatedAt: "asc" }, { id: "asc" }];
    else if (sortOrder === "popular") orderBy = [{ views: "desc" }, { publishedAt: "desc" }, { updatedAt: "desc" }, { id: "desc" }];
    else if (sortOrder === "random") orderBy = [{ publishedAt: "desc" }, { updatedAt: "desc" }, { id: "desc" }];

    let takeLimit: number | null = limit;
    if (block.type === "news_list" && cfg.paginationStyle && cfg.paginationStyle !== "none") {
      // Initial render only needs the first window; subsequent pages are fetched on demand.
      takeLimit = limit;
    }
    if (blockOffset > 0 && takeLimit !== null) takeLimit += blockOffset;
    if (sortOrder === "random" && takeLimit !== null) takeLimit = Math.max(20 + blockOffset, takeLimit);

    const key = buildPostQueryKey(block);
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, { blocks: [block], maxTakeLimit: takeLimit, sortOrder, whereClause, orderBy });
    } else {
      existing.blocks.push(block);
      existing.maxTakeLimit =
        existing.maxTakeLimit === null || takeLimit === null
          ? null
          : Math.max(existing.maxTakeLimit, takeLimit);
    }
  }

  const postSelect = {
    id: true,
    title: true,
    subtitle: true,
    slug: true,
    excerpt: true,
    image: true,
    publishedAt: true,
    createdAt: true,
    updatedAt: true,
    type: true,
    videoUrl: true,
    category: {
      select: { name: true, slug: true },
    },
    author: { select: { name: true, avatar: true, banner: true } },
    featuredImage: {
      select: {
        id: true,
        fileUrl: true,
        width: true,
        height: true,
      },
    },
    views: true,
  } as const;

  const groupResults = await Promise.all(
    Array.from(groups.entries()).map(async ([key, group]) => {
      const runQuery = async () =>
        prisma.post.findMany({
          where: group.whereClause,
          select: postSelect as any,
          orderBy: group.orderBy,
          ...(group.maxTakeLimit !== null ? { take: group.maxTakeLimit } : {}),
        });

      if (group.maxTakeLimit === null) {
        const posts = await runQuery();
        return { key, posts, sortOrder: group.sortOrder, blocks: group.blocks };
      }

      const cached = unstable_cache(
        runQuery,
        [`homepage:blockData:${activeTheme}:${key}:${group.maxTakeLimit ?? "all"}`],
        { tags: ["homepage", "posts"], revalidate: 120 },
      );

      const posts = toPublicPostPreviewList(await cached());
      return { key, posts, sortOrder: group.sortOrder, blocks: group.blocks };
    }),
  );

  const postsByGroupKey = new Map<string, { posts: any[]; sortOrder: string; blocks: any[] }>();
  for (const r of groupResults) postsByGroupKey.set(r.key, { posts: r.posts, sortOrder: r.sortOrder, blocks: r.blocks });

  for (const block of allBlocksToProcess) {
    try {
      if (!block || !block.type || !blockTypesNeedingData.has(block.type)) continue;

      const cfg = (block.config as any) || {};
      const baseLimit = Number(cfg.limit) || 6;
      const tabletLimit = Number(cfg.tabletLimit) || baseLimit;
      const mobileLimit = Number(cfg.mobileLimit) || baseLimit;
      const limit = Math.max(baseLimit, tabletLimit, mobileLimit);

      if (block.type === "tag_cloud") {
        blockData[block.id] = (tagCloudData || []).slice(0, limit);
        continue;
      }

      if (block.type === "sidebar_widget" && cfg.widgetType === "category_list") {
        blockData[block.id] = (catsWithCounts || []).slice(0, limit);
        continue;
      }

      if (block.type === "sidebar_widget" && cfg.widgetType === "tag_cloud") {
        blockData[block.id] = (tagCloudData || []).slice(0, limit * 2);
        continue;
      }

      const key = buildPostQueryKey(block);
      const group = postsByGroupKey.get(key);
      if (!group) continue;

      const blockOffset = offsetEnabledTypes.has(block.type) ? Math.max(0, Number(cfg.offset) || 0) : 0;
      const sortOrderRaw = cfg.sortOrder ? String(cfg.sortOrder) : "";
      const sortOrder =
        block.type === "sidebar_widget" && cfg.widgetType === "popular_posts"
          ? "popular"
          : sortOrderRaw || "latest";

      let takeLimit: number | null = limit;
      if (block.type === "news_list" && cfg.paginationStyle && cfg.paginationStyle !== "none") {
        takeLimit = null;
      }
      if (blockOffset > 0 && takeLimit !== null) takeLimit += blockOffset;
      if (sortOrder === "random" && takeLimit !== null) takeLimit = Math.max(20 + blockOffset, takeLimit);

      let data = takeLimit === null ? group.posts : group.posts.slice(0, takeLimit);
      if (sortOrder === "random") {
        const shuffled = shuffleSeeded(data, `block:${block.id}`);
        const randomSliceLimit = takeLimit === null ? shuffled.length : (blockOffset > 0 ? Math.max(limit + blockOffset, limit) : limit);
        data = shuffled.slice(0, randomSliceLimit);
      }

      blockData[block.id] = data;
    } catch (error) {
      console.error(`Error building data for block ${block?.id}:`, error);
    }
  }

  return { posts, categories, blocks, setting, blockData, sourceBlocksByLocation, menusByLocation, headerConfig, footerConfig };
}

export default async function HomePage() {
  const data = await getData();
  const activeTheme = data.setting?.activeTheme || "classic";
  const ThemeComponent = await getThemeComponent(activeTheme);

  // @ts-ignore
  return (
    <>
      <TrackPublicPageView pageKey="home:/" path="/" title="Beranda" pageType="home" />
      <ThemeComponent data={data} />
    </>
  );
}
