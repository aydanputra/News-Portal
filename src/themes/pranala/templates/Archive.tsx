import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ArchiveHeader from "../blockarchive/ArchiveHeader";
import ArchivePostGrid from "../blockarchive/ArchivePostGrid";
import ArchivePostList from "../blockarchive/ArchivePostList";
import ArchiveClientController from "../blockarchive/ArchiveClientController";
import ArchiveEmptyState from "../blockarchive/ArchiveEmptyState";
import Section from "../blocks/Section";
import NewsGrid from "../blocks/NewsGrid";
import { PRANALA_BLOCKS } from "../blocks/registry";
import { resolveBlockTypeAlias } from "@/lib/block-registry";
import {
  resolveThemeFontFamily,
  resolveThemeFontSynthesis,
} from "@/lib/font-utils";
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
  pageSize?: number;
  archiveFilter?: { categories?: string[]; tags?: string[] };
  archiveDisplayCategory?: { name: string; slug: string } | null;
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

const resolvePublicFont = (font: unknown, fallback = "var(--font-body, sans-serif)") => {
  const value = typeof font === "string" ? font.trim() : "";
  if (!value) return fallback;
  return resolveThemeFontFamily(value, fallback);
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
  pageSize = 12,
  archiveFilter,
  archiveDisplayCategory = null,
}: ArchiveProps) {
  const siteName = setting?.siteName || "Portal Berita";

  const containerMode = setting?.globalContainerWidth || 'boxed';
  const customWidth = setting?.globalCustomContainerWidth || '1250';
  const containerClass = containerMode === 'full' ? 'w-full px-4' : 'container mx-auto px-4';
  const containerStyle = containerMode === 'full' ? {} : { maxWidth: containerMode === 'custom' ? `${customWidth}px` : '1250px' };

  const accent = setting?.globalAccentColor || setting?.accentColor || '#2563eb';
  const headingColor = setting?.homeTitleColor || setting?.headingColor || '#111827';
  const widgetTitleColor = setting?.globalWidgetTitleColor || setting?.homeWidgetTitleColor || headingColor;
  const newsTitleColor = setting?.globalNewsTitleColor || setting?.homeNewsTitleColor || headingColor;
  const excerptColor = setting?.globalExcerptColor || setting?.homeExcerptColor || setting?.excerptColor || '#4b5563';
  const metaColor = setting?.globalMetaColor || setting?.homeMetaColor || setting?.metaColor || '#9ca3af';
  const hoverColor = setting?.homeHoverColor || accent;
  const borderColor = setting?.globalBorderColor || "#e5e7eb";
  const surfaceColor = setting?.globalSurfaceColor || "#f9fafb";
  const elevatedColor = setting?.globalElevatedColor || "#ffffff";
  const mutedTextColor = setting?.globalMutedTextColor || metaColor || "#9ca3af";
  const archiveRadius = normalizeRadius(setting?.globalBorderRadius ?? setting?.postGlobalBorderRadius, "0.75rem");
  const archiveTitleSize = formatSize(setting?.archiveTitleFontSize ?? setting?.globalWidgetTitleFontSize, "2.25rem");
  const archiveTitleWeight = typeof (setting?.archiveTitleFontWeight ?? setting?.globalWidgetTitleFontWeight) === "string"
    ? (setting?.archiveTitleFontWeight ?? setting?.globalWidgetTitleFontWeight)
    : "700";
  const archiveTitleFontValue = setting?.archiveTitleFont || setting?.globalWidgetTitleFont || setting?.headingFont || "var(--font-heading, sans-serif)";
  const archiveTitleFont = resolvePublicFont(archiveTitleFontValue, "var(--font-heading, sans-serif)");
  const archiveTitleSynthesis = resolveThemeFontSynthesis(archiveTitleFontValue);
  const archiveExcerptSize = formatSize(setting?.archiveExcerptFontSize ?? setting?.globalExcerptFontSize, "1rem");
  const archiveExcerptWeight = typeof (setting?.archiveExcerptFontWeight ?? setting?.globalExcerptFontWeight) === "string"
    ? (setting?.archiveExcerptFontWeight ?? setting?.globalExcerptFontWeight)
    : "400";
  const archiveExcerptFontValue = setting?.archiveExcerptFont || setting?.globalExcerptFont || setting?.bodyFont || "var(--font-body, sans-serif)";
  const archiveExcerptFont = resolvePublicFont(archiveExcerptFontValue, "var(--font-body, sans-serif)");
  const archiveExcerptSynthesis = resolveThemeFontSynthesis(archiveExcerptFontValue);
  const archiveMetaSize = formatSize(setting?.archiveMetaFontSize ?? setting?.globalMetaFontSize, "0.8125rem");
  const archiveMetaWeight = typeof (setting?.archiveMetaFontWeight ?? setting?.globalMetaFontWeight) === "string"
    ? (setting?.archiveMetaFontWeight ?? setting?.globalMetaFontWeight)
    : "500";
  const archiveMetaFontValue = setting?.archiveMetaFont || setting?.globalMetaFont || setting?.bodyFont || "var(--font-body, sans-serif)";
  const archiveMetaFont = resolvePublicFont(archiveMetaFontValue, "var(--font-body, sans-serif)");
  const archiveMetaSynthesis = resolveThemeFontSynthesis(archiveMetaFontValue);
  const widgetTitleSize = formatSize(setting?.globalWidgetTitleFontSize ?? setting?.homeWidgetTitleFontSize, "24px");
  const widgetTitleWeight = typeof (setting?.globalWidgetTitleFontWeight ?? setting?.homeWidgetTitleFontWeight) === "string"
    ? (setting?.globalWidgetTitleFontWeight ?? setting?.homeWidgetTitleFontWeight)
    : "700";
  const widgetTitleFontValue = setting?.globalWidgetTitleFont || setting?.homeWidgetTitleFont || setting?.headingFont || "var(--font-heading, sans-serif)";
  const widgetTitleLineHeight = typeof (setting?.globalWidgetTitleLineHeight ?? setting?.homeWidgetTitleLineHeight) === "string"
    ? (setting?.globalWidgetTitleLineHeight ?? setting?.homeWidgetTitleLineHeight)
    : "1.3";
  const widgetTitleFont = resolvePublicFont(widgetTitleFontValue, "var(--font-heading, sans-serif)");
  const widgetTitleSynthesis = resolveThemeFontSynthesis(widgetTitleFontValue);
  const newsTitleSize = formatSize(setting?.globalNewsTitleFontSize ?? setting?.homeNewsTitleFontSize, "1.125rem");
  const newsTitleWeight = typeof (setting?.globalNewsTitleFontWeight ?? setting?.homeNewsTitleFontWeight) === "string"
    ? (setting?.globalNewsTitleFontWeight ?? setting?.homeNewsTitleFontWeight)
    : "600";
  const newsTitleFontValue = setting?.globalNewsTitleFont || setting?.homeNewsTitleFont || setting?.headingFont || "var(--font-heading, sans-serif)";
  const newsTitleFont = resolvePublicFont(newsTitleFontValue, "var(--font-heading, sans-serif)");
  const newsTitleSynthesis = resolveThemeFontSynthesis(newsTitleFontValue);
  const newsTitleLineHeight = typeof (setting?.globalNewsTitleLineHeight ?? setting?.homeNewsTitleLineHeight) === "string"
    ? (setting?.globalNewsTitleLineHeight ?? setting?.homeNewsTitleLineHeight)
    : "1.35";
  const excerptSize = formatSize(setting?.globalExcerptFontSize ?? setting?.homeExcerptFontSize, "0.875rem");
  const excerptWeight = typeof (setting?.globalExcerptFontWeight ?? setting?.homeExcerptFontWeight) === "string"
    ? (setting?.globalExcerptFontWeight ?? setting?.homeExcerptFontWeight)
    : "400";
  const excerptFontValue = setting?.globalExcerptFont || setting?.homeExcerptFont || setting?.bodyFont || "var(--font-body, sans-serif)";
  const excerptFont = resolvePublicFont(excerptFontValue, "var(--font-body, sans-serif)");
  const excerptSynthesis = resolveThemeFontSynthesis(excerptFontValue);
  const excerptLineHeight = typeof (setting?.globalContentLineHeight ?? setting?.homeExcerptLineHeight) === "string"
    ? (setting?.globalContentLineHeight ?? setting?.homeExcerptLineHeight)
    : "1.6";
  const metaSize = formatSize(setting?.globalMetaFontSize ?? setting?.homeMetaFontSize, "0.75rem");
  const metaWeight = typeof (setting?.globalMetaFontWeight ?? setting?.homeMetaFontWeight) === "string"
    ? (setting?.globalMetaFontWeight ?? setting?.homeMetaFontWeight)
    : "500";
  const metaFontValue = setting?.globalMetaFont || setting?.homeMetaFont || setting?.bodyFont || "var(--font-body, sans-serif)";
  const metaFont = resolvePublicFont(metaFontValue, "var(--font-body, sans-serif)");
  const metaSynthesis = resolveThemeFontSynthesis(metaFontValue);
  const metaLineHeight = typeof (setting?.globalMetaLineHeight ?? setting?.homeMetaLineHeight) === "string"
    ? (setting?.globalMetaLineHeight ?? setting?.homeMetaLineHeight)
    : "1.4";
  const visibleBlocks = (blocks || []).filter((block) => block?.isVisible !== false);

  const collectResolvedWidgets = (blocksList: any[]): any[] => {
    const out: any[] = [];
    for (const block of blocksList || []) {
      if (!block || block.isVisible === false) continue;
      if (block.type === "section") {
        const children = resolveSectionChildrenWithSidebarSource(block, sourceBlocksByLocation, "archive");
        out.push(...collectResolvedWidgets(children));
      } else {
        out.push(block);
      }
    }
    return out;
  };

  const allResolvedWidgets = collectResolvedWidgets(visibleBlocks);
  const archiveListWidget = allResolvedWidgets.find(
    (w) => w?.type === "archive_post_grid" || w?.type === "archive_post_list"
  );
  const archivePaginationWidget = allResolvedWidgets.find((w) => w?.type === "archive_pagination");

  const renderWidgetWithSpacing = (
    widget: any,
    content: React.ReactNode,
    growClass = "",
    directions?: { mobile?: string; tablet?: string; desktop?: string }
  ) => {
    if (!widget || content == null || content === false) return null;
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
      ["--aw-ta-d" as any]: alignD,
      ["--aw-ta-t" as any]: alignT,
      ["--aw-ta-m" as any]: alignM,
      ["--aw-mt-d" as any]: mtDPos,
      ["--aw-mt-t" as any]: mtTPos,
      ["--aw-mt-m" as any]: mtMPos,
      ["--aw-mr-d" as any]: mrD,
      ["--aw-mr-t" as any]: mrT,
      ["--aw-mr-m" as any]: mrM,
      ["--aw-mb-d" as any]: mbDPos,
      ["--aw-mb-t" as any]: mbTPos,
      ["--aw-mb-m" as any]: mbMPos,
      ["--aw-ml-d" as any]: mlD,
      ["--aw-ml-t" as any]: mlT,
      ["--aw-ml-m" as any]: mlM,
      ["--aw-pt-d" as any]: ptD,
      ["--aw-pt-t" as any]: ptT,
      ["--aw-pt-m" as any]: ptM,
      ["--aw-pr-d" as any]: prD,
      ["--aw-pr-t" as any]: prT,
      ["--aw-pr-m" as any]: prM,
      ["--aw-pb-d" as any]: pbD,
      ["--aw-pb-t" as any]: pbT,
      ["--aw-pb-m" as any]: pbM,
      ["--aw-pl-d" as any]: plD,
      ["--aw-pl-t" as any]: plT,
      ["--aw-pl-m" as any]: plM,
    };

    return (
      <div
        key={widget.id}
        style={styleVars}
        className={`w-full min-w-0 ${growClass} ${selfAlignClass} [text-align:var(--aw-ta-m)] md:[text-align:var(--aw-ta-t)] lg:[text-align:var(--aw-ta-d)] mt-[var(--aw-mt-m)] mr-[var(--aw-mr-m)] mb-[var(--aw-mb-m)] ml-[var(--aw-ml-m)] pt-[var(--aw-pt-m)] pr-[var(--aw-pr-m)] pb-[var(--aw-pb-m)] pl-[var(--aw-pl-m)] md:mt-[var(--aw-mt-t)] md:mr-[var(--aw-mr-t)] md:mb-[var(--aw-mb-t)] md:ml-[var(--aw-ml-t)] md:pt-[var(--aw-pt-t)] md:pr-[var(--aw-pr-t)] md:pb-[var(--aw-pb-t)] md:pl-[var(--aw-pl-t)] lg:mt-[var(--aw-mt-d)] lg:mr-[var(--aw-mr-d)] lg:mb-[var(--aw-mb-d)] lg:ml-[var(--aw-ml-d)] lg:pt-[var(--aw-pt-d)] lg:pr-[var(--aw-pr-d)] lg:pb-[var(--aw-pb-d)] lg:pl-[var(--aw-pl-d)]`.trim()}
      >
        {content}
      </div>
    );
  };

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
        if (widget.id === archiveListWidget?.id) {
          return (
            <ArchiveClientController
              listBlock={widget}
              paginationBlock={archivePaginationWidget}
              initialPosts={posts}
              pageSize={pageSize}
              initialTotalPages={totalPages}
              basePath={archiveBasePath}
              archiveType={archiveType}
              archiveFilter={archiveFilter || {}}
              archiveDisplayCategory={archiveDisplayCategory}
              accentColor={accent}
              borderRadius={archiveRadius}
              setting={setting}
            />
          );
        }
        return <ArchivePostGrid block={widget} posts={posts} />;
      case "archive_post_list":
        if (widget.id === archiveListWidget?.id) {
          return (
            <ArchiveClientController
              listBlock={widget}
              paginationBlock={archivePaginationWidget}
              initialPosts={posts}
              pageSize={pageSize}
              initialTotalPages={totalPages}
              basePath={archiveBasePath}
              archiveType={archiveType}
              archiveFilter={archiveFilter || {}}
              archiveDisplayCategory={archiveDisplayCategory}
              customTitle={widget.title}
              accentColor={accent}
              borderRadius={archiveRadius}
              setting={setting}
            />
          );
        }
        return <ArchivePostList block={widget} posts={posts} customTitle={widget.title} accentColor={accent} borderRadius={archiveRadius} setting={setting} />;
      case "archive_pagination":
        return null;
      case "archive_empty_state":
        return <ArchiveEmptyState block={widget} isEmpty={posts.length === 0} />;
      default:
        break;
    }

    const effectiveType = resolveBlockTypeAlias(widget?.type);
    const blockDef = PRANALA_BLOCKS[effectiveType];
    if (!blockDef) return null;

    const displayTitle = widget?.title && widget.title.trim() !== "" ? widget.title : widget?.config?.title || "";

    const archiveFallbackNewsTitleTypes = new Set([
      "news_hero_slider",
      "news_grid_slider",
      "news_list",
      "news_grid",
      "news_bullet_list",
      "sidebar_widget",
    ]);

    const mergedConfig = {
      ...(widget?.config || {}),
      title: displayTitle,
    } as Record<string, unknown>;

    if (archiveFallbackNewsTitleTypes.has(effectiveType)) {
      delete mergedConfig.titleFontSize;
      delete mergedConfig.titleFontWeight;
      delete mergedConfig.titleLineHeight;
      delete mergedConfig.mobileTitleFontSize;
      delete mergedConfig.mobileTitleFontWeight;
      delete mergedConfig.mobileTitleLineHeight;
      delete mergedConfig.tabletTitleFontSize;
      delete mergedConfig.tabletTitleFontWeight;
      delete mergedConfig.tabletTitleLineHeight;
    }

    const Component = blockDef.component as React.ComponentType<Record<string, unknown>>;
    const mergedWidget = {
      ...widget,
      type: effectiveType,
      config: mergedConfig,
    };

    return (
      <div className={`relative group/widget w-full min-w-0 ${getResponsiveHideClass(mergedWidget?.config)}`.trim()}>
        <Component
          key={widget.id}
          block={mergedWidget}
          posts={widgetData}
          categories={categories}
          customTitle={displayTitle}
          accentColor={accent}
          borderRadius={archiveRadius}
        />
      </div>
    );
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
      : `${alignMobile === "center" ? "items-center text-center" : alignMobile === "right" ? "items-end text-right" : "items-start text-left"}`;
    const alignClassTablet = dirTablet === "horizontal"
      ? (alignTablet === "center" ? "md:justify-center" : alignTablet === "right" ? "md:justify-end" : "md:justify-start")
      : `${alignTablet === "center" ? "md:items-center md:text-center" : alignTablet === "right" ? "md:items-end md:text-right" : "md:items-start md:text-left"}`;
    const alignClassDesktop = dirDesktop === "horizontal"
      ? (alignDesktop === "center" ? "lg:justify-center" : alignDesktop === "right" ? "lg:justify-end" : "lg:justify-start")
      : `${alignDesktop === "center" ? "lg:items-center lg:text-center" : alignDesktop === "right" ? "lg:items-end lg:text-right" : "lg:items-start lg:text-left"}`;

    const itemClass = [
      dirMobile === "horizontal" && sizeMobile === "grow" ? "flex-1 basis-0 min-w-0" : "",
      dirTablet === "horizontal" && sizeTablet === "grow" ? "md:flex-1 md:basis-0 md:min-w-0" : "",
      dirDesktop === "horizontal" && sizeDesktop === "grow" ? "lg:flex-1 lg:basis-0 lg:min-w-0" : "",
    ].filter(Boolean).join(" ");

    const renderedColumns = columns.map((items, i) => (
      <div
        key={`${section.id}-col-${i}`}
        className={`${getColSpanClass(colWidths[i])} flex ${directionClassMobile} ${alignClassMobile} ${crossClassMobile} ${directionClassTablet} ${alignClassTablet} ${crossClassTablet} ${directionClassDesktop} ${alignClassDesktop} ${crossClassDesktop} ${i === sidebarIndex ? "md:sticky md:top-24 md:self-start" : ""} gap-[var(--sec-wgap-m)] md:gap-[var(--sec-wgap-t)] lg:gap-[var(--sec-wgap-d)]`.trim()}
      >
        {items.map((widget: any) =>
          renderWidgetWithSpacing(
            widget,
            widget.type === "section" ? renderSection(widget, true) : renderArchiveWidget(widget),
            itemClass,
            { mobile: dirMobile, tablet: dirTablet, desktop: dirDesktop }
          )
        )}
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
        '--border': borderColor,
        '--bg-surface': surfaceColor,
        '--bg-elevated': elevatedColor,
        '--muted-text': mutedTextColor,
        '--heading-color': headingColor,
        '--home-widget-title-color': widgetTitleColor,
        '--home-widget-title-size': widgetTitleSize,
        '--home-widget-title-weight': widgetTitleWeight,
        '--home-widget-title-line-height': widgetTitleLineHeight,
        '--home-widget-title-font': widgetTitleFont,
        '--home-widget-title-synthesis': widgetTitleSynthesis,
        '--archive-widget-title-color': widgetTitleColor,
        '--archive-widget-title-size': widgetTitleSize,
        '--archive-widget-title-weight': widgetTitleWeight,
        '--archive-widget-title-line-height': widgetTitleLineHeight,
        '--archive-widget-title-font': widgetTitleFont,
        '--archive-widget-title-synthesis': widgetTitleSynthesis,
        '--home-news-title-color': newsTitleColor,
        '--home-meta-color': metaColor,
        '--home-excerpt-color': excerptColor,
        '--home-hover-color': hoverColor,
        '--home-main-box-radius': archiveRadius,
        '--archive-title-size': archiveTitleSize,
        '--archive-title-weight': archiveTitleWeight,
        '--archive-title-font': archiveTitleFont,
        '--archive-title-synthesis': archiveTitleSynthesis,
        '--archive-header-description-default-size': archiveExcerptSize,
        '--archive-header-description-default-weight': archiveExcerptWeight,
        '--archive-header-description-default-font': archiveExcerptFont,
        '--archive-header-description-default-synthesis': archiveExcerptSynthesis,
        '--archive-header-meta-default-size': archiveMetaSize,
        '--archive-header-meta-default-weight': archiveMetaWeight,
        '--archive-header-meta-default-font': archiveMetaFont,
        '--archive-header-meta-default-synthesis': archiveMetaSynthesis,
        '--home-news-title-size': newsTitleSize,
        '--home-news-title-weight': newsTitleWeight,
        '--home-news-title-line-height': newsTitleLineHeight,
        '--home-news-title-font': newsTitleFont,
        '--home-news-title-synthesis': newsTitleSynthesis,
        '--archive-news-title-color': newsTitleColor,
        '--archive-news-title-size': newsTitleSize,
        '--archive-news-title-weight': newsTitleWeight,
        '--archive-news-title-line-height': newsTitleLineHeight,
        '--archive-news-title-font': newsTitleFont,
        '--archive-news-title-synthesis': newsTitleSynthesis,
        '--home-excerpt-size': excerptSize,
        '--home-excerpt-weight': excerptWeight,
        '--home-excerpt-line-height': excerptLineHeight,
        '--home-excerpt-font': excerptFont,
        '--home-excerpt-synthesis': excerptSynthesis,
        '--archive-excerpt-color': excerptColor,
        '--archive-excerpt-size': excerptSize,
        '--archive-excerpt-weight': excerptWeight,
        '--archive-excerpt-line-height': excerptLineHeight,
        '--archive-excerpt-font': excerptFont,
        '--archive-excerpt-synthesis': excerptSynthesis,
        '--home-meta-size': metaSize,
        '--home-meta-weight': metaWeight,
        '--home-meta-line-height': metaLineHeight,
        '--home-meta-font': metaFont,
        '--home-meta-synthesis': metaSynthesis,
        '--archive-meta-color': metaColor,
        '--archive-meta-size': metaSize,
        '--archive-meta-weight': metaWeight,
        '--archive-meta-line-height': metaLineHeight,
        '--archive-meta-font': metaFont,
        '--archive-meta-synthesis': metaSynthesis,
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

      <Footer siteName={siteName} logoUrl={setting?.logoUrl} categories={categories} footerConfig={footerConfig} menusByLocation={menusByLocation} setting={setting} />
    </div>
  );
}
