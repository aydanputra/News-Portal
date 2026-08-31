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

const normalizeHexLike = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/\s+/g, "");
};

const isOneOf = (value: unknown, candidates: string[]) => {
  const normalized = normalizeHexLike(value);
  return normalized !== "" && candidates.includes(normalized);
};

export default function HeadlineBig({ block, posts, accentColor, borderRadius, previewDevice }: HeadlineBigProps) {
  const config = block.config || {};
  const configRecord = config as Record<string, unknown>;
  const post = posts && posts.length > 0 ? posts[0] : null;
  const effectiveAccent = accentColor || "var(--accent)";
  const effectiveRadius = "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))";
  const [isPublicDarkMode, setIsPublicDarkMode] = useState(false);

  let visibilityClass = "";
  if (config.hideOnDesktop) visibilityClass += " lg:hidden";
  if (config.hideOnTablet) visibilityClass += " md:max-lg:hidden";
  if (config.hideOnMobile) visibilityClass += " max-md:hidden";

  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const useBoxDesktop = useBoxValues.desktop;
  const useBoxTablet = useBoxValues.tablet;
  const useBoxMobile = useBoxValues.mobile;

  const boxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = normalizeColor(boxColorValues.desktop, "transparent");
  const boxColorTablet = normalizeColor(boxColorValues.tablet, boxColorDesktop);
  const boxColorMobile = normalizeColor(boxColorValues.mobile, boxColorDesktop);
  const boxBgImageDesktop = typeof (config as any).backgroundImage === "string" ? (config as any).backgroundImage : "";
  const boxBgImageTablet = typeof (config as any).tabletBackgroundImage === "string" && (config as any).tabletBackgroundImage.trim() !== "" ? (config as any).tabletBackgroundImage : boxBgImageDesktop;
  const boxBgImageMobile = typeof (config as any).mobileBackgroundImage === "string" && (config as any).mobileBackgroundImage.trim() !== "" ? (config as any).mobileBackgroundImage : boxBgImageDesktop;
  const boxBgSizeDesktop = typeof (config as any).backgroundSize === "string" && (config as any).backgroundSize.trim() !== "" ? (config as any).backgroundSize : "cover";
  const boxBgSizeTablet = typeof (config as any).tabletBackgroundSize === "string" && (config as any).tabletBackgroundSize.trim() !== "" ? (config as any).tabletBackgroundSize : boxBgSizeDesktop;
  const boxBgSizeMobile = typeof (config as any).mobileBackgroundSize === "string" && (config as any).mobileBackgroundSize.trim() !== "" ? (config as any).mobileBackgroundSize : boxBgSizeDesktop;
  const boxBgPositionDesktop = typeof (config as any).backgroundPosition === "string" && (config as any).backgroundPosition.trim() !== "" ? (config as any).backgroundPosition : "center";
  const boxBgPositionTablet = typeof (config as any).tabletBackgroundPosition === "string" && (config as any).tabletBackgroundPosition.trim() !== "" ? (config as any).tabletBackgroundPosition : boxBgPositionDesktop;
  const boxBgPositionMobile = typeof (config as any).mobileBackgroundPosition === "string" && (config as any).mobileBackgroundPosition.trim() !== "" ? (config as any).mobileBackgroundPosition : boxBgPositionDesktop;
  const boxBgRepeatDesktop = typeof (config as any).backgroundRepeat === "string" && (config as any).backgroundRepeat.trim() !== "" ? (config as any).backgroundRepeat : "no-repeat";
  const boxBgRepeatTablet = typeof (config as any).tabletBackgroundRepeat === "string" && (config as any).tabletBackgroundRepeat.trim() !== "" ? (config as any).tabletBackgroundRepeat : boxBgRepeatDesktop;
  const boxBgRepeatMobile = typeof (config as any).mobileBackgroundRepeat === "string" && (config as any).mobileBackgroundRepeat.trim() !== "" ? (config as any).mobileBackgroundRepeat : boxBgRepeatDesktop;
  const boxBgAttachmentDesktop = typeof (config as any).backgroundAttachment === "string" && (config as any).backgroundAttachment.trim() !== "" ? (config as any).backgroundAttachment : "scroll";
  const boxBgAttachmentTablet = typeof (config as any).tabletBackgroundAttachment === "string" && (config as any).tabletBackgroundAttachment.trim() !== "" ? (config as any).tabletBackgroundAttachment : boxBgAttachmentDesktop;
  const boxBgAttachmentMobile = typeof (config as any).mobileBackgroundAttachment === "string" && (config as any).mobileBackgroundAttachment.trim() !== "" ? (config as any).mobileBackgroundAttachment : boxBgAttachmentDesktop;
  const boxOverlayColorDesktop = typeof (config as any).backgroundOverlayColor === "string" ? (config as any).backgroundOverlayColor : "transparent";
  const boxOverlayColorTablet = typeof (config as any).tabletBackgroundOverlayColor === "string" && (config as any).tabletBackgroundOverlayColor.trim() !== "" ? (config as any).tabletBackgroundOverlayColor : boxOverlayColorDesktop;
  const boxOverlayColorMobile = typeof (config as any).mobileBackgroundOverlayColor === "string" && (config as any).mobileBackgroundOverlayColor.trim() !== "" ? (config as any).mobileBackgroundOverlayColor : boxOverlayColorDesktop;
  const boxOverlayOpacityDesktop = Math.min(100, Math.max(0, Number((config as any).backgroundOverlayOpacity ?? 45) || 0));
  const boxOverlayOpacityTablet = Math.min(100, Math.max(0, Number((config as any).tabletBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const boxOverlayOpacityMobile = Math.min(100, Math.max(0, Number((config as any).mobileBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));

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
  const boxRadiusDesktop = resolveRadiusValue(config.boxBorderRadius, effectiveRadius);
  const boxRadiusTablet = resolveRadiusValue(config.tabletBoxBorderRadius ?? config.boxBorderRadius, boxRadiusDesktop);
  const boxRadiusMobile = resolveRadiusValue(config.mobileBoxBorderRadius ?? config.boxBorderRadius, boxRadiusDesktop);
  const boxPtBase = config.boxPaddingTop !== undefined ? `${config.boxPaddingTop}px` : "0px";
  const boxPrBase = config.boxPaddingRight !== undefined ? `${config.boxPaddingRight}px` : "0px";
  const boxPbBase = config.boxPaddingBottom !== undefined ? `${config.boxPaddingBottom}px` : "0px";
  const boxPlBase = config.boxPaddingLeft !== undefined ? `${config.boxPaddingLeft}px` : "0px";
  const boxPtMobile = config.mobileBoxPaddingTop !== undefined ? `${config.mobileBoxPaddingTop}px` : boxPtBase;
  const boxPrMobile = config.mobileBoxPaddingRight !== undefined ? `${config.mobileBoxPaddingRight}px` : boxPrBase;
  const boxPbMobile = config.mobileBoxPaddingBottom !== undefined ? `${config.mobileBoxPaddingBottom}px` : boxPbBase;
  const boxPlMobile = config.mobileBoxPaddingLeft !== undefined ? `${config.mobileBoxPaddingLeft}px` : boxPlBase;
  const boxPtTablet = config.tabletBoxPaddingTop !== undefined ? `${config.tabletBoxPaddingTop}px` : boxPtBase;
  const boxPrTablet = config.tabletBoxPaddingRight !== undefined ? `${config.tabletBoxPaddingRight}px` : boxPrBase;
  const boxPbTablet = config.tabletBoxPaddingBottom !== undefined ? `${config.tabletBoxPaddingBottom}px` : boxPbBase;
  const boxPlTablet = config.tabletBoxPaddingLeft !== undefined ? `${config.tabletBoxPaddingLeft}px` : boxPlBase;
  const boxPtDesktop = boxPtBase;
  const boxPrDesktop = boxPrBase;
  const boxPbDesktop = boxPbBase;
  const boxPlDesktop = boxPlBase;

  const titleFsMobile = formatSize(config.mobileTitleFontSize ?? config.titleFontSize, "var(--home-news-title-size, 18px)");
  const titleFsTablet = formatSize(config.tabletTitleFontSize ?? config.titleFontSize, titleFsMobile);
  const titleFsDesktop = formatSize(config.titleFontSize, titleFsTablet);
  const titleLhMobile = config.mobileTitleLineHeight !== undefined ? String(config.mobileTitleLineHeight) : (config.titleLineHeight !== undefined ? String(config.titleLineHeight) : "1.15");
  const titleLhTablet = config.tabletTitleLineHeight !== undefined ? String(config.tabletTitleLineHeight) : titleLhMobile;
  const titleLhDesktop = config.titleLineHeight !== undefined ? String(config.titleLineHeight) : titleLhTablet;
  const titleFwMobile = normalizeFontWeight(config.mobileTitleFontWeight, normalizeFontWeight(config.titleFontWeight, "var(--home-news-title-weight, 600)"));
  const titleFwTablet = normalizeFontWeight(config.tabletTitleFontWeight, titleFwMobile);
  const titleFwDesktop = normalizeFontWeight(config.titleFontWeight, titleFwTablet);
  const titleColorMobile = normalizeColor(config.mobileTitleColor, normalizeColor(config.titleColor, "var(--home-news-title-color, var(--fg-primary, #f8fafc))"));
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

  const metaFsMobile = formatSize(config.mobileMetaFontSize ?? config.metaFontSize, "var(--home-meta-size, 12px)");
  const metaFsTablet = formatSize(config.tabletMetaFontSize ?? config.metaFontSize, metaFsMobile);
  const metaFsDesktop = formatSize(config.metaFontSize, metaFsTablet);
  const metaLhMobile = config.mobileMetaLineHeight !== undefined ? String(config.mobileMetaLineHeight) : (config.metaLineHeight !== undefined ? String(config.metaLineHeight) : "1.3");
  const metaLhTablet = config.tabletMetaLineHeight !== undefined ? String(config.tabletMetaLineHeight) : metaLhMobile;
  const metaLhDesktop = config.metaLineHeight !== undefined ? String(config.metaLineHeight) : metaLhTablet;
  const metaFwMobile = normalizeFontWeight(config.mobileMetaFontWeight, normalizeFontWeight(config.metaFontWeight, "500"));
  const metaFwTablet = normalizeFontWeight(config.tabletMetaFontWeight, metaFwMobile);
  const metaFwDesktop = normalizeFontWeight(config.metaFontWeight, metaFwTablet);
  const metaColorMobile = normalizeColor(config.mobileMetaColor, normalizeColor(config.metaColor, "var(--home-meta-color, var(--fg-secondary, #94a3b8))"));
  const metaColorTablet = normalizeColor(config.tabletMetaColor, metaColorMobile);
  const metaColorDesktop = normalizeColor(config.metaColor, metaColorTablet);
  const metaMbMobile = config.mobileMetaMarginBottom !== undefined ? `${config.mobileMetaMarginBottom}px` : (config.metaMarginBottom !== undefined ? `${config.metaMarginBottom}px` : "12px");
  const metaMbTablet = config.tabletMetaMarginBottom !== undefined ? `${config.tabletMetaMarginBottom}px` : (config.metaMarginBottom !== undefined ? `${config.metaMarginBottom}px` : "14px");
  const metaMbDesktop = config.metaMarginBottom !== undefined ? `${config.metaMarginBottom}px` : "16px";

  const excerptFsMobile = formatSize(config.mobileExcerptFontSize ?? config.excerptFontSize, "var(--home-excerpt-size, 1.125rem)");
  const excerptFsTablet = formatSize(config.tabletExcerptFontSize ?? config.excerptFontSize, excerptFsMobile);
  const excerptFsDesktop = formatSize(config.excerptFontSize, excerptFsTablet);
  const excerptLhMobile = config.mobileExcerptLineHeight !== undefined ? String(config.mobileExcerptLineHeight) : (config.excerptLineHeight !== undefined ? String(config.excerptLineHeight) : "1.6");
  const excerptLhTablet = config.tabletExcerptLineHeight !== undefined ? String(config.tabletExcerptLineHeight) : excerptLhMobile;
  const excerptLhDesktop = config.excerptLineHeight !== undefined ? String(config.excerptLineHeight) : excerptLhTablet;
  const excerptFwMobile = normalizeFontWeight(config.mobileExcerptFontWeight, normalizeFontWeight(config.excerptFontWeight, "400"));
  const excerptFwTablet = normalizeFontWeight(config.tabletExcerptFontWeight, excerptFwMobile);
  const excerptFwDesktop = normalizeFontWeight(config.excerptFontWeight, excerptFwTablet);
  const excerptColorMobile = normalizeColor(config.mobileExcerptColor, normalizeColor(config.excerptColor, "var(--home-excerpt-color, var(--fg-secondary, #cbd5e1))"));
  const excerptColorTablet = normalizeColor(config.tabletExcerptColor, excerptColorMobile);
  const excerptColorDesktop = normalizeColor(config.excerptColor, excerptColorTablet);
  const excerptMbMobile = config.mobileExcerptMarginBottom !== undefined ? `${config.mobileExcerptMarginBottom}px` : (config.excerptMarginBottom !== undefined ? `${config.excerptMarginBottom}px` : "16px");
  const excerptMbTablet = config.tabletExcerptMarginBottom !== undefined ? `${config.tabletExcerptMarginBottom}px` : (config.excerptMarginBottom !== undefined ? `${config.excerptMarginBottom}px` : "18px");
  const excerptMbDesktop = config.excerptMarginBottom !== undefined ? `${config.excerptMarginBottom}px` : "20px";

  const categoryColorMobile = normalizeColor(
    (config as any).mobileCategoryLabelTextColor,
    normalizeColor(config.mobileCategoryTextColor, normalizeColor(config.mobileCategoryLabelColor, normalizeColor((config as any).categoryLabelTextColor, normalizeColor(config.categoryTextColor, normalizeColor(config.categoryLabelColor, "#ffffff")))))
  );
  const categoryColorTablet = normalizeColor((config as any).tabletCategoryLabelTextColor, normalizeColor(config.tabletCategoryTextColor, normalizeColor(config.tabletCategoryLabelColor, categoryColorMobile)));
  const categoryColorDesktop = normalizeColor((config as any).categoryLabelTextColor, normalizeColor(config.categoryTextColor, normalizeColor(config.categoryLabelColor, categoryColorTablet)));
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
  const categoryPxMobile = formatSize(config.mobileCategoryLabelPaddingX ?? config.mobileCategoryPaddingX ?? config.categoryLabelPaddingX ?? config.categoryPaddingX, "8px");
  const categoryPxTablet = formatSize(config.tabletCategoryLabelPaddingX ?? config.tabletCategoryPaddingX ?? config.categoryLabelPaddingX ?? config.categoryPaddingX, categoryPxMobile);
  const categoryPxDesktop = formatSize(config.categoryLabelPaddingX ?? config.categoryPaddingX, categoryPxTablet);
  const categoryPyMobile = formatSize(config.mobileCategoryLabelPaddingY ?? config.mobileCategoryPaddingY ?? config.categoryLabelPaddingY ?? config.categoryPaddingY, "4px");
  const categoryPyTablet = formatSize(config.tabletCategoryLabelPaddingY ?? config.tabletCategoryPaddingY ?? config.categoryLabelPaddingY ?? config.categoryPaddingY, categoryPyMobile);
  const categoryPyDesktop = formatSize(config.categoryLabelPaddingY ?? config.categoryPaddingY, categoryPyTablet);
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
  const blockTitleFsMobile = formatSize(config.mobileBlockTitleFontSize ?? config.blockTitleFontSize, "var(--home-widget-title-size, 20px)");
  const blockTitleFsTablet = formatSize(config.tabletBlockTitleFontSize ?? config.blockTitleFontSize, "22px");
  const blockTitleFsDesktop = formatSize(config.blockTitleFontSize, "var(--home-widget-title-size, 24px)");
  const blockTitleLhMobile = config.mobileBlockTitleLineHeight !== undefined ? String(config.mobileBlockTitleLineHeight) : (config.blockTitleLineHeight !== undefined ? String(config.blockTitleLineHeight) : "1.3");
  const blockTitleLhTablet = config.tabletBlockTitleLineHeight !== undefined ? String(config.tabletBlockTitleLineHeight) : blockTitleLhMobile;
  const blockTitleLhDesktop = config.blockTitleLineHeight !== undefined ? String(config.blockTitleLineHeight) : blockTitleLhTablet;
  const blockTitleBorderMobile = normalizeColor(config.mobileBlockTitleBorderColor, normalizeColor(config.blockTitleBorderColor, "var(--accent)"));
  const blockTitleBorderTablet = normalizeColor(config.tabletBlockTitleBorderColor, blockTitleBorderMobile);
  const blockTitleBorderDesktop = normalizeColor(config.blockTitleBorderColor, blockTitleBorderTablet);
  const blockTitleMbMobile = config.mobileBlockTitleMarginBottom !== undefined ? `${config.mobileBlockTitleMarginBottom}px` : (config.blockTitleMarginBottom !== undefined ? `${config.blockTitleMarginBottom}px` : "12px");
  const blockTitleMbTablet = config.tabletBlockTitleMarginBottom !== undefined ? `${config.tabletBlockTitleMarginBottom}px` : (config.blockTitleMarginBottom !== undefined ? `${config.blockTitleMarginBottom}px` : "12px");
  const blockTitleMbDesktop = config.blockTitleMarginBottom !== undefined ? `${config.blockTitleMarginBottom}px` : "12px";
  const blockTitlePbMobile = config.mobileBlockTitlePaddingBottom !== undefined ? `${config.mobileBlockTitlePaddingBottom}px` : (config.blockTitlePaddingBottom !== undefined ? `${config.blockTitlePaddingBottom}px` : "12px");
  const blockTitlePbTablet = config.tabletBlockTitlePaddingBottom !== undefined ? `${config.tabletBlockTitlePaddingBottom}px` : (config.blockTitlePaddingBottom !== undefined ? `${config.blockTitlePaddingBottom}px` : "12px");
  const blockTitlePbDesktop = config.blockTitlePaddingBottom !== undefined ? `${config.blockTitlePaddingBottom}px` : "12px";

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
    : (typeof config.excerptLength === "number" ? config.excerptLength : 120);
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
  const readMorePxMobile = formatSize(config.mobileReadMorePaddingX ?? config.readMorePaddingX, "16px");
  const readMorePxTablet = formatSize(config.tabletReadMorePaddingX ?? config.readMorePaddingX, readMorePxMobile);
  const readMorePxDesktop = formatSize(config.readMorePaddingX, readMorePxTablet);
  const readMorePyMobile = formatSize(config.mobileReadMorePaddingY ?? config.readMorePaddingY, "8px");
  const readMorePyTablet = formatSize(config.tabletReadMorePaddingY ?? config.readMorePaddingY, readMorePyMobile);
  const readMorePyDesktop = formatSize(config.readMorePaddingY, readMorePyTablet);

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
  const customTitle = typeof block?.title === "string" && block.title.trim() !== "" ? block.title.trim() : "";
  const widgetTitle = customTitle || (typeof config.title === "string" && config.title.trim() !== "" ? config.title.trim() : "Headline Big");

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

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const applyMode = () => setIsPublicDarkMode(root.classList.contains("public-dark"));
    applyMode();

    const observer = new MutationObserver(applyMode);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const excerptLength = device === "mobile"
    ? excerptLengthMobile
    : device === "tablet"
      ? excerptLengthTablet
      : excerptLengthDesktop;
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
  const currentImageHeight = device === "mobile" ? imageHeightMobile : device === "tablet" ? imageHeightTablet : imageHeightDesktop;
  const currentShowCategory = device === "mobile" ? showCategoryMobile : device === "tablet" ? showCategoryTablet : showCategoryDesktop;
  const currentShowMeta = device === "mobile" ? showMetaMobile : device === "tablet" ? showMetaTablet : showMetaDesktop;
  const currentShowAuthor = device === "mobile" ? showAuthorMobile : device === "tablet" ? showAuthorTablet : showAuthorDesktop;
  const currentShowDate = device === "mobile" ? showDateMobile : device === "tablet" ? showDateTablet : showDateDesktop;
  const currentShowExcerpt = device === "mobile" ? showExcerptMobile : device === "tablet" ? showExcerptTablet : showExcerptDesktop;
  const currentShowReadMore = device === "mobile" ? showReadMoreMobile : device === "tablet" ? showReadMoreTablet : showReadMoreDesktop;
  const currentTitleColor = device === "mobile" ? titleColorMobile : device === "tablet" ? titleColorTablet : titleColorDesktop;
  const currentTitleHoverColor = device === "mobile" ? titleHoverColorMobile : device === "tablet" ? titleHoverColorTablet : titleHoverColorDesktop;
  const legacyDarkUnsafeTitleColors = ["#111827", "#1f2937", "#0f172a", "#000000", "#000"];
  const effectiveTitleColor = isPublicDarkMode && isOneOf(currentTitleColor, legacyDarkUnsafeTitleColors)
    ? "var(--fg-primary)"
    : currentTitleColor;
  const currentTitleFs = device === "mobile" ? titleFsMobile : device === "tablet" ? titleFsTablet : titleFsDesktop;
  const currentTitleLh = device === "mobile" ? titleLhMobile : device === "tablet" ? titleLhTablet : titleLhDesktop;
  const currentTitleFw = device === "mobile" ? titleFwMobile : device === "tablet" ? titleFwTablet : titleFwDesktop;
  const currentTitleMt = device === "mobile" ? titleMtMobile : device === "tablet" ? titleMtTablet : titleMtDesktop;
  const currentTitleMb = device === "mobile" ? titleMbMobile : device === "tablet" ? titleMbTablet : titleMbDesktop;
  const currentMetaFs = device === "mobile" ? metaFsMobile : device === "tablet" ? metaFsTablet : metaFsDesktop;
  const currentMetaLh = device === "mobile" ? metaLhMobile : device === "tablet" ? metaLhTablet : metaLhDesktop;
  const currentMetaFw = device === "mobile" ? metaFwMobile : device === "tablet" ? metaFwTablet : metaFwDesktop;
  const currentMetaColor = device === "mobile" ? metaColorMobile : device === "tablet" ? metaColorTablet : metaColorDesktop;
  const currentMetaMb = device === "mobile" ? metaMbMobile : device === "tablet" ? metaMbTablet : metaMbDesktop;
  const currentExcerptColor = device === "mobile" ? excerptColorMobile : device === "tablet" ? excerptColorTablet : excerptColorDesktop;
  const currentExcerptFs = device === "mobile" ? excerptFsMobile : device === "tablet" ? excerptFsTablet : excerptFsDesktop;
  const currentExcerptLh = device === "mobile" ? excerptLhMobile : device === "tablet" ? excerptLhTablet : excerptLhDesktop;
  const currentExcerptFw = device === "mobile" ? excerptFwMobile : device === "tablet" ? excerptFwTablet : excerptFwDesktop;
  const currentExcerptMb = device === "mobile" ? excerptMbMobile : device === "tablet" ? excerptMbTablet : excerptMbDesktop;
  const currentCategoryColor = device === "mobile" ? categoryColorMobile : device === "tablet" ? categoryColorTablet : categoryColorDesktop;
  const currentCategoryBg = device === "mobile" ? categoryBgMobile : device === "tablet" ? categoryBgTablet : categoryBgDesktop;
  const currentCategoryFs = device === "mobile" ? categoryFsMobile : device === "tablet" ? categoryFsTablet : categoryFsDesktop;
  const currentCategoryLh = device === "mobile" ? categoryLhMobile : device === "tablet" ? categoryLhTablet : categoryLhDesktop;
  const currentCategoryPx = device === "mobile" ? categoryPxMobile : device === "tablet" ? categoryPxTablet : categoryPxDesktop;
  const currentCategoryPy = device === "mobile" ? categoryPyMobile : device === "tablet" ? categoryPyTablet : categoryPyDesktop;
  const currentCategoryRadius = device === "mobile" ? categoryRadiusMobile : device === "tablet" ? categoryRadiusTablet : categoryRadiusDesktop;
  const currentReadMoreTextColor = device === "mobile" ? readMoreTextColorMobile : device === "tablet" ? readMoreTextColorTablet : readMoreTextColorDesktop;
  const currentReadMoreHoverTextColor = device === "mobile" ? readMoreHoverTextColorMobile : device === "tablet" ? readMoreHoverTextColorTablet : readMoreHoverTextColorDesktop;
  const currentReadMoreBg = device === "mobile" ? readMoreBgMobile : device === "tablet" ? readMoreBgTablet : readMoreBgDesktop;
  const currentReadMoreHoverBg = device === "mobile" ? readMoreHoverBgMobile : device === "tablet" ? readMoreHoverBgTablet : readMoreHoverBgDesktop;
  const currentReadMoreBorder = device === "mobile" ? readMoreBorderMobile : device === "tablet" ? readMoreBorderTablet : readMoreBorderDesktop;
  const currentReadMoreHoverBorder = device === "mobile" ? readMoreHoverBorderMobile : device === "tablet" ? readMoreHoverBorderTablet : readMoreHoverBorderDesktop;
  const currentReadMoreRadius = device === "mobile" ? readMoreRadiusMobile : device === "tablet" ? readMoreRadiusTablet : readMoreRadiusDesktop;
  const currentReadMoreFs = device === "mobile" ? readMoreFsMobile : device === "tablet" ? readMoreFsTablet : readMoreFsDesktop;
  const currentReadMorePx = device === "mobile" ? readMorePxMobile : device === "tablet" ? readMorePxTablet : readMorePxDesktop;
  const currentReadMorePy = device === "mobile" ? readMorePyMobile : device === "tablet" ? readMorePyTablet : readMorePyDesktop;
  const currentBlockTitleLh = device === "mobile" ? blockTitleLhMobile : device === "tablet" ? blockTitleLhTablet : blockTitleLhDesktop;
  const currentBlockTitleMb = device === "mobile" ? blockTitleMbMobile : device === "tablet" ? blockTitleMbTablet : blockTitleMbDesktop;
  const currentBlockTitlePb = device === "mobile" ? blockTitlePbMobile : device === "tablet" ? blockTitlePbTablet : blockTitlePbDesktop;
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
  const currentExcerpt = clampExcerpt(excerptRaw, excerptLength);
  const shouldShowMetaRow = currentShowMeta && ((currentShowAuthor && !!authorName) || (currentShowDate && hasValidDate));

  return (
    <div
      id={`headline-big-${block.id}`}
      className={`responsive-block-frame ${visibilityClass}`.trim()}
      style={{
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
        "--home-news-title-color": effectiveTitleColor,
        "--home-news-title-size": currentTitleFs,
        "--home-news-title-weight": currentTitleFw,
        "--home-meta-color": currentMetaColor,
        "--home-meta-size": currentMetaFs,
        "--home-meta-weight": currentMetaFw,
        "--home-excerpt-color": currentExcerptColor,
        "--home-excerpt-size": currentExcerptFs,
        "--home-excerpt-weight": currentExcerptFw,
        "--home-hover-color": currentTitleHoverColor,
        "--headline-big-title-hover": currentTitleHoverColor,
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
        "--headline-big-readmore-hover-bg": currentReadMoreHoverBg,
        "--headline-big-readmore-hover-text": currentReadMoreHoverTextColor,
        "--headline-big-readmore-hover-border": currentReadMoreHoverBorder,
      } as React.CSSProperties}
    >
      <div
        style={{
          backgroundColor: currentUseBox ? currentBoxColor : "transparent",
          borderRadius: currentUseBox ? currentBoxRadius : "0",
          border: currentUseBox ? "var(--box-border, 1px solid var(--border))" : "none",
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
      {(config.showTitle !== false) && (
        <h3
          className="font-bold border-b border-[color:var(--border,#e5e7eb)] flex items-center theme-widget-title"
          style={{ lineHeight: currentBlockTitleLh, marginBottom: currentBlockTitleMb, paddingBottom: currentBlockTitlePb }}
        >
          <div className="widget-title-bar" style={{ borderRadius: "var(--home-main-box-radius, 0.25rem)" }}></div>
          <span>{widgetTitle}</span>
        </h3>
      )}
      {post ? (
        <article>
          <Link
            href={postLink}
            className="headline-big-thumb relative block w-full overflow-hidden"
            style={{
              height: currentImageHeight,
              borderRadius: imageRadius,
              background: "color-mix(in oklab, var(--bg-base) 92%, #000 8%)",
            }}
          >
            {imageUrl ? (
              <Image src={imageUrl} alt={post.title} fill className="object-cover" sizes="100vw" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center [color:var(--muted-text,var(--home-meta-color,#9ca3af))] text-sm">No Image</div>
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
            {post.category && currentShowCategory && (
              <span
                className="headline-big-category absolute top-3 left-3 z-10 inline-flex font-bold uppercase tracking-wide px-2 py-1"
                style={{
                  color: currentCategoryColor,
                  background: currentCategoryBg,
                  borderRadius: currentCategoryRadius,
                  fontSize: currentCategoryFs,
                  lineHeight: currentCategoryLh,
                padding: `${currentCategoryPy} ${currentCategoryPx}`,
                }}
              >
                {post.category.name}
              </span>
            )}
          </Link>

          <h2
            className=""
            style={{
              color: effectiveTitleColor,
              fontSize: currentTitleFs,
              lineHeight: currentTitleLh,
              fontWeight: currentTitleFw,
              marginTop: currentTitleMt,
              marginBottom: currentTitleMb,
            }}
          >
            <Link
              href={postLink}
              className="transition-colors hover:!text-[var(--headline-big-title-hover)]"
              style={{ color: "inherit", fontSize: "inherit", lineHeight: "inherit", fontWeight: "inherit", fontFamily: "inherit" }}
            >
              {post.title}
            </Link>
          </h2>

          {shouldShowMetaRow && (
            <div
              className="mt-2 flex items-center gap-3 flex-wrap"
              style={{
                fontSize: currentMetaFs,
                lineHeight: currentMetaLh,
                fontWeight: currentMetaFw,
                color: currentMetaColor,
                marginBottom: currentMetaMb,
              }}
            >
              {authorName && currentShowAuthor && (
                <span className="headline-big-author inline-flex items-center gap-1.5">
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
                <span>{authorName}</span>
              </span>
              )}
              {authorName && currentShowAuthor && hasValidDate && currentShowDate && (
                <span className="headline-big-dot inline-block rounded-full opacity-50 shrink-0" style={{ width: "0.42em", height: "0.42em", backgroundColor: "currentColor" }}></span>
              )}
              {hasValidDate && publishedDate && currentShowDate && (
                <span className="headline-big-date inline-flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 shrink-0" style={{ width: "1.22em", height: "1.22em" }}>
                  <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                </svg>
                <time dateTime={publishedDate.toISOString()}>
                  {formattedDate}
                </time>
              </span>
              )}
            </div>
          )}

          {currentShowExcerpt && currentExcerpt && (
            <p
              className=""
              style={{
                color: currentExcerptColor,
                fontSize: currentExcerptFs,
                lineHeight: currentExcerptLh,
                fontWeight: currentExcerptFw,
                marginBottom: currentExcerptMb,
              }}
            >
              {currentExcerpt}
            </p>
          )}

          {currentShowReadMore && (
            <Link
              href={postLink}
              className="headline-big-readmore inline-flex items-center justify-center border font-bold uppercase tracking-[0.08em] transition-colors hover:!bg-[var(--headline-big-readmore-hover-bg)] hover:!text-[var(--headline-big-readmore-hover-text)] hover:!border-[var(--headline-big-readmore-hover-border)]"
              style={{
                color: currentReadMoreTextColor,
                background: currentReadMoreBg,
                borderColor: currentReadMoreBorder,
                borderRadius: currentReadMoreRadius,
                padding: `${currentReadMorePy} ${currentReadMorePx}`,
                fontSize: currentReadMoreFs,
              }}
            >
              {readMoreText}
            </Link>
          )}
        </article>
      ) : (
        <div className="text-sm [color:var(--muted-text,var(--home-meta-color,#9ca3af))]">Belum ada berita untuk ditampilkan.</div>
      )}
      </div>
    </div>
  );
}
