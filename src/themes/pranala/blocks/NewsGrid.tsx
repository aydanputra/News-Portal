"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBool, getResponsiveBoolValues, getResponsiveValues } from "./responsive";

type NewsGridAuthor = { name?: string; fullName?: string; avatar?: string; avatarUrl?: string; image?: string; banner?: string } | string;

type NewsGridPost = {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  image?: string | null;
  publishedAt?: string | Date | null;
  createdAt?: string | Date | null;
  category?: { slug: string; name: string } | null;
  archiveDisplayCategory?: { slug: string; name: string } | null;
  author?: NewsGridAuthor | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  featuredImage?: { fileUrl?: string | null } | null;
};

type NewsGridConfig = {
  title?: string;
  showTitle?: boolean;
  limit?: number;
  tabletLimit?: number;
  mobileLimit?: number;
  offset?: number;
  gridColumns?: number;
  tabletGridColumns?: number;
  mobileGridColumns?: number;
  gridGapX?: number;
  tabletGridGapX?: number;
  mobileGridGapX?: number;
  gridGapY?: number;
  tabletGridGapY?: number;
  mobileGridGapY?: number;
  imageWidth?: number | string;
  tabletImageWidth?: number | string;
  mobileImageWidth?: number | string;
  imageHeight?: number | string;
  tabletImageHeight?: number | string;
  mobileImageHeight?: number | string;
  gridBoxBorderRadius?: number;
  tabletGridBoxBorderRadius?: number;
  mobileGridBoxBorderRadius?: number;
  gridBoxColor?: string;
  tabletGridBoxColor?: string;
  mobileGridBoxColor?: string;
  titleColor?: string;
  tabletTitleColor?: string;
  mobileTitleColor?: string;
  titleHoverColor?: string;
  tabletTitleHoverColor?: string;
  mobileTitleHoverColor?: string;
  titleFontSize?: number | string;
  tabletTitleFontSize?: number | string;
  mobileTitleFontSize?: number | string;
  titleLineHeight?: number | string;
  tabletTitleLineHeight?: number | string;
  mobileTitleLineHeight?: number | string;
  titleFontWeight?: string;
  tabletTitleFontWeight?: string;
  mobileTitleFontWeight?: string;
  excerptColor?: string;
  tabletExcerptColor?: string;
  mobileExcerptColor?: string;
  excerptFontSize?: number | string;
  tabletExcerptFontSize?: number | string;
  mobileExcerptFontSize?: number | string;
  excerptLineHeight?: number | string;
  tabletExcerptLineHeight?: number | string;
  mobileExcerptLineHeight?: number | string;
  excerptFontWeight?: string;
  tabletExcerptFontWeight?: string;
  mobileExcerptFontWeight?: string;
  metaColor?: string;
  tabletMetaColor?: string;
  mobileMetaColor?: string;
  metaFontSize?: number | string;
  tabletMetaFontSize?: number | string;
  mobileMetaFontSize?: number | string;
  metaLineHeight?: number | string;
  tabletMetaLineHeight?: number | string;
  mobileMetaLineHeight?: number | string;
  metaFontWeight?: string;
  tabletMetaFontWeight?: string;
  mobileMetaFontWeight?: string;
  metaMarginBottom?: number | string;
  tabletMetaMarginBottom?: number | string;
  mobileMetaMarginBottom?: number | string;
  categoryTextColor?: string;
  tabletCategoryTextColor?: string;
  mobileCategoryTextColor?: string;
  categoryBgColor?: string;
  tabletCategoryBgColor?: string;
  mobileCategoryBgColor?: string;
  categoryBorderRadius?: number | string;
  tabletCategoryBorderRadius?: number | string;
  mobileCategoryBorderRadius?: number | string;
  categoryLabelColor?: string;
  tabletCategoryLabelColor?: string;
  mobileCategoryLabelColor?: string;
  categoryLabelBgColor?: string;
  tabletCategoryLabelBgColor?: string;
  mobileCategoryLabelBgColor?: string;
  categoryLabelBorderRadius?: number | string;
  tabletCategoryLabelBorderRadius?: number | string;
  mobileCategoryLabelBorderRadius?: number | string;
  categoryLabelFontSize?: number | string;
  tabletCategoryLabelFontSize?: number | string;
  mobileCategoryLabelFontSize?: number | string;
  categoryFontSize?: number | string;
  tabletCategoryFontSize?: number | string;
  mobileCategoryFontSize?: number | string;
  blockTitleColor?: string;
  tabletBlockTitleColor?: string;
  mobileBlockTitleColor?: string;
  blockTitleFontSize?: number | string;
  tabletBlockTitleFontSize?: number | string;
  mobileBlockTitleFontSize?: number | string;
  blockTitleBorderColor?: string;
  tabletBlockTitleBorderColor?: string;
  mobileBlockTitleBorderColor?: string;
  blockTitleLineHeight?: number | string;
  tabletBlockTitleLineHeight?: number | string;
  mobileBlockTitleLineHeight?: number | string;
  blockTitleMarginBottom?: number | string;
  tabletBlockTitleMarginBottom?: number | string;
  mobileBlockTitleMarginBottom?: number | string;
  blockTitlePaddingBottom?: number | string;
  tabletBlockTitlePaddingBottom?: number | string;
  mobileBlockTitlePaddingBottom?: number | string;
  contentPadding?: number;
  tabletContentPadding?: number;
  mobileContentPadding?: number;
  backgroundColor?: string;
  tabletBackgroundColor?: string;
  mobileBackgroundColor?: string;
  borderRadius?: number;
  tabletBorderRadius?: number;
  mobileBorderRadius?: number;
  showCategory?: boolean;
  showMetaInfo?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  showExcerpt?: boolean;
  excerptLength?: number;
  tabletExcerptLength?: number;
  mobileExcerptLength?: number;
  useBox?: boolean | string;
  boxColor?: string;
  boxBorderRadius?: string | number;
  boxPaddingTop?: number;
  boxPaddingRight?: number;
  boxPaddingBottom?: number;
  boxPaddingLeft?: number;
  tabletBoxPaddingTop?: number;
  tabletBoxPaddingRight?: number;
  tabletBoxPaddingBottom?: number;
  tabletBoxPaddingLeft?: number;
  mobileBoxPaddingTop?: number;
  mobileBoxPaddingRight?: number;
  mobileBoxPaddingBottom?: number;
  mobileBoxPaddingLeft?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  tabletMarginTop?: number;
  tabletMarginRight?: number;
  tabletMarginBottom?: number;
  tabletMarginLeft?: number;
  mobileMarginTop?: number;
  mobileMarginRight?: number;
  mobileMarginBottom?: number;
  mobileMarginLeft?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  tabletPaddingTop?: number;
  tabletPaddingRight?: number;
  tabletPaddingBottom?: number;
  tabletPaddingLeft?: number;
  mobilePaddingTop?: number;
  mobilePaddingRight?: number;
  mobilePaddingBottom?: number;
  mobilePaddingLeft?: number;
  [key: string]: unknown;
};

interface NewsGridProps {
  block: {
    id: string;
    config?: NewsGridConfig;
  };
  posts: NewsGridPost[];
  customTitle?: string;
}

const toNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toPxOrRaw = (value: unknown, fallback: string) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string") {
    const v = value.trim();
    if (!v) return fallback;
    if (/^\d+(\.\d+)?$/.test(v)) return `${v}px`;
    return v;
  }
  return fallback;
};

