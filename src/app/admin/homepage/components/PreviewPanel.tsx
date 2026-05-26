import React from "react";
import BlockList from "./BlockList";
import { Block, Tag } from "../types";
import { ConfigValue } from "@/lib/page-builder-config";
import { SidebarSourceBlocksMap } from "@/lib/sidebar-reference";

interface PreviewPanelProps {
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
    setShowSectionPicker: (show: boolean) => void;
    moveBlock: (index: number, direction: "up" | "down") => void;
    duplicateBlock?: (index: number) => void;
    homeContainerWidth?: string;
    homeCustomContainerWidth?: string;
    backgroundColor?: string;
    
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

export default function PreviewPanel({
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
    setShowSectionPicker,
    moveBlock,
    duplicateBlock,
    homeContainerWidth: _homeContainerWidth = "boxed",
    homeCustomContainerWidth,
    backgroundColor: _backgroundColor, // Removed default value here, will use CSS var

    // Recursive Actions
    deleteBlockById,
    updateBlockConfigById,
    addChildBlockById,
    moveChildBlockById,
    deleteChildBlockById,
    duplicateChildBlockById,
    moveChildBlockColumnById,
    sourceBlocksByLocation
}: PreviewPanelProps) {
    const deviceCanvasClass =
        activeDeviceTab === "mobile"
            ? "max-w-[430px]"
            : activeDeviceTab === "tablet"
                ? "max-w-[820px]"
                : "max-w-full";

    const canvasClass = `w-full min-h-[500px] ${deviceCanvasClass}`;

    return (
        <div className="space-y-6">
            {blocks.length === 0 ? (
                /* Empty State - Same Container Width */
                <div className="flex justify-center">
                    <div className={`${canvasClass} transition-all duration-300 border-2 border-dashed border-[var(--border)] rounded-xl bg-[var(--bg-surface)] flex flex-col items-center justify-center py-20`}>
                        <p className="text-[var(--fg-muted)] font-medium">Halaman kosong</p>
                        <button onClick={() => setShowSectionPicker(true)} className="mt-4 text-[var(--accent)] font-bold hover:underline">Mulai Tambah Section</button>
                    </div>
                </div>
            ) : (
                /* Filled State - Same Container Width */
                <div className="flex justify-center">
                    <div 
                        className={`${canvasClass} transition-all duration-300 bg-[var(--bg-surface)] rounded-xl overflow-hidden shadow-sm border border-[var(--border)]`}
                        // We don't force background color here anymore, let it inherit or use theme vars
                    >
                        <BlockList
                            builderLocation={builderLocation}
                            activeTheme={activeTheme}
                            activeDeviceTab={activeDeviceTab}
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
                            moveBlock={moveBlock}
                            duplicateBlock={duplicateBlock}
                            homeContainerWidth={_homeContainerWidth}
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
                    </div>
                </div>
            )}
        </div>
    );
}
