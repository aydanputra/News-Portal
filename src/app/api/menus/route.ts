import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/server-auth";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const db = prisma as any;

const menuCreateSchema = z.object({
  name: z.string().min(1),
});

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const menus = await db.menu.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json(menus);
  } catch (error) {
    console.error("GET /api/menus error:", error);
    return NextResponse.json({ error: "Gagal mengambil menu" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name } = menuCreateSchema.parse(body);

    const existing = await db.menu.findFirst({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Nama menu sudah digunakan" }, { status: 400 });
    }

    const menu = await db.menu.create({
      data: { name },
    });

    revalidateTag("menus");
    return NextResponse.json(menu, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validasi gagal", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal membuat menu" }, { status: 500 });
  }
}
