import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { isToolEnabledForRequest } from "@/lib/api-guards";
import {
  normalizeRedirectPath,
  normalizeRedirectStatusCode,
  normalizeRedirectTarget,
} from "@/lib/redirects";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isToolEnabledForRequest(request, "redirect_manager"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const oldPath = normalizeRedirectPath(body?.oldPath);
  const newPath = normalizeRedirectTarget(body?.newPath);
  const statusCode = normalizeRedirectStatusCode(body?.statusCode);
  const isActive = body?.isActive !== false;
  const note = typeof body?.note === "string" ? body.note.trim() : "";

  if (!oldPath || oldPath === "/") {
    return NextResponse.json({ error: "URL lama tidak valid" }, { status: 400 });
  }
  if (!newPath || newPath === oldPath) {
    return NextResponse.json({ error: "URL tujuan tidak valid atau sama dengan URL lama" }, { status: 400 });
  }

  try {
    const row = await prisma.redirectRule.update({
      where: { id },
      data: {
        oldPath,
        newPath,
        statusCode,
        isActive,
        note: note || null,
      },
    });
    revalidateTag("redirect-rule");
    return NextResponse.json(row);
  } catch (error: any) {
    const code = String(error?.code || "");
    const message = code === "P2002" ? "URL lama sudah terdaftar di Redirect Manager" : "Gagal memperbarui redirect";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isToolEnabledForRequest(request, "redirect_manager"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.redirectRule.delete({ where: { id } });
    revalidateTag("redirect-rule");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Gagal menghapus redirect" }, { status: 400 });
  }
}
