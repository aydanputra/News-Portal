import type { LucideIcon } from "lucide-react";
import { CLASSIC_ARCHIVE_WIDGET_GROUPS } from "@/themes/classic/blockarchive/registry";
import { PRANALA_ARCHIVE_WIDGET_GROUPS } from "@/themes/pranala/blockarchive/registry";
import { DEFAULT_PRANALA_ARCHIVE_BLOCKS } from "@/themes/pranala/blockarchive/defaults";
import { getResolvedThemeId } from "@/lib/theme-registry";

type ArchiveWidgetDefinition = {
  type: string;
  label: string;
  desc: string;
  description?: string;
  isSpecial?: boolean;
  icon: LucideIcon;
};

type ArchiveWidgetGroups = {
  main: ArchiveWidgetDefinition[];
  support: ArchiveWidgetDefinition[];
};

const THEME_ARCHIVE_WIDGET_GROUPS: Record<string, ArchiveWidgetGroups> = {
  classic: CLASSIC_ARCHIVE_WIDGET_GROUPS,
  pranala: PRANALA_ARCHIVE_WIDGET_GROUPS
};

const THEME_DEFAULT_ARCHIVE_BLOCKS: Record<string, any[]> = {
  classic: [],
  skeleton: [],
  pranala: DEFAULT_PRANALA_ARCHIVE_BLOCKS,
};

export function getThemeArchiveWidgetGroups(themeName: string = "classic"): ArchiveWidgetGroups {
  const resolvedThemeId = getResolvedThemeId(themeName);
  return THEME_ARCHIVE_WIDGET_GROUPS[resolvedThemeId] || THEME_ARCHIVE_WIDGET_GROUPS.classic;
}

export function getThemeDefaultArchiveBlocks(themeName: string) {
  const resolvedThemeId = getResolvedThemeId(themeName);
  return THEME_DEFAULT_ARCHIVE_BLOCKS[resolvedThemeId] || [];
}
