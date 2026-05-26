import React, { createContext, useContext, useEffect, useState } from "react";
import { FileText, Palette, Copy } from "lucide-react";
import { Block, Category, Tag } from "./types";
import CustomColorPicker from "./ColorPicker";
import { ConfigValue, createConfigReaders } from "@/lib/page-builder-config";

const VISUAL_ONLY_WIDGETS = ['post_breadcrumb', 'post_title', 'post_meta', 'post_featured_image', 'post_content', 'post_navigation', 'post_subtitle', 'post_share', 'post_comments', 'post_tags', 'post_author_box'];
const ActiveDeviceTabContext = createContext<'desktop' | 'tablet' | 'mobile'>('desktop');

interface BlockConfigPanelProps {
    child: Block;
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
    globalSettings?: {
        primaryColor: string;
        headingColor: string;
        metaColor: string;
        excerptColor: string;
    };
}

type AdOption = {
    id: string;
    name: string;
    position?: string | null;
    isActive?: boolean | null;
};

// Helper for Color Inputs (Wrapper around CustomColorPicker)
const BaseColorPicker = ({ 
    label, 
    configKey, 
    globalDefault, 
    isResponsive = true,
    child,
    getConfigValue,
    updateChildResponsiveConfig,
    updateChildConfig
}: { 
    label: string, 
    configKey: string, 
    globalDefault?: string, 
    isResponsive?: boolean,
    child: Block,
    getConfigValue: (child: Block, key: string) => unknown,
    updateChildResponsiveConfig: (key: string, value: ConfigValue) => void,
    updateChildConfig: (key: string, value: ConfigValue) => void
}) => {
    const rawValue = isResponsive ? getConfigValue(child, configKey) : child.config?.[configKey];
    const value = typeof rawValue === "string" ? rawValue : undefined;

    const handleChange = (val: string | undefined) => {
            if (isResponsive) updateChildResponsiveConfig(configKey, val);
            else updateChildConfig(configKey, val);
    };

    return (
        <CustomColorPicker 
            label={label}
            value={value}
            onChange={handleChange}
            globalDefault={globalDefault}
        />
    );
};

const ColorPicker = ({
    label,
    configKey,
    globalDefault,
    isResponsive = true,
    activeDeviceTab,
    child,
    getConfigValue,
    updateChildResponsiveConfig,
    updateChildConfig
}: {
    label: string,
    configKey: string,
    globalDefault?: string,
    isResponsive?: boolean,
    activeDeviceTab?: 'desktop' | 'tablet' | 'mobile',
    child: Block,
    getConfigValue: (child: Block, key: string) => unknown,
    updateChildResponsiveConfig: (key: string, value: ConfigValue) => void,
    updateChildConfig: (key: string, value: ConfigValue) => void
}) => {
    const contextDeviceTab = useContext(ActiveDeviceTabContext);
    const resolvedDeviceTab = activeDeviceTab || contextDeviceTab;
    const suffix = isResponsive ? ` (${resolvedDeviceTab.toUpperCase()})` : '';
    return (
        <BaseColorPicker
            label={`${label}${suffix}`}
            configKey={configKey}
            globalDefault={globalDefault}
            isResponsive={isResponsive}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
        />
    );
};

