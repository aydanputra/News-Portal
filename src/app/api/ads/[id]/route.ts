
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { assertRateLimit } from "@/lib/api-guards";
import { requireAdmin } from "@/lib/server-auth";
import { sanitizeExternalUrl } from "@/lib/sanitizer";

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
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = assertRateLimit(request, "ads:update", { windowMs: 60_000, max: 40 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const body = adUpdateBodySchema.parse(await request.json());
    const { name, type, mediaId, scriptCode, position, linkUrl, isActive, startDate, endDate } = body;
    const targetPageTypes = normalizePageTypes(body?.targetPageTypes);
    const targetCategorySlugs = normalizeStringArray(body?.targetCategorySlugs, true);
    const targetTagSlugs = normalizeStringArray(body?.targetTagSlugs, true);
    const targetPageSlugs = normalizeStringArray(body?.targetPageSlugs, true);

    if (type === "SCRIPT" && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const scriptMax = 120_000;
    if (type === "SCRIPT" && typeof scriptCode === "string" && scriptCode.length > scriptMax) {
      return NextResponse.json({ error: "Kode script terlalu panjang" }, { status: 400 });
    }

    const safeLinkUrl = linkUrl === undefined ? undefined : (sanitizeExternalUrl(linkUrl) || null);

    const ad = await prisma.advertisement.update({
      where: { id },
      data: {
        name,
        type,
        mediaId,
        scriptCode,
        position,
        linkUrl: safeLinkUrl,
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
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = assertRateLimit(request, "ads:delete", { windowMs: 60_000, max: 30 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
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
