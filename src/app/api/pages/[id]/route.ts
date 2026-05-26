import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api-guards";
import { sanitizePageContent } from "@/lib/sanitizer";

const updatePageSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").optional(),
  slug: z.string().min(1, "Slug wajib diisi").optional(),
  content: z.string().optional(),
  published: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  featuredImage: z.string().optional().nullable(),
  template: z.string().optional(),
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

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const page = await prisma.page.findUnique({
      where: { id },
    });

    if (!page) {
      return NextResponse.json({ error: "Halaman tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("GET /api/pages/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengambil halaman" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    const validatedData = updatePageSchema.parse(body);

    // Cek jika slug diubah dan sudah ada
    if (validatedData.slug) {
      const normalizedSlug = normalizeSlug(validatedData.slug);

      if (RESERVED_SLUGS.has(normalizedSlug)) {
        return NextResponse.json({ error: "Slug tidak boleh menggunakan kata yang dipakai sistem" }, { status: 400 });
      }

      const conflictingCategory = await prisma.category.findUnique({ where: { slug: normalizedSlug } });
      if (conflictingCategory) {
        return NextResponse.json({ error: "Slug bentrok dengan kategori yang sudah ada" }, { status: 400 });
      }

      const existing = await prisma.page.findFirst({
        where: {
          slug: normalizedSlug,
          NOT: { id },
        },
      });
      if (existing) {
        return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 });
      }

      validatedData.slug = normalizedSlug;
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        ...validatedData,
        content:
          typeof validatedData.content === "string" ? sanitizePageContent(validatedData.content) : validatedData.content,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "ValidationError", details: error.errors }, { status: 400 });
    }
    console.error("PUT /api/pages/[id] error:", error);
    return NextResponse.json({ error: "Gagal mengupdate halaman" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await prisma.page.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Halaman berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/pages/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus halaman" }, { status: 500 });
  }
}
