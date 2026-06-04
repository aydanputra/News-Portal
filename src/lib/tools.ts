export type ToolId = "wp_import" | "media_migration" | "print_tools" | "backfill_excerpts";

export const ALL_TOOL_IDS: ToolId[] = ["wp_import", "media_migration", "print_tools", "backfill_excerpts"];

export function isToolId(raw: unknown): raw is ToolId {
  return typeof raw === "string" && (ALL_TOOL_IDS as string[]).includes(raw);
}

export const TOOL_LABELS: Record<ToolId, string> = {
  wp_import: "Import WordPress",
  media_migration: "Migrasi Media",
  print_tools: "Print Artikel",
  backfill_excerpts: "Generate Excerpts",
};

