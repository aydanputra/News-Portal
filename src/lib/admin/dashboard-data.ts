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

  const [
    totalPosts,
    totalPublished,
    totalDrafts,
    totalInReview,
    totalScheduled,
    totalPublishedToday,
    recentPosts,
    inReviewPosts,
  ] = await Promise.all([
    prisma.post.count({ where: baseWhere }),
    prisma.post.count({ where: { ...baseWhere, status: "PUBLISHED", published: true } }),
    prisma.post.count({ where: { ...baseWhere, status: "DRAFT" } }),
    prisma.post.count({ where: { ...baseWhere, status: "IN_REVIEW" } }),
    prisma.post.count({ where: { ...baseWhere, status: "SCHEDULED" } }),
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
