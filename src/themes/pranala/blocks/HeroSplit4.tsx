"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBool, getResponsiveBoolValues, getResponsiveValues } from "./responsive";
import { sanitizeCssUrl } from "@/lib/sanitizer";

type HeroSplitPost = {
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

type HeroSplitConfig = {
  title?: string;
  showTitle?: boolean;
  limit?: number;
  offset?: number;
  miniCount?: number;
  miniColumns?: number;
  tabletMiniColumns?: number;
  mobileMiniColumns?: number;
  showMiniImage?: boolean;
  showCategory?: boolean;
  showHeroCategory?: boolean;
  showMiniCategory?: boolean;
  showMetaInfo?: boolean;
  showHeroMetaInfo?: boolean;
  showMiniMetaInfo?: boolean;
  showAuthor?: boolean;
  showHeroAuthor?: boolean;
  showMiniAuthor?: boolean;
  showDate?: boolean;
  showHeroDate?: boolean;
  showMiniDate?: boolean;
  showExcerpt?: boolean;
  showHeroExcerpt?: boolean;
  showMiniExcerpt?: boolean;
  excerptLength?: number;
  heroExcerptLength?: number;
  miniExcerptLength?: number;
  imageHeight?: number | string;
  tabletImageHeight?: number | string;
  mobileImageHeight?: number | string;
  miniImageHeight?: number | string;
  tabletMiniImageHeight?: number | string;
  mobileMiniImageHeight?: number | string;
  titleColor?: string;
  tabletTitleColor?: string;
  mobileTitleColor?: string;
  titleHoverColor?: string;
  tabletTitleHoverColor?: string;
  mobileTitleHoverColor?: string;
  titleFontSize?: number | string;
  tabletTitleFontSize?: number | string;
  mobileTitleFontSize?: number | string;
  leadTitleFontSize?: number | string;
  tabletLeadTitleFontSize?: number | string;
  mobileLeadTitleFontSize?: number | string;
  miniTitleFontSize?: number | string;
  tabletMiniTitleFontSize?: number | string;
  mobileMiniTitleFontSize?: number | string;
  heroTitleLineHeight?: number | string;
  tabletHeroTitleLineHeight?: number | string;
  mobileHeroTitleLineHeight?: number | string;
  heroTitleFontWeight?: number | string;
  tabletHeroTitleFontWeight?: number | string;
  mobileHeroTitleFontWeight?: number | string;
  metaColor?: string;
  tabletMetaColor?: string;
  mobileMetaColor?: string;
  excerptColor?: string;
  tabletExcerptColor?: string;
  mobileExcerptColor?: string;
  categoryLabelColor?: string;
  categoryLabelBgColor?: string;
  heroTitleColor?: string;
  tabletHeroTitleColor?: string;
  mobileHeroTitleColor?: string;
  heroTitleHoverColor?: string;
  tabletHeroTitleHoverColor?: string;
  mobileHeroTitleHoverColor?: string;
  miniTitleColor?: string;
  tabletMiniTitleColor?: string;
  mobileMiniTitleColor?: string;
  miniTitleHoverColor?: string;
  tabletMiniTitleHoverColor?: string;
  mobileMiniTitleHoverColor?: string;
  miniTitleLineHeight?: number | string;
  tabletMiniTitleLineHeight?: number | string;
  mobileMiniTitleLineHeight?: number | string;
  miniTitleFontWeight?: number | string;
  tabletMiniTitleFontWeight?: number | string;
  mobileMiniTitleFontWeight?: number | string;
  heroMetaColor?: string;
  tabletHeroMetaColor?: string;
  mobileHeroMetaColor?: string;
  heroMetaFontSize?: number | string;
  tabletHeroMetaFontSize?: number | string;
  mobileHeroMetaFontSize?: number | string;
  miniMetaColor?: string;
  tabletMiniMetaColor?: string;
  mobileMiniMetaColor?: string;
  miniMetaFontSize?: number | string;
  tabletMiniMetaFontSize?: number | string;
  mobileMiniMetaFontSize?: number | string;
  heroExcerptColor?: string;
  tabletHeroExcerptColor?: string;
  mobileHeroExcerptColor?: string;
  heroExcerptFontSize?: number | string;
  tabletHeroExcerptFontSize?: number | string;
  mobileHeroExcerptFontSize?: number | string;
  heroExcerptLineHeight?: number | string;
  tabletHeroExcerptLineHeight?: number | string;
  mobileHeroExcerptLineHeight?: number | string;
  miniExcerptColor?: string;
  tabletMiniExcerptColor?: string;
  mobileMiniExcerptColor?: string;
  miniExcerptFontSize?: number | string;
  tabletMiniExcerptFontSize?: number | string;
  mobileMiniExcerptFontSize?: number | string;
  miniExcerptLineHeight?: number | string;
  tabletMiniExcerptLineHeight?: number | string;
  mobileMiniExcerptLineHeight?: number | string;
  heroCategoryLabelColor?: string;
  tabletHeroCategoryLabelColor?: string;
  mobileHeroCategoryLabelColor?: string;
  heroCategoryLabelBgColor?: string;
  tabletHeroCategoryLabelBgColor?: string;
  mobileHeroCategoryLabelBgColor?: string;
  heroCategoryLabelFontSize?: number | string;
  tabletHeroCategoryLabelFontSize?: number | string;
  mobileHeroCategoryLabelFontSize?: number | string;
  heroCategoryLabelLineHeight?: number | string;
  tabletHeroCategoryLabelLineHeight?: number | string;
  mobileHeroCategoryLabelLineHeight?: number | string;
  miniCategoryLabelColor?: string;
  tabletMiniCategoryLabelColor?: string;
  mobileMiniCategoryLabelColor?: string;
  miniCategoryLabelBgColor?: string;
  tabletMiniCategoryLabelBgColor?: string;
  mobileMiniCategoryLabelBgColor?: string;
  miniCategoryLabelFontSize?: number | string;
  tabletMiniCategoryLabelFontSize?: number | string;
  mobileMiniCategoryLabelFontSize?: number | string;
  miniCategoryLabelLineHeight?: number | string;
  tabletMiniCategoryLabelLineHeight?: number | string;
  mobileMiniCategoryLabelLineHeight?: number | string;
  blockTitleColor?: string;
  tabletBlockTitleColor?: string;
  mobileBlockTitleColor?: string;
  blockTitleBorderColor?: string;
  tabletBlockTitleBorderColor?: string;
  mobileBlockTitleBorderColor?: string;
  blockTitleFontSize?: number | string;
  tabletBlockTitleFontSize?: number | string;
  mobileBlockTitleFontSize?: number | string;
  blockTitleLineHeight?: number | string;
  tabletBlockTitleLineHeight?: number | string;
  mobileBlockTitleLineHeight?: number | string;
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

interface HeroSplit4Props {
  block: {
    id: string;
    config?: HeroSplitConfig;
  };
  posts?: HeroSplitPost[];
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

const toRadius = (value: unknown, fallback: string) => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string" && value.trim() !== "") return value;
  return fallback;
};

const toFontWeight = (value: unknown, fallback: string) => {
  if (typeof value === "number") return `${value}`;
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  return fallback;
};

const _toBool = (value: unknown, fallback: boolean) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "1") return true;
    if (v === "false" || v === "0") return false;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
};

const clampExcerpt = (excerpt: string | null | undefined, maxLength: number) => {
  if (!excerpt) return "";
  const clean = excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  if (maxLength <= 1) return clean.slice(0, Math.max(0, maxLength));
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
};

const getExcerptSource = (post: HeroSplitPost, maxLength: number) => {
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

const formatShortDateId = (value?: string | Date | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
};

const normalizeHexLike = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/\s+/g, "");
};

const isOneOf = (value: unknown, candidates: string[]) => {
  const normalized = normalizeHexLike(value);
  return normalized !== "" && candidates.includes(normalized);
};

