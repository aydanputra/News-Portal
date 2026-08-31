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

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isToolEnabledForRequest(request, "redirect_manager"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const q = String(url.searchParams.get("q") || "").trim();
  const limitRaw = Number.parseInt(String(url.searchParams.get("limit") || "100"), 10);
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(200, limitRaw)) : 100;

  const rows = await prisma.redirectRule.findMany({
    where: q
      ? {
          OR: [
            { oldPath: { contains: q, mode: "insensitive" } },
            { newPath: { contains: q, mode: "insensitive" } },
            { note: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  return NextResponse.json({ rows });
}

export async function POST(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isToolEnabledForRequest(request, "redirect_manager"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
    const row = await prisma.redirectRule.create({
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
    const message =
      String(error?.code || "") === "P2002"
        ? "URL lama sudah terdaftar di Redirect Manager"
        : "Gagal menyimpan redirect";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
