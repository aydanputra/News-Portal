
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { unlink } from "fs/promises";
import path from "path";

// GET: List Media
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limitRaw = parseInt(searchParams.get("limit") || "25");
    const limit = Number.isFinite(limitRaw) ? Math.min(200, Math.max(1, limitRaw)) : 25;
    const skip = (page - 1) * limit;
    const type = (searchParams.get("type") || "all").toLowerCase();
    const q = (searchParams.get("q") || "").trim();
    const sort = (searchParams.get("sort") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const month = (searchParams.get("month") || "").trim();

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: any = {};

    if (type === "image") {
      where.fileType = { startsWith: "image/" };
    } else if (type === "pdf") {
      where.fileType = { contains: "pdf", mode: "insensitive" };
    } else if (type === "document") {
      where.NOT = { fileType: { startsWith: "image/" } };
    }

    if (q) {
      where.OR = [
        { fileName: { contains: q, mode: "insensitive" } },
        { fileUrl: { contains: q, mode: "insensitive" } },
      ];
    }

    if (/^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split("-").map((v) => parseInt(v, 10));
      if (Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12) {
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 1);
        where.createdAt = { gte: start, lt: end };
      }
    }

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: sort },
        take: limit,
        skip: skip,
        include: {
          _count: {
            select: { posts: true } // Hitung berapa post yang pakai
          }
        }
      }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({
      data: media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil media" }, { status: 500 });
  }
}

// DELETE: Hapus Media
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID media diperlukan" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    // Hanya ADMIN yang boleh hapus
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya Admin yang boleh menghapus media" }, { status: 403 });
    }

    // Cek apakah dipakai
    const media = await prisma.media.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } }
    });

    if (!media) {
      return NextResponse.json({ error: "Media tidak ditemukan" }, { status: 404 });
    }

    if (media._count.posts > 0) {
      return NextResponse.json({ error: "Gagal: Gambar ini sedang digunakan oleh berita." }, { status: 400 });
    }

    // Hapus File Fisik
    try {
      const filePath = path.join(process.cwd(), "public", media.fileUrl);
      await unlink(filePath);
    } catch {
      console.warn("File fisik tidak ditemukan atau gagal dihapus, lanjut hapus DB.");
    }

    // Hapus dari DB
    await prisma.media.delete({ where: { id } });

    return NextResponse.json({ message: "Media berhasil dihapus" });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus media" }, { status: 500 });
  }
}
