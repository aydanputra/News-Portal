import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const day = startOfDay(now);

    const publishedPosts = await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED, published: true },
      select: { id: true, views: true, viewsBase: true },
    });

    const prismaAny = prisma as any;
    await prisma.$transaction([
      prismaAny.postMetricSnapshot.deleteMany({ where: { day } }),
      prismaAny.postMetricSnapshot.createMany({
        data: publishedPosts.map((p) => ({
          postId: p.id,
          day,
          views: typeof p.views === "number" && Number.isFinite(p.views) ? Math.max(0, Math.floor(p.views)) : 0,
          viewsBase:
            typeof p.viewsBase === "number" && Number.isFinite(p.viewsBase) ? Math.max(0, Math.floor(p.viewsBase)) : 0,
        })),
      }),
    ]);

    return NextResponse.json({
      success: true,
      day: day.toISOString(),
      count: publishedPosts.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Snapshot failed" }, { status: 500 });
  }
}
