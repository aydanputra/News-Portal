"use client";

import React from "react";
import Link from "next/link";
import { getResponsiveBoolValues, getResponsiveValues } from "./responsive";

type BulletListPost = {
  id?: string;
  title: string;
  slug: string;
  category?: { slug: string; name?: string } | null;
};

type BulletListConfig = {
  title?: string;
  showTitle?: boolean;
  limit?: number;
  tabletLimit?: number;
  mobileLimit?: number;
  offset?: number;
  columnCount?: number;
  tabletColumnCount?: number;
  mobileColumnCount?: number;
  listGap?: number;
  tabletListGap?: number;
  mobileListGap?: number;
  titleFontSize?: number | string;
  tabletTitleFontSize?: number | string;
  mobileTitleFontSize?: number | string;
  titleLineHeight?: number | string;
  tabletTitleLineHeight?: number | string;
  mobileTitleLineHeight?: number | string;
  titleMarginBottom?: number;
  tabletTitleMarginBottom?: number;
  mobileTitleMarginBottom?: number;
  titleFontWeight?: string;
  tabletTitleFontWeight?: string;
  mobileTitleFontWeight?: string;
  titleColor?: string;
  tabletTitleColor?: string;
  mobileTitleColor?: string;
  titleHoverColor?: string;
  tabletTitleHoverColor?: string;
  mobileTitleHoverColor?: string;
  bulletColor?: string;
  tabletBulletColor?: string;
  mobileBulletColor?: string;
  bulletSize?: number | string;
  tabletBulletSize?: number | string;
  mobileBulletSize?: number | string;
  blockTitleColor?: string;
  tabletBlockTitleColor?: string;
  mobileBlockTitleColor?: string;
  blockTitleFontSize?: number | string;
  tabletBlockTitleFontSize?: number | string;
  mobileBlockTitleFontSize?: number | string;
  blockTitleBorderColor?: string;
  tabletBlockTitleBorderColor?: string;
  mobileBlockTitleBorderColor?: string;
  blockTitleLineHeight?: number | string;
  tabletBlockTitleLineHeight?: number | string;
  mobileBlockTitleLineHeight?: number | string;
  blockTitleMarginBottom?: number;
  tabletBlockTitleMarginBottom?: number;
  mobileBlockTitleMarginBottom?: number;
  blockTitlePaddingBottom?: number;
  tabletBlockTitlePaddingBottom?: number;
  mobileBlockTitlePaddingBottom?: number;
  useBox?: boolean | string;
  boxColor?: string;
  boxBorderRadius?: string | number;
  boxPaddingTop?: number;
  boxPaddingRight?: number;
  boxPaddingBottom?: number;
  boxPaddingLeft?: number;
  tabletBoxPaddingTop?: number;
  tabletBoxPaddingRight?: number;
  tabletBoxPaddingBottom?: number;
  tabletBoxPaddingLeft?: number;
  mobileBoxPaddingTop?: number;
  mobileBoxPaddingRight?: number;
  mobileBoxPaddingBottom?: number;
  mobileBoxPaddingLeft?: number;
  [key: string]: unknown;
};

interface BulletListProps {
  block: {
    id: string;
    config?: BulletListConfig;
  };
  posts: BulletListPost[];
}

const toNumber = (val: unknown, fallback: number) => {
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string" && val.trim() !== "") {
    const n = Number(val);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
};

const formatSize = (val: unknown, fallback: string) => {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "number" && Number.isFinite(val)) return `${val}px`;
  if (typeof val === "string") {
    const v = val.trim();
    if (!v) return fallback;
    if (/^\d+(\.\d+)?$/.test(v)) return `${v}px`;
    return v;
  }
  return fallback;
};

