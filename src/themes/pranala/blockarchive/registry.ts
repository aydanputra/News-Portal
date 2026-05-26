import type { LucideIcon } from "lucide-react";
import { Grid2x2, Layout, List, Megaphone, Newspaper, PanelRight, Tag, Waypoints, CircleOff } from "lucide-react";

export type ArchiveWidgetDefinition = {
  type: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  desc: string;
  isSpecial?: boolean;
};

export const PRANALA_ARCHIVE_WIDGET_GROUPS: { main: ArchiveWidgetDefinition[]; support: ArchiveWidgetDefinition[] } = {
  main: [
    { type: "archive_header", label: "Header Arsip", icon: Layout, desc: "Judul dan deskripsi halaman arsip." },
    { type: "news_hero_slider", label: "Hero Slider", icon: Newspaper, desc: "Slider headline arsip dengan navigasi panah, dots, dan thumbnail mini." },
    { type: "news_grid", label: "Grid News", icon: Grid2x2, desc: "Grid berita arsip dengan tampilan visual penuh seperti Homepage Builder." },
    { type: "archive_post_list", label: "List Artikel", icon: List, desc: "Daftar artikel arsip dalam bentuk list." },
    { type: "archive_pagination", label: "Pagination Arsip", icon: Waypoints, desc: "Navigasi halaman archive." },
    { type: "archive_empty_state", label: "Empty State", icon: CircleOff, desc: "Tampilan saat archive tidak memiliki artikel." }
  ],
  support: [
    { type: "sidebar_widget", label: "Sidebar Widget", icon: PanelRight, desc: "Widget sidebar tambahan." },
    { type: "tag_cloud", label: "Tag Cloud", icon: Tag, desc: "Kumpulan tag populer." },
    { type: "ad_banner", label: "Iklan Banner", icon: Megaphone, desc: "Slot iklan pada halaman arsip." },
    { type: "section", label: "Inner Section", icon: Layout, desc: "Buat kolom tambahan di dalam kolom ini.", isSpecial: true }
  ]
};
