"use client";

import type { PublicViewportDevice } from "./public-ui-store";
import {
  formatSpacing,
  getResponsiveValue,
  isTransparentLike,
  numPx,
  radiusValue,
  resolveBgImage,
  resolveMaxWidth,
  resolveOptionalPx,
  shadowValue,
  toNum,
  withAlpha,
} from "./header-style-utils";

export function resolveHeaderWidgetBoxStyle(cfg: any, viewportDevice: PublicViewportDevice) {
  const device = viewportDevice;
  const useBox = getResponsiveValue(cfg, "useBox", device);
  const enabled = useBox === true || useBox === "true" || useBox === 1 || useBox === "1";
  if (!enabled) {
    return { minWidth: 0 } as any;
  }

  const boxColorRaw = getResponsiveValue(cfg, "boxColor", device);
  const boxColor =
    typeof boxColorRaw === "string" && boxColorRaw.trim() !== ""
      ? boxColorRaw.trim()
      : "var(--bg-elevated, #ffffff)";

  const overlayColor = withAlpha(
    getResponsiveValue(cfg, "backgroundOverlayColor", device),
    toNum(getResponsiveValue(cfg, "backgroundOverlayOpacity", device) ?? 45)
  );
  const backgroundImage = resolveBgImage(getResponsiveValue(cfg, "backgroundImage", device), overlayColor);
  const hasBackgroundImage = backgroundImage !== "none";
  const bgSize = String(getResponsiveValue(cfg, "backgroundSize", device) || "cover").trim();
  const bgPosition = String(getResponsiveValue(cfg, "backgroundPosition", device) || "center").trim();
  const bgRepeat = String(getResponsiveValue(cfg, "backgroundRepeat", device) || "no-repeat").trim();
  const bgAttachment = String(getResponsiveValue(cfg, "backgroundAttachment", device) || "scroll").trim();

  const borderWidth = Math.max(0, toNum(getResponsiveValue(cfg, "boxBorderWidth", device)));
  const borderStyleRaw = String(getResponsiveValue(cfg, "boxBorderStyle", device) ?? "solid").trim().toLowerCase();
  const borderStyle = borderWidth > 0 ? (borderStyleRaw === "none" ? "solid" : borderStyleRaw) : undefined;
  const borderColorRaw = getResponsiveValue(cfg, "boxBorderColor", device);
  const borderColor =
    typeof borderColorRaw === "string" && borderColorRaw.trim() !== ""
      ? borderColorRaw.trim()
      : "var(--border, #e5e7eb)";

  const radiusKey = String(getResponsiveValue(cfg, "boxBorderRadius", device) ?? "global").trim().toLowerCase();
  const borderRadius = radiusKey === "global" ? "0.75rem" : radiusValue(radiusKey);

  const boxPaddingTop = resolveOptionalPx(getResponsiveValue(cfg, "boxPaddingTop", device));
  const boxPaddingRight = resolveOptionalPx(getResponsiveValue(cfg, "boxPaddingRight", device));
  const boxPaddingBottom = resolveOptionalPx(getResponsiveValue(cfg, "boxPaddingBottom", device));
  const boxPaddingLeft = resolveOptionalPx(getResponsiveValue(cfg, "boxPaddingLeft", device));

  const hasSurface = !isTransparentLike(boxColor) || hasBackgroundImage || borderWidth > 0;
  const hasBoxPadding = !!boxPaddingTop || !!boxPaddingRight || !!boxPaddingBottom || !!boxPaddingLeft;

  if (!hasSurface && !hasBoxPadding) return undefined;

  return {
    backgroundColor: !isTransparentLike(boxColor) ? boxColor : undefined,
    backgroundImage: hasBackgroundImage ? backgroundImage : undefined,
    backgroundSize: hasBackgroundImage ? bgSize : undefined,
    backgroundPosition: hasBackgroundImage ? bgPosition : undefined,
    backgroundRepeat: hasBackgroundImage ? bgRepeat : undefined,
    backgroundAttachment: hasBackgroundImage ? bgAttachment : undefined,
    borderWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
    borderStyle,
    borderColor: borderWidth > 0 ? borderColor : undefined,
    borderRadius: hasSurface ? borderRadius : undefined,
    paddingTop: boxPaddingTop,
    paddingRight: boxPaddingRight,
    paddingBottom: boxPaddingBottom,
    paddingLeft: boxPaddingLeft,
    overflow: hasSurface ? "hidden" : undefined,
    minWidth: 0,
  } as any;
}

