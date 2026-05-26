// src/lib/block-registry.ts

import { CLASSIC_BLOCKS, BlockDefinition as IBlockDefinition } from "@/themes/classic/blocks/registry";
import { PRANALA_BLOCKS } from "@/themes/pranala/blocks/registry";

export type BlockDefinition = IBlockDefinition;

// Registry Map
const THEME_BLOCKS: Record<string, Record<string, BlockDefinition>> = {
  // modern: {}, // Removed
  classic: CLASSIC_BLOCKS,
  pranala: PRANALA_BLOCKS,
};

// --- API UNTUK MENGAMBIL BLOCK DEFINITION ---

export function getThemeBlocks(themeName: string = "classic"): BlockDefinition[] {
  // Jika tema tidak ditemukan, fallback ke classic
  const blocks = THEME_BLOCKS[themeName] || THEME_BLOCKS["classic"];
  return Object.values(blocks || {});
}

export function getBlockDefinition(type: string, themeName: string = "classic"): BlockDefinition | undefined {
  const blocks = THEME_BLOCKS[themeName] || THEME_BLOCKS["classic"];
  return blocks ? blocks[type] : undefined;
}

// Helper untuk mendapatkan icon (untuk UI Admin)
export function getBlockIcon(type: string, themeName: string = "classic") {
  const def = getBlockDefinition(type, themeName);
  return def?.icon;
}

// Helper untuk mendapatkan label
export function getBlockLabel(type: string, themeName: string = "classic") {
  const def = getBlockDefinition(type, themeName);
  return def?.label || type;
}
