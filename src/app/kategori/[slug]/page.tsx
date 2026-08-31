
import type { Metadata, ResolvingMetadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { getThemeArchiveComponent } from "@/lib/theme-registry.server";
import { getArchiveBuilderBlocks, getArchivePageSize, isArchiveBuilderTheme } from "@/lib/archive-builder";
import { getBuilderSourceBlocks } from "@/lib/page-builder-source-blocks";
import { getPublicMenusByLocation } from "@/lib/public-menus";
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
} from "@/lib/category-filters";
import { buildCanonicalPath, buildPublicPageMetadata } from "@/lib/public-metadata";

export const revalidate = 60;

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

const getAllCategoryEdges = cache(async () => {
  const cached = unstable_cache(
    async () => {
      return await prisma.category.findMany({ select: { id: true, parentId: true } });
    },
    ["categories:edges"],
    { tags: ["categories"], revalidate: 3600 },
  );
  return cached();
});

const getCategoryBySlug = cache(async (slug: string) => {
  const cached = unstable_cache(
    async () => {
      return await prisma.category.findUnique({
        where: { slug },
        select: { id: true, name: true, slug: true, parentId: true },
      });
    },
    [`category:${slug}`],
    { tags: ["categories"], revalidate: 3600 },
  );
  return cached();
});

