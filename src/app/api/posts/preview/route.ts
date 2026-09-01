import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getThemeDefaultPostBlocks } from "@/lib/post-builder-theme-registry";
import { getBuilderSourceBlocks } from "@/lib/page-builder-source-blocks";
import { getPublicMenusByLocation } from "@/lib/public-menus";
import { getSettings } from "@/lib/settings";
import { getCachedCategories } from "@/lib/data";
import { collectWidgetsRecursive, getOrder, hasId } from "@/lib/block-utils";

type PreviewPayload = {
  postId?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  categoryId?: string;
  categoryIds?: string[];
  previewImage?: string;
  featuredPreviewUrl?: string;
  featuredImageAlt?: string;
  postImageWatermarkEnabled?: boolean;
  tags?: string[];
  type?: string;
  videoUrl?: string;
  gallery?: any[];
  imageCaption?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  publishedAt?: string | null;
  authorId?: string;
  approvedById?: string;
  viewsBase?: number;
  metaTitle?: string;
  metaDesc?: string;
};

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
  views: true,
  category: { select: { id: true, name: true, slug: true } },
  author: { select: { name: true, avatar: true, banner: true } },
  featuredImage: { select: { id: true, fileUrl: true, width: true, height: true } },
} as const;

function parseInlineRelatedPositions(value: unknown): number[] {
  if (typeof value !== "string") return [2];
  const parsed = value
    .split(",")
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item, index, array) => Number.isFinite(item) && item > 0 && array.indexOf(item) === index)
    .sort((a, b) => a - b);
  return parsed.length > 0 ? parsed : [2];
}

function getDateRangeStart(range: unknown): Date | null {
  const now = new Date();
  switch (String(range || "all")) {
    case "week": {
      const date = new Date(now);
      date.setDate(date.getDate() - 7);
      return date;
    }
    case "month": {
      const date = new Date(now);
      date.setMonth(date.getMonth() - 1);
      return date;
    }
    case "year": {
      const date = new Date(now);
      date.setFullYear(date.getFullYear() - 1);
      return date;
    }
    default:
      return null;
  }
}

