"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getResponsiveBool, getResponsiveBoolValues, getResponsiveValues } from "./responsive";

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
  miniCategoryLabelColor?: string;
  tabletMiniCategoryLabelColor?: string;
  mobileMiniCategoryLabelColor?: string;
  miniCategoryLabelBgColor?: string;
  tabletMiniCategoryLabelBgColor?: string;
  mobileMiniCategoryLabelBgColor?: string;
  miniCategoryLabelFontSize?: number | string;
  tabletMiniCategoryLabelFontSize?: number | string;
  mobileMiniCategoryLabelFontSize?: number | string;
  blockTitleColor?: string;
  tabletBlockTitleColor?: string;
  mobileBlockTitleColor?: string;
  blockTitleBorderColor?: string;
  tabletBlockTitleBorderColor?: string;
  mobileBlockTitleBorderColor?: string;
  blockTitleFontSize?: number | string;
  tabletBlockTitleFontSize?: number | string;
  mobileBlockTitleFontSize?: number | string;
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

export default function HeroSplit4({ block, posts = [] }: HeroSplit4Props) {
  const cfg = block.config || {};
  const configRecord = cfg as Record<string, unknown>;
  const limit = 5;
  const offset = Math.max(0, toNumber(cfg.offset, 0));
  const miniCount = 4;
  const data = posts.slice(offset, offset + limit);

  if (data.length === 0) {
    return (
      <div id={`hero-split-4-${block.id}`} className="p-4 rounded-lg border border-[var(--border)] text-sm text-[var(--fg-muted)]">
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
  const showMetaInfoDesktop = getResponsiveBool(configRecord, "showMetaInfo", "desktop", true);
  const showMetaInfoTablet = getResponsiveBool(configRecord, "showMetaInfo", "tablet", true);
  const showMetaInfoMobile = getResponsiveBool(configRecord, "showMetaInfo", "mobile", true);
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
  const showHeroCategoryAny = showHeroCategoryDesktop || showHeroCategoryTablet || showHeroCategoryMobile;
  const showMiniCategoryAny = showMiniCategoryDesktop || showMiniCategoryTablet || showMiniCategoryMobile;
  const showHeroMetaAny =
    (showHeroMetaInfoMobile && (showHeroAuthorMobile || showHeroDateMobile)) ||
    (showHeroMetaInfoTablet && (showHeroAuthorTablet || showHeroDateTablet)) ||
    (showHeroMetaInfoDesktop && (showHeroAuthorDesktop || showHeroDateDesktop));
  const showMiniMetaAny =
    (showMiniMetaInfoMobile && (showMiniAuthorMobile || showMiniDateMobile)) ||
    (showMiniMetaInfoTablet && (showMiniAuthorTablet || showMiniDateTablet)) ||
    (showMiniMetaInfoDesktop && (showMiniAuthorDesktop || showMiniDateDesktop));
  const showHeroAuthorAny = showHeroAuthorMobile || showHeroAuthorTablet || showHeroAuthorDesktop;
  const showHeroDateAny = showHeroDateMobile || showHeroDateTablet || showHeroDateDesktop;
  const showMiniAuthorAny = showMiniAuthorMobile || showMiniAuthorTablet || showMiniAuthorDesktop;
  const showMiniDateAny = showMiniDateMobile || showMiniDateTablet || showMiniDateDesktop;
  const showHeroExcerptAny = showHeroExcerptDesktop || showHeroExcerptTablet || showHeroExcerptMobile;
  const showMiniExcerptAny = showMiniExcerptDesktop || showMiniExcerptTablet || showMiniExcerptMobile;
  const showMiniImage = cfg.showMiniImage !== false;
  const excerptLength = toNumber(cfg.excerptLength, 120);
  const heroExcerptLength = toNumber(cfg.heroExcerptLength ?? cfg.excerptLength, excerptLength);
  const miniExcerptLength = toNumber(cfg.miniExcerptLength, 70);
  const miniColsDesktop = Math.max(1, Math.min(4, toNumber(cfg.miniColumns, 4)));
  const miniColsTablet = Math.max(1, Math.min(3, toNumber(cfg.tabletMiniColumns, 2)));
  const miniColsMobile = Math.max(1, Math.min(2, toNumber(cfg.mobileMiniColumns, 1)));

  const leadImageHMobile = toSize(cfg.mobileImageHeight ?? cfg.imageHeight, "240px");
  const leadImageHTablet = toSize(cfg.tabletImageHeight ?? cfg.imageHeight, "300px");
  const leadImageHDesktop = toSize(cfg.imageHeight, "360px");
  const miniImageHMobile = toSize(cfg.mobileMiniImageHeight ?? cfg.miniImageHeight, "88px");
  const miniImageHTablet = toSize(cfg.tabletMiniImageHeight ?? cfg.miniImageHeight, "96px");
  const miniImageHDesktop = toSize(cfg.miniImageHeight, "100px");

  const titleColorMobile = (cfg.mobileTitleColor as string) || (cfg.titleColor as string) || "var(--home-news-title-color, #111827)";
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
    ? ((cfg.mobileMiniTitleColor as string) || (cfg.miniTitleColor as string) || "var(--home-news-title-color, #111827)")
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

  const metaColorMobile = (cfg.mobileMetaColor as string) || (cfg.metaColor as string) || "var(--home-meta-color, #9ca3af)";
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

  const excerptColorMobile = (cfg.mobileExcerptColor as string) || (cfg.excerptColor as string) || "var(--home-excerpt-color, #4b5563)";
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

  const categoryText = (cfg.categoryLabelColor as string) || (cfg.categoryTextColor as string) || "#ffffff";
  const categoryBg = (cfg.categoryLabelBgColor as string) || (cfg.categoryBgColor as string) || "var(--accent)";
  const heroCategoryTextMobile = hasHeroCategoryTextConfig
    ? ((cfg.mobileHeroCategoryLabelColor as string) || (cfg.heroCategoryLabelColor as string) || categoryText)
    : categoryText;
  const heroCategoryTextTablet = hasHeroCategoryTextConfig
    ? ((cfg.tabletHeroCategoryLabelColor as string) || (cfg.heroCategoryLabelColor as string) || heroCategoryTextMobile)
    : ((cfg.tabletCategoryLabelColor as string) || categoryText);
  const heroCategoryTextDesktop = hasHeroCategoryTextConfig
    ? ((cfg.heroCategoryLabelColor as string) || heroCategoryTextTablet)
    : ((cfg.categoryLabelColor as string) || heroCategoryTextTablet);
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
  const miniCategoryTextMobile = hasMiniCategoryTextConfig
    ? ((cfg.mobileMiniCategoryLabelColor as string) || (cfg.miniCategoryLabelColor as string) || categoryText)
    : categoryText;
  const miniCategoryTextTablet = hasMiniCategoryTextConfig
    ? ((cfg.tabletMiniCategoryLabelColor as string) || (cfg.miniCategoryLabelColor as string) || miniCategoryTextMobile)
    : ((cfg.tabletCategoryLabelColor as string) || categoryText);
  const miniCategoryTextDesktop = hasMiniCategoryTextConfig
    ? ((cfg.miniCategoryLabelColor as string) || miniCategoryTextTablet)
    : ((cfg.categoryLabelColor as string) || miniCategoryTextTablet);
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
  const blockTitleColorMobile = (cfg.mobileBlockTitleColor as string) || (cfg.blockTitleColor as string) || "var(--home-widget-title-color, var(--heading-color, #1e293b))";
  const blockTitleColorTablet = (cfg.tabletBlockTitleColor as string) || blockTitleColorMobile;
  const blockTitleColorDesktop = (cfg.blockTitleColor as string) || blockTitleColorTablet;
  const blockTitleBorderMobile = (cfg.mobileBlockTitleBorderColor as string) || (cfg.blockTitleBorderColor as string) || "var(--accent)";
  const blockTitleBorderTablet = (cfg.tabletBlockTitleBorderColor as string) || blockTitleBorderMobile;
  const blockTitleBorderDesktop = (cfg.blockTitleBorderColor as string) || blockTitleBorderTablet;
  const blockTitleFsMobile = toSize(cfg.mobileBlockTitleFontSize ?? cfg.blockTitleFontSize, "20px");
  const blockTitleFsTablet = toSize(cfg.tabletBlockTitleFontSize ?? cfg.blockTitleFontSize, "22px");
  const blockTitleFsDesktop = toSize(cfg.blockTitleFontSize, "24px");
  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const useBoxDesktop = useBoxValues.desktop;
  const useBoxTablet = useBoxValues.tablet;
  const useBoxMobile = useBoxValues.mobile;
  const boxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = boxColorValues.desktop || "var(--bg-elevated, #ffffff)";
  const boxColorTablet = boxColorValues.tablet || boxColorDesktop;
  const boxColorMobile = boxColorValues.mobile || boxColorDesktop;
  const boxBgImageDesktop = typeof cfg.backgroundImage === "string" ? cfg.backgroundImage.trim() : "";
  const boxBgImageTablet = typeof cfg.tabletBackgroundImage === "string" && cfg.tabletBackgroundImage.trim() !== "" ? cfg.tabletBackgroundImage.trim() : boxBgImageDesktop;
  const boxBgImageMobile = typeof cfg.mobileBackgroundImage === "string" && cfg.mobileBackgroundImage.trim() !== "" ? cfg.mobileBackgroundImage.trim() : boxBgImageDesktop;
  const globalRadius = "var(--home-main-box-radius, 0.75rem)";
  const boxRadiusDesktop = toRadius(cfg.boxBorderRadius, globalRadius);
  const boxRadiusTablet = toRadius(cfg.tabletBoxBorderRadius, boxRadiusDesktop);
  const boxRadiusMobile = toRadius(cfg.mobileBoxBorderRadius, boxRadiusDesktop);
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

  return (
    <div
      id={`hero-split-4-${block.id}`}
      style={{
        backgroundColor: useBoxMobile ? boxColorMobile : "transparent",
        borderRadius: useBoxMobile ? boxRadiusMobile : "0",
        border: useBoxMobile ? "var(--box-border, 1px solid var(--border))" : "none",
        boxShadow: useBoxMobile ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none",
        backgroundImage: useBoxMobile && boxBgImageMobile ? `url(${boxBgImageMobile})` : "none",
        backgroundSize: useBoxMobile && boxBgImageMobile ? "cover" : undefined,
        backgroundPosition: useBoxMobile && boxBgImageMobile ? "center" : undefined,
        backgroundRepeat: useBoxMobile && boxBgImageMobile ? "no-repeat" : undefined
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #hero-split-4-${block.id} .theme-widget-title span { color: ${blockTitleColorMobile}; font-size: ${blockTitleFsMobile}; }
            #hero-split-4-${block.id} .theme-widget-title .widget-title-bar { background-color: ${blockTitleBorderMobile}; }
            #hero-split-4-${block.id} { margin-top: ${mTopMobile} !important; margin-right: ${mRightMobile} !important; margin-bottom: ${mBottomMobile} !important; margin-left: ${mLeftMobile} !important; padding-top: ${pTopMobile} !important; padding-right: ${pRightMobile} !important; padding-bottom: ${pBottomMobile} !important; padding-left: ${pLeftMobile} !important; background-color: ${useBoxMobile ? boxColorMobile : "transparent"} !important; border-radius: ${useBoxMobile ? boxRadiusMobile : "0"} !important; border: ${useBoxMobile ? "var(--box-border, 1px solid var(--border))" : "none"} !important; box-shadow: ${useBoxMobile ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none"} !important; background-image: ${useBoxMobile && boxBgImageMobile ? `url(${boxBgImageMobile})` : "none"} !important; background-size: ${useBoxMobile && boxBgImageMobile ? "cover" : "initial"} !important; background-position: ${useBoxMobile && boxBgImageMobile ? "center" : "initial"} !important; background-repeat: ${useBoxMobile && boxBgImageMobile ? "no-repeat" : "repeat"} !important; }
            #hero-split-4-${block.id} .hs-hero-title-link { color: ${heroTitleColorMobile}; }
            #hero-split-4-${block.id} .hs-hero-title-link:hover { color: ${heroTitleHoverMobile}; }
            #hero-split-4-${block.id} .hs-mini-title-link { color: ${miniTitleColorMobile}; }
            #hero-split-4-${block.id} .hs-mini-title-link:hover { color: ${miniTitleHoverMobile}; }
            #hero-split-4-${block.id} .hs-hero-title-link,
            #hero-split-4-${block.id} .hs-mini-title-link {
              font-size: inherit !important;
              line-height: inherit !important;
              font-weight: inherit !important;
              font-family: inherit !important;
            }
            #hero-split-4-${block.id} .hs-hero-meta { color: ${heroMetaColorMobile}; }
            #hero-split-4-${block.id} .hs-hero-meta { display: ${showHeroMetaInfoMobile ? "flex" : "none"}; }
            #hero-split-4-${block.id} .hs-hero-author { display: ${showHeroAuthorMobile ? "flex" : "none"}; }
            #hero-split-4-${block.id} .hs-hero-dot { display: ${showHeroAuthorMobile && showHeroDateMobile ? "inline-block" : "none"}; }
            #hero-split-4-${block.id} .hs-hero-date { display: ${showHeroDateMobile ? "flex" : "none"}; }
            #hero-split-4-${block.id} .hs-mini-meta { color: ${miniMetaColorMobile}; }
            #hero-split-4-${block.id} .hs-mini-meta { display: ${showMiniMetaInfoMobile ? "flex" : "none"}; }
            #hero-split-4-${block.id} .hs-mini-author { display: ${showMiniAuthorMobile ? "inline" : "none"}; }
            #hero-split-4-${block.id} .hs-mini-dot { display: ${showMiniAuthorMobile && showMiniDateMobile ? "inline-block" : "none"}; }
            #hero-split-4-${block.id} .hs-mini-date { display: ${showMiniDateMobile ? "inline" : "none"}; }
            #hero-split-4-${block.id} .hs-mini-meta { font-size: ${miniMetaFsMobile}; }
            #hero-split-4-${block.id} .hs-hero-excerpt { color: ${heroExcerptColorMobile}; }
            #hero-split-4-${block.id} .hs-hero-excerpt { display: ${showHeroExcerptMobile ? "block" : "none"}; }
            #hero-split-4-${block.id} .hs-hero-excerpt { font-size: ${heroExcerptFsMobile}; }
            #hero-split-4-${block.id} .hs-hero-excerpt { line-height: ${heroExcerptLhMobile}; }
            #hero-split-4-${block.id} .hs-mini-excerpt { color: ${miniExcerptColorMobile}; }
            #hero-split-4-${block.id} .hs-mini-excerpt { display: ${showMiniExcerptMobile ? "block" : "none"}; }
            #hero-split-4-${block.id} .hs-mini-excerpt { font-size: ${miniExcerptFsMobile}; line-height: ${miniExcerptLhMobile}; }
            #hero-split-4-${block.id} .hs-hero-category { color: ${heroCategoryTextMobile}; background-color: ${heroCategoryBgMobile}; }
            #hero-split-4-${block.id} .hs-hero-category { display: ${showHeroCategoryMobile ? "inline-block" : "none"}; }
            #hero-split-4-${block.id} .hs-hero-category { font-size: ${heroCategoryFsMobile}; }
            #hero-split-4-${block.id} .hs-mini-category { color: ${miniCategoryTextMobile}; background-color: ${miniCategoryBgMobile}; }
            #hero-split-4-${block.id} .hs-mini-category { display: ${showMiniCategoryMobile ? "inline-block" : "none"}; }
            #hero-split-4-${block.id} .hs-mini-category { font-size: ${miniCategoryFsMobile}; }
            #hero-split-4-${block.id} .hs-lead-image { height: ${leadImageHMobile}; }
            #hero-split-4-${block.id} .hs-mini-image { height: ${miniImageHMobile}; }
            #hero-split-4-${block.id} .hs-hero-meta { font-size: ${heroMetaFsMobile}; }
            #hero-split-4-${block.id} .hs-lead-title { font-size: ${leadTitleFsMobile}; line-height: ${heroTitleLhMobile}; font-weight: ${heroTitleFwMobile}; }
            #hero-split-4-${block.id} .hs-mini-title { font-size: ${miniTitleFsMobile}; line-height: ${miniTitleLhMobile}; font-weight: ${miniTitleFwMobile}; }
            #hero-split-4-${block.id} .hs-mini-grid { display: grid; grid-auto-flow: row; grid-auto-columns: auto; grid-template-columns: repeat(${miniColsMobile}, minmax(0, 1fr)); gap: 0.75rem; overflow-x: visible; overscroll-behavior-x: contain; -webkit-overflow-scrolling: touch; scroll-snap-type: none; }
            #hero-split-4-${block.id} .hs-mini-grid > article { scroll-snap-align: none; }
            @media (min-width: 768px) {
              #hero-split-4-${block.id} { margin-top: ${mTopTablet} !important; margin-right: ${mRightTablet} !important; margin-bottom: ${mBottomTablet} !important; margin-left: ${mLeftTablet} !important; padding-top: ${pTopTablet} !important; padding-right: ${pRightTablet} !important; padding-bottom: ${pBottomTablet} !important; padding-left: ${pLeftTablet} !important; background-color: ${useBoxTablet ? boxColorTablet : "transparent"} !important; border-radius: ${useBoxTablet ? boxRadiusTablet : "0"} !important; border: ${useBoxTablet ? "var(--box-border, 1px solid var(--border))" : "none"} !important; box-shadow: ${useBoxTablet ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none"} !important; background-image: ${useBoxTablet && boxBgImageTablet ? `url(${boxBgImageTablet})` : "none"} !important; background-size: ${useBoxTablet && boxBgImageTablet ? "cover" : "initial"} !important; background-position: ${useBoxTablet && boxBgImageTablet ? "center" : "initial"} !important; background-repeat: ${useBoxTablet && boxBgImageTablet ? "no-repeat" : "repeat"} !important; }
              #hero-split-4-${block.id} .theme-widget-title span { color: ${blockTitleColorTablet}; font-size: ${blockTitleFsTablet}; }
              #hero-split-4-${block.id} .theme-widget-title .widget-title-bar { background-color: ${blockTitleBorderTablet}; }
              #hero-split-4-${block.id} .hs-hero-title-link { color: ${heroTitleColorTablet}; }
              #hero-split-4-${block.id} .hs-hero-title-link:hover { color: ${heroTitleHoverTablet}; }
              #hero-split-4-${block.id} .hs-mini-title-link { color: ${miniTitleColorTablet}; }
              #hero-split-4-${block.id} .hs-mini-title-link:hover { color: ${miniTitleHoverTablet}; }
              #hero-split-4-${block.id} .hs-hero-meta { color: ${heroMetaColorTablet}; }
              #hero-split-4-${block.id} .hs-hero-meta { display: ${showHeroMetaInfoTablet ? "flex" : "none"}; }
              #hero-split-4-${block.id} .hs-hero-author { display: ${showHeroAuthorTablet ? "flex" : "none"}; }
              #hero-split-4-${block.id} .hs-hero-dot { display: ${showHeroAuthorTablet && showHeroDateTablet ? "inline-block" : "none"}; }
              #hero-split-4-${block.id} .hs-hero-date { display: ${showHeroDateTablet ? "flex" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-meta { color: ${miniMetaColorTablet}; }
              #hero-split-4-${block.id} .hs-mini-meta { display: ${showMiniMetaInfoTablet ? "flex" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-author { display: ${showMiniAuthorTablet ? "inline" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-dot { display: ${showMiniAuthorTablet && showMiniDateTablet ? "inline-block" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-date { display: ${showMiniDateTablet ? "inline" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-meta { font-size: ${miniMetaFsTablet}; }
              #hero-split-4-${block.id} .hs-hero-excerpt { color: ${heroExcerptColorTablet}; }
              #hero-split-4-${block.id} .hs-hero-excerpt { display: ${showHeroExcerptTablet ? "block" : "none"}; }
              #hero-split-4-${block.id} .hs-hero-excerpt { font-size: ${heroExcerptFsTablet}; }
              #hero-split-4-${block.id} .hs-hero-excerpt { line-height: ${heroExcerptLhTablet}; }
              #hero-split-4-${block.id} .hs-mini-excerpt { color: ${miniExcerptColorTablet}; }
              #hero-split-4-${block.id} .hs-mini-excerpt { display: ${showMiniExcerptTablet ? "block" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-excerpt { font-size: ${miniExcerptFsTablet}; line-height: ${miniExcerptLhTablet}; }
              #hero-split-4-${block.id} .hs-hero-category { color: ${heroCategoryTextTablet}; background-color: ${heroCategoryBgTablet}; }
              #hero-split-4-${block.id} .hs-hero-category { display: ${showHeroCategoryTablet ? "inline-block" : "none"}; }
              #hero-split-4-${block.id} .hs-hero-category { font-size: ${heroCategoryFsTablet}; }
              #hero-split-4-${block.id} .hs-mini-category { color: ${miniCategoryTextTablet}; background-color: ${miniCategoryBgTablet}; }
              #hero-split-4-${block.id} .hs-mini-category { display: ${showMiniCategoryTablet ? "inline-block" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-category { font-size: ${miniCategoryFsTablet}; }
              #hero-split-4-${block.id} .hs-lead-image { height: ${leadImageHTablet}; }
              #hero-split-4-${block.id} .hs-mini-image { height: ${miniImageHTablet}; }
              #hero-split-4-${block.id} .hs-hero-meta { font-size: ${heroMetaFsTablet}; }
              #hero-split-4-${block.id} .hs-lead-title { font-size: ${leadTitleFsTablet}; line-height: ${heroTitleLhTablet}; font-weight: ${heroTitleFwTablet}; }
              #hero-split-4-${block.id} .hs-mini-title { font-size: ${miniTitleFsTablet}; line-height: ${miniTitleLhTablet}; font-weight: ${miniTitleFwTablet}; }
              #hero-split-4-${block.id} .hs-mini-grid { grid-auto-flow: row; grid-auto-columns: auto; grid-template-columns: repeat(${miniColsTablet}, minmax(0, 1fr)); overflow-x: visible; scroll-snap-type: none; }
              #hero-split-4-${block.id} .hs-mini-grid > article { scroll-snap-align: none; }
            }
            @media (min-width: 1025px) {
              #hero-split-4-${block.id} { margin-top: ${mTopDesktop} !important; margin-right: ${mRightDesktop} !important; margin-bottom: ${mBottomDesktop} !important; margin-left: ${mLeftDesktop} !important; padding-top: ${pTopDesktop} !important; padding-right: ${pRightDesktop} !important; padding-bottom: ${pBottomDesktop} !important; padding-left: ${pLeftDesktop} !important; background-color: ${useBoxDesktop ? boxColorDesktop : "transparent"} !important; border-radius: ${useBoxDesktop ? boxRadiusDesktop : "0"} !important; border: ${useBoxDesktop ? "var(--box-border, 1px solid var(--border))" : "none"} !important; box-shadow: ${useBoxDesktop ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none"} !important; background-image: ${useBoxDesktop && boxBgImageDesktop ? `url(${boxBgImageDesktop})` : "none"} !important; background-size: ${useBoxDesktop && boxBgImageDesktop ? "cover" : "initial"} !important; background-position: ${useBoxDesktop && boxBgImageDesktop ? "center" : "initial"} !important; background-repeat: ${useBoxDesktop && boxBgImageDesktop ? "no-repeat" : "repeat"} !important; }
              #hero-split-4-${block.id} .theme-widget-title span { color: ${blockTitleColorDesktop}; font-size: ${blockTitleFsDesktop}; }
              #hero-split-4-${block.id} .theme-widget-title .widget-title-bar { background-color: ${blockTitleBorderDesktop}; }
              #hero-split-4-${block.id} .hs-hero-title-link { color: ${heroTitleColorDesktop}; }
              #hero-split-4-${block.id} .hs-hero-title-link:hover { color: ${heroTitleHoverDesktop}; }
              #hero-split-4-${block.id} .hs-mini-title-link { color: ${miniTitleColorDesktop}; }
              #hero-split-4-${block.id} .hs-mini-title-link:hover { color: ${miniTitleHoverDesktop}; }
              #hero-split-4-${block.id} .hs-hero-meta { color: ${heroMetaColorDesktop}; }
              #hero-split-4-${block.id} .hs-hero-meta { display: ${showHeroMetaInfoDesktop ? "flex" : "none"}; }
              #hero-split-4-${block.id} .hs-hero-author { display: ${showHeroAuthorDesktop ? "flex" : "none"}; }
              #hero-split-4-${block.id} .hs-hero-dot { display: ${showHeroAuthorDesktop && showHeroDateDesktop ? "inline-block" : "none"}; }
              #hero-split-4-${block.id} .hs-hero-date { display: ${showHeroDateDesktop ? "flex" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-meta { color: ${miniMetaColorDesktop}; }
              #hero-split-4-${block.id} .hs-mini-meta { display: ${showMiniMetaInfoDesktop ? "flex" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-author { display: ${showMiniAuthorDesktop ? "inline" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-dot { display: ${showMiniAuthorDesktop && showMiniDateDesktop ? "inline-block" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-date { display: ${showMiniDateDesktop ? "inline" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-meta { font-size: ${miniMetaFsDesktop}; }
              #hero-split-4-${block.id} .hs-hero-excerpt { color: ${heroExcerptColorDesktop}; }
              #hero-split-4-${block.id} .hs-hero-excerpt { display: ${showHeroExcerptDesktop ? "block" : "none"}; }
              #hero-split-4-${block.id} .hs-hero-excerpt { font-size: ${heroExcerptFsDesktop}; }
              #hero-split-4-${block.id} .hs-hero-excerpt { line-height: ${heroExcerptLhDesktop}; }
              #hero-split-4-${block.id} .hs-mini-excerpt { color: ${miniExcerptColorDesktop}; }
              #hero-split-4-${block.id} .hs-mini-excerpt { display: ${showMiniExcerptDesktop ? "block" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-excerpt { font-size: ${miniExcerptFsDesktop}; line-height: ${miniExcerptLhDesktop}; }
              #hero-split-4-${block.id} .hs-hero-category { color: ${heroCategoryTextDesktop}; background-color: ${heroCategoryBgDesktop}; }
              #hero-split-4-${block.id} .hs-hero-category { display: ${showHeroCategoryDesktop ? "inline-block" : "none"}; }
              #hero-split-4-${block.id} .hs-hero-category { font-size: ${heroCategoryFsDesktop}; }
              #hero-split-4-${block.id} .hs-mini-category { color: ${miniCategoryTextDesktop}; background-color: ${miniCategoryBgDesktop}; }
              #hero-split-4-${block.id} .hs-mini-category { display: ${showMiniCategoryDesktop ? "inline-block" : "none"}; }
              #hero-split-4-${block.id} .hs-mini-category { font-size: ${miniCategoryFsDesktop}; }
              #hero-split-4-${block.id} .hs-lead-image { height: ${leadImageHDesktop}; }
              #hero-split-4-${block.id} .hs-mini-image { height: ${miniImageHDesktop}; }
              #hero-split-4-${block.id} .hs-hero-meta { font-size: ${heroMetaFsDesktop}; }
              #hero-split-4-${block.id} .hs-lead-title { font-size: ${leadTitleFsDesktop}; line-height: ${heroTitleLhDesktop}; font-weight: ${heroTitleFwDesktop}; }
              #hero-split-4-${block.id} .hs-mini-title { font-size: ${miniTitleFsDesktop}; line-height: ${miniTitleLhDesktop}; font-weight: ${miniTitleFwDesktop}; }
              #hero-split-4-${block.id} .hs-mini-grid { grid-auto-flow: row; grid-auto-columns: auto; grid-template-columns: repeat(${miniColsDesktop}, minmax(0, 1fr)); overflow-x: visible; scroll-snap-type: none; }
              #hero-split-4-${block.id} .hs-mini-grid > article { scroll-snap-align: none; }
            }
          `
        }}
      />

      <div className="p-0">
        <div className="grid grid-cols-1 gap-4">
          <article>
            <Link href={getLink(lead)} className="block">
              <div className="hs-lead-image relative overflow-hidden bg-gray-100" style={{ borderRadius: globalRadius }}>
                {leadImage ? (
                  <Image src={leadImage} alt={lead.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--fg-muted)] text-xs">No Image</div>
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
                {showHeroCategoryAny && lead.category && (
                  <span className="hs-hero-category absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wide px-2 py-1" style={{ borderRadius: globalRadius }}>
                    {lead.category.name}
                  </span>
                )}
              </div>
            </Link>
            <div className="mt-3">
              <h4 className="hs-lead-title font-extrabold mb-2">
                <Link href={getLink(lead)} className="hs-hero-title-link transition-colors">{lead.title}</Link>
              </h4>
              {showHeroMetaAny && (
                <div className="hs-hero-meta text-xs flex items-center gap-3 mb-2 font-medium">
                  {showHeroAuthorAny && leadAuthorName && (
                    <div className="hs-hero-author flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] relative overflow-hidden" style={{ backgroundColor: "color-mix(in oklab, var(--fg-primary) 10%, transparent)" }}>
                        {lead.authorAvatar ? (
                          <Image src={lead.authorAvatar} alt={leadAuthorName} fill className="object-cover" sizes="16px" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 opacity-80">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span>{leadAuthorName}</span>
                    </div>
                  )}
                  {showHeroAuthorAny && leadAuthorName && showHeroDateAny && (lead.publishedAt || lead.createdAt) && <span className="hs-hero-dot w-1 h-1 rounded-full" style={{ backgroundColor: "currentColor", opacity: 0.5 }} />}
                  {showHeroDateAny && (lead.publishedAt || lead.createdAt) && (
                    <div className="hs-hero-date flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
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
              {showHeroExcerptAny && (
                <p className="hs-hero-excerpt text-sm">{clampExcerpt(getExcerptSource(lead, heroExcerptLength), heroExcerptLength)}</p>
              )}
            </div>
          </article>

          <div className="hs-mini-grid">
            {minis.map((post, idx) => {
              const imageUrl = post.image || post.featuredImage?.fileUrl;
              const isVideo = String((post as any)?.type || "").toUpperCase() === "VIDEO";
              const authorName = getAuthorName(post);
              const dateVal = post.publishedAt || post.createdAt;
              return (
                <article key={post.id || `${block.id}-mini-${idx}`} className="hs-mini-card border border-[var(--border)] overflow-hidden bg-[var(--bg-elevated)]" style={{ borderRadius: globalRadius }}>
                  <Link href={getLink(post)} className="block">
                    {showMiniImage && (
                      <div className="hs-mini-image relative bg-gray-100">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={post.title} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 33vw" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[var(--fg-muted)] text-[10px]">No Image</div>
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
                      </div>
                    )}
                  </Link>
                  <div className="p-3">
                    {showMiniCategoryAny && post.category && (
                      <span className="hs-mini-category inline-block mb-2 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5" style={{ borderRadius: globalRadius }}>
                        {post.category.name}
                      </span>
                    )}
                    <h5 className="hs-mini-title font-bold">
                      <Link href={getLink(post)} className="hs-mini-title-link transition-colors">{post.title}</Link>
                    </h5>
                    {showMiniMetaAny && (
                      <div className="hs-mini-meta text-[11px] flex items-center gap-2 mt-2 font-medium">
                        {showMiniAuthorAny && authorName && <span className="hs-mini-author">{authorName}</span>}
                        {showMiniAuthorAny && authorName && showMiniDateAny && dateVal && <span className="hs-mini-dot w-1 h-1 rounded-full" style={{ backgroundColor: "currentColor", opacity: 0.5 }} />}
                        {showMiniDateAny && dateVal && (
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
                    {showMiniExcerptAny && (
                      <p className="hs-mini-excerpt text-xs mt-1.5">{clampExcerpt(getExcerptSource(post, miniExcerptLength), miniExcerptLength)}</p>
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
