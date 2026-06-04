"use client";

import React from "react";
import BlockList from "./BlockList";
import { Block, Tag } from "./types";
import { ConfigValue } from "@/lib/page-builder-config";
import { SidebarSourceBlocksMap } from "@/lib/sidebar-reference";
import ClassicHeader from "@/themes/classic/components/Header";
import ClassicFooter from "@/themes/classic/components/Footer";
import PranalaHeader from "@/themes/pranala/components/Header";
import PranalaFooter from "@/themes/pranala/components/Footer";

type PreviewMode = "stable" | "visual";

type ArchivePreviewMeta = {
    categorySlug: string;
    categoryName: string;
    categoryDescription?: string;
    total: number;
    page: number;
    totalPages: number;
    basePath: string;
};

type PublicMenuItem = {
    id: string;
    label: string;
    href: string;
    openInNewTab: boolean;
    children: PublicMenuItem[];
};

type MenuLocation = "PRIMARY" | "SECONDARY" | "FOOTER" | "MOBILE";
type PublicMenusByLocation = Partial<Record<MenuLocation, PublicMenuItem[]>>;

interface PreviewPanelProps {
    builderLocation?: "home" | "archive" | "header" | "footer" | "post";
    blocks: Block[];
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
    setShowSectionPicker: (show: boolean) => void;
    context?: "home" | "post";
    activeTheme?: string;
    moveBlock: (index: number, direction: "up" | "down") => void;
    duplicateBlock?: (index: number) => void;
    // Recursive Actions
    deleteBlockById?: (id: string) => void;
    updateBlockConfigById?: (id: string, key: string, value: ConfigValue) => void;
    addChildBlockById?: (parentId: string, type: string, title: string, columnIndex: number) => void;
    moveChildBlockById?: (parentId: string, childId: string, direction: "up" | "down") => void;
    moveChildBlockColumnById?: (parentId: string, childId: string, direction: "left" | "right") => void;
    deleteChildBlockById?: (parentId: string, childId: string) => void;
    duplicateChildBlockById?: (parentId: string, childId: string) => void;
    containerWidth?: string;
    customContainerWidth?: string;
    homeContainerWidth?: string; // Legacy/Specific
    homeCustomContainerWidth?: string;
    sourceBlocksByLocation?: SidebarSourceBlocksMap;
}

