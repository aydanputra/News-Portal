"use client";

import { sanitizeCssUrl } from "@/lib/sanitizer";
import type { PublicViewportDevice } from "./public-ui-store";

export const isTruthy = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";

export const capKey = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const getResponsiveValue = (cfg: any, key: string, device: PublicViewportDevice) => {
  if (device === "desktop") return cfg?.[key];
  const prefixed = `${device}${capKey(key)}`;
  return cfg?.[prefixed] ?? cfg?.[key];
};

export const normalizeColor = (value: unknown) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined);

export const normalizePx = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
  return trimmed;
};

export const formatSize = (raw: unknown, fallback: string) => {
  if (raw === undefined || raw === null) return fallback;
  if (typeof raw === "number" && Number.isFinite(raw)) return `${raw}px`;
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (/^\d+$/.test(trimmed)) return `${trimmed}px`;
  return trimmed;
};

export const resolveMaxWidth = (mode: string, custom: unknown) => {
  const boxedFallback = "var(--container-width, 1250px)";
  if (mode === "full") return "100%";
  if (mode === "narrow") return "1000px";
  if (mode === "custom") return formatSize(custom, boxedFallback);
  return boxedFallback;
};

export const numPx = (raw: unknown, fallback: number) => {
  if (typeof raw === "number" && Number.isFinite(raw)) return `${raw}px`;
  if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return `${parsed}px`;
  }
  return `${fallback}px`;
};

export const resolveBgImage = (url: unknown, overlay: unknown) => {
  const safeUrl = sanitizeCssUrl(typeof url === "string" ? url : "");
  if (!safeUrl) return "none";
  if (typeof overlay === "string" && overlay.trim() !== "") {
    return `linear-gradient(${overlay}, ${overlay}), url("${safeUrl}")`;
  }
  return `url("${safeUrl}")`;
};

export const resolveOptionalPx = (raw: unknown) => {
  if (typeof raw === "number" && Number.isFinite(raw)) return `${raw}px`;
  if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return `${parsed}px`;
  }
  return undefined;
};

export const formatSpacing = (raw: unknown) => {
  if (typeof raw === "number" && Number.isFinite(raw)) return `${raw}px`;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    return trimmed;
  }
  return undefined;
};

export const resolveLogoSizeVars = (cfg: any) => {
  const desktopH = resolveOptionalPx(getResponsiveValue(cfg, "logoHeight", "desktop")) || "40px";
  const tabletH = resolveOptionalPx(getResponsiveValue(cfg, "logoHeight", "tablet")) || desktopH;
  const mobileH = resolveOptionalPx(getResponsiveValue(cfg, "logoHeight", "mobile")) || desktopH;
  const desktopMaxW = resolveOptionalPx(getResponsiveValue(cfg, "logoMaxWidth", "desktop"));
  const tabletMaxW = resolveOptionalPx(getResponsiveValue(cfg, "logoMaxWidth", "tablet")) || desktopMaxW;
  const mobileMaxW = resolveOptionalPx(getResponsiveValue(cfg, "logoMaxWidth", "mobile")) || desktopMaxW;
  const desktopText = resolveOptionalPx(getResponsiveValue(cfg, "logoTextSize", "desktop")) || "28px";
  const tabletText = resolveOptionalPx(getResponsiveValue(cfg, "logoTextSize", "tablet")) || desktopText;
  const mobileText = resolveOptionalPx(getResponsiveValue(cfg, "logoTextSize", "mobile")) || desktopText;
  return { desktopH, tabletH, mobileH, desktopMaxW, tabletMaxW, mobileMaxW, desktopText, tabletText, mobileText };
};

export const resolveAdSizeVars = (cfg: any) => {
  const desktopMaxW = resolveOptionalPx(getResponsiveValue(cfg, "maxWidth", "desktop"));
  const tabletMaxW = resolveOptionalPx(getResponsiveValue(cfg, "maxWidth", "tablet")) || desktopMaxW;
  const mobileMaxW = resolveOptionalPx(getResponsiveValue(cfg, "maxWidth", "mobile")) || desktopMaxW;
  return { desktopMaxW, tabletMaxW, mobileMaxW };
};

