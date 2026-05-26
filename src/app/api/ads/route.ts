
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
    const activeOnly = searchParams.get("active") === "true";
    const id = searchParams.get("id");
    const position = searchParams.get("position"); // Optional filter by position
    const positionsParam = searchParams.get("positions");
    const positions = positionsParam
      ? positionsParam
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    const pageTypeRaw = searchParams.get("pageType");
    const pageType = pageTypeRaw ? pageTypeRaw.toUpperCase() : null;
    const categorySlug = searchParams.get("categorySlug")?.toLowerCase() || null;
    const tagSlug = searchParams.get("tagSlug")?.toLowerCase() || null;
    const tagSlugsParam = searchParams.get("tagSlugs");
    const tagSlugs = tagSlugsParam
      ? tagSlugsParam
          .split(",")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean)
      : [];
    const pageSlug = searchParams.get("pageSlug")?.toLowerCase() || null;

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

      try {
        const ads = await prisma.advertisement.findMany({
          where,
          include: {
            media: true, // Include data gambar
          },
          orderBy: { createdAt: "desc" }
        });
        const filteredAds = ads.filter((ad) =>
          matchesTargeting(ad, {
            pageType: pageType && ALLOWED_PAGE_TYPES.has(pageType) ? pageType : null,
            categorySlug,
            tagSlug,
            tagSlugs,
            pageSlug,
          })
        );
        return NextResponse.json(filteredAds);
      } catch (err) {
        console.error("Prisma error:", err);
        // If error (e.g. invalid enum), return empty array instead of 500
        return NextResponse.json([]);
      }
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

    const body = await request.json();
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
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      targetPageTypes: targeting.targetPageTypes,
      targetCategorySlugs: targeting.targetCategorySlugs,
      targetTagSlugs: targeting.targetTagSlugs,
      targetPageSlugs: targeting.targetPageSlugs,
    };

    console.log("Creating Ad with data:", sanitizedData);

    try {
        const ad = await prisma.advertisement.create({
          data: sanitizedData,
        });
        return NextResponse.json(ad);
    } catch (dbError: any) {
        console.error("Database Error Full:", dbError);
        return NextResponse.json({ 
            error: `Database Error: ${dbError.message || dbError.code || "Unknown DB Error"}` 
        }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error creating ad:", error);
    return NextResponse.json({ 
        error: `Server Error: ${error.message || "Unknown Error"}` 
    }, { status: 500 });
  }
}
