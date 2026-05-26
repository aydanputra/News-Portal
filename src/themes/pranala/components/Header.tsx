"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Facebook, Instagram, Link2, Menu, Search, Twitter, X, Youtube, ChevronDown, Moon, Sun } from "lucide-react";
import type { PublicMenuItem } from "@/lib/public-menus";
import AdBanner from "../blocks/AdBanner";

function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.5 2c.3 2.3 1.7 3.9 4 4.2V9c-1.5.1-2.9-.4-4-1.2V15c0 4.1-3.3 7-7.3 7-3.9 0-7.2-3-7.2-7 0-4.7 4.4-8.1 9-6.6v3.2c-2.4-.8-4.6.9-4.6 3.3 0 1.9 1.5 3.4 3.4 3.4 2.1 0 3.6-1.4 3.6-4V2h3.1z" />
    </svg>
  );
}

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

const limitMobileMenuDepth = (items: PublicMenuItem[]): PublicMenuItem[] =>
  items.map((it) => ({
    ...it,
    children: (it.children || []).map((c) => ({ ...c, children: [] })),
  }));

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
              className="text-base font-medium text-[var(--header-menu-color)] hover:text-indigo-600 transition-colors uppercase tracking-wide text-xs"
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
              className="text-base font-medium text-[var(--header-menu-color)] hover:text-indigo-600 transition-colors uppercase tracking-wide text-xs inline-flex items-center gap-1"
            >
              {item.label}
              <ChevronDown size={14} className="opacity-70" />
            </Link>
            <div className="absolute left-0 top-full pt-3 hidden group-hover:block">
              <div className="min-w-56 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
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
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
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
                          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                        >
                          <span>{child.label}</span>
                          <ChevronDown size={14} className="-rotate-90 opacity-70" />
                        </Link>
                        <div className="absolute left-full top-0 pl-2 hidden group-hover/sub:block">
                          <div className="min-w-56 rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
                            <div className="py-2">
                              {child.children.map((g) => (
                                <Link
                                  key={g.id}
                                  href={g.href}
                                  target={g.openInNewTab ? "_blank" : undefined}
                                  rel={g.openInNewTab ? "noreferrer" : undefined}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
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

function MobileDrawer({
  open,
  onClose,
  items,
  config,
  siteName,
  logoUrl,
}: {
  open: boolean;
  onClose: () => void;
  items: PublicMenuItem[];
  config?: any;
  siteName: string;
  logoUrl?: string;
}) {
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
  const headerContent = config?.drawerHeaderContent === "search" ? "search" : config?.drawerHeaderContent === "logo" ? "logo" : "none";
  const drawerSearchPlaceholder = typeof config?.drawerSearchPlaceholder === "string" && config.drawerSearchPlaceholder.trim() !== "" ? config.drawerSearchPlaceholder.trim() : "Cari berita...";
  const drawerSearchButtonLabel = typeof config?.drawerSearchButtonLabel === "string" && config.drawerSearchButtonLabel.trim() !== "" ? config.drawerSearchButtonLabel.trim() : "Cari";

  const footerText = typeof config?.drawerFooterText === "string" ? config.drawerFooterText.trim() : "";
  const socialOpenNewTab = config?.socialOpenNewTab === true || config?.socialOpenNewTab === "true" || config?.socialOpenNewTab === 1 || config?.socialOpenNewTab === "1";
  const socialItems: { key: string; label: string; href: string; Icon: any }[] = [
    { key: "tiktok", label: "TikTok", href: typeof config?.socialTiktokUrl === "string" ? config.socialTiktokUrl.trim() : "", Icon: TiktokIcon },
    { key: "instagram", label: "Instagram", href: typeof config?.socialInstagramUrl === "string" ? config.socialInstagramUrl.trim() : "", Icon: Instagram },
    { key: "facebook", label: "Facebook", href: typeof config?.socialFacebookUrl === "string" ? config.socialFacebookUrl.trim() : "", Icon: Facebook },
    { key: "twitter", label: "Twitter", href: typeof config?.socialTwitterUrl === "string" ? config.socialTwitterUrl.trim() : "", Icon: Twitter },
    { key: "youtube", label: "YouTube", href: typeof config?.socialYoutubeUrl === "string" ? config.socialYoutubeUrl.trim() : "", Icon: Youtube },
    { key: "website", label: "Website", href: typeof config?.socialWebsiteUrl === "string" ? config.socialWebsiteUrl.trim() : "", Icon: Link2 },
  ].filter((x) => x.href !== "");

  const [rendered, setRendered] = useState(false);
  const [active, setActive] = useState(false);
  const [drawerQuery, setDrawerQuery] = useState("");
  const prevBodyOverflowRef = useRef<string | null>(null);

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

  if (!rendered) return null;

  return (
    <div
      className={`hb-drawer md:hidden hb-drawer-side-${side} hb-drawer-effect-${effect} ${active ? "hb-drawer-open" : ""}`}
      style={
        {
          ["--hb-drawer-overlay-color" as any]: typeof config?.drawerOverlayColor === "string" && config.drawerOverlayColor.trim() !== "" ? config.drawerOverlayColor.trim() : "#000000",
          ["--hb-drawer-overlay-opacity" as any]: overlayOpacity,
          ["--hb-drawer-bg" as any]: typeof config?.drawerBgColor === "string" && config.drawerBgColor.trim() !== "" ? config.drawerBgColor.trim() : "#ffffff",
          ["--hb-drawer-text" as any]: typeof config?.drawerTextColor === "string" && config.drawerTextColor.trim() !== "" ? config.drawerTextColor.trim() : "#111827",
          ["--hb-drawer-link" as any]: typeof config?.drawerLinkColor === "string" && config.drawerLinkColor.trim() !== "" ? config.drawerLinkColor.trim() : "#111827",
          ["--hb-drawer-link-hover" as any]: typeof config?.drawerLinkHoverColor === "string" && config.drawerLinkHoverColor.trim() !== "" ? config.drawerLinkHoverColor.trim() : "var(--accent)",
          ["--hb-drawer-divider" as any]: typeof config?.drawerDividerColor === "string" && config.drawerDividerColor.trim() !== "" ? config.drawerDividerColor.trim() : "#f3f4f6",
          ["--hb-drawer-width" as any]: `${drawerWidthPercent}%`,
          ["--hb-drawer-maxw" as any]: drawerMaxWidth,
          ["--hb-drawer-duration" as any]: `${durationMs}ms`,
          ["--hb-drawer-social-color" as any]: typeof config?.socialIconColor === "string" && config.socialIconColor.trim() !== "" ? config.socialIconColor.trim() : "#6b7280",
          ["--hb-drawer-social-hover" as any]: typeof config?.socialIconHoverColor === "string" && config.socialIconHoverColor.trim() !== "" ? config.socialIconHoverColor.trim() : "var(--accent)",
          ["--hb-drawer-social-size" as any]: typeof config?.socialIconSize === "number" && Number.isFinite(config.socialIconSize) ? `${config.socialIconSize}px` : typeof config?.socialIconSize === "string" && config.socialIconSize.trim() !== "" && Number.isFinite(Number(config.socialIconSize)) ? `${Number(config.socialIconSize)}px` : "20px",
        } as any
      }
    >
      <button type="button" onClick={onClose} className="hb-drawer-overlay" aria-label="Tutup menu" />
      <div className="hb-drawer-panel">
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

export default function Header({ siteName, logoUrl, categories, primaryMenu, secondaryMenu, mobileMenu, headerConfig }: HeaderProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [searchSuggestionsLoading, setSearchSuggestionsLoading] = useState(false);
  const [searchSuggestionsVisible, setSearchSuggestionsVisible] = useState(false);
  const [themeMounted, setThemeMounted] = useState(false);
  const [publicTheme, setPublicTheme] = useState<"light" | "dark">("light");
  const [viewportDevice, setViewportDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const legacyConfig = useMemo(() => safeParseConfig(headerConfig) || DEFAULT_CONFIG, [headerConfig]);
  const suggestAbortRef = useRef<AbortController | null>(null);
  const suggestTimerRef = useRef<number | null>(null);
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
    if (!searchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      if (suggestTimerRef.current) window.clearTimeout(suggestTimerRef.current);
      suggestTimerRef.current = null;
      suggestAbortRef.current?.abort();
      suggestAbortRef.current = null;
      setSearchSuggestions([]);
      setSearchSuggestionsLoading(false);
      setSearchSuggestionsVisible(false);
      return;
    }

    const q = searchValue.trim();
    setSearchSuggestionsVisible(true);

    if (suggestTimerRef.current) window.clearTimeout(suggestTimerRef.current);
    suggestTimerRef.current = window.setTimeout(async () => {
      suggestAbortRef.current?.abort();
      const aborter = new AbortController();
      suggestAbortRef.current = aborter;

      setSearchSuggestionsLoading(true);
      try {
        const url = q
          ? `/api/public/posts?q=${encodeURIComponent(q)}&limit=6&sort=latest`
          : `/api/public/posts?limit=6&sort=popular`;
        const res = await fetch(url, { signal: aborter.signal });
        const json = await res.json();
        const items = Array.isArray(json?.data) ? json.data : [];
        setSearchSuggestions(items);
      } catch (err: any) {
        if (err?.name !== "AbortError") setSearchSuggestions([]);
      } finally {
        setSearchSuggestionsLoading(false);
      }
    }, q ? 320 : 120);

    return () => {
      if (suggestTimerRef.current) window.clearTimeout(suggestTimerRef.current);
      suggestTimerRef.current = null;
    };
  }, [searchOpen, searchValue]);

  const buildPostHref = useCallback((post: any) => {
    const slug = String(post?.slug || "").trim();
    if (!slug) return "#";
    const catSlug = String(post?.category?.slug || "berita").trim() || "berita";
    return `/${catSlug}/${slug}`;
  }, []);

  const getPostThumbUrl = useCallback((post: any) => {
    const url = String(post?.image || post?.featuredImage?.fileUrl || "").trim();
    return url || null;
  }, []);

  const formatDateId = useCallback((value?: string | Date | null) => {
    if (!value) return "";
    const d = typeof value === "string" ? new Date(value) : value;
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    const isDark = document.documentElement.classList.contains("public-dark");
    setPublicTheme(isDark ? "dark" : "light");
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 768) setViewportDevice("mobile");
      else if (w <= 1024) setViewportDevice("tablet");
      else setViewportDevice("desktop");
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
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

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [stickyLayout, setStickyLayout] = useState<Record<string, { top: number; z: number }>>({});

  useLayoutEffect(() => {
    if (!headerBlocks) {
      setStickyLayout({});
      return;
    }
    const sections = headerBlocks
      .filter((b) => (b as any).type === "section" && ((b as any).isActive ?? true))
      .sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0));

    const isTruthy = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";
    const stickyIds = sections
      .filter((s) => isTruthy((s as any)?.config?.sticky))
      .map((s) => String((s as any).id));

    if (stickyIds.length === 0) {
      setStickyLayout({});
      return;
    }

    const compute = () => {
      let top = 0;
      const next: Record<string, { top: number; z: number }> = {};
      let z = 60;
      for (const id of stickyIds) {
        const el = sectionRefs.current[id];
        if (!el) continue;
        const style = window.getComputedStyle(el);
        const mt = Number.parseFloat(style.marginTop || "0");
        const mb = Number.parseFloat(style.marginBottom || "0");
        top += Number.isFinite(mt) ? mt : 0;
        next[id] = { top, z };
        const rect = el.getBoundingClientRect();
        top += rect.height + (Number.isFinite(mb) ? mb : 0);
        z += 1;
      }
      setStickyLayout(next);
    };

    compute();
    const ro = new ResizeObserver(() => compute());
    for (const id of stickyIds) {
      const el = sectionRefs.current[id];
      if (el) ro.observe(el);
    }
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [headerBlocks]);

  const renderLogo = useCallback(() => (
    <Link href="/" className="font-serif font-bold text-3xl tracking-tight text-gray-900">
      {logoUrl ? (
        <Image src={logoUrl} alt={siteName} width={200} height={40} unoptimized className="h-10 w-auto object-contain" />
      ) : (
        <span>{siteName}</span>
      )}
    </Link>
  ), [logoUrl, siteName]);

  const renderDesktopNav = useCallback((items: PublicMenuItem[]) => (
    <nav className="hidden md:flex items-center gap-8">
      <DesktopMenu items={items} />
    </nav>
  ), []);

  const renderComponent = useCallback((c: HeaderComponent, device: "desktop" | "mobile") => {
    if (c.type === "LOGO") return <div key={c.id}>{renderLogo()}</div>;
    if (c.type === "MOBILE_MENU_TOGGLE") {
      if (device !== "mobile") return null;
      return (
        <button key={c.id} type="button" onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-gray-600" aria-label="Buka menu">
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
            setPublicTheme(nextTheme);
            document.documentElement.classList.toggle("public-dark", nextTheme === "dark");
            try {
              localStorage.setItem("public-theme", nextTheme);
            } catch {}
            try {
              document.cookie = `public-theme=${encodeURIComponent(nextTheme)}; Max-Age=31536000; Path=/; SameSite=Lax`;
            } catch {}
          }}
          className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
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
          className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          <Search size={20} />
        </button>
      );
    if (c.type === "LOGIN_BUTTON") return (
      <Link key={c.id} href="/login" className="hidden sm:inline-flex px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
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
      const capKey = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
      const getCfg = (key: string) => {
        if (viewportDevice === "desktop") return cfg?.[key];
        const prefixed = `${viewportDevice}${capKey(key)}`;
        return cfg?.[prefixed] ?? cfg?.[key];
      };
      const normalizeColor = (value: unknown) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined);
      const normalizePx = (value: unknown) => {
        if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
        if (typeof value !== "string") return undefined;
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
        return trimmed;
      };
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
              const q = searchValue.trim();
              if (!q) return;
              router.push(`/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <div className="hb-searchbar-box">
              <span className="hb-searchbar-icon" aria-hidden="true">
                <Search size={16} />
              </span>
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
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
          onClick={() => setSearchOpen(true)}
        >
          <Search size={20} />
        </button>
      );
    }
    if (type === "header_theme_toggle") {
      if (!themeMounted) return null;
      const isLight = publicTheme === "light";
      const cfg = child?.config || {};
      const capKey = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
      const getCfg = (key: string) => {
        if (viewportDevice === "desktop") return cfg?.[key];
        const prefixed = `${viewportDevice}${capKey(key)}`;
        return cfg?.[prefixed] ?? cfg?.[key];
      };
      const normalizeColor = (value: unknown) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined);
      const normalizePx = (value: unknown) => {
        if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
        if (typeof value !== "string") return undefined;
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
        return trimmed;
      };
      const color = normalizeColor(getCfg("themeColor"));
      const hover = normalizeColor(getCfg("themeHoverColor"));
      const iconSize = normalizePx(getCfg("themeIconSize"));
      const padTop = normalizePx(getCfg("paddingTop"));
      const padRight = normalizePx(getCfg("paddingRight"));
      const padBottom = normalizePx(getCfg("paddingBottom"));
      const padLeft = normalizePx(getCfg("paddingLeft"));
      return (
        <button
          key={child.id}
          type="button"
          onClick={() => {
            const nextTheme = publicTheme === "light" ? "dark" : "light";
            setPublicTheme(nextTheme);
            document.documentElement.classList.toggle("public-dark", nextTheme === "dark");
            try {
              localStorage.setItem("public-theme", nextTheme);
            } catch {}
            try {
              document.cookie = `public-theme=${encodeURIComponent(nextTheme)}; Max-Age=31536000; Path=/; SameSite=Lax`;
            } catch {}
          }}
          className="hb-theme-btn"
          style={
            {
              ["--hb-theme-color" as any]: color,
              ["--hb-theme-hover" as any]: hover,
              ["--hb-theme-icon" as any]: iconSize,
              paddingTop: padTop,
              paddingRight: padRight,
              paddingBottom: padBottom,
              paddingLeft: padLeft,
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
      return (
        <Link key={child.id} href="/login" className="hidden sm:inline-flex px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          Masuk
        </Link>
      );
    }
    if (type === "header_mobile_menu_toggle") {
      return (
        <button key={child.id} type="button" onClick={() => setMobileOpen(true)} className="hb-mt-btn -ml-2 md:hidden" aria-label="Buka menu">
          <Menu size={24} />
        </button>
      );
    }
    if (type === "ad_banner") {
      const hideWhenEmpty = typeof child?.config?.hideWhenEmpty === "boolean" ? child.config.hideWhenEmpty : true;
      return <AdBanner key={child.id} block={child} hideWhenEmpty={hideWhenEmpty} ignorePadding />;
    }
    return null;
  }, [effectivePrimary, effectiveSecondary, logoUrl, publicTheme, renderDesktopNav, router, searchValue, siteName, themeMounted, viewportDevice]);

  const renderedFromBlocks = useMemo(() => {
    if (!headerBlocks) return null;
    const sections = headerBlocks
      .filter((b) => (b as any).type === "section" && ((b as any).isActive ?? true))
      .sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0));
    if (sections.length === 0) return null;

    const formatSize = (raw: unknown, fallback: string) => {
      if (raw === undefined || raw === null) return fallback;
      if (typeof raw === "number" && Number.isFinite(raw)) return `${raw}px`;
      if (typeof raw !== "string") return fallback;
      const trimmed = raw.trim();
      if (!trimmed) return fallback;
      if (/^\d+$/.test(trimmed)) return `${trimmed}px`;
      return trimmed;
    };
    const resolveMaxWidth = (mode: string, custom: unknown) => {
      const boxedFallback = "var(--container-width, 1250px)";
      if (mode === "full") return "100%";
      if (mode === "narrow") return "1000px";
      if (mode === "custom") return formatSize(custom, boxedFallback);
      return boxedFallback;
    };
    const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);
    const getResponsive = (cfg: any, key: string, device: "desktop" | "tablet" | "mobile") => {
      if (device === "desktop") return cfg?.[key];
      const prefixed = `${device}${cap(key)}`;
      return cfg?.[prefixed] ?? cfg?.[key];
    };
    const numPx = (raw: unknown, fallback: number) => {
      if (typeof raw === "number" && Number.isFinite(raw)) return `${raw}px`;
      if (typeof raw === "string" && raw.trim() !== "") {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) return `${parsed}px`;
      }
      return `${fallback}px`;
    };
    const resolveBgImage = (url: unknown, overlay: unknown) => {
      if (typeof url !== "string" || url.trim() === "") return "none";
      if (typeof overlay === "string" && overlay.trim() !== "") {
        return `linear-gradient(${overlay}, ${overlay}), url(${url})`;
      }
      return `url(${url})`;
    };
    const resolveOptionalPx = (raw: unknown) => {
      if (typeof raw === "number" && Number.isFinite(raw)) return `${raw}px`;
      if (typeof raw === "string" && raw.trim() !== "") {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) return `${parsed}px`;
      }
      return undefined;
    };
    const resolveLogoSizeVars = (cfg: any) => {
      const desktopH = resolveOptionalPx(getResponsive(cfg, "logoHeight", "desktop")) || "40px";
      const tabletH = resolveOptionalPx(getResponsive(cfg, "logoHeight", "tablet")) || desktopH;
      const mobileH = resolveOptionalPx(getResponsive(cfg, "logoHeight", "mobile")) || desktopH;
      const desktopMaxW = resolveOptionalPx(getResponsive(cfg, "logoMaxWidth", "desktop"));
      const tabletMaxW = resolveOptionalPx(getResponsive(cfg, "logoMaxWidth", "tablet")) || desktopMaxW;
      const mobileMaxW = resolveOptionalPx(getResponsive(cfg, "logoMaxWidth", "mobile")) || desktopMaxW;
      const desktopText = resolveOptionalPx(getResponsive(cfg, "logoTextSize", "desktop")) || "28px";
      const tabletText = resolveOptionalPx(getResponsive(cfg, "logoTextSize", "tablet")) || desktopText;
      const mobileText = resolveOptionalPx(getResponsive(cfg, "logoTextSize", "mobile")) || desktopText;
      return { desktopH, tabletH, mobileH, desktopMaxW, tabletMaxW, mobileMaxW, desktopText, tabletText, mobileText };
    };
    const resolveAdSizeVars = (cfg: any) => {
      const desktopMaxW = resolveOptionalPx(getResponsive(cfg, "maxWidth", "desktop"));
      const tabletMaxW = resolveOptionalPx(getResponsive(cfg, "maxWidth", "tablet")) || desktopMaxW;
      const mobileMaxW = resolveOptionalPx(getResponsive(cfg, "maxWidth", "mobile")) || desktopMaxW;
      return { desktopMaxW, tabletMaxW, mobileMaxW };
    };
    const resolveBoxSpacing = (cfg: any, includePadding: boolean) => {
      const device = viewportDevice as "desktop" | "tablet" | "mobile";
      const mt = resolveOptionalPx(getResponsive(cfg, "marginTop", device));
      const mr = resolveOptionalPx(getResponsive(cfg, "marginRight", device));
      const mb = resolveOptionalPx(getResponsive(cfg, "marginBottom", device));
      const ml = resolveOptionalPx(getResponsive(cfg, "marginLeft", device));
      const pt = includePadding ? resolveOptionalPx(getResponsive(cfg, "paddingTop", device)) : undefined;
      const pr = includePadding ? resolveOptionalPx(getResponsive(cfg, "paddingRight", device)) : undefined;
      const pb = includePadding ? resolveOptionalPx(getResponsive(cfg, "paddingBottom", device)) : undefined;
      const pl = includePadding ? resolveOptionalPx(getResponsive(cfg, "paddingLeft", device)) : undefined;
      return {
        marginTop: mt,
        marginRight: mr,
        marginBottom: mb,
        marginLeft: ml,
        paddingTop: pt,
        paddingRight: pr,
        paddingBottom: pb,
        paddingLeft: pl,
      } as any;
    };

    const shadowValue = (s: string) => {
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
    const radiusValue = (r: string) => {
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
    const toNum = (raw: unknown) => {
      if (typeof raw === "number" && Number.isFinite(raw)) return raw;
      if (typeof raw === "string" && raw.trim() !== "") {
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) return parsed;
      }
      return 0;
    };

    return (
      <>
        <style>{`
          .hb-section { width: 100%; }
          .hb-sticky { position: sticky; top: var(--hb-sticky-top, 0px); z-index: var(--hb-sticky-z, 60); }
          .hb-inner {
            width: 100%;
            margin-left: auto;
            margin-right: auto;
            box-sizing: border-box;
          }
          .hb-surface {
            width: 100%;
            box-sizing: border-box;
            background-color: var(--hb-desktop-bg-color, transparent);
            background-image: var(--hb-desktop-bg-image, none);
            background-size: var(--hb-desktop-bg-size, cover);
            background-position: center;
            background-repeat: no-repeat;
            padding-top: var(--hb-desktop-pad-top, 0px);
            padding-bottom: var(--hb-desktop-pad-bottom, 0px);
            padding-left: var(--hb-desktop-pad-left, 0px);
            padding-right: var(--hb-desktop-pad-right, 0px);
          }
          .public-theme .hb-surface {
            border-style: var(--hb-desktop-border-style, none);
            border-color: var(--hb-desktop-border-color, transparent);
            border-top-width: var(--hb-desktop-border-top, 0px);
            border-right-width: var(--hb-desktop-border-right, 0px);
            border-bottom-width: var(--hb-desktop-border-bottom, 0px);
            border-left-width: var(--hb-desktop-border-left, 0px);
            box-shadow: var(--hb-desktop-shadow, none);
            border-radius: var(--hb-desktop-radius, 0px);
          }
          .hb-row { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; align-items: center; }
          .hb-logo { display: inline-flex; align-items: center; max-width: var(--hb-logo-maxw, none); }
          .hb-logo img { height: var(--hb-logo-h, 40px) !important; width: auto !important; max-width: 100% !important; object-fit: contain; }
          .hb-logo .hb-logo-text { font-size: var(--hb-logo-text, 28px); line-height: 1.1; }
          .hb-logo .hb-logo-dark { display: none !important; }
          html.public-dark .hb-logo .hb-logo-light { display: none !important; }
          html.public-dark .hb-logo .hb-logo-dark { display: block !important; }
          .hb-menu { --hb-menu-color: var(--hb-menu-desktop-color, var(--header-menu-color)); --hb-menu-hover: var(--hb-menu-desktop-hover, var(--accent)); --hb-menu-weight: var(--hb-menu-desktop-weight, 500); --hb-menu-font: var(--hb-menu-desktop-font, inherit); --hb-menu-size: var(--hb-menu-desktop-size, 12px); }
          .hb-menu a { color: var(--hb-menu-color) !important; font-weight: var(--hb-menu-weight) !important; font-family: var(--hb-menu-font) !important; font-size: var(--hb-menu-size) !important; }
          .hb-menu a:hover { color: var(--hb-menu-hover) !important; }
          .public-theme .hb-menu a:hover { color: var(--hb-menu-hover) !important; }
          .hb-menu .font-light,
          .hb-menu .font-normal,
          .hb-menu .font-medium,
          .hb-menu .font-semibold,
          .hb-menu .font-bold,
          .hb-menu .font-extrabold { font-weight: var(--hb-menu-weight) !important; }
          .hb-menu .hover\:text-indigo-600:hover { color: var(--hb-menu-hover) !important; }
          .hb-menu .hover\:text-blue-600:hover { color: var(--hb-menu-hover) !important; }
          .public-theme .hb-menu .hover\:text-indigo-600:hover { color: var(--hb-menu-hover) !important; }
          .public-theme .hb-menu .hover\:text-blue-600:hover { color: var(--hb-menu-hover) !important; }
          .hb-menu .text-xs,
          .hb-menu .text-sm,
          .hb-menu .text-base { font-size: var(--hb-menu-size) !important; }
          .hb-search { --hb-search-color: var(--hb-search-desktop-color, #6b7280); --hb-search-hover: var(--hb-search-desktop-hover, var(--accent)); --hb-search-icon: var(--hb-search-desktop-icon, 20px); --hb-search-input-color: var(--hb-search-desktop-input, var(--home-news-title-color, #111827)); --hb-search-bg: var(--hb-search-desktop-bg, #ffffff); --hb-search-border: var(--hb-search-desktop-border, #e5e7eb); --hb-search-radius: var(--hb-search-desktop-radius, 999px); --hb-search-height: var(--hb-search-desktop-height, 38px); --hb-search-font: var(--hb-search-desktop-font, 14px); --hb-search-button-bg: var(--hb-search-desktop-btnbg, #ffffff); --hb-search-button-text: var(--hb-search-desktop-btntxt, #111827); }
          .hb-search-btn,
          .hb-search .hb-search-btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px; border: 0; background: transparent; cursor: pointer; border-radius: 10px; color: var(--hb-search-color, #6b7280) !important; }
          .hb-search-btn:hover,
          .hb-search .hb-search-btn:hover { color: var(--hb-search-hover, var(--accent)) !important; }
          .public-theme .hb-search-btn:hover,
          .public-theme .hb-search .hb-search-btn:hover { color: var(--hb-search-hover, var(--accent)) !important; }
          .hb-search-btn svg,
          .hb-search svg { width: var(--hb-search-icon, 20px) !important; height: var(--hb-search-icon, 20px) !important; }
          .hb-searchbar { width: 100%; }
          .hb-searchbar-box { width: 100%; display: flex; align-items: center; height: var(--hb-search-height); border: 1px solid var(--hb-search-border, #e5e7eb); border-radius: var(--hb-search-radius); background: var(--hb-search-bg, #ffffff); overflow: hidden; }
          .hb-searchbar-icon { display: inline-flex; align-items: center; justify-content: center; padding-left: 12px; padding-right: 6px; color: var(--hb-search-color, #111827); }
          .hb-searchbar-input { flex: 1; min-width: 0; height: 100%; border: 0; outline: none; background: transparent; color: var(--hb-search-input-color, var(--hb-search-color, #111827)); -webkit-text-fill-color: var(--hb-search-input-color, var(--hb-search-color, #111827)); caret-color: var(--hb-search-hover, var(--accent)); font-size: var(--hb-search-font); padding: 0 10px 0 0; }
          .hb-searchbar-input::placeholder { color: color-mix(in srgb, var(--hb-search-input-color, var(--hb-search-color, #111827)) 55%, transparent); }
          .hb-searchbar-button { height: 100%; border: 0; outline: none; background: var(--hb-search-button-bg); color: var(--hb-search-button-text); font-size: var(--hb-search-font); padding: 0 14px; border-left: 1px solid var(--hb-search-border); }
          .hb-searchbar-button:hover { color: var(--hb-search-hover); }
          .hb-theme { --hb-theme-color: var(--hb-theme-desktop-color, #6b7280); --hb-theme-hover: var(--hb-theme-desktop-hover, var(--accent)); --hb-theme-icon: var(--hb-theme-desktop-icon, 20px); }
          .hb-theme .hb-theme-btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px; border: 0; background: transparent; cursor: pointer; border-radius: 10px; color: var(--hb-theme-color) !important; }
          .hb-theme .hb-theme-btn:hover { color: var(--hb-theme-hover) !important; }
          .public-theme .hb-theme .hb-theme-btn:hover { color: var(--hb-theme-hover) !important; }
          .hb-theme svg { width: var(--hb-theme-icon) !important; height: var(--hb-theme-icon) !important; }
          .hb-mobile-toggle { --hb-mt-color: var(--hb-mt-desktop-color, #6b7280); --hb-mt-hover: var(--hb-mt-desktop-hover, var(--accent)); --hb-mt-icon: var(--hb-mt-desktop-icon, 24px); --hb-mt-bg: var(--hb-mt-desktop-bg, transparent); --hb-mt-bghover: var(--hb-mt-desktop-bghover, transparent); --hb-mt-radius: var(--hb-mt-desktop-radius, 10px); --hb-mt-pad: var(--hb-mt-desktop-pad, 8px); }
          .hb-mobile-toggle .hb-mt-btn { display: inline-flex; align-items: center; justify-content: center; padding: var(--hb-mt-pad) !important; border: 0; background: var(--hb-mt-bg) !important; cursor: pointer; border-radius: var(--hb-mt-radius) !important; color: var(--hb-mt-color) !important; }
          .hb-mobile-toggle .hb-mt-btn:hover { color: var(--hb-mt-hover) !important; background: var(--hb-mt-bghover) !important; }
          .public-theme .hb-mobile-toggle .hb-mt-btn:hover { color: var(--hb-mt-hover) !important; background: var(--hb-mt-bghover) !important; }
          .hb-mobile-toggle .hb-mt-btn svg { color: inherit !important; }
          .hb-mobile-toggle svg { width: var(--hb-mt-icon) !important; height: var(--hb-mt-icon) !important; }
          .hb-drawer { position: fixed; inset: 0; z-index: 100; }
          .hb-drawer-overlay { position: absolute; inset: 0; border: 0; background: var(--hb-drawer-overlay-color, #000); opacity: 0; transition: opacity var(--hb-drawer-duration, 240ms) var(--hb-drawer-ease, cubic-bezier(0.22, 1, 0.36, 1)); }
          .hb-drawer-open .hb-drawer-overlay { opacity: var(--hb-drawer-overlay-opacity, 0.3); }
          .hb-drawer-panel { position: absolute; top: 0; bottom: 0; width: var(--hb-drawer-width, 85%); max-width: var(--hb-drawer-maxw, 420px); background: var(--hb-drawer-bg, #fff); color: var(--hb-drawer-text, #111827); box-shadow: 0 10px 25px rgba(0,0,0,0.18); display: flex; flex-direction: column; will-change: transform, opacity; backface-visibility: hidden; transform: translateZ(0); transition: transform var(--hb-drawer-duration, 240ms) var(--hb-drawer-ease, cubic-bezier(0.22, 1, 0.36, 1)), opacity var(--hb-drawer-duration, 240ms) var(--hb-drawer-ease, cubic-bezier(0.22, 1, 0.36, 1)); }
          .hb-drawer-top { height: 64px; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--hb-drawer-divider, #f3f4f6); }
          .hb-drawer-top-left { flex: 1; min-width: 0; display: flex; align-items: center; }
          .hb-drawer-brand { display: inline-flex; align-items: center; gap: 10px; min-width: 0; text-decoration: none; color: var(--hb-drawer-link, #111827); font-weight: 800; }
          .hb-drawer-brand:hover { color: var(--hb-drawer-link-hover, var(--accent)); }
          .hb-drawer-brand-logo { display: inline-flex; align-items: center; max-width: 180px; }
          .hb-drawer-brand-logo img { width: auto !important; height: 34px !important; object-fit: contain; }
          .hb-drawer-brand-text { font-size: 15px; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .hb-drawer-search { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; }
          .hb-drawer-search-input { flex: 1; min-width: 0; height: 38px; border-radius: 12px; border: 1px solid var(--hb-drawer-divider, #f3f4f6); background: var(--hb-drawer-bg, #fff); padding: 0 12px; font-size: 13px; color: var(--hb-drawer-text, #111827); -webkit-text-fill-color: var(--hb-drawer-text, #111827); caret-color: var(--hb-drawer-link-hover, var(--accent)); outline: none; }
          .hb-drawer-search-input::placeholder { color: rgba(107, 114, 128, 0.9); opacity: 1; }
          .hb-drawer-search-input:focus { border-color: var(--hb-drawer-link-hover, var(--accent)); }
          .hb-drawer-search-btn { height: 38px; padding: 0 12px; border-radius: 12px; border: 1px solid var(--hb-drawer-divider, #f3f4f6); background: var(--hb-drawer-bg, #fff); color: var(--hb-drawer-link, #111827); font-size: 13px; font-weight: 700; cursor: pointer; }
          .hb-drawer-search-btn:hover { color: var(--hb-drawer-link-hover, var(--accent)); border-color: var(--hb-drawer-link-hover, var(--accent)); }
          .hb-drawer-close { display: inline-flex; align-items: center; justify-content: center; border: 0; background: transparent; cursor: pointer; padding: 8px; border-radius: 12px; color: var(--hb-drawer-text, #111827); }
          .hb-drawer-close:hover { color: var(--hb-drawer-link-hover, var(--accent)); }
          .hb-drawer-body { flex: 1; overflow: auto; padding: 4px 0; -webkit-overflow-scrolling: touch; }
          .hb-drawer-item { border-bottom: 1px solid var(--hb-drawer-divider, #f3f4f6); }
          .hb-drawer-item-row { display: flex; align-items: center; justify-content: space-between; }
          .hb-drawer-link { flex: 1; padding: 12px 16px; font-size: 14px; font-weight: 600; color: var(--hb-drawer-link, #111827); text-decoration: none; }
          .hb-drawer-link:hover { color: var(--hb-drawer-link-hover, var(--accent)); }
          .hb-drawer-expand { padding: 12px 16px; border: 0; background: transparent; cursor: pointer; color: var(--hb-drawer-text, #6b7280); }
          .hb-drawer-sub { padding: 0 0 10px; }
          .hb-drawer-sublink { display: block; padding: 8px 20px; font-size: 13px; color: var(--hb-drawer-link, #111827); opacity: 0.78; text-decoration: none; }
          .hb-drawer-sublink:hover { color: var(--hb-drawer-link-hover, var(--accent)); }
          .hb-drawer-footer { padding: 14px 16px 16px; border-top: 1px solid var(--hb-drawer-divider, #f3f4f6); }
          .hb-drawer-footer-text { white-space: pre-line; font-size: 12px; color: var(--hb-drawer-text, #111827); opacity: 0.75; margin-top: 10px; }
          .hb-drawer-social { display: flex; gap: 8px; flex-wrap: wrap; }
          .hb-drawer-social-link { width: 38px; height: 38px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: var(--hb-drawer-social-color, #6b7280); text-decoration: none; border: 1px solid var(--hb-drawer-divider, #f3f4f6); background: var(--hb-drawer-bg, #fff); }
          .hb-drawer-social-link:hover { color: var(--hb-drawer-social-hover, var(--accent)); border-color: var(--hb-drawer-social-hover, var(--accent)); }
          .hb-drawer-social-link svg { width: var(--hb-drawer-social-size, 20px); height: var(--hb-drawer-social-size, 20px); }
          .hb-drawer-side-left .hb-drawer-panel { left: 0; }
          .hb-drawer-side-right .hb-drawer-panel { right: 0; }
          .hb-drawer-effect-slide.hb-drawer-side-left .hb-drawer-panel { transform: translate3d(-100%, 0, 0); }
          .hb-drawer-effect-slide.hb-drawer-side-right .hb-drawer-panel { transform: translate3d(100%, 0, 0); }
          .hb-drawer-effect-slide.hb-drawer-open .hb-drawer-panel { transform: translate3d(0, 0, 0); }
          .hb-drawer-effect-fade .hb-drawer-panel { opacity: 0; transform: translateX(0); }
          .hb-drawer-effect-fade.hb-drawer-open .hb-drawer-panel { opacity: 1; }
          @media (prefers-reduced-motion: reduce) {
            .hb-drawer-overlay,
            .hb-drawer-panel { transition: none !important; }
          }
          .hb-ad { width: 100%; max-width: var(--hb-ad-maxw, 100%); }
          .hb-ad > div { width: 100%; }
          @media (max-width: 767px) {
            .hb-inner {
              max-width: var(--hb-mobile-max, 100%);
            }
            .hb-surface {
              background-color: var(--hb-mobile-bg-color, var(--hb-desktop-bg-color, transparent));
              background-image: var(--hb-mobile-bg-image, var(--hb-desktop-bg-image, none));
              background-size: var(--hb-mobile-bg-size, var(--hb-desktop-bg-size, cover));
              padding-top: var(--hb-mobile-pad-top, var(--hb-desktop-pad-top, 0px));
              padding-bottom: var(--hb-mobile-pad-bottom, var(--hb-desktop-pad-bottom, 0px));
              padding-left: var(--hb-mobile-pad-left, var(--hb-desktop-pad-left, 0px));
              padding-right: var(--hb-mobile-pad-right, var(--hb-desktop-pad-right, 0px));
            }
            .public-theme .hb-surface {
              border-style: var(--hb-mobile-border-style, var(--hb-desktop-border-style, none));
              border-color: var(--hb-mobile-border-color, var(--hb-desktop-border-color, transparent));
              border-top-width: var(--hb-mobile-border-top, var(--hb-desktop-border-top, 0px));
              border-right-width: var(--hb-mobile-border-right, var(--hb-desktop-border-right, 0px));
              border-bottom-width: var(--hb-mobile-border-bottom, var(--hb-desktop-border-bottom, 0px));
              border-left-width: var(--hb-mobile-border-left, var(--hb-desktop-border-left, 0px));
              box-shadow: var(--hb-mobile-shadow, var(--hb-desktop-shadow, none));
              border-radius: var(--hb-mobile-radius, var(--hb-desktop-radius, 0px));
            }
            .hb-row { align-items: flex-start; }
            .hb-logo { --hb-logo-h: var(--hb-logo-mobile-h, var(--hb-logo-desktop-h, 40px)); --hb-logo-maxw: var(--hb-logo-mobile-maxw, var(--hb-logo-desktop-maxw, none)); --hb-logo-text: var(--hb-logo-mobile-text, var(--hb-logo-desktop-text, 28px)); }
            .hb-menu { --hb-menu-color: var(--hb-menu-mobile-color, var(--hb-menu-desktop-color, var(--header-menu-color))); --hb-menu-hover: var(--hb-menu-mobile-hover, var(--hb-menu-desktop-hover, var(--accent))); --hb-menu-weight: var(--hb-menu-mobile-weight, var(--hb-menu-desktop-weight, 500)); --hb-menu-font: var(--hb-menu-mobile-font, var(--hb-menu-desktop-font, inherit)); --hb-menu-size: var(--hb-menu-mobile-size, var(--hb-menu-desktop-size, 12px)); }
            .hb-search { --hb-search-color: var(--hb-search-mobile-color, var(--hb-search-desktop-color, #6b7280)); --hb-search-hover: var(--hb-search-mobile-hover, var(--hb-search-desktop-hover, var(--accent))); --hb-search-icon: var(--hb-search-mobile-icon, var(--hb-search-desktop-icon, 20px)); --hb-search-input-color: var(--hb-search-mobile-input, var(--hb-search-desktop-input, var(--home-news-title-color, #111827))); --hb-search-bg: var(--hb-search-mobile-bg, var(--hb-search-desktop-bg, #ffffff)); --hb-search-border: var(--hb-search-mobile-border, var(--hb-search-desktop-border, #e5e7eb)); --hb-search-radius: var(--hb-search-mobile-radius, var(--hb-search-desktop-radius, 999px)); --hb-search-height: var(--hb-search-mobile-height, var(--hb-search-desktop-height, 38px)); --hb-search-font: var(--hb-search-mobile-font, var(--hb-search-desktop-font, 14px)); --hb-search-button-bg: var(--hb-search-mobile-btnbg, var(--hb-search-desktop-btnbg, #ffffff)); --hb-search-button-text: var(--hb-search-mobile-btntxt, var(--hb-search-desktop-btntxt, #111827)); }
            .hb-theme { --hb-theme-color: var(--hb-theme-mobile-color, var(--hb-theme-desktop-color, #6b7280)); --hb-theme-hover: var(--hb-theme-mobile-hover, var(--hb-theme-desktop-hover, var(--accent))); --hb-theme-icon: var(--hb-theme-mobile-icon, var(--hb-theme-desktop-icon, 20px)); }
            .hb-mobile-toggle { --hb-mt-color: var(--hb-mt-mobile-color, var(--hb-mt-desktop-color, #6b7280)); --hb-mt-hover: var(--hb-mt-mobile-hover, var(--hb-mt-desktop-hover, var(--accent))); --hb-mt-icon: var(--hb-mt-mobile-icon, var(--hb-mt-desktop-icon, 24px)); --hb-mt-bg: var(--hb-mt-mobile-bg, var(--hb-mt-desktop-bg, transparent)); --hb-mt-bghover: var(--hb-mt-mobile-bghover, var(--hb-mt-desktop-bghover, transparent)); --hb-mt-radius: var(--hb-mt-mobile-radius, var(--hb-mt-desktop-radius, 10px)); --hb-mt-pad: var(--hb-mt-mobile-pad, var(--hb-mt-desktop-pad, 8px)); }
            .hb-ad { --hb-ad-maxw: var(--hb-ad-mobile-maxw, var(--hb-ad-desktop-maxw, 100%)); }
            .hide-mobile-widget { display: none !important; }
          }
          @media (min-width: 768px) and (max-width: 1024px) {
            .hb-inner {
              max-width: var(--hb-tablet-max, 100%);
            }
            .hb-surface {
              background-color: var(--hb-tablet-bg-color, var(--hb-desktop-bg-color, transparent));
              background-image: var(--hb-tablet-bg-image, var(--hb-desktop-bg-image, none));
              background-size: var(--hb-tablet-bg-size, var(--hb-desktop-bg-size, cover));
              padding-top: var(--hb-tablet-pad-top, var(--hb-desktop-pad-top, 0px));
              padding-bottom: var(--hb-tablet-pad-bottom, var(--hb-desktop-pad-bottom, 0px));
              padding-left: var(--hb-tablet-pad-left, var(--hb-desktop-pad-left, 0px));
              padding-right: var(--hb-tablet-pad-right, var(--hb-desktop-pad-right, 0px));
            }
            .public-theme .hb-surface {
              border-style: var(--hb-tablet-border-style, var(--hb-desktop-border-style, none));
              border-color: var(--hb-tablet-border-color, var(--hb-desktop-border-color, transparent));
              border-top-width: var(--hb-tablet-border-top, var(--hb-desktop-border-top, 0px));
              border-right-width: var(--hb-tablet-border-right, var(--hb-desktop-border-right, 0px));
              border-bottom-width: var(--hb-tablet-border-bottom, var(--hb-desktop-border-bottom, 0px));
              border-left-width: var(--hb-tablet-border-left, var(--hb-desktop-border-left, 0px));
              box-shadow: var(--hb-tablet-shadow, var(--hb-desktop-shadow, none));
              border-radius: var(--hb-tablet-radius, var(--hb-desktop-radius, 0px));
            }
            .hb-row { align-items: flex-start; }
            .hb-logo { --hb-logo-h: var(--hb-logo-tablet-h, var(--hb-logo-desktop-h, 40px)); --hb-logo-maxw: var(--hb-logo-tablet-maxw, var(--hb-logo-desktop-maxw, none)); --hb-logo-text: var(--hb-logo-tablet-text, var(--hb-logo-desktop-text, 28px)); }
            .hb-menu { --hb-menu-color: var(--hb-menu-tablet-color, var(--hb-menu-desktop-color, var(--header-menu-color))); --hb-menu-hover: var(--hb-menu-tablet-hover, var(--hb-menu-desktop-hover, var(--accent))); --hb-menu-weight: var(--hb-menu-tablet-weight, var(--hb-menu-desktop-weight, 500)); --hb-menu-font: var(--hb-menu-tablet-font, var(--hb-menu-desktop-font, inherit)); --hb-menu-size: var(--hb-menu-tablet-size, var(--hb-menu-desktop-size, 12px)); }
            .hb-search { --hb-search-color: var(--hb-search-tablet-color, var(--hb-search-desktop-color, #6b7280)); --hb-search-hover: var(--hb-search-tablet-hover, var(--hb-search-desktop-hover, var(--accent))); --hb-search-icon: var(--hb-search-tablet-icon, var(--hb-search-desktop-icon, 20px)); --hb-search-input-color: var(--hb-search-tablet-input, var(--hb-search-desktop-input, var(--home-news-title-color, #111827))); --hb-search-bg: var(--hb-search-tablet-bg, var(--hb-search-desktop-bg, #ffffff)); --hb-search-border: var(--hb-search-tablet-border, var(--hb-search-desktop-border, #e5e7eb)); --hb-search-radius: var(--hb-search-tablet-radius, var(--hb-search-desktop-radius, 999px)); --hb-search-height: var(--hb-search-tablet-height, var(--hb-search-desktop-height, 38px)); --hb-search-font: var(--hb-search-tablet-font, var(--hb-search-desktop-font, 14px)); --hb-search-button-bg: var(--hb-search-tablet-btnbg, var(--hb-search-desktop-btnbg, #ffffff)); --hb-search-button-text: var(--hb-search-tablet-btntxt, var(--hb-search-desktop-btntxt, #111827)); }
            .hb-theme { --hb-theme-color: var(--hb-theme-tablet-color, var(--hb-theme-desktop-color, #6b7280)); --hb-theme-hover: var(--hb-theme-tablet-hover, var(--hb-theme-desktop-hover, var(--accent))); --hb-theme-icon: var(--hb-theme-tablet-icon, var(--hb-theme-desktop-icon, 20px)); }
            .hb-mobile-toggle { --hb-mt-color: var(--hb-mt-tablet-color, var(--hb-mt-desktop-color, #6b7280)); --hb-mt-hover: var(--hb-mt-tablet-hover, var(--hb-mt-desktop-hover, var(--accent))); --hb-mt-icon: var(--hb-mt-tablet-icon, var(--hb-mt-desktop-icon, 24px)); --hb-mt-bg: var(--hb-mt-tablet-bg, var(--hb-mt-desktop-bg, transparent)); --hb-mt-bghover: var(--hb-mt-tablet-bghover, var(--hb-mt-desktop-bghover, transparent)); --hb-mt-radius: var(--hb-mt-tablet-radius, var(--hb-mt-desktop-radius, 10px)); --hb-mt-pad: var(--hb-mt-tablet-pad, var(--hb-mt-desktop-pad, 8px)); }
            .hb-ad { --hb-ad-maxw: var(--hb-ad-tablet-maxw, var(--hb-ad-desktop-maxw, 100%)); }
            .hide-tablet-widget { display: none !important; }
          }
          @media (min-width: 1025px) {
            .hb-inner {
              max-width: var(--hb-desktop-max, 100%);
            }
            .hb-surface {
              background-color: var(--hb-desktop-bg-color, transparent);
              background-image: var(--hb-desktop-bg-image, none);
              background-size: var(--hb-desktop-bg-size, cover);
              padding-top: var(--hb-desktop-pad-top, 0px);
              padding-bottom: var(--hb-desktop-pad-bottom, 0px);
              padding-left: var(--hb-desktop-pad-left, 0px);
              padding-right: var(--hb-desktop-pad-right, 0px);
            }
            .hb-logo { --hb-logo-h: var(--hb-logo-desktop-h, 40px); --hb-logo-maxw: var(--hb-logo-desktop-maxw, none); --hb-logo-text: var(--hb-logo-desktop-text, 28px); }
            .hb-ad { --hb-ad-maxw: var(--hb-ad-desktop-maxw, 100%); }
            .hide-desktop-widget { display: none !important; }
          }
        `}</style>
        {sections.map((section) => {
          const cfg = (section as any).config || {};
          const isSticky = cfg.sticky === true || cfg.sticky === "true" || cfg.sticky === 1 || cfg.sticky === "1";
          const sectionId = String((section as any).id);
          const layout = String(cfg.layout || "100");
          const ratios = layout.split("-").map((p: string) => parseInt(p, 10)).filter((n: number) => Number.isFinite(n) && n > 0);
          const colCount = ratios.length > 0 ? ratios.length : 1;
          const children = Array.isArray(cfg.children) ? cfg.children : [];
          const desktopWidthMode = String(getResponsive(cfg, "containerWidth", "desktop") || "boxed").trim().toLowerCase();
          const tabletWidthMode = String(getResponsive(cfg, "containerWidth", "tablet") || desktopWidthMode || "boxed").trim().toLowerCase();
          const mobileWidthMode = String(getResponsive(cfg, "containerWidth", "mobile") || tabletWidthMode || desktopWidthMode || "boxed").trim().toLowerCase();
          const desktopContentWidthMode = desktopWidthMode === "full" ? "boxed" : desktopWidthMode;
          const tabletContentWidthMode = tabletWidthMode === "full" ? "boxed" : tabletWidthMode;
          const mobileContentWidthMode = mobileWidthMode;
          const desktopMax = resolveMaxWidth(desktopContentWidthMode, getResponsive(cfg, "customContainerWidth", "desktop"));
          const tabletMax = resolveMaxWidth(
            tabletContentWidthMode,
            getResponsive(cfg, "customContainerWidth", "tablet") ?? getResponsive(cfg, "customContainerWidth", "desktop")
          );
          const mobileMax = resolveMaxWidth(
            mobileContentWidthMode,
            getResponsive(cfg, "customContainerWidth", "mobile") ?? getResponsive(cfg, "customContainerWidth", "desktop")
          );
          const baseContainerPadX =
            viewportDevice === "mobile"
              ? (mobileContentWidthMode === "full" ? 0 : 16)
              : viewportDevice === "tablet"
                ? (tabletContentWidthMode === "full" ? 0 : 16)
                : (desktopContentWidthMode === "full" ? 0 : 16);
          const desktopBgColor = String(getResponsive(cfg, "backgroundColor", "desktop") || "") || (isSticky ? "#ffffff" : "");
          const tabletBgColor = String(getResponsive(cfg, "backgroundColor", "tablet") || "") || (isSticky ? "#ffffff" : "");
          const mobileBgColor = String(getResponsive(cfg, "backgroundColor", "mobile") || "") || (isSticky ? "#ffffff" : "");
          const desktopBgImage = resolveBgImage(getResponsive(cfg, "backgroundImage", "desktop"), getResponsive(cfg, "overlayColor", "desktop"));
          const tabletBgImage = resolveBgImage(getResponsive(cfg, "backgroundImage", "tablet"), getResponsive(cfg, "overlayColor", "tablet"));
          const mobileBgImage = resolveBgImage(getResponsive(cfg, "backgroundImage", "mobile"), getResponsive(cfg, "overlayColor", "mobile"));
          const desktopBgSize = String(getResponsive(cfg, "backgroundSize", "desktop") || "cover");
          const tabletBgSize = String(getResponsive(cfg, "backgroundSize", "tablet") || desktopBgSize || "cover");
          const mobileBgSize = String(getResponsive(cfg, "backgroundSize", "mobile") || desktopBgSize || "cover");
          const desktopPadTop = numPx(getResponsive(cfg, "paddingTop", "desktop"), 0);
          const desktopPadBottom = numPx(getResponsive(cfg, "paddingBottom", "desktop"), 0);
          const desktopPadLeft = numPx(getResponsive(cfg, "paddingLeft", "desktop"), 0);
          const desktopPadRight = numPx(getResponsive(cfg, "paddingRight", "desktop"), 0);
          const tabletPadTop = numPx(getResponsive(cfg, "paddingTop", "tablet"), parseInt(desktopPadTop, 10) || 0);
          const tabletPadBottom = numPx(getResponsive(cfg, "paddingBottom", "tablet"), parseInt(desktopPadBottom, 10) || 0);
          const tabletPadLeft = numPx(getResponsive(cfg, "paddingLeft", "tablet"), parseInt(desktopPadLeft, 10) || 0);
          const tabletPadRight = numPx(getResponsive(cfg, "paddingRight", "tablet"), parseInt(desktopPadRight, 10) || 0);
          const mobilePadTop = numPx(getResponsive(cfg, "paddingTop", "mobile"), parseInt(desktopPadTop, 10) || 0);
          const mobilePadBottom = numPx(getResponsive(cfg, "paddingBottom", "mobile"), parseInt(desktopPadBottom, 10) || 0);
          const mobilePadLeft = numPx(getResponsive(cfg, "paddingLeft", "mobile"), parseInt(tabletPadLeft, 10) || parseInt(desktopPadLeft, 10) || 0);
          const mobilePadRight = numPx(getResponsive(cfg, "paddingRight", "mobile"), parseInt(tabletPadRight, 10) || parseInt(desktopPadRight, 10) || 0);

          const desktopMarTop = numPx(getResponsive(cfg, "marginTop", "desktop"), 0);
          const desktopMarBottom = numPx(getResponsive(cfg, "marginBottom", "desktop"), 0);
          const desktopMarLeft = numPx(getResponsive(cfg, "marginLeft", "desktop"), 0);
          const desktopMarRight = numPx(getResponsive(cfg, "marginRight", "desktop"), 0);
          const tabletMarTop = numPx(getResponsive(cfg, "marginTop", "tablet"), parseInt(desktopMarTop, 10) || 0);
          const tabletMarBottom = numPx(getResponsive(cfg, "marginBottom", "tablet"), parseInt(desktopMarBottom, 10) || 0);
          const tabletMarLeft = numPx(getResponsive(cfg, "marginLeft", "tablet"), parseInt(desktopMarLeft, 10) || 0);
          const tabletMarRight = numPx(getResponsive(cfg, "marginRight", "tablet"), parseInt(desktopMarRight, 10) || 0);
          const mobileMarTop = numPx(getResponsive(cfg, "marginTop", "mobile"), parseInt(desktopMarTop, 10) || 0);
          const mobileMarBottom = numPx(getResponsive(cfg, "marginBottom", "mobile"), parseInt(desktopMarBottom, 10) || 0);
          const mobileMarLeft = numPx(getResponsive(cfg, "marginLeft", "mobile"), parseInt(desktopMarLeft, 10) || 0);
          const mobileMarRight = numPx(getResponsive(cfg, "marginRight", "mobile"), parseInt(desktopMarRight, 10) || 0);

          const borderStyleDesktopRaw = String(getResponsive(cfg, "borderStyle", "desktop") ?? "none");
          const borderStyleTabletRaw = String(getResponsive(cfg, "borderStyle", "tablet") ?? borderStyleDesktopRaw);
          const borderStyleMobileRaw = String(getResponsive(cfg, "borderStyle", "mobile") ?? borderStyleDesktopRaw);

          const borderColorDesktopRaw = String(getResponsive(cfg, "borderColor", "desktop") ?? "");
          const borderColorTabletRaw = String(getResponsive(cfg, "borderColor", "tablet") ?? borderColorDesktopRaw);
          const borderColorMobileRaw = String(getResponsive(cfg, "borderColor", "mobile") ?? borderColorDesktopRaw);
          const borderColorDesktop = borderColorDesktopRaw.trim() !== "" ? borderColorDesktopRaw : "#e5e7eb";
          const borderColorTablet = borderColorTabletRaw.trim() !== "" ? borderColorTabletRaw : borderColorDesktop;
          const borderColorMobile = borderColorMobileRaw.trim() !== "" ? borderColorMobileRaw : borderColorDesktop;

          const btDesktopVal = toNum(getResponsive(cfg, "borderTopWidth", "desktop"));
          const brDesktopVal = toNum(getResponsive(cfg, "borderRightWidth", "desktop"));
          const bbDesktopVal = toNum(getResponsive(cfg, "borderBottomWidth", "desktop"));
          const blDesktopVal = toNum(getResponsive(cfg, "borderLeftWidth", "desktop"));
          const btTabletVal = toNum(getResponsive(cfg, "borderTopWidth", "tablet"));
          const brTabletVal = toNum(getResponsive(cfg, "borderRightWidth", "tablet"));
          const bbTabletVal = toNum(getResponsive(cfg, "borderBottomWidth", "tablet"));
          const blTabletVal = toNum(getResponsive(cfg, "borderLeftWidth", "tablet"));
          const btMobileVal = toNum(getResponsive(cfg, "borderTopWidth", "mobile"));
          const brMobileVal = toNum(getResponsive(cfg, "borderRightWidth", "mobile"));
          const bbMobileVal = toNum(getResponsive(cfg, "borderBottomWidth", "mobile"));
          const blMobileVal = toNum(getResponsive(cfg, "borderLeftWidth", "mobile"));

          const hasBorderDesktop = btDesktopVal > 0 || brDesktopVal > 0 || bbDesktopVal > 0 || blDesktopVal > 0;
          const hasBorderTablet = btTabletVal > 0 || brTabletVal > 0 || bbTabletVal > 0 || blTabletVal > 0;
          const hasBorderMobile = btMobileVal > 0 || brMobileVal > 0 || bbMobileVal > 0 || blMobileVal > 0;

          const desktopShadow = shadowValue(String(getResponsive(cfg, "boxShadow", "desktop") ?? "none"));
          const tabletShadow = shadowValue(String(getResponsive(cfg, "boxShadow", "tablet") ?? "none"));
          const mobileShadow = shadowValue(String(getResponsive(cfg, "boxShadow", "mobile") ?? "none"));

          const desktopFrame = hasBorderDesktop || desktopShadow !== "none";
          const tabletFrame = hasBorderTablet || tabletShadow !== "none";
          const mobileFrame = hasBorderMobile || mobileShadow !== "none";

          const borderStyleDesktop = desktopFrame
            ? (hasBorderDesktop && borderStyleDesktopRaw.trim().toLowerCase() === "none" ? "solid" : borderStyleDesktopRaw)
            : "none";
          const borderStyleTablet = tabletFrame
            ? (hasBorderTablet && borderStyleTabletRaw.trim().toLowerCase() === "none" ? "solid" : borderStyleTabletRaw)
            : "none";
          const borderStyleMobile = mobileFrame
            ? (hasBorderMobile && borderStyleMobileRaw.trim().toLowerCase() === "none" ? "solid" : borderStyleMobileRaw)
            : "none";

          const borderTopDesktop = desktopFrame ? `${btDesktopVal}px` : "0px";
          const borderRightDesktop = desktopFrame ? `${brDesktopVal}px` : "0px";
          const borderBottomDesktop = desktopFrame ? `${bbDesktopVal}px` : "0px";
          const borderLeftDesktop = desktopFrame ? `${blDesktopVal}px` : "0px";
          const borderTopTablet = tabletFrame ? `${btTabletVal}px` : "0px";
          const borderRightTablet = tabletFrame ? `${brTabletVal}px` : "0px";
          const borderBottomTablet = tabletFrame ? `${bbTabletVal}px` : "0px";
          const borderLeftTablet = tabletFrame ? `${blTabletVal}px` : "0px";
          const borderTopMobile = mobileFrame ? `${btMobileVal}px` : "0px";
          const borderRightMobile = mobileFrame ? `${brMobileVal}px` : "0px";
          const borderBottomMobile = mobileFrame ? `${bbMobileVal}px` : "0px";
          const borderLeftMobile = mobileFrame ? `${blMobileVal}px` : "0px";

          const borderRadiusDesktop = desktopFrame ? radiusValue(String(getResponsive(cfg, "borderRadius", "desktop") ?? "none")) : "0";
          const borderRadiusTablet = tabletFrame ? radiusValue(String(getResponsive(cfg, "borderRadius", "tablet") ?? "none")) : "0";
          const borderRadiusMobile = mobileFrame ? radiusValue(String(getResponsive(cfg, "borderRadius", "mobile") ?? "none")) : "0";

          const effectiveMarTop = viewportDevice === "mobile" ? mobileMarTop : viewportDevice === "tablet" ? tabletMarTop : desktopMarTop;
          const effectiveMarBottom = viewportDevice === "mobile" ? mobileMarBottom : viewportDevice === "tablet" ? tabletMarBottom : desktopMarBottom;
          const effectiveMarLeft = viewportDevice === "mobile" ? mobileMarLeft : viewportDevice === "tablet" ? "0px" : desktopMarLeft;
          const effectiveMarRight = viewportDevice === "mobile" ? mobileMarRight : viewportDevice === "tablet" ? "0px" : desktopMarRight;
          const innerPadLeft = baseContainerPadX;
          const innerPadRight = baseContainerPadX;
          return (
            <div
              key={sectionId}
              ref={(el) => {
                sectionRefs.current[sectionId] = el;
              }}
              className={`hb-section ${hideClass(cfg)} ${isSticky ? "hb-sticky" : ""}`}
              style={
                {
                  ["--hb-sticky-top" as any]: isSticky ? `${stickyLayout[sectionId]?.top ?? 0}px` : undefined,
                  ["--hb-sticky-z" as any]: isSticky ? (stickyLayout[sectionId]?.z ?? 60) : undefined,
                  ["--hb-desktop-bg-color" as any]: desktopBgColor || undefined,
                  ["--hb-tablet-bg-color" as any]: tabletBgColor || undefined,
                  ["--hb-mobile-bg-color" as any]: mobileBgColor || undefined,
                  ["--hb-desktop-bg-image" as any]: desktopBgImage,
                  ["--hb-tablet-bg-image" as any]: tabletBgImage,
                  ["--hb-mobile-bg-image" as any]: mobileBgImage,
                  ["--hb-desktop-bg-size" as any]: desktopBgSize,
                  ["--hb-tablet-bg-size" as any]: tabletBgSize,
                  ["--hb-mobile-bg-size" as any]: mobileBgSize,
                  ["--hb-desktop-pad-top" as any]: desktopPadTop,
                  ["--hb-desktop-pad-bottom" as any]: desktopPadBottom,
                  ["--hb-desktop-pad-left" as any]: desktopPadLeft,
                  ["--hb-desktop-pad-right" as any]: desktopPadRight,
                  ["--hb-tablet-pad-top" as any]: tabletPadTop,
                  ["--hb-tablet-pad-bottom" as any]: tabletPadBottom,
                  ["--hb-tablet-pad-left" as any]: tabletPadLeft,
                  ["--hb-tablet-pad-right" as any]: tabletPadRight,
                  ["--hb-mobile-pad-top" as any]: mobilePadTop,
                  ["--hb-mobile-pad-bottom" as any]: mobilePadBottom,
                  ["--hb-mobile-pad-left" as any]: mobilePadLeft,
                  ["--hb-mobile-pad-right" as any]: mobilePadRight,
                  ["--hb-desktop-border-style" as any]: borderStyleDesktop,
                  ["--hb-desktop-border-color" as any]: desktopFrame ? borderColorDesktop : "transparent",
                  ["--hb-desktop-border-top" as any]: borderTopDesktop,
                  ["--hb-desktop-border-right" as any]: borderRightDesktop,
                  ["--hb-desktop-border-bottom" as any]: borderBottomDesktop,
                  ["--hb-desktop-border-left" as any]: borderLeftDesktop,
                  ["--hb-desktop-shadow" as any]: desktopFrame ? desktopShadow : "none",
                  ["--hb-desktop-radius" as any]: borderRadiusDesktop,
                  ["--hb-tablet-border-style" as any]: borderStyleTablet,
                  ["--hb-tablet-border-color" as any]: tabletFrame ? borderColorTablet : "transparent",
                  ["--hb-tablet-border-top" as any]: borderTopTablet,
                  ["--hb-tablet-border-right" as any]: borderRightTablet,
                  ["--hb-tablet-border-bottom" as any]: borderBottomTablet,
                  ["--hb-tablet-border-left" as any]: borderLeftTablet,
                  ["--hb-tablet-shadow" as any]: tabletFrame ? tabletShadow : "none",
                  ["--hb-tablet-radius" as any]: borderRadiusTablet,
                  ["--hb-mobile-border-style" as any]: borderStyleMobile,
                  ["--hb-mobile-border-color" as any]: mobileFrame ? borderColorMobile : "transparent",
                  ["--hb-mobile-border-top" as any]: borderTopMobile,
                  ["--hb-mobile-border-right" as any]: borderRightMobile,
                  ["--hb-mobile-border-bottom" as any]: borderBottomMobile,
                  ["--hb-mobile-border-left" as any]: borderLeftMobile,
                  ["--hb-mobile-shadow" as any]: mobileFrame ? mobileShadow : "none",
                  ["--hb-mobile-radius" as any]: borderRadiusMobile,
                  marginTop: isSticky ? 0 : effectiveMarTop,
                  marginBottom: isSticky ? 0 : effectiveMarBottom,
                  paddingTop: isSticky ? effectiveMarTop : undefined,
                  paddingBottom: isSticky ? effectiveMarBottom : undefined,
                  marginLeft: effectiveMarLeft,
                  marginRight: effectiveMarRight,
                } as any
              }
            >
              <div
                className="hb-inner"
                style={
                  {
                    ["--hb-desktop-max" as any]: desktopMax,
                    ["--hb-tablet-max" as any]: tabletMax,
                    ["--hb-mobile-max" as any]: mobileMax,
                    paddingLeft: `${innerPadLeft}px`,
                    paddingRight: `${innerPadRight}px`,
                  } as any
                }
              >
                <div className="hb-surface">
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
                      const rawAlign = String(child?.config?.align || "auto");
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
                                className={`${hideClass(child.config)} ${child.type === "header_logo" ? "hb-logo" : child.type === "ad_banner" ? "hb-ad" : (child.type === "header_menu_primary" || child.type === "header_menu_secondary") ? "hb-menu" : child.type === "header_search" ? "hb-search" : child.type === "header_theme_toggle" ? "hb-theme" : child.type === "header_mobile_menu_toggle" ? "hb-mobile-toggle" : ""}`}
                                style={(() => {
                                  const base =
                                    child.type === "header_logo"
                                      ? (() => {
                                          const vars = resolveLogoSizeVars(child.config || {});
                                          return {
                                            ["--hb-logo-desktop-h" as any]: vars.desktopH,
                                            ["--hb-logo-tablet-h" as any]: vars.tabletH,
                                            ["--hb-logo-mobile-h" as any]: vars.mobileH,
                                            ["--hb-logo-desktop-maxw" as any]: vars.desktopMaxW,
                                            ["--hb-logo-tablet-maxw" as any]: vars.tabletMaxW,
                                            ["--hb-logo-mobile-maxw" as any]: vars.mobileMaxW,
                                            ["--hb-logo-desktop-text" as any]: vars.desktopText,
                                            ["--hb-logo-tablet-text" as any]: vars.tabletText,
                                            ["--hb-logo-mobile-text" as any]: vars.mobileText,
                                          } as any;
                                        })()
                                      : child.type === "ad_banner"
                                      ? (() => {
                                          const vars = resolveAdSizeVars(child.config || {});
                                          const isStretch = String(child?.config?.align || "") === "stretch";
                                          return {
                                            ["--hb-ad-desktop-maxw" as any]: isStretch ? "100%" : vars.desktopMaxW,
                                            ["--hb-ad-tablet-maxw" as any]: "100%",
                                            ["--hb-ad-mobile-maxw" as any]: isStretch ? "100%" : vars.mobileMaxW,
                                          } as any;
                                        })()
                                      : (child.type === "header_menu_primary" || child.type === "header_menu_secondary")
                                      ? (() => {
                                          const cfg = child.config || {};
                                          const dColor = getResponsive(cfg, "menuTextColor", "desktop");
                                          const tColor = getResponsive(cfg, "menuTextColor", "tablet");
                                          const mColor = getResponsive(cfg, "menuTextColor", "mobile");
                                          const dHover = getResponsive(cfg, "menuHoverTextColor", "desktop");
                                          const tHover = getResponsive(cfg, "menuHoverTextColor", "tablet");
                                          const mHover = getResponsive(cfg, "menuHoverTextColor", "mobile");
                                          const dWeight = getResponsive(cfg, "menuFontWeight", "desktop");
                                          const tWeight = getResponsive(cfg, "menuFontWeight", "tablet");
                                          const mWeight = getResponsive(cfg, "menuFontWeight", "mobile");
                                          const dSize = resolveOptionalPx(getResponsive(cfg, "menuFontSize", "desktop"));
                                          const tSize = resolveOptionalPx(getResponsive(cfg, "menuFontSize", "tablet")) || dSize;
                                          const mSize = resolveOptionalPx(getResponsive(cfg, "menuFontSize", "mobile")) || dSize;
                                          const dFont = getResponsive(cfg, "menuFontFamily", "desktop");
                                          const tFont = getResponsive(cfg, "menuFontFamily", "tablet");
                                          const mFont = getResponsive(cfg, "menuFontFamily", "mobile");
                                          return {
                                            ["--hb-menu-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                            ["--hb-menu-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                            ["--hb-menu-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                            ["--hb-menu-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                            ["--hb-menu-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                            ["--hb-menu-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                            ["--hb-menu-desktop-weight" as any]: typeof dWeight === "string" ? dWeight : (typeof dWeight === "number" ? String(dWeight) : undefined),
                                            ["--hb-menu-tablet-weight" as any]: typeof tWeight === "string" ? tWeight : (typeof tWeight === "number" ? String(tWeight) : undefined),
                                            ["--hb-menu-mobile-weight" as any]: typeof mWeight === "string" ? mWeight : (typeof mWeight === "number" ? String(mWeight) : undefined),
                                            ["--hb-menu-desktop-size" as any]: dSize,
                                            ["--hb-menu-tablet-size" as any]: tSize,
                                            ["--hb-menu-mobile-size" as any]: mSize,
                                            ["--hb-menu-desktop-font" as any]: typeof dFont === "string" && dFont.trim() !== "" ? dFont : undefined,
                                            ["--hb-menu-tablet-font" as any]: typeof tFont === "string" && tFont.trim() !== "" ? tFont : undefined,
                                            ["--hb-menu-mobile-font" as any]: typeof mFont === "string" && mFont.trim() !== "" ? mFont : undefined,
                                          } as any;
                                        })()
                                      : child.type === "header_search"
                                      ? (() => {
                                          const cfg = child.config || {};
                                          const dColor = getResponsive(cfg, "searchColor", "desktop");
                                          const tColor = getResponsive(cfg, "searchColor", "tablet");
                                          const mColor = getResponsive(cfg, "searchColor", "mobile");
                                          const dHover = getResponsive(cfg, "searchHoverColor", "desktop");
                                          const tHover = getResponsive(cfg, "searchHoverColor", "tablet");
                                          const mHover = getResponsive(cfg, "searchHoverColor", "mobile");
                                          const dIcon = resolveOptionalPx(getResponsive(cfg, "searchIconSize", "desktop"));
                                          const tIcon = resolveOptionalPx(getResponsive(cfg, "searchIconSize", "tablet")) || dIcon;
                                          const mIcon = resolveOptionalPx(getResponsive(cfg, "searchIconSize", "mobile")) || dIcon;
                                          const dBg = getResponsive(cfg, "searchBgColor", "desktop");
                                          const tBg = getResponsive(cfg, "searchBgColor", "tablet");
                                          const mBg = getResponsive(cfg, "searchBgColor", "mobile");
                                          const dBorder = getResponsive(cfg, "searchBorderColor", "desktop");
                                          const tBorder = getResponsive(cfg, "searchBorderColor", "tablet");
                                          const mBorder = getResponsive(cfg, "searchBorderColor", "mobile");
                                          const dRadius = resolveOptionalPx(getResponsive(cfg, "searchRadius", "desktop"));
                                          const tRadius = resolveOptionalPx(getResponsive(cfg, "searchRadius", "tablet")) || dRadius;
                                          const mRadius = resolveOptionalPx(getResponsive(cfg, "searchRadius", "mobile")) || dRadius;
                                          const dHeight = resolveOptionalPx(getResponsive(cfg, "searchHeight", "desktop"));
                                          const tHeight = resolveOptionalPx(getResponsive(cfg, "searchHeight", "tablet")) || dHeight;
                                          const mHeight = resolveOptionalPx(getResponsive(cfg, "searchHeight", "mobile")) || dHeight;
                                          const dFont = resolveOptionalPx(getResponsive(cfg, "searchFontSize", "desktop"));
                                          const tFont = resolveOptionalPx(getResponsive(cfg, "searchFontSize", "tablet")) || dFont;
                                          const mFont = resolveOptionalPx(getResponsive(cfg, "searchFontSize", "mobile")) || dFont;
                                          const dBtnBg = getResponsive(cfg, "searchButtonBgColor", "desktop");
                                          const tBtnBg = getResponsive(cfg, "searchButtonBgColor", "tablet");
                                          const mBtnBg = getResponsive(cfg, "searchButtonBgColor", "mobile");
                                          const dBtnTxt = getResponsive(cfg, "searchButtonTextColor", "desktop");
                                          const tBtnTxt = getResponsive(cfg, "searchButtonTextColor", "tablet");
                                          const mBtnTxt = getResponsive(cfg, "searchButtonTextColor", "mobile");
                                          return {
                                            ["--hb-search-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                            ["--hb-search-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                            ["--hb-search-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                            ["--hb-search-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                            ["--hb-search-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                            ["--hb-search-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                            ["--hb-search-desktop-icon" as any]: dIcon,
                                            ["--hb-search-tablet-icon" as any]: tIcon,
                                            ["--hb-search-mobile-icon" as any]: mIcon,
                                            ["--hb-search-desktop-bg" as any]: typeof dBg === "string" ? dBg : undefined,
                                            ["--hb-search-tablet-bg" as any]: typeof tBg === "string" ? tBg : undefined,
                                            ["--hb-search-mobile-bg" as any]: typeof mBg === "string" ? mBg : undefined,
                                            ["--hb-search-desktop-border" as any]: typeof dBorder === "string" ? dBorder : undefined,
                                            ["--hb-search-tablet-border" as any]: typeof tBorder === "string" ? tBorder : undefined,
                                            ["--hb-search-mobile-border" as any]: typeof mBorder === "string" ? mBorder : undefined,
                                            ["--hb-search-desktop-radius" as any]: dRadius,
                                            ["--hb-search-tablet-radius" as any]: tRadius,
                                            ["--hb-search-mobile-radius" as any]: mRadius,
                                            ["--hb-search-desktop-height" as any]: dHeight,
                                            ["--hb-search-tablet-height" as any]: tHeight,
                                            ["--hb-search-mobile-height" as any]: mHeight,
                                            ["--hb-search-desktop-font" as any]: dFont,
                                            ["--hb-search-tablet-font" as any]: tFont,
                                            ["--hb-search-mobile-font" as any]: mFont,
                                            ["--hb-search-desktop-btnbg" as any]: typeof dBtnBg === "string" ? dBtnBg : undefined,
                                            ["--hb-search-tablet-btnbg" as any]: typeof tBtnBg === "string" ? tBtnBg : undefined,
                                            ["--hb-search-mobile-btnbg" as any]: typeof mBtnBg === "string" ? mBtnBg : undefined,
                                            ["--hb-search-desktop-btntxt" as any]: typeof dBtnTxt === "string" ? dBtnTxt : undefined,
                                            ["--hb-search-tablet-btntxt" as any]: typeof tBtnTxt === "string" ? tBtnTxt : undefined,
                                            ["--hb-search-mobile-btntxt" as any]: typeof mBtnTxt === "string" ? mBtnTxt : undefined,
                                          } as any;
                                        })()
                                      : child.type === "header_theme_toggle"
                                      ? (() => {
                                          const cfg = child.config || {};
                                          const dColor = getResponsive(cfg, "themeColor", "desktop");
                                          const tColor = getResponsive(cfg, "themeColor", "tablet");
                                          const mColor = getResponsive(cfg, "themeColor", "mobile");
                                          const dHover = getResponsive(cfg, "themeHoverColor", "desktop");
                                          const tHover = getResponsive(cfg, "themeHoverColor", "tablet");
                                          const mHover = getResponsive(cfg, "themeHoverColor", "mobile");
                                          const dIcon = resolveOptionalPx(getResponsive(cfg, "themeIconSize", "desktop"));
                                          const tIcon = resolveOptionalPx(getResponsive(cfg, "themeIconSize", "tablet")) || dIcon;
                                          const mIcon = resolveOptionalPx(getResponsive(cfg, "themeIconSize", "mobile")) || dIcon;
                                          return {
                                            ["--hb-theme-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                            ["--hb-theme-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                            ["--hb-theme-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                            ["--hb-theme-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                            ["--hb-theme-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                            ["--hb-theme-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                            ["--hb-theme-desktop-icon" as any]: dIcon,
                                            ["--hb-theme-tablet-icon" as any]: tIcon,
                                            ["--hb-theme-mobile-icon" as any]: mIcon,
                                          } as any;
                                        })()
                                      : child.type === "header_mobile_menu_toggle"
                                      ? (() => {
                                          const cfg = child.config || {};
                                          const dColor = getResponsive(cfg, "mobileMenuColor", "desktop");
                                          const tColor = getResponsive(cfg, "mobileMenuColor", "tablet");
                                          const mColor = getResponsive(cfg, "mobileMenuColor", "mobile");
                                          const dHover = getResponsive(cfg, "mobileMenuHoverColor", "desktop");
                                          const tHover = getResponsive(cfg, "mobileMenuHoverColor", "tablet");
                                          const mHover = getResponsive(cfg, "mobileMenuHoverColor", "mobile");
                                          const dIcon = resolveOptionalPx(getResponsive(cfg, "mobileMenuIconSize", "desktop"));
                                          const tIcon = resolveOptionalPx(getResponsive(cfg, "mobileMenuIconSize", "tablet")) || dIcon;
                                          const mIcon = resolveOptionalPx(getResponsive(cfg, "mobileMenuIconSize", "mobile")) || dIcon;
                                          const dBg = getResponsive(cfg, "mobileMenuBgColor", "desktop");
                                          const tBg = getResponsive(cfg, "mobileMenuBgColor", "tablet");
                                          const mBg = getResponsive(cfg, "mobileMenuBgColor", "mobile");
                                          const dBgHover = getResponsive(cfg, "mobileMenuBgHoverColor", "desktop");
                                          const tBgHover = getResponsive(cfg, "mobileMenuBgHoverColor", "tablet");
                                          const mBgHover = getResponsive(cfg, "mobileMenuBgHoverColor", "mobile");
                                          const dRadius = resolveOptionalPx(getResponsive(cfg, "mobileMenuRadius", "desktop"));
                                          const tRadius = resolveOptionalPx(getResponsive(cfg, "mobileMenuRadius", "tablet")) || dRadius;
                                          const mRadius = resolveOptionalPx(getResponsive(cfg, "mobileMenuRadius", "mobile")) || dRadius;
                                          const dPad = resolveOptionalPx(getResponsive(cfg, "mobileMenuPadding", "desktop"));
                                          const tPad = resolveOptionalPx(getResponsive(cfg, "mobileMenuPadding", "tablet")) || dPad;
                                          const mPad = resolveOptionalPx(getResponsive(cfg, "mobileMenuPadding", "mobile")) || dPad;
                                          return {
                                            ["--hb-mt-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                            ["--hb-mt-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                            ["--hb-mt-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                            ["--hb-mt-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                            ["--hb-mt-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                            ["--hb-mt-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                            ["--hb-mt-desktop-icon" as any]: dIcon,
                                            ["--hb-mt-tablet-icon" as any]: tIcon,
                                            ["--hb-mt-mobile-icon" as any]: mIcon,
                                            ["--hb-mt-desktop-bg" as any]: typeof dBg === "string" ? dBg : undefined,
                                            ["--hb-mt-tablet-bg" as any]: typeof tBg === "string" ? tBg : undefined,
                                            ["--hb-mt-mobile-bg" as any]: typeof mBg === "string" ? mBg : undefined,
                                            ["--hb-mt-desktop-bghover" as any]: typeof dBgHover === "string" ? dBgHover : undefined,
                                            ["--hb-mt-tablet-bghover" as any]: typeof tBgHover === "string" ? tBgHover : undefined,
                                            ["--hb-mt-mobile-bghover" as any]: typeof mBgHover === "string" ? mBgHover : undefined,
                                            ["--hb-mt-desktop-radius" as any]: dRadius,
                                            ["--hb-mt-tablet-radius" as any]: tRadius,
                                            ["--hb-mt-mobile-radius" as any]: mRadius,
                                            ["--hb-mt-desktop-pad" as any]: dPad,
                                            ["--hb-mt-tablet-pad" as any]: tPad,
                                            ["--hb-mt-mobile-pad" as any]: mPad,
                                          } as any;
                                        })()
                                      : undefined;
                                  const spacingRaw = resolveBoxSpacing(
                                    child.config || {},
                                    child.type !== "header_theme_toggle" && child.type !== "ad_banner"
                                  );
                                  const spacing =
                                    viewportDevice === "tablet" && (child.type === "ad_banner" || child.type === "header_logo")
                                      ? ({ ...spacingRaw, marginLeft: undefined, marginRight: undefined } as any)
                                      : spacingRaw;
                                  return base ? ({ ...base, ...spacing } as any) : (spacing as any);
                                })()}
                              >
                                {renderHeaderWidget(child)}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 min-w-0">
                            {center.length > 0 && (
                              <div className="flex items-center gap-3 justify-center flex-1 min-w-0">
                                {center.map((child: any) => (
                                  <div
                                    key={child.id}
                                    className={`${hideClass(child.config)} ${child.type === "header_logo" ? "hb-logo" : child.type === "ad_banner" ? "hb-ad" : (child.type === "header_menu_primary" || child.type === "header_menu_secondary") ? "hb-menu" : child.type === "header_search" ? "hb-search" : child.type === "header_theme_toggle" ? "hb-theme" : child.type === "header_mobile_menu_toggle" ? "hb-mobile-toggle" : ""}`}
                                    style={(() => {
                                      const base =
                                        child.type === "header_logo"
                                          ? (() => {
                                              const vars = resolveLogoSizeVars(child.config || {});
                                              return {
                                                ["--hb-logo-desktop-h" as any]: vars.desktopH,
                                                ["--hb-logo-tablet-h" as any]: vars.tabletH,
                                                ["--hb-logo-mobile-h" as any]: vars.mobileH,
                                                ["--hb-logo-desktop-maxw" as any]: vars.desktopMaxW,
                                                ["--hb-logo-tablet-maxw" as any]: vars.tabletMaxW,
                                                ["--hb-logo-mobile-maxw" as any]: vars.mobileMaxW,
                                                ["--hb-logo-desktop-text" as any]: vars.desktopText,
                                                ["--hb-logo-tablet-text" as any]: vars.tabletText,
                                                ["--hb-logo-mobile-text" as any]: vars.mobileText,
                                              } as any;
                                            })()
                                          : child.type === "ad_banner"
                                          ? (() => {
                                              const vars = resolveAdSizeVars(child.config || {});
                                              const isStretch = String(child?.config?.align || "") === "stretch";
                                              return {
                                                ["--hb-ad-desktop-maxw" as any]: isStretch ? "100%" : vars.desktopMaxW,
                                                ["--hb-ad-tablet-maxw" as any]: "100%",
                                                ["--hb-ad-mobile-maxw" as any]: isStretch ? "100%" : vars.mobileMaxW,
                                              } as any;
                                            })()
                                          : (child.type === "header_menu_primary" || child.type === "header_menu_secondary")
                                          ? (() => {
                                              const cfg = child.config || {};
                                              const dColor = getResponsive(cfg, "menuTextColor", "desktop");
                                              const tColor = getResponsive(cfg, "menuTextColor", "tablet");
                                              const mColor = getResponsive(cfg, "menuTextColor", "mobile");
                                              const dHover = getResponsive(cfg, "menuHoverTextColor", "desktop");
                                              const tHover = getResponsive(cfg, "menuHoverTextColor", "tablet");
                                              const mHover = getResponsive(cfg, "menuHoverTextColor", "mobile");
                                              const dWeight = getResponsive(cfg, "menuFontWeight", "desktop");
                                              const tWeight = getResponsive(cfg, "menuFontWeight", "tablet");
                                              const mWeight = getResponsive(cfg, "menuFontWeight", "mobile");
                                              const dSize = resolveOptionalPx(getResponsive(cfg, "menuFontSize", "desktop"));
                                              const tSize = resolveOptionalPx(getResponsive(cfg, "menuFontSize", "tablet")) || dSize;
                                              const mSize = resolveOptionalPx(getResponsive(cfg, "menuFontSize", "mobile")) || dSize;
                                              const dFont = getResponsive(cfg, "menuFontFamily", "desktop");
                                              const tFont = getResponsive(cfg, "menuFontFamily", "tablet");
                                              const mFont = getResponsive(cfg, "menuFontFamily", "mobile");
                                              return {
                                                ["--hb-menu-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                                ["--hb-menu-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                                ["--hb-menu-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                                ["--hb-menu-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                                ["--hb-menu-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                                ["--hb-menu-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                                ["--hb-menu-desktop-weight" as any]: typeof dWeight === "string" ? dWeight : (typeof dWeight === "number" ? String(dWeight) : undefined),
                                                ["--hb-menu-tablet-weight" as any]: typeof tWeight === "string" ? tWeight : (typeof tWeight === "number" ? String(tWeight) : undefined),
                                                ["--hb-menu-mobile-weight" as any]: typeof mWeight === "string" ? mWeight : (typeof mWeight === "number" ? String(mWeight) : undefined),
                                                ["--hb-menu-desktop-size" as any]: dSize,
                                                ["--hb-menu-tablet-size" as any]: tSize,
                                                ["--hb-menu-mobile-size" as any]: mSize,
                                                ["--hb-menu-desktop-font" as any]: typeof dFont === "string" && dFont.trim() !== "" ? dFont : undefined,
                                                ["--hb-menu-tablet-font" as any]: typeof tFont === "string" && tFont.trim() !== "" ? tFont : undefined,
                                                ["--hb-menu-mobile-font" as any]: typeof mFont === "string" && mFont.trim() !== "" ? mFont : undefined,
                                              } as any;
                                            })()
                                          : child.type === "header_search"
                                          ? (() => {
                                              const cfg = child.config || {};
                                              const dColor = getResponsive(cfg, "searchColor", "desktop");
                                              const tColor = getResponsive(cfg, "searchColor", "tablet");
                                              const mColor = getResponsive(cfg, "searchColor", "mobile");
                                              const dHover = getResponsive(cfg, "searchHoverColor", "desktop");
                                              const tHover = getResponsive(cfg, "searchHoverColor", "tablet");
                                              const mHover = getResponsive(cfg, "searchHoverColor", "mobile");
                                              const dIcon = resolveOptionalPx(getResponsive(cfg, "searchIconSize", "desktop"));
                                              const tIcon = resolveOptionalPx(getResponsive(cfg, "searchIconSize", "tablet")) || dIcon;
                                              const mIcon = resolveOptionalPx(getResponsive(cfg, "searchIconSize", "mobile")) || dIcon;
                                              const dBg = getResponsive(cfg, "searchBgColor", "desktop");
                                              const tBg = getResponsive(cfg, "searchBgColor", "tablet");
                                              const mBg = getResponsive(cfg, "searchBgColor", "mobile");
                                              const dBorder = getResponsive(cfg, "searchBorderColor", "desktop");
                                              const tBorder = getResponsive(cfg, "searchBorderColor", "tablet");
                                              const mBorder = getResponsive(cfg, "searchBorderColor", "mobile");
                                              const dRadius = resolveOptionalPx(getResponsive(cfg, "searchRadius", "desktop"));
                                              const tRadius = resolveOptionalPx(getResponsive(cfg, "searchRadius", "tablet")) || dRadius;
                                              const mRadius = resolveOptionalPx(getResponsive(cfg, "searchRadius", "mobile")) || dRadius;
                                              const dHeight = resolveOptionalPx(getResponsive(cfg, "searchHeight", "desktop"));
                                              const tHeight = resolveOptionalPx(getResponsive(cfg, "searchHeight", "tablet")) || dHeight;
                                              const mHeight = resolveOptionalPx(getResponsive(cfg, "searchHeight", "mobile")) || dHeight;
                                              const dFont = resolveOptionalPx(getResponsive(cfg, "searchFontSize", "desktop"));
                                              const tFont = resolveOptionalPx(getResponsive(cfg, "searchFontSize", "tablet")) || dFont;
                                              const mFont = resolveOptionalPx(getResponsive(cfg, "searchFontSize", "mobile")) || dFont;
                                              const dBtnBg = getResponsive(cfg, "searchButtonBgColor", "desktop");
                                              const tBtnBg = getResponsive(cfg, "searchButtonBgColor", "tablet");
                                              const mBtnBg = getResponsive(cfg, "searchButtonBgColor", "mobile");
                                              const dBtnTxt = getResponsive(cfg, "searchButtonTextColor", "desktop");
                                              const tBtnTxt = getResponsive(cfg, "searchButtonTextColor", "tablet");
                                              const mBtnTxt = getResponsive(cfg, "searchButtonTextColor", "mobile");
                                              return {
                                                ["--hb-search-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                                ["--hb-search-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                                ["--hb-search-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                                ["--hb-search-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                                ["--hb-search-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                                ["--hb-search-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                                ["--hb-search-desktop-icon" as any]: dIcon,
                                                ["--hb-search-tablet-icon" as any]: tIcon,
                                                ["--hb-search-mobile-icon" as any]: mIcon,
                                                ["--hb-search-desktop-bg" as any]: typeof dBg === "string" ? dBg : undefined,
                                                ["--hb-search-tablet-bg" as any]: typeof tBg === "string" ? tBg : undefined,
                                                ["--hb-search-mobile-bg" as any]: typeof mBg === "string" ? mBg : undefined,
                                                ["--hb-search-desktop-border" as any]: typeof dBorder === "string" ? dBorder : undefined,
                                                ["--hb-search-tablet-border" as any]: typeof tBorder === "string" ? tBorder : undefined,
                                                ["--hb-search-mobile-border" as any]: typeof mBorder === "string" ? mBorder : undefined,
                                                ["--hb-search-desktop-radius" as any]: dRadius,
                                                ["--hb-search-tablet-radius" as any]: tRadius,
                                                ["--hb-search-mobile-radius" as any]: mRadius,
                                                ["--hb-search-desktop-height" as any]: dHeight,
                                                ["--hb-search-tablet-height" as any]: tHeight,
                                                ["--hb-search-mobile-height" as any]: mHeight,
                                                ["--hb-search-desktop-font" as any]: dFont,
                                                ["--hb-search-tablet-font" as any]: tFont,
                                                ["--hb-search-mobile-font" as any]: mFont,
                                                ["--hb-search-desktop-btnbg" as any]: typeof dBtnBg === "string" ? dBtnBg : undefined,
                                                ["--hb-search-tablet-btnbg" as any]: typeof tBtnBg === "string" ? tBtnBg : undefined,
                                                ["--hb-search-mobile-btnbg" as any]: typeof mBtnBg === "string" ? mBtnBg : undefined,
                                                ["--hb-search-desktop-btntxt" as any]: typeof dBtnTxt === "string" ? dBtnTxt : undefined,
                                                ["--hb-search-tablet-btntxt" as any]: typeof tBtnTxt === "string" ? tBtnTxt : undefined,
                                                ["--hb-search-mobile-btntxt" as any]: typeof mBtnTxt === "string" ? mBtnTxt : undefined,
                                              } as any;
                                            })()
                                          : child.type === "header_theme_toggle"
                                          ? (() => {
                                              const cfg = child.config || {};
                                              const dColor = getResponsive(cfg, "themeColor", "desktop");
                                              const tColor = getResponsive(cfg, "themeColor", "tablet");
                                              const mColor = getResponsive(cfg, "themeColor", "mobile");
                                              const dHover = getResponsive(cfg, "themeHoverColor", "desktop");
                                              const tHover = getResponsive(cfg, "themeHoverColor", "tablet");
                                              const mHover = getResponsive(cfg, "themeHoverColor", "mobile");
                                              const dIcon = resolveOptionalPx(getResponsive(cfg, "themeIconSize", "desktop"));
                                              const tIcon = resolveOptionalPx(getResponsive(cfg, "themeIconSize", "tablet")) || dIcon;
                                              const mIcon = resolveOptionalPx(getResponsive(cfg, "themeIconSize", "mobile")) || dIcon;
                                              return {
                                                ["--hb-theme-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                                ["--hb-theme-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                                ["--hb-theme-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                                ["--hb-theme-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                                ["--hb-theme-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                                ["--hb-theme-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                                ["--hb-theme-desktop-icon" as any]: dIcon,
                                                ["--hb-theme-tablet-icon" as any]: tIcon,
                                                ["--hb-theme-mobile-icon" as any]: mIcon,
                                              } as any;
                                            })()
                                          : child.type === "header_mobile_menu_toggle"
                                          ? (() => {
                                              const cfg = child.config || {};
                                              const dColor = getResponsive(cfg, "mobileMenuColor", "desktop");
                                              const tColor = getResponsive(cfg, "mobileMenuColor", "tablet");
                                              const mColor = getResponsive(cfg, "mobileMenuColor", "mobile");
                                              const dHover = getResponsive(cfg, "mobileMenuHoverColor", "desktop");
                                              const tHover = getResponsive(cfg, "mobileMenuHoverColor", "tablet");
                                              const mHover = getResponsive(cfg, "mobileMenuHoverColor", "mobile");
                                              const dIcon = resolveOptionalPx(getResponsive(cfg, "mobileMenuIconSize", "desktop"));
                                              const tIcon = resolveOptionalPx(getResponsive(cfg, "mobileMenuIconSize", "tablet")) || dIcon;
                                              const mIcon = resolveOptionalPx(getResponsive(cfg, "mobileMenuIconSize", "mobile")) || dIcon;
                                              const dBg = getResponsive(cfg, "mobileMenuBgColor", "desktop");
                                              const tBg = getResponsive(cfg, "mobileMenuBgColor", "tablet");
                                              const mBg = getResponsive(cfg, "mobileMenuBgColor", "mobile");
                                              const dBgHover = getResponsive(cfg, "mobileMenuBgHoverColor", "desktop");
                                              const tBgHover = getResponsive(cfg, "mobileMenuBgHoverColor", "tablet");
                                              const mBgHover = getResponsive(cfg, "mobileMenuBgHoverColor", "mobile");
                                              const dRadius = resolveOptionalPx(getResponsive(cfg, "mobileMenuRadius", "desktop"));
                                              const tRadius = resolveOptionalPx(getResponsive(cfg, "mobileMenuRadius", "tablet")) || dRadius;
                                              const mRadius = resolveOptionalPx(getResponsive(cfg, "mobileMenuRadius", "mobile")) || dRadius;
                                              const dPad = resolveOptionalPx(getResponsive(cfg, "mobileMenuPadding", "desktop"));
                                              const tPad = resolveOptionalPx(getResponsive(cfg, "mobileMenuPadding", "tablet")) || dPad;
                                              const mPad = resolveOptionalPx(getResponsive(cfg, "mobileMenuPadding", "mobile")) || dPad;
                                              return {
                                                ["--hb-mt-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                                ["--hb-mt-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                                ["--hb-mt-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                                ["--hb-mt-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                                ["--hb-mt-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                                ["--hb-mt-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                                ["--hb-mt-desktop-icon" as any]: dIcon,
                                                ["--hb-mt-tablet-icon" as any]: tIcon,
                                                ["--hb-mt-mobile-icon" as any]: mIcon,
                                                ["--hb-mt-desktop-bg" as any]: typeof dBg === "string" ? dBg : undefined,
                                                ["--hb-mt-tablet-bg" as any]: typeof tBg === "string" ? tBg : undefined,
                                                ["--hb-mt-mobile-bg" as any]: typeof mBg === "string" ? mBg : undefined,
                                                ["--hb-mt-desktop-bghover" as any]: typeof dBgHover === "string" ? dBgHover : undefined,
                                                ["--hb-mt-tablet-bghover" as any]: typeof tBgHover === "string" ? tBgHover : undefined,
                                                ["--hb-mt-mobile-bghover" as any]: typeof mBgHover === "string" ? mBgHover : undefined,
                                                ["--hb-mt-desktop-radius" as any]: dRadius,
                                                ["--hb-mt-tablet-radius" as any]: tRadius,
                                                ["--hb-mt-mobile-radius" as any]: mRadius,
                                                ["--hb-mt-desktop-pad" as any]: dPad,
                                                ["--hb-mt-tablet-pad" as any]: tPad,
                                                ["--hb-mt-mobile-pad" as any]: mPad,
                                              } as any;
                                            })()
                                          : undefined;
                                      const spacingRaw = resolveBoxSpacing(
                                        child.config || {},
                                        child.type !== "header_theme_toggle" && child.type !== "ad_banner"
                                      );
                                      const spacing =
                                        viewportDevice === "tablet" && (child.type === "ad_banner" || child.type === "header_logo")
                                          ? ({ ...spacingRaw, marginLeft: undefined, marginRight: undefined } as any)
                                          : spacingRaw;
                                      return base ? ({ ...base, ...spacing } as any) : (spacing as any);
                                    })()}
                                  >
                                    {renderHeaderWidget(child)}
                                  </div>
                                ))}
                              </div>
                            )}
                            {stretch.length > 0 && (
                              <div className="flex items-center gap-3 justify-end flex-1 min-w-0">
                                {stretch.map((child: any) => (
                                  <div
                                    key={child.id}
                                    className={`${hideClass(child.config)} ${child.type === "header_logo" ? "hb-logo" : child.type === "ad_banner" ? "hb-ad" : (child.type === "header_menu_primary" || child.type === "header_menu_secondary") ? "hb-menu" : child.type === "header_search" ? "hb-search" : child.type === "header_theme_toggle" ? "hb-theme" : child.type === "header_mobile_menu_toggle" ? "hb-mobile-toggle" : ""}`}
                                    style={{
                                      flex: 1,
                                      minWidth: 0,
                                      ...(() => {
                                        const spacingRaw = resolveBoxSpacing(
                                          child.config || {},
                                          child.type !== "header_theme_toggle" && child.type !== "ad_banner"
                                        );
                                        return viewportDevice === "tablet" && (child.type === "ad_banner" || child.type === "header_logo")
                                          ? ({ ...spacingRaw, marginLeft: undefined, marginRight: undefined } as any)
                                          : spacingRaw;
                                      })(),
                                      ...(child.type === "header_logo"
                                        ? (() => {
                                            const vars = resolveLogoSizeVars(child.config || {});
                                            return {
                                              ["--hb-logo-desktop-h" as any]: vars.desktopH,
                                              ["--hb-logo-tablet-h" as any]: vars.tabletH,
                                              ["--hb-logo-mobile-h" as any]: vars.mobileH,
                                              ["--hb-logo-desktop-maxw" as any]: vars.desktopMaxW,
                                              ["--hb-logo-tablet-maxw" as any]: vars.tabletMaxW,
                                              ["--hb-logo-mobile-maxw" as any]: vars.mobileMaxW,
                                              ["--hb-logo-desktop-text" as any]: vars.desktopText,
                                              ["--hb-logo-tablet-text" as any]: vars.tabletText,
                                              ["--hb-logo-mobile-text" as any]: vars.mobileText,
                                            } as any;
                                          })()
                                        : child.type === "ad_banner"
                                        ? (() => {
                                            return {
                                              ["--hb-ad-desktop-maxw" as any]: "100%",
                                              ["--hb-ad-tablet-maxw" as any]: "100%",
                                              ["--hb-ad-mobile-maxw" as any]: "100%",
                                            } as any;
                                          })()
                                        : (child.type === "header_menu_primary" || child.type === "header_menu_secondary")
                                        ? (() => {
                                            const cfg = child.config || {};
                                            const dColor = getResponsive(cfg, "menuTextColor", "desktop");
                                            const tColor = getResponsive(cfg, "menuTextColor", "tablet");
                                            const mColor = getResponsive(cfg, "menuTextColor", "mobile");
                                            const dHover = getResponsive(cfg, "menuHoverTextColor", "desktop");
                                            const tHover = getResponsive(cfg, "menuHoverTextColor", "tablet");
                                            const mHover = getResponsive(cfg, "menuHoverTextColor", "mobile");
                                            const dWeight = getResponsive(cfg, "menuFontWeight", "desktop");
                                            const tWeight = getResponsive(cfg, "menuFontWeight", "tablet");
                                            const mWeight = getResponsive(cfg, "menuFontWeight", "mobile");
                                            const dSize = resolveOptionalPx(getResponsive(cfg, "menuFontSize", "desktop"));
                                            const tSize = resolveOptionalPx(getResponsive(cfg, "menuFontSize", "tablet")) || dSize;
                                            const mSize = resolveOptionalPx(getResponsive(cfg, "menuFontSize", "mobile")) || dSize;
                                            const dFont = getResponsive(cfg, "menuFontFamily", "desktop");
                                            const tFont = getResponsive(cfg, "menuFontFamily", "tablet");
                                            const mFont = getResponsive(cfg, "menuFontFamily", "mobile");
                                            return {
                                              ["--hb-menu-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                              ["--hb-menu-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                              ["--hb-menu-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                              ["--hb-menu-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                              ["--hb-menu-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                              ["--hb-menu-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                              ["--hb-menu-desktop-weight" as any]: typeof dWeight === "string" ? dWeight : (typeof dWeight === "number" ? String(dWeight) : undefined),
                                              ["--hb-menu-tablet-weight" as any]: typeof tWeight === "string" ? tWeight : (typeof tWeight === "number" ? String(tWeight) : undefined),
                                              ["--hb-menu-mobile-weight" as any]: typeof mWeight === "string" ? mWeight : (typeof mWeight === "number" ? String(mWeight) : undefined),
                                              ["--hb-menu-desktop-size" as any]: dSize,
                                              ["--hb-menu-tablet-size" as any]: tSize,
                                              ["--hb-menu-mobile-size" as any]: mSize,
                                              ["--hb-menu-desktop-font" as any]: typeof dFont === "string" && dFont.trim() !== "" ? dFont : undefined,
                                              ["--hb-menu-tablet-font" as any]: typeof tFont === "string" && tFont.trim() !== "" ? tFont : undefined,
                                              ["--hb-menu-mobile-font" as any]: typeof mFont === "string" && mFont.trim() !== "" ? mFont : undefined,
                                            } as any;
                                          })()
                                        : child.type === "header_search"
                                        ? (() => {
                                            const cfg = child.config || {};
                                            const dColor = getResponsive(cfg, "searchColor", "desktop");
                                            const tColor = getResponsive(cfg, "searchColor", "tablet");
                                            const mColor = getResponsive(cfg, "searchColor", "mobile");
                                            const dHover = getResponsive(cfg, "searchHoverColor", "desktop");
                                            const tHover = getResponsive(cfg, "searchHoverColor", "tablet");
                                            const mHover = getResponsive(cfg, "searchHoverColor", "mobile");
                                            const dIcon = resolveOptionalPx(getResponsive(cfg, "searchIconSize", "desktop"));
                                            const tIcon = resolveOptionalPx(getResponsive(cfg, "searchIconSize", "tablet")) || dIcon;
                                            const mIcon = resolveOptionalPx(getResponsive(cfg, "searchIconSize", "mobile")) || dIcon;
                                            const dBg = getResponsive(cfg, "searchBgColor", "desktop");
                                            const tBg = getResponsive(cfg, "searchBgColor", "tablet");
                                            const mBg = getResponsive(cfg, "searchBgColor", "mobile");
                                            const dBorder = getResponsive(cfg, "searchBorderColor", "desktop");
                                            const tBorder = getResponsive(cfg, "searchBorderColor", "tablet");
                                            const mBorder = getResponsive(cfg, "searchBorderColor", "mobile");
                                            const dRadius = resolveOptionalPx(getResponsive(cfg, "searchRadius", "desktop"));
                                            const tRadius = resolveOptionalPx(getResponsive(cfg, "searchRadius", "tablet")) || dRadius;
                                            const mRadius = resolveOptionalPx(getResponsive(cfg, "searchRadius", "mobile")) || dRadius;
                                            const dHeight = resolveOptionalPx(getResponsive(cfg, "searchHeight", "desktop"));
                                            const tHeight = resolveOptionalPx(getResponsive(cfg, "searchHeight", "tablet")) || dHeight;
                                            const mHeight = resolveOptionalPx(getResponsive(cfg, "searchHeight", "mobile")) || dHeight;
                                            const dFont = resolveOptionalPx(getResponsive(cfg, "searchFontSize", "desktop"));
                                            const tFont = resolveOptionalPx(getResponsive(cfg, "searchFontSize", "tablet")) || dFont;
                                            const mFont = resolveOptionalPx(getResponsive(cfg, "searchFontSize", "mobile")) || dFont;
                                            const dBtnBg = getResponsive(cfg, "searchButtonBgColor", "desktop");
                                            const tBtnBg = getResponsive(cfg, "searchButtonBgColor", "tablet");
                                            const mBtnBg = getResponsive(cfg, "searchButtonBgColor", "mobile");
                                            const dBtnTxt = getResponsive(cfg, "searchButtonTextColor", "desktop");
                                            const tBtnTxt = getResponsive(cfg, "searchButtonTextColor", "tablet");
                                            const mBtnTxt = getResponsive(cfg, "searchButtonTextColor", "mobile");
                                            return {
                                              ["--hb-search-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                              ["--hb-search-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                              ["--hb-search-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                              ["--hb-search-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                              ["--hb-search-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                              ["--hb-search-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                              ["--hb-search-desktop-icon" as any]: dIcon,
                                              ["--hb-search-tablet-icon" as any]: tIcon,
                                              ["--hb-search-mobile-icon" as any]: mIcon,
                                              ["--hb-search-desktop-bg" as any]: typeof dBg === "string" ? dBg : undefined,
                                              ["--hb-search-tablet-bg" as any]: typeof tBg === "string" ? tBg : undefined,
                                              ["--hb-search-mobile-bg" as any]: typeof mBg === "string" ? mBg : undefined,
                                              ["--hb-search-desktop-border" as any]: typeof dBorder === "string" ? dBorder : undefined,
                                              ["--hb-search-tablet-border" as any]: typeof tBorder === "string" ? tBorder : undefined,
                                              ["--hb-search-mobile-border" as any]: typeof mBorder === "string" ? mBorder : undefined,
                                              ["--hb-search-desktop-radius" as any]: dRadius,
                                              ["--hb-search-tablet-radius" as any]: tRadius,
                                              ["--hb-search-mobile-radius" as any]: mRadius,
                                              ["--hb-search-desktop-height" as any]: dHeight,
                                              ["--hb-search-tablet-height" as any]: tHeight,
                                              ["--hb-search-mobile-height" as any]: mHeight,
                                              ["--hb-search-desktop-font" as any]: dFont,
                                              ["--hb-search-tablet-font" as any]: tFont,
                                              ["--hb-search-mobile-font" as any]: mFont,
                                              ["--hb-search-desktop-btnbg" as any]: typeof dBtnBg === "string" ? dBtnBg : undefined,
                                              ["--hb-search-tablet-btnbg" as any]: typeof tBtnBg === "string" ? tBtnBg : undefined,
                                              ["--hb-search-mobile-btnbg" as any]: typeof mBtnBg === "string" ? mBtnBg : undefined,
                                              ["--hb-search-desktop-btntxt" as any]: typeof dBtnTxt === "string" ? dBtnTxt : undefined,
                                              ["--hb-search-tablet-btntxt" as any]: typeof tBtnTxt === "string" ? tBtnTxt : undefined,
                                              ["--hb-search-mobile-btntxt" as any]: typeof mBtnTxt === "string" ? mBtnTxt : undefined,
                                            } as any;
                                          })()
                                        : child.type === "header_theme_toggle"
                                        ? (() => {
                                            const cfg = child.config || {};
                                            const dColor = getResponsive(cfg, "themeColor", "desktop");
                                            const tColor = getResponsive(cfg, "themeColor", "tablet");
                                            const mColor = getResponsive(cfg, "themeColor", "mobile");
                                            const dHover = getResponsive(cfg, "themeHoverColor", "desktop");
                                            const tHover = getResponsive(cfg, "themeHoverColor", "tablet");
                                            const mHover = getResponsive(cfg, "themeHoverColor", "mobile");
                                            const dIcon = resolveOptionalPx(getResponsive(cfg, "themeIconSize", "desktop"));
                                            const tIcon = resolveOptionalPx(getResponsive(cfg, "themeIconSize", "tablet")) || dIcon;
                                            const mIcon = resolveOptionalPx(getResponsive(cfg, "themeIconSize", "mobile")) || dIcon;
                                            return {
                                              ["--hb-theme-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                              ["--hb-theme-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                              ["--hb-theme-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                              ["--hb-theme-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                              ["--hb-theme-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                              ["--hb-theme-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                              ["--hb-theme-desktop-icon" as any]: dIcon,
                                              ["--hb-theme-tablet-icon" as any]: tIcon,
                                              ["--hb-theme-mobile-icon" as any]: mIcon,
                                            } as any;
                                          })()
                                        : child.type === "header_mobile_menu_toggle"
                                        ? (() => {
                                            const cfg = child.config || {};
                                            const dColor = getResponsive(cfg, "mobileMenuColor", "desktop");
                                            const tColor = getResponsive(cfg, "mobileMenuColor", "tablet");
                                            const mColor = getResponsive(cfg, "mobileMenuColor", "mobile");
                                            const dHover = getResponsive(cfg, "mobileMenuHoverColor", "desktop");
                                            const tHover = getResponsive(cfg, "mobileMenuHoverColor", "tablet");
                                            const mHover = getResponsive(cfg, "mobileMenuHoverColor", "mobile");
                                            const dIcon = resolveOptionalPx(getResponsive(cfg, "mobileMenuIconSize", "desktop"));
                                            const tIcon = resolveOptionalPx(getResponsive(cfg, "mobileMenuIconSize", "tablet")) || dIcon;
                                            const mIcon = resolveOptionalPx(getResponsive(cfg, "mobileMenuIconSize", "mobile")) || dIcon;
                                            const dBg = getResponsive(cfg, "mobileMenuBgColor", "desktop");
                                            const tBg = getResponsive(cfg, "mobileMenuBgColor", "tablet");
                                            const mBg = getResponsive(cfg, "mobileMenuBgColor", "mobile");
                                            const dBgHover = getResponsive(cfg, "mobileMenuBgHoverColor", "desktop");
                                            const tBgHover = getResponsive(cfg, "mobileMenuBgHoverColor", "tablet");
                                            const mBgHover = getResponsive(cfg, "mobileMenuBgHoverColor", "mobile");
                                            const dRadius = resolveOptionalPx(getResponsive(cfg, "mobileMenuRadius", "desktop"));
                                            const tRadius = resolveOptionalPx(getResponsive(cfg, "mobileMenuRadius", "tablet")) || dRadius;
                                            const mRadius = resolveOptionalPx(getResponsive(cfg, "mobileMenuRadius", "mobile")) || dRadius;
                                            const dPad = resolveOptionalPx(getResponsive(cfg, "mobileMenuPadding", "desktop"));
                                            const tPad = resolveOptionalPx(getResponsive(cfg, "mobileMenuPadding", "tablet")) || dPad;
                                            const mPad = resolveOptionalPx(getResponsive(cfg, "mobileMenuPadding", "mobile")) || dPad;
                                            return {
                                              ["--hb-mt-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                              ["--hb-mt-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                              ["--hb-mt-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                              ["--hb-mt-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                              ["--hb-mt-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                              ["--hb-mt-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                              ["--hb-mt-desktop-icon" as any]: dIcon,
                                              ["--hb-mt-tablet-icon" as any]: tIcon,
                                              ["--hb-mt-mobile-icon" as any]: mIcon,
                                              ["--hb-mt-desktop-bg" as any]: typeof dBg === "string" ? dBg : undefined,
                                              ["--hb-mt-tablet-bg" as any]: typeof tBg === "string" ? tBg : undefined,
                                              ["--hb-mt-mobile-bg" as any]: typeof mBg === "string" ? mBg : undefined,
                                              ["--hb-mt-desktop-bghover" as any]: typeof dBgHover === "string" ? dBgHover : undefined,
                                              ["--hb-mt-tablet-bghover" as any]: typeof tBgHover === "string" ? tBgHover : undefined,
                                              ["--hb-mt-mobile-bghover" as any]: typeof mBgHover === "string" ? mBgHover : undefined,
                                              ["--hb-mt-desktop-radius" as any]: dRadius,
                                              ["--hb-mt-tablet-radius" as any]: tRadius,
                                              ["--hb-mt-mobile-radius" as any]: mRadius,
                                              ["--hb-mt-desktop-pad" as any]: dPad,
                                              ["--hb-mt-tablet-pad" as any]: tPad,
                                              ["--hb-mt-mobile-pad" as any]: mPad,
                                            } as any;
                                          })()
                                        : {})
                                    }}
                                  >
                                    {renderHeaderWidget(child)}
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
                                  className={`${hideClass(child.config)} ${child.type === "header_logo" ? "hb-logo" : child.type === "ad_banner" ? "hb-ad" : (child.type === "header_menu_primary" || child.type === "header_menu_secondary") ? "hb-menu" : child.type === "header_search" ? "hb-search" : child.type === "header_theme_toggle" ? "hb-theme" : child.type === "header_mobile_menu_toggle" ? "hb-mobile-toggle" : ""}`}
                                  style={(() => {
                                    const base =
                                      child.type === "header_logo"
                                        ? (() => {
                                            const vars = resolveLogoSizeVars(child.config || {});
                                            return {
                                              ["--hb-logo-desktop-h" as any]: vars.desktopH,
                                              ["--hb-logo-tablet-h" as any]: vars.tabletH,
                                              ["--hb-logo-mobile-h" as any]: vars.mobileH,
                                              ["--hb-logo-desktop-maxw" as any]: vars.desktopMaxW,
                                              ["--hb-logo-tablet-maxw" as any]: vars.tabletMaxW,
                                              ["--hb-logo-mobile-maxw" as any]: vars.mobileMaxW,
                                              ["--hb-logo-desktop-text" as any]: vars.desktopText,
                                              ["--hb-logo-tablet-text" as any]: vars.tabletText,
                                              ["--hb-logo-mobile-text" as any]: vars.mobileText,
                                            } as any;
                                          })()
                                        : child.type === "ad_banner"
                                        ? (() => {
                                            const vars = resolveAdSizeVars(child.config || {});
                                            const isStretch = String(child?.config?.align || "") === "stretch";
                                            return {
                                              ["--hb-ad-desktop-maxw" as any]: isStretch ? "100%" : vars.desktopMaxW,
                                              ["--hb-ad-tablet-maxw" as any]: "100%",
                                              ["--hb-ad-mobile-maxw" as any]: isStretch ? "100%" : vars.mobileMaxW,
                                            } as any;
                                          })()
                                        : (child.type === "header_menu_primary" || child.type === "header_menu_secondary")
                                        ? (() => {
                                            const cfg = child.config || {};
                                            const dColor = getResponsive(cfg, "menuTextColor", "desktop");
                                            const tColor = getResponsive(cfg, "menuTextColor", "tablet");
                                            const mColor = getResponsive(cfg, "menuTextColor", "mobile");
                                            const dHover = getResponsive(cfg, "menuHoverTextColor", "desktop");
                                            const tHover = getResponsive(cfg, "menuHoverTextColor", "tablet");
                                            const mHover = getResponsive(cfg, "menuHoverTextColor", "mobile");
                                            const dWeight = getResponsive(cfg, "menuFontWeight", "desktop");
                                            const tWeight = getResponsive(cfg, "menuFontWeight", "tablet");
                                            const mWeight = getResponsive(cfg, "menuFontWeight", "mobile");
                                            const dSize = resolveOptionalPx(getResponsive(cfg, "menuFontSize", "desktop"));
                                            const tSize = resolveOptionalPx(getResponsive(cfg, "menuFontSize", "tablet")) || dSize;
                                            const mSize = resolveOptionalPx(getResponsive(cfg, "menuFontSize", "mobile")) || dSize;
                                            const dFont = getResponsive(cfg, "menuFontFamily", "desktop");
                                            const tFont = getResponsive(cfg, "menuFontFamily", "tablet");
                                            const mFont = getResponsive(cfg, "menuFontFamily", "mobile");
                                            return {
                                              ["--hb-menu-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                              ["--hb-menu-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                              ["--hb-menu-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                              ["--hb-menu-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                              ["--hb-menu-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                              ["--hb-menu-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                              ["--hb-menu-desktop-weight" as any]: typeof dWeight === "string" ? dWeight : (typeof dWeight === "number" ? String(dWeight) : undefined),
                                              ["--hb-menu-tablet-weight" as any]: typeof tWeight === "string" ? tWeight : (typeof tWeight === "number" ? String(tWeight) : undefined),
                                              ["--hb-menu-mobile-weight" as any]: typeof mWeight === "string" ? mWeight : (typeof mWeight === "number" ? String(mWeight) : undefined),
                                              ["--hb-menu-desktop-size" as any]: dSize,
                                              ["--hb-menu-tablet-size" as any]: tSize,
                                              ["--hb-menu-mobile-size" as any]: mSize,
                                              ["--hb-menu-desktop-font" as any]: typeof dFont === "string" && dFont.trim() !== "" ? dFont : undefined,
                                              ["--hb-menu-tablet-font" as any]: typeof tFont === "string" && tFont.trim() !== "" ? tFont : undefined,
                                              ["--hb-menu-mobile-font" as any]: typeof mFont === "string" && mFont.trim() !== "" ? mFont : undefined,
                                            } as any;
                                          })()
                                        : child.type === "header_search"
                                        ? (() => {
                                            const cfg = child.config || {};
                                            const dColor = getResponsive(cfg, "searchColor", "desktop");
                                            const tColor = getResponsive(cfg, "searchColor", "tablet");
                                            const mColor = getResponsive(cfg, "searchColor", "mobile");
                                            const dHover = getResponsive(cfg, "searchHoverColor", "desktop");
                                            const tHover = getResponsive(cfg, "searchHoverColor", "tablet");
                                            const mHover = getResponsive(cfg, "searchHoverColor", "mobile");
                                            const dIcon = resolveOptionalPx(getResponsive(cfg, "searchIconSize", "desktop"));
                                            const tIcon = resolveOptionalPx(getResponsive(cfg, "searchIconSize", "tablet")) || dIcon;
                                            const mIcon = resolveOptionalPx(getResponsive(cfg, "searchIconSize", "mobile")) || dIcon;
                                            const dBg = getResponsive(cfg, "searchBgColor", "desktop");
                                            const tBg = getResponsive(cfg, "searchBgColor", "tablet");
                                            const mBg = getResponsive(cfg, "searchBgColor", "mobile");
                                            const dBorder = getResponsive(cfg, "searchBorderColor", "desktop");
                                            const tBorder = getResponsive(cfg, "searchBorderColor", "tablet");
                                            const mBorder = getResponsive(cfg, "searchBorderColor", "mobile");
                                            const dRadius = resolveOptionalPx(getResponsive(cfg, "searchRadius", "desktop"));
                                            const tRadius = resolveOptionalPx(getResponsive(cfg, "searchRadius", "tablet")) || dRadius;
                                            const mRadius = resolveOptionalPx(getResponsive(cfg, "searchRadius", "mobile")) || dRadius;
                                            const dHeight = resolveOptionalPx(getResponsive(cfg, "searchHeight", "desktop"));
                                            const tHeight = resolveOptionalPx(getResponsive(cfg, "searchHeight", "tablet")) || dHeight;
                                            const mHeight = resolveOptionalPx(getResponsive(cfg, "searchHeight", "mobile")) || dHeight;
                                            const dFont = resolveOptionalPx(getResponsive(cfg, "searchFontSize", "desktop"));
                                            const tFont = resolveOptionalPx(getResponsive(cfg, "searchFontSize", "tablet")) || dFont;
                                            const mFont = resolveOptionalPx(getResponsive(cfg, "searchFontSize", "mobile")) || dFont;
                                            const dBtnBg = getResponsive(cfg, "searchButtonBgColor", "desktop");
                                            const tBtnBg = getResponsive(cfg, "searchButtonBgColor", "tablet");
                                            const mBtnBg = getResponsive(cfg, "searchButtonBgColor", "mobile");
                                            const dBtnTxt = getResponsive(cfg, "searchButtonTextColor", "desktop");
                                            const tBtnTxt = getResponsive(cfg, "searchButtonTextColor", "tablet");
                                            const mBtnTxt = getResponsive(cfg, "searchButtonTextColor", "mobile");
                                            return {
                                              ["--hb-search-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                              ["--hb-search-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                              ["--hb-search-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                              ["--hb-search-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                              ["--hb-search-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                              ["--hb-search-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                              ["--hb-search-desktop-icon" as any]: dIcon,
                                              ["--hb-search-tablet-icon" as any]: tIcon,
                                              ["--hb-search-mobile-icon" as any]: mIcon,
                                              ["--hb-search-desktop-bg" as any]: typeof dBg === "string" ? dBg : undefined,
                                              ["--hb-search-tablet-bg" as any]: typeof tBg === "string" ? tBg : undefined,
                                              ["--hb-search-mobile-bg" as any]: typeof mBg === "string" ? mBg : undefined,
                                              ["--hb-search-desktop-border" as any]: typeof dBorder === "string" ? dBorder : undefined,
                                              ["--hb-search-tablet-border" as any]: typeof tBorder === "string" ? tBorder : undefined,
                                              ["--hb-search-mobile-border" as any]: typeof mBorder === "string" ? mBorder : undefined,
                                              ["--hb-search-desktop-radius" as any]: dRadius,
                                              ["--hb-search-tablet-radius" as any]: tRadius,
                                              ["--hb-search-mobile-radius" as any]: mRadius,
                                              ["--hb-search-desktop-height" as any]: dHeight,
                                              ["--hb-search-tablet-height" as any]: tHeight,
                                              ["--hb-search-mobile-height" as any]: mHeight,
                                              ["--hb-search-desktop-font" as any]: dFont,
                                              ["--hb-search-tablet-font" as any]: tFont,
                                              ["--hb-search-mobile-font" as any]: mFont,
                                              ["--hb-search-desktop-btnbg" as any]: typeof dBtnBg === "string" ? dBtnBg : undefined,
                                              ["--hb-search-tablet-btnbg" as any]: typeof tBtnBg === "string" ? tBtnBg : undefined,
                                              ["--hb-search-mobile-btnbg" as any]: typeof mBtnBg === "string" ? mBtnBg : undefined,
                                              ["--hb-search-desktop-btntxt" as any]: typeof dBtnTxt === "string" ? dBtnTxt : undefined,
                                              ["--hb-search-tablet-btntxt" as any]: typeof tBtnTxt === "string" ? tBtnTxt : undefined,
                                              ["--hb-search-mobile-btntxt" as any]: typeof mBtnTxt === "string" ? mBtnTxt : undefined,
                                            } as any;
                                          })()
                                        : child.type === "header_theme_toggle"
                                        ? (() => {
                                            const cfg = child.config || {};
                                            const dColor = getResponsive(cfg, "themeColor", "desktop");
                                            const tColor = getResponsive(cfg, "themeColor", "tablet");
                                            const mColor = getResponsive(cfg, "themeColor", "mobile");
                                            const dHover = getResponsive(cfg, "themeHoverColor", "desktop");
                                            const tHover = getResponsive(cfg, "themeHoverColor", "tablet");
                                            const mHover = getResponsive(cfg, "themeHoverColor", "mobile");
                                            const dIcon = resolveOptionalPx(getResponsive(cfg, "themeIconSize", "desktop"));
                                            const tIcon = resolveOptionalPx(getResponsive(cfg, "themeIconSize", "tablet")) || dIcon;
                                            const mIcon = resolveOptionalPx(getResponsive(cfg, "themeIconSize", "mobile")) || dIcon;
                                            return {
                                              ["--hb-theme-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                              ["--hb-theme-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                              ["--hb-theme-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                              ["--hb-theme-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                              ["--hb-theme-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                              ["--hb-theme-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                              ["--hb-theme-desktop-icon" as any]: dIcon,
                                              ["--hb-theme-tablet-icon" as any]: tIcon,
                                              ["--hb-theme-mobile-icon" as any]: mIcon,
                                            } as any;
                                          })()
                                        : child.type === "header_mobile_menu_toggle"
                                        ? (() => {
                                            const cfg = child.config || {};
                                            const dColor = getResponsive(cfg, "mobileMenuColor", "desktop");
                                            const tColor = getResponsive(cfg, "mobileMenuColor", "tablet");
                                            const mColor = getResponsive(cfg, "mobileMenuColor", "mobile");
                                            const dHover = getResponsive(cfg, "mobileMenuHoverColor", "desktop");
                                            const tHover = getResponsive(cfg, "mobileMenuHoverColor", "tablet");
                                            const mHover = getResponsive(cfg, "mobileMenuHoverColor", "mobile");
                                            const dIcon = resolveOptionalPx(getResponsive(cfg, "mobileMenuIconSize", "desktop"));
                                            const tIcon = resolveOptionalPx(getResponsive(cfg, "mobileMenuIconSize", "tablet")) || dIcon;
                                            const mIcon = resolveOptionalPx(getResponsive(cfg, "mobileMenuIconSize", "mobile")) || dIcon;
                                            const dBg = getResponsive(cfg, "mobileMenuBgColor", "desktop");
                                            const tBg = getResponsive(cfg, "mobileMenuBgColor", "tablet");
                                            const mBg = getResponsive(cfg, "mobileMenuBgColor", "mobile");
                                            const dBgHover = getResponsive(cfg, "mobileMenuBgHoverColor", "desktop");
                                            const tBgHover = getResponsive(cfg, "mobileMenuBgHoverColor", "tablet");
                                            const mBgHover = getResponsive(cfg, "mobileMenuBgHoverColor", "mobile");
                                            const dRadius = resolveOptionalPx(getResponsive(cfg, "mobileMenuRadius", "desktop"));
                                            const tRadius = resolveOptionalPx(getResponsive(cfg, "mobileMenuRadius", "tablet")) || dRadius;
                                            const mRadius = resolveOptionalPx(getResponsive(cfg, "mobileMenuRadius", "mobile")) || dRadius;
                                            const dPad = resolveOptionalPx(getResponsive(cfg, "mobileMenuPadding", "desktop"));
                                            const tPad = resolveOptionalPx(getResponsive(cfg, "mobileMenuPadding", "tablet")) || dPad;
                                            const mPad = resolveOptionalPx(getResponsive(cfg, "mobileMenuPadding", "mobile")) || dPad;
                                            return {
                                              ["--hb-mt-desktop-color" as any]: typeof dColor === "string" ? dColor : undefined,
                                              ["--hb-mt-tablet-color" as any]: typeof tColor === "string" ? tColor : undefined,
                                              ["--hb-mt-mobile-color" as any]: typeof mColor === "string" ? mColor : undefined,
                                              ["--hb-mt-desktop-hover" as any]: typeof dHover === "string" ? dHover : undefined,
                                              ["--hb-mt-tablet-hover" as any]: typeof tHover === "string" ? tHover : undefined,
                                              ["--hb-mt-mobile-hover" as any]: typeof mHover === "string" ? mHover : undefined,
                                              ["--hb-mt-desktop-icon" as any]: dIcon,
                                              ["--hb-mt-tablet-icon" as any]: tIcon,
                                              ["--hb-mt-mobile-icon" as any]: mIcon,
                                              ["--hb-mt-desktop-bg" as any]: typeof dBg === "string" ? dBg : undefined,
                                              ["--hb-mt-tablet-bg" as any]: typeof tBg === "string" ? tBg : undefined,
                                              ["--hb-mt-mobile-bg" as any]: typeof mBg === "string" ? mBg : undefined,
                                              ["--hb-mt-desktop-bghover" as any]: typeof dBgHover === "string" ? dBgHover : undefined,
                                              ["--hb-mt-tablet-bghover" as any]: typeof tBgHover === "string" ? tBgHover : undefined,
                                              ["--hb-mt-mobile-bghover" as any]: typeof mBgHover === "string" ? mBgHover : undefined,
                                              ["--hb-mt-desktop-radius" as any]: dRadius,
                                              ["--hb-mt-tablet-radius" as any]: tRadius,
                                              ["--hb-mt-mobile-radius" as any]: mRadius,
                                              ["--hb-mt-desktop-pad" as any]: dPad,
                                              ["--hb-mt-tablet-pad" as any]: tPad,
                                              ["--hb-mt-mobile-pad" as any]: mPad,
                                            } as any;
                                          })()
                                        : undefined;
                                    const spacingRaw = resolveBoxSpacing(
                                      child.config || {},
                                      child.type !== "header_theme_toggle" && child.type !== "ad_banner"
                                    );
                                    const spacing =
                                      viewportDevice === "tablet" && (child.type === "ad_banner" || child.type === "header_logo")
                                        ? ({ ...spacingRaw, marginLeft: undefined, marginRight: undefined } as any)
                                        : spacingRaw;
                                    return base ? ({ ...base, ...spacing } as any) : (spacing as any);
                                  })()}
                                >
                                  {renderHeaderWidget(child)}
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
          );
        })}
      </>
    );
  }, [colSpanClass, headerBlocks, hideClass, renderHeaderWidget, stickyLayout, viewportDevice]);

  if (renderedFromBlocks) {
    return (
      <header className="contents">
        {renderedFromBlocks}
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} items={effectiveMobile} config={mobileMenuDrawerConfig} siteName={siteName} logoUrl={logoUrl} />
        {searchOpen && (
          <div
            className="fixed inset-0 z-[250] bg-black/50 flex items-start justify-center px-4 py-16"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSearchOpen(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <div className="w-full max-w-xl rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-[var(--home-news-title-color)]">Search</div>
                <button
                  type="button"
                  className="p-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = searchValue.trim();
                  if (!q) return;
                  setSearchOpen(false);
                  router.push(`/search?q=${encodeURIComponent(q)}`);
                }}
              >
                <div className="flex-1 flex items-center gap-2 px-3 h-11 border border-[var(--border)] rounded-xl bg-[var(--bg-base)]">
                  <Search size={18} className="text-[var(--fg-muted)]" />
                  <input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setSearchSuggestionsVisible(true)}
                    className="flex-1 outline-none bg-transparent text-sm text-[var(--home-news-title-color)] placeholder:text-[var(--home-news-title-color)] placeholder:opacity-60"
                    placeholder="Search..."
                    autoFocus
                  />
                </div>
                <button type="submit" className="h-11 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium">
                  Search
                </button>
              </form>
              {searchSuggestionsVisible && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-[var(--fg-secondary)]">
                      {searchValue.trim() ? "Rekomendasi" : "Populer"}
                    </div>
                    {searchSuggestionsLoading && (
                      <div className="text-[10px] text-[var(--fg-muted)] animate-pulse">Memuat…</div>
                    )}
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden min-h-[156px]">
                    {searchSuggestions.length > 0 ? (
                      <div className="divide-y divide-[var(--border)] animate-fade-in">
                        {searchSuggestions.map((post: any) => {
                          const href = buildPostHref(post);
                          const thumbUrl = getPostThumbUrl(post);
                          const dateText = formatDateId(post?.publishedAt || post?.createdAt);
                          const metaParts = [
                            post?.category?.name ? String(post.category.name) : "Berita",
                            dateText,
                          ].filter(Boolean);
                          return (
                            <Link
                              key={String(post.id || href)}
                              href={href}
                              className="block px-3 py-2.5 hover:bg-[var(--bg-surface)] transition-colors"
                              onClick={() => setSearchOpen(false)}
                            >
                              <div className="flex items-start gap-3">
                                <div className="relative w-16 h-12 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-surface)]">
                                  {thumbUrl ? (
                                    <Image src={thumbUrl} alt={String(post?.title || "Thumbnail")} fill className="object-cover" sizes="64px" />
                                  ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[var(--fg-muted)]">No Image</div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="popular-title line-clamp-2">{post?.title}</div>
                                  <div className="popular-meta mt-1">{metaParts.join(" • ")}</div>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-3 py-3 text-sm text-[var(--fg-muted)]">
                        {searchSuggestionsLoading ? "Memuat..." : (searchValue.trim() ? "Tidak ada rekomendasi." : "Belum ada rekomendasi.")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className={`border-b border-gray-100 bg-white shadow-sm ${legacyConfig.sticky ? "sticky top-0 z-50" : ""}`}>
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

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} items={effectiveMobile} config={mobileMenuDrawerConfig} siteName={siteName} logoUrl={logoUrl} />
      {searchOpen && (
        <div
          className="fixed inset-0 z-[250] bg-black/50 flex items-start justify-center px-4 py-16"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSearchOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div className="w-full max-w-xl rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-[var(--home-news-title-color)]">Search</div>
              <button
                type="button"
                className="p-2 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
                onClick={() => setSearchOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchValue.trim();
                if (!q) return;
                setSearchOpen(false);
                router.push(`/search?q=${encodeURIComponent(q)}`);
              }}
            >
              <div className="flex-1 flex items-center gap-2 px-3 h-11 border border-[var(--border)] rounded-xl bg-[var(--bg-base)]">
                <Search size={18} className="text-[var(--fg-muted)]" />
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setSearchSuggestionsVisible(true)}
                  className="flex-1 outline-none bg-transparent text-sm text-[var(--home-news-title-color)] placeholder:text-[var(--home-news-title-color)] placeholder:opacity-60"
                  placeholder="Search..."
                  autoFocus
                />
              </div>
              <button type="submit" className="h-11 px-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium">
                Search
              </button>
            </form>
            {searchSuggestionsVisible && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-[var(--fg-secondary)]">
                    {searchValue.trim() ? "Rekomendasi" : "Populer"}
                  </div>
                  {searchSuggestionsLoading && (
                    <div className="text-[10px] text-[var(--fg-muted)] animate-pulse">Memuat…</div>
                  )}
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden min-h-[156px]">
                  {searchSuggestions.length > 0 ? (
                    <div className="divide-y divide-[var(--border)] animate-fade-in">
                      {searchSuggestions.map((post: any) => {
                        const href = buildPostHref(post);
                        const thumbUrl = getPostThumbUrl(post);
                        const dateText = formatDateId(post?.publishedAt || post?.createdAt);
                        const metaParts = [
                          post?.category?.name ? String(post.category.name) : "Berita",
                          dateText,
                        ].filter(Boolean);
                        return (
                          <Link
                            key={String(post.id || href)}
                            href={href}
                            className="block px-3 py-2.5 hover:bg-[var(--bg-surface)] transition-colors"
                            onClick={() => setSearchOpen(false)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative w-16 h-12 shrink-0 overflow-hidden rounded-lg bg-[var(--bg-surface)]">
                                {thumbUrl ? (
                                  <Image src={thumbUrl} alt={String(post?.title || "Thumbnail")} fill className="object-cover" sizes="64px" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[var(--fg-muted)]">No Image</div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="popular-title line-clamp-2">{post?.title}</div>
                                <div className="popular-meta mt-1">{metaParts.join(" • ")}</div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-3 py-3 text-sm text-[var(--fg-muted)]">
                      {searchSuggestionsLoading ? "Memuat..." : (searchValue.trim() ? "Tidak ada rekomendasi." : "Belum ada rekomendasi.")}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
