import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag, revalidatePath } from "next/cache";
import crypto from "crypto";
import { assertRateLimit } from "@/lib/api-guards";
import { requireAdmin } from "@/lib/server-auth";
import { sanitizeInsertCode } from "@/lib/sanitizer";
import {
  mergeThemeConfigWithSettings,
  normalizeDeprecatedSettingFonts,
  THEME_GLOBAL_STYLE_SYNC_KEYS,
} from "@/lib/settings";

function deriveKey(masterKey: string) {
  return crypto.scryptSync(masterKey, "news-portal-ai-openai", 32);
}

function encryptSecret(plaintext: string, masterKey: string) {
  const key = deriveKey(masterKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

// GET: Ambil Settings (Global + Theme Specific)
export async function GET(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedThemeId = searchParams.get("themeId");

    // 1. Ambil Global Setting
    let globalSetting: any = await prisma.setting.findUnique({ where: { id: "default" } });
    
    if (!globalSetting) {
      globalSetting = await prisma.setting.create({
        data: { id: "default" }
      });
    }

    // 2. Tentukan Theme ID yang mau diambil config-nya
    const targetThemeId = requestedThemeId || globalSetting.activeTheme || "classic";

    // 3. Ambil Theme Config
    // @ts-ignore
    const themeConfig = await prisma.themeConfig.findUnique({
      where: { themeId: targetThemeId },
    });

    if (requestedThemeId && themeConfig && (themeConfig as any).config) {
      globalSetting = mergeThemeConfigWithSettings(globalSetting, (themeConfig as any).config);
    }
    globalSetting = normalizeDeprecatedSettingFonts(globalSetting);

    // Get Global Styles
    const globalStyles = {
        // Site Identity (Base Info)
        siteName: globalSetting?.siteName || "News Portal",
        siteDescription: globalSetting?.siteDescription || "",
        logoUrl: globalSetting?.logoUrl || "",
        faviconUrl: globalSetting?.faviconUrl || "",
        activeTheme: globalSetting?.activeTheme || "classic",
        insertCodeHead: globalSetting?.insertCodeHead || "",
        insertCodeBody: globalSetting?.insertCodeBody || "",
        insertCodeFooter: globalSetting?.insertCodeFooter || "",

        primaryColor: globalSetting?.primaryColor || "#2563eb",
        secondaryColor: globalSetting?.secondaryColor || "#64748b",
        accentColor: globalSetting?.accentColor || "#f59e0b",
        backgroundColor: globalSetting?.backgroundColor || "#f8fafc",
        headingColor: globalSetting?.headingColor || "#1e293b",
        excerptColor: globalSetting?.excerptColor || "#64748b",
        metaColor: globalSetting?.metaColor || "#94a3b8",
        headingFont: globalSetting?.headingFont || "Inter",
        bodyFont: globalSetting?.bodyFont || "Inter",
        baseFontSize: globalSetting?.baseFontSize || 16,
        globalBorderRadius: globalSetting?.globalBorderRadius || "0.5rem",

        // Layout Containers
        homeContainerWidth: globalSetting?.homeContainerWidth || "boxed",
        homeCustomContainerWidth: globalSetting?.homeCustomContainerWidth || "1200",
        postContainerWidth: globalSetting?.postContainerWidth || "boxed",
        postCustomContainerWidth: globalSetting?.postCustomContainerWidth || "1200",
        globalContainerWidth: globalSetting?.globalContainerWidth || "boxed",
        globalCustomContainerWidth: globalSetting?.globalCustomContainerWidth || "1200",

        // New Color Settings (Homepage)
        homeWidgetTitleColor: globalSetting?.homeWidgetTitleColor || globalSetting?.headingColor || "#1e293b",
        homeNewsTitleColor: globalSetting?.homeNewsTitleColor || globalSetting?.headingColor || "#111827",
        homeHoverColor: globalSetting?.homeHoverColor || globalSetting?.globalAccentColor || "#2563eb",
        homeExcerptColor: globalSetting?.homeExcerptColor || globalSetting?.excerptColor || "#4b5563",
        homeMetaColor: globalSetting?.homeMetaColor || globalSetting?.metaColor || "#9ca3af",

        // New Color Settings (Single Post)
        postWidgetTitleColor: globalSetting?.postWidgetTitleColor || globalSetting?.headingColor || "#1e293b",
        postContentColor: globalSetting?.postContentColor || globalSetting?.headingColor || "#374151",
        postMetaColor: globalSetting?.postMetaColor || globalSetting?.metaColor || "#94a3b8",
        postLinkColor: (globalSetting as any)?.postLinkColor || (globalSetting as any)?.postHoverColor || globalSetting?.homeHoverColor || globalSetting?.globalAccentColor || "#2563eb",
        postLinkHoverColor: (globalSetting as any)?.postLinkHoverColor || (globalSetting as any)?.postHoverColor || globalSetting?.homeHoverColor || globalSetting?.globalAccentColor || "#1d4ed8",
        postBadgeTextColor: (globalSetting as any)?.postBadgeTextColor || globalSetting?.postMetaColor || globalSetting?.metaColor || "#374151",
        postBadgeBgColor: (globalSetting as any)?.postBadgeBgColor || "#f3f4f6",

        // New Color Settings (Global)
        globalPrimaryColor: globalSetting?.globalPrimaryColor || "#2563eb",
        globalSecondaryColor: globalSetting?.globalSecondaryColor || "#64748b",
        globalAccentColor: globalSetting?.globalAccentColor || "#f59e0b",
        globalBackgroundColor: globalSetting?.globalBackgroundColor || "#ffffff",
        globalBorderColor: globalSetting?.globalBorderColor || "#e5e7eb",
        globalSurfaceColor: globalSetting?.globalSurfaceColor || "#f9fafb",
        globalElevatedColor: globalSetting?.globalElevatedColor || "#ffffff",
        globalMutedTextColor: globalSetting?.globalMutedTextColor || globalSetting?.metaColor || "#9ca3af",
        globalBackgroundImage: globalSetting?.globalBackgroundImage || "",
        globalBackgroundRepeat: globalSetting?.globalBackgroundRepeat || "no-repeat",
        globalBackgroundSize: globalSetting?.globalBackgroundSize || "cover",
        globalBackgroundPosition: globalSetting?.globalBackgroundPosition || "center",
        globalBackgroundAttachment: globalSetting?.globalBackgroundAttachment || "scroll",

        // Single Post Settings
        postInlineRelated: globalSetting?.postInlineRelated ?? false,
        postRelatedCount: globalSetting?.postRelatedCount || 2,
        postRelatedPosition: globalSetting?.postRelatedPosition || 2,
        postRelatedPositions: globalSetting?.postRelatedPositions || "2", // Add this
        postInlineRelatedFilterType: globalSetting?.postInlineRelatedFilterType || "category",
        postInlineRelatedDateRange: globalSetting?.postInlineRelatedDateRange || "all",
        postInlineRelatedLayout: globalSetting?.postInlineRelatedLayout || "list",
        postInlineRelatedGridColumns: globalSetting?.postInlineRelatedGridColumns || 2,
        postInlineRelatedCardColumns: globalSetting?.postInlineRelatedCardColumns || 1,
        postInlineRelatedTitleFontSize: globalSetting?.postInlineRelatedTitleFontSize || 16,
        postInlineRelatedTitleFont: globalSetting?.postInlineRelatedTitleFont || globalSetting?.postTitleFont || globalSetting?.postWidgetTitleFont || "Inter",
        postInlineRelatedTitleFontWeight: globalSetting?.postInlineRelatedTitleFontWeight || "700",
        postInlineRelatedTitleLineHeight: globalSetting?.postInlineRelatedTitleLineHeight || "1.35",
        postInlineRelatedHeadingText: globalSetting?.postInlineRelatedHeadingText || "Baca Juga",
        postInlineRelatedHeadingFont: globalSetting?.postInlineRelatedHeadingFont || globalSetting?.postInlineRelatedTitleFont || globalSetting?.postTitleFont || "Inter",
        postInlineRelatedHeadingFontWeight: globalSetting?.postInlineRelatedHeadingFontWeight || "700",
        postInlineRelatedHeadingLetterSpacing: globalSetting?.postInlineRelatedHeadingLetterSpacing || "0",
        postInlineRelatedFontSize: globalSetting?.postInlineRelatedFontSize || 14,
        postInlineRelatedBgColor: globalSetting?.postInlineRelatedBgColor || "#f9fafb",
        // @ts-ignore
        postInlineRelatedHeaderBgColor: globalSetting?.postInlineRelatedHeaderBgColor || "#f9fafb", // Add this
        postInlineRelatedTitleColor: globalSetting?.postInlineRelatedTitleColor || "#1e293b",
        postInlineRelatedTextColor: globalSetting?.postInlineRelatedTextColor || "#1f2937",
        postInlineRelatedHoverColor: globalSetting?.postInlineRelatedHoverColor || "#2563eb",
        postImageWatermarkUrl: globalSetting?.postImageWatermarkUrl || "",
        postImageWatermarkOpacity: globalSetting?.postImageWatermarkOpacity ?? 35,
        postImageWatermarkSize: globalSetting?.postImageWatermarkSize ?? 24,
        postImageWatermarkPosition: globalSetting?.postImageWatermarkPosition || "center",
        postImageWatermarkPaddingTop: globalSetting?.postImageWatermarkPaddingTop ?? 24,
        postImageWatermarkPaddingRight: globalSetting?.postImageWatermarkPaddingRight ?? 24,
        postImageWatermarkPaddingBottom: globalSetting?.postImageWatermarkPaddingBottom ?? 24,
        postImageWatermarkPaddingLeft: globalSetting?.postImageWatermarkPaddingLeft ?? 24,
        postInlineAds: globalSetting?.postInlineAds ?? false,
        postInlineAdPositions: globalSetting?.postInlineAdPositions || "3",
        postBottomRelated: globalSetting?.postBottomRelated ?? true,
        postAuthorBox: globalSetting?.postAuthorBox ?? true,
        postNavigation: globalSetting?.postNavigation ?? true,

        // Gallery Settings
        galleryLayout: globalSetting?.galleryLayout || "slider",
        galleryEnableLightbox: globalSetting?.galleryEnableLightbox ?? true,
        galleryShowExif: globalSetting?.galleryShowExif ?? false,
        galleryAutoPlay: globalSetting?.galleryAutoPlay ?? false,

        // Typography - Homepage
        homeWidgetTitleFontSize: globalSetting?.homeWidgetTitleFontSize || "24px",
        homeWidgetTitleFontWeight: globalSetting?.homeWidgetTitleFontWeight || "700",
        homeWidgetTitleLineHeight: globalSetting?.homeWidgetTitleLineHeight || "1.3",
        homeWidgetTitleFont: globalSetting?.homeWidgetTitleFont || "Inter",
        homeNewsTitleFontSize: globalSetting?.homeNewsTitleFontSize || "18px",
        homeNewsTitleFontWeight: globalSetting?.homeNewsTitleFontWeight || "600",
        homeNewsTitleLineHeight: globalSetting?.homeNewsTitleLineHeight || "1.35",
        homeNewsTitleFont: globalSetting?.homeNewsTitleFont || "Inter",
        homeExcerptFontSize: globalSetting?.homeExcerptFontSize || "14px",
        homeExcerptFontWeight: globalSetting?.homeExcerptFontWeight || "400",
        homeExcerptLineHeight: globalSetting?.homeExcerptLineHeight || "1.6",
        homeExcerptFont: globalSetting?.homeExcerptFont || "Inter",
        homeMetaFontSize: globalSetting?.homeMetaFontSize || "12px",
        homeMetaFontWeight: globalSetting?.homeMetaFontWeight || "500",
        homeMetaLineHeight: globalSetting?.homeMetaLineHeight || "1.4",
        homeMetaFont: globalSetting?.homeMetaFont || "Inter",

        // Typography - Single Post
        postTitleFontSize: globalSetting?.postTitleFontSize || "32px",
        postTitleFontWeight: globalSetting?.postTitleFontWeight || "700",
        postTitleLineHeight: globalSetting?.postTitleLineHeight || "1.15",
        postTitleFont: globalSetting?.postTitleFont || "Inter",
        postSubtitleFontSize: globalSetting?.postSubtitleFontSize || "18px",
        postSubtitleFontWeight: globalSetting?.postSubtitleFontWeight || "500",
        postSubtitleLineHeight: globalSetting?.postSubtitleLineHeight || "1.6",
        postSubtitleFont: globalSetting?.postSubtitleFont || "Inter",
        postContentFontSize: globalSetting?.postContentFontSize || "18px",
        postContentFontWeight: globalSetting?.postContentFontWeight || "400",
        postContentLineHeight: globalSetting?.postContentLineHeight || globalSetting?.globalContentLineHeight || "1.8",
        postContentFont: globalSetting?.postContentFont || "Inter",
        postWidgetTitleFontSize: globalSetting?.postWidgetTitleFontSize || "20px",
        postWidgetTitleFontWeight: globalSetting?.postWidgetTitleFontWeight || "600",
        postWidgetTitleLineHeight: globalSetting?.postWidgetTitleLineHeight || "1.3",
        postWidgetTitleFont: globalSetting?.postWidgetTitleFont || "Inter",

        // Typography - Archive
        archiveTitleFontSize: globalSetting?.archiveTitleFontSize || "24px",
        archiveTitleFontWeight: globalSetting?.archiveTitleFontWeight || "700",
        archiveTitleFont: globalSetting?.archiveTitleFont || "Inter",
        archiveExcerptFontSize: globalSetting?.archiveExcerptFontSize || "14px",
        archiveExcerptFontWeight: globalSetting?.archiveExcerptFontWeight || "400",
        archiveExcerptFont: globalSetting?.archiveExcerptFont || "Inter",
        archiveMetaFontSize: globalSetting?.archiveMetaFontSize || "12px",
        archiveMetaFontWeight: globalSetting?.archiveMetaFontWeight || "500",
        archiveMetaFont: globalSetting?.archiveMetaFont || "Inter",
        
        // Typography - Global (Fallback)
        globalWidgetTitleFontSize: globalSetting?.globalWidgetTitleFontSize || "20px",
        globalWidgetTitleFontWeight: globalSetting?.globalWidgetTitleFontWeight || "600",
        globalWidgetTitleLineHeight: globalSetting?.globalWidgetTitleLineHeight || "1.3",
        globalWidgetTitleFont: globalSetting?.globalWidgetTitleFont || "Inter",
        globalNewsTitleFontSize: globalSetting?.globalNewsTitleFontSize || "18px",
        globalNewsTitleFontWeight: globalSetting?.globalNewsTitleFontWeight || "600",
        globalNewsTitleLineHeight: globalSetting?.globalNewsTitleLineHeight || "1.35",
        globalNewsTitleFont: globalSetting?.globalNewsTitleFont || "Inter",
        globalMetaFontSize: globalSetting?.globalMetaFontSize || "12px",
        globalMetaFontWeight: globalSetting?.globalMetaFontWeight || "500",
        globalMetaLineHeight: globalSetting?.globalMetaLineHeight || "1.4",
        globalMetaFont: globalSetting?.globalMetaFont || "Inter",
        globalExcerptFontSize: globalSetting?.globalExcerptFontSize || "14px",
        globalExcerptFontWeight: globalSetting?.globalExcerptFontWeight || "400",
        globalExcerptFont: globalSetting?.globalExcerptFont || "Inter",
        globalContentFontSize: globalSetting?.globalContentFontSize || "16px",
        globalContentFontWeight: globalSetting?.globalContentFontWeight || "400",
        globalContentLineHeight: globalSetting?.globalContentLineHeight || "1.8",
        globalContentFont: globalSetting?.globalContentFont || "Inter",

        // Notification Settings
        notificationTelegramEnabled: globalSetting?.notificationTelegramEnabled ?? false,
        notificationTelegramBotTokenConfigured: Boolean(globalSetting?.notificationTelegramBotToken),
        notificationTelegramChatIdConfigured: Boolean(globalSetting?.notificationTelegramChatId),
        notificationEmailEnabled: globalSetting?.notificationEmailEnabled ?? false,
        notificationEmailFrom: globalSetting?.notificationEmailFrom || "",
        notificationEmailTo: globalSetting?.notificationEmailTo || "",
        notificationSmtpHost: globalSetting?.notificationSmtpHost || "",
        notificationSmtpPort: globalSetting?.notificationSmtpPort || 587,
        notificationSmtpUser: globalSetting?.notificationSmtpUser || "",
        notificationSmtpPassConfigured: Boolean(globalSetting?.notificationSmtpPass),
        notificationSmtpSecure: globalSetting?.notificationSmtpSecure ?? true,
        notificationEvents: globalSetting?.notificationEvents || { onNewPost: true, onPostRejected: true, onPostPublished: true },
        aiApiKeyConfigured: Boolean(
          (globalSetting as any)?.aiOpenAiApiKeyEnc ||
            (typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.trim() !== ""),
        ),
        aiApiKeySource: (globalSetting as any)?.aiOpenAiApiKeyEnc
          ? "db"
          : typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.trim() !== ""
            ? "env"
            : "none",
    };

    return NextResponse.json(globalStyles);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = assertRateLimit(request, "settings:write", { windowMs: 60_000, max: 20 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const requestBody = await request.json();
    const { themeId, ...rawData } = requestBody;
    const existingSetting = normalizeDeprecatedSettingFonts(
      await prisma.setting.findUnique({ where: { id: "default" } }),
    ) || {};
    const data: any = normalizeDeprecatedSettingFonts({
      ...existingSetting,
      ...rawData,
    });

    const wantsToUpdateAiKey =
      Object.prototype.hasOwnProperty.call(rawData, "aiOpenAiApiKey") ||
      Object.prototype.hasOwnProperty.call(rawData, "aiApiKey");
    if (wantsToUpdateAiKey && !["ADMIN", "SUPER_ADMIN"].includes(admin.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const rawAiKey =
      typeof (data as any).aiOpenAiApiKey === "string"
        ? String((data as any).aiOpenAiApiKey)
        : typeof (data as any).aiApiKey === "string"
          ? String((data as any).aiApiKey)
          : undefined;
    if (wantsToUpdateAiKey) {
      if (!process.env.MASTER_KEY || process.env.MASTER_KEY.trim() === "") {
        return NextResponse.json({ error: "MASTER_KEY not configured" }, { status: 500 });
      }
    }
    const aiKeyEnc =
      wantsToUpdateAiKey && typeof rawAiKey === "string"
        ? rawAiKey.trim() === ""
          ? null
          : encryptSecret(rawAiKey.trim(), process.env.MASTER_KEY as string)
        : undefined;

    const wantsInsertCodeUpdate = ["insertCodeHead", "insertCodeBody", "insertCodeFooter"].some((key) =>
      Object.prototype.hasOwnProperty.call(rawData, key),
    );
    if (wantsInsertCodeUpdate && admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const insertCodeHeadUpdate = wantsInsertCodeUpdate ? sanitizeInsertCode((data as any).insertCodeHead, "head") : undefined;
    const insertCodeBodyUpdate = wantsInsertCodeUpdate ? sanitizeInsertCode((data as any).insertCodeBody, "body") : undefined;
    const insertCodeFooterUpdate = wantsInsertCodeUpdate ? sanitizeInsertCode((data as any).insertCodeFooter, "footer") : undefined;
    const insertCodeHeadCreate = sanitizeInsertCode((data as any).insertCodeHead ?? "", "head");
    const insertCodeBodyCreate = sanitizeInsertCode((data as any).insertCodeBody ?? "", "body");
    const insertCodeFooterCreate = sanitizeInsertCode((data as any).insertCodeFooter ?? "", "footer");

    // Validate baseFontSize to ensure it's a number
    const baseFontSize = parseInt(data.baseFontSize);
    if (isNaN(baseFontSize)) {
        data.baseFontSize = 16; // Default fallback
    } else {
        data.baseFontSize = baseFontSize;
    }

    // Validate Single Post numeric fields
    const postRelatedCount = parseInt(data.postRelatedCount);
    data.postRelatedCount = isNaN(postRelatedCount) ? 2 : postRelatedCount;

    const postRelatedPosition = parseInt(data.postRelatedPosition);
    data.postRelatedPosition = isNaN(postRelatedPosition) ? 2 : postRelatedPosition;

    // Validate Font Sizes
    const postInlineRelatedTitleFontSize = parseInt(data.postInlineRelatedTitleFontSize);
    data.postInlineRelatedTitleFontSize = isNaN(postInlineRelatedTitleFontSize) ? 16 : postInlineRelatedTitleFontSize;
    data.postInlineRelatedTitleFont = typeof data.postInlineRelatedTitleFont === "string" && data.postInlineRelatedTitleFont.trim() !== ""
      ? data.postInlineRelatedTitleFont
      : (typeof data.postTitleFont === "string" && data.postTitleFont.trim() !== "" ? data.postTitleFont : "Inter");
    data.postInlineRelatedHeadingText = typeof data.postInlineRelatedHeadingText === "string" && data.postInlineRelatedHeadingText.trim() !== ""
      ? data.postInlineRelatedHeadingText.trim()
      : "Baca Juga";
    data.postInlineRelatedHeadingFont = typeof data.postInlineRelatedHeadingFont === "string" && data.postInlineRelatedHeadingFont.trim() !== ""
      ? data.postInlineRelatedHeadingFont
      : data.postInlineRelatedTitleFont;
    data.postInlineRelatedHeadingFontWeight = typeof data.postInlineRelatedHeadingFontWeight === "string" && data.postInlineRelatedHeadingFontWeight.trim() !== ""
      ? data.postInlineRelatedHeadingFontWeight
      : "700";
    data.postInlineRelatedHeadingLetterSpacing = typeof data.postInlineRelatedHeadingLetterSpacing === "string" && data.postInlineRelatedHeadingLetterSpacing.trim() !== ""
      ? data.postInlineRelatedHeadingLetterSpacing.trim()
      : "0";

    const postInlineRelatedFontSize = parseInt(data.postInlineRelatedFontSize);
    data.postInlineRelatedFontSize = isNaN(postInlineRelatedFontSize) ? 14 : postInlineRelatedFontSize;
    data.postInlineRelatedTitleFontWeight = typeof data.postInlineRelatedTitleFontWeight === "string" && data.postInlineRelatedTitleFontWeight.trim() !== ""
      ? data.postInlineRelatedTitleFontWeight
      : "700";
    data.postInlineRelatedTitleLineHeight = typeof data.postInlineRelatedTitleLineHeight === "string" && data.postInlineRelatedTitleLineHeight.trim() !== ""
      ? data.postInlineRelatedTitleLineHeight
      : "1.35";
    data.postInlineAds = Boolean(data.postInlineAds);
    data.postInlineAdPositions = typeof data.postInlineAdPositions === "string" && data.postInlineAdPositions.trim() !== ""
      ? data.postInlineAdPositions
      : "3";

    const postInlineRelatedGridColumns = parseInt(data.postInlineRelatedGridColumns);
    data.postInlineRelatedGridColumns = isNaN(postInlineRelatedGridColumns)
      ? 2
      : Math.min(4, Math.max(1, postInlineRelatedGridColumns));
    const postInlineRelatedCardColumns = parseInt(data.postInlineRelatedCardColumns);
    data.postInlineRelatedCardColumns = isNaN(postInlineRelatedCardColumns)
      ? 1
      : Math.min(2, Math.max(1, postInlineRelatedCardColumns));
    data.postImageWatermarkUrl = typeof data.postImageWatermarkUrl === "string" ? data.postImageWatermarkUrl.trim() : "";
    const postImageWatermarkOpacity = parseInt(data.postImageWatermarkOpacity);
    data.postImageWatermarkOpacity = isNaN(postImageWatermarkOpacity) ? 35 : Math.min(100, Math.max(0, postImageWatermarkOpacity));
    const postImageWatermarkSize = parseInt(data.postImageWatermarkSize);
    data.postImageWatermarkSize = isNaN(postImageWatermarkSize) ? 24 : Math.min(80, Math.max(5, postImageWatermarkSize));
    data.postImageWatermarkPosition =
      typeof data.postImageWatermarkPosition === "string" &&
      ["top", "bottom", "left", "right", "center"].includes(data.postImageWatermarkPosition)
        ? data.postImageWatermarkPosition
        : "center";
    const watermarkPaddingFields = [
      "postImageWatermarkPaddingTop",
      "postImageWatermarkPaddingRight",
      "postImageWatermarkPaddingBottom",
      "postImageWatermarkPaddingLeft",
    ] as const;
    for (const field of watermarkPaddingFields) {
      const parsedValue = parseInt(data[field]);
      data[field] = isNaN(parsedValue) ? 24 : Math.min(240, Math.max(0, parsedValue));
    }

    // IF themeId is provided, save to ThemeConfig (Theme Specific Override)
    if (themeId) {
        const themeConfig = await prisma.themeConfig.upsert({
            where: { themeId },
            update: { config: data },
            create: { themeId, config: data }
        });

        // Revalidate
        revalidateTag("settings");
        revalidateTag("homepage");
        revalidatePath("/", "layout");

        return NextResponse.json(themeConfig);
    }

    // Fix: Explicitly use empty strings instead of null
    // Prisma Schema defines these as String (required), so we cannot pass null.
    // We will use "" to represent "Default/Auto"
    
    const postInlineRelatedBgColor = data.postInlineRelatedBgColor || "";
    const postInlineRelatedHeaderBgColor = data.postInlineRelatedHeaderBgColor || "";
    const postInlineRelatedTitleColor = data.postInlineRelatedTitleColor || "";
    const postInlineRelatedTextColor = data.postInlineRelatedTextColor || "";
    const postInlineRelatedHoverColor = data.postInlineRelatedHoverColor || "";

    // Validate Colors (Ensure no null values are passed)
    const homeWidgetTitleColor = data.homeWidgetTitleColor || "#1e293b";
    const homeNewsTitleColor = data.homeNewsTitleColor || "#111827";
    const homeHoverColor = data.homeHoverColor || "#2563eb";
    const homeExcerptColor = data.homeExcerptColor || "#4b5563";
    const homeMetaColor = data.homeMetaColor || "#9ca3af";

    const postWidgetTitleColor = data.postWidgetTitleColor || "#1e293b";
    const postContentColor = data.postContentColor || "#374151";
    const postMetaColor = data.postMetaColor || data.metaColor || "#94a3b8";
    const postLinkColor = data.postLinkColor || data.postHoverColor || data.homeHoverColor || "#2563eb";
    const postLinkHoverColor = data.postLinkHoverColor || data.postHoverColor || data.homeHoverColor || "#1d4ed8";
    const postBadgeTextColor = data.postBadgeTextColor || data.postMetaColor || data.metaColor || "#374151";
    const postBadgeBgColor = data.postBadgeBgColor || "#f3f4f6";

    const globalPrimaryColor = data.globalPrimaryColor || "#2563eb";
    const globalSecondaryColor = data.globalSecondaryColor || "#64748b";
    const globalAccentColor = data.globalAccentColor || "#f59e0b";
    const globalBackgroundColor = data.globalBackgroundColor || "#ffffff";
    const globalBorderColor = data.globalBorderColor || "#e5e7eb";
    const globalSurfaceColor = data.globalSurfaceColor || "#f9fafb";
    const globalElevatedColor = data.globalElevatedColor || "#ffffff";
    const globalMutedTextColor = data.globalMutedTextColor || data.metaColor || "#9ca3af";

    // ELSE Update Global Styles AND Sync to Post/Home Specifics
    // @ts-ignore
    const updatedSetting = await prisma.setting.upsert({
      where: { id: "default" },
      update: {
        // ... (Base Info & Global - unchanged)
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        logoUrl: data.logoUrl,
        faviconUrl: data.faviconUrl,
        activeTheme: data.activeTheme,
        insertCodeHead: insertCodeHeadUpdate,
        insertCodeBody: insertCodeBodyUpdate,
        insertCodeFooter: insertCodeFooterUpdate,

        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        accentColor: data.accentColor,
        backgroundColor: data.backgroundColor,
        headingColor: data.headingColor,
        excerptColor: data.excerptColor,
        metaColor: data.metaColor,
        headingFont: data.headingFont,
        bodyFont: data.bodyFont,
        baseFontSize: data.baseFontSize,
        globalBorderRadius: data.globalBorderRadius,
        
        // Layout Containers
        homeContainerWidth: data.homeContainerWidth,
        homeCustomContainerWidth: data.homeCustomContainerWidth,
        postContainerWidth: data.postContainerWidth,
        postCustomContainerWidth: data.postCustomContainerWidth,
        globalContainerWidth: data.globalContainerWidth,
        globalCustomContainerWidth: data.globalCustomContainerWidth,
        
        // NEW COLORS (Homepage)
        homeWidgetTitleColor: homeWidgetTitleColor,
        homeNewsTitleColor: homeNewsTitleColor,
        homeHoverColor: homeHoverColor,
        homeExcerptColor: homeExcerptColor,
        homeMetaColor: homeMetaColor,

        // NEW COLORS (Single Post)
        postWidgetTitleColor: postWidgetTitleColor,
        postContentColor: postContentColor,
        postMetaColor: postMetaColor,
        postLinkColor: postLinkColor,
        postLinkHoverColor: postLinkHoverColor,
        postBadgeTextColor: postBadgeTextColor,
        postBadgeBgColor: postBadgeBgColor,
        
        // NEW COLORS (Global)
        globalPrimaryColor: globalPrimaryColor,
        globalSecondaryColor: globalSecondaryColor,
        globalAccentColor: globalAccentColor,
        globalBackgroundColor: globalBackgroundColor,
        globalBorderColor: globalBorderColor,
        globalSurfaceColor: globalSurfaceColor,
        globalElevatedColor: globalElevatedColor,
        globalMutedTextColor: globalMutedTextColor,
        globalBackgroundImage: data.globalBackgroundImage,
        globalBackgroundRepeat: data.globalBackgroundRepeat,
        globalBackgroundSize: data.globalBackgroundSize,
        globalBackgroundPosition: data.globalBackgroundPosition,
        globalBackgroundAttachment: data.globalBackgroundAttachment,

        // Typography - Homepage
        homeWidgetTitleFontSize: data.homeWidgetTitleFontSize || "24px",
        homeWidgetTitleFontWeight: data.homeWidgetTitleFontWeight || "700",
        homeWidgetTitleLineHeight: data.homeWidgetTitleLineHeight || "1.3",
        homeWidgetTitleFont: data.homeWidgetTitleFont || "Inter",
        homeNewsTitleFontSize: data.homeNewsTitleFontSize || "18px",
        homeNewsTitleFontWeight: data.homeNewsTitleFontWeight || "600",
        homeNewsTitleLineHeight: data.homeNewsTitleLineHeight || "1.35",
        homeNewsTitleFont: data.homeNewsTitleFont || "Inter",
        homeExcerptFontSize: data.homeExcerptFontSize || "14px",
        homeExcerptFontWeight: data.homeExcerptFontWeight || "400",
        homeExcerptLineHeight: data.homeExcerptLineHeight || "1.6",
        homeExcerptFont: data.homeExcerptFont || "Inter",
        homeMetaFontSize: data.homeMetaFontSize || "12px",
        homeMetaFontWeight: data.homeMetaFontWeight || "500",
        homeMetaLineHeight: data.homeMetaLineHeight || "1.4",
        homeMetaFont: data.homeMetaFont || "Inter",

        // Typography - Single Post
        postTitleFontSize: data.postTitleFontSize || "32px",
        postTitleFontWeight: data.postTitleFontWeight || "700",
        postTitleLineHeight: data.postTitleLineHeight || "1.15",
        postTitleFont: data.postTitleFont || "Inter",
        postSubtitleFontSize: data.postSubtitleFontSize || "18px",
        postSubtitleFontWeight: data.postSubtitleFontWeight || "500",
        postSubtitleLineHeight: data.postSubtitleLineHeight || "1.6",
        postSubtitleFont: data.postSubtitleFont || "Inter",
        postContentFontSize: data.postContentFontSize || "18px",
        postContentFontWeight: data.postContentFontWeight || "400",
        postContentLineHeight: data.postContentLineHeight || data.globalContentLineHeight || "1.8",
        postContentFont: data.postContentFont || "Inter",
        postWidgetTitleFontSize: data.postWidgetTitleFontSize || "20px",
        postWidgetTitleFontWeight: data.postWidgetTitleFontWeight || "600",
        postWidgetTitleLineHeight: data.postWidgetTitleLineHeight || "1.3",
        postWidgetTitleFont: data.postWidgetTitleFont || "Inter",

        // Typography - Archive
        archiveTitleFontSize: data.archiveTitleFontSize || "24px",
        archiveTitleFontWeight: data.archiveTitleFontWeight || "700",
        archiveTitleFont: data.archiveTitleFont || "Inter",
        archiveExcerptFontSize: data.archiveExcerptFontSize || "14px",
        archiveExcerptFontWeight: data.archiveExcerptFontWeight || "400",
        archiveExcerptFont: data.archiveExcerptFont || "Inter",
        archiveMetaFontSize: data.archiveMetaFontSize || "12px",
        archiveMetaFontWeight: data.archiveMetaFontWeight || "500",
        archiveMetaFont: data.archiveMetaFont || "Inter",
        
        // Typography - Global (Fallback)
        globalWidgetTitleFontSize: data.globalWidgetTitleFontSize || "20px",
        globalWidgetTitleFontWeight: data.globalWidgetTitleFontWeight || "600",
        globalWidgetTitleLineHeight: data.globalWidgetTitleLineHeight || "1.3",
        globalWidgetTitleFont: data.globalWidgetTitleFont || "Inter",
        globalNewsTitleFontSize: data.globalNewsTitleFontSize || "18px",
        globalNewsTitleFontWeight: data.globalNewsTitleFontWeight || "600",
        globalNewsTitleLineHeight: data.globalNewsTitleLineHeight || "1.35",
        globalNewsTitleFont: data.globalNewsTitleFont || "Inter",
        globalMetaFontSize: data.globalMetaFontSize || "12px",
        globalMetaFontWeight: data.globalMetaFontWeight || "500",
        globalMetaLineHeight: data.globalMetaLineHeight || "1.4",
        globalMetaFont: data.globalMetaFont || "Inter",
        globalExcerptFontSize: data.globalExcerptFontSize || "14px",
        globalExcerptFontWeight: data.globalExcerptFontWeight || "400",
        globalExcerptFont: data.globalExcerptFont || "Inter",
        globalContentFontSize: data.globalContentFontSize || "16px",
        globalContentFontWeight: data.globalContentFontWeight || "400",
        globalContentLineHeight: data.globalContentLineHeight || "1.8",
        globalContentFont: data.globalContentFont || "Inter",

        // SYNC: Force Post & Home to use Global Colors (Legacy Support)
        postPrimaryColor: data.primaryColor,
        postSecondaryColor: data.secondaryColor,
        postAccentColor: data.accentColor,
        postBackgroundColor: data.backgroundColor,
        postHeadingColor: data.headingColor,
        postExcerptColor: data.excerptColor,
        postHeadingFont: data.headingFont,
        postBodyFont: data.bodyFont,
        postGlobalBorderRadius: data.globalBorderRadius,

        // Single Post Features
        postInlineRelated: data.postInlineRelated,
        postRelatedCount: data.postRelatedCount,
        postRelatedPosition: data.postRelatedPosition,
        postRelatedPositions: data.postRelatedPositions,
        postInlineRelatedFilterType: data.postInlineRelatedFilterType,
        postInlineRelatedDateRange: data.postInlineRelatedDateRange,
        postInlineRelatedLayout: data.postInlineRelatedLayout,
        postInlineRelatedGridColumns: data.postInlineRelatedGridColumns,
        postInlineRelatedCardColumns: data.postInlineRelatedCardColumns,
        postInlineRelatedTitleFontSize: data.postInlineRelatedTitleFontSize,
        postInlineRelatedTitleFont: data.postInlineRelatedTitleFont,
        postInlineRelatedTitleFontWeight: data.postInlineRelatedTitleFontWeight,
        postInlineRelatedTitleLineHeight: data.postInlineRelatedTitleLineHeight,
        postInlineRelatedHeadingText: data.postInlineRelatedHeadingText,
        postInlineRelatedHeadingFont: data.postInlineRelatedHeadingFont,
        postInlineRelatedHeadingFontWeight: data.postInlineRelatedHeadingFontWeight,
        postInlineRelatedHeadingLetterSpacing: data.postInlineRelatedHeadingLetterSpacing,
        postInlineRelatedFontSize: data.postInlineRelatedFontSize,
        
        // COLOR FIX: Use the cleaned variables
        postInlineRelatedBgColor: postInlineRelatedBgColor,
        // @ts-ignore
        postInlineRelatedHeaderBgColor: postInlineRelatedHeaderBgColor,
        postInlineRelatedTitleColor: postInlineRelatedTitleColor,
        postInlineRelatedTextColor: postInlineRelatedTextColor,
        postInlineRelatedHoverColor: postInlineRelatedHoverColor,
        postImageWatermarkUrl: data.postImageWatermarkUrl,
        postImageWatermarkOpacity: data.postImageWatermarkOpacity,
        postImageWatermarkSize: data.postImageWatermarkSize,
        postImageWatermarkPosition: data.postImageWatermarkPosition,
        postImageWatermarkPaddingTop: data.postImageWatermarkPaddingTop,
        postImageWatermarkPaddingRight: data.postImageWatermarkPaddingRight,
        postImageWatermarkPaddingBottom: data.postImageWatermarkPaddingBottom,
        postImageWatermarkPaddingLeft: data.postImageWatermarkPaddingLeft,
        postInlineAds: data.postInlineAds,
        postInlineAdPositions: data.postInlineAdPositions,
        
        postBottomRelated: data.postBottomRelated,
        postAuthorBox: data.postAuthorBox,
        postNavigation: data.postNavigation,

        // Gallery Settings
        galleryLayout: data.galleryLayout,
        galleryEnableLightbox: data.galleryEnableLightbox,
        galleryShowExif: data.galleryShowExif,
        galleryAutoPlay: data.galleryAutoPlay,

        // Notification Settings
        notificationTelegramEnabled: data.notificationTelegramEnabled ?? false,
        notificationTelegramBotToken: data.notificationTelegramBotToken || "",
        notificationTelegramChatId: data.notificationTelegramChatId || "",
        notificationEmailEnabled: data.notificationEmailEnabled ?? false,
        notificationEmailFrom: data.notificationEmailFrom || "",
        notificationEvents: data.notificationEvents || { onNewPost: true, onPostRejected: true, onPostPublished: true },
        ...(wantsToUpdateAiKey ? { aiOpenAiApiKeyEnc: aiKeyEnc } : {}),
      } as any,
      create: {
        id: "default",
        
        // Base Info
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        logoUrl: data.logoUrl,
        faviconUrl: data.faviconUrl,
        activeTheme: data.activeTheme,
        insertCodeHead: insertCodeHeadCreate,
        insertCodeBody: insertCodeBodyCreate,
        insertCodeFooter: insertCodeFooterCreate,

        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        accentColor: data.accentColor,
        backgroundColor: data.backgroundColor,
        headingColor: data.headingColor,
        excerptColor: data.excerptColor,
        metaColor: data.metaColor,
        headingFont: data.headingFont,
        bodyFont: data.bodyFont,
        baseFontSize: data.baseFontSize,
        globalBorderRadius: data.globalBorderRadius,
        
        // Layout Containers
        homeContainerWidth: data.homeContainerWidth,
        homeCustomContainerWidth: data.homeCustomContainerWidth,
        postContainerWidth: data.postContainerWidth,
        postCustomContainerWidth: data.postCustomContainerWidth,
        globalContainerWidth: data.globalContainerWidth,
        globalCustomContainerWidth: data.globalCustomContainerWidth,
        
        // NEW COLORS (Homepage)
        homeWidgetTitleColor: homeWidgetTitleColor,
        homeNewsTitleColor: homeNewsTitleColor,
        homeHoverColor: homeHoverColor,
        homeExcerptColor: homeExcerptColor,
        homeMetaColor: homeMetaColor,

        // NEW COLORS (Single Post)
        postWidgetTitleColor: postWidgetTitleColor,
        postContentColor: postContentColor,
        postMetaColor: postMetaColor,
        postLinkColor: postLinkColor,
        postLinkHoverColor: postLinkHoverColor,
        postBadgeTextColor: postBadgeTextColor,
        postBadgeBgColor: postBadgeBgColor,
        
        // NEW COLORS (Global)
        globalPrimaryColor: globalPrimaryColor,
        globalSecondaryColor: globalSecondaryColor,
        globalAccentColor: globalAccentColor,
        globalBackgroundColor: globalBackgroundColor,
        globalBorderColor: globalBorderColor,
        globalSurfaceColor: globalSurfaceColor,
        globalElevatedColor: globalElevatedColor,
        globalMutedTextColor: globalMutedTextColor,
        globalBackgroundImage: data.globalBackgroundImage,

        // Typography - Homepage
        homeWidgetTitleFontSize: data.homeWidgetTitleFontSize || "24px",
        homeWidgetTitleFontWeight: data.homeWidgetTitleFontWeight || "700",
        homeWidgetTitleLineHeight: data.homeWidgetTitleLineHeight || "1.3",
        homeWidgetTitleFont: data.homeWidgetTitleFont || "Inter",
        homeNewsTitleFontSize: data.homeNewsTitleFontSize || "18px",
        homeNewsTitleFontWeight: data.homeNewsTitleFontWeight || "600",
        homeNewsTitleLineHeight: data.homeNewsTitleLineHeight || "1.35",
        homeNewsTitleFont: data.homeNewsTitleFont || "Inter",
        homeExcerptFontSize: data.homeExcerptFontSize || "14px",
        homeExcerptFontWeight: data.homeExcerptFontWeight || "400",
        homeExcerptLineHeight: data.homeExcerptLineHeight || "1.6",
        homeExcerptFont: data.homeExcerptFont || "Inter",
        homeMetaFontSize: data.homeMetaFontSize || "12px",
        homeMetaFontWeight: data.homeMetaFontWeight || "500",
        homeMetaLineHeight: data.homeMetaLineHeight || "1.4",
        homeMetaFont: data.homeMetaFont || "Inter",

        // Typography - Single Post
        postTitleFontSize: data.postTitleFontSize || "32px",
        postTitleFontWeight: data.postTitleFontWeight || "700",
        postTitleLineHeight: data.postTitleLineHeight || "1.15",
        postTitleFont: data.postTitleFont || "Inter",
        postSubtitleFontSize: data.postSubtitleFontSize || "18px",
        postSubtitleFontWeight: data.postSubtitleFontWeight || "500",
        postSubtitleLineHeight: data.postSubtitleLineHeight || "1.6",
        postSubtitleFont: data.postSubtitleFont || "Inter",
        postContentFontSize: data.postContentFontSize || "18px",
        postContentFontWeight: data.postContentFontWeight || "400",
        postContentLineHeight: data.postContentLineHeight || data.globalContentLineHeight || "1.8",
        postContentFont: data.postContentFont || "Inter",
        postWidgetTitleFontSize: data.postWidgetTitleFontSize || "20px",
        postWidgetTitleFontWeight: data.postWidgetTitleFontWeight || "600",
        postWidgetTitleLineHeight: data.postWidgetTitleLineHeight || "1.3",
        postWidgetTitleFont: data.postWidgetTitleFont || "Inter",

        // Typography - Archive
        archiveTitleFontSize: data.archiveTitleFontSize || "24px",
        archiveTitleFontWeight: data.archiveTitleFontWeight || "700",
        archiveTitleFont: data.archiveTitleFont || "Inter",
        archiveExcerptFontSize: data.archiveExcerptFontSize || "14px",
        archiveExcerptFontWeight: data.archiveExcerptFontWeight || "400",
        archiveExcerptFont: data.archiveExcerptFont || "Inter",
        archiveMetaFontSize: data.archiveMetaFontSize || "12px",
        archiveMetaFontWeight: data.archiveMetaFontWeight || "500",
        archiveMetaFont: data.archiveMetaFont || "Inter",
        
        // Typography - Global (Fallback)
        globalWidgetTitleFontSize: data.globalWidgetTitleFontSize || "20px",
        globalWidgetTitleFontWeight: data.globalWidgetTitleFontWeight || "600",
        globalWidgetTitleLineHeight: data.globalWidgetTitleLineHeight || "1.3",
        globalWidgetTitleFont: data.globalWidgetTitleFont || "Inter",
        globalNewsTitleFontSize: data.globalNewsTitleFontSize || "18px",
        globalNewsTitleFontWeight: data.globalNewsTitleFontWeight || "600",
        globalNewsTitleLineHeight: data.globalNewsTitleLineHeight || "1.35",
        globalNewsTitleFont: data.globalNewsTitleFont || "Inter",
        globalMetaFontSize: data.globalMetaFontSize || "12px",
        globalMetaFontWeight: data.globalMetaFontWeight || "500",
        globalMetaLineHeight: data.globalMetaLineHeight || "1.4",
        globalMetaFont: data.globalMetaFont || "Inter",
        globalExcerptFontSize: data.globalExcerptFontSize || "14px",
        globalExcerptFontWeight: data.globalExcerptFontWeight || "400",
        globalExcerptFont: data.globalExcerptFont || "Inter",
        globalContentFontSize: data.globalContentFontSize || "16px",
        globalContentFontWeight: data.globalContentFontWeight || "400",
        globalContentLineHeight: data.globalContentLineHeight || "1.8",
        globalContentFont: data.globalContentFont || "Inter",

        // SYNC: Force Post & Home to use Global Colors (Legacy Support)
        postPrimaryColor: data.primaryColor,
        postSecondaryColor: data.secondaryColor,
        postAccentColor: data.accentColor,
        postBackgroundColor: data.backgroundColor,
        postHeadingColor: data.headingColor,
        postExcerptColor: data.excerptColor,
        postHeadingFont: data.headingFont,
        postBodyFont: data.bodyFont,
        postGlobalBorderRadius: data.globalBorderRadius,

        // Single Post Features
        postInlineRelated: data.postInlineRelated,
        postRelatedCount: data.postRelatedCount,
        postRelatedPosition: data.postRelatedPosition,
        postRelatedPositions: data.postRelatedPositions,
        postInlineRelatedFilterType: data.postInlineRelatedFilterType,
        postInlineRelatedDateRange: data.postInlineRelatedDateRange,
        postInlineRelatedLayout: data.postInlineRelatedLayout,
        postInlineRelatedGridColumns: data.postInlineRelatedGridColumns,
        postInlineRelatedCardColumns: data.postInlineRelatedCardColumns,
        postInlineRelatedTitleFontSize: data.postInlineRelatedTitleFontSize,
        postInlineRelatedTitleFont: data.postInlineRelatedTitleFont,
        postInlineRelatedTitleFontWeight: data.postInlineRelatedTitleFontWeight,
        postInlineRelatedTitleLineHeight: data.postInlineRelatedTitleLineHeight,
        postInlineRelatedHeadingText: data.postInlineRelatedHeadingText,
        postInlineRelatedHeadingFont: data.postInlineRelatedHeadingFont,
        postInlineRelatedHeadingFontWeight: data.postInlineRelatedHeadingFontWeight,
        postInlineRelatedHeadingLetterSpacing: data.postInlineRelatedHeadingLetterSpacing,
        postInlineRelatedFontSize: data.postInlineRelatedFontSize,
        
        // COLOR FIX: Use the cleaned variables
        postInlineRelatedBgColor: postInlineRelatedBgColor,
        // @ts-ignore
        postInlineRelatedHeaderBgColor: postInlineRelatedHeaderBgColor,
        postInlineRelatedTitleColor: postInlineRelatedTitleColor,
        postInlineRelatedTextColor: postInlineRelatedTextColor,
        postInlineRelatedHoverColor: postInlineRelatedHoverColor,
        postImageWatermarkUrl: data.postImageWatermarkUrl,
        postImageWatermarkOpacity: data.postImageWatermarkOpacity,
        postImageWatermarkSize: data.postImageWatermarkSize,
        postImageWatermarkPosition: data.postImageWatermarkPosition,
        postImageWatermarkPaddingTop: data.postImageWatermarkPaddingTop,
        postImageWatermarkPaddingRight: data.postImageWatermarkPaddingRight,
        postImageWatermarkPaddingBottom: data.postImageWatermarkPaddingBottom,
        postImageWatermarkPaddingLeft: data.postImageWatermarkPaddingLeft,
        postInlineAds: data.postInlineAds,
        postInlineAdPositions: data.postInlineAdPositions,
        
        postBottomRelated: data.postBottomRelated,
        postAuthorBox: data.postAuthorBox,
        postNavigation: data.postNavigation,

        // Gallery Settings
        galleryLayout: data.galleryLayout,
        galleryEnableLightbox: data.galleryEnableLightbox,
        galleryShowExif: data.galleryShowExif,
        galleryAutoPlay: data.galleryAutoPlay,

        // Notification Settings
        notificationTelegramEnabled: data.notificationTelegramEnabled ?? false,
        notificationTelegramBotToken: data.notificationTelegramBotToken || "",
        notificationTelegramChatId: data.notificationTelegramChatId || "",
        notificationEmailEnabled: data.notificationEmailEnabled ?? false,
        notificationEmailFrom: data.notificationEmailFrom || "",
        notificationEmailTo: data.notificationEmailTo || "",
        notificationSmtpHost: data.notificationSmtpHost || "",
        notificationSmtpPort: parseInt(data.notificationSmtpPort) || 587,
        notificationSmtpUser: data.notificationSmtpUser || "",
        notificationSmtpPass: data.notificationSmtpPass || "",
        notificationSmtpSecure: data.notificationSmtpSecure ?? true,
        notificationEvents: data.notificationEvents || { onNewPost: true, onPostRejected: true, onPostPublished: true },
        ...(wantsToUpdateAiKey ? { aiOpenAiApiKeyEnc: aiKeyEnc } : {}),
      } as any
    });

    const activeThemeId = updatedSetting.activeTheme || data.activeTheme || "classic";
    const existingThemeConfig = await (prisma as any).themeConfig.findUnique({
      where: { themeId: activeThemeId },
    });
    const mergedThemeConfig: Record<string, unknown> = {
      ...(existingThemeConfig?.config &&
      typeof existingThemeConfig.config === "object" &&
      !Array.isArray(existingThemeConfig.config)
        ? (existingThemeConfig.config as Record<string, unknown>)
        : {}),
    };

    for (const key of THEME_GLOBAL_STYLE_SYNC_KEYS) {
      mergedThemeConfig[key] = data[key];
    }

    mergedThemeConfig.globalBorderRadius = data.globalBorderRadius;
    mergedThemeConfig.postGlobalBorderRadius = data.globalBorderRadius;

    await (prisma as any).themeConfig.upsert({
      where: { themeId: activeThemeId },
      update: { config: mergedThemeConfig },
      create: { themeId: activeThemeId, config: mergedThemeConfig },
    });

    // Revalidate Settings Cache (Immediate Update)
    revalidateTag("settings");
    revalidateTag("homepage"); // Ensure home gets fresh styles
    revalidatePath("/", "layout"); // Refresh root layout (fonts/vars)

    return NextResponse.json(updatedSetting);
  } catch (error: any) {
    console.error("==========================================");
    console.error("SETTINGS API UPDATE ERROR DETAIL:");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Meta:", error.meta);
    console.error("Stack:", error.stack);
    console.error("==========================================");
    
    return NextResponse.json({ 
        error: error.message || "Gagal update settings",
        details: error.code ? `Prisma Error Code: ${error.code}` : undefined
    }, { status: 500 });
  }
}
