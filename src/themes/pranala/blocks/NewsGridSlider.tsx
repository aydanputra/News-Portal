"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBool, type ResponsiveDevice } from "./responsive";

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
  metaColor?: string;
  tabletMetaColor?: string;
  mobileMetaColor?: string;
  excerptColor?: string;
  tabletExcerptColor?: string;
  mobileExcerptColor?: string;
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
  const titleFwMobile = toFontWeight(cfg.mobileTitleFontWeight ?? cfg.titleFontWeight, "700");
  const titleFwTablet = toFontWeight(cfg.tabletTitleFontWeight ?? cfg.titleFontWeight, titleFwMobile);
  const titleFwDesktop = toFontWeight(cfg.titleFontWeight, titleFwTablet);
  const titleFs = device === "mobile" ? titleFsMobile : (device === "tablet" ? titleFsTablet : titleFsDesktop);
  const titleLh = device === "mobile" ? titleLhMobile : (device === "tablet" ? titleLhTablet : titleLhDesktop);
  const titleFw = device === "mobile" ? titleFwMobile : (device === "tablet" ? titleFwTablet : titleFwDesktop);

  const metaColorMobile = (cfg.mobileMetaColor as string) || (cfg.metaColor as string) || "var(--home-meta-color, #9ca3af)";
  const metaColorTablet = (cfg.tabletMetaColor as string) || metaColorMobile;
  const metaColorDesktop = (cfg.metaColor as string) || metaColorTablet;
  const metaColor = device === "mobile" ? metaColorMobile : (device === "tablet" ? metaColorTablet : metaColorDesktop);
  const metaFsMobile = toPx(cfg.mobileMetaFontSize ?? cfg.metaFontSize, "12px");
  const metaFsTablet = toPx(cfg.tabletMetaFontSize ?? cfg.metaFontSize, metaFsMobile);
  const metaFsDesktop = toPx(cfg.metaFontSize, metaFsTablet);
  const metaFs = device === "mobile" ? metaFsMobile : (device === "tablet" ? metaFsTablet : metaFsDesktop);

  const excerptColorMobile = (cfg.mobileExcerptColor as string) || (cfg.excerptColor as string) || "var(--home-excerpt-color, #4b5563)";
  const excerptColorTablet = (cfg.tabletExcerptColor as string) || excerptColorMobile;
  const excerptColorDesktop = (cfg.excerptColor as string) || excerptColorTablet;
  const excerptColor = device === "mobile" ? excerptColorMobile : (device === "tablet" ? excerptColorTablet : excerptColorDesktop);
  const excerptFsMobile = toPx(cfg.mobileExcerptFontSize ?? cfg.excerptFontSize, "14px");
  const excerptFsTablet = toPx(cfg.tabletExcerptFontSize ?? cfg.excerptFontSize, excerptFsMobile);
  const excerptFsDesktop = toPx(cfg.excerptFontSize, excerptFsTablet);
  const excerptLhMobile = `${toNumber(cfg.mobileExcerptLineHeight ?? cfg.excerptLineHeight, 1.5)}`;
  const excerptLhTablet = `${toNumber(cfg.tabletExcerptLineHeight ?? cfg.excerptLineHeight, 1.5)}`;
  const excerptLhDesktop = `${toNumber(cfg.excerptLineHeight, 1.5)}`;
  const excerptFs = device === "mobile" ? excerptFsMobile : (device === "tablet" ? excerptFsTablet : excerptFsDesktop);
  const excerptLh = device === "mobile" ? excerptLhMobile : (device === "tablet" ? excerptLhTablet : excerptLhDesktop);

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
  const showMetaInfoDesktop = getResponsiveBool(configRecord, "showMetaInfo", "desktop", true);
  const showMetaInfoTablet = getResponsiveBool(configRecord, "showMetaInfo", "tablet", true);
  const showMetaInfoMobile = getResponsiveBool(configRecord, "showMetaInfo", "mobile", true);
  const showExcerptDesktop = getResponsiveBool(configRecord, "showExcerpt", "desktop", true);
  const showExcerptTablet = getResponsiveBool(configRecord, "showExcerpt", "tablet", true);
  const showExcerptMobile = getResponsiveBool(configRecord, "showExcerpt", "mobile", true);
  const showCategory = device === "mobile" ? showCategoryMobile : (device === "tablet" ? showCategoryTablet : showCategoryDesktop);
  const showAuthor = device === "mobile" ? showAuthorMobile : (device === "tablet" ? showAuthorTablet : showAuthorDesktop);
  const showDate = device === "mobile" ? showDateMobile : (device === "tablet" ? showDateTablet : showDateDesktop);
  const showMetaInfo = device === "mobile" ? showMetaInfoMobile : (device === "tablet" ? showMetaInfoTablet : showMetaInfoDesktop);
  const showExcerpt = device === "mobile" ? showExcerptMobile : (device === "tablet" ? showExcerptTablet : showExcerptDesktop);
  const excerptLengthDesktop = toNumber(cfg.excerptLength, 90);
  const excerptLengthTablet = toNumber(cfg.tabletExcerptLength ?? cfg.excerptLength, excerptLengthDesktop);
  const excerptLengthMobile = toNumber(cfg.mobileExcerptLength ?? cfg.excerptLength, 80);
  const excerptLength = device === "mobile"
    ? excerptLengthMobile
    : (device === "tablet" ? excerptLengthTablet : excerptLengthDesktop);
  const categoryLabelColorMobile = (cfg.mobileCategoryLabelColor as string) || (cfg.mobileCategoryTextColor as string) || (cfg.categoryLabelColor as string) || (cfg.categoryTextColor as string) || "#ffffff";
  const categoryLabelColorTablet = (cfg.tabletCategoryLabelColor as string) || (cfg.tabletCategoryTextColor as string) || categoryLabelColorMobile;
  const categoryLabelColorDesktop = (cfg.categoryLabelColor as string) || (cfg.categoryTextColor as string) || categoryLabelColorTablet;
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

  const useBoxDesktop = cfg.useBox === true || cfg.useBox === "true";
  const useBoxTablet = (cfg.tabletUseBox !== undefined ? (cfg.tabletUseBox === true || cfg.tabletUseBox === "true") : useBoxDesktop);
  const useBoxMobile = (cfg.mobileUseBox !== undefined ? (cfg.mobileUseBox === true || cfg.mobileUseBox === "true") : useBoxDesktop);
  const boxColorDesktop = (cfg.boxColor as string) || "var(--bg-elevated, #ffffff)";
  const boxColorTablet = (cfg.tabletBoxColor as string) || boxColorDesktop;
  const boxColorMobile = (cfg.mobileBoxColor as string) || boxColorDesktop;
  const boxBgImageDesktop = typeof cfg.backgroundImage === "string" ? cfg.backgroundImage.trim() : "";
  const boxBgImageTablet = typeof cfg.tabletBackgroundImage === "string" && cfg.tabletBackgroundImage.trim() !== "" ? cfg.tabletBackgroundImage.trim() : boxBgImageDesktop;
  const boxBgImageMobile = typeof cfg.mobileBackgroundImage === "string" && cfg.mobileBackgroundImage.trim() !== "" ? cfg.mobileBackgroundImage.trim() : boxBgImageDesktop;
  const activeUseBox = device === "mobile" ? useBoxMobile : (device === "tablet" ? useBoxTablet : useBoxDesktop);
  const activeBoxColor = device === "mobile" ? boxColorMobile : (device === "tablet" ? boxColorTablet : boxColorDesktop);
  const activeBoxBgImage = device === "mobile" ? boxBgImageMobile : (device === "tablet" ? boxBgImageTablet : boxBgImageDesktop);
  const globalRadius = "var(--home-main-box-radius, 0.75rem)";
  const categoryLabelRadiusDesktop = resolveRadiusValue(cfg.categoryLabelBorderRadius ?? cfg.categoryBorderRadius, globalRadius);
  const categoryLabelRadiusTablet = resolveRadiusValue(cfg.tabletCategoryLabelBorderRadius ?? cfg.tabletCategoryBorderRadius ?? cfg.categoryLabelBorderRadius ?? cfg.categoryBorderRadius, categoryLabelRadiusDesktop);
  const categoryLabelRadiusMobile = resolveRadiusValue(cfg.mobileCategoryLabelBorderRadius ?? cfg.mobileCategoryBorderRadius ?? cfg.categoryLabelBorderRadius ?? cfg.categoryBorderRadius, categoryLabelRadiusDesktop);
  const categoryLabelRadius = device === "mobile"
    ? categoryLabelRadiusMobile
    : (device === "tablet" ? categoryLabelRadiusTablet : categoryLabelRadiusDesktop);
  const boxRadiusDesktop = resolveRadiusValue(cfg.boxBorderRadius, globalRadius);
  const boxRadiusTablet = resolveRadiusValue(cfg.tabletBoxBorderRadius ?? cfg.boxBorderRadius, boxRadiusDesktop);
  const boxRadiusMobile = resolveRadiusValue(cfg.mobileBoxBorderRadius ?? cfg.boxBorderRadius, boxRadiusDesktop);
  const activeBoxRadius = device === "mobile" ? boxRadiusMobile : (device === "tablet" ? boxRadiusTablet : boxRadiusDesktop);
  const cardRadiusDesktop = resolveRadiusValue(cfg.gridBoxBorderRadius, globalRadius, { legacyDefaultNumbers: [0] });
  const cardRadiusTablet = resolveRadiusValue(cfg.tabletGridBoxBorderRadius ?? cfg.gridBoxBorderRadius, cardRadiusDesktop, { legacyDefaultNumbers: [0] });
  const cardRadiusMobile = resolveRadiusValue(cfg.mobileGridBoxBorderRadius ?? cfg.gridBoxBorderRadius, cardRadiusDesktop, { legacyDefaultNumbers: [0] });
  const cardRadius = device === "mobile" ? cardRadiusMobile : (device === "tablet" ? cardRadiusTablet : cardRadiusDesktop);
  const cardBg = (cfg.gridBoxColor as string) || "var(--bg-elevated, #ffffff)";
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
      <div id={`news-grid-slider-${block.id}`} className="p-4 rounded-lg border border-[var(--border)] text-sm text-[var(--fg-muted)]">
        Belum ada berita untuk ditampilkan.
      </div>
    );
  }

  return (
    <div
      id={`news-grid-slider-${block.id}`}
      style={{
        backgroundColor: activeUseBox ? activeBoxColor : "transparent",
        borderRadius: activeUseBox ? activeBoxRadius : "0",
        border: activeUseBox ? "var(--box-border, 1px solid var(--border))" : "none",
        boxShadow: activeUseBox ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none",
        backgroundImage: activeUseBox && activeBoxBgImage ? `url(${activeBoxBgImage})` : "none",
        backgroundSize: activeUseBox && activeBoxBgImage ? "cover" : undefined,
        backgroundPosition: activeUseBox && activeBoxBgImage ? "center" : undefined,
        backgroundRepeat: activeUseBox && activeBoxBgImage ? "no-repeat" : undefined,
        "--widget-title-border-color-mobile": blockTitleBorderMobile,
        "--widget-title-border-color-tablet": blockTitleBorderTablet,
        "--widget-title-border-color-desktop": blockTitleBorderDesktop
      } as React.CSSProperties}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #news-grid-slider-${block.id} { margin-top: ${mTopMobile} !important; margin-right: ${mRightMobile} !important; margin-bottom: ${mBottomMobile} !important; margin-left: ${mLeftMobile} !important; }
            #news-grid-slider-${block.id} .news-grid-slider-inner { padding-top: ${pTopMobile}; padding-right: ${pRightMobile}; padding-bottom: ${pBottomMobile}; padding-left: ${pLeftMobile}; }
            #news-grid-slider-${block.id} .theme-widget-title span { color: ${blockTitleColorMobile}; font-size: ${blockTitleFsMobile}; }
            #news-grid-slider-${block.id} .theme-widget-title .widget-title-bar { background-color: var(--widget-title-border-color-mobile); }
            @media (min-width: 768px) {
              #news-grid-slider-${block.id} { margin-top: ${mTopTablet} !important; margin-right: ${mRightTablet} !important; margin-bottom: ${mBottomTablet} !important; margin-left: ${mLeftTablet} !important; }
              #news-grid-slider-${block.id} .news-grid-slider-inner { padding-top: ${pTopTablet}; padding-right: ${pRightTablet}; padding-bottom: ${pBottomTablet}; padding-left: ${pLeftTablet}; }
              #news-grid-slider-${block.id} .theme-widget-title span { color: ${blockTitleColorTablet}; font-size: ${blockTitleFsTablet}; }
              #news-grid-slider-${block.id} .theme-widget-title .widget-title-bar { background-color: var(--widget-title-border-color-tablet); }
            }
            @media (min-width: 1025px) {
              #news-grid-slider-${block.id} { margin-top: ${mTopDesktop} !important; margin-right: ${mRightDesktop} !important; margin-bottom: ${mBottomDesktop} !important; margin-left: ${mLeftDesktop} !important; }
              #news-grid-slider-${block.id} .news-grid-slider-inner { padding-top: ${pTopDesktop}; padding-right: ${pRightDesktop}; padding-bottom: ${pBottomDesktop}; padding-left: ${pLeftDesktop}; }
              #news-grid-slider-${block.id} .theme-widget-title span { color: ${blockTitleColorDesktop}; font-size: ${blockTitleFsDesktop}; }
              #news-grid-slider-${block.id} .theme-widget-title .widget-title-bar { background-color: var(--widget-title-border-color-desktop); }
            }
          `
        }}
      />
      <div className="news-grid-slider-inner">
        {showWidgetTitle && (
          <h3 className="font-bold mb-3 border-b border-gray-100 pb-3 flex items-center theme-widget-title">
            <div className="widget-title-bar w-1 h-5 mr-3" style={{ borderRadius: "var(--home-main-box-radius, 0.25rem)" }}></div>
            <span>{title}</span>
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

          <div className="overflow-hidden px-px">
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
                <article key={`${post.id || `${block.id}-${idx}`}-${idx}`} className="border border-[var(--border)] overflow-hidden shrink-0" style={{ width: `calc((100% - (${gap} * ${Math.max(perView - 1, 0)})) / ${perView})`, borderRadius: cardRadius, backgroundColor: cardBg }}>
                  <Link href={postLink} className="block">
                    <div className="relative bg-gray-100" style={{ height: imageH }}>
                      {imageUrl ? (
                        <Image src={imageUrl} alt={post.title} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="(max-width: 1024px) 50vw, 33vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[var(--fg-muted)] text-xs">No Image</div>
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
                        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide px-2 py-1" style={{ color: categoryLabelColor, backgroundColor: categoryLabelBgColor, borderRadius: categoryLabelRadius }}>
                          {post.category.name}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div style={{ padding: contentPadding }}>
                    <h4 className="mb-1.5" style={{ lineHeight: titleLh, fontSize: titleFs, fontWeight: titleFw }}>
                      <Link href={postLink} className="transition-colors duration-300" style={{ color: titleColor }} onMouseEnter={(e) => { e.currentTarget.style.color = titleHover; }} onMouseLeave={(e) => { e.currentTarget.style.color = titleColor; }}>{post.title}</Link>
                    </h4>
                    {showMetaInfo && (showAuthor || showDate) && (
                      <div className="flex items-center gap-2 mb-2" style={{ color: metaColor, fontSize: metaFs }}>
                        {showAuthor && authorName && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] relative overflow-hidden" style={{ backgroundColor: "color-mix(in oklab, var(--fg-primary) 10%, transparent)" }}>
                              {post.authorAvatar ? (
                                <Image src={post.authorAvatar} alt={authorName} fill className="object-cover" sizes="16px" />
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 opacity-80">
                                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                            <span>{authorName}</span>
                          </div>
                        )}
                        {showAuthor && authorName && showDate && dateVal && <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "currentColor", opacity: 0.5 }} />}
                        {showDate && dateVal && (
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 opacity-70">
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
                      <p style={{ color: excerptColor, fontSize: excerptFs, lineHeight: excerptLh }}>
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
          <div className="mt-3 flex items-center justify-center gap-2">
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
  );
}
