import { prisma } from "@/lib/prisma";

type DashboardUser = {
  id: string;
  role: string;
};

export type DashboardData = {
  role: string;
  stats: {
    totalPosts: number;
    totalPublished: number;
    totalDrafts: number;
    totalInReview: number;
    totalScheduled: number;
    totalPublishedToday: number;
  };
  recentPosts: Array<{
    id: string;
    title: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    published: boolean;
    publishedAt: Date | null;
    status: string;
    type: string | null;
    image: string | null;
    author: { name: string | null } | null;
    category: { name: string; slug: string } | null;
    featuredImage: { fileUrl: string } | null;
  }>;
  inReviewPosts: Array<{
    id: string;
    title: string;
    updatedAt: Date;
    author: { name: string | null } | null;
  }>;
};

export async function getDashboardDataForUser(user: DashboardUser): Promise<DashboardData> {
  const baseWhere: Record<string, unknown> = { status: { not: "ARCHIVED" } };
  if (user.role === "WRITER") {
    baseWhere.authorId = user.id;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [statusCounts, totalPublishedToday, recentPosts, inReviewPosts] = await Promise.all([
    prisma.post.groupBy({
      by: ["status", "published"],
      where: baseWhere,
      _count: { _all: true },
    }),
    prisma.post.count({
      where: {
        ...(user.role === "WRITER" ? { authorId: user.id } : {}),
        status: "PUBLISHED",
        published: true,
        publishedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    }),
    prisma.post.findMany({
      where: {
        ...(user.role === "WRITER" ? { authorId: user.id } : {}),
        status: { not: "ARCHIVED" },
      },
      take: 10,
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        published: true,
        publishedAt: true,
        status: true,
        type: true,
        image: true,
        author: { select: { name: true } },
        category: { select: { name: true, slug: true } },
        featuredImage: { select: { fileUrl: true } },
      },
    }),
    prisma.post.findMany({
      where: {
        ...(user.role === "WRITER" ? { authorId: user.id } : {}),
        status: "IN_REVIEW",
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        author: { select: { name: true } },
      },
    }),
  ]);

  // Satu groupBy menggantikan 5 count terpisah (totalPosts/totalPublished/totalDrafts/totalInReview/totalScheduled)
  // agar query DB berkurang tanpa mengubah hasil.
  const statusCountMap = new Map<string, number>();
  for (const row of statusCounts) {
    statusCountMap.set(`${row.status}|${row.published}`, row._count._all);
  }
  const countByStatus = (status: string) =>
    (statusCountMap.get(`${status}|true`) ?? 0) + (statusCountMap.get(`${status}|false`) ?? 0);

  const totalPosts = statusCounts.reduce((acc, row) => acc + row._count._all, 0);
  const totalPublished = statusCountMap.get("PUBLISHED|true") ?? 0;
  const totalDrafts = countByStatus("DRAFT");
  const totalInReview = countByStatus("IN_REVIEW");
  const totalScheduled = countByStatus("SCHEDULED");

  return {
    role: user.role,
    stats: {
      totalPosts,
      totalPublished,
      totalDrafts,
      totalInReview,
      totalScheduled,
      totalPublishedToday,
    },
    recentPosts,
    inReviewPosts,
  };
}
