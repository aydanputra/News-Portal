import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { assertRateLimit } from "@/lib/api-guards";
import {
  getTrackingCookieMaxAge,
  getTrackingCookieName,
  hashTrackingVisitorId,
  resolveTrackingDay,
  resolveTrackingWindowStart,
  resolveVisitorIdentity,
} from "@/lib/analytics-tracking";

const ALLOWED_PAGE_TYPES = new Set(["home", "category", "tag", "search", "page"]);

function isLikelyBot(request: Request) {
  const ua = String(request.headers.get("user-agent") || "").toLowerCase();
  return /bot|crawler|spider|preview|headless|facebookexternalhit|whatsapp|slack/i.test(ua);
}

function normalizePublicPath(value: unknown) {
  const path = typeof value === "string" ? value.trim() : "";
  if (!path.startsWith("/")) return "";
  return path.slice(0, 512);
}

export async function POST(request: Request) {
  try {
    if (isLikelyBot(request)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const rl = assertRateLimit(request, "track-public-page-view", { windowMs: 60_000, max: 900 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const body = await request.json().catch(() => null);
    const pageKey = typeof body?.pageKey === "string" ? body.pageKey.trim() : "";
    const path = normalizePublicPath(body?.path);
    const title = typeof body?.title === "string" ? body.title.trim().slice(0, 200) : "";
    const pageType = typeof body?.pageType === "string" ? body.pageType.trim() : "";

    if (!pageKey || !path || !title || !ALLOWED_PAGE_TYPES.has(pageType)) {
      return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const visitorIdentity = resolveVisitorIdentity(cookieStore.get(getTrackingCookieName())?.value, body?.visitorId);
    const visitorHash = hashTrackingVisitorId(visitorIdentity.visitorId);
    const day = resolveTrackingDay(new Date());
    const windowStart = resolveTrackingWindowStart(new Date());

    const result = await prisma.$transaction(async (tx) => {
      try {
        await tx.publicPageViewVisitorWindow.create({
          data: {
            pageKey,
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

      await tx.publicPageViewDaily.upsert({
        where: {
          pageKey_day: {
            pageKey,
            day,
          },
        },
        update: {
          views: { increment: 1 },
          path,
          title,
          pageType,
        },
        create: {
          pageKey,
          pageType,
          path,
          title,
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
    console.error("POST /api/track-public-page-view error:", error);
    return NextResponse.json({ error: "Failed to track public page view" }, { status: 500 });
  }
}
