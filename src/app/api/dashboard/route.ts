import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const baseWhere: any = { status: { not: "ARCHIVED" } };
    if (user.role === "WRITER") {
      baseWhere.authorId = user.id;
    }

    // Hitung Statistik Berdasarkan Status
    const totalPosts = await prisma.post.count({ where: baseWhere });
    const totalPublished = await prisma.post.count({ where: { ...baseWhere, status: "PUBLISHED" } });
    const totalDrafts = await prisma.post.count({ where: { ...baseWhere, status: "DRAFT" } });
    const totalInReview = await prisma.post.count({ where: { ...baseWhere, status: "IN_REVIEW" } });
    const totalScheduled = await prisma.post.count({ where: { ...baseWhere, status: "SCHEDULED" } });

    // Published Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalPublishedToday = await prisma.post.count({
      where: {
        ...(user.role === "WRITER" ? { authorId: user.id } : {}),
        status: "PUBLISHED",
        publishedAt: {
          gte: today
        }
      }
    });

    // Ambil Berita Terbaru (Limit 10)
    const recentPosts = await prisma.post.findMany({
      where: {
        ...(user.role === "WRITER" ? { authorId: user.id } : {}),
        status: { not: "ARCHIVED" }
      },
      take: 10,
      orderBy: [
        { createdAt: "desc" }
      ],
      include: {
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } }
      }
    });

    // Ambil Berita Perlu Review (Limit 5)
    const inReviewPosts = await prisma.post.findMany({
      where: { ...(user.role === "WRITER" ? { authorId: user.id } : {}), status: "IN_REVIEW" },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { name: true } }
      }
    });

    return NextResponse.json({
      role: user.role,
      stats: {
        totalPosts,
        totalPublished,
        totalDrafts,
        totalInReview,
        totalScheduled,
        totalPublishedToday
      },
      recentPosts,
      inReviewPosts
    });

  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
