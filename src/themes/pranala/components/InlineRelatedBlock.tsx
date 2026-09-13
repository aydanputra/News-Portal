"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { resolveThemeFontFamily, resolveThemeFontSynthesis } from "@/lib/font-utils";
import { getYouTubeThumbnailUrl } from "@/lib/utils";

export interface InlineRelatedItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | Date | null;
  createdAt?: string | Date | null;
  image?: string | null;
  featuredImage?: { fileUrl?: string | null; url?: string | null } | null;
  category?: { name?: string | null; slug?: string | null } | null;
}

export interface InlineRelatedConfig {
  enabled: boolean;
  positions: number[];
  count: number;
  layout: string;
  gridColumns: number;
  cardColumns: number;
  titleFontSize: number;
  titleFont: string;
  titleFontWeight: string;
  titleLineHeight: string;
  headingText: string;
  headingFont: string;
  headingFontWeight: string;
  headingLetterSpacing: string;
  fontSize: number;
  headingColor: string;
  textColor: string;
  hoverColor: string;
}

const formatDate = (value?: string | Date | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};
const toPlainText = (value?: string | null) => {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
};
const getInlineRelatedImageUrl = (item: InlineRelatedItem) => {
  const candidates = [
    item.image,
    item.featuredImage?.fileUrl,
    item.featuredImage?.url,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() !== "") {
      const trimmed = candidate.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) return trimmed;
      return `/${trimmed.replace(/^\/+/, "")}`;
    }
  }
  const rawItem = item as InlineRelatedItem & { type?: unknown; videoUrl?: unknown };
  if (rawItem.type === "VIDEO" && typeof rawItem.videoUrl === "string") {
    const thumbnail = getYouTubeThumbnailUrl(rawItem.videoUrl, "hqdefault");
    if (thumbnail) return thumbnail;
  }
  return "";
};

