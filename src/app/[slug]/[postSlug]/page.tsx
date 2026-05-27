import { prisma } from "@/lib/prisma";
import { getThemeDefaultPostBlocks } from "@/lib/post-builder-theme-registry";
import ClassicSinglePost from "@/themes/classic/templates/SinglePost";
import PranalaSinglePost from "@/themes/pranala/templates/SinglePost";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { getBuilderSourceBlocks } from "@/lib/page-builder-source-blocks";
import { resolveSectionChildrenWithSidebarSource } from "@/lib/sidebar-reference";
import { getPublicMenusByLocation } from "@/lib/public-menus";
import { getSettings } from "@/lib/settings";
import TrackView from "@/components/TrackView";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getCachedCategories } from "@/lib/data";

export const revalidate = 600;
export const dynamicParams = true;

function toIsoString(value: unknown): string | undefined {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined;
    return value.toISOString();
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString();
  }
  return undefined;
}

export async function generateStaticParams() {
  try {
    const rows = await prisma.post.findMany({
      where: {
        published: true,
        status: { not: "ARCHIVED" },
      },
      orderBy: { publishedAt: "desc" },
      take: 100,
      select: {
        slug: true,
        category: { select: { slug: true } },
      },
    });

    return rows
      .filter((row) => typeof row.category?.slug === "string" && row.category.slug.trim() !== "")
      .map((row) => ({
        slug: row.category!.slug,
        postSlug: row.slug,
      }));
  } catch {
    return [];
  }
}

const getPostBySlug = cache(async (slug: string, categorySlug: string) => {
  const cached = unstable_cache(
    async () => {
      const post = await prisma.post.findFirst({
        where: {
          slug,
          published: true,
          status: { not: "ARCHIVED" },
        },
        include: {
          category: true,
          author: { select: { name: true, avatar: true, banner: true, bio: true } },
          approvedBy: { select: { name: true, avatar: true, banner: true, bio: true } },
          tags: { select: { id: true, name: true, slug: true } },
          featuredImage: true,
          _count: { select: { comments: true } },
        },
      });
      if (!post) return null;
      if (post.category?.slug !== categorySlug) return null;
      return post;
    },
    [`post:${categorySlug}:${slug}`],
    { tags: [`article-${slug}`, "posts"], revalidate },
  );
  return cached();
});

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

const getPopularPosts = cache(async (count: number) => {
  const take = Math.max(1, Math.min(20, Number.isFinite(count) ? Math.floor(count) : 5));
  const cached = unstable_cache(
    async () => {
      const now = new Date();
      return await prisma.post.findMany({
        where: {
          published: true,
          status: { not: "ARCHIVED" },
          OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
        },
        orderBy: { views: "desc" },
        take,
        select: {
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
        },
      });
    },
    [`popular-posts:${take}`],
    { tags: ["posts"], revalidate: 300 },
  );
  return cached();
});

const getRecentPosts = cache(async (count: number, excludePostId?: string) => {
  const take = Math.max(1, Math.min(20, Number.isFinite(count) ? Math.floor(count) : 5));
  const excludeId = typeof excludePostId === "string" && excludePostId.trim() !== "" ? excludePostId : "";
  const cached = unstable_cache(
    async () => {
      const where: any = {
        published: true,
        status: { not: "ARCHIVED" },
      };
      if (excludeId) where.id = { not: excludeId };
      return await prisma.post.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take,
        select: {
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
        },
      });
    },
    [`recent-posts:${take}:${excludeId}`],
    { tags: ["posts"], revalidate: 300 },
  );
  return cached();
});

const getTagCloud = cache(async (count: number) => {
  const take = Math.max(1, Math.min(50, Number.isFinite(count) ? Math.floor(count) : 20));
  const cached = unstable_cache(
    async () => {
      return await prisma.tag.findMany({
        take,
        include: { _count: { select: { posts: true } } },
        orderBy: { posts: { _count: "desc" } },
      });
    },
    [`tag-cloud:${take}`],
    { tags: ["posts"], revalidate: 3600 },
  );
  return cached();
});

