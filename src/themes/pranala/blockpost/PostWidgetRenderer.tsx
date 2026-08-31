"use client";

import React, { useSyncExternalStore } from "react";
import { WidgetRenderContext } from "./types";
import { toPx } from "./helpers";
import { POST_WIDGET_COMPONENTS } from "./widget-registry";
import { sanitizeCssUrl } from "@/lib/sanitizer";

type PublicDeviceTab = "desktop" | "tablet" | "mobile";

let currentPublicDarkMode = false;
let currentPublicDeviceTab: PublicDeviceTab = "desktop";
let darkModeObserver: MutationObserver | null = null;
let darkModeListening = false;
let resizeListener: (() => void) | null = null;
let resizeListening = false;
const darkModeSubscribers = new Set<() => void>();
const deviceTabSubscribers = new Set<() => void>();

function emitStoreUpdate(subscribers: Set<() => void>) {
  subscribers.forEach((callback) => callback());
}

function resolvePublicDarkMode() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("public-dark");
}

function resolvePublicDeviceTab(): PublicDeviceTab {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth < 768) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

function ensureDarkModeStore() {
  if (typeof document === "undefined" || darkModeListening) return;
  currentPublicDarkMode = resolvePublicDarkMode();
  darkModeObserver = new MutationObserver(() => {
    const nextValue = resolvePublicDarkMode();
    if (nextValue === currentPublicDarkMode) return;
    currentPublicDarkMode = nextValue;
    emitStoreUpdate(darkModeSubscribers);
  });
  darkModeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  darkModeListening = true;
}

function ensureDeviceTabStore() {
  if (typeof window === "undefined" || resizeListening) return;
  currentPublicDeviceTab = resolvePublicDeviceTab();
  resizeListener = () => {
    const nextValue = resolvePublicDeviceTab();
    if (nextValue === currentPublicDeviceTab) return;
    currentPublicDeviceTab = nextValue;
    emitStoreUpdate(deviceTabSubscribers);
  };
  window.addEventListener("resize", resizeListener);
  resizeListening = true;
}

function subscribeDarkMode(callback: () => void) {
  if (typeof document === "undefined") return () => {};
  ensureDarkModeStore();
  darkModeSubscribers.add(callback);
  return () => {
    darkModeSubscribers.delete(callback);
    if (darkModeSubscribers.size === 0 && darkModeObserver) {
      darkModeObserver.disconnect();
      darkModeObserver = null;
      darkModeListening = false;
    }
  };
}

function subscribeDeviceTab(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  ensureDeviceTabStore();
  deviceTabSubscribers.add(callback);
  return () => {
    deviceTabSubscribers.delete(callback);
    if (deviceTabSubscribers.size === 0 && resizeListener) {
      window.removeEventListener("resize", resizeListener);
      resizeListener = null;
      resizeListening = false;
    }
  };
}

function getDarkModeSnapshot() {
  if (typeof document === "undefined") return false;
  ensureDarkModeStore();
  return currentPublicDarkMode;
}

function getDeviceTabSnapshot(): PublicDeviceTab {
  if (typeof window === "undefined") return "desktop";
  ensureDeviceTabStore();
  return currentPublicDeviceTab;
}

interface PostWidgetRendererProps {
  widget: any;
  post: any;
  setting?: any;
  inlineRelatedPosts?: any[];
  headingColor: string;
  metaColor: string;
  contentColor: string;
  accentColor: string;
  hoverColor?: string;
  blockData?: Record<string, any[]>;
  preview?: boolean;
  previewDeviceTab?: "desktop" | "tablet" | "mobile";
  layoutHandledBySection?: boolean;
}

