import React from "react";
import { Monitor, Smartphone, Tablet, X } from "lucide-react";
import BlockConfigPanel from "./BlockConfigPanel";
import { Block, Category, Tag } from "./types";
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
  news_slider: "News Slider",
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
  builderLocation?: "home" | "archive" | "header" | "footer" | "post";
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
  const activeDeviceLabel = activeDeviceTab.toUpperCase();
  const widgetName = WIDGET_LABELS[child.type] || child.title || child.type;
  const configTitle = typeof child.config?.title === "string" ? child.config.title.trim() : "";
  const blockTitle = typeof child.title === "string" ? child.title.trim() : "";
  const customTitle = blockTitle !== "" && blockTitle !== widgetName
    ? blockTitle
    : (configTitle !== "" && configTitle !== widgetName ? configTitle : "");
  const showCustomTitle = customTitle !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div className="bg-[var(--bg-elevated)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden h-[90vh] max-h-[90vh] flex flex-col border border-[var(--border)] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-surface)]">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-lg font-bold text-[var(--fg-primary)] truncate max-w-[250px]">{widgetName}</h3>
                    </div>
                    {showCustomTitle && <p className="text-[10px] text-[var(--fg-muted)] truncate max-w-[250px]">{customTitle}</p>}
                </div>
                <button onClick={onClose} className="p-2 hover:bg-[var(--bg-base)] rounded-full transition-colors text-[var(--fg-muted)] hover:text-red-500">
                    <X size={20} />
                </button>
            </div>

            <div className="flex bg-[var(--bg-base)] border-b border-[var(--border)] sticky top-0 z-10">
                <button
                    onClick={() => setActiveEditTab('content')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                        activeEditTab === 'content'
                            ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]"
                            : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
                    }`}
                >
                    Konten
                </button>
                <button
                    onClick={() => setActiveEditTab('visual')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                        activeEditTab === 'visual'
                            ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]"
                            : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
                    }`}
                >
                    Visual
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-surface)] custom-scrollbar">
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
            </div>

            <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-base)] flex items-center justify-between">
                <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1">
                    {([
                        { id: "desktop", icon: Monitor },
                        { id: "tablet", icon: Tablet },
                        { id: "mobile", icon: Smartphone },
                    ] as const).map((device) => {
                        const Icon = device.icon;
                        const isActive = activeDeviceTab === device.id;
                        return (
                            <button
                                key={device.id}
                                onClick={() => setActiveDeviceTab(device.id)}
                                className={`p-2 rounded-md transition-all ${
                                    isActive
                                        ? "bg-[var(--bg-base)] text-[var(--accent)] shadow-sm border border-[var(--border)]"
                                        : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                                }`}
                                title={device.id.toUpperCase()}
                            >
                                <Icon size={14} />
                            </button>
                        );
                    })}
                </div>
                <div className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-widest bg-[var(--bg-elevated)] px-2 py-1 rounded border border-[var(--border)]">
                    Mode: {activeDeviceLabel}
                </div>
            </div>
        </div>
    </div>
  );
}
