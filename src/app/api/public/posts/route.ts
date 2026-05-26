import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil daftar berita PUBLISHED saja
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const q = searchParams.get("q");
    
    // Pagination & Filtering Params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const categorySlug = searchParams.get("category");
    const tagSlug = searchParams.get("tag");
    const sortOrder = searchParams.get("sort") || "latest"; // latest, oldest, popular
    const excludeId = searchParams.get("excludeId"); // For excluding current post in related posts

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
      const post = await prisma.post.findFirst({
        where: { 
          slug,
          ...baseWhereClause
        },
        include: {
          category: true,
          featuredImage: { select: { fileUrl: true } },
          tags: true,
          author: { select: { name: true, avatar: true, banner: true } },
        },
      });

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
      whereClause.AND = [
        ...(Array.isArray(whereClause.AND) ? whereClause.AND : []),
        {
          OR: [
            { category: { slug: categorySlug } },
            { postCategories: { some: { category: { slug: categorySlug } } } },
          ],
        },
      ];
    }

    if (tagSlug) {
      whereClause.tags = { some: { slug: tagSlug } };
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
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          category: true,
          featuredImage: { select: { fileUrl: true } },
          author: { select: { name: true, avatar: true, banner: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.post.count({ where: whereClause })
    ]);

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
