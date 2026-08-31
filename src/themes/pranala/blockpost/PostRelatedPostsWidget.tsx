import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, FolderOpen } from "lucide-react";
import { WidgetRenderContext } from "./types";
import { getPostImageUrl, parseAspectRatio, toFontWeight, toPx } from "./helpers";

const stripHtml = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

const truncateText = (value: string, limit: number) => {
  if (!value) return "";
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 1)).trimEnd()}...`;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
};

const resolveCssSize = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (!Number.isNaN(Number(trimmed))) return `${Number(trimmed)}px`;
    return trimmed;
  }
  return undefined;
};

const resolveRadiusValue = (value: unknown): string => {
  return "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))";
};

export default function PostRelatedPostsWidget({
  widget,
  post,
  blockData,
  headingColor,
  metaColor,
  contentColor,
  accentColor,
  hoverColor,
  preview,
  previewDeviceTab,
  widgetContainerStyle,
  getResponsiveConfig,
  getConfigBool,
  isPublicDarkMode
}: WidgetRenderContext) {
  const related = blockData[widget.id] || [];
  const limitValue = getResponsiveConfig("limit");
  const resolvedLimit = typeof limitValue === "number" ? limitValue : Number(limitValue);
  const limit = Math.max(1, Math.min(Number.isFinite(resolvedLimit) ? resolvedLimit : 3, 12));
  const fallbackItems = Array.from({ length: Math.max(1, Math.min(limit, 6)) }).map((_, i) => ({
    id: `r-${i + 1}`,
    title: `Artikel terkait ${i + 1}`,
    slug: `artikel-terkait-${i + 1}`,
    excerpt: "Ringkasan artikel terkait untuk menjaga ritme visual kartu tetap realistis di preview builder.",
    publishedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 4).toISOString(),
    category: { name: post?.category?.name || "Kategori", slug: post?.category?.slug || "kategori" },
    image: "/placeholder.jpg"
  }));
  const items = Array.isArray(related) && related.length > 0 ? related : (preview ? fallbackItems : []);
  if (items.length === 0) return null;

  const layoutValue = getResponsiveConfig("layout");
  const relatedLayout = layoutValue === "list" ? "list" : "grid";
  const designValue = getResponsiveConfig("relatedDesign");
  const relatedDesign = designValue === "minimal" || designValue === "soft" ? designValue : "card";
  const showThumbnail = getConfigBool("showRelatedThumbnail", true);
  const showMeta = getConfigBool("showRelatedMeta", true);
  const showExcerpt = getConfigBool("showRelatedExcerpt", true);
  const showCategory = getConfigBool("showRelatedCategory", true);
  const showDate = getConfigBool("showRelatedDate", true);
  const columnsValue = Number(getResponsiveConfig("relatedColumns"));
  const relatedColumns = Number.isFinite(columnsValue) ? Math.min(Math.max(columnsValue, 1), 4) : 3;
  const excerptLengthValue = Number(getResponsiveConfig("excerptLength"));
  const excerptLength = Number.isFinite(excerptLengthValue) ? excerptLengthValue : 120;
  const thumbnailRatio = parseAspectRatio(getResponsiveConfig("thumbnailRatio"), "16 / 10");
  const titleColor = (getResponsiveConfig("titleColor") as string) || (isPublicDarkMode ? "var(--fg-primary)" : headingColor);
  const titleHoverColor = (getResponsiveConfig("titleHoverColor") as string) || hoverColor || accentColor;
  const titleFontSize = toPx(getResponsiveConfig("titleFontSize")) || (preview ? "12px" : "1rem");
  const titleLineHeight = typeof getResponsiveConfig("titleLineHeight") === "number" ? getResponsiveConfig("titleLineHeight") as number : 1.45;
  const titleFontWeight = toFontWeight(getResponsiveConfig("titleFontWeight"), "700");
  const relatedMetaColor = (getResponsiveConfig("relatedMetaColor") as string) || (isPublicDarkMode ? "var(--fg-secondary)" : metaColor);
  const relatedExcerptColor = (getResponsiveConfig("relatedExcerptColor") as string) || (isPublicDarkMode ? "var(--fg-secondary)" : contentColor);
  const relatedCardColor = (getResponsiveConfig("relatedCardColor") as string) || (isPublicDarkMode ? "rgba(15, 23, 42, 0.42)" : "var(--bg-surface)");
  const relatedBorderColor = (getResponsiveConfig("relatedBorderColor") as string) || (isPublicDarkMode ? "rgba(148, 163, 184, 0.2)" : "var(--border)");
  const activeDeviceTab = previewDeviceTab;
  const isMobileLayout = activeDeviceTab === "mobile";
  const showWidgetTitle = getConfigBool("showTitle", true);
  const configuredHeadingText =
    typeof getResponsiveConfig("headingText") === "string" && String(getResponsiveConfig("headingText")).trim() !== ""
      ? String(getResponsiveConfig("headingText")).trim()
      : "";
  const widgetTitle = configuredHeadingText || (typeof widget?.title === "string" && widget.title.trim() !== "" ? widget.title.trim() : "Artikel Terkait");
  const blockTitleColor = (getResponsiveConfig("blockTitleColor") as string) || (isPublicDarkMode ? "var(--fg-primary)" : headingColor);
  const blockTitleBorderColor = (getResponsiveConfig("blockTitleBorderColor") as string) || accentColor;
  const blockTitleFontSize = toPx(getResponsiveConfig("blockTitleFontSize")) || "1.25rem";
  const blockTitleLineHeightValue = getResponsiveConfig("blockTitleLineHeight");
  const blockTitleLineHeight =
    typeof blockTitleLineHeightValue === "number"
      ? `${blockTitleLineHeightValue}`
      : typeof blockTitleLineHeightValue === "string" && blockTitleLineHeightValue.trim() !== ""
        ? blockTitleLineHeightValue
        : "1.3";
  const blockTitleMarginBottom = toPx(getResponsiveConfig("blockTitleMarginBottom")) || (activeDeviceTab === "mobile" ? "12px" : activeDeviceTab === "tablet" ? "14px" : "16px");
  const blockTitlePaddingBottom = toPx(getResponsiveConfig("blockTitlePaddingBottom")) || "12px";
  const configuredImageWidth = resolveCssSize(getResponsiveConfig("imageWidth"));
  const configuredImageHeight = resolveCssSize(getResponsiveConfig("imageHeight"));
  const configuredImageRadius = resolveRadiusValue(getResponsiveConfig("imageBorderRadius"));
  const titleClampStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: relatedLayout === "list" ? 2 : 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  };
  const excerptClampStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: relatedLayout === "list" ? 2 : 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  };
  const gridTemplateColumns = preview
    ? relatedLayout === "grid"
      ? `repeat(${Math.max(1, relatedColumns)}, minmax(0, 1fr))`
      : "1fr"
    : relatedLayout === "grid"
      ? `repeat(${Math.max(1, relatedColumns)}, minmax(0, 1fr))`
      : "1fr";
  const gridClassName = "grid gap-4";
  const rawTextAlign = widgetContainerStyle?.textAlign;
  const contentAlign = rawTextAlign === "center" || rawTextAlign === "right" ? rawTextAlign : "left";
  const isRightAligned = contentAlign === "right";
  const isCenterAligned = contentAlign === "center";
  const reverseImageOnly = relatedLayout === "list" && isRightAligned && !isCenterAligned;
  const textAlignMode: "left" | "center" | "right" = isCenterAligned ? "center" : (reverseImageOnly ? "left" : (isRightAligned ? "right" : "left"));

  return (
    <div
      className="space-y-4"
      style={{
        ...widgetContainerStyle
      }}
    >
      {showWidgetTitle && (
        <h3
          className="font-bold border-b border-[color:var(--border,#e5e7eb)] flex items-center theme-widget-title"
          style={{ marginBottom: blockTitleMarginBottom, paddingBottom: blockTitlePaddingBottom }}
        >
          <div
            className="widget-title-bar"
            style={{ borderRadius: "var(--home-main-box-radius, 0.25rem)", backgroundColor: blockTitleBorderColor }}
          ></div>
          <span style={{ color: blockTitleColor, fontSize: blockTitleFontSize, lineHeight: blockTitleLineHeight }}>
            {widgetTitle}
          </span>
        </h3>
      )}
      <div className={gridClassName} style={{ gridTemplateColumns }}>
        {items.map((item: any) => {
          const href = `/${item.category?.slug || post?.category?.slug}/${item.slug}`;
          const imageUrl = getPostImageUrl(item);
          const isVideo = String((item as any)?.type || "").toUpperCase() === "VIDEO";
          const dateText = formatDate(item.publishedAt || item.createdAt);
          const rawExcerpt = stripHtml(item.excerpt || item.content);
          const excerptText = truncateText(rawExcerpt, excerptLength);

          const articleTextClassName =
            relatedLayout === "list"
              ? textAlignMode === "right"
                ? "items-end text-right"
                : textAlignMode === "center"
                  ? "items-center text-center"
                  : "items-start text-left"
              : textAlignMode === "right"
                ? "items-end text-right"
                : textAlignMode === "center"
                  ? "items-center text-center"
                  : "items-start text-left";
          const metaClassName = textAlignMode === "right"
            ? "justify-end text-right"
            : textAlignMode === "center"
              ? "justify-center text-center"
              : "justify-start text-left";
          const listItemLayoutClassName =
            relatedLayout === "list"
              ? reverseImageOnly
                ? "flex flex-row-reverse gap-3"
                : "flex flex-row gap-3"
              : "space-y-3";
          const thumbnailClassName =
            relatedLayout === "list"
              ? ""
              : configuredImageWidth
                ? ""
                : "w-full";
          const thumbnailSizes =
            relatedLayout === "list"
              ? isMobileLayout
                ? "112px"
                : "220px"
              : preview
                ? "220px"
                : "360px";
          const thumbnailAspectRatio = relatedLayout === "list"
            ? (isMobileLayout ? "1 / 1" : "16 / 10")
            : thumbnailRatio;
          const thumbnailWidth = configuredImageWidth || (relatedLayout === "list" ? (isMobileLayout ? "112px" : "220px") : "100%");
          const thumbnailStyle: React.CSSProperties = {
            borderRadius: configuredImageRadius,
            width: thumbnailWidth,
            maxWidth: "100%",
            height: configuredImageHeight,
            aspectRatio: configuredImageHeight ? undefined : thumbnailAspectRatio,
            alignSelf: relatedLayout === "grid" && configuredImageWidth
              ? (textAlignMode === "right" ? "flex-end" : textAlignMode === "center" ? "center" : "flex-start")
              : undefined,
          };

          return (
            <article
              key={item.id}
              className={`group h-full overflow-hidden border transition-all duration-300 ${
                relatedDesign === "minimal"
                  ? "hover:border-[var(--border)]"
                  : relatedDesign === "soft"
                    ? "shadow-sm hover:shadow-md"
                    : "shadow-sm hover:-translate-y-0.5 hover:shadow-lg"
              } ${relatedLayout === "list" ? (isMobileLayout ? "p-3" : "p-4") : "p-3"}`}
              style={{
                backgroundColor: relatedDesign === "minimal" ? "transparent" : relatedCardColor,
                borderColor: relatedBorderColor,
                boxShadow: relatedDesign === "minimal"
                  ? "none"
                  : (isPublicDarkMode ? "0 8px 22px rgba(0, 0, 0, 0.22)" : undefined),
                borderRadius: "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))"
              }}
            >
              <div
                className={`${listItemLayoutClassName} h-full`}
              >
                {showThumbnail && (
                  <Link
                    href={href}
                    className={`relative block shrink-0 overflow-hidden bg-[var(--bg-base)] ${thumbnailClassName}`}
                    style={thumbnailStyle}
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes={thumbnailSizes}
                        unoptimized={preview}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs" style={{ color: relatedMetaColor }}>
                        Thumbnail
                      </div>
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
                  </Link>
                )}

                <div className={`flex min-w-0 flex-1 flex-col ${articleTextClassName}`}>
                  {showMeta && (showCategory || (showDate && dateText)) && (
                    <div className={`mb-2 flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-[11px] ${metaClassName}`} style={{ color: relatedMetaColor }}>
                      {showCategory && item.category?.name && (
                        <span className="inline-flex items-center gap-1">
                          <FolderOpen size={12} />
                          {item.category.name}
                        </span>
                      )}
                      {showDate && dateText && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={12} />
                          {dateText}
                        </span>
                      )}
                    </div>
                  )}

                  <Link
                    href={href}
                    className="w-full transition-colors"
                    style={{
                      color: titleColor,
                      fontSize: titleFontSize,
                      lineHeight: titleLineHeight,
                      fontWeight: titleFontWeight
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = titleHoverColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = titleColor;
                    }}
                  >
                    <span style={titleClampStyle}>{item.title}</span>
                  </Link>

                  {showExcerpt && excerptText && (
                    <p className="mt-2 w-full text-sm leading-6" style={{ ...excerptClampStyle, color: relatedExcerptColor }}>
                      {excerptText}
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
