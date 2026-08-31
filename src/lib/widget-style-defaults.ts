import {
  resolveThemeFontFamily,
  resolveThemeFontSynthesis,
} from "@/lib/font-utils";

export type WidgetRenderContext = "homepage" | "single-post" | "archive";

type SettingsLike = Record<string, any> | null | undefined;

const readString = (value: unknown, fallback: string) => {
  if (typeof value === "string" && value.trim() !== "") return value;
  return fallback;
};

const readCssSize = (value: unknown, fallback: string) => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    return trimmed;
  }
  return fallback;
};

const resolvePublicFont = (value: unknown, fallback: string) => {
  const text = readString(value, fallback);
  return resolveThemeFontFamily(text, fallback);
};

const resolvePublicFontSynthesis = (value: unknown, fallback: string) => {
  return resolveThemeFontSynthesis(readString(value, fallback));
};

export function getWidgetRenderContextFromBuilderLocation(
  location: "home" | "archive" | "header" | "footer" | "post" = "home"
): WidgetRenderContext {
  switch (location) {
    case "post":
      return "single-post";
    case "archive":
      return "archive";
    default:
      return "homepage";
  }
}

export function resolveWidgetGlobalBorderRadius(setting: SettingsLike) {
  if (typeof setting?.globalBorderRadius === "string" && setting.globalBorderRadius.trim() !== "") {
    return setting.globalBorderRadius;
  }

  switch (setting?.homeMainColumnBorderRadius) {
    case "none":
      return "0";
    case "sm":
      return "0.125rem";
    case "md":
      return "0.375rem";
    case "lg":
      return "0.5rem";
    case "xl":
      return "0.75rem";
    case "2xl":
      return "1rem";
    default:
      return "0.75rem";
  }
}

