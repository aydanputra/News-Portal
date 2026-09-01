import type { Metadata, ResolvingMetadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getPublicMenusByLocation } from "@/lib/public-menus";
import { getThemeArchiveComponent } from "@/lib/theme-registry.server";
import { getArchiveBuilderBlocks, getArchivePageSize, isArchiveBuilderTheme } from "@/lib/archive-builder";
import { getBuilderSourceBlocks } from "@/lib/page-builder-source-blocks";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { resolveSectionChildrenWithSidebarSource } from "@/lib/sidebar-reference";
import { getCachedCategoriesList } from "@/lib/data";
import { toPublicPostPreviewList } from "@/lib/post-preview";
import TrackPublicPageView from "@/components/TrackPublicPageView";
import {
  applyCategoryFiltersToWhere,
  applyTagFiltersToWhere,
  getConfigCategoryExcludeSlugs,
  getConfigCategoryIncludeSlugs,
  getConfigTagExcludeSlugs,
  getConfigTagIncludeSlugs,
  getDateRangeStart,
} from "@/lib/category-filters";
import { buildCanonicalPath, buildPublicPageMetadata } from "@/lib/public-metadata";

export const revalidate = 30;

const getHeaderFooterBlocks = cache(async (activeTheme: string) => {
  const cached = unstable_cache(
    async () => {
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
      return { headerConfig: headerRows ?? null, footerConfig: footerRows ?? null };
    },
    [`header-footer:${activeTheme}`],
    { tags: ["homepage"], revalidate: 300 },
  );
  return cached();
});

const getTagCloud = cache(async (take: number) => {
  const safeTake = Math.max(1, Math.min(100, Number.isFinite(take) ? Math.floor(take) : 20));
  const cached = unstable_cache(
    async () => {
      return await prisma.tag.findMany({
        take: safeTake,
        orderBy: { posts: { _count: "desc" } },
        select: { id: true, name: true, slug: true, _count: { select: { posts: true } } },
      });
    },
    [`tag-cloud:${safeTake}`],
    { tags: ["posts"], revalidate: 3600 },
  );
  return cached();
});

const getWidgetPosts = cache(async (opts: {
  limit?: number | null;
  sort?: string;
  tagSlugs?: string[];
  excludeTagSlugs?: string[];
  categorySlugs?: string[];
  excludeCategorySlugs?: string[];
  popularDateRange?: string;
}) => {
  const fetchAll = opts.limit === null || opts.limit === undefined || !Number.isFinite(opts.limit);
  const limit = fetchAll ? null : Math.max(1, Math.floor(opts.limit as number));
  const sort = typeof opts.sort === "string" ? opts.sort : "latest";
  const tagSlugs = Array.isArray(opts.tagSlugs) ? opts.tagSlugs.filter(Boolean) : [];
  const excludeTagSlugs = Array.isArray(opts.excludeTagSlugs) ? opts.excludeTagSlugs.filter(Boolean) : [];
  const categorySlugs = Array.isArray(opts.categorySlugs) ? opts.categorySlugs.filter(Boolean) : [];
  const excludeCategorySlugs = Array.isArray(opts.excludeCategorySlugs) ? opts.excludeCategorySlugs.filter(Boolean) : [];
  const popularDateRange = typeof opts.popularDateRange === "string" ? opts.popularDateRange : "all";
  const key = `archive-widget-posts:${fetchAll ? "all" : limit}:${sort}:${tagSlugs.slice().sort().join(",")}:${excludeTagSlugs.slice().sort().join(",")}:${categorySlugs.slice().sort().join(",")}:${excludeCategorySlugs.slice().sort().join(",")}:${popularDateRange}`;

  const runQuery = async () => {
    const now = new Date();
    const rangeStart = getDateRangeStart(popularDateRange);
    const whereClause: any = {
      published: true,
      status: { not: "ARCHIVED" },
    };
    if (rangeStart) {
      whereClause.publishedAt = { gte: rangeStart, lte: now };
    } else {
      whereClause.OR = [{ publishedAt: { lte: now } }, { publishedAt: null }];
    }

    if (tagSlugs.length > 0 || excludeTagSlugs.length > 0) {
      applyTagFiltersToWhere(whereClause, tagSlugs, excludeTagSlugs);
      applyCategoryFiltersToWhere(whereClause, [], excludeCategorySlugs);
    } else {
      applyCategoryFiltersToWhere(whereClause, categorySlugs, excludeCategorySlugs);
    }

    let orderBy: any = { publishedAt: "desc" };
    if (sort === "oldest") orderBy = { publishedAt: "asc" };
    else if (sort === "popular") orderBy = { views: "desc" };

    return prisma.post.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        image: true,
        publishedAt: true,
        createdAt: true,
        views: true,
        category: { select: { name: true, slug: true } },
        author: { select: { name: true, avatar: true } },
        featuredImage: { select: { id: true, fileUrl: true, width: true, height: true } },
      },
      orderBy,
      ...(limit !== null ? { take: limit } : {}),
    });
  };

  if (fetchAll) {
    return toPublicPostPreviewList(await runQuery());
  }

  const cached = unstable_cache(
    runQuery,
    [key],
    { tags: ["posts"], revalidate: 300 },
  );

  return toPublicPostPreviewList(await cached());
});

