import React from "react";

interface ArchiveHeaderProps {
  block: any;
  title: string;
  description?: string;
  totalPosts: number;
}

const toPx = (value: unknown, fallback: string) => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string" && value.trim() !== "" && /^-?\d+(\.\d+)?$/.test(value.trim())) {
    return `${value.trim()}px`;
  }
  return fallback;
};

export default function ArchiveHeader({ block, title, description, totalPosts }: ArchiveHeaderProps) {
  const config = block?.config || {};
  const rootId = `archive-header-${String(block?.id || "default").replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const showDescription = config.showDescription !== false;
  const showPostCount = config.showPostCount !== false;
  const textAlign = config.textAlign === "center" || config.textAlign === "right" ? config.textAlign : "left";
  const headerStyle = config.headerStyle === "card" || config.headerStyle === "spotlight" ? config.headerStyle : "minimal";
  const titleColorDesktop = typeof config.titleColor === "string" && config.titleColor.trim() !== ""
    ? config.titleColor
    : "var(--home-widget-title-color, var(--heading-color, #111827))";
  const titleColorTablet = typeof config.tabletTitleColor === "string" && config.tabletTitleColor.trim() !== ""
    ? config.tabletTitleColor
    : titleColorDesktop;
  const titleColorMobile = typeof config.mobileTitleColor === "string" && config.mobileTitleColor.trim() !== ""
    ? config.mobileTitleColor
    : titleColorDesktop;
  const descriptionColorDesktop = typeof config.descriptionColor === "string" && config.descriptionColor.trim() !== ""
    ? config.descriptionColor
    : "var(--home-excerpt-color, #6b7280)";
  const descriptionColorTablet = typeof config.tabletDescriptionColor === "string" && config.tabletDescriptionColor.trim() !== ""
    ? config.tabletDescriptionColor
    : descriptionColorDesktop;
  const descriptionColorMobile = typeof config.mobileDescriptionColor === "string" && config.mobileDescriptionColor.trim() !== ""
    ? config.mobileDescriptionColor
    : descriptionColorDesktop;
  const metaColorDesktop = typeof config.metaColor === "string" && config.metaColor.trim() !== ""
    ? config.metaColor
    : "var(--home-meta-color, #94a3b8)";
  const metaColorTablet = typeof config.tabletMetaColor === "string" && config.tabletMetaColor.trim() !== ""
    ? config.tabletMetaColor
    : metaColorDesktop;
  const metaColorMobile = typeof config.mobileMetaColor === "string" && config.mobileMetaColor.trim() !== ""
    ? config.mobileMetaColor
    : metaColorDesktop;
  const titleSizeDesktop = toPx(config.titleFontSize, "var(--archive-title-size, 2.25rem)");
  const titleSizeTablet = toPx(config.tabletTitleFontSize, titleSizeDesktop);
  const titleSizeMobile = toPx(config.mobileTitleFontSize, titleSizeDesktop);
  const descriptionSizeDesktop = toPx(config.descriptionFontSize, "var(--archive-excerpt-size, 1rem)");
  const descriptionSizeTablet = toPx(config.tabletDescriptionFontSize, descriptionSizeDesktop);
  const descriptionSizeMobile = toPx(config.mobileDescriptionFontSize, descriptionSizeDesktop);
  const countSizeDesktop = toPx(config.metaFontSize, "var(--archive-meta-size, 0.8125rem)");
  const countSizeTablet = toPx(config.tabletMetaFontSize, countSizeDesktop);
  const countSizeMobile = toPx(config.mobileMetaFontSize, countSizeDesktop);
  const titleWeight = typeof config.titleFontWeight === "string" && config.titleFontWeight.trim() !== ""
    ? config.titleFontWeight
    : "var(--home-widget-title-weight, 700)";
  const titleFont = typeof config.titleFontFamily === "string" && config.titleFontFamily.trim() !== ""
    ? config.titleFontFamily
    : "var(--home-widget-title-font, inherit)";
  const descriptionWeight = typeof config.descriptionFontWeight === "string" && config.descriptionFontWeight.trim() !== ""
    ? config.descriptionFontWeight
    : "var(--archive-excerpt-weight, 400)";
  const descriptionFont = typeof config.descriptionFontFamily === "string" && config.descriptionFontFamily.trim() !== ""
    ? config.descriptionFontFamily
    : "var(--archive-excerpt-font, inherit)";
  const metaWeight = typeof config.metaFontWeight === "string" && config.metaFontWeight.trim() !== ""
    ? config.metaFontWeight
    : "var(--archive-meta-weight, 500)";
  const metaFont = typeof config.metaFontFamily === "string" && config.metaFontFamily.trim() !== ""
    ? config.metaFontFamily
    : "var(--archive-meta-font, inherit)";
  const accentColorDesktop = typeof config.accentColor === "string" && config.accentColor.trim() !== ""
    ? config.accentColor
    : "var(--accent, #2563eb)";
  const accentColorTablet = typeof config.tabletAccentColor === "string" && config.tabletAccentColor.trim() !== ""
    ? config.tabletAccentColor
    : accentColorDesktop;
  const accentColorMobile = typeof config.mobileAccentColor === "string" && config.mobileAccentColor.trim() !== ""
    ? config.mobileAccentColor
    : accentColorDesktop;
  const panelBorderDesktop = typeof config.panelBorderColor === "string" && config.panelBorderColor.trim() !== ""
    ? config.panelBorderColor
    : "color-mix(in srgb, var(--border, #e5e7eb) 72%, var(--accent, #2563eb) 28%)";
  const panelBorderTablet = typeof config.tabletPanelBorderColor === "string" && config.tabletPanelBorderColor.trim() !== ""
    ? config.tabletPanelBorderColor
    : panelBorderDesktop;
  const panelBorderMobile = typeof config.mobilePanelBorderColor === "string" && config.mobilePanelBorderColor.trim() !== ""
    ? config.mobilePanelBorderColor
    : panelBorderDesktop;
  const eyebrowText = typeof config.eyebrowText === "string" && config.eyebrowText.trim() !== ""
    ? config.eyebrowText
    : "Arsip";
  const alignmentClasses =
    textAlign === "center"
      ? { wrapper: "items-center text-center", description: "mx-auto", meta: "justify-center" }
      : textAlign === "right"
        ? { wrapper: "items-end text-right", description: "ml-auto", meta: "justify-end" }
        : { wrapper: "items-start text-left", description: "", meta: "justify-start" };
  const sharedTitleStyle: React.CSSProperties = {
    color: "var(--archive-header-title-color)",
    fontSize: "var(--archive-header-title-size)",
    fontWeight: "var(--widget-title-weight, var(--home-widget-title-weight))" as React.CSSProperties["fontWeight"],
    fontFamily: "var(--widget-title-font, var(--home-widget-title-font), sans-serif)",
    lineHeight: 1.2,
    letterSpacing: "normal"
  };
  const sharedDescriptionStyle: React.CSSProperties = {
    color: "var(--archive-header-description-color)",
    fontSize: "var(--archive-header-description-size)",
    fontWeight: descriptionWeight as React.CSSProperties["fontWeight"],
    fontFamily: descriptionFont
  };
  const sharedMetaStyle: React.CSSProperties = {
    color: "var(--archive-header-meta-color)",
    fontSize: "var(--archive-header-meta-size)",
    fontWeight: metaWeight as React.CSSProperties["fontWeight"],
    fontFamily: metaFont
  };
  const containerRadius = "calc(var(--home-main-box-radius,0.75rem) + 0.15rem)";
  const headerTextClassName = textAlign === "center" ? "text-center" : textAlign === "right" ? "text-right" : "text-left";
  const widgetHeadingClassName = `font-bold mb-4 border-b border-gray-100 pb-3 flex items-center theme-widget-title ${
    textAlign === "center" ? "justify-center" : textAlign === "right" ? "justify-end" : ""
  }`;
  const widgetHeadingStyle = {
    borderBottomColor: "var(--archive-header-panel-border)",
    '--widget-title-size-mobile': titleSizeMobile,
    '--widget-title-size-tablet': titleSizeTablet,
    '--widget-title-size-desktop': titleSizeDesktop,
    '--widget-title-color-mobile': titleColorMobile,
    '--widget-title-color-tablet': titleColorTablet,
    '--widget-title-color-desktop': titleColorDesktop,
    '--widget-title-weight': titleWeight,
    '--widget-title-font': titleFont,
  } as React.CSSProperties;
  const widgetHeading = (
    <h2 className={widgetHeadingClassName} style={widgetHeadingStyle}>
      <span className="widget-title-bar w-1 h-5 mr-3 shrink-0" style={{ backgroundColor: "var(--archive-header-accent)", borderRadius: "var(--home-main-box-radius, 0.75rem)" }} />
      <span>{title}</span>
    </h2>
  );

  return (
    <div id={rootId}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #${rootId} {
              --archive-header-title-color: ${titleColorMobile};
              --archive-header-description-color: ${descriptionColorMobile};
              --archive-header-meta-color: ${metaColorMobile};
              --archive-header-title-size: ${titleSizeMobile};
              --archive-header-description-size: ${descriptionSizeMobile};
              --archive-header-meta-size: ${countSizeMobile};
              --archive-header-accent: ${accentColorMobile};
              --archive-header-panel-border: ${panelBorderMobile};
            }
            @media (min-width: 768px) {
              #${rootId} {
                --archive-header-title-color: ${titleColorTablet};
                --archive-header-description-color: ${descriptionColorTablet};
                --archive-header-meta-color: ${metaColorTablet};
                --archive-header-title-size: ${titleSizeTablet};
                --archive-header-description-size: ${descriptionSizeTablet};
                --archive-header-meta-size: ${countSizeTablet};
                --archive-header-accent: ${accentColorTablet};
                --archive-header-panel-border: ${panelBorderTablet};
              }
            }
            @media (min-width: 1025px) {
              #${rootId} {
                --archive-header-title-color: ${titleColorDesktop};
                --archive-header-description-color: ${descriptionColorDesktop};
                --archive-header-meta-color: ${metaColorDesktop};
                --archive-header-title-size: ${titleSizeDesktop};
                --archive-header-description-size: ${descriptionSizeDesktop};
                --archive-header-meta-size: ${countSizeDesktop};
                --archive-header-accent: ${accentColorDesktop};
                --archive-header-panel-border: ${panelBorderDesktop};
              }
            }
          `
        }}
      />
      <>
      {headerStyle === "minimal" && (
        <div className={`w-full ${headerTextClassName}`}>
          {widgetHeading}
          {showDescription && description && (
            <p className={`max-w-2xl leading-7 ${alignmentClasses.description}`} style={sharedDescriptionStyle}>
              {description}
            </p>
          )}
          {showPostCount && (
            <div className={`mt-5 flex items-center gap-3 ${alignmentClasses.meta}`} style={sharedMetaStyle}>
              <span>{eyebrowText}</span>
              <span className="inline-block h-1 w-1 rounded-full" style={{ backgroundColor: "var(--archive-header-meta-color)" }} />
              <span>{totalPosts} artikel</span>
            </div>
          )}
        </div>
      )}

      {headerStyle === "card" && (
        <div
          className={`w-full ${headerTextClassName}`}
        >
          <div className={`flex flex-col ${alignmentClasses.wrapper}`}>
            <div className="flex w-full items-center gap-4">
              {textAlign !== "left" && (
                <span
                  className="block h-[3px] min-w-10 flex-1 rounded-full"
                  style={{ backgroundColor: "var(--archive-header-accent)" }}
                  aria-hidden="true"
                />
              )}
              <h2 className="shrink-0" style={sharedTitleStyle}>
                {title}
              </h2>
              {textAlign !== "right" && (
                <span
                  className="block h-[3px] min-w-10 flex-1 rounded-full"
                  style={{ backgroundColor: "var(--archive-header-accent)" }}
                  aria-hidden="true"
                />
              )}
            </div>
            {showDescription && description && (
              <p className={`mt-4 max-w-2xl leading-7 ${alignmentClasses.description}`} style={sharedDescriptionStyle}>
                {description}
              </p>
            )}
            {showPostCount && (
              <div className={`mt-6 flex ${alignmentClasses.meta}`}>
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                  style={{
                    ...sharedMetaStyle,
                    borderColor: "var(--archive-header-panel-border)",
                    background: "color-mix(in srgb, var(--bg-surface, #ffffff) 92%, transparent)"
                  }}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--archive-header-accent)" }} />
                  <span>{totalPosts} artikel</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {headerStyle === "spotlight" && (
        <div
          className={`w-full ${headerTextClassName}`}
          style={{
            background: "var(--bg-surface, #ffffff)",
            borderRadius: containerRadius
          }}
        >
          <div className={`flex flex-col ${alignmentClasses.wrapper}`}>
            <h1 className="max-w-4xl leading-[1.08] tracking-[-0.038em]" style={sharedTitleStyle}>
              {title}
            </h1>
            <div className="relative mt-3 w-full h-3" aria-hidden="true">
              <span
                className="absolute left-0 right-0 top-1/2 block h-px -translate-y-1/2"
                style={{ backgroundColor: "var(--archive-header-panel-border)" }}
              />
              <span
                className={`absolute top-1/2 block h-1 w-8 -translate-y-1/2 rounded-full ${
                  textAlign === "center" ? "left-1/2 -translate-x-1/2" : textAlign === "right" ? "right-0" : "left-0"
                }`}
                style={{ backgroundColor: "var(--archive-header-accent)" }}
              />
            </div>
            {showDescription && description && (
              <p className={`mt-4 max-w-2xl leading-7 ${alignmentClasses.description}`} style={sharedDescriptionStyle}>
                {description}
              </p>
            )}
            {showPostCount && (
              <div className={`mt-6 flex ${alignmentClasses.meta}`}>
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
                  style={{
                    ...sharedMetaStyle,
                    background: "color-mix(in srgb, var(--bg-surface, #ffffff) 86%, transparent)",
                    border: "1px solid var(--archive-header-panel-border)"
                  }}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--archive-header-accent)" }} />
                  <span>{totalPosts} artikel</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </>
    </div>
  );
}
