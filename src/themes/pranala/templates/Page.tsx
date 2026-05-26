import React from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { sanitizePageContent } from "@/lib/sanitizer";

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
}

export default function PranalaPage({ page, setting, categories, menusByLocation, headerConfig, footerConfig }: PranalaPageProps) {
  const siteName = setting?.siteName || "Portal Berita";
  const template = page.template || "default";
  const isLanding = template === "landing";
  const isFullWidth = template === "full-width" || isLanding;
  const safeContent = page.content ? sanitizePageContent(page.content) : "";

  const containerMode = setting?.globalContainerWidth || "boxed";
  const customWidth = setting?.globalCustomContainerWidth || "1250";
  const containerClass = containerMode === "full" ? "w-full px-4" : "container mx-auto px-4";
  const containerStyle = containerMode === "full" ? {} : { maxWidth: containerMode === "custom" ? `${customWidth}px` : "1250px" };

  const accent = setting?.globalAccentColor || setting?.accentColor || "#2563eb";
  const hoverColor = setting?.homeHoverColor || accent;

  return (
    <div
      className="public-theme min-h-screen flex flex-col font-sans text-gray-900"
      style={
        {
          "--accent": accent,
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

      <main className={`flex-grow ${isFullWidth ? "" : containerClass} py-12`} style={isFullWidth ? {} : containerStyle}>
        {page.featuredImage && (
          <div className={`relative w-full ${isFullWidth ? "h-[50vh] md:h-[60vh]" : "h-64 md:h-96 rounded-xl overflow-hidden mb-8"}`}>
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
                <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4 max-w-5xl drop-shadow-lg">{page.title}</h1>
              </div>
            )}
          </div>
        )}

        {(!page.featuredImage || !isFullWidth) && (
          <h1 className={`text-3xl md:text-5xl font-bold mb-8 ${isLanding ? "text-center mt-12" : "text-center"}`}>{page.title}</h1>
        )}

        {safeContent && (
          <div
            className={`prose prose-lg max-w-none text-gray-800 leading-relaxed ${isFullWidth ? "container mx-auto px-4 py-12" : ""}`}
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
        )}
      </main>

      {!isLanding && <Footer siteName={siteName} logoUrl={setting?.logoUrl} categories={categories} footerConfig={footerConfig} menusByLocation={menusByLocation} />}
    </div>
  );
}
