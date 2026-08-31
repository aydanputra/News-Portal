import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from "lucide-react";
import { sanitizeContent, sanitizeCssUrl, sanitizeExternalUrl } from "@/lib/sanitizer";
import ImageUrlWidget from "@/components/shared/ImageUrlWidget";

interface FooterProps {
  siteName: string;
  logoUrl?: string;
  footerConfig?: any[] | null;
  menusByLocation?: any;
  categories?: any[] | null;
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M16.75 2c.18 1.55 1.05 2.96 2.34 3.87.9.63 1.96 1 3.06 1.1V10.1c-1.67.02-3.3-.48-4.68-1.45v7.02c0 3.7-3 6.7-6.7 6.7-3.7 0-6.7-3-6.7-6.7 0-3.7 3-6.7 6.7-6.7.35 0 .7.03 1.03.08v3.44c-.34-.11-.68-.17-1.03-.17-1.8 0-3.26 1.46-3.26 3.26 0 1.8 1.46 3.26 3.26 3.26 1.84 0 3.34-1.49 3.34-3.33V2h2.64z" />
  </svg>
);

const getGridColsClass = (count: number) => {
  switch (count) {
    case 1:
      return "md:grid-cols-1";
    case 2:
      return "md:grid-cols-2";
    case 3:
      return "md:grid-cols-3";
    case 4:
      return "md:grid-cols-4";
    default:
      return "md:grid-cols-1";
  }
};

const getGapClass = (gap: unknown) => {
  const value = typeof gap === "number" ? gap : Number(gap || 8);
  switch (value) {
    case 0:
      return "gap-0";
    case 2:
      return "gap-2";
    case 4:
      return "gap-4";
    case 6:
      return "gap-6";
    case 8:
      return "gap-8";
    case 10:
      return "gap-10";
    case 12:
      return "gap-12";
    default:
      return "gap-8";
  }
};

const getColumnCount = (layout: unknown) => {
  if (typeof layout !== "string" || layout.trim() === "") return 1;
  return Math.max(1, layout.split("-").length);
};

