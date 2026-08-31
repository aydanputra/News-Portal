import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/server-auth";
import { z } from "zod";

const updateItemSchema = z.object({
  label: z.string().min(1).optional(),
  customUrl: z.string().url().nullable().optional(),
  openInNewTab: z.boolean().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const validated = updateItemSchema.parse(body);

    const item = await prisma.menuItem.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validasi gagal", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal mengupdate item menu" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.menuItem.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/menu-items/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus item menu" }, { status: 500 });
  }
}
