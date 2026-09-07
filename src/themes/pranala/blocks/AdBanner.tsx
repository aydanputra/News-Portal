"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getResponsiveBoolValues, getResponsiveValue, pickResponsiveValue, type ResponsiveDevice } from "./responsive";
import { resolveWidgetRadius } from "./radius";

type AdMedia = {
  fileUrl: string;
  width?: number | null;
  height?: number | null;
};

type Advertisement = {
  id: string;
  name: string;
  type: "IMAGE" | "SCRIPT";
  position: string;
  linkUrl?: string | null;
  scriptCode?: string | null;
  media?: AdMedia | null;
};

const normalizeColorToken = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, "") : "";

const isTransparentLikeToken = (value: unknown) => {
  const normalized = normalizeColorToken(value);
  return normalized === "" || normalized === "transparent" || normalized === "none" || normalized === "inherit" || normalized === "initial";
};

const isLegacyNeutralSurface = (value: unknown) => {
  const normalized = normalizeColorToken(value);
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
  ].includes(normalized);
};

const adResponseCache = new Map<string, Advertisement[]>();
const adRequestCache = new Map<string, Promise<Advertisement[]>>();

interface AdBannerProps {
  block: {
    id: string;
    config?: Record<string, unknown>;
  };
  borderRadius?: string;
  hideWhenEmpty?: boolean;
  previewDevice?: ResponsiveDevice;
  ignorePadding?: boolean;
  customTitle?: string;
}

const toCssSize = (value: unknown, fallback: string) => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string" && value.trim() !== "") {
    const trimmed = value.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    return trimmed;
  }
  return fallback;
};

