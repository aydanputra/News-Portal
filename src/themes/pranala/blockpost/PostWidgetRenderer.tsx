"use client";

import React, { useEffect, useMemo, useState } from "react";
import { WidgetRenderContext } from "./types";
import { getFirstImageFromContent, getPostImageUrl, toPx } from "./helpers";
import { POST_WIDGET_COMPONENTS } from "./widget-registry";

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
  previewDeviceTab = "desktop"
}: PostWidgetRendererProps) {
  const config = widget?.config || {};
  const [isPublicDarkMode, setIsPublicDarkMode] = useState(false);
  const [activePublicDeviceTab, setActivePublicDeviceTab] = useState<"desktop" | "tablet" | "mobile">("desktop");
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const applyMode = () => setIsPublicDarkMode(root.classList.contains("public-dark"));
    applyMode();
    const observer = new MutationObserver(applyMode);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (preview || typeof window === "undefined") return;
    const resolveDeviceTab = () => {
      const width = window.innerWidth;
      if (width < 768) return "mobile";
      if (width < 1024) return "tablet";
      return "desktop";
    };
    const applyDeviceTab = () => setActivePublicDeviceTab(resolveDeviceTab());
    applyDeviceTab();
    window.addEventListener("resize", applyDeviceTab);
    return () => window.removeEventListener("resize", applyDeviceTab);
  }, [preview]);

  const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
  const resolvedDeviceTab = preview ? previewDeviceTab : activePublicDeviceTab;
  const getDarkModeColorOverride = (key: string): unknown => {
    if (!isPublicDarkMode || preview) return undefined;
    const primary = "var(--fg-primary)";
    const secondary = "var(--fg-secondary)";
    const subtleSurface = "rgba(15, 23, 42, 0.42)";
    const inputSurface = "rgba(15, 23, 42, 0.58)";
    const softSurface = "rgba(30, 41, 59, 0.62)";
    const border = "rgba(148, 163, 184, 0.22)";
    const borderStrong = "rgba(148, 163, 184, 0.35)";
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
        return border;
      case "tagHoverBackgroundColor":
        return "rgba(51, 65, 85, 0.85)";
      case "tagHoverBorderColor":
        return borderStrong;
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
  const imageUrl = useMemo(() => getPostImageUrl(post) || getFirstImageFromContent(post?.content), [post]);
  const textAlignValue = getResponsiveConfig("textAlign");
  const textAlign = textAlignValue === "left" || textAlignValue === "center" || textAlignValue === "right" || textAlignValue === "justify"
    ? textAlignValue
    : undefined;
  const widgetContainerStyle: React.CSSProperties = {
    marginTop: toPx(getResponsiveConfig("marginTop")),
    marginRight: toPx(getResponsiveConfig("marginRight")),
    marginBottom: toPx(getResponsiveConfig("marginBottom")),
    marginLeft: toPx(getResponsiveConfig("marginLeft")),
    paddingTop: toPx(getResponsiveConfig("paddingTop")),
    paddingRight: toPx(getResponsiveConfig("paddingRight")),
    paddingBottom: toPx(getResponsiveConfig("paddingBottom")),
    paddingLeft: toPx(getResponsiveConfig("paddingLeft")),
    textAlign,
  };
  const useBoxValue = getResponsiveConfig("useBox");
  const useBox = widget?.type === "post_share" ? false : (useBoxValue === true || useBoxValue === "true");
  const boxRadiusValue = getResponsiveConfig("boxBorderRadius");
  const radiusMap: Record<string, string> = {
    none: "0",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem"
  };
  const resolvedBoxRadius = typeof boxRadiusValue === "string" && boxRadiusValue.trim() !== ""
    ? (radiusMap[boxRadiusValue] || boxRadiusValue)
    : "var(--home-main-box-radius, 0.75rem)";
  if (useBox) {
    widgetContainerStyle.backgroundColor = (getResponsiveConfig("boxColor") as string) || "var(--bg-elevated)";
    widgetContainerStyle.border = "var(--box-border, 1px solid var(--border))";
    widgetContainerStyle.borderRadius = resolvedBoxRadius;
    widgetContainerStyle.boxShadow = "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))";
  }
  const context: WidgetRenderContext = {
    widget,
    post: { ...post, __imageUrl: imageUrl },
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
