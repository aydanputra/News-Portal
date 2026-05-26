import React from "react";
import { ArrowUp, ArrowDown, Edit, Trash2, Copy, ArrowLeft, ArrowRight, Settings } from "lucide-react";
import { Block, Tag } from "../types";
import SectionBlock from "./SectionBlock";
import { ConfigValue } from "@/lib/page-builder-config";

interface WidgetItemProps {
    builderLocation?: "home" | "archive" | "header" | "footer";
    child: Block;
    activeTheme?: string;
    activeDeviceTab?: "desktop" | "tablet" | "mobile";
    parentIndex: number;
    moveChildBlock: (parentIndex: number, childId: string, direction: "up" | "down") => void;
    setEditingChild: (child: { parentIndex: number, childId: string } | null) => void;
    setActiveEditTab: (tab: 'content' | 'visual') => void;
    deleteChildBlock: (parentIndex: number, childId: string) => void;
    tags: Tag[];
    accentColor: string;
    parentId?: string;
    columnCount?: number;
    isSidebarColumn?: boolean;
    insideInnerSection?: boolean;

    // Recursive Actions
    deleteBlockById?: (blockId: string) => void;
    updateBlockConfigById?: (blockId: string, key: string, value: ConfigValue) => void;
    addChildBlockById?: (parentId: string, type: string, title: string, columnIndex: number) => void;
    moveChildBlockById?: (parentId: string, childId: string, direction: "up" | "down") => void;
    deleteChildBlockById?: (parentId: string, childId: string) => void;
    duplicateChildBlockById?: (parentId: string, childId: string) => void;
    moveChildBlockColumnById?: (parentId: string, childId: string, direction: "left" | "right") => void;

    // Props for SectionBlock recursion
    updateBlockConfig?: (index: number, key: string, value: ConfigValue) => void;
    deleteBlock?: (index: number) => void;
    setEditingSectionId?: (id: string | null) => void;
    setActiveSectionTab?: (tab: 'layout' | 'style') => void;
    addChildBlock?: (parentIndex: number, type: string, title: string, columnIndex: number) => void;
    activeAddMenu?: { blockId: string, colIndex: number } | null;
    setActiveAddMenu?: (menu: { blockId: string, colIndex: number } | null) => void;
    moveBlock?: (index: number, direction: "up" | "down") => void;
}

