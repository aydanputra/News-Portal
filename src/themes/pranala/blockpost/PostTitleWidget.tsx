import { WidgetRenderContext } from "./types";
import { toFontWeight, toPx } from "./helpers";

export default function PostTitleWidget({
  post,
  headingColor,
  preview,
  widgetContainerStyle,
  getResponsiveConfig,
  isPublicDarkMode
}: WidgetRenderContext) {
  const titleColor = isPublicDarkMode
    ? "var(--fg-primary)"
    : ((getResponsiveConfig("color") as string) || headingColor);
  const titleSize = toPx(getResponsiveConfig("fontSize")) || (preview ? "2.25rem" : "var(--post-title-size, 3rem)");
  const titleWeight = toFontWeight(getResponsiveConfig("fontWeight"), preview ? "700" : "var(--post-title-weight, 700)");
  const lh = getResponsiveConfig("lineHeight");
  const titleAlign = getResponsiveConfig("textAlign");
  return (
    <h1
      style={{
        ...widgetContainerStyle,
        color: titleColor,
        textShadow: isPublicDarkMode ? "0 1px 0 rgba(0,0,0,0.35)" : undefined,
        fontSize: titleSize,
        fontWeight: titleWeight,
        fontFamily: preview ? "var(--font-heading, Inter), sans-serif" : "var(--post-title-font, var(--font-heading, Inter)), sans-serif",
        lineHeight: typeof lh === "number" ? lh : (preview ? 1.15 : "var(--post-title-line-height, 1.15)"),
        textAlign: titleAlign === "left" || titleAlign === "center" || titleAlign === "right" || titleAlign === "justify" ? titleAlign : undefined
      }}
    >
      {post?.title || "Judul Artikel"}
    </h1>
  );
}
