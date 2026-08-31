import React from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { PRANALA_BLOCKS } from "../blocks/registry";
import Section from "../blocks/Section";
import PranalaPostContent from "../components/PranalaPostContent";
import PostWidgetRenderer from "../blockpost/PostWidgetRenderer";
import SidebarWidgetRenderer from "../components/SidebarWidgetRenderer";
import SidebarDebugPanel from "../components/SidebarDebugPanel";
import { resolveBlockTypeAlias } from "@/lib/block-registry";
import { getFirstImageFromHtml } from "@/lib/content-images";
import {
  resolveThemeFontFamily,
  resolveThemeFontSynthesis,
} from "@/lib/font-utils";
import { getYouTubeEmbedUrl } from "@/lib/utils";
import { buildPostWatermarkedImageUrl } from "@/lib/post-image-watermark";

interface PranalaSinglePostProps {
  post: any;
  setting?: any;
  categories: any[];
  blocks: any[];
  blockData?: Record<string, any[]>;
  inlineRelatedPosts?: any[];
  menusByLocation?: any;
  headerConfig?: any;
  footerConfig?: any;
  preview?: boolean;
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
export default function PranalaSinglePost({ post, setting, categories, blocks, blockData = {}, inlineRelatedPosts = [], menusByLocation, headerConfig, footerConfig, preview = false }: PranalaSinglePostProps) {
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
  const borderColor = setting?.globalBorderColor || "#e5e7eb";
  const surfaceColor = setting?.globalSurfaceColor || "#f9fafb";
  const elevatedColor = setting?.globalElevatedColor || "#ffffff";
  const mutedTextColor = setting?.globalMutedTextColor || metaColor || "#9ca3af";
  const widgetTitleColor = setting?.homeWidgetTitleColor || setting?.globalWidgetTitleColor || headingColor;
  const widgetTitleSize = formatContainerSize(setting?.homeWidgetTitleFontSize ?? setting?.globalWidgetTitleFontSize, "24px");
  const widgetTitleWeight = typeof (setting?.homeWidgetTitleFontWeight ?? setting?.globalWidgetTitleFontWeight) === "string"
    ? String(setting?.homeWidgetTitleFontWeight ?? setting?.globalWidgetTitleFontWeight)
    : "700";
  const newsTitleColor = setting?.homeNewsTitleColor || setting?.globalNewsTitleColor || headingColor;
  const newsTitleSize = formatContainerSize(setting?.homeNewsTitleFontSize ?? setting?.globalNewsTitleFontSize, "18px");
  const metaSize = formatContainerSize(setting?.homeMetaFontSize ?? setting?.globalMetaFontSize, "12px");
  const excerptTone = setting?.homeExcerptColor || setting?.globalExcerptColor || contentColor;
  const excerptSize = formatContainerSize(setting?.homeExcerptFontSize ?? setting?.globalExcerptFontSize, "14px");
  const homeWidgetTitleFontValue =
    setting?.homeWidgetTitleFont || setting?.globalWidgetTitleFont || setting?.headingFont || "Inter";
  const postTitleFontValue = setting?.postTitleFont || setting?.headingFont || "Inter";
  const postSubtitleFontValue = setting?.postSubtitleFont || setting?.bodyFont || "Inter";
  const postContentFontValue = setting?.postContentFont || setting?.globalContentFont || setting?.bodyFont || "Inter";
  const homeNewsTitleFontValue = setting?.homeNewsTitleFont || setting?.globalNewsTitleFont || setting?.headingFont || "inherit";
  const homeMetaFontValue = setting?.homeMetaFont || setting?.globalMetaFont || setting?.bodyFont || "inherit";
  const homeExcerptFontValue = setting?.homeExcerptFont || setting?.globalExcerptFont || setting?.bodyFont || "Inter";
  const postTitleSize = formatContainerSize(setting?.postTitleFontSize, "3rem");
  const postTitleWeight = typeof setting?.postTitleFontWeight === "string" ? setting.postTitleFontWeight : "700";
  const postTitleFont = resolvePublicFont(postTitleFontValue, "Inter");
  const postTitleSynthesis = resolveThemeFontSynthesis(postTitleFontValue);
  const postTitleLineHeight = String(setting?.postTitleLineHeight || "1.15");
  const postSubtitleSize = formatContainerSize(setting?.postSubtitleFontSize, "1.125rem");
  const postSubtitleWeight = typeof setting?.postSubtitleFontWeight === "string" ? setting.postSubtitleFontWeight : "400";
  const postSubtitleFont = resolvePublicFont(postSubtitleFontValue, "Inter");
  const postSubtitleSynthesis = resolveThemeFontSynthesis(postSubtitleFontValue);
  const postContentFont = resolvePublicFont(postContentFontValue, "Inter");
  const postContentSynthesis = resolveThemeFontSynthesis(postContentFontValue);
  const homeNewsTitleFont = resolvePublicFont(homeNewsTitleFontValue, "inherit");
  const homeNewsTitleSynthesis = resolveThemeFontSynthesis(homeNewsTitleFontValue);
  const homeMetaFont = resolvePublicFont(homeMetaFontValue, "inherit");
  const homeMetaSynthesis = resolveThemeFontSynthesis(homeMetaFontValue);
  const homeExcerptFont = resolvePublicFont(homeExcerptFontValue, "Inter");
  const homeExcerptSynthesis = resolveThemeFontSynthesis(homeExcerptFontValue);
  const widgetTitleFont = resolvePublicFont(homeWidgetTitleFontValue, "Inter");
  const widgetTitleSynthesis = resolveThemeFontSynthesis(homeWidgetTitleFontValue);
  const postSubtitleLineHeight = String(setting?.postSubtitleLineHeight || "1.6");
  const postContentLineHeight = String(setting?.postContentLineHeight || setting?.globalContentLineHeight || "1.8");
  const borderRadius = normalizeRadiusValue(setting?.postGlobalBorderRadius ?? setting?.globalBorderRadius ?? "0.75rem");
  const renderWidgetWithSpacing = (
    widget: any,
    content: React.ReactNode,
    growClass = "",
    directions?: { mobile?: string; tablet?: string; desktop?: string }
  ) => {
    if (!widget) return null;
    if (content == null || content === false) return null;
    const normalizeAlign = (val: any) => (val === "center" || val === "right" || val === "left" || val === "justify" ? val : "left");
    const normalizeVAlign = (val: any) => (val === "top" ? "top" : val === "bottom" ? "bottom" : val === "center" || val === "middle" ? "center" : "center");
    const toSelf = (val: string, prefix = "") => (val === "center" ? `${prefix}self-center` : val === "bottom" ? `${prefix}self-end` : `${prefix}self-start`);
    const config = widget?.config || {};

    const vAlignDesktopRaw = getResponsiveValue(config, "verticalAlign", "desktop") ?? config.verticalAlign;
    const vAlignTabletRaw = getResponsiveValue(config, "verticalAlign", "tablet") ?? vAlignDesktopRaw;
    const vAlignMobileRaw = getResponsiveValue(config, "verticalAlign", "mobile") ?? vAlignTabletRaw;
    const selfAlignMobile = directions?.mobile === "horizontal" ? toSelf(normalizeVAlign(vAlignMobileRaw)) : "";
    const selfAlignTablet = directions?.tablet === "horizontal" ? toSelf(normalizeVAlign(vAlignTabletRaw), "md:") : "";
    const selfAlignDesktop = directions?.desktop === "horizontal" ? toSelf(normalizeVAlign(vAlignDesktopRaw), "lg:") : "";
    const selfAlignClass = `${selfAlignMobile} ${selfAlignTablet} ${selfAlignDesktop}`.trim();

    const alignD = normalizeAlign(getResponsiveValue(config, "textAlign", "desktop") ?? config.textAlign ?? config.align);
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
      ["--pw-ta-d" as any]: alignD,
      ["--pw-ta-t" as any]: alignT,
      ["--pw-ta-m" as any]: alignM,
      ["--pw-mt-d" as any]: mtDPos,
      ["--pw-mt-t" as any]: mtTPos,
      ["--pw-mt-m" as any]: mtMPos,
      ["--pw-mr-d" as any]: mrD,
      ["--pw-mr-t" as any]: mrT,
      ["--pw-mr-m" as any]: mrM,
      ["--pw-mb-d" as any]: mbDPos,
      ["--pw-mb-t" as any]: mbTPos,
      ["--pw-mb-m" as any]: mbMPos,
      ["--pw-ml-d" as any]: mlD,
      ["--pw-ml-t" as any]: mlT,
      ["--pw-ml-m" as any]: mlM,
      ["--pw-pt-d" as any]: ptD,
      ["--pw-pt-t" as any]: ptT,
      ["--pw-pt-m" as any]: ptM,
      ["--pw-pr-d" as any]: prD,
      ["--pw-pr-t" as any]: prT,
      ["--pw-pr-m" as any]: prM,
      ["--pw-pb-d" as any]: pbD,
      ["--pw-pb-t" as any]: pbT,
      ["--pw-pb-m" as any]: pbM,
      ["--pw-pl-d" as any]: plD,
      ["--pw-pl-t" as any]: plT,
      ["--pw-pl-m" as any]: plM,
    };

    return (
      <div
        key={widget.id}
        style={styleVars}
        className={`min-w-0 ${growClass} ${selfAlignClass} [text-align:var(--pw-ta-m)] md:[text-align:var(--pw-ta-t)] lg:[text-align:var(--pw-ta-d)] mt-[var(--pw-mt-m)] mr-[var(--pw-mr-m)] mb-[var(--pw-mb-m)] ml-[var(--pw-ml-m)] pt-[var(--pw-pt-m)] pr-[var(--pw-pr-m)] pb-[var(--pw-pb-m)] pl-[var(--pw-pl-m)] md:mt-[var(--pw-mt-t)] md:mr-[var(--pw-mr-t)] md:mb-[var(--pw-mb-t)] md:ml-[var(--pw-ml-t)] md:pt-[var(--pw-pt-t)] md:pr-[var(--pw-pr-t)] md:pb-[var(--pw-pb-t)] md:pl-[var(--pw-pl-t)] lg:mt-[var(--pw-mt-d)] lg:mr-[var(--pw-mr-d)] lg:mb-[var(--pw-mb-d)] lg:ml-[var(--pw-ml-d)] lg:pt-[var(--pw-pt-d)] lg:pr-[var(--pw-pr-d)] lg:pb-[var(--pw-pb-d)] lg:pl-[var(--pw-pl-d)]`.trim()}
      >
        {content}
      </div>
    );
  };
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
  const imageUrl = infographicHeaderImageUrl || resolveImageUrl(post) || getFirstImageFromHtml(post?.content);
  const videoEmbedSrc = post?.type === "VIDEO" && typeof post?.videoUrl === "string" ? getYouTubeEmbedUrl(post.videoUrl) : null;
  const featuredImageAlt =
    typeof post?.featuredImageAlt === "string" && post.featuredImageAlt.trim() !== ""
      ? post.featuredImageAlt.trim()
      : post.title;
  const watermarkEnabled = post?.postImageWatermarkEnabled === true;
  const featuredImageSrc = buildPostWatermarkedImageUrl(imageUrl, setting, watermarkEnabled) || imageUrl || "";
  const containerMode = setting?.postContainerWidth || "boxed";
  const customWidth = setting?.postCustomContainerWidth || "1250";
  const sectionContainerWidth = containerMode === "custom" ? `${customWidth}px` : "1250px";
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
        <h1
          className="text-3xl md:text-5xl font-bold leading-tight"
          style={{
            color: headingColor,
            lineHeight: postTitleLineHeight,
            fontSize: postTitleSize,
            fontWeight: postTitleWeight,
            fontFamily: postTitleFont,
            fontSynthesis: postTitleSynthesis,
          }}
        >
          {post.title}
        </h1>
        {post.subtitle && (
          <p
            className="text-lg"
            style={{
              color: contentColor,
              lineHeight: postSubtitleLineHeight,
              fontSize: postSubtitleSize,
              fontWeight: postSubtitleWeight,
              fontFamily: postSubtitleFont,
              fontSynthesis: postSubtitleSynthesis,
            }}
          >
            {post.subtitle}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm" style={{ color: metaColor }}>
          {post.author?.name && <span>{post.author.name}</span>}
          <span>•</span>
          <time>{formatLongDateId(post.publishedAt || post.createdAt)}</time>
        </div>
        {videoEmbedSrc ? (
          <div className="relative w-full aspect-video overflow-hidden bg-black" style={{ borderRadius: "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))" }}>
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
          <div className="relative w-full aspect-video overflow-hidden bg-[var(--bg-elevated)]" style={{ borderRadius: "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))" }}>
            <Image src={featuredImageSrc} alt={featuredImageAlt} fill className="object-cover" unoptimized />
          </div>
        ) : null}
        <div
          className="post-content-body"
          style={{
            color: contentColor,
            lineHeight: postContentLineHeight,
            fontFamily: postContentFont,
            fontWeight: setting?.postContentFontWeight || setting?.globalContentFontWeight || "400",
            fontSynthesis: postContentSynthesis,
            ["--post-content-widget-color" as keyof React.CSSProperties]: contentColor,
            ["--post-content-widget-heading-color" as keyof React.CSSProperties]: headingColor,
          }}
        >
          <PranalaPostContent
            content={post.content || ""}
            className="[&_p]:text-inherit [&_li]:text-inherit [&_blockquote]:text-inherit [&_h1]:text-inherit [&_h2]:text-inherit [&_h3]:text-inherit [&_h4]:text-inherit [&_h5]:text-inherit [&_h6]:text-inherit [&_strong]:text-inherit [&_a]:text-inherit [&_p]:leading-[inherit] [&_li]:leading-[inherit] [&_blockquote]:leading-[inherit] [&_p]:font-[inherit] [&_li]:font-[inherit] [&_blockquote]:font-[inherit]"
            inlineRelatedItems={inlineRelatedPosts}
            inlineRelatedConfig={{
              enabled: Boolean(setting?.postInlineRelated),
              positions: inlineRelatedPositions,
              count: Math.max(1, Number.parseInt(String(setting?.postRelatedCount || "2"), 10) || 2),
              layout: String(setting?.postInlineRelatedLayout || "list"),
              gridColumns: Math.min(4, Math.max(1, Number.parseInt(String(setting?.postInlineRelatedGridColumns || "2"), 10) || 2)),
              cardColumns: Math.min(2, Math.max(1, Number.parseInt(String(setting?.postInlineRelatedCardColumns || "1"), 10) || 1)),
              titleFontSize: Number.parseInt(String(setting?.postInlineRelatedTitleFontSize || "16"), 10) || 16,
              titleFont: String(resolveThemeFontFamily(setting?.postInlineRelatedTitleFont || setting?.postTitleFont || setting?.postWidgetTitleFont || "Inter")),
              titleFontWeight: String(setting?.postInlineRelatedTitleFontWeight || "700"),
              titleLineHeight: String(setting?.postInlineRelatedTitleLineHeight || "1.35"),
              headingText: String(setting?.postInlineRelatedHeadingText || "Baca Juga"),
              headingFont: String(resolveThemeFontFamily(setting?.postInlineRelatedHeadingFont || setting?.postInlineRelatedTitleFont || setting?.postTitleFont || "Inter")),
              headingFontWeight: String(setting?.postInlineRelatedHeadingFontWeight || "700"),
              headingLetterSpacing: String(setting?.postInlineRelatedHeadingLetterSpacing || "0"),
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

  const renderWidget = (widget: any, isInsideSection = false) => {
    const sourceWidgetId = widget?.config?.sourceWidgetId || widget?.sourceWidgetId;
    const widgetData = (blockData[widget.id] || (sourceWidgetId ? blockData[sourceWidgetId] : undefined)) || [];
    const effectiveType = resolveBlockTypeAlias(widget?.type);
    const subtitleText = typeof post?.subtitle === "string" ? post.subtitle.trim() : "";

    // Avoid leaving an empty section gap when the subtitle widget exists but the post has no subtitle.
    if (!preview && widget?.type === "post_subtitle" && subtitleText === "") {
      return null;
    }
      
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
    const widgetContainerStyle: React.CSSProperties = isInsideSection
      ? {}
      : {
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
            preview={preview}
            layoutHandledBySection={isInsideSection}
          />
        </div>
      );
    }

    const blockDef = PRANALA_BLOCKS[effectiveType];
    if (!blockDef) return null;
    const Component = blockDef.component as React.ComponentType<Record<string, unknown>>;
    const normalizedWidget =
      config === rawConfig && effectiveType === widget?.type
        ? widget
        : { ...widget, type: effectiveType, config };
    return (
      <div className={`relative group/widget ${responsiveHideClass}`.trim()} style={widgetContainerStyle}>
        <Component block={normalizedWidget} posts={widgetData} categories={categories} customTitle={title} accentColor={accent} borderRadius={borderRadius} />
      </div>
    );
  };

  const renderSection = (section: any, isNested = false) => {
    const config = section.config || {};
    const responsiveHideClass = getResponsiveHideClass(config);
    const layout = config.layout || "100";
    const SectionComponent = Section;
    const colWidths = parseLayout(layout);
    const resolvedSection = section;
    const sectionChildren = Array.isArray(resolvedSection?.config?.children) ? resolvedSection.config.children : [];
    const visibleChildren = sectionChildren.filter(isVisible);
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
        className={`${getColSpan(colWidths[i])} flex ${directionClassMobile} ${alignClassMobile} ${crossClassMobile} ${directionClassTablet} ${alignClassTablet} ${crossClassTablet} ${directionClassDesktop} ${alignClassDesktop} ${crossClassDesktop} ${i === sidebarIndex ? "md:sticky md:top-24 md:self-start" : ""} gap-[var(--sec-wgap-m)] md:gap-[var(--sec-wgap-t)] lg:gap-[var(--sec-wgap-d)]`.trim()}
      >
          {items.map((widget: any) =>
            renderWidgetWithSpacing(
              widget,
              widget.type === "section" ? renderSection(widget, true) : renderWidget(widget, true),
              itemClass,
              { mobile: dirMobile, tablet: dirTablet, desktop: dirDesktop }
            )
          )}
      </div>
    ));

    return (
      <div key={section.id} className={responsiveHideClass}>
        <SectionComponent
          block={resolvedSection}
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
        "--border": borderColor,
        "--bg-surface": surfaceColor,
        "--bg-elevated": elevatedColor,
        "--muted-text": mutedTextColor,
        "--post-hover-color": hoverColor,
        "--home-widget-title-color": widgetTitleColor,
        "--home-widget-title-size": widgetTitleSize,
        "--home-widget-title-weight": widgetTitleWeight,
        "--home-widget-title-font": widgetTitleFont,
        "--home-widget-title-synthesis": widgetTitleSynthesis,
        "--home-news-title-color": newsTitleColor,
        "--home-news-title-size": newsTitleSize,
        "--home-news-title-weight": setting?.homeNewsTitleFontWeight || setting?.globalNewsTitleFontWeight || "600",
        "--home-news-title-font": homeNewsTitleFont,
        "--home-news-title-synthesis": homeNewsTitleSynthesis,
        "--home-meta-color": metaColor,
        "--home-meta-size": metaSize,
        "--home-meta-weight": setting?.homeMetaFontWeight || setting?.globalMetaFontWeight || "500",
        "--home-meta-font": homeMetaFont,
        "--home-meta-synthesis": homeMetaSynthesis,
        "--home-excerpt-color": excerptTone,
        "--home-excerpt-size": excerptSize,
        "--home-excerpt-weight": setting?.homeExcerptFontWeight || setting?.globalExcerptFontWeight || "400",
        "--home-excerpt-font": homeExcerptFont,
        "--home-excerpt-synthesis": homeExcerptSynthesis,
        "--home-hover-color": setting?.homeHoverColor || hoverColor,
        "--container-width": sectionContainerWidth,
        "--post-content-color": setting?.postContentColor || setting?.homeExcerptColor || setting?.globalExcerptColor || "#1f2937",
        "--post-content-heading-color": setting?.postHeadingColor || setting?.homeTitleColor || setting?.headingColor || "#111827",
        "--post-link-color": postLinkColor,
        "--post-link-hover-color": postLinkHoverColor,
        "--post-badge-text-color": postBadgeTextColor,
        "--post-badge-bg-color": postBadgeBgColor,
        "--post-title-size": postTitleSize,
        "--post-title-weight": postTitleWeight,
        "--post-title-font": postTitleFont,
        "--post-title-synthesis": postTitleSynthesis,
        "--post-title-line-height": postTitleLineHeight,
        "--post-subtitle-size": postSubtitleSize,
        "--post-subtitle-weight": postSubtitleWeight,
        "--post-subtitle-font": postSubtitleFont,
        "--post-subtitle-synthesis": postSubtitleSynthesis,
        "--post-subtitle-line-height": postSubtitleLineHeight,
        "--post-content-font": postContentFont,
        "--post-content-synthesis": postContentSynthesis,
        "--post-content-weight": setting?.postContentFontWeight || setting?.globalContentFontWeight || "400",
        "--post-content-heading-font": postTitleFont,
        "--post-content-heading-synthesis": postTitleSynthesis,
        "--post-content-heading-weight": postTitleWeight,
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
      <main className={`flex-grow ${hasBuilderBlocks ? "w-full" : containerClass} pt-0 pb-12`} style={hasBuilderBlocks ? undefined : containerStyle}>
        {hasBuilderBlocks ? [...blocks].filter(isVisible).sort((a, b) => getOrder(a) - getOrder(b)).map((block) => {
          if (block.type === "section") return renderSection(block);
          return <React.Fragment key={block.id}>{renderWidget(block)}</React.Fragment>;
        }) : renderDefaultFallback()}
      </main>
      <Footer siteName={siteName} logoUrl={logoUrl} categories={categories} footerConfig={footerConfig} menusByLocation={menusByLocation} setting={setting} />
    </div>
  );
}
