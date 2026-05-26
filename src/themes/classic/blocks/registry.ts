// src/themes/classic/blocks/registry.ts

import type { LucideIcon } from "lucide-react";
import { Layout, Maximize, List, PanelRight, Tag } from "lucide-react";
import Hero from "./Hero";
import Section from "./Section";
import NewsList from "./NewsList";
import SidebarWidget from "./SidebarWidget";
import TagCloud from "./TagCloud";

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

export const CLASSIC_BLOCKS: Record<string, BlockDefinition> = {
  "classic_hero": {
    id: "classic_hero",
    label: "Classic Hero",
    description: "Hero section dengan opsi query lengkap (Kategori, Tag, Urutan).",
    icon: Layout,
    component: Hero,
    category: "hero",
    defaultConfig: {
        limit: 1,
        filterType: "latest", // latest, category, tag
        categorySlug: "all",
        tagSlug: "",
        sortOrder: "latest" // latest, oldest, popular, random
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
  }
};
