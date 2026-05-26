import React from "react";
import { ArrowUp, ArrowDown, Edit, Trash2, Copy, ArrowLeft, ArrowRight } from "lucide-react";
import { Block, Tag } from "./types";
import { getBlockDefinition } from "@/lib/block-registry";
import PostWidgetRenderer from "@/themes/pranala/blockpost/PostWidgetRenderer";

// --- THEME POST COMPONENTS (Still Static for now, as they are part of Post Template) ---
// Ideally, these should also be dynamic if we want full Post Builder modularity
// import PostTitle from "@themes/modern/components/post/PostTitle";
// import PostSubtitle from "@themes/modern/components/post/PostSubtitle";
// import PostBreadcrumb from "@themes/modern/components/post/PostBreadcrumb";
// import PostMeta from "@themes/modern/components/post/PostMeta";
// import PostFeaturedImage from "@themes/modern/components/post/PostFeaturedImage";
// import PostContent from "@themes/modern/components/post/PostContent";
// import PostTags from "@themes/modern/components/post/PostTags";
// import PostShare from "@themes/modern/components/post/PostShare";
// import BlockStyleWrapper from "@themes/modern/components/BlockStyleWrapper";
// import PostAuthorBox from "@themes/modern/components/post/PostAuthorBox";
// import PostNavigation from "@themes/modern/components/post/PostNavigation";
// import RelatedPostsBottom from "@themes/modern/components/post/RelatedPostsBottom";
// import PostComments from "@themes/modern/components/post/PostComments";

interface WidgetItemProps {
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
    context?: "home" | "post";
}

