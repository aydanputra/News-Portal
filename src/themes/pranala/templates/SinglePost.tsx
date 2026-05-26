import React from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { PRANALA_BLOCKS } from "../blocks/registry";
import Section from "../blocks/Section";
import PranalaPostContent from "../components/PranalaPostContent";
import PostWidgetRenderer from "../blockpost/PostWidgetRenderer";
import { extractFirstSidebarSection, resolveSectionChildrenWithSidebarSource } from "@/lib/sidebar-reference";
import SidebarWidgetRenderer from "../components/SidebarWidgetRenderer";
import SidebarDebugPanel from "../components/SidebarDebugPanel";
import { getYouTubeEmbedUrl } from "@/lib/utils";

interface PranalaSinglePostProps {
  post: any;
  setting?: any;
  categories: any[];
  blocks: any[];
  blockData?: Record<string, any[]>;
  inlineRelatedPosts?: any[];
  sourceBlocksByLocation?: Record<string, any[]>;
  menusByLocation?: any;
  headerConfig?: any;
  footerConfig?: any;
}

const parseLayout = (layoutStr: string = "100"): number[] => {
  switch (layoutStr) {
    case "100":
      return [12];
    case "50-50":
      return [6, 6];
    case "33-66":
      return [4, 8];
    case "66-33":
      return [8, 4];
    case "33-33-33":
      return [4, 4, 4];
    case "25-25-25-25":
      return [3, 3, 3, 3];
    default:
      return [12];
  }
};

const getColSpan = (width: number) => {
  switch (width) {
    case 1:
      return "md:col-span-1";
    case 2:
      return "md:col-span-2";
    case 3:
      return "md:col-span-3";
    case 4:
      return "md:col-span-4";
    case 5:
      return "md:col-span-5";
    case 6:
      return "md:col-span-6";
    case 7:
      return "md:col-span-7";
    case 8:
      return "md:col-span-8";
    case 9:
      return "md:col-span-9";
    case 10:
      return "md:col-span-10";
    case 11:
      return "md:col-span-11";
    default:
      return "md:col-span-12";
  }
};