function findCategoryById(categories: any[], id: string): any | null {
  for (const category of categories) {
    if (category?.id === id) return category;
    if (Array.isArray(category?.children)) {
      const found = findCategoryById(category.children, id);
      if (found) return found;
    }
  }
  return null;
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildExcerpt(content: string, subtitle: string): string {
  const base = subtitle.trim() || stripHtml(content);
  return base.length > 180 ? `${base.slice(0, 177).trimEnd()}...` : base;
}

function toSafeIsoString(value: unknown): string {
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return new Date().toISOString();
}

function toSlugCandidate(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

async function getHeaderFooterBlocks(activeTheme: string) {
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
  return {
    headerConfig: headerRows ?? null,
    footerConfig: footerRows ?? null,
  };
}

async function getPopularPosts(count: number, range?: unknown) {
  const take = Math.max(1, Math.min(20, Number.isFinite(count) ? Math.floor(count) : 5));
  const now = new Date();
  const rangeStart = getDateRangeStart(range);
  const where: any = {
    published: true,
    status: { not: "ARCHIVED" },
  };
  if (rangeStart) {
    where.publishedAt = { gte: rangeStart, lte: now };
  } else {
    where.OR = [{ publishedAt: { lte: now } }, { publishedAt: null }];
  }
  return prisma.post.findMany({
    where,
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

async function getRecentPosts(count: number, excludePostId?: string) {
  const take = Math.max(1, Math.min(20, Number.isFinite(count) ? Math.floor(count) : 5));
  const where: any = {
    published: true,
    status: { not: "ARCHIVED" },
  };
  if (excludePostId) where.id = { not: excludePostId };
  return prisma.post.findMany({
    where,
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
    const current = childrenMap.get(category.parentId) || [];
    current.push(category.id);
    childrenMap.set(category.parentId, current);
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
  postGroups.forEach((group) => {
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

export async function POST(request: NextRequest) {
  try {
    const previewData = (await request.json()) as PreviewPayload;
    const [setting, categories, menusByLocation] = await Promise.all([
      getSettings(),
      getCachedCategories(),
      getPublicMenusByLocation(),
    ]);

    const activeTheme = (setting as any)?.activeTheme || "classic";
    const [{ headerConfig, footerConfig }, sourceBlocksByLocation] = await Promise.all([
      getHeaderFooterBlocks(activeTheme),
      getBuilderSourceBlocks(activeTheme),
    ]);

    const rawBlocks = Array.isArray((sourceBlocksByLocation as any)?.post) ? (sourceBlocksByLocation as any).post : [];
    const blocks = rawBlocks.length > 0 ? rawBlocks : getThemeDefaultPostBlocks(activeTheme);

    const title = typeof previewData.title === "string" ? previewData.title.trim() : "";
    const subtitle = typeof previewData.subtitle === "string" ? previewData.subtitle : "";
    const content = typeof previewData.content === "string" ? previewData.content : "";
    const publishedAtIso = toSafeIsoString(previewData.publishedAt);
    const categoryId = typeof previewData.categoryId === "string" && previewData.categoryId.trim() !== ""
      ? previewData.categoryId
      : Array.isArray(previewData.categoryIds)
        ? String(previewData.categoryIds[previewData.categoryIds.length - 1] || "")
        : "";
    const category = findCategoryById(categories, categoryId) || { id: "", name: "Uncategorized", slug: "#" };
    const previewImage = typeof previewData.previewImage === "string" ? previewData.previewImage : "";
    const featuredPreviewUrl = typeof previewData.featuredPreviewUrl === "string" ? previewData.featuredPreviewUrl : "";
    const featuredImageAlt = typeof previewData.featuredImageAlt === "string" ? previewData.featuredImageAlt : "";
    const postImageWatermarkEnabled = previewData.postImageWatermarkEnabled === true;
    const imageCaption = typeof previewData.imageCaption === "string" ? previewData.imageCaption : "";
    const focusKeyword = typeof previewData.focusKeyword === "string" ? previewData.focusKeyword : "";
    const canonicalUrl = typeof previewData.canonicalUrl === "string" ? previewData.canonicalUrl : "";
    const existingPostId = typeof previewData.postId === "string" && previewData.postId.trim() !== "" ? previewData.postId : "";
    const normalizedTags = Array.isArray(previewData.tags)
      ? previewData.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : [];
    const tagSlugCandidates = normalizedTags.map(toSlugCandidate).filter(Boolean);

    const [author, approvedBy, tagRows] = await Promise.all([
      typeof previewData.authorId === "string" && previewData.authorId.trim() !== ""
        ? prisma.user.findUnique({
            where: { id: previewData.authorId },
            select: { name: true, avatar: true, banner: true, bio: true },
          })
        : null,
      typeof previewData.approvedById === "string" && previewData.approvedById.trim() !== ""
        ? prisma.user.findUnique({
            where: { id: previewData.approvedById },
            select: { name: true, avatar: true, banner: true, bio: true },
          })
        : null,
      normalizedTags.length > 0
        ? prisma.tag.findMany({
            where: {
              OR: [
                { name: { in: normalizedTags } },
                { slug: { in: tagSlugCandidates } },
              ],
            },
            select: { id: true, name: true, slug: true },
          })
        : [],
    ]);

    const resolvedTags = tagRows.length > 0
      ? tagRows
      : normalizedTags.map((tag) => ({
          id: tag,
          name: tag,
          slug: toSlugCandidate(tag) || tag,
        }));

    const post = {
      id: existingPostId || "preview",
      slug: "preview",
      title,
      subtitle,
      content,
      excerpt: buildExcerpt(content, subtitle),
      image: previewImage || featuredPreviewUrl || "",
      featuredImageAlt,
      postImageWatermarkEnabled,
      featuredImage: featuredPreviewUrl
        ? {
            id: "preview-featured-image",
            fileUrl: featuredPreviewUrl,
            caption: imageCaption,
          }
        : null,
      imageCaption,
      focusKeyword,
      canonicalUrl,
      publishedAt: publishedAtIso,
      createdAt: publishedAtIso,
      updatedAt: publishedAtIso,
      metaTitle: typeof previewData.metaTitle === "string" ? previewData.metaTitle : "",
      metaDesc: typeof previewData.metaDesc === "string" ? previewData.metaDesc : "",
      views: 0,
      viewsBase: typeof previewData.viewsBase === "number" && Number.isFinite(previewData.viewsBase)
        ? Math.max(0, Math.floor(previewData.viewsBase))
        : 0,
      _count: { comments: 0 },
      author: author || { name: "Preview Author", avatar: null, banner: null, bio: "" },
      approvedBy: approvedBy || null,
      category,
      categoryId: category?.id || "",
      tags: resolvedTags,
      type: typeof previewData.type === "string" ? previewData.type : "TEXT",
      videoUrl: typeof previewData.videoUrl === "string" ? previewData.videoUrl : "",
      gallery: Array.isArray(previewData.gallery) ? previewData.gallery : [],
    };

    const blockData: Record<string, any[]> = {};
    const inlineRelatedEnabled = Boolean((setting as any)?.postInlineRelated);
    const inlineRelatedPositions = parseInlineRelatedPositions((setting as any)?.postRelatedPositions);
    const inlineRelatedCount = Math.max(1, Number.parseInt(String((setting as any)?.postRelatedCount || "2"), 10) || 2);
    const inlineRelatedLimit = inlineRelatedPositions.length * inlineRelatedCount;
    const inlineRelatedDateStart = getDateRangeStart((setting as any)?.postInlineRelatedDateRange);

    if (blocks.length > 0) {
      const widgets = collectWidgetsRecursive([...blocks].sort((a, b) => getOrder(a) - getOrder(b)));
      const uniqueWidgets = Array.from(new Map(widgets.filter(hasId).map((widget) => [widget.id, widget])).values());

      await Promise.all(uniqueWidgets.map(async (widget) => {
        try {
          if (widget.type === "sidebar_widget") {
            const config = widget.config || {};
            const baseCount = parseInt(config.limit || config.count) || 5;
            const tabletCount = parseInt(config.tabletLimit || config.limit || config.count) || baseCount;
            const mobileCount = parseInt(config.mobileLimit || config.tabletLimit || config.limit || config.count) || tabletCount;
            const count = Math.max(baseCount, tabletCount, mobileCount);
            const inheritedSidebarLocation =
              typeof widget?.config?.inheritedSidebarLocation === "string" && widget.config.inheritedSidebarLocation.trim() !== ""
                ? widget.config.inheritedSidebarLocation
                : (typeof widget?.inheritedSidebarLocation === "string" ? widget.inheritedSidebarLocation : "");
            const useSourceSidebarDataset =
              widget?.config?.inheritedSidebarSource === true &&
              inheritedSidebarLocation !== "" &&
              inheritedSidebarLocation !== "post";

            if (config.widgetType === "popular_posts") {
              blockData[widget.id] = await getPopularPosts(count, config.popularDateRange);
            } else if (config.widgetType === "recent_posts") {
              blockData[widget.id] = useSourceSidebarDataset
                ? await getRecentPosts(count)
                : await getRecentPosts(count, existingPostId || undefined);
            } else if (config.widgetType === "category_list") {
              blockData[widget.id] = await getCategoryListWithCounts(count);
            }
          } else if (widget.type === "tag_cloud") {
            const config = widget.config || {};
            const baseCount = parseInt(config.count || config.limit) || 20;
            const tabletCount = parseInt(config.tabletCount || config.tabletLimit || config.count || config.limit) || baseCount;
            const mobileCount = parseInt(config.mobileCount || config.mobileLimit || config.tabletCount || config.tabletLimit || config.count || config.limit) || tabletCount;
            const count = Math.max(baseCount, tabletCount, mobileCount);
            blockData[widget.id] = await getTagCloud(count);
          } else if (widget.type === "post_related_posts") {
            const config = widget.config || {};
            const filterType = config.filterType || "category";
            const baseLimit = parseInt(config.limit || config.count) || 3;
            const tabletLimit = parseInt(config.tabletLimit || config.limit || config.count) || baseLimit;
            const mobileLimit = parseInt(config.mobileLimit || config.tabletLimit || config.limit || config.count) || tabletLimit;
            const limit = Math.max(baseLimit, tabletLimit, mobileLimit);
            const where: any = {
              published: true,
              status: { not: "ARCHIVED" },
            };
            if (existingPostId) where.id = { not: existingPostId };
            if (filterType === "tag" && resolvedTags.length > 0) {
              where.tags = { some: { id: { in: resolvedTags.map((tag) => tag.id) } } };
            } else if (post.categoryId) {
              where.categoryId = post.categoryId;
            }
            blockData[widget.id] = await prisma.post.findMany({
              where,
              take: limit,
              orderBy: { publishedAt: "desc" },
              select: POST_CARD_SELECT,
            });
          }
        } catch (error) {
          console.error(`Preview widget data error for ${widget?.id}:`, error);
        }
      }));
    }

    const postMoment = new Date(post.publishedAt || post.createdAt);
    const baseExclusion = existingPostId ? { id: { not: existingPostId } } : {};
    const [nextPost, prevPost, inlineRelatedPosts] = await Promise.all([
      prisma.post.findFirst({
        where: {
          published: true,
          status: { not: "ARCHIVED" },
          publishedAt: { gt: postMoment },
          ...baseExclusion,
        },
        orderBy: { publishedAt: "asc" },
        select: {
          title: true,
          slug: true,
          image: true,
          type: true,
          featuredImage: { select: { fileUrl: true } },
          category: { select: { slug: true } },
        },
      }),
      prisma.post.findFirst({
        where: {
          published: true,
          status: { not: "ARCHIVED" },
          publishedAt: { lt: postMoment },
          ...baseExclusion,
        },
        orderBy: { publishedAt: "desc" },
        select: {
          title: true,
          slug: true,
          image: true,
          type: true,
          featuredImage: { select: { fileUrl: true } },
          category: { select: { slug: true } },
        },
      }),
      (async () => {
        if (!inlineRelatedEnabled) return [];
        const filterType = String((setting as any)?.postInlineRelatedFilterType || "category");
        const where: any = {
          published: true,
          status: { not: "ARCHIVED" },
          ...baseExclusion,
        };
        if (inlineRelatedDateStart) {
          where.publishedAt = { gte: inlineRelatedDateStart };
        }
        if (filterType === "tag" && resolvedTags.length > 0) {
          where.tags = { some: { id: { in: resolvedTags.map((tag) => tag.id) } } };
        } else if (post.categoryId) {
          where.categoryId = post.categoryId;
        }

        const matched = await prisma.post.findMany({
          where,
          take: inlineRelatedLimit,
          orderBy: { publishedAt: "desc" },
          select: POST_CARD_SELECT,
        });
        if (matched.length > 0) return matched;

        return prisma.post.findMany({
          where: {
            published: true,
            status: { not: "ARCHIVED" },
            ...baseExclusion,
          },
          take: inlineRelatedLimit,
          orderBy: { publishedAt: "desc" },
          select: POST_CARD_SELECT,
        });
      })(),
    ]);

    return NextResponse.json({
      post: {
        ...post,
        next_post: nextPost,
        prev_post: prevPost,
      },
      setting,
      categories,
      blocks,
      blockData,
      inlineRelatedPosts,
      activeTheme,
      menusByLocation,
      headerConfig,
      footerConfig,
      sourceBlocksByLocation: {
        ...(sourceBlocksByLocation || {}),
        post: blocks,
      },
    });
  } catch (error) {
    console.error("Preview post payload error:", error);
    return NextResponse.json({ error: "Gagal memuat preview postingan." }, { status: 500 });
  }
}
