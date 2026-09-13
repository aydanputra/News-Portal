// src/lib/block-aliases.ts
// Modul ringan tanpa import komponen blok. Dipakai oleh halaman publik agar
// hanya menarik fungsi alias, bukan seluruh registry + komponen blok.

export const BLOCK_TYPE_ALIASES: Record<string, string> = {
  headline_2: "news_headline_big",
  hero: "classic_hero",
  news_list_highlight: "news_list",
  news_slider: "news_grid_slider",
};

export function resolveBlockTypeAlias(type: string): string {
  return BLOCK_TYPE_ALIASES[type] || type;
}