const resolveRadiusValue = (
  value: unknown,
  fallback: string,
  options: { legacyDefaultNumbers?: number[] } = {}
) => {
  const legacyDefaultNumbers = options.legacyDefaultNumbers || [];
  if (value === undefined || value === null) return fallback;
  if (typeof value === "number" && Number.isFinite(value)) {
    if (legacyDefaultNumbers.includes(value)) return fallback;
    return `${Math.max(value, 0)}px`;
  }
  if (typeof value === "string") {
    const v = value.trim();
    if (!v) return fallback;
    const lower = v.toLowerCase();
    if (lower === "default" || lower === "global") return fallback;
    if (/^-?\d+(\.\d+)?$/.test(v)) {
      const parsed = Number(v);
      if (!Number.isFinite(parsed)) return fallback;
      if (legacyDefaultNumbers.includes(parsed)) return fallback;
      return `${Math.max(parsed, 0)}px`;
    }
    switch (lower) {
      case "none": return "0";
      case "sm": return "0.125rem";
      case "md": return "0.375rem";
      case "lg": return "0.5rem";
      case "xl": return "0.75rem";
      case "2xl": return "1rem";
      case "full": return "9999px";
      default: return v;
    }
  }
  return fallback;
};

const toFontWeight = (value: unknown, fallback = "700") => {
  const map: Record<string, string> = {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  };
  if (typeof value !== "string" || !value) return fallback;
  return map[value] || value;
};

const normalizeLegacyNeutralSurface = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;

  const legacyLightSurfaces = new Set([
    "#fff",
    "#ffffff",
    "#f8fafc",
    "#f9fafb",
    "#f3f4f6",
    "#f1f5f9",
    "#e5e7eb",
    "white",
    "rgb(255, 255, 255)",
    "rgb(248, 250, 252)",
    "rgb(249, 250, 251)",
    "rgb(243, 244, 246)",
    "rgb(241, 245, 249)",
    "rgb(229, 231, 235)",
  ]);

  return legacyLightSurfaces.has(normalized) ? fallback : value;
};

const clampExcerpt = (excerpt: string | null | undefined, maxLength: number) => {
  if (!excerpt) return "";
  const clean = excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  if (maxLength <= 1) return clean.slice(0, Math.max(0, maxLength));
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
};

const getExcerptSource = (post: NewsGridPost, maxLength: number) => {
  const excerptText = typeof post.excerpt === "string"
    ? post.excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : "";
  const contentText = typeof post.content === "string"
    ? post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : "";

  if (excerptText.length >= maxLength) return excerptText;
  return contentText || excerptText;
};

const normalizeAvatarUrl = (value: unknown) => {
  if (typeof value !== "string") return "";
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v) || v.startsWith("/")) return v;
  return `/${v.replace(/^\/+/, "")}`;
};

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

