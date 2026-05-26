
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";

const ALLOWED_PAGE_TYPES = new Set([
  "HOME",
  "CATEGORY_ARCHIVE",
  "TAG_ARCHIVE",
  "STATIC_PAGE",
  "POST_DETAIL",
]);

const querySchema = z.object({
  active: z.enum(["true", "false"]).optional(),
  id: z.string().trim().optional(),
  position: z.string().trim().optional(),
  positions: z.string().trim().optional(),
  pageType: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
  tagSlug: z.string().trim().optional(),
  tagSlugs: z.string().trim().optional(),
  pageSlug: z.string().trim().optional(),
});

const adBodySchema = z
  .object({
    name: z.string().trim().min(1),
    type: z.enum(["IMAGE", "SCRIPT"]),
    mediaId: z.string().trim().optional().nullable(),
    scriptCode: z.string().optional().nullable(),
    position: z.string().trim().min(1),
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

const normalizeTargeting = (body: any) => {
  return {
    targetPageTypes: normalizePageTypes(body?.targetPageTypes),
    targetCategorySlugs: normalizeStringArray(body?.targetCategorySlugs, true),
    targetTagSlugs: normalizeStringArray(body?.targetTagSlugs, true),
    targetPageSlugs: normalizeStringArray(body?.targetPageSlugs, true),
  };
};

const matchesTargeting = (
  ad: any,
  context: {
    pageType: string | null;
    categorySlug: string | null;
    tagSlug: string | null;
    tagSlugs?: string[] | null;
    pageSlug: string | null;
  }
) => {
  const targetPageTypes = normalizePageTypes(ad?.targetPageTypes);
  const targetCategorySlugs = normalizeStringArray(ad?.targetCategorySlugs, true);
  const targetTagSlugs = normalizeStringArray(ad?.targetTagSlugs, true);
  const targetPageSlugs = normalizeStringArray(ad?.targetPageSlugs, true);

  if (targetPageTypes.length > 0) {
    if (!context.pageType || !targetPageTypes.includes(context.pageType)) return false;
  }

  if (targetCategorySlugs.length > 0) {
    if (!context.categorySlug || !targetCategorySlugs.includes(context.categorySlug)) return false;
  }

  if (targetTagSlugs.length > 0) {
    const candidateTagSlugs = Array.isArray(context.tagSlugs)
      ? normalizeStringArray(context.tagSlugs, true)
      : [];
    const singleTag = context.tagSlug ? context.tagSlug.toLowerCase() : "";
    const match =
      (singleTag && targetTagSlugs.includes(singleTag)) ||
      (candidateTagSlugs.length > 0 && candidateTagSlugs.some((slug) => targetTagSlugs.includes(slug)));
    if (!match) return false;
  }

  if (targetPageSlugs.length > 0) {
    if (!context.pageSlug || !targetPageSlugs.includes(context.pageSlug)) return false;
  }

  return true;
};

// GET: Ambil Daftar Iklan
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.parse({
      active: searchParams.get("active") || undefined,
      id: searchParams.get("id") || undefined,
      position: searchParams.get("position") || undefined,
      positions: searchParams.get("positions") || undefined,
      pageType: searchParams.get("pageType") || undefined,
      categorySlug: searchParams.get("categorySlug") || undefined,
      tagSlug: searchParams.get("tagSlug") || undefined,
      tagSlugs: searchParams.get("tagSlugs") || undefined,
      pageSlug: searchParams.get("pageSlug") || undefined,
    });

    const activeOnly = parsed.active === "true";
    const id = parsed.id || null;
    const position = parsed.position || null;
    const positions = parsed.positions
      ? parsed.positions
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    const pageType = parsed.pageType ? parsed.pageType.toUpperCase() : null;
    const categorySlug = parsed.categorySlug ? parsed.categorySlug.toLowerCase() : null;
    const tagSlug = parsed.tagSlug ? parsed.tagSlug.toLowerCase() : null;
    const tagSlugs = parsed.tagSlugs
      ? parsed.tagSlugs
          .split(",")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean)
      : [];
    const pageSlug = parsed.pageSlug ? parsed.pageSlug.toLowerCase() : null;

    // Jika minta activeOnly, filter logika tanggal & isActive
    if (activeOnly) {
      const now = new Date();
      const where: any = {
        isActive: true,
        OR: [
            { startDate: { lte: now } },
            { startDate: null }
        ],
        AND: [
            {
                OR: [
                    { endDate: { gte: now } },
                    { endDate: null }
                ]
            }
        ]
      };

      if (id) {
        where.id = id;
      } else if (positions.length > 0) {
        where.position = { in: positions };
      } else if (position) {
        // Handle enum Position case-sensitivity or mapping if needed
        // But for now, assume exact match from frontend
        where.position = position;
      }

      const safePageType = pageType && ALLOWED_PAGE_TYPES.has(pageType) ? pageType : null;
      const cacheKey = [
        "ads:active",
        `id:${id || ""}`,
        `position:${position || ""}`,
        `positions:${positions.join(",")}`,
        `pageType:${safePageType || ""}`,
        `categorySlug:${categorySlug || ""}`,
        `tagSlug:${tagSlug || ""}`,
        `tagSlugs:${tagSlugs.join(",")}`,
        `pageSlug:${pageSlug || ""}`,
      ].join("|");

      const cached = unstable_cache(
        async () => {
          try {
            const ads = await prisma.advertisement.findMany({
              where,
              include: {
                media: true,
              },
              orderBy: { createdAt: "desc" },
            });
            return ads.filter((ad) =>
              matchesTargeting(ad, {
                pageType: safePageType,
                categorySlug,
                tagSlug,
                tagSlugs,
                pageSlug,
              })
            );
          } catch (err) {
            console.error("Prisma error:", err);
            return [];
          }
        },
        [cacheKey],
        { tags: ["ads"], revalidate: 60 },
      );

      return NextResponse.json(await cached());
    }

    // Jika Admin (tanpa activeOnly), butuh Auth
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ads = await prisma.advertisement.findMany({
      include: {
        media: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(ads);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validasi gagal", details: error.errors }, { status: 400 });
    }
    console.error("Error fetching ads:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// POST: Buat Iklan Baru (Admin Only)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = adBodySchema.parse(await request.json());
    const { name, type, mediaId, scriptCode, position, linkUrl, isActive, startDate, endDate } = body;
    const targeting = normalizeTargeting(body);

    // Validasi
    if (!name || !type || !position) {
      return NextResponse.json({ error: "Nama, Tipe, dan Posisi wajib diisi" }, { status: 400 });
    }

    if (type === "IMAGE" && !mediaId) {
      return NextResponse.json({ error: "Iklan Gambar wajib memilih Media" }, { status: 400 });
    }

    if (type === "SCRIPT" && !scriptCode) {
      return NextResponse.json({ error: "Iklan Script wajib mengisi Kode Script" }, { status: 400 });
    }

    // Sanitize input
    const sanitizedData = {
      name,
      type,
      mediaId: (type === "IMAGE" && mediaId) ? mediaId : null,
      scriptCode: (type === "SCRIPT" && scriptCode) ? scriptCode : null,
      position,
      linkUrl: linkUrl || null,
      isActive: isActive ?? true,
      startDate: toNullableDate(startDate),
      endDate: toNullableDate(endDate),
      targetPageTypes: targeting.targetPageTypes,
      targetCategorySlugs: targeting.targetCategorySlugs,
      targetTagSlugs: targeting.targetTagSlugs,
      targetPageSlugs: targeting.targetPageSlugs,
    };

    try {
        const ad = await prisma.advertisement.create({
          data: sanitizedData,
        });
        revalidateTag("ads");
        return NextResponse.json(ad);
    } catch (dbError: any) {
        console.error("Database Error Full:", dbError);
        return NextResponse.json({ 
            error: `Database Error: ${dbError.message || dbError.code || "Unknown DB Error"}` 
        }, { status: 500 });
    }

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validasi gagal", details: error.errors }, { status: 400 });
    }
    console.error("Error creating ad:", error);
    return NextResponse.json({ 
        error: `Server Error: ${error.message || "Unknown Error"}` 
    }, { status: 500 });
  }
}
