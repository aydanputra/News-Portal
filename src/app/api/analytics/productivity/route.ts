import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { requireUser } from "@/lib/server-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PRODUCTIVITY_CACHE_TTL_SECONDS = 60;

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

function safeInt(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
}

function resolvePeriod(yearValue: string | null, monthValue: string | null) {
  const now = new Date();
  const year = yearValue && /^\d{4}$/.test(yearValue) ? Number(yearValue) : now.getFullYear();
  const parsedMonth = monthValue && /^\d{1,2}$/.test(monthValue) ? Number(monthValue) : now.getMonth() + 1;
  const month = parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : now.getMonth() + 1;

  const start = new Date(year, month - 1, 1);
  const end = endOfDay(new Date(year, month, 0));
  return { start, end };
}

function monthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function dayKeyOf(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function addDaysLocal(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function startOfWeekMonday(value: Date) {
  const date = startOfDay(value);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDaysLocal(date, diff);
}

type ProductivityRange = "day" | "week" | "month";

function buildSeries(rangeStart: Date, rangeEnd: Date, range: ProductivityRange) {
  const buckets: { key: string; label: string }[] = [];

  if (range === "day") {
    let cursor = startOfDay(rangeStart);
    const end = startOfDay(rangeEnd);
    while (cursor.getTime() <= end.getTime()) {
      buckets.push({
        key: dayKeyOf(cursor),
        label: cursor.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      });
      cursor = addDaysLocal(cursor, 1);
    }
  } else if (range === "week") {
    let cursor = startOfWeekMonday(rangeStart);
    const end = rangeEnd;
    while (cursor.getTime() <= end.getTime()) {
      const weekEnd = addDaysLocal(cursor, 6);
      buckets.push({
        key: dayKeyOf(cursor),
        label: `${cursor.getDate()}-${weekEnd.getDate()} ${cursor.toLocaleDateString("id-ID", { month: "short" })}`,
      });
      cursor = addDaysLocal(cursor, 7);
    }
  } else {
    let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const end = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);
    while (cursor.getTime() <= end.getTime()) {
      buckets.push({
        key: monthKey(cursor),
        label: cursor.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
      });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
  }

  return buckets;
}

function buildMonths(rangeStart: Date, rangeEnd: Date) {
  const months: { key: string; label: string }[] = [];
  const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  const end = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), 1);
  while (cursor.getTime() <= end.getTime()) {
    months.push({
      key: monthKey(cursor),
      label: cursor.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
}

async function computeProductivity(
  rangeStartIso: string,
  rangeEndIso: string,
  authorId?: string,
  range?: ProductivityRange,
) {
  const rangeStart = new Date(rangeStartIso);
  const rangeEnd = new Date(rangeEndIso);

  const [publishedPosts, periodPostViews] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        published: true,
      },
      select: {
        id: true,
        publishedAt: true,
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.postViewDaily.groupBy({
      by: ["postId", "day"],
      where: {
        day: {
          gte: startOfDay(rangeStart),
          lte: startOfDay(rangeEnd),
        },
      },
      _sum: { views: true },
    }),
  ]);

  const viewsByPost = new Map<string, number>();
  const viewsByPostMonth = new Map<string, Map<string, number>>();
  const viewsByPostDay = new Map<string, Map<string, number>>();
  for (const row of periodPostViews) {
    const total = safeInt(row._sum.views);
    viewsByPost.set(row.postId, (viewsByPost.get(row.postId) || 0) + total);

    const mk = monthKey(row.day);
    let monthMap = viewsByPostMonth.get(row.postId);
    if (!monthMap) {
      monthMap = new Map();
      viewsByPostMonth.set(row.postId, monthMap);
    }
    monthMap.set(mk, (monthMap.get(mk) || 0) + total);

    const dk = dayKeyOf(row.day);
    let dayMap = viewsByPostDay.get(row.postId);
    if (!dayMap) {
      dayMap = new Map();
      viewsByPostDay.set(row.postId, dayMap);
    }
    dayMap.set(dk, (dayMap.get(dk) || 0) + total);
  }

  const authorMap = new Map<
    string,
    {
      id: string;
      name: string;
      articles: number;
      views: number;
      monthly: Map<string, { articles: number; views: number }>;
    }
  >();

  const writerMap = new Map<string, string>();

  for (const post of publishedPosts) {
    if (!post.author?.id) continue;
    if (!writerMap.has(post.author.id)) {
      writerMap.set(post.author.id, post.author.name || "Tanpa Nama");
    }

    if (authorId && post.author.id !== authorId) continue;

    const current = authorMap.get(post.author.id) || {
      id: post.author.id,
      name: post.author.name || "Tanpa Nama",
      articles: 0,
      views: 0,
      monthly: new Map(),
    };

    const publishedAt = post.publishedAt;
    if (publishedAt && publishedAt >= rangeStart && publishedAt <= rangeEnd) {
      current.articles += 1;
      const mk = monthKey(publishedAt);
      const m = current.monthly.get(mk) || { articles: 0, views: 0 };
      m.articles += 1;
      current.monthly.set(mk, m);
    }

    const postMonthViews = viewsByPostMonth.get(post.id);
    if (postMonthViews) {
      for (const [mk, views] of postMonthViews) {
        const m = current.monthly.get(mk) || { articles: 0, views: 0 };
        m.views += views;
        current.monthly.set(mk, m);
      }
    }

    current.views += viewsByPost.get(post.id) || 0;
    authorMap.set(post.author.id, current);
  }

  const months = buildMonths(rangeStart, rangeEnd);

  const authors = [...authorMap.values()]
    .map((author) => {
      const monthly: Record<string, { articles: number; views: number }> = {};
      for (const month of months) {
        monthly[month.key] = author.monthly.get(month.key) || { articles: 0, views: 0 };
      }
      return {
        id: author.id,
        name: author.name,
        articles: author.articles,
        views: author.views,
        monthly,
      };
    })
    .sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views;
      if (b.articles !== a.articles) return b.articles - a.articles;
      return a.name.localeCompare(b.name, "id");
    });

  const totalArticles = authors.reduce((sum, item) => sum + item.articles, 0);
  const totalViews = authors.reduce((sum, item) => sum + item.views, 0);

  const writers = [...writerMap.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "id"));

  let series: { key: string; label: string; articles: number; views: number }[] | undefined;

  if (authorId && range) {
    const buckets = buildSeries(rangeStart, rangeEnd, range);
    const seriesMap = new Map<string, { key: string; label: string; articles: number; views: number }>();
    for (const bucket of buckets) {
      seriesMap.set(bucket.key, { key: bucket.key, label: bucket.label, articles: 0, views: 0 });
    }

    const bucketKeyFor = (date: Date) => {
      if (range === "day") return dayKeyOf(date);
      if (range === "week") return dayKeyOf(startOfWeekMonday(date));
      return monthKey(date);
    };

    for (const post of publishedPosts) {
      if (!post.author?.id || post.author.id !== authorId) continue;

      if (post.publishedAt && post.publishedAt >= rangeStart && post.publishedAt <= rangeEnd) {
        const key = bucketKeyFor(post.publishedAt);
        const bucket = seriesMap.get(key);
        if (bucket) bucket.articles += 1;
      }

      const dayMap = viewsByPostDay.get(post.id);
      if (dayMap) {
        for (const [dayKey, views] of dayMap) {
          const [y, m, d] = dayKey.split("-").map(Number);
          const date = new Date(y, m - 1, d);
          if (date < rangeStart || date > rangeEnd) continue;
          const key = bucketKeyFor(date);
          const bucket = seriesMap.get(key);
          if (bucket) bucket.views += views;
        }
      }
    }

    series = buckets.map((bucket) => seriesMap.get(bucket.key)!);
  }

  return {
    start: rangeStart.toISOString(),
    end: rangeEnd.toISOString(),
    totalArticles,
    totalViews,
    months,
    authors,
    writers,
    ...(series ? { series } : {}),
  };
}

const getCachedProductivity = unstable_cache(
  (rangeStartIso: string, rangeEndIso: string, authorId?: string, range?: ProductivityRange) =>
    computeProductivity(rangeStartIso, rangeEndIso, authorId, range),
  ["analytics-productivity"],
  { revalidate: PRODUCTIVITY_CACHE_TTL_SECONDS, tags: ["analytics-productivity"] },
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
    const { start, end } = resolvePeriod(searchParams.get("year"), searchParams.get("month"));
    const authorId = searchParams.get("author") || undefined;
    const rangeParam = searchParams.get("range");
    const range: ProductivityRange | undefined =
      rangeParam === "day" || rangeParam === "week" || rangeParam === "month" ? rangeParam : undefined;

    const data = await getCachedProductivity(start.toISOString(), end.toISOString(), authorId, range);

    return NextResponse.json(
      data,
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
