"use client";

import React from "react";
import { PRANALA_BLOCKS } from "../blocks/registry";
import { getWidgetRenderContextFromBuilderLocation, resolveWidgetStyleDefaults } from "@/lib/widget-style-defaults";
import { buildHomepageChildConfig } from "@/lib/page-builder-child-presets";

type SidebarWidgetRendererProps = {
  widget: any;
  widgetData: any[];
  categories?: any[];
  setting?: any;
  renderContext?: "homepage" | "single-post" | "archive";
};

const isTruthy = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";
const normalizeColorToken = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, "") : "";

const isLegacyLightToken = (value: unknown) => {
  const normalized = normalizeColorToken(value);
  return [
    "#fff",
    "#ffffff",
    "#f9fafb",
    "#f8fafc",
    "#f3f4f6",
    "#f5f5f5",
    "white",
    "rgb(255,255,255)",
    "rgba(255,255,255,1)",
    "rgba(255,255,255,0.95)",
    "rgba(255,255,255,0.9)",
    "var(--bg-elevated)",
    "var(--bg-elevated,#ffffff)",
    "var(--bg-surface)",
    "var(--bg-surface,#f9fafb)",
    "var(--card,white)",
    "var(--card,#ffffff)",
  ].includes(normalized);
};

const isTransparentLikeToken = (value: unknown) => {
  const normalized = normalizeColorToken(value);
  return normalized === "" || normalized === "transparent" || normalized === "none" || normalized === "inherit" || normalized === "initial";
};

const getResponsiveHideClass = (config: any) => {
  const classes: string[] = [];
  if (isTruthy(config?.hideOnDesktop)) classes.push("hide-desktop-widget");
  if (isTruthy(config?.hideOnTablet)) classes.push("hide-tablet-widget");
  if (isTruthy(config?.hideOnMobile)) classes.push("hide-mobile-widget");
  return classes.join(" ");
};

