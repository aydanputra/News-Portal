// src/themes/classic/templates/Homepage.tsx

import React from "react";
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

  // === RENDERER ENGINE ===

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

  const renderSection = (section: any) => {
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

      // Section Styles
      const bgColor = config.backgroundColor || "bg-transparent"; // Use transparent to inherit global bg if not set
      // Use style-based padding if possible, or fallback to class
      const padding = config.padding || "py-8";
      
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
      const sectionContainerWidth = typeof config.containerWidth === "string" ? config.containerWidth : "boxed";
      const containerClass = sectionContainerWidth === "full" ? "w-full" : "mx-auto px-4";
      const containerStyle = sectionContainerWidth === "full"
        ? {}
        : sectionContainerWidth === "custom"
          ? { maxWidth: formatContainerSize(config.customContainerWidth, "1200px"), width: "100%" }
          : { maxWidth: "1100px", width: "100%" };

      return (
          <section 
            id={section.id} 
            key={section.id} 
            className={`${bgColor} ${padding} ${getResponsiveHideClass(config)}`}
            style={{ marginBottom: 'var(--section-gap, 32px)' }}
          >
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                    .public-theme #${section.id} {
                      --section-widget-gap: ${blockGapMobile};
                      --section-column-gap: ${columnGapMobile};
                    }
                    @media (min-width: 768px) {
                      .public-theme #${section.id} {
                        --section-widget-gap: ${blockGapTablet};
                        --section-column-gap: ${columnGapTablet};
                      }
                    }
                    @media (min-width: 1025px) {
                      .public-theme #${section.id} {
                        --section-widget-gap: ${blockGapDesktop};
                        --section-column-gap: ${columnGapDesktop};
                      }
                    }
                  `,
                }}
              />
              <div className={containerClass} style={containerStyle}>
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
                  
                  {/* Grid Layout (Replaces custom style injection) */}
                  <div 
                    id={`section-${section.id}`} 
                    className="grid grid-cols-1 md:grid-cols-12"
                    style={{
                      columnGap: "var(--section-column-gap, var(--widget-gap, 24px))",
                      rowGap: "var(--section-widget-gap, var(--widget-gap, 24px))",
                    }}
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
                              // Vertical gap between widgets in this column
                              gap: 'var(--section-widget-gap, var(--widget-gap, 24px))',
                              
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
                                className={`col-item col-index-${index} flex ${directionClassMobile} ${alignClassMobile} ${crossClassMobile} ${directionClassTablet} ${alignClassTablet} ${crossClassTablet} ${directionClassDesktop} ${alignClassDesktop} ${crossClassDesktop} md:col-span-${width}`.trim()}
                                style={colStyle}
                              >
                                  {colWidgets.length > 0 ? (
                                      colWidgets.map((widget: any) => (
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
                                              {renderWidget(widget)}
                                          </div>
                                      ))
                                  ) : null}
                              </div>
                          );
                      })}
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
        @media (min-width: 1024px) {
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
            font-size: var(--home-news-title-size) !important;
            font-weight: var(--home-news-title-weight) !important;
            font-family: var(--home-news-title-font), sans-serif !important;
        }
        .theme-news-title:hover { color: var(--home-hover-color) !important; }
        
        .theme-excerpt { 
            color: var(--home-excerpt-color) !important;
            font-size: var(--home-excerpt-size) !important;
            font-weight: var(--home-excerpt-weight) !important;
            font-family: var(--home-excerpt-font), sans-serif !important;
        }
        
        .theme-meta { 
            color: var(--home-meta-color) !important;
            font-size: var(--home-meta-size) !important;
            font-weight: var(--home-meta-weight) !important;
            font-family: var(--home-meta-font), sans-serif !important;
        }
        .theme-meta a { 
            color: var(--home-meta-color); 
        }
        .theme-meta a:hover { color: var(--home-hover-color) !important; }
      `}} />

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
