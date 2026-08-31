"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBool, type ResponsiveDevice } from "./responsive";
import { sanitizeCssUrl } from "@/lib/sanitizer";

type NewsGridSliderPost = {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  image?: string | null;
  publishedAt?: string | Date | null;
  createdAt?: string | Date | null;
  category?: { slug: string; name: string } | null;
  author?: { name?: string; fullName?: string } | string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  featuredImage?: { fileUrl?: string | null } | null;
};

type NewsGridSliderConfig = {
  title?: string;
  showTitle?: boolean;
  limit?: number;
  tabletLimit?: number;
  mobileLimit?: number;
  offset?: number;
  autoplay?: boolean;
  autoplayMs?: number;
  loop?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  dotColor?: string;
  tabletDotColor?: string;
  mobileDotColor?: string;
  dotInactiveColor?: string;
  tabletDotInactiveColor?: string;
  mobileDotInactiveColor?: string;
  slideTransitionMs?: number;
  pauseOnHover?: boolean;
  swipeEnabled?: boolean;
  itemsPerView?: number;
  tabletItemsPerView?: number;
  mobileItemsPerView?: number;
  slideStep?: number | string;
  imageHeight?: number | string;
  tabletImageHeight?: number | string;
  mobileImageHeight?: number | string;
  gridGapX?: number;
  tabletGridGapX?: number;
  mobileGridGapX?: number;
  showExcerpt?: boolean;
  excerptLength?: number;
  showMetaInfo?: boolean;
  showCategory?: boolean;
  showAuthor?: boolean;
  showDate?: boolean;
  titleColor?: string;
  tabletTitleColor?: string;
  mobileTitleColor?: string;
  titleHoverColor?: string;
  tabletTitleHoverColor?: string;
  mobileTitleHoverColor?: string;
  titleMarginBottom?: number;
  tabletTitleMarginBottom?: number;
  mobileTitleMarginBottom?: number;
  metaColor?: string;
  tabletMetaColor?: string;
  mobileMetaColor?: string;
  metaFontWeight?: string | number;
  tabletMetaFontWeight?: string | number;
  mobileMetaFontWeight?: string | number;
  metaMarginBottom?: number;
  tabletMetaMarginBottom?: number;
  mobileMetaMarginBottom?: number;
  excerptColor?: string;
  tabletExcerptColor?: string;
  mobileExcerptColor?: string;
  excerptFontWeight?: string | number;
  tabletExcerptFontWeight?: string | number;
  mobileExcerptFontWeight?: string | number;
  categoryLabelColor?: string;
  tabletCategoryLabelColor?: string;
  mobileCategoryLabelColor?: string;
  categoryLabelBgColor?: string;
  tabletCategoryLabelBgColor?: string;
  mobileCategoryLabelBgColor?: string;
  useBox?: boolean | string;
  boxColor?: string;
  boxBorderRadius?: string | number;
  [key: string]: unknown;
};

interface NewsGridSliderProps {
  block: {
    id: string;
    config?: NewsGridSliderConfig;
  };
  posts?: NewsGridSliderPost[];
  customTitle?: string;
  previewDevice?: ResponsiveDevice;
}

const toNumber = (val: unknown, fallback: number) => {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string" && val.trim() !== "") {
    const n = Number(val);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
};

const toPx = (val: unknown, fallback: string) => {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "number" && Number.isFinite(val)) return `${val}px`;
  if (typeof val === "string" && val.trim() !== "") return /^\d+(\.\d+)?$/.test(val.trim()) ? `${val.trim()}px` : val;
  return fallback;
};

const resolveRadiusValue = (
  value: unknown,
  fallback: string,
  options: { legacyDefaultNumbers?: number[] } = {}
) => {
  const legacyDefaultNumbers = options.legacyDefaultNumbers || [];
  if (value === undefined || value === null) return fallback;
  if (typeof value === "number" && Number.isFinite(value)) {
    if (legacyDefaultNumbers.includes(value)) return fallback;
    return `${Math.max(value, 0)}px`;
  }
  if (typeof value === "string") {
    const v = value.trim();
    if (!v) return fallback;
    const lower = v.toLowerCase();
    if (lower === "default" || lower === "global") return fallback;
    if (/^-?\d+(\.\d+)?$/.test(v)) {
      const parsed = Number(v);
      if (!Number.isFinite(parsed)) return fallback;
      if (legacyDefaultNumbers.includes(parsed)) return fallback;
      return `${Math.max(parsed, 0)}px`;
    }
    switch (lower) {
      case "none": return "0";
      case "sm": return "0.125rem";
      case "md": return "0.375rem";
      case "lg": return "0.5rem";
      case "xl": return "0.75rem";
      case "2xl": return "1rem";
      case "full": return "9999px";
      default: return v;
    }
  }
  return fallback;
};

const toBool = (value: unknown, fallback: boolean) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "1") return true;
    if (v === "false" || v === "0") return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
};

const toFontWeight = (value: unknown, fallback: string) => {
  if (typeof value === "number") return `${value}`;
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return fallback;
};

const normalizeLegacyNeutralSurface = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;

  const legacyLightSurfaces = new Set([
    "#fff",
    "#ffffff",
    "#f8fafc",
    "#f9fafb",
    "#f3f4f6",
    "#f1f5f9",
    "#e5e7eb",
    "white",
    "rgb(255, 255, 255)",
    "rgb(248, 250, 252)",
    "rgb(249, 250, 251)",
    "rgb(243, 244, 246)",
    "rgb(241, 245, 249)",
    "rgb(229, 231, 235)",
  ]);

  return legacyLightSurfaces.has(normalized) ? fallback : value;
};

const clampExcerpt = (excerpt: string | null | undefined, maxLength: number) => {
  if (!excerpt) return "";
  const clean = excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  if (maxLength <= 1) return clean.slice(0, Math.max(0, maxLength));
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
};

