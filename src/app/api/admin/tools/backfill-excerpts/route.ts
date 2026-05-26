import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

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
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const user = verifyToken(token || "");
    if (!user || !["ADMIN", "SUPER_ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
