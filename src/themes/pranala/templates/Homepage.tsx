// src/themes/pranala/templates/Homepage.tsx

import React from "react";
import { PRANALA_BLOCKS } from "../blocks/registry";
import Section from "../blocks/Section"; // Direct import to ensure it works
import Header from "../components/Header";
import Footer from "../components/Footer";
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

  // === RENDERER ENGINE ===

  const renderWidget = (widget: any) => {
      const blockDef = PRANALA_BLOCKS[widget.type]; // Use PRANALA_BLOCKS
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
      
      const mergedWidget = { ...widget, config: mergedConfig };

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
                className={`${colSpan} section-column flex ${directionClassMobile} ${alignClassMobile} ${crossClassMobile} ${directionClassTablet} ${alignClassTablet} ${crossClassTablet} ${directionClassDesktop} ${alignClassDesktop} ${crossClassDesktop} ${stickyClass}`.trim()}
                style={{ gap: 'var(--section-widget-gap)' }}
              >
                  {widgets.map((widget: any) => (
                      <div
                        key={widget.id}
                        className={`${itemClass} ${(() => {
                          const vM = widget?.config?.mobileVerticalAlign ?? widget?.config?.tabletVerticalAlign ?? widget?.config?.verticalAlign;
                          const vT = widget?.config?.tabletVerticalAlign ?? widget?.config?.verticalAlign;
                          const vD = widget?.config?.verticalAlign;
                          const normalize = (val: any) => val === "bottom" ? "bottom" : val === "center" || val === "middle" ? "center" : "top";
                          const toSelf = (val: string, prefix = "") => val === "center" ? `${prefix}self-center` : val === "bottom" ? `${prefix}self-end` : `${prefix}self-start`;
                          const selfMobile = dirMobile === "horizontal" ? toSelf(normalize(vM)) : "";
                          const selfTablet = dirTablet === "horizontal" ? toSelf(normalize(vT), "md:") : "";
                          const selfDesktop = dirDesktop === "horizontal" ? toSelf(normalize(vD), "lg:") : "";
                          return `${selfMobile} ${selfTablet} ${selfDesktop}`.trim();
                        })()}`.trim()}
                      >
                          {widget.type === "section" ? renderSection(widget, true) : renderWidget(widget)}
                      </div>
                  ))}
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
        className="public-theme min-h-screen flex flex-col font-sans text-gray-900"
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
            '--home-widget-title-font': setting?.homeWidgetTitleFont || "Inter",
            '--home-news-title-size': setting?.homeNewsTitleFontSize || "18px",
            '--home-news-title-weight': setting?.homeNewsTitleFontWeight || "600",
            '--home-news-title-font': setting?.homeNewsTitleFont || "Inter",
            '--home-excerpt-size': setting?.homeExcerptFontSize || "14px",
            '--home-excerpt-weight': setting?.homeExcerptFontWeight || "400",
            '--home-excerpt-font': setting?.homeExcerptFont || "Inter",
            '--home-meta-size': setting?.homeMetaFontSize || "12px",
            '--home-meta-weight': setting?.homeMetaFontWeight || "500",
            '--home-meta-font': setting?.homeMetaFont || "Inter",
            
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
      
      {/* Global Theme Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 767px) {
            .hide-mobile-widget { display: none !important; }
        }
        @media (min-width: 768px) and (max-width: 1024px) {
            .hide-tablet-widget { display: none !important; }
        }
        @media (min-width: 1025px) {
            .hide-desktop-widget { display: none !important; }
        }
        .theme-widget-title { 
            color: var(--widget-title-color-mobile, var(--widget-title-color, var(--home-widget-title-color))) !important;
            font-size: var(--widget-title-size-mobile, var(--widget-title-size, var(--home-widget-title-size))) !important;
            font-weight: var(--widget-title-weight, var(--home-widget-title-weight)) !important;
            font-family: var(--widget-title-font, var(--home-widget-title-font), sans-serif) !important;
        }
        .widget-title-bar {
            background-color: var(--widget-title-border-color-mobile, var(--widget-title-border-color, var(--accent))) !important;
        }
        @media (min-width: 768px) {
            .theme-widget-title {
                color: var(--widget-title-color-tablet, var(--widget-title-color-mobile, var(--widget-title-color, var(--home-widget-title-color)))) !important;
                font-size: var(--widget-title-size-tablet, var(--widget-title-size-mobile, var(--widget-title-size, var(--home-widget-title-size)))) !important;
            }
            .widget-title-bar {
                background-color: var(--widget-title-border-color-tablet, var(--widget-title-border-color-mobile, var(--widget-title-border-color, var(--accent)))) !important;
            }
        }
        @media (min-width: 1025px) {
            .theme-widget-title {
                color: var(--widget-title-color-desktop, var(--widget-title-color-tablet, var(--widget-title-color-mobile, var(--widget-title-color, var(--home-widget-title-color))))) !important;
                font-size: var(--widget-title-size-desktop, var(--widget-title-size-tablet, var(--widget-title-size-mobile, var(--widget-title-size, var(--home-widget-title-size))))) !important;
            }
            .widget-title-bar {
                background-color: var(--widget-title-border-color-desktop, var(--widget-title-border-color-tablet, var(--widget-title-border-color-mobile, var(--widget-title-border-color, var(--accent))))) !important;
            }
        }
        .theme-news-title { 
            color: var(--home-news-title-color);
            font-size: var(--home-news-title-size);
            font-weight: var(--home-news-title-weight);
            font-family: var(--home-news-title-font), sans-serif;
        }
        .theme-news-title:hover { color: var(--home-hover-color); }
        .news-list-title,
        .news-grid-title,
        .hsl-title,
        .hs-hero-title-link,
        .hs-mini-title-link,
        .popular-title,
        .headline-big-title a,
        .bullet-list-link {
            color: var(--home-news-title-color);
            font-size: var(--home-news-title-size);
            font-weight: var(--home-news-title-weight);
            font-family: var(--home-news-title-font), sans-serif;
        }
        .news-list-title:hover,
        .news-grid-title:hover,
        .hsl-title:hover,
        .hs-hero-title-link:hover,
        .hs-mini-title-link:hover,
        .popular-title:hover,
        .headline-big-title a:hover,
        .bullet-list-link:hover {
            color: var(--home-hover-color);
        }
        
        .theme-excerpt { 
            color: var(--home-excerpt-color);
            font-size: var(--home-excerpt-size);
            font-weight: var(--home-excerpt-weight);
            font-family: var(--home-excerpt-font), sans-serif;
        }
        .news-list-excerpt,
        .news-grid-excerpt,
        .hsl-excerpt,
        .headline-big-excerpt,
        .hs-hero-excerpt,
        .hs-mini-excerpt {
            color: var(--home-excerpt-color);
            font-size: var(--home-excerpt-size);
            font-weight: var(--home-excerpt-weight);
            font-family: var(--home-excerpt-font), sans-serif;
        }
        
        .theme-meta { 
            color: var(--home-meta-color);
            font-size: var(--home-meta-size);
            font-weight: var(--home-meta-weight);
            font-family: var(--home-meta-font), sans-serif;
        }
        .news-list-meta-info,
        .news-grid-meta,
        .hsl-meta,
        .headline-big-meta,
        .hs-hero-meta,
        .hs-mini-meta,
        .popular-meta {
            color: var(--home-meta-color);
            font-size: var(--home-meta-size);
            font-weight: var(--home-meta-weight);
            font-family: var(--home-meta-font), sans-serif;
        }
        .theme-meta a { 
            color: var(--home-meta-color); 
        }
        .theme-meta a:hover,
        .news-list-meta-info a:hover,
        .news-grid-meta a:hover,
        .hsl-meta a:hover,
        .headline-big-meta a:hover,
        .hs-hero-meta a:hover,
        .hs-mini-meta a:hover,
        .popular-meta a:hover {
            color: var(--home-hover-color);
        }
      `}} />

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

      <Footer siteName={siteName} logoUrl={logoUrl} categories={data.categories} footerConfig={data.footerConfig} menusByLocation={data.menusByLocation} />
    </div>
  );
}