async function getData(query: string, page: number) {
  const setting = await getSettings();
  const activeTheme = (setting as any)?.activeTheme || "classic";
  const [{ headerConfig, footerConfig }, archiveBlocks, sourceBlocksByLocation, categories] = await Promise.all([
    getHeaderFooterBlocks(activeTheme),
    isArchiveBuilderTheme(activeTheme) ? getArchiveBuilderBlocks(activeTheme) : Promise.resolve(undefined),
    getBuilderSourceBlocks(activeTheme),
    getCachedCategoriesList(10),
  ]);
  const pageSize = isArchiveBuilderTheme(activeTheme) ? getArchivePageSize(archiveBlocks || [], 12) : 30;

  const normalizedQuery = query.trim();
  const safePage = Math.max(1, page);
  const cachedSearch = unstable_cache(
    async () => {
      if (normalizedQuery.length === 0) {
        return { posts: [], totalPosts: 0, totalPages: 1, currentPage: 1 };
      }

      const now = new Date();
      const where: any = {
        published: true,
        status: { not: "ARCHIVED" as const },
        OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
        AND: [
          {
            OR: [
              { title: { contains: normalizedQuery, mode: "insensitive" as const } },
              { excerpt: { contains: normalizedQuery, mode: "insensitive" as const } },
            ],
          },
        ],
      };

      const totalPosts = await prisma.post.count({ where });
      const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
      const currentPage = Math.min(safePage, totalPages);
      const posts = await prisma.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          image: true,
          publishedAt: true,
          createdAt: true,
          views: true,
          type: true,
          videoUrl: true,
          category: { select: { name: true, slug: true } },
          author: { select: { name: true } },
          featuredImage: { select: { id: true, fileUrl: true, width: true, height: true } },
        },
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      });
      return { posts, totalPosts, totalPages, currentPage };
    },
    [`search:${normalizedQuery}:${pageSize}:${safePage}`],
    { tags: ["posts"], revalidate: 30 },
  );

  const { posts, totalPosts, totalPages, currentPage } = await cachedSearch();
  const normalizedPosts = toPublicPostPreviewList(posts);

  const blockData: Record<string, any[]> = {};

  const collectWidgetsRecursive = (blocks: any[]): any[] => {
    const result: any[] = [];
    for (const block of blocks) {
      if (!block || block.isActive === false || block.isVisible === false) continue;
      if (block.type === "section") {
        const config = (block.config as Record<string, any>) || {};
        const children = Array.isArray(config.children) ? config.children : [];
        result.push(...collectWidgetsRecursive(children));
        continue;
      }
      result.push(block);
    }
    return result;
  };

  const processWidgetData = async (widget: any) => {
    const config = (widget.config as Record<string, any>) || {};

    if (["classic_hero", "headline_2", "news_grid", "news_list", "news_list_highlight", "news_bullet_list", "news_grid_slider", "news_headline_big", "news_hero_slider", "news_hero_split_4", "hero", "news_slider", "sidebar_widget", "tag_cloud"].includes(widget.type)) {
      const baseLimit = Number(config.limit || config.count) || 5;
      const tabletLimit = Number(config.tabletLimit) || baseLimit;
      const mobileLimit = Number(config.mobileLimit) || baseLimit;
      const limit = Math.max(baseLimit, tabletLimit, mobileLimit);
      const blockOffset =
        ["news_grid", "news_list", "news_list_highlight", "news_bullet_list", "news_grid_slider", "news_hero_slider", "news_hero_split_4"].includes(widget.type)
          ? Math.max(0, Number(config.offset) || 0)
          : 0;
      const paginationStyle = typeof config.paginationStyle === "string" ? config.paginationStyle : "none";
      let takeLimit: number | null = limit;

      if (widget.type === "tag_cloud" || (widget.type === "sidebar_widget" && config.widgetType === "tag_cloud")) {
        blockData[widget.id] = await getTagCloud(limit * 2);
        return;
      }

      if (widget.type === "sidebar_widget" && config.widgetType === "category_list") {
        return;
      }

      const sortOrderRaw = typeof config.sortOrder === "string" ? config.sortOrder : "";
      const sort =
        sortOrderRaw ||
        (widget.type === "sidebar_widget" && config.widgetType === "popular_posts" ? "popular" : "latest");
      if ((widget.type === "news_list" || widget.type === "news_list_highlight") && paginationStyle !== "none") {
        takeLimit = limit;
      }
      if (blockOffset > 0 && takeLimit !== null) takeLimit += blockOffset;
      if (sort === "random" && takeLimit !== null) takeLimit = Math.max(20 + blockOffset, takeLimit);
      const tagSlugs = config.filterType === "tag" ? getConfigTagIncludeSlugs(config) : [];
      const excludeTagSlugs = getConfigTagExcludeSlugs(config);
      const categorySlugs = tagSlugs.length > 0 ? [] : getConfigCategoryIncludeSlugs(config);
      const excludeCategorySlugs = getConfigCategoryExcludeSlugs(config);
      blockData[widget.id] = await getWidgetPosts({ limit: takeLimit, sort, tagSlugs, excludeTagSlugs, categorySlugs, excludeCategorySlugs, popularDateRange: widget.type === "sidebar_widget" && config.widgetType === "popular_posts" ? config.popularDateRange : undefined });
    }
  };

  const blocksToRender = archiveBlocks || sourceBlocksByLocation.archive || [];
  const effectiveBlocks = (blocksToRender || []).map((block: any) => {
    if (block?.type !== "section") return block;
    const resolvedChildren = resolveSectionChildrenWithSidebarSource(block, sourceBlocksByLocation, "archive");
    const blockConfig = block?.config && typeof block.config === "object" ? block.config : {};
    return {
      ...block,
      config: {
        ...blockConfig,
        children: resolvedChildren,
      },
    };
  });

  const widgets = collectWidgetsRecursive(effectiveBlocks);
  const uniqueWidgets = Array.from(new Map(widgets.map((w) => [w.id, w])).values());

  await Promise.all(uniqueWidgets.map((widget) => processWidgetData(widget)));

  return {
    posts: normalizedPosts,
    setting,
    activeTheme,
    headerConfig,
    footerConfig,
    categories,
    archiveBlocks: blocksToRender,
    blockData,
    totalPosts,
    totalPages,
    currentPage,
    sourceBlocksByLocation: {
      ...sourceBlocksByLocation,
      archive: blocksToRender || sourceBlocksByLocation.archive || [],
    },
  };
}

