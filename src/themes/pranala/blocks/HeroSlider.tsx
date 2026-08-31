"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBool, type ResponsiveDevice } from "./responsive";
import { sanitizeCssUrl } from "@/lib/sanitizer";

type HeroSliderPost = {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  image?: string | null;
  publishedAt?: string | Date | null;
  createdAt?: string | Date | null;
  category?: { slug: string; name: string } | null;
  archiveDisplayCategory?: { slug: string; name: string } | null;
  author?: { name?: string; fullName?: string } | string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  featuredImage?: { fileUrl?: string | null } | null;
};

type HeroSliderConfig = {
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
  showMetaInfo?: boolean;
  showAuthor?: boolean;
  overlayOpacity?: number;
  showMiniThumbnails?: boolean;
  thumbnailVisibleCount?: number;
  thumbnailImageHeight?: number | string;
  showExcerpt?: boolean;
  excerptLength?: number;
  tabletExcerptLength?: number;
  mobileExcerptLength?: number;
  showCategory?: boolean;
  showDate?: boolean;
  imageHeight?: number | string;
  tabletImageHeight?: number | string;
  mobileImageHeight?: number | string;
  heroContentPaddingTop?: number | string;
  tabletHeroContentPaddingTop?: number | string;
  mobileHeroContentPaddingTop?: number | string;
  heroContentPaddingRight?: number | string;
  tabletHeroContentPaddingRight?: number | string;
  mobileHeroContentPaddingRight?: number | string;
  heroContentPaddingBottom?: number | string;
  tabletHeroContentPaddingBottom?: number | string;
  mobileHeroContentPaddingBottom?: number | string;
  heroContentPaddingLeft?: number | string;
  tabletHeroContentPaddingLeft?: number | string;
  mobileHeroContentPaddingLeft?: number | string;
  titleFontSize?: number | string;
  titleFontWeight?: number | string;
  tabletTitleFontWeight?: number | string;
  mobileTitleFontWeight?: number | string;
  titleLineHeight?: number | string;
  tabletTitleLineHeight?: number | string;
  mobileTitleLineHeight?: number | string;
  tabletTitleFontSize?: number | string;
  mobileTitleFontSize?: number | string;
  titleColor?: string;
  tabletTitleColor?: string;
  mobileTitleColor?: string;
  titleHoverColor?: string;
  tabletTitleHoverColor?: string;
  mobileTitleHoverColor?: string;
  excerptColor?: string;
  tabletExcerptColor?: string;
  mobileExcerptColor?: string;
  metaColor?: string;
  tabletMetaColor?: string;
  mobileMetaColor?: string;
  categoryLabelColor?: string;
  tabletCategoryLabelColor?: string;
  mobileCategoryLabelColor?: string;
  categoryLabelBgColor?: string;
  tabletCategoryLabelBgColor?: string;
  mobileCategoryLabelBgColor?: string;
  categoryLabelFontSize?: number | string;
  tabletCategoryLabelFontSize?: number | string;
  mobileCategoryLabelFontSize?: number | string;
  metaFontSize?: number | string;
  tabletMetaFontSize?: number | string;
  mobileMetaFontSize?: number | string;
  excerptFontSize?: number | string;
  tabletExcerptFontSize?: number | string;
  mobileExcerptFontSize?: number | string;
  excerptLineHeight?: number | string;
  tabletExcerptLineHeight?: number | string;
  mobileExcerptLineHeight?: number | string;
  blockTitleColor?: string;
  tabletBlockTitleColor?: string;
  mobileBlockTitleColor?: string;
  blockTitleBorderColor?: string;
  tabletBlockTitleBorderColor?: string;
  mobileBlockTitleBorderColor?: string;
  blockTitleFontSize?: number | string;
  blockTitleLineHeight?: number | string;
  tabletBlockTitleFontSize?: number | string;
  mobileBlockTitleFontSize?: number | string;
  blockTitleMarginBottom?: number | string;
  tabletBlockTitleMarginBottom?: number | string;
  mobileBlockTitleMarginBottom?: number | string;
  blockTitlePaddingBottom?: number | string;
  tabletBlockTitlePaddingBottom?: number | string;
  mobileBlockTitlePaddingBottom?: number | string;
  useBox?: boolean | string;
  boxColor?: string;
  boxBorderRadius?: string | number;
  [key: string]: unknown;
};

interface HeroSliderProps {
  block: {
    id: string;
    config?: HeroSliderConfig;
  };
  posts?: HeroSliderPost[];
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

const toSize = (val: unknown, fallback: string) => {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "number" && Number.isFinite(val)) return `${val}px`;
  if (typeof val === "string" && val.trim() !== "") return /^\d+(\.\d+)?$/.test(val.trim()) ? `${val.trim()}px` : val;
  return fallback;
};

const resolveRadiusValue = (value: unknown, fallback: string): string => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value < 0) return fallback;
    return `${value}px`;
  }
  if (typeof value === "string") {
    const v = value.trim();
    if (!v) return fallback;
    const lower = v.toLowerCase();
    if (lower === "default" || lower === "global") return fallback;
    if (lower === "none") return "0";
    if (lower === "sm") return "0.125rem";
    if (lower === "md") return "0.375rem";
    if (lower === "lg") return "0.5rem";
    if (lower === "xl") return "0.75rem";
    if (lower === "2xl") return "1rem";
    if (lower === "full") return "9999px";
    if (/^-?\d+(\.\d+)?$/.test(v)) {
      const parsed = Number(v);
      if (!Number.isFinite(parsed) || parsed < 0) return fallback;
      return `${parsed}px`;
    }
    return v;
  }
  return fallback;
};

const toFontWeight = (val: unknown, fallback: string) => {
  if (typeof val === "number" && Number.isFinite(val)) return `${val}`;
  if (typeof val === "string" && val.trim() !== "") return val.trim();
  return fallback;
};

const toBool = (value: unknown, fallback: boolean) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
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

const clampExcerpt = (excerpt: string | null | undefined, maxLength: number) => {
  if (!excerpt) return "";
  const clean = excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  if (maxLength <= 1) return clean.slice(0, Math.max(0, maxLength));
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
};

const getExcerptSource = (post: HeroSliderPost, maxLength: number) => {
  const excerptText = typeof post.excerpt === "string"
    ? post.excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : "";
  const contentText = typeof post.content === "string"
    ? post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : "";

  if (excerptText.length >= maxLength) return excerptText;
  return contentText || excerptText;
};

