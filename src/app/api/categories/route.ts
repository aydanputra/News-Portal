import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { cookies } from "next/headers";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// GET: Ambil kategori dalam bentuk TREE
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });

    // Hitung jumlah berita per kategori (semua status)
    const postGroups = await prisma.post.groupBy({
      by: ["categoryId"],
      _count: { _all: true }
    });
    const directCount: Record<string, number> = {};
    postGroups.forEach((g: { categoryId: string | null; _count: { _all: number } }) => {
      if (g.categoryId) directCount[g.categoryId] = g._count._all;
    });

    // Bangun adjacency untuk aggregate descendant count
    const childrenMap = new Map<string, string[]>();
    categories.forEach((cat: Category) => {
      if (cat.parentId) {
        const arr = childrenMap.get(cat.parentId) || [];
        arr.push(cat.id);
        childrenMap.set(cat.parentId, arr);
      }
    });

    const aggregateCount = (id: string): number => {
      const own = directCount[id] || 0;
      const childs = childrenMap.get(id) || [];
      if (childs.length === 0) return own;
      return own + childs.reduce((sum, cid) => sum + aggregateCount(cid), 0);
    };

    // Ubah ke bentuk Tree
    const categoryTree = categories
      .filter((cat: Category) => !cat.parentId) // Ambil Parent
      .map((parent: Category) => {
        const children = categories.filter((child: Category) => child.parentId === parent.id);
        return {
          ...parent,
          postsCount: aggregateCount(parent.id),
          children: children.map((child: any) => ({
            ...child,
            postsCount: directCount[child.id] || 0
          })),
        };
      });

    return NextResponse.json(categoryTree);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json({ error: "Gagal mengambil kategori" }, { status: 500 });
  }
}

// POST: Buat Kategori Baru (Parent/Child)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    // Hanya ADMIN & EDITOR yang boleh buat kategori
    if (!user || user.role === "WRITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, parentId } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    let slug = slugify(name);
    
    // Cek slug unik
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // Cek circular parent jika parentId ada (untuk POST ini jarang terjadi circular, tapi validasi parentId penting)
    if (parentId) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Parent kategori tidak ditemukan" }, { status: 400 });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("ERROR POST CATEGORY:", error);
    return NextResponse.json({ error: "Gagal membuat kategori" }, { status: 500 });
  }
}
