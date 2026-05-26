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
  metaColor?: string;
  tabletMetaColor?: string;
  mobileMetaColor?: string;
  metaFontSize?: number | string;
  tabletMetaFontSize?: number | string;
  mobileMetaFontSize?: number | string;
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
  const globalRadius = "var(--home-main-box-radius, 0.75rem)";
  const [device, setDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop");

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
  const cardBgDesktop = (cfg.gridBoxColor as string) || "var(--bg-elevated, #ffffff)";
  const cardBgTablet = (cfg.tabletGridBoxColor as string) || cardBgDesktop;
  const cardBgMobile = (cfg.mobileGridBoxColor as string) || cardBgDesktop;

  const titleColorDesktop = (cfg.titleColor as string) || "var(--home-news-title-color, #111827)";
  const titleColorTablet = (cfg.tabletTitleColor as string) || titleColorDesktop;
  const titleColorMobile = (cfg.mobileTitleColor as string) || titleColorDesktop;
  const titleHoverDesktop = (cfg.titleHoverColor as string) || "var(--home-hover-color, var(--accent))";
  const titleHoverTablet = (cfg.tabletTitleHoverColor as string) || titleHoverDesktop;
  const titleHoverMobile = (cfg.mobileTitleHoverColor as string) || titleHoverDesktop;
  const titleFsDesktop = toPxOrRaw(cfg.titleFontSize, "20px");
  const titleFsTablet = toPxOrRaw(cfg.tabletTitleFontSize ?? cfg.titleFontSize, titleFsDesktop);
  const titleFsMobile = toPxOrRaw(cfg.mobileTitleFontSize ?? cfg.titleFontSize, "18px");
  const titleLhDesktop = String(cfg.titleLineHeight ?? "1.35");
  const titleLhTablet = String(cfg.tabletTitleLineHeight ?? cfg.titleLineHeight ?? "1.35");
  const titleLhMobile = String(cfg.mobileTitleLineHeight ?? cfg.titleLineHeight ?? "1.35");
  const titleFwDesktop = toFontWeight(cfg.titleFontWeight, "700");
  const titleFwTablet = toFontWeight(cfg.tabletTitleFontWeight ?? cfg.titleFontWeight, titleFwDesktop);
  const titleFwMobile = toFontWeight(cfg.mobileTitleFontWeight ?? cfg.titleFontWeight, titleFwDesktop);

  const excerptColorDesktop = (cfg.excerptColor as string) || "var(--home-excerpt-color, #4b5563)";
  const excerptColorTablet = (cfg.tabletExcerptColor as string) || excerptColorDesktop;
  const excerptColorMobile = (cfg.mobileExcerptColor as string) || excerptColorDesktop;
  const excerptFsDesktop = toPxOrRaw(cfg.excerptFontSize, "14px");
  const excerptFsTablet = toPxOrRaw(cfg.tabletExcerptFontSize ?? cfg.excerptFontSize, excerptFsDesktop);
  const excerptFsMobile = toPxOrRaw(cfg.mobileExcerptFontSize ?? cfg.excerptFontSize, "13px");
  const excerptLhDesktop = String(cfg.excerptLineHeight ?? "1.55");
  const excerptLhTablet = String(cfg.tabletExcerptLineHeight ?? cfg.excerptLineHeight ?? "1.55");
  const excerptLhMobile = String(cfg.mobileExcerptLineHeight ?? cfg.excerptLineHeight ?? "1.55");

  const metaColorDesktop = (cfg.metaColor as string) || "var(--home-meta-color, #9ca3af)";
  const metaColorTablet = (cfg.tabletMetaColor as string) || metaColorDesktop;
  const metaColorMobile = (cfg.mobileMetaColor as string) || metaColorDesktop;
  const metaFsDesktop = toPxOrRaw(cfg.metaFontSize, "12px");
  const metaFsTablet = toPxOrRaw(cfg.tabletMetaFontSize ?? cfg.metaFontSize, metaFsDesktop);
  const metaFsMobile = toPxOrRaw(cfg.mobileMetaFontSize ?? cfg.metaFontSize, "11px");

  const categoryColorDesktop = (cfg.categoryTextColor as string) || (cfg.categoryLabelColor as string) || "#ffffff";
  const categoryColorTablet = (cfg.tabletCategoryTextColor as string) || (cfg.tabletCategoryLabelColor as string) || categoryColorDesktop;
  const categoryColorMobile = (cfg.mobileCategoryTextColor as string) || (cfg.mobileCategoryLabelColor as string) || categoryColorDesktop;
  const categoryBgDesktop = (cfg.categoryBgColor as string) || (cfg.categoryLabelBgColor as string) || "var(--accent)";
  const categoryBgTablet = (cfg.tabletCategoryBgColor as string) || (cfg.tabletCategoryLabelBgColor as string) || categoryBgDesktop;
  const categoryBgMobile = (cfg.mobileCategoryBgColor as string) || (cfg.mobileCategoryLabelBgColor as string) || categoryBgDesktop;
  const categoryFsDesktop = toPxOrRaw(cfg.categoryFontSize ?? cfg.categoryLabelFontSize, "11px");
  const categoryFsTablet = toPxOrRaw(cfg.tabletCategoryFontSize ?? cfg.tabletCategoryLabelFontSize ?? cfg.categoryFontSize ?? cfg.categoryLabelFontSize, categoryFsDesktop);
  const categoryFsMobile = toPxOrRaw(cfg.mobileCategoryFontSize ?? cfg.mobileCategoryLabelFontSize ?? cfg.categoryFontSize ?? cfg.categoryLabelFontSize, "10px");
  const categoryRadiusDesktop = resolveRadiusValue(cfg.categoryBorderRadius ?? cfg.categoryLabelBorderRadius, globalRadius);
  const categoryRadiusTablet = resolveRadiusValue(cfg.tabletCategoryBorderRadius ?? cfg.tabletCategoryLabelBorderRadius ?? cfg.categoryBorderRadius ?? cfg.categoryLabelBorderRadius, categoryRadiusDesktop);
  const categoryRadiusMobile = resolveRadiusValue(cfg.mobileCategoryBorderRadius ?? cfg.mobileCategoryLabelBorderRadius ?? cfg.categoryBorderRadius ?? cfg.categoryLabelBorderRadius, categoryRadiusDesktop);

  const blockTitleColorDesktop = (cfg.blockTitleColor as string) || "var(--home-widget-title-color, var(--heading-color, #1e293b))";
  const blockTitleColorTablet = (cfg.tabletBlockTitleColor as string) || blockTitleColorDesktop;
  const blockTitleColorMobile = (cfg.mobileBlockTitleColor as string) || blockTitleColorDesktop;
  const blockTitleFsDesktop = toPxOrRaw(cfg.blockTitleFontSize, "24px");
  const blockTitleFsTablet = toPxOrRaw(cfg.tabletBlockTitleFontSize ?? cfg.blockTitleFontSize, blockTitleFsDesktop);
  const blockTitleFsMobile = toPxOrRaw(cfg.mobileBlockTitleFontSize ?? cfg.blockTitleFontSize, "20px");
  const blockTitleBorderDesktop = (cfg.blockTitleBorderColor as string) || "var(--accent)";
  const blockTitleBorderTablet = (cfg.tabletBlockTitleBorderColor as string) || blockTitleBorderDesktop;
  const blockTitleBorderMobile = (cfg.mobileBlockTitleBorderColor as string) || blockTitleBorderDesktop;

  const contentPaddingDesktop = toPxOrRaw(cfg.contentPadding, "12px");
  const contentPaddingTablet = toPxOrRaw(cfg.tabletContentPadding ?? cfg.contentPadding, contentPaddingDesktop);
  const contentPaddingMobile = toPxOrRaw(cfg.mobileContentPadding ?? cfg.contentPadding, contentPaddingDesktop);
  const contentBgDesktop = (cfg.backgroundColor as string) || "transparent";
  const contentBgTablet = (cfg.tabletBackgroundColor as string) || contentBgDesktop;
  const contentBgMobile = (cfg.mobileBackgroundColor as string) || contentBgDesktop;
  const contentRadiusDesktop = resolveRadiusValue(cfg.borderRadius, globalRadius);
  const contentRadiusTablet = resolveRadiusValue(cfg.tabletBorderRadius ?? cfg.borderRadius, contentRadiusDesktop);
  const contentRadiusMobile = resolveRadiusValue(cfg.mobileBorderRadius ?? cfg.borderRadius, contentRadiusDesktop);

  const showCategoryDesktop = getResponsiveBool(configRecord, "showCategory", "desktop", true);
  const showMetaDesktop = getResponsiveBool(configRecord, "showMetaInfo", "desktop", true);
  const showAuthorDesktop = getResponsiveBool(configRecord, "showAuthor", "desktop", true);
  const showDateDesktop = getResponsiveBool(configRecord, "showDate", "desktop", true);
  const showExcerptDesktop = getResponsiveBool(configRecord, "showExcerpt", "desktop", false);

  const showCategoryTablet = getResponsiveBool(configRecord, "showCategory", "tablet", true);
  const showMetaTablet = getResponsiveBool(configRecord, "showMetaInfo", "tablet", true);
  const showAuthorTablet = getResponsiveBool(configRecord, "showAuthor", "tablet", true);
  const showDateTablet = getResponsiveBool(configRecord, "showDate", "tablet", true);
  const showExcerptTablet = getResponsiveBool(configRecord, "showExcerpt", "tablet", false);

  const showCategoryMobile = getResponsiveBool(configRecord, "showCategory", "mobile", true);
  const showMetaMobile = getResponsiveBool(configRecord, "showMetaInfo", "mobile", true);
  const showAuthorMobile = getResponsiveBool(configRecord, "showAuthor", "mobile", true);
  const showDateMobile = getResponsiveBool(configRecord, "showDate", "mobile", true);
  const showExcerptMobile = getResponsiveBool(configRecord, "showExcerpt", "mobile", false);

  const excerptLenDesktop = toNumber(cfg.excerptLength, 110);
  const excerptLenTablet = toNumber(cfg.tabletExcerptLength ?? cfg.excerptLength, excerptLenDesktop);
  const excerptLenMobile = toNumber(cfg.mobileExcerptLength ?? cfg.excerptLength, 90);

  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const useBoxDesktop = useBoxValues.desktop;
  const useBoxTablet = useBoxValues.tablet;
  const useBoxMobile = useBoxValues.mobile;
  const boxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = boxColorValues.desktop || "var(--bg-elevated, #ffffff)";
  const boxColorTablet = boxColorValues.tablet || boxColorDesktop;
  const boxColorMobile = boxColorValues.mobile || boxColorDesktop;
  const boxRadiusDesktop = resolveRadiusValue(cfg.boxBorderRadius, globalRadius);
  const boxRadiusTablet = resolveRadiusValue(cfg.tabletBoxBorderRadius ?? cfg.boxBorderRadius, boxRadiusDesktop);
  const boxRadiusMobile = resolveRadiusValue(cfg.mobileBoxBorderRadius ?? cfg.boxBorderRadius, boxRadiusDesktop);

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

  const excerptLength = device === "mobile"
    ? excerptLenMobile
    : device === "tablet"
      ? excerptLenTablet
      : excerptLenDesktop;

  return (
    <div
      id={`news-grid-${block.id}`}
      className={`w-full ${darkWidgetBoxAuto ? "news-grid-dark-widget-auto" : ""} ${darkCardBoxAuto ? "news-grid-dark-card-auto" : ""}`}
      style={{
        backgroundColor: "transparent",
        borderRadius: "0",
        border: "none",
        boxShadow: "none",
        "--widget-title-color-mobile": blockTitleColorMobile,
        "--widget-title-color-tablet": blockTitleColorTablet,
        "--widget-title-color-desktop": blockTitleColorDesktop,
        "--widget-title-size-mobile": blockTitleFsMobile,
        "--widget-title-size-tablet": blockTitleFsTablet,
        "--widget-title-size-desktop": blockTitleFsDesktop,
        "--widget-title-border-color-mobile": blockTitleBorderMobile,
        "--widget-title-border-color-tablet": blockTitleBorderTablet,
        "--widget-title-border-color-desktop": blockTitleBorderDesktop,
      } as React.CSSProperties}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #news-grid-${block.id} {
              background-color: ${useBoxMobile ? boxColorMobile : "transparent"};
              border-radius: ${useBoxMobile ? boxRadiusMobile : "0"};
              border: ${useBoxMobile ? "var(--box-border, 1px solid #f3f4f6)" : "none"};
              box-shadow: ${useBoxMobile ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none"};
            }
            #news-grid-${block.id} .news-grid-inner {
              margin-top: ${mTopMobile};
              margin-right: ${mRightMobile};
              margin-bottom: ${mBottomMobile};
              margin-left: ${mLeftMobile};
              padding-top: ${pTopMobile};
              padding-right: ${pRightMobile};
              padding-bottom: ${pBottomMobile};
              padding-left: ${pLeftMobile};
            }
            #news-grid-${block.id} .news-grid-list {
              display: grid;
              grid-template-columns: repeat(${columnsMobile}, minmax(0, 1fr));
              column-gap: ${gapXMobile};
              row-gap: ${gapYMobile};
            }
            #news-grid-${block.id} .news-grid-item:nth-child(n+${limitMobile + 1}) { display: none; }
            #news-grid-${block.id} .news-grid-item {
              border-radius: ${cardRadiusMobile};
              background-color: ${cardBgMobile};
            }
            #news-grid-${block.id} .news-grid-content {
              padding: ${contentPaddingMobile};
              background-color: ${contentBgMobile};
              border-radius: ${contentRadiusMobile};
            }
            #news-grid-${block.id} .news-grid-thumb { width: ${imageWidthMobile}; height: ${imageHeightMobile}; }
            #news-grid-${block.id} .news-grid-category {
              display: ${showCategoryMobile ? "inline-flex" : "none"};
              color: ${categoryColorMobile};
              background-color: ${categoryBgMobile};
              font-size: ${categoryFsMobile};
              border-radius: ${categoryRadiusMobile};
            }
            #news-grid-${block.id} .news-grid-title-wrap {
              font-size: ${titleFsMobile};
              line-height: ${titleLhMobile};
              font-weight: ${titleFwMobile};
            }
            #news-grid-${block.id} .news-grid-title { color: inherit !important; font-size: inherit !important; line-height: inherit !important; font-weight: inherit !important; font-family: inherit !important; }
            #news-grid-${block.id} .news-grid-title-wrap { color: ${titleColorMobile}; }
            #news-grid-${block.id} .news-grid-title:hover { color: ${titleHoverMobile} !important; }
            #news-grid-${block.id} .news-grid-meta {
              display: ${showMetaMobile ? "flex" : "none"};
              color: ${metaColorMobile};
              font-size: ${metaFsMobile};
            }
            #news-grid-${block.id} .news-grid-author-wrap { display: ${showAuthorMobile ? "flex" : "none"}; }
            #news-grid-${block.id} .news-grid-author { display: ${showAuthorMobile ? "inline" : "none"}; }
            #news-grid-${block.id} .news-grid-date { display: ${showDateMobile ? "inline" : "none"}; }
            #news-grid-${block.id} .news-grid-dot { display: ${showAuthorMobile && showDateMobile ? "inline" : "none"}; }
            #news-grid-${block.id} .news-grid-excerpt {
              display: ${showExcerptMobile ? "block" : "none"};
              color: ${excerptColorMobile};
              font-size: ${excerptFsMobile};
              line-height: ${excerptLhMobile};
            }
            @media (min-width: 768px) {
              #news-grid-${block.id} {
                background-color: ${useBoxTablet ? boxColorTablet : "transparent"};
                border-radius: ${useBoxTablet ? boxRadiusTablet : "0"};
                border: ${useBoxTablet ? "var(--box-border, 1px solid #f3f4f6)" : "none"};
                box-shadow: ${useBoxTablet ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none"};
              }
              #news-grid-${block.id} .news-grid-inner {
                margin-top: ${mTopTablet};
                margin-right: ${mRightTablet};
                margin-bottom: ${mBottomTablet};
                margin-left: ${mLeftTablet};
                padding-top: ${pTopTablet};
                padding-right: ${pRightTablet};
                padding-bottom: ${pBottomTablet};
                padding-left: ${pLeftTablet};
              }
              #news-grid-${block.id} .news-grid-list {
                grid-template-columns: repeat(${columnsTablet}, minmax(0, 1fr));
                column-gap: ${gapXTablet};
                row-gap: ${gapYTablet};
              }
              #news-grid-${block.id} .news-grid-item { display: block; }
              #news-grid-${block.id} .news-grid-item:nth-child(n+${limitTablet + 1}) { display: none; }
              #news-grid-${block.id} .news-grid-item { border-radius: ${cardRadiusTablet}; background-color: ${cardBgTablet}; }
              #news-grid-${block.id} .news-grid-content { padding: ${contentPaddingTablet}; background-color: ${contentBgTablet}; border-radius: ${contentRadiusTablet}; }
              #news-grid-${block.id} .news-grid-thumb { width: ${imageWidthTablet}; height: ${imageHeightTablet}; }
              #news-grid-${block.id} .news-grid-category { display: ${showCategoryTablet ? "inline-flex" : "none"}; color: ${categoryColorTablet}; background-color: ${categoryBgTablet}; font-size: ${categoryFsTablet}; border-radius: ${categoryRadiusTablet}; }
              #news-grid-${block.id} .news-grid-title-wrap { font-size: ${titleFsTablet}; line-height: ${titleLhTablet}; font-weight: ${titleFwTablet}; color: ${titleColorTablet}; }
              #news-grid-${block.id} .news-grid-title:hover { color: ${titleHoverTablet} !important; }
              #news-grid-${block.id} .news-grid-meta { display: ${showMetaTablet ? "flex" : "none"}; color: ${metaColorTablet}; font-size: ${metaFsTablet}; }
              #news-grid-${block.id} .news-grid-author-wrap { display: ${showAuthorTablet ? "flex" : "none"}; }
              #news-grid-${block.id} .news-grid-author { display: ${showAuthorTablet ? "inline" : "none"}; }
              #news-grid-${block.id} .news-grid-date { display: ${showDateTablet ? "inline" : "none"}; }
              #news-grid-${block.id} .news-grid-dot { display: ${showAuthorTablet && showDateTablet ? "inline" : "none"}; }
              #news-grid-${block.id} .news-grid-excerpt { display: ${showExcerptTablet ? "block" : "none"}; color: ${excerptColorTablet}; font-size: ${excerptFsTablet}; line-height: ${excerptLhTablet}; }
            }
            @media (min-width: 1025px) {
              #news-grid-${block.id} {
                background-color: ${useBoxDesktop ? boxColorDesktop : "transparent"};
                border-radius: ${useBoxDesktop ? boxRadiusDesktop : "0"};
                border: ${useBoxDesktop ? "var(--box-border, 1px solid #f3f4f6)" : "none"};
                box-shadow: ${useBoxDesktop ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none"};
              }
              #news-grid-${block.id} .news-grid-inner {
                margin-top: ${mTopDesktop};
                margin-right: ${mRightDesktop};
                margin-bottom: ${mBottomDesktop};
                margin-left: ${mLeftDesktop};
                padding-top: ${pTopDesktop};
                padding-right: ${pRightDesktop};
                padding-bottom: ${pBottomDesktop};
                padding-left: ${pLeftDesktop};
              }
              #news-grid-${block.id} .news-grid-list {
                grid-template-columns: repeat(${columnsDesktop}, minmax(0, 1fr));
                column-gap: ${gapXDesktop};
                row-gap: ${gapYDesktop};
              }
              #news-grid-${block.id} .news-grid-item { display: block; }
              #news-grid-${block.id} .news-grid-item:nth-child(n+${limitDesktop + 1}) { display: none; }
              #news-grid-${block.id} .news-grid-item { border-radius: ${cardRadiusDesktop}; background-color: ${cardBgDesktop}; }
              #news-grid-${block.id} .news-grid-content { padding: ${contentPaddingDesktop}; background-color: ${contentBgDesktop}; border-radius: ${contentRadiusDesktop}; }
              #news-grid-${block.id} .news-grid-thumb { width: ${imageWidthDesktop}; height: ${imageHeightDesktop}; }
              #news-grid-${block.id} .news-grid-category { display: ${showCategoryDesktop ? "inline-flex" : "none"}; color: ${categoryColorDesktop}; background-color: ${categoryBgDesktop}; font-size: ${categoryFsDesktop}; border-radius: ${categoryRadiusDesktop}; }
              #news-grid-${block.id} .news-grid-title-wrap { font-size: ${titleFsDesktop}; line-height: ${titleLhDesktop}; font-weight: ${titleFwDesktop}; color: ${titleColorDesktop}; }
              #news-grid-${block.id} .news-grid-title:hover { color: ${titleHoverDesktop} !important; }
              #news-grid-${block.id} .news-grid-meta { display: ${showMetaDesktop ? "flex" : "none"}; color: ${metaColorDesktop}; font-size: ${metaFsDesktop}; }
              #news-grid-${block.id} .news-grid-author-wrap { display: ${showAuthorDesktop ? "flex" : "none"}; }
              #news-grid-${block.id} .news-grid-author { display: ${showAuthorDesktop ? "inline" : "none"}; }
              #news-grid-${block.id} .news-grid-date { display: ${showDateDesktop ? "inline" : "none"}; }
              #news-grid-${block.id} .news-grid-dot { display: ${showAuthorDesktop && showDateDesktop ? "inline" : "none"}; }
              #news-grid-${block.id} .news-grid-excerpt { display: ${showExcerptDesktop ? "block" : "none"}; color: ${excerptColorDesktop}; font-size: ${excerptFsDesktop}; line-height: ${excerptLhDesktop}; }
            }
            html.public-dark #news-grid-${block.id}.news-grid-dark-widget-auto {
              background-color: var(--bg-elevated) !important;
              border: 1px solid var(--border) !important;
              box-shadow: none !important;
            }
            html.public-dark #news-grid-${block.id}.news-grid-dark-card-auto .news-grid-item {
              background-color: var(--bg-surface) !important;
              border-color: var(--border) !important;
            }
            html.public-dark #news-grid-${block.id}.news-grid-dark-card-auto .news-grid-content {
              background-color: transparent !important;
            }
          `,
        }}
      />

      <div className="news-grid-inner">
        {(cfg.showTitle !== false) && (
          <h3 className="font-bold mb-3 border-b border-gray-100 pb-3 flex items-center theme-widget-title">
            <div className="widget-title-bar w-1 h-5 mr-3" style={{ borderRadius: "var(--home-main-box-radius, 0.25rem)" }}></div>
            <span>{title}</span>
          </h3>
        )}

        <div className="news-grid-list">
          {visiblePosts.map((post, idx) => {
            const postLink = post.category ? `/${post.category.slug}/${post.slug}` : `/post/${post.slug}`;
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
            return (
              <article key={post.id || `${block.id}-${idx}`} className="news-grid-item overflow-hidden border border-[color:var(--border)]">
                <Link href={postLink} className="news-grid-thumb relative block overflow-hidden bg-gray-100">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={post.title} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--fg-muted)] text-xs">No Image</div>
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
                  {post.category && (
                    <span className="news-grid-category absolute top-2 left-2 px-2 py-0.5 font-bold uppercase tracking-wide">
                      {post.category.name}
                    </span>
                  )}
                </Link>
                <div className="news-grid-content">
                  <h4 className="news-grid-title-wrap mb-1.5">
                    <Link href={postLink} className="news-grid-title transition-colors">
                      {post.title}
                    </Link>
                  </h4>
                  {(authorName || dateVal) && (
                    <div className="news-grid-meta items-center gap-3 font-medium mt-2">
                      {authorName && (
                        <div className="news-grid-author-wrap items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] relative overflow-hidden" style={{ backgroundColor: "color-mix(in oklab, var(--fg-primary) 10%, transparent)" }}>
                            {authorAvatar ? (
                              <Image src={authorAvatar} alt={authorName} fill className="object-cover" sizes="16px" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 opacity-80">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                          <span className="news-grid-author">{authorName}</span>
                        </div>
                      )}

                      {authorName && dateVal && (
                        <span className="news-grid-dot w-1 h-1 rounded-full" style={{ backgroundColor: "currentColor", opacity: 0.5 }} />
                      )}

                      {dateVal && (
                        <div className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
                            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                          </svg>
                          <time className="news-grid-date" dateTime={dateIso}>
                            {formatLongDateId(dateObj)}
                          </time>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="news-grid-excerpt">{excerptText}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