const isVisible = (block: any) => block?.isVisible !== false;
const getOrder = (block: any) => (typeof block?.order === "number" ? block.order : 0);
const isTruthy = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";
const formatLongDateId = (value?: string | Date | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
};
const getResponsiveHideClass = (config: any) => {
  const classes: string[] = [];
  if (isTruthy(config?.hideOnDesktop)) classes.push("hide-desktop-widget");
  if (isTruthy(config?.hideOnTablet)) classes.push("hide-tablet-widget");
  if (isTruthy(config?.hideOnMobile)) classes.push("hide-mobile-widget");
  return classes.join(" ");
};
const toPx = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return `${Number(value)}px`;
  return undefined;
};
const resolveImageUrl = (item: any): string | undefined => {
  if (!item) return undefined;
  const candidates = [
    item.image,
    item.thumbnail,
    item.coverImage,
    item.featuredImage,
    item.featured_image,
    item.featuredImage?.fileUrl,
    item.featuredImage?.url,
    item.media?.url,
    item.media?.fileUrl
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() !== "") {
      const trimmed = candidate.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) return trimmed;
      return `/${trimmed.replace(/^\/+/, "")}`;
    }
  }
  return undefined;
};
const getFirstImageFromContent = (html: unknown): string | undefined => {
  if (typeof html !== "string" || html.trim() === "") return undefined;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  const src = match?.[1]?.trim();
  if (!src) return undefined;
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src;
  return `/${src.replace(/^\/+/, "")}`;
};
const normalizeRadiusValue = (value: unknown, fallback = "0.75rem"): string => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    if (trimmed === "none") return "0";
    if (trimmed === "sm") return "0.125rem";
    if (trimmed === "md") return "0.375rem";
    if (trimmed === "lg") return "0.5rem";
    if (trimmed === "xl") return "0.75rem";
    if (trimmed === "2xl") return "1rem";
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    return trimmed;
  }
  return fallback;
};
const formatContainerSize = (value: unknown, fallback: string): string => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    return trimmed;
  }
  return fallback;
};
const parseInlineRelatedPositions = (value: unknown): number[] => {
  if (typeof value !== "string") return [2];
  const parsed = value
    .split(",")
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item, index, array) => Number.isFinite(item) && item > 0 && array.indexOf(item) === index)
    .sort((a, b) => a - b);
  return parsed.length > 0 ? parsed : [2];
};
export default function PranalaSinglePost({ post, setting, categories, blocks, blockData = {}, inlineRelatedPosts = [], sourceBlocksByLocation, menusByLocation, headerConfig, footerConfig }: PranalaSinglePostProps) {
  const siteName = setting?.siteName || "Pranala News";
  const logoUrl = setting?.logoUrl;
  const accent = setting?.globalAccentColor || setting?.accentColor || "#f59e0b";
  const hoverColor = setting?.postHoverColor || setting?.homeHoverColor || setting?.globalAccentColor || "#2563eb";
  const metaColor = setting?.postMetaColor || setting?.globalMetaColor || setting?.homeMetaColor || "#9ca3af";
  const contentColor = setting?.postContentColor || "#1f2937";
  const headingColor = setting?.postHeadingColor || setting?.homeTitleColor || "#111827";
  const postLinkColor = setting?.postLinkColor || hoverColor;
  const postLinkHoverColor = setting?.postLinkHoverColor || setting?.postHoverColor || setting?.homeHoverColor || hoverColor;
  const postBadgeTextColor = setting?.postBadgeTextColor || metaColor;
  const postBadgeBgColor = setting?.postBadgeBgColor || "#f3f4f6";
  const widgetTitleColor = setting?.homeWidgetTitleColor || setting?.globalWidgetTitleColor || headingColor;
  const widgetTitleSize = formatContainerSize(setting?.homeWidgetTitleFontSize ?? setting?.globalWidgetTitleFontSize, "24px");
  const widgetTitleWeight = typeof (setting?.homeWidgetTitleFontWeight ?? setting?.globalWidgetTitleFontWeight) === "string"
    ? String(setting?.homeWidgetTitleFontWeight ?? setting?.globalWidgetTitleFontWeight)
    : "700";
  const widgetTitleFont = setting?.homeWidgetTitleFont || setting?.globalWidgetTitleFont || setting?.headingFont || "inherit";
  const newsTitleColor = setting?.homeNewsTitleColor || setting?.globalNewsTitleColor || headingColor;
  const newsTitleSize = formatContainerSize(setting?.homeNewsTitleFontSize ?? setting?.globalNewsTitleFontSize, "18px");
  const metaSize = formatContainerSize(setting?.homeMetaFontSize ?? setting?.globalMetaFontSize, "12px");
  const excerptTone = setting?.homeExcerptColor || setting?.globalExcerptColor || contentColor;
  const excerptSize = formatContainerSize(setting?.homeExcerptFontSize ?? setting?.globalExcerptFontSize, "14px");
  const postTitleSize = formatContainerSize(setting?.postTitleFontSize, "3rem");
  const postTitleWeight = typeof setting?.postTitleFontWeight === "string" ? setting.postTitleFontWeight : "700";
  const postTitleFont = setting?.postTitleFont || setting?.headingFont || "Inter";
  const postSubtitleSize = formatContainerSize(setting?.postSubtitleFontSize, "1.125rem");
  const postSubtitleWeight = typeof setting?.postSubtitleFontWeight === "string" ? setting.postSubtitleFontWeight : "400";
  const postSubtitleFont = setting?.postSubtitleFont || setting?.bodyFont || "Inter";
  const borderRadius = normalizeRadiusValue(setting?.postGlobalBorderRadius ?? setting?.globalBorderRadius ?? "0.75rem");
  const isInfographicPost = String(post?.type || "").toUpperCase() === "INFOGRAPHIC";
  const infographicHeaderImageUrl = isInfographicPost
    ? (() => {
        const candidates = [
          post?.featuredImage?.fileUrl,
          post?.featuredImage?.url,
          post?.featured_image,
          post?.featuredImage,
          post?.media?.fileUrl,
          post?.media?.url,
        ];
        for (const candidate of candidates) {
          if (typeof candidate === "string" && candidate.trim() !== "") {
            const trimmed = candidate.trim();
            if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) return trimmed;
            return `/${trimmed.replace(/^\/+/, "")}`;
          }
        }
        return undefined;
      })()
    : undefined;
  const imageUrl = infographicHeaderImageUrl || resolveImageUrl(post) || getFirstImageFromContent(post?.content);
  const videoEmbedSrc = post?.type === "VIDEO" && typeof post?.videoUrl === "string" ? getYouTubeEmbedUrl(post.videoUrl) : null;
  const containerMode = setting?.postContainerWidth || "boxed";
  const customWidth = setting?.postCustomContainerWidth || "1250";
  const containerClass = containerMode === "full" ? "w-full px-4" : "container mx-auto px-4";
  const containerStyle = containerMode === "full" ? {} : { maxWidth: containerMode === "custom" ? `${customWidth}px` : "1250px" };
  const inlineRelatedPositions = parseInlineRelatedPositions(setting?.postRelatedPositions);
  const inlineAdPositions = parseInlineRelatedPositions(setting?.postInlineAdPositions);

  const renderDefaultFallback = () => {
    return (
      <article className="space-y-8">
        <div className="text-sm flex items-center gap-2" style={{ color: metaColor }}>
          <Link href="/" className="hover:text-[var(--post-hover-color)]">Home</Link>
          <span>/</span>
          {post.category && (
            <Link href={`/kategori/${post.category.slug}`} className="hover:text-[var(--post-hover-color)]">
              {post.category.name}
            </Link>
          )}
          <span>/</span>
          <span className="truncate max-w-[220px]">{post.title}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight" style={{ color: headingColor }}>{post.title}</h1>
        {post.subtitle && <p className="text-lg" style={{ color: contentColor }}>{post.subtitle}</p>}
        <div className="flex items-center gap-4 text-sm" style={{ color: metaColor }}>
          {post.author?.name && <span>{post.author.name}</span>}
          <span>•</span>
          <time>{formatLongDateId(post.publishedAt || post.createdAt)}</time>
        </div>
        {videoEmbedSrc ? (
          <div className="relative w-full aspect-video overflow-hidden bg-black" style={{ borderRadius: "var(--home-main-box-radius, 0.75rem)" }}>
            <iframe
              src={videoEmbedSrc}
              title={post.title || "Video"}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : imageUrl ? (
          <div className="relative w-full aspect-video overflow-hidden bg-[var(--bg-elevated)]" style={{ borderRadius: "var(--home-main-box-radius, 0.75rem)" }}>
            <Image src={imageUrl} alt={post.title} fill className="object-cover" unoptimized />
          </div>
        ) : null}
        <div style={{ color: contentColor }}>
          <PranalaPostContent
            content={post.content || ""}
            inlineRelatedItems={inlineRelatedPosts}
            inlineRelatedConfig={{
              enabled: Boolean(setting?.postInlineRelated),
              positions: inlineRelatedPositions,
              count: Math.max(1, Number.parseInt(String(setting?.postRelatedCount || "2"), 10) || 2),
              layout: String(setting?.postInlineRelatedLayout || "list"),
              gridColumns: Math.min(4, Math.max(1, Number.parseInt(String(setting?.postInlineRelatedGridColumns || "2"), 10) || 2)),
              cardColumns: Math.min(2, Math.max(1, Number.parseInt(String(setting?.postInlineRelatedCardColumns || "1"), 10) || 1)),
              titleFontSize: Number.parseInt(String(setting?.postInlineRelatedTitleFontSize || "16"), 10) || 16,
              titleFontWeight: String(setting?.postInlineRelatedTitleFontWeight || "700"),
              titleLineHeight: String(setting?.postInlineRelatedTitleLineHeight || "1.35"),
              fontSize: Number.parseInt(String(setting?.postInlineRelatedFontSize || "14"), 10) || 14,
              headingColor: String(setting?.postInlineRelatedTitleColor || "#1e293b"),
              textColor: String(setting?.postInlineRelatedTextColor || "#1f2937"),
              hoverColor: String(setting?.postInlineRelatedHoverColor || setting?.postPrimaryColor || "#2563eb"),
            }}
            inlineAdsConfig={{
              enabled: Boolean(setting?.postInlineAds),
              positions: inlineAdPositions,
            }}
          />
        </div>
      </article>
    );
  };

  const renderWidget = (widget: any) => {
    const sourceWidgetId = widget?.config?.sourceWidgetId || widget?.sourceWidgetId;
    const widgetData = (blockData[widget.id] || (sourceWidgetId ? blockData[sourceWidgetId] : undefined)) || [];
      
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
          renderContext="single-post"
        />
      );
    }

    const rawConfig = widget?.config || {};
    const config = widget?.type === "tag_cloud"
      ? {
          limit: 10,
          useBox: false,
          tagFontSize: 12,
          tagBorderRadius: "default",
          tagGapX: 2,
          tagGapY: 2,
          tagPaddingX: 12,
          tagPaddingY: 4,
          tagTextColor: "var(--tag-color-default)",
          tagBackgroundColor: "var(--tag-bg-default)",
          tagBorderColor: "var(--tag-border-color-default)",
          tagHoverBackgroundColor: "var(--tag-hover-bg-default)",
          tagHoverTextColor: "var(--tag-hover-color-default)",
          tagHoverBorderColor: "var(--tag-hover-border-color-default)",
          ...rawConfig,
        }
      : rawConfig;
    const title = widget?.title || config.title || "";
    const responsiveHideClass = getResponsiveHideClass(config);
    const textAlign = config.textAlign === "left" || config.textAlign === "center" || config.textAlign === "right" || config.textAlign === "justify"
      ? config.textAlign
      : undefined;
    const widgetContainerStyle: React.CSSProperties = {
      marginTop: toPx(config.marginTop),
      marginRight: toPx(config.marginRight),
      marginBottom: toPx(config.marginBottom),
      marginLeft: toPx(config.marginLeft),
      paddingTop: toPx(config.paddingTop),
      paddingRight: toPx(config.paddingRight),
      paddingBottom: toPx(config.paddingBottom),
      paddingLeft: toPx(config.paddingLeft),
      textAlign,
    };
    
    const inheritedSidebarLocation = widget?.config?.inheritedSidebarLocation || widget?.inheritedSidebarLocation;
    const useSharedSidebarVisuals = widget?.config?.inheritedSidebarSource === true && inheritedSidebarLocation && inheritedSidebarLocation !== "post";
    if (useSharedSidebarVisuals) {
      (widgetContainerStyle as Record<string, string>)["--home-hover-color"] = setting?.homeHoverColor || accent;
      (widgetContainerStyle as Record<string, string>)["--home-main-box-radius"] = borderRadius;
      (widgetContainerStyle as Record<string, string>)["--post-badge-bg-color"] = "var(--load-more-bg)";
      (widgetContainerStyle as Record<string, string>)["--post-badge-text-color"] = "var(--load-more-text)";
      (widgetContainerStyle as Record<string, string>)["--post-link-hover-color"] = "var(--load-more-text-hover)";
    }

    const isPostWidget = typeof widget?.type === "string" && widget.type.startsWith("post_");
    if (isPostWidget) {
      return (
        <div className={responsiveHideClass}>
          <PostWidgetRenderer
            widget={widget}
            post={post}
            setting={setting}
            inlineRelatedPosts={inlineRelatedPosts}
            headingColor={headingColor}
            metaColor={metaColor}
            contentColor={contentColor}
            accentColor={accent}
            hoverColor={hoverColor}
            blockData={blockData}
          />
        </div>
      );
    }

    if (widget.type === "sidebar_widget" || widget.type === "tag_cloud" || widget.type === "ad_banner") {
      const blockDef = PRANALA_BLOCKS[widget.type];
      if (!blockDef) return null;
      const Component = blockDef.component as React.ComponentType<Record<string, unknown>>;
      const sourceWidgetId = widget?.config?.sourceWidgetId || widget?.sourceWidgetId;
      const widgetData = blockData[widget.id] || (sourceWidgetId ? blockData[sourceWidgetId] : undefined) || [];
      const normalizedWidget = config === rawConfig ? widget : { ...widget, config };
      return (
        <div className={`relative group/widget ${responsiveHideClass}`.trim()} style={widgetContainerStyle}>
          <Component block={normalizedWidget} posts={widgetData} categories={categories} customTitle={title} accentColor={accent} borderRadius={borderRadius} />
        </div>
      );
    }

    return null;
  };

  const renderSection = (section: any, isNested = false) => {
    const config = section.config || {};
    const sourceLocation = config?.followSharedSidebar ? config?.sidebarSourceLocation : null;
    const sourceSection =
      sourceLocation === "home"
        ? extractFirstSidebarSection(sourceBlocksByLocation?.home || [])
        : sourceLocation === "archive"
          ? extractFirstSidebarSection(sourceBlocksByLocation?.archive || [])
          : sourceLocation === "post"
            ? extractFirstSidebarSection(sourceBlocksByLocation?.post || [])
            : null;
    const shouldInheritSectionLayout =
      config?.followSharedSidebar === true &&
      sourceLocation === "home" &&
      sourceSection?.config &&
      typeof sourceSection.config === "object";
    const effectiveConfig = shouldInheritSectionLayout
      ? {
          ...config,
          layout: sourceSection.config.layout ?? config.layout,
          blockGap: sourceSection.config.blockGap ?? config.blockGap,
          tabletBlockGap: sourceSection.config.tabletBlockGap ?? config.tabletBlockGap,
          mobileBlockGap: sourceSection.config.mobileBlockGap ?? config.mobileBlockGap,
          columnGap: sourceSection.config.columnGap ?? config.columnGap,
          tabletColumnGap: sourceSection.config.tabletColumnGap ?? config.tabletColumnGap,
          mobileColumnGap: sourceSection.config.mobileColumnGap ?? config.mobileColumnGap,
          containerWidth: sourceSection.config.containerWidth ?? config.containerWidth,
          tabletContainerWidth: sourceSection.config.tabletContainerWidth ?? config.tabletContainerWidth,
          mobileContainerWidth: sourceSection.config.mobileContainerWidth ?? config.mobileContainerWidth,
          customContainerWidth: sourceSection.config.customContainerWidth ?? config.customContainerWidth,
          tabletCustomContainerWidth: sourceSection.config.tabletCustomContainerWidth ?? config.tabletCustomContainerWidth,
          mobileCustomContainerWidth: sourceSection.config.mobileCustomContainerWidth ?? config.mobileCustomContainerWidth,
        }
      : config;
    const responsiveHideClass = getResponsiveHideClass(config);
    const layout = effectiveConfig.layout || "100";
    const SectionComponent = Section;
    const colWidths = parseLayout(layout);
    const children = resolveSectionChildrenWithSidebarSource(section, sourceBlocksByLocation, "post");
    const visibleChildren = children.filter(isVisible);
    const columns: any[][] = Array.from({ length: colWidths.length }, () => []);

    for (const child of visibleChildren) {
      const idx = typeof child?.config?.columnIndex === "number" ? child.config.columnIndex : 0;
      if (columns[idx]) columns[idx].push(child);
      else columns[0].push(child);
    }

    const sidebarIndex = colWidths.length === 2 && colWidths[0] !== colWidths[1]
      ? (colWidths[0] < colWidths[1] ? 0 : 1)
      : -1;

    const dirMobile = effectiveConfig.mobileChildrenDirection === "horizontal" ? "horizontal" : "vertical";
    const dirTablet = effectiveConfig.tabletChildrenDirection === "horizontal" ? "horizontal" : "vertical";
    const dirDesktop = effectiveConfig.childrenDirection === "horizontal" ? "horizontal" : "vertical";

    const alignMobile = effectiveConfig.mobileChildrenAlign === "right" ? "right" : effectiveConfig.mobileChildrenAlign === "center" ? "center" : "left";
    const alignTablet = effectiveConfig.tabletChildrenAlign === "right" ? "right" : effectiveConfig.tabletChildrenAlign === "center" ? "center" : "left";
    const alignDesktop = effectiveConfig.childrenAlign === "right" ? "right" : effectiveConfig.childrenAlign === "center" ? "center" : "left";

    const vAlignMobile = effectiveConfig.mobileChildrenVerticalAlign === "bottom" ? "bottom" : effectiveConfig.mobileChildrenVerticalAlign === "center" ? "center" : "top";
    const vAlignTablet = effectiveConfig.tabletChildrenVerticalAlign === "bottom" ? "bottom" : effectiveConfig.tabletChildrenVerticalAlign === "center" ? "center" : "top";
    const vAlignDesktop = effectiveConfig.childrenVerticalAlign === "bottom" ? "bottom" : effectiveConfig.childrenVerticalAlign === "center" ? "center" : "top";

    const sizeMobile = effectiveConfig.mobileChildrenSizing === "grow" ? "grow" : "auto";
    const sizeTablet = effectiveConfig.tabletChildrenSizing === "grow" ? "grow" : "auto";
    const sizeDesktop = effectiveConfig.childrenSizing === "grow" ? "grow" : "auto";

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
        className={`${getColSpan(colWidths[i])} flex ${directionClassMobile} ${alignClassMobile} ${crossClassMobile} ${directionClassTablet} ${alignClassTablet} ${crossClassTablet} ${directionClassDesktop} ${alignClassDesktop} ${crossClassDesktop} ${i === sidebarIndex ? "md:sticky md:top-24 md:self-start" : ""}`.trim()}
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
            {widget.type === "section" ? renderSection(widget, true) : renderWidget(widget)}
          </div>
        ))}
      </div>
    ));

    return (
      <div key={section.id} className={responsiveHideClass}>
        <SectionComponent
          block={shouldInheritSectionLayout ? { ...section, config: effectiveConfig } : section}
          layout={layout}
          colWidths={colWidths}
          isNested={isNested}
        >
          {renderedColumns}
        </SectionComponent>
      </div>
    );
  };

  const hasBuilderBlocks = Array.isArray(blocks) && blocks.length > 0;

  return (
    <div
      className="public-theme min-h-screen flex flex-col font-sans text-gray-900"
      style={{
        "--accent": accent,
        "--post-hover-color": hoverColor,
        "--home-widget-title-color": widgetTitleColor,
        "--home-widget-title-size": widgetTitleSize,
        "--home-widget-title-weight": widgetTitleWeight,
        "--home-widget-title-font": widgetTitleFont,
        "--home-news-title-color": newsTitleColor,
        "--home-news-title-size": newsTitleSize,
        "--home-news-title-weight": setting?.homeNewsTitleFontWeight || setting?.globalNewsTitleFontWeight || "600",
        "--home-news-title-font": setting?.homeNewsTitleFont || setting?.globalNewsTitleFont || setting?.headingFont || "inherit",
        "--home-meta-color": metaColor,
        "--home-meta-size": metaSize,
        "--home-meta-weight": setting?.homeMetaFontWeight || setting?.globalMetaFontWeight || "500",
        "--home-meta-font": setting?.homeMetaFont || setting?.globalMetaFont || setting?.bodyFont || "inherit",
        "--home-excerpt-color": excerptTone,
        "--home-excerpt-size": excerptSize,
        "--home-excerpt-weight": setting?.homeExcerptFontWeight || setting?.globalExcerptFontWeight || "400",
        "--home-excerpt-font": setting?.homeExcerptFont || setting?.globalExcerptFont || setting?.bodyFont || "Inter",
        "--home-hover-color": setting?.homeHoverColor || hoverColor,
        "--post-content-color": setting?.postContentColor || setting?.homeExcerptColor || setting?.globalExcerptColor || "#1f2937",
        "--post-content-heading-color": setting?.postHeadingColor || setting?.homeTitleColor || setting?.headingColor || "#111827",
        "--post-link-color": postLinkColor,
        "--post-link-hover-color": postLinkHoverColor,
        "--post-badge-text-color": postBadgeTextColor,
        "--post-badge-bg-color": postBadgeBgColor,
        "--post-title-size": postTitleSize,
        "--post-title-weight": postTitleWeight,
        "--post-title-font": postTitleFont,
        "--post-title-line-height": "1.15",
        "--post-subtitle-size": postSubtitleSize,
        "--post-subtitle-weight": postSubtitleWeight,
        "--post-subtitle-font": postSubtitleFont,
        "--post-subtitle-line-height": "1.6",
        "--home-main-box-radius": borderRadius,
      } as React.CSSProperties}
    >
      <Header
        siteName={siteName}
        logoUrl={logoUrl}
        categories={categories || []}
        primaryMenu={menusByLocation?.PRIMARY}
        secondaryMenu={menusByLocation?.SECONDARY}
        mobileMenu={menusByLocation?.MOBILE}
        headerConfig={headerConfig}
      />
      <SidebarDebugPanel pageKind="single-post" />
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
        .theme-meta { 
            color: var(--home-meta-color);
            font-size: var(--home-meta-size);
            font-weight: var(--home-meta-weight);
            font-family: var(--home-meta-font), sans-serif;
        }
        .theme-meta a { color: var(--home-meta-color); }
        .theme-meta a:hover { color: var(--home-hover-color) !important; }
        .post-content-body,
        .post-content-body .prose,
        .post-content-body .prose > *:not(.inline-related-root),
        .post-content-body .prose > *:not(.inline-related-root) * {
            color: var(--post-content-widget-color, var(--post-content-color)) !important;
        }
        .post-content-body .prose > *:not(.inline-related-root) h1,
        .post-content-body .prose > *:not(.inline-related-root) h2,
        .post-content-body .prose > *:not(.inline-related-root) h3,
        .post-content-body .prose > *:not(.inline-related-root) h4,
        .post-content-body .prose > *:not(.inline-related-root) h5,
        .post-content-body .prose > *:not(.inline-related-root) h6,
        .post-content-body .prose > *:not(.inline-related-root) strong {
            color: var(--post-content-widget-heading-color, var(--post-content-heading-color)) !important;
        }
        .post-content-body .prose > *:not(.inline-related-root) a {
            color: var(--post-link-color, var(--home-hover-color)) !important;
            text-decoration-color: color-mix(in srgb, var(--post-link-color, var(--home-hover-color)) 60%, transparent);
        }
        .post-content-body .prose > *:not(.inline-related-root) a:hover {
            color: var(--post-link-hover-color, var(--post-link-color, var(--home-hover-color))) !important;
        }
        .post-content-body .prose > *:not(.inline-related-root) figure,
        .post-content-body .prose > *:not(.inline-related-root) figure.image,
        .post-content-body .prose > *:not(.inline-related-root) .image,
        .post-content-body .prose > *:not(.inline-related-root) .image-inline,
        .post-content-body .prose > *:not(.inline-related-root) p > img {
            width: 100% !important;
            max-width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
        }
        .post-content-body .prose > *:not(.inline-related-root) img,
        .post-content-body .prose > *:not(.inline-related-root) iframe {
            width: 100% !important;
            max-width: 100% !important;
            height: auto;
            border-radius: var(--home-main-box-radius, var(--radius-global, 0.5rem));
            display: block;
        }
        html.public-dark .post-content-body,
        html.public-dark .post-content-body .prose,
        html.public-dark .post-content-body .prose > *:not(.inline-related-root),
        html.public-dark .post-content-body .prose > *:not(.inline-related-root) * {
            color: var(--post-content-widget-color, var(--fg-secondary)) !important;
        }
        html.public-dark .post-content-body .prose > *:not(.inline-related-root) h1,
        html.public-dark .post-content-body .prose > *:not(.inline-related-root) h2,
        html.public-dark .post-content-body .prose > *:not(.inline-related-root) h3,
        html.public-dark .post-content-body .prose > *:not(.inline-related-root) h4,
        html.public-dark .post-content-body .prose > *:not(.inline-related-root) h5,
        html.public-dark .post-content-body .prose > *:not(.inline-related-root) h6,
        html.public-dark .post-content-body .prose > *:not(.inline-related-root) strong {
            color: var(--post-content-widget-heading-color, var(--fg-primary)) !important;
        }
      `}} />
      <main className={`flex-grow ${hasBuilderBlocks ? "w-full" : containerClass} pt-0 pb-12`} style={hasBuilderBlocks ? undefined : containerStyle}>
        {hasBuilderBlocks ? [...blocks].filter(isVisible).sort((a, b) => getOrder(a) - getOrder(b)).map((block) => {
          if (block.type === "section") return renderSection(block);
          return <React.Fragment key={block.id}>{renderWidget(block)}</React.Fragment>;
        }) : renderDefaultFallback()}
      </main>
      <Footer siteName={siteName} logoUrl={logoUrl} categories={categories} footerConfig={footerConfig} menusByLocation={menusByLocation} />
    </div>
  );
}
