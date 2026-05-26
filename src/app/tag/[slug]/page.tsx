import { prisma } from "@/lib/prisma";
import ClassicArchive from "@/themes/classic/templates/Archive";
import PranalaArchive from "@/themes/pranala/templates/Archive";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { getArchiveBuilderBlocks, getArchivePageSize, isArchiveBuilderTheme } from "@/lib/archive-builder";
import { getBuilderSourceBlocks } from "@/lib/page-builder-source-blocks";
import { getPublicMenusByLocation } from "@/lib/public-menus";

export const revalidate = 60;

async function getData(slug: string, page: number) {
  // 1. Ambil Tag
  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) return null;

  // 2. Ambil Post dengan Tag ini
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
  const pageSize = getArchivePageSize(archiveBlocks || [], 12);
  const now = new Date();
  const where = {
    tags: { some: { id: tag.id } },
    published: true,
    OR: [
      { publishedAt: { lte: now } },
      { publishedAt: null }
    ]
  };
  const totalPosts = await prisma.post.count({ where });
  const safePage = Math.max(1, page);
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));
  const currentPage = Math.min(safePage, totalPages);
  const posts = await prisma.post.findMany({
    where,
    include: {
      category: true,
      author: { select: { name: true } },
      featuredImage: true,
      tags: { select: { name: true, slug: true } },
    },
    orderBy: [
      { publishedAt: "desc" },
      { updatedAt: "desc" }
    ],
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    take: 10
  });

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
      const now = new Date();
      
      if (["news_grid", "news_list", "sidebar_widget", "tag_cloud"].includes(widget.type)) {
          const baseLimit = Number(config.limit || config.count) || 5;
          const limit = baseLimit;

          if (widget.type === "tag_cloud" || (widget.type === "sidebar_widget" && config.widgetType === "tag_cloud")) {
              blockData[widget.id] = await prisma.tag.findMany({ 
                  take: limit * 2, 
                  orderBy: { posts: { _count: 'desc' } },
                  select: { id: true, name: true, slug: true, _count: { select: { posts: true } } }
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
                  case "latest": orderBy = { publishedAt: "desc" }; break;
                  case "oldest": orderBy = { publishedAt: "asc" }; break;
                  case "popular": orderBy = { views: "desc" }; break;
                  default: orderBy = { publishedAt: "desc" };
              }
          } else if (widget.type === "sidebar_widget" && config.widgetType === "popular_posts") {
              orderBy = { views: "desc" };
          }

          const blockPosts = await prisma.post.findMany({
              where: whereClause,
              select: {
                  id: true, title: true, slug: true, excerpt: true, image: true,
                  publishedAt: true, createdAt: true, views: true,
                  category: { select: { name: true, slug: true } },
                  author: { select: { name: true, avatar: true } },
                  featuredImage: { select: { id: true, fileUrl: true, width: true, height: true } }
              },
              orderBy: orderBy,
              take: limit,
          });

          blockData[widget.id] = blockPosts;
      }
  };

  const allRelevantBlocks = [
      ...(archiveBlocks || []),
      ...(sourceBlocksByLocation.home || []),
      ...(sourceBlocksByLocation.post || []),
      ...(sourceBlocksByLocation.archive || [])
  ];

  const widgets = collectWidgetsRecursive(allRelevantBlocks);
  const uniqueWidgets = Array.from(new Map(widgets.map(w => [w.id, w])).values());

  for (const widget of uniqueWidgets) {
      await processWidgetData(widget);
  }

  return {
    tag,
    posts,
    setting,
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

export default async function TagPage(props: { params: Promise<{ slug: string }>, searchParams?: Promise<{ page?: string }> }) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const slug = decodeURIComponent(params.slug);
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const data = await getData(slug, page);
  const menusByLocation = await getPublicMenusByLocation();

  if (!data) {
    notFound();
  }

  const activeTheme = (data.setting as any)?.activeTheme || "classic";
  const ArchiveComponent: any = activeTheme === "pranala" ? PranalaArchive : ClassicArchive;

  return (
    <ArchiveComponent
      title={`Tag: #${data.tag.name}`}
      description={`Arsip berita dengan topik #${data.tag.name}`}
      posts={data.posts}
      setting={data.setting}
      categories={data.categories}
      blocks={data.archiveBlocks}
      archiveType="tag"
      currentPage={data.currentPage}
      totalPages={data.totalPages}
      totalPosts={data.totalPosts}
      archiveBasePath={`/tag/${data.tag.slug}`}
      sourceBlocksByLocation={data.sourceBlocksByLocation}
      blockData={data.blockData}
      menusByLocation={menusByLocation}
      headerConfig={data.headerConfig}
      footerConfig={data.footerConfig}
    />
  );
}
