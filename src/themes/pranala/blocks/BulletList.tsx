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
  useBox?: boolean | string;
  boxColor?: string;
  boxBorderRadius?: string | number;
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
  const blockTitleFsDesktop = formatSize(cfg.blockTitleFontSize, "24px");
  const blockTitleFsTablet = formatSize(cfg.tabletBlockTitleFontSize ?? cfg.blockTitleFontSize, blockTitleFsDesktop);
  const blockTitleFsMobile = formatSize(cfg.mobileBlockTitleFontSize ?? cfg.blockTitleFontSize, "20px");
  const blockTitleBorderDesktop = (cfg.blockTitleBorderColor as string) || "var(--accent)";
  const blockTitleBorderTablet = (cfg.tabletBlockTitleBorderColor as string) || blockTitleBorderDesktop;
  const blockTitleBorderMobile = (cfg.mobileBlockTitleBorderColor as string) || blockTitleBorderDesktop;

  const configRecord = cfg as Record<string, unknown>;
  const useBoxValues = getResponsiveBoolValues(configRecord, "useBox", false);
  const useBoxDesktop = useBoxValues.desktop;
  const useBoxTablet = useBoxValues.tablet;
  const useBoxMobile = useBoxValues.mobile;
  const boxColorValues = getResponsiveValues<string>(configRecord, "boxColor");
  const boxColorDesktop = boxColorValues.desktop || "var(--bg-elevated, #ffffff)";
  const boxColorTablet = boxColorValues.tablet || boxColorDesktop;
  const boxColorMobile = boxColorValues.mobile || boxColorDesktop;
  const globalRadius = "var(--home-main-box-radius, 0.75rem)";
  const boxRadiusDesktop = resolveRadiusValue(cfg.boxBorderRadius, globalRadius);
  const boxRadiusTablet = resolveRadiusValue(cfg.tabletBoxBorderRadius ?? cfg.boxBorderRadius, boxRadiusDesktop);
  const boxRadiusMobile = resolveRadiusValue(cfg.mobileBoxBorderRadius ?? cfg.boxBorderRadius, boxRadiusDesktop);
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

  return (
    <div
      id={`bullet-list-${block.id}`}
      className="w-full"
      style={{
        backgroundColor: "transparent",
        borderRadius: "0",
        border: "none",
        boxShadow: "none",
        "--widget-title-color-mobile": blockTitleColorMobile,
        "--widget-title-color-tablet": blockTitleColorTablet,
        "--widget-title-color-desktop": blockTitleColorDesktop,
        "--widget-title-size-mobile": blockTitleFsMobile,
        "--widget-title-size-tablet": blockTitleFsTablet,
        "--widget-title-size-desktop": blockTitleFsDesktop,
        "--widget-title-border-color-mobile": blockTitleBorderMobile,
        "--widget-title-border-color-tablet": blockTitleBorderTablet,
        "--widget-title-border-color-desktop": blockTitleBorderDesktop,
      } as React.CSSProperties}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #bullet-list-${block.id} {
              background-color: ${useBoxMobile ? boxColorMobile : "transparent"};
              border-radius: ${useBoxMobile ? boxRadiusMobile : "0"};
              border: ${useBoxMobile ? "var(--box-border, 1px solid #f3f4f6)" : "none"};
              box-shadow: ${useBoxMobile ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none"};
            }
            #bullet-list-${block.id} .bullet-list-grid {
              display: grid;
              grid-template-columns: repeat(${columnMobile}, minmax(0, 1fr));
              column-gap: 2rem;
              row-gap: ${gapMobile};
            }
            #bullet-list-${block.id} .bullet-list-inner {
              margin-top: ${mTopMobile};
              margin-right: ${mRightMobile};
              margin-bottom: ${mBottomMobile};
              margin-left: ${mLeftMobile};
              padding-top: ${pTopMobile};
              padding-right: ${pRightMobile};
              padding-bottom: ${pBottomMobile};
              padding-left: ${pLeftMobile};
            }
            #bullet-list-${block.id} .bullet-list-item:nth-child(n+${limitMobile + 1}) { display: none; }
            #bullet-list-${block.id} .bullet-list-link-wrap {
              font-size: ${titleFsMobile};
              line-height: ${titleLhMobile};
              font-weight: ${titleFwMobile};
            }
            #bullet-list-${block.id} .bullet-list-link {
              font-size: ${titleFsMobile};
              line-height: ${titleLhMobile};
              font-weight: ${titleFwMobile};
              font-family: var(--home-news-title-font), sans-serif;
            }
            #bullet-list-${block.id} .bullet-list-link { color: ${titleColorMobile}; }
            #bullet-list-${block.id} .bullet-list-link:hover { color: ${titleHoverMobile}; }
            #bullet-list-${block.id} .bullet-list-bullet { color: ${bulletColorMobile}; font-size: ${bulletSizeMobile}; line-height: 1; }
            @media (min-width: 768px) {
              #bullet-list-${block.id} {
                background-color: ${useBoxTablet ? boxColorTablet : "transparent"};
                border-radius: ${useBoxTablet ? boxRadiusTablet : "0"};
                border: ${useBoxTablet ? "var(--box-border, 1px solid #f3f4f6)" : "none"};
                box-shadow: ${useBoxTablet ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none"};
              }
              #bullet-list-${block.id} .bullet-list-inner {
                margin-top: ${mTopTablet};
                margin-right: ${mRightTablet};
                margin-bottom: ${mBottomTablet};
                margin-left: ${mLeftTablet};
                padding-top: ${pTopTablet};
                padding-right: ${pRightTablet};
                padding-bottom: ${pBottomTablet};
                padding-left: ${pLeftTablet};
              }
              #bullet-list-${block.id} .bullet-list-grid {
                grid-template-columns: repeat(${columnTablet}, minmax(0, 1fr));
                row-gap: ${gapTablet};
              }
              #bullet-list-${block.id} .bullet-list-item:nth-child(n+${limitTablet + 1}) { display: none; }
              #bullet-list-${block.id} .bullet-list-link-wrap {
                font-size: ${titleFsTablet};
                line-height: ${titleLhTablet};
                font-weight: ${titleFwTablet};
              }
              #bullet-list-${block.id} .bullet-list-link {
                font-size: ${titleFsTablet};
                line-height: ${titleLhTablet};
                font-weight: ${titleFwTablet};
                font-family: var(--home-news-title-font), sans-serif;
              }
              #bullet-list-${block.id} .bullet-list-link { color: ${titleColorTablet}; }
              #bullet-list-${block.id} .bullet-list-link:hover { color: ${titleHoverTablet}; }
              #bullet-list-${block.id} .bullet-list-bullet { color: ${bulletColorTablet}; font-size: ${bulletSizeTablet}; line-height: 1; }
            }
            @media (min-width: 1025px) {
              #bullet-list-${block.id} {
                background-color: ${useBoxDesktop ? boxColorDesktop : "transparent"};
                border-radius: ${useBoxDesktop ? boxRadiusDesktop : "0"};
                border: ${useBoxDesktop ? "var(--box-border, 1px solid #f3f4f6)" : "none"};
                box-shadow: ${useBoxDesktop ? "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))" : "none"};
              }
              #bullet-list-${block.id} .bullet-list-inner {
                margin-top: ${mTopDesktop};
                margin-right: ${mRightDesktop};
                margin-bottom: ${mBottomDesktop};
                margin-left: ${mLeftDesktop};
                padding-top: ${pTopDesktop};
                padding-right: ${pRightDesktop};
                padding-bottom: ${pBottomDesktop};
                padding-left: ${pLeftDesktop};
              }
              #bullet-list-${block.id} .bullet-list-grid {
                grid-template-columns: repeat(${columnDesktop}, minmax(0, 1fr));
                row-gap: ${gapDesktop};
              }
              #bullet-list-${block.id} .bullet-list-item:nth-child(n+${limitDesktop + 1}) { display: none; }
              #bullet-list-${block.id} .bullet-list-link-wrap {
                font-size: ${titleFsDesktop};
                line-height: ${titleLhDesktop};
                font-weight: ${titleFwDesktop};
              }
              #bullet-list-${block.id} .bullet-list-link {
                font-size: ${titleFsDesktop};
                line-height: ${titleLhDesktop};
                font-weight: ${titleFwDesktop};
                font-family: var(--home-news-title-font), sans-serif;
              }
              #bullet-list-${block.id} .bullet-list-link { color: ${titleColorDesktop}; }
              #bullet-list-${block.id} .bullet-list-link:hover { color: ${titleHoverDesktop}; }
              #bullet-list-${block.id} .bullet-list-bullet { color: ${bulletColorDesktop}; font-size: ${bulletSizeDesktop}; line-height: 1; }
            }
          `,
        }}
      />

      <div className="bullet-list-inner">
        <div className="bullet-list-grid">
          {visiblePosts.map((post, idx) => {
            const postLink = post.category ? `/${post.category.slug}/${post.slug}` : `/post/${post.slug}`;
            return (
              <article key={post.id || `${block.id}-${idx}`} className="bullet-list-item">
                <h4 className="bullet-list-link-wrap">
                  <Link href={postLink} className="bullet-list-link inline-flex items-start gap-2 transition-colors">
                    <span className="bullet-list-bullet leading-[1.2] mt-[0.1em]">›</span>
                    <span>{post.title}</span>
                  </Link>
                </h4>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
