export type ToolId = "wp_import" | "media_migration" | "print_tools" | "backfill_excerpts" | "bukti_tayang" | "redirect_manager" | "auto_share";
export type ManagedToolId = "import_tools" | "print_tools" | "bukti_tayang" | "redirect_manager" | "auto_share";

export const ALL_TOOL_IDS: ToolId[] = ["wp_import", "media_migration", "print_tools", "backfill_excerpts", "bukti_tayang", "redirect_manager", "auto_share"];
export const ALL_MANAGED_TOOL_IDS: ManagedToolId[] = ["import_tools", "print_tools", "bukti_tayang", "redirect_manager", "auto_share"];

export type ToolVisibilityMap = Record<ToolId, boolean>;
export type ManagedToolVisibilityMap = Record<ManagedToolId, boolean>;

export function isToolId(raw: unknown): raw is ToolId {
  return typeof raw === "string" && (ALL_TOOL_IDS as string[]).includes(raw);
}

export const TOOL_LABELS: Record<ToolId, string> = {
  wp_import: "Import WordPress",
  media_migration: "Migrasi Media",
  print_tools: "Print Artikel",
  backfill_excerpts: "Generate Excerpts",
  bukti_tayang: "Bukti Tayang",
  redirect_manager: "Redirect Manager",
  auto_share: "Auto Share",
};

export const MANAGED_TOOL_GROUPS: Record<ManagedToolId, ToolId[]> = {
  import_tools: ["wp_import", "media_migration", "backfill_excerpts"],
  print_tools: ["print_tools"],
  bukti_tayang: ["bukti_tayang"],
  redirect_manager: ["redirect_manager"],
  auto_share: ["auto_share"],
};

export const MANAGED_TOOL_LABELS: Record<ManagedToolId, string> = {
  import_tools: "Import Tools",
  print_tools: "Print Tools",
  bukti_tayang: "Bukti Tayang",
  redirect_manager: "Redirect Manager",
  auto_share: "Auto Share",
};

export const MANAGED_TOOL_DESCRIPTIONS: Record<ManagedToolId, string> = {
  import_tools: "Mencakup Import WordPress, Generate Media, dan Generate Excerpts.",
  print_tools: "Tool untuk print artikel.",
  bukti_tayang: "Tool rekapitulasi berita dengan preview dan export PDF/XLS.",
  redirect_manager: "Kelola redirect manual dari URL lama ke URL baru agar migrasi tidak berakhir 404.",
  auto_share: "Bagikan berita ke berbagai platform share-link langsung dari daftar artikel.",
};

export function getDefaultToolVisibility(): ToolVisibilityMap {
  return {
    wp_import: true,
    media_migration: true,
    print_tools: true,
    backfill_excerpts: true,
    bukti_tayang: true,
    redirect_manager: true,
    auto_share: true,
  };
}

export function normalizeToolVisibility(raw: unknown): ToolVisibilityMap {
  const defaults = getDefaultToolVisibility();
  if (!raw || typeof raw !== "object") return defaults;

  const input = raw as Record<string, unknown>;
  return ALL_TOOL_IDS.reduce((acc, toolId) => {
    acc[toolId] = typeof input[toolId] === "boolean" ? Boolean(input[toolId]) : defaults[toolId];
    return acc;
  }, {} as ToolVisibilityMap);
}

export function getDefaultManagedToolVisibility(): ManagedToolVisibilityMap {
  return {
    import_tools: true,
    print_tools: true,
    bukti_tayang: true,
    redirect_manager: true,
    auto_share: true,
  };
}

export function getManagedToolVisibility(raw: unknown): ManagedToolVisibilityMap {
  const normalized = normalizeToolVisibility(raw);
  return ALL_MANAGED_TOOL_IDS.reduce((acc, managedToolId) => {
    acc[managedToolId] = MANAGED_TOOL_GROUPS[managedToolId].some((toolId) => normalized[toolId]);
    return acc;
  }, {} as ManagedToolVisibilityMap);
}

export function normalizeManagedToolVisibility(raw: unknown): ManagedToolVisibilityMap {
  const defaults = getDefaultManagedToolVisibility();
  if (!raw || typeof raw !== "object") return defaults;

  const input = raw as Record<string, unknown>;
  return ALL_MANAGED_TOOL_IDS.reduce((acc, managedToolId) => {
    if (typeof input[managedToolId] === "boolean") {
      acc[managedToolId] = Boolean(input[managedToolId]);
      return acc;
    }

    const groupedToolIds = MANAGED_TOOL_GROUPS[managedToolId];
    const hasLegacyRawValue = groupedToolIds.some((toolId) => typeof input[toolId] === "boolean");
    acc[managedToolId] = hasLegacyRawValue
      ? groupedToolIds.some((toolId) => Boolean(input[toolId]))
      : defaults[managedToolId];
    return acc;
  }, {} as ManagedToolVisibilityMap);
}

export function expandManagedToolVisibility(visibility: ManagedToolVisibilityMap): ToolVisibilityMap {
  return ALL_MANAGED_TOOL_IDS.reduce((acc, managedToolId) => {
    const enabled = Boolean(visibility[managedToolId]);
    for (const toolId of MANAGED_TOOL_GROUPS[managedToolId]) {
      acc[toolId] = enabled;
    }
    return acc;
  }, {} as ToolVisibilityMap);
}

export function resolveToolVisibility(raw: unknown): ToolVisibilityMap {
  return expandManagedToolVisibility(getManagedToolVisibility(raw));
}