export const resolveBoxSpacing = (cfg: any, includePadding: boolean, device: PublicViewportDevice) => {
  const mt = resolveOptionalPx(getResponsiveValue(cfg, "marginTop", device));
  const mr = resolveOptionalPx(getResponsiveValue(cfg, "marginRight", device));
  const mb = resolveOptionalPx(getResponsiveValue(cfg, "marginBottom", device));
  const ml = resolveOptionalPx(getResponsiveValue(cfg, "marginLeft", device));
  const pt = includePadding ? resolveOptionalPx(getResponsiveValue(cfg, "paddingTop", device)) : undefined;
  const pr = includePadding ? resolveOptionalPx(getResponsiveValue(cfg, "paddingRight", device)) : undefined;
  const pb = includePadding ? resolveOptionalPx(getResponsiveValue(cfg, "paddingBottom", device)) : undefined;
  const pl = includePadding ? resolveOptionalPx(getResponsiveValue(cfg, "paddingLeft", device)) : undefined;
  const verticalAlignRaw = String(getResponsiveValue(cfg, "verticalAlign", device) ?? "center").trim().toLowerCase();
  const alignSelf = verticalAlignRaw === "top" ? "flex-start" : verticalAlignRaw === "bottom" ? "flex-end" : "center";

  return {
    marginTop: mt,
    marginRight: mr,
    marginBottom: mb,
    marginLeft: ml,
    paddingTop: pt,
    paddingRight: pr,
    paddingBottom: pb,
    paddingLeft: pl,
    alignSelf,
  } as any;
};

export const shadowValue = (value: string) => {
  switch (value) {
    case "sm":
      return "0 1px 2px 0 rgb(0 0 0 / 0.05)";
    case "md":
      return "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
    case "lg":
      return "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)";
    case "xl":
      return "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)";
    case "2xl":
      return "0 25px 50px -12px rgb(0 0 0 / 0.25)";
    case "inner":
      return "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
    default:
      return "none";
  }
};

export const radiusValue = (value: string) => {
  switch (value) {
    case "sm":
      return "0.125rem";
    case "md":
      return "0.375rem";
    case "lg":
      return "0.5rem";
    case "xl":
      return "0.75rem";
    case "2xl":
      return "1rem";
    case "full":
      return "9999px";
    default:
      return "0";
  }
};