export function buildHeaderSectionLayoutStyles(
  cfg: any,
  viewportDevice: PublicViewportDevice,
  isSticky: boolean,
  stickyLayoutEntry?: { top: number; z: number }
) {
  const desktopWidthMode = String(getResponsiveValue(cfg, "containerWidth", "desktop") || "boxed").trim().toLowerCase();
  const tabletWidthMode = String(getResponsiveValue(cfg, "containerWidth", "tablet") || desktopWidthMode || "boxed").trim().toLowerCase();
  const mobileWidthMode = String(getResponsiveValue(cfg, "containerWidth", "mobile") || tabletWidthMode || desktopWidthMode || "boxed").trim().toLowerCase();
  const desktopContentWidthMode = desktopWidthMode === "full" ? "boxed" : desktopWidthMode;
  const tabletContentWidthMode = tabletWidthMode === "full" ? "boxed" : tabletWidthMode;
  const mobileContentWidthMode = mobileWidthMode;

  const useBoxDesktop = cfg.useBox === true || cfg.useBox === "true" || cfg.useBox === 1 || cfg.useBox === "1";
  const tabletUseBoxRaw = cfg.tabletUseBox ?? cfg.useBox;
  const mobileUseBoxRaw = cfg.mobileUseBox ?? cfg.tabletUseBox ?? cfg.useBox;
  const useBoxTablet = tabletUseBoxRaw === true || tabletUseBoxRaw === "true" || tabletUseBoxRaw === 1 || tabletUseBoxRaw === "1";
  const useBoxMobile = mobileUseBoxRaw === true || mobileUseBoxRaw === "true" || mobileUseBoxRaw === 1 || mobileUseBoxRaw === "1";

  const desktopMax = resolveMaxWidth(desktopContentWidthMode, getResponsiveValue(cfg, "customContainerWidth", "desktop"));
  const tabletMax = resolveMaxWidth(
    tabletContentWidthMode,
    getResponsiveValue(cfg, "customContainerWidth", "tablet") ?? getResponsiveValue(cfg, "customContainerWidth", "desktop")
  );
  const mobileMax = resolveMaxWidth(
    mobileContentWidthMode,
    getResponsiveValue(cfg, "customContainerWidth", "mobile") ?? getResponsiveValue(cfg, "customContainerWidth", "desktop")
  );

  const baseContainerPadX =
    viewportDevice === "mobile"
      ? mobileContentWidthMode === "full"
        ? 0
        : 16
      : viewportDevice === "tablet"
        ? tabletContentWidthMode === "full"
          ? 0
          : 16
        : desktopContentWidthMode === "full"
          ? 0
          : 16;

  const desktopBgColorRaw = String(getResponsiveValue(cfg, "backgroundColor", "desktop") || "").trim();
  const tabletBgColorRaw = String(getResponsiveValue(cfg, "backgroundColor", "tablet") || "").trim();
  const mobileBgColorRaw = String(getResponsiveValue(cfg, "backgroundColor", "mobile") || "").trim();
  const desktopBgColor = desktopBgColorRaw || (isSticky || useBoxDesktop ? "var(--bg-elevated, #ffffff)" : "");
  const tabletBgColor = tabletBgColorRaw || (isSticky || useBoxTablet ? "var(--bg-elevated, #ffffff)" : "");
  const mobileBgColor = mobileBgColorRaw || (isSticky || useBoxMobile ? "var(--bg-elevated, #ffffff)" : "");

  const desktopBgImage = resolveBgImage(getResponsiveValue(cfg, "backgroundImage", "desktop"), getResponsiveValue(cfg, "overlayColor", "desktop"));
  const tabletBgImage = resolveBgImage(getResponsiveValue(cfg, "backgroundImage", "tablet"), getResponsiveValue(cfg, "overlayColor", "tablet"));
  const mobileBgImage = resolveBgImage(getResponsiveValue(cfg, "backgroundImage", "mobile"), getResponsiveValue(cfg, "overlayColor", "mobile"));
  const desktopBgSize = String(getResponsiveValue(cfg, "backgroundSize", "desktop") || "cover");
  const tabletBgSize = String(getResponsiveValue(cfg, "backgroundSize", "tablet") || desktopBgSize || "cover");
  const mobileBgSize = String(getResponsiveValue(cfg, "backgroundSize", "mobile") || desktopBgSize || "cover");

  const desktopPadTop = numPx(getResponsiveValue(cfg, "paddingTop", "desktop"), 0);
  const desktopPadBottom = numPx(getResponsiveValue(cfg, "paddingBottom", "desktop"), 0);
  const desktopPadLeft = numPx(getResponsiveValue(cfg, "paddingLeft", "desktop"), 0);
  const desktopPadRight = numPx(getResponsiveValue(cfg, "paddingRight", "desktop"), 0);
  const tabletPadTop = numPx(getResponsiveValue(cfg, "paddingTop", "tablet"), parseInt(desktopPadTop, 10) || 0);
  const tabletPadBottom = numPx(getResponsiveValue(cfg, "paddingBottom", "tablet"), parseInt(desktopPadBottom, 10) || 0);
  const tabletPadLeft = numPx(getResponsiveValue(cfg, "paddingLeft", "tablet"), parseInt(desktopPadLeft, 10) || 0);
  const tabletPadRight = numPx(getResponsiveValue(cfg, "paddingRight", "tablet"), parseInt(desktopPadRight, 10) || 0);
  const mobilePadTop = numPx(getResponsiveValue(cfg, "paddingTop", "mobile"), parseInt(desktopPadTop, 10) || 0);
  const mobilePadBottom = numPx(getResponsiveValue(cfg, "paddingBottom", "mobile"), parseInt(desktopPadBottom, 10) || 0);
  const mobilePadLeft = numPx(
    getResponsiveValue(cfg, "paddingLeft", "mobile"),
    parseInt(tabletPadLeft, 10) || parseInt(desktopPadLeft, 10) || 0
  );
  const mobilePadRight = numPx(
    getResponsiveValue(cfg, "paddingRight", "mobile"),
    parseInt(tabletPadRight, 10) || parseInt(desktopPadRight, 10) || 0
  );

  const desktopMarTop = numPx(getResponsiveValue(cfg, "marginTop", "desktop"), 0);
  const desktopMarBottom = numPx(getResponsiveValue(cfg, "marginBottom", "desktop"), 0);
  const desktopMarLeft = numPx(getResponsiveValue(cfg, "marginLeft", "desktop"), 0);
  const desktopMarRight = numPx(getResponsiveValue(cfg, "marginRight", "desktop"), 0);
  const tabletMarTop = numPx(getResponsiveValue(cfg, "marginTop", "tablet"), parseInt(desktopMarTop, 10) || 0);
  const tabletMarBottom = numPx(getResponsiveValue(cfg, "marginBottom", "tablet"), parseInt(desktopMarBottom, 10) || 0);
  const mobileMarTop = numPx(getResponsiveValue(cfg, "marginTop", "mobile"), parseInt(desktopMarTop, 10) || 0);
  const mobileMarBottom = numPx(getResponsiveValue(cfg, "marginBottom", "mobile"), parseInt(desktopMarBottom, 10) || 0);
  const mobileMarLeft = numPx(getResponsiveValue(cfg, "marginLeft", "mobile"), parseInt(desktopMarLeft, 10) || 0);
  const mobileMarRight = numPx(getResponsiveValue(cfg, "marginRight", "mobile"), parseInt(desktopMarRight, 10) || 0);

  const borderStyleDesktopRaw = String(getResponsiveValue(cfg, "borderStyle", "desktop") ?? "none");
  const borderStyleTabletRaw = String(getResponsiveValue(cfg, "borderStyle", "tablet") ?? borderStyleDesktopRaw);
  const borderStyleMobileRaw = String(getResponsiveValue(cfg, "borderStyle", "mobile") ?? borderStyleDesktopRaw);

  const borderColorDesktopRaw = String(getResponsiveValue(cfg, "borderColor", "desktop") ?? "");
  const borderColorTabletRaw = String(getResponsiveValue(cfg, "borderColor", "tablet") ?? borderColorDesktopRaw);
  const borderColorMobileRaw = String(getResponsiveValue(cfg, "borderColor", "mobile") ?? borderColorDesktopRaw);
  const borderColorDesktop = borderColorDesktopRaw.trim() !== "" ? borderColorDesktopRaw : "var(--border, #e5e7eb)";
  const borderColorTablet = borderColorTabletRaw.trim() !== "" ? borderColorTabletRaw : borderColorDesktop;
  const borderColorMobile = borderColorMobileRaw.trim() !== "" ? borderColorMobileRaw : borderColorDesktop;

  const btDesktopVal = toNum(getResponsiveValue(cfg, "borderTopWidth", "desktop"));
  const brDesktopVal = toNum(getResponsiveValue(cfg, "borderRightWidth", "desktop"));
  const bbDesktopVal = toNum(getResponsiveValue(cfg, "borderBottomWidth", "desktop"));
  const blDesktopVal = toNum(getResponsiveValue(cfg, "borderLeftWidth", "desktop"));
  const btTabletVal = toNum(getResponsiveValue(cfg, "borderTopWidth", "tablet"));
  const brTabletVal = toNum(getResponsiveValue(cfg, "borderRightWidth", "tablet"));
  const bbTabletVal = toNum(getResponsiveValue(cfg, "borderBottomWidth", "tablet"));
  const blTabletVal = toNum(getResponsiveValue(cfg, "borderLeftWidth", "tablet"));
  const btMobileVal = toNum(getResponsiveValue(cfg, "borderTopWidth", "mobile"));
  const brMobileVal = toNum(getResponsiveValue(cfg, "borderRightWidth", "mobile"));
  const bbMobileVal = toNum(getResponsiveValue(cfg, "borderBottomWidth", "mobile"));
  const blMobileVal = toNum(getResponsiveValue(cfg, "borderLeftWidth", "mobile"));

  const hasBorderDesktop = btDesktopVal > 0 || brDesktopVal > 0 || bbDesktopVal > 0 || blDesktopVal > 0;
  const hasBorderTablet = btTabletVal > 0 || brTabletVal > 0 || bbTabletVal > 0 || blTabletVal > 0;
  const hasBorderMobile = btMobileVal > 0 || brMobileVal > 0 || bbMobileVal > 0 || blMobileVal > 0;

  const desktopShadow = shadowValue(String(getResponsiveValue(cfg, "boxShadow", "desktop") ?? "none"));
  const tabletShadow = shadowValue(String(getResponsiveValue(cfg, "boxShadow", "tablet") ?? "none"));
  const mobileShadow = shadowValue(String(getResponsiveValue(cfg, "boxShadow", "mobile") ?? "none"));

  const boxPaddingYDesktop = useBoxDesktop ? formatSpacing(cfg.boxPaddingY) ?? "0px" : "0px";
  const boxPaddingYTablet = useBoxTablet ? formatSpacing(cfg.tabletBoxPaddingY ?? cfg.boxPaddingY) ?? boxPaddingYDesktop : "0px";
  const boxPaddingYMobile = useBoxMobile
    ? formatSpacing(cfg.mobileBoxPaddingY ?? cfg.tabletBoxPaddingY ?? cfg.boxPaddingY) ?? boxPaddingYTablet
    : "0px";
  const boxPaddingXDesktop = useBoxDesktop ? formatSpacing(cfg.boxPaddingX) ?? "0px" : "0px";
  const boxPaddingXTablet = useBoxTablet ? formatSpacing(cfg.tabletBoxPaddingX ?? cfg.boxPaddingX) ?? boxPaddingXDesktop : "0px";
  const boxPaddingXMobile = useBoxMobile
    ? formatSpacing(cfg.mobileBoxPaddingX ?? cfg.tabletBoxPaddingX ?? cfg.boxPaddingX) ?? boxPaddingXTablet
    : "0px";

  const desktopFrame = useBoxDesktop || hasBorderDesktop || desktopShadow !== "none";
  const tabletFrame = useBoxTablet || hasBorderTablet || tabletShadow !== "none";
  const mobileFrame = useBoxMobile || hasBorderMobile || mobileShadow !== "none";

  const borderStyleDesktop = desktopFrame
    ? hasBorderDesktop && borderStyleDesktopRaw.trim().toLowerCase() === "none"
      ? "solid"
      : borderStyleDesktopRaw
    : "none";
  const borderStyleTablet = tabletFrame
    ? hasBorderTablet && borderStyleTabletRaw.trim().toLowerCase() === "none"
      ? "solid"
      : borderStyleTabletRaw
    : "none";
  const borderStyleMobile = mobileFrame
    ? hasBorderMobile && borderStyleMobileRaw.trim().toLowerCase() === "none"
      ? "solid"
      : borderStyleMobileRaw
    : "none";

  const borderTopDesktop = desktopFrame ? `${btDesktopVal}px` : "0px";
  const borderRightDesktop = desktopFrame ? `${brDesktopVal}px` : "0px";
  const borderBottomDesktop = desktopFrame ? `${bbDesktopVal}px` : "0px";
  const borderLeftDesktop = desktopFrame ? `${blDesktopVal}px` : "0px";
  const borderTopTablet = tabletFrame ? `${btTabletVal}px` : "0px";
  const borderRightTablet = tabletFrame ? `${brTabletVal}px` : "0px";
  const borderBottomTablet = tabletFrame ? `${bbTabletVal}px` : "0px";
  const borderLeftTablet = tabletFrame ? `${blTabletVal}px` : "0px";
  const borderTopMobile = mobileFrame ? `${btMobileVal}px` : "0px";
  const borderRightMobile = mobileFrame ? `${brMobileVal}px` : "0px";
  const borderBottomMobile = mobileFrame ? `${bbMobileVal}px` : "0px";
  const borderLeftMobile = mobileFrame ? `${blMobileVal}px` : "0px";

  const borderRadiusDesktop = desktopFrame ? radiusValue(String(getResponsiveValue(cfg, "borderRadius", "desktop") ?? "none")) : "0";
  const borderRadiusTablet = tabletFrame ? radiusValue(String(getResponsiveValue(cfg, "borderRadius", "tablet") ?? "none")) : "0";
  const borderRadiusMobile = mobileFrame ? radiusValue(String(getResponsiveValue(cfg, "borderRadius", "mobile") ?? "none")) : "0";

  const effectiveMarTop = viewportDevice === "mobile" ? mobileMarTop : viewportDevice === "tablet" ? tabletMarTop : desktopMarTop;
  const effectiveMarBottom = viewportDevice === "mobile" ? mobileMarBottom : viewportDevice === "tablet" ? tabletMarBottom : desktopMarBottom;
  const effectiveMarLeft = viewportDevice === "mobile" ? mobileMarLeft : viewportDevice === "tablet" ? "0px" : desktopMarLeft;
  const effectiveMarRight = viewportDevice === "mobile" ? mobileMarRight : viewportDevice === "tablet" ? "0px" : desktopMarRight;

  return {
    sectionStyle: {
      ["--hb-sticky-top" as any]: isSticky ? `${stickyLayoutEntry?.top ?? 0}px` : undefined,
      ["--hb-sticky-z" as any]: isSticky ? stickyLayoutEntry?.z ?? 60 : undefined,
      ["--hb-desktop-bg-color" as any]: desktopBgColor || undefined,
      ["--hb-tablet-bg-color" as any]: tabletBgColor || undefined,
      ["--hb-mobile-bg-color" as any]: mobileBgColor || undefined,
      ["--hb-desktop-bg-image" as any]: desktopBgImage,
      ["--hb-tablet-bg-image" as any]: tabletBgImage,
      ["--hb-mobile-bg-image" as any]: mobileBgImage,
      ["--hb-desktop-bg-size" as any]: desktopBgSize,
      ["--hb-tablet-bg-size" as any]: tabletBgSize,
      ["--hb-mobile-bg-size" as any]: mobileBgSize,
      ["--hb-desktop-pad-top" as any]: desktopPadTop,
      ["--hb-desktop-pad-bottom" as any]: desktopPadBottom,
      ["--hb-desktop-pad-left" as any]: desktopPadLeft,
      ["--hb-desktop-pad-right" as any]: desktopPadRight,
      ["--hb-tablet-pad-top" as any]: tabletPadTop,
      ["--hb-tablet-pad-bottom" as any]: tabletPadBottom,
      ["--hb-tablet-pad-left" as any]: tabletPadLeft,
      ["--hb-tablet-pad-right" as any]: tabletPadRight,
      ["--hb-mobile-pad-top" as any]: mobilePadTop,
      ["--hb-mobile-pad-bottom" as any]: mobilePadBottom,
      ["--hb-mobile-pad-left" as any]: mobilePadLeft,
      ["--hb-mobile-pad-right" as any]: mobilePadRight,
      ["--hb-desktop-box-py" as any]: boxPaddingYDesktop,
      ["--hb-tablet-box-py" as any]: boxPaddingYTablet,
      ["--hb-mobile-box-py" as any]: boxPaddingYMobile,
      ["--hb-desktop-box-px" as any]: boxPaddingXDesktop,
      ["--hb-tablet-box-px" as any]: boxPaddingXTablet,
      ["--hb-mobile-box-px" as any]: boxPaddingXMobile,
      ["--hb-desktop-border-style" as any]: borderStyleDesktop,
      ["--hb-desktop-border-color" as any]: desktopFrame ? borderColorDesktop : "transparent",
      ["--hb-desktop-border-top" as any]: borderTopDesktop,
      ["--hb-desktop-border-right" as any]: borderRightDesktop,
      ["--hb-desktop-border-bottom" as any]: borderBottomDesktop,
      ["--hb-desktop-border-left" as any]: borderLeftDesktop,
      ["--hb-desktop-shadow" as any]: desktopFrame ? desktopShadow : "none",
      ["--hb-desktop-radius" as any]: borderRadiusDesktop,
      ["--hb-tablet-border-style" as any]: borderStyleTablet,
      ["--hb-tablet-border-color" as any]: tabletFrame ? borderColorTablet : "transparent",
      ["--hb-tablet-border-top" as any]: borderTopTablet,
      ["--hb-tablet-border-right" as any]: borderRightTablet,
      ["--hb-tablet-border-bottom" as any]: borderBottomTablet,
      ["--hb-tablet-border-left" as any]: borderLeftTablet,
      ["--hb-tablet-shadow" as any]: tabletFrame ? tabletShadow : "none",
      ["--hb-tablet-radius" as any]: borderRadiusTablet,
      ["--hb-mobile-border-style" as any]: borderStyleMobile,
      ["--hb-mobile-border-color" as any]: mobileFrame ? borderColorMobile : "transparent",
      ["--hb-mobile-border-top" as any]: borderTopMobile,
      ["--hb-mobile-border-right" as any]: borderRightMobile,
      ["--hb-mobile-border-bottom" as any]: borderBottomMobile,
      ["--hb-mobile-border-left" as any]: borderLeftMobile,
      ["--hb-mobile-shadow" as any]: mobileFrame ? mobileShadow : "none",
      ["--hb-mobile-radius" as any]: borderRadiusMobile,
      marginTop: isSticky ? 0 : effectiveMarTop,
      marginBottom: isSticky ? 0 : effectiveMarBottom,
      paddingTop: isSticky ? effectiveMarTop : undefined,
      paddingBottom: isSticky ? effectiveMarBottom : undefined,
      marginLeft: effectiveMarLeft,
      marginRight: effectiveMarRight,
    } as any,
    innerStyle: {
      ["--hb-desktop-max" as any]: desktopMax,
      ["--hb-tablet-max" as any]: tabletMax,
      ["--hb-mobile-max" as any]: mobileMax,
      paddingLeft: `${baseContainerPadX}px`,
      paddingRight: `${baseContainerPadX}px`,
    } as any,
  };
}
