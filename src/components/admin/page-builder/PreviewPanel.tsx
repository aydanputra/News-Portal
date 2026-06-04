"use client";

import React from "react";
import BlockList from "./BlockList";
import { Block, Tag } from "./types";
import { ConfigValue } from "@/lib/page-builder-config";
import { SidebarSourceBlocksMap } from "@/lib/sidebar-reference";

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
                        <BlockList
                            builderLocation={builderLocation}
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
                    </div>
                </div>
            )}
        </div>
    );
}
