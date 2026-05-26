import Link from "next/link";
import { House } from "lucide-react";
import { WidgetRenderContext } from "./types";
import { toFontWeight, toPx } from "./helpers";

export default function PostBreadcrumbWidget({
  post,
  metaColor,
  hoverColor,
  widgetContainerStyle,
  getResponsiveConfig,
  getConfigBool
}: WidgetRenderContext) {
  const {
    textAlign: _ignoredTextAlign,
    ...breadcrumbWidgetContainerStyle
  } = widgetContainerStyle;
  const showPostTitle = getConfigBool("showPostTitle", true);
  const showHomeIcon = getConfigBool("showHomeIcon", false);
  const align = getResponsiveConfig("breadcrumbAlign");
  const resolvedAlign = align === "center" || align === "right" ? align : "left";
  const design = getResponsiveConfig("breadcrumbDesign");
  const resolvedDesign = design === "pill" || design === "boxed" ? design : "minimal";
  const separatorType = getResponsiveConfig("separatorType");
  const separator = separatorType === "chevron" ? "›" : separatorType === "line" ? "|" : "/";
  const justifyClass = resolvedAlign === "center" ? "justify-center" : resolvedAlign === "right" ? "justify-end" : "justify-start";
  const designClass = resolvedDesign === "pill"
    ? "px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border)]"
    : resolvedDesign === "boxed"
      ? "px-3 py-2 rounded-md bg-[var(--bg-surface)] border border-[var(--border)]"
      : "";

  return (
    <div className={`w-full flex ${justifyClass}`} style={breadcrumbWidgetContainerStyle}>
      <div
        className={`text-sm flex items-center gap-2 min-w-0 ${designClass}`}
        style={{
          color: (getResponsiveConfig("color") as string) || metaColor,
          fontSize: toPx(getResponsiveConfig("fontSize")),
          fontWeight: toFontWeight(getResponsiveConfig("fontWeight"), "400"),
          lineHeight: typeof getResponsiveConfig("lineHeight") === "number" ? getResponsiveConfig("lineHeight") as number : undefined
        }}
      >
        <Link href="/" style={{ color: "inherit" }} className="inline-flex items-center gap-1">
          {showHomeIcon && <House size={12} className="shrink-0" />}
          <span>Beranda</span>
        </Link>
        {(post?.category || showPostTitle) && <span>{separator}</span>}
        {post?.category && (
          <>
            <Link href={`/kategori/${post.category.slug}`} style={{ color: hoverColor }}>
              {post.category.name}
            </Link>
            {showPostTitle && <span>{separator}</span>}
          </>
        )}
        {showPostTitle && <span className="truncate max-w-[220px]">{post?.title || "Judul Artikel"}</span>}
      </div>
    </div>
  );
}
