import type { Metadata } from "next";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { getSettings } from "@/lib/settings";
import { inter, sora } from "@/lib/fonts";

function renderInsertCodeHead(snippet: unknown) {
  if (typeof snippet !== "string") return null;
  const raw = snippet.trim();
  if (!raw) return null;

  const scripts: Array<{
    attrs: string;
    content: string;
  }> = [];

  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    scripts.push({ attrs: match[1] || "", content: match[2] || "" });
  }

  if (scripts.length === 0) {
    return <script dangerouslySetInnerHTML={{ __html: raw }} />;
  }

  return scripts.map((item, idx) => {
    const attrs = item.attrs || "";
    const srcMatch = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    const typeMatch = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
    const idMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
    const asyncAttr = /\basync\b/i.test(attrs);
    const deferAttr = /\bdefer\b/i.test(attrs);
    const crossOriginMatch = attrs.match(/\bcrossorigin\s*=\s*["']([^"']+)["']/i);
    const referrerPolicyMatch = attrs.match(/\breferrerpolicy\s*=\s*["']([^"']+)["']/i);

    const src = srcMatch?.[1];
    const type = typeMatch?.[1];
    const id = idMatch?.[1];
    const crossOrigin = crossOriginMatch?.[1];
    const referrerPolicy = referrerPolicyMatch?.[1];

    if (src) {
      return (
        <script
          key={`insert-head-${idx}`}
          src={src}
          async={asyncAttr}
          defer={deferAttr}
          type={type}
          id={id}
          crossOrigin={crossOrigin as any}
          referrerPolicy={referrerPolicy as any}
        />
      );
    }

    return (
      <script
        key={`insert-head-${idx}`}
        async={asyncAttr}
        defer={deferAttr}
        type={type}
        id={id}
        dangerouslySetInnerHTML={{ __html: item.content || "" }}
      />
    );
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  
  return {
    title: settings.siteName || "CMS Portal Berita",
    description: settings.siteDescription || "Portal berita modern",
    icons: settings.faviconUrl ? {
      icon: settings.faviconUrl,
      shortcut: settings.faviconUrl,
      apple: settings.faviconUrl,
    } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const insertCodeBody = typeof (settings as any)?.insertCodeBody === "string" ? (settings as any).insertCodeBody.trim() : "";
  const insertCodeFooter = typeof (settings as any)?.insertCodeFooter === "string" ? (settings as any).insertCodeFooter.trim() : "";

  return (
    <html lang="id" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var cookieTheme = null;
                    try {
                      var parts = document.cookie ? document.cookie.split(';') : [];
                      for (var i = 0; i < parts.length; i++) {
                        var p = parts[i].trim();
                        if (p.indexOf('public-theme=') === 0) {
                          cookieTheme = decodeURIComponent(p.substring('public-theme='.length));
                          break;
                        }
                      }
                    } catch (e) {}
                    var storedTheme = cookieTheme || localStorage.getItem('public-theme');
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
                      document.documentElement.classList.add('public-dark');
                    } else {
                      document.documentElement.classList.remove('public-dark');
                    }
                  } catch (e) {}
                })();
              `,
            }}
          />
          {renderInsertCodeHead((settings as any)?.insertCodeHead)}
      </head>
      <body className={`antialiased ${inter.className}`}>
        {insertCodeBody ? <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: insertCodeBody }} /> : null}
        <NextTopLoader color={settings.primaryColor || "#f59e0b"} showSpinner={false} />
        <ThemeProvider settings={settings}>
            {children}
        </ThemeProvider>
        {insertCodeFooter ? <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: insertCodeFooter }} /> : null}
      </body>
    </html>
  );
}
