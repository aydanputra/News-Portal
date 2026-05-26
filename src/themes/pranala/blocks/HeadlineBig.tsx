"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBool, getResponsiveBoolValues, getResponsiveValues, type ResponsiveDevice } from "./responsive";

interface HeadlineBigProps {
  block: any;
  posts: any[];
  accentColor?: string;
  borderRadius?: string;
  previewDevice?: ResponsiveDevice;
}

const formatSize = (val: unknown, fallback: string) => {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "number" && Number.isFinite(val)) return `${val}px`;
  if (typeof val === "string") {
    const v = val.trim();
    if (!v) return fallback;
    if (/^\d+(\.\d+)?$/.test(v)) return `${v}px`;
    return v;
  }
  return fallback;
};

const resolveRadiusValue = (value: unknown, fallback: string) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value < 0) return fallback;
    return `${value}px`;
  }
  if (typeof value === "string") {
    const v = value.trim();
    if (!v) return fallback;
    const lower = v.toLowerCase();
    if (lower === "default" || lower === "global") return fallback;
    if (lower === "none") return "0";
    if (lower === "sm") return "0.125rem";
    if (lower === "md") return "0.375rem";
    if (lower === "lg") return "0.5rem";
    if (lower === "xl") return "0.75rem";
    if (lower === "2xl") return "1rem";
    if (lower === "full") return "9999px";
    if (/^-?\d+(\.\d+)?$/.test(v)) {
      const parsed = Number(v);
      if (!Number.isFinite(parsed) || parsed < 0) return fallback;
      return `${parsed}px`;
    }
    return v;
  }
  return fallback;
};

const normalizeColor = (val: unknown, fallback: string) =>
  typeof val === "string" && val.trim() !== "" ? val : fallback;

const normalizeText = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : fallback;

const normalizeFontWeight = (value: unknown, fallback: string) => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return fallback;
  const v = value.trim().toLowerCase();
  if (!v) return fallback;
  if (/^\d{3}$/.test(v)) return v;
  const map: Record<string, string> = {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  };
  return map[v] || fallback;
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

const clampExcerpt = (text: unknown, length: number) => {
  if (typeof text !== "string") return "";
  if (text.length <= length) return text;
  if (length <= 1) return text.slice(0, Math.max(0, length));
  return `${text.slice(0, length - 1).trimEnd()}…`;
};

const stripHtml = (text: unknown) => {
  if (typeof text !== "string") return "";
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const normalizeAvatarUrl = (value: unknown) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `/${trimmed}`;
};