export default function HeroSplit4({ block, posts = [] }: HeroSplit4Props) {
  const cfg = block.config || {};
  const configRecord = cfg as Record<string, unknown>;
  const offset = Math.max(0, toNumber(cfg.offset, 0));
  const miniCount = 4;
  const [device, setDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isPublicDarkMode, setIsPublicDarkMode] = React.useState(false);

  React.useEffect(() => {
    const computeDevice = () => {
      const width = window.innerWidth;
      if (width >= 1025) return "desktop";
      if (width >= 768) return "tablet";
      return "mobile";
    };
    const updateDevice = () => setDevice(computeDevice());
    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const applyMode = () => setIsPublicDarkMode(root.classList.contains("public-dark"));
    applyMode();

    const observer = new MutationObserver(applyMode);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const limitDesktop = Math.max(1, Math.min(5, toNumber(cfg.limit, 5)));
  const limitTablet = Math.max(1, Math.min(5, toNumber((cfg as any).tabletLimit, limitDesktop)));
  const limitMobile = Math.max(1, Math.min(5, toNumber((cfg as any).mobileLimit, limitDesktop)));
  const activeLimit = device === "mobile" ? limitMobile : device === "tablet" ? limitTablet : limitDesktop;
  const data = posts.slice(offset, offset + activeLimit);

  if (data.length === 0) {
    return (
      <div id={`hero-split-4-${block.id}`} className="p-4 rounded-lg border border-[var(--border)] text-sm [color:var(--muted-text,var(--home-meta-color,#9ca3af))]">
        Belum ada berita untuk ditampilkan.
      </div>
    );
  }

  const lead = data[0];
  const minis = data.slice(1, 1 + miniCount);
  const showCategoryDesktop = getResponsiveBool(configRecord, "showCategory", "desktop", true);
  const showCategoryTablet = getResponsiveBool(configRecord, "showCategory", "tablet", true);
  const showCategoryMobile = getResponsiveBool(configRecord, "showCategory", "mobile", true);
  const showHeroCategoryDesktop = getResponsiveBool(configRecord, "showHeroCategory", "desktop", showCategoryDesktop);
  const showHeroCategoryTablet = getResponsiveBool(configRecord, "showHeroCategory", "tablet", showCategoryTablet);
  const showHeroCategoryMobile = getResponsiveBool(configRecord, "showHeroCategory", "mobile", showCategoryMobile);
  const showMiniCategoryDesktop = getResponsiveBool(configRecord, "showMiniCategory", "desktop", showCategoryDesktop);
  const showMiniCategoryTablet = getResponsiveBool(configRecord, "showMiniCategory", "tablet", showCategoryTablet);
  const showMiniCategoryMobile = getResponsiveBool(configRecord, "showMiniCategory", "mobile", showCategoryMobile);
  const showMetaInfoDesktop = getResponsiveBool(configRecord, "showMetaInfo", "desktop", getResponsiveBool(configRecord, "showMeta", "desktop", true));
  const showMetaInfoTablet = getResponsiveBool(configRecord, "showMetaInfo", "tablet", getResponsiveBool(configRecord, "showMeta", "tablet", true));
  const showMetaInfoMobile = getResponsiveBool(configRecord, "showMetaInfo", "mobile", getResponsiveBool(configRecord, "showMeta", "mobile", true));
  const showHeroMetaInfoDesktop = getResponsiveBool(configRecord, "showHeroMetaInfo", "desktop", showMetaInfoDesktop);
  const showHeroMetaInfoTablet = getResponsiveBool(configRecord, "showHeroMetaInfo", "tablet", showMetaInfoTablet);
  const showHeroMetaInfoMobile = getResponsiveBool(configRecord, "showHeroMetaInfo", "mobile", showMetaInfoMobile);
  const showMiniMetaInfoDesktop = getResponsiveBool(configRecord, "showMiniMetaInfo", "desktop", showMetaInfoDesktop);
  const showMiniMetaInfoTablet = getResponsiveBool(configRecord, "showMiniMetaInfo", "tablet", showMetaInfoTablet);
  const showMiniMetaInfoMobile = getResponsiveBool(configRecord, "showMiniMetaInfo", "mobile", showMetaInfoMobile);
  const showAuthorDesktop = getResponsiveBool(configRecord, "showAuthor", "desktop", true);
  const showAuthorTablet = getResponsiveBool(configRecord, "showAuthor", "tablet", true);
  const showAuthorMobile = getResponsiveBool(configRecord, "showAuthor", "mobile", true);
  const showHeroAuthorDesktop = getResponsiveBool(configRecord, "showHeroAuthor", "desktop", showAuthorDesktop);
  const showHeroAuthorTablet = getResponsiveBool(configRecord, "showHeroAuthor", "tablet", showAuthorTablet);
  const showHeroAuthorMobile = getResponsiveBool(configRecord, "showHeroAuthor", "mobile", showAuthorMobile);
  const showMiniAuthorDesktop = getResponsiveBool(configRecord, "showMiniAuthor", "desktop", showAuthorDesktop);
  const showMiniAuthorTablet = getResponsiveBool(configRecord, "showMiniAuthor", "tablet", showAuthorTablet);
  const showMiniAuthorMobile = getResponsiveBool(configRecord, "showMiniAuthor", "mobile", showAuthorMobile);
  const showDateDesktop = getResponsiveBool(configRecord, "showDate", "desktop", true);
  const showDateTablet = getResponsiveBool(configRecord, "showDate", "tablet", true);
  const showDateMobile = getResponsiveBool(configRecord, "showDate", "mobile", true);
  const showHeroDateDesktop = getResponsiveBool(configRecord, "showHeroDate", "desktop", showDateDesktop);
  const showHeroDateTablet = getResponsiveBool(configRecord, "showHeroDate", "tablet", showDateTablet);
  const showHeroDateMobile = getResponsiveBool(configRecord, "showHeroDate", "mobile", showDateMobile);
  const showMiniDateDesktop = getResponsiveBool(configRecord, "showMiniDate", "desktop", showDateDesktop);
  const showMiniDateTablet = getResponsiveBool(configRecord, "showMiniDate", "tablet", showDateTablet);
  const showMiniDateMobile = getResponsiveBool(configRecord, "showMiniDate", "mobile", showDateMobile);
  const showExcerptDesktop = getResponsiveBool(configRecord, "showExcerpt", "desktop", true);
  const showExcerptTablet = getResponsiveBool(configRecord, "showExcerpt", "tablet", true);
  const showExcerptMobile = getResponsiveBool(configRecord, "showExcerpt", "mobile", true);
  const showHeroExcerptDesktop = getResponsiveBool(configRecord, "showHeroExcerpt", "desktop", showExcerptDesktop);
  const showHeroExcerptTablet = getResponsiveBool(configRecord, "showHeroExcerpt", "tablet", showExcerptTablet);
  const showHeroExcerptMobile = getResponsiveBool(configRecord, "showHeroExcerpt", "mobile", showExcerptMobile);
  const showMiniExcerptDesktop = getResponsiveBool(configRecord, "showMiniExcerpt", "desktop", false);
  const showMiniExcerptTablet = getResponsiveBool(configRecord, "showMiniExcerpt", "tablet", showExcerptTablet);
  const showMiniExcerptMobile = getResponsiveBool(configRecord, "showMiniExcerpt", "mobile", showExcerptMobile);
  const showMiniImage = cfg.showMiniImage !== false;
  const excerptLength = toNumber(cfg.excerptLength, 120);
  const heroExcerptLength = toNumber(cfg.heroExcerptLength ?? cfg.excerptLength, excerptLength);
  const miniExcerptLength = toNumber(cfg.miniExcerptLength, 120);
  const miniColsDesktop = Math.max(1, Math.min(4, toNumber(cfg.miniColumns, 4)));
  const miniColsTablet = Math.max(1, Math.min(3, toNumber(cfg.tabletMiniColumns, 2)));
  const leadImageHMobile = toSize(cfg.mobileImageHeight ?? cfg.imageHeight, "240px");
  const leadImageHTablet = toSize(cfg.tabletImageHeight ?? cfg.imageHeight, "300px");
  const leadImageHDesktop = toSize(cfg.imageHeight, "360px");
  const miniImageHMobile = toSize(cfg.mobileMiniImageHeight ?? cfg.miniImageHeight, "88px");
  const miniImageHTablet = toSize(cfg.tabletMiniImageHeight ?? cfg.miniImageHeight, "96px");
  const miniImageHDesktop = toSize(cfg.miniImageHeight, "100px");

  const titleColorMobile = (cfg.mobileTitleColor as string) || (cfg.titleColor as string) || "var(--home-news-title-color, var(--fg-primary, #f8fafc))";
  const titleHoverMobile = (cfg.mobileTitleHoverColor as string) || (cfg.titleHoverColor as string) || "var(--home-hover-color, var(--accent))";
  const titleColorTablet = (cfg.tabletTitleColor as string) || titleColorMobile;
  const titleColorDesktop = (cfg.titleColor as string) || titleColorTablet;
  const titleHoverTablet = (cfg.tabletTitleHoverColor as string) || titleHoverMobile;
  const titleHoverDesktop = (cfg.titleHoverColor as string) || titleHoverTablet;
  const hasHeroTitleSizeConfig = cfg.leadTitleFontSize !== undefined || cfg.tabletLeadTitleFontSize !== undefined || cfg.mobileLeadTitleFontSize !== undefined;
  const hasHeroTitleColorConfig = cfg.heroTitleColor !== undefined || cfg.tabletHeroTitleColor !== undefined || cfg.mobileHeroTitleColor !== undefined;
  const hasHeroTitleHoverConfig = cfg.heroTitleHoverColor !== undefined || cfg.tabletHeroTitleHoverColor !== undefined || cfg.mobileHeroTitleHoverColor !== undefined;
  const hasHeroMetaColorConfig = cfg.heroMetaColor !== undefined || cfg.tabletHeroMetaColor !== undefined || cfg.mobileHeroMetaColor !== undefined;
  const hasHeroMetaFontSizeConfig = cfg.heroMetaFontSize !== undefined || cfg.tabletHeroMetaFontSize !== undefined || cfg.mobileHeroMetaFontSize !== undefined;
  const hasHeroExcerptColorConfig = cfg.heroExcerptColor !== undefined || cfg.tabletHeroExcerptColor !== undefined || cfg.mobileHeroExcerptColor !== undefined;
  const hasHeroExcerptFontSizeConfig = cfg.heroExcerptFontSize !== undefined || cfg.tabletHeroExcerptFontSize !== undefined || cfg.mobileHeroExcerptFontSize !== undefined;
  const hasHeroExcerptLineHeightConfig = cfg.heroExcerptLineHeight !== undefined || cfg.tabletHeroExcerptLineHeight !== undefined || cfg.mobileHeroExcerptLineHeight !== undefined;
  const hasHeroCategoryTextConfig = cfg.heroCategoryLabelColor !== undefined || cfg.tabletHeroCategoryLabelColor !== undefined || cfg.mobileHeroCategoryLabelColor !== undefined;
  const hasHeroCategoryBgConfig = cfg.heroCategoryLabelBgColor !== undefined || cfg.tabletHeroCategoryLabelBgColor !== undefined || cfg.mobileHeroCategoryLabelBgColor !== undefined;
  const hasHeroCategoryFontSizeConfig = cfg.heroCategoryLabelFontSize !== undefined || cfg.tabletHeroCategoryLabelFontSize !== undefined || cfg.mobileHeroCategoryLabelFontSize !== undefined;
  const hasMiniTitleSizeConfig = cfg.miniTitleFontSize !== undefined || cfg.tabletMiniTitleFontSize !== undefined || cfg.mobileMiniTitleFontSize !== undefined;
  const hasMiniTitleColorConfig = cfg.miniTitleColor !== undefined || cfg.tabletMiniTitleColor !== undefined || cfg.mobileMiniTitleColor !== undefined;
  const hasMiniTitleHoverConfig = cfg.miniTitleHoverColor !== undefined || cfg.tabletMiniTitleHoverColor !== undefined || cfg.mobileMiniTitleHoverColor !== undefined;
  const hasMiniMetaColorConfig = cfg.miniMetaColor !== undefined || cfg.tabletMiniMetaColor !== undefined || cfg.mobileMiniMetaColor !== undefined;
  const hasMiniMetaFontSizeConfig = cfg.miniMetaFontSize !== undefined || cfg.tabletMiniMetaFontSize !== undefined || cfg.mobileMiniMetaFontSize !== undefined;
  const hasMiniExcerptColorConfig = cfg.miniExcerptColor !== undefined || cfg.tabletMiniExcerptColor !== undefined || cfg.mobileMiniExcerptColor !== undefined;
  const hasMiniExcerptFontSizeConfig = cfg.miniExcerptFontSize !== undefined || cfg.tabletMiniExcerptFontSize !== undefined || cfg.mobileMiniExcerptFontSize !== undefined;
  const hasMiniExcerptLineHeightConfig = cfg.miniExcerptLineHeight !== undefined || cfg.tabletMiniExcerptLineHeight !== undefined || cfg.mobileMiniExcerptLineHeight !== undefined;
  const hasMiniCategoryTextConfig = cfg.miniCategoryLabelColor !== undefined || cfg.tabletMiniCategoryLabelColor !== undefined || cfg.mobileMiniCategoryLabelColor !== undefined;
  const hasMiniCategoryBgConfig = cfg.miniCategoryLabelBgColor !== undefined || cfg.tabletMiniCategoryLabelBgColor !== undefined || cfg.mobileMiniCategoryLabelBgColor !== undefined;
  const hasMiniCategoryFontSizeConfig = cfg.miniCategoryLabelFontSize !== undefined || cfg.tabletMiniCategoryLabelFontSize !== undefined || cfg.mobileMiniCategoryLabelFontSize !== undefined;
  const heroTitleColorMobile = hasHeroTitleColorConfig
    ? ((cfg.mobileHeroTitleColor as string) || (cfg.heroTitleColor as string) || titleColorMobile)
    : titleColorMobile;
  const heroTitleColorTablet = hasHeroTitleColorConfig
    ? ((cfg.tabletHeroTitleColor as string) || (cfg.heroTitleColor as string) || heroTitleColorMobile)
    : titleColorTablet;
  const heroTitleColorDesktop = hasHeroTitleColorConfig
    ? ((cfg.heroTitleColor as string) || heroTitleColorTablet)
    : titleColorDesktop;
  const heroTitleHoverMobile = hasHeroTitleHoverConfig
    ? ((cfg.mobileHeroTitleHoverColor as string) || (cfg.heroTitleHoverColor as string) || titleHoverMobile)
    : titleHoverMobile;
  const heroTitleHoverTablet = hasHeroTitleHoverConfig
    ? ((cfg.tabletHeroTitleHoverColor as string) || (cfg.heroTitleHoverColor as string) || heroTitleHoverMobile)
    : titleHoverTablet;
  const heroTitleHoverDesktop = hasHeroTitleHoverConfig
    ? ((cfg.heroTitleHoverColor as string) || heroTitleHoverTablet)
    : titleHoverDesktop;
  const miniTitleColorMobile = hasMiniTitleColorConfig
    ? ((cfg.mobileMiniTitleColor as string) || (cfg.miniTitleColor as string) || "var(--home-news-title-color, var(--fg-primary, #f8fafc))")
    : titleColorMobile;
  const miniTitleColorTablet = hasMiniTitleColorConfig
    ? ((cfg.tabletMiniTitleColor as string) || (cfg.miniTitleColor as string) || miniTitleColorMobile)
    : ((cfg.tabletTitleColor as string) || titleColorMobile);
  const miniTitleColorDesktop = hasMiniTitleColorConfig
    ? ((cfg.miniTitleColor as string) || miniTitleColorTablet)
    : ((cfg.titleColor as string) || miniTitleColorTablet);
  const miniTitleHoverMobile = hasMiniTitleHoverConfig
    ? ((cfg.mobileMiniTitleHoverColor as string) || (cfg.miniTitleHoverColor as string) || "var(--home-hover-color, var(--accent))")
    : titleHoverMobile;
  const miniTitleHoverTablet = hasMiniTitleHoverConfig
    ? ((cfg.tabletMiniTitleHoverColor as string) || (cfg.miniTitleHoverColor as string) || miniTitleHoverMobile)
    : ((cfg.tabletTitleHoverColor as string) || miniTitleHoverMobile);
  const miniTitleHoverDesktop = hasMiniTitleHoverConfig
    ? ((cfg.miniTitleHoverColor as string) || miniTitleHoverTablet)
    : ((cfg.titleHoverColor as string) || miniTitleHoverTablet);

  const leadTitleFsMobile = hasHeroTitleSizeConfig
    ? toSize(cfg.mobileLeadTitleFontSize ?? cfg.leadTitleFontSize, "24px")
    : toSize(cfg.mobileTitleFontSize ?? cfg.titleFontSize, "24px");
  const leadTitleFsTablet = hasHeroTitleSizeConfig
    ? toSize(cfg.tabletLeadTitleFontSize ?? cfg.leadTitleFontSize, "30px")
    : toSize(cfg.tabletTitleFontSize ?? cfg.titleFontSize, "30px");
  const leadTitleFsDesktop = hasHeroTitleSizeConfig
    ? toSize(cfg.leadTitleFontSize, "36px")
    : toSize(cfg.titleFontSize, "36px");
  const heroTitleLhMobile = `${toNumber(cfg.mobileHeroTitleLineHeight ?? cfg.heroTitleLineHeight, 1.2)}`;
  const heroTitleLhTablet = `${toNumber(cfg.tabletHeroTitleLineHeight ?? cfg.heroTitleLineHeight, 1.2)}`;
  const heroTitleLhDesktop = `${toNumber(cfg.heroTitleLineHeight, 1.2)}`;
  const heroTitleFwMobile = toFontWeight(cfg.mobileHeroTitleFontWeight ?? cfg.heroTitleFontWeight, "800");
  const heroTitleFwTablet = toFontWeight(cfg.tabletHeroTitleFontWeight ?? cfg.heroTitleFontWeight, "800");
  const heroTitleFwDesktop = toFontWeight(cfg.heroTitleFontWeight, "800");

  const miniTitleFsMobile = hasMiniTitleSizeConfig
    ? toSize(cfg.mobileMiniTitleFontSize ?? cfg.miniTitleFontSize, "15px")
    : toSize(cfg.mobileTitleFontSize ?? cfg.titleFontSize, "15px");
  const miniTitleFsTablet = hasMiniTitleSizeConfig
    ? toSize(cfg.tabletMiniTitleFontSize ?? cfg.miniTitleFontSize, "16px")
    : toSize(cfg.tabletTitleFontSize ?? cfg.titleFontSize, "16px");
  const miniTitleFsDesktop = hasMiniTitleSizeConfig
    ? toSize(cfg.miniTitleFontSize, "17px")
    : toSize(cfg.titleFontSize, "17px");
  const miniTitleLhMobile = `${toNumber(cfg.mobileMiniTitleLineHeight ?? cfg.miniTitleLineHeight, 1.3)}`;
  const miniTitleLhTablet = `${toNumber(cfg.tabletMiniTitleLineHeight ?? cfg.miniTitleLineHeight, 1.3)}`;
  const miniTitleLhDesktop = `${toNumber(cfg.miniTitleLineHeight, 1.3)}`;
  const miniTitleFwMobile = toFontWeight(cfg.mobileMiniTitleFontWeight ?? cfg.miniTitleFontWeight, "700");
  const miniTitleFwTablet = toFontWeight(cfg.tabletMiniTitleFontWeight ?? cfg.miniTitleFontWeight, "700");
  const miniTitleFwDesktop = toFontWeight(cfg.miniTitleFontWeight, "700");

  const metaColorMobile = (cfg.mobileMetaColor as string) || (cfg.metaColor as string) || "var(--home-meta-color, var(--fg-secondary, #94a3b8))";
  const metaColorTablet = (cfg.tabletMetaColor as string) || metaColorMobile;
  const metaColorDesktop = (cfg.metaColor as string) || metaColorTablet;
  const heroMetaColorMobile = hasHeroMetaColorConfig
    ? ((cfg.mobileHeroMetaColor as string) || (cfg.heroMetaColor as string) || metaColorMobile)
    : metaColorMobile;
  const heroMetaColorTablet = hasHeroMetaColorConfig
    ? ((cfg.tabletHeroMetaColor as string) || (cfg.heroMetaColor as string) || heroMetaColorMobile)
    : metaColorTablet;
  const heroMetaColorDesktop = hasHeroMetaColorConfig
    ? ((cfg.heroMetaColor as string) || heroMetaColorTablet)
    : metaColorDesktop;
  const heroMetaFsMobile = hasHeroMetaFontSizeConfig
    ? toSize(cfg.mobileHeroMetaFontSize ?? cfg.heroMetaFontSize, "12px")
    : toSize(cfg.mobileMetaFontSize ?? cfg.metaFontSize, "12px");
  const heroMetaFsTablet = hasHeroMetaFontSizeConfig
    ? toSize(cfg.tabletHeroMetaFontSize ?? cfg.heroMetaFontSize, "12px")
    : toSize(cfg.tabletMetaFontSize ?? cfg.metaFontSize, "12px");
  const heroMetaFsDesktop = hasHeroMetaFontSizeConfig
    ? toSize(cfg.heroMetaFontSize, "12px")
    : toSize(cfg.metaFontSize, "12px");
  const heroMetaLhMobile = `${toNumber((cfg as any).mobileHeroMetaLineHeight ?? cfg.heroMetaLineHeight ?? cfg.mobileMetaLineHeight ?? cfg.metaLineHeight, 1.4)}`;
  const heroMetaLhTablet = `${toNumber((cfg as any).tabletHeroMetaLineHeight ?? cfg.heroMetaLineHeight ?? cfg.tabletMetaLineHeight ?? cfg.metaLineHeight, 1.4)}`;
  const heroMetaLhDesktop = `${toNumber(cfg.heroMetaLineHeight ?? cfg.metaLineHeight, 1.4)}`;
  const miniMetaColorMobile = hasMiniMetaColorConfig
    ? ((cfg.mobileMiniMetaColor as string) || (cfg.miniMetaColor as string) || metaColorMobile)
    : metaColorMobile;
  const miniMetaColorTablet = hasMiniMetaColorConfig
    ? ((cfg.tabletMiniMetaColor as string) || (cfg.miniMetaColor as string) || miniMetaColorMobile)
    : metaColorTablet;
  const miniMetaColorDesktop = hasMiniMetaColorConfig
    ? ((cfg.miniMetaColor as string) || miniMetaColorTablet)
    : metaColorDesktop;
  const miniMetaFsMobile = hasMiniMetaFontSizeConfig
    ? toSize(cfg.mobileMiniMetaFontSize ?? cfg.miniMetaFontSize, "11px")
    : toSize(cfg.mobileMetaFontSize ?? cfg.metaFontSize, "11px");
  const miniMetaFsTablet = hasMiniMetaFontSizeConfig
    ? toSize(cfg.tabletMiniMetaFontSize ?? cfg.miniMetaFontSize, "11px")
    : toSize(cfg.tabletMetaFontSize ?? cfg.metaFontSize, "11px");
  const miniMetaFsDesktop = hasMiniMetaFontSizeConfig
    ? toSize(cfg.miniMetaFontSize, "11px")
    : toSize(cfg.metaFontSize, "11px");
  const miniMetaLhMobile = `${toNumber((cfg as any).mobileMiniMetaLineHeight ?? cfg.miniMetaLineHeight ?? cfg.mobileMetaLineHeight ?? cfg.metaLineHeight, 1.4)}`;
  const miniMetaLhTablet = `${toNumber((cfg as any).tabletMiniMetaLineHeight ?? cfg.miniMetaLineHeight ?? cfg.tabletMetaLineHeight ?? cfg.metaLineHeight, 1.4)}`;
  const miniMetaLhDesktop = `${toNumber(cfg.miniMetaLineHeight ?? cfg.metaLineHeight, 1.4)}`;

  const excerptColorMobile = (cfg.mobileExcerptColor as string) || (cfg.excerptColor as string) || "var(--home-excerpt-color, var(--fg-secondary, #cbd5e1))";
  const excerptColorTablet = (cfg.tabletExcerptColor as string) || excerptColorMobile;
  const excerptColorDesktop = (cfg.excerptColor as string) || excerptColorTablet;
  const heroExcerptColorMobile = hasHeroExcerptColorConfig
    ? ((cfg.mobileHeroExcerptColor as string) || (cfg.heroExcerptColor as string) || excerptColorMobile)
    : excerptColorMobile;
  const heroExcerptColorTablet = hasHeroExcerptColorConfig
    ? ((cfg.tabletHeroExcerptColor as string) || (cfg.heroExcerptColor as string) || heroExcerptColorMobile)
    : excerptColorTablet;
  const heroExcerptColorDesktop = hasHeroExcerptColorConfig
    ? ((cfg.heroExcerptColor as string) || heroExcerptColorTablet)
    : excerptColorDesktop;
  const heroExcerptFsMobile = hasHeroExcerptFontSizeConfig
    ? toSize(cfg.mobileHeroExcerptFontSize ?? cfg.heroExcerptFontSize, "14px")
    : toSize(cfg.mobileExcerptFontSize ?? cfg.excerptFontSize, "14px");
  const heroExcerptFsTablet = hasHeroExcerptFontSizeConfig
    ? toSize(cfg.tabletHeroExcerptFontSize ?? cfg.heroExcerptFontSize, "14px")
    : toSize(cfg.tabletExcerptFontSize ?? cfg.excerptFontSize, "14px");
  const heroExcerptFsDesktop = hasHeroExcerptFontSizeConfig
    ? toSize(cfg.heroExcerptFontSize, "14px")
    : toSize(cfg.excerptFontSize, "14px");
  const heroExcerptLhMobile = hasHeroExcerptLineHeightConfig
    ? `${toNumber(cfg.mobileHeroExcerptLineHeight ?? cfg.heroExcerptLineHeight, 1.6)}`
    : `${toNumber(cfg.mobileExcerptLineHeight ?? cfg.excerptLineHeight, 1.6)}`;
  const heroExcerptLhTablet = hasHeroExcerptLineHeightConfig
    ? `${toNumber(cfg.tabletHeroExcerptLineHeight ?? cfg.heroExcerptLineHeight, 1.6)}`
    : `${toNumber(cfg.tabletExcerptLineHeight ?? cfg.excerptLineHeight, 1.6)}`;
  const heroExcerptLhDesktop = hasHeroExcerptLineHeightConfig
    ? `${toNumber(cfg.heroExcerptLineHeight, 1.6)}`
    : `${toNumber(cfg.excerptLineHeight, 1.6)}`;
  const miniExcerptColorMobile = hasMiniExcerptColorConfig
    ? ((cfg.mobileMiniExcerptColor as string) || (cfg.miniExcerptColor as string) || excerptColorMobile)
    : excerptColorMobile;
  const miniExcerptColorTablet = hasMiniExcerptColorConfig
    ? ((cfg.tabletMiniExcerptColor as string) || (cfg.miniExcerptColor as string) || miniExcerptColorMobile)
    : excerptColorTablet;
  const miniExcerptColorDesktop = hasMiniExcerptColorConfig
    ? ((cfg.miniExcerptColor as string) || miniExcerptColorTablet)
    : excerptColorDesktop;
  const miniExcerptFsMobile = hasMiniExcerptFontSizeConfig
    ? toSize(cfg.mobileMiniExcerptFontSize ?? cfg.miniExcerptFontSize, "12px")
    : toSize(cfg.mobileExcerptFontSize ?? cfg.excerptFontSize, "12px");
  const miniExcerptFsTablet = hasMiniExcerptFontSizeConfig
    ? toSize(cfg.tabletMiniExcerptFontSize ?? cfg.miniExcerptFontSize, "12px")
    : toSize(cfg.tabletExcerptFontSize ?? cfg.excerptFontSize, "12px");
  const miniExcerptFsDesktop = hasMiniExcerptFontSizeConfig
    ? toSize(cfg.miniExcerptFontSize, "12px")
    : toSize(cfg.excerptFontSize, "12px");
  const miniExcerptLhMobile = hasMiniExcerptLineHeightConfig
    ? `${toNumber(cfg.mobileMiniExcerptLineHeight ?? cfg.miniExcerptLineHeight, 1.5)}`
    : `${toNumber(cfg.mobileExcerptLineHeight ?? cfg.excerptLineHeight, 1.5)}`;
  const miniExcerptLhTablet = hasMiniExcerptLineHeightConfig
    ? `${toNumber(cfg.tabletMiniExcerptLineHeight ?? cfg.miniExcerptLineHeight, 1.5)}`
    : `${toNumber(cfg.tabletExcerptLineHeight ?? cfg.excerptLineHeight, 1.5)}`;
  const miniExcerptLhDesktop = hasMiniExcerptLineHeightConfig
    ? `${toNumber(cfg.miniExcerptLineHeight, 1.5)}`
    : `${toNumber(cfg.excerptLineHeight, 1.5)}`;

  const categoryText = (cfg as any).categoryLabelTextColor || (cfg.categoryLabelColor as string) || (cfg.categoryTextColor as string) || "#ffffff";
  const categoryBg = (cfg.categoryLabelBgColor as string) || (cfg.categoryBgColor as string) || "var(--accent)";
  const heroCategoryTextMobile = hasHeroCategoryTextConfig
    ? ((cfg as any).mobileHeroCategoryLabelTextColor || (cfg.mobileHeroCategoryLabelColor as string) || (cfg as any).heroCategoryLabelTextColor || (cfg.heroCategoryLabelColor as string) || categoryText)
    : categoryText;
  const heroCategoryTextTablet = hasHeroCategoryTextConfig
    ? ((cfg as any).tabletHeroCategoryLabelTextColor || (cfg.tabletHeroCategoryLabelColor as string) || (cfg as any).heroCategoryLabelTextColor || (cfg.heroCategoryLabelColor as string) || heroCategoryTextMobile)
    : ((cfg as any).tabletCategoryLabelTextColor || (cfg.tabletCategoryLabelColor as string) || categoryText);
  const heroCategoryTextDesktop = hasHeroCategoryTextConfig
    ? ((cfg as any).heroCategoryLabelTextColor || (cfg.heroCategoryLabelColor as string) || heroCategoryTextTablet)
    : ((cfg as any).categoryLabelTextColor || (cfg.categoryLabelColor as string) || heroCategoryTextTablet);
  const heroCategoryBgMobile = hasHeroCategoryBgConfig
    ? ((cfg.mobileHeroCategoryLabelBgColor as string) || (cfg.heroCategoryLabelBgColor as string) || categoryBg)
    : categoryBg;
  const heroCategoryBgTablet = hasHeroCategoryBgConfig
    ? ((cfg.tabletHeroCategoryLabelBgColor as string) || (cfg.heroCategoryLabelBgColor as string) || heroCategoryBgMobile)
    : ((cfg.tabletCategoryLabelBgColor as string) || categoryBg);
  const heroCategoryBgDesktop = hasHeroCategoryBgConfig
    ? ((cfg.heroCategoryLabelBgColor as string) || heroCategoryBgTablet)
    : ((cfg.categoryLabelBgColor as string) || heroCategoryBgTablet);
  const heroCategoryFsMobile = hasHeroCategoryFontSizeConfig
    ? toSize(cfg.mobileHeroCategoryLabelFontSize ?? cfg.heroCategoryLabelFontSize, "10px")
    : toSize(cfg.mobileCategoryLabelFontSize ?? cfg.categoryLabelFontSize, "10px");
  const heroCategoryFsTablet = hasHeroCategoryFontSizeConfig
    ? toSize(cfg.tabletHeroCategoryLabelFontSize ?? cfg.heroCategoryLabelFontSize, "10px")
    : toSize(cfg.tabletCategoryLabelFontSize ?? cfg.categoryLabelFontSize, "10px");
  const heroCategoryFsDesktop = hasHeroCategoryFontSizeConfig
    ? toSize(cfg.heroCategoryLabelFontSize, "10px")
    : toSize(cfg.categoryLabelFontSize, "10px");
  const heroCategoryLhMobile = `${toNumber((cfg as any).mobileHeroCategoryLabelLineHeight ?? cfg.heroCategoryLabelLineHeight ?? cfg.mobileCategoryLabelLineHeight ?? cfg.categoryLabelLineHeight, 1.2)}`;
  const heroCategoryLhTablet = `${toNumber((cfg as any).tabletHeroCategoryLabelLineHeight ?? cfg.heroCategoryLabelLineHeight ?? cfg.tabletCategoryLabelLineHeight ?? cfg.categoryLabelLineHeight, 1.2)}`;
  const heroCategoryLhDesktop = `${toNumber(cfg.heroCategoryLabelLineHeight ?? cfg.categoryLabelLineHeight, 1.2)}`;
  const miniCategoryTextMobile = hasMiniCategoryTextConfig
    ? ((cfg as any).mobileMiniCategoryLabelTextColor || (cfg.mobileMiniCategoryLabelColor as string) || (cfg as any).miniCategoryLabelTextColor || (cfg.miniCategoryLabelColor as string) || categoryText)
    : categoryText;
  const miniCategoryTextTablet = hasMiniCategoryTextConfig
    ? ((cfg as any).tabletMiniCategoryLabelTextColor || (cfg.tabletMiniCategoryLabelColor as string) || (cfg as any).miniCategoryLabelTextColor || (cfg.miniCategoryLabelColor as string) || miniCategoryTextMobile)
    : ((cfg as any).tabletCategoryLabelTextColor || (cfg.tabletCategoryLabelColor as string) || categoryText);
  const miniCategoryTextDesktop = hasMiniCategoryTextConfig
    ? ((cfg as any).miniCategoryLabelTextColor || (cfg.miniCategoryLabelColor as string) || miniCategoryTextTablet)
    : ((cfg as any).categoryLabelTextColor || (cfg.categoryLabelColor as string) || miniCategoryTextTablet);
  const miniCategoryBgMobile = hasMiniCategoryBgConfig
    ? ((cfg.mobileMiniCategoryLabelBgColor as string) || (cfg.miniCategoryLabelBgColor as string) || categoryBg)
    : categoryBg;
  const miniCategoryBgTablet = hasMiniCategoryBgConfig
    ? ((cfg.tabletMiniCategoryLabelBgColor as string) || (cfg.miniCategoryLabelBgColor as string) || miniCategoryBgMobile)
    : ((cfg.tabletCategoryLabelBgColor as string) || categoryBg);
  const miniCategoryBgDesktop = hasMiniCategoryBgConfig
    ? ((cfg.miniCategoryLabelBgColor as string) || miniCategoryBgTablet)
    : ((cfg.categoryLabelBgColor as string) || miniCategoryBgTablet);
  const miniCategoryFsMobile = hasMiniCategoryFontSizeConfig
    ? toSize(cfg.mobileMiniCategoryLabelFontSize ?? cfg.miniCategoryLabelFontSize, "9px")
    : toSize(cfg.mobileCategoryLabelFontSize ?? cfg.categoryLabelFontSize, "9px");
  const miniCategoryFsTablet = hasMiniCategoryFontSizeConfig
    ? toSize(cfg.tabletMiniCategoryLabelFontSize ?? cfg.miniCategoryLabelFontSize, "9px")
    : toSize(cfg.tabletCategoryLabelFontSize ?? cfg.categoryLabelFontSize, "9px");
  const miniCategoryFsDesktop = hasMiniCategoryFontSizeConfig
    ? toSize(cfg.miniCategoryLabelFontSize, "9px")
    : toSize(cfg.categoryLabelFontSize, "9px");
  const miniCategoryLhMobile = `${toNumber((cfg as any).mobileMiniCategoryLabelLineHeight ?? cfg.miniCategoryLabelLineHeight ?? cfg.mobileCategoryLabelLineHeight ?? cfg.categoryLabelLineHeight, 1.2)}`;
  const miniCategoryLhTablet = `${toNumber((cfg as any).tabletMiniCategoryLabelLineHeight ?? cfg.miniCategoryLabelLineHeight ?? cfg.tabletCategoryLabelLineHeight ?? cfg.categoryLabelLineHeight, 1.2)}`;
  const miniCategoryLhDesktop = `${toNumber(cfg.miniCategoryLabelLineHeight ?? cfg.categoryLabelLineHeight, 1.2)}`;
  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const useBoxDesktop = useBoxValues.desktop;
  const useBoxTablet = useBoxValues.tablet;
  const useBoxMobile = useBoxValues.mobile;
  const boxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = boxColorValues.desktop || "transparent";
  const boxColorTablet = boxColorValues.tablet || boxColorDesktop;
  const boxColorMobile = boxColorValues.mobile || boxColorDesktop;
  const boxBgImageDesktop = sanitizeCssUrl(typeof cfg.backgroundImage === "string" ? cfg.backgroundImage : "");
  const boxBgImageTablet = sanitizeCssUrl(
    typeof cfg.tabletBackgroundImage === "string" && cfg.tabletBackgroundImage.trim() !== "" ? cfg.tabletBackgroundImage : boxBgImageDesktop
  );
  const boxBgImageMobile = sanitizeCssUrl(
    typeof cfg.mobileBackgroundImage === "string" && cfg.mobileBackgroundImage.trim() !== "" ? cfg.mobileBackgroundImage : boxBgImageDesktop
  );
  const boxBgSizeDesktop = typeof cfg.backgroundSize === "string" && cfg.backgroundSize.trim() !== "" ? cfg.backgroundSize.trim() : "cover";
  const boxBgSizeTablet = typeof cfg.tabletBackgroundSize === "string" && cfg.tabletBackgroundSize.trim() !== "" ? cfg.tabletBackgroundSize.trim() : boxBgSizeDesktop;
  const boxBgSizeMobile = typeof cfg.mobileBackgroundSize === "string" && cfg.mobileBackgroundSize.trim() !== "" ? cfg.mobileBackgroundSize.trim() : boxBgSizeDesktop;
  const boxBgPositionDesktop = typeof cfg.backgroundPosition === "string" && cfg.backgroundPosition.trim() !== "" ? cfg.backgroundPosition.trim() : "center";
  const boxBgPositionTablet = typeof cfg.tabletBackgroundPosition === "string" && cfg.tabletBackgroundPosition.trim() !== "" ? cfg.tabletBackgroundPosition.trim() : boxBgPositionDesktop;
  const boxBgPositionMobile = typeof cfg.mobileBackgroundPosition === "string" && cfg.mobileBackgroundPosition.trim() !== "" ? cfg.mobileBackgroundPosition.trim() : boxBgPositionDesktop;
  const boxBgRepeatDesktop = typeof cfg.backgroundRepeat === "string" && cfg.backgroundRepeat.trim() !== "" ? cfg.backgroundRepeat.trim() : "no-repeat";
  const boxBgRepeatTablet = typeof cfg.tabletBackgroundRepeat === "string" && cfg.tabletBackgroundRepeat.trim() !== "" ? cfg.tabletBackgroundRepeat.trim() : boxBgRepeatDesktop;
  const boxBgRepeatMobile = typeof cfg.mobileBackgroundRepeat === "string" && cfg.mobileBackgroundRepeat.trim() !== "" ? cfg.mobileBackgroundRepeat.trim() : boxBgRepeatDesktop;
  const boxBgAttachmentDesktop = typeof cfg.backgroundAttachment === "string" && cfg.backgroundAttachment.trim() !== "" ? cfg.backgroundAttachment.trim() : "scroll";
  const boxBgAttachmentTablet = typeof cfg.tabletBackgroundAttachment === "string" && cfg.tabletBackgroundAttachment.trim() !== "" ? cfg.tabletBackgroundAttachment.trim() : boxBgAttachmentDesktop;
  const boxBgAttachmentMobile = typeof cfg.mobileBackgroundAttachment === "string" && cfg.mobileBackgroundAttachment.trim() !== "" ? cfg.mobileBackgroundAttachment.trim() : boxBgAttachmentDesktop;
  const boxOverlayColorDesktop = typeof cfg.backgroundOverlayColor === "string" ? cfg.backgroundOverlayColor : "transparent";
  const boxOverlayColorTablet = typeof cfg.tabletBackgroundOverlayColor === "string" && cfg.tabletBackgroundOverlayColor.trim() !== "" ? cfg.tabletBackgroundOverlayColor : boxOverlayColorDesktop;
  const boxOverlayColorMobile = typeof cfg.mobileBackgroundOverlayColor === "string" && cfg.mobileBackgroundOverlayColor.trim() !== "" ? cfg.mobileBackgroundOverlayColor : boxOverlayColorDesktop;
  const boxOverlayOpacityDesktop = Math.min(100, Math.max(0, Number(cfg.backgroundOverlayOpacity ?? 45) || 0));
  const boxOverlayOpacityTablet = Math.min(100, Math.max(0, Number(cfg.tabletBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const boxOverlayOpacityMobile = Math.min(100, Math.max(0, Number(cfg.mobileBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const globalRadius = "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))";
  const boxRadiusDesktop = toRadius(cfg.boxBorderRadius, globalRadius);
  const boxRadiusTablet = toRadius(cfg.tabletBoxBorderRadius, boxRadiusDesktop);
  const boxRadiusMobile = toRadius(cfg.mobileBoxBorderRadius, boxRadiusDesktop);
  const boxPtMobile = cfg.mobileBoxPaddingTop !== undefined ? `${toNumber(cfg.mobileBoxPaddingTop, 0)}px` : (cfg.boxPaddingTop !== undefined ? `${toNumber(cfg.boxPaddingTop, 0)}px` : "0px");
  const boxPrMobile = cfg.mobileBoxPaddingRight !== undefined ? `${toNumber(cfg.mobileBoxPaddingRight, 0)}px` : (cfg.boxPaddingRight !== undefined ? `${toNumber(cfg.boxPaddingRight, 0)}px` : "0px");
  const boxPbMobile = cfg.mobileBoxPaddingBottom !== undefined ? `${toNumber(cfg.mobileBoxPaddingBottom, 0)}px` : (cfg.boxPaddingBottom !== undefined ? `${toNumber(cfg.boxPaddingBottom, 0)}px` : "0px");
  const boxPlMobile = cfg.mobileBoxPaddingLeft !== undefined ? `${toNumber(cfg.mobileBoxPaddingLeft, 0)}px` : (cfg.boxPaddingLeft !== undefined ? `${toNumber(cfg.boxPaddingLeft, 0)}px` : "0px");
  const boxPtTablet = cfg.tabletBoxPaddingTop !== undefined ? `${toNumber(cfg.tabletBoxPaddingTop, 0)}px` : (cfg.boxPaddingTop !== undefined ? `${toNumber(cfg.boxPaddingTop, 0)}px` : boxPtMobile);
  const boxPrTablet = cfg.tabletBoxPaddingRight !== undefined ? `${toNumber(cfg.tabletBoxPaddingRight, 0)}px` : (cfg.boxPaddingRight !== undefined ? `${toNumber(cfg.boxPaddingRight, 0)}px` : boxPrMobile);
  const boxPbTablet = cfg.tabletBoxPaddingBottom !== undefined ? `${toNumber(cfg.tabletBoxPaddingBottom, 0)}px` : (cfg.boxPaddingBottom !== undefined ? `${toNumber(cfg.boxPaddingBottom, 0)}px` : boxPbMobile);
  const boxPlTablet = cfg.tabletBoxPaddingLeft !== undefined ? `${toNumber(cfg.tabletBoxPaddingLeft, 0)}px` : (cfg.boxPaddingLeft !== undefined ? `${toNumber(cfg.boxPaddingLeft, 0)}px` : boxPlMobile);
  const boxPtDesktop = cfg.boxPaddingTop !== undefined ? `${toNumber(cfg.boxPaddingTop, 0)}px` : boxPtTablet;
  const boxPrDesktop = cfg.boxPaddingRight !== undefined ? `${toNumber(cfg.boxPaddingRight, 0)}px` : boxPrTablet;
  const boxPbDesktop = cfg.boxPaddingBottom !== undefined ? `${toNumber(cfg.boxPaddingBottom, 0)}px` : boxPbTablet;
  const boxPlDesktop = cfg.boxPaddingLeft !== undefined ? `${toNumber(cfg.boxPaddingLeft, 0)}px` : boxPlTablet;
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
  const paddingFallbackMobile = useBoxMobile ? "var(--box-padding, 1.5rem)" : "0px";
  const paddingFallbackTablet = useBoxTablet ? "var(--box-padding, 1.5rem)" : "0px";
  const paddingFallbackDesktop = useBoxDesktop ? "var(--box-padding, 1.5rem)" : "0px";
  const basePaddingTop = cfg.paddingTop !== undefined ? `${toNumber(cfg.paddingTop, 0)}px` : undefined;
  const basePaddingRight = cfg.paddingRight !== undefined ? `${toNumber(cfg.paddingRight, 0)}px` : undefined;
  const basePaddingBottom = cfg.paddingBottom !== undefined ? `${toNumber(cfg.paddingBottom, 0)}px` : undefined;
  const basePaddingLeft = cfg.paddingLeft !== undefined ? `${toNumber(cfg.paddingLeft, 0)}px` : undefined;
  const pTopMobile = cfg.mobilePaddingTop !== undefined ? `${toNumber(cfg.mobilePaddingTop, 0)}px` : (basePaddingTop ?? paddingFallbackMobile);
  const pRightMobile = cfg.mobilePaddingRight !== undefined ? `${toNumber(cfg.mobilePaddingRight, 0)}px` : (basePaddingRight ?? paddingFallbackMobile);
  const pBottomMobile = cfg.mobilePaddingBottom !== undefined ? `${toNumber(cfg.mobilePaddingBottom, 0)}px` : (basePaddingBottom ?? paddingFallbackMobile);
  const pLeftMobile = cfg.mobilePaddingLeft !== undefined ? `${toNumber(cfg.mobilePaddingLeft, 0)}px` : (basePaddingLeft ?? paddingFallbackMobile);
  const pTopTablet = cfg.tabletPaddingTop !== undefined ? `${toNumber(cfg.tabletPaddingTop, 0)}px` : (basePaddingTop ?? paddingFallbackTablet);
  const pRightTablet = cfg.tabletPaddingRight !== undefined ? `${toNumber(cfg.tabletPaddingRight, 0)}px` : (basePaddingRight ?? paddingFallbackTablet);
  const pBottomTablet = cfg.tabletPaddingBottom !== undefined ? `${toNumber(cfg.tabletPaddingBottom, 0)}px` : (basePaddingBottom ?? paddingFallbackTablet);
  const pLeftTablet = cfg.tabletPaddingLeft !== undefined ? `${toNumber(cfg.tabletPaddingLeft, 0)}px` : (basePaddingLeft ?? paddingFallbackTablet);
  const pTopDesktop = basePaddingTop ?? paddingFallbackDesktop;
  const pRightDesktop = basePaddingRight ?? paddingFallbackDesktop;
  const pBottomDesktop = basePaddingBottom ?? paddingFallbackDesktop;
  const pLeftDesktop = basePaddingLeft ?? paddingFallbackDesktop;

  const getLink = (post: HeroSplitPost) => post.category ? `/${post.category.slug}/${post.slug}` : `/post/${post.slug}`;
  const leadImage = lead.image || lead.featuredImage?.fileUrl;
  const isLeadVideo = String((lead as any)?.type || "").toUpperCase() === "VIDEO";
  const getAuthorName = (post: HeroSplitPost) => {
    if (typeof post.author === "string" && post.author.trim() !== "") return post.author;
    if (post.author && typeof post.author === "object") {
      if (typeof post.author.name === "string" && post.author.name.trim() !== "") return post.author.name;
      if (typeof post.author.fullName === "string" && post.author.fullName.trim() !== "") return post.author.fullName;
    }
    if (typeof post.authorName === "string" && post.authorName.trim() !== "") return post.authorName;
    return "";
  };
  const leadAuthorName = getAuthorName(lead);
  const currentUseBox = device === "mobile" ? useBoxMobile : (device === "tablet" ? useBoxTablet : useBoxDesktop);
  const currentBoxColor = device === "mobile" ? boxColorMobile : (device === "tablet" ? boxColorTablet : boxColorDesktop);
  const currentBoxBgImage = device === "mobile" ? boxBgImageMobile : (device === "tablet" ? boxBgImageTablet : boxBgImageDesktop);
  const currentBoxBgSize = device === "mobile" ? boxBgSizeMobile : (device === "tablet" ? boxBgSizeTablet : boxBgSizeDesktop);
  const currentBoxBgPosition = device === "mobile" ? boxBgPositionMobile : (device === "tablet" ? boxBgPositionTablet : boxBgPositionDesktop);
  const currentBoxBgRepeat = device === "mobile" ? boxBgRepeatMobile : (device === "tablet" ? boxBgRepeatTablet : boxBgRepeatDesktop);
  const currentBoxBgAttachment = device === "mobile" ? boxBgAttachmentMobile : (device === "tablet" ? boxBgAttachmentTablet : boxBgAttachmentDesktop);
  const currentBoxOverlayColor = device === "mobile" ? boxOverlayColorMobile : (device === "tablet" ? boxOverlayColorTablet : boxOverlayColorDesktop);
  const currentBoxOverlayOpacity = device === "mobile" ? boxOverlayOpacityMobile : (device === "tablet" ? boxOverlayOpacityTablet : boxOverlayOpacityDesktop);
  const hasCurrentBoxOverlay = currentBoxOverlayOpacity > 0 && typeof currentBoxOverlayColor === "string" && currentBoxOverlayColor.trim() !== "" && currentBoxOverlayColor !== "transparent";
  const currentBoxOverlayFill = hasCurrentBoxOverlay ? `color-mix(in srgb, ${currentBoxOverlayColor} ${currentBoxOverlayOpacity}%, transparent)` : "transparent";
  const currentBoxBackgroundImage = currentUseBox && currentBoxBgImage
    ? (hasCurrentBoxOverlay
      ? `linear-gradient(${currentBoxOverlayFill}, ${currentBoxOverlayFill}), url("${currentBoxBgImage}")`
      : `url("${currentBoxBgImage}")`)
    : "none";
  const currentBoxRadius = device === "mobile" ? boxRadiusMobile : (device === "tablet" ? boxRadiusTablet : boxRadiusDesktop);
  const currentBoxPt = device === "mobile" ? boxPtMobile : (device === "tablet" ? boxPtTablet : boxPtDesktop);
  const currentBoxPr = device === "mobile" ? boxPrMobile : (device === "tablet" ? boxPrTablet : boxPrDesktop);
  const currentBoxPb = device === "mobile" ? boxPbMobile : (device === "tablet" ? boxPbTablet : boxPbDesktop);
  const currentBoxPl = device === "mobile" ? boxPlMobile : (device === "tablet" ? boxPlTablet : boxPlDesktop);
  const currentShowHeroCategory = device === "mobile" ? showHeroCategoryMobile : (device === "tablet" ? showHeroCategoryTablet : showHeroCategoryDesktop);
  const currentShowMiniCategory = device === "mobile" ? showMiniCategoryMobile : (device === "tablet" ? showMiniCategoryTablet : showMiniCategoryDesktop);
  const currentShowHeroMetaInfo = device === "mobile" ? showHeroMetaInfoMobile : (device === "tablet" ? showHeroMetaInfoTablet : showHeroMetaInfoDesktop);
  const currentShowMiniMetaInfo = device === "mobile" ? showMiniMetaInfoMobile : (device === "tablet" ? showMiniMetaInfoTablet : showMiniMetaInfoDesktop);
  const currentShowHeroAuthor = device === "mobile" ? showHeroAuthorMobile : (device === "tablet" ? showHeroAuthorTablet : showHeroAuthorDesktop);
  const currentShowMiniAuthor = device === "mobile" ? showMiniAuthorMobile : (device === "tablet" ? showMiniAuthorTablet : showMiniAuthorDesktop);
  const currentShowHeroDate = device === "mobile" ? showHeroDateMobile : (device === "tablet" ? showHeroDateTablet : showHeroDateDesktop);
  const currentShowMiniDate = device === "mobile" ? showMiniDateMobile : (device === "tablet" ? showMiniDateTablet : showMiniDateDesktop);
  const currentShowHeroExcerpt = device === "mobile" ? showHeroExcerptMobile : (device === "tablet" ? showHeroExcerptTablet : showHeroExcerptDesktop);
  const currentShowMiniExcerpt = device === "mobile" ? showMiniExcerptMobile : (device === "tablet" ? showMiniExcerptTablet : showMiniExcerptDesktop);
  const currentHeroCategoryText = device === "mobile" ? heroCategoryTextMobile : (device === "tablet" ? heroCategoryTextTablet : heroCategoryTextDesktop);
  const currentHeroCategoryBg = device === "mobile" ? heroCategoryBgMobile : (device === "tablet" ? heroCategoryBgTablet : heroCategoryBgDesktop);
  const currentHeroCategoryFs = device === "mobile" ? heroCategoryFsMobile : (device === "tablet" ? heroCategoryFsTablet : heroCategoryFsDesktop);
  const currentHeroCategoryLh = device === "mobile" ? heroCategoryLhMobile : (device === "tablet" ? heroCategoryLhTablet : heroCategoryLhDesktop);
  const currentMiniCategoryText = device === "mobile" ? miniCategoryTextMobile : (device === "tablet" ? miniCategoryTextTablet : miniCategoryTextDesktop);
  const currentMiniCategoryBg = device === "mobile" ? miniCategoryBgMobile : (device === "tablet" ? miniCategoryBgTablet : miniCategoryBgDesktop);
  const currentMiniCategoryFs = device === "mobile" ? miniCategoryFsMobile : (device === "tablet" ? miniCategoryFsTablet : miniCategoryFsDesktop);
  const currentMiniCategoryLh = device === "mobile" ? miniCategoryLhMobile : (device === "tablet" ? miniCategoryLhTablet : miniCategoryLhDesktop);
  const currentLeadImageH = device === "mobile" ? leadImageHMobile : (device === "tablet" ? leadImageHTablet : leadImageHDesktop);
  const currentMiniImageH = device === "mobile" ? miniImageHMobile : (device === "tablet" ? miniImageHTablet : miniImageHDesktop);
  const currentHeroTitleColor = device === "mobile" ? heroTitleColorMobile : (device === "tablet" ? heroTitleColorTablet : heroTitleColorDesktop);
  const currentHeroTitleHover = device === "mobile" ? heroTitleHoverMobile : (device === "tablet" ? heroTitleHoverTablet : heroTitleHoverDesktop);
  const currentMiniTitleColor = device === "mobile" ? miniTitleColorMobile : (device === "tablet" ? miniTitleColorTablet : miniTitleColorDesktop);
  const currentMiniTitleHover = device === "mobile" ? miniTitleHoverMobile : (device === "tablet" ? miniTitleHoverTablet : miniTitleHoverDesktop);
  const legacyDarkUnsafeTitleColors = ["#111827", "#1f2937", "#0f172a", "#000000", "#000"];
  const effectiveHeroTitleColor = isPublicDarkMode && isOneOf(currentHeroTitleColor, legacyDarkUnsafeTitleColors)
    ? "var(--fg-primary)"
    : currentHeroTitleColor;
  const effectiveMiniTitleColor = isPublicDarkMode
    ? "#111827"
    : currentMiniTitleColor;
  const currentLeadTitleFs = device === "mobile" ? leadTitleFsMobile : (device === "tablet" ? leadTitleFsTablet : leadTitleFsDesktop);
  const currentLeadTitleLh = device === "mobile" ? heroTitleLhMobile : (device === "tablet" ? heroTitleLhTablet : heroTitleLhDesktop);
  const currentLeadTitleFw = device === "mobile" ? heroTitleFwMobile : (device === "tablet" ? heroTitleFwTablet : heroTitleFwDesktop);
  const currentMiniTitleFs = device === "mobile" ? miniTitleFsMobile : (device === "tablet" ? miniTitleFsTablet : miniTitleFsDesktop);
  const currentMiniTitleLh = device === "mobile" ? miniTitleLhMobile : (device === "tablet" ? miniTitleLhTablet : miniTitleLhDesktop);
  const currentMiniTitleFw = device === "mobile" ? miniTitleFwMobile : (device === "tablet" ? miniTitleFwTablet : miniTitleFwDesktop);
  const currentHeroMetaColor = device === "mobile" ? heroMetaColorMobile : (device === "tablet" ? heroMetaColorTablet : heroMetaColorDesktop);
  const currentHeroMetaFs = device === "mobile" ? heroMetaFsMobile : (device === "tablet" ? heroMetaFsTablet : heroMetaFsDesktop);
  const currentHeroMetaLh = device === "mobile" ? heroMetaLhMobile : (device === "tablet" ? heroMetaLhTablet : heroMetaLhDesktop);
  const currentMiniMetaColor = device === "mobile" ? miniMetaColorMobile : (device === "tablet" ? miniMetaColorTablet : miniMetaColorDesktop);
  const currentMiniMetaFs = device === "mobile" ? miniMetaFsMobile : (device === "tablet" ? miniMetaFsTablet : miniMetaFsDesktop);
  const currentMiniMetaLh = device === "mobile" ? miniMetaLhMobile : (device === "tablet" ? miniMetaLhTablet : miniMetaLhDesktop);
  const currentHeroExcerptColor = device === "mobile" ? heroExcerptColorMobile : (device === "tablet" ? heroExcerptColorTablet : heroExcerptColorDesktop);
  const currentHeroExcerptFs = device === "mobile" ? heroExcerptFsMobile : (device === "tablet" ? heroExcerptFsTablet : heroExcerptFsDesktop);
  const currentHeroExcerptLh = device === "mobile" ? heroExcerptLhMobile : (device === "tablet" ? heroExcerptLhTablet : heroExcerptLhDesktop);
  const currentMiniExcerptColor = device === "mobile" ? miniExcerptColorMobile : (device === "tablet" ? miniExcerptColorTablet : miniExcerptColorDesktop);
  const currentMiniExcerptFs = device === "mobile" ? miniExcerptFsMobile : (device === "tablet" ? miniExcerptFsTablet : miniExcerptFsDesktop);
  const currentMiniExcerptLh = device === "mobile" ? miniExcerptLhMobile : (device === "tablet" ? miniExcerptLhTablet : miniExcerptLhDesktop);
  const currentMiniCols = device === "tablet" ? miniColsTablet : miniColsDesktop;
  const isScrollableMiniMobile = device === "mobile";
  const isCompactMiniMobile = isScrollableMiniMobile;
  const currentMiniGridGap = isCompactMiniMobile ? "0.5rem" : "0.75rem";
  const currentMiniCardPadding = isCompactMiniMobile ? "0.5rem" : "0.75rem";
  const currentMiniMetaGap = isCompactMiniMobile ? "0.25rem" : "0.5rem";
  const currentMiniMetaMarginTop = isCompactMiniMobile ? "0.375rem" : "0.5rem";
  const currentMiniExcerptMarginTop = isCompactMiniMobile ? "0.25rem" : "0.375rem";
  const currentMiniImageHeight = isCompactMiniMobile && cfg.mobileMiniImageHeight === undefined ? "68px" : currentMiniImageH;
  const currentMiniGridAutoFlow = isScrollableMiniMobile ? "column" : "row";
  const currentMiniGridTemplateColumns = isScrollableMiniMobile ? undefined : `repeat(${currentMiniCols}, minmax(0, 1fr))`;
  const currentMiniGridAutoColumns = isScrollableMiniMobile ? `calc((100% - ${currentMiniGridGap}) / 2)` : "auto";
  const currentMiniOverflowX = isScrollableMiniMobile ? "auto" : "visible";
  const currentMiniScrollSnapType = isScrollableMiniMobile ? "x mandatory" : "none";
  const currentMiniCardScrollSnapAlign = isScrollableMiniMobile ? "start" : "none";
  const compactMiniTitleClampStyle = isCompactMiniMobile
    ? ({
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      } as React.CSSProperties)
    : undefined;
  const currentRootPaddingTop = device === "mobile" ? pTopMobile : (device === "tablet" ? pTopTablet : pTopDesktop);
  const currentRootPaddingRight = device === "mobile" ? pRightMobile : (device === "tablet" ? pRightTablet : pRightDesktop);
  const currentRootPaddingBottom = device === "mobile" ? pBottomMobile : (device === "tablet" ? pBottomTablet : pBottomDesktop);
  const currentRootPaddingLeft = device === "mobile" ? pLeftMobile : (device === "tablet" ? pLeftTablet : pLeftDesktop);
  const leadDateValue = lead.publishedAt || lead.createdAt;
  const shouldShowLeadMeta = currentShowHeroMetaInfo && ((currentShowHeroAuthor && !!leadAuthorName) || (currentShowHeroDate && !!leadDateValue));
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
  const currentBlockTitleColor = device === "mobile" ? blockTitleColorMobile : (device === "tablet" ? blockTitleColorTablet : blockTitleColorDesktop);
  const currentBlockTitleBorder = device === "mobile" ? blockTitleBorderMobile : (device === "tablet" ? blockTitleBorderTablet : blockTitleBorderDesktop);
  const currentBlockTitleFs = device === "mobile" ? blockTitleFsMobile : (device === "tablet" ? blockTitleFsTablet : blockTitleFsDesktop);
  const currentBlockTitleLh = device === "mobile" ? blockTitleLhMobile : (device === "tablet" ? blockTitleLhTablet : blockTitleLhDesktop);
  const currentBlockTitleMb = device === "mobile" ? blockTitleMbMobile : (device === "tablet" ? blockTitleMbTablet : blockTitleMbDesktop);
  const currentBlockTitlePb = device === "mobile" ? blockTitlePbMobile : (device === "tablet" ? blockTitlePbTablet : blockTitlePbDesktop);

  return (
    <div
      id={`hero-split-4-${block.id}`}
      className="responsive-block-frame"
      style={{
        "--rb-mt-mobile": mTopMobile,
        "--rb-mr-mobile": mRightMobile,
        "--rb-mb-mobile": mBottomMobile,
        "--rb-ml-mobile": mLeftMobile,
        "--rb-pt-mobile": currentRootPaddingTop,
        "--rb-pr-mobile": currentRootPaddingRight,
        "--rb-pb-mobile": currentRootPaddingBottom,
        "--rb-pl-mobile": currentRootPaddingLeft,
        "--rb-mt-tablet": mTopTablet,
        "--rb-mr-tablet": mRightTablet,
        "--rb-mb-tablet": mBottomTablet,
        "--rb-ml-tablet": mLeftTablet,
        "--rb-pt-tablet": pTopTablet,
        "--rb-pr-tablet": pRightTablet,
        "--rb-pb-tablet": pBottomTablet,
        "--rb-pl-tablet": pLeftTablet,
        "--rb-mt-desktop": mTopDesktop,
        "--rb-mr-desktop": mRightDesktop,
        "--rb-mb-desktop": mBottomDesktop,
        "--rb-ml-desktop": mLeftDesktop,
        "--rb-pt-desktop": pTopDesktop,
        "--rb-pr-desktop": pRightDesktop,
        "--rb-pb-desktop": pBottomDesktop,
        "--rb-pl-desktop": pLeftDesktop
      } as React.CSSProperties}
    >
      <div
        className="p-0"
        style={{
          backgroundColor: currentUseBox ? currentBoxColor : "transparent",
          borderRadius: currentUseBox ? currentBoxRadius : "0",
          border: currentUseBox ? "var(--box-border, 1px solid var(--border))" : "none",
          boxShadow: currentUseBox ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none",
          backgroundImage: currentBoxBackgroundImage,
          backgroundSize: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `cover, ${currentBoxBgSize}` : currentBoxBgSize) : undefined,
          backgroundPosition: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `center, ${currentBoxBgPosition}` : currentBoxBgPosition) : undefined,
          backgroundRepeat: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `no-repeat, ${currentBoxBgRepeat}` : currentBoxBgRepeat) : undefined,
          backgroundAttachment: currentUseBox && currentBoxBgImage ? (hasCurrentBoxOverlay ? `scroll, ${currentBoxBgAttachment}` : currentBoxBgAttachment) : undefined,
          paddingTop: currentUseBox ? currentBoxPt : "0px",
          paddingRight: currentUseBox ? currentBoxPr : "0px",
          paddingBottom: currentUseBox ? currentBoxPb : "0px",
          paddingLeft: currentUseBox ? currentBoxPl : "0px",
        }}
      >
        <div className="grid grid-cols-1 gap-4">
          {cfg.showTitle !== false && (
            <h3 className="font-bold border-b border-[color:var(--border,#e5e7eb)] flex items-center theme-widget-title" style={{ marginBottom: currentBlockTitleMb, paddingBottom: currentBlockTitlePb }}>
              <div className="widget-title-bar" style={{ borderRadius: globalRadius, backgroundColor: currentBlockTitleBorder }}></div>
              <span style={{ color: currentBlockTitleColor, fontSize: currentBlockTitleFs, lineHeight: currentBlockTitleLh }}>{cfg.title || "Hero + 4 Mini"}</span>
            </h3>
          )}
          <article>
            <Link href={getLink(lead)} className="block">
              <div className="hs-lead-image relative overflow-hidden bg-[color:var(--bg-surface,#f9fafb)]" style={{ borderRadius: globalRadius, height: currentLeadImageH }}>
                {leadImage ? (
                  <Image
                    src={leadImage}
                    alt={lead.title}
                    fill
                    className="object-cover"
                    quality={75}
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center [color:var(--muted-text,var(--home-meta-color,#9ca3af))] text-xs">No Image</div>
                )}
                {isLeadVideo && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-8 w-8 translate-x-[0.5px]">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                )}
                {currentShowHeroCategory && lead.category && (
                  <span
                    className="hs-hero-category absolute top-3 left-3 font-bold uppercase tracking-wide px-2 py-1"
                    style={{ borderRadius: globalRadius, color: currentHeroCategoryText, backgroundColor: currentHeroCategoryBg, fontSize: currentHeroCategoryFs, lineHeight: currentHeroCategoryLh }}
                  >
                    {lead.category.name}
                  </span>
                )}
              </div>
            </Link>
            <div className="mt-3">
              <h4 className="hs-lead-title font-extrabold mb-2" style={{ fontSize: currentLeadTitleFs, lineHeight: currentLeadTitleLh, fontWeight: currentLeadTitleFw }}>
                <Link
                  href={getLink(lead)}
                  className="transition-colors"
                  style={{
                    color: effectiveHeroTitleColor,
                    fontSize: currentLeadTitleFs,
                    lineHeight: currentLeadTitleLh,
                    fontWeight: currentLeadTitleFw,
                    fontFamily: "var(--home-news-title-font, sans-serif)",
                    display: "block",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = currentHeroTitleHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = effectiveHeroTitleColor; }}
                >
                  {lead.title}
                </Link>
              </h4>
              {shouldShowLeadMeta && (
                <div className="text-xs flex items-center gap-3 mb-2 font-medium" style={{ color: currentHeroMetaColor, fontSize: currentHeroMetaFs, lineHeight: currentHeroMetaLh }}>
                  {currentShowHeroAuthor && leadAuthorName && (
                    <div className="hs-hero-author flex items-center gap-1.5">
                      <span
                        className="rounded-full flex items-center justify-center relative overflow-hidden shrink-0"
                        style={{ width: "1.5em", height: "1.5em", fontSize: "0.92em", backgroundColor: "color-mix(in oklab, var(--fg-primary) 10%, transparent)" }}
                      >
                        {lead.authorAvatar ? (
                          <Image src={lead.authorAvatar} alt={leadAuthorName} fill className="object-cover" sizes="16px" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="opacity-80" style={{ width: "1em", height: "1em" }}>
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span>{leadAuthorName}</span>
                    </div>
                  )}
                  {currentShowHeroAuthor && leadAuthorName && currentShowHeroDate && leadDateValue && <span className="hs-hero-dot rounded-full shrink-0" style={{ width: "0.42em", height: "0.42em", backgroundColor: "currentColor", opacity: 0.5 }} />}
                  {currentShowHeroDate && leadDateValue && (
                    <div className="hs-hero-date flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="opacity-70 shrink-0" style={{ width: "1.22em", height: "1.22em" }}>
                        <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
                      </svg>
                      <time
                        dateTime={(() => {
                          const raw = lead.publishedAt || lead.createdAt;
                          const d = raw instanceof Date ? raw : new Date(raw || "");
                          return Number.isNaN(d.getTime()) ? "" : d.toISOString();
                        })()}
                      >
                        {formatLongDateId(lead.publishedAt || lead.createdAt)}
                      </time>
                    </div>
                  )}
                </div>
              )}
              {currentShowHeroExcerpt && (
                <p className="text-sm" style={{ color: currentHeroExcerptColor, fontSize: currentHeroExcerptFs, lineHeight: currentHeroExcerptLh }}>
                  {clampExcerpt(getExcerptSource(lead, heroExcerptLength), heroExcerptLength)}
                </p>
              )}
            </div>
          </article>

          <div className="hs-mini-grid" style={{ display: "grid", gridAutoFlow: currentMiniGridAutoFlow, gridAutoColumns: currentMiniGridAutoColumns, gridTemplateColumns: currentMiniGridTemplateColumns, gap: currentMiniGridGap, overflowX: currentMiniOverflowX, overscrollBehaviorX: "contain", WebkitOverflowScrolling: "touch", scrollSnapType: currentMiniScrollSnapType }}>
            {minis.map((post, idx) => {
              const imageUrl = post.image || post.featuredImage?.fileUrl;
              const isVideo = String((post as any)?.type || "").toUpperCase() === "VIDEO";
              const authorName = getAuthorName(post);
              const dateVal = post.publishedAt || post.createdAt;
              const shouldShowMiniMeta = currentShowMiniMetaInfo && ((currentShowMiniAuthor && !!authorName) || (currentShowMiniDate && !!dateVal));
              return (
                <article key={post.id || `${block.id}-mini-${idx}`} className="hs-mini-card border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)]" style={{ borderRadius: globalRadius, scrollSnapAlign: currentMiniCardScrollSnapAlign }}>
                  <Link href={getLink(post)} className="block">
                    {showMiniImage && (
                      <div className="hs-mini-image relative bg-[color:var(--bg-surface,#f9fafb)]" style={{ height: currentMiniImageHeight }}>
                        {imageUrl ? (
                          <Image src={imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 767px) 25vw, (max-width: 1024px) 50vw, 33vw" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center [color:var(--muted-text,var(--home-meta-color,#9ca3af))] text-[10px]">No Image</div>
                        )}
                        {isVideo && (
                          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <span className={`flex items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm ${isCompactMiniMobile ? "h-8 w-8" : "h-11 w-11"}`}>
                              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={`${isCompactMiniMobile ? "h-4 w-4" : "h-6 w-6"} translate-x-[0.5px]`}>
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                  <div style={{ padding: currentMiniCardPadding }}>
                    {currentShowMiniCategory && post.category && (
                      <span
                        className="hs-mini-category inline-block font-bold uppercase tracking-wide px-2 py-0.5"
                        style={{ borderRadius: globalRadius, color: currentMiniCategoryText, backgroundColor: currentMiniCategoryBg, fontSize: currentMiniCategoryFs, lineHeight: currentMiniCategoryLh, marginBottom: isCompactMiniMobile ? "0.375rem" : "0.5rem" }}
                      >
                        {post.category.name}
                      </span>
                    )}
                    <h5 className="hs-mini-title font-bold" style={{ fontSize: currentMiniTitleFs, lineHeight: currentMiniTitleLh, fontWeight: currentMiniTitleFw }}>
                      <Link
                        href={getLink(post)}
                        className="transition-colors"
                        style={{
                          color: effectiveMiniTitleColor,
                          fontSize: currentMiniTitleFs,
                          lineHeight: currentMiniTitleLh,
                          fontWeight: currentMiniTitleFw,
                          fontFamily: "var(--home-news-title-font, sans-serif)",
                          display: "block",
                          ...compactMiniTitleClampStyle,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = currentMiniTitleHover; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = effectiveMiniTitleColor; }}
                      >
                        {post.title}
                      </Link>
                    </h5>
                    {shouldShowMiniMeta && (
                      <div className="text-[11px] flex items-center font-medium" style={{ color: currentMiniMetaColor, fontSize: currentMiniMetaFs, lineHeight: currentMiniMetaLh, gap: currentMiniMetaGap, marginTop: currentMiniMetaMarginTop, flexWrap: "wrap" }}>
                        {currentShowMiniAuthor && authorName && <span className="hs-mini-author">{authorName}</span>}
                        {currentShowMiniAuthor && authorName && currentShowMiniDate && dateVal && <span className="hs-mini-dot rounded-full shrink-0" style={{ width: "0.42em", height: "0.42em", backgroundColor: "currentColor", opacity: 0.5 }} />}
                        {currentShowMiniDate && dateVal && (
                          <time
                            className="hs-mini-date"
                            dateTime={(() => {
                              const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
                              return Number.isNaN(d.getTime()) ? "" : d.toISOString();
                            })()}
                          >
                            {formatShortDateId(dateVal)}
                          </time>
                        )}
                      </div>
                    )}
                    {currentShowMiniExcerpt && (
                      <p className="text-xs" style={{ color: currentMiniExcerptColor, fontSize: currentMiniExcerptFs, lineHeight: currentMiniExcerptLh, marginTop: currentMiniExcerptMarginTop }}>
                        {clampExcerpt(getExcerptSource(post, miniExcerptLength), miniExcerptLength)}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