export default function BlockConfigPanel({
    child,
    categories,
    tags,
    activeEditTab,
    setActiveEditTab,
    activeDeviceTab,
    updateChildConfig,
    updateChildResponsiveConfig,
    getConfigValue,
    onUpdateTitle,
    globalSettings
}: BlockConfigPanelProps) {
    const [availableAds, setAvailableAds] = useState<AdOption[]>([]);
    const [loadingAds, setLoadingAds] = useState(false);
    const applyToAllDevices = (key: string, value: ConfigValue) => {
        updateChildConfig(key, value);
        updateChildConfig(`tablet${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
        updateChildConfig(`mobile${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
    };
    const deviceLabel = activeDeviceTab.toUpperCase();

    const { getConfigString, getConfigBool, getConfigForApply } = createConfigReaders(child, getConfigValue);
    const currentSidebarWidgetType = child.type === "sidebar_widget" ? getConfigString("widgetType", "popular_posts") : "";
    const isSidebarPostListType = currentSidebarWidgetType === "popular_posts" || currentSidebarWidgetType === "recent_posts";
    const isSidebarAdSlotType = currentSidebarWidgetType === "ad_slot";

    useEffect(() => {
        if (child.type !== "ad_banner") return;
        let cancelled = false;
        const loadAds = async () => {
            setLoadingAds(true);
            try {
                const res = await fetch("/api/ads", { cache: "no-store" });
                const data = await res.json();
                if (!cancelled) {
                    setAvailableAds(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Gagal memuat daftar iklan:", error);
                if (!cancelled) setAvailableAds([]);
            } finally {
                if (!cancelled) setLoadingAds(false);
            }
        };
        loadAds();
        return () => {
            cancelled = true;
        };
    }, [child.type]);

    useEffect(() => {
        if (VISUAL_ONLY_WIDGETS.includes(child.type) && activeEditTab === 'content') {
            setActiveEditTab('visual');
        }
    }, [child.type, activeEditTab, setActiveEditTab]);

    const CONTAINER_AT_BOTTOM_WIDGETS = [
        "post_tags",
        "post_navigation",
        "post_comments",
        "post_related_posts",
        "sidebar_widget",
        "tag_cloud",
        "ad_banner"
    ];
    const shouldRenderContainerAtBottom = CONTAINER_AT_BOTTOM_WIDGETS.includes(child.type);

    const renderMainContainerSettings = () => (
        <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                Wadah Utama (Container Widget)
            </h4>

            <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[var(--fg-primary)] block">Margin & Padding - {deviceLabel}</label>
                    <button
                        onClick={() => {
                            ['Top', 'Right', 'Bottom', 'Left'].forEach((side) => {
                                const margin = getConfigForApply(`margin${side}`);
                                const padding = getConfigForApply(`padding${side}`);
                                if (margin !== undefined) applyToAllDevices(`margin${side}`, margin);
                                if (padding !== undefined) applyToAllDevices(`padding${side}`, padding);
                            });
                        }}
                        className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                        title="Terapkan margin & padding ke semua device"
                    >
                        <Copy size={10} /> Semua
                    </button>
                </div>

                <div className="mb-3">
                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Margin (Top, Right, Bottom, Left) - {deviceLabel}</label>
                    <div className="grid grid-cols-4 gap-2">
                        {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                            <input
                                key={side}
                                type="number"
                                placeholder={side}
                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                value={getConfigString(`margin${side}`)}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    updateChildResponsiveConfig(`margin${side}`, isNaN(val) ? undefined : val);
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Padding (Top, Right, Bottom, Left) - {deviceLabel}</label>
                    <div className="grid grid-cols-4 gap-2">
                        {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                            <input
                                key={side}
                                type="number"
                                placeholder={side}
                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                value={getConfigString(`padding${side}`)}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    updateChildResponsiveConfig(`padding${side}`, isNaN(val) ? undefined : val);
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-5">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[var(--fg-primary)] block">Perataan Konten - {deviceLabel}</label>
                    <button
                        onClick={() => {
                            const textAlign = getConfigForApply("textAlign");
                            if (textAlign !== undefined) applyToAllDevices("textAlign", textAlign);
                        }}
                        className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                        title="Terapkan perataan ke semua device"
                    >
                        <Copy size={10} /> Semua
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { key: "left", label: "Kiri" },
                        { key: "center", label: "Tengah" },
                        { key: "right", label: "Kanan" }
                    ].map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => updateChildResponsiveConfig("textAlign", item.key)}
                            className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                getConfigString("textAlign", "left") === item.key
                                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-2">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[var(--fg-primary)] block">Posisi Vertikal Widget - {deviceLabel}</label>
                    <button
                        onClick={() => {
                            const verticalAlign = getConfigForApply("verticalAlign");
                            if (verticalAlign !== undefined) applyToAllDevices("verticalAlign", verticalAlign);
                        }}
                        className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                        title="Terapkan posisi vertikal ke semua device"
                    >
                        <Copy size={10} /> Semua
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { key: "top", label: "Atas" },
                        { key: "center", label: "Tengah" },
                        { key: "bottom", label: "Bawah" }
                    ].map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => updateChildResponsiveConfig("verticalAlign", item.key)}
                            className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                getConfigString("verticalAlign", "top") === item.key
                                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const getVisualDeviceInfoMessage = () => {
        const base = `untuk device \` ${deviceLabel} \``;
        switch (child.type) {
            case "sidebar_widget":
                return `Anda sedang mengedit visual \`Sidebar Widget\` ${base}. Semua pengaturan judul widget, thumbnail, meta, warna, dan container di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "ad_banner":
                return `Anda sedang mengedit visual \`Iklan Banner\` ${base}. Semua pengaturan judul widget, background, dan container di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "tag_cloud":
                return `Anda sedang mengedit visual \`Tag Cloud\` ${base}. Semua pengaturan ukuran tag, jarak, padding, warna, dan hover di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "post_title":
                return `Anda sedang mengedit tampilan \`Judul Artikel\` ${base}. Semua pengaturan tipografi di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "post_subtitle":
                return `Anda sedang mengedit tampilan \`Sub Judul\` ${base}. Semua pengaturan tipografi di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "post_content":
                return `Anda sedang mengedit tampilan \`Konten Artikel\` ${base}. Semua pengaturan tipografi di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "post_meta":
                return `Anda sedang mengedit tampilan \`Meta Artikel\` ${base}. Semua toggle dan desain meta di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "post_share":
                return `Anda sedang mengedit tampilan \`Tombol Share\` ${base}. Gunakan tombol \`Semua\` jika ingin menyalin setting ini ke Desktop, Tablet, dan Mobile sekaligus.`;
            case "post_author_box":
                return `Anda sedang mengedit \`Author Box\` ${base}. Semua pengaturan label, avatar, bio, alignment, dan warna di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "post_navigation":
                return `Anda sedang mengedit tampilan \`Navigasi Post\` ${base}. Semua pengaturan desain, elemen navigasi, judul, dan border di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "post_comments":
                return `Anda sedang mengedit visual \`Komentar\` ${base}. Semua warna kartu, input, tombol, meta, dan link balas di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "post_related_posts":
                return `Anda sedang mengedit visual \`Related Pos\` ${base}. Semua pengaturan judul, meta, excerpt, thumbnail, dan style kartu di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "post_breadcrumb":
                return `Anda sedang mengedit tampilan \`Breadcrumb\` ${base}. Gunakan tombol \`Semua\` jika ingin menyalin setting ini ke Desktop, Tablet, dan Mobile sekaligus.`;
            case "post_featured_image":
                return `Anda sedang mengedit tampilan \`Featured Image\` ${base}. Semua pengaturan gambar di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "post_tags":
                return `Anda sedang mengedit tampilan \`Tag Artikel\` ${base}. Semua pengaturan label, desain, ukuran, jarak, warna, dan hover di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            default:
                return null;
        }
    };

    return (
        <ActiveDeviceTabContext.Provider value={activeDeviceTab}>
        <div className="flex flex-col h-full flex-1 min-h-0 page-builder-config-theme">
            {/* Tabs */}
            <div className="flex border-b border-[var(--border)]">
                {!VISUAL_ONLY_WIDGETS.includes(child.type) && (
                <button 
                    onClick={() => setActiveEditTab("content")}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeEditTab === "content" ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]" : "border-transparent text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"}`}
                >
                    <FileText size={16} className="inline mr-2" />
                    Konten
                </button>
                )}
                <button 
                    onClick={() => setActiveEditTab("visual")}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeEditTab === "visual" ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]" : "border-transparent text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"} ${VISUAL_ONLY_WIDGETS.includes(child.type) ? 'w-full text-center' : ''}`}
                >
                    <Palette size={16} className="inline mr-2" />
                    Visual
                </button>
            </div>

            <div className="p-6 overflow-y-auto overscroll-contain space-y-6 flex-1 min-h-0">
                    {activeEditTab === "content" ? (
                        <div className="space-y-6">
                            {/* Title */}
                            {child.type !== 'post_title' && child.type !== 'post_author_box' && (
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider block">Judul Widget</label>
                                </div>
                                <input 
                                    type="text" 
                                    value={child.title}
                                    onChange={(e) => onUpdateTitle(e.target.value)}
                                    className={`w-full font-bold text-[var(--fg-primary)] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 focus:border-[var(--accent)] focus:bg-[var(--bg-base)] focus:outline-none transition-all text-sm ${!getConfigBool("showTitle", true) ? 'opacity-50' : ''}`}
                                />
                                {!getConfigBool("showTitle", true) && (
                                    <p className="text-[10px] text-[var(--fg-muted)] mt-1 italic">Judul ini hanya tampil di Admin.</p>
                                )}

                            </div>
                            )}

                            {/* News Config */}
                            {(child.type.startsWith("news_") || child.type === "headline_2" || child.type === "news_list_highlight") && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Kategori</label>
                                    <div className="flex p-1 bg-[var(--bg-base)] rounded-lg border border-[var(--border)] mb-3">
                                    <button
                                        className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("filterType", "category") === "category" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"}`}
                                        onClick={() => updateChildConfig("filterType", "category")}
                                    >
                                        Kategori
                                    </button>
                                    <button
                                        className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("filterType", "category") === "tag" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"}`}
                                        onClick={() => updateChildConfig("filterType", "tag")}
                                    >
                                        Tag
                                    </button>
                                    </div>

                                    {(getConfigString("filterType", "category") === "category") ? (
                                        <select 
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
                                        value={getConfigString("categorySlug", "all")}
                                        onChange={(e) => updateChildConfig("categorySlug", e.target.value)}
                                        >
                                        <option value="all">Semua</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                        ))}
                                        </select>
                                    ) : (
                                        <select 
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
                                        value={getConfigString("tagSlug")}
                                        onChange={(e) => updateChildConfig("tagSlug", e.target.value)}
                                        >
                                        <option value="">-- Pilih Tag --</option>
                                        {tags.map(tag => (
                                            <option key={tag.id} value={tag.slug}>{tag.name}</option>
                                        ))}
                                        </select>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Urutan Berita</label>
                                    <select 
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
                                    value={getConfigString("sortOrder", "latest")}
                                    onChange={(e) => updateChildConfig("sortOrder", e.target.value)}
                                    >
                                        <option value="latest">Terbaru (Latest)</option>
                                        <option value="oldest">Terlama (Oldest)</option>
                                        <option value="popular">Terpopuler (Popular)</option>
                                        <option value="random">Acak (Random)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Jml Berita</label>
                                    <select 
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
                                    value={getConfigString("limit", child.type === "headline_2" ? "1" : "6")}
                                    onChange={(e) => updateChildConfig("limit", parseInt(e.target.value))}
                                    disabled={child.type === "headline_2"}
                                    >
                                    {child.type === "headline_2" ? (
                                            <option value={1}>1 (Fixed)</option>
                                    ) : (
                                        <>
                                            <option value={3}>3 Items</option>
                                            <option value={4}>4 Items</option>
                                            <option value={5}>5 Items</option>
                                            <option value={6}>6 Items</option>
                                            <option value={8}>8 Items</option>
                                            <option value={9}>9 Items</option>
                                            <option value={10}>10 Items</option>
                                            <option value={12}>12 Items</option>
                                            <option value={15}>15 Items</option>
                                            <option value={20}>20 Items</option>
                                        </>
                                    )}
                                    </select>
                                </div>


                            </>
                            )}

                            {/* Sidebar Widget Config */}
                            {child.type === "sidebar_widget" && (
                            <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                        <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                        Sidebar Widget
                                        <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                            {deviceLabel}
                                        </span>
                                    </h4>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Tipe Widget - {deviceLabel}</label>
                                    <select 
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
                                    value={getConfigString("widgetType", "popular_posts")}
                                    onChange={(e) => updateChildResponsiveConfig("widgetType", e.target.value)}
                                    >
                                    <option value="popular_posts">Berita Populer</option>
                                    <option value="recent_posts">Berita Terbaru</option>
                                    <option value="category_list">Daftar Kategori</option>
                                    <option value="ad_slot">Iklan / Ad Slot</option>
                                    </select>
                                </div>

                                {!isSidebarAdSlotType && (
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">{currentSidebarWidgetType === "category_list" ? `Jumlah Kategori - ${deviceLabel}` : `Jumlah Item - ${deviceLabel}`}</label>
                                        <select 
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
                                        value={getConfigString("limit", "5")}
                                        onChange={(e) => updateChildResponsiveConfig("limit", parseInt(e.target.value))}
                                        >
                                            <option value={3}>3 Item</option>
                                            <option value={5}>5 Item</option>
                                            <option value={7}>7 Item</option>
                                            <option value={10}>10 Item</option>
                                        </select>
                                    </div>
                                )}

                                {isSidebarAdSlotType && (
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Kode Iklan / HTML</label>
                                        <textarea
                                            rows={6}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
                                            value={getConfigString("adCode")}
                                            onChange={(e) => updateChildConfig("adCode", e.target.value)}
                                            placeholder="<div>Script iklan atau HTML custom</div>"
                                        />
                                    </div>
                                )}
                            </div>
                            )}
                            
                            {/* Global Sidebar Config */}
                            {child.type === "global_sidebar" && (
                                <div className="p-4 bg-[var(--accent-subtle)] rounded-lg border border-[var(--border)] text-[var(--fg-secondary)] text-sm">
                                    <p className="font-medium">Widget ini mewarisi sidebar dari Homepage.</p>
                                    <p className="text-xs mt-1">Pengaturan konten dilakukan di Homepage Builder.</p>
                                </div>
                            )}

                            {/* Tag Cloud Config */}
                            {child.type === "tag_cloud" && (
                            <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-3">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                        <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                        Tag Cloud
                                    </h4>
                                </div>
                                <div>
                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jumlah Tag</label>
                                <select 
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
                                    value={getConfigString("limit", "10")}
                                    onChange={(e) => updateChildResponsiveConfig("limit", parseInt(e.target.value))}
                                >
                                    <option value={5}>5 Tag</option>
                                    <option value={8}>8 Tag</option>
                                    <option value={10}>10 Tag</option>
                                    <option value={15}>15 Tag</option>
                                    <option value={20}>20 Tag</option>
                                </select>
                                </div>
                            </div>
                            )}

                            {/* Post Related Posts Config */}
                            {child.type === 'post_related_posts' && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Pengaturan Related Post
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const filterType = getConfigForApply("filterType");
                                                const limit = getConfigForApply("limit");
                                                if (filterType !== undefined) applyToAllDevices("filterType", filterType);
                                                if (limit !== undefined) applyToAllDevices("limit", limit);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan related post ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Filter Berdasarkan - {deviceLabel}</label>
                                        <div className="flex p-1 bg-[var(--bg-base)] rounded-lg border border-[var(--border)]">
                                            <button
                                                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("filterType", "category") === "category" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"}`}
                                                onClick={() => updateChildResponsiveConfig("filterType", "category")}
                                            >
                                                Kategori
                                            </button>
                                            <button
                                                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("filterType", "category") === "tag" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"}`}
                                                onClick={() => updateChildResponsiveConfig("filterType", "tag")}
                                            >
                                                Tag
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-[var(--fg-secondary)] mt-1">
                                            {getConfigString("filterType", "category") === "tag"
                                                ? "Menampilkan artikel dengan tag yang sama."
                                                : "Menampilkan artikel dari kategori yang sama."}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jumlah Artikel - {deviceLabel}</label>
                                        <select
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none h-9 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                            value={getConfigString("limit", "3")}
                                            onChange={(e) => updateChildResponsiveConfig("limit", parseInt(e.target.value, 10))}
                                        >
                                            <option value={2}>2 Items</option>
                                            <option value={3}>3 Items</option>
                                            <option value={4}>4 Items</option>
                                            <option value={6}>6 Items</option>
                                            <option value={8}>8 Items</option>
                                            <option value={9}>9 Items</option>
                                            <option value={12}>12 Items</option>
                                        </select>
                                    </div>

                                </div>
                            )}

                            {/* Ad Banner Config */}
                            {child.type === "ad_banner" && (
                            <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                        <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                        Ad Banner
                                    </h4>
                                </div>
                                <div>
                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Pilih Iklan</label>
                                <select
                                    value={getConfigString("selectedAdId", "")}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedAd = availableAds.find((ad) => ad.id === selectedId);
                                        updateChildConfig("selectedAdId", selectedId);
                                        updateChildConfig("position", selectedAd?.position || "");
                                    }}
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                                >
                                    <option value="">{loadingAds ? "Memuat daftar iklan..." : "Pilih iklan dari daftar"}</option>
                                    {availableAds.map((ad) => (
                                        <option key={ad.id} value={ad.id}>
                                            {ad.name}{ad.position ? ` - ${ad.position}` : ""}{ad.isActive === false ? " (Nonaktif)" : ""}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-[var(--fg-muted)] mt-1">Daftar ini mengambil iklan yang sudah kamu buat di menu Manajemen Iklan.</p>
                                </div>
                                <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block">Sembunyikan Bila Kosong</label>
                                        <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Jika tidak ada iklan, widget tidak ditampilkan di frontend.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={getConfigBool("hideWhenEmpty", false)}
                                            onChange={(e) => updateChildConfig("hideWhenEmpty", e.target.checked)}
                                        />
                                        <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                    </label>
                                </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {getVisualDeviceInfoMessage() && (
                                <div className="rounded-lg border border-[color:var(--accent)/0.2] bg-[color:var(--accent)/0.06] px-3 py-2 text-[11px] text-[var(--fg-secondary)]">
                                    {getVisualDeviceInfoMessage()}
                                </div>
                            )}
                            {/* Block Title Settings - For Headline & Others */}
                            {(() => {
                                const type = String(child.type || "");
                                return ["news_list", "news_grid", "news_grid_slider", "sidebar_widget", "tag_cloud", "post_related_posts", "post_comments"].includes(type) && getConfigBool("showTitle", true);
                            })() && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-[var(--fg-primary)] block">Judul Widget - {deviceLabel}</label>
                                        <button 
                                            onClick={() => {
                                                const titleSize = getConfigForApply("blockTitleFontSize");
                                                const titleLineHeight = getConfigForApply("blockTitleLineHeight");
                                                const titleColor = getConfigForApply("blockTitleColor");
                                                const titleBorderColor = getConfigForApply("blockTitleBorderColor");
                                                if (titleSize !== undefined) applyToAllDevices("blockTitleFontSize", titleSize);
                                                if (titleLineHeight !== undefined) applyToAllDevices("blockTitleLineHeight", titleLineHeight);
                                                if (titleColor !== undefined) applyToAllDevices("blockTitleColor", titleColor);
                                                if (titleBorderColor !== undefined) applyToAllDevices("blockTitleBorderColor", titleBorderColor);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan judul widget ini ke semua device"
                                        >
                                            <Copy size={10} /> Terapkan ke Semua
                                        </button>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1">Ukuran Font (px)</label>
                                        <input 
                                            type="number" 
                                            placeholder="Default (24)"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:border-[var(--accent)] outline-none"
                                            value={getConfigString("blockTitleFontSize")}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                updateChildResponsiveConfig("blockTitleFontSize", isNaN(val) ? undefined : val);
                                            }}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1">Line Height</label>
                                        <input 
                                            type="number" step="0.1"
                                            placeholder="Default (1.4)"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:border-[var(--accent)] outline-none"
                                            value={getConfigString("blockTitleLineHeight")}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                updateChildResponsiveConfig("blockTitleLineHeight", isNaN(val) ? undefined : val);
                                            }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border)]">
                                        <ColorPicker 
                                            label="Warna Judul" 
                                            configKey="blockTitleColor" 
                                            globalDefault={globalSettings?.headingColor} 
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker 
                                            label="Warna Garis Kiri" 
                                            configKey="blockTitleBorderColor" 
                                            globalDefault={globalSettings?.primaryColor} 
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                    </div>
                                </div>
                            )}

                            {child.type === "ad_banner" && !getConfigBool("hideWhenEmpty", false) && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-4">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                            Placeholder Kosong
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const emptyStateBgColor = getConfigForApply("emptyStateBgColor");
                                                const emptyStateBorderColor = getConfigForApply("emptyStateBorderColor");
                                                const emptyStateTextColor = getConfigForApply("emptyStateTextColor");
                                                const emptyStateSubtextColor = getConfigForApply("emptyStateSubtextColor");
                                                if (emptyStateBgColor !== undefined) applyToAllDevices("emptyStateBgColor", emptyStateBgColor);
                                                if (emptyStateBorderColor !== undefined) applyToAllDevices("emptyStateBorderColor", emptyStateBorderColor);
                                                if (emptyStateTextColor !== undefined) applyToAllDevices("emptyStateTextColor", emptyStateTextColor);
                                                if (emptyStateSubtextColor !== undefined) applyToAllDevices("emptyStateSubtextColor", emptyStateSubtextColor);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan placeholder ini ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <ColorPicker
                                            label="Background"
                                            configKey="emptyStateBgColor"
                                            globalDefault="#f9fafb"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Border"
                                            configKey="emptyStateBorderColor"
                                            globalDefault="#e5e7eb"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Teks Utama"
                                            configKey="emptyStateTextColor"
                                            globalDefault="#9ca3af"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Teks Keterangan"
                                            configKey="emptyStateSubtextColor"
                                            globalDefault="#6b7280"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Post Meta Config - Moved from Content */}
                            {child.type === 'post_meta' && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-4">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Tampilan Meta Artikel
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const showAuthor = getConfigForApply("showAuthor");
                                                const showAuthorAvatar = getConfigForApply("showAuthorAvatar");
                                                const showDate = getConfigForApply("showDate");
                                                const showCategory = getConfigForApply("showCategory");
                                                const metaDesign = getConfigForApply("metaDesign");
                                                if (showAuthor !== undefined) applyToAllDevices("showAuthor", showAuthor);
                                                if (showAuthorAvatar !== undefined) applyToAllDevices("showAuthorAvatar", showAuthorAvatar);
                                                if (showDate !== undefined) applyToAllDevices("showDate", showDate);
                                                if (showCategory !== undefined) applyToAllDevices("showCategory", showCategory);
                                                if (metaDesign !== undefined) applyToAllDevices("metaDesign", metaDesign);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan meta ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] cursor-pointer">
                                            <input type="checkbox" className="rounded text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showAuthor", true)} onChange={(e) => updateChildResponsiveConfig("showAuthor", e.target.checked)} /> Author - {deviceLabel}
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] cursor-pointer">
                                            <input type="checkbox" className="rounded text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showAuthorAvatar", true)} onChange={(e) => updateChildResponsiveConfig("showAuthorAvatar", e.target.checked)} /> Foto Profil Author - {deviceLabel}
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] cursor-pointer">
                                            <input type="checkbox" className="rounded text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showDate", true)} onChange={(e) => updateChildResponsiveConfig("showDate", e.target.checked)} /> Tanggal - {deviceLabel}
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] cursor-pointer">
                                            <input type="checkbox" className="rounded text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showCategory", true)} onChange={(e) => updateChildResponsiveConfig("showCategory", e.target.checked)} /> Kategori - {deviceLabel}
                                        </label>
                                        <div>
                                            <label className="text-[11px] font-bold text-[var(--fg-primary)] block mb-2">Desain Meta - {deviceLabel}</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { key: "minimal", label: "Minimal" },
                                                    { key: "pill", label: "Pill" },
                                                    { key: "boxed", label: "Boxed" }
                                                ].map((item) => (
                                                    <button
                                                        key={item.key}
                                                        type="button"
                                                        onClick={() => updateChildResponsiveConfig("metaDesign", item.key)}
                                                        className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                            getConfigString("metaDesign", "minimal") === item.key
                                                                ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                                : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Post Share Config (Moved from Content) */}
                            {child.type === 'post_share' && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-2 mb-1">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Tampilan Tombol Share
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const align = getConfigForApply("align");
                                                const showShareLabel = getConfigForApply("showShareLabel");
                                                const shareLabelText = getConfigForApply("shareLabelText");
                                                const shareSize = getConfigForApply("shareSize");
                                                const shareGap = getConfigForApply("shareGap");
                                                const shareRadius = getConfigForApply("shareRadius");
                                                const shareShowContainerBorder = getConfigForApply("shareShowContainerBorder");
                                                const shareLabelPosition = getConfigForApply("shareLabelPosition");
                                                const shareContentMode = getConfigForApply("shareContentMode");
                                                const iconOnlyShape = getConfigForApply("iconOnlyShape");
                                                const shareLabelFontSize = getConfigForApply("shareLabelFontSize");
                                                const shareLabelFontWeight = getConfigForApply("shareLabelFontWeight");
                                                const shareLabelColor = getConfigForApply("shareLabelColor");
                                                const showFacebook = getConfigForApply("showFacebook");
                                                const showTwitter = getConfigForApply("showTwitter");
                                                const showWhatsapp = getConfigForApply("showWhatsapp");
                                                const showTelegram = getConfigForApply("showTelegram");
                                                const showLinkedIn = getConfigForApply("showLinkedIn");
                                                const showEmail = getConfigForApply("showEmail");
                                                const showCopyLink = getConfigForApply("showCopyLink");
                                                if (align !== undefined) applyToAllDevices("align", align);
                                                if (showShareLabel !== undefined) applyToAllDevices("showShareLabel", showShareLabel);
                                                if (shareLabelText !== undefined) applyToAllDevices("shareLabelText", shareLabelText);
                                                if (shareSize !== undefined) applyToAllDevices("shareSize", shareSize);
                                                if (shareGap !== undefined) applyToAllDevices("shareGap", shareGap);
                                                if (shareRadius !== undefined) applyToAllDevices("shareRadius", shareRadius);
                                                if (shareShowContainerBorder !== undefined) applyToAllDevices("shareShowContainerBorder", shareShowContainerBorder);
                                                if (shareLabelPosition !== undefined) applyToAllDevices("shareLabelPosition", shareLabelPosition);
                                                if (shareContentMode !== undefined) applyToAllDevices("shareContentMode", shareContentMode);
                                                if (iconOnlyShape !== undefined) applyToAllDevices("iconOnlyShape", iconOnlyShape);
                                                if (shareLabelFontSize !== undefined) applyToAllDevices("shareLabelFontSize", shareLabelFontSize);
                                                if (shareLabelFontWeight !== undefined) applyToAllDevices("shareLabelFontWeight", shareLabelFontWeight);
                                                if (shareLabelColor !== undefined) applyToAllDevices("shareLabelColor", shareLabelColor);
                                                if (showFacebook !== undefined) applyToAllDevices("showFacebook", showFacebook);
                                                if (showTwitter !== undefined) applyToAllDevices("showTwitter", showTwitter);
                                                if (showWhatsapp !== undefined) applyToAllDevices("showWhatsapp", showWhatsapp);
                                                if (showTelegram !== undefined) applyToAllDevices("showTelegram", showTelegram);
                                                if (showLinkedIn !== undefined) applyToAllDevices("showLinkedIn", showLinkedIn);
                                                if (showEmail !== undefined) applyToAllDevices("showEmail", showEmail);
                                                if (showCopyLink !== undefined) applyToAllDevices("showCopyLink", showCopyLink);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan tampilan tombol share ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Posisi Tombol - {deviceLabel}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { key: "left", label: "Kiri" },
                                                { key: "center", label: "Tengah" },
                                                { key: "right", label: "Kanan" }
                                            ].map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => updateChildResponsiveConfig("align", item.key)}
                                                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                        getConfigString("align", "left") === item.key
                                                            ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                            : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Teks Share - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showShareLabel", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showShareLabel", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>

                                        {getConfigBool("showShareLabel", true) && (
                                            <>
                                                <div>
                                                    <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Isi Teks - {deviceLabel}</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                        value={getConfigString("shareLabelText", "Bagikan :")}
                                                        onChange={(e) => updateChildResponsiveConfig("shareLabelText", e.target.value)}
                                                        placeholder="Bagikan :"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Posisi Teks - {deviceLabel}</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            { key: "top", label: "Di Atas Tombol" },
                                                            { key: "inline", label: "Sebelum Ikon" }
                                                        ].map((item) => (
                                                            <button
                                                                key={item.key}
                                                                type="button"
                                                                onClick={() => updateChildResponsiveConfig("shareLabelPosition", item.key)}
                                                                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                                    getConfigString("shareLabelPosition", "inline") === item.key
                                                                        ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                                        : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                                }`}
                                                            >
                                                                {item.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div>
                                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Ukuran Teks (px) - {deviceLabel}</label>
                                                        <input
                                                            type="number"
                                                            min={10}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2 py-2 text-xs outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                            value={getConfigString("shareLabelFontSize", "14")}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value, 10);
                                                                updateChildResponsiveConfig("shareLabelFontSize", isNaN(val) ? undefined : val);
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Ketebalan - {deviceLabel}</label>
                                                        <select
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2 py-2 text-xs outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                            value={getConfigString("shareLabelFontWeight", "600")}
                                                            onChange={(e) => updateChildResponsiveConfig("shareLabelFontWeight", e.target.value)}
                                                        >
                                                            <option value="400">Normal (400)</option>
                                                            <option value="500">Medium (500)</option>
                                                            <option value="600">Semi Bold (600)</option>
                                                            <option value="700">Bold (700)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Warna Teks - {deviceLabel}</label>
                                                        <input
                                                            type="color"
                                                            className="w-full h-9 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1 cursor-pointer"
                                                            value={getConfigString("shareLabelColor", "#111827")}
                                                            onChange={(e) => updateChildResponsiveConfig("shareLabelColor", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Tampilan Tombol - {deviceLabel}</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { key: "icon_text", label: "Icon + Text" },
                                                    { key: "icon_only", label: "Icon Saja" }
                                                ].map((item) => (
                                                    <button
                                                        key={item.key}
                                                        type="button"
                                                        onClick={() => updateChildResponsiveConfig("shareContentMode", item.key)}
                                                        className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                            getConfigString("shareContentMode", "icon_text") === item.key
                                                                ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                                : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {getConfigString("shareContentMode", "icon_text") === "icon_only" && (
                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Bentuk Icon - {deviceLabel}</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { key: "square", label: "Kotak" },
                                                        { key: "circle", label: "Bulat" }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.key}
                                                            type="button"
                                                            onClick={() => updateChildResponsiveConfig("iconOnlyShape", item.key)}
                                                            className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                                getConfigString("iconOnlyShape", "square") === item.key
                                                                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                            }`}
                                                        >
                                                            {item.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Ukuran Tombol - {deviceLabel}</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { key: "sm", label: "Kecil" },
                                                    { key: "md", label: "Sedang" },
                                                    { key: "lg", label: "Besar" }
                                                ].map((item) => (
                                                    <button
                                                        key={item.key}
                                                        type="button"
                                                        onClick={() => updateChildResponsiveConfig("shareSize", item.key)}
                                                        className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                            getConfigString("shareSize", "md") === item.key
                                                                ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                                : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-3">
                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Bentuk Sudut - {deviceLabel}</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { key: "global", label: "Global" },
                                                        { key: "sm", label: "Kecil" },
                                                        { key: "md", label: "Normal" },
                                                        { key: "pill", label: "Pill" }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.key}
                                                            type="button"
                                                            onClick={() => updateChildResponsiveConfig("shareRadius", item.key)}
                                                            className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                                getConfigString("shareRadius", "global") === item.key
                                                                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                            }`}
                                                        >
                                                            {item.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jarak Antar Tombol (px) - {deviceLabel}</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs outline-none h-10 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                    value={getConfigString("shareGap", "8")}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        updateChildResponsiveConfig("shareGap", isNaN(val) ? undefined : val);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2.5">
                                        <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Borderline Kotak Share - {deviceLabel}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={getConfigBool("shareShowContainerBorder", getConfigBool("shareShowBorder", true))}
                                                onChange={(e) => {
                                                    updateChildResponsiveConfig("shareShowContainerBorder", e.target.checked);
                                                    updateChildConfig("shareShowBorder", undefined);
                                                }}
                                            />
                                            <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-2">Platform Aktif - {deviceLabel}</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { key: "showFacebook", label: "Facebook", default: true },
                                                { key: "showTwitter", label: "X (Twitter)", default: true },
                                                { key: "showWhatsapp", label: "WhatsApp", default: true },
                                                { key: "showTelegram", label: "Telegram", default: false },
                                                { key: "showLinkedIn", label: "LinkedIn", default: false },
                                                { key: "showEmail", label: "Email", default: false },
                                                { key: "showCopyLink", label: "Salin Link", default: true }
                                            ].map((item) => {
                                                const checked = getConfigBool(item.key, item.default);
                                                return (
                                                    <div key={item.key} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
                                                        <span className="text-xs text-[var(--fg-primary)]">{item.label}</span>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only peer"
                                                                checked={checked}
                                                                onChange={(e) => updateChildResponsiveConfig(item.key, e.target.checked)}
                                                            />
                                                            <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {child.type === "post_author_box" && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-2 mb-1">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Tampilan Author Box
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const authorSource = getConfigForApply("authorSource");
                                                const showAuthorLabel = getConfigForApply("showAuthorLabel");
                                                const authorLabelText = getConfigForApply("authorLabelText");
                                                const showAuthorAvatar = getConfigForApply("showAuthorAvatar");
                                                const showAuthorBio = getConfigForApply("showAuthorBio");
                                                const authorDesign = getConfigForApply("authorDesign");
                                                const authorAlign = getConfigForApply("authorAlign");
                                                const useBox = getConfigForApply("useBox");
                                                const boxColor = getConfigForApply("boxColor");
                                                const boxRadius = getConfigForApply("boxBorderRadius");
                                                const avatarSize = getConfigForApply("avatarSize");
                                                const avatarRadius = getConfigForApply("avatarRadius");
                                                const labelColor = getConfigForApply("labelColor");
                                                const nameColor = getConfigForApply("nameColor");
                                                const bioColor = getConfigForApply("bioColor");
                                                if (authorSource !== undefined) applyToAllDevices("authorSource", authorSource);
                                                if (showAuthorLabel !== undefined) applyToAllDevices("showAuthorLabel", showAuthorLabel);
                                                if (authorLabelText !== undefined) applyToAllDevices("authorLabelText", authorLabelText);
                                                if (showAuthorAvatar !== undefined) applyToAllDevices("showAuthorAvatar", showAuthorAvatar);
                                                if (showAuthorBio !== undefined) applyToAllDevices("showAuthorBio", showAuthorBio);
                                                if (authorDesign !== undefined) applyToAllDevices("authorDesign", authorDesign);
                                                if (authorAlign !== undefined) applyToAllDevices("authorAlign", authorAlign);
                                                if (useBox !== undefined) applyToAllDevices("useBox", useBox);
                                                if (boxColor !== undefined) applyToAllDevices("boxColor", boxColor);
                                                if (boxRadius !== undefined) applyToAllDevices("boxBorderRadius", boxRadius);
                                                if (avatarSize !== undefined) applyToAllDevices("avatarSize", avatarSize);
                                                if (avatarRadius !== undefined) applyToAllDevices("avatarRadius", avatarRadius);
                                                if (labelColor !== undefined) applyToAllDevices("labelColor", labelColor);
                                                if (nameColor !== undefined) applyToAllDevices("nameColor", nameColor);
                                                if (bioColor !== undefined) applyToAllDevices("bioColor", bioColor);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan Author Box ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Tampilkan Profil - {deviceLabel}</label>
                                            <select
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("authorSource", "author") === "editor" ? "editor" : "author"}
                                                onChange={(e) => updateChildResponsiveConfig("authorSource", e.target.value === "editor" ? "editor" : "author")}
                                            >
                                                <option value="author">Penulis</option>
                                                <option value="editor">Editor</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Label Penulis - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showAuthorLabel", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showAuthorLabel", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        {getConfigBool("showAuthorLabel", true) && (
                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Teks Label - {deviceLabel}</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                    value={getConfigString("authorLabelText", "Penulis")}
                                                    onChange={(e) => updateChildResponsiveConfig("authorLabelText", e.target.value)}
                                                    placeholder="Penulis"
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Avatar - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showAuthorAvatar", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showAuthorAvatar", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Bio Penulis - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showAuthorBio", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showAuthorBio", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Desain Author Box - {deviceLabel}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { key: "minimal", label: "Minimal" },
                                                { key: "card", label: "Card" },
                                                { key: "split", label: "Split" }
                                            ].map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => updateChildResponsiveConfig("authorDesign", item.key)}
                                                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                        getConfigString("authorDesign", "minimal") === item.key
                                                            ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                            : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Perataan Konten - {deviceLabel}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { key: "left", label: "Kiri" },
                                                { key: "center", label: "Tengah" },
                                                { key: "right", label: "Kanan" }
                                            ].map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => updateChildResponsiveConfig("authorAlign", item.key)}
                                                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                        getConfigString("authorAlign", "left") === item.key
                                                            ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                            : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Aktifkan Background - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("useBox")}
                                                    onChange={(e) => updateChildResponsiveConfig("useBox", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        {getConfigBool("useBox") && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <ColorPicker
                                                    label={`Warna Background - ${deviceLabel}`}
                                                    configKey="boxColor"
                                                    globalDefault="#ffffff"
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Border Radius - {deviceLabel}</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                        value={getConfigString("boxBorderRadius", "xl")}
                                                        onChange={(e) => updateChildResponsiveConfig("boxBorderRadius", e.target.value)}
                                                    >
                                                        <option value="none">Kotak (0px)</option>
                                                        <option value="sm">Kecil</option>
                                                        <option value="md">Sedang</option>
                                                        <option value="lg">Besar</option>
                                                        <option value="xl">XL</option>
                                                        <option value="2xl">2XL</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ukuran Avatar (px) - {deviceLabel}</label>
                                            <input
                                                type="number"
                                                min={24}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("avatarSize")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("avatarSize", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius Avatar (px) - {deviceLabel}</label>
                                            <input
                                                type="number"
                                                min={0}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("avatarRadius")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("avatarRadius", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <ColorPicker
                                            label={`Warna Label - ${deviceLabel}`}
                                            configKey="labelColor"
                                            globalDefault={globalSettings?.metaColor || "#94a3b8"}
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label={`Warna Nama - ${deviceLabel}`}
                                            configKey="nameColor"
                                            globalDefault={globalSettings?.headingColor || "#111827"}
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label={`Warna Bio - ${deviceLabel}`}
                                            configKey="bioColor"
                                            globalDefault={globalSettings?.metaColor || "#6b7280"}
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                    </div>
                                </div>
                            )}

                            {child.type === "post_navigation" && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Tampilan Navigasi Post
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const navigationDesign = getConfigForApply("navigationDesign");
                                                const showNavLabel = getConfigForApply("showNavLabel");
                                                const showNavThumbnail = getConfigForApply("showNavThumbnail");
                                                const showNavArrow = getConfigForApply("showNavArrow");
                                                const showNavBorder = getConfigForApply("showNavBorder");
                                                const titleColor = getConfigForApply("titleColor");
                                                const titleHoverColor = getConfigForApply("titleHoverColor");
                                                const titleFontSize = getConfigForApply("titleFontSize");
                                                const titleLineHeight = getConfigForApply("titleLineHeight");
                                                const titleFontWeight = getConfigForApply("titleFontWeight");
                                                const navBorderColor = getConfigForApply("navBorderColor");
                                                const navBorderWidth = getConfigForApply("navBorderWidth");
                                                if (navigationDesign !== undefined) applyToAllDevices("navigationDesign", navigationDesign);
                                                if (showNavLabel !== undefined) applyToAllDevices("showNavLabel", showNavLabel);
                                                if (showNavThumbnail !== undefined) applyToAllDevices("showNavThumbnail", showNavThumbnail);
                                                if (showNavArrow !== undefined) applyToAllDevices("showNavArrow", showNavArrow);
                                                if (showNavBorder !== undefined) applyToAllDevices("showNavBorder", showNavBorder);
                                                if (titleColor !== undefined) applyToAllDevices("titleColor", titleColor);
                                                if (titleHoverColor !== undefined) applyToAllDevices("titleHoverColor", titleHoverColor);
                                                if (titleFontSize !== undefined) applyToAllDevices("titleFontSize", titleFontSize);
                                                if (titleLineHeight !== undefined) applyToAllDevices("titleLineHeight", titleLineHeight);
                                                if (titleFontWeight !== undefined) applyToAllDevices("titleFontWeight", titleFontWeight);
                                                if (navBorderColor !== undefined) applyToAllDevices("navBorderColor", navBorderColor);
                                                if (navBorderWidth !== undefined) applyToAllDevices("navBorderWidth", navBorderWidth);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan navigasi ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Gaya Navigasi - {deviceLabel}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { key: "card", label: "Card" },
                                                { key: "soft", label: "Soft" },
                                                { key: "minimal", label: "Minimal" }
                                            ].map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => updateChildResponsiveConfig("navigationDesign", item.key)}
                                                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                        getConfigString("navigationDesign", "card") === item.key
                                                            ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                            : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Label Arah - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showNavLabel", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showNavLabel", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Thumbnail - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showNavThumbnail", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showNavThumbnail", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Tombol Panah - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showNavArrow", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showNavArrow", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Line Border Pembungkus - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showNavBorder", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showNavBorder", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block">Judul Berita - {deviceLabel}</label>
                                            <button
                                                onClick={() => {
                                                    const titleColor = getConfigForApply("titleColor");
                                                    const titleHoverColor = getConfigForApply("titleHoverColor");
                                                    const titleFontSize = getConfigForApply("titleFontSize");
                                                    const titleLineHeight = getConfigForApply("titleLineHeight");
                                                    const titleFontWeight = getConfigForApply("titleFontWeight");
                                                    if (titleColor !== undefined) applyToAllDevices("titleColor", titleColor);
                                                    if (titleHoverColor !== undefined) applyToAllDevices("titleHoverColor", titleHoverColor);
                                                    if (titleFontSize !== undefined) applyToAllDevices("titleFontSize", titleFontSize);
                                                    if (titleLineHeight !== undefined) applyToAllDevices("titleLineHeight", titleLineHeight);
                                                    if (titleFontWeight !== undefined) applyToAllDevices("titleFontWeight", titleFontWeight);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan pengaturan judul berita ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <ColorPicker
                                                label={`Warna Judul - ${deviceLabel}`}
                                                configKey="titleColor"
                                                globalDefault={globalSettings?.headingColor || "#111827"}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <ColorPicker
                                                label={`Warna Hover - ${deviceLabel}`}
                                                configKey="titleHoverColor"
                                                globalDefault={globalSettings?.primaryColor || "#f97316"}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Size (px) - {deviceLabel}</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                    value={getConfigString("titleFontSize")}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        updateChildResponsiveConfig("titleFontSize", isNaN(val) ? undefined : val);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Line Height - {deviceLabel}</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                    value={getConfigString("titleLineHeight")}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        updateChildResponsiveConfig("titleLineHeight", isNaN(val) ? undefined : val);
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Font Weight - {deviceLabel}</label>
                                                <select
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                    value={getConfigString("titleFontWeight", "700")}
                                                    onChange={(e) => updateChildResponsiveConfig("titleFontWeight", e.target.value)}
                                                >
                                                    <option value="400">Normal (400)</option>
                                                    <option value="500">Medium (500)</option>
                                                    <option value="600">Semi Bold (600)</option>
                                                    <option value="700">Bold (700)</option>
                                                    <option value="800">Extra Bold (800)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block">Border Line - {deviceLabel}</label>
                                            <button
                                                onClick={() => {
                                                    const navBorderColor = getConfigForApply("navBorderColor");
                                                    const navBorderWidth = getConfigForApply("navBorderWidth");
                                                    if (navBorderColor !== undefined) applyToAllDevices("navBorderColor", navBorderColor);
                                                    if (navBorderWidth !== undefined) applyToAllDevices("navBorderWidth", navBorderWidth);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan pengaturan border line ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <ColorPicker
                                                label={`Warna Border - ${deviceLabel}`}
                                                configKey="navBorderColor"
                                                globalDefault="#d1d5db"
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ketebalan (px) - {deviceLabel}</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                    value={getConfigString("navBorderWidth", "1")}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        updateChildResponsiveConfig("navBorderWidth", isNaN(val) ? undefined : val);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {child.type === "post_comments" && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Pengaturan Komentar
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const showCommentCount = getConfigForApply("showCommentCount");
                                                const showCommentForm = getConfigForApply("showCommentForm");
                                                const showCommentDate = getConfigForApply("showCommentDate");
                                                const showWebsiteField = getConfigForApply("showWebsiteField");
                                                const allowReplies = getConfigForApply("allowReplies");
                                                const commentSort = getConfigForApply("commentSort");
                                                const initialCommentsLimit = getConfigForApply("initialCommentsLimit");
                                                const loadMoreStep = getConfigForApply("loadMoreStep");
                                                const commentFormTitle = getConfigForApply("commentFormTitle");
                                                const submitButtonText = getConfigForApply("submitButtonText");
                                                const loadMoreButtonText = getConfigForApply("loadMoreButtonText");
                                                const emptyCommentsText = getConfigForApply("emptyCommentsText");
                                                const commentPlaceholder = getConfigForApply("commentPlaceholder");
                                                if (showCommentCount !== undefined) applyToAllDevices("showCommentCount", showCommentCount);
                                                if (showCommentForm !== undefined) applyToAllDevices("showCommentForm", showCommentForm);
                                                if (showCommentDate !== undefined) applyToAllDevices("showCommentDate", showCommentDate);
                                                if (showWebsiteField !== undefined) applyToAllDevices("showWebsiteField", showWebsiteField);
                                                if (allowReplies !== undefined) applyToAllDevices("allowReplies", allowReplies);
                                                if (commentSort !== undefined) applyToAllDevices("commentSort", commentSort);
                                                if (initialCommentsLimit !== undefined) applyToAllDevices("initialCommentsLimit", initialCommentsLimit);
                                                if (loadMoreStep !== undefined) applyToAllDevices("loadMoreStep", loadMoreStep);
                                                if (commentFormTitle !== undefined) applyToAllDevices("commentFormTitle", commentFormTitle);
                                                if (submitButtonText !== undefined) applyToAllDevices("submitButtonText", submitButtonText);
                                                if (loadMoreButtonText !== undefined) applyToAllDevices("loadMoreButtonText", loadMoreButtonText);
                                                if (emptyCommentsText !== undefined) applyToAllDevices("emptyCommentsText", emptyCommentsText);
                                                if (commentPlaceholder !== undefined) applyToAllDevices("commentPlaceholder", commentPlaceholder);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan komentar ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Jumlah Komentar - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showCommentCount", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showCommentCount", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Form Komentar - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showCommentForm", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showCommentForm", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Tanggal Komentar - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showCommentDate", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showCommentDate", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Field Website - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showWebsiteField", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showWebsiteField", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Aktifkan Balas Komentar - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("allowReplies", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("allowReplies", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Urutan Komentar - {deviceLabel}</label>
                                            <select
                                                value={getConfigString("commentSort", "oldest")}
                                                onChange={(e) => updateChildResponsiveConfig("commentSort", e.target.value)}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none h-9 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                            >
                                                <option value="oldest">Terlama ke Terbaru</option>
                                                <option value="latest">Terbaru ke Terlama</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jumlah Awal - {deviceLabel}</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={getConfigString("initialCommentsLimit", "3")}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        updateChildResponsiveConfig("initialCommentsLimit", isNaN(val) ? undefined : val);
                                                    }}
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none h-9 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Step Load More - {deviceLabel}</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={getConfigString("loadMoreStep", "3")}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        updateChildResponsiveConfig("loadMoreStep", isNaN(val) ? undefined : val);
                                                    }}
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none h-9 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Judul Form - {deviceLabel}</label>
                                            <input
                                                type="text"
                                                value={getConfigString("commentFormTitle", "Tinggalkan Komentar")}
                                                onChange={(e) => updateChildResponsiveConfig("commentFormTitle", e.target.value)}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none h-9 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Teks Tombol Submit - {deviceLabel}</label>
                                            <input
                                                type="text"
                                                value={getConfigString("submitButtonText", "Kirim Komentar")}
                                                onChange={(e) => updateChildResponsiveConfig("submitButtonText", e.target.value)}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none h-9 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Teks Tombol Load More - {deviceLabel}</label>
                                            <input
                                                type="text"
                                                value={getConfigString("loadMoreButtonText", "Muat lebih banyak")}
                                                onChange={(e) => updateChildResponsiveConfig("loadMoreButtonText", e.target.value)}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none h-9 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Placeholder Komentar - {deviceLabel}</label>
                                            <textarea
                                                rows={3}
                                                value={getConfigString("commentPlaceholder", "Tulis komentar Anda di sini...")}
                                                onChange={(e) => updateChildResponsiveConfig("commentPlaceholder", e.target.value)}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Pesan Saat Kosong - {deviceLabel}</label>
                                            <textarea
                                                rows={3}
                                                value={getConfigString("emptyCommentsText", "Belum ada komentar. Jadilah yang pertama mengirim komentar.")}
                                                onChange={(e) => updateChildResponsiveConfig("emptyCommentsText", e.target.value)}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Typography Settings (Moved from Content) */}
                            {['post_title', 'post_subtitle', 'post_content', 'post_meta'].includes(child.type) && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-2 mb-4">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Tampilan Tipografi
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button 
                                            onClick={() => {
                                                const color = getConfigForApply("color");
                                                const fontSize = getConfigForApply("fontSize");
                                                const fontWeight = getConfigForApply("fontWeight");
                                                const textAlign = getConfigForApply("textAlign");
                                                const lineHeight = getConfigForApply("lineHeight");
                                                const isItalic = child.type === "post_subtitle" ? getConfigForApply("isItalic") : undefined;
                                                
                                                if (color !== undefined) applyToAllDevices('color', color);
                                                if (fontSize !== undefined) applyToAllDevices('fontSize', fontSize);
                                                if (fontWeight !== undefined) applyToAllDevices('fontWeight', fontWeight);
                                                if (textAlign !== undefined) applyToAllDevices('textAlign', textAlign);
                                                if (lineHeight !== undefined) applyToAllDevices('lineHeight', lineHeight);
                                                if (isItalic !== undefined) applyToAllDevices('isItalic', isItalic);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <ColorPicker 
                                            label={`Warna Teks - ${deviceLabel}`} 
                                            configKey="color" 
                                            globalDefault="#000000" 
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran (px) - {deviceLabel}</label>
                                            <input 
                                                type="number" 
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("fontSize")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    updateChildResponsiveConfig("fontSize", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan - {deviceLabel}</label>
                                            <select 
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("fontWeight", "normal")}
                                                onChange={(e) => updateChildResponsiveConfig("fontWeight", e.target.value)}
                                            >
                                                <option value="100">Thin (100)</option>
                                                <option value="300">Light (300)</option>
                                                <option value="normal">Normal (400)</option>
                                                <option value="500">Medium (500)</option>
                                                <option value="600">Semi Bold (600)</option>
                                                <option value="bold">Bold (700)</option>
                                                <option value="800">Extra Bold (800)</option>
                                                <option value="900">Black (900)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Perataan - {deviceLabel}</label>
                                            <select 
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("textAlign", "left")}
                                                onChange={(e) => updateChildResponsiveConfig("textAlign", e.target.value)}
                                            >
                                                <option value="left">Kiri</option>
                                                <option value="center">Tengah</option>
                                                <option value="right">Kanan</option>
                                                <option value="justify">Justify</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {/* Line Height only for Content & Title */}
                                    {['post_content', 'post_title', 'post_subtitle', 'post_meta'].includes(child.type) && (
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Jarak Baris (Line Height) - {deviceLabel}</label>
                                            <input 
                                                type="number" step="0.1"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("lineHeight")}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    updateChildResponsiveConfig("lineHeight", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    )}

                                    {child.type === "post_subtitle" && (
                                        <div className="mt-2 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
                                            <span className="text-[10px] text-[var(--fg-primary)] font-medium">Teks Miring (Italic) - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("isItalic", false)}
                                                    onChange={(e) => updateChildResponsiveConfig("isItalic", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Post Breadcrumb Config - Visual */}
                            {child.type === "post_breadcrumb" && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Tampilan Breadcrumb
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const showPostTitle = getConfigForApply("showPostTitle");
                                                const showHomeIcon = getConfigForApply("showHomeIcon");
                                                const breadcrumbAlign = getConfigForApply("breadcrumbAlign");
                                                const breadcrumbDesign = getConfigForApply("breadcrumbDesign");
                                                const separatorType = getConfigForApply("separatorType");
                                                const useBox = getConfigForApply("useBox");
                                                const boxColor = getConfigForApply("boxColor");
                                                const boxRadius = getConfigForApply("boxBorderRadius");
                                                if (showPostTitle !== undefined) applyToAllDevices("showPostTitle", showPostTitle);
                                                if (showHomeIcon !== undefined) applyToAllDevices("showHomeIcon", showHomeIcon);
                                                if (breadcrumbAlign !== undefined) applyToAllDevices("breadcrumbAlign", breadcrumbAlign);
                                                if (breadcrumbDesign !== undefined) applyToAllDevices("breadcrumbDesign", breadcrumbDesign);
                                                if (separatorType !== undefined) applyToAllDevices("separatorType", separatorType);
                                                if (useBox !== undefined) applyToAllDevices("useBox", useBox);
                                                if (boxColor !== undefined) applyToAllDevices("boxColor", boxColor);
                                                if (boxRadius !== undefined) applyToAllDevices("boxBorderRadius", boxRadius);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan ini ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Tampilkan Judul Berita - {deviceLabel}</label>
                                        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
                                            <span className="text-xs text-[var(--fg-secondary)]">Judul post di item breadcrumb terakhir</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showPostTitle", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showPostTitle", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Icon Beranda - {deviceLabel}</label>
                                        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
                                            <span className="text-xs text-[var(--fg-secondary)]">Tampilkan icon home di samping teks Beranda</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("showHomeIcon", false)}
                                                    onChange={(e) => updateChildResponsiveConfig("showHomeIcon", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Align Breadcrumb - {deviceLabel}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { key: "left", label: "Kiri" },
                                                { key: "center", label: "Tengah" },
                                                { key: "right", label: "Kanan" }
                                            ].map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => updateChildResponsiveConfig("breadcrumbAlign", item.key)}
                                                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                        getConfigString("breadcrumbAlign", "left") === item.key
                                                            ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                            : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Style Breadcrumb - {deviceLabel}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { key: "minimal", label: "Minimal" },
                                                { key: "pill", label: "Pill" },
                                                { key: "boxed", label: "Boxed" }
                                            ].map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => updateChildResponsiveConfig("breadcrumbDesign", item.key)}
                                                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                        getConfigString("breadcrumbDesign", "minimal") === item.key
                                                            ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                            : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Tipe Pembatas - {deviceLabel}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { key: "slash", label: "Slash" },
                                                { key: "chevron", label: "Chevron" },
                                                { key: "line", label: "Garis Lurus" }
                                            ].map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => updateChildResponsiveConfig("separatorType", item.key)}
                                                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                        getConfigString("separatorType", "slash") === item.key
                                                            ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                            : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Aktifkan Background - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("useBox", false)}
                                                    onChange={(e) => updateChildResponsiveConfig("useBox", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        {getConfigBool("useBox", false) && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <ColorPicker
                                                    label="Warna Background"
                                                    configKey="boxColor"
                                                    globalDefault="#ffffff"
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Border Radius</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                        value={getConfigString("boxBorderRadius", "xl")}
                                                        onChange={(e) => updateChildResponsiveConfig("boxBorderRadius", e.target.value)}
                                                    >
                                                        <option value="none">Kotak (0px)</option>
                                                        <option value="sm">Kecil</option>
                                                        <option value="md">Sedang</option>
                                                        <option value="lg">Besar</option>
                                                        <option value="xl">XL</option>
                                                        <option value="2xl">2XL</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}

                            {child.type === "post_featured_image" && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-2 mb-1">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Tampilan Featured Image
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button 
                                            onClick={() => {
                                                const ratio = getConfigForApply("aspectRatio");
                                                const fit = getConfigForApply("imageFit");
                                                const pos = getConfigForApply("imagePosition");
                                                const radius = getConfigForApply("imageBorderRadius");
                                                const minHeight = getConfigForApply("imageMinHeight");
                                                const showCaption = getConfigForApply("showImageCaption");
                                                if (ratio !== undefined) applyToAllDevices("aspectRatio", ratio);
                                                if (fit !== undefined) applyToAllDevices("imageFit", fit);
                                                if (pos !== undefined) applyToAllDevices("imagePosition", pos);
                                                if (radius !== undefined) applyToAllDevices("imageBorderRadius", radius);
                                                if (minHeight !== undefined) applyToAllDevices("imageMinHeight", minHeight);
                                                if (showCaption !== undefined) applyToAllDevices("showImageCaption", showCaption);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan ini ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Rasio Gambar - {deviceLabel}</label>
                                            <input
                                                type="text"
                                                placeholder="16/9 atau 4:3"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("aspectRatio")}
                                                onChange={(e) => updateChildResponsiveConfig("aspectRatio", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Mode Tampilan - {deviceLabel}</label>
                                            <select
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                value={getConfigString("imageFit", "cover")}
                                                onChange={(e) => updateChildResponsiveConfig("imageFit", e.target.value)}
                                            >
                                                <option value="cover">Cover</option>
                                                <option value="contain">Contain</option>
                                                <option value="fill">Fill</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Posisi Fokus - {deviceLabel}</label>
                                            <select
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                value={getConfigString("imagePosition", "center")}
                                                onChange={(e) => updateChildResponsiveConfig("imagePosition", e.target.value)}
                                            >
                                                <option value="center">Tengah</option>
                                                <option value="top">Atas</option>
                                                <option value="bottom">Bawah</option>
                                                <option value="left">Kiri</option>
                                                <option value="right">Kanan</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius (px) - {deviceLabel}</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("imageBorderRadius")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    updateChildResponsiveConfig("imageBorderRadius", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Min Height (px) - {deviceLabel}</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("imageMinHeight")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    updateChildResponsiveConfig("imageMinHeight", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <div className="w-full flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
                                                <span className="text-[10px] text-[var(--fg-primary)] font-medium">Tampilkan Caption - {deviceLabel}</span>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={getConfigBool("showImageCaption", false)}
                                                        onChange={(e) => updateChildResponsiveConfig("showImageCaption", e.target.checked)}
                                                    />
                                                    <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!shouldRenderContainerAtBottom && renderMainContainerSettings()}

                            {child.type === 'post_tags' && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Tampilan Tag Artikel
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const useBox = getConfigForApply("useBox");
                                                const boxColor = getConfigForApply("boxColor");
                                                const boxRadius = getConfigForApply("boxBorderRadius");
                                                const showTagLabel = getConfigForApply("showTagLabel");
                                                const tagLabelText = getConfigForApply("tagLabelText");
                                                const tagLabelFontSize = getConfigForApply("tagLabelFontSize");
                                                const tagLabelFontWeight = getConfigForApply("tagLabelFontWeight");
                                                const tagLabelColor = getConfigForApply("tagLabelColor");
                                                const tagDesign = getConfigForApply("tagDesign");
                                                const tagFontSize = getConfigForApply("tagFontSize");
                                                const tagBorderRadius = getConfigForApply("tagBorderRadius");
                                                const tagPaddingX = getConfigForApply("tagPaddingX");
                                                const tagPaddingY = getConfigForApply("tagPaddingY");
                                                const tagGapX = getConfigForApply("tagGapX");
                                                const tagGapY = getConfigForApply("tagGapY");
                                                const tagTextColor = getConfigForApply("tagTextColor");
                                                const tagBackgroundColor = getConfigForApply("tagBackgroundColor");
                                                const tagBorderColor = getConfigForApply("tagBorderColor");
                                                const tagHoverBackgroundColor = getConfigForApply("tagHoverBackgroundColor");
                                                const tagHoverTextColor = getConfigForApply("tagHoverTextColor");
                                                const tagHoverBorderColor = getConfigForApply("tagHoverBorderColor");
                                                if (useBox !== undefined) applyToAllDevices("useBox", useBox);
                                                if (boxColor !== undefined) applyToAllDevices("boxColor", boxColor);
                                                if (boxRadius !== undefined) applyToAllDevices("boxBorderRadius", boxRadius);
                                                if (showTagLabel !== undefined) applyToAllDevices("showTagLabel", showTagLabel);
                                                if (tagLabelText !== undefined) applyToAllDevices("tagLabelText", tagLabelText);
                                                if (tagLabelFontSize !== undefined) applyToAllDevices("tagLabelFontSize", tagLabelFontSize);
                                                if (tagLabelFontWeight !== undefined) applyToAllDevices("tagLabelFontWeight", tagLabelFontWeight);
                                                if (tagLabelColor !== undefined) applyToAllDevices("tagLabelColor", tagLabelColor);
                                                if (tagDesign !== undefined) applyToAllDevices("tagDesign", tagDesign);
                                                if (tagFontSize !== undefined) applyToAllDevices("tagFontSize", tagFontSize);
                                                if (tagBorderRadius !== undefined) applyToAllDevices("tagBorderRadius", tagBorderRadius);
                                                if (tagPaddingX !== undefined) applyToAllDevices("tagPaddingX", tagPaddingX);
                                                if (tagPaddingY !== undefined) applyToAllDevices("tagPaddingY", tagPaddingY);
                                                if (tagGapX !== undefined) applyToAllDevices("tagGapX", tagGapX);
                                                if (tagGapY !== undefined) applyToAllDevices("tagGapY", tagGapY);
                                                if (tagTextColor !== undefined) applyToAllDevices("tagTextColor", tagTextColor);
                                                if (tagBackgroundColor !== undefined) applyToAllDevices("tagBackgroundColor", tagBackgroundColor);
                                                if (tagBorderColor !== undefined) applyToAllDevices("tagBorderColor", tagBorderColor);
                                                if (tagHoverBackgroundColor !== undefined) applyToAllDevices("tagHoverBackgroundColor", tagHoverBackgroundColor);
                                                if (tagHoverTextColor !== undefined) applyToAllDevices("tagHoverTextColor", tagHoverTextColor);
                                                if (tagHoverBorderColor !== undefined) applyToAllDevices("tagHoverBorderColor", tagHoverBorderColor);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan ini ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Aktifkan Background - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={getConfigBool("useBox", false)}
                                                    onChange={(e) => updateChildResponsiveConfig("useBox", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        {getConfigBool("useBox", false) && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <ColorPicker
                                                    label="Warna Background"
                                                    configKey="boxColor"
                                                    globalDefault="#ffffff"
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Border Radius</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                        value={getConfigString("boxBorderRadius", "xl")}
                                                        onChange={(e) => updateChildResponsiveConfig("boxBorderRadius", e.target.value)}
                                                    >
                                                        <option value="none">Kotak (0px)</option>
                                                        <option value="sm">Kecil</option>
                                                        <option value="md">Sedang</option>
                                                        <option value="lg">Besar</option>
                                                        <option value="xl">XL</option>
                                                        <option value="2xl">2XL</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
                                        <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Teks Tag Terkait - {deviceLabel}</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={getConfigBool("showTagLabel", true)}
                                                onChange={(e) => updateChildResponsiveConfig("showTagLabel", e.target.checked)}
                                            />
                                            <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                        </label>
                                    </div>

                                    {getConfigBool("showTagLabel", true) && (
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Teks Label - {deviceLabel}</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                    value={getConfigString("tagLabelText", "Tag Terkait :")}
                                                    onChange={(e) => updateChildResponsiveConfig("tagLabelText", e.target.value)}
                                                    placeholder="Tag Terkait :"
                                                />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ukuran (px) - {deviceLabel}</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                        value={getConfigString("tagLabelFontSize", "12")}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value, 10);
                                                            updateChildResponsiveConfig("tagLabelFontSize", isNaN(val) ? undefined : val);
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ketebalan - {deviceLabel}</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2 py-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                        value={getConfigString("tagLabelFontWeight", "600")}
                                                        onChange={(e) => updateChildResponsiveConfig("tagLabelFontWeight", e.target.value)}
                                                    >
                                                        <option value="400">Normal (400)</option>
                                                        <option value="500">Medium (500)</option>
                                                        <option value="600">Semi Bold (600)</option>
                                                        <option value="700">Bold (700)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Warna Teks - {deviceLabel}</label>
                                                    <input
                                                        type="color"
                                                        className="w-full h-8 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1 cursor-pointer"
                                                        value={getConfigString("tagLabelColor", "#374151")}
                                                        onChange={(e) => updateChildResponsiveConfig("tagLabelColor", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Desain Tag - {deviceLabel}</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { key: "cloud", label: "Cloud" },
                                                { key: "soft", label: "Soft" },
                                                { key: "outline", label: "Outline" }
                                            ].map((item) => (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => updateChildResponsiveConfig("tagDesign", item.key)}
                                                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                                                        getConfigString("tagDesign", "cloud") === item.key
                                                            ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                                                            : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                                                    }`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ukuran Teks (px)</label>
                                            <input
                                                type="number"
                                                placeholder="Default (12)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("tagFontSize")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("tagFontSize", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius (px)</label>
                                            <input
                                                type="number"
                                                placeholder="Default (Global)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("tagBorderRadius")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("tagBorderRadius", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Padding X (px)</label>
                                            <input
                                                type="number"
                                                placeholder="Default (12)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("tagPaddingX")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("tagPaddingX", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Padding Y (px)</label>
                                            <input
                                                type="number"
                                                placeholder="Default (4)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("tagPaddingY")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("tagPaddingY", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Gap Horizontal (X)</label>
                                            <input
                                                type="number"
                                                placeholder="Default (8)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("tagGapX")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("tagGapX", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Gap Vertikal (Y)</label>
                                            <input
                                                type="number"
                                                placeholder="Default (8)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("tagGapY")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("tagGapY", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <ColorPicker
                                            label="Warna Teks"
                                            configKey="tagTextColor"
                                            globalDefault="#374151"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Warna Background"
                                            configKey="tagBackgroundColor"
                                            globalDefault="#F3F4F6"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Warna Border"
                                            configKey="tagBorderColor"
                                            globalDefault="#E5E7EB"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Warna Hover (Bg)"
                                            configKey="tagHoverBackgroundColor"
                                            globalDefault={globalSettings?.primaryColor || "#2563EB"}
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Warna Hover (Teks)"
                                            configKey="tagHoverTextColor"
                                            globalDefault="#FFFFFF"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Warna Hover (Border)"
                                            configKey="tagHoverBorderColor"
                                            globalDefault={globalSettings?.primaryColor || "#2563EB"}
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                    </div>
                                </div>
                            )}

                            {child.type === "post_comments" && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Tampilan Komentar
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const commentAuthorColor = getConfigForApply("commentAuthorColor");
                                                const commentMetaColor = getConfigForApply("commentMetaColor");
                                                const commentTextColor = getConfigForApply("commentTextColor");
                                                const commentCardColor = getConfigForApply("commentCardColor");
                                                const commentBorderColor = getConfigForApply("commentBorderColor");
                                                const inputBgColor = getConfigForApply("inputBgColor");
                                                const inputBorderColor = getConfigForApply("inputBorderColor");
                                                const buttonBgColor = getConfigForApply("buttonBgColor");
                                                const buttonTextColor = getConfigForApply("buttonTextColor");
                                                const helperTextColor = getConfigForApply("helperTextColor");
                                                const replyLinkColor = getConfigForApply("replyLinkColor");
                                                if (commentAuthorColor !== undefined) applyToAllDevices("commentAuthorColor", commentAuthorColor);
                                                if (commentMetaColor !== undefined) applyToAllDevices("commentMetaColor", commentMetaColor);
                                                if (commentTextColor !== undefined) applyToAllDevices("commentTextColor", commentTextColor);
                                                if (commentCardColor !== undefined) applyToAllDevices("commentCardColor", commentCardColor);
                                                if (commentBorderColor !== undefined) applyToAllDevices("commentBorderColor", commentBorderColor);
                                                if (inputBgColor !== undefined) applyToAllDevices("inputBgColor", inputBgColor);
                                                if (inputBorderColor !== undefined) applyToAllDevices("inputBorderColor", inputBorderColor);
                                                if (buttonBgColor !== undefined) applyToAllDevices("buttonBgColor", buttonBgColor);
                                                if (buttonTextColor !== undefined) applyToAllDevices("buttonTextColor", buttonTextColor);
                                                if (helperTextColor !== undefined) applyToAllDevices("helperTextColor", helperTextColor);
                                                if (replyLinkColor !== undefined) applyToAllDevices("replyLinkColor", replyLinkColor);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan tampilan komentar ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <ColorPicker
                                            label={`Nama Komentator - ${deviceLabel}`}
                                            configKey="commentAuthorColor"
                                            globalDefault={globalSettings?.headingColor || "#111827"}
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label={`Meta Komentar - ${deviceLabel}`}
                                            configKey="commentMetaColor"
                                            globalDefault={globalSettings?.metaColor || "#6b7280"}
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label={`Isi Komentar - ${deviceLabel}`}
                                            configKey="commentTextColor"
                                            globalDefault={globalSettings?.excerptColor || "#374151"}
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <ColorPicker
                                            label={`Card Komentar - ${deviceLabel}`}
                                            configKey="commentCardColor"
                                            globalDefault="#FFFFFF"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label={`Border Komentar - ${deviceLabel}`}
                                            configKey="commentBorderColor"
                                            globalDefault="#D1D5DB"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label={`Teks Bantu - ${deviceLabel}`}
                                            configKey="helperTextColor"
                                            globalDefault={globalSettings?.metaColor || "#6b7280"}
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <ColorPicker
                                            label={`Input Background - ${deviceLabel}`}
                                            configKey="inputBgColor"
                                            globalDefault="#FFFFFF"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label={`Input Border - ${deviceLabel}`}
                                            configKey="inputBorderColor"
                                            globalDefault="#D1D5DB"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label={`Link Balas - ${deviceLabel}`}
                                            configKey="replyLinkColor"
                                            globalDefault={globalSettings?.primaryColor || "#2563EB"}
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <ColorPicker
                                            label={`Tombol Background - ${deviceLabel}`}
                                            configKey="buttonBgColor"
                                            globalDefault={globalSettings?.primaryColor || "#2563EB"}
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label={`Tombol Teks - ${deviceLabel}`}
                                            configKey="buttonTextColor"
                                            globalDefault="#FFFFFF"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                    </div>
                                </div>
                            )}

                            {child.type === "post_related_posts" && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Tampilan Related Post
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const layout = getConfigForApply("layout");
                                                const relatedDesign = getConfigForApply("relatedDesign");
                                                const relatedColumns = getConfigForApply("relatedColumns");
                                                const titleColor = getConfigForApply("titleColor");
                                                const titleHoverColor = getConfigForApply("titleHoverColor");
                                                const titleFontSize = getConfigForApply("titleFontSize");
                                                const titleLineHeight = getConfigForApply("titleLineHeight");
                                                const titleFontWeight = getConfigForApply("titleFontWeight");
                                                const relatedMetaColor = getConfigForApply("relatedMetaColor");
                                                const relatedExcerptColor = getConfigForApply("relatedExcerptColor");
                                                const relatedCardColor = getConfigForApply("relatedCardColor");
                                                const relatedBorderColor = getConfigForApply("relatedBorderColor");
                                                const showRelatedThumbnail = getConfigForApply("showRelatedThumbnail");
                                                const showRelatedMeta = getConfigForApply("showRelatedMeta");
                                                const showRelatedExcerpt = getConfigForApply("showRelatedExcerpt");
                                                const showRelatedCategory = getConfigForApply("showRelatedCategory");
                                                const showRelatedDate = getConfigForApply("showRelatedDate");
                                                const excerptLength = getConfigForApply("excerptLength");
                                                const thumbnailRatio = getConfigForApply("thumbnailRatio");
                                                if (layout !== undefined) applyToAllDevices("layout", layout);
                                                if (relatedDesign !== undefined) applyToAllDevices("relatedDesign", relatedDesign);
                                                if (relatedColumns !== undefined) applyToAllDevices("relatedColumns", relatedColumns);
                                                if (titleColor !== undefined) applyToAllDevices("titleColor", titleColor);
                                                if (titleHoverColor !== undefined) applyToAllDevices("titleHoverColor", titleHoverColor);
                                                if (titleFontSize !== undefined) applyToAllDevices("titleFontSize", titleFontSize);
                                                if (titleLineHeight !== undefined) applyToAllDevices("titleLineHeight", titleLineHeight);
                                                if (titleFontWeight !== undefined) applyToAllDevices("titleFontWeight", titleFontWeight);
                                                if (relatedMetaColor !== undefined) applyToAllDevices("relatedMetaColor", relatedMetaColor);
                                                if (relatedExcerptColor !== undefined) applyToAllDevices("relatedExcerptColor", relatedExcerptColor);
                                                if (relatedCardColor !== undefined) applyToAllDevices("relatedCardColor", relatedCardColor);
                                                if (relatedBorderColor !== undefined) applyToAllDevices("relatedBorderColor", relatedBorderColor);
                                                if (showRelatedThumbnail !== undefined) applyToAllDevices("showRelatedThumbnail", showRelatedThumbnail);
                                                if (showRelatedMeta !== undefined) applyToAllDevices("showRelatedMeta", showRelatedMeta);
                                                if (showRelatedExcerpt !== undefined) applyToAllDevices("showRelatedExcerpt", showRelatedExcerpt);
                                                if (showRelatedCategory !== undefined) applyToAllDevices("showRelatedCategory", showRelatedCategory);
                                                if (showRelatedDate !== undefined) applyToAllDevices("showRelatedDate", showRelatedDate);
                                                if (excerptLength !== undefined) applyToAllDevices("excerptLength", excerptLength);
                                                if (thumbnailRatio !== undefined) applyToAllDevices("thumbnailRatio", thumbnailRatio);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan tampilan related post ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block">Struktur Layout - {deviceLabel}</label>
                                            <button
                                                onClick={() => {
                                                    const layout = getConfigForApply("layout");
                                                    const relatedDesign = getConfigForApply("relatedDesign");
                                                    const relatedColumns = getConfigForApply("relatedColumns");
                                                    if (layout !== undefined) applyToAllDevices("layout", layout);
                                                    if (relatedDesign !== undefined) applyToAllDevices("relatedDesign", relatedDesign);
                                                    if (relatedColumns !== undefined) applyToAllDevices("relatedColumns", relatedColumns);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan struktur layout ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Layout Utama - {deviceLabel}</label>
                                                <select
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                    value={getConfigString("layout", "grid")}
                                                    onChange={(e) => updateChildResponsiveConfig("layout", e.target.value)}
                                                >
                                                    <option value="grid">Grid</option>
                                                    <option value="list">List</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Gaya Kartu - {deviceLabel}</label>
                                                <select
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                    value={getConfigString("relatedDesign", "card")}
                                                    onChange={(e) => updateChildResponsiveConfig("relatedDesign", e.target.value)}
                                                >
                                                    <option value="card">Card</option>
                                                    <option value="soft">Soft</option>
                                                    <option value="minimal">Minimal</option>
                                                </select>
                                            </div>
                                        </div>

                                        {getConfigString("layout", "grid") === "grid" && (
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Kolom Grid - {deviceLabel}</label>
                                                <select
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                    value={getConfigString("relatedColumns", "3")}
                                                    onChange={(e) => updateChildResponsiveConfig("relatedColumns", parseInt(e.target.value, 10))}
                                                >
                                                    <option value={1}>1 Kolom</option>
                                                    <option value={2}>2 Kolom</option>
                                                    <option value={3}>3 Kolom</option>
                                                    <option value={4}>4 Kolom</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block">Judul Artikel - {deviceLabel}</label>
                                            <button
                                                onClick={() => {
                                                    const titleColor = getConfigForApply("titleColor");
                                                    const titleHoverColor = getConfigForApply("titleHoverColor");
                                                    const titleFontSize = getConfigForApply("titleFontSize");
                                                    const titleLineHeight = getConfigForApply("titleLineHeight");
                                                    const titleFontWeight = getConfigForApply("titleFontWeight");
                                                    if (titleColor !== undefined) applyToAllDevices("titleColor", titleColor);
                                                    if (titleHoverColor !== undefined) applyToAllDevices("titleHoverColor", titleHoverColor);
                                                    if (titleFontSize !== undefined) applyToAllDevices("titleFontSize", titleFontSize);
                                                    if (titleLineHeight !== undefined) applyToAllDevices("titleLineHeight", titleLineHeight);
                                                    if (titleFontWeight !== undefined) applyToAllDevices("titleFontWeight", titleFontWeight);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan pengaturan judul artikel ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <ColorPicker
                                                label={`Warna Judul - ${deviceLabel}`}
                                                configKey="titleColor"
                                                globalDefault={globalSettings?.headingColor || "#111827"}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <ColorPicker
                                                label={`Warna Hover - ${deviceLabel}`}
                                                configKey="titleHoverColor"
                                                globalDefault={globalSettings?.primaryColor || "#2563EB"}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Size (px) - {deviceLabel}</label>
                                                <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("titleFontSize")} onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("titleFontSize", isNaN(val) ? undefined : val);
                                                }} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Line Height - {deviceLabel}</label>
                                                <input type="number" step="0.1" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("titleLineHeight")} onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    updateChildResponsiveConfig("titleLineHeight", isNaN(val) ? undefined : val);
                                                }} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Font Weight - {deviceLabel}</label>
                                                <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("titleFontWeight", "700")} onChange={(e) => updateChildResponsiveConfig("titleFontWeight", e.target.value)}>
                                                    <option value="400">Normal (400)</option>
                                                    <option value="500">Medium (500)</option>
                                                    <option value="600">Semi Bold (600)</option>
                                                    <option value="700">Bold (700)</option>
                                                    <option value="800">Extra Bold (800)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block">Elemen Konten - {deviceLabel}</label>
                                            <button
                                                onClick={() => {
                                                    const showRelatedMeta = getConfigForApply("showRelatedMeta");
                                                    const showRelatedExcerpt = getConfigForApply("showRelatedExcerpt");
                                                    const showRelatedCategory = getConfigForApply("showRelatedCategory");
                                                    const showRelatedDate = getConfigForApply("showRelatedDate");
                                                    const relatedMetaColor = getConfigForApply("relatedMetaColor");
                                                    const relatedExcerptColor = getConfigForApply("relatedExcerptColor");
                                                    const excerptLength = getConfigForApply("excerptLength");
                                                    if (showRelatedMeta !== undefined) applyToAllDevices("showRelatedMeta", showRelatedMeta);
                                                    if (showRelatedExcerpt !== undefined) applyToAllDevices("showRelatedExcerpt", showRelatedExcerpt);
                                                    if (showRelatedCategory !== undefined) applyToAllDevices("showRelatedCategory", showRelatedCategory);
                                                    if (showRelatedDate !== undefined) applyToAllDevices("showRelatedDate", showRelatedDate);
                                                    if (relatedMetaColor !== undefined) applyToAllDevices("relatedMetaColor", relatedMetaColor);
                                                    if (relatedExcerptColor !== undefined) applyToAllDevices("relatedExcerptColor", relatedExcerptColor);
                                                    if (excerptLength !== undefined) applyToAllDevices("excerptLength", excerptLength);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan elemen konten ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <ColorPicker
                                                label={`Warna Meta - ${deviceLabel}`}
                                                configKey="relatedMetaColor"
                                                globalDefault={globalSettings?.metaColor || "#6b7280"}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <ColorPicker
                                                label={`Warna Excerpt - ${deviceLabel}`}
                                                configKey="relatedExcerptColor"
                                                globalDefault={globalSettings?.excerptColor || "#4b5563"}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Panjang Excerpt - {deviceLabel}</label>
                                            <input type="number" min={20} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("excerptLength", "90")} onChange={(e) => {
                                                const val = parseInt(e.target.value, 10);
                                                updateChildResponsiveConfig("excerptLength", isNaN(val) ? undefined : val);
                                            }} />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Meta - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={getConfigBool("showRelatedMeta", true)} onChange={(e) => updateChildResponsiveConfig("showRelatedMeta", e.target.checked)} />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Excerpt - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={getConfigBool("showRelatedExcerpt", true)} onChange={(e) => updateChildResponsiveConfig("showRelatedExcerpt", e.target.checked)} />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Kategori - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={getConfigBool("showRelatedCategory", true)} onChange={(e) => updateChildResponsiveConfig("showRelatedCategory", e.target.checked)} />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Tanggal - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={getConfigBool("showRelatedDate", true)} onChange={(e) => updateChildResponsiveConfig("showRelatedDate", e.target.checked)} />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block">Thumbnail - {deviceLabel}</label>
                                            <button
                                                onClick={() => {
                                                    const showRelatedThumbnail = getConfigForApply("showRelatedThumbnail");
                                                    const thumbnailRatio = getConfigForApply("thumbnailRatio");
                                                    if (showRelatedThumbnail !== undefined) applyToAllDevices("showRelatedThumbnail", showRelatedThumbnail);
                                                    if (thumbnailRatio !== undefined) applyToAllDevices("thumbnailRatio", thumbnailRatio);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan pengaturan thumbnail ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-[var(--fg-primary)]">Tampilkan Thumbnail - {deviceLabel}</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={getConfigBool("showRelatedThumbnail", true)} onChange={(e) => updateChildResponsiveConfig("showRelatedThumbnail", e.target.checked)} />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Rasio Thumbnail - {deviceLabel}</label>
                                            <input type="text" placeholder="16/10 atau 4:3" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("thumbnailRatio", "16/10")} onChange={(e) => updateChildResponsiveConfig("thumbnailRatio", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block">Style Kartu</label>
                                            <button
                                                onClick={() => {
                                                    const relatedCardColor = getConfigForApply("relatedCardColor");
                                                    const relatedBorderColor = getConfigForApply("relatedBorderColor");
                                                    if (relatedCardColor !== undefined) applyToAllDevices("relatedCardColor", relatedCardColor);
                                                    if (relatedBorderColor !== undefined) applyToAllDevices("relatedBorderColor", relatedBorderColor);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan style kartu ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <ColorPicker
                                                label={`Background Card - ${deviceLabel}`}
                                                configKey="relatedCardColor"
                                                globalDefault="#FFFFFF"
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <ColorPicker
                                                label={`Border Card - ${deviceLabel}`}
                                                configKey="relatedBorderColor"
                                                globalDefault="#D1D5DB"
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {child.type === "tag_cloud" && (
                                <>
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                    <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                            <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                            Pengaturan Tag
                                            <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                                {deviceLabel}
                                            </span>
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const tagFontSize = getConfigForApply("tagFontSize");
                                                const tagBorderRadius = getConfigForApply("tagBorderRadius");
                                                const tagGapX = getConfigForApply("tagGapX");
                                                const tagGapY = getConfigForApply("tagGapY");
                                                const tagPaddingX = getConfigForApply("tagPaddingX");
                                                const tagPaddingY = getConfigForApply("tagPaddingY");
                                                const tagTextColor = getConfigForApply("tagTextColor");
                                                const tagBackgroundColor = getConfigForApply("tagBackgroundColor");
                                                const tagBorderColor = getConfigForApply("tagBorderColor");
                                                const tagHoverBackgroundColor = getConfigForApply("tagHoverBackgroundColor");
                                                const tagHoverTextColor = getConfigForApply("tagHoverTextColor");
                                                const tagHoverBorderColor = getConfigForApply("tagHoverBorderColor");
                                                if (tagFontSize !== undefined) applyToAllDevices("tagFontSize", tagFontSize);
                                                if (tagBorderRadius !== undefined) applyToAllDevices("tagBorderRadius", tagBorderRadius);
                                                if (tagGapX !== undefined) applyToAllDevices("tagGapX", tagGapX);
                                                if (tagGapY !== undefined) applyToAllDevices("tagGapY", tagGapY);
                                                if (tagPaddingX !== undefined) applyToAllDevices("tagPaddingX", tagPaddingX);
                                                if (tagPaddingY !== undefined) applyToAllDevices("tagPaddingY", tagPaddingY);
                                                if (tagTextColor !== undefined) applyToAllDevices("tagTextColor", tagTextColor);
                                                if (tagBackgroundColor !== undefined) applyToAllDevices("tagBackgroundColor", tagBackgroundColor);
                                                if (tagBorderColor !== undefined) applyToAllDevices("tagBorderColor", tagBorderColor);
                                                if (tagHoverBackgroundColor !== undefined) applyToAllDevices("tagHoverBackgroundColor", tagHoverBackgroundColor);
                                                if (tagHoverTextColor !== undefined) applyToAllDevices("tagHoverTextColor", tagHoverTextColor);
                                                if (tagHoverBorderColor !== undefined) applyToAllDevices("tagHoverBorderColor", tagHoverBorderColor);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan tampilan tag ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ukuran Teks - {deviceLabel}</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("tagFontSize", "12")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("tagFontSize", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius - {deviceLabel}</label>
                                            <select
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("tagBorderRadius", "md")}
                                                onChange={(e) => updateChildResponsiveConfig("tagBorderRadius", e.target.value)}
                                            >
                                                <option value="none">None</option>
                                                <option value="sm">Small</option>
                                                <option value="md">Medium</option>
                                                <option value="lg">Large</option>
                                                <option value="full">Full</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Gap Horizontal - {deviceLabel}</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("tagGapX", "2")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("tagGapX", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Gap Vertikal - {deviceLabel}</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("tagGapY", "2")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("tagGapY", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Kiri & Kanan - {deviceLabel}</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("tagPaddingX", "12")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("tagPaddingX", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Atas & Bawah - {deviceLabel}</label>
                                            <input
                                                type="number"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("tagPaddingY", "4")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    updateChildResponsiveConfig("tagPaddingY", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                        Warna Tag
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <ColorPicker
                                            label="Teks Normal"
                                            configKey="tagTextColor"
                                            globalDefault="#4b5563"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Teks Hover"
                                            configKey="tagHoverTextColor"
                                            globalDefault="#ffffff"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Background Normal"
                                            configKey="tagBackgroundColor"
                                            globalDefault="#f9fafb"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Background Hover"
                                            configKey="tagHoverBackgroundColor"
                                            globalDefault="#2563eb"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Border Normal"
                                            configKey="tagBorderColor"
                                            globalDefault="#f3f4f6"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <ColorPicker
                                            label="Border Hover"
                                            configKey="tagHoverBorderColor"
                                            globalDefault="#2563eb"
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                    </div>
                                </div>
                                </>
                            )}

                            {child.type === "sidebar_widget" && isSidebarPostListType && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-2 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                                                Sidebar Widget
                                            </h4>
                                            <p className="text-[10px] text-[var(--fg-muted)] -mt-1">Pengaturan thumbnail, nomor ranking, judul, label kategori, dan meta info.</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                [
                                                    "showThumbnail",
                                                    "imageWidth",
                                                    "imageHeight",
                                                    "imageBorderRadius",
                                                    "rankNumberFontSize",
                                                    "rankNumberFontWeight",
                                                    "rankNumberColor",
                                                    "rankNumberBgColor",
                                                    "rankNumberBorderRadius",
                                                    "titleFontSize",
                                                    "titleLineHeight",
                                                    "titleColor",
                                                    "titleHoverColor",
                                                    "showCategory",
                                                    "categoryLabelFontSize",
                                                    "categoryLabelLineHeight",
                                                    "categoryLabelTextColor",
                                                    "categoryLabelBgColor",
                                                    "categoryLabelBorderRadius",
                                                    "categoryLabelMarginBottom",
                                                    "categoryLabelPaddingX",
                                                    "categoryLabelPaddingY",
                                                    "showMetaInfo",
                                                    "showAuthor",
                                                    "showDate",
                                                    "metaFontSize",
                                                    "metaLineHeight",
                                                    "metaColor",
                                                    "metaMarginBottom"
                                                ].forEach((key) => {
                                                    const value = getConfigForApply(key);
                                                    if (value !== undefined) applyToAllDevices(key, value);
                                                });
                                            }}
                                            className="text-[10px] text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)]"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)]">
                                        <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] cursor-pointer col-span-2">
                                            <input type="checkbox" className="rounded text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showThumbnail", true)} onChange={(e) => updateChildResponsiveConfig("showThumbnail", e.target.checked)} /> Tampilkan Thumbnail - {deviceLabel}
                                        </label>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Lebar Thumbnail</label>
                                            <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("imageWidth")} onChange={(e) => { const val = parseInt(e.target.value, 10); updateChildResponsiveConfig("imageWidth", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Tinggi Thumbnail</label>
                                            <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("imageHeight")} onChange={(e) => { const val = parseInt(e.target.value, 10); updateChildResponsiveConfig("imageHeight", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius Thumbnail</label>
                                            <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("imageBorderRadius", "md")} onChange={(e) => updateChildResponsiveConfig("imageBorderRadius", e.target.value)}>
                                                <option value="none">Kotak</option>
                                                <option value="sm">Kecil</option>
                                                <option value="md">Sedang</option>
                                                <option value="lg">Besar</option>
                                                <option value="xl">XL</option>
                                                <option value="full">Full</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ukuran Nomor</label>
                                            <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("rankNumberFontSize")} onChange={(e) => { const val = parseInt(e.target.value, 10); updateChildResponsiveConfig("rankNumberFontSize", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ketebalan Nomor</label>
                                            <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("rankNumberFontWeight", "extrabold")} onChange={(e) => updateChildResponsiveConfig("rankNumberFontWeight", e.target.value)}>
                                                <option value="light">Light</option>
                                                <option value="normal">Normal</option>
                                                <option value="medium">Medium</option>
                                                <option value="semibold">Semibold</option>
                                                <option value="bold">Bold</option>
                                                <option value="extrabold">Extra Bold</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius Nomor (px)</label>
                                            <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("rankNumberBorderRadius")} onChange={(e) => { const val = parseInt(e.target.value, 10); updateChildResponsiveConfig("rankNumberBorderRadius", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <ColorPicker label="Warna Nomor" configKey="rankNumberColor" globalDefault={globalSettings?.metaColor} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                        <ColorPicker label="Background Nomor" configKey="rankNumberBgColor" globalDefault={globalSettings?.primaryColor} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-3 mt-4 border-t border-[var(--border)] bg-[var(--bg-base)] p-3 rounded-lg">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ukuran Judul</label>
                                            <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("titleFontSize")} onChange={(e) => { const val = parseInt(e.target.value, 10); updateChildResponsiveConfig("titleFontSize", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Line Height Judul</label>
                                            <input type="number" step="0.1" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("titleLineHeight")} onChange={(e) => { const val = parseFloat(e.target.value); updateChildResponsiveConfig("titleLineHeight", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <ColorPicker label="Warna Judul" configKey="titleColor" globalDefault={globalSettings?.headingColor} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                        <ColorPicker label="Warna Hover Judul" configKey="titleHoverColor" globalDefault={globalSettings?.primaryColor} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-3 mt-4 border-t border-[var(--border)] bg-[var(--bg-base)] p-3 rounded-lg">
                                        <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] cursor-pointer col-span-2">
                                            <input type="checkbox" className="rounded text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showCategory", true)} onChange={(e) => updateChildResponsiveConfig("showCategory", e.target.checked)} /> Tampilkan Label Kategori - {deviceLabel}
                                        </label>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ukuran Label</label>
                                            <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("categoryLabelFontSize")} onChange={(e) => { const val = parseInt(e.target.value, 10); updateChildResponsiveConfig("categoryLabelFontSize", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Line Height Label</label>
                                            <input type="number" step="0.1" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("categoryLabelLineHeight")} onChange={(e) => { const val = parseFloat(e.target.value); updateChildResponsiveConfig("categoryLabelLineHeight", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Kiri & Kanan</label>
                                            <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("categoryLabelPaddingX")} onChange={(e) => { const val = parseInt(e.target.value, 10); updateChildResponsiveConfig("categoryLabelPaddingX", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Atas & Bawah</label>
                                            <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("categoryLabelPaddingY")} onChange={(e) => { const val = parseInt(e.target.value, 10); updateChildResponsiveConfig("categoryLabelPaddingY", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <ColorPicker label="Warna Teks Label" configKey="categoryLabelTextColor" globalDefault={globalSettings?.metaColor} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                        <ColorPicker label="Background Label" configKey="categoryLabelBgColor" globalDefault={globalSettings?.primaryColor} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-3 mt-4 border-t border-[var(--border)] bg-[var(--bg-base)] p-3 rounded-lg">
                                        <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] cursor-pointer col-span-2">
                                            <input type="checkbox" className="rounded text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showMetaInfo", true)} onChange={(e) => updateChildResponsiveConfig("showMetaInfo", e.target.checked)} /> Tampilkan Meta - {deviceLabel}
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] cursor-pointer">
                                            <input type="checkbox" className="rounded text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showAuthor", true)} onChange={(e) => updateChildResponsiveConfig("showAuthor", e.target.checked)} /> Author
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)] cursor-pointer">
                                            <input type="checkbox" className="rounded text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showDate", true)} onChange={(e) => updateChildResponsiveConfig("showDate", e.target.checked)} /> Tanggal
                                        </label>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ukuran Meta</label>
                                            <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("metaFontSize")} onChange={(e) => { const val = parseInt(e.target.value, 10); updateChildResponsiveConfig("metaFontSize", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Line Height Meta</label>
                                            <input type="number" step="0.1" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("metaLineHeight")} onChange={(e) => { const val = parseFloat(e.target.value); updateChildResponsiveConfig("metaLineHeight", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Margin Bottom Meta</label>
                                            <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" value={getConfigString("metaMarginBottom")} onChange={(e) => { const val = parseInt(e.target.value, 10); updateChildResponsiveConfig("metaMarginBottom", isNaN(val) ? undefined : val); }} />
                                        </div>
                                        <ColorPicker label="Warna Meta" configKey="metaColor" globalDefault={globalSettings?.metaColor} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                    </div>
                                </div>
                            )}

                            {!["post_breadcrumb", "post_title", "post_subtitle", "post_meta", "post_featured_image", "post_share", "post_content", "post_tags", "post_author_box"].includes(child.type) && (
                            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm mb-4">
                                <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                        Style
                                    </div>
                                </h4>
                                
                                {/* 1. Background */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Background</label>
                                        <button 
                                            onClick={() => {
                                                const useBox = getConfigForApply("useBox");
                                                const boxColor = getConfigForApply("boxColor");
                                                const boxRadius = getConfigForApply("boxBorderRadius");
                                                if (useBox !== undefined) applyToAllDevices('useBox', useBox);
                                                if (boxColor !== undefined) applyToAllDevices('boxColor', boxColor);
                                                if (boxRadius !== undefined) applyToAllDevices('boxBorderRadius', boxRadius);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan ini ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] text-[var(--fg-primary)]">Aktifkan Background</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={getConfigBool("useBox")}
                                                onChange={(e) => updateChildResponsiveConfig("useBox", e.target.checked)}
                                            />
                                            <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                        </label>
                                    </div>
                                    {getConfigBool("useBox") && (
                                        <div className="grid grid-cols-2 gap-2 bg-[var(--bg-base)] p-2 rounded-lg border border-[var(--border)]">
                                            <ColorPicker 
                                                label="Warna Background" 
                                                configKey="boxColor" 
                                                globalDefault="#ffffff" 
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Border Radius</label>
                                                <select 
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]" 
                                                    value={getConfigString("boxBorderRadius", "xl")} 
                                                    onChange={(e) => updateChildResponsiveConfig("boxBorderRadius", e.target.value)}
                                                >
                                                    <option value="none">Kotak (0px)</option>
                                                    <option value="sm">Kecil</option>
                                                    <option value="md">Sedang</option>
                                                    <option value="lg">Besar</option>
                                                    <option value="xl">XL</option>
                                                    <option value="2xl">2XL</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 2. Thumbnail */}
                                {child.type !== 'ad_banner' && child.type !== 'tag_cloud' && child.type !== 'sidebar_widget' && !child.type.startsWith('post_') && (
                                <div className="mb-4 border-t border-[var(--border)] pt-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Thumbnail / Gambar</label>
                                        <button 
                                            onClick={() => {
                                                const w = getConfigForApply("imageWidth");
                                                const h = getConfigForApply("imageHeight");
                                                const r = getConfigForApply("imageBorderRadius");
                                                if (w !== undefined) applyToAllDevices('imageWidth', w);
                                                if (h !== undefined) applyToAllDevices('imageHeight', h);
                                                if (r !== undefined) applyToAllDevices('imageBorderRadius', r);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan ini ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Width</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. 100% or 300px"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] focus:border-[var(--accent)] outline-none h-8 text-[var(--fg-primary)]"
                                                value={getConfigString("imageWidth")}
                                                onChange={(e) => updateChildResponsiveConfig('imageWidth', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Height</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. 200px"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] focus:border-[var(--accent)] outline-none h-8 text-[var(--fg-primary)]"
                                                value={getConfigString("imageHeight")}
                                                onChange={(e) => updateChildResponsiveConfig('imageHeight', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius (px)</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] focus:border-[var(--accent)] outline-none h-8 text-[var(--fg-primary)]"
                                            placeholder="Default (Global)"
                                            value={getConfigString("imageBorderRadius")}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                updateChildResponsiveConfig("imageBorderRadius", isNaN(val) ? undefined : val);
                                            }}
                                        />
                                    </div>
                                </div>
                                )}

                                {/* 3. Judul Konten */}
                                {child.type !== 'ad_banner' && child.type !== 'tag_cloud' && child.type !== 'sidebar_widget' && !['post_title', 'post_subtitle', 'post_content', 'post_breadcrumb', 'post_navigation', 'post_comments', 'post_related_posts'].includes(child.type) && (
                                <div className="mb-4 border-t border-[var(--border)] pt-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Judul Konten</label>
                                        <button 
                                            onClick={() => {
                                                const titleColor = getConfigForApply("titleColor");
                                                const titleSize = getConfigForApply("titleFontSize");
                                                const titleLh = getConfigForApply("titleLineHeight");
                                                const titleMb = getConfigForApply("titleMarginBottom");
                                                if (titleColor !== undefined) applyToAllDevices('titleColor', titleColor);
                                                if (titleSize !== undefined) applyToAllDevices('titleFontSize', titleSize);
                                                if (titleLh !== undefined) applyToAllDevices('titleLineHeight', titleLh);
                                                if (titleMb !== undefined) applyToAllDevices('titleMarginBottom', titleMb);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan ini ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <ColorPicker 
                                            label="Warna Judul" 
                                            configKey="titleColor" 
                                            globalDefault="#000000" 
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Size (px)</label>
                                            <input 
                                                type="number" 
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("titleFontSize")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    updateChildResponsiveConfig("titleFontSize", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                            <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Line Height</label>
                                            <input 
                                                type="number" step="0.1"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("titleLineHeight")}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    updateChildResponsiveConfig("titleLineHeight", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                            <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Jarak Vertikal (Y)</label>
                                            <input 
                                                type="number"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("titleMarginBottom")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    updateChildResponsiveConfig("titleMarginBottom", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                )}

                                {/* 4. Meta Konten */}
                                {(child.type.startsWith('news_') || child.type === 'headline_2') && (
                                <div className="mb-4 border-t border-[var(--border)] pt-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Meta Konten</label>
                                        <button 
                                            onClick={() => {
                                                const metaColor = getConfigForApply("metaColor");
                                                const metaSize = getConfigForApply("metaFontSize");
                                                const showAuthor = getConfigForApply("showAuthor");
                                                const showDate = getConfigForApply("showDate");
                                                if (metaColor !== undefined) applyToAllDevices('metaColor', metaColor);
                                                if (metaSize !== undefined) applyToAllDevices('metaFontSize', metaSize);
                                                if (showAuthor !== undefined) applyToAllDevices('showAuthor', showAuthor);
                                                if (showDate !== undefined) applyToAllDevices('showDate', showDate);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan ini ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>
                                    <div className="flex gap-4 mb-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                checked={getConfigBool("showAuthor", true)} 
                                                onChange={(e) => updateChildResponsiveConfig("showAuthor", e.target.checked)}
                                            />
                                            <span className="text-[10px] text-[var(--fg-secondary)]">Author</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                checked={getConfigBool("showDate", true)} 
                                                onChange={(e) => updateChildResponsiveConfig("showDate", e.target.checked)}
                                            />
                                            <span className="text-[10px] text-[var(--fg-secondary)]">Tanggal</span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <ColorPicker 
                                            label="Warna Meta" 
                                            configKey="metaColor" 
                                            globalDefault={globalSettings?.metaColor} 
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Size (px)</label>
                                            <input 
                                                type="number" 
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("metaFontSize")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    updateChildResponsiveConfig("metaFontSize", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                )}

                                {/* Excerpt Visual Settings */}
                                {(child.type.startsWith('news_') || child.type === 'headline_2') && (
                                <div className="mb-4 border-t border-[var(--border)] pt-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Kutipan (Excerpt)</label>
                                        <button 
                                            onClick={() => {
                                                const excerptColor = getConfigForApply("excerptColor");
                                                const excerptSize = getConfigForApply("excerptFontSize");
                                                const excerptLh = getConfigForApply("excerptLineHeight");
                                                const showExcerpt = getConfigForApply("showExcerpt");
                                                if (excerptColor !== undefined) applyToAllDevices('excerptColor', excerptColor);
                                                if (excerptSize !== undefined) applyToAllDevices('excerptFontSize', excerptSize);
                                                if (excerptLh !== undefined) applyToAllDevices('excerptLineHeight', excerptLh);
                                                if (showExcerpt !== undefined) applyToAllDevices('showExcerpt', showExcerpt);
                                            }}
                                            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            title="Terapkan pengaturan ini ke semua device"
                                        >
                                            <Copy size={10} /> Semua
                                        </button>
                                    </div>
                                    <div className="flex gap-4 mb-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                checked={getConfigBool("showExcerpt", true)} 
                                                onChange={(e) => updateChildResponsiveConfig("showExcerpt", e.target.checked)}
                                            />
                                            <span className="text-[10px] text-[var(--fg-secondary)]">Tampilkan Kutipan</span>
                                        </label>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Panjang Karakter</label>
                                        <input 
                                            type="number" 
                                            placeholder="Default: 200"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                            value={getConfigString("excerptLength")}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                updateChildConfig("excerptLength", isNaN(val) ? undefined : val);
                                            }}
                                        />
                                        <p className="text-[9px] text-[var(--fg-muted)] mt-1">Berlaku untuk semua ukuran layar.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <ColorPicker 
                                            label="Warna Kutipan" 
                                            configKey="excerptColor" 
                                            globalDefault={globalSettings?.excerptColor} 
                                            child={child}
                                            getConfigValue={getConfigValue}
                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                            updateChildConfig={updateChildConfig}
                                        />
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Size (px)</label>
                                            <input 
                                                type="number" 
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                                value={getConfigString("excerptFontSize")}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    updateChildResponsiveConfig("excerptFontSize", isNaN(val) ? undefined : val);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Line Height</label>
                                        <input 
                                            type="number" step="0.1"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                                            value={getConfigString("excerptLineHeight")}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                updateChildResponsiveConfig("excerptLineHeight", isNaN(val) ? undefined : val);
                                            }}
                                        />
                                    </div>
                                </div>
                                )}

                            {shouldRenderContainerAtBottom && renderMainContainerSettings()}

                            {/* Post Share Config - Moved to Visual */}
                            {child.type === 'post_share' && null}

                            {/* 6. Typography Settings (New for Post Elements) - Moved to Visual */}
                            {['post_title', 'post_subtitle', 'post_content'].includes(child.type) && null}
                            </div>
                            )}

                            <div className="pt-4 border-t border-[var(--border)]">
                                <h4 className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider mb-4">Tampilan Lanjutan</h4>

                                {(() => {
                                    const type = String(child.type || "");
                                    if (type === "" || type === "section") return false;
                                    if (type.startsWith("post_")) {
                                        return ["post_related_posts", "post_comments"].includes(type);
                                    }
                                    if (type.startsWith("archive_")) return false;
                                    if (type.startsWith("header_")) return false;
                                    if (type.startsWith("footer_")) return false;

                                    const noTitleTypes = new Set([
                                        "classic_hero",
                                        "news_hero_slider",
                                        "news_hero_split_4",
                                        "news_headline_big",
                                        "news_bullet_list",
                                        "ad_banner"
                                    ]);
                                    if (noTitleTypes.has(type)) return false;

                                    return ["news_list", "news_grid", "news_grid_slider", "sidebar_widget", "tag_cloud"].includes(type);
                                })() && (
                                    <div className="mb-5 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block">Tampilkan Judul Widget</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={getConfigBool("showTitle", true)}
                                                onChange={(e) => updateChildConfig("showTitle", e.target.checked)}
                                            />
                                            <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                        </label>
                                    </div>
                                )}

                                <div className="mb-5">
                                    <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Responsivitas (Sembunyikan di:)</label>
                                    <div className="flex flex-col gap-2">
                                        {["Desktop", "Tablet", "Mobile"].map((device) => (
                                            <label key={device} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                    checked={getConfigBool(`hideOn${device}`, false)}
                                                    onChange={(e) => updateChildConfig(`hideOn${device}`, e.target.checked)}
                                                />
                                                <span className="text-sm text-[var(--fg-primary)]">{device}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
            </div>
            <style jsx>{`
                .page-builder-config-theme :global(input[type="text"]),
                .page-builder-config-theme :global(input[type="number"]),
                .page-builder-config-theme :global(select),
                .page-builder-config-theme :global(textarea) {
                    background-color: var(--bg-elevated) !important;
                    border-color: var(--border) !important;
                    color: var(--fg-primary) !important;
                }
                .page-builder-config-theme :global(input[type="text"]::placeholder),
                .page-builder-config-theme :global(input[type="number"]::placeholder),
                .page-builder-config-theme :global(textarea::placeholder) {
                    color: var(--fg-muted) !important;
                }
                .page-builder-config-theme :global(.shadow-sm) {
                    box-shadow: var(--shadow-sm) !important;
                }
            `}</style>
        </div>
        </ActiveDeviceTabContext.Provider>
    );
}
