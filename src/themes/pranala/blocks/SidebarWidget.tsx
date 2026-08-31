"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBool, getResponsiveBoolValues, getResponsiveValue, getResponsiveValues, type ResponsiveDevice } from "./responsive";
import { normalizeLegacyGlobalImageRadius, resolveWidgetRadius } from "./radius";
import { sanitizeContent, sanitizeCssUrl } from "@/lib/sanitizer";
import { getFirstImageFromContent, getPostImageUrl } from "../blockpost/helpers";

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

  const normalizeColorToken = (value: unknown) =>
    typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, "") : "";

  const isNeutralSurfaceColor = (value: unknown) => {
    const v = normalizeColorToken(value);
    return [
      "#fff",
      "#ffffff",
      "#f9fafb",
      "#f8fafc",
      "#f3f4f6",
      "#f5f5f5",
      "white",
      "rgb(255,255,255)",
      "rgba(255,255,255,1)",
      "rgba(255,255,255,0.95)",
      "rgba(255,255,255,0.9)",
      "var(--bg-elevated)",
      "var(--bg-elevated,#ffffff)",
      "var(--bg-surface)",
      "var(--bg-surface,#f9fafb)",
      "var(--card,white)",
      "var(--card,#ffffff)",
    ].includes(v);
  };

  const normalizeColor = (value: unknown, fallback: string) => {
    if (typeof value !== "string") return fallback;
    const v = value.trim();
    if (!v || isNeutralSurfaceColor(v)) return fallback;
    return value;
  };

  const normalizeAlign = (value: unknown): "left" | "center" | "right" => {
    if (value === "center" || value === "right") return value;
    return "left";
  };

  const isTransparentLike = (value: string) => {
    const v = value.trim().toLowerCase();
    return v === "" || v === "transparent" || v === "none" || v === "inherit" || v === "initial";
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

  const widgetTitleSizeFallback = "var(--home-widget-title-size, 20px)";
  const desktopTitleRaw = config.blockTitleFontSize ?? config.widgetTitleFontSize;
  const blockTitleFsMobile = (config as any).mobileBlockTitleFontSize !== undefined
    ? formatFontSize((config as any).mobileBlockTitleFontSize, widgetTitleSizeFallback)
    : formatFontSize(desktopTitleRaw, widgetTitleSizeFallback);
  const blockTitleFsTablet = (config as any).tabletBlockTitleFontSize !== undefined
    ? formatFontSize((config as any).tabletBlockTitleFontSize, blockTitleFsMobile)
    : blockTitleFsMobile;
  const blockTitleFsDesktop = desktopTitleRaw !== undefined
    ? formatFontSize(desktopTitleRaw, blockTitleFsTablet)
    : blockTitleFsTablet;
  const blockTitleLhMobile = String((config as any).mobileBlockTitleLineHeight ?? config.blockTitleLineHeight ?? "1.3");
  const blockTitleLhTablet = String((config as any).tabletBlockTitleLineHeight ?? config.blockTitleLineHeight ?? blockTitleLhMobile);
  const blockTitleLhDesktop = String(config.blockTitleLineHeight ?? blockTitleLhTablet);
  const blockTitleMbMobile = (config as any).mobileBlockTitleMarginBottom !== undefined ? `${(config as any).mobileBlockTitleMarginBottom}px` : (config.blockTitleMarginBottom !== undefined ? `${config.blockTitleMarginBottom}px` : "12px");
  const blockTitleMbTablet = (config as any).tabletBlockTitleMarginBottom !== undefined ? `${(config as any).tabletBlockTitleMarginBottom}px` : (config.blockTitleMarginBottom !== undefined ? `${config.blockTitleMarginBottom}px` : blockTitleMbMobile);
  const blockTitleMbDesktop = config.blockTitleMarginBottom !== undefined ? `${config.blockTitleMarginBottom}px` : blockTitleMbTablet;
  const blockTitlePbMobile = (config as any).mobileBlockTitlePaddingBottom !== undefined ? `${(config as any).mobileBlockTitlePaddingBottom}px` : (config.blockTitlePaddingBottom !== undefined ? `${config.blockTitlePaddingBottom}px` : "12px");
  const blockTitlePbTablet = (config as any).tabletBlockTitlePaddingBottom !== undefined ? `${(config as any).tabletBlockTitlePaddingBottom}px` : (config.blockTitlePaddingBottom !== undefined ? `${config.blockTitlePaddingBottom}px` : blockTitlePbMobile);
  const blockTitlePbDesktop = config.blockTitlePaddingBottom !== undefined ? `${config.blockTitlePaddingBottom}px` : blockTitlePbTablet;

  // --- BOX / CONTAINER LOGIC ---
  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const useBoxDesktop = useBoxValues.desktop;
  const useBoxTablet = useBoxValues.tablet;
  const useBoxMobile = useBoxValues.mobile;
  const boxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = normalizeColor(boxColorValues.desktop, 'transparent');
  const boxColorTablet = normalizeColor(boxColorValues.tablet, boxColorDesktop);
  const boxColorMobile = normalizeColor(boxColorValues.mobile, boxColorDesktop);
  const boxBgImageDesktop = sanitizeCssUrl(typeof config.backgroundImage === "string" ? config.backgroundImage : "");
  const boxBgImageTablet = sanitizeCssUrl(
    typeof (config as any).tabletBackgroundImage === "string" && (config as any).tabletBackgroundImage.trim() !== ""
      ? (config as any).tabletBackgroundImage
      : boxBgImageDesktop
  );
  const boxBgImageMobile = sanitizeCssUrl(
    typeof (config as any).mobileBackgroundImage === "string" && (config as any).mobileBackgroundImage.trim() !== ""
      ? (config as any).mobileBackgroundImage
      : boxBgImageDesktop
  );
  const boxBgSizeDesktop = typeof (config as any).backgroundSize === "string" && (config as any).backgroundSize.trim() !== ""
    ? (config as any).backgroundSize.trim()
    : "cover";
  const boxBgSizeTablet = typeof (config as any).tabletBackgroundSize === "string" && (config as any).tabletBackgroundSize.trim() !== ""
    ? (config as any).tabletBackgroundSize.trim()
    : boxBgSizeDesktop;
  const boxBgSizeMobile = typeof (config as any).mobileBackgroundSize === "string" && (config as any).mobileBackgroundSize.trim() !== ""
    ? (config as any).mobileBackgroundSize.trim()
    : boxBgSizeDesktop;
  const boxBgPositionDesktop = typeof (config as any).backgroundPosition === "string" && (config as any).backgroundPosition.trim() !== ""
    ? (config as any).backgroundPosition.trim()
    : "center";
  const boxBgPositionTablet = typeof (config as any).tabletBackgroundPosition === "string" && (config as any).tabletBackgroundPosition.trim() !== ""
    ? (config as any).tabletBackgroundPosition.trim()
    : boxBgPositionDesktop;
  const boxBgPositionMobile = typeof (config as any).mobileBackgroundPosition === "string" && (config as any).mobileBackgroundPosition.trim() !== ""
    ? (config as any).mobileBackgroundPosition.trim()
    : boxBgPositionDesktop;
  const boxBgRepeatDesktop = typeof (config as any).backgroundRepeat === "string" && (config as any).backgroundRepeat.trim() !== ""
    ? (config as any).backgroundRepeat.trim()
    : "no-repeat";
  const boxBgRepeatTablet = typeof (config as any).tabletBackgroundRepeat === "string" && (config as any).tabletBackgroundRepeat.trim() !== ""
    ? (config as any).tabletBackgroundRepeat.trim()
    : boxBgRepeatDesktop;
  const boxBgRepeatMobile = typeof (config as any).mobileBackgroundRepeat === "string" && (config as any).mobileBackgroundRepeat.trim() !== ""
    ? (config as any).mobileBackgroundRepeat.trim()
    : boxBgRepeatDesktop;
  const boxBgAttachmentDesktop = typeof (config as any).backgroundAttachment === "string" && (config as any).backgroundAttachment.trim() !== ""
    ? (config as any).backgroundAttachment.trim()
    : "scroll";
  const boxBgAttachmentTablet = typeof (config as any).tabletBackgroundAttachment === "string" && (config as any).tabletBackgroundAttachment.trim() !== ""
    ? (config as any).tabletBackgroundAttachment.trim()
    : boxBgAttachmentDesktop;
  const boxBgAttachmentMobile = typeof (config as any).mobileBackgroundAttachment === "string" && (config as any).mobileBackgroundAttachment.trim() !== ""
    ? (config as any).mobileBackgroundAttachment.trim()
    : boxBgAttachmentDesktop;
  const boxOverlayColorDesktop = typeof (config as any).backgroundOverlayColor === "string"
    ? (config as any).backgroundOverlayColor
    : "transparent";
  const boxOverlayColorTablet = typeof (config as any).tabletBackgroundOverlayColor === "string" && (config as any).tabletBackgroundOverlayColor.trim() !== ""
    ? (config as any).tabletBackgroundOverlayColor
    : boxOverlayColorDesktop;
  const boxOverlayColorMobile = typeof (config as any).mobileBackgroundOverlayColor === "string" && (config as any).mobileBackgroundOverlayColor.trim() !== ""
    ? (config as any).mobileBackgroundOverlayColor
    : boxOverlayColorDesktop;
  const boxOverlayOpacityDesktop = Math.min(100, Math.max(0, Number((config as any).backgroundOverlayOpacity ?? 45) || 0));
  const boxOverlayOpacityTablet = Math.min(100, Math.max(0, Number((config as any).tabletBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const boxOverlayOpacityMobile = Math.min(100, Math.max(0, Number((config as any).mobileBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const effectiveUseBoxDesktop = useBoxDesktop && (!isTransparentLike(boxColorDesktop) || boxBgImageDesktop !== "");
  const effectiveUseBoxTablet = useBoxTablet && (!isTransparentLike(boxColorTablet) || boxBgImageTablet !== "");
  const effectiveUseBoxMobile = useBoxMobile && (!isTransparentLike(boxColorMobile) || boxBgImageMobile !== "");
  
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

  const paddingFallbackMobile = '0px';
  const paddingFallbackTablet = '0px';
  const paddingFallbackDesktop = '0px';
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
  const globalRadius = 'var(--global-image-radius, var(--home-main-box-radius, 0.75rem))';
  const boxBorderRadiusDesktop = config.boxBorderRadius !== undefined
    ? resolveWidgetRadius(config.boxBorderRadius, globalRadius)
    : globalRadius;
  const boxBorderRadiusTablet = (config as any).tabletBoxBorderRadius !== undefined
    ? resolveWidgetRadius((config as any).tabletBoxBorderRadius, boxBorderRadiusDesktop)
    : boxBorderRadiusDesktop;
  const boxBorderRadiusMobile = (config as any).mobileBoxBorderRadius !== undefined
    ? resolveWidgetRadius((config as any).mobileBoxBorderRadius, boxBorderRadiusDesktop)
    : boxBorderRadiusDesktop;
  const boxPtMobile = (config as any).mobileBoxPaddingTop !== undefined ? `${(config as any).mobileBoxPaddingTop}px` : ((config as any).boxPaddingTop !== undefined ? `${(config as any).boxPaddingTop}px` : (effectiveUseBoxMobile ? 'var(--box-padding, 1.5rem)' : '0px'));
  const boxPrMobile = (config as any).mobileBoxPaddingRight !== undefined ? `${(config as any).mobileBoxPaddingRight}px` : ((config as any).boxPaddingRight !== undefined ? `${(config as any).boxPaddingRight}px` : (effectiveUseBoxMobile ? 'var(--box-padding, 1.5rem)' : '0px'));
  const boxPbMobile = (config as any).mobileBoxPaddingBottom !== undefined ? `${(config as any).mobileBoxPaddingBottom}px` : ((config as any).boxPaddingBottom !== undefined ? `${(config as any).boxPaddingBottom}px` : (effectiveUseBoxMobile ? 'var(--box-padding, 1.5rem)' : '0px'));
  const boxPlMobile = (config as any).mobileBoxPaddingLeft !== undefined ? `${(config as any).mobileBoxPaddingLeft}px` : ((config as any).boxPaddingLeft !== undefined ? `${(config as any).boxPaddingLeft}px` : (effectiveUseBoxMobile ? 'var(--box-padding, 1.5rem)' : '0px'));
  const boxPtTablet = (config as any).tabletBoxPaddingTop !== undefined ? `${(config as any).tabletBoxPaddingTop}px` : ((config as any).boxPaddingTop !== undefined ? `${(config as any).boxPaddingTop}px` : (effectiveUseBoxTablet ? boxPtMobile : '0px'));
  const boxPrTablet = (config as any).tabletBoxPaddingRight !== undefined ? `${(config as any).tabletBoxPaddingRight}px` : ((config as any).boxPaddingRight !== undefined ? `${(config as any).boxPaddingRight}px` : (effectiveUseBoxTablet ? boxPrMobile : '0px'));
  const boxPbTablet = (config as any).tabletBoxPaddingBottom !== undefined ? `${(config as any).tabletBoxPaddingBottom}px` : ((config as any).boxPaddingBottom !== undefined ? `${(config as any).boxPaddingBottom}px` : (effectiveUseBoxTablet ? boxPbMobile : '0px'));
  const boxPlTablet = (config as any).tabletBoxPaddingLeft !== undefined ? `${(config as any).tabletBoxPaddingLeft}px` : ((config as any).boxPaddingLeft !== undefined ? `${(config as any).boxPaddingLeft}px` : (effectiveUseBoxTablet ? boxPlMobile : '0px'));
  const boxPtDesktop = (config as any).boxPaddingTop !== undefined ? `${(config as any).boxPaddingTop}px` : (effectiveUseBoxDesktop ? boxPtTablet : '0px');
  const boxPrDesktop = (config as any).boxPaddingRight !== undefined ? `${(config as any).boxPaddingRight}px` : (effectiveUseBoxDesktop ? boxPrTablet : '0px');
  const boxPbDesktop = (config as any).boxPaddingBottom !== undefined ? `${(config as any).boxPaddingBottom}px` : (effectiveUseBoxDesktop ? boxPbTablet : '0px');
  const boxPlDesktop = (config as any).boxPaddingLeft !== undefined ? `${(config as any).boxPaddingLeft}px` : (effectiveUseBoxDesktop ? boxPlTablet : '0px');

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
  const normalizedImageRadiusDesktop = normalizeLegacyGlobalImageRadius(config.imageBorderRadius);
  const normalizedImageRadiusTablet = normalizeLegacyGlobalImageRadius((config as any).tabletImageBorderRadius ?? config.imageBorderRadius);
  const normalizedImageRadiusMobile = normalizeLegacyGlobalImageRadius((config as any).mobileImageBorderRadius ?? config.imageBorderRadius);
  const thumbRadiusDesktop = normalizedImageRadiusDesktop !== undefined
    ? resolveWidgetRadius(normalizedImageRadiusDesktop, globalRadius)
    : globalRadius;
  const thumbRadiusTablet = normalizedImageRadiusTablet !== undefined
    ? resolveWidgetRadius(normalizedImageRadiusTablet, thumbRadiusDesktop)
    : thumbRadiusDesktop;
  const thumbRadiusMobile = normalizedImageRadiusMobile !== undefined
    ? resolveWidgetRadius(normalizedImageRadiusMobile, thumbRadiusDesktop)
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
  const popTitleFwDesktop = normalizeFontWeight(config.titleFontWeight, 'var(--home-news-title-weight, 600)');
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
  const rankNumberCornerRadiusDesktop = "0 0 0.35rem 0";
  const rankNumberCornerRadiusTablet = rankNumberCornerRadiusDesktop;
  const rankNumberCornerRadiusMobile = rankNumberCornerRadiusDesktop;

  const popCategoryColorDesktop = config.categoryLabelTextColor || config.categoryLabelColor || config.categoryTextColor || 'var(--accent)';
  const popCategoryColorTablet = (config as any).tabletCategoryLabelTextColor || config.tabletCategoryLabelColor || (config as any).tabletCategoryTextColor || popCategoryColorDesktop;
  const popCategoryColorMobile = (config as any).mobileCategoryLabelTextColor || config.mobileCategoryLabelColor || (config as any).mobileCategoryTextColor || popCategoryColorDesktop;

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
  const popMetaColorDesktop = effectiveUseBoxDesktop
    ? (config.metaColor || metaFallback)
    : normalizeColor(config.metaColor, metaFallback);
  const popMetaColorTablet = effectiveUseBoxTablet
    ? (config.tabletMetaColor || popMetaColorDesktop)
    : normalizeColor(config.tabletMetaColor, popMetaColorDesktop);
  const popMetaColorMobile = effectiveUseBoxMobile
    ? (config.mobileMetaColor || popMetaColorDesktop)
    : normalizeColor(config.mobileMetaColor, popMetaColorDesktop);

  const popMetaLhDesktop = config.metaLineHeight !== undefined ? String(config.metaLineHeight) : '1.4';
  const popMetaLhTablet = config.tabletMetaLineHeight !== undefined ? String(config.tabletMetaLineHeight) : popMetaLhDesktop;
  const popMetaLhMobile = config.mobileMetaLineHeight !== undefined ? String(config.mobileMetaLineHeight) : popMetaLhDesktop;
  const popMetaFwDesktop = normalizeFontWeight(config.metaFontWeight, 'var(--home-meta-weight, 500)');
  const popMetaFwTablet = normalizeFontWeight(config.tabletMetaFontWeight, popMetaFwDesktop);
  const popMetaFwMobile = normalizeFontWeight(config.mobileMetaFontWeight, popMetaFwDesktop);

  const popMetaMbDesktop = config.metaMarginBottom !== undefined ? `${config.metaMarginBottom}px` : '0px';
  const popMetaMbTablet = config.tabletMetaMarginBottom !== undefined ? `${config.tabletMetaMarginBottom}px` : popMetaMbDesktop;
  const popMetaMbMobile = config.mobileMetaMarginBottom !== undefined ? `${config.mobileMetaMarginBottom}px` : popMetaMbDesktop;

  const currentUseBox = device === "mobile" ? effectiveUseBoxMobile : device === "tablet" ? effectiveUseBoxTablet : effectiveUseBoxDesktop;
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
  const currentBoxBorderRadius = device === "mobile" ? boxBorderRadiusMobile : device === "tablet" ? boxBorderRadiusTablet : boxBorderRadiusDesktop;
  const currentBoxPt = device === "mobile" ? boxPtMobile : device === "tablet" ? boxPtTablet : boxPtDesktop;
  const currentBoxPr = device === "mobile" ? boxPrMobile : device === "tablet" ? boxPrTablet : boxPrDesktop;
  const currentBoxPb = device === "mobile" ? boxPbMobile : device === "tablet" ? boxPbTablet : boxPbDesktop;
  const currentBoxPl = device === "mobile" ? boxPlMobile : device === "tablet" ? boxPlTablet : boxPlDesktop;
  const currentThumbRatio = device === "mobile" ? thumbRatioMobile : device === "tablet" ? thumbRatioTablet : thumbRatioDesktop;
  const currentThumbWidth = device === "mobile" ? thumbWidthMobile : device === "tablet" ? thumbWidthTablet : thumbWidthDesktop;
  const currentThumbHeight = device === "mobile" ? thumbHeightMobile : device === "tablet" ? thumbHeightTablet : thumbHeightDesktop;
  const currentThumbRadius = device === "mobile" ? thumbRadiusMobile : device === "tablet" ? thumbRadiusTablet : thumbRadiusDesktop;
  const currentShowThumb = device === "mobile" ? showThumbMobile : device === "tablet" ? showThumbTablet : showThumbDesktop;
  const currentShowCategory = device === "mobile" ? showCategoryMobile : device === "tablet" ? showCategoryTablet : showCategoryDesktop;
  const currentShowMeta = device === "mobile" ? showMetaMobile : device === "tablet" ? showMetaTablet : showMetaDesktop;
  const currentShowAuthor = device === "mobile" ? showAuthorMobile : device === "tablet" ? showAuthorTablet : showAuthorDesktop;
  const currentShowDate = device === "mobile" ? showDateMobile : device === "tablet" ? showDateTablet : showDateDesktop;
  const currentRankNumberFs = device === "mobile" ? rankNumberFsMobile : device === "tablet" ? rankNumberFsTablet : rankNumberFsDesktop;
  const currentRankNumberFw = device === "mobile" ? rankNumberFwMobile : device === "tablet" ? rankNumberFwTablet : rankNumberFwDesktop;
  const currentRankNumberColor = device === "mobile" ? rankNumberColorMobile : device === "tablet" ? rankNumberColorTablet : rankNumberColorDesktop;
  const currentRankNumberBg = device === "mobile" ? rankNumberBgMobile : device === "tablet" ? rankNumberBgTablet : rankNumberBgDesktop;
  const currentRankNumberCornerRadius = device === "mobile"
    ? rankNumberCornerRadiusMobile
    : device === "tablet"
      ? rankNumberCornerRadiusTablet
      : rankNumberCornerRadiusDesktop;
  const currentPopTitleFs = device === "mobile" ? popTitleFsMobile : device === "tablet" ? popTitleFsTablet : popTitleFsDesktop;
  const currentPopTitleLh = device === "mobile" ? popTitleLhMobile : device === "tablet" ? popTitleLhTablet : popTitleLhDesktop;
  const currentPopTitleFw = device === "mobile" ? popTitleFwMobile : device === "tablet" ? popTitleFwTablet : popTitleFwDesktop;
  const currentPopTitleColor = device === "mobile" ? popTitleColorMobile : device === "tablet" ? popTitleColorTablet : popTitleColorDesktop;
  const currentPopTitleHoverColor = device === "mobile" ? popTitleHoverColorMobile : device === "tablet" ? popTitleHoverColorTablet : popTitleHoverColorDesktop;
  const currentPopCategoryColor = device === "mobile" ? popCategoryColorMobile : device === "tablet" ? popCategoryColorTablet : popCategoryColorDesktop;
  const currentPopCategoryFs = device === "mobile" ? popCategoryFsMobile : device === "tablet" ? popCategoryFsTablet : popCategoryFsDesktop;
  const currentPopCategoryLh = device === "mobile" ? popCategoryLhMobile : device === "tablet" ? popCategoryLhTablet : popCategoryLhDesktop;
  const currentPopCategoryBg = device === "mobile" ? popCategoryBgMobile : device === "tablet" ? popCategoryBgTablet : popCategoryBgDesktop;
  const currentPopCategoryPy = device === "mobile" ? popCategoryPyMobile : device === "tablet" ? popCategoryPyTablet : popCategoryPyDesktop;
  const currentPopCategoryPx = device === "mobile" ? popCategoryPxMobile : device === "tablet" ? popCategoryPxTablet : popCategoryPxDesktop;
  const currentPopCategoryRadius = device === "mobile" ? popCategoryRadiusMobile : device === "tablet" ? popCategoryRadiusTablet : popCategoryRadiusDesktop;
  const currentPopCategoryMb = device === "mobile" ? popCategoryMbMobile : device === "tablet" ? popCategoryMbTablet : popCategoryMbDesktop;
  const currentPopMetaFs = device === "mobile" ? popMetaFsMobile : device === "tablet" ? popMetaFsTablet : popMetaFsDesktop;
  const currentPopMetaColor = device === "mobile" ? popMetaColorMobile : device === "tablet" ? popMetaColorTablet : popMetaColorDesktop;
  const currentPopMetaLh = device === "mobile" ? popMetaLhMobile : device === "tablet" ? popMetaLhTablet : popMetaLhDesktop;
  const currentPopMetaFw = device === "mobile" ? popMetaFwMobile : device === "tablet" ? popMetaFwTablet : popMetaFwDesktop;
  const currentPopMetaMb = device === "mobile" ? popMetaMbMobile : device === "tablet" ? popMetaMbTablet : popMetaMbDesktop;
  const sidebarContentAlignMobile = normalizeAlign((config as any).mobileSidebarContentAlign ?? config.sidebarContentAlign);
  const sidebarContentAlignTablet = normalizeAlign((config as any).tabletSidebarContentAlign ?? config.sidebarContentAlign);
  const sidebarContentAlignDesktop = normalizeAlign(config.sidebarContentAlign);
  const currentSidebarContentAlign = device === "mobile" ? sidebarContentAlignMobile : device === "tablet" ? sidebarContentAlignTablet : sidebarContentAlignDesktop;
  const isCenterAligned = currentSidebarContentAlign === "center";
  const isRightAligned = currentSidebarContentAlign === "right";
  const sidebarReverseImageOnly = isRightAligned && !isCenterAligned;
  const sidebarTextAlignMode: "left" | "center" | "right" = isCenterAligned ? "center" : (sidebarReverseImageOnly ? "left" : (isRightAligned ? "right" : "left"));
  const sidebarAlignItems: React.CSSProperties["alignItems"] = sidebarTextAlignMode === "center"
    ? "center"
    : sidebarTextAlignMode === "right"
      ? "flex-end"
      : "flex-start";
  const sidebarTextAlign: React.CSSProperties["textAlign"] = sidebarTextAlignMode === "center"
    ? "center"
    : sidebarTextAlignMode === "right"
      ? "right"
      : "left";
  const sidebarJustifyContent: React.CSSProperties["justifyContent"] = sidebarTextAlignMode === "center"
    ? "center"
    : sidebarTextAlignMode === "right"
      ? "flex-end"
      : "flex-start";
  const currentContentTranslateY = currentShowCategory ? "-9px" : "0";
  const currentCategoryHasBg = currentPopCategoryBg !== "transparent" && currentPopCategoryBg !== "none";

  const containerStyle = {
      '--accent': effectiveAccent,
      '--widget-title-size-mobile': blockTitleFsMobile,
      '--widget-title-size-tablet': blockTitleFsTablet,
      '--widget-title-size-desktop': blockTitleFsDesktop,
      '--widget-title-line-height-mobile': blockTitleLhMobile,
      '--widget-title-line-height-tablet': blockTitleLhTablet,
      '--widget-title-line-height-desktop': blockTitleLhDesktop,
      '--widget-title-color-mobile': titleColorMobile,
      '--widget-title-color-tablet': titleColorTablet,
      '--widget-title-color-desktop': titleColorDesktop,
      '--widget-title-border-color-mobile': titleBorderColorMobile,
      '--widget-title-border-color-tablet': titleBorderColorTablet,
      '--widget-title-border-color-desktop': titleBorderColorDesktop,
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
  } as React.CSSProperties;

  // Render berdasarkan tipe widget
  const renderContent = () => {
    switch (widgetType) {
      case "category_list":
        const categoryData = (Array.isArray(posts) && posts.length > 0 && (posts[0]?.postCount !== undefined || posts[0]?._count?.posts !== undefined))
          ? posts
          : categories;
        if (!categoryData || categoryData.length === 0) return <p className="text-sm [color:var(--muted-text,var(--home-meta-color,#9ca3af))]">Tidak ada kategori.</p>;
        const visibleCategories = categoryData.slice(0, limit);
        return (
          <ul className="space-y-3">
            {visibleCategories.map((cat) => (
              <li key={cat.id}>
                <Link href={`/kategori/${cat.slug}`} className="flex items-center justify-between [color:var(--home-news-title-color,#111827)] hover:[color:var(--home-hover-color,var(--accent,#2563eb))] transition-colors group">
                  <span className="text-sm font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--border,#d1d5db)] group-hover:bg-[var(--accent)] transition-colors"></span>
                      {cat.name}
                  </span>
                  <span 
                      className="text-[10px] bg-transparent px-2 py-0.5 [color:var(--muted-text,var(--home-meta-color,#9ca3af))] font-semibold group-hover:bg-[var(--accent)] group-hover:text-white transition-colors"
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
                className="bg-transparent flex items-center justify-center min-h-[250px] [color:var(--muted-text,var(--home-meta-color,#9ca3af))] text-xs uppercase tracking-widest border border-dashed border-[color:var(--border,#e5e7eb)]"
                style={{ borderRadius: 'var(--home-main-box-radius, 0.25rem)' }}
            >
                {typeof config?.adCode === "string" && config.adCode.trim() !== "" ? (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeContent(config.adCode) }} />
                ) : (
                    <span>Space Iklan</span>
                )}
            </div>
        );

      case "recent_posts":
      case "popular_posts":
      default:
        if (!posts || posts.length === 0) return <p className="text-sm [color:var(--muted-text,var(--home-meta-color,#9ca3af))]">Belum ada berita.</p>;
        
        return (
          <div className="space-y-5">
            {posts.slice(0, limit).map((post, index) => {
              const postLink = post.category ? `/${post.category.slug}/${post.slug}` : `/post/${post.slug}`;
              const imageUrl = getPostImageUrl(post) || getFirstImageFromContent(post.content);
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
              const articleStyle: React.CSSProperties = {
                display: "flex",
                flexDirection: isCenterAligned ? "column" : (sidebarReverseImageOnly && imageUrl && currentShowThumb) ? "row-reverse" : "row",
                alignItems: isCenterAligned ? "stretch" : "flex-start",
                gap: "0.75rem",
              };

              return (
                <article key={post.id} className="popular-item group" style={articleStyle}>
                  <div
                    className="popular-left"
                    style={{
                      alignSelf: isCenterAligned ? "center" : "flex-start",
                    }}
                  >
                    {imageUrl && currentShowThumb ? (
                      <>
                        <Link
                          href={postLink}
                          className="popular-thumb popular-thumb-link relative block overflow-hidden bg-transparent"
                          style={{
                            width: currentThumbWidth,
                            height: currentThumbRatio ? "auto" : currentThumbHeight,
                            aspectRatio: currentThumbRatio || "auto",
                            borderRadius: currentThumbRadius,
                          }}
                        >
                          <Image
                            src={imageUrl}
                            alt={post.title}
                            fill
                            quality={90}
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes={currentThumbWidth}
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
                              boxShadow: '0 10px 22px rgba(2,6,23,0.22)',
                              minWidth: device === "mobile" ? "2.1rem" : device === "tablet" ? "2.25rem" : "2.35rem",
                              height: device === "mobile" ? "1.7rem" : device === "tablet" ? "1.8rem" : "1.85rem",
                              paddingLeft: device === "mobile" ? "0.5rem" : device === "tablet" ? "0.55rem" : "0.6rem",
                              paddingRight: device === "mobile" ? "0.5rem" : device === "tablet" ? "0.55rem" : "0.6rem",
                              fontSize: currentRankNumberFs,
                              fontWeight: currentRankNumberFw,
                              fontFamily: 'var(--home-news-title-font, var(--font-heading, var(--font-body, sans-serif)))',
                              fontSynthesis: 'var(--home-news-title-synthesis, var(--font-heading-synthesis, none))',
                              fontVariantNumeric: 'tabular-nums lining-nums',
                              lineHeight: 1,
                              letterSpacing: '-0.02em',
                              borderRadius: currentRankNumberCornerRadius,
                              background: currentRankNumberBg || 'linear-gradient(135deg, var(--accent), rgba(2,6,23,0.35))',
                              color: currentRankNumberColor || '#ffffff',
                            }}
                          >
                            {numberLabel}
                          </span>
                        </Link>
                      </>
                    ) : (
                      <span
                        className="popular-index popular-index--no-image flex-shrink-0 flex items-center justify-center transition-colors border group-hover:!bg-[var(--accent)] group-hover:!border-[var(--accent)] group-hover:!text-white"
                        style={{
                          minWidth: device === "mobile" ? "2rem" : device === "tablet" ? "2.1rem" : "2.2rem",
                          height: device === "mobile" ? "2rem" : device === "tablet" ? "2.1rem" : "2.2rem",
                          paddingLeft: device === "mobile" ? "0.625rem" : device === "tablet" ? "0.7rem" : "0.75rem",
                          paddingRight: device === "mobile" ? "0.625rem" : device === "tablet" ? "0.7rem" : "0.75rem",
                          fontSize: currentRankNumberFs,
                          fontWeight: currentRankNumberFw,
                          fontFamily: 'var(--home-news-title-font, var(--font-heading, var(--font-body, sans-serif)))',
                          fontSynthesis: 'var(--home-news-title-synthesis, var(--font-heading-synthesis, none))',
                          fontVariantNumeric: 'tabular-nums lining-nums',
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                          borderRadius: currentRankNumberCornerRadius,
                          borderColor: "color-mix(in oklab, var(--border) 70%, transparent)",
                          backgroundColor: currentRankNumberBg || 'transparent',
                          color: currentRankNumberColor || 'color-mix(in oklab, var(--fg-primary) 80%, transparent)',
                          marginTop: "2px",
                        }}
                      >
                        {numberLabel}
                      </span>
                    )}
                  </div>

                  <div
                    className={`popular-content min-w-0 ${post.category ? 'has-category' : 'no-category'} ${(authorName || dateVal) ? 'has-meta' : 'no-meta'}`}
                    style={{
                      alignSelf: "flex-start",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: sidebarAlignItems,
                      textAlign: sidebarTextAlign,
                      transform: `translateY(${currentContentTranslateY})`,
                      paddingTop: post.category ? undefined : "2px",
                      width: "100%",
                    }}
                  >
                    {currentShowCategory && post.category && (
                      <div
                        className="uppercase tracking-wider font-semibold popular-category"
                        style={{
                          display: "inline-block",
                          fontSize: currentPopCategoryFs,
                          lineHeight: currentPopCategoryLh,
                          fontFamily: 'var(--home-meta-font, var(--font-body, sans-serif))',
                          fontSynthesis: 'var(--home-meta-synthesis, var(--font-body-synthesis, none))',
                          color: currentPopCategoryColor,
                          backgroundColor: currentPopCategoryBg,
                          borderRadius: currentPopCategoryRadius,
                          paddingTop: currentCategoryHasBg ? currentPopCategoryPy : "0",
                          paddingBottom: currentCategoryHasBg ? currentPopCategoryPy : "0",
                          paddingLeft: currentCategoryHasBg ? currentPopCategoryPx : "0",
                          paddingRight: currentCategoryHasBg ? currentPopCategoryPx : "0",
                          marginBottom: currentPopCategoryMb,
                        }}
                      >
                        <Link href={`/${post.category.slug}`} className="hover:underline">
                          {post.category.name}
                        </Link>
                      </div>
                    )}

                    <h4 className="leading-snug mb-1" style={{ marginTop: post.category && currentShowCategory ? "-1px" : "0", marginBottom: !(authorName || dateVal) ? 0 : undefined }}>
                      <Link
                        href={postLink}
                        className="transition-colors hover:!text-[var(--popular-title-hover)]"
                        style={{
                          ["--popular-title-hover" as string]: currentPopTitleHoverColor,
                          display: "block",
                          fontSize: currentPopTitleFs,
                          lineHeight: currentPopTitleLh,
                          fontWeight: currentPopTitleFw,
                          fontFamily: 'var(--home-news-title-font, var(--font-heading, sans-serif))',
                          fontSynthesis: 'var(--home-news-title-synthesis, var(--font-heading-synthesis, none))',
                          color: currentPopTitleColor,
                        } as React.CSSProperties}
                      >
                        {post.title}
                      </Link>
                    </h4>

                    {currentShowMeta && (authorName || dateVal) && (
                      <div
                        className="flex flex-wrap items-center gap-x-2 gap-y-1"
                        style={{
                          justifyContent: sidebarJustifyContent,
                          fontSize: currentPopMetaFs,
                          color: currentPopMetaColor,
                          lineHeight: currentPopMetaLh,
                          fontWeight: currentPopMetaFw,
                          fontFamily: 'var(--home-meta-font, var(--font-body, sans-serif))',
                          fontSynthesis: 'var(--home-meta-synthesis, var(--font-body-synthesis, none))',
                          marginBottom: currentPopMetaMb,
                          marginTop: "2px",
                        }}
                      >
                        {currentShowAuthor && authorName && (
                          <span className="popular-author inline-flex items-center gap-1.5">
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
                          </span>
                        )}
                        {currentShowAuthor && authorName && currentShowDate && dateVal && <span className="popular-dot opacity-60">•</span>}
                        {currentShowDate && dateVal && (
                          <span className="popular-date inline-flex items-center gap-1.5">
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
                          </span>
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
    <div id={`sidebar-widget-${block.id}`} className={`responsive-block-frame ${visibilityClass}`.trim()} style={containerStyle}>
      <div
        style={{
          backgroundColor: currentUseBox ? currentBoxColor : 'transparent',
          borderRadius: currentUseBox ? currentBoxBorderRadius : '0',
          boxShadow: currentUseBox ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none',
          border: currentUseBox ? 'var(--box-border, 1px solid var(--border))' : 'none',
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
          <h3 className="font-bold border-b border-[color:var(--border,#e5e7eb)] flex items-center theme-widget-title" style={{ lineHeight: device === "mobile" ? blockTitleLhMobile : (device === "tablet" ? blockTitleLhTablet : blockTitleLhDesktop), marginBottom: device === "mobile" ? blockTitleMbMobile : (device === "tablet" ? blockTitleMbTablet : blockTitleMbDesktop), paddingBottom: device === "mobile" ? blockTitlePbMobile : (device === "tablet" ? blockTitlePbTablet : blockTitlePbDesktop) }}>
              <div className="widget-title-bar" style={{ borderRadius: "var(--home-main-box-radius, 0.25rem)" }}></div>
              <span>{title}</span>
          </h3>
      )}
      {renderContent()}
      </div>
    </div>
  );
}
