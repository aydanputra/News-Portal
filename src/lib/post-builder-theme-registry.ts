import { CLASSIC_POST_WIDGET_GROUPS } from "@/themes/classic/blockpost/registry";
import { PRANALA_POST_WIDGET_GROUPS } from "@/themes/pranala/blockpost/registry";
import { DEFAULT_PRANALA_POST_BLOCKS } from "@/themes/pranala/blockpost/defaults";

type PostWidgetDefinition = {
  type: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  description?: string;
  desc: string;
  isSpecial?: boolean;
};

type PostWidgetGroups = {
  main: PostWidgetDefinition[];
  support: PostWidgetDefinition[];
};

const THEME_POST_WIDGET_GROUPS: Record<string, PostWidgetGroups> = {
  classic: CLASSIC_POST_WIDGET_GROUPS,
  pranala: PRANALA_POST_WIDGET_GROUPS
};

export function getThemePostWidgetGroups(themeName: string = "classic"): PostWidgetGroups {
  return THEME_POST_WIDGET_GROUPS[themeName] || THEME_POST_WIDGET_GROUPS.classic;
}

export function getThemeDefaultPostBlocks(themeName: string) {
  if (themeName === "pranala") return DEFAULT_PRANALA_POST_BLOCKS;
  return [];
}
