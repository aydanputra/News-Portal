import { prisma } from "@/lib/prisma";
import { getThemeDefaultPostBlocks } from "@/lib/post-builder-theme-registry";
import ClassicSinglePost from "@/themes/classic/templates/SinglePost";
import PranalaSinglePost from "@/themes/pranala/templates/SinglePost";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { headers } from "next/headers";
import { getBuilderSourceBlocks } from "@/lib/page-builder-source-blocks";
import { resolveSectionChildrenWithSidebarSource } from "@/lib/sidebar-reference";
import { getPublicMenusByLocation } from "@/lib/public-menus";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Direct Post Fetch (No Cache)
const getPostBySlug = async (slug: string, categorySlug: string) => {
  return await prisma.post.findFirst({
    where: { 
      slug,
      category: { slug: categorySlug },
      published: true,
      status: { not: "ARCHIVED" } // FIX: Exclude trashed posts
    },
    include: {
      category: true,
      author: { select: { name: true, avatar: true, banner: true, bio: true } },
      approvedBy: { select: { name: true, avatar: true, banner: true, bio: true } },
      tags: true,
      featuredImage: true, 
    },
  });
};

// Direct Blocks Fetch (No Cache)
const getPostBlocks = async (activeTheme: string) => {
    return await prisma.homepageBlock.findMany({
      where: { location: "post", isActive: true, themeId: activeTheme },
      orderBy: { order: "asc" }
    });
};

const isVisible = (block: any) => block?.isVisible !== false;
const getOrder = (block: any) => (typeof block?.order === "number" ? block.order : 0);
const getChildren = (block: any) => {
  const children = block?.config?.children;
  if (!Array.isArray(children)) return [];
  return [...children].filter(isVisible);
};
const parseInlineRelatedPositions = (value: unknown): number[] => {
  if (typeof value !== "string") return [2];
  const parsed = value
    .split(",")
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item, index, array) => Number.isFinite(item) && item > 0 && array.indexOf(item) === index)
    .sort((a, b) => a - b);
  return parsed.length > 0 ? parsed : [2];
};
const getDateRangeStart = (range: unknown): Date | null => {
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
};

const collectWidgetsRecursive = (blocks: any[]): any[] => {
  const result: any[] = [];
  for (const block of blocks) {
    if (!isVisible(block)) continue;
    if (block.type === "section") {
      result.push(...collectWidgetsRecursive(getChildren(block)));
      continue;
    }
    result.push(block);
  }
  return result;
};

