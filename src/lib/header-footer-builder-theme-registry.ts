import type { LucideIcon } from "lucide-react";
import { Grid, Layout, List, Megaphone, Image as ImageIcon } from "lucide-react";
import type { Block } from "@/components/admin/page-builder/types";
import { getResolvedThemeId } from "@/lib/theme-registry";

export type HeaderFooterWidgetDefinition = {
  type: string;
  label: string;
  desc: string;
  description?: string;
  isSpecial?: boolean;
  icon: LucideIcon;
};

type HeaderFooterWidgetGroups = {
  main: HeaderFooterWidgetDefinition[];
  support: HeaderFooterWidgetDefinition[];
};

const INNER_SECTION_WIDGET: HeaderFooterWidgetDefinition = {
  type: "section",
  label: "Inner Section",
  icon: Layout,
  isSpecial: true,
  desc: "Buat kolom tambahan di dalam kolom ini.",
};

const BASE_HEADER_WIDGET_GROUPS: HeaderFooterWidgetGroups = {
  main: [
    { type: "header_logo", label: "Logo", icon: Layout, desc: "Logo atau nama situs." },
    { type: "header_menu_primary", label: "Menu Primary", icon: List, desc: "Menu lokasi Primary." },
    { type: "header_menu_secondary", label: "Menu Secondary", icon: List, desc: "Menu lokasi Secondary." },
    { type: "header_search", label: "Search", icon: Grid, desc: "Tombol search." },
    { type: "header_theme_toggle", label: "Theme Toggle", icon: Grid, desc: "Tombol ganti tema." },
    { type: "header_login", label: "Tombol Masuk", icon: Megaphone, desc: "Tombol login/masuk." },
    { type: "header_mobile_menu_toggle", label: "Hamburger Menu (Mobile)", icon: List, desc: "Tombol hamburger untuk membuka menu off-canvas di mobile." },
    { type: "image_widget", label: "Widget Gambar", icon: ImageIcon, desc: "Tampilkan gambar dari URL." },
    { type: "ad_banner", label: "Iklan Banner", icon: Megaphone, desc: "Banner iklan dari Manajemen Iklan (posisi: HEADER)." },
    INNER_SECTION_WIDGET,
  ],
  support: [],
};

const BASE_FOOTER_WIDGET_GROUPS: HeaderFooterWidgetGroups = {
  main: [
    { type: "footer_logo", label: "Logo", icon: Layout, desc: "Logo atau nama situs (samakan dengan Header Logo)." },
    { type: "footer_menu", label: "Menu Footer", icon: List, desc: "Menu khusus lokasi Footer." },
    { type: "footer_text", label: "Teks", icon: Grid, desc: "Teks bebas (alamat, kontak, dsb)." },
    { type: "image_widget", label: "Widget Gambar", icon: ImageIcon, desc: "Tampilkan gambar dari URL." },
    { type: "footer_social", label: "Social Links", icon: Grid, desc: "Link media sosial." },
    { type: "footer_categories", label: "Kategori", icon: List, desc: "List kategori (otomatis dari data kategori)." },
    { type: "footer_custom_links", label: "Custom Links", icon: List, desc: "Daftar link custom (mirip Custom Links pada Menu)." },
    { type: "footer_copyright", label: "Copyright", icon: Megaphone, desc: "Teks copyright + tahun." },
    INNER_SECTION_WIDGET,
  ],
  support: [],
};

const THEME_HEADER_WIDGET_GROUPS: Record<string, HeaderFooterWidgetGroups> = {
  classic: BASE_HEADER_WIDGET_GROUPS,
  skeleton: BASE_HEADER_WIDGET_GROUPS,
  pranala: BASE_HEADER_WIDGET_GROUPS,
};

const THEME_FOOTER_WIDGET_GROUPS: Record<string, HeaderFooterWidgetGroups> = {
  classic: BASE_FOOTER_WIDGET_GROUPS,
  skeleton: BASE_FOOTER_WIDGET_GROUPS,
  pranala: BASE_FOOTER_WIDGET_GROUPS,
};

