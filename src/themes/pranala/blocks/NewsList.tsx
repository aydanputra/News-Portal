"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBool } from "./responsive";
import { normalizeLegacyGlobalImageRadius, resolveWidgetRadius } from "./radius";
import { sanitizeCssUrl } from "@/lib/sanitizer";
import { getSingleCategoryArchiveSlug, getSingleTagArchiveSlug } from "@/lib/category-filters";

type NewsListCategory = {
  slug: string;
  name: string;
};

type NewsListFeaturedImage = {
  fileUrl?: string | null;
};

type NewsListAuthor = { name?: string; fullName?: string; avatar?: string; avatarUrl?: string; image?: string; banner?: string } | string;

type NewsListPost = {
  id?: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  image?: string | null;
  publishedAt?: string | Date | null;
  createdAt?: string | Date | null;
  category?: NewsListCategory | null;
  archiveDisplayCategory?: NewsListCategory | null;
  author?: NewsListAuthor | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  featuredImage?: NewsListFeaturedImage | null;
};

type NewsListConfig = {
  title?: string;
  limit?: number;
  offset?: number;
  category?: string;
  categorySlug?: string;
  categorySlugs?: string[] | string;
  excludeCategorySlugs?: string[] | string;
  filterType?: string;
  tagSlug?: string;
  tagSlugs?: string[] | string;
  excludeTagSlugs?: string[] | string;
  sortOrder?: string;
  tabletLimit?: number;
  mobileLimit?: number;
  paginationStyle?: string;
  showImage?: boolean;
  showExcerpt?: boolean;
  showCategory?: boolean;
  showMetaInfo?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  boxColor?: string;
  boxBorderRadius?: string;
  useBox?: boolean | string;
  blockTitleColor?: string;
  mobileBlockTitleColor?: string;
  tabletBlockTitleColor?: string;
  blockTitleFontSize?: number;
  mobileBlockTitleFontSize?: number;
  tabletBlockTitleFontSize?: number;
  blockTitleBorderColor?: string;
  mobileBlockTitleBorderColor?: string;
  tabletBlockTitleBorderColor?: string;
  blockTitleLineHeight?: number | string;
  mobileBlockTitleLineHeight?: number | string;
  tabletBlockTitleLineHeight?: number | string;
  blockTitleMarginBottom?: number;
  mobileBlockTitleMarginBottom?: number;
  tabletBlockTitleMarginBottom?: number;
  blockTitlePaddingBottom?: number;
  mobileBlockTitlePaddingBottom?: number;
  tabletBlockTitlePaddingBottom?: number;
  imageWidth?: string;
  imageHeight?: string;
  imageBorderRadius?: number;
  listContentAlign?: string;
  mobileListContentAlign?: string;
  tabletListContentAlign?: string;
  listRightImageOnly?: boolean;
  contentPaddingTop?: number;
  contentPaddingRight?: number;
  contentPaddingBottom?: number;
  contentPaddingLeft?: number;
  titleColor?: string;
  titleHoverColor?: string;
  titleFontSize?: number;
  titleLineHeight?: number;
  titleFontWeight?: string;
  titleMarginBottom?: number;
  tabletTitleMarginBottom?: number;
  mobileTitleMarginBottom?: number;
  metaColor?: string;
  metaFontSize?: number;
  metaLineHeight?: number;
  metaFontWeight?: string;
  mobileMetaFontWeight?: string;
  tabletMetaFontWeight?: string;
  metaMarginBottom?: number;
  excerptColor?: string;
  excerptFontSize?: number;
  excerptLineHeight?: number;
  excerptFontWeight?: string;
  mobileExcerptFontWeight?: string;
  tabletExcerptFontWeight?: string;
  excerptLength?: number;
  showDivider?: boolean;
  dividerColor?: string;
  dividerThickness?: number;
  categoryTextColor?: string;
  mobileCategoryTextColor?: string;
  tabletCategoryTextColor?: string;
  categoryBgColor?: string;
  mobileCategoryBgColor?: string;
  tabletCategoryBgColor?: string;
  categoryFontSize?: number;
  mobileCategoryFontSize?: number;
  tabletCategoryFontSize?: number;
  categoryBorderRadius?: number;
  mobileCategoryBorderRadius?: number;
  tabletCategoryBorderRadius?: number;
  categoryLabelColor?: string;
  mobileCategoryLabelColor?: string;
  tabletCategoryLabelColor?: string;
  categoryLabelBgColor?: string;
  mobileCategoryLabelBgColor?: string;
  tabletCategoryLabelBgColor?: string;
  categoryLabelFontSize?: number;
  mobileCategoryLabelFontSize?: number;
  tabletCategoryLabelFontSize?: number;
  categoryLabelBorderRadius?: number;
  mobileCategoryLabelBorderRadius?: number;
  tabletCategoryLabelBorderRadius?: number;
  categoryLabelLineHeight?: number;
  mobileCategoryLabelLineHeight?: number;
  tabletCategoryLabelLineHeight?: number;
  categoryLabelPaddingX?: number;
  mobileCategoryLabelPaddingX?: number;
  tabletCategoryLabelPaddingX?: number;
  categoryLabelPaddingY?: number;
  mobileCategoryLabelPaddingY?: number;
  tabletCategoryLabelPaddingY?: number;
  categoryLabelMarginBottom?: number;
  mobileCategoryLabelMarginBottom?: number;
  tabletCategoryLabelMarginBottom?: number;
  loadMoreText?: string;
  loadMorePaddingTop?: number;
  loadMorePaddingRight?: number;
  loadMorePaddingBottom?: number;
  loadMorePaddingLeft?: number;
  paginationTextColor?: string;
  paginationHoverTextColor?: string;
  paginationBgColor?: string;
  paginationHoverBgColor?: string;
  paginationBorderColor?: string;
  paginationHoverBorderColor?: string;
  [key: string]: unknown;
};

interface NewsListProps {
  block: {
    id: string;
    config?: NewsListConfig;
  };
  posts: NewsListPost[];
  customTitle?: string;
  accentColor?: string;
  borderRadius?: string;
  previewDevice?: "desktop" | "tablet" | "mobile";
}

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

const normalizeSlugList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => Boolean(item) && item.toLowerCase() !== "all");
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => Boolean(item) && item.toLowerCase() !== "all");
  }
  return [];
};

