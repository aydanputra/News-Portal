import { prisma } from "@/lib/prisma";
import { getBuilderSourceBlocks } from "@/lib/page-builder-source-blocks";
import { extractFirstSidebarChildren, resolveSectionChildrenWithSidebarSource } from "@/lib/sidebar-reference";
import { getThemeDefaultPostBlocks } from "@/lib/post-builder-theme-registry";
import { collectWidgetsRecursive, getOrder, hasId } from "@/lib/block-utils";

const POST_CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  image: true,
  type: true,
  videoUrl: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  category: { select: { id: true, name: true, slug: true } },
  author: { select: { name: true, avatar: true, banner: true } },
  featuredImage: { select: { id: true, fileUrl: true, width: true, height: true } },
} as const;

async function getPopularPosts(count: number) {
  const take = Math.max(1, Math.min(20, Number.isFinite(count) ? Math.floor(count) : 5));
  const now = new Date();
  return prisma.post.findMany({
    where: {
      published: true,
      status: { not: "ARCHIVED" },
      OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
    },
    orderBy: [
      { views: "desc" },
      { publishedAt: "desc" },
      { updatedAt: "desc" },
      { id: "desc" },
    ],
    take,
    select: POST_CARD_SELECT,
  });
}

async function getRecentPosts(count: number) {
  const take = Math.max(1, Math.min(20, Number.isFinite(count) ? Math.floor(count) : 5));
  return prisma.post.findMany({
    where: {
      published: true,
      status: { not: "ARCHIVED" },
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: POST_CARD_SELECT,
  });
}

async function getTagCloud(count: number) {
  const take = Math.max(1, Math.min(50, Number.isFinite(count) ? Math.floor(count) : 20));
  return prisma.tag.findMany({
    take,
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
  });
}

async function getCategoryListWithCounts(limit: number) {
  const take = Math.max(1, Math.min(50, Number.isFinite(limit) ? Math.floor(limit) : 10));
  const now = new Date();
  const [cats, allCategories] = await Promise.all([
    prisma.category.findMany({
      take,
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.category.findMany({
      select: { id: true, parentId: true },
    }),
  ]);

  const allCategoryIds = allCategories.map((category) => category.id);
  const childrenMap = new Map<string, string[]>();
  for (const category of allCategories) {
    if (!category.parentId) continue;
    const siblings = childrenMap.get(category.parentId) || [];
    siblings.push(category.id);
    childrenMap.set(category.parentId, siblings);
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
  postGroups.forEach((group: { categoryId: string | null; _count: { _all: number } }) => {
    if (group.categoryId) directCount.set(group.categoryId, group._count._all);
  });

  const memo = new Map<string, number>();
  const sumDescendants = (categoryId: string): number => {
    const cached = memo.get(categoryId);
    if (cached !== undefined) return cached;
    let total = directCount.get(categoryId) ?? 0;
    const children = childrenMap.get(categoryId) || [];
    for (const childId of children) total += sumDescendants(childId);
    memo.set(categoryId, total);
    return total;
  };

  return cats.map((category) => ({ ...category, postCount: sumDescendants(category.id) }));
}

export async function getPageSidebarData(activeTheme: string) {
  const sourceBlocksByLocation = await getBuilderSourceBlocks(activeTheme);
  const rawBlocks = Array.isArray(sourceBlocksByLocation?.post) ? sourceBlocksByLocation.post : [];
  const baseBlocks = rawBlocks.length > 0 ? rawBlocks : getThemeDefaultPostBlocks(activeTheme);
  const effectiveBlocks = baseBlocks.map((block: any) => {
    if (block?.type !== "section") return block;
    const resolvedChildren = resolveSectionChildrenWithSidebarSource(block, sourceBlocksByLocation, "post");
    const blockConfig = block?.config && typeof block.config === "object" ? block.config : {};
    return {
      ...block,
      config: {
        ...blockConfig,
        children: resolvedChildren,
      },
    };
  });

  const sidebarWidgets = extractFirstSidebarChildren([...effectiveBlocks].sort((a, b) => getOrder(a) - getOrder(b)));
  const widgets = collectWidgetsRecursive(sidebarWidgets);
  const uniqueWidgets = Array.from(new Map(widgets.filter(hasId).map((widget) => [widget.id, widget])).values());
  const blockData: Record<string, any[]> = {};

  await Promise.all(
    uniqueWidgets.map(async (widget) => {
      if (widget?.type === "sidebar_widget") {
        const config = widget.config || {};
        const baseCount = parseInt(config.limit || config.count, 10) || 5;
        const tabletCount = parseInt(config.tabletLimit || config.limit || config.count, 10) || baseCount;
        const mobileCount = parseInt(config.mobileLimit || config.tabletLimit || config.limit || config.count, 10) || tabletCount;
        const count = Math.max(baseCount, tabletCount, mobileCount);

        if (config.widgetType === "popular_posts") {
          blockData[widget.id] = await getPopularPosts(count);
        } else if (config.widgetType === "recent_posts") {
          blockData[widget.id] = await getRecentPosts(count);
        } else if (config.widgetType === "category_list") {
          blockData[widget.id] = await getCategoryListWithCounts(count);
        }
      } else if (widget?.type === "tag_cloud") {
        const config = widget.config || {};
        const baseCount = parseInt(config.count || config.limit, 10) || 20;
        const tabletCount = parseInt(config.tabletCount || config.tabletLimit || config.count || config.limit, 10) || baseCount;
        const mobileCount = parseInt(config.mobileCount || config.mobileLimit || config.tabletCount || config.tabletLimit || config.count || config.limit, 10) || tabletCount;
        const count = Math.max(baseCount, tabletCount, mobileCount);
        blockData[widget.id] = await getTagCloud(count);
      }
    })
  );

  return {
    sidebarWidgets,
    blockData,
  };
}
