// src/themes/pranala/templates/Homepage.tsx

import React from "react";
import { PRANALA_BLOCKS } from "../blocks/registry";
import Section from "../blocks/Section"; // Direct import to ensure it works
import Header from "../components/Header";
import Footer from "../components/Footer";
import { resolveBlockTypeAlias } from "@/lib/block-registry";
import {
    resolveThemeFontFamily,
    resolveThemeFontSynthesis,
} from "@/lib/font-utils";
import { resolveSectionChildrenWithSidebarSource } from "@/lib/sidebar-reference";
import SidebarWidgetRenderer from "../components/SidebarWidgetRenderer";
import SidebarDebugPanel from "../components/SidebarDebugPanel";

interface HomepageProps {
  data: {
    blocks: any[];
    posts: any[];
    categories: any[];
    setting?: any;
    blockData?: Record<string, any[]>;
    sourceBlocksByLocation?: Record<string, any[]>;
    menusByLocation?: any;
    headerConfig?: any;
    footerConfig?: any;
  };
}

// === HELPER FUNCTIONS ===

// 1. Get Column Span Class (Explicit Strings for Tailwind JIT)
const getColSpan = (width: number) => {
    switch(width) {
        case 1: return "md:col-span-1";
        case 2: return "md:col-span-2";
        case 3: return "md:col-span-3";
        case 4: return "md:col-span-4";
        case 5: return "md:col-span-5";
        case 6: return "md:col-span-6";
        case 7: return "md:col-span-7";
        case 8: return "md:col-span-8";
        case 9: return "md:col-span-9";
        case 10: return "md:col-span-10";
        case 11: return "md:col-span-11";
        case 12: return "md:col-span-12";
        default: return "md:col-span-12";
    }
};

// 2. Parse Layout String (e.g. "66-33") to Widths array [8, 4]
const parseLayout = (layoutStr: string = "100"): number[] => {
    switch(layoutStr) {
        case "100": return [12];
        case "50-50": return [6, 6];
        case "33-66": return [4, 8];
        case "66-33": return [8, 4];
        case "33-33-33": return [4, 4, 4];
        case "25-25-25-25": return [3, 3, 3, 3];
        default: return [12];
    }
};

const isTruthy = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";

const getResponsiveHideClass = (config: any) => {
    const classes: string[] = [];
    if (isTruthy(config?.hideOnDesktop)) classes.push("hide-desktop-widget");
    if (isTruthy(config?.hideOnTablet)) classes.push("hide-tablet-widget");
    if (isTruthy(config?.hideOnMobile)) classes.push("hide-mobile-widget");
    return classes.join(" ");
};

const getResponsiveValue = (config: any, key: string, device: "desktop" | "tablet" | "mobile") => {
    if (device === "desktop") return config?.[key];
    const responsiveKey = `${device}${key.charAt(0).toUpperCase() + key.slice(1)}`;
    return config?.[responsiveKey] ?? config?.[key];
};

const formatSpacing = (value: unknown): string | undefined => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
        return trimmed;
    }
    return undefined;
};

const resolvePublicFont = (font: unknown, fallback = "inherit") => {
    const value = typeof font === "string" ? font.trim() : "";
    if (!value) return fallback;
    return resolveThemeFontFamily(value, fallback);
};