function WidgetItem({
    builderLocation = "home",
    child,
    activeTheme = "classic",
    activeDeviceTab = "desktop",
    parentIndex,
    moveChildBlock,
    setEditingChild,
    setActiveEditTab,
    deleteChildBlock,
    tags,
    accentColor,
    parentId,
    columnCount = 1,
    isSidebarColumn = false,
    insideInnerSection = false,

    // Recursive Actions
    deleteBlockById,
    updateBlockConfigById,
    addChildBlockById,
    moveChildBlockById,
    deleteChildBlockById,
    duplicateChildBlockById,
    moveChildBlockColumnById,

    // Recursion props
    updateBlockConfig,
    deleteBlock,
    setEditingSectionId,
    setActiveSectionTab,
    addChildBlock,
    activeAddMenu,
    setActiveAddMenu,
    moveBlock
}: WidgetItemProps) {
    const isNewsWidget =
        child.type.startsWith("news_") ||
        child.type === "headline_2" ||
        child.type === "classic_hero";
    const isArchiveWidget = child.type.startsWith("archive_") || (builderLocation === "archive" && (child.type === "news_hero_slider" || child.type === "news_grid"));

    const getResponsiveValue = (key: string): unknown => {
        const config = child.config || {};
        if (activeDeviceTab === "tablet") {
            const tabletKey = `tablet${key.charAt(0).toUpperCase() + key.slice(1)}`;
            return config[tabletKey] !== undefined ? config[tabletKey] : config[key];
        }
        if (activeDeviceTab === "mobile") {
            const mobileKey = `mobile${key.charAt(0).toUpperCase() + key.slice(1)}`;
            return config[mobileKey] !== undefined ? config[mobileKey] : config[key];
        }
        return config[key];
    };

    const getConfigString = (key: string, fallback = ""): string => {
        const value = getResponsiveValue(key);
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
        return fallback;
    };

    const getConfigNumber = (key: string): number | undefined => {
        const value = getResponsiveValue(key);
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (typeof value === "string" && value.trim() !== "") {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : undefined;
        }
        return undefined;
    };

    const getConfigBool = (key: string, fallback = false): boolean => {
        const value = getResponsiveValue(key);
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
            const normalized = value.trim().toLowerCase();
            if (normalized === "true") return true;
            if (normalized === "false") return false;
        }
        if (typeof value === "number") return value === 1;
        return fallback;
    };

    const deviceLabel = activeDeviceTab === "desktop" ? "Desktop" : activeDeviceTab === "tablet" ? "Tablet" : "Mobile";
    const isTabletSidebarCompact = activeDeviceTab === "tablet" && isSidebarColumn;
    const canOpenWidgetSettings = builderLocation !== "header"
        || child.type === "ad_banner"
        || child.type === "header_logo"
        || child.type === "header_menu_primary"
        || child.type === "header_menu_secondary"
        || child.type === "header_search"
        || child.type === "header_theme_toggle"
        || child.type === "header_mobile_menu_toggle";
    const isInnerSectionSidebarCompact = isSidebarColumn && insideInnerSection;
    const isMobileInnerSectionCompact = activeDeviceTab === "mobile" && insideInnerSection;
    const isCompactPreview = isTabletSidebarCompact || isInnerSectionSidebarCompact || isMobileInnerSectionCompact;

    // Helper for delete
    const handleDelete = () => {
        if (deleteChildBlockById && parentId) {
            deleteChildBlockById(parentId, child.id);
        } else {
            deleteChildBlock(parentIndex, child.id);
        }
    };
    
    // Helper for move
    const handleMove = (direction: "up" | "down") => {
        if (moveChildBlockById && parentId) {
            moveChildBlockById(parentId, child.id, direction);
        } else {
            moveChildBlock(parentIndex, child.id, direction);
        }
    };

    const handleDuplicate = () => {
        if (duplicateChildBlockById && parentId) {
            duplicateChildBlockById(parentId, child.id);
        }
    };

    const handleMoveColumn = (direction: "left" | "right") => {
        if (moveChildBlockColumnById && parentId) {
            moveChildBlockColumnById(parentId, child.id, direction);
        }
    };

    const limitValue = getConfigNumber("limit");
    const offsetValue = getConfigNumber("offset");
    const filterType = getConfigString("filterType", "category");
    const categorySlug = getConfigString("categorySlug");
    const tagSlug = getConfigString("tagSlug");
    const gridColumns = getConfigNumber("gridColumns");
    const showCategory = getConfigBool("showCategory", true);
    const showMetaInfo = getConfigBool("showMetaInfo", true);
    const showExcerpt = getConfigBool("showExcerpt", false);
    const previewColumnCount = getConfigNumber("columnCount");
    const tagPreviewLimit = Math.max(1, Math.min(getConfigNumber("limit") ?? 8, 12));
    const supportsCategoryInfo = child.type !== "news_bullet_list";
    const supportsMetaInfo = child.type !== "news_bullet_list";
    const supportsExcerptInfo =
        child.type !== "news_bullet_list" &&
        child.type !== "headline_2" &&
        child.type !== "classic_hero";

    const newsSourceLabel =
        builderLocation === "archive" && child.type === "news_grid"
            ? "sumber: archive aktif"
            :
        filterType === "tag"
            ? (tagSlug ? `tag: ${tagSlug}` : "tag")
            : (categorySlug && categorySlug !== "all" ? `kategori: ${categorySlug}` : "semua kategori");

    const controlIconSize = isCompactPreview ? 12 : 14;
    const controlPad = isCompactPreview ? "p-1" : "p-1.5";

    if (child.type === 'section') {
        return (
            <SectionBlock
                builderLocation={builderLocation}
                activeTheme={activeTheme}
                activeDeviceTab={activeDeviceTab}
                block={child}
                index={-1} // Nested sections don't have a root index, rely on ID
                // Pass recursive props
                deleteBlockById={deleteBlockById}
                updateBlockConfigById={updateBlockConfigById}
                addChildBlockById={addChildBlockById}
                moveChildBlockById={moveChildBlockById}
                deleteChildBlockById={deleteChildBlockById}
                duplicateChildBlockById={duplicateChildBlockById}
                moveChildBlockColumnById={moveChildBlockColumnById}
                
                // Pass legacy props (required by type but shouldn't be used if ID ops exist)
                updateBlockConfig={updateBlockConfig!}
                deleteBlock={deleteBlock!}
                setEditingSectionId={setEditingSectionId!}
                setActiveSectionTab={setActiveSectionTab!}
                moveChildBlock={moveChildBlock}
                setEditingChild={setEditingChild}
                setActiveEditTab={setActiveEditTab}
                deleteChildBlock={deleteChildBlock}
                addChildBlock={addChildBlock!}
                tags={tags}
                accentColor={accentColor}
                activeAddMenu={activeAddMenu || null}
                setActiveAddMenu={setActiveAddMenu!}
                moveBlock={moveBlock!}
                onMove={handleMove}
                onDuplicate={handleDuplicate}
            />
        );
    }

    const currentColumnIndex = child.config?.columnIndex || 0;

    return (
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 shadow-sm hover:border-[var(--accent)] group/item relative transition-all">
            <div className={`mb-2 gap-2 ${isCompactPreview ? 'flex flex-col items-stretch' : 'flex justify-between items-start'}`}>
                <div className="flex min-w-0 items-center gap-2">
                    <div className={`p-1 rounded text-white text-[10px] font-bold ${
                        child.type === 'news_grid' ? 'bg-blue-500' :
                        child.type === 'news_list' ? 'bg-green-500' :
                        child.type === 'news_bullet_list' ? 'bg-teal-500' :
                        child.type === 'archive_header' ? 'bg-indigo-500' :
                        child.type === 'news_hero_slider' && builderLocation === 'archive' ? 'bg-sky-500' :
                        child.type === 'news_grid' && builderLocation === 'archive' ? 'bg-cyan-500' :
                        child.type === 'archive_post_grid' ? 'bg-cyan-500' :
                        child.type === 'archive_post_list' ? 'bg-emerald-500' :
                        child.type === 'archive_pagination' ? 'bg-amber-500' :
                        child.type === 'archive_empty_state' ? 'bg-rose-500' :
                        child.type === 'sidebar_widget' ? 'bg-red-500' :
                        child.type === 'tag_cloud' ? 'bg-purple-500' :
                        child.type === 'ad_banner' ? 'bg-orange-500' : 'bg-gray-500'
                    }`}>
                        {child.type === 'sidebar_widget' ? 'WIDGET' : child.type === 'tag_cloud' ? 'TAG CLOUD' : child.type === 'news_bullet_list' ? 'BULLET LIST' : child.type.replace('news_', '').replace('archive_', '').toUpperCase()}
                    </div>
                    <span className="min-w-0 flex-1 text-xs font-bold text-[var(--fg-primary)] truncate">{child.title}</span>
                </div>
                {isCompactPreview ? (
                    <div className="flex flex-wrap items-center justify-end bg-[var(--bg-base)] rounded-md border border-[var(--border)] overflow-hidden">
                        {columnCount > 1 && (
                            <>
                                <button 
                                    onClick={() => handleMoveColumn("left")} 
                                    disabled={currentColumnIndex === 0}
                                    className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all rounded-l-md border-r border-[var(--border)] ${currentColumnIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    title="Geser Kiri"
                                >
                                    <ArrowLeft size={controlIconSize} />
                                </button>
                                <button 
                                    onClick={() => handleMoveColumn("right")} 
                                    disabled={currentColumnIndex === columnCount - 1}
                                    className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)] ${currentColumnIndex === columnCount - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                                    title="Geser Kanan"
                                >
                                    <ArrowRight size={controlIconSize} />
                                </button>
                            </>
                        )}
                        <button onClick={() => handleMove("up")} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)] ${columnCount <= 1 ? 'rounded-l-md' : ''}`} title="Geser Atas"><ArrowUp size={controlIconSize} /></button>
                        <button onClick={() => handleMove("down")} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)]`} title="Geser Bawah"><ArrowDown size={controlIconSize} /></button>
                        {canOpenWidgetSettings && (
                            <button
                                onClick={() => { setEditingChild({ parentIndex, childId: child.id }); setActiveEditTab("content"); }}
                                className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)]`}
                                title={builderLocation === "header" ? "Pengaturan" : "Edit Konten"}
                            >
                                {builderLocation === "header" ? <Settings size={controlIconSize} /> : <Edit size={controlIconSize} />}
                            </button>
                        )}
                        <button onClick={handleDuplicate} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)]`} title="Duplikasi"><Copy size={controlIconSize} /></button>
                        <button onClick={() => handleDelete()} className={`${controlPad} text-[var(--fg-muted)] hover:text-red-600 hover:bg-[var(--bg-elevated)] transition-all rounded-r-md`} title="Hapus"><Trash2 size={controlIconSize} /></button>
                    </div>
                ) : (
                    <div className="flex items-center bg-[var(--bg-base)] rounded-md border border-[var(--border)]">
                        {/* Column Move Controls - Only show if parent has multiple columns */}
                        {columnCount > 1 && (
                            <>
                                <button 
                                    onClick={() => handleMoveColumn("left")} 
                                    disabled={currentColumnIndex === 0}
                                    className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all rounded-l-md border-r border-[var(--border)] ${currentColumnIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`} 
                                    title="Geser Kiri"
                                >
                                    <ArrowLeft size={controlIconSize} />
                                </button>
                                <button 
                                    onClick={() => handleMoveColumn("right")} 
                                    disabled={currentColumnIndex === columnCount - 1}
                                    className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)] ${currentColumnIndex === columnCount - 1 ? 'opacity-30 cursor-not-allowed' : ''}`} 
                                    title="Geser Kanan"
                                >
                                    <ArrowRight size={controlIconSize} />
                                </button>
                            </>
                        )}

                        <button onClick={() => handleMove("up")} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)] ${columnCount <= 1 ? 'rounded-l-md' : ''}`} title="Geser Atas"><ArrowUp size={controlIconSize} /></button>
                        <button onClick={() => handleMove("down")} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)]`} title="Geser Bawah"><ArrowDown size={controlIconSize} /></button>
                        {canOpenWidgetSettings && (
                            <button
                                onClick={() => { setEditingChild({ parentIndex, childId: child.id }); setActiveEditTab("content"); }}
                                className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)]`}
                                title={builderLocation === "header" ? "Pengaturan" : "Edit Konten"}
                            >
                                {builderLocation === "header" ? <Settings size={controlIconSize} /> : <Edit size={controlIconSize} />}
                            </button>
                        )}
                        <button onClick={handleDuplicate} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)]`} title="Duplikasi"><Copy size={controlIconSize} /></button>
                        <button onClick={() => handleDelete()} className={`${controlPad} text-[var(--fg-muted)] hover:text-red-600 hover:bg-[var(--bg-elevated)] transition-all rounded-r-md`} title="Hapus"><Trash2 size={controlIconSize} /></button>
                    </div>
                )}
            </div>

            {/* Mini Config */}
            <div className="text-[10px] text-[var(--fg-muted)] space-y-1">
                {isNewsWidget && (
                    <>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] uppercase tracking-wide">{deviceLabel}</span>
                            <span>{newsSourceLabel}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {limitValue !== undefined && <span>limit: {limitValue}</span>}
                            {offsetValue !== undefined && offsetValue > 0 && <span>offset: {offsetValue}</span>}
                            {gridColumns !== undefined && (child.type === "news_grid" || child.type === "news_grid_slider") && <span>kolom: {gridColumns}</span>}
                            {previewColumnCount !== undefined && child.type === "news_bullet_list" && <span>kolom: {previewColumnCount}</span>}
                            {supportsCategoryInfo && <span>kategori: {showCategory ? "on" : "off"}</span>}
                            {supportsMetaInfo && <span>meta: {showMetaInfo ? "on" : "off"}</span>}
                            {supportsExcerptInfo && <span>excerpt: {showExcerpt ? "on" : "off"}</span>}
                        </div>
                    </>
                )}
                {builderLocation === "header" && updateBlockConfigById && (
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] uppercase tracking-wide">posisi</span>
                        <select
                            className="h-7 px-2 rounded border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-primary)] text-[11px]"
                            value={getConfigString("align", "auto") || "auto"}
                            onChange={(e) => updateBlockConfigById(child.id, "align", e.target.value)}
                        >
                            <option value="auto">Auto</option>
                            <option value="left">Kiri</option>
                            <option value="center">Tengah</option>
                            <option value="right">Kanan</option>
                            <option value="stretch">Penuhi</option>
                        </select>
                    </div>
                )}
                {isArchiveWidget && (
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {child.type === "archive_header" && (
                            <>
                                <span>style: {getConfigString("headerStyle", "minimal") === "card" ? "Heading 2" : getConfigString("headerStyle", "minimal") === "spotlight" ? "Heading 3" : "Heading Standar"}</span>
                                <span>deskripsi: {getConfigBool("showDescription", true) ? "on" : "off"}</span>
                                <span>jumlah artikel: {getConfigBool("showPostCount", true) ? "on" : "off"}</span>
                            </>
                        )}
                        {child.type === "archive_pagination" && (
                            <>
                                <span>prev/next: {getConfigBool("showPrevNext", true) ? "on" : "off"}</span>
                                <span>halaman terlihat: {getConfigNumber("maxVisiblePages") ?? 5}</span>
                            </>
                        )}
                        {child.type === "archive_empty_state" && <span>muncul saat hasil kosong</span>}
                        {child.type !== "archive_header" && limitValue !== undefined && <span>limit: {limitValue}</span>}
                        {child.type === "archive_post_grid" && <span>kolom: {getConfigNumber("columns") ?? 3}</span>}
                        {child.type === "news_hero_slider" && builderLocation === "archive" && (
                            <>
                                <span>mode: hero slider arsip</span>
                                <span>sumber: archive aktif</span>
                            </>
                        )}
                        {child.type === "news_grid" && builderLocation === "archive" && (
                            <>
                                <span>mode: grid news arsip</span>
                                <span>sumber: archive aktif</span>
                            </>
                        )}
                        {child.type === "archive_post_list" && (
                            <>
                                {offsetValue !== undefined && offsetValue > 0 && <span>offset: {offsetValue}</span>}
                                <span>kategori: {getConfigBool("showCategory", true) ? "on" : "off"}</span>
                                <span>meta: {getConfigBool("showMetaInfo", true) ? "on" : "off"}</span>
                                <span>divider: {getConfigBool("showDivider", true) ? "on" : "off"}</span>
                            </>
                        )}
                        {(child.type === "archive_post_grid" || child.type === "archive_post_list") && <span>sumber: archive aktif</span>}
                    </div>
                )}
                {child.type === 'tag_cloud' && (
                    <div className="mt-2">
                        {/* CSS Variable for Hover */}
                        <div className="flex flex-wrap gap-1"
                            style={{
                                '--hover-bg': accentColor || '#3b82f6',
                                '--hover-text': '#ffffff',
                                '--hover-border': accentColor || '#3b82f6'
                            } as React.CSSProperties}
                        >
                            {tags && tags.length > 0 ? (
                                tags.slice(0, tagPreviewLimit).map((tag) => (
                                    <span 
                                        key={tag.id} 
                                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded border transition-colors cursor-default hover:!bg-[var(--hover-bg)] hover:!text-[var(--hover-text)] hover:!border-[var(--hover-border)]"
                                        style={{
                                            color: 'var(--fg-muted)',
                                            backgroundColor: 'var(--bg-base)',
                                            borderColor: 'var(--border)'
                                        }}
                                    >
                                        #{tag.name}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] text-[var(--fg-muted)] italic">Preview Tag Cloud</span>
                            )}
                        </div>
                    </div>
                )}
                {child.type === 'sidebar_widget' && (
                    <div className="mt-2">
                        {getConfigString("widgetType") === 'tag_cloud' ? (
                            <div className="flex flex-wrap gap-1"
                                style={{
                                    '--hover-bg': accentColor || '#3b82f6',
                                    '--hover-text': '#ffffff',
                                    '--hover-border': accentColor || '#3b82f6'
                                } as React.CSSProperties}
                            >
                                {tags && tags.length > 0 ? (
                                    tags.slice(0, tagPreviewLimit).map((tag) => (
                                        <span 
                                            key={tag.id} 
                                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded border transition-colors cursor-default hover:!bg-[var(--hover-bg)] hover:!text-[var(--hover-text)] hover:!border-[var(--hover-border)]"
                                            style={{
                                                color: 'var(--fg-muted)',
                                                backgroundColor: 'var(--bg-base)',
                                                borderColor: 'var(--border)'
                                            }}
                                        >
                                            #{tag.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[10px] text-[var(--fg-muted)] italic">Preview Tag Cloud</span>
                                )}
                            </div>
                        ) : (
                            <span className="text-[10px] font-medium text-[var(--fg-primary)] bg-[var(--bg-base)] px-2 py-0.5 rounded border border-[var(--border)] inline-block">
                                {getConfigString("widgetType") === 'popular_posts' ? 'Berita Populer' :
                                getConfigString("widgetType") === 'recent_posts' ? 'Berita Terbaru' :
                                getConfigString("widgetType") === 'category_list' ? 'Daftar Kategori' : 
                                getConfigString("widgetType", 'Widget')}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default React.memo(WidgetItem);
