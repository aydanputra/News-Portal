"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBool, getResponsiveBoolValues, getResponsiveValues } from "./responsive";

interface HeroProps {
  block: any;
  posts: any[];
  accentColor?: string;
  borderRadius?: string;
  customTitle?: string;
}

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

export default function Hero({ block, posts, accentColor, borderRadius, customTitle }: HeroProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  // Ambil post pertama sebagai hero
  const heroPost = posts && posts.length > 0 ? posts[0] : null;
  const effectiveAccent = accentColor || 'var(--accent)';
  const effectiveRadius = 'var(--global-image-radius, var(--home-main-box-radius, 0.75rem))';
  const config = block.config || {};
  const configRecord = config as Record<string, unknown>;

  // --- CONFIG VALUES ---
  const showCategoryValues = getResponsiveBoolValues(configRecord, "showCategory", true);
  const showCategoryDesktop = showCategoryValues.desktop;
  const showCategoryTablet = showCategoryValues.tablet;
  const showCategoryMobile = showCategoryValues.mobile;
  const showMetaInfoDesktop = getResponsiveBool(configRecord, "showMetaInfo", "desktop", getResponsiveBool(configRecord, "showMeta", "desktop", true));
  const showMetaInfoTablet = getResponsiveBool(configRecord, "showMetaInfo", "tablet", getResponsiveBool(configRecord, "showMeta", "tablet", true));
  const showMetaInfoMobile = getResponsiveBool(configRecord, "showMetaInfo", "mobile", getResponsiveBool(configRecord, "showMeta", "mobile", true));
  const showMetaInfoAny = showMetaInfoDesktop || showMetaInfoTablet || showMetaInfoMobile;
  const showAuthorValues = getResponsiveBoolValues(configRecord, "showAuthor", true);
  const showAuthorDesktop = showAuthorValues.desktop;
  const showAuthorTablet = showAuthorValues.tablet;
  const showAuthorMobile = showAuthorValues.mobile;
  const showDateValues = getResponsiveBoolValues(configRecord, "showDate", true);
  const showDateDesktop = showDateValues.desktop;
  const showDateTablet = showDateValues.tablet;
  const showDateMobile = showDateValues.mobile;
  const showExcerptValues = getResponsiveBoolValues(configRecord, "showExcerpt", true);
  const showExcerptDesktop = showExcerptValues.desktop;
  const showExcerptTablet = showExcerptValues.tablet;
  const showExcerptMobile = showExcerptValues.mobile;
  const showExcerptAny = showExcerptDesktop || showExcerptTablet || showExcerptMobile;

  // Box / Frame Logic
  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const useBoxDesktop = useBoxValues.desktop;
  const useBoxTablet = useBoxValues.tablet;
  const useBoxMobile = useBoxValues.mobile;
  const boxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = boxColorValues.desktop || 'transparent';
  const boxColorTablet = boxColorValues.tablet || boxColorDesktop;
  const boxColorMobile = boxColorValues.mobile || boxColorDesktop;
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
  const boxRadiusDesktop = resolveRadiusValue(config.boxBorderRadius, effectiveRadius);
  const boxRadiusTablet = resolveRadiusValue(config.tabletBoxBorderRadius ?? config.boxBorderRadius, boxRadiusDesktop);
  const boxRadiusMobile = resolveRadiusValue(config.mobileBoxBorderRadius ?? config.boxBorderRadius, boxRadiusDesktop);
  const boxPtBase = config.boxPaddingTop !== undefined ? `${config.boxPaddingTop}px` : '0px';
  const boxPrBase = config.boxPaddingRight !== undefined ? `${config.boxPaddingRight}px` : '0px';
  const boxPbBase = config.boxPaddingBottom !== undefined ? `${config.boxPaddingBottom}px` : '0px';
  const boxPlBase = config.boxPaddingLeft !== undefined ? `${config.boxPaddingLeft}px` : '0px';
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

  // Colors
  const titleColorDesktop = config.newsTitleColor || 'var(--home-news-title-color, #111827)';
  const titleColorTablet = config.tabletNewsTitleColor || titleColorDesktop;
  const titleColorMobile = config.mobileNewsTitleColor || titleColorDesktop;
  const hoverColorDesktop = config.newsTitleHoverColor || 'var(--home-hover-color, var(--accent))';
  const hoverColorTablet = config.tabletNewsTitleHoverColor || hoverColorDesktop;
  const hoverColorMobile = config.mobileNewsTitleHoverColor || hoverColorDesktop;
  const blockTitleColorDesktop = config.blockTitleColor || 'var(--home-widget-title-color, var(--heading-color, #1e293b))';
  const blockTitleColorTablet = config.tabletBlockTitleColor || blockTitleColorDesktop;
  const blockTitleColorMobile = config.mobileBlockTitleColor || blockTitleColorDesktop;
  const blockTitleBorderDesktop = config.blockTitleBorderColor || effectiveAccent;
  const blockTitleBorderTablet = config.tabletBlockTitleBorderColor || blockTitleBorderDesktop;
  const blockTitleBorderMobile = config.mobileBlockTitleBorderColor || blockTitleBorderDesktop;
  const blockTitleFsDesktop = config.blockTitleFontSize !== undefined ? `${config.blockTitleFontSize}px` : 'var(--home-widget-title-size, 24px)';
  const blockTitleFsTablet = config.tabletBlockTitleFontSize !== undefined ? `${config.tabletBlockTitleFontSize}px` : (config.blockTitleFontSize !== undefined ? `${config.blockTitleFontSize}px` : '22px');
  const blockTitleFsMobile = config.mobileBlockTitleFontSize !== undefined ? `${config.mobileBlockTitleFontSize}px` : (config.blockTitleFontSize !== undefined ? `${config.blockTitleFontSize}px` : 'var(--home-widget-title-size, 20px)');
  const blockTitleLhDesktop = config.blockTitleLineHeight !== undefined ? String(config.blockTitleLineHeight) : '1.2';
  const blockTitleLhTablet = config.tabletBlockTitleLineHeight !== undefined ? String(config.tabletBlockTitleLineHeight) : (config.blockTitleLineHeight !== undefined ? String(config.blockTitleLineHeight) : '1.2');
  const blockTitleLhMobile = config.mobileBlockTitleLineHeight !== undefined ? String(config.mobileBlockTitleLineHeight) : (config.blockTitleLineHeight !== undefined ? String(config.blockTitleLineHeight) : '1.2');
  const blockTitleMbDesktop = config.blockTitleMarginBottom !== undefined ? `${config.blockTitleMarginBottom}px` : '12px';
  const blockTitleMbTablet = config.tabletBlockTitleMarginBottom !== undefined ? `${config.tabletBlockTitleMarginBottom}px` : (config.blockTitleMarginBottom !== undefined ? `${config.blockTitleMarginBottom}px` : '12px');
  const blockTitleMbMobile = config.mobileBlockTitleMarginBottom !== undefined ? `${config.mobileBlockTitleMarginBottom}px` : (config.blockTitleMarginBottom !== undefined ? `${config.blockTitleMarginBottom}px` : '12px');
  const blockTitlePbDesktop = config.blockTitlePaddingBottom !== undefined ? `${config.blockTitlePaddingBottom}px` : '12px';
  const blockTitlePbTablet = config.tabletBlockTitlePaddingBottom !== undefined ? `${config.tabletBlockTitlePaddingBottom}px` : (config.blockTitlePaddingBottom !== undefined ? `${config.blockTitlePaddingBottom}px` : '12px');
  const blockTitlePbMobile = config.mobileBlockTitlePaddingBottom !== undefined ? `${config.mobileBlockTitlePaddingBottom}px` : (config.blockTitlePaddingBottom !== undefined ? `${config.blockTitlePaddingBottom}px` : '12px');

  // Typography (Responsive)
  const fsDesktop = config.newsTitleFontSize ? `${config.newsTitleFontSize}px` : 'var(--home-news-title-size, 18px)'; 
  const fsTablet = config.tabletNewsTitleFontSize ? `${config.tabletNewsTitleFontSize}px` : fsDesktop; 
  const fsMobile = config.mobileNewsTitleFontSize ? `${config.mobileNewsTitleFontSize}px` : fsDesktop;

  const lhDesktop = config.newsTitleLineHeight || '1.2';
  const lhTablet = config.tabletNewsTitleLineHeight || '1.2';
  const lhMobile = config.mobileNewsTitleLineHeight || '1.2';
  const fwDesktop = config.newsTitleFontWeight || '700';
  const fwTablet = config.tabletNewsTitleFontWeight || fwDesktop;
  const fwMobile = config.mobileNewsTitleFontWeight || fwDesktop;

  // --- NEW: Category Label Style ---
  const catFsDesktop = config.categoryLabelFontSize ? `${config.categoryLabelFontSize}px` : '0.75rem';
  const catFsTablet = config.tabletCategoryLabelFontSize ? `${config.tabletCategoryLabelFontSize}px` : '0.75rem';
  const catFsMobile = config.mobileCategoryLabelFontSize ? `${config.mobileCategoryLabelFontSize}px` : '0.75rem';

  const catLhDesktop = config.categoryLabelLineHeight || '1.4';
  const catLhTablet = config.tabletCategoryLabelLineHeight || '1.4';
  const catLhMobile = config.mobileCategoryLabelLineHeight || '1.4';

  const catColorDesktop = config.categoryLabelTextColor || config.categoryTextColor || config.categoryLabelColor || '#ffffff';
  const catColorTablet = config.tabletCategoryLabelTextColor || config.tabletCategoryTextColor || config.tabletCategoryLabelColor || catColorDesktop;
  const catColorMobile = config.mobileCategoryLabelTextColor || config.mobileCategoryTextColor || config.mobileCategoryLabelColor || catColorDesktop;

  const catBgDesktop = config.categoryLabelBgColor || effectiveAccent;
  const catBgTablet = config.tabletCategoryLabelBgColor || catBgDesktop;
  const catBgMobile = config.mobileCategoryLabelBgColor || catBgDesktop;

  const catPyDesktop = config.categoryLabelPaddingY !== undefined ? `${config.categoryLabelPaddingY}px` : '4px';
  const catPyTablet = config.tabletCategoryLabelPaddingY !== undefined ? `${config.tabletCategoryLabelPaddingY}px` : (config.categoryLabelPaddingY !== undefined ? `${config.categoryLabelPaddingY}px` : '4px');
  const catPyMobile = config.mobileCategoryLabelPaddingY !== undefined ? `${config.mobileCategoryLabelPaddingY}px` : (config.categoryLabelPaddingY !== undefined ? `${config.categoryLabelPaddingY}px` : '4px');

  const catPxDesktop = config.categoryLabelPaddingX !== undefined ? `${config.categoryLabelPaddingX}px` : '12px';
  const catPxTablet = config.tabletCategoryLabelPaddingX !== undefined ? `${config.tabletCategoryLabelPaddingX}px` : (config.categoryLabelPaddingX !== undefined ? `${config.categoryLabelPaddingX}px` : '12px');
  const catPxMobile = config.mobileCategoryLabelPaddingX !== undefined ? `${config.mobileCategoryLabelPaddingX}px` : (config.categoryLabelPaddingX !== undefined ? `${config.categoryLabelPaddingX}px` : '12px');
  const catRadiusDesktop = resolveRadiusValue(config.categoryLabelBorderRadius ?? config.categoryBorderRadius, effectiveRadius);
  const catRadiusTablet = resolveRadiusValue(config.tabletCategoryLabelBorderRadius ?? config.tabletCategoryBorderRadius ?? config.categoryLabelBorderRadius ?? config.categoryBorderRadius, catRadiusDesktop);
  const catRadiusMobile = resolveRadiusValue(config.mobileCategoryLabelBorderRadius ?? config.mobileCategoryBorderRadius ?? config.categoryLabelBorderRadius ?? config.categoryBorderRadius, catRadiusDesktop);

  // --- NEW: Meta Info Style ---
  const metaFsDesktop = config.metaFontSize ? `${config.metaFontSize}px` : 'var(--home-meta-size, 0.75rem)';
  const metaFsTablet = config.tabletMetaFontSize ? `${config.tabletMetaFontSize}px` : metaFsDesktop;
  const metaFsMobile = config.mobileMetaFontSize ? `${config.mobileMetaFontSize}px` : metaFsDesktop;

  const metaLhDesktop = config.metaLineHeight || '1.4';
  const metaLhTablet = config.tabletMetaLineHeight || '1.4';
  const metaLhMobile = config.mobileMetaLineHeight || '1.4';
  const metaFwDesktop = config.metaFontWeight || '500';
  const metaFwTablet = config.tabletMetaFontWeight || metaFwDesktop;
  const metaFwMobile = config.mobileMetaFontWeight || metaFwDesktop;

  const metaColorDesktop = config.metaColor || 'var(--home-meta-color, #9ca3af)';
  const metaColorTablet = config.tabletMetaColor || metaColorDesktop;
  const metaColorMobile = config.mobileMetaColor || metaColorDesktop;

  // --- Excerpt Style ---
  const excerptFsDesktop = config.excerptFontSize ? `${config.excerptFontSize}px` : 'var(--home-excerpt-size, 0.875rem)';
  const excerptFsTablet = config.tabletExcerptFontSize ? `${config.tabletExcerptFontSize}px` : excerptFsDesktop;
  const excerptFsMobile = config.mobileExcerptFontSize ? `${config.mobileExcerptFontSize}px` : excerptFsDesktop;

  const excerptLhDesktop = config.excerptLineHeight || '1.6';
  const excerptLhTablet = config.tabletExcerptLineHeight || excerptLhDesktop;
  const excerptLhMobile = config.mobileExcerptLineHeight || excerptLhDesktop;
  const excerptFwDesktop = config.excerptFontWeight || '400';
  const excerptFwTablet = config.tabletExcerptFontWeight || excerptFwDesktop;
  const excerptFwMobile = config.mobileExcerptFontWeight || excerptFwDesktop;

  const excerptColorDesktop = config.excerptColor || 'var(--home-excerpt-color, #4b5563)';
  const excerptColorTablet = config.tabletExcerptColor || excerptColorDesktop;
  const excerptColorMobile = config.mobileExcerptColor || excerptColorDesktop;
  // --- NEW: Content Padding (Internal) ---
  // Defaults: px-4 (16px), pb-6 (24px). Desktop pb-8 (32px).
  const cpTopMobile = config.mobileContentPaddingTop !== undefined ? `${config.mobileContentPaddingTop}px` : '0px';
  const cpRightMobile = config.mobileContentPaddingRight !== undefined ? `${config.mobileContentPaddingRight}px` : '16px';
  const cpBottomMobile = config.mobileContentPaddingBottom !== undefined ? `${config.mobileContentPaddingBottom}px` : '24px';
  const cpLeftMobile = config.mobileContentPaddingLeft !== undefined ? `${config.mobileContentPaddingLeft}px` : '16px';

  const cpTopTablet = config.tabletContentPaddingTop !== undefined ? `${config.tabletContentPaddingTop}px` : cpTopMobile;
  const cpRightTablet = config.tabletContentPaddingRight !== undefined ? `${config.tabletContentPaddingRight}px` : cpRightMobile;
  const cpBottomTablet = config.tabletContentPaddingBottom !== undefined
    ? `${config.tabletContentPaddingBottom}px`
    : (config.mobileContentPaddingBottom !== undefined ? cpBottomMobile : '32px');
  const cpLeftTablet = config.tabletContentPaddingLeft !== undefined ? `${config.tabletContentPaddingLeft}px` : cpLeftMobile;

  const cpTopDesktop = config.contentPaddingTop !== undefined ? `${config.contentPaddingTop}px` : cpTopTablet;
  const cpRightDesktop = config.contentPaddingRight !== undefined ? `${config.contentPaddingRight}px` : cpRightTablet;
  const cpBottomDesktop = config.contentPaddingBottom !== undefined ? `${config.contentPaddingBottom}px` : cpBottomTablet;
  const cpLeftDesktop = config.contentPaddingLeft !== undefined ? `${config.contentPaddingLeft}px` : cpLeftTablet;

  // --- NEW: Container Margin & Padding ---
  const mTopMobile = config.mobileMarginTop !== undefined ? `${config.mobileMarginTop}px` : '0px';
  const mTopTablet = config.tabletMarginTop !== undefined ? `${config.tabletMarginTop}px` : mTopMobile;
  const mTopDesktop = config.marginTop !== undefined ? `${config.marginTop}px` : mTopTablet;

  const mRightMobile = config.mobileMarginRight !== undefined ? `${config.mobileMarginRight}px` : '0px';
  const mRightTablet = config.tabletMarginRight !== undefined ? `${config.tabletMarginRight}px` : mRightMobile;
  const mRightDesktop = config.marginRight !== undefined ? `${config.marginRight}px` : mRightTablet;

  const mBottomMobile = config.mobileMarginBottom !== undefined ? `${config.mobileMarginBottom}px` : '0px';
  const mBottomTablet = config.tabletMarginBottom !== undefined
    ? `${config.tabletMarginBottom}px`
    : mBottomMobile;
  const mBottomDesktop = config.marginBottom !== undefined ? `${config.marginBottom}px` : mBottomTablet;

  const mLeftMobile = config.mobileMarginLeft !== undefined ? `${config.mobileMarginLeft}px` : '0px';
  const mLeftTablet = config.tabletMarginLeft !== undefined ? `${config.tabletMarginLeft}px` : mLeftMobile;
  const mLeftDesktop = config.marginLeft !== undefined ? `${config.marginLeft}px` : mLeftTablet;

  const pTopMobile = config.mobilePaddingTop !== undefined ? `${config.mobilePaddingTop}px` : '0px';
  const pTopTablet = config.tabletPaddingTop !== undefined ? `${config.tabletPaddingTop}px` : pTopMobile;
  const pTopDesktop = config.paddingTop !== undefined ? `${config.paddingTop}px` : pTopTablet;

  const pRightMobile = config.mobilePaddingRight !== undefined ? `${config.mobilePaddingRight}px` : '0px';
  const pRightTablet = config.tabletPaddingRight !== undefined ? `${config.tabletPaddingRight}px` : pRightMobile;
  const pRightDesktop = config.paddingRight !== undefined ? `${config.paddingRight}px` : pRightTablet;

  const pBottomMobile = config.mobilePaddingBottom !== undefined ? `${config.mobilePaddingBottom}px` : '0px';
  const pBottomTablet = config.tabletPaddingBottom !== undefined ? `${config.tabletPaddingBottom}px` : pBottomMobile;
  const pBottomDesktop = config.paddingBottom !== undefined ? `${config.paddingBottom}px` : pBottomTablet;

  const pLeftMobile = config.mobilePaddingLeft !== undefined ? `${config.mobilePaddingLeft}px` : '0px';
  const pLeftTablet = config.tabletPaddingLeft !== undefined ? `${config.tabletPaddingLeft}px` : pLeftMobile;
  const pLeftDesktop = config.paddingLeft !== undefined ? `${config.paddingLeft}px` : pLeftTablet;


  // --- NEW: Element Spacing (Margin Bottom) ---
  const catMbDesktop = config.categoryLabelMarginBottom !== undefined ? `${config.categoryLabelMarginBottom}px` : '16px';
  const catMbTablet = config.tabletCategoryLabelMarginBottom !== undefined ? `${config.tabletCategoryLabelMarginBottom}px` : (config.categoryLabelMarginBottom !== undefined ? `${config.categoryLabelMarginBottom}px` : '16px');
  const catMbMobile = config.mobileCategoryLabelMarginBottom !== undefined ? `${config.mobileCategoryLabelMarginBottom}px` : (config.categoryLabelMarginBottom !== undefined ? `${config.categoryLabelMarginBottom}px` : '16px');

  const titleMbDesktop = config.newsTitleMarginBottom !== undefined ? `${config.newsTitleMarginBottom}px` : '16px';
  const titleMbTablet = config.tabletNewsTitleMarginBottom !== undefined ? `${config.tabletNewsTitleMarginBottom}px` : (config.newsTitleMarginBottom !== undefined ? `${config.newsTitleMarginBottom}px` : '16px');
  const titleMbMobile = config.mobileNewsTitleMarginBottom !== undefined ? `${config.mobileNewsTitleMarginBottom}px` : (config.newsTitleMarginBottom !== undefined ? `${config.newsTitleMarginBottom}px` : '16px');

  const metaMbDesktop = config.metaMarginBottom !== undefined ? `${config.metaMarginBottom}px` : '0px';
  const metaMbTablet = config.tabletMetaMarginBottom !== undefined ? `${config.tabletMetaMarginBottom}px` : (config.metaMarginBottom !== undefined ? `${config.metaMarginBottom}px` : '0px');
  const metaMbMobile = config.mobileMetaMarginBottom !== undefined ? `${config.mobileMetaMarginBottom}px` : (config.metaMarginBottom !== undefined ? `${config.metaMarginBottom}px` : '0px');

  const parseExcerptLength = (value: unknown, fallback: number) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const parsed = parseInt(String(value ?? ''), 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };
  const excerptLengthDesktop = parseExcerptLength(config.excerptLength, 120);
  const excerptLengthTablet = parseExcerptLength(config.tabletExcerptLength, excerptLengthDesktop);
  const excerptLengthMobile = parseExcerptLength(config.mobileExcerptLength, excerptLengthDesktop);

  const imageHeightMobile = typeof config.mobileImageHeight === 'number' || typeof config.mobileImageHeight === 'string'
    ? `${config.mobileImageHeight}`.match(/^\d+$/) ? `${config.mobileImageHeight}px` : `${config.mobileImageHeight}`
    : (typeof config.imageHeight === 'number' || typeof config.imageHeight === 'string'
        ? (`${config.imageHeight}`.match(/^\d+$/) ? `${config.imageHeight}px` : `${config.imageHeight}`)
        : '500px');
  const imageHeightTablet = typeof config.tabletImageHeight === 'number' || typeof config.tabletImageHeight === 'string'
    ? `${config.tabletImageHeight}`.match(/^\d+$/) ? `${config.tabletImageHeight}px` : `${config.tabletImageHeight}`
    : (typeof config.imageHeight === 'number' || typeof config.imageHeight === 'string'
        ? (`${config.imageHeight}`.match(/^\d+$/) ? `${config.imageHeight}px` : `${config.imageHeight}`)
        : '600px');
  const imageHeightDesktop = typeof config.imageHeight === 'number' || typeof config.imageHeight === 'string'
    ? `${config.imageHeight}`.match(/^\d+$/) ? `${config.imageHeight}px` : `${config.imageHeight}`
    : '600px';

  // Image Ratio Logic
  let aspectRatioStyle: React.CSSProperties = {};
  let heightClass = "h-[500px] md:h-[600px]"; // Default fixed height
  const hasCustomImageHeight = config.imageHeight !== undefined || config.tabletImageHeight !== undefined || config.mobileImageHeight !== undefined;
  const hasAspectRatioLayout = !!config.imageRatio && config.imageRatio !== 'auto' && !hasCustomImageHeight;
  const shellHeightMobile = hasCustomImageHeight ? imageHeightMobile : (hasAspectRatioLayout ? 'auto' : '500px');
  const shellHeightTablet = hasCustomImageHeight ? imageHeightTablet : (hasAspectRatioLayout ? 'auto' : '600px');
  const shellHeightDesktop = hasCustomImageHeight ? imageHeightDesktop : (hasAspectRatioLayout ? 'auto' : '600px');

  if (!hasCustomImageHeight && config.imageRatio && config.imageRatio !== 'auto') {
      const [w, h] = config.imageRatio.split(':').map(Number);
      if (w && h) {
          aspectRatioStyle = { aspectRatio: `${w}/${h}`, height: 'auto' };
          heightClass = ""; // Remove fixed height
      }
  }

  // Box wrapper may use its own responsive radius; keep inner shell slightly tighter.
  const hasAnyBox = useBoxDesktop || useBoxTablet || useBoxMobile;

  useEffect(() => {
    const updateDevice = () => {
      const width = window.innerWidth;
      if (width >= 1025) {
        setDevice("desktop");
        return;
      }
      if (width >= 768) {
        setDevice("tablet");
        return;
      }
      setDevice("mobile");
    };

    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  if (!heroPost) {
    return (
      <div className="w-full h-96 bg-[color:var(--bg-surface,#f9fafb)] flex items-center justify-center [color:var(--muted-text,var(--home-meta-color,#9ca3af))]">
        Belum ada berita untuk ditampilkan di Hero.
      </div>
    );
  }

  const imageUrl = heroPost.image || heroPost.featuredImage?.fileUrl || '/placeholder.jpg';
  const isVideo = String((heroPost as any)?.type || "").toUpperCase() === "VIDEO";
  const normalizeAvatarUrl = (value: unknown) => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('/')) return trimmed;
    return `/${trimmed}`;
  };
  const heroAuthorAvatar = (() => {
    const author = heroPost?.author;
    if (author && typeof author === 'object') {
      const a = author as { avatar?: string; avatarUrl?: string; image?: string; banner?: string };
      if (typeof a.avatar === 'string' && a.avatar.trim() !== '') return normalizeAvatarUrl(a.avatar);
      if (typeof a.avatarUrl === 'string' && a.avatarUrl.trim() !== '') return normalizeAvatarUrl(a.avatarUrl);
      if (typeof a.image === 'string' && a.image.trim() !== '') return normalizeAvatarUrl(a.image);
      if (typeof a.banner === 'string' && a.banner.trim() !== '') return normalizeAvatarUrl(a.banner);
    }
    if (typeof heroPost?.authorAvatar === 'string' && heroPost.authorAvatar.trim() !== '') return normalizeAvatarUrl(heroPost.authorAvatar);
    return '';
  })();
  const heroAuthorName = (() => {
    const author = heroPost?.author;
    if (typeof author === 'string' && author.trim() !== '') return author;
    if (author && typeof author === 'object') {
      const a = author as { name?: string; fullName?: string };
      if (typeof a.name === 'string' && a.name.trim() !== '') return a.name;
      if (typeof a.fullName === 'string' && a.fullName.trim() !== '') return a.fullName;
    }
    if (typeof heroPost?.authorName === 'string' && heroPost.authorName.trim() !== '') return heroPost.authorName;
    return '';
  })();
  const stripHtml = (value: unknown) => typeof value === 'string' ? value.replace(/<[^>]*>/g, ' ') : '';
  const decodeHtmlEntities = (value: string) =>
    value
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  const heroExcerptSourceForLength = (maxLength: number) => {
    const excerptText = decodeHtmlEntities(stripHtml(heroPost?.excerpt)).replace(/\s+/g, ' ').trim();
    const contentText = decodeHtmlEntities(stripHtml(heroPost?.content)).replace(/\s+/g, ' ').trim();
    if (!contentText) return excerptText;
    if (!excerptText) return contentText;
    return excerptText.length >= maxLength ? excerptText : contentText;
  };
  const clampExcerpt = (text: string, maxLength: number) => {
    if (!text) return '';
    if (maxLength <= 0) return '';
    if (text.length <= maxLength) return text;
    if (maxLength === 1) return '…';
    return `${text.slice(0, maxLength - 1).trimEnd()}…`;
  };
  const heroExcerptDesktop = clampExcerpt(heroExcerptSourceForLength(excerptLengthDesktop), excerptLengthDesktop);
  const heroExcerptTablet = clampExcerpt(heroExcerptSourceForLength(excerptLengthTablet), excerptLengthTablet);
  const heroExcerptMobile = clampExcerpt(heroExcerptSourceForLength(excerptLengthMobile), excerptLengthMobile);
  const hasAnyExcerptContent = !!(heroExcerptDesktop || heroExcerptTablet || heroExcerptMobile);
  const hasAnyPostTitleContent = showMetaInfoAny || (showExcerptAny && hasAnyExcerptContent);

  const currentTitleColor = device === "mobile" ? titleColorMobile : device === "tablet" ? titleColorTablet : titleColorDesktop;
  const currentHoverColor = device === "mobile" ? hoverColorMobile : device === "tablet" ? hoverColorTablet : hoverColorDesktop;
  const currentBlockTitleColor = device === "mobile" ? blockTitleColorMobile : device === "tablet" ? blockTitleColorTablet : blockTitleColorDesktop;
  const currentBlockTitleBorder = device === "mobile" ? blockTitleBorderMobile : device === "tablet" ? blockTitleBorderTablet : blockTitleBorderDesktop;
  const currentBlockTitleFs = device === "mobile" ? blockTitleFsMobile : device === "tablet" ? blockTitleFsTablet : blockTitleFsDesktop;
  const currentBlockTitleLh = device === "mobile" ? blockTitleLhMobile : device === "tablet" ? blockTitleLhTablet : blockTitleLhDesktop;
  const currentBlockTitleMb = device === "mobile" ? blockTitleMbMobile : device === "tablet" ? blockTitleMbTablet : blockTitleMbDesktop;
  const currentBlockTitlePb = device === "mobile" ? blockTitlePbMobile : device === "tablet" ? blockTitlePbTablet : blockTitlePbDesktop;
  const currentFs = device === "mobile" ? fsMobile : device === "tablet" ? fsTablet : fsDesktop;
  const currentLh = device === "mobile" ? lhMobile : device === "tablet" ? lhTablet : lhDesktop;
  const currentFw = device === "mobile" ? fwMobile : device === "tablet" ? fwTablet : fwDesktop;
  const currentShowCategory = device === "mobile" ? showCategoryMobile : device === "tablet" ? showCategoryTablet : showCategoryDesktop;
  const currentShowMetaInfo = device === "mobile" ? showMetaInfoMobile : device === "tablet" ? showMetaInfoTablet : showMetaInfoDesktop;
  const currentShowAuthor = device === "mobile" ? showAuthorMobile : device === "tablet" ? showAuthorTablet : showAuthorDesktop;
  const currentShowDate = device === "mobile" ? showDateMobile : device === "tablet" ? showDateTablet : showDateDesktop;
  const currentShowExcerpt = device === "mobile" ? showExcerptMobile : device === "tablet" ? showExcerptTablet : showExcerptDesktop;
  const currentCatFs = device === "mobile" ? catFsMobile : device === "tablet" ? catFsTablet : catFsDesktop;
  const currentCatLh = device === "mobile" ? catLhMobile : device === "tablet" ? catLhTablet : catLhDesktop;
  const currentCatColor = device === "mobile" ? catColorMobile : device === "tablet" ? catColorTablet : catColorDesktop;
  const currentCatBg = device === "mobile" ? catBgMobile : device === "tablet" ? catBgTablet : catBgDesktop;
  const currentCatPy = device === "mobile" ? catPyMobile : device === "tablet" ? catPyTablet : catPyDesktop;
  const currentCatPx = device === "mobile" ? catPxMobile : device === "tablet" ? catPxTablet : catPxDesktop;
  const currentCatRadius = device === "mobile" ? catRadiusMobile : device === "tablet" ? catRadiusTablet : catRadiusDesktop;
  const currentCatMb = device === "mobile" ? catMbMobile : device === "tablet" ? catMbTablet : catMbDesktop;
  const currentMetaFs = device === "mobile" ? metaFsMobile : device === "tablet" ? metaFsTablet : metaFsDesktop;
  const currentMetaLh = device === "mobile" ? metaLhMobile : device === "tablet" ? metaLhTablet : metaLhDesktop;
  const currentMetaFw = device === "mobile" ? metaFwMobile : device === "tablet" ? metaFwTablet : metaFwDesktop;
  const currentMetaColor = device === "mobile" ? metaColorMobile : device === "tablet" ? metaColorTablet : metaColorDesktop;
  const currentMetaMb = device === "mobile" ? metaMbMobile : device === "tablet" ? metaMbTablet : metaMbDesktop;
  const currentExcerpt = device === "mobile" ? heroExcerptMobile : device === "tablet" ? heroExcerptTablet : heroExcerptDesktop;
  const currentExcerptFs = device === "mobile" ? excerptFsMobile : device === "tablet" ? excerptFsTablet : excerptFsDesktop;
  const currentExcerptLh = device === "mobile" ? excerptLhMobile : device === "tablet" ? excerptLhTablet : excerptLhDesktop;
  const currentExcerptFw = device === "mobile" ? excerptFwMobile : device === "tablet" ? excerptFwTablet : excerptFwDesktop;
  const currentExcerptColor = device === "mobile" ? excerptColorMobile : device === "tablet" ? excerptColorTablet : excerptColorDesktop;
  const currentTitleMb = device === "mobile" ? titleMbMobile : device === "tablet" ? titleMbTablet : titleMbDesktop;
  const currentShellHeight = device === "mobile" ? shellHeightMobile : device === "tablet" ? shellHeightTablet : shellHeightDesktop;
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
  const currentInnerRadius = currentUseBox
    ? (currentBoxRadius === "0" ? "0" : `calc(${currentBoxRadius} - 4px)`)
    : effectiveRadius;
  const finalTitleColor = isHovered ? currentHoverColor : currentTitleColor;
  const shouldShowMetaRow = currentShowMetaInfo && ((currentShowAuthor && !!heroAuthorName) || currentShowDate);
  const widgetTitle = (typeof customTitle === "string" && customTitle.trim() !== "")
    ? customTitle.trim()
    : (typeof block?.title === "string" && block.title.trim() !== "")
      ? block.title.trim()
      : (typeof config.title === "string" && config.title.trim() !== "")
        ? config.title.trim()
        : "Classic Hero";
  
  return (
    <div 
        id={`hero-root-${block.id}`}
        className="relative max-w-full responsive-block-frame"
        style={{
            '--rb-mt-mobile': mTopMobile,
            '--rb-mr-mobile': mRightMobile,
            '--rb-mb-mobile': mBottomMobile,
            '--rb-ml-mobile': mLeftMobile,
            '--rb-pt-mobile': pTopMobile,
            '--rb-pr-mobile': pRightMobile,
            '--rb-pb-mobile': pBottomMobile,
            '--rb-pl-mobile': pLeftMobile,
            '--rb-mt-tablet': mTopTablet,
            '--rb-mr-tablet': mRightTablet,
            '--rb-mb-tablet': mBottomTablet,
            '--rb-ml-tablet': mLeftTablet,
            '--rb-pt-tablet': pTopTablet,
            '--rb-pr-tablet': pRightTablet,
            '--rb-pb-tablet': pBottomTablet,
            '--rb-pl-tablet': pLeftTablet,
            '--rb-mt-desktop': mTopDesktop,
            '--rb-mr-desktop': mRightDesktop,
            '--rb-mb-desktop': mBottomDesktop,
            '--rb-ml-desktop': mLeftDesktop,
            '--rb-pt-desktop': pTopDesktop,
            '--rb-pr-desktop': pRightDesktop,
            '--rb-pb-desktop': pBottomDesktop,
            '--rb-pl-desktop': pLeftDesktop,
            '--accent': effectiveAccent,
            overflow: 'visible'
        } as React.CSSProperties}
    >
        <div
            id={`hero-box-${block.id}`}
            className="relative"
            style={{
                borderRadius: currentUseBox ? currentBoxRadius : effectiveRadius,
                backgroundColor: currentUseBox ? currentBoxColor : 'transparent',
                boxShadow: currentUseBox ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none',
                backgroundImage: currentBoxBackgroundImage,
                backgroundSize: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `cover, ${currentBoxBgSize}` : currentBoxBgSize) : undefined,
                backgroundPosition: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `center, ${currentBoxBgPosition}` : currentBoxBgPosition) : undefined,
                backgroundRepeat: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `no-repeat, ${currentBoxBgRepeat}` : currentBoxBgRepeat) : undefined,
                backgroundAttachment: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `scroll, ${currentBoxBgAttachment}` : currentBoxBgAttachment) : undefined,
                paddingTop: currentUseBox ? currentBoxPt : '0px',
                paddingRight: currentUseBox ? currentBoxPr : '0px',
                paddingBottom: currentUseBox ? currentBoxPb : '0px',
                paddingLeft: currentUseBox ? currentBoxPl : '0px',
            }}
        >
        {(config.showTitle !== false) && (
          <h3
            className="font-bold border-b border-[color:var(--border,#e5e7eb)] flex items-center theme-widget-title"
            style={{ lineHeight: currentBlockTitleLh, marginBottom: currentBlockTitleMb, paddingBottom: currentBlockTitlePb }}
          >
            <div className="widget-title-bar" style={{ borderRadius: "var(--home-main-box-radius, 0.25rem)", backgroundColor: currentBlockTitleBorder }}></div>
            <span style={{ color: currentBlockTitleColor, fontSize: currentBlockTitleFs, lineHeight: currentBlockTitleLh }}>{widgetTitle}</span>
          </h3>
        )}
        <section 
            id={`hero-shell-${block.id}`}
            className={`relative w-full overflow-hidden ${heightClass}`}
            style={{ 
                borderRadius: hasAnyBox ? currentInnerRadius : effectiveRadius,
                height: currentShellHeight,
                ...aspectRatioStyle
            } as React.CSSProperties}
        >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <Image
            src={imageUrl}
            alt={heroPost.title}
            fill
            quality={75}
            className="object-cover transition-transform duration-700 hover:scale-105"
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 1200px"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        </div>

        {isVideo && (
          <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-8 w-8 translate-x-[0.5px]">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        )}

        {/* Content */}
        <div 
            id={`hero-content-${block.id}`}
            className="absolute bottom-0 left-0 right-0 z-20 w-full"
            style={{
              paddingTop: cpTopMobile,
              paddingRight: cpRightMobile,
              paddingBottom: cpBottomMobile,
              paddingLeft: cpLeftMobile,
              ...(device === "tablet"
                ? {
                    paddingTop: cpTopTablet,
                    paddingRight: cpRightTablet,
                    paddingBottom: cpBottomTablet,
                    paddingLeft: cpLeftTablet,
                  }
                : {}),
              ...(device === "desktop"
                ? {
                    paddingTop: cpTopDesktop,
                    paddingRight: cpRightDesktop,
                    paddingBottom: cpBottomDesktop,
                    paddingLeft: cpLeftDesktop,
                  }
                : {}),
            }}
        >
            <div className="container mx-auto">
                <div className="max-w-3xl text-white">
                {currentShowCategory && heroPost.category && (
                    <span 
                        id={`hero-cat-${block.id}`}
                        className="inline-block font-bold uppercase tracking-wider shadow-sm"
                        style={{
                          fontSize: currentCatFs,
                          lineHeight: currentCatLh,
                          color: currentCatColor,
                          backgroundColor: currentCatBg,
                          borderRadius: currentCatRadius,
                          marginBottom: currentCatMb,
                          paddingTop: currentCatPy,
                          paddingBottom: currentCatPy,
                          paddingLeft: currentCatPx,
                          paddingRight: currentCatPx,
                        }}
                    >
                    {heroPost.category.name}
                    </span>
                )}
                
                <h2 
                    id={`hero-title-${block.id}`}
                    className="font-bold drop-shadow-md"
                    style={{
                      fontFamily: 'var(--home-news-title-font, sans-serif)',
                      fontSize: currentFs,
                      lineHeight: String(currentLh),
                      fontWeight: String(currentFw),
                      marginBottom: 0,
                    }}
                >
                    <Link 
                        id={`hero-title-link-${block.id}`}
                        href={`/${heroPost.category?.slug || 'berita'}/${heroPost.slug}`} 
                        className="transition-colors duration-200"
                        style={{
                            color: finalTitleColor,
                            textDecoration: 'none'
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                    {heroPost.title}
                    </Link>
                </h2>

                {hasAnyPostTitleContent && (
                    <div id={`hero-after-title-${block.id}`} style={{ marginTop: currentTitleMb }}>
                        {shouldShowMetaRow && (
                            <div 
                                id={`hero-meta-${block.id}`}
                                className="flex items-center gap-3 font-medium opacity-90"
                                style={{ 
                                    fontFamily: 'var(--home-meta-font, sans-serif)',
                                    fontWeight: String(currentMetaFw),
                                    fontSize: currentMetaFs,
                                    lineHeight: String(currentMetaLh),
                                    color: currentMetaColor,
                                    marginBottom: currentMetaMb,
                                }}
                            >
                                {currentShowAuthor && heroAuthorName && (
                                    <div id={`hero-author-${block.id}`} className="flex items-center gap-1.5">
                                        <span className="rounded-full bg-white/20 flex items-center justify-center relative overflow-hidden shrink-0" style={{ width: '1.5em', height: '1.5em', fontSize: '0.92em' }}>
                                            {heroAuthorAvatar ? (
                                              <Image src={heroAuthorAvatar} alt={heroAuthorName} fill className="object-cover" sizes="16px" />
                                            ) : (
                                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '1em', height: '1em' }}>
                                                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                              </svg>
                                            )}
                                        </span>
                                        <span>{heroAuthorName}</span>
                                    </div>
                                )}
                                {currentShowAuthor && heroAuthorName && currentShowDate && <span id={`hero-date-separator-${block.id}`} className="rounded-full shrink-0 bg-white/50" style={{ width: '0.42em', height: '0.42em' }}></span>}
                                {currentShowDate && <div id={`hero-date-${block.id}`} className="flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 shrink-0" style={{ width: '1.22em', height: '1.22em' }}>
                                        <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                                    </svg>
                                    <time
                                        dateTime={(() => {
                                            const raw = heroPost?.publishedAt || heroPost?.createdAt;
                                            const d = raw instanceof Date ? raw : new Date(raw || "");
                                            return Number.isNaN(d.getTime()) ? "" : d.toISOString();
                                        })()}
                                    >
                                        {formatLongDateId(heroPost?.publishedAt || heroPost?.createdAt)}
                                    </time>
                                </div>}
                            </div>
                        )}
                        {currentShowExcerpt && currentExcerpt && (
                            <p
                                className="mt-3 max-w-2xl opacity-95"
                                style={{
                                    fontFamily: 'var(--home-excerpt-font, sans-serif)',
                                    fontWeight: String(currentExcerptFw),
                                    fontSize: currentExcerptFs,
                                    lineHeight: String(currentExcerptLh),
                                    color: currentExcerptColor
                                }}
                            >
                                {currentExcerpt}
                            </p>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>

        </section>
        </div>
    </div>
  );
}
