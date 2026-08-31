import { getResolvedThemeId } from "@/lib/theme-registry";
import { resolveBlockTypeAlias } from "@/lib/block-registry";

export type WidgetConfigFamily =
  | "bulletList"
  | "newsFeed"
  | "headlineBig"
  | "sidebarWidget"
  | "tagCloud"
  | "adBanner"
  | "heroSplit"
  | "heroSlider";

export type WidgetConfigProfile = {
  effectiveType: string;
  isVisualOnly: boolean;
  isClassicHeroWidget: boolean;
  isBulletListWidget: boolean;
  isNewsFeedFamilyWidget: boolean;
  isHeadlineBigWidget: boolean;
  isSidebarWidget: boolean;
  isTagCloudWidget: boolean;
  isAdBannerWidget: boolean;
  isHeroSplit4Widget: boolean;
  isHeroSliderWidget: boolean;
  isReferenceStyleWidget: boolean;
  supportsTitleToggle: boolean;
};

export type WidgetPanelSectionKey =
  | "classicHero"
  | "bulletList"
  | "newsFeed"
  | "headlineBig"
  | "sidebarWidget"
  | "tagCloud"
  | "adBanner"
  | "heroSplit"
  | "heroSlider"
  | "none";

const VISUAL_ONLY_WIDGET_TYPES = new Set([
  "post_breadcrumb",
  "post_title",
  "post_meta",
  "post_featured_image",
  "post_content",
  "post_navigation",
  "post_subtitle",
  "post_share",
  "post_comments",
  "post_tags",
  "post_author_box",
]);

const GLOBAL_WIDGET_FAMILY_MAP: Record<string, WidgetConfigFamily[]> = {
  news_bullet_list: ["bulletList"],
  news_list: ["newsFeed"],
  news_grid: ["newsFeed"],
  news_grid_slider: ["newsFeed"],
  news_headline_big: ["headlineBig"],
  sidebar_widget: ["sidebarWidget"],
  tag_cloud: ["tagCloud"],
  ad_banner: ["adBanner"],
  news_hero_split_4: ["heroSplit"],
  news_hero_slider: ["heroSlider"],
};

const THEME_WIDGET_FAMILY_MAP: Record<string, Record<string, WidgetConfigFamily[]>> = {
  classic: {},
  skeleton: {},
  pranala: {},
};

export function getWidgetConfigType(themeName: string, blockType: string): string {
  const effectiveType = resolveBlockTypeAlias(String(blockType || ""));
  const resolvedThemeId = getResolvedThemeId(themeName);
  const themeMap = THEME_WIDGET_FAMILY_MAP[resolvedThemeId] || {};
  return themeMap[effectiveType] ? effectiveType : effectiveType;
}

export function getWidgetConfigFamilies(themeName: string, blockType: string): Set<WidgetConfigFamily> {
  const effectiveType = getWidgetConfigType(themeName, blockType);
  const resolvedThemeId = getResolvedThemeId(themeName);
  const themeMap = THEME_WIDGET_FAMILY_MAP[resolvedThemeId] || {};
  return new Set([
    ...(GLOBAL_WIDGET_FAMILY_MAP[effectiveType] || []),
    ...(themeMap[effectiveType] || []),
  ]);
}

export function isVisualOnlyWidgetType(blockType: string): boolean {
  return VISUAL_ONLY_WIDGET_TYPES.has(String(blockType || ""));
}

export function widgetHasConfigFamily(themeName: string, blockType: string, family: WidgetConfigFamily): boolean {
  return getWidgetConfigFamilies(themeName, blockType).has(family);
}

export function supportsWidgetTitleToggle(themeName: string, blockType: string): boolean {
  const effectiveType = getWidgetConfigType(themeName, blockType);
  if (effectiveType === "" || effectiveType === "section") return false;
  if (effectiveType.startsWith("post_")) {
    return ["post_related_posts", "post_comments"].includes(effectiveType);
  }
  if (effectiveType.startsWith("archive_")) return false;
  if (effectiveType.startsWith("header_")) return false;
  if (effectiveType.startsWith("footer_")) return false;

  const noTitleTypes = new Set([
    "classic_hero",
    "news_hero_slider",
    "news_hero_split_4",
    "news_headline_big",
    "news_bullet_list",
    "ad_banner",
  ]);
  if (noTitleTypes.has(effectiveType)) return false;

  return ["news_list", "news_grid", "news_grid_slider", "sidebar_widget"].includes(effectiveType);
}

export function getWidgetConfigProfile(themeName: string, blockType: string): WidgetConfigProfile {
  const effectiveType = getWidgetConfigType(themeName, blockType);
  const isClassicHeroWidget = effectiveType === "classic_hero";
  const isBulletListWidget = widgetHasConfigFamily(themeName, blockType, "bulletList");
  const isNewsFeedFamilyWidget = widgetHasConfigFamily(themeName, blockType, "newsFeed");
  const isHeadlineBigWidget = widgetHasConfigFamily(themeName, blockType, "headlineBig");
  const isSidebarWidget = widgetHasConfigFamily(themeName, blockType, "sidebarWidget");
  const isTagCloudWidget = widgetHasConfigFamily(themeName, blockType, "tagCloud");
  const isAdBannerWidget = widgetHasConfigFamily(themeName, blockType, "adBanner");
  const isHeroSplit4Widget = widgetHasConfigFamily(themeName, blockType, "heroSplit");
  const isHeroSliderWidget = widgetHasConfigFamily(themeName, blockType, "heroSlider");

  return {
    effectiveType,
    isVisualOnly: isVisualOnlyWidgetType(blockType),
    isClassicHeroWidget,
    isBulletListWidget,
    isNewsFeedFamilyWidget,
    isHeadlineBigWidget,
    isSidebarWidget,
    isTagCloudWidget,
    isAdBannerWidget,
    isHeroSplit4Widget,
    isHeroSliderWidget,
    isReferenceStyleWidget:
      isClassicHeroWidget ||
      isBulletListWidget ||
      isNewsFeedFamilyWidget ||
      isHeadlineBigWidget ||
      isSidebarWidget ||
      isTagCloudWidget ||
      isHeroSplit4Widget ||
      isHeroSliderWidget ||
      isAdBannerWidget,
    supportsTitleToggle: supportsWidgetTitleToggle(themeName, blockType),
  };
}

export function getWidgetPanelSectionKey(themeName: string, blockType: string): WidgetPanelSectionKey {
  const profile = getWidgetConfigProfile(themeName, blockType);
  if (profile.isClassicHeroWidget) return "classicHero";
  if (profile.isBulletListWidget) return "bulletList";
  if (profile.isNewsFeedFamilyWidget) return "newsFeed";
  if (profile.isHeadlineBigWidget) return "headlineBig";
  if (profile.isSidebarWidget) return "sidebarWidget";
  if (profile.isTagCloudWidget) return "tagCloud";
  if (profile.isHeroSplit4Widget) return "heroSplit";
  if (profile.isHeroSliderWidget) return "heroSlider";
  if (profile.isAdBannerWidget) return "adBanner";
  return "none";
}
