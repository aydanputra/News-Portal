import type { Metadata } from "next";
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { getSettings, FONT_SETTING_KEYS } from "@/lib/settings";
import { getThemeFontLoadFamilies } from "@/lib/font-utils";
import { inter, poppins, sora } from "@/lib/fonts";
import { sanitizeInsertCode, safeStyleTagCss } from "@/lib/sanitizer";

function renderInsertCodeHead(snippet: unknown) {
  const raw = sanitizeInsertCode(snippet, "head");
  if (!raw) return null;

  const sanitizeHeadUrl = (value: string | undefined) => {
    const v = typeof value === "string" ? value.trim() : "";
    if (!v) return "";
    if (v.startsWith("/")) return v;
    if (v.startsWith("http://") || v.startsWith("https://")) return v;
    return "";
  };

  const scripts: Array<{
    attrs: string;
    content: string;
  }> = [];

  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(raw)) !== null) {
    scripts.push({ attrs: match[1] || "", content: match[2] || "" });
  }

  const metas: Array<{ attrs: string }> = [];
  const metaRe = /<meta\b([^>]*)\/?>/gi;
  while ((match = metaRe.exec(raw)) !== null) {
    metas.push({ attrs: match[1] || "" });
  }

  const links: Array<{ attrs: string }> = [];
  const linkRe = /<link\b([^>]*)\/?>/gi;
  while ((match = linkRe.exec(raw)) !== null) {
    links.push({ attrs: match[1] || "" });
  }

  const scriptEls = scripts.map((item, idx) => {
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
      const safeSrc = sanitizeHeadUrl(src);
      if (!safeSrc) return null;

      // Defer GA4/analytics downloads so they don't compete with the LCP
      // image on mobile. The inline gtag() config script queues events, so
      // loading the SDK later still records every hit.
      const isAnalytics = /googletagmanager\.com\/gtag|google-analytics\.com|gtag\/js/i.test(safeSrc);
      if (isAnalytics) {
        const lazyLoader = `
          (function () {
            var src = ${JSON.stringify(safeSrc)};
            function load() {
              var s = document.createElement("script");
              s.async = true;
              s.src = src;
              document.head.appendChild(s);
            }
            if ("requestIdleCallback" in window) {
              window.requestIdleCallback(load, { timeout: 2000 });
            } else {
              setTimeout(load, 2500);
            }
          })();
        `;
        return (
          <script
            key={`insert-head-${idx}`}
            dangerouslySetInnerHTML={{ __html: safeStyleTagCss(lazyLoader) }}
          />
        );
      }

      return (
        <script
          key={`insert-head-${idx}`}
          src={safeSrc}
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
        dangerouslySetInnerHTML={{ __html: safeStyleTagCss(item.content || "") }}
      />
    );
  }).filter(Boolean);

  const metaEls = metas.map((item, idx) => {
    const attrs = item.attrs || "";
    const charsetMatch = attrs.match(/\bcharset\s*=\s*["']([^"']+)["']/i);
    const nameMatch = attrs.match(/\bname\s*=\s*["']([^"']+)["']/i);
    const contentMatch = attrs.match(/\bcontent\s*=\s*["']([^"']+)["']/i);
    const httpEquivMatch = attrs.match(/\bhttp-equiv\s*=\s*["']([^"']+)["']/i);
    const propertyMatch = attrs.match(/\bproperty\s*=\s*["']([^"']+)["']/i);

    const charset = charsetMatch?.[1];
    const name = nameMatch?.[1];
    const content = contentMatch?.[1];
    const httpEquiv = httpEquivMatch?.[1];
    const property = propertyMatch?.[1];

    if (!charset && !name && !httpEquiv && !property) return null;
    if ((name || httpEquiv || property) && !content) return null;

    return (
      <meta
        key={`insert-meta-${idx}`}
        charSet={charset}
        name={name}
        content={content}
        httpEquiv={httpEquiv as any}
        property={property as any}
      />
    );
  }).filter(Boolean);

  const linkEls = links.map((item, idx) => {
    const attrs = item.attrs || "";
    const relMatch = attrs.match(/\brel\s*=\s*["']([^"']+)["']/i);
    const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i);
    const asMatch = attrs.match(/\bas\s*=\s*["']([^"']+)["']/i);
    const typeMatch = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
    const sizesMatch = attrs.match(/\bsizes\s*=\s*["']([^"']+)["']/i);
    const mediaMatch = attrs.match(/\bmedia\s*=\s*["']([^"']+)["']/i);
    const crossOriginMatch = attrs.match(/\bcrossorigin\s*=\s*["']([^"']+)["']/i);
    const referrerPolicyMatch = attrs.match(/\breferrerpolicy\s*=\s*["']([^"']+)["']/i);

    const rel = relMatch?.[1];
    const href = sanitizeHeadUrl(hrefMatch?.[1]);
    if (!rel || !href) return null;

    return (
      <link
        key={`insert-link-${idx}`}
        rel={rel}
        href={href}
        as={asMatch?.[1]}
        type={typeMatch?.[1]}
        sizes={sizesMatch?.[1]}
        media={mediaMatch?.[1]}
        crossOrigin={crossOriginMatch?.[1] as any}
        referrerPolicy={referrerPolicyMatch?.[1] as any}
      />
    );
  }).filter(Boolean);

  return [...scriptEls, ...metaEls, ...linkEls];
}

