import React from "react";
import { WidgetRenderContext } from "./types";
import PostAuthorBoxWidget from "./PostAuthorBoxWidget";
import PostBreadcrumbWidget from "./PostBreadcrumbWidget";
import PostCommentsWidget from "./PostCommentsWidget";
import PostContentWidget from "./PostContentWidget";
import PostFeaturedImageWidget from "./PostFeaturedImageWidget";
import PostMetaWidget from "./PostMetaWidget";
import PostNavigationWidget from "./PostNavigationWidget";
import PostRelatedPostsWidget from "./PostRelatedPostsWidget";
import PostShareWidget from "./PostShareWidget";
import PostSubtitleWidget from "./PostSubtitleWidget";
import PostTagsWidget from "./PostTagsWidget";
import PostTitleWidget from "./PostTitleWidget";
import { Eye, MessageCircle } from "lucide-react";

function PostStatsWidget({ post, metaColor, widgetContainerStyle, getConfigBool }: WidgetRenderContext) {
  const showViews = getConfigBool("showViews", true);
  const showComments = getConfigBool("showComments", true);
  if (!showViews && !showComments) return null;

  const rawTextAlign = (widgetContainerStyle as React.CSSProperties | undefined)?.textAlign;
  const justifyContent =
    rawTextAlign === "center"
      ? "center"
      : rawTextAlign === "right"
        ? "flex-end"
        : "flex-start";

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
        React.createElement("span", null, viewCount)
      )
    );
  }
  if (showComments) {
    parts.push(
      React.createElement(
        "span",
        { key: "comments", className: "inline-flex items-center gap-1.5" },
        React.createElement(MessageCircle, { className: "w-4 h-4" }),
        React.createElement("span", null, commentCount)
      )
    );
  }

  return React.createElement(
    "div",
    {
      className: "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm",
      style: { ...(widgetContainerStyle || {}), justifyContent, color: metaColor },
    },
    ...parts
  );
}

export const POST_WIDGET_COMPONENTS: Record<string, (props: WidgetRenderContext) => React.ReactElement | null> = {
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
