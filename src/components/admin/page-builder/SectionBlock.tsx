import React from "react";
import { Trash2, Settings, Plus, Layout, ArrowUp, ArrowDown, X } from "lucide-react";
import { Block, Tag } from "./types";
import WidgetItem from "./WidgetItem";
import { getThemeBlocks } from "@/lib/block-registry";
import { getThemePostWidgetGroups } from "@/lib/post-builder-theme-registry";
import { ConfigValue } from "@/lib/page-builder-config";
import { resolveSectionChildrenWithSidebarSource, SidebarSourceBlocksMap } from "@/lib/sidebar-reference";

interface SectionBlockProps {
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
    context = "home",
    activeTheme = "classic",
    moveBlock,
    isNested = false,
    parentId,
    deleteBlockById,
    updateBlockConfigById,
    addChildBlockById,
    moveChildBlockById,
    moveChildBlockColumnById,
    deleteChildBlockById,
    duplicateChildBlockById,
    containerWidth,
    customContainerWidth,
    sidebarContext = false,
    sourceBlocksByLocation
}: SectionBlockProps) {
    const postWidgetGroups = getThemePostWidgetGroups(activeTheme || "classic");
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
    const getChildResponsiveValue = (child: Block | undefined | null, key: string): unknown => {
        const cfg: any = child?.config || {};
        const base = cfg?.[key];
        const tablet = cfg?.[`tablet${cap(key)}`];
        const mobile = cfg?.[`mobile${cap(key)}`];
        if (activeDeviceTab === "mobile") return mobile ?? tablet ?? base;
        if (activeDeviceTab === "tablet") return tablet ?? base;
        return base;
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
        } else if (!isNested && moveBlock) {
            moveBlock(index, direction);
        }
    };

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

    // --- STYLE LOGIC (Preview Mode) ---
    const config = block.config || {};
    const isTruthy = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";
    const isHiddenOnActiveDevice = (cfg: any) => {
        if (!cfg) return false;
        if (activeDeviceTab === "mobile") return isTruthy(cfg.hideOnMobile);
        if (activeDeviceTab === "tablet") return isTruthy(cfg.hideOnTablet);
        return isTruthy(cfg.hideOnDesktop);
    };
    if (isHiddenOnActiveDevice(config)) return null;
    const getResponsiveValue = (key: string) => {
        const base = config[key];
        const tablet = config[`tablet${cap(key)}`];
        const mobile = config[`mobile${cap(key)}`];
        if (activeDeviceTab === "mobile") return mobile ?? tablet ?? base;
        if (activeDeviceTab === "tablet") return tablet ?? base;
        return base;
    };
    const hasResponsiveValue = (key: string) => {
        const value = getResponsiveValue(key);
        if (value === undefined || value === null) return false;
        if (typeof value === "string") return value.trim() !== "";
        return true;
    };
    const getConfigString = (key: string, fallback = ""): string => {
        const value = getResponsiveValue(key);
        if (typeof value === "string") return value;
        if (typeof value === "number" && Number.isFinite(value)) return String(value);
        return fallback;
    };
    const getConfigNumber = (key: string, fallback = 0): number => {
        const value = getResponsiveValue(key);
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (typeof value === "string" && value.trim() !== "") {
            const parsed = Number(value);
            if (Number.isFinite(parsed)) return parsed;
        }
        return fallback;
    };
    const getConfigBool = (key: string, fallback = false): boolean => {
        const value = getResponsiveValue(key);
        if (typeof value === "boolean") return value;
        if (typeof value === "string") {
            const v = value.trim().toLowerCase();
            if (v === "true" || v === "1" || v === "yes") return true;
            if (v === "false" || v === "0" || v === "no") return false;
        }
        return fallback;
    };
    const layoutConfig = getConfigString("layout", "100");
    const columns = getColumnStructure(layoutConfig);
    const layoutRatios = layoutConfig.split("-").map((part) => Number(part)).filter((part) => Number.isFinite(part) && part > 0);
    const isTwoColumnLayout = layoutRatios.length === 2;
    const hasMainSidebarLayout = isTwoColumnLayout && layoutRatios[0] !== layoutRatios[1];
    const dividerLeftPercent = hasMainSidebarLayout
        ? (layoutRatios[0] / (layoutRatios[0] + layoutRatios[1])) * 100
        : null;
    const suppressSectionVisualPreview = context === "post";

    // Padding & Margin Logic (Desktop Preview)
    const paddingYMap: Record<string, string> = {
        'none': '0px',
        'sm': '16px',
        'md': '32px',
        'lg': '48px',
        'xl': '80px',
    };
    
    // Determine default padding Y if no specific top/bottom set
    const defaultPaddingY = (!hasResponsiveValue("paddingTop") && !hasResponsiveValue("paddingBottom"))
        ? (paddingYMap[getConfigString("paddingY", "none")] || '0px') 
        : '0px';

    // --- CONTAINER WIDTH LOGIC ---
    const sectionContainerWidth = getConfigString("containerWidth", containerWidth || "boxed");
    let maxWidth = "100%";
    if (sectionContainerWidth === 'boxed') {
        maxWidth = "1100px";
    } else if (sectionContainerWidth === 'narrow') {
        maxWidth = "1000px";
    } else if (sectionContainerWidth === 'custom') {
        const rawWidth = getConfigString("customContainerWidth", customContainerWidth || "1200").toString().trim();
        maxWidth = /^\d+$/.test(rawWidth) ? `${rawWidth}px` : rawWidth;
    }

    // Background fallback: treat pure white as transparent so dark builder theme shows through
    const normalize = (val?: string) => (val || '').trim().toLowerCase().replace(/\s+/g, '');
    const isPureWhite = (val?: string) => {
        const c = normalize(val);
        return c === '#fff' || c === '#ffffff' || c === 'white' || c === 'rgb(255,255,255)' || c === 'rgba(255,255,255,1)' || c === 'rgb(255,255,255,1)';
    };
    const backgroundColor = getConfigString("backgroundColor");
    const backgroundImage = getConfigString("backgroundImage");
    const backgroundSize = getConfigString("backgroundSize", "cover");
    const overlayColor = getConfigString("overlayColor");
    const useBox = getConfigBool("useBox", false);
    const borderStyle = getConfigString("borderStyle", "none");
    const borderColor = getConfigString("borderColor", "transparent");
    const borderTopWidth = getConfigNumber("borderTopWidth", 0);
    const borderBottomWidth = getConfigNumber("borderBottomWidth", 0);
    const borderLeftWidth = getConfigNumber("borderLeftWidth", 0);
    const borderRightWidth = getConfigNumber("borderRightWidth", 0);
    const boxPaddingY = getConfigString("boxPaddingY");
    const boxPaddingX = getConfigString("boxPaddingX");
    const borderRadiusValue = getConfigString("borderRadius", "none");
    const shadowValue = getConfigString("boxShadow", "none");
    const blockGap = getConfigNumber("blockGap", 6);
    const columnGap = getConfigNumber("columnGap", 6);
    const effectiveBg = isPureWhite(backgroundColor) ? 'transparent' : backgroundColor;
    const marginTop = getConfigNumber("marginTop", 0);
    const marginBottom = getConfigNumber("marginBottom", 0);
    const marginLeft = getConfigNumber("marginLeft", 0);
    const marginRight = getConfigNumber("marginRight", 0);
    const paddingTop = getConfigNumber("paddingTop", 0);
    const paddingBottom = getConfigNumber("paddingBottom", 0);
    const paddingLeft = getConfigNumber("paddingLeft", 0);
    const paddingRight = getConfigNumber("paddingRight", 0);

    const shadowMap: Record<string, string> = {
        none: "none",
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)"
    };
    const radiusMap: Record<string, string> = {
        none: "0",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px"
    };

    const sectionStyle: React.CSSProperties = {
        marginTop: hasResponsiveValue("marginTop") ? `${marginTop}px` : undefined,
        marginBottom: hasResponsiveValue("marginBottom") ? `${marginBottom}px` : undefined,
        marginLeft: hasResponsiveValue("marginLeft") ? `${marginLeft}px` : 'auto',
        marginRight: hasResponsiveValue("marginRight") ? `${marginRight}px` : 'auto',
        
        paddingTop: hasResponsiveValue("paddingTop") ? `${paddingTop}px` : (defaultPaddingY !== '0px' ? defaultPaddingY : '0px'),
        paddingBottom: hasResponsiveValue("paddingBottom") ? `${paddingBottom}px` : (defaultPaddingY !== '0px' ? defaultPaddingY : '0px'),
        paddingLeft: hasResponsiveValue("paddingLeft") ? `${paddingLeft}px` : '16px',
        paddingRight: hasResponsiveValue("paddingRight") ? `${paddingRight}px` : '16px',
        
        backgroundColor: effectiveBg || undefined,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: backgroundImage ? backgroundSize : undefined,
        backgroundPosition: backgroundImage ? 'center' : undefined,
        backgroundRepeat: backgroundImage ? 'no-repeat' : undefined,
        maxWidth: maxWidth,
    };
    const boxStyle: React.CSSProperties = useBox ? {
        borderStyle,
        borderColor,
        borderTopWidth: `${borderTopWidth}px`,
        borderBottomWidth: `${borderBottomWidth}px`,
        borderLeftWidth: `${borderLeftWidth}px`,
        borderRightWidth: `${borderRightWidth}px`,
        boxShadow: shadowMap[shadowValue] || "none",
        borderRadius: radiusMap[borderRadiusValue] || "0",
        paddingTop: boxPaddingY || undefined,
        paddingBottom: boxPaddingY || undefined,
        paddingLeft: boxPaddingX || undefined,
        paddingRight: boxPaddingX || undefined,
        backgroundColor: backgroundColor || "transparent"
    } : {};
    const normalizedSectionStyle: React.CSSProperties = suppressSectionVisualPreview
        ? { maxWidth }
        : sectionStyle;
    const previewBoxStyle: React.CSSProperties = suppressSectionVisualPreview ? {} : boxStyle;
    const previewUseBox = suppressSectionVisualPreview ? false : useBox;
    const isStackedLayout = activeDeviceTab === "mobile";
    const gridGapStyle: React.CSSProperties = {
        columnGap: suppressSectionVisualPreview ? undefined : `${columnGap * 0.25}rem`,
        rowGap: `${blockGap * 0.25}rem`
    };

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
                    <button onClick={() => { setEditingSectionId(block.id); setActiveSectionTab("layout"); }} className="p-1 text-[var(--fg-muted)] hover:text-[var(--accent)]"><Settings size={14} /></button>
                    <button onClick={handleDeleteBlock} className="p-1 text-[var(--fg-muted)] hover:text-red-500"><Trash2 size={14} /></button>
                </div>
            </div>

            {/* Columns Container with Preview Styles */}
            <div style={normalizedSectionStyle} className="rounded-b-xl overflow-hidden transition-all p-3 overflow-x-auto">
                <div
                    className={`relative flex min-h-[150px] transition-all duration-300 ${isStackedLayout ? "flex-col" : "flex-row"} ${!previewUseBox ? "bg-[var(--bg-surface)]" : ""}`}
                    style={{ ...previewBoxStyle, ...gridGapStyle }}
                >
                    {!isStackedLayout && hasMainSidebarLayout && dividerLeftPercent !== null && (
                        <div
                            className="absolute top-0 bottom-0 w-px bg-[var(--border)] pointer-events-none z-[1]"
                            style={{ left: `${dividerLeftPercent}%` }}
                        />
                    )}
                    {!suppressSectionVisualPreview && backgroundImage && overlayColor && (
                        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: overlayColor }} />
                    )}
                    {columns.map((widthClass, colIndex) => {
                        const resolvedSectionChildren = resolveSectionChildrenWithSidebarSource(block, sourceBlocksByLocation, context === "post" ? "post" : "home");
                        const visibleSectionChildren = resolvedSectionChildren.filter((c: Block) => !isHiddenOnActiveDevice(c?.config));
                        const colChildren = visibleSectionChildren.filter((c: Block) => (c.config?.columnIndex || 0) === colIndex);
                        const isEmpty = colChildren.length === 0;
                        const minRatio = isTwoColumnLayout ? Math.min(...layoutRatios) : 0;
                        const sidebarIndex = isTwoColumnLayout ? layoutRatios.indexOf(minRatio) : -1;
                        const isSidebarColumn = hasMainSidebarLayout && colIndex === sidebarIndex;
                        const effectiveSidebarContext = sidebarContext || isSidebarColumn;

                        return (
                        <div key={colIndex} className={`${isStackedLayout ? "w-full" : widthClass} p-3 ${previewUseBox ? "bg-transparent" : "bg-[var(--bg-surface)]"} relative group/col`}>
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
                                    const childrenDirection = getConfigString("childrenDirection", "vertical") === "horizontal" ? "horizontal" : "vertical";
                                    const childrenAlignRaw = getConfigString("childrenAlign", "left");
                                    const childrenAlign = childrenAlignRaw === "right" ? "right" : childrenAlignRaw === "center" ? "center" : "left";
                                    const childrenVerticalAlignRaw = getConfigString("childrenVerticalAlign", "top");
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
                                style={{ gap: `${blockGap * 0.25}rem` }}
                            >
                                {colChildren.map((child: Block) => {
                                    const childrenDirection = getConfigString("childrenDirection", "vertical") === "horizontal" ? "horizontal" : "vertical";
                                    const childrenSizing = getConfigString("childrenSizing", "auto") === "grow" ? "grow" : "auto";
                                    const itemClass = childrenDirection === "horizontal" && childrenSizing === "grow" ? "flex-1 basis-0 min-w-0" : "";
                                    const verticalAlignRaw = getChildResponsiveValue(child, "verticalAlign");
                                    const verticalAlign =
                                        verticalAlignRaw === "bottom"
                                            ? "bottom"
                                            : verticalAlignRaw === "center" || verticalAlignRaw === "middle"
                                                ? "center"
                                                : "top";
                                    const selfClass = verticalAlign === "center" ? "self-center" : verticalAlign === "bottom" ? "self-end" : "self-start";
                                    const wrapperClass = `${itemClass} ${childrenDirection === "horizontal" ? selfClass : ""}`.trim();
                                    if (child.type === 'section') {
                                        // Recursive Render for Nested Sections
                                        return (
                                            <div key={child.id} className={wrapperClass}>
                                                <SectionBlock 
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
                                                context={context}
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
                                                        const currentContext = context || 'home';
                                                        
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

                                                        return (
                                                            <div className="space-y-10">
                                                                {currentContext === 'home' ? (
                                                                    <>
                                                                        {/* Section 1: Widget Utama */}
                                                                        <div>
                                                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-200 pb-2">
                                                                                <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                                                                                Widget Utama (Main Content)
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                                                {groups.main.map((widget: WidgetDefinition) => {
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
                                                                                {groups.sidebar.map((widget: WidgetDefinition) => {
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
