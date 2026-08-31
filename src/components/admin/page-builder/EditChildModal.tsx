import React, { useEffect } from "react";
import { Monitor, Smartphone, Tablet, X } from "lucide-react";
import BlockConfigPanel from "./BlockConfigPanel";
import { Block, Category, Tag } from "./types";
import { ConfigValue } from "@/lib/page-builder-config";
import { getBlockLabel, resolveBlockTypeAlias } from "@/lib/block-registry";
import {
  getWidgetConfigProfile,
} from "@/lib/widget-config-registry";

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
  image_widget: "Widget Gambar",
  header_logo: "Logo",
  header_menu_primary: "Menu Primary",
  header_menu_secondary: "Menu Secondary",
  header_search: "Pencarian",
  header_theme_toggle: "Theme Toggle",
  header_login: "Tombol Masuk",
  header_mobile_menu_toggle: "Hamburger Menu (Mobile)",
  archive_header: "Header Arsip",
  archive_post_grid: "Grid Artikel Arsip",
  archive_post_list: "List Artikel Arsip",
  archive_pagination: "Pagination Arsip",
  archive_empty_state: "Empty State Arsip",
  section: "Inner Section",
  headline_2: "Headline Big",
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
  activeTheme?: string;
  child: Block | null;
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  tags: Tag[];
  activeEditTab: 'content' | 'visual' | 'advanced';
  setActiveEditTab: (tab: 'content' | 'visual' | 'advanced') => void;
  activeDeviceTab: 'desktop' | 'tablet' | 'mobile';
  setActiveDeviceTab: (tab: 'desktop' | 'tablet' | 'mobile') => void;
  updateChildConfig: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
  getConfigValue: (child: Block, key: string) => unknown;
  onUpdateTitle: (newTitle: string) => void;
  
  // Global Settings
  globalSettings?: {
      accentColor?: string;
      primaryColor: string;
      backgroundColor?: string;
      headingColor: string;
      metaColor: string;
      excerptColor: string;
      homeWidgetTitleColor?: string;
      homeNewsTitleColor?: string;
      homeHoverColor?: string;
      homeExcerptColor?: string;
      homeMetaColor?: string;
      postWidgetTitleColor?: string;
      postContentColor?: string;
      postMetaColor?: string;
      postLinkColor?: string;
      postLinkHoverColor?: string;
      globalBorderRadius?: string;
      globalBorderColor?: string;
      globalSurfaceColor?: string;
      globalElevatedColor?: string;
      globalMutedTextColor?: string;
  };
}

