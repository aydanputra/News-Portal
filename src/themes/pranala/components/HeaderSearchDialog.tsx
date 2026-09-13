"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface HeaderSearchDialogProps {
  open: boolean;
  onClose: () => void;
  placeholder: string;
  buttonLabel: string;
}

const buildPostHref = (post: any) => {
  const slug = String(post?.slug || "").trim();
  if (!slug) return "#";
  const catSlug = String(post?.category?.slug || "berita").trim() || "berita";
  return `/${catSlug}/${slug}`;
};

const getPostThumbUrl = (post: any) => {
  const url = String(post?.image || post?.featuredImage?.fileUrl || "").trim();
  return url || null;
};

const formatDateId = (value?: string | Date | null) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

export default function HeaderSearchDialog({
  open,
  onClose,
  placeholder,
  buttonLabel,
}: HeaderSearchDialogProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const suggestAbortRef = useRef<AbortController | null>(null);
  const suggestTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      if (suggestTimerRef.current) window.clearTimeout(suggestTimerRef.current);
      suggestTimerRef.current = null;
      suggestAbortRef.current?.abort();
      suggestAbortRef.current = null;
      setSearchValue("");
      setSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionsVisible(false);
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) return;

    const query = searchValue.trim();
    setSuggestionsVisible(true);

    if (suggestTimerRef.current) window.clearTimeout(suggestTimerRef.current);
    suggestTimerRef.current = window.setTimeout(async () => {
      suggestAbortRef.current?.abort();
      const aborter = new AbortController();
      suggestAbortRef.current = aborter;

      setSuggestionsLoading(true);
      try {
        const url = query
          ? `/api/public/posts?q=${encodeURIComponent(query)}&limit=6&sort=latest`
          : "/api/public/posts?limit=6&sort=popular";
        const response = await fetch(url, { signal: aborter.signal });
        const json = await response.json();
        setSuggestions(Array.isArray(json?.data) ? json.data : []);
      } catch (error: any) {
        if (error?.name !== "AbortError") setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, query ? 320 : 120);

    return () => {
      if (suggestTimerRef.current) window.clearTimeout(suggestTimerRef.current);
      suggestTimerRef.current = null;
    };
  }, [open, searchValue]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[250] overflow-y-auto bg-black/50 px-4 py-6 sm:py-10 md:py-16"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="flex min-h-full items-start justify-center md:items-center"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-xl rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)] p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold [color:var(--home-widget-title-color,var(--fg-primary))]">Search</div>
          <button
            type="button"
            className="rounded-lg p-2 [color:var(--muted-text,var(--fg-muted))] hover:bg-[color:var(--bg-surface)] hover:text-[color:var(--fg-primary)]"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <form
          className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          onSubmit={(event) => {
            event.preventDefault();
            const query = searchValue.trim();
            if (!query) return;
            onClose();
            router.push(`/search?q=${encodeURIComponent(query)}`);
          }}
        >
          <div className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-base)] px-3">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] [color:var(--muted-text,var(--fg-muted))]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onFocus={() => setSuggestionsVisible(true)}
              className="min-w-0 flex-1 bg-transparent text-sm [color:var(--fg-primary)] outline-none placeholder:[color:var(--muted-text,var(--fg-secondary))] placeholder:opacity-80"
              placeholder={placeholder}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-[color:var(--accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[color:var(--accent-hover)] sm:w-auto sm:min-w-[104px]"
          >
            {buttonLabel}
          </button>
        </form>

        {suggestionsVisible && (
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold [color:var(--home-widget-title-color,var(--fg-secondary))]">{searchValue.trim() ? "Rekomendasi" : "Populer"}</div>
              {suggestionsLoading && <div className="animate-pulse text-[10px] [color:var(--muted-text,var(--fg-muted))]">Memuat…</div>}
            </div>

            <div className="min-h-[156px] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--bg-elevated)]">
              {suggestions.length > 0 ? (
                <div className="animate-fade-in divide-y divide-[color:var(--border)]">
                  {suggestions.map((post: any) => {
                    const href = buildPostHref(post);
                    const thumbUrl = getPostThumbUrl(post);
                    const dateText = formatDateId(post?.publishedAt || post?.createdAt);
                    const metaParts = [post?.category?.name ? String(post.category.name) : "Berita", dateText].filter(Boolean);

                    return (
                      <Link
                        key={String(post.id || href)}
                        href={href}
                        className="block px-3 py-2.5 transition-colors hover:bg-[color:var(--bg-surface)]"
                        onClick={onClose}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="relative h-12 w-16 shrink-0 overflow-hidden bg-[color:var(--bg-surface)] sm:h-14 sm:w-20"
                            style={{ borderRadius: "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))" }}
                          >
                            {thumbUrl ? (
                              <Image src={thumbUrl} alt={String(post?.title || "Thumbnail")} fill className="object-cover" sizes="64px" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-[10px] [color:var(--muted-text,var(--fg-muted))]">No Image</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className="search-modal-news-title line-clamp-2"
                              style={{
                                color: "var(--home-news-title-color, var(--fg-primary))",
                                fontWeight: "var(--home-news-title-weight, 600)",
                                fontFamily: "var(--home-news-title-font, var(--font-heading, sans-serif))",
                                fontSynthesis: "var(--home-news-title-synthesis, var(--font-heading-synthesis, none))",
                              }}
                            >
                              {post?.title}
                            </div>
                            <div
                              className="mt-1"
                              style={{
                                color: "var(--home-meta-color, var(--fg-secondary))",
                                fontSize: "var(--home-meta-size, 0.75rem)",
                                fontWeight: "var(--home-meta-weight, 500)",
                                lineHeight: "var(--home-meta-line-height, 1.4)",
                                fontFamily: "var(--home-meta-font, var(--font-body, sans-serif))",
                                fontSynthesis: "var(--home-meta-synthesis, var(--font-body-synthesis, none))",
                                fontSizeAdjust: "var(--font-body-size-adjust, none)",
                              }}
                            >
                              {metaParts.join(" • ")}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="px-3 py-3 text-sm [color:var(--muted-text,var(--fg-muted))]">
                  {suggestionsLoading ? "Memuat..." : searchValue.trim() ? "Tidak ada rekomendasi." : "Belum ada rekomendasi."}
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
