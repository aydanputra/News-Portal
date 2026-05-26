import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getPublicMenusByLocation } from "@/lib/public-menus";
import ClassicArchive from "@/themes/classic/templates/Archive";
import PranalaArchive from "@/themes/pranala/templates/Archive";
import { getArchiveBuilderBlocks, getArchivePageSize, isArchiveBuilderTheme } from "@/lib/archive-builder";
import { getBuilderSourceBlocks } from "@/lib/page-builder-source-blocks";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { resolveSectionChildrenWithSidebarSource } from "@/lib/sidebar-reference";
import { getCachedCategoriesList } from "@/lib/data";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const getHeaderFooterBlocks = cache(async (activeTheme: string) => {
  const cached = unstable_cache(
    async () => {
      const [headerRows, footerRows] = await Promise.all([
        prisma.homepageBlock.findMany({
          where: { location: "header", isActive: true, themeId: activeTheme as any },
          orderBy: { order: "asc" },
        }),
        prisma.homepageBlock.findMany({
          where: { location: "footer", themeId: activeTheme as any },
          orderBy: { order: "asc" },
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

const getCategoryIdBySlug = cache(async (slug: string) => {
  const cached = unstable_cache(
    async () => {
      const row = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
      return row?.id || null;
    },
    [`category-id:${slug}`],
    { tags: ["categories"], revalidate: 3600 },
  );
  return cached();
});

const getWidgetPosts = cache(async (opts: { limit: number; sort?: string; tagSlug?: string; categorySlug?: string }) => {
  const limit = Math.max(1, Math.min(30, Number.isFinite(opts.limit) ? Math.floor(opts.limit) : 5));
  const sort = typeof opts.sort === "string" ? opts.sort : "latest";
  const tagSlug = typeof opts.tagSlug === "string" ? opts.tagSlug.trim() : "";
  const categorySlug = typeof opts.categorySlug === "string" ? opts.categorySlug.trim() : "";
  const key = `archive-widget-posts:${limit}:${sort}:${tagSlug}:${categorySlug}`;

  const cached = unstable_cache(
    async () => {
      const now = new Date();
      const whereClause: any = {
        published: true,
        status: { not: "ARCHIVED" },
        OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
      };

      if (tagSlug) {
        const tag = await prisma.tag.findUnique({ where: { slug: tagSlug }, select: { id: true } });
        if (!tag) return [];
        whereClause.tags = { some: { id: tag.id } };
      } else if (categorySlug && categorySlug !== "all") {
        const categoryId = await getCategoryIdBySlug(categorySlug);
        if (!categoryId) return [];
        whereClause.AND = [
          ...(Array.isArray(whereClause.AND) ? whereClause.AND : []),
          {
            OR: [{ categoryId }, { postCategories: { some: { categoryId } } }],
          },
        ];
      }

      let orderBy: any = { publishedAt: "desc" };
      if (sort === "oldest") orderBy = { publishedAt: "asc" };
      else if (sort === "popular") orderBy = { views: "desc" };

      return await prisma.post.findMany({
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
        take: limit,
      });
    },
    [key],
    { tags: ["posts"], revalidate: 300 },
  );

  return cached();
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
          category: true,
          author: { select: { name: true } },
          featuredImage: true,
          tags: { select: { name: true, slug: true } },
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

    if (["news_grid", "news_list", "sidebar_widget", "tag_cloud"].includes(widget.type)) {
      const baseLimit = Number(config.limit || config.count) || 5;
      const limit = baseLimit;

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
      const tagSlug = config.filterType === "tag" && config.tagSlug ? String(config.tagSlug) : "";
      const categorySlug = !tagSlug && config.categorySlug ? String(config.categorySlug) : "";
      blockData[widget.id] = await getWidgetPosts({ limit, sort, tagSlug, categorySlug });
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
    posts,
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
  const ArchiveComponent: any = data.activeTheme === "pranala" ? PranalaArchive : ClassicArchive;

  const title = "Pencarian";
  const description = query ? `Hasil pencarian untuk "${query}"` : "Masukkan kata kunci untuk mencari artikel.";
  const basePath = query ? `/search?q=${encodeURIComponent(query)}` : "/search";

  return (
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
  );
}
