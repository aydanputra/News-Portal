import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeRedirectPath } from "@/lib/redirects";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const oldPath = normalizeRedirectPath(url.searchParams.get("path") || "");

  if (!oldPath || oldPath === "/") {
    return NextResponse.json({ found: false });
  }

  const row = await prisma.redirectRule.findUnique({
    where: { oldPath },
    select: {
      id: true,
      newPath: true,
      statusCode: true,
      isActive: true,
    },
  });

  if (!row || !row.isActive) {
    return NextResponse.json({ found: false });
  }

  void prisma.redirectRule
    .update({
      where: { id: row.id },
      data: {
        hitCount: { increment: 1 },
        lastHitAt: new Date(),
      },
    })
    .catch(() => null);

  return NextResponse.json({
    found: true,
    location: row.newPath,
    statusCode: row.statusCode,
  });
}
