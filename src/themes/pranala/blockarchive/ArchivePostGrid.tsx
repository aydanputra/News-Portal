"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePublicViewportStore } from "../components/public-ui-store";
import { getResponsiveBool, getResponsiveValue } from "../blocks/responsive";
import { resolveWidgetRadius } from "../blocks/radius";

interface ArchivePostGridProps {
  block: any;
  posts: any[];
  customTitle?: string;
  accentColor?: string;
  borderRadius?: string;
  setting?: any;
}

const normalizeCssSize = (raw: unknown): string | undefined => {
  if (typeof raw === "number" && Number.isFinite(raw)) return `${raw}px`;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
  return trimmed;
};

const toPx = (value: unknown, fallback: string) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    return trimmed;
  }
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

// Samakan dengan breakpoint toGridClass (md=768px, xl=1280px) supaya browser
// memilih varian gambar sesuai lebar kolom, bukan varian terbesar.
const toGridSizes = (cols: number) => {
  switch (cols) {
    case 1: return "100vw";
    case 2: return "(max-width: 767px) 100vw, 50vw";
    case 3: return "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw";
    default: return "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw";
  }
};

export default function ArchivePostGrid({ block, posts, accentColor, borderRadius }: ArchivePostGridProps) {
  const config = block?.config || {};
  const configRecord = config as Record<string, unknown>;
  const device = usePublicViewportStore();
  const effectiveAccent = accentColor || "var(--accent, #ef4444)";
  const [isPublicDarkMode, setIsPublicDarkMode] = React.useState(false);
  const limit = Math.max(1, Math.min(24, Number(config.limit) || 9));
  const columns = clampColumns(config.gridColumns ?? config.columns, 3);
  const gridSizes = toGridSizes(columns);
  const showExcerpt = getResponsiveBool(configRecord, "showExcerpt", device, true);
  const showMeta = getResponsiveBool(
    configRecord,
    "showMetaInfo",
    device,
    getResponsiveBool(configRecord, "showMeta", device, true)
  );
  const excerptLengthValue = Number(getResponsiveValue<number | string>(configRecord, "excerptLength", device));
  const excerptLength = Number.isFinite(excerptLengthValue) ? excerptLengthValue : 120;
  const items = posts.slice(0, limit);
  const useBox = getResponsiveBool(configRecord, "useBox", device, false);
  const readText = (baseKey: string, fallback: string) => {
    const value = getResponsiveValue<string>(configRecord, baseKey, device);
    return typeof value === "string" && value.trim() !== "" ? value : fallback;
  };
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
  const titleWeight = readText("titleFontWeight", "var(--archive-news-title-weight, var(--home-news-title-weight, 600))");
  const titleFont = readText("titleFontFamily", "var(--archive-news-title-font, var(--home-news-title-font, inherit))");
  const metaSizeDesktop = toPx(config.metaFontSize, "var(--archive-meta-size, var(--home-meta-size, 0.75rem))");
  const metaSizeTablet = toPx(config.tabletMetaFontSize, metaSizeDesktop);
  const metaSizeMobile = toPx(config.mobileMetaFontSize, metaSizeDesktop);
  const metaWeight = readText("metaFontWeight", "var(--archive-meta-weight, var(--home-meta-weight, 500))");
  const metaFont = readText("metaFontFamily", "var(--archive-meta-font, var(--home-meta-font, inherit))");
  const excerptSizeDesktop = toPx(config.excerptFontSize, "var(--archive-excerpt-size, var(--home-excerpt-size, 0.875rem))");
  const excerptSizeTablet = toPx(config.tabletExcerptFontSize, excerptSizeDesktop);
  const excerptSizeMobile = toPx(config.mobileExcerptFontSize, excerptSizeDesktop);
  const excerptWeight = readText("excerptFontWeight", "var(--archive-excerpt-weight, var(--home-excerpt-weight, 400))");
  const excerptFont = readText("excerptFontFamily", "var(--archive-excerpt-font, var(--home-excerpt-font, inherit))");
  const boxColor = getResponsiveValue<string>(configRecord, "boxColor", device) || "var(--card, white)";
  const boxBgImage = getResponsiveValue<string>(configRecord, "backgroundImage", device) || "";
  const boxBgSize = getResponsiveValue<string>(configRecord, "backgroundSize", device) || "cover";
  const boxBgPosition = getResponsiveValue<string>(configRecord, "backgroundPosition", device) || "center";
  const boxBgRepeat = getResponsiveValue<string>(configRecord, "backgroundRepeat", device) || "no-repeat";
  const boxBgAttachment = getResponsiveValue<string>(configRecord, "backgroundAttachment", device) || "scroll";
  const boxOverlayColor = getResponsiveValue<string>(configRecord, "backgroundOverlayColor", device) || "transparent";
  const boxOverlayOpacityRaw = Number(getResponsiveValue<number | string>(configRecord, "backgroundOverlayOpacity", device) ?? 45);
  const boxOverlayOpacity = Math.min(100, Math.max(0, Number.isFinite(boxOverlayOpacityRaw) ? boxOverlayOpacityRaw : 45));
  const hasBoxOverlay = boxOverlayOpacity > 0 && boxOverlayColor.trim() !== "" && boxOverlayColor.trim().toLowerCase() !== "transparent";
  const boxOverlayFill = hasBoxOverlay ? `color-mix(in srgb, ${boxOverlayColor} ${boxOverlayOpacity}%, transparent)` : "transparent";
  const boxStyle: React.CSSProperties = useBox
    ? {
        backgroundColor: boxColor,
        borderRadius: resolveWidgetRadius(getResponsiveValue(configRecord, "boxBorderRadius", device)),
        paddingTop: normalizeCssSize(getResponsiveValue(configRecord, "boxPaddingTop", device)) ?? "0px",
        paddingRight: normalizeCssSize(getResponsiveValue(configRecord, "boxPaddingRight", device)) ?? "0px",
        paddingBottom: normalizeCssSize(getResponsiveValue(configRecord, "boxPaddingBottom", device)) ?? "0px",
        paddingLeft: normalizeCssSize(getResponsiveValue(configRecord, "boxPaddingLeft", device)) ?? "0px",
        backgroundImage: boxBgImage
          ? (hasBoxOverlay ? `linear-gradient(${boxOverlayFill}, ${boxOverlayFill}), url("${boxBgImage}")` : `url("${boxBgImage}")`)
          : undefined,
        backgroundSize: boxBgImage ? (hasBoxOverlay ? `cover, ${boxBgSize}` : boxBgSize) : undefined,
        backgroundPosition: boxBgImage ? (hasBoxOverlay ? `center, ${boxBgPosition}` : boxBgPosition) : undefined,
        backgroundRepeat: boxBgImage ? (hasBoxOverlay ? `no-repeat, ${boxBgRepeat}` : boxBgRepeat) : undefined,
        backgroundAttachment: boxBgImage ? boxBgAttachment : undefined,
      }
    : {};

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const applyMode = () => setIsPublicDarkMode(root.classList.contains("public-dark"));
    applyMode();

    const observer = new MutationObserver(applyMode);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Warna eksplisit dari panel selalu diutamakan. Override dark mode hanya
  // dipakai untuk warna default supaya teks tetap terbaca pada kartu putih.
  const hasCustomTitleColor = typeof config.titleColor === "string" && config.titleColor.trim() !== "";
  const hasCustomTabletTitleColor = typeof config.tabletTitleColor === "string" && config.tabletTitleColor.trim() !== "";
  const hasCustomMobileTitleColor = typeof config.mobileTitleColor === "string" && config.mobileTitleColor.trim() !== "";
  const hasCustomMetaColor = typeof config.metaColor === "string" && config.metaColor.trim() !== "";
  const hasCustomTabletMetaColor = typeof config.tabletMetaColor === "string" && config.tabletMetaColor.trim() !== "";
  const hasCustomMobileMetaColor = typeof config.mobileMetaColor === "string" && config.mobileMetaColor.trim() !== "";
  const hasCustomExcerptColor = typeof config.excerptColor === "string" && config.excerptColor.trim() !== "";
  const hasCustomTabletExcerptColor = typeof config.tabletExcerptColor === "string" && config.tabletExcerptColor.trim() !== "";
  const hasCustomMobileExcerptColor = typeof config.mobileExcerptColor === "string" && config.mobileExcerptColor.trim() !== "";

  const effectiveTitleColorDesktop = isPublicDarkMode && !hasCustomTitleColor ? "#0f172a" : titleColorDesktop;
  const effectiveTitleColorTablet = isPublicDarkMode && !hasCustomTabletTitleColor ? "#0f172a" : titleColorTablet;
  const effectiveTitleColorMobile = isPublicDarkMode && !hasCustomMobileTitleColor ? "#0f172a" : titleColorMobile;
  const effectiveMetaColorDesktop = isPublicDarkMode && !hasCustomMetaColor ? "#64748b" : metaColorDesktop;
  const effectiveMetaColorTablet = isPublicDarkMode && !hasCustomTabletMetaColor ? "#64748b" : metaColorTablet;
  const effectiveMetaColorMobile = isPublicDarkMode && !hasCustomMobileMetaColor ? "#64748b" : metaColorMobile;
  const effectiveExcerptColorDesktop = isPublicDarkMode && !hasCustomExcerptColor ? "#334155" : excerptColorDesktop;
  const effectiveExcerptColorTablet = isPublicDarkMode && !hasCustomTabletExcerptColor ? "#334155" : excerptColorTablet;
  const effectiveExcerptColorMobile = isPublicDarkMode && !hasCustomMobileExcerptColor ? "#334155" : excerptColorMobile;

  if (items.length === 0) {
    return <div className="rounded-lg border border-dashed p-6 text-sm" style={{ color: metaColorDesktop, fontSize: metaSizeDesktop, fontWeight: metaWeight as React.CSSProperties["fontWeight"], fontFamily: metaFont }}>Belum ada artikel pada arsip ini.</div>;
  }

  return (
    <div
      className={`public-theme archive-post-grid-block grid gap-6 ${toGridClass(columns)}`}
      style={{
        "--accent": effectiveAccent,
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
              display: "flex",
              flexDirection: "column",
              ...(useBox ? boxStyle : { borderRadius: "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))" }),
            }}
          >
            <Link href={href} className="block relative aspect-[16/9] overflow-hidden" style={{ flexShrink: 0 }}>
              <Image src={imageUrl} alt={post.title || "Post image"} fill sizes={gridSizes} className="object-cover" />
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
              className={useBox ? "" : "p-4"}
              style={{
                backgroundColor: useBox ? "transparent" : (isPublicDarkMode ? "#ffffff" : "transparent"),
                flex: "1 1 auto",
                "--home-news-title-color": effectiveTitleColorDesktop,
                "--home-meta-color": effectiveMetaColorDesktop,
                "--home-excerpt-color": effectiveExcerptColorDesktop,
              } as React.CSSProperties}
            >
              {displayCategory?.name && (
                <div className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: effectiveAccent }}>
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
