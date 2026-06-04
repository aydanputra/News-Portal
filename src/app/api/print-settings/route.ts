import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertRateLimit, isToolEnabledForRequest, requireAdmin } from "@/lib/api-guards";

export const dynamic = "force-dynamic";

const DEFAULT_PRINT_SETTINGS = {
  enabled: true,
  defaults: {
    showFeaturedImage: true,
    showImages: true,
    showExcerpt: true,
    showAuthor: true,
    showEditor: false,
    showCategory: true,
    showTags: true,
    showDate: true,
    fontFamily: "Georgia, 'Times New Roman', Times, serif",
    titleFontSizePx: 28,
    fontSizePx: 16,
    lineHeight: 1.65,
    contentWidthPx: 820,
    pageMarginMm: 12,
    featuredImageMaxHeightPx: 360,
  },
  header: {
    mode: "site",
    customText: "",
    showLogo: true,
    customImageUrl: "",
  },
} as const;

function coerceBoolean(v: unknown, fallback: boolean) {
  return typeof v === "boolean" ? v : fallback;
}

function coerceNumber(v: unknown, fallback: number, opts?: { min?: number; max?: number }) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  const min = typeof opts?.min === "number" ? opts.min : -Infinity;
  const max = typeof opts?.max === "number" ? opts.max : Infinity;
  return Math.min(max, Math.max(min, n));
}

function coerceString(v: unknown, fallback: string) {
  const s = typeof v === "string" ? v : "";
  return s.trim() !== "" ? s : fallback;
}

function normalizePrintSettings(input: any) {
  const base: any = { ...DEFAULT_PRINT_SETTINGS };
  const src = input && typeof input === "object" ? input : {};

  base.enabled = coerceBoolean(src.enabled, base.enabled);
  base.defaults = {
    ...base.defaults,
    showFeaturedImage: coerceBoolean(src?.defaults?.showFeaturedImage, base.defaults.showFeaturedImage),
    showImages: coerceBoolean(src?.defaults?.showImages, base.defaults.showImages),
    showExcerpt: coerceBoolean(src?.defaults?.showExcerpt, base.defaults.showExcerpt),
    showAuthor: coerceBoolean(src?.defaults?.showAuthor, base.defaults.showAuthor),
    showEditor: coerceBoolean(src?.defaults?.showEditor, base.defaults.showEditor),
    showCategory: coerceBoolean(src?.defaults?.showCategory, base.defaults.showCategory),
    showTags: coerceBoolean(src?.defaults?.showTags, base.defaults.showTags),
    showDate: coerceBoolean(src?.defaults?.showDate, base.defaults.showDate),
    fontFamily: coerceString(src?.defaults?.fontFamily, base.defaults.fontFamily),
    titleFontSizePx: coerceNumber(src?.defaults?.titleFontSizePx, base.defaults.titleFontSizePx, { min: 18, max: 44 }),
    fontSizePx: coerceNumber(src?.defaults?.fontSizePx, base.defaults.fontSizePx, { min: 12, max: 26 }),
    lineHeight: coerceNumber(src?.defaults?.lineHeight, base.defaults.lineHeight, { min: 1.2, max: 2.2 }),
    contentWidthPx: coerceNumber(src?.defaults?.contentWidthPx, base.defaults.contentWidthPx, { min: 560, max: 1040 }),
    pageMarginMm: coerceNumber(src?.defaults?.pageMarginMm, base.defaults.pageMarginMm, { min: 6, max: 25 }),
    featuredImageMaxHeightPx: coerceNumber(src?.defaults?.featuredImageMaxHeightPx, base.defaults.featuredImageMaxHeightPx, {
      min: 180,
      max: 720,
    }),
  };

  const headerMode = String(src?.header?.mode || base.header.mode);
  base.header = {
    mode:
      headerMode === "none" || headerMode === "custom" || headerMode === "site" || headerMode === "image"
        ? headerMode
        : base.header.mode,
    customText: typeof src?.header?.customText === "string" ? src.header.customText : base.header.customText,
    showLogo: coerceBoolean(src?.header?.showLogo, base.header.showLogo),
    customImageUrl: typeof src?.header?.customImageUrl === "string" ? src.header.customImageUrl : base.header.customImageUrl,
  };

  return base;
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isToolEnabledForRequest(request, "print_tools")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const settings = (await (prisma as any).setting.findUnique({ where: { id: "default" } })) as any;
    const normalized = normalizePrintSettings(settings?.printSettings);
    return NextResponse.json({ data: normalized });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch print settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!isToolEnabledForRequest(request, "print_tools")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const rl = assertRateLimit(request, "tools:print_settings_write", { windowMs: 60_000, max: 30 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const body = await request.json().catch(() => null);
    const normalized = normalizePrintSettings(body?.data);

    const updated = await (prisma as any).setting.upsert({
      where: { id: "default" },
      create: { id: "default", printSettings: normalized },
      update: { printSettings: normalized },
    });

    return NextResponse.json({ data: normalizePrintSettings(updated?.printSettings) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update print settings" }, { status: 500 });
  }
}
