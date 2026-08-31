import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { WidgetRenderContext } from "./types";
import { getPostImageUrl, toFontWeight, toPx } from "./helpers";

export default function PostNavigationWidget({
  post,
  preview,
  previewDeviceTab,
  metaColor,
  headingColor,
  accentColor,
  widgetContainerStyle,
  getResponsiveConfig,
  getConfigBool,
  isPublicDarkMode
}: WidgetRenderContext) {
  const prevPost = post?.prev_post;
  const nextPost = post?.next_post;
  const navigationDesign = (() => {
    const value = getResponsiveConfig("navigationDesign");
    return value === "minimal" || value === "soft" ? value : "card";
  })();
  const showNavLabel = getConfigBool("showNavLabel", true);
  const showNavThumbnail = getConfigBool("showNavThumbnail", true);
  const showNavArrow = getConfigBool("showNavArrow", true);
  const showNavBorder = getConfigBool("showNavBorder", true);
  const titleColor = (getResponsiveConfig("titleColor") as string) || (isPublicDarkMode ? "var(--fg-primary)" : headingColor);
  const titleHoverColor = (getResponsiveConfig("titleHoverColor") as string) || accentColor;
  const resolvedAccentColor = accentColor || "#f97316";
  const resolvedMetaColor = isPublicDarkMode ? "var(--fg-secondary)" : metaColor;
  const titleFontSize = getResponsiveConfig("titleFontSize");
  const titleLineHeight = getResponsiveConfig("titleLineHeight");
  const titleFontWeight = toFontWeight(getResponsiveConfig("titleFontWeight"), "700");
  const resolvedTitleLineHeight = typeof titleLineHeight === "number"
    ? titleLineHeight
    : Number(titleLineHeight) || 1.45;
  const titleLineCount = preview ? 2 : 3;
  const titleMinHeight = `${resolvedTitleLineHeight * titleLineCount}em`;
  const navBorderColor = (getResponsiveConfig("navBorderColor") as string) || "var(--border)";
  const navBorderWidth = typeof getResponsiveConfig("navBorderWidth") === "number"
    ? getResponsiveConfig("navBorderWidth") as number
    : Number(getResponsiveConfig("navBorderWidth")) || 1;
  const [hoveredCard, setHoveredCard] = React.useState<"prev" | "next" | null>(null);
  const activeDeviceTab = previewDeviceTab;
  const isSingleColumn = activeDeviceTab === "mobile";
  const titleClampStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: preview ? 2 : 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  };
  const {
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    textAlign,
    ...wrapperDecorations
  } = widgetContainerStyle;
  const rootStyle: React.CSSProperties = {
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    textAlign
  };
  const isCardTheme = navigationDesign === "card";
  const isMinimalTheme = navigationDesign === "minimal";
  const isSoftTheme = navigationDesign === "soft";
  const gridGap = isCardTheme || isSoftTheme
    ? (preview ? "0.65rem" : "0.9rem")
    : "0";
  const wrapperStyle: React.CSSProperties = {
    ...wrapperDecorations,
    border: !isCardTheme && !isSoftTheme && showNavBorder ? `${navBorderWidth}px solid ${navBorderColor}` : "none",
    borderRadius: !isCardTheme && !isSoftTheme ? "var(--home-main-box-radius, 0.75rem)" : undefined,
    overflow: !isCardTheme && !isSoftTheme ? "hidden" : "visible",
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft
  };

  const renderCard = (item: any, direction: "prev" | "next") => {
    const isNext = direction === "next";
    const label = isNext ? "Artikel Selanjutnya" : "Artikel Sebelumnya";
    const href = item ? `/${item.category?.slug || post?.category?.slug}/${item.slug}` : "#";
    const imageUrl = item ? getPostImageUrl(item) : undefined;
    const isVideo = String((item as any)?.type || "").toUpperCase() === "VIDEO";
    const isUnavailable = !item;
    const isHovered = hoveredCard === direction && !preview;
    const isRightThumbLayout = isNext;
    const icon = isNext ? <ArrowRight size={preview ? 13 : 15} /> : <ArrowLeft size={preview ? 13 : 15} />;
    const minimalTitleColor = isPublicDarkMode
      ? "color-mix(in srgb, var(--fg-primary) 90%, transparent)"
      : "color-mix(in srgb, var(--fg-primary) 82%, transparent)";
    const minimalTitleHoverColor = `color-mix(in srgb, ${resolvedAccentColor} 78%, var(--fg-primary) 22%)`;
    const softTitleColor = isPublicDarkMode
      ? "color-mix(in srgb, var(--fg-primary) 92%, transparent)"
      : "color-mix(in srgb, var(--fg-primary) 84%, transparent)";
    const softTitleHoverColor = `color-mix(in srgb, ${resolvedAccentColor} 74%, var(--fg-primary) 26%)`;
    const panelStyle: React.CSSProperties = navigationDesign === "minimal"
      ? {
          backgroundColor: "transparent",
          padding: "0"
        }
      : navigationDesign === "soft"
        ? {
            backgroundColor: isHovered
              ? `color-mix(in srgb, var(--bg-surface) 91%, ${resolvedAccentColor} 9%)`
              : `color-mix(in srgb, var(--bg-surface) 94%, ${resolvedAccentColor} 6%)`,
            border: isHovered
              ? `1px solid color-mix(in srgb, ${resolvedAccentColor} 18%, ${navBorderColor} 82%)`
              : `1px solid color-mix(in srgb, ${resolvedAccentColor} 10%, ${navBorderColor} 90%)`,
            borderRadius: "calc(var(--home-main-box-radius, 0.75rem) + 0.1rem)",
            padding: preview ? "0.75rem" : "0.9rem",
            boxShadow: isHovered
              ? `inset 0 1px 0 color-mix(in srgb, white 42%, transparent), 0 10px 24px -24px color-mix(in srgb, ${resolvedAccentColor} 40%, transparent)`
              : `inset 0 1px 0 color-mix(in srgb, white 38%, transparent)`
          }
        : {
            backgroundColor: "var(--bg-base)",
            border: `1px solid color-mix(in srgb, ${navBorderColor} 88%, transparent)`,
            borderRadius: "calc(var(--home-main-box-radius, 0.75rem) + 0.15rem)",
            padding: preview ? "0.8rem" : "1rem",
            boxShadow: isHovered
              ? `0 16px 30px -24px rgba(15, 23, 42, 0.22)`
              : `0 10px 22px -20px rgba(15, 23, 42, 0.18)`,
            transform: isHovered ? "translateY(-1px)" : undefined
          };
    const labelStyle: React.CSSProperties = navigationDesign === "card"
      ? {
          color: resolvedAccentColor,
          backgroundColor: `color-mix(in srgb, ${resolvedAccentColor} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${resolvedAccentColor} 14%, transparent)`,
          borderRadius: "999px",
          padding: preview ? "0.14rem 0.45rem" : "0.18rem 0.55rem"
        }
      : navigationDesign === "soft"
        ? {
            color: isPublicDarkMode
              ? "color-mix(in srgb, var(--fg-primary) 86%, transparent)"
              : "color-mix(in srgb, var(--fg-primary) 72%, transparent)",
            backgroundColor: isHovered ? `color-mix(in srgb, ${resolvedAccentColor} 8%, transparent)` : "transparent",
            borderRadius: "999px",
            padding: preview ? "0.12rem 0.38rem" : "0.14rem 0.42rem"
          }
        : {
            color: isHovered
              ? `color-mix(in srgb, ${resolvedAccentColor} 72%, var(--fg-primary) 28%)`
              : resolvedMetaColor
          };
    const actionStyle: React.CSSProperties = navigationDesign === "card"
      ? {
          color: isHovered ? titleHoverColor : resolvedAccentColor,
          borderColor: `color-mix(in srgb, ${resolvedAccentColor} 16%, transparent)`,
          borderRadius: "999px",
          backgroundColor: `color-mix(in srgb, ${resolvedAccentColor} 10%, transparent)`
        }
      : navigationDesign === "soft"
        ? {
            color: isHovered
              ? softTitleHoverColor
              : isPublicDarkMode
              ? "color-mix(in srgb, var(--fg-primary) 88%, transparent)"
              : "color-mix(in srgb, var(--fg-primary) 76%, transparent)",
            borderColor: isHovered
              ? `color-mix(in srgb, ${resolvedAccentColor} 18%, ${navBorderColor} 82%)`
              : `color-mix(in srgb, ${resolvedAccentColor} 8%, ${navBorderColor} 92%)`,
            borderRadius: "var(--home-main-box-radius, 0.75rem)",
            backgroundColor: isHovered
              ? `color-mix(in srgb, ${resolvedAccentColor} 10%, white 90%)`
              : "color-mix(in srgb, white 14%, transparent)"
          }
        : {
            color: isHovered ? minimalTitleHoverColor : resolvedMetaColor,
            borderColor: "transparent",
            borderRadius: "0",
            borderBottom: `1px solid color-mix(in srgb, ${resolvedAccentColor} ${isHovered ? "26%" : "14%"}, transparent)`,
            backgroundColor: "transparent"
          };
    const thumbRadius = "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))";
    const hasThumbnailColumn = showNavThumbnail;
    const cardLayoutStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: hasThumbnailColumn
        ? (isRightThumbLayout
          ? `minmax(0, 1fr) ${preview ? "3.5rem" : "4.75rem"}`
          : `${preview ? "3.5rem" : "4.75rem"} minmax(0, 1fr)`)
        : "minmax(0, 1fr)",
      alignItems: "start",
      columnGap: preview ? "0.75rem" : "0.9rem",
      minHeight: preview ? "5.25rem" : "6.25rem"
    };

    const content = (
      <div
        className={`group relative flex h-full min-h-[104px] items-stretch transition-all duration-300 ${isUnavailable ? "opacity-80" : ""}`}
        style={panelStyle}
      >
        {navigationDesign === "card" && (
          <span
            className="absolute inset-x-4 top-0 h-[3px] rounded-b-full"
            style={{ backgroundColor: resolvedAccentColor }}
          />
        )}
        <div className="h-full w-full" style={cardLayoutStyle}>
          {showNavThumbnail && (
            imageUrl ? (
              <span
                className={`relative overflow-hidden bg-[var(--bg-base)] ${
                  preview ? "h-14 w-14" : "h-[76px] w-[76px]"
                }`}
                style={{
                  borderRadius: thumbRadius,
                  gridColumn: isRightThumbLayout ? "2" : undefined,
                  gridRow: "1",
                  justifySelf: isRightThumbLayout ? "end" : undefined,
                  border: navigationDesign === "soft"
                    ? (isHovered
                      ? `1px solid color-mix(in srgb, ${resolvedAccentColor} 18%, ${navBorderColor} 82%)`
                      : `1px solid color-mix(in srgb, ${resolvedAccentColor} 10%, ${navBorderColor} 90%)`)
                    : navigationDesign === "minimal"
                      ? `1px solid color-mix(in srgb, ${resolvedAccentColor} ${isHovered ? "22%" : "12%"}, ${navBorderColor} ${isHovered ? "78%" : "88%"})`
                    : undefined,
                  boxShadow: navigationDesign === "card"
                    ? "0 8px 18px -16px rgba(0, 0, 0, 0.28)"
                    : navigationDesign === "soft"
                      ? (isHovered
                        ? "inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 8px 18px -18px rgba(0, 0, 0, 0.12)"
                        : "inset 0 1px 0 rgba(255, 255, 255, 0.35)")
                      : navigationDesign === "minimal"
                        ? `0 0 0 1px color-mix(in srgb, ${resolvedAccentColor} ${isHovered ? "10%" : "0%"}, transparent)`
                      : undefined
                }}
              >
                <Image
                  src={imageUrl}
                  alt={item?.title || label}
                  fill
                  className={`object-cover transition-transform duration-300 group-hover:scale-105 ${navigationDesign === "minimal" ? "saturate-[0.96]" : ""}`}
                  sizes={preview ? "56px" : "80px"}
                  unoptimized={preview}
                />
                {isVideo && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className={`flex items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm ${preview ? "h-8 w-8" : "h-10 w-10"}`}>
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={`${preview ? "h-4 w-4" : "h-5 w-5"} translate-x-[0.5px]`}>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                )}
              </span>
            ) : (
              <span
                className={`inline-flex items-center justify-center border border-dashed border-[var(--border)] bg-[var(--bg-base)] text-[var(--fg-muted)] ${
                  preview ? "h-14 w-14" : "h-[76px] w-[76px]"
                }`}
                style={{ borderRadius: thumbRadius, gridColumn: isRightThumbLayout ? "2" : undefined, gridRow: "1", justifySelf: isRightThumbLayout ? "end" : undefined }}
              >
                {icon}
              </span>
            )
          )}

          <div
            className={`flex h-full min-w-0 flex-col ${isRightThumbLayout ? "items-end text-right" : "items-start text-left"}`}
            style={{ gridColumn: isRightThumbLayout ? "1" : undefined, gridRow: "1" }}
          >
            <div className="flex w-full min-w-0 flex-1 flex-col">
              {showNavLabel && (
                <div
                  className={`flex w-full items-center text-[10px] font-semibold uppercase tracking-[0.16em] ${
                    isRightThumbLayout ? "justify-end text-right" : "justify-start text-left"
                  }`}
                  style={labelStyle}
                >
                  {label}
                </div>
              )}
              <div
                className={`w-full leading-snug transition-colors ${isUnavailable ? "opacity-70" : ""} ${preview ? "text-[12px]" : ""}`}
                style={{
                  ...titleClampStyle,
                  color: navigationDesign === "soft"
                    ? (isHovered ? softTitleHoverColor : softTitleColor)
                    : navigationDesign === "minimal"
                      ? (isHovered ? minimalTitleHoverColor : minimalTitleColor)
                      : (isHovered ? titleHoverColor : titleColor),
                  fontSize: toPx(titleFontSize) || undefined,
                  lineHeight: resolvedTitleLineHeight,
                  fontWeight: titleFontWeight,
                  minHeight: titleMinHeight,
                  marginTop: showNavLabel ? (preview ? "0.35rem" : "0.45rem") : "0"
                }}
              >
                {item?.title || label}
              </div>
            </div>
            {showNavArrow && (
              <div
                className={`mt-auto inline-flex items-center justify-center gap-1 border px-2.5 py-1 text-[11px] font-medium ${isRightThumbLayout ? "self-end" : "self-start"}`}
                style={{
                  ...actionStyle,
                  minWidth: preview ? "6.5rem" : "7.5rem",
                  marginTop: preview ? "0.45rem" : "0.6rem"
                }}
              >
                {!isNext && icon}
                <span>{isNext ? "Buka artikel" : "Kembali baca"}</span>
                {isNext && icon}
              </div>
            )}
          </div>
        </div>
      </div>
    );

    if (isUnavailable || preview) {
      return <div className="h-full">{content}</div>;
    }

    return (
      <Link
        href={href}
        className="block h-full"
        onMouseEnter={() => setHoveredCard(direction)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {content}
      </Link>
    );
  };

  return (
    <div style={rootStyle}>
      <div
        className="grid items-stretch"
        style={{ ...wrapperStyle, gridTemplateColumns: isSingleColumn ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: gridGap }}
      >
        <div
          className="h-full"
          style={{
            borderBottom: !isCardTheme && !isSoftTheme && showNavBorder && isSingleColumn ? `${navBorderWidth}px solid ${navBorderColor}` : "none",
            borderRight: !isCardTheme && !isSoftTheme && showNavBorder && !isSingleColumn ? `${navBorderWidth}px solid ${navBorderColor}` : "none"
          }}
        >
          {renderCard(prevPost, "prev")}
        </div>
        <div className="h-full">
          {renderCard(nextPost, "next")}
        </div>
      </div>
    </div>
  );
}