const getDescendantCategoryIds = cache(async (rootId: string) => {
  const edges = await getAllCategoryEdges();
  const childrenMap = new Map<string, string[]>();
  edges.forEach((c: { id: string; parentId: string | null }) => {
    if (!c.parentId) return;
    const arr = childrenMap.get(c.parentId) || [];
    arr.push(c.id);
    childrenMap.set(c.parentId, arr);
  });

  const categoryIds: string[] = [];
  const stack = [rootId];
  while (stack.length > 0) {
    const id = stack.pop()!;
    categoryIds.push(id);
    const children = childrenMap.get(id) || [];
    for (const childId of children) stack.push(childId);
  }
  return categoryIds;
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
  contextCategorySlugs?: string[];
}) => {
  const fetchAll = opts.limit === null || opts.limit === undefined || !Number.isFinite(opts.limit);
  const limit = fetchAll ? null : Math.max(1, Math.floor(opts.limit as number));
  const sort = typeof opts.sort === "string" ? opts.sort : "latest";
  const tagSlugs = Array.isArray(opts.tagSlugs) ? opts.tagSlugs.filter(Boolean) : [];
  const excludeTagSlugs = Array.isArray(opts.excludeTagSlugs) ? opts.excludeTagSlugs.filter(Boolean) : [];
  const categorySlugs = Array.isArray(opts.categorySlugs) ? opts.categorySlugs.filter(Boolean) : [];
  const excludeCategorySlugs = Array.isArray(opts.excludeCategorySlugs) ? opts.excludeCategorySlugs.filter(Boolean) : [];
  const contextCategorySlugs = Array.isArray(opts.contextCategorySlugs) ? opts.contextCategorySlugs.filter(Boolean) : [];
  const key = `archive-widget-posts:${fetchAll ? "all" : limit}:${sort}:${tagSlugs.slice().sort().join(",")}:${excludeTagSlugs.slice().sort().join(",")}:${categorySlugs.slice().sort().join(",")}:${excludeCategorySlugs.slice().sort().join(",")}:${contextCategorySlugs.slice().sort().join(",")}`;

  const runQuery = async () => {
    const now = new Date();
    const whereClause: any = {
      published: true,
      status: { not: "ARCHIVED" },
      OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
    };

    if (contextCategorySlugs.length > 0) {
      applyCategoryFiltersToWhere(whereClause, contextCategorySlugs, []);
    }

    if (tagSlugs.length > 0 || excludeTagSlugs.length > 0) {
      applyTagFiltersToWhere(whereClause, tagSlugs, excludeTagSlugs);
      if (categorySlugs.length > 0 || excludeCategorySlugs.length > 0) {
        applyCategoryFiltersToWhere(whereClause, categorySlugs, excludeCategorySlugs);
      } else if (excludeCategorySlugs.length > 0) {
        applyCategoryFiltersToWhere(whereClause, [], excludeCategorySlugs);
      }
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

const applyArchiveDisplayCategory = <T extends Record<string, any>>(
  posts: T[],
  archiveCategory: { name: string; slug: string },
) => {
  return posts.map((post) => ({
    ...post,
    archiveDisplayCategory: {
      name: archiveCategory.name,
      slug: archiveCategory.slug,
    },
  }));
};

async function getData(slug: string, page: number) {
  const [category, setting] = await Promise.all([getCategoryBySlug(slug), getSettings()]);

  if (!category) return null;

  const categoryIds = await getDescendantCategoryIds(category.id);
  const archiveCategoryRows = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { slug: true },
  });
  const archiveCategorySlugs = archiveCategoryRows
    .map((row) => (typeof row.slug === "string" ? row.slug.trim() : ""))
    .filter(Boolean);
  const activeTheme = (setting as any)?.activeTheme || "classic";
  const [{ headerConfig, footerConfig }, archiveBlocks, sourceBlocksByLocation, categories] = await Promise.all([
    getHeaderFooterBlocks(activeTheme),
    isArchiveBuilderTheme(activeTheme) ? getArchiveBuilderBlocks(activeTheme) : Promise.resolve(undefined),
    getBuilderSourceBlocks(activeTheme),
    getCachedCategoriesList(10),
  ]);

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

  const pageSize = getArchivePageSize(effectiveBlocks || [], 12);
  const now = new Date();
  const where = {
    AND: [
      {
        OR: [
          { categoryId: { in: categoryIds } },
          { postCategories: { some: { categoryId: { in: categoryIds } } } },
        ],
      },
      {
        published: true,
        status: { not: "ARCHIVED" as const },
        OR: [
          { publishedAt: { lte: now } },
          { publishedAt: null }
        ]
      }
    ]
  };
  const safePage = Math.max(1, page);
  const cachedCategoryArchive = unstable_cache(
    async () => {
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
    [`category-archive:${category.id}:${pageSize}:${safePage}`],
    { tags: ["posts", `category-${category.slug}`], revalidate },
  );

  const { posts, totalPosts, totalPages, currentPage } = await cachedCategoryArchive();
  const normalizedPosts = applyArchiveDisplayCategory(
    toPublicPostPreviewList(posts),
    { name: category.name, slug: category.slug },
  );

  // Fetch blockData (Popular Posts, Tag Cloud, etc)
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
      const archiveScopedWidgetTypes = new Set([
        "classic_hero",
        "headline_2",
        "news_grid",
        "news_list",
        "news_list_highlight",
        "news_bullet_list",
        "news_grid_slider",
        "news_headline_big",
        "news_hero_slider",
        "news_hero_split_4",
        "hero",
        "news_slider",
      ]);
      
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
          blockData[widget.id] = applyArchiveDisplayCategory(await getWidgetPosts({
            limit: takeLimit,
            sort,
            tagSlugs,
            excludeTagSlugs,
            categorySlugs,
            excludeCategorySlugs,
            contextCategorySlugs: archiveScopedWidgetTypes.has(widget.type) ? archiveCategorySlugs : [],
          }), { name: category.name, slug: category.slug });
      }
  };

  const widgets = collectWidgetsRecursive(effectiveBlocks);
  const uniqueWidgets = Array.from(new Map(widgets.map(w => [w.id, w])).values());

  await Promise.all(uniqueWidgets.map((widget) => processWidgetData(widget)));

  return {
    category,
    posts: normalizedPosts,
    setting,
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
  props: { params: Promise<{ slug: string }>; searchParams?: Promise<{ page?: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const slug = decodeURIComponent(params.slug);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Kategori Tidak Ditemukan",
    };
  }

  const page = Math.max(1, Number(searchParams?.page) || 1);
  const parentMetadata = await parent;
  const canonicalPath = buildCanonicalPath(`/kategori/${category.slug}`, {
    page: page > 1 ? page : undefined,
  });

  return buildPublicPageMetadata({
    title: category.name,
    description: `Arsip berita kategori ${category.name}.`,
    canonicalPath,
    parentMetadataBase: parentMetadata.metadataBase,
  });
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }>, searchParams?: Promise<{ page?: string }> }) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const slug = decodeURIComponent(params.slug);
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const [data, menusByLocation] = await Promise.all([getData(slug, page), getPublicMenusByLocation()]);

  if (!data) {
    notFound();
  }

  const activeTheme = (data.setting as any)?.activeTheme || "classic";
  const ArchiveComponent: any = await getThemeArchiveComponent(activeTheme);
  const trackingPath = buildCanonicalPath(`/kategori/${data.category.slug}`, {
    page: data.currentPage > 1 ? data.currentPage : undefined,
  });
  const trackingKey = `category:${data.category.slug}:page:${data.currentPage}`;

  return (
    <>
      <TrackPublicPageView
        pageKey={trackingKey}
        path={trackingPath}
        title={`Kategori: ${data.category.name}`}
        pageType="category"
      />
      <ArchiveComponent 
        title={data.category.name} 
        description={`Arsip berita kategori ${data.category.name}`}
        posts={data.posts}
        setting={data.setting}
        categories={data.categories}
        blocks={data.archiveBlocks}
        archiveType="category"
        currentPage={data.currentPage}
        totalPages={data.totalPages}
        totalPosts={data.totalPosts}
        archiveBasePath={`/kategori/${data.category.slug}`}
        sourceBlocksByLocation={data.sourceBlocksByLocation}
        blockData={data.blockData}
        menusByLocation={menusByLocation}
        headerConfig={data.headerConfig}
        footerConfig={data.footerConfig}
      />
    </>
  );
}
