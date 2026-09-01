"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ArchivePostGridProps {
  block: any;
  posts: any[];
}

const toPx = (value: unknown, fallback: string) => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string" && value.trim() !== "" && /^-?\d+(\.\d+)?$/.test(value.trim())) return `${value.trim()}px`;
  return fallback;
};

const clampColumns = (value: unknown, fallback: number) => {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(4, Math.round(parsed)));
};

const toGridClass = (cols: number) => {
  switch (cols) {
    case 1: return "grid-cols-1";
    case 2: return "grid-cols-1 md:grid-cols-2";
    case 3: return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
    default: return "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";
  }
};

export default function ArchivePostGrid({ block, posts }: ArchivePostGridProps) {
  const config = block?.config || {};
  const [isPublicDarkMode, setIsPublicDarkMode] = React.useState(false);
  const limit = Math.max(1, Math.min(24, Number(config.limit) || 9));
  const columns = clampColumns(config.columns, 3);
  const showExcerpt = config.showExcerpt !== false;
  const showMeta = config.showMetaInfo !== false && config.showMeta !== false;
  const excerptLengthValue = Number(config.excerptLength);
  const excerptLength = Number.isFinite(excerptLengthValue) ? excerptLengthValue : 120;
  const items = posts.slice(0, limit);
  const useBox = config.useBox === true;
  const titleColorDesktop = typeof config.titleColor === "string" && config.titleColor.trim() ? config.titleColor : "var(--archive-news-title-color, var(--home-news-title-color, var(--heading-color, #111827)))";
  const titleColorTablet = typeof config.tabletTitleColor === "string" && config.tabletTitleColor.trim() ? config.tabletTitleColor : titleColorDesktop;
  const titleColorMobile = typeof config.mobileTitleColor === "string" && config.mobileTitleColor.trim() ? config.mobileTitleColor : titleColorDesktop;
  const metaColorDesktop = typeof config.metaColor === "string" && config.metaColor.trim() ? config.metaColor : "var(--archive-meta-color, var(--home-meta-color, #94a3b8))";
  const metaColorTablet = typeof config.tabletMetaColor === "string" && config.tabletMetaColor.trim() ? config.tabletMetaColor : metaColorDesktop;
  const metaColorMobile = typeof config.mobileMetaColor === "string" && config.mobileMetaColor.trim() ? config.mobileMetaColor : metaColorDesktop;
  const excerptColorDesktop = typeof config.excerptColor === "string" && config.excerptColor.trim() ? config.excerptColor : "var(--archive-excerpt-color, var(--home-excerpt-color, #6b7280))";
  const excerptColorTablet = typeof config.tabletExcerptColor === "string" && config.tabletExcerptColor.trim() ? config.tabletExcerptColor : excerptColorDesktop;
  const excerptColorMobile = typeof config.mobileExcerptColor === "string" && config.mobileExcerptColor.trim() ? config.mobileExcerptColor : excerptColorDesktop;
  const titleSizeDesktop = toPx(config.titleFontSize, "var(--archive-news-title-size, var(--home-news-title-size, 1.125rem))");
  const titleSizeTablet = toPx(config.tabletTitleFontSize, titleSizeDesktop);
  const titleSizeMobile = toPx(config.mobileTitleFontSize, titleSizeDesktop);
  const titleWeight = typeof config.titleFontWeight === "string" && config.titleFontWeight.trim() ? config.titleFontWeight : "var(--archive-news-title-weight, var(--home-news-title-weight, 600))";
  const titleFont = typeof config.titleFontFamily === "string" && config.titleFontFamily.trim() ? config.titleFontFamily : "var(--archive-news-title-font, var(--home-news-title-font, inherit))";
  const metaSizeDesktop = toPx(config.metaFontSize, "var(--archive-meta-size, var(--home-meta-size, 0.75rem))");
  const metaSizeTablet = toPx(config.tabletMetaFontSize, metaSizeDesktop);
  const metaSizeMobile = toPx(config.mobileMetaFontSize, metaSizeDesktop);
  const metaWeight = typeof config.metaFontWeight === "string" && config.metaFontWeight.trim() ? config.metaFontWeight : "var(--archive-meta-weight, var(--home-meta-weight, 500))";
  const metaFont = typeof config.metaFontFamily === "string" && config.metaFontFamily.trim() ? config.metaFontFamily : "var(--archive-meta-font, var(--home-meta-font, inherit))";
  const excerptSizeDesktop = toPx(config.excerptFontSize, "var(--archive-excerpt-size, var(--home-excerpt-size, 0.875rem))");
  const excerptSizeTablet = toPx(config.tabletExcerptFontSize, excerptSizeDesktop);
  const excerptSizeMobile = toPx(config.mobileExcerptFontSize, excerptSizeDesktop);
  const excerptWeight = typeof config.excerptFontWeight === "string" && config.excerptFontWeight.trim() ? config.excerptFontWeight : "var(--archive-excerpt-weight, var(--home-excerpt-weight, 400))";
  const excerptFont = typeof config.excerptFontFamily === "string" && config.excerptFontFamily.trim() ? config.excerptFontFamily : "var(--archive-excerpt-font, var(--home-excerpt-font, inherit))";
  const boxColorDesktop = typeof config.boxColor === "string" && config.boxColor.trim() ? config.boxColor : "var(--card, white)";
  const boxColorTablet = typeof config.tabletBoxColor === "string" && config.tabletBoxColor.trim() ? config.tabletBoxColor : boxColorDesktop;
  const boxColorMobile = typeof config.mobileBoxColor === "string" && config.mobileBoxColor.trim() ? config.mobileBoxColor : boxColorDesktop;

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const applyMode = () => setIsPublicDarkMode(root.classList.contains("public-dark"));
    applyMode();

    const observer = new MutationObserver(applyMode);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const effectiveTitleColorDesktop = isPublicDarkMode ? "#0f172a" : titleColorDesktop;
  const effectiveTitleColorTablet = isPublicDarkMode ? "#0f172a" : titleColorTablet;
  const effectiveTitleColorMobile = isPublicDarkMode ? "#0f172a" : titleColorMobile;
  const effectiveMetaColorDesktop = isPublicDarkMode ? "#64748b" : metaColorDesktop;
  const effectiveMetaColorTablet = isPublicDarkMode ? "#64748b" : metaColorTablet;
  const effectiveMetaColorMobile = isPublicDarkMode ? "#64748b" : metaColorMobile;
  const effectiveExcerptColorDesktop = isPublicDarkMode ? "#334155" : excerptColorDesktop;
  const effectiveExcerptColorTablet = isPublicDarkMode ? "#334155" : excerptColorTablet;
  const effectiveExcerptColorMobile = isPublicDarkMode ? "#334155" : excerptColorMobile;

  if (items.length === 0) {
    return <div className="rounded-lg border border-dashed p-6 text-sm" style={{ color: metaColorDesktop, fontSize: metaSizeDesktop, fontWeight: metaWeight as React.CSSProperties["fontWeight"], fontFamily: metaFont }}>Belum ada artikel pada arsip ini.</div>;
  }

  return (
    <div
      className={`public-theme archive-post-grid-block grid gap-6 ${toGridClass(columns)}`}
      style={{
        "--archive-grid-title-color-mobile": effectiveTitleColorMobile,
        "--archive-grid-title-color-tablet": effectiveTitleColorTablet,
        "--archive-grid-title-color-desktop": effectiveTitleColorDesktop,
        "--archive-grid-meta-color-mobile": effectiveMetaColorMobile,
        "--archive-grid-meta-color-tablet": effectiveMetaColorTablet,
        "--archive-grid-meta-color-desktop": effectiveMetaColorDesktop,
        "--archive-grid-excerpt-color-mobile": effectiveExcerptColorMobile,
        "--archive-grid-excerpt-color-tablet": effectiveExcerptColorTablet,
        "--archive-grid-excerpt-color-desktop": effectiveExcerptColorDesktop,
        "--archive-grid-title-size-mobile": titleSizeMobile,
        "--archive-grid-title-size-tablet": titleSizeTablet,
        "--archive-grid-title-size-desktop": titleSizeDesktop,
        "--archive-grid-meta-size-mobile": metaSizeMobile,
        "--archive-grid-meta-size-tablet": metaSizeTablet,
        "--archive-grid-meta-size-desktop": metaSizeDesktop,
        "--archive-grid-excerpt-size-mobile": excerptSizeMobile,
        "--archive-grid-excerpt-size-tablet": excerptSizeTablet,
        "--archive-grid-excerpt-size-desktop": excerptSizeDesktop,
        "--archive-grid-box-color-mobile": boxColorMobile,
        "--archive-grid-box-color-tablet": boxColorTablet,
        "--archive-grid-box-color-desktop": boxColorDesktop,
      } as React.CSSProperties}
    >
      {items.map((post) => {
        const href = `/${post.slug}`;
        const imageUrl = post.image || post.featuredImage?.fileUrl || post.featuredImage?.url || "/placeholder.png";
        const displayCategory = post.archiveDisplayCategory || post.category;
        const isVideo = String((post as any)?.type || "").toUpperCase() === "VIDEO";
        const excerpt = String(post.excerpt || post.content || "").replace(/<[^>]+>/g, "").trim();
        return (
          <article
            key={post.id}
            className={`overflow-hidden ${useBox ? "border border-[var(--border,#e5e7eb)]" : ""}`}
            style={{
              borderRadius: "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))",
              ...(useBox ? { backgroundColor: "var(--archive-grid-box-color)" } : {}),
            }}
          >
            <Link href={href} className="block relative aspect-[16/9] overflow-hidden">
              <Image src={imageUrl} alt={post.title || "Post image"} fill className="object-cover" />
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
            <div
              className="p-4"
              style={{
                backgroundColor: isPublicDarkMode ? "#ffffff" : "transparent",
                "--home-news-title-color": isPublicDarkMode ? "#0f172a" : titleColorDesktop,
                "--home-meta-color": isPublicDarkMode ? "#64748b" : metaColorDesktop,
                "--home-excerpt-color": isPublicDarkMode ? "#334155" : excerptColorDesktop,
              } as React.CSSProperties}
            >
              {displayCategory?.name && (
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--accent,#ef4444)]">
                  {displayCategory.name}
                </div>
              )}
              <h2 className="leading-snug" style={{ color: "var(--archive-grid-title-color)", fontSize: "var(--archive-grid-title-size)", lineHeight: "var(--archive-news-title-line-height, var(--home-news-title-line-height, 1.35))", fontWeight: titleWeight as React.CSSProperties["fontWeight"], fontFamily: titleFont }}>
                <Link href={href} className="theme-news-title">
                  {post.title}
                </Link>
              </h2>
              {showMeta && (
                <div className="mt-2 theme-meta-text" style={{ color: "var(--archive-grid-meta-color)", fontSize: "var(--archive-grid-meta-size)", lineHeight: "var(--archive-meta-line-height, var(--home-meta-line-height, 1.4))", fontWeight: metaWeight as React.CSSProperties["fontWeight"], fontFamily: metaFont }}>
                  {post.author?.name || "Admin"}
                </div>
              )}
              {showExcerpt && excerpt && (
                <p className="mt-3 theme-excerpt-text" style={{ color: "var(--archive-grid-excerpt-color)", fontSize: "var(--archive-grid-excerpt-size)", lineHeight: "var(--archive-excerpt-line-height, var(--home-excerpt-line-height, 1.6))", fontWeight: excerptWeight as React.CSSProperties["fontWeight"], fontFamily: excerptFont }}>
                  {excerpt.slice(0, excerptLength)}{excerpt.length > excerptLength ? "..." : ""}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
