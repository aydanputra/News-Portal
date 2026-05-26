"use client";

import React from "react";
import { PRANALA_BLOCKS } from "../blocks/registry";

type SidebarWidgetRendererProps = {
  widget: any;
  widgetData: any[];
  categories?: any[];
  setting?: any;
  renderContext?: "homepage" | "single-post" | "archive";
};

const isTruthy = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";

const getResponsiveHideClass = (config: any) => {
  const classes: string[] = [];
  if (isTruthy(config?.hideOnDesktop)) classes.push("hide-desktop-widget");
  if (isTruthy(config?.hideOnTablet)) classes.push("hide-tablet-widget");
  if (isTruthy(config?.hideOnMobile)) classes.push("hide-mobile-widget");
  return classes.join(" ");
};

const resolveHomepageSidebarRadius = (setting: any) => {
  if (setting?.globalBorderRadius) return setting.globalBorderRadius;
  switch (setting?.homeMainColumnBorderRadius) {
    case "none":
      return "0";
    case "sm":
      return "0.125rem";
    case "md":
      return "0.375rem";
    case "lg":
      return "0.5rem";
    case "xl":
      return "0.75rem";
    case "2xl":
      return "1rem";
    default:
      return "0.75rem";
  }
};

export default function SidebarWidgetRenderer({
  widget,
  widgetData,
  categories,
  setting,
  renderContext = "homepage",
}: SidebarWidgetRendererProps) {
  const blockDef = PRANALA_BLOCKS[widget?.type];
  if (!blockDef) return null;

  const Component = blockDef.component as React.ComponentType<Record<string, unknown>>;
  const displayTitle = widget?.title && widget.title.trim() !== "" ? widget.title : widget?.config?.title || "";
  const mergedWidget = {
    ...widget,
    config: {
      ...(widget?.config || {}),
      title: displayTitle,
    },
  };

  const accentColor = setting?.globalAccentColor || setting?.accentColor || "#f59e0b";
  const homeHoverColor = setting?.homeHoverColor || "#2563eb";
  const homeWidgetTitleColor = setting?.homeWidgetTitleColor || "#1e293b";
  const homeNewsTitleColor = setting?.homeNewsTitleColor || "#111827";
  const homeExcerptColor = setting?.homeExcerptColor || "#4b5563";
  const homeMetaColor = setting?.homeMetaColor || "#9ca3af";
  const globalBorderRadius = resolveHomepageSidebarRadius(setting);
  const scopeClass = `homepage-sidebar-theme-${widget?.id || "widget"}`;

  return (
    <div
      data-sidebar-debug-root="true"
      data-render-context={renderContext}
      data-widget-id={String(widget?.id || "")}
      data-widget-type={String(widget?.type || "")}
      data-source-location={String(widget?.config?.inheritedSidebarLocation || widget?.inheritedSidebarLocation || "home")}
      className={`${scopeClass} relative group/widget ${getResponsiveHideClass(mergedWidget?.config)}`.trim()}
      style={{
        "--accent": accentColor,
        "--home-hover-color": homeHoverColor,
        "--home-main-box-radius": globalBorderRadius,
        "--home-widget-title-color": homeWidgetTitleColor,
        "--home-news-title-color": homeNewsTitleColor,
        "--home-excerpt-color": homeExcerptColor,
        "--home-meta-color": homeMetaColor,
        "--home-widget-title-size": setting?.homeWidgetTitleFontSize || "24px",
        "--home-widget-title-weight": setting?.homeWidgetTitleFontWeight || "700",
        "--home-widget-title-font": setting?.homeWidgetTitleFont || "Inter",
        "--home-news-title-size": setting?.homeNewsTitleFontSize || "18px",
        "--home-news-title-weight": setting?.homeNewsTitleFontWeight || "600",
        "--home-news-title-font": setting?.homeNewsTitleFont || "Inter",
        "--home-excerpt-size": setting?.homeExcerptFontSize || "14px",
        "--home-excerpt-weight": setting?.homeExcerptFontWeight || "400",
        "--home-excerpt-font": setting?.homeExcerptFont || "Inter",
        "--home-meta-size": setting?.homeMetaFontSize || "12px",
        "--home-meta-weight": setting?.homeMetaFontWeight || "500",
        "--home-meta-font": setting?.homeMetaFont || "Inter",
        "--post-badge-bg-color": "var(--load-more-bg)",
        "--post-badge-text-color": "var(--load-more-text)",
        "--post-link-hover-color": "var(--load-more-text-hover)",
      } as React.CSSProperties}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .${scopeClass} .theme-widget-title {
              color: var(--widget-title-color-mobile, var(--widget-title-color, var(--home-widget-title-color))) !important;
              font-size: var(--widget-title-size-mobile, var(--widget-title-size, var(--home-widget-title-size))) !important;
              font-weight: var(--widget-title-weight, var(--home-widget-title-weight)) !important;
              font-family: var(--widget-title-font, var(--home-widget-title-font), sans-serif) !important;
            }
            .${scopeClass} .widget-title-bar {
              background-color: var(--widget-title-border-color-mobile, var(--widget-title-border-color, var(--accent))) !important;
            }
            @media (min-width: 768px) {
              .${scopeClass} .theme-widget-title {
                color: var(--widget-title-color-tablet, var(--widget-title-color-mobile, var(--widget-title-color, var(--home-widget-title-color)))) !important;
                font-size: var(--widget-title-size-tablet, var(--widget-title-size-mobile, var(--widget-title-size, var(--home-widget-title-size)))) !important;
              }
              .${scopeClass} .widget-title-bar {
                background-color: var(--widget-title-border-color-tablet, var(--widget-title-border-color-mobile, var(--widget-title-border-color, var(--accent)))) !important;
              }
            }
            @media (min-width: 1025px) {
              .${scopeClass} .theme-widget-title {
                color: var(--widget-title-color-desktop, var(--widget-title-color-tablet, var(--widget-title-color-mobile, var(--widget-title-color, var(--home-widget-title-color))))) !important;
                font-size: var(--widget-title-size-desktop, var(--widget-title-size-tablet, var(--widget-title-size-mobile, var(--widget-title-size, var(--home-widget-title-size))))) !important;
              }
              .${scopeClass} .widget-title-bar {
                background-color: var(--widget-title-border-color-desktop, var(--widget-title-border-color-tablet, var(--widget-title-border-color-mobile, var(--widget-title-border-color, var(--accent))))) !important;
              }
            }
            .${scopeClass} .theme-news-title {
              color: var(--home-news-title-color);
              font-size: var(--home-news-title-size);
              font-weight: var(--home-news-title-weight);
              font-family: var(--home-news-title-font), sans-serif;
            }
            .${scopeClass} .theme-news-title:hover { color: var(--home-hover-color); }
            .${scopeClass} .news-list-title,
            .${scopeClass} .news-grid-title,
            .${scopeClass} .hsl-title,
            .${scopeClass} .hs-hero-title-link,
            .${scopeClass} .hs-mini-title-link,
            .${scopeClass} .popular-title,
            .${scopeClass} .headline-big-title a,
            .${scopeClass} .bullet-list-link {
              color: var(--home-news-title-color);
              font-size: var(--home-news-title-size);
              font-weight: var(--home-news-title-weight);
              font-family: var(--home-news-title-font), sans-serif;
            }
            .${scopeClass} .news-list-title:hover,
            .${scopeClass} .news-grid-title:hover,
            .${scopeClass} .hsl-title:hover,
            .${scopeClass} .hs-hero-title-link:hover,
            .${scopeClass} .hs-mini-title-link:hover,
            .${scopeClass} .popular-title:hover,
            .${scopeClass} .headline-big-title a:hover,
            .${scopeClass} .bullet-list-link:hover {
              color: var(--home-hover-color);
            }
            .${scopeClass} .theme-excerpt,
            .${scopeClass} .news-list-excerpt,
            .${scopeClass} .news-grid-excerpt,
            .${scopeClass} .hsl-excerpt,
            .${scopeClass} .headline-big-excerpt,
            .${scopeClass} .hs-hero-excerpt,
            .${scopeClass} .hs-mini-excerpt {
              color: var(--home-excerpt-color);
              font-size: var(--home-excerpt-size);
              font-weight: var(--home-excerpt-weight);
              font-family: var(--home-excerpt-font), sans-serif;
            }
            .${scopeClass} .theme-meta,
            .${scopeClass} .news-list-meta-info,
            .${scopeClass} .news-grid-meta,
            .${scopeClass} .hsl-meta,
            .${scopeClass} .headline-big-meta,
            .${scopeClass} .hs-hero-meta,
            .${scopeClass} .hs-mini-meta,
            .${scopeClass} .popular-meta {
              color: var(--home-meta-color);
              font-size: var(--home-meta-size);
              font-weight: var(--home-meta-weight);
              font-family: var(--home-meta-font), sans-serif;
            }
            .${scopeClass} .theme-meta a,
            .${scopeClass} .news-list-meta-info a,
            .${scopeClass} .news-grid-meta a,
            .${scopeClass} .hsl-meta a,
            .${scopeClass} .headline-big-meta a,
            .${scopeClass} .hs-hero-meta a,
            .${scopeClass} .hs-mini-meta a,
            .${scopeClass} .popular-meta a {
              color: var(--home-meta-color);
            }
            .${scopeClass} .theme-meta a:hover,
            .${scopeClass} .news-list-meta-info a:hover,
            .${scopeClass} .news-grid-meta a:hover,
            .${scopeClass} .hsl-meta a:hover,
            .${scopeClass} .headline-big-meta a:hover,
            .${scopeClass} .hs-hero-meta a:hover,
            .${scopeClass} .hs-mini-meta a:hover,
            .${scopeClass} .popular-meta a:hover {
              color: var(--home-hover-color);
            }

            html.public-dark .${scopeClass} .theme-widget-title {
              color: var(--fg-primary) !important;
            }
            html.public-dark .${scopeClass} .theme-news-title,
            html.public-dark .${scopeClass} .news-list-title,
            html.public-dark .${scopeClass} .news-grid-title,
            html.public-dark .${scopeClass} .hsl-title,
            html.public-dark .${scopeClass} .hs-hero-title-link,
            html.public-dark .${scopeClass} .hs-mini-title-link,
            html.public-dark .${scopeClass} .popular-title,
            html.public-dark .${scopeClass} .headline-big-title a,
            html.public-dark .${scopeClass} .bullet-list-link {
              color: var(--fg-primary) !important;
            }
            html.public-dark .${scopeClass} .theme-news-title:hover,
            html.public-dark .${scopeClass} .news-list-title:hover,
            html.public-dark .${scopeClass} .news-grid-title:hover,
            html.public-dark .${scopeClass} .hsl-title:hover,
            html.public-dark .${scopeClass} .hs-hero-title-link:hover,
            html.public-dark .${scopeClass} .hs-mini-title-link:hover,
            html.public-dark .${scopeClass} .popular-title:hover,
            html.public-dark .${scopeClass} .headline-big-title a:hover,
            html.public-dark .${scopeClass} .bullet-list-link:hover {
              color: var(--accent) !important;
            }
          `,
        }}
      />
      <Component
        key={widget?.id}
        block={mergedWidget}
        posts={widgetData}
        categories={categories}
        customTitle={displayTitle}
        accentColor={accentColor}
        borderRadius={globalBorderRadius}
      />
    </div>
  );
}
