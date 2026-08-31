import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Copy, Search, X } from "lucide-react";
import { Block, Category, Tag } from "./types";
import CustomColorPicker from "./ColorPicker";
import {
    BlockConfigPanelHeroSliderVisualSection,
    BlockConfigPanelHeroSplitVisualSection,
} from "./BlockConfigPanelHeroVisualSections";
import { BlockConfigPanelNewsFeedVisualSection } from "./BlockConfigPanelNewsFeedVisualSection";
import { BlockConfigPanelAdvancedSections } from "./BlockConfigPanelAdvancedSections";
import { BlockConfigPanelHeroAdvancedSection } from "./BlockConfigPanelHeroAdvancedSection";
import {
    BlockConfigPanelHeadlineBigAdvancedSection,
    BlockConfigPanelHeadlineBigContentSection,
    BlockConfigPanelHeadlineBigStyleSection,
} from "./BlockConfigPanelHeadlineBigSections";
import {
    BlockConfigPanelHeroLayoutSection,
    BlockConfigPanelHeroTextSettingsSection,
} from "./BlockConfigPanelHeroLayoutTextSections";
import {
    BlockConfigPanelHeroSliderAdvancedSection,
    BlockConfigPanelHeroSliderContentSection,
} from "./BlockConfigPanelHeroSliderSections";
import {
    BlockConfigPanelHeroSplit4AdvancedSection,
    BlockConfigPanelHeroSplit4ContentSection,
} from "./BlockConfigPanelHeroSplit4Sections";
import { BlockConfigPanelMainContainerSection } from "./BlockConfigPanelMainContainerSection";
import {
    BlockConfigPanelBulletListContentSection,
    BlockConfigPanelBulletListSourceSection,
    BlockConfigPanelHeroContentSection,
    BlockConfigPanelNewsFeedSourceSection,
} from "./BlockConfigPanelPrimaryContentSections";
import { BlockConfigPanelPostBuilderExtraAdvancedSection } from "./BlockConfigPanelPostBuilderExtraAdvancedSection";
import { BlockConfigPanelPostContentLayoutSection } from "./BlockConfigPanelPostContentLayoutSection";
import { BlockConfigPanelSharedBoxBackgroundSection } from "./BlockConfigPanelSharedBoxBackgroundSection";
import { BlockConfigPanelSharedContentAlignmentSection } from "./BlockConfigPanelSharedContentAlignmentSection";
import { BlockConfigPanelSlugSelectionList } from "./BlockConfigPanelSlugSelectionList";
import { BlockConfigPanelSharedSourceFilterFields } from "./BlockConfigPanelSharedSourceFilterFields";
import {
    BlockConfigPanelSharedCategoryTextSection,
    BlockConfigPanelSharedExcerptTextSection,
    BlockConfigPanelSharedMetaTextSection,
    BlockConfigPanelSharedTitleTextSection,
} from "./BlockConfigPanelSharedTextSections";
import { BlockConfigPanelSharedVisibilitySection } from "./BlockConfigPanelSharedVisibilitySection";
import { BlockConfigPanelSharedWidgetSpacingSection } from "./BlockConfigPanelSharedWidgetSpacingSection";
import { BlockConfigPanelWidgetNameField } from "./BlockConfigPanelWidgetNameField";
import { BlockConfigPanelContentSections } from "./BlockConfigPanelContentSections";
import {
    BlockConfigPanelGenericNewsContentSection,
    BlockConfigPanelRelatedPostsContentSection,
} from "./BlockConfigPanelContentTabSections";
import { BlockConfigPanelGenericVisualCard } from "./BlockConfigPanelGenericVisualCard";
import { BlockConfigPanelGenericWidgetSettings } from "./BlockConfigPanelGenericWidgetSettings";
import { BlockConfigPanelImageWidgetSection } from "./BlockConfigPanelImageWidgetSection";
import { BlockConfigPanelImageWidgetVisualSection } from "./BlockConfigPanelImageWidgetVisualSection";
import {
    isHeaderWidgetType,
    renderHeaderAdvancedSections,
    renderHeaderContentSections,
    renderHeaderVisualSections,
} from "./BlockConfigPanelHeaderSections";
import {
    isFooterWidgetType,
    renderFooterAdvancedSections,
    renderFooterVisualSections,
} from "./BlockConfigPanelFooterSections";
import {
    BlockConfigPanelPostBreadcrumbVisualSection,
    BlockConfigPanelPostAuthorBoxVisualSection,
    BlockConfigPanelPostCommentsBehaviorSection,
    BlockConfigPanelPostCommentsVisualSection,
    BlockConfigPanelPostContentBorderVisualSection,
    BlockConfigPanelPostFeaturedImageVisualSection,
    BlockConfigPanelPostMetaVisualSection,
    BlockConfigPanelPostNavigationVisualSection,
    BlockConfigPanelPostRelatedPostsVisualSection,
    BlockConfigPanelPostShareVisualSection,
    BlockConfigPanelPostStatsVisualSection,
    BlockConfigPanelPostTagsVisualSection,
    BlockConfigPanelPostTypographyVisualSection,
} from "./BlockConfigPanelPostVisualSections";
import {
    BlockConfigPanelAdBannerContentSection,
    BlockConfigPanelBasicAdvancedSection,
    BlockConfigPanelSidebarWidgetContentSection,
    BlockConfigPanelTagCloudContentSection,
} from "./BlockConfigPanelSidebarAuxContentAdvancedSections";
import {
    BlockConfigPanelAdBannerVisualSection,
    BlockConfigPanelSidebarWidgetVisualSection,
    BlockConfigPanelTagCloudVisualSection,
} from "./BlockConfigPanelSidebarAuxVisualSections";
import type {
    BlockConfigPanelAdOption,
    BlockConfigPanelSharedCategoryTextOptions,
    BlockConfigPanelSharedTitleTextOptions,
    SharedPanelOptions,
} from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelVisualFamilySections } from "./BlockConfigPanelVisualFamilySections";
import {
    isArchiveWidgetWithDedicatedSections,
    isArchiveWidgetWithSharedVisualSections,
    renderArchiveAdvancedSections,
    renderArchiveSharedAdvancedSections,
    renderArchiveSharedVisualSections,
    renderArchiveVisualSections,
} from "./BlockConfigPanelArchiveSections";
import { ConfigValue, createConfigReaders } from "@/lib/page-builder-config";
import MediaLibraryModal from "@/app/admin/components/MediaLibraryModal";
import {
    getWidgetRenderContextFromBuilderLocation,
    resolveWidgetStyleDefaults,
} from "@/lib/widget-style-defaults";
import { resolveBlockTypeAlias } from "@/lib/block-registry";
import {
    buildArchiveChildConfig,
    buildHomepageChildConfig,
    buildPageChildConfig,
    getSidebarWidgetDefaultTitle,
    isSidebarWidgetAutoTitle,
} from "@/lib/page-builder-child-presets";
import { normalizeSlugArray } from "@/lib/category-filters";
import {
    getWidgetConfigProfile,
    getWidgetPanelSectionKey,
} from "@/lib/widget-config-registry";

const ActiveDeviceTabContext = createContext<'desktop' | 'tablet' | 'mobile'>('desktop');

