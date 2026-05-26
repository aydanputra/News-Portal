import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseDateOnly(value: string | null) {
  const v = String(value || "").trim();
  if (!v) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const d = new Date(`${v}T00:00:00.000`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["EDITOR", "ADMIN", "SUPER_ADMIN"].includes(String((user as any)?.role || ""))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startParam = parseDateOnly(searchParams.get("start"));
    const endParam = parseDateOnly(searchParams.get("end"));

    const todayDay = startOfDay(new Date());

    let rangeStart = startOfDay(addDays(todayDay, -29));
    let rangeEnd = endOfDay(new Date());

    if (startParam && endParam) {
      const startDay = startOfDay(startParam);
      const endDay = startOfDay(endParam);
      const cappedEnd = endDay > todayDay ? todayDay : endDay;
      if (startDay > cappedEnd) {
        return NextResponse.json({ error: "Rentang tanggal tidak valid" }, { status: 400 });
      }
      rangeStart = startDay;
      rangeEnd = endOfDay(cappedEnd);
    } else {
      const daysRaw = Number(searchParams.get("days") || "30");
      const days = Number.isFinite(daysRaw) ? Math.min(90, Math.max(1, Math.floor(daysRaw))) : 30;
      rangeStart = startOfDay(addDays(todayDay, -(days - 1)));
      rangeEnd = endOfDay(todayDay);
    }

    const rangeEndDay = startOfDay(new Date(rangeEnd));
    const rangeDays = Math.floor((rangeEndDay.getTime() - rangeStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
    const days = Math.min(90, Math.max(1, rangeDays));

    if (rangeDays > 90) {
      rangeStart = startOfDay(addDays(rangeEndDay, -(days - 1)));
    }

    const snapshotEndDay = rangeEndDay;
    const snapshotStartDay = addDays(rangeStart, -1);

    const snapshotDayRows = await prisma.postMetricSnapshot.groupBy({
      by: ["day"],
      where: { day: { gte: snapshotStartDay, lte: snapshotEndDay } },
      _count: { _all: true },
      orderBy: { day: "asc" },
    });
    const snapshotDaysPresent = new Set<string>(
      (snapshotDayRows || []).map((r: any) => toIsoDate(r.day as any)),
    );
    const expectedSnapshotDays: string[] = [];
    for (let i = 0; i <= days; i++) expectedSnapshotDays.push(toIsoDate(addDays(snapshotStartDay, i)));
    const missingSnapshotDays = expectedSnapshotDays.filter((d) => !snapshotDaysPresent.has(d));

    const [backlogDraft, backlogInReview, backlogRejected, backlogScheduled] = await Promise.all([
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.post.count({ where: { status: "IN_REVIEW" } }),
      prisma.post.count({ where: { status: "REJECTED" } }),
      prisma.post.count({ where: { status: "SCHEDULED" } }),
    ]);

    const [publishedCount, commentsCount, dailyRows] = await Promise.all([
      prisma.post.count({
        where: {
          status: "PUBLISHED",
          published: true,
          publishedAt: { gte: rangeStart, lte: rangeEnd },
        },
      }),
      prisma.comment.count({
        where: {
          createdAt: { gte: rangeStart, lte: rangeEnd },
          post: { status: "PUBLISHED", published: true },
        },
      }),
      prisma.postMetricSnapshot.groupBy({
        by: ["day"],
        where: { day: { gte: snapshotStartDay, lte: snapshotEndDay } },
        _sum: { views: true, viewsBase: true },
        orderBy: { day: "asc" },
      }),
    ]);

    const totalsByDay = new Map<string, number>();
    for (const row of dailyRows) {
      const dayKey = toIsoDate(row.day as any);
      const total = Number((row as any)?._sum?.views || 0) + Number((row as any)?._sum?.viewsBase || 0);
      totalsByDay.set(dayKey, Number.isFinite(total) ? total : 0);
    }

    const dailyViews: { day: string; views: number }[] = [];
    let totalViews = 0;
    for (let i = 1; i <= days; i++) {
      const day = addDays(snapshotStartDay, i);
      const prevDay = addDays(snapshotStartDay, i - 1);
      const dayKey = toIsoDate(day);
      const prevKey = toIsoDate(prevDay);
      const dayTotal = totalsByDay.get(dayKey);
      const prevTotal = totalsByDay.get(prevKey);
      const delta =
        typeof dayTotal === "number" && typeof prevTotal === "number"
          ? Math.max(0, dayTotal - prevTotal)
          : 0;
      dailyViews.push({ day: dayKey, views: delta });
      totalViews += delta;
    }

    const avgViewsPerPost = publishedCount > 0 ? Math.round(totalViews / publishedCount) : 0;

    const topPosts = await prisma.$queryRaw<any[]>`
      WITH start_snap AS (
        SELECT "postId", ("views" + "viewsBase")::int AS total
        FROM "PostMetricSnapshot"
        WHERE day = ${snapshotStartDay}
      ),
      end_snap AS (
        SELECT "postId", ("views" + "viewsBase")::int AS total
        FROM "PostMetricSnapshot"
        WHERE day = ${snapshotEndDay}
      )
      SELECT
        p.id,
        p.title,
        p."publishedAt",
        GREATEST(
          0,
          COALESCE(es.total, (p.views + p."viewsBase")::int) - COALESCE(ss.total, 0)
        )::int AS "viewsTotal",
        a.name AS "authorName",
        c.name AS "categoryName",
        e.name AS "editorName"
      FROM "Post" p
      JOIN "User" a ON a.id = p."authorId"
      JOIN "Category" c ON c.id = p."categoryId"
      LEFT JOIN "User" e ON e.id = p."approvedById"
      LEFT JOIN start_snap ss ON ss."postId" = p.id
      LEFT JOIN end_snap es ON es."postId" = p.id
      WHERE p.status = 'PUBLISHED'
        AND p.published = true
        AND p."publishedAt" >= ${rangeStart}
        AND p."publishedAt" <= ${rangeEnd}
      ORDER BY "viewsTotal" DESC
      LIMIT 10
    `;

    const topAuthors = await prisma.$queryRaw<any[]>`
      WITH start_snap AS (
        SELECT "postId", ("views" + "viewsBase")::int AS total
        FROM "PostMetricSnapshot"
        WHERE day = ${snapshotStartDay}
      ),
      end_snap AS (
        SELECT "postId", ("views" + "viewsBase")::int AS total
        FROM "PostMetricSnapshot"
        WHERE day = ${snapshotEndDay}
      )
      SELECT
        a.id,
        a.name,
        COUNT(*)::int AS "posts",
        SUM(
          GREATEST(
            0,
            COALESCE(es.total, (p.views + p."viewsBase")::int) - COALESCE(ss.total, 0)
          )
        )::int AS "viewsTotal"
      FROM "Post" p
      JOIN "User" a ON a.id = p."authorId"
      LEFT JOIN start_snap ss ON ss."postId" = p.id
      LEFT JOIN end_snap es ON es."postId" = p.id
      WHERE p.status = 'PUBLISHED'
        AND p.published = true
        AND p."publishedAt" >= ${rangeStart}
        AND p."publishedAt" <= ${rangeEnd}
      GROUP BY a.id, a.name
      ORDER BY "viewsTotal" DESC
      LIMIT 10
    `;

    const topEditors = await prisma.$queryRaw<any[]>`
      WITH start_snap AS (
        SELECT "postId", ("views" + "viewsBase")::int AS total
        FROM "PostMetricSnapshot"
        WHERE day = ${snapshotStartDay}
      ),
      end_snap AS (
        SELECT "postId", ("views" + "viewsBase")::int AS total
        FROM "PostMetricSnapshot"
        WHERE day = ${snapshotEndDay}
      )
      SELECT
        e.id,
        e.name,
        COUNT(*)::int AS "posts",
        SUM(
          GREATEST(
            0,
            COALESCE(es.total, (p.views + p."viewsBase")::int) - COALESCE(ss.total, 0)
          )
        )::int AS "viewsTotal",
        (AVG(EXTRACT(EPOCH FROM (p."publishedAt" - p."createdAt"))) / 3600.0)::float AS "avgHoursToPublish",
        (AVG(EXTRACT(EPOCH FROM (p."publishedAt" - p."submittedForReviewAt"))) / 3600.0)::float AS "avgReviewHours"
      FROM "Post" p
      JOIN "User" e ON e.id = p."approvedById"
      LEFT JOIN start_snap ss ON ss."postId" = p.id
      LEFT JOIN end_snap es ON es."postId" = p.id
      WHERE p.status = 'PUBLISHED'
        AND p.published = true
        AND p."approvedById" IS NOT NULL
        AND p."publishedAt" >= ${rangeStart}
        AND p."publishedAt" <= ${rangeEnd}
      GROUP BY e.id, e.name
      ORDER BY "viewsTotal" DESC
      LIMIT 10
    `;

    const topCategories = await prisma.$queryRaw<any[]>`
      WITH start_snap AS (
        SELECT "postId", ("views" + "viewsBase")::int AS total
        FROM "PostMetricSnapshot"
        WHERE day = ${snapshotStartDay}
      ),
      end_snap AS (
        SELECT "postId", ("views" + "viewsBase")::int AS total
        FROM "PostMetricSnapshot"
        WHERE day = ${snapshotEndDay}
      )
      SELECT
        c.id,
        c.name,
        COUNT(*)::int AS "posts",
        SUM(
          GREATEST(
            0,
            COALESCE(es.total, (p.views + p."viewsBase")::int) - COALESCE(ss.total, 0)
          )
        )::int AS "viewsTotal"
      FROM "Post" p
      JOIN "Category" c ON c.id = p."categoryId"
      LEFT JOIN start_snap ss ON ss."postId" = p.id
      LEFT JOIN end_snap es ON es."postId" = p.id
      WHERE p.status = 'PUBLISHED'
        AND p.published = true
        AND p."publishedAt" >= ${rangeStart}
        AND p."publishedAt" <= ${rangeEnd}
      GROUP BY c.id, c.name
      ORDER BY "viewsTotal" DESC
      LIMIT 10
    `;

    const topCategory = Array.isArray(topCategories) && topCategories.length > 0 ? topCategories[0] : null;
    const topAuthor = Array.isArray(topAuthors) && topAuthors.length > 0 ? topAuthors[0] : null;
    const topEditor = Array.isArray(topEditors) && topEditors.length > 0 ? topEditors[0] : null;

    const [writerPerf, editorPerf, editorAssigned, editorAssignedStale] = await Promise.all([
      prisma.$queryRaw<any[]>`
        WITH start_snap AS (
          SELECT "postId", ("views" + "viewsBase")::int AS total
          FROM "PostMetricSnapshot"
          WHERE day = ${snapshotStartDay}
        ),
        end_snap AS (
          SELECT "postId", ("views" + "viewsBase")::int AS total
          FROM "PostMetricSnapshot"
          WHERE day = ${snapshotEndDay}
        )
        SELECT
          a.id,
          a.name,
          COUNT(*)::int AS "posts",
          SUM(
            GREATEST(
              0,
              COALESCE(es.total, (p.views + p."viewsBase")::int) - COALESCE(ss.total, 0)
            )
          )::int AS "viewsTotal",
          (AVG(EXTRACT(EPOCH FROM (p."publishedAt" - p."createdAt"))) / 3600.0)::float AS "avgHoursToPublish"
        FROM "Post" p
        JOIN "User" a ON a.id = p."authorId"
        LEFT JOIN start_snap ss ON ss."postId" = p.id
        LEFT JOIN end_snap es ON es."postId" = p.id
        WHERE p.status = 'PUBLISHED'
          AND p.published = true
          AND p."publishedAt" >= ${rangeStart}
          AND p."publishedAt" <= ${rangeEnd}
        GROUP BY a.id, a.name
        ORDER BY "viewsTotal" DESC
        LIMIT 20
      `,
      prisma.$queryRaw<any[]>`
        WITH start_snap AS (
          SELECT "postId", ("views" + "viewsBase")::int AS total
          FROM "PostMetricSnapshot"
          WHERE day = ${snapshotStartDay}
        ),
        end_snap AS (
          SELECT "postId", ("views" + "viewsBase")::int AS total
          FROM "PostMetricSnapshot"
          WHERE day = ${snapshotEndDay}
        )
        SELECT
          e.id,
          e.name,
          COUNT(*)::int AS "posts",
          SUM(
            GREATEST(
              0,
              COALESCE(es.total, (p.views + p."viewsBase")::int) - COALESCE(ss.total, 0)
            )
          )::int AS "viewsTotal",
          (AVG(EXTRACT(EPOCH FROM (p."publishedAt" - p."createdAt"))) / 3600.0)::float AS "avgHoursToPublish",
          (AVG(EXTRACT(EPOCH FROM (p."publishedAt" - p."submittedForReviewAt"))) / 3600.0)::float AS "avgReviewHours"
        FROM "Post" p
        JOIN "User" e ON e.id = p."approvedById"
        LEFT JOIN start_snap ss ON ss."postId" = p.id
        LEFT JOIN end_snap es ON es."postId" = p.id
        WHERE p.status = 'PUBLISHED'
          AND p.published = true
          AND p."approvedById" IS NOT NULL
          AND p."publishedAt" >= ${rangeStart}
          AND p."publishedAt" <= ${rangeEnd}
        GROUP BY e.id, e.name
        ORDER BY "viewsTotal" DESC
        LIMIT 20
      `,
      prisma.$queryRaw<any[]>`
        SELECT
          prt."editorId" as id,
          COUNT(*)::int AS "assignedInReview"
        FROM "PostReviewTarget" prt
        JOIN "Post" p ON p.id = prt."postId"
        WHERE p.status = 'IN_REVIEW'
        GROUP BY prt."editorId"
      `,
      prisma.$queryRaw<any[]>`
        SELECT
          prt."editorId" as id,
          COUNT(*)::int AS "assignedInReviewStale"
        FROM "PostReviewTarget" prt
        JOIN "Post" p ON p.id = prt."postId"
        WHERE p.status = 'IN_REVIEW'
          AND COALESCE(p."submittedForReviewAt", p."updatedAt") < NOW() - interval '24 hours'
        GROUP BY prt."editorId"
      `,
    ]);

    const assignedMap = new Map<string, number>();
    for (const r of Array.isArray(editorAssigned) ? editorAssigned : []) {
      const id = String((r as any)?.id || "").trim();
      const n = Number((r as any)?.assignedInReview || 0);
      if (id) assignedMap.set(id, Number.isFinite(n) ? n : 0);
    }

    const assignedStaleMap = new Map<string, number>();
    for (const r of Array.isArray(editorAssignedStale) ? editorAssignedStale : []) {
      const id = String((r as any)?.id || "").trim();
      const n = Number((r as any)?.assignedInReviewStale || 0);
      if (id) assignedStaleMap.set(id, Number.isFinite(n) ? n : 0);
    }

    const writers = (Array.isArray(writerPerf) ? writerPerf : []).map((w) => {
      const posts = Number((w as any)?.posts || 0);
      const viewsTotal = Number((w as any)?.viewsTotal || 0);
      const avgViews = posts > 0 ? Math.round(viewsTotal / posts) : 0;
      return {
        id: String((w as any)?.id || ""),
        name: String((w as any)?.name || ""),
        posts,
        viewsTotal,
        avgViewsPerPost: avgViews,
        avgHoursToPublish: typeof (w as any)?.avgHoursToPublish === "number" ? (w as any).avgHoursToPublish : null,
      };
    });

    const editors = (Array.isArray(editorPerf) ? editorPerf : []).map((e) => {
      const id = String((e as any)?.id || "");
      const posts = Number((e as any)?.posts || 0);
      const viewsTotal = Number((e as any)?.viewsTotal || 0);
      const avgViews = posts > 0 ? Math.round(viewsTotal / posts) : 0;
      return {
        id,
        name: String((e as any)?.name || ""),
        posts,
        viewsTotal,
        avgViewsPerPost: avgViews,
        avgHoursToPublish: typeof (e as any)?.avgHoursToPublish === "number" ? (e as any).avgHoursToPublish : null,
        avgReviewHours: typeof (e as any)?.avgReviewHours === "number" ? (e as any).avgReviewHours : null,
        assignedInReview: assignedMap.get(id) || 0,
        assignedInReviewStale: assignedStaleMap.get(id) || 0,
      };
    });

    return NextResponse.json({
      range: {
        days,
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
      },
      snapshot: {
        startDay: snapshotStartDay.toISOString(),
        endDay: snapshotEndDay.toISOString(),
        expectedDays: expectedSnapshotDays.length,
        availableDays: snapshotDaysPresent.size,
        missingDays: missingSnapshotDays,
      },
      kpis: {
        totalViews,
        totalPublished: publishedCount,
        avgViewsPerPost,
        totalComments: commentsCount,
        backlog: {
          draft: backlogDraft,
          inReview: backlogInReview,
          rejected: backlogRejected,
          scheduled: backlogScheduled,
        },
        topCategory: topCategory ? { id: topCategory.id, name: topCategory.name, viewsTotal: topCategory.viewsTotal } : null,
        topAuthor: topAuthor ? { id: topAuthor.id, name: topAuthor.name, viewsTotal: topAuthor.viewsTotal } : null,
        topEditor: topEditor ? { id: topEditor.id, name: topEditor.name, viewsTotal: topEditor.viewsTotal } : null,
      },
      trends: { dailyViews },
      top: {
        posts: topPosts || [],
        authors: topAuthors || [],
        editors: topEditors || [],
        categories: topCategories || [],
      },
      people: {
        writers,
        editors,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Server Error" }, { status: 500 });
  }
}
