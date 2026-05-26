import React from "react";
import { ArrowUp, ArrowDown, Trash2, Settings, Plus, Grid, List, Layout, Megaphone, Copy, X, Newspaper } from "lucide-react";
import { Block, Tag } from "../types";
import WidgetItem from "./WidgetItem";
import { ConfigValue } from "@/lib/page-builder-config";
import { getThemeArchiveWidgetGroups } from "@/lib/archive-builder-theme-registry";
import { resolveSectionChildrenWithSidebarSource, SidebarSourceBlocksMap } from "@/lib/sidebar-reference";

interface SectionBlockProps {
    builderLocation?: "home" | "archive" | "header" | "footer";
    activeTheme?: string; // Add this
    activeDeviceTab?: "desktop" | "tablet" | "mobile";
    block: Block;
    index: number;
    updateBlockConfig: (index: number, key: string, value: ConfigValue) => void;
    deleteBlock: (index: number) => void;
    setEditingSectionId: (id: string | null) => void;
    setActiveSectionTab: (tab: 'layout' | 'style') => void;
    moveChildBlock: (parentIndex: number, childId: string, direction: "up" | "down") => void;
    setEditingChild: (child: { parentIndex: number, childId: string } | null) => void;
    setActiveEditTab: (tab: 'content' | 'visual') => void;
    deleteChildBlock: (parentIndex: number, childId: string) => void;
    addChildBlock: (parentIndex: number, type: string, title: string, columnIndex: number) => void;
    tags: Tag[];
    accentColor: string;
    activeAddMenu: { blockId: string, colIndex: number } | null;
    setActiveAddMenu: (menu: { blockId: string, colIndex: number } | null) => void;
    moveBlock: (index: number, direction: "up" | "down") => void;
    duplicateBlock?: (index: number) => void;
    onMove?: (direction: "up" | "down") => void;
    onDuplicate?: () => void;
    isNested?: boolean;
    parentId?: string;
    sidebarContext?: boolean;
    homeContainerWidth?: string;
    homeCustomContainerWidth?: string;
    sourceBlocksByLocation?: SidebarSourceBlocksMap;

    // Recursive Actions
    deleteBlockById?: (blockId: string) => void;
    updateBlockConfigById?: (blockId: string, key: string, value: ConfigValue) => void;
    addChildBlockById?: (parentId: string, type: string, title: string, columnIndex: number) => void;
    moveChildBlockById?: (parentId: string, childId: string, direction: "up" | "down") => void;
    deleteChildBlockById?: (parentId: string, childId: string) => void;
    duplicateChildBlockById?: (parentId: string, childId: string) => void;
    moveChildBlockColumnById?: (parentId: string, childId: string, direction: "left" | "right") => void;
}

interface WidgetDefinition {
    type: string;
    label: string;
    desc: string;
    isSpecial?: boolean;
    icon: React.ComponentType<{ size?: number }>;
}

