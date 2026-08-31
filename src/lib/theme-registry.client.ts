"use client";

import dynamic from "next/dynamic";
import { type ThemeId, getThemeSurfaceThemeId, resolveSinglePostThemeId } from "@/lib/theme-registry";

const CLIENT_SINGLE_POST_COMPONENTS: Record<ThemeId, any> = {
  classic: dynamic(() => import("@/themes/classic/templates/SinglePost"), { ssr: false }),
  skeleton: dynamic(() => import("@/themes/classic/templates/SinglePost"), { ssr: false }),
  pranala: dynamic(() => import("@/themes/pranala/templates/SinglePost"), { ssr: false }),
};

const CLIENT_PAGE_COMPONENTS: Record<ThemeId, any> = {
  classic: dynamic(() => import("@/themes/classic/templates/Page"), { ssr: false }),
  skeleton: dynamic(() => import("@/themes/classic/templates/Page"), { ssr: false }),
  pranala: dynamic(() => import("@/themes/pranala/templates/Page"), { ssr: false }),
};

export function getThemeSinglePostPreviewComponent(themeName: string, hasBlocks: boolean) {
  const resolvedThemeId = resolveSinglePostThemeId(themeName, hasBlocks);
  return CLIENT_SINGLE_POST_COMPONENTS[resolvedThemeId] || CLIENT_SINGLE_POST_COMPONENTS.classic;
}

export function getThemePagePreviewComponent(themeName: string) {
  const resolvedThemeId = getThemeSurfaceThemeId(themeName, "page");
  return CLIENT_PAGE_COMPONENTS[resolvedThemeId] || CLIENT_PAGE_COMPONENTS.classic;
}
