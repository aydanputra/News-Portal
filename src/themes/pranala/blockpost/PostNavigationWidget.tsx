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
  const resolvedMetaColor = isPublicDarkMode ? "var(--fg-secondary)" : metaColor;
  const titleFontSize = getResponsiveConfig("titleFontSize");
  const titleLineHeight = getResponsiveConfig("titleLineHeight");
  const titleFontWeight = toFontWeight(getResponsiveConfig("titleFontWeight"), "700");
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
  const wrapperStyle: React.CSSProperties = {
    ...wrapperDecorations,
    border: showNavBorder ? `${navBorderWidth}px solid ${navBorderColor}` : "none",
    borderRadius: "var(--home-main-box-radius, 0.75rem)",
    overflow: "hidden",
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft
  };
  const panelStyleMap: Record<string, React.CSSProperties> = {
    minimal: { backgroundColor: "transparent" },
    soft: { backgroundColor: "color-mix(in srgb, var(--bg-surface) 88%, var(--accent) 12%)" },
    card: { backgroundColor: "var(--bg-surface)" }
  };

  const renderCard = (item: any, direction: "prev" | "next") => {
    const isNext = direction === "next";
    const label = isNext ? "Artikel Selanjutnya" : "Artikel Sebelumnya";
    const href = item ? `/${item.category?.slug || post?.category?.slug}/${item.slug}` : "#";
    const imageUrl = item ? getPostImageUrl(item) : undefined;
    const isVideo = String((item as any)?.type || "").toUpperCase() === "VIDEO";
    const isUnavailable = !item;
    const isHovered = hoveredCard === direction && !preview;
    const icon = isNext ? <ArrowRight size={preview ? 13 : 15} /> : <ArrowLeft size={preview ? 13 : 15} />;

    const content = (
      <div
        className={`group relative flex h-full min-h-[104px] items-stretch transition-all ${isUnavailable ? "opacity-80" : ""}`}
        style={panelStyleMap[navigationDesign]}
      >
        {navigationDesign !== "minimal" && (
          <span
            className={`absolute ${preview ? "inset-y-0 top-auto h-auto w-0.5" : "inset-x-0 top-0 h-0.5 w-auto"}`}
            style={{ backgroundColor: accentColor, [preview ? (isNext ? "left" : "right") : "left"]: 0 }}
          />
        )}
        <div className={`flex h-full w-full items-stretch gap-3 ${isNext ? "flex-row-reverse" : ""}`}>
          {showNavThumbnail && (
            imageUrl ? (
              <span
                className={`relative shrink-0 overflow-hidden bg-[var(--bg-base)] ${preview ? "h-14 w-14" : "h-20 w-20"}`}
                style={{ borderRadius: "var(--home-main-box-radius, 0.75rem)" }}
              >
                <Image
                  src={imageUrl}
                  alt={item?.title || label}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
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
                className={`inline-flex shrink-0 items-center justify-center border border-dashed border-[var(--border)] bg-[var(--bg-base)] text-[var(--fg-muted)] ${preview ? "h-14 w-14" : "h-20 w-20"}`}
                style={{ borderRadius: "var(--home-main-box-radius, 0.75rem)" }}
              >
                {icon}
              </span>
            )
          )}

          <div className={`min-w-0 flex flex-1 flex-col justify-between ${isNext ? "items-end text-right" : "items-start text-left"}`}>
            {showNavLabel && (
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: resolvedMetaColor }}>
                {label}
              </div>
            )}
            <div
              className={`w-full leading-snug transition-colors ${isUnavailable ? "opacity-70" : ""} ${preview ? "text-[12px]" : ""}`}
              style={{
                ...titleClampStyle,
                color: isHovered ? titleHoverColor : titleColor,
                fontSize: toPx(titleFontSize) || undefined,
                lineHeight: typeof titleLineHeight === "number" ? titleLineHeight : undefined,
                fontWeight: titleFontWeight
              }}
            >
              {item?.title || label}
            </div>
            {showNavArrow && (
              <div
                className="mt-3 inline-flex items-center gap-1 border px-2.5 py-1 text-[11px] font-medium"
                style={{
                  color: resolvedMetaColor,
                  borderColor: showNavBorder ? navBorderColor : `color-mix(in srgb, ${navBorderColor} 55%, transparent)`,
                  borderRadius: "var(--home-main-box-radius, 0.75rem)",
                  backgroundColor: navigationDesign === "minimal"
                    ? "transparent"
                    : (isPublicDarkMode ? "rgba(15, 23, 42, 0.5)" : "color-mix(in srgb, var(--bg-base) 84%, transparent)")
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
      return <div>{content}</div>;
    }

    return (
      <Link
        href={href}
        className="block"
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
        style={{ ...wrapperStyle, gridTemplateColumns: isSingleColumn ? "1fr" : "repeat(2, minmax(0, 1fr))" }}
      >
        <div
          className="h-full"
          style={{
            borderBottom: showNavBorder && isSingleColumn ? `${navBorderWidth}px solid ${navBorderColor}` : "none",
            borderRight: showNavBorder && !isSingleColumn ? `${navBorderWidth}px solid ${navBorderColor}` : "none"
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
