import React from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  resolveThemeFontFamily,
  resolveThemeFontSynthesis,
} from "@/lib/font-utils";
import { sanitizePageContent } from "@/lib/sanitizer";
import SidebarWidgetRenderer from "../components/SidebarWidgetRenderer";
import PranalaPostContent from "../components/PranalaPostContent";

interface PranalaPageProps {
  page: {
    title: string;
    content?: string | null;
    featuredImage?: string | null;
    template?: string;
  };
  setting?: any;
  categories: any[];
  menusByLocation?: any;
  headerConfig?: any;
  footerConfig?: any;
  sidebarWidgets?: any[];
  blockData?: Record<string, any[]>;
  preview?: boolean;
}

const resolvePublicFont = (font: unknown, fallback = "inherit") => {
  const value = typeof font === "string" ? font.trim() : "";
  if (!value) return fallback;
  return resolveThemeFontFamily(value, fallback);
};

export default function PranalaPage({
  page,
  setting,
  categories,
  menusByLocation,
  headerConfig,
  footerConfig,
  sidebarWidgets = [],
  blockData = {},
}: PranalaPageProps) {
  const siteName = setting?.siteName || "Portal Berita";
  const template = page.template || "default";
  const isLanding = template === "landing";
  const isFullWidth = template === "full-width" || isLanding;
  const safeContent = page.content ? sanitizePageContent(page.content) : "";
  const hasSidebar = !isFullWidth && Array.isArray(sidebarWidgets) && sidebarWidgets.length > 0;

  const containerMode = setting?.globalContainerWidth || "boxed";
  const customWidth = setting?.globalCustomContainerWidth || "1250";
  const containerClass = containerMode === "full" ? "w-full px-4" : "container mx-auto px-4";
  const containerStyle = containerMode === "full" ? {} : { maxWidth: containerMode === "custom" ? `${customWidth}px` : "1250px" };

  const accent = setting?.globalAccentColor || setting?.accentColor || "#2563eb";
  const hoverColor = setting?.homeHoverColor || accent;
  const borderColor = setting?.globalBorderColor || "#e5e7eb";
  const surfaceColor = setting?.globalSurfaceColor || "#f9fafb";
  const elevatedColor = setting?.globalElevatedColor || "#ffffff";
  const mutedTextColor = setting?.globalMutedTextColor || setting?.metaColor || "#9ca3af";
  const headingColor = setting?.postHeadingColor || setting?.homeTitleColor || setting?.headingColor || "#111827";
  const contentColor = setting?.postContentColor || setting?.homeExcerptColor || setting?.globalExcerptColor || "#374151";
  const titleFontValue = setting?.postTitleFont || setting?.headingFont || "inherit";
  const titleFontFamily = resolvePublicFont(titleFontValue, "inherit");
  const titleFontSynthesis = resolveThemeFontSynthesis(titleFontValue);
  const titleFontWeight = setting?.postTitleFontWeight || "700";
  const titleFontSize = Number.parseInt(String(setting?.postTitleFontSize || "48"), 10) || 48;
  const titleLineHeight = String(setting?.postTitleLineHeight || "1.15");
  const compactTitleFontSize = Math.max(32, titleFontSize - 8);
  const heroTitleFontSize = Math.max(40, titleFontSize + 8);
  const contentFontValue = setting?.postContentFont || setting?.globalContentFont || setting?.bodyFont || "inherit";
  const contentFontFamily = resolvePublicFont(contentFontValue, "inherit");
  const contentFontSynthesis = resolveThemeFontSynthesis(contentFontValue);
  const contentFontWeight = setting?.postContentFontWeight || setting?.globalContentFontWeight || "400";
  const contentFontSize = Number.parseInt(String(setting?.postContentFontSize || setting?.globalContentFontSize || "18"), 10) || 18;
  const contentLineHeight = String(setting?.postContentLineHeight || setting?.globalContentLineHeight || "1.8");

  const renderContentCard = (compact = false) => (
    <article
      className={`rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] shadow-sm ${
        compact ? "p-5 md:p-6" : "p-6 md:p-8 lg:p-10"
      }`}
    >
      <header className="mb-8 border-b border-[color:var(--border)] pb-5 md:pb-6">
        <div className="mb-3 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--bg-surface)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--muted-text)]">
          Halaman
        </div>
        <h1
          className={`font-bold leading-tight tracking-tight ${
            compact ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"
          }`}
          style={{
            color: headingColor,
            fontFamily: titleFontFamily,
            fontWeight: titleFontWeight,
            fontSynthesis: titleFontSynthesis,
            fontSize: `${compact ? compactTitleFontSize : titleFontSize}px`,
            lineHeight: titleLineHeight,
          }}
        >
          {page.title}
        </h1>
      </header>

      {safeContent ? (
        <PranalaPostContent
          content={safeContent}
          className="[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-bold [&_p]:my-5 [&_p]:leading-8 [&_blockquote]:border-l-4 [&_blockquote]:border-[color:var(--accent)] [&_blockquote]:bg-[color:var(--bg-surface)] [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:italic [&_img]:rounded-[var(--global-image-radius)] [&_ul]:my-5 [&_ol]:my-5"
          style={{
            color: contentColor,
            fontFamily: contentFontFamily,
            fontWeight: contentFontWeight,
            fontSynthesis: contentFontSynthesis,
            fontSize: `${contentFontSize}px`,
            lineHeight: contentLineHeight,
          }}
        />
      ) : (
        <div className="text-base text-[color:var(--muted-text)]">Konten halaman belum tersedia.</div>
      )}
    </article>
  );

  return (
    <div
      className="public-theme min-h-screen flex flex-col font-sans text-gray-900"
      style={
        {
          "--accent": accent,
          "--border": borderColor,
          "--bg-surface": surfaceColor,
          "--bg-elevated": elevatedColor,
          "--muted-text": mutedTextColor,
          "--home-hover-color": hoverColor,
        } as React.CSSProperties
      }
    >
      {!isLanding && (
        <Header
          siteName={siteName}
          logoUrl={setting?.logoUrl}
          categories={categories}
          primaryMenu={menusByLocation?.PRIMARY}
          secondaryMenu={menusByLocation?.SECONDARY}
          mobileMenu={menusByLocation?.MOBILE}
          headerConfig={headerConfig}
        />
      )}

      <main className={`flex-grow ${isFullWidth ? "" : containerClass} py-10 md:py-12`} style={isFullWidth ? {} : containerStyle}>
        {page.featuredImage && (
          <div className={`relative w-full ${isFullWidth ? "h-[50vh] md:h-[60vh]" : "h-64 md:h-96 overflow-hidden mb-8"}`} style={!isFullWidth ? { borderRadius: "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))" } : undefined}>
            <Image
              src={page.featuredImage}
              alt={page.title}
              fill
              quality={90}
              className="object-cover"
              priority
              sizes={isFullWidth ? "100vw" : "(max-width: 768px) 100vw, 1250px"}
            />
            {isFullWidth && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div
                  aria-hidden="true"
                  className="text-4xl md:text-6xl font-bold text-white text-center px-4 max-w-5xl drop-shadow-lg"
                  style={{
                    fontFamily: titleFontFamily,
                    fontWeight: titleFontWeight,
                    fontSynthesis: titleFontSynthesis,
                    fontSize: `${heroTitleFontSize}px`,
                    lineHeight: titleLineHeight,
                  }}
                >
                  {page.title}
                </div>
              </div>
            )}
          </div>
        )}

        {hasSidebar ? (
          <div className="grid gap-8 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-8">
              {renderContentCard(true)}
            </div>
            <aside className="space-y-6 md:col-span-4 md:sticky md:top-24 md:self-start">
              {sidebarWidgets.map((widget) => (
                <SidebarWidgetRenderer
                  key={widget.id}
                  widget={widget}
                  widgetData={blockData[widget.id] || (widget?.sourceWidgetId ? blockData[widget.sourceWidgetId] : undefined) || []}
                  categories={categories}
                  setting={setting}
                  renderContext="single-post"
                />
              ))}
            </aside>
          </div>
        ) : (
          <div className={isFullWidth ? "container mx-auto px-4 py-12" : "mx-auto max-w-4xl"}>
            {renderContentCard(false)}
          </div>
        )}
      </main>

      {!isLanding && <Footer siteName={siteName} logoUrl={setting?.logoUrl} categories={categories} footerConfig={footerConfig} menusByLocation={menusByLocation} setting={setting} />}
    </div>
  );
}