export default function HeroSlider({ block, posts = [], previewDevice }: HeroSliderProps) {
  const cfg = block.config || {};
  const configRecord = cfg as Record<string, unknown>;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [device, setDevice] = useState<ResponsiveDevice>(previewDevice || "desktop");

  const loop = cfg.loop !== false;
  const showArrows = cfg.showArrows !== false;
  const showDots = cfg.showDots !== false;
  const pauseOnHover = cfg.pauseOnHover !== false;
  const swipeEnabled = cfg.swipeEnabled !== false;
  const autoplay = toBool(cfg.autoplay, false);
  const autoplayMs = Math.max(1500, toNumber(cfg.autoplayMs, 5000));
  const transitionMs = Math.max(200, toNumber(cfg.slideTransitionMs, 500));
  const showMetaInfoDesktop = getResponsiveBool(configRecord, "showMetaInfo", "desktop", getResponsiveBool(configRecord, "showMeta", "desktop", true));
  const showMetaInfoTablet = getResponsiveBool(configRecord, "showMetaInfo", "tablet", getResponsiveBool(configRecord, "showMeta", "tablet", true));
  const showMetaInfoMobile = getResponsiveBool(configRecord, "showMetaInfo", "mobile", getResponsiveBool(configRecord, "showMeta", "mobile", true));
  const showMetaInfo = device === "mobile" ? showMetaInfoMobile : (device === "tablet" ? showMetaInfoTablet : showMetaInfoDesktop);
  const showCategoryDesktop = getResponsiveBool(configRecord, "showCategory", "desktop", true);
  const showCategoryTablet = getResponsiveBool(configRecord, "showCategory", "tablet", true);
  const showCategoryMobile = getResponsiveBool(configRecord, "showCategory", "mobile", true);
  const showCategory = device === "mobile" ? showCategoryMobile : (device === "tablet" ? showCategoryTablet : showCategoryDesktop);
  const showAuthorDesktop = getResponsiveBool(configRecord, "showAuthor", "desktop", true);
  const showAuthorTablet = getResponsiveBool(configRecord, "showAuthor", "tablet", true);
  const showAuthorMobile = getResponsiveBool(configRecord, "showAuthor", "mobile", true);
  const showAuthor = device === "mobile" ? showAuthorMobile : (device === "tablet" ? showAuthorTablet : showAuthorDesktop);
  const showDateDesktop = getResponsiveBool(configRecord, "showDate", "desktop", true);
  const showDateTablet = getResponsiveBool(configRecord, "showDate", "tablet", true);
  const showDateMobile = getResponsiveBool(configRecord, "showDate", "mobile", true);
  const showDate = device === "mobile" ? showDateMobile : (device === "tablet" ? showDateTablet : showDateDesktop);
  const showExcerptDesktop = getResponsiveBool(configRecord, "showExcerpt", "desktop", true);
  const showExcerptTablet = getResponsiveBool(configRecord, "showExcerpt", "tablet", true);
  const showExcerptMobile = getResponsiveBool(configRecord, "showExcerpt", "mobile", true);
  const showExcerpt = device === "mobile" ? showExcerptMobile : (device === "tablet" ? showExcerptTablet : showExcerptDesktop);
  const excerptLengthDesktop = toNumber(cfg.excerptLength, 120);
  const excerptLengthTablet = toNumber(cfg.tabletExcerptLength ?? cfg.excerptLength, excerptLengthDesktop);
  const excerptLengthMobile = toNumber(cfg.mobileExcerptLength ?? cfg.excerptLength, 120);
  const excerptLength = device === "mobile"
    ? excerptLengthMobile
    : (device === "tablet" ? excerptLengthTablet : excerptLengthDesktop);
  const overlayOpacityDesktop = Math.min(100, Math.max(0, toNumber(cfg.overlayOpacity, 70)));
  const overlayOpacityTablet = Math.min(100, Math.max(0, toNumber(cfg.tabletOverlayOpacity, overlayOpacityDesktop)));
  const overlayOpacityMobile = Math.min(100, Math.max(0, toNumber(cfg.mobileOverlayOpacity, overlayOpacityDesktop)));
  const overlayOpacity = device === "mobile" ? overlayOpacityMobile : (device === "tablet" ? overlayOpacityTablet : overlayOpacityDesktop);
  const showMiniThumbnails = toBool(cfg.showMiniThumbnails, false);
  const thumbnailVisibleCount = Math.max(2, Math.min(6, toNumber(cfg.thumbnailVisibleCount, 4)));

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

  const limitDesktop = Math.min(6, Math.max(1, toNumber(cfg.limit, 5)));
  const limitTablet = Math.min(6, Math.max(1, toNumber(cfg.tabletLimit, limitDesktop)));
  const limitMobile = Math.min(6, Math.max(1, toNumber(cfg.mobileLimit, limitTablet)));
  const activeLimit = device === "mobile" ? limitMobile : (device === "tablet" ? limitTablet : limitDesktop);
  const offset = Math.max(0, toNumber(cfg.offset, 0));
  const slides = posts.slice(offset, offset + activeLimit);

  useEffect(() => {
    if (activeIndex >= slides.length) setActiveIndex(0);
  }, [slides.length, activeIndex]);

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;
    if (pauseOnHover && isHovered) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev + 1;
        if (next >= slides.length) return loop ? 0 : prev;
        return next;
      });
    }, autoplayMs);
    return () => clearInterval(timer);
  }, [autoplay, autoplayMs, isHovered, loop, pauseOnHover, slides.length]);


  const next = () => setActiveIndex((prev) => {
    if (slides.length <= 1) return prev;
    const n = prev + 1;
    if (n >= slides.length) return loop ? 0 : prev;
    return n;
  });

  const prev = () => setActiveIndex((prevIdx) => {
    if (slides.length <= 1) return prevIdx;
    const p = prevIdx - 1;
    if (p < 0) return loop ? slides.length - 1 : prevIdx;
    return p;
  });

  const imageHMobile = toSize(cfg.mobileImageHeight ?? cfg.imageHeight, "300px");
  const imageHTablet = toSize(cfg.tabletImageHeight ?? cfg.imageHeight, "420px");
  const imageHDesktop = toSize(cfg.imageHeight, "500px");

  const titleFsMobile = toSize(cfg.mobileTitleFontSize ?? cfg.titleFontSize, "var(--home-news-title-size, 18px)");
  const titleFsTablet = toSize(cfg.tabletTitleFontSize ?? cfg.titleFontSize, titleFsMobile);
  const titleFsDesktop = toSize(cfg.titleFontSize, titleFsTablet);
  const titleFwMobile = toFontWeight(cfg.mobileTitleFontWeight ?? cfg.titleFontWeight, "var(--home-news-title-weight, 600)");
  const titleFwTablet = toFontWeight(cfg.tabletTitleFontWeight ?? cfg.titleFontWeight, titleFwMobile);
  const titleFwDesktop = toFontWeight(cfg.titleFontWeight, titleFwTablet);
  const titleLhMobile = `${toNumber(cfg.mobileTitleLineHeight ?? cfg.titleLineHeight, 1.15)}`;
  const titleLhTablet = `${toNumber(cfg.tabletTitleLineHeight ?? cfg.titleLineHeight, 1.15)}`;
  const titleLhDesktop = `${toNumber(cfg.titleLineHeight, 1.15)}`;

  const titleColorMobile = (cfg.mobileTitleColor as string) || (cfg.titleColor as string) || "var(--home-news-title-color, #111827)";
  const titleColorTablet = (cfg.tabletTitleColor as string) || titleColorMobile;
  const titleColorDesktop = (cfg.titleColor as string) || titleColorTablet;
  const titleHoverMobile = (cfg.mobileTitleHoverColor as string) || (cfg.titleHoverColor as string) || "var(--home-hover-color, var(--accent))";
  const titleHoverTablet = (cfg.tabletTitleHoverColor as string) || titleHoverMobile;
  const titleHoverDesktop = (cfg.titleHoverColor as string) || titleHoverTablet;

  const excerptColorMobile = (cfg.mobileExcerptColor as string) || (cfg.excerptColor as string) || "var(--home-excerpt-color, #4b5563)";
  const excerptColorTablet = (cfg.tabletExcerptColor as string) || excerptColorMobile;
  const excerptColorDesktop = (cfg.excerptColor as string) || excerptColorTablet;
  const excerptFsMobile = toSize(cfg.mobileExcerptFontSize ?? cfg.excerptFontSize, "var(--home-excerpt-size, 14px)");
  const excerptFsTablet = toSize(cfg.tabletExcerptFontSize ?? cfg.excerptFontSize, excerptFsMobile);
  const excerptFsDesktop = toSize(cfg.excerptFontSize, excerptFsTablet);
  const excerptLhMobile = `${toNumber(cfg.mobileExcerptLineHeight ?? cfg.excerptLineHeight, 1.5)}`;
  const excerptLhTablet = `${toNumber(cfg.tabletExcerptLineHeight ?? cfg.excerptLineHeight, 1.5)}`;
  const excerptLhDesktop = `${toNumber(cfg.excerptLineHeight, 1.5)}`;

  const metaColorMobile = (cfg.mobileMetaColor as string) || (cfg.metaColor as string) || "var(--home-meta-color, #9ca3af)";
  const metaColorTablet = (cfg.tabletMetaColor as string) || metaColorMobile;
  const metaColorDesktop = (cfg.metaColor as string) || metaColorTablet;
  const metaFsMobile = toSize(cfg.mobileMetaFontSize ?? cfg.metaFontSize, "var(--home-meta-size, 12px)");
  const metaFsTablet = toSize(cfg.tabletMetaFontSize ?? cfg.metaFontSize, metaFsMobile);
  const metaFsDesktop = toSize(cfg.metaFontSize, metaFsTablet);
  const metaLhMobile = `${toNumber(cfg.mobileMetaLineHeight ?? cfg.metaLineHeight, 1.4)}`;
  const metaLhTablet = `${toNumber(cfg.tabletMetaLineHeight ?? cfg.metaLineHeight, 1.4)}`;
  const metaLhDesktop = `${toNumber(cfg.metaLineHeight, 1.4)}`;

  const categoryLabelColorMobile = (cfg as any).mobileCategoryLabelTextColor || (cfg.mobileCategoryLabelColor as string) || (cfg.mobileCategoryTextColor as string) || (cfg as any).categoryLabelTextColor || (cfg.categoryLabelColor as string) || (cfg.categoryTextColor as string) || "#ffffff";
  const categoryLabelColorTablet = (cfg as any).tabletCategoryLabelTextColor || (cfg.tabletCategoryLabelColor as string) || (cfg.tabletCategoryTextColor as string) || categoryLabelColorMobile;
  const categoryLabelColorDesktop = (cfg as any).categoryLabelTextColor || (cfg.categoryLabelColor as string) || (cfg.categoryTextColor as string) || categoryLabelColorTablet;
  const categoryLabelColor = device === "mobile" ? categoryLabelColorMobile : (device === "tablet" ? categoryLabelColorTablet : categoryLabelColorDesktop);
  const categoryLabelBgColorMobile = (cfg.mobileCategoryLabelBgColor as string) || (cfg.categoryLabelBgColor as string) || "var(--accent)";
  const categoryLabelBgColorTablet = (cfg.tabletCategoryLabelBgColor as string) || categoryLabelBgColorMobile;
  const categoryLabelBgColorDesktop = (cfg.categoryLabelBgColor as string) || categoryLabelBgColorTablet;
  const categoryLabelBgColor = device === "mobile" ? categoryLabelBgColorMobile : (device === "tablet" ? categoryLabelBgColorTablet : categoryLabelBgColorDesktop);
  const categoryLabelFsMobile = toSize(cfg.mobileCategoryLabelFontSize ?? cfg.categoryLabelFontSize, "10px");
  const categoryLabelFsTablet = toSize(cfg.tabletCategoryLabelFontSize ?? cfg.categoryLabelFontSize, categoryLabelFsMobile);
  const categoryLabelFsDesktop = toSize(cfg.categoryLabelFontSize, categoryLabelFsTablet);
  const categoryLabelLhMobile = `${toNumber(cfg.mobileCategoryLabelLineHeight ?? cfg.categoryLabelLineHeight, 1.2)}`;
  const categoryLabelLhTablet = `${toNumber(cfg.tabletCategoryLabelLineHeight ?? cfg.categoryLabelLineHeight, 1.2)}`;
  const categoryLabelLhDesktop = `${toNumber(cfg.categoryLabelLineHeight, 1.2)}`;
  const dotColorMobile = (cfg.mobileDotColor as string) || (cfg.dotColor as string) || "var(--accent)";
  const dotColorTablet = (cfg.tabletDotColor as string) || dotColorMobile;
  const dotColorDesktop = (cfg.dotColor as string) || dotColorTablet;
  const dotInactiveColorMobile = (cfg.mobileDotInactiveColor as string) || (cfg.dotInactiveColor as string) || "color-mix(in srgb, var(--accent) 30%, transparent)";
  const dotInactiveColorTablet = (cfg.tabletDotInactiveColor as string) || dotInactiveColorMobile;
  const dotInactiveColorDesktop = (cfg.dotInactiveColor as string) || dotInactiveColorTablet;
  const activeDotColor = device === "mobile" ? dotColorMobile : (device === "tablet" ? dotColorTablet : dotColorDesktop);
  const inactiveDotColor = device === "mobile" ? dotInactiveColorMobile : (device === "tablet" ? dotInactiveColorTablet : dotInactiveColorDesktop);
  const blockTitleColorMobile = (cfg.mobileBlockTitleColor as string) || (cfg.blockTitleColor as string) || "var(--home-widget-title-color, var(--heading-color, #1e293b))";
  const blockTitleColorTablet = (cfg.tabletBlockTitleColor as string) || blockTitleColorMobile;
  const blockTitleColorDesktop = (cfg.blockTitleColor as string) || blockTitleColorTablet;
  const blockTitleBorderMobile = (cfg.mobileBlockTitleBorderColor as string) || (cfg.blockTitleBorderColor as string) || "var(--accent)";
  const blockTitleBorderTablet = (cfg.tabletBlockTitleBorderColor as string) || blockTitleBorderMobile;
  const blockTitleBorderDesktop = (cfg.blockTitleBorderColor as string) || blockTitleBorderTablet;
  const blockTitleFsMobile = toSize(cfg.mobileBlockTitleFontSize ?? cfg.blockTitleFontSize, "var(--home-widget-title-size, 20px)");
  const blockTitleFsTablet = toSize(cfg.tabletBlockTitleFontSize ?? cfg.blockTitleFontSize, "22px");
  const blockTitleFsDesktop = toSize(cfg.blockTitleFontSize, "var(--home-widget-title-size, 24px)");
  const blockTitleLhMobile = `${toNumber((cfg as Record<string, unknown>).mobileBlockTitleLineHeight ?? cfg.blockTitleLineHeight, 1.2)}`;
  const blockTitleLhTablet = `${toNumber((cfg as Record<string, unknown>).tabletBlockTitleLineHeight ?? cfg.blockTitleLineHeight, 1.2)}`;
  const blockTitleLhDesktop = `${toNumber(cfg.blockTitleLineHeight, 1.2)}`;
  const blockTitleMbMobile = toSize(cfg.mobileBlockTitleMarginBottom ?? cfg.blockTitleMarginBottom, "12px");
  const blockTitleMbTablet = toSize(cfg.tabletBlockTitleMarginBottom ?? cfg.blockTitleMarginBottom, blockTitleMbMobile);
  const blockTitleMbDesktop = toSize(cfg.blockTitleMarginBottom, blockTitleMbTablet);
  const blockTitlePbMobile = toSize(cfg.mobileBlockTitlePaddingBottom ?? cfg.blockTitlePaddingBottom, "12px");
  const blockTitlePbTablet = toSize(cfg.tabletBlockTitlePaddingBottom ?? cfg.blockTitlePaddingBottom, blockTitlePbMobile);
  const blockTitlePbDesktop = toSize(cfg.blockTitlePaddingBottom, blockTitlePbTablet);

  const useBoxDesktop = cfg.useBox === true || cfg.useBox === "true";
  const useBoxTablet = ((cfg.tabletUseBox as boolean | string | undefined) ?? cfg.useBox) === true || ((cfg.tabletUseBox as string | undefined) === "true");
  const useBoxMobile = ((cfg.mobileUseBox as boolean | string | undefined) ?? cfg.useBox) === true || ((cfg.mobileUseBox as string | undefined) === "true");
  const useBox = device === "mobile" ? useBoxMobile : (device === "tablet" ? useBoxTablet : useBoxDesktop);
  const boxColorDesktop = (cfg.boxColor as string) || "transparent";
  const boxColorTablet = (cfg.tabletBoxColor as string) || boxColorDesktop;
  const boxColorMobile = (cfg.mobileBoxColor as string) || boxColorDesktop;
  const boxColor = device === "mobile" ? boxColorMobile : (device === "tablet" ? boxColorTablet : boxColorDesktop);
  const boxBgImageDesktop = typeof cfg.backgroundImage === "string" ? cfg.backgroundImage.trim() : "";
  const boxBgImageTablet = typeof cfg.tabletBackgroundImage === "string" && cfg.tabletBackgroundImage.trim() !== "" ? cfg.tabletBackgroundImage.trim() : boxBgImageDesktop;
  const boxBgImageMobile = typeof cfg.mobileBackgroundImage === "string" && cfg.mobileBackgroundImage.trim() !== "" ? cfg.mobileBackgroundImage.trim() : boxBgImageTablet;
  const boxBgImage = device === "mobile" ? boxBgImageMobile : (device === "tablet" ? boxBgImageTablet : boxBgImageDesktop);
  const boxBgSizeDesktop = typeof cfg.backgroundSize === "string" && cfg.backgroundSize.trim() !== "" ? cfg.backgroundSize.trim() : "cover";
  const boxBgSizeTablet = typeof cfg.tabletBackgroundSize === "string" && cfg.tabletBackgroundSize.trim() !== "" ? cfg.tabletBackgroundSize.trim() : boxBgSizeDesktop;
  const boxBgSizeMobile = typeof cfg.mobileBackgroundSize === "string" && cfg.mobileBackgroundSize.trim() !== "" ? cfg.mobileBackgroundSize.trim() : boxBgSizeTablet;
  const boxBgSize = device === "mobile" ? boxBgSizeMobile : (device === "tablet" ? boxBgSizeTablet : boxBgSizeDesktop);
  const boxBgPositionDesktop = typeof cfg.backgroundPosition === "string" && cfg.backgroundPosition.trim() !== "" ? cfg.backgroundPosition.trim() : "center";
  const boxBgPositionTablet = typeof cfg.tabletBackgroundPosition === "string" && cfg.tabletBackgroundPosition.trim() !== "" ? cfg.tabletBackgroundPosition.trim() : boxBgPositionDesktop;
  const boxBgPositionMobile = typeof cfg.mobileBackgroundPosition === "string" && cfg.mobileBackgroundPosition.trim() !== "" ? cfg.mobileBackgroundPosition.trim() : boxBgPositionTablet;
  const boxBgPosition = device === "mobile" ? boxBgPositionMobile : (device === "tablet" ? boxBgPositionTablet : boxBgPositionDesktop);
  const boxBgRepeatDesktop = typeof cfg.backgroundRepeat === "string" && cfg.backgroundRepeat.trim() !== "" ? cfg.backgroundRepeat.trim() : "no-repeat";
  const boxBgRepeatTablet = typeof cfg.tabletBackgroundRepeat === "string" && cfg.tabletBackgroundRepeat.trim() !== "" ? cfg.tabletBackgroundRepeat.trim() : boxBgRepeatDesktop;
  const boxBgRepeatMobile = typeof cfg.mobileBackgroundRepeat === "string" && cfg.mobileBackgroundRepeat.trim() !== "" ? cfg.mobileBackgroundRepeat.trim() : boxBgRepeatTablet;
  const boxBgRepeat = device === "mobile" ? boxBgRepeatMobile : (device === "tablet" ? boxBgRepeatTablet : boxBgRepeatDesktop);
  const boxBgAttachmentDesktop = typeof cfg.backgroundAttachment === "string" && cfg.backgroundAttachment.trim() !== "" ? cfg.backgroundAttachment.trim() : "scroll";
  const boxBgAttachmentTablet = typeof cfg.tabletBackgroundAttachment === "string" && cfg.tabletBackgroundAttachment.trim() !== "" ? cfg.tabletBackgroundAttachment.trim() : boxBgAttachmentDesktop;
  const boxBgAttachmentMobile = typeof cfg.mobileBackgroundAttachment === "string" && cfg.mobileBackgroundAttachment.trim() !== "" ? cfg.mobileBackgroundAttachment.trim() : boxBgAttachmentTablet;
  const boxBgAttachment = device === "mobile" ? boxBgAttachmentMobile : (device === "tablet" ? boxBgAttachmentTablet : boxBgAttachmentDesktop);
  const boxOverlayColorDesktop = typeof cfg.backgroundOverlayColor === "string" ? cfg.backgroundOverlayColor : "transparent";
  const boxOverlayColorTablet = typeof cfg.tabletBackgroundOverlayColor === "string" && cfg.tabletBackgroundOverlayColor.trim() !== "" ? cfg.tabletBackgroundOverlayColor : boxOverlayColorDesktop;
  const boxOverlayColorMobile = typeof cfg.mobileBackgroundOverlayColor === "string" && cfg.mobileBackgroundOverlayColor.trim() !== "" ? cfg.mobileBackgroundOverlayColor : boxOverlayColorTablet;
  const boxOverlayOpacityDesktop = Math.min(100, Math.max(0, Number(cfg.backgroundOverlayOpacity ?? 45) || 0));
  const boxOverlayOpacityTablet = Math.min(100, Math.max(0, Number(cfg.tabletBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const boxOverlayOpacityMobile = Math.min(100, Math.max(0, Number(cfg.mobileBackgroundOverlayOpacity ?? boxOverlayOpacityTablet) || 0));
  const boxOverlayColor = device === "mobile" ? boxOverlayColorMobile : (device === "tablet" ? boxOverlayColorTablet : boxOverlayColorDesktop);
  const boxOverlayOpacity = device === "mobile" ? boxOverlayOpacityMobile : (device === "tablet" ? boxOverlayOpacityTablet : boxOverlayOpacityDesktop);
  const hasBoxOverlay = boxOverlayOpacity > 0 && typeof boxOverlayColor === "string" && boxOverlayColor.trim() !== "" && boxOverlayColor !== "transparent";
  const boxOverlayFill = hasBoxOverlay ? `color-mix(in srgb, ${boxOverlayColor} ${boxOverlayOpacity}%, transparent)` : "transparent";
  const boxBackgroundImage = useBox && boxBgImage
    ? (hasBoxOverlay
      ? `linear-gradient(${boxOverlayFill}, ${boxOverlayFill}), url("${sanitizeCssUrl(boxBgImage)}")`
      : `url("${sanitizeCssUrl(boxBgImage)}")`)
    : "none";
  const globalRadius = "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))";
  const categoryLabelRadius = resolveRadiusValue(cfg.categoryLabelBorderRadius ?? cfg.categoryBorderRadius, globalRadius);
  const boxRadius = resolveRadiusValue(cfg.boxBorderRadius, globalRadius);
  const boxRadiusTablet = resolveRadiusValue(cfg.tabletBoxBorderRadius ?? cfg.boxBorderRadius, boxRadius);
  const boxRadiusMobile = resolveRadiusValue(cfg.mobileBoxBorderRadius ?? cfg.boxBorderRadius, boxRadius);
  const activeBoxRadius = device === "mobile" ? boxRadiusMobile : (device === "tablet" ? boxRadiusTablet : boxRadius);
  const boxPtMobile = cfg.mobileBoxPaddingTop !== undefined ? toSize(cfg.mobileBoxPaddingTop, "0px") : (cfg.boxPaddingTop !== undefined ? toSize(cfg.boxPaddingTop, "0px") : "0px");
  const boxPrMobile = cfg.mobileBoxPaddingRight !== undefined ? toSize(cfg.mobileBoxPaddingRight, "0px") : (cfg.boxPaddingRight !== undefined ? toSize(cfg.boxPaddingRight, "0px") : "0px");
  const boxPbMobile = cfg.mobileBoxPaddingBottom !== undefined ? toSize(cfg.mobileBoxPaddingBottom, "0px") : (cfg.boxPaddingBottom !== undefined ? toSize(cfg.boxPaddingBottom, "0px") : "0px");
  const boxPlMobile = cfg.mobileBoxPaddingLeft !== undefined ? toSize(cfg.mobileBoxPaddingLeft, "0px") : (cfg.boxPaddingLeft !== undefined ? toSize(cfg.boxPaddingLeft, "0px") : "0px");
  const boxPtTablet = cfg.tabletBoxPaddingTop !== undefined ? toSize(cfg.tabletBoxPaddingTop, "0px") : (cfg.boxPaddingTop !== undefined ? toSize(cfg.boxPaddingTop, "0px") : boxPtMobile);
  const boxPrTablet = cfg.tabletBoxPaddingRight !== undefined ? toSize(cfg.tabletBoxPaddingRight, "0px") : (cfg.boxPaddingRight !== undefined ? toSize(cfg.boxPaddingRight, "0px") : boxPrMobile);
  const boxPbTablet = cfg.tabletBoxPaddingBottom !== undefined ? toSize(cfg.tabletBoxPaddingBottom, "0px") : (cfg.boxPaddingBottom !== undefined ? toSize(cfg.boxPaddingBottom, "0px") : boxPbMobile);
  const boxPlTablet = cfg.tabletBoxPaddingLeft !== undefined ? toSize(cfg.tabletBoxPaddingLeft, "0px") : (cfg.boxPaddingLeft !== undefined ? toSize(cfg.boxPaddingLeft, "0px") : boxPlMobile);
  const boxPtDesktop = cfg.boxPaddingTop !== undefined ? toSize(cfg.boxPaddingTop, "0px") : boxPtTablet;
  const boxPrDesktop = cfg.boxPaddingRight !== undefined ? toSize(cfg.boxPaddingRight, "0px") : boxPrTablet;
  const boxPbDesktop = cfg.boxPaddingBottom !== undefined ? toSize(cfg.boxPaddingBottom, "0px") : boxPbTablet;
  const boxPlDesktop = cfg.boxPaddingLeft !== undefined ? toSize(cfg.boxPaddingLeft, "0px") : boxPlTablet;
  const activeBoxPt = device === "mobile" ? boxPtMobile : (device === "tablet" ? boxPtTablet : boxPtDesktop);
  const activeBoxPr = device === "mobile" ? boxPrMobile : (device === "tablet" ? boxPrTablet : boxPrDesktop);
  const activeBoxPb = device === "mobile" ? boxPbMobile : (device === "tablet" ? boxPbTablet : boxPbDesktop);
  const activeBoxPl = device === "mobile" ? boxPlMobile : (device === "tablet" ? boxPlTablet : boxPlDesktop);

  const marginTopDesktop = toSize(cfg.marginTop, "0px");
  const marginTopTablet = toSize(cfg.tabletMarginTop ?? cfg.marginTop, marginTopDesktop);
  const marginTopMobile = toSize(cfg.mobileMarginTop ?? cfg.marginTop, marginTopDesktop);
  const marginRightDesktop = toSize(cfg.marginRight, "0px");
  const marginRightTablet = toSize(cfg.tabletMarginRight ?? cfg.marginRight, marginRightDesktop);
  const marginRightMobile = toSize(cfg.mobileMarginRight ?? cfg.marginRight, marginRightDesktop);
  const marginBottomDesktop = toSize(cfg.marginBottom, "0px");
  const marginBottomTablet = toSize(cfg.tabletMarginBottom ?? cfg.marginBottom, marginBottomDesktop);
  const marginBottomMobile = toSize(cfg.mobileMarginBottom ?? cfg.marginBottom, marginBottomDesktop);
  const marginLeftDesktop = toSize(cfg.marginLeft, "0px");
  const marginLeftTablet = toSize(cfg.tabletMarginLeft ?? cfg.marginLeft, marginLeftDesktop);
  const marginLeftMobile = toSize(cfg.mobileMarginLeft ?? cfg.marginLeft, marginLeftDesktop);

  const paddingTopDesktop = toSize(cfg.paddingTop, "0px");
  const paddingTopTablet = toSize(cfg.tabletPaddingTop ?? cfg.paddingTop, paddingTopDesktop);
  const paddingTopMobile = toSize(cfg.mobilePaddingTop ?? cfg.paddingTop, paddingTopDesktop);
  const paddingRightDesktop = toSize(cfg.paddingRight, "0px");
  const paddingRightTablet = toSize(cfg.tabletPaddingRight ?? cfg.paddingRight, paddingRightDesktop);
  const paddingRightMobile = toSize(cfg.mobilePaddingRight ?? cfg.paddingRight, paddingRightDesktop);
  const paddingBottomDesktop = toSize(cfg.paddingBottom, "0px");
  const paddingBottomTablet = toSize(cfg.tabletPaddingBottom ?? cfg.paddingBottom, paddingBottomDesktop);
  const paddingBottomMobile = toSize(cfg.mobilePaddingBottom ?? cfg.paddingBottom, paddingBottomDesktop);
  const paddingLeftDesktop = toSize(cfg.paddingLeft, "0px");
  const paddingLeftTablet = toSize(cfg.tabletPaddingLeft ?? cfg.paddingLeft, paddingLeftDesktop);
  const paddingLeftMobile = toSize(cfg.mobilePaddingLeft ?? cfg.paddingLeft, paddingLeftDesktop);

  const heroContentPaddingTopDesktop = toSize(cfg.heroContentPaddingTop, "24px");
  const heroContentPaddingTopTablet = toSize(cfg.tabletHeroContentPaddingTop ?? cfg.heroContentPaddingTop, "24px");
  const heroContentPaddingTopMobile = toSize(cfg.mobileHeroContentPaddingTop ?? cfg.heroContentPaddingTop, "16px");
  const heroContentPaddingRightDesktop = toSize(cfg.heroContentPaddingRight, "24px");
  const heroContentPaddingRightTablet = toSize(cfg.tabletHeroContentPaddingRight ?? cfg.heroContentPaddingRight, "24px");
  const heroContentPaddingRightMobile = toSize(cfg.mobileHeroContentPaddingRight ?? cfg.heroContentPaddingRight, "16px");
  const heroContentPaddingBottomDesktop = toSize(cfg.heroContentPaddingBottom, "24px");
  const heroContentPaddingBottomTablet = toSize(cfg.tabletHeroContentPaddingBottom ?? cfg.heroContentPaddingBottom, "24px");
  const heroContentPaddingBottomMobile = toSize(cfg.mobileHeroContentPaddingBottom ?? cfg.heroContentPaddingBottom, "16px");
  const heroContentPaddingLeftDesktop = toSize(cfg.heroContentPaddingLeft, "24px");
  const heroContentPaddingLeftTablet = toSize(cfg.tabletHeroContentPaddingLeft ?? cfg.heroContentPaddingLeft, "24px");
  const heroContentPaddingLeftMobile = toSize(cfg.mobileHeroContentPaddingLeft ?? cfg.heroContentPaddingLeft, "16px");

  const heroContentPaddingTop = device === "mobile" ? heroContentPaddingTopMobile : (device === "tablet" ? heroContentPaddingTopTablet : heroContentPaddingTopDesktop);
  const heroContentPaddingRight = device === "mobile" ? heroContentPaddingRightMobile : (device === "tablet" ? heroContentPaddingRightTablet : heroContentPaddingRightDesktop);
  const heroContentPaddingBottom = device === "mobile" ? heroContentPaddingBottomMobile : (device === "tablet" ? heroContentPaddingBottomTablet : heroContentPaddingBottomDesktop);
  const heroContentPaddingLeft = device === "mobile" ? heroContentPaddingLeftMobile : (device === "tablet" ? heroContentPaddingLeftTablet : heroContentPaddingLeftDesktop);

  const thumbImageHeightMobile = toSize(cfg.mobileThumbnailImageHeight ?? cfg.thumbnailImageHeight, "72px");
  const thumbImageHeightTablet = toSize(cfg.tabletThumbnailImageHeight ?? cfg.thumbnailImageHeight, thumbImageHeightMobile);
  const thumbImageHeightDesktop = toSize(cfg.thumbnailImageHeight, thumbImageHeightTablet);
  const thumbImageHeight = device === "mobile" ? thumbImageHeightMobile : (device === "tablet" ? thumbImageHeightTablet : thumbImageHeightDesktop);
  const thumbnailStrip = slides;
  const thumbItemWidth = `${100 / thumbnailVisibleCount}%`;
  const currentImageHeight = device === "mobile" ? imageHMobile : (device === "tablet" ? imageHTablet : imageHDesktop);
  const currentBlockTitleColor = device === "mobile" ? blockTitleColorMobile : (device === "tablet" ? blockTitleColorTablet : blockTitleColorDesktop);
  const currentBlockTitleBorder = device === "mobile" ? blockTitleBorderMobile : (device === "tablet" ? blockTitleBorderTablet : blockTitleBorderDesktop);
  const currentBlockTitleFs = device === "mobile" ? blockTitleFsMobile : (device === "tablet" ? blockTitleFsTablet : blockTitleFsDesktop);
  const currentBlockTitleLh = device === "mobile" ? blockTitleLhMobile : (device === "tablet" ? blockTitleLhTablet : blockTitleLhDesktop);
  const currentBlockTitleMb = device === "mobile" ? blockTitleMbMobile : (device === "tablet" ? blockTitleMbTablet : blockTitleMbDesktop);
  const currentBlockTitlePb = device === "mobile" ? blockTitlePbMobile : (device === "tablet" ? blockTitlePbTablet : blockTitlePbDesktop);
  const currentTitleFs = device === "mobile" ? titleFsMobile : (device === "tablet" ? titleFsTablet : titleFsDesktop);
  const currentTitleColor = device === "mobile" ? titleColorMobile : (device === "tablet" ? titleColorTablet : titleColorDesktop);
  const currentTitleHover = device === "mobile" ? titleHoverMobile : (device === "tablet" ? titleHoverTablet : titleHoverDesktop);
  const currentTitleLh = device === "mobile" ? titleLhMobile : (device === "tablet" ? titleLhTablet : titleLhDesktop);
  const currentTitleFw = device === "mobile" ? titleFwMobile : (device === "tablet" ? titleFwTablet : titleFwDesktop);
  const currentMetaColor = device === "mobile" ? metaColorMobile : (device === "tablet" ? metaColorTablet : metaColorDesktop);
  const currentMetaFs = device === "mobile" ? metaFsMobile : (device === "tablet" ? metaFsTablet : metaFsDesktop);
  const currentMetaLh = device === "mobile" ? metaLhMobile : (device === "tablet" ? metaLhTablet : metaLhDesktop);
  const currentExcerptColor = device === "mobile" ? excerptColorMobile : (device === "tablet" ? excerptColorTablet : excerptColorDesktop);
  const currentExcerptFs = device === "mobile" ? excerptFsMobile : (device === "tablet" ? excerptFsTablet : excerptFsDesktop);
  const currentExcerptLh = device === "mobile" ? excerptLhMobile : (device === "tablet" ? excerptLhTablet : excerptLhDesktop);
  const currentCategoryLabelFs = device === "mobile" ? categoryLabelFsMobile : (device === "tablet" ? categoryLabelFsTablet : categoryLabelFsDesktop);
  const currentCategoryLabelLh = device === "mobile" ? categoryLabelLhMobile : (device === "tablet" ? categoryLabelLhTablet : categoryLabelLhDesktop);

  const getAuthorName = (post: HeroSliderPost) => {
    if (typeof post.author === "string" && post.author.trim() !== "") return post.author;
    if (post.author && typeof post.author === "object") {
      if (typeof post.author.name === "string" && post.author.name.trim() !== "") return post.author.name;
      if (typeof post.author.fullName === "string" && post.author.fullName.trim() !== "") return post.author.fullName;
    }
    if (typeof post.authorName === "string" && post.authorName.trim() !== "") return post.authorName;
    return "";
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

  if (slides.length === 0) {
    return (
      <div
        id={`hero-slider-${block.id}`}
        className="w-full min-w-0 p-4 rounded-lg border border-[var(--border)] text-sm [color:var(--muted-text,var(--home-meta-color,#9ca3af))]"
      >
        Belum ada berita untuk ditampilkan.
      </div>
    );
  }

  return (
    <div
      id={`hero-slider-${block.id}`}
      className="w-full min-w-0"
      style={{
        "--widget-title-size-mobile": blockTitleFsMobile,
        "--widget-title-size-tablet": blockTitleFsTablet,
        "--widget-title-size-desktop": blockTitleFsDesktop,
        "--widget-title-color-mobile": blockTitleColorMobile,
        "--widget-title-color-tablet": blockTitleColorTablet,
        "--widget-title-color-desktop": blockTitleColorDesktop,
        "--widget-title-border-color-mobile": blockTitleBorderMobile,
        "--widget-title-border-color-tablet": blockTitleBorderTablet,
        "--widget-title-border-color-desktop": blockTitleBorderDesktop,
        marginTop: device === "mobile" ? marginTopMobile : (device === "tablet" ? marginTopTablet : marginTopDesktop),
        marginRight: device === "mobile" ? marginRightMobile : (device === "tablet" ? marginRightTablet : marginRightDesktop),
        marginBottom: device === "mobile" ? marginBottomMobile : (device === "tablet" ? marginBottomTablet : marginBottomDesktop),
        marginLeft: device === "mobile" ? marginLeftMobile : (device === "tablet" ? marginLeftTablet : marginLeftDesktop),
        paddingTop: device === "mobile" ? paddingTopMobile : (device === "tablet" ? paddingTopTablet : paddingTopDesktop),
        paddingRight: device === "mobile" ? paddingRightMobile : (device === "tablet" ? paddingRightTablet : paddingRightDesktop),
        paddingBottom: device === "mobile" ? paddingBottomMobile : (device === "tablet" ? paddingBottomTablet : paddingBottomDesktop),
        paddingLeft: device === "mobile" ? paddingLeftMobile : (device === "tablet" ? paddingLeftTablet : paddingLeftDesktop)
      } as React.CSSProperties & Record<string, string | undefined>}
    >
      <div
        className="p-0"
        style={{
          backgroundColor: useBox ? boxColor : "transparent",
          borderRadius: useBox ? activeBoxRadius : "0",
          border: useBox ? "var(--box-border, 1px solid var(--border))" : "none",
          boxShadow: useBox ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none",
          backgroundImage: boxBackgroundImage,
          backgroundSize: useBox && boxBgImage ? (hasBoxOverlay ? `cover, ${boxBgSize}` : boxBgSize) : undefined,
          backgroundPosition: useBox && boxBgImage ? (hasBoxOverlay ? `center, ${boxBgPosition}` : boxBgPosition) : undefined,
          backgroundRepeat: useBox && boxBgImage ? (hasBoxOverlay ? `no-repeat, ${boxBgRepeat}` : boxBgRepeat) : undefined,
          backgroundAttachment: useBox && boxBgImage ? (hasBoxOverlay ? `scroll, ${boxBgAttachment}` : boxBgAttachment) : undefined,
          paddingTop: useBox ? activeBoxPt : "0px",
          paddingRight: useBox ? activeBoxPr : "0px",
          paddingBottom: useBox ? activeBoxPb : "0px",
          paddingLeft: useBox ? activeBoxPl : "0px",
        }}
      >
        <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {(cfg.showTitle !== false) && (
            <h3 className="font-bold border-b border-[color:var(--border,#e5e7eb)] flex items-center theme-widget-title" style={{ marginBottom: currentBlockTitleMb, paddingBottom: currentBlockTitlePb }}>
              <div className="widget-title-bar" style={{ borderRadius: globalRadius, backgroundColor: currentBlockTitleBorder }}></div>
              <span style={{ color: currentBlockTitleColor, fontSize: currentBlockTitleFs, lineHeight: currentBlockTitleLh }}>{cfg.title || "Hero Slider"}</span>
            </h3>
          )}
          <div className="overflow-hidden" style={{ borderRadius: globalRadius }}>
            <div className="flex" style={{ transform: `translateX(-${activeIndex * 100}%)`, transition: `transform ${transitionMs}ms ease` }}>
          {slides.map((post, idx) => {
            const imageUrl = post.image || post.featuredImage?.fileUrl;
            const isVideo = String((post as any)?.type || "").toUpperCase() === "VIDEO";
            const postLink = post.category ? `/${post.category.slug}/${post.slug}` : `/post/${post.slug}`;
            const displayCategory = post.archiveDisplayCategory || post.category;
            const dateVal = post.publishedAt || post.createdAt;
            const authorName = getAuthorName(post);
            const isInitialSlide = idx === 0;
            return (
              <article key={post.id || `${block.id}-${idx}`} className="hsl-wrap relative overflow-hidden transition-all ease-out shrink-0 w-full" style={{ transitionDuration: `${transitionMs}ms`, height: currentImageHeight }}>
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    quality={75}
                    priority={isInitialSlide}
                    fetchPriority={isInitialSlide ? "high" : undefined}
                    loading={isInitialSlide ? "eager" : "lazy"}
                    sizes="100vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[color:var(--bg-surface,#f9fafb)] flex items-center justify-center [color:var(--muted-text,var(--home-meta-color,#9ca3af))] text-xs">No Image</div>
                )}
                {isVideo && (
                  <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-7 w-7 translate-x-[0.5px]">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                )}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(to top, rgba(0,0,0,${overlayOpacity / 100}), rgba(0,0,0,${(overlayOpacity / 100) * 0.45}) 45%, rgba(0,0,0,0) 100%)`,
                  }}
                />
                {showCategory && displayCategory && (
                  <span className="hsl-category absolute top-3 left-3 z-10 font-bold uppercase tracking-wide px-2 py-1" style={{ color: categoryLabelColor, backgroundColor: categoryLabelBgColor, borderRadius: categoryLabelRadius, fontSize: currentCategoryLabelFs, lineHeight: currentCategoryLabelLh }}>
                    {displayCategory.name}
                  </span>
                )}

                <div
                  className="absolute inset-x-0 bottom-0 text-white"
                  style={{
                    paddingTop: heroContentPaddingTop,
                    paddingRight: heroContentPaddingRight,
                    paddingBottom: heroContentPaddingBottom,
                    paddingLeft: heroContentPaddingLeft,
                  }}
                >
                  <h4 className="mb-2.5">
                    <Link
                      href={postLink}
                      className="transition-colors duration-300"
                      style={{ fontSize: currentTitleFs, color: currentTitleColor, lineHeight: currentTitleLh, fontWeight: currentTitleFw }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = currentTitleHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = currentTitleColor; }}
                    >
                      {post.title}
                    </Link>
                  </h4>
                  {showMetaInfo && (showAuthor || showDate) && (
                    <div className="text-xs flex items-center gap-3 mb-2 font-medium" style={{ color: currentMetaColor, fontSize: currentMetaFs, lineHeight: currentMetaLh }}>
                      {showAuthor && authorName && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="rounded-full flex items-center justify-center relative overflow-hidden shrink-0"
                            style={{ width: "1.5em", height: "1.5em", fontSize: "0.92em", backgroundColor: "color-mix(in oklab, white 16%, transparent)" }}
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
                      {showAuthor && authorName && showDate && dateVal && <span className="rounded-full shrink-0" style={{ width: "0.42em", height: "0.42em", backgroundColor: "currentColor", opacity: 0.6 }} />}
                      {showDate && dateVal && (
                        <div className="flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 shrink-0" style={{ width: "1.22em", height: "1.22em" }}>
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
                  {showExcerpt && (
                    <p className="text-sm max-w-3xl" style={{ color: currentExcerptColor, fontSize: currentExcerptFs, lineHeight: currentExcerptLh }}>
                      {clampExcerpt(getExcerptSource(post, excerptLength), excerptLength)}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
            </div>
          </div>

          {showArrows && slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 md:left-3 top-[52%] md:top-1/2 -translate-y-1/2 z-10 w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-full bg-black/45 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white flex items-center justify-center border border-[var(--accent)]/45 hover:border-[var(--accent)] shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                aria-label="Slide sebelumnya"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="block w-4 h-4 md:w-5 md:h-5" fill="none">
                  <path d="M14.5 5.5L8.5 12L14.5 18.5" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 md:right-3 top-[52%] md:top-1/2 -translate-y-1/2 z-10 w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-full bg-black/45 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white flex items-center justify-center border border-[var(--accent)]/45 hover:border-[var(--accent)] shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                aria-label="Slide berikutnya"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="block w-4 h-4 md:w-5 md:h-5" fill="none">
                  <path d="M9.5 5.5L15.5 12L9.5 18.5" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        {showMiniThumbnails && slides.length > 1 && (
          <div className="mt-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max pr-1">
            {thumbnailStrip.map((post, idx) => {
              const imageUrl = post.image || post.featuredImage?.fileUrl;
              const isActive = idx === activeIndex;
              return (
                <button
                  key={`${block.id}-thumb-${idx}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative overflow-hidden border transition-all duration-300 ${isActive ? "border-[var(--accent)] ring-2 ring-[color:var(--accent)/0.35]" : "border-[var(--border)] hover:border-[var(--accent)]/60"}`}
                  style={{ height: thumbImageHeight, width: thumbItemWidth, minWidth: "110px", borderRadius: globalRadius }}
                  aria-label={`Pilih slide ${idx + 1}`}
                >
                  {imageUrl ? (
                    <Image src={imageUrl} alt={post.title} fill className={`object-cover transition-transform duration-500 ${isActive ? "scale-105" : "hover:scale-105"}`} sizes="(max-width: 768px) 50vw, 25vw" />
                  ) : (
                    <div className="absolute inset-0 bg-[color:var(--bg-surface,#f9fafb)] flex items-center justify-center [color:var(--muted-text,var(--home-meta-color,#9ca3af))] text-[10px]">No Image</div>
                  )}
                  <div className={`absolute inset-0 transition-colors duration-300 ${isActive ? "bg-black/20" : "bg-black/35 hover:bg-black/20"}`} />
                </button>
              );
            })}
            </div>
          </div>
        )}

        {showDots && slides.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={`${block.id}-dot-${idx}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${idx === activeIndex ? "w-6 opacity-100" : "w-2.5 hover:opacity-60"}`}
                style={idx === activeIndex
                  ? {
                      backgroundColor: activeDotColor,
                      boxShadow: `0 0 0 2px color-mix(in srgb, ${activeDotColor} 35%, transparent)`,
                    }
                  : {
                      backgroundColor: inactiveDotColor,
                      opacity: 0.7,
                    }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
