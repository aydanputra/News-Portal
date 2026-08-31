import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, Settings, Plus, Layout, ArrowUp, ArrowDown, X, Copy, List, Grid, Megaphone } from "lucide-react";
import { Block, Tag } from "./types";
import WidgetItem from "./WidgetItem";
import { getThemeBlocks } from "@/lib/block-registry";
import { getThemePostWidgetGroups } from "@/lib/post-builder-theme-registry";
import { ConfigValue } from "@/lib/page-builder-config";
import { getSidebarColumnIndex, resolveSectionChildrenWithSidebarSource, SidebarSourceBlocksMap } from "@/lib/sidebar-reference";
import { getThemeArchiveWidgetGroups } from "@/lib/archive-builder-theme-registry";
import { getThemeFooterWidgetGroups, getThemeHeaderWidgetGroups } from "@/lib/header-footer-builder-theme-registry";

interface SectionBlockProps {
    builderLocation?: "home" | "archive" | "header" | "footer" | "post";
    block: Block;
    index: number;
    updateBlockConfig: (index: number, key: string, value: ConfigValue) => void;
    deleteBlock: (index: number) => void;
    setEditingSectionId: (id: string | null) => void;
    setActiveSectionTab: (tab: 'layout' | 'style') => void;
    moveChildBlock: (parentIndex: number, childId: string, direction: "up" | "down") => void;
    setEditingChild: (child: { parentIndex: number, childId: string } | null) => void;
    setActiveEditTab: (tab: 'content' | 'visual' | 'advanced') => void;
    deleteChildBlock: (parentIndex: number, childId: string) => void;
    addChildBlock: (parentIndex: number, type: string, title: string, columnIndex: number) => void;
    tags: Tag[];
    accentColor: string;
    headingColor?: string;
    metaColor?: string;
    excerptColor?: string;
    headingFont?: string;
    bodyFont?: string;
    activeDeviceTab?: "desktop" | "tablet" | "mobile";
    activeAddMenu: { blockId: string, colIndex: number } | null;
    setActiveAddMenu: (menu: { blockId: string, colIndex: number } | null) => void;
    context?: "home" | "post";
    activeTheme?: string;
    moveBlock?: (index: number, direction: "up" | "down") => void;
    duplicateBlock?: (index: number) => void;
    onMove?: (direction: "up" | "down") => void;
    onDuplicate?: () => void;
    // Recursive & Nested Props
    isNested?: boolean;
    parentId?: string;
    deleteBlockById?: (id: string) => void;
    updateBlockConfigById?: (id: string, key: string, value: ConfigValue) => void;
    addChildBlockById?: (parentId: string, type: string, title: string, columnIndex: number) => void;
    moveChildBlockById?: (parentId: string, childId: string, direction: "up" | "down") => void;
    moveChildBlockColumnById?: (parentId: string, childId: string, direction: "left" | "right") => void;
    deleteChildBlockById?: (parentId: string, childId: string) => void;
    duplicateChildBlockById?: (parentId: string, childId: string) => void;
    containerWidth?: string;
    customContainerWidth?: string;
    sidebarContext?: boolean;
    sourceBlocksByLocation?: SidebarSourceBlocksMap;
    homeContainerWidth?: string;
    homeCustomContainerWidth?: string;
}

interface WidgetDefinition {
    id?: string;
    type?: string;
    label: string;
    description?: string;
    desc?: string;
    category?: string;
    isSpecial?: boolean;
    icon: React.ComponentType<{ size?: number }>;
}

const POST_BUILDER_SIDEBAR_WIDGET_TYPES = new Set([
    "sidebar_widget",
    "tag_cloud",
    "ad_banner",
    "image_widget",
    "section",
]);

const MODAL_THEME_VAR_NAMES = [
    "--accent",
    "--accent-hover",
    "--accent-subtle",
    "--bg-base",
    "--bg-elevated",
    "--bg-surface",
    "--fg-primary",
    "--fg-secondary",
    "--fg-muted",
    "--border",
    "--border-strong",
    "--font-display",
    "--font-body",
] as const;
const ACCENT_CSS_VAR = "--accent" as const;

