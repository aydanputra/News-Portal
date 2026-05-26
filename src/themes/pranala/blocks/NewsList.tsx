"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBool } from "./responsive";
import { resolveWidgetRadius } from "./radius";

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
  filterType?: string;
  tagSlug?: string;
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
  imageWidth?: string;
  imageHeight?: string;
  imageBorderRadius?: number;
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
  metaMarginBottom?: number;
  excerptColor?: string;
  excerptFontSize?: number;
  excerptLineHeight?: number;
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

export default function NewsList({ block, posts, customTitle, accentColor, borderRadius, previewDevice }: NewsListProps) {
  const { config } = block;
  const cfg: NewsListConfig = config || {};
  const title = customTitle || config?.title || "Berita Terbaru";
  const effectiveAccent = accentColor || 'var(--accent)';
  const effectiveRadius = borderRadius ? borderRadius : 'var(--home-main-box-radius, 0.75rem)';

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
    const tagSlug = cfg.tagSlug;
    const categorySlug = cfg.categorySlug || cfg.category;
    if (filterType === "tag" && tagSlug) return `/tag/${tagSlug}`;
    if (categorySlug && categorySlug !== "all") return `/category/${categorySlug}`;
    return null;
  }, [cfg.category, cfg.categorySlug, cfg.filterType, cfg.tagSlug]);

  const isTruthy = (val: unknown) => val === true || val === 'true';
  const useBoxMobile = isTruthy(cfg.mobileUseBox ?? cfg.useBox);
  const useBoxTablet = isTruthy(cfg.tabletUseBox ?? cfg.useBox ?? cfg.mobileUseBox);
  const useBoxDesktop = isTruthy(cfg.useBox ?? cfg.tabletUseBox ?? cfg.mobileUseBox);

  const boxColorMobile = normalizeColor(cfg.mobileBoxColor ?? cfg.boxColor, 'var(--bg-elevated, #ffffff)');
  const boxColorTablet = normalizeColor(cfg.tabletBoxColor ?? cfg.boxColor ?? cfg.mobileBoxColor, 'var(--bg-elevated, #ffffff)');
  const boxColorDesktop = normalizeColor(cfg.boxColor ?? cfg.tabletBoxColor ?? cfg.mobileBoxColor, 'var(--bg-elevated, #ffffff)');
  const boxBgImageDesktop = typeof cfg.backgroundImage === 'string' ? cfg.backgroundImage.trim() : '';
  const boxBgImageTablet = typeof cfg.tabletBackgroundImage === 'string' && cfg.tabletBackgroundImage.trim() !== '' ? cfg.tabletBackgroundImage.trim() : boxBgImageDesktop;
  const boxBgImageMobile = typeof cfg.mobileBackgroundImage === 'string' && cfg.mobileBackgroundImage.trim() !== '' ? cfg.mobileBackgroundImage.trim() : boxBgImageDesktop;

  const boxRadiusKeyMobile = typeof cfg.mobileBoxBorderRadius === 'string' ? cfg.mobileBoxBorderRadius : (typeof cfg.boxBorderRadius === 'string' ? cfg.boxBorderRadius : 'default');
  const boxRadiusKeyTablet = typeof cfg.tabletBoxBorderRadius === 'string' ? cfg.tabletBoxBorderRadius : boxRadiusKeyMobile;
  const boxRadiusKeyDesktop = typeof cfg.boxBorderRadius === 'string' ? cfg.boxBorderRadius : boxRadiusKeyTablet;

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
  const titleFontWeightDesktop = normalizeFontWeight(cfg.titleFontWeight, '600');
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

  const excerptFsMobile = cfg.mobileExcerptFontSize ? `${cfg.mobileExcerptFontSize}px` : (cfg.excerptFontSize ? `${cfg.excerptFontSize}px` : '0.875rem');
  const excerptFsTablet = cfg.tabletExcerptFontSize ? `${cfg.tabletExcerptFontSize}px` : excerptFsMobile;
  const excerptFsDesktop = cfg.excerptFontSize ? `${cfg.excerptFontSize}px` : excerptFsTablet;
  const excerptLhMobile = toNumberOrUndefined(cfg.mobileExcerptLineHeight) ?? toNumberOrUndefined(cfg.excerptLineHeight) ?? 1.625;
  const excerptLhTablet = toNumberOrUndefined(cfg.tabletExcerptLineHeight) ?? excerptLhMobile;
  const excerptLhDesktop = toNumberOrUndefined(cfg.excerptLineHeight) ?? excerptLhTablet;

  const excerptColorMobile = cfg.mobileExcerptColor || cfg.excerptColor || 'var(--home-excerpt-color, #4b5563)';
  const excerptColorTablet = cfg.tabletExcerptColor || excerptColorMobile;
  const excerptColorDesktop = cfg.excerptColor || excerptColorTablet;

  const asNonEmptyString = (val: unknown, fallback: string) =>
    (typeof val === 'string' && val.trim() !== '') ? val : fallback;

  const categoryLabelColorMobile = asNonEmptyString(
    cfg.mobileCategoryLabelColor,
    asNonEmptyString(cfg.mobileCategoryTextColor, asNonEmptyString(cfg.categoryLabelColor, asNonEmptyString(cfg.categoryTextColor, 'var(--accent)')))
  );
  const categoryLabelColorTablet = asNonEmptyString(
    cfg.tabletCategoryLabelColor,
    asNonEmptyString(cfg.tabletCategoryTextColor, categoryLabelColorMobile)
  );
  const categoryLabelColorDesktop = asNonEmptyString(cfg.categoryLabelColor, asNonEmptyString(cfg.categoryTextColor, categoryLabelColorTablet));
  const dividerColorMobile = asNonEmptyString(cfg.mobileDividerColor, asNonEmptyString(cfg.dividerColor, 'rgba(249,250,251,1)'));
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

  const thumbRadiusDesktop = resolveWidgetRadius(cfg.imageBorderRadius, effectiveRadius);
  const thumbRadiusTablet = resolveWidgetRadius(cfg.tabletImageBorderRadius ?? cfg.imageBorderRadius, thumbRadiusDesktop);
  const thumbRadiusMobile = resolveWidgetRadius(cfg.mobileImageBorderRadius ?? cfg.imageBorderRadius, thumbRadiusDesktop);

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

  const allPosts = (posts || []).slice(offset);

  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>(previewDevice || 'desktop');

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

  const getResponsiveCategoryString = (labelKey: string, legacyKey: string, fallback: string) => {
    const labelVal = getResponsive(labelKey);
    if (typeof labelVal === 'string' && labelVal.trim() !== '') return labelVal;
    const legacyVal = getResponsive(legacyKey);
    if (typeof legacyVal === 'string' && legacyVal.trim() !== '') return legacyVal;

    const labelBase = cfg[labelKey];
    if (typeof labelBase === 'string' && labelBase.trim() !== '') return labelBase;
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
  }, [paginationStyle, device, baseLimit, tabletLimit, mobileLimit, offset, cfg.categorySlug, cfg.tagSlug, cfg.sortOrder]);

  const pageSize = device === 'mobile' ? mobileLimit : (device === 'tablet' ? tabletLimit : baseLimit);
  const totalPages = Math.max(1, Math.ceil(allPosts.length / pageSize));

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
      if (!entry?.isIntersecting) return;
      setPage((prev) => {
        if (prev >= totalPages) return prev;
        return prev + 1;
      });
    }, { rootMargin: '200px 0px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, [paginationStyle, totalPages]);

  const configRecord = cfg as Record<string, unknown>;
  const excerptLengthMobile = getNumberFromValue(cfg.mobileExcerptLength ?? cfg.excerptLength, 100);
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
  const showMetaMobile = getResponsiveBool(configRecord, "showMetaInfo", "mobile", true);
  const showMetaTablet = getResponsiveBool(configRecord, "showMetaInfo", "tablet", true);
  const showMetaDesktop = getResponsiveBool(configRecord, "showMetaInfo", "desktop", true);
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
  const currentBlockTitleFs = device === 'mobile' ? blockTitleFsMobile : (device === 'tablet' ? blockTitleFsTablet : blockTitleFsDesktop);
  const currentBlockTitleColor = device === 'mobile' ? blockTitleColorMobile : (device === 'tablet' ? blockTitleColorTablet : blockTitleColorDesktop);
  const currentBlockTitleBorderColor = device === 'mobile' ? blockTitleBorderColorMobile : (device === 'tablet' ? blockTitleBorderColorTablet : blockTitleBorderColorDesktop);
  const currentTitleFs = device === 'mobile' ? titleFsMobile : (device === 'tablet' ? titleFsTablet : titleFsDesktop);
  const currentTitleLh = device === 'mobile' ? titleLhMobile : (device === 'tablet' ? titleLhTablet : titleLhDesktop);
  const currentTitleFontWeight = device === 'mobile' ? titleFontWeightMobile : (device === 'tablet' ? titleFontWeightTablet : titleFontWeightDesktop);
  const currentTitleMb = device === 'mobile' ? titleMbMobile : (device === 'tablet' ? titleMbTablet : titleMbDesktop);
  const currentTitleColor = device === 'mobile' ? titleColorMobile : (device === 'tablet' ? titleColorTablet : titleColorDesktop);
  const currentTitleHoverColor = device === 'mobile' ? titleHoverColorMobile : (device === 'tablet' ? titleHoverColorTablet : titleHoverColorDesktop);
  const currentMetaFs = device === 'mobile' ? metaFsMobile : (device === 'tablet' ? metaFsTablet : metaFsDesktop);
  const currentMetaColor = device === 'mobile' ? metaColorMobile : (device === 'tablet' ? metaColorTablet : metaColorDesktop);
  const currentMetaLineHeight = device === 'mobile' ? metaLineHeightMobile : (device === 'tablet' ? metaLineHeightTablet : metaLineHeightDesktop);
  const currentMetaMarginBottom = device === 'mobile' ? metaMarginBottomMobile : (device === 'tablet' ? metaMarginBottomTablet : metaMarginBottomDesktop);
  const currentExcerptFs = device === 'mobile' ? excerptFsMobile : (device === 'tablet' ? excerptFsTablet : excerptFsDesktop);
  const currentExcerptColor = device === 'mobile' ? excerptColorMobile : (device === 'tablet' ? excerptColorTablet : excerptColorDesktop);
  const currentExcerptLh = device === 'mobile' ? excerptLhMobile : (device === 'tablet' ? excerptLhTablet : excerptLhDesktop);
  const currentExcerptLength = device === 'mobile' ? excerptLengthMobile : (device === 'tablet' ? excerptLengthTablet : excerptLengthDesktop);
  const currentShowImage = device === 'mobile' ? showImageMobile : (device === 'tablet' ? showImageTablet : showImageDesktop);
  const currentShowExcerpt = device === 'mobile' ? showExcerptMobile : (device === 'tablet' ? showExcerptTablet : showExcerptDesktop);
  const currentShowMeta = device === 'mobile' ? showMetaMobile : (device === 'tablet' ? showMetaTablet : showMetaDesktop);
  const currentShowDivider = device === 'mobile' ? showDividerMobile : (device === 'tablet' ? showDividerTablet : showDividerDesktop);
  const currentDividerColor = device === 'mobile' ? dividerColorMobile : (device === 'tablet' ? dividerColorTablet : dividerColorDesktop);
  const currentDividerThickness = device === 'mobile' ? dividerThicknessMobile : (device === 'tablet' ? dividerThicknessTablet : dividerThicknessDesktop);
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
          <div id={`news-list-${block.id}`} className="news-list-container" style={{ ...containerStyle, padding: '1.25rem' }}>
              <h3 className="text-lg font-bold mb-4 border-b pb-2" style={{ borderColor: 'rgba(229,231,235,0.7)' }}>{title}</h3>
              <p className="text-gray-500 text-sm">Belum ada berita di kategori ini.</p>
          </div>
      );
  }

  return (
    <div
      id={`news-list-${block.id}`}
      className="news-list-container"
      style={containerStyle}
    >
      <style dangerouslySetInnerHTML={{__html: `
        #news-list-${block.id} {
          --nl-title-hover: ${titleHoverColorMobile};
          background-color: ${useBoxMobile ? boxColorMobile : 'transparent'};
          border-radius: ${useBoxMobile ? getRadius(boxRadiusKeyMobile) : '0'};
          border: ${useBoxMobile ? 'var(--box-border, 1px solid #f3f4f6)' : 'none'};
          box-shadow: ${useBoxMobile ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none'};
          background-image: ${useBoxMobile && boxBgImageMobile ? `url(${boxBgImageMobile})` : 'none'};
          background-size: ${useBoxMobile && boxBgImageMobile ? 'cover' : 'initial'};
          background-position: ${useBoxMobile && boxBgImageMobile ? 'center' : 'initial'};
          background-repeat: ${useBoxMobile && boxBgImageMobile ? 'no-repeat' : 'repeat'};
        }
        #news-list-${block.id} .news-list-inner {
          margin-top: ${mTopMobile};
          margin-right: ${mRightMobile};
          margin-bottom: ${mBottomMobile};
          margin-left: ${mLeftMobile};
          padding-top: ${pTopMobile};
          padding-right: ${pRightMobile};
          padding-bottom: ${pBottomMobile};
          padding-left: ${pLeftMobile};
        }
        #news-list-${block.id} .news-list-thumb {
          width: ${ratioMobile ? thumbWidthMobile : thumbWidthMobile};
          height: ${ratioMobile ? 'auto' : thumbHeightMobile};
          aspect-ratio: ${ratioMobile ? ratioMobile : 'auto'};
          border-radius: ${thumbRadiusMobile};
        }
        #news-list-${block.id} .news-list-content {
          padding-top: ${cpTopMobile};
          padding-right: ${cpRightMobile};
          padding-bottom: ${cpBottomMobile};
          padding-left: ${cpLeftMobile};
        }
        #news-list-${block.id} .news-list-item {
          border-bottom-style: solid;
          border-bottom-width: ${currentShowDivider ? `${currentDividerThickness}px` : '0'};
          border-bottom-color: ${currentDividerColor};
        }
        #news-list-${block.id} .news-list-item:last-child {
          border-bottom-width: 0;
        }
        #news-list-${block.id} .theme-widget-title {
          color: ${currentBlockTitleColor};
          font-size: ${currentBlockTitleFs};
        }
        #news-list-${block.id} .theme-widget-title span {
          color: ${currentBlockTitleColor};
          font-size: ${currentBlockTitleFs};
        }
        #news-list-${block.id} .theme-widget-title .widget-title-bar {
          background-color: ${currentBlockTitleBorderColor};
        }
        #news-list-${block.id} .news-list-meta-info {
          font-size: ${currentMetaFs};
          color: ${currentMetaColor};
          line-height: ${currentMetaLineHeight};
          margin-bottom: ${currentMetaMarginBottom}px;
        }
        #news-list-${block.id} .news-list-meta-info,
        #news-list-${block.id} .news-list-meta-info a {
          font-size: ${currentMetaFs};
          color: ${currentMetaColor};
        }
        #news-list-${block.id} .news-list-category { color: ${categoryLabelColorMobile}; }
        #news-list-${block.id} .news-list-title-wrap { font-size: ${currentTitleFs}; line-height: ${currentTitleLh}; font-weight: ${currentTitleFontWeight}; margin-bottom: ${currentTitleMb}; }
        #news-list-${block.id} .news-list-title { color: ${currentTitleColor}; font-size: ${currentTitleFs}; line-height: ${currentTitleLh}; font-weight: ${currentTitleFontWeight}; }
        #news-list-${block.id} .news-list-title:hover { color: ${currentTitleHoverColor}; }
        #news-list-${block.id} .news-list-excerpt {
          display: ${currentShowExcerpt ? 'block' : 'none'};
          font-size: ${currentExcerptFs};
          color: ${currentExcerptColor};
          line-height: ${currentExcerptLh};
        }
        #news-list-${block.id} .news-list-excerpt {
          font-size: ${currentExcerptFs};
          color: ${currentExcerptColor};
          line-height: ${currentExcerptLh};
        }
        #news-list-${block.id} .news-list-meta-info {
          display: ${currentShowMeta ? 'flex' : 'none'};
        }
        ${paginationStyle === 'none' ? `
          #news-list-${block.id} .news-list-item:nth-child(n+${mobileLimit + 1}) { display: none; }
        ` : ''}
        #news-list-${block.id} .news-list-loadmore-label--mobile { display: inline; }
        #news-list-${block.id} .news-list-loadmore-label--tablet { display: none; }
        #news-list-${block.id} .news-list-loadmore-label--desktop { display: none; }
        #news-list-${block.id} .news-list-pagination-btn {
          padding-top: ${lmpTopMobile};
          padding-right: ${lmpRightMobile};
          padding-bottom: ${lmpBottomMobile};
          padding-left: ${lmpLeftMobile};
        }
        @media (min-width: 768px) {
          #news-list-${block.id} {
            background-color: ${useBoxTablet ? boxColorTablet : 'transparent'};
            border-radius: ${useBoxTablet ? getRadius(boxRadiusKeyTablet) : '0'};
            border: ${useBoxTablet ? 'var(--box-border, 1px solid #f3f4f6)' : 'none'};
            box-shadow: ${useBoxTablet ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none'};
            background-image: ${useBoxTablet && boxBgImageTablet ? `url(${boxBgImageTablet})` : 'none'};
            background-size: ${useBoxTablet && boxBgImageTablet ? 'cover' : 'initial'};
            background-position: ${useBoxTablet && boxBgImageTablet ? 'center' : 'initial'};
            background-repeat: ${useBoxTablet && boxBgImageTablet ? 'no-repeat' : 'repeat'};
          }
          #news-list-${block.id} .news-list-inner {
            margin-top: ${mTopTablet};
            margin-right: ${mRightTablet};
            margin-bottom: ${mBottomTablet};
            margin-left: ${mLeftTablet};
            padding-top: ${pTopTablet};
            padding-right: ${pRightTablet};
            padding-bottom: ${pBottomTablet};
            padding-left: ${pLeftTablet};
          }
          #news-list-${block.id} .news-list-thumb {
            width: ${ratioTablet ? thumbWidthTablet : thumbWidthTablet};
            height: ${ratioTablet ? 'auto' : thumbHeightTablet};
            aspect-ratio: ${ratioTablet ? ratioTablet : 'auto'};
            border-radius: ${thumbRadiusTablet};
          }
          #news-list-${block.id} .news-list-content {
            padding-top: ${cpTopTablet};
            padding-right: ${cpRightTablet};
            padding-bottom: ${cpBottomTablet};
            padding-left: ${cpLeftTablet};
          }
          #news-list-${block.id} .news-list-category { color: ${categoryLabelColorTablet}; }
          ${paginationStyle === 'none' ? `
            #news-list-${block.id} .news-list-item:nth-child(n+${tabletLimit + 1}) { display: none; }
          ` : ''}
          #news-list-${block.id} .news-list-loadmore-label--mobile { display: none; }
          #news-list-${block.id} .news-list-loadmore-label--tablet { display: inline; }
          #news-list-${block.id} .news-list-loadmore-label--desktop { display: none; }
          #news-list-${block.id} .news-list-pagination-btn {
            padding-top: ${lmpTopTablet};
            padding-right: ${lmpRightTablet};
            padding-bottom: ${lmpBottomTablet};
            padding-left: ${lmpLeftTablet};
          }
        }
        @media (min-width: 1025px) {
          #news-list-${block.id} {
            background-color: ${useBoxDesktop ? boxColorDesktop : 'transparent'};
            border-radius: ${useBoxDesktop ? getRadius(boxRadiusKeyDesktop) : '0'};
            border: ${useBoxDesktop ? 'var(--box-border, 1px solid #f3f4f6)' : 'none'};
            box-shadow: ${useBoxDesktop ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none'};
            background-image: ${useBoxDesktop && boxBgImageDesktop ? `url(${boxBgImageDesktop})` : 'none'};
            background-size: ${useBoxDesktop && boxBgImageDesktop ? 'cover' : 'initial'};
            background-position: ${useBoxDesktop && boxBgImageDesktop ? 'center' : 'initial'};
            background-repeat: ${useBoxDesktop && boxBgImageDesktop ? 'no-repeat' : 'repeat'};
          }
          #news-list-${block.id} .news-list-inner {
            margin-top: ${mTopDesktop};
            margin-right: ${mRightDesktop};
            margin-bottom: ${mBottomDesktop};
            margin-left: ${mLeftDesktop};
            padding-top: ${pTopDesktop};
            padding-right: ${pRightDesktop};
            padding-bottom: ${pBottomDesktop};
            padding-left: ${pLeftDesktop};
          }
          #news-list-${block.id} .news-list-thumb {
            width: ${ratioDesktop ? thumbWidthDesktop : thumbWidthDesktop};
            height: ${ratioDesktop ? 'auto' : thumbHeightDesktop};
            aspect-ratio: ${ratioDesktop ? ratioDesktop : 'auto'};
            border-radius: ${thumbRadiusDesktop};
          }
          #news-list-${block.id} .news-list-content {
            padding-top: ${cpTopDesktop};
            padding-right: ${cpRightDesktop};
            padding-bottom: ${cpBottomDesktop};
            padding-left: ${cpLeftDesktop};
          }
          #news-list-${block.id} .news-list-category { color: ${categoryLabelColorDesktop}; }
          ${paginationStyle === 'none' ? `
            #news-list-${block.id} .news-list-item:nth-child(n+${baseLimit + 1}) { display: none; }
          ` : ''}
          #news-list-${block.id} .news-list-loadmore-label--mobile { display: none; }
          #news-list-${block.id} .news-list-loadmore-label--tablet { display: none; }
          #news-list-${block.id} .news-list-loadmore-label--desktop { display: inline; }
          #news-list-${block.id} .news-list-pagination-btn {
            padding-top: ${lmpTopDesktop};
            padding-right: ${lmpRightDesktop};
            padding-bottom: ${lmpBottomDesktop};
            padding-left: ${lmpLeftDesktop};
          }
        }
      `}} />

      <div className="news-list-inner">
        {(cfg.showTitle !== false) && (
          <h3
            className="font-bold mb-3 border-b border-gray-100 pb-3 flex items-center justify-between theme-widget-title"
          >
            <span className="flex items-center">
              <span className="widget-title-bar w-1 h-5 mr-3" style={{ borderRadius: 'var(--home-main-box-radius, 0.25rem)' }} />
              <span>{title}</span>
            </span>
            {archiveLink && (
              <Link
                href={archiveLink}
                className="text-xs font-medium text-gray-400 hover:text-[var(--accent)] transition-colors flex items-center gap-1"
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
            const showCategory = device === 'mobile' ? showCategoryMobile : (device === 'tablet' ? showCategoryTablet : showCategoryDesktop);
            const showAuthor = device === 'mobile' ? showAuthorMobile : (device === 'tablet' ? showAuthorTablet : showAuthorDesktop);
            const showDate = device === 'mobile' ? showDateMobile : (device === 'tablet' ? showDateTablet : showDateDesktop);
            const categoryPaddingX = device === 'mobile' ? categoryPaddingXMobile : (device === 'tablet' ? categoryPaddingXTablet : categoryPaddingXDesktop);
            const categoryPaddingY = device === 'mobile' ? categoryPaddingYMobile : (device === 'tablet' ? categoryPaddingYTablet : categoryPaddingYDesktop);
            const categoryMarginBottom = device === 'mobile' ? categoryMarginBottomMobile : (device === 'tablet' ? categoryMarginBottomTablet : categoryMarginBottomDesktop);
            const categoryTextColor = getResponsiveCategoryString('categoryLabelColor', 'categoryTextColor', 'var(--accent)');
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
                className="news-list-item flex gap-4 group items-start pb-4 last:pb-0"
              >
                {currentShowImage && (
                  <Link
                    href={postLink}
                    className="news-list-thumb relative flex-shrink-0 overflow-hidden bg-gray-100 group-hover:shadow-md transition-shadow"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={post.title}
                        fill
                        quality={90}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes={/px$/.test(thumbWidthDesktop) ? thumbWidthDesktop : '96px'}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs font-semibold">
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

                <div className="flex-grow min-w-0 news-list-content">
                  {showCategory && post.category && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1" style={{ marginBottom: `${categoryMarginBottom}px` }}>
                      <Link
                        href={`/${post.category.slug}`}
                        className="news-list-category hover:opacity-90 transition-opacity font-bold uppercase tracking-wider"
                        style={{
                          color: categoryTextColor,
                          backgroundColor: categoryBgColor,
                          borderRadius: categoryHasBg ? categoryRadius : '0',
                          padding: categoryHasBg ? `${categoryPaddingY}px ${categoryPaddingX}px` : '0',
                          fontSize: categoryFontSize,
                          lineHeight: categoryLineHeight
                        }}
                      >
                        {post.category.name}
                      </Link>
                    </div>
                  )}

                  <h4 className="news-list-title-wrap mb-1.5">
                    <Link href={postLink} className="news-list-title transition-colors">
                      {post.title}
                    </Link>
                  </h4>

                  <p className="news-list-excerpt line-clamp-2 leading-relaxed">
                    {getDisplayExcerpt(post)}
                  </p>

                  {(authorName || dateVal) && (
                    <div className="news-list-meta-info flex items-center gap-3 font-medium mt-2">
                      {showAuthor && authorName && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] relative overflow-hidden" style={{ backgroundColor: 'color-mix(in oklab, var(--fg-primary) 10%, transparent)' }}>
                            {authorAvatar ? (
                              <Image src={authorAvatar} alt={authorName} fill className="object-cover" sizes="16px" />
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 opacity-80">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                              </svg>
                            )}
                          </span>
                          <span>{authorName}</span>
                        </div>
                      )}

                      {showAuthor && authorName && showDate && dateVal && (
                        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'currentColor', opacity: 0.5 }} />
                      )}

                      {showDate && dateVal && (
                        <div className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
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

        {paginationStyle === 'load_more' && (
          <div className="mt-6 flex justify-center">
            {page < totalPages && (
              <button
                type="button"
                className="news-list-pagination-btn border rounded-lg text-sm font-semibold transition-colors"
                style={buttonStyle}
                onMouseEnter={(e) => {
                  Object.assign((e.currentTarget as HTMLButtonElement).style, buttonHoverStyle);
                }}
                onMouseLeave={(e) => {
                  Object.assign((e.currentTarget as HTMLButtonElement).style, buttonStyle);
                }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span className="news-list-loadmore-label--mobile">{loadMoreTextMobile}</span>
                <span className="news-list-loadmore-label--tablet">{loadMoreTextTablet}</span>
                <span className="news-list-loadmore-label--desktop">{loadMoreTextDesktop}</span>
              </button>
            )}
          </div>
        )}

        {paginationStyle === 'next_prev' && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              className="news-list-pagination-btn border rounded-lg text-sm font-semibold transition-colors flex-1"
              style={buttonStyle}
              disabled={page <= 1}
              onMouseEnter={(e) => {
                if ((e.currentTarget as HTMLButtonElement).disabled) return;
                Object.assign((e.currentTarget as HTMLButtonElement).style, buttonHoverStyle);
              }}
              onMouseLeave={(e) => {
                Object.assign((e.currentTarget as HTMLButtonElement).style, buttonStyle);
              }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="news-list-pagination-btn border rounded-lg text-sm font-semibold transition-colors flex-1"
              style={buttonStyle}
              disabled={page >= totalPages}
              onMouseEnter={(e) => {
                if ((e.currentTarget as HTMLButtonElement).disabled) return;
                Object.assign((e.currentTarget as HTMLButtonElement).style, buttonHoverStyle);
              }}
              onMouseLeave={(e) => {
                Object.assign((e.currentTarget as HTMLButtonElement).style, buttonStyle);
              }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}

        {paginationStyle === 'auto_load' && <div ref={sentinelRef} />}
      </div>
    </div>
  );
}
