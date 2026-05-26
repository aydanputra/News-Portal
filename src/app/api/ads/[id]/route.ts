
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

const ALLOWED_PAGE_TYPES = new Set([
  "HOME",
  "CATEGORY_ARCHIVE",
  "TAG_ARCHIVE",
  "STATIC_PAGE",
  "POST_DETAIL",
]);

const normalizeStringArray = (value: unknown, toLowercase = false): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (toLowercase ? item.toLowerCase() : item));
};

const normalizePageTypes = (value: unknown): string[] => {
  return normalizeStringArray(value)
    .map((item) => item.toUpperCase())
    .filter((item) => ALLOWED_PAGE_TYPES.has(item));
};

// PUT: Update Iklan
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, mediaId, scriptCode, position, linkUrl, isActive, startDate, endDate } = body;
    const targetPageTypes = normalizePageTypes(body?.targetPageTypes);
    const targetCategorySlugs = normalizeStringArray(body?.targetCategorySlugs, true);
    const targetTagSlugs = normalizeStringArray(body?.targetTagSlugs, true);
    const targetPageSlugs = normalizeStringArray(body?.targetPageSlugs, true);

    const ad = await prisma.advertisement.update({
      where: { id },
      data: {
        name,
        type,
        mediaId,
        scriptCode,
        position,
        linkUrl,
        isActive,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        targetPageTypes,
        targetCategorySlugs,
        targetTagSlugs,
        targetPageSlugs,
      },
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json({ error: "Gagal update iklan" }, { status: 500 });
  }
}

// DELETE: Hapus Iklan
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.advertisement.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Iklan dihapus" });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json({ error: "Gagal hapus iklan" }, { status: 500 });
  }
}
