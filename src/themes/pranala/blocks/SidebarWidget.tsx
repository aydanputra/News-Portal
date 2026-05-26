"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBool, getResponsiveBoolValues, getResponsiveValue, getResponsiveValues, type ResponsiveDevice } from "./responsive";
import { resolveWidgetRadius } from "./radius";

interface SidebarWidgetProps {
  block: {
    id: string;
    config?: any; // Changed to any to allow flexible config
  };
  posts?: any[];
  categories?: any[];
  customTitle?: string;
  accentColor?: string;
  borderRadius?: string;
  previewDevice?: ResponsiveDevice;
}

export default function SidebarWidget({ block, posts, categories, customTitle, accentColor, borderRadius, previewDevice }: SidebarWidgetProps) {
  const config = block.config || {};
  const configRecord = config as Record<string, unknown>;
  const title = customTitle || config.title || "Widget Sidebar";
  const effectiveAccent = accentColor || 'var(--accent)';
  const [device, setDevice] = useState<ResponsiveDevice>(previewDevice || "desktop");

  useEffect(() => {
    if (previewDevice) {
      setDevice(previewDevice);
      return;
    }
    const updateDevice = () => {
      if (window.innerWidth <= 767) {
        setDevice("mobile");
        return;
      }
      if (window.innerWidth <= 1024) {
        setDevice("tablet");
        return;
      }
      setDevice("desktop");
    };
    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, [previewDevice]);

  const normalizeColor = (value: unknown, fallback: string) => {
    if (typeof value !== "string") return fallback;
    const v = value.trim().toLowerCase();
    if (!v) return fallback;
    if (v === "#fff" || v === "#ffffff" || v === "white") return fallback;
    if (v === "#f9fafb" || v === "#f3f4f6" || v === "#f5f5f5") return fallback;
    return value;
  };

  const normalizeAvatarUrl = (value: unknown) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("/")) return trimmed;
    return `/${trimmed}`;
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
  
  let visibilityClass = '';
  if (config.hideOnDesktop) visibilityClass += ' lg:hidden';
  if (config.hideOnTablet) visibilityClass += ' md:max-lg:hidden';
  if (config.hideOnMobile) visibilityClass += ' max-md:hidden';

  const widgetType = getResponsiveValue<string>(configRecord, "widgetType", device) || "popular_posts";
  const responsiveLimit = getResponsiveValue<number | string>(configRecord, "limit", device);
  const limit = typeof responsiveLimit === "number"
    ? responsiveLimit
    : typeof responsiveLimit === "string" && responsiveLimit.trim() !== ""
      ? parseInt(responsiveLimit, 10)
      : 5;

  // --- STYLE CONFIG ---
  const titleColorMobile = (config as any).mobileBlockTitleColor || config.blockTitleColor || 'var(--home-widget-title-color, inherit)';
  const titleColorTablet = (config as any).tabletBlockTitleColor || titleColorMobile;
  const titleColorDesktop = config.blockTitleColor || titleColorTablet;

  const titleBorderColorMobile = (config as any).mobileBlockTitleBorderColor || config.blockTitleBorderColor || effectiveAccent;
  const titleBorderColorTablet = (config as any).tabletBlockTitleBorderColor || titleBorderColorMobile;
  const titleBorderColorDesktop = config.blockTitleBorderColor || titleBorderColorTablet;

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

  const desktopTitleRaw = config.blockTitleFontSize ?? config.widgetTitleFontSize;
  const blockTitleFsMobile = (config as any).mobileBlockTitleFontSize !== undefined
    ? formatFontSize((config as any).mobileBlockTitleFontSize, 'var(--home-widget-title-size, 1.25rem)')
    : formatFontSize(desktopTitleRaw, 'var(--home-widget-title-size, 1.25rem)');
  const blockTitleFsTablet = (config as any).tabletBlockTitleFontSize !== undefined
    ? formatFontSize((config as any).tabletBlockTitleFontSize, blockTitleFsMobile)
    : blockTitleFsMobile;
  const blockTitleFsDesktop = desktopTitleRaw !== undefined
    ? formatFontSize(desktopTitleRaw, blockTitleFsTablet)
    : blockTitleFsTablet;

  // --- BOX / CONTAINER LOGIC ---
  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const useBoxDesktop = useBoxValues.desktop;
  const useBoxTablet = useBoxValues.tablet;
  const useBoxMobile = useBoxValues.mobile;
  const boxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = normalizeColor(boxColorValues.desktop, 'var(--bg-elevated, #ffffff)');
  const boxColorTablet = normalizeColor(boxColorValues.tablet, boxColorDesktop);
  const boxColorMobile = normalizeColor(boxColorValues.mobile, boxColorDesktop);
  const boxBgImageDesktop = typeof config.backgroundImage === 'string' ? config.backgroundImage.trim() : '';
  const boxBgImageTablet = typeof (config as any).tabletBackgroundImage === 'string' && (config as any).tabletBackgroundImage.trim() !== ''
    ? (config as any).tabletBackgroundImage.trim()
    : boxBgImageDesktop;
  const boxBgImageMobile = typeof (config as any).mobileBackgroundImage === 'string' && (config as any).mobileBackgroundImage.trim() !== ''
    ? (config as any).mobileBackgroundImage.trim()
    : boxBgImageDesktop;
  
  const mTopMobile = config.mobileMarginTop !== undefined ? `${config.mobileMarginTop}px` : '0px';
  const mRightMobile = config.mobileMarginRight !== undefined ? `${config.mobileMarginRight}px` : '0px';
  const mBottomMobile = config.mobileMarginBottom !== undefined ? `${config.mobileMarginBottom}px` : '0px';
  const mLeftMobile = config.mobileMarginLeft !== undefined ? `${config.mobileMarginLeft}px` : '0px';

  const mTopTablet = config.tabletMarginTop !== undefined ? `${config.tabletMarginTop}px` : mTopMobile;
  const mRightTablet = config.tabletMarginRight !== undefined ? `${config.tabletMarginRight}px` : mRightMobile;
  const mBottomTablet = config.tabletMarginBottom !== undefined ? `${config.tabletMarginBottom}px` : mBottomMobile;
  const mLeftTablet = config.tabletMarginLeft !== undefined ? `${config.tabletMarginLeft}px` : mLeftMobile;

  const mTopDesktop = config.marginTop !== undefined ? `${config.marginTop}px` : mTopTablet;
  const mRightDesktop = config.marginRight !== undefined ? `${config.marginRight}px` : mRightTablet;
  const mBottomDesktop = config.marginBottom !== undefined ? `${config.marginBottom}px` : mBottomTablet;
  const mLeftDesktop = config.marginLeft !== undefined ? `${config.marginLeft}px` : mLeftTablet;

  const paddingFallbackMobile = useBoxMobile ? 'var(--box-padding, 1.5rem)' : '0px';
  const paddingFallbackTablet = useBoxTablet ? 'var(--box-padding, 1.5rem)' : '0px';
  const paddingFallbackDesktop = useBoxDesktop ? 'var(--box-padding, 1.5rem)' : '0px';
  const basePaddingTop = config.paddingTop !== undefined ? `${config.paddingTop}px` : undefined;
  const basePaddingRight = config.paddingRight !== undefined ? `${config.paddingRight}px` : undefined;
  const basePaddingBottom = config.paddingBottom !== undefined ? `${config.paddingBottom}px` : undefined;
  const basePaddingLeft = config.paddingLeft !== undefined ? `${config.paddingLeft}px` : undefined;

  const pTopMobile = config.mobilePaddingTop !== undefined ? `${config.mobilePaddingTop}px` : (basePaddingTop ?? paddingFallbackMobile);
  const pRightMobile = config.mobilePaddingRight !== undefined ? `${config.mobilePaddingRight}px` : (basePaddingRight ?? paddingFallbackMobile);
  const pBottomMobile = config.mobilePaddingBottom !== undefined ? `${config.mobilePaddingBottom}px` : (basePaddingBottom ?? paddingFallbackMobile);
  const pLeftMobile = config.mobilePaddingLeft !== undefined ? `${config.mobilePaddingLeft}px` : (basePaddingLeft ?? paddingFallbackMobile);

  const pTopTablet = config.tabletPaddingTop !== undefined ? `${config.tabletPaddingTop}px` : (basePaddingTop ?? paddingFallbackTablet);
  const pRightTablet = config.tabletPaddingRight !== undefined ? `${config.tabletPaddingRight}px` : (basePaddingRight ?? paddingFallbackTablet);
  const pBottomTablet = config.tabletPaddingBottom !== undefined ? `${config.tabletPaddingBottom}px` : (basePaddingBottom ?? paddingFallbackTablet);
  const pLeftTablet = config.tabletPaddingLeft !== undefined ? `${config.tabletPaddingLeft}px` : (basePaddingLeft ?? paddingFallbackTablet);

  const pTopDesktop = basePaddingTop ?? paddingFallbackDesktop;
  const pRightDesktop = basePaddingRight ?? paddingFallbackDesktop;
  const pBottomDesktop = basePaddingBottom ?? paddingFallbackDesktop;
  const pLeftDesktop = basePaddingLeft ?? paddingFallbackDesktop;
  // Helper for radius
  const globalRadius = borderRadius || 'var(--home-main-box-radius, 0.75rem)';
  const boxBorderRadiusDesktop = config.boxBorderRadius !== undefined
    ? resolveWidgetRadius(config.boxBorderRadius, globalRadius)
    : globalRadius;
  const boxBorderRadiusTablet = (config as any).tabletBoxBorderRadius !== undefined
    ? resolveWidgetRadius((config as any).tabletBoxBorderRadius, boxBorderRadiusDesktop)
    : boxBorderRadiusDesktop;
  const boxBorderRadiusMobile = (config as any).mobileBoxBorderRadius !== undefined
    ? resolveWidgetRadius((config as any).mobileBoxBorderRadius, boxBorderRadiusDesktop)
    : boxBorderRadiusDesktop;

  // Style untuk Container Widget
  const containerStyle = {
      backgroundColor: useBoxMobile ? boxColorMobile : 'transparent',
      borderRadius: useBoxMobile ? boxBorderRadiusMobile : '0',
      boxShadow: useBoxMobile ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none',
      border: useBoxMobile ? 'var(--box-border, 1px solid var(--border))' : 'none',
      backgroundImage: useBoxMobile && boxBgImageMobile ? `url(${boxBgImageMobile})` : 'none',
      backgroundSize: useBoxMobile && boxBgImageMobile ? 'cover' : undefined,
      backgroundPosition: useBoxMobile && boxBgImageMobile ? 'center' : undefined,
      backgroundRepeat: useBoxMobile && boxBgImageMobile ? 'no-repeat' : undefined,
      '--accent': effectiveAccent,
      '--widget-title-size-mobile': blockTitleFsMobile,
      '--widget-title-size-tablet': blockTitleFsTablet,
      '--widget-title-size-desktop': blockTitleFsDesktop,
      '--widget-title-color-mobile': titleColorMobile,
      '--widget-title-color-tablet': titleColorTablet,
      '--widget-title-color-desktop': titleColorDesktop,
      '--widget-title-border-color-mobile': titleBorderColorMobile,
      '--widget-title-border-color-tablet': titleBorderColorTablet,
      '--widget-title-border-color-desktop': titleBorderColorDesktop,
  } as React.CSSProperties;

  const isPostListWidget = widgetType === 'popular_posts' || widgetType === 'recent_posts';

  const showThumbDesktop = config.showThumbnail !== false;
  const showThumbTablet = getResponsiveBool(configRecord, "showThumbnail", "tablet", true);
  const showThumbMobile = getResponsiveBool(configRecord, "showThumbnail", "mobile", true);

  const showCategoryDesktop = config.showCategory !== false && config.showCategoryLabel !== false;
  const showCategoryTablet = getResponsiveBool(configRecord, "showCategory", "tablet", true) && config.showCategoryLabel !== false;
  const showCategoryMobile = getResponsiveBool(configRecord, "showCategory", "mobile", true) && config.showCategoryLabel !== false;

  const showMetaDesktop = config.showMetaInfo !== false;
  const showMetaTablet = getResponsiveBool(configRecord, "showMetaInfo", "tablet", true);
  const showMetaMobile = getResponsiveBool(configRecord, "showMetaInfo", "mobile", true);

  const showAuthorDesktop = config.showAuthor !== false;
  const showAuthorTablet = getResponsiveBool(configRecord, "showAuthor", "tablet", true);
  const showAuthorMobile = getResponsiveBool(configRecord, "showAuthor", "mobile", true);

  const showDateDesktop = config.showDate !== false;
  const showDateTablet = getResponsiveBool(configRecord, "showDate", "tablet", true);
  const showDateMobile = getResponsiveBool(configRecord, "showDate", "mobile", true);

  const formatSize = (val: any, fallback: string) => {
    if (val === undefined || val === null || String(val).trim() === '') return fallback;
    const str = String(val).trim();
    if (/^\d+$/.test(str)) return `${str}px`;
    return str;
  };

  const parseAspectRatio = (val: any) => {
    if (val === undefined || val === null) return undefined;
    const str = String(val).trim();
    if (!str) return undefined;
    const candidate = str.includes(':') ? str.replace(':', '/') : str;
    if (!candidate.includes('/')) return undefined;
    const [w, h] = candidate.split('/').map((x) => Number(String(x).trim()));
    if (!w || !h) return undefined;
    return `${w}/${h}`;
  };

  // Thumbnail responsive (mobile/tablet/desktop)
  const thumbRatioMobile = parseAspectRatio((config as any).mobileImageWidth) || parseAspectRatio((config as any).mobileImageHeight) || parseAspectRatio(config.imageWidth) || parseAspectRatio(config.imageHeight);
  const thumbWidthMobile = formatSize(thumbRatioMobile ? undefined : ((config as any).mobileImageWidth ?? config.imageWidth), '64px');
  const thumbHeightMobile = formatSize(thumbRatioMobile ? undefined : ((config as any).mobileImageHeight ?? config.imageHeight), '64px');

  const thumbRatioTablet = parseAspectRatio((config as any).tabletImageWidth) || parseAspectRatio((config as any).tabletImageHeight) || parseAspectRatio(config.imageWidth) || parseAspectRatio(config.imageHeight);
  const thumbWidthTablet = formatSize(thumbRatioTablet ? undefined : ((config as any).tabletImageWidth ?? config.imageWidth), thumbWidthMobile);
  const thumbHeightTablet = formatSize(thumbRatioTablet ? undefined : ((config as any).tabletImageHeight ?? config.imageHeight), thumbHeightMobile);

  const thumbRatioDesktop = parseAspectRatio(config.imageWidth) || parseAspectRatio(config.imageHeight) || thumbRatioTablet || thumbRatioMobile;
  const thumbWidthDesktop = formatSize(thumbRatioDesktop ? undefined : config.imageWidth, thumbWidthTablet);
  const thumbHeightDesktop = formatSize(thumbRatioDesktop ? undefined : config.imageHeight, thumbHeightTablet);
  const thumbRadiusDesktop = config.imageBorderRadius !== undefined
    ? resolveWidgetRadius(config.imageBorderRadius, globalRadius)
    : globalRadius;
  const thumbRadiusTablet = (config as any).tabletImageBorderRadius !== undefined
    ? resolveWidgetRadius((config as any).tabletImageBorderRadius, thumbRadiusDesktop)
    : thumbRadiusDesktop;
  const thumbRadiusMobile = (config as any).mobileImageBorderRadius !== undefined
    ? resolveWidgetRadius((config as any).mobileImageBorderRadius, thumbRadiusDesktop)
    : thumbRadiusDesktop;
  // Class-based sizing; avoid inline to allow media queries to work reliably

  const popTitleFsDesktop = config.titleFontSize ? `${config.titleFontSize}px` : 'var(--home-news-title-size, 1rem)';
  const popTitleFsTablet = config.tabletTitleFontSize ? `${config.tabletTitleFontSize}px` : popTitleFsDesktop;
  const popTitleFsMobile = config.mobileTitleFontSize ? `${config.mobileTitleFontSize}px` : popTitleFsDesktop;

  const popTitleLhDesktop = config.titleLineHeight !== undefined ? String(config.titleLineHeight) : '1.35';
  const popTitleLhTablet = config.tabletTitleLineHeight !== undefined ? String(config.tabletTitleLineHeight) : popTitleLhDesktop;
  const popTitleLhMobile = config.mobileTitleLineHeight !== undefined ? String(config.mobileTitleLineHeight) : popTitleLhDesktop;

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
  const popTitleFwDesktop = normalizeFontWeight(config.titleFontWeight, '700');
  const popTitleFwTablet = normalizeFontWeight(config.tabletTitleFontWeight, popTitleFwDesktop);
  const popTitleFwMobile = normalizeFontWeight(config.mobileTitleFontWeight, popTitleFwDesktop);

  const popTitleColorDesktop = config.titleColor || 'var(--home-news-title-color, #111827)';
  const popTitleColorTablet = config.tabletTitleColor || popTitleColorDesktop;
  const popTitleColorMobile = config.mobileTitleColor || popTitleColorDesktop;

  const popTitleHoverColorDesktop = config.titleHoverColor || 'var(--home-hover-color, var(--accent))';
  const popTitleHoverColorTablet = config.tabletTitleHoverColor || popTitleHoverColorDesktop;
  const popTitleHoverColorMobile = config.mobileTitleHoverColor || popTitleHoverColorDesktop;

  const rankNumberFsDesktop = config.rankNumberFontSize ? `${config.rankNumberFontSize}px` : '0.75rem';
  const rankNumberFsTablet = config.tabletRankNumberFontSize ? `${config.tabletRankNumberFontSize}px` : rankNumberFsDesktop;
  const rankNumberFsMobile = config.mobileRankNumberFontSize ? `${config.mobileRankNumberFontSize}px` : rankNumberFsDesktop;
  const rankNumberFwDesktop = normalizeFontWeight(config.rankNumberFontWeight, '800');
  const rankNumberFwTablet = normalizeFontWeight(config.tabletRankNumberFontWeight, rankNumberFwDesktop);
  const rankNumberFwMobile = normalizeFontWeight(config.mobileRankNumberFontWeight, rankNumberFwDesktop);
  const rankNumberColorDesktop = typeof config.rankNumberColor === 'string' && config.rankNumberColor.trim() !== '' ? config.rankNumberColor : '';
  const rankNumberColorTablet = typeof config.tabletRankNumberColor === 'string' && config.tabletRankNumberColor.trim() !== '' ? config.tabletRankNumberColor : rankNumberColorDesktop;
  const rankNumberColorMobile = typeof config.mobileRankNumberColor === 'string' && config.mobileRankNumberColor.trim() !== '' ? config.mobileRankNumberColor : rankNumberColorDesktop;
  const rankNumberBgDesktop = typeof config.rankNumberBgColor === 'string' && config.rankNumberBgColor.trim() !== '' ? config.rankNumberBgColor : '';
  const rankNumberBgTablet = typeof config.tabletRankNumberBgColor === 'string' && config.tabletRankNumberBgColor.trim() !== '' ? config.tabletRankNumberBgColor : rankNumberBgDesktop;
  const rankNumberBgMobile = typeof config.mobileRankNumberBgColor === 'string' && config.mobileRankNumberBgColor.trim() !== '' ? config.mobileRankNumberBgColor : rankNumberBgDesktop;
  const rankNumberRadiusDesktop = config.rankNumberBorderRadius !== undefined
    ? resolveWidgetRadius(config.rankNumberBorderRadius, '0 0 1rem 0')
    : undefined;
  const rankNumberRadiusTablet = (config as any).tabletRankNumberBorderRadius !== undefined
    ? resolveWidgetRadius((config as any).tabletRankNumberBorderRadius, rankNumberRadiusDesktop)
    : rankNumberRadiusDesktop;
  const rankNumberRadiusMobile = (config as any).mobileRankNumberBorderRadius !== undefined
    ? resolveWidgetRadius((config as any).mobileRankNumberBorderRadius, rankNumberRadiusDesktop)
    : rankNumberRadiusDesktop;

  const popCategoryColorDesktop = config.categoryLabelColor || 'var(--accent)';
  const popCategoryColorTablet = config.tabletCategoryLabelColor || popCategoryColorDesktop;
  const popCategoryColorMobile = config.mobileCategoryLabelColor || popCategoryColorDesktop;

  const popCategoryFsDesktop = config.categoryLabelFontSize ? `${config.categoryLabelFontSize}px` : '10px';
  const popCategoryFsTablet = config.tabletCategoryLabelFontSize ? `${config.tabletCategoryLabelFontSize}px` : popCategoryFsDesktop;
  const popCategoryFsMobile = config.mobileCategoryLabelFontSize ? `${config.mobileCategoryLabelFontSize}px` : popCategoryFsDesktop;

  const popCategoryLhDesktop = config.categoryLabelLineHeight !== undefined ? String(config.categoryLabelLineHeight) : '1';
  const popCategoryLhTablet = config.tabletCategoryLabelLineHeight !== undefined ? String(config.tabletCategoryLabelLineHeight) : popCategoryLhDesktop;
  const popCategoryLhMobile = config.mobileCategoryLabelLineHeight !== undefined ? String(config.mobileCategoryLabelLineHeight) : popCategoryLhDesktop;

  const popCategoryBgDesktop = config.categoryLabelBgColor || 'transparent';
  const popCategoryBgTablet = config.tabletCategoryLabelBgColor || popCategoryBgDesktop;
  const popCategoryBgMobile = config.mobileCategoryLabelBgColor || popCategoryBgDesktop;

  const popCategoryPyDesktop = config.categoryLabelPaddingY !== undefined ? `${config.categoryLabelPaddingY}px` : '2px';
  const popCategoryPyTablet = config.tabletCategoryLabelPaddingY !== undefined ? `${config.tabletCategoryLabelPaddingY}px` : popCategoryPyDesktop;
  const popCategoryPyMobile = config.mobileCategoryLabelPaddingY !== undefined ? `${config.mobileCategoryLabelPaddingY}px` : popCategoryPyDesktop;

  const popCategoryPxDesktop = config.categoryLabelPaddingX !== undefined ? `${config.categoryLabelPaddingX}px` : '8px';
  const popCategoryPxTablet = config.tabletCategoryLabelPaddingX !== undefined ? `${config.tabletCategoryLabelPaddingX}px` : popCategoryPxDesktop;
  const popCategoryPxMobile = config.mobileCategoryLabelPaddingX !== undefined ? `${config.mobileCategoryLabelPaddingX}px` : popCategoryPxDesktop;

  const popCategoryRadiusDesktop = config.categoryLabelBorderRadius !== undefined
    ? resolveWidgetRadius(config.categoryLabelBorderRadius, globalRadius)
    : globalRadius;
  const popCategoryRadiusTablet = config.tabletCategoryLabelBorderRadius !== undefined
    ? resolveWidgetRadius(config.tabletCategoryLabelBorderRadius, popCategoryRadiusDesktop)
    : popCategoryRadiusDesktop;
  const popCategoryRadiusMobile = config.mobileCategoryLabelBorderRadius !== undefined
    ? resolveWidgetRadius(config.mobileCategoryLabelBorderRadius, popCategoryRadiusDesktop)
    : popCategoryRadiusDesktop;

  const popCategoryMbDesktop = config.categoryLabelMarginBottom !== undefined ? `${config.categoryLabelMarginBottom}px` : '0px';
  const popCategoryMbTablet = config.tabletCategoryLabelMarginBottom !== undefined ? `${config.tabletCategoryLabelMarginBottom}px` : popCategoryMbDesktop;
  const popCategoryMbMobile = config.mobileCategoryLabelMarginBottom !== undefined ? `${config.mobileCategoryLabelMarginBottom}px` : popCategoryMbDesktop;

  const popMetaFsDesktop = config.metaFontSize ? `${config.metaFontSize}px` : '0.75rem';
  const popMetaFsTablet = config.tabletMetaFontSize ? `${config.tabletMetaFontSize}px` : popMetaFsDesktop;
  const popMetaFsMobile = config.mobileMetaFontSize ? `${config.mobileMetaFontSize}px` : popMetaFsDesktop;

  const metaFallback = 'var(--home-meta-color, #9ca3af)';
  const popMetaColorDesktop = useBoxDesktop
    ? (config.metaColor || metaFallback)
    : normalizeColor(config.metaColor, metaFallback);
  const popMetaColorTablet = useBoxTablet
    ? (config.tabletMetaColor || popMetaColorDesktop)
    : normalizeColor(config.tabletMetaColor, popMetaColorDesktop);
  const popMetaColorMobile = useBoxMobile
    ? (config.mobileMetaColor || popMetaColorDesktop)
    : normalizeColor(config.mobileMetaColor, popMetaColorDesktop);

  const popMetaLhDesktop = config.metaLineHeight !== undefined ? String(config.metaLineHeight) : '1.4';
  const popMetaLhTablet = config.tabletMetaLineHeight !== undefined ? String(config.tabletMetaLineHeight) : popMetaLhDesktop;
  const popMetaLhMobile = config.mobileMetaLineHeight !== undefined ? String(config.mobileMetaLineHeight) : popMetaLhDesktop;

  const popMetaMbDesktop = config.metaMarginBottom !== undefined ? `${config.metaMarginBottom}px` : '0px';
  const popMetaMbTablet = config.tabletMetaMarginBottom !== undefined ? `${config.tabletMetaMarginBottom}px` : popMetaMbDesktop;
  const popMetaMbMobile = config.mobileMetaMarginBottom !== undefined ? `${config.mobileMetaMarginBottom}px` : popMetaMbDesktop;

  // Render berdasarkan tipe widget
  const renderContent = () => {
    switch (widgetType) {
      case "category_list":
        const categoryData = (Array.isArray(posts) && posts.length > 0 && (posts[0]?.postCount !== undefined || posts[0]?._count?.posts !== undefined))
          ? posts
          : categories;
        if (!categoryData || categoryData.length === 0) return <p className="text-gray-500 text-sm">Tidak ada kategori.</p>;
        const visibleCategories = categoryData.slice(0, limit);
        return (
          <ul className="space-y-3">
            {visibleCategories.map((cat) => (
              <li key={cat.id}>
                <Link href={`/${cat.slug}`} className="flex items-center justify-between text-gray-700 hover:text-[var(--accent)] transition-colors group">
                  <span className="text-sm font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-[var(--accent)] transition-colors"></span>
                      {cat.name}
                  </span>
                  <span 
                      className="text-[10px] bg-gray-100 px-2 py-0.5 text-gray-500 font-semibold group-hover:bg-[var(--accent)] group-hover:text-white transition-colors"
                      style={{ borderRadius: 'var(--home-main-box-radius, 0.25rem)' }}
                  >
                      {cat.postCount ?? cat._count?.posts ?? 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        );

      case "ad_slot":
        return (
            <div 
                className="bg-gray-50 flex items-center justify-center min-h-[250px] text-gray-400 text-xs uppercase tracking-widest border border-dashed border-gray-300"
                style={{ borderRadius: 'var(--home-main-box-radius, 0.25rem)' }}
            >
                {config?.adCode ? (
                    <div dangerouslySetInnerHTML={{ __html: config.adCode }} />
                ) : (
                    <span>Space Iklan</span>
                )}
            </div>
        );

      case "recent_posts":
      case "popular_posts":
      default:
        if (!posts || posts.length === 0) return <p className="text-gray-500 text-sm">Belum ada berita.</p>;
        
        return (
          <div className="space-y-5">
            {posts.slice(0, limit).map((post, index) => {
              const postLink = post.category ? `/${post.category.slug}/${post.slug}` : `/post/${post.slug}`;
              const imageUrl = post.image || post.featuredImage?.fileUrl;
              const isVideo = String((post as any)?.type || "").toUpperCase() === "VIDEO";
              const authorName = post.author?.name || post.author?.fullName || post.authorName || (typeof post.author === 'string' ? post.author : undefined);
              const authorAvatar = (() => {
                const author = post.author;
                if (author && typeof author === "object") {
                  if (typeof author.avatar === "string" && author.avatar.trim() !== "") return normalizeAvatarUrl(author.avatar);
                  if (typeof author.avatarUrl === "string" && author.avatarUrl.trim() !== "") return normalizeAvatarUrl(author.avatarUrl);
                  if (typeof author.image === "string" && author.image.trim() !== "") return normalizeAvatarUrl(author.image);
                  if (typeof author.banner === "string" && author.banner.trim() !== "") return normalizeAvatarUrl(author.banner);
                }
                if (typeof post.authorAvatar === "string" && post.authorAvatar.trim() !== "") return normalizeAvatarUrl(post.authorAvatar);
                return "";
              })();
              const dateVal = post.publishedAt || post.createdAt || post.updatedAt;
              const numberLabel = String(index + 1).padStart(2, '0');

              return (
                <article key={post.id} className="popular-item grid grid-cols-[auto_1fr] gap-3 group items-start">
                  <div className="popular-left">
                    {imageUrl ? (
                      <>
                        <Link
                          href={postLink}
                          className="popular-thumb popular-thumb-link relative overflow-hidden bg-gray-100"
                        >
                          <Image
                            src={imageUrl}
                            alt={post.title}
                            fill
                            quality={90}
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes={thumbWidthDesktop}
                          />
                          {isVideo && (
                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5 translate-x-[0.5px]">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </span>
                            </span>
                          )}
                          <span
                            className="popular-index popular-index-overlay absolute top-0 left-0 inline-flex items-center justify-center text-white shadow-sm"
                            style={{
                              boxShadow: '0 10px 22px rgba(2,6,23,0.22)'
                            }}
                          >
                            {numberLabel}
                          </span>
                        </Link>
                        <span className="popular-index popular-index--with-image flex-shrink-0 flex items-center justify-center transition-colors border">
                          {numberLabel}
                        </span>
                      </>
                    ) : (
                      <span className="popular-index popular-index--no-image flex-shrink-0 flex items-center justify-center transition-colors border">
                        {numberLabel}
                      </span>
                    )}
                  </div>

                  <div className={`popular-content min-w-0 ${post.category ? 'has-category' : 'no-category'} ${(authorName || dateVal) ? 'has-meta' : 'no-meta'}`}>
                    {post.category && (
                      <div className="uppercase tracking-wider font-semibold popular-category">
                        <Link href={`/${post.category.slug}`} className="hover:underline">
                          {post.category.name}
                        </Link>
                      </div>
                    )}

                    <h4 className="font-bold leading-snug mb-1">
                      <Link href={postLink} className="popular-title transition-colors">
                        {post.title}
                      </Link>
                    </h4>

                    {(authorName || dateVal) && (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 popular-meta">
                        {authorName && (
                          <span className="popular-author inline-flex items-center gap-1.5">
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
                          </span>
                        )}
                        {authorName && dateVal && <span className="popular-dot opacity-60">•</span>}
                        {dateVal && (
                          <time
                            className="popular-date"
                            dateTime={(() => {
                              const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
                              return Number.isNaN(d.getTime()) ? "" : d.toISOString();
                            })()}
                          >
                            {formatLongDateId(dateVal)}
                          </time>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div id={`sidebar-widget-${block.id}`} className={`${visibilityClass}`} style={containerStyle}>
      <style dangerouslySetInnerHTML={{__html: `
        #sidebar-widget-${block.id} { margin-top: ${mTopMobile} !important; margin-right: ${mRightMobile} !important; margin-bottom: ${mBottomMobile} !important; margin-left: ${mLeftMobile} !important; padding-top: ${pTopMobile} !important; padding-right: ${pRightMobile} !important; padding-bottom: ${pBottomMobile} !important; padding-left: ${pLeftMobile} !important; --sw-thumb-radius: ${thumbRadiusMobile}; background-color: ${useBoxMobile ? boxColorMobile : 'transparent'} !important; border-radius: ${useBoxMobile ? boxBorderRadiusMobile : '0'} !important; border: ${useBoxMobile ? 'var(--box-border, 1px solid var(--border))' : 'none'} !important; box-shadow: ${useBoxMobile ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none'} !important; background-image: ${useBoxMobile && boxBgImageMobile ? `url(${boxBgImageMobile})` : 'none'} !important; background-size: ${useBoxMobile && boxBgImageMobile ? 'cover' : 'initial'} !important; background-position: ${useBoxMobile && boxBgImageMobile ? 'center' : 'initial'} !important; background-repeat: ${useBoxMobile && boxBgImageMobile ? 'no-repeat' : 'repeat'} !important; }
        @media (min-width: 768px) { #sidebar-widget-${block.id} { margin-top: ${mTopTablet} !important; margin-right: ${mRightTablet} !important; margin-bottom: ${mBottomTablet} !important; margin-left: ${mLeftTablet} !important; padding-top: ${pTopTablet} !important; padding-right: ${pRightTablet} !important; padding-bottom: ${pBottomTablet} !important; padding-left: ${pLeftTablet} !important; --sw-thumb-radius: ${thumbRadiusTablet}; background-color: ${useBoxTablet ? boxColorTablet : 'transparent'} !important; border-radius: ${useBoxTablet ? boxBorderRadiusTablet : '0'} !important; border: ${useBoxTablet ? 'var(--box-border, 1px solid var(--border))' : 'none'} !important; box-shadow: ${useBoxTablet ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none'} !important; background-image: ${useBoxTablet && boxBgImageTablet ? `url(${boxBgImageTablet})` : 'none'} !important; background-size: ${useBoxTablet && boxBgImageTablet ? 'cover' : 'initial'} !important; background-position: ${useBoxTablet && boxBgImageTablet ? 'center' : 'initial'} !important; background-repeat: ${useBoxTablet && boxBgImageTablet ? 'no-repeat' : 'repeat'} !important; } }
        @media (min-width: 1025px) { #sidebar-widget-${block.id} { margin-top: ${mTopDesktop} !important; margin-right: ${mRightDesktop} !important; margin-bottom: ${mBottomDesktop} !important; margin-left: ${mLeftDesktop} !important; padding-top: ${pTopDesktop} !important; padding-right: ${pRightDesktop} !important; padding-bottom: ${pBottomDesktop} !important; padding-left: ${pLeftDesktop} !important; --sw-thumb-radius: ${thumbRadiusDesktop}; background-color: ${useBoxDesktop ? boxColorDesktop : 'transparent'} !important; border-radius: ${useBoxDesktop ? boxBorderRadiusDesktop : '0'} !important; border: ${useBoxDesktop ? 'var(--box-border, 1px solid var(--border))' : 'none'} !important; box-shadow: ${useBoxDesktop ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none'} !important; background-image: ${useBoxDesktop && boxBgImageDesktop ? `url(${boxBgImageDesktop})` : 'none'} !important; background-size: ${useBoxDesktop && boxBgImageDesktop ? 'cover' : 'initial'} !important; background-position: ${useBoxDesktop && boxBgImageDesktop ? 'center' : 'initial'} !important; background-repeat: ${useBoxDesktop && boxBgImageDesktop ? 'no-repeat' : 'repeat'} !important; } }
      `}} />
      {isPostListWidget && (
        <style dangerouslySetInnerHTML={{__html: `
          #sidebar-widget-${block.id} .popular-thumb-link { display: ${showThumbMobile ? 'block' : 'none'}; }
          #sidebar-widget-${block.id} .popular-index--with-image { display: ${showThumbMobile ? 'none' : 'flex'}; }
          #sidebar-widget-${block.id} .popular-category { display: ${showCategoryMobile ? 'inline-block' : 'none'}; }
          #sidebar-widget-${block.id} .popular-meta { display: ${showMetaMobile ? 'flex' : 'none'}; }
          #sidebar-widget-${block.id} .popular-author { display: ${showMetaMobile && showAuthorMobile ? 'inline-flex' : 'none'}; }
          #sidebar-widget-${block.id} .popular-date { display: ${showMetaMobile && showDateMobile ? 'inline' : 'none'}; }
          #sidebar-widget-${block.id} .popular-dot { display: ${showMetaMobile && showAuthorMobile && showDateMobile ? 'inline' : 'none'}; }
          #sidebar-widget-${block.id} .popular-left { align-self: flex-start; }
          #sidebar-widget-${block.id} .popular-content { align-self: flex-start; display: flex; flex-direction: column; transform: translateY(${showCategoryMobile ? '-9px' : '0'}); }
          #sidebar-widget-${block.id} .popular-content.has-category h4 { margin-top: ${showCategoryMobile ? '-1px' : '0'}; }
          #sidebar-widget-${block.id} .popular-content.no-category { padding-top: 2px; }
          #sidebar-widget-${block.id} .popular-content.no-meta h4 { margin-bottom: 0; }
          #sidebar-widget-${block.id} .popular-meta { margin-top: 2px; }
          #sidebar-widget-${block.id} .popular-index--no-image { margin-top: 2px; }
          #sidebar-widget-${block.id} .popular-index {
            min-width: 2rem;
            height: 2rem;
            padding-left: 0.625rem;
            padding-right: 0.625rem;
            font-size: ${rankNumberFsMobile};
            font-weight: ${rankNumberFwMobile};
            letter-spacing: -0.02em;
            line-height: 1;
            border-radius: ${rankNumberRadiusMobile || '0 0 0.5rem 0'};
            border-color: color-mix(in oklab, var(--border) 70%, transparent);
            background-color: ${rankNumberBgMobile || 'color-mix(in oklab, var(--bg-elevated) 85%, transparent)'};
            color: ${rankNumberColorMobile || 'color-mix(in oklab, var(--fg-primary) 80%, transparent)'};
          }
          #sidebar-widget-${block.id} .popular-index-overlay {
            min-width: 2.1rem;
            height: 1.7rem;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            font-size: ${rankNumberFsMobile};
            font-weight: ${rankNumberFwMobile};
            color: ${rankNumberColorMobile || '#ffffff'};
            border-radius: ${rankNumberRadiusMobile || '0 0 0.5rem 0'};
            background: ${rankNumberBgMobile || 'linear-gradient(135deg, var(--accent), rgba(2,6,23,0.35))'};
          }
          #sidebar-widget-${block.id} .popular-item:hover .popular-index {
            background-color: var(--accent);
            border-color: var(--accent);
            color: #ffffff;
          }

          #sidebar-widget-${block.id} .popular-thumb {
            display: block;
            ${thumbRatioMobile ? `width: ${thumbWidthMobile}; aspect-ratio: ${thumbRatioMobile}; height: auto;` : `width: ${thumbWidthMobile}; height: ${thumbHeightMobile};`}
            border-radius: ${thumbRadiusMobile};
          }
          #sidebar-widget-${block.id} .popular-title {
            display: block;
            font-size: ${popTitleFsMobile};
            line-height: ${popTitleLhMobile};
            font-weight: ${popTitleFwMobile};
            color: ${popTitleColorMobile};
          }
          #sidebar-widget-${block.id} .popular-title:hover { color: ${popTitleHoverColorMobile}; }
          #sidebar-widget-${block.id} .popular-category {
            font-size: ${popCategoryFsMobile};
            line-height: ${popCategoryLhMobile};
            color: ${popCategoryColorMobile};
            background-color: ${popCategoryBgMobile};
            border-radius: ${popCategoryRadiusMobile};
            padding-top: ${popCategoryBgMobile !== 'transparent' && popCategoryBgMobile !== 'none' ? popCategoryPyMobile : '0'};
            padding-bottom: ${popCategoryBgMobile !== 'transparent' && popCategoryBgMobile !== 'none' ? popCategoryPyMobile : '0'};
            padding-left: ${popCategoryBgMobile !== 'transparent' && popCategoryBgMobile !== 'none' ? popCategoryPxMobile : '0'};
            padding-right: ${popCategoryBgMobile !== 'transparent' && popCategoryBgMobile !== 'none' ? popCategoryPxMobile : '0'};
            margin-bottom: ${popCategoryMbMobile};
          }
          #sidebar-widget-${block.id} .popular-category a { color: inherit; }
          #sidebar-widget-${block.id} .popular-meta {
            font-size: ${popMetaFsMobile};
            color: ${popMetaColorMobile};
            line-height: ${popMetaLhMobile};
            margin-bottom: ${popMetaMbMobile};
          }
          @media (min-width: 768px) {
            #sidebar-widget-${block.id} .popular-content { transform: translateY(${showCategoryTablet ? '-9px' : '0'}); }
            #sidebar-widget-${block.id} .popular-content.no-category { padding-top: 2px; }
            #sidebar-widget-${block.id} .popular-index--no-image { margin-top: 2px; }
            #sidebar-widget-${block.id} .popular-index {
              min-width: 2.1rem;
              height: 2.1rem;
              padding-left: 0.7rem;
              padding-right: 0.7rem;
              font-size: ${rankNumberFsTablet};
              font-weight: ${rankNumberFwTablet};
              border-radius: ${rankNumberRadiusTablet || '0 0 0.55rem 0'};
              background-color: ${rankNumberBgTablet || 'color-mix(in oklab, var(--bg-elevated) 85%, transparent)'};
              color: ${rankNumberColorTablet || 'color-mix(in oklab, var(--fg-primary) 80%, transparent)'};
            }
            #sidebar-widget-${block.id} .popular-index-overlay {
              min-width: 2.25rem;
              height: 1.8rem;
              padding-left: 0.55rem;
              padding-right: 0.55rem;
              font-size: ${rankNumberFsTablet};
              font-weight: ${rankNumberFwTablet};
              border-radius: ${rankNumberRadiusTablet || '0 0 0.55rem 0'};
              background: ${rankNumberBgTablet || 'linear-gradient(135deg, var(--accent), rgba(2,6,23,0.35))'};
              color: ${rankNumberColorTablet || '#ffffff'};
            }
          }
          @media (min-width: 768px) and (max-width: 1024px) {
            #sidebar-widget-${block.id} .popular-thumb-link { display: ${showThumbTablet ? 'block' : 'none'}; }
            #sidebar-widget-${block.id} .popular-index--with-image { display: ${showThumbTablet ? 'none' : 'flex'}; }
            #sidebar-widget-${block.id} .popular-category { display: ${showCategoryTablet ? 'inline-block' : 'none'}; }
            #sidebar-widget-${block.id} .popular-meta { display: ${showMetaTablet ? 'flex' : 'none'}; }
            #sidebar-widget-${block.id} .popular-author { display: ${showMetaTablet && showAuthorTablet ? 'inline-flex' : 'none'}; }
            #sidebar-widget-${block.id} .popular-date { display: ${showMetaTablet && showDateTablet ? 'inline' : 'none'}; }
            #sidebar-widget-${block.id} .popular-dot { display: ${showMetaTablet && showAuthorTablet && showDateTablet ? 'inline' : 'none'}; }
            #sidebar-widget-${block.id} .popular-thumb {
              ${thumbRatioTablet ? `width: ${thumbWidthTablet}; aspect-ratio: ${thumbRatioTablet}; height: auto;` : `width: ${thumbWidthTablet}; height: ${thumbHeightTablet};`}
              border-radius: ${thumbRadiusTablet};
            }
            #sidebar-widget-${block.id} .popular-title { font-size: ${popTitleFsTablet}; line-height: ${popTitleLhTablet}; font-weight: ${popTitleFwTablet}; color: ${popTitleColorTablet}; }
            #sidebar-widget-${block.id} .popular-title:hover { color: ${popTitleHoverColorTablet}; }
            #sidebar-widget-${block.id} .popular-category { font-size: ${popCategoryFsTablet}; line-height: ${popCategoryLhTablet}; color: ${popCategoryColorTablet}; background-color: ${popCategoryBgTablet}; border-radius: ${popCategoryRadiusTablet}; margin-bottom: ${popCategoryMbTablet}; padding-top: ${popCategoryBgTablet !== 'transparent' && popCategoryBgTablet !== 'none' ? popCategoryPyTablet : '0'}; padding-bottom: ${popCategoryBgTablet !== 'transparent' && popCategoryBgTablet !== 'none' ? popCategoryPyTablet : '0'}; padding-left: ${popCategoryBgTablet !== 'transparent' && popCategoryBgTablet !== 'none' ? popCategoryPxTablet : '0'}; padding-right: ${popCategoryBgTablet !== 'transparent' && popCategoryBgTablet !== 'none' ? popCategoryPxTablet : '0'}; }
            #sidebar-widget-${block.id} .popular-content.has-category h4 { margin-top: ${showCategoryTablet ? '-1px' : '0'}; }
            #sidebar-widget-${block.id} .popular-meta { font-size: ${popMetaFsTablet}; color: ${popMetaColorTablet}; line-height: ${popMetaLhTablet}; margin-bottom: ${popMetaMbTablet}; }
          }
          @media (min-width: 1025px) {
            #sidebar-widget-${block.id} .popular-thumb-link { display: ${showThumbDesktop ? 'block' : 'none'}; }
            #sidebar-widget-${block.id} .popular-index--with-image { display: ${showThumbDesktop ? 'none' : 'flex'}; }
            #sidebar-widget-${block.id} .popular-category { display: ${showCategoryDesktop ? 'inline-block' : 'none'}; }
            #sidebar-widget-${block.id} .popular-meta { display: ${showMetaDesktop ? 'flex' : 'none'}; }
            #sidebar-widget-${block.id} .popular-author { display: ${showMetaDesktop && showAuthorDesktop ? 'inline-flex' : 'none'}; }
            #sidebar-widget-${block.id} .popular-date { display: ${showMetaDesktop && showDateDesktop ? 'inline' : 'none'}; }
            #sidebar-widget-${block.id} .popular-dot { display: ${showMetaDesktop && showAuthorDesktop && showDateDesktop ? 'inline' : 'none'}; }
            #sidebar-widget-${block.id} .popular-thumb {
              ${thumbRatioDesktop ? `width: ${thumbWidthDesktop}; aspect-ratio: ${thumbRatioDesktop}; height: auto;` : `width: ${thumbWidthDesktop}; height: ${thumbHeightDesktop};`}
              border-radius: ${thumbRadiusDesktop};
            }
            #sidebar-widget-${block.id} .popular-title { font-size: ${popTitleFsDesktop}; line-height: ${popTitleLhDesktop}; font-weight: ${popTitleFwDesktop}; color: ${popTitleColorDesktop}; }
            #sidebar-widget-${block.id} .popular-title:hover { color: ${popTitleHoverColorDesktop}; }
            #sidebar-widget-${block.id} .popular-category { font-size: ${popCategoryFsDesktop}; line-height: ${popCategoryLhDesktop}; color: ${popCategoryColorDesktop}; background-color: ${popCategoryBgDesktop}; border-radius: ${popCategoryRadiusDesktop}; margin-bottom: ${popCategoryMbDesktop}; padding-top: ${popCategoryBgDesktop !== 'transparent' && popCategoryBgDesktop !== 'none' ? popCategoryPyDesktop : '0'}; padding-bottom: ${popCategoryBgDesktop !== 'transparent' && popCategoryBgDesktop !== 'none' ? popCategoryPyDesktop : '0'}; padding-left: ${popCategoryBgDesktop !== 'transparent' && popCategoryBgDesktop !== 'none' ? popCategoryPxDesktop : '0'}; padding-right: ${popCategoryBgDesktop !== 'transparent' && popCategoryBgDesktop !== 'none' ? popCategoryPxDesktop : '0'}; }
            #sidebar-widget-${block.id} .popular-meta { font-size: ${popMetaFsDesktop}; color: ${popMetaColorDesktop}; line-height: ${popMetaLhDesktop}; margin-bottom: ${popMetaMbDesktop}; }
            #sidebar-widget-${block.id} .popular-content { transform: translateY(${showCategoryDesktop ? '-9px' : '0'}); }
            #sidebar-widget-${block.id} .popular-content.has-category h4 { margin-top: ${showCategoryDesktop ? '-1px' : '0'}; }
            #sidebar-widget-${block.id} .popular-content.no-category { padding-top: 2px; }
            #sidebar-widget-${block.id} .popular-index--no-image { margin-top: 2px; }
            #sidebar-widget-${block.id} .popular-index {
              min-width: 2.2rem;
              height: 2.2rem;
              padding-left: 0.75rem;
              padding-right: 0.75rem;
              font-size: ${rankNumberFsDesktop};
              font-weight: ${rankNumberFwDesktop};
              border-radius: ${rankNumberRadiusDesktop || '0 0 0.6rem 0'};
              background-color: ${rankNumberBgDesktop || 'color-mix(in oklab, var(--bg-elevated) 85%, transparent)'};
              color: ${rankNumberColorDesktop || 'color-mix(in oklab, var(--fg-primary) 80%, transparent)'};
            }
            #sidebar-widget-${block.id} .popular-index-overlay {
              min-width: 2.35rem;
              height: 1.85rem;
              padding-left: 0.6rem;
              padding-right: 0.6rem;
              font-size: ${rankNumberFsDesktop};
              font-weight: ${rankNumberFwDesktop};
              border-radius: ${rankNumberRadiusDesktop || '0 0 0.6rem 0'};
              background: ${rankNumberBgDesktop || 'linear-gradient(135deg, var(--accent), rgba(2,6,23,0.35))'};
              color: ${rankNumberColorDesktop || '#ffffff'};
            }
          }
        `}} />
      )}
      {(config.showTitle !== false) && (
          <h3 className="font-bold mb-3 border-b border-gray-100 pb-3 flex items-center theme-widget-title">
              <div className="widget-title-bar w-1 h-5 mr-3" style={{ borderRadius: 'var(--home-main-box-radius, 0.75rem)' }}></div>
              <span>{title}</span>
          </h3>
      )}
      {renderContent()}
    </div>
  );
}