interface BlockConfigPanelProps {
    builderLocation?: "home" | "archive" | "header" | "footer" | "post";
    activeTheme?: string;
    child: Block;
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
    const contextDeviceTab = useContext(ActiveDeviceTabContext);
    const resolvedDeviceTab = activeDeviceTab || contextDeviceTab;
    const suffix = isResponsive ? ` (${resolvedDeviceTab.toUpperCase()})` : '';
    const resolvedContainerClassName = `min-w-0 space-y-1 ${containerClassName || ""}`.trim();
    const resolvedLabelClassName = `text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium ${labelClassName || ""}`.trim();
    const resolvedTriggerClassName = `w-full items-stretch gap-2 ${triggerClassName || ""}`.trim();
    const resolvedSwatchClassName = `w-9 h-9 rounded-lg shrink-0 ${swatchClassName || ""}`.trim();
    const resolvedInputClassName = `h-9 rounded-lg px-2.5 py-0 text-sm ${inputClassName || ""}`.trim();
    return (
        <BaseColorPicker
            label={`${label}${suffix}`}
            configKey={configKey}
            globalDefault={globalDefault}
            isResponsive={isResponsive}
            containerClassName={resolvedContainerClassName}
            labelClassName={resolvedLabelClassName}
            triggerClassName={resolvedTriggerClassName}
            swatchClassName={resolvedSwatchClassName}
            inputClassName={resolvedInputClassName}
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
    { label: "System Sans", value: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" },
    { label: "System Serif", value: "ui-serif, Georgia, Cambria, Times New Roman, Times, serif" },
    { label: "System Mono", value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace" },
    { label: "Arial", value: "Arial, sans-serif", previewFamily: "Arial, sans-serif" },
    { label: "Georgia", value: "Georgia, serif", previewFamily: "Georgia, serif" },
    { label: "Times New Roman", value: "Times New Roman, Times, serif", previewFamily: "Times New Roman, Times, serif" },
    { label: "Courier New", value: "Courier New, Courier, monospace", previewFamily: "Courier New, Courier, monospace" },
    { label: "Verdana", value: "Verdana, Geneva, sans-serif", previewFamily: "Verdana, Geneva, sans-serif" },
    { label: "Trebuchet MS", value: "Trebuchet MS, Arial, sans-serif", previewFamily: "Trebuchet MS, Arial, sans-serif" },
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

const HERO_CONTROL_CLASS = "w-full h-9 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-2.5 text-sm text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]";
const HERO_TEXT_CONTROL_CLASS = `${HERO_CONTROL_CLASS} transition-all focus:bg-[var(--bg-base)]`;
const HERO_COLOR_TRIGGER_CLASS = "items-stretch gap-1";
const HERO_COLOR_SWATCH_CLASS = "w-9 h-9 rounded-lg";
const HERO_COLOR_INPUT_CLASS = "h-9 rounded-lg px-2.5 py-0 text-sm";

const toNumericDisplayString = (value: unknown): string | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return trimmed;
    const pxMatch = trimmed.match(/^(-?\d+(?:\.\d+)?)px$/i);
    return pxMatch ? pxMatch[1] : undefined;
};

const toBaseResponsiveKey = (key: string) =>
    key.replace(/^(tablet|mobile)([A-Z])/, (_, __, first: string) => first.toLowerCase());

export function FontFamilyPicker({
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

type SearchableSlugOption = {
    id: string;
    slug: string;
    name: string;
};

function SearchableMultiSelect({
    label,
    items,
    selectedSlugs,
    onChange,
    placeholder,
    helperText,
    emptyDataText,
}: {
    label: string;
    items: SearchableSlugOption[];
    selectedSlugs: string[];
    onChange: (slugs: string[]) => void;
    placeholder: string;
    helperText: string;
    emptyDataText: string;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const handler = (event: PointerEvent) => {
            const el = containerRef.current;
            if (!el) return;
            const path = typeof event.composedPath === "function" ? event.composedPath() : undefined;
            const inside = path ? path.includes(el) : el.contains(event.target as Node);
            if (!inside) setOpen(false);
        };
        if (open) document.addEventListener("pointerdown", handler, true);
        return () => document.removeEventListener("pointerdown", handler, true);
    }, [open]);

    const selectedItems = useMemo(
        () => selectedSlugs
            .map((slug) => items.find((item) => item.slug === slug))
            .filter((item): item is SearchableSlugOption => Boolean(item)),
        [items, selectedSlugs]
    );

    const filteredItems = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        if (!keyword) return items;
        return items.filter((item) =>
            item.name.toLowerCase().includes(keyword) || item.slug.toLowerCase().includes(keyword)
        );
    }, [items, query]);

    const toggleSlug = (slug: string) => {
        onChange(
            selectedSlugs.includes(slug)
                ? selectedSlugs.filter((value) => value !== slug)
                : [...selectedSlugs, slug]
        );
    };

    return (
        <div ref={containerRef} className="col-span-2">
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">{label}</label>
            <div className="relative">
                <button
                    type="button"
                    className={`w-full bg-[var(--bg-elevated)] border rounded-xl text-sm text-[var(--fg-primary)] transition-colors ${
                        open
                            ? "border-[var(--accent)] bg-[var(--bg-base)]"
                            : "border-[var(--border)] hover:border-[var(--accent)]/40"
                    }`}
                    onClick={() => {
                        setOpen((value) => !value);
                        setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                >
                    <div className="px-3 py-2.5 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            {selectedItems.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedItems.slice(0, 3).map((item) => (
                                        <span
                                            key={`${label}-${item.id}`}
                                            className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 text-[10px] font-medium text-[var(--fg-primary)]"
                                        >
                                            {item.name}
                                        </span>
                                    ))}
                                    {selectedItems.length > 3 && (
                                        <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 text-[10px] font-medium text-[var(--fg-muted)]">
                                            +{selectedItems.length - 3}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span className="block truncate text-[var(--fg-muted)] text-left">{placeholder}</span>
                            )}
                        </div>
                        <ChevronDown size={16} className={`shrink-0 text-[var(--fg-muted)] transition-transform ${open ? "rotate-180" : ""}`} />
                    </div>
                </button>

                {open && (
                    <div className="absolute z-50 mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-lg overflow-hidden">
                        <div className="border-b border-[var(--border)] px-3 py-2 bg-[var(--bg-base)]">
                            <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-2">
                                <Search size={14} className="shrink-0 text-[var(--fg-muted)]" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onFocus={() => setOpen(true)}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setOpen(true);
                                    }}
                                    placeholder={`Cari ${label.toLowerCase()}...`}
                                    className="flex-1 bg-transparent text-sm text-[var(--fg-primary)] outline-none placeholder:text-[var(--fg-muted)]"
                                />
                                {(query || selectedItems.length > 0) && (
                                    <button
                                        type="button"
                                        className="shrink-0 rounded-md p-1 text-[var(--fg-muted)] hover:bg-[var(--bg-surface)]"
                                        onClick={() => {
                                            setQuery("");
                                            if (selectedItems.length > 0) onChange([]);
                                        }}
                                        aria-label={`Reset ${label}`}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="max-h-56 overflow-auto">
                            {filteredItems.length === 0 ? (
                                <div className="px-3 py-3 text-xs text-[var(--fg-muted)]">
                                    {items.length === 0 ? emptyDataText : "Tidak ada hasil yang cocok."}
                                </div>
                            ) : (
                                filteredItems.map((item) => {
                                    const checked = selectedSlugs.includes(item.slug);
                                    return (
                                        <button
                                            key={`${label}-option-${item.id}`}
                                            type="button"
                                            onClick={() => {
                                                toggleSlug(item.slug);
                                                setQuery("");
                                            }}
                                            className={`w-full text-left px-3 py-2.5 text-sm border-b border-[var(--border)] last:border-b-0 flex items-center gap-3 hover:bg-[var(--bg-elevated)] ${
                                                checked ? "bg-[var(--accent-subtle)]" : "text-[var(--fg-primary)]"
                                            }`}
                                        >
                                            <div className="shrink-0">
                                                {checked ? (
                                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-[var(--accent)] text-white">
                                                        <Check size={10} />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm border border-[var(--border)] bg-[var(--bg-base)]" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className={`truncate text-sm ${checked ? "text-[var(--accent)] font-medium" : "text-[var(--fg-primary)]"}`}>{item.name}</div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                        <div className="border-t border-[var(--border)] px-3 py-2 text-[10px] text-[var(--fg-muted)] bg-[var(--bg-base)]">
                            {selectedItems.length > 0 ? `${selectedItems.length} dipilih` : helperText}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function BlockConfigPanel({
    builderLocation: _builderLocation = "post",
    activeTheme = "classic",
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
    const builderLocation = _builderLocation;
    const [_uploading, _setUploading] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [mediaTargetKey, setMediaTargetKey] = useState<string | null>(null);
    const [availableAds, setAvailableAds] = useState<BlockConfigPanelAdOption[]>([]);
    const [loadingAds, setLoadingAds] = useState(false);
    const [responsiveNumberDrafts, setResponsiveNumberDrafts] = useState<Record<string, string>>({});

    const applyToAllDevices = (key: string, value: ConfigValue) => {
        updateChildConfig(key, value);
        updateChildConfig(`tablet${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
        updateChildConfig(`mobile${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
    };
    const deviceLabel = activeDeviceTab.toUpperCase();
    const childType = String(child.type || "");
    const effectiveChildType = resolveBlockTypeAlias(childType);
    const isImageWidget = effectiveChildType === "image_widget";
    const widgetProfile = getWidgetConfigProfile(activeTheme, childType);
    const isPostBuilder = builderLocation === "post";
    const isArchiveBuilder = builderLocation === "archive";
    const isHeaderBuilder = builderLocation === "header";
    const isFooterBuilder = builderLocation === "footer";
    const isHeaderWidget = isHeaderBuilder && isHeaderWidgetType(child.type);
    const isFooterWidget = isFooterBuilder && isFooterWidgetType(child.type);
    const shouldUseHomepageStyleAuxiliaryModal =
        (isPostBuilder || isArchiveBuilder) &&
        (widgetProfile.isSidebarWidget || widgetProfile.isTagCloudWidget || widgetProfile.isAdBannerWidget || isImageWidget);
    const widgetStyleDefaults = resolveWidgetStyleDefaults(
        globalSettings,
        shouldUseHomepageStyleAuxiliaryModal
            ? getWidgetRenderContextFromBuilderLocation(isArchiveBuilder ? "archive" : "home")
            : getWidgetRenderContextFromBuilderLocation(builderLocation)
    );
    const globalWidgetTitleColor = widgetStyleDefaults.widgetTitleColor;
    const globalNewsTitleColor = widgetStyleDefaults.newsTitleColor;
    const globalHoverColor = widgetStyleDefaults.hoverColor;
    const globalMetaTone = globalSettings?.globalMutedTextColor || widgetStyleDefaults.metaColor;
    const globalExcerptTone = widgetStyleDefaults.excerptColor;
    const globalAccentTone = widgetStyleDefaults.accentColor;
    const globalSurfaceTone = globalSettings?.globalSurfaceColor || globalSettings?.backgroundColor || "#f9fafb";
    const globalBorderTone = globalSettings?.globalBorderColor || "#e5e7eb";
    const globalPostWidgetTitleTone = globalSettings?.postWidgetTitleColor || globalSettings?.headingColor || "#1e293b";
    const archiveHeaderTitleSizeDefault = toNumericDisplayString(widgetStyleDefaults.widgetTitleFontSize) || "24";
    const archiveHeaderTitleWeightDefault = widgetStyleDefaults.widgetTitleFontWeight || "700";
    const archiveHeaderDescriptionSizeDefault = toNumericDisplayString(widgetStyleDefaults.excerptFontSize) || "14";
    const archiveHeaderDescriptionWeightDefault = widgetStyleDefaults.excerptFontWeight || "400";
    const archiveHeaderMetaSizeDefault = toNumericDisplayString(widgetStyleDefaults.metaFontSize) || "12";
    const archiveHeaderMetaWeightDefault = widgetStyleDefaults.metaFontWeight || "500";
    const globalPostContentTone = globalSettings?.postContentColor || globalSettings?.excerptColor || "#374151";
    const globalPostMetaTone = globalSettings?.postMetaColor || globalSettings?.globalMutedTextColor || globalSettings?.metaColor || "#94a3b8";
    const globalPostLinkTone = globalSettings?.postLinkColor || globalHoverColor;
    const isPostWidget = childType.startsWith("post_");
    const isEffectiveNewsType = effectiveChildType.startsWith("news_");
    const postTypographyDefaultColor =
        child.type === "post_title"
            ? globalPostWidgetTitleTone
            : child.type === "post_meta"
            ? globalPostMetaTone
            : globalPostContentTone;

    const numericDisplayPresetConfig = useMemo<Record<string, unknown>>(() => {
        const columnIndex =
            typeof child.config?.columnIndex === "number" && Number.isFinite(child.config.columnIndex)
                ? child.config.columnIndex
                : 0;
        const resolvedTitle = typeof child.title === "string" ? child.title : "";

        if (builderLocation === "home") {
            return buildHomepageChildConfig(effectiveChildType, resolvedTitle, columnIndex);
        }
        if ((builderLocation === "post" || builderLocation === "archive") && shouldUseHomepageStyleAuxiliaryModal) {
            return buildHomepageChildConfig(effectiveChildType, resolvedTitle, columnIndex);
        }
        if (builderLocation === "archive") {
            return buildArchiveChildConfig(effectiveChildType, resolvedTitle, columnIndex);
        }
        return buildPageChildConfig(effectiveChildType, resolvedTitle, columnIndex);
    }, [builderLocation, child.config?.columnIndex, child.title, effectiveChildType, shouldUseHomepageStyleAuxiliaryModal]);

    const { getConfigRaw, getConfigString: getBaseConfigString, getConfigBool, getConfigForApply } = createConfigReaders(child, getConfigValue);
    const getNumericDisplayDefault = (key: string): string | undefined => {
        const directPreset = toNumericDisplayString(numericDisplayPresetConfig[key]);
        if (directPreset !== undefined) return directPreset;

        const baseKey = toBaseResponsiveKey(key);
        if (baseKey !== key) {
            const inheritedPreset = toNumericDisplayString(numericDisplayPresetConfig[baseKey]);
            if (inheritedPreset !== undefined) return inheritedPreset;
        }

        if (
            baseKey.startsWith("margin") ||
            baseKey.startsWith("padding") ||
            baseKey.startsWith("contentPadding") ||
            baseKey.startsWith("heroContentPadding") ||
            baseKey.startsWith("loadMorePadding")
        ) {
            return "0";
        }

        switch (baseKey) {
            case "limit":
                return isClassicHeroWidget ? "1" : "6";
            case "offset":
                return "0";
            case "blockTitleFontSize":
                return toNumericDisplayString(widgetStyleDefaults.widgetTitleFontSize);
            case "blockTitleMarginBottom":
                return "14";
            case "blockTitlePaddingBottom":
                return "6";
            case "categoryLabelFontSize":
                return "10";
            case "categoryLabelPaddingX":
                return "8";
            case "categoryLabelPaddingY":
                return "4";
            case "categoryLabelMarginBottom":
                return "10";
            case "titleFontSize":
                return !isPostBuilder ? toNumericDisplayString(widgetStyleDefaults.newsTitleFontSize) : undefined;
            case "titleLineHeight":
                return !isPostBuilder ? widgetStyleDefaults.newsTitleLineHeight : undefined;
            case "titleMarginBottom":
                return "8";
            case "titleFontWeight":
                return !isPostBuilder ? widgetStyleDefaults.newsTitleFontWeight : undefined;
            case "newsTitleLineHeight":
                return "1.1";
            case "newsTitleMarginBottom":
                return "14";
            case "metaFontSize":
                return toNumericDisplayString(widgetStyleDefaults.metaFontSize);
            case "metaFontWeight":
                return widgetStyleDefaults.metaFontWeight;
            case "metaLineHeight":
                return widgetStyleDefaults.metaLineHeight;
            case "metaMarginBottom":
                return "10";
            case "excerptFontSize":
                return toNumericDisplayString(widgetStyleDefaults.excerptFontSize);
            case "excerptLength":
                return "120";
            case "excerptLineHeight":
                return widgetStyleDefaults.excerptLineHeight;
            case "excerptFontWeight":
                return widgetStyleDefaults.excerptFontWeight;
            case "imageWidth":
                return isImageWidget ? undefined : isSidebarWidget ? "100" : "100";
            case "imageHeight":
                return isImageWidget ? undefined : isClassicHeroWidget ? "520" : isHeroSliderWidget ? "500" : "150";
            case "listGap":
                return "14";
            case "bulletSize":
                return "4";
            case "gridGapX":
            case "gridGapY":
                return "4";
            case "gridColumns":
            case "itemsPerView":
                return "3";
            case "rankNumberFontSize":
                return "24";
            case "rankNumberBorderRadius":
                return "999";
            case "autoplayMs":
                return "5000";
            case "slideTransitionMs":
                return "500";
            case "overlayOpacity":
                return "70";
            case "thumbnailVisibleCount":
                return "4";
            case "thumbnailImageHeight":
                return "72";
            default:
                return undefined;
        }
    };
    const getConfigString = (key: string, fallback = ""): string => {
        const resolved = getBaseConfigString(key, fallback);
        if (resolved !== "" || fallback !== "") return resolved;
        return getNumericDisplayDefault(key) ?? resolved;
    };

    const getConfigStringArray = (key: string) => normalizeSlugArray(getConfigRaw(key));
    const getSelectedCategoryIncludeSlugs = () => {
        const direct = getConfigStringArray("categorySlugs");
        if (direct.length > 0) return direct;
        const legacyCategorySlug = getConfigString("categorySlug", getConfigString("category", "all"));
        return legacyCategorySlug && legacyCategorySlug !== "all" ? [legacyCategorySlug] : [];
    };
    const getSelectedCategoryExcludeSlugs = () => getConfigStringArray("excludeCategorySlugs");
    const setSelectedCategoryIncludeSlugs = (slugs: string[]) => {
        const normalized = normalizeSlugArray(slugs);
        const legacyValue = normalized.length === 1 ? normalized[0] : "all";
        updateChildConfig("categorySlugs", normalized);
        updateChildConfig("categorySlug", legacyValue);
        updateChildConfig("category", legacyValue);
    };
    const setSelectedCategoryExcludeSlugs = (slugs: string[]) => {
        updateChildConfig("excludeCategorySlugs", normalizeSlugArray(slugs));
    };
    const getSelectedTagIncludeSlugs = () => {
        const direct = getConfigStringArray("tagSlugs");
        if (direct.length > 0) return direct;
        const legacyTagSlug = getConfigString("tagSlug");
        return legacyTagSlug ? [legacyTagSlug] : [];
    };
    const getSelectedTagExcludeSlugs = () => getConfigStringArray("excludeTagSlugs");
    const setSelectedTagIncludeSlugs = (slugs: string[]) => {
        const normalized = normalizeSlugArray(slugs);
        const legacyValue = normalized.length === 1 ? normalized[0] : "";
        updateChildConfig("tagSlugs", normalized);
        updateChildConfig("tagSlug", legacyValue);
    };
    const setSelectedTagExcludeSlugs = (slugs: string[]) => {
        updateChildConfig("excludeTagSlugs", normalizeSlugArray(slugs));
    };
    const renderSlugSelectionList = (options: {
        label: string;
        selectedSlugs: string[];
        onChange: (slugs: string[]) => void;
        emptyStateLabel: string;
        helperText: string;
        selectedLabel: string;
        emptyDataText: string;
        items: Array<{ id: string; slug: string; name: string }>;
    }) => (
        <BlockConfigPanelSlugSelectionList
            {...options}
            renderSearchableMultiSelect={({ label, items, selectedSlugs, onChange, helperText, emptyDataText }) => (
                <SearchableMultiSelect
                    label={label}
                    items={items}
                    selectedSlugs={selectedSlugs}
                    onChange={onChange}
                    placeholder={`Pilih ${label.toLowerCase()}...`}
                    helperText={helperText}
                    emptyDataText={emptyDataText}
                />
            )}
        />
    );
    const renderSharedSourceFilterFields = () => (
        <BlockConfigPanelSharedSourceFilterFields
            filterType={getConfigString("filterType", "category")}
            categories={categories}
            tags={tags}
            selectedCategoryIncludeSlugs={getSelectedCategoryIncludeSlugs()}
            selectedCategoryExcludeSlugs={getSelectedCategoryExcludeSlugs()}
            selectedTagIncludeSlugs={getSelectedTagIncludeSlugs()}
            selectedTagExcludeSlugs={getSelectedTagExcludeSlugs()}
            setSelectedCategoryIncludeSlugs={setSelectedCategoryIncludeSlugs}
            setSelectedCategoryExcludeSlugs={setSelectedCategoryExcludeSlugs}
            setSelectedTagIncludeSlugs={setSelectedTagIncludeSlugs}
            setSelectedTagExcludeSlugs={setSelectedTagExcludeSlugs}
            renderSlugSelectionList={renderSlugSelectionList}
        />
    );

    // Sidebar types
    const currentSidebarWidgetType = child.type === "sidebar_widget" ? getConfigString("widgetType", "popular_posts") : "";
    const currentSidebarWidgetLabel =
        currentSidebarWidgetType === "recent_posts"
            ? "Berita Terbaru"
            : currentSidebarWidgetType === "category_list"
            ? "Daftar Kategori"
            : currentSidebarWidgetType === "ad_slot"
            ? "Iklan / Ad Slot"
            : "Berita Populer";
    const isSidebarPostListType = currentSidebarWidgetType === "popular_posts" || currentSidebarWidgetType === "recent_posts";
    const isSidebarAdSlotType = currentSidebarWidgetType === "ad_slot";

    const handleSidebarWidgetTypeChange = (nextWidgetType: string) => {
        updateChildResponsiveConfig("widgetType", nextWidgetType);
        if (isSidebarWidgetAutoTitle(child.title)) {
            const nextTitle = getSidebarWidgetDefaultTitle(nextWidgetType, child.title);
            onUpdateTitle(nextTitle);
            updateChildConfig("title", nextTitle);
        }
    };

    const handleAdBannerSelection = (selectedId: string) => {
        const selectedAd = availableAds.find((ad) => ad.id === selectedId);
        updateChildConfig("selectedAdId", selectedId);
        updateChildConfig("position", selectedAd?.position || "");
    };

    // Ad Banner loading
    useEffect(() => {
        if (child.type !== "ad_banner" && child.type !== "sidebar_widget") return;
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
        const shouldForceVisualTab =
            widgetProfile.isVisualOnly ||
            (isFooterBuilder && !isImageWidget) ||
            (isArchiveBuilder && !shouldUseHomepageStyleAuxiliaryModal) ||
            (isPostBuilder && !shouldUseHomepageStyleAuxiliaryModal);
        if (shouldForceVisualTab && activeEditTab === 'content') {
            setActiveEditTab('visual');
        }
    }, [activeEditTab, isArchiveBuilder, isFooterBuilder, isImageWidget, isPostBuilder, setActiveEditTab, shouldUseHomepageStyleAuxiliaryModal, widgetProfile.isVisualOnly]);

    // Number Input Draft Logic (from Homepage Builder)
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
    const _handleResponsiveIntegerInputChange = (key: string, rawValue: string) => {
        const draftKey = getNumberDraftKey(key, "responsive");
        setResponsiveNumberDrafts((prev) => ({ ...prev, [draftKey]: rawValue }));
    };
    const _clearResponsiveIntegerDraft = (key: string, min?: number) => {
        commitDraftedNumberInput(key, { scope: "responsive", parser: "int", min });
    };
    const _getResponsiveNumberInputValue = (key: string, fallback = "") => getDraftedNumberInputValue(key, fallback, "responsive");
    const _getGlobalNumberInputValue = (key: string, fallback = "") => getDraftedNumberInputValue(key, fallback, "global");
    const _handleGlobalIntegerInputChange = (key: string, rawValue: string) => {
        const draftKey = getNumberDraftKey(key, "global");
        setResponsiveNumberDrafts((prev) => ({ ...prev, [draftKey]: rawValue }));
    };
    const _clearGlobalIntegerDraft = (key: string, min?: number, max?: number) => {
        commitDraftedNumberInput(key, { scope: "global", parser: "int", min, max });
    };

    // Footer states
    const [_footerCustomLinkLabel, _setFooterCustomLinkLabel] = useState("");
    const [_footerCustomLinkUrl, _setFooterCustomLinkUrl] = useState("");
    const [_footerCustomLinkNewTab, _setFooterCustomLinkNewTab] = useState(false);

    const openMediaLibraryForKey = (key: string) => {
        setMediaTargetKey(key);
        setShowMediaModal(true);
    };

    const handleMediaSelect = (file: { fileUrl: string }) => {
        if (mediaTargetKey) {
            updateChildConfig(mediaTargetKey, file.fileUrl);
        }
        setShowMediaModal(false);
        setMediaTargetKey(null);
    };

    const _getSideLabel = (side: string) => {
        switch (side) {
            case 'Top': return 'Atas';
            case 'Right': return 'Kanan';
            case 'Bottom': return 'Bawah';
            case 'Left': return 'Kiri';
            default: return side;
        }
    };

    const isArchiveNewsGrid = child.type === "archive_news_grid";
    const isArchiveHeroSlider = child.type === "archive_hero_slider";
    const _isArchiveSource = isArchiveNewsGrid || isArchiveHeroSlider;
    const isPostMetaWidget = child.type === "post_meta";
    const isPostContentWidget = child.type === "post_content";
    const isPostMetaAuthorVisible = isPostMetaWidget ? getConfigBool("showAuthor", true) : true;
    const isPostContentBorderEnabled = isPostContentWidget ? getConfigBool("showContentBorder", false) : false;
    const isPostTypographyWidget = ['post_title', 'post_subtitle', 'post_content', 'post_meta', 'post_stats'].includes(child.type);
    const isPostTypographyWithLineHeight = ['post_content', 'post_title', 'post_subtitle', 'post_stats'].includes(child.type);
    const postTypographySectionTitle = "Pengaturan Teks";
    const postBuilderTabPanelClass = "-mt-2 space-y-4 [&>*]:!mb-0 [&_.post-builder-panel-card]:!mb-0";
    const usesBuilderStyleTabPanels = ((isPostBuilder || isArchiveBuilder || isHeaderBuilder || isFooterBuilder) && !shouldUseHomepageStyleAuxiliaryModal);
    const resolveSharedPanelOptions = (options: string | SharedPanelOptions): SharedPanelOptions =>
        typeof options === "string" ? { copyTitle: options } : options;
    const isBulletListWidget = widgetProfile.isBulletListWidget;
    const isClassicHeroWidget = widgetProfile.isClassicHeroWidget;
    const isNewsFeedFamilyWidget = widgetProfile.isNewsFeedFamilyWidget;
    const isHeadlineBigWidget = widgetProfile.isHeadlineBigWidget;
    const isSidebarWidget = widgetProfile.isSidebarWidget;
    const isAdBannerWidget = widgetProfile.isAdBannerWidget;
    const isTagCloudWidget = widgetProfile.isTagCloudWidget;
    const isHeroSplit4Widget = widgetProfile.isHeroSplit4Widget;
    const isHeroSliderWidget = widgetProfile.isHeroSliderWidget;
    const isNewsListWidget = effectiveChildType === "news_list";
    const isNewsGridWidget = effectiveChildType === "news_grid";
    const isGridSliderWidget = effectiveChildType === "news_grid_slider";
    const isGridColumnsWidget = ["news_grid", "news_grid_slider"].includes(effectiveChildType);
    const hasArchiveDedicatedSections = isArchiveWidgetWithDedicatedSections(child.type);
    const hasArchiveSharedVisualSections = isArchiveWidgetWithSharedVisualSections(child.type);
    const canRenderSharedVisibilitySettings = !widgetProfile.isReferenceStyleWidget;
    const canRenderGenericNewsVisibility = isEffectiveNewsType && !isClassicHeroWidget && !isBulletListWidget && !isNewsFeedFamilyWidget && !isHeadlineBigWidget && !isHeroSplit4Widget && !isHeroSliderWidget;

    const CONTAINER_AT_BOTTOM_WIDGETS = [
        "post_tags",
        "post_navigation",
        "post_comments",
        "post_related_posts",
        "sidebar_widget",
        "tag_cloud",
        "ad_banner",
        "archive_news_grid",
        "classic_hero",
        "news_list",
        "news_grid",
        "news_bullet_list",
        "news_grid_slider",
        "news_hero_split_4",
        "news_hero_slider"
    ];
    const shouldRenderContainerAtBottom =
        CONTAINER_AT_BOTTOM_WIDGETS.includes(childType) ||
        CONTAINER_AT_BOTTOM_WIDGETS.includes(effectiveChildType);
    const canRenderBottomContainerSettings =
        !isPostBuilder && shouldRenderContainerAtBottom && !isClassicHeroWidget && !isBulletListWidget && !isNewsFeedFamilyWidget && !isHeadlineBigWidget && !isSidebarWidget && !isTagCloudWidget && !isAdBannerWidget;
    const canRenderGenericWidgetSettings =
        !isHeaderWidget &&
        !isImageWidget && !isPostBuilder && !isClassicHeroWidget && !isBulletListWidget && !isNewsFeedFamilyWidget && !isHeadlineBigWidget && !isSidebarWidget && !isTagCloudWidget && !isAdBannerWidget && !hasArchiveDedicatedSections;
    const canRenderResponsiveVisibilitySettings =
        !isClassicHeroWidget && !isBulletListWidget && !isNewsFeedFamilyWidget && !isHeadlineBigWidget && !isSidebarWidget && !isTagCloudWidget && !isHeroSplit4Widget && !isHeroSliderWidget;
    const contentSectionKey = getWidgetPanelSectionKey(activeTheme, childType);
    const advancedSectionKey = contentSectionKey;
    const visualSectionKey = contentSectionKey;
    const shouldShowVisualDeviceInfo =
        Boolean(getVisualDeviceInfoMessage()) && !isClassicHeroWidget && !isBulletListWidget && !isHeroSplit4Widget;
    const isBuiltInPostVisualWidget = [
        "post_breadcrumb",
        "post_title",
        "post_subtitle",
        "post_meta",
        "post_stats",
        "post_featured_image",
        "post_share",
        "post_content",
        "post_tags",
        "post_author_box",
        "post_navigation",
        "post_comments",
        "post_related_posts",
    ].includes(child.type);
    const canRenderGenericVisualStyleCard =
        !isHeaderWidget &&
        !isFooterWidget &&
        !isBuiltInPostVisualWidget &&
        !isImageWidget &&
        !isBulletListWidget &&
        !isClassicHeroWidget &&
        !isNewsFeedFamilyWidget &&
        !isHeadlineBigWidget &&
        !isHeroSplit4Widget &&
        !isHeroSliderWidget &&
        !isSidebarWidget &&
        !isTagCloudWidget &&
        !isAdBannerWidget &&
        !hasArchiveDedicatedSections;
    const genericVisualCommonProps = {
        child,
        globalSurfaceTone,
        globalBorderTone,
        globalWidgetTitleColor,
        globalAccentTone,
        globalNewsTitleColor,
        globalHoverColor,
        globalMetaTone,
        globalExcerptTone,
        heroControlClass: HERO_CONTROL_CLASS,
        heroColorTriggerClass: HERO_COLOR_TRIGGER_CLASS,
        heroColorSwatchClass: HERO_COLOR_SWATCH_CLASS,
        heroColorInputClass: HERO_COLOR_INPUT_CLASS,
        getConfigBool,
        getConfigString,
        getConfigValue,
        getConfigForApply,
        applyToAllDevices,
        updateChildResponsiveConfig,
        updateChildConfig,
        renderHeroTextSection,
        ColorPicker,
    };
    const canShowGenericBackgroundSection = !isBulletListWidget && !isSidebarWidget;
    const canShowGenericThumbnailSection =
        child.type !== "ad_banner" &&
        child.type !== "tag_cloud" &&
        child.type !== "sidebar_widget" &&
        child.type !== "image_widget" &&
        !child.type.startsWith("post_") &&
        !isBulletListWidget;
    const canShowGenericTitleSection =
        child.type !== "ad_banner" &&
        child.type !== "tag_cloud" &&
        child.type !== "sidebar_widget" &&
        child.type !== "image_widget" &&
        !["post_title", "post_subtitle", "post_content", "post_breadcrumb", "post_navigation", "post_comments", "post_related_posts"].includes(child.type);
    const canShowGenericMetaSection = isEffectiveNewsType && !isBulletListWidget;
    const canShowGenericExcerptSection = isEffectiveNewsType && !isBulletListWidget;
    const postVisualSharedProps = {
        child,
        deviceLabel,
        getConfigBool,
        getConfigString,
        getConfigValue,
        getConfigForApply,
        applyToAllDevices,
        updateChildResponsiveConfig,
        updateChildConfig,
        ColorPicker,
    };
    const postVisualControlProps = {
        heroControlClass: HERO_CONTROL_CLASS,
        heroColorTriggerClass: HERO_COLOR_TRIGGER_CLASS,
        heroColorSwatchClass: HERO_COLOR_SWATCH_CLASS,
        heroColorInputClass: HERO_COLOR_INPUT_CLASS,
    };
    const postVisualToneProps = {
        globalSurfaceTone,
        globalBorderTone,
        globalAccentTone,
        globalMetaTone,
        globalNewsTitleColor,
        globalHoverColor,
        globalPostLinkTone,
        globalWidgetTitleColor,
        globalExcerptTone,
    };
    const postVisualCommonProps = {
        ...postVisualSharedProps,
        ...postVisualControlProps,
        ...postVisualToneProps,
    };

    const renderMainContainerSettings = () => (
        <BlockConfigPanelMainContainerSection
            child={child}
            deviceLabel={deviceLabel}
            isClassicHeroWidget={isClassicHeroWidget}
            isBulletListWidget={isBulletListWidget}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalSurfaceTone={globalSurfaceTone}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            ColorPicker={ColorPicker}
            openMediaLibraryForKey={openMediaLibraryForKey}
        />
    );

    const renderBulletListContentSettings = () => (
        <BlockConfigPanelBulletListContentSection
            child={child}
            heroControlClass={HERO_CONTROL_CLASS}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalAccentTone={globalAccentTone}
            globalNewsTitleColor={globalNewsTitleColor}
            globalHoverColor={globalHoverColor}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderHeroTextSection={renderHeroTextSection}
            ColorPicker={ColorPicker}
        />
    );

    const renderBulletListSourceSettings = () => (
        <BlockConfigPanelBulletListSourceSection
            heroTextControlClass={HERO_TEXT_CONTROL_CLASS}
            heroControlClass={HERO_CONTROL_CLASS}
            getConfigString={getConfigString}
            updateChildConfig={updateChildConfig}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            renderSharedSourceFilterFields={renderSharedSourceFilterFields}
        />
    );

    const renderNewsFeedSourceSettings = (options?: { sectionTitle?: string; paginationSectionTitle?: string }) => (
        <BlockConfigPanelNewsFeedSourceSection
            heroTextControlClass={HERO_TEXT_CONTROL_CLASS}
            heroControlClass={HERO_CONTROL_CLASS}
            getConfigString={getConfigString}
            updateChildConfig={updateChildConfig}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            renderSharedSourceFilterFields={renderSharedSourceFilterFields}
            isNewsListWidget={isNewsListWidget}
            sectionTitle={options?.sectionTitle}
            paginationSectionTitle={options?.paginationSectionTitle}
        />
    );

    const renderHeroContentSettings = () => (
        <BlockConfigPanelHeroContentSection
            heroTextControlClass={HERO_TEXT_CONTROL_CLASS}
            heroControlClass={HERO_CONTROL_CLASS}
            getConfigString={getConfigString}
            updateChildConfig={updateChildConfig}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            renderSharedSourceFilterFields={renderSharedSourceFilterFields}
        />
    );

    const renderHeroLayoutSettings = () => (
        <BlockConfigPanelHeroLayoutSection
            isClassicHeroWidget={isClassicHeroWidget}
            heroControlClass={HERO_CONTROL_CLASS}
            getConfigString={getConfigString}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
        />
    );

    function renderHeroTextSection(title: string, content: React.ReactNode) {
        return (
            <details className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-2.5">
                <summary className="cursor-pointer text-xs font-medium text-[var(--fg-primary)]">
                    {title}
                </summary>
                <div className="mt-2.5 space-y-2.5">
                    {content}
                </div>
            </details>
        );
    }

    const renderSharedCategoryTextSection = (options: BlockConfigPanelSharedCategoryTextOptions) => (
        <BlockConfigPanelSharedCategoryTextSection
            {...options}
            child={child}
            heroControlClass={HERO_CONTROL_CLASS}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalMetaTone={globalMetaTone}
            globalExcerptTone={globalExcerptTone}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderHeroTextSection={renderHeroTextSection}
            ColorPicker={ColorPicker}
        />
    );

    const renderSharedTitleTextSection = (options: BlockConfigPanelSharedTitleTextOptions) => (
        <BlockConfigPanelSharedTitleTextSection
            {...options}
            child={child}
            heroControlClass={HERO_CONTROL_CLASS}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalMetaTone={globalMetaTone}
            globalExcerptTone={globalExcerptTone}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderHeroTextSection={renderHeroTextSection}
            ColorPicker={ColorPicker}
        />
    );

    const renderSharedMetaTextSection = () => (
        <BlockConfigPanelSharedMetaTextSection
            child={child}
            heroControlClass={HERO_CONTROL_CLASS}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalMetaTone={globalMetaTone}
            globalExcerptTone={globalExcerptTone}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderHeroTextSection={renderHeroTextSection}
            ColorPicker={ColorPicker}
        />
    );

    const renderSharedExcerptTextSection = () => (
        <BlockConfigPanelSharedExcerptTextSection
            child={child}
            heroControlClass={HERO_CONTROL_CLASS}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalMetaTone={globalMetaTone}
            globalExcerptTone={globalExcerptTone}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderHeroTextSection={renderHeroTextSection}
            ColorPicker={ColorPicker}
        />
    );

    const renderHeroTextSettings = () => (
        <BlockConfigPanelHeroTextSettingsSection
            isClassicHeroWidget={isClassicHeroWidget}
            globalAccentTone={globalAccentTone}
            globalNewsTitleColor={globalNewsTitleColor}
            globalHoverColor={globalHoverColor}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            renderSharedCategoryTextSection={renderSharedCategoryTextSection}
            renderSharedTitleTextSection={renderSharedTitleTextSection}
            renderSharedMetaTextSection={renderSharedMetaTextSection}
            renderSharedExcerptTextSection={renderSharedExcerptTextSection}
        />
    );

    const renderNewsFeedStyleSettings = () => (
        <BlockConfigPanelNewsFeedVisualSection
            child={child}
            effectiveChildType={effectiveChildType}
            isNewsListWidget={isNewsListWidget}
            isGridColumnsWidget={isGridColumnsWidget}
            isNewsGridWidget={isNewsGridWidget}
            isGridSliderWidget={isGridSliderWidget}
            heroControlClass={HERO_CONTROL_CLASS}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalWidgetTitleColor={globalWidgetTitleColor}
            globalAccentTone={globalAccentTone}
            globalNewsTitleColor={globalNewsTitleColor}
            globalHoverColor={globalHoverColor}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderHeroTextSection={renderHeroTextSection}
            renderSharedCategoryTextSection={renderSharedCategoryTextSection}
            renderSharedTitleTextSection={renderSharedTitleTextSection}
            renderSharedMetaTextSection={renderSharedMetaTextSection}
            renderSharedExcerptTextSection={renderSharedExcerptTextSection}
            ColorPicker={ColorPicker}
        />
    );

    const renderHeadlineBigContentSettings = () => (
        <BlockConfigPanelHeadlineBigContentSection
            heroTextControlClass={HERO_TEXT_CONTROL_CLASS}
            heroControlClass={HERO_CONTROL_CLASS}
            getConfigString={getConfigString}
            updateChildConfig={updateChildConfig}
            renderSharedSourceFilterFields={renderSharedSourceFilterFields}
        />
    );

    const renderHeadlineBigStyleSettings = () => (
        <BlockConfigPanelHeadlineBigStyleSection
            child={child}
            heroControlClass={HERO_CONTROL_CLASS}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalWidgetTitleColor={globalWidgetTitleColor}
            globalAccentTone={globalAccentTone}
            globalNewsTitleColor={globalNewsTitleColor}
            globalHoverColor={globalHoverColor}
            globalSurfaceTone={globalSurfaceTone}
            globalBorderTone={globalBorderTone}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderHeroTextSection={renderHeroTextSection}
            renderSharedCategoryTextSection={renderSharedCategoryTextSection}
            renderSharedTitleTextSection={renderSharedTitleTextSection}
            renderSharedMetaTextSection={renderSharedMetaTextSection}
            renderSharedExcerptTextSection={renderSharedExcerptTextSection}
            ColorPicker={ColorPicker}
        />
    );

    const renderHeadlineBigAdvancedSettings = () => (
        <BlockConfigPanelHeadlineBigAdvancedSection
            renderSharedVisibilitySettings={renderSharedVisibilitySettings}
            renderSharedBoxBackgroundSettings={renderSharedBoxBackgroundSettings}
            renderSharedWidgetSpacingSettings={renderSharedWidgetSpacingSettings}
        />
    );

    const renderHeroSplit4ContentSettings = () => (
        <BlockConfigPanelHeroSplit4ContentSection
            heroTextControlClass={HERO_TEXT_CONTROL_CLASS}
            heroControlClass={HERO_CONTROL_CLASS}
            getConfigString={getConfigString}
            updateChildConfig={updateChildConfig}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            renderSharedSourceFilterFields={renderSharedSourceFilterFields}
        />
    );

    const renderHeroSplit4CategorySection = ({
        title,
        showKey,
        textKey,
        bgKey,
        sizeKey,
        textDefault,
        bgDefault,
    }: {
        title: string;
        showKey: string;
        textKey: string;
        bgKey: string;
        sizeKey: string;
        textDefault: string;
        bgDefault: string;
    }) => renderHeroTextSection(title, (
        <>
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--fg-secondary)]">Tampil</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={getConfigBool(showKey, true)}
                        onChange={(e) => updateChildResponsiveConfig(showKey, e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
                    <input
                        type="number"
                        className={HERO_CONTROL_CLASS}
                        value={getConfigString(sizeKey)}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            updateChildResponsiveConfig(sizeKey, isNaN(val) ? undefined : val);
                        }}
                    />
                </div>
                <ColorPicker
                    label="Teks"
                    configKey={textKey}
                    globalDefault={textDefault}
                    triggerClassName={HERO_COLOR_TRIGGER_CLASS}
                    swatchClassName={HERO_COLOR_SWATCH_CLASS}
                    inputClassName={HERO_COLOR_INPUT_CLASS}
                    child={child}
                    getConfigValue={getConfigValue}
                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                    updateChildConfig={updateChildConfig}
                />
                <ColorPicker
                    label="BG"
                    configKey={bgKey}
                    globalDefault={bgDefault}
                    triggerClassName={HERO_COLOR_TRIGGER_CLASS}
                    swatchClassName={HERO_COLOR_SWATCH_CLASS}
                    inputClassName={HERO_COLOR_INPUT_CLASS}
                    child={child}
                    getConfigValue={getConfigValue}
                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                    updateChildConfig={updateChildConfig}
                />
            </div>
        </>
    ));

    const renderHeroSplit4TitleSection = ({
        title,
        colorKey,
        hoverKey,
        sizeKey,
        lineHeightKey,
        fontWeightKey,
        colorDefault,
        hoverDefault,
        fontWeightDefault,
    }: {
        title: string;
        colorKey: string;
        hoverKey: string;
        sizeKey: string;
        lineHeightKey: string;
        fontWeightKey: string;
        colorDefault: string;
        hoverDefault: string;
        fontWeightDefault: string;
    }) => renderHeroTextSection(title, (
        <div className="grid grid-cols-2 gap-2">
            <ColorPicker
                label="Teks"
                configKey={colorKey}
                globalDefault={colorDefault}
                triggerClassName={HERO_COLOR_TRIGGER_CLASS}
                swatchClassName={HERO_COLOR_SWATCH_CLASS}
                inputClassName={HERO_COLOR_INPUT_CLASS}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
            />
            <ColorPicker
                label="Sorot"
                configKey={hoverKey}
                globalDefault={hoverDefault}
                triggerClassName={HERO_COLOR_TRIGGER_CLASS}
                swatchClassName={HERO_COLOR_SWATCH_CLASS}
                inputClassName={HERO_COLOR_INPUT_CLASS}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
            />
            <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
                <input
                    type="number"
                    className={HERO_CONTROL_CLASS}
                    value={getConfigString(sizeKey)}
                    onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        updateChildResponsiveConfig(sizeKey, isNaN(val) ? undefined : val);
                    }}
                />
            </div>
            <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Baris</label>
                <input
                    type="number"
                    step="0.1"
                    className={HERO_CONTROL_CLASS}
                    value={getConfigString(lineHeightKey)}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        updateChildResponsiveConfig(lineHeightKey, isNaN(val) ? undefined : val);
                    }}
                />
            </div>
            <div className="col-span-2">
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
                <select
                    className={HERO_CONTROL_CLASS}
                    value={getConfigString(fontWeightKey, fontWeightDefault)}
                    onChange={(e) => updateChildResponsiveConfig(fontWeightKey, e.target.value)}
                >
                    <option value="400">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi Bold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra Bold (800)</option>
                </select>
            </div>
        </div>
    ));

    const renderHeroSplit4MetaSection = ({
        title,
        showMetaKey,
        showAuthorKey,
        showDateKey,
        colorKey,
        fontSizeKey,
        colorDefault,
    }: {
        title: string;
        showMetaKey: string;
        showAuthorKey: string;
        showDateKey: string;
        colorKey: string;
        fontSizeKey: string;
        colorDefault: string;
    }) => renderHeroTextSection(title, (
        <>
            <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        checked={getConfigBool(showMetaKey, true)}
                        onChange={(e) => updateChildResponsiveConfig(showMetaKey, e.target.checked)}
                    />
                    <span className="text-[10px] text-[var(--fg-secondary)]">Tampil</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        checked={getConfigBool(showAuthorKey, true)}
                        onChange={(e) => updateChildResponsiveConfig(showAuthorKey, e.target.checked)}
                    />
                    <span className="text-[10px] text-[var(--fg-secondary)]">Author</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        checked={getConfigBool(showDateKey, true)}
                        onChange={(e) => updateChildResponsiveConfig(showDateKey, e.target.checked)}
                    />
                    <span className="text-[10px] text-[var(--fg-secondary)]">Tanggal</span>
                </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
                    <input
                        type="number"
                        className={HERO_CONTROL_CLASS}
                        value={getConfigString(fontSizeKey)}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            updateChildResponsiveConfig(fontSizeKey, isNaN(val) ? undefined : val);
                        }}
                    />
                </div>
                <ColorPicker
                    label="Warna"
                    configKey={colorKey}
                    globalDefault={colorDefault}
                    triggerClassName={HERO_COLOR_TRIGGER_CLASS}
                    swatchClassName={HERO_COLOR_SWATCH_CLASS}
                    inputClassName={HERO_COLOR_INPUT_CLASS}
                    child={child}
                    getConfigValue={getConfigValue}
                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                    updateChildConfig={updateChildConfig}
                />
            </div>
        </>
    ));

    const renderHeroSplit4ExcerptSection = ({
        title,
        showKey,
        lengthKey,
        colorKey,
        fontSizeKey,
        lineHeightKey,
        colorDefault,
        showLength = true,
    }: {
        title: string;
        showKey: string;
        lengthKey: string;
        colorKey: string;
        fontSizeKey: string;
        lineHeightKey: string;
        colorDefault: string;
        showLength?: boolean;
    }) => renderHeroTextSection(title, (
        <>
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--fg-secondary)]">Tampil</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={getConfigBool(showKey, true)}
                        onChange={(e) => updateChildResponsiveConfig(showKey, e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {showLength && (
                    <div>
                        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Panjang</label>
                        <input
                            type="number"
                            min={0}
                            className={HERO_CONTROL_CLASS}
                            value={getConfigString(lengthKey)}
                            onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                updateChildConfig(lengthKey, isNaN(val) ? undefined : val);
                            }}
                        />
                    </div>
                )}
                <div>
                    <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
                    <input
                        type="number"
                        className={HERO_CONTROL_CLASS}
                        value={getConfigString(fontSizeKey)}
                        onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            updateChildResponsiveConfig(fontSizeKey, isNaN(val) ? undefined : val);
                        }}
                    />
                </div>
                <div>
                    <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Baris</label>
                    <input
                        type="number"
                        step="0.1"
                        className={HERO_CONTROL_CLASS}
                        value={getConfigString(lineHeightKey)}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateChildResponsiveConfig(lineHeightKey, isNaN(val) ? undefined : val);
                        }}
                    />
                </div>
                <ColorPicker
                    label="Warna"
                    configKey={colorKey}
                    globalDefault={colorDefault}
                    triggerClassName={HERO_COLOR_TRIGGER_CLASS}
                    swatchClassName={HERO_COLOR_SWATCH_CLASS}
                    inputClassName={HERO_COLOR_INPUT_CLASS}
                    child={child}
                    getConfigValue={getConfigValue}
                    updateChildResponsiveConfig={updateChildResponsiveConfig}
                    updateChildConfig={updateChildConfig}
                />
            </div>
        </>
    ));

    const renderHeroSplit4StyleSettings = () => (
        <BlockConfigPanelHeroSplitVisualSection
            child={child}
            heroControlClass={HERO_CONTROL_CLASS}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalAccentTone={globalAccentTone}
            globalWidgetTitleColor={globalWidgetTitleColor}
            globalNewsTitleColor={globalNewsTitleColor}
            globalHoverColor={globalHoverColor}
            globalMetaTone={globalMetaTone}
            globalExcerptTone={globalExcerptTone}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderHeroTextSection={renderHeroTextSection}
            renderHeroSplit4CategorySection={renderHeroSplit4CategorySection}
            renderHeroSplit4TitleSection={renderHeroSplit4TitleSection}
            renderHeroSplit4MetaSection={renderHeroSplit4MetaSection}
            renderHeroSplit4ExcerptSection={renderHeroSplit4ExcerptSection}
            ColorPicker={ColorPicker}
        />
    );

    const renderHeroSplit4AdvancedSettings = () => (
        <BlockConfigPanelHeroSplit4AdvancedSection
            renderSharedVisibilitySettings={renderSharedVisibilitySettings}
            renderSharedBoxBackgroundSettings={renderSharedBoxBackgroundSettings}
            renderSharedWidgetSpacingSettings={renderSharedWidgetSpacingSettings}
        />
    );

    const renderHeroSliderContentSettings = (options?: {
        sectionTitle?: string;
        badgeLabel?: string;
        hideSourceControls?: boolean;
        sourceInfoText?: string;
        extraSections?: React.ReactNode;
    }) => (
        <BlockConfigPanelHeroSliderContentSection
            heroTextControlClass={HERO_TEXT_CONTROL_CLASS}
            heroControlClass={HERO_CONTROL_CLASS}
            getConfigString={getConfigString}
            updateChildConfig={updateChildConfig}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            renderSharedSourceFilterFields={renderSharedSourceFilterFields}
            sectionTitle={options?.sectionTitle}
            badgeLabel={options?.badgeLabel}
            hideSourceControls={options?.hideSourceControls}
            sourceInfoText={options?.sourceInfoText}
            extraSections={options?.extraSections}
        />
    );

    const renderHeroSliderStyleSettings = (options?: {
        hideMediaSection?: boolean;
        hideNavigationSection?: boolean;
        hideMiniThumbnailSection?: boolean;
    }) => (
        <BlockConfigPanelHeroSliderVisualSection
            child={child}
            heroControlClass={HERO_CONTROL_CLASS}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalAccentTone={globalAccentTone}
            globalWidgetTitleColor={globalWidgetTitleColor}
            globalNewsTitleColor={globalNewsTitleColor}
            globalHoverColor={globalHoverColor}
            globalMetaTone={globalMetaTone}
            globalExcerptTone={globalExcerptTone}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderHeroTextSection={renderHeroTextSection}
            ColorPicker={ColorPicker}
            hideMediaSection={options?.hideMediaSection}
            hideNavigationSection={options?.hideNavigationSection}
            hideMiniThumbnailSection={options?.hideMiniThumbnailSection}
        />
    );

    const renderHeroSliderAdvancedSettings = () => (
        <BlockConfigPanelHeroSliderAdvancedSection
            deviceLabel={deviceLabel}
            heroControlClass={HERO_CONTROL_CLASS}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderSharedVisibilitySettings={renderSharedVisibilitySettings}
            renderSharedBoxBackgroundSettings={renderSharedBoxBackgroundSettings}
            renderSharedWidgetSpacingSettings={renderSharedWidgetSpacingSettings}
        />
    );

    const renderSidebarWidgetStyleSettings = () => (
        <BlockConfigPanelSidebarWidgetVisualSection
            child={child}
            isSidebarPostListType={isSidebarPostListType}
            heroControlClass={HERO_CONTROL_CLASS}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalWidgetTitleColor={globalWidgetTitleColor}
            globalAccentTone={globalAccentTone}
            globalNewsTitleColor={globalNewsTitleColor}
            globalHoverColor={globalHoverColor}
            globalMetaTone={globalMetaTone}
            globalSurfaceTone={globalSurfaceTone}
            globalBorderTone={globalBorderTone}
            globalExcerptTone={globalExcerptTone}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderHeroTextSection={renderHeroTextSection}
            renderSharedCategoryTextSection={renderSharedCategoryTextSection}
            ColorPicker={ColorPicker}
        />
    );

    const renderSidebarWidgetContentSettings = (options?: { sectionTitle?: string }) => (
        <BlockConfigPanelSidebarWidgetContentSection
            deviceLabel={deviceLabel}
            controlClassName={HERO_CONTROL_CLASS}
            currentSidebarWidgetType={currentSidebarWidgetType}
            isSidebarAdSlotType={isSidebarAdSlotType}
            getConfigString={getConfigString}
            updateChildConfig={updateChildConfig}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            onSidebarWidgetTypeChange={handleSidebarWidgetTypeChange}
            sectionTitle={options?.sectionTitle}
        />
    );

    const renderSidebarWidgetAdvancedSettings = () => (
        <BlockConfigPanelBasicAdvancedSection
            backgroundCopyTitle="Terapkan background Sidebar Widget ke semua device"
            spacingCopyTitle="Terapkan margin dan padding Sidebar Widget ke semua device"
            renderSharedVisibilitySettings={renderSharedVisibilitySettings}
            renderSharedBoxBackgroundSettings={renderSharedBoxBackgroundSettings}
            renderSharedWidgetSpacingSettings={renderSharedWidgetSpacingSettings}
        />
    );

    const renderTagCloudContentSettings = (options?: { sectionTitle?: string; applyAllTitle?: string }) => (
        <BlockConfigPanelTagCloudContentSection
            deviceLabel={deviceLabel}
            controlClassName={HERO_CONTROL_CLASS}
            getConfigString={getConfigString}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            sectionTitle={options?.sectionTitle}
            applyAllTitle={options?.applyAllTitle}
        />
    );

    const renderTagCloudStyleSettings = () => (
        <BlockConfigPanelTagCloudVisualSection
            child={child}
            heroControlClass={HERO_CONTROL_CLASS}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalWidgetTitleColor={globalWidgetTitleColor}
            globalAccentTone={globalAccentTone}
            globalNewsTitleColor={globalNewsTitleColor}
            globalHoverColor={globalHoverColor}
            globalMetaTone={globalMetaTone}
            globalSurfaceTone={globalSurfaceTone}
            globalBorderTone={globalBorderTone}
            globalExcerptTone={globalExcerptTone}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderHeroTextSection={renderHeroTextSection}
            ColorPicker={ColorPicker}
        />
    );

    const renderTagCloudAdvancedSettings = () => (
        <BlockConfigPanelBasicAdvancedSection
            backgroundCopyTitle="Terapkan background Tag Cloud ke semua device"
            spacingCopyTitle="Terapkan margin dan padding Tag Cloud ke semua device"
            renderSharedVisibilitySettings={renderSharedVisibilitySettings}
            renderSharedBoxBackgroundSettings={renderSharedBoxBackgroundSettings}
            renderSharedWidgetSpacingSettings={renderSharedWidgetSpacingSettings}
        />
    );

    const renderAdBannerContentSettings = (options?: { sourceSectionTitle?: string; emptyStateSectionTitle?: string }) => (
        <BlockConfigPanelAdBannerContentSection
            controlClassName={HERO_CONTROL_CLASS}
            getConfigString={getConfigString}
            availableAds={availableAds}
            loadingAds={loadingAds}
            hideWhenEmpty={getConfigBool("hideWhenEmpty", false)}
            onSelectAd={handleAdBannerSelection}
            onToggleHideWhenEmpty={(nextValue) => updateChildConfig("hideWhenEmpty", nextValue)}
            sourceSectionTitle={options?.sourceSectionTitle}
            emptyStateSectionTitle={options?.emptyStateSectionTitle}
        />
    );

    const renderGenericNewsContentSettings = () => (
        <BlockConfigPanelGenericNewsContentSection
            effectiveChildType={effectiveChildType}
            getConfigString={getConfigString}
            updateChildConfig={updateChildConfig}
            renderSharedSourceFilterFields={renderSharedSourceFilterFields}
        />
    );

    const renderGlobalSidebarNotice = () => (
        <div className="p-4 bg-[var(--accent-subtle)] rounded-lg border border-[var(--border)] text-[var(--fg-secondary)] text-sm">
            <p className="font-medium">Widget ini mewarisi sidebar dari Homepage.</p>
            <p className="text-xs mt-1">Pengaturan konten dilakukan di Homepage Builder.</p>
        </div>
    );

    const renderRelatedPostsContentSettings = () => (
        <BlockConfigPanelRelatedPostsContentSection
            deviceLabel={deviceLabel}
            getConfigString={getConfigString}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
        />
    );

    const renderAdBannerStyleSettings = () => (
        <BlockConfigPanelAdBannerVisualSection
            child={child}
            heroControlClass={HERO_CONTROL_CLASS}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            globalWidgetTitleColor={globalWidgetTitleColor}
            globalAccentTone={globalAccentTone}
            globalNewsTitleColor={globalNewsTitleColor}
            globalHoverColor={globalHoverColor}
            globalMetaTone={globalMetaTone}
            globalSurfaceTone={globalSurfaceTone}
            globalBorderTone={globalBorderTone}
            globalExcerptTone={globalExcerptTone}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            renderHeroTextSection={renderHeroTextSection}
            ColorPicker={ColorPicker}
        />
    );

    const renderAdBannerAdvancedSettings = () => (
        <BlockConfigPanelBasicAdvancedSection
            backgroundCopyTitle="Terapkan background Iklan Banner ke semua device"
            spacingCopyTitle="Terapkan margin dan padding Iklan Banner ke semua device"
            renderSharedVisibilitySettings={renderSharedVisibilitySettings}
            renderSharedBoxBackgroundSettings={renderSharedBoxBackgroundSettings}
            renderSharedWidgetSpacingSettings={renderSharedWidgetSpacingSettings}
        />
    );

    const renderSharedVisibilitySettings = () => (
        <BlockConfigPanelSharedVisibilitySection
            isPostWidget={isPostWidget}
            getConfigBool={getConfigBool}
            updateChildConfig={updateChildConfig}
        />
    );

    const renderSharedBoxBackgroundSettings = (options: string | SharedPanelOptions) => {
        return (
        <BlockConfigPanelSharedBoxBackgroundSection
            options={resolveSharedPanelOptions(options)}
            child={child}
            globalSurfaceTone={globalSurfaceTone}
            globalBorderTone={globalBorderTone}
            heroColorTriggerClass={HERO_COLOR_TRIGGER_CLASS}
            heroColorSwatchClass={HERO_COLOR_SWATCH_CLASS}
            heroColorInputClass={HERO_COLOR_INPUT_CLASS}
            getConfigBool={getConfigBool}
            getConfigString={getConfigString}
            getConfigValue={getConfigValue}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            ColorPicker={ColorPicker}
            deviceLabel={deviceLabel}
            controlClassName={HERO_CONTROL_CLASS}
            isPostBuilder={isPostBuilder}
            openMediaLibraryForKey={openMediaLibraryForKey}
        />
    );
    };

    const renderSharedWidgetSpacingSettings = (options: string | SharedPanelOptions) => {
        return (
        <BlockConfigPanelSharedWidgetSpacingSection
            options={resolveSharedPanelOptions(options)}
            deviceLabel={deviceLabel}
            controlClassName={HERO_CONTROL_CLASS}
            isPostBuilder={isPostBuilder}
            getConfigString={getConfigString}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
        />
    );
    };

    const renderSharedContentAlignmentSettings = (options: string | SharedPanelOptions) => {
        return (
        <BlockConfigPanelSharedContentAlignmentSection
            options={resolveSharedPanelOptions(options)}
            deviceLabel={deviceLabel}
            isPostBuilder={isPostBuilder}
            getConfigString={getConfigString}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
        />
    );
    };

    const renderPostBuilderContentLayoutSection = () => (
        <BlockConfigPanelPostContentLayoutSection
            child={child}
            isPostWidget={isPostWidget}
            renderSharedContentAlignmentSettings={renderSharedContentAlignmentSettings}
        />
    );

    const TextField = ({
        label,
        value,
        onChange,
        className,
        placeholder,
    }: {
        label: string;
        value: string;
        onChange: (value: string) => void;
        className?: string;
        placeholder?: string;
    }) => (
        <div>
            <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">{label}</label>
            <input
                type="text"
                className={className}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );

    const ToggleField = ({
        label,
        checked,
        onChange,
    }: {
        label: string;
        checked: boolean;
        onChange: (value: boolean) => void;
    }) => (
        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
            <span className="text-xs font-medium text-[var(--fg-primary)]">{label}</span>
            <label className="relative inline-flex cursor-pointer items-center">
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <div className="h-5 w-9 rounded-full border border-[var(--border)] bg-[var(--bg-base)] transition-all peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-[var(--border)] after:bg-white after:transition-all after:content-['']"></div>
            </label>
        </div>
    );

    const SelectField = ({
        label,
        value,
        onChange,
        className,
        options,
    }: {
        label: string;
        value: string;
        onChange: (value: string) => void;
        className?: string;
        options: Array<{ value: string; label: string }>;
    }) => (
        <div>
            <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">{label}</label>
            <select
                className={className}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );

    const renderImageWidgetContentSettings = () => (
        <BlockConfigPanelImageWidgetSection
            TextField={TextField}
            ToggleField={ToggleField}
            controlClassName={HERO_TEXT_CONTROL_CLASS}
            getConfigString={getConfigString}
            getConfigBool={getConfigBool}
            updateChildConfig={(key, value) => updateChildConfig(key, value)}
            openMediaLibraryForKey={openMediaLibraryForKey}
        />
    );

    const renderImageWidgetVisualSettings = () => (
        <BlockConfigPanelImageWidgetVisualSection
            TextField={TextField}
            SelectField={SelectField}
            ToggleField={ToggleField}
            controlClassName={HERO_TEXT_CONTROL_CLASS}
            getConfigString={getConfigString}
            getConfigBool={getConfigBool}
            updateChildConfig={(key, value) => updateChildConfig(key, value)}
        />
    );

    const renderWidgetNameField = () => (
        <BlockConfigPanelWidgetNameField
            child={child}
            isPostBuilder={isPostBuilder}
            showInPostBuilder={shouldUseHomepageStyleAuxiliaryModal}
            isReferenceStyleWidget={widgetProfile.isReferenceStyleWidget || (isFooterBuilder && isImageWidget)}
            controlClassName={HERO_TEXT_CONTROL_CLASS}
            showTitle={getConfigBool("showTitle", true)}
            onUpdateTitle={onUpdateTitle}
        />
    );

    const renderHeroAdvancedSettings = () => (
        <BlockConfigPanelHeroAdvancedSection
            deviceLabel={deviceLabel}
            controlClassName={HERO_CONTROL_CLASS}
            getConfigString={getConfigString}
            getConfigForApply={getConfigForApply}
            applyToAllDevices={applyToAllDevices}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            renderSharedVisibilitySettings={renderSharedVisibilitySettings}
            renderSharedBoxBackgroundSettings={renderSharedBoxBackgroundSettings}
            renderSharedWidgetSpacingSettings={renderSharedWidgetSpacingSettings}
        />
    );

    const renderBulletListAdvancedSettings = () => (
        <div className="space-y-4">
            {renderSharedVisibilitySettings()}
            {renderSharedBoxBackgroundSettings("Terapkan background Bullet List ke semua device")}
            {renderSharedWidgetSpacingSettings("Terapkan margin dan padding Bullet List ke semua device")}
        </div>
    );

    const renderNewsFeedAdvancedSettings = () => (
        <div className="space-y-4">
            {renderSharedVisibilitySettings()}
            {renderSharedBoxBackgroundSettings("Terapkan background widget ke semua device")}
            {renderSharedWidgetSpacingSettings("Terapkan margin dan padding widget ke semua device")}
        </div>
    );

    const renderImageWidgetAdvancedSettings = () => (
        <div className="space-y-4">
            {renderSharedVisibilitySettings()}
            {renderSharedBoxBackgroundSettings("Terapkan background Widget Gambar ke semua device")}
            {renderSharedWidgetSpacingSettings("Terapkan margin dan padding Widget Gambar ke semua device")}
        </div>
    );

    function getVisualDeviceInfoMessage() {
        if (child.type.startsWith("post_")) {
            return null;
        }
        const base = `untuk device \` ${deviceLabel} \``;
        switch (child.type) {
            case "sidebar_widget":
                return null;
            case "ad_banner":
                return null;
            case "tag_cloud":
                return null;
            case "news_bullet_list":
                return `Anda sedang mengedit visual \`Bullet List\` ${base}. Tab ini fokus pada tipografi konten, sedangkan pengaturan container dan responsivitas dipindah ke tab lanjutan.`;
            case "classic_hero":
                return `Anda sedang mengedit visual \`Classic Hero\` ${base}. Pengaturan layout hero, teks hero, serta container widget di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "news_hero_split_4":
                return `Anda sedang mengedit visual \`Hero + 4 Mini\` ${base}. Pengaturan media, teks hero, teks mini, dan background widget di tab ini akan tersimpan terpisah untuk Desktop, Tablet, dan Mobile.`;
            case "news_hero_slider":
                return null;
            default:
                return null;
        }
    }

    const renderPostBuilderExtraAdvancedSettings = () => (
        <BlockConfigPanelPostBuilderExtraAdvancedSection
            isPostBuilder={isPostBuilder && !shouldUseHomepageStyleAuxiliaryModal}
            isPostContentWidget={isPostContentWidget}
            canRenderSharedVisibilitySettings={canRenderSharedVisibilitySettings}
            postBuilderTabPanelClass={postBuilderTabPanelClass}
            renderSharedVisibilitySettings={renderSharedVisibilitySettings}
            renderSharedBoxBackgroundSettings={renderSharedBoxBackgroundSettings}
            renderSharedWidgetSpacingSettings={renderSharedWidgetSpacingSettings}
        />
    );

    const renderContentTabSettings = () => (
        isHeaderWidget ? (
            <div className="space-y-6">
                {renderWidgetNameField()}
                {renderHeaderContentSections({
                    child,
                    controlClassName: HERO_CONTROL_CLASS,
                    colorTriggerClassName: HERO_COLOR_TRIGGER_CLASS,
                    colorSwatchClassName: HERO_COLOR_SWATCH_CLASS,
                    colorInputClassName: HERO_COLOR_INPUT_CLASS,
                    getConfigBool,
                    getConfigString,
                    getConfigValue,
                    updateChildConfig,
                    updateChildResponsiveConfig,
                    ColorPicker,
                    openMediaLibraryForKey,
                })}
            </div>
        ) : (
            <BlockConfigPanelContentSections
                sectionKey={contentSectionKey}
                canRenderGenericNewsVisibility={canRenderGenericNewsVisibility}
                showSidebarWidgetContent={child.type === "sidebar_widget"}
                showGlobalSidebarNotice={child.type === "global_sidebar"}
                showTagCloudContent={isTagCloudWidget}
                showRelatedPostsContent={child.type === "post_related_posts"}
                showImageWidgetContent={isImageWidget}
                renderWidgetNameField={renderWidgetNameField}
                renderGenericNewsContentSettings={renderGenericNewsContentSettings}
                renderHeroContentSettings={renderHeroContentSettings}
                renderBulletListSourceSettings={renderBulletListSourceSettings}
                renderNewsFeedSourceSettings={renderNewsFeedSourceSettings}
                renderHeadlineBigContentSettings={renderHeadlineBigContentSettings}
                renderHeroSplit4ContentSettings={renderHeroSplit4ContentSettings}
                renderHeroSliderContentSettings={renderHeroSliderContentSettings}
                renderAdBannerContentSettings={renderAdBannerContentSettings}
                renderSidebarWidgetContentSettings={renderSidebarWidgetContentSettings}
                renderGlobalSidebarNotice={renderGlobalSidebarNotice}
                renderTagCloudContentSettings={renderTagCloudContentSettings}
                renderRelatedPostsContentSettings={renderRelatedPostsContentSettings}
                renderImageWidgetContentSettings={renderImageWidgetContentSettings}
            />
        )
    );

    return (
        <ActiveDeviceTabContext.Provider value={activeDeviceTab}>
        <div className="flex flex-col h-full flex-1 min-h-0 page-builder-config-theme">
            <div className="p-6 overflow-y-auto overscroll-contain space-y-6 flex-1 min-h-0">
                    {activeEditTab === "content" ? (
                        renderContentTabSettings()
                    ) : activeEditTab === "visual" ? (
                        <div className={usesBuilderStyleTabPanels ? postBuilderTabPanelClass : "space-y-6"}>
                            {shouldShowVisualDeviceInfo && (
                                <div className="rounded-lg border border-[color:var(--accent)/0.2] bg-[color:var(--accent)/0.06] px-3 py-2 text-[11px] text-[var(--fg-secondary)]">
                                    {getVisualDeviceInfoMessage()}
                                </div>
                            )}
                            {isArchiveBuilder && (hasArchiveDedicatedSections || hasArchiveSharedVisualSections) && renderWidgetNameField()}
                            {isArchiveBuilder && !hasArchiveDedicatedSections && !hasArchiveSharedVisualSections && renderContentTabSettings()}
                            {renderArchiveVisualSections({
                                child,
                                heroControlClass: HERO_CONTROL_CLASS,
                                heroColorTriggerClass: HERO_COLOR_TRIGGER_CLASS,
                                heroColorSwatchClass: HERO_COLOR_SWATCH_CLASS,
                                heroColorInputClass: HERO_COLOR_INPUT_CLASS,
                                globalWidgetTitleColor,
                                globalAccentTone,
                                globalNewsTitleColor,
                                globalHoverColor,
                                globalMetaTone,
                                globalExcerptTone,
                                globalBorderTone,
                                archiveHeaderTitleSizeDefault,
                                archiveHeaderTitleWeightDefault,
                                archiveHeaderDescriptionSizeDefault,
                                archiveHeaderDescriptionWeightDefault,
                                archiveHeaderMetaSizeDefault,
                                archiveHeaderMetaWeightDefault,
                                getConfigBool,
                                getConfigString,
                                getConfigValue,
                                updateChildResponsiveConfig,
                                updateChildConfig,
                                renderHeroTextSection,
                                renderSharedCategoryTextSection,
                                renderSharedTitleTextSection,
                                renderSharedMetaTextSection,
                                renderSharedExcerptTextSection,
                                renderSharedContentAlignmentSettings,
                                ColorPicker,
                            })}
                            {renderArchiveSharedVisualSections({
                                childType: child.type,
                                child,
                                heroControlClass: HERO_CONTROL_CLASS,
                                heroColorTriggerClass: HERO_COLOR_TRIGGER_CLASS,
                                heroColorSwatchClass: HERO_COLOR_SWATCH_CLASS,
                                heroColorInputClass: HERO_COLOR_INPUT_CLASS,
                                globalAccentTone,
                                getConfigBool,
                                getConfigString,
                                getConfigValue,
                                updateChildResponsiveConfig,
                                updateChildConfig,
                                renderHeroTextSection,
                                ColorPicker,
                                renderNewsFeedSourceSettings,
                                renderNewsFeedStyleSettings,
                                renderHeroSliderContentSettings,
                                renderHeroSliderStyleSettings,
                                renderSidebarWidgetContentSettings,
                                renderSidebarWidgetStyleSettings,
                                renderTagCloudContentSettings,
                                renderTagCloudStyleSettings,
                                renderAdBannerContentSettings,
                                renderAdBannerStyleSettings,
                            })}
                            {isImageWidget && renderImageWidgetVisualSettings()}
                            {isImageWidget &&
                                renderSharedContentAlignmentSettings({
                                    copyTitle: "Terapkan tata letak Konten Widget Gambar ke semua device",
                                    sectionTitle: "Tata Letak Konten",
                                    textAlignLabel: "Tata Letak Konten",
                                    verticalAlignLabel: "Posisi Vertikal Widget",
                                    alignKey: "textAlign",
                                    alignDefault: "left",
                                    showVerticalAlign: true,
                                })}
                            {isHeaderWidget && renderWidgetNameField()}
                            {isHeaderWidget &&
                                renderHeaderContentSections({
                                    child,
                                    controlClassName: HERO_CONTROL_CLASS,
                                    colorTriggerClassName: HERO_COLOR_TRIGGER_CLASS,
                                    colorSwatchClassName: HERO_COLOR_SWATCH_CLASS,
                                    colorInputClassName: HERO_COLOR_INPUT_CLASS,
                                    getConfigBool,
                                    getConfigString,
                                    getConfigValue,
                                    updateChildConfig,
                                    updateChildResponsiveConfig,
                                    ColorPicker,
                                    openMediaLibraryForKey,
                                })}
                            {isHeaderWidget &&
                                renderHeaderVisualSections({
                                    child,
                                    controlClassName: HERO_CONTROL_CLASS,
                                    colorTriggerClassName: HERO_COLOR_TRIGGER_CLASS,
                                    colorSwatchClassName: HERO_COLOR_SWATCH_CLASS,
                                    colorInputClassName: HERO_COLOR_INPUT_CLASS,
                                    getConfigBool,
                                    getConfigString,
                                    getConfigValue,
                                    updateChildConfig,
                                    updateChildResponsiveConfig,
                                    ColorPicker,
                                    globalMetaTone,
                                    globalHoverColor,
                                    openMediaLibraryForKey,
                                    renderSharedContentAlignmentSettings,
                                })}
                            {isFooterWidget && renderWidgetNameField()}
                            {isFooterWidget &&
                                renderFooterVisualSections({
                                    child,
                                    controlClassName: HERO_CONTROL_CLASS,
                                    colorTriggerClassName: HERO_COLOR_TRIGGER_CLASS,
                                    colorSwatchClassName: HERO_COLOR_SWATCH_CLASS,
                                    colorInputClassName: HERO_COLOR_INPUT_CLASS,
                                    getConfigBool,
                                    getConfigString,
                                    getConfigValue,
                                    updateChildConfig,
                                    updateChildResponsiveConfig,
                                    ColorPicker,
                                    globalWidgetTitleColor,
                                    globalAccentTone,
                                    globalMetaTone,
                                    globalHoverColor,
                                    openMediaLibraryForKey,
                                    renderSharedContentAlignmentSettings,
                                })}
                            {!hasArchiveSharedVisualSections && (
                                !isFooterWidget &&
                                <BlockConfigPanelVisualFamilySections
                                    sectionKey={visualSectionKey}
                                    renderHeroLayoutSettings={renderHeroLayoutSettings}
                                    renderHeroTextSettings={renderHeroTextSettings}
                                    renderBulletListContentSettings={renderBulletListContentSettings}
                                    renderNewsFeedStyleSettings={renderNewsFeedStyleSettings}
                                    renderHeadlineBigStyleSettings={renderHeadlineBigStyleSettings}
                                    renderSidebarWidgetStyleSettings={renderSidebarWidgetStyleSettings}
                                    renderTagCloudStyleSettings={renderTagCloudStyleSettings}
                                    renderAdBannerStyleSettings={renderAdBannerStyleSettings}
                                    renderHeroSplit4StyleSettings={renderHeroSplit4StyleSettings}
                                    renderHeroSliderStyleSettings={renderHeroSliderStyleSettings}
                                />
                            )}

                            {/* Post Meta Config - Moved from Content */}
                            {child.type === 'post_meta' && (
                                <BlockConfigPanelPostMetaVisualSection
                                    {...postVisualSharedProps}
                                    isPostMetaAuthorVisible={isPostMetaAuthorVisible}
                                />
                            )}

                            {child.type === "post_stats" && (
                                <BlockConfigPanelPostStatsVisualSection
                                    {...postVisualSharedProps}
                                />
                            )}

                            {/* Post Share Config (Moved from Content) */}
                            {child.type === 'post_share' && (
                                <>
                                <BlockConfigPanelPostShareVisualSection
                                    {...postVisualSharedProps}
                                    {...postVisualControlProps}
                                />
                                {renderPostBuilderContentLayoutSection()}
                                </>
                            )}

                            {child.type === "post_author_box" && (
                                <>
                                <BlockConfigPanelPostAuthorBoxVisualSection
                                    {...postVisualCommonProps}
                                />
                                {renderPostBuilderContentLayoutSection()}
                                </>
                            )}

                            {child.type === "post_navigation" && (
                                <BlockConfigPanelPostNavigationVisualSection
                                    {...postVisualCommonProps}
                                />
                            )}

                            {child.type === "post_comments" && (
                                <BlockConfigPanelPostCommentsBehaviorSection
                                    {...postVisualSharedProps}
                                    heroControlClass={HERO_CONTROL_CLASS}
                                />
                            )}

                            {/* Typography Settings (Moved from Content) */}
                            {isPostTypographyWidget && (
                                <>
                                <BlockConfigPanelPostTypographyVisualSection
                                    {...postVisualCommonProps}
                                    isPostMetaWidget={isPostMetaWidget}
                                    isPostContentWidget={isPostContentWidget}
                                    isPostTypographyWithLineHeight={isPostTypographyWithLineHeight}
                                    postTypographyDefaultColor={postTypographyDefaultColor}
                                    postTypographySectionTitle={postTypographySectionTitle}
                                />
                                {!isPostContentWidget && renderPostBuilderContentLayoutSection()}
                                </>
                            )}

                            {isPostContentWidget && (
                                <>
                                <BlockConfigPanelPostContentBorderVisualSection
                                    {...postVisualCommonProps}
                                    isPostContentBorderEnabled={isPostContentBorderEnabled}
                                />
                                {renderPostBuilderContentLayoutSection()}
                                </>
                            )}

                            {/* Post Breadcrumb Config - Visual */}
                            {child.type === "post_breadcrumb" && (
                                <>
                                    <BlockConfigPanelPostBreadcrumbVisualSection
                                        {...postVisualCommonProps}
                                    />

                                    {renderPostBuilderContentLayoutSection()}
                                </>
                            )}

                            {child.type === "post_featured_image" && (
                                <>
                                <BlockConfigPanelPostFeaturedImageVisualSection
                                    {...postVisualCommonProps}
                                />
                                {renderPostBuilderContentLayoutSection()}
                                </>
                            )}

                            {!isPostBuilder && !isHeaderWidget && !isFooterBuilder && !isImageWidget && !shouldRenderContainerAtBottom && !isClassicHeroWidget && !isHeadlineBigWidget && !hasArchiveDedicatedSections && renderMainContainerSettings()}

                            {child.type === 'post_tags' && (
                                <>
                                    <BlockConfigPanelPostTagsVisualSection
                                        {...postVisualCommonProps}
                                    />

                                {renderPostBuilderContentLayoutSection()}
                                </>
                            )}

                            {child.type === "post_comments" && (
                                <>
                                <BlockConfigPanelPostCommentsVisualSection
                                    {...postVisualCommonProps}
                                />
                                {renderPostBuilderContentLayoutSection()}
                                </>
                            )}

                            {child.type === "post_related_posts" && (
                                <>
                                <BlockConfigPanelPostRelatedPostsVisualSection
                                    {...postVisualCommonProps}
                                />
                                {renderPostBuilderContentLayoutSection()}
                                </>
                            )}

                            {canRenderGenericVisualStyleCard && (
                            <BlockConfigPanelGenericVisualCard
                                {...genericVisualCommonProps}
                                className={`bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border)] shadow-sm mb-4${isPostBuilder ? " post-builder-panel-card" : ""}`}
                                canShowBackground={canShowGenericBackgroundSection}
                                canShowThumbnail={canShowGenericThumbnailSection}
                                canShowTitle={canShowGenericTitleSection}
                                canShowMeta={canShowGenericMetaSection}
                                canShowExcerpt={canShowGenericExcerptSection}
                                canRenderBottomContainerSettings={canRenderBottomContainerSettings}
                                renderMainContainerSettings={renderMainContainerSettings}
                            />
                            )}

                            {canRenderGenericWidgetSettings && (
                            !isFooterWidget &&
                            <BlockConfigPanelGenericWidgetSettings
                                supportsTitleToggle={widgetProfile.supportsTitleToggle}
                                canRenderResponsiveVisibilitySettings={canRenderResponsiveVisibilitySettings}
                                getConfigBool={getConfigBool}
                                updateChildConfig={(key, value) => updateChildConfig(key, value)}
                            />
                            )}
                        </div>
                    ) : (
                        <>
                            {renderArchiveAdvancedSections({
                                childType: child.type,
                                renderSharedVisibilitySettings,
                                renderSharedBoxBackgroundSettings,
                                renderSharedWidgetSpacingSettings,
                            })}
                            {renderArchiveSharedAdvancedSections({
                                childType: child.type,
                                renderNewsFeedAdvancedSettings,
                                renderHeroSliderAdvancedSettings,
                                renderSidebarWidgetAdvancedSettings,
                                renderTagCloudAdvancedSettings,
                                renderAdBannerAdvancedSettings,
                                renderSharedVisibilitySettings,
                                renderSharedBoxBackgroundSettings,
                                renderSharedWidgetSpacingSettings,
                            })}
                            {isFooterWidget &&
                                renderFooterAdvancedSections({
                                    childType: child.type,
                                    renderSharedVisibilitySettings,
                                    renderSharedBoxBackgroundSettings,
                                    renderSharedWidgetSpacingSettings,
                                })}
                            {isHeaderWidget &&
                                renderHeaderAdvancedSections({
                                    childType: child.type,
                                    renderSharedVisibilitySettings,
                                    renderSharedBoxBackgroundSettings,
                                    renderSharedWidgetSpacingSettings,
                                })}
                            {isImageWidget && renderImageWidgetAdvancedSettings()}
                            {!isImageWidget && !hasArchiveDedicatedSections && !hasArchiveSharedVisualSections && !isHeaderWidget && !isFooterWidget && (
                                <BlockConfigPanelAdvancedSections
                                    sectionKey={advancedSectionKey}
                                    renderHeroAdvancedSettings={renderHeroAdvancedSettings}
                                    renderBulletListAdvancedSettings={renderBulletListAdvancedSettings}
                                    renderNewsFeedAdvancedSettings={renderNewsFeedAdvancedSettings}
                                    renderHeadlineBigAdvancedSettings={renderHeadlineBigAdvancedSettings}
                                    renderSidebarWidgetAdvancedSettings={renderSidebarWidgetAdvancedSettings}
                                    renderTagCloudAdvancedSettings={renderTagCloudAdvancedSettings}
                                    renderHeroSplit4AdvancedSettings={renderHeroSplit4AdvancedSettings}
                                    renderHeroSliderAdvancedSettings={renderHeroSliderAdvancedSettings}
                                    renderAdBannerAdvancedSettings={renderAdBannerAdvancedSettings}
                                    renderPostBuilderExtraAdvancedSettings={renderPostBuilderExtraAdvancedSettings}
                                />
                            )}
                        </>
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

            {/* Media Library Modal */}
            {showMediaModal && (
                <MediaLibraryModal
                    onClose={() => setShowMediaModal(false)}
                    onSelect={handleMediaSelect}
                    selectedUrl={mediaTargetKey ? getConfigString(mediaTargetKey, "") : undefined}
                    allowedTypes={mediaTargetKey && mediaTargetKey.toLowerCase().includes("image") ? "image" : "all"}
                />
            )}
        </div>
        </ActiveDeviceTabContext.Provider>
    );
}