export const toNum = (raw: unknown) => {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

export const isTransparentLike = (value: unknown) => {
  if (typeof value !== "string") return true;
  const normalized = value.trim().toLowerCase();
  return normalized === "" || normalized === "transparent" || normalized === "#0000" || normalized === "rgba(0,0,0,0)";
};

export const withAlpha = (color: unknown, opacityPercent: number) => {
  if (typeof color !== "string" || color.trim() === "") return undefined;
  const normalized = color.trim();
  const alpha = Math.max(0, Math.min(100, opacityPercent)) / 100;
  if (alpha <= 0) return "transparent";
  if (alpha >= 1) return normalized;

  if (normalized.startsWith("#")) {
    let hex = normalized.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split("")
        .map((part) => part + part)
        .join("")
        .slice(0, 6);
    }
    if (hex.length >= 6) {
      const r = Number.parseInt(hex.slice(0, 2), 16);
      const g = Number.parseInt(hex.slice(2, 4), 16);
      const b = Number.parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].every((part) => Number.isFinite(part))) {
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
  }

  const rgbMatch = normalized.match(/^rgba?\((.+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1]
      .split(",")
      .map((part) => part.trim())
      .slice(0, 3);
    if (parts.length === 3) {
      return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
    }
  }

  return `color-mix(in srgb, ${normalized} ${Math.round(alpha * 100)}%, transparent)`;
};

export const getHeaderWidgetShellClass = (type: string) => {
  if (type === "header_logo") return "hb-logo";
  if (type === "ad_banner") return "hb-ad";
  if (type === "header_menu_primary" || type === "header_menu_secondary") return "hb-menu";
  if (type === "header_search") return "hb-search";
  if (type === "header_theme_toggle") return "hb-theme";
  if (type === "header_mobile_menu_toggle") return "hb-mobile-toggle";
  return "";
};

export const buildHeaderLogoVars = (cfg: any) => {
  const vars = resolveLogoSizeVars(cfg || {});
  return {
    ["--hb-logo-desktop-h" as any]: vars.desktopH,
    ["--hb-logo-tablet-h" as any]: vars.tabletH,
    ["--hb-logo-mobile-h" as any]: vars.mobileH,
    ["--hb-logo-desktop-maxw" as any]: vars.desktopMaxW,
    ["--hb-logo-tablet-maxw" as any]: vars.tabletMaxW,
    ["--hb-logo-mobile-maxw" as any]: vars.mobileMaxW,
    ["--hb-logo-desktop-text" as any]: vars.desktopText,
    ["--hb-logo-tablet-text" as any]: vars.tabletText,
    ["--hb-logo-mobile-text" as any]: vars.mobileText,
  } as any;
};

export const buildHeaderAdVars = (cfg: any, forceFullWidth = false) => {
  const vars = resolveAdSizeVars(cfg || {});
  const isStretch = forceFullWidth || String(cfg?.align || "") === "stretch";
  return {
    ["--hb-ad-desktop-maxw" as any]: isStretch ? "100%" : vars.desktopMaxW,
    ["--hb-ad-tablet-maxw" as any]: "100%",
    ["--hb-ad-mobile-maxw" as any]: isStretch ? "100%" : vars.mobileMaxW,
  } as any;
};

export const buildHeaderMenuVars = (cfg: any) => {
  const dColor = getResponsiveValue(cfg, "menuTextColor", "desktop");
  const tColor = getResponsiveValue(cfg, "menuTextColor", "tablet");
  const mColor = getResponsiveValue(cfg, "menuTextColor", "mobile");
  const dHover = getResponsiveValue(cfg, "menuHoverTextColor", "desktop");
  const tHover = getResponsiveValue(cfg, "menuHoverTextColor", "tablet");
  const mHover = getResponsiveValue(cfg, "menuHoverTextColor", "mobile");
  const dWeight = getResponsiveValue(cfg, "menuFontWeight", "desktop");
  const tWeight = getResponsiveValue(cfg, "menuFontWeight", "tablet");
  const mWeight = getResponsiveValue(cfg, "menuFontWeight", "mobile");
  const dSize = resolveOptionalPx(getResponsiveValue(cfg, "menuFontSize", "desktop"));
  const tSize = resolveOptionalPx(getResponsiveValue(cfg, "menuFontSize", "tablet")) || dSize;
  const mSize = resolveOptionalPx(getResponsiveValue(cfg, "menuFontSize", "mobile")) || dSize;
  const dFont = getResponsiveValue(cfg, "menuFontFamily", "desktop");
  const tFont = getResponsiveValue(cfg, "menuFontFamily", "tablet");
  const mFont = getResponsiveValue(cfg, "menuFontFamily", "mobile");
  return {
    ["--hb-menu-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
    ["--hb-menu-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
    ["--hb-menu-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
    ["--hb-menu-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
    ["--hb-menu-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
    ["--hb-menu-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
    ["--hb-menu-desktop-weight" as any]: typeof dWeight === "string" ? dWeight : typeof dWeight === "number" ? String(dWeight) : undefined,
    ["--hb-menu-tablet-weight" as any]: typeof tWeight === "string" ? tWeight : typeof tWeight === "number" ? String(tWeight) : undefined,
    ["--hb-menu-mobile-weight" as any]: typeof mWeight === "string" ? mWeight : typeof mWeight === "number" ? String(mWeight) : undefined,
    ["--hb-menu-desktop-size" as any]: dSize,
    ["--hb-menu-tablet-size" as any]: tSize,
    ["--hb-menu-mobile-size" as any]: mSize,
    ["--hb-menu-desktop-font" as any]: typeof dFont === "string" && dFont.trim() !== "" ? dFont : undefined,
    ["--hb-menu-tablet-font" as any]: typeof tFont === "string" && tFont.trim() !== "" ? tFont : undefined,
    ["--hb-menu-mobile-font" as any]: typeof mFont === "string" && mFont.trim() !== "" ? mFont : undefined,
  } as any;
};

export const buildHeaderSearchVars = (cfg: any) => {
  const dColor = getResponsiveValue(cfg, "searchColor", "desktop");
  const tColor = getResponsiveValue(cfg, "searchColor", "tablet");
  const mColor = getResponsiveValue(cfg, "searchColor", "mobile");
  const dHover = getResponsiveValue(cfg, "searchHoverColor", "desktop");
  const tHover = getResponsiveValue(cfg, "searchHoverColor", "tablet");
  const mHover = getResponsiveValue(cfg, "searchHoverColor", "mobile");
  const dIcon = resolveOptionalPx(getResponsiveValue(cfg, "searchIconSize", "desktop"));
  const tIcon = resolveOptionalPx(getResponsiveValue(cfg, "searchIconSize", "tablet")) || dIcon;
  const mIcon = resolveOptionalPx(getResponsiveValue(cfg, "searchIconSize", "mobile")) || dIcon;
  const dInput = getResponsiveValue(cfg, "searchInputColor", "desktop");
  const tInput = getResponsiveValue(cfg, "searchInputColor", "tablet");
  const mInput = getResponsiveValue(cfg, "searchInputColor", "mobile");
  const dBg = getResponsiveValue(cfg, "searchBgColor", "desktop");
  const tBg = getResponsiveValue(cfg, "searchBgColor", "tablet");
  const mBg = getResponsiveValue(cfg, "searchBgColor", "mobile");
  const dBorder = getResponsiveValue(cfg, "searchBorderColor", "desktop");
  const tBorder = getResponsiveValue(cfg, "searchBorderColor", "tablet");
  const mBorder = getResponsiveValue(cfg, "searchBorderColor", "mobile");
  const dRadius = resolveOptionalPx(getResponsiveValue(cfg, "searchRadius", "desktop"));
  const tRadius = resolveOptionalPx(getResponsiveValue(cfg, "searchRadius", "tablet")) || dRadius;
  const mRadius = resolveOptionalPx(getResponsiveValue(cfg, "searchRadius", "mobile")) || dRadius;
  const dHeight = resolveOptionalPx(getResponsiveValue(cfg, "searchHeight", "desktop"));
  const tHeight = resolveOptionalPx(getResponsiveValue(cfg, "searchHeight", "tablet")) || dHeight;
  const mHeight = resolveOptionalPx(getResponsiveValue(cfg, "searchHeight", "mobile")) || dHeight;
  const dFont = resolveOptionalPx(getResponsiveValue(cfg, "searchFontSize", "desktop"));
  const tFont = resolveOptionalPx(getResponsiveValue(cfg, "searchFontSize", "tablet")) || dFont;
  const mFont = resolveOptionalPx(getResponsiveValue(cfg, "searchFontSize", "mobile")) || dFont;
  const dBtnBg = getResponsiveValue(cfg, "searchButtonBgColor", "desktop");
  const tBtnBg = getResponsiveValue(cfg, "searchButtonBgColor", "tablet");
  const mBtnBg = getResponsiveValue(cfg, "searchButtonBgColor", "mobile");
  const dBtnTxt = getResponsiveValue(cfg, "searchButtonTextColor", "desktop");
  const tBtnTxt = getResponsiveValue(cfg, "searchButtonTextColor", "tablet");
  const mBtnTxt = getResponsiveValue(cfg, "searchButtonTextColor", "mobile");
  return {
    ["--hb-search-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
    ["--hb-search-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
    ["--hb-search-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
    ["--hb-search-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
    ["--hb-search-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
    ["--hb-search-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
    ["--hb-search-desktop-icon" as any]: dIcon,
    ["--hb-search-tablet-icon" as any]: tIcon,
    ["--hb-search-mobile-icon" as any]: mIcon,
    ["--hb-search-desktop-input" as any]: typeof dInput === "string" ? dInput : undefined,
    ["--hb-search-tablet-input" as any]: typeof tInput === "string" ? tInput : undefined,
    ["--hb-search-mobile-input" as any]: typeof mInput === "string" ? mInput : undefined,
    ["--hb-search-desktop-bg" as any]: typeof dBg === "string" ? dBg : undefined,
    ["--hb-search-tablet-bg" as any]: typeof tBg === "string" ? tBg : undefined,
    ["--hb-search-mobile-bg" as any]: typeof mBg === "string" ? mBg : undefined,
    ["--hb-search-desktop-border" as any]: typeof dBorder === "string" ? dBorder : undefined,
    ["--hb-search-tablet-border" as any]: typeof tBorder === "string" ? tBorder : undefined,
    ["--hb-search-mobile-border" as any]: typeof mBorder === "string" ? mBorder : undefined,
    ["--hb-search-desktop-radius" as any]: dRadius,
    ["--hb-search-tablet-radius" as any]: tRadius,
    ["--hb-search-mobile-radius" as any]: mRadius,
    ["--hb-search-desktop-height" as any]: dHeight,
    ["--hb-search-tablet-height" as any]: tHeight,
    ["--hb-search-mobile-height" as any]: mHeight,
    ["--hb-search-desktop-font" as any]: dFont,
    ["--hb-search-tablet-font" as any]: tFont,
    ["--hb-search-mobile-font" as any]: mFont,
    ["--hb-search-desktop-btnbg" as any]: typeof dBtnBg === "string" ? dBtnBg : undefined,
    ["--hb-search-tablet-btnbg" as any]: typeof tBtnBg === "string" ? tBtnBg : undefined,
    ["--hb-search-mobile-btnbg" as any]: typeof mBtnBg === "string" ? mBtnBg : undefined,
    ["--hb-search-desktop-btntxt" as any]: typeof dBtnTxt === "string" ? dBtnTxt : undefined,
    ["--hb-search-tablet-btntxt" as any]: typeof tBtnTxt === "string" ? tBtnTxt : undefined,
    ["--hb-search-mobile-btntxt" as any]: typeof mBtnTxt === "string" ? mBtnTxt : undefined,
  } as any;
};

export const buildHeaderThemeVars = (cfg: any) => {
  const dColor = getResponsiveValue(cfg, "themeColor", "desktop");
  const tColor = getResponsiveValue(cfg, "themeColor", "tablet");
  const mColor = getResponsiveValue(cfg, "themeColor", "mobile");
  const dHover = getResponsiveValue(cfg, "themeHoverColor", "desktop");
  const tHover = getResponsiveValue(cfg, "themeHoverColor", "tablet");
  const mHover = getResponsiveValue(cfg, "themeHoverColor", "mobile");
  const dIcon = resolveOptionalPx(getResponsiveValue(cfg, "themeIconSize", "desktop"));
  const tIcon = resolveOptionalPx(getResponsiveValue(cfg, "themeIconSize", "tablet")) || dIcon;
  const mIcon = resolveOptionalPx(getResponsiveValue(cfg, "themeIconSize", "mobile")) || dIcon;
  return {
    ["--hb-theme-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
    ["--hb-theme-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
    ["--hb-theme-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
    ["--hb-theme-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
    ["--hb-theme-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
    ["--hb-theme-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
    ["--hb-theme-desktop-icon" as any]: dIcon,
    ["--hb-theme-tablet-icon" as any]: tIcon,
    ["--hb-theme-mobile-icon" as any]: mIcon,
  } as any;
};

export const buildHeaderMobileToggleVars = (cfg: any) => {
  const dColor = getResponsiveValue(cfg, "mobileMenuColor", "desktop");
  const tColor = getResponsiveValue(cfg, "mobileMenuColor", "tablet");
  const mColor = getResponsiveValue(cfg, "mobileMenuColor", "mobile");
  const dHover = getResponsiveValue(cfg, "mobileMenuHoverColor", "desktop");
  const tHover = getResponsiveValue(cfg, "mobileMenuHoverColor", "tablet");
  const mHover = getResponsiveValue(cfg, "mobileMenuHoverColor", "mobile");
  const dIcon = resolveOptionalPx(getResponsiveValue(cfg, "mobileMenuIconSize", "desktop"));
  const tIcon = resolveOptionalPx(getResponsiveValue(cfg, "mobileMenuIconSize", "tablet")) || dIcon;
  const mIcon = resolveOptionalPx(getResponsiveValue(cfg, "mobileMenuIconSize", "mobile")) || dIcon;
  const dBg = getResponsiveValue(cfg, "mobileMenuBgColor", "desktop");
  const tBg = getResponsiveValue(cfg, "mobileMenuBgColor", "tablet");
  const mBg = getResponsiveValue(cfg, "mobileMenuBgColor", "mobile");
  const dBgHover = getResponsiveValue(cfg, "mobileMenuBgHoverColor", "desktop");
  const tBgHover = getResponsiveValue(cfg, "mobileMenuBgHoverColor", "tablet");
  const mBgHover = getResponsiveValue(cfg, "mobileMenuBgHoverColor", "mobile");
  const dRadius = resolveOptionalPx(getResponsiveValue(cfg, "mobileMenuRadius", "desktop"));
  const tRadius = resolveOptionalPx(getResponsiveValue(cfg, "mobileMenuRadius", "tablet")) || dRadius;
  const mRadius = resolveOptionalPx(getResponsiveValue(cfg, "mobileMenuRadius", "mobile")) || dRadius;
  const dPad = resolveOptionalPx(getResponsiveValue(cfg, "mobileMenuPadding", "desktop"));
  const tPad = resolveOptionalPx(getResponsiveValue(cfg, "mobileMenuPadding", "tablet")) || dPad;
  const mPad = resolveOptionalPx(getResponsiveValue(cfg, "mobileMenuPadding", "mobile")) || dPad;
  return {
    ["--hb-mt-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
    ["--hb-mt-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
    ["--hb-mt-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
    ["--hb-mt-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
    ["--hb-mt-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
    ["--hb-mt-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
    ["--hb-mt-desktop-icon" as any]: dIcon,
    ["--hb-mt-tablet-icon" as any]: tIcon,
    ["--hb-mt-mobile-icon" as any]: mIcon,
    ["--hb-mt-desktop-bg" as any]: typeof dBg === "string" ? dBg : undefined,
    ["--hb-mt-tablet-bg" as any]: typeof tBg === "string" ? tBg : undefined,
    ["--hb-mt-mobile-bg" as any]: typeof mBg === "string" ? mBg : undefined,
    ["--hb-mt-desktop-bghover" as any]: typeof dBgHover === "string" ? dBgHover : undefined,
    ["--hb-mt-tablet-bghover" as any]: typeof tBgHover === "string" ? tBgHover : undefined,
    ["--hb-mt-mobile-bghover" as any]: typeof mBgHover === "string" ? mBgHover : undefined,
    ["--hb-mt-desktop-radius" as any]: dRadius,
    ["--hb-mt-tablet-radius" as any]: tRadius,
    ["--hb-mt-mobile-radius" as any]: mRadius,
    ["--hb-mt-desktop-pad" as any]: dPad,
    ["--hb-mt-tablet-pad" as any]: tPad,
    ["--hb-mt-mobile-pad" as any]: mPad,
  } as any;
};