async function getData(slug: string, categorySlug: string) {
  const [postRaw, setting, categories] = await Promise.all([
      getPostBySlug(slug, categorySlug),
      getSettings(),
      prisma.category.findMany({ orderBy: { name: "asc" }, take: 5 })
  ]);
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
  const rawBlocks = await getPostBlocks(activeTheme);
  const blocks = rawBlocks.length === 0 ? getThemeDefaultPostBlocks(activeTheme) : rawBlocks;
  const sourceBlocksByLocation = await getBuilderSourceBlocks(activeTheme);
  const effectiveBlocks = blocks.map((block: any) => {
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

  if (!postRaw) return { post: null, setting, categories, blocks: [], recentPosts: [], relatedPosts: [], inlineRelatedPosts: [], blockData: {}, activeTheme, headerConfig, footerConfig, sourceBlocksByLocation };
  let post = postRaw;

  try {
    const h = await headers();
    const purpose = String(h.get("purpose") || h.get("sec-purpose") || "").toLowerCase();
    const isPrefetch =
      String(h.get("next-router-prefetch") || "") === "1" ||
      String(h.get("x-middleware-prefetch") || "") === "1" ||
      purpose.includes("prefetch");
    const ua = String(h.get("user-agent") || "").toLowerCase();
    const isBot = ua.includes("bot") || ua.includes("crawler") || ua.includes("spider") || ua.includes("preview");
    const shouldCountView = !isPrefetch && !isBot;

    if (shouldCountView) {
      await prisma.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      });
      post = { ...post, views: (typeof post.views === "number" ? post.views : 0) + 1 };
    }
  } catch (error) {
    console.error("[views] Failed to increment post view:", error);
  }

  try {
    const approvedCommentCount = await prisma.comment.count({
      where: { postId: post.id, isApproved: true },
    });
    post = { ...post, commentCount: approvedCommentCount } as any;
  } catch (error) {
    console.error("[comments] Failed to count approved comments:", error);
  }

  try {
    const rows = await prisma.$queryRaw<{ viewsBase: number }[]>`SELECT "viewsBase" FROM "Post" WHERE "id" = ${post.id} LIMIT 1`;
    const viewsBase = typeof rows?.[0]?.viewsBase === "number" && Number.isFinite(rows[0].viewsBase) ? rows[0].viewsBase : 0;
    post = { ...post, viewsBase };
  } catch (error) {
    console.error("[viewsBase] Failed to load viewsBase:", error);
  }

  // Fetch Block Data (Popular Posts, etc)
  const blockData: Record<string, any[]> = {};
  const listPostSelect = {
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
      category: {
          select: { id: true, name: true, slug: true }
      },
      author: { select: { name: true, avatar: true, banner: true } },
      featuredImage: {
          select: {
              id: true,
              fileUrl: true,
              width: true,
              height: true
          }
      }
  };
  const inlineRelatedEnabled = Boolean((setting as any)?.postInlineRelated);
  const inlineRelatedPositions = parseInlineRelatedPositions((setting as any)?.postRelatedPositions);
  const inlineRelatedCount = Math.max(1, Number.parseInt(String((setting as any)?.postRelatedCount || "2"), 10) || 2);
  const inlineRelatedLimit = inlineRelatedPositions.length * inlineRelatedCount;
  const inlineRelatedDateStart = getDateRangeStart((setting as any)?.postInlineRelatedDateRange);
  
  if (blocks.length > 0) {
      // Collect all fetch promises
      const fetchPromises: Promise<void>[] = [];

      const widgets = collectWidgetsRecursive([...effectiveBlocks].sort((a, b) => getOrder(a) - getOrder(b)));
      const uniqueWidgets = Array.from(new Map(widgets.filter((widget) => widget?.id).map((widget) => [widget.id, widget])).values());
      for (const widget of uniqueWidgets) {
               // Push fetch logic to promise array
               const promise = (async () => {
                   try {
                       if (widget.type === 'sidebar_widget') {
                           const config = widget.config || {};
                           const count = parseInt(config.limit || config.count) || 5;
                           const now = new Date();
         
                           if (config.widgetType === 'popular_posts') {
                               blockData[widget.id] = await prisma.post.findMany({
                                   where: { 
                                       published: true,
                                       status: { not: "ARCHIVED" },
                                       OR: [{ publishedAt: { lte: now } }, { publishedAt: null }]
                                   },
                                   orderBy: { views: 'desc' },
                                   take: count,
                                   select: listPostSelect
                               });
                           } else if (config.widgetType === 'recent_posts') {
                               blockData[widget.id] = await prisma.post.findMany({
                                   where: { 
                                       published: true,
                                       status: { not: "ARCHIVED" },
                                       OR: [{ publishedAt: { lte: now } }, { publishedAt: null }]
                                   },
                                   orderBy: { publishedAt: 'desc' },
                                   take: count,
                                   select: listPostSelect
                               });
                           } else if (config.widgetType === 'category_list') {
                               const cats = await prisma.category.findMany({
                                   orderBy: { name: 'asc' },
                                   select: { id: true, name: true, slug: true }
                               });
                               const allCategories = await prisma.category.findMany({
                                   select: { id: true, parentId: true }
                               });
                               const allCategoryIds = allCategories.map((c: any) => c.id);
                               const childrenMap = new Map<string, string[]>();
                               allCategories.forEach((c: any) => {
                                   if (!c.parentId) return;
                                   const arr = childrenMap.get(c.parentId) || [];
                                   arr.push(c.id);
                                   childrenMap.set(c.parentId, arr);
                               });
                               const postGroups = allCategoryIds.length > 0 ? await prisma.post.groupBy({
                                   by: ["categoryId"],
                                   _count: { _all: true },
                                   where: {
                                       categoryId: { in: allCategoryIds },
                                       published: true,
                                       status: { not: "ARCHIVED" },
                                       OR: [{ publishedAt: { lte: now } }, { publishedAt: null }]
                                   }
                               }) : [];
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
                               blockData[widget.id] = cats.map((c: any) => ({ ...c, postCount: sumDesc(c.id) }));
                           }
                       } else if (widget.type === 'tag_cloud') {
                           const config = widget.config || {};
                           const count = parseInt(config.count) || 20;
                           
                           blockData[widget.id] = await prisma.tag.findMany({
                               take: count,
                               include: { _count: { select: { posts: true } } },
                               orderBy: { posts: { _count: 'desc' } }
                           });
                       } else if (widget.type === 'post_related_posts' && post) {
                           const config = widget.config || {};
                           const filterType = config.filterType || 'category';
                           const limit = parseInt(config.limit) || 3;
                           
                           let widgetRelatedPosts: any[] = [];
                           if (filterType === 'tag' && post.tags && post.tags.length > 0) {
                                const tagIds = post.tags.map((t: any) => t.id);
                                widgetRelatedPosts = await prisma.post.findMany({
                                     where: {
                                         published: true,
                                         status: { not: "ARCHIVED" },
                                         id: { not: post.id },
                                         tags: { some: { id: { in: tagIds } } }
                                     },
                                     take: limit,
                                     orderBy: { publishedAt: 'desc' },
                                     select: listPostSelect
                                 });
                            } else {
                                 // Category default
                                 widgetRelatedPosts = await prisma.post.findMany({
                                     where: {
                                         published: true,
                                         status: { not: "ARCHIVED" },
                                         id: { not: post.id },
                                         categoryId: post.categoryId
                                     },
                                     take: limit,
                                     orderBy: { publishedAt: 'desc' },
                                     select: listPostSelect
                                 });
                            }
                           blockData[widget.id] = widgetRelatedPosts;
                       }
                   } catch (e) {
                       console.error(`Error fetching widget data ${widget.id}:`, e);
                   }
               })();
               fetchPromises.push(promise);
      }
      
      // Execute all widget queries in parallel
      await Promise.all(fetchPromises);
  }

  // Parallel Fetch for Next/Prev/Recent/Related
  const [nextPost, prevPost, recentPosts, relatedPosts, inlineRelatedPosts] = await Promise.all([
      // Next Post
      prisma.post.findFirst({
          where: { 
              published: true,
              status: { not: "ARCHIVED" },
              publishedAt: { gt: post.publishedAt || post.createdAt }
          },
          orderBy: { publishedAt: "asc" },
          select: {
              title: true,
              slug: true,
              image: true,
              type: true,
              featuredImage: { select: { fileUrl: true } },
              category: { select: { slug: true } }
          }
      }),

      // Prev Post
      prisma.post.findFirst({
          where: { 
              published: true,
              status: { not: "ARCHIVED" },
              publishedAt: { lt: post.publishedAt || post.createdAt }
          },
          orderBy: { publishedAt: "desc" },
          select: {
              title: true,
              slug: true,
              image: true,
              type: true,
              featuredImage: { select: { fileUrl: true } },
              category: { select: { slug: true } }
          }
      }),

      // Recent Posts
      prisma.post.findMany({
        where: { 
            published: true, 
            status: { not: "ARCHIVED" },
            id: { not: post.id } 
        },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: listPostSelect
      }),

      // Related Posts logic
      (async () => {
          const relatedLimit = 3;
          return await prisma.post.findMany({
              where: {
                  published: true,
                  status: { not: "ARCHIVED" },
                  id: { not: post.id },
                  categoryId: post.categoryId
              },
              take: relatedLimit,
              orderBy: { publishedAt: 'desc' },
              select: listPostSelect
          });
      })(),

      (async () => {
          if (!inlineRelatedEnabled || !post) return [];
          const filterType = String((setting as any)?.postInlineRelatedFilterType || "category");
          const baseWhere: any = {
              published: true,
              status: { not: "ARCHIVED" },
              id: { not: post.id },
          };

          if (inlineRelatedDateStart) {
              baseWhere.publishedAt = { gte: inlineRelatedDateStart };
          }

          const where: any = { ...baseWhere };
          if (filterType === "tag" && Array.isArray(post.tags) && post.tags.length > 0) {
              where.tags = { some: { id: { in: post.tags.map((tag: any) => tag.id) } } };
          } else {
              where.categoryId = post.categoryId;
          }

          const matchedPosts = await prisma.post.findMany({
              where,
              take: inlineRelatedLimit,
              orderBy: { publishedAt: "desc" },
              select: listPostSelect,
          });

          if (matchedPosts.length > 0) return matchedPosts;

          return await prisma.post.findMany({
              where: baseWhere,
              take: inlineRelatedLimit,
              orderBy: { publishedAt: "desc" },
              select: listPostSelect,
          });
      })()
  ]);

  return {
    post: { ...post, next_post: nextPost, prev_post: prevPost },
    setting,
    categories,
    recentPosts,
    relatedPosts,
    inlineRelatedPosts,
    blocks,
    blockData,
    activeTheme,
    headerConfig,
    footerConfig,
    sourceBlocksByLocation: {
      ...sourceBlocksByLocation,
      post: blocks || sourceBlocksByLocation.post || [],
    },
  };
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string; postSlug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const postSlug = decodeURIComponent(params.postSlug);
  const categorySlug = decodeURIComponent(params.slug);

  const post = await getPostBySlug(postSlug, categorySlug);

  if (!post) {
    return {
      title: "Berita Tidak Ditemukan",
    };
  }

  // Use metaTitle if available, otherwise fallback to title
  const title = post.metaTitle || post.title;
  
  // Use metaDesc if available, otherwise fallback to subtitle or trimmed content
  const description = post.metaDesc || post.subtitle || (post.content ? post.content.replace(/<[^>]*>?/gm, '').substring(0, 160) : "");

  const previousImages = (await parent).openGraph?.images || [];
  const imageUrl = post.image || post.featuredImage?.fileUrl;
  const images = imageUrl ? [imageUrl, ...previousImages] : previousImages;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: images,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author?.name || "Redaksi"],
      tags: post.tags?.map((t: any) => t.name) || [],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: images,
    },
  };
}

