import React from "react";
import { ArrowUp, ArrowDown, Edit, Trash2, Copy, ArrowLeft, ArrowRight, Settings } from "lucide-react";
import { Block, Tag } from "./types";
import SectionBlock from "./SectionBlock";
import { ConfigValue } from "@/lib/page-builder-config";

interface WidgetItemProps {
    builderLocation?: "home" | "archive" | "header" | "footer" | "post";
    child: Block;
    parentIndex: number;
    moveChildBlock: (parentIndex: number, childId: string, direction: "up" | "down") => void;
    setEditingChild: (child: { parentIndex: number, childId: string } | null) => void;
    setActiveEditTab: (tab: 'content' | 'visual') => void;
    deleteChildBlock: (parentIndex: number, childId: string) => void;
    tags: Tag[];
    accentColor: string;
    headingColor?: string;
    metaColor?: string;
    excerptColor?: string;
    headingFont?: string;
    bodyFont?: string;
    isInnerSection?: boolean;
    // Recursive Support
    parentId?: string;
    moveChildBlockById?: (parentId: string, childId: string, direction: "up" | "down") => void;
    moveChildBlockColumnById?: (parentId: string, childId: string, direction: "left" | "right") => void;
    deleteChildBlockById?: (parentId: string, childId: string) => void;
    duplicateChildBlockById?: (parentId: string, childId: string) => void;
    columnCount?: number;
    isSidebarColumn?: boolean;
    insideInnerSection?: boolean;
    activeTheme?: string;
    activeDeviceTab?: "desktop" | "tablet" | "mobile";
    
    // Props for SectionBlock recursion (from Homepage version)
    updateBlockConfig?: (index: number, key: string, value: ConfigValue) => void;
    deleteBlock?: (index: number) => void;
    setEditingSectionId?: (id: string | null) => void;
    setActiveSectionTab?: (tab: 'layout' | 'style') => void;
    addChildBlock?: (parentIndex: number, type: string, title: string, columnIndex: number) => void;
    activeAddMenu?: { blockId: string, colIndex: number } | null;
    setActiveAddMenu?: (menu: { blockId: string, colIndex: number } | null) => void;
    moveBlock?: (index: number, direction: "up" | "down") => void;
    updateBlockConfigById?: (blockId: string, key: string, value: ConfigValue) => void;
    addChildBlockById?: (parentId: string, type: string, title: string, columnIndex: number) => void;
}

