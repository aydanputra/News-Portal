import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const db = prisma as any;

const updateLocationsSchema = z.object({
  assignments: z.array(
    z.object({
      location: z.enum(["PRIMARY", "SECONDARY", "FOOTER", "MOBILE"]),
      menuId: z.string().min(1).nullable(),
    })
  ),
});

async function requireUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = verifyToken(token || "");
  return user;
}

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const assignments = await db.menuLocationAssignment.findMany({
      include: { menu: { select: { id: true, name: true } } },
      orderBy: { location: "asc" },
    });

    return NextResponse.json(assignments);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil lokasi menu" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validated = updateLocationsSchema.parse(body);

    await db.$transaction(async (tx: any) => {
      for (const item of validated.assignments) {
        if (!item.menuId) {
          await tx.menuLocationAssignment.deleteMany({ where: { location: item.location as any } });
          continue;
        }
        await tx.menuLocationAssignment.upsert({
          where: { location: item.location as any },
          update: { menuId: item.menuId },
          create: { location: item.location as any, menuId: item.menuId },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validasi gagal", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menyimpan lokasi menu" }, { status: 500 });
  }
}