export default function SidebarWidgetRenderer({
  widget,
  widgetData,
  categories,
  setting,
  renderContext = "homepage",
}: SidebarWidgetRendererProps) {
  const blockDef = PRANALA_BLOCKS[widget?.type];
  if (!blockDef) return null;

  const Component = blockDef.component as React.ComponentType<Record<string, unknown>>;
  const displayTitle = widget?.title && widget.title.trim() !== "" ? widget.title : widget?.config?.title || "";
  const columnIndex =
    typeof widget?.config?.columnIndex === "number" && Number.isFinite(widget.config.columnIndex)
      ? widget.config.columnIndex
      : 0;
  const homepageAuxiliaryDefaults =
    widget?.type === "sidebar_widget" || widget?.type === "tag_cloud" || widget?.type === "ad_banner"
      ? buildHomepageChildConfig(widget.type, displayTitle, columnIndex)
      : {};
  const normalizedConfig = {
    ...homepageAuxiliaryDefaults,
    ...(widget?.config || {}),
    title: displayTitle,
  } as Record<string, unknown>;

  if (widget?.type === "tag_cloud") {
    if (isLegacyLightToken(normalizedConfig.tagBackgroundColor)) normalizedConfig.tagBackgroundColor = "transparent";
    if (isLegacyLightToken(normalizedConfig.tabletTagBackgroundColor)) normalizedConfig.tabletTagBackgroundColor = "transparent";
    if (isLegacyLightToken(normalizedConfig.mobileTagBackgroundColor)) normalizedConfig.mobileTagBackgroundColor = "transparent";
  }

  if (widget?.type === "ad_banner") {
    if (isLegacyLightToken(normalizedConfig.emptyStateBgColor)) normalizedConfig.emptyStateBgColor = "transparent";
    if (isLegacyLightToken(normalizedConfig.tabletEmptyStateBgColor)) normalizedConfig.tabletEmptyStateBgColor = "transparent";
    if (isLegacyLightToken(normalizedConfig.mobileEmptyStateBgColor)) normalizedConfig.mobileEmptyStateBgColor = "transparent";
  }

  if (widget?.type === "sidebar_widget" || widget?.type === "tag_cloud" || widget?.type === "ad_banner") {
    if (isLegacyLightToken(normalizedConfig.boxColor)) normalizedConfig.boxColor = "transparent";
    if (isLegacyLightToken(normalizedConfig.tabletBoxColor)) normalizedConfig.tabletBoxColor = "transparent";
    if (isLegacyLightToken(normalizedConfig.mobileBoxColor)) normalizedConfig.mobileBoxColor = "transparent";

    const hasCustomBoxBg =
      (typeof normalizedConfig.backgroundImage === "string" && normalizedConfig.backgroundImage.trim() !== "") ||
      (typeof normalizedConfig.tabletBackgroundImage === "string" && normalizedConfig.tabletBackgroundImage.trim() !== "") ||
      (typeof normalizedConfig.mobileBackgroundImage === "string" && normalizedConfig.mobileBackgroundImage.trim() !== "");

    const hasExplicitBoxColor =
      (!isLegacyLightToken(normalizedConfig.boxColor) && !isTransparentLikeToken(normalizedConfig.boxColor)) ||
      (!isLegacyLightToken(normalizedConfig.tabletBoxColor) && !isTransparentLikeToken(normalizedConfig.tabletBoxColor)) ||
      (!isLegacyLightToken(normalizedConfig.mobileBoxColor) && !isTransparentLikeToken(normalizedConfig.mobileBoxColor));

    if (!hasCustomBoxBg && !hasExplicitBoxColor) {
      normalizedConfig.useBox = false;
      normalizedConfig.tabletUseBox = false;
      normalizedConfig.mobileUseBox = false;
    }
  }

  const mergedWidget = {
    ...widget,
    config: normalizedConfig,
  };

  const inheritedSidebarLocation = typeof widget?.config?.inheritedSidebarLocation === "string" && widget.config.inheritedSidebarLocation.trim() !== ""
    ? widget.config.inheritedSidebarLocation
    : (typeof widget?.inheritedSidebarLocation === "string" && widget.inheritedSidebarLocation.trim() !== ""
        ? widget.inheritedSidebarLocation
        : null);
  const isSidebarAuxiliaryWidget =
    widget?.type === "sidebar_widget" ||
    widget?.type === "tag_cloud" ||
    widget?.type === "ad_banner";
  const effectiveRenderContext =
    widget?.config?.inheritedSidebarSource === true && inheritedSidebarLocation
      ? getWidgetRenderContextFromBuilderLocation(inheritedSidebarLocation === "archive" ? "archive" : "home")
      : isSidebarAuxiliaryWidget && (renderContext === "single-post" || renderContext === "archive")
        ? getWidgetRenderContextFromBuilderLocation(renderContext === "archive" ? "archive" : "home")
      : renderContext;

  const defaults = resolveWidgetStyleDefaults(setting, effectiveRenderContext);
  const accentColor = defaults.accentColor;
  const globalBorderRadius = defaults.borderRadius;

  return (
    <div
      data-sidebar-debug-root="true"
      data-render-context={renderContext}
      data-widget-id={String(widget?.id || "")}
      data-widget-type={String(widget?.type || "")}
      data-source-location={String(widget?.config?.inheritedSidebarLocation || widget?.inheritedSidebarLocation || "home")}
      data-effective-render-context={effectiveRenderContext}
      className={`public-theme relative group/widget ${getResponsiveHideClass(mergedWidget?.config)}`.trim()}
      style={{
        background: "transparent",
        backgroundColor: "transparent",
        "--accent": accentColor,
        "--border": defaults.borderColor,
        "--bg-surface": defaults.surfaceColor,
        "--bg-elevated": defaults.elevatedColor,
        "--muted-text": defaults.mutedTextColor,
        "--home-hover-color": defaults.hoverColor,
        "--home-main-box-radius": globalBorderRadius,
        "--home-widget-title-color": defaults.widgetTitleColor,
        "--home-news-title-color": defaults.newsTitleColor,
        "--home-excerpt-color": defaults.excerptColor,
        "--home-meta-color": defaults.metaColor,
        "--home-widget-title-size": defaults.widgetTitleFontSize,
        "--home-widget-title-weight": defaults.widgetTitleFontWeight,
        "--home-widget-title-font": defaults.widgetTitleFont,
        "--home-widget-title-synthesis": defaults.widgetTitleFontSynthesis,
        "--home-news-title-size": defaults.newsTitleFontSize,
        "--home-news-title-weight": defaults.newsTitleFontWeight,
        "--home-news-title-font": defaults.newsTitleFont,
        "--home-news-title-synthesis": defaults.newsTitleFontSynthesis,
        "--home-excerpt-size": defaults.excerptFontSize,
        "--home-excerpt-weight": defaults.excerptFontWeight,
        "--home-excerpt-font": defaults.excerptFont,
        "--home-excerpt-synthesis": defaults.excerptFontSynthesis,
        "--home-meta-size": defaults.metaFontSize,
        "--home-meta-weight": defaults.metaFontWeight,
        "--home-meta-font": defaults.metaFont,
        "--home-meta-synthesis": defaults.metaFontSynthesis,
        "--post-badge-bg-color": defaults.postBadgeBgColor,
        "--post-badge-text-color": defaults.postBadgeTextColor,
        "--post-link-hover-color": defaults.postLinkHoverColor,
      } as React.CSSProperties}
    >
      <Component
        key={widget?.id}
        block={mergedWidget}
        posts={widgetData}
        categories={categories}
        customTitle={displayTitle}
        accentColor={accentColor}
        borderRadius={globalBorderRadius}
      />
    </div>
  );
}