const SELF_HOSTED_FONTS = new Set(["inter", "poppins", "sora"]);

// Bobot (weight) yang tersedia untuk setiap font Google. Font dengan rentang
// bobot terbatas tidak bisa meminta 300/500/600; kalau dipaksa, seluruh
// request css2 akan gagal (HTTP 400). Default dipakai untuk font dengan
// dukungan bobot penuh.
const REMOTE_FONT_WEIGHTS: Record<string, string> = {
  merriweather: "300;400;700;900",
  "playfair display": "400;500;600;700",
  "pt serif": "400;700",
  "pt sans": "400;700",
  "crimson text": "400;600;700",
  "libre baskerville": "400;700",
  ubuntu: "300;400;500;700",
};

function buildRemoteFontLinks(settings: Record<string, unknown>) {
  const families: string[] = [];
  for (const key of FONT_SETTING_KEYS) {
    const value = settings[key];
    if (typeof value !== "string") continue;
    families.push(...getThemeFontLoadFamilies(value));
  }

  const unique = [...new Set(families)].filter(
    (name) => !SELF_HOSTED_FONTS.has(name.toLowerCase()),
  );
  if (unique.length === 0) return null;

  const query = unique
    .map((name) => {
      const key = name.toLowerCase();
      const weights = REMOTE_FONT_WEIGHTS[key] ?? "300;400;500;600;700";
      return `family=${name.replace(/ /g, "+")}:wght@${weights}`;
    })
    .join("&");

  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl =
    typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL.trim() !== ""
      ? process.env.NEXT_PUBLIC_SITE_URL.trim()
      : "http://localhost:3000";
  const siteName = settings.siteName || "CMS Portal Berita";
  const siteDescription = settings.siteDescription || "Portal berita modern";
  const homeTitle = siteDescription.trim() !== "" ? `${siteName} | ${siteDescription}` : siteName;
  
  return {
    metadataBase: new URL(siteUrl),
    alternates: { canonical: "/" },
    title: {
      default: homeTitle,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
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
  const insertCodeBody = sanitizeInsertCode((settings as any)?.insertCodeBody, "body");
  const insertCodeFooter = sanitizeInsertCode((settings as any)?.insertCodeFooter, "footer");

  return (
    <html
      lang="id"
      className={`${poppins.variable} ${inter.variable} ${sora.variable}`}
      suppressHydrationWarning
    >
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
          {(() => {
            const href = buildRemoteFontLinks(settings as Record<string, unknown>);
            if (!href) return null;
            return (
              <>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href={href} rel="stylesheet" />
              </>
            );
          })()}
      </head>
      <body className="antialiased">
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