function createDefaultHeaderBlocks(): Block[] {
  return [
    {
      id: "section_header_desktop",
      type: "section",
      title: "Header Desktop",
      order: 1,
      isVisible: true,
      placement: "main",
      config: {
        layout: "33-33-33",
        children: [
          { id: "header_logo_1", type: "header_logo", title: "Logo", order: 1, isVisible: true, config: { columnIndex: 0 } },
          { id: "header_menu_primary_1", type: "header_menu_primary", title: "Menu Primary", order: 2, isVisible: true, config: { columnIndex: 1 } },
          { id: "header_theme_toggle_1", type: "header_theme_toggle", title: "Theme Toggle", order: 3, isVisible: true, config: { columnIndex: 2 } },
          { id: "header_search_1", type: "header_search", title: "Search", order: 4, isVisible: true, config: { columnIndex: 2 } },
          { id: "header_login_1", type: "header_login", title: "Tombol Masuk", order: 5, isVisible: true, config: { columnIndex: 2 } },
        ],
        hideOnMobile: true,
      },
    },
    {
      id: "section_header_mobile",
      type: "section",
      title: "Header Mobile",
      order: 2,
      isVisible: true,
      placement: "main",
      config: {
        layout: "66-33",
        children: [
          { id: "header_mobile_toggle_1", type: "header_mobile_menu_toggle", title: "Tombol Menu", order: 1, isVisible: true, config: { columnIndex: 0 } },
          { id: "header_logo_2", type: "header_logo", title: "Logo", order: 2, isVisible: true, config: { columnIndex: 0 } },
          { id: "header_search_2", type: "header_search", title: "Search", order: 3, isVisible: true, config: { columnIndex: 1 } },
        ],
        hideOnDesktop: true,
        hideOnTablet: true,
      },
    },
  ];
}

function createDefaultFooterBlocks(): Block[] {
  return [
    {
      id: "section_footer_main",
      type: "section",
      title: "Footer Main",
      order: 1,
      isVisible: true,
      placement: "main",
      config: {
        layout: "33-33-33",
        children: [
          { id: "footer_logo_1", type: "footer_logo", title: "Logo", order: 1, isVisible: true, config: { columnIndex: 0, textAlign: "left" } },
          { id: "footer_menu_1", type: "footer_menu", title: "Menu Footer", order: 2, isVisible: true, config: { columnIndex: 1, textAlign: "left" } },
          { id: "footer_social_1", type: "footer_social", title: "Social Links", order: 3, isVisible: true, config: { columnIndex: 2, textAlign: "left" } },
        ],
      },
    },
    {
      id: "section_footer_bottom",
      type: "section",
      title: "Footer Bottom",
      order: 2,
      isVisible: true,
      placement: "main",
      config: {
        layout: "100",
        children: [
          { id: "footer_copyright_1", type: "footer_copyright", title: "Copyright", order: 1, isVisible: true, config: { columnIndex: 0, textAlign: "center" } },
        ],
      },
    },
  ];
}

const THEME_DEFAULT_HEADER_BLOCKS: Record<string, () => Block[]> = {
  classic: createDefaultHeaderBlocks,
  skeleton: createDefaultHeaderBlocks,
  pranala: createDefaultHeaderBlocks,
};

const THEME_DEFAULT_FOOTER_BLOCKS: Record<string, () => Block[]> = {
  classic: createDefaultFooterBlocks,
  skeleton: createDefaultFooterBlocks,
  pranala: createDefaultFooterBlocks,
};

export function getThemeHeaderWidgetGroups(themeName: string = "classic"): HeaderFooterWidgetGroups {
  const resolvedThemeId = getResolvedThemeId(themeName);
  return THEME_HEADER_WIDGET_GROUPS[resolvedThemeId] || THEME_HEADER_WIDGET_GROUPS.classic;
}

export function getThemeFooterWidgetGroups(themeName: string = "classic"): HeaderFooterWidgetGroups {
  const resolvedThemeId = getResolvedThemeId(themeName);
  return THEME_FOOTER_WIDGET_GROUPS[resolvedThemeId] || THEME_FOOTER_WIDGET_GROUPS.classic;
}

export function getThemeDefaultHeaderBlocks(themeName: string = "classic"): Block[] {
  const resolvedThemeId = getResolvedThemeId(themeName);
  const factory = THEME_DEFAULT_HEADER_BLOCKS[resolvedThemeId] || THEME_DEFAULT_HEADER_BLOCKS.classic;
  return factory();
}

export function getThemeDefaultFooterBlocks(themeName: string = "classic"): Block[] {
  const resolvedThemeId = getResolvedThemeId(themeName);
  const factory = THEME_DEFAULT_FOOTER_BLOCKS[resolvedThemeId] || THEME_DEFAULT_FOOTER_BLOCKS.classic;
  return factory();
}

export function getThemeHeaderWidgetTypes(themeName: string = "classic"): string[] {
  const groups = getThemeHeaderWidgetGroups(themeName);
  return [...groups.main, ...groups.support].map((widget) => widget.type);
}

export function getThemeFooterWidgetTypes(themeName: string = "classic"): string[] {
  const groups = getThemeFooterWidgetGroups(themeName);
  return [...groups.main, ...groups.support].map((widget) => widget.type);
}
