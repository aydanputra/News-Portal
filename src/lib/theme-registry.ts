// Metadata tema untuk kebutuhan UI admin/client.
// Resolver komponen server-only ada di theme-registry.server.ts.

export type ThemeId = "classic" | "skeleton" | "pranala";
export type ThemeSurface = "homepage" | "archive" | "singlePost" | "page";
export type ThemeCapabilityKey =
  | "supportsArchiveBuilder"
  | "supportsPostBuilder"
  | "supportsHeaderBuilder"
  | "supportsFooterBuilder"
  | "singlePostRequiresBlocks"
  | "isStarterTheme"
  | "isProductionReady"
  | "visibleInSelector";

export type ThemeDefinition = {
  id: ThemeId;
  label: string;
  description: string;
  mockupType: "classic" | "modern";
  previewImage: string;
  visibleInSelector: boolean;
  isStarterTheme: boolean;
  isProductionReady: boolean;
  supportsArchiveBuilder: boolean;
  supportsPostBuilder: boolean;
  supportsHeaderBuilder: boolean;
  supportsFooterBuilder: boolean;
  singlePostRequiresBlocks: boolean;
  supportedSurfaces: ThemeSurface[];
  fallbackThemeId: ThemeId;
};

export const themeOptions: ThemeDefinition[] = [
  {
    id: "classic",
    label: "Classic Standard",
    description: "Tema standar yang bersih dan modular.",
    mockupType: "classic",
    previewImage: "/theme-previews/classic-home.svg",
    visibleInSelector: true,
    isStarterTheme: true,
    isProductionReady: false,
    supportsArchiveBuilder: false,
    supportsPostBuilder: false,
    supportsHeaderBuilder: false,
    supportsFooterBuilder: false,
    singlePostRequiresBlocks: false,
    supportedSurfaces: ["homepage", "archive", "singlePost", "page"],
    fallbackThemeId: "classic",
  },
  {
    id: "skeleton",
    label: "Skeleton Starter",
    description: "Tema dasar minimalis untuk pengembangan.",
    mockupType: "modern",
    previewImage: "/theme-previews/skeleton-home.svg",
    visibleInSelector: true,
    isStarterTheme: true,
    isProductionReady: false,
    supportsArchiveBuilder: false,
    supportsPostBuilder: false,
    supportsHeaderBuilder: false,
    supportsFooterBuilder: false,
    singlePostRequiresBlocks: false,
    supportedSurfaces: ["homepage"],
    fallbackThemeId: "classic",
  },
  {
    id: "pranala",
    label: "Pranala News",
    description: "Tema kustom modern dengan gaya minimalis.",
    mockupType: "modern",
    previewImage: "/theme-previews/pranala-home.svg",
    visibleInSelector: true,
    isStarterTheme: false,
    isProductionReady: true,
    supportsArchiveBuilder: true,
    supportsPostBuilder: true,
    supportsHeaderBuilder: true,
    supportsFooterBuilder: true,
    singlePostRequiresBlocks: true,
    supportedSurfaces: ["homepage", "archive", "singlePost", "page"],
    fallbackThemeId: "classic",
  },
];

const THEME_DEFINITIONS: Record<ThemeId, ThemeDefinition> = themeOptions.reduce(
  (acc, theme) => {
    acc[theme.id] = theme;
    return acc;
  },
  {} as Record<ThemeId, ThemeDefinition>,
);

export function normalizeThemeId(themeName: string): ThemeId | undefined {
  const normalized = String(themeName || "").trim().toLowerCase();
  if (normalized === "classic" || normalized === "skeleton" || normalized === "pranala") {
    return normalized;
  }
  return undefined;
}

export function getResolvedThemeId(themeName: string, fallback: ThemeId = "classic"): ThemeId {
  return normalizeThemeId(themeName) || fallback;
}

export function getThemeDefinition(themeName: string, fallback: ThemeId = "classic"): ThemeDefinition {
  return THEME_DEFINITIONS[getResolvedThemeId(themeName, fallback)];
}

export function themeSupports(themeName: string, capability: ThemeCapabilityKey): boolean {
  return Boolean(getThemeDefinition(themeName)[capability]);
}

export function getThemeSurfaceThemeId(themeName: string, surface: ThemeSurface): ThemeId {
  const definition = getThemeDefinition(themeName);
  if (definition.supportedSurfaces.includes(surface)) return definition.id;
  return definition.fallbackThemeId;
}

export function resolveSinglePostThemeId(themeName: string, hasBlocks: boolean): ThemeId {
  const definition = getThemeDefinition(themeName);
  if (definition.singlePostRequiresBlocks && !hasBlocks) {
    return definition.fallbackThemeId;
  }
  return getThemeSurfaceThemeId(definition.id, "singlePost");
}
