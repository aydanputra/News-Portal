import React from "react";
import {
  resolveThemeFontFamily,
  resolveThemeFontSynthesis,
} from "@/lib/font-utils";
import PranalaPostContent from "../components/PranalaPostContent";
import { WidgetRenderContext } from "./types";
import { toFontWeight, toPx } from "./helpers";

const resolvePublicFont = (font: unknown, fallback = "inherit") => {
  const value = typeof font === "string" ? font.trim() : "";
  if (!value) return fallback;
  return resolveThemeFontFamily(value, fallback);
};

export default function PostContentWidget({
  post,
  setting,
  inlineRelatedPosts,
  headingColor,
  contentColor,
  widgetContainerStyle,
  getResponsiveConfig,
  getConfigBool,
  isPublicDarkMode
}: WidgetRenderContext) {
  const fallbackContent = "<p>Konten artikel simulasi untuk mencerminkan tampilan publik.</p><p>Layout, line-height, dan ritme paragraf mengikuti renderer publik.</p>";
  const contentColorConfig = getResponsiveConfig("color");
  const resolvedContentColor = typeof contentColorConfig === "string" && contentColorConfig.trim() !== ""
    ? contentColorConfig
    : (isPublicDarkMode ? "var(--fg-primary)" : contentColor);
  const resolvedHeadingColor = isPublicDarkMode ? "var(--fg-primary)" : headingColor;
  const contentFontSize = toPx(getResponsiveConfig("fontSize"));
  const contentFontWeight = toFontWeight(getResponsiveConfig("fontWeight"), "400");
  const contentLineHeight = getResponsiveConfig("lineHeight");
  const contentFontValue = String(setting?.postContentFont || setting?.globalContentFont || setting?.bodyFont || "Inter");
  const headingFontValue = String(setting?.postTitleFont || setting?.headingFont || "Inter");
  const contentFontFamily = resolvePublicFont(contentFontValue, "Inter");
  const contentFontSynthesis = resolveThemeFontSynthesis(contentFontValue);
  const headingFontFamily = resolvePublicFont(headingFontValue, "Inter");
  const headingFontSynthesis = resolveThemeFontSynthesis(headingFontValue);
  const headingFontWeight = String(setting?.postTitleFontWeight || "700");
  const resolvedLineHeight: React.CSSProperties["lineHeight"] = (() => {
    if (typeof contentLineHeight === "number" && Number.isFinite(contentLineHeight)) return contentLineHeight;
    if (typeof contentLineHeight === "string") {
      const trimmed = contentLineHeight.trim();
      if (!trimmed) return undefined;
      const asNumber = Number(trimmed);
      if (Number.isFinite(asNumber)) return asNumber;
      if (/^\d+(\.\d+)?(px|rem|em|%)$/i.test(trimmed)) return trimmed;
    }
    return undefined;
  })();
  const contentAlign = getResponsiveConfig("textAlign");
  const contentTextAlign = contentAlign === "left" || contentAlign === "center" || contentAlign === "right" || contentAlign === "justify" ? contentAlign : undefined;
  const isContentItalic = getConfigBool("isItalic", false);
  const inlineRelatedPositions = String(setting?.postRelatedPositions || "2")
    .split(",")
    .map((value: string) => Number.parseInt(value.trim(), 10))
    .filter((value: number, index: number, array: number[]) => Number.isFinite(value) && value > 0 && array.indexOf(value) === index)
    .sort((a: number, b: number) => a - b);
  const inlineAdPositions = String(setting?.postInlineAdPositions || "3")
    .split(",")
    .map((value: string) => Number.parseInt(value.trim(), 10))
    .filter((value: number, index: number, array: number[]) => Number.isFinite(value) && value > 0 && array.indexOf(value) === index)
    .sort((a: number, b: number) => a - b);
  return (
    <div
      className="post-content-body"
      style={{
        ...widgetContainerStyle,
        color: resolvedContentColor,
        fontSize: contentFontSize,
        fontWeight: contentFontWeight,
        fontFamily: contentFontFamily,
        fontSynthesis: contentFontSynthesis,
        lineHeight: resolvedLineHeight,
        textAlign: contentTextAlign,
        fontStyle: isContentItalic ? "italic" : "normal",
        ["--post-content-widget-color" as keyof React.CSSProperties]: resolvedContentColor,
        ["--post-content-widget-heading-color" as keyof React.CSSProperties]: resolvedHeadingColor,
        ["--post-content-widget-font" as keyof React.CSSProperties]: contentFontFamily,
        ["--post-content-widget-synthesis" as keyof React.CSSProperties]: contentFontSynthesis,
        ["--post-content-widget-weight" as keyof React.CSSProperties]: contentFontWeight,
        ["--post-content-widget-heading-font" as keyof React.CSSProperties]: headingFontFamily,
        ["--post-content-widget-heading-synthesis" as keyof React.CSSProperties]: headingFontSynthesis,
        ["--post-content-widget-heading-weight" as keyof React.CSSProperties]: headingFontWeight,
      }}
    >
      <PranalaPostContent
        content={post?.content || fallbackContent}
        style={{ lineHeight: resolvedLineHeight }}
        className="[&_p]:text-inherit [&_li]:text-inherit [&_blockquote]:text-inherit [&_h1]:text-inherit [&_h2]:text-inherit [&_h3]:text-inherit [&_h4]:text-inherit [&_h5]:text-inherit [&_h6]:text-inherit [&_strong]:text-inherit [&_a]:text-inherit [&_p]:leading-[inherit] [&_li]:leading-[inherit] [&_blockquote]:leading-[inherit] [&_p]:font-[inherit] [&_li]:font-[inherit] [&_blockquote]:font-[inherit]"
        inlineRelatedItems={inlineRelatedPosts}
        inlineRelatedConfig={{
          enabled: Boolean(setting?.postInlineRelated),
          positions: inlineRelatedPositions,
          count: Math.max(1, Number.parseInt(String(setting?.postRelatedCount || "2"), 10) || 2),
          layout: String(setting?.postInlineRelatedLayout || "list"),
          gridColumns: Math.min(4, Math.max(1, Number.parseInt(String(setting?.postInlineRelatedGridColumns || "2"), 10) || 2)),
          cardColumns: Math.min(2, Math.max(1, Number.parseInt(String(setting?.postInlineRelatedCardColumns || "1"), 10) || 1)),
          titleFontSize: Number.parseInt(String(setting?.postInlineRelatedTitleFontSize || "16"), 10) || 16,
          titleFont: String(setting?.postInlineRelatedTitleFont || setting?.postTitleFont || setting?.postWidgetTitleFont || "Inter"),
          titleFontWeight: String(setting?.postInlineRelatedTitleFontWeight || "700"),
          titleLineHeight: String(setting?.postInlineRelatedTitleLineHeight || "1.35"),
          headingText: String(setting?.postInlineRelatedHeadingText || "Baca Juga"),
          headingFont: String(setting?.postInlineRelatedHeadingFont || setting?.postInlineRelatedTitleFont || setting?.postTitleFont || "Inter"),
          headingFontWeight: String(setting?.postInlineRelatedHeadingFontWeight || "700"),
          headingLetterSpacing: String(setting?.postInlineRelatedHeadingLetterSpacing || "0"),
          fontSize: Number.parseInt(String(setting?.postInlineRelatedFontSize || "14"), 10) || 14,
          headingColor: String(setting?.postInlineRelatedTitleColor || "#1e293b"),
          textColor: String(setting?.postInlineRelatedTextColor || "#1f2937"),
          hoverColor: String(setting?.postInlineRelatedHoverColor || setting?.postPrimaryColor || "#2563eb"),
        }}
        inlineAdsConfig={{
          enabled: Boolean(setting?.postInlineAds),
          positions: inlineAdPositions,
        }}
      />
    </div>
  );
}
