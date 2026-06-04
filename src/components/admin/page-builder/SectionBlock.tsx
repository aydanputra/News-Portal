import React from "react";
import { Trash2, Settings, Plus, Layout, ArrowUp, ArrowDown, X, Copy, List, Grid, Megaphone } from "lucide-react";
import { Block, Tag } from "./types";
import WidgetItem from "./WidgetItem";
import { getThemeBlocks } from "@/lib/block-registry";
import { getThemePostWidgetGroups } from "@/lib/post-builder-theme-registry";
import { ConfigValue } from "@/lib/page-builder-config";
import { resolveSectionChildrenWithSidebarSource, SidebarSourceBlocksMap } from "@/lib/sidebar-reference";
import { getThemeArchiveWidgetGroups } from "@/lib/archive-builder-theme-registry";

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
    setActiveEditTab: (tab: 'content' | 'visual') => void;
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
    const context = builderLocation === "post" ? "post" : "home";
    const postWidgetGroups = getThemePostWidgetGroups(activeTheme || "classic");
    const archiveWidgetGroups = getThemeArchiveWidgetGroups(activeTheme || "classic");
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
        if (addChildBlockById) {
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
            case '100': return ['w-full'];
            case '50-50': return ['w-1/2', 'w-1/2'];
            case '33-66': return ['w-1/2', 'w-1/2'];
            case '66-33': return ['w-1/2', 'w-1/2'];
            case '33-33-33': return ['w-1/3', 'w-1/3', 'w-1/3'];
            case '25-25-25-25': return ['w-1/4', 'w-1/4', 'w-1/4', 'w-1/4'];
            default: return ['w-full'];
        }
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

    return (
        <div className="relative group bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-sm hover:shadow-md transition-all">
            {/* Section Header */}
            <div className="bg-[var(--bg-base)] px-4 py-2 border-b border-[var(--border)] flex justify-between items-center rounded-t-xl">
                <div className="flex items-center gap-2">
                    {/* Reorder Controls (Both Top-Level and Nested) */}
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
                    className={`relative flex min-h-[150px] ${isStackedLayout ? "flex-col" : "flex-row"} gap-3`}
                >
                    {columns.map((widthClass, colIndex) => {
                        const resolvedSectionChildren = builderLocation === "header" || builderLocation === "footer"
                          ? ((block.config as any)?.children || [])
                          : resolveSectionChildrenWithSidebarSource(block, sourceBlocksByLocation, builderLocation as any);
                        const colChildren = resolvedSectionChildren.filter((c: Block) => (c.config?.columnIndex || 0) === colIndex);
                        const isEmpty = colChildren.length === 0;
                        const effectiveSidebarContext = sidebarContext;

                        return (
                        <div key={colIndex} className={`${isStackedLayout ? "w-full" : widthClass} p-3 bg-[var(--bg-surface)] relative group/col`}>
                            {/* Empty State Placeholder */}
                            {isEmpty && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-[var(--fg-muted)] text-xs font-medium border-2 border-dashed border-[var(--border)] rounded px-3 py-1 bg-[var(--bg-base)]">
                                        Kolom Kosong
                                    </span>
                                </div>
                            )}

                            {/* Column Content */}
                            <div className="relative z-10 flex flex-col items-stretch justify-start gap-3">
                                {colChildren.map((child: Block) => {
                                    const wrapperClass = "";
                                    if (child.type === 'section') {
                                        // Recursive Render for Nested Sections
                                        return (
                                            <div key={child.id} className={wrapperClass}>
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
                                        <div key={child.id} className={wrapperClass}>
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
                                    {activeAddMenu?.blockId === block.id && activeAddMenu?.colIndex === colIndex && (
                                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={(e) => { e.stopPropagation(); setActiveAddMenu(null); }}>
                                            <div className="bg-[var(--bg-elevated)] border border-[var(--border)] w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
                                                {/* Header */}
                                                <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)] sticky top-0 z-10">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-[var(--fg-primary)]">Pilih Widget</h3>
                                                        <p className="text-sm text-[var(--fg-secondary)]">Tambahkan elemen baru ke dalam kolom ini</p>
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
                                                        
                                                        // Special "Inner Section" block (Hardcoded as it's a builder feature, not a theme widget)
                                                        const innerSectionBlock: WidgetDefinition = { 
                                                            type: "section", 
                                                            label: "Inner Section", 
                                                            icon: Layout, 
                                                            isSpecial: true, 
                                                            desc: "Buat kolom tambahan di dalam kolom ini." 
                                                        };

                                                        groups.main.push(innerSectionBlock);
                                                        groups.sidebar.push(innerSectionBlock);

                                                        // Header/Footer Widget Definitions
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
                                                                    innerSectionBlock,
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
                                                                    innerSectionBlock,
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
                                                                innerSectionBlock,
                                                            ],
                                                            sidebar: [],
                                                        };

                                                        return (
                                                            <div className="space-y-10">
                                                                {builderLocation === 'header' ? (
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                                                            <div className="w-1.5 h-5 bg-[var(--accent)] rounded-full"></div>
                                                                            Elemen Header
                                                                        </h4>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                                            {(headerGroups.main as WidgetDefinition[]).map((widget) => {
                                                                                const Icon = widget.icon;
                                                                                return (
                                                                                    <button 
                                                                                        key={widget.type}
                                                                                        onClick={(e) => { e.stopPropagation(); handleAddChild(widget.type!, widget.label, colIndex); }}
                                                                                        className="flex flex-col items-start p-5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group h-full w-full"
                                                                                    >
                                                                                        <div className={`p-3.5 rounded-xl mb-4 ${widget.isSpecial ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'bg-[var(--bg-base)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors'}`}>
                                                                                            <Icon size={28} />
                                                                                        </div>
                                                                                        <span className="font-bold text-lg text-[var(--fg-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">{widget.label}</span>
                                                                                        <span className="text-sm text-[var(--fg-muted)] leading-relaxed">{widget.desc}</span>
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                ) : builderLocation === 'footer' ? (
                                                                    <div>
                                                                        <h4 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                                                            <div className="w-1.5 h-5 bg-[var(--accent)] rounded-full"></div>
                                                                            Elemen Footer
                                                                        </h4>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                                            {(FOOTER_WIDGET_GROUPS[footerThemeKey].main as WidgetDefinition[]).map((widget) => {
                                                                                const Icon = widget.icon;
                                                                                return (
                                                                                    <button 
                                                                                        key={widget.type}
                                                                                        onClick={(e) => { e.stopPropagation(); handleAddChild(widget.type!, widget.label, colIndex); }}
                                                                                        className="flex flex-col items-start p-5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group h-full w-full"
                                                                                    >
                                                                                        <div className={`p-3.5 rounded-xl mb-4 ${widget.isSpecial ? 'bg-[var(--accent-subtle)] text-[var(--accent)]' : 'bg-[var(--bg-base)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors'}`}>
                                                                                            <Icon size={28} />
                                                                                        </div>
                                                                                        <span className="font-bold text-lg text-[var(--fg-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">{widget.label}</span>
                                                                                        <span className="text-sm text-[var(--fg-muted)] leading-relaxed">{widget.desc}</span>
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                ) : currentContext === 'home' || builderLocation === 'archive' ? (
                                                                    <>
                                                                        {/* Section 1: Widget Utama */}
                                                                        <div>
                                                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-200 pb-2">
                                                                                <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                                                                                {builderLocation === 'archive' ? 'Widget Arsip' : 'Widget Utama (Main Content)'}
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                                                {(builderLocation === 'archive' ? archiveWidgetGroups.main : groups.main).map((widget: WidgetDefinition) => {
                                                                                    const Icon = widget.icon;
                                                                                    const widgetType = widget.id ?? widget.type;
                                                                                    if (!widgetType) return null;
                                                                                    return (
                                                                                        <button 
                                                                                            key={widgetType}
                                                                                            onClick={(e) => { e.stopPropagation(); handleAddChild(widgetType, widget.label, colIndex); }}
                                                                                            className="flex flex-col items-start p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group h-full w-full"
                                                                                        >
                                                                                            <div className={`p-3.5 rounded-xl mb-4 ${widget.isSpecial ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors'}`}>
                                                                                                <Icon size={28} />
                                                                                            </div>
                                                                                            <span className="font-bold text-lg text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{widget.label}</span>
                                                                                            <span className="text-sm text-gray-500 leading-relaxed">{widget.description || widget.desc}</span>
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>

                                                                        {/* Section 2: Sidebar Widgets */}
                                                                        <div>
                                                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-200 pb-2">
                                                                                <div className="w-1.5 h-5 bg-orange-500 rounded-full"></div>
                                                                                Widget Sidebar & Tambahan
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                                                {(builderLocation === 'archive' ? archiveWidgetGroups.support : groups.sidebar).map((widget: WidgetDefinition) => {
                                                                                    const Icon = widget.icon;
                                                                                    const widgetType = widget.id ?? widget.type;
                                                                                    if (!widgetType) return null;
                                                                                    // Skip special block in sidebar list to avoid duplicates if desired, or keep it.
                                                                                    if (widget.type === 'section') return null; 

                                                                                    return (
                                                                                        <button 
                                                                                            key={widgetType}
                                                                                            onClick={(e) => { e.stopPropagation(); handleAddChild(widgetType, widget.label, colIndex); }}
                                                                                            className="flex flex-col items-start p-5 bg-white border border-gray-200 rounded-xl hover:border-orange-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group h-full w-full"
                                                                                        >
                                                                                            <div className={`p-3.5 rounded-xl mb-4 ${widget.isSpecial ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors'}`}>
                                                                                                <Icon size={28} />
                                                                                            </div>
                                                                                            <span className="font-bold text-lg text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">{widget.label}</span>
                                                                                            <span className="text-sm text-gray-500 leading-relaxed">{widget.description || widget.desc}</span>
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div>
                                                                            <h4 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                                                                <div className="w-1.5 h-5 bg-[var(--accent)] rounded-full"></div>
                                                                                Struktur Konten Utama Post
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                                                {postWidgetGroups.main.map((widget) => {
                                                                                    const Icon = widget.icon;
                                                                                    const widgetType = widget.type;
                                                                                    if (!widgetType) return null;
                                                                                    return (
                                                                                        <button
                                                                                            key={widgetType}
                                                                                            onClick={(e) => { e.stopPropagation(); handleAddChild(widgetType, widget.label, colIndex); }}
                                                                                            className="flex flex-col items-start p-5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group h-full w-full"
                                                                                        >
                                                                                            <div className="p-3.5 rounded-xl mb-4 bg-[var(--bg-base)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                                                                                                <Icon size={28} />
                                                                                            </div>
                                                                                            <span className="font-bold text-lg text-[var(--fg-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">{widget.label}</span>
                                                                                            <span className="text-sm text-[var(--fg-muted)] leading-relaxed">{widget.description || widget.desc}</span>
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <h4 className="text-sm font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-[var(--border)] pb-2">
                                                                                <div className="w-1.5 h-5 bg-[var(--accent)] rounded-full"></div>
                                                                                Elemen Pendukung & Sidebar
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                                                {postWidgetGroups.support.map((widget) => {
                                                                                    const Icon = widget.icon;
                                                                                    const widgetType = widget.type;
                                                                                    if (!widgetType) return null;
                                                                                    return (
                                                                                        <button
                                                                                            key={widgetType}
                                                                                            onClick={(e) => { e.stopPropagation(); handleAddChild(widgetType, widget.label, colIndex); }}
                                                                                            className="flex flex-col items-start p-5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left group h-full w-full"
                                                                                        >
                                                                                            <div className={`p-3.5 rounded-xl mb-4 ${widget.isSpecial ? 'bg-[var(--bg-base)] text-[var(--accent)]' : 'bg-[var(--bg-base)] text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-colors'}`}>
                                                                                                <Icon size={28} />
                                                                                            </div>
                                                                                            <span className="font-bold text-lg text-[var(--fg-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors">{widget.label}</span>
                                                                                            <span className="text-sm text-[var(--fg-muted)] leading-relaxed">{widget.description || widget.desc}</span>
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
    );
}

export default React.memo(SectionBlock);
