"use client";

import React from "react";
import Link from "next/link";
import { sanitizeExternalUrl } from "@/lib/sanitizer";

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
  const hasCustomFrame = Boolean(imageWidth && imageHeight);
  const imageStyle: React.CSSProperties = hasCustomFrame
    ? { width: "100%", height: "100%", objectFit, display: "block" }
    : {
        width: imageWidth ?? "auto",
        height: imageHeight ?? "auto",
        maxWidth: imageWidth ? "100%" : "100%",
        objectFit,
        borderRadius,
        boxShadow: shadowStyle,
        display: "inline-block",
        verticalAlign: "top",
      };
  const image = hasCustomFrame ? (
    <div
      className="inline-block max-w-full align-top"
      style={{
        width: imageWidth,
        height: imageHeight,
        overflow: "hidden",
        borderRadius,
        boxShadow: shadowStyle,
      }}
    >
      <img
        src={imageUrl}
        alt={altText}
        loading="lazy"
        className="block h-full w-full"
        style={imageStyle}
      />
    </div>
  ) : (
    <img
      src={imageUrl}
      alt={altText}
      loading="lazy"
      className="inline-block h-auto max-w-full align-top"
      style={imageStyle}
    />
  );
  const wrapperClassName = `min-w-0 ${className}`.trim();
  const linkClassName = "inline-block max-w-full align-top";

  if (!linkUrl) {
    return <div className={wrapperClassName}>{image}</div>;
  }

  if (linkUrl.startsWith("/")) {
    return (
      <div className={wrapperClassName}>
        <Link
          href={linkUrl}
          className={linkClassName}
          target={openInNewTab ? "_blank" : undefined}
          rel={openInNewTab ? "noreferrer noopener" : undefined}
        >
          {image}
        </Link>
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <a
        href={linkUrl}
        className={linkClassName}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noreferrer noopener" : undefined}
      >
        {image}
      </a>
    </div>
  );
}