function WidgetItem({
    builderLocation = "home",
    child,
    parentIndex,
    moveChildBlock,
    setEditingChild,
    setActiveEditTab,
    deleteChildBlock,
    tags,
    accentColor,
    headingColor: _headingColor,
    metaColor: _metaColor,
    excerptColor: _excerptColor,
    headingFont: _headingFont,
    bodyFont: _bodyFont,
    isInnerSection = false,
    parentId,
    moveChildBlockById,
    moveChildBlockColumnById,
    deleteChildBlockById,
    duplicateChildBlockById,
    columnCount = 1,
    isSidebarColumn = false,
    insideInnerSection = false,
    activeTheme = "classic",
    activeDeviceTab = "desktop",

    // Recursion props
    updateBlockConfig,
    deleteBlock,
    setEditingSectionId,
    setActiveSectionTab,
    addChildBlock,
    activeAddMenu,
    setActiveAddMenu,
    moveBlock,
    updateBlockConfigById,
    addChildBlockById
}: WidgetItemProps) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [isCompact, setIsCompact] = React.useState(false);

    const context = builderLocation === "post" ? "post" : "home";

    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const el = containerRef.current;
        if (!el) return;
        const threshold =
            context === "post"
                ? activeDeviceTab === "mobile"
                    ? 520
                    : activeDeviceTab === "tablet"
                        ? 380
                        : 340
                : 340;
        const update = () => {
            const width = el.getBoundingClientRect().width;
            setIsCompact(width > 0 && width < threshold);
        };
        update();
        if (typeof ResizeObserver !== "undefined") {
            const ro = new ResizeObserver(() => update());
            ro.observe(el);
            return () => ro.disconnect();
        }
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [activeDeviceTab, context]);

    const isPostWidgetType = typeof child.type === "string" && child.type.startsWith("post_");

    const _deviceLabel = activeDeviceTab === "desktop" ? "Desktop" : activeDeviceTab === "tablet" ? "Tablet" : "Mobile";
    void _deviceLabel;
    const isTabletSidebarCompact = activeDeviceTab === "tablet" && isSidebarColumn;
    const isInnerSectionSidebarCompact = isSidebarColumn && insideInnerSection;
    const isMobileInnerSectionCompact = activeDeviceTab === "mobile" && insideInnerSection;
    const isCompactLayout = isCompact || isTabletSidebarCompact || isInnerSectionSidebarCompact || isMobileInnerSectionCompact || (context === "post" && activeDeviceTab === "mobile");

    const canOpenWidgetSettings = builderLocation !== "header"
        || child.type === "ad_banner"
        || child.type === "header_logo"
        || child.type === "header_menu_primary"
        || child.type === "header_menu_secondary"
        || child.type === "header_search"
        || child.type === "header_theme_toggle"
        || child.type === "header_mobile_menu_toggle";

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

    const currentColumnIndex = typeof child.config?.columnIndex === "number" ? child.config.columnIndex : 0;

    const widgetLabelMap: Record<string, string> = {
        post_breadcrumb: "Breadcrumb",
        post_title: "Judul Artikel",
        post_subtitle: "Subjudul",
        post_meta: "Meta Artikel",
        post_stats: "Statistik Artikel",
        post_featured_image: "Featured Image",
        post_content: "Konten Artikel",
        post_tags: "Tag Artikel",
        post_share: "Tombol Share",
        post_author_box: "Author Box",
        post_navigation: "Navigasi Post",
        post_related_posts: "Related Posts",
        post_comments: "Komentar",
        sidebar_widget: "Sidebar Widget",
        tag_cloud: "Tag Cloud",
        ad_banner: "Iklan Banner",
        archive_header: "Header Arsip",
        archive_post_grid: "Grid Arsip",
        archive_post_list: "List Arsip",
        archive_pagination: "Pagination",
        archive_empty_state: "Empty State"
    };

    const widgetBadgeTextMap: Record<string, string> = {
        post_breadcrumb: "BREADCRUMB",
        post_title: "JUDUL",
        post_subtitle: "SUBJUDUL",
        post_meta: "META",
        post_stats: "STAT",
        post_featured_image: "IMAGE",
        post_content: "KONTEN",
        post_tags: "TAG",
        post_share: "SHARE",
        post_author_box: "AUTHOR",
        post_navigation: "NAVIGASI",
        post_related_posts: "RELATED",
        post_comments: "KOMENTAR",
        sidebar_widget: "WIDGET",
        tag_cloud: "TAG CLOUD",
        ad_banner: "BANNER",
        archive_header: "HEADER",
        archive_post_grid: "GRID",
        archive_post_list: "LIST",
        archive_pagination: "PAGIN",
        archive_empty_state: "EMPTY"
    };

    const widgetBadgeClassMap: Record<string, string> = {
        post_breadcrumb: "bg-slate-500",
        post_title: "bg-blue-500",
        post_subtitle: "bg-indigo-500",
        post_meta: "bg-cyan-500",
        post_stats: "bg-sky-500",
        post_featured_image: "bg-purple-500",
        post_content: "bg-green-500",
        post_tags: "bg-emerald-500",
        post_share: "bg-orange-500",
        post_author_box: "bg-teal-500",
        post_navigation: "bg-rose-500",
        post_related_posts: "bg-pink-500",
        post_comments: "bg-amber-500",
        sidebar_widget: "bg-red-500",
        tag_cloud: "bg-violet-500",
        ad_banner: "bg-yellow-500",
        archive_header: "bg-indigo-600",
        archive_post_grid: "bg-cyan-600",
        archive_post_list: "bg-emerald-600",
        archive_pagination: "bg-amber-600",
        archive_empty_state: "bg-rose-600"
    };

    if (isInnerSection || child.type === 'section') {
        return (
            <SectionBlock
                builderLocation={builderLocation as any}
                activeTheme={activeTheme}
                activeDeviceTab={activeDeviceTab}
                block={child}
                index={-1}
                deleteChildBlockById={deleteChildBlockById}
                updateBlockConfigById={updateBlockConfigById}
                addChildBlockById={addChildBlockById}
                moveChildBlockById={moveChildBlockById}
                duplicateChildBlockById={duplicateChildBlockById}
                moveChildBlockColumnById={moveChildBlockColumnById}
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
    const badgeClass = widgetBadgeClassMap[child.type] || "bg-gray-500";
    const displayTitle = widgetLabelMap[child.type] || child.title || child.type;
    const badgeText = widgetBadgeTextMap[child.type] || String(displayTitle).toUpperCase();
    const moveControlsBelow = isCompactLayout;
    const controlIconSize = moveControlsBelow ? 12 : 14;
    const controlPad = moveControlsBelow ? "p-1" : "p-1.5";
    const wrapperClass = "bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 shadow-sm hover:border-[var(--accent)] group/item relative transition-all";

    return (
        <div ref={containerRef} className={`${wrapperClass} ${isPostWidgetType ? "mb-0" : ""}`}>
            <div className={`gap-2 ${moveControlsBelow ? "flex flex-col items-stretch" : "flex items-start justify-between"}`}>
                <div className="flex min-w-0 items-center gap-2">
                    <div className={`shrink-0 p-1 rounded text-white text-[10px] font-bold ${badgeClass}`}>
                        {badgeText}
                    </div>
                    <span className="text-xs font-bold text-[var(--fg-primary)] truncate min-w-0 flex-1">{displayTitle}</span>
                </div>
                <div className={`shrink-0 bg-[var(--bg-base)] rounded-md border border-[var(--border)] overflow-hidden ${moveControlsBelow ? "flex flex-wrap items-center justify-end self-end" : "flex items-center"}`}>
                    {columnCount > 1 && (
                        <>
                            <button onClick={() => handleMoveColumn("left")} disabled={currentColumnIndex === 0} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all rounded-l-md border-r border-[var(--border)] ${currentColumnIndex === 0 ? "opacity-30 cursor-not-allowed" : ""}`} title="Geser Kiri"><ArrowLeft size={controlIconSize} /></button>
                            <button onClick={() => handleMoveColumn("right")} disabled={currentColumnIndex === columnCount - 1} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)] ${currentColumnIndex === columnCount - 1 ? "opacity-30 cursor-not-allowed" : ""}`} title="Geser Kanan"><ArrowRight size={controlIconSize} /></button>
                        </>
                    )}
                    <button onClick={() => handleMove("up")} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)] ${columnCount <= 1 ? "rounded-l-md" : ""}`} title="Geser Atas"><ArrowUp size={controlIconSize} /></button>
                    <button onClick={() => handleMove("down")} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)]`} title="Geser Bawah"><ArrowDown size={controlIconSize} /></button>
                    {canOpenWidgetSettings && (
                        <button onClick={() => { setEditingChild({ parentIndex, childId: child.id }); setActiveEditTab("content"); }} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)]`} title={builderLocation === "header" ? "Pengaturan" : "Edit Konten"}>
                            {builderLocation === "header" ? <Settings size={controlIconSize} /> : <Edit size={controlIconSize} />}
                        </button>
                    )}
                    <button onClick={handleDuplicate} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)]`} title="Duplikasi"><Copy size={controlIconSize} /></button>
                    <button onClick={handleDelete} className={`${controlPad} text-[var(--fg-muted)] hover:text-red-600 hover:bg-[var(--bg-elevated)] transition-all rounded-r-md`} title="Hapus"><Trash2 size={controlIconSize} /></button>
                </div>
            </div>
            <div className="mt-2 text-[10px] text-[var(--fg-muted)]">
                Tampilan builder selalu stabil (tanpa preview)
            </div>
        </div>
    );
}

export default React.memo(WidgetItem);
