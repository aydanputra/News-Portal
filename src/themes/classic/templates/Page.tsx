import React from "react";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface PageProps {
  page: {
    title: string;
    content?: string | null;
    featuredImage?: string | null;
    template?: string; // default, full-width, landing
  };
  setting?: any;
  categories: any[];
  footerConfig?: any;
  menusByLocation?: any;
}

export default function ClassicPage({ page, setting, categories, footerConfig, menusByLocation }: PageProps) {
  const siteName = setting?.siteName || "Portal Berita";
  const template = page.template || "default";

  // Template: Landing (Minimal Header/Footer or No Header/Footer if desired)
  // For now, let's keep Header/Footer but remove constraints
  const isLanding = template === "landing";
  const isFullWidth = template === "full-width" || isLanding;

  // Global Container Logic
  const containerMode = setting?.globalContainerWidth || 'boxed';
  const customWidth = setting?.globalCustomContainerWidth || '1250';
  const containerClass = containerMode === 'full' ? 'w-full px-4' : 'container mx-auto px-4';
  const containerStyle = containerMode === 'full' ? {} : { maxWidth: containerMode === 'custom' ? `${customWidth}px` : '1250px' };

  // const backgroundColor = setting?.globalBackgroundColor || setting?.backgroundColor || "#ffffff"; // Handled by ThemeProvider

  return (
    <div className="public-theme min-h-screen flex flex-col font-sans text-gray-900">
      {!isLanding && <Header siteName={siteName} logoUrl={setting?.logoUrl} categories={categories} />}
      
      <main className={`flex-grow ${isFullWidth ? '' : containerClass} py-12`} style={isFullWidth ? {} : containerStyle}>
         {/* Featured Image (Hero) */}
         {page.featuredImage && (
             <div className={`relative w-full ${isFullWidth ? 'h-[50vh] md:h-[60vh]' : 'h-64 md:h-96 rounded-xl overflow-hidden mb-8'}`}>
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
                         <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4 max-w-5xl drop-shadow-lg">
                             {page.title}
                         </h1>
                     </div>
                 )}
             </div>
         )}

         {/* Title (If not Full Width with Image) */}
         {(!page.featuredImage || !isFullWidth) && (
             <h1 className={`text-3xl md:text-5xl font-bold mb-8 ${isLanding ? 'text-center mt-12' : 'text-center'}`}>
                 {page.title}
             </h1>
         )}
         
         {/* Content */}
         {page.content && (
             <div 
                className={`prose prose-lg prose-blue max-w-none text-gray-800 leading-relaxed ${isFullWidth ? 'container mx-auto px-4 py-12' : ''}`}
                dangerouslySetInnerHTML={{ __html: page.content }}
             />
         )}
      </main>

      {!isLanding && <Footer siteName={siteName} logoUrl={setting?.logoUrl} categories={categories} footerConfig={footerConfig} menusByLocation={menusByLocation} />}
    </div>
  );
}
