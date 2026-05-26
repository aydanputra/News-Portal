import type { LucideIcon } from "lucide-react";
import { CLASSIC_ARCHIVE_WIDGET_GROUPS } from "@/themes/classic/blockarchive/registry";
import { PRANALA_ARCHIVE_WIDGET_GROUPS } from "@/themes/pranala/blockarchive/registry";
import { DEFAULT_PRANALA_ARCHIVE_BLOCKS } from "@/themes/pranala/blockarchive/defaults";

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

export function getThemeArchiveWidgetGroups(themeName: string = "classic"): ArchiveWidgetGroups {
  return THEME_ARCHIVE_WIDGET_GROUPS[themeName] || THEME_ARCHIVE_WIDGET_GROUPS.classic;
}

export function getThemeDefaultArchiveBlocks(themeName: string) {
  if (themeName === "pranala") return DEFAULT_PRANALA_ARCHIVE_BLOCKS;
  return [];
}
