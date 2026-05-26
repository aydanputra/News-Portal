import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintArticleClient from "@/components/print/PrintArticleClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizePrintSettings(input: any) {
  const defaults = {
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
    header: { mode: "site", customText: "", showLogo: true, customImageUrl: "" },
  };
  if (!input || typeof input !== "object") return defaults;
  const merged: any = { ...defaults, ...input };
  merged.defaults = { ...defaults.defaults, ...(input as any).defaults };
  merged.header = { ...defaults.header, ...(input as any).header };
  return merged;
}

function parseInlinePositions(value: unknown): number[] {
  if (typeof value !== "string") return [2];
  const parsed = value
    .split(",")
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item, index, array) => Number.isFinite(item) && item > 0 && array.indexOf(item) === index)
    .sort((a, b) => a - b);
  return parsed.length > 0 ? parsed : [2];
}

export default async function PrintPostPage({
  params,
}: {
  params: Promise<{ categorySlug: string; postSlug: string }>;
}) {
  const { categorySlug, postSlug } = await params;

  const [settingRaw, post] = await Promise.all([
    prisma.setting.findUnique({ where: { id: "default" } }),
    prisma.post.findFirst({
      where: {
        slug: postSlug,
        category: { slug: categorySlug },
        published: true,
        status: { not: "ARCHIVED" },
      },
      include: {
        category: true,
        author: { select: { name: true } },
        approvedBy: { select: { name: true } },
        tags: true,
        featuredImage: true,
      },
    }),
  ]);

  if (!post) return notFound();

  const setting = settingRaw as any;
  const printSettings = normalizePrintSettings(setting?.printSettings);
  const inlineAdsConfig = {
    enabled: Boolean(setting?.postInlineAds),
    positions: parseInlinePositions(setting?.postInlineAdPositions),
  };
  const siteName = String(setting?.siteName || "Portal Berita");
  const logoUrl = typeof setting?.logoUrl === "string" ? setting.logoUrl : null;
  const publicUrl =
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL.trim() !== ""
      ? process.env.NEXT_PUBLIC_SITE_URL.trim()
      : null;

  return (
    <PrintArticleClient
      post={post}
      site={{ siteName, logoUrl, publicUrl }}
      settings={printSettings as any}
      inlineAdsConfig={inlineAdsConfig as any}
    />
  );
}
