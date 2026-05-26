import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { FileText, Palette, Monitor, Tablet, Smartphone, Upload, X, Copy, Image as ImageIcon } from "lucide-react";
import { Block, Category, Tag } from "../types";
import CustomColorPicker from "./ColorPicker";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { ConfigValue, createConfigReaders } from "@/lib/page-builder-config";
import MediaLibraryModal from "@/app/admin/components/MediaLibraryModal";

interface BlockConfigPanelProps {
    builderLocation?: "home" | "archive" | "header" | "footer";
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
    
    // Global Settings for Defaults
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
    containerClassName,
    labelClassName,
    triggerClassName,
    swatchClassName,
    inputClassName,
    child,
    getConfigValue,
    updateChildResponsiveConfig,
    updateChildConfig
}: { 
    label: string, 
    configKey: string, 
    globalDefault?: string, 
    isResponsive?: boolean,
    containerClassName?: string,
    labelClassName?: string,
    triggerClassName?: string,
    swatchClassName?: string,
    inputClassName?: string,
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
            containerClassName={containerClassName}
            labelClassName={labelClassName}
            triggerClassName={triggerClassName}
            swatchClassName={swatchClassName}
            inputClassName={inputClassName}
        />
    );
};

const ColorPicker = ({
    label,
    configKey,
    globalDefault,
    isResponsive = true,
    activeDeviceTab,
    containerClassName,
    labelClassName,
    triggerClassName,
    swatchClassName,
    inputClassName,
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
    containerClassName?: string,
    labelClassName?: string,
    triggerClassName?: string,
    swatchClassName?: string,
    inputClassName?: string,
    child: Block,
    getConfigValue: (child: Block, key: string) => unknown,
    updateChildResponsiveConfig: (key: string, value: ConfigValue) => void,
    updateChildConfig: (key: string, value: ConfigValue) => void
}) => {
    const suffix = isResponsive && activeDeviceTab ? ` (${activeDeviceTab.toUpperCase()})` : '';
    return (
        <BaseColorPicker
            label={`${label}${suffix}`}
            configKey={configKey}
            globalDefault={globalDefault}
            isResponsive={isResponsive}
            containerClassName={containerClassName}
            labelClassName={labelClassName}
            triggerClassName={triggerClassName}
            swatchClassName={swatchClassName}
            inputClassName={inputClassName}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
        />
    );
};

type FontFamilyOption = {
    label: string;
    value: string;
    previewFamily?: string;
};