const getExcerptSource = (post: NewsGridSliderPost, maxLength: number) => {
  const excerptText = typeof post.excerpt === "string"
    ? post.excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : "";
  const contentText = typeof post.content === "string"
    ? post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : "";

  if (excerptText.length >= maxLength) return excerptText;
  return contentText || excerptText;
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

type DeviceMode = ResponsiveDevice;

export default function NewsGridSlider({ block, posts = [], customTitle, previewDevice }: NewsGridSliderProps) {
  const cfg = block.config || {};
  const configRecord = cfg as Record<string, unknown>;
  const title = customTitle || cfg.title || "Grid Slider";
  const [device, setDevice] = useState<DeviceMode>(previewDevice || "desktop");
  const [trackIndex, setTrackIndex] = useState(0);
  const [useTransition, setUseTransition] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isPublicDarkMode, setIsPublicDarkMode] = useState(false);

  useEffect(() => {
    if (previewDevice) {
      setDevice(previewDevice);
      return;
    }
    const compute = () => {
      const w = window.innerWidth;
      if (w >= 1025) return "desktop" as const;
      if (w >= 768) return "tablet" as const;
      return "mobile" as const;
    };
    const update = () => setDevice(compute());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
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

  const limitDesktop = Math.max(1, toNumber(cfg.limit, 8));
  const limitTablet = Math.max(1, toNumber(cfg.tabletLimit, limitDesktop));
  const limitMobile = Math.max(1, toNumber(cfg.mobileLimit, limitTablet));
  const activeLimit = device === "mobile" ? limitMobile : (device === "tablet" ? limitTablet : limitDesktop);
  const maxLimit = Math.max(limitDesktop, limitTablet, limitMobile);
  const offset = Math.max(0, toNumber(cfg.offset, 0));
  const sourceData = posts.slice(offset, offset + maxLimit);
  const data = sourceData.slice(0, activeLimit);

  const perViewDesktop = Math.max(1, toNumber(cfg.itemsPerView, 3));
  const perViewTablet = Math.max(1, toNumber(cfg.tabletItemsPerView, 2));
  const perViewMobile = Math.max(1, toNumber(cfg.mobileItemsPerView, 1));
  const perView = device === "mobile" ? perViewMobile : (device === "tablet" ? perViewTablet : perViewDesktop);

  const slideStepRaw = cfg.slideStep;
  const slideStep = slideStepRaw === "page" ? perView : Math.max(1, toNumber(slideStepRaw, perView));

  const showArrows = cfg.showArrows !== false;
  const showDots = cfg.showDots !== false;
  const pauseOnHover = cfg.pauseOnHover !== false;
  const swipeEnabled = cfg.swipeEnabled !== false;
  const loop = cfg.loop !== false;
  const autoplay = cfg.autoplay === true;
  const autoplayMs = Math.max(1500, toNumber(cfg.autoplayMs, 5000));
  const transitionMs = Math.max(200, toNumber(cfg.slideTransitionMs, 500));

  const canLoop = loop && data.length > perView;
  const maxStart = Math.max(0, data.length - perView);
  const cloneCount = canLoop ? perView : 0;
  const slideData = canLoop ? [...data.slice(-cloneCount), ...data, ...data.slice(0, cloneCount)] : data;
  const realIndex = canLoop
    ? ((trackIndex - cloneCount) % data.length + data.length) % data.length
    : Math.max(0, Math.min(trackIndex, maxStart));
  const pageCount = Math.max(1, Math.ceil(data.length / perView));
  const currentPage = Math.floor(realIndex / perView);

  useEffect(() => {
    const nextIndex = canLoop ? cloneCount : 0;
    setUseTransition(false);
    setTrackIndex(nextIndex);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setUseTransition(true)));
    return () => cancelAnimationFrame(raf);
  }, [canLoop, cloneCount, data.length, perView]);

  const jumpWithoutTransition = (target: number) => {
    setUseTransition(false);
    setTrackIndex(target);
    requestAnimationFrame(() => requestAnimationFrame(() => setUseTransition(true)));
  };

  useEffect(() => {
    if (!autoplay || data.length <= perView) return;
    if (pauseOnHover && isHovered) return;
    const timer = setInterval(() => {
      setTrackIndex((prev) => {
        const next = prev + slideStep;
        if (canLoop) return next;
        if (next > maxStart) return loop ? 0 : prev;
        return Math.min(next, maxStart);
      });
    }, autoplayMs);
    return () => clearInterval(timer);
  }, [autoplay, autoplayMs, canLoop, data.length, isHovered, loop, maxStart, pauseOnHover, perView, slideStep]);

  const next = () => {
    setTrackIndex((prev) => {
      const n = prev + slideStep;
      if (canLoop) return n;
      if (n > maxStart) return loop ? 0 : prev;
      return Math.min(n, maxStart);
    });
  };

  const prev = () => {
    setTrackIndex((prevIdx) => {
      const p = prevIdx - slideStep;
      if (canLoop) return p;
      if (p < 0) return loop ? maxStart : prevIdx;
      return p;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeEnabled) return;
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swipeEnabled || touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 40) {
      if (delta < 0) next();
      else prev();
    }
    setTouchStartX(null);
  };

  const gapDesktop = `${toNumber(cfg.gridGapX, 4) * 0.25}rem`;
  const gapTablet = `${toNumber(cfg.tabletGridGapX, toNumber(cfg.gridGapX, 4)) * 0.25}rem`;
  const gapMobile = `${toNumber(cfg.mobileGridGapX, toNumber(cfg.gridGapX, 4)) * 0.25}rem`;
  const gap = device === "mobile" ? gapMobile : (device === "tablet" ? gapTablet : gapDesktop);

  const imageHMobile = toPx(cfg.mobileImageHeight ?? cfg.imageHeight, "180px");
  const imageHTablet = toPx(cfg.tabletImageHeight ?? cfg.imageHeight, "190px");
  const imageHDesktop = toPx(cfg.imageHeight, "200px");
  const imageH = device === "mobile" ? imageHMobile : (device === "tablet" ? imageHTablet : imageHDesktop);

  const titleColorMobile = (cfg.mobileTitleColor as string) || (cfg.titleColor as string) || "var(--home-news-title-color, #111827)";
  const titleColorTablet = (cfg.tabletTitleColor as string) || titleColorMobile;
  const titleColorDesktop = (cfg.titleColor as string) || titleColorTablet;
  const titleHoverMobile = (cfg.mobileTitleHoverColor as string) || (cfg.titleHoverColor as string) || "var(--home-hover-color, var(--accent))";
  const titleHoverTablet = (cfg.tabletTitleHoverColor as string) || titleHoverMobile;
  const titleHoverDesktop = (cfg.titleHoverColor as string) || titleHoverTablet;
  const titleColor = device === "mobile" ? titleColorMobile : (device === "tablet" ? titleColorTablet : titleColorDesktop);
  const titleHover = device === "mobile" ? titleHoverMobile : (device === "tablet" ? titleHoverTablet : titleHoverDesktop);
  const titleFsMobile = toPx(cfg.mobileTitleFontSize ?? cfg.titleFontSize, "var(--home-news-title-size, 18px)");
  const titleFsTablet = toPx(cfg.tabletTitleFontSize ?? cfg.titleFontSize, titleFsMobile);
  const titleFsDesktop = toPx(cfg.titleFontSize, titleFsTablet);
  const titleLhMobile = `${toNumber(cfg.mobileTitleLineHeight ?? cfg.titleLineHeight, 1.3)}`;
  const titleLhTablet = `${toNumber(cfg.tabletTitleLineHeight ?? cfg.titleLineHeight, 1.3)}`;
  const titleLhDesktop = `${toNumber(cfg.titleLineHeight, 1.3)}`;
  const titleFwMobile = toFontWeight(cfg.mobileTitleFontWeight ?? cfg.titleFontWeight, "var(--home-news-title-weight, 600)");
  const titleFwTablet = toFontWeight(cfg.tabletTitleFontWeight ?? cfg.titleFontWeight, titleFwMobile);
  const titleFwDesktop = toFontWeight(cfg.titleFontWeight, titleFwTablet);
  const titleFs = device === "mobile" ? titleFsMobile : (device === "tablet" ? titleFsTablet : titleFsDesktop);
  const titleLh = device === "mobile" ? titleLhMobile : (device === "tablet" ? titleLhTablet : titleLhDesktop);
  const titleFw = device === "mobile" ? titleFwMobile : (device === "tablet" ? titleFwTablet : titleFwDesktop);
  const titleMbMobile = toPx(cfg.mobileTitleMarginBottom ?? cfg.titleMarginBottom, "0.375rem");
  const titleMbTablet = toPx(cfg.tabletTitleMarginBottom ?? cfg.titleMarginBottom, titleMbMobile);
  const titleMbDesktop = toPx(cfg.titleMarginBottom, titleMbTablet);
  const titleMb = device === "mobile" ? titleMbMobile : (device === "tablet" ? titleMbTablet : titleMbDesktop);

  const metaColorMobile = (cfg.mobileMetaColor as string) || (cfg.metaColor as string) || "var(--home-meta-color, #9ca3af)";
  const metaColorTablet = (cfg.tabletMetaColor as string) || metaColorMobile;
  const metaColorDesktop = (cfg.metaColor as string) || metaColorTablet;
  const metaColor = device === "mobile" ? metaColorMobile : (device === "tablet" ? metaColorTablet : metaColorDesktop);
  const metaFsMobile = toPx(cfg.mobileMetaFontSize ?? cfg.metaFontSize, "var(--home-meta-size, 12px)");
  const metaFsTablet = toPx(cfg.tabletMetaFontSize ?? cfg.metaFontSize, metaFsMobile);
  const metaFsDesktop = toPx(cfg.metaFontSize, metaFsTablet);
  const metaFs = device === "mobile" ? metaFsMobile : (device === "tablet" ? metaFsTablet : metaFsDesktop);
  const metaLhMobile = `${toNumber(cfg.mobileMetaLineHeight ?? cfg.metaLineHeight, 1.4)}`;
  const metaLhTablet = `${toNumber(cfg.tabletMetaLineHeight ?? cfg.metaLineHeight, 1.4)}`;
  const metaLhDesktop = `${toNumber(cfg.metaLineHeight, 1.4)}`;
  const metaLh = device === "mobile" ? metaLhMobile : (device === "tablet" ? metaLhTablet : metaLhDesktop);
  const metaFwMobile = toFontWeight(cfg.mobileMetaFontWeight ?? cfg.metaFontWeight, "var(--home-meta-weight, 500)");
  const metaFwTablet = toFontWeight(cfg.tabletMetaFontWeight ?? cfg.metaFontWeight, metaFwMobile);
  const metaFwDesktop = toFontWeight(cfg.metaFontWeight, metaFwTablet);
  const metaFw = device === "mobile" ? metaFwMobile : (device === "tablet" ? metaFwTablet : metaFwDesktop);
  const metaMbMobile = toPx(cfg.mobileMetaMarginBottom ?? cfg.metaMarginBottom, "0px");
  const metaMbTablet = toPx(cfg.tabletMetaMarginBottom ?? cfg.metaMarginBottom, metaMbMobile);
  const metaMbDesktop = toPx(cfg.metaMarginBottom, metaMbTablet);
  const metaMb = device === "mobile" ? metaMbMobile : (device === "tablet" ? metaMbTablet : metaMbDesktop);

  const excerptColorMobile = (cfg.mobileExcerptColor as string) || (cfg.excerptColor as string) || "var(--home-excerpt-color, #4b5563)";
  const excerptColorTablet = (cfg.tabletExcerptColor as string) || excerptColorMobile;
  const excerptColorDesktop = (cfg.excerptColor as string) || excerptColorTablet;
  const excerptColor = device === "mobile" ? excerptColorMobile : (device === "tablet" ? excerptColorTablet : excerptColorDesktop);
  const excerptFsMobile = toPx(cfg.mobileExcerptFontSize ?? cfg.excerptFontSize, "var(--home-excerpt-size, 14px)");
  const excerptFsTablet = toPx(cfg.tabletExcerptFontSize ?? cfg.excerptFontSize, excerptFsMobile);
  const excerptFsDesktop = toPx(cfg.excerptFontSize, excerptFsTablet);
  const excerptLhMobile = `${toNumber(cfg.mobileExcerptLineHeight ?? cfg.excerptLineHeight, 1.5)}`;
  const excerptLhTablet = `${toNumber(cfg.tabletExcerptLineHeight ?? cfg.excerptLineHeight, 1.5)}`;
  const excerptLhDesktop = `${toNumber(cfg.excerptLineHeight, 1.5)}`;
  const excerptFs = device === "mobile" ? excerptFsMobile : (device === "tablet" ? excerptFsTablet : excerptFsDesktop);
  const excerptLh = device === "mobile" ? excerptLhMobile : (device === "tablet" ? excerptLhTablet : excerptLhDesktop);
  const excerptFwMobile = toFontWeight(cfg.mobileExcerptFontWeight ?? cfg.excerptFontWeight, "var(--home-excerpt-weight, 400)");
  const excerptFwTablet = toFontWeight(cfg.tabletExcerptFontWeight ?? cfg.excerptFontWeight, excerptFwMobile);
  const excerptFwDesktop = toFontWeight(cfg.excerptFontWeight, excerptFwTablet);
  const excerptFw = device === "mobile" ? excerptFwMobile : (device === "tablet" ? excerptFwTablet : excerptFwDesktop);

  const showWidgetTitle = toBool(cfg.showTitle, true);
  const showCategoryDesktop = getResponsiveBool(configRecord, "showCategory", "desktop", true);
  const showCategoryTablet = getResponsiveBool(configRecord, "showCategory", "tablet", true);
  const showCategoryMobile = getResponsiveBool(configRecord, "showCategory", "mobile", true);
  const showAuthorDesktop = getResponsiveBool(configRecord, "showAuthor", "desktop", true);
  const showAuthorTablet = getResponsiveBool(configRecord, "showAuthor", "tablet", true);
  const showAuthorMobile = getResponsiveBool(configRecord, "showAuthor", "mobile", true);
  const showDateDesktop = getResponsiveBool(configRecord, "showDate", "desktop", true);
  const showDateTablet = getResponsiveBool(configRecord, "showDate", "tablet", true);
  const showDateMobile = getResponsiveBool(configRecord, "showDate", "mobile", true);
  const showMetaInfoDesktop = getResponsiveBool(configRecord, "showMetaInfo", "desktop", getResponsiveBool(configRecord, "showMeta", "desktop", true));
  const showMetaInfoTablet = getResponsiveBool(configRecord, "showMetaInfo", "tablet", getResponsiveBool(configRecord, "showMeta", "tablet", true));
  const showMetaInfoMobile = getResponsiveBool(configRecord, "showMetaInfo", "mobile", getResponsiveBool(configRecord, "showMeta", "mobile", true));
  const showExcerptDesktop = getResponsiveBool(configRecord, "showExcerpt", "desktop", true);
  const showExcerptTablet = getResponsiveBool(configRecord, "showExcerpt", "tablet", true);
  const showExcerptMobile = getResponsiveBool(configRecord, "showExcerpt", "mobile", true);
  const showCategory = device === "mobile" ? showCategoryMobile : (device === "tablet" ? showCategoryTablet : showCategoryDesktop);
  const showAuthor = device === "mobile" ? showAuthorMobile : (device === "tablet" ? showAuthorTablet : showAuthorDesktop);
  const showDate = device === "mobile" ? showDateMobile : (device === "tablet" ? showDateTablet : showDateDesktop);
  const showMetaInfo = device === "mobile" ? showMetaInfoMobile : (device === "tablet" ? showMetaInfoTablet : showMetaInfoDesktop);
  const showExcerpt = device === "mobile" ? showExcerptMobile : (device === "tablet" ? showExcerptTablet : showExcerptDesktop);
  const excerptLengthDesktop = toNumber(cfg.excerptLength, 120);
  const excerptLengthTablet = toNumber(cfg.tabletExcerptLength ?? cfg.excerptLength, excerptLengthDesktop);
  const excerptLengthMobile = toNumber(cfg.mobileExcerptLength ?? cfg.excerptLength, 120);
  const excerptLength = device === "mobile"
    ? excerptLengthMobile
    : (device === "tablet" ? excerptLengthTablet : excerptLengthDesktop);
  const categoryLabelColorMobile = (cfg as any).mobileCategoryLabelTextColor || (cfg.mobileCategoryLabelColor as string) || (cfg.mobileCategoryTextColor as string) || (cfg as any).categoryLabelTextColor || (cfg.categoryLabelColor as string) || (cfg.categoryTextColor as string) || "#ffffff";
  const categoryLabelColorTablet = (cfg as any).tabletCategoryLabelTextColor || (cfg.tabletCategoryLabelColor as string) || (cfg.tabletCategoryTextColor as string) || categoryLabelColorMobile;
  const categoryLabelColorDesktop = (cfg as any).categoryLabelTextColor || (cfg.categoryLabelColor as string) || (cfg.categoryTextColor as string) || categoryLabelColorTablet;
  const categoryLabelColor = device === "mobile" ? categoryLabelColorMobile : (device === "tablet" ? categoryLabelColorTablet : categoryLabelColorDesktop);
  const normalizeCategoryAccent = (value: unknown): string => {
    if (typeof value !== "string" || value.trim() === "") return "var(--accent)";
    const normalized = value.trim().toLowerCase();
    if (normalized === "#e10600" || normalized === "#b00000" || normalized === "rgb(225, 6, 0)") return "var(--accent)";
    return value;
  };
  const categoryLabelBgMobile = normalizeCategoryAccent((cfg.mobileCategoryLabelBgColor as string) || (cfg.mobileCategoryBgColor as string) || (cfg.categoryLabelBgColor as string) || (cfg.categoryBgColor as string) || "var(--accent)");
  const categoryLabelBgTablet = normalizeCategoryAccent((cfg.tabletCategoryLabelBgColor as string) || (cfg.tabletCategoryBgColor as string) || categoryLabelBgMobile);
  const categoryLabelBgDesktop = normalizeCategoryAccent((cfg.categoryLabelBgColor as string) || (cfg.categoryBgColor as string) || categoryLabelBgTablet);
  const categoryLabelBgColor = device === "mobile" ? categoryLabelBgMobile : (device === "tablet" ? categoryLabelBgTablet : categoryLabelBgDesktop);
  const categoryLabelFsMobile = toPx(cfg.mobileCategoryLabelFontSize ?? cfg.mobileCategoryFontSize ?? cfg.categoryLabelFontSize ?? cfg.categoryFontSize, "10px");
  const categoryLabelFsTablet = toPx(cfg.tabletCategoryLabelFontSize ?? cfg.tabletCategoryFontSize ?? cfg.categoryLabelFontSize ?? cfg.categoryFontSize, categoryLabelFsMobile);
  const categoryLabelFsDesktop = toPx(cfg.categoryLabelFontSize ?? cfg.categoryFontSize, categoryLabelFsTablet);
  const categoryLabelLineHeightMobile = String(cfg.mobileCategoryLabelLineHeight ?? cfg.categoryLabelLineHeight ?? "1");
  const categoryLabelLineHeightTablet = String(cfg.tabletCategoryLabelLineHeight ?? cfg.categoryLabelLineHeight ?? categoryLabelLineHeightMobile);
  const categoryLabelLineHeightDesktop = String(cfg.categoryLabelLineHeight ?? categoryLabelLineHeightTablet);
  const categoryLabelPaddingXMobile = toPx(cfg.mobileCategoryLabelPaddingX ?? cfg.mobileCategoryPaddingX ?? cfg.categoryLabelPaddingX ?? cfg.categoryPaddingX, "8px");
  const categoryLabelPaddingXTablet = toPx(cfg.tabletCategoryLabelPaddingX ?? cfg.tabletCategoryPaddingX ?? cfg.categoryLabelPaddingX ?? cfg.categoryPaddingX, categoryLabelPaddingXMobile);
  const categoryLabelPaddingXDesktop = toPx(cfg.categoryLabelPaddingX ?? cfg.categoryPaddingX, categoryLabelPaddingXTablet);
  const categoryLabelPaddingYMobile = toPx(cfg.mobileCategoryLabelPaddingY ?? cfg.mobileCategoryPaddingY ?? cfg.categoryLabelPaddingY ?? cfg.categoryPaddingY, "4px");
  const categoryLabelPaddingYTablet = toPx(cfg.tabletCategoryLabelPaddingY ?? cfg.tabletCategoryPaddingY ?? cfg.categoryLabelPaddingY ?? cfg.categoryPaddingY, categoryLabelPaddingYMobile);
  const categoryLabelPaddingYDesktop = toPx(cfg.categoryLabelPaddingY ?? cfg.categoryPaddingY, categoryLabelPaddingYTablet);

  const useBoxDesktop = cfg.useBox === true || cfg.useBox === "true";
  const useBoxTablet = (cfg.tabletUseBox !== undefined ? (cfg.tabletUseBox === true || cfg.tabletUseBox === "true") : useBoxDesktop);
  const useBoxMobile = (cfg.mobileUseBox !== undefined ? (cfg.mobileUseBox === true || cfg.mobileUseBox === "true") : useBoxDesktop);
  const boxColorDesktop = normalizeLegacyNeutralSurface(cfg.boxColor, "transparent");
  const boxColorTablet = (cfg.tabletBoxColor as string) || boxColorDesktop;
  const boxColorMobile = (cfg.mobileBoxColor as string) || boxColorDesktop;
  const boxBgImageDesktop = sanitizeCssUrl(typeof cfg.backgroundImage === "string" ? cfg.backgroundImage : "");
  const boxBgImageTablet = sanitizeCssUrl(
    typeof cfg.tabletBackgroundImage === "string" && cfg.tabletBackgroundImage.trim() !== "" ? cfg.tabletBackgroundImage : boxBgImageDesktop
  );
  const boxBgImageMobile = sanitizeCssUrl(
    typeof cfg.mobileBackgroundImage === "string" && cfg.mobileBackgroundImage.trim() !== "" ? cfg.mobileBackgroundImage : boxBgImageDesktop
  );
  const boxBgSizeDesktop = typeof (cfg as any).backgroundSize === "string" && (cfg as any).backgroundSize.trim() !== "" ? (cfg as any).backgroundSize : "cover";
  const boxBgSizeTablet = typeof (cfg as any).tabletBackgroundSize === "string" && (cfg as any).tabletBackgroundSize.trim() !== "" ? (cfg as any).tabletBackgroundSize : boxBgSizeDesktop;
  const boxBgSizeMobile = typeof (cfg as any).mobileBackgroundSize === "string" && (cfg as any).mobileBackgroundSize.trim() !== "" ? (cfg as any).mobileBackgroundSize : boxBgSizeDesktop;
  const boxBgPositionDesktop = typeof (cfg as any).backgroundPosition === "string" && (cfg as any).backgroundPosition.trim() !== "" ? (cfg as any).backgroundPosition : "center";
  const boxBgPositionTablet = typeof (cfg as any).tabletBackgroundPosition === "string" && (cfg as any).tabletBackgroundPosition.trim() !== "" ? (cfg as any).tabletBackgroundPosition : boxBgPositionDesktop;
  const boxBgPositionMobile = typeof (cfg as any).mobileBackgroundPosition === "string" && (cfg as any).mobileBackgroundPosition.trim() !== "" ? (cfg as any).mobileBackgroundPosition : boxBgPositionDesktop;
  const boxBgRepeatDesktop = typeof (cfg as any).backgroundRepeat === "string" && (cfg as any).backgroundRepeat.trim() !== "" ? (cfg as any).backgroundRepeat : "no-repeat";
  const boxBgRepeatTablet = typeof (cfg as any).tabletBackgroundRepeat === "string" && (cfg as any).tabletBackgroundRepeat.trim() !== "" ? (cfg as any).tabletBackgroundRepeat : boxBgRepeatDesktop;
  const boxBgRepeatMobile = typeof (cfg as any).mobileBackgroundRepeat === "string" && (cfg as any).mobileBackgroundRepeat.trim() !== "" ? (cfg as any).mobileBackgroundRepeat : boxBgRepeatDesktop;
  const boxBgAttachmentDesktop = typeof (cfg as any).backgroundAttachment === "string" && (cfg as any).backgroundAttachment.trim() !== "" ? (cfg as any).backgroundAttachment : "scroll";
  const boxBgAttachmentTablet = typeof (cfg as any).tabletBackgroundAttachment === "string" && (cfg as any).tabletBackgroundAttachment.trim() !== "" ? (cfg as any).tabletBackgroundAttachment : boxBgAttachmentDesktop;
  const boxBgAttachmentMobile = typeof (cfg as any).mobileBackgroundAttachment === "string" && (cfg as any).mobileBackgroundAttachment.trim() !== "" ? (cfg as any).mobileBackgroundAttachment : boxBgAttachmentDesktop;
  const boxOverlayColorDesktop = typeof (cfg as any).backgroundOverlayColor === "string" ? (cfg as any).backgroundOverlayColor : "transparent";
  const boxOverlayColorTablet = typeof (cfg as any).tabletBackgroundOverlayColor === "string" && (cfg as any).tabletBackgroundOverlayColor.trim() !== "" ? (cfg as any).tabletBackgroundOverlayColor : boxOverlayColorDesktop;
  const boxOverlayColorMobile = typeof (cfg as any).mobileBackgroundOverlayColor === "string" && (cfg as any).mobileBackgroundOverlayColor.trim() !== "" ? (cfg as any).mobileBackgroundOverlayColor : boxOverlayColorDesktop;
  const boxOverlayOpacityDesktop = Math.min(100, Math.max(0, Number((cfg as any).backgroundOverlayOpacity ?? 45) || 0));
  const boxOverlayOpacityTablet = Math.min(100, Math.max(0, Number((cfg as any).tabletBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const boxOverlayOpacityMobile = Math.min(100, Math.max(0, Number((cfg as any).mobileBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const activeUseBox = device === "mobile" ? useBoxMobile : (device === "tablet" ? useBoxTablet : useBoxDesktop);
  const activeBoxColor = device === "mobile" ? boxColorMobile : (device === "tablet" ? boxColorTablet : boxColorDesktop);
  const activeBoxBgImage = device === "mobile" ? boxBgImageMobile : (device === "tablet" ? boxBgImageTablet : boxBgImageDesktop);
  const activeBoxBgSize = device === "mobile" ? boxBgSizeMobile : (device === "tablet" ? boxBgSizeTablet : boxBgSizeDesktop);
  const activeBoxBgPosition = device === "mobile" ? boxBgPositionMobile : (device === "tablet" ? boxBgPositionTablet : boxBgPositionDesktop);
  const activeBoxBgRepeat = device === "mobile" ? boxBgRepeatMobile : (device === "tablet" ? boxBgRepeatTablet : boxBgRepeatDesktop);
  const activeBoxBgAttachment = device === "mobile" ? boxBgAttachmentMobile : (device === "tablet" ? boxBgAttachmentTablet : boxBgAttachmentDesktop);
  const activeBoxOverlayColor = device === "mobile" ? boxOverlayColorMobile : (device === "tablet" ? boxOverlayColorTablet : boxOverlayColorDesktop);
  const activeBoxOverlayOpacity = device === "mobile" ? boxOverlayOpacityMobile : (device === "tablet" ? boxOverlayOpacityTablet : boxOverlayOpacityDesktop);
  const hasActiveBoxOverlay = activeBoxOverlayOpacity > 0 && typeof activeBoxOverlayColor === "string" && activeBoxOverlayColor.trim() !== "" && activeBoxOverlayColor !== "transparent";
  const activeBoxOverlayFill = hasActiveBoxOverlay ? `color-mix(in srgb, ${activeBoxOverlayColor} ${activeBoxOverlayOpacity}%, transparent)` : "transparent";
  const activeBoxBackgroundImage = activeUseBox && activeBoxBgImage
    ? (hasActiveBoxOverlay
      ? `linear-gradient(${activeBoxOverlayFill}, ${activeBoxOverlayFill}), url("${activeBoxBgImage}")`
      : `url("${activeBoxBgImage}")`)
    : "none";
  const globalRadius = "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))";
  const categoryLabelRadiusDesktop = resolveRadiusValue(cfg.categoryLabelBorderRadius ?? cfg.categoryBorderRadius, globalRadius);
  const categoryLabelRadiusTablet = resolveRadiusValue(cfg.tabletCategoryLabelBorderRadius ?? cfg.tabletCategoryBorderRadius ?? cfg.categoryLabelBorderRadius ?? cfg.categoryBorderRadius, categoryLabelRadiusDesktop);
  const categoryLabelRadiusMobile = resolveRadiusValue(cfg.mobileCategoryLabelBorderRadius ?? cfg.mobileCategoryBorderRadius ?? cfg.categoryLabelBorderRadius ?? cfg.categoryBorderRadius, categoryLabelRadiusDesktop);
  const categoryLabelRadius = device === "mobile"
    ? categoryLabelRadiusMobile
    : (device === "tablet" ? categoryLabelRadiusTablet : categoryLabelRadiusDesktop);
  const currentCategoryLabelFs = device === "mobile" ? categoryLabelFsMobile : (device === "tablet" ? categoryLabelFsTablet : categoryLabelFsDesktop);
  const currentCategoryLabelLineHeight = device === "mobile" ? categoryLabelLineHeightMobile : (device === "tablet" ? categoryLabelLineHeightTablet : categoryLabelLineHeightDesktop);
  const currentCategoryLabelPaddingX = device === "mobile" ? categoryLabelPaddingXMobile : (device === "tablet" ? categoryLabelPaddingXTablet : categoryLabelPaddingXDesktop);
  const currentCategoryLabelPaddingY = device === "mobile" ? categoryLabelPaddingYMobile : (device === "tablet" ? categoryLabelPaddingYTablet : categoryLabelPaddingYDesktop);
  const currentCategoryLabelHasBg = categoryLabelBgColor !== "transparent" && categoryLabelBgColor !== "none";
  const boxRadiusDesktop = resolveRadiusValue(cfg.boxBorderRadius, globalRadius);
  const boxRadiusTablet = resolveRadiusValue(cfg.tabletBoxBorderRadius ?? cfg.boxBorderRadius, boxRadiusDesktop);
  const boxRadiusMobile = resolveRadiusValue(cfg.mobileBoxBorderRadius ?? cfg.boxBorderRadius, boxRadiusDesktop);
  const boxPtMobile = cfg.mobileBoxPaddingTop !== undefined ? toPx(cfg.mobileBoxPaddingTop, "0px") : (cfg.boxPaddingTop !== undefined ? toPx(cfg.boxPaddingTop, "0px") : "0px");
  const boxPrMobile = cfg.mobileBoxPaddingRight !== undefined ? toPx(cfg.mobileBoxPaddingRight, "0px") : (cfg.boxPaddingRight !== undefined ? toPx(cfg.boxPaddingRight, "0px") : "0px");
  const boxPbMobile = cfg.mobileBoxPaddingBottom !== undefined ? toPx(cfg.mobileBoxPaddingBottom, "0px") : (cfg.boxPaddingBottom !== undefined ? toPx(cfg.boxPaddingBottom, "0px") : "0px");
  const boxPlMobile = cfg.mobileBoxPaddingLeft !== undefined ? toPx(cfg.mobileBoxPaddingLeft, "0px") : (cfg.boxPaddingLeft !== undefined ? toPx(cfg.boxPaddingLeft, "0px") : "0px");
  const boxPtTablet = cfg.tabletBoxPaddingTop !== undefined ? toPx(cfg.tabletBoxPaddingTop, "0px") : (cfg.boxPaddingTop !== undefined ? toPx(cfg.boxPaddingTop, "0px") : boxPtMobile);
  const boxPrTablet = cfg.tabletBoxPaddingRight !== undefined ? toPx(cfg.tabletBoxPaddingRight, "0px") : (cfg.boxPaddingRight !== undefined ? toPx(cfg.boxPaddingRight, "0px") : boxPrMobile);
  const boxPbTablet = cfg.tabletBoxPaddingBottom !== undefined ? toPx(cfg.tabletBoxPaddingBottom, "0px") : (cfg.boxPaddingBottom !== undefined ? toPx(cfg.boxPaddingBottom, "0px") : boxPbMobile);
  const boxPlTablet = cfg.tabletBoxPaddingLeft !== undefined ? toPx(cfg.tabletBoxPaddingLeft, "0px") : (cfg.boxPaddingLeft !== undefined ? toPx(cfg.boxPaddingLeft, "0px") : boxPlMobile);
  const boxPtDesktop = cfg.boxPaddingTop !== undefined ? toPx(cfg.boxPaddingTop, "0px") : boxPtTablet;
  const boxPrDesktop = cfg.boxPaddingRight !== undefined ? toPx(cfg.boxPaddingRight, "0px") : boxPrTablet;
  const boxPbDesktop = cfg.boxPaddingBottom !== undefined ? toPx(cfg.boxPaddingBottom, "0px") : boxPbTablet;
  const boxPlDesktop = cfg.boxPaddingLeft !== undefined ? toPx(cfg.boxPaddingLeft, "0px") : boxPlTablet;
  const activeBoxPt = device === "mobile" ? boxPtMobile : (device === "tablet" ? boxPtTablet : boxPtDesktop);
  const activeBoxPr = device === "mobile" ? boxPrMobile : (device === "tablet" ? boxPrTablet : boxPrDesktop);
  const activeBoxPb = device === "mobile" ? boxPbMobile : (device === "tablet" ? boxPbTablet : boxPbDesktop);
  const activeBoxPl = device === "mobile" ? boxPlMobile : (device === "tablet" ? boxPlTablet : boxPlDesktop);
  const activeBoxRadius = device === "mobile" ? boxRadiusMobile : (device === "tablet" ? boxRadiusTablet : boxRadiusDesktop);
  const cardRadiusDesktop = resolveRadiusValue(cfg.gridBoxBorderRadius, globalRadius, { legacyDefaultNumbers: [0] });
  const cardRadiusTablet = resolveRadiusValue(cfg.tabletGridBoxBorderRadius ?? cfg.gridBoxBorderRadius, cardRadiusDesktop, { legacyDefaultNumbers: [0] });
  const cardRadiusMobile = resolveRadiusValue(cfg.mobileGridBoxBorderRadius ?? cfg.gridBoxBorderRadius, cardRadiusDesktop, { legacyDefaultNumbers: [0] });
  const cardRadius = device === "mobile" ? cardRadiusMobile : (device === "tablet" ? cardRadiusTablet : cardRadiusDesktop);
  const cardBg = normalizeLegacyNeutralSurface(cfg.gridBoxColor, "var(--bg-elevated, #ffffff)");
  const contentPaddingMobile = toPx(cfg.mobileContentPadding ?? cfg.contentPadding, "12px");
  const contentPaddingTablet = toPx(cfg.tabletContentPadding ?? cfg.contentPadding, contentPaddingMobile);
  const contentPaddingDesktop = toPx(cfg.contentPadding, contentPaddingTablet);
  const contentPadding = device === "mobile" ? contentPaddingMobile : (device === "tablet" ? contentPaddingTablet : contentPaddingDesktop);
  const pTopMobile = cfg.mobilePaddingTop !== undefined ? `${toNumber(cfg.mobilePaddingTop, 0)}px` : "0px";
  const pRightMobile = cfg.mobilePaddingRight !== undefined ? `${toNumber(cfg.mobilePaddingRight, 0)}px` : "0px";
  const pBottomMobile = cfg.mobilePaddingBottom !== undefined ? `${toNumber(cfg.mobilePaddingBottom, 0)}px` : "0px";
  const pLeftMobile = cfg.mobilePaddingLeft !== undefined ? `${toNumber(cfg.mobilePaddingLeft, 0)}px` : "0px";
  const pTopTablet = cfg.tabletPaddingTop !== undefined ? `${toNumber(cfg.tabletPaddingTop, 0)}px` : pTopMobile;
  const pRightTablet = cfg.tabletPaddingRight !== undefined ? `${toNumber(cfg.tabletPaddingRight, 0)}px` : pRightMobile;
  const pBottomTablet = cfg.tabletPaddingBottom !== undefined ? `${toNumber(cfg.tabletPaddingBottom, 0)}px` : pBottomMobile;
  const pLeftTablet = cfg.tabletPaddingLeft !== undefined ? `${toNumber(cfg.tabletPaddingLeft, 0)}px` : pLeftMobile;
  const pTopDesktop = cfg.paddingTop !== undefined ? `${toNumber(cfg.paddingTop, 0)}px` : pTopTablet;
  const pRightDesktop = cfg.paddingRight !== undefined ? `${toNumber(cfg.paddingRight, 0)}px` : pRightTablet;
  const pBottomDesktop = cfg.paddingBottom !== undefined ? `${toNumber(cfg.paddingBottom, 0)}px` : pBottomTablet;
  const pLeftDesktop = cfg.paddingLeft !== undefined ? `${toNumber(cfg.paddingLeft, 0)}px` : pLeftTablet;
  const mTopMobile = cfg.mobileMarginTop !== undefined ? `${toNumber(cfg.mobileMarginTop, 0)}px` : "0px";
  const mRightMobile = cfg.mobileMarginRight !== undefined ? `${toNumber(cfg.mobileMarginRight, 0)}px` : "0px";
  const mBottomMobile = cfg.mobileMarginBottom !== undefined ? `${toNumber(cfg.mobileMarginBottom, 0)}px` : "0px";
  const mLeftMobile = cfg.mobileMarginLeft !== undefined ? `${toNumber(cfg.mobileMarginLeft, 0)}px` : "0px";
  const mTopTablet = cfg.tabletMarginTop !== undefined ? `${toNumber(cfg.tabletMarginTop, 0)}px` : mTopMobile;
  const mRightTablet = cfg.tabletMarginRight !== undefined ? `${toNumber(cfg.tabletMarginRight, 0)}px` : mRightMobile;
  const mBottomTablet = cfg.tabletMarginBottom !== undefined ? `${toNumber(cfg.tabletMarginBottom, 0)}px` : mBottomMobile;
  const mLeftTablet = cfg.tabletMarginLeft !== undefined ? `${toNumber(cfg.tabletMarginLeft, 0)}px` : mLeftMobile;
  const mTopDesktop = cfg.marginTop !== undefined ? `${toNumber(cfg.marginTop, 0)}px` : mTopTablet;
  const mRightDesktop = cfg.marginRight !== undefined ? `${toNumber(cfg.marginRight, 0)}px` : mRightTablet;
  const mBottomDesktop = cfg.marginBottom !== undefined ? `${toNumber(cfg.marginBottom, 0)}px` : mBottomTablet;
  const mLeftDesktop = cfg.marginLeft !== undefined ? `${toNumber(cfg.marginLeft, 0)}px` : mLeftTablet;
  const blockTitleColorMobile = (cfg.mobileBlockTitleColor as string) || (cfg.blockTitleColor as string) || "var(--home-widget-title-color, var(--heading-color, #1e293b))";
  const blockTitleColorTablet = (cfg.tabletBlockTitleColor as string) || blockTitleColorMobile;
  const blockTitleColorDesktop = (cfg.blockTitleColor as string) || blockTitleColorTablet;
  const blockTitleBorderMobile = (cfg.mobileBlockTitleBorderColor as string) || (cfg.blockTitleBorderColor as string) || "var(--accent)";
  const blockTitleBorderTablet = (cfg.tabletBlockTitleBorderColor as string) || blockTitleBorderMobile;
  const blockTitleBorderDesktop = (cfg.blockTitleBorderColor as string) || blockTitleBorderTablet;
  const blockTitleFsMobile = toPx(cfg.mobileBlockTitleFontSize ?? cfg.blockTitleFontSize, "20px");
  const blockTitleFsTablet = toPx(cfg.tabletBlockTitleFontSize ?? cfg.blockTitleFontSize, "22px");
  const blockTitleFsDesktop = toPx(cfg.blockTitleFontSize, "24px");
  const blockTitleLhMobile = `${toNumber((cfg as any).mobileBlockTitleLineHeight ?? cfg.blockTitleLineHeight, 1.2)}`;
  const blockTitleLhTablet = `${toNumber((cfg as any).tabletBlockTitleLineHeight ?? cfg.blockTitleLineHeight, 1.2)}`;
  const blockTitleLhDesktop = `${toNumber(cfg.blockTitleLineHeight, 1.2)}`;
  const currentBlockTitleColor = device === "mobile" ? blockTitleColorMobile : (device === "tablet" ? blockTitleColorTablet : blockTitleColorDesktop);
  const currentBlockTitleBorder = device === "mobile" ? blockTitleBorderMobile : (device === "tablet" ? blockTitleBorderTablet : blockTitleBorderDesktop);
  const currentBlockTitleFs = device === "mobile" ? blockTitleFsMobile : (device === "tablet" ? blockTitleFsTablet : blockTitleFsDesktop);
  const currentBlockTitleLh = device === "mobile" ? blockTitleLhMobile : (device === "tablet" ? blockTitleLhTablet : blockTitleLhDesktop);
  const dotColorMobile = (cfg.mobileDotColor as string) || (cfg.dotColor as string) || "var(--accent)";
  const dotColorTablet = (cfg.tabletDotColor as string) || dotColorMobile;
  const dotColorDesktop = (cfg.dotColor as string) || dotColorTablet;
  const dotInactiveColorMobile = (cfg.mobileDotInactiveColor as string) || (cfg.dotInactiveColor as string) || "color-mix(in srgb, var(--accent) 30%, transparent)";
  const dotInactiveColorTablet = (cfg.tabletDotInactiveColor as string) || dotInactiveColorMobile;
  const dotInactiveColorDesktop = (cfg.dotInactiveColor as string) || dotInactiveColorTablet;
  const activeDotColor = device === "mobile" ? dotColorMobile : (device === "tablet" ? dotColorTablet : dotColorDesktop);
  const inactiveDotColor = device === "mobile" ? dotInactiveColorMobile : (device === "tablet" ? dotInactiveColorTablet : dotInactiveColorDesktop);
  const activeDotRingColor = `color-mix(in srgb, ${activeDotColor} 35%, transparent)`;
  const slideUnit = `calc((100% - (${gap} * ${Math.max(perView - 1, 0)})) / ${perView} + ${gap})`;
  const titleSectionGap = device === "mobile" ? "12px" : (device === "tablet" ? "14px" : "16px");
  const dotsSectionGap = device === "mobile" ? "12px" : "14px";
  const currentInnerPaddingTop = device === "mobile" ? pTopMobile : (device === "tablet" ? pTopTablet : pTopDesktop);
  const currentInnerPaddingRight = device === "mobile" ? pRightMobile : (device === "tablet" ? pRightTablet : pRightDesktop);
  const currentInnerPaddingBottom = device === "mobile" ? pBottomMobile : (device === "tablet" ? pBottomTablet : pBottomDesktop);
  const currentInnerPaddingLeft = device === "mobile" ? pLeftMobile : (device === "tablet" ? pLeftTablet : pLeftDesktop);
  const effectiveContentBg = isPublicDarkMode ? "#ffffff" : "transparent";
  const effectiveTitleColor = isPublicDarkMode ? "#0f172a" : titleColor;
  const effectiveTitleHover = isPublicDarkMode ? "var(--home-hover-color, var(--accent))" : titleHover;
  const effectiveMetaColor = isPublicDarkMode ? "#64748b" : metaColor;
  const effectiveExcerptColor = isPublicDarkMode ? "#334155" : excerptColor;
  const effectiveBlockTitleColorMobile = isPublicDarkMode ? "#ffffff" : blockTitleColorMobile;
  const effectiveBlockTitleColorTablet = isPublicDarkMode ? "#ffffff" : blockTitleColorTablet;
  const effectiveBlockTitleColorDesktop = isPublicDarkMode ? "#ffffff" : blockTitleColorDesktop;
  const effectiveBlockTitleBorderMobile = isPublicDarkMode ? "#ffffff" : blockTitleBorderMobile;
  const effectiveBlockTitleBorderTablet = isPublicDarkMode ? "#ffffff" : blockTitleBorderTablet;
  const effectiveBlockTitleBorderDesktop = isPublicDarkMode ? "#ffffff" : blockTitleBorderDesktop;
  const contentThemeVars = {
    "--home-news-title-color": effectiveTitleColor,
    "--home-meta-color": effectiveMetaColor,
    "--home-excerpt-color": effectiveExcerptColor,
  } as React.CSSProperties;

  const getAuthorName = (post: NewsGridSliderPost) => {
    if (typeof post.author === "string" && post.author.trim() !== "") return post.author;
    if (post.author && typeof post.author === "object") {
      if (typeof post.author.name === "string" && post.author.name.trim() !== "") return post.author.name;
      if (typeof post.author.fullName === "string" && post.author.fullName.trim() !== "") return post.author.fullName;
    }
    if (typeof post.authorName === "string" && post.authorName.trim() !== "") return post.authorName;
    return "";
  };

  if (data.length === 0) {
    return (
      <div id={`news-grid-slider-${block.id}`} className="p-4 rounded-lg border border-[var(--border)] text-sm [color:var(--muted-text,var(--home-meta-color,#9ca3af))]">
        Belum ada berita untuk ditampilkan.
      </div>
    );
  }

  return (
    <div
      id={`news-grid-slider-${block.id}`}
      className="responsive-block-frame"
      style={{
        "--rb-mt-mobile": mTopMobile,
        "--rb-mr-mobile": mRightMobile,
        "--rb-mb-mobile": mBottomMobile,
        "--rb-ml-mobile": mLeftMobile,
        "--rb-pt-mobile": "0px",
        "--rb-pr-mobile": "0px",
        "--rb-pb-mobile": "0px",
        "--rb-pl-mobile": "0px",
        "--rb-mt-tablet": mTopTablet,
        "--rb-mr-tablet": mRightTablet,
        "--rb-mb-tablet": mBottomTablet,
        "--rb-ml-tablet": mLeftTablet,
        "--rb-pt-tablet": "0px",
        "--rb-pr-tablet": "0px",
        "--rb-pb-tablet": "0px",
        "--rb-pl-tablet": "0px",
        "--rb-mt-desktop": mTopDesktop,
        "--rb-mr-desktop": mRightDesktop,
        "--rb-mb-desktop": mBottomDesktop,
        "--rb-ml-desktop": mLeftDesktop,
        "--rb-pt-desktop": "0px",
        "--rb-pr-desktop": "0px",
        "--rb-pb-desktop": "0px",
        "--rb-pl-desktop": "0px",
        "--widget-title-size-mobile": blockTitleFsMobile,
        "--widget-title-size-tablet": blockTitleFsTablet,
        "--widget-title-size-desktop": blockTitleFsDesktop,
        "--widget-title-color-mobile": effectiveBlockTitleColorMobile,
        "--widget-title-color-tablet": effectiveBlockTitleColorTablet,
        "--widget-title-color-desktop": effectiveBlockTitleColorDesktop,
        "--widget-title-border-color-mobile": effectiveBlockTitleBorderMobile,
        "--widget-title-border-color-tablet": effectiveBlockTitleBorderTablet,
        "--widget-title-border-color-desktop": effectiveBlockTitleBorderDesktop
      } as React.CSSProperties}
    >
      <div
        style={{
          backgroundColor: activeUseBox ? activeBoxColor : "transparent",
          borderRadius: activeUseBox ? activeBoxRadius : "0",
          border: activeUseBox ? "var(--box-border, 1px solid var(--border))" : "none",
          boxShadow: activeUseBox ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none",
          backgroundImage: activeBoxBackgroundImage,
          backgroundSize: activeUseBox && activeBoxBgImage ? (hasActiveBoxOverlay ? `cover, ${activeBoxBgSize}` : activeBoxBgSize) : undefined,
          backgroundPosition: activeUseBox && activeBoxBgImage ? (hasActiveBoxOverlay ? `center, ${activeBoxBgPosition}` : activeBoxBgPosition) : undefined,
          backgroundRepeat: activeUseBox && activeBoxBgImage ? (hasActiveBoxOverlay ? `no-repeat, ${activeBoxBgRepeat}` : activeBoxBgRepeat) : undefined,
          backgroundAttachment: activeUseBox && activeBoxBgImage ? (hasActiveBoxOverlay ? `scroll, ${activeBoxBgAttachment}` : activeBoxBgAttachment) : undefined,
          paddingTop: activeUseBox ? activeBoxPt : "0px",
          paddingRight: activeUseBox ? activeBoxPr : "0px",
          paddingBottom: activeUseBox ? activeBoxPb : "0px",
          paddingLeft: activeUseBox ? activeBoxPl : "0px",
        }}
      >
      <div
        className="news-grid-slider-inner"
        style={{
          paddingTop: currentInnerPaddingTop,
          paddingRight: currentInnerPaddingRight,
          paddingBottom: currentInnerPaddingBottom,
          paddingLeft: currentInnerPaddingLeft,
        }}
      >
        {showWidgetTitle && (
          <h3 className="font-bold border-b border-[color:var(--border,#e5e7eb)] pb-3 flex items-center theme-widget-title" style={{ marginBottom: titleSectionGap }}>
            <div className="widget-title-bar" style={{ borderRadius: "var(--home-main-box-radius, 0.25rem)", backgroundColor: currentBlockTitleBorder }}></div>
            <span style={{ color: currentBlockTitleColor, fontSize: currentBlockTitleFs, lineHeight: currentBlockTitleLh }}>{title}</span>
          </h3>
        )}

        <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {showArrows && data.length > perView && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 md:left-3 -translate-y-1/2 z-10 w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white flex items-center justify-center border border-[var(--accent)]/35 hover:border-[var(--accent)] shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{ top: `calc(${imageH} / 2)` }}
                aria-label="Sebelumnya"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="block w-4 h-4 md:w-5 md:h-5" fill="none">
                  <path d="M14.5 5.5L8.5 12L14.5 18.5" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 md:right-3 -translate-y-1/2 z-10 w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white flex items-center justify-center border border-[var(--accent)]/35 hover:border-[var(--accent)] shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                style={{ top: `calc(${imageH} / 2)` }}
                aria-label="Berikutnya"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="block w-4 h-4 md:w-5 md:h-5" fill="none">
                  <path d="M9.5 5.5L15.5 12L9.5 18.5" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          <div className="overflow-hidden">
            <div
              className="flex"
              style={{ gap, transform: `translateX(calc(-1 * ${trackIndex} * ${slideUnit}))`, transition: useTransition ? `transform ${transitionMs}ms ease` : "none" }}
              onTransitionEnd={() => {
                if (!canLoop) return;
                if (trackIndex >= cloneCount + data.length) jumpWithoutTransition(trackIndex - data.length);
                if (trackIndex < cloneCount) jumpWithoutTransition(trackIndex + data.length);
              }}
            >
              {slideData.map((post, idx) => {
              const postLink = post.category ? `/${post.category.slug}/${post.slug}` : `/post/${post.slug}`;
              const imageUrl = post.image || post.featuredImage?.fileUrl;
              const isVideo = String((post as any)?.type || "").toUpperCase() === "VIDEO";
              const dateVal = post.publishedAt || post.createdAt;
              const dateObj = dateVal ? (dateVal instanceof Date ? dateVal : new Date(dateVal)) : null;
              const dateIso = dateObj && !Number.isNaN(dateObj.getTime()) ? dateObj.toISOString() : "";
              const authorName = getAuthorName(post);
              return (
                <article key={`${post.id || `${block.id}-${idx}`}-${idx}`} className="news-grid-slider-item border border-[var(--border)] overflow-hidden shrink-0" style={{ width: `calc((100% - (${gap} * ${Math.max(perView - 1, 0)})) / ${perView})`, borderRadius: cardRadius, backgroundColor: cardBg }}>
                  <Link href={postLink} className="block">
                    <div className="news-grid-slider-thumb relative bg-[color:var(--bg-surface,#f9fafb)]" style={{ height: imageH }}>
                      {imageUrl ? (
                        <Image src={imageUrl} alt={post.title} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="(max-width: 1024px) 50vw, 33vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center [color:var(--muted-text,var(--home-meta-color,#9ca3af))] text-xs">No Image</div>
                      )}
                      {isVideo && (
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6 translate-x-[0.5px]">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        </span>
                      )}
                      {showCategory && post.category && (
                        <span
                          className="absolute top-2 left-2 font-bold uppercase tracking-wide"
                          style={{
                            color: categoryLabelColor,
                            backgroundColor: categoryLabelBgColor,
                            borderRadius: currentCategoryLabelHasBg ? categoryLabelRadius : "0",
                            fontSize: currentCategoryLabelFs,
                            lineHeight: currentCategoryLabelLineHeight,
                            padding: currentCategoryLabelHasBg ? `${currentCategoryLabelPaddingY} ${currentCategoryLabelPaddingX}` : "0",
                          }}
                        >
                          {post.category.name}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div
                    className="news-grid-slider-content"
                    style={{ padding: contentPadding, backgroundColor: effectiveContentBg, ...contentThemeVars }}
                  >
                    <h4
                      className="news-grid-slider-title-wrap"
                      style={{
                        lineHeight: titleLh,
                        fontSize: titleFs,
                        fontWeight: titleFw,
                        marginBottom: titleMb,
                        fontFamily: "var(--home-news-title-font, var(--font-heading, sans-serif))",
                        fontSynthesis: "var(--home-news-title-synthesis, var(--font-heading-synthesis, none))",
                      }}
                    >
                      <Link
                        href={postLink}
                        className="news-grid-slider-title transition-colors duration-300"
                        style={{
                          ["--news-grid-slider-title-color" as string]: effectiveTitleColor,
                          ["--news-grid-slider-title-size" as string]: titleFs,
                          ["--news-grid-slider-title-weight" as string]: titleFw,
                          ["--news-grid-slider-title-font" as string]: "var(--home-news-title-font, var(--font-heading, sans-serif))",
                          ["--news-grid-slider-title-hover" as string]: effectiveTitleHover,
                          color: effectiveTitleColor,
                          fontSynthesis: "inherit",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = effectiveTitleHover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = effectiveTitleColor; }}
                      >
                        {post.title}
                      </Link>
                    </h4>
                    {showMetaInfo && (showAuthor || showDate) && (
                      <div className="news-grid-slider-meta flex items-center gap-2" style={{ color: effectiveMetaColor, fontSize: metaFs, lineHeight: metaLh, fontWeight: metaFw, marginBottom: metaMb }}>
                        {showAuthor && authorName && (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="rounded-full flex items-center justify-center relative overflow-hidden shrink-0"
                              style={{ width: "1.5em", height: "1.5em", fontSize: "0.92em", backgroundColor: "color-mix(in oklab, var(--fg-primary) 10%, transparent)" }}
                            >
                              {post.authorAvatar ? (
                                <Image src={post.authorAvatar} alt={authorName} fill className="object-cover" sizes="16px" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="opacity-80" style={{ width: "1em", height: "1em" }}>
                                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                            <span>{authorName}</span>
                          </div>
                        )}
                        {showAuthor && authorName && showDate && dateVal && <span className="rounded-full shrink-0" style={{ width: "0.42em", height: "0.42em", backgroundColor: "currentColor", opacity: 0.5 }} />}
                        {showDate && dateVal && (
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 shrink-0" style={{ width: "1.22em", height: "1.22em" }}>
                              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                            </svg>
                            <time dateTime={dateIso}>
                              {formatLongDateId(dateObj)}
                            </time>
                          </div>
                        )}
                      </div>
                    )}
                    {showExcerpt && (
                      <p className="news-grid-slider-excerpt" style={{ color: effectiveExcerptColor, fontSize: excerptFs, lineHeight: excerptLh, fontWeight: excerptFw }}>
                        {clampExcerpt(getExcerptSource(post, excerptLength), excerptLength)}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
            </div>
          </div>
        </div>

        {showDots && pageCount > 1 && (
          <div className="flex items-center justify-center gap-2" style={{ marginTop: dotsSectionGap }}>
            {Array.from({ length: pageCount }).map((_, idx) => (
              <button
                key={`${block.id}-dot-${idx}`}
                type="button"
                onClick={() => setTrackIndex(canLoop ? cloneCount + (idx * perView) : Math.min(idx * perView, maxStart))}
                className="h-2.5 rounded-full transition-all duration-300"
                style={idx === currentPage
                  ? {
                      width: "1.5rem",
                      backgroundColor: activeDotColor,
                      opacity: 1,
                      boxShadow: `0 0 0 2px ${activeDotRingColor}`,
                    }
                  : {
                      width: "0.625rem",
                      backgroundColor: inactiveDotColor,
                      opacity: 1,
                    }}
                aria-label={`Pindah ke halaman ${idx + 1}`}
                onMouseEnter={(e) => {
                  if (idx !== currentPage) {
                    e.currentTarget.style.backgroundColor = activeDotColor;
                    e.currentTarget.style.opacity = "0.65";
                  }
                }}
                onMouseLeave={(e) => {
                  if (idx !== currentPage) {
                    e.currentTarget.style.backgroundColor = inactiveDotColor;
                    e.currentTarget.style.opacity = "1";
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
