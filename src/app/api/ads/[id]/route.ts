
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { z } from "zod";

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

const adUpdateBodySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    type: z.enum(["IMAGE", "SCRIPT"]).optional(),
    mediaId: z.string().trim().optional().nullable(),
    scriptCode: z.string().optional().nullable(),
    position: z.string().trim().min(1).optional(),
    linkUrl: z.string().trim().optional().nullable(),
    isActive: z.boolean().optional(),
    startDate: z.union([z.string(), z.date()]).optional().nullable(),
    endDate: z.union([z.string(), z.date()]).optional().nullable(),
    targetPageTypes: z.array(z.string()).optional(),
    targetCategorySlugs: z.array(z.string()).optional(),
    targetTagSlugs: z.array(z.string()).optional(),
    targetPageSlugs: z.array(z.string()).optional(),
  })
  .passthrough();

const toNullableDate = (value: unknown): Date | null => {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
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

    const body = adUpdateBodySchema.parse(await request.json());
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
        startDate: toNullableDate(startDate),
        endDate: toNullableDate(endDate),
        targetPageTypes,
        targetCategorySlugs,
        targetTagSlugs,
        targetPageSlugs,
      },
    });

    revalidateTag("ads");
    return NextResponse.json(ad);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validasi gagal", details: error.errors }, { status: 400 });
    }
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

    revalidateTag("ads");
    return NextResponse.json({ message: "Iklan dihapus" });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json({ error: "Gagal hapus iklan" }, { status: 500 });
  }
}