export default function PostWidgetRenderer({
  widget,
  post,
  setting,
  inlineRelatedPosts = [],
  headingColor,
  metaColor,
  contentColor,
  accentColor,
  hoverColor = "var(--post-hover-color)",
  blockData = {},
  preview = false,
  previewDeviceTab = "desktop",
  layoutHandledBySection = false
}: PostWidgetRendererProps) {
  const config = widget?.config || {};
  const sharedPublicDarkMode = useSyncExternalStore(subscribeDarkMode, getDarkModeSnapshot, () => false);
  const sharedPublicDeviceTab = useSyncExternalStore<PublicDeviceTab>(
    subscribeDeviceTab,
    getDeviceTabSnapshot,
    () => "desktop",
  );

  const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
  const isPublicDarkMode = preview ? false : sharedPublicDarkMode;
  const resolvedDeviceTab: PublicDeviceTab = preview ? previewDeviceTab : sharedPublicDeviceTab;
  const darkModeBorderStrong = "rgba(148, 163, 184, 0.35)";
  const getDarkModeColorOverride = (key: string): unknown => {
    if (!isPublicDarkMode || preview) return undefined;
    const primary = "var(--fg-primary)";
    const secondary = "var(--fg-secondary)";
    const subtleSurface = "rgba(15, 23, 42, 0.42)";
    const inputSurface = "rgba(15, 23, 42, 0.58)";
    const softSurface = "rgba(30, 41, 59, 0.62)";
    const border = "rgba(148, 163, 184, 0.22)";
    const accent = hoverColor || accentColor || "var(--accent)";

    switch (key) {
      case "blockTitleColor":
      case "titleColor":
      case "commentAuthorColor":
      case "commentTextColor":
      case "nameColor":
      case "buttonTextColor":
      case "tagLabelColor":
      case "tagTextColor":
      case "shareLabelColor":
        return primary;
      case "color":
        if (widget?.type === "post_title" || widget?.type === "post_content" || widget?.type === "post_comments" || widget?.type === "post_related_posts") {
          return primary;
        }
        return secondary;
      case "commentMetaColor":
      case "helperTextColor":
      case "relatedMetaColor":
      case "relatedExcerptColor":
      case "labelColor":
      case "bioColor":
        return secondary;
      case "titleHoverColor":
      case "replyLinkColor":
      case "tagHoverTextColor":
        return accent;
      case "blockTitleBorderColor":
        return accentColor;
      case "commentCardColor":
      case "relatedCardColor":
        return subtleSurface;
      case "inputBgColor":
        return inputSurface;
      case "tagBackgroundColor":
        return softSurface;
      case "commentBorderColor":
      case "relatedBorderColor":
      case "inputBorderColor":
      case "navBorderColor":
      case "tagBorderColor":
        return darkModeBorderStrong;
      case "boxBorderColor":
        return darkModeBorderStrong;
      case "tagHoverBackgroundColor":
        return "rgba(51, 65, 85, 0.85)";
      case "tagHoverBorderColor":
        return darkModeBorderStrong;
      default:
        return undefined;
    }
  };
  const getResponsiveConfig = (key: string): unknown => {
    const darkOverride = getDarkModeColorOverride(key);
    if (darkOverride !== undefined) return darkOverride;
    const base = config[key];
    const tablet = config[`tablet${cap(key)}`];
    const mobile = config[`mobile${cap(key)}`];
    if (resolvedDeviceTab === "mobile") return mobile ?? tablet ?? base;
    if (resolvedDeviceTab === "tablet") return tablet ?? base;
    return base;
  };
  const getConfigBool = (key: string, fallback: boolean): boolean => {
    const value = getResponsiveConfig(key);
    if (typeof value === "boolean") return value;
    return fallback;
  };
  const toNumber = (value: unknown): number | undefined => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
    return undefined;
  };
  const toNonEmptyString = (value: unknown, fallback = ""): string => {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    return trimmed || fallback;
  };
  const mergeContentPadding = (spacingValue: unknown, boxValue: unknown, borderValue: unknown): string | undefined => {
    const spacing = toNumber(spacingValue);
    const box = useBox ? (toNumber(boxValue) ?? 0) : 0;
    const border = showContentBorder ? (toNumber(borderValue) ?? 0) : 0;
    const total = (spacing ?? 0) + box + border;
    return spacing !== undefined || box !== 0 || border !== 0 ? `${total}px` : undefined;
  };
  const textAlignValue = getResponsiveConfig("textAlign");
  const textAlign = textAlignValue === "left" || textAlignValue === "center" || textAlignValue === "right" || textAlignValue === "justify"
    ? textAlignValue
    : undefined;
  const useBoxValue = getResponsiveConfig("useBox");
  const useBox = widget?.type === "post_share" ? false : (useBoxValue === true || useBoxValue === "true");
  const isPostContentWidget = widget?.type === "post_content";
  const showContentBorderValue = isPostContentWidget ? getResponsiveConfig("showContentBorder") : undefined;
  const showContentBorder = showContentBorderValue === true || showContentBorderValue === "true";
  const boxPaddingTop = useBox ? (toPx(getResponsiveConfig("boxPaddingTop")) || "0px") : undefined;
  const boxPaddingRight = useBox ? (toPx(getResponsiveConfig("boxPaddingRight")) || "0px") : undefined;
  const boxPaddingBottom = useBox ? (toPx(getResponsiveConfig("boxPaddingBottom")) || "0px") : undefined;
  const boxPaddingLeft = useBox ? (toPx(getResponsiveConfig("boxPaddingLeft")) || "0px") : undefined;
  const widgetContainerStyle: React.CSSProperties = layoutHandledBySection
    ? {
        paddingTop: mergeContentPadding(undefined, getResponsiveConfig("boxPaddingTop"), getResponsiveConfig("contentBorderPaddingTop")),
        paddingRight: mergeContentPadding(undefined, getResponsiveConfig("boxPaddingRight"), getResponsiveConfig("contentBorderPaddingRight")),
        paddingBottom: mergeContentPadding(undefined, getResponsiveConfig("boxPaddingBottom"), getResponsiveConfig("contentBorderPaddingBottom")),
        paddingLeft: mergeContentPadding(undefined, getResponsiveConfig("boxPaddingLeft"), getResponsiveConfig("contentBorderPaddingLeft")),
        textAlign,
      }
    : {
        marginTop: toPx(getResponsiveConfig("marginTop")),
        marginRight: toPx(getResponsiveConfig("marginRight")),
        marginBottom: toPx(getResponsiveConfig("marginBottom")),
        marginLeft: toPx(getResponsiveConfig("marginLeft")),
        paddingTop: mergeContentPadding(getResponsiveConfig("paddingTop"), getResponsiveConfig("boxPaddingTop"), getResponsiveConfig("contentBorderPaddingTop")),
        paddingRight: mergeContentPadding(getResponsiveConfig("paddingRight"), getResponsiveConfig("boxPaddingRight"), getResponsiveConfig("contentBorderPaddingRight")),
        paddingBottom: mergeContentPadding(getResponsiveConfig("paddingBottom"), getResponsiveConfig("boxPaddingBottom"), getResponsiveConfig("contentBorderPaddingBottom")),
        paddingLeft: mergeContentPadding(getResponsiveConfig("paddingLeft"), getResponsiveConfig("boxPaddingLeft"), getResponsiveConfig("contentBorderPaddingLeft")),
        textAlign,
      };
  const boxRadiusValue = getResponsiveConfig("boxBorderRadius");
  const radiusMap: Record<string, string> = {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px"
  };
  const resolvedBoxRadius = typeof boxRadiusValue === "string" && boxRadiusValue.trim() !== ""
    ? (radiusMap[boxRadiusValue] || boxRadiusValue)
    : "var(--home-main-box-radius, 0.75rem)";
  const rawBoxBorderWidth = toNumber(getResponsiveConfig("boxBorderWidth"));
  const boxBorderWidth = rawBoxBorderWidth !== undefined ? Math.max(0, rawBoxBorderWidth) : 1;
  const rawBoxBorderStyle = toNonEmptyString(getResponsiveConfig("boxBorderStyle"), "solid").toLowerCase();
  const boxBorderStyle = ["solid", "dashed", "dotted", "double", "none"].includes(rawBoxBorderStyle)
    ? rawBoxBorderStyle
    : "solid";
  const boxBorderColor = toNonEmptyString(getResponsiveConfig("boxBorderColor"), "var(--border)");
  const hasVisibleBoxBorder = boxBorderWidth > 0 && boxBorderStyle !== "none";
  const shouldApplyBorder = isPostContentWidget
    ? (showContentBorder && hasVisibleBoxBorder)
    : (useBox && hasVisibleBoxBorder);
  if (useBox) {
    const boxBgImage = sanitizeCssUrl(getResponsiveConfig("backgroundImage"));
    const boxBgSize = toNonEmptyString(getResponsiveConfig("backgroundSize"), "cover");
    const boxBgPosition = toNonEmptyString(getResponsiveConfig("backgroundPosition"), "center");
    const boxBgRepeat = toNonEmptyString(getResponsiveConfig("backgroundRepeat"), "no-repeat");
    const boxBgAttachment = toNonEmptyString(getResponsiveConfig("backgroundAttachment"), "scroll");
    const boxOverlayColor = toNonEmptyString(getResponsiveConfig("backgroundOverlayColor"), "transparent");
    const boxOverlayOpacity = Math.min(100, Math.max(0, Number(getResponsiveConfig("backgroundOverlayOpacity") ?? 45) || 0));
    const hasBoxOverlay = boxOverlayOpacity > 0 && boxOverlayColor !== "transparent";
    const boxOverlayFill = hasBoxOverlay ? `color-mix(in srgb, ${boxOverlayColor} ${boxOverlayOpacity}%, transparent)` : "transparent";
    const boxBackgroundImage = boxBgImage
      ? (hasBoxOverlay
        ? `linear-gradient(${boxOverlayFill}, ${boxOverlayFill}), url("${boxBgImage}")`
        : `url("${boxBgImage}")`)
      : "none";
    widgetContainerStyle.backgroundColor = (getResponsiveConfig("boxColor") as string) || "var(--bg-elevated)";
    widgetContainerStyle.borderRadius = resolvedBoxRadius;
    widgetContainerStyle.boxShadow = "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))";
    widgetContainerStyle.backgroundImage = boxBackgroundImage;
    widgetContainerStyle.backgroundSize = boxBgImage ? (hasBoxOverlay ? `cover, ${boxBgSize}` : boxBgSize) : undefined;
    widgetContainerStyle.backgroundPosition = boxBgImage ? (hasBoxOverlay ? `center, ${boxBgPosition}` : boxBgPosition) : undefined;
    widgetContainerStyle.backgroundRepeat = boxBgImage ? (hasBoxOverlay ? `no-repeat, ${boxBgRepeat}` : boxBgRepeat) : undefined;
    widgetContainerStyle.backgroundAttachment = boxBgImage ? (hasBoxOverlay ? `scroll, ${boxBgAttachment}` : boxBgAttachment) : undefined;
  }
  if (isPublicDarkMode && !preview) {
    (widgetContainerStyle as React.CSSProperties & Record<string, string>)["--border"] = darkModeBorderStrong;
    (widgetContainerStyle as React.CSSProperties & Record<string, string>)["--border-strong"] = darkModeBorderStrong;
  }
  if (shouldApplyBorder) {
    widgetContainerStyle.borderWidth = `${boxBorderWidth}px`;
    widgetContainerStyle.borderStyle = boxBorderStyle as React.CSSProperties["borderStyle"];
    widgetContainerStyle.borderColor = boxBorderColor;
    widgetContainerStyle.borderRadius = resolvedBoxRadius;
  }
  const context: WidgetRenderContext = {
    widget,
    post,
    setting,
    inlineRelatedPosts,
    headingColor: isPublicDarkMode ? "var(--fg-primary)" : headingColor,
    metaColor: isPublicDarkMode ? "var(--fg-secondary)" : metaColor,
    contentColor: isPublicDarkMode ? "var(--fg-primary)" : contentColor,
    accentColor,
    hoverColor,
    blockData,
    preview,
    previewDeviceTab: resolvedDeviceTab,
    widgetContainerStyle,
    getResponsiveConfig,
    getConfigBool,
    isPublicDarkMode
  };

  const WidgetComponent = POST_WIDGET_COMPONENTS[widget?.type];
  if (!WidgetComponent) return null;
  return <WidgetComponent {...context} />;
}