export function resolveWidgetStyleDefaults(setting: SettingsLike, context: WidgetRenderContext) {
  const accentColor = readString(
    setting?.globalAccentColor ?? setting?.accentColor ?? setting?.primaryColor,
    "#f59e0b"
  );
  const globalWidgetTitleColor = readString(setting?.globalWidgetTitleColor ?? setting?.headingColor, "#1e293b");
  const globalNewsTitleColor = readString(setting?.globalNewsTitleColor ?? setting?.headingColor, "#111827");
  const globalExcerptColor = readString(setting?.globalExcerptColor ?? setting?.excerptColor, "#4b5563");
  const globalMetaColor = readString(setting?.globalMetaColor ?? setting?.metaColor, "#9ca3af");
  const borderColor = readString(setting?.globalBorderColor, "#e5e7eb");
  const surfaceColor = readString(setting?.globalSurfaceColor ?? setting?.globalBackgroundColor ?? setting?.backgroundColor, "#f9fafb");
  const elevatedColor = readString(setting?.globalElevatedColor ?? setting?.globalBackgroundColor ?? setting?.backgroundColor, "#ffffff");
  const mutedTextColor = readString(setting?.globalMutedTextColor ?? setting?.globalMetaColor ?? setting?.metaColor, "#9ca3af");

  const globalWidgetTitleFontSize = readCssSize(setting?.globalWidgetTitleFontSize, "20px");
  const globalWidgetTitleFontWeight = readString(setting?.globalWidgetTitleFontWeight, "600");
  const globalWidgetTitleLineHeight = readString(setting?.globalWidgetTitleLineHeight, "1.3");
  const globalWidgetTitleFont = resolvePublicFont(setting?.globalWidgetTitleFont, "Inter");
  const globalNewsTitleFontSize = readCssSize(setting?.globalNewsTitleFontSize, "18px");
  const globalNewsTitleFontWeight = readString(setting?.globalNewsTitleFontWeight, "600");
  const globalNewsTitleLineHeight = readString(setting?.globalNewsTitleLineHeight, "1.35");
  const globalNewsTitleFont = resolvePublicFont(setting?.globalNewsTitleFont, "Inter");
  const globalExcerptFontSize = readCssSize(setting?.globalExcerptFontSize, "14px");
  const globalExcerptFontWeight = readString(setting?.globalExcerptFontWeight, "400");
  const globalExcerptLineHeight = readString(setting?.globalContentLineHeight, "1.6");
  const globalExcerptFont = resolvePublicFont(setting?.globalExcerptFont, "Inter");
  const globalMetaFontSize = readCssSize(setting?.globalMetaFontSize, "12px");
  const globalMetaFontWeight = readString(setting?.globalMetaFontWeight, "500");
  const globalMetaLineHeight = readString(setting?.globalMetaLineHeight, "1.4");
  const globalMetaFont = resolvePublicFont(setting?.globalMetaFont, "Inter");

  if (context === "single-post") {
    return {
      accentColor,
      hoverColor: readString(
        setting?.postLinkHoverColor ?? setting?.postLinkColor ?? setting?.homeHoverColor ?? setting?.postHoverColor,
        accentColor
      ),
      widgetTitleColor: readString(setting?.postWidgetTitleColor ?? setting?.homeWidgetTitleColor, globalWidgetTitleColor),
      newsTitleColor: readString(setting?.homeNewsTitleColor, globalNewsTitleColor),
      excerptColor: readString(setting?.homeExcerptColor, globalExcerptColor),
      metaColor: readString(setting?.postMetaColor ?? setting?.homeMetaColor, globalMetaColor),
      widgetTitleFontSize: readCssSize(setting?.postWidgetTitleFontSize ?? setting?.homeWidgetTitleFontSize, globalWidgetTitleFontSize),
      widgetTitleFontWeight: readString(setting?.postWidgetTitleFontWeight ?? setting?.homeWidgetTitleFontWeight, globalWidgetTitleFontWeight),
      widgetTitleLineHeight: readString(setting?.postWidgetTitleLineHeight ?? setting?.homeWidgetTitleLineHeight, globalWidgetTitleLineHeight),
      widgetTitleFont: resolvePublicFont(setting?.postWidgetTitleFont ?? setting?.homeWidgetTitleFont, globalWidgetTitleFont),
      widgetTitleFontSynthesis: resolvePublicFontSynthesis(setting?.postWidgetTitleFont ?? setting?.homeWidgetTitleFont, globalWidgetTitleFont),
      newsTitleFontSize: readCssSize(setting?.homeNewsTitleFontSize, globalNewsTitleFontSize),
      newsTitleFontWeight: readString(setting?.homeNewsTitleFontWeight, globalNewsTitleFontWeight),
      newsTitleLineHeight: readString(setting?.homeNewsTitleLineHeight, globalNewsTitleLineHeight),
      newsTitleFont: resolvePublicFont(setting?.homeNewsTitleFont, globalNewsTitleFont),
      newsTitleFontSynthesis: resolvePublicFontSynthesis(setting?.homeNewsTitleFont, globalNewsTitleFont),
      excerptFontSize: readCssSize(setting?.homeExcerptFontSize, globalExcerptFontSize),
      excerptFontWeight: readString(setting?.homeExcerptFontWeight, globalExcerptFontWeight),
      excerptLineHeight: readString(setting?.homeExcerptLineHeight ?? setting?.globalContentLineHeight, globalExcerptLineHeight),
      excerptFont: resolvePublicFont(setting?.homeExcerptFont, globalExcerptFont),
      excerptFontSynthesis: resolvePublicFontSynthesis(setting?.homeExcerptFont, globalExcerptFont),
      metaFontSize: readCssSize(setting?.homeMetaFontSize, globalMetaFontSize),
      metaFontWeight: readString(setting?.homeMetaFontWeight, globalMetaFontWeight),
      metaLineHeight: readString(setting?.homeMetaLineHeight, globalMetaLineHeight),
      metaFont: resolvePublicFont(setting?.homeMetaFont, globalMetaFont),
      metaFontSynthesis: resolvePublicFontSynthesis(setting?.homeMetaFont, globalMetaFont),
      borderRadius: resolveWidgetGlobalBorderRadius(setting),
      borderColor,
      surfaceColor,
      elevatedColor,
      mutedTextColor,
      postBadgeBgColor: readString(setting?.postBadgeBgColor, "#f3f4f6"),
      postBadgeTextColor: readString(setting?.postBadgeTextColor ?? setting?.postMetaColor, globalMetaColor),
      postLinkHoverColor: readString(
        setting?.postLinkHoverColor ?? setting?.postLinkColor ?? setting?.homeHoverColor ?? setting?.postHoverColor,
        accentColor
      ),
    };
  }

  if (context === "archive") {
    return {
      accentColor,
      hoverColor: accentColor,
      widgetTitleColor: globalWidgetTitleColor,
      newsTitleColor: globalNewsTitleColor,
      excerptColor: globalExcerptColor,
      metaColor: globalMetaColor,
      widgetTitleFontSize: globalWidgetTitleFontSize,
      widgetTitleFontWeight: globalWidgetTitleFontWeight,
      widgetTitleLineHeight: globalWidgetTitleLineHeight,
      widgetTitleFont: globalWidgetTitleFont,
      widgetTitleFontSynthesis: resolvePublicFontSynthesis(setting?.globalWidgetTitleFont, globalWidgetTitleFont),
      newsTitleFontSize: globalNewsTitleFontSize,
      newsTitleFontWeight: globalNewsTitleFontWeight,
      newsTitleLineHeight: globalNewsTitleLineHeight,
      newsTitleFont: globalNewsTitleFont,
      newsTitleFontSynthesis: resolvePublicFontSynthesis(setting?.globalNewsTitleFont, globalNewsTitleFont),
      excerptFontSize: globalExcerptFontSize,
      excerptFontWeight: globalExcerptFontWeight,
      excerptLineHeight: globalExcerptLineHeight,
      excerptFont: globalExcerptFont,
      excerptFontSynthesis: resolvePublicFontSynthesis(setting?.globalExcerptFont, globalExcerptFont),
      metaFontSize: globalMetaFontSize,
      metaFontWeight: globalMetaFontWeight,
      metaLineHeight: globalMetaLineHeight,
      metaFont: globalMetaFont,
      metaFontSynthesis: resolvePublicFontSynthesis(setting?.globalMetaFont, globalMetaFont),
      borderRadius: resolveWidgetGlobalBorderRadius(setting),
      borderColor,
      surfaceColor,
      elevatedColor,
      mutedTextColor,
      postBadgeBgColor: readString(setting?.postBadgeBgColor, "#f3f4f6"),
      postBadgeTextColor: readString(setting?.postBadgeTextColor, globalMetaColor),
      postLinkHoverColor: accentColor,
    };
  }

  return {
    accentColor,
    hoverColor: readString(setting?.homeHoverColor, accentColor),
    widgetTitleColor: readString(setting?.homeWidgetTitleColor, globalWidgetTitleColor),
    newsTitleColor: readString(setting?.homeNewsTitleColor, globalNewsTitleColor),
    excerptColor: readString(setting?.homeExcerptColor, globalExcerptColor),
    metaColor: readString(setting?.homeMetaColor, globalMetaColor),
    widgetTitleFontSize: readCssSize(setting?.homeWidgetTitleFontSize, globalWidgetTitleFontSize),
    widgetTitleFontWeight: readString(setting?.homeWidgetTitleFontWeight, globalWidgetTitleFontWeight),
    widgetTitleLineHeight: readString(setting?.homeWidgetTitleLineHeight, globalWidgetTitleLineHeight),
    widgetTitleFont: resolvePublicFont(setting?.homeWidgetTitleFont, globalWidgetTitleFont),
    widgetTitleFontSynthesis: resolvePublicFontSynthesis(setting?.homeWidgetTitleFont, globalWidgetTitleFont),
    newsTitleFontSize: readCssSize(setting?.homeNewsTitleFontSize, globalNewsTitleFontSize),
    newsTitleFontWeight: readString(setting?.homeNewsTitleFontWeight, globalNewsTitleFontWeight),
    newsTitleLineHeight: readString(setting?.homeNewsTitleLineHeight, globalNewsTitleLineHeight),
    newsTitleFont: resolvePublicFont(setting?.homeNewsTitleFont, globalNewsTitleFont),
    newsTitleFontSynthesis: resolvePublicFontSynthesis(setting?.homeNewsTitleFont, globalNewsTitleFont),
    excerptFontSize: readCssSize(setting?.homeExcerptFontSize, globalExcerptFontSize),
    excerptFontWeight: readString(setting?.homeExcerptFontWeight, globalExcerptFontWeight),
    excerptLineHeight: readString(setting?.homeExcerptLineHeight ?? setting?.globalContentLineHeight, globalExcerptLineHeight),
    excerptFont: resolvePublicFont(setting?.homeExcerptFont, globalExcerptFont),
    excerptFontSynthesis: resolvePublicFontSynthesis(setting?.homeExcerptFont, globalExcerptFont),
    metaFontSize: readCssSize(setting?.homeMetaFontSize, globalMetaFontSize),
    metaFontWeight: readString(setting?.homeMetaFontWeight, globalMetaFontWeight),
    metaLineHeight: readString(setting?.homeMetaLineHeight, globalMetaLineHeight),
    metaFont: resolvePublicFont(setting?.homeMetaFont, globalMetaFont),
    metaFontSynthesis: resolvePublicFontSynthesis(setting?.homeMetaFont, globalMetaFont),
    borderRadius: resolveWidgetGlobalBorderRadius(setting),
    borderColor,
    surfaceColor,
    elevatedColor,
    mutedTextColor,
    postBadgeBgColor: readString(setting?.postBadgeBgColor, "#f3f4f6"),
    postBadgeTextColor: readString(setting?.postBadgeTextColor, globalMetaColor),
    postLinkHoverColor: readString(setting?.postLinkHoverColor ?? setting?.homeHoverColor, accentColor),
  };
}
