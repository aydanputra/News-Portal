import React from "react";
import dynamic from "next/dynamic";
import { WidgetRenderContext } from "./types";
import PostAuthorBoxWidget from "./PostAuthorBoxWidget";
import PostBreadcrumbWidget from "./PostBreadcrumbWidget";
import PostContentWidget from "./PostContentWidget";
import PostFeaturedImageWidget from "./PostFeaturedImageWidget";
import PostMetaWidget from "./PostMetaWidget";
import PostRelatedPostsWidget from "./PostRelatedPostsWidget";
import PostSubtitleWidget from "./PostSubtitleWidget";
import PostTagsWidget from "./PostTagsWidget";
import PostTitleWidget from "./PostTitleWidget";
import { toFontWeight, toPx } from "./helpers";
import { Eye, MessageCircle } from "lucide-react";

const PostCommentsWidget = dynamic(() => import("./PostCommentsWidget"), {
  ssr: false,
  loading: () =>
    React.createElement(
      "div",
      {
        className: "rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--fg-secondary)]",
      },
      "Memuat komentar..."
    ),
});

const PostShareWidget = dynamic(() => import("./PostShareWidget"), {
  ssr: false,
  loading: () =>
    React.createElement(
      "div",
      {
        className: "rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--fg-secondary)]",
      },
      "Memuat tombol bagikan..."
    ),
});

const PostNavigationWidget = dynamic(() => import("./PostNavigationWidget"), {
  ssr: false,
  loading: () =>
    React.createElement(
      "div",
      {
        className: "rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--fg-secondary)]",
      },
      "Memuat navigasi artikel..."
    ),
});

function PostStatsWidget({ post, metaColor, widgetContainerStyle, getConfigBool, getResponsiveConfig, isPublicDarkMode }: WidgetRenderContext) {
  const showViews = getConfigBool("showViews", true);
  const showComments = getConfigBool("showComments", true);
  if (!showViews && !showComments) return null;
  const statsDesign = String(getResponsiveConfig("statsDesign") || "minimal");

  const rawTextAlign = (widgetContainerStyle as React.CSSProperties | undefined)?.textAlign;
  const justifyContent =
    rawTextAlign === "center"
      ? "center"
      : rawTextAlign === "right"
        ? "flex-end"
        : "flex-start";
  const statsFontSize = toPx(getResponsiveConfig("fontSize"));
  const statsFontWeight = toFontWeight(getResponsiveConfig("fontWeight"), "400");
  const rawLineHeight = getResponsiveConfig("lineHeight");
  const statsLineHeight =
    typeof rawLineHeight === "number"
      ? rawLineHeight
      : typeof rawLineHeight === "string" && rawLineHeight.trim() !== "" && !Number.isNaN(Number(rawLineHeight))
        ? Number(rawLineHeight)
        : undefined;
  const customColor = getResponsiveConfig("color");
  const statsColor = typeof customColor === "string" && customColor.trim() !== "" ? customColor : metaColor;

  const rawViews = (post as any)?.views;
  const rawViewsBase = (post as any)?.viewsBase;
  const views = typeof rawViews === "number" && Number.isFinite(rawViews) ? rawViews : Number(rawViews);
  const viewsBase = typeof rawViewsBase === "number" && Number.isFinite(rawViewsBase) ? rawViewsBase : Number(rawViewsBase);
  const viewRealCount = Number.isFinite(views) ? Math.max(0, Math.floor(views)) : 0;
  const viewBaseCount = Number.isFinite(viewsBase) ? Math.max(0, Math.floor(viewsBase)) : 0;
  const viewCount = Math.max(0, Math.floor(viewRealCount + viewBaseCount));

  const rawCommentCount = (post as any)?.commentCount ?? (post as any)?._count?.comments;
  const comments = typeof rawCommentCount === "number" && Number.isFinite(rawCommentCount) ? rawCommentCount : Number(rawCommentCount);
  const commentCount = Number.isFinite(comments) ? Math.max(0, Math.floor(comments)) : 0;

  const parts: React.ReactNode[] = [];
  if (showViews) {
    parts.push(
      React.createElement(
        "span",
        { key: "views", className: "inline-flex items-center gap-1.5" },
        React.createElement(Eye, { className: "w-4 h-4" }),
        React.createElement("span", { style: isPublicDarkMode ? { color: "var(--fg-primary)", fontWeight: 600 } : undefined }, viewCount)
      )
    );
  }
  if (showComments) {
    parts.push(
      React.createElement(
        "span",
        { key: "comments", className: "inline-flex items-center gap-1.5" },
        React.createElement(MessageCircle, { className: "w-4 h-4" }),
        React.createElement("span", { style: isPublicDarkMode ? { color: "var(--fg-primary)", fontWeight: 600 } : undefined }, commentCount)
      )
    );
  }

  const textStyle: React.CSSProperties = {
    ...(widgetContainerStyle || {}),
    justifyContent,
    color: statsColor,
    fontSize: statsFontSize,
    fontWeight: statsFontWeight,
    lineHeight: statsLineHeight,
  };
  const darkSurfaceStyle: React.CSSProperties | undefined = isPublicDarkMode
    ? {
        backgroundColor: "rgba(15, 23, 42, 0.32)",
        borderColor: "rgba(148, 163, 184, 0.18)",
        boxShadow: "0 10px 30px rgba(2, 6, 23, 0.14)",
        backdropFilter: "blur(10px)",
      }
    : undefined;

  if (statsDesign === "pill") {
    return React.createElement(
      "div",
      {
        className: "flex flex-wrap items-center gap-2 text-sm",
        style: textStyle,
      },
      ...parts.map((item, idx) =>
        React.createElement(
          "span",
          {
            key: `stats-pill-${idx}`,
            className: "inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1",
            style: darkSurfaceStyle,
          },
          item
        )
      )
    );
  }

  if (statsDesign === "boxed") {
    const boxedChildren: React.ReactNode[] = [];
    parts.forEach((item, idx) => {
      if (idx > 0) boxedChildren.push(React.createElement("span", { key: `stats-divider-${idx}`, className: "opacity-60" }, "•"));
      boxedChildren.push(item);
    });

    return React.createElement(
      "div",
      {
        className: "flex flex-wrap items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm",
        style: { ...textStyle, ...darkSurfaceStyle },
      },
      ...boxedChildren
    );
  }

  const minimalChildren: React.ReactNode[] = [];
  parts.forEach((item, idx) => {
    if (idx > 0) minimalChildren.push(React.createElement("span", { key: `stats-separator-${idx}`, className: "opacity-60" }, "•"));
    minimalChildren.push(item);
  });

  return React.createElement(
    "div",
    {
      className: "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg text-sm",
      style: isPublicDarkMode
        ? {
            ...textStyle,
            color: "var(--fg-secondary)",
            padding: "0.2rem 0",
          }
        : textStyle,
    },
    ...minimalChildren
  );
}

export const POST_WIDGET_COMPONENTS: Record<string, React.ComponentType<WidgetRenderContext>> = {
  post_breadcrumb: PostBreadcrumbWidget,
  post_title: PostTitleWidget,
  post_subtitle: PostSubtitleWidget,
  post_meta: PostMetaWidget,
  post_stats: PostStatsWidget,
  post_featured_image: PostFeaturedImageWidget,
  post_content: PostContentWidget,
  post_tags: PostTagsWidget,
  post_share: PostShareWidget,
  post_author_box: PostAuthorBoxWidget,
  post_navigation: PostNavigationWidget,
  post_related_posts: PostRelatedPostsWidget,
  post_comments: PostCommentsWidget
};
