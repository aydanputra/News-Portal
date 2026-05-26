"use client";

import React from "react";

interface ThemeFontLoaderProps {
  headingFont: string;
  bodyFont: string;
}

// Daftar font yang tersedia secara lokal
const AVAILABLE_LOCAL_FONTS = ['lato', 'poppins', 'inter', 'roboto'];

export default function ThemeFontLoader({ headingFont, bodyFont }: ThemeFontLoaderProps) {
  // Generate list font yang unik
  const fonts = [headingFont, bodyFont].filter(Boolean);
  const uniqueFonts = [...new Set(fonts)];
  
  if (uniqueFonts.length === 0) return null;

  // Generate Google Fonts URL
  const fontQuery = uniqueFonts.map(font => `family=${font.replace(/ /g, "+")}:wght@300;400;500;600;700`).join("&");
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Load font lokal jika tersedia */}
      {uniqueFonts.map(font => {
        const slug = font.toLowerCase().replace(/ /g, '-');
        
        // Skip jika font tidak tersedia secara lokal
        if (!AVAILABLE_LOCAL_FONTS.includes(slug)) return null;

        return (
          <link 
            key={`local-${font}`}
            href={`/fonts/${slug}/style.css`} 
            rel="stylesheet" 
          />
        );
      })}

      {/* Selalu load Google Fonts sebagai fallback */}
      <link href={googleFontsUrl} rel="stylesheet" />
      
      {/* Inline style untuk fallback font */}
      <style jsx global>{`
        body {
          font-family: '${bodyFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: '${headingFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </>
  );
}