"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Wrench, Printer, Save, ExternalLink } from "lucide-react";
import { Image as ImageIcon } from "lucide-react";
import MediaLibraryModal from "@/app/admin/components/MediaLibraryModal";

type PrintSettings = {
  enabled: boolean;
  defaults: {
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
  header: {
    mode: "site" | "custom" | "image" | "none";
    customText: string;
    showLogo: boolean;
    customImageUrl: string;
  };
};

const formatPrintPathFromArticleUrl = (raw: string) => {
  const value = String(raw || "").trim();
  if (!value) return null;
  try {
    const u = new URL(value);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const categorySlug = parts[parts.length - 2];
    const postSlug = parts[parts.length - 1];
    if (!categorySlug || !postSlug) return null;
    return `/print/${encodeURIComponent(categorySlug)}/${encodeURIComponent(postSlug)}`;
  } catch {
    const parts = value.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    const categorySlug = parts[parts.length - 2];
    const postSlug = parts[parts.length - 1];
    if (!categorySlug || !postSlug) return null;
    return `/print/${encodeURIComponent(categorySlug)}/${encodeURIComponent(postSlug)}`;
  }
};

export default function AdminPrintToolsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [articleUrl, setArticleUrl] = useState("");
  const [settings, setSettings] = useState<PrintSettings | null>(null);
  const [openHeaderMedia, setOpenHeaderMedia] = useState(false);
  const [headerUploading, setHeaderUploading] = useState(false);
  const [headerImageError, setHeaderImageError] = useState<string | null>(null);

  const printPath = useMemo(() => formatPrintPathFromArticleUrl(articleUrl), [articleUrl]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/print-settings", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Gagal memuat pengaturan print");
        setSettings(null);
      } else {
        setSettings(json?.data || null);
      }
    } catch {
      setError("Gagal memuat pengaturan print");
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/print-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: settings }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Gagal menyimpan pengaturan print");
      } else {
        setSettings(json?.data || settings);
        setSuccess("Pengaturan print tersimpan");
      }
    } catch {
      setError("Gagal menyimpan pengaturan print");
    } finally {
      setSaving(false);
      window.setTimeout(() => setSuccess(null), 1600);
    }
  };

  const uploadHeaderImage = async (file: File) => {
    setHeaderImageError(null);
    setHeaderUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setHeaderImageError(String(data?.error || "Gagal upload gambar header"));
        return;
      }
      const fileUrl = String(data?.fileUrl || "");
      setSettings((prev) => {
        if (!prev) return prev;
        return { ...prev, header: { ...prev.header, mode: "image", customImageUrl: fileUrl } };
      });
    } catch {
      setHeaderImageError("Gagal upload gambar header");
    } finally {
      setHeaderUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen">
        <div className="text-[var(--fg-muted)]">Memuat...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen">
        <div className="card p-6">
          <div className="font-display text-lg font-bold text-[var(--fg-primary)] flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Print Artikel
          </div>
          <div className="mt-3 text-sm text-[var(--fg-muted)]">{error || "Tidak ada data."}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8">
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)] flex items-center gap-2">
              <Printer className="w-6 h-6 text-[var(--accent)]" />
              Print Artikel
            </h1>
            <p className="text-[var(--fg-secondary)] mt-1 font-medium">
              Buat tampilan print rapi seperti PrintFriendly, dengan pengaturan default yang bisa diubah.
            </p>
          </div>
          <button type="button" onClick={save} disabled={saving} className="btn btn-primary">
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>

        {(error || success) && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${
              error ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {error || success}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <div className="font-display text-lg font-bold text-[var(--fg-primary)]">Default Tampilan Print</div>
          <div className="text-sm text-[var(--fg-muted)] mt-1">Default ini dipakai saat halaman print dibuka.</div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <label className="flex items-center justify-between gap-3 p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)]">
              <div>
                <div className="text-sm font-bold text-[var(--fg-primary)]">Aktifkan Print Mode</div>
                <div className="text-xs text-[var(--fg-muted)]">Jika off, halaman print tetap bisa dibuka tapi kontrol disembunyikan.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings((prev) => (prev ? { ...prev, enabled: e.target.checked } : prev))}
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)]">
              <div>
                <div className="text-sm font-bold text-[var(--fg-primary)]">Tampilkan Gambar</div>
                <div className="text-xs text-[var(--fg-muted)]">Mengatur semua gambar di konten.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.defaults.showImages}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, defaults: { ...prev.defaults, showImages: e.target.checked } } : prev
                  )
                }
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)]">
              <div>
                <div className="text-sm font-bold text-[var(--fg-primary)]">Featured Image</div>
                <div className="text-xs text-[var(--fg-muted)]">Gambar utama di atas konten.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.defaults.showFeaturedImage}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, defaults: { ...prev.defaults, showFeaturedImage: e.target.checked } } : prev
                  )
                }
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)]">
              <div>
                <div className="text-sm font-bold text-[var(--fg-primary)]">Ringkasan (Excerpt)</div>
                <div className="text-xs text-[var(--fg-muted)]">Tampilkan ringkasan jika ada.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.defaults.showExcerpt}
                onChange={(e) =>
                  setSettings((prev) => (prev ? { ...prev, defaults: { ...prev.defaults, showExcerpt: e.target.checked } } : prev))
                }
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)]">
              <div>
                <div className="text-sm font-bold text-[var(--fg-primary)]">Penulis</div>
                <div className="text-xs text-[var(--fg-muted)]">Nama penulis artikel.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.defaults.showAuthor}
                onChange={(e) =>
                  setSettings((prev) => (prev ? { ...prev, defaults: { ...prev.defaults, showAuthor: e.target.checked } } : prev))
                }
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)]">
              <div>
                <div className="text-sm font-bold text-[var(--fg-primary)]">Editor</div>
                <div className="text-xs text-[var(--fg-muted)]">Nama editor yang publish.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.defaults.showEditor}
                onChange={(e) =>
                  setSettings((prev) => (prev ? { ...prev, defaults: { ...prev.defaults, showEditor: e.target.checked } } : prev))
                }
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)]">
              <div>
                <div className="text-sm font-bold text-[var(--fg-primary)]">Kategori</div>
                <div className="text-xs text-[var(--fg-muted)]">Nama kategori artikel.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.defaults.showCategory}
                onChange={(e) =>
                  setSettings((prev) => (prev ? { ...prev, defaults: { ...prev.defaults, showCategory: e.target.checked } } : prev))
                }
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)]">
              <div>
                <div className="text-sm font-bold text-[var(--fg-primary)]">Tag</div>
                <div className="text-xs text-[var(--fg-muted)]">Daftar tag (topik).</div>
              </div>
              <input
                type="checkbox"
                checked={settings.defaults.showTags}
                onChange={(e) =>
                  setSettings((prev) => (prev ? { ...prev, defaults: { ...prev.defaults, showTags: e.target.checked } } : prev))
                }
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)]">
              <div>
                <div className="text-sm font-bold text-[var(--fg-primary)]">Tanggal</div>
                <div className="text-xs text-[var(--fg-muted)]">Tanggal publish artikel.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.defaults.showDate}
                onChange={(e) =>
                  setSettings((prev) => (prev ? { ...prev, defaults: { ...prev.defaults, showDate: e.target.checked } } : prev))
                }
              />
            </label>

            <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)]">
              <div className="text-sm font-bold text-[var(--fg-primary)]">Custom Header (Paling Atas)</div>
              <div className="mt-3 grid gap-2">
                <select
                  className="input"
                  value={settings.header.mode}
                  onChange={(e) =>
                    setSettings((prev) => (prev ? { ...prev, header: { ...prev.header, mode: e.target.value as any } } : prev))
                  }
                >
                  <option value="site">Nama Situs</option>
                  <option value="custom">Custom</option>
                  <option value="image">Gambar Header</option>
                  <option value="none">Tidak ada</option>
                </select>
                {settings.header.mode === "custom" && (
                  <input
                    type="text"
                    className="input"
                    value={settings.header.customText}
                    onChange={(e) =>
                      setSettings((prev) => (prev ? { ...prev, header: { ...prev.header, customText: e.target.value } } : prev))
                    }
                    placeholder="Teks header"
                  />
                )}
                {settings.header.mode !== "image" && (
                  <button
                    type="button"
                    className="btn btn-ghost justify-center"
                    onClick={() => setSettings((prev) => (prev ? { ...prev, header: { ...prev.header, mode: "image" } } : prev))}
                  >
                    Atur Header Gambar
                  </button>
                )}
                {settings.header.mode === "image" && (
                  <div className="pt-2">
                    <div className="flex items-start gap-4">
                      {settings.header.customImageUrl ? (
                        <div className="relative group">
                          <div className="w-64 h-20 border rounded-lg bg-[var(--bg-base)] overflow-hidden flex items-center justify-center">
                            <Image
                              src={settings.header.customImageUrl}
                              alt="Header Print"
                              width={512}
                              height={160}
                              className="object-contain max-h-full"
                              unoptimized
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                            <button
                              type="button"
                              onClick={() => setOpenHeaderMedia(true)}
                              className="text-white text-xs font-bold bg-[var(--accent)] px-3 py-1.5 rounded hover:bg-[var(--accent-hover)]"
                            >
                              Ganti Header
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOpenHeaderMedia(true)}
                          className="w-64 h-20 border-2 border-dashed border-[var(--border)] rounded-lg flex flex-col items-center justify-center text-[var(--fg-muted)] hover:bg-[var(--bg-base)] transition"
                        >
                          <ImageIcon size={20} className="mb-1" />
                          <span className="text-xs font-medium">Pilih Gambar</span>
                        </button>
                      )}

                      {settings.header.customImageUrl && (
                        <button
                          type="button"
                          onClick={() => setSettings((prev) => (prev ? { ...prev, header: { ...prev.header, customImageUrl: "" } } : prev))}
                          className="text-red-500 text-sm hover:underline mt-2"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className={`btn btn-ghost ${headerUploading ? "opacity-60 pointer-events-none" : ""}`}>
                        {headerUploading ? "Mengupload..." : "Upload Gambar"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file) return;
                            uploadHeaderImage(file);
                          }}
                        />
                      </label>
                      <button type="button" className="btn btn-ghost" onClick={() => setOpenHeaderMedia(true)}>
                        Pilih dari Media
                      </button>
                    </div>
                    {headerImageError && <div className="mt-2 text-xs font-semibold text-red-600">{headerImageError}</div>}
                    <p className="text-xs text-[var(--fg-muted)] mt-2">Rekomendasi: PNG/JPG/WEBP, tinggi ±80–140px.</p>
                  </div>
                )}

                {settings.header.mode !== "image" && (
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[var(--fg-muted)]">Tampilkan logo (jika ada)</span>
                    <input
                      type="checkbox"
                      checked={settings.header.showLogo}
                      onChange={(e) =>
                        setSettings((prev) => (prev ? { ...prev, header: { ...prev.header, showLogo: e.target.checked } } : prev))
                      }
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)]">
              <div className="text-sm font-bold text-[var(--fg-primary)]">Tipografi</div>
              <div className="mt-3 grid gap-2">
                <input
                  type="text"
                  className="input"
                  value={settings.defaults.fontFamily}
                  onChange={(e) =>
                    setSettings((prev) => (prev ? { ...prev, defaults: { ...prev.defaults, fontFamily: e.target.value } } : prev))
                  }
                  placeholder="Font family (CSS)"
                />
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]">
                  <div className="text-xs font-black text-[var(--fg-primary)] mb-2">Ukuran Judul Artikel</div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <input
                      type="number"
                      className="input"
                      value={settings.defaults.titleFontSizePx}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev ? { ...prev, defaults: { ...prev.defaults, titleFontSizePx: Number(e.target.value || 28) } } : prev
                        )
                      }
                      min={18}
                      max={44}
                    />
                    <div className="text-xs text-[var(--fg-muted)]">px</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    className="input"
                    value={settings.defaults.fontSizePx}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev ? { ...prev, defaults: { ...prev.defaults, fontSizePx: Number(e.target.value || 16) } } : prev
                      )
                    }
                    min={12}
                    max={26}
                  />
                  <input
                    type="number"
                    step="0.05"
                    className="input"
                    value={settings.defaults.lineHeight}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev ? { ...prev, defaults: { ...prev.defaults, lineHeight: Number(e.target.value || 1.6) } } : prev
                      )
                    }
                    min={1.2}
                    max={2.2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    className="input"
                    value={settings.defaults.contentWidthPx}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev ? { ...prev, defaults: { ...prev.defaults, contentWidthPx: Number(e.target.value || 820) } } : prev
                      )
                    }
                    min={560}
                    max={1040}
                  />
                  <input
                    type="number"
                    className="input"
                    value={settings.defaults.pageMarginMm}
                    onChange={(e) =>
                      setSettings((prev) =>
                        prev ? { ...prev, defaults: { ...prev.defaults, pageMarginMm: Number(e.target.value || 12) } } : prev
                      )
                    }
                    min={6}
                    max={25}
                  />
                </div>

                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]">
                  <div className="text-xs font-black text-[var(--fg-primary)] mb-2">Ukuran Featured Image</div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <input
                      type="number"
                      className="input"
                      value={settings.defaults.featuredImageMaxHeightPx}
                      onChange={(e) =>
                        setSettings((prev) =>
                          prev
                            ? {
                                ...prev,
                                defaults: {
                                  ...prev.defaults,
                                  featuredImageMaxHeightPx: Number(e.target.value || 360),
                                },
                              }
                            : prev
                        )
                      }
                      min={180}
                      max={720}
                    />
                    <div className="text-xs text-[var(--fg-muted)]">Max height (px)</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="font-display text-lg font-bold text-[var(--fg-primary)]">Coba Print</div>
          <div className="text-sm text-[var(--fg-muted)] mt-1">Tempel URL artikel, lalu buka halaman print.</div>

          <div className="mt-4 space-y-3">
            <input
              type="text"
              className="input w-full"
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="Contoh: https://domain.com/berita/slug-artikel"
            />
            <a
              href={printPath || "#"}
              target="_blank"
              rel="noreferrer"
              className={`btn btn-ghost w-full justify-center ${!printPath ? "opacity-50 pointer-events-none" : ""}`}
            >
              <ExternalLink className="w-4 h-4" />
              Buka Print View
            </a>
            {printPath && (
              <div className="text-xs text-[var(--fg-muted)] break-all">
                Path: <span className="font-mono">{printPath}</span>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
            <div className="text-sm font-bold text-[var(--fg-primary)]">Cara pakai cepat</div>
            <ul className="mt-2 text-xs text-[var(--fg-muted)] space-y-1">
              <li>1) Buka artikel publik</li>
              <li>2) Klik tombol Print (jika tersedia) atau buka URL /print/kategori/slug</li>
              <li>3) Sesuaikan tampilan lalu klik Print</li>
            </ul>
          </div>
        </div>
      </div>

      {openHeaderMedia && settings && (
        <MediaLibraryModal
          onSelect={(media: any) => {
            setSettings({
              ...settings,
              header: {
                ...settings.header,
                mode: "image",
                customImageUrl: String(media?.fileUrl || ""),
              },
            });
            setOpenHeaderMedia(false);
          }}
          onClose={() => setOpenHeaderMedia(false)}
          selectedId={undefined}
          selectedUrl={settings.header.customImageUrl}
        />
      )}
    </div>
  );
}
