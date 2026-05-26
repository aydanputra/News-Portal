import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-guards";
import { sanitizePageContent } from "@/lib/sanitizer";

const createPageSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  slug: z.string().min(1, "Slug wajib diisi"),
  content: z.string().optional(),
  published: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  featuredImage: z.string().optional(),
  template: z.string().default("default"),
  blocks: z.any().optional(),
});

const normalizeSlug = (value: string) =>
  value
    .trim()
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .toLowerCase();

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "kategori",
  "category",
  "tag",
  "tags",
  "login",
  "logout",
  "register",
  "search",
  "sitemap.xml",
  "robots.txt",
  "feed",
  "rss",
  "uploads",
]);

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const publishedOnly = searchParams.get("published") === "true";

  try {
    const pages = await prisma.page.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(pages);
  } catch (error) {
    console.error("GET /api/pages error:", error);
    return NextResponse.json({ error: "Gagal mengambil halaman" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPageSchema.parse(body);
    const normalizedSlug = normalizeSlug(validatedData.slug);

    if (RESERVED_SLUGS.has(normalizedSlug)) {
      return NextResponse.json({ error: "Slug tidak boleh menggunakan kata yang dipakai sistem" }, { status: 400 });
    }

    const conflictingCategory = await prisma.category.findUnique({ where: { slug: normalizedSlug } });
    if (conflictingCategory) {
      return NextResponse.json({ error: "Slug bentrok dengan kategori yang sudah ada" }, { status: 400 });
    }

    // Cek slug unik
    const existing = await prisma.page.findUnique({ where: { slug: normalizedSlug } });
    if (existing) {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 });
    }

    const page = await prisma.page.create({
      data: {
        ...validatedData,
        slug: normalizedSlug,
        content: typeof validatedData.content === "string" ? sanitizePageContent(validatedData.content) : undefined,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "ValidationError", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/pages error:", error);
    return NextResponse.json({ error: "Gagal membuat halaman" }, { status: 500 });
  }
}