export default function NewsList({ block, posts, customTitle, accentColor, borderRadius, previewDevice }: NewsListProps) {
  const { config } = block;
  const cfg = useMemo<NewsListConfig>(() => config || {}, [config]);
  const title = customTitle || config?.title || "Berita Terbaru";
  const effectiveAccent = accentColor || 'var(--accent)';
  const effectiveRadius = 'var(--global-image-radius, var(--home-main-box-radius, 0.75rem))';

  const normalizeColor = (value: unknown, fallback: string) => {
    if (typeof value !== "string") return fallback;
    const v = value.trim().toLowerCase();
    if (!v) return fallback;
    if (v === "#fff" || v === "#ffffff" || v === "white") return fallback;
    if (v === "#f9fafb" || v === "#f3f4f6" || v === "#f5f5f5") return fallback;
    return value;
  };

  const toNumberOrUndefined = (val: unknown) => {
    if (typeof val === 'number' && Number.isFinite(val)) return val;
    if (typeof val === 'string' && val.trim() !== '') {
      const n = Number(val);
      if (Number.isFinite(n)) return n;
    }
    return undefined;
  };

  const normalizeAvatarUrl = (value: unknown) => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (trimmed.startsWith('/')) return trimmed;
    return `/${trimmed}`;
  };

  const normalizeAlign = (value: unknown): "left" | "center" | "right" => {
    if (value === "center" || value === "right") return value;
    return "left";
  };

  const normalizeVerticalAlign = (value: unknown): "top" | "center" | "bottom" => {
    if (value === "center" || value === "bottom") return value;
    return "top";
  };

  const getRadius = (r: string) => {
    switch (r) {
      case 'none': return '0';
      case 'sm': return '0.125rem';
      case 'md': return '0.375rem';
      case 'lg': return '0.5rem';
      case 'xl': return '0.75rem';
      case '2xl': return '1rem';
      case 'default': return effectiveRadius;
      default: return effectiveRadius;
    }
  };

  const formatSize = (val: unknown, fallback: string) => {
    if (val === undefined || val === null || String(val).trim() === '') return fallback;
    const str = String(val).trim();
    if (/^\d+$/.test(str)) return `${str}px`;
    return str;
  };

  const parseAspectRatio = (val: unknown) => {
    if (val === undefined || val === null) return undefined;
    const str = String(val).trim();
    if (!str) return undefined;
    const candidate = str.includes(':') ? str.replace(':', '/') : str;
    if (!candidate.includes('/')) return undefined;
    const [w, h] = candidate.split('/').map((x) => Number(String(x).trim()));
    if (!w || !h) return undefined;
    return `${w}/${h}`;
  };

  const baseLimit = Number(cfg.limit) || 6;
  const tabletLimit = Number(cfg.tabletLimit) || baseLimit;
  const mobileLimit = Number(cfg.mobileLimit) || baseLimit;
  const offset = Math.max(0, Number(cfg.offset) || 0);
  const paginationStyle = cfg.paginationStyle || "none";

  const archiveLink = useMemo(() => {
    const filterType = cfg.filterType || "category";
    const tagSlug = getSingleTagArchiveSlug(cfg as Record<string, unknown>) || cfg.tagSlug;
    if (filterType === "tag" && tagSlug) return `/tag/${tagSlug}`;
    const categorySlug = getSingleCategoryArchiveSlug(cfg as Record<string, unknown>) || cfg.categorySlug || cfg.category;
    if (categorySlug && categorySlug !== "all") return `/category/${categorySlug}`;
    return null;
  }, [cfg]);

  const isTruthy = (val: unknown) => val === true || val === 'true';
  const useBoxMobile = isTruthy(cfg.mobileUseBox ?? cfg.useBox);
  const useBoxTablet = isTruthy(cfg.tabletUseBox ?? cfg.useBox ?? cfg.mobileUseBox);
  const useBoxDesktop = isTruthy(cfg.useBox ?? cfg.tabletUseBox ?? cfg.mobileUseBox);

  const boxColorMobile = normalizeColor(cfg.mobileBoxColor ?? cfg.boxColor, 'transparent');
  const boxColorTablet = normalizeColor(cfg.tabletBoxColor ?? cfg.boxColor ?? cfg.mobileBoxColor, 'transparent');
  const boxColorDesktop = normalizeColor(cfg.boxColor ?? cfg.tabletBoxColor ?? cfg.mobileBoxColor, 'transparent');
  const boxBgImageDesktop = sanitizeCssUrl(typeof cfg.backgroundImage === "string" ? cfg.backgroundImage : "");
  const boxBgImageTablet = sanitizeCssUrl(
    typeof cfg.tabletBackgroundImage === "string" && cfg.tabletBackgroundImage.trim() !== "" ? cfg.tabletBackgroundImage : boxBgImageDesktop
  );
  const boxBgImageMobile = sanitizeCssUrl(
    typeof cfg.mobileBackgroundImage === "string" && cfg.mobileBackgroundImage.trim() !== "" ? cfg.mobileBackgroundImage : boxBgImageDesktop
  );
  const boxBgSizeDesktop = typeof (cfg as any).backgroundSize === 'string' && (cfg as any).backgroundSize.trim() !== '' ? (cfg as any).backgroundSize : 'cover';
  const boxBgSizeTablet = typeof (cfg as any).tabletBackgroundSize === 'string' && (cfg as any).tabletBackgroundSize.trim() !== '' ? (cfg as any).tabletBackgroundSize : boxBgSizeDesktop;
  const boxBgSizeMobile = typeof (cfg as any).mobileBackgroundSize === 'string' && (cfg as any).mobileBackgroundSize.trim() !== '' ? (cfg as any).mobileBackgroundSize : boxBgSizeDesktop;
  const boxBgPositionDesktop = typeof (cfg as any).backgroundPosition === 'string' && (cfg as any).backgroundPosition.trim() !== '' ? (cfg as any).backgroundPosition : 'center';
  const boxBgPositionTablet = typeof (cfg as any).tabletBackgroundPosition === 'string' && (cfg as any).tabletBackgroundPosition.trim() !== '' ? (cfg as any).tabletBackgroundPosition : boxBgPositionDesktop;
  const boxBgPositionMobile = typeof (cfg as any).mobileBackgroundPosition === 'string' && (cfg as any).mobileBackgroundPosition.trim() !== '' ? (cfg as any).mobileBackgroundPosition : boxBgPositionDesktop;
  const boxBgRepeatDesktop = typeof (cfg as any).backgroundRepeat === 'string' && (cfg as any).backgroundRepeat.trim() !== '' ? (cfg as any).backgroundRepeat : 'no-repeat';
  const boxBgRepeatTablet = typeof (cfg as any).tabletBackgroundRepeat === 'string' && (cfg as any).tabletBackgroundRepeat.trim() !== '' ? (cfg as any).tabletBackgroundRepeat : boxBgRepeatDesktop;
  const boxBgRepeatMobile = typeof (cfg as any).mobileBackgroundRepeat === 'string' && (cfg as any).mobileBackgroundRepeat.trim() !== '' ? (cfg as any).mobileBackgroundRepeat : boxBgRepeatDesktop;
  const boxBgAttachmentDesktop = typeof (cfg as any).backgroundAttachment === 'string' && (cfg as any).backgroundAttachment.trim() !== '' ? (cfg as any).backgroundAttachment : 'scroll';
  const boxBgAttachmentTablet = typeof (cfg as any).tabletBackgroundAttachment === 'string' && (cfg as any).tabletBackgroundAttachment.trim() !== '' ? (cfg as any).tabletBackgroundAttachment : boxBgAttachmentDesktop;
  const boxBgAttachmentMobile = typeof (cfg as any).mobileBackgroundAttachment === 'string' && (cfg as any).mobileBackgroundAttachment.trim() !== '' ? (cfg as any).mobileBackgroundAttachment : boxBgAttachmentDesktop;
  const boxOverlayColorDesktop = typeof (cfg as any).backgroundOverlayColor === 'string' ? (cfg as any).backgroundOverlayColor : 'transparent';
  const boxOverlayColorTablet = typeof (cfg as any).tabletBackgroundOverlayColor === 'string' && (cfg as any).tabletBackgroundOverlayColor.trim() !== '' ? (cfg as any).tabletBackgroundOverlayColor : boxOverlayColorDesktop;
  const boxOverlayColorMobile = typeof (cfg as any).mobileBackgroundOverlayColor === 'string' && (cfg as any).mobileBackgroundOverlayColor.trim() !== '' ? (cfg as any).mobileBackgroundOverlayColor : boxOverlayColorDesktop;
  const boxOverlayOpacityDesktop = Math.min(100, Math.max(0, Number((cfg as any).backgroundOverlayOpacity ?? 45) || 0));
  const boxOverlayOpacityTablet = Math.min(100, Math.max(0, Number((cfg as any).tabletBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const boxOverlayOpacityMobile = Math.min(100, Math.max(0, Number((cfg as any).mobileBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));

  const boxRadiusKeyMobile = typeof cfg.mobileBoxBorderRadius === 'string' ? cfg.mobileBoxBorderRadius : (typeof cfg.boxBorderRadius === 'string' ? cfg.boxBorderRadius : 'default');
  const boxRadiusKeyTablet = typeof cfg.tabletBoxBorderRadius === 'string' ? cfg.tabletBoxBorderRadius : boxRadiusKeyMobile;
  const boxRadiusKeyDesktop = typeof cfg.boxBorderRadius === 'string' ? cfg.boxBorderRadius : boxRadiusKeyTablet;
  const boxPtMobile = cfg.mobileBoxPaddingTop !== undefined ? `${cfg.mobileBoxPaddingTop}px` : (cfg.boxPaddingTop !== undefined ? `${cfg.boxPaddingTop}px` : '0px');
  const boxPrMobile = cfg.mobileBoxPaddingRight !== undefined ? `${cfg.mobileBoxPaddingRight}px` : (cfg.boxPaddingRight !== undefined ? `${cfg.boxPaddingRight}px` : '0px');
  const boxPbMobile = cfg.mobileBoxPaddingBottom !== undefined ? `${cfg.mobileBoxPaddingBottom}px` : (cfg.boxPaddingBottom !== undefined ? `${cfg.boxPaddingBottom}px` : '0px');
  const boxPlMobile = cfg.mobileBoxPaddingLeft !== undefined ? `${cfg.mobileBoxPaddingLeft}px` : (cfg.boxPaddingLeft !== undefined ? `${cfg.boxPaddingLeft}px` : '0px');
  const boxPtTablet = cfg.tabletBoxPaddingTop !== undefined ? `${cfg.tabletBoxPaddingTop}px` : (cfg.boxPaddingTop !== undefined ? `${cfg.boxPaddingTop}px` : boxPtMobile);
  const boxPrTablet = cfg.tabletBoxPaddingRight !== undefined ? `${cfg.tabletBoxPaddingRight}px` : (cfg.boxPaddingRight !== undefined ? `${cfg.boxPaddingRight}px` : boxPrMobile);
  const boxPbTablet = cfg.tabletBoxPaddingBottom !== undefined ? `${cfg.tabletBoxPaddingBottom}px` : (cfg.boxPaddingBottom !== undefined ? `${cfg.boxPaddingBottom}px` : boxPbMobile);
  const boxPlTablet = cfg.tabletBoxPaddingLeft !== undefined ? `${cfg.tabletBoxPaddingLeft}px` : (cfg.boxPaddingLeft !== undefined ? `${cfg.boxPaddingLeft}px` : boxPlMobile);
  const boxPtDesktop = cfg.boxPaddingTop !== undefined ? `${cfg.boxPaddingTop}px` : boxPtTablet;
  const boxPrDesktop = cfg.boxPaddingRight !== undefined ? `${cfg.boxPaddingRight}px` : boxPrTablet;
  const boxPbDesktop = cfg.boxPaddingBottom !== undefined ? `${cfg.boxPaddingBottom}px` : boxPbTablet;
  const boxPlDesktop = cfg.boxPaddingLeft !== undefined ? `${cfg.boxPaddingLeft}px` : boxPlTablet;

  const containerStyle = {
    '--accent': effectiveAccent,
  } as React.CSSProperties;

  const blockTitleColorMobile = cfg.mobileBlockTitleColor || cfg.blockTitleColor || 'var(--home-widget-title-color, inherit)';
  const blockTitleColorTablet = cfg.tabletBlockTitleColor || blockTitleColorMobile;
  const blockTitleColorDesktop = cfg.blockTitleColor || blockTitleColorTablet;

  const blockTitleBorderColorMobile = cfg.mobileBlockTitleBorderColor || cfg.blockTitleBorderColor || effectiveAccent;
  const blockTitleBorderColorTablet = cfg.tabletBlockTitleBorderColor || blockTitleBorderColorMobile;
  const blockTitleBorderColorDesktop = cfg.blockTitleBorderColor || blockTitleBorderColorTablet;

  const formatFontSize = (val: unknown, fallback: string) => {
    if (val === undefined || val === null) return fallback;
    if (typeof val === 'number' && Number.isFinite(val)) return `${val}px`;
    if (typeof val === 'string') {
      const v = val.trim();
      if (!v) return fallback;
      if (/^\d+(\.\d+)?$/.test(v)) return `${v}px`;
      return v;
    }
    return fallback;
  };

  const blockTitleFsMobile = cfg.mobileBlockTitleFontSize
    ? formatFontSize(cfg.mobileBlockTitleFontSize, 'var(--home-widget-title-size, 1.25rem)')
    : formatFontSize(cfg.blockTitleFontSize, 'var(--home-widget-title-size, 1.25rem)');
  const blockTitleFsTablet = cfg.tabletBlockTitleFontSize
    ? formatFontSize(cfg.tabletBlockTitleFontSize, blockTitleFsMobile)
    : blockTitleFsMobile;
  const blockTitleFsDesktop = cfg.blockTitleFontSize
    ? formatFontSize(cfg.blockTitleFontSize, blockTitleFsTablet)
    : blockTitleFsTablet;
  const blockTitleLhMobile = cfg.mobileBlockTitleLineHeight !== undefined ? String(cfg.mobileBlockTitleLineHeight) : (cfg.blockTitleLineHeight !== undefined ? String(cfg.blockTitleLineHeight) : '1.2');
  const blockTitleLhTablet = cfg.tabletBlockTitleLineHeight !== undefined ? String(cfg.tabletBlockTitleLineHeight) : (cfg.blockTitleLineHeight !== undefined ? String(cfg.blockTitleLineHeight) : blockTitleLhMobile);
  const blockTitleLhDesktop = cfg.blockTitleLineHeight !== undefined ? String(cfg.blockTitleLineHeight) : blockTitleLhTablet;
  const blockTitleMbMobile = cfg.mobileBlockTitleMarginBottom !== undefined ? `${cfg.mobileBlockTitleMarginBottom}px` : (cfg.blockTitleMarginBottom !== undefined ? `${cfg.blockTitleMarginBottom}px` : '12px');
  const blockTitleMbTablet = cfg.tabletBlockTitleMarginBottom !== undefined ? `${cfg.tabletBlockTitleMarginBottom}px` : (cfg.blockTitleMarginBottom !== undefined ? `${cfg.blockTitleMarginBottom}px` : blockTitleMbMobile);
  const blockTitleMbDesktop = cfg.blockTitleMarginBottom !== undefined ? `${cfg.blockTitleMarginBottom}px` : blockTitleMbTablet;
  const blockTitlePbMobile = cfg.mobileBlockTitlePaddingBottom !== undefined ? `${cfg.mobileBlockTitlePaddingBottom}px` : (cfg.blockTitlePaddingBottom !== undefined ? `${cfg.blockTitlePaddingBottom}px` : '12px');
  const blockTitlePbTablet = cfg.tabletBlockTitlePaddingBottom !== undefined ? `${cfg.tabletBlockTitlePaddingBottom}px` : (cfg.blockTitlePaddingBottom !== undefined ? `${cfg.blockTitlePaddingBottom}px` : blockTitlePbMobile);
  const blockTitlePbDesktop = cfg.blockTitlePaddingBottom !== undefined ? `${cfg.blockTitlePaddingBottom}px` : blockTitlePbTablet;

  Object.assign(containerStyle, {
    '--widget-title-size-mobile': blockTitleFsMobile,
    '--widget-title-size-tablet': blockTitleFsTablet,
    '--widget-title-size-desktop': blockTitleFsDesktop,
    '--widget-title-color-mobile': blockTitleColorMobile,
    '--widget-title-color-tablet': blockTitleColorTablet,
    '--widget-title-color-desktop': blockTitleColorDesktop,
    '--widget-title-border-color-mobile': blockTitleBorderColorMobile,
    '--widget-title-border-color-tablet': blockTitleBorderColorTablet,
    '--widget-title-border-color-desktop': blockTitleBorderColorDesktop,
  });

  const normalizeFontWeight = (value: unknown, fallback: string) => {
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    if (typeof value !== 'string') return fallback;
    const v = value.trim().toLowerCase();
    if (!v) return fallback;
    if (/^\d{3}$/.test(v)) return v;
    const map: Record<string, string> = {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    };
    return map[v] || fallback;
  };
  const titleFontWeightDesktop = normalizeFontWeight(cfg.titleFontWeight, 'var(--home-news-title-weight, 600)');
  const titleFontWeightTablet = normalizeFontWeight(cfg.tabletTitleFontWeight, titleFontWeightDesktop);
  const titleFontWeightMobile = normalizeFontWeight(cfg.mobileTitleFontWeight, titleFontWeightDesktop);

  const titleFsMobile = cfg.mobileTitleFontSize ? `${cfg.mobileTitleFontSize}px` : (cfg.titleFontSize ? `${cfg.titleFontSize}px` : 'var(--home-news-title-size, 1rem)');
  const titleFsTablet = cfg.tabletTitleFontSize ? `${cfg.tabletTitleFontSize}px` : titleFsMobile;
  const titleFsDesktop = cfg.titleFontSize ? `${cfg.titleFontSize}px` : titleFsTablet;

  const titleLhMobile = toNumberOrUndefined(cfg.mobileTitleLineHeight) ?? toNumberOrUndefined(cfg.titleLineHeight) ?? 1.3;
  const titleLhTablet = toNumberOrUndefined(cfg.tabletTitleLineHeight) ?? titleLhMobile;
  const titleLhDesktop = toNumberOrUndefined(cfg.titleLineHeight) ?? titleLhTablet;
  const titleMbMobile = cfg.mobileTitleMarginBottom !== undefined ? `${cfg.mobileTitleMarginBottom}px` : (cfg.titleMarginBottom !== undefined ? `${cfg.titleMarginBottom}px` : '0.375rem');
  const titleMbTablet = cfg.tabletTitleMarginBottom !== undefined ? `${cfg.tabletTitleMarginBottom}px` : titleMbMobile;
  const titleMbDesktop = cfg.titleMarginBottom !== undefined ? `${cfg.titleMarginBottom}px` : titleMbTablet;

  const titleColorMobile = cfg.mobileTitleColor || cfg.titleColor || 'var(--home-news-title-color, #111827)';
  const titleColorTablet = cfg.tabletTitleColor || titleColorMobile;
  const titleColorDesktop = cfg.titleColor || titleColorTablet;

  const titleHoverColorMobile = cfg.mobileTitleHoverColor || cfg.titleHoverColor || 'var(--home-hover-color, var(--accent))';
  const titleHoverColorTablet = cfg.tabletTitleHoverColor || titleHoverColorMobile;
  const titleHoverColorDesktop = cfg.titleHoverColor || titleHoverColorTablet;

  const metaFsMobile = cfg.mobileMetaFontSize ? `${cfg.mobileMetaFontSize}px` : (cfg.metaFontSize ? `${cfg.metaFontSize}px` : 'var(--home-meta-size, 0.75rem)');
  const metaFsTablet = cfg.tabletMetaFontSize ? `${cfg.tabletMetaFontSize}px` : metaFsMobile;
  const metaFsDesktop = cfg.metaFontSize ? `${cfg.metaFontSize}px` : metaFsTablet;

  const metaColorMobile = cfg.mobileMetaColor || cfg.metaColor || 'var(--home-meta-color, #9ca3af)';
  const metaColorTablet = cfg.tabletMetaColor || metaColorMobile;
  const metaColorDesktop = cfg.metaColor || metaColorTablet;
  const metaFontWeightMobile = normalizeFontWeight(cfg.mobileMetaFontWeight, normalizeFontWeight(cfg.metaFontWeight, 'var(--home-meta-weight, 500)'));
  const metaFontWeightTablet = normalizeFontWeight(cfg.tabletMetaFontWeight, metaFontWeightMobile);
  const metaFontWeightDesktop = normalizeFontWeight(cfg.metaFontWeight, metaFontWeightTablet);

  const excerptFsMobile = cfg.mobileExcerptFontSize ? `${cfg.mobileExcerptFontSize}px` : (cfg.excerptFontSize ? `${cfg.excerptFontSize}px` : 'var(--home-excerpt-size, 0.875rem)');
  const excerptFsTablet = cfg.tabletExcerptFontSize ? `${cfg.tabletExcerptFontSize}px` : excerptFsMobile;
  const excerptFsDesktop = cfg.excerptFontSize ? `${cfg.excerptFontSize}px` : excerptFsTablet;
  const excerptLhMobile = toNumberOrUndefined(cfg.mobileExcerptLineHeight) ?? toNumberOrUndefined(cfg.excerptLineHeight) ?? 1.625;
  const excerptLhTablet = toNumberOrUndefined(cfg.tabletExcerptLineHeight) ?? excerptLhMobile;
  const excerptLhDesktop = toNumberOrUndefined(cfg.excerptLineHeight) ?? excerptLhTablet;
  const excerptFontWeightMobile = normalizeFontWeight(cfg.mobileExcerptFontWeight, normalizeFontWeight(cfg.excerptFontWeight, 'var(--home-excerpt-weight, 400)'));
  const excerptFontWeightTablet = normalizeFontWeight(cfg.tabletExcerptFontWeight, excerptFontWeightMobile);
  const excerptFontWeightDesktop = normalizeFontWeight(cfg.excerptFontWeight, excerptFontWeightTablet);

  const excerptColorMobile = cfg.mobileExcerptColor || cfg.excerptColor || 'var(--home-excerpt-color, #4b5563)';
  const excerptColorTablet = cfg.tabletExcerptColor || excerptColorMobile;
  const excerptColorDesktop = cfg.excerptColor || excerptColorTablet;

  const asNonEmptyString = (val: unknown, fallback: string) =>
    (typeof val === 'string' && val.trim() !== '') ? val : fallback;

  const dividerFallback = 'color-mix(in srgb, var(--border-strong, rgba(148, 163, 184, 0.35)) 72%, transparent)';
  const dividerColorMobile = asNonEmptyString(cfg.mobileDividerColor, asNonEmptyString(cfg.dividerColor, dividerFallback));
  const dividerColorTablet = asNonEmptyString(cfg.tabletDividerColor, dividerColorMobile);
  const dividerColorDesktop = asNonEmptyString(cfg.dividerColor, dividerColorTablet);
  const dividerThicknessMobile = toNumberOrUndefined(cfg.mobileDividerThickness ?? cfg.dividerThickness) ?? 1;
  const dividerThicknessTablet = toNumberOrUndefined(cfg.tabletDividerThickness ?? cfg.dividerThickness) ?? dividerThicknessMobile;
  const dividerThicknessDesktop = toNumberOrUndefined(cfg.dividerThickness) ?? dividerThicknessTablet;

  const rawWMobile = cfg.mobileImageWidth ?? cfg.imageWidth;
  const rawHMobile = cfg.mobileImageHeight ?? cfg.imageHeight;
  const rawWTablet = cfg.tabletImageWidth ?? cfg.imageWidth;
  const rawHTablet = cfg.tabletImageHeight ?? cfg.imageHeight;
  const rawWDesktop = cfg.imageWidth;
  const rawHDesktop = cfg.imageHeight;

  const ratioMobile = parseAspectRatio(rawWMobile) || parseAspectRatio(rawHMobile);
  const ratioTablet = parseAspectRatio(rawWTablet) || parseAspectRatio(rawHTablet) || ratioMobile;
  const ratioDesktop = parseAspectRatio(rawWDesktop) || parseAspectRatio(rawHDesktop) || ratioTablet;

  const thumbWidthMobile = formatSize(parseAspectRatio(rawWMobile) ? undefined : rawWMobile, '96px');
  const thumbHeightMobile = formatSize(parseAspectRatio(rawHMobile) ? undefined : rawHMobile, '96px');
  const thumbWidthTablet = formatSize(parseAspectRatio(rawWTablet) ? undefined : rawWTablet, thumbWidthMobile);
  const thumbHeightTablet = formatSize(parseAspectRatio(rawHTablet) ? undefined : rawHTablet, thumbHeightMobile);
  const thumbWidthDesktop = formatSize(parseAspectRatio(rawWDesktop) ? undefined : rawWDesktop, thumbWidthTablet);
  const thumbHeightDesktop = formatSize(parseAspectRatio(rawHDesktop) ? undefined : rawHDesktop, thumbHeightTablet);

  const normalizedImageRadiusDesktop = normalizeLegacyGlobalImageRadius(cfg.imageBorderRadius);
  const normalizedImageRadiusTablet = normalizeLegacyGlobalImageRadius(cfg.tabletImageBorderRadius ?? cfg.imageBorderRadius);
  const normalizedImageRadiusMobile = normalizeLegacyGlobalImageRadius(cfg.mobileImageBorderRadius ?? cfg.imageBorderRadius);
  const thumbRadiusDesktop = resolveWidgetRadius(normalizedImageRadiusDesktop, effectiveRadius);
  const thumbRadiusTablet = resolveWidgetRadius(normalizedImageRadiusTablet, thumbRadiusDesktop);
  const thumbRadiusMobile = resolveWidgetRadius(normalizedImageRadiusMobile, thumbRadiusDesktop);

  const cpTopMobile = cfg.mobileContentPaddingTop !== undefined ? `${cfg.mobileContentPaddingTop}px` : (cfg.contentPaddingTop !== undefined ? `${cfg.contentPaddingTop}px` : '0px');
  const cpRightMobile = cfg.mobileContentPaddingRight !== undefined ? `${cfg.mobileContentPaddingRight}px` : (cfg.contentPaddingRight !== undefined ? `${cfg.contentPaddingRight}px` : '0px');
  const cpBottomMobile = cfg.mobileContentPaddingBottom !== undefined ? `${cfg.mobileContentPaddingBottom}px` : (cfg.contentPaddingBottom !== undefined ? `${cfg.contentPaddingBottom}px` : '0px');
  const cpLeftMobile = cfg.mobileContentPaddingLeft !== undefined ? `${cfg.mobileContentPaddingLeft}px` : (cfg.contentPaddingLeft !== undefined ? `${cfg.contentPaddingLeft}px` : '0px');

  const cpTopTablet = cfg.tabletContentPaddingTop !== undefined ? `${cfg.tabletContentPaddingTop}px` : cpTopMobile;
  const cpRightTablet = cfg.tabletContentPaddingRight !== undefined ? `${cfg.tabletContentPaddingRight}px` : cpRightMobile;
  const cpBottomTablet = cfg.tabletContentPaddingBottom !== undefined ? `${cfg.tabletContentPaddingBottom}px` : cpBottomMobile;
  const cpLeftTablet = cfg.tabletContentPaddingLeft !== undefined ? `${cfg.tabletContentPaddingLeft}px` : cpLeftMobile;

  const cpTopDesktop = cfg.contentPaddingTop !== undefined ? `${cfg.contentPaddingTop}px` : cpTopTablet;
  const cpRightDesktop = cfg.contentPaddingRight !== undefined ? `${cfg.contentPaddingRight}px` : cpRightTablet;
  const cpBottomDesktop = cfg.contentPaddingBottom !== undefined ? `${cfg.contentPaddingBottom}px` : cpBottomTablet;
  const cpLeftDesktop = cfg.contentPaddingLeft !== undefined ? `${cfg.contentPaddingLeft}px` : cpLeftTablet;

  const mTopMobile = cfg.mobileMarginTop !== undefined ? `${cfg.mobileMarginTop}px` : '0px';
  const mRightMobile = cfg.mobileMarginRight !== undefined ? `${cfg.mobileMarginRight}px` : '0px';
  const mBottomMobile = cfg.mobileMarginBottom !== undefined ? `${cfg.mobileMarginBottom}px` : '0px';
  const mLeftMobile = cfg.mobileMarginLeft !== undefined ? `${cfg.mobileMarginLeft}px` : '0px';

  const mTopTablet = cfg.tabletMarginTop !== undefined ? `${cfg.tabletMarginTop}px` : mTopMobile;
  const mRightTablet = cfg.tabletMarginRight !== undefined ? `${cfg.tabletMarginRight}px` : mRightMobile;
  const mBottomTablet = cfg.tabletMarginBottom !== undefined ? `${cfg.tabletMarginBottom}px` : mBottomMobile;
  const mLeftTablet = cfg.tabletMarginLeft !== undefined ? `${cfg.tabletMarginLeft}px` : mLeftMobile;

  const mTopDesktop = cfg.marginTop !== undefined ? `${cfg.marginTop}px` : mTopTablet;
  const mRightDesktop = cfg.marginRight !== undefined ? `${cfg.marginRight}px` : mRightTablet;
  const mBottomDesktop = cfg.marginBottom !== undefined ? `${cfg.marginBottom}px` : mBottomTablet;
  const mLeftDesktop = cfg.marginLeft !== undefined ? `${cfg.marginLeft}px` : mLeftTablet;

  const pTopMobile = cfg.mobilePaddingTop !== undefined ? `${cfg.mobilePaddingTop}px` : '0px';
  const pRightMobile = cfg.mobilePaddingRight !== undefined ? `${cfg.mobilePaddingRight}px` : '0px';
  const pBottomMobile = cfg.mobilePaddingBottom !== undefined ? `${cfg.mobilePaddingBottom}px` : '0px';
  const pLeftMobile = cfg.mobilePaddingLeft !== undefined ? `${cfg.mobilePaddingLeft}px` : '0px';

  const pTopTablet = cfg.tabletPaddingTop !== undefined ? `${cfg.tabletPaddingTop}px` : pTopMobile;
  const pRightTablet = cfg.tabletPaddingRight !== undefined ? `${cfg.tabletPaddingRight}px` : pRightMobile;
  const pBottomTablet = cfg.tabletPaddingBottom !== undefined ? `${cfg.tabletPaddingBottom}px` : pBottomMobile;
  const pLeftTablet = cfg.tabletPaddingLeft !== undefined ? `${cfg.tabletPaddingLeft}px` : pLeftMobile;

  const pTopDesktop = cfg.paddingTop !== undefined ? `${cfg.paddingTop}px` : pTopTablet;
  const pRightDesktop = cfg.paddingRight !== undefined ? `${cfg.paddingRight}px` : pRightTablet;
  const pBottomDesktop = cfg.paddingBottom !== undefined ? `${cfg.paddingBottom}px` : pBottomTablet;
  const pLeftDesktop = cfg.paddingLeft !== undefined ? `${cfg.paddingLeft}px` : pLeftTablet;

  const loadMoreTextMobile =
    (typeof cfg.mobileLoadMoreText === 'string' && cfg.mobileLoadMoreText.trim() !== '') ? cfg.mobileLoadMoreText :
    (typeof cfg.loadMoreText === 'string' && cfg.loadMoreText.trim() !== '') ? cfg.loadMoreText :
    "Muat Lebih Banyak";
  const loadMoreTextTablet =
    (typeof cfg.tabletLoadMoreText === 'string' && cfg.tabletLoadMoreText.trim() !== '') ? cfg.tabletLoadMoreText :
    (typeof cfg.loadMoreText === 'string' && cfg.loadMoreText.trim() !== '') ? cfg.loadMoreText :
    loadMoreTextMobile;
  const loadMoreTextDesktop =
    (typeof cfg.loadMoreText === 'string' && cfg.loadMoreText.trim() !== '') ? cfg.loadMoreText :
    loadMoreTextTablet;

  const lmpTopMobile = cfg.mobileLoadMorePaddingTop !== undefined ? `${cfg.mobileLoadMorePaddingTop}px` : (cfg.loadMorePaddingTop !== undefined ? `${cfg.loadMorePaddingTop}px` : '10px');
  const lmpRightMobile = cfg.mobileLoadMorePaddingRight !== undefined ? `${cfg.mobileLoadMorePaddingRight}px` : (cfg.loadMorePaddingRight !== undefined ? `${cfg.loadMorePaddingRight}px` : '14px');
  const lmpBottomMobile = cfg.mobileLoadMorePaddingBottom !== undefined ? `${cfg.mobileLoadMorePaddingBottom}px` : (cfg.loadMorePaddingBottom !== undefined ? `${cfg.loadMorePaddingBottom}px` : '10px');
  const lmpLeftMobile = cfg.mobileLoadMorePaddingLeft !== undefined ? `${cfg.mobileLoadMorePaddingLeft}px` : (cfg.loadMorePaddingLeft !== undefined ? `${cfg.loadMorePaddingLeft}px` : '14px');

  const lmpTopTablet = cfg.tabletLoadMorePaddingTop !== undefined ? `${cfg.tabletLoadMorePaddingTop}px` : lmpTopMobile;
  const lmpRightTablet = cfg.tabletLoadMorePaddingRight !== undefined ? `${cfg.tabletLoadMorePaddingRight}px` : lmpRightMobile;
  const lmpBottomTablet = cfg.tabletLoadMorePaddingBottom !== undefined ? `${cfg.tabletLoadMorePaddingBottom}px` : lmpBottomMobile;
  const lmpLeftTablet = cfg.tabletLoadMorePaddingLeft !== undefined ? `${cfg.tabletLoadMorePaddingLeft}px` : lmpLeftMobile;

  const lmpTopDesktop = cfg.loadMorePaddingTop !== undefined ? `${cfg.loadMorePaddingTop}px` : lmpTopTablet;
  const lmpRightDesktop = cfg.loadMorePaddingRight !== undefined ? `${cfg.loadMorePaddingRight}px` : lmpRightTablet;
  const lmpBottomDesktop = cfg.loadMorePaddingBottom !== undefined ? `${cfg.loadMorePaddingBottom}px` : lmpBottomTablet;
  const lmpLeftDesktop = cfg.loadMorePaddingLeft !== undefined ? `${cfg.loadMorePaddingLeft}px` : lmpLeftTablet;

  const initialPosts = useMemo(() => (posts || []).slice(offset), [posts, offset]);
  const initialBatchSize = Math.max(1, baseLimit, tabletLimit, mobileLimit);
  const [loadedPosts, setLoadedPosts] = useState<NewsListPost[]>(initialPosts);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>(previewDevice || 'desktop');
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMoreRemote, setHasMoreRemote] = useState(
    paginationStyle !== "none" && initialPosts.length >= initialBatchSize
  );

  useEffect(() => {
    if (previewDevice) {
      setDevice(previewDevice);
      return;
    }
    const compute = () => {
      const w = window.innerWidth;
      if (w >= 1024) return 'desktop' as const;
      if (w >= 768) return 'tablet' as const;
      return 'mobile' as const;
    };
    const update = () => setDevice(compute());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [previewDevice]);

  useEffect(() => {
    setLoadedPosts(initialPosts);
    setHasMoreRemote(paginationStyle !== "none" && initialPosts.length >= initialBatchSize);
    setIsFetchingMore(false);
  }, [initialPosts, initialBatchSize, paginationStyle]);

  const getResponsive = (baseKey: string) => {
    if (device === 'mobile') return cfg[`mobile${baseKey.charAt(0).toUpperCase()}${baseKey.slice(1)}`];
    if (device === 'tablet') return cfg[`tablet${baseKey.charAt(0).toUpperCase()}${baseKey.slice(1)}`];
    return cfg[baseKey];
  };

  const getNumberFromValue = (value: unknown, fallback: number) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
  };

  const getStringFromValue = (value: unknown, fallback: string) => {
    if (typeof value === 'string' && value.trim() !== '') return value;
    return fallback;
  };

  const getResponsiveCategoryString = (labelKey: string, legacyKey: string, fallback: string, aliasKey?: string) => {
    const labelVal = getResponsive(labelKey);
    if (typeof labelVal === 'string' && labelVal.trim() !== '') return labelVal;
    if (aliasKey) {
      const aliasVal = getResponsive(aliasKey);
      if (typeof aliasVal === 'string' && aliasVal.trim() !== '') return aliasVal;
    }
    const legacyVal = getResponsive(legacyKey);
    if (typeof legacyVal === 'string' && legacyVal.trim() !== '') return legacyVal;

    const labelBase = cfg[labelKey];
    if (typeof labelBase === 'string' && labelBase.trim() !== '') return labelBase;
    if (aliasKey) {
      const aliasBase = (cfg as any)[aliasKey];
      if (typeof aliasBase === 'string' && aliasBase.trim() !== '') return aliasBase;
    }
    const legacyBase = cfg[legacyKey];
    if (typeof legacyBase === 'string' && legacyBase.trim() !== '') return legacyBase;

    return fallback;
  };

  const getResponsiveCategoryNumber = (labelKey: string, legacyKey: string, fallback: number) => {
    const labelVal = getResponsive(labelKey);
    const labelNumber = typeof labelVal === 'number' ? labelVal : (typeof labelVal === 'string' ? Number(labelVal) : NaN);
    if (Number.isFinite(labelNumber)) return labelNumber;

    const legacyVal = getResponsive(legacyKey);
    const legacyNumber = typeof legacyVal === 'number' ? legacyVal : (typeof legacyVal === 'string' ? Number(legacyVal) : NaN);
    if (Number.isFinite(legacyNumber)) return legacyNumber;

    const labelBase = cfg[labelKey];
    const labelBaseNumber = typeof labelBase === 'number' ? labelBase : (typeof labelBase === 'string' ? Number(labelBase) : NaN);
    if (Number.isFinite(labelBaseNumber)) return labelBaseNumber;

    const legacyBase = cfg[legacyKey];
    const legacyBaseNumber = typeof legacyBase === 'number' ? legacyBase : (typeof legacyBase === 'string' ? Number(legacyBase) : NaN);
    if (Number.isFinite(legacyBaseNumber)) return legacyBaseNumber;

    return fallback;
  };

  useEffect(() => {
    setPage(1);
  }, [paginationStyle, device, baseLimit, tabletLimit, mobileLimit, offset, cfg.categorySlug, cfg.categorySlugs, cfg.excludeCategorySlugs, cfg.tagSlug, cfg.tagSlugs, cfg.excludeTagSlugs, cfg.sortOrder]);

  const pageSize = device === 'mobile' ? mobileLimit : (device === 'tablet' ? tabletLimit : baseLimit);
  const allPosts = loadedPosts;
  const totalPages = Math.max(1, Math.ceil(allPosts.length / pageSize));
  const categorySlugs = useMemo(
    () => normalizeSlugList(cfg.categorySlugs ?? cfg.categorySlug ?? cfg.category),
    [cfg.category, cfg.categorySlug, cfg.categorySlugs]
  );
  const excludeCategorySlugs = useMemo(
    () => normalizeSlugList(cfg.excludeCategorySlugs),
    [cfg.excludeCategorySlugs]
  );
  const tagSlugs = useMemo(
    () => normalizeSlugList(cfg.tagSlugs ?? cfg.tagSlug),
    [cfg.tagSlug, cfg.tagSlugs]
  );
  const excludeTagSlugs = useMemo(
    () => normalizeSlugList(cfg.excludeTagSlugs),
    [cfg.excludeTagSlugs]
  );
  const fetchMorePosts = useCallback(
    async (requestedCount?: number) => {
      if (paginationStyle === "none" || isFetchingMore || !hasMoreRemote) return false;

      const requestLimit = Math.max(1, Math.min(30, requestedCount || pageSize));
      const params = new URLSearchParams();
      params.set("limit", String(requestLimit));
      params.set("offset", String(offset + loadedPosts.length));
      params.set("sort", typeof cfg.sortOrder === "string" ? cfg.sortOrder : "latest");

      if (categorySlugs.length > 0) params.set("categories", categorySlugs.join(","));
      if (excludeCategorySlugs.length > 0) params.set("excludeCategories", excludeCategorySlugs.join(","));
      if (tagSlugs.length > 0) params.set("tags", tagSlugs.join(","));
      if (excludeTagSlugs.length > 0) params.set("excludeTags", excludeTagSlugs.join(","));

      setIsFetchingMore(true);
      try {
        const response = await fetch(`/api/public/posts?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return false;
        }

        const payload = await response.json();
        const nextPosts = Array.isArray(payload?.data) ? (payload.data as NewsListPost[]) : [];
        const total = typeof payload?.meta?.total === "number" ? payload.meta.total : null;

        if (nextPosts.length === 0) {
          setHasMoreRemote(false);
          return false;
        }

        const merged = [...loadedPosts];
        const seen = new Set(loadedPosts.map((item) => item.id || item.slug));
        for (const item of nextPosts) {
          const key = item.id || item.slug;
          if (seen.has(key)) continue;
          seen.add(key);
          merged.push(item);
        }

        const combinedLength = merged.length;
        setLoadedPosts(merged);

        if (total !== null) {
          setHasMoreRemote(offset + combinedLength < total);
        } else {
          setHasMoreRemote(nextPosts.length >= requestLimit);
        }

        return combinedLength > loadedPosts.length;
      } finally {
        setIsFetchingMore(false);
      }
    },
    [
      paginationStyle,
      isFetchingMore,
      hasMoreRemote,
      pageSize,
      offset,
      loadedPosts.length,
      cfg.sortOrder,
      categorySlugs,
      excludeCategorySlugs,
      tagSlugs,
      excludeTagSlugs,
    ]
  );

  const ensurePageLoaded = useCallback(
    async (targetPage: number) => {
      const requiredCount = targetPage * pageSize;
      if (requiredCount <= loadedPosts.length) return true;
      return fetchMorePosts(requiredCount - loadedPosts.length);
    },
    [fetchMorePosts, loadedPosts.length, pageSize]
  );

  const visiblePosts = useMemo(() => {
    if (paginationStyle === 'next_prev') {
      const start = (page - 1) * pageSize;
      return allPosts.slice(start, start + pageSize);
    }
    if (paginationStyle === 'load_more' || paginationStyle === 'auto_load') {
      return allPosts.slice(0, page * pageSize);
    }
    return allPosts.slice(0, pageSize);
  }, [allPosts, page, pageSize, paginationStyle]);

  useEffect(() => {
    if (paginationStyle !== 'auto_load') return;
    if (!sentinelRef.current) return;

    const el = sentinelRef.current;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting || isFetchingMore) return;
      void (async () => {
        const nextPage = page + 1;
        const ready = await ensurePageLoaded(nextPage);
        if (!ready) return;
        setPage((prev) => Math.max(prev, nextPage));
      })();
    }, { rootMargin: '200px 0px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, [paginationStyle, page, ensurePageLoaded, isFetchingMore]);

  const configRecord = cfg as Record<string, unknown>;
  const excerptLengthMobile = getNumberFromValue(cfg.mobileExcerptLength ?? cfg.excerptLength, 120);
  const excerptLengthTablet = getNumberFromValue(cfg.tabletExcerptLength ?? cfg.excerptLength, excerptLengthMobile);
  const excerptLengthDesktop = getNumberFromValue(cfg.excerptLength, excerptLengthTablet);
  const showExcerptFallback = typeof cfg.showExcerpt === 'boolean' ? cfg.showExcerpt : false;
  const showImageFallback = typeof cfg.showImage === 'boolean' ? cfg.showImage : true;
  const showImageMobile = getResponsiveBool(configRecord, "showImage", "mobile", showImageFallback);
  const showImageTablet = getResponsiveBool(configRecord, "showImage", "tablet", showImageFallback);
  const showImageDesktop = getResponsiveBool(configRecord, "showImage", "desktop", showImageFallback);
  const showExcerptMobile = getResponsiveBool(configRecord, "showExcerpt", "mobile", showExcerptFallback);
  const showExcerptTablet = getResponsiveBool(configRecord, "showExcerpt", "tablet", showExcerptFallback);
  const showExcerptDesktop = getResponsiveBool(configRecord, "showExcerpt", "desktop", showExcerptFallback);
  const showMetaMobile = getResponsiveBool(configRecord, "showMetaInfo", "mobile", getResponsiveBool(configRecord, "showMeta", "mobile", true));
  const showMetaTablet = getResponsiveBool(configRecord, "showMetaInfo", "tablet", getResponsiveBool(configRecord, "showMeta", "tablet", true));
  const showMetaDesktop = getResponsiveBool(configRecord, "showMetaInfo", "desktop", getResponsiveBool(configRecord, "showMeta", "desktop", true));
  const showCategoryDesktop = getResponsiveBool(configRecord, "showCategory", "desktop", true);
  const showCategoryTablet = getResponsiveBool(configRecord, "showCategory", "tablet", true);
  const showCategoryMobile = getResponsiveBool(configRecord, "showCategory", "mobile", true);
  const showAuthorDesktop = getResponsiveBool(configRecord, "showAuthor", "desktop", true);
  const showAuthorTablet = getResponsiveBool(configRecord, "showAuthor", "tablet", true);
  const showAuthorMobile = getResponsiveBool(configRecord, "showAuthor", "mobile", true);
  const showDateDesktop = getResponsiveBool(configRecord, "showDate", "desktop", true);
  const showDateTablet = getResponsiveBool(configRecord, "showDate", "tablet", true);
  const showDateMobile = getResponsiveBool(configRecord, "showDate", "mobile", true);
  const showDividerDesktop = getResponsiveBool(configRecord, "showDivider", "desktop", true);
  const showDividerTablet = getResponsiveBool(configRecord, "showDivider", "tablet", true);
  const showDividerMobile = getResponsiveBool(configRecord, "showDivider", "mobile", true);
  const metaLineHeightMobile = getNumberFromValue(cfg.mobileMetaLineHeight ?? cfg.metaLineHeight, 1.5);
  const metaLineHeightTablet = getNumberFromValue(cfg.tabletMetaLineHeight ?? cfg.metaLineHeight, metaLineHeightMobile);
  const metaLineHeightDesktop = getNumberFromValue(cfg.metaLineHeight, metaLineHeightTablet);
  const metaMarginBottomMobile = getNumberFromValue(cfg.mobileMetaMarginBottom ?? cfg.metaMarginBottom, 0);
  const metaMarginBottomTablet = getNumberFromValue(cfg.tabletMetaMarginBottom ?? cfg.metaMarginBottom, metaMarginBottomMobile);
  const metaMarginBottomDesktop = getNumberFromValue(cfg.metaMarginBottom, metaMarginBottomTablet);
  const categoryPaddingXMobile = getNumberFromValue(cfg.mobileCategoryLabelPaddingX ?? cfg.categoryLabelPaddingX, 10);
  const categoryPaddingYMobile = getNumberFromValue(cfg.mobileCategoryLabelPaddingY ?? cfg.categoryLabelPaddingY, 2);
  const categoryPaddingXTablet = getNumberFromValue(cfg.tabletCategoryLabelPaddingX ?? cfg.categoryLabelPaddingX, categoryPaddingXMobile);
  const categoryPaddingYTablet = getNumberFromValue(cfg.tabletCategoryLabelPaddingY ?? cfg.categoryLabelPaddingY, categoryPaddingYMobile);
  const categoryPaddingXDesktop = getNumberFromValue(cfg.categoryLabelPaddingX, categoryPaddingXTablet);
  const categoryPaddingYDesktop = getNumberFromValue(cfg.categoryLabelPaddingY, categoryPaddingYTablet);
  const categoryMarginBottomMobile = getNumberFromValue(cfg.mobileCategoryLabelMarginBottom ?? cfg.categoryLabelMarginBottom, 6);
  const categoryMarginBottomTablet = getNumberFromValue(cfg.tabletCategoryLabelMarginBottom ?? cfg.categoryLabelMarginBottom, categoryMarginBottomMobile);
  const categoryMarginBottomDesktop = getNumberFromValue(cfg.categoryLabelMarginBottom, categoryMarginBottomTablet);
  const paginationTextColorMobile = normalizeColor(getStringFromValue(cfg.mobilePaginationTextColor ?? cfg.paginationTextColor, 'var(--load-more-text, var(--accent))'), 'var(--load-more-text, var(--accent))');
  const paginationTextColorTablet = normalizeColor(getStringFromValue(cfg.tabletPaginationTextColor ?? cfg.paginationTextColor, paginationTextColorMobile), paginationTextColorMobile);
  const paginationTextColorDesktop = normalizeColor(getStringFromValue(cfg.paginationTextColor, paginationTextColorTablet), paginationTextColorTablet);
  const paginationHoverTextColorMobile = normalizeColor(getStringFromValue(cfg.mobilePaginationHoverTextColor ?? cfg.paginationHoverTextColor, 'var(--load-more-text-hover, #ffffff)'), 'var(--load-more-text-hover, #ffffff)');
  const paginationHoverTextColorTablet = normalizeColor(getStringFromValue(cfg.tabletPaginationHoverTextColor ?? cfg.paginationHoverTextColor, paginationHoverTextColorMobile), paginationHoverTextColorMobile);
  const paginationHoverTextColorDesktop = normalizeColor(getStringFromValue(cfg.paginationHoverTextColor, paginationHoverTextColorTablet), paginationHoverTextColorTablet);
  const paginationBgColorMobile = normalizeColor(getStringFromValue(cfg.mobilePaginationBgColor ?? cfg.paginationBgColor, 'var(--load-more-bg, var(--bg-elevated, #ffffff))'), 'var(--load-more-bg, var(--bg-elevated, #ffffff))');
  const paginationBgColorTablet = normalizeColor(getStringFromValue(cfg.tabletPaginationBgColor ?? cfg.paginationBgColor, paginationBgColorMobile), paginationBgColorMobile);
  const paginationBgColorDesktop = normalizeColor(getStringFromValue(cfg.paginationBgColor, paginationBgColorTablet), paginationBgColorTablet);
  const paginationHoverBgColorMobile = normalizeColor(getStringFromValue(cfg.mobilePaginationHoverBgColor ?? cfg.paginationHoverBgColor, 'var(--load-more-bg-hover, var(--accent))'), 'var(--load-more-bg-hover, var(--accent))');
  const paginationHoverBgColorTablet = normalizeColor(getStringFromValue(cfg.tabletPaginationHoverBgColor ?? cfg.paginationHoverBgColor, paginationHoverBgColorMobile), paginationHoverBgColorMobile);
  const paginationHoverBgColorDesktop = normalizeColor(getStringFromValue(cfg.paginationHoverBgColor, paginationHoverBgColorTablet), paginationHoverBgColorTablet);
  const paginationBorderColorMobile = normalizeColor(getStringFromValue(cfg.mobilePaginationBorderColor ?? cfg.paginationBorderColor, 'var(--load-more-border, var(--border, #e5e7eb))'), 'var(--load-more-border, var(--border, #e5e7eb))');
  const paginationBorderColorTablet = normalizeColor(getStringFromValue(cfg.tabletPaginationBorderColor ?? cfg.paginationBorderColor, paginationBorderColorMobile), paginationBorderColorMobile);
  const paginationBorderColorDesktop = normalizeColor(getStringFromValue(cfg.paginationBorderColor, paginationBorderColorTablet), paginationBorderColorTablet);
  const paginationHoverBorderColorMobile = normalizeColor(getStringFromValue(cfg.mobilePaginationHoverBorderColor ?? cfg.paginationHoverBorderColor, 'var(--load-more-border-hover, var(--accent))'), 'var(--load-more-border-hover, var(--accent))');
  const paginationHoverBorderColorTablet = normalizeColor(getStringFromValue(cfg.tabletPaginationHoverBorderColor ?? cfg.paginationHoverBorderColor, paginationHoverBorderColorMobile), paginationHoverBorderColorMobile);
  const paginationHoverBorderColorDesktop = normalizeColor(getStringFromValue(cfg.paginationHoverBorderColor, paginationHoverBorderColorTablet), paginationHoverBorderColorTablet);

  const buttonStyle = {
    color: device === 'mobile' ? paginationTextColorMobile : (device === 'tablet' ? paginationTextColorTablet : paginationTextColorDesktop),
    backgroundColor: device === 'mobile' ? paginationBgColorMobile : (device === 'tablet' ? paginationBgColorTablet : paginationBgColorDesktop),
    borderColor: device === 'mobile' ? paginationBorderColorMobile : (device === 'tablet' ? paginationBorderColorTablet : paginationBorderColorDesktop),
  } as React.CSSProperties;

  const buttonHoverStyle = {
    color: device === 'mobile' ? paginationHoverTextColorMobile : (device === 'tablet' ? paginationHoverTextColorTablet : paginationHoverTextColorDesktop),
    backgroundColor: device === 'mobile' ? paginationHoverBgColorMobile : (device === 'tablet' ? paginationHoverBgColorTablet : paginationHoverBgColorDesktop),
    borderColor: device === 'mobile' ? paginationHoverBorderColorMobile : (device === 'tablet' ? paginationHoverBorderColorTablet : paginationHoverBorderColorDesktop),
  } as React.CSSProperties;

  const supportsHoverInteraction = () => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  };

  const applyPaginationHoverStyle = (button: HTMLButtonElement) => {
    if (button.disabled || !supportsHoverInteraction()) return;
    Object.assign(button.style, buttonHoverStyle);
  };

  const resetPaginationButtonStyle = (
    button: HTMLButtonElement,
    padding: { top: string; right: string; bottom: string; left: string }
  ) => {
    if (!supportsHoverInteraction()) return;
    Object.assign(button.style, {
      ...buttonStyle,
      paddingTop: padding.top,
      paddingRight: padding.right,
      paddingBottom: padding.bottom,
      paddingLeft: padding.left,
    });
  };
  const currentUseBox = device === 'mobile' ? useBoxMobile : (device === 'tablet' ? useBoxTablet : useBoxDesktop);
  const currentBoxColor = device === 'mobile' ? boxColorMobile : (device === 'tablet' ? boxColorTablet : boxColorDesktop);
  const currentBoxRadius = device === 'mobile' ? getRadius(boxRadiusKeyMobile) : (device === 'tablet' ? getRadius(boxRadiusKeyTablet) : getRadius(boxRadiusKeyDesktop));
  const currentBoxBgImage = device === 'mobile' ? boxBgImageMobile : (device === 'tablet' ? boxBgImageTablet : boxBgImageDesktop);
  const currentBoxBgSize = device === 'mobile' ? boxBgSizeMobile : (device === 'tablet' ? boxBgSizeTablet : boxBgSizeDesktop);
  const currentBoxBgPosition = device === 'mobile' ? boxBgPositionMobile : (device === 'tablet' ? boxBgPositionTablet : boxBgPositionDesktop);
  const currentBoxBgRepeat = device === 'mobile' ? boxBgRepeatMobile : (device === 'tablet' ? boxBgRepeatTablet : boxBgRepeatDesktop);
  const currentBoxBgAttachment = device === 'mobile' ? boxBgAttachmentMobile : (device === 'tablet' ? boxBgAttachmentTablet : boxBgAttachmentDesktop);
  const currentBoxOverlayColor = device === 'mobile' ? boxOverlayColorMobile : (device === 'tablet' ? boxOverlayColorTablet : boxOverlayColorDesktop);
  const currentBoxOverlayOpacity = device === 'mobile' ? boxOverlayOpacityMobile : (device === 'tablet' ? boxOverlayOpacityTablet : boxOverlayOpacityDesktop);
  const hasCurrentBoxOverlay = currentBoxOverlayOpacity > 0 && typeof currentBoxOverlayColor === 'string' && currentBoxOverlayColor.trim() !== '' && currentBoxOverlayColor !== 'transparent';
  const currentBoxOverlayFill = hasCurrentBoxOverlay ? `color-mix(in srgb, ${currentBoxOverlayColor} ${currentBoxOverlayOpacity}%, transparent)` : 'transparent';
  const currentBoxBackgroundImage = currentUseBox && currentBoxBgImage
    ? (hasCurrentBoxOverlay
      ? `linear-gradient(${currentBoxOverlayFill}, ${currentBoxOverlayFill}), url("${currentBoxBgImage}")`
      : `url("${currentBoxBgImage}")`)
    : 'none';
  const currentBoxPt = device === 'mobile' ? boxPtMobile : (device === 'tablet' ? boxPtTablet : boxPtDesktop);
  const currentBoxPr = device === 'mobile' ? boxPrMobile : (device === 'tablet' ? boxPrTablet : boxPrDesktop);
  const currentBoxPb = device === 'mobile' ? boxPbMobile : (device === 'tablet' ? boxPbTablet : boxPbDesktop);
  const currentBoxPl = device === 'mobile' ? boxPlMobile : (device === 'tablet' ? boxPlTablet : boxPlDesktop);
  const currentTitleFs = device === 'mobile' ? titleFsMobile : (device === 'tablet' ? titleFsTablet : titleFsDesktop);
  const currentTitleLh = device === 'mobile' ? titleLhMobile : (device === 'tablet' ? titleLhTablet : titleLhDesktop);
  const currentTitleFontWeight = device === 'mobile' ? titleFontWeightMobile : (device === 'tablet' ? titleFontWeightTablet : titleFontWeightDesktop);
  const currentTitleMb = device === 'mobile' ? titleMbMobile : (device === 'tablet' ? titleMbTablet : titleMbDesktop);
  const currentTitleColor = device === 'mobile' ? titleColorMobile : (device === 'tablet' ? titleColorTablet : titleColorDesktop);
  const currentTitleHoverColor = device === 'mobile' ? titleHoverColorMobile : (device === 'tablet' ? titleHoverColorTablet : titleHoverColorDesktop);
  const listAlignMobile = normalizeAlign(cfg.mobileListContentAlign ?? cfg.listContentAlign);
  const listAlignTablet = normalizeAlign(cfg.tabletListContentAlign ?? cfg.listContentAlign);
  const listAlignDesktop = normalizeAlign(cfg.listContentAlign);
  const currentListAlign = device === 'mobile' ? listAlignMobile : (device === 'tablet' ? listAlignTablet : listAlignDesktop);
  const listRightImageOnly = cfg.listRightImageOnly === true;
  const isCenterAligned = currentListAlign === 'center';
  const isRightAligned = currentListAlign === 'right';
  const shouldReverseImageOnly = listRightImageOnly && isRightAligned && !isCenterAligned;
  const verticalAlignMobile = normalizeVerticalAlign(cfg.mobileVerticalAlign ?? cfg.verticalAlign);
  const verticalAlignTablet = normalizeVerticalAlign(cfg.tabletVerticalAlign ?? cfg.verticalAlign);
  const verticalAlignDesktop = normalizeVerticalAlign(cfg.verticalAlign);
  const currentVerticalAlign = device === 'mobile' ? verticalAlignMobile : (device === 'tablet' ? verticalAlignTablet : verticalAlignDesktop);
  const currentCrossAlign = isCenterAligned ? 'center' : (isRightAligned && !shouldReverseImageOnly) ? 'flex-end' : 'flex-start';
  const currentVerticalCrossAlign = currentVerticalAlign === 'center' ? 'center' : currentVerticalAlign === 'bottom' ? 'flex-end' : 'flex-start';
  const currentTextAlign = isCenterAligned ? 'center' : (isRightAligned && !shouldReverseImageOnly) ? 'right' : 'left';
  const currentJustifyAlign = isCenterAligned ? 'center' : (isRightAligned && !shouldReverseImageOnly) ? 'flex-end' : 'flex-start';
  const currentMetaFs = device === 'mobile' ? metaFsMobile : (device === 'tablet' ? metaFsTablet : metaFsDesktop);
  const currentMetaColor = device === 'mobile' ? metaColorMobile : (device === 'tablet' ? metaColorTablet : metaColorDesktop);
  const currentMetaLineHeight = device === 'mobile' ? metaLineHeightMobile : (device === 'tablet' ? metaLineHeightTablet : metaLineHeightDesktop);
  const currentMetaFontWeight = device === 'mobile' ? metaFontWeightMobile : (device === 'tablet' ? metaFontWeightTablet : metaFontWeightDesktop);
  const currentMetaMarginBottom = device === 'mobile' ? metaMarginBottomMobile : (device === 'tablet' ? metaMarginBottomTablet : metaMarginBottomDesktop);
  const currentExcerptFs = device === 'mobile' ? excerptFsMobile : (device === 'tablet' ? excerptFsTablet : excerptFsDesktop);
  const currentExcerptColor = device === 'mobile' ? excerptColorMobile : (device === 'tablet' ? excerptColorTablet : excerptColorDesktop);
  const currentExcerptLh = device === 'mobile' ? excerptLhMobile : (device === 'tablet' ? excerptLhTablet : excerptLhDesktop);
  const currentExcerptFontWeight = device === 'mobile' ? excerptFontWeightMobile : (device === 'tablet' ? excerptFontWeightTablet : excerptFontWeightDesktop);
  const currentExcerptLength = device === 'mobile' ? excerptLengthMobile : (device === 'tablet' ? excerptLengthTablet : excerptLengthDesktop);
  const currentShowImage = device === 'mobile' ? showImageMobile : (device === 'tablet' ? showImageTablet : showImageDesktop);
  const currentShowExcerpt = device === 'mobile' ? showExcerptMobile : (device === 'tablet' ? showExcerptTablet : showExcerptDesktop);
  const currentShowMeta = device === 'mobile' ? showMetaMobile : (device === 'tablet' ? showMetaTablet : showMetaDesktop);
  const currentShowCategory = device === 'mobile' ? showCategoryMobile : (device === 'tablet' ? showCategoryTablet : showCategoryDesktop);
  const currentShowAuthor = device === 'mobile' ? showAuthorMobile : (device === 'tablet' ? showAuthorTablet : showAuthorDesktop);
  const currentShowDate = device === 'mobile' ? showDateMobile : (device === 'tablet' ? showDateTablet : showDateDesktop);
  const currentShowDivider = device === 'mobile' ? showDividerMobile : (device === 'tablet' ? showDividerTablet : showDividerDesktop);
  const currentDividerColor = device === 'mobile' ? dividerColorMobile : (device === 'tablet' ? dividerColorTablet : dividerColorDesktop);
  const currentDividerThickness = device === 'mobile' ? dividerThicknessMobile : (device === 'tablet' ? dividerThicknessTablet : dividerThicknessDesktop);
  const currentThumbWidth = device === 'mobile' ? thumbWidthMobile : (device === 'tablet' ? thumbWidthTablet : thumbWidthDesktop);
  const currentThumbHeight = device === 'mobile' ? thumbHeightMobile : (device === 'tablet' ? thumbHeightTablet : thumbHeightDesktop);
  const currentThumbRatio = device === 'mobile' ? ratioMobile : (device === 'tablet' ? ratioTablet : ratioDesktop);
  const currentThumbRadius = device === 'mobile' ? thumbRadiusMobile : (device === 'tablet' ? thumbRadiusTablet : thumbRadiusDesktop);
  const currentCpTop = device === 'mobile' ? cpTopMobile : (device === 'tablet' ? cpTopTablet : cpTopDesktop);
  const currentCpRight = device === 'mobile' ? cpRightMobile : (device === 'tablet' ? cpRightTablet : cpRightDesktop);
  const currentCpBottom = device === 'mobile' ? cpBottomMobile : (device === 'tablet' ? cpBottomTablet : cpBottomDesktop);
  const currentCpLeft = device === 'mobile' ? cpLeftMobile : (device === 'tablet' ? cpLeftTablet : cpLeftDesktop);
  const currentLoadMoreText = device === 'mobile' ? loadMoreTextMobile : (device === 'tablet' ? loadMoreTextTablet : loadMoreTextDesktop);
  const currentLmpTop = device === 'mobile' ? lmpTopMobile : (device === 'tablet' ? lmpTopTablet : lmpTopDesktop);
  const currentLmpRight = device === 'mobile' ? lmpRightMobile : (device === 'tablet' ? lmpRightTablet : lmpRightDesktop);
  const currentLmpBottom = device === 'mobile' ? lmpBottomMobile : (device === 'tablet' ? lmpBottomTablet : lmpBottomDesktop);
  const currentLmpLeft = device === 'mobile' ? lmpLeftMobile : (device === 'tablet' ? lmpLeftTablet : lmpLeftDesktop);
  const currentBlockTitleLh = device === 'mobile' ? blockTitleLhMobile : (device === 'tablet' ? blockTitleLhTablet : blockTitleLhDesktop);
  const currentBlockTitleMb = device === 'mobile' ? blockTitleMbMobile : (device === 'tablet' ? blockTitleMbTablet : blockTitleMbDesktop);
  const currentBlockTitlePb = device === 'mobile' ? blockTitlePbMobile : (device === 'tablet' ? blockTitlePbTablet : blockTitlePbDesktop);
  const decodeHtmlEntities = (input: string) => {
    return input
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#([0-9]+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  };

  const stripHtml = (input: string) => {
    const withSpaces = input
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/p\s*>/gi, ' ')
      .replace(/<\/div\s*>/gi, ' ')
      .replace(/<\/li\s*>/gi, ' ')
      .replace(/<\/h[1-6]\s*>/gi, ' ')
      .replace(/<\/tr\s*>/gi, ' ')
      .replace(/<\/td\s*>/gi, ' ')
      .replace(/<\/th\s*>/gi, ' ')
      .replace(/<[^>]*>/g, ' ');
    return withSpaces.replace(/\s+/g, ' ').trim();
  };

  const clampExcerpt = (text: unknown) => {
    const strRaw = typeof text === 'string' ? text : '';
    const str = strRaw ? stripHtml(decodeHtmlEntities(strRaw)) : '';
    if (!str) return '';
    if (str.length <= currentExcerptLength) return str;
    return str.slice(0, currentExcerptLength).trimEnd() + '…';
  };

  const removeLeadingSubtitle = (excerptText: string, subtitleText: unknown) => {
    if (typeof subtitleText !== 'string') return excerptText;
    const subtitle = stripHtml(decodeHtmlEntities(subtitleText));
    if (!subtitle) return excerptText;

    const escapedSubtitle = subtitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const leadingSubtitlePattern = new RegExp(`^${escapedSubtitle}(?:\\s*(?:-|:|\\|)\\s*|\\s+)`, 'i');
    const cleaned = excerptText.replace(leadingSubtitlePattern, '').trim();
    return cleaned || excerptText;
  };

  const getDisplayExcerpt = (post: NewsListPost) => {
    const cleanedExcerpt = removeLeadingSubtitle(
      typeof post.excerpt === 'string' ? post.excerpt : '',
      post.subtitle
    );
    const excerptFromExcerpt = stripHtml(decodeHtmlEntities(cleanedExcerpt));
    const excerptFromContent = stripHtml(decodeHtmlEntities(typeof post.content === 'string' ? post.content : ''));
    const excerptRaw = (() => {
      if (!excerptFromContent) return excerptFromExcerpt;
      if (!excerptFromExcerpt) return excerptFromContent;
      return excerptFromExcerpt.length >= currentExcerptLength ? excerptFromExcerpt : excerptFromContent;
    })();

    return clampExcerpt(excerptRaw);
  };

  // Jika posts kosong, tampilkan placeholder
  if (!allPosts || allPosts.length === 0) {
      return (
          <div
            id={`news-list-${block.id}`}
            className="news-list-container"
            style={{
              ...containerStyle,
              paddingTop: currentUseBox ? currentBoxPt : '1.25rem',
              paddingRight: currentUseBox ? currentBoxPr : '1.25rem',
              paddingBottom: currentUseBox ? currentBoxPb : '1.25rem',
              paddingLeft: currentUseBox ? currentBoxPl : '1.25rem',
            }}
          >
              <h3 className="text-lg font-bold mb-4 border-b pb-2 [color:var(--home-widget-title-color,var(--heading-color,#1e293b))]" style={{ borderColor: 'var(--border, rgba(229,231,235,0.7))' }}>{title}</h3>
              <p className="text-sm [color:var(--muted-text,var(--home-meta-color,#9ca3af))]">Belum ada berita di kategori ini.</p>
          </div>
      );
  }

  return (
    <div
      id={`news-list-${block.id}`}
      className="news-list-container"
      style={{
        ...containerStyle,
        '--nl-title-hover': currentTitleHoverColor,
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
        backgroundColor: currentUseBox ? currentBoxColor : 'transparent',
        borderRadius: currentUseBox ? currentBoxRadius : '0',
        border: currentUseBox ? 'var(--box-border, 1px solid var(--border, #e5e7eb))' : 'none',
        boxShadow: currentUseBox ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none',
        backgroundImage: currentBoxBackgroundImage,
        backgroundSize: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `cover, ${currentBoxBgSize}` : currentBoxBgSize) : undefined,
        backgroundPosition: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `center, ${currentBoxBgPosition}` : currentBoxBgPosition) : undefined,
        backgroundRepeat: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `no-repeat, ${currentBoxBgRepeat}` : currentBoxBgRepeat) : undefined,
        backgroundAttachment: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `scroll, ${currentBoxBgAttachment}` : currentBoxBgAttachment) : undefined,
        paddingTop: currentUseBox ? currentBoxPt : '0px',
        paddingRight: currentUseBox ? currentBoxPr : '0px',
        paddingBottom: currentUseBox ? currentBoxPb : '0px',
        paddingLeft: currentUseBox ? currentBoxPl : '0px',
      } as React.CSSProperties}
    >
      <div className="news-list-inner responsive-block-frame">
        {(cfg.showTitle !== false) && (
          <h3
            className="font-bold border-b border-[color:var(--border,#e5e7eb)] flex items-center justify-between theme-widget-title"
            style={{ lineHeight: currentBlockTitleLh, marginBottom: currentBlockTitleMb, paddingBottom: currentBlockTitlePb }}
          >
            <span className="flex items-center">
              <span className="widget-title-bar" style={{ borderRadius: 'var(--home-main-box-radius, 0.25rem)' }} />
              <span>{title}</span>
            </span>
            {archiveLink && (
              <Link
                href={archiveLink}
                className="text-xs font-medium [color:var(--muted-text,var(--home-meta-color,#9ca3af))] hover:[color:var(--home-hover-color,var(--accent,#2563eb))] transition-colors flex items-center gap-1"
              >
                Lihat Semua
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
            )}
          </h3>
        )}

        <div className="space-y-4">
          {visiblePosts.map((post, idx) => {
            const postLink = post.category ? `/${post.category.slug}/${post.slug}` : `/post/${post.slug}`;
            const displayCategory = post.archiveDisplayCategory || post.category;
            const imageUrl = post.image || post.featuredImage?.fileUrl;
            const isVideo = String((post as any)?.type || "").toUpperCase() === "VIDEO";
            const authorName = (() => {
              if (typeof post.author === 'string') return post.author;
              if (post.author && typeof post.author === 'object') {
                const a = post.author as { name?: string; fullName?: string };
                if (typeof a.name === 'string' && a.name.trim() !== '') return a.name;
                if (typeof a.fullName === 'string' && a.fullName.trim() !== '') return a.fullName;
              }
              if (typeof post.authorName === 'string' && post.authorName.trim() !== '') return post.authorName;
              return undefined;
            })();
            const authorAvatar = (() => {
              if (post.author && typeof post.author === 'object') {
                const a = post.author as { avatar?: string; avatarUrl?: string; image?: string; banner?: string };
                if (typeof a.avatar === 'string' && a.avatar.trim() !== '') return normalizeAvatarUrl(a.avatar);
                if (typeof a.avatarUrl === 'string' && a.avatarUrl.trim() !== '') return normalizeAvatarUrl(a.avatarUrl);
                if (typeof a.image === 'string' && a.image.trim() !== '') return normalizeAvatarUrl(a.image);
                if (typeof a.banner === 'string' && a.banner.trim() !== '') return normalizeAvatarUrl(a.banner);
              }
              if (typeof post.authorAvatar === 'string' && post.authorAvatar.trim() !== '') return normalizeAvatarUrl(post.authorAvatar);
              return '';
            })();
            const dateVal = post.publishedAt || post.createdAt;
            const categoryPaddingX = device === 'mobile' ? categoryPaddingXMobile : (device === 'tablet' ? categoryPaddingXTablet : categoryPaddingXDesktop);
            const categoryPaddingY = device === 'mobile' ? categoryPaddingYMobile : (device === 'tablet' ? categoryPaddingYTablet : categoryPaddingYDesktop);
            const categoryMarginBottom = device === 'mobile' ? categoryMarginBottomMobile : (device === 'tablet' ? categoryMarginBottomTablet : categoryMarginBottomDesktop);
            const categoryTextColor = getResponsiveCategoryString('categoryLabelColor', 'categoryTextColor', 'var(--accent)', 'categoryLabelTextColor');
            const categoryBgColor = getResponsiveCategoryString('categoryLabelBgColor', 'categoryBgColor', 'transparent');
            const categoryHasBg = categoryBgColor !== 'transparent' && categoryBgColor !== 'none';
            const categoryFontSize = `${getResponsiveCategoryNumber('categoryLabelFontSize', 'categoryFontSize', 12)}px`;
            const categoryLineHeight = (() => {
              const val = getResponsive('categoryLabelLineHeight');
              const n = typeof val === 'number' ? val : (typeof val === 'string' ? Number(val) : NaN);
              if (Number.isFinite(n)) return String(n);
              const base = cfg.categoryLabelLineHeight;
              const b = typeof base === 'number' ? base : (typeof base === 'string' ? Number(base) : NaN);
              return Number.isFinite(b) ? String(b) : '1';
            })();
            const categoryRadius = resolveWidgetRadius(
              getResponsive('categoryLabelBorderRadius') ?? getResponsive('categoryBorderRadius') ?? cfg.categoryLabelBorderRadius ?? cfg.categoryBorderRadius,
              effectiveRadius
            );
            return (
              <article
                key={post.id ?? `${block.id}-${idx}`}
                className="news-list-item group pb-4 last:pb-0"
                style={{
                  display: 'flex',
                  flexDirection: isCenterAligned ? 'column' : (isRightAligned ? 'row-reverse' : 'row'),
                  alignItems: isCenterAligned ? currentCrossAlign : currentVerticalCrossAlign,
                  gap: '1rem',
                  borderBottomStyle: 'solid',
                  borderBottomWidth: currentShowDivider && idx < visiblePosts.length - 1 ? `${currentDividerThickness}px` : '0',
                  borderBottomColor: currentDividerColor,
                }}
              >
                {currentShowImage && (
                  <Link
                    href={postLink}
                    className="news-list-thumb relative flex-shrink-0 overflow-hidden bg-[color:var(--bg-surface,#f3f4f6)] group-hover:shadow-md transition-shadow"
                    style={{
                      alignSelf: isCenterAligned ? currentCrossAlign : currentVerticalCrossAlign,
                      width: currentThumbWidth,
                      height: currentThumbRatio ? 'auto' : currentThumbHeight,
                      aspectRatio: currentThumbRatio || 'auto',
                      borderRadius: currentThumbRadius,
                    }}
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={post.title}
                        fill
                        quality={90}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes={/px$/.test(currentThumbWidth) ? currentThumbWidth : '96px'}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center [color:var(--muted-text,var(--home-meta-color,#9ca3af))] text-xs font-semibold">
                        No Image
                      </div>
                    )}
                    {isVideo && (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5 translate-x-[0.5px]">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </span>
                    )}
                  </Link>
                )}

                <div
                  className="flex-grow min-w-0 news-list-content"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: currentCrossAlign,
                    textAlign: currentTextAlign,
                    paddingTop: currentCpTop,
                    paddingRight: currentCpRight,
                    paddingBottom: currentCpBottom,
                    paddingLeft: currentCpLeft,
                    width: '100%',
                  }}
                >
                  {currentShowCategory && displayCategory && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1" style={{ marginBottom: `${categoryMarginBottom}px`, justifyContent: currentJustifyAlign }}>
                      <Link
                        href={`/${displayCategory.slug}`}
                        className="news-list-category hover:opacity-90 transition-opacity font-bold uppercase tracking-wider"
                        style={{
                          color: String(categoryTextColor),
                          backgroundColor: String(categoryBgColor),
                          borderRadius: categoryHasBg ? categoryRadius : '0',
                          padding: categoryHasBg ? `${categoryPaddingY}px ${categoryPaddingX}px` : '0',
                          fontSize: categoryFontSize,
                          lineHeight: categoryLineHeight
                        }}
                      >
                        {displayCategory.name}
                      </Link>
                    </div>
                  )}

                  <h4
                    className="news-list-title-wrap mb-1.5"
                    style={{
                      fontSize: currentTitleFs,
                      lineHeight: currentTitleLh,
                      fontWeight: currentTitleFontWeight,
                      fontFamily: 'var(--home-news-title-font, var(--font-heading, sans-serif))',
                      fontSynthesis: 'var(--home-news-title-synthesis, var(--font-heading-synthesis, none))',
                      marginBottom: currentTitleMb,
                    }}
                  >
                    <Link
                      href={postLink}
                      className="news-list-title transition-colors hover:!text-[var(--nl-title-hover)]"
                      style={{
                        ["--news-list-title-color" as string]: String(currentTitleColor),
                        ["--news-list-title-size" as string]: currentTitleFs,
                        ["--news-list-title-weight" as string]: currentTitleFontWeight,
                        ["--news-list-title-font" as string]: 'var(--home-news-title-font, var(--font-heading, sans-serif))',
                        ["--news-list-title-hover" as string]: 'var(--nl-title-hover)',
                        color: String(currentTitleColor),
                        fontSize: currentTitleFs,
                        lineHeight: currentTitleLh,
                        fontWeight: currentTitleFontWeight,
                        fontFamily: 'var(--home-news-title-font, var(--font-heading, sans-serif))',
                        fontSynthesis: 'inherit',
                      }}
                    >
                      {post.title}
                    </Link>
                  </h4>

                  {currentShowExcerpt && (
                    <p
                      className="line-clamp-2"
                      style={{
                        fontSize: currentExcerptFs,
                        color: String(currentExcerptColor),
                        lineHeight: currentExcerptLh,
                        fontWeight: currentExcerptFontWeight,
                      }}
                    >
                      {getDisplayExcerpt(post)}
                    </p>
                  )}

                  {currentShowMeta && (authorName || dateVal) && (
                    <div
                      className="flex items-center gap-3 font-medium mt-2"
                      style={{
                        justifyContent: currentJustifyAlign,
                        flexWrap: 'wrap',
                        fontSize: currentMetaFs,
                        color: String(currentMetaColor),
                        lineHeight: currentMetaLineHeight,
                        fontWeight: currentMetaFontWeight,
                        marginBottom: `${currentMetaMarginBottom}px`,
                      }}
                    >
                      {currentShowAuthor && authorName && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="rounded-full flex items-center justify-center relative overflow-hidden shrink-0"
                            style={{ width: '1.5em', height: '1.5em', fontSize: '0.92em', backgroundColor: 'color-mix(in oklab, var(--fg-primary) 10%, transparent)' }}
                          >
                            {authorAvatar ? (
                              <Image src={authorAvatar} alt={authorName} fill className="object-cover" sizes="16px" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="opacity-80" style={{ width: '1em', height: '1em' }}>
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                          <span>{authorName}</span>
                        </div>
                      )}

                      {currentShowAuthor && authorName && currentShowDate && dateVal && (
                        <span className="rounded-full shrink-0" style={{ width: '0.42em', height: '0.42em', backgroundColor: 'currentColor', opacity: 0.5 }} />
                      )}

                      {currentShowDate && dateVal && (
                        <div className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 shrink-0" style={{ width: '1.22em', height: '1.22em' }}>
                            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                          </svg>
                          <time
                            dateTime={(() => {
                              const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
                              return Number.isNaN(d.getTime()) ? "" : d.toISOString();
                            })()}
                          >
                            {formatLongDateId(dateVal)}
                          </time>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {paginationStyle === 'load_more' && (page < totalPages || hasMoreRemote) && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              className="news-list-pagination-btn border rounded-lg text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                ...buttonStyle,
                paddingTop: currentLmpTop,
                paddingRight: currentLmpRight,
                paddingBottom: currentLmpBottom,
                paddingLeft: currentLmpLeft,
              }}
              disabled={isFetchingMore || (page >= totalPages && !hasMoreRemote)}
              onMouseEnter={(e) => {
                applyPaginationHoverStyle(e.currentTarget as HTMLButtonElement);
              }}
              onMouseLeave={(e) => {
                resetPaginationButtonStyle(e.currentTarget as HTMLButtonElement, {
                  top: currentLmpTop,
                  right: currentLmpRight,
                  bottom: currentLmpBottom,
                  left: currentLmpLeft,
                });
              }}
              onClick={async () => {
                const nextPage = page + 1;
                const ready = await ensurePageLoaded(nextPage);
                if (!ready) return;
                setPage(nextPage);
              }}
            >
              {isFetchingMore ? 'Memuat...' : currentLoadMoreText}
            </button>
          </div>
        )}

        {paginationStyle === 'next_prev' && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              className="news-list-pagination-btn border rounded-lg text-sm font-semibold transition-colors flex-1"
              style={{
                ...buttonStyle,
                paddingTop: currentLmpTop,
                paddingRight: currentLmpRight,
                paddingBottom: currentLmpBottom,
                paddingLeft: currentLmpLeft,
              }}
              disabled={page <= 1}
              onMouseEnter={(e) => {
                applyPaginationHoverStyle(e.currentTarget as HTMLButtonElement);
              }}
              onMouseLeave={(e) => {
                resetPaginationButtonStyle(e.currentTarget as HTMLButtonElement, {
                  top: currentLmpTop,
                  right: currentLmpRight,
                  bottom: currentLmpBottom,
                  left: currentLmpLeft,
                });
              }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </button>
            <button
              type="button"
              className="news-list-pagination-btn border rounded-lg text-sm font-semibold transition-colors flex-1"
              style={{
                ...buttonStyle,
                paddingTop: currentLmpTop,
                paddingRight: currentLmpRight,
                paddingBottom: currentLmpBottom,
                paddingLeft: currentLmpLeft,
              }}
              disabled={isFetchingMore || (page >= totalPages && !hasMoreRemote)}
              onMouseEnter={(e) => {
                applyPaginationHoverStyle(e.currentTarget as HTMLButtonElement);
              }}
              onMouseLeave={(e) => {
                resetPaginationButtonStyle(e.currentTarget as HTMLButtonElement, {
                  top: currentLmpTop,
                  right: currentLmpRight,
                  bottom: currentLmpBottom,
                  left: currentLmpLeft,
                });
              }}
              onClick={async () => {
                const nextPage = page + 1;
                const ready = await ensurePageLoaded(nextPage);
                if (!ready) return;
                setPage(nextPage);
              }}
            >
              {isFetchingMore ? 'Memuat...' : 'Berikutnya'}
            </button>
          </div>
        )}

        {paginationStyle === 'auto_load' && (hasMoreRemote || page < totalPages) && <div ref={sentinelRef} />}
      </div>
    </div>
  );
}
