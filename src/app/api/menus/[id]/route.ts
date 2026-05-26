import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const db = prisma as any;

const menuUpdateSchema = z.object({
  name: z.string().min(1).optional(),
});

async function requireUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = verifyToken(token || "");
  return user;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const menu = await db.menu.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          include: {
            category: { select: { id: true, name: true, slug: true } },
            tag: { select: { id: true, name: true, slug: true } },
            page: { select: { id: true, title: true, slug: true, published: true } },
          },
        },
      },
    });

    if (!menu) return NextResponse.json({ error: "Menu tidak ditemukan" }, { status: 404 });

    return NextResponse.json(menu);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil menu" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const validated = menuUpdateSchema.parse(body);

    if (validated.name) {
      const existing = await db.menu.findFirst({
        where: { name: validated.name, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json({ error: "Nama menu sudah digunakan" }, { status: 400 });
      }
    }

    const menu = await db.menu.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(menu);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validasi gagal", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal mengupdate menu" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await db.menu.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus menu" }, { status: 500 });
  }
}
