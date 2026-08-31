// src/themes/classic/templates/Homepage.tsx

import React from "react";
import { resolveThemeFontFamily } from "@/lib/font-utils";
import { sanitizeCssUrl } from "@/lib/sanitizer";
import { CLASSIC_BLOCKS } from "../blocks/registry";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface HomepageProps {
  data: {
    blocks: any[];
    posts: any[];
    categories: any[];
    setting?: any;
    blockData?: Record<string, any[]>;
    footerConfig?: any;
    menusByLocation?: any;
  };
}

// === HELPER FUNCTIONS ===

// 2. Parse Layout String (e.g. "66-33") to Widths array [8, 4]
const parseLayout = (layoutStr: string = "100"): number[] => {
    // Normalize string (handle 66/33 vs 66-33)
    const normalized = layoutStr.replace(/\//g, '-');
    
    switch(normalized) {
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

export default function ClassicHomepage({ data }: HomepageProps) {
  const { blocks, posts, categories, setting, blockData } = data;
  const siteName = setting?.siteName || "Portal Berita";
  const logoUrl = setting?.logoUrl;

  // Global Settings Extraction
  const sectionGap = setting?.sectionGap || "32px";
  const widgetGap = setting?.widgetGap || "24px";
  const homeTitleColor = setting?.homeTitleColor || "#1e293b";
  const homeTitleFontSize = setting?.homeTitleFontSize || "24px";
  const homeTitleFontWeight = setting?.homeTitleFontWeight || "700";
  const containerWidth = setting?.homeContainerWidth === "full" ? "100%" : (setting?.homeCustomContainerWidth ? `${setting.homeCustomContainerWidth}px` : "1250px");

  // New Color Settings
  const homeWidgetTitleColor = setting?.homeWidgetTitleColor || "#1e293b";
  const homeNewsTitleColor = setting?.homeNewsTitleColor || "#111827";
  const homeHoverColor = setting?.homeHoverColor || "#2563eb";
  const homeExcerptColor = setting?.homeExcerptColor || "#4b5563";
  const homeMetaColor = setting?.homeMetaColor || "#9ca3af";

  // Box Styles
  const mainBoxEnabled = setting?.homeMainColumnBox !== false; // Default true if undefined? Schema says default false. Let's trust schema default.
  const sidebarBoxEnabled = setting?.homeSidebarColumnBox !== false;
  
  const mainBoxBg = setting?.homeMainColumnColor || "#ffffff";
  const sidebarBoxBg = setting?.homeSidebarColumnColor || "#ffffff";
  
  const mainBoxRadius = setting?.homeMainColumnBorderRadius === 'none' ? '0' : 
                        setting?.homeMainColumnBorderRadius === 'sm' ? '0.125rem' :
                        setting?.homeMainColumnBorderRadius === 'md' ? '0.375rem' :
                        setting?.homeMainColumnBorderRadius === 'lg' ? '0.5rem' :
                        setting?.homeMainColumnBorderRadius === 'xl' ? '0.75rem' :
                        setting?.homeMainColumnBorderRadius === '2xl' ? '1rem' : '0.75rem'; // Default xl

  const sidebarBoxRadius = setting?.homeSidebarColumnBorderRadius === 'none' ? '0' :
                           setting?.homeSidebarColumnBorderRadius === 'sm' ? '0.125rem' :
                           setting?.homeSidebarColumnBorderRadius === 'md' ? '0.375rem' :
                           setting?.homeSidebarColumnBorderRadius === 'lg' ? '0.5rem' :
                           setting?.homeSidebarColumnBorderRadius === 'xl' ? '0.75rem' :
                           setting?.homeSidebarColumnBorderRadius === '2xl' ? '1rem' : '0.75rem';
  const homeWidgetTitleFont = resolvePublicFont(setting?.homeWidgetTitleFont || "Inter", "Inter");
  const homeNewsTitleFont = resolvePublicFont(setting?.homeNewsTitleFont || "Inter", "Inter");
  const homeExcerptFont = resolvePublicFont(setting?.homeExcerptFont || "Inter", "Inter");
  const homeMetaFont = resolvePublicFont(setting?.homeMetaFont || "Inter", "Inter");

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

      const styleVars: React.CSSProperties = {
          ["--cw-ta-d" as any]: alignD,
          ["--cw-ta-t" as any]: alignT,
          ["--cw-ta-m" as any]: alignM,
          ["--cw-mt-d" as any]: mtDPos,
          ["--cw-mt-t" as any]: mtTPos,
          ["--cw-mt-m" as any]: mtMPos,
          ["--cw-mr-d" as any]: mrD,
          ["--cw-mr-t" as any]: mrT,
          ["--cw-mr-m" as any]: mrM,
          ["--cw-mb-d" as any]: mbDPos,
          ["--cw-mb-t" as any]: mbTPos,
          ["--cw-mb-m" as any]: mbMPos,
          ["--cw-ml-d" as any]: mlD,
          ["--cw-ml-t" as any]: mlT,
          ["--cw-ml-m" as any]: mlM,
          ["--cw-pt-d" as any]: ptD,
          ["--cw-pt-t" as any]: ptT,
          ["--cw-pt-m" as any]: ptM,
          ["--cw-pr-d" as any]: prD,
          ["--cw-pr-t" as any]: prT,
          ["--cw-pr-m" as any]: prM,
          ["--cw-pb-d" as any]: pbD,
          ["--cw-pb-t" as any]: pbT,
          ["--cw-pb-m" as any]: pbM,
          ["--cw-pl-d" as any]: plD,
          ["--cw-pl-t" as any]: plT,
          ["--cw-pl-m" as any]: plM,
      };

      return (
          <div
            key={widget.id}
            style={styleVars}
            className={`min-w-0 ${growClass} ${selfAlignClass} [text-align:var(--cw-ta-m)] md:[text-align:var(--cw-ta-t)] lg:[text-align:var(--cw-ta-d)] mt-[var(--cw-mt-m)] mr-[var(--cw-mr-m)] mb-[var(--cw-mb-m)] ml-[var(--cw-ml-m)] pt-[var(--cw-pt-m)] pr-[var(--cw-pr-m)] pb-[var(--cw-pb-m)] pl-[var(--cw-pl-m)] md:mt-[var(--cw-mt-t)] md:mr-[var(--cw-mr-t)] md:mb-[var(--cw-mb-t)] md:ml-[var(--cw-ml-t)] md:pt-[var(--cw-pt-t)] md:pr-[var(--cw-pr-t)] md:pb-[var(--cw-pb-t)] md:pl-[var(--cw-pl-t)] lg:mt-[var(--cw-mt-d)] lg:mr-[var(--cw-mr-d)] lg:mb-[var(--cw-mb-d)] lg:ml-[var(--cw-ml-d)] lg:pt-[var(--cw-pt-d)] lg:pr-[var(--cw-pr-d)] lg:pb-[var(--cw-pb-d)] lg:pl-[var(--cw-pl-d)]`.trim()}
          >
            {content}
          </div>
      );
  };

  const renderWidget = (widget: any) => {
      const blockDef = CLASSIC_BLOCKS[widget.type];
      if (!blockDef) return <div className="p-2 text-xs text-red-500 bg-red-50">Widget Unknown: {widget.type}</div>;

      const Component = blockDef.component as React.ComponentType<Record<string, unknown>>;
      
      // Data: Prefer block-specific data, fallback to global posts
      const widgetData = blockData && blockData[widget.id] ? blockData[widget.id] : posts;
      
      // TITLE LOGIC: User expects the Block Title (from Builder Card) to be the Display Title
      // Fallback to config.title only if block.title is missing
      const displayTitle = (widget.title && widget.title.trim() !== "") 
          ? widget.title 
          : (widget.config?.title || "");
      
      // Config: Merge title fallback
      const mergedConfig = {
          ...widget.config,
          title: displayTitle
      };
      
      const mergedWidget = { ...widget, config: mergedConfig };

      // Explicitly pass global accent color to widget
      const accentColor = setting?.globalAccentColor || setting?.accentColor || '#f59e0b';

      return (
          <div className={`relative group/widget-debug ${getResponsiveHideClass(mergedWidget?.config)}`}>
              <Component 
                  key={widget.id}
                  block={mergedWidget}
                  posts={widgetData}
                  categories={categories}
                  customTitle={displayTitle}
                  accentColor={accentColor}
              />
              {/* Debug Title Overlay on Hover (Dev Only) */}
              {process.env.NODE_ENV === 'development' && (
                  <div className="absolute top-0 right-0 opacity-0 group-hover/widget-debug:opacity-100 transition-opacity bg-black/80 text-white text-[9px] p-1 z-50 rounded-bl pointer-events-none">
                      Title: "{displayTitle}"<br/>
                      Src: {widget.config?.title ? 'Config' : 'Block Default'}
                  </div>
              )}
          </div>
      );
  };

  const renderSection = (section: any, isNested = false) => {
      const config = section.config || {};
      const layout = config.layout || "100";
      const colWidths = parseLayout(layout);
      
      // Get children (handle both Prisma object structure and JSON config structure)
      const rawChildren = config.children || section.children || [];

      const blockGapMobile = `${(Number(config.mobileBlockGap ?? config.blockGap ?? 6) || 0) * 0.25}rem`;
      const blockGapTablet = `${(Number(config.tabletBlockGap ?? config.blockGap ?? config.mobileBlockGap ?? 6) || 0) * 0.25}rem`;
      const blockGapDesktop = `${(Number(config.blockGap ?? config.tabletBlockGap ?? config.mobileBlockGap ?? 6) || 0) * 0.25}rem`;
      const columnGapMobile = `${(Number(config.mobileColumnGap ?? config.columnGap ?? 6) || 0) * 0.25}rem`;
      const columnGapTablet = `${(Number(config.tabletColumnGap ?? config.columnGap ?? config.mobileColumnGap ?? 6) || 0) * 0.25}rem`;
      const columnGapDesktop = `${(Number(config.columnGap ?? config.tabletColumnGap ?? config.mobileColumnGap ?? 6) || 0) * 0.25}rem`;
      
      // Group children by Column Index
      const columns: any[][] = Array(colWidths.length).fill(null).map(() => []);
      
      rawChildren.forEach((child: any) => {
          // Default to col 0 if undefined
          const colIndex = child.config?.columnIndex !== undefined ? child.config.columnIndex : 0;
          
          if (columns[colIndex]) {
              columns[colIndex].push(child);
          } else {
              // Safety: Push to last column if index out of bounds
              columns[columns.length - 1].push(child);
          }
      });

      const normalizeColor = (value: unknown, fallback: string) => {
          if (typeof value !== "string") return fallback;
          const trimmed = value.trim();
          if (!trimmed) return fallback;
          return trimmed;
      };
      const formatContainerSize = (val: unknown, fallback: string) => {
          if (typeof val === "number" && Number.isFinite(val)) return `${val}px`;
          if (typeof val === "string") {
              const trimmed = val.trim();
              if (!trimmed) return fallback;
              if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
              return trimmed;
          }
          return fallback;
      };
      const formatSpacing = (value: unknown): string | undefined => {
          if (value === undefined || value === null) return undefined;
          if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
          if (typeof value === "string") {
              const trimmed = value.trim();
              if (!trimmed) return undefined;
              if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
              return trimmed;
          }
          return undefined;
      };
      const getRadius = (r: string) => {
          switch (r) {
              case "sm": return "0.125rem";
              case "md": return "0.375rem";
              case "lg": return "0.5rem";
              case "xl": return "0.75rem";
              case "2xl": return "1rem";
              case "full": return "9999px";
              default: return "0";
          }
      };
      const getShadow = (s: string) => {
          switch (s) {
              case "sm": return "0 1px 2px 0 rgb(0 0 0 / 0.05)";
              case "md": return "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
              case "lg": return "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)";
              case "xl": return "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)";
              case "2xl": return "0 25px 50px -12px rgb(0 0 0 / 0.25)";
              case "inner": return "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
              default: return "none";
          }
      };

      const mtMobile = config.mobileMarginTop !== undefined ? `${config.mobileMarginTop}px` : "0px";
      const mtTablet = config.tabletMarginTop !== undefined ? `${config.tabletMarginTop}px` : mtMobile;
      const mtDesktop = config.marginTop !== undefined ? `${config.marginTop}px` : mtTablet;
      const mbMobile = config.mobileMarginBottom !== undefined ? `${config.mobileMarginBottom}px` : "0px";
      const mbTablet = config.tabletMarginBottom !== undefined ? `${config.tabletMarginBottom}px` : mbMobile;
      const mbDesktop = config.marginBottom !== undefined ? `${config.marginBottom}px` : mbTablet;
      const mlMobile = config.mobileMarginLeft !== undefined ? `${config.mobileMarginLeft}px` : "0px";
      const mlTablet = config.tabletMarginLeft !== undefined ? `${config.tabletMarginLeft}px` : mlMobile;
      const mlDesktop = config.marginLeft !== undefined ? `${config.marginLeft}px` : mlTablet;
      const mrMobile = config.mobileMarginRight !== undefined ? `${config.mobileMarginRight}px` : "0px";
      const mrTablet = config.tabletMarginRight !== undefined ? `${config.tabletMarginRight}px` : mrMobile;
      const mrDesktop = config.marginRight !== undefined ? `${config.marginRight}px` : mrTablet;

      const ptMobile = config.mobilePaddingTop !== undefined ? `${config.mobilePaddingTop}px` : "0px";
      const ptTablet = config.tabletPaddingTop !== undefined ? `${config.tabletPaddingTop}px` : ptMobile;
      const ptDesktop = config.paddingTop !== undefined ? `${config.paddingTop}px` : ptTablet;
      const pbMobile = config.mobilePaddingBottom !== undefined ? `${config.mobilePaddingBottom}px` : "0px";
      const pbTablet = config.tabletPaddingBottom !== undefined ? `${config.tabletPaddingBottom}px` : pbMobile;
      const pbDesktop = config.paddingBottom !== undefined ? `${config.paddingBottom}px` : pbTablet;
      const plMobile = config.mobilePaddingLeft !== undefined ? `${config.mobilePaddingLeft}px` : "0px";
      const plTablet = config.tabletPaddingLeft !== undefined ? `${config.tabletPaddingLeft}px` : plMobile;
      const plDesktop = config.paddingLeft !== undefined ? `${config.paddingLeft}px` : plTablet;
      const prMobile = config.mobilePaddingRight !== undefined ? `${config.mobilePaddingRight}px` : "0px";
      const prTablet = config.tabletPaddingRight !== undefined ? `${config.tabletPaddingRight}px` : prMobile;
      const prDesktop = config.paddingRight !== undefined ? `${config.paddingRight}px` : prTablet;

      const useBoxMobile = isTruthy(config.mobileUseBox ?? config.useBox);
      const useBoxTablet = isTruthy(config.tabletUseBox ?? config.useBox ?? config.mobileUseBox);
      const useBoxDesktop = isTruthy(config.useBox ?? config.tabletUseBox ?? config.mobileUseBox);

      const borderStyleValueMobile = String(config.mobileBorderStyle ?? config.borderStyle ?? "solid");
      const borderStyleValueTablet = String(config.tabletBorderStyle ?? config.borderStyle ?? borderStyleValueMobile);
      const borderStyleValueDesktop = String(config.borderStyle ?? borderStyleValueTablet);
      const borderColorValueMobile = String(config.mobileBorderColor ?? config.borderColor ?? "var(--border, #e5e7eb)");
      const borderColorValueTablet = String(config.tabletBorderColor ?? config.borderColor ?? borderColorValueMobile);
      const borderColorValueDesktop = String(config.borderColor ?? borderColorValueTablet);
      const btValueMobile = Number(config.mobileBorderTopWidth ?? config.borderTopWidth ?? 0);
      const bbValueMobile = Number(config.mobileBorderBottomWidth ?? config.borderBottomWidth ?? 0);
      const blValueMobile = Number(config.mobileBorderLeftWidth ?? config.borderLeftWidth ?? 0);
      const brValueMobile = Number(config.mobileBorderRightWidth ?? config.borderRightWidth ?? 0);
      const btValueTablet = Number(config.tabletBorderTopWidth ?? config.borderTopWidth ?? config.mobileBorderTopWidth ?? 0);
      const bbValueTablet = Number(config.tabletBorderBottomWidth ?? config.borderBottomWidth ?? config.mobileBorderBottomWidth ?? 0);
      const blValueTablet = Number(config.tabletBorderLeftWidth ?? config.borderLeftWidth ?? config.mobileBorderLeftWidth ?? 0);
      const brValueTablet = Number(config.tabletBorderRightWidth ?? config.borderRightWidth ?? config.mobileBorderRightWidth ?? 0);
      const btValueDesktop = Number(config.borderTopWidth ?? config.tabletBorderTopWidth ?? config.mobileBorderTopWidth ?? 0);
      const bbValueDesktop = Number(config.borderBottomWidth ?? config.tabletBorderBottomWidth ?? config.mobileBorderBottomWidth ?? 0);
      const blValueDesktop = Number(config.borderLeftWidth ?? config.tabletBorderLeftWidth ?? config.mobileBorderLeftWidth ?? 0);
      const brValueDesktop = Number(config.borderRightWidth ?? config.tabletBorderRightWidth ?? config.mobileBorderRightWidth ?? 0);
      const shadowValueMobile = getShadow(String(config.mobileBoxShadow ?? config.boxShadow ?? "none"));
      const shadowValueTablet = getShadow(String(config.tabletBoxShadow ?? config.boxShadow ?? config.mobileBoxShadow ?? "none"));
      const shadowValueDesktop = getShadow(String(config.boxShadow ?? config.tabletBoxShadow ?? config.mobileBoxShadow ?? "none"));
      const hasBorderMobile = btValueMobile > 0 || bbValueMobile > 0 || blValueMobile > 0 || brValueMobile > 0;
      const hasBorderTablet = btValueTablet > 0 || bbValueTablet > 0 || blValueTablet > 0 || brValueTablet > 0;
      const hasBorderDesktop = btValueDesktop > 0 || bbValueDesktop > 0 || blValueDesktop > 0 || brValueDesktop > 0;
      const frameMobile = useBoxMobile || hasBorderMobile || shadowValueMobile !== "none";
      const frameTablet = useBoxTablet || hasBorderTablet || shadowValueTablet !== "none";
      const frameDesktop = useBoxDesktop || hasBorderDesktop || shadowValueDesktop !== "none";
      const styleMobile = borderStyleValueMobile.trim().toLowerCase();
      const styleTablet = borderStyleValueTablet.trim().toLowerCase();
      const styleDesktop = borderStyleValueDesktop.trim().toLowerCase();
      const borderStyleMobile = frameMobile ? (hasBorderMobile && styleMobile === "none" ? "solid" : borderStyleValueMobile) : "none";
      const borderStyleTablet = frameTablet ? (hasBorderTablet && styleTablet === "none" ? "solid" : borderStyleValueTablet) : "none";
      const borderStyleDesktop = frameDesktop ? (hasBorderDesktop && styleDesktop === "none" ? "solid" : borderStyleValueDesktop) : "none";
      const borderColorMobile = frameMobile ? borderColorValueMobile : "transparent";
      const borderColorTablet = frameTablet ? borderColorValueTablet : "transparent";
      const borderColorDesktop = frameDesktop ? borderColorValueDesktop : "transparent";
      const btMobile = frameMobile ? `${btValueMobile}px` : "0px";
      const bbMobile = frameMobile ? `${bbValueMobile}px` : "0px";
      const blMobile = frameMobile ? `${blValueMobile}px` : "0px";
      const brMobile = frameMobile ? `${brValueMobile}px` : "0px";
      const btTablet = frameTablet ? `${btValueTablet}px` : "0px";
      const bbTablet = frameTablet ? `${bbValueTablet}px` : "0px";
      const blTablet = frameTablet ? `${blValueTablet}px` : "0px";
      const brTablet = frameTablet ? `${brValueTablet}px` : "0px";
      const btDesktop = frameDesktop ? `${btValueDesktop}px` : "0px";
      const bbDesktop = frameDesktop ? `${bbValueDesktop}px` : "0px";
      const blDesktop = frameDesktop ? `${blValueDesktop}px` : "0px";
      const brDesktop = frameDesktop ? `${brValueDesktop}px` : "0px";
      const shadowMobile = frameMobile ? shadowValueMobile : "none";
      const shadowTablet = frameTablet ? shadowValueTablet : "none";
      const shadowDesktop = frameDesktop ? shadowValueDesktop : "none";
      const radiusMobile = frameMobile ? getRadius(String(config.mobileBorderRadius ?? config.borderRadius ?? "none")) : "0";
      const radiusTablet = frameTablet ? getRadius(String(config.tabletBorderRadius ?? config.borderRadius ?? config.mobileBorderRadius ?? "none")) : "0";
      const radiusDesktop = frameDesktop ? getRadius(String(config.borderRadius ?? config.tabletBorderRadius ?? config.mobileBorderRadius ?? "none")) : "0";
      const boxPaddingYMobile = useBoxMobile ? (formatSpacing(config.mobileBoxPaddingY ?? config.boxPaddingY) ?? "0px") : "0px";
      const boxPaddingYTablet = useBoxTablet ? (formatSpacing(config.tabletBoxPaddingY ?? config.boxPaddingY ?? config.mobileBoxPaddingY) ?? boxPaddingYMobile) : "0px";
      const boxPaddingYDesktop = useBoxDesktop ? (formatSpacing(config.boxPaddingY ?? config.tabletBoxPaddingY ?? config.mobileBoxPaddingY) ?? boxPaddingYTablet) : "0px";
      const boxPaddingXMobile = useBoxMobile ? (formatSpacing(config.mobileBoxPaddingX ?? config.boxPaddingX) ?? "0px") : "0px";
      const boxPaddingXTablet = useBoxTablet ? (formatSpacing(config.tabletBoxPaddingX ?? config.boxPaddingX ?? config.mobileBoxPaddingX) ?? boxPaddingXMobile) : "0px";
      const boxPaddingXDesktop = useBoxDesktop ? (formatSpacing(config.boxPaddingX ?? config.tabletBoxPaddingX ?? config.mobileBoxPaddingX) ?? boxPaddingXTablet) : "0px";

      const bgColorMobile = normalizeColor(config.mobileBackgroundColor ?? config.backgroundColor, "transparent");
      const bgColorTablet = normalizeColor(config.tabletBackgroundColor ?? config.backgroundColor ?? config.mobileBackgroundColor, bgColorMobile);
      const bgColorDesktop = normalizeColor(config.backgroundColor ?? config.tabletBackgroundColor ?? config.mobileBackgroundColor, bgColorTablet);
      const bgImageMobile = sanitizeCssUrl(typeof config.mobileBackgroundImage === "string" && config.mobileBackgroundImage.trim() !== "" ? config.mobileBackgroundImage : config.backgroundImage);
      const bgImageTablet = sanitizeCssUrl(typeof config.tabletBackgroundImage === "string" && config.tabletBackgroundImage.trim() !== "" ? config.tabletBackgroundImage : bgImageMobile);
      const bgImageDesktop = sanitizeCssUrl(typeof config.backgroundImage === "string" && config.backgroundImage.trim() !== "" ? config.backgroundImage : bgImageTablet);
      const overlayMobile = typeof config.mobileOverlayColor === "string" && config.mobileOverlayColor.trim() !== "" ? config.mobileOverlayColor : (typeof config.overlayColor === "string" ? config.overlayColor : "");
      const overlayTablet = typeof config.tabletOverlayColor === "string" && config.tabletOverlayColor.trim() !== "" ? config.tabletOverlayColor : overlayMobile;
      const overlayDesktop = typeof config.overlayColor === "string" && config.overlayColor.trim() !== "" ? config.overlayColor : overlayTablet;
      const bgSizeMobile = typeof config.mobileBackgroundSize === "string" && config.mobileBackgroundSize.trim() !== "" ? config.mobileBackgroundSize : (typeof config.backgroundSize === "string" && config.backgroundSize.trim() !== "" ? config.backgroundSize : "cover");
      const bgSizeTablet = typeof config.tabletBackgroundSize === "string" && config.tabletBackgroundSize.trim() !== "" ? config.tabletBackgroundSize : bgSizeMobile;
      const bgSizeDesktop = typeof config.backgroundSize === "string" && config.backgroundSize.trim() !== "" ? config.backgroundSize : bgSizeTablet;

      const widthModeMobile = String(config.mobileContainerWidth ?? config.containerWidth ?? "boxed");
      const widthModeTablet = String(config.tabletContainerWidth ?? config.containerWidth ?? config.mobileContainerWidth ?? widthModeMobile);
      const widthModeDesktop = String(config.containerWidth ?? config.tabletContainerWidth ?? config.mobileContainerWidth ?? widthModeTablet);
      const customWidthMobile = formatContainerSize(config.mobileCustomContainerWidth ?? config.customContainerWidth, "1200px");
      const customWidthTablet = formatContainerSize(config.tabletCustomContainerWidth ?? config.customContainerWidth ?? config.mobileCustomContainerWidth, "1200px");
      const customWidthDesktop = formatContainerSize(config.customContainerWidth ?? config.tabletCustomContainerWidth ?? config.mobileCustomContainerWidth, "1200px");
      const boxedMaxWidth = "var(--container-width, 1200px)";
      const containerMaxWidthMobile = isNested ? "none" : (widthModeMobile === "full" ? "none" : (widthModeMobile === "custom" ? customWidthMobile : boxedMaxWidth));
      const containerMaxWidthTablet = isNested ? "none" : (widthModeTablet === "full" ? "none" : (widthModeTablet === "custom" ? customWidthTablet : boxedMaxWidth));
      const containerMaxWidthDesktop = isNested ? "none" : (widthModeDesktop === "full" ? "none" : (widthModeDesktop === "custom" ? customWidthDesktop : boxedMaxWidth));

      const sectionStyle = {
          marginBottom: "var(--section-gap, 32px)",
          "--sec-mt-m": mtMobile,
          "--sec-mb-m": mbMobile,
          "--sec-ml-m": mlMobile,
          "--sec-mr-m": mrMobile,
          "--sec-mt-t": mtTablet,
          "--sec-mb-t": mbTablet,
          "--sec-ml-t": mlTablet,
          "--sec-mr-t": mrTablet,
          "--sec-mt-d": mtDesktop,
          "--sec-mb-d": mbDesktop,
          "--sec-ml-d": mlDesktop,
          "--sec-mr-d": mrDesktop,
          "--sec-pt-m": ptMobile,
          "--sec-pb-m": pbMobile,
          "--sec-pl-m": plMobile,
          "--sec-pr-m": prMobile,
          "--sec-pt-t": ptTablet,
          "--sec-pb-t": pbTablet,
          "--sec-pl-t": plTablet,
          "--sec-pr-t": prTablet,
          "--sec-pt-d": ptDesktop,
          "--sec-pb-d": pbDesktop,
          "--sec-pl-d": plDesktop,
          "--sec-pr-d": prDesktop,
          "--sec-bg-m": bgColorMobile,
          "--sec-bg-t": bgColorTablet,
          "--sec-bg-d": bgColorDesktop,
          "--sec-bgimg-m": bgImageMobile ? `url("${bgImageMobile}")` : "none",
          "--sec-bgimg-t": bgImageTablet ? `url("${bgImageTablet}")` : "none",
          "--sec-bgimg-d": bgImageDesktop ? `url("${bgImageDesktop}")` : "none",
          "--sec-bgsize-m": bgImageMobile ? bgSizeMobile : "auto",
          "--sec-bgsize-t": bgImageTablet ? bgSizeTablet : "auto",
          "--sec-bgsize-d": bgImageDesktop ? bgSizeDesktop : "auto",
          "--sec-border-style-m": borderStyleMobile,
          "--sec-border-style-t": borderStyleTablet,
          "--sec-border-style-d": borderStyleDesktop,
          "--sec-border-color-m": borderColorMobile,
          "--sec-border-color-t": borderColorTablet,
          "--sec-border-color-d": borderColorDesktop,
          "--sec-bt-m": btMobile,
          "--sec-bb-m": bbMobile,
          "--sec-bl-m": blMobile,
          "--sec-br-m": brMobile,
          "--sec-bt-t": btTablet,
          "--sec-bb-t": bbTablet,
          "--sec-bl-t": blTablet,
          "--sec-br-t": brTablet,
          "--sec-bt-d": btDesktop,
          "--sec-bb-d": bbDesktop,
          "--sec-bl-d": blDesktop,
          "--sec-br-d": brDesktop,
          "--sec-shadow-m": shadowMobile,
          "--sec-shadow-t": shadowTablet,
          "--sec-shadow-d": shadowDesktop,
          "--sec-radius-m": radiusMobile,
          "--sec-radius-t": radiusTablet,
          "--sec-radius-d": radiusDesktop,
          "--sec-overlay-m": overlayMobile || "transparent",
          "--sec-overlay-t": overlayTablet || overlayMobile || "transparent",
          "--sec-overlay-d": overlayDesktop || overlayTablet || overlayMobile || "transparent",
          "--sec-boxpy-m": boxPaddingYMobile,
          "--sec-boxpy-t": boxPaddingYTablet,
          "--sec-boxpy-d": boxPaddingYDesktop,
          "--sec-boxpx-m": boxPaddingXMobile,
          "--sec-boxpx-t": boxPaddingXTablet,
          "--sec-boxpx-d": boxPaddingXDesktop,
          "--sec-wgap-m": blockGapMobile,
          "--sec-wgap-t": blockGapTablet,
          "--sec-wgap-d": blockGapDesktop,
          "--sec-cgap-m": columnGapMobile,
          "--sec-cgap-t": columnGapTablet,
          "--sec-cgap-d": columnGapDesktop,
          "--sec-maxw-m": containerMaxWidthMobile,
          "--sec-maxw-t": containerMaxWidthTablet,
          "--sec-maxw-d": containerMaxWidthDesktop,
      } as React.CSSProperties;

      return (
          <section 
            id={section.id} 
            key={section.id} 
            className={`classic-section-responsive relative w-full mt-[var(--sec-mt-m)] mr-[var(--sec-mr-m)] mb-[var(--sec-mb-m)] ml-[var(--sec-ml-m)] md:mt-[var(--sec-mt-t)] md:mr-[var(--sec-mr-t)] md:mb-[var(--sec-mb-t)] md:ml-[var(--sec-ml-t)] lg:mt-[var(--sec-mt-d)] lg:mr-[var(--sec-mr-d)] lg:mb-[var(--sec-mb-d)] lg:ml-[var(--sec-ml-d)] ${getResponsiveHideClass(config)}`.trim()}
            style={sectionStyle}
          >
              <div
                className={isNested ? "relative w-full" : "relative w-full mx-auto px-4 max-w-[var(--sec-maxw-m)] md:max-w-[var(--sec-maxw-t)] lg:max-w-[var(--sec-maxw-d)]"}
              >
                  <div
                    className="relative w-full bg-[var(--sec-bg-m)] md:bg-[var(--sec-bg-t)] lg:bg-[var(--sec-bg-d)] bg-[image:var(--sec-bgimg-m)] md:bg-[image:var(--sec-bgimg-t)] lg:bg-[image:var(--sec-bgimg-d)] [background-size:var(--sec-bgsize-m)] md:[background-size:var(--sec-bgsize-t)] lg:[background-size:var(--sec-bgsize-d)] pt-[var(--sec-pt-m)] pb-[var(--sec-pb-m)] pl-[var(--sec-pl-m)] pr-[var(--sec-pr-m)] md:pt-[var(--sec-pt-t)] md:pb-[var(--sec-pb-t)] md:pl-[var(--sec-pl-t)] md:pr-[var(--sec-pr-t)] lg:pt-[var(--sec-pt-d)] lg:pb-[var(--sec-pb-d)] lg:pl-[var(--sec-pl-d)] lg:pr-[var(--sec-pr-d)] [border-top-style:var(--sec-border-style-m)] [border-bottom-style:var(--sec-border-style-m)] [border-left-style:var(--sec-border-style-m)] [border-right-style:var(--sec-border-style-m)] md:[border-top-style:var(--sec-border-style-t)] md:[border-bottom-style:var(--sec-border-style-t)] md:[border-left-style:var(--sec-border-style-t)] md:[border-right-style:var(--sec-border-style-t)] lg:[border-top-style:var(--sec-border-style-d)] lg:[border-bottom-style:var(--sec-border-style-d)] lg:[border-left-style:var(--sec-border-style-d)] lg:[border-right-style:var(--sec-border-style-d)] [border-color:var(--sec-border-color-m)] md:[border-color:var(--sec-border-color-t)] lg:[border-color:var(--sec-border-color-d)] border-t-[var(--sec-bt-m)] border-b-[var(--sec-bb-m)] border-l-[var(--sec-bl-m)] border-r-[var(--sec-br-m)] md:border-t-[var(--sec-bt-t)] md:border-b-[var(--sec-bb-t)] md:border-l-[var(--sec-bl-t)] md:border-r-[var(--sec-br-t)] lg:border-t-[var(--sec-bt-d)] lg:border-b-[var(--sec-bb-d)] lg:border-l-[var(--sec-bl-d)] lg:border-r-[var(--sec-br-d)] shadow-[var(--sec-shadow-m)] md:shadow-[var(--sec-shadow-t)] lg:shadow-[var(--sec-shadow-d)] rounded-[var(--sec-radius-m)] md:rounded-[var(--sec-radius-t)] lg:rounded-[var(--sec-radius-d)]"
                    style={{ backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
                  >
                  {(bgImageMobile || bgImageTablet || bgImageDesktop) && (
                      <div className="absolute inset-0 pointer-events-none z-0 bg-[var(--sec-overlay-m)] md:bg-[var(--sec-overlay-t)] lg:bg-[var(--sec-overlay-d)] rounded-[var(--sec-radius-m)] md:rounded-[var(--sec-radius-t)] lg:rounded-[var(--sec-radius-d)]" />
                  )}
                  <div className="relative z-10 pt-[var(--sec-boxpy-m)] pb-[var(--sec-boxpy-m)] pl-[var(--sec-boxpx-m)] pr-[var(--sec-boxpx-m)] md:pt-[var(--sec-boxpy-t)] md:pb-[var(--sec-boxpy-t)] md:pl-[var(--sec-boxpx-t)] md:pr-[var(--sec-boxpx-t)] lg:pt-[var(--sec-boxpy-d)] lg:pb-[var(--sec-boxpy-d)] lg:pl-[var(--sec-boxpx-d)] lg:pr-[var(--sec-boxpx-d)]">
                  {config.title && (
                      <h2 
                        className="text-2xl font-bold mb-6 text-gray-900"
                        style={{
                            color: 'var(--home-title-color)',
                            fontSize: 'var(--home-title-size)',
                            fontWeight: 'var(--home-title-weight)'
                        }}
                      >{config.title}</h2>
                  )}
                  
                  <div 
                    id={`section-${section.id}`} 
                    className="grid grid-cols-1 md:grid-cols-12 gap-y-[var(--sec-wgap-m)] gap-x-[var(--sec-cgap-m)] md:gap-y-[var(--sec-wgap-t)] md:gap-x-[var(--sec-cgap-t)] lg:gap-y-[var(--sec-wgap-d)] lg:gap-x-[var(--sec-cgap-d)]"
                  >
                      {columns.map((colWidgets, index) => {
                          const width = colWidths[index];
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
                          
                          // Determine if Main or Sidebar based on width
                          // 66/33 logic: Main is usually the wider one (8 cols), Sidebar is smaller (4 cols)
                          // 33/66 logic: Sidebar is smaller (4 cols), Main is wider (8 cols)
                          // But we can just use simple heuristic: > 6 is main content
                          const isMain = width > 6;
                          
                          const colStyle = {
                              // Inject local variables for widgets in this column
                              '--box-bg': isMain ? 'var(--main-box-bg)' : 'var(--sidebar-box-bg)',
                              '--box-radius': isMain ? 'var(--main-box-radius)' : 'var(--sidebar-box-radius)',
                              '--box-shadow': isMain ? 'var(--main-box-shadow)' : 'var(--sidebar-box-shadow)',
                              '--box-border': isMain ? 'var(--main-box-border)' : 'var(--sidebar-box-border)',
                              '--box-padding': isMain ? 'var(--main-box-padding)' : 'var(--sidebar-box-padding)',
                          } as React.CSSProperties;

                          return (
                              <div 
                                key={index} 
                                className={`col-item col-index-${index} flex gap-[var(--sec-wgap-m)] md:gap-[var(--sec-wgap-t)] lg:gap-[var(--sec-wgap-d)] ${directionClassMobile} ${alignClassMobile} ${crossClassMobile} ${directionClassTablet} ${alignClassTablet} ${crossClassTablet} ${directionClassDesktop} ${alignClassDesktop} ${crossClassDesktop} md:col-span-${width}`.trim()}
                                style={colStyle}
                              >
                                  {colWidgets.length > 0 ? (
                                      colWidgets.map((widget: any) =>
                                          renderWidgetWithSpacing(
                                              widget,
                                              widget.type === "section" ? renderSection(widget, true) : renderWidget(widget),
                                              itemClass,
                                              { mobile: dirMobile, tablet: dirTablet, desktop: dirDesktop }
                                          )
                                      )
                                  ) : null}
                              </div>
                          );
                      })}
                  </div>
              </div>
              </div>
              </div>
          </section>
      );
  };


  return (
    <div 
        className="public-theme min-h-screen flex flex-col font-sans text-gray-900"
        style={{
            // backgroundColor: homeBackgroundColor, // Handled by ThemeProvider on body
            // CSS Variables for Child Components
            '--section-gap': sectionGap,
            '--widget-gap': widgetGap,
            '--home-title-color': homeTitleColor,
            '--home-title-size': homeTitleFontSize,
            '--home-title-weight': homeTitleFontWeight,
            '--container-width': containerWidth,
            
            // New Colors
            '--home-widget-title-color': homeWidgetTitleColor,
            '--home-news-title-color': homeNewsTitleColor,
            '--home-hover-color': homeHoverColor,
            '--home-excerpt-color': homeExcerptColor,
            '--home-meta-color': homeMetaColor,
            
            // Inject Accent Color explicitly for widgets that use it directly
            '--accent': setting?.globalAccentColor || setting?.accentColor || '#f59e0b',

            // Typography
            '--home-widget-title-size': setting?.homeWidgetTitleFontSize || "24px",
            '--home-widget-title-weight': setting?.homeWidgetTitleFontWeight || "700",
            '--home-widget-title-font': homeWidgetTitleFont,
            '--home-news-title-size': setting?.homeNewsTitleFontSize || "18px",
            '--home-news-title-weight': setting?.homeNewsTitleFontWeight || "600",
            '--home-news-title-font': homeNewsTitleFont,
            '--home-excerpt-size': setting?.homeExcerptFontSize || "14px",
            '--home-excerpt-weight': setting?.homeExcerptFontWeight || "400",
            '--home-excerpt-font': homeExcerptFont,
            '--home-meta-size': setting?.homeMetaFontSize || "12px",
            '--home-meta-weight': setting?.homeMetaFontWeight || "500",
            '--home-meta-font': homeMetaFont,
            
            // Box Styles Variables
            '--main-box-bg': mainBoxEnabled ? mainBoxBg : 'transparent',
            '--main-box-radius': mainBoxRadius,
            '--main-box-shadow': mainBoxEnabled ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
            '--main-box-border': mainBoxEnabled ? '1px solid rgb(229 231 235)' : 'none',
            '--main-box-padding': mainBoxEnabled ? '1.5rem' : '0',

            '--sidebar-box-bg': sidebarBoxEnabled ? sidebarBoxBg : 'transparent',
            '--sidebar-box-radius': sidebarBoxRadius,
            '--sidebar-box-shadow': sidebarBoxEnabled ? '0 1px 2px 0 rgb(0 0 0 / 0.05)' : 'none',
            '--sidebar-box-border': sidebarBoxEnabled ? '1px solid rgb(229 231 235)' : 'none',
            '--sidebar-box-padding': sidebarBoxEnabled ? '1.5rem' : '0',
        } as React.CSSProperties}
    >
      <Header siteName={siteName} logoUrl={logoUrl} categories={categories || []} />

      <main className="flex-grow">
        {(!blocks || blocks.length === 0) ? (
            <div className="container mx-auto px-4 py-20 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 mt-8">
                <h2 className="text-xl font-semibold text-gray-500 mb-2">Halaman Kosong</h2>
                <p className="text-gray-400">Belum ada widget yang ditambahkan.</p>
                <div className="mt-4 p-4 bg-gray-100 text-xs text-left font-mono">
                    DEBUG: Blocks array is empty.
                </div>
            </div>
        ) : (
            <div className="flex flex-col w-full">
                {blocks.map((block) => {
                    if (block.type === 'section') {
                        return renderSection(block);
                    } else {
                        // Top level widget (legacy support)
                        // Wrap in a container section
                        return (
                            <section key={block.id} className={`py-8 bg-white border-b border-gray-100 ${getResponsiveHideClass(block?.config)}`.trim()}>
                                <div className="container mx-auto px-4">
                                    <div className="bg-yellow-50 border border-yellow-200 p-2 mb-2 text-xs text-yellow-700">
                                        Legacy Widget Wrapper (Not in Section)
                                    </div>
                                    {renderWidget(block)}
                                </div>
                            </section>
                        );
                    }
                })}
            </div>
        )}
      </main>

      <Footer siteName={siteName} logoUrl={data.setting?.logoUrl} categories={data.categories} footerConfig={data.footerConfig} menusByLocation={data.menusByLocation} />
    </div>
  );
}