export default function EditChildModal({
  builderLocation = "home",
  activeTheme = "classic",
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
  const isFooterBuilder = builderLocation === "footer";
  const isHeaderBuilder = builderLocation === "header";
  const resolvedChildType = child ? resolveBlockTypeAlias(child.type) : "";
  const allowFooterContentTab = isFooterBuilder && resolvedChildType === "image_widget";
  const allowHeaderContentTab =
    isHeaderBuilder && ["image_widget", "ad_banner"].includes(resolvedChildType);

  useEffect(() => {
    if (isOpen && ((isFooterBuilder && !allowFooterContentTab) || (isHeaderBuilder && !allowHeaderContentTab)) && activeEditTab === "content") {
      setActiveEditTab("visual");
    }
  }, [activeEditTab, allowFooterContentTab, allowHeaderContentTab, isFooterBuilder, isHeaderBuilder, isOpen, setActiveEditTab]);

  if (!isOpen || !child) return null;
  const effectiveType = resolveBlockTypeAlias(child.type);
  const widgetName =
    getBlockLabel(effectiveType, activeTheme) ||
    WIDGET_LABELS[child.type] ||
    WIDGET_LABELS[effectiveType] ||
    child.title ||
    child.type;
  const widgetProfile = getWidgetConfigProfile(activeTheme, child.type);
  const isPostBuilder = builderLocation === "post";
  const isArchiveBuilder = builderLocation === "archive";
  const isImageWidget = effectiveType === "image_widget";
  const isSidebarAuxiliaryWidget =
    widgetProfile.isSidebarWidget || widgetProfile.isTagCloudWidget || widgetProfile.isAdBannerWidget;
  const usesHomepageStyleAuxiliaryModal =
    (isSidebarAuxiliaryWidget || isImageWidget) && (isPostBuilder || isArchiveBuilder);
  const effectivePanelBuilderLocation =
    usesHomepageStyleAuxiliaryModal ? "home" : builderLocation;
  const hasAdvancedTab = widgetProfile.isReferenceStyleWidget;
  const showContentTab =
    (!isHeaderBuilder || allowHeaderContentTab) &&
    (!isFooterBuilder || allowFooterContentTab) &&
    !widgetProfile.isVisualOnly &&
    (!isPostBuilder || usesHomepageStyleAuxiliaryModal) &&
    (!isArchiveBuilder || usesHomepageStyleAuxiliaryModal);
  const showAdvancedTab =
    isHeaderBuilder ||
    isFooterBuilder ||
    hasAdvancedTab ||
    isImageWidget ||
    ((isPostBuilder || isArchiveBuilder) && !usesHomepageStyleAuxiliaryModal);
  const showVisualTab = true;
  const contentTabLabel = "Konten";
  const visualTabLabel = "Gaya";
  const advancedTabLabel = "Lanjutan";
  const configTitle = typeof child.config?.title === "string" ? child.config.title.trim() : "";
  const blockTitle = typeof child.title === "string" ? child.title.trim() : "";
  const customTitle = blockTitle !== "" && blockTitle !== widgetName
    ? blockTitle
    : (configTitle !== "" && configTitle !== widgetName ? configTitle : "");
  const showCustomTitle = customTitle !== "";
  const builderContextLabel =
    builderLocation === "archive"
      ? "Widget Arsip"
      : builderLocation === "post"
        ? "Widget Artikel"
        : builderLocation === "header"
          ? "Widget Header"
          : builderLocation === "footer"
            ? "Widget Footer"
            : "Widget Beranda";
  const normalizedGlobalSettings = globalSettings
    ? {
        ...globalSettings,
        backgroundColor:
          globalSettings.globalElevatedColor ||
          globalSettings.globalSurfaceColor ||
          globalSettings.backgroundColor,
        homeMetaColor:
          globalSettings.homeMetaColor ||
          globalSettings.globalMutedTextColor ||
          globalSettings.metaColor,
        postMetaColor:
          globalSettings.postMetaColor ||
          globalSettings.globalMutedTextColor ||
          globalSettings.metaColor,
      }
    : undefined;
  const activeDeviceLabel = activeDeviceTab.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-3 sm:p-4">
        <div className="bg-[var(--bg-elevated)] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden h-[92vh] max-h-[92vh] flex flex-col border border-[var(--border)] animate-in zoom-in-95 duration-200">
            <div className="px-4 sm:px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-surface)]">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-base)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--fg-muted)]">
                            {builderContextLabel}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-lg font-bold text-[var(--fg-primary)] truncate max-w-[250px]">{widgetName}</h3>
                    </div>
                    <p className="text-[10px] text-[var(--fg-muted)] truncate max-w-[250px]">
                        {showCustomTitle ? customTitle : `Panel pengaturan ${builderContextLabel.toLowerCase()}`}
                    </p>
                </div>
                <button onClick={onClose} className="shrink-0 p-2 hover:bg-[var(--bg-base)] rounded-full transition-colors text-[var(--fg-muted)] hover:text-red-500">
                    <X size={20} />
                </button>
            </div>

            <div className="flex bg-[var(--bg-base)] border-b border-[var(--border)] sticky top-0 z-10">
                {showContentTab && (
                    <button
                        onClick={() => setActiveEditTab('content')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                            activeEditTab === 'content'
                                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]"
                                : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
                        }`}
                    >
                        {contentTabLabel}
                    </button>
                )}
                {showVisualTab && (
                    <button
                        onClick={() => setActiveEditTab('visual')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                            activeEditTab === 'visual'
                                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]"
                                : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
                        }`}
                    >
                        {visualTabLabel}
                    </button>
                )}
                {showAdvancedTab && (
                    <button
                        onClick={() => setActiveEditTab('advanced')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                            activeEditTab === 'advanced'
                                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]"
                                : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
                        }`}
                    >
                        {advancedTabLabel}
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[var(--bg-surface)] custom-scrollbar">
                <BlockConfigPanel
                    builderLocation={effectivePanelBuilderLocation}
                    activeTheme={activeTheme}
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
                    globalSettings={normalizedGlobalSettings}
                />
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-base)] flex items-center justify-between">
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
