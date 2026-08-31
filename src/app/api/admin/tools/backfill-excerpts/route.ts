import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertRateLimit, isToolEnabledForRequest } from "@/lib/api-guards";
import { requireAdmin } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

function toPlain(html: string): string {
  if (!html) return "";
  let text = html.replace(/\[[^\]]+\]/g, " ");
  text = text.replace(/<[^>]+>/g, " ");
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

function makeExcerpt(text: string, limit = 180): string {
  if (!text) return "";
  if (text.length <= limit) return text;
  return text.slice(0, limit).trim() + "…";
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(await isToolEnabledForRequest(req, "backfill_excerpts"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const rl = assertRateLimit(req, "tools:backfill_excerpts", { windowMs: 60_000, max: 10 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    // Optional query: limit
    const limitParam = req.nextUrl.searchParams.get("limit");
    const take = Math.min(parseInt(limitParam || "500") || 500, 2000);

    // Fetch posts with empty/whitespace excerpt or excerpts that look like raw HTML fragments
    const candidates = await prisma.post.findMany({
      where: {
        OR: [
          { excerpt: null },
          { excerpt: "" },
          { excerpt: " " },
          { excerpt: { contains: "<" } },
          { excerpt: { contains: "&lt;" } },
          { excerpt: { contains: "style=" } },
        ],
      },
      select: { id: true, content: true },
      take,
      orderBy: { createdAt: "asc" },
    });

    let updated = 0;
    for (const p of candidates) {
      const plain = toPlain(p.content || "");
      const excerpt = makeExcerpt(plain, 180);
      await prisma.post.update({
        where: { id: p.id },
        data: { excerpt },
      });
      updated++;
    }

    return NextResponse.json({ ok: true, scanned: candidates.length, updated });
  } catch (e: any) {
    console.error("Backfill Excerpts Error:", e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
