import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { requireUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_RANGE_DAYS = 7;
const MAX_RANGE_DAYS = 365;
const ANALYTICS_CACHE_TTL_SECONDS = 60;

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function toIsoDay(value: Date) {
  return startOfDay(value).toISOString().slice(0, 10);
}

function parseDateOnly(value: string | null) {
  const raw = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const parsed = new Date(`${raw}T00:00:00.000`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function safeInt(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
}

async function computeOverview(rangeStartIso: string, rangeEndIso: string, todayIso: string) {
  const rangeStart = new Date(rangeStartIso);
  const rangeEnd = new Date(rangeEndIso);
  const today = new Date(todayIso);

  const rangeDays = Math.floor((startOfDay(rangeEnd).getTime() - rangeStart.getTime()) / 86400000) + 1;
  const todayStart = today;
  const last7Start = startOfDay(addDays(today, -6));
  const last30Start = startOfDay(addDays(today, -29));

  const [
    publishedPosts,
    publishedCount,
    periodDailyRows,
    periodPublicDailyRows,
    periodPostRows,
    todayPostRows,
    sumToday,
    sumLast7,
    sumLast30,
    periodPublicPageRows,
    todayPublicPageRows,
    totalPublicPageRows,
    sumTodayPublic,
    sumLast7Public,
    sumLast30Public,
  ] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        publishedAt: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.post.count({
      where: {
        status: "PUBLISHED",
        published: true,
      },
    }),
    prisma.postViewDaily.groupBy({
      by: ["day"],
      where: {
        day: {
          gte: rangeStart,
          lte: startOfDay(rangeEnd),
        },
      },
      _sum: { views: true },
      orderBy: { day: "asc" },
    }),
    prisma.publicPageViewDaily.groupBy({
      by: ["day"],
      where: {
        day: {
          gte: rangeStart,
          lte: startOfDay(rangeEnd),
        },
      },
      _sum: { views: true },
      orderBy: { day: "asc" },
    }),
    prisma.postViewDaily.groupBy({
      by: ["postId"],
      where: {
        day: {
          gte: rangeStart,
          lte: startOfDay(rangeEnd),
        },
      },
      _sum: { views: true },
    }),
    prisma.postViewDaily.groupBy({
      by: ["postId"],
      where: {
        day: todayStart,
      },
      _sum: { views: true },
    }),
    prisma.postViewDaily.aggregate({
      where: { day: todayStart },
      _sum: { views: true },
    }),
    prisma.postViewDaily.aggregate({
      where: {
        day: {
          gte: last7Start,
          lte: todayStart,
        },
      },
      _sum: { views: true },
    }),
    prisma.postViewDaily.aggregate({
      where: {
        day: {
          gte: last30Start,
          lte: todayStart,
        },
      },
      _sum: { views: true },
    }),
    prisma.publicPageViewDaily.groupBy({
      by: ["pageKey", "pageType", "path", "title"],
      where: {
        day: {
          gte: rangeStart,
          lte: startOfDay(rangeEnd),
        },
      },
      _sum: { views: true },
    }),
    prisma.publicPageViewDaily.groupBy({
      by: ["pageKey", "pageType", "path", "title"],
      where: {
        day: todayStart,
      },
      _sum: { views: true },
    }),
    prisma.publicPageViewDaily.groupBy({
      by: ["pageKey", "pageType", "path", "title"],
      _sum: { views: true },
    }),
    prisma.publicPageViewDaily.aggregate({
      where: { day: todayStart },
      _sum: { views: true },
    }),
    prisma.publicPageViewDaily.aggregate({
      where: {
        day: {
          gte: last7Start,
          lte: todayStart,
        },
      },
      _sum: { views: true },
    }),
    prisma.publicPageViewDaily.aggregate({
      where: {
        day: {
          gte: last30Start,
          lte: todayStart,
        },
      },
      _sum: { views: true },
    }),
  ]);

  const trendMap = new Map<string, number>();
  for (let i = 0; i < rangeDays; i += 1) {
    trendMap.set(toIsoDay(addDays(rangeStart, i)), 0);
  }
  for (const row of periodDailyRows) {
    trendMap.set(toIsoDay(row.day), safeInt(row._sum.views));
  }
  for (const row of periodPublicDailyRows) {
    const dayKey = toIsoDay(row.day);
    trendMap.set(dayKey, (trendMap.get(dayKey) || 0) + safeInt(row._sum.views));
  }

  const periodViewsByPost = new Map<string, number>();
  for (const row of periodPostRows) {
    periodViewsByPost.set(row.postId, safeInt(row._sum.views));
  }

  const todayViewsByPost = new Map<string, number>();
  for (const row of todayPostRows) {
    todayViewsByPost.set(row.postId, safeInt(row._sum.views));
  }

  const topPosts = publishedPosts
    .map((post) => {
      const totalViews = safeInt(post.views);
      const periodViews = periodViewsByPost.get(post.id) || 0;
      const todayViews = todayViewsByPost.get(post.id) || 0;
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
        categoryName: post.category?.name || null,
        categorySlug: post.category?.slug || null,
        totalViews,
        periodViews,
        todayViews,
      };
    })
    .sort((a, b) => {
      if (b.periodViews !== a.periodViews) return b.periodViews - a.periodViews;
      if (b.todayViews !== a.todayViews) return b.todayViews - a.todayViews;
      return b.totalViews - a.totalViews;
    })
    .slice(0, 15);

  const authorMap = new Map<string, { id: string; name: string; views: number; totalViews: number; posts: number }>();
  const editorMap = new Map<string, { id: string; name: string; views: number; totalViews: number; posts: number }>();
  const categoryMap = new Map<string, { id: string; name: string; views: number; totalViews: number; posts: number }>();
  const topicMap = new Map<string, { id: string; name: string; slug: string; views: number; totalViews: number; posts: number }>();

  for (const post of publishedPosts) {
    const totalViews = safeInt(post.views);
    const periodViews = periodViewsByPost.get(post.id) || 0;

    if (post.author?.id) {
      const current = authorMap.get(post.author.id) || {
        id: post.author.id,
        name: post.author.name || "Tanpa Nama",
        views: 0,
        totalViews: 0,
        posts: 0,
      };
      current.views += periodViews;
      current.totalViews += totalViews;
      current.posts += 1;
      authorMap.set(post.author.id, current);
    }

    if (post.approvedBy?.id) {
      const current = editorMap.get(post.approvedBy.id) || {
        id: post.approvedBy.id,
        name: post.approvedBy.name || "Tanpa Nama",
        views: 0,
        totalViews: 0,
        posts: 0,
      };
      current.views += periodViews;
      current.totalViews += totalViews;
      current.posts += 1;
      editorMap.set(post.approvedBy.id, current);
    }

    if (post.category?.id) {
      const current = categoryMap.get(post.category.id) || {
        id: post.category.id,
        name: post.category.name || "Tanpa Kategori",
        views: 0,
        totalViews: 0,
        posts: 0,
      };
      current.views += periodViews;
      current.totalViews += totalViews;
      current.posts += 1;
      categoryMap.set(post.category.id, current);
    }

    for (const tag of post.tags || []) {
      const current = topicMap.get(tag.id) || {
        id: tag.id,
        name: tag.name || "Tanpa Topik",
        slug: tag.slug || "",
        views: 0,
        totalViews: 0,
        posts: 0,
      };
      current.views += periodViews;
      current.totalViews += totalViews;
      current.posts += 1;
      topicMap.set(tag.id, current);
    }
  }

  const sortLeaderboard = <T extends { views: number; totalViews: number; posts: number; name: string }>(items: T[]) =>
    items.sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views;
      if (b.totalViews !== a.totalViews) return b.totalViews - a.totalViews;
      if (b.posts !== a.posts) return b.posts - a.posts;
      return a.name.localeCompare(b.name, "id");
    });

  const topAuthors = sortLeaderboard([...authorMap.values()]).slice(0, 10);
  const topEditors = sortLeaderboard([...editorMap.values()]).slice(0, 10);
  const topCategories = sortLeaderboard([...categoryMap.values()]).slice(0, 10);
  const topTopics = sortLeaderboard([...topicMap.values()]).slice(0, 10);

  const publicPeriodViewsByKey = new Map<string, number>();
  const publicTodayViewsByKey = new Map<string, number>();
  const publicTotalViewsByKey = new Map<string, number>();
  const publicPageMetaByKey = new Map<string, { pageKey: string; pageType: string; path: string; title: string }>();

  for (const row of periodPublicPageRows) {
    publicPeriodViewsByKey.set(row.pageKey, safeInt(row._sum.views));
    publicPageMetaByKey.set(row.pageKey, {
      pageKey: row.pageKey,
      pageType: row.pageType,
      path: row.path,
      title: row.title,
    });
  }

  for (const row of todayPublicPageRows) {
    publicTodayViewsByKey.set(row.pageKey, safeInt(row._sum.views));
    if (!publicPageMetaByKey.has(row.pageKey)) {
      publicPageMetaByKey.set(row.pageKey, {
        pageKey: row.pageKey,
        pageType: row.pageType,
        path: row.path,
        title: row.title,
      });
    }
  }

  for (const row of totalPublicPageRows) {
    publicTotalViewsByKey.set(row.pageKey, safeInt(row._sum.views));
    if (!publicPageMetaByKey.has(row.pageKey)) {
      publicPageMetaByKey.set(row.pageKey, {
        pageKey: row.pageKey,
        pageType: row.pageType,
        path: row.path,
        title: row.title,
      });
    }
  }

  const topPages = [...publicPageMetaByKey.values()]
    .map((item) => ({
      id: item.pageKey,
      pageType: item.pageType,
      path: item.path,
      title: item.title,
      totalViews: publicTotalViewsByKey.get(item.pageKey) || 0,
      periodViews: publicPeriodViewsByKey.get(item.pageKey) || 0,
      todayViews: publicTodayViewsByKey.get(item.pageKey) || 0,
    }))
    .sort((a, b) => {
      if (b.periodViews !== a.periodViews) return b.periodViews - a.periodViews;
      if (b.todayViews !== a.todayViews) return b.todayViews - a.todayViews;
      return b.totalViews - a.totalViews;
    })
    .slice(0, 15);

  const totalArticleViewsAllTime = publishedPosts.reduce((sum, post) => {
    return sum + safeInt(post.views);
  }, 0);

  const totalPublicViewsAllTime = [...publicTotalViewsByKey.values()].reduce((sum, value) => {
    return sum + safeInt(value);
  }, 0);

  const totalViewsAllTime = totalArticleViewsAllTime + totalPublicViewsAllTime;
  const avgViewsPerPost = publishedCount > 0 ? Math.round(totalArticleViewsAllTime / publishedCount) : 0;
  const viewsToday = safeInt(sumToday._sum.views) + safeInt(sumTodayPublic._sum.views);
  const viewsLast7Days = safeInt(sumLast7._sum.views) + safeInt(sumLast7Public._sum.views);
  const viewsLast30Days = safeInt(sumLast30._sum.views) + safeInt(sumLast30Public._sum.views);
  const viewsInRange = [...trendMap.values()].reduce((sum, value) => sum + value, 0);

  return {
    trackingMode: "realtime",
    range: {
      days: rangeDays,
      start: rangeStart.toISOString(),
      end: rangeEnd.toISOString(),
    },
    summary: {
      totalViewsAllTime,
      viewsToday,
      viewsLast7Days,
      viewsLast30Days,
      viewsInRange,
      publishedPosts: publishedCount,
      avgViewsPerPost,
    },
    trend: [...trendMap.entries()].map(([day, views]) => ({ day, views })),
    top: {
      authors: topAuthors,
      editors: topEditors,
      categories: topCategories,
      topics: topTopics,
    },
    topPosts,
    topPages,
  };
}

