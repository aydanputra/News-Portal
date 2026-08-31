"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Facebook, Instagram, Link2, Twitter, X, Youtube } from "lucide-react";
import type { PublicMenuItem } from "@/lib/public-menus";
import { sanitizeExternalUrl } from "@/lib/sanitizer";
import { getThemeFontLoadFamilies, resolveThemeFontFamily } from "@/lib/font-utils";

function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.5 2c.3 2.3 1.7 3.9 4 4.2V9c-1.5.1-2.9-.4-4-1.2V15c0 4.1-3.3 7-7.3 7-3.9 0-7.2-3-7.2-7 0-4.7 4.4-8.1 9-6.6v3.2c-2.4-.8-4.6.9-4.6 3.3 0 1.9 1.5 3.4 3.4 3.4 2.1 0 3.6-1.4 3.6-4V2h3.1z" />
    </svg>
  );
}

const limitMobileMenuDepth = (items: PublicMenuItem[]): PublicMenuItem[] =>
  items.map((it) => ({
    ...it,
    children: (it.children || []).map((c) => ({ ...c, children: [] })),
  }));

const getResponsiveConfigValue = (config: any, key: string) => {
  const mobileKey = `mobile${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  const tabletKey = `tablet${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  return config?.[mobileKey] ?? config?.[tabletKey] ?? config?.[key];
};

const toOptionalCssSize = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
  return trimmed;
};

const toOptionalLineHeight = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

const toOptionalFontWeight = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

interface HeaderMobileDrawerProps {
  open: boolean;
  onClose: () => void;
  items: PublicMenuItem[];
  config?: any;
  siteName: string;
  logoUrl?: string;
}

