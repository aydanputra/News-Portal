import React from "react";
import { Monitor, Smartphone, Tablet, X } from "lucide-react";
import BlockConfigPanel from "./BlockConfigPanel";
import { Block, Category, Tag } from "../types";
import { ConfigValue } from "@/lib/page-builder-config";

const WIDGET_LABELS: Record<string, string> = {
  news_hero_slider: "Hero Slider",
  news_hero_split_4: "Hero + 4 Mini",
  news_headline_big: "Headline Big",
  news_grid: "Grid News",
  news_grid_slider: "Grid Slider",
  news_bullet_list: "Bullet List",
  news_list: "Simple List",
  news_list_highlight: "News List Highlight",
  classic_hero: "Hero",
  sidebar_widget: "Sidebar Widget",
  tag_cloud: "Tag Cloud",
  ad_banner: "Iklan",
  header_logo: "Logo",
  header_menu_primary: "Menu Primary",
  header_menu_secondary: "Menu Secondary",
  header_search: "Search",
  header_theme_toggle: "Theme Toggle",
  header_mobile_menu_toggle: "Hamburger Menu (Mobile)",
  archive_header: "Header Arsip",
  archive_post_grid: "Grid Artikel Arsip",
  archive_post_list: "List Artikel Arsip",
  archive_pagination: "Pagination Arsip",
  archive_empty_state: "Empty State Arsip",
  section: "Inner Section",
  headline_2: "Headline 2",
  news_slider: "News Slider"
  ,
  footer_brand: "Brand",
  footer_logo: "Logo",
  footer_menu: "Menu Footer",
  footer_text: "Teks",
  footer_social: "Social Links",
  footer_categories: "Kategori",
  footer_custom_links: "Custom Links",
  footer_copyright: "Copyright"
};

interface EditChildModalProps {
  builderLocation?: "home" | "archive" | "header" | "footer";
  child: Block | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  tags: Tag[];
  activeEditTab: 'content' | 'visual';
  setActiveEditTab: (tab: 'content' | 'visual') => void;
  activeDeviceTab: 'desktop' | 'tablet' | 'mobile';
  setActiveDeviceTab: (tab: 'desktop' | 'tablet' | 'mobile') => void;
  updateChildConfig: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
  getConfigValue: (child: Block, key: string) => unknown;
  onUpdateTitle: (newTitle: string) => void;
  
  // Global Settings
  globalSettings?: {
      primaryColor: string;
      headingColor: string;
      metaColor: string;
      excerptColor: string;
      homeWidgetTitleColor?: string;
      homeNewsTitleColor?: string;
      homeHoverColor?: string;
      homeExcerptColor?: string;
      homeMetaColor?: string;
  };
}

export default function EditChildModal({
  builderLocation = "home",
  child,
  isOpen,
  onClose,
  categories,
  tags,
  activeEditTab,
  setActiveEditTab,
  activeDeviceTab,
  setActiveDeviceTab,
  updateChildConfig,
  updateChildResponsiveConfig,
  getConfigValue,
  onUpdateTitle,
  globalSettings
}: EditChildModalProps) {
  if (!isOpen || !child) return null;
  const widgetName = WIDGET_LABELS[child.type] || child.title || child.type;
  const configTitle = typeof child.config?.title === "string" ? child.config.title.trim() : "";
  const blockTitle = typeof child.title === "string" ? child.title.trim() : "";
  const customTitle = blockTitle !== "" && blockTitle !== widgetName
    ? blockTitle
    : (configTitle !== "" && configTitle !== widgetName ? configTitle : "");
  const showCustomTitle = customTitle !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div className="bg-[var(--bg-elevated)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-[var(--border)] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-surface)]">
                <h3 className="font-bold text-lg text-[var(--fg-primary)] flex items-center gap-2">
                    <span>Edit Widget</span>
                    <span className="text-xs font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">{widgetName}</span>
                    {showCustomTitle && (
                      <span className="text-xs font-medium text-[var(--fg-secondary)] bg-[var(--bg-base)] border border-[var(--border)] px-2 py-0.5 rounded-md">{customTitle}</span>
                    )}
                </h3>
                <button onClick={onClose} className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors"><X size={20} /></button>
            </div>
            
            <BlockConfigPanel 
                builderLocation={builderLocation}
                child={child}
                categories={categories}
                tags={tags}
                activeEditTab={activeEditTab}
                setActiveEditTab={setActiveEditTab}
                activeDeviceTab={activeDeviceTab}
                setActiveDeviceTab={setActiveDeviceTab}
                updateChildConfig={updateChildConfig}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                getConfigValue={getConfigValue}
                onUpdateTitle={onUpdateTitle}
                globalSettings={globalSettings}
            />

            <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-surface)] flex justify-between items-center">
                {activeEditTab === 'visual' ? (
                    <div className="flex items-center gap-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-1">
                        {(["desktop", "tablet", "mobile"] as const).map((d) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => setActiveDeviceTab(d)}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1.5 transition-colors ${
                                    activeDeviceTab === d ? "bg-[var(--bg-elevated)] text-[var(--accent)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                                }`}
                            >
                                {d === "desktop" && <Monitor size={12} />}
                                {d === "tablet" && <Tablet size={12} />}
                                {d === "mobile" && <Smartphone size={12} />}
                                {d}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div />
                )}
                <button onClick={onClose} className="btn btn-primary text-sm">Selesai</button>
            </div>
        </div>
    </div>
  );
}