export default function NewsGrid({ block, posts, customTitle }: NewsGridProps) {
  const cfg = block.config || {};
  const configRecord = cfg as Record<string, unknown>;
  const title = customTitle || cfg.title || "Grid News";
  const globalRadius = "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))";
  const [device, setDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPublicDarkMode, setIsPublicDarkMode] = React.useState(false);

  const limitDesktop = toNumber(cfg.limit, 6);
  const limitTablet = toNumber(cfg.tabletLimit, limitDesktop);
  const limitMobile = toNumber(cfg.mobileLimit, limitTablet);
  const offset = Math.max(0, toNumber(cfg.offset, 0));
  const maxLimit = Math.max(limitDesktop, limitTablet, limitMobile);
  const visiblePosts = (posts || []).slice(offset, offset + maxLimit);

  const columnsDesktop = toNumber(cfg.gridColumns, 3);
  const columnsTablet = toNumber(cfg.tabletGridColumns, Math.min(columnsDesktop, 2));
  const columnsMobile = toNumber(cfg.mobileGridColumns, 1);

  const gapXDesktop = `${toNumber(cfg.gridGapX, 8) * 0.25}rem`;
  const gapXTablet = `${toNumber(cfg.tabletGridGapX, toNumber(cfg.gridGapX, 8)) * 0.25}rem`;
  const gapXMobile = `${toNumber(cfg.mobileGridGapX, toNumber(cfg.gridGapX, 8)) * 0.25}rem`;
  const gapYDesktop = `${toNumber(cfg.gridGapY, 8) * 0.25}rem`;
  const gapYTablet = `${toNumber(cfg.tabletGridGapY, toNumber(cfg.gridGapY, 8)) * 0.25}rem`;
  const gapYMobile = `${toNumber(cfg.mobileGridGapY, toNumber(cfg.gridGapY, 8)) * 0.25}rem`;

  const imageWidthDesktop = toPxOrRaw(cfg.imageWidth, "100%");
  const imageWidthTablet = toPxOrRaw(cfg.tabletImageWidth ?? cfg.imageWidth, imageWidthDesktop);
  const imageWidthMobile = toPxOrRaw(cfg.mobileImageWidth ?? cfg.imageWidth, "100%");
  const imageHeightDesktop = toPxOrRaw(cfg.imageHeight, "180px");
  const imageHeightTablet = toPxOrRaw(cfg.tabletImageHeight ?? cfg.imageHeight, imageHeightDesktop);
  const imageHeightMobile = toPxOrRaw(cfg.mobileImageHeight ?? cfg.imageHeight, "160px");

  const gridBaseRadiusValue = cfg.gridBoxBorderRadius;
  const cardRadiusDesktop = resolveRadiusValue(gridBaseRadiusValue, globalRadius, { legacyDefaultNumbers: [12] });
  const cardRadiusTablet = resolveRadiusValue(cfg.tabletGridBoxBorderRadius ?? gridBaseRadiusValue, cardRadiusDesktop, { legacyDefaultNumbers: [12] });
  const cardRadiusMobile = resolveRadiusValue(cfg.mobileGridBoxBorderRadius ?? gridBaseRadiusValue, cardRadiusDesktop, { legacyDefaultNumbers: [12] });
  const cardBgDesktop = normalizeLegacyNeutralSurface(cfg.gridBoxColor, "var(--bg-elevated, #ffffff)");
  const cardBgTablet = (cfg.tabletGridBoxColor as string) || cardBgDesktop;
  const cardBgMobile = (cfg.mobileGridBoxColor as string) || cardBgDesktop;

  const titleColorDesktop = (cfg.titleColor as string) || "var(--home-news-title-color, #111827)";
  const titleColorTablet = (cfg.tabletTitleColor as string) || titleColorDesktop;
  const titleColorMobile = (cfg.mobileTitleColor as string) || titleColorDesktop;
  const titleHoverDesktop = (cfg.titleHoverColor as string) || "var(--home-hover-color, var(--accent))";
  const titleHoverTablet = (cfg.tabletTitleHoverColor as string) || titleHoverDesktop;
  const titleHoverMobile = (cfg.mobileTitleHoverColor as string) || titleHoverDesktop;
  const titleFsDesktop = toPxOrRaw(cfg.titleFontSize, "var(--home-news-title-size, 18px)");
  const titleFsTablet = toPxOrRaw(cfg.tabletTitleFontSize ?? cfg.titleFontSize, titleFsDesktop);
  const titleFsMobile = toPxOrRaw(cfg.mobileTitleFontSize ?? cfg.titleFontSize, "var(--home-news-title-size, 18px)");
  const titleLhDesktop = String(cfg.titleLineHeight ?? "1.35");
  const titleLhTablet = String(cfg.tabletTitleLineHeight ?? cfg.titleLineHeight ?? "1.35");
  const titleLhMobile = String(cfg.mobileTitleLineHeight ?? cfg.titleLineHeight ?? "1.35");
  const titleFwDesktop = toFontWeight(cfg.titleFontWeight, "var(--home-news-title-weight, 600)");
  const titleFwTablet = toFontWeight(cfg.tabletTitleFontWeight ?? cfg.titleFontWeight, titleFwDesktop);
  const titleFwMobile = toFontWeight(cfg.mobileTitleFontWeight ?? cfg.titleFontWeight, titleFwDesktop);

  const excerptColorDesktop = (cfg.excerptColor as string) || "var(--home-excerpt-color, #4b5563)";
  const excerptColorTablet = (cfg.tabletExcerptColor as string) || excerptColorDesktop;
  const excerptColorMobile = (cfg.mobileExcerptColor as string) || excerptColorDesktop;
  const excerptFsDesktop = toPxOrRaw(cfg.excerptFontSize, "var(--home-excerpt-size, 14px)");
  const excerptFsTablet = toPxOrRaw(cfg.tabletExcerptFontSize ?? cfg.excerptFontSize, excerptFsDesktop);
  const excerptFsMobile = toPxOrRaw(cfg.mobileExcerptFontSize ?? cfg.excerptFontSize, "var(--home-excerpt-size, 13px)");
  const excerptLhDesktop = String(cfg.excerptLineHeight ?? "1.55");
  const excerptLhTablet = String(cfg.tabletExcerptLineHeight ?? cfg.excerptLineHeight ?? "1.55");
  const excerptLhMobile = String(cfg.mobileExcerptLineHeight ?? cfg.excerptLineHeight ?? "1.55");
  const excerptFwDesktop = toFontWeight(cfg.excerptFontWeight, "400");
  const excerptFwTablet = toFontWeight(cfg.tabletExcerptFontWeight ?? cfg.excerptFontWeight, excerptFwDesktop);
  const excerptFwMobile = toFontWeight(cfg.mobileExcerptFontWeight ?? cfg.excerptFontWeight, excerptFwDesktop);

  const metaColorDesktop = (cfg.metaColor as string) || "var(--home-meta-color, #9ca3af)";
  const metaColorTablet = (cfg.tabletMetaColor as string) || metaColorDesktop;
  const metaColorMobile = (cfg.mobileMetaColor as string) || metaColorDesktop;
  const metaFsDesktop = toPxOrRaw(cfg.metaFontSize, "var(--home-meta-size, 12px)");
  const metaFsTablet = toPxOrRaw(cfg.tabletMetaFontSize ?? cfg.metaFontSize, metaFsDesktop);
  const metaFsMobile = toPxOrRaw(cfg.mobileMetaFontSize ?? cfg.metaFontSize, "var(--home-meta-size, 11px)");
  const metaLhDesktop = String(cfg.metaLineHeight ?? "1.5");
  const metaLhTablet = String(cfg.tabletMetaLineHeight ?? cfg.metaLineHeight ?? metaLhDesktop);
  const metaLhMobile = String(cfg.mobileMetaLineHeight ?? cfg.metaLineHeight ?? "1.5");
  const metaFwDesktop = toFontWeight(cfg.metaFontWeight, "500");
  const metaFwTablet = toFontWeight(cfg.tabletMetaFontWeight ?? cfg.metaFontWeight, metaFwDesktop);
  const metaFwMobile = toFontWeight(cfg.mobileMetaFontWeight ?? cfg.metaFontWeight, metaFwDesktop);
  const metaMbDesktop = toPxOrRaw(cfg.metaMarginBottom, "0px");
  const metaMbTablet = toPxOrRaw(cfg.tabletMetaMarginBottom ?? cfg.metaMarginBottom, metaMbDesktop);
  const metaMbMobile = toPxOrRaw(cfg.mobileMetaMarginBottom ?? cfg.metaMarginBottom, "0px");

  const categoryColorDesktop = (cfg as any).categoryLabelTextColor || (cfg.categoryTextColor as string) || (cfg.categoryLabelColor as string) || "#ffffff";
  const categoryColorTablet = (cfg as any).tabletCategoryLabelTextColor || (cfg.tabletCategoryTextColor as string) || (cfg.tabletCategoryLabelColor as string) || categoryColorDesktop;
  const categoryColorMobile = (cfg as any).mobileCategoryLabelTextColor || (cfg.mobileCategoryTextColor as string) || (cfg.mobileCategoryLabelColor as string) || categoryColorDesktop;
  const categoryBgDesktop = (cfg.categoryBgColor as string) || (cfg.categoryLabelBgColor as string) || "var(--accent)";
  const categoryBgTablet = (cfg.tabletCategoryBgColor as string) || (cfg.tabletCategoryLabelBgColor as string) || categoryBgDesktop;
  const categoryBgMobile = (cfg.mobileCategoryBgColor as string) || (cfg.mobileCategoryLabelBgColor as string) || categoryBgDesktop;
  const categoryFsDesktop = toPxOrRaw(cfg.categoryFontSize ?? cfg.categoryLabelFontSize, "11px");
  const categoryFsTablet = toPxOrRaw(cfg.tabletCategoryFontSize ?? cfg.tabletCategoryLabelFontSize ?? cfg.categoryFontSize ?? cfg.categoryLabelFontSize, categoryFsDesktop);
  const categoryFsMobile = toPxOrRaw(cfg.mobileCategoryFontSize ?? cfg.mobileCategoryLabelFontSize ?? cfg.categoryFontSize ?? cfg.categoryLabelFontSize, "10px");
  const categoryLhDesktop = String(cfg.categoryLabelLineHeight ?? "1");
  const categoryLhTablet = String(cfg.tabletCategoryLabelLineHeight ?? cfg.categoryLabelLineHeight ?? categoryLhDesktop);
  const categoryLhMobile = String(cfg.mobileCategoryLabelLineHeight ?? cfg.categoryLabelLineHeight ?? "1");
  const categoryPxDesktop = toPxOrRaw(cfg.categoryPaddingX ?? cfg.categoryLabelPaddingX, "8px");
  const categoryPxTablet = toPxOrRaw(cfg.tabletCategoryPaddingX ?? cfg.tabletCategoryLabelPaddingX ?? cfg.categoryPaddingX ?? cfg.categoryLabelPaddingX, categoryPxDesktop);
  const categoryPxMobile = toPxOrRaw(cfg.mobileCategoryPaddingX ?? cfg.mobileCategoryLabelPaddingX ?? cfg.categoryPaddingX ?? cfg.categoryLabelPaddingX, "8px");
  const categoryPyDesktop = toPxOrRaw(cfg.categoryPaddingY ?? cfg.categoryLabelPaddingY, "4px");
  const categoryPyTablet = toPxOrRaw(cfg.tabletCategoryPaddingY ?? cfg.tabletCategoryLabelPaddingY ?? cfg.categoryPaddingY ?? cfg.categoryLabelPaddingY, categoryPyDesktop);
  const categoryPyMobile = toPxOrRaw(cfg.mobileCategoryPaddingY ?? cfg.mobileCategoryLabelPaddingY ?? cfg.categoryPaddingY ?? cfg.categoryLabelPaddingY, "4px");
  const categoryRadiusDesktop = resolveRadiusValue(cfg.categoryBorderRadius ?? cfg.categoryLabelBorderRadius, globalRadius);
  const categoryRadiusTablet = resolveRadiusValue(cfg.tabletCategoryBorderRadius ?? cfg.tabletCategoryLabelBorderRadius ?? cfg.categoryBorderRadius ?? cfg.categoryLabelBorderRadius, categoryRadiusDesktop);
  const categoryRadiusMobile = resolveRadiusValue(cfg.mobileCategoryBorderRadius ?? cfg.mobileCategoryLabelBorderRadius ?? cfg.categoryBorderRadius ?? cfg.categoryLabelBorderRadius, categoryRadiusDesktop);

  const blockTitleColorDesktop = (cfg.blockTitleColor as string) || "var(--home-widget-title-color, var(--heading-color, #1e293b))";
  const blockTitleColorTablet = (cfg.tabletBlockTitleColor as string) || blockTitleColorDesktop;
  const blockTitleColorMobile = (cfg.mobileBlockTitleColor as string) || blockTitleColorDesktop;
  const blockTitleFsDesktop = toPxOrRaw(cfg.blockTitleFontSize, "var(--home-widget-title-size, 20px)");
  const blockTitleFsTablet = toPxOrRaw(cfg.tabletBlockTitleFontSize ?? cfg.blockTitleFontSize, blockTitleFsDesktop);
  const blockTitleFsMobile = toPxOrRaw(cfg.mobileBlockTitleFontSize ?? cfg.blockTitleFontSize, "var(--home-widget-title-size, 20px)");
  const blockTitleLhDesktop = String(cfg.blockTitleLineHeight ?? "1.2");
  const blockTitleLhTablet = String(cfg.tabletBlockTitleLineHeight ?? cfg.blockTitleLineHeight ?? blockTitleLhDesktop);
  const blockTitleLhMobile = String(cfg.mobileBlockTitleLineHeight ?? cfg.blockTitleLineHeight ?? "1.2");
  const blockTitleBorderDesktop = (cfg.blockTitleBorderColor as string) || "var(--accent)";
  const blockTitleBorderTablet = (cfg.tabletBlockTitleBorderColor as string) || blockTitleBorderDesktop;
  const blockTitleBorderMobile = (cfg.mobileBlockTitleBorderColor as string) || blockTitleBorderDesktop;
  const blockTitleMbDesktop = toPxOrRaw(cfg.blockTitleMarginBottom, "12px");
  const blockTitleMbTablet = toPxOrRaw(cfg.tabletBlockTitleMarginBottom ?? cfg.blockTitleMarginBottom, blockTitleMbDesktop);
  const blockTitleMbMobile = toPxOrRaw(cfg.mobileBlockTitleMarginBottom ?? cfg.blockTitleMarginBottom, "12px");
  const blockTitlePbDesktop = toPxOrRaw(cfg.blockTitlePaddingBottom, "12px");
  const blockTitlePbTablet = toPxOrRaw(cfg.tabletBlockTitlePaddingBottom ?? cfg.blockTitlePaddingBottom, blockTitlePbDesktop);
  const blockTitlePbMobile = toPxOrRaw(cfg.mobileBlockTitlePaddingBottom ?? cfg.blockTitlePaddingBottom, "12px");

  const contentPaddingDesktop = toPxOrRaw(cfg.contentPadding, "12px");
  const contentPaddingTablet = toPxOrRaw(cfg.tabletContentPadding ?? cfg.contentPadding, contentPaddingDesktop);
  const contentPaddingMobile = toPxOrRaw(cfg.mobileContentPadding ?? cfg.contentPadding, contentPaddingDesktop);
  const contentBgDesktop = normalizeLegacyNeutralSurface(cfg.backgroundColor, "transparent");
  const contentBgTablet = (cfg.tabletBackgroundColor as string) || contentBgDesktop;
  const contentBgMobile = (cfg.mobileBackgroundColor as string) || contentBgDesktop;
  const contentRadiusDesktop = resolveRadiusValue(cfg.borderRadius, globalRadius);
  const contentRadiusTablet = resolveRadiusValue(cfg.tabletBorderRadius ?? cfg.borderRadius, contentRadiusDesktop);
  const contentRadiusMobile = resolveRadiusValue(cfg.mobileBorderRadius ?? cfg.borderRadius, contentRadiusDesktop);

  const showCategoryDesktop = getResponsiveBool(configRecord, "showCategory", "desktop", true);
  const showMetaDesktop = getResponsiveBool(configRecord, "showMetaInfo", "desktop", getResponsiveBool(configRecord, "showMeta", "desktop", true));
  const showAuthorDesktop = getResponsiveBool(configRecord, "showAuthor", "desktop", true);
  const showDateDesktop = getResponsiveBool(configRecord, "showDate", "desktop", true);
  const showExcerptDesktop = getResponsiveBool(configRecord, "showExcerpt", "desktop", false);

  const showCategoryTablet = getResponsiveBool(configRecord, "showCategory", "tablet", true);
  const showMetaTablet = getResponsiveBool(configRecord, "showMetaInfo", "tablet", getResponsiveBool(configRecord, "showMeta", "tablet", true));
  const showAuthorTablet = getResponsiveBool(configRecord, "showAuthor", "tablet", true);
  const showDateTablet = getResponsiveBool(configRecord, "showDate", "tablet", true);
  const showExcerptTablet = getResponsiveBool(configRecord, "showExcerpt", "tablet", false);

  const showCategoryMobile = getResponsiveBool(configRecord, "showCategory", "mobile", true);
  const showMetaMobile = getResponsiveBool(configRecord, "showMetaInfo", "mobile", getResponsiveBool(configRecord, "showMeta", "mobile", true));
  const showAuthorMobile = getResponsiveBool(configRecord, "showAuthor", "mobile", true);
  const showDateMobile = getResponsiveBool(configRecord, "showDate", "mobile", true);
  const showExcerptMobile = getResponsiveBool(configRecord, "showExcerpt", "mobile", false);

  const excerptLenDesktop = toNumber(cfg.excerptLength, 120);
  const excerptLenTablet = toNumber(cfg.tabletExcerptLength ?? cfg.excerptLength, excerptLenDesktop);
  const excerptLenMobile = toNumber(cfg.mobileExcerptLength ?? cfg.excerptLength, 120);

  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const useBoxDesktop = useBoxValues.desktop;
  const useBoxTablet = useBoxValues.tablet;
  const useBoxMobile = useBoxValues.mobile;
  const boxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = normalizeLegacyNeutralSurface(boxColorValues.desktop, "transparent");
  const boxColorTablet = boxColorValues.tablet || boxColorDesktop;
  const boxColorMobile = boxColorValues.mobile || boxColorDesktop;
  const boxBgImageDesktop = typeof (cfg as any).backgroundImage === "string" ? (cfg as any).backgroundImage : "";
  const boxBgImageTablet = typeof (cfg as any).tabletBackgroundImage === "string" && (cfg as any).tabletBackgroundImage.trim() !== "" ? (cfg as any).tabletBackgroundImage : boxBgImageDesktop;
  const boxBgImageMobile = typeof (cfg as any).mobileBackgroundImage === "string" && (cfg as any).mobileBackgroundImage.trim() !== "" ? (cfg as any).mobileBackgroundImage : boxBgImageDesktop;
  const boxBgSizeDesktop = typeof (cfg as any).backgroundSize === "string" && (cfg as any).backgroundSize.trim() !== "" ? (cfg as any).backgroundSize : "cover";
  const boxBgSizeTablet = typeof (cfg as any).tabletBackgroundSize === "string" && (cfg as any).tabletBackgroundSize.trim() !== "" ? (cfg as any).tabletBackgroundSize : boxBgSizeDesktop;
  const boxBgSizeMobile = typeof (cfg as any).mobileBackgroundSize === "string" && (cfg as any).mobileBackgroundSize.trim() !== "" ? (cfg as any).mobileBackgroundSize : boxBgSizeDesktop;
  const boxBgPositionDesktop = typeof (cfg as any).backgroundPosition === "string" && (cfg as any).backgroundPosition.trim() !== "" ? (cfg as any).backgroundPosition : "center";
  const boxBgPositionTablet = typeof (cfg as any).tabletBackgroundPosition === "string" && (cfg as any).tabletBackgroundPosition.trim() !== "" ? (cfg as any).tabletBackgroundPosition : boxBgPositionDesktop;
  const boxBgPositionMobile = typeof (cfg as any).mobileBackgroundPosition === "string" && (cfg as any).mobileBackgroundPosition.trim() !== "" ? (cfg as any).mobileBackgroundPosition : boxBgPositionDesktop;
  const boxBgRepeatDesktop = typeof (cfg as any).backgroundRepeat === "string" && (cfg as any).backgroundRepeat.trim() !== "" ? (cfg as any).backgroundRepeat : "no-repeat";
  const boxBgRepeatTablet = typeof (cfg as any).tabletBackgroundRepeat === "string" && (cfg as any).tabletBackgroundRepeat.trim() !== "" ? (cfg as any).tabletBackgroundRepeat : boxBgRepeatDesktop;
  const boxBgRepeatMobile = typeof (cfg as any).mobileBackgroundRepeat === "string" && (cfg as any).mobileBackgroundRepeat.trim() !== "" ? (cfg as any).mobileBackgroundRepeat : boxBgRepeatDesktop;
  const boxBgAttachmentDesktop = typeof (cfg as any).backgroundAttachment === "string" && (cfg as any).backgroundAttachment.trim() !== "" ? (cfg as any).backgroundAttachment : "scroll";
  const boxBgAttachmentTablet = typeof (cfg as any).tabletBackgroundAttachment === "string" && (cfg as any).tabletBackgroundAttachment.trim() !== "" ? (cfg as any).tabletBackgroundAttachment : boxBgAttachmentDesktop;
  const boxBgAttachmentMobile = typeof (cfg as any).mobileBackgroundAttachment === "string" && (cfg as any).mobileBackgroundAttachment.trim() !== "" ? (cfg as any).mobileBackgroundAttachment : boxBgAttachmentDesktop;
  const boxOverlayColorDesktop = typeof (cfg as any).backgroundOverlayColor === "string" ? (cfg as any).backgroundOverlayColor : "transparent";
  const boxOverlayColorTablet = typeof (cfg as any).tabletBackgroundOverlayColor === "string" && (cfg as any).tabletBackgroundOverlayColor.trim() !== "" ? (cfg as any).tabletBackgroundOverlayColor : boxOverlayColorDesktop;
  const boxOverlayColorMobile = typeof (cfg as any).mobileBackgroundOverlayColor === "string" && (cfg as any).mobileBackgroundOverlayColor.trim() !== "" ? (cfg as any).mobileBackgroundOverlayColor : boxOverlayColorDesktop;
  const boxOverlayOpacityDesktop = Math.min(100, Math.max(0, Number((cfg as any).backgroundOverlayOpacity ?? 45) || 0));
  const boxOverlayOpacityTablet = Math.min(100, Math.max(0, Number((cfg as any).tabletBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const boxOverlayOpacityMobile = Math.min(100, Math.max(0, Number((cfg as any).mobileBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const boxRadiusDesktop = resolveRadiusValue(cfg.boxBorderRadius, globalRadius);
  const boxRadiusTablet = resolveRadiusValue(cfg.tabletBoxBorderRadius ?? cfg.boxBorderRadius, boxRadiusDesktop);
  const boxRadiusMobile = resolveRadiusValue(cfg.mobileBoxBorderRadius ?? cfg.boxBorderRadius, boxRadiusDesktop);
  const boxPtBase = cfg.boxPaddingTop !== undefined ? `${cfg.boxPaddingTop}px` : "0px";
  const boxPrBase = cfg.boxPaddingRight !== undefined ? `${cfg.boxPaddingRight}px` : "0px";
  const boxPbBase = cfg.boxPaddingBottom !== undefined ? `${cfg.boxPaddingBottom}px` : "0px";
  const boxPlBase = cfg.boxPaddingLeft !== undefined ? `${cfg.boxPaddingLeft}px` : "0px";
  const boxPtMobile = cfg.mobileBoxPaddingTop !== undefined ? `${cfg.mobileBoxPaddingTop}px` : boxPtBase;
  const boxPrMobile = cfg.mobileBoxPaddingRight !== undefined ? `${cfg.mobileBoxPaddingRight}px` : boxPrBase;
  const boxPbMobile = cfg.mobileBoxPaddingBottom !== undefined ? `${cfg.mobileBoxPaddingBottom}px` : boxPbBase;
  const boxPlMobile = cfg.mobileBoxPaddingLeft !== undefined ? `${cfg.mobileBoxPaddingLeft}px` : boxPlBase;
  const boxPtTablet = cfg.tabletBoxPaddingTop !== undefined ? `${cfg.tabletBoxPaddingTop}px` : boxPtBase;
  const boxPrTablet = cfg.tabletBoxPaddingRight !== undefined ? `${cfg.tabletBoxPaddingRight}px` : boxPrBase;
  const boxPbTablet = cfg.tabletBoxPaddingBottom !== undefined ? `${cfg.tabletBoxPaddingBottom}px` : boxPbBase;
  const boxPlTablet = cfg.tabletBoxPaddingLeft !== undefined ? `${cfg.tabletBoxPaddingLeft}px` : boxPlBase;
  const boxPtDesktop = boxPtBase;
  const boxPrDesktop = boxPrBase;
  const boxPbDesktop = boxPbBase;
  const boxPlDesktop = boxPlBase;

  const pTopMobile = cfg.mobilePaddingTop !== undefined ? `${cfg.mobilePaddingTop}px` : "0px";
  const pRightMobile = cfg.mobilePaddingRight !== undefined ? `${cfg.mobilePaddingRight}px` : "0px";
  const pBottomMobile = cfg.mobilePaddingBottom !== undefined ? `${cfg.mobilePaddingBottom}px` : "0px";
  const pLeftMobile = cfg.mobilePaddingLeft !== undefined ? `${cfg.mobilePaddingLeft}px` : "0px";
  const pTopTablet = cfg.tabletPaddingTop !== undefined ? `${cfg.tabletPaddingTop}px` : pTopMobile;
  const pRightTablet = cfg.tabletPaddingRight !== undefined ? `${cfg.tabletPaddingRight}px` : pRightMobile;
  const pBottomTablet = cfg.tabletPaddingBottom !== undefined ? `${cfg.tabletPaddingBottom}px` : pBottomMobile;
  const pLeftTablet = cfg.tabletPaddingLeft !== undefined ? `${cfg.tabletPaddingLeft}px` : pLeftMobile;
  const pTopDesktop = cfg.paddingTop !== undefined ? `${cfg.paddingTop}px` : pTopTablet;
  const pRightDesktop = cfg.paddingRight !== undefined ? `${cfg.paddingRight}px` : pRightTablet;
  const pBottomDesktop = cfg.paddingBottom !== undefined ? `${cfg.paddingBottom}px` : pBottomTablet;
  const pLeftDesktop = cfg.paddingLeft !== undefined ? `${cfg.paddingLeft}px` : pLeftTablet;

  const mTopMobile = cfg.mobileMarginTop !== undefined ? `${cfg.mobileMarginTop}px` : "0px";
  const mRightMobile = cfg.mobileMarginRight !== undefined ? `${cfg.mobileMarginRight}px` : "0px";
  const mBottomMobile = cfg.mobileMarginBottom !== undefined ? `${cfg.mobileMarginBottom}px` : "0px";
  const mLeftMobile = cfg.mobileMarginLeft !== undefined ? `${cfg.mobileMarginLeft}px` : "0px";
  const mTopTablet = cfg.tabletMarginTop !== undefined ? `${cfg.tabletMarginTop}px` : mTopMobile;
  const mRightTablet = cfg.tabletMarginRight !== undefined ? `${cfg.tabletMarginRight}px` : mRightMobile;
  const mBottomTablet = cfg.tabletMarginBottom !== undefined ? `${cfg.tabletMarginBottom}px` : mBottomMobile;
  const mLeftTablet = cfg.tabletMarginLeft !== undefined ? `${cfg.tabletMarginLeft}px` : mLeftMobile;
  const mTopDesktop = cfg.marginTop !== undefined ? `${cfg.marginTop}px` : mTopTablet;
  const mRightDesktop = cfg.marginRight !== undefined ? `${cfg.marginRight}px` : mRightTablet;
  const mBottomDesktop = cfg.marginBottom !== undefined ? `${cfg.marginBottom}px` : mBottomTablet;
  const mLeftDesktop = cfg.marginLeft !== undefined ? `${cfg.marginLeft}px` : mLeftTablet;
  const darkWidgetBoxAuto =
    useBoxDesktop || useBoxTablet || useBoxMobile ||
    cfg.boxColor !== undefined || cfg.tabletBoxColor !== undefined || cfg.mobileBoxColor !== undefined ||
    cfg.boxBorderRadius !== undefined || cfg.tabletBoxBorderRadius !== undefined || cfg.mobileBoxBorderRadius !== undefined;
  const darkCardBoxAuto = cfg.gridBoxColor !== undefined || cfg.gridBoxBorderRadius !== undefined;

  React.useEffect(() => {
    const computeDevice = () => {
      const width = window.innerWidth;
      if (width >= 1025) return "desktop";
      if (width >= 768) return "tablet";
      return "mobile";
    };
    const updateDevice = () => setDevice(computeDevice());
    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const applyMode = () => setIsPublicDarkMode(root.classList.contains("public-dark"));
    applyMode();

    const observer = new MutationObserver(applyMode);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const excerptLength = device === "mobile"
    ? excerptLenMobile
    : device === "tablet"
      ? excerptLenTablet
      : excerptLenDesktop;
  const currentLimit = device === "mobile" ? limitMobile : device === "tablet" ? limitTablet : limitDesktop;
  const currentUseBox = device === "mobile" ? useBoxMobile : device === "tablet" ? useBoxTablet : useBoxDesktop;
  const currentBoxColor = device === "mobile" ? boxColorMobile : device === "tablet" ? boxColorTablet : boxColorDesktop;
  const currentBoxBgImage = device === "mobile" ? boxBgImageMobile : device === "tablet" ? boxBgImageTablet : boxBgImageDesktop;
  const currentBoxBgSize = device === "mobile" ? boxBgSizeMobile : device === "tablet" ? boxBgSizeTablet : boxBgSizeDesktop;
  const currentBoxBgPosition = device === "mobile" ? boxBgPositionMobile : device === "tablet" ? boxBgPositionTablet : boxBgPositionDesktop;
  const currentBoxBgRepeat = device === "mobile" ? boxBgRepeatMobile : device === "tablet" ? boxBgRepeatTablet : boxBgRepeatDesktop;
  const currentBoxBgAttachment = device === "mobile" ? boxBgAttachmentMobile : device === "tablet" ? boxBgAttachmentTablet : boxBgAttachmentDesktop;
  const currentBoxOverlayColor = device === "mobile" ? boxOverlayColorMobile : device === "tablet" ? boxOverlayColorTablet : boxOverlayColorDesktop;
  const currentBoxOverlayOpacity = device === "mobile" ? boxOverlayOpacityMobile : device === "tablet" ? boxOverlayOpacityTablet : boxOverlayOpacityDesktop;
  const hasCurrentBoxOverlay = currentBoxOverlayOpacity > 0 && typeof currentBoxOverlayColor === "string" && currentBoxOverlayColor.trim() !== "" && currentBoxOverlayColor !== "transparent";
  const currentBoxOverlayFill = hasCurrentBoxOverlay ? `color-mix(in srgb, ${currentBoxOverlayColor} ${currentBoxOverlayOpacity}%, transparent)` : "transparent";
  const currentBoxBackgroundImage = currentUseBox && currentBoxBgImage
    ? (hasCurrentBoxOverlay
      ? `linear-gradient(${currentBoxOverlayFill}, ${currentBoxOverlayFill}), url("${currentBoxBgImage}")`
      : `url("${currentBoxBgImage}")`)
    : "none";
  const currentBoxRadius = device === "mobile" ? boxRadiusMobile : device === "tablet" ? boxRadiusTablet : boxRadiusDesktop;
  const currentBoxPt = device === "mobile" ? boxPtMobile : device === "tablet" ? boxPtTablet : boxPtDesktop;
  const currentBoxPr = device === "mobile" ? boxPrMobile : device === "tablet" ? boxPrTablet : boxPrDesktop;
  const currentBoxPb = device === "mobile" ? boxPbMobile : device === "tablet" ? boxPbTablet : boxPbDesktop;
  const currentBoxPl = device === "mobile" ? boxPlMobile : device === "tablet" ? boxPlTablet : boxPlDesktop;
  const currentColumns = device === "mobile" ? columnsMobile : device === "tablet" ? columnsTablet : columnsDesktop;
  const currentGapX = device === "mobile" ? gapXMobile : device === "tablet" ? gapXTablet : gapXDesktop;
  const currentGapY = device === "mobile" ? gapYMobile : device === "tablet" ? gapYTablet : gapYDesktop;
  const currentCardRadius = device === "mobile" ? cardRadiusMobile : device === "tablet" ? cardRadiusTablet : cardRadiusDesktop;
  const currentCardBg = device === "mobile" ? cardBgMobile : device === "tablet" ? cardBgTablet : cardBgDesktop;
  const currentContentPadding = device === "mobile" ? contentPaddingMobile : device === "tablet" ? contentPaddingTablet : contentPaddingDesktop;
  const currentContentBg = device === "mobile" ? contentBgMobile : device === "tablet" ? contentBgTablet : contentBgDesktop;
  const currentContentRadius = device === "mobile" ? contentRadiusMobile : device === "tablet" ? contentRadiusTablet : contentRadiusDesktop;
  const currentImageWidth = device === "mobile" ? imageWidthMobile : device === "tablet" ? imageWidthTablet : imageWidthDesktop;
  const currentImageHeight = device === "mobile" ? imageHeightMobile : device === "tablet" ? imageHeightTablet : imageHeightDesktop;
  const currentShowCategory = device === "mobile" ? showCategoryMobile : device === "tablet" ? showCategoryTablet : showCategoryDesktop;
  const currentCategoryColor = device === "mobile" ? categoryColorMobile : device === "tablet" ? categoryColorTablet : categoryColorDesktop;
  const currentCategoryBg = device === "mobile" ? categoryBgMobile : device === "tablet" ? categoryBgTablet : categoryBgDesktop;
  const currentCategoryFs = device === "mobile" ? categoryFsMobile : device === "tablet" ? categoryFsTablet : categoryFsDesktop;
  const currentCategoryLh = device === "mobile" ? categoryLhMobile : device === "tablet" ? categoryLhTablet : categoryLhDesktop;
  const currentCategoryPx = device === "mobile" ? categoryPxMobile : device === "tablet" ? categoryPxTablet : categoryPxDesktop;
  const currentCategoryPy = device === "mobile" ? categoryPyMobile : device === "tablet" ? categoryPyTablet : categoryPyDesktop;
  const currentCategoryRadius = device === "mobile" ? categoryRadiusMobile : device === "tablet" ? categoryRadiusTablet : categoryRadiusDesktop;
  const currentCategoryHasBg = currentCategoryBg !== "transparent" && currentCategoryBg !== "none";
  const currentTitleColor = device === "mobile" ? titleColorMobile : device === "tablet" ? titleColorTablet : titleColorDesktop;
  const currentTitleHover = device === "mobile" ? titleHoverMobile : device === "tablet" ? titleHoverTablet : titleHoverDesktop;
  const currentTitleFs = device === "mobile" ? titleFsMobile : device === "tablet" ? titleFsTablet : titleFsDesktop;
  const currentTitleLh = device === "mobile" ? titleLhMobile : device === "tablet" ? titleLhTablet : titleLhDesktop;
  const currentTitleFw = device === "mobile" ? titleFwMobile : device === "tablet" ? titleFwTablet : titleFwDesktop;
  const currentShowMeta = device === "mobile" ? showMetaMobile : device === "tablet" ? showMetaTablet : showMetaDesktop;
  const currentShowAuthor = device === "mobile" ? showAuthorMobile : device === "tablet" ? showAuthorTablet : showAuthorDesktop;
  const currentShowDate = device === "mobile" ? showDateMobile : device === "tablet" ? showDateTablet : showDateDesktop;
  const currentMetaColor = device === "mobile" ? metaColorMobile : device === "tablet" ? metaColorTablet : metaColorDesktop;
  const currentMetaFs = device === "mobile" ? metaFsMobile : device === "tablet" ? metaFsTablet : metaFsDesktop;
  const currentMetaLh = device === "mobile" ? metaLhMobile : device === "tablet" ? metaLhTablet : metaLhDesktop;
  const currentMetaFw = device === "mobile" ? metaFwMobile : device === "tablet" ? metaFwTablet : metaFwDesktop;
  const currentMetaMb = device === "mobile" ? metaMbMobile : device === "tablet" ? metaMbTablet : metaMbDesktop;
  const currentShowExcerpt = device === "mobile" ? showExcerptMobile : device === "tablet" ? showExcerptTablet : showExcerptDesktop;
  const currentExcerptColor = device === "mobile" ? excerptColorMobile : device === "tablet" ? excerptColorTablet : excerptColorDesktop;
  const currentExcerptFs = device === "mobile" ? excerptFsMobile : device === "tablet" ? excerptFsTablet : excerptFsDesktop;
  const currentExcerptLh = device === "mobile" ? excerptLhMobile : device === "tablet" ? excerptLhTablet : excerptLhDesktop;
  const currentExcerptFw = device === "mobile" ? excerptFwMobile : device === "tablet" ? excerptFwTablet : excerptFwDesktop;
  const effectiveContentBg = isPublicDarkMode ? "#ffffff" : currentContentBg;
  const effectiveTitleColor = isPublicDarkMode ? "#0f172a" : currentTitleColor;
  const effectiveTitleHover = isPublicDarkMode ? "var(--home-hover-color, var(--accent))" : currentTitleHover;
  const effectiveMetaColor = isPublicDarkMode ? "#64748b" : currentMetaColor;
  const effectiveExcerptColor = isPublicDarkMode ? "#334155" : currentExcerptColor;
  const effectiveBlockTitleColorMobile = isPublicDarkMode ? "#ffffff" : blockTitleColorMobile;
  const effectiveBlockTitleColorTablet = isPublicDarkMode ? "#ffffff" : blockTitleColorTablet;
  const effectiveBlockTitleColorDesktop = isPublicDarkMode ? "#ffffff" : blockTitleColorDesktop;
  const effectiveBlockTitleBorderMobile = isPublicDarkMode ? "#ffffff" : blockTitleBorderMobile;
  const effectiveBlockTitleBorderTablet = isPublicDarkMode ? "#ffffff" : blockTitleBorderTablet;
  const effectiveBlockTitleBorderDesktop = isPublicDarkMode ? "#ffffff" : blockTitleBorderDesktop;
  const currentBlockTitleLh = device === "mobile" ? blockTitleLhMobile : device === "tablet" ? blockTitleLhTablet : blockTitleLhDesktop;
  const currentBlockTitleMb = device === "mobile" ? blockTitleMbMobile : device === "tablet" ? blockTitleMbTablet : blockTitleMbDesktop;
  const currentBlockTitlePb = device === "mobile" ? blockTitlePbMobile : device === "tablet" ? blockTitlePbTablet : blockTitlePbDesktop;
  const contentThemeVars = {
    "--home-news-title-color": effectiveTitleColor,
    "--home-news-title-size": currentTitleFs,
    "--home-news-title-weight": currentTitleFw,
    "--home-meta-color": effectiveMetaColor,
    "--home-meta-size": currentMetaFs,
    "--home-meta-weight": currentMetaFw,
    "--home-excerpt-color": effectiveExcerptColor,
    "--home-excerpt-size": currentExcerptFs,
    "--home-excerpt-weight": currentExcerptFw,
  } as React.CSSProperties;
  const renderedPosts = visiblePosts.slice(0, currentLimit);

  return (
    <div
      id={`news-grid-${block.id}`}
      className={`w-full responsive-block-frame ${darkWidgetBoxAuto ? "news-grid-dark-widget-auto" : ""} ${darkCardBoxAuto ? "news-grid-dark-card-auto" : ""}`.trim()}
      style={{
        "--widget-title-color-mobile": effectiveBlockTitleColorMobile,
        "--widget-title-color-tablet": effectiveBlockTitleColorTablet,
        "--widget-title-color-desktop": effectiveBlockTitleColorDesktop,
        "--widget-title-size-mobile": blockTitleFsMobile,
        "--widget-title-size-tablet": blockTitleFsTablet,
        "--widget-title-size-desktop": blockTitleFsDesktop,
        "--widget-title-border-color-mobile": effectiveBlockTitleBorderMobile,
        "--widget-title-border-color-tablet": effectiveBlockTitleBorderTablet,
        "--widget-title-border-color-desktop": effectiveBlockTitleBorderDesktop,
        "--rb-mt-mobile": mTopMobile,
        "--rb-mr-mobile": mRightMobile,
        "--rb-mb-mobile": mBottomMobile,
        "--rb-ml-mobile": mLeftMobile,
        "--rb-pt-mobile": pTopMobile,
        "--rb-pr-mobile": pRightMobile,
        "--rb-pb-mobile": pBottomMobile,
        "--rb-pl-mobile": pLeftMobile,
        "--rb-mt-tablet": mTopTablet,
        "--rb-mr-tablet": mRightTablet,
        "--rb-mb-tablet": mBottomTablet,
        "--rb-ml-tablet": mLeftTablet,
        "--rb-pt-tablet": pTopTablet,
        "--rb-pr-tablet": pRightTablet,
        "--rb-pb-tablet": pBottomTablet,
        "--rb-pl-tablet": pLeftTablet,
        "--rb-mt-desktop": mTopDesktop,
        "--rb-mr-desktop": mRightDesktop,
        "--rb-mb-desktop": mBottomDesktop,
        "--rb-ml-desktop": mLeftDesktop,
        "--rb-pt-desktop": pTopDesktop,
        "--rb-pr-desktop": pRightDesktop,
        "--rb-pb-desktop": pBottomDesktop,
        "--rb-pl-desktop": pLeftDesktop,
      } as React.CSSProperties}
    >
      <div
        style={{
          backgroundColor: currentUseBox ? currentBoxColor : "transparent",
          borderRadius: currentUseBox ? currentBoxRadius : "0",
          border: currentUseBox ? "var(--box-border, 1px solid #f3f4f6)" : "none",
          boxShadow: currentUseBox ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none",
          backgroundImage: currentBoxBackgroundImage,
          backgroundSize: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `cover, ${currentBoxBgSize}` : currentBoxBgSize) : undefined,
          backgroundPosition: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `center, ${currentBoxBgPosition}` : currentBoxBgPosition) : undefined,
          backgroundRepeat: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `no-repeat, ${currentBoxBgRepeat}` : currentBoxBgRepeat) : undefined,
          backgroundAttachment: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `scroll, ${currentBoxBgAttachment}` : currentBoxBgAttachment) : undefined,
          paddingTop: currentUseBox ? currentBoxPt : "0px",
          paddingRight: currentUseBox ? currentBoxPr : "0px",
          paddingBottom: currentUseBox ? currentBoxPb : "0px",
          paddingLeft: currentUseBox ? currentBoxPl : "0px",
        }}
      >
      <div className="news-grid-inner">
        {(cfg.showTitle !== false) && (
          <h3
            className="font-bold border-b border-[color:var(--border,#e5e7eb)] flex items-center theme-widget-title"
            style={{ lineHeight: currentBlockTitleLh, marginBottom: currentBlockTitleMb, paddingBottom: currentBlockTitlePb }}
          >
            <div className="widget-title-bar" style={{ borderRadius: "var(--home-main-box-radius, 0.25rem)" }}></div>
            <span>{title}</span>
          </h3>
        )}

        <div className="news-grid-list" style={{ display: "grid", gridTemplateColumns: `repeat(${currentColumns}, minmax(0, 1fr))`, columnGap: currentGapX, rowGap: currentGapY }}>
          {renderedPosts.map((post, idx) => {
            const postLink = post.category ? `/${post.category.slug}/${post.slug}` : `/post/${post.slug}`;
            const displayCategory = post.archiveDisplayCategory || post.category;
            const imageUrl = post.image || post.featuredImage?.fileUrl;
            const isVideo = String((post as any)?.type || "").toUpperCase() === "VIDEO";
            const authorName = (() => {
              if (typeof post.author === "string") return post.author;
              if (post.author && typeof post.author === "object") {
                if (typeof post.author.name === "string" && post.author.name.trim() !== "") return post.author.name;
                if (typeof post.author.fullName === "string" && post.author.fullName.trim() !== "") return post.author.fullName;
              }
              if (typeof post.authorName === "string" && post.authorName.trim() !== "") return post.authorName;
              return "";
            })();
            const authorAvatar = (() => {
              if (post.author && typeof post.author === "object") {
                if (typeof post.author.avatar === "string" && post.author.avatar.trim() !== "") return normalizeAvatarUrl(post.author.avatar);
                if (typeof post.author.avatarUrl === "string" && post.author.avatarUrl.trim() !== "") return normalizeAvatarUrl(post.author.avatarUrl);
                if (typeof post.author.image === "string" && post.author.image.trim() !== "") return normalizeAvatarUrl(post.author.image);
                if (typeof post.author.banner === "string" && post.author.banner.trim() !== "") return normalizeAvatarUrl(post.author.banner);
              }
              if (typeof post.authorAvatar === "string" && post.authorAvatar.trim() !== "") return normalizeAvatarUrl(post.authorAvatar);
              return "";
            })();
            const dateVal = post.publishedAt || post.createdAt;
            const dateObj = dateVal ? (dateVal instanceof Date ? dateVal : new Date(dateVal)) : null;
            const dateIso = dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj.toISOString() : "";
            const excerptText = clampExcerpt(getExcerptSource(post, excerptLength), excerptLength);
            const showMetaRow = currentShowMeta && ((currentShowAuthor && !!authorName) || (currentShowDate && !!dateVal));
            return (
              <article
                key={post.id || `${block.id}-${idx}`}
                className="news-grid-item overflow-hidden border border-[color:var(--border)]"
                style={{ borderRadius: currentCardRadius, backgroundColor: currentCardBg }}
              >
                <Link href={postLink} className="news-grid-thumb relative block overflow-hidden bg-[color:var(--bg-surface,#f9fafb)]" style={{ width: currentImageWidth, height: currentImageHeight }}>
                  {imageUrl ? (
                    <Image src={imageUrl} alt={post.title} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center [color:var(--muted-text,var(--home-meta-color,#9ca3af))] text-xs">No Image</div>
                  )}
                  {isVideo && (
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6 translate-x-[0.5px]">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </span>
                  )}
                  {currentShowCategory && displayCategory && (
                    <span
                      className="news-grid-category absolute top-2 left-2 font-bold uppercase tracking-wide"
                      style={{
                        color: currentCategoryColor,
                        backgroundColor: currentCategoryBg,
                        fontSize: currentCategoryFs,
                        lineHeight: currentCategoryLh,
                        borderRadius: currentCategoryHasBg ? currentCategoryRadius : "0",
                        padding: currentCategoryHasBg ? `${currentCategoryPy} ${currentCategoryPx}` : "0",
                      }}
                    >
                      {displayCategory.name}
                    </span>
                  )}
                </Link>
                <div
                  className="news-grid-content"
                  style={{
                    padding: currentContentPadding,
                    backgroundColor: effectiveContentBg,
                    borderRadius: currentContentRadius,
                    ...contentThemeVars,
                  }}
                >
                  <h4
                    className="news-grid-title-wrap mb-1.5"
                    style={{
                      fontSize: currentTitleFs,
                      lineHeight: currentTitleLh,
                      fontWeight: currentTitleFw,
                      color: effectiveTitleColor,
                      fontFamily: "var(--home-news-title-font, var(--font-heading, sans-serif))",
                      fontSynthesis: "var(--home-news-title-synthesis, var(--font-heading-synthesis, none))",
                    }}
                  >
                    <Link
                      href={postLink}
                      className="news-grid-title transition-colors"
                      style={{
                        ["--news-grid-title-color" as string]: effectiveTitleColor,
                        ["--news-grid-title-size" as string]: currentTitleFs,
                        ["--news-grid-title-weight" as string]: currentTitleFw,
                        ["--news-grid-title-font" as string]: "var(--home-news-title-font, var(--font-heading, sans-serif))",
                        ["--news-grid-title-hover" as string]: effectiveTitleHover,
                        color: "inherit",
                        fontSize: "inherit",
                        lineHeight: "inherit",
                        fontWeight: "inherit",
                        fontFamily: "inherit",
                        fontSynthesis: "inherit",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = effectiveTitleHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "inherit"; }}
                    >
                      {post.title}
                    </Link>
                  </h4>
                  {showMetaRow && (
                    <div
                      className="flex items-center gap-3 mt-2"
                      style={{ color: effectiveMetaColor, fontSize: currentMetaFs, lineHeight: currentMetaLh, fontWeight: currentMetaFw, marginBottom: currentMetaMb }}
                    >
                      {currentShowAuthor && authorName && (
                        <div className="news-grid-author-wrap flex items-center gap-1.5">
                          <span
                            className="rounded-full flex items-center justify-center relative overflow-hidden shrink-0"
                            style={{ width: "1.5em", height: "1.5em", fontSize: "0.92em", backgroundColor: "color-mix(in oklab, var(--fg-primary) 10%, transparent)" }}
                          >
                            {authorAvatar ? (
                              <Image src={authorAvatar} alt={authorName} fill className="object-cover" sizes="16px" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="opacity-80" style={{ width: "1em", height: "1em" }}>
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                          <span className="news-grid-author">{authorName}</span>
                        </div>
                      )}

                      {currentShowAuthor && authorName && currentShowDate && dateVal && (
                        <span className="news-grid-dot rounded-full shrink-0" style={{ width: "0.42em", height: "0.42em", backgroundColor: "currentColor", opacity: 0.5 }} />
                      )}

                      {currentShowDate && dateVal && (
                        <div className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 shrink-0" style={{ width: "1.22em", height: "1.22em" }}>
                            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                          </svg>
                          <time className="news-grid-date" dateTime={dateIso}>
                            {formatLongDateId(dateObj)}
                          </time>
                        </div>
                      )}
                    </div>
                  )}
                  {currentShowExcerpt && (
                    <p style={{ color: effectiveExcerptColor, fontSize: currentExcerptFs, lineHeight: currentExcerptLh, fontWeight: currentExcerptFw }}>
                      {excerptText}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
