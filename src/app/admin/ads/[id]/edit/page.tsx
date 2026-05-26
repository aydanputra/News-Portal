
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Image as ImageIcon, X, Code, Link as LinkIcon, Megaphone, Upload } from "lucide-react";

interface Media {
  id: string;
  fileUrl: string;
  fileName: string;
}

interface TargetOption {
  slug: string;
  name: string;
}

const TARGET_PAGE_TYPES = [
  { value: "HOME", label: "Beranda" },
  { value: "CATEGORY_ARCHIVE", label: "Arsip Kategori" },
  { value: "TAG_ARCHIVE", label: "Arsip Tag" },
  { value: "STATIC_PAGE", label: "Halaman Statis" },
  { value: "POST_DETAIL", label: "Detail Berita" },
];

export default function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<"IMAGE" | "SCRIPT">("IMAGE");
  const [position, setPosition] = useState("HEADER");
  const [linkUrl, setLinkUrl] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetPageTypes, setTargetPageTypes] = useState<string[]>([]);
  const [targetCategorySlugs, setTargetCategorySlugs] = useState<string[]>([]);
  const [targetTagSlugs, setTargetTagSlugs] = useState<string[]>([]);
  const [targetPageSlugs, setTargetPageSlugs] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<TargetOption[]>([]);
  const [tagOptions, setTagOptions] = useState<TargetOption[]>([]);
  const [pageOptions, setPageOptions] = useState<TargetOption[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [pageSearch, setPageSearch] = useState("");

  // Media State
  const [mediaId, setMediaId] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch Data Iklan
  useEffect(() => {
    fetch(`/api/ads`) 
      .then(res => res.json())
      .then(data => {
        // Fallback: Find in array
        const ad = data.find((a: any) => a.id === id);
        if (ad) {
            setName(ad.name);
            setType(ad.type);
            setPosition(ad.position);
            setLinkUrl(ad.linkUrl || "");
            setScriptCode(ad.scriptCode || "");
            setIsActive(ad.isActive);
            setStartDate(ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : "");
            setEndDate(ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : "");
            setTargetPageTypes(Array.isArray(ad.targetPageTypes) ? ad.targetPageTypes : []);
            setTargetCategorySlugs(Array.isArray(ad.targetCategorySlugs) ? ad.targetCategorySlugs : []);
            setTargetTagSlugs(Array.isArray(ad.targetTagSlugs) ? ad.targetTagSlugs : []);
            setTargetPageSlugs(Array.isArray(ad.targetPageSlugs) ? ad.targetPageSlugs : []);
            if (ad.media) {
                setMediaId(ad.mediaId);
                setPreviewImage(ad.media.fileUrl);
            }
        }
        setFetching(false);
      });
  }, [id]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoriesRes, tagsRes, pagesRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/tags"),
          fetch("/api/pages"),
        ]);
        const [categoriesData, tagsData, pagesData] = await Promise.all([
          categoriesRes.json(),
          tagsRes.json(),
          pagesRes.json(),
        ]);

        if (Array.isArray(categoriesData)) {
          setCategoryOptions(
            categoriesData
              .filter((item) => item?.slug && item?.name)
              .map((item) => ({ slug: String(item.slug), name: String(item.name) }))
          );
        }

        if (Array.isArray(tagsData)) {
          setTagOptions(
            tagsData
              .filter((item) => item?.slug && item?.name)
              .map((item) => ({ slug: String(item.slug), name: String(item.name) }))
          );
        }

        if (Array.isArray(pagesData)) {
          setPageOptions(
            pagesData
              .filter((item) => item?.slug && item?.title)
              .map((item) => ({ slug: String(item.slug), name: String(item.title) }))
          );
        }
      } catch {
        setCategoryOptions([]);
        setTagOptions([]);
        setPageOptions([]);
      }
    };

    loadOptions();
  }, []);

  const togglePageType = (pageType: string) => {
    setTargetPageTypes((prev) =>
      prev.includes(pageType) ? prev.filter((item) => item !== pageType) : [...prev, pageType]
    );
  };

  const resetTargeting = () => {
    setTargetPageTypes([]);
    setTargetCategorySlugs([]);
    setTargetTagSlugs([]);
    setTargetPageSlugs([]);
    setCategorySearch("");
    setTagSearch("");
    setPageSearch("");
  };

  async function fetchMedia() {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setMediaList(data.data || []);
    } catch {
      console.error("Gagal memuat media");
    }
  }

  function handleSelectMedia(media: Media) {
    setMediaId(media.id);
    setPreviewImage(media.fileUrl);
    setShowMediaModal(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        // Langsung pilih gambar yang baru diupload
        setMediaId(data.id);
        setPreviewImage(data.fileUrl);
        setShowMediaModal(false);
        fetchMedia(); // Refresh list untuk penggunaan berikutnya
        alert("Gambar berhasil diupload & dipilih");
      } else {
        alert("Gagal upload: " + data.error);
      }
    } catch {
      alert("Error saat upload");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/ads/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          type,
          position,
          linkUrl: type === "IMAGE" ? linkUrl : null,
          scriptCode: type === "SCRIPT" ? scriptCode : null,
          mediaId: type === "IMAGE" ? mediaId : null,
          isActive,
          startDate: startDate || null,
          endDate: endDate || null,
          targetPageTypes,
          targetCategorySlugs,
          targetTagSlugs,
          targetPageSlugs,
        }),
      });

      if (res.ok) {
        alert("Iklan berhasil diupdate!");
        router.push("/admin/ads");
      } else {
        const err = await res.json();
        alert("Gagal: " + err.error);
      }
    } catch {
      alert("Error jaringan");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen max-w-[1600px] mx-auto">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 text-sm text-[var(--fg-secondary)]">
          Memuat data iklan...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)] flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-[var(--fg-secondary)]" />
          Edit Iklan
        </h1>
        <p className="text-[var(--fg-secondary)] text-sm mt-1">Perbarui konten iklan agar tetap selaras dengan tema dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--bg-surface)] p-5 md:p-6 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1.5">Nama Iklan</label>
            <input
              type="text"
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg h-10 px-3 text-sm outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
              placeholder="Contoh: Banner Promo Januari"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1.5">Posisi</label>
            <select
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg h-10 px-3 text-sm outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            >
              <option value="HEADER">Header (Atas)</option>
              <option value="SIDEBAR">Sidebar (Samping)</option>
              <option value="ARTICLE_TOP">Artikel (Atas Konten)</option>
              <option value="ARTICLE_MIDDLE">Artikel (Tengah Konten)</option>
              <option value="ARTICLE_INLINE_1">Inline Artikel 1</option>
              <option value="ARTICLE_INLINE_2">Inline Artikel 2</option>
              <option value="ARTICLE_INLINE_3">Inline Artikel 3</option>
              <option value="FOOTER">Footer (Bawah)</option>
            </select>
          </div>
        </div>

        <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-4">
          <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Tipe Iklan</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType("IMAGE")}
              className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 hover:-translate-y-0.5 ${
                type === "IMAGE"
                  ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] shadow-sm"
                  : "border-[var(--border)] text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] hover:border-[var(--accent)]/40"
              }`}
            >
              <ImageIcon size={22} className="mb-2" />
              <span className="font-semibold text-sm">Gambar / Banner</span>
            </button>
            <button
              type="button"
              onClick={() => setType("SCRIPT")}
              className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 hover:-translate-y-0.5 ${
                type === "SCRIPT"
                  ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)] shadow-sm"
                  : "border-[var(--border)] text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] hover:border-[var(--accent)]/40"
              }`}
            >
              <Code size={22} className="mb-2" />
              <span className="font-semibold text-sm">Script (Google AdSense)</span>
            </button>
          </div>
        </div>

        <div key={type} style={{ animation: "adsTypeSwitchIn 220ms ease-out" }}>
        {type === "IMAGE" ? (
          <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-4 space-y-4">
            <div>
              <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Banner Iklan</label>
              {previewImage ? (
                <div className="space-y-3">
                  <div className="relative w-full h-56 bg-[var(--bg-elevated)] rounded-lg overflow-hidden border border-[var(--border)] group">
                    <Image src={previewImage} alt="Preview Iklan" fill unoptimized className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setMediaId("");
                        setPreviewImage("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMediaModal(true);
                      fetchMedia();
                    }}
                    className="btn btn-secondary text-sm"
                  >
                    Ganti Gambar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaModal(true);
                    fetchMedia();
                  }}
                  className="w-full h-36 border-2 border-dashed border-[var(--border)] rounded-lg flex flex-col items-center justify-center text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] hover:border-[var(--accent)] transition"
                >
                  <ImageIcon size={30} className="mb-2" />
                  <span className="font-medium">Pilih dari Pustaka Media</span>
                </button>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1.5">Link URL (Opsional)</label>
              <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--bg-elevated)]">
                <div className="px-3 py-2 border-r border-[var(--border)] text-[var(--fg-secondary)]">
                  <LinkIcon size={15} />
                </div>
                <input
                  type="url"
                  className="w-full h-10 px-3 bg-transparent outline-none text-sm text-[var(--fg-primary)]"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-4">
            <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1.5">Kode Script (HTML/JS)</label>
            <textarea
              className="w-full border border-[var(--border)] rounded-lg h-52 p-3 font-mono text-sm bg-[var(--bg-elevated)] text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
              placeholder="<script>...</script>"
              value={scriptCode}
              onChange={(e) => setScriptCode(e.target.value)}
              required
            />
            <p className="text-[11px] text-[var(--fg-secondary)] mt-1.5">Pastikan kode script aman dan valid.</p>
          </div>
        )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-4">
            <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Status</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span className="text-sm text-[var(--fg-primary)]">Aktifkan Iklan Ini</span>
            </label>
          </div>

          <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-4">
            <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Jadwal Tayang (Opsional)</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-[var(--fg-secondary)]">Mulai</span>
                <input
                  type="date"
                  className="w-full mt-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg h-10 px-3 text-sm outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <span className="text-[11px] text-[var(--fg-secondary)]">Selesai</span>
                <input
                  type="date"
                  className="w-full mt-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg h-10 px-3 text-sm outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="text-xs font-bold text-[var(--fg-primary)]">Kondisi Tayang Spesifik (Opsional)</h3>
            <button type="button" onClick={resetTargeting} className="btn btn-secondary text-xs px-3 py-1.5">
              Reset
            </button>
          </div>
          <p className="text-xs text-[var(--fg-secondary)] mb-3">
            Jika tidak diatur, iklan bisa tampil di semua halaman sesuai posisi. Jika diatur, iklan hanya tampil pada konteks yang dipilih.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Tipe Halaman</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {TARGET_PAGE_TYPES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => togglePageType(item.value)}
                    className={`text-sm border rounded-lg px-3 py-2 text-left transition ${
                      targetPageTypes.includes(item.value)
                        ? "bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)]"
                        : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--fg-primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1">Kategori</label>
                <input
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full h-10 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 text-sm outline-none text-[var(--fg-primary)] focus:border-[var(--accent)] mb-2"
                  placeholder="Cari kategori..."
                />
                <select
                  multiple
                  className="w-full h-28 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--fg-primary)]"
                  value={targetCategorySlugs}
                  onChange={(e) =>
                    setTargetCategorySlugs(Array.from(e.target.selectedOptions, (opt) => opt.value))
                  }
                >
                  {categoryOptions
                    .filter((item) => {
                      const q = categorySearch.trim().toLowerCase();
                      if (!q) return true;
                      if (targetCategorySlugs.includes(item.slug)) return true;
                      return item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q);
                    })
                    .map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1">Tag</label>
                <input
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="w-full h-10 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 text-sm outline-none text-[var(--fg-primary)] focus:border-[var(--accent)] mb-2"
                  placeholder="Cari tag..."
                />
                <select
                  multiple
                  className="w-full h-28 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--fg-primary)]"
                  value={targetTagSlugs}
                  onChange={(e) => setTargetTagSlugs(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                >
                  {tagOptions
                    .filter((item) => {
                      const q = tagSearch.trim().toLowerCase();
                      if (!q) return true;
                      if (targetTagSlugs.includes(item.slug)) return true;
                      return item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q);
                    })
                    .map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1">Halaman Statis</label>
                <input
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  className="w-full h-10 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 text-sm outline-none text-[var(--fg-primary)] focus:border-[var(--accent)] mb-2"
                  placeholder="Cari halaman..."
                />
                <select
                  multiple
                  className="w-full h-28 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-sm outline-none text-[var(--fg-primary)]"
                  value={targetPageSlugs}
                  onChange={(e) => setTargetPageSlugs(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                >
                  {pageOptions
                    .filter((item) => {
                      const q = pageSearch.trim().toLowerCase();
                      if (!q) return true;
                      if (targetPageSlugs.includes(item.slug)) return true;
                      return item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q);
                    })
                    .map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border)]">
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary disabled:opacity-60">
            {loading ? "Menyimpan..." : "Update Iklan"}
          </button>
        </div>
      </form>

      {showMediaModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-surface)] rounded-xl shadow-2xl max-w-5xl w-full max-h-[84vh] flex flex-col overflow-hidden border border-[var(--border)]">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-base)]">
              <h3 className="font-bold text-base text-[var(--fg-primary)]">Pilih Gambar Iklan</h3>
              <button onClick={() => setShowMediaModal(false)} className="text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]">
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-[var(--border)]">
              <button
                onClick={() => setActiveTab("library")}
                className={`flex-1 py-3 text-sm font-semibold transition ${
                  activeTab === "library"
                    ? "text-[var(--accent)] bg-[var(--accent-subtle)] border-b-2 border-[var(--accent)]"
                    : "text-[var(--fg-secondary)] bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                Pustaka Media
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 py-3 text-sm font-semibold transition ${
                  activeTab === "upload"
                    ? "text-[var(--accent)] bg-[var(--accent-subtle)] border-b-2 border-[var(--accent)]"
                    : "text-[var(--fg-secondary)] bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)]"
                }`}
              >
                Upload Baru
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[var(--bg-base)]">
              {activeTab === "library" ? (
                mediaList.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {mediaList.map((media) => (
                      <div
                        key={media.id}
                        onClick={() => handleSelectMedia(media)}
                        className="aspect-square bg-[var(--bg-elevated)] rounded-lg cursor-pointer relative hover:ring-2 hover:ring-[var(--accent)] overflow-hidden border border-[var(--border)]"
                      >
                        <Image src={media.fileUrl} alt={media.fileName} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-52 flex items-center justify-center text-sm text-[var(--fg-secondary)] border border-dashed border-[var(--border)] rounded-xl">
                    Belum ada media tersedia.
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--border)] rounded-lg bg-[var(--bg-surface)]">
                  {uploading ? (
                    <div className="text-center">
                      <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-[var(--fg-secondary)] font-medium">Mengupload gambar...</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-[var(--accent-subtle)] p-4 rounded-full mb-3">
                        <Upload size={28} className="text-[var(--accent)]" />
                      </div>
                      <h4 className="text-base font-semibold text-[var(--fg-primary)] mb-1">Upload Gambar Baru</h4>
                      <p className="text-[var(--fg-secondary)] text-sm mb-5">Pilih file gambar untuk banner iklan</p>
                      <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="modal-upload" />
                      <label htmlFor="modal-upload" className="btn btn-primary cursor-pointer">
                        Pilih File
                      </label>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes adsTypeSwitchIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
