import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ArchiveHeader from "../blockarchive/ArchiveHeader";
import ArchivePostGrid from "../blockarchive/ArchivePostGrid";
import ArchivePostList from "../blockarchive/ArchivePostList";
import ArchivePagination from "../blockarchive/ArchivePagination";
import ArchiveEmptyState from "../blockarchive/ArchiveEmptyState";
import Section from "../blocks/Section";
import HeroSlider from "../blocks/HeroSlider";
import NewsGrid from "../blocks/NewsGrid";
import { resolveSectionChildrenWithSidebarSource } from "@/lib/sidebar-reference";
import SidebarWidgetRenderer from "../components/SidebarWidgetRenderer";

interface ArchiveProps {
  title: string;
  description?: string;
  posts: any[];
  setting?: any;
  categories: any[];
  blocks?: any[];
  archiveType?: string;
  currentPage?: number;
  totalPages?: number;
  totalPosts?: number;
  archiveBasePath?: string;
  sourceBlocksByLocation?: Record<string, any[]>;
  blockData?: Record<string, any[]>;
  menusByLocation?: any;
  headerConfig?: any;
  footerConfig?: any;
}

const parseLayout = (layout?: string) => {
  switch (layout) {
    case "50-50": return [6, 6];
    case "33-66": return [4, 8];
    case "66-33": return [8, 4];
    case "33-33-33": return [4, 4, 4];
    case "25-25-25-25": return [3, 3, 3, 3];
    case "100":
    default:
      return [12];
  }
};

const getColSpanClass = (width: number) => {
  switch (Math.max(1, Math.min(12, Math.round(width)))) {
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
    case 12:
    default:
      return "md:col-span-12";
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

const normalizeRadius = (value: unknown, fallback: string) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value < 0) return fallback;
    return `${value}px`;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    const lower = trimmed.toLowerCase();
    if (lower === "default" || lower === "global") return fallback;
    if (lower === "none") return "0";
    if (lower === "sm") return "0.125rem";
    if (lower === "md") return "0.375rem";
    if (lower === "lg") return "0.5rem";
    if (lower === "xl") return "0.75rem";
    if (lower === "2xl") return "1rem";
    if (lower === "full") return "9999px";
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed < 0) return fallback;
      return `${parsed}px`;
    }
    return trimmed;
  }
  return fallback;
};

const formatSize = (value: unknown, fallback: string) => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    return trimmed;
  }
  return fallback;
};

