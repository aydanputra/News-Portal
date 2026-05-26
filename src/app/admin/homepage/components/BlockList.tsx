import React, { useState, useEffect } from "react";
import { Block, Tag } from "../types";
import LegacyBlock from "./LegacyBlock";
import SectionBlock from "./SectionBlock";
import { ConfigValue } from "@/lib/page-builder-config";
import { SidebarSourceBlocksMap } from "@/lib/sidebar-reference";

interface BlockListProps {
    builderLocation?: "home" | "archive" | "header" | "footer";
    activeTheme?: string; // Add this
    activeDeviceTab?: "desktop" | "tablet" | "mobile";
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
    moveBlock: (index: number, direction: "up" | "down") => void;
    duplicateBlock?: (index: number) => void;
    homeContainerWidth?: string;
    homeCustomContainerWidth?: string;

    // Recursive Actions
    deleteBlockById?: (blockId: string) => void;
    updateBlockConfigById?: (blockId: string, key: string, value: ConfigValue) => void;
    addChildBlockById?: (parentId: string, type: string, title: string, columnIndex: number) => void;
    moveChildBlockById?: (parentId: string, childId: string, direction: "up" | "down") => void;
    deleteChildBlockById?: (parentId: string, childId: string) => void;
    duplicateChildBlockById?: (parentId: string, childId: string) => void;
    moveChildBlockColumnById?: (parentId: string, childId: string, direction: "left" | "right") => void;
    sourceBlocksByLocation?: SidebarSourceBlocksMap;
}

function BlockList({
    builderLocation = "home",
    activeTheme = "classic",
    activeDeviceTab = "desktop",
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
    moveBlock,
    duplicateBlock,
    homeContainerWidth,
    homeCustomContainerWidth,
    
    // Recursive Actions
    deleteBlockById,
    updateBlockConfigById,
    addChildBlockById,
    moveChildBlockById,
    deleteChildBlockById,
    duplicateChildBlockById,
    moveChildBlockColumnById,
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
        <div className={builderLocation === "archive" ? "space-y-0" : "space-y-6"}>
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
                        builderLocation={builderLocation}
                        key={block.id}
                        activeTheme={activeTheme}
                        activeDeviceTab={activeDeviceTab}
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
                        activeAddMenu={activeAddMenu}
                        setActiveAddMenu={setActiveAddMenu}
                        moveBlock={moveBlock}
                        duplicateBlock={duplicateBlock}
                        homeContainerWidth={homeContainerWidth}
                        homeCustomContainerWidth={homeCustomContainerWidth}
                        
                        // Recursive Actions
                        deleteBlockById={deleteBlockById}
                        updateBlockConfigById={updateBlockConfigById}
                        addChildBlockById={addChildBlockById}
                        moveChildBlockById={moveChildBlockById}
                        deleteChildBlockById={deleteChildBlockById}
                        duplicateChildBlockById={duplicateChildBlockById}
                        moveChildBlockColumnById={moveChildBlockColumnById}
                        sourceBlocksByLocation={sourceBlocksByLocation}
                    />
                );
            })}
        </div>
    );
}

export default React.memo(BlockList);
