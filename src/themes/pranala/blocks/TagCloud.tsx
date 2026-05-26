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

  const normalizeColor = (value: unknown, fallback: string) => {
    if (typeof value !== "string") return fallback;
    const v = value.trim().toLowerCase();
    if (!v) return fallback;
    if (v === "#fff" || v === "#ffffff" || v === "white") return fallback;
    if (v === "#f9fafb" || v === "#f3f4f6" || v === "#f5f5f5") return fallback;
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

  const blockTitleFsMobile = (config as any).mobileBlockTitleFontSize
    ? formatFontSize((config as any).mobileBlockTitleFontSize, 'var(--home-widget-title-size, 1.25rem)')
    : formatFontSize(config.blockTitleFontSize, 'var(--home-widget-title-size, 1.25rem)');
  const blockTitleFsTablet = (config as any).tabletBlockTitleFontSize
    ? formatFontSize((config as any).tabletBlockTitleFontSize, blockTitleFsMobile)
    : blockTitleFsMobile;
  const blockTitleFsDesktop = config.blockTitleFontSize
    ? formatFontSize(config.blockTitleFontSize, blockTitleFsTablet)
    : blockTitleFsTablet;

  const defaultTagStyles = isPublicDarkMode
    ? {
        bg: "rgba(30, 41, 59, 0.62)",
        color: "var(--fg-primary, #f9fafb)",
        border: "rgba(148, 163, 184, 0.35)",
        hoverBg: "rgba(51, 65, 85, 0.85)",
        hoverColor: "var(--fg-primary, #f9fafb)",
        hoverBorder: "rgba(148, 163, 184, 0.5)",
      }
    : {
        bg: "var(--post-badge-bg-color, var(--load-more-bg))",
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
  const legacyLightTagHoverColor = ["#ffffff", "#fff", "var(--load-more-text-hover)", "var(--post-link-hover-color,var(--load-more-text-hover))"];
  const legacyLightTagHoverBorder = ["#2563eb", "var(--load-more-border-hover)"];

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
  const tagHoverColor = resolveTagColor(rawTagHoverColor, defaultTagStyles.hoverColor, legacyLightTagHoverColor);
  const tagHoverBorderColor = resolveTagColor(rawTagHoverBorderColor, defaultTagStyles.hoverBorder, legacyLightTagHoverBorder); 
  
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
  const useBox = pickResponsiveValue(useBoxValues, device);
  const rawBoxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = normalizeColor(rawBoxColorValues.desktop, 'var(--bg-elevated, #ffffff)');
  const boxColorTablet = normalizeColor(rawBoxColorValues.tablet, boxColorDesktop);
  const boxColorMobile = normalizeColor(rawBoxColorValues.mobile, boxColorDesktop);
  const boxColor = pickResponsiveValue({ desktop: boxColorDesktop, tablet: boxColorTablet, mobile: boxColorMobile }, device);
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
      backgroundColor: useBox ? boxColor : 'transparent',
      borderRadius: useBox ? boxBorderRadius : '0',
      boxShadow: useBox ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none',
      border: useBox ? 'var(--box-border, 1px solid var(--border))' : 'none',
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
  } as React.CSSProperties;

  if (tags.length === 0) {
      return (
          <div id={`tag-cloud-${block.id}`} className={`${visibilityClass}`} style={containerStyle}>
              <style dangerouslySetInnerHTML={{__html: `
                #tag-cloud-${block.id} { margin-top: ${mTopMobile} !important; margin-right: ${mRightMobile} !important; margin-bottom: ${mBottomMobile} !important; margin-left: ${mLeftMobile} !important; padding-top: ${pTopMobile} !important; padding-right: ${pRightMobile} !important; padding-bottom: ${pBottomMobile} !important; padding-left: ${pLeftMobile} !important; }
                @media (min-width: 768px) { #tag-cloud-${block.id} { margin-top: ${mTopTablet} !important; margin-right: ${mRightTablet} !important; margin-bottom: ${mBottomTablet} !important; margin-left: ${mLeftTablet} !important; padding-top: ${pTopTablet} !important; padding-right: ${pRightTablet} !important; padding-bottom: ${pBottomTablet} !important; padding-left: ${pLeftTablet} !important; } }
                @media (min-width: 1025px) { #tag-cloud-${block.id} { margin-top: ${mTopDesktop} !important; margin-right: ${mRightDesktop} !important; margin-bottom: ${mBottomDesktop} !important; margin-left: ${mLeftDesktop} !important; padding-top: ${pTopDesktop} !important; padding-right: ${pRightDesktop} !important; padding-bottom: ${pBottomDesktop} !important; padding-left: ${pLeftDesktop} !important; } }
                html.public-dark #tag-cloud-${block.id} .theme-widget-title { border-bottom-color: var(--border) !important; }
                html.public-dark #tag-cloud-${block.id} .tag-cloud-empty { color: var(--fg-secondary, #cbd5e1) !important; }
                html.public-dark #tag-cloud-${block.id} .tag-item {
                  background-color: rgba(30, 41, 59, 0.62) !important;
                  color: var(--fg-primary, #f8fafc) !important;
                  border-color: rgba(148, 163, 184, 0.35) !important;
                }
                html.public-dark #tag-cloud-${block.id} .tag-item:hover {
                  background-color: rgba(51, 65, 85, 0.85) !important;
                  color: var(--fg-primary, #f8fafc) !important;
                  border-color: rgba(148, 163, 184, 0.5) !important;
                }
              `}} />
              {(config.showTitle !== false) && (
                  <h3 className="font-bold mb-3 border-b border-gray-100 pb-3 flex items-center theme-widget-title">
                      <div className="widget-title-bar w-1 h-5 mr-3" style={{ borderRadius: 'var(--home-main-box-radius, 0.75rem)' }}></div>
                      <span>{title}</span>
                  </h3>
              )}
              <p className="text-gray-500 text-sm tag-cloud-empty">Belum ada tag.</p>
          </div>
      );
  }

  return (
    <div id={`tag-cloud-${block.id}`} className={`${visibilityClass}`} style={containerStyle}>
      <style dangerouslySetInnerHTML={{__html: `
        #tag-cloud-${block.id} { margin-top: ${mTopMobile} !important; margin-right: ${mRightMobile} !important; margin-bottom: ${mBottomMobile} !important; margin-left: ${mLeftMobile} !important; padding-top: ${pTopMobile} !important; padding-right: ${pRightMobile} !important; padding-bottom: ${pBottomMobile} !important; padding-left: ${pLeftMobile} !important; }
        @media (min-width: 768px) { #tag-cloud-${block.id} { margin-top: ${mTopTablet} !important; margin-right: ${mRightTablet} !important; margin-bottom: ${mBottomTablet} !important; margin-left: ${mLeftTablet} !important; padding-top: ${pTopTablet} !important; padding-right: ${pRightTablet} !important; padding-bottom: ${pBottomTablet} !important; padding-left: ${pLeftTablet} !important; } }
        @media (min-width: 1025px) { #tag-cloud-${block.id} { margin-top: ${mTopDesktop} !important; margin-right: ${mRightDesktop} !important; margin-bottom: ${mBottomDesktop} !important; margin-left: ${mLeftDesktop} !important; padding-top: ${pTopDesktop} !important; padding-right: ${pRightDesktop} !important; padding-bottom: ${pBottomDesktop} !important; padding-left: ${pLeftDesktop} !important; } }
        html.public-dark #tag-cloud-${block.id} .theme-widget-title { border-bottom-color: var(--border) !important; }
      `}} />
      {(config.showTitle !== false) && (
          <h3 className="font-bold mb-3 border-b border-gray-100 pb-3 flex items-center theme-widget-title">
              <div className="widget-title-bar w-1 h-5 mr-3" style={{ borderRadius: 'var(--home-main-box-radius, 0.75rem)' }}></div>
              <span>{title}</span>
          </h3>
      )}

      <div
           className="flex flex-wrap"
           style={{
               rowGap: gapY,
                columnGap: gapX,
                '--tag-bg': tagBg,
                '--tag-color': tagColor,
                '--tag-border-color': tagBorderColor,
                '--tag-hover-bg': tagHoverBg,
                '--tag-hover-color': tagHoverColor,
                '--tag-hover-border-color': tagHoverBorderColor,
           } as React.CSSProperties}
      >
        {tags.slice(0, limit).map((tag) => (
          <Link 
            key={tag.slug || tag.name} 
            href={`/tag/${tag.slug || tag.name.toLowerCase().replace(/\s+/g, '-')}`} 
            className="transition-all hover:scale-105 inline-block tag-item border hover:!bg-[var(--tag-hover-bg)] hover:!text-[var(--tag-hover-color)] hover:!border-[var(--tag-hover-border-color)]"
            style={{ 
                backgroundColor: 'var(--tag-bg)',
                color: 'var(--tag-color)',
                borderColor: 'var(--tag-border-color)',
                fontSize: tagFontSize,
                borderRadius: tagRadius,
                padding: `${tagPaddingY} ${tagPaddingX}`,
            } as React.CSSProperties}
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