export default function PreviewPanel({
    builderLocation = "home",
    blocks,
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
    setShowSectionPicker,
    context: _context,
    activeTheme = "classic",
    moveBlock,
    duplicateBlock,
    deleteBlockById,
    updateBlockConfigById,
    addChildBlockById,
    moveChildBlockById,
    moveChildBlockColumnById,
    deleteChildBlockById,
    duplicateChildBlockById,
    containerWidth,
    customContainerWidth,
    homeContainerWidth,
    homeCustomContainerWidth,
    sourceBlocksByLocation
}: PreviewPanelProps) {
    const [previewMode, setPreviewMode] = React.useState<PreviewMode>("stable");
    const [previewLoadedKey, setPreviewLoadedKey] = React.useState<string | null>(null);
    const [previewPosts, setPreviewPosts] = React.useState<any[]>([]);
    const [previewCategories, setPreviewCategories] = React.useState<any[]>([]);
    const [previewPost, setPreviewPost] = React.useState<any | null>(null);
    const [previewArchiveMeta, setPreviewArchiveMeta] = React.useState<ArchivePreviewMeta | null>(null);
    const [previewSetting, setPreviewSetting] = React.useState<any | null>(null);
    const [previewMenusByLocation, setPreviewMenusByLocation] = React.useState<PublicMenusByLocation>({});
    const [previewLoading, setPreviewLoading] = React.useState(false);
    const [previewError, setPreviewError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadKey = `${builderLocation}:${activeTheme}`;
        if (previewMode !== "visual") {
            if (previewLoadedKey !== null) setPreviewLoadedKey(null);
            return;
        }
        if (previewLoadedKey === loadKey) return;

        let cancelled = false;

        const load = async () => {
            setPreviewLoading(true);
            setPreviewError(null);
            try {
                const settingRes = await fetch(`/api/public/settings?themeId=${encodeURIComponent(activeTheme || "classic")}`, { cache: "no-store" });
                const setting = settingRes.ok ? await settingRes.json() : null;

                const categoriesRes = await fetch("/api/categories", { cache: "no-store" });
                const categoriesJson = categoriesRes.ok ? await categoriesRes.json() : [];
                const categories = Array.isArray(categoriesJson) ? categoriesJson : [];

                const wantsMenus = builderLocation === "header" || builderLocation === "footer";
                const buildMenusByLocation = async (): Promise<PublicMenusByLocation> => {
                    const assignmentsRes = await fetch("/api/menu-locations", { cache: "no-store" });
                    if (!assignmentsRes.ok) return {};
                    const assignmentsJson = await assignmentsRes.json();
                    const assignments = Array.isArray(assignmentsJson) ? assignmentsJson : [];

                    const menuByLoc = new Map<MenuLocation, string>();
                    for (const row of assignments) {
                        const location = String(row?.location || "") as MenuLocation;
                        const menuId = typeof row?.menuId === "string" ? row.menuId : "";
                        if ((location === "PRIMARY" || location === "SECONDARY" || location === "FOOTER" || location === "MOBILE") && menuId) {
                            menuByLoc.set(location, menuId);
                        }
                    }
                    if (menuByLoc.size === 0) return {};

                    const resolveHref = (item: any): string => {
                        const type = String(item?.type || "");
                        if (type === "CUSTOM") return typeof item?.customUrl === "string" ? item.customUrl : "#";
                        if (type === "CATEGORY") return item?.category?.slug ? `/category/${item.category.slug}` : "#";
                        if (type === "TAG") return item?.tag?.slug ? `/tag/${item.tag.slug}` : "#";
                        if (type === "PAGE") return item?.page?.slug ? `/${item.page.slug}` : "#";
                        return "#";
                    };

                    const buildTree = (rows: Array<{ id: string; parentId: string | null; label: string; href: string; openInNewTab: boolean; order: number }>) => {
                        const map = new Map<string | null, typeof rows>();
                        for (const row of rows) {
                            const key = row.parentId ?? null;
                            const arr = map.get(key) || [];
                            arr.push(row);
                            map.set(key, arr);
                        }
                        for (const [key, arr] of map) {
                            arr.sort((a, b) => (a.order - b.order) || a.id.localeCompare(b.id));
                            map.set(key, arr);
                        }
                        const walk = (parentId: string | null, depth: number): PublicMenuItem[] => {
                            if (depth >= 3) return [];
                            const children = map.get(parentId) || [];
                            return children.map((child) => ({
                                id: child.id,
                                label: child.label,
                                href: child.href,
                                openInNewTab: child.openInNewTab,
                                children: walk(child.id, depth + 1),
                            }));
                        };
                        return walk(null, 0);
                    };

                    const result: PublicMenusByLocation = {};
                    await Promise.all(
                        Array.from(menuByLoc.entries()).map(async ([location, menuId]) => {
                            const menuRes = await fetch(`/api/menus/${encodeURIComponent(menuId)}`, { cache: "no-store" });
                            if (!menuRes.ok) return;
                            const menuJson = await menuRes.json();
                            const items = Array.isArray(menuJson?.items) ? menuJson.items : [];
                            const rows = items
                                .filter((it: any) => String(it?.type || "") !== "PAGE" || !!it?.page?.published)
                                .map((it: any) => ({
                                    id: String(it.id),
                                    parentId: it.parentId ? String(it.parentId) : null,
                                    label: typeof it.label === "string" ? it.label : "",
                                    href: resolveHref(it),
                                    openInNewTab: !!it.openInNewTab,
                                    order: typeof it.order === "number" ? it.order : Number(it.order || 0),
                                }))
                                .filter((it: any) => it.id && it.label);
                            result[location] = buildTree(rows);
                        }),
                    );
                    return result;
                };

                const menusByLocation = wantsMenus ? await buildMenusByLocation() : {};

                const findFirstCategory = (items: any[]): { slug: string; name: string; description?: string } | null => {
                    for (const item of items) {
                        const slug = typeof item?.slug === "string" ? item.slug : "";
                        const name = typeof item?.name === "string" ? item.name : "";
                        if (slug && name) return { slug, name, description: typeof item?.description === "string" ? item.description : undefined };
                        const children = Array.isArray(item?.children) ? item.children : [];
                        const found = findFirstCategory(children);
                        if (found) return found;
                    }
                    return null;
                };

                const categoryForArchive = findFirstCategory(categories);
                const wantsPosts = builderLocation === "home" || builderLocation === "archive" || builderLocation === "post";
                const postsUrl = !wantsPosts
                    ? ""
                    : builderLocation === "archive" && categoryForArchive
                        ? `/api/public/posts?limit=12&page=1&sort=latest&includeTags=1&category=${encodeURIComponent(categoryForArchive.slug)}`
                        : "/api/public/posts?limit=12&page=1&sort=latest&includeTags=1";

                const postsJson = wantsPosts
                    ? await (async () => {
                        const postsRes = await fetch(postsUrl, { cache: "no-store" });
                        if (!postsRes.ok) throw new Error("Gagal memuat data berita untuk preview");
                        return postsRes.json();
                    })()
                    : { data: [], meta: null };
                const posts = Array.isArray(postsJson?.data) ? postsJson.data : [];

                const meta = postsJson?.meta;
                const archiveMeta: ArchivePreviewMeta | null =
                    builderLocation === "archive" && categoryForArchive && meta && typeof meta === "object"
                        ? {
                            categorySlug: categoryForArchive.slug,
                            categoryName: categoryForArchive.name,
                            categoryDescription: categoryForArchive.description,
                            total: Number(meta.total) || posts.length,
                            page: Number(meta.page) || 1,
                            totalPages: Number(meta.totalPages) || 1,
                            basePath: `/kategori/${categoryForArchive.slug}`,
                        }
                        : null;

                let postDetail: any | null = null;
                const firstSlug = typeof posts?.[0]?.slug === "string" ? posts[0].slug : "";
                if (builderLocation === "post" && firstSlug) {
                    const detailRes = await fetch(`/api/public/posts?slug=${encodeURIComponent(firstSlug)}`, { cache: "no-store" });
                    if (detailRes.ok) postDetail = await detailRes.json();
                }

                if (cancelled) return;
                setPreviewPosts(posts);
                setPreviewCategories(categories);
                setPreviewPost(postDetail);
                setPreviewArchiveMeta(archiveMeta);
                setPreviewSetting(setting);
                setPreviewMenusByLocation(menusByLocation);
            } catch (err) {
                if (cancelled) return;
                setPreviewError(err instanceof Error ? err.message : "Gagal memuat preview");
            } finally {
                if (cancelled) return;
                setPreviewLoading(false);
                setPreviewLoadedKey(loadKey);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [activeTheme, builderLocation, previewLoadedKey, previewMode]);

    const deviceCanvasClass =
        activeDeviceTab === "mobile"
            ? "max-w-[430px]"
            : activeDeviceTab === "tablet"
                ? "max-w-[820px]"
                : "max-w-full";

    const canvasClass = `w-full min-h-[500px] ${deviceCanvasClass}`;

    return (
        <div className="space-y-6">
            <div className="flex justify-center">
                <div className={`${deviceCanvasClass} w-full`}>
                    <div className="flex justify-end">
                        <div className="inline-flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1 shadow-sm">
                            {([
                                { id: "stable" as const, label: "Stabil" },
                                { id: "visual" as const, label: "Preview" },
                            ]).map((mode) => {
                                const isActive = previewMode === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => setPreviewMode(mode.id)}
                                        className={`px-3 py-2 rounded-md text-[11px] font-bold uppercase transition-colors ${
                                            isActive
                                                ? "bg-[var(--bg-base)] text-[var(--accent)] border border-[var(--border)]"
                                                : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                                        }`}
                                    >
                                        {mode.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    {previewMode === "visual" && (
                        <div className="mt-2 flex justify-end">
                            {previewLoading ? (
                                <div className="text-[11px] text-[var(--fg-muted)]">Memuat data preview...</div>
                            ) : previewError ? (
                                <div className="text-[11px] text-red-600">{previewError}</div>
                            ) : (
                                <div className="text-[11px] text-[var(--fg-muted)]">
                                    Preview memakai data publik.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {blocks.length === 0 ? (
                <div className="flex justify-center">
                    <div className={`${canvasClass} transition-all duration-300 border-2 border-dashed border-[var(--border)] rounded-xl bg-[var(--bg-surface)] flex flex-col items-center justify-center py-20`}>
                        <p className="text-[var(--fg-muted)] font-medium">Halaman kosong</p>
                        <button onClick={() => setShowSectionPicker(true)} className="mt-4 text-[var(--accent)] font-bold hover:underline">Mulai Tambah Section</button>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center">
                    <div className={`${canvasClass} transition-all duration-300 bg-[var(--bg-surface)] rounded-xl overflow-hidden shadow-sm border border-[var(--border)]`}>
                        {previewMode === "visual" && builderLocation === "header" ? (
                            <div className="public-theme">
                                {activeTheme === "pranala" ? (
                                    <PranalaHeader
                                        siteName={previewSetting?.siteName || "Portal Berita"}
                                        logoUrl={previewSetting?.logoUrl}
                                        categories={previewCategories || []}
                                        primaryMenu={previewMenusByLocation.PRIMARY || []}
                                        secondaryMenu={previewMenusByLocation.SECONDARY || []}
                                        mobileMenu={previewMenusByLocation.MOBILE || []}
                                        headerConfig={blocks}
                                    />
                                ) : (
                                    <ClassicHeader
                                        siteName={previewSetting?.siteName || "Portal Berita"}
                                        logoUrl={previewSetting?.logoUrl}
                                        categories={previewCategories || []}
                                    />
                                )}
                            </div>
                        ) : previewMode === "visual" && builderLocation === "footer" ? (
                            <div className="public-theme">
                                {activeTheme === "pranala" ? (
                                    <PranalaFooter
                                        siteName={previewSetting?.siteName || "Portal Berita"}
                                        logoUrl={previewSetting?.logoUrl}
                                        categories={previewCategories || []}
                                        footerConfig={blocks}
                                        menusByLocation={previewMenusByLocation}
                                    />
                                ) : (
                                    <ClassicFooter
                                        siteName={previewSetting?.siteName || "Portal Berita"}
                                        logoUrl={previewSetting?.logoUrl}
                                        categories={previewCategories || []}
                                        footerConfig={blocks}
                                        menusByLocation={previewMenusByLocation}
                                    />
                                )}
                            </div>
                        ) : (
                            <BlockList
                                builderLocation={builderLocation}
                                previewMode={previewMode}
                                previewPosts={previewPosts}
                                previewCategories={previewCategories}
                                previewPost={previewPost}
                                previewArchiveMeta={previewArchiveMeta}
                                blocks={blocks}
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
                                activeTheme={activeTheme}
                                moveBlock={moveBlock}
                                duplicateBlock={duplicateBlock}
                                deleteBlockById={deleteBlockById}
                                updateBlockConfigById={updateBlockConfigById}
                                addChildBlockById={addChildBlockById}
                                moveChildBlockById={moveChildBlockById}
                                moveChildBlockColumnById={moveChildBlockColumnById}
                                deleteChildBlockById={deleteChildBlockById}
                                duplicateChildBlockById={duplicateChildBlockById}
                                containerWidth={containerWidth}
                                customContainerWidth={customContainerWidth}
                                homeContainerWidth={homeContainerWidth}
                                homeCustomContainerWidth={homeCustomContainerWidth}
                                sourceBlocksByLocation={sourceBlocksByLocation}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