const getCategoryListWithCounts = cache(async (limit: number) => {
  const take = Math.max(1, Math.min(50, Number.isFinite(limit) ? Math.floor(limit) : 10));
  const cached = unstable_cache(
    async () => {
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
        const cachedSum = memo.get(categoryId);
        if (cachedSum !== undefined) return cachedSum;
        let total = directCount.get(categoryId) ?? 0;
        const children = childrenMap.get(categoryId) || [];
        for (const childId of children) total += sumDesc(childId);
        memo.set(categoryId, total);
        return total;
      };

      return cats.map((c) => ({ ...c, postCount: sumDesc(c.id) }));
    },
    [`category-list-counts:${take}`],
    { tags: ["categories", "posts"], revalidate: 3600 },
  );
  return cached();
});

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
    getCachedCategories(),
  ]);
  const activeTheme = (setting as any)?.activeTheme || "classic";
  const [{ headerConfig, footerConfig }, sourceBlocksByLocation] = await Promise.all([
    getHeaderFooterBlocks(activeTheme),
    getBuilderSourceBlocks(activeTheme),
  ]);

  const rawBlocks = Array.isArray((sourceBlocksByLocation as any)?.post) ? (sourceBlocksByLocation as any).post : [];
  const blocks = rawBlocks.length === 0 ? getThemeDefaultPostBlocks(activeTheme) : rawBlocks;
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
  const post = postRaw;

  // Fetch Block Data (Popular Posts, etc)
  const blockData: Record<string, any[]> = {};
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
         
                           if (config.widgetType === 'popular_posts') {
                               blockData[widget.id] = await getPopularPosts(count);
                           } else if (config.widgetType === 'recent_posts') {
                               blockData[widget.id] = await getRecentPosts(count, post.id);
                           } else if (config.widgetType === 'category_list') {
                               blockData[widget.id] = await getCategoryListWithCounts(count);
                           }
                       } else if (widget.type === 'tag_cloud') {
                           const config = widget.config || {};
                           const count = parseInt(config.count) || 20;
                           blockData[widget.id] = await getTagCloud(count);
                       } else if (widget.type === 'post_related_posts' && post) {
                           const config = widget.config || {};
                           const filterType = config.filterType || 'category';
                           const limit = parseInt(config.limit) || 3;
                           
                           let widgetRelatedPosts: any[] = [];
                           if (filterType === 'tag' && post.tags && post.tags.length > 0) {
                                const tagIds = post.tags.map((t: any) => t.id);
                                const cached = unstable_cache(
                                  async () => {
                                    return await prisma.post.findMany({
                                      where: {
                                        published: true,
                                        status: { not: "ARCHIVED" },
                                        id: { not: post.id },
                                        tags: { some: { id: { in: tagIds } } },
                                      },
                                      take: limit,
                                      orderBy: { publishedAt: "desc" },
                                      select: {
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
                                      },
                                    });
                                  },
                                  [`widget-related:${post.id}:tag:${tagIds.join(",")}:limit:${limit}`],
                                  { tags: [`article-${slug}`, "posts"], revalidate: 600 },
                                );
                                widgetRelatedPosts = await cached();
                            } else {
                                 // Category default
                                 const cached = unstable_cache(
                                   async () => {
                                     return await prisma.post.findMany({
                                       where: {
                                         published: true,
                                         status: { not: "ARCHIVED" },
                                         id: { not: post.id },
                                         categoryId: post.categoryId,
                                       },
                                       take: limit,
                                       orderBy: { publishedAt: "desc" },
                                       select: {
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
                                       },
                                     });
                                   },
                                   [`widget-related:${post.id}:cat:${post.categoryId}:limit:${limit}`],
                                   { tags: [`article-${slug}`, "posts"], revalidate: 600 },
                                 );
                                 widgetRelatedPosts = await cached();
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
      (async () => {
        const cached = unstable_cache(
          async () => {
            return await prisma.post.findFirst({
              where: {
                published: true,
                status: { not: "ARCHIVED" },
                publishedAt: { gt: post.publishedAt || post.createdAt },
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
            });
          },
          [`post-next:${post.id}`],
          { tags: [`article-${slug}`, "posts"], revalidate: 600 },
        );
        return cached();
      })(),

      // Prev Post
      (async () => {
        const cached = unstable_cache(
          async () => {
            return await prisma.post.findFirst({
              where: {
                published: true,
                status: { not: "ARCHIVED" },
                publishedAt: { lt: post.publishedAt || post.createdAt },
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
            });
          },
          [`post-prev:${post.id}`],
          { tags: [`article-${slug}`, "posts"], revalidate: 600 },
        );
        return cached();
      })(),

      // Recent Posts
      getRecentPosts(5, post.id),

      // Related Posts logic
      (async () => {
          const relatedLimit = 3;
          const cached = unstable_cache(
            async () => {
              return await prisma.post.findMany({
                where: {
                  published: true,
                  status: { not: "ARCHIVED" },
                  id: { not: post.id },
                  categoryId: post.categoryId,
                },
                take: relatedLimit,
                orderBy: { publishedAt: "desc" },
                select: {
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
                },
              });
            },
            [`related-posts:${post.id}:${relatedLimit}`],
            { tags: [`article-${slug}`, "posts"], revalidate: 600 },
          );
          return cached();
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

          const cachedMatched = unstable_cache(
            async () => {
              return await prisma.post.findMany({
                where,
                take: inlineRelatedLimit,
                orderBy: { publishedAt: "desc" },
                select: {
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
                },
              });
            },
            [`inline-related:${post.id}:${filterType}:${inlineRelatedLimit}:${inlineRelatedDateStart ? inlineRelatedDateStart.toISOString().slice(0, 10) : "all"}`],
            { tags: [`article-${slug}`, "posts"], revalidate: 600 },
          );
          const matchedPosts = await cachedMatched();

          if (matchedPosts.length > 0) return matchedPosts;

          const cachedFallback = unstable_cache(
            async () => {
              return await prisma.post.findMany({
                where: baseWhere,
                take: inlineRelatedLimit,
                orderBy: { publishedAt: "desc" },
                select: {
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
                },
              });
            },
            [`inline-related:fallback:${post.id}:${inlineRelatedLimit}`],
            { tags: [`article-${slug}`, "posts"], revalidate: 600 },
          );
          return cachedFallback();
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
      publishedTime: toIsoString((post as any)?.publishedAt),
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
    datePublished: toIsoString((post as any)?.publishedAt),
    dateModified: toIsoString((post as any)?.updatedAt),
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
      <TrackView postId={post.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {body}
    </>
  );
}
