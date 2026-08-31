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
  getConfigBool,
  isPublicDarkMode
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
  const needsDarkSurface = isPublicDarkMode || resolvedDesign !== "minimal";
  const shellStyle = needsDarkSurface
    ? {
        backgroundColor: isPublicDarkMode ? "rgba(15, 23, 42, 0.32)" : undefined,
        borderColor: isPublicDarkMode ? "rgba(148, 163, 184, 0.18)" : undefined,
        boxShadow: isPublicDarkMode ? "0 10px 30px rgba(2, 6, 23, 0.14)" : undefined,
        backdropFilter: isPublicDarkMode ? "blur(10px)" : undefined,
      }
    : undefined;
  const separatorStyle = isPublicDarkMode ? { color: "var(--fg-muted)" } : { opacity: 0.72 };
  const categoryLinkStyle = { color: isPublicDarkMode ? "var(--accent)" : hoverColor };
  const currentPageStyle = isPublicDarkMode ? { color: "var(--fg-primary)" } : undefined;

  return (
    <div className={`w-full flex ${justifyClass}`} style={breadcrumbWidgetContainerStyle}>
      <div
        className={`text-sm flex items-center gap-2 min-w-0 ${designClass}`}
        style={{
          color: (getResponsiveConfig("color") as string) || metaColor,
          fontSize: toPx(getResponsiveConfig("fontSize")),
          fontWeight: toFontWeight(getResponsiveConfig("fontWeight"), "400"),
          lineHeight: typeof getResponsiveConfig("lineHeight") === "number" ? getResponsiveConfig("lineHeight") as number : undefined,
          ...shellStyle,
        }}
      >
        <Link href="/" style={{ color: "inherit" }} className="inline-flex items-center gap-1 transition-colors hover:text-[var(--fg-primary)]">
          {showHomeIcon && <House size={12} className="shrink-0" />}
          <span>Beranda</span>
        </Link>
        {(post?.category || showPostTitle) && <span style={separatorStyle}>{separator}</span>}
        {post?.category && (
          <>
            <Link href={`/kategori/${post.category.slug}`} style={categoryLinkStyle} className="transition-colors hover:opacity-85">
              {post.category.name}
            </Link>
            {showPostTitle && <span style={separatorStyle}>{separator}</span>}
          </>
        )}
        {showPostTitle && <span className="truncate max-w-[220px]" style={currentPageStyle}>{post?.title || "Judul Artikel"}</span>}
      </div>
    </div>
  );
}