const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
    { label: "Default", value: "" },
    { label: "Body (Theme)", value: "var(--font-body)", previewFamily: "var(--font-body)" },
    { label: "Display (Theme)", value: "var(--font-display)", previewFamily: "var(--font-display)" },
    { label: "Inter", value: "Inter, system-ui, sans-serif", previewFamily: "Inter, system-ui, sans-serif" },
    { label: "Sora", value: "Sora, system-ui, sans-serif", previewFamily: "Sora, system-ui, sans-serif" },
    { label: "System Sans", value: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" },
    { label: "System Serif", value: "ui-serif, Georgia, Cambria, Times New Roman, Times, serif" },
    { label: "System Mono", value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace" },
    { label: "Arial", value: "Arial, Helvetica, sans-serif", previewFamily: "Arial, Helvetica, sans-serif" },
    { label: "Helvetica", value: "Helvetica, Arial, sans-serif", previewFamily: "Helvetica, Arial, sans-serif" },
    { label: "Georgia", value: "Georgia, serif", previewFamily: "Georgia, serif" },
    { label: "Times New Roman", value: "Times New Roman, Times, serif", previewFamily: "Times New Roman, Times, serif" },
    { label: "Courier New", value: "Courier New, Courier, monospace", previewFamily: "Courier New, Courier, monospace" },
    { label: "Verdana", value: "Verdana, Geneva, sans-serif", previewFamily: "Verdana, Geneva, sans-serif" },
    { label: "Trebuchet MS", value: "Trebuchet MS, Helvetica, Arial, sans-serif", previewFamily: "Trebuchet MS, Helvetica, Arial, sans-serif" },
    { label: "Tahoma", value: "Tahoma, Verdana, sans-serif", previewFamily: "Tahoma, Verdana, sans-serif" },
    { label: "Roboto*", value: "Roboto, system-ui, sans-serif", previewFamily: "Roboto, system-ui, sans-serif" },
    { label: "Poppins*", value: "Poppins, system-ui, sans-serif", previewFamily: "Poppins, system-ui, sans-serif" },
    { label: "Montserrat*", value: "Montserrat, system-ui, sans-serif", previewFamily: "Montserrat, system-ui, sans-serif" },
    { label: "Lato*", value: "Lato, system-ui, sans-serif", previewFamily: "Lato, system-ui, sans-serif" },
    { label: "Open Sans*", value: "Open Sans, system-ui, sans-serif", previewFamily: "Open Sans, system-ui, sans-serif" },
    { label: "Nunito*", value: "Nunito, system-ui, sans-serif", previewFamily: "Nunito, system-ui, sans-serif" },
    { label: "Merriweather*", value: "Merriweather, ui-serif, Georgia, serif", previewFamily: "Merriweather, ui-serif, Georgia, serif" },
    { label: "Playfair Display*", value: "Playfair Display, ui-serif, Georgia, serif", previewFamily: "Playfair Display, ui-serif, Georgia, serif" },
];

function FontFamilyPicker({
    value,
    onChange,
    options = FONT_FAMILY_OPTIONS,
}: {
    value: string;
    onChange: (value: string) => void;
    options?: FontFamilyOption[];
}) {
    const [open, setOpen] = useState(false);
    const [customValue, setCustomValue] = useState("");
    const containerRef = useRef<HTMLDivElement | null>(null);
    const popoverRef = useRef<HTMLDivElement | null>(null);

    const normalizedValue = typeof value === "string" ? value : "";
    const selected = useMemo(() => options.find((o) => o.value === normalizedValue) || null, [options, normalizedValue]);
    const displayLabel = selected?.label || (normalizedValue ? "Custom" : "Default");

    useEffect(() => {
        setCustomValue(selected ? "" : normalizedValue);
    }, [normalizedValue, selected]);

    useEffect(() => {
        const handler = (event: PointerEvent) => {
            const c = containerRef.current;
            const p = popoverRef.current;
            if (!c) return;
            const path = typeof event.composedPath === "function" ? event.composedPath() : undefined;
            const insideContainer = path ? path.includes(c) : c.contains(event.target as Node);
            const insidePopover = p ? (path ? path.includes(p) : p.contains(event.target as Node)) : false;
            if (!insideContainer && !insidePopover) setOpen(false);
        };
        if (open) document.addEventListener("pointerdown", handler, true);
        return () => document.removeEventListener("pointerdown", handler, true);
    }, [open]);

    const previewFamily = selected?.previewFamily || selected?.value || normalizedValue || undefined;

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)] flex items-center justify-between gap-3"
                style={{ fontFamily: previewFamily }}
            >
                <span className="truncate">{displayLabel}</span>
                <span className="text-[10px] text-[var(--fg-muted)]">▼</span>
            </button>

            {open && (
                <div ref={popoverRef} className="absolute z-50 mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-lg overflow-hidden">
                    <div className="max-h-64 overflow-auto">
                        {options.map((opt) => {
                            const isActive = opt.value === normalizedValue;
                            const optFamily = opt.previewFamily || opt.value || undefined;
                            return (
                                <button
                                    key={`${opt.label}_${opt.value}`}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--bg-elevated)] ${
                                        isActive ? "bg-[var(--accent-subtle)] text-[var(--accent)]" : "text-[var(--fg-primary)]"
                                    }`}
                                    style={{ fontFamily: optFamily }}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="p-3 border-t border-[var(--border)] bg-[var(--bg-base)]">
                        <div className="text-[10px] font-medium text-[var(--fg-muted)] mb-1">Custom font-family</div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                                className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2.5 py-2 text-xs outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                placeholder="Contoh: Poppins, sans-serif"
                                style={{ fontFamily: customValue || undefined }}
                            />
                            <button
                                type="button"
                                className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-xs text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
                                onClick={() => {
                                    onChange(customValue.trim());
                                    setOpen(false);
                                }}
                                disabled={customValue.trim() === ""}
                            >
                                Pakai
                            </button>
                        </div>
                        <div className="text-[10px] text-[var(--fg-muted)] mt-2">* Font bertanda * akan tampil jika font tersedia / ter-load di website.</div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BlockConfigPanel({
    builderLocation = "home",
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
    const [uploading, setUploading] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaTargetKey, setMediaTargetKey] = useState<string | null>(null);
    const [availableAds, setAvailableAds] = useState<AdOption[]>([]);
    const [loadingAds, setLoadingAds] = useState(false);
    const [responsiveNumberDrafts, setResponsiveNumberDrafts] = useState<Record<string, string>>({});
    const [footerCustomLinkLabel, setFooterCustomLinkLabel] = useState("");
    const [footerCustomLinkUrl, setFooterCustomLinkUrl] = useState("");
    const [footerCustomLinkNewTab, setFooterCustomLinkNewTab] = useState(false);
    const getSideLabel = (side: string) => {
        if (side === "Top") return "Atas";
        if (side === "Right") return "Kanan";
        if (side === "Bottom") return "Bawah";
        if (side === "Left") return "Kiri";
        return side;
    };
    const DeviceIcon = ({ size = 12 }: { size?: number }) => {
        if (activeDeviceTab === "desktop") return <Monitor size={size} />;
        if (activeDeviceTab === "tablet") return <Tablet size={size} />;
        return <Smartphone size={size} />;
    };
    const classicHeroCardClass = "bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6";
    const classicHeroAccentBarClass = "w-1 h-4 bg-[var(--accent)] rounded-full";
    const classicHeroFieldLabelClass = "text-[11px] font-medium text-[var(--fg-primary)] block mb-1.5 leading-4";
    const classicHeroInputClass = "w-full h-11 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg px-3 text-sm focus:border-[var(--accent)] outline-none";
    const classicHeroCompactInputClass = "w-full h-9 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg px-3 text-xs focus:border-[var(--accent)] outline-none text-center";
    const classicHeroTwoColGridClass = "grid grid-cols-2 gap-4";
    const classicHeroToggleTextClass = "text-[12px] text-[var(--fg-primary)]";
    const classicHeroColorLabelClass = "text-[11px] font-semibold text-[var(--fg-primary)] block mb-1.5 leading-4 tracking-wide uppercase";
    const classicHeroColorTriggerClass = "items-center";
    const classicHeroColorSwatchClass = "w-9 h-9 rounded-lg";
    const classicHeroColorInputClass = "h-11 px-3 text-sm rounded-lg";

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
    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.[0]) return;
        setUploading(true);
        
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        
        try {
            const res = await fetch("/api/media/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            
            if (res.ok) {
                updateChildResponsiveConfig("backgroundImage", data.fileUrl);
            } else {
                alert("Gagal upload: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Error saat upload");
        } finally {
            setUploading(false);
        }
    }

    const applyToAllDevices = (key: string, value: ConfigValue) => {
        updateChildConfig(key, value);
        updateChildConfig(`tablet${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
        updateChildConfig(`mobile${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
    };
    const { getConfigString, getConfigBool, getConfigForApply } = createConfigReaders(child, getConfigValue);
    const openMediaLibraryForKey = (key: string) => {
        setMediaTargetKey(key);
        setShowMediaModal(true);
    };
    const currentSidebarWidgetType = child.type === "sidebar_widget" ? getConfigString("widgetType", "popular_posts") : "";
    const isSidebarPostListType = currentSidebarWidgetType === "popular_posts" || currentSidebarWidgetType === "recent_posts";
    const isSidebarAdSlotType = currentSidebarWidgetType === "ad_slot";
    useEffect(() => {
        if (child.type !== "news_list" && child.type !== "archive_post_list") return;
        const categoryKeyMappings = [
            ["categoryTextColor", "categoryLabelColor"],
            ["categoryBgColor", "categoryLabelBgColor"],
            ["categoryFontSize", "categoryLabelFontSize"],
            ["categoryBorderRadius", "categoryLabelBorderRadius"],
        ] as const;

        const prefixes = ["", "tablet", "mobile"] as const;
        for (const [legacyKey, normalizedKey] of categoryKeyMappings) {
            for (const prefix of prefixes) {
                const sourceKey = prefix
                    ? `${prefix}${legacyKey.charAt(0).toUpperCase()}${legacyKey.slice(1)}`
                    : legacyKey;
                const targetKey = prefix
                    ? `${prefix}${normalizedKey.charAt(0).toUpperCase()}${normalizedKey.slice(1)}`
                    : normalizedKey;
                const targetValue = getConfigValue(child, targetKey);
                if (targetValue !== undefined && targetValue !== null && targetValue !== "") continue;
                const sourceValue = getConfigValue(child, sourceKey);
                if (sourceValue === undefined || sourceValue === null || sourceValue === "") continue;
                updateChildConfig(targetKey, sourceValue as ConfigValue);
            }
        }
    }, [child, getConfigValue, updateChildConfig]);
    const getNumberDraftKey = (key: string, scope: "responsive" | "global" = "responsive") => `${child.id}:${scope}:${activeDeviceTab}:${key}`;
    const getDraftedNumberInputValue = (key: string, fallback = "", scope: "responsive" | "global" = "responsive") => {
        const draftKey = getNumberDraftKey(key, scope);
        return Object.prototype.hasOwnProperty.call(responsiveNumberDrafts, draftKey)
            ? responsiveNumberDrafts[draftKey]
            : getConfigString(key, fallback);
    };
    const commitDraftedNumberInput = (
        key: string,
        {
            scope = "responsive",
            parser = "int",
            min,
            max,
        }: {
            scope?: "responsive" | "global";
            parser?: "int" | "float";
            min?: number;
            max?: number;
        } = {}
    ) => {
        const draftKey = getNumberDraftKey(key, scope);
        const draftValue = responsiveNumberDrafts[draftKey];
        if (draftValue === "") {
            if (scope === "responsive") {
                updateChildResponsiveConfig(key, undefined);
            } else {
                updateChildConfig(key, undefined);
            }
        } else if (draftValue !== undefined) {
            const parsed = parser === "float" ? parseFloat(draftValue) : parseInt(draftValue, 10);
            if (!Number.isNaN(parsed)) {
                let nextValue = parsed;
                if (min !== undefined) nextValue = Math.max(min, nextValue);
                if (max !== undefined) nextValue = Math.min(max, nextValue);
                if (scope === "responsive") {
                    updateChildResponsiveConfig(key, nextValue);
                } else {
                    updateChildConfig(key, nextValue);
                }
            }
        }
        setResponsiveNumberDrafts((prev) => {
            if (!Object.prototype.hasOwnProperty.call(prev, draftKey)) return prev;
            const next = { ...prev };
            delete next[draftKey];
            return next;
        });
    };
    const handleResponsiveIntegerInputChange = (key: string, rawValue: string, _min?: number) => {
        const draftKey = getNumberDraftKey(key, "responsive");
        setResponsiveNumberDrafts((prev) => ({ ...prev, [draftKey]: rawValue }));
    };
    const clearResponsiveIntegerDraft = (key: string, min?: number) => {
        commitDraftedNumberInput(key, { scope: "responsive", parser: "int", min });
    };
    const handleResponsiveFloatInputChange = (key: string, rawValue: string) => {
        const draftKey = getNumberDraftKey(key, "responsive");
        setResponsiveNumberDrafts((prev) => ({ ...prev, [draftKey]: rawValue }));
    };
    const clearResponsiveFloatDraft = (key: string, min?: number, max?: number) => {
        commitDraftedNumberInput(key, { scope: "responsive", parser: "float", min, max });
    };
    const getResponsiveNumberInputValue = (key: string, fallback = "") => getDraftedNumberInputValue(key, fallback, "responsive");
    const getGlobalNumberInputValue = (key: string, fallback = "") => getDraftedNumberInputValue(key, fallback, "global");
    const handleGlobalIntegerInputChange = (key: string, rawValue: string) => {
        const draftKey = getNumberDraftKey(key, "global");
        setResponsiveNumberDrafts((prev) => ({ ...prev, [draftKey]: rawValue }));
    };
    const clearGlobalIntegerDraft = (key: string, min?: number, max?: number) => {
        commitDraftedNumberInput(key, { scope: "global", parser: "int", min, max });
    };
    const isArchiveHeroSlider = builderLocation === "archive" && child.type === "news_hero_slider";
    const isArchiveNewsGrid = builderLocation === "archive" && child.type === "news_grid";
    const isArchiveWidget =
        child.type === "archive_header" ||
        child.type === "archive_post_grid" ||
        child.type === "archive_post_list" ||
        child.type === "archive_pagination" ||
        child.type === "archive_empty_state";

    if (isArchiveWidget && !(child.type === "archive_post_list" && activeEditTab === "visual")) {
        return (
            <>
                <div className="flex border-b border-[var(--border)]">
                    <button
                        onClick={() => setActiveEditTab("content")}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeEditTab === "content" ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]" : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                    >
                        <FileText size={16} className="inline mr-2" />
                        Konten
                    </button>
                    <button
                        onClick={() => setActiveEditTab("visual")}
                        className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeEditTab === "visual" ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]" : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                    >
                        <Palette size={16} className="inline mr-2" />
                        Visual
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {activeEditTab === "content" ? (
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-1.5">Judul Widget</label>
                                <input
                                    type="text"
                                    value={child.title}
                                    onChange={(e) => onUpdateTitle(e.target.value)}
                                    className="w-full font-bold bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 focus:border-[var(--accent)] text-[var(--fg-primary)] outline-none transition-all text-sm"
                                />
                            </div>

                            {child.type === "archive_header" && (
                                <>
                                    <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)]">Konten Header Arsip</h4>
                                        {getConfigString("headerStyle", "minimal") !== "minimal" && (
                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Label Kecil</label>
                                                <input
                                                    type="text"
                                                    value={getConfigString("eyebrowText", "Arsip")}
                                                    onChange={(e) => updateChildConfig("eyebrowText", e.target.value)}
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {(child.type === "archive_post_grid" || child.type === "archive_post_list") && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)]">Konten Loop Arsip</h4>
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jumlah Artikel</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={30}
                                            value={getGlobalNumberInputValue("limit", child.type === "archive_post_grid" ? "12" : "10")}
                                            onChange={(e) => handleGlobalIntegerInputChange("limit", e.target.value)}
                                            onBlur={() => clearGlobalIntegerDraft("limit", 1, 30)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                        />
                                    </div>
                                    {child.type === "archive_post_list" && (
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Offset Arsip</label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={getGlobalNumberInputValue("offset", "0")}
                                                onChange={(e) => handleGlobalIntegerInputChange("offset", e.target.value)}
                                                onBlur={() => clearGlobalIntegerDraft("offset", 0)}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                            />
                                            <p className="text-[10px] text-[var(--fg-muted)] mt-1">Lewati beberapa artikel teratas sebelum daftar ditampilkan.</p>
                                        </div>
                                    )}
                                    {child.type === "archive_post_grid" && (
                                        <div />
                                    )}
                                    
                                </div>
                            )}

                            {child.type === "archive_pagination" && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)]">Konten Pagination</h4>
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Label Tombol Sebelumnya</label>
                                        <input
                                            type="text"
                                            value={getConfigString("prevLabel", "Sebelumnya")}
                                            onChange={(e) => updateChildConfig("prevLabel", e.target.value)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Label Tombol Berikutnya</label>
                                        <input
                                            type="text"
                                            value={getConfigString("nextLabel", "Berikutnya")}
                                            onChange={(e) => updateChildConfig("nextLabel", e.target.value)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jumlah Nomor Halaman Terlihat</label>
                                        <input
                                            type="number"
                                            min={3}
                                            max={9}
                                            value={getGlobalNumberInputValue("maxVisiblePages", "5")}
                                            onChange={(e) => handleGlobalIntegerInputChange("maxVisiblePages", e.target.value)}
                                            onBlur={() => clearGlobalIntegerDraft("maxVisiblePages", 3, 9)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                        />
                                    </div>
                                </div>
                            )}

                            {child.type === "archive_empty_state" && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)]">Konten Empty State</h4>
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Judul Empty State</label>
                                        <input
                                            type="text"
                                            value={getConfigString("emptyTitle", "Belum ada artikel")}
                                            onChange={(e) => updateChildConfig("emptyTitle", e.target.value)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Deskripsi</label>
                                        <textarea
                                            value={getConfigString("emptyDescription", "Belum ada artikel yang cocok untuk arsip ini saat ini.")}
                                            onChange={(e) => updateChildConfig("emptyDescription", e.target.value)}
                                            rows={4}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Teks Tombol</label>
                                        <input
                                            type="text"
                                            value={getConfigString("emptyButtonText", "")}
                                            onChange={(e) => updateChildConfig("emptyButtonText", e.target.value)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Link Tombol</label>
                                        <input
                                            type="text"
                                            value={getConfigString("emptyButtonHref", "/")}
                                            onChange={(e) => updateChildConfig("emptyButtonHref", e.target.value)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                                <h4 className="text-sm font-bold text-[var(--fg-primary)]">Visual Widget Arsip</h4>
                                {child.type === "archive_header" && (
                                    <>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Style Header</label>
                                            <select
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                                value={getConfigString("headerStyle", "minimal")}
                                                onChange={(e) => updateChildConfig("headerStyle", e.target.value)}
                                            >
                                                <option value="minimal">Heading Standar</option>
                                                <option value="card">Heading 2</option>
                                                <option value="spotlight">Heading 3</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Perataan Teks</label>
                                            <select
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                                value={getConfigString("textAlign", "left")}
                                                onChange={(e) => updateChildConfig("textAlign", e.target.value)}
                                            >
                                                <option value="left">Kiri</option>
                                                <option value="center">Tengah</option>
                                                <option value="right">Kanan</option>
                                            </select>
                                        </div>
                                        <label className="flex items-center justify-between text-sm text-[var(--fg-primary)]">
                                            <span>Tampilkan Deskripsi</span>
                                            <input
                                                type="checkbox"
                                                checked={getConfigBool("showDescription", true)}
                                                onChange={(e) => updateChildConfig("showDescription", e.target.checked)}
                                            />
                                        </label>
                                        <label className="flex items-center justify-between text-sm text-[var(--fg-primary)]">
                                            <span>Tampilkan Jumlah Artikel</span>
                                            <input
                                                type="checkbox"
                                                checked={getConfigBool("showPostCount", true)}
                                                onChange={(e) => updateChildConfig("showPostCount", e.target.checked)}
                                            />
                                        </label>
                                        <ColorPicker label="Warna Aksen" configKey="accentColor" globalDefault={globalSettings?.primaryColor} activeDeviceTab={activeDeviceTab} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                        {getConfigString("headerStyle", "minimal") !== "minimal" && (
                                            <>
                                                <ColorPicker label="Warna Panel" configKey="panelBgColor" activeDeviceTab={activeDeviceTab} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                                <ColorPicker label="Warna Border Panel" configKey="panelBorderColor" activeDeviceTab={activeDeviceTab} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                            </>
                                        )}
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Ukuran Judul ({activeDeviceTab})</label>
                                            <input
                                                type="number"
                                                min={16}
                                                max={80}
                                                value={getResponsiveNumberInputValue("titleFontSize", "36")}
                                                onChange={(e) => handleResponsiveIntegerInputChange("titleFontSize", e.target.value, 16)}
                                                onBlur={() => clearResponsiveIntegerDraft("titleFontSize", 16)}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Ukuran Deskripsi ({activeDeviceTab})</label>
                                            <input
                                                type="number"
                                                min={12}
                                                max={32}
                                                value={getResponsiveNumberInputValue("descriptionFontSize", "16")}
                                                onChange={(e) => handleResponsiveIntegerInputChange("descriptionFontSize", e.target.value, 12)}
                                                onBlur={() => clearResponsiveIntegerDraft("descriptionFontSize", 12)}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Ukuran Meta ({activeDeviceTab})</label>
                                            <input
                                                type="number"
                                                min={10}
                                                max={28}
                                                value={getResponsiveNumberInputValue("metaFontSize", "13")}
                                                onChange={(e) => handleResponsiveIntegerInputChange("metaFontSize", e.target.value, 10)}
                                                onBlur={() => clearResponsiveIntegerDraft("metaFontSize", 10)}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                            />
                                        </div>
                                        <ColorPicker label="Warna Judul" configKey="titleColor" globalDefault={globalSettings?.headingColor} activeDeviceTab={activeDeviceTab} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                        <ColorPicker label="Warna Deskripsi" configKey="descriptionColor" globalDefault={globalSettings?.excerptColor} activeDeviceTab={activeDeviceTab} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                        <ColorPicker label="Warna Meta" configKey="metaColor" globalDefault={globalSettings?.metaColor} activeDeviceTab={activeDeviceTab} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                    </>
                                )}
                                {child.type === "archive_post_grid" && (
                                    <>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jumlah Kolom</label>
                                            <select
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                                value={getConfigString("columns", "3")}
                                                onChange={(e) => updateChildConfig("columns", Number(e.target.value))}
                                            >
                                                <option value="1">1 Kolom</option>
                                                <option value="2">2 Kolom</option>
                                                <option value="3">3 Kolom</option>
                                                <option value="4">4 Kolom</option>
                                            </select>
                                        </div>
                                        <label className="flex items-center justify-between text-sm text-[var(--fg-primary)]">
                                            <span>Tampilkan Excerpt</span>
                                            <input
                                                type="checkbox"
                                                checked={getConfigBool("showExcerpt", true)}
                                                onChange={(e) => updateChildConfig("showExcerpt", e.target.checked)}
                                            />
                                        </label>
                                        <label className="flex items-center justify-between text-sm text-[var(--fg-primary)]">
                                            <span>Tampilkan Meta</span>
                                            <input
                                                type="checkbox"
                                                checked={getConfigBool("showMeta", true)}
                                                onChange={(e) => updateChildConfig("showMeta", e.target.checked)}
                                            />
                                        </label>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Panjang Excerpt</label>
                                            <input
                                                type="number"
                                                min={40}
                                                max={240}
                                                value={getGlobalNumberInputValue("excerptLength", "110")}
                                                onChange={(e) => handleGlobalIntegerInputChange("excerptLength", e.target.value)}
                                                onBlur={() => clearGlobalIntegerDraft("excerptLength", 40, 240)}
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                            />
                                        </div>
                                    </>
                                )}
                                {child.type === "archive_pagination" && (
                                    <label className="flex items-center justify-between text-sm text-[var(--fg-primary)]">
                                        <span>Tampilkan Tombol Sebelumnya/Berikutnya</span>
                                        <input
                                            type="checkbox"
                                            checked={getConfigBool("showPrevNext", true)}
                                            onChange={(e) => updateChildConfig("showPrevNext", e.target.checked)}
                                        />
                                    </label>
                                )}
                                {child.type === "archive_empty_state" && (
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Perataan Teks</label>
                                        <select
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                            value={getConfigString("textAlign", "center")}
                                            onChange={(e) => updateChildConfig("textAlign", e.target.value)}
                                        >
                                            <option value="left">Kiri</option>
                                            <option value="center">Tengah</option>
                                            <option value="right">Kanan</option>
                                        </select>
                                    </div>
                                )}
                                {child.type === "archive_post_grid" && (
                                    <>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Gunakan Box</label>
                                            <select
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                                value={getConfigString("useBox", "false")}
                                                onChange={(e) => updateChildConfig("useBox", e.target.value === "true")}
                                            >
                                                <option value="false">Tidak</option>
                                                <option value="true">Ya</option>
                                            </select>
                                        </div>
                                        <ColorPicker label="Warna Kartu" configKey="boxColor" activeDeviceTab={activeDeviceTab} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                    </>
                                )}
                                {child.type === "archive_empty_state" && (
                                    <>
                                        <ColorPicker label="Warna Judul" configKey="titleColor" globalDefault={globalSettings?.headingColor} activeDeviceTab={activeDeviceTab} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                        <ColorPicker label="Warna Deskripsi" configKey="descriptionColor" globalDefault={globalSettings?.excerptColor} activeDeviceTab={activeDeviceTab} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                        <ColorPicker label="Warna Tombol" configKey="buttonBgColor" globalDefault={globalSettings?.primaryColor} activeDeviceTab={activeDeviceTab} child={child} getConfigValue={getConfigValue} updateChildResponsiveConfig={updateChildResponsiveConfig} updateChildConfig={updateChildConfig} />
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </>
        );
    }

    return (
        <>
            {showMediaModal && mediaTargetKey && (
                <MediaLibraryModal
                    onClose={() => {
                        setShowMediaModal(false);
                        setMediaTargetKey(null);
                    }}
                    onSelect={(media) => {
                        updateChildConfig(mediaTargetKey, media.fileUrl);
                        setShowMediaModal(false);
                        setMediaTargetKey(null);
                    }}
                    allowedTypes="image"
                    selectedUrl={getConfigString(mediaTargetKey)}
                />
            )}
            {/* Tabs */}
            <div className="flex border-b border-[var(--border)]">
                <button 
                    onClick={() => setActiveEditTab("content")}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeEditTab === "content" ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]" : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                >
                    <FileText size={16} className="inline mr-2" />
                    Konten
                </button>
                <button 
                    onClick={() => setActiveEditTab("visual")}
                    className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeEditTab === "visual" ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]" : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                >
                    <Palette size={16} className="inline mr-2" />
                    Visual
                </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-4">
                            <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                Perataan & Posisi Widget
                                <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                                    {activeDeviceTab.toUpperCase()}
                                </span>
                            </h4>
                            <button
                                type="button"
                                onClick={() => {
                                    const textAlign = getConfigForApply("textAlign");
                                    const verticalAlign = getConfigForApply("verticalAlign");
                                    if (textAlign !== undefined) applyToAllDevices("textAlign", textAlign);
                                    if (verticalAlign !== undefined) applyToAllDevices("verticalAlign", verticalAlign);
                                }}
                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                title="Terapkan perataan & posisi ke semua device"
                            >
                                <Copy size={10} /> Semua
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Perataan (Kiri/Tengah/Kanan)</label>
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

                            <div>
                                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Posisi Vertikal (Atas/Tengah/Bawah)</label>
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
                    </div>
                    {activeEditTab === "content" ? (
                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block">Judul Widget</label>
                                </div>
                                <input 
                                    type="text" 
                                    value={child.title}
                                    onChange={(e) => onUpdateTitle(e.target.value)}
                                    className="w-full font-bold bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 focus:border-[var(--accent)] text-[var(--fg-primary)] outline-none transition-all text-sm"
                                />
                                {(builderLocation === "footer" && child.type === "footer_copyright") && (
                                    <p className="text-[10px] text-[var(--fg-muted)] mt-1 italic">Nama widget ini hanya untuk Admin.</p>
                                )}
                            </div>

                            {builderLocation === "footer" && (
                              <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                                <h4 className="text-sm font-bold text-[var(--fg-primary)]">Konten Widget Footer</h4>

                                {child.type === "footer_copyright" && (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Teks Copyright</label>
                                      <textarea
                                        rows={3}
                                        placeholder="Kosongkan untuk pakai default. Contoh: © {year} {siteName}. All rights reserved."
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        value={getConfigString("text", "")}
                                        onChange={(e) => updateChildConfig("text", e.target.value)}
                                      />
                                      <div className="text-[10px] text-[var(--fg-muted)] mt-1">
                                        Token: <span className="font-semibold">{`{year}`}</span>, <span className="font-semibold">{`{siteName}`}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {child.type === "footer_logo" && (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                          <label className="text-[10px] text-[var(--fg-muted)] block">Logo Light Mode</label>
                                          <button
                                            type="button"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-[11px] font-semibold hover:opacity-90 disabled:opacity-60"
                                            onClick={() => openMediaLibraryForKey("logoUrl")}
                                            disabled={uploading}
                                          >
                                            <Upload size={14} />
                                            Upload
                                          </button>
                                        </div>
                                        <div
                                          className="relative w-full h-24 bg-[var(--bg-elevated)] rounded-xl overflow-hidden border border-[var(--border)] cursor-pointer group"
                                          onClick={() => openMediaLibraryForKey("logoUrl")}
                                        >
                                          {getConfigString("logoUrl") ? (
                                            <Image src={getConfigString("logoUrl")} alt="Logo Light" fill unoptimized className="w-full h-full object-contain" />
                                          ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-[var(--fg-muted)] gap-1">
                                              <ImageIcon size={20} className="opacity-70" />
                                              <span>Pilih logo</span>
                                            </div>
                                          )}
                                          {getConfigString("logoUrl") && (
                                            <button
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); updateChildConfig("logoUrl", ""); }}
                                              className="absolute top-2 right-2 bg-black/70 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                              aria-label="Hapus logo light"
                                            >
                                              <X size={12} />
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                          <label className="text-[10px] text-[var(--fg-muted)] block">Logo Dark Mode</label>
                                          <button
                                            type="button"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-[11px] font-semibold hover:opacity-90 disabled:opacity-60"
                                            onClick={() => openMediaLibraryForKey("logoUrlDark")}
                                            disabled={uploading}
                                          >
                                            <Upload size={14} />
                                            Upload
                                          </button>
                                        </div>
                                        <div
                                          className="relative w-full h-24 bg-[var(--bg-elevated)] rounded-xl overflow-hidden border border-[var(--border)] cursor-pointer group"
                                          onClick={() => openMediaLibraryForKey("logoUrlDark")}
                                        >
                                          {getConfigString("logoUrlDark") ? (
                                            <Image src={getConfigString("logoUrlDark")} alt="Logo Dark" fill unoptimized className="w-full h-full object-contain" />
                                          ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-[var(--fg-muted)] gap-1">
                                              <ImageIcon size={20} className="opacity-70" />
                                              <span>Pilih logo</span>
                                            </div>
                                          )}
                                          {getConfigString("logoUrlDark") && (
                                            <button
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); updateChildConfig("logoUrlDark", ""); }}
                                              className="absolute top-2 right-2 bg-black/70 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                              aria-label="Hapus logo dark"
                                            >
                                              <X size={12} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {child.type === "footer_text" && (
                                  <div className="space-y-3">
                                    <label className="text-xs font-medium text-[var(--fg-primary)] block">Isi Teks</label>
                                    <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-elevated)]">
                                      <RichTextEditor
                                        value={getConfigString("html", getConfigString("text", ""))}
                                        onChange={(value) => updateChildConfig("html", value)}
                                        placeholder="Tulis konten..."
                                      />
                                    </div>
                                  </div>
                                )}

                                {child.type === "footer_social" && (
                                  <div className="space-y-4">
                                    <div className="space-y-3">
                                      {[
                                        { key: "facebook", label: "Facebook" },
                                        { key: "twitter", label: "Twitter / X" },
                                        { key: "instagram", label: "Instagram" },
                                        { key: "youtube", label: "YouTube" },
                                        { key: "linkedin", label: "LinkedIn" },
                                        { key: "tiktok", label: "TikTok" },
                                      ].map((item) => (
                                        <div key={item.key}>
                                          <label className="text-[10px] text-[var(--fg-muted)] block mb-1">{item.label}</label>
                                          <input
                                            type="url"
                                            placeholder="https://..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString(item.key, "")}
                                            onChange={(e) => updateChildConfig(item.key, e.target.value)}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                    {(() => {
                                      const openRaw = getConfigForApply("openInNewTab");
                                      const nofollowRaw = getConfigForApply("nofollowExternal");
                                      const openInNewTab = openRaw === undefined ? true : !!openRaw;
                                      const nofollowExternal = !!nofollowRaw;
                                      return (
                                        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-3 space-y-3">
                                          <label className="flex items-center justify-between gap-3 text-sm text-[var(--fg-secondary)]">
                                            <span>Buka tab baru</span>
                                            <input
                                              type="checkbox"
                                              checked={openInNewTab}
                                              onChange={(e) => updateChildConfig("openInNewTab", e.target.checked)}
                                            />
                                          </label>
                                          <label className="flex items-center justify-between gap-3 text-sm text-[var(--fg-secondary)]">
                                            <span>Nofollow</span>
                                            <input
                                              type="checkbox"
                                              checked={nofollowExternal}
                                              onChange={(e) => updateChildConfig("nofollowExternal", e.target.checked)}
                                            />
                                          </label>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}

                                {child.type === "footer_categories" && (
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jumlah Kategori</label>
                                      <input
                                        type="number"
                                        min={1}
                                        max={50}
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        value={getConfigString("limit", "10")}
                                        onChange={(e) => updateChildConfig("limit", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                      />
                                    </div>
                                  </div>
                                )}

                                {child.type === "footer_custom_links" && (() => {
                                  const raw = getConfigForApply("links");
                                  const links = Array.isArray(raw) ? raw : [];
                                  const normalized = links
                                    .map((l: any) => ({
                                      label: typeof l?.label === "string" ? l.label : "",
                                      url: typeof l?.url === "string" ? l.url : "",
                                      openInNewTab: !!l?.openInNewTab,
                                    }))
                                    .filter((l: any) => l.label.trim() !== "" || l.url.trim() !== "");

                                  const updateLinks = (next: any[]) => updateChildConfig("links", next);

                                  const moveLink = (index: number, direction: "up" | "down") => {
                                    const next = [...normalized];
                                    const target = next[index];
                                    const swapIndex = direction === "up" ? index - 1 : index + 1;
                                    if (!target || swapIndex < 0 || swapIndex >= next.length) return;
                                    next[index] = next[swapIndex];
                                    next[swapIndex] = target;
                                    updateLinks(next);
                                  };

                                  return (
                                    <div className="space-y-4">
                                      <div className="space-y-3">
                                        {normalized.length > 0 && (
                                          <div className="space-y-3">
                                            {normalized.map((item: any, idx: number) => (
                                              <div key={`${item.label}_${idx}`} className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-3 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Label</label>
                                                    <input
                                                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                                                      value={item.label}
                                                      onChange={(e) => {
                                                        const next = [...normalized];
                                                        next[idx] = { ...next[idx], label: e.target.value };
                                                        updateLinks(next);
                                                      }}
                                                    />
                                                  </div>
                                                  <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">URL</label>
                                                    <input
                                                      className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                                                      value={item.url}
                                                      onChange={(e) => {
                                                        const next = [...normalized];
                                                        next[idx] = { ...next[idx], url: e.target.value };
                                                        updateLinks(next);
                                                      }}
                                                    />
                                                  </div>
                                                </div>
                                                <div className="flex items-center justify-between gap-3">
                                                  <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)]">
                                                    <input
                                                      type="checkbox"
                                                      checked={!!item.openInNewTab}
                                                      onChange={(e) => {
                                                        const next = [...normalized];
                                                        next[idx] = { ...next[idx], openInNewTab: e.target.checked };
                                                        updateLinks(next);
                                                      }}
                                                    />
                                                    Buka tab baru
                                                  </label>
                                                  <div className="flex items-center gap-2">
                                                    <button
                                                      type="button"
                                                      onClick={() => moveLink(idx, "up")}
                                                      className="px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--fg-primary)] hover:border-[var(--accent)]"
                                                    >
                                                      ▲
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => moveLink(idx, "down")}
                                                      className="px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--fg-primary)] hover:border-[var(--accent)]"
                                                    >
                                                      ▼
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => updateLinks(normalized.filter((_: any, i: number) => i !== idx))}
                                                      className="px-2 py-1 rounded-lg border border-[var(--border)] text-[var(--fg-primary)] hover:border-red-500 hover:text-red-600"
                                                    >
                                                      Hapus
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-3 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                          <div>
                                            <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Label</label>
                                            <input
                                              className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                                              value={footerCustomLinkLabel}
                                              onChange={(e) => setFooterCustomLinkLabel(e.target.value)}
                                              placeholder="Label"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-[10px] text-[var(--fg-muted)] block mb-1">URL</label>
                                            <input
                                              className="w-full bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                                              value={footerCustomLinkUrl}
                                              onChange={(e) => setFooterCustomLinkUrl(e.target.value)}
                                              placeholder="https://..."
                                            />
                                          </div>
                                        </div>
                                        <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)]">
                                          <input type="checkbox" checked={footerCustomLinkNewTab} onChange={(e) => setFooterCustomLinkNewTab(e.target.checked)} />
                                          Buka tab baru
                                        </label>
                                        <button
                                          type="button"
                                          disabled={!footerCustomLinkLabel.trim() || !footerCustomLinkUrl.trim()}
                                          onClick={() => {
                                            const next = [
                                              ...normalized,
                                              { label: footerCustomLinkLabel.trim(), url: footerCustomLinkUrl.trim(), openInNewTab: footerCustomLinkNewTab },
                                            ];
                                            updateLinks(next);
                                            setFooterCustomLinkLabel("");
                                            setFooterCustomLinkUrl("");
                                            setFooterCustomLinkNewTab(false);
                                          }}
                                          className="w-full bg-[var(--accent)] text-white font-semibold py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          Tambah Link
                                        </button>
                                      </div>
                                      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-3">
                                        <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)]">
                                          <input
                                            type="checkbox"
                                            checked={getConfigBool("nofollowExternal", false)}
                                            onChange={(e) => updateChildConfig("nofollowExternal", e.target.checked)}
                                          />
                                          Tambahkan nofollow untuk link eksternal
                                        </label>
                                      </div>
                                    </div>
                                  );
                                })()}

                                
                              </div>
                            )}

                            {/* News Config */}
                            {(child.type.startsWith("news_") || child.type === "headline_2" || child.type === "news_list_highlight" || child.type === "classic_hero") && (
                            <>
                                {isArchiveNewsGrid ? (
                                    <>
                                        <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                                Sumber Arsip Aktif
                                            </h4>
                                            <p className="text-sm text-[var(--fg-primary)]">
                                                Grid News ini selalu mengambil artikel dari halaman arsip yang sedang dibuka.
                                            </p>
                                            <div className="text-xs text-[var(--fg-muted)] space-y-1">
                                                <p>Filter kategori, tag, dan urutan berita mengikuti konteks arsip aktif.</p>
                                                <p>Versi Archive Builder ini tidak memakai source berita custom seperti di Homepage Builder.</p>
                                            </div>
                                        </div>

                                        <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                                                Jumlah Item Arsip
                                            </h4>
                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jumlah Berita</label>
                                                <select
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
                                                    value={getConfigString("limit", "12")}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        updateChildConfig("limit", isNaN(val) ? 12 : val);
                                                    }}
                                                >
                                                    <option value={1}>1 Item</option>
                                                    <option value={2}>2 Item</option>
                                                    <option value={3}>3 Item</option>
                                                    <option value={4}>4 Item</option>
                                                    <option value={5}>5 Item</option>
                                                    <option value={6}>6 Item</option>
                                                    <option value={8}>8 Item</option>
                                                    <option value={9}>9 Item</option>
                                                    <option value={10}>10 Item</option>
                                                    <option value={12}>12 Item</option>
                                                    <option value={15}>15 Item</option>
                                                    <option value={20}>20 Item</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Offset Arsip</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={getGlobalNumberInputValue("offset", "0")}
                                                    onChange={(e) => handleGlobalIntegerInputChange("offset", e.target.value)}
                                                    onBlur={() => clearGlobalIntegerDraft("offset", 0)}
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                                />
                                                <p className="text-[10px] text-[var(--fg-muted)] mt-1">Lewati beberapa artikel teratas sebelum grid dimulai.</p>
                                            </div>

                                            <div className="p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg">
                                                <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-2 uppercase">Limit Responsif (Override)</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Tablet</label>
                                                        <input
                                                            type="number"
                                                            placeholder="Bawaan"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                            value={getGlobalNumberInputValue("tabletLimit")}
                                                            onChange={(e) => {
                                                                handleGlobalIntegerInputChange("tabletLimit", e.target.value);
                                                            }}
                                                            onBlur={() => clearGlobalIntegerDraft("tabletLimit")}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Mobile</label>
                                                        <input
                                                            type="number"
                                                            placeholder="Bawaan"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                            value={getGlobalNumberInputValue("mobileLimit")}
                                                            onChange={(e) => {
                                                                handleGlobalIntegerInputChange("mobileLimit", e.target.value);
                                                            }}
                                                            onBlur={() => clearGlobalIntegerDraft("mobileLimit")}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        
                                    </>
                                ) : child.type === "news_list" ? (
                                    <>
                                        <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                                Sumber Berita
                                            </h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Filter</label>
                                                    <div className="flex p-1 bg-[var(--bg-base)] rounded-lg border border-[var(--border)] mb-3">
                                                        <button
                                                            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("filterType", "category") === "category" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                                                            onClick={() => updateChildConfig("filterType", "category")}
                                                        >
                                                            Kategori
                                                        </button>
                                                        <button
                                                            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("filterType", "category") === "tag" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                                                            onClick={() => updateChildConfig("filterType", "tag")}
                                                        >
                                                            Tag
                                                        </button>
                                                    </div>

                                                    {(getConfigString("filterType", "category") === "category") ? (
                                                        <select
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
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
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
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
                                                    <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Urutan Berita</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
                                                        value={getConfigString("sortOrder", "latest")}
                                                        onChange={(e) => updateChildConfig("sortOrder", e.target.value)}
                                                    >
                                                        <option value="latest">Terbaru</option>
                                                        <option value="oldest">Terlama</option>
                                                        <option value="popular">Terpopuler</option>
                                                        <option value="random">Acak</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm">
                                                <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                                    <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                                                    Jumlah Item
                                                </h4>

                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jumlah Berita</label>
                                                        <select
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
                                                            value={getConfigString("limit", "6")}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                updateChildConfig("limit", isNaN(val) ? 6 : val);
                                                            }}
                                                        >
                                                            <option value={1}>1 Item</option>
                                                            <option value={2}>2 Item</option>
                                                            <option value={3}>3 Item</option>
                                                            <option value={4}>4 Item</option>
                                                            <option value={5}>5 Item</option>
                                                            <option value={6}>6 Item</option>
                                                            <option value={8}>8 Item</option>
                                                            <option value={9}>9 Item</option>
                                                            <option value={10}>10 Item</option>
                                                            <option value={12}>12 Item</option>
                                                            <option value={15}>15 Item</option>
                                                            <option value={20}>20 Item</option>
                                                        </select>
                                                    </div>

                                                    <div className="p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg">
                                                        <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-2 uppercase">Limit Responsive (Override)</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Tablet</label>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Bawaan"
                                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                                    value={getGlobalNumberInputValue("tabletLimit")}
                                                                    onChange={(e) => {
                                                                        handleGlobalIntegerInputChange("tabletLimit", e.target.value);
                                                                    }}
                                                                    onBlur={() => clearGlobalIntegerDraft("tabletLimit")}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Mobile</label>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Bawaan"
                                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                                    value={getGlobalNumberInputValue("mobileLimit")}
                                                                    onChange={(e) => {
                                                                        handleGlobalIntegerInputChange("mobileLimit", e.target.value);
                                                                    }}
                                                                    onBlur={() => clearGlobalIntegerDraft("mobileLimit")}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                                                Pagination
                                            </h4>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Gaya Pagination</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)] mb-2"
                                                        value={getConfigString("paginationStyle", "none")}
                                                        onChange={(e) => updateChildConfig("paginationStyle", e.target.value)}
                                                    >
                                                        <option value="none">Tanpa Pagination</option>
                                                        <option value="load_more">Tombol Load More</option>
                                                        <option value="next_prev">Tombol Next / Prev</option>
                                                        <option value="auto_load">Auto Load (Infinite Scroll)</option>
                                                    </select>

                                                    {getConfigString("paginationStyle", "none") === 'load_more' && (
                                                        <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                                                            <div>
                                                                <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-1">Custom Text Load More</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Bawaan: Muat Lebih Banyak"
                                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                                    value={getConfigString("loadMoreText")}
                                                                    onChange={(e) => updateChildResponsiveConfig("loadMoreText", e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-bold">Padding (Atas, Kanan, Bawah, Kiri)</label>
                                                                <div className="grid grid-cols-4 gap-2">
                                                                    {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                                        <input
                                                                            key={side}
                                                                            type="number"
                                                                            placeholder={getSideLabel(side)}
                                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                                                            value={getResponsiveNumberInputValue(`loadMorePadding${side}`)}
                                                                            onChange={(e) => {
                                                                                handleResponsiveIntegerInputChange(`loadMorePadding${side}`, e.target.value);
                                                                            }}
                                                                            onBlur={() => clearResponsiveIntegerDraft(`loadMorePadding${side}`)}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {getConfigString("paginationStyle", "none") !== 'none' && getConfigString("paginationStyle", "none") !== 'auto_load' && (
                                                    <div className="bg-[var(--bg-base)] p-4 rounded-xl border border-[var(--border)]">
                                                        <h4 className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider mb-3">Visual Tombol Pagination</h4>

                                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                                            <ColorPicker
                                                                label="Warna Teks"
                                                                configKey="paginationTextColor"
                                                                globalDefault="#374151"
                                                                isResponsive={false}
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                            <ColorPicker
                                                                label="Teks Saat Hover"
                                                                configKey="paginationHoverTextColor"
                                                                globalDefault="#2563eb"
                                                                isResponsive={false}
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                            <ColorPicker
                                                                label="Warna Latar"
                                                                configKey="paginationBgColor"
                                                                globalDefault="#f9fafb"
                                                                isResponsive={false}
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                            <ColorPicker
                                                                label="Latar Saat Hover"
                                                                configKey="paginationHoverBgColor"
                                                                globalDefault="#ffffff"
                                                                isResponsive={false}
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                            <ColorPicker
                                                                label="Warna Border"
                                                                configKey="paginationBorderColor"
                                                                globalDefault="#e5e7eb"
                                                                isResponsive={false}
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                            <ColorPicker
                                                                label="Border Saat Hover"
                                                                configKey="paginationHoverBorderColor"
                                                                globalDefault="#e5e7eb"
                                                                isResponsive={false}
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Radius Border</label>
                                                                <select
                                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs outline-none"
                                                                    value={getConfigString("paginationBorderRadius", "default")}
                                                                    onChange={(e) => updateChildConfig("paginationBorderRadius", e.target.value)}
                                                                >
                                                                    <option value="default">Global Bawaan</option>
                                                                    <option value="none">Tanpa Radius (Kotak)</option>
                                                                    <option value="sm">Kecil</option>
                                                                    <option value="md">Sedang</option>
                                                                    <option value="lg">Besar</option>
                                                                    <option value="full">Penuh (Bulat)</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ukuran Font (px)</label>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs outline-none"
                                                                    placeholder="Bawaan"
                                                                    value={getResponsiveNumberInputValue("paginationFontSize")}
                                                                    onChange={(e) => {
                                                                        handleResponsiveIntegerInputChange("paginationFontSize", e.target.value);
                                                                    }}
                                                                    onBlur={() => clearResponsiveIntegerDraft("paginationFontSize")}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-gray-500 rounded-full"></div>
                                                Pemisah
                                            </h4>

                                            <div>
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <label className="text-xs font-medium text-[var(--fg-primary)]">Garis Pemisah (Separator)</label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            checked={getConfigBool("showSeparator")}
                                                            onChange={(e) => updateChildConfig("showSeparator", e.target.checked)}
                                                        />
                                                        <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                                    </label>
                                                </div>
                                                {getConfigBool("showSeparator") && (
                                                    <div className="mt-2 space-y-3">
                                                        <ColorPicker
                                                            label="Warna Garis"
                                                            configKey="separatorColor"
                                                            globalDefault="#e5e7eb"
                                                            isResponsive={false}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                        <div>
                                                            <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-1">Jarak Vertikal (Margin Y)</label>
                                                            <input
                                                                type="number"
                                                                placeholder="Default: 32"
                                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                                value={getResponsiveNumberInputValue("separatorMargin")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("separatorMargin", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("separatorMargin")}
                                                            />
                                                            <p className="text-[9px] text-[var(--fg-muted)] mt-1">Jarak atas dan bawah garis (px).</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : isArchiveHeroSlider ? (
                                    <>
                                        <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                                Sumber Arsip Aktif
                                            </h4>
                                            <p className="text-sm text-[var(--fg-primary)]">
                                                Widget ini selalu mengambil artikel dari halaman arsip yang sedang dibuka.
                                            </p>
                                            <div className="text-xs text-[var(--fg-muted)] space-y-1">
                                                <p>Filter kategori, tag, dan urutan berita mengikuti konteks arsip aktif.</p>
                                                <p>Widget ini tidak memakai source berita kustom seperti versi Homepage Builder.</p>
                                            </div>
                                        </div>

                                        <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm space-y-4">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                                                Jumlah Item Arsip
                                            </h4>
                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jumlah Berita</label>
                                                <select
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
                                                    value={getConfigString("limit", "5")}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        updateChildConfig("limit", isNaN(val) ? 5 : Math.min(6, Math.max(1, val)));
                                                    }}
                                                >
                                                    <option value={1}>1 Item</option>
                                                    <option value={2}>2 Item</option>
                                                    <option value={3}>3 Item</option>
                                                    <option value={4}>4 Item</option>
                                                    <option value={5}>5 Item</option>
                                                    <option value={6}>6 Item</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-1">Offset Arsip</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    placeholder="0"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-2 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                    value={getGlobalNumberInputValue("offset", "0")}
                                                    onChange={(e) => {
                                                        handleGlobalIntegerInputChange("offset", e.target.value);
                                                    }}
                                                    onBlur={() => clearGlobalIntegerDraft("offset", 0)}
                                                />
                                                <p className="text-[9px] text-[var(--fg-muted)] mt-1">Lewati beberapa artikel teratas dari hasil arsip aktif.</p>
                                            </div>

                                            <div className="p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg">
                                                <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-2 uppercase">Batas Responsif (Override)</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Tablet</label>
                                                        <input
                                                            type="number"
                                                            placeholder="Bawaan"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                            value={getGlobalNumberInputValue("tabletLimit")}
                                                            onChange={(e) => {
                                                                handleGlobalIntegerInputChange("tabletLimit", e.target.value);
                                                            }}
                                                            onBlur={() => clearGlobalIntegerDraft("tabletLimit")}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Mobile</label>
                                                        <input
                                                            type="number"
                                                            placeholder="Bawaan"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                            value={getGlobalNumberInputValue("mobileLimit")}
                                                            onChange={(e) => {
                                                                handleGlobalIntegerInputChange("mobileLimit", e.target.value);
                                                            }}
                                                            onBlur={() => clearGlobalIntegerDraft("mobileLimit")}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Kategori</label>
                                            <div className="flex p-1 bg-[var(--bg-base)] rounded-lg border border-[var(--border)] mb-3">
                                                <button
                                                    className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("filterType", "category") === "category" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                                                    onClick={() => updateChildConfig("filterType", "category")}
                                                >
                                                    Kategori
                                                </button>
                                                <button
                                                    className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("filterType", "category") === "tag" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                                                    onClick={() => updateChildConfig("filterType", "tag")}
                                                >
                                                    Tag
                                                </button>
                                            </div>

                                            {(getConfigString("filterType", "category") === "category") ? (
                                                <select
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
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
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
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
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Urutan Berita</label>
                                            <select
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
                                                value={getConfigString("sortOrder", "latest")}
                                                onChange={(e) => updateChildConfig("sortOrder", e.target.value)}
                                            >
                                                <option value="latest">Terbaru (Latest)</option>
                                                <option value="oldest">Terlama (Oldest)</option>
                                                <option value="popular">Terpopuler (Popular)</option>
                                                <option value="random">Acak (Random)</option>
                                            </select>
                                        </div>

                                        {child.type !== 'classic_hero' && (
                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jml Berita</label>
                                                <select
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
                                                    value={child.type === "news_hero_split_4" ? "5" : getConfigString("limit", child.type === "headline_2" || child.type === "news_headline_big" ? "1" : "6")}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value);
                                                        if (child.type === "news_hero_split_4") {
                                                            updateChildConfig("limit", 5);
                                                            return;
                                                        }
                                                        if (child.type === "news_hero_slider") {
                                                            updateChildConfig("limit", isNaN(val) ? 5 : Math.min(6, Math.max(1, val)));
                                                            return;
                                                        }
                                                        updateChildConfig("limit", isNaN(val) ? 6 : val);
                                                    }}
                                                    disabled={child.type === "headline_2" || child.type === "news_headline_big" || child.type === "news_hero_split_4"}
                                                >
                                                    {child.type === "headline_2" || child.type === "news_headline_big" ? (
                                                        <option value={1}>1 (Fixed)</option>
                                                    ) : child.type === "news_hero_split_4" ? (
                                                        <option value={5}>5 (Fixed)</option>
                                                    ) : child.type === "news_hero_slider" ? (
                                                        <>
                                                            <option value={1}>1 Item</option>
                                                            <option value={2}>2 Item</option>
                                                            <option value={3}>3 Item</option>
                                                            <option value={4}>4 Item</option>
                                                            <option value={5}>5 Item</option>
                                                            <option value={6}>6 Item</option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option value={1}>1 Item</option>
                                                            <option value={2}>2 Item</option>
                                                            <option value={3}>3 Item</option>
                                                            <option value={4}>4 Item</option>
                                                            <option value={5}>5 Item</option>
                                                            <option value={6}>6 Item</option>
                                                            <option value={8}>8 Item</option>
                                                            <option value={9}>9 Item</option>
                                                            <option value={10}>10 Item</option>
                                                            <option value={12}>12 Item</option>
                                                            <option value={15}>15 Item</option>
                                                            <option value={20}>20 Item</option>
                                                        </>
                                                    )}
                                                </select>

                                                {(child.type === "news_grid" || child.type === "news_list" || child.type === "news_hero_split_4" || child.type === "news_hero_slider" || child.type === "news_grid_slider") && (
                                                    <div className="mt-2">
                                                        <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-1">Offset Berita</label>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            placeholder="0"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-2 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                            value={getGlobalNumberInputValue("offset", "0")}
                                                            onChange={(e) => {
                                                                handleGlobalIntegerInputChange("offset", e.target.value);
                                                            }}
                                                            onBlur={() => clearGlobalIntegerDraft("offset", 0)}
                                                        />
                                                        <p className="text-[9px] text-[var(--fg-muted)] mt-1">Lewati beberapa berita teratas sebelum ditampilkan.</p>
                                                    </div>
                                                )}

                                                {(child.type === "news_grid" || child.type === "news_grid_slider" || child.type === "news_hero_slider") && (
                                                    <div className="mt-2 p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg">
                                                        <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-2 uppercase">Batas Responsif (Override)</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Tablet</label>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Bawaan"
                                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                                    value={getGlobalNumberInputValue("tabletLimit")}
                                                                    onChange={(e) => {
                                                                        handleGlobalIntegerInputChange("tabletLimit", e.target.value);
                                                                    }}
                                                                    onBlur={() => clearGlobalIntegerDraft("tabletLimit")}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Mobile</label>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Bawaan"
                                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                                    value={getGlobalNumberInputValue("mobileLimit")}
                                                                    onChange={(e) => {
                                                                        handleGlobalIntegerInputChange("mobileLimit", e.target.value);
                                                                    }}
                                                                    onBlur={() => clearGlobalIntegerDraft("mobileLimit")}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {child.type === "news_bullet_list" && (
                                <div>
                                    <div className="mb-3">
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Offset Berita</label>
                                        <input
                                            type="number"
                                            min={0}
                                            placeholder="0"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
                                            value={getGlobalNumberInputValue("offset", "0")}
                                            onChange={(e) => {
                                                handleGlobalIntegerInputChange("offset", e.target.value);
                                            }}
                                            onBlur={() => clearGlobalIntegerDraft("offset", 0)}
                                        />
                                        <p className="text-[10px] text-[var(--fg-muted)] mt-1">Lewati sejumlah berita teratas sebelum ditampilkan di Bullet List.</p>
                                    </div>
                                    <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jumlah Kolom</label>
                                    <div className="flex p-1 bg-[var(--bg-base)] rounded-lg border border-[var(--border)] mb-3">
                                        <button
                                            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("columnCount", "1") === "1" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                                            onClick={() => updateChildResponsiveConfig("columnCount", 1)}
                                        >
                                            1 Kolom
                                        </button>
                                        <button
                                            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("columnCount", "1") === "2" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
                                            onClick={() => updateChildResponsiveConfig("columnCount", 2)}
                                        >
                                            2 Kolom
                                        </button>
                                    </div>
                                </div>
                                )}

                                {child.type === "news_bullet_list" && (
                                <div className="mt-4">
                                    <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Gap Vertikal Antar Item</label>
                                    <input 
                                        type="number" 
                                        placeholder="Default (12px)"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
                                            value={getResponsiveNumberInputValue("listGap")}
                                            onChange={(e) => {
                                                handleResponsiveIntegerInputChange("listGap", e.target.value);
                                            }}
                                            onBlur={() => clearResponsiveIntegerDraft("listGap")}
                                    />
                                    <p className="text-[10px] text-[var(--fg-muted)] mt-1">Mengatur jarak vertikal antar item pada Bullet List.</p>
                                </div>
                                )}

                                {(child.type === "news_grid_slider" || child.type === "news_hero_slider") && (
                                <div className="mt-4 p-3 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg">
                                    <p className="text-[11px] text-[var(--fg-muted)]">
                                        Pengaturan slider dipusatkan di Tab Visual untuk menghindari duplikasi.
                                    </p>
                                </div>
                                )}
                            </>
                            )}

                            {/* Sidebar Widget Config */}
                            {child.type === "sidebar_widget" && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Tipe Widget</label>
                                    <select 
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
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
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">{currentSidebarWidgetType === "category_list" ? "Jumlah Kategori" : "Jumlah Item"}</label>
                                        <select 
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
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
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Kode Iklan / HTML</label>
                                        <textarea
                                            rows={6}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
                                            value={getConfigString("adCode")}
                                            onChange={(e) => updateChildConfig("adCode", e.target.value)}
                                            placeholder="<div>Script iklan atau HTML custom</div>"
                                        />
                                    </div>
                                )}
                            </>
                            )}

                            {/* Tag Cloud Config */}
                            {child.type === "tag_cloud" && (
                            <div>
                                <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Jumlah Tag</label>
                                <select 
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none transition-all text-[var(--fg-primary)]"
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
                            )}
                            
                            {child.type === "header_mobile_menu_toggle" && false && (
                            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Tampilan Hamburger Menu - {activeDeviceTab.toUpperCase()}</label>
                                    <p className="text-[10px] text-[var(--fg-muted)]">Atur tampilan tombol hamburger dan drawer (off-canvas menu).</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ukuran Icon (px)</label>
                                        <input
                                            type="number"
                                            placeholder="24"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("mobileMenuIconSize", "")}
                                            onChange={(e) => updateChildResponsiveConfig("mobileMenuIconSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Padding (px)</label>
                                        <input
                                            type="number"
                                            placeholder="8"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("mobileMenuPadding", "")}
                                            onChange={(e) => updateChildResponsiveConfig("mobileMenuPadding", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Radius (px)</label>
                                        <input
                                            type="number"
                                            placeholder="10"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("mobileMenuRadius", "")}
                                            onChange={(e) => updateChildResponsiveConfig("mobileMenuRadius", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Warna Garis Hamburger"
                                        configKey="mobileMenuColor"
                                        globalDefault="#6b7280"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Warna Hover"
                                        configKey="mobileMenuHoverColor"
                                        globalDefault="#f59e0b"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Background"
                                        configKey="mobileMenuBgColor"
                                        globalDefault="#00000000"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Background Hover"
                                        configKey="mobileMenuBgHoverColor"
                                        globalDefault="#00000000"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div className="h-px bg-[var(--border)]" />

                                <div>
                                    <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Drawer (Off Canvas)</label>
                                    <p className="text-[10px] text-[var(--fg-muted)]">Atur efek muncul, ukuran, warna, footer, dan icon media sosial.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Konten Atas (Heading)</label>
                                        <select
                                            value={getConfigString("drawerHeaderContent", "none")}
                                            onChange={(e) => updateChildConfig("drawerHeaderContent", e.target.value)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        >
                                            <option value="none">Kosong</option>
                                            <option value="logo">Logo</option>
                                            <option value="search">Search Form</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Placeholder Search</label>
                                        <input
                                            type="text"
                                            placeholder="Cari berita..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("drawerSearchPlaceholder", "")}
                                            onChange={(e) => updateChildConfig("drawerSearchPlaceholder", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Label Tombol Search</label>
                                        <input
                                            type="text"
                                            placeholder="Cari"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("drawerSearchButtonLabel", "")}
                                            onChange={(e) => updateChildConfig("drawerSearchButtonLabel", e.target.value)}
                                        />
                                    </div>
                                    <div />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Efek Muncul</label>
                                        <select
                                            value={getConfigString("drawerEffect", "slide")}
                                            onChange={(e) => updateChildConfig("drawerEffect", e.target.value)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        >
                                            <option value="slide">Slide</option>
                                            <option value="fade">Fade</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Posisi Drawer</label>
                                        <select
                                            value={getConfigString("drawerSide", "left")}
                                            onChange={(e) => updateChildConfig("drawerSide", e.target.value)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        >
                                            <option value="left">Kiri</option>
                                            <option value="right">Kanan</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Durasi Transisi (ms)</label>
                                        <input
                                            type="number"
                                            placeholder="240"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("drawerTransitionMs", "")}
                                            onChange={(e) => updateChildConfig("drawerTransitionMs", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Lebar Drawer (%)</label>
                                        <input
                                            type="number"
                                            placeholder="85"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("drawerWidthPercent", "")}
                                            onChange={(e) => updateChildConfig("drawerWidthPercent", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Max Width Drawer (px)</label>
                                        <input
                                            type="number"
                                            placeholder="420"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("drawerMaxWidth", "")}
                                            onChange={(e) => updateChildConfig("drawerMaxWidth", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Opacity Overlay (%)</label>
                                        <input
                                            type="number"
                                            placeholder="30"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("drawerOverlayOpacity", "")}
                                            onChange={(e) => updateChildConfig("drawerOverlayOpacity", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Warna Overlay"
                                        configKey="drawerOverlayColor"
                                        globalDefault="#000000"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Background Drawer"
                                        configKey="drawerBgColor"
                                        globalDefault="#ffffff"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Warna Teks"
                                        configKey="drawerTextColor"
                                        globalDefault="#111827"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Warna Link"
                                        configKey="drawerLinkColor"
                                        globalDefault="#111827"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Link Hover"
                                        configKey="drawerLinkHoverColor"
                                        globalDefault="#f59e0b"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Warna Divider"
                                        configKey="drawerDividerColor"
                                        globalDefault="#f3f4f6"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Text Footer</label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        value={getConfigString("drawerFooterText", "")}
                                        onChange={(e) => updateChildConfig("drawerFooterText", e.target.value)}
                                    />
                                </div>

                                <div className="h-px bg-[var(--border)]" />

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block">Buka Link di Tab Baru</label>
                                            <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Untuk icon media sosial.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={getConfigBool("socialOpenNewTab", true)}
                                                onChange={(e) => updateChildConfig("socialOpenNewTab", e.target.checked)}
                                            />
                                            <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ukuran Icon Sosial (px)</label>
                                        <input
                                            type="number"
                                            placeholder="20"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("socialIconSize", "")}
                                            onChange={(e) => updateChildConfig("socialIconSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Warna Icon Sosial"
                                        configKey="socialIconColor"
                                        globalDefault="#6b7280"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Hover Icon Sosial"
                                        configKey="socialIconHoverColor"
                                        globalDefault="#f59e0b"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">TikTok URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://tiktok.com/@..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("socialTiktokUrl", "")}
                                            onChange={(e) => updateChildConfig("socialTiktokUrl", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Instagram URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://instagram.com/..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("socialInstagramUrl", "")}
                                            onChange={(e) => updateChildConfig("socialInstagramUrl", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Facebook URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://facebook.com/..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("socialFacebookUrl", "")}
                                            onChange={(e) => updateChildConfig("socialFacebookUrl", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Twitter/X URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://x.com/..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("socialTwitterUrl", "")}
                                            onChange={(e) => updateChildConfig("socialTwitterUrl", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">YouTube URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://youtube.com/..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("socialYoutubeUrl", "")}
                                            onChange={(e) => updateChildConfig("socialYoutubeUrl", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Website URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        value={getConfigString("socialWebsiteUrl", "")}
                                        onChange={(e) => updateChildConfig("socialWebsiteUrl", e.target.value)}
                                    />
                                </div>
                            </div>
                            )}

                            {/* Ad Banner Config */}
                            {child.type === "ad_banner" && (
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
                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                >
                                    <option value="">{loadingAds ? "Memuat daftar iklan..." : "Pilih iklan dari daftar"}</option>
                                    {availableAds.map((ad) => (
                                        <option key={ad.id} value={ad.id}>
                                            {ad.name}{ad.position ? ` - ${ad.position}` : ""}{ad.isActive === false ? " (Nonaktif)" : ""}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-[var(--fg-muted)] mt-1">Daftar ini mengambil iklan yang sudah kamu buat di menu Manajemen Iklan.</p>
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
                            {(child.type === "header_menu_primary" || child.type === "header_menu_secondary") && (
                            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Tampilan Menu - {activeDeviceTab.toUpperCase()}</label>
                                    <p className="text-[10px] text-[var(--fg-muted)]">Mengatur gaya teks menu untuk widget ini.</p>
                                </div>

                                <ColorPicker
                                    label="Warna Teks"
                                    configKey="menuTextColor"
                                    globalDefault="#111827"
                                    child={child}
                                    getConfigValue={getConfigValue}
                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                    updateChildConfig={updateChildConfig}
                                />
                                <ColorPicker
                                    label="Warna Hover"
                                    configKey="menuHoverTextColor"
                                    globalDefault="#f59e0b"
                                    child={child}
                                    getConfigValue={getConfigValue}
                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                    updateChildConfig={updateChildConfig}
                                />

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ukuran Font (px)</label>
                                        <input
                                            type="number"
                                            placeholder="12"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("menuFontSize", "")}
                                            onChange={(e) => updateChildResponsiveConfig("menuFontSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ketebalan Font</label>
                                        <select
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("menuFontWeight", "500")}
                                            onChange={(e) => updateChildResponsiveConfig("menuFontWeight", e.target.value)}
                                        >
                                            <option value="300">Light (300)</option>
                                            <option value="400">Regular (400)</option>
                                            <option value="500">Medium (500)</option>
                                            <option value="600">SemiBold (600)</option>
                                            <option value="700">Bold (700)</option>
                                            <option value="800">ExtraBold (800)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Font Family</label>
                                        <FontFamilyPicker
                                            value={getConfigString("menuFontFamily", "")}
                                            onChange={(val) => updateChildResponsiveConfig("menuFontFamily", val)}
                                        />
                                    </div>
                                </div>
                                <div
                                    className="text-[11px] text-[var(--fg-secondary)] rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2"
                                    style={{
                                        fontFamily: getConfigString("menuFontFamily", "") || undefined,
                                        fontWeight: getConfigString("menuFontWeight", "500") as any,
                                        fontSize: getConfigString("menuFontSize", "") ? `${getConfigString("menuFontSize")}px` : undefined
                                    }}
                                >
                                    Preview: Menu Primary 123
                                </div>
                            </div>
                            )}

                            {child.type === "header_logo" && (
                            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <label className="text-[10px] text-[var(--fg-muted)] block">Logo Light Mode</label>
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-[11px] font-semibold hover:opacity-90 disabled:opacity-60"
                                                onClick={() => openMediaLibraryForKey("logoUrl")}
                                                disabled={uploading}
                                            >
                                                <Upload size={14} />
                                                Upload
                                            </button>
                                        </div>
                                        <div
                                            className="relative w-full h-24 bg-[var(--bg-elevated)] rounded-xl overflow-hidden border border-[var(--border)] cursor-pointer group"
                                            onClick={() => openMediaLibraryForKey("logoUrl")}
                                        >
                                            {getConfigString("logoUrl") ? (
                                                <Image src={getConfigString("logoUrl")} alt="Logo Light" fill unoptimized className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-[var(--fg-muted)] gap-1">
                                                    <ImageIcon size={20} className="opacity-70" />
                                                    <span>Pilih logo</span>
                                                </div>
                                            )}
                                            {getConfigString("logoUrl") && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); updateChildConfig("logoUrl", ""); }}
                                                    className="absolute top-2 right-2 bg-black/70 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label="Hapus logo light"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <label className="text-[10px] text-[var(--fg-muted)] block">Logo Dark Mode</label>
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-[11px] font-semibold hover:opacity-90 disabled:opacity-60"
                                                onClick={() => openMediaLibraryForKey("logoUrlDark")}
                                                disabled={uploading}
                                            >
                                                <Upload size={14} />
                                                Upload
                                            </button>
                                        </div>
                                        <div
                                            className="relative w-full h-24 bg-[var(--bg-elevated)] rounded-xl overflow-hidden border border-[var(--border)] cursor-pointer group"
                                            onClick={() => openMediaLibraryForKey("logoUrlDark")}
                                        >
                                            {getConfigString("logoUrlDark") ? (
                                                <Image src={getConfigString("logoUrlDark")} alt="Logo Dark" fill unoptimized className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-[var(--fg-muted)] gap-1">
                                                    <ImageIcon size={20} className="opacity-70" />
                                                    <span>Pilih logo</span>
                                                </div>
                                            )}
                                            {getConfigString("logoUrlDark") && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); updateChildConfig("logoUrlDark", ""); }}
                                                    className="absolute top-2 right-2 bg-black/70 hover:bg-black/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label="Hapus logo dark"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block">Ukuran Logo - {activeDeviceTab.toUpperCase()}</label>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Tinggi (px)</label>
                                        <input
                                            type="number"
                                            placeholder="40"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("logoHeight")}
                                            onChange={(e) => updateChildResponsiveConfig("logoHeight", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Maks Lebar (px)</label>
                                        <input
                                            type="number"
                                            placeholder="240"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("logoMaxWidth")}
                                            onChange={(e) => updateChildResponsiveConfig("logoMaxWidth", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ukuran Teks (px) (jika tanpa gambar)</label>
                                    <input
                                        type="number"
                                        placeholder="28"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        value={getConfigString("logoTextSize")}
                                        onChange={(e) => updateChildResponsiveConfig("logoTextSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                    />
                                </div>
                            </div>
                            )}

                            {child.type === "header_search" && (
                            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Tampilan Search - {activeDeviceTab.toUpperCase()}</label>
                                    <p className="text-[10px] text-[var(--fg-muted)]">Pilih desain search dan atur warna/ukuran.</p>
                                </div>

                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Desain Search</label>
                                    <select
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        value={getConfigString("searchDesign", "icon")}
                                        onChange={(e) => updateChildConfig("searchDesign", e.target.value)}
                                    >
                                        <option value="icon">Icon</option>
                                        <option value="bar">Search Bar</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ukuran Icon (px)</label>
                                        <input
                                            type="number"
                                            placeholder="20"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("searchIconSize", "")}
                                            onChange={(e) => updateChildResponsiveConfig("searchIconSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ukuran Font (px)</label>
                                        <input
                                            type="number"
                                            placeholder="14"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("searchFontSize", "")}
                                            onChange={(e) => updateChildResponsiveConfig("searchFontSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Warna Icon/Teks"
                                        configKey="searchColor"
                                        globalDefault="#6b7280"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Warna Hover"
                                        configKey="searchHoverColor"
                                        globalDefault="#f59e0b"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Background"
                                        configKey="searchBgColor"
                                        globalDefault="#ffffff"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Border"
                                        configKey="searchBorderColor"
                                        globalDefault="#e5e7eb"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Button Bg"
                                        configKey="searchButtonBgColor"
                                        globalDefault="#ffffff"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Button Text"
                                        configKey="searchButtonTextColor"
                                        globalDefault="#111827"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Tinggi Bar (px)</label>
                                        <input
                                            type="number"
                                            placeholder="38"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("searchHeight", "")}
                                            onChange={(e) => updateChildResponsiveConfig("searchHeight", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Radius (px)</label>
                                        <input
                                            type="number"
                                            placeholder="999"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("searchRadius", "")}
                                            onChange={(e) => updateChildResponsiveConfig("searchRadius", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Placeholder</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("searchPlaceholder", "Search...")}
                                            onChange={(e) => updateChildConfig("searchPlaceholder", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Label Button</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("searchButtonLabel", "Search")}
                                            onChange={(e) => updateChildConfig("searchButtonLabel", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            )}

                            {child.type === "header_theme_toggle" && (
                            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Tampilan Theme Toggle - {activeDeviceTab.toUpperCase()}</label>
                                    <p className="text-[10px] text-[var(--fg-muted)]">Atur ukuran dan warna icon.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ukuran Icon (px)</label>
                                        <input
                                            type="number"
                                            placeholder="20"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("themeIconSize", "")}
                                            onChange={(e) => updateChildResponsiveConfig("themeIconSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Warna"
                                        configKey="themeColor"
                                        globalDefault="#6b7280"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Warna Hover"
                                        configKey="themeHoverColor"
                                        globalDefault="#f59e0b"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>
                            </div>
                            )}

                            {child.type === "header_mobile_menu_toggle" && (
                            <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Tampilan Hamburger Menu - {activeDeviceTab.toUpperCase()}</label>
                                    <p className="text-[10px] text-[var(--fg-muted)]">Atur tampilan tombol hamburger dan drawer (off-canvas menu).</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ukuran Icon (px)</label>
                                        <input
                                            type="number"
                                            placeholder="24"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("mobileMenuIconSize", "")}
                                            onChange={(e) => updateChildResponsiveConfig("mobileMenuIconSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Padding (px)</label>
                                        <input
                                            type="number"
                                            placeholder="8"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("mobileMenuPadding", "")}
                                            onChange={(e) => updateChildResponsiveConfig("mobileMenuPadding", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Radius (px)</label>
                                        <input
                                            type="number"
                                            placeholder="10"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("mobileMenuRadius", "")}
                                            onChange={(e) => updateChildResponsiveConfig("mobileMenuRadius", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Warna Garis Hamburger"
                                        configKey="mobileMenuColor"
                                        globalDefault="#6b7280"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Warna Hover"
                                        configKey="mobileMenuHoverColor"
                                        globalDefault="#f59e0b"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Background"
                                        configKey="mobileMenuBgColor"
                                        globalDefault="#00000000"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Background Hover"
                                        configKey="mobileMenuBgHoverColor"
                                        globalDefault="#00000000"
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div className="h-px bg-[var(--border)]" />

                                <div>
                                    <label className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Drawer (Off Canvas)</label>
                                    <p className="text-[10px] text-[var(--fg-muted)]">Atur efek muncul, ukuran, warna, footer, dan icon media sosial.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Konten Atas (Heading)</label>
                                        <select
                                            value={getConfigString("drawerHeaderContent", "none")}
                                            onChange={(e) => updateChildConfig("drawerHeaderContent", e.target.value)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        >
                                            <option value="none">Kosong</option>
                                            <option value="logo">Logo</option>
                                            <option value="search">Search Form</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Placeholder Search</label>
                                        <input
                                            type="text"
                                            placeholder="Cari berita..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("drawerSearchPlaceholder", "")}
                                            onChange={(e) => updateChildConfig("drawerSearchPlaceholder", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Label Tombol Search</label>
                                        <input
                                            type="text"
                                            placeholder="Cari"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("drawerSearchButtonLabel", "")}
                                            onChange={(e) => updateChildConfig("drawerSearchButtonLabel", e.target.value)}
                                        />
                                    </div>
                                    <div />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Efek Muncul</label>
                                        <select
                                            value={getConfigString("drawerEffect", "slide")}
                                            onChange={(e) => updateChildConfig("drawerEffect", e.target.value)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        >
                                            <option value="slide">Slide</option>
                                            <option value="fade">Fade</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Posisi Drawer</label>
                                        <select
                                            value={getConfigString("drawerSide", "left")}
                                            onChange={(e) => updateChildConfig("drawerSide", e.target.value)}
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        >
                                            <option value="left">Kiri</option>
                                            <option value="right">Kanan</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Durasi Transisi (ms)</label>
                                        <input
                                            type="number"
                                            placeholder="240"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("drawerTransitionMs", "")}
                                            onChange={(e) => updateChildConfig("drawerTransitionMs", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Lebar Drawer (%)</label>
                                        <input
                                            type="number"
                                            placeholder="85"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("drawerWidthPercent", "")}
                                            onChange={(e) => updateChildConfig("drawerWidthPercent", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Max Width Drawer (px)</label>
                                        <input
                                            type="number"
                                            placeholder="420"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("drawerMaxWidth", "")}
                                            onChange={(e) => updateChildConfig("drawerMaxWidth", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Opacity Overlay (%)</label>
                                        <input
                                            type="number"
                                            placeholder="30"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("drawerOverlayOpacity", "")}
                                            onChange={(e) => updateChildConfig("drawerOverlayOpacity", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Warna Overlay"
                                        configKey="drawerOverlayColor"
                                        globalDefault="#000000"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Background Drawer"
                                        configKey="drawerBgColor"
                                        globalDefault="#ffffff"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Warna Teks"
                                        configKey="drawerTextColor"
                                        globalDefault="#111827"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Warna Link"
                                        configKey="drawerLinkColor"
                                        globalDefault="#111827"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Link Hover"
                                        configKey="drawerLinkHoverColor"
                                        globalDefault="#f59e0b"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Warna Divider"
                                        configKey="drawerDividerColor"
                                        globalDefault="#f3f4f6"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Text Footer</label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        value={getConfigString("drawerFooterText", "")}
                                        onChange={(e) => updateChildConfig("drawerFooterText", e.target.value)}
                                    />
                                </div>

                                <div className="h-px bg-[var(--border)]" />

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block">Buka Link di Tab Baru</label>
                                            <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Untuk icon media sosial.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={getConfigBool("socialOpenNewTab", true)}
                                                onChange={(e) => updateChildConfig("socialOpenNewTab", e.target.checked)}
                                            />
                                            <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ukuran Icon Sosial (px)</label>
                                        <input
                                            type="number"
                                            placeholder="20"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("socialIconSize", "")}
                                            onChange={(e) => updateChildConfig("socialIconSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <ColorPicker
                                        label="Warna Icon Sosial"
                                        configKey="socialIconColor"
                                        globalDefault="#6b7280"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <ColorPicker
                                        label="Hover Icon Sosial"
                                        configKey="socialIconHoverColor"
                                        globalDefault="#f59e0b"
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">TikTok URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://tiktok.com/@..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("socialTiktokUrl", "")}
                                            onChange={(e) => updateChildConfig("socialTiktokUrl", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Instagram URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://instagram.com/..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("socialInstagramUrl", "")}
                                            onChange={(e) => updateChildConfig("socialInstagramUrl", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Facebook URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://facebook.com/..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("socialFacebookUrl", "")}
                                            onChange={(e) => updateChildConfig("socialFacebookUrl", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Twitter/X URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://x.com/..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("socialTwitterUrl", "")}
                                            onChange={(e) => updateChildConfig("socialTwitterUrl", e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">YouTube URL</label>
                                        <input
                                            type="url"
                                            placeholder="https://youtube.com/..."
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("socialYoutubeUrl", "")}
                                            onChange={(e) => updateChildConfig("socialYoutubeUrl", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Website URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                        value={getConfigString("socialWebsiteUrl", "")}
                                        onChange={(e) => updateChildConfig("socialWebsiteUrl", e.target.value)}
                                    />
                                </div>
                            </div>
                            )}

                            {child.type === "ad_banner" && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block">Penuhi Ruang</label>
                                            <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Membuat iklan melebar mengisi ruang kosong di header.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={getConfigString("align", "right") === "stretch"}
                                                onChange={(e) => updateChildConfig("align", e.target.checked ? "stretch" : "right")}
                                            />
                                            <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Lebar (px) - {activeDeviceTab.toUpperCase()}</label>
                                        <input
                                            type="number"
                                            placeholder="728"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                            value={getConfigString("maxWidth")}
                                            onChange={(e) => updateChildResponsiveConfig("maxWidth", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                        />
                                    </div>

                                    {!getConfigBool("hideWhenEmpty", false) && (
                                        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <label className="text-xs font-medium text-[var(--fg-primary)] block">Gaya Placeholder Kosong</label>
                                                    <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Dipakai saat iklan yang dipilih belum aktif atau belum tersedia.</p>
                                                </div>
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
                                </div>
                            )}
                            {/* Block Title Size (Judul Widget) - MOVED TO TOP */}
                            {child.type === 'classic_hero' ? (
                                <>
                                    {/* REUSED CONTAINER SETTINGS */}
                                    <div className={classicHeroCardClass}>
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                            <div className={classicHeroAccentBarClass}></div>
                                            Wadah Utama (Container Widget)
                                        </h4>
                                        <p className="text-[10px] text-[var(--fg-muted)] mb-4 -mt-2">Mengatur kotak pembungkus paling luar dari widget ini.</p>
                                        
                                        <div className="mb-5">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-bold text-[var(--fg-primary)] flex items-center gap-1"><DeviceIcon size={14} /> Margin & Padding - {activeDeviceTab}</label>
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
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Margin (Atas, Kanan, Bawah, Kiri)</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                        <input 
                                                            key={side}
                                                            type="number" 
                                                            placeholder={getSideLabel(side)}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center"
                                                            value={getResponsiveNumberInputValue(`margin${side}`)}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange(`margin${side}`, e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft(`margin${side}`)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Padding (Atas, Kanan, Bawah, Kiri)</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                        <input 
                                                            key={side}
                                                            type="number" 
                                                            placeholder={getSideLabel(side)}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center"
                                                            value={getResponsiveNumberInputValue(`padding${side}`)}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange(`padding${side}`, e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft(`padding${side}`)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-[var(--border)] pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <label className="text-xs font-bold text-[var(--fg-primary)] block">Wadah Latar Belakang</label>
                                                    <p className="text-[9px] text-[var(--fg-muted)] font-normal">Warna latar belakang untuk seluruh area widget.</p>
                                                </div>
                                                <label className="relative inline-block w-8 h-4 align-middle select-none cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                                        style={{ 
                                                            right: getConfigBool("useBox") ? '0' : 'auto', 
                                                            left: getConfigBool("useBox") ? 'auto' : '0', 
                                                            borderColor: getConfigBool("useBox") ? 'var(--accent)' : 'var(--border)' 
                                                        }}
                                                        checked={getConfigBool("useBox")}
                                                        onChange={(e) => updateChildResponsiveConfig("useBox", e.target.checked)}
                                                    />
                                                    <span className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${getConfigBool("useBox") ? 'bg-[var(--accent)]' : 'bg-[var(--bg-muted)]'}`}></span>
                                                </label>
                                            </div>
                                            
                                            {getConfigBool("useBox") && (
                                                <div className="space-y-3 animate-fade-in-down bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)]">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <ColorPicker 
                                                            label="Warna Background" 
                                                            configKey="boxColor" 
                                                            globalDefault="#ffffff" 
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* CLASSIC HERO VISUAL SETTINGS */}
                                    <div className={classicHeroCardClass}>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2"><div className={classicHeroAccentBarClass}></div><DeviceIcon size={14} /> Media & Judul Classic Hero - {activeDeviceTab}</h4>
                                            <button 
                                                onClick={() => {
                                                    const size = getConfigForApply("newsTitleFontSize");
                                                    const lh = getConfigForApply("newsTitleLineHeight");
                                                    const height = getConfigForApply("imageHeight");
                                                    if (size) applyToAllDevices('newsTitleFontSize', size);
                                                    if (lh) applyToAllDevices('newsTitleLineHeight', lh);
                                                    if (height !== undefined) applyToAllDevices('imageHeight', height);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan ke semua device"
                                            >
                                                <Copy size={10} /> Terapkan ke Semua
                                            </button>
                                        </div>
                                        
                                        <div className={`${classicHeroTwoColGridClass} mb-4`}>
                                            <div>
                                                <label className={classicHeroFieldLabelClass}>Tinggi Gambar Utama (px)</label>
                                                <input 
                                                    type="number" 
                                                    placeholder="Bawaan"
                                                    className={classicHeroInputClass}
                                                    value={getResponsiveNumberInputValue("imageHeight")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("imageHeight", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("imageHeight")}
                                                />
                                            </div>
                                            <div>
                                                <label className={classicHeroFieldLabelClass}>Ukuran Font (px)</label>
                                                <input 
                                                    type="number" 
                                                    placeholder="Bawaan"
                                                    className={classicHeroInputClass}
                                                    value={getResponsiveNumberInputValue("newsTitleFontSize")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("newsTitleFontSize", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("newsTitleFontSize")}
                                                />
                                            </div>

                                            <div>
                                                <label className={classicHeroFieldLabelClass}>Tinggi Baris</label>
                                                <input 
                                                    type="number" step="0.1"
                                                    placeholder="Bawaan"
                                                    className={classicHeroInputClass}
                                                    value={getResponsiveNumberInputValue("newsTitleLineHeight")}
                                                    onChange={(e) => {
                                                        handleResponsiveFloatInputChange("newsTitleLineHeight", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveFloatDraft("newsTitleLineHeight")}
                                                />
                                            </div>

                                            <div>
                                                <label className={classicHeroFieldLabelClass}>Jarak Bawah Judul Berita</label>
                                                <input 
                                                    type="number" 
                                                    placeholder="Default (16)"
                                                    className={classicHeroInputClass}
                                                    value={getResponsiveNumberInputValue("newsTitleMarginBottom")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("newsTitleMarginBottom", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("newsTitleMarginBottom")}
                                                />
                                            </div>
                                        </div>

                                        <div className={`${classicHeroTwoColGridClass} pt-4 border-t border-[var(--border)]`}>
                                            <ColorPicker 
                                                label="Warna Judul" 
                                                configKey="newsTitleColor" 
                                                labelClassName={classicHeroColorLabelClass}
                                                triggerClassName={classicHeroColorTriggerClass}
                                                swatchClassName={classicHeroColorSwatchClass}
                                                inputClassName={classicHeroColorInputClass}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <ColorPicker 
                                                label="Warna Hover" 
                                                configKey="newsTitleHoverColor" 
                                                labelClassName={classicHeroColorLabelClass}
                                                triggerClassName={classicHeroColorTriggerClass}
                                                swatchClassName={classicHeroColorSwatchClass}
                                                inputClassName={classicHeroColorInputClass}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                        </div>
                                    </div>

                                    <div className={classicHeroCardClass}>
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                            <div className={classicHeroAccentBarClass}></div>
                                            Elemen Konten Tambahan
                                        </h4>

                                        <div className="border-t border-[var(--border)] pt-3">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Meta Data (Author & Tanggal)</h5>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                        checked={getConfigBool("showMetaInfo", true)}
                                                        onChange={(e) => updateChildResponsiveConfig("showMetaInfo", e.target.checked)}
                                                    />
                                                    <span className={classicHeroToggleTextClass}>Tampilkan</span>
                                                </label>
                                            </div>
                                            {getConfigBool("showMetaInfo", true) && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-6 pt-1">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                                checked={getConfigBool("showAuthor", true)}
                                                                onChange={(e) => updateChildResponsiveConfig("showAuthor", e.target.checked)}
                                                            />
                                                            <span className={classicHeroToggleTextClass}>Author</span>
                                                        </label>
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                                checked={getConfigBool("showDate", true)}
                                                                onChange={(e) => updateChildResponsiveConfig("showDate", e.target.checked)}
                                                            />
                                                            <span className={classicHeroToggleTextClass}>Tanggal</span>
                                                        </label>
                                                    </div>
                                                    <div className={classicHeroTwoColGridClass}>
                                                        <ColorPicker 
                                                            label="Warna Teks Meta" 
                                                            configKey="metaColor" 
                                                            globalDefault="#e5e7eb"
                                                            labelClassName={classicHeroColorLabelClass}
                                                            triggerClassName={classicHeroColorTriggerClass}
                                                            swatchClassName={classicHeroColorSwatchClass}
                                                            inputClassName={classicHeroColorInputClass}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                        <div>
                                                            <label className={classicHeroFieldLabelClass}>Ukuran Font (px)</label>
                                                            <input 
                                                                type="number" 
                                                                placeholder="Bawaan"
                                                                className={classicHeroInputClass}
                                                                value={getResponsiveNumberInputValue("metaFontSize")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("metaFontSize", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("metaFontSize")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className={classicHeroFieldLabelClass}>Tinggi Baris</label>
                                                            <input 
                                                                type="number" step="0.1"
                                                                placeholder="Bawaan"
                                                                className={classicHeroInputClass}
                                                                value={getResponsiveNumberInputValue("metaLineHeight")}
                                                                onChange={(e) => {
                                                                    handleResponsiveFloatInputChange("metaLineHeight", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveFloatDraft("metaLineHeight")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className={classicHeroFieldLabelClass}>Jarak Bawah (Margin Bottom) - px</label>
                                                            <input 
                                                                type="number" 
                                                                placeholder="Default (0)"
                                                                className={classicHeroInputClass}
                                                                value={getResponsiveNumberInputValue("metaMarginBottom")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("metaMarginBottom", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("metaMarginBottom")}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-[var(--border)] pt-3 mt-3">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Excerpts (Ringkasan)</h5>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                        checked={getConfigBool("showExcerpt", true)}
                                                        onChange={(e) => updateChildResponsiveConfig("showExcerpt", e.target.checked)}
                                                    />
                                                    <span className={classicHeroToggleTextClass}>Tampilkan</span>
                                                </label>
                                            </div>
                                            {getConfigBool("showExcerpt", true) && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className={classicHeroFieldLabelClass}>Panjang Karakter</label>
                                                        <input 
                                                            type="number" 
                                                            placeholder="Default: 200"
                                                            className={classicHeroInputClass}
                                                            value={getResponsiveNumberInputValue("excerptLength")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("excerptLength", e.target.value, 20);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("excerptLength", 20)}
                                                        />
                                                    </div>
                                                    <div className={classicHeroTwoColGridClass}>
                                                        <ColorPicker 
                                                            label="Warna Excerpt" 
                                                            configKey="excerptColor" 
                                                            globalDefault={globalSettings?.homeExcerptColor || globalSettings?.excerptColor} 
                                                            labelClassName={classicHeroColorLabelClass}
                                                            triggerClassName={classicHeroColorTriggerClass}
                                                            swatchClassName={classicHeroColorSwatchClass}
                                                            inputClassName={classicHeroColorInputClass}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                        <div>
                                                            <label className={classicHeroFieldLabelClass}>Ukuran Font (px)</label>
                                                            <input 
                                                                type="number" 
                                                                className={classicHeroInputClass}
                                                                value={getResponsiveNumberInputValue("excerptFontSize")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("excerptFontSize", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("excerptFontSize")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className={classicHeroFieldLabelClass}>Tinggi Baris</label>
                                                            <input 
                                                                type="number" step="0.1"
                                                                className={classicHeroInputClass}
                                                                value={getResponsiveNumberInputValue("excerptLineHeight")}
                                                                onChange={(e) => {
                                                                    handleResponsiveFloatInputChange("excerptLineHeight", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveFloatDraft("excerptLineHeight")}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-[var(--border)] pt-3 mt-3">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Label Kategori</h5>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                        checked={getConfigBool("showCategory", true)}
                                                        onChange={(e) => updateChildResponsiveConfig("showCategory", e.target.checked)}
                                                    />
                                                    <span className={classicHeroToggleTextClass}>Tampilkan</span>
                                                </label>
                                            </div>
                                            {getConfigBool("showCategory", true) && (
                                                <div className="space-y-4">
                                                    <div className={classicHeroTwoColGridClass}>
                                                        <div>
                                                            <label className={classicHeroFieldLabelClass}>Ukuran Font (px)</label>
                                                            <input 
                                                                type="number" 
                                                                placeholder="Bawaan"
                                                                className={classicHeroInputClass}
                                                                value={getResponsiveNumberInputValue("categoryLabelFontSize")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("categoryLabelFontSize", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("categoryLabelFontSize")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className={classicHeroFieldLabelClass}>Tinggi Baris</label>
                                                            <input 
                                                                type="number" step="0.1"
                                                                placeholder="Bawaan"
                                                                className={classicHeroInputClass}
                                                                value={getResponsiveNumberInputValue("categoryLabelLineHeight")}
                                                                onChange={(e) => {
                                                                    handleResponsiveFloatInputChange("categoryLabelLineHeight", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveFloatDraft("categoryLabelLineHeight")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className={classicHeroFieldLabelClass}>Jarak Bawah (Margin Bottom) - px</label>
                                                            <input 
                                                                type="number" 
                                                                placeholder="Default (16)"
                                                                className={classicHeroInputClass}
                                                                value={getResponsiveNumberInputValue("categoryLabelMarginBottom")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("categoryLabelMarginBottom", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("categoryLabelMarginBottom")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className={classicHeroFieldLabelClass}>Radius Sudut (px)</label>
                                                            <input 
                                                                type="number" 
                                                                placeholder="Bawaan"
                                                                className={classicHeroInputClass}
                                                                value={getResponsiveNumberInputValue("categoryLabelBorderRadius")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("categoryLabelBorderRadius", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("categoryLabelBorderRadius")}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className={classicHeroFieldLabelClass}>Padding (Internal) - px</label>
                                                        <div className={`${classicHeroTwoColGridClass} gap-3`}>
                                                            <div>
                                                                <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Vertikal (Atas/Bawah)</label>
                                                                <input 
                                                                    type="number" 
                                                                    placeholder="Bawaan"
                                                                    className={classicHeroCompactInputClass}
                                                                    value={getResponsiveNumberInputValue("categoryLabelPaddingY")}
                                                                    onChange={(e) => {
                                                                        handleResponsiveIntegerInputChange("categoryLabelPaddingY", e.target.value);
                                                                    }}
                                                                    onBlur={() => clearResponsiveIntegerDraft("categoryLabelPaddingY")}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] text-[var(--fg-muted)] block mb-1">Horizontal (Kiri/Kanan)</label>
                                                                <input 
                                                                    type="number" 
                                                                    placeholder="Bawaan"
                                                                    className={classicHeroCompactInputClass}
                                                                    value={getResponsiveNumberInputValue("categoryLabelPaddingX")}
                                                                    onChange={(e) => {
                                                                        handleResponsiveIntegerInputChange("categoryLabelPaddingX", e.target.value);
                                                                    }}
                                                                    onBlur={() => clearResponsiveIntegerDraft("categoryLabelPaddingX")}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={classicHeroTwoColGridClass}>
                                                        <ColorPicker 
                                                            label="Warna Teks" 
                                                            configKey="categoryLabelColor" 
                                                            globalDefault="#ffffff"
                                                            labelClassName={classicHeroColorLabelClass}
                                                            triggerClassName={classicHeroColorTriggerClass}
                                                            swatchClassName={classicHeroColorSwatchClass}
                                                            inputClassName={classicHeroColorInputClass}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                        <ColorPicker 
                                                            label="Warna Background" 
                                                            configKey="categoryLabelBgColor" 
                                                            globalDefault="var(--accent)"
                                                            labelClassName={classicHeroColorLabelClass}
                                                            triggerClassName={classicHeroColorTriggerClass}
                                                            swatchClassName={classicHeroColorSwatchClass}
                                                            inputClassName={classicHeroColorInputClass}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Padding (Internal) Settings (Moved Here) */}
                                    <div className={classicHeroCardClass}>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2"><div className={classicHeroAccentBarClass}></div><DeviceIcon size={14} /> Jarak Konten Hero - {activeDeviceTab}</h4>
                                            <button 
                                                onClick={() => {
                                                    ['Top', 'Right', 'Bottom', 'Left'].forEach((side) => {
                                                        const padding = getConfigForApply(`contentPadding${side}`);
                                                        if (padding !== undefined) applyToAllDevices(`contentPadding${side}`, padding);
                                                    });
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan padding ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-4 gap-3">
                                            {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                <div key={side}>
                                                    <input 
                                                        type="number" 
                                                        placeholder={getSideLabel(side)}
                                                        className={classicHeroCompactInputClass}
                                                        value={getResponsiveNumberInputValue(`contentPadding${side}`)}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange(`contentPadding${side}`, e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft(`contentPadding${side}`)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* REUSED ADVANCED SETTINGS */}
                                    {/* Custom CSS Removed as per request */}
                                </>
                            ) : (child.type === "news_hero_split_4" || child.type === "news_hero_slider" || child.type === "news_grid_slider") ? (
                                <>
                                    <div className="flex flex-col gap-6">
                                    {child.type === "news_grid_slider" && getConfigBool("showTitle", true) && (
                                    <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-0 order-5">
                                        <div className="flex justify-between items-center border-b border-[var(--border)] pb-2 mb-4">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                                <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                                Gaya Judul Widget - {activeDeviceTab}
                                            </h4>
                                            <button 
                                                onClick={() => {
                                                    const titleSize = getConfigForApply("blockTitleFontSize");
                                                    const titleColor = getConfigForApply("blockTitleColor");
                                                    const titleBorderColor = getConfigForApply("blockTitleBorderColor");
                                                    if (titleSize !== undefined) applyToAllDevices("blockTitleFontSize", titleSize);
                                                    if (titleColor !== undefined) applyToAllDevices("blockTitleColor", titleColor);
                                                    if (titleBorderColor !== undefined) applyToAllDevices("blockTitleBorderColor", titleBorderColor);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan pengaturan judul widget ke semua device"
                                            >
                                                <Copy size={10} /> Terapkan ke Semua
                                            </button>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Ukuran Font (px)</label>
                                            <input 
                                                type="number" 
                                                placeholder="Default (24)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                value={getResponsiveNumberInputValue("blockTitleFontSize")}
                                                onChange={(e) => {
                                                    handleResponsiveIntegerInputChange("blockTitleFontSize", e.target.value);
                                                }}
                                                onBlur={() => clearResponsiveIntegerDraft("blockTitleFontSize")}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border)]">
                                            <ColorPicker 
                                                label="Warna Judul" 
                                                configKey="blockTitleColor" 
                                                globalDefault={globalSettings?.homeWidgetTitleColor || globalSettings?.headingColor} 
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

                                    {(child.type === "news_hero_split_4" || child.type === "news_grid_slider" || child.type === "news_hero_slider") && (
                                    <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-0 order-8">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Wadah Utama (Container Widget)
                                        </h4>
                                        <p className="text-[10px] text-[var(--fg-muted)] mb-4 -mt-2">Mengatur kotak pembungkus paling luar dari widget ini.</p>
                                        
                                        <div className="mb-5">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-bold text-[var(--fg-primary)] flex items-center gap-1"><DeviceIcon size={14} /> Margin & Padding - {activeDeviceTab}</label>
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
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Margin (Atas, Kanan, Bawah, Kiri)</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                        <input 
                                                            key={side}
                                                            type="number" 
                                                            placeholder={getSideLabel(side)}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue(`margin${side}`)}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange(`margin${side}`, e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft(`margin${side}`)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Padding (Atas, Kanan, Bawah, Kiri)</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                        <input 
                                                            key={side}
                                                            type="number" 
                                                            placeholder={getSideLabel(side)}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue(`padding${side}`)}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange(`padding${side}`, e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft(`padding${side}`)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-[var(--border)] pt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <label className="text-xs font-bold text-[var(--fg-primary)] block">Wadah Latar Belakang</label>
                                                    <p className="text-[9px] text-[var(--fg-muted)] font-normal">Warna/Gambar latar belakang untuk seluruh area widget.</p>
                                                </div>
                                                <label className="relative inline-block w-8 h-4 align-middle select-none cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                                        style={{ 
                                                            right: getConfigBool("useBox") ? '0' : 'auto', 
                                                            left: getConfigBool("useBox") ? 'auto' : '0', 
                                                            borderColor: getConfigBool("useBox") ? 'var(--accent)' : 'var(--border)' 
                                                        }}
                                                        checked={getConfigBool("useBox")}
                                                        onChange={(e) => updateChildResponsiveConfig("useBox", e.target.checked)}
                                                    />
                                                    <span className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${getConfigBool("useBox") ? 'bg-[var(--accent)]' : 'bg-[var(--bg-muted)]'}`}></span>
                                                </label>
                                            </div>
                                            
                                            {getConfigBool("useBox") && (
                                                <div className="space-y-3 animate-fade-in-down bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)]">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[9px] text-[var(--fg-primary)] block mb-1">Warna Background</label>
                                                            <div className="flex items-center gap-1">
                                                                <input type="color" value={getConfigString("boxColor", "#ffffff")} onChange={(e) => updateChildResponsiveConfig("boxColor", e.target.value)} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="w-6 h-6 rounded border cursor-pointer"/>
                                                                <input type="text" value={getConfigString("boxColor")} onChange={(e) => updateChildResponsiveConfig("boxColor", e.target.value)} className="flex-1 min-w-0 bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1 text-[10px] text-[var(--fg-primary)]" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[9px] text-[var(--fg-primary)] block mb-1">Radius Container</label>
                                                            <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] text-[var(--fg-primary)]" value={getConfigString("boxBorderRadius", "default")} onChange={(e) => updateChildResponsiveConfig("boxBorderRadius", e.target.value)}>
                                                                <option value="default">Global Bawaan</option>
                                                                <option value="none">Kotak (0px)</option>
                                                                <option value="sm">Kecil</option>
                                                                <option value="md">Sedang</option>
                                                                <option value="lg">Besar</option>
                                                                <option value="xl">XL</option>
                                                                <option value="2xl">2XL</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="text-[9px] text-[var(--fg-primary)] block mb-1">Gambar Background (URL)</label>
                                                        <div className="flex gap-2">
                                                            <input type="text" className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] text-[var(--fg-primary)]" value={getConfigString("backgroundImage")} onChange={(e) => updateChildResponsiveConfig("backgroundImage", e.target.value)} placeholder="https://..." />
                                                            <label className="cursor-pointer bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 hover:bg-[var(--bg-muted)]">
                                                                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                                                                <Upload size={14} className="text-[var(--fg-primary)]" />
                                                            </label>
                                                        </div>
                                                        {getConfigString("backgroundImage") && (
                                                            <div className="mt-2 relative w-full h-16 bg-gray-100 rounded overflow-hidden border border-gray-200 group">
                                                                <Image src={getConfigString("backgroundImage")} alt="Bg" fill unoptimized className="w-full h-full object-cover" />
                                                                <button onClick={() => updateChildResponsiveConfig("backgroundImage", "")} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    )}

                                    <div className={`bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-0 ${child.type === "news_hero_split_4" ? "order-[20]" : "order-10"}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2 flex-1">
                                                <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                                {child.type === "news_hero_split_4" ? `Hero - Judul Berita (${activeDeviceTab})` : (child.type === "news_hero_slider" ? `Elemen Berita - ${activeDeviceTab}` : `Judul Berita - ${activeDeviceTab}`)}
                                            </h4>
                                            <button
                                                onClick={() => {
                                                    if (child.type === "news_hero_split_4") {
                                                        const size = getConfigForApply("leadTitleFontSize");
                                                        const lh = getConfigForApply("heroTitleLineHeight");
                                                        const color = getConfigForApply("heroTitleColor");
                                                        const hover = getConfigForApply("heroTitleHoverColor");
                                                        if (size !== undefined) applyToAllDevices("leadTitleFontSize", size);
                                                        if (lh !== undefined) applyToAllDevices("heroTitleLineHeight", lh);
                                                        if (color !== undefined) applyToAllDevices("heroTitleColor", color);
                                                        if (hover !== undefined) applyToAllDevices("heroTitleHoverColor", hover);
                                                        return;
                                                    }
                                                    const size = getConfigForApply("titleFontSize");
                                                    const lh = getConfigForApply("titleLineHeight");
                                                    const color = getConfigForApply("titleColor");
                                                    const hover = getConfigForApply("titleHoverColor");
                                                    if (size !== undefined) applyToAllDevices("titleFontSize", size);
                                                    if (lh !== undefined) applyToAllDevices("titleLineHeight", lh);
                                                    if (color !== undefined) applyToAllDevices("titleColor", color);
                                                    if (hover !== undefined) applyToAllDevices("titleHoverColor", hover);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>
                                        {child.type === "news_hero_split_4" && (
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Ukuran Font Hero (px)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("leadTitleFontSize")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("leadTitleFontSize", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("leadTitleFontSize")}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {child.type !== "news_hero_split_4" && (
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Ukuran Font (px)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("titleFontSize")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("titleFontSize", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("titleFontSize")}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Baris</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("titleLineHeight")}
                                                        onChange={(e) => {
                                                            handleResponsiveFloatInputChange("titleLineHeight", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveFloatDraft("titleLineHeight")}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {(child.type === "news_grid_slider" || child.type === "news_hero_slider") && (
                                            <div className="mb-2">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Ketebalan Font</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getConfigString("titleFontWeight", "bold")}
                                                        onChange={(e) => updateChildResponsiveConfig("titleFontWeight", e.target.value)}
                                                    >
                                                        <option value="light">Tipis (Light - 300)</option>
                                                        <option value="normal">Normal (400)</option>
                                                        <option value="medium">Sedang (Medium - 500)</option>
                                                        <option value="semibold">Agak Tebal (Semibold - 600)</option>
                                                        <option value="bold">Tebal (Bold - 700)</option>
                                                        <option value="extrabold">Sangat Tebal (Extra Bold - 800)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                        {child.type === "news_hero_slider" && (
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Gambar Utama (px)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("imageHeight")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("imageHeight", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("imageHeight")}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Overlay Gelap (%)</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("overlayOpacity")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("overlayOpacity", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("overlayOpacity", 0)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        {child.type === "news_hero_split_4" && (
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Baris Hero</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("heroTitleLineHeight")}
                                                        onChange={(e) => {
                                                            handleResponsiveFloatInputChange("heroTitleLineHeight", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveFloatDraft("heroTitleLineHeight")}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Ketebalan Font Hero</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getConfigString("heroTitleFontWeight", "extrabold")}
                                                        onChange={(e) => updateChildResponsiveConfig("heroTitleFontWeight", e.target.value)}
                                                    >
                                                        <option value="light">Tipis (Light - 300)</option>
                                                        <option value="normal">Normal (400)</option>
                                                        <option value="medium">Sedang (Medium - 500)</option>
                                                        <option value="semibold">Agak Tebal (Semibold - 600)</option>
                                                        <option value="bold">Tebal (Bold - 700)</option>
                                                        <option value="extrabold">Sangat Tebal (Extra Bold - 800)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                        {child.type !== "news_hero_split_4" && (
                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
                                            <ColorPicker
                                                label="Warna Judul"
                                                configKey="titleColor"
                                                globalDefault={globalSettings?.homeNewsTitleColor}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <ColorPicker
                                                label="Warna Hover"
                                                configKey="titleHoverColor"
                                                globalDefault={globalSettings?.homeHoverColor || globalSettings?.primaryColor}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                        </div>
                                        )}
                                        {child.type === "news_hero_split_4" && (
                                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)] mt-2">
                                                <ColorPicker
                                                    label="Hero - Warna Judul"
                                                    configKey="heroTitleColor"
                                                    globalDefault={globalSettings?.homeNewsTitleColor}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <ColorPicker
                                                    label="Hero - Warna Hover"
                                                    configKey="heroTitleHoverColor"
                                                    globalDefault={globalSettings?.homeHoverColor || globalSettings?.primaryColor}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className={`bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-0 ${child.type === "news_hero_slider" ? "hidden" : (child.type === "news_hero_split_4" ? "order-[23]" : child.type === "news_grid_slider" ? "order-[22]" : "order-20")}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2 flex-1">
                                                <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                                {child.type === "news_hero_split_4" ? `Hero + 4 Mini - Media & Layout (${activeDeviceTab})` : child.type === "news_grid_slider" ? `Grid Slider - Media & Layout (${activeDeviceTab})` : `Media & Layout - ${activeDeviceTab}`}
                                            </h4>
                                            <button
                                                onClick={() => {
                                                    if (child.type === "news_hero_split_4") {
                                                        const heroImageHeight = getConfigForApply("imageHeight");
                                                        const tih = getConfigForApply("miniImageHeight");
                                                        if (heroImageHeight !== undefined) applyToAllDevices("imageHeight", heroImageHeight);
                                                        if (tih !== undefined) applyToAllDevices("miniImageHeight", tih);
                                                        return;
                                                    }
                                                    const ih = getConfigForApply("imageHeight");
                                                    const tih = getConfigForApply("thumbnailImageHeight");
                                                    const gap = getConfigForApply("gridGapX");
                                                    const cardRadius = getConfigForApply("gridBoxBorderRadius");
                                                    const contentPadding = getConfigForApply("contentPadding");
                                                    const cardBg = getConfigForApply("gridBoxColor");
                                                    if (ih !== undefined) applyToAllDevices("imageHeight", ih);
                                                    if (tih !== undefined) applyToAllDevices("thumbnailImageHeight", tih);
                                                    if (gap !== undefined) applyToAllDevices("gridGapX", gap);
                                                    if (cardRadius !== undefined) applyToAllDevices("gridBoxBorderRadius", cardRadius);
                                                    if (contentPadding !== undefined) applyToAllDevices("contentPadding", contentPadding);
                                                    if (cardBg !== undefined) applyToAllDevices("gridBoxColor", cardBg);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            {child.type !== "news_hero_split_4" && child.type !== "news_grid_slider" && (
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Gambar Utama (px)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("imageHeight")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("imageHeight", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("imageHeight")}
                                                    />
                                                </div>
                                            )}
                                            {child.type === "news_hero_split_4" && (
                                                <>
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Gambar Utama (px)</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                            value={getResponsiveNumberInputValue("imageHeight")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("imageHeight", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("imageHeight")}
                                                        />
                                                    </div>
                                                    <label className="col-span-2 flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                            checked={getConfigBool("showMiniImage", true)}
                                                            onChange={(e) => updateChildConfig("showMiniImage", e.target.checked)}
                                                        />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan Thumbnail Mini Card</span>
                                                    </label>
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Thumbnail Mini (px)</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                            value={getResponsiveNumberInputValue("miniImageHeight")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("miniImageHeight", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("miniImageHeight")}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Kolom Mini Tablet</label>
                                                        <select
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                            value={getConfigString("tabletMiniColumns", "2")}
                                                            onChange={(e) => updateChildConfig("tabletMiniColumns", parseInt(e.target.value, 10))}
                                                        >
                                                            <option value="1">1 Kolom</option>
                                                            <option value="2">2 Kolom</option>
                                                            <option value="3">3 Kolom</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Kolom Mini Mobile</label>
                                                        <select
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                            value={getConfigString("mobileMiniColumns", "1")}
                                                            onChange={(e) => updateChildConfig("mobileMiniColumns", parseInt(e.target.value, 10))}
                                                        >
                                                            <option value="1">1 Kolom</option>
                                                            <option value="2">2 Kolom</option>
                                                        </select>
                                                    </div>
                                                </>
                                            )}
                                            {child.type === "news_grid_slider" && (
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Gambar Utama (px)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("imageHeight", "200")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("imageHeight", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("imageHeight")}
                                                    />
                                                </div>
                                            )}
                                            {child.type === "news_grid_slider" && (
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Gap Antar Card (rem/4)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("gridGapX", "4")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("gridGapX", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("gridGapX", 0)}
                                                    />
                                                </div>
                                            )}
                                            {child.type === "news_grid_slider" && (
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Radius Sudut Kartu</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        placeholder="Default: 12"
                                                        value={getResponsiveNumberInputValue("gridBoxBorderRadius")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("gridBoxBorderRadius", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("gridBoxBorderRadius")}
                                                    />
                                                </div>
                                            )}
                                            {child.type === "news_grid_slider" && (
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Padding Area Teks (px)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        placeholder="Default: 12"
                                                        value={getResponsiveNumberInputValue("contentPadding", "12")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("contentPadding", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("contentPadding")}
                                                    />
                                                </div>
                                            )}
                                            {child.type === "news_grid_slider" && (
                                                <div className="col-span-2">
                                                    <BaseColorPicker
                                                        label="Background Kartu"
                                                        configKey="gridBoxColor"
                                                        globalDefault="#ffffff"
                                                        isResponsive={false}
                                                        child={child}
                                                        getConfigValue={getConfigValue}
                                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                        updateChildConfig={updateChildConfig}
                                                    />
                                                </div>
                                            )}
                                            {child.type === "news_hero_slider" && (
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Overlay Gelap (%)</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("overlayOpacity", "70")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("overlayOpacity", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("overlayOpacity", 0)}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                    </div>

                                    {child.type === "news_hero_slider" && (
                                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-0 order-[29]">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                                Thumbnail Navigasi Bawah
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <label className="col-span-2 flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                        checked={getConfigBool("showMiniThumbnails", false)}
                                                        onChange={(e) => updateChildConfig("showMiniThumbnails", e.target.checked)}
                                                    />
                                                    <span className="text-xs text-[var(--fg-primary)]">Tampilkan Thumbnail Navigasi</span>
                                                </label>
                                                <p className="col-span-2 text-[10px] text-[var(--fg-muted)]">
                                                    Jumlah thumbnail otomatis mengikuti jumlah berita yang tampil pada slider.
                                                </p>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Thumbnail Navigasi Terlihat</label>
                                                    <input
                                                        type="number"
                                                        min={2}
                                                        max={6}
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getGlobalNumberInputValue("thumbnailVisibleCount")}
                                                        onChange={(e) => {
                                                            handleGlobalIntegerInputChange("thumbnailVisibleCount", e.target.value);
                                                        }}
                                                        onBlur={() => clearGlobalIntegerDraft("thumbnailVisibleCount", 2, 6)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Thumbnail Navigasi (px)</label>
                                                    <input
                                                        type="number"
                                                        min={40}
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("thumbnailImageHeight")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("thumbnailImageHeight", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("thumbnailImageHeight", 40)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {(child.type === "news_hero_slider" || child.type === "news_grid_slider") && (
                                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-0 order-[30]">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                                Slider Behavior - {activeDeviceTab}
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showArrows", true)} onChange={(e) => updateChildConfig("showArrows", e.target.checked)} />
                                                    <span className="text-xs text-[var(--fg-primary)]">Panah</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showDots", true)} onChange={(e) => updateChildConfig("showDots", e.target.checked)} />
                                                    <span className="text-xs text-[var(--fg-primary)]">Dots</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("autoplay", false)} onChange={(e) => updateChildConfig("autoplay", e.target.checked)} />
                                                    <span className="text-xs text-[var(--fg-primary)]">Autoplay</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("pauseOnHover", true)} onChange={(e) => updateChildConfig("pauseOnHover", e.target.checked)} />
                                                    <span className="text-xs text-[var(--fg-primary)]">Pause Hover</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("loop", true)} onChange={(e) => updateChildConfig("loop", e.target.checked)} />
                                                    <span className="text-xs text-[var(--fg-primary)]">Loop</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("swipeEnabled", true)} onChange={(e) => updateChildConfig("swipeEnabled", e.target.checked)} />
                                                    <span className="text-xs text-[var(--fg-primary)]">Swipe</span>
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Autoplay (ms)</label>
                                                    <input type="number" min={1500} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getGlobalNumberInputValue("autoplayMs")} onChange={(e) => { handleGlobalIntegerInputChange("autoplayMs", e.target.value); }} onBlur={() => clearGlobalIntegerDraft("autoplayMs", 1500)} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Durasi Transisi (ms)</label>
                                                    <input type="number" min={200} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getGlobalNumberInputValue("slideTransitionMs")} onChange={(e) => { handleGlobalIntegerInputChange("slideTransitionMs", e.target.value); }} onBlur={() => clearGlobalIntegerDraft("slideTransitionMs", 200)} />
                                                </div>
                                                {child.type === "news_grid_slider" && (
                                                    <>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Item per Tampilan</label>
                                                        <input type="number" min={1} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("itemsPerView", "3")} onChange={(e) => { handleResponsiveIntegerInputChange("itemsPerView", e.target.value); }} onBlur={() => clearResponsiveIntegerDraft("itemsPerView", 1)} />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Step Slide</label>
                                                            <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getConfigString("slideStep", "page")} onChange={(e) => updateChildConfig("slideStep", e.target.value)}>
                                                                <option value="page">Per Halaman</option>
                                                                <option value="1">Per Item</option>
                                                            </select>
                                                        </div>
                                                        <ColorPicker
                                                            label="Warna Dot Aktif"
                                                            configKey="dotColor"
                                                            globalDefault={globalSettings?.primaryColor || globalSettings?.homeHoverColor || "var(--accent)"}
                                                            activeDeviceTab={activeDeviceTab}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                        <ColorPicker
                                                            label="Warna Dot Nonaktif"
                                                            configKey="dotInactiveColor"
                                                            globalDefault="color-mix(in srgb, var(--accent) 30%, transparent)"
                                                            activeDeviceTab={activeDeviceTab}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                    </>
                                                )}
                                                {child.type === "news_hero_slider" && (
                                                    <>
                                                        <ColorPicker
                                                            label="Warna Dot Aktif"
                                                            configKey="dotColor"
                                                            globalDefault={globalSettings?.primaryColor || globalSettings?.homeHoverColor || "var(--accent)"}
                                                            activeDeviceTab={activeDeviceTab}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                        <ColorPicker
                                                            label="Warna Dot Nonaktif"
                                                            configKey="dotInactiveColor"
                                                            globalDefault="color-mix(in srgb, var(--accent) 30%, transparent)"
                                                            activeDeviceTab={activeDeviceTab}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {child.type === "news_hero_slider" && (
                                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-0 order-[31]">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                                    <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                                    <DeviceIcon size={14} /> Jarak Konten Hero - {activeDeviceTab}
                                                </h4>
                                                <button 
                                                    onClick={() => {
                                                        ['Top', 'Right', 'Bottom', 'Left'].forEach((side) => {
                                                            const padding = getConfigForApply(`heroContentPadding${side}`);
                                                            if (padding !== undefined) applyToAllDevices(`heroContentPadding${side}`, padding);
                                                        });
                                                    }}
                                                    className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                    title="Terapkan jarak konten ke semua device"
                                                >
                                                    <Copy size={10} /> Semua
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-[var(--fg-muted)] mb-3">
                                                Mengatur posisi judul, meta info, dan excerpts di area hero. Label kategori tidak ikut berubah.
                                            </p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                    <div key={side}>
                                                        <input 
                                                            type="number" 
                                                            placeholder={getSideLabel(side)}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue(`heroContentPadding${side}`)}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange(`heroContentPadding${side}`, e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft(`heroContentPadding${side}`)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {child.type === "news_hero_split_4" && (
                                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-0 order-[24]">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2 flex-1">
                                                    <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                                    Hero - Elemen Konten Tambahan ({activeDeviceTab})
                                                </h4>
                                                <button
                                                    onClick={() => {
                                                        const metaColor = getConfigForApply("heroMetaColor");
                                                        const metaSize = getConfigForApply("heroMetaFontSize");
                                                        const excerptColor = getConfigForApply("heroExcerptColor");
                                                        const excerptSize = getConfigForApply("heroExcerptFontSize");
                                                        const excerptLineHeight = getConfigForApply("heroExcerptLineHeight");
                                                        const categoryText = getConfigForApply("heroCategoryLabelColor");
                                                        const categoryBg = getConfigForApply("heroCategoryLabelBgColor");
                                                        const categorySize = getConfigForApply("heroCategoryLabelFontSize");
                                                        if (metaColor !== undefined) applyToAllDevices("heroMetaColor", metaColor);
                                                        if (metaSize !== undefined) applyToAllDevices("heroMetaFontSize", metaSize);
                                                        if (excerptColor !== undefined) applyToAllDevices("heroExcerptColor", excerptColor);
                                                        if (excerptSize !== undefined) applyToAllDevices("heroExcerptFontSize", excerptSize);
                                                        if (excerptLineHeight !== undefined) applyToAllDevices("heroExcerptLineHeight", excerptLineHeight);
                                                        if (categoryText !== undefined) applyToAllDevices("heroCategoryLabelColor", categoryText);
                                                        if (categoryBg !== undefined) applyToAllDevices("heroCategoryLabelBgColor", categoryBg);
                                                        if (categorySize !== undefined) applyToAllDevices("heroCategoryLabelFontSize", categorySize);
                                                    }}
                                                    className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                    title="Terapkan pengaturan elemen hero ke semua device"
                                                >
                                                    <Copy size={10} /> Semua
                                                </button>
                                            </div>

                                            <div className="border-t border-[var(--border)] pt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Meta Data (Author & Tanggal)</h5>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showHeroMetaInfo", true)} onChange={(e) => updateChildResponsiveConfig("showHeroMetaInfo", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan</span>
                                                    </label>
                                                </div>
                                                {getConfigBool("showHeroMetaInfo", true) && (
                                                    <>
                                                        <div className="flex items-center gap-6 mb-2">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showHeroAuthor", true)} onChange={(e) => updateChildResponsiveConfig("showHeroAuthor", e.target.checked)} />
                                                                <span className="text-xs text-[var(--fg-primary)]">Author</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showHeroDate", true)} onChange={(e) => updateChildResponsiveConfig("showHeroDate", e.target.checked)} />
                                                                <span className="text-xs text-[var(--fg-primary)]">Tanggal</span>
                                                            </label>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <ColorPicker
                                                                label="Warna Meta"
                                                                configKey="heroMetaColor"
                                                                globalDefault={globalSettings?.homeMetaColor || globalSettings?.metaColor}
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                            <div>
                                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Size (px)</label>
                                                                <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("heroMetaFontSize")} onChange={(e) => { handleResponsiveIntegerInputChange("heroMetaFontSize", e.target.value); }} onBlur={() => clearResponsiveIntegerDraft("heroMetaFontSize")} />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="border-t border-[var(--border)] pt-3 mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Excerpt (Ringkasan)</h5>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showHeroExcerpt", true)} onChange={(e) => updateChildResponsiveConfig("showHeroExcerpt", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan</span>
                                                    </label>
                                                </div>
                                                {getConfigBool("showHeroExcerpt", true) && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Panjang Excerpt</label>
                                                            <input type="number" min={20} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getGlobalNumberInputValue("heroExcerptLength")} onChange={(e) => { handleGlobalIntegerInputChange("heroExcerptLength", e.target.value); }} onBlur={() => clearGlobalIntegerDraft("heroExcerptLength", 20)} />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Size (px)</label>
                                                            <input type="number" min={10} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("heroExcerptFontSize")} onChange={(e) => { handleResponsiveIntegerInputChange("heroExcerptFontSize", e.target.value); }} onBlur={() => clearResponsiveIntegerDraft("heroExcerptFontSize", 10)} />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Baris</label>
                                                            <input type="number" step="0.1" min={1} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("heroExcerptLineHeight")} onChange={(e) => { handleResponsiveFloatInputChange("heroExcerptLineHeight", e.target.value); }} onBlur={() => clearResponsiveFloatDraft("heroExcerptLineHeight", 1)} />
                                                        </div>
                                                        <ColorPicker
                                                            label="Warna Excerpt"
                                                            configKey="heroExcerptColor"
                                                            globalDefault={globalSettings?.homeExcerptColor || globalSettings?.excerptColor}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="border-t border-[var(--border)] pt-3 mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Label Kategori</h5>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showHeroCategory", true)} onChange={(e) => updateChildResponsiveConfig("showHeroCategory", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan</span>
                                                    </label>
                                                </div>
                                                {getConfigBool("showHeroCategory", true) && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Size (px)</label>
                                                            <input type="number" min={8} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("heroCategoryLabelFontSize")} onChange={(e) => { handleResponsiveIntegerInputChange("heroCategoryLabelFontSize", e.target.value); }} onBlur={() => clearResponsiveIntegerDraft("heroCategoryLabelFontSize", 8)} />
                                                        </div>
                                                        <ColorPicker
                                                            label="Warna Teks"
                                                            configKey="heroCategoryLabelColor"
                                                            globalDefault="#ffffff"
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                        <ColorPicker
                                                            label="Warna Background"
                                                            configKey="heroCategoryLabelBgColor"
                                                            globalDefault={globalSettings?.primaryColor}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className={`bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-0 ${child.type === "news_hero_split_4" || child.type === "news_grid_slider" || child.type === "news_hero_slider" ? "hidden" : "order-40"}`}>
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                            Meta Data - {activeDeviceTab}
                                        </h4>
                                        <div className="space-y-2 mb-3">
                                            {child.type !== "news_hero_split_4" && (
                                                <>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showMetaInfo", true)} onChange={(e) => updateChildResponsiveConfig("showMetaInfo", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan Meta</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showAuthor", true)} onChange={(e) => updateChildResponsiveConfig("showAuthor", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan Author</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showDate", true)} onChange={(e) => updateChildResponsiveConfig("showDate", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan Tanggal</span>
                                                    </label>
                                                </>
                                            )}
                                            {child.type === "news_hero_split_4" && (
                                                <>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showHeroMetaInfo", true)} onChange={(e) => updateChildResponsiveConfig("showHeroMetaInfo", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Hero - Meta</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showMiniMetaInfo", true)} onChange={(e) => updateChildResponsiveConfig("showMiniMetaInfo", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Mini - Meta</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showHeroAuthor", true)} onChange={(e) => updateChildResponsiveConfig("showHeroAuthor", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Hero - Author</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showMiniAuthor", true)} onChange={(e) => updateChildResponsiveConfig("showMiniAuthor", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Mini - Author</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showHeroDate", true)} onChange={(e) => updateChildResponsiveConfig("showHeroDate", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Hero - Tanggal</span>
                                                    </label>
                                                </>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
                                            <ColorPicker
                                                label="Warna Meta"
                                                configKey="metaColor"
                                                globalDefault={globalSettings?.homeMetaColor || globalSettings?.metaColor}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            {child.type !== "news_hero_slider" && (
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Ukuran Font (px)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("metaFontSize")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("metaFontSize", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("metaFontSize")}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {child.type === "news_hero_split_4" && (
                                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)] mt-2">
                                                <ColorPicker
                                                    label="Hero - Warna Meta"
                                                    configKey="heroMetaColor"
                                                    globalDefault={globalSettings?.homeMetaColor || globalSettings?.metaColor}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className={`bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-0 ${child.type === "news_hero_split_4" || child.type === "news_grid_slider" || child.type === "news_hero_slider" ? "hidden" : "order-50"}`}>
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                            Excerpt & Label Kategori - {activeDeviceTab}
                                        </h4>
                                        <div className="space-y-2 mb-3">
                                            {child.type !== "news_hero_split_4" && (
                                                <>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showExcerpt", true)} onChange={(e) => updateChildResponsiveConfig("showExcerpt", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan Excerpt</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showCategory", true)} onChange={(e) => updateChildResponsiveConfig("showCategory", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan Label Kategori</span>
                                                    </label>
                                                </>
                                            )}
                                            {child.type === "news_hero_split_4" && (
                                                <>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showHeroExcerpt", true)} onChange={(e) => updateChildResponsiveConfig("showHeroExcerpt", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Hero - Excerpt</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showHeroCategory", true)} onChange={(e) => updateChildResponsiveConfig("showHeroCategory", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Hero - Label Kategori</span>
                                                    </label>
                                                </>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Panjang Excerpt</label>
                                                <input type="number" min={20} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("excerptLength")} onChange={(e) => { handleResponsiveIntegerInputChange("excerptLength", e.target.value, 20); }} onBlur={() => clearResponsiveIntegerDraft("excerptLength", 20)} />
                                            </div>
                                            <ColorPicker
                                                label="Warna Excerpt"
                                                configKey="excerptColor"
                                                globalDefault={globalSettings?.homeExcerptColor || globalSettings?.excerptColor}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            {child.type !== "news_hero_slider" && (
                                                <>
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Ukuran Excerpt (px)</label>
                                                        <input
                                                            type="number"
                                                            min={10}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                            value={getResponsiveNumberInputValue("excerptFontSize")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("excerptFontSize", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("excerptFontSize", 10)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Baris Ringkasan</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            min={1}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                            value={getResponsiveNumberInputValue("excerptLineHeight")}
                                                            onChange={(e) => {
                                                                handleResponsiveFloatInputChange("excerptLineHeight", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveFloatDraft("excerptLineHeight", 1)}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        {child.type === "news_hero_split_4" && (
                                            <div className="mb-2">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Hero Excerpt Length</label>
                                                    <input type="number" min={20} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getGlobalNumberInputValue("heroExcerptLength", "120")} onChange={(e) => { handleGlobalIntegerInputChange("heroExcerptLength", e.target.value); }} onBlur={() => clearGlobalIntegerDraft("heroExcerptLength", 20)} />
                                                </div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
                                            <ColorPicker
                                                label="Teks Label Kategori"
                                                configKey="categoryLabelColor"
                                                globalDefault="#ffffff"
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <ColorPicker
                                                label="BG Label Kategori"
                                                configKey="categoryLabelBgColor"
                                                globalDefault={globalSettings?.primaryColor}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                        </div>
                                        {child.type === "news_hero_split_4" && (
                                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)] mt-2">
                                                <ColorPicker
                                                    label="Hero - Excerpt"
                                                    configKey="heroExcerptColor"
                                                    globalDefault={globalSettings?.homeExcerptColor || globalSettings?.excerptColor}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <ColorPicker
                                                    label="Hero - Label Teks"
                                                    configKey="heroCategoryLabelColor"
                                                    globalDefault="#ffffff"
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <ColorPicker
                                                    label="Hero - Label BG"
                                                    configKey="heroCategoryLabelBgColor"
                                                    globalDefault={globalSettings?.primaryColor}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {child.type === "news_hero_split_4" && (
                                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-0 order-[32]">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2 flex-1">
                                                    <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                                    4 Mini - Judul Berita ({activeDeviceTab})
                                                </h4>
                                                <button
                                                    onClick={() => {
                                                        const size = getConfigForApply("miniTitleFontSize");
                                                        const lineHeight = getConfigForApply("miniTitleLineHeight");
                                                        const weight = getConfigForApply("miniTitleFontWeight");
                                                        const color = getConfigForApply("miniTitleColor");
                                                        const hover = getConfigForApply("miniTitleHoverColor");
                                                        if (size !== undefined) applyToAllDevices("miniTitleFontSize", size);
                                                        if (lineHeight !== undefined) applyToAllDevices("miniTitleLineHeight", lineHeight);
                                                        if (weight !== undefined) applyToAllDevices("miniTitleFontWeight", weight);
                                                        if (color !== undefined) applyToAllDevices("miniTitleColor", color);
                                                        if (hover !== undefined) applyToAllDevices("miniTitleHoverColor", hover);
                                                    }}
                                                    className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                    title="Terapkan pengaturan judul mini ke semua device"
                                                >
                                                    <Copy size={10} /> Semua
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Ukuran Judul Mini (px)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("miniTitleFontSize")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("miniTitleFontSize", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("miniTitleFontSize")}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Baris Mini</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getResponsiveNumberInputValue("miniTitleLineHeight")}
                                                        onChange={(e) => {
                                                            handleResponsiveFloatInputChange("miniTitleLineHeight", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveFloatDraft("miniTitleLineHeight")}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Ketebalan Font Mini</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none"
                                                        value={getConfigString("miniTitleFontWeight", "bold")}
                                                        onChange={(e) => updateChildResponsiveConfig("miniTitleFontWeight", e.target.value)}
                                                    >
                                                        <option value="light">Tipis (Light - 300)</option>
                                                        <option value="normal">Normal (400)</option>
                                                        <option value="medium">Sedang (Medium - 500)</option>
                                                        <option value="semibold">Agak Tebal (Semibold - 600)</option>
                                                        <option value="bold">Tebal (Bold - 700)</option>
                                                        <option value="extrabold">Sangat Tebal (Extra Bold - 800)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
                                                <ColorPicker
                                                    label="4 Mini - Warna Judul"
                                                    configKey="miniTitleColor"
                                                    globalDefault={globalSettings?.homeNewsTitleColor}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <ColorPicker
                                                    label="4 Mini - Warna Hover"
                                                    configKey="miniTitleHoverColor"
                                                    globalDefault={globalSettings?.homeHoverColor || globalSettings?.primaryColor}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {child.type === "news_hero_split_4" && (
                                        <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-0 order-[33]">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2 flex-1">
                                                    <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                                    4 Mini - Elemen Konten Tambahan ({activeDeviceTab})
                                                </h4>
                                                <button
                                                    onClick={() => {
                                                        const metaColor = getConfigForApply("miniMetaColor");
                                                        const metaSize = getConfigForApply("miniMetaFontSize");
                                                        const excerptColor = getConfigForApply("miniExcerptColor");
                                                        const excerptSize = getConfigForApply("miniExcerptFontSize");
                                                        const excerptLineHeight = getConfigForApply("miniExcerptLineHeight");
                                                        const categoryText = getConfigForApply("miniCategoryLabelColor");
                                                        const categoryBg = getConfigForApply("miniCategoryLabelBgColor");
                                                        const categorySize = getConfigForApply("miniCategoryLabelFontSize");
                                                        if (metaColor !== undefined) applyToAllDevices("miniMetaColor", metaColor);
                                                        if (metaSize !== undefined) applyToAllDevices("miniMetaFontSize", metaSize);
                                                        if (excerptColor !== undefined) applyToAllDevices("miniExcerptColor", excerptColor);
                                                        if (excerptSize !== undefined) applyToAllDevices("miniExcerptFontSize", excerptSize);
                                                        if (excerptLineHeight !== undefined) applyToAllDevices("miniExcerptLineHeight", excerptLineHeight);
                                                        if (categoryText !== undefined) applyToAllDevices("miniCategoryLabelColor", categoryText);
                                                        if (categoryBg !== undefined) applyToAllDevices("miniCategoryLabelBgColor", categoryBg);
                                                        if (categorySize !== undefined) applyToAllDevices("miniCategoryLabelFontSize", categorySize);
                                                    }}
                                                    className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                    title="Terapkan pengaturan elemen mini ke semua device"
                                                >
                                                    <Copy size={10} /> Semua
                                                </button>
                                            </div>
                                            <div className="border-t border-[var(--border)] pt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Meta Data (Author & Tanggal)</h5>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showMiniMetaInfo", true)} onChange={(e) => updateChildResponsiveConfig("showMiniMetaInfo", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan</span>
                                                    </label>
                                                </div>
                                                {getConfigBool("showMiniMetaInfo", true) && (
                                                    <>
                                                        <div className="flex items-center gap-6 mb-2">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showMiniAuthor", true)} onChange={(e) => updateChildResponsiveConfig("showMiniAuthor", e.target.checked)} />
                                                                <span className="text-xs text-[var(--fg-primary)]">Author</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showMiniDate", true)} onChange={(e) => updateChildResponsiveConfig("showMiniDate", e.target.checked)} />
                                                                <span className="text-xs text-[var(--fg-primary)]">Tanggal</span>
                                                            </label>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <ColorPicker
                                                                label="Warna Meta"
                                                                configKey="miniMetaColor"
                                                                globalDefault={globalSettings?.homeMetaColor || globalSettings?.metaColor}
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                            <div>
                                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Size (px)</label>
                                                                <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("miniMetaFontSize", "11")} onChange={(e) => { handleResponsiveIntegerInputChange("miniMetaFontSize", e.target.value); }} onBlur={() => clearResponsiveIntegerDraft("miniMetaFontSize")} />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="border-t border-[var(--border)] pt-3 mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Excerpt (Ringkasan)</h5>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showMiniExcerpt", false)} onChange={(e) => updateChildResponsiveConfig("showMiniExcerpt", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan</span>
                                                    </label>
                                                </div>
                                                {getConfigBool("showMiniExcerpt", false) && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Panjang Excerpt</label>
                                                            <input type="number" min={20} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getGlobalNumberInputValue("miniExcerptLength", "70")} onChange={(e) => { handleGlobalIntegerInputChange("miniExcerptLength", e.target.value); }} onBlur={() => clearGlobalIntegerDraft("miniExcerptLength", 20)} />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Size (px)</label>
                                                            <input type="number" min={10} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("miniExcerptFontSize", "12")} onChange={(e) => { handleResponsiveIntegerInputChange("miniExcerptFontSize", e.target.value); }} onBlur={() => clearResponsiveIntegerDraft("miniExcerptFontSize", 10)} />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Baris</label>
                                                            <input type="number" step="0.1" min={1} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("miniExcerptLineHeight", "1.5")} onChange={(e) => { handleResponsiveFloatInputChange("miniExcerptLineHeight", e.target.value); }} onBlur={() => clearResponsiveFloatDraft("miniExcerptLineHeight", 1)} />
                                                        </div>
                                                        <ColorPicker
                                                            label="Warna Excerpt"
                                                            configKey="miniExcerptColor"
                                                            globalDefault={globalSettings?.homeExcerptColor || globalSettings?.excerptColor}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="border-t border-[var(--border)] pt-3 mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Label Kategori</h5>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showMiniCategory", true)} onChange={(e) => updateChildResponsiveConfig("showMiniCategory", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan</span>
                                                    </label>
                                                </div>
                                                {getConfigBool("showMiniCategory", true) && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Size (px)</label>
                                                            <input type="number" min={8} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("miniCategoryLabelFontSize", "9")} onChange={(e) => { handleResponsiveIntegerInputChange("miniCategoryLabelFontSize", e.target.value); }} onBlur={() => clearResponsiveIntegerDraft("miniCategoryLabelFontSize", 8)} />
                                                        </div>
                                                        <ColorPicker
                                                            label="Warna Teks"
                                                            configKey="miniCategoryLabelColor"
                                                            globalDefault="#ffffff"
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                        <ColorPicker
                                                            label="Warna Background"
                                                            configKey="miniCategoryLabelBgColor"
                                                            globalDefault={globalSettings?.primaryColor}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className={`bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-0 ${(child.type === "news_hero_split_4" || child.type === "news_grid_slider" || child.type === "news_hero_slider") ? "hidden" : "order-60"}`}>
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                            Preset Visual Cepat
                                        </h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                className="px-2 py-2 text-[10px] font-semibold rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-primary)] hover:border-[var(--accent)] transition-colors"
                                                onClick={() => {
                                                    updateChildResponsiveConfig("titleFontSize", 30);
                                                    updateChildResponsiveConfig("titleLineHeight", 1.2);
                                                    updateChildResponsiveConfig("showMetaInfo", true);
                                                    updateChildResponsiveConfig("showCategory", true);
                                                    if (child.type !== "news_hero_split_4") updateChildConfig("slideTransitionMs", 500);
                                                }}
                                            >
                                                Modern
                                            </button>
                                            <button
                                                type="button"
                                                className="px-2 py-2 text-[10px] font-semibold rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-primary)] hover:border-[var(--accent)] transition-colors"
                                                onClick={() => {
                                                    updateChildResponsiveConfig("titleFontSize", 24);
                                                    updateChildResponsiveConfig("titleLineHeight", 1.3);
                                                    updateChildResponsiveConfig("showExcerpt", child.type === "news_hero_split_4");
                                                    updateChildResponsiveConfig("showMetaInfo", true);
                                                    if (child.type !== "news_hero_split_4") updateChildConfig("slideTransitionMs", 420);
                                                }}
                                            >
                                                Compact
                                            </button>
                                            <button
                                                type="button"
                                                className="px-2 py-2 text-[10px] font-semibold rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-primary)] hover:border-[var(--accent)] transition-colors"
                                                onClick={() => {
                                                    updateChildResponsiveConfig("titleFontSize", 34);
                                                    updateChildResponsiveConfig("titleLineHeight", 1.12);
                                                    updateChildResponsiveConfig("showCategory", true);
                                                    updateChildResponsiveConfig("showMetaInfo", true);
                                                    if (child.type !== "news_hero_split_4") updateChildConfig("slideTransitionMs", 560);
                                                }}
                                            >
                                                Bold
                                            </button>
                                        </div>
                                    </div>
                                    </div>
                                </>
                            ) : child.type === 'headline_2' ? (
                                <>
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                        Wadah Utama (Container Widget)
                                    </h4>
                                    <p className="text-[10px] text-[var(--fg-muted)] mb-4 -mt-2">Mengatur kotak pembungkus paling luar dari widget ini.</p>
                                    
                                    {/* Margin & Padding */}
                                    <div className="mb-5">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-[var(--fg-primary)] flex items-center gap-1"><DeviceIcon size={14} /> Margin & Padding - {activeDeviceTab}</label>
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
                                        
                                        {/* Margin */}
                                        <div className="mb-3">
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Margin (Atas, Kanan, Bawah, Kiri)</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                        <input 
                                                            key={side}
                                                            type="number" 
                                                            placeholder={getSideLabel(side)}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center"
                                                            value={getResponsiveNumberInputValue(`margin${side}`)}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange(`margin${side}`, e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft(`margin${side}`)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Padding */}
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Padding (Atas, Kanan, Bawah, Kiri)</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                        <input 
                                                            key={side}
                                                            type="number" 
                                                            placeholder={getSideLabel(side)}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center"
                                                            value={getResponsiveNumberInputValue(`padding${side}`)}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange(`padding${side}`, e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft(`padding${side}`)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                
                                <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm mb-4">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                            Gaya
                                        </div>
                                    </h4>
                                    
                                    {/* 1. Background */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Latar Belakang</label>
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
                                            <span className="text-[10px] text-[var(--fg-primary)]">Aktifkan Latar Belakang</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer"
                                                    checked={getConfigBool("useBox")}
                                                    onChange={(e) => updateChildResponsiveConfig("useBox", e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
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
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius Border</label>
                                                    <select 
                                                        value={getConfigString("boxBorderRadius", "xl")} 
                                                        onChange={(e) => updateChildResponsiveConfig("boxBorderRadius", e.target.value)}
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
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
                                    <div className="mb-4 border-t border-[var(--border)] pt-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Thumbnail</label>
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
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Lebar</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="contoh: 100% atau 300px"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] focus:border-[var(--accent)] outline-none h-8 text-[var(--fg-primary)]"
                                                    value={getConfigString("imageWidth")}
                                                    onChange={(e) => updateChildResponsiveConfig('imageWidth', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Tinggi</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="contoh: 200px"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] focus:border-[var(--accent)] outline-none h-8 text-[var(--fg-primary)]"
                                                    value={getConfigString("imageHeight")}
                                                    onChange={(e) => updateChildResponsiveConfig('imageHeight', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius Sudut (px)</label>
                                            <input 
                                                type="number" 
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] focus:border-[var(--accent)] outline-none h-8 text-[var(--fg-primary)]"
                                                placeholder="Default (px)"
                                                value={getResponsiveNumberInputValue("imageBorderRadius")}
                                                onChange={(e) => {
                                                    handleResponsiveIntegerInputChange("imageBorderRadius", e.target.value);
                                                }}
                                                onBlur={() => clearResponsiveIntegerDraft("imageBorderRadius")}
                                            />
                                        </div>
                                    </div>

                                    {/* 3. Judul Konten */}
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
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                    value={getResponsiveNumberInputValue("titleFontSize")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("titleFontSize", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("titleFontSize")}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                             <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Tinggi Baris</label>
                                                <input 
                                                    type="number" step="0.1"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                    value={getResponsiveNumberInputValue("titleLineHeight")}
                                                    onChange={(e) => {
                                                        handleResponsiveFloatInputChange("titleLineHeight", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveFloatDraft("titleLineHeight")}
                                                />
                                            </div>
                                             <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Jarak Vertikal (Y)</label>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                    value={getResponsiveNumberInputValue("titleMarginBottom")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("titleMarginBottom", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("titleMarginBottom")}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Meta Konten */}
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
                                                <span className="text-[10px] text-[var(--fg-primary)]">Author</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                    checked={getConfigBool("showDate", true)} 
                                                    onChange={(e) => updateChildResponsiveConfig("showDate", e.target.checked)}
                                                />
                                                <span className="text-[10px] text-[var(--fg-primary)]">Tanggal</span>
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <ColorPicker 
                                                label="Warna Meta" 
                                                configKey="metaColor" 
                                                globalDefault={globalSettings?.homeMetaColor || globalSettings?.metaColor} 
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Size (px)</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                    value={getResponsiveNumberInputValue("metaFontSize")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("metaFontSize", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("metaFontSize")}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 5. Excerpts */}
                                    <div className="mb-4 border-t border-[var(--border)] pt-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Excerpts</label>
                                            <button 
                                                onClick={() => {
                                                    const showExcerpt = getConfigForApply("showExcerpt");
                                                    const excerptColor = getConfigForApply("excerptColor");
                                                    const excerptSize = getConfigForApply("excerptFontSize");
                                                    const excerptLh = getConfigForApply("excerptLineHeight");
                                                    if (showExcerpt !== undefined) applyToAllDevices('showExcerpt', showExcerpt);
                                                    if (excerptColor !== undefined) applyToAllDevices('excerptColor', excerptColor);
                                                    if (excerptSize !== undefined) applyToAllDevices('excerptFontSize', excerptSize);
                                                    if (excerptLh !== undefined) applyToAllDevices('excerptLineHeight', excerptLh);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan pengaturan ini ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>
                                        <div className="mb-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                    checked={getConfigBool("showExcerpt", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showExcerpt", e.target.checked)}
                                                />
                                                <span className="text-[10px] font-medium text-[var(--accent)]">Tampilkan</span>
                                            </label>
                                        </div>

                                        {getConfigBool("showExcerpt", true) && (
                                            <>
                                        <div className="mb-3">
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Panjang Karakter</label>
                                            <input 
                                                type="number" 
                                                placeholder="Default: 200"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                value={getResponsiveNumberInputValue("excerptLength")}
                                                onChange={(e) => {
                                                    handleResponsiveIntegerInputChange("excerptLength", e.target.value, 20);
                                                }}
                                                onBlur={() => clearResponsiveIntegerDraft("excerptLength", 20)}
                                            />
                                            <p className="text-[9px] text-[var(--fg-muted)] mt-1">Berlaku untuk semua ukuran layar.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <ColorPicker 
                                                label="Warna Excerpt" 
                                                configKey="excerptColor" 
                                                globalDefault={globalSettings?.homeExcerptColor || globalSettings?.excerptColor} 
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Size (px)</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                    value={getResponsiveNumberInputValue("excerptFontSize")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("excerptFontSize", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("excerptFontSize")}
                                                />
                                            </div>
                                        </div>
                                         <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Tinggi Baris</label>
                                            <input 
                                                type="number" step="0.1"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                value={getResponsiveNumberInputValue("excerptLineHeight")}
                                                onChange={(e) => {
                                                    handleResponsiveFloatInputChange("excerptLineHeight", e.target.value);
                                                }}
                                                onBlur={() => clearResponsiveFloatDraft("excerptLineHeight")}
                                            />
                                        </div>
                                            </>
                                        )}
                                    </div>

                                    {/* 6. Tombol Read More */}
                                    <div className="mb-4 border-t border-[var(--border)] pt-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[11px] font-bold text-[var(--fg-primary)] block">6. Tombol Baca Selengkapnya</label>
                                            <button 
                                                onClick={() => {
                                                    const rmText = getConfigForApply("readMoreText");
                                                    const rmTextColor = getConfigForApply("readMoreTextColor");
                                                    const rmHoverTextColor = getConfigForApply("readMoreHoverTextColor");
                                                    const rmBgColor = getConfigForApply("readMoreBgColor");
                                                    const rmHoverBgColor = getConfigForApply("readMoreHoverBgColor");
                                                    const rmBorderColor = getConfigForApply("readMoreBorderColor");
                                                    const rmBorderSize = getConfigForApply("readMoreBorderSize");
                                                    if (rmText !== undefined) applyToAllDevices('readMoreText', rmText);
                                                    if (rmTextColor !== undefined) applyToAllDevices('readMoreTextColor', rmTextColor);
                                                    if (rmHoverTextColor !== undefined) applyToAllDevices('readMoreHoverTextColor', rmHoverTextColor);
                                                    if (rmBgColor !== undefined) applyToAllDevices('readMoreBgColor', rmBgColor);
                                                    if (rmHoverBgColor !== undefined) applyToAllDevices('readMoreHoverBgColor', rmHoverBgColor);
                                                    if (rmBorderColor !== undefined) applyToAllDevices('readMoreBorderColor', rmBorderColor);
                                                    if (rmBorderSize !== undefined) applyToAllDevices('readMoreBorderSize', rmBorderSize);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan pengaturan ini ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Teks Tombol</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Bawaan: Baca Selengkapnya"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                    value={getConfigString("readMoreText")}
                                                    onChange={(e) => updateChildResponsiveConfig("readMoreText", e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ukuran Font (px)</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                    value={getResponsiveNumberInputValue("readMoreFontSize")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("readMoreFontSize", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("readMoreFontSize")}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <ColorPicker 
                                                label="Warna Teks" 
                                                configKey="readMoreTextColor" 
                                                globalDefault="#000000" 
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <ColorPicker 
                                                label="Hover Teks" 
                                                configKey="readMoreHoverTextColor" 
                                                globalDefault="#ffffff" 
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <ColorPicker 
                                                label="Latar" 
                                                configKey="readMoreBgColor" 
                                                globalDefault="transparent" 
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <ColorPicker 
                                                label="Latar Saat Hover" 
                                                configKey="readMoreHoverBgColor" 
                                                globalDefault="#000000" 
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <ColorPicker 
                                                label="Border Color" 
                                                configKey="readMoreBorderColor" 
                                                globalDefault="#000000" 
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Border Size (px)</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                    value={getResponsiveNumberInputValue("readMoreBorderSize")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("readMoreBorderSize", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("readMoreBorderSize")}
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Padding Settings */}
                                        <div className="mt-3 pt-2 border-t border-[var(--border)]">
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-2 font-bold">Padding (Atas, Kanan, Bawah, Kiri)</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                    <input 
                                                        key={side}
                                                        type="number" 
                                                        placeholder={getSideLabel(side)}
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                                        value={getResponsiveNumberInputValue(`readMorePadding${side}`)}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange(`readMorePadding${side}`, e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft(`readMorePadding${side}`)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 7. Label Kategori */}
                                    <div className="mb-4 border-t border-[var(--border)] pt-3">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Label Kategori</label>
                                            <button 
                                                onClick={() => {
                                                    const showCat = getConfigForApply("showCategory");
                                                    const catTextColor = getConfigForApply("categoryLabelColor");
                                                    const catBgColor = getConfigForApply("categoryLabelBgColor");
                                                    const catSize = getConfigForApply("categoryLabelFontSize");
                                                    const catRadius = getConfigForApply("categoryLabelBorderRadius");
                                                    if (showCat !== undefined) applyToAllDevices('showCategory', showCat);
                                                    if (catTextColor !== undefined) applyToAllDevices('categoryLabelColor', catTextColor);
                                                    if (catBgColor !== undefined) applyToAllDevices('categoryLabelBgColor', catBgColor);
                                                    if (catSize !== undefined) applyToAllDevices('categoryLabelFontSize', catSize);
                                                    if (catRadius !== undefined) applyToAllDevices('categoryLabelBorderRadius', catRadius);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan pengaturan ini ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>
                                        <div className="mb-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                    checked={getConfigBool("showCategory", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showCategory", e.target.checked)}
                                                />
                                                <span className="text-[10px] font-medium text-[var(--accent)]">Tampilkan</span>
                                            </label>
                                        </div>
                                        
                                        {getConfigBool("showCategory", true) && (
                                            <>
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <ColorPicker 
                                                        label="Teks" 
                                                        configKey="categoryLabelColor" 
                                                        globalDefault="#ffffff" 
                                                        child={child}
                                                        getConfigValue={getConfigValue}
                                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                        updateChildConfig={updateChildConfig}
                                                    />
                                                    <ColorPicker 
                                                        label="Background" 
                                                        configKey="categoryLabelBgColor" 
                                                        globalDefault="#2563eb" 
                                                        child={child}
                                                        getConfigValue={getConfigValue}
                                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                        updateChildConfig={updateChildConfig}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Size (px)</label>
                                                        <input 
                                                            type="number" 
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue("categoryLabelFontSize")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("categoryLabelFontSize", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("categoryLabelFontSize")}
                                                        />
                                                    </div>
                                                    <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius Sudut (px)</label>
                                                        <input 
                                                            type="number" 
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue("categoryLabelBorderRadius")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("categoryLabelBorderRadius", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("categoryLabelBorderRadius")}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                </>
                            ) : (
                                <>
                                {(() => {
                                    const type = String(child.type || "");
                                    return ["news_list", "news_grid", "news_grid_slider", "sidebar_widget", "tag_cloud"].includes(type) && getConfigBool("showTitle", true);
                                })() && (
                                    <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-6">
                                        <div className="flex justify-between items-center border-b border-[var(--border)] pb-2 mb-4">
                                            <h4 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
                                                <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                                Gaya Judul Widget - {activeDeviceTab}
                                            </h4>
                                            <button
                                                onClick={() => {
                                                    const titleSize = getConfigForApply("blockTitleFontSize");
                                                    const titleColor = getConfigForApply("blockTitleColor");
                                                    const titleBorderColor = getConfigForApply("blockTitleBorderColor");
                                                    if (titleSize !== undefined) applyToAllDevices("blockTitleFontSize", titleSize);
                                                    if (titleColor !== undefined) applyToAllDevices("blockTitleColor", titleColor);
                                                    if (titleBorderColor !== undefined) applyToAllDevices("blockTitleBorderColor", titleBorderColor);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan pengaturan judul widget ke semua device"
                                            >
                                                <Copy size={10} /> Terapkan ke Semua
                                            </button>
                                        </div>
                                        
                                        <div className="mb-3">
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Ukuran Font (px)</label>
                                            <input 
                                                type="number" 
                                                placeholder="Default (24)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                value={getResponsiveNumberInputValue("blockTitleFontSize")}
                                                onChange={(e) => {
                                                    handleResponsiveIntegerInputChange("blockTitleFontSize", e.target.value);
                                                }}
                                                onBlur={() => clearResponsiveIntegerDraft("blockTitleFontSize")}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border)]">
                                            <ColorPicker 
                                                label="Warna Judul" 
                                                configKey="blockTitleColor" 
                                                globalDefault={globalSettings?.homeWidgetTitleColor || globalSettings?.headingColor} 
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

                                {(child.type === 'news_list' || child.type === 'archive_post_list') && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                        Wadah Utama (Container Widget)
                                    </h4>
                                    <p className="text-[10px] text-[var(--fg-muted)] mb-4 -mt-2">Mengatur kotak pembungkus paling luar dari widget ini.</p>
                                    
                                    <div className="mb-5">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-[var(--fg-primary)] flex items-center gap-1"><DeviceIcon size={14} /> Margin & Padding - {activeDeviceTab}</label>
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
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Margin (Atas, Kanan, Bawah, Kiri)</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                        <input 
                                                            key={side}
                                                            type="number" 
                                                            placeholder={getSideLabel(side)}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue(`margin${side}`)}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange(`margin${side}`, e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft(`margin${side}`)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Padding (Atas, Kanan, Bawah, Kiri)</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                        <input 
                                                            key={side}
                                                            type="number" 
                                                            placeholder={getSideLabel(side)}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue(`padding${side}`)}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange(`padding${side}`, e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft(`padding${side}`)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                    <div className="border-t border-[var(--border)] pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <label className="text-xs font-bold text-[var(--fg-primary)] block">Wadah Latar Belakang</label>
                                                <p className="text-[9px] text-[var(--fg-muted)] font-normal">Warna/Gambar latar belakang untuk seluruh area widget.</p>
                                            </div>
                                            <label className="relative inline-block w-8 h-4 align-middle select-none cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                                    style={{ 
                                                        right: getConfigBool("useBox") ? '0' : 'auto', 
                                                        left: getConfigBool("useBox") ? 'auto' : '0', 
                                                        borderColor: getConfigBool("useBox") ? 'var(--accent)' : 'var(--border)' 
                                                    }}
                                                    checked={getConfigBool("useBox")}
                                                    onChange={(e) => updateChildResponsiveConfig("useBox", e.target.checked)}
                                                />
                                                <span className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${getConfigBool("useBox") ? 'bg-[var(--accent)]' : 'bg-[var(--bg-muted)]'}`}></span>
                                            </label>
                                        </div>
                                        
                                        {getConfigBool("useBox") && (
                                            <div className="space-y-3 animate-fade-in-down bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)]">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[9px] text-[var(--fg-primary)] block mb-1">Warna Background</label>
                                                        <div className="flex items-center gap-1">
                                                            <input type="color" value={getConfigString("boxColor", "#ffffff")} onChange={(e) => updateChildResponsiveConfig("boxColor", e.target.value)} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="w-6 h-6 rounded border cursor-pointer"/>
                                                            <input type="text" value={getConfigString("boxColor")} onChange={(e) => updateChildResponsiveConfig("boxColor", e.target.value)} className="flex-1 min-w-0 bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1 text-[10px] text-[var(--fg-primary)]" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] text-[var(--fg-primary)] block mb-1">Radius Container</label>
                                                        <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] text-[var(--fg-primary)]" value={getConfigString("boxBorderRadius", "default")} onChange={(e) => updateChildResponsiveConfig("boxBorderRadius", e.target.value)}>
                                                            <option value="default">Global Bawaan</option>
                                                            <option value="none">Kotak (0px)</option>
                                                            <option value="sm">Kecil</option>
                                                            <option value="md">Sedang</option>
                                                            <option value="lg">Besar</option>
                                                            <option value="xl">XL</option>
                                                            <option value="2xl">2XL</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="text-[9px] text-[var(--fg-primary)] block mb-1">Gambar Background (URL)</label>
                                                    <div className="flex gap-2">
                                                        <input type="text" className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] text-[var(--fg-primary)]" value={getConfigString("backgroundImage")} onChange={(e) => updateChildResponsiveConfig("backgroundImage", e.target.value)} placeholder="https://..." />
                                                        <label className="cursor-pointer bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 hover:bg-[var(--bg-muted)]">
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                                                            <Upload size={14} className="text-[var(--fg-primary)]" />
                                                        </label>
                                                    </div>
                                                    {getConfigString("backgroundImage") && (
                                                        <div className="mt-2 relative w-full h-16 bg-gray-100 rounded overflow-hidden border border-gray-200 group">
                                                            <Image src={getConfigString("backgroundImage")} alt="Bg" fill unoptimized className="w-full h-full object-cover" />
                                                            <button onClick={() => updateChildResponsiveConfig("backgroundImage", "")} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                )}

                                {child.type === 'sidebar_widget' && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                        Wadah Utama (Container Widget)
                                    </h4>
                                    <p className="text-[10px] text-[var(--fg-muted)] mb-4 -mt-2">Mengatur kotak pembungkus paling luar dari widget ini.</p>
                                    
                                    <div className="mb-5">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-[var(--fg-primary)] flex items-center gap-1"><DeviceIcon size={14} /> Margin & Padding - {activeDeviceTab}</label>
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
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Margin (Atas, Kanan, Bawah, Kiri)</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                    <input 
                                                        key={side}
                                                        type="number" 
                                                        placeholder={getSideLabel(side)}
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                                        value={getResponsiveNumberInputValue(`margin${side}`)}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange(`margin${side}`, e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft(`margin${side}`)}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Padding (Atas, Kanan, Bawah, Kiri)</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                    <input 
                                                        key={side}
                                                        type="number" 
                                                        placeholder={getSideLabel(side)}
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                                        value={getResponsiveNumberInputValue(`padding${side}`)}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange(`padding${side}`, e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft(`padding${side}`)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-[var(--border)] pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <label className="text-xs font-bold text-[var(--fg-primary)] block">Wadah Latar Belakang</label>
                                                <p className="text-[9px] text-[var(--fg-muted)] font-normal">Warna/Gambar latar belakang untuk seluruh area widget.</p>
                                            </div>
                                            <label className="relative inline-block w-8 h-4 align-middle select-none cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                                    style={{ 
                                                        right: getConfigBool("useBox") ? '0' : 'auto', 
                                                        left: getConfigBool("useBox") ? 'auto' : '0', 
                                                        borderColor: getConfigBool("useBox") ? 'var(--accent)' : 'var(--border)' 
                                                    }}
                                                    checked={getConfigBool("useBox")}
                                                    onChange={(e) => updateChildResponsiveConfig("useBox", e.target.checked)}
                                                />
                                                <span className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${getConfigBool("useBox") ? 'bg-[var(--accent)]' : 'bg-[var(--bg-muted)]'}`}></span>
                                            </label>
                                        </div>
                                        
                                        {getConfigBool("useBox") && (
                                            <div className="space-y-3 animate-fade-in-down bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)]">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[9px] text-[var(--fg-primary)] block mb-1">Warna Background</label>
                                                        <div className="flex items-center gap-1">
                                                            <input type="color" value={getConfigString("boxColor", "#ffffff")} onChange={(e) => updateChildResponsiveConfig("boxColor", e.target.value)} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="w-6 h-6 rounded border cursor-pointer"/>
                                                            <input type="text" value={getConfigString("boxColor")} onChange={(e) => updateChildResponsiveConfig("boxColor", e.target.value)} className="flex-1 min-w-0 bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1 text-[10px] text-[var(--fg-primary)]" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] text-[var(--fg-primary)] block mb-1">Radius Container</label>
                                                        <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] text-[var(--fg-primary)]" value={getConfigString("boxBorderRadius", "default")} onChange={(e) => updateChildResponsiveConfig("boxBorderRadius", e.target.value)}>
                                                            <option value="default">Global Bawaan</option>
                                                            <option value="none">Kotak (0px)</option>
                                                            <option value="sm">Kecil</option>
                                                            <option value="md">Sedang</option>
                                                            <option value="lg">Besar</option>
                                                            <option value="xl">XL</option>
                                                            <option value="2xl">2XL</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="text-[9px] text-[var(--fg-primary)] block mb-1">Gambar Background (URL)</label>
                                                    <div className="flex gap-2">
                                                        <input type="text" className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] text-[var(--fg-primary)]" value={getConfigString("backgroundImage")} onChange={(e) => updateChildResponsiveConfig("backgroundImage", e.target.value)} placeholder="https://..." />
                                                        <label className="cursor-pointer bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 hover:bg-[var(--bg-muted)]">
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                                                            <Upload size={14} className="text-[var(--fg-primary)]" />
                                                        </label>
                                                    </div>
                                                    {getConfigString("backgroundImage") && (
                                                        <div className="mt-2 relative w-full h-16 bg-gray-100 rounded overflow-hidden border border-gray-200 group">
                                                            <Image src={getConfigString("backgroundImage")} alt="Bg" fill unoptimized className="w-full h-full object-cover" />
                                                            <button onClick={() => updateChildResponsiveConfig("backgroundImage", "")} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                )}

                                {child.type === 'sidebar_widget' && isSidebarPostListType && (
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
                                                    const st = getConfigForApply("showThumbnail");
                                                    const sc = getConfigForApply("showCategory");
                                                    const sm = getConfigForApply("showMetaInfo");
                                                    const sa = getConfigForApply("showAuthor");
                                                    const sd = getConfigForApply("showDate");
                                                    const w = getConfigForApply("imageWidth");
                                                    const h = getConfigForApply("imageHeight");
                                                    const r = getConfigForApply("imageBorderRadius");
                                                    const rankFs = getConfigForApply("rankNumberFontSize");
                                                    const rankFw = getConfigForApply("rankNumberFontWeight");
                                                    const rankColor = getConfigForApply("rankNumberColor");
                                                    const rankBg = getConfigForApply("rankNumberBgColor");
                                                    const rankRadius = getConfigForApply("rankNumberBorderRadius");
                                                    const fs = getConfigForApply("titleFontSize");
                                                    const lh = getConfigForApply("titleLineHeight");
                                                    const fw = getConfigForApply("titleFontWeight");
                                                    const tc = getConfigForApply("titleColor");
                                                    const thc = getConfigForApply("titleHoverColor");
                                                    const catFs = getConfigForApply("categoryLabelFontSize");
                                                    const catLh = getConfigForApply("categoryLabelLineHeight");
                                                    const catMb = getConfigForApply("categoryLabelMarginBottom");
                                                    const catPx = getConfigForApply("categoryLabelPaddingX");
                                                    const catPy = getConfigForApply("categoryLabelPaddingY");
                                                    const catR = getConfigForApply("categoryLabelBorderRadius");
                                                    const catC = getConfigForApply("categoryLabelColor");
                                                    const catBg = getConfigForApply("categoryLabelBgColor");
                                                    const metaFs = getConfigForApply("metaFontSize");
                                                    const metaLh = getConfigForApply("metaLineHeight");
                                                    const metaMb = getConfigForApply("metaMarginBottom");
                                                    const metaC = getConfigForApply("metaColor");
                                                    if (st !== undefined) applyToAllDevices('showThumbnail', st);
                                                    if (sc !== undefined) applyToAllDevices('showCategory', sc);
                                                    if (sm !== undefined) applyToAllDevices('showMetaInfo', sm);
                                                    if (sa !== undefined) applyToAllDevices('showAuthor', sa);
                                                    if (sd !== undefined) applyToAllDevices('showDate', sd);
                                                    if (w !== undefined) applyToAllDevices('imageWidth', w);
                                                    if (h !== undefined) applyToAllDevices('imageHeight', h);
                                                    if (r !== undefined) applyToAllDevices('imageBorderRadius', r);
                                                    if (rankFs !== undefined) applyToAllDevices('rankNumberFontSize', rankFs);
                                                    if (rankFw !== undefined) applyToAllDevices('rankNumberFontWeight', rankFw);
                                                    if (rankColor !== undefined) applyToAllDevices('rankNumberColor', rankColor);
                                                    if (rankBg !== undefined) applyToAllDevices('rankNumberBgColor', rankBg);
                                                    if (rankRadius !== undefined) applyToAllDevices('rankNumberBorderRadius', rankRadius);
                                                    if (fs !== undefined) applyToAllDevices('titleFontSize', fs);
                                                    if (lh !== undefined) applyToAllDevices('titleLineHeight', lh);
                                                    if (fw !== undefined) applyToAllDevices('titleFontWeight', fw);
                                                    if (tc !== undefined) applyToAllDevices('titleColor', tc);
                                                    if (thc !== undefined) applyToAllDevices('titleHoverColor', thc);
                                                    if (catFs !== undefined) applyToAllDevices('categoryLabelFontSize', catFs);
                                                    if (catLh !== undefined) applyToAllDevices('categoryLabelLineHeight', catLh);
                                                    if (catMb !== undefined) applyToAllDevices('categoryLabelMarginBottom', catMb);
                                                    if (catPx !== undefined) applyToAllDevices('categoryLabelPaddingX', catPx);
                                                    if (catPy !== undefined) applyToAllDevices('categoryLabelPaddingY', catPy);
                                                    if (catR !== undefined) applyToAllDevices('categoryLabelBorderRadius', catR);
                                                    if (catC !== undefined) applyToAllDevices('categoryLabelColor', catC);
                                                    if (catBg !== undefined) applyToAllDevices('categoryLabelBgColor', catBg);
                                                    if (metaFs !== undefined) applyToAllDevices('metaFontSize', metaFs);
                                                    if (metaLh !== undefined) applyToAllDevices('metaLineHeight', metaLh);
                                                    if (metaMb !== undefined) applyToAllDevices('metaMarginBottom', metaMb);
                                                    if (metaC !== undefined) applyToAllDevices('metaColor', metaC);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <div className="bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)] order-10">
                                                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Thumbnail</label>
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Lebar - {activeDeviceTab}</label>
                                                        <input
                                                            type="text"
                                                            placeholder="misal: 64px atau 16/9"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                            value={getConfigString("imageWidth")}
                                                            onChange={(e) => updateChildResponsiveConfig('imageWidth', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Tinggi - {activeDeviceTab}</label>
                                                        <input
                                                            type="text"
                                                            placeholder="misal: 64px atau 16/9"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                            value={getConfigString("imageHeight")}
                                                            onChange={(e) => updateChildResponsiveConfig('imageHeight', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius (px)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                        value={getResponsiveNumberInputValue("imageBorderRadius")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("imageBorderRadius", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("imageBorderRadius")}
                                                    />
                                                </div>
                                                <p className="text-[9px] text-[var(--fg-muted)] mt-2">Untuk rasio: isi salah satu field dengan 16/9 atau 16:9 (akan dipakai sebagai aspect ratio).</p>
                                            </div>

                                            <div className="bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)] order-20">
                                                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Nomor Ranking</label>
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Ukuran Font (px) - {activeDeviceTab}</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                            value={getResponsiveNumberInputValue("rankNumberFontSize")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("rankNumberFontSize", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("rankNumberFontSize")}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Ketebalan Font - {activeDeviceTab}</label>
                                                        <select
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                            value={getConfigString("rankNumberFontWeight", "extrabold")}
                                                            onChange={(e) => updateChildResponsiveConfig("rankNumberFontWeight", e.target.value)}
                                                        >
                                                            <option value="light">Tipis (Light - 300)</option>
                                                            <option value="normal">Normal (400)</option>
                                                            <option value="medium">Sedang (Medium - 500)</option>
                                                            <option value="semibold">Agak Tebal (Semibold - 600)</option>
                                                            <option value="bold">Tebal (Bold - 700)</option>
                                                            <option value="extrabold">Sangat Tebal (Extra Bold - 800)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Radius (px) - {activeDeviceTab}</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                            value={getResponsiveNumberInputValue("rankNumberBorderRadius")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("rankNumberBorderRadius", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("rankNumberBorderRadius")}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <ColorPicker
                                                        label="Warna Nomor"
                                                        configKey="rankNumberColor"
                                                        globalDefault={globalSettings?.homeMetaColor || globalSettings?.metaColor}
                                                        child={child}
                                                        getConfigValue={getConfigValue}
                                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                        updateChildConfig={updateChildConfig}
                                                    />
                                                    <ColorPicker
                                                        label="Warna Background"
                                                        configKey="rankNumberBgColor"
                                                        globalDefault={globalSettings?.primaryColor}
                                                        child={child}
                                                        getConfigValue={getConfigValue}
                                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                        updateChildConfig={updateChildConfig}
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)] order-30">
                                                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Judul Berita</label>
                                                <div className="grid grid-cols-2 gap-2 mb-2">
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Ukuran Font (px) - {activeDeviceTab}</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                            value={getResponsiveNumberInputValue("titleFontSize")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("titleFontSize", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("titleFontSize")}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Tinggi Baris - {activeDeviceTab}</label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                            value={getResponsiveNumberInputValue("titleLineHeight")}
                                                            onChange={(e) => {
                                                                handleResponsiveFloatInputChange("titleLineHeight", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveFloatDraft("titleLineHeight")}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Ketebalan Font - {activeDeviceTab}</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                        value={getConfigString("titleFontWeight", "semibold")}
                                                        onChange={(e) => updateChildResponsiveConfig("titleFontWeight", e.target.value)}
                                                    >
                                                        <option value="light">Tipis (Light - 300)</option>
                                                        <option value="normal">Normal (400)</option>
                                                        <option value="medium">Sedang (Medium - 500)</option>
                                                        <option value="semibold">Agak Tebal (Semibold - 600)</option>
                                                        <option value="bold">Tebal (Bold - 700)</option>
                                                        <option value="extrabold">Sangat Tebal (Extra Bold - 800)</option>
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <ColorPicker
                                                        label="Warna Judul"
                                                        configKey="titleColor"
                                                        globalDefault={globalSettings?.homeNewsTitleColor || globalSettings?.headingColor}
                                                        child={child}
                                                        getConfigValue={getConfigValue}
                                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                        updateChildConfig={updateChildConfig}
                                                    />
                                                    <ColorPicker
                                                        label="Hover Judul"
                                                        configKey="titleHoverColor"
                                                        globalDefault={globalSettings?.homeHoverColor || globalSettings?.primaryColor}
                                                        child={child}
                                                        getConfigValue={getConfigValue}
                                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                        updateChildConfig={updateChildConfig}
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                )}

                                {child.type === 'sidebar_widget' && isSidebarPostListType && (
                                    <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                        <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                            Elemen Konten Tambahan
                                        </h4>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Thumbnail</h5>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                        checked={getConfigBool("showThumbnail", true)}
                                                        onChange={(e) => updateChildResponsiveConfig("showThumbnail", e.target.checked)}
                                                    />
                                                    <span className="text-xs text-[var(--fg-primary)]">Tampilkan</span>
                                                </label>
                                            </div>

                                            <div className="border-t border-[var(--border)] pt-3">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Label Kategori</h5>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                            checked={getConfigBool("showCategory", true)}
                                                            onChange={(e) => updateChildResponsiveConfig("showCategory", e.target.checked)}
                                                        />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan</span>
                                                    </label>
                                                </div>
                                                {getConfigBool("showCategory", true) && (
                                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Ukuran Font (px) - {activeDeviceTab}</label>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                                value={getResponsiveNumberInputValue("categoryLabelFontSize")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("categoryLabelFontSize", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("categoryLabelFontSize")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Tinggi Baris - {activeDeviceTab}</label>
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                                value={getResponsiveNumberInputValue("categoryLabelLineHeight")}
                                                                onChange={(e) => {
                                                                    handleResponsiveFloatInputChange("categoryLabelLineHeight", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveFloatDraft("categoryLabelLineHeight")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Kiri & Kanan (px) - {activeDeviceTab}</label>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                                value={getResponsiveNumberInputValue("categoryLabelPaddingX")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("categoryLabelPaddingX", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("categoryLabelPaddingX")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Atas & Bawah (px) - {activeDeviceTab}</label>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                                value={getResponsiveNumberInputValue("categoryLabelPaddingY")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("categoryLabelPaddingY", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("categoryLabelPaddingY")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius (px) - {activeDeviceTab}</label>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                                value={getResponsiveNumberInputValue("categoryLabelBorderRadius")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("categoryLabelBorderRadius", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("categoryLabelBorderRadius")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Margin Bottom (px) - {activeDeviceTab}</label>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                                value={getResponsiveNumberInputValue("categoryLabelMarginBottom")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("categoryLabelMarginBottom", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("categoryLabelMarginBottom")}
                                                            />
                                                        </div>
                                                        <ColorPicker
                                                            label="Warna Teks"
                                                            configKey="categoryLabelColor"
                                                            globalDefault={globalSettings?.primaryColor}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                        <ColorPicker
                                                            label="Background"
                                                            configKey="categoryLabelBgColor"
                                                            globalDefault="transparent"
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="border-t border-[var(--border)] pt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Meta Data (Author & Tanggal)</h5>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                            checked={getConfigBool("showMetaInfo", true)}
                                                            onChange={(e) => updateChildResponsiveConfig("showMetaInfo", e.target.checked)}
                                                        />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan</span>
                                                    </label>
                                                </div>
                                                {getConfigBool("showMetaInfo", true) && (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-6 mb-2">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                                    checked={getConfigBool("showAuthor", true)}
                                                                    onChange={(e) => updateChildResponsiveConfig("showAuthor", e.target.checked)}
                                                                />
                                                                <span className="text-xs text-[var(--fg-primary)]">Author</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                                    checked={getConfigBool("showDate", true)}
                                                                    onChange={(e) => updateChildResponsiveConfig("showDate", e.target.checked)}
                                                                />
                                                                <span className="text-xs text-[var(--fg-primary)]">Tanggal</span>
                                                            </label>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Ukuran Font (px) - {activeDeviceTab}</label>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                                    value={getResponsiveNumberInputValue("metaFontSize")}
                                                                    onChange={(e) => {
                                                                        handleResponsiveIntegerInputChange("metaFontSize", e.target.value);
                                                                    }}
                                                                    onBlur={() => clearResponsiveIntegerDraft("metaFontSize")}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Tinggi Baris - {activeDeviceTab}</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.1"
                                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                                    value={getResponsiveNumberInputValue("metaLineHeight")}
                                                                    onChange={(e) => {
                                                                        handleResponsiveFloatInputChange("metaLineHeight", e.target.value);
                                                                    }}
                                                                    onBlur={() => clearResponsiveFloatDraft("metaLineHeight")}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Margin Bottom (px) - {activeDeviceTab}</label>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                                    value={getResponsiveNumberInputValue("metaMarginBottom")}
                                                                    onChange={(e) => {
                                                                        handleResponsiveIntegerInputChange("metaMarginBottom", e.target.value);
                                                                    }}
                                                                    onBlur={() => clearResponsiveIntegerDraft("metaMarginBottom")}
                                                                />
                                                            </div>
                                                            <ColorPicker
                                                                label="Warna Teks"
                                                                configKey="metaColor"
                                                                globalDefault={globalSettings?.homeMetaColor || globalSettings?.metaColor}
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(child.type === 'news_list' || child.type === 'archive_post_list') && (
                                    <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-6">
                                        <div className="flex justify-between items-center mb-3">
                                            <div>
                                                <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-2 flex items-center gap-2">
                                                    <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                                                    Simple List
                                                </h4>
                                                <p className="text-[9px] text-[var(--fg-muted)] mt-0.5">Pengaturan gambar utama, area teks, dan judul item berita.</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const showImage = getConfigForApply("showImage");
                                                    const w = getConfigForApply("imageWidth");
                                                    const h = getConfigForApply("imageHeight");
                                                    const r = getConfigForApply("imageBorderRadius");
                                                    const titleMb = getConfigForApply("titleMarginBottom");
                                                    const cpTop = getConfigForApply("contentPaddingTop");
                                                    const cpRight = getConfigForApply("contentPaddingRight");
                                                    const cpBottom = getConfigForApply("contentPaddingBottom");
                                                    const cpLeft = getConfigForApply("contentPaddingLeft");
                                                    const showDivider = getConfigForApply("showDivider");
                                                    const dividerColor = getConfigForApply("dividerColor");
                                                    const dividerThickness = getConfigForApply("dividerThickness");
                                                    const fs = getConfigForApply("titleFontSize");
                                                    const lh = getConfigForApply("titleLineHeight");
                                                    const fw = getConfigForApply("titleFontWeight");
                                                    const tc = getConfigForApply("titleColor");
                                                    const thc = getConfigForApply("titleHoverColor");
                                                    if (showImage !== undefined) applyToAllDevices('showImage', showImage);
                                                    if (w !== undefined) applyToAllDevices('imageWidth', w);
                                                    if (h !== undefined) applyToAllDevices('imageHeight', h);
                                                    if (r !== undefined) applyToAllDevices('imageBorderRadius', r);
                                                    if (titleMb !== undefined) applyToAllDevices('titleMarginBottom', titleMb);
                                                    if (cpTop !== undefined) applyToAllDevices('contentPaddingTop', cpTop);
                                                    if (cpRight !== undefined) applyToAllDevices('contentPaddingRight', cpRight);
                                                    if (cpBottom !== undefined) applyToAllDevices('contentPaddingBottom', cpBottom);
                                                    if (cpLeft !== undefined) applyToAllDevices('contentPaddingLeft', cpLeft);
                                                    if (showDivider !== undefined) applyToAllDevices('showDivider', showDivider);
                                                    if (dividerColor !== undefined) applyToAllDevices('dividerColor', dividerColor);
                                                    if (dividerThickness !== undefined) applyToAllDevices('dividerThickness', dividerThickness);
                                                    if (fs !== undefined) applyToAllDevices('titleFontSize', fs);
                                                    if (lh !== undefined) applyToAllDevices('titleLineHeight', lh);
                                                    if (fw !== undefined) applyToAllDevices('titleFontWeight', fw);
                                                    if (tc !== undefined) applyToAllDevices('titleColor', tc);
                                                    if (thc !== undefined) applyToAllDevices('titleHoverColor', thc);
                                                }}
                                                className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                title="Terapkan ke semua device"
                                            >
                                                <Copy size={10} /> Semua
                                            </button>
                                        </div>

                                        <div className="bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)] mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-[10px] font-bold text-[var(--fg-primary)] uppercase tracking-wider block">Gambar Utama</label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                        checked={getConfigBool("showImage", true)}
                                                        onChange={(e) => updateChildResponsiveConfig("showImage", e.target.checked)}
                                                    />
                                                    <span className="text-[10px] font-medium text-[var(--accent)]">Tampilkan</span>
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Lebar Gambar - {activeDeviceTab}</label>
                                                    <input
                                                        type="text"
                                                        placeholder="misal: 96px atau 16/9"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                        value={getConfigString("imageWidth")}
                                                        onChange={(e) => updateChildResponsiveConfig('imageWidth', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Tinggi Gambar - {activeDeviceTab}</label>
                                                    <input
                                                        type="text"
                                                        placeholder="misal: 96px atau 16/9"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                        value={getConfigString("imageHeight")}
                                                        onChange={(e) => updateChildResponsiveConfig('imageHeight', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius Gambar (px)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                    value={getResponsiveNumberInputValue("imageBorderRadius")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("imageBorderRadius", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("imageBorderRadius")}
                                                />
                                            </div>
                                            <p className="text-[9px] text-[var(--fg-muted)] mt-2">Untuk rasio: isi salah satu field dengan 16/9 atau 16:9 (akan dipakai sebagai aspect ratio).</p>
                                        </div>

                                        <div className="bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)]">
                                            <label className="text-[10px] font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Judul Berita</label>

                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Ukuran Font (px) - {activeDeviceTab}</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                    value={getResponsiveNumberInputValue("titleFontSize")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("titleFontSize", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("titleFontSize")}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Tinggi Baris - {activeDeviceTab}</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                    value={getResponsiveNumberInputValue("titleLineHeight")}
                                                    onChange={(e) => {
                                                        handleResponsiveFloatInputChange("titleLineHeight", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveFloatDraft("titleLineHeight")}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="text-[10px] font-medium text-[var(--fg-primary)] block mb-1">Ketebalan Font</label>
                                                <select
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none text-[var(--fg-primary)]"
                                                    value={getConfigString("titleFontWeight", "semibold")}
                                                    onChange={(e) => updateChildResponsiveConfig('titleFontWeight', e.target.value)}
                                                >
                                                    <option value="light">Tipis (Light - 300)</option>
                                                    <option value="normal">Normal (400)</option>
                                                    <option value="medium">Sedang (Medium - 500)</option>
                                                    <option value="semibold">Agak Tebal (Semibold - 600)</option>
                                                    <option value="bold">Tebal (Bold - 700)</option>
                                                    <option value="extrabold">Sangat Tebal (Extra Bold - 800)</option>
                                                </select>
                                            </div>

                                            <div className="mb-3">
                                                <label className="text-[10px] font-medium text-[var(--fg-primary)] block mb-1">Margin Bawah Judul (px)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-[10px] outline-none h-8"
                                                    value={getResponsiveNumberInputValue("titleMarginBottom")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("titleMarginBottom", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("titleMarginBottom")}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <ColorPicker
                                                    label="Warna Judul"
                                                    configKey="titleColor"
                                                    globalDefault={globalSettings?.homeNewsTitleColor || globalSettings?.headingColor}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <ColorPicker
                                                    label="Hover Judul"
                                                    configKey="titleHoverColor"
                                                    globalDefault={globalSettings?.homeHoverColor || globalSettings?.primaryColor}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)] mt-4">
                                            <label className="text-[10px] font-bold text-[var(--fg-primary)] uppercase tracking-wider block mb-2">Area Teks</label>
                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Padding Area Teks (Atas, Kanan, Bawah, Kiri)</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[
                                                    { key: "contentPaddingTop", placeholder: "Atas" },
                                                    { key: "contentPaddingRight", placeholder: "Kanan" },
                                                    { key: "contentPaddingBottom", placeholder: "Bawah" },
                                                    { key: "contentPaddingLeft", placeholder: "Kiri" },
                                                ].map((item) => (
                                                    <input
                                                        key={item.key}
                                                        type="number"
                                                        placeholder={item.placeholder}
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center"
                                                        value={getResponsiveNumberInputValue(item.key)}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange(item.key, e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft(item.key)}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-[9px] text-[var(--fg-muted)] mt-2">Mengatur jarak antara area teks dengan batas item berita.</p>
                                        </div>

                                        <div className="bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)] mt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <label className="text-[10px] font-bold text-[var(--fg-primary)] block">Garis Antar Berita</label>
                                                    <p className="text-[9px] text-[var(--fg-muted)] mt-0.5">Atur tampilannya agar pemisah antar item lebih jelas dan konsisten.</p>
                                                </div>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                        checked={getConfigBool("showDivider", true)}
                                                        onChange={(e) => updateChildResponsiveConfig("showDivider", e.target.checked)}
                                                    />
                                                    <span className="text-[10px] font-medium text-[var(--accent)]">Tampilkan</span>
                                                </label>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 items-end">
                                                <ColorPicker
                                                    label="Warna Garis"
                                                    configKey="dividerColor"
                                                    globalDefault="#f3f4f6"
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ketebalan Garis (px)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-md py-1.5 px-2 text-xs outline-none focus:border-[var(--accent)]"
                                                        value={getResponsiveNumberInputValue("dividerThickness")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("dividerThickness", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("dividerThickness")}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {child.type !== 'news_list' && child.type !== 'archive_post_list' && child.type !== 'sidebar_widget' && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
                                        Wadah Utama (Container Widget)
                                    </h4>
                                    <p className="text-[10px] text-[var(--fg-muted)] mb-4 -mt-2">Mengatur kotak pembungkus paling luar dari widget ini.</p>
                                    
                                    {/* Margin & Padding */}
                                    <div className="mb-5">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-[var(--fg-primary)] flex items-center gap-1"><DeviceIcon size={14} /> Margin & Padding - {activeDeviceTab}</label>
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
                                        
                                        {/* Margin */}
                                        <div className="mb-3">
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Margin (Atas, Kanan, Bawah, Kiri)</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                        <input 
                                                            key={side}
                                                            type="number" 
                                                            placeholder={getSideLabel(side)}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue(`margin${side}`)}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange(`margin${side}`, e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft(`margin${side}`)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Padding */}
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Padding (Atas, Kanan, Bawah, Kiri)</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['Top', 'Right', 'Bottom', 'Left'].map((side) => (
                                                        <input 
                                                            key={side}
                                                            type="number" 
                                                            placeholder={getSideLabel(side)}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue(`padding${side}`)}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange(`padding${side}`, e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft(`padding${side}`)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                    {/* C. Background & Frame Container */}
                                    <div className="border-t border-[var(--border)] pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <label className="text-xs font-bold text-[var(--fg-primary)] block">Wadah Latar Belakang</label>
                                                <p className="text-[9px] text-[var(--fg-muted)] font-normal">{child.type === 'news_bullet_list' ? 'Warna latar belakang untuk seluruh area widget.' : 'Warna/Gambar latar belakang untuk seluruh area widget.'}</p>
                                            </div>
                                            <label className="relative inline-block w-8 h-4 align-middle select-none cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                                    style={{ 
                                                        right: getConfigBool("useBox") ? '0' : 'auto', 
                                                        left: getConfigBool("useBox") ? 'auto' : '0', 
                                                        borderColor: getConfigBool("useBox") ? 'var(--accent)' : 'var(--border)' 
                                                    }}
                                                    checked={getConfigBool("useBox")}
                                                    onChange={(e) => updateChildResponsiveConfig("useBox", e.target.checked)}
                                                />
                                                <span className={`toggle-label block overflow-hidden h-4 rounded-full cursor-pointer ${getConfigBool("useBox") ? 'bg-[var(--accent)]' : 'bg-[var(--bg-muted)]'}`}></span>
                                            </label>
                                        </div>
                                        
                                        {getConfigBool("useBox") && (
                                            <div className="space-y-3 animate-fade-in-down bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)]">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[9px] text-[var(--fg-primary)] block mb-1">Warna Background</label>
                                                        <div className="flex items-center gap-1">
                                                            <input type="color" value={getConfigString("boxColor", "#ffffff")} onChange={(e) => updateChildResponsiveConfig("boxColor", e.target.value)} onPointerDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="w-6 h-6 rounded border cursor-pointer"/>
                                                            <input type="text" value={getConfigString("boxColor")} onChange={(e) => updateChildResponsiveConfig("boxColor", e.target.value)} className="flex-1 min-w-0 bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1 text-[10px] text-[var(--fg-primary)]" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] text-[var(--fg-primary)] block mb-1">Radius Container</label>
                                                        <select className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] text-[var(--fg-primary)]" value={getConfigString("boxBorderRadius", "default")} onChange={(e) => updateChildResponsiveConfig("boxBorderRadius", e.target.value)}>
                                                            <option value="default">Global Bawaan</option>
                                                            <option value="none">Kotak (0px)</option>
                                                            <option value="sm">Kecil</option>
                                                            <option value="md">Sedang</option>
                                                            <option value="lg">Besar</option>
                                                            <option value="xl">XL</option>
                                                            <option value="2xl">2XL</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                {child.type !== 'news_bullet_list' && (
                                                    <div>
                                                        <label className="text-[9px] text-[var(--fg-primary)] block mb-1">Gambar Background (URL)</label>
                                                        <div className="flex gap-2">
                                                            <input type="text" className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] text-[var(--fg-primary)]" value={getConfigString("backgroundImage")} onChange={(e) => updateChildResponsiveConfig("backgroundImage", e.target.value)} placeholder="https://..." />
                                                            <label className="cursor-pointer bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 hover:bg-[var(--bg-muted)]">
                                                                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                                                                <Upload size={14} className="text-[var(--fg-primary)]" />
                                                            </label>
                                                        </div>
                                                        {getConfigString("backgroundImage") && (
                                                            <div className="mt-2 relative w-full h-16 bg-gray-100 rounded overflow-hidden border border-gray-200 group">
                                                                <Image src={getConfigString("backgroundImage")} alt="Bg" fill unoptimized className="w-full h-full object-cover" />
                                                                <button onClick={() => updateChildResponsiveConfig("backgroundImage", "")} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                )}
                                </>
                            )}

                            {/* News Grid Layout (Column & Gap) - Only for Grid */}
                            {child.type === 'news_grid' && (
                                <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-6">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                        Layout Grid (Kolom & Gap) - {activeDeviceTab}
                                    </h4>
                                    
                                    {/* Columns */}
                                    <div className="mb-4">
                                        <label className="text-[10px] font-medium text-[var(--fg-primary)] block mb-1">Jumlah Kolom</label>
                                        <select
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                            value={getConfigString("gridColumns", String(activeDeviceTab === 'mobile' ? 1 : activeDeviceTab === 'tablet' ? 2 : 3))}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                updateChildResponsiveConfig("gridColumns", isNaN(val) ? undefined : val);
                                            }}
                                        >
                                            <option value={1}>1 Kolom</option>
                                            <option value={2}>2 Kolom</option>
                                            <option value={3}>3 Kolom</option>
                                            <option value={4}>4 Kolom</option>
                                            <option value={5}>5 Kolom</option>
                                        </select>
                                    </div>

                                    {/* Gaps */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-medium text-[var(--fg-primary)] block mb-1">Jarak Horizontal (Gap X)</label>
                                            <input 
                                                type="number" 
                                                placeholder="Default (8)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                value={getResponsiveNumberInputValue("gridGapX")}
                                                onChange={(e) => {
                                                    handleResponsiveIntegerInputChange("gridGapX", e.target.value);
                                                }}
                                                onBlur={() => clearResponsiveIntegerDraft("gridGapX")}
                                            />
                                            <p className="text-[9px] text-[var(--fg-muted)] mt-1">Satuan: 1 = 4px (8 = 32px)</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-medium text-[var(--fg-primary)] block mb-1">Jarak Vertikal (Gap Y)</label>
                                            <input 
                                                type="number" 
                                                placeholder="Default (8)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                value={getResponsiveNumberInputValue("gridGapY")}
                                                onChange={(e) => {
                                                    handleResponsiveIntegerInputChange("gridGapY", e.target.value);
                                                }}
                                                onBlur={() => clearResponsiveIntegerDraft("gridGapY")}
                                            />
                                            <p className="text-[9px] text-[var(--fg-muted)] mt-1">Satuan: 1 = 4px</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- SECTION 2: GAYA KARTU (CARD STYLE) --- */}
                            {(child.type === 'news_grid' || child.type === 'news_list_highlight' || child.type === 'news_headline_big') && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                                        {child.type === 'news_headline_big' ? 'Media & Konten Utama' : 'Gaya Kartu Berita (Individual Card)'}
                                    </h4>
                                    <p className="text-[10px] text-[var(--fg-muted)] mb-4 -mt-2">
                                        {child.type === 'news_headline_big'
                                            ? 'Mengatur gambar utama dan konten utama pada widget Headline Big.'
                                            : 'Mengatur tampilan masing-masing kotak berita (card).'}
                                    </p>
                                    
                                    <>
                                    <div className="mb-5 bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)]">
                                        {child.type === 'news_headline_big' ? (
                                            <>
                                                <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-2">
                                                    {`Tinggi Gambar Utama (${activeDeviceTab})`}
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="Contoh: 440"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                    value={getResponsiveNumberInputValue("imageHeight")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("imageHeight", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("imageHeight")}
                                                />
                                                <p className="text-[9px] text-[var(--fg-muted)] mt-1">Satuan: px</p>
                                            </>
                                        ) : child.type === 'news_grid' ? (
                                            <>
                                                <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-2">
                                                    {`Tinggi Gambar Utama (${activeDeviceTab})`}
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="Contoh: 180"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                    value={getResponsiveNumberInputValue("imageHeight")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("imageHeight", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("imageHeight")}
                                                />
                                                <p className="text-[9px] text-[var(--fg-muted)] mt-1">Satuan: px</p>
                                            </>
                                        ) : (
                                            <>
                                                <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-2">
                                                    {`Ukuran Gambar (${activeDeviceTab})`}
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Lebar (contoh: 100% atau 300px)"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                        value={getConfigString(child.type === 'news_list_highlight' ? 'listImageWidth' : 'imageWidth')}
                                                        onChange={(e) => updateChildResponsiveConfig(child.type === 'news_list_highlight' ? 'listImageWidth' : 'imageWidth', e.target.value)}
                                                    />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Tinggi (contoh: 200px)"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                        value={getConfigString(child.type === 'news_list_highlight' ? 'listImageHeight' : 'imageHeight')}
                                                        onChange={(e) => updateChildResponsiveConfig(child.type === 'news_list_highlight' ? 'listImageHeight' : 'imageHeight', e.target.value)}
                                                    />
                                                </div>
                                            </>
                                        )}
                                        {child.type === 'news_headline_big' && (
                                            <div className="mt-3 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Margin Atas Judul (px)</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue("titleMarginTop")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("titleMarginTop", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("titleMarginTop")}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Margin Bawah Judul (px)</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue("titleMarginBottom")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("titleMarginBottom", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("titleMarginBottom")}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="border-t border-[var(--border)] pt-3">
                                                    <label className="text-[10px] font-bold text-[var(--fg-primary)] flex items-center gap-1 mb-2"><DeviceIcon size={12} /> Gaya Konten Teks (Inside Card) - {activeDeviceTab}</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input
                                                            type="number"
                                                            placeholder="Ukuran Judul (px)"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue("titleFontSize")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("titleFontSize", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("titleFontSize")}
                                                        />
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                placeholder="Tinggi Baris"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue("titleLineHeight")}
                                                            onChange={(e) => {
                                                                handleResponsiveFloatInputChange("titleLineHeight", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveFloatDraft("titleLineHeight")}
                                                        />
                                                    </div>
                                                    <div className="mt-3">
                                                        <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-1">Ketebalan Font</label>
                                                        <select
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                            value={getConfigString("titleFontWeight", "normal")}
                                                            onChange={(e) => updateChildResponsiveConfig("titleFontWeight", e.target.value)}
                                                        >
                                                            <option value="light">Tipis (Light - 300)</option>
                                                            <option value="normal">Normal (400)</option>
                                                            <option value="medium">Sedang (Medium - 500)</option>
                                                            <option value="semibold">Agak Tebal (Semibold - 600)</option>
                                                            <option value="bold">Tebal (Bold - 700)</option>
                                                            <option value="extrabold">Sangat Tebal (Extra Bold - 800)</option>
                                                        </select>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                                        <ColorPicker
                                                            label="Warna Judul"
                                                            configKey="titleColor"
                                                            globalDefault={globalSettings?.homeNewsTitleColor || globalSettings?.headingColor}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                        <ColorPicker
                                                            label="Hover Judul"
                                                            configKey="titleHoverColor"
                                                            globalDefault={globalSettings?.homeHoverColor || globalSettings?.primaryColor}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {child.type !== 'news_headline_big' && child.type !== 'news_grid' && (
                                            <p className="text-[9px] text-[var(--fg-muted)] mt-1">Masukkan rasio (misal: 16/9) atau dimensi pixel.</p>
                                        )}
                                    </div>

                                    {(child.type === 'news_grid' || child.type === 'news_list_highlight') && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-1">Radius Sudut Kartu</label>
                                            <input 
                                                type="number" 
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                placeholder="Default: 12"
                                                value={getResponsiveNumberInputValue("gridBoxBorderRadius")}
                                                onChange={(e) => {
                                                    handleResponsiveIntegerInputChange("gridBoxBorderRadius", e.target.value);
                                                }}
                                                onBlur={() => clearResponsiveIntegerDraft("gridBoxBorderRadius")}
                                            />
                                            <p className="text-[9px] text-[var(--fg-muted)] mt-1">Lengkungan sudut kartu.</p>
                                        </div>
                                        <div>
                                            <ColorPicker 
                                                label="Warna Background Kartu" 
                                                configKey="gridBoxColor" 
                                                globalDefault="#ffffff" 
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <p className="text-[9px] text-[var(--fg-muted)] mt-1">Warna background seluruh kartu.</p>
                                        </div>
                                    </div>
                                    )}
                                    </>
                                </div>
                            )}

                            {/* --- SECTION 3: GAYA KONTEN TEKS (CONTENT STYLE) --- */}
                            {(child.type === 'news_grid' || child.type === 'news_list_highlight' || child.type === 'news_bullet_list') && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                                        {child.type === 'news_bullet_list' ? 'Judul Item & Bullet Marker' : 'Gaya Konten Teks (Inside Card)'}
                                    </h4>
                                    <p className="text-[10px] text-[var(--fg-muted)] mb-4 -mt-2">
                                        {child.type === 'news_bullet_list'
                                            ? 'Mengatur tipografi judul item dan warna bullet marker.'
                                            : 'Mengatur area teks (judul/excerpt) di dalam kartu.'}
                                    </p>
                                    
                                    {/* Title Typography (Moved Here) */}
                                    <div className="bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)] mb-5">
                                        {child.type === 'news_bullet_list' ? (
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-[10px] font-bold text-[var(--fg-primary)] flex items-center gap-1"><DeviceIcon size={12} /> Judul Item & Bullet - {activeDeviceTab}</label>
                                                <button
                                                    onClick={() => {
                                                        const titleSize = getConfigForApply("titleFontSize");
                                                        const titleLh = getConfigForApply("titleLineHeight");
                                                        const titleFw = getConfigForApply("titleFontWeight");
                                                        const titleColor = getConfigForApply("titleColor");
                                                        const titleHover = getConfigForApply("titleHoverColor");
                                                        const bulletColor = getConfigForApply("bulletColor");
                                                        const bulletSize = getConfigForApply("bulletSize");
                                                        if (titleSize !== undefined) applyToAllDevices("titleFontSize", titleSize);
                                                        if (titleLh !== undefined) applyToAllDevices("titleLineHeight", titleLh);
                                                        if (titleFw !== undefined) applyToAllDevices("titleFontWeight", titleFw);
                                                        if (titleColor !== undefined) applyToAllDevices("titleColor", titleColor);
                                                        if (titleHover !== undefined) applyToAllDevices("titleHoverColor", titleHover);
                                                        if (bulletColor !== undefined) applyToAllDevices("bulletColor", bulletColor);
                                                        if (bulletSize !== undefined) applyToAllDevices("bulletSize", bulletSize);
                                                    }}
                                                    className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
                                                    title="Terapkan pengaturan judul item dan bullet ke semua device"
                                                >
                                                    <Copy size={10} /> Semua
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="text-[10px] font-bold text-[var(--fg-primary)] flex items-center gap-1 mb-2"><DeviceIcon size={12} /> Ukuran Judul Konten (px) - {activeDeviceTab}</label>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            <input 
                                                type="number" 
                                                placeholder="Ukuran (contoh: 18)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                value={getResponsiveNumberInputValue(child.type === 'news_list_highlight' ? 'listTitleFontSize' : 'titleFontSize')}
                                                onChange={(e) => {
                                                    handleResponsiveIntegerInputChange(child.type === 'news_list_highlight' ? 'listTitleFontSize' : 'titleFontSize', e.target.value);
                                                }}
                                                onBlur={() => clearResponsiveIntegerDraft(child.type === 'news_list_highlight' ? 'listTitleFontSize' : 'titleFontSize')}
                                            />
                                            <input 
                                                type="number" 
                                                step="0.1"
                                                placeholder="Tinggi Baris (contoh: 1.5)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                value={getResponsiveNumberInputValue(child.type === 'news_list_highlight' ? 'listTitleLineHeight' : 'titleLineHeight')}
                                                onChange={(e) => {
                                                    handleResponsiveFloatInputChange(child.type === 'news_list_highlight' ? 'listTitleLineHeight' : 'titleLineHeight', e.target.value);
                                                }}
                                                onBlur={() => clearResponsiveFloatDraft(child.type === 'news_list_highlight' ? 'listTitleLineHeight' : 'titleLineHeight')}
                                            />
                                        </div>
                                        
                                        {/* Font Weight Setting */}
                                        <div className="mt-3">
                                            <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-1">Ketebalan Font</label>
                                            <select 
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                value={getConfigString(child.type === 'news_list_highlight' ? 'listTitleFontWeight' : 'titleFontWeight', "normal")}
                                                onChange={(e) => updateChildResponsiveConfig(child.type === 'news_list_highlight' ? 'listTitleFontWeight' : 'titleFontWeight', e.target.value)}
                                            >
                                                <option value="light">Tipis (Light - 300)</option>
                                                <option value="normal">Normal (400)</option>
                                                <option value="medium">Sedang (Medium - 500)</option>
                                                <option value="semibold">Agak Tebal (Semibold - 600)</option>
                                                <option value="bold">Tebal (Bold - 700)</option>
                                                <option value="extrabold">Sangat Tebal (Extra Bold - 800)</option>
                                            </select>
                                        </div>
                                        {child.type === 'news_bullet_list' && (
                                            <div className="grid grid-cols-2 gap-3 mt-3">
                                                <div>
                                                    <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-1">Ukuran Bullet (px)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Contoh: 16"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                        value={getResponsiveNumberInputValue("bulletSize")}
                                                        onChange={(e) => {
                                                            handleResponsiveFloatInputChange("bulletSize", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveFloatDraft("bulletSize")}
                                                    />
                                                    <p className="text-[9px] text-[var(--fg-muted)] mt-1">Mengatur besar kecil marker bullet pada tiap item.</p>
                                                </div>
                                                <ColorPicker
                                                    label="Warna Judul"
                                                    configKey="titleColor"
                                                    globalDefault={globalSettings?.homeNewsTitleColor || globalSettings?.headingColor}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <ColorPicker
                                                    label="Hover Judul"
                                                    configKey="titleHoverColor"
                                                    globalDefault={globalSettings?.homeHoverColor || globalSettings?.primaryColor}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <ColorPicker
                                                    label="Warna Bullet"
                                                    configKey="bulletColor"
                                                    globalDefault={globalSettings?.primaryColor || "var(--accent)"}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {child.type === 'news_grid' && (
                                    <>
                                    <div className="mb-4">
                                        <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-1">Padding Area Teks (px)</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                            placeholder="Default: 12"
                                            value={getResponsiveNumberInputValue("contentPadding")}
                                            onChange={(e) => {
                                                handleResponsiveIntegerInputChange("contentPadding", e.target.value);
                                            }}
                                            onBlur={() => clearResponsiveIntegerDraft("contentPadding")}
                                        />
                                        <p className="text-[9px] text-[var(--fg-muted)] mt-1">Jarak antara tepi kartu/gambar dengan teks judul.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[var(--border)]">
                                        <div>
                                            <ColorPicker 
                                                label="Warna Background Teks" 
                                                configKey="backgroundColor" 
                                                globalDefault="#ffffff" 
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <p className="text-[9px] text-[var(--fg-muted)] mt-1">Warna background di area teks saja.</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-[var(--fg-primary)] block mb-1">Radius Latar Teks</label>
                                            <input 
                                                type="number" 
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                placeholder="Default: 0"
                                                value={getResponsiveNumberInputValue("borderRadius")}
                                                onChange={(e) => {
                                                    handleResponsiveIntegerInputChange("borderRadius", e.target.value);
                                                }}
                                                onBlur={() => clearResponsiveIntegerDraft("borderRadius")}
                                            />
                                        </div>
                                    </div>
                                    </>
                                    )}
                                </div>
                            )}

                            {/* --- SECTIONS 4-7: KONTEN TAMBAHAN (META, EXCERPT, READ MORE, CATEGORY) --- */}
                            {(child.type === 'news_grid' || child.type === 'news_grid_slider' || child.type === 'news_hero_slider' || child.type === 'news_list_highlight' || child.type === 'news_list' || child.type === 'archive_post_list' || child.type === 'news_slider' || child.type === 'news_headline_big') && (
                                <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                    <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                        Elemen Konten Tambahan
                                    </h4>
                                    {(child.type === 'news_grid_slider' || child.type === 'news_hero_slider') ? (
                                        <>
                                            <div className="border-t border-[var(--border)] pt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Meta Data (Author & Tanggal)</h5>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showMetaInfo", true)} onChange={(e) => updateChildResponsiveConfig("showMetaInfo", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan</span>
                                                    </label>
                                                </div>
                                                {getConfigBool("showMetaInfo", true) && (
                                                    <>
                                                        <div className="flex items-center gap-6 mb-2">
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showAuthor", true)} onChange={(e) => updateChildResponsiveConfig("showAuthor", e.target.checked)} />
                                                                <span className="text-xs text-[var(--fg-primary)]">Author</span>
                                                            </label>
                                                            <label className="flex items-center gap-2 cursor-pointer">
                                                                <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showDate", true)} onChange={(e) => updateChildResponsiveConfig("showDate", e.target.checked)} />
                                                                <span className="text-xs text-[var(--fg-primary)]">Tanggal</span>
                                                            </label>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <ColorPicker
                                                                label="Warna Meta"
                                                                configKey="metaColor"
                                                                globalDefault={globalSettings?.homeMetaColor || globalSettings?.metaColor}
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                            <div>
                                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Size (px)</label>
                                                                <input type="number" className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("metaFontSize")} onChange={(e) => { handleResponsiveIntegerInputChange("metaFontSize", e.target.value); }} onBlur={() => clearResponsiveIntegerDraft("metaFontSize")} />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="border-t border-[var(--border)] pt-3 mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Excerpt (Ringkasan)</h5>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showExcerpt", true)} onChange={(e) => updateChildResponsiveConfig("showExcerpt", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan</span>
                                                    </label>
                                                </div>
                                                {getConfigBool("showExcerpt", true) && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Panjang Excerpt</label>
                                                            <input type="number" min={20} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getGlobalNumberInputValue("excerptLength")} onChange={(e) => { handleGlobalIntegerInputChange("excerptLength", e.target.value); }} onBlur={() => clearGlobalIntegerDraft("excerptLength", 20)} />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Size (px)</label>
                                                            <input type="number" min={10} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("excerptFontSize")} onChange={(e) => { handleResponsiveIntegerInputChange("excerptFontSize", e.target.value); }} onBlur={() => clearResponsiveIntegerDraft("excerptFontSize", 10)} />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Tinggi Baris</label>
                                                            <input type="number" step="0.1" min={1} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("excerptLineHeight")} onChange={(e) => { handleResponsiveFloatInputChange("excerptLineHeight", e.target.value); }} onBlur={() => clearResponsiveFloatDraft("excerptLineHeight", 1)} />
                                                        </div>
                                                        <ColorPicker
                                                            label="Warna Excerpt"
                                                            configKey="excerptColor"
                                                            globalDefault={globalSettings?.homeExcerptColor || globalSettings?.excerptColor}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="border-t border-[var(--border)] pt-3 mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="text-sm font-semibold text-[var(--fg-primary)]">Label Kategori</h5>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" checked={getConfigBool("showCategory", true)} onChange={(e) => updateChildResponsiveConfig("showCategory", e.target.checked)} />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tampilkan</span>
                                                    </label>
                                                </div>
                                                {getConfigBool("showCategory", true) && (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1">Size (px)</label>
                                                            <input type="number" min={8} className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-primary)] rounded-lg p-2 text-xs focus:border-[var(--accent)] outline-none" value={getResponsiveNumberInputValue("categoryLabelFontSize")} onChange={(e) => { handleResponsiveIntegerInputChange("categoryLabelFontSize", e.target.value); }} onBlur={() => clearResponsiveIntegerDraft("categoryLabelFontSize", 8)} />
                                                        </div>
                                                        <ColorPicker
                                                            label="Warna Teks"
                                                            configKey="categoryLabelColor"
                                                            globalDefault="#ffffff"
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                        <ColorPicker
                                                            label="Warna Background"
                                                            configKey="categoryLabelBgColor"
                                                            globalDefault={globalSettings?.primaryColor}
                                                            child={child}
                                                            getConfigValue={getConfigValue}
                                                            updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                            updateChildConfig={updateChildConfig}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                    
                                    {/* 4. Meta Data */}
                                    <div className="mb-5">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-[var(--fg-primary)]">Meta Data (Author & Tanggal)</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                    checked={getConfigBool("showMetaInfo", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showMetaInfo", e.target.checked)}
                                                />
                                                <span className="text-xs font-medium text-[var(--accent)]">Tampilkan</span>
                                            </label>
                                        </div>
                                        {getConfigBool("showMetaInfo", true) && (
                                            <>
                                                <div className="flex gap-4 mb-3">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                            checked={getConfigBool("showAuthor", true)} 
                                                            onChange={(e) => updateChildResponsiveConfig("showAuthor", e.target.checked)}
                                                        />
                                                        <span className="text-xs text-[var(--fg-primary)]">Author</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                            checked={getConfigBool("showDate", true)} 
                                                            onChange={(e) => updateChildResponsiveConfig("showDate", e.target.checked)}
                                                        />
                                                        <span className="text-xs text-[var(--fg-primary)]">Tanggal</span>
                                                    </label>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <ColorPicker 
                                                        label="Warna Meta" 
                                                        configKey="metaColor" 
                                                        globalDefault={globalSettings?.homeMetaColor || globalSettings?.metaColor} 
                                                        child={child}
                                                        getConfigValue={getConfigValue}
                                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                        updateChildConfig={updateChildConfig}
                                                    />
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Size (px)</label>
                                                        <input 
                                                            type="number" 
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue("metaFontSize")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("metaFontSize", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("metaFontSize")}
                                                        />
                                                    </div>
                                                </div>
                                                {child.type === 'news_headline_big' && (
                                                    <div className="mt-2">
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Margin Bawah Meta (px)</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue("metaMarginBottom")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("metaMarginBottom", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("metaMarginBottom")}
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* 5. Excerpt */}
                                    <div className="mb-5 border-t border-[var(--border)] pt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-[var(--fg-primary)]">Excerpt (Ringkasan)</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                    checked={getConfigBool("showExcerpt", false)}
                                                    onChange={(e) => updateChildResponsiveConfig("showExcerpt", e.target.checked)}
                                                />
                                                <span className="text-xs font-medium text-[var(--accent)]">Tampilkan</span>
                                            </label>
                                        </div>
                                        {getConfigBool("showExcerpt", false) && (
                                            <div className="space-y-3 animate-fade-in-down">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Panjang Karakter</label>
                                                    <input 
                                                        type="number" 
                                                        placeholder="Default: 100"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                        value={getResponsiveNumberInputValue("excerptLength")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("excerptLength", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("excerptLength")}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <ColorPicker 
                                                        label="Warna Teks" 
                                                        configKey="excerptColor" 
                                                        globalDefault={globalSettings?.homeExcerptColor || globalSettings?.excerptColor} 
                                                        child={child}
                                                        getConfigValue={getConfigValue}
                                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                        updateChildConfig={updateChildConfig}
                                                    />
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Size (px)</label>
                                                        <input 
                                                        type="number" 
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                        value={getResponsiveNumberInputValue("excerptFontSize")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("excerptFontSize", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("excerptFontSize")}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Tinggi Baris</label>
                                                <input 
                                                    type="number" step="0.1"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                    value={getResponsiveNumberInputValue("excerptLineHeight")}
                                                    onChange={(e) => {
                                                        handleResponsiveFloatInputChange("excerptLineHeight", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveFloatDraft("excerptLineHeight")}
                                                />
                                            </div>
                                            {child.type === 'news_headline_big' && (
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Margin Bawah Excerpt (px)</label>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                        value={getResponsiveNumberInputValue("excerptMarginBottom")}
                                                        onChange={(e) => {
                                                            handleResponsiveIntegerInputChange("excerptMarginBottom", e.target.value);
                                                        }}
                                                        onBlur={() => clearResponsiveIntegerDraft("excerptMarginBottom")}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* 6. Tombol Read More */}
                                {child.type !== 'news_grid' && child.type !== 'archive_post_list' ? (
                                <div className="mb-5 border-t border-[var(--border)] pt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-[var(--fg-primary)]">{child.type === 'news_list' ? 'Pagination / Muat Lebih Banyak' : 'Tombol Baca Selengkapnya'}</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                    checked={child.type === 'news_list' ? (getConfigString("paginationStyle", "none") !== "none") : getConfigBool("showReadMore", true)}
                                                    onChange={(e) => {
                                                        if (child.type === 'news_list') {
                                                            const current = getConfigString("paginationStyle", "none");
                                                            updateChildConfig("paginationStyle", e.target.checked ? (current === "none" ? "load_more" : current) : "none");
                                                        } else {
                                                            updateChildResponsiveConfig("showReadMore", e.target.checked);
                                                        }
                                                    }}
                                                />
                                                <span className="text-xs font-medium text-[var(--accent)]">Tampilkan</span>
                                            </label>
                                        </div>
                                        {(child.type === 'news_list' ? (getConfigString("paginationStyle", "none") !== "none") : getConfigBool("showReadMore", true)) && (
                                            <div className="space-y-3 animate-fade-in-down">
                                                {child.type === 'news_list' && (
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Gaya Pagination</label>
                                                        <select
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none text-[var(--fg-primary)]"
                                                            value={getConfigString("paginationStyle", "none")}
                                                            onChange={(e) => updateChildConfig("paginationStyle", e.target.value)}
                                                        >
                                                            <option value="load_more">Muat Lebih Banyak</option>
                                                            <option value="next_prev">Berikutnya/Sebelumnya</option>
                                                            <option value="auto_load">Muat Otomatis</option>
                                                        </select>
                                                    </div>
                                                )}
                                                {(child.type !== 'news_list' || getConfigString("paginationStyle", "none") === "load_more") && (
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">{child.type === 'news_list' ? 'Teks Tombol Muat Lebih Banyak' : 'Teks Tombol'}</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder={child.type === 'news_list' ? "Bawaan: Muat Lebih Banyak" : "Bawaan: Baca Selengkapnya"}
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                            value={child.type === 'news_list' ? getConfigString("loadMoreText") : getConfigString("readMoreText")}
                                                            onChange={(e) => {
                                                                if (child.type === 'news_list') updateChildConfig("loadMoreText", e.target.value);
                                                                else updateChildResponsiveConfig("readMoreText", e.target.value);
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                {child.type !== 'news_list' && (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <ColorPicker 
                                                                label="Teks" 
                                                                configKey="readMoreTextColor" 
                                                                globalDefault="#000000" 
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                            <ColorPicker 
                                                                label="Latar" 
                                                                configKey="readMoreBgColor" 
                                                                globalDefault="transparent" 
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <ColorPicker 
                                                                label="Border" 
                                                                configKey="readMoreBorderColor" 
                                                                globalDefault="#000000" 
                                                                child={child}
                                                                getConfigValue={getConfigValue}
                                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                                updateChildConfig={updateChildConfig}
                                                            />
                                                            <div>
                                                                <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius Sudut (px)</label>
                                                                <input 
                                                                    type="number" 
                                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                                    value={getResponsiveNumberInputValue("readMoreBorderRadius")}
                                                                    onChange={(e) => {
                                                                        handleResponsiveIntegerInputChange("readMoreBorderRadius", e.target.value);
                                                                    }}
                                                                    onBlur={() => clearResponsiveIntegerDraft("readMoreBorderRadius")}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ukuran Font (px)</label>
                                                            <input 
                                                                type="number" 
                                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                                value={getResponsiveNumberInputValue("readMoreFontSize")}
                                                                onChange={(e) => {
                                                                    handleResponsiveIntegerInputChange("readMoreFontSize", e.target.value);
                                                                }}
                                                                onBlur={() => clearResponsiveIntegerDraft("readMoreFontSize")}
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    ) : null}

                                    {/* 7. Label Kategori */}
                                    <div className="mb-2 border-t border-[var(--border)] pt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-xs font-bold text-[var(--fg-primary)]">Label Kategori</label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                    checked={getConfigBool("showCategory", true)}
                                                    onChange={(e) => updateChildResponsiveConfig("showCategory", e.target.checked)}
                                                />
                                                <span className="text-xs font-medium text-[var(--accent)]">Tampilkan</span>
                                            </label>
                                        </div>
                                        {getConfigBool("showCategory", true) && (
                                            <div className="space-y-3 animate-fade-in-down">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <ColorPicker 
                                                        label="Teks" 
                                                        configKey="categoryLabelColor" 
                                                        globalDefault="#ffffff" 
                                                        child={child}
                                                        getConfigValue={getConfigValue}
                                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                        updateChildConfig={updateChildConfig}
                                                    />
                                                    <ColorPicker 
                                                        label="Background" 
                                                        configKey="categoryLabelBgColor" 
                                                        globalDefault="#2563eb" 
                                                        child={child}
                                                        getConfigValue={getConfigValue}
                                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                        updateChildConfig={updateChildConfig}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Size (px)</label>
                                                        <input 
                                                            type="number" 
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue("categoryLabelFontSize")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("categoryLabelFontSize", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("categoryLabelFontSize")}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius (px)</label>
                                                        <input 
                                                            type="number" 
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue("categoryLabelBorderRadius")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("categoryLabelBorderRadius", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("categoryLabelBorderRadius")}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Padding Atas & Bawah (px)</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue("categoryLabelPaddingY")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("categoryLabelPaddingY", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("categoryLabelPaddingY")}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Padding Kiri & Kanan (px)</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)]"
                                                            value={getResponsiveNumberInputValue("categoryLabelPaddingX")}
                                                            onChange={(e) => {
                                                                handleResponsiveIntegerInputChange("categoryLabelPaddingX", e.target.value);
                                                            }}
                                                            onBlur={() => clearResponsiveIntegerDraft("categoryLabelPaddingX")}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    </>
                                    )}
                                </div>
                            )}

                        {/* Tag Colors */}
                        {(child.type === 'tag_cloud') && (
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
                        )}











                            {/* Slider Meta Color */}
                            {child.type === 'news_slider' && (
                                <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] mb-6">
                                    <ColorPicker 
                                        label="Warna Meta Tag" 
                                        configKey="metaColor" 
                                        globalDefault={globalSettings?.homeMetaColor || globalSettings?.metaColor} 
                                        isResponsive={false}
                                        child={child}
                                        getConfigValue={getConfigValue}
                                        updateChildResponsiveConfig={updateChildResponsiveConfig}
                                        updateChildConfig={updateChildConfig}
                                    />
                                    <p className="text-[10px] text-[var(--fg-muted)] mt-1">Mengatur warna kategori, penulis, dan tanggal khusus untuk slider ini.</p>
                                </div>
                            )}

                        {/* Tag Cloud Specific Settings */}
                        {child.type === 'tag_cloud' && (
                            <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                                    Pengaturan Tag - {activeDeviceTab}
                                </h4>
                                
                                {/* Tag Text */}
                                <div className="mb-4">
                                    <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Ukuran Teks Tag (px) - {activeDeviceTab}</label>
                                    <input 
                                        type="number" 
                                        placeholder="Bawaan"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                        value={getResponsiveNumberInputValue("tagFontSize")}
                                        onChange={(e) => {
                                            handleResponsiveIntegerInputChange("tagFontSize", e.target.value);
                                        }}
                                        onBlur={() => clearResponsiveIntegerDraft("tagFontSize")}
                                    />
                                </div>

                                {/* Tag Background Radius */}
                                <div className="mb-4">
                                    <label className="text-[10px] text-[var(--fg-primary)] mb-1 font-medium flex items-center gap-1"><DeviceIcon size={12} /> Radius Background (px) - {activeDeviceTab}</label>
                                    <input 
                                        type="number" 
                                        placeholder="Bawaan"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                        value={getResponsiveNumberInputValue("tagBorderRadius")}
                                        onChange={(e) => {
                                            handleResponsiveIntegerInputChange("tagBorderRadius", e.target.value);
                                        }}
                                        onBlur={() => clearResponsiveIntegerDraft("tagBorderRadius")}
                                    />
                                </div>

                                {/* Tag Gaps */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Gap Horizontal (X) - {activeDeviceTab}</label>
                                        <input 
                                            type="number" 
                                            placeholder="Default (8)"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                            value={getResponsiveNumberInputValue("tagGapX")}
                                            onChange={(e) => {
                                                handleResponsiveIntegerInputChange("tagGapX", e.target.value);
                                            }}
                                            onBlur={() => clearResponsiveIntegerDraft("tagGapX")}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Gap Vertikal (Y) - {activeDeviceTab}</label>
                                        <input 
                                            type="number" 
                                            placeholder="Default (8)"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                            value={getResponsiveNumberInputValue("tagGapY")}
                                            onChange={(e) => {
                                                handleResponsiveIntegerInputChange("tagGapY", e.target.value);
                                            }}
                                            onBlur={() => clearResponsiveIntegerDraft("tagGapY")}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Atas & Bawah (px) - {activeDeviceTab}</label>
                                        <input 
                                            type="number" 
                                            placeholder="Default (4)"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                            value={getResponsiveNumberInputValue("tagPaddingY")}
                                            onChange={(e) => {
                                                handleResponsiveIntegerInputChange("tagPaddingY", e.target.value);
                                            }}
                                            onBlur={() => clearResponsiveIntegerDraft("tagPaddingY")}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Kiri & Kanan (px) - {activeDeviceTab}</label>
                                        <input 
                                            type="number" 
                                            placeholder="Default (12)"
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                            value={getResponsiveNumberInputValue("tagPaddingX")}
                                            onChange={(e) => {
                                                handleResponsiveIntegerInputChange("tagPaddingX", e.target.value);
                                            }}
                                            onBlur={() => clearResponsiveIntegerDraft("tagPaddingX")}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* News List Highlight Settings - MOVED HERE */}
                        {child.type === 'news_list_highlight' && (
                            <div className="bg-[var(--bg-base)] p-4 rounded-xl border border-[var(--border)] mb-6">
                                <h4 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-4">Pengaturan List Item</h4>
                                

                                
                                {/* List Meta Config */}
                                <div className="mb-4">
                                        <label className="text-xs font-bold text-[var(--fg-primary)] flex items-center gap-1 mb-2"><DeviceIcon size={14} /> Ukuran Meta List (px) - {activeDeviceTab}</label>
                                        <input 
                                        type="number" 
                                        placeholder="Ukuran (contoh: 11)"
                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                        value={getResponsiveNumberInputValue("listMetaFontSize")}
                                        onChange={(e) => {
                                            handleResponsiveIntegerInputChange("listMetaFontSize", e.target.value);
                                        }}
                                        onBlur={() => clearResponsiveIntegerDraft("listMetaFontSize")}
                                    />
                                    
                                    <div className="mt-3 space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                checked={getConfigBool("listShowAuthor", true)} 
                                                onChange={(e) => updateChildResponsiveConfig("listShowAuthor", e.target.checked)}
                                            />
                                            <span className="text-xs text-[var(--fg-primary)]">Tampilkan Author</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                checked={getConfigBool("listShowDate", true)} 
                                                onChange={(e) => updateChildResponsiveConfig("listShowDate", e.target.checked)}
                                            />
                                            <span className="text-xs text-[var(--fg-primary)]">Tampilkan Tanggal</span>
                                        </label>
                                    </div>
                                </div>

                                {/* List Excerpt Config */}
                                <div className="mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-[var(--fg-primary)]">Excerpt List ({activeDeviceTab})</label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                checked={getConfigBool("listShowExcerpt", false)}
                                                onChange={(e) => updateChildResponsiveConfig("listShowExcerpt", e.target.checked)}
                                            />
                                            <span className="text-xs font-medium text-[var(--accent)]">Tampilkan</span>
                                        </label>
                                    </div>
                                    {getConfigBool("listShowExcerpt", false) && (
                                        <div className="space-y-3 animate-fade-in-down">
                                            <input 
                                                type="number" 
                                                placeholder="Panjang Karakter (Contoh: 100)"
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                value={getResponsiveNumberInputValue("listExcerptLength")}
                                                onChange={(e) => {
                                                    handleResponsiveIntegerInputChange("listExcerptLength", e.target.value);
                                                }}
                                                onBlur={() => clearResponsiveIntegerDraft("listExcerptLength")}
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input 
                                                    type="number" 
                                                    placeholder="Size (px)"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                    value={getResponsiveNumberInputValue("listExcerptFontSize")}
                                                    onChange={(e) => {
                                                        handleResponsiveIntegerInputChange("listExcerptFontSize", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveIntegerDraft("listExcerptFontSize")}
                                                />
                                                <input 
                                                    type="number" 
                                                    step="0.1"
                                                    placeholder="Tinggi Baris"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm focus:border-[var(--accent)] outline-none text-[var(--fg-primary)]"
                                                    value={getResponsiveNumberInputValue("listExcerptLineHeight")}
                                                    onChange={(e) => {
                                                        handleResponsiveFloatInputChange("listExcerptLineHeight", e.target.value);
                                                    }}
                                                    onBlur={() => clearResponsiveFloatDraft("listExcerptLineHeight")}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(builderLocation === "footer" && String(child.type || "").startsWith("footer_")) && (
                            <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
                                <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                                    Visual Widget Footer
                                </h4>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Perataan</label>
                                        <select
                                            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                            value={getConfigString("textAlign", "left")}
                                            onChange={(e) => {
                                                if (child.type === "footer_copyright") updateChildResponsiveConfig("textAlign", e.target.value);
                                                else updateChildConfig("textAlign", e.target.value);
                                            }}
                                        >
                                            <option value="left">Kiri</option>
                                            <option value="center">Tengah</option>
                                            <option value="right">Kanan</option>
                                        </select>
                                        {child.type === "footer_copyright" && (
                                            <p className="text-[10px] text-[var(--fg-muted)] mt-1">Perataan untuk Copyright bisa diatur per device.</p>
                                        )}
                                    </div>

                                    {child.type !== "footer_copyright" && (
                                        <div>
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block mb-1.5">Posisi Vertikal</label>
                                            <select
                                                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)]"
                                                value={getConfigString("verticalAlign", "top")}
                                                onChange={(e) => updateChildConfig("verticalAlign", e.target.value)}
                                            >
                                                <option value="top">Atas</option>
                                                <option value="center">Tengah</option>
                                                <option value="bottom">Bawah</option>
                                            </select>
                                        </div>
                                    )}

                                    {child.type === "footer_copyright" && (
                                        <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-3 space-y-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <label className="text-xs font-medium text-[var(--fg-primary)]">Tampilan Teks</label>
                                                <span className="text-[10px] text-[var(--fg-muted)]">{activeDeviceTab.toUpperCase()}</span>
                                            </div>
                                            <ColorPicker
                                                label="Warna Teks"
                                                configKey="textColor"
                                                activeDeviceTab={activeDeviceTab}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Font Size (px)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="12"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                        value={getConfigString("textFontSize")}
                                                        onChange={(e) => updateChildResponsiveConfig("textFontSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Line Height</label>
                                                    <input
                                                        type="number"
                                                        step="0.05"
                                                        placeholder="1.6"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                        value={getConfigString("textLineHeight")}
                                                        onChange={(e) => updateChildResponsiveConfig("textLineHeight", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Font Weight</label>
                                                <select
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                    value={getConfigString("textFontWeight", "400")}
                                                    onChange={(e) => updateChildResponsiveConfig("textFontWeight", e.target.value)}
                                                >
                                                    {["300", "400", "500", "600", "700", "800"].map((w) => (
                                                        <option key={w} value={w}>
                                                            {w}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {child.type === "footer_logo" && (
                                        <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-3 space-y-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <label className="text-xs font-medium text-[var(--fg-primary)]">Ukuran</label>
                                                <span className="text-[10px] text-[var(--fg-muted)]">{activeDeviceTab.toUpperCase()}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Tinggi Logo (px)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="40"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                        value={getConfigString("logoHeight")}
                                                        onChange={(e) => updateChildResponsiveConfig("logoHeight", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Maks Lebar (px)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="240"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                        value={getConfigString("logoMaxWidth")}
                                                        onChange={(e) => updateChildResponsiveConfig("logoMaxWidth", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ukuran Teks (px)</label>
                                                <input
                                                    type="number"
                                                    placeholder="28"
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                    value={getConfigString("logoTextSize")}
                                                    onChange={(e) => updateChildResponsiveConfig("logoTextSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {child.type === "footer_text" && (
                                        <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-3 space-y-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <label className="text-xs font-medium text-[var(--fg-primary)]">Tampilan Teks</label>
                                                <span className="text-[10px] text-[var(--fg-muted)]">{activeDeviceTab.toUpperCase()}</span>
                                            </div>
                                            <ColorPicker
                                                label="Warna Teks"
                                                configKey="textColor"
                                                activeDeviceTab={activeDeviceTab}
                                                child={child}
                                                getConfigValue={getConfigValue}
                                                updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                updateChildConfig={updateChildConfig}
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Font Size (px)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="14"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                        value={getConfigString("textFontSize")}
                                                        onChange={(e) => updateChildResponsiveConfig("textFontSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Line Height</label>
                                                    <input
                                                        type="number"
                                                        step="0.05"
                                                        placeholder="1.6"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                        value={getConfigString("textLineHeight")}
                                                        onChange={(e) => updateChildResponsiveConfig("textLineHeight", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Font Weight</label>
                                                <select
                                                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                    value={getConfigString("textFontWeight", "400")}
                                                    onChange={(e) => updateChildResponsiveConfig("textFontWeight", e.target.value)}
                                                >
                                                    {["300", "400", "500", "600", "700", "800"].map((w) => (
                                                        <option key={w} value={w}>
                                                            {w}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {child.type === "footer_social" && (
                                        <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-3 space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Layout</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                        value={getConfigString("socialLayout", "horizontal")}
                                                        onChange={(e) => updateChildConfig("socialLayout", e.target.value)}
                                                    >
                                                        <option value="horizontal">Horizontal</option>
                                                        <option value="vertical">Vertikal</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Tampilan</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                        value={getConfigString("socialVariant", "theme")}
                                                        onChange={(e) => updateChildConfig("socialVariant", e.target.value)}
                                                    >
                                                        <option value="theme">Ikuti tema</option>
                                                        <option value="plain">Ikon saja</option>
                                                        <option value="button">Tombol</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Ukuran Ikon (px) - {activeDeviceTab.toUpperCase()}</label>
                                                    <input
                                                        type="number"
                                                        min={8}
                                                        max={64}
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                        value={getConfigString("socialIconSize", "")}
                                                        onChange={(e) => updateChildResponsiveConfig("socialIconSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Jarak (px) - {activeDeviceTab.toUpperCase()}</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={64}
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                        value={getConfigString("socialGap", "")}
                                                        onChange={(e) => updateChildResponsiveConfig("socialGap", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Padding (px) - {activeDeviceTab.toUpperCase()}</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={64}
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                        value={getConfigString("socialPadding", "")}
                                                        onChange={(e) => updateChildResponsiveConfig("socialPadding", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Radius</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
                                                        value={getConfigString("socialRadius", "full")}
                                                        onChange={(e) => updateChildConfig("socialRadius", e.target.value)}
                                                    >
                                                        <option value="full">Bulat</option>
                                                        <option value="md">Membulat</option>
                                                        <option value="none">Kotak</option>
                                                    </select>
                                                </div>
                                                <div />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <ColorPicker
                                                    label="Warna Ikon"
                                                    configKey="socialIconColor"
                                                    activeDeviceTab={activeDeviceTab}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <ColorPicker
                                                    label="Hover Ikon"
                                                    configKey="socialIconHoverColor"
                                                    activeDeviceTab={activeDeviceTab}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <ColorPicker
                                                    label="Background"
                                                    configKey="socialBgColor"
                                                    activeDeviceTab={activeDeviceTab}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <ColorPicker
                                                    label="Hover Background"
                                                    configKey="socialBgHoverColor"
                                                    activeDeviceTab={activeDeviceTab}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {child.type === "footer_custom_links" && (
                                        <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-3 space-y-3">
                                            <label className="text-xs font-medium text-[var(--fg-primary)] block">Tampilan Links</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Layout</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                                                        value={getConfigString("linkLayout", "vertical")}
                                                        onChange={(e) => updateChildConfig("linkLayout", e.target.value)}
                                                    >
                                                        <option value="vertical">Vertikal</option>
                                                        <option value="horizontal">Horizontal</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Gap Vertikal (px)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="8"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                                                        value={getConfigString("linkGapVertical", getConfigString("linkGap", ""))}
                                                        onChange={(e) => updateChildConfig("linkGapVertical", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Gap Horizontal (px)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="8"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                                                        value={getConfigString("linkGapHorizontal", getConfigString("linkGap", ""))}
                                                        onChange={(e) => updateChildConfig("linkGapHorizontal", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Pembatas</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                                                        value={getConfigString("linkDivider", "strip")}
                                                        onChange={(e) => updateChildConfig("linkDivider", e.target.value)}
                                                    >
                                                        <option value="strip">Strip</option>
                                                        <option value="line">Garis Lurus</option>
                                                        <option value="round">Bulat</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Font Size (px)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="14"
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                                                        value={getConfigString("linkFontSize", "")}
                                                        onChange={(e) => updateChildConfig("linkFontSize", e.target.value === "" ? undefined : parseInt(e.target.value, 10))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Font Weight</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                                                        value={getConfigString("linkFontWeight", "")}
                                                        onChange={(e) => updateChildConfig("linkFontWeight", e.target.value)}
                                                    >
                                                        <option value="">Default</option>
                                                        {["300", "400", "500", "600", "700", "800"].map((w) => (
                                                            <option key={w} value={w}>
                                                                {w}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <ColorPicker
                                                    label="Warna Link"
                                                    configKey="linkColor"
                                                    isResponsive={false}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                                <ColorPicker
                                                    label="Warna Hover"
                                                    configKey="linkHoverColor"
                                                    isResponsive={false}
                                                    child={child}
                                                    getConfigValue={getConfigValue}
                                                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                                                    updateChildConfig={updateChildConfig}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">Underline</label>
                                                    <select
                                                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                                                        value={getConfigString("linkUnderline", "hover")}
                                                        onChange={(e) => updateChildConfig("linkUnderline", e.target.value)}
                                                    >
                                                        <option value="none">Tidak</option>
                                                        <option value="hover">Saat Hover</option>
                                                        <option value="always">Selalu</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-end">
                                                    <label className="flex items-center gap-2 text-sm text-[var(--fg-secondary)]">
                                                        <input
                                                            type="checkbox"
                                                            checked={getConfigBool("showBullets", false)}
                                                            onChange={(e) => updateChildConfig("showBullets", e.target.checked)}
                                                        />
                                                        Bullet (List)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                            <div className="pt-4 border-t border-[var(--border)]">
                                <h4 className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider mb-4">Tampilan Lanjutan</h4>

                                {(() => {
                                    const type = String(child.type || "");
                                    if (type === "" || type === "section") return false;
                                    if (type.startsWith("post_")) return false;
                                    if (type.startsWith("archive_")) return false;
                                    if (type.startsWith("header_")) return false;
                                    if (type === "footer_copyright") return false;

                                    const noTitleTypes = new Set([
                                        "classic_hero",
                                        "news_hero_slider",
                                        "news_hero_split_4",
                                        "news_headline_big",
                                        "news_bullet_list",
                                        "ad_banner"
                                    ]);
                                    if (noTitleTypes.has(type)) return false;

                                    if (builderLocation === "footer") {
                                        return [
                                            "footer_text",
                                            "footer_menu",
                                            "footer_social",
                                            "footer_categories",
                                            "footer_custom_links"
                                        ].includes(type);
                                    }

                                    return ["news_list", "news_grid", "news_grid_slider", "sidebar_widget", "tag_cloud"].includes(type);
                                })() && (
                                    <div className="mb-5">
                                        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
                                            <div>
                                                <label className="text-xs font-medium text-[var(--fg-primary)] block">Tampilkan Judul Widget</label>
                                                <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Judul widget tampil di publik jika diaktifkan.</p>
                                            </div>
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
                                    </div>
                                )}
                                
                                {/* Responsiveness */}
                                <div className="mb-5">
                                    <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Responsivitas (Sembunyikan di:)</label>
                                    <div className="flex flex-col gap-2">
                                        {["Desktop", "Tablet", "Mobile"].map(d => (
                                            <label key={d} className="flex items-center gap-2 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                                                    checked={getConfigBool(`hideOn${d}`, false)}
                                                    onChange={(e) => updateChildConfig(`hideOn${d}`, e.target.checked)}
                                                />
                                                <span className="text-sm text-[var(--fg-primary)]">{d}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                

                                

                            </div>
                        </div>
                    )}
            </div>
        </>
    );
}