function SectionBlock({
    builderLocation = "home",
    activeTheme = "classic",
    activeDeviceTab = "desktop",
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
    activeAddMenu,
    setActiveAddMenu,
    moveBlock,
    duplicateBlock,
    onMove,
    onDuplicate,

    // Recursive Actions
    deleteBlockById,
    updateBlockConfigById,
    addChildBlockById,
    moveChildBlockById,
    deleteChildBlockById,
    duplicateChildBlockById,
    moveChildBlockColumnById,
    isNested = false,
    parentId,
    sidebarContext = false,
    homeContainerWidth = "boxed",
    homeCustomContainerWidth = "1200",
    sourceBlocksByLocation
}: SectionBlockProps) {
    const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    const getColumnStructure = (layout: string) => {
        switch(layout) {
            case '100': return ['w-full'];
            case '50-50': return ['w-1/2', 'w-1/2'];
            case '33-66': return ['w-1/3', 'w-2/3'];
            case '66-33': return ['w-2/3', 'w-1/3'];
            case '33-33-33': return ['w-1/3', 'w-1/3', 'w-1/3'];
            case '25-25-25-25': return ['w-1/4', 'w-1/4', 'w-1/4', 'w-1/4'];
            default: return ['w-full'];
        }
    };

    const layoutConfig = typeof block.config?.layout === "string" ? block.config.layout : "100";
    const columns = getColumnStructure(layoutConfig);
    const layoutRatios = layoutConfig.split("-").map((part) => Number(part)).filter((part) => Number.isFinite(part) && part > 0);
    const isTwoColumnLayout = layoutRatios.length === 2;
    const hasMainSidebarLayout = isTwoColumnLayout && layoutRatios[0] !== layoutRatios[1];
    const dividerLeftPercent = hasMainSidebarLayout
        ? (layoutRatios[0] / (layoutRatios[0] + layoutRatios[1])) * 100
        : null;
    const isMobilePreview = activeDeviceTab === "mobile";
    const formatSize = (value: unknown, fallback: string) => {
        if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed) return fallback;
            if (/^\d+$/.test(trimmed)) return `${trimmed}px`;
            return trimmed;
        }
        return fallback;
    };
    const responsiveConfigKey = (key: string) => {
        if (activeDeviceTab === "mobile") return `mobile${cap(key)}`;
        if (activeDeviceTab === "tablet") return `tablet${cap(key)}`;
        return key;
    };
    const currentContainerWidth = String(
        block.config?.[responsiveConfigKey("containerWidth")]
        ?? block.config?.containerWidth
        ?? homeContainerWidth
        ?? "boxed"
    );
    const currentCustomContainerWidth = block.config?.[responsiveConfigKey("customContainerWidth")]
        ?? block.config?.customContainerWidth
        ?? homeCustomContainerWidth
        ?? "1200";
    const currentBlockGap = block.config?.[responsiveConfigKey("blockGap")]
        ?? block.config?.blockGap
        ?? 6;
    const previewBlockGap = `${(Number(currentBlockGap) || 0) * 0.25}rem`;
    const currentColumnGap = block.config?.[responsiveConfigKey("columnGap")]
        ?? block.config?.columnGap
        ?? 6;
    const previewColumnGap = `${(Number(currentColumnGap) || 0) * 0.25}rem`;
    const previewContainerWidth = isNested
        ? "100%"
        : currentContainerWidth === "narrow"
            ? "1000px"
            : currentContainerWidth === "custom"
                ? formatSize(currentCustomContainerWidth, "1200px")
                : currentContainerWidth === "full"
                    ? "100%"
                    : "1200px";
    const columnsContainerClass = isMobilePreview
        ? "relative flex flex-col min-h-[150px] transition-all duration-300 bg-[var(--bg-surface)]"
        : "relative flex flex-row min-h-[150px] transition-all duration-300 bg-[var(--bg-surface)]";
    
    const numPx = (value: unknown, fallback: number) => {
        if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
        if (typeof value === "string" && value.trim() !== "") {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) return `${parsed}px`;
        }
        return `${fallback}px`;
    };
    const paddingTop = block.config?.[responsiveConfigKey("paddingTop")] ?? block.config?.paddingTop;
    const paddingBottom = block.config?.[responsiveConfigKey("paddingBottom")] ?? block.config?.paddingBottom;
    const paddingLeft = block.config?.[responsiveConfigKey("paddingLeft")] ?? block.config?.paddingLeft;
    const paddingRight = block.config?.[responsiveConfigKey("paddingRight")] ?? block.config?.paddingRight;

    const boxStyle: React.CSSProperties = builderLocation === "header" || builderLocation === "footer"
        ? {
            paddingTop: numPx(paddingTop, 12),
            paddingBottom: numPx(paddingBottom, 12),
            paddingLeft: numPx(paddingLeft, 16),
            paddingRight: numPx(paddingRight, 16),
        }
        : {};

    // Handlers that prefer ID-based operations
    const handleAddChild = (type: string, title: string, colIndex: number) => {
        if (addChildBlockById) {
            addChildBlockById(block.id, type, title, colIndex);
        } else {
            addChildBlock(index, type, title, colIndex);
        }
        setActiveAddMenu(null);
    };

    const handleUpdateLayout = (layout: string) => {
        if (updateBlockConfigById) {
            updateBlockConfigById(block.id, "layout", layout);
        } else {
            updateBlockConfig(index, "layout", layout);
        }
    };

    const handleDeleteSection = () => {
        if (deleteBlockById) {
            deleteBlockById(block.id);
        } else {
            deleteBlock(index);
        }
    };

    const handleMoveSection = (direction: "up" | "down") => {
        if (isNested && moveChildBlockById && parentId) {
            moveChildBlockById(parentId, block.id, direction);
        } else if (onMove) {
            onMove(direction);
        } else {
            moveBlock(index, direction);
        }
    };

    const handleDuplicate = () => {
        if (onDuplicate) {
            onDuplicate();
        } else if (duplicateBlock) {
            duplicateBlock(index);
        }
    };

    return (
        <div className="relative group bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-sm hover:shadow-md transition-all">
            {/* Section Header */}
            <div className="bg-[var(--bg-base)] px-4 py-2 border-b border-[var(--border)] flex justify-between items-center rounded-t-xl">
                <div className="flex items-center gap-2">
                    <div className="flex bg-[var(--bg-elevated)] rounded-md border border-[var(--border)] shadow-sm mr-2">
                        <button onClick={() => handleMoveSection("up")} className="p-1 hover:text-[var(--accent)] border-r border-[var(--border)]" title="Geser ke Atas"><ArrowUp size={14} /></button>
                        <button onClick={() => handleMoveSection("down")} className="p-1 hover:text-[var(--accent)]" title="Geser ke Bawah"><ArrowDown size={14} /></button>
                    </div>
                    <span className="text-xs font-bold text-[var(--fg-muted)] uppercase">{isNested ? "Inner Section" : "Section"}</span>
                    {/* Layout Switcher (Mini) */}
                    <div className="flex gap-1 ml-4">
                        {['100', '50-50', '33-66', '66-33', '33-33-33'].map(l => (
                            <button 
                                key={l}
                                onClick={() => handleUpdateLayout(l)}
                                className={`w-4 h-3 rounded-sm border ${layoutConfig === l ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[var(--bg-elevated)] border-[var(--border)]'} hover:border-[var(--accent)]`}
                                title={l}
                            ></button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => { setEditingSectionId(block.id); setActiveSectionTab("layout"); }} className="p-1 text-[var(--fg-muted)] hover:text-[var(--accent)]" title="Settings"><Settings size={14} /></button>
                    <button onClick={handleDuplicate} className="p-1 text-[var(--fg-muted)] hover:text-[var(--accent)]" title="Duplicate"><Copy size={14} /></button>
                    <button onClick={() => handleDeleteSection()} className="p-1 text-[var(--fg-muted)] hover:text-red-500" title="Delete"><Trash2 size={14} /></button>
                </div>
            </div>

            {/* Columns Container Wrapper with Preview Styles */}
            <div className="p-3 overflow-x-auto">
                <div style={{ width: "100%", maxWidth: previewContainerWidth, marginLeft: "auto", marginRight: "auto" }}>
                    <div 
                        className={columnsContainerClass}
                        style={{
                            ...boxStyle,
                            gap: previewColumnGap,
                        }}
                    >
                    {!isMobilePreview && hasMainSidebarLayout && dividerLeftPercent !== null && (
                        <div
                            className="absolute top-0 bottom-0 w-px bg-[var(--border)] pointer-events-none z-[1]"
                            style={{ left: `${dividerLeftPercent}%` }}
                        />
                    )}
                    {columns.map((widthClass, colIndex) => {
                    const resolvedSectionChildren = builderLocation === "header" || builderLocation === "footer"
                      ? ((block.config as any)?.children || [])
                      : resolveSectionChildrenWithSidebarSource(block, sourceBlocksByLocation, builderLocation as any);
                    const colChildren = resolvedSectionChildren.filter((c: Block) => (c.config?.columnIndex || 0) === colIndex);
                    const isEmpty = colChildren.length === 0;
                    const minRatio = isTwoColumnLayout ? Math.min(...layoutRatios) : 0;
                    const sidebarIndex = isTwoColumnLayout ? layoutRatios.indexOf(minRatio) : -1;
                    const isSidebarColumn = hasMainSidebarLayout && colIndex === sidebarIndex;
                    const effectiveSidebarContext = sidebarContext || isSidebarColumn;

                    return (
                    <div key={colIndex} className={`${isMobilePreview ? 'w-full' : widthClass} bg-[var(--bg-surface)] relative group/col`}>
                        <div className="relative p-3">
                            {/* Empty State Placeholder */}
                            {isEmpty && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-[var(--fg-muted)] text-xs font-medium border-2 border-dashed border-[var(--border)] rounded px-3 py-1 bg-[var(--bg-base)]">
                                        Kolom Kosong
                                    </span>
                                </div>
                            )}

                            {/* Column Content */}
                            <div
                                className={(() => {
                                    const childrenDirectionRaw = block.config?.[responsiveConfigKey("childrenDirection")] ?? block.config?.childrenDirection;
                                    const childrenAlignRaw = block.config?.[responsiveConfigKey("childrenAlign")] ?? block.config?.childrenAlign;
                                    const childrenDirection = childrenDirectionRaw === "horizontal" ? "horizontal" : "vertical";
                                    const childrenAlign = childrenAlignRaw === "right" ? "right" : childrenAlignRaw === "center" ? "center" : "left";
                                    const childrenVerticalAlignRaw = block.config?.[responsiveConfigKey("childrenVerticalAlign")] ?? block.config?.childrenVerticalAlign;
                                    const childrenVerticalAlign =
                                        childrenVerticalAlignRaw === "bottom"
                                            ? "bottom"
                                            : childrenVerticalAlignRaw === "center" || childrenVerticalAlignRaw === "middle"
                                                ? "center"
                                                : "top";
                                    const directionClass = childrenDirection === "horizontal" ? "flex-row flex-wrap" : "flex-col";
                                    const alignMainAxisClass = childrenDirection === "horizontal"
                                        ? (childrenAlign === "center" ? "justify-center" : childrenAlign === "right" ? "justify-end" : "justify-start")
                                        : `items-stretch ${childrenAlign === "center" ? "text-center" : childrenAlign === "right" ? "text-right" : "text-left"}`;
                                    const alignCrossAxisClass = childrenDirection === "horizontal"
                                        ? (childrenVerticalAlign === "center" ? "items-center" : childrenVerticalAlign === "bottom" ? "items-end" : "items-start")
                                        : (childrenVerticalAlign === "center" ? "justify-center" : childrenVerticalAlign === "bottom" ? "justify-end" : "justify-start");
                                    return `relative z-10 flex ${directionClass} ${alignMainAxisClass} ${alignCrossAxisClass}`.trim();
                                })()}
                                style={{ gap: previewBlockGap }}
                            >
                                {colChildren.map((child: Block) => {
                                const childrenDirectionRaw = block.config?.[responsiveConfigKey("childrenDirection")] ?? block.config?.childrenDirection;
                                const childrenSizingRaw = block.config?.[responsiveConfigKey("childrenSizing")] ?? block.config?.childrenSizing;
                                const childrenDirection = childrenDirectionRaw === "horizontal" ? "horizontal" : "vertical";
                                const childrenSizing = childrenSizingRaw === "grow" ? "grow" : "auto";
                                const itemClass = childrenDirection === "horizontal" && childrenSizing === "grow" ? "flex-1 basis-0 min-w-0" : "";
                                const verticalAlignRaw = child?.config?.[responsiveConfigKey("verticalAlign")] ?? child?.config?.verticalAlign;
                                const verticalAlign =
                                    verticalAlignRaw === "bottom"
                                        ? "bottom"
                                        : verticalAlignRaw === "center" || verticalAlignRaw === "middle"
                                            ? "center"
                                            : "top";
                                const selfClass = verticalAlign === "center" ? "self-center" : verticalAlign === "bottom" ? "self-end" : "self-start";
                                const wrapperClass = `${itemClass} ${childrenDirection === "horizontal" ? selfClass : ""}`.trim();
                                if (child.type === 'section') {
                                    return (
                                        <div key={child.id} className={wrapperClass}>
                                            <SectionBlock
                                                builderLocation={builderLocation}
                                                key={child.id}
                                                activeDeviceTab={activeDeviceTab}
                                                block={child}
                                                index={-1}
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
                                                activeAddMenu={activeAddMenu}
                                                setActiveAddMenu={setActiveAddMenu}
                                                moveBlock={moveBlock}
                                                duplicateBlock={duplicateBlock}
                                                deleteBlockById={deleteBlockById}
                                                updateBlockConfigById={updateBlockConfigById}
                                                addChildBlockById={addChildBlockById}
                                                moveChildBlockById={moveChildBlockById}
                                                deleteChildBlockById={deleteChildBlockById}
                                                duplicateChildBlockById={duplicateChildBlockById}
                                                moveChildBlockColumnById={moveChildBlockColumnById}
                                                activeTheme={activeTheme}
                                                isNested={true}
                                                parentId={block.id}
                                                sidebarContext={effectiveSidebarContext}
                                                homeContainerWidth={homeContainerWidth}
                                                homeCustomContainerWidth={homeCustomContainerWidth}
                                                sourceBlocksByLocation={sourceBlocksByLocation}
                                            />
                                        </div>
                                    );
                                }

                                return (
                                    <div key={child.id} className={wrapperClass}>
                                        <WidgetItem 
                                            builderLocation={builderLocation}
                                            key={child.id}
                                            activeTheme={activeTheme}
                                            activeDeviceTab={activeDeviceTab}
                                            child={child}
                                            parentIndex={index}
                                            moveChildBlock={moveChildBlock}
                                            setEditingChild={setEditingChild}
                                            setActiveEditTab={setActiveEditTab}
                                            deleteChildBlock={deleteChildBlock}
                                            tags={tags}
                                            accentColor={accentColor}
                                            parentId={block.id}
                                            
                                            // Pass recursive props
                                            deleteBlockById={deleteBlockById}
                                            updateBlockConfigById={updateBlockConfigById}
                                            addChildBlockById={addChildBlockById}
                                            moveChildBlockById={moveChildBlockById}
                                            deleteChildBlockById={deleteChildBlockById}
                                            duplicateChildBlockById={duplicateChildBlockById}
                                            moveChildBlockColumnById={moveChildBlockColumnById}
                                            columnCount={columns.length}
                                            isSidebarColumn={effectiveSidebarContext}
                                            insideInnerSection={isNested}
                                            
                                            // Pass props for recursive SectionBlock
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
                                {activeAddMenu?.blockId === block.id && activeAddMenu?.colIndex === colIndex && (
                                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={(e) => { e.stopPropagation(); setActiveAddMenu(null); }}>
                                        <div className="bg-[var(--bg-elevated)] w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
                                            {/* Header */}
                                            <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)] sticky top-0 z-10">
                                                <div>
                                                    <h3 className="text-xl font-bold text-[var(--fg-primary)]">Pilih Widget</h3>
                                                    <p className="text-sm text-[var(--fg-muted)]">Tambahkan elemen baru ke dalam kolom ini</p>
                                                </div>
                                                <button 
                                                    onClick={() => setActiveAddMenu(null)}
                                                    className="p-2 hover:bg-[var(--bg-surface)] rounded-full transition-colors text-[var(--fg-muted)] hover:text-red-500"
                                                >
                                                    <X size={24} />
                                                </button>
                                            </div>

                                            {/* Content Scrollable */}
                                            <div className="flex-1 overflow-y-auto p-8 bg-[var(--bg-surface)] custom-scrollbar">
                                                {(() => {
                                                    // Widget Definition with Descriptions
                                                    const WIDGET_GROUPS: Record<string, { main: WidgetDefinition[]; sidebar: WidgetDefinition[] }> = {
                                                        classic: {
                                                            main: [
                                                                { type: "news_list", label: "Simple List", icon: List, desc: "Daftar berita sederhana." },
                                                                { type: "section", label: "Inner Section", icon: Layout, isSpecial: true, desc: "Kolom dalam kolom." },
                                                            ],
                                                            sidebar: [
                                                                { type: "sidebar_widget", label: "Sidebar Widget", icon: List, desc: "Widget sidebar standar." },
                                                                { type: "tag_cloud", label: "Tag Cloud", icon: Grid, desc: "Tag populer." },
                                                                { type: "ad_banner", label: "Iklan", icon: Megaphone, desc: "Banner iklan." },
                                                            ]
                                                        },
                                                        pranala: {
                                                            main: [
                                                                { type: "classic_hero", label: "Hero", icon: Layout, desc: "Hero section sederhana." },
                                                                { type: "news_hero_slider", label: "Hero Slider", icon: Newspaper, desc: "Carousel headline utama." },
                                                                { type: "news_hero_split_4", label: "Hero + 4 Mini", icon: Layout, desc: "Satu lead besar + empat mini card." },
                                                                { type: "news_headline_big", label: "Headline Big", icon: Newspaper, desc: "Headline utama dengan gambar besar." },
                                                                { type: "news_grid", label: "Grid News", icon: Grid, desc: "Daftar berita dalam kartu grid responsif." },
                                                                { type: "news_grid_slider", label: "Grid Slider", icon: Grid, desc: "Grid berita dengan navigasi panah." },
                                                                { type: "news_bullet_list", label: "Bullet List", icon: List, desc: "Daftar headline bullet dua kolom." },
                                                                { type: "news_list", label: "Simple List", icon: List, desc: "Daftar berita vertikal sederhana." },
                                                                { type: "section", label: "Inner Section", icon: Layout, isSpecial: true, desc: "Kolom dalam kolom." },
                                                            ],
                                                            sidebar: [
                                                                { type: "sidebar_widget", label: "Sidebar Widget", icon: List, desc: "Widget sidebar standar." },
                                                                { type: "tag_cloud", label: "Tag Cloud", icon: Grid, desc: "Kumpulan tag populer." },
                                                                { type: "ad_banner", label: "Iklan", icon: Megaphone, desc: "Banner iklan." },
                                                            ]
                                                        }
                                                    };
                                                    const themeKey = (activeTheme && WIDGET_GROUPS[activeTheme]) ? activeTheme : 'classic';
                                                    const archiveGroups = getThemeArchiveWidgetGroups(activeTheme);
                                                    const FOOTER_WIDGET_GROUPS: Record<string, { main: WidgetDefinition[]; sidebar: WidgetDefinition[] }> = {
                                                        classic: {
                                                            main: [
                                                                { type: "footer_logo", label: "Logo", icon: Layout, desc: "Logo atau nama situs (samakan dengan Header Logo)." },
                                                                { type: "footer_menu", label: "Menu Footer", icon: List, desc: "Menu khusus lokasi Footer." },
                                                                { type: "footer_text", label: "Teks", icon: Grid, desc: "Teks bebas (alamat, kontak, dsb)." },
                                                                { type: "footer_social", label: "Social Links", icon: Grid, desc: "Link media sosial." },
                                                                { type: "footer_categories", label: "Kategori", icon: List, desc: "List kategori (otomatis dari data kategori)." },
                                                                { type: "footer_custom_links", label: "Custom Links", icon: List, desc: "Daftar link custom (mirip Custom Links pada Menu)." },
                                                                { type: "footer_copyright", label: "Copyright", icon: Megaphone, desc: "Teks copyright + tahun." },
                                                                { type: "section", label: "Inner Section", icon: Layout, isSpecial: true, desc: "Kolom dalam kolom." },
                                                            ],
                                                            sidebar: [],
                                                        },
                                                        pranala: {
                                                            main: [
                                                                { type: "footer_logo", label: "Logo", icon: Layout, desc: "Logo atau nama situs (samakan dengan Header Logo)." },
                                                                { type: "footer_menu", label: "Menu Footer", icon: List, desc: "Menu khusus lokasi Footer." },
                                                                { type: "footer_text", label: "Teks", icon: Grid, desc: "Teks bebas (alamat, kontak, dsb)." },
                                                                { type: "footer_social", label: "Social Links", icon: Grid, desc: "Link media sosial." },
                                                                { type: "footer_categories", label: "Kategori", icon: List, desc: "List kategori (otomatis dari data kategori)." },
                                                                { type: "footer_custom_links", label: "Custom Links", icon: List, desc: "Daftar link custom (mirip Custom Links pada Menu)." },
                                                                { type: "footer_copyright", label: "Copyright", icon: Megaphone, desc: "Teks copyright + tahun." },
                                                                { type: "section", label: "Inner Section", icon: Layout, isSpecial: true, desc: "Kolom dalam kolom." },
                                                            ],
                                                            sidebar: [],
                                                        },
                                                    };
                                                    const footerThemeKey = (activeTheme && FOOTER_WIDGET_GROUPS[activeTheme]) ? activeTheme : 'classic';
                                                    const headerGroups = {
                                                        main: [
                                                            { type: "header_logo", label: "Logo", icon: Layout, desc: "Logo atau nama situs." },
                                                            { type: "header_menu_primary", label: "Menu Primary", icon: List, desc: "Menu lokasi Primary." },
                                                            { type: "header_menu_secondary", label: "Menu Secondary", icon: List, desc: "Menu lokasi Secondary." },
                                                            { type: "header_search", label: "Search", icon: Grid, desc: "Tombol search." },
                                                            { type: "header_theme_toggle", label: "Theme Toggle", icon: Grid, desc: "Tombol ganti tema." },
                                                            { type: "header_login", label: "Tombol Masuk", icon: Megaphone, desc: "Tombol login/masuk." },
                                                            { type: "header_mobile_menu_toggle", label: "Hamburger Menu (Mobile)", icon: List, desc: "Tombol hamburger untuk membuka menu off-canvas di mobile." },
                                                            { type: "ad_banner", label: "Iklan Banner", icon: Megaphone, desc: "Banner iklan dari Manajemen Iklan (posisi: HEADER)." },
                                                        ],
                                                        sidebar: [],
                                                    };
                                                    const groups = builderLocation === "header"
                                                        ? headerGroups
                                                        : builderLocation === "footer"
                                                        ? FOOTER_WIDGET_GROUPS[footerThemeKey]
                                                        : builderLocation === "archive"
                                                        ? { main: archiveGroups.main, sidebar: archiveGroups.support }
                                                        : WIDGET_GROUPS[themeKey];

                                                    return (
                                                        <div className="space-y-10">
                                                            {/* Section 1: Widget Utama */}
                                                            <div>
                                                                <h4 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                                                    <div className="w-1.5 h-5 bg-[var(--accent)] rounded-full"></div>
                                                                    Widget Utama (Main Content)
                                                                </h4>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                                    {groups.main.map((widget: WidgetDefinition) => {
                                                                        const Icon = widget.icon;
                                                                        return (
                                                                            <button 
                                                                                key={widget.type}
                                                                                onClick={(e) => { e.stopPropagation(); handleAddChild(widget.type, widget.label, colIndex); }}
                                                                                className="flex flex-col items-start p-5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group h-full"
                                                                            >
                                                                                <div className={`p-3.5 rounded-xl mb-4 ${widget.isSpecial ? 'bg-[var(--bg-base)] text-[var(--accent)]' : 'bg-[var(--bg-base)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors'}`}>
                                                                                    <Icon size={28} />
                                                                                </div>
                                                                                <span className="font-bold text-lg text-[var(--fg-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">{widget.label}</span>
                                                                                <span className="text-sm text-[var(--fg-muted)] leading-relaxed">{widget.desc}</span>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* Section 2: Sidebar Widgets */}
                                                            <div>
                                                                <h4 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                                                    <div className="w-1.5 h-5 bg-[var(--accent)] rounded-full"></div>
                                                                    Widget Sidebar & Tambahan
                                                                </h4>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                                    {groups.sidebar.map((widget: WidgetDefinition) => {
                                                                        const Icon = widget.icon;
                                                                        return (
                                                                            <button 
                                                                                key={widget.type}
                                                                                onClick={(e) => { e.stopPropagation(); handleAddChild(widget.type, widget.label, colIndex); }}
                                                                                className="flex flex-col items-start p-5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group h-full"
                                                                            >
                                                                                <div className="p-3.5 rounded-xl mb-4 bg-[var(--bg-base)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                                                                                    <Icon size={28} />
                                                                                </div>
                                                                                <span className="font-bold text-lg text-[var(--fg-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">{widget.label}</span>
                                                                                <span className="text-sm text-[var(--fg-muted)] leading-relaxed">{widget.desc}</span>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            
                                            {/* Footer hint */}
                                            <div className="px-6 py-4 bg-[var(--bg-base)] border-t border-[var(--border)] text-xs text-[var(--fg-muted)] text-center flex justify-between items-center">
                                                <span>Tips: Gunakan widget yang sesuai dengan lebar kolom.</span>
                                                <button onClick={() => setActiveAddMenu(null)} className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] underline">Tutup</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    );
                    })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default React.memo(SectionBlock);
