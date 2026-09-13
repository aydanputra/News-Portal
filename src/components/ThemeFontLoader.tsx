import {
  getThemeFontLoadFamilies,
  resolveThemeFontSynthesis,
  resolveThemeFontFamily,
} from "@/lib/font-utils";
import { safeStyleTagCss } from "@/lib/url-safety";

interface ThemeFontLoaderProps {
  headingFont: string;
  bodyFont: string;
}

// Font yang benar-benar tersedia sebagai file lokal di /public/fonts/<slug>/style.css.
// Font self-hosted lain (inter, sora, merriweather) sudah dimuat lewat next/font
// di app/layout.tsx sehingga tidak perlu link tambahan di sini.
const AVAILABLE_LOCAL_FONTS = ["lato", "poppins"];

export default function ThemeFontLoader({ headingFont, bodyFont }: ThemeFontLoaderProps) {
  // Generate list font yang unik
  const fonts = [headingFont, bodyFont].flatMap((font) => getThemeFontLoadFamilies(font));
  const uniqueFonts = [...new Set(fonts)];
  const resolvedHeadingFont = resolveThemeFontFamily(headingFont);
  const resolvedBodyFont = resolveThemeFontFamily(bodyFont);
  const headingSizeAdjust = "none";
  const bodySizeAdjust = "none";
  const headingFontSynthesis = resolveThemeFontSynthesis(headingFont);
  const bodyFontSynthesis = resolveThemeFontSynthesis(bodyFont);

  if (uniqueFonts.length === 0) return null;

  const localFontSlugs = uniqueFonts
    .map((font) => font.toLowerCase().replace(/ /g, "-"))
    .filter((slug) => AVAILABLE_LOCAL_FONTS.includes(slug));

  // Font yang belum tersedia lokal dimuat dari Google Fonts sebagai fallback.
  const remoteFonts = uniqueFonts.filter(
    (font) => !AVAILABLE_LOCAL_FONTS.includes(font.toLowerCase().replace(/ /g, "-")),
  );
  const fontQuery = remoteFonts
    .map((font) => `family=${font.replace(/ /g, "+")}:wght@300;400;500;600;700`)
    .join("&");
  const googleFontsUrl = fontQuery
    ? `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`
    : "";

  return (
    <>
      {googleFontsUrl ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </>
      ) : null}

      {/* Font lokal (same-origin, file sudah diself-host) */}
      {localFontSlugs.map((slug) => (
        <link key={`local-${slug}`} href={`/fonts/${slug}/style.css`} rel="stylesheet" />
      ))}

      {/* Google Fonts dimuat non-blocking: media="print" lalu diganti ke "all"
          setelah stylesheet selesai dimuat. */}
      {googleFontsUrl ? (
        <>
          <link
            id="theme-remote-fonts"
            href={googleFontsUrl}
            rel="stylesheet"
            media="print"
          />
          <script
            dangerouslySetInnerHTML={{
              __html:
                "(function(){var l=document.getElementById('theme-remote-fonts');" +
                "if(!l)return;var a=function(){l.media='all';};" +
                "if(l.sheet){a();}else{l.addEventListener('load',a,{once:true});setTimeout(a,3000);}})();",
            }}
          />
        </>
      ) : null}

      {/* Fallback font-family bila CSS variable belum tersedia */}
      <style
        dangerouslySetInnerHTML={{
          __html: safeStyleTagCss(`
        body {
          font-family: ${resolvedBodyFont};
          font-synthesis: ${bodyFontSynthesis};
          font-size-adjust: ${bodySizeAdjust};
        }
        h1, h2, h3, h4, h5, h6 {
          font-family: ${resolvedHeadingFont};
          font-synthesis: ${headingFontSynthesis};
          font-size-adjust: ${headingSizeAdjust};
        }
      `),
        }}
      />
    </>
  );
}