export default function PranalaHomepage({ data }: HomepageProps) {
  const { blocks, posts, categories, setting, blockData } = data;
  const siteName = setting?.siteName || "Pranala News";
  const logoUrl = setting?.logoUrl;

  // Global Settings Extraction
  const sectionGap = setting?.sectionGap || "32px";
  const widgetGap = setting?.widgetGap || "24px";
  const homeTitleColor = setting?.homeTitleColor || "#1e293b";
  const homeTitleFontSize = setting?.homeTitleFontSize || "24px";
  const homeTitleFontWeight = setting?.homeTitleFontWeight || "700";
  const homeBackgroundColor = setting?.globalBackgroundColor || setting?.homeBackgroundColor || "#ffffff"; // Use global as priority
  const containerWidth = setting?.homeContainerWidth === "full" ? "100%" : (setting?.homeCustomContainerWidth ? `${setting.homeCustomContainerWidth}px` : "1200px");

  // New Color Settings
  const homeWidgetTitleColor = setting?.homeWidgetTitleColor || "#1e293b";
  const homeNewsTitleColor = setting?.homeNewsTitleColor || "#111827";
  const homeHoverColor = setting?.homeHoverColor || "#2563eb";
  const homeExcerptColor = setting?.homeExcerptColor || "#4b5563";
  const homeMetaColor = setting?.homeMetaColor || "#9ca3af";
  const borderColor = setting?.globalBorderColor || "#e5e7eb";
  const surfaceColor = setting?.globalSurfaceColor || "#f9fafb";
  const elevatedColor = setting?.globalElevatedColor || "#ffffff";
  const mutedTextColor = setting?.globalMutedTextColor || homeMetaColor || "#9ca3af";

  const mainBoxRadius = setting?.globalBorderRadius ? setting.globalBorderRadius : 
                        (setting?.homeMainColumnBorderRadius === 'none' ? '0' : 
                        setting?.homeMainColumnBorderRadius === 'sm' ? '0.125rem' :
                        setting?.homeMainColumnBorderRadius === 'md' ? '0.375rem' :
                        setting?.homeMainColumnBorderRadius === 'lg' ? '0.5rem' :
                        setting?.homeMainColumnBorderRadius === 'xl' ? '0.75rem' :
                        setting?.homeMainColumnBorderRadius === '2xl' ? '1rem' : '0.75rem');

  // Inject CSS Variables for Global Usage (Helper)
  // We attach these to the root style as well, but sometimes components need them explicitly
  const globalBorderRadius = mainBoxRadius;
  const homeWidgetTitleFontValue = setting?.homeWidgetTitleFont || "Inter";
  const homeNewsTitleFontValue = setting?.homeNewsTitleFont || "Inter";
  const homeExcerptFontValue = setting?.homeExcerptFont || "Inter";
  const homeMetaFontValue = setting?.homeMetaFont || "Inter";
  const homeWidgetTitleFont = resolvePublicFont(homeWidgetTitleFontValue, "Inter");
  const homeNewsTitleFont = resolvePublicFont(homeNewsTitleFontValue, "Inter");
  const homeExcerptFont = resolvePublicFont(homeExcerptFontValue, "Inter");
  const homeMetaFont = resolvePublicFont(homeMetaFontValue, "Inter");
  const homeWidgetTitleSynthesis = resolveThemeFontSynthesis(homeWidgetTitleFontValue);
  const homeNewsTitleSynthesis = resolveThemeFontSynthesis(homeNewsTitleFontValue);
  const homeExcerptSynthesis = resolveThemeFontSynthesis(homeExcerptFontValue);
  const homeMetaSynthesis = resolveThemeFontSynthesis(homeMetaFontValue);

  // === RENDERER ENGINE ===

  const renderWidgetWithSpacing = (
      widget: any,
      content: React.ReactNode,
      growClass = "",
      directions?: { mobile?: string; tablet?: string; desktop?: string }
  ) => {
      if (!widget) return null;
      const normalizeAlign = (val: any) => (val === "center" || val === "right" || val === "left" ? val : "left");
      const normalizeVAlign = (val: any) => (val === "bottom" ? "bottom" : val === "center" || val === "middle" ? "center" : "top");
      const toSelf = (val: string, prefix = "") => (val === "center" ? `${prefix}self-center` : val === "bottom" ? `${prefix}self-end` : `${prefix}self-start`);
      const config = widget?.config || {};

      const vAlignDesktopRaw = getResponsiveValue(config, "verticalAlign", "desktop") ?? config.verticalAlign;
      const vAlignTabletRaw = getResponsiveValue(config, "verticalAlign", "tablet") ?? vAlignDesktopRaw;
      const vAlignMobileRaw = getResponsiveValue(config, "verticalAlign", "mobile") ?? vAlignTabletRaw;
      const selfAlignMobile = directions?.mobile === "horizontal" ? toSelf(normalizeVAlign(vAlignMobileRaw)) : "";
      const selfAlignTablet = directions?.tablet === "horizontal" ? toSelf(normalizeVAlign(vAlignTabletRaw), "md:") : "";
      const selfAlignDesktop = directions?.desktop === "horizontal" ? toSelf(normalizeVAlign(vAlignDesktopRaw), "lg:") : "";
      const selfAlignClass = `${selfAlignMobile} ${selfAlignTablet} ${selfAlignDesktop}`.trim();

      const alignD = normalizeAlign(getResponsiveValue(config, "textAlign", "desktop") ?? config.textAlign);
      const alignT = normalizeAlign(getResponsiveValue(config, "textAlign", "tablet") ?? alignD);
      const alignM = normalizeAlign(getResponsiveValue(config, "textAlign", "mobile") ?? alignT);

      const verticalAlignD = normalizeVAlign(vAlignDesktopRaw);
      const verticalAlignT = normalizeVAlign(vAlignTabletRaw);
      const verticalAlignM = normalizeVAlign(vAlignMobileRaw);

      const mtD = formatSpacing(getResponsiveValue(config, "marginTop", "desktop")) ?? "0px";
      const mrD = formatSpacing(getResponsiveValue(config, "marginRight", "desktop")) ?? "0px";
      const mbD = formatSpacing(getResponsiveValue(config, "marginBottom", "desktop")) ?? "0px";
      const mlD = formatSpacing(getResponsiveValue(config, "marginLeft", "desktop")) ?? "0px";
      const ptD = formatSpacing(getResponsiveValue(config, "paddingTop", "desktop")) ?? "0px";
      const prD = formatSpacing(getResponsiveValue(config, "paddingRight", "desktop")) ?? "0px";
      const pbD = formatSpacing(getResponsiveValue(config, "paddingBottom", "desktop")) ?? "0px";
      const plD = formatSpacing(getResponsiveValue(config, "paddingLeft", "desktop")) ?? "0px";

      const mtT = formatSpacing(getResponsiveValue(config, "marginTop", "tablet")) ?? mtD;
      const mrT = formatSpacing(getResponsiveValue(config, "marginRight", "tablet")) ?? mrD;
      const mbT = formatSpacing(getResponsiveValue(config, "marginBottom", "tablet")) ?? mbD;
      const mlT = formatSpacing(getResponsiveValue(config, "marginLeft", "tablet")) ?? mlD;
      const ptT = formatSpacing(getResponsiveValue(config, "paddingTop", "tablet")) ?? ptD;
      const prT = formatSpacing(getResponsiveValue(config, "paddingRight", "tablet")) ?? prD;
      const pbT = formatSpacing(getResponsiveValue(config, "paddingBottom", "tablet")) ?? pbD;
      const plT = formatSpacing(getResponsiveValue(config, "paddingLeft", "tablet")) ?? plD;

      const mtM = formatSpacing(getResponsiveValue(config, "marginTop", "mobile")) ?? mtT;
      const mrM = formatSpacing(getResponsiveValue(config, "marginRight", "mobile")) ?? mrT;
      const mbM = formatSpacing(getResponsiveValue(config, "marginBottom", "mobile")) ?? mbT;
      const mlM = formatSpacing(getResponsiveValue(config, "marginLeft", "mobile")) ?? mlT;
      const ptM = formatSpacing(getResponsiveValue(config, "paddingTop", "mobile")) ?? ptT;
      const prM = formatSpacing(getResponsiveValue(config, "paddingRight", "mobile")) ?? prT;
      const pbM = formatSpacing(getResponsiveValue(config, "paddingBottom", "mobile")) ?? pbT;
      const plM = formatSpacing(getResponsiveValue(config, "paddingLeft", "mobile")) ?? plT;

      const mtDPos = verticalAlignD === "bottom" || verticalAlignD === "center" ? "auto" : mtD;
      const mtTPos = verticalAlignT === "bottom" || verticalAlignT === "center" ? "auto" : mtT;
      const mtMPos = verticalAlignM === "bottom" || verticalAlignM === "center" ? "auto" : mtM;
      const mbDPos = verticalAlignD === "center" ? "auto" : mbD;
      const mbTPos = verticalAlignT === "center" ? "auto" : mbT;
      const mbMPos = verticalAlignM === "center" ? "auto" : mbM;

      const usesSelfManagedFrame = widget?.type === "news_grid_slider";
      const styleVars: React.CSSProperties = {
          ["--hw-ta-d" as any]: alignD,
          ["--hw-ta-t" as any]: alignT,
          ["--hw-ta-m" as any]: alignM,
          ["--hw-mt-d" as any]: usesSelfManagedFrame ? "0px" : mtDPos,
          ["--hw-mt-t" as any]: usesSelfManagedFrame ? "0px" : mtTPos,
          ["--hw-mt-m" as any]: usesSelfManagedFrame ? "0px" : mtMPos,
          ["--hw-mr-d" as any]: usesSelfManagedFrame ? "0px" : mrD,
          ["--hw-mr-t" as any]: usesSelfManagedFrame ? "0px" : mrT,
          ["--hw-mr-m" as any]: usesSelfManagedFrame ? "0px" : mrM,
          ["--hw-mb-d" as any]: usesSelfManagedFrame ? "0px" : mbDPos,
          ["--hw-mb-t" as any]: usesSelfManagedFrame ? "0px" : mbTPos,
          ["--hw-mb-m" as any]: usesSelfManagedFrame ? "0px" : mbMPos,
          ["--hw-ml-d" as any]: usesSelfManagedFrame ? "0px" : mlD,
          ["--hw-ml-t" as any]: usesSelfManagedFrame ? "0px" : mlT,
          ["--hw-ml-m" as any]: usesSelfManagedFrame ? "0px" : mlM,
          ["--hw-pt-d" as any]: usesSelfManagedFrame ? "0px" : ptD,
          ["--hw-pt-t" as any]: usesSelfManagedFrame ? "0px" : ptT,
          ["--hw-pt-m" as any]: usesSelfManagedFrame ? "0px" : ptM,
          ["--hw-pr-d" as any]: usesSelfManagedFrame ? "0px" : prD,
          ["--hw-pr-t" as any]: usesSelfManagedFrame ? "0px" : prT,
          ["--hw-pr-m" as any]: usesSelfManagedFrame ? "0px" : prM,
          ["--hw-pb-d" as any]: usesSelfManagedFrame ? "0px" : pbD,
          ["--hw-pb-t" as any]: usesSelfManagedFrame ? "0px" : pbT,
          ["--hw-pb-m" as any]: usesSelfManagedFrame ? "0px" : pbM,
          ["--hw-pl-d" as any]: usesSelfManagedFrame ? "0px" : plD,
          ["--hw-pl-t" as any]: usesSelfManagedFrame ? "0px" : plT,
          ["--hw-pl-m" as any]: usesSelfManagedFrame ? "0px" : plM,
      };

      return (
          <div
            key={widget.id}
            style={styleVars}
            className={`min-w-0 ${growClass} ${selfAlignClass} [text-align:var(--hw-ta-m)] md:[text-align:var(--hw-ta-t)] lg:[text-align:var(--hw-ta-d)] mt-[var(--hw-mt-m)] mr-[var(--hw-mr-m)] mb-[var(--hw-mb-m)] ml-[var(--hw-ml-m)] pt-[var(--hw-pt-m)] pr-[var(--hw-pr-m)] pb-[var(--hw-pb-m)] pl-[var(--hw-pl-m)] md:mt-[var(--hw-mt-t)] md:mr-[var(--hw-mr-t)] md:mb-[var(--hw-mb-t)] md:ml-[var(--hw-ml-t)] md:pt-[var(--hw-pt-t)] md:pr-[var(--hw-pr-t)] md:pb-[var(--hw-pb-t)] md:pl-[var(--hw-pl-t)] lg:mt-[var(--hw-mt-d)] lg:mr-[var(--hw-mr-d)] lg:mb-[var(--hw-mb-d)] lg:ml-[var(--hw-ml-d)] lg:pt-[var(--hw-pt-d)] lg:pr-[var(--hw-pr-d)] lg:pb-[var(--hw-pb-d)] lg:pl-[var(--hw-pl-d)]`.trim()}
          >
            {content}
          </div>
      );
  };

  const renderWidget = (widget: any) => {
      const effectiveType = resolveBlockTypeAlias(widget?.type);
      const blockDef = PRANALA_BLOCKS[effectiveType]; // Use PRANALA_BLOCKS
      if (!blockDef) return <div className="p-4 text-xs text-red-500 bg-red-50 border border-red-200 rounded">Widget Unknown: {widget.type}</div>;

      if (widget.type === "sidebar_widget" || widget.type === "tag_cloud" || widget.type === "ad_banner") {
          const sourceWidgetId = widget?.config?.sourceWidgetId || widget?.sourceWidgetId;
          const widgetData = blockData && (blockData[widget.id] || (sourceWidgetId ? blockData[sourceWidgetId] : undefined))
            ? (blockData[widget.id] || (sourceWidgetId ? blockData[sourceWidgetId] : undefined))
            : posts;
          return (
              <SidebarWidgetRenderer
                  widget={widget}
                  widgetData={widgetData}
                  categories={categories}
                  setting={setting}
                  renderContext="homepage"
              />
          );
      }

      const Component = blockDef.component as React.ComponentType<Record<string, unknown>>;
      
      // Data: Prefer block-specific data, fallback to global posts
      const sourceWidgetId = widget?.config?.sourceWidgetId || widget?.sourceWidgetId;
      const widgetData = blockData && (blockData[widget.id] || (sourceWidgetId ? blockData[sourceWidgetId] : undefined))
        ? (blockData[widget.id] || (sourceWidgetId ? blockData[sourceWidgetId] : undefined))
        : posts;
      
      // TITLE LOGIC
      const displayTitle = (widget.title && widget.title.trim() !== "") 
          ? widget.title 
          : (widget.config?.title || "");
      
      const mergedConfig = {
          ...widget.config,
          title: displayTitle
      };
      
      const mergedWidget = { ...widget, type: effectiveType, config: mergedConfig };

      // Explicitly pass global accent color to widget
      const accentColor = setting?.globalAccentColor || setting?.accentColor || '#f59e0b';
      
      // Inject global hover color if available
      const globalHoverColor = homeHoverColor || accentColor;

      return (
          <div 
            className={`relative group/widget ${getResponsiveHideClass(mergedWidget?.config)}`}
            style={{ 
                '--home-hover-color': globalHoverColor,
                '--home-main-box-radius': globalBorderRadius // Inject global border radius
            } as React.CSSProperties}
          >
              <Component 
                  key={widget.id}
                  block={mergedWidget}
                  posts={widgetData}
                  categories={categories}
                  customTitle={displayTitle}
                  accentColor={accentColor}
                  borderRadius={globalBorderRadius} // Pass as prop too
              />
          </div>
      );
  };

  const renderSection = (section: any, isNested = false) => {
      // Use direct Section component to guarantee functionality
      const SectionComponent = Section;
      
      const config = section.config || {};
      const layout = config.layout || "100";
      const colWidths = parseLayout(layout);
      
      const rawChildren = resolveSectionChildrenWithSidebarSource(section, data.sourceBlocksByLocation, "home");
      
      // Group children by Column Index
      const columns: any[][] = Array(colWidths.length).fill(null).map(() => []);
      
      rawChildren.forEach((child: any) => {
          const colIndex = child.config?.columnIndex !== undefined ? child.config.columnIndex : 0;
          if (columns[colIndex]) {
              columns[colIndex].push(child);
          } else {
              // Fallback if index out of bounds
              if (columns.length > 0) columns[0].push(child);
          }
      });

      // Render Columns Content
      const renderedColumns = columns.map((widgets, index) => {
          const colSpan = getColSpan(colWidths[index]);
          
          const isTwoColumnLayout = colWidths.length === 2;
          const minWidth = isTwoColumnLayout ? Math.min(...colWidths) : 0;
          const sidebarIndex = isTwoColumnLayout ? colWidths.indexOf(minWidth) : -1;
          const isSidebarColumn = isTwoColumnLayout && minWidth <= 4 && index === sidebarIndex;
          const stickyClass = isSidebarColumn ? "md:sticky md:top-20 md:self-start md:h-fit" : "";
          const dirMobile = config.mobileChildrenDirection === "horizontal" ? "horizontal" : "vertical";
          const dirTablet = config.tabletChildrenDirection === "horizontal" ? "horizontal" : "vertical";
          const dirDesktop = config.childrenDirection === "horizontal" ? "horizontal" : "vertical";

          const alignMobile = config.mobileChildrenAlign === "right" ? "right" : config.mobileChildrenAlign === "center" ? "center" : "left";
          const alignTablet = config.tabletChildrenAlign === "right" ? "right" : config.tabletChildrenAlign === "center" ? "center" : "left";
          const alignDesktop = config.childrenAlign === "right" ? "right" : config.childrenAlign === "center" ? "center" : "left";

          const vAlignMobile = config.mobileChildrenVerticalAlign === "bottom" ? "bottom" : config.mobileChildrenVerticalAlign === "center" ? "center" : "top";
          const vAlignTablet = config.tabletChildrenVerticalAlign === "bottom" ? "bottom" : config.tabletChildrenVerticalAlign === "center" ? "center" : "top";
          const vAlignDesktop = config.childrenVerticalAlign === "bottom" ? "bottom" : config.childrenVerticalAlign === "center" ? "center" : "top";

          const sizeMobile = config.mobileChildrenSizing === "grow" ? "grow" : "auto";
          const sizeTablet = config.tabletChildrenSizing === "grow" ? "grow" : "auto";
          const sizeDesktop = config.childrenSizing === "grow" ? "grow" : "auto";

          const directionClassMobile = dirMobile === "horizontal" ? "flex-row flex-wrap" : "flex-col";
          const directionClassTablet = dirTablet === "horizontal" ? "md:flex-row md:flex-wrap" : "md:flex-col";
          const directionClassDesktop = dirDesktop === "horizontal" ? "lg:flex-row lg:flex-wrap" : "lg:flex-col";

          const crossClassMobile = dirMobile === "horizontal"
            ? (vAlignMobile === "center" ? "items-center" : vAlignMobile === "bottom" ? "items-end" : "items-start")
            : (vAlignMobile === "center" ? "justify-center" : vAlignMobile === "bottom" ? "justify-end" : "justify-start");
          const crossClassTablet = dirTablet === "horizontal"
            ? (vAlignTablet === "center" ? "md:items-center" : vAlignTablet === "bottom" ? "md:items-end" : "md:items-start")
            : (vAlignTablet === "center" ? "md:justify-center" : vAlignTablet === "bottom" ? "md:justify-end" : "md:justify-start");
          const crossClassDesktop = dirDesktop === "horizontal"
            ? (vAlignDesktop === "center" ? "lg:items-center" : vAlignDesktop === "bottom" ? "lg:items-end" : "lg:items-start")
            : (vAlignDesktop === "center" ? "lg:justify-center" : vAlignDesktop === "bottom" ? "lg:justify-end" : "lg:justify-start");

          const alignClassMobile = dirMobile === "horizontal"
            ? (alignMobile === "center" ? "justify-center" : alignMobile === "right" ? "justify-end" : "justify-start")
            : `items-stretch ${alignMobile === "center" ? "text-center" : alignMobile === "right" ? "text-right" : "text-left"}`;
          const alignClassTablet = dirTablet === "horizontal"
            ? (alignTablet === "center" ? "md:justify-center" : alignTablet === "right" ? "md:justify-end" : "md:justify-start")
            : `md:items-stretch ${alignTablet === "center" ? "md:text-center" : alignTablet === "right" ? "md:text-right" : "md:text-left"}`;
          const alignClassDesktop = dirDesktop === "horizontal"
            ? (alignDesktop === "center" ? "lg:justify-center" : alignDesktop === "right" ? "lg:justify-end" : "lg:justify-start")
            : `lg:items-stretch ${alignDesktop === "center" ? "lg:text-center" : alignDesktop === "right" ? "lg:text-right" : "lg:text-left"}`;

          const itemClass = [
            dirMobile === "horizontal" && sizeMobile === "grow" ? "flex-1 basis-0 min-w-0" : "",
            dirTablet === "horizontal" && sizeTablet === "grow" ? "md:flex-1 md:basis-0 md:min-w-0" : "",
            dirDesktop === "horizontal" && sizeDesktop === "grow" ? "lg:flex-1 lg:basis-0 lg:min-w-0" : "",
          ].filter(Boolean).join(" ");

          return (
              <div
                key={index}
                className={`${colSpan} section-column flex ${directionClassMobile} ${alignClassMobile} ${crossClassMobile} ${directionClassTablet} ${alignClassTablet} ${crossClassTablet} ${directionClassDesktop} ${alignClassDesktop} ${crossClassDesktop} ${stickyClass} gap-[var(--sec-wgap-m)] md:gap-[var(--sec-wgap-t)] lg:gap-[var(--sec-wgap-d)]`.trim()}
              >
                  {widgets.map((widget: any) =>
                      renderWidgetWithSpacing(
                          widget,
                          widget.type === "section" ? renderSection(widget, true) : renderWidget(widget),
                                  itemClass,
                                  { mobile: dirMobile, tablet: dirTablet, desktop: dirDesktop }
                      )
                  )}
              </div>
          );
      });

      return (
          <div key={section.id} className={getResponsiveHideClass(config)}>
              <SectionComponent 
                  block={section}
                  layout={layout}
                  colWidths={colWidths}
                  isNested={isNested}
              >
                  {renderedColumns}
              </SectionComponent>
          </div>
      );
  };

  return (
    <div 
        className="public-theme public-homepage min-h-screen flex flex-col font-sans text-gray-900"
        style={{ 
            backgroundColor: 'var(--bg-color)',
            // CSS Variables Injection
            '--section-gap': sectionGap,
            '--widget-gap': widgetGap,
            '--home-title-color': homeTitleColor,
            '--home-title-size': homeTitleFontSize,
            '--home-title-weight': homeTitleFontWeight,
            '--container-width': containerWidth,
            '--accent': setting?.globalAccentColor || setting?.accentColor || '#f59e0b',
            '--border': borderColor,
            '--bg-surface': surfaceColor,
            '--bg-elevated': elevatedColor,
            '--muted-text': mutedTextColor,
            
            // New Colors
            '--home-widget-title-color': homeWidgetTitleColor,
            '--home-news-title-color': homeNewsTitleColor,
            '--home-hover-color': homeHoverColor,
            '--home-excerpt-color': homeExcerptColor,
            '--home-meta-color': homeMetaColor,
            '--global-bg-color': homeBackgroundColor,
            '--home-main-box-radius': globalBorderRadius,

            // Typography
            '--home-widget-title-size': setting?.homeWidgetTitleFontSize || "24px",
            '--home-widget-title-weight': setting?.homeWidgetTitleFontWeight || "700",
            '--home-widget-title-font': homeWidgetTitleFont,
            '--home-widget-title-synthesis': homeWidgetTitleSynthesis,
            '--home-news-title-size': setting?.homeNewsTitleFontSize || "18px",
            '--home-news-title-weight': setting?.homeNewsTitleFontWeight || "600",
            '--home-news-title-font': homeNewsTitleFont,
            '--home-news-title-synthesis': homeNewsTitleSynthesis,
            '--home-excerpt-size': setting?.homeExcerptFontSize || "14px",
            '--home-excerpt-weight': setting?.homeExcerptFontWeight || "400",
            '--home-excerpt-font': homeExcerptFont,
            '--home-excerpt-synthesis': homeExcerptSynthesis,
            '--home-meta-size': setting?.homeMetaFontSize || "12px",
            '--home-meta-weight': setting?.homeMetaFontWeight || "500",
            '--home-meta-font': homeMetaFont,
            '--home-meta-synthesis': homeMetaSynthesis,
            
            // Default Box Styles (Fallback)
            '--box-bg': 'transparent',
            '--box-radius': '0',
            '--box-shadow': 'none',
            '--box-border': 'none',
            '--box-padding': '0'
        } as React.CSSProperties}
    >
      <Header
        siteName={siteName}
        logoUrl={logoUrl}
        categories={categories || []}
        primaryMenu={data.menusByLocation?.PRIMARY}
        secondaryMenu={data.menusByLocation?.SECONDARY}
        mobileMenu={data.menusByLocation?.MOBILE}
        headerConfig={data.headerConfig}
      />
      <SidebarDebugPanel pageKind="homepage" />

      <main className="flex-grow">
        {(!blocks || blocks.length === 0) ? (
             <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Selamat Datang di {siteName}</h1>
                <p className="text-lg text-gray-600 mb-8">Homepage belum dikonfigurasi. Silakan tambahkan blok melalui Admin Panel.</p>
                <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl bg-white max-w-2xl mx-auto">
                    <p className="text-gray-400">Area Konten (Blocks)</p>
                </div>
            </div>
        ) : (
            <div className="flex flex-col">
                {blocks.map((block) => {
                    // Top Level Blocks (usually Sections or Full Width Widgets)
                    if (block.type === 'section') {
                        return renderSection(block);
                    } else {
                        // Standalone widget (outside section)
                        return (
                            <div key={block.id} className="container mx-auto px-4" style={{ maxWidth: 'var(--container-width)' }}>
                                {renderWidget(block)}
                            </div>
                        );
                    }
                })}
            </div>
        )}
      </main>

      <Footer siteName={siteName} logoUrl={logoUrl} categories={data.categories} footerConfig={data.footerConfig} menusByLocation={data.menusByLocation} setting={data.setting} />
    </div>
  );
}
