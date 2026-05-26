import { WidgetRenderContext } from "./types";
import { toFontWeight, toPx } from "./helpers";

export default function PostSubtitleWidget({
  post,
  contentColor,
  preview,
  widgetContainerStyle,
  getResponsiveConfig,
  getConfigBool,
  isPublicDarkMode
}: WidgetRenderContext) {
  const subtitle = post?.subtitle || (preview ? "Ini adalah subjudul artikel untuk simulasi preview." : "");
  if (!subtitle) return null;
  const isItalic = getConfigBool("isItalic", false);
  const subtitleColorConfig = getResponsiveConfig("color");
  const hasCustomSubtitleColor = typeof subtitleColorConfig === "string" && subtitleColorConfig.trim() !== "";
  const subtitleColor = hasCustomSubtitleColor ? subtitleColorConfig : (isPublicDarkMode ? "var(--fg-secondary)" : contentColor);
  const subtitleSize = toPx(getResponsiveConfig("fontSize")) || (preview ? "1.125rem" : "var(--post-subtitle-size, 1.125rem)");
  const subtitleWeight = toFontWeight(getResponsiveConfig("fontWeight"), preview ? "400" : "var(--post-subtitle-weight, 400)");
  const subtitleLineHeight = getResponsiveConfig("lineHeight");
  const subtitleAlign = getResponsiveConfig("textAlign");
  return (
    <p
      className={preview ? "text-sm" : "text-lg"}
      style={{
        ...widgetContainerStyle,
        color: subtitleColor,
        opacity: isPublicDarkMode && !hasCustomSubtitleColor ? 0.95 : undefined,
        fontSize: subtitleSize,
        fontWeight: subtitleWeight,
        fontFamily: preview ? "var(--font-body, Inter), sans-serif" : "var(--post-subtitle-font, var(--font-body, Inter)), sans-serif",
        lineHeight: typeof subtitleLineHeight === "number" ? subtitleLineHeight : (preview ? 1.6 : "var(--post-subtitle-line-height, 1.6)"),
        textAlign: subtitleAlign === "left" || subtitleAlign === "center" || subtitleAlign === "right" || subtitleAlign === "justify" ? subtitleAlign : undefined,
        fontStyle: isItalic ? "italic" : "normal"
      }}
    >
      {subtitle}
    </p>
  );
}