export async function generateMetadata(
  props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolvedSearchParams = await props.searchParams;
  const qRaw = resolvedSearchParams.q;
  const q = Array.isArray(qRaw) ? qRaw[0] : qRaw;
  const pageRaw = resolvedSearchParams.page;
  const pageValue = Array.isArray(pageRaw) ? pageRaw[0] : pageRaw;
  const page = Math.max(1, Number(pageValue) || 1);
  const query = (q || "").trim();
  const parentMetadata = await parent;
  const title = query ? `Pencarian: ${query}` : "Pencarian";
  const description = query ? `Hasil pencarian untuk "${query}" di portal berita.` : "Masukkan kata kunci untuk mencari artikel.";
  const canonicalPath = buildCanonicalPath("/search", {
    q: query || undefined,
    page: page > 1 ? page : undefined,
  });

  return buildPublicPageMetadata({
    title,
    description,
    canonicalPath,
    parentMetadataBase: parentMetadata.metadataBase,
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const qRaw = resolvedSearchParams.q;
  const q = Array.isArray(qRaw) ? qRaw[0] : qRaw;
  const pageRaw = resolvedSearchParams.page;
  const pageValue = Array.isArray(pageRaw) ? pageRaw[0] : pageRaw;
  const page = Math.max(1, Number(pageValue) || 1);
  const query = (q || "").trim();

  const [data, menusByLocation] = await Promise.all([getData(query, page), getPublicMenusByLocation()]);
  const ArchiveComponent: any = await getThemeArchiveComponent(data.activeTheme);

  const title = "Pencarian";
  const description = query ? `Hasil pencarian untuk "${query}"` : "Masukkan kata kunci untuk mencari artikel.";
  const basePath = buildCanonicalPath("/search", { q: query || undefined });
  const trackingPath = buildCanonicalPath("/search", {
    q: query || undefined,
    page: page > 1 ? page : undefined,
  });
  const trackingKey = query ? `search:${query.toLowerCase()}:page:${page}` : `search:default:page:${page}`;

  return (
    <>
      <TrackPublicPageView
        pageKey={trackingKey}
        path={trackingPath}
        title={query ? `Pencarian: ${query}` : "Pencarian"}
        pageType="search"
      />
      <ArchiveComponent
        title={title}
        description={description}
        posts={data.posts}
        setting={data.setting}
        categories={data.categories}
        blocks={data.archiveBlocks}
        archiveType="search"
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        totalPosts={data.totalPosts}
        archiveBasePath={basePath}
        sourceBlocksByLocation={data.sourceBlocksByLocation}
        blockData={data.blockData}
        menusByLocation={menusByLocation}
        headerConfig={data.headerConfig}
        footerConfig={data.footerConfig}
      />
    </>
  );
}
