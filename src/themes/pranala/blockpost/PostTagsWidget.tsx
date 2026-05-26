import Link from "next/link";
import { WidgetRenderContext } from "./types";
import { toFontWeight, toPx } from "./helpers";

export default function PostTagsWidget({
  post,
  metaColor,
  preview,
  widgetContainerStyle,
  getResponsiveConfig,
  getConfigBool,
  isPublicDarkMode
}: WidgetRenderContext) {
  const tags = Array.isArray(post?.tags) && post.tags.length > 0 ? post.tags : (preview ? [{ id: "t1", name: "politik", slug: "politik" }, { id: "t2", name: "ekonomi", slug: "ekonomi" }] : []);
  if (tags.length === 0) return null;
  const showTagLabel = getConfigBool("showTagLabel", true);
  const rawTagLabelText = getResponsiveConfig("tagLabelText");
  const tagLabelText = typeof rawTagLabelText === "string" && rawTagLabelText.trim() !== "" ? rawTagLabelText.trim() : "Tag Terkait :";
  const tagLabelColorConfig = getResponsiveConfig("tagLabelColor");
  const tagLabelColor = typeof tagLabelColorConfig === "string" && tagLabelColorConfig.trim() !== "" ? tagLabelColorConfig : (isPublicDarkMode ? "var(--fg-primary)" : metaColor);
  const tagLabelFontSize = toPx(getResponsiveConfig("tagLabelFontSize")) || (preview ? "10px" : "12px");
  const tagLabelFontWeight = toFontWeight(getResponsiveConfig("tagLabelFontWeight"), "600");
  const rawTagDesign = String(getResponsiveConfig("tagDesign") || "");
  const legacyStyle = String(getResponsiveConfig("style") || "");
  const tagDesign = rawTagDesign === "cloud" || rawTagDesign === "soft" || rawTagDesign === "outline" ? rawTagDesign : (legacyStyle === "plain" ? "outline" : "cloud");
  const tagFontSize = toPx(getResponsiveConfig("tagFontSize")) || (preview ? "10px" : "12px");
  const radiusValue = getResponsiveConfig("tagBorderRadius");
  const resolveTagRadius = (value: unknown): string => {
    if (value === undefined || value === null || value === "") return "var(--home-main-box-radius, 0.25rem)";
    if (typeof value === "number" && Number.isFinite(value)) {
      if (value < 0 || value === 4) return "var(--home-main-box-radius, 0.25rem)";
      if (legacyStyle === "pills" && value >= 100) return "var(--home-main-box-radius, 0.25rem)";
      if (value === 0) return "0";
      return `${value}px`;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return "var(--home-main-box-radius, 0.25rem)";
      const lower = trimmed.toLowerCase();
      if (lower === "default" || lower === "global") return "var(--home-main-box-radius, 0.25rem)";
      if (lower === "none") return "0";
      if (lower === "sm") return "0.125rem";
      if (lower === "md") return "0.375rem";
      if (lower === "lg") return "0.5rem";
      if (lower === "xl") return "0.75rem";
      if (lower === "full") return "9999px";
      if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        const parsed = Number(trimmed);
        if (!Number.isFinite(parsed) || parsed < 0 || parsed === 4) return "var(--home-main-box-radius, 0.25rem)";
        if (legacyStyle === "pills" && parsed >= 100) return "var(--home-main-box-radius, 0.25rem)";
        if (parsed === 0) return "0";
        return `${parsed}px`;
      }
      return trimmed;
    }
    return "var(--home-main-box-radius, 0.25rem)";
  };
  const tagBorderRadius = resolveTagRadius(radiusValue);
  const gapXValue = Number(getResponsiveConfig("tagGapX"));
  const gapYValue = Number(getResponsiveConfig("tagGapY"));
  const gapX = Number.isFinite(gapXValue) && gapXValue >= 0 ? `${gapXValue}px` : "8px";
  const gapY = Number.isFinite(gapYValue) && gapYValue >= 0 ? `${gapYValue}px` : "8px";
  const paddingXValue = Number(getResponsiveConfig("tagPaddingX"));
  const paddingYValue = Number(getResponsiveConfig("tagPaddingY"));
  const paddingX = Number.isFinite(paddingXValue) && paddingXValue >= 0 ? `${paddingXValue}px` : "12px";
  const paddingY = Number.isFinite(paddingYValue) && paddingYValue >= 0 ? `${paddingYValue}px` : "4px";
  const configTagTextColor = getResponsiveConfig("tagTextColor");
  const configTagBackgroundColor = getResponsiveConfig("tagBackgroundColor");
  const configTagBorderColor = getResponsiveConfig("tagBorderColor");
  const configTagHoverBgColor = getResponsiveConfig("tagHoverBackgroundColor");
  const configTagHoverTextColor = getResponsiveConfig("tagHoverTextColor");
  const configTagHoverBorderColor = getResponsiveConfig("tagHoverBorderColor");
  const alignValue = getResponsiveConfig("textAlign");
  const textAlign = alignValue === "left" || alignValue === "center" || alignValue === "right" ? alignValue : "left";
  const justifyContent = textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start";
  const designDefaults = tagDesign === "soft"
    ? { bg: isPublicDarkMode ? "rgba(30, 41, 59, 0.62)" : "var(--post-badge-bg-color, #F3F4F6)", color: isPublicDarkMode ? "var(--fg-primary)" : "var(--post-badge-text-color, #374151)", border: isPublicDarkMode ? "rgba(148, 163, 184, 0.35)" : "#E5E7EB", hoverBg: isPublicDarkMode ? "rgba(51, 65, 85, 0.85)" : "#E5E7EB", hoverColor: isPublicDarkMode ? "var(--fg-primary)" : "var(--post-link-hover-color, #111827)", hoverBorder: isPublicDarkMode ? "rgba(148, 163, 184, 0.5)" : "#D1D5DB" }
    : tagDesign === "outline"
      ? { bg: "transparent", color: isPublicDarkMode ? "var(--fg-secondary)" : "var(--post-badge-text-color, #4B5563)", border: "var(--border)", hoverBg: "var(--load-more-bg-hover)", hoverColor: "var(--post-link-hover-color, var(--load-more-text-hover))", hoverBorder: "var(--load-more-border-hover)" }
      : { bg: "var(--post-badge-bg-color, var(--load-more-bg))", color: "var(--post-badge-text-color, var(--load-more-text))", border: "var(--load-more-border)", hoverBg: "var(--load-more-bg-hover)", hoverColor: "var(--post-link-hover-color, var(--load-more-text-hover))", hoverBorder: "var(--load-more-border-hover)" };
  const tagTextColor = typeof configTagTextColor === "string" && configTagTextColor.trim() !== "" ? configTagTextColor : designDefaults.color;
  const tagBackgroundColor = typeof configTagBackgroundColor === "string" && configTagBackgroundColor.trim() !== "" ? configTagBackgroundColor : designDefaults.bg;
  const tagBorderColor = typeof configTagBorderColor === "string" && configTagBorderColor.trim() !== "" ? configTagBorderColor : designDefaults.border;
  const tagHoverBackgroundColor = typeof configTagHoverBgColor === "string" && configTagHoverBgColor.trim() !== "" ? configTagHoverBgColor : designDefaults.hoverBg;
  const tagHoverTextColor = typeof configTagHoverTextColor === "string" && configTagHoverTextColor.trim() !== "" ? configTagHoverTextColor : designDefaults.hoverColor;
  const tagHoverBorderColor = typeof configTagHoverBorderColor === "string" && configTagHoverBorderColor.trim() !== "" ? configTagHoverBorderColor : designDefaults.hoverBorder;
  const tagTextClass = tagDesign === "outline" ? "font-medium" : "font-semibold";

  return (
    <div className="w-full" style={widgetContainerStyle}>
      <div className="flex flex-wrap items-center" style={{ columnGap: gapX, rowGap: gapY, justifyContent }}>
        {showTagLabel && (
          <span className="inline-flex items-center mr-1" style={{ color: tagLabelColor, fontSize: tagLabelFontSize, fontWeight: tagLabelFontWeight }}>
            {tagLabelText}
          </span>
        )}
      {tags.map((tag: any) => (
        <Link
          key={tag.id || tag.slug || tag.name}
          href={`/tag/${tag.slug || tag.name}`}
          className={`${tagTextClass} inline-flex items-center leading-none border transition-all hover:-translate-y-0.5`}
          style={{ fontSize: tagFontSize, borderRadius: tagBorderRadius, padding: `${paddingY} ${paddingX}`, color: tagTextColor, backgroundColor: tagBackgroundColor, borderColor: tagBorderColor }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tagHoverBackgroundColor; e.currentTarget.style.color = tagHoverTextColor; e.currentTarget.style.borderColor = tagHoverBorderColor; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = tagBackgroundColor; e.currentTarget.style.color = tagTextColor; e.currentTarget.style.borderColor = tagBorderColor; }}
        >
          #{tag.name}
        </Link>
      ))}
      </div>
    </div>
  );
}
