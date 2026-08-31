"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getResponsiveBoolValues, getResponsiveValue, getResponsiveValues, pickResponsiveValue, type ResponsiveDevice } from "./responsive";
import { resolveWidgetRadius } from "./radius";

interface TagCloudProps {
  block: {
    id: string;
    config?: any; // Changed to any to allow flexible config
  };
  posts?: any[];
  customTitle?: string;
  accentColor?: string;
  borderRadius?: string;
  previewDevice?: ResponsiveDevice;
}

// Helper untuk mengekstrak tags dari posts jika tidak ada data tags khusus
function getTagsFromPosts(posts: any[]) {
    // ... (kode sama)
    const tagsMap = new Map();
    posts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach((tag: any) => {
                if (!tagsMap.has(tag.slug)) {
                    tagsMap.set(tag.slug, { name: tag.name, count: 0 });
                }
                const t = tagsMap.get(tag.slug);
                if (t) t.count++;
            });
        }
    });
    return Array.from(tagsMap.values()).sort((a: any, b: any) => b.count - a.count);
}

function sanitizeCssUrl(url: string) {
  return url.replace(/["\\\n\r()]/g, "").trim();
}

export default function TagCloud({ block, posts, customTitle, accentColor, borderRadius, previewDevice }: TagCloudProps) {
  const config = block.config || {};
  const configRecord = config as Record<string, unknown>;
  const title = customTitle || config.title || "Tag Populer";
  const [device, setDevice] = useState<ResponsiveDevice>(previewDevice || "desktop");
  const [isPublicDarkMode, setIsPublicDarkMode] = useState(false);
  
  // -- FIXED ACCENT COLOR LOGIC --
  const effectiveAccent = accentColor || 'var(--accent)';

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

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const applyMode = () => setIsPublicDarkMode(root.classList.contains("public-dark"));
    applyMode();

    const observer = new MutationObserver(applyMode);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const isNeutralSurfaceColor = (value: unknown) => {
    const v = normalizeHexLike(value);
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

  const normalizeHexLike = (value: unknown) => {
    if (typeof value !== "string") return "";
    return value.trim().toLowerCase().replace(/\s+/g, "");
  };

  const isOneOf = (value: unknown, candidates: string[]) => {
    const normalized = normalizeHexLike(value);
    return normalized !== "" && candidates.includes(normalized);
  };
  
  // --- RESPONSIVE VISIBILITY ---
  // Fix: Match config keys from BlockConfigPanel (hideOn...)
  let visibilityClass = '';
  if (config.hideOnDesktop) visibilityClass += ' lg:hidden';
  if (config.hideOnTablet) visibilityClass += ' md:max-lg:hidden';
  if (config.hideOnMobile) visibilityClass += ' max-md:hidden';

  const responsiveLimit = getResponsiveValue<number | string>(configRecord, "limit", device);
  const limit = typeof responsiveLimit === "number"
    ? responsiveLimit
    : typeof responsiveLimit === "string" && responsiveLimit.trim() !== ""
      ? parseInt(responsiveLimit, 10)
      : 10;

  // --- STYLE CONFIG ---
  // Fix: Match config keys from BlockConfigPanel
  const blockTitleColorMobile = (config as any).mobileBlockTitleColor || config.blockTitleColor || 'var(--home-widget-title-color, inherit)';
  const blockTitleColorTablet = (config as any).tabletBlockTitleColor || blockTitleColorMobile;
  const blockTitleColorDesktop = config.blockTitleColor || blockTitleColorTablet;

  const blockTitleBorderColorMobile = (config as any).mobileBlockTitleBorderColor || config.blockTitleBorderColor || effectiveAccent;
  const blockTitleBorderColorTablet = (config as any).tabletBlockTitleBorderColor || blockTitleBorderColorMobile;
  const blockTitleBorderColorDesktop = config.blockTitleBorderColor || blockTitleBorderColorTablet;

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
  const blockTitleFsMobile = (config as any).mobileBlockTitleFontSize
    ? formatFontSize((config as any).mobileBlockTitleFontSize, widgetTitleSizeFallback)
    : formatFontSize(config.blockTitleFontSize, widgetTitleSizeFallback);
  const blockTitleFsTablet = (config as any).tabletBlockTitleFontSize
    ? formatFontSize((config as any).tabletBlockTitleFontSize, blockTitleFsMobile)
    : blockTitleFsMobile;
  const blockTitleFsDesktop = config.blockTitleFontSize
    ? formatFontSize(config.blockTitleFontSize, blockTitleFsTablet)
    : blockTitleFsTablet;
  const rawBlockTitleLineHeight = getResponsiveValue<number | string>(configRecord, "blockTitleLineHeight", device);
  const blockTitleLineHeight =
    rawBlockTitleLineHeight !== undefined &&
    rawBlockTitleLineHeight !== null &&
    `${rawBlockTitleLineHeight}`.trim() !== ""
      ? rawBlockTitleLineHeight
      : undefined;
  const rawBlockTitleMarginBottom = getResponsiveValue<number | string>(configRecord, "blockTitleMarginBottom", device);
  const blockTitleMarginBottom =
    rawBlockTitleMarginBottom !== undefined &&
    rawBlockTitleMarginBottom !== null &&
    `${rawBlockTitleMarginBottom}`.trim() !== ""
      ? formatFontSize(rawBlockTitleMarginBottom, "0.75rem")
      : "0.75rem";
  const rawBlockTitlePaddingBottom = getResponsiveValue<number | string>(configRecord, "blockTitlePaddingBottom", device);
  const blockTitlePaddingBottom =
    rawBlockTitlePaddingBottom !== undefined &&
    rawBlockTitlePaddingBottom !== null &&
    `${rawBlockTitlePaddingBottom}`.trim() !== ""
      ? formatFontSize(rawBlockTitlePaddingBottom, "0.75rem")
      : "0.75rem";

  const defaultTagStyles = isPublicDarkMode
    ? {
        bg: "transparent",
        color: "var(--fg-primary, #f9fafb)",
        border: "rgba(148, 163, 184, 0.35)",
        hoverBg: "rgba(51, 65, 85, 0.85)",
        hoverColor: "var(--fg-primary, #f9fafb)",
        hoverBorder: "rgba(148, 163, 184, 0.5)",
      }
    : {
        bg: "transparent",
        color: "var(--post-badge-text-color, var(--load-more-text))",
        border: "var(--load-more-border)",
        hoverBg: "var(--load-more-bg-hover)",
        hoverColor: "var(--post-link-hover-color, var(--load-more-text-hover))",
        hoverBorder: "var(--load-more-border-hover)",
      };

  const rawTagBg = getResponsiveValue<string>(configRecord, "tagBackgroundColor", device);
  const rawTagColor = getResponsiveValue<string>(configRecord, "tagTextColor", device);
  const rawTagBorderColor = getResponsiveValue<string>(configRecord, "tagBorderColor", device);
  const rawTagHoverBg = getResponsiveValue<string>(configRecord, "tagHoverBackgroundColor", device);
  const rawTagHoverColor = getResponsiveValue<string>(configRecord, "tagHoverTextColor", device);
  const rawTagHoverBorderColor = getResponsiveValue<string>(configRecord, "tagHoverBorderColor", device);

  const legacyLightTagBg = ["#f9fafb", "#f3f4f6", "var(--load-more-bg)", "var(--post-badge-bg-color,var(--load-more-bg))"];
  const legacyLightTagColor = ["#374151", "#4b5563", "var(--load-more-text)", "var(--post-badge-text-color,var(--load-more-text))"];
  const legacyLightTagBorder = ["#f3f4f6", "#e5e7eb", "var(--load-more-border)"];
  const legacyLightTagHoverBg = ["#2563eb", "var(--load-more-bg-hover)"];
  const legacyLightTagHoverBorder = ["#2563eb", "var(--load-more-border-hover)"];
  const legacyDarkUnsafeTagColor = ["#111827", "#1f2937", "#0f172a", "#000000", "#000"];
  const legacyDarkUnsafeTagBorder = ["#111827", "#1f2937", "#0f172a", "#374151", "#4b5563", "#000000", "#000"];

  const resolveTagColor = (
    rawValue: string | undefined,
    themeDefaultValue: string,
    legacyCandidates: string[]
  ) => {
    if (!rawValue || rawValue.trim() === "" || isOneOf(rawValue, legacyCandidates)) {
      return themeDefaultValue;
    }
    return rawValue;
  };

  // Tag Styles
  const tagBg = resolveTagColor(rawTagBg, defaultTagStyles.bg, legacyLightTagBg);
  const tagColor = resolveTagColor(rawTagColor, defaultTagStyles.color, legacyLightTagColor);
  const tagBorderColor = resolveTagColor(rawTagBorderColor, defaultTagStyles.border, legacyLightTagBorder);
  
  // Hover Logic
  const tagHoverBg = resolveTagColor(rawTagHoverBg, defaultTagStyles.hoverBg, legacyLightTagHoverBg);
  const tagHoverColor =
    typeof rawTagHoverColor === "string" && rawTagHoverColor.trim() !== ""
      ? rawTagHoverColor
      : defaultTagStyles.hoverColor;
  const tagHoverBorderColor = resolveTagColor(rawTagHoverBorderColor, defaultTagStyles.hoverBorder, legacyLightTagHoverBorder); 
  const effectiveTagColor = isPublicDarkMode && isOneOf(tagColor, legacyDarkUnsafeTagColor) ? defaultTagStyles.color : tagColor;
  const effectiveTagBorderColor = isPublicDarkMode && isOneOf(tagBorderColor, legacyDarkUnsafeTagBorder) ? defaultTagStyles.border : tagBorderColor;
  const effectiveTagHoverColor = isPublicDarkMode && isOneOf(tagHoverColor, legacyDarkUnsafeTagColor) ? defaultTagStyles.hoverColor : tagHoverColor;
  const effectiveTagHoverBorderColor = isPublicDarkMode && isOneOf(tagHoverBorderColor, legacyDarkUnsafeTagBorder) ? defaultTagStyles.hoverBorder : tagHoverBorderColor;
  
  const responsiveTagFontSize = getResponsiveValue<number | string>(configRecord, "tagFontSize", device);
  const tagFontSize = responsiveTagFontSize !== undefined && responsiveTagFontSize !== null && `${responsiveTagFontSize}`.trim() !== ""
    ? `${responsiveTagFontSize}px`
    : '12px';
  // Helper for Tag Radius (handles both number and string)
  const responsiveTagRadius = getResponsiveValue<string | number>(configRecord, "tagBorderRadius", device);
  const globalRadius = borderRadius || 'var(--home-main-box-radius, 0.75rem)';
  const tagRadius = responsiveTagRadius !== undefined ? resolveWidgetRadius(responsiveTagRadius, globalRadius) : globalRadius;
  
  const responsiveGapX = getResponsiveValue<number>(configRecord, "tagGapX", device);
  const responsiveGapY = getResponsiveValue<number>(configRecord, "tagGapY", device);
  const responsivePaddingX = getResponsiveValue<number>(configRecord, "tagPaddingX", device);
  const responsivePaddingY = getResponsiveValue<number>(configRecord, "tagPaddingY", device);
  const gapX = responsiveGapX !== undefined ? `${responsiveGapX * 0.25}rem` : '0.5rem';
  const gapY = responsiveGapY !== undefined ? `${responsiveGapY * 0.25}rem` : '0.5rem';
  const tagPaddingX = responsivePaddingX !== undefined ? `${responsivePaddingX}px` : '12px';
  const tagPaddingY = responsivePaddingY !== undefined ? `${responsivePaddingY}px` : '4px';

  // --- BOX / CONTAINER LOGIC ---
  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const useBoxDesktop = useBoxValues.desktop;
  const useBoxTablet = useBoxValues.tablet;
  const useBoxMobile = useBoxValues.mobile;
  const rawBoxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = normalizeColor(rawBoxColorValues.desktop, 'transparent');
  const boxColorTablet = normalizeColor(rawBoxColorValues.tablet, boxColorDesktop);
  const boxColorMobile = normalizeColor(rawBoxColorValues.mobile, boxColorDesktop);
  const boxBgImageDesktop = typeof config.backgroundImage === "string" ? sanitizeCssUrl(config.backgroundImage) : "";
  const boxBgImageTablet = typeof (config as any).tabletBackgroundImage === "string" && (config as any).tabletBackgroundImage.trim() !== ""
    ? sanitizeCssUrl((config as any).tabletBackgroundImage)
    : boxBgImageDesktop;
  const boxBgImageMobile = typeof (config as any).mobileBackgroundImage === "string" && (config as any).mobileBackgroundImage.trim() !== ""
    ? sanitizeCssUrl((config as any).mobileBackgroundImage)
    : boxBgImageTablet;
  const boxBgSizeDesktop = typeof config.backgroundSize === "string" && config.backgroundSize.trim() !== "" ? config.backgroundSize : "cover";
  const boxBgSizeTablet = typeof (config as any).tabletBackgroundSize === "string" && (config as any).tabletBackgroundSize.trim() !== ""
    ? (config as any).tabletBackgroundSize
    : boxBgSizeDesktop;
  const boxBgSizeMobile = typeof (config as any).mobileBackgroundSize === "string" && (config as any).mobileBackgroundSize.trim() !== ""
    ? (config as any).mobileBackgroundSize
    : boxBgSizeTablet;
  const boxBgPositionDesktop = typeof config.backgroundPosition === "string" && config.backgroundPosition.trim() !== "" ? config.backgroundPosition : "center";
  const boxBgPositionTablet = typeof (config as any).tabletBackgroundPosition === "string" && (config as any).tabletBackgroundPosition.trim() !== ""
    ? (config as any).tabletBackgroundPosition
    : boxBgPositionDesktop;
  const boxBgPositionMobile = typeof (config as any).mobileBackgroundPosition === "string" && (config as any).mobileBackgroundPosition.trim() !== ""
    ? (config as any).mobileBackgroundPosition
    : boxBgPositionTablet;
  const boxBgRepeatDesktop = typeof config.backgroundRepeat === "string" && config.backgroundRepeat.trim() !== "" ? config.backgroundRepeat : "no-repeat";
  const boxBgRepeatTablet = typeof (config as any).tabletBackgroundRepeat === "string" && (config as any).tabletBackgroundRepeat.trim() !== ""
    ? (config as any).tabletBackgroundRepeat
    : boxBgRepeatDesktop;
  const boxBgRepeatMobile = typeof (config as any).mobileBackgroundRepeat === "string" && (config as any).mobileBackgroundRepeat.trim() !== ""
    ? (config as any).mobileBackgroundRepeat
    : boxBgRepeatTablet;
  const boxBgAttachmentDesktop = typeof config.backgroundAttachment === "string" && config.backgroundAttachment.trim() !== "" ? config.backgroundAttachment : "scroll";
  const boxBgAttachmentTablet = typeof (config as any).tabletBackgroundAttachment === "string" && (config as any).tabletBackgroundAttachment.trim() !== ""
    ? (config as any).tabletBackgroundAttachment
    : boxBgAttachmentDesktop;
  const boxBgAttachmentMobile = typeof (config as any).mobileBackgroundAttachment === "string" && (config as any).mobileBackgroundAttachment.trim() !== ""
    ? (config as any).mobileBackgroundAttachment
    : boxBgAttachmentTablet;
  const boxOverlayColorDesktop = typeof config.backgroundOverlayColor === "string" ? config.backgroundOverlayColor : "transparent";
  const boxOverlayColorTablet = typeof (config as any).tabletBackgroundOverlayColor === "string" && (config as any).tabletBackgroundOverlayColor.trim() !== ""
    ? (config as any).tabletBackgroundOverlayColor
    : boxOverlayColorDesktop;
  const boxOverlayColorMobile = typeof (config as any).mobileBackgroundOverlayColor === "string" && (config as any).mobileBackgroundOverlayColor.trim() !== ""
    ? (config as any).mobileBackgroundOverlayColor
    : boxOverlayColorTablet;
  const boxOverlayOpacityDesktop = Math.min(100, Math.max(0, Number(config.backgroundOverlayOpacity ?? 45) || 0));
  const boxOverlayOpacityTablet = Math.min(100, Math.max(0, Number((config as any).tabletBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const boxOverlayOpacityMobile = Math.min(100, Math.max(0, Number((config as any).mobileBackgroundOverlayOpacity ?? boxOverlayOpacityTablet) || 0));
  const useBox = pickResponsiveValue({ desktop: useBoxDesktop, tablet: useBoxTablet, mobile: useBoxMobile }, device);
  const boxColor = pickResponsiveValue({ desktop: boxColorDesktop, tablet: boxColorTablet, mobile: boxColorMobile }, device);
  const currentBoxBgImage = pickResponsiveValue({ desktop: boxBgImageDesktop, tablet: boxBgImageTablet, mobile: boxBgImageMobile }, device);
  const currentBoxBgSize = pickResponsiveValue({ desktop: boxBgSizeDesktop, tablet: boxBgSizeTablet, mobile: boxBgSizeMobile }, device);
  const currentBoxBgPosition = pickResponsiveValue({ desktop: boxBgPositionDesktop, tablet: boxBgPositionTablet, mobile: boxBgPositionMobile }, device);
  const currentBoxBgRepeat = pickResponsiveValue({ desktop: boxBgRepeatDesktop, tablet: boxBgRepeatTablet, mobile: boxBgRepeatMobile }, device);
  const currentBoxBgAttachment = pickResponsiveValue({ desktop: boxBgAttachmentDesktop, tablet: boxBgAttachmentTablet, mobile: boxBgAttachmentMobile }, device);
  const currentBoxOverlayColor = pickResponsiveValue({ desktop: boxOverlayColorDesktop, tablet: boxOverlayColorTablet, mobile: boxOverlayColorMobile }, device);
  const currentBoxOverlayOpacity = pickResponsiveValue({ desktop: boxOverlayOpacityDesktop, tablet: boxOverlayOpacityTablet, mobile: boxOverlayOpacityMobile }, device);
  const hasCurrentBoxOverlay =
    currentBoxOverlayOpacity > 0 &&
    typeof currentBoxOverlayColor === "string" &&
    currentBoxOverlayColor.trim() !== "" &&
    currentBoxOverlayColor !== "transparent";
  const currentBoxOverlayFill = hasCurrentBoxOverlay
    ? `color-mix(in srgb, ${currentBoxOverlayColor} ${currentBoxOverlayOpacity}%, transparent)`
    : "transparent";
  const currentBoxBackgroundImage = useBox && currentBoxBgImage
    ? (hasCurrentBoxOverlay
      ? `linear-gradient(${currentBoxOverlayFill}, ${currentBoxOverlayFill}), url("${currentBoxBgImage}")`
      : `url("${currentBoxBgImage}")`)
    : "none";
  // Helper for radius
  const boxRadiusValues = getResponsiveValues<string>(configRecord, "boxBorderRadius");
  const responsiveBoxRadius = pickResponsiveValue(boxRadiusValues, device);
  const boxBorderRadius = responsiveBoxRadius !== undefined ? resolveWidgetRadius(responsiveBoxRadius, globalRadius) : globalRadius;

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
  const boxPtMobile = config.mobileBoxPaddingTop !== undefined ? `${config.mobileBoxPaddingTop}px` : (config.boxPaddingTop !== undefined ? `${config.boxPaddingTop}px` : (useBoxMobile ? 'var(--box-padding, 1.5rem)' : '0px'));
  const boxPrMobile = config.mobileBoxPaddingRight !== undefined ? `${config.mobileBoxPaddingRight}px` : (config.boxPaddingRight !== undefined ? `${config.boxPaddingRight}px` : (useBoxMobile ? 'var(--box-padding, 1.5rem)' : '0px'));
  const boxPbMobile = config.mobileBoxPaddingBottom !== undefined ? `${config.mobileBoxPaddingBottom}px` : (config.boxPaddingBottom !== undefined ? `${config.boxPaddingBottom}px` : (useBoxMobile ? 'var(--box-padding, 1.5rem)' : '0px'));
  const boxPlMobile = config.mobileBoxPaddingLeft !== undefined ? `${config.mobileBoxPaddingLeft}px` : (config.boxPaddingLeft !== undefined ? `${config.boxPaddingLeft}px` : (useBoxMobile ? 'var(--box-padding, 1.5rem)' : '0px'));
  const boxPtTablet = config.tabletBoxPaddingTop !== undefined ? `${config.tabletBoxPaddingTop}px` : (config.boxPaddingTop !== undefined ? `${config.boxPaddingTop}px` : (useBoxTablet ? boxPtMobile : '0px'));
  const boxPrTablet = config.tabletBoxPaddingRight !== undefined ? `${config.tabletBoxPaddingRight}px` : (config.boxPaddingRight !== undefined ? `${config.boxPaddingRight}px` : (useBoxTablet ? boxPrMobile : '0px'));
  const boxPbTablet = config.tabletBoxPaddingBottom !== undefined ? `${config.tabletBoxPaddingBottom}px` : (config.boxPaddingBottom !== undefined ? `${config.boxPaddingBottom}px` : (useBoxTablet ? boxPbMobile : '0px'));
  const boxPlTablet = config.tabletBoxPaddingLeft !== undefined ? `${config.tabletBoxPaddingLeft}px` : (config.boxPaddingLeft !== undefined ? `${config.boxPaddingLeft}px` : (useBoxTablet ? boxPlMobile : '0px'));
  const boxPtDesktop = config.boxPaddingTop !== undefined ? `${config.boxPaddingTop}px` : (useBoxDesktop ? boxPtTablet : '0px');
  const boxPrDesktop = config.boxPaddingRight !== undefined ? `${config.boxPaddingRight}px` : (useBoxDesktop ? boxPrTablet : '0px');
  const boxPbDesktop = config.boxPaddingBottom !== undefined ? `${config.boxPaddingBottom}px` : (useBoxDesktop ? boxPbTablet : '0px');
  const boxPlDesktop = config.boxPaddingLeft !== undefined ? `${config.boxPaddingLeft}px` : (useBoxDesktop ? boxPlTablet : '0px');
  const currentBoxPt = pickResponsiveValue({ desktop: boxPtDesktop, tablet: boxPtTablet, mobile: boxPtMobile }, device);
  const currentBoxPr = pickResponsiveValue({ desktop: boxPrDesktop, tablet: boxPrTablet, mobile: boxPrMobile }, device);
  const currentBoxPb = pickResponsiveValue({ desktop: boxPbDesktop, tablet: boxPbTablet, mobile: boxPbMobile }, device);
  const currentBoxPl = pickResponsiveValue({ desktop: boxPlDesktop, tablet: boxPlTablet, mobile: boxPlMobile }, device);

  // Data Logic
  let tags: any[] = [];
  // ... (rest of logic)

  if (posts && posts.length > 0) {
      if ('name' in posts[0] && !('title' in posts[0])) {
          tags = posts;
      } else {
          tags = getTagsFromPosts(posts);
      }
  }

  const containerStyle = {
      '--accent': effectiveAccent,
      '--widget-title-size-mobile': blockTitleFsMobile,
      '--widget-title-size-tablet': blockTitleFsTablet,
      '--widget-title-size-desktop': blockTitleFsDesktop,
      '--widget-title-color-mobile': blockTitleColorMobile,
      '--widget-title-color-tablet': blockTitleColorTablet,
      '--widget-title-color-desktop': blockTitleColorDesktop,
      '--widget-title-border-color-mobile': blockTitleBorderColorMobile,
      '--widget-title-border-color-tablet': blockTitleBorderColorTablet,
      '--widget-title-border-color-desktop': blockTitleBorderColorDesktop,
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

  if (tags.length === 0) {
      return (
          <div id={`tag-cloud-${block.id}`} className={`tag-cloud-block responsive-block-frame ${visibilityClass}`.trim()} style={containerStyle}>
              <div
                style={{
                  backgroundColor: useBox ? boxColor : 'transparent',
                  borderRadius: useBox ? boxBorderRadius : '0',
                  boxShadow: useBox ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none',
                  border: useBox ? 'var(--box-border, 1px solid var(--border))' : 'none',
                  backgroundImage: currentBoxBackgroundImage,
                  backgroundSize: useBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `cover, ${currentBoxBgSize}` : currentBoxBgSize) : undefined,
                  backgroundPosition: useBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `center, ${currentBoxBgPosition}` : currentBoxBgPosition) : undefined,
                  backgroundRepeat: useBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `no-repeat, ${currentBoxBgRepeat}` : currentBoxBgRepeat) : undefined,
                  backgroundAttachment: useBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `scroll, ${currentBoxBgAttachment}` : currentBoxBgAttachment) : undefined,
                  paddingTop: useBox ? currentBoxPt : '0px',
                  paddingRight: useBox ? currentBoxPr : '0px',
                  paddingBottom: useBox ? currentBoxPb : '0px',
                  paddingLeft: useBox ? currentBoxPl : '0px',
                }}
              >
              {(config.showTitle !== false) && (
                  <h3
                    className="font-bold border-b border-[color:var(--border,#e5e7eb)] flex items-center theme-widget-title"
                    style={{ lineHeight: blockTitleLineHeight, marginBottom: blockTitleMarginBottom, paddingBottom: blockTitlePaddingBottom }}
                  >
                      <div className="widget-title-bar" style={{ borderRadius: "var(--home-main-box-radius, 0.25rem)" }}></div>
                      <span>{title}</span>
                  </h3>
              )}
              <p className="text-sm [color:var(--home-meta-color,#9ca3af)] tag-cloud-empty">Belum ada tag.</p>
              </div>
          </div>
      );
  }

  return (
    <div id={`tag-cloud-${block.id}`} className={`tag-cloud-block responsive-block-frame ${visibilityClass}`.trim()} style={containerStyle}>
      <div
        style={{
          backgroundColor: useBox ? boxColor : 'transparent',
          borderRadius: useBox ? boxBorderRadius : '0',
          boxShadow: useBox ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none',
          border: useBox ? 'var(--box-border, 1px solid var(--border))' : 'none',
          backgroundImage: currentBoxBackgroundImage,
          backgroundSize: useBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `cover, ${currentBoxBgSize}` : currentBoxBgSize) : undefined,
          backgroundPosition: useBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `center, ${currentBoxBgPosition}` : currentBoxBgPosition) : undefined,
          backgroundRepeat: useBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `no-repeat, ${currentBoxBgRepeat}` : currentBoxBgRepeat) : undefined,
          backgroundAttachment: useBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `scroll, ${currentBoxBgAttachment}` : currentBoxBgAttachment) : undefined,
          paddingTop: useBox ? currentBoxPt : '0px',
          paddingRight: useBox ? currentBoxPr : '0px',
          paddingBottom: useBox ? currentBoxPb : '0px',
          paddingLeft: useBox ? currentBoxPl : '0px',
        }}
      >
      {(config.showTitle !== false) && (
          <h3
            className="font-bold border-b border-[color:var(--border,#e5e7eb)] flex items-center theme-widget-title"
            style={{ lineHeight: blockTitleLineHeight, marginBottom: blockTitleMarginBottom, paddingBottom: blockTitlePaddingBottom }}
          >
              <div className="widget-title-bar" style={{ borderRadius: "var(--home-main-box-radius, 0.25rem)" }}></div>
              <span>{title}</span>
          </h3>
      )}

      <div
           className="flex flex-wrap"
           style={{
               rowGap: gapY,
                columnGap: gapX,
                '--tag-bg': tagBg,
                '--tag-color': effectiveTagColor,
                '--tag-border-color': effectiveTagBorderColor,
                '--tag-hover-bg': tagHoverBg,
                '--tag-hover-color': effectiveTagHoverColor,
                '--tag-hover-border-color': effectiveTagHoverBorderColor,
           } as React.CSSProperties}
      >
        {tags.slice(0, limit).map((tag) => (
          <Link 
            key={tag.slug || tag.name} 
            href={`/tag/${tag.slug || tag.name.toLowerCase().replace(/\s+/g, '-')}`} 
            className="transition-all hover:scale-105 inline-block tag-item border"
            style={{ 
                backgroundColor: 'var(--tag-bg)',
                color: 'var(--tag-color)',
                borderColor: 'var(--tag-border-color)',
                fontSize: tagFontSize,
                borderRadius: tagRadius,
                padding: `${tagPaddingY} ${tagPaddingX}`,
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tagHoverBg;
              e.currentTarget.style.color = effectiveTagHoverColor;
              e.currentTarget.style.borderColor = effectiveTagHoverBorderColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tagBg;
              e.currentTarget.style.color = effectiveTagColor;
              e.currentTarget.style.borderColor = effectiveTagBorderColor;
            }}
          >
            #{tag.name}
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
