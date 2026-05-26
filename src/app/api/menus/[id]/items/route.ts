import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const db = prisma as any;

const createItemSchema = z.object({
  type: z.enum(["CUSTOM", "CATEGORY", "TAG", "PAGE"]),
  label: z.string().min(1),
  customUrl: z.string().url().optional(),
  openInNewTab: z.boolean().optional(),
  parentId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tagId: z.string().optional().nullable(),
  pageId: z.string().optional().nullable(),
});

const updateTreeSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      parentId: z.string().nullable().optional(),
      order: z.number().int(),
    })
  ),
});

async function requireUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const user = verifyToken(token || "");
  return user;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: menuId } = await params;
    const body = await request.json();
    const validated = createItemSchema.parse(body);

    if (validated.type === "CUSTOM") {
      if (!validated.customUrl) {
        return NextResponse.json({ error: "URL wajib diisi untuk Custom Link" }, { status: 400 });
      }
    }

    const maxOrder = await db.menuItem.aggregate({
      where: { menuId, parentId: validated.parentId ?? null },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order ?? 0) + 1;

    const item = await db.menuItem.create({
      data: {
        menuId,
        type: validated.type as any,
        label: validated.label,
        customUrl: validated.customUrl ?? null,
        openInNewTab: validated.openInNewTab ?? false,
        parentId: validated.parentId ?? null,
        categoryId: validated.categoryId ?? null,
        tagId: validated.tagId ?? null,
        pageId: validated.pageId ?? null,
        order: nextOrder,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validasi gagal", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menambah item menu" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: menuId } = await params;
    const body = await request.json();
    const validated = updateTreeSchema.parse(body);

    const updates = validated.items.map((item) =>
      db.menuItem.updateMany({
        where: { id: item.id, menuId },
        data: { parentId: item.parentId ?? null, order: item.order },
      })
    );

    await db.$transaction(updates);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validasi gagal", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menyimpan urutan menu" }, { status: 500 });
  }
}