function WidgetItem({
    child,
    parentIndex,
    moveChildBlock,
    setEditingChild,
    setActiveEditTab,
    deleteChildBlock,
    tags: _tags,
    accentColor,
    headingColor,
    metaColor,
    excerptColor,
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
    context = "home"
}: WidgetItemProps) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [isCompact, setIsCompact] = React.useState(false);
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

    type MockPost = {
        id: string;
        title: string;
        slug: string;
        excerpt: string;
        image: string;
        publishedAt: string;
        category: { name: string; slug: string };
        author: { name: string };
    };

    // Helper to handle actions (prefer ID-based if available)
    const handleMove = (direction: "up" | "down") => {
        if (moveChildBlockById && parentId) {
            moveChildBlockById(parentId, child.id, direction);
        } else {
            moveChildBlock(parentIndex, child.id, direction);
        }
    };

    const handleDelete = () => {
        if (deleteChildBlockById && parentId) {
            deleteChildBlockById(parentId, child.id);
        } else {
            deleteChildBlock(parentIndex, child.id);
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

    const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    const getResponsiveConfig = (key: string): unknown => {
        const base = child.config?.[key];
        const tablet = child.config?.[`tablet${cap(key)}`];
        const mobile = child.config?.[`mobile${cap(key)}`];
        if (activeDeviceTab === "mobile") return mobile ?? tablet ?? base;
        if (activeDeviceTab === "tablet") return tablet ?? base;
        return base;
    };
    const getTextAlign = () => {
        const value = getResponsiveConfig("textAlign");
        if (value === "left" || value === "center" || value === "right" || value === "justify") return value;
        return undefined;
    };
    const widgetContainerStyle: React.CSSProperties = {
        textAlign: getTextAlign(),
    };
    const isPostWidgetType = typeof child.type === "string" && child.type.startsWith("post_");
    const isCompactLayout = isCompact || (context === "post" && activeDeviceTab === "mobile");
    const safeAccent = typeof accentColor === "string" && accentColor.trim() !== "" ? accentColor : "var(--accent)";
    const safeHeading = typeof headingColor === "string" && headingColor.trim() !== "" ? headingColor : "#111827";
    const safeMeta = typeof metaColor === "string" && metaColor.trim() !== "" ? metaColor : "#6b7280";
    const safeExcerpt = typeof excerptColor === "string" && excerptColor.trim() !== "" ? excerptColor : "#4b5563";
    const currentColumnIndex = typeof child.config?.columnIndex === "number" ? child.config.columnIndex : 0;

    const mockCategories = [
        { id: "c1", name: "Nasional", slug: "nasional" },
        { id: "c2", name: "Ekonomi", slug: "ekonomi" },
        { id: "c3", name: "Olahraga", slug: "olahraga" }
    ];
    const mockPosts: MockPost[] = Array.from({ length: 8 }).map((_, i) => ({
        id: `${i + 1}`,
        title: `Contoh Berita ${i + 1} untuk Preview`,
        slug: `contoh-berita-${i + 1}`,
        excerpt: "Ini adalah contoh ringkasan berita untuk meniru tampilan frontend publik dengan akurat.",
        image: "/placeholder.jpg",
        publishedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 3).toISOString(),
        category: mockCategories[i % mockCategories.length],
        author: { name: i % 2 === 0 ? "Redaksi Pranala" : "Reporter Pranala" }
    }));
    const mockTagCloud = [
        { id: "t1", name: "politik", slug: "politik", _count: { posts: 18 } },
        { id: "t2", name: "ekonomi", slug: "ekonomi", _count: { posts: 12 } },
        { id: "t3", name: "internasional", slug: "internasional", _count: { posts: 9 } },
        { id: "t4", name: "teknologi", slug: "teknologi", _count: { posts: 7 } }
    ];
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
        ad_banner: "Iklan Banner"
    };
    const isTabletSidebarCompact = context === "post" && activeDeviceTab === "tablet" && isSidebarColumn;
    const isInnerSectionSidebarCompact = context === "post" && isSidebarColumn && insideInnerSection;
    const isMobileInnerSectionCompact = context === "post" && activeDeviceTab === "mobile" && insideInnerSection;
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
        ad_banner: "BANNER"
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
        ad_banner: "bg-yellow-500"
    };

    if (isInnerSection) {
        const controlIconSize = isCompactLayout ? 12 : 14;
        const controlPad = isCompactLayout ? "p-1" : "p-1.5";
        return (
            <div ref={containerRef} className="bg-[var(--bg-surface)] border-2 border-dashed border-[color:var(--accent)/0.3] rounded-lg p-3 shadow-sm hover:border-[var(--accent)] group/item relative">
                <div className={`${isCompactLayout ? "flex flex-col gap-2" : "flex items-center justify-between"} mb-2`}>
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1 rounded text-white text-[10px] font-bold bg-[var(--accent)]">
                            SECTION
                        </div>
                        <span className="text-xs font-bold text-[var(--fg-primary)] truncate min-w-0">Inner Section</span>
                    </div>
                    <div className={`${isCompactLayout ? "flex flex-wrap items-center justify-end" : "flex items-center"} bg-[var(--bg-elevated)] rounded-md border border-[var(--border)] shadow-sm overflow-hidden`}>
                        <button onClick={() => handleMove("up")} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] transition-all rounded-l-md border-r border-[var(--border)]`} title="Geser Atas"><ArrowUp size={controlIconSize} /></button>
                        <button onClick={() => handleMove("down")} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] transition-all border-r border-[var(--border)]`} title="Geser Bawah"><ArrowDown size={controlIconSize} /></button>
                        
                        {/* We use setEditingChild here, but the Modal needs to support "section" type config for children */}
                        {/* Currently EditChildModal might only support widget config. We might need to enhance it or redirect to SectionEditModal logic? */}
                        {/* Since "Inner Section" is technically a "Child Block" with type "section", we should treat it as a child. */}
                        {/* However, the config needed is layout/style (padding/margin). */}
                        {/* For now, let's allow basic child editing which might just show title/generic config if not handled specifically. */}
                        
                        {/* BETTER: If we want full section editing (columns, gap, etc), we should probably use EditSectionModal? */}
                        {/* But EditSectionModal expects a root section. */}
                        {/* Let's stick to setEditingChild and update EditChildModal to handle 'section' type if needed, or just let it show JSON/generic fields. */}
                        <button onClick={() => { setEditingChild({ parentIndex, childId: child.id }); setActiveEditTab("content"); }} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] transition-all border-r border-[var(--border)]`} title="Edit Layout"><Edit size={controlIconSize} /></button>
                        <button onClick={handleDelete} className={`${controlPad} text-[var(--fg-muted)] hover:text-red-600 hover:bg-red-50 transition-all rounded-r-md`} title="Hapus"><Trash2 size={controlIconSize} /></button>
                    </div>
                </div>
                
                {/* Preview of Inner Section Content (Simplified) */}
                <div className="text-center py-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-xs text-[var(--fg-muted)]">
                    <p>Inner Section Container</p>
                    <p className="text-[10px] opacity-70">(Nested widgets editing not supported in this view level)</p>
                </div>
            </div>
        );
    }

    // --- RENDER CONTENT (WYSIWYG) ---
    const renderContent = () => {
        if (context === "post") {
            const widgetType = typeof child.config?.widgetType === "string" ? child.config.widgetType : "";
            const limitValue = getResponsiveConfig("limit");
            const limit = typeof limitValue === "number" ? limitValue : (typeof limitValue === "string" ? Number(limitValue) : undefined);
            return (
                <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-lg px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold uppercase tracking-wide text-[var(--fg-secondary)]">
                            {widgetLabelMap[child.type] || child.type.replaceAll("_", " ")}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--fg-muted)]">
                            {child.type}
                        </span>
                    </div>
                    <div className="mt-2 text-[11px] text-[var(--fg-muted)] flex flex-wrap gap-x-3 gap-y-1">
                        {widgetType && <span>mode: {widgetType}</span>}
                        {Number.isFinite(limit) && <span>limit: {limit}</span>}
                        {typeof child.config?.categorySlug === "string" && child.config.categorySlug !== "" && <span>kategori: {child.config.categorySlug}</span>}
                        {typeof child.config?.filterType === "string" && child.config.filterType !== "" && <span>filter: {child.config.filterType}</span>}
                    </div>
                </div>
            );
        }

        // --- 1. DYNAMIC THEME BLOCKS (Homepage Widgets) ---
        // Check if this block type exists in the registry for the current theme (defaulting to classic)
        // Ideally we should pass activeTheme prop to WidgetItem
        const blockDef = getBlockDefinition(child.type, activeTheme || "classic");
        
        if (blockDef) {
            const Component = blockDef.component as React.ComponentType<{
                block: Block;
                posts?: unknown[];
                categories?: unknown[];
                customTitle?: string;
                accentColor?: string;
            }>;
            
            const mockData: {
                posts?: unknown[];
                categories?: unknown[];
                customTitle?: string;
                accentColor?: string;
            } = {
                categories: mockCategories,
                customTitle: typeof child.title === "string" ? child.title : (typeof child.config?.title === "string" ? child.config.title : undefined),
                accentColor: safeAccent
            };
            
            const limitValue = getResponsiveConfig("limit");
            const limit = typeof limitValue === "number" ? Math.max(1, Math.min(limitValue, 8)) : 6;

            if (child.type === "tag_cloud") {
                mockData.posts = mockTagCloud;
            } else if (child.type === "sidebar_widget") {
                const widgetType = typeof child.config?.widgetType === "string" ? child.config.widgetType : "popular_posts";
                if (widgetType === "category_list") {
                    mockData.posts = mockCategories.map((category, index) => ({ ...category, postCount: 4 + index * 3 }));
                } else {
                    mockData.posts = mockPosts.slice(0, limit);
                }
            } else if (['list', 'grid', 'hero'].includes(blockDef.category)) {
                mockData.posts = mockPosts.slice(0, limit);
            }
            
            return (
                <div className="relative pointer-events-none">
                    <Component 
                        block={child} 
                        posts={mockData.posts} 
                        categories={mockData.categories}
                        customTitle={mockData.customTitle}
                        accentColor={mockData.accentColor}
                    />
                </div>
            );
        }
        
        // --- 2. POST COMPONENTS (Shared with Public Renderer) ---
        const limitValue = getResponsiveConfig("limit");
        const relatedCount = typeof limitValue === "number" ? Math.max(1, Math.min(limitValue, 6)) : 3;

        if (isPostWidgetType) {
            const mockPostForPreview = {
                id: "preview-post",
                title: "Contoh Judul Artikel untuk Preview Post Builder",
                subtitle: "Ini adalah subjudul artikel untuk simulasi preview.",
                slug: "contoh-artikel-preview",
                content: "<p>Paragraf contoh pertama untuk meniru konten artikel publik.</p><p>Paragraf kedua untuk menjaga ritme visual tetap realistis.</p>",
                publishedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                views: 128,
                viewsBase: 500,
                commentCount: 7,
                author: {
                    name: "Redaksi Pranala",
                    avatar: "/placeholder.jpg",
                    bio: "Tim redaksi yang mengkurasi dan menulis berita harian untuk pembaca."
                },
                approvedBy: {
                    name: "Editor Pranala",
                    avatar: "/placeholder.jpg",
                    bio: "Editor yang melakukan kurasi akhir sebelum berita dipublikasikan."
                },
                category: { name: "Nasional", slug: "nasional" },
                tags: mockTagCloud.map((item) => ({ id: item.id, name: item.name, slug: item.slug })),
                prev_post: { title: "Artikel Sebelumnya", slug: "artikel-sebelumnya", category: { slug: "nasional" }, image: "/placeholder.jpg" },
                next_post: { title: "Artikel Selanjutnya", slug: "artikel-selanjutnya", category: { slug: "nasional" }, image: "/placeholder.jpg" },
                image: "/placeholder.jpg"
            };
            const previewRelatedItems = mockPosts.slice(0, relatedCount).map((item) => ({ ...item, category: { slug: item.category.slug } }));
            return (
                <PostWidgetRenderer
                    widget={child}
                    post={mockPostForPreview}
                    headingColor={safeHeading}
                    metaColor={safeMeta}
                    contentColor={safeExcerpt}
                    accentColor={safeAccent}
                    hoverColor={safeAccent}
                    blockData={{ [child.id]: previewRelatedItems }}
                    preview
                    previewDeviceTab={activeDeviceTab}
                />
            );
        }

        // --- FALLBACK (Mini Config) ---
        return (
            <div className="text-[10px] text-gray-500 space-y-1">
                 <span className="text-gray-400 italic">Preview belum tersedia untuk widget ini ({child.type})</span>
            </div>
        );
    };

    if (context === "post") {
        const widgetType = typeof child.config?.widgetType === "string" ? child.config.widgetType : "";
        const limitValue = getResponsiveConfig("limit");
        const limit = typeof limitValue === "number" ? limitValue : (typeof limitValue === "string" ? Number(limitValue) : undefined);
        const badgeClass = widgetBadgeClassMap[child.type] || "bg-gray-500";
        const displayTitle = widgetLabelMap[child.type] || child.title || child.type;
        const badgeText = widgetBadgeTextMap[child.type] || displayTitle.toUpperCase();
        const showMetaSummary = activeDeviceTab !== "mobile";
        const moveControlsBelow = isTabletSidebarCompact || isInnerSectionSidebarCompact || isMobileInnerSectionCompact;
        const controlIconSize = moveControlsBelow ? 12 : 14;
        const controlPad = moveControlsBelow ? "p-1" : "p-1.5";
        const wrapperClass = "bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3 shadow-sm hover:border-[var(--accent)] group/item relative transition-all";

        return (
            <div ref={containerRef} className={wrapperClass}>
                <div className={`mb-2 gap-2 ${moveControlsBelow ? "flex flex-col items-stretch" : "flex items-start justify-between"}`}>
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
                        <button onClick={() => { setEditingChild({ parentIndex, childId: child.id }); setActiveEditTab("content"); }} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)]`} title="Edit Konten"><Edit size={controlIconSize} /></button>
                        <button onClick={handleDuplicate} className={`${controlPad} text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all border-r border-[var(--border)]`} title="Duplikasi"><Copy size={controlIconSize} /></button>
                        <button onClick={handleDelete} className={`${controlPad} text-[var(--fg-muted)] hover:text-red-600 hover:bg-[var(--bg-elevated)] transition-all rounded-r-md`} title="Hapus"><Trash2 size={controlIconSize} /></button>
                    </div>
                </div>
                {showMetaSummary && (
                    <div className="text-[10px] text-[var(--fg-muted)] space-y-1">
                        <div className="flex justify-between gap-2">
                            {widgetType ? <span>mode: {widgetType}</span> : <span>{child.type}</span>}
                            {Number.isFinite(limit) && <span>limit: {limit}</span>}
                        </div>
                        {typeof child.config?.categorySlug === "string" && child.config.categorySlug !== "" && <span>kategori: {child.config.categorySlug}</span>}
                        {typeof child.config?.filterType === "string" && child.config.filterType !== "" && <span>filter: {child.config.filterType}</span>}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`relative group/item ${isPostWidgetType ? "mb-0" : "mb-4"}`}>
             {/* HOVER CONTROLS (Overlay) */}
             <div className="absolute -top-3 left-0 right-0 z-20 flex justify-between items-center opacity-0 group-hover/item:opacity-100 transition-opacity px-2 pointer-events-none">
                 <div className="flex items-center gap-1 pointer-events-auto">
                   <span className="text-[10px] font-bold text-white bg-[var(--accent)] px-2 py-0.5 rounded shadow-sm uppercase">{child.type.replace('_', ' ')}</span>
                 </div>
                <div className="flex items-center bg-[var(--bg-elevated)] rounded-md border border-[var(--border)] shadow-sm pointer-events-auto">
                  {columnCount > 1 && (
                    <>
                      <button onClick={() => handleMoveColumn("left")} disabled={currentColumnIndex === 0} className={`p-1 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] transition-all border-r border-[var(--border)] ${currentColumnIndex === 0 ? "opacity-30 cursor-not-allowed" : ""}`} title="Geser Kiri"><ArrowLeft size={12} /></button>
                      <button onClick={() => handleMoveColumn("right")} disabled={currentColumnIndex === columnCount - 1} className={`p-1 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] transition-all border-r border-[var(--border)] ${currentColumnIndex === columnCount - 1 ? "opacity-30 cursor-not-allowed" : ""}`} title="Geser Kanan"><ArrowRight size={12} /></button>
                    </>
                  )}
                   <button onClick={() => handleMove("up")} className="p-1 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] transition-all rounded-l-md border-r border-[var(--border)]" title="Geser Atas"><ArrowUp size={12} /></button>
                   <button onClick={() => handleMove("down")} className="p-1 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] transition-all border-r border-[var(--border)]" title="Geser Bawah"><ArrowDown size={12} /></button>
                   <button onClick={() => { setEditingChild({ parentIndex, childId: child.id }); setActiveEditTab("content"); }} className="p-1 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] transition-all border-r border-[var(--border)]" title="Edit Konten"><Edit size={12} /></button>
                  <button onClick={handleDuplicate} className="p-1 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] transition-all border-r border-[var(--border)]" title="Duplikasi"><Copy size={12} /></button>
                   <button onClick={handleDelete} className="p-1 text-[var(--fg-muted)] hover:text-red-600 hover:bg-red-50 transition-all rounded-r-md" title="Hapus"><Trash2 size={12} /></button>
                </div>
             </div>

            {/* LIVE PREVIEW CONTAINER */}
            <div className={`border border-transparent rounded transition-all ${isPostWidgetType ? "group-hover/item:border-[color:var(--accent)/0.25]" : "group-hover/item:border-[color:var(--accent)/0.4] group-hover/item:bg-[color:var(--accent)/0.06]"}`}>
                <div style={widgetContainerStyle}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default React.memo(WidgetItem);