const getCachedOverview = unstable_cache(
  (rangeStartIso: string, rangeEndIso: string, todayIso: string) =>
    computeOverview(rangeStartIso, rangeEndIso, todayIso),
  ["analytics-overview"],
  { revalidate: ANALYTICS_CACHE_TTL_SECONDS, tags: ["analytics-overview"] },
);

export async function GET(request: Request) {
  try {
    const user = await requireUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const today = startOfDay(new Date());
    const startParam = parseDateOnly(searchParams.get("start"));
    const endParam = parseDateOnly(searchParams.get("end"));

    let rangeStart = startOfDay(addDays(today, -(DEFAULT_RANGE_DAYS - 1)));
    let rangeEnd = endOfDay(today);

    if (startParam && endParam) {
      const normalizedStart = startOfDay(startParam);
      const normalizedEndDay = startOfDay(endParam) > today ? today : startOfDay(endParam);
      if (normalizedStart > normalizedEndDay) {
        return NextResponse.json({ error: "Rentang tanggal tidak valid" }, { status: 400 });
      }
      const diffDays = Math.floor((normalizedEndDay.getTime() - normalizedStart.getTime()) / 86400000) + 1;
      if (diffDays > MAX_RANGE_DAYS) {
        return NextResponse.json({ error: `Rentang maksimal ${MAX_RANGE_DAYS} hari.` }, { status: 400 });
      }
      rangeStart = normalizedStart;
      rangeEnd = endOfDay(normalizedEndDay);
    } else {
      const daysRaw = Number(searchParams.get("days") || DEFAULT_RANGE_DAYS);
      const days = Number.isFinite(daysRaw)
        ? Math.min(MAX_RANGE_DAYS, Math.max(1, Math.floor(daysRaw)))
        : DEFAULT_RANGE_DAYS;
      rangeStart = startOfDay(addDays(today, -(days - 1)));
      rangeEnd = endOfDay(today);
    }

    const data = await getCachedOverview(rangeStart.toISOString(), rangeEnd.toISOString(), today.toISOString());

    return NextResponse.json(
      {
        viewerRole: user.role,
        generatedAt: new Date().toISOString(),
        ...data,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Server Error" }, { status: 500 });
  }
}
