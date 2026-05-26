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
}

export default function AdBanner({ block, borderRadius, hideWhenEmpty = false, previewDevice, ignorePadding = false }: AdBannerProps) {
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
  const useBox = pickResponsiveValue(useBoxValues, device);
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

  const boxColor = getResponsiveValue<string>(configRecord, "boxColor", device) || '#ffffff';
  const blockTitleColorMobile = (config as any).mobileBlockTitleColor || config.blockTitleColor || 'var(--home-widget-title-color, inherit)';
  const blockTitleColorTablet = (config as any).tabletBlockTitleColor || blockTitleColorMobile;
  const blockTitleColorDesktop = config.blockTitleColor || blockTitleColorTablet;
  const blockTitleBorderColorMobile = (config as any).mobileBlockTitleBorderColor || config.blockTitleBorderColor || 'var(--accent)';
  const blockTitleBorderColorTablet = (config as any).tabletBlockTitleBorderColor || blockTitleBorderColorMobile;
  const blockTitleBorderColorDesktop = config.blockTitleBorderColor || blockTitleBorderColorTablet;
  const blockTitleFsMobile = typeof (config as any).mobileBlockTitleFontSize === "number" ? `${(config as any).mobileBlockTitleFontSize}px` : (typeof config.blockTitleFontSize === "number" ? `${config.blockTitleFontSize}px` : 'var(--home-widget-title-size, 1.25rem)');
  const blockTitleFsTablet = typeof (config as any).tabletBlockTitleFontSize === "number" ? `${(config as any).tabletBlockTitleFontSize}px` : blockTitleFsMobile;
  const blockTitleFsDesktop = typeof config.blockTitleFontSize === "number" ? `${config.blockTitleFontSize}px` : blockTitleFsTablet;
  const emptyStateBgMobile = (config as any).mobileEmptyStateBgColor || config.emptyStateBgColor || '#f9fafb';
  const emptyStateBgTablet = (config as any).tabletEmptyStateBgColor || emptyStateBgMobile;
  const emptyStateBgDesktop = config.emptyStateBgColor || emptyStateBgTablet;
  const emptyStateBorderMobile = (config as any).mobileEmptyStateBorderColor || config.emptyStateBorderColor || '#e5e7eb';
  const emptyStateBorderTablet = (config as any).tabletEmptyStateBorderColor || emptyStateBorderMobile;
  const emptyStateBorderDesktop = config.emptyStateBorderColor || emptyStateBorderTablet;
  const emptyStateTextMobile = (config as any).mobileEmptyStateTextColor || config.emptyStateTextColor || '#9ca3af';
  const emptyStateTextTablet = (config as any).tabletEmptyStateTextColor || emptyStateTextMobile;
  const emptyStateTextDesktop = config.emptyStateTextColor || emptyStateTextTablet;
  const emptyStateSubtextMobile = (config as any).mobileEmptyStateSubtextColor || config.emptyStateSubtextColor || '#6b7280';
  const emptyStateSubtextTablet = (config as any).tabletEmptyStateSubtextColor || emptyStateSubtextMobile;
  const emptyStateSubtextDesktop = config.emptyStateSubtextColor || emptyStateSubtextTablet;
  
  const responsiveBoxBorderRadius = getResponsiveValue<string>(configRecord, "boxBorderRadius", device);
  const globalRadius = borderRadius || 'var(--home-main-box-radius, 0.75rem)';
  const boxBorderRadius = responsiveBoxBorderRadius !== undefined
    ? resolveWidgetRadius(responsiveBoxBorderRadius, globalRadius)
    : (useBox ? globalRadius : '0');

  const containerStyle = {
      backgroundColor: useBox ? boxColor : 'transparent',
      borderRadius: useBox ? boxBorderRadius : '0',
      boxShadow: useBox ? 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))' : 'none',
      border: useBox ? 'var(--box-border, 1px solid #f3f4f6)' : 'none',
      display: 'block',
      width: '100%',
      overflow: 'hidden'
  } as React.CSSProperties;

  const adRadius = resolveWidgetRadius(borderRadius, globalRadius);

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
        <div className="w-full flex justify-center items-center min-h-[100px] text-gray-400 text-xs font-medium uppercase tracking-widest" style={{ borderRadius: adRadius }}>
          Memuat iklan...
        </div>
      );
    }
    if (error) {
      return (
        <div className="w-full flex justify-center items-center min-h-[100px] text-gray-400 text-xs font-medium uppercase tracking-widest" style={{ borderRadius: adRadius }}>
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
    : { minHeight: '100px', backgroundColor: emptyStateBgMobile, border: `1px dashed ${emptyStateBorderMobile}` }
  ) as React.CSSProperties;
  innerBoxStyle.borderRadius = adRadius;
  innerBoxStyle.overflow = "hidden";

  return (
    <div id={`ad-banner-${block.id}`} className={`ad-banner-wrapper ${visibilityClass}`} style={containerStyle}>
        <style dangerouslySetInnerHTML={{__html: `
          #ad-banner-${block.id} { margin-top: ${mTopMobile} !important; margin-right: ${mRightMobile} !important; margin-bottom: ${mBottomMobile} !important; margin-left: ${mLeftMobile} !important; padding-top: ${padTopMobile} !important; padding-right: ${padRightMobile} !important; padding-bottom: ${padBottomMobile} !important; padding-left: ${padLeftMobile} !important; }
          #ad-banner-${block.id} .theme-widget-title { font-size: ${blockTitleFsMobile}; color: ${blockTitleColorMobile}; }
          #ad-banner-${block.id} .widget-title-bar { background-color: ${blockTitleBorderColorMobile}; }
          #ad-banner-${block.id} .ad-empty-title { color: ${emptyStateTextMobile}; }
          #ad-banner-${block.id} .ad-empty-subtext { color: ${emptyStateSubtextMobile}; }
          @media (min-width: 768px) { #ad-banner-${block.id} { margin-top: ${mTopTablet} !important; margin-right: ${mRightTablet} !important; margin-bottom: ${mBottomTablet} !important; margin-left: ${mLeftTablet} !important; padding-top: ${padTopTablet} !important; padding-right: ${padRightTablet} !important; padding-bottom: ${padBottomTablet} !important; padding-left: ${padLeftTablet} !important; } #ad-banner-${block.id} .theme-widget-title { font-size: ${blockTitleFsTablet}; color: ${blockTitleColorTablet}; } #ad-banner-${block.id} .widget-title-bar { background-color: ${blockTitleBorderColorTablet}; } #ad-banner-${block.id} .ad-banner-empty { background-color: ${emptyStateBgTablet}; border-color: ${emptyStateBorderTablet}; } #ad-banner-${block.id} .ad-empty-title { color: ${emptyStateTextTablet}; } #ad-banner-${block.id} .ad-empty-subtext { color: ${emptyStateSubtextTablet}; } }
          @media (min-width: 1025px) { #ad-banner-${block.id} { margin-top: ${mTopDesktop} !important; margin-right: ${mRightDesktop} !important; margin-bottom: ${mBottomDesktop} !important; margin-left: ${mLeftDesktop} !important; padding-top: ${padTopDesktop} !important; padding-right: ${padRightDesktop} !important; padding-bottom: ${padBottomDesktop} !important; padding-left: ${padLeftDesktop} !important; } #ad-banner-${block.id} .theme-widget-title { font-size: ${blockTitleFsDesktop}; color: ${blockTitleColorDesktop}; } #ad-banner-${block.id} .widget-title-bar { background-color: ${blockTitleBorderColorDesktop}; } #ad-banner-${block.id} .ad-banner-empty { background-color: ${emptyStateBgDesktop}; border-color: ${emptyStateBorderDesktop}; } #ad-banner-${block.id} .ad-empty-title { color: ${emptyStateTextDesktop}; } #ad-banner-${block.id} .ad-empty-subtext { color: ${emptyStateSubtextDesktop}; } }
        `}} />

        <div
          className={hasAd ? "w-full" : "w-full flex justify-center items-center relative ad-banner-empty"}
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
