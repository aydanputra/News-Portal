import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/api-guards";

function isLikelyBot(request: Request) {
  const ua = String(request.headers.get("user-agent") || "").toLowerCase();
  return ua.includes("bot") || ua.includes("crawler") || ua.includes("spider") || ua.includes("preview");
}

export async function POST(request: Request) {
  try {
    if (isLikelyBot(request)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const rl = assertRateLimit(request, "track-view", { windowMs: 60_000, max: 120 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const body = await request.json().catch(() => null);
    const postId = typeof body?.postId === "string" ? body.postId.trim() : "";
    if (!postId) {
      return NextResponse.json({ error: "postId required" }, { status: 400 });
    }

    const perPostRl = assertRateLimit(request, `track-view:${postId}`, { windowMs: 60_000, max: 30 });
    if (!perPostRl.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { "Retry-After": String(perPostRl.retryAfterSeconds) } },
      );
    }

    const result = await prisma.post.updateMany({
      where: { id: postId, published: true, status: { not: "ARCHIVED" } },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ ok: true, incremented: result.count > 0 });
  } catch (error) {
    console.error("POST /api/track-view error:", error);
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}
