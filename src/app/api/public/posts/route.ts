import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { z } from "zod";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const searchParamsSchema = z.object({
  slug: z.string().trim().min(1).optional(),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(30).default(10),
  category: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  sort: z.enum(["latest", "oldest", "popular", "random"]).default("latest"),
  excludeId: z.string().trim().optional(),
});

const getTagIdBySlug = async (slug: string): Promise<string | null> => {
  const cached = unstable_cache(
    async () => {
      const row = await prisma.tag.findUnique({ where: { slug }, select: { id: true } });
      return row?.id || null;
    },
    [`tag-id:${slug}`],
    { tags: ["posts"], revalidate: 3600 },
  );
  return cached();
};

const getCategoryIdBySlug = async (slug: string): Promise<string | null> => {
  const cached = unstable_cache(
    async () => {
      const row = await prisma.category.findUnique({ where: { slug }, select: { id: true } });
      return row?.id || null;
    },
    [`category-id:${slug}`],
    { tags: ["categories"], revalidate: 3600 },
  );
  return cached();
};

// GET: Ambil daftar berita PUBLISHED saja
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = searchParamsSchema.parse({
      slug: searchParams.get("slug") || undefined,
      q: searchParams.get("q") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      category: searchParams.get("category") || undefined,
      tag: searchParams.get("tag") || undefined,
      sort: searchParams.get("sort") || undefined,
      excludeId: searchParams.get("excludeId") || undefined,
    });
    const slug = parsed.slug;
    const q = parsed.q;
    const page = parsed.page;
    const limit = parsed.limit;
    const categorySlug = parsed.category;
    const tagSlug = parsed.tag;
    const sortOrder = parsed.sort;
    const excludeId = parsed.excludeId;

    const skip = (page - 1) * limit;

    // Logika Filter: Published = true DAN (publishedAt <= NOW atau publishedAt IS NULL)
    // DAN Status harus PUBLISHED atau SCHEDULED (yang sudah lewat waktu)
    const now = new Date();

    const baseWhereClause = {
      OR: [
        { status: "PUBLISHED" as const },
        { 
          status: "SCHEDULED" as const,
          publishedAt: { lte: now }
        }
      ]
    };

    // Jika ada slug, cari 1 berita detail
    if (slug) {
      const cached = unstable_cache(
        async () => {
          return await prisma.post.findFirst({
            where: {
              slug,
              ...baseWhereClause,
            },
            include: {
              category: true,
              featuredImage: { select: { fileUrl: true } },
              tags: true,
              author: { select: { name: true, avatar: true, banner: true } },
            },
          });
        },
        [`public-post:${slug}`],
        { tags: ["posts", `article-${slug}`], revalidate: 300 },
      );
      const post = await cached();

      if (!post) return NextResponse.json({ error: "Berita tidak ditemukan" }, { status: 404 });
      
      // Increment views (simple implementation)
      // Note: In production, this should be debounced or handled separately
      // await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
      
      return NextResponse.json(post);
    }

    // Build Where Clause
    const whereClause: any = {
      ...baseWhereClause,
    };

    if (categorySlug && categorySlug !== "all") {
      const categoryId = await getCategoryIdBySlug(categorySlug);
      if (!categoryId) {
        return NextResponse.json({
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 1,
          },
        });
      }
      whereClause.AND = [
        ...(Array.isArray(whereClause.AND) ? whereClause.AND : []),
        {
          OR: [
            { categoryId },
            { postCategories: { some: { categoryId } } },
          ],
        },
      ];
    }

    if (tagSlug) {
      const tagId = await getTagIdBySlug(tagSlug);
      if (!tagId) {
        return NextResponse.json({
          data: [],
          meta: {
            total: 0,
            page,
            limit,
            totalPages: 1,
          },
        });
      }
      whereClause.tags = { some: { id: tagId } };
    }

    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    if (q && q.trim()) {
      const query = q.trim();
      whereClause.AND = [
        ...(Array.isArray(whereClause.AND) ? whereClause.AND : []),
        {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { excerpt: { contains: query, mode: "insensitive" as const } },
          ],
        },
      ];
    }

    // Build Order Clause
    let orderBy: any = { publishedAt: "desc" };
    if (sortOrder === "oldest") {
      orderBy = { publishedAt: "asc" };
    } else if (sortOrder === "popular") {
      orderBy = { views: "desc" };
    } else if (sortOrder === "random") {
      // Prisma doesn't support random natively efficiently, fallback to latest or handle in app
      orderBy = { publishedAt: "desc" }; 
    }

    // Get Data
    const cacheKey = [
      "public-posts",
      `page:${page}`,
      `limit:${limit}`,
      `category:${categorySlug || ""}`,
      `tag:${tagSlug || ""}`,
      `sort:${sortOrder}`,
      `exclude:${excludeId || ""}`,
      `q:${q || ""}`,
    ].join("|");
    const cached = unstable_cache(
      async () => {
        const [posts, total] = await Promise.all([
          prisma.post.findMany({
            where: whereClause,
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
              category: true,
              featuredImage: { select: { fileUrl: true, width: true, height: true } },
              author: { select: { name: true, avatar: true, banner: true } },
            },
            orderBy,
            skip,
            take: limit,
          }),
          prisma.post.count({ where: whereClause }),
        ]);
        return { posts, total };
      },
      [cacheKey],
      { tags: ["posts"], revalidate },
    );
    const { posts, total } = await cached();

    return NextResponse.json({
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
