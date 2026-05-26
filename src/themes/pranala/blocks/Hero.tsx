"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBoolValues, getResponsiveValues } from "./responsive";

interface HeroProps {
  block: any;
  posts: any[];
  accentColor?: string;
  borderRadius?: string;
}

const toSize = (val: unknown, fallback: string) => {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "number" && Number.isFinite(val)) return `${val}px`;
  if (typeof val === "string" && val.trim() !== "") return /^\d+(\.\d+)?$/.test(val.trim()) ? `${val.trim()}px` : val;
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

export default function Hero({ block, posts, accentColor, borderRadius }: HeroProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Ambil post pertama sebagai hero
  const heroPost = posts && posts.length > 0 ? posts[0] : null;
  const effectiveAccent = accentColor || 'var(--accent)';
  const effectiveRadius = borderRadius ? borderRadius : 'var(--home-main-box-radius, 0.75rem)';
  const config = block.config || {};
  const configRecord = config as Record<string, unknown>;

  // --- CONFIG VALUES ---
  const showCategoryValues = getResponsiveBoolValues(configRecord, "showCategory", true);
  const showCategoryDesktop = showCategoryValues.desktop;
  const showCategoryTablet = showCategoryValues.tablet;
  const showCategoryMobile = showCategoryValues.mobile;
  const showCategoryAny = showCategoryDesktop || showCategoryTablet || showCategoryMobile;
  const showMetaInfoValues = getResponsiveBoolValues(configRecord, "showMetaInfo", true);
  const showMetaInfoDesktop = showMetaInfoValues.desktop;
  const showMetaInfoTablet = showMetaInfoValues.tablet;
  const showMetaInfoMobile = showMetaInfoValues.mobile;
  const showMetaInfoAny = showMetaInfoDesktop || showMetaInfoTablet || showMetaInfoMobile;
  const showAuthorValues = getResponsiveBoolValues(configRecord, "showAuthor", true);
  const showAuthorDesktop = showAuthorValues.desktop;
  const showAuthorTablet = showAuthorValues.tablet;
  const showAuthorMobile = showAuthorValues.mobile;
  const showAuthorAny = showAuthorDesktop || showAuthorTablet || showAuthorMobile;
  const showDateValues = getResponsiveBoolValues(configRecord, "showDate", true);
  const showDateDesktop = showDateValues.desktop;
  const showDateTablet = showDateValues.tablet;
  const showDateMobile = showDateValues.mobile;
  const showDateAny = showDateDesktop || showDateTablet || showDateMobile;
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
  const boxColorDesktop = boxColorValues.desktop || '#ffffff';
  const boxColorTablet = boxColorValues.tablet || boxColorDesktop;
  const boxColorMobile = boxColorValues.mobile || boxColorDesktop;

  // Colors
  const titleColorDesktop = config.newsTitleColor || 'var(--home-news-title-color, #111827)';
  const titleColorTablet = config.tabletNewsTitleColor || titleColorDesktop;
  const titleColorMobile = config.mobileNewsTitleColor || titleColorDesktop;
  const hoverColorDesktop = config.newsTitleHoverColor || 'var(--home-hover-color, var(--accent))';
  const hoverColorTablet = config.tabletNewsTitleHoverColor || hoverColorDesktop;
  const hoverColorMobile = config.mobileNewsTitleHoverColor || hoverColorDesktop;

  // Typography (Responsive)
  const fsDesktop = config.newsTitleFontSize ? `${config.newsTitleFontSize}px` : 'var(--home-news-title-size, 18px)'; 
  const fsTablet = config.tabletNewsTitleFontSize ? `${config.tabletNewsTitleFontSize}px` : fsDesktop; 
  const fsMobile = config.mobileNewsTitleFontSize ? `${config.mobileNewsTitleFontSize}px` : fsDesktop;

  const lhDesktop = config.newsTitleLineHeight || '1.2';
  const lhTablet = config.tabletNewsTitleLineHeight || '1.2';
  const lhMobile = config.mobileNewsTitleLineHeight || '1.2';

  // --- NEW: Category Label Style ---
  const catFsDesktop = config.categoryLabelFontSize ? `${config.categoryLabelFontSize}px` : '0.75rem';
  const catFsTablet = config.tabletCategoryLabelFontSize ? `${config.tabletCategoryLabelFontSize}px` : '0.75rem';
  const catFsMobile = config.mobileCategoryLabelFontSize ? `${config.mobileCategoryLabelFontSize}px` : '0.75rem';

  const catLhDesktop = config.categoryLabelLineHeight || '1.4';
  const catLhTablet = config.tabletCategoryLabelLineHeight || '1.4';
  const catLhMobile = config.mobileCategoryLabelLineHeight || '1.4';

  const catColorDesktop = config.categoryLabelColor || '#ffffff';
  const catColorTablet = config.tabletCategoryLabelColor || catColorDesktop;
  const catColorMobile = config.mobileCategoryLabelColor || catColorDesktop;

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
  const metaFsDesktop = config.metaFontSize ? `${config.metaFontSize}px` : '0.875rem';
  const metaFsTablet = config.tabletMetaFontSize ? `${config.tabletMetaFontSize}px` : '0.75rem';
  const metaFsMobile = config.mobileMetaFontSize ? `${config.mobileMetaFontSize}px` : '0.75rem';

  const metaLhDesktop = config.metaLineHeight || '1.4';
  const metaLhTablet = config.tabletMetaLineHeight || '1.4';
  const metaLhMobile = config.mobileMetaLineHeight || '1.4';

  const metaColorDesktop = config.metaColor || 'var(--home-meta-color, #e5e7eb)';
  const metaColorTablet = config.tabletMetaColor || metaColorDesktop;
  const metaColorMobile = config.mobileMetaColor || metaColorDesktop;

  // --- Excerpt Style ---
  const excerptFsDesktop = config.excerptFontSize ? `${config.excerptFontSize}px` : '0.95rem';
  const excerptFsTablet = config.tabletExcerptFontSize ? `${config.tabletExcerptFontSize}px` : excerptFsDesktop;
  const excerptFsMobile = config.mobileExcerptFontSize ? `${config.mobileExcerptFontSize}px` : excerptFsDesktop;

  const excerptLhDesktop = config.excerptLineHeight || '1.6';
  const excerptLhTablet = config.tabletExcerptLineHeight || excerptLhDesktop;
  const excerptLhMobile = config.mobileExcerptLineHeight || excerptLhDesktop;

  const excerptColorDesktop = config.excerptColor || 'var(--home-excerpt-color, #e5e7eb)';
  const excerptColorTablet = config.tabletExcerptColor || excerptColorDesktop;
  const excerptColorMobile = config.mobileExcerptColor || excerptColorDesktop;
  const blockTitleColorMobile = config.mobileBlockTitleColor || config.blockTitleColor || "var(--home-widget-title-color, var(--heading-color, #1e293b))";
  const blockTitleColorTablet = config.tabletBlockTitleColor || blockTitleColorMobile;
  const blockTitleColorDesktop = config.blockTitleColor || blockTitleColorTablet;
  const blockTitleBorderMobile = config.mobileBlockTitleBorderColor || config.blockTitleBorderColor || "var(--accent)";
  const blockTitleBorderTablet = config.tabletBlockTitleBorderColor || blockTitleBorderMobile;
  const blockTitleBorderDesktop = config.blockTitleBorderColor || blockTitleBorderTablet;
  const blockTitleFsMobile = toSize(config.mobileBlockTitleFontSize ?? config.blockTitleFontSize, "20px");
  const blockTitleFsTablet = toSize(config.tabletBlockTitleFontSize ?? config.blockTitleFontSize, "22px");
  const blockTitleFsDesktop = toSize(config.blockTitleFontSize, "24px");
  const blockTitleMbMobile = toSize(config.mobileBlockTitleMarginBottom ?? config.blockTitleMarginBottom, "12px");
  const blockTitleMbTablet = toSize(config.tabletBlockTitleMarginBottom ?? config.blockTitleMarginBottom, blockTitleMbMobile);
  const blockTitleMbDesktop = toSize(config.blockTitleMarginBottom, blockTitleMbTablet);
  const blockTitlePbMobile = toSize(config.mobileBlockTitlePaddingBottom ?? config.blockTitlePaddingBottom, "12px");
  const blockTitlePbTablet = toSize(config.tabletBlockTitlePaddingBottom ?? config.blockTitlePaddingBottom, blockTitlePbMobile);
  const blockTitlePbDesktop = toSize(config.blockTitlePaddingBottom, blockTitlePbTablet);

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
    if (typeof value === 'number' && Number.isFinite(value)) return Math.max(20, value);
    const parsed = parseInt(String(value ?? ''), 10);
    return Number.isNaN(parsed) ? fallback : Math.max(20, parsed);
  };
  const excerptLengthDesktop = parseExcerptLength(config.excerptLength, 200);
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

  // Handle Box Border Radius issue
  const hasAnyBox = useBoxDesktop || useBoxTablet || useBoxMobile;
  const innerRadius = hasAnyBox ? `calc(${effectiveRadius} - 4px)` : effectiveRadius;

  // Responsive Styles Hook or Logic
  // We use inline styles for dynamic values but we need media queries.
  // Since we can't use media queries in inline styles easily without a library,
  // we will inject a <style> tag for this specific component instance.
  // This is a common pattern in Next.js for dynamic user-configured styles.

  if (!heroPost) {
    return (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-400">
        Belum ada berita untuk ditampilkan di Hero.
      </div>
    );
  }

  const imageUrl = heroPost.image || heroPost.featuredImage?.fileUrl || '/placeholder.jpg';
  const isVideo = String((heroPost as any)?.type || "").toUpperCase() === "VIDEO";
  const finalTitleColor = isHovered ? 'var(--hero-title-hover-color)' : 'var(--hero-title-color)';
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
  
  return (
    <>
    {/* Explicit Style Tag Injection to bypass styled-jsx limitations */}
    <style dangerouslySetInnerHTML={{__html: `
        /* Mobile First (Base) */
        #hero-title-${block.id} {
            display: block !important;
            font-size: ${fsMobile} !important;
            line-height: ${lhMobile} !important;
            margin-bottom: 0 !important;
        }
        #hero-title-link-${block.id} {
            --hero-title-color: ${titleColorMobile};
            --hero-title-hover-color: ${hoverColorMobile};
        }
        #hero-after-title-${block.id} {
            margin-top: ${titleMbMobile} !important;
        }
        #hero-cat-${block.id} {
            display: ${showCategoryMobile ? 'inline-block' : 'none'} !important;
            font-size: ${catFsMobile} !important;
            line-height: ${catLhMobile} !important;
            color: ${catColorMobile} !important;
            background-color: ${catBgMobile} !important;
            border-radius: ${catRadiusMobile} !important;
            margin-bottom: ${catMbMobile} !important;
            padding-top: ${catPyMobile} !important;
            padding-bottom: ${catPyMobile} !important;
            padding-left: ${catPxMobile} !important;
            padding-right: ${catPxMobile} !important;
        }
        #hero-meta-${block.id} {
            display: ${showMetaInfoMobile ? 'flex' : 'none'} !important;
            font-size: ${metaFsMobile} !important;
            line-height: ${metaLhMobile} !important;
            color: ${metaColorMobile} !important;
            margin-bottom: ${metaMbMobile} !important;
        }
        #hero-author-${block.id} {
            display: ${showAuthorMobile ? 'flex' : 'none'} !important;
        }
        #hero-date-separator-${block.id} {
            display: ${showAuthorMobile && showDateMobile ? 'block' : 'none'} !important;
        }
        #hero-date-${block.id} {
            display: ${showDateMobile ? 'flex' : 'none'} !important;
        }
        #hero-shell-${block.id} {
            height: ${shellHeightMobile} !important;
        }
        .hero-excerpt-${block.id} {
            font-size: ${excerptFsMobile} !important;
            line-height: ${excerptLhMobile} !important;
            color: ${excerptColorMobile} !important;
        }
        #hero-excerpt-mobile-${block.id} {
            display: ${showExcerptMobile ? 'block' : 'none'} !important;
        }
        #hero-excerpt-tablet-${block.id},
        #hero-excerpt-desktop-${block.id} {
            display: none !important;
        }
        #hero-root-${block.id} .theme-widget-title { margin-bottom: ${blockTitleMbMobile}; padding-bottom: ${blockTitlePbMobile}; }
        #hero-root-${block.id} .theme-widget-title span { color: ${blockTitleColorMobile}; font-size: ${blockTitleFsMobile}; }
        #hero-root-${block.id} .theme-widget-title .widget-title-bar { background-color: ${blockTitleBorderMobile}; }
        #hero-content-${block.id} {
            padding-top: ${cpTopMobile} !important;
            padding-right: ${cpRightMobile} !important;
            padding-bottom: ${cpBottomMobile} !important;
            padding-left: ${cpLeftMobile} !important;
        }
        #hero-root-${block.id} {
            margin-top: ${mTopMobile} !important;
            margin-right: ${mRightMobile} !important;
            margin-bottom: ${mBottomMobile} !important;
            margin-left: ${mLeftMobile} !important;
            padding-top: ${pTopMobile} !important;
            padding-right: ${pRightMobile} !important;
            padding-bottom: ${pBottomMobile} !important;
            padding-left: ${pLeftMobile} !important;
            background-color: ${useBoxMobile ? boxColorMobile : 'transparent'} !important;
            box-shadow: ${useBoxMobile ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none'} !important;
        }

        /* Tablet */
        @media (min-width: 768px) {
            #hero-title-${block.id} {
                font-size: ${fsTablet} !important;
                line-height: ${lhTablet} !important;
                margin-bottom: 0 !important;
            }
            #hero-title-link-${block.id} {
                --hero-title-color: ${titleColorTablet};
                --hero-title-hover-color: ${hoverColorTablet};
            }
            #hero-after-title-${block.id} {
                margin-top: ${titleMbTablet} !important;
            }
            #hero-cat-${block.id} {
                display: ${showCategoryTablet ? 'inline-block' : 'none'} !important;
                font-size: ${catFsTablet} !important;
                line-height: ${catLhTablet} !important;
                color: ${catColorTablet} !important;
                background-color: ${catBgTablet} !important;
                border-radius: ${catRadiusTablet} !important;
                margin-bottom: ${catMbTablet} !important;
                padding-top: ${catPyTablet} !important;
                padding-bottom: ${catPyTablet} !important;
                padding-left: ${catPxTablet} !important;
                padding-right: ${catPxTablet} !important;
            }
            #hero-meta-${block.id} {
                display: ${showMetaInfoTablet ? 'flex' : 'none'} !important;
                font-size: ${metaFsTablet} !important;
                line-height: ${metaLhTablet} !important;
                color: ${metaColorTablet} !important;
                margin-bottom: ${metaMbTablet} !important;
            }
            #hero-author-${block.id} {
                display: ${showAuthorTablet ? 'flex' : 'none'} !important;
            }
            #hero-date-separator-${block.id} {
                display: ${showAuthorTablet && showDateTablet ? 'block' : 'none'} !important;
            }
            #hero-date-${block.id} {
                display: ${showDateTablet ? 'flex' : 'none'} !important;
            }
            #hero-shell-${block.id} {
                height: ${shellHeightTablet} !important;
            }
            .hero-excerpt-${block.id} {
                font-size: ${excerptFsTablet} !important;
                line-height: ${excerptLhTablet} !important;
                color: ${excerptColorTablet} !important;
            }
            #hero-excerpt-mobile-${block.id},
            #hero-excerpt-desktop-${block.id} {
                display: none !important;
            }
            #hero-excerpt-tablet-${block.id} {
                display: ${showExcerptTablet ? 'block' : 'none'} !important;
            }
            #hero-root-${block.id} .theme-widget-title { margin-bottom: ${blockTitleMbTablet}; padding-bottom: ${blockTitlePbTablet}; }
            #hero-root-${block.id} .theme-widget-title span { color: ${blockTitleColorTablet}; font-size: ${blockTitleFsTablet}; }
            #hero-root-${block.id} .theme-widget-title .widget-title-bar { background-color: ${blockTitleBorderTablet}; }
            #hero-content-${block.id} {
                padding-top: ${cpTopTablet} !important;
                padding-right: ${cpRightTablet} !important;
                padding-bottom: ${cpBottomTablet} !important;
                padding-left: ${cpLeftTablet} !important;
            }
            #hero-root-${block.id} {
                margin-top: ${mTopTablet} !important;
                margin-right: ${mRightTablet} !important;
                margin-bottom: ${mBottomTablet} !important;
                margin-left: ${mLeftTablet} !important;
                padding-top: ${pTopTablet} !important;
                padding-right: ${pRightTablet} !important;
                padding-bottom: ${pBottomTablet} !important;
                padding-left: ${pLeftTablet} !important;
                background-color: ${useBoxTablet ? boxColorTablet : 'transparent'} !important;
                box-shadow: ${useBoxTablet ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none'} !important;
            }
        }

        /* Desktop */
        @media (min-width: 1025px) {
            #hero-title-${block.id} {
                font-size: ${fsDesktop} !important;
                line-height: ${lhDesktop} !important;
                margin-bottom: 0 !important;
            }
            #hero-title-link-${block.id} {
                --hero-title-color: ${titleColorDesktop};
                --hero-title-hover-color: ${hoverColorDesktop};
            }
            #hero-after-title-${block.id} {
                margin-top: ${titleMbDesktop} !important;
            }
            #hero-cat-${block.id} {
                display: ${showCategoryDesktop ? 'inline-block' : 'none'} !important;
                font-size: ${catFsDesktop} !important;
                line-height: ${catLhDesktop} !important;
                color: ${catColorDesktop} !important;
                background-color: ${catBgDesktop} !important;
                border-radius: ${catRadiusDesktop} !important;
                margin-bottom: ${catMbDesktop} !important;
                padding-top: ${catPyDesktop} !important;
                padding-bottom: ${catPyDesktop} !important;
                padding-left: ${catPxDesktop} !important;
                padding-right: ${catPxDesktop} !important;
            }
            #hero-meta-${block.id} {
                display: ${showMetaInfoDesktop ? 'flex' : 'none'} !important;
                font-size: ${metaFsDesktop} !important;
                line-height: ${metaLhDesktop} !important;
                color: ${metaColorDesktop} !important;
                margin-bottom: ${metaMbDesktop} !important;
            }
            #hero-author-${block.id} {
                display: ${showAuthorDesktop ? 'flex' : 'none'} !important;
            }
            #hero-date-separator-${block.id} {
                display: ${showAuthorDesktop && showDateDesktop ? 'block' : 'none'} !important;
            }
            #hero-date-${block.id} {
                display: ${showDateDesktop ? 'flex' : 'none'} !important;
            }
            #hero-shell-${block.id} {
                height: ${shellHeightDesktop} !important;
            }
            .hero-excerpt-${block.id} {
                font-size: ${excerptFsDesktop} !important;
                line-height: ${excerptLhDesktop} !important;
                color: ${excerptColorDesktop} !important;
            }
            #hero-excerpt-mobile-${block.id},
            #hero-excerpt-tablet-${block.id} {
                display: none !important;
            }
            #hero-excerpt-desktop-${block.id} {
                display: ${showExcerptDesktop ? 'block' : 'none'} !important;
            }
            #hero-root-${block.id} .theme-widget-title { margin-bottom: ${blockTitleMbDesktop}; padding-bottom: ${blockTitlePbDesktop}; }
            #hero-root-${block.id} .theme-widget-title span { color: ${blockTitleColorDesktop}; font-size: ${blockTitleFsDesktop}; }
            #hero-root-${block.id} .theme-widget-title .widget-title-bar { background-color: ${blockTitleBorderDesktop}; }
            #hero-content-${block.id} {
                padding-top: ${cpTopDesktop} !important;
                padding-right: ${cpRightDesktop} !important;
                padding-bottom: ${cpBottomDesktop} !important;
                padding-left: ${cpLeftDesktop} !important;
            }
            #hero-root-${block.id} {
                margin-top: ${mTopDesktop} !important;
                margin-right: ${mRightDesktop} !important;
                margin-bottom: ${mBottomDesktop} !important;
                margin-left: ${mLeftDesktop} !important;
                padding-top: ${pTopDesktop} !important;
                padding-right: ${pRightDesktop} !important;
                padding-bottom: ${pBottomDesktop} !important;
                padding-left: ${pLeftDesktop} !important;
                background-color: ${useBoxDesktop ? boxColorDesktop : 'transparent'} !important;
                box-shadow: ${useBoxDesktop ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none'} !important;
            }
        }
    `}} />

    <div 
        id={`hero-root-${block.id}`}
        className="w-full relative"
        style={{
            borderRadius: effectiveRadius,
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '--accent': effectiveAccent,
            '--widget-title-color-mobile': blockTitleColorMobile,
            '--widget-title-color-tablet': blockTitleColorTablet,
            '--widget-title-color-desktop': blockTitleColorDesktop,
            '--widget-title-size-mobile': blockTitleFsMobile,
            '--widget-title-size-tablet': blockTitleFsTablet,
            '--widget-title-size-desktop': blockTitleFsDesktop,
            '--widget-title-border-color-mobile': blockTitleBorderMobile,
            '--widget-title-border-color-tablet': blockTitleBorderTablet,
            '--widget-title-border-color-desktop': blockTitleBorderDesktop,
            overflow: 'visible' // Ensure margins work by not hiding overflow unnecessarily
        } as React.CSSProperties}
    >
        <section 
            id={`hero-shell-${block.id}`}
            className={`relative w-full overflow-hidden ${heightClass}`}
            style={{ 
                borderRadius: hasAnyBox ? innerRadius : effectiveRadius,
                ...aspectRatioStyle
            } as React.CSSProperties}
        >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <Image
            src={imageUrl}
            alt={heroPost.title}
            fill
            quality={90}
            className="object-cover transition-transform duration-700 hover:scale-105"
            priority
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
        >
            <div className="container mx-auto">
                <div className="max-w-3xl text-white">
                {showCategoryAny && heroPost.category && (
                    <span 
                        id={`hero-cat-${block.id}`}
                        className="inline-block font-bold uppercase tracking-wider shadow-sm"
                    >
                    {heroPost.category.name}
                    </span>
                )}
                
                <h2 
                    id={`hero-title-${block.id}`}
                    className="font-bold drop-shadow-md"
                    style={{ fontFamily: 'var(--home-news-title-font, sans-serif)' }}
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
                    <div id={`hero-after-title-${block.id}`}>
                        {showMetaInfoAny && (
                            <div 
                                id={`hero-meta-${block.id}`}
                                className="flex items-center gap-3 font-medium opacity-90"
                                style={{ 
                                    fontFamily: 'var(--home-meta-font, sans-serif)',
                                    fontWeight: 'var(--home-meta-weight, 500)'
                                }}
                            >
                                {showAuthorAny && heroAuthorName && (
                                    <div id={`hero-author-${block.id}`} className="flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[9px] relative overflow-hidden">
                                            {heroAuthorAvatar ? (
                                              <Image src={heroAuthorAvatar} alt={heroAuthorName} fill className="object-cover" sizes="16px" />
                                            ) : (
                                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                                                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                              </svg>
                                            )}
                                        </span>
                                        <span>{heroAuthorName}</span>
                                    </div>
                                )}
                                {showAuthorAny && showDateAny && <span id={`hero-date-separator-${block.id}`} className="w-1 h-1 rounded-full bg-white/50"></span>}
                                {showDateAny && <div id={`hero-date-${block.id}`} className="flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
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
                        {showExcerptAny && hasAnyExcerptContent && (
                            <>
                            <p
                                id={`hero-excerpt-mobile-${block.id}`}
                                className={`hero-excerpt-${block.id} mt-3 max-w-2xl opacity-95`}
                                style={{
                                    fontFamily: 'var(--home-excerpt-font, sans-serif)',
                                    fontWeight: 'var(--home-excerpt-weight, 400)'
                                }}
                            >
                                {heroExcerptMobile}
                            </p>
                            <p
                                id={`hero-excerpt-tablet-${block.id}`}
                                className={`hero-excerpt-${block.id} mt-3 max-w-2xl opacity-95`}
                                style={{
                                    fontFamily: 'var(--home-excerpt-font, sans-serif)',
                                    fontWeight: 'var(--home-excerpt-weight, 400)'
                                }}
                            >
                                {heroExcerptTablet}
                            </p>
                            <p
                                id={`hero-excerpt-desktop-${block.id}`}
                                className={`hero-excerpt-${block.id} mt-3 max-w-2xl opacity-95`}
                                style={{
                                    fontFamily: 'var(--home-excerpt-font, sans-serif)',
                                    fontWeight: 'var(--home-excerpt-weight, 400)'
                                }}
                            >
                                {heroExcerptDesktop}
                            </p>
                            </>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>

        </section>
    </div>
    </>
  );
}