export default function AdBanner({ block, borderRadius, hideWhenEmpty = false, previewDevice, ignorePadding = false, customTitle }: AdBannerProps) {
  const pathname = usePathname() || "/";
  const config = block.config || {};
  const configRecord = config as Record<string, unknown>;
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

  let visibilityClass = '';
  if (config.hideOnDesktop) visibilityClass += ' lg:hidden';
  if (config.hideOnTablet) visibilityClass += ' md:max-lg:hidden';
  if (config.hideOnMobile) visibilityClass += ' max-md:hidden';

  const mTopMobile = typeof config.mobileMarginTop === "number" ? `${config.mobileMarginTop}px` : '0px';
  const mRightMobile = typeof config.mobileMarginRight === "number" ? `${config.mobileMarginRight}px` : '0px';
  const mBottomMobile = typeof config.mobileMarginBottom === "number" ? `${config.mobileMarginBottom}px` : '0px';
  const mLeftMobile = typeof config.mobileMarginLeft === "number" ? `${config.mobileMarginLeft}px` : '0px';

  const mTopTablet = typeof config.tabletMarginTop === "number" ? `${config.tabletMarginTop}px` : mTopMobile;
  const mRightTablet = typeof config.tabletMarginRight === "number" ? `${config.tabletMarginRight}px` : mRightMobile;
  const mBottomTablet = typeof config.tabletMarginBottom === "number" ? `${config.tabletMarginBottom}px` : mBottomMobile;
  const mLeftTablet = typeof config.tabletMarginLeft === "number" ? `${config.tabletMarginLeft}px` : mLeftMobile;

  const mTopDesktop = typeof config.marginTop === "number" ? `${config.marginTop}px` : mTopTablet;
  const mRightDesktop = typeof config.marginRight === "number" ? `${config.marginRight}px` : mRightTablet;
  const mBottomDesktop = typeof config.marginBottom === "number" ? `${config.marginBottom}px` : mBottomTablet;
  const mLeftDesktop = typeof config.marginLeft === "number" ? `${config.marginLeft}px` : mLeftTablet;

  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const paddingFallbackMobile = '0px';
  const paddingFallbackTablet = '0px';
  const paddingFallbackDesktop = '0px';
  const basePaddingTop = typeof config.paddingTop === "number" ? `${config.paddingTop}px` : undefined;
  const basePaddingRight = typeof config.paddingRight === "number" ? `${config.paddingRight}px` : undefined;
  const basePaddingBottom = typeof config.paddingBottom === "number" ? `${config.paddingBottom}px` : undefined;
  const basePaddingLeft = typeof config.paddingLeft === "number" ? `${config.paddingLeft}px` : undefined;
  const pTopMobile = typeof config.mobilePaddingTop === "number" ? `${config.mobilePaddingTop}px` : (basePaddingTop ?? paddingFallbackMobile);
  const pRightMobile = typeof config.mobilePaddingRight === "number" ? `${config.mobilePaddingRight}px` : (basePaddingRight ?? paddingFallbackMobile);
  const pBottomMobile = typeof config.mobilePaddingBottom === "number" ? `${config.mobilePaddingBottom}px` : (basePaddingBottom ?? paddingFallbackMobile);
  const pLeftMobile = typeof config.mobilePaddingLeft === "number" ? `${config.mobilePaddingLeft}px` : (basePaddingLeft ?? paddingFallbackMobile);

  const pTopTablet = typeof config.tabletPaddingTop === "number" ? `${config.tabletPaddingTop}px` : (basePaddingTop ?? paddingFallbackTablet);
  const pRightTablet = typeof config.tabletPaddingRight === "number" ? `${config.tabletPaddingRight}px` : (basePaddingRight ?? paddingFallbackTablet);
  const pBottomTablet = typeof config.tabletPaddingBottom === "number" ? `${config.tabletPaddingBottom}px` : (basePaddingBottom ?? paddingFallbackTablet);
  const pLeftTablet = typeof config.tabletPaddingLeft === "number" ? `${config.tabletPaddingLeft}px` : (basePaddingLeft ?? paddingFallbackTablet);

  const pTopDesktop = basePaddingTop ?? paddingFallbackDesktop;
  const pRightDesktop = basePaddingRight ?? paddingFallbackDesktop;
  const pBottomDesktop = basePaddingBottom ?? paddingFallbackDesktop;
  const pLeftDesktop = basePaddingLeft ?? paddingFallbackDesktop;

  const padTopMobile = ignorePadding ? "0px" : pTopMobile;
  const padRightMobile = ignorePadding ? "0px" : pRightMobile;
  const padBottomMobile = ignorePadding ? "0px" : pBottomMobile;
  const padLeftMobile = ignorePadding ? "0px" : pLeftMobile;
  const padTopTablet = ignorePadding ? "0px" : pTopTablet;
  const padRightTablet = ignorePadding ? "0px" : pRightTablet;
  const padBottomTablet = ignorePadding ? "0px" : pBottomTablet;
  const padLeftTablet = ignorePadding ? "0px" : pLeftTablet;
  const padTopDesktop = ignorePadding ? "0px" : pTopDesktop;
  const padRightDesktop = ignorePadding ? "0px" : pRightDesktop;
  const padBottomDesktop = ignorePadding ? "0px" : pBottomDesktop;
  const padLeftDesktop = ignorePadding ? "0px" : pLeftDesktop;

  const boxColorDesktop = getResponsiveValue<string>(configRecord, "boxColor", "desktop") || 'transparent';
  const boxColorTablet = getResponsiveValue<string>(configRecord, "boxColor", "tablet") || boxColorDesktop;
  const boxColorMobile = getResponsiveValue<string>(configRecord, "boxColor", "mobile") || boxColorTablet;
  const effectiveUseBoxDesktop = useBoxValues.desktop && !isTransparentLikeToken(boxColorDesktop) && !isLegacyNeutralSurface(boxColorDesktop);
  const effectiveUseBoxTablet = useBoxValues.tablet && !isTransparentLikeToken(boxColorTablet) && !isLegacyNeutralSurface(boxColorTablet);
  const effectiveUseBoxMobile = useBoxValues.mobile && !isTransparentLikeToken(boxColorMobile) && !isLegacyNeutralSurface(boxColorMobile);
  const useBox = pickResponsiveValue({ desktop: effectiveUseBoxDesktop, tablet: effectiveUseBoxTablet, mobile: effectiveUseBoxMobile }, device);
  const boxColor = device === "mobile" ? boxColorMobile : device === "tablet" ? boxColorTablet : boxColorDesktop;
  const emptyStateBgMobile = (config as any).mobileEmptyStateBgColor || config.emptyStateBgColor || 'transparent';
  const emptyStateBgTablet = (config as any).tabletEmptyStateBgColor || emptyStateBgMobile;
  const emptyStateBgDesktop = config.emptyStateBgColor || emptyStateBgTablet;
  const emptyStateBorderMobile = (config as any).mobileEmptyStateBorderColor || config.emptyStateBorderColor || 'var(--border, #e5e7eb)';
  const emptyStateBorderTablet = (config as any).tabletEmptyStateBorderColor || emptyStateBorderMobile;
  const emptyStateBorderDesktop = config.emptyStateBorderColor || emptyStateBorderTablet;
  const emptyStateTextMobile = (config as any).mobileEmptyStateTextColor || config.emptyStateTextColor || 'var(--muted-text, var(--home-meta-color, #9ca3af))';
  const emptyStateTextTablet = (config as any).tabletEmptyStateTextColor || emptyStateTextMobile;
  const emptyStateTextDesktop = config.emptyStateTextColor || emptyStateTextTablet;
  const emptyStateSubtextMobile = (config as any).mobileEmptyStateSubtextColor || config.emptyStateSubtextColor || '#6b7280';
  const emptyStateSubtextTablet = (config as any).tabletEmptyStateSubtextColor || emptyStateSubtextMobile;
  const emptyStateSubtextDesktop = config.emptyStateSubtextColor || emptyStateSubtextTablet;
  const widgetTitle = (typeof customTitle === "string" && customTitle.trim() !== "")
    ? customTitle.trim()
    : (typeof (block as any).title === "string" && (block as any).title.trim() !== "")
      ? (block as any).title.trim()
      : (typeof config.title === "string" && config.title.trim() !== "")
        ? config.title.trim()
        : "Iklan Banner";
  const blockTitleColorDesktop = typeof config.blockTitleColor === "string" && config.blockTitleColor.trim() !== "" ? config.blockTitleColor : "var(--home-widget-title-color, var(--heading-color, #1e293b))";
  const blockTitleColorTablet = typeof (config as any).tabletBlockTitleColor === "string" && (config as any).tabletBlockTitleColor.trim() !== "" ? (config as any).tabletBlockTitleColor : blockTitleColorDesktop;
  const blockTitleColorMobile = typeof (config as any).mobileBlockTitleColor === "string" && (config as any).mobileBlockTitleColor.trim() !== "" ? (config as any).mobileBlockTitleColor : blockTitleColorDesktop;
  const blockTitleBorderDesktop = typeof config.blockTitleBorderColor === "string" && config.blockTitleBorderColor.trim() !== "" ? config.blockTitleBorderColor : "var(--accent)";
  const blockTitleBorderTablet = typeof (config as any).tabletBlockTitleBorderColor === "string" && (config as any).tabletBlockTitleBorderColor.trim() !== "" ? (config as any).tabletBlockTitleBorderColor : blockTitleBorderDesktop;
  const blockTitleBorderMobile = typeof (config as any).mobileBlockTitleBorderColor === "string" && (config as any).mobileBlockTitleBorderColor.trim() !== "" ? (config as any).mobileBlockTitleBorderColor : blockTitleBorderDesktop;
  const blockTitleFsDesktop = toCssSize(config.blockTitleFontSize, "var(--home-widget-title-size, 20px)");
  const blockTitleFsTablet = toCssSize((config as any).tabletBlockTitleFontSize ?? config.blockTitleFontSize, blockTitleFsDesktop);
  const blockTitleFsMobile = toCssSize((config as any).mobileBlockTitleFontSize ?? config.blockTitleFontSize, "var(--home-widget-title-size, 20px)");
  const blockTitleLhDesktop = String(config.blockTitleLineHeight ?? "1.2");
  const blockTitleLhTablet = String((config as any).tabletBlockTitleLineHeight ?? config.blockTitleLineHeight ?? blockTitleLhDesktop);
  const blockTitleLhMobile = String((config as any).mobileBlockTitleLineHeight ?? config.blockTitleLineHeight ?? "1.2");
  const blockTitleMbDesktop = toCssSize(config.blockTitleMarginBottom, "12px");
  const blockTitleMbTablet = toCssSize((config as any).tabletBlockTitleMarginBottom ?? config.blockTitleMarginBottom, blockTitleMbDesktop);
  const blockTitleMbMobile = toCssSize((config as any).mobileBlockTitleMarginBottom ?? config.blockTitleMarginBottom, "12px");
  const blockTitlePbDesktop = toCssSize(config.blockTitlePaddingBottom, "12px");
  const blockTitlePbTablet = toCssSize((config as any).tabletBlockTitlePaddingBottom ?? config.blockTitlePaddingBottom, blockTitlePbDesktop);
  const blockTitlePbMobile = toCssSize((config as any).mobileBlockTitlePaddingBottom ?? config.blockTitlePaddingBottom, "12px");
  
  const responsiveBoxBorderRadius = getResponsiveValue<string>(configRecord, "boxBorderRadius", device);
  const globalRadius = borderRadius || 'var(--home-main-box-radius, 0.75rem)';
  const boxBorderRadius = responsiveBoxBorderRadius !== undefined
    ? resolveWidgetRadius(responsiveBoxBorderRadius, globalRadius)
    : (useBox ? globalRadius : '0');
  const boxPtMobile = typeof (config as any).mobileBoxPaddingTop === "number" ? `${(config as any).mobileBoxPaddingTop}px` : (typeof config.boxPaddingTop === "number" ? `${config.boxPaddingTop}px` : '0px');
  const boxPrMobile = typeof (config as any).mobileBoxPaddingRight === "number" ? `${(config as any).mobileBoxPaddingRight}px` : (typeof config.boxPaddingRight === "number" ? `${config.boxPaddingRight}px` : '0px');
  const boxPbMobile = typeof (config as any).mobileBoxPaddingBottom === "number" ? `${(config as any).mobileBoxPaddingBottom}px` : (typeof config.boxPaddingBottom === "number" ? `${config.boxPaddingBottom}px` : '0px');
  const boxPlMobile = typeof (config as any).mobileBoxPaddingLeft === "number" ? `${(config as any).mobileBoxPaddingLeft}px` : (typeof config.boxPaddingLeft === "number" ? `${config.boxPaddingLeft}px` : '0px');
  const boxPtTablet = typeof (config as any).tabletBoxPaddingTop === "number" ? `${(config as any).tabletBoxPaddingTop}px` : (typeof config.boxPaddingTop === "number" ? `${config.boxPaddingTop}px` : boxPtMobile);
  const boxPrTablet = typeof (config as any).tabletBoxPaddingRight === "number" ? `${(config as any).tabletBoxPaddingRight}px` : (typeof config.boxPaddingRight === "number" ? `${config.boxPaddingRight}px` : boxPrMobile);
  const boxPbTablet = typeof (config as any).tabletBoxPaddingBottom === "number" ? `${(config as any).tabletBoxPaddingBottom}px` : (typeof config.boxPaddingBottom === "number" ? `${config.boxPaddingBottom}px` : boxPbMobile);
  const boxPlTablet = typeof (config as any).tabletBoxPaddingLeft === "number" ? `${(config as any).tabletBoxPaddingLeft}px` : (typeof config.boxPaddingLeft === "number" ? `${config.boxPaddingLeft}px` : boxPlMobile);
  const boxPtDesktop = typeof config.boxPaddingTop === "number" ? `${config.boxPaddingTop}px` : boxPtTablet;
  const boxPrDesktop = typeof config.boxPaddingRight === "number" ? `${config.boxPaddingRight}px` : boxPrTablet;
  const boxPbDesktop = typeof config.boxPaddingBottom === "number" ? `${config.boxPaddingBottom}px` : boxPbTablet;
  const boxPlDesktop = typeof config.boxPaddingLeft === "number" ? `${config.boxPaddingLeft}px` : boxPlTablet;
  const currentBoxPt = device === "mobile" ? boxPtMobile : device === "tablet" ? boxPtTablet : boxPtDesktop;
  const currentBoxPr = device === "mobile" ? boxPrMobile : device === "tablet" ? boxPrTablet : boxPrDesktop;
  const currentBoxPb = device === "mobile" ? boxPbMobile : device === "tablet" ? boxPbTablet : boxPbDesktop;
  const currentBoxPl = device === "mobile" ? boxPlMobile : device === "tablet" ? boxPlTablet : boxPlDesktop;

  const containerStyle = {
      display: 'block',
      width: '100%',
      overflow: 'hidden',
      '--rb-mt-mobile': mTopMobile,
      '--rb-mr-mobile': mRightMobile,
      '--rb-mb-mobile': mBottomMobile,
      '--rb-ml-mobile': mLeftMobile,
      '--rb-pt-mobile': padTopMobile,
      '--rb-pr-mobile': padRightMobile,
      '--rb-pb-mobile': padBottomMobile,
      '--rb-pl-mobile': padLeftMobile,
      '--rb-mt-tablet': mTopTablet,
      '--rb-mr-tablet': mRightTablet,
      '--rb-mb-tablet': mBottomTablet,
      '--rb-ml-tablet': mLeftTablet,
      '--rb-pt-tablet': padTopTablet,
      '--rb-pr-tablet': padRightTablet,
      '--rb-pb-tablet': padBottomTablet,
      '--rb-pl-tablet': padLeftTablet,
      '--rb-mt-desktop': mTopDesktop,
      '--rb-mr-desktop': mRightDesktop,
      '--rb-mb-desktop': mBottomDesktop,
      '--rb-ml-desktop': mLeftDesktop,
      '--rb-pt-desktop': padTopDesktop,
      '--rb-pr-desktop': padRightDesktop,
      '--rb-pb-desktop': padBottomDesktop,
      '--rb-pl-desktop': padLeftDesktop,
      '--ad-empty-bg-mobile': emptyStateBgMobile,
      '--ad-empty-bg-tablet': emptyStateBgTablet,
      '--ad-empty-bg-desktop': emptyStateBgDesktop,
      '--ad-empty-border-mobile': emptyStateBorderMobile,
      '--ad-empty-border-tablet': emptyStateBorderTablet,
      '--ad-empty-border-desktop': emptyStateBorderDesktop,
      '--ad-empty-title-mobile': emptyStateTextMobile,
      '--ad-empty-title-tablet': emptyStateTextTablet,
      '--ad-empty-title-desktop': emptyStateTextDesktop,
      '--ad-empty-subtext-mobile': emptyStateSubtextMobile,
      '--ad-empty-subtext-tablet': emptyStateSubtextTablet,
      '--ad-empty-subtext-desktop': emptyStateSubtextDesktop,
  } as React.CSSProperties;

  const adRadius = resolveWidgetRadius(borderRadius, globalRadius);
  const currentBlockTitleColor = device === "mobile" ? blockTitleColorMobile : device === "tablet" ? blockTitleColorTablet : blockTitleColorDesktop;
  const currentBlockTitleBorder = device === "mobile" ? blockTitleBorderMobile : device === "tablet" ? blockTitleBorderTablet : blockTitleBorderDesktop;
  const currentBlockTitleFs = device === "mobile" ? blockTitleFsMobile : device === "tablet" ? blockTitleFsTablet : blockTitleFsDesktop;
  const currentBlockTitleLh = device === "mobile" ? blockTitleLhMobile : device === "tablet" ? blockTitleLhTablet : blockTitleLhDesktop;
  const currentBlockTitleMb = device === "mobile" ? blockTitleMbMobile : device === "tablet" ? blockTitleMbTablet : blockTitleMbDesktop;
  const currentBlockTitlePb = device === "mobile" ? blockTitlePbMobile : device === "tablet" ? blockTitlePbTablet : blockTitlePbDesktop;

  const responsivePosition = getResponsiveValue<string>(configRecord, "position", device);
  const selectedAdId = typeof config.selectedAdId === "string" ? config.selectedAdId.trim() : "";
  const positionCode = (typeof responsivePosition === "string" && responsivePosition.trim() !== "")
    ? responsivePosition.trim().toUpperCase()
    : "AD_POSITION";
  const positionCodesKey = selectedAdId ? "" : positionCode;
  const positionCodes = useMemo(
    () => positionCodesKey.split("|").filter(Boolean),
    [positionCodesKey]
  );

  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scriptHostRef = useRef<HTMLDivElement | null>(null);
  const [postTagSlugs, setPostTagSlugs] = useState<string[]>([]);

  const pageContext = useMemo(() => {
    const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";
    const segments = cleanPath.split("/").filter(Boolean).map((item) => decodeURIComponent(item));

    if (segments.length === 0) return { pageType: "HOME", categorySlug: "", tagSlug: "", pageSlug: "", postSlug: "" };

    if ((segments[0] === "kategori" || segments[0] === "category") && segments[1]) {
      return { pageType: "CATEGORY_ARCHIVE", categorySlug: segments[1], tagSlug: "", pageSlug: "", postSlug: "" };
    }

    if (segments[0] === "tag" && segments[1]) {
      return { pageType: "TAG_ARCHIVE", categorySlug: "", tagSlug: segments[1], pageSlug: "", postSlug: "" };
    }

    if (segments.length === 2) {
      return { pageType: "POST_DETAIL", categorySlug: segments[0], tagSlug: "", pageSlug: "", postSlug: segments[1] };
    }

    if (segments.length === 1) {
      return { pageType: "STATIC_PAGE", categorySlug: "", tagSlug: "", pageSlug: segments[0], postSlug: "" };
    }

    return { pageType: "STATIC_PAGE", categorySlug: "", tagSlug: "", pageSlug: "", postSlug: "" };
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (pageContext.pageType !== "POST_DETAIL" || !pageContext.postSlug) {
        setPostTagSlugs([]);
        return;
      }
      try {
        const res = await fetch(`/api/public/posts?slug=${encodeURIComponent(pageContext.postSlug)}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setPostTagSlugs([]);
          return;
        }
        const post = (await res.json()) as any;
        const tags: any[] = Array.isArray(post?.tags) ? post.tags : [];
        const slugs: string[] = tags
          .map((t: any) => String(t?.slug || "").trim().toLowerCase())
          .filter((value: string) => Boolean(value));
        const unique = Array.from(new Set<string>(slugs));
        if (!cancelled) setPostTagSlugs(unique);
      } catch {
        if (!cancelled) setPostTagSlugs([]);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [pageContext.pageType, pageContext.postSlug]);

  const fetchUrl = useMemo(() => {
    const params = new URLSearchParams({
      active: "true",
      pageType: pageContext.pageType,
    });
    if (selectedAdId) {
      params.set("id", selectedAdId);
    } else if (positionCodes.length > 1) {
      params.set("positions", positionCodes.join(","));
    } else {
      params.set("position", positionCode);
    }

    if (pageContext.categorySlug) params.set("categorySlug", pageContext.categorySlug);
    if (pageContext.tagSlug) params.set("tagSlug", pageContext.tagSlug);
    if (pageContext.pageSlug) params.set("pageSlug", pageContext.pageSlug);
    if (pageContext.pageType === "POST_DETAIL" && postTagSlugs.length > 0) {
      params.set("tagSlugs", postTagSlugs.join(","));
    }

    return `/api/ads?${params.toString()}`;
  }, [
    selectedAdId,
    positionCode,
    positionCodes,
    pageContext.pageType,
    pageContext.categorySlug,
    pageContext.tagSlug,
    pageContext.pageSlug,
    postTagSlugs,
  ]);

  useEffect(() => {
    let cancelled = false;
    const sortItems = (items: Advertisement[]) => [...items].sort((a, b) => {
      if (selectedAdId) return 0;
      const aIndex = positionCodes.indexOf(String(a.position || "").toUpperCase());
      const bIndex = positionCodes.indexOf(String(b.position || "").toUpperCase());
      const normalizedA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
      const normalizedB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
      return normalizedA - normalizedB;
    });
    const run = async () => {
      const cachedItems = adResponseCache.get(fetchUrl);
      if (cachedItems) {
        setAd(sortItems(cachedItems)[0] || null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const request = adRequestCache.get(fetchUrl) || fetch(fetchUrl, { cache: "no-store" })
          .then(async (res) => {
            const data = await res.json();
            return Array.isArray(data) ? data as Advertisement[] : [];
          })
          .finally(() => {
            adRequestCache.delete(fetchUrl);
          });
        if (!adRequestCache.has(fetchUrl)) {
          adRequestCache.set(fetchUrl, request);
        }
        const items = await request;
        adResponseCache.set(fetchUrl, items);
        const sortedItems = sortItems(items);
        if (cancelled) return;
        setAd(sortedItems[0] || null);
      } catch {
        if (cancelled) return;
        setAd(null);
        setError("Gagal memuat iklan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [fetchUrl, positionCodes, selectedAdId]);

  useEffect(() => {
    const host = scriptHostRef.current;
    if (!host) return;
    host.innerHTML = "";
    if (!ad || ad.type !== "SCRIPT") return;
    const html = typeof ad.scriptCode === "string" ? ad.scriptCode : "";
    if (!html.trim()) return;

    const container = document.createElement("div");
    container.innerHTML = html;

    const scripts = Array.from(container.querySelectorAll("script"));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (oldScript.textContent) newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    while (container.firstChild) host.appendChild(container.firstChild);
  }, [ad]);

  const renderAd = () => {
    if (loading) {
      return (
        <div className="w-full flex justify-center items-center min-h-[100px] [color:var(--muted-text,var(--home-meta-color,#9ca3af))] text-xs font-medium uppercase tracking-widest" style={{ borderRadius: adRadius }}>
          Memuat iklan...
        </div>
      );
    }
    if (error) {
      return (
        <div className="w-full flex justify-center items-center min-h-[100px] [color:var(--muted-text,var(--home-meta-color,#9ca3af))] text-xs font-medium uppercase tracking-widest" style={{ borderRadius: adRadius }}>
          {error}
        </div>
      );
    }
    if (!ad) return null;

    if (ad.type === "SCRIPT") {
      return (
        <div className="w-full" style={{ borderRadius: adRadius, overflow: 'hidden' }}>
          <div ref={scriptHostRef} className="w-full flex justify-center" />
        </div>
      );
    }

    const src = ad.media?.fileUrl;
    if (!src) return null;
    const mW = ad.media?.width && Number(ad.media.width) > 0 ? Number(ad.media.width) : undefined;
    const mH = ad.media?.height && Number(ad.media.height) > 0 ? Number(ad.media.height) : undefined;
    const width = mW ?? 300;
    const height = mH ?? 250;

    const img = (
      <div className="w-full" style={{ borderRadius: adRadius, overflow: 'hidden' }}>
        <Image
          src={src}
          alt={ad.name || "Iklan"}
          width={width}
          height={height}
          style={{ width: '100%', height: 'auto' }}
          className="block"
          sizes="(max-width: 768px) 100vw, 360px"
        />
      </div>
    );

    if (ad.linkUrl && typeof ad.linkUrl === "string" && ad.linkUrl.trim() !== "") {
      return (
        <Link href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="w-full block">
          {img}
        </Link>
      );
    }

    return img;
  };

  const hideWhenEmptyEnabled = hideWhenEmpty || config.hideWhenEmpty === true;
  const hasAd = !!ad;
  if (hideWhenEmptyEnabled && !loading && !error && !hasAd) return null;
  const innerBoxStyle = (hasAd
    ? { backgroundColor: 'transparent', border: 'none' }
    : { minHeight: '100px' }
  ) as React.CSSProperties;
  innerBoxStyle.borderRadius = adRadius;
  innerBoxStyle.overflow = "hidden";
  innerBoxStyle.backgroundColor = useBox ? boxColor : 'transparent';
  innerBoxStyle.borderRadius = useBox ? boxBorderRadius : adRadius;
  innerBoxStyle.boxShadow = useBox ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none';
  innerBoxStyle.border = useBox ? 'var(--box-border, 1px solid #f3f4f6)' : innerBoxStyle.border;
  innerBoxStyle.paddingTop = useBox ? currentBoxPt : '0px';
  innerBoxStyle.paddingRight = useBox ? currentBoxPr : '0px';
  innerBoxStyle.paddingBottom = useBox ? currentBoxPb : '0px';
  innerBoxStyle.paddingLeft = useBox ? currentBoxPl : '0px';

  return (
    <div
      id={`ad-banner-${block.id}`}
      className={`ad-banner-wrapper ad-banner-block responsive-block-frame ${visibilityClass}`.trim()}
      style={containerStyle}
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
        <div
          className={hasAd ? "w-full" : "w-full flex justify-center items-center relative ad-banner-empty border border-dashed"}
          style={innerBoxStyle}
        >
          {hasAd ? renderAd() : (
            <div className="text-center px-4 py-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] ad-empty-title">{selectedAdId ? "Iklan Belum Tersedia" : "Slot Iklan Kosong"}</div>
              <div className="text-xs mt-2 ad-empty-subtext">{selectedAdId ? "Iklan yang dipilih belum aktif atau belum cocok untuk halaman ini." : `Posisi: ${positionCode}`}</div>
            </div>
          )}
        </div>
    </div>
  );
}
