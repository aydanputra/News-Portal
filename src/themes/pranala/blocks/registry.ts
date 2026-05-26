// src/themes/pranala/blocks/registry.ts

import type { LucideIcon } from "lucide-react";
import { Layout, Maximize, List, PanelRight, Tag, Megaphone, Newspaper, Grid2x2 } from "lucide-react";
import Hero from "./Hero";
import Section from "./Section";
import NewsList from "./NewsList";
import NewsGrid from "./NewsGrid";
import HeadlineBig from "./HeadlineBig";
import BulletList from "./BulletList";
import SidebarWidget from "./SidebarWidget";
import TagCloud from "./TagCloud";
import AdBanner from "./AdBanner";
import HeroSplit4 from "./HeroSplit4";
import HeroSlider from "./HeroSlider";
import NewsGridSlider from "./NewsGridSlider";

// Block Definition Interface
export interface BlockDefinition {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  component: unknown;
  defaultConfig: Record<string, unknown>;
  category: "hero" | "list" | "grid" | "widget" | "content";
}

export const PRANALA_BLOCKS: Record<string, BlockDefinition> = {
  "classic_hero": {
    id: "classic_hero",
    label: "Classic Hero",
    description: "Hero section sederhana dengan satu gambar utama.",
    icon: Layout,
    component: Hero,
    category: "hero",
    defaultConfig: {
        limit: 1,
        showTitle: false
    }
  },
  "section": {
    id: "section",
    label: "Section",
    description: "Layout section untuk menampung blok lain.",
    icon: Maximize,
    component: Section,
    category: "content",
    defaultConfig: {}
  },
  "news_list": {
    id: "news_list",
    label: "Simple List",
    description: "Daftar berita vertikal sederhana.",
    icon: List,
    component: NewsList,
    category: "list",
    defaultConfig: {
      limit: 5,
      category: "all"
    }
  },
  "news_grid": {
    id: "news_grid",
    label: "Grid News",
    description: "Tampilan berita dalam layout grid responsif.",
    icon: Grid2x2,
    component: NewsGrid,
    category: "grid",
    defaultConfig: {
      limit: 6,
      category: "all",
      gridColumns: 3,
      tabletGridColumns: 2,
      mobileGridColumns: 1,
      gridGapX: 4,
      gridGapY: 4,
      showExcerpt: true,
      categoryLabelColor: "#ffffff",
      categoryLabelBgColor: "var(--accent)"
    }
  },
  "news_headline_big": {
    id: "news_headline_big",
    label: "Headline Big",
    description: "Satu berita utama dengan gambar besar, meta, excerpt, dan tombol Read More.",
    icon: Newspaper,
    component: HeadlineBig,
    category: "list",
    defaultConfig: {
      limit: 1,
      category: "all",
      showTitle: false
    }
  },
  "news_hero_split_4": {
    id: "news_hero_split_4",
    label: "Hero + 4 Mini",
    description: "Satu berita utama besar dan empat berita mini.",
    icon: Layout,
    component: HeroSplit4,
    category: "hero",
    defaultConfig: {
      limit: 5,
      offset: 0,
      miniCount: 4,
      miniColumns: 4,
      tabletMiniColumns: 2,
      mobileMiniColumns: 1,
      showMiniImage: true,
      showMetaInfo: true,
      showHeroMetaInfo: true,
      showMiniMetaInfo: true,
      showAuthor: true,
      showHeroAuthor: true,
      showMiniAuthor: true,
      showExcerpt: true,
      showHeroExcerpt: true,
      showMiniExcerpt: false,
      excerptLength: 120,
      heroExcerptLength: 120,
      heroExcerptFontSize: 14,
      heroExcerptLineHeight: 1.6,
      miniExcerptLength: 70,
      miniExcerptFontSize: 12,
      miniExcerptLineHeight: 1.5,
      showCategory: true,
      showHeroCategory: true,
      heroCategoryLabelFontSize: 10,
      showMiniCategory: true,
      miniCategoryLabelFontSize: 9,
      showDate: true
      ,
      showHeroDate: true,
      showMiniDate: true,
      miniMetaFontSize: 11,
      miniTitleLineHeight: 1.3,
      miniTitleFontWeight: "bold",
      showTitle: false
    }
  },
  "news_hero_slider": {
    id: "news_hero_slider",
    label: "Hero Slider",
    description: "Slider headline utama dengan navigasi panah dan dots.",
    icon: Newspaper,
    component: HeroSlider,
    category: "hero",
    defaultConfig: {
      limit: 5,
      offset: 0,
      autoplay: false,
      autoplayMs: 5000,
      loop: true,
      showArrows: true,
      showDots: true,
      pauseOnHover: true,
      swipeEnabled: true,
      showMetaInfo: true,
      showAuthor: true,
      slideTransitionMs: 500,
      overlayOpacity: 70,
      showMiniThumbnails: false,
      thumbnailVisibleCount: 4,
      thumbnailImageHeight: 72,
      showExcerpt: true,
      excerptLength: 120,
      imageHeight: 500,
      tabletImageHeight: 420,
      mobileImageHeight: 320,
      showTitle: false
    }
  },
  "news_grid_slider": {
    id: "news_grid_slider",
    label: "Grid Slider",
    description: "Grid berita yang bisa digeser dengan panah kiri-kanan.",
    icon: Grid2x2,
    component: NewsGridSlider,
    category: "grid",
    defaultConfig: {
      limit: 8,
      offset: 0,
      itemsPerView: 3,
      tabletItemsPerView: 2,
      mobileItemsPerView: 1,
      slideStep: "page",
      autoplay: false,
      autoplayMs: 5000,
      loop: true,
      showArrows: true,
      showDots: true,
      pauseOnHover: true,
      swipeEnabled: true,
      showMetaInfo: true,
      showAuthor: true,
      slideTransitionMs: 500,
      showExcerpt: true,
      excerptLength: 90
    }
  },
  "news_bullet_list": {
    id: "news_bullet_list",
    label: "Bullet List",
    description: "Daftar headline model bullet dengan tata letak kolom.",
    icon: List,
    component: BulletList,
    category: "list",
    defaultConfig: {
      limit: 6,
      columnCount: 2,
      showTitle: false
    }
  },
  "sidebar_widget": {
    id: "sidebar_widget",
    label: "Sidebar Widget",
    description: "Widget sidebar (Kategori, Populer, Iklan).",
    icon: PanelRight,
    component: SidebarWidget,
    category: "widget",
    defaultConfig: {
      widgetType: "popular_posts"
    }
  },
  "tag_cloud": {
    id: "tag_cloud",
    label: "Tag Cloud",
    description: "Kumpulan tag populer.",
    icon: Tag,
    component: TagCloud,
    category: "widget",
    defaultConfig: {
      limit: 10
    }
  },
  "ad_banner": {
    id: "ad_banner",
    label: "Iklan Banner",
    description: "Menampilkan banner iklan (Gambar/Kode).",
    icon: Megaphone,
    component: AdBanner,
    category: "widget",
    defaultConfig: {
      position: "HOMEPAGE_1",
      showTitle: false
    }
  }
};
