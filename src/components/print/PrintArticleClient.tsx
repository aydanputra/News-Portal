"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Printer, SlidersHorizontal, X } from "lucide-react";

type PrintDefaults = {
  showFeaturedImage: boolean;
  showImages: boolean;
  showExcerpt: boolean;
  showAuthor: boolean;
  showEditor: boolean;
  showCategory: boolean;
  showTags: boolean;
  showDate: boolean;
  fontFamily: string;
  titleFontSizePx: number;
  fontSizePx: number;
  lineHeight: number;
  contentWidthPx: number;
  pageMarginMm: number;
  featuredImageMaxHeightPx: number;
};



type PrintSettings = {
  enabled: boolean;
  defaults: PrintDefaults;
  header: { mode: "site" | "custom" | "image" | "none"; customText: string; showLogo: boolean; customImageUrl: string };
};

type InlineAdsConfig = {
  enabled: boolean;
  positions: number[];
};

type InlineAdMedia = {
  fileUrl: string;
};

type InlineAdvertisement = {
  id: string;
  name: string;
  type: "IMAGE" | "SCRIPT";
  position: string;
  linkUrl?: string | null;
  media?: InlineAdMedia | null;
};

export default function PrintArticleClient({
  post,
  site,
  settings,
  inlineAdsConfig,
}: {
  post: any;
  site: { siteName: string; logoUrl?: string | null; publicUrl?: string | null };
  settings: PrintSettings;
  inlineAdsConfig?: InlineAdsConfig;
}) {
  const defaults = settings?.defaults;
  const [open, setOpen] = useState(true);
  const [showImages, setShowImages] = useState(Boolean(defaults?.showImages));
  const [showFeaturedImage, setShowFeaturedImage] = useState(Boolean(defaults?.showFeaturedImage));
  const [showExcerpt, setShowExcerpt] = useState(Boolean(defaults?.showExcerpt));
  const [showAuthor, setShowAuthor] = useState(Boolean(defaults?.showAuthor));
  const [showEditor, setShowEditor] = useState(Boolean(defaults?.showEditor));
  const [showCategory, setShowCategory] = useState(Boolean(defaults?.showCategory));
  const [showTags, setShowTags] = useState(Boolean(defaults?.showTags));
  const [showDate, setShowDate] = useState(Boolean(defaults?.showDate));
  const [fontFamily, setFontFamily] = useState(String(defaults?.fontFamily || "Georgia, serif"));
  const [titleFontSizePx, setTitleFontSizePx] = useState(Number((defaults as any)?.titleFontSizePx || 28));
  const [fontSizePx, setFontSizePx] = useState(Number(defaults?.fontSizePx || 16));
  const [lineHeight, setLineHeight] = useState(Number(defaults?.lineHeight || 1.65));
  const [contentWidthPx, setContentWidthPx] = useState(Number(defaults?.contentWidthPx || 820));
  const [pageMarginMm, setPageMarginMm] = useState(Number(defaults?.pageMarginMm || 12));
  const [featuredImageMaxHeightPx, setFeaturedImageMaxHeightPx] = useState(Number((defaults as any)?.featuredImageMaxHeightPx || 360));
  const [contentHtml, setContentHtml] = useState<string>(String(post?.content || ""));
  const [customAds, setCustomAds] = useState<Array<{ id: string; label: string; enabled: boolean }>>([]);

  const headerText = useMemo(() => {
    const mode = settings?.header?.mode || "site";
    if (mode === "none") return "";
    if (mode === "custom") {
      const text = String(settings?.header?.customText || "").trim();
      return text !== "" ? text : site.siteName;
    }
    return site.siteName;
  }, [settings?.header?.customText, settings?.header?.mode, site.siteName]);

  const headerImageUrl = useMemo(() => {
    const raw = settings?.header?.customImageUrl;
    return typeof raw === "string" && raw.trim() !== "" ? raw.trim() : "";
  }, [settings?.header?.customImageUrl]);

  const imageUrl = useMemo(() => {
    const isInfographicPost = String(post?.type || "").toUpperCase() === "INFOGRAPHIC";
    const base = isInfographicPost ? (post?.featuredImage?.fileUrl || post?.image) : (post?.image || post?.featuredImage?.fileUrl);
    return typeof base === "string" && base.trim() !== "" ? base : null;
  }, [post?.featuredImage?.fileUrl, post?.image, post?.type]);

  useEffect(() => {
    const raw = String(post?.content || "");
    if (typeof window === "undefined") return;
    if (!raw.trim()) {
      setContentHtml("");
      setCustomAds([]);
      return;
    }

    const escapeAttr = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const detect = (html: string) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const isAdsenseNode = (node: Element) => {
        const tag = node.tagName.toLowerCase();
        if (tag === "ins" && node.classList.contains("adsbygoogle")) return true;
        if (tag === "script") {
          const src = (node.getAttribute("src") || "").toLowerCase();
          if (src.includes("adsbygoogle") || src.includes("googlesyndication") || src.includes("doubleclick")) return true;
          const code = (node.textContent || "").toLowerCase();
          if (code.includes("adsbygoogle")) return true;
        }
        if (tag === "iframe") {
          const src = (node.getAttribute("src") || "").toLowerCase();
          if (src.includes("googleads") || src.includes("doubleclick") || src.includes("googlesyndication")) return true;
        }
        return false;
      };

      const hasAdsenseInside = (node: Element) => {
        if (isAdsenseNode(node)) return true;
        if (node.querySelector("ins.adsbygoogle")) return true;
        const scripts = Array.from(node.querySelectorAll("script"));
        if (scripts.some((s) => isAdsenseNode(s))) return true;
        const iframes = Array.from(node.querySelectorAll("iframe"));
        if (iframes.some((f) => isAdsenseNode(f))) return true;
        return false;
      };

      const keywordHit = (value: string) =>
        /(inline-ad|adbanner|ad-banner|banner-iklan|iklan|sponsor|promosi|promo|advert|ads)/i.test(value);

      const originHost = (() => {
        try {
          return new URL(window.location.href).host;
        } catch {
          return "";
        }
      })();

      const isExternalHref = (href: string) => {
        try {
          const u = new URL(href, window.location.origin);
          if (!u.host) return false;
          return originHost ? u.host !== originHost : href.startsWith("http");
        } catch {
          return href.startsWith("http");
        }
      };

      const getWrapper = (img: HTMLImageElement) => {
        const preferred = img.closest("figure, aside, p, div");
        return preferred || img;
      };

      const wrappers: Array<{ wrapper: Element; imgSrc: string; label: string; width?: number; height?: number }> = [];

      const imgNodes = Array.from(doc.body.querySelectorAll("img")) as HTMLImageElement[];
      for (const img of imgNodes) {
        if (!(img instanceof HTMLImageElement)) continue;
        if (img.closest("ins.adsbygoogle")) continue;

        const src = String(img.getAttribute("src") || "").trim();
        if (!src) continue;

        const alt = String(img.getAttribute("alt") || "").trim();
        const title = String(img.getAttribute("title") || "").trim();
        const className = String(img.getAttribute("class") || "").trim();

        const a = img.closest("a[href]") as HTMLAnchorElement | null;
        const href = a ? String(a.getAttribute("href") || "").trim() : "";
        const rel = a ? String(a.getAttribute("rel") || "").trim() : "";
        const target = a ? String(a.getAttribute("target") || "").trim() : "";

        const looksLikeCustomAdByKeyword = keywordHit(`${alt} ${title} ${className}`);
        const looksLikeCustomAdByLink =
          Boolean(a) && (rel.toLowerCase().includes("sponsored") || target === "_blank" || (href ? isExternalHref(href) : false));

        if (!looksLikeCustomAdByKeyword && !looksLikeCustomAdByLink) continue;

        const wrapper = getWrapper(img);
        if (hasAdsenseInside(wrapper) || isAdsenseNode(wrapper)) continue;

        const widthAttr = Number(img.getAttribute("width") || "");
        const heightAttr = Number(img.getAttribute("height") || "");
        const w = Number.isFinite(widthAttr) && widthAttr > 0 ? widthAttr : undefined;
        const h = Number.isFinite(heightAttr) && heightAttr > 0 ? heightAttr : undefined;

        const labelFromHref = href ? (() => { try { return new URL(href, window.location.origin).host; } catch { return ""; } })() : "";
        const labelFromSrc = src.split("/").pop() || "";
        const label = (alt || title || labelFromHref || labelFromSrc || "Banner Iklan").trim();

        wrappers.push({ wrapper, imgSrc: src, label, width: w, height: h });
      }

      const uniq: Array<{ wrapper: Element; imgSrc: string; label: string; width?: number; height?: number }> = [];
      for (const item of wrappers) {
        if (uniq.some((u) => u.wrapper === item.wrapper)) continue;
        if (uniq.some((u) => u.wrapper.contains(item.wrapper))) continue;
        uniq.push(item);
      }

      const items = uniq.map((item, idx) => {
        const id = `ad_${idx + 1}`;
        item.wrapper.setAttribute("data-print-ad-id", id);
        item.wrapper.setAttribute("data-print-custom-ad", "1");
        return { id, label: item.label, imgSrc: item.imgSrc, width: item.width, height: item.height };
      });

      return { doc, items };
    };

    let cancelled = false;
    const run = async () => {
      const inlineEnabled = Boolean(inlineAdsConfig?.enabled);
      const inlinePositions = Array.isArray(inlineAdsConfig?.positions) ? inlineAdsConfig!.positions : [];
      const inlineSlotCount = inlineEnabled ? Math.min(3, inlinePositions.length) : 0;
      const inlineSlotCodes = Array.from({ length: inlineSlotCount }, (_, idx) => `ARTICLE_INLINE_${idx + 1}`);
      const tagSlugs: string[] = Array.isArray(post?.tags)
        ? Array.from(
            new Set(
              post.tags
                .map((t: any) => String(t?.slug || "").trim().toLowerCase())
                .filter((value: string) => Boolean(value))
            )
          )
        : [];
      const categorySlug = post?.category?.slug ? String(post.category.slug).trim().toLowerCase() : "";

      const inlineAdsByCode = new Map<
        string,
        { id: string; label: string; imgSrc: string; linkUrl?: string | null }
      >();

      if (inlineSlotCodes.length > 0) {
        try {
          const params = new URLSearchParams({
            active: "true",
            pageType: "POST_DETAIL",
            positions: inlineSlotCodes.join(","),
          });
          if (categorySlug) params.set("categorySlug", categorySlug);
          if (tagSlugs.length > 0) params.set("tagSlugs", tagSlugs.join(","));
          const res = await fetch(`/api/ads?${params.toString()}`, { cache: "no-store" });
          const data = await res.json();
          const ads: InlineAdvertisement[] = Array.isArray(data) ? data : [];
          for (let i = 0; i < inlineSlotCodes.length; i += 1) {
            const code = inlineSlotCodes[i];
            const selected = ads.find((ad) => String(ad?.position || "").toUpperCase() === code);
            if (!selected || selected.type !== "IMAGE") continue;
            const src = String(selected.media?.fileUrl || "").trim();
            if (!src) continue;
            inlineAdsByCode.set(code, {
              id: `inline_${i + 1}`,
              label: selected.name || `Banner Iklan Dalam Artikel #${i + 1}`,
              imgSrc: src,
              linkUrl: typeof selected.linkUrl === "string" ? selected.linkUrl : null,
            });
          }
        } catch {
          inlineAdsByCode.clear();
        }
      }

      const result = detect(raw);
      const doc = result.doc;

      const injectedInlineItems: Array<{ id: string; label: string }> = [];
      if (inlineAdsByCode.size > 0 && inlinePositions.length > 0) {
        const paragraphs = Array.from(doc.body.querySelectorAll("p"));
        for (let idx = 0; idx < paragraphs.length; idx += 1) {
          const paragraphCount = idx + 1;
          const insertIndex = inlinePositions.indexOf(paragraphCount);
          if (insertIndex === -1) continue;
          const slotNumber = insertIndex + 1;
          if (slotNumber > inlineSlotCount) continue;
          const code = `ARTICLE_INLINE_${slotNumber}`;
          const inline = inlineAdsByCode.get(code);
          if (!inline) continue;

          const aside = doc.createElement("aside");
          aside.className = "print-inline-ad";
          aside.setAttribute("data-print-ad-id", inline.id);
          aside.setAttribute("data-print-custom-ad", "1");
          aside.setAttribute("data-print-ad-position", code);

          const imgHtml = `<img src="${escapeAttr(inline.imgSrc)}" alt="${escapeAttr(inline.label)}" />`;
          const innerHtml =
            inline.linkUrl && String(inline.linkUrl).trim() !== ""
              ? `<a href="${escapeAttr(String(inline.linkUrl))}" target="_blank" rel="noopener noreferrer">${imgHtml}</a>`
              : imgHtml;
          aside.innerHTML = innerHtml;

          const currentP = paragraphs[idx];
          currentP.insertAdjacentElement("afterend", aside);
          injectedInlineItems.push({ id: inline.id, label: inline.label });
        }
      }

      setContentHtml(doc.body.innerHTML);

      const loadSize = (src: string) =>
        new Promise<{ w: number; h: number } | null>((resolve) => {
          const im = new window.Image();
          im.onload = () => resolve({ w: im.naturalWidth || 0, h: im.naturalHeight || 0 });
          im.onerror = () => resolve(null);
          im.src = src;
        });

      const isLikelyBanner = (w: number, h: number) => {
        if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return false;
        const ratio = w / h;
        if (w >= 600 && h <= 220 && ratio >= 2.4) return true;
        if (w >= 250 && w <= 420 && h >= 200 && h <= 360) return true;
        if (w >= 300 && h <= 160 && ratio >= 2.0) return true;
        return false;
      };

      const resolved = await Promise.all(
        result.items.map(async (it) => {
          const w = typeof it.width === "number" ? it.width : undefined;
          const h = typeof it.height === "number" ? it.height : undefined;
          if (w && h) return { ...it, w, h, ok: isLikelyBanner(w, h) };
          const size = await loadSize(it.imgSrc);
          if (!size) return { ...it, w: 0, h: 0, ok: false };
          return { ...it, w: size.w, h: size.h, ok: isLikelyBanner(size.w, size.h) };
        })
      );

      const filteredDetected = resolved.filter((r) => r.ok);

      if (cancelled) return;
      setCustomAds((prev) => {
        const enabledById = new Map(prev.map((p) => [p.id, p.enabled]));
        const inline = injectedInlineItems.map((it) => ({
          id: it.id,
          label: it.label,
          enabled: enabledById.get(it.id) ?? true,
        }));
        const detected = filteredDetected.map((a) => ({ id: a.id, label: a.label, enabled: enabledById.get(a.id) ?? true }));
        return [...inline, ...detected];
      });
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [post?.content, post?.id, post?.category?.slug, post?.tags, inlineAdsConfig]);

  const rootStyle = {
    ["--print-font-family" as any]: fontFamily,
    ["--print-font-size" as any]: `${fontSizePx}px`,
    ["--print-title-size" as any]: `${titleFontSizePx}px`,
    ["--print-line-height" as any]: String(lineHeight),
    ["--print-content-width" as any]: `${contentWidthPx}px`,
    ["--print-page-margin" as any]: `${pageMarginMm}mm`,
  } as React.CSSProperties;

  const contentClass = showImages ? "print-content" : "print-content print-hide-images";

  const canUseControls = Boolean(settings?.enabled);

  const featuredHeightPx = useMemo(() => {
    const ratio = 16 / 9;
    const base = Math.round(contentWidthPx / ratio);
    const cap = Math.max(180, Math.min(720, Math.floor(featuredImageMaxHeightPx || 360)));
    return Math.max(180, Math.min(cap, base));
  }, [contentWidthPx, featuredImageMaxHeightPx]);

  const hiddenAdsCss = useMemo(() => {
    const rules = customAds
      .filter((a) => !a.enabled)
      .map((a) => `[data-print-ad-id="${a.id}"]{display:none !important;}`);
    return rules.join("\n");
  }, [customAds]);

  return (
    <div className="min-h-screen bg-white text-black" style={rootStyle}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --print-font-family: Georgia, 'Times New Roman', Times, serif;
              --print-font-size: 16px;
              --print-title-size: 28px;
              --print-line-height: 1.65;
              --print-content-width: 820px;
              --print-page-margin: 12mm;
            }
            .print-shell {
              max-width: var(--print-content-width);
              margin: 0 auto;
              padding: 24px 16px 56px 16px;
              font-family: var(--print-font-family) !important;
              font-size: var(--print-font-size) !important;
              line-height: var(--print-line-height) !important;
            }
            .print-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              padding-bottom: 14px;
              margin-bottom: 18px;
              border-bottom: 1px solid #e5e7eb;
            }
            .print-header--image {
              display: block;
            }
            .print-header-image-wrap {
              position: relative;
              height: 120px;
              width: 100%;
            }
            .print-title {
              font-weight: 800;
              line-height: 1.2;
              font-size: var(--print-title-size);
              margin: 0;
            }
            .print-meta {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              font-size: 12px;
              color: #4b5563;
              margin-top: 10px;
            }
            .print-excerpt {
              margin: 16px 0 20px 0;
              padding: 14px 16px;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              background: #f9fafb;
              color: #111827;
              font-size: 14px;
            }
            .print-featured {
              margin: 18px 0 18px 0;
            }
            .print-featured figcaption {
              margin-top: 8px;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
            .print-content {
              color: #111827;
              font-family: inherit !important;
              font-size: inherit !important;
              line-height: inherit !important;
            }
            .print-content img {
              max-width: 100% !important;
              height: auto !important;
              page-break-inside: avoid;
            }
            .print-hide-images img {
              display: none !important;
            }
            .print-inline-ad {
              margin: 18px 0;
              page-break-inside: avoid;
            }
            .print-inline-ad a {
              display: block;
              text-decoration: none;
            }
            .print-inline-ad img {
              width: 100% !important;
              height: auto !important;
              display: block;
              page-break-inside: avoid;
            }
            .print-content :where(p, span, div, li, blockquote, h1, h2, h3, h4, h5, h6, a, strong, em) {
              background: transparent !important;
              background-color: transparent !important;
              color: inherit !important;
            }
            .print-content :where(p, span, div, li, blockquote, a, strong, em) {
              font-family: inherit !important;
              font-size: inherit !important;
              line-height: inherit !important;
            }
            .print-content a {
              text-decoration: underline;
            }
            .print-tags {
              margin-top: 22px;
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              font-size: 12px;
              color: #111827;
            }
            .print-tags a {
              border: 1px solid #e5e7eb;
              padding: 4px 10px;
              border-radius: 9999px;
              text-decoration: none;
              color: inherit;
            }
            .print-footer {
              margin-top: 30px;
              padding-top: 14px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              display: flex;
              justify-content: space-between;
              gap: 12px;
              flex-wrap: wrap;
            }
            .print-toolbar {
              position: sticky;
              top: 0;
              z-index: 50;
              background: rgba(255, 255, 255, 0.92);
              backdrop-filter: blur(10px);
              border-bottom: 1px solid #e5e7eb;
            }
            .print-toolbar-inner {
              max-width: var(--print-content-width);
              margin: 0 auto;
              padding: 10px 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
            }
            .pf-btn {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              border: 1px solid #e5e7eb;
              background: #111827;
              color: #ffffff;
              padding: 8px 12px;
              border-radius: 12px;
              font-weight: 700;
              font-size: 12px;
            }
            .pf-btn-ghost {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              border: 1px solid #e5e7eb;
              background: #ffffff;
              color: #111827;
              padding: 8px 12px;
              border-radius: 12px;
              font-weight: 700;
              font-size: 12px;
            }
            .pf-panel {
              max-width: var(--print-content-width);
              margin: 0 auto;
              padding: 0 16px 12px 16px;
              font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
            }
            .pf-card {
              border: 1px solid #e5e7eb;
              border-radius: 16px;
              padding: 12px;
              background: #ffffff;
              display: grid;
              gap: 10px;
            }
            .pf-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 10px;
            }
            @media (min-width: 768px) {
              .pf-grid { grid-template-columns: 1fr 1fr; }
            }
            .pf-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
              padding: 10px 12px;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              background: #f9fafb;
              font-size: 12px;
              font-weight: 700;
              color: #111827;
            }
            .pf-row span { font-weight: 700; }
            .pf-row small { font-weight: 600; color: #6b7280; display: block; margin-top: 2px; }
            .pf-row input[type="checkbox"] { width: 18px; height: 18px; }
            .pf-input {
              width: 100%;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 8px 10px;
              font-size: 12px;
            }
            @media print {
              @page { margin: var(--print-page-margin); }
              .print-toolbar, .pf-panel { display: none !important; }
              .print-shell { padding: 0 !important; max-width: 100% !important; }
              a[href]::after { content: ""; }
            }
            ${hiddenAdsCss}
          `,
        }}
      />

      {canUseControls && (
        <div className="print-toolbar">
          <div className="print-toolbar-inner">
            <div className="flex items-center gap-2">
              <button type="button" className="pf-btn" onClick={() => window.print()}>
                <Printer size={16} />
                Print
              </button>
              <button type="button" className="pf-btn-ghost" onClick={() => setOpen((v) => !v)}>
                <SlidersHorizontal size={16} />
                Sesuaikan
              </button>
            </div>
            <Link href={`/${post?.category?.slug || "berita"}/${post?.slug || ""}`} className="pf-btn-ghost">
              Kembali
            </Link>
          </div>

          {open && (
            <div className="pf-panel">
              <div className="pf-card">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black">Pengaturan Print</div>
                  <button type="button" className="pf-btn-ghost" onClick={() => setOpen(false)}>
                    <X size={16} />
                    Tutup
                  </button>
                </div>

                <div className="pf-grid">
                  <label className="pf-row">
                    <div>
                      <span>Gambar</span>
                      <small>Sembunyikan semua gambar di konten</small>
                    </div>
                    <input type="checkbox" checked={showImages} onChange={(e) => setShowImages(e.target.checked)} />
                  </label>
                  <label className="pf-row">
                    <div>
                      <span>Featured</span>
                      <small>Gambar utama di atas konten</small>
                    </div>
                    <input
                      type="checkbox"
                      checked={showFeaturedImage}
                      onChange={(e) => setShowFeaturedImage(e.target.checked)}
                    />
                  </label>
                  <div className="pf-row">
                    <div>
                      <span>Ukuran Featured</span>
                      <small>Max height (px)</small>
                    </div>
                    <input
                      className="pf-input"
                      type="number"
                      min={180}
                      max={720}
                      value={featuredImageMaxHeightPx}
                      onChange={(e) => setFeaturedImageMaxHeightPx(Number(e.target.value || 360))}
                    />
                  </div>
                  <label className="pf-row">
                    <div>
                      <span>Ringkasan</span>
                      <small>Excerpt</small>
                    </div>
                    <input type="checkbox" checked={showExcerpt} onChange={(e) => setShowExcerpt(e.target.checked)} />
                  </label>
                  <label className="pf-row">
                    <div>
                      <span>Penulis</span>
                      <small>Nama penulis</small>
                    </div>
                    <input type="checkbox" checked={showAuthor} onChange={(e) => setShowAuthor(e.target.checked)} />
                  </label>
                  <label className="pf-row">
                    <div>
                      <span>Editor</span>
                      <small>Yang publish</small>
                    </div>
                    <input type="checkbox" checked={showEditor} onChange={(e) => setShowEditor(e.target.checked)} />
                  </label>
                  <label className="pf-row">
                    <div>
                      <span>Tanggal</span>
                      <small>Publish date</small>
                    </div>
                    <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} />
                  </label>
                  <label className="pf-row">
                    <div>
                      <span>Kategori</span>
                      <small>Nama kategori</small>
                    </div>
                    <input type="checkbox" checked={showCategory} onChange={(e) => setShowCategory(e.target.checked)} />
                  </label>
                  <label className="pf-row">
                    <div>
                      <span>Tag</span>
                      <small>Topik terkait</small>
                    </div>
                    <input type="checkbox" checked={showTags} onChange={(e) => setShowTags(e.target.checked)} />
                  </label>
                </div>

                <div className="pf-grid">
                  <label className="pf-row">
                    <div>
                      <span>Ukuran Font</span>
                      <small>12–26</small>
                    </div>
                    <input
                      className="pf-input"
                      type="number"
                      min={12}
                      max={26}
                      value={fontSizePx}
                      onChange={(e) => setFontSizePx(Number(e.target.value || 16))}
                    />
                  </label>
                  <label className="pf-row">
                    <div>
                      <span>Ukuran Judul</span>
                      <small>18–44</small>
                    </div>
                    <input
                      className="pf-input"
                      type="number"
                      min={18}
                      max={44}
                      value={titleFontSizePx}
                      onChange={(e) => setTitleFontSizePx(Number(e.target.value || 28))}
                    />
                  </label>
                  <label className="pf-row">
                    <div>
                      <span>Line Height</span>
                      <small>1.2–2.2</small>
                    </div>
                    <input
                      className="pf-input"
                      type="number"
                      step="0.05"
                      min={1.2}
                      max={2.2}
                      value={lineHeight}
                      onChange={(e) => setLineHeight(Number(e.target.value || 1.65))}
                    />
                  </label>
                  <label className="pf-row">
                    <div>
                      <span>Lebar Konten</span>
                      <small>px</small>
                    </div>
                    <input
                      className="pf-input"
                      type="number"
                      min={560}
                      max={1040}
                      value={contentWidthPx}
                      onChange={(e) => setContentWidthPx(Number(e.target.value || 820))}
                    />
                  </label>
                  <label className="pf-row">
                    <div>
                      <span>Margin Kertas</span>
                      <small>mm</small>
                    </div>
                    <input
                      className="pf-input"
                      type="number"
                      min={6}
                      max={25}
                      value={pageMarginMm}
                      onChange={(e) => setPageMarginMm(Number(e.target.value || 12))}
                    />
                  </label>
                </div>

                <div>
                  <div className="text-xs font-black mb-2">Font family</div>
                  <input className="pf-input" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} />
                </div>

                <div>
                  <div className="text-xs font-black mb-2">Iklan Dalam Artikel</div>
                  {customAds.length === 0 ? (
                    <div className="text-xs opacity-70">
                      Tidak ada banner iklan custom yang terdeteksi pada konten artikel ini.
                    </div>
                  ) : (
                    <div className="pf-grid">
                      {customAds.map((ad) => (
                        <label key={ad.id} className="pf-row">
                          <div>
                            <span>{ad.id.replace("_", " ").toUpperCase()}</span>
                            <small>{ad.label}</small>
                          </div>
                          <input
                            type="checkbox"
                            checked={ad.enabled}
                            onChange={(e) =>
                              setCustomAds((prev) =>
                                prev.map((item) => (item.id === ad.id ? { ...item, enabled: e.target.checked } : item))
                              )
                            }
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <main className="print-shell">
        {(settings?.header?.mode || "site") !== "none" && (
          <header className={`print-header ${settings?.header?.mode === "image" ? "print-header--image" : ""}`}>
            {settings?.header?.mode === "image" ? (
              <div className="min-w-0">
                {headerImageUrl ? (
                  <div className="print-header-image-wrap">
                    <Image src={headerImageUrl} alt={site.siteName} fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="text-sm font-black truncate">{site.siteName}</div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0">
                {Boolean(settings?.header?.showLogo) &&
                  typeof site.logoUrl === "string" &&
                  site.logoUrl.trim() !== "" && (
                    <div className="relative w-8 h-8 shrink-0">
                      <Image src={site.logoUrl} alt={site.siteName} fill className="object-contain" unoptimized />
                    </div>
                  )}
                <div className="min-w-0">
                  <div className="text-sm font-black truncate">{headerText}</div>
                </div>
              </div>
            )}
          </header>
        )}

        <article>
          <h1 className="print-title">{post?.title || ""}</h1>
          <div className="print-meta">
            {showAuthor && post?.author?.name && <span>Penulis: {post.author.name}</span>}
            {showEditor && post?.approvedBy?.name && <span>Editor: {post.approvedBy.name}</span>}
            {showDate && post?.publishedAt && (
              <span>
                Tanggal:{" "}
                {new Date(post.publishedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
            )}
            {showCategory && post?.category?.name && <span>Kategori: {post.category.name}</span>}
          </div>

          {showExcerpt && typeof post?.excerpt === "string" && post.excerpt.trim() !== "" && (
            <div className="print-excerpt">{post.excerpt}</div>
          )}

          {showFeaturedImage && imageUrl && (
            <figure className="print-featured">
              <div className="relative w-full" style={{ height: `${featuredHeightPx}px` }}>
                <Image src={imageUrl} alt={post?.title || ""} fill className="object-cover rounded-xl" unoptimized />
              </div>
              {post?.featuredImage?.caption && <figcaption>{post.featuredImage.caption}</figcaption>}
            </figure>
          )}

          <div
            className={contentClass}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {showTags && Array.isArray(post?.tags) && post.tags.length > 0 && (
            <div className="print-tags">
              {post.tags.map((t: any) => (
                <Link key={t.id || t.slug || t.name} href={`/tag/${t.slug || ""}`}>
                  #{t.name}
                </Link>
              ))}
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