function getPortalThemeVars(source: HTMLElement | null, accentColor: string): React.CSSProperties {
    const fallback: React.CSSProperties & Record<string, string> = {
        [ACCENT_CSS_VAR]: accentColor,
        color: "var(--fg-primary)",
    };

    if (typeof window === "undefined") return fallback;

    const computed = window.getComputedStyle(source ?? document.documentElement);
    const style: React.CSSProperties & Record<string, string> = { color: "var(--fg-primary)" };

    for (const name of MODAL_THEME_VAR_NAMES) {
        const value = computed.getPropertyValue(name).trim();
        if (value) {
            style[name] = value;
        }
    }

    if (!style[ACCENT_CSS_VAR]) {
        style[ACCENT_CSS_VAR] = accentColor;
    }

    return style;
}

function SectionBlock({
    builderLocation = "home",
    block,
    index,
    updateBlockConfig,
    deleteBlock,
    setEditingSectionId,
    setActiveSectionTab,
    moveChildBlock,
    setEditingChild,
    setActiveEditTab,
    deleteChildBlock,
    addChildBlock,
    tags,
    accentColor,
    headingColor,
    metaColor,
    excerptColor,
    headingFont,
    bodyFont,
    activeDeviceTab = "desktop",
    activeAddMenu,
    setActiveAddMenu,
    context: _context,
    activeTheme = "classic",
    moveBlock,
    duplicateBlock,
    onMove,
    onDuplicate,
    isNested = false,
    parentId,
    deleteBlockById,
    updateBlockConfigById,
    addChildBlockById,
    moveChildBlockById,
    moveChildBlockColumnById,
    deleteChildBlockById,
    duplicateChildBlockById,
    containerWidth: _containerWidth,
    customContainerWidth: _customContainerWidth,
    sidebarContext = false,
    sourceBlocksByLocation,
    homeContainerWidth: _homeContainerWidth = "boxed",
    homeCustomContainerWidth: _homeCustomContainerWidth = "1200"
}: SectionBlockProps) {
    const sectionRootRef = useRef<HTMLDivElement | null>(null);
    const context = builderLocation === "post" ? "post" : "home";
    const postWidgetGroups = getThemePostWidgetGroups(activeTheme || "classic");
    const archiveWidgetGroups = getThemeArchiveWidgetGroups(activeTheme || "classic");
    const postBuilderMainWidgets = [
        ...postWidgetGroups.main,
        ...postWidgetGroups.support.filter((widget) => !POST_BUILDER_SIDEBAR_WIDGET_TYPES.has(String(widget.type || ""))),
    ];
    const postBuilderSidebarWidgets = postWidgetGroups.support.filter((widget) =>
        POST_BUILDER_SIDEBAR_WIDGET_TYPES.has(String(widget.type || "")),
    );
    // --- HELPERS FOR RECURSIVE ACTIONS ---
    const handleUpdateConfig = (key: string, value: ConfigValue) => {
        if (updateBlockConfigById) {
            updateBlockConfigById(block.id, key, value);
        } else {
            updateBlockConfig(index, key, value);
        }
    };
    const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    const getResponsiveConfigKey = (key: string) => {
        if (activeDeviceTab === "mobile") return `mobile${cap(key)}`;
        if (activeDeviceTab === "tablet") return `tablet${cap(key)}`;
        return key;
    };
    const handleUpdateResponsiveConfig = (key: string, value: ConfigValue) => {
        handleUpdateConfig(getResponsiveConfigKey(key), value);
    };

    const handleDeleteBlock = () => {
        if (deleteBlockById) {
            deleteBlockById(block.id);
        } else {
            deleteBlock(index);
        }
    };

    const handleAddChild = (type: string, title: string, columnIndex: number) => {
        const sidebarColumnIndex = getSidebarColumnIndex((block.config as any)?.layout);
        const isDedicatedSidebarSection = block.placement === "sidebar";
        const shouldDetachSharedSidebar =
            builderLocation !== "header" &&
            builderLocation !== "footer" &&
            block.config?.followSharedSidebar === true &&
            (isDedicatedSidebarSection || (sidebarColumnIndex !== null && columnIndex === sidebarColumnIndex));

        if (shouldDetachSharedSidebar) {
            handleUpdateConfig("followSharedSidebar", false);
        }

        if (isNested && addChildBlockById) {
            addChildBlockById(block.id, type, title, columnIndex);
        } else {
            addChildBlock(index, type, title, columnIndex);
        }
        setActiveAddMenu(null);
    };

    const handleMoveSection = (direction: "up" | "down") => {
        if (isNested && moveChildBlockById && parentId) {
            moveChildBlockById(parentId, block.id, direction);
        } else if (onMove) {
            onMove(direction);
        } else if (moveBlock) {
            moveBlock(index, direction);
        }
    };

    const handleDuplicate = () => {
        if (onDuplicate) {
            onDuplicate();
        } else if (duplicateChildBlockById && parentId) {
            duplicateChildBlockById(parentId, block.id);
        } else if (duplicateBlock) {
            duplicateBlock(index);
        }
    };

    const getColumnStructure = (layout: string) => {
        switch(layout) {
            case '100': return [100];
            case '50-50': return [50, 50];
            case '33-66': return [33.333, 66.667];
            case '66-33': return [66.667, 33.333];
            case '33-33-33': return [33.333, 33.333, 33.333];
            case '25-25-25-25': return [25, 25, 25, 25];
            default: return [100];
        }
    };

    const toPreviewSize = (value: unknown, fallback: string) => {
        if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed) return fallback;
            if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
            return trimmed;
        }
        return fallback;
    };

    const getConfigNumber = (key: string, fallback: number) => {
        const value = getResponsiveValue(key);
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
        return fallback;
    };

    const config = block.config || {};
    const getResponsiveValue = (key: string) => {
        const base = (config as any)?.[key];
        const tablet = (config as any)?.[`tablet${cap(key)}`];
        const mobile = (config as any)?.[`mobile${cap(key)}`];
        if (activeDeviceTab === "mobile") return mobile ?? tablet ?? base;
        if (activeDeviceTab === "tablet") return tablet ?? base;
        return base;
    };
    const getConfigString = (key: string, fallback = ""): string => {
        const value = getResponsiveValue(key);
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
        return fallback;
    };

    const layoutConfig = getConfigString("layout", "100");
    const columns = getColumnStructure(layoutConfig);
    const isStackedLayout = activeDeviceTab === "mobile";
    const sectionDirection = getConfigString("childrenDirection", "vertical") === "horizontal" ? "horizontal" : "vertical";
    const sectionAlign = getConfigString("childrenAlign", "left");
    const sectionVerticalAlign = getConfigString("childrenVerticalAlign", "top");
    const sectionSizing = getConfigString("childrenSizing", "auto");
    const sectionBlockGap = getConfigNumber("blockGap", 6) * 4;
    const sectionColumnGap = getConfigNumber("columnGap", 6) * 4;
    const sectionContainerWidth = getConfigString("containerWidth", "boxed");
    const sectionCustomContainerWidth = toPreviewSize(getResponsiveValue("customContainerWidth"), "1200px");
    const builderBoxedWidth = _containerWidth === "custom"
        ? toPreviewSize(_customContainerWidth, "1200px")
        : "1200px";
    const previewContainerMaxWidth = isNested
        ? "100%"
        : sectionContainerWidth === "full"
            ? "100%"
            : sectionContainerWidth === "custom"
                ? sectionCustomContainerWidth
                : builderBoxedWidth;
    const resolvedSectionChildren = builderLocation === "header" || builderLocation === "footer"
        ? ((block.config as any)?.children || [])
        : resolveSectionChildrenWithSidebarSource(block, sourceBlocksByLocation, builderLocation as any);

    const columnContentStyle: React.CSSProperties = sectionDirection === "horizontal"
        ? {
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: `${sectionBlockGap}px`,
            justifyContent: sectionAlign === "center" ? "center" : sectionAlign === "right" ? "flex-end" : "flex-start",
            alignItems: sectionVerticalAlign === "center" ? "center" : sectionVerticalAlign === "bottom" ? "flex-end" : "flex-start",
          }
        : {
            display: "flex",
            flexDirection: "column",
            gap: `${sectionBlockGap}px`,
            justifyContent: sectionVerticalAlign === "center" ? "center" : sectionVerticalAlign === "bottom" ? "flex-end" : "flex-start",
            alignItems: "stretch",
            textAlign: sectionAlign === "center" ? "center" : sectionAlign === "right" ? "right" : "left",
          };

    const portalThemeStyle =
        activeAddMenu?.blockId === block.id
            ? getPortalThemeVars(
                (sectionRootRef.current?.closest(".page-builder") as HTMLElement | null) ?? sectionRootRef.current,
                accentColor
            )
            : undefined;

    return (
        <div ref={sectionRootRef} className="relative group bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-sm hover:shadow-md transition-all">
            {/* Section Header */}
            <div className="bg-[var(--bg-base)] px-4 py-2 border-b border-[var(--border)] flex justify-between items-center rounded-t-xl">
                <div className="flex items-center gap-2">
                    {/* Reorder Controls (Both Top-Level and Nested) */}
                    <div className="flex bg-[var(--bg-elevated)] rounded-md border border-[var(--border)] shadow-sm mr-2">
                        <button onClick={() => handleMoveSection("up")} className="p-1 hover:text-[var(--accent)] border-r border-[var(--border)]" title="Geser ke Atas"><ArrowUp size={14} /></button>
                        <button onClick={() => handleMoveSection("down")} className="p-1 hover:text-[var(--accent)]" title="Geser ke Bawah"><ArrowDown size={14} /></button>
                    </div>
                    
                    <span className="text-xs font-bold text-[var(--fg-muted)] uppercase">Inner Section</span>
                    {/* Layout Switcher (Mini) */}
                    <div className="flex gap-1 ml-4">
                        {['100', '50-50', '33-66', '66-33', '33-33-33', '25-25-25-25'].map(l => (
                            <button 
                                key={l}
                                onClick={() => handleUpdateResponsiveConfig("layout", l)}
                                className={`w-4 h-3 rounded-sm border ${layoutConfig === l ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--bg-elevated)] border-[var(--border)]'} hover:border-[var(--accent)]`}
                                title={l}
                            ></button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { setEditingSectionId(block.id); setActiveSectionTab("layout"); }} className="p-1 text-[var(--fg-muted)] hover:text-[var(--accent)]" title="Settings"><Settings size={14} /></button>
                    <button onClick={handleDuplicate} className="p-1 text-[var(--fg-muted)] hover:text-[var(--accent)]" title="Duplicate"><Copy size={14} /></button>
                    <button onClick={() => handleDeleteBlock()} className="p-1 text-[var(--fg-muted)] hover:text-red-500" title="Delete"><Trash2 size={14} /></button>
                </div>
            </div>

            <div className="rounded-b-xl overflow-hidden p-3 overflow-x-auto">
                <div
                    className={`relative min-h-[150px] mx-auto ${isStackedLayout ? "flex flex-col" : "flex flex-row"}`}
                    style={{
                        maxWidth: previewContainerMaxWidth,
                        gap: `${sectionColumnGap}px`
                    }}
                >
                    {columns.map((widthPercent, colIndex) => {
                        const colChildren = resolvedSectionChildren.filter((c: Block) => (c.config?.columnIndex || 0) === colIndex);
                        const isEmpty = colChildren.length === 0;
                        const effectiveSidebarContext = sidebarContext;

                        return (
                        <div
                            key={colIndex}
                            className="p-3 bg-[var(--bg-surface)] relative group/col min-w-0"
                            style={isStackedLayout ? { width: "100%" } : { width: `${widthPercent}%`, flex: `0 0 ${widthPercent}%` }}
                        >
                            {/* Empty State Placeholder */}
                            {isEmpty && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-[var(--fg-muted)] text-xs font-medium border-2 border-dashed border-[var(--border)] rounded px-3 py-1 bg-[var(--bg-base)]">
                                        Kolom Kosong
                                    </span>
                                </div>
                            )}

                            {/* Column Content */}
                            <div className="relative z-10" style={columnContentStyle}>
                                {colChildren.map((child: Block) => {
                                    const wrapperStyle: React.CSSProperties = sectionDirection === "horizontal" && sectionSizing === "grow"
                                        ? { flex: "1 1 0", minWidth: 0 }
                                        : { minWidth: 0 };
                                    if (child.type === 'section') {
                                        // Recursive Render for Nested Sections
                                        return (
                                            <div key={child.id} style={wrapperStyle}>
                                                <SectionBlock 
                                                    builderLocation={builderLocation}
                                                    key={child.id}
                                                    block={child}
                                                    index={index}
                                                    updateBlockConfig={updateBlockConfig}
                                                    deleteBlock={deleteBlock}
                                                    setEditingSectionId={setEditingSectionId}
                                                    setActiveSectionTab={setActiveSectionTab}
                                                    moveChildBlock={moveChildBlock}
                                                    setEditingChild={setEditingChild}
                                                    setActiveEditTab={setActiveEditTab}
                                                    deleteChildBlock={deleteChildBlock}
                                                    addChildBlock={addChildBlock}
                                                    tags={tags}
                                                    accentColor={accentColor}
                                                    headingColor={headingColor}
                                                    metaColor={metaColor}
                                                    excerptColor={excerptColor}
                                                    headingFont={headingFont}
                                                    bodyFont={bodyFont}
                                                    activeDeviceTab={activeDeviceTab}
                                                    activeAddMenu={activeAddMenu}
                                                    setActiveAddMenu={setActiveAddMenu}
                                                    context={context}
                                                    // Recursive Props
                                                    isNested={true}
                                                    parentId={block.id}
                                                    moveBlock={moveBlock}
                                                    duplicateBlock={duplicateBlock}
                                                    deleteBlockById={deleteBlockById}
                                                    updateBlockConfigById={updateBlockConfigById}
                                                    addChildBlockById={addChildBlockById}
                                                    moveChildBlockById={moveChildBlockById}
                                                    moveChildBlockColumnById={moveChildBlockColumnById}
                                                    deleteChildBlockById={deleteChildBlockById}
                                                    duplicateChildBlockById={duplicateChildBlockById}
                                                    sidebarContext={effectiveSidebarContext}
                                                    sourceBlocksByLocation={sourceBlocksByLocation}
                                                />
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={child.id} style={wrapperStyle}>
                                            <WidgetItem 
                                                builderLocation={builderLocation}
                                                key={child.id}
                                                child={child}
                                                parentIndex={index}
                                                moveChildBlock={moveChildBlock}
                                                setEditingChild={setEditingChild}
                                                setActiveEditTab={setActiveEditTab}
                                                deleteChildBlock={deleteChildBlock}
                                                tags={tags}
                                                accentColor={accentColor}
                                                headingColor={headingColor}
                                                metaColor={metaColor}
                                                excerptColor={excerptColor}
                                                headingFont={headingFont}
                                                bodyFont={bodyFont}
                                                activeDeviceTab={activeDeviceTab}
                                                // Recursive Props
                                                parentId={block.id}
                                                moveChildBlockById={moveChildBlockById}
                                                moveChildBlockColumnById={moveChildBlockColumnById}
                                                deleteChildBlockById={deleteChildBlockById}
                                                duplicateChildBlockById={duplicateChildBlockById}
                                                columnCount={columns.length}
                                                isSidebarColumn={effectiveSidebarContext}
                                                insideInnerSection={isNested}
                                                activeTheme={activeTheme}
                                                
                                                // Pass recursive SectionBlock props
                                                updateBlockConfig={updateBlockConfig}
                                                deleteBlock={deleteBlock}
                                                setEditingSectionId={setEditingSectionId}
                                                setActiveSectionTab={setActiveSectionTab}
                                                addChildBlock={addChildBlock}
                                                activeAddMenu={activeAddMenu}
                                                setActiveAddMenu={setActiveAddMenu}
                                                moveBlock={moveBlock}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Add Widget Button (Elementor Style) */}
                            <div className={`mt-3 text-center transition-opacity relative z-20 ${isEmpty || (activeAddMenu?.blockId === block.id && activeAddMenu?.colIndex === colIndex) ? 'opacity-100' : 'opacity-0 group-hover/col:opacity-100'}`}>
                                <div className="relative inline-block add-widget-menu-container">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (activeAddMenu?.blockId === block.id && activeAddMenu?.colIndex === colIndex) {
                                                setActiveAddMenu(null);
                                            } else {
                                                setActiveAddMenu({ blockId: block.id, colIndex });
                                            }
                                        }}
                                        className={`p-1.5 rounded-full transition-colors shadow-sm ${activeAddMenu?.blockId === block.id && activeAddMenu?.colIndex === colIndex ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-elevated)] hover:bg-[var(--accent)] hover:text-white text-[var(--fg-muted)]'}`}
                                        title="Tambah Widget"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    
                                    {/* Widget Picker Modal (Full Screen Centered) */}
                                    {activeAddMenu?.blockId === block.id && activeAddMenu?.colIndex === colIndex && typeof document !== "undefined" && createPortal(
                                        <>
                                            <div
                                                className="fixed inset-y-0 left-0 z-[9998] bg-black/35 pointer-events-none animate-fade-in"
                                                style={{ right: "var(--admin-scrollbar-width, 0px)" }}
                                            />
                                            <div
                                                className="widget-picker-modal-root fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4 sm:p-6 bg-transparent animate-fade-in"
                                                style={portalThemeStyle}
                                                onClick={(e) => { e.stopPropagation(); setActiveAddMenu(null); }}
                                            >
                                                <div className="isolate bg-[var(--bg-elevated)] border border-[var(--border)] w-full max-w-[920px] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
                                                {/* Header */}
                                                <div className="px-4 py-2.5 border-b border-[var(--border)] flex justify-between items-center gap-3 bg-[var(--bg-elevated)] sticky top-0 z-10">
                                                    <div>
                                                        <h3 className="text-base sm:text-lg font-bold text-[var(--fg-primary)] leading-tight">Pilih Widget</h3>
                                                    </div>
                                                    <button 
                                                        onClick={() => setActiveAddMenu(null)}
                                                        className="p-1.5 hover:bg-[var(--bg-surface)] rounded-full transition-colors text-[var(--fg-muted)] hover:text-red-500 shrink-0"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>

                                                {/* Content Scrollable */}
                                                <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 bg-[var(--bg-surface)] custom-scrollbar">
                                                    {(() => {
                                                        const currentContext = builderLocation === 'post' ? 'post' : 'home';
                                                        
                                                        // Get Blocks from Registry based on Active Theme
                                                        const themeBlocks = getThemeBlocks(activeTheme || 'classic');
                                                        const normalizedThemeBlocks: WidgetDefinition[] = themeBlocks.map((blockDef) => ({
                                                            ...blockDef,
                                                            type: blockDef.id,
                                                            icon: blockDef.icon as React.ComponentType<{ size?: number }>
                                                        }));
                                                        
                                                        // Group Blocks
                                                        const groups = {
                                                            main: normalizedThemeBlocks.filter(b => ['hero', 'list', 'grid'].includes(b.category || "")),
                                                            sidebar: normalizedThemeBlocks.filter(b => ['widget'].includes(b.category || "")),
                                                            elements: normalizedThemeBlocks.filter(b => ['content'].includes(b.category || "")),
                                                            general: normalizedThemeBlocks.filter(b => ['widget'].includes(b.category || ""))
                                                        };
                                                        
                                                        // Special section block (Hardcoded as it's a builder feature, not a theme widget)
                                                        const innerSectionBlock: WidgetDefinition = { 
                                                            type: "section", 
                                                            label: "Inner Section", 
                                                            icon: Layout, 
                                                            isSpecial: true, 
                                                            desc: "Buat kolom tambahan di dalam kolom ini." 
                                                        };

                                                        groups.sidebar.push(innerSectionBlock);

                                                        const footerGroups = getThemeFooterWidgetGroups(activeTheme || "classic");
                                                        const headerGroups = getThemeHeaderWidgetGroups(activeTheme || "classic");

                                                        return (
                                                            <div className="space-y-5">
                                                                {builderLocation === 'header' ? (
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                                                            <div className="w-1.5 h-5 bg-[var(--accent)] rounded-full"></div>
                                                                            Elemen Header
                                                                        </h4>
                                                                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                                            {(headerGroups.main as WidgetDefinition[]).map((widget) => {
                                                                                const Icon = widget.icon;
                                                                                return (
                                                                                    <button 
                                                                                        key={widget.type}
                                                                                        onClick={(e) => { e.stopPropagation(); handleAddChild(widget.type!, widget.label, colIndex); }}
                                                                                        className="flex items-center gap-2.5 p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-sm transition-all duration-200 text-left group min-h-[64px] w-full"
                                                                                    >
                                                                                        <div className="p-2 rounded-lg bg-[var(--bg-base)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors shrink-0">
                                                                                            <Icon size={18} />
                                                                                        </div>
                                                                                        <span className="font-semibold text-sm text-[var(--fg-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">{widget.label}</span>
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                ) : builderLocation === 'footer' ? (
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                                                            <div className="w-1.5 h-5 bg-[var(--accent)] rounded-full"></div>
                                                                            Elemen Footer
                                                                        </h4>
                                                                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                                            {(footerGroups.main as WidgetDefinition[]).map((widget) => {
                                                                                const Icon = widget.icon;
                                                                                return (
                                                                                    <button 
                                                                                        key={widget.type}
                                                                                        onClick={(e) => { e.stopPropagation(); handleAddChild(widget.type!, widget.label, colIndex); }}
                                                                                        className="flex items-center gap-2.5 p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-sm transition-all duration-200 text-left group min-h-[64px] w-full"
                                                                                    >
                                                                                        <div className="p-2 rounded-lg bg-[var(--bg-base)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors shrink-0">
                                                                                            <Icon size={18} />
                                                                                        </div>
                                                                                        <span className="font-semibold text-sm text-[var(--fg-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">{widget.label}</span>
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                ) : currentContext === 'home' || builderLocation === 'archive' ? (
                                                                    <>
                                                                        {/* Section 1: Widget Utama */}
                                                                        <div>
                                                                            <h4 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                                                                <div className={`w-1.5 h-5 rounded-full ${builderLocation === 'archive' ? 'bg-indigo-600' : 'bg-[var(--accent)]'}`}></div>
                                                                                {builderLocation === 'archive' ? 'Widget Utama Arsip' : 'Widget Utama (Main Content)'}
                                                                            </h4>
                                                                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                                                {(builderLocation === 'archive' ? archiveWidgetGroups.main : groups.main).map((widget: WidgetDefinition) => {
                                                                                    const Icon = widget.icon;
                                                                                    const widgetType = widget.id ?? widget.type;
                                                                                    if (!widgetType) return null;
                                                                                    return (
                                                                                        <button 
                                                                                            key={widgetType}
                                                                                            onClick={(e) => { e.stopPropagation(); handleAddChild(widgetType, widget.label, colIndex); }}
                                                                                            className="flex items-center gap-2.5 p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-sm transition-all duration-200 text-left group min-h-[64px] w-full"
                                                                                        >
                                                                                            <div className="p-2 rounded-lg bg-[var(--bg-base)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors shrink-0">
                                                                                                <Icon size={18} />
                                                                                            </div>
                                                                                            <span className="font-semibold text-sm text-[var(--fg-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">{widget.label}</span>
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>

                                                                        {/* Section 2: Sidebar Widgets */}
                                                                        <div>
                                                                            <h4 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                                                                <div className={`w-1.5 h-5 rounded-full ${builderLocation === 'archive' ? 'bg-orange-500' : 'bg-[var(--accent)]'}`}></div>
                                                                                {builderLocation === 'archive' ? 'Widget Sidebar & Pendukung Arsip' : 'Widget Sidebar & Tambahan'}
                                                                            </h4>
                                                                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                                                {(builderLocation === 'archive' ? archiveWidgetGroups.support : groups.sidebar).map((widget: WidgetDefinition) => {
                                                                                    const Icon = widget.icon;
                                                                                    const widgetType = widget.id ?? widget.type;
                                                                                    if (!widgetType) return null;
                                                                                    return (
                                                                                        <button 
                                                                                            key={widgetType}
                                                                                            onClick={(e) => { e.stopPropagation(); handleAddChild(widgetType, widget.label, colIndex); }}
                                                                                            className="flex items-center gap-2.5 p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-sm transition-all duration-200 text-left group min-h-[64px] w-full"
                                                                                        >
                                                                                            <div className="p-2 rounded-lg bg-[var(--bg-base)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors shrink-0">
                                                                                                <Icon size={18} />
                                                                                            </div>
                                                                                            <span className="font-semibold text-sm text-[var(--fg-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">{widget.label}</span>
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div>
                                                                            <h4 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                                                                <div className="w-1.5 h-5 bg-[var(--accent)] rounded-full"></div>
                                                                                Struktur Konten Utama Post
                                                                            </h4>
                                                                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                                                {postBuilderMainWidgets.map((widget) => {
                                                                                    const Icon = widget.icon;
                                                                                    const widgetType = widget.type;
                                                                                    if (!widgetType) return null;
                                                                                    return (
                                                                                        <button
                                                                                            key={widgetType}
                                                                                            onClick={(e) => { e.stopPropagation(); handleAddChild(widgetType, widget.label, colIndex); }}
                                                                                            className="flex items-center gap-2.5 p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-sm transition-all duration-200 text-left group min-h-[64px] w-full"
                                                                                        >
                                                                                            <div className="p-2 rounded-lg bg-[var(--bg-base)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors shrink-0">
                                                                                                <Icon size={18} />
                                                                                            </div>
                                                                                            <span className="font-semibold text-sm text-[var(--fg-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">{widget.label}</span>
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <h4 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                                                                <div className="w-1.5 h-5 bg-[var(--accent)] rounded-full"></div>
                                                                                Elemen Pendukung & Sidebar
                                                                            </h4>
                                                                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                                                {postBuilderSidebarWidgets.map((widget) => {
                                                                                    const Icon = widget.icon;
                                                                                    const widgetType = widget.type;
                                                                                    if (!widgetType) return null;
                                                                                    return (
                                                                                        <button
                                                                                            key={widgetType}
                                                                                            onClick={(e) => { e.stopPropagation(); handleAddChild(widgetType, widget.label, colIndex); }}
                                                                                            className="flex items-center gap-2.5 p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-sm transition-all duration-200 text-left group min-h-[64px] w-full"
                                                                                        >
                                                                                            <div className="p-2 rounded-lg bg-[var(--bg-base)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors shrink-0">
                                                                                                <Icon size={18} />
                                                                                            </div>
                                                                                            <span className="font-semibold text-sm text-[var(--fg-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">{widget.label}</span>
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                                
                                                {/* Footer hint */}
                                                <div className="px-4 py-2 bg-[var(--bg-base)] border-t border-[var(--border)] text-[11px] text-[var(--fg-muted)] text-center flex justify-end items-center gap-3">
                                                    <button onClick={() => setActiveAddMenu(null)} className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] underline">Tutup</button>
                                                </div>
                                            </div>
                                            </div>
                                        </>,
                                        document.body
                                    )}
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default React.memo(SectionBlock);
