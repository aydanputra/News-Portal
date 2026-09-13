import { prisma } from "@/lib/prisma";
import { normalizeDeprecatedFontChoice, denormalizeDeprecatedFontChoice } from "@/lib/font-utils";
import { unstable_cache } from "next/cache";

const THEME_GLOBAL_ONLY_KEYS = [
  "id",
  "siteName",
  "siteDescription",
  "logoUrl",
  "faviconUrl",
  "activeTheme",
  "insertCodeHead",
  "insertCodeBody",
  "insertCodeFooter",
  "notificationTelegramEnabled",
  "notificationTelegramBotToken",
  "notificationTelegramChatId",
  "notificationEmailEnabled",
  "notificationEmailFrom",
  "notificationEmailTo",
  "notificationSmtpHost",
  "notificationSmtpPort",
  "notificationSmtpUser",
  "notificationSmtpPass",
  "notificationSmtpSecure",
  "notificationEvents",
  "printSettings",
  "globalBorderRadius",
  "postGlobalBorderRadius",
  "aiOpenAiApiKeyEnc",
  "createdAt",
  "updatedAt",
] as const;

const THEME_GLOBAL_STYLE_COLOR_KEYS = [
  "homeWidgetTitleColor",
  "homeNewsTitleColor",
  "homeHoverColor",
  "homeExcerptColor",
  "homeMetaColor",
  "postWidgetTitleColor",
  "postContentColor",
  "postMetaColor",
  "postLinkColor",
  "postLinkHoverColor",
  "postBadgeTextColor",
  "postBadgeBgColor",
  "globalPrimaryColor",
  "globalSecondaryColor",
  "globalAccentColor",
  "globalBackgroundColor",
  "globalBorderColor",
  "globalSurfaceColor",
  "globalElevatedColor",
  "globalMutedTextColor",
  "globalBackgroundImage",
  "globalBackgroundRepeat",
  "globalBackgroundSize",
  "globalBackgroundPosition",
  "globalBackgroundAttachment",
  "postInlineRelated",
  "postRelatedCount",
  "postRelatedPosition",
  "postRelatedPositions",
  "postInlineRelatedFilterType",
  "postInlineRelatedDateRange",
  "postInlineRelatedLayout",
  "postInlineRelatedGridColumns",
  "postInlineRelatedCardColumns",
  "postInlineRelatedTitleFontSize",
  "postInlineRelatedTitleFont",
  "postInlineRelatedTitleFontWeight",
  "postInlineRelatedTitleLineHeight",
  "postInlineRelatedHeadingText",
  "postInlineRelatedHeadingFont",
  "postInlineRelatedHeadingFontWeight",
  "postInlineRelatedHeadingLetterSpacing",
  "postInlineRelatedFontSize",
  "postInlineRelatedBgColor",
  "postInlineRelatedHeaderBgColor",
  "postInlineRelatedTitleColor",
  "postInlineRelatedTextColor",
  "postInlineRelatedHoverColor",
] as const;

// Tipografi global hanya disinkronkan ke themeConfig saat Simpan Global.
// Sengaja TIDAK dimasukkan ke THEME_SETTING_PRESERVE_KEYS, supaya nilai
// per-tema (yang dipakai pengaturan modal widget) tetap menang saat merge.
const THEME_GLOBAL_TYPOGRAPHY_KEYS = [
  // Typography - Homepage
  "homeWidgetTitleFontSize",
  "homeWidgetTitleFontWeight",
  "homeWidgetTitleLineHeight",
  "homeWidgetTitleFont",
  "homeNewsTitleFontSize",
  "homeNewsTitleFontWeight",
  "homeNewsTitleLineHeight",
  "homeNewsTitleFont",
  "homeExcerptFontSize",
  "homeExcerptFontWeight",
  "homeExcerptLineHeight",
  "homeExcerptFont",
  "homeMetaFontSize",
  "homeMetaFontWeight",
  "homeMetaLineHeight",
  "homeMetaFont",
  // Typography - Global (Fallback)
  "globalWidgetTitleFontSize",
  "globalWidgetTitleFontWeight",
  "globalWidgetTitleLineHeight",
  "globalWidgetTitleFont",
  "globalNewsTitleFontSize",
  "globalNewsTitleFontWeight",
  "globalNewsTitleLineHeight",
  "globalNewsTitleFont",
  "globalMetaFontSize",
  "globalMetaFontWeight",
  "globalMetaLineHeight",
  "globalMetaFont",
  "globalExcerptFontSize",
  "globalExcerptFontWeight",
  "globalExcerptFont",
  "globalContentFontSize",
  "globalContentFontWeight",
  "globalContentLineHeight",
  "globalContentFont",
  // Typography - Archive
  "archiveTitleFontSize",
  "archiveTitleFontWeight",
  "archiveTitleFont",
  "archiveExcerptFontSize",
  "archiveExcerptFontWeight",
  "archiveExcerptFont",
  "archiveMetaFontSize",
  "archiveMetaFontWeight",
  "archiveMetaFont",
] as const;