export default async function CategoryPostPage(props: { params: Promise<{ slug: string; postSlug: string }> }) {
  const params = await props.params;
  const postSlug = decodeURIComponent(params.postSlug);
  const categorySlug = decodeURIComponent(params.slug);
  
  const { post, setting, categories, blocks, blockData, inlineRelatedPosts, activeTheme, sourceBlocksByLocation, headerConfig, footerConfig } = await getData(postSlug, categorySlug);
  const menusByLocation = await getPublicMenusByLocation();

  if (!post) {
    // If not found in this category, check if it exists in another category for redirect?
    // Or check slug history. For now, 404.
    notFound();
  }

  const siteUrl =
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL.trim() !== ""
      ? process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/+$/, "")
      : "http://localhost:3000";
  const postUrl = `${siteUrl}/${categorySlug}/${post.slug}`;

  const toAbsoluteUrl = (maybeUrl: unknown) => {
    const raw = typeof maybeUrl === "string" ? maybeUrl.trim() : "";
    if (!raw) return "";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/")) return `${siteUrl}${raw}`;
    return `${siteUrl}/${raw}`;
  };

  const imageUrl = toAbsoluteUrl(post.image || post.featuredImage?.fileUrl);
  const logoUrl = toAbsoluteUrl((setting as any)?.logoUrl);
  const descriptionRaw =
    String(post.metaDesc || post.subtitle || "").trim() ||
    (typeof post.content === "string" ? post.content.replace(/<[^>]*>?/gm, "").slice(0, 200).trim() : "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    headline: post.title,
    description: descriptionRaw,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: post.publishedAt ? post.publishedAt.toISOString() : undefined,
    dateModified: post.updatedAt ? post.updatedAt.toISOString() : undefined,
    author: { "@type": "Person", name: post.author?.name || "Redaksi" },
    publisher: {
      "@type": "Organization",
      name: (setting as any)?.siteName || "Portal Berita",
      logo: logoUrl ? { "@type": "ImageObject", url: logoUrl } : undefined,
    },
    articleSection: post.category?.name,
    keywords: Array.isArray(post.tags) ? post.tags.map((t: any) => t.name).filter(Boolean).join(", ") : undefined,
  };

  const body =
    activeTheme === "pranala" && blocks && blocks.length > 0 ? (
      <PranalaSinglePost
        post={post}
        setting={setting}
        categories={categories}
        blocks={blocks}
        blockData={blockData}
        inlineRelatedPosts={inlineRelatedPosts}
        sourceBlocksByLocation={sourceBlocksByLocation}
        menusByLocation={menusByLocation}
        headerConfig={headerConfig}
        footerConfig={footerConfig}
      />
    ) : (
      <ClassicSinglePost
        post={post}
        setting={setting}
        categories={categories}
        footerConfig={footerConfig}
        menusByLocation={menusByLocation}
      />
    );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {body}
    </>
  );
}
