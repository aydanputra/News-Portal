import { prisma } from "@/lib/prisma";
import { getThemeComponent } from "@/lib/theme-registry";
import { getSettings } from "@/lib/settings";
import { getCachedCategories } from "@/lib/data";
import { unstable_cache } from "next/cache";
import { getBuilderSourceBlocks } from "@/lib/page-builder-source-blocks";
import { getPublicMenusByLocation } from "@/lib/public-menus";

// ISR: Revalidate every 0 seconds (force dynamic for debugging)
export const revalidate = 0;
export const dynamic = 'force-dynamic';

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
        content: true,
        image: true,
        publishedAt: true,
        type: true,
        videoUrl: true,
        gallery: true,
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

async function getData() {
  console.log("--- Fetching Homepage Data ---");
  const now = new Date();
  
  // 1. Parallel Fetch Base Data
  const [setting, categories, menusByLocation] = await Promise.all([
      getSettings(),
      getCachedCategories(),
      getPublicMenusByLocation()
  ]);

  const activeTheme = (setting as any)?.activeTheme || "classic";
  console.log("DEBUG PAGE: Active Theme =", activeTheme);

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

  // 2. Fetch Blocks based on Theme
  // @ts-ignore
  const sourceBlocksByLocation = await getBuilderSourceBlocks(activeTheme);
  const blocks = sourceBlocksByLocation.home || [];

  // 3. Fallback: Jika tidak ada blocks, ambil default posts
  let posts: any[] = [];
  if (blocks.length === 0) {
      // @ts-ignore
      posts = await getFallbackPosts();
  }

  console.log(`DEBUG PAGE: Found ${blocks.length} blocks for theme ${activeTheme}`);
  
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
  
  // Use Promise.all to fetch data in parallel with unstable_cache per block
  const blockDataResults = await Promise.all(allBlocksToProcess.map(async (block) => {
    try {
        if (!block || !block.type) return null;

        // Helper: Logic untuk query posts
        if (["news_grid", "news_list", "news_slider", "sidebar_widget", "headline_2", "news_list_highlight", "tag_cloud", "news_bullet_list", "news_headline_big", "news_hero_split_4", "news_hero_slider", "news_grid_slider", "hero", "classic_hero"].includes(block.type)) {
          
          // --- DIRECT FETCH FUNCTION FOR EACH BLOCK (NO CACHE) ---
          // Removing unstable_cache to force real-time updates on homepage
          const fetchBlockData = async () => {
                const config = block.config as any || {};
                
                // Calculate max limit for responsive fetching
                const baseLimit = Number(config.limit) || 6;
                const tabletLimit = Number(config.tabletLimit) || baseLimit;
                const mobileLimit = Number(config.mobileLimit) || baseLimit;
                const limit = Math.max(baseLimit, tabletLimit, mobileLimit);
                const offsetEnabledTypes = new Set(["news_bullet_list", "news_grid", "news_list", "news_hero_split_4", "news_hero_slider", "news_grid_slider"]);
                const blockOffset = offsetEnabledTypes.has(block.type) ? Math.max(0, Number(config.offset) || 0) : 0;

                // Special Case: Tag Cloud
                if (block.type === "tag_cloud") {
                    const tags = await prisma.tag.findMany({ 
                        take: limit, 
                        orderBy: { posts: { _count: 'desc' } }, // Populer tags
                        select: { id: true, name: true, slug: true, _count: { select: { posts: true } } }
                    });
                    return { id: block.id, data: tags };
                }

                // Special Case: Widget Non-Post
                if (block.type === "sidebar_widget") {
                    if (config.widgetType === "category_list") {
                        const cats = await prisma.category.findMany({ 
                            take: limit, 
                            orderBy: { name: 'asc' },
                            select: { id: true, name: true, slug: true }
                        });
                        const allCategories = await prisma.category.findMany({
                            select: { id: true, parentId: true }
                        });
                        const allCategoryIds = allCategories.map((c) => c.id);
                        const childrenMap = new Map<string, string[]>();
                        allCategories.forEach((c) => {
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
                        const catsWithCounts = cats.map((c) => ({ ...c, postCount: sumDesc(c.id) }));
                        return { id: block.id, data: catsWithCounts };
                    }
                    if (config.widgetType === "tag_cloud") {
                        const tags = await prisma.tag.findMany({ 
                            take: limit * 2, 
                            orderBy: { posts: { _count: 'desc' } },
                            select: { id: true, name: true, slug: true, _count: { select: { posts: true } } }
                        });
                        return { id: block.id, data: tags };
                    }
                }

                const whereClause: any = {
                    published: true,
                    status: { not: "ARCHIVED" }, // FIX: Exclude trashed posts in Homepage Blocks
                    OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
                };

                // Filter Logic (Category / Tag)
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

                // Order Logic
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
                        case "random":
                            orderBy = { publishedAt: "desc" }; 
                            break;
                        default:
                            orderBy = { publishedAt: "desc" };
                    }
                } 
                else if (block.type === "sidebar_widget" && config.widgetType === "popular_posts") {
                    orderBy = { views: "desc" };
                }

                let takeLimit = limit;
                if (block.type === "news_list" && config.paginationStyle && config.paginationStyle !== "none") {
                    takeLimit = Math.max(takeLimit, limit * 4, 20);
                }
                if (blockOffset > 0) {
                    takeLimit += blockOffset;
                }
                if (config.sortOrder === 'random') {
                    takeLimit = Math.max(20 + blockOffset, takeLimit); 
                }

                let blockPosts = await prisma.post.findMany({
                    where: whereClause,
                    select: {
                    id: true,
                    title: true,
                    subtitle: true,
                    slug: true,
                    excerpt: true,
                    content: true,
                    image: true,
                    publishedAt: true,
                    createdAt: true,
                    updatedAt: true,
                    type: true,
                    videoUrl: true,
                    gallery: true,
                    category: {
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
                    orderBy: orderBy,
                    take: takeLimit,
                });

                if (config.sortOrder === 'random') {
                    blockPosts = blockPosts.sort(() => 0.5 - Math.random());
                    const randomSliceLimit = blockOffset > 0 ? Math.max(limit + blockOffset, limit) : limit;
                    blockPosts = blockPosts.slice(0, randomSliceLimit);
                }

                return { id: block.id, data: blockPosts };
             };
             
             return await fetchBlockData();
        }
        return null;
    } catch (e) {
        console.error(`Error fetching data for block ${block?.id}:`, e);
        return null;
    }
  }));

  const blockData: Record<string, any> = {};
  blockDataResults.forEach(result => {
      if (result) {
          blockData[result.id] = result.data;
      }
  });

  return { posts, categories, blocks, setting, blockData, sourceBlocksByLocation, menusByLocation, headerConfig, footerConfig };
}

export default async function HomePage() {
  const data = await getData();
  const activeTheme = data.setting?.activeTheme || "modern";
  const ThemeComponent = getThemeComponent(activeTheme);

  // @ts-ignore
  return <ThemeComponent data={data} />;
}
