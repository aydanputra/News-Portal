"use client";

interface ThemeProviderProps {
  settings: {
    headingFont?: string;
    bodyFont?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    baseFontSize?: number;
    globalBorderRadius?: string;
    homeContainerWidth?: string;
    [key: string]: any;
  };
  children: React.ReactNode;
}

export default function ThemeProvider({ settings, children }: ThemeProviderProps) {
  
  // 1. Generate Google Fonts URL
  const headingFont = settings.headingFont || "Inter";
  const bodyFont = settings.bodyFont || "Inter";

  // Collect ALL font fields to load
  const fontsToLoad = new Set<string>();
  const addFont = (font?: string) => {
      if (font && font !== "Inter") fontsToLoad.add(font);
  };

  // Base Fonts
  addFont(headingFont);
  addFont(bodyFont);

  // Homepage Fonts
  addFont(settings.homeWidgetTitleFont);
  addFont(settings.homeNewsTitleFont);
  addFont(settings.homeExcerptFont);
  addFont(settings.homeMetaFont);

  // Single Post Fonts
  addFont(settings.postTitleFont);
  addFont(settings.postSubtitleFont);
  addFont(settings.postContentFont);
  addFont(settings.postWidgetTitleFont);

  // Archive & Global Fonts
  addFont(settings.archiveTitleFont);
  addFont(settings.archiveExcerptFont);
  addFont(settings.archiveMetaFont);
  addFont(settings.globalWidgetTitleFont);
  addFont(settings.globalNewsTitleFont);
  addFont(settings.globalMetaFont);
  addFont(settings.globalExcerptFont);
  addFont(settings.globalContentFont);

  const uniqueFonts = Array.from(fontsToLoad);
  // Load weights 300-900 to ensure all options work
  const fontQuery = uniqueFonts.map(font => `family=${font.replace(/ /g, "+")}:wght@300;400;500;600;700;800;900`).join("&");
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;

  // 2. CSS Variables Injection
  const cssVariables = `
    :root {
      /* Base Colors */
      --primary: ${settings.globalPrimaryColor || settings.primaryColor || '#2563eb'};
      --secondary: ${settings.globalSecondaryColor || settings.secondaryColor || '#64748b'};
      --accent: ${settings.globalAccentColor || settings.accentColor || '#f59e0b'};
      --background: ${settings.globalBackgroundColor || settings.backgroundColor || '#ffffff'};
      --foreground: ${settings.headingColor || '#1e293b'};
      
      /* Legacy Variables Mapping (for backward compatibility) */
      --primary-color: var(--primary);
      --secondary-color: var(--secondary);
      --accent-color: var(--accent);
      --bg-color: var(--background);
      --heading-color: var(--foreground);
      
      --bg-image: ${settings.globalBackgroundImage ? `url('${settings.globalBackgroundImage}')` : 'none'};
      --bg-repeat: ${settings.globalBackgroundRepeat || 'no-repeat'};
      --bg-size: ${settings.globalBackgroundSize || 'cover'};
      --bg-position: ${settings.globalBackgroundPosition || 'center'};
      --bg-attachment: ${settings.globalBackgroundAttachment || 'scroll'};
      
      --excerpt-color: ${settings.excerptColor || '#64748b'};
      --meta-color: ${settings.metaColor || '#94a3b8'};
      
      /* Global UI Elements */
      --border: #e2e8f0;
      --bg-surface: #ffffff;
      --bg-subtle: #f9fafb;
      --fg-primary: var(--heading-color);
      --fg-secondary: var(--secondary-color);
      --fg-muted: var(--meta-color);
      
      /* Widget Specific Defaults (inherited from global if not set) */
      --home-title-color: var(--heading-color);
      --home-hover-color: var(--accent-color); /* Widget hover usually uses accent */
      --home-meta-color: var(--meta-color);
      --home-excerpt-color: var(--excerpt-color);
      
      --font-heading: '${headingFont}', sans-serif;
      --font-body: '${bodyFont}', sans-serif;
      
      --radius-global: ${settings.globalBorderRadius || '0.5rem'};
      
      /* Container Widths */
      --container-global: ${settings.globalContainerWidth === 'custom' ? (settings.globalCustomContainerWidth + 'px') : (settings.globalContainerWidth === 'full' ? '100%' : '1250px')};
      --container-home: ${settings.homeContainerWidth === 'custom' ? (settings.homeCustomContainerWidth + 'px') : (settings.homeContainerWidth === 'full' ? '100%' : '1250px')};
      --container-post: ${settings.postContainerWidth === 'custom' ? (settings.postCustomContainerWidth + 'px') : (settings.postContainerWidth === 'full' ? '100%' : '1250px')};

      /* Inline Related Post Colors */
      --post-inline-related-bg: ${settings.postInlineRelatedBgColor || settings.backgroundColor || '#f9fafb'};
      --post-inline-related-header-bg: ${settings.postInlineRelatedHeaderBgColor || settings.backgroundColor || '#f9fafb'};
      --post-inline-related-title: ${settings.postInlineRelatedTitleColor || settings.headingColor || '#1e293b'};
      --post-inline-related-text: ${settings.postInlineRelatedTextColor || settings.headingColor || '#1f2937'};
      --post-inline-related-hover: ${settings.postInlineRelatedHoverColor || settings.primaryColor || '#2563eb'};
    }

    :root.public-dark {
      --background: #0b1220;
      --foreground: #f8fafc;

      --bg-color: var(--background);
      --heading-color: var(--foreground);

      --excerpt-color: #cbd5e1;
      --meta-color: #94a3b8;

      --bg-surface: #111827;
      --bg-subtle: #0f172a;
      --border: #1f2937;

      --fg-primary: var(--heading-color);
      --fg-secondary: #cbd5e1;
      --fg-muted: var(--meta-color);

      --post-inline-related-bg: #0f172a;
      --post-inline-related-header-bg: #111827;
      --post-inline-related-title: var(--heading-color);
      --post-inline-related-text: #cbd5e1;
      --post-inline-related-hover: var(--accent);
    }

    /* Use html body to increase specificity over Tailwind base */
     html body {
       font-family: var(--font-body);
       color: var(--heading-color);
       background-color: var(--bg-color);
       background-image: var(--bg-image);
       background-repeat: var(--bg-repeat);
       background-size: var(--bg-size);
       background-position: var(--bg-position);
       background-attachment: var(--bg-attachment);
     }

     html.public-dark body {
       background-color: var(--bg-color);
       background-image: none;
     }

     h1, h2, h3, h4, h5, h6 {
       font-family: var(--font-heading);
       color: var(--heading-color);
     }
   `;
  
  return (
    <>
      {/* Google Fonts Preconnect */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Load Fonts */}
      {fontQuery && (
          <link href={googleFontsUrl} rel="stylesheet" />
      )}
      
      {/* Inject CSS Variables */}
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />

      {children}
    </>
  );
}
