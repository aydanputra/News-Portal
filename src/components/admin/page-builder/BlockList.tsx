import React, { useState, useEffect } from "react";
import { Block, Tag } from "./types";
import LegacyBlock from "./LegacyBlock";
import SectionBlock from "./SectionBlock";
import { ConfigValue } from "@/lib/page-builder-config";
import { SidebarSourceBlocksMap } from "@/lib/sidebar-reference";

interface BlockListProps {
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
    context?: "home" | "post";
    activeTheme?: string;
    moveBlock: (index: number, direction: "up" | "down") => void;
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
    sourceBlocksByLocation?: SidebarSourceBlocksMap;
}

function BlockList({
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
    activeDeviceTab,
    context = "home",
    activeTheme,
    moveBlock,
    deleteBlockById,
    updateBlockConfigById,
    addChildBlockById,
    moveChildBlockById,
    moveChildBlockColumnById,
    deleteChildBlockById,
    duplicateChildBlockById,
    containerWidth,
    customContainerWidth,
    sourceBlocksByLocation
}: BlockListProps) {
    const [activeAddMenu, setActiveAddMenu] = useState<{ blockId: string, colIndex: number } | null>(null);

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (activeAddMenu && !(e.target as Element).closest('.add-widget-menu-container')) {
                setActiveAddMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeAddMenu]);

    return (
        <div className="space-y-6">
            {blocks.map((block, index) => {
                if (block.type !== 'section') {
                    return (
                        <LegacyBlock 
                            key={block.id}
                            block={block}
                            index={index}
                            deleteBlock={deleteBlock}
                        />
                    );
                }
                
                return (
                    <SectionBlock 
                        key={block.id}
                        block={block}
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
                        activeTheme={activeTheme}
                        moveBlock={moveBlock}
                        deleteBlockById={deleteBlockById}
                        updateBlockConfigById={updateBlockConfigById}
                        addChildBlockById={addChildBlockById}
                        moveChildBlockById={moveChildBlockById}
                        moveChildBlockColumnById={moveChildBlockColumnById}
                        deleteChildBlockById={deleteChildBlockById}
                        duplicateChildBlockById={duplicateChildBlockById}
                        containerWidth={containerWidth}
                        customContainerWidth={customContainerWidth}
                        sourceBlocksByLocation={sourceBlocksByLocation}
                    />
                );
            })}
        </div>
    );
}

export default React.memo(BlockList);
