import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { HomepageBlockConfigSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/audit";
import { normalizeHomepageBlocks } from "@/lib/homepage-block-migrations";

// GET: Ambil konfigurasi blok
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || "home";
    const themeId = searchParams.get("themeId") || "modern"; // Default ke modern jika tidak ada

    const blocks = await prisma.homepageBlock.findMany({
      where: { 
          location,
          // @ts-ignore: Prisma client type update lag
          themeId: themeId // Filter berdasarkan tema
      },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(normalizeHomepageBlocks(blocks));
  } catch {
    return NextResponse.json({ error: "Gagal mengambil konfigurasi" }, { status: 500 });
  }
}

// PUT: Update konfigurasi (Full Sync: Hapus semua lalu buat ulang berdasarkan lokasi & tema)
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");

    // Hanya ADMIN & SUPER_ADMIN yang boleh atur homepage
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryLocation = searchParams.get("location");
    const queryThemeId = searchParams.get("themeId"); // Ambil themeId dari query params

    const body = await request.json();
    const { blocks, location: bodyLocation, themeId: bodyThemeId } = body; 
    const location = bodyLocation || queryLocation || "home";
    const themeId = bodyThemeId || queryThemeId || "modern";
    const normalizedBlocks = Array.isArray(blocks)
      ? normalizeHomepageBlocks(blocks as Array<Record<string, unknown>>)
      : [];

    // Validasi input
    if (!Array.isArray(blocks)) {
        return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Zod Validation Check
    try {
        for (const block of normalizedBlocks) {
            if (block.config) {
                // Parse will throw if invalid
                HomepageBlockConfigSchema.parse(block.config);
            }
        }
    } catch (e: any) {
        console.error("Validation Error:", e.errors);
        return NextResponse.json({ error: "Data konfigurasi tidak valid (Schema mismatch)" }, { status: 400 });
    }

    // Gunakan Transaction untuk operasi atomik
    await prisma.$transaction(async (tx: any) => {
      // 1. Hapus semua blok lama PADA LOKASI INI DAN TEMA INI
      await tx.homepageBlock.deleteMany({
        where: { 
            location,
            themeId
        }
      });

      // 2. Buat blok baru sesuai urutan yang dikirim
      for (const [index, block] of normalizedBlocks.entries()) {
        await tx.homepageBlock.create({
          data: {
            // Jangan gunakan block.id dari frontend karena bisa jadi "new_..."
            // Biarkan Prisma generate ID baru
            type: block.type,
            title: block.title,
            order: index + 1, // Urutkan ulang berdasarkan index array
            isActive: block.isActive ?? true,
            config: block.config || {},
            placement: block.placement || "main",
            location: location,
            themeId: themeId, // Simpan ID tema
          },
        });
      }
    });

    await logActivity(user.id, "UPDATE", "Homepage", location, { themeId }, request);

    revalidateTag("homepage");
    revalidateTag("posts");
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gagal update homepage:", error);
    return NextResponse.json({ error: "Gagal update konfigurasi" }, { status: 500 });
  }
}
