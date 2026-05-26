import type { LucideIcon } from "lucide-react";
import { Grid2x2, Layout, List, Megaphone, PanelRight, Tag } from "lucide-react";

export type ArchiveWidgetDefinition = {
  type: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  desc: string;
  isSpecial?: boolean;
};

export const CLASSIC_ARCHIVE_WIDGET_GROUPS: { main: ArchiveWidgetDefinition[]; support: ArchiveWidgetDefinition[] } = {
  main: [
    { type: "archive_header", label: "Header Arsip", icon: Layout, desc: "Judul dan deskripsi halaman arsip." },
    { type: "archive_post_grid", label: "Grid Artikel", icon: Grid2x2, desc: "Daftar artikel arsip dalam bentuk grid." },
    { type: "archive_post_list", label: "List Artikel", icon: List, desc: "Daftar artikel arsip dalam bentuk list." }
  ],
  support: [
    { type: "sidebar_widget", label: "Sidebar Widget", icon: PanelRight, desc: "Widget sidebar tambahan." },
    { type: "tag_cloud", label: "Tag Cloud", icon: Tag, desc: "Kumpulan tag populer." },
    { type: "ad_banner", label: "Iklan Banner", icon: Megaphone, desc: "Slot iklan pada halaman arsip." },
    { type: "section", label: "Inner Section", icon: Layout, desc: "Buat kolom tambahan di dalam kolom ini.", isSpecial: true }
  ]
};
