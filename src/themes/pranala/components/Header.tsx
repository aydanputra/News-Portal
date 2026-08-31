"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Search, ChevronDown, Moon, Sun } from "lucide-react";
import type { PublicMenuItem } from "@/lib/public-menus";
import AdBanner from "../blocks/AdBanner";
import ImageUrlWidget from "@/components/shared/ImageUrlWidget";
import { sanitizeExternalUrl } from "@/lib/sanitizer";
import { HEADER_BUILDER_CSS } from "./header-builder-styles";
import { buildHeaderSectionLayoutStyles, resolveHeaderWidgetBoxStyle } from "./header-layout-utils";
import {
  buildHeaderAdVars,
  buildHeaderLogoVars,
  buildHeaderMenuVars,
  buildHeaderMobileToggleVars,
  buildHeaderSearchVars,
  buildHeaderThemeVars,
  getHeaderWidgetShellClass,
  getResponsiveValue,
  isTruthy,
  normalizeColor,
  normalizePx,
  resolveBoxSpacing,
} from "./header-style-utils";
import { applyPublicTheme, usePublicThemeStore, usePublicViewportStore } from "./public-ui-store";
import { useStickySectionLayout } from "./use-sticky-section-layout";

type ColumnKey = "left" | "center" | "right";

type HeaderComponentType =
  | "LOGO"
  | "MENU_PRIMARY"
  | "MENU_SECONDARY"
  | "SEARCH"
  | "THEME_TOGGLE"
  | "LOGIN_BUTTON"
  | "MOBILE_MENU_TOGGLE";

type HeaderComponent = {
  id: string;
  type: HeaderComponentType;
};

type HeaderLayout = Record<ColumnKey, HeaderComponent[]>;

type HeaderBuilderConfig = {
  version: 1;
  sticky: boolean;
  desktop: HeaderLayout;
  mobile: HeaderLayout;
};

interface HeaderProps {
  siteName: string;
  logoUrl?: string;
  categories: any[];
  primaryMenu?: PublicMenuItem[];
  secondaryMenu?: PublicMenuItem[];
  mobileMenu?: PublicMenuItem[];
  headerConfig?: unknown;
}

const HeaderMobileDrawer = dynamic(() => import("./HeaderMobileDrawer"), {
  ssr: false,
  loading: () => null,
});

const HeaderSearchDialog = dynamic(() => import("./HeaderSearchDialog"), {
  ssr: false,
  loading: () => null,
});

const DEFAULT_CONFIG: HeaderBuilderConfig = {
  version: 1,
  sticky: true,
  desktop: {
    left: [{ id: "d_logo", type: "LOGO" }],
    center: [{ id: "d_menu_primary", type: "MENU_PRIMARY" }],
    right: [
      { id: "d_theme", type: "THEME_TOGGLE" },
      { id: "d_search", type: "SEARCH" },
      { id: "d_login", type: "LOGIN_BUTTON" },
    ],
  },
  mobile: {
    left: [
      { id: "m_menu", type: "MOBILE_MENU_TOGGLE" },
      { id: "m_logo", type: "LOGO" },
    ],
    center: [],
    right: [{ id: "m_search", type: "SEARCH" }],
  },
};

function safeParseConfig(raw: unknown): HeaderBuilderConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as any;
  if (obj.version !== 1) return null;
  const pickLayout = (v: any): HeaderLayout | null => {
    if (!v || typeof v !== "object") return null;
    if (!Array.isArray(v.left) || !Array.isArray(v.center) || !Array.isArray(v.right)) return null;
    const normalize = (arr: any[]): HeaderComponent[] =>
      arr
        .filter((x) => x && typeof x === "object")
        .map((x) => ({ id: String(x.id || ""), type: String(x.type) as HeaderComponentType }))
        .filter((x) => !!x.id && typeof x.type === "string");
    return { left: normalize(v.left), center: normalize(v.center), right: normalize(v.right) };
  };
  const desktop = pickLayout(obj.desktop);
  const mobile = pickLayout(obj.mobile);
  if (!desktop || !mobile) return null;
  return { version: 1, sticky: obj.sticky !== false, desktop, mobile };
}

