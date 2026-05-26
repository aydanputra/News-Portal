
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { cookies } from "next/headers";

// PUT: Edit Kategori
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user || user.role === "WRITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, parentId } = await request.json();
    
    // Validasi Circular Dependency: Parent tidak boleh diri sendiri
    if (parentId && parentId === id) {
      return NextResponse.json({ error: "Kategori tidak bisa menjadi parent untuk dirinya sendiri" }, { status: 400 });
    }

    // Validasi Circular: Parent tidak boleh salah satu dari anak-anaknya (Deep Check idealnya, tapi 1 level dulu cukup untuk sekarang)
    // Jika A -> B, maka B tidak boleh parentId = A.
    // Kita cek apakah parentId yang dipilih adalah child dari ID ini.
    if (parentId) {
      const children = await prisma.category.findMany({ where: { parentId: id } });
      const isChild = children.find((c: { id: string }) => c.id === parentId);
      if (isChild) {
        return NextResponse.json({ error: "Circular Dependency Detected: Tidak bisa memilih child sebagai parent." }, { status: 400 });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: slugify(name), // Regenerate slug or keep old? Usually better to regenerate if name changes, or keep old to not break SEO. Let's regenerate for now as per requirement "Slug auto-generate".
        parentId: parentId || null,
      },
    });

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Gagal update kategori" }, { status: 500 });
  }
}

// DELETE: Hapus Kategori
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    // Hanya ADMIN yang boleh hapus kategori (sesuai requirement)
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya Admin yang boleh menghapus kategori" }, { status: 403 });
    }

    // Cek apakah punya child
    const hasChildren = await prisma.category.count({ where: { parentId: id } });
    if (hasChildren > 0) {
      return NextResponse.json({ error: "Gagal: Kategori ini memiliki sub-kategori. Hapus sub-kategori terlebih dahulu." }, { status: 400 });
    }

    // Cek apakah dipakai berita
    const hasPosts = await prisma.post.count({
      where: {
        OR: [
          { categoryId: id },
          { postCategories: { some: { categoryId: id } } },
        ],
      },
    });
    if (hasPosts > 0) {
      return NextResponse.json({ error: "Gagal: Kategori ini masih digunakan oleh berita." }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}
