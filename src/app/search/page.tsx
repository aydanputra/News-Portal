import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getPublicMenusByLocation } from "@/lib/public-menus";
import ClassicArchive from "@/themes/classic/templates/Archive";
import PranalaArchive from "@/themes/pranala/templates/Archive";
import { getArchiveBuilderBlocks, getArchivePageSize, isArchiveBuilderTheme } from "@/lib/archive-builder";
import { getBuilderSourceBlocks } from "@/lib/page-builder-source-blocks";

export const revalidate = 0;
export const dynamic = "force-dynamic";

async function getData(query: string, page: number) {
  const setting = await getSettings();
  const activeTheme = (setting as any)?.activeTheme || "classic";
  const headerRows = await prisma.homepageBlock.findMany({
    where: { location: "header", isActive: true, themeId: activeTheme as any },
    orderBy: { order: "asc" },
  });
  const headerConfig = headerRows ?? null;
  const footerRows = await prisma.homepageBlock.findMany({
    where: { location: "footer", themeId: activeTheme as any },
    orderBy: { order: "asc" },
  });
  const footerConfig = footerRows ?? null;
  const archiveBlocks = isArchiveBuilderTheme(activeTheme) ? await getArchiveBuilderBlocks(activeTheme) : undefined;
  const sourceBlocksByLocation = await getBuilderSourceBlocks(activeTheme);
  const pageSize = isArchiveBuilderTheme(activeTheme) ? getArchivePageSize(archiveBlocks || [], 12) : 30;

  const now = new Date();
  const normalizedQuery = query.trim();
  const where =
    normalizedQuery.length === 0
      ? {
          id: "__never__",
        }
      : {
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

  const totalPosts = normalizedQuery.length === 0 ? 0 : await prisma.post.count({ where });
  const safePage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  const currentPage = Math.min(safePage, totalPages);
  const posts =
    normalizedQuery.length === 0
      ? []
      : await prisma.post.findMany({
          where,
          include: {
            category: true,
            author: { select: { name: true } },
            featuredImage: true,
            tags: { select: { name: true, slug: true } },
          },
          orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
        });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    take: 10,
  });

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
    const now = new Date();

    if (["news_grid", "news_list", "sidebar_widget", "tag_cloud"].includes(widget.type)) {
      const baseLimit = Number(config.limit || config.count) || 5;
      const limit = baseLimit;

      if (widget.type === "tag_cloud" || (widget.type === "sidebar_widget" && config.widgetType === "tag_cloud")) {
        blockData[widget.id] = await prisma.tag.findMany({
          take: limit * 2,
          orderBy: { posts: { _count: "desc" } },
          select: { id: true, name: true, slug: true, _count: { select: { posts: true } } },
        });
        return;
      }

      if (widget.type === "sidebar_widget" && config.widgetType === "category_list") {
        return;
      }

      const whereClause: any = {
        published: true,
        status: { not: "ARCHIVED" },
        OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
      };

      if (config.filterType === "tag" && config.tagSlug) {
        whereClause.tags = { some: { slug: config.tagSlug } };
      } else if (config.categorySlug && config.categorySlug !== "all") {
        whereClause.AND = [
          ...(Array.isArray(whereClause.AND) ? whereClause.AND : []),
          {
            OR: [
              { category: { slug: config.categorySlug } },
              { postCategories: { some: { category: { slug: config.categorySlug } } } },
            ],
          },
        ];
      }

      let orderBy: any = { publishedAt: "desc" };
      if (config.sortOrder) {
        switch (config.sortOrder) {
          case "latest":
            orderBy = { publishedAt: "desc" };
            break;
          case "oldest":
            orderBy = { publishedAt: "asc" };
            break;
          case "popular":
            orderBy = { views: "desc" };
            break;
          default:
            orderBy = { publishedAt: "desc" };
        }
      } else if (widget.type === "sidebar_widget" && config.widgetType === "popular_posts") {
        orderBy = { views: "desc" };
      }

      const blockPosts = await prisma.post.findMany({
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

      blockData[widget.id] = blockPosts;
    }
  };

  const allRelevantBlocks = [
    ...(archiveBlocks || []),
    ...(sourceBlocksByLocation.home || []),
    ...(sourceBlocksByLocation.post || []),
    ...(sourceBlocksByLocation.archive || []),
  ];

  const widgets = collectWidgetsRecursive(allRelevantBlocks);
  const uniqueWidgets = Array.from(new Map(widgets.map((w) => [w.id, w])).values());

  for (const widget of uniqueWidgets) {
    await processWidgetData(widget);
  }

  return {
    posts,
    setting,
    activeTheme,
    headerConfig,
    footerConfig,
    categories,
    archiveBlocks,
    blockData,
    totalPosts,
    totalPages,
    currentPage,
    sourceBlocksByLocation: {
      ...sourceBlocksByLocation,
      archive: archiveBlocks || sourceBlocksByLocation.archive || [],
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
