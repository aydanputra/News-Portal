"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { sanitizeExternalUrl } from "@/lib/url-safety";
import { getResponsiveBool, getResponsiveValue } from "@/themes/pranala/blocks/responsive";
import { resolveWidgetRadius } from "@/themes/pranala/blocks/radius";
import { usePublicViewportStore } from "@/themes/pranala/components/public-ui-store";

type ImageUrlWidgetConfig = {
  imageUrl?: string;
  altText?: string;
  linkUrl?: string;
  openInNewTab?: boolean | string;
  objectFit?: string;
  imageWidth?: string;
  imageHeight?: string;
  borderRadius?: string;
  showShadow?: boolean | string;
  // Pengaturan "Latar" (kotak widget) dari panel builder.
  useBox?: boolean | string;
  boxColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundAttachment?: string;
  backgroundOverlayColor?: string;
  backgroundOverlayOpacity?: number | string;
  boxBorderRadius?: string | number;
  boxPaddingTop?: number | string;
  boxPaddingRight?: number | string;
  boxPaddingBottom?: number | string;
  boxPaddingLeft?: number | string;
};

type ImageUrlWidgetProps = {
  config?: ImageUrlWidgetConfig | null;
  block?: {
    id?: string;
    title?: string;
    config?: ImageUrlWidgetConfig | null;
  } | null;
  title?: string;
  customTitle?: string;
  className?: string;
};

const normalizeImageUrl = (raw: unknown): string => {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
};

const normalizeLinkUrl = (raw: unknown): string => {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return trimmed;
  return sanitizeExternalUrl(trimmed);
};

const normalizeCssSize = (raw: unknown): string | undefined => {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return `${raw}px`;
  }
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return `${trimmed}px`;
  }
  return trimmed;
};

const normalizeObjectFit = (raw: unknown): React.CSSProperties["objectFit"] => {
  if (raw === "cover" || raw === "fill") return raw;
  return "contain";
};

export default function ImageUrlWidget({ config, block, title = "", customTitle = "", className = "" }: ImageUrlWidgetProps) {
  const resolvedConfig = config ?? block?.config ?? null;
  const configRecord = (resolvedConfig ?? {}) as Record<string, unknown>;
  const device = usePublicViewportStore();
  const resolvedTitle = customTitle || title || block?.title || (typeof resolvedConfig?.altText === "string" ? resolvedConfig.altText : "") || "";
  const imageUrl = normalizeImageUrl(resolvedConfig?.imageUrl);
  if (!imageUrl) return null;

  const altText =
    typeof resolvedConfig?.altText === "string" && resolvedConfig.altText.trim() !== ""
      ? resolvedConfig.altText.trim()
      : (resolvedTitle || "Gambar");
  const linkUrl = normalizeLinkUrl(resolvedConfig?.linkUrl);
  const openInNewTab = resolvedConfig?.openInNewTab === true || resolvedConfig?.openInNewTab === "true";
  const objectFit = normalizeObjectFit(resolvedConfig?.objectFit);
  const imageWidth = normalizeCssSize(resolvedConfig?.imageWidth);
  const imageHeight = normalizeCssSize(resolvedConfig?.imageHeight);
  const borderRadius = normalizeCssSize(resolvedConfig?.borderRadius);
  const showShadow = resolvedConfig?.showShadow === true || resolvedConfig?.showShadow === "true";
  const shadowStyle = showShadow ? "0 10px 30px rgba(15, 23, 42, 0.14)" : undefined;
  const isExternal = /^https?:\/\//i.test(imageUrl);
  const isApiImage = imageUrl.startsWith("/api/");
  // Pakai kotak tetap (perlu object-fit) hanya saat gambar dipotong (cover/fill)
  // atau tinggi eksplisit diberikan. Untuk "contain" tanpa tinggi eksplisit,
  // render sesuai rasio asli gambar agar tidak ada ruang kosong atas/bawah.
  const usesFixedBox = Boolean(imageHeight) || objectFit === "cover" || objectFit === "fill";

  // Pengaturan "Latar" pada panel widget (responsif: base/tablet*/mobile*).
  const boxUse = getResponsiveBool(configRecord, "useBox", device, false);
  const boxColor = getResponsiveValue<string>(configRecord, "boxColor", device) || "transparent";
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
  const boxGlobalRadius = borderRadius ?? "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))";
  const boxStyle: React.CSSProperties | undefined = boxUse
    ? {
        backgroundColor: boxColor,
        borderRadius: resolveWidgetRadius(getResponsiveValue(configRecord, "boxBorderRadius", device), boxGlobalRadius),
        border: "var(--box-border, 1px solid #f3f4f6)",
        boxShadow: "var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))",
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
    : undefined;

  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: imageWidth ?? "100%",
    height: usesFixedBox ? imageHeight : undefined,
    aspectRatio: usesFixedBox && !imageHeight ? "16 / 9" : undefined,
    maxWidth: "100%",
    overflow: "hidden",
    borderRadius,
    boxShadow: shadowStyle,
  };
  const image = usesFixedBox ? (
    isExternal ? (
      <div className="inline-block max-w-full align-top" style={containerStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={altText}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full"
          style={{ objectFit }}
        />
      </div>
    ) : (
      <div className="inline-block max-w-full align-top" style={containerStyle}>
        <Image
          src={imageUrl}
          alt={altText}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit }}
          unoptimized={isApiImage}
          className="h-full w-full"
        />
      </div>
    )
  ) : (
    <div className="inline-block max-w-full align-top" style={containerStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={altText}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="block h-auto w-full"
      />
    </div>
  );
  const wrapperClassName = `min-w-0 ${className}`.trim();
  const linkClassName = "inline-block max-w-full align-top";

  if (!linkUrl) {
    return <div className={wrapperClassName} style={boxStyle}>{image}</div>;
  }

  const linkedImage = linkUrl.startsWith("/") ? (
    <Link
      href={linkUrl}
      className={linkClassName}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noreferrer noopener" : undefined}
      style={boxUse ? { display: "block" } : undefined}
    >
      {image}
    </Link>
  ) : (
    <a
      href={linkUrl}
      className={linkClassName}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noreferrer noopener" : undefined}
      style={boxUse ? { display: "block" } : undefined}
    >
      {image}
    </a>
  );

  return <div className={wrapperClassName} style={boxStyle}>{linkedImage}</div>;
}