const toFontWeight = (value: unknown, fallback = "700") => {
  const map: Record<string, string> = {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  };
  if (typeof value !== "string" || !value) return fallback;
  return map[value] || value;
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

export default function BulletList({ block, posts }: BulletListProps) {
  const cfg = block.config || {};
  const [device, setDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop");

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

  const limitDesktop = toNumber(cfg.limit, 6);
  const limitTablet = toNumber(cfg.tabletLimit, limitDesktop);
  const limitMobile = toNumber(cfg.mobileLimit, limitTablet);
  const offset = Math.max(0, toNumber(cfg.offset, 0));
  const maxLimit = Math.max(limitDesktop, limitTablet, limitMobile);
  const visiblePosts = (posts || []).slice(offset, offset + maxLimit);

  const columnDesktop = toNumber(cfg.columnCount, 2) === 2 ? 2 : 1;
  const columnTablet = toNumber(cfg.tabletColumnCount, columnDesktop) === 2 ? 2 : 1;
  const columnMobile = toNumber(cfg.mobileColumnCount, 1) === 2 ? 2 : 1;

  const gapDesktop = formatSize(cfg.listGap, "14px");
  const gapTablet = formatSize(cfg.tabletListGap ?? cfg.listGap, gapDesktop);
  const gapMobile = formatSize(cfg.mobileListGap ?? cfg.listGap, "12px");

  const titleFsDesktop = formatSize(cfg.titleFontSize, "var(--home-news-title-size, 18px)");
  const titleFsTablet = formatSize(cfg.tabletTitleFontSize ?? cfg.titleFontSize, titleFsDesktop);
  const titleFsMobile = formatSize(cfg.mobileTitleFontSize ?? cfg.titleFontSize, "var(--home-news-title-size, 18px)");

  const titleLhDesktop = String(cfg.titleLineHeight ?? "1.35");
  const titleLhTablet = String(cfg.tabletTitleLineHeight ?? cfg.titleLineHeight ?? "1.35");
  const titleLhMobile = String(cfg.mobileTitleLineHeight ?? cfg.titleLineHeight ?? "1.35");
  const titleMbDesktop = cfg.titleMarginBottom !== undefined ? `${cfg.titleMarginBottom}px` : "0.375rem";
  const titleMbTablet = cfg.tabletTitleMarginBottom !== undefined ? `${cfg.tabletTitleMarginBottom}px` : titleMbDesktop;
  const titleMbMobile = cfg.mobileTitleMarginBottom !== undefined ? `${cfg.mobileTitleMarginBottom}px` : titleMbDesktop;

  const titleFwDesktop = toFontWeight(cfg.titleFontWeight, "var(--home-news-title-weight, 600)");
  const titleFwTablet = toFontWeight(cfg.tabletTitleFontWeight ?? cfg.titleFontWeight, titleFwDesktop);
  const titleFwMobile = toFontWeight(cfg.mobileTitleFontWeight ?? cfg.titleFontWeight, titleFwDesktop);

  const titleColorDesktop = (cfg.titleColor as string) || "var(--home-news-title-color, #111827)";
  const titleColorTablet = (cfg.tabletTitleColor as string) || titleColorDesktop;
  const titleColorMobile = (cfg.mobileTitleColor as string) || titleColorDesktop;

  const titleHoverDesktop = (cfg.titleHoverColor as string) || "var(--home-hover-color, var(--accent))";
  const titleHoverTablet = (cfg.tabletTitleHoverColor as string) || titleHoverDesktop;
  const titleHoverMobile = (cfg.mobileTitleHoverColor as string) || titleHoverDesktop;

  const bulletColorDesktop = (cfg.bulletColor as string) || "var(--accent)";
  const bulletColorTablet = (cfg.tabletBulletColor as string) || bulletColorDesktop;
  const bulletColorMobile = (cfg.mobileBulletColor as string) || bulletColorDesktop;
  const bulletSizeDesktop = formatSize(cfg.bulletSize, "16px");
  const bulletSizeTablet = formatSize(cfg.tabletBulletSize ?? cfg.bulletSize, bulletSizeDesktop);
  const bulletSizeMobile = formatSize(cfg.mobileBulletSize ?? cfg.bulletSize, "16px");
  const blockTitleColorDesktop = (cfg.blockTitleColor as string) || "var(--home-widget-title-color, var(--heading-color, #1e293b))";
  const blockTitleColorTablet = (cfg.tabletBlockTitleColor as string) || blockTitleColorDesktop;
  const blockTitleColorMobile = (cfg.mobileBlockTitleColor as string) || blockTitleColorDesktop;
  const blockTitleFsDesktop = formatSize(cfg.blockTitleFontSize, "var(--home-widget-title-size, 24px)");
  const blockTitleFsTablet = formatSize(cfg.tabletBlockTitleFontSize ?? cfg.blockTitleFontSize, blockTitleFsDesktop);
  const blockTitleFsMobile = formatSize(cfg.mobileBlockTitleFontSize ?? cfg.blockTitleFontSize, "var(--home-widget-title-size, 20px)");
  const blockTitleBorderDesktop = (cfg.blockTitleBorderColor as string) || "var(--accent)";
  const blockTitleBorderTablet = (cfg.tabletBlockTitleBorderColor as string) || blockTitleBorderDesktop;
  const blockTitleBorderMobile = (cfg.mobileBlockTitleBorderColor as string) || blockTitleBorderDesktop;
  const blockTitleLhDesktop = String(cfg.blockTitleLineHeight ?? "1.2");
  const blockTitleLhTablet = String(cfg.tabletBlockTitleLineHeight ?? cfg.blockTitleLineHeight ?? "1.2");
  const blockTitleLhMobile = String(cfg.mobileBlockTitleLineHeight ?? cfg.blockTitleLineHeight ?? "1.2");
  const blockTitleMbDesktop = cfg.blockTitleMarginBottom !== undefined ? `${cfg.blockTitleMarginBottom}px` : "12px";
  const blockTitleMbTablet = cfg.tabletBlockTitleMarginBottom !== undefined ? `${cfg.tabletBlockTitleMarginBottom}px` : blockTitleMbDesktop;
  const blockTitleMbMobile = cfg.mobileBlockTitleMarginBottom !== undefined ? `${cfg.mobileBlockTitleMarginBottom}px` : blockTitleMbDesktop;
  const blockTitlePbDesktop = cfg.blockTitlePaddingBottom !== undefined ? `${cfg.blockTitlePaddingBottom}px` : "12px";
  const blockTitlePbTablet = cfg.tabletBlockTitlePaddingBottom !== undefined ? `${cfg.tabletBlockTitlePaddingBottom}px` : blockTitlePbDesktop;
  const blockTitlePbMobile = cfg.mobileBlockTitlePaddingBottom !== undefined ? `${cfg.mobileBlockTitlePaddingBottom}px` : blockTitlePbDesktop;

  const configRecord = cfg as Record<string, unknown>;
  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const useBoxDesktop = useBoxValues.desktop;
  const useBoxTablet = useBoxValues.tablet;
  const useBoxMobile = useBoxValues.mobile;
  const boxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = boxColorValues.desktop || "transparent";
  const boxColorTablet = boxColorValues.tablet || boxColorDesktop;
  const boxColorMobile = boxColorValues.mobile || boxColorDesktop;
  const boxBgImageDesktop = typeof (cfg as any).backgroundImage === "string" ? (cfg as any).backgroundImage : "";
  const boxBgImageTablet = typeof (cfg as any).tabletBackgroundImage === "string" && (cfg as any).tabletBackgroundImage.trim() !== "" ? (cfg as any).tabletBackgroundImage : boxBgImageDesktop;
  const boxBgImageMobile = typeof (cfg as any).mobileBackgroundImage === "string" && (cfg as any).mobileBackgroundImage.trim() !== "" ? (cfg as any).mobileBackgroundImage : boxBgImageDesktop;
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
  const globalRadius = "var(--home-main-box-radius, 0.75rem)";
  const boxRadiusDesktop = resolveRadiusValue(cfg.boxBorderRadius, globalRadius);
  const boxRadiusTablet = resolveRadiusValue(cfg.tabletBoxBorderRadius ?? cfg.boxBorderRadius, boxRadiusDesktop);
  const boxRadiusMobile = resolveRadiusValue(cfg.mobileBoxBorderRadius ?? cfg.boxBorderRadius, boxRadiusDesktop);
  const boxPtBase = cfg.boxPaddingTop !== undefined ? `${cfg.boxPaddingTop}px` : "0px";
  const boxPrBase = cfg.boxPaddingRight !== undefined ? `${cfg.boxPaddingRight}px` : "0px";
  const boxPbBase = cfg.boxPaddingBottom !== undefined ? `${cfg.boxPaddingBottom}px` : "0px";
  const boxPlBase = cfg.boxPaddingLeft !== undefined ? `${cfg.boxPaddingLeft}px` : "0px";
  const boxPtMobile = cfg.mobileBoxPaddingTop !== undefined ? `${cfg.mobileBoxPaddingTop}px` : boxPtBase;
  const boxPrMobile = cfg.mobileBoxPaddingRight !== undefined ? `${cfg.mobileBoxPaddingRight}px` : boxPrBase;
  const boxPbMobile = cfg.mobileBoxPaddingBottom !== undefined ? `${cfg.mobileBoxPaddingBottom}px` : boxPbBase;
  const boxPlMobile = cfg.mobileBoxPaddingLeft !== undefined ? `${cfg.mobileBoxPaddingLeft}px` : boxPlBase;
  const boxPtTablet = cfg.tabletBoxPaddingTop !== undefined ? `${cfg.tabletBoxPaddingTop}px` : boxPtBase;
  const boxPrTablet = cfg.tabletBoxPaddingRight !== undefined ? `${cfg.tabletBoxPaddingRight}px` : boxPrBase;
  const boxPbTablet = cfg.tabletBoxPaddingBottom !== undefined ? `${cfg.tabletBoxPaddingBottom}px` : boxPbBase;
  const boxPlTablet = cfg.tabletBoxPaddingLeft !== undefined ? `${cfg.tabletBoxPaddingLeft}px` : boxPlBase;
  const boxPtDesktop = boxPtBase;
  const boxPrDesktop = boxPrBase;
  const boxPbDesktop = boxPbBase;
  const boxPlDesktop = boxPlBase;
  const pTopMobile = cfg.mobilePaddingTop !== undefined ? `${cfg.mobilePaddingTop}px` : "0px";
  const pRightMobile = cfg.mobilePaddingRight !== undefined ? `${cfg.mobilePaddingRight}px` : "0px";
  const pBottomMobile = cfg.mobilePaddingBottom !== undefined ? `${cfg.mobilePaddingBottom}px` : "0px";
  const pLeftMobile = cfg.mobilePaddingLeft !== undefined ? `${cfg.mobilePaddingLeft}px` : "0px";

  const pTopTablet = cfg.tabletPaddingTop !== undefined ? `${cfg.tabletPaddingTop}px` : pTopMobile;
  const pRightTablet = cfg.tabletPaddingRight !== undefined ? `${cfg.tabletPaddingRight}px` : pRightMobile;
  const pBottomTablet = cfg.tabletPaddingBottom !== undefined ? `${cfg.tabletPaddingBottom}px` : pBottomMobile;
  const pLeftTablet = cfg.tabletPaddingLeft !== undefined ? `${cfg.tabletPaddingLeft}px` : pLeftMobile;

  const pTopDesktop = cfg.paddingTop !== undefined ? `${cfg.paddingTop}px` : pTopTablet;
  const pRightDesktop = cfg.paddingRight !== undefined ? `${cfg.paddingRight}px` : pRightTablet;
  const pBottomDesktop = cfg.paddingBottom !== undefined ? `${cfg.paddingBottom}px` : pBottomTablet;
  const pLeftDesktop = cfg.paddingLeft !== undefined ? `${cfg.paddingLeft}px` : pLeftTablet;

  const mTopMobile = cfg.mobileMarginTop !== undefined ? `${cfg.mobileMarginTop}px` : "0px";
  const mRightMobile = cfg.mobileMarginRight !== undefined ? `${cfg.mobileMarginRight}px` : "0px";
  const mBottomMobile = cfg.mobileMarginBottom !== undefined ? `${cfg.mobileMarginBottom}px` : "0px";
  const mLeftMobile = cfg.mobileMarginLeft !== undefined ? `${cfg.mobileMarginLeft}px` : "0px";

  const mTopTablet = cfg.tabletMarginTop !== undefined ? `${cfg.tabletMarginTop}px` : mTopMobile;
  const mRightTablet = cfg.tabletMarginRight !== undefined ? `${cfg.tabletMarginRight}px` : mRightMobile;
  const mBottomTablet = cfg.tabletMarginBottom !== undefined ? `${cfg.tabletMarginBottom}px` : mBottomMobile;
  const mLeftTablet = cfg.tabletMarginLeft !== undefined ? `${cfg.tabletMarginLeft}px` : mLeftMobile;

  const mTopDesktop = cfg.marginTop !== undefined ? `${cfg.marginTop}px` : mTopTablet;
  const mRightDesktop = cfg.marginRight !== undefined ? `${cfg.marginRight}px` : mRightTablet;
  const mBottomDesktop = cfg.marginBottom !== undefined ? `${cfg.marginBottom}px` : mBottomTablet;
  const mLeftDesktop = cfg.marginLeft !== undefined ? `${cfg.marginLeft}px` : mLeftTablet;
  const currentUseBox = device === "mobile" ? useBoxMobile : device === "tablet" ? useBoxTablet : useBoxDesktop;
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
  const currentBoxRadius = device === "mobile" ? boxRadiusMobile : device === "tablet" ? boxRadiusTablet : boxRadiusDesktop;
  const currentBoxPt = device === "mobile" ? boxPtMobile : device === "tablet" ? boxPtTablet : boxPtDesktop;
  const currentBoxPr = device === "mobile" ? boxPrMobile : device === "tablet" ? boxPrTablet : boxPrDesktop;
  const currentBoxPb = device === "mobile" ? boxPbMobile : device === "tablet" ? boxPbTablet : boxPbDesktop;
  const currentBoxPl = device === "mobile" ? boxPlMobile : device === "tablet" ? boxPlTablet : boxPlDesktop;
  const currentColumns = device === "mobile" ? columnMobile : device === "tablet" ? columnTablet : columnDesktop;
  const currentGap = device === "mobile" ? gapMobile : device === "tablet" ? gapTablet : gapDesktop;
  const currentLimit = device === "mobile" ? limitMobile : device === "tablet" ? limitTablet : limitDesktop;
  const currentTitleFs = device === "mobile" ? titleFsMobile : device === "tablet" ? titleFsTablet : titleFsDesktop;
  const currentTitleLh = device === "mobile" ? titleLhMobile : device === "tablet" ? titleLhTablet : titleLhDesktop;
  const currentTitleMb = device === "mobile" ? titleMbMobile : device === "tablet" ? titleMbTablet : titleMbDesktop;
  const currentTitleFw = device === "mobile" ? titleFwMobile : device === "tablet" ? titleFwTablet : titleFwDesktop;
  const currentTitleColor = device === "mobile" ? titleColorMobile : device === "tablet" ? titleColorTablet : titleColorDesktop;
  const currentTitleHover = device === "mobile" ? titleHoverMobile : device === "tablet" ? titleHoverTablet : titleHoverDesktop;
  const currentBulletColor = device === "mobile" ? bulletColorMobile : device === "tablet" ? bulletColorTablet : bulletColorDesktop;
  const currentBulletSize = device === "mobile" ? bulletSizeMobile : device === "tablet" ? bulletSizeTablet : bulletSizeDesktop;
  const currentBlockTitleColor = device === "mobile" ? blockTitleColorMobile : device === "tablet" ? blockTitleColorTablet : blockTitleColorDesktop;
  const currentBlockTitleBorder = device === "mobile" ? blockTitleBorderMobile : device === "tablet" ? blockTitleBorderTablet : blockTitleBorderDesktop;
  const currentBlockTitleFs = device === "mobile" ? blockTitleFsMobile : device === "tablet" ? blockTitleFsTablet : blockTitleFsDesktop;
  const currentBlockTitleLh = device === "mobile" ? blockTitleLhMobile : device === "tablet" ? blockTitleLhTablet : blockTitleLhDesktop;
  const currentBlockTitleMb = device === "mobile" ? blockTitleMbMobile : device === "tablet" ? blockTitleMbTablet : blockTitleMbDesktop;
  const currentBlockTitlePb = device === "mobile" ? blockTitlePbMobile : device === "tablet" ? blockTitlePbTablet : blockTitlePbDesktop;
  const renderedPosts = visiblePosts.slice(0, currentLimit);

  return (
    <div
      id={`bullet-list-${block.id}`}
      className="w-full responsive-block-frame"
      style={{
        "--widget-title-color-mobile": blockTitleColorMobile,
        "--widget-title-color-tablet": blockTitleColorTablet,
        "--widget-title-color-desktop": blockTitleColorDesktop,
        "--widget-title-size-mobile": blockTitleFsMobile,
        "--widget-title-size-tablet": blockTitleFsTablet,
        "--widget-title-size-desktop": blockTitleFsDesktop,
        "--widget-title-border-color-mobile": blockTitleBorderMobile,
        "--widget-title-border-color-tablet": blockTitleBorderTablet,
        "--widget-title-border-color-desktop": blockTitleBorderDesktop,
        "--rb-mt-mobile": mTopMobile,
        "--rb-mr-mobile": mRightMobile,
        "--rb-mb-mobile": mBottomMobile,
        "--rb-ml-mobile": mLeftMobile,
        "--rb-pt-mobile": pTopMobile,
        "--rb-pr-mobile": pRightMobile,
        "--rb-pb-mobile": pBottomMobile,
        "--rb-pl-mobile": pLeftMobile,
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
        "--rb-pl-desktop": pLeftDesktop,
      } as React.CSSProperties}
    >
      <div
        style={{
          backgroundColor: currentUseBox ? currentBoxColor : "transparent",
          borderRadius: currentUseBox ? currentBoxRadius : "0",
          border: "none",
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
        <div className="bullet-list-inner">
          {(cfg.showTitle !== false) && (
            <h3 className="font-bold border-b border-[color:var(--border,#e5e7eb)] flex items-center theme-widget-title" style={{ marginBottom: currentBlockTitleMb, paddingBottom: currentBlockTitlePb }}>
              <div className="widget-title-bar" style={{ borderRadius: globalRadius, backgroundColor: currentBlockTitleBorder }}></div>
              <span style={{ color: currentBlockTitleColor, fontSize: currentBlockTitleFs, lineHeight: currentBlockTitleLh }}>{cfg.title || "Bullet List"}</span>
            </h3>
          )}
          <div className="bullet-list-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${currentColumns}, minmax(0, 1fr))`, columnGap: "2rem", rowGap: currentGap }}>
            {renderedPosts.map((post, idx) => {
              const postLink = post.category ? `/${post.category.slug}/${post.slug}` : `/post/${post.slug}`;
              return (
                <article key={post.id || `${block.id}-${idx}`} className="bullet-list-item">
                  <h4 className="bullet-list-link-wrap" style={{ fontSize: currentTitleFs, lineHeight: currentTitleLh, fontWeight: currentTitleFw, marginBottom: currentTitleMb }}>
                    <Link
                      href={postLink}
                      className="inline-flex items-start gap-2 transition-colors"
                      style={{ color: currentTitleColor, fontSize: currentTitleFs, lineHeight: currentTitleLh, fontWeight: currentTitleFw, fontFamily: "var(--home-news-title-font), sans-serif" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = currentTitleHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = currentTitleColor; }}
                    >
                      <span className="bullet-list-bullet leading-[1.2] mt-[0.1em]" style={{ color: currentBulletColor, fontSize: currentBulletSize, lineHeight: 1 }}>›</span>
                      <span style={{ fontSize: currentTitleFs, lineHeight: currentTitleLh, fontWeight: currentTitleFw, fontFamily: "var(--home-news-title-font), sans-serif" }}>
                        {post.title}
                      </span>
                    </Link>
                  </h4>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
