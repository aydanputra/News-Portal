import React from "react";
import { Trash2 } from "lucide-react";
import { Block } from "./types";
import { getBlockLabel, resolveBlockTypeAlias } from "@/lib/block-registry";

interface LegacyBlockProps {
    block: Block;
    index: number;
    activeTheme?: string;
    deleteBlock: (index: number) => void;
}

function LegacyBlock({ block, index, activeTheme = "classic", deleteBlock }: LegacyBlockProps) {
    const blockType = typeof block.type === "string" ? block.type : "";
    const effectiveType = blockType ? resolveBlockTypeAlias(blockType) : blockType;
    const storedTitle = typeof block.title === "string" ? block.title.trim() : "";
    const fallbackLabel = effectiveType ? getBlockLabel(effectiveType, activeTheme) : "";
    const displayTitle = fallbackLabel || storedTitle || effectiveType || "Untitled Block";
    const shouldShowStoredTitle = storedTitle !== "" && storedTitle !== displayTitle;

    return (
        <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-xl flex justify-between items-center opacity-70">
            <div>
                <span className="text-xs font-bold text-yellow-600 uppercase">Legacy Block</span>
                <h4 className="font-bold text-[var(--fg-primary)]">{displayTitle}</h4>
                {shouldShowStoredTitle && (
                    <p className="text-xs text-yellow-700 mt-1">{storedTitle}</p>
                )}
            </div>
            <button onClick={() => deleteBlock(index)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
        </div>
    );
}

export default React.memo(LegacyBlock);