export const THEME_GLOBAL_STYLE_SYNC_KEYS = [
  ...THEME_GLOBAL_STYLE_COLOR_KEYS,
  ...THEME_GLOBAL_TYPOGRAPHY_KEYS,
] as const;

const THEME_SETTING_PRESERVE_KEYS = [
  ...THEME_GLOBAL_ONLY_KEYS,
  ...THEME_GLOBAL_STYLE_COLOR_KEYS,
] as const;

export const FONT_SETTING_KEYS = [
  "headingFont",
  "bodyFont",
  "homeWidgetTitleFont",
  "homeNewsTitleFont",
  "homeExcerptFont",
  "homeMetaFont",
  "postTitleFont",
  "postSubtitleFont",
  "postContentFont",
  "postWidgetTitleFont",
  "postInlineRelatedTitleFont",
  "postInlineRelatedHeadingFont",
  "archiveTitleFont",
  "archiveExcerptFont",
  "archiveMetaFont",
  "globalWidgetTitleFont",
  "globalNewsTitleFont",
  "globalMetaFont",
  "globalExcerptFont",
  "globalContentFont",
] as const;

export function normalizeDeprecatedSettingFonts(setting: any) {
  if (!setting || typeof setting !== "object") return setting;

  const normalized = { ...setting };
  for (const key of FONT_SETTING_KEYS) {
    if (typeof normalized[key] === "string") {
      normalized[key] = normalizeDeprecatedFontChoice(normalized[key], "Inter");
    }
  }

  return normalized;
}

export function denormalizeSettingFonts(setting: any) {
  if (!setting || typeof setting !== "object") return setting;

  const denormalized = { ...setting };
  for (const key of FONT_SETTING_KEYS) {
    if (typeof denormalized[key] === "string") {
      denormalized[key] = denormalizeDeprecatedFontChoice(denormalized[key]);
    }
  }

  return denormalized;
}

export function mergeThemeConfigWithSettings(baseSetting: any, themeConfig: unknown) {
  if (!baseSetting || typeof baseSetting !== "object") return baseSetting;
  if (!themeConfig || typeof themeConfig !== "object" || Array.isArray(themeConfig)) return baseSetting;

  const mergedSetting = {
    ...baseSetting,
    ...(themeConfig as object),
  };

  for (const key of THEME_SETTING_PRESERVE_KEYS) {
    mergedSetting[key] = baseSetting[key];
  }

  return mergedSetting;
}

function stripSecrets(setting: any) {
  if (!setting || typeof setting !== "object") return setting;

  const {
    notificationTelegramBotToken: _notificationTelegramBotToken,
    notificationTelegramChatId: _notificationTelegramChatId,
    notificationEmailTo: _notificationEmailTo,
    notificationSmtpHost: _notificationSmtpHost,
    notificationSmtpPort: _notificationSmtpPort,
    notificationSmtpUser: _notificationSmtpUser,
    notificationSmtpPass: _notificationSmtpPass,
    notificationSmtpSecure: _notificationSmtpSecure,
    aiOpenAiApiKeyEnc: _aiOpenAiApiKeyEnc,
    ...rest
  } = setting as any;

  return rest;
}

async function fetchSettingsUncached() {
  let setting: any = await prisma.setting.findUnique({ where: { id: "default" } });
  if (!setting) {
    setting = await prisma.setting.create({
      data: { id: "default" },
    });
  }

  const activeTheme = setting.activeTheme || "classic";
  const themeConfig = await prisma.themeConfig.findUnique({
    where: { themeId: activeTheme },
  });

  if (themeConfig && themeConfig.config) {
    setting = mergeThemeConfigWithSettings(setting, themeConfig.config);
  }

  return stripSecrets(normalizeDeprecatedSettingFonts(setting));
}

const getSettingsCached = unstable_cache(fetchSettingsUncached, ["settings"], {
  revalidate: 300,
  tags: ["settings"],
});

export async function getSettings() {
  try {
    return await getSettingsCached();
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return {};
  }
}
