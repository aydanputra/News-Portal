import "server-only";
import { type ThemeId, type ThemeSurface, getResolvedThemeId, getThemeSurfaceThemeId } from "@/lib/theme-registry";

const ACTIVE_THEME: ThemeId =
  (process.env.NEXT_PUBLIC_ACTIVE_THEME as ThemeId | undefined) ||
  (process.env.ACTIVE_THEME as ThemeId | undefined) ||
  "classic";

type ThemeComponentLoader = () => Promise<any>;

const SERVER_THEME_COMPONENTS: Record<ThemeSurface, Partial<Record<ThemeId, ThemeComponentLoader>>> = {
  homepage: {
    classic: async () => (await import("@themes/classic/templates/Homepage")).default,
    skeleton: async () => (await import("@themes/skeleton/Home")).default,
    pranala: async () => (await import("@themes/pranala/templates/Homepage")).default,
  },
  archive: {
    classic: async () => (await import("@themes/classic/templates/Archive")).default,
    pranala: async () => (await import("@themes/pranala/templates/Archive")).default,
  },
  singlePost: {
    classic: async () => (await import("@themes/classic/templates/SinglePost")).default,
    pranala: async () => (await import("@themes/pranala/templates/SinglePost")).default,
  },
  page: {
    classic: async () => (await import("@themes/classic/templates/Page")).default,
    pranala: async () => (await import("@themes/pranala/templates/Page")).default,
  },
};

function resolveThemeId(themeName: string): ThemeId {
  return getResolvedThemeId(themeName, ACTIVE_THEME);
}

async function importThemeComponent(theme: ThemeId, surface: ThemeSurface): Promise<any> {
  const surfaceLoaders = SERVER_THEME_COMPONENTS[surface];
  const loader =
    surfaceLoaders[theme] ??
    surfaceLoaders.classic ??
    SERVER_THEME_COMPONENTS.homepage.classic;

  if (!loader) {
    throw new Error(`Theme loader not found for surface "${surface}"`);
  }

  return loader();
}

export function resolveThemeSurfaceComponentId(themeName: string, surface: ThemeSurface): ThemeId {
  return getThemeSurfaceThemeId(resolveThemeId(themeName), surface);
}

export async function getThemeSurfaceComponent(themeName: string, surface: ThemeSurface) {
  return importThemeComponent(resolveThemeSurfaceComponentId(themeName, surface), surface);
}

export async function getThemeHomepageComponent(themeName: string) {
  return getThemeSurfaceComponent(themeName, "homepage");
}

export async function getThemeArchiveComponent(themeName: string) {
  return getThemeSurfaceComponent(themeName, "archive");
}

export async function getThemeSinglePostComponent(themeName: string) {
  return getThemeSurfaceComponent(themeName, "singlePost");
}

export async function getThemePageComponent(themeName: string) {
  return getThemeSurfaceComponent(themeName, "page");
}

export async function getThemeComponent(themeName: string) {
  return getThemeHomepageComponent(themeName);
}
