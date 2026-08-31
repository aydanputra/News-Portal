import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/api-guards";
import { enqueuePostView } from "@/lib/view-batcher";
import {
  getTrackingCookieMaxAge,
  getTrackingCookieName,
  hashTrackingVisitorId,
  resolveTrackingDay,
  resolveTrackingWindowStart,
  resolveVisitorIdentity,
} from "@/lib/analytics-tracking";

function isLikelyBot(request: Request) {
  const ua = String(request.headers.get("user-agent") || "").toLowerCase();
  return /bot|crawler|spider|preview|headless|facebookexternalhit|whatsapp|slack/i.test(ua);
}

export async function POST(request: Request) {
  try {
    if (isLikelyBot(request)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const rl = assertRateLimit(request, "track-view", { windowMs: 60_000, max: 600 });
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

    const cookieStore = await cookies();
    const visitorIdentity = resolveVisitorIdentity(cookieStore.get(getTrackingCookieName())?.value, body?.visitorId);
    const visitorHash = hashTrackingVisitorId(visitorIdentity.visitorId);
    const day = resolveTrackingDay(new Date());
    const windowStart = resolveTrackingWindowStart(new Date());
    const result = await prisma.$transaction(async (tx) => {
      const post = await tx.post.findFirst({
        where: { id: postId, published: true, status: { not: "ARCHIVED" } },
        select: { id: true },
      });

      if (!post) {
        return { incremented: false, duplicate: false };
      }

      try {
        await tx.postViewVisitorWindow.create({
          data: {
            postId,
            visitorHash,
            windowStart,
          },
        });
      } catch (error: any) {
        if (String(error?.code || "") === "P2002") {
          return { incremented: false, duplicate: true };
        }
        throw error;
      }

      // Defer the hot `Post.views` increment to a periodic batch flush instead
      // of writing to the shared `Post` row on every request.
      enqueuePostView(postId);

      await tx.postViewDaily.upsert({
        where: {
          postId_day: {
            postId,
            day,
          },
        },
        update: {
          views: { increment: 1 },
        },
        create: {
          postId,
          day,
          views: 1,
        },
      });

      return { incremented: true, duplicate: false };
    });

    const response = NextResponse.json({ ok: true, incremented: result.incremented, duplicate: result.duplicate });
    if (visitorIdentity.shouldSetCookie) {
      response.cookies.set({
        name: getTrackingCookieName(),
        value: visitorIdentity.visitorId,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: getTrackingCookieMaxAge(),
      });
    }
    return response;
  } catch (error) {
    console.error("POST /api/track-view error:", error);
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}