export default function PranalaArchive({
  title,
  description,
  posts,
  setting,
  categories,
  blocks = [],
  archiveType = "archive",
  currentPage = 1,
  totalPages = 1,
  totalPosts,
  archiveBasePath = "/",
  sourceBlocksByLocation,
  blockData = {},
  menusByLocation,
  headerConfig,
  footerConfig,
}: ArchiveProps) {
  const siteName = setting?.siteName || "Portal Berita";

  const containerMode = setting?.globalContainerWidth || 'boxed';
  const customWidth = setting?.globalCustomContainerWidth || '1250';
  const containerClass = containerMode === 'full' ? 'w-full px-4' : 'container mx-auto px-4';
  const containerStyle = containerMode === 'full' ? {} : { maxWidth: containerMode === 'custom' ? `${customWidth}px` : '1250px' };

  const accent = setting?.globalAccentColor || setting?.accentColor || '#2563eb';
  const headingColor = setting?.homeTitleColor || setting?.headingColor || '#111827';
  const widgetTitleColor = setting?.homeWidgetTitleColor || setting?.globalWidgetTitleColor || headingColor;
  const newsTitleColor = setting?.homeNewsTitleColor || setting?.globalNewsTitleColor || headingColor;
  const excerptColor = setting?.homeExcerptColor || setting?.globalExcerptColor || setting?.excerptColor || '#4b5563';
  const metaColor = setting?.homeMetaColor || setting?.globalMetaColor || setting?.metaColor || '#9ca3af';
  const hoverColor = setting?.homeHoverColor || accent;
  const archiveRadius = normalizeRadius(setting?.globalBorderRadius ?? setting?.postGlobalBorderRadius, "0.75rem");
  const archiveTitleSize = formatSize(setting?.archiveTitleFontSize ?? setting?.globalWidgetTitleFontSize, "2.25rem");
  const archiveTitleWeight = typeof (setting?.archiveTitleFontWeight ?? setting?.globalWidgetTitleFontWeight) === "string"
    ? (setting?.archiveTitleFontWeight ?? setting?.globalWidgetTitleFontWeight)
    : "700";
  const archiveTitleFont = setting?.archiveTitleFont || setting?.globalWidgetTitleFont || setting?.headingFont || "inherit";
  const archiveExcerptSize = formatSize(setting?.archiveExcerptFontSize ?? setting?.globalExcerptFontSize, "1rem");
  const archiveExcerptWeight = typeof (setting?.archiveExcerptFontWeight ?? setting?.globalExcerptFontWeight) === "string"
    ? (setting?.archiveExcerptFontWeight ?? setting?.globalExcerptFontWeight)
    : "400";
  const archiveExcerptFont = setting?.archiveExcerptFont || setting?.globalExcerptFont || setting?.bodyFont || "inherit";
  const archiveMetaSize = formatSize(setting?.archiveMetaFontSize ?? setting?.globalMetaFontSize, "0.8125rem");
  const archiveMetaWeight = typeof (setting?.archiveMetaFontWeight ?? setting?.globalMetaFontWeight) === "string"
    ? (setting?.archiveMetaFontWeight ?? setting?.globalMetaFontWeight)
    : "500";
  const archiveMetaFont = setting?.archiveMetaFont || setting?.globalMetaFont || setting?.bodyFont || "inherit";
  const widgetTitleSize = formatSize(setting?.homeWidgetTitleFontSize ?? setting?.globalWidgetTitleFontSize, "24px");
  const widgetTitleWeight = typeof (setting?.homeWidgetTitleFontWeight ?? setting?.globalWidgetTitleFontWeight) === "string"
    ? (setting?.homeWidgetTitleFontWeight ?? setting?.globalWidgetTitleFontWeight)
    : "700";
  const widgetTitleFont = setting?.homeWidgetTitleFont || setting?.globalWidgetTitleFont || setting?.headingFont || "inherit";
  const newsTitleSize = formatSize(setting?.globalNewsTitleFontSize ?? setting?.homeNewsTitleFontSize, "1.125rem");
  const newsTitleWeight = typeof (setting?.globalNewsTitleFontWeight ?? setting?.homeNewsTitleFontWeight) === "string"
    ? (setting?.globalNewsTitleFontWeight ?? setting?.homeNewsTitleFontWeight)
    : "600";
  const newsTitleFont = setting?.globalNewsTitleFont || setting?.homeNewsTitleFont || setting?.headingFont || "inherit";
  const excerptSize = formatSize(setting?.globalExcerptFontSize ?? setting?.homeExcerptFontSize, "0.875rem");
  const excerptWeight = typeof (setting?.globalExcerptFontWeight ?? setting?.homeExcerptFontWeight) === "string"
    ? (setting?.globalExcerptFontWeight ?? setting?.homeExcerptFontWeight)
    : "400";
  const excerptFont = setting?.globalExcerptFont || setting?.homeExcerptFont || setting?.bodyFont || "inherit";
  const metaSize = formatSize(setting?.globalMetaFontSize ?? setting?.homeMetaFontSize, "0.75rem");
  const metaWeight = typeof (setting?.globalMetaFontWeight ?? setting?.homeMetaFontWeight) === "string"
    ? (setting?.globalMetaFontWeight ?? setting?.homeMetaFontWeight)
    : "500";
  const metaFont = setting?.globalMetaFont || setting?.homeMetaFont || setting?.bodyFont || "inherit";
  const visibleBlocks = (blocks || []).filter((block) => block?.isVisible !== false);

  const renderArchiveWidget = (widget: any) => {
    if (!widget || widget.isVisible === false) return null;

    // Untuk memastikan urutan data berita populer dll konsisten dengan Homepage,
    // kita mengambil data spesifik blok tersebut dari blockData (jika ada),
    // atau fallback ke posts (data arsip saat ini) jika tidak.
    const sourceWidgetId = widget.config?.sourceWidgetId || widget.sourceWidgetId;
    const widgetData = (blockData[widget.id] || (sourceWidgetId ? blockData[sourceWidgetId] : undefined)) || posts;

    // Gunakan SidebarWidgetRenderer untuk semua widget sidebar (baik warisan maupun native)
    // agar style CSS variable selalu ter-inject dan konsisten dengan Homepage.
    if (
      widget.config?.inheritedSidebarSource || 
      widget.type === "sidebar_widget" || 
      widget.type === "tag_cloud" || 
      widget.type === "ad_banner"
    ) {
      return (
        <SidebarWidgetRenderer
          widget={widget}
          widgetData={widgetData}
          categories={categories}
          setting={setting}
          renderContext="archive"
        />
      );
    }

    switch (widget.type) {
      case "archive_header":
        return (
          <ArchiveHeader
            block={widget}
            title={title}
            description={description}
            totalPosts={typeof totalPosts === "number" ? totalPosts : posts.length}
          />
        );
      case "archive_post_grid":
        return <ArchivePostGrid block={widget} posts={posts} />;
      case "news_grid":
        return <NewsGrid block={widget} posts={posts} customTitle={widget.title} />;
      case "archive_post_list":
        return <ArchivePostList block={widget} posts={posts} customTitle={widget.title} accentColor={accent} borderRadius={archiveRadius} />;
      case "news_hero_slider":
        return <HeroSlider block={widget} posts={posts} />;
      case "archive_pagination":
        return <ArchivePagination block={widget} currentPage={currentPage} totalPages={totalPages} basePath={archiveBasePath} />;
      case "archive_empty_state":
        return <ArchiveEmptyState block={widget} isEmpty={posts.length === 0} />;
      default:
        return null;
    }
  };

  const renderSection = (section: any, isNested = false) => {
    const config = section.config || {};
    const responsiveHideClass = getResponsiveHideClass(config);
    const layout = config.layout || "100";
    const colWidths = parseLayout(layout);
    const children = resolveSectionChildrenWithSidebarSource(section, sourceBlocksByLocation, "archive");
    const visibleChildren = children.filter((child: any) => child?.isVisible !== false);
    const columns: any[][] = Array.from({ length: colWidths.length }, () => []);

    for (const child of visibleChildren) {
      const idx = typeof child?.config?.columnIndex === "number" ? child.config.columnIndex : 0;
      if (columns[idx]) columns[idx].push(child);
      else columns[0].push(child);
    }

    const sidebarIndex = colWidths.length === 2 && colWidths[0] !== colWidths[1]
      ? (colWidths[0] < colWidths[1] ? 0 : 1)
      : -1;

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

    const renderedColumns = columns.map((items, i) => (
      <div
        key={`${section.id}-col-${i}`}
        className={`${getColSpanClass(colWidths[i])} flex ${directionClassMobile} ${alignClassMobile} ${crossClassMobile} ${directionClassTablet} ${alignClassTablet} ${crossClassTablet} ${directionClassDesktop} ${alignClassDesktop} ${crossClassDesktop} ${i === sidebarIndex ? "md:sticky md:top-24 md:self-start" : ""}`.trim()}
        style={{ gap: "var(--section-widget-gap)" }}
      >
        {items.map((widget: any) => (
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
            {widget.type === "section" ? renderSection(widget, true) : renderArchiveWidget(widget)}
          </div>
        ))}
      </div>
    ));

    return (
      <div key={section.id} className={responsiveHideClass}>
        <Section block={section} layout={layout} colWidths={colWidths} isNested={isNested}>
          {renderedColumns}
        </Section>
      </div>
    );
  };

  const renderBlock = (block: any) => {
    if (!block || block.isVisible === false) return null;
    if (block.type !== "section") {
      return (
        <div key={block.id} className={containerClass} style={containerStyle}>
          {renderArchiveWidget(block)}
        </div>
      );
    }

    return renderSection(block);
  };

  return (
    <div
      className="public-theme min-h-screen flex flex-col font-sans text-gray-900"
      style={{
        backgroundColor: 'var(--bg-color)',
        '--accent': accent,
        '--heading-color': headingColor,
        '--home-widget-title-color': widgetTitleColor,
        '--home-widget-title-size': widgetTitleSize,
        '--home-widget-title-weight': widgetTitleWeight,
        '--home-widget-title-font': widgetTitleFont,
        '--home-news-title-color': newsTitleColor,
        '--home-meta-color': metaColor,
        '--home-excerpt-color': excerptColor,
        '--home-hover-color': hoverColor,
        '--home-main-box-radius': archiveRadius,
        '--archive-title-size': archiveTitleSize,
        '--archive-title-weight': archiveTitleWeight,
        '--archive-title-font': archiveTitleFont,
        '--archive-excerpt-size': archiveExcerptSize,
        '--archive-excerpt-weight': archiveExcerptWeight,
        '--archive-excerpt-font': archiveExcerptFont,
        '--archive-meta-size': archiveMetaSize,
        '--archive-meta-weight': archiveMetaWeight,
        '--archive-meta-font': archiveMetaFont,
        '--home-news-title-size': newsTitleSize,
        '--home-news-title-weight': newsTitleWeight,
        '--home-news-title-font': newsTitleFont,
        '--home-excerpt-size': excerptSize,
        '--home-excerpt-weight': excerptWeight,
        '--home-excerpt-font': excerptFont,
        '--home-meta-size': metaSize,
        '--home-meta-weight': metaWeight,
        '--home-meta-font': metaFont,
        '--global-bg-color': setting?.globalBackgroundColor || setting?.backgroundColor || 'transparent',
        '--box-bg': 'transparent',
        '--box-radius': '0',
        '--box-shadow': 'none',
        '--box-border': 'none',
        '--box-padding': '0'
      } as React.CSSProperties}
    >
      <Header
        siteName={siteName}
        logoUrl={setting?.logoUrl}
        categories={categories || []}
        primaryMenu={menusByLocation?.PRIMARY}
        secondaryMenu={menusByLocation?.SECONDARY}
        mobileMenu={menusByLocation?.MOBILE}
        headerConfig={headerConfig}
      />
      <style dangerouslySetInnerHTML={{ __html: `
        .theme-widget-title {
          color: var(--widget-title-color-mobile, var(--widget-title-color, var(--home-widget-title-color))) !important;
          font-size: var(--widget-title-size-mobile, var(--widget-title-size, var(--home-widget-title-size))) !important;
          font-weight: var(--widget-title-weight, var(--home-widget-title-weight)) !important;
          font-family: var(--widget-title-font, var(--home-widget-title-font), sans-serif) !important;
        }
        .widget-title-bar {
          background-color: var(--widget-title-border-color-mobile, var(--widget-title-border-color, var(--accent))) !important;
        }
        .theme-news-title {
          color: var(--home-news-title-color) !important;
          font-size: var(--home-news-title-size);
          font-weight: var(--home-news-title-weight);
          font-family: var(--home-news-title-font), sans-serif;
          transition: color 0.2s ease;
        }
        .theme-news-title:hover { color: var(--home-hover-color) !important; }
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
        .theme-excerpt-text {
          color: var(--home-excerpt-color) !important;
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
        .theme-meta-text {
          color: var(--home-meta-color) !important;
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
        .theme-meta a,
        .news-list-meta-info a,
        .news-grid-meta a,
        .hsl-meta a,
        .headline-big-meta a,
        .hs-hero-meta a,
        .hs-mini-meta a,
        .popular-meta a {
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
      ` }} />

      <main className="flex-grow" data-archive-type={archiveType}>
        {visibleBlocks.length > 0 ? visibleBlocks.map(renderBlock) : (
          <>
            <div className={containerClass} style={containerStyle}>
              <ArchiveHeader
                block={{ config: { showDescription: true, showPostCount: true } }}
                title={title}
                description={description}
                totalPosts={typeof totalPosts === "number" ? totalPosts : posts.length}
              />
              <div className="mt-0">
                <NewsGrid block={{ id: "archive-fallback-news-grid", config: { gridColumns: 3, tabletGridColumns: 2, mobileGridColumns: 1, limit: 12, offset: 0, showTitle: true, showCategory: true, showMetaInfo: true, showExcerpt: true, excerptLength: 120, useBox: false } }} posts={posts} />
              </div>
            </div>
          </>
        )}
      </main>

      <Footer siteName={siteName} logoUrl={setting?.logoUrl} categories={categories} footerConfig={footerConfig} menusByLocation={menusByLocation} />
    </div>
  );
}