export default function Footer({ siteName, logoUrl, footerConfig, menusByLocation, categories }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const hasBuilderFooter = Array.isArray(footerConfig) && footerConfig.length > 0;

  if (!hasBuilderFooter) {
    return (
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">{siteName}</h3>
              <p className="text-gray-400 max-w-sm mb-6">
                Portal berita terpercaya dengan menyajikan informasi aktual dan faktual.
                Kami berkomitmen untuk memberikan pengalaman membaca terbaik.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors"><Youtube size={20} /></a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-200">Navigasi</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/" className="hover:text-white">Beranda</Link></li>
                <li><Link href="/tentang-kami" className="hover:text-white">Tentang Kami</Link></li>
                <li><Link href="/kontak" className="hover:text-white">Hubungi Kami</Link></li>
                <li><Link href="/karir" className="hover:text-white">Karir</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-200">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/kebijakan-privasi" className="hover:text-white">Kebijakan Privasi</Link></li>
                <li><Link href="/syarat-ketentuan" className="hover:text-white">Syarat & Ketentuan</Link></li>
                <li><Link href="/pedoman-siber" className="hover:text-white">Pedoman Media Siber</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            &copy; {currentYear} {siteName}. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }

  const sections = (footerConfig as any[])
    .filter((b) => b && b.type === "section" && (b.isActive ?? b.isVisible ?? true))
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  const footerMenu = menusByLocation?.FOOTER || [];

  const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);
  const getResponsive = (cfg: any, key: string, device: "desktop" | "tablet" | "mobile") => {
    if (device === "desktop") return cfg?.[key];
    const prefixed = `${device}${cap(key)}`;
    return cfg?.[prefixed] ?? cfg?.[key];
  };
  const resolveOptionalPx = (raw: unknown) => {
    if (typeof raw === "number" && Number.isFinite(raw)) return `${raw}px`;
    if (typeof raw === "string" && raw.trim() !== "") {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) return `${parsed}px`;
    }
    return undefined;
  };
  const getObjectFitClass = (raw: unknown) => {
    if (raw === "cover") return "object-cover";
    if (raw === "fill") return "object-fill";
    return "object-contain";
  };
  const getTextAlign = (cfg: any) => {
    const raw = cfg?.textAlign ?? cfg?.align;
    return raw === "center" || raw === "right" || raw === "left" ? raw : "left";
  };
  const getTextAlignClass = (align: string) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };
  const getJustifyClass = (align: string) => {
    if (align === "center") return "justify-center";
    if (align === "right") return "justify-end";
    return "justify-start";
  };
  const resolveOptionalColor = (raw: unknown) => (typeof raw === "string" && raw.trim() !== "" ? raw : undefined);
  const resolveOptionalUrl = (raw: unknown) => (typeof raw === "string" && raw.trim() !== "" ? raw : undefined);
  const isTruthy = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";
  const normalizeColor = (value: unknown, fallback: string) => {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    return trimmed;
  };
  const formatSize = (val: string | number | undefined, fallback: string) => {
    if (val === undefined || val === null) return fallback;
    const str = String(val).trim();
    if (!str) return fallback;
    if (/^\d+(\.\d+)?$/.test(str)) return `${str}px`;
    const compact = str.replace(/\s+/g, "");
    if (/^\d+(\.\d+)?(px|%|rem|em|vw|vh|vmin|vmax)$/.test(compact)) return compact;
    return str;
  };
  const formatSpacing = (value: unknown) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
      return trimmed;
    }
    return undefined;
  };
  const getRadius = (r: string) => {
    switch (r) {
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
      case "full":
        return "9999px";
      default:
        return "0";
    }
  };
  const getShadow = (s: string) => {
    switch (s) {
      case "sm":
        return "0 1px 2px 0 rgb(0 0 0 / 0.05)";
      case "md":
        return "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
      case "lg":
        return "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)";
      case "xl":
        return "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)";
      case "2xl":
        return "0 25px 50px -12px rgb(0 0 0 / 0.25)";
      case "inner":
        return "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
      default:
        return "none";
    }
  };
  const getItemsAlignClass = (align: string) => {
    if (align === "center") return "items-center";
    if (align === "right") return "items-end";
    return "items-start";
  };

  const renderWidgetWithSpacing = (child: any, opts?: { growClass?: string }) => {
    if (!child || (child.isActive ?? child.isVisible) === false) return null;
    const growClass = typeof opts?.growClass === "string" ? opts.growClass : "";
    const normalizeAlign = (val: any) => (val === "center" || val === "right" || val === "left" ? val : "left");
    const normalizeVAlign = (val: any) => (val === "bottom" ? "bottom" : val === "center" || val === "middle" ? "center" : "top");
    const toSelf = (val: string, prefix = "") => (val === "center" ? `${prefix}self-center` : val === "bottom" ? `${prefix}self-end` : `${prefix}self-start`);

    const vAlignDesktopRaw = getResponsive(child?.config, "verticalAlign", "desktop") ?? child?.config?.verticalAlign;
    const vAlignTabletRaw = getResponsive(child?.config, "verticalAlign", "tablet") ?? vAlignDesktopRaw;
    const vAlignMobileRaw = getResponsive(child?.config, "verticalAlign", "mobile") ?? vAlignTabletRaw;
    const selfAlignClass = `${toSelf(normalizeVAlign(vAlignMobileRaw))} ${toSelf(normalizeVAlign(vAlignTabletRaw), "md:")} ${toSelf(normalizeVAlign(vAlignDesktopRaw), "lg:")}`.trim();

    const alignD = normalizeAlign(getResponsive(child?.config, "textAlign", "desktop") ?? child?.config?.textAlign);
    const alignT = normalizeAlign(getResponsive(child?.config, "textAlign", "tablet") ?? alignD);
    const alignM = normalizeAlign(getResponsive(child?.config, "textAlign", "mobile") ?? alignT);

    const verticalAlignD = normalizeVAlign(vAlignDesktopRaw);
    const verticalAlignT = normalizeVAlign(vAlignTabletRaw);
    const verticalAlignM = normalizeVAlign(vAlignMobileRaw);

    const mtD = formatSpacing(getResponsive(child?.config, "marginTop", "desktop")) ?? "0px";
    const mrD = formatSpacing(getResponsive(child?.config, "marginRight", "desktop")) ?? "0px";
    const mbD = formatSpacing(getResponsive(child?.config, "marginBottom", "desktop")) ?? "0px";
    const mlD = formatSpacing(getResponsive(child?.config, "marginLeft", "desktop")) ?? "0px";
    const ptD = formatSpacing(getResponsive(child?.config, "paddingTop", "desktop")) ?? "0px";
    const prD = formatSpacing(getResponsive(child?.config, "paddingRight", "desktop")) ?? "0px";
    const pbD = formatSpacing(getResponsive(child?.config, "paddingBottom", "desktop")) ?? "0px";
    const plD = formatSpacing(getResponsive(child?.config, "paddingLeft", "desktop")) ?? "0px";

    const mtT = formatSpacing(getResponsive(child?.config, "marginTop", "tablet")) ?? mtD;
    const mrT = formatSpacing(getResponsive(child?.config, "marginRight", "tablet")) ?? mrD;
    const mbT = formatSpacing(getResponsive(child?.config, "marginBottom", "tablet")) ?? mbD;
    const mlT = formatSpacing(getResponsive(child?.config, "marginLeft", "tablet")) ?? mlD;
    const ptT = formatSpacing(getResponsive(child?.config, "paddingTop", "tablet")) ?? ptD;
    const prT = formatSpacing(getResponsive(child?.config, "paddingRight", "tablet")) ?? prD;
    const pbT = formatSpacing(getResponsive(child?.config, "paddingBottom", "tablet")) ?? pbD;
    const plT = formatSpacing(getResponsive(child?.config, "paddingLeft", "tablet")) ?? plD;

    const mtM = formatSpacing(getResponsive(child?.config, "marginTop", "mobile")) ?? mtT;
    const mrM = formatSpacing(getResponsive(child?.config, "marginRight", "mobile")) ?? mrT;
    const mbM = formatSpacing(getResponsive(child?.config, "marginBottom", "mobile")) ?? mbT;
    const mlM = formatSpacing(getResponsive(child?.config, "marginLeft", "mobile")) ?? mlT;
    const ptM = formatSpacing(getResponsive(child?.config, "paddingTop", "mobile")) ?? ptT;
    const prM = formatSpacing(getResponsive(child?.config, "paddingRight", "mobile")) ?? prT;
    const pbM = formatSpacing(getResponsive(child?.config, "paddingBottom", "mobile")) ?? pbT;
    const plM = formatSpacing(getResponsive(child?.config, "paddingLeft", "mobile")) ?? plT;

    const mtDPos = verticalAlignD === "bottom" || verticalAlignD === "center" ? "auto" : mtD;
    const mtTPos = verticalAlignT === "bottom" || verticalAlignT === "center" ? "auto" : mtT;
    const mtMPos = verticalAlignM === "bottom" || verticalAlignM === "center" ? "auto" : mtM;
    const mbDPos = verticalAlignD === "center" ? "auto" : mbD;
    const mbTPos = verticalAlignT === "center" ? "auto" : mbT;
    const mbMPos = verticalAlignM === "center" ? "auto" : mbM;

    const styleVars: React.CSSProperties = {
      ["--fb-w-ta-d" as any]: alignD,
      ["--fb-w-ta-t" as any]: alignT,
      ["--fb-w-ta-m" as any]: alignM,
      ["--fb-w-mt-d" as any]: mtDPos,
      ["--fb-w-mt-t" as any]: mtTPos,
      ["--fb-w-mt-m" as any]: mtMPos,
      ["--fb-w-mr-d" as any]: mrD,
      ["--fb-w-mr-t" as any]: mrT,
      ["--fb-w-mr-m" as any]: mrM,
      ["--fb-w-mb-d" as any]: mbDPos,
      ["--fb-w-mb-t" as any]: mbTPos,
      ["--fb-w-mb-m" as any]: mbMPos,
      ["--fb-w-ml-d" as any]: mlD,
      ["--fb-w-ml-t" as any]: mlT,
      ["--fb-w-ml-m" as any]: mlM,
      ["--fb-w-pt-d" as any]: ptD,
      ["--fb-w-pt-t" as any]: ptT,
      ["--fb-w-pt-m" as any]: ptM,
      ["--fb-w-pr-d" as any]: prD,
      ["--fb-w-pr-t" as any]: prT,
      ["--fb-w-pr-m" as any]: prM,
      ["--fb-w-pb-d" as any]: pbD,
      ["--fb-w-pb-t" as any]: pbT,
      ["--fb-w-pb-m" as any]: pbM,
      ["--fb-w-pl-d" as any]: plD,
      ["--fb-w-pl-t" as any]: plT,
      ["--fb-w-pl-m" as any]: plM,
    };
    return (
      <div
        key={child.id}
        suppressHydrationWarning
        id={`footer-widget-${child.id}`}
        style={styleVars}
        className={`fb-footer-widget-shell min-w-0 ${growClass} ${selfAlignClass} [text-align:var(--fb-w-ta-m)] md:[text-align:var(--fb-w-ta-t)] lg:[text-align:var(--fb-w-ta-d)]`.trim()}
      >
        {renderWidget(child)}
      </div>
    );
  };

  const renderWidget = (widget: any) => {
    if (!widget || (widget.isActive ?? widget.isVisible) === false) return null;
    const config = widget.config || {};
    const showTitle = config.showTitle !== false;
    const title = typeof widget.title === "string" ? widget.title : "";
    const align = getTextAlign(config);
    const alignClass = getTextAlignClass(align);

    if (widget.type === "footer_brand") {
      const desc = typeof config.text === "string" && config.text.trim() !== ""
        ? config.text
        : "Portal berita terpercaya dengan menyajikan informasi aktual dan faktual.";
      return (
        <div className={`space-y-3 ${alignClass}`.trim()}>
          <h3 className="text-2xl font-bold">{siteName}</h3>
          <p className="text-gray-400 max-w-sm">{desc}</p>
        </div>
      );
    }

    if (widget.type === "footer_logo") {
      const lightLogo = typeof config.logoUrl === "string" && config.logoUrl.trim() !== "" ? config.logoUrl.trim() : (typeof logoUrl === "string" ? logoUrl.trim() : "");
      const darkLogo = typeof config.logoUrlDark === "string" && config.logoUrlDark.trim() !== "" ? config.logoUrlDark.trim() : "";

      const desktopH = resolveOptionalPx(getResponsive(config, "logoHeight", "desktop")) || "40px";
      const tabletH = resolveOptionalPx(getResponsive(config, "logoHeight", "tablet")) || desktopH;
      const mobileH = resolveOptionalPx(getResponsive(config, "logoHeight", "mobile")) || desktopH;
      const desktopMaxW = resolveOptionalPx(getResponsive(config, "logoMaxWidth", "desktop"));
      const tabletMaxW = resolveOptionalPx(getResponsive(config, "logoMaxWidth", "tablet")) || desktopMaxW;
      const mobileMaxW = resolveOptionalPx(getResponsive(config, "logoMaxWidth", "mobile")) || desktopMaxW;
      const desktopText = resolveOptionalPx(getResponsive(config, "logoTextSize", "desktop")) || "28px";
      const tabletText = resolveOptionalPx(getResponsive(config, "logoTextSize", "tablet")) || desktopText;
      const mobileText = resolveOptionalPx(getResponsive(config, "logoTextSize", "mobile")) || desktopText;
      const desktopRadius = resolveOptionalPx(getResponsive(config, "borderRadius", "desktop")) || "0px";
      const tabletRadius = resolveOptionalPx(getResponsive(config, "borderRadius", "tablet")) || desktopRadius;
      const mobileRadius = resolveOptionalPx(getResponsive(config, "borderRadius", "mobile")) || desktopRadius;
      const logoFitClass = getObjectFitClass(config.objectFit);
      const logoShadowClass = config.showShadow === true || config.showShadow === "true"
        ? "shadow-[0_10px_30px_rgba(15,23,42,0.14)]"
        : "";

      const style = {
        ["--fb-logo-desktop-h" as any]: desktopH,
        ["--fb-logo-tablet-h" as any]: tabletH,
        ["--fb-logo-mobile-h" as any]: mobileH,
        ["--fb-logo-desktop-maxw" as any]: desktopMaxW,
        ["--fb-logo-tablet-maxw" as any]: tabletMaxW,
        ["--fb-logo-mobile-maxw" as any]: mobileMaxW,
        ["--fb-logo-desktop-text" as any]: desktopText,
        ["--fb-logo-tablet-text" as any]: tabletText,
        ["--fb-logo-mobile-text" as any]: mobileText,
        ["--fb-logo-desktop-radius" as any]: desktopRadius,
        ["--fb-logo-tablet-radius" as any]: tabletRadius,
        ["--fb-logo-mobile-radius" as any]: mobileRadius,
      } as any;

      return (
        <div className={`fb-logo ${alignClass}`.trim()} style={style}>
          <Link href="/" className={lightLogo !== "" || darkLogo !== "" ? "inline-flex" : "fb-logo-text font-bold"} aria-label={siteName}>
            {lightLogo !== "" || darkLogo !== "" ? (
              lightLogo !== "" && darkLogo !== "" ? (
                <>
                  <Image
                    src={lightLogo}
                    alt={siteName}
                    width={400}
                    height={120}
                    unoptimized
                    className={`[html.public-dark_&]:hidden h-[var(--fb-logo-mobile-h,var(--fb-logo-desktop-h,40px))] md:h-[var(--fb-logo-tablet-h,var(--fb-logo-desktop-h,40px))] lg:h-[var(--fb-logo-desktop-h,40px)] w-auto max-w-[var(--fb-logo-mobile-maxw,var(--fb-logo-desktop-maxw,none))] md:max-w-[var(--fb-logo-tablet-maxw,var(--fb-logo-desktop-maxw,none))] lg:max-w-[var(--fb-logo-desktop-maxw,none)] rounded-[var(--fb-logo-mobile-radius,var(--fb-logo-desktop-radius,0px))] md:rounded-[var(--fb-logo-tablet-radius,var(--fb-logo-desktop-radius,0px))] lg:rounded-[var(--fb-logo-desktop-radius,0px)] ${logoFitClass} ${logoShadowClass}`.trim()}
                  />
                  <Image
                    src={darkLogo}
                    alt={siteName}
                    width={400}
                    height={120}
                    unoptimized
                    className={`hidden [html.public-dark_&]:inline-block h-[var(--fb-logo-mobile-h,var(--fb-logo-desktop-h,40px))] md:h-[var(--fb-logo-tablet-h,var(--fb-logo-desktop-h,40px))] lg:h-[var(--fb-logo-desktop-h,40px)] w-auto max-w-[var(--fb-logo-mobile-maxw,var(--fb-logo-desktop-maxw,none))] md:max-w-[var(--fb-logo-tablet-maxw,var(--fb-logo-desktop-maxw,none))] lg:max-w-[var(--fb-logo-desktop-maxw,none)] rounded-[var(--fb-logo-mobile-radius,var(--fb-logo-desktop-radius,0px))] md:rounded-[var(--fb-logo-tablet-radius,var(--fb-logo-desktop-radius,0px))] lg:rounded-[var(--fb-logo-desktop-radius,0px)] ${logoFitClass} ${logoShadowClass}`.trim()}
                  />
                </>
              ) : (
                <Image
                  src={(lightLogo || darkLogo) as string}
                  alt={siteName}
                  width={400}
                  height={120}
                  unoptimized
                  className={`h-[var(--fb-logo-mobile-h,var(--fb-logo-desktop-h,40px))] md:h-[var(--fb-logo-tablet-h,var(--fb-logo-desktop-h,40px))] lg:h-[var(--fb-logo-desktop-h,40px)] w-auto max-w-[var(--fb-logo-mobile-maxw,var(--fb-logo-desktop-maxw,none))] md:max-w-[var(--fb-logo-tablet-maxw,var(--fb-logo-desktop-maxw,none))] lg:max-w-[var(--fb-logo-desktop-maxw,none)] rounded-[var(--fb-logo-mobile-radius,var(--fb-logo-desktop-radius,0px))] md:rounded-[var(--fb-logo-tablet-radius,var(--fb-logo-desktop-radius,0px))] lg:rounded-[var(--fb-logo-desktop-radius,0px)] ${logoFitClass} ${logoShadowClass}`.trim()}
                />
              )
            ) : (
              <span className="fb-logo-text text-[length:var(--fb-logo-mobile-text,var(--fb-logo-desktop-text,28px))] md:text-[length:var(--fb-logo-tablet-text,var(--fb-logo-desktop-text,28px))] lg:text-[length:var(--fb-logo-desktop-text,28px)] leading-[1.1]">
                {siteName}
              </span>
            )}
          </Link>
        </div>
      );
    }

    if (widget.type === "footer_menu") {
      if (!Array.isArray(footerMenu) || footerMenu.length === 0) return null;
      return (
        <div className={`space-y-3 ${alignClass}`.trim()}>
          {showTitle && <h4 className="font-bold text-gray-200">{title || "Navigasi"}</h4>}
          <ul className="space-y-2 text-sm text-gray-400">
            {footerMenu.map((item: any) => (
              <li key={item.id}>
                <Link
                  href={item.href || "#"}
                  className="hover:text-white transition-colors"
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noreferrer" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (widget.type === "footer_text") {
      const rawHtml = typeof config.html === "string" ? config.html : typeof config.text === "string" ? config.text : "";
      const clean = rawHtml.trim() !== "" ? sanitizeContent(rawHtml) : "";
      if (!showTitle && clean.trim() === "") return null;
      const scalar = (raw: unknown) => {
        if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
        if (typeof raw === "string" && raw.trim() !== "") return raw.trim();
        return undefined;
      };
      const desktopColor = resolveOptionalColor(getResponsive(config, "textColor", "desktop")) || "#9ca3af";
      const tabletColor = resolveOptionalColor(getResponsive(config, "textColor", "tablet")) || desktopColor;
      const mobileColor = resolveOptionalColor(getResponsive(config, "textColor", "mobile")) || desktopColor;
      const desktopSize = resolveOptionalPx(getResponsive(config, "textFontSize", "desktop")) || "14px";
      const tabletSize = resolveOptionalPx(getResponsive(config, "textFontSize", "tablet")) || desktopSize;
      const mobileSize = resolveOptionalPx(getResponsive(config, "textFontSize", "mobile")) || desktopSize;
      const desktopLineHeight = scalar(getResponsive(config, "textLineHeight", "desktop")) || "1.625";
      const tabletLineHeight = scalar(getResponsive(config, "textLineHeight", "tablet")) || desktopLineHeight;
      const mobileLineHeight = scalar(getResponsive(config, "textLineHeight", "mobile")) || desktopLineHeight;
      const desktopWeight = scalar(getResponsive(config, "textFontWeight", "desktop")) || "400";
      const tabletWeight = scalar(getResponsive(config, "textFontWeight", "tablet")) || desktopWeight;
      const mobileWeight = scalar(getResponsive(config, "textFontWeight", "mobile")) || desktopWeight;
      const desktopTitleColor = resolveOptionalColor(getResponsive(config, "blockTitleColor", "desktop")) || "#e5e7eb";
      const tabletTitleColor = resolveOptionalColor(getResponsive(config, "blockTitleColor", "tablet")) || desktopTitleColor;
      const mobileTitleColor = resolveOptionalColor(getResponsive(config, "blockTitleColor", "mobile")) || desktopTitleColor;
      const desktopTitleSize = resolveOptionalPx(getResponsive(config, "blockTitleFontSize", "desktop")) || "16px";
      const tabletTitleSize = resolveOptionalPx(getResponsive(config, "blockTitleFontSize", "tablet")) || desktopTitleSize;
      const mobileTitleSize = resolveOptionalPx(getResponsive(config, "blockTitleFontSize", "mobile")) || desktopTitleSize;
      const desktopTitleBorder = resolveOptionalColor(getResponsive(config, "blockTitleBorderColor", "desktop")) || "rgba(229, 231, 235, 0.28)";
      const tabletTitleBorder = resolveOptionalColor(getResponsive(config, "blockTitleBorderColor", "tablet")) || desktopTitleBorder;
      const mobileTitleBorder = resolveOptionalColor(getResponsive(config, "blockTitleBorderColor", "mobile")) || desktopTitleBorder;
      const styleVars: React.CSSProperties = {
        ["--fb-ft-color-desktop" as any]: desktopColor,
        ["--fb-ft-color-tablet" as any]: tabletColor,
        ["--fb-ft-color-mobile" as any]: mobileColor,
        ["--fb-ft-size-desktop" as any]: desktopSize,
        ["--fb-ft-size-tablet" as any]: tabletSize,
        ["--fb-ft-size-mobile" as any]: mobileSize,
        ["--fb-ft-lh-desktop" as any]: desktopLineHeight,
        ["--fb-ft-lh-tablet" as any]: tabletLineHeight,
        ["--fb-ft-lh-mobile" as any]: mobileLineHeight,
        ["--fb-ft-fw-desktop" as any]: desktopWeight,
        ["--fb-ft-fw-tablet" as any]: tabletWeight,
        ["--fb-ft-fw-mobile" as any]: mobileWeight,
        ["--fb-ft-title-color-desktop" as any]: desktopTitleColor,
        ["--fb-ft-title-color-tablet" as any]: tabletTitleColor,
        ["--fb-ft-title-color-mobile" as any]: mobileTitleColor,
        ["--fb-ft-title-size-desktop" as any]: desktopTitleSize,
        ["--fb-ft-title-size-tablet" as any]: tabletTitleSize,
        ["--fb-ft-title-size-mobile" as any]: mobileTitleSize,
        ["--fb-ft-title-border-desktop" as any]: desktopTitleBorder,
        ["--fb-ft-title-border-tablet" as any]: tabletTitleBorder,
        ["--fb-ft-title-border-mobile" as any]: mobileTitleBorder,
      };
      return (
        <div className={`space-y-3 ${alignClass}`.trim()}>
          {showTitle && (
            <h4
              style={styleVars}
              className="inline-flex border-b pb-1 font-bold [color:var(--fb-ft-title-color-mobile,var(--fb-ft-title-color-desktop,#e5e7eb))] md:[color:var(--fb-ft-title-color-tablet,var(--fb-ft-title-color-desktop,#e5e7eb))] lg:[color:var(--fb-ft-title-color-desktop,#e5e7eb)] text-[length:var(--fb-ft-title-size-mobile,var(--fb-ft-title-size-desktop,16px))] md:text-[length:var(--fb-ft-title-size-tablet,var(--fb-ft-title-size-desktop,16px))] lg:text-[length:var(--fb-ft-title-size-desktop,16px)] border-[color:var(--fb-ft-title-border-mobile,var(--fb-ft-title-border-desktop,rgba(229,231,235,0.28)))] md:border-[color:var(--fb-ft-title-border-tablet,var(--fb-ft-title-border-desktop,rgba(229,231,235,0.28)))] lg:border-[color:var(--fb-ft-title-border-desktop,rgba(229,231,235,0.28))]"
            >
              {title || "Info"}
            </h4>
          )}
          {clean.trim() !== "" && (
            <div
              suppressHydrationWarning
              style={styleVars}
              className="fb-footer-text max-w-full break-words whitespace-normal [color:var(--fb-ft-color-mobile,var(--fb-ft-color-desktop,#9ca3af))] md:[color:var(--fb-ft-color-tablet,var(--fb-ft-color-desktop,#9ca3af))] lg:[color:var(--fb-ft-color-desktop,#9ca3af)] text-[length:var(--fb-ft-size-mobile,var(--fb-ft-size-desktop,14px))] md:text-[length:var(--fb-ft-size-tablet,var(--fb-ft-size-desktop,14px))] lg:text-[length:var(--fb-ft-size-desktop,14px)] leading-[var(--fb-ft-lh-mobile,var(--fb-ft-lh-desktop,1.625))] md:leading-[var(--fb-ft-lh-tablet,var(--fb-ft-lh-desktop,1.625))] lg:leading-[var(--fb-ft-lh-desktop,1.625)] font-[var(--fb-ft-fw-mobile,var(--fb-ft-fw-desktop,400))] md:font-[var(--fb-ft-fw-tablet,var(--fb-ft-fw-desktop,400))] lg:font-[var(--fb-ft-fw-desktop,400)] [&_*]:max-w-full [&_*]:overflow-wrap-anywhere [&_*]:break-words [&_*]:whitespace-normal [&_a]:text-inherit [&_a:hover]:text-white [&_a]:underline-offset-4 [&_a:hover]:underline [&_p]:m-0 [&_b]:font-bold [&_strong]:font-bold [&_img]:max-w-full [&_img]:h-auto [&_video]:max-w-full [&_video]:h-auto [&_iframe]:max-w-full [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
              dangerouslySetInnerHTML={{
                __html: clean,
              }}
            />
          )}
        </div>
      );
    }

    if (widget.type === "image_widget") {
      return <ImageUrlWidget config={config} title={title || "Gambar"} className={alignClass} />;
    }

    if (widget.type === "footer_social") {
      const links = [
        { key: "facebook", icon: Facebook, href: sanitizeExternalUrl(config.facebook) },
        { key: "twitter", icon: Twitter, href: sanitizeExternalUrl(config.twitter) },
        { key: "instagram", icon: Instagram, href: sanitizeExternalUrl(config.instagram) },
        { key: "youtube", icon: Youtube, href: sanitizeExternalUrl(config.youtube) },
        { key: "linkedin", icon: Linkedin, href: sanitizeExternalUrl(config.linkedin) },
        { key: "tiktok", icon: TikTokIcon, href: sanitizeExternalUrl(config.tiktok) },
      ].filter((x) => x.href !== "");

      if (links.length === 0) return null;
      const layoutRaw = typeof config.socialLayout === "string" ? config.socialLayout : "horizontal";
      const layout = layoutRaw === "vertical" ? "vertical" : "horizontal";
      const variantRaw = typeof config.socialVariant === "string" ? config.socialVariant : "theme";
      const variant = variantRaw === "plain" || variantRaw === "button" ? variantRaw : "theme";
      const effectiveVariant = variant === "theme" ? "plain" : variant;

      const radiusRaw = typeof config.socialRadius === "string" ? config.socialRadius : "full";
      const radius = radiusRaw === "none" ? "0px" : radiusRaw === "md" ? "12px" : "9999px";

      const desktopGap = resolveOptionalPx(getResponsive(config, "socialGap", "desktop")) || "16px";
      const tabletGap = resolveOptionalPx(getResponsive(config, "socialGap", "tablet")) || desktopGap;
      const mobileGap = resolveOptionalPx(getResponsive(config, "socialGap", "mobile")) || desktopGap;

      const desktopSize = resolveOptionalPx(getResponsive(config, "socialIconSize", "desktop")) || "20px";
      const tabletSize = resolveOptionalPx(getResponsive(config, "socialIconSize", "tablet")) || desktopSize;
      const mobileSize = resolveOptionalPx(getResponsive(config, "socialIconSize", "mobile")) || desktopSize;

      const desktopPad = resolveOptionalPx(getResponsive(config, "socialPadding", "desktop")) || "8px";
      const tabletPad = resolveOptionalPx(getResponsive(config, "socialPadding", "tablet")) || desktopPad;
      const mobilePad = resolveOptionalPx(getResponsive(config, "socialPadding", "mobile")) || desktopPad;

      const desktopColor = resolveOptionalColor(getResponsive(config, "socialIconColor", "desktop")) || "#9ca3af";
      const tabletColor = resolveOptionalColor(getResponsive(config, "socialIconColor", "tablet")) || desktopColor;
      const mobileColor = resolveOptionalColor(getResponsive(config, "socialIconColor", "mobile")) || desktopColor;

      const desktopHover = resolveOptionalColor(getResponsive(config, "socialIconHoverColor", "desktop")) || "#ffffff";
      const tabletHover = resolveOptionalColor(getResponsive(config, "socialIconHoverColor", "tablet")) || desktopHover;
      const mobileHover = resolveOptionalColor(getResponsive(config, "socialIconHoverColor", "mobile")) || desktopHover;

      const defaultBg = "transparent";
      const defaultBgHover = "transparent";
      const desktopBg = resolveOptionalColor(getResponsive(config, "socialBgColor", "desktop")) || defaultBg;
      const tabletBg = resolveOptionalColor(getResponsive(config, "socialBgColor", "tablet")) || desktopBg;
      const mobileBg = resolveOptionalColor(getResponsive(config, "socialBgColor", "mobile")) || desktopBg;
      const desktopBgHover = resolveOptionalColor(getResponsive(config, "socialBgHoverColor", "desktop")) || defaultBgHover;
      const tabletBgHover = resolveOptionalColor(getResponsive(config, "socialBgHoverColor", "tablet")) || desktopBgHover;
      const mobileBgHover = resolveOptionalColor(getResponsive(config, "socialBgHoverColor", "mobile")) || desktopBgHover;

      const openInNewTabRaw = config.openInNewTab;
      const openInNewTab = openInNewTabRaw === undefined ? true : !!openInNewTabRaw;
      const nofollowExternal = isTruthy(config.nofollowExternal);

      return (
        <div
          className={`space-y-3 ${alignClass}`.trim()}
          style={
            {
              ["--fb-sl-gap-desktop" as any]: desktopGap,
              ["--fb-sl-gap-tablet" as any]: tabletGap,
              ["--fb-sl-gap-mobile" as any]: mobileGap,
              ["--fb-sl-size-desktop" as any]: desktopSize,
              ["--fb-sl-size-tablet" as any]: tabletSize,
              ["--fb-sl-size-mobile" as any]: mobileSize,
              ["--fb-sl-pad-desktop" as any]: desktopPad,
              ["--fb-sl-pad-tablet" as any]: tabletPad,
              ["--fb-sl-pad-mobile" as any]: mobilePad,
              ["--fb-sl-color-desktop" as any]: desktopColor,
              ["--fb-sl-color-tablet" as any]: tabletColor,
              ["--fb-sl-color-mobile" as any]: mobileColor,
              ["--fb-sl-hover-desktop" as any]: desktopHover,
              ["--fb-sl-hover-tablet" as any]: tabletHover,
              ["--fb-sl-hover-mobile" as any]: mobileHover,
              ["--fb-sl-bg-desktop" as any]: desktopBg,
              ["--fb-sl-bg-tablet" as any]: tabletBg,
              ["--fb-sl-bg-mobile" as any]: mobileBg,
              ["--fb-sl-bg-hover-desktop" as any]: desktopBgHover,
              ["--fb-sl-bg-hover-tablet" as any]: tabletBgHover,
              ["--fb-sl-bg-hover-mobile" as any]: mobileBgHover,
              ["--fb-sl-radius" as any]: radius,
            } as any
          }
        >
          {showTitle && <h4 className="font-bold text-gray-200">{title || "Social"}</h4>}
          <div
            className={
              layout === "vertical"
                ? `flex flex-col ${getItemsAlignClass(align)} gap-[var(--fb-sl-gap-mobile,var(--fb-sl-gap-desktop,16px))] md:gap-[var(--fb-sl-gap-tablet,var(--fb-sl-gap-desktop,16px))]`.trim()
                : `flex flex-wrap items-center ${getJustifyClass(align)} gap-[var(--fb-sl-gap-mobile,var(--fb-sl-gap-desktop,16px))] md:gap-[var(--fb-sl-gap-tablet,var(--fb-sl-gap-desktop,16px))]`.trim()
            }
          >
            {links.map((l) => {
              const Icon = l.icon;
              const rel = `${openInNewTab ? "noreferrer noopener" : ""}${nofollowExternal ? " nofollow" : ""}`.trim() || undefined;
              return (
                <a
                  key={l.key}
                  href={l.href}
                  className={
                    effectiveVariant === "button"
                      ? `inline-flex items-center justify-center rounded-[var(--fb-sl-radius,9999px)] p-[var(--fb-sl-pad-mobile,var(--fb-sl-pad-desktop,8px))] md:p-[var(--fb-sl-pad-tablet,var(--fb-sl-pad-desktop,8px))] bg-[color:var(--fb-sl-bg-mobile,var(--fb-sl-bg-desktop,transparent))] md:bg-[color:var(--fb-sl-bg-tablet,var(--fb-sl-bg-desktop,transparent))] hover:bg-[color:var(--fb-sl-bg-hover-mobile,var(--fb-sl-bg-hover-desktop,transparent))] md:hover:bg-[color:var(--fb-sl-bg-hover-tablet,var(--fb-sl-bg-hover-desktop,transparent))] [color:var(--fb-sl-color-mobile,var(--fb-sl-color-desktop,#9ca3af))] md:[color:var(--fb-sl-color-tablet,var(--fb-sl-color-desktop,#9ca3af))] hover:[color:var(--fb-sl-hover-mobile,var(--fb-sl-hover-desktop,#ffffff))] md:hover:[color:var(--fb-sl-hover-tablet,var(--fb-sl-hover-desktop,#ffffff))] transition-colors`.trim()
                      : `inline-flex items-center justify-center [color:var(--fb-sl-color-mobile,var(--fb-sl-color-desktop,#9ca3af))] md:[color:var(--fb-sl-color-tablet,var(--fb-sl-color-desktop,#9ca3af))] hover:[color:var(--fb-sl-hover-mobile,var(--fb-sl-hover-desktop,#ffffff))] md:hover:[color:var(--fb-sl-hover-tablet,var(--fb-sl-hover-desktop,#ffffff))] transition-colors`.trim()
                  }
                  target={openInNewTab ? "_blank" : undefined}
                  rel={rel}
                  aria-label={l.key}
                >
                  <Icon className="w-[var(--fb-sl-size-mobile,var(--fb-sl-size-desktop,20px))] h-[var(--fb-sl-size-mobile,var(--fb-sl-size-desktop,20px))] md:w-[var(--fb-sl-size-tablet,var(--fb-sl-size-desktop,20px))] md:h-[var(--fb-sl-size-tablet,var(--fb-sl-size-desktop,20px))]" />
                </a>
              );
            })}
          </div>
        </div>
      );
    }

    if (widget.type === "footer_categories") {
      const limit = Number(config.limit || 10);
      const list = Array.isArray(categories) ? categories : [];
      const items = list.slice(0, Number.isFinite(limit) && limit > 0 ? limit : 10);
      if (items.length === 0) return null;
      return (
        <div className={`space-y-3 ${alignClass}`.trim()}>
          {showTitle && <h4 className="font-bold text-gray-200">{title || "Kategori"}</h4>}
          <ul className="space-y-2 text-sm text-gray-400">
            {items.map((cat: any) => (
              <li key={cat.id || cat.slug || cat.name}>
                <Link href={`/kategori/${cat.slug}`} className="hover:text-white transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (widget.type === "footer_custom_links") {
      const raw = config.links;
      const links = Array.isArray(raw) ? raw : [];
      const items = links
        .map((l: any) => ({
          label: typeof l?.label === "string" ? l.label : "",
          url: typeof l?.url === "string" ? l.url : "",
          openInNewTab: !!l?.openInNewTab,
        }))
        .filter((l: any) => l.label.trim() !== "" && l.url.trim() !== "");
      if (items.length === 0) return null;
      const scalar = (raw: unknown) => {
        if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
        if (typeof raw === "string" && raw.trim() !== "") return raw.trim();
        return undefined;
      };
      const layoutRaw = typeof config.linkLayout === "string" ? config.linkLayout : "vertical";
      const layout = layoutRaw === "horizontal" ? "horizontal" : "vertical";
      const showBullets = isTruthy(config.showBullets);
      const underlineRaw = typeof config.linkUnderline === "string" ? config.linkUnderline : "hover";
      const underline = underlineRaw === "none" || underlineRaw === "always" ? underlineRaw : "hover";
      const nofollowExternal = isTruthy(config.nofollowExternal);
      const dividerRaw = typeof config.linkDivider === "string" ? config.linkDivider : "strip";
      const divider = dividerRaw === "line" || dividerRaw === "round" || dividerRaw === "strip" ? dividerRaw : "strip";
      const dividerChar = divider === "line" ? "|" : divider === "round" ? "•" : "-";

      const desktopColor = resolveOptionalColor(getResponsive(config, "linkColor", "desktop")) || "#9ca3af";
      const tabletColor = resolveOptionalColor(getResponsive(config, "linkColor", "tablet")) || desktopColor;
      const mobileColor = resolveOptionalColor(getResponsive(config, "linkColor", "mobile")) || desktopColor;
      const desktopHover = resolveOptionalColor(getResponsive(config, "linkHoverColor", "desktop")) || "#ffffff";
      const tabletHover = resolveOptionalColor(getResponsive(config, "linkHoverColor", "tablet")) || desktopHover;
      const mobileHover = resolveOptionalColor(getResponsive(config, "linkHoverColor", "mobile")) || desktopHover;
      const desktopSize = resolveOptionalPx(getResponsive(config, "linkFontSize", "desktop")) || "14px";
      const tabletSize = resolveOptionalPx(getResponsive(config, "linkFontSize", "tablet")) || desktopSize;
      const mobileSize = resolveOptionalPx(getResponsive(config, "linkFontSize", "mobile")) || desktopSize;
      const desktopWeight = scalar(getResponsive(config, "linkFontWeight", "desktop")) || "400";
      const tabletWeight = scalar(getResponsive(config, "linkFontWeight", "tablet")) || desktopWeight;
      const mobileWeight = scalar(getResponsive(config, "linkFontWeight", "mobile")) || desktopWeight;
      const desktopGapV =
        resolveOptionalPx(getResponsive(config, "linkGapVertical", "desktop") ?? getResponsive(config, "linkGap", "desktop")) || "8px";
      const tabletGapV =
        resolveOptionalPx(getResponsive(config, "linkGapVertical", "tablet") ?? getResponsive(config, "linkGap", "tablet")) || desktopGapV;
      const mobileGapV =
        resolveOptionalPx(getResponsive(config, "linkGapVertical", "mobile") ?? getResponsive(config, "linkGap", "mobile")) || desktopGapV;
      const desktopGapH =
        resolveOptionalPx(getResponsive(config, "linkGapHorizontal", "desktop") ?? getResponsive(config, "linkGap", "desktop")) || "8px";
      const tabletGapH =
        resolveOptionalPx(getResponsive(config, "linkGapHorizontal", "tablet") ?? getResponsive(config, "linkGap", "tablet")) || desktopGapH;
      const mobileGapH =
        resolveOptionalPx(getResponsive(config, "linkGapHorizontal", "mobile") ?? getResponsive(config, "linkGap", "mobile")) || desktopGapH;

      const styleVars: React.CSSProperties = {
        ["--fb-cl-color-desktop" as any]: desktopColor,
        ["--fb-cl-color-tablet" as any]: tabletColor,
        ["--fb-cl-color-mobile" as any]: mobileColor,
        ["--fb-cl-hover-desktop" as any]: desktopHover,
        ["--fb-cl-hover-tablet" as any]: tabletHover,
        ["--fb-cl-hover-mobile" as any]: mobileHover,
        ["--fb-cl-size-desktop" as any]: desktopSize,
        ["--fb-cl-size-tablet" as any]: tabletSize,
        ["--fb-cl-size-mobile" as any]: mobileSize,
        ["--fb-cl-fw-desktop" as any]: desktopWeight,
        ["--fb-cl-fw-tablet" as any]: tabletWeight,
        ["--fb-cl-fw-mobile" as any]: mobileWeight,
        ["--fb-cl-gapv-desktop" as any]: desktopGapV,
        ["--fb-cl-gapv-tablet" as any]: tabletGapV,
        ["--fb-cl-gapv-mobile" as any]: mobileGapV,
        ["--fb-cl-gaph-desktop" as any]: desktopGapH,
        ["--fb-cl-gaph-tablet" as any]: tabletGapH,
        ["--fb-cl-gaph-mobile" as any]: mobileGapH,
      };

      const ulClass =
        layout === "horizontal"
          ? `flex flex-wrap items-center ${getJustifyClass(align)}`
          : `space-y-[var(--fb-cl-gapv-mobile,var(--fb-cl-gapv-desktop,8px))] md:space-y-[var(--fb-cl-gapv-tablet,var(--fb-cl-gapv-desktop,8px))] lg:space-y-[var(--fb-cl-gapv-desktop,8px)] ${showBullets ? "list-disc pl-5" : ""}`.trim();

      const linkBase =
        underline === "always"
          ? "underline underline-offset-4"
          : underline === "none"
          ? "no-underline"
          : "no-underline hover:underline hover:underline-offset-4";
      return (
        <div className={`space-y-3 ${alignClass}`.trim()}>
          {showTitle && <h4 className="font-bold text-gray-200">{title || "Links"}</h4>}
          <ul
            style={styleVars}
            className={`fb-custom-links max-w-full break-words whitespace-normal [color:var(--fb-cl-color-mobile,var(--fb-cl-color-desktop,#9ca3af))] md:[color:var(--fb-cl-color-tablet,var(--fb-cl-color-desktop,#9ca3af))] lg:[color:var(--fb-cl-color-desktop,#9ca3af)] text-[length:var(--fb-cl-size-mobile,var(--fb-cl-size-desktop,14px))] md:text-[length:var(--fb-cl-size-tablet,var(--fb-cl-size-desktop,14px))] lg:text-[length:var(--fb-cl-size-desktop,14px)] font-[var(--fb-cl-fw-mobile,var(--fb-cl-fw-desktop,400))] md:font-[var(--fb-cl-fw-tablet,var(--fb-cl-fw-desktop,400))] lg:font-[var(--fb-cl-fw-desktop,400)] ${ulClass}`.trim()}
          >
            {items.map((item: any, idx: number) => {
              const isInternal = item.url.startsWith("/");
              const rel = [
                item.openInNewTab ? "noreferrer" : "",
                !isInternal && nofollowExternal ? "nofollow" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <li key={`${item.label}_${idx}`} className={layout === "horizontal" ? "flex items-center" : undefined}>
                  {isInternal ? (
                    <Link
                      href={item.url}
                      className={`text-inherit transition-colors hover:[color:var(--fb-cl-hover-mobile,var(--fb-cl-hover-desktop,#ffffff))] md:hover:[color:var(--fb-cl-hover-tablet,var(--fb-cl-hover-desktop,#ffffff))] lg:hover:[color:var(--fb-cl-hover-desktop,#ffffff)] ${linkBase}`.trim()}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.url}
                      className={`text-inherit transition-colors hover:[color:var(--fb-cl-hover-mobile,var(--fb-cl-hover-desktop,#ffffff))] md:hover:[color:var(--fb-cl-hover-tablet,var(--fb-cl-hover-desktop,#ffffff))] lg:hover:[color:var(--fb-cl-hover-desktop,#ffffff)] ${linkBase}`.trim()}
                      target={item.openInNewTab ? "_blank" : undefined}
                      rel={rel !== "" ? rel : undefined}
                    >
                      {item.label}
                    </a>
                  )}
                  {layout === "horizontal" && idx < items.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center justify-center leading-none opacity-60 select-none mx-[calc(var(--fb-cl-gaph-mobile,var(--fb-cl-gaph-desktop,8px))/2)] md:mx-[calc(var(--fb-cl-gaph-tablet,var(--fb-cl-gaph-desktop,8px))/2)] lg:mx-[calc(var(--fb-cl-gaph-desktop,8px)/2)]"
                    >
                      {dividerChar}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    if (widget.type === "section") {
      const sectionConfig = config || {};
      const children = Array.isArray(sectionConfig.children) ? sectionConfig.children : [];
      const activeChildren = children.filter((c: any) => c && (c.isActive ?? c.isVisible ?? true));
      if (activeChildren.length === 0) return null;

      const colCount = getColumnCount(sectionConfig.layout);
      const gridCols = getGridColsClass(colCount);
      const gapClass = getGapClass(sectionConfig.gap);
      const dirMobile = sectionConfig.mobileChildrenDirection === "horizontal" ? "horizontal" : "vertical";
      const dirTablet = sectionConfig.tabletChildrenDirection === "horizontal" ? "horizontal" : "vertical";
      const dirDesktop = sectionConfig.childrenDirection === "horizontal" ? "horizontal" : "vertical";

      const alignMobile = sectionConfig.mobileChildrenAlign === "right" ? "right" : sectionConfig.mobileChildrenAlign === "center" ? "center" : "left";
      const alignTablet = sectionConfig.tabletChildrenAlign === "right" ? "right" : sectionConfig.tabletChildrenAlign === "center" ? "center" : "left";
      const alignDesktop = sectionConfig.childrenAlign === "right" ? "right" : sectionConfig.childrenAlign === "center" ? "center" : "left";

      const vAlignMobile = sectionConfig.mobileChildrenVerticalAlign === "bottom" ? "bottom" : sectionConfig.mobileChildrenVerticalAlign === "center" ? "center" : "top";
      const vAlignTablet = sectionConfig.tabletChildrenVerticalAlign === "bottom" ? "bottom" : sectionConfig.tabletChildrenVerticalAlign === "center" ? "center" : "top";
      const vAlignDesktop = sectionConfig.childrenVerticalAlign === "bottom" ? "bottom" : sectionConfig.childrenVerticalAlign === "center" ? "center" : "top";

      const sizeMobile = sectionConfig.mobileChildrenSizing === "grow" ? "grow" : "auto";
      const sizeTablet = sectionConfig.tabletChildrenSizing === "grow" ? "grow" : "auto";
      const sizeDesktop = sectionConfig.childrenSizing === "grow" ? "grow" : "auto";

      const directionClassMobile = dirMobile === "horizontal" ? "flex-row flex-wrap" : "flex-col";
      const directionClassTablet = dirTablet === "horizontal" ? "md:flex-row md:flex-wrap" : "md:flex-col";
      const directionClassDesktop = dirDesktop === "horizontal" ? "lg:flex-row lg:flex-wrap" : "lg:flex-col";

      const crossClassMobile = dirMobile === "horizontal"
        ? (vAlignMobile === "center" ? "items-center" : vAlignMobile === "bottom" ? "items-end" : "items-start")
        : (vAlignMobile === "center" ? "justify-center" : vAlignMobile === "bottom" ? "justify-end" : "justify-start");
      const crossClassTablet = dirTablet === "horizontal"
        ? (vAlignTablet === "center" ? "md:items-center" : vAlignTablet === "bottom" ? "md:items-end" : "md:items-start")
        : (vAlignTablet === "center" ? "md:justify-center" : vAlignTablet === "bottom" ? "md:justify-end" : "md:justify-start");
      const crossClassDesktop = dirDesktop === "horizontal"
        ? (vAlignDesktop === "center" ? "lg:items-center" : vAlignDesktop === "bottom" ? "lg:items-end" : "lg:items-start")
        : (vAlignDesktop === "center" ? "lg:justify-center" : vAlignDesktop === "bottom" ? "lg:justify-end" : "lg:justify-start");

      const alignClassMobile = dirMobile === "horizontal"
        ? (alignMobile === "center" ? "justify-center" : alignMobile === "right" ? "justify-end" : "justify-start")
        : `items-stretch ${alignMobile === "center" ? "text-center" : alignMobile === "right" ? "text-right" : "text-left"}`;
      const alignClassTablet = dirTablet === "horizontal"
        ? (alignTablet === "center" ? "md:justify-center" : alignTablet === "right" ? "md:justify-end" : "md:justify-start")
        : `md:items-stretch ${alignTablet === "center" ? "md:text-center" : alignTablet === "right" ? "md:text-right" : "md:text-left"}`;
      const alignClassDesktop = dirDesktop === "horizontal"
        ? (alignDesktop === "center" ? "lg:justify-center" : alignDesktop === "right" ? "lg:justify-end" : "lg:justify-start")
        : `lg:items-stretch ${alignDesktop === "center" ? "lg:text-center" : alignDesktop === "right" ? "lg:text-right" : "lg:text-left"}`;

      const itemGrowClass = [
        dirMobile === "horizontal" && sizeMobile === "grow" ? "flex-1 basis-0 min-w-0" : "",
        dirTablet === "horizontal" && sizeTablet === "grow" ? "md:flex-1 md:basis-0 md:min-w-0" : "",
        dirDesktop === "horizontal" && sizeDesktop === "grow" ? "lg:flex-1 lg:basis-0 lg:min-w-0" : "",
      ].filter(Boolean).join(" ");
      const blockGapMobile = `${(Number(sectionConfig.mobileBlockGap ?? sectionConfig.blockGap ?? 6) || 0) * 0.25}rem`;
      const blockGapTablet = `${(Number(sectionConfig.tabletBlockGap ?? sectionConfig.blockGap ?? sectionConfig.mobileBlockGap ?? 6) || 0) * 0.25}rem`;
      const blockGapDesktop = `${(Number(sectionConfig.blockGap ?? sectionConfig.tabletBlockGap ?? sectionConfig.mobileBlockGap ?? 6) || 0) * 0.25}rem`;
      const columnGapMobile = `${(Number(sectionConfig.mobileColumnGap ?? sectionConfig.columnGap ?? 6) || 0) * 0.25}rem`;
      const columnGapTablet = `${(Number(sectionConfig.tabletColumnGap ?? sectionConfig.columnGap ?? sectionConfig.mobileColumnGap ?? 6) || 0) * 0.25}rem`;
      const columnGapDesktop = `${(Number(sectionConfig.columnGap ?? sectionConfig.tabletColumnGap ?? sectionConfig.mobileColumnGap ?? 6) || 0) * 0.25}rem`;

      return (
        <div
          id={`footer-inner-section-${widget.id}`}
          className="w-full"
          style={
            {
              ["--fb-is-wgap-m" as any]: blockGapMobile,
              ["--fb-is-wgap-t" as any]: blockGapTablet,
              ["--fb-is-wgap-d" as any]: blockGapDesktop,
              ["--fb-is-cgap-m" as any]: columnGapMobile,
              ["--fb-is-cgap-t" as any]: columnGapTablet,
              ["--fb-is-cgap-d" as any]: columnGapDesktop,
            } as any
          }
        >
          <div
            className={`grid grid-cols-1 ${gridCols} ${gapClass} gap-[var(--fb-is-cgap-m)] md:gap-[var(--fb-is-cgap-t)] lg:gap-[var(--fb-is-cgap-d)]`.trim()}
          >
            {Array.from({ length: colCount }).map((_, colIndex) => {
              const colChildren = activeChildren
                .filter((c: any) => (Number(c?.config?.columnIndex) || 0) === colIndex);
              return (
                <div
                  key={`${widget.id}_inner_col_${colIndex}`}
                  className={`min-w-0 flex ${directionClassMobile} ${alignClassMobile} ${crossClassMobile} ${directionClassTablet} ${alignClassTablet} ${crossClassTablet} ${directionClassDesktop} ${alignClassDesktop} ${crossClassDesktop} gap-[var(--fb-is-wgap-m)] md:gap-[var(--fb-is-wgap-t)] lg:gap-[var(--fb-is-wgap-d)]`.trim()}
                >
                  {colChildren.map((c: any) => renderWidgetWithSpacing(c, { growClass: itemGrowClass }))}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (widget.type === "footer_copyright") {
      const rawTemplate =
        typeof config.text === "string" && config.text.trim() !== ""
          ? config.text
          : `© {year} {siteName}. All rights reserved.`;
      const resolvedText = rawTemplate
        .replaceAll("{year}", String(currentYear))
        .replaceAll("{{year}}", String(currentYear))
        .replaceAll("{siteName}", siteName)
        .replaceAll("{{siteName}}", siteName)
        .replaceAll("{site_name}", siteName)
        .replaceAll("{{site_name}}", siteName);

      const scalar = (raw: unknown) => {
        if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
        if (typeof raw === "string" && raw.trim() !== "") return raw.trim();
        return undefined;
      };
      const desktopColor = resolveOptionalColor(getResponsive(config, "textColor", "desktop")) || "#6b7280";
      const tabletColor = resolveOptionalColor(getResponsive(config, "textColor", "tablet")) || desktopColor;
      const mobileColor = resolveOptionalColor(getResponsive(config, "textColor", "mobile")) || desktopColor;
      const desktopSize = resolveOptionalPx(getResponsive(config, "textFontSize", "desktop")) || "14px";
      const tabletSize = resolveOptionalPx(getResponsive(config, "textFontSize", "tablet")) || desktopSize;
      const mobileSize = resolveOptionalPx(getResponsive(config, "textFontSize", "mobile")) || desktopSize;
      const desktopLineHeight = scalar(getResponsive(config, "textLineHeight", "desktop")) || "1.5";
      const tabletLineHeight = scalar(getResponsive(config, "textLineHeight", "tablet")) || desktopLineHeight;
      const mobileLineHeight = scalar(getResponsive(config, "textLineHeight", "mobile")) || desktopLineHeight;
      const desktopWeight = scalar(getResponsive(config, "textFontWeight", "desktop")) || "400";
      const tabletWeight = scalar(getResponsive(config, "textFontWeight", "tablet")) || desktopWeight;
      const mobileWeight = scalar(getResponsive(config, "textFontWeight", "mobile")) || desktopWeight;

      const normalizeAlign = (raw: unknown) => (raw === "center" || raw === "right" || raw === "left" ? raw : "left");
      const alignDesktop = normalizeAlign(getResponsive(config, "textAlign", "desktop"));
      const alignTablet = normalizeAlign(getResponsive(config, "textAlign", "tablet"));
      const alignMobile = normalizeAlign(getResponsive(config, "textAlign", "mobile"));
      const alignClassMobile = alignMobile === "center" ? "text-center" : alignMobile === "right" ? "text-right" : "text-left";
      const alignClassTablet = alignTablet === "center" ? "md:text-center" : alignTablet === "right" ? "md:text-right" : "md:text-left";
      const alignClassDesktop = alignDesktop === "center" ? "lg:text-center" : alignDesktop === "right" ? "lg:text-right" : "lg:text-left";

      const styleVars: React.CSSProperties = {
        ["--fb-fc-color-desktop" as any]: desktopColor,
        ["--fb-fc-color-tablet" as any]: tabletColor,
        ["--fb-fc-color-mobile" as any]: mobileColor,
        ["--fb-fc-size-desktop" as any]: desktopSize,
        ["--fb-fc-size-tablet" as any]: tabletSize,
        ["--fb-fc-size-mobile" as any]: mobileSize,
        ["--fb-fc-lh-desktop" as any]: desktopLineHeight,
        ["--fb-fc-lh-tablet" as any]: tabletLineHeight,
        ["--fb-fc-lh-mobile" as any]: mobileLineHeight,
        ["--fb-fc-fw-desktop" as any]: desktopWeight,
        ["--fb-fc-fw-tablet" as any]: tabletWeight,
        ["--fb-fc-fw-mobile" as any]: mobileWeight,
      };

      return (
        <div
          style={styleVars}
          className={`footer-copyright-text max-w-full break-words whitespace-normal ${alignClassMobile} ${alignClassTablet} ${alignClassDesktop} [color:var(--fb-fc-color-mobile,var(--fb-fc-color-desktop,#6b7280))] md:[color:var(--fb-fc-color-tablet,var(--fb-fc-color-desktop,#6b7280))] lg:[color:var(--fb-fc-color-desktop,#6b7280)] text-[length:var(--fb-fc-size-mobile,var(--fb-fc-size-desktop,14px))] md:text-[length:var(--fb-fc-size-tablet,var(--fb-fc-size-desktop,14px))] lg:text-[length:var(--fb-fc-size-desktop,14px)] leading-[var(--fb-fc-lh-mobile,var(--fb-fc-lh-desktop,1.5))] md:leading-[var(--fb-fc-lh-tablet,var(--fb-fc-lh-desktop,1.5))] lg:leading-[var(--fb-fc-lh-desktop,1.5)] font-[var(--fb-fc-fw-mobile,var(--fb-fc-fw-desktop,400))] md:font-[var(--fb-fc-fw-tablet,var(--fb-fc-fw-desktop,400))] lg:font-[var(--fb-fc-fw-desktop,400)]`.trim()}
        >
          {resolvedText}
        </div>
      );
    }

    return null;
  };

  return (
    <footer className="classic-footer-root text-white mt-auto" suppressHydrationWarning>
      <div className="w-full">
        {sections.map((section) => {
          const sectionConfig = section?.config || {};
          const dirMobile = sectionConfig.mobileChildrenDirection === "horizontal" ? "horizontal" : "vertical";
          const dirTablet = sectionConfig.tabletChildrenDirection === "horizontal" ? "horizontal" : "vertical";
          const dirDesktop = sectionConfig.childrenDirection === "horizontal" ? "horizontal" : "vertical";

          const alignMobile = sectionConfig.mobileChildrenAlign === "right" ? "right" : sectionConfig.mobileChildrenAlign === "center" ? "center" : "left";
          const alignTablet = sectionConfig.tabletChildrenAlign === "right" ? "right" : sectionConfig.tabletChildrenAlign === "center" ? "center" : "left";
          const alignDesktop = sectionConfig.childrenAlign === "right" ? "right" : sectionConfig.childrenAlign === "center" ? "center" : "left";

          const vAlignMobile = sectionConfig.mobileChildrenVerticalAlign === "bottom" ? "bottom" : sectionConfig.mobileChildrenVerticalAlign === "center" ? "center" : "top";
          const vAlignTablet = sectionConfig.tabletChildrenVerticalAlign === "bottom" ? "bottom" : sectionConfig.tabletChildrenVerticalAlign === "center" ? "center" : "top";
          const vAlignDesktop = sectionConfig.childrenVerticalAlign === "bottom" ? "bottom" : sectionConfig.childrenVerticalAlign === "center" ? "center" : "top";

          const sizeMobile = sectionConfig.mobileChildrenSizing === "grow" ? "grow" : "auto";
          const sizeTablet = sectionConfig.tabletChildrenSizing === "grow" ? "grow" : "auto";
          const sizeDesktop = sectionConfig.childrenSizing === "grow" ? "grow" : "auto";

          const directionClassMobile = dirMobile === "horizontal" ? "flex-row flex-wrap" : "flex-col";
          const directionClassTablet = dirTablet === "horizontal" ? "md:flex-row md:flex-wrap" : "md:flex-col";
          const directionClassDesktop = dirDesktop === "horizontal" ? "lg:flex-row lg:flex-wrap" : "lg:flex-col";

          const crossClassMobile = dirMobile === "horizontal"
            ? (vAlignMobile === "center" ? "items-center" : vAlignMobile === "bottom" ? "items-end" : "items-start")
            : (vAlignMobile === "center" ? "justify-center" : vAlignMobile === "bottom" ? "justify-end" : "justify-start");
          const crossClassTablet = dirTablet === "horizontal"
            ? (vAlignTablet === "center" ? "md:items-center" : vAlignTablet === "bottom" ? "md:items-end" : "md:items-start")
            : (vAlignTablet === "center" ? "md:justify-center" : vAlignTablet === "bottom" ? "md:justify-end" : "md:justify-start");
          const crossClassDesktop = dirDesktop === "horizontal"
            ? (vAlignDesktop === "center" ? "lg:items-center" : vAlignDesktop === "bottom" ? "lg:items-end" : "lg:items-start")
            : (vAlignDesktop === "center" ? "lg:justify-center" : vAlignDesktop === "bottom" ? "lg:justify-end" : "lg:justify-start");

          const alignClassMobile = dirMobile === "horizontal"
            ? (alignMobile === "center" ? "justify-center" : alignMobile === "right" ? "justify-end" : "justify-start")
            : `items-stretch ${alignMobile === "center" ? "text-center" : alignMobile === "right" ? "text-right" : "text-left"}`;
          const alignClassTablet = dirTablet === "horizontal"
            ? (alignTablet === "center" ? "md:justify-center" : alignTablet === "right" ? "md:justify-end" : "md:justify-start")
            : `md:items-stretch ${alignTablet === "center" ? "md:text-center" : alignTablet === "right" ? "md:text-right" : "md:text-left"}`;
          const alignClassDesktop = dirDesktop === "horizontal"
            ? (alignDesktop === "center" ? "lg:justify-center" : alignDesktop === "right" ? "lg:justify-end" : "lg:justify-start")
            : `lg:items-stretch ${alignDesktop === "center" ? "lg:text-center" : alignDesktop === "right" ? "lg:text-right" : "lg:text-left"}`;

          const itemGrowClass = [
            dirMobile === "horizontal" && sizeMobile === "grow" ? "flex-1 basis-0 min-w-0" : "",
            dirTablet === "horizontal" && sizeTablet === "grow" ? "md:flex-1 md:basis-0 md:min-w-0" : "",
            dirDesktop === "horizontal" && sizeDesktop === "grow" ? "lg:flex-1 lg:basis-0 lg:min-w-0" : "",
          ].filter(Boolean).join(" ");
          const useBoxMobile = isTruthy(sectionConfig.mobileUseBox ?? sectionConfig.useBox);
          const useBoxTablet = isTruthy(sectionConfig.tabletUseBox ?? sectionConfig.useBox ?? sectionConfig.mobileUseBox);
          const useBoxDesktop = isTruthy(sectionConfig.useBox ?? sectionConfig.tabletUseBox ?? sectionConfig.mobileUseBox);

          const ptD = resolveOptionalPx(getResponsive(sectionConfig, "paddingTop", "desktop"));
          const pbD = resolveOptionalPx(getResponsive(sectionConfig, "paddingBottom", "desktop"));
          const plD = resolveOptionalPx(getResponsive(sectionConfig, "paddingLeft", "desktop"));
          const prD = resolveOptionalPx(getResponsive(sectionConfig, "paddingRight", "desktop"));
          const ptT = resolveOptionalPx(getResponsive(sectionConfig, "paddingTop", "tablet")) ?? ptD;
          const pbT = resolveOptionalPx(getResponsive(sectionConfig, "paddingBottom", "tablet")) ?? pbD;
          const plT = resolveOptionalPx(getResponsive(sectionConfig, "paddingLeft", "tablet")) ?? plD;
          const prT = resolveOptionalPx(getResponsive(sectionConfig, "paddingRight", "tablet")) ?? prD;
          const ptM = resolveOptionalPx(getResponsive(sectionConfig, "paddingTop", "mobile")) ?? ptT;
          const pbM = resolveOptionalPx(getResponsive(sectionConfig, "paddingBottom", "mobile")) ?? pbT;
          const plM = resolveOptionalPx(getResponsive(sectionConfig, "paddingLeft", "mobile")) ?? plT;
          const prM = resolveOptionalPx(getResponsive(sectionConfig, "paddingRight", "mobile")) ?? prT;

          const mtD = resolveOptionalPx(getResponsive(sectionConfig, "marginTop", "desktop")) ?? "0px";
          const mbD = resolveOptionalPx(getResponsive(sectionConfig, "marginBottom", "desktop")) ?? "0px";
          const mlD = resolveOptionalPx(getResponsive(sectionConfig, "marginLeft", "desktop")) ?? "0px";
          const mrD = resolveOptionalPx(getResponsive(sectionConfig, "marginRight", "desktop")) ?? "0px";
          const mtT = resolveOptionalPx(getResponsive(sectionConfig, "marginTop", "tablet")) ?? mtD;
          const mbT = resolveOptionalPx(getResponsive(sectionConfig, "marginBottom", "tablet")) ?? mbD;
          const mlT = resolveOptionalPx(getResponsive(sectionConfig, "marginLeft", "tablet")) ?? mlD;
          const mrT = resolveOptionalPx(getResponsive(sectionConfig, "marginRight", "tablet")) ?? mrD;
          const mtM = resolveOptionalPx(getResponsive(sectionConfig, "marginTop", "mobile")) ?? mtT;
          const mbM = resolveOptionalPx(getResponsive(sectionConfig, "marginBottom", "mobile")) ?? mbT;
          const mlM = resolveOptionalPx(getResponsive(sectionConfig, "marginLeft", "mobile")) ?? mlT;
          const mrM = resolveOptionalPx(getResponsive(sectionConfig, "marginRight", "mobile")) ?? mrT;

          const rawBgD = getResponsive(sectionConfig, "backgroundColor", "desktop");
          const rawBgT = getResponsive(sectionConfig, "backgroundColor", "tablet");
          const rawBgM = getResponsive(sectionConfig, "backgroundColor", "mobile");
          const bgM = normalizeColor(rawBgM, useBoxMobile ? "rgba(255,255,255,0.06)" : "transparent");
          const bgT = normalizeColor(rawBgT, bgM);
          const bgD = normalizeColor(rawBgD, bgT);

          const bgImgM = sanitizeCssUrl(resolveOptionalUrl(getResponsive(sectionConfig, "backgroundImage", "mobile")) || "");
          const bgImgT = sanitizeCssUrl(resolveOptionalUrl(getResponsive(sectionConfig, "backgroundImage", "tablet")) || bgImgM);
          const bgImgD = sanitizeCssUrl(resolveOptionalUrl(getResponsive(sectionConfig, "backgroundImage", "desktop")) || bgImgT);
          const hasBgImage = [bgImgM, bgImgT, bgImgD].some((x) => typeof x === "string" && x.trim() !== "");

          const rawOverlayD = getResponsive(sectionConfig, "overlayColor", "desktop");
          const rawOverlayT = getResponsive(sectionConfig, "overlayColor", "tablet");
          const rawOverlayM = getResponsive(sectionConfig, "overlayColor", "mobile");
          const overlayM = resolveOptionalColor(rawOverlayM) || "";
          const overlayT = resolveOptionalColor(rawOverlayT) || overlayM;
          const overlayD = resolveOptionalColor(rawOverlayD) || overlayT;

          const sizeM = resolveOptionalColor(getResponsive(sectionConfig, "backgroundSize", "mobile")) || "cover";
          const sizeT = resolveOptionalColor(getResponsive(sectionConfig, "backgroundSize", "tablet")) || sizeM;
          const sizeD = resolveOptionalColor(getResponsive(sectionConfig, "backgroundSize", "desktop")) || sizeT;

          const normalizeWidthMode = (raw: unknown) => {
            const v = String(raw ?? "").trim().toLowerCase();
            return v === "full" || v === "boxed" || v === "custom" ? v : "boxed";
          };

          const widthModeM = normalizeWidthMode(sectionConfig.mobileContainerWidth ?? sectionConfig.containerWidth ?? "boxed");
          const widthModeT = normalizeWidthMode(sectionConfig.tabletContainerWidth ?? sectionConfig.containerWidth ?? sectionConfig.mobileContainerWidth ?? widthModeM);
          const widthModeD = normalizeWidthMode(sectionConfig.containerWidth ?? sectionConfig.tabletContainerWidth ?? sectionConfig.mobileContainerWidth ?? widthModeT);
          const customWM = formatSize(sectionConfig.mobileCustomContainerWidth ?? sectionConfig.customContainerWidth, "1200px");
          const customWT = formatSize(sectionConfig.tabletCustomContainerWidth ?? sectionConfig.customContainerWidth ?? sectionConfig.mobileCustomContainerWidth, "1200px");
          const customWD = formatSize(sectionConfig.customContainerWidth ?? sectionConfig.tabletCustomContainerWidth ?? sectionConfig.mobileCustomContainerWidth, "1200px");
          const maxWM = widthModeM === "full" ? "none" : widthModeM === "custom" ? customWM : "1100px";
          const maxWT = widthModeT === "full" ? "none" : widthModeT === "custom" ? customWT : "1100px";
          const maxWD = widthModeD === "full" ? "none" : widthModeD === "custom" ? customWD : "1100px";
          const padXM = widthModeM === "full" ? "0px" : "16px";
          const padXT = widthModeT === "full" ? "0px" : "16px";
          const padXD = widthModeD === "full" ? "0px" : "16px";

          const radiusBase = String(sectionConfig.borderRadius ?? "none");
          const radiusM = useBoxMobile ? getRadius(String(sectionConfig.mobileBorderRadius ?? radiusBase)) : "0";
          const radiusT = useBoxTablet ? getRadius(String(sectionConfig.tabletBorderRadius ?? radiusBase ?? sectionConfig.mobileBorderRadius ?? "none")) : "0";
          const radiusD = useBoxDesktop ? getRadius(String(radiusBase ?? sectionConfig.tabletBorderRadius ?? sectionConfig.mobileBorderRadius ?? "none")) : "0";

          const boxPYM = useBoxMobile ? formatSpacing(sectionConfig.mobileBoxPaddingY ?? sectionConfig.boxPaddingY) ?? "0px" : "0px";
          const boxPYT = useBoxTablet ? formatSpacing(sectionConfig.tabletBoxPaddingY ?? sectionConfig.boxPaddingY ?? sectionConfig.mobileBoxPaddingY) ?? boxPYM : "0px";
          const boxPYD = useBoxDesktop ? formatSpacing(sectionConfig.boxPaddingY ?? sectionConfig.tabletBoxPaddingY ?? sectionConfig.mobileBoxPaddingY) ?? boxPYT : "0px";
          const boxPXM = useBoxMobile ? formatSpacing(sectionConfig.mobileBoxPaddingX ?? sectionConfig.boxPaddingX) ?? "0px" : "0px";
          const boxPXT = useBoxTablet ? formatSpacing(sectionConfig.tabletBoxPaddingX ?? sectionConfig.boxPaddingX ?? sectionConfig.mobileBoxPaddingX) ?? boxPXM : "0px";
          const boxPXD = useBoxDesktop ? formatSpacing(sectionConfig.boxPaddingX ?? sectionConfig.tabletBoxPaddingX ?? sectionConfig.mobileBoxPaddingX) ?? boxPXT : "0px";

          const borderStyleValueMobile = String(sectionConfig.mobileBorderStyle ?? sectionConfig.tabletBorderStyle ?? sectionConfig.borderStyle ?? "solid");
          const borderStyleValueTablet = String(sectionConfig.tabletBorderStyle ?? sectionConfig.borderStyle ?? borderStyleValueMobile);
          const borderStyleValueDesktop = String(sectionConfig.borderStyle ?? borderStyleValueTablet);
          const borderColorValueMobile = String(sectionConfig.mobileBorderColor ?? sectionConfig.tabletBorderColor ?? sectionConfig.borderColor ?? "var(--border, #e5e7eb)");
          const borderColorValueTablet = String(sectionConfig.tabletBorderColor ?? sectionConfig.borderColor ?? borderColorValueMobile);
          const borderColorValueDesktop = String(sectionConfig.borderColor ?? borderColorValueTablet);
          const btValueMobile = Number(sectionConfig.mobileBorderTopWidth ?? sectionConfig.tabletBorderTopWidth ?? sectionConfig.borderTopWidth ?? 0);
          const bbValueMobile = Number(sectionConfig.mobileBorderBottomWidth ?? sectionConfig.tabletBorderBottomWidth ?? sectionConfig.borderBottomWidth ?? 0);
          const blValueMobile = Number(sectionConfig.mobileBorderLeftWidth ?? sectionConfig.tabletBorderLeftWidth ?? sectionConfig.borderLeftWidth ?? 0);
          const brValueMobile = Number(sectionConfig.mobileBorderRightWidth ?? sectionConfig.tabletBorderRightWidth ?? sectionConfig.borderRightWidth ?? 0);
          const btValueTablet = Number(sectionConfig.tabletBorderTopWidth ?? sectionConfig.borderTopWidth ?? 0);
          const bbValueTablet = Number(sectionConfig.tabletBorderBottomWidth ?? sectionConfig.borderBottomWidth ?? 0);
          const blValueTablet = Number(sectionConfig.tabletBorderLeftWidth ?? sectionConfig.borderLeftWidth ?? 0);
          const brValueTablet = Number(sectionConfig.tabletBorderRightWidth ?? sectionConfig.borderRightWidth ?? 0);
          const btValueDesktop = Number(sectionConfig.borderTopWidth ?? 0);
          const bbValueDesktop = Number(sectionConfig.borderBottomWidth ?? 0);
          const blValueDesktop = Number(sectionConfig.borderLeftWidth ?? 0);
          const brValueDesktop = Number(sectionConfig.borderRightWidth ?? 0);
          const shadowMobile = getShadow(String(sectionConfig.mobileBoxShadow ?? sectionConfig.tabletBoxShadow ?? sectionConfig.boxShadow ?? "none"));
          const shadowTablet = getShadow(String(sectionConfig.tabletBoxShadow ?? sectionConfig.boxShadow ?? "none"));
          const shadowDesktop = getShadow(String(sectionConfig.boxShadow ?? "none"));
          const hasBorderMobile = btValueMobile > 0 || bbValueMobile > 0 || blValueMobile > 0 || brValueMobile > 0;
          const hasBorderTablet = btValueTablet > 0 || bbValueTablet > 0 || blValueTablet > 0 || brValueTablet > 0;
          const hasBorderDesktop = btValueDesktop > 0 || bbValueDesktop > 0 || blValueDesktop > 0 || brValueDesktop > 0;
          const frameMobile = useBoxMobile || hasBorderMobile || shadowMobile !== "none";
          const frameTablet = useBoxTablet || hasBorderTablet || shadowTablet !== "none";
          const frameDesktop = useBoxDesktop || hasBorderDesktop || shadowDesktop !== "none";
          const styleMobile = borderStyleValueMobile.trim().toLowerCase();
          const styleTablet = borderStyleValueTablet.trim().toLowerCase();
          const styleDesktop = borderStyleValueDesktop.trim().toLowerCase();
          const borderStyleMobile = frameMobile ? (hasBorderMobile && styleMobile === "none" ? "solid" : borderStyleValueMobile) : "none";
          const borderStyleTablet = frameTablet ? (hasBorderTablet && styleTablet === "none" ? "solid" : borderStyleValueTablet) : "none";
          const borderStyleDesktop = frameDesktop ? (hasBorderDesktop && styleDesktop === "none" ? "solid" : borderStyleValueDesktop) : "none";
          const borderColorMobile = frameMobile ? borderColorValueMobile : "transparent";
          const borderColorTablet = frameTablet ? borderColorValueTablet : "transparent";
          const borderColorDesktop = frameDesktop ? borderColorValueDesktop : "transparent";
          const btMobile = frameMobile ? `${btValueMobile}px` : "0px";
          const bbMobile = frameMobile ? `${bbValueMobile}px` : "0px";
          const blMobile = frameMobile ? `${blValueMobile}px` : "0px";
          const brMobile = frameMobile ? `${brValueMobile}px` : "0px";
          const btTablet = frameTablet ? `${btValueTablet}px` : "0px";
          const bbTablet = frameTablet ? `${bbValueTablet}px` : "0px";
          const blTablet = frameTablet ? `${blValueTablet}px` : "0px";
          const brTablet = frameTablet ? `${brValueTablet}px` : "0px";
          const btDesktop = frameDesktop ? `${btValueDesktop}px` : "0px";
          const bbDesktop = frameDesktop ? `${bbValueDesktop}px` : "0px";
          const blDesktop = frameDesktop ? `${blValueDesktop}px` : "0px";
          const brDesktop = frameDesktop ? `${brValueDesktop}px` : "0px";

          const colCount = getColumnCount(section?.config?.layout);
          const gridCols = getGridColsClass(colCount);
          const gapClass = getGapClass(section?.config?.gap);
          const children = Array.isArray(section?.config?.children) ? section.config.children : [];
          const blockGapMobile = `${(Number(sectionConfig.mobileBlockGap ?? sectionConfig.blockGap ?? 6) || 0) * 0.25}rem`;
          const blockGapTablet = `${(Number(sectionConfig.tabletBlockGap ?? sectionConfig.blockGap ?? sectionConfig.mobileBlockGap ?? 6) || 0) * 0.25}rem`;
          const blockGapDesktop = `${(Number(sectionConfig.blockGap ?? sectionConfig.tabletBlockGap ?? sectionConfig.mobileBlockGap ?? 6) || 0) * 0.25}rem`;
          const columnGapMobile = `${(Number(sectionConfig.mobileColumnGap ?? sectionConfig.columnGap ?? 6) || 0) * 0.25}rem`;
          const columnGapTablet = `${(Number(sectionConfig.tabletColumnGap ?? sectionConfig.columnGap ?? sectionConfig.mobileColumnGap ?? 6) || 0) * 0.25}rem`;
          const columnGapDesktop = `${(Number(sectionConfig.columnGap ?? sectionConfig.tabletColumnGap ?? sectionConfig.mobileColumnGap ?? 6) || 0) * 0.25}rem`;

          const sectionStyle = {
            ["--fb-sec-pt-m" as any]: ptM,
            ["--fb-sec-pb-m" as any]: pbM,
            ["--fb-sec-pl-m" as any]: plM,
            ["--fb-sec-pr-m" as any]: prM,
            ["--fb-sec-pt-t" as any]: ptT,
            ["--fb-sec-pb-t" as any]: pbT,
            ["--fb-sec-pl-t" as any]: plT,
            ["--fb-sec-pr-t" as any]: prT,
            ["--fb-sec-pt-d" as any]: ptD,
            ["--fb-sec-pb-d" as any]: pbD,
            ["--fb-sec-pl-d" as any]: plD,
            ["--fb-sec-pr-d" as any]: prD,
            ["--fb-sec-mt-m" as any]: mtM,
            ["--fb-sec-mb-m" as any]: mbM,
            ["--fb-sec-ml-m" as any]: mlM,
            ["--fb-sec-mr-m" as any]: mrM,
            ["--fb-sec-mt-t" as any]: mtT,
            ["--fb-sec-mb-t" as any]: mbT,
            ["--fb-sec-ml-t" as any]: mlT,
            ["--fb-sec-mr-t" as any]: mrT,
            ["--fb-sec-mt-d" as any]: mtD,
            ["--fb-sec-mb-d" as any]: mbD,
            ["--fb-sec-ml-d" as any]: mlD,
            ["--fb-sec-mr-d" as any]: mrD,
            ["--fb-sec-bg-m" as any]: bgM,
            ["--fb-sec-bg-t" as any]: bgT,
            ["--fb-sec-bg-d" as any]: bgD,
            ["--fb-sec-bgimg-m" as any]: bgImgM ? `url("${bgImgM}")` : "none",
            ["--fb-sec-bgimg-t" as any]: bgImgT ? `url("${bgImgT}")` : "none",
            ["--fb-sec-bgimg-d" as any]: bgImgD ? `url("${bgImgD}")` : "none",
            ["--fb-sec-bgsize-m" as any]: bgImgM ? sizeM : "auto",
            ["--fb-sec-bgsize-t" as any]: bgImgT ? sizeT : "auto",
            ["--fb-sec-bgsize-d" as any]: bgImgD ? sizeD : "auto",
            ["--fb-sec-ov-m" as any]: overlayM || "transparent",
            ["--fb-sec-ov-t" as any]: overlayT || overlayM || "transparent",
            ["--fb-sec-ov-d" as any]: overlayD || overlayT || overlayM || "transparent",
            ["--fb-sec-maxw-m" as any]: maxWM,
            ["--fb-sec-maxw-t" as any]: maxWT,
            ["--fb-sec-maxw-d" as any]: maxWD,
            ["--fb-sec-padx-m" as any]: padXM,
            ["--fb-sec-padx-t" as any]: padXT,
            ["--fb-sec-padx-d" as any]: padXD,
            ["--fb-sec-radius-m" as any]: radiusM,
            ["--fb-sec-radius-t" as any]: radiusT,
            ["--fb-sec-radius-d" as any]: radiusD,
            ["--fb-sec-border-style-m" as any]: borderStyleMobile,
            ["--fb-sec-border-style-t" as any]: borderStyleTablet,
            ["--fb-sec-border-style-d" as any]: borderStyleDesktop,
            ["--fb-sec-border-color-m" as any]: borderColorMobile,
            ["--fb-sec-border-color-t" as any]: borderColorTablet,
            ["--fb-sec-border-color-d" as any]: borderColorDesktop,
            ["--fb-sec-bt-m" as any]: btMobile,
            ["--fb-sec-bb-m" as any]: bbMobile,
            ["--fb-sec-bl-m" as any]: blMobile,
            ["--fb-sec-br-m" as any]: brMobile,
            ["--fb-sec-bt-t" as any]: btTablet,
            ["--fb-sec-bb-t" as any]: bbTablet,
            ["--fb-sec-bl-t" as any]: blTablet,
            ["--fb-sec-br-t" as any]: brTablet,
            ["--fb-sec-bt-d" as any]: btDesktop,
            ["--fb-sec-bb-d" as any]: bbDesktop,
            ["--fb-sec-bl-d" as any]: blDesktop,
            ["--fb-sec-br-d" as any]: brDesktop,
            ["--fb-sec-shadow-m" as any]: frameMobile ? shadowMobile : "none",
            ["--fb-sec-shadow-t" as any]: frameTablet ? shadowTablet : "none",
            ["--fb-sec-shadow-d" as any]: frameDesktop ? shadowDesktop : "none",
            ["--fb-sec-boxpy-m" as any]: boxPYM,
            ["--fb-sec-boxpy-t" as any]: boxPYT,
            ["--fb-sec-boxpy-d" as any]: boxPYD,
            ["--fb-sec-boxpx-m" as any]: boxPXM,
            ["--fb-sec-boxpx-t" as any]: boxPXT,
            ["--fb-sec-boxpx-d" as any]: boxPXD,
            ["--fb-sec-wgap-m" as any]: blockGapMobile,
            ["--fb-sec-wgap-t" as any]: blockGapTablet,
            ["--fb-sec-wgap-d" as any]: blockGapDesktop,
            ["--fb-sec-cgap-m" as any]: columnGapMobile,
            ["--fb-sec-cgap-t" as any]: columnGapTablet,
            ["--fb-sec-cgap-d" as any]: columnGapDesktop,
          } as any;

          return (
            <Fragment key={section.id}>
              <section
                id={`footer-section-${section.id}`}
                className="relative w-full mt-[var(--fb-sec-mt-m)] mr-[var(--fb-sec-mr-m)] mb-[var(--fb-sec-mb-m)] ml-[var(--fb-sec-ml-m)] md:mt-[var(--fb-sec-mt-t)] md:mr-[var(--fb-sec-mr-t)] md:mb-[var(--fb-sec-mb-t)] md:ml-[var(--fb-sec-ml-t)] lg:mt-[var(--fb-sec-mt-d)] lg:mr-[var(--fb-sec-mr-d)] lg:mb-[var(--fb-sec-mb-d)] lg:ml-[var(--fb-sec-ml-d)]"
                style={sectionStyle}
              >
                <div
                  id={`footer-section-container-${section.id}`}
                  className="w-full mx-auto max-w-[var(--fb-sec-maxw-m)] md:max-w-[var(--fb-sec-maxw-t)] lg:max-w-[var(--fb-sec-maxw-d)] px-[var(--fb-sec-padx-m)] md:px-[var(--fb-sec-padx-t)] lg:px-[var(--fb-sec-padx-d)]"
                >
                <div id={`footer-section-surface-${section.id}`} className="relative w-full bg-[var(--fb-sec-bg-m)] md:bg-[var(--fb-sec-bg-t)] lg:bg-[var(--fb-sec-bg-d)] bg-[image:var(--fb-sec-bgimg-m)] md:bg-[image:var(--fb-sec-bgimg-t)] lg:bg-[image:var(--fb-sec-bgimg-d)] bg-no-repeat bg-center [background-size:var(--fb-sec-bgsize-m)] md:[background-size:var(--fb-sec-bgsize-t)] lg:[background-size:var(--fb-sec-bgsize-d)] pt-[var(--fb-sec-pt-m)] pb-[var(--fb-sec-pb-m)] pl-[var(--fb-sec-pl-m)] pr-[var(--fb-sec-pr-m)] md:pt-[var(--fb-sec-pt-t)] md:pb-[var(--fb-sec-pb-t)] md:pl-[var(--fb-sec-pl-t)] md:pr-[var(--fb-sec-pr-t)] lg:pt-[var(--fb-sec-pt-d)] lg:pb-[var(--fb-sec-pb-d)] lg:pl-[var(--fb-sec-pl-d)] lg:pr-[var(--fb-sec-pr-d)] [border-top-style:var(--fb-sec-border-style-m)] [border-bottom-style:var(--fb-sec-border-style-m)] [border-left-style:var(--fb-sec-border-style-m)] [border-right-style:var(--fb-sec-border-style-m)] md:[border-top-style:var(--fb-sec-border-style-t)] md:[border-bottom-style:var(--fb-sec-border-style-t)] md:[border-left-style:var(--fb-sec-border-style-t)] md:[border-right-style:var(--fb-sec-border-style-t)] lg:[border-top-style:var(--fb-sec-border-style-d)] lg:[border-bottom-style:var(--fb-sec-border-style-d)] lg:[border-left-style:var(--fb-sec-border-style-d)] lg:[border-right-style:var(--fb-sec-border-style-d)] [border-color:var(--fb-sec-border-color-m)] md:[border-color:var(--fb-sec-border-color-t)] lg:[border-color:var(--fb-sec-border-color-d)] border-t-[var(--fb-sec-bt-m)] border-b-[var(--fb-sec-bb-m)] border-l-[var(--fb-sec-bl-m)] border-r-[var(--fb-sec-br-m)] md:border-t-[var(--fb-sec-bt-t)] md:border-b-[var(--fb-sec-bb-t)] md:border-l-[var(--fb-sec-bl-t)] md:border-r-[var(--fb-sec-br-t)] lg:border-t-[var(--fb-sec-bt-d)] lg:border-b-[var(--fb-sec-bb-d)] lg:border-l-[var(--fb-sec-bl-d)] lg:border-r-[var(--fb-sec-br-d)] shadow-[var(--fb-sec-shadow-m)] md:shadow-[var(--fb-sec-shadow-t)] lg:shadow-[var(--fb-sec-shadow-d)] rounded-[var(--fb-sec-radius-m)] md:rounded-[var(--fb-sec-radius-t)] lg:rounded-[var(--fb-sec-radius-d)] overflow-visible">
                  {hasBgImage && (
                    <div id={`footer-section-overlay-${section.id}`} className="absolute inset-0 pointer-events-none bg-[var(--fb-sec-ov-m)] md:bg-[var(--fb-sec-ov-t)] lg:bg-[var(--fb-sec-ov-d)] rounded-[var(--fb-sec-radius-m)] md:rounded-[var(--fb-sec-radius-t)] lg:rounded-[var(--fb-sec-radius-d)]" />
                  )}
                  <div id={`footer-section-box-content-${section.id}`} className="relative z-10 pt-[var(--fb-sec-boxpy-m)] pb-[var(--fb-sec-boxpy-m)] pl-[var(--fb-sec-boxpx-m)] pr-[var(--fb-sec-boxpx-m)] md:pt-[var(--fb-sec-boxpy-t)] md:pb-[var(--fb-sec-boxpy-t)] md:pl-[var(--fb-sec-boxpx-t)] md:pr-[var(--fb-sec-boxpx-t)] lg:pt-[var(--fb-sec-boxpy-d)] lg:pb-[var(--fb-sec-boxpy-d)] lg:pl-[var(--fb-sec-boxpx-d)] lg:pr-[var(--fb-sec-boxpx-d)]">
                    <div
                      className={`grid grid-cols-1 ${gridCols} ${gapClass} gap-[var(--fb-sec-cgap-m)] md:gap-[var(--fb-sec-cgap-t)] lg:gap-[var(--fb-sec-cgap-d)]`.trim()}
                    >
                      {Array.from({ length: colCount }).map((_, colIndex) => {
                        const colChildren = children
                          .filter((c: any) => (Number(c?.config?.columnIndex) || 0) === colIndex && (c.isActive ?? c.isVisible ?? true));
                        return (
                          <div
                            key={`${section.id}_col_${colIndex}`}
                            className={`min-w-0 flex ${directionClassMobile} ${alignClassMobile} ${crossClassMobile} ${directionClassTablet} ${alignClassTablet} ${crossClassTablet} ${directionClassDesktop} ${alignClassDesktop} ${crossClassDesktop} gap-[var(--fb-sec-wgap-m)] md:gap-[var(--fb-sec-wgap-t)] lg:gap-[var(--fb-sec-wgap-d)]`.trim()}
                          >
                            {colChildren.map((c: any) => renderWidgetWithSpacing(c, { growClass: itemGrowClass }))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                </div>
              </section>
            </Fragment>
          );
        })}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .fb-footer-widget-shell {
              margin-top: var(--fb-w-mt-m, 0px);
              margin-right: var(--fb-w-mr-m, 0px);
              margin-bottom: var(--fb-w-mb-m, 0px);
              margin-left: var(--fb-w-ml-m, 0px);
              padding-top: var(--fb-w-pt-m, 0px);
              padding-right: var(--fb-w-pr-m, 0px);
              padding-bottom: var(--fb-w-pb-m, 0px);
              padding-left: var(--fb-w-pl-m, 0px);
            }
            @media (min-width: 768px) {
              .fb-footer-widget-shell {
                margin-top: var(--fb-w-mt-t, var(--fb-w-mt-m, 0px));
                margin-right: var(--fb-w-mr-t, var(--fb-w-mr-m, 0px));
                margin-bottom: var(--fb-w-mb-t, var(--fb-w-mb-m, 0px));
                margin-left: var(--fb-w-ml-t, var(--fb-w-ml-m, 0px));
                padding-top: var(--fb-w-pt-t, var(--fb-w-pt-m, 0px));
                padding-right: var(--fb-w-pr-t, var(--fb-w-pr-m, 0px));
                padding-bottom: var(--fb-w-pb-t, var(--fb-w-pb-m, 0px));
                padding-left: var(--fb-w-pl-t, var(--fb-w-pl-m, 0px));
              }
            }
            @media (min-width: 1024px) {
              .fb-footer-widget-shell {
                margin-top: var(--fb-w-mt-d, var(--fb-w-mt-t, 0px));
                margin-right: var(--fb-w-mr-d, var(--fb-w-mr-t, 0px));
                margin-bottom: var(--fb-w-mb-d, var(--fb-w-mb-t, 0px));
                margin-left: var(--fb-w-ml-d, var(--fb-w-ml-t, 0px));
                padding-top: var(--fb-w-pt-d, var(--fb-w-pt-t, 0px));
                padding-right: var(--fb-w-pr-d, var(--fb-w-pr-t, 0px));
                padding-bottom: var(--fb-w-pb-d, var(--fb-w-pb-t, 0px));
                padding-left: var(--fb-w-pl-d, var(--fb-w-pl-t, 0px));
              }
            }
          `,
        }}
      />
    </footer>
  );
}
