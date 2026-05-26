"use client";

import React from "react";

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
    const v = value.trim().toLowerCase();
    if (!v) return fallback;
    if (v === "#fff" || v === "#ffffff" || v === "white") return fallback;
    if (v === "#f9fafb" || v === "#f3f4f6" || v === "#f5f5f5") return fallback;
    return value;
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

  const borderColorValueMobile = String(config.mobileBorderColor ?? config.borderColor ?? "#e5e7eb");
  const borderColorValueTablet = String(config.tabletBorderColor ?? config.borderColor ?? borderColorValueMobile);
  const borderColorValueDesktop = String(config.borderColor ?? borderColorValueTablet);

  const btValueMobile = Number(config.mobileBorderTopWidth ?? config.borderTopWidth ?? 0);
  const bbValueMobile = Number(config.mobileBorderBottomWidth ?? config.borderBottomWidth ?? 0);
  const blValueMobile = Number(config.mobileBorderLeftWidth ?? config.borderLeftWidth ?? 0);
  const brValueMobile = Number(config.mobileBorderRightWidth ?? config.borderRightWidth ?? 0);

  const btValueTablet = Number(config.tabletBorderTopWidth ?? config.borderTopWidth ?? config.mobileBorderTopWidth ?? 0);
  const bbValueTablet = Number(config.tabletBorderBottomWidth ?? config.borderBottomWidth ?? config.mobileBorderBottomWidth ?? 0);
  const blValueTablet = Number(config.tabletBorderLeftWidth ?? config.borderLeftWidth ?? config.mobileBorderLeftWidth ?? 0);
  const brValueTablet = Number(config.tabletBorderRightWidth ?? config.borderRightWidth ?? config.mobileBorderRightWidth ?? 0);

  const btValueDesktop = Number(config.borderTopWidth ?? config.tabletBorderTopWidth ?? config.mobileBorderTopWidth ?? 0);
  const bbValueDesktop = Number(config.borderBottomWidth ?? config.tabletBorderBottomWidth ?? config.mobileBorderBottomWidth ?? 0);
  const blValueDesktop = Number(config.borderLeftWidth ?? config.tabletBorderLeftWidth ?? config.mobileBorderLeftWidth ?? 0);
  const brValueDesktop = Number(config.borderRightWidth ?? config.tabletBorderRightWidth ?? config.mobileBorderRightWidth ?? 0);

  // Helper to append 'px' if user enters plain number for custom width
  const formatSize = (val: string | number | undefined) => {
      if (!val) return '1200px';
      const str = String(val).trim();
      // If it's just digits (e.g. "1000"), append "px"
      if (/^\d+$/.test(str)) return `${str}px`;
      return str;
  };

  // --- Responsive Gap Logic ---
  const blockGapMobile = `${(config.mobileBlockGap ?? config.blockGap ?? 0) * 0.25}rem`;
  const blockGapTablet = `${(config.tabletBlockGap ?? config.blockGap ?? config.mobileBlockGap ?? 0) * 0.25}rem`;
  const blockGapDesktop = `${(config.blockGap ?? config.tabletBlockGap ?? config.mobileBlockGap ?? 0) * 0.25}rem`;
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

  const frameMobile = useBoxMobile || btValueMobile > 0 || bbValueMobile > 0 || blValueMobile > 0 || brValueMobile > 0 || shadowValueMobile !== "none";
  const frameTablet = useBoxTablet || btValueTablet > 0 || bbValueTablet > 0 || blValueTablet > 0 || brValueTablet > 0 || shadowValueTablet !== "none";
  const frameDesktop = useBoxDesktop || btValueDesktop > 0 || bbValueDesktop > 0 || blValueDesktop > 0 || brValueDesktop > 0 || shadowValueDesktop !== "none";

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

  const boxPaddingYMobile = useBoxMobile ? (formatSpacing(config.mobileBoxPaddingY ?? boxPaddingY) ?? "0px") : "0px";
  const boxPaddingYTablet = useBoxTablet ? (formatSpacing(config.tabletBoxPaddingY ?? boxPaddingY ?? config.mobileBoxPaddingY) ?? boxPaddingYMobile) : "0px";
  const boxPaddingYDesktop = useBoxDesktop ? (formatSpacing(boxPaddingY ?? config.tabletBoxPaddingY ?? config.mobileBoxPaddingY) ?? boxPaddingYTablet) : "0px";
  const boxPaddingXMobile = useBoxMobile ? (formatSpacing(config.mobileBoxPaddingX ?? boxPaddingX) ?? "0px") : "0px";
  const boxPaddingXTablet = useBoxTablet ? (formatSpacing(config.tabletBoxPaddingX ?? boxPaddingX ?? config.mobileBoxPaddingX) ?? boxPaddingXMobile) : "0px";
  const boxPaddingXDesktop = useBoxDesktop ? (formatSpacing(boxPaddingX ?? config.tabletBoxPaddingX ?? config.mobileBoxPaddingX) ?? boxPaddingXTablet) : "0px";

  // --- Responsive Background / Overlay ---
  const bgColorMobile = normalizeColor(config.mobileBackgroundColor ?? backgroundColor, useBoxMobile ? 'var(--bg-elevated, #ffffff)' : 'transparent');
  const bgColorTablet = normalizeColor(config.tabletBackgroundColor ?? backgroundColor ?? config.mobileBackgroundColor, bgColorMobile);
  const bgColorDesktop = normalizeColor(backgroundColor ?? config.tabletBackgroundColor ?? config.mobileBackgroundColor, bgColorTablet);

  const bgImageMobile = typeof config.mobileBackgroundImage === 'string' && config.mobileBackgroundImage.trim() !== ''
    ? config.mobileBackgroundImage.trim()
    : (typeof backgroundImage === 'string' ? backgroundImage : '');
  const bgImageTablet = typeof config.tabletBackgroundImage === 'string' && config.tabletBackgroundImage.trim() !== ''
    ? config.tabletBackgroundImage.trim()
    : bgImageMobile;
  const bgImageDesktop = typeof backgroundImage === 'string' && backgroundImage.trim() !== ''
    ? backgroundImage.trim()
    : bgImageTablet;

  const overlayMobile = typeof config.mobileOverlayColor === 'string' && config.mobileOverlayColor.trim() !== ''
    ? config.mobileOverlayColor
    : (typeof overlayColor === 'string' ? overlayColor : '');
  const overlayTablet = typeof config.tabletOverlayColor === 'string' && config.tabletOverlayColor.trim() !== ''
    ? config.tabletOverlayColor
    : overlayMobile;
  const overlayDesktop = typeof overlayColor === 'string' && overlayColor.trim() !== ''
    ? overlayColor
    : overlayTablet;

  const bgSizeMobile = typeof config.mobileBackgroundSize === 'string' && config.mobileBackgroundSize.trim() !== ''
    ? config.mobileBackgroundSize
    : (typeof backgroundSize === 'string' && backgroundSize.trim() !== '' ? backgroundSize : 'cover');
  const bgSizeTablet = typeof config.tabletBackgroundSize === 'string' && config.tabletBackgroundSize.trim() !== ''
    ? config.tabletBackgroundSize
    : bgSizeMobile;
  const bgSizeDesktop = typeof backgroundSize === 'string' && backgroundSize.trim() !== ''
    ? backgroundSize
    : bgSizeTablet;

  const boxedMaxWidth = "var(--container-width, 1200px)";
  const containerMaxWidthMobile = isNested ? "none" : (widthModeMobile === 'full' ? 'none' : (widthModeMobile === 'custom' ? customWidthMobile : boxedMaxWidth));
  const containerMaxWidthTablet = isNested ? "none" : (widthModeTablet === 'full' ? 'none' : (widthModeTablet === 'custom' ? customWidthTablet : boxedMaxWidth));
  const containerMaxWidthDesktop = isNested ? "none" : (widthModeDesktop === 'full' ? 'none' : (widthModeDesktop === 'custom' ? customWidthDesktop : boxedMaxWidth));

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .public-theme #section-${block.id} {
            margin-top: ${mtMobile} !important;
            margin-bottom: ${mbMobile} !important;
            margin-left: ${mlMobile} !important;
            margin-right: ${mrMobile} !important;
            --section-widget-gap: ${blockGapMobile};
            --section-column-gap: ${columnGapMobile};
        }
        .public-theme #section-container-${block.id} {
            width: 100% !important;
            max-width: ${containerMaxWidthMobile} !important;
        }
        .public-theme #section-surface-${block.id} {
            padding-top: ${ptMobile} !important;
            padding-bottom: ${pbMobile} !important;
            padding-left: ${plMobile} !important;
            padding-right: ${prMobile} !important;
            background-color: ${bgColorMobile} !important;
            background-image: ${bgImageMobile ? `url(${bgImageMobile})` : 'none'} !important;
            background-size: ${bgImageMobile ? bgSizeMobile : 'auto'} !important;
            border-style: ${borderStyleMobile} !important;
            border-color: ${borderColorMobile} !important;
            border-top-width: ${btMobile} !important;
            border-bottom-width: ${bbMobile} !important;
            border-left-width: ${blMobile} !important;
            border-right-width: ${brMobile} !important;
            box-shadow: ${shadowMobile} !important;
            border-radius: ${radiusMobile} !important;
        }
        .public-theme #section-overlay-${block.id} {
            background-color: ${overlayMobile || 'transparent'} !important;
        }
        .public-theme #section-box-content-${block.id} {
            padding-top: ${boxPaddingYMobile} !important;
            padding-bottom: ${boxPaddingYMobile} !important;
            padding-left: ${boxPaddingXMobile} !important;
            padding-right: ${boxPaddingXMobile} !important;
        }
        @media (min-width: 768px) {
            .public-theme #section-${block.id} {
                margin-top: ${mtTablet} !important;
                margin-bottom: ${mbTablet} !important;
                margin-left: ${mlTablet} !important;
                margin-right: ${mrTablet} !important;
                --section-widget-gap: ${blockGapTablet};
                --section-column-gap: ${columnGapTablet};
            }
            .public-theme #section-container-${block.id} {
                max-width: ${containerMaxWidthTablet} !important;
            }
            .public-theme #section-surface-${block.id} {
                padding-top: ${ptTablet} !important;
                padding-bottom: ${pbTablet} !important;
                padding-left: ${plTablet} !important;
                padding-right: ${prTablet} !important;
                background-color: ${bgColorTablet} !important;
                background-image: ${bgImageTablet ? `url(${bgImageTablet})` : 'none'} !important;
                background-size: ${bgImageTablet ? bgSizeTablet : 'auto'} !important;
                border-style: ${borderStyleTablet} !important;
                border-color: ${borderColorTablet} !important;
                border-top-width: ${btTablet} !important;
                border-bottom-width: ${bbTablet} !important;
                border-left-width: ${blTablet} !important;
                border-right-width: ${brTablet} !important;
                box-shadow: ${shadowTablet} !important;
                border-radius: ${radiusTablet} !important;
            }
            .public-theme #section-overlay-${block.id} {
                background-color: ${overlayTablet || overlayMobile || 'transparent'} !important;
            }
            .public-theme #section-box-content-${block.id} {
                padding-top: ${boxPaddingYTablet} !important;
                padding-bottom: ${boxPaddingYTablet} !important;
                padding-left: ${boxPaddingXTablet} !important;
                padding-right: ${boxPaddingXTablet} !important;
            }
        }
        @media (min-width: 1025px) {
            .public-theme #section-${block.id} {
                margin-top: ${mtDesktop} !important;
                margin-bottom: ${mbDesktop} !important;
                margin-left: ${mlDesktop} !important;
                margin-right: ${mrDesktop} !important;
                --section-widget-gap: ${blockGapDesktop};
                --section-column-gap: ${columnGapDesktop};
            }
            .public-theme #section-container-${block.id} {
                max-width: ${containerMaxWidthDesktop} !important;
            }
            .public-theme #section-surface-${block.id} {
                padding-top: ${ptDesktop} !important;
                padding-bottom: ${pbDesktop} !important;
                padding-left: ${plDesktop} !important;
                padding-right: ${prDesktop} !important;
                background-color: ${bgColorDesktop} !important;
                background-image: ${bgImageDesktop ? `url(${bgImageDesktop})` : 'none'} !important;
                background-size: ${bgImageDesktop ? bgSizeDesktop : 'auto'} !important;
                border-style: ${borderStyleDesktop} !important;
                border-color: ${borderColorDesktop} !important;
                border-top-width: ${btDesktop} !important;
                border-bottom-width: ${bbDesktop} !important;
                border-left-width: ${blDesktop} !important;
                border-right-width: ${brDesktop} !important;
                box-shadow: ${shadowDesktop} !important;
                border-radius: ${radiusDesktop} !important;
            }
            .public-theme #section-overlay-${block.id} {
                background-color: ${overlayDesktop || overlayTablet || overlayMobile || 'transparent'} !important;
            }
            .public-theme #section-box-content-${block.id} {
                padding-top: ${boxPaddingYDesktop} !important;
                padding-bottom: ${boxPaddingYDesktop} !important;
                padding-left: ${boxPaddingXDesktop} !important;
                padding-right: ${boxPaddingXDesktop} !important;
            }
        }
      `}} />

      <section 
        id={`section-${block.id}`}
        className="relative w-full"
      >
        <div id={`section-container-${block.id}`} className={isNested ? "relative w-full" : "relative w-full mx-auto px-4"}>
             {/* Box Container (if enabled) */}
             <div 
                id={`section-surface-${block.id}`}
                className="relative w-full"
                style={{
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
             >
                  {/* Box Overlay */}
                  {(bgImageMobile || bgImageTablet || bgImageDesktop) && (
                      <div 
                          id={`section-overlay-${block.id}`}
                          className="absolute inset-0 pointer-events-none z-0" 
                          style={{ backgroundColor: overlayMobile }}
                      />
                  )}

                  <div 
                    id={`section-box-content-${block.id}`}
                    className="relative z-10"
                  >
                    {title && <h2 className="text-2xl font-bold mb-3 border-b pb-2">{title}</h2>}
                    
                    <div 
                        id={`section-grid-${block.id}`}
                        className="grid grid-cols-1 md:grid-cols-12"
                        style={{ 
                            columnGap: 'var(--section-column-gap)',
                            rowGap: 'var(--section-widget-gap)'
                        }}
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
    </>
  );
}