function DesktopMenu({ items }: { items: PublicMenuItem[] }) {
  return (
    <>
      {items.map((item) => {
        const hasChildren = (item.children || []).length > 0;
        if (!hasChildren) {
          return (
            <Link
              key={item.id}
              href={item.href}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noreferrer" : undefined}
              className="hb-menu-link"
            >
              {item.label}
            </Link>
          );
        }
        return (
          <div key={item.id} className="relative group">
            <Link
              href={item.href}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noreferrer" : undefined}
              className="hb-menu-link inline-flex items-center gap-1"
            >
              {item.label}
              <ChevronDown size={14} className="hb-menu-chevron opacity-70" />
            </Link>
            <div className="absolute left-0 top-full pt-3 hidden group-hover:block">
              <div className="hb-menu-panel">
                <div className="py-2">
                  {item.children.map((child) => {
                    const hasGrandChildren = (child.children || []).length > 0;
                    if (!hasGrandChildren) {
                      return (
                        <Link
                          key={child.id}
                          href={child.href}
                          target={child.openInNewTab ? "_blank" : undefined}
                          rel={child.openInNewTab ? "noreferrer" : undefined}
                          className="hb-menu-sublink block px-4 py-2"
                        >
                          {child.label}
                        </Link>
                      );
                    }
                    return (
                      <div key={child.id} className="relative group/sub">
                        <Link
                          href={child.href}
                          target={child.openInNewTab ? "_blank" : undefined}
                          rel={child.openInNewTab ? "noreferrer" : undefined}
                          className="hb-menu-sublink flex items-center justify-between px-4 py-2"
                        >
                          <span>{child.label}</span>
                          <ChevronDown size={14} className="hb-menu-chevron -rotate-90 opacity-70" />
                        </Link>
                        <div className="absolute left-full top-0 pl-2 hidden group-hover/sub:block">
                          <div className="hb-menu-panel">
                            <div className="py-2">
                              {child.children.map((g) => (
                                <Link
                                  key={g.id}
                                  href={g.href}
                                  target={g.openInNewTab ? "_blank" : undefined}
                                  rel={g.openInNewTab ? "noreferrer" : undefined}
                                  className="hb-menu-sublink block px-4 py-2"
                                >
                                  {g.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default function Header({ siteName, logoUrl, categories, primaryMenu, secondaryMenu, mobileMenu, headerConfig }: HeaderProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inlineSearchValue, setInlineSearchValue] = useState("");
  const [searchDialogConfig, setSearchDialogConfig] = useState<{ placeholder: string; buttonLabel: string }>({
    placeholder: "Search...",
    buttonLabel: "Search",
  });
  const [themeMounted, setThemeMounted] = useState(false);
  const publicTheme = usePublicThemeStore();
  const viewportDevice = usePublicViewportStore();
  const legacyConfig = useMemo(() => safeParseConfig(headerConfig) || DEFAULT_CONFIG, [headerConfig]);
  const effectivePrimary = useMemo(() => {
    if (primaryMenu && primaryMenu.length > 0) return primaryMenu;
    return categories.slice(0, 6).map((cat: any) => ({
      id: String(cat.id),
      label: String(cat.name),
      href: `/category/${cat.slug}`,
      openInNewTab: false,
      children: [],
    }));
  }, [categories, primaryMenu]);
  const effectiveSecondary = useMemo(() => (secondaryMenu && secondaryMenu.length > 0 ? secondaryMenu : []), [secondaryMenu]);
  const effectiveMobile = useMemo(() => (mobileMenu && mobileMenu.length > 0 ? mobileMenu : effectivePrimary), [effectivePrimary, mobileMenu]);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setThemeMounted(true);
  }, []);

  const headerBlocks = useMemo(() => {
    if (!Array.isArray(headerConfig)) return null;
    const blocks = headerConfig.filter((b) => b && typeof b === "object" && typeof (b as any).type === "string" && typeof (b as any).config === "object");
    if (blocks.length === 0) return null;
    return blocks as any[];
  }, [headerConfig]);

  const mobileMenuDrawerConfig = useMemo(() => {
    if (!headerBlocks) return {};
    const walk = (nodes: any[]): any | null => {
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        if (node.type === "header_mobile_menu_toggle") return (node.config || {}) as any;
        if (node.type === "section") {
          const children = Array.isArray(node?.config?.children) ? node.config.children : [];
          const found = walk(children);
          if (found) return found;
        }
      }
      return null;
    };
    const sections = headerBlocks.filter((b: any) => b && typeof b === "object" && b.type === "section");
    for (const section of sections) {
      const children = Array.isArray((section as any)?.config?.children) ? (section as any).config.children : [];
      const found = walk(children);
      if (found) return found;
    }
    return {};
  }, [headerBlocks]);
  const { stickyLayout, registerSectionRef } = useStickySectionLayout(headerBlocks);

  const renderLogo = useCallback(() => (
    <Link href="/" className="font-serif font-bold text-3xl tracking-tight [color:var(--home-news-title-color,var(--heading-color,#111827))]">
      {logoUrl ? (
        <Image src={logoUrl} alt={siteName} width={200} height={40} unoptimized className="h-10 w-auto object-contain" />
      ) : (
        <span>{siteName}</span>
      )}
    </Link>
  ), [logoUrl, siteName]);

  const renderDesktopNav = useCallback((items: PublicMenuItem[]) => (
    <nav className="flex items-center gap-8">
      <DesktopMenu items={items} />
    </nav>
  ), []);

  const renderComponent = useCallback((c: HeaderComponent, device: "desktop" | "mobile") => {
    if (c.type === "LOGO") return <div key={c.id}>{renderLogo()}</div>;
    if (c.type === "MOBILE_MENU_TOGGLE") {
      if (device !== "mobile") return null;
      return (
        <button key={c.id} type="button" onClick={() => setMobileOpen(true)} className="p-2 -ml-2 [color:var(--muted-text,var(--home-meta-color,#9ca3af))] hover:[color:var(--home-hover-color,var(--accent,#2563eb))] transition-colors" aria-label="Buka menu">
          <Menu size={24} />
        </button>
      );
    }
    if (c.type === "MENU_PRIMARY") {
      if (device !== "desktop") return null;
      return <div key={c.id}>{renderDesktopNav(effectivePrimary)}</div>;
    }
    if (c.type === "MENU_SECONDARY") {
      if (device !== "desktop") return null;
      if (effectiveSecondary.length === 0) return null;
      return <div key={c.id}>{renderDesktopNav(effectiveSecondary)}</div>;
    }
    if (c.type === "THEME_TOGGLE") {
      if (!themeMounted) return null;
      const isLight = publicTheme === "light";
      return (
        <button
          key={c.id}
          type="button"
          onClick={() => {
            const nextTheme = publicTheme === "light" ? "dark" : "light";
            applyPublicTheme(nextTheme);
          }}
          className="p-2 [color:var(--muted-text,var(--home-meta-color,#9ca3af))] hover:[color:var(--home-hover-color,var(--accent,#2563eb))] transition-colors"
          aria-label={isLight ? "Aktifkan mode gelap" : "Aktifkan mode terang"}
          title={isLight ? "Mode Gelap" : "Mode Terang"}
        >
          {isLight ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      );
    }
    if (c.type === "SEARCH")
      return (
        <button
          key={c.id}
          type="button"
          className="p-2 [color:var(--muted-text,var(--home-meta-color,#9ca3af))] hover:[color:var(--home-hover-color,var(--accent,#2563eb))] transition-colors"
          aria-label="Search"
          onClick={() => {
            setSearchDialogConfig({ placeholder: "Search...", buttonLabel: "Search" });
            setSearchOpen(true);
          }}
        >
          <Search size={20} />
        </button>
      );
    if (c.type === "LOGIN_BUTTON") return (
      <Link key={c.id} href="/admin/login" className="hidden sm:inline-flex px-5 py-2.5 text-sm font-medium text-white bg-[var(--accent,#2563eb)] rounded-lg hover:bg-[var(--accent-hover,var(--home-hover-color,var(--accent,#2563eb)))] transition-colors shadow-sm">
        Masuk
      </Link>
    );
    return null;
  }, [effectivePrimary, effectiveSecondary, publicTheme, renderDesktopNav, renderLogo, themeMounted]);

  const colSpanClass = useCallback((ratio: number) => {
    if (ratio >= 100) return "col-span-12";
    if (ratio >= 75) return "col-span-9";
    if (ratio >= 66) return "col-span-8";
    if (ratio >= 50) return "col-span-6";
    if (ratio >= 33) return "col-span-4";
    if (ratio >= 25) return "col-span-3";
    return "col-span-12";
  }, []);

  const hideClass = useCallback((cfg: any) => {
    const hideDesktop = !!cfg?.hideOnDesktop;
    const hideTablet = !!cfg?.hideOnTablet;
    const hideMobile = !!cfg?.hideOnMobile;
    const parts: string[] = [];
    if (hideDesktop) parts.push("hide-desktop-widget");
    if (hideTablet) parts.push("hide-tablet-widget");
    if (hideMobile) parts.push("hide-mobile-widget");
    return parts.join(" ");
  }, []);

  const renderHeaderWidget = useCallback((child: any) => {
    const type = String(child?.type || "");
    if (type === "header_logo") {
      const cfg = child?.config || {};
      const lightLogo = typeof cfg.logoUrl === "string" && cfg.logoUrl.trim() !== "" ? cfg.logoUrl.trim() : (typeof logoUrl === "string" ? logoUrl.trim() : "");
      const darkLogo = typeof cfg.logoUrlDark === "string" && cfg.logoUrlDark.trim() !== "" ? cfg.logoUrlDark.trim() : "";
      const hasLogo = lightLogo !== "" || darkLogo !== "";
      const text = siteName;
      return (
        <div key={child.id} className="hb-logo-inner">
          <Link href="/" className={hasLogo ? "inline-flex" : "hb-logo-text font-serif font-bold tracking-tight text-gray-900"}>
            {hasLogo ? (
              lightLogo !== "" && darkLogo !== "" ? (
                <>
                  <Image src={lightLogo} alt={siteName} width={400} height={120} unoptimized className="hb-logo-light block" />
                  <Image src={darkLogo} alt={siteName} width={400} height={120} unoptimized className="hb-logo-dark block" />
                </>
              ) : (
                <Image src={(lightLogo || darkLogo) as string} alt={siteName} width={400} height={120} unoptimized className="block" />
              )
            ) : (
              <span className="hb-logo-text">{text}</span>
            )}
          </Link>
        </div>
      );
    }
    if (type === "header_menu_primary") return <div key={child.id}>{renderDesktopNav(effectivePrimary)}</div>;
    if (type === "header_menu_secondary") {
      if (effectiveSecondary.length === 0) return null;
      return <div key={child.id}>{renderDesktopNav(effectiveSecondary)}</div>;
    }
    if (type === "header_search") {
      const cfg = child?.config || {};
      const design = String(cfg.searchDesign || "icon");
      const placeholder = typeof cfg.searchPlaceholder === "string" && cfg.searchPlaceholder.trim() !== "" ? cfg.searchPlaceholder : "Search...";
      const buttonLabel = typeof cfg.searchButtonLabel === "string" && cfg.searchButtonLabel.trim() !== "" ? cfg.searchButtonLabel : "Search";
      const getCfg = (key: string) => getResponsiveValue(cfg, key, viewportDevice);
      const searchStyle = {
        ["--hb-search-color" as any]: normalizeColor(getCfg("searchColor")),
        ["--hb-search-hover" as any]: normalizeColor(getCfg("searchHoverColor")),
        ["--hb-search-icon" as any]: normalizePx(getCfg("searchIconSize")),
        ["--hb-search-input-color" as any]: normalizeColor(getCfg("searchInputColor")),
        ["--hb-search-bg" as any]: normalizeColor(getCfg("searchBgColor")),
        ["--hb-search-border" as any]: normalizeColor(getCfg("searchBorderColor")),
        ["--hb-search-radius" as any]: normalizePx(getCfg("searchRadius")),
        ["--hb-search-height" as any]: normalizePx(getCfg("searchHeight")),
        ["--hb-search-font" as any]: normalizePx(getCfg("searchFontSize")),
        ["--hb-search-button-bg" as any]: normalizeColor(getCfg("searchButtonBgColor")),
        ["--hb-search-button-text" as any]: normalizeColor(getCfg("searchButtonTextColor")),
      } as any;
      if (design === "bar") {
        return (
          <form
            key={child.id}
            className="hb-search hb-searchbar"
            style={searchStyle}
            onSubmit={(e) => {
              e.preventDefault();
                const q = inlineSearchValue.trim();
              if (!q) return;
              router.push(`/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <div className="hb-searchbar-box">
              <span className="hb-searchbar-icon" aria-hidden="true">
                <Search size={16} />
              </span>
              <input
                value={inlineSearchValue}
                onChange={(e) => setInlineSearchValue(e.target.value)}
                className="hb-searchbar-input"
                placeholder={placeholder}
                aria-label="Search"
              />
              <button type="submit" className="hb-searchbar-button">
                {buttonLabel}
              </button>
            </div>
          </form>
        );
      }
      return (
        <button
          key={child.id}
          type="button"
          className="hb-search-btn"
          style={searchStyle}
          aria-label="Search"
          onClick={() => {
            setSearchDialogConfig({
              placeholder,
              buttonLabel,
            });
            setSearchOpen(true);
          }}
        >
          <Search size={20} />
        </button>
      );
    }
    if (type === "header_theme_toggle") {
      if (!themeMounted) return null;
      const isLight = publicTheme === "light";
      const cfg = child?.config || {};
      const color = normalizeColor(getResponsiveValue(cfg, "themeColor", viewportDevice));
      const hover = normalizeColor(getResponsiveValue(cfg, "themeHoverColor", viewportDevice));
      const iconSize = normalizePx(getResponsiveValue(cfg, "themeIconSize", viewportDevice));
      return (
        <button
          key={child.id}
          type="button"
          onClick={() => {
            const nextTheme = publicTheme === "light" ? "dark" : "light";
            applyPublicTheme(nextTheme);
          }}
          className="hb-theme-btn"
          style={
            {
              ["--hb-theme-color" as any]: color,
              ["--hb-theme-hover" as any]: hover,
              ["--hb-theme-icon" as any]: iconSize,
            } as any
          }
          aria-label={isLight ? "Aktifkan mode gelap" : "Aktifkan mode terang"}
          title={isLight ? "Mode Gelap" : "Mode Terang"}
        >
          {isLight ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      );
    }
    if (type === "header_login") {
      const cfg = child?.config || {};
      const rawLabel = typeof cfg.loginLabel === "string" && cfg.loginLabel.trim() !== "" ? cfg.loginLabel.trim() : "Masuk";
      const rawUrl = typeof cfg.loginUrl === "string" && cfg.loginUrl.trim() !== "" ? cfg.loginUrl.trim() : "/admin/login";
      const href = rawUrl.startsWith("/") ? rawUrl : (sanitizeExternalUrl(rawUrl) || "/admin/login");
      const loginStyle = {
        ["--hb-login-text" as any]: normalizeColor(getResponsiveValue(cfg, "loginTextColor", viewportDevice)) || "#ffffff",
        ["--hb-login-bg" as any]: normalizeColor(getResponsiveValue(cfg, "loginBgColor", viewportDevice)) || "var(--accent,#2563eb)",
        ["--hb-login-hover-bg" as any]:
          normalizeColor(getResponsiveValue(cfg, "loginHoverBgColor", viewportDevice)) || "var(--accent-hover,var(--home-hover-color,var(--accent,#2563eb)))",
        ["--hb-login-font" as any]: normalizePx(getResponsiveValue(cfg, "loginFontSize", viewportDevice)) || "14px",
        ["--hb-login-radius" as any]: normalizePx(getResponsiveValue(cfg, "loginRadius", viewportDevice)) || "9999px",
        ["--hb-login-px" as any]: normalizePx(getResponsiveValue(cfg, "loginPaddingX", viewportDevice)) || "20px",
        ["--hb-login-py" as any]: normalizePx(getResponsiveValue(cfg, "loginPaddingY", viewportDevice)) || "10px",
      } as any;
      return (
        <Link key={child.id} href={href} className="hb-login-link" style={loginStyle}>
          {rawLabel}
        </Link>
      );
    }
    if (type === "header_mobile_menu_toggle") {
      return (
        <button key={child.id} type="button" onClick={() => setMobileOpen(true)} className="hb-mt-btn -ml-2" aria-label="Buka menu">
          <Menu size={24} />
        </button>
      );
    }
    if (type === "image_widget") {
      return (
        <div key={child.id} className="max-w-full">
          <ImageUrlWidget config={child?.config || {}} title={child?.title || "Gambar"} className="max-w-full" />
        </div>
      );
    }
    if (type === "ad_banner") {
      const hideWhenEmpty = typeof child?.config?.hideWhenEmpty === "boolean" ? child.config.hideWhenEmpty : true;
      return <AdBanner key={child.id} block={child} hideWhenEmpty={hideWhenEmpty} ignorePadding />;
    }
    return null;
  }, [effectivePrimary, effectiveSecondary, inlineSearchValue, logoUrl, publicTheme, renderDesktopNav, router, siteName, themeMounted, viewportDevice]);

  const renderedFromBlocks = useMemo(() => {
    if (!headerBlocks) return null;
    const sections = headerBlocks
      .filter((b) => (b as any).type === "section" && ((b as any).isActive ?? true))
      .sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0));
    if (sections.length === 0) return null;
    const getResponsive = getResponsiveValue;
    const resolveHeaderChildBaseStyle = (child: any, options?: { fullWidthAd?: boolean }) => {
      if (child.type === "header_logo") return buildHeaderLogoVars(child.config || {});
      if (child.type === "ad_banner") return buildHeaderAdVars(child.config || {}, options?.fullWidthAd === true);
      if (child.type === "header_menu_primary" || child.type === "header_menu_secondary") return buildHeaderMenuVars(child.config || {});
      if (child.type === "header_search") return buildHeaderSearchVars(child.config || {});
      if (child.type === "header_theme_toggle") return buildHeaderThemeVars(child.config || {});
      if (child.type === "header_mobile_menu_toggle") return buildHeaderMobileToggleVars(child.config || {});
      return undefined;
    };

    const resolveHeaderChildShellStyle = (child: any, options?: { fullWidthAd?: boolean; stretch?: boolean }) => {
      const base = resolveHeaderChildBaseStyle(child, options);
      const spacingRaw = resolveBoxSpacing(
        child.config || {},
        child.type !== "header_theme_toggle" && child.type !== "ad_banner",
        viewportDevice as "desktop" | "tablet" | "mobile"
      );
      const spacing =
        viewportDevice === "tablet" && (child.type === "ad_banner" || child.type === "header_logo")
          ? ({ ...spacingRaw, marginLeft: undefined, marginRight: undefined } as any)
          : spacingRaw;

      return {
        ...(options?.stretch ? ({ flex: 1, minWidth: 0 } as any) : {}),
        ...(base || {}),
        ...(spacing || {}),
      } as any;
    };

    const resolveHeaderChildClassName = (child: any) => {
      const widgetClass = getHeaderWidgetShellClass(String(child?.type || ""));
      return `${hideClass(child?.config)} ${widgetClass}`.trim();
    };

    return (
      <>
        <style>{HEADER_BUILDER_CSS}</style>
        {sections.map((section) => {
          const cfg = (section as any).config || {};
          const isSticky = cfg.sticky === true || cfg.sticky === "true" || cfg.sticky === 1 || cfg.sticky === "1";
          const sectionId = String((section as any).id);
          const layout = String(cfg.layout || "100");
          const ratios = layout.split("-").map((p: string) => parseInt(p, 10)).filter((n: number) => Number.isFinite(n) && n > 0);
          const colCount = ratios.length > 0 ? ratios.length : 1;
          const children = Array.isArray(cfg.children) ? cfg.children : [];
          const sectionLayoutStyles = buildHeaderSectionLayoutStyles(
            cfg,
            viewportDevice as "desktop" | "tablet" | "mobile",
            isSticky,
            stickyLayout[sectionId]
          );
          return (
            <div
              key={sectionId}
              ref={registerSectionRef(sectionId)}
              className={`hb-section ${hideClass(cfg)} ${isSticky ? "hb-sticky" : ""}`}
              style={sectionLayoutStyles.sectionStyle}
            >
              <div className="hb-inner" style={sectionLayoutStyles.innerStyle}>
                <div className="hb-surface">
                  <div className="hb-box-content">
                  <div className="hb-row">
                  {Array.from({ length: colCount }).map((_, colIndex) => {
                    const ratio = ratios[colIndex] ?? Math.floor(100 / colCount);
                    const colChildren = children
                      .filter((c: any) => ((c?.config?.columnIndex ?? 0) as number) === colIndex && ((c?.isVisible ?? true) as boolean))
                      .sort((a: any, b: any) => ((a?.order ?? 0) as number) - ((b?.order ?? 0) as number));
                    const defaultAlign = colCount === 1 ? "left" : colIndex === 0 ? "left" : colIndex === colCount - 1 ? "right" : "center";
                    const left: any[] = [];
                    const center: any[] = [];
                    const right: any[] = [];
                    const stretch: any[] = [];
                    for (const child of colChildren) {
                      const rawAlign = String(
                        getResponsive(child?.config || {}, "textAlign", viewportDevice as "desktop" | "tablet" | "mobile") ??
                        getResponsive(child?.config || {}, "align", viewportDevice as "desktop" | "tablet" | "mobile") ??
                        child?.config?.textAlign ??
                        child?.config?.align ??
                        "auto"
                      );
                      const align = rawAlign === "auto" ? defaultAlign : rawAlign;
                      if (align === "stretch") {
                        stretch.push(child);
                        continue;
                      }
                      if (align === "right") right.push(child);
                      else if (align === "center") center.push(child);
                      else left.push(child);
                    }
                    const hasRight = right.length > 0;
                    return (
                      <div key={`${(section as any).id}_col_${colIndex}`} className={`${colSpanClass(ratio)} w-full`}>
                        <div className={`grid ${hasRight ? "grid-cols-[auto_1fr_auto]" : "grid-cols-[auto_1fr]"} items-center gap-3 w-full`}>
                          <div className="flex items-center gap-3 justify-start">
                            {left.map((child: any) => (
                              <div
                                key={child.id}
                                className={resolveHeaderChildClassName(child)}
                                style={resolveHeaderChildShellStyle(child)}
                              >
                                <div style={resolveHeaderWidgetBoxStyle(child.config || {}, viewportDevice as "desktop" | "tablet" | "mobile")}>
                                  {renderHeaderWidget(child)}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 min-w-0">
                            {center.length > 0 && (
                              <div className="flex items-center gap-3 justify-center flex-1 min-w-0">
                                {center.map((child: any) => (
                                  <div
                                    key={child.id}
                                    className={resolveHeaderChildClassName(child)}
                                    style={resolveHeaderChildShellStyle(child)}
                                  >
                                    <div style={resolveHeaderWidgetBoxStyle(child.config || {}, viewportDevice as "desktop" | "tablet" | "mobile")}>
                                      {renderHeaderWidget(child)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {stretch.length > 0 && (
                              <div className="flex items-center gap-3 justify-end flex-1 min-w-0">
                                {stretch.map((child: any) => (
                                  <div
                                    key={child.id}
                                    className={resolveHeaderChildClassName(child)}
                                    style={resolveHeaderChildShellStyle(child, { fullWidthAd: true, stretch: true })}
                                  >
                                    <div style={resolveHeaderWidgetBoxStyle(child.config || {}, viewportDevice as "desktop" | "tablet" | "mobile")}>
                                      {renderHeaderWidget(child)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {hasRight && (
                            <div className="flex items-center gap-3 justify-end">
                              {right.map((child: any) => (
                                <div
                                  key={child.id}
                                  className={resolveHeaderChildClassName(child)}
                                  style={resolveHeaderChildShellStyle(child)}
                                >
                                  <div style={resolveHeaderWidgetBoxStyle(child.config || {}, viewportDevice as "desktop" | "tablet" | "mobile")}>
                                    {renderHeaderWidget(child)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </>
    );
  }, [colSpanClass, headerBlocks, hideClass, renderHeaderWidget, stickyLayout, viewportDevice]);

  if (renderedFromBlocks) {
    return (
      <header className="contents" suppressHydrationWarning>
        {renderedFromBlocks}
        <HeaderMobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} items={effectiveMobile} config={mobileMenuDrawerConfig} siteName={siteName} logoUrl={logoUrl} />
        <HeaderSearchDialog
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          placeholder={searchDialogConfig.placeholder}
          buttonLabel={searchDialogConfig.buttonLabel}
        />
      </header>
    );
  }

  return (
    <header className={`border-b border-[color:var(--border,#e5e7eb)] bg-[color:var(--bg-elevated,#ffffff)] shadow-sm ${legacyConfig.sticky ? "sticky top-0 z-50" : ""}`} suppressHydrationWarning>
      <div className="container mx-auto px-4 h-16 flex lg:hidden items-center justify-between">
        <div className="flex items-center gap-3">
          {legacyConfig.mobile.left.map((c) => renderComponent(c, "mobile"))}
        </div>
        <div className="flex items-center gap-3">
          {legacyConfig.mobile.right.map((c) => renderComponent(c, "mobile"))}
        </div>
      </div>

      <div className="container mx-auto px-4 h-20 hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-4 shrink-0">
          {legacyConfig.desktop.left.map((c) => renderComponent(c, "desktop"))}
        </div>
        <div className="flex-1 flex items-center justify-center gap-8">
          {legacyConfig.desktop.center.map((c) => renderComponent(c, "desktop"))}
        </div>
        <div className="flex items-center gap-4 shrink-0 justify-end">
          {legacyConfig.desktop.right.map((c) => renderComponent(c, "desktop"))}
        </div>
      </div>

      <HeaderMobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} items={effectiveMobile} config={mobileMenuDrawerConfig} siteName={siteName} logoUrl={logoUrl} />
      <HeaderSearchDialog
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        placeholder={searchDialogConfig.placeholder}
        buttonLabel={searchDialogConfig.buttonLabel}
      />
    </header>
  );
}
