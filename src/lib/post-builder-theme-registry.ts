import { CLASSIC_POST_WIDGET_GROUPS } from "@/themes/classic/blockpost/registry";
import { PRANALA_POST_WIDGET_GROUPS } from "@/themes/pranala/blockpost/registry";
import { DEFAULT_PRANALA_POST_BLOCKS } from "@/themes/pranala/blockpost/defaults";
import { getResolvedThemeId } from "@/lib/theme-registry";

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

const THEME_DEFAULT_POST_BLOCKS: Record<string, any[]> = {
  classic: [],
  skeleton: [],
  pranala: DEFAULT_PRANALA_POST_BLOCKS,
};

export function getThemePostWidgetGroups(themeName: string = "classic"): PostWidgetGroups {
  const resolvedThemeId = getResolvedThemeId(themeName);
  return THEME_POST_WIDGET_GROUPS[resolvedThemeId] || THEME_POST_WIDGET_GROUPS.classic;
}

export function getThemeDefaultPostBlocks(themeName: string) {
  const resolvedThemeId = getResolvedThemeId(themeName);
  return THEME_DEFAULT_POST_BLOCKS[resolvedThemeId] || [];
}
