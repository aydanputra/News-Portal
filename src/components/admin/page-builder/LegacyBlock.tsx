import React from "react";
import { Trash2 } from "lucide-react";
import { Block } from "./types";

interface LegacyBlockProps {
    block: Block;
    index: number;
    deleteBlock: (index: number) => void;
}

function LegacyBlock({ block, index, deleteBlock }: LegacyBlockProps) {
    return (
        <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-xl flex justify-between items-center opacity-70">
            <div>
                <span className="text-xs font-bold text-yellow-600 uppercase">Legacy Block</span>
                <h4 className="font-bold text-[var(--fg-primary)]">{block.title}</h4>
            </div>
            <button onClick={() => deleteBlock(index)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
        </div>
    );
}

export default React.memo(LegacyBlock);