export default function HeaderMobileDrawer({
  open,
  onClose,
  items,
  config,
  siteName,
  logoUrl,
}: HeaderMobileDrawerProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const limited = useMemo(() => limitMobileMenuDepth(items), [items]);

  const overlayOpacityRaw = config?.drawerOverlayOpacity;
  const overlayOpacity =
    typeof overlayOpacityRaw === "number" && Number.isFinite(overlayOpacityRaw)
      ? Math.max(0, Math.min(1, overlayOpacityRaw / 100))
      : typeof overlayOpacityRaw === "string" && overlayOpacityRaw.trim() !== "" && Number.isFinite(Number(overlayOpacityRaw))
        ? Math.max(0, Math.min(1, Number(overlayOpacityRaw) / 100))
        : 0.3;

  const drawerWidthRaw = config?.drawerWidthPercent;
  const drawerWidthPercent =
    typeof drawerWidthRaw === "number" && Number.isFinite(drawerWidthRaw)
      ? Math.max(40, Math.min(95, drawerWidthRaw))
      : typeof drawerWidthRaw === "string" && drawerWidthRaw.trim() !== "" && Number.isFinite(Number(drawerWidthRaw))
        ? Math.max(40, Math.min(95, Number(drawerWidthRaw)))
        : 85;

  const drawerMaxWidthRaw = config?.drawerMaxWidth;
  const drawerMaxWidth =
    typeof drawerMaxWidthRaw === "number" && Number.isFinite(drawerMaxWidthRaw)
      ? `${drawerMaxWidthRaw}px`
      : typeof drawerMaxWidthRaw === "string" && drawerMaxWidthRaw.trim() !== ""
        ? /^\d+$/.test(drawerMaxWidthRaw.trim())
          ? `${drawerMaxWidthRaw.trim()}px`
          : drawerMaxWidthRaw.trim()
        : "420px";

  const durationRaw = config?.drawerTransitionMs;
  const durationMs =
    typeof durationRaw === "number" && Number.isFinite(durationRaw)
      ? Math.max(80, Math.min(1200, durationRaw))
      : typeof durationRaw === "string" && durationRaw.trim() !== "" && Number.isFinite(Number(durationRaw))
        ? Math.max(80, Math.min(1200, Number(durationRaw)))
        : 320;

  const side = config?.drawerSide === "right" ? "right" : "left";
  const effect = config?.drawerEffect === "fade" ? "fade" : "slide";
  const headerContent =
    config?.drawerHeaderContent === "search" ? "search" : config?.drawerHeaderContent === "logo" ? "logo" : "none";
  const drawerSearchPlaceholder =
    typeof config?.drawerSearchPlaceholder === "string" && config.drawerSearchPlaceholder.trim() !== ""
      ? config.drawerSearchPlaceholder.trim()
      : "Cari berita...";
  const drawerSearchButtonLabel =
    typeof config?.drawerSearchButtonLabel === "string" && config.drawerSearchButtonLabel.trim() !== ""
      ? config.drawerSearchButtonLabel.trim()
      : "Cari";

  const footerText = typeof config?.drawerFooterText === "string" ? config.drawerFooterText.trim() : "";
  const drawerMenuFontSize = toOptionalCssSize(getResponsiveConfigValue(config, "drawerMenuFontSize"));
  const drawerMenuLineHeight = toOptionalLineHeight(getResponsiveConfigValue(config, "drawerMenuLineHeight"));
  const drawerMenuFontWeight = toOptionalFontWeight(getResponsiveConfigValue(config, "drawerMenuFontWeight"));
  const drawerMenuFontFamilyRaw = getResponsiveConfigValue(config, "drawerMenuFontFamily");
  const drawerMenuFontFamily =
    typeof drawerMenuFontFamilyRaw === "string" && drawerMenuFontFamilyRaw.trim() !== ""
      ? resolveThemeFontFamily(drawerMenuFontFamilyRaw.trim())
      : undefined;
  const drawerRemoteFonts = useMemo(
    () => getThemeFontLoadFamilies(typeof drawerMenuFontFamilyRaw === "string" ? drawerMenuFontFamilyRaw : ""),
    [drawerMenuFontFamilyRaw]
  );
  const socialOpenNewTab =
    config?.socialOpenNewTab === true ||
    config?.socialOpenNewTab === "true" ||
    config?.socialOpenNewTab === 1 ||
    config?.socialOpenNewTab === "1";
  const socialItems: { key: string; label: string; href: string; Icon: any }[] = [
    { key: "tiktok", label: "TikTok", href: sanitizeExternalUrl(config?.socialTiktokUrl), Icon: TiktokIcon },
    { key: "instagram", label: "Instagram", href: sanitizeExternalUrl(config?.socialInstagramUrl), Icon: Instagram },
    { key: "facebook", label: "Facebook", href: sanitizeExternalUrl(config?.socialFacebookUrl), Icon: Facebook },
    { key: "twitter", label: "Twitter", href: sanitizeExternalUrl(config?.socialTwitterUrl), Icon: Twitter },
    { key: "youtube", label: "YouTube", href: sanitizeExternalUrl(config?.socialYoutubeUrl), Icon: Youtube },
    { key: "website", label: "Website", href: sanitizeExternalUrl(config?.socialWebsiteUrl), Icon: Link2 },
  ].filter((x) => x.href !== "");

  const [rendered, setRendered] = useState(false);
  const [active, setActive] = useState(false);
  const [drawerQuery, setDrawerQuery] = useState("");
  const prevBodyOverflowRef = useRef<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    let raf = 0;
    let t = 0;
    if (open) {
      if (prevBodyOverflowRef.current === null) prevBodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setRendered(true);
      raf = requestAnimationFrame(() => setActive(true));
    } else {
      setActive(false);
      t = window.setTimeout(() => {
        setRendered(false);
        if (prevBodyOverflowRef.current !== null) {
          document.body.style.overflow = prevBodyOverflowRef.current;
          prevBodyOverflowRef.current = null;
        }
      }, durationMs);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (t) clearTimeout(t);
    };
  }, [durationMs, open]);

  useEffect(() => {
    return () => {
      if (prevBodyOverflowRef.current !== null) {
        document.body.style.overflow = prevBodyOverflowRef.current;
        prevBodyOverflowRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (drawerRemoteFonts.length === 0 || typeof document === "undefined") return;

    const href = `https://fonts.googleapis.com/css2?${drawerRemoteFonts
      .map((font) => `family=${font.replace(/ /g, "+")}:wght@300;400;500;600;700;800`)
      .join("&")}&display=swap`;

    const existing = document.head.querySelector(`link[data-hb-drawer-font="${href}"]`);
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-hb-drawer-font", href);
    document.head.appendChild(link);
  }, [drawerRemoteFonts]);

  useEffect(() => {
    if (!rendered) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, rendered]);

  useEffect(() => {
    if (!active) return;

    const raf = requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!rendered) return null;

  return (
    <div
      className={`hb-drawer md:hidden hb-drawer-side-${side} hb-drawer-effect-${effect} ${active ? "hb-drawer-open" : ""}`}
      style={
        {
          ["--hb-drawer-overlay-color" as any]:
            typeof config?.drawerOverlayColor === "string" && config.drawerOverlayColor.trim() !== ""
              ? config.drawerOverlayColor.trim()
              : "#000000",
          ["--hb-drawer-overlay-opacity" as any]: overlayOpacity,
          ["--hb-drawer-bg" as any]:
            typeof config?.drawerBgColor === "string" && config.drawerBgColor.trim() !== ""
              ? config.drawerBgColor.trim()
              : "var(--bg-elevated, #ffffff)",
          ["--hb-drawer-text" as any]:
            typeof config?.drawerTextColor === "string" && config.drawerTextColor.trim() !== ""
              ? config.drawerTextColor.trim()
              : "#111827",
          ["--hb-drawer-link" as any]:
            typeof config?.drawerLinkColor === "string" && config.drawerLinkColor.trim() !== ""
              ? config.drawerLinkColor.trim()
              : "#111827",
          ["--hb-drawer-link-hover" as any]:
            typeof config?.drawerLinkHoverColor === "string" && config.drawerLinkHoverColor.trim() !== ""
              ? config.drawerLinkHoverColor.trim()
              : "#111827",
          ["--hb-drawer-divider" as any]:
            typeof config?.drawerDividerColor === "string" && config.drawerDividerColor.trim() !== ""
              ? config.drawerDividerColor.trim()
              : "var(--border, #e5e7eb)",
          ["--hb-drawer-width" as any]: `${drawerWidthPercent}%`,
          ["--hb-drawer-maxw" as any]: drawerMaxWidth,
          ["--hb-drawer-duration" as any]: `${durationMs}ms`,
          ["--hb-drawer-social-color" as any]:
            typeof config?.socialIconColor === "string" && config.socialIconColor.trim() !== ""
              ? config.socialIconColor.trim()
              : "#111827",
          ["--hb-drawer-social-hover" as any]:
            typeof config?.socialIconHoverColor === "string" && config.socialIconHoverColor.trim() !== ""
              ? config.socialIconHoverColor.trim()
              : "#111827",
          ["--hb-drawer-social-size" as any]:
            typeof config?.socialIconSize === "number" && Number.isFinite(config.socialIconSize)
              ? `${config.socialIconSize}px`
              : typeof config?.socialIconSize === "string" &&
                  config.socialIconSize.trim() !== "" &&
                  Number.isFinite(Number(config.socialIconSize))
                ? `${Number(config.socialIconSize)}px`
                : "20px",
          ["--hb-drawer-menu-font-size" as any]: drawerMenuFontSize,
          ["--hb-drawer-menu-line-height" as any]: drawerMenuLineHeight,
          ["--hb-drawer-menu-font-weight" as any]: drawerMenuFontWeight,
          ["--hb-drawer-menu-font-family" as any]: drawerMenuFontFamily,
        } as any
      }
    >
      <button type="button" onClick={onClose} className="hb-drawer-overlay" aria-label="Tutup menu" />
      <div ref={panelRef} className="hb-drawer-panel" role="dialog" aria-modal="true" aria-label="Menu mobile" tabIndex={-1}>
        <div className="hb-drawer-top">
          <div className="hb-drawer-top-left">
            {headerContent === "logo" && (
              <Link href="/" className="hb-drawer-brand" onClick={onClose}>
                {logoUrl ? (
                  <span className="hb-drawer-brand-logo">
                    <Image src={logoUrl} alt={siteName} width={160} height={40} priority />
                  </span>
                ) : (
                  <span className="hb-drawer-brand-text">{siteName}</span>
                )}
              </Link>
            )}
            {headerContent === "search" && (
              <form
                className="hb-drawer-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = drawerQuery.trim();
                  if (!q) return;
                  router.push(`/search?q=${encodeURIComponent(q)}`);
                  onClose();
                }}
              >
                <input
                  type="text"
                  className="hb-drawer-search-input"
                  value={drawerQuery}
                  onChange={(e) => setDrawerQuery(e.target.value)}
                  placeholder={drawerSearchPlaceholder}
                  autoComplete="off"
                />
                <button type="submit" className="hb-drawer-search-btn">
                  {drawerSearchButtonLabel}
                </button>
              </form>
            )}
          </div>
          <button type="button" onClick={onClose} className="hb-drawer-close" aria-label="Tutup">
            <X size={20} />
          </button>
        </div>
        <div className="hb-drawer-body">
          {limited.map((item) => {
            const hasChildren = (item.children || []).length > 0;
            return (
              <div key={item.id} className="hb-drawer-item">
                <div className="hb-drawer-item-row">
                  <Link
                    href={item.href}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel={item.openInNewTab ? "noreferrer" : undefined}
                    className="hb-drawer-link"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                  {hasChildren && (
                    <button
                      type="button"
                      onClick={() => setExpandedId((cur) => (cur === item.id ? null : item.id))}
                      className="hb-drawer-expand"
                      aria-label="Buka submenu"
                    >
                      <ChevronDown size={18} className={`${expandedId === item.id ? "rotate-180" : ""} transition-transform`} />
                    </button>
                  )}
                </div>
                {hasChildren && expandedId === item.id && (
                  <div className="hb-drawer-sub">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        target={child.openInNewTab ? "_blank" : undefined}
                        rel={child.openInNewTab ? "noreferrer" : undefined}
                        className="hb-drawer-sublink"
                        onClick={onClose}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {(footerText !== "" || socialItems.length > 0) && (
          <div className="hb-drawer-footer">
            {socialItems.length > 0 && (
              <div className="hb-drawer-social">
                {socialItems.map(({ key, label, href, Icon }) => (
                  <a
                    key={key}
                    href={href}
                    target={socialOpenNewTab ? "_blank" : undefined}
                    rel={socialOpenNewTab ? "noreferrer" : undefined}
                    className="hb-drawer-social-link"
                    aria-label={label}
                    title={label}
                    onClick={() => onClose()}
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            )}
            {footerText !== "" && <div className="hb-drawer-footer-text">{footerText}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
