import React from "react";
import Image from "next/image";
import Link from "next/link";
import { WidgetRenderContext } from "./types";
import { getAuthorImageUrl, toFontWeight, toPx } from "./helpers";

const formatLongDateId = (value?: string | Date | null) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
};

export default function PostMetaWidget({
  post,
  metaColor,
  preview,
  widgetContainerStyle,
  getResponsiveConfig,
  getConfigBool
}: WidgetRenderContext) {
  const showAuthor = getConfigBool("showAuthor", true);
  const showAuthorAvatar = getConfigBool("showAuthorAvatar", true);
  const showDate = getConfigBool("showDate", true);
  const showCategory = getConfigBool("showCategory", true);
  const metaDesign = String(getResponsiveConfig("metaDesign") || "minimal");
  const metaItems: React.ReactNode[] = [];
  const authorName = post?.author?.name || "";
  const authorImageUrl = getAuthorImageUrl(post?.author);
  const authorInitial = authorName.trim().charAt(0).toUpperCase() || "A";
  const authorContent = (
    <span className="inline-flex items-center gap-1.5">
      {showAuthorAvatar && (
        authorImageUrl ? (
          <Image src={authorImageUrl} alt={authorName || "Author"} width={18} height={18} className="w-[18px] h-[18px] rounded-full object-cover" unoptimized />
        ) : (
          <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[var(--bg-subtle)] border border-[var(--border)] text-[9px] leading-none">
            {authorInitial}
          </span>
        )
      )}
      <span>{authorName}</span>
    </span>
  );
  if (showCategory && post?.category?.name) {
    metaItems.push(
      <Link key="category" href={`/kategori/${post.category.slug || "#"}`} className="hover:text-[var(--post-hover-color)]">
        {post.category.name}
      </Link>
    );
  }
  if (showAuthor && authorName) metaItems.push(<span key="author">{authorContent}</span>);
  if (showDate) {
    metaItems.push(
      <time key="date">
        {formatLongDateId(post?.publishedAt || post?.createdAt)}
      </time>
    );
  }
  if (!metaItems.length) return null;
  const alignValue = getResponsiveConfig("textAlign");
  const justifyContent = alignValue === "center" ? "center" : alignValue === "right" ? "flex-end" : alignValue === "justify" ? "space-between" : "flex-start";
  const textStyle: React.CSSProperties = {
    ...widgetContainerStyle,
    color: (getResponsiveConfig("color") as string) || metaColor,
    fontSize: toPx(getResponsiveConfig("fontSize")) || "0.875rem",
    fontWeight: toFontWeight(getResponsiveConfig("fontWeight"), "400"),
    lineHeight: (getResponsiveConfig("lineHeight") as number | undefined) || 1.4,
    justifyContent
  };
  if (metaDesign === "pill") {
    return (
      <div className={preview ? "w-full flex flex-wrap items-center gap-2 text-xs" : "w-full flex flex-wrap items-center gap-2 text-sm"} style={textStyle}>
        {metaItems.map((item, idx) => (
          <span key={idx} className="px-2.5 py-1 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] inline-flex items-center">
            {item}
          </span>
        ))}
      </div>
    );
  }
  if (metaDesign === "boxed") {
    return (
      <div className={preview ? "w-full flex flex-wrap items-center gap-2 text-xs border border-[var(--border)] bg-[var(--bg-surface)] rounded-md px-3 py-2" : "w-full flex flex-wrap items-center gap-2 text-sm border border-[var(--border)] bg-[var(--bg-surface)] rounded-md px-3 py-2"} style={textStyle}>
        {metaItems.map((item, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="opacity-60">•</span>}
            {item}
          </React.Fragment>
        ))}
      </div>
    );
  }
  return (
    <div className={preview ? "w-full flex flex-wrap items-center gap-2 text-xs" : "w-full flex flex-wrap items-center gap-3 text-sm"} style={textStyle}>
      {metaItems.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span>•</span>}
          {item}
        </React.Fragment>
      ))}
    </div>
  );
}