export default function InlineRelatedBlock({
  items,
  layout,
  gridColumns,
  cardColumns,
  titleFontSize,
  titleFont,
  titleFontWeight,
  titleLineHeight,
  headingText,
  headingFont,
  headingFontWeight,
  headingLetterSpacing,
  fontSize,
  headingColor,
  textColor,
  hoverColor,
}: {
  items: InlineRelatedItem[];
  layout: string;
  gridColumns: number;
  cardColumns: number;
  titleFontSize: number;
  titleFont: string;
  titleFontWeight: string;
  titleLineHeight: string;
  headingText: string;
  headingFont: string;
  headingFontWeight: string;
  headingLetterSpacing: string;
  fontSize: number;
  headingColor: string;
  textColor: string;
  hoverColor: string;
}) {
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const resolvedTitleFont = resolveThemeFontFamily(titleFont);
  const resolvedTitleFontSynthesis = resolveThemeFontSynthesis(titleFont);
  const resolvedHeadingFont = resolveThemeFontFamily(headingFont);
  const resolvedHeadingFontSynthesis = resolveThemeFontSynthesis(headingFont);
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const updateDarkMode = () => setIsDarkMode(root.classList.contains("public-dark"));
    updateDarkMode();
    const observer = new MutationObserver(updateDarkMode);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  if (!items.length) return null;

  const titleStyle: React.CSSProperties = {
    fontSize: `${titleFontSize}px`,
    fontFamily: resolvedTitleFont,
    fontWeight: titleFontWeight,
    lineHeight: titleLineHeight,
    fontSynthesis: resolvedTitleFontSynthesis,
  };
  const itemStyle: React.CSSProperties = {
    color: "var(--inline-related-text)",
  };
  const borderColor = "color-mix(in srgb, var(--border) 92%, transparent)";
  const softBorderColor = "color-mix(in srgb, var(--border) 86%, transparent)";
  const headerBg = "var(--post-inline-related-header-bg, var(--bg-subtle))";
  const bodyBg = "var(--post-inline-related-bg, var(--bg-surface))";
  const resolvedHeadingColor = headingColor || "var(--fg-primary)";
  const resolvedTextColor = textColor || "var(--fg-primary)";
  const resolvedHoverColor = hoverColor || "var(--accent)";
  const headingTextStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontFamily: resolvedHeadingFont,
    fontWeight: headingFontWeight,
    color: "var(--inline-related-heading)",
    lineHeight: 1.2,
    letterSpacing: headingLetterSpacing,
    fontSynthesis: resolvedHeadingFontSynthesis,
  };
  const darkBodyBg = "color-mix(in srgb, var(--bg-surface, #111827) 88%, black 12%)";
  const darkHeaderBg = "color-mix(in srgb, var(--bg-subtle, #1f2937) 84%, black 16%)";
  const darkBorder = "color-mix(in srgb, var(--border, #374151) 72%, transparent)";
  const darkSoftBorder = "color-mix(in srgb, var(--border, #374151) 56%, transparent)";
  const darkHeading = "var(--fg-primary, #f9fafb)";
  const darkText = "var(--fg-secondary, #e5e7eb)";
  const darkHover = "color-mix(in srgb, var(--accent, #60a5fa) 72%, white 28%)";
  const darkMuted = "color-mix(in srgb, var(--fg-secondary, #cbd5e1) 78%, transparent)";
  const darkThumbBg = "color-mix(in srgb, var(--bg-subtle, #1f2937) 90%, black 10%)";
  const darkBulletBg = "color-mix(in srgb, var(--bg-subtle, #1f2937) 82%, black 18%)";
  const rootVars: React.CSSProperties = {
    ["--inline-related-bg" as keyof React.CSSProperties]: isDarkMode ? darkBodyBg : bodyBg,
    ["--inline-related-header-bg" as keyof React.CSSProperties]: isDarkMode ? darkHeaderBg : headerBg,
    ["--inline-related-border" as keyof React.CSSProperties]: isDarkMode ? darkBorder : borderColor,
    ["--inline-related-soft-border" as keyof React.CSSProperties]: isDarkMode ? darkSoftBorder : softBorderColor,
    ["--inline-related-heading" as keyof React.CSSProperties]: isDarkMode ? darkHeading : resolvedHeadingColor,
    ["--inline-related-text" as keyof React.CSSProperties]: isDarkMode ? darkText : resolvedTextColor,
    ["--inline-related-hover" as keyof React.CSSProperties]: isDarkMode ? darkHover : resolvedHoverColor,
    ["--inline-related-muted" as keyof React.CSSProperties]: isDarkMode ? darkMuted : "var(--fg-muted)",
    ["--inline-related-thumb-bg" as keyof React.CSSProperties]: isDarkMode ? darkThumbBg : "var(--bg-subtle)",
    ["--inline-related-bullet-bg" as keyof React.CSSProperties]: isDarkMode ? darkBulletBg : "color-mix(in srgb, var(--bg-subtle) 88%, white)",
  };
  const resolvedGridColumns = Math.min(4, Math.max(1, gridColumns || 2));
  const resolvedCardColumns = Math.min(2, Math.max(1, cardColumns || 1));
  const gridWrapperClass = resolvedGridColumns >= 4
    ? "grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4"
    : resolvedGridColumns === 3
      ? "grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3"
      : resolvedGridColumns === 1
        ? "grid gap-3 p-4 grid-cols-1"
        : "grid gap-3 p-4 md:grid-cols-2";
  const cardWrapperClass = resolvedCardColumns === 2 ? "grid gap-x-6 gap-y-0 p-4 md:grid-cols-2" : "space-y-0 p-4";
  const getTitleColor = (itemId: string) => (hoveredItemId === itemId ? "var(--inline-related-hover)" : "var(--inline-related-text)");
  const renderMeta = (item: InlineRelatedItem) => (
    <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: "var(--inline-related-muted)" }}>
      {item.category?.name && (
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{
            backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
            color: "var(--accent)",
          }}
        >
          {item.category.name}
        </span>
      )}
      <span>{formatDate(item.publishedAt || item.createdAt)}</span>
    </div>
  );
  const renderThumb = (item: InlineRelatedItem, mode: "small" | "large" = "small") => {
    const imageUrl = getInlineRelatedImageUrl(item);
    if (!imageUrl) return null;
    const sizeClass = mode === "large" ? "h-28 w-full" : "h-20 w-24 flex-shrink-0";
    return (
      <div
        className={`relative overflow-hidden ${sizeClass}`}
        style={{ backgroundColor: "var(--inline-related-thumb-bg)", border: "1px solid var(--inline-related-soft-border)", borderRadius: "var(--radius-global, 0.5rem)" }}
      >
        <Image
          src={imageUrl}
          alt={item.title}
          fill
          sizes="96px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>
    );
  };
  const renderIndexBadge = (index: number) => (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
      style={{
        backgroundColor: "color-mix(in srgb, var(--accent) 14%, transparent)",
        color: "var(--accent)",
      }}
    >
      {String(index + 1).padStart(2, "0")}
    </span>
  );
  const resolvedHeadingText = typeof headingText === "string" && headingText.trim() !== "" ? headingText : "Baca Juga";
  if (layout === "bullet") {
    return (
      <>
        <aside
          className="not-prose inline-related-root my-8 px-5 py-4"
        style={{
          ...rootVars,
          backgroundColor: "var(--inline-related-bullet-bg)",
          borderRadius: "var(--radius-global, 0.5rem)",
        }}
      >
        <div
          className="mb-3 font-bold leading-none"
          style={headingTextStyle}
        >
          {resolvedHeadingText}
        </div>
        <ul className="space-y-2.5 pl-5 list-disc marker:text-[var(--accent)]">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/${item.category?.slug || "berita"}/${item.slug}`}
                className="font-bold leading-snug transition-colors"
                style={{ ...titleStyle, color: getTitleColor(item.id) }}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId((current) => (current === item.id ? null : current))}
                onFocus={() => setHoveredItemId(item.id)}
                onBlur={() => setHoveredItemId((current) => (current === item.id ? null : current))}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      </>
    );
  }

  if (layout === "list") {
    return (
      <>
        <aside
          className="not-prose inline-related-root my-8 border-l-4 pl-5"
          style={{
            ...rootVars,
            borderLeftColor: "var(--accent)",
          }}
        >
          <div
            className="mb-3 font-bold leading-none"
            style={headingTextStyle}
          >
            {resolvedHeadingText}
          </div>
          <div className="space-y-2.5">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/${item.category?.slug || "berita"}/${item.slug}`}
                className="block font-bold leading-snug underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
                style={{ ...titleStyle, color: getTitleColor(item.id) }}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() => setHoveredItemId((current) => (current === item.id ? null : current))}
                onFocus={() => setHoveredItemId(item.id)}
                onBlur={() => setHoveredItemId((current) => (current === item.id ? null : current))}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      <aside
        className="not-prose inline-related-root my-8 border overflow-hidden"
        style={{
          ...rootVars,
          backgroundColor: "var(--inline-related-bg)",
          borderColor: "var(--inline-related-border)",
          borderRadius: "var(--radius-global, 0.5rem)",
        }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{
            backgroundColor: "var(--inline-related-header-bg)",
            borderColor: "var(--inline-related-soft-border)",
          }}
        >
          <div className="font-bold leading-none" style={headingTextStyle}>
            {resolvedHeadingText}
          </div>
        </div>
        <div className={layout === "grid" ? gridWrapperClass : layout === "card" ? cardWrapperClass : "space-y-3 p-4"}>
          {items.map((item, index) => (
            <Link
            key={item.id}
            href={`/${item.category?.slug || "berita"}/${item.slug}`}
            className={`group block rounded-2xl transition-all duration-200 ${
              layout === "card"
                ? "rounded-none py-3 first:pt-0 last:pb-0"
                : layout === "grid"
                  ? "p-1"
                  : "px-1 py-1"
            }`}
            style={{
              borderBottom: layout === "card" && (
                resolvedCardColumns === 1
                  ? index !== items.length - 1
                  : index < items.length - resolvedCardColumns
              ) ? "1px solid var(--inline-related-soft-border)" : undefined,
            }}
            onMouseEnter={() => setHoveredItemId(item.id)}
            onMouseLeave={() => setHoveredItemId((current) => (current === item.id ? null : current))}
            onFocus={() => setHoveredItemId(item.id)}
            onBlur={() => setHoveredItemId((current) => (current === item.id ? null : current))}
          >
              {layout === "grid" ? (
                <article className="space-y-3">
                  {(() => {
                    const imageUrl = getInlineRelatedImageUrl(item);
                    return imageUrl ? (
                      <div className="relative block w-full aspect-[4/3] overflow-hidden leading-none" style={{ backgroundColor: "var(--inline-related-thumb-bg)", borderRadius: "var(--radius-global, 0.5rem)" }}>
                        <Image
                          src={imageUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="!absolute !inset-0 !block !h-full !w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : null;
                  })()}
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--inline-related-muted)" }}>
                    {item.category?.name && (
                      <span style={{ color: "var(--accent)" }}>
                        {item.category.name}
                      </span>
                    )}
                    {item.category?.name && <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--inline-related-muted) 35%, transparent)" }} />}
                    <time>{formatDate(item.publishedAt || item.createdAt)}</time>
                  </div>
                  <div className="font-bold leading-snug transition-colors" style={{ ...titleStyle, color: getTitleColor(item.id) }}>
                    {item.title}
                  </div>
                </article>
              ) : layout === "card" ? (
                <article className="flex items-start gap-3">
                  <div className="flex shrink-0 items-start">
                    {(() => {
                      const imageUrl = getInlineRelatedImageUrl(item);
                      return imageUrl ? (
                        <div
                          className="relative block h-16 w-20 overflow-hidden leading-none"
                          style={{ backgroundColor: "var(--inline-related-thumb-bg)", borderRadius: "var(--radius-global, 0.5rem)" }}
                        >
                          <Image
                            src={imageUrl}
                            alt={item.title}
                            fill
                            sizes="80px"
                            className="!absolute !inset-0 !block !h-full !w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : null;
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    {item.category?.name && (
                      <div className="mb-1 uppercase tracking-wider text-[10px] font-semibold" style={{ color: "var(--accent)" }}>
                        {item.category.name}
                      </div>
                    )}
                    <div className="font-bold leading-snug transition-colors" style={{ ...titleStyle, color: getTitleColor(item.id) }}>
                      {item.title}
                    </div>
                  </div>
                </article>
              ) : (
                <div className="flex gap-3 items-start">
                  <div className="pt-1">{renderIndexBadge(index)}</div>
                  {renderThumb(item, "small")}
                  <div className="min-w-0 flex-1">
                    <div className="font-bold leading-snug transition-colors" style={{ ...titleStyle, color: getTitleColor(item.id) }}>
                      {item.title}
                    </div>
                    {toPlainText(item.excerpt) && (
                      <p className="mt-2 line-clamp-2" style={itemStyle}>
                        {toPlainText(item.excerpt)}
                      </p>
                    )}
                    {renderMeta(item)}
                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                      Buka Artikel
                    </div>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
