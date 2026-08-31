"use client";

import React from "react";
import { sanitizeCssUrl } from "@/lib/sanitizer";

interface SectionProps {
  block: any;
  layout?: string;
  colWidths?: number[];
  children?: React.ReactNode;
  isNested?: boolean;
}

export default function Section({ block, layout: _layout, colWidths: _colWidths, children, isNested = false }: SectionProps) {
  const config = block.config || {};
  
  const { 
    title,
    backgroundColor, 
    backgroundImage, 
    backgroundSize = 'cover',
    overlayColor,
    useBox, // Boolean Toggle
    borderRadius,
    boxPaddingTop,
    boxPaddingRight,
    boxPaddingBottom,
    boxPaddingLeft,
    boxPaddingX,
    boxPaddingY,
    containerWidth,
    customContainerWidth
  } = config;

  const isTruthy = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";

  // Respect responsive box settings written by updateSectionResponsiveConfig().
  const useBoxMobile = isTruthy(config.mobileUseBox ?? useBox);
  const useBoxTablet = isTruthy(config.tabletUseBox ?? useBox ?? config.mobileUseBox);
  const useBoxDesktop = isTruthy(useBox ?? config.tabletUseBox ?? config.mobileUseBox);

  const normalizeColor = (value: unknown, fallback: string) => {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    return trimmed;
  };

  // --- Responsive Margins ---
  const mtMobile = config.mobileMarginTop !== undefined ? `${config.mobileMarginTop}px` : '0px';
  const mtTablet = config.tabletMarginTop !== undefined ? `${config.tabletMarginTop}px` : mtMobile;
  const mtDesktop = config.marginTop !== undefined ? `${config.marginTop}px` : mtTablet;

  const mbMobile = config.mobileMarginBottom !== undefined ? `${config.mobileMarginBottom}px` : '0px';
  const mbTablet = config.tabletMarginBottom !== undefined ? `${config.tabletMarginBottom}px` : mbMobile;
  const mbDesktop = config.marginBottom !== undefined ? `${config.marginBottom}px` : mbTablet;

  const mlMobile = config.mobileMarginLeft !== undefined ? `${config.mobileMarginLeft}px` : '0px';
  const mlTablet = config.tabletMarginLeft !== undefined ? `${config.tabletMarginLeft}px` : mlMobile;
  const mlDesktop = config.marginLeft !== undefined ? `${config.marginLeft}px` : mlTablet;

  const mrMobile = config.mobileMarginRight !== undefined ? `${config.mobileMarginRight}px` : '0px';
  const mrTablet = config.tabletMarginRight !== undefined ? `${config.tabletMarginRight}px` : mrMobile;
  const mrDesktop = config.marginRight !== undefined ? `${config.marginRight}px` : mrTablet;

  // --- Responsive Paddings ---
  const ptMobile = config.mobilePaddingTop !== undefined ? `${config.mobilePaddingTop}px` : '0px';
  const ptTablet = config.tabletPaddingTop !== undefined ? `${config.tabletPaddingTop}px` : ptMobile;
  const ptDesktop = config.paddingTop !== undefined ? `${config.paddingTop}px` : ptTablet;

  const pbMobile = config.mobilePaddingBottom !== undefined ? `${config.mobilePaddingBottom}px` : '0px';
  const pbTablet = config.tabletPaddingBottom !== undefined ? `${config.tabletPaddingBottom}px` : pbMobile;
  const pbDesktop = config.paddingBottom !== undefined ? `${config.paddingBottom}px` : pbTablet;

  const plMobile = config.mobilePaddingLeft !== undefined ? `${config.mobilePaddingLeft}px` : '0px';
  const plTablet = config.tabletPaddingLeft !== undefined ? `${config.tabletPaddingLeft}px` : plMobile;
  const plDesktop = config.paddingLeft !== undefined ? `${config.paddingLeft}px` : plTablet;

  const prMobile = config.mobilePaddingRight !== undefined ? `${config.mobilePaddingRight}px` : '0px';
  const prTablet = config.tabletPaddingRight !== undefined ? `${config.tabletPaddingRight}px` : prMobile;
  const prDesktop = config.paddingRight !== undefined ? `${config.paddingRight}px` : prTablet;

  // --- Responsive Border / Shadow ---
  const borderStyleValueMobile = String(config.mobileBorderStyle ?? config.borderStyle ?? "solid");
  const borderStyleValueTablet = String(config.tabletBorderStyle ?? config.borderStyle ?? borderStyleValueMobile);
  const borderStyleValueDesktop = String(config.borderStyle ?? borderStyleValueTablet);

  const borderColorValueMobile = String(config.mobileBorderColor ?? config.borderColor ?? "var(--border, #e5e7eb)");
  const borderColorValueTablet = String(config.tabletBorderColor ?? config.borderColor ?? borderColorValueMobile);
  const borderColorValueDesktop = String(config.borderColor ?? borderColorValueTablet);

  const btValueMobile = Number(config.mobileBorderTopWidth ?? config.borderTopWidth ?? config.mobileBorderWidth ?? config.borderWidth ?? 0);
  const bbValueMobile = Number(config.mobileBorderBottomWidth ?? config.borderBottomWidth ?? config.mobileBorderWidth ?? config.borderWidth ?? 0);
  const blValueMobile = Number(config.mobileBorderLeftWidth ?? config.borderLeftWidth ?? config.mobileBorderWidth ?? config.borderWidth ?? 0);
  const brValueMobile = Number(config.mobileBorderRightWidth ?? config.borderRightWidth ?? config.mobileBorderWidth ?? config.borderWidth ?? 0);

  const btValueTablet = Number(config.tabletBorderTopWidth ?? config.borderTopWidth ?? config.tabletBorderWidth ?? config.borderWidth ?? config.mobileBorderTopWidth ?? config.mobileBorderWidth ?? 0);
  const bbValueTablet = Number(config.tabletBorderBottomWidth ?? config.borderBottomWidth ?? config.tabletBorderWidth ?? config.borderWidth ?? config.mobileBorderBottomWidth ?? config.mobileBorderWidth ?? 0);
  const blValueTablet = Number(config.tabletBorderLeftWidth ?? config.borderLeftWidth ?? config.tabletBorderWidth ?? config.borderWidth ?? config.mobileBorderLeftWidth ?? config.mobileBorderWidth ?? 0);
  const brValueTablet = Number(config.tabletBorderRightWidth ?? config.borderRightWidth ?? config.tabletBorderWidth ?? config.borderWidth ?? config.mobileBorderRightWidth ?? config.mobileBorderWidth ?? 0);

  const btValueDesktop = Number(config.borderTopWidth ?? config.borderWidth ?? config.tabletBorderTopWidth ?? config.tabletBorderWidth ?? config.mobileBorderTopWidth ?? config.mobileBorderWidth ?? 0);
  const bbValueDesktop = Number(config.borderBottomWidth ?? config.borderWidth ?? config.tabletBorderBottomWidth ?? config.tabletBorderWidth ?? config.mobileBorderBottomWidth ?? config.mobileBorderWidth ?? 0);
  const blValueDesktop = Number(config.borderLeftWidth ?? config.borderWidth ?? config.tabletBorderLeftWidth ?? config.tabletBorderWidth ?? config.mobileBorderLeftWidth ?? config.mobileBorderWidth ?? 0);
  const brValueDesktop = Number(config.borderRightWidth ?? config.borderWidth ?? config.tabletBorderRightWidth ?? config.tabletBorderWidth ?? config.mobileBorderRightWidth ?? config.mobileBorderWidth ?? 0);

  // Helper to append 'px' if user enters plain number for custom width
  const formatSize = (val: string | number | undefined) => {
      if (!val) return '1200px';
      const str = String(val).trim();
      // If it's just digits (e.g. "1000"), append "px"
      if (/^\d+$/.test(str)) return `${str}px`;
      return str;
  };

  // --- Responsive Gap Logic ---
  const blockGapMobile = `${(config.mobileBlockGap ?? config.blockGap ?? 6) * 0.25}rem`;
  const blockGapTablet = `${(config.tabletBlockGap ?? config.blockGap ?? config.mobileBlockGap ?? 6) * 0.25}rem`;
  const blockGapDesktop = `${(config.blockGap ?? config.tabletBlockGap ?? config.mobileBlockGap ?? 6) * 0.25}rem`;
  const columnGapMobile = `${(config.mobileColumnGap ?? config.columnGap ?? 6) * 0.25}rem`;
  const columnGapTablet = `${(config.tabletColumnGap ?? config.columnGap ?? config.mobileColumnGap ?? 6) * 0.25}rem`;
  const columnGapDesktop = `${(config.columnGap ?? config.tabletColumnGap ?? config.mobileColumnGap ?? 6) * 0.25}rem`;

  // --- Responsive Container Logic ---
  const widthModeMobile = String(config.mobileContainerWidth ?? containerWidth ?? 'boxed');
  const widthModeTablet = String(config.tabletContainerWidth ?? containerWidth ?? config.mobileContainerWidth ?? widthModeMobile);
  const widthModeDesktop = String(containerWidth ?? config.tabletContainerWidth ?? config.mobileContainerWidth ?? widthModeTablet);
  const customWidthMobile = formatSize(config.mobileCustomContainerWidth ?? customContainerWidth);
  const customWidthTablet = formatSize(config.tabletCustomContainerWidth ?? customContainerWidth ?? config.mobileCustomContainerWidth);
  const customWidthDesktop = formatSize(customContainerWidth ?? config.tabletCustomContainerWidth ?? config.mobileCustomContainerWidth);

  // --- Box Logic Helpers ---
  const formatSpacing = (value: unknown): string | undefined => {
      if (value === undefined || value === null) return undefined;
      if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
      if (typeof value === "string") {
          const trimmed = value.trim();
          if (!trimmed) return undefined;
          if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
          return trimmed;
      }
      return undefined;
  };
  const getRadius = (r: string) => {
      switch(r) {
          case 'sm': return '0.125rem';
          case 'md': return '0.375rem';
          case 'lg': return '0.5rem';
          case 'xl': return '0.75rem';
          case '2xl': return '1rem';
          case 'full': return '9999px';
          default: return '0';
      }
  };
  
  const getShadow = (s: string) => {
      switch(s) {
          case 'sm': return '0 1px 2px 0 rgb(0 0 0 / 0.05)';
          case 'md': return '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
          case 'lg': return '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)';
          case 'xl': return '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)';
          case '2xl': return '0 25px 50px -12px rgb(0 0 0 / 0.25)';
          case 'inner': return 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)';
          default: return 'none';
      }
  };

  const shadowValueMobile = getShadow(String(config.mobileBoxShadow ?? config.boxShadow ?? "none"));
  const shadowValueTablet = getShadow(String(config.tabletBoxShadow ?? config.boxShadow ?? config.mobileBoxShadow ?? "none"));
  const shadowValueDesktop = getShadow(String(config.boxShadow ?? config.tabletBoxShadow ?? config.mobileBoxShadow ?? "none"));

  const hasBorderMobile = btValueMobile > 0 || bbValueMobile > 0 || blValueMobile > 0 || brValueMobile > 0;
  const hasBorderTablet = btValueTablet > 0 || bbValueTablet > 0 || blValueTablet > 0 || brValueTablet > 0;
  const hasBorderDesktop = btValueDesktop > 0 || bbValueDesktop > 0 || blValueDesktop > 0 || brValueDesktop > 0;

  // The background toggle is the master switch for the entire section box style.
  const frameMobile = useBoxMobile;
  const frameTablet = useBoxTablet;
  const frameDesktop = useBoxDesktop;

  const styleMobile = borderStyleValueMobile.trim().toLowerCase();
  const styleTablet = borderStyleValueTablet.trim().toLowerCase();
  const styleDesktop = borderStyleValueDesktop.trim().toLowerCase();

  const borderStyleMobile = frameMobile ? (hasBorderMobile && styleMobile === "none" ? "solid" : borderStyleValueMobile) : "none";
  const borderStyleTablet = frameTablet ? (hasBorderTablet && styleTablet === "none" ? "solid" : borderStyleValueTablet) : "none";
  const borderStyleDesktop = frameDesktop ? (hasBorderDesktop && styleDesktop === "none" ? "solid" : borderStyleValueDesktop) : "none";

  const borderColorMobile = frameMobile ? borderColorValueMobile : "transparent";
  const borderColorTablet = frameTablet ? borderColorValueTablet : "transparent";
  const borderColorDesktop = frameDesktop ? borderColorValueDesktop : "transparent";

  const btMobile = frameMobile ? `${Number.isFinite(btValueMobile) ? btValueMobile : 0}px` : "0px";
  const bbMobile = frameMobile ? `${Number.isFinite(bbValueMobile) ? bbValueMobile : 0}px` : "0px";
  const blMobile = frameMobile ? `${Number.isFinite(blValueMobile) ? blValueMobile : 0}px` : "0px";
  const brMobile = frameMobile ? `${Number.isFinite(brValueMobile) ? brValueMobile : 0}px` : "0px";

  const btTablet = frameTablet ? `${Number.isFinite(btValueTablet) ? btValueTablet : 0}px` : "0px";
  const bbTablet = frameTablet ? `${Number.isFinite(bbValueTablet) ? bbValueTablet : 0}px` : "0px";
  const blTablet = frameTablet ? `${Number.isFinite(blValueTablet) ? blValueTablet : 0}px` : "0px";
  const brTablet = frameTablet ? `${Number.isFinite(brValueTablet) ? brValueTablet : 0}px` : "0px";

  const btDesktop = frameDesktop ? `${Number.isFinite(btValueDesktop) ? btValueDesktop : 0}px` : "0px";
  const bbDesktop = frameDesktop ? `${Number.isFinite(bbValueDesktop) ? bbValueDesktop : 0}px` : "0px";
  const blDesktop = frameDesktop ? `${Number.isFinite(blValueDesktop) ? blValueDesktop : 0}px` : "0px";
  const brDesktop = frameDesktop ? `${Number.isFinite(brValueDesktop) ? brValueDesktop : 0}px` : "0px";

  const shadowMobile = frameMobile ? shadowValueMobile : "none";
  const shadowTablet = frameTablet ? shadowValueTablet : "none";
  const shadowDesktop = frameDesktop ? shadowValueDesktop : "none";

  const radiusMobile = frameMobile ? getRadius(String(config.mobileBorderRadius ?? borderRadius ?? "none")) : "0";
  const radiusTablet = frameTablet ? getRadius(String(config.tabletBorderRadius ?? borderRadius ?? config.mobileBorderRadius ?? "none")) : "0";
  const radiusDesktop = frameDesktop ? getRadius(String(borderRadius ?? config.tabletBorderRadius ?? config.mobileBorderRadius ?? "none")) : "0";

  const boxPtMobile = useBoxMobile
    ? (formatSpacing(config.mobileBoxPaddingTop ?? boxPaddingTop ?? config.mobileBoxPaddingY ?? boxPaddingY) ?? "0px")
    : "0px";
  const boxPtTablet = useBoxTablet
    ? (formatSpacing(config.tabletBoxPaddingTop ?? boxPaddingTop ?? config.tabletBoxPaddingY ?? boxPaddingY ?? config.mobileBoxPaddingTop ?? config.mobileBoxPaddingY) ?? boxPtMobile)
    : "0px";
  const boxPtDesktop = useBoxDesktop
    ? (formatSpacing(boxPaddingTop ?? boxPaddingY ?? config.tabletBoxPaddingTop ?? config.tabletBoxPaddingY ?? config.mobileBoxPaddingTop ?? config.mobileBoxPaddingY) ?? boxPtTablet)
    : "0px";

  const boxPrMobile = useBoxMobile
    ? (formatSpacing(config.mobileBoxPaddingRight ?? boxPaddingRight ?? config.mobileBoxPaddingX ?? boxPaddingX) ?? "0px")
    : "0px";
  const boxPrTablet = useBoxTablet
    ? (formatSpacing(config.tabletBoxPaddingRight ?? boxPaddingRight ?? config.tabletBoxPaddingX ?? boxPaddingX ?? config.mobileBoxPaddingRight ?? config.mobileBoxPaddingX) ?? boxPrMobile)
    : "0px";
  const boxPrDesktop = useBoxDesktop
    ? (formatSpacing(boxPaddingRight ?? boxPaddingX ?? config.tabletBoxPaddingRight ?? config.tabletBoxPaddingX ?? config.mobileBoxPaddingRight ?? config.mobileBoxPaddingX) ?? boxPrTablet)
    : "0px";

  const boxPbMobile = useBoxMobile
    ? (formatSpacing(config.mobileBoxPaddingBottom ?? boxPaddingBottom ?? config.mobileBoxPaddingY ?? boxPaddingY) ?? "0px")
    : "0px";
  const boxPbTablet = useBoxTablet
    ? (formatSpacing(config.tabletBoxPaddingBottom ?? boxPaddingBottom ?? config.tabletBoxPaddingY ?? boxPaddingY ?? config.mobileBoxPaddingBottom ?? config.mobileBoxPaddingY) ?? boxPbMobile)
    : "0px";
  const boxPbDesktop = useBoxDesktop
    ? (formatSpacing(boxPaddingBottom ?? boxPaddingY ?? config.tabletBoxPaddingBottom ?? config.tabletBoxPaddingY ?? config.mobileBoxPaddingBottom ?? config.mobileBoxPaddingY) ?? boxPbTablet)
    : "0px";

  const boxPlMobile = useBoxMobile
    ? (formatSpacing(config.mobileBoxPaddingLeft ?? boxPaddingLeft ?? config.mobileBoxPaddingX ?? boxPaddingX) ?? "0px")
    : "0px";
  const boxPlTablet = useBoxTablet
    ? (formatSpacing(config.tabletBoxPaddingLeft ?? boxPaddingLeft ?? config.tabletBoxPaddingX ?? boxPaddingX ?? config.mobileBoxPaddingLeft ?? config.mobileBoxPaddingX) ?? boxPlMobile)
    : "0px";
  const boxPlDesktop = useBoxDesktop
    ? (formatSpacing(boxPaddingLeft ?? boxPaddingX ?? config.tabletBoxPaddingLeft ?? config.tabletBoxPaddingX ?? config.mobileBoxPaddingLeft ?? config.mobileBoxPaddingX) ?? boxPlTablet)
    : "0px";

  // --- Responsive Background / Overlay ---
  const rawBgColorMobile = normalizeColor(config.mobileBackgroundColor ?? backgroundColor, "transparent");
  const rawBgColorTablet = normalizeColor(
    config.tabletBackgroundColor ?? backgroundColor ?? config.mobileBackgroundColor,
    rawBgColorMobile
  );
  const rawBgColorDesktop = normalizeColor(
    backgroundColor ?? config.tabletBackgroundColor ?? config.mobileBackgroundColor,
    rawBgColorTablet
  );
  const bgColorMobile = useBoxMobile ? rawBgColorMobile : "transparent";
  const bgColorTablet = useBoxTablet ? rawBgColorTablet : "transparent";
  const bgColorDesktop = useBoxDesktop ? rawBgColorDesktop : "transparent";

  const rawBgImageDesktop = sanitizeCssUrl(
    typeof backgroundImage === "string" && backgroundImage.trim() !== ""
      ? backgroundImage
      : ""
  );
  const rawBgImageTablet = sanitizeCssUrl(
    typeof config.tabletBackgroundImage === "string" && config.tabletBackgroundImage.trim() !== ""
      ? config.tabletBackgroundImage
      : rawBgImageDesktop
  );
  const rawBgImageMobile = sanitizeCssUrl(
    typeof config.mobileBackgroundImage === "string" && config.mobileBackgroundImage.trim() !== ""
      ? config.mobileBackgroundImage
      : rawBgImageDesktop
  );
  const bgImageDesktop = useBoxDesktop ? rawBgImageDesktop : "";
  const bgImageTablet = useBoxTablet ? rawBgImageTablet : "";
  const bgImageMobile = useBoxMobile ? rawBgImageMobile : "";

  const bgSizeDesktop = typeof backgroundSize === 'string' && backgroundSize.trim() !== ''
    ? backgroundSize
    : 'cover';
  const bgSizeTablet = typeof config.tabletBackgroundSize === 'string' && config.tabletBackgroundSize.trim() !== ''
    ? config.tabletBackgroundSize
    : bgSizeDesktop;
  const bgSizeMobile = typeof config.mobileBackgroundSize === 'string' && config.mobileBackgroundSize.trim() !== ''
    ? config.mobileBackgroundSize
    : bgSizeDesktop;
  const bgRepeatDesktop = typeof config.backgroundRepeat === "string" && config.backgroundRepeat.trim() !== ""
    ? config.backgroundRepeat
    : "no-repeat";
  const bgRepeatTablet = typeof config.tabletBackgroundRepeat === "string" && config.tabletBackgroundRepeat.trim() !== ""
    ? config.tabletBackgroundRepeat
    : bgRepeatDesktop;
  const bgRepeatMobile = typeof config.mobileBackgroundRepeat === "string" && config.mobileBackgroundRepeat.trim() !== ""
    ? config.mobileBackgroundRepeat
    : bgRepeatDesktop;
  const bgPositionDesktop = typeof config.backgroundPosition === "string" && config.backgroundPosition.trim() !== ""
    ? config.backgroundPosition
    : "center";
  const bgPositionTablet = typeof config.tabletBackgroundPosition === "string" && config.tabletBackgroundPosition.trim() !== ""
    ? config.tabletBackgroundPosition
    : bgPositionDesktop;
  const bgPositionMobile = typeof config.mobileBackgroundPosition === "string" && config.mobileBackgroundPosition.trim() !== ""
    ? config.mobileBackgroundPosition
    : bgPositionDesktop;
  const bgAttachmentDesktop = typeof config.backgroundAttachment === "string" && config.backgroundAttachment.trim() !== ""
    ? config.backgroundAttachment
    : "scroll";
  const bgAttachmentTablet = typeof config.tabletBackgroundAttachment === "string" && config.tabletBackgroundAttachment.trim() !== ""
    ? config.tabletBackgroundAttachment
    : bgAttachmentDesktop;
  const bgAttachmentMobile = typeof config.mobileBackgroundAttachment === "string" && config.mobileBackgroundAttachment.trim() !== ""
    ? config.mobileBackgroundAttachment
    : bgAttachmentDesktop;

  const rawOverlayDesktop = normalizeColor(
    config.backgroundOverlayColor ?? overlayColor,
    "transparent"
  );
  const rawOverlayTablet = normalizeColor(
    config.tabletBackgroundOverlayColor ?? config.tabletOverlayColor,
    rawOverlayDesktop
  );
  const rawOverlayMobile = normalizeColor(
    config.mobileBackgroundOverlayColor ?? config.mobileOverlayColor,
    rawOverlayDesktop
  );
  const overlayDesktop = useBoxDesktop ? rawOverlayDesktop : "transparent";
  const overlayTablet = useBoxTablet ? rawOverlayTablet : "transparent";
  const overlayMobile = useBoxMobile ? rawOverlayMobile : "transparent";
  const rawOverlayOpacityDesktop = Math.min(100, Math.max(0, Number(config.backgroundOverlayOpacity ?? 100) || 0)) / 100;
  const rawOverlayOpacityTablet = Math.min(
    100,
    Math.max(0, Number(config.tabletBackgroundOverlayOpacity ?? rawOverlayOpacityDesktop * 100) || 0)
  ) / 100;
  const rawOverlayOpacityMobile = Math.min(
    100,
    Math.max(0, Number(config.mobileBackgroundOverlayOpacity ?? rawOverlayOpacityDesktop * 100) || 0)
  ) / 100;
  const overlayOpacityDesktop = useBoxDesktop ? rawOverlayOpacityDesktop : 0;
  const overlayOpacityTablet = useBoxTablet ? rawOverlayOpacityTablet : 0;
  const overlayOpacityMobile = useBoxMobile ? rawOverlayOpacityMobile : 0;

  const boxedMaxWidth = "var(--container-width, 1200px)";
  const containerMaxWidthMobile = isNested ? "none" : (widthModeMobile === 'full' ? 'none' : (widthModeMobile === 'custom' ? customWidthMobile : boxedMaxWidth));
  const containerMaxWidthTablet = isNested ? "none" : (widthModeTablet === 'full' ? 'none' : (widthModeTablet === 'custom' ? customWidthTablet : boxedMaxWidth));
  const containerMaxWidthDesktop = isNested ? "none" : (widthModeDesktop === 'full' ? 'none' : (widthModeDesktop === 'custom' ? customWidthDesktop : boxedMaxWidth));

  const sectionStyle = {
    ["--sec-mt-m" as any]: mtMobile,
    ["--sec-mb-m" as any]: mbMobile,
    ["--sec-ml-m" as any]: mlMobile,
    ["--sec-mr-m" as any]: mrMobile,
    ["--sec-mt-t" as any]: mtTablet,
    ["--sec-mb-t" as any]: mbTablet,
    ["--sec-ml-t" as any]: mlTablet,
    ["--sec-mr-t" as any]: mrTablet,
    ["--sec-mt-d" as any]: mtDesktop,
    ["--sec-mb-d" as any]: mbDesktop,
    ["--sec-ml-d" as any]: mlDesktop,
    ["--sec-mr-d" as any]: mrDesktop,
    ["--sec-pt-m" as any]: ptMobile,
    ["--sec-pb-m" as any]: pbMobile,
    ["--sec-pl-m" as any]: plMobile,
    ["--sec-pr-m" as any]: prMobile,
    ["--sec-pt-t" as any]: ptTablet,
    ["--sec-pb-t" as any]: pbTablet,
    ["--sec-pl-t" as any]: plTablet,
    ["--sec-pr-t" as any]: prTablet,
    ["--sec-pt-d" as any]: ptDesktop,
    ["--sec-pb-d" as any]: pbDesktop,
    ["--sec-pl-d" as any]: plDesktop,
    ["--sec-pr-d" as any]: prDesktop,
    ["--sec-bg-m" as any]: bgColorMobile,
    ["--sec-bg-t" as any]: bgColorTablet,
    ["--sec-bg-d" as any]: bgColorDesktop,
    ["--sec-bgimg-m" as any]: bgImageMobile ? `url("${bgImageMobile}")` : "none",
    ["--sec-bgimg-t" as any]: bgImageTablet ? `url("${bgImageTablet}")` : "none",
    ["--sec-bgimg-d" as any]: bgImageDesktop ? `url("${bgImageDesktop}")` : "none",
    ["--sec-bgsize-m" as any]: bgImageMobile ? bgSizeMobile : "auto",
    ["--sec-bgsize-t" as any]: bgImageTablet ? bgSizeTablet : "auto",
    ["--sec-bgsize-d" as any]: bgImageDesktop ? bgSizeDesktop : "auto",
    ["--sec-bgrep-m" as any]: bgRepeatMobile,
    ["--sec-bgrep-t" as any]: bgRepeatTablet,
    ["--sec-bgrep-d" as any]: bgRepeatDesktop,
    ["--sec-bgpos-m" as any]: bgPositionMobile,
    ["--sec-bgpos-t" as any]: bgPositionTablet,
    ["--sec-bgpos-d" as any]: bgPositionDesktop,
    ["--sec-bgatt-m" as any]: bgAttachmentMobile,
    ["--sec-bgatt-t" as any]: bgAttachmentTablet,
    ["--sec-bgatt-d" as any]: bgAttachmentDesktop,
    ["--sec-border-style-m" as any]: borderStyleMobile,
    ["--sec-border-style-t" as any]: borderStyleTablet,
    ["--sec-border-style-d" as any]: borderStyleDesktop,
    ["--sec-border-color-m" as any]: borderColorMobile,
    ["--sec-border-color-t" as any]: borderColorTablet,
    ["--sec-border-color-d" as any]: borderColorDesktop,
    ["--sec-bt-m" as any]: btMobile,
    ["--sec-bb-m" as any]: bbMobile,
    ["--sec-bl-m" as any]: blMobile,
    ["--sec-br-m" as any]: brMobile,
    ["--sec-bt-t" as any]: btTablet,
    ["--sec-bb-t" as any]: bbTablet,
    ["--sec-bl-t" as any]: blTablet,
    ["--sec-br-t" as any]: brTablet,
    ["--sec-bt-d" as any]: btDesktop,
    ["--sec-bb-d" as any]: bbDesktop,
    ["--sec-bl-d" as any]: blDesktop,
    ["--sec-br-d" as any]: brDesktop,
    ["--sec-shadow-m" as any]: shadowMobile,
    ["--sec-shadow-t" as any]: shadowTablet,
    ["--sec-shadow-d" as any]: shadowDesktop,
    ["--sec-radius-m" as any]: radiusMobile,
    ["--sec-radius-t" as any]: radiusTablet,
    ["--sec-radius-d" as any]: radiusDesktop,
    ["--sec-overlay-m" as any]: overlayMobile || "transparent",
    ["--sec-overlay-t" as any]: overlayTablet || overlayMobile || "transparent",
    ["--sec-overlay-d" as any]: overlayDesktop || overlayTablet || overlayMobile || "transparent",
    ["--sec-overlay-opacity-m" as any]: `${overlayOpacityMobile}`,
    ["--sec-overlay-opacity-t" as any]: `${overlayOpacityTablet}`,
    ["--sec-overlay-opacity-d" as any]: `${overlayOpacityDesktop}`,
    ["--sec-boxpt-m" as any]: boxPtMobile,
    ["--sec-boxpt-t" as any]: boxPtTablet,
    ["--sec-boxpt-d" as any]: boxPtDesktop,
    ["--sec-boxpr-m" as any]: boxPrMobile,
    ["--sec-boxpr-t" as any]: boxPrTablet,
    ["--sec-boxpr-d" as any]: boxPrDesktop,
    ["--sec-boxpb-m" as any]: boxPbMobile,
    ["--sec-boxpb-t" as any]: boxPbTablet,
    ["--sec-boxpb-d" as any]: boxPbDesktop,
    ["--sec-boxpl-m" as any]: boxPlMobile,
    ["--sec-boxpl-t" as any]: boxPlTablet,
    ["--sec-boxpl-d" as any]: boxPlDesktop,
    ["--sec-wgap-m" as any]: blockGapMobile,
    ["--sec-wgap-t" as any]: blockGapTablet,
    ["--sec-wgap-d" as any]: blockGapDesktop,
    ["--sec-cgap-m" as any]: columnGapMobile,
    ["--sec-cgap-t" as any]: columnGapTablet,
    ["--sec-cgap-d" as any]: columnGapDesktop,
    ["--sec-maxw-m" as any]: containerMaxWidthMobile,
    ["--sec-maxw-t" as any]: containerMaxWidthTablet,
    ["--sec-maxw-d" as any]: containerMaxWidthDesktop,
  } as any;

  return (
      <section
        id={`section-${block.id}`}
        className="relative max-w-full mt-[var(--sec-mt-m)] mr-[var(--sec-mr-m)] mb-[var(--sec-mb-m)] ml-[var(--sec-ml-m)] md:mt-[var(--sec-mt-t)] md:mr-[var(--sec-mr-t)] md:mb-[var(--sec-mb-t)] md:ml-[var(--sec-ml-t)] lg:mt-[var(--sec-mt-d)] lg:mr-[var(--sec-mr-d)] lg:mb-[var(--sec-mb-d)] lg:ml-[var(--sec-ml-d)]"
        style={sectionStyle}
      >
        <div
          id={`section-container-${block.id}`}
          className={isNested
            ? "relative w-full"
            : "relative w-full mx-auto px-4 max-w-[var(--sec-maxw-m)] md:max-w-[var(--sec-maxw-t)] lg:max-w-[var(--sec-maxw-d)]"}
        >
             {/* Box Container (if enabled) */}
             <div 
                id={`section-surface-${block.id}`}
                className="relative w-full bg-[var(--sec-bg-m)] md:bg-[var(--sec-bg-t)] lg:bg-[var(--sec-bg-d)] bg-[image:var(--sec-bgimg-m)] md:bg-[image:var(--sec-bgimg-t)] lg:bg-[image:var(--sec-bgimg-d)] [background-size:var(--sec-bgsize-m)] md:[background-size:var(--sec-bgsize-t)] lg:[background-size:var(--sec-bgsize-d)] [background-repeat:var(--sec-bgrep-m)] md:[background-repeat:var(--sec-bgrep-t)] lg:[background-repeat:var(--sec-bgrep-d)] [background-position:var(--sec-bgpos-m)] md:[background-position:var(--sec-bgpos-t)] lg:[background-position:var(--sec-bgpos-d)] [background-attachment:var(--sec-bgatt-m)] md:[background-attachment:var(--sec-bgatt-t)] lg:[background-attachment:var(--sec-bgatt-d)] pt-[var(--sec-pt-m)] pb-[var(--sec-pb-m)] pl-[var(--sec-pl-m)] pr-[var(--sec-pr-m)] md:pt-[var(--sec-pt-t)] md:pb-[var(--sec-pb-t)] md:pl-[var(--sec-pl-t)] md:pr-[var(--sec-pr-t)] lg:pt-[var(--sec-pt-d)] lg:pb-[var(--sec-pb-d)] lg:pl-[var(--sec-pl-d)] lg:pr-[var(--sec-pr-d)] [border-top-style:var(--sec-border-style-m)] [border-bottom-style:var(--sec-border-style-m)] [border-left-style:var(--sec-border-style-m)] [border-right-style:var(--sec-border-style-m)] md:[border-top-style:var(--sec-border-style-t)] md:[border-bottom-style:var(--sec-border-style-t)] md:[border-left-style:var(--sec-border-style-t)] md:[border-right-style:var(--sec-border-style-t)] lg:[border-top-style:var(--sec-border-style-d)] lg:[border-bottom-style:var(--sec-border-style-d)] lg:[border-left-style:var(--sec-border-style-d)] lg:[border-right-style:var(--sec-border-style-d)] [border-color:var(--sec-border-color-m)] md:[border-color:var(--sec-border-color-t)] lg:[border-color:var(--sec-border-color-d)] border-t-[var(--sec-bt-m)] border-b-[var(--sec-bb-m)] border-l-[var(--sec-bl-m)] border-r-[var(--sec-br-m)] md:border-t-[var(--sec-bt-t)] md:border-b-[var(--sec-bb-t)] md:border-l-[var(--sec-bl-t)] md:border-r-[var(--sec-br-t)] lg:border-t-[var(--sec-bt-d)] lg:border-b-[var(--sec-bb-d)] lg:border-l-[var(--sec-bl-d)] lg:border-r-[var(--sec-br-d)] shadow-[var(--sec-shadow-m)] md:shadow-[var(--sec-shadow-t)] lg:shadow-[var(--sec-shadow-d)] rounded-[var(--sec-radius-m)] md:rounded-[var(--sec-radius-t)] lg:rounded-[var(--sec-radius-d)]"
             >
                  {/* Box Overlay */}
                  {(bgImageMobile || bgImageTablet || bgImageDesktop) && (
                      <div 
                          id={`section-overlay-${block.id}`}
                          className="absolute inset-0 pointer-events-none z-0 bg-[var(--sec-overlay-m)] md:bg-[var(--sec-overlay-t)] lg:bg-[var(--sec-overlay-d)] [opacity:var(--sec-overlay-opacity-m)] md:[opacity:var(--sec-overlay-opacity-t)] lg:[opacity:var(--sec-overlay-opacity-d)] rounded-[var(--sec-radius-m)] md:rounded-[var(--sec-radius-t)] lg:rounded-[var(--sec-radius-d)]"
                      />
                  )}

                  <div 
                    id={`section-box-content-${block.id}`}
                    className="relative z-10 pt-[var(--sec-boxpt-m)] pr-[var(--sec-boxpr-m)] pb-[var(--sec-boxpb-m)] pl-[var(--sec-boxpl-m)] md:pt-[var(--sec-boxpt-t)] md:pr-[var(--sec-boxpr-t)] md:pb-[var(--sec-boxpb-t)] md:pl-[var(--sec-boxpl-t)] lg:pt-[var(--sec-boxpt-d)] lg:pr-[var(--sec-boxpr-d)] lg:pb-[var(--sec-boxpb-d)] lg:pl-[var(--sec-boxpl-d)]"
                  >
                    {title && <h2 className="text-2xl font-bold mb-3 border-b pb-2">{title}</h2>}
                    
                    <div 
                        id={`section-grid-${block.id}`}
                        className="grid grid-cols-1 md:grid-cols-12 gap-y-[var(--sec-wgap-m)] gap-x-[var(--sec-cgap-m)] md:gap-y-[var(--sec-wgap-t)] md:gap-x-[var(--sec-cgap-t)] lg:gap-y-[var(--sec-wgap-d)] lg:gap-x-[var(--sec-cgap-d)]"
                    >
                        {/* We need to re-wrap children if they were passed as raw array or fragments 
                            However, Homepage.tsx already wraps them in divs with col-span classes.
                            BUT, if we want to enforce layout here, we might need to inspect children.
                            
                            Current Homepage.tsx logic:
                            It passes `renderedColumns` which are <div>s with `md:col-span-X`.
                            So we just need to render {children} directly inside the grid.
                        */}
                        {children}
                    </div>
                  </div>
             </div>
        </div>
      </section>
  );
}