export default function HeadlineBig({ block, posts, accentColor, borderRadius, previewDevice }: HeadlineBigProps) {
  const config = block.config || {};
  const configRecord = config as Record<string, unknown>;
  const post = posts && posts.length > 0 ? posts[0] : null;
  const effectiveAccent = accentColor || "var(--accent)";
  const effectiveRadius = borderRadius || "var(--home-main-box-radius, 0.75rem)";

  let visibilityClass = "";
  if (config.hideOnDesktop) visibilityClass += " lg:hidden";
  if (config.hideOnTablet) visibilityClass += " md:max-lg:hidden";
  if (config.hideOnMobile) visibilityClass += " max-md:hidden";

  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const useBoxDesktop = useBoxValues.desktop;
  const useBoxTablet = useBoxValues.tablet;
  const useBoxMobile = useBoxValues.mobile;

  const boxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = normalizeColor(boxColorValues.desktop, "var(--bg-elevated, #ffffff)");
  const boxColorTablet = normalizeColor(boxColorValues.tablet, boxColorDesktop);
  const boxColorMobile = normalizeColor(boxColorValues.mobile, boxColorDesktop);

  const baseMarginTop = config.marginTop !== undefined ? `${config.marginTop}px` : "0px";
  const baseMarginRight = config.marginRight !== undefined ? `${config.marginRight}px` : "0px";
  const baseMarginBottom = config.marginBottom !== undefined ? `${config.marginBottom}px` : "0px";
  const baseMarginLeft = config.marginLeft !== undefined ? `${config.marginLeft}px` : "0px";
  const mTopMobile = config.mobileMarginTop !== undefined ? `${config.mobileMarginTop}px` : baseMarginTop;
  const mRightMobile = config.mobileMarginRight !== undefined ? `${config.mobileMarginRight}px` : baseMarginRight;
  const mBottomMobile = config.mobileMarginBottom !== undefined ? `${config.mobileMarginBottom}px` : baseMarginBottom;
  const mLeftMobile = config.mobileMarginLeft !== undefined ? `${config.mobileMarginLeft}px` : baseMarginLeft;
  const mTopTablet = config.tabletMarginTop !== undefined ? `${config.tabletMarginTop}px` : baseMarginTop;
  const mRightTablet = config.tabletMarginRight !== undefined ? `${config.tabletMarginRight}px` : baseMarginRight;
  const mBottomTablet = config.tabletMarginBottom !== undefined ? `${config.tabletMarginBottom}px` : baseMarginBottom;
  const mLeftTablet = config.tabletMarginLeft !== undefined ? `${config.tabletMarginLeft}px` : baseMarginLeft;
  const mTopDesktop = baseMarginTop;
  const mRightDesktop = baseMarginRight;
  const mBottomDesktop = baseMarginBottom;
  const mLeftDesktop = baseMarginLeft;

  const basePaddingTop = config.paddingTop !== undefined ? `${config.paddingTop}px` : "0px";
  const basePaddingRight = config.paddingRight !== undefined ? `${config.paddingRight}px` : "0px";
  const basePaddingBottom = config.paddingBottom !== undefined ? `${config.paddingBottom}px` : "0px";
  const basePaddingLeft = config.paddingLeft !== undefined ? `${config.paddingLeft}px` : "0px";
  const pTopMobile = config.mobilePaddingTop !== undefined ? `${config.mobilePaddingTop}px` : basePaddingTop;
  const pRightMobile = config.mobilePaddingRight !== undefined ? `${config.mobilePaddingRight}px` : basePaddingRight;
  const pBottomMobile = config.mobilePaddingBottom !== undefined ? `${config.mobilePaddingBottom}px` : basePaddingBottom;
  const pLeftMobile = config.mobilePaddingLeft !== undefined ? `${config.mobilePaddingLeft}px` : basePaddingLeft;
  const pTopTablet = config.tabletPaddingTop !== undefined ? `${config.tabletPaddingTop}px` : basePaddingTop;
  const pRightTablet = config.tabletPaddingRight !== undefined ? `${config.tabletPaddingRight}px` : basePaddingRight;
  const pBottomTablet = config.tabletPaddingBottom !== undefined ? `${config.tabletPaddingBottom}px` : basePaddingBottom;
  const pLeftTablet = config.tabletPaddingLeft !== undefined ? `${config.tabletPaddingLeft}px` : basePaddingLeft;
  const pTopDesktop = basePaddingTop;
  const pRightDesktop = basePaddingRight;
  const pBottomDesktop = basePaddingBottom;
  const pLeftDesktop = basePaddingLeft;

  const imageHeightMobile = formatSize(config.mobileImageHeight ?? config.imageHeight, "270px");
  const imageHeightTablet = formatSize(config.tabletImageHeight ?? config.imageHeight, "380px");
  const imageHeightDesktop = formatSize(config.imageHeight, "440px");
  const imageRadius = effectiveRadius;

  const titleFsMobile = formatSize(config.mobileTitleFontSize ?? config.titleFontSize, "var(--home-news-title-size, 18px)");
  const titleFsTablet = formatSize(config.tabletTitleFontSize ?? config.titleFontSize, titleFsMobile);
  const titleFsDesktop = formatSize(config.titleFontSize, titleFsTablet);
  const titleLhMobile = config.mobileTitleLineHeight !== undefined ? String(config.mobileTitleLineHeight) : (config.titleLineHeight !== undefined ? String(config.titleLineHeight) : "1.15");
  const titleLhTablet = config.tabletTitleLineHeight !== undefined ? String(config.tabletTitleLineHeight) : titleLhMobile;
  const titleLhDesktop = config.titleLineHeight !== undefined ? String(config.titleLineHeight) : titleLhTablet;
  const titleFwMobile = normalizeFontWeight(config.mobileTitleFontWeight, normalizeFontWeight(config.titleFontWeight, "var(--home-news-title-weight, 600)"));
  const titleFwTablet = normalizeFontWeight(config.tabletTitleFontWeight, titleFwMobile);
  const titleFwDesktop = normalizeFontWeight(config.titleFontWeight, titleFwTablet);
  const titleColorMobile = normalizeColor(config.mobileTitleColor, normalizeColor(config.titleColor, "var(--home-news-title-color, #111827)"));
  const titleColorTablet = normalizeColor(config.tabletTitleColor, titleColorMobile);
  const titleColorDesktop = normalizeColor(config.titleColor, titleColorTablet);
  const titleHoverColorMobile = normalizeColor(config.mobileTitleHoverColor, normalizeColor(config.titleHoverColor, "var(--home-hover-color, var(--accent))"));
  const titleHoverColorTablet = normalizeColor(config.tabletTitleHoverColor, titleHoverColorMobile);
  const titleHoverColorDesktop = normalizeColor(config.titleHoverColor, titleHoverColorTablet);
  const titleMtMobile = config.mobileTitleMarginTop !== undefined ? `${config.mobileTitleMarginTop}px` : (config.titleMarginTop !== undefined ? `${config.titleMarginTop}px` : "14px");
  const titleMtTablet = config.tabletTitleMarginTop !== undefined ? `${config.tabletTitleMarginTop}px` : (config.titleMarginTop !== undefined ? `${config.titleMarginTop}px` : "16px");
  const titleMtDesktop = config.titleMarginTop !== undefined ? `${config.titleMarginTop}px` : "18px";
  const titleMbMobile = config.mobileTitleMarginBottom !== undefined ? `${config.mobileTitleMarginBottom}px` : (config.titleMarginBottom !== undefined ? `${config.titleMarginBottom}px` : "10px");
  const titleMbTablet = config.tabletTitleMarginBottom !== undefined ? `${config.tabletTitleMarginBottom}px` : (config.titleMarginBottom !== undefined ? `${config.titleMarginBottom}px` : "11px");
  const titleMbDesktop = config.titleMarginBottom !== undefined ? `${config.titleMarginBottom}px` : "12px";

  const metaFsMobile = formatSize(config.mobileMetaFontSize ?? config.metaFontSize, "12px");
  const metaFsTablet = formatSize(config.tabletMetaFontSize ?? config.metaFontSize, metaFsMobile);
  const metaFsDesktop = formatSize(config.metaFontSize, metaFsTablet);
  const metaLhMobile = config.mobileMetaLineHeight !== undefined ? String(config.mobileMetaLineHeight) : (config.metaLineHeight !== undefined ? String(config.metaLineHeight) : "1.3");
  const metaLhTablet = config.tabletMetaLineHeight !== undefined ? String(config.tabletMetaLineHeight) : metaLhMobile;
  const metaLhDesktop = config.metaLineHeight !== undefined ? String(config.metaLineHeight) : metaLhTablet;
  const metaColorMobile = normalizeColor(config.mobileMetaColor, normalizeColor(config.metaColor, "var(--home-meta-color, #9ca3af)"));
  const metaColorTablet = normalizeColor(config.tabletMetaColor, metaColorMobile);
  const metaColorDesktop = normalizeColor(config.metaColor, metaColorTablet);
  const metaMbMobile = config.mobileMetaMarginBottom !== undefined ? `${config.mobileMetaMarginBottom}px` : (config.metaMarginBottom !== undefined ? `${config.metaMarginBottom}px` : "12px");
  const metaMbTablet = config.tabletMetaMarginBottom !== undefined ? `${config.tabletMetaMarginBottom}px` : (config.metaMarginBottom !== undefined ? `${config.metaMarginBottom}px` : "14px");
  const metaMbDesktop = config.metaMarginBottom !== undefined ? `${config.metaMarginBottom}px` : "16px";

  const excerptFsMobile = formatSize(config.mobileExcerptFontSize ?? config.excerptFontSize, "1.125rem");
  const excerptFsTablet = formatSize(config.tabletExcerptFontSize ?? config.excerptFontSize, excerptFsMobile);
  const excerptFsDesktop = formatSize(config.excerptFontSize, excerptFsTablet);
  const excerptLhMobile = config.mobileExcerptLineHeight !== undefined ? String(config.mobileExcerptLineHeight) : (config.excerptLineHeight !== undefined ? String(config.excerptLineHeight) : "1.6");
  const excerptLhTablet = config.tabletExcerptLineHeight !== undefined ? String(config.tabletExcerptLineHeight) : excerptLhMobile;
  const excerptLhDesktop = config.excerptLineHeight !== undefined ? String(config.excerptLineHeight) : excerptLhTablet;
  const excerptColorMobile = normalizeColor(config.mobileExcerptColor, normalizeColor(config.excerptColor, "var(--home-excerpt-color, #4b5563)"));
  const excerptColorTablet = normalizeColor(config.tabletExcerptColor, excerptColorMobile);
  const excerptColorDesktop = normalizeColor(config.excerptColor, excerptColorTablet);
  const excerptMbMobile = config.mobileExcerptMarginBottom !== undefined ? `${config.mobileExcerptMarginBottom}px` : (config.excerptMarginBottom !== undefined ? `${config.excerptMarginBottom}px` : "16px");
  const excerptMbTablet = config.tabletExcerptMarginBottom !== undefined ? `${config.tabletExcerptMarginBottom}px` : (config.excerptMarginBottom !== undefined ? `${config.excerptMarginBottom}px` : "18px");
  const excerptMbDesktop = config.excerptMarginBottom !== undefined ? `${config.excerptMarginBottom}px` : "20px";

  const categoryColorMobile = normalizeColor(
    config.mobileCategoryTextColor,
    normalizeColor(config.mobileCategoryLabelColor, normalizeColor(config.categoryTextColor, normalizeColor(config.categoryLabelColor, "#ffffff")))
  );
  const categoryColorTablet = normalizeColor(config.tabletCategoryTextColor, normalizeColor(config.tabletCategoryLabelColor, categoryColorMobile));
  const categoryColorDesktop = normalizeColor(config.categoryTextColor, normalizeColor(config.categoryLabelColor, categoryColorTablet));
  const categoryBgMobile = normalizeColor(
    config.mobileCategoryBgColor,
    normalizeColor(config.mobileCategoryLabelBgColor, normalizeColor(config.categoryBgColor, normalizeColor(config.categoryLabelBgColor, effectiveAccent)))
  );
  const categoryBgTablet = normalizeColor(config.tabletCategoryBgColor, normalizeColor(config.tabletCategoryLabelBgColor, categoryBgMobile));
  const categoryBgDesktop = normalizeColor(config.categoryBgColor, normalizeColor(config.categoryLabelBgColor, categoryBgTablet));
  const categoryFsMobile = formatSize(config.mobileCategoryFontSize ?? config.mobileCategoryLabelFontSize ?? config.categoryFontSize ?? config.categoryLabelFontSize, "10px");
  const categoryFsTablet = formatSize(config.tabletCategoryFontSize ?? config.tabletCategoryLabelFontSize ?? config.categoryFontSize ?? config.categoryLabelFontSize, categoryFsMobile);
  const categoryFsDesktop = formatSize(config.categoryFontSize ?? config.categoryLabelFontSize, categoryFsTablet);
  const categoryLhMobile = config.mobileCategoryLabelLineHeight !== undefined ? String(config.mobileCategoryLabelLineHeight) : (config.categoryLabelLineHeight !== undefined ? String(config.categoryLabelLineHeight) : "1");
  const categoryLhTablet = config.tabletCategoryLabelLineHeight !== undefined ? String(config.tabletCategoryLabelLineHeight) : categoryLhMobile;
  const categoryLhDesktop = config.categoryLabelLineHeight !== undefined ? String(config.categoryLabelLineHeight) : categoryLhTablet;
  const categoryRadiusMobile = resolveRadiusValue(
    config.mobileCategoryLabelBorderRadius ?? config.mobileCategoryBorderRadius ?? config.categoryLabelBorderRadius ?? config.categoryBorderRadius,
    effectiveRadius
  );
  const categoryRadiusTablet = resolveRadiusValue(
    config.tabletCategoryLabelBorderRadius ?? config.tabletCategoryBorderRadius ?? config.categoryLabelBorderRadius ?? config.categoryBorderRadius,
    categoryRadiusMobile
  );
  const categoryRadiusDesktop = resolveRadiusValue(
    config.categoryLabelBorderRadius ?? config.categoryBorderRadius,
    categoryRadiusTablet
  );

  const blockTitleColorMobile = normalizeColor(config.mobileBlockTitleColor, normalizeColor(config.blockTitleColor, "var(--home-widget-title-color, var(--heading-color, #1e293b))"));
  const blockTitleColorTablet = normalizeColor(config.tabletBlockTitleColor, blockTitleColorMobile);
  const blockTitleColorDesktop = normalizeColor(config.blockTitleColor, blockTitleColorTablet);
  const blockTitleFsMobile = formatSize(config.mobileBlockTitleFontSize ?? config.blockTitleFontSize, "20px");
  const blockTitleFsTablet = formatSize(config.tabletBlockTitleFontSize ?? config.blockTitleFontSize, "22px");
  const blockTitleFsDesktop = formatSize(config.blockTitleFontSize, "24px");
  const blockTitleBorderMobile = normalizeColor(config.mobileBlockTitleBorderColor, normalizeColor(config.blockTitleBorderColor, "var(--accent)"));
  const blockTitleBorderTablet = normalizeColor(config.tabletBlockTitleBorderColor, blockTitleBorderMobile);
  const blockTitleBorderDesktop = normalizeColor(config.blockTitleBorderColor, blockTitleBorderTablet);

  const showCategoryMobile = getResponsiveBool(configRecord, "showCategory", "mobile", true);
  const showCategoryTablet = getResponsiveBool(configRecord, "showCategory", "tablet", true);
  const showCategoryDesktop = getResponsiveBool(configRecord, "showCategory", "desktop", true);
  const showMetaMobile = getResponsiveBool(
    configRecord,
    "showMetaInfo",
    "mobile",
    getResponsiveBool(configRecord, "showMeta", "mobile", true)
  );
  const showMetaTablet = getResponsiveBool(
    configRecord,
    "showMetaInfo",
    "tablet",
    getResponsiveBool(configRecord, "showMeta", "tablet", true)
  );
  const showMetaDesktop = getResponsiveBool(
    configRecord,
    "showMetaInfo",
    "desktop",
    getResponsiveBool(configRecord, "showMeta", "desktop", true)
  );
  const showAuthorMobile = getResponsiveBool(configRecord, "showAuthor", "mobile", true);
  const showAuthorTablet = getResponsiveBool(configRecord, "showAuthor", "tablet", true);
  const showAuthorDesktop = getResponsiveBool(configRecord, "showAuthor", "desktop", true);
  const showDateMobile = getResponsiveBool(configRecord, "showDate", "mobile", true);
  const showDateTablet = getResponsiveBool(configRecord, "showDate", "tablet", true);
  const showDateDesktop = getResponsiveBool(configRecord, "showDate", "desktop", true);
  const showExcerptMobile = getResponsiveBool(configRecord, "showExcerpt", "mobile", true);
  const showExcerptTablet = getResponsiveBool(configRecord, "showExcerpt", "tablet", true);
  const showExcerptDesktop = getResponsiveBool(configRecord, "showExcerpt", "desktop", true);
  const showReadMoreMobile = getResponsiveBool(configRecord, "showReadMore", "mobile", config.showReadMore !== false);
  const showReadMoreTablet = getResponsiveBool(configRecord, "showReadMore", "tablet", config.showReadMore !== false);
  const showReadMoreDesktop = getResponsiveBool(configRecord, "showReadMore", "desktop", config.showReadMore !== false);

  const excerptLengthMobile = typeof config.mobileExcerptLength === "number"
    ? config.mobileExcerptLength
    : (typeof config.excerptLength === "number" ? config.excerptLength : 180);
  const excerptLengthTablet = typeof config.tabletExcerptLength === "number"
    ? config.tabletExcerptLength
    : excerptLengthMobile;
  const excerptLengthDesktop = typeof config.excerptLength === "number"
    ? config.excerptLength
    : excerptLengthTablet;
  const readMoreTextMobile = normalizeText(config.mobileReadMoreText, normalizeText(config.readMoreText, "READ MORE"));
  const readMoreTextTablet = normalizeText(config.tabletReadMoreText, normalizeText(config.readMoreText, readMoreTextMobile));
  const readMoreTextDesktop = normalizeText(config.readMoreText, readMoreTextTablet);
  const readMoreTextColorMobile = normalizeColor(config.mobileReadMoreTextColor, normalizeColor(config.readMoreTextColor, "var(--load-more-text, var(--accent))"));
  const readMoreTextColorTablet = normalizeColor(config.tabletReadMoreTextColor, normalizeColor(config.readMoreTextColor, readMoreTextColorMobile));
  const readMoreTextColorDesktop = normalizeColor(config.readMoreTextColor, readMoreTextColorTablet);
  const readMoreHoverTextColorMobile = normalizeColor(config.mobileReadMoreHoverTextColor, normalizeColor(config.readMoreHoverTextColor, "var(--load-more-text-hover, #ffffff)"));
  const readMoreHoverTextColorTablet = normalizeColor(config.tabletReadMoreHoverTextColor, normalizeColor(config.readMoreHoverTextColor, readMoreHoverTextColorMobile));
  const readMoreHoverTextColorDesktop = normalizeColor(config.readMoreHoverTextColor, readMoreHoverTextColorTablet);
  const readMoreBgMobile = normalizeColor(config.mobileReadMoreBgColor, normalizeColor(config.readMoreBgColor, "var(--load-more-bg, var(--bg-elevated, #ffffff))"));
  const readMoreBgTablet = normalizeColor(config.tabletReadMoreBgColor, normalizeColor(config.readMoreBgColor, readMoreBgMobile));
  const readMoreBgDesktop = normalizeColor(config.readMoreBgColor, readMoreBgTablet);
  const readMoreHoverBgMobile = normalizeColor(config.mobileReadMoreHoverBgColor, normalizeColor(config.readMoreHoverBgColor, "var(--load-more-bg-hover, var(--accent))"));
  const readMoreHoverBgTablet = normalizeColor(config.tabletReadMoreHoverBgColor, normalizeColor(config.readMoreHoverBgColor, readMoreHoverBgMobile));
  const readMoreHoverBgDesktop = normalizeColor(config.readMoreHoverBgColor, readMoreHoverBgTablet);
  const readMoreBorderMobile = normalizeColor(config.mobileReadMoreBorderColor, normalizeColor(config.readMoreBorderColor, "var(--load-more-border, var(--border, #e5e7eb))"));
  const readMoreBorderTablet = normalizeColor(config.tabletReadMoreBorderColor, normalizeColor(config.readMoreBorderColor, readMoreBorderMobile));
  const readMoreBorderDesktop = normalizeColor(config.readMoreBorderColor, readMoreBorderTablet);
  const readMoreHoverBorderMobile = normalizeColor(config.mobileReadMoreHoverBorderColor, normalizeColor(config.readMoreHoverBorderColor, "var(--load-more-border-hover, var(--accent))"));
  const readMoreHoverBorderTablet = normalizeColor(config.tabletReadMoreHoverBorderColor, normalizeColor(config.readMoreHoverBorderColor, readMoreHoverBorderMobile));
  const readMoreHoverBorderDesktop = normalizeColor(config.readMoreHoverBorderColor, readMoreHoverBorderTablet);
  const readMoreRadiusMobile = formatSize(config.mobileReadMoreBorderRadius ?? config.readMoreBorderRadius, "2px");
  const readMoreRadiusTablet = formatSize(config.tabletReadMoreBorderRadius ?? config.readMoreBorderRadius, readMoreRadiusMobile);
  const readMoreRadiusDesktop = formatSize(config.readMoreBorderRadius, readMoreRadiusTablet);
  const readMoreFsMobile = formatSize(config.mobileReadMoreFontSize ?? config.readMoreFontSize, "13px");
  const readMoreFsTablet = formatSize(config.tabletReadMoreFontSize ?? config.readMoreFontSize, readMoreFsMobile);
  const readMoreFsDesktop = formatSize(config.readMoreFontSize, readMoreFsTablet);

  const imageUrl = post?.image || post?.featuredImage?.fileUrl;
  const isVideo = String((post as any)?.type || "").toUpperCase() === "VIDEO";
  const postLink = post?.category ? `/${post.category.slug}/${post.slug}` : `/post/${post?.slug || ""}`;
  const authorName = (() => {
    if (typeof post?.author === "string") return post.author;
    if (post?.author && typeof post.author === "object") {
      const a = post.author as { name?: string; fullName?: string };
      if (typeof a.name === "string" && a.name.trim() !== "") return a.name;
      if (typeof a.fullName === "string" && a.fullName.trim() !== "") return a.fullName;
    }
    if (typeof post?.authorName === "string" && post.authorName.trim() !== "") return post.authorName;
    return undefined;
  })();
  const authorAvatar = (() => {
    if (post?.author && typeof post.author === "object") {
      const a = post.author as { avatar?: string; avatarUrl?: string; image?: string; banner?: string };
      if (typeof a.avatar === "string" && a.avatar.trim() !== "") return normalizeAvatarUrl(a.avatar);
      if (typeof a.avatarUrl === "string" && a.avatarUrl.trim() !== "") return normalizeAvatarUrl(a.avatarUrl);
      if (typeof a.image === "string" && a.image.trim() !== "") return normalizeAvatarUrl(a.image);
      if (typeof a.banner === "string" && a.banner.trim() !== "") return normalizeAvatarUrl(a.banner);
    }
    if (typeof post?.authorAvatar === "string" && post.authorAvatar.trim() !== "") return normalizeAvatarUrl(post.authorAvatar);
    return "";
  })();
  const dateVal = post?.publishedAt || post?.createdAt;
  const publishedDate = dateVal ? new Date(dateVal) : null;
  const hasValidDate = !!publishedDate && !Number.isNaN(publishedDate.getTime());
  const formattedDate = hasValidDate && publishedDate
    ? formatLongDateId(publishedDate)
    : "";
  const [device, setDevice] = useState<ResponsiveDevice>(previewDevice || "desktop");

  useEffect(() => {
    if (previewDevice) {
      setDevice(previewDevice);
      return;
    }
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
  }, [previewDevice]);

  const excerptLength = device === "mobile"
    ? excerptLengthMobile
    : device === "tablet"
      ? excerptLengthTablet
      : excerptLengthDesktop;
  const readMoreText = device === "mobile"
    ? readMoreTextMobile
    : device === "tablet"
      ? readMoreTextTablet
      : readMoreTextDesktop;
  const excerptFromExcerpt = stripHtml(post?.excerpt || "");
  const excerptFromContent = stripHtml(post?.content || "");
  const excerptRaw = (() => {
    if (!excerptFromContent) return excerptFromExcerpt;
    if (!excerptFromExcerpt) return excerptFromContent;
    return excerptFromExcerpt.length >= excerptLength ? excerptFromExcerpt : excerptFromContent;
  })();

  return (
    <div id={`headline-big-${block.id}`} className={visibilityClass} style={{
      "--accent": effectiveAccent,
      "--widget-title-color-mobile": blockTitleColorMobile,
      "--widget-title-color-tablet": blockTitleColorTablet,
      "--widget-title-color-desktop": blockTitleColorDesktop,
      "--widget-title-size-mobile": blockTitleFsMobile,
      "--widget-title-size-tablet": blockTitleFsTablet,
      "--widget-title-size-desktop": blockTitleFsDesktop,
      "--widget-title-border-color-mobile": blockTitleBorderMobile,
      "--widget-title-border-color-tablet": blockTitleBorderTablet,
      "--widget-title-border-color-desktop": blockTitleBorderDesktop,
    } as React.CSSProperties}>
      <style dangerouslySetInnerHTML={{ __html: `
        #headline-big-${block.id} { margin-top: ${mTopMobile}; margin-right: ${mRightMobile}; margin-bottom: ${mBottomMobile}; margin-left: ${mLeftMobile}; padding-top: ${pTopMobile}; padding-right: ${pRightMobile}; padding-bottom: ${pBottomMobile}; padding-left: ${pLeftMobile}; background-color: ${useBoxMobile ? boxColorMobile : "transparent"}; border-radius: ${useBoxMobile ? effectiveRadius : "0"}; border: ${useBoxMobile ? "var(--box-border, 1px solid var(--border))" : "none"}; box-shadow: ${useBoxMobile ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none"}; }
        #headline-big-${block.id} .headline-big-thumb { position: relative; display: block; width: 100%; height: ${imageHeightMobile}; border-radius: ${imageRadius}; overflow: hidden; background: color-mix(in oklab, var(--bg-base) 92%, #000 8%); }
        #headline-big-${block.id} .headline-big-category { display: ${showCategoryMobile ? "inline-flex" : "none"}; color: ${categoryColorMobile}; background: ${categoryBgMobile}; border-radius: ${categoryRadiusMobile}; font-size: ${categoryFsMobile}; font-weight: 700; line-height: ${categoryLhMobile}; }
        #headline-big-${block.id} .headline-big-title { color: ${titleColorMobile}; font-size: ${titleFsMobile}; line-height: ${titleLhMobile}; font-weight: ${titleFwMobile}; margin-top: ${titleMtMobile}; margin-bottom: ${titleMbMobile}; }
        #headline-big-${block.id} .headline-big-title a { color: inherit !important; font-size: inherit !important; line-height: inherit !important; font-weight: inherit !important; font-family: inherit !important; }
        #headline-big-${block.id} .headline-big-title a:hover { color: ${titleHoverColorMobile} !important; }
        #headline-big-${block.id} .headline-big-meta { display: ${showMetaMobile ? "flex" : "none"}; align-items: center; gap: 12px; flex-wrap: wrap; font-size: ${metaFsMobile}; line-height: ${metaLhMobile}; color: ${metaColorMobile}; margin-bottom: ${metaMbMobile}; }
        #headline-big-${block.id} .headline-big-author { display: ${showAuthorMobile ? "inline-flex" : "none"}; align-items: center; gap: 6px; }
        #headline-big-${block.id} .headline-big-date { display: ${showDateMobile ? "inline-flex" : "none"}; align-items: center; gap: 6px; }
        #headline-big-${block.id} .headline-big-dot { display: ${showAuthorMobile && showDateMobile ? "inline-block" : "none"}; width: 4px; height: 4px; border-radius: 9999px; background-color: currentColor; opacity: .5; }
        #headline-big-${block.id} .headline-big-excerpt { display: ${showExcerptMobile ? "block" : "none"}; color: ${excerptColorMobile}; font-size: ${excerptFsMobile}; line-height: ${excerptLhMobile}; margin-bottom: ${excerptMbMobile}; }
        #headline-big-${block.id} .headline-big-readmore { display: ${showReadMoreMobile ? "inline-flex" : "none"}; align-items: center; justify-content: center; color: ${readMoreTextColorMobile}; background: ${readMoreBgMobile}; border: 1px solid ${readMoreBorderMobile}; border-radius: ${readMoreRadiusMobile}; padding: 8px 16px; font-size: ${readMoreFsMobile}; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; transition: background-color .2s ease, border-color .2s ease, color .2s ease; }
        #headline-big-${block.id} .headline-big-readmore:hover { background-color: ${readMoreHoverBgMobile}; border-color: ${readMoreHoverBorderMobile}; color: ${readMoreHoverTextColorMobile}; }
        @media (min-width: 768px) {
          #headline-big-${block.id} { margin-top: ${mTopTablet}; margin-right: ${mRightTablet}; margin-bottom: ${mBottomTablet}; margin-left: ${mLeftTablet}; padding-top: ${pTopTablet}; padding-right: ${pRightTablet}; padding-bottom: ${pBottomTablet}; padding-left: ${pLeftTablet}; background-color: ${useBoxTablet ? boxColorTablet : "transparent"}; border-radius: ${useBoxTablet ? effectiveRadius : "0"}; border: ${useBoxTablet ? "var(--box-border, 1px solid var(--border))" : "none"}; box-shadow: ${useBoxTablet ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none"}; }
          #headline-big-${block.id} .headline-big-thumb { height: ${imageHeightTablet}; }
          #headline-big-${block.id} .headline-big-category { display: ${showCategoryTablet ? "inline-flex" : "none"}; color: ${categoryColorTablet}; background: ${categoryBgTablet}; border-radius: ${categoryRadiusTablet}; font-size: ${categoryFsTablet}; line-height: ${categoryLhTablet}; }
          #headline-big-${block.id} .headline-big-title { color: ${titleColorTablet}; font-size: ${titleFsTablet}; line-height: ${titleLhTablet}; font-weight: ${titleFwTablet}; margin-top: ${titleMtTablet}; margin-bottom: ${titleMbTablet}; }
          #headline-big-${block.id} .headline-big-title a:hover { color: ${titleHoverColorTablet} !important; }
          #headline-big-${block.id} .headline-big-meta { display: ${showMetaTablet ? "flex" : "none"}; font-size: ${metaFsTablet}; line-height: ${metaLhTablet}; color: ${metaColorTablet}; margin-bottom: ${metaMbTablet}; }
          #headline-big-${block.id} .headline-big-author { display: ${showAuthorTablet ? "inline-flex" : "none"}; }
          #headline-big-${block.id} .headline-big-date { display: ${showDateTablet ? "inline-flex" : "none"}; }
          #headline-big-${block.id} .headline-big-dot { display: ${showAuthorTablet && showDateTablet ? "inline-block" : "none"}; }
          #headline-big-${block.id} .headline-big-excerpt { display: ${showExcerptTablet ? "block" : "none"}; color: ${excerptColorTablet}; font-size: ${excerptFsTablet}; line-height: ${excerptLhTablet}; margin-bottom: ${excerptMbTablet}; }
          #headline-big-${block.id} .headline-big-readmore { display: ${showReadMoreTablet ? "inline-flex" : "none"}; color: ${readMoreTextColorTablet}; background: ${readMoreBgTablet}; border-color: ${readMoreBorderTablet}; border-radius: ${readMoreRadiusTablet}; font-size: ${readMoreFsTablet}; }
          #headline-big-${block.id} .headline-big-readmore:hover { background-color: ${readMoreHoverBgTablet}; border-color: ${readMoreHoverBorderTablet}; color: ${readMoreHoverTextColorTablet}; }
        }
        @media (min-width: 1025px) {
          #headline-big-${block.id} { margin-top: ${mTopDesktop}; margin-right: ${mRightDesktop}; margin-bottom: ${mBottomDesktop}; margin-left: ${mLeftDesktop}; padding-top: ${pTopDesktop}; padding-right: ${pRightDesktop}; padding-bottom: ${pBottomDesktop}; padding-left: ${pLeftDesktop}; background-color: ${useBoxDesktop ? boxColorDesktop : "transparent"}; border-radius: ${useBoxDesktop ? effectiveRadius : "0"}; border: ${useBoxDesktop ? "var(--box-border, 1px solid var(--border))" : "none"}; box-shadow: ${useBoxDesktop ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none"}; }
          #headline-big-${block.id} .headline-big-thumb { height: ${imageHeightDesktop}; }
          #headline-big-${block.id} .headline-big-category { display: ${showCategoryDesktop ? "inline-flex" : "none"}; color: ${categoryColorDesktop}; background: ${categoryBgDesktop}; border-radius: ${categoryRadiusDesktop}; font-size: ${categoryFsDesktop}; line-height: ${categoryLhDesktop}; }
          #headline-big-${block.id} .headline-big-title { color: ${titleColorDesktop}; font-size: ${titleFsDesktop}; line-height: ${titleLhDesktop}; font-weight: ${titleFwDesktop}; margin-top: ${titleMtDesktop}; margin-bottom: ${titleMbDesktop}; }
          #headline-big-${block.id} .headline-big-title a:hover { color: ${titleHoverColorDesktop} !important; }
          #headline-big-${block.id} .headline-big-meta { display: ${showMetaDesktop ? "flex" : "none"}; font-size: ${metaFsDesktop}; line-height: ${metaLhDesktop}; color: ${metaColorDesktop}; margin-bottom: ${metaMbDesktop}; }
          #headline-big-${block.id} .headline-big-author { display: ${showAuthorDesktop ? "inline-flex" : "none"}; }
          #headline-big-${block.id} .headline-big-date { display: ${showDateDesktop ? "inline-flex" : "none"}; }
          #headline-big-${block.id} .headline-big-dot { display: ${showAuthorDesktop && showDateDesktop ? "inline-block" : "none"}; }
          #headline-big-${block.id} .headline-big-excerpt { display: ${showExcerptDesktop ? "block" : "none"}; color: ${excerptColorDesktop}; font-size: ${excerptFsDesktop}; line-height: ${excerptLhDesktop}; margin-bottom: ${excerptMbDesktop}; }
          #headline-big-${block.id} .headline-big-readmore { display: ${showReadMoreDesktop ? "inline-flex" : "none"}; color: ${readMoreTextColorDesktop}; background: ${readMoreBgDesktop}; border-color: ${readMoreBorderDesktop}; border-radius: ${readMoreRadiusDesktop}; font-size: ${readMoreFsDesktop}; }
          #headline-big-${block.id} .headline-big-readmore:hover { background-color: ${readMoreHoverBgDesktop}; border-color: ${readMoreHoverBorderDesktop}; color: ${readMoreHoverTextColorDesktop}; }
        }
      ` }} />

      {post ? (
        <article>
          <Link href={postLink} className="headline-big-thumb">
            {imageUrl ? (
              <Image src={imageUrl} alt={post.title} fill className="object-cover" sizes="100vw" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--fg-muted)] text-sm">No Image</div>
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
              <span className="headline-big-category absolute top-3 left-3 z-10 font-bold uppercase tracking-wide px-2 py-1">
                {post.category.name}
              </span>
            )}
          </Link>

          <h2 className="headline-big-title">
            <Link href={postLink} className="transition-colors">
              {post.title}
            </Link>
          </h2>

          <div className="headline-big-meta font-medium mt-2">
            {authorName && (
              <span className="headline-big-author">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] relative overflow-hidden" style={{ backgroundColor: "color-mix(in oklab, var(--fg-primary) 10%, transparent)" }}>
                  {authorAvatar ? (
                    <Image src={authorAvatar} alt={authorName} fill className="object-cover" sizes="16px" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 opacity-80">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
                <span>{authorName}</span>
              </span>
            )}
            {authorName && hasValidDate && <span className="headline-big-dot"></span>}
            {hasValidDate && publishedDate && (
              <span className="headline-big-date">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
                  <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                </svg>
                <time dateTime={publishedDate.toISOString()}>
                  {formattedDate}
                </time>
              </span>
            )}
          </div>

          <p className="headline-big-excerpt">{clampExcerpt(excerptRaw, excerptLength)}</p>

          <Link href={postLink} className="headline-big-readmore">
            {readMoreText}
          </Link>
        </article>
      ) : (
        <div className="text-sm text-[var(--fg-muted)]">Belum ada berita untuk ditampilkan.</div>
      )}
    </div>
  );
}
