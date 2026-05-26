import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { PostStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["ADMIN", "SUPER_ADMIN"].includes(String((user as any)?.role || ""))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const day = startOfDay(new Date());

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

    return NextResponse.json({ success: true, day: day.toISOString(), count: publishedPosts.length });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Snapshot failed" }, { status: 500 });
  }
}

