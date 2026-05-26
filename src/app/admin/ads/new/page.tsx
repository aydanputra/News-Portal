
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Image as ImageIcon, X, Check, Code, Link as LinkIcon, Calendar, Megaphone, Upload } from "lucide-react";

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

export default function NewAdPage() {
  const router = useRouter();
  
  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<"IMAGE" | "SCRIPT">("IMAGE");
  const [position, setPosition] = useState("HEADER");
  const [customPosition, setCustomPosition] = useState("");
  const [isCustomPosition, setIsCustomPosition] = useState(false);

  // Predefined positions
  const PREDEFINED_POSITIONS = [
    { value: "HEADER", label: "Header (Atas)" },
    { value: "SIDEBAR", label: "Sidebar (Samping)" },
    { value: "ARTICLE_TOP", label: "Artikel (Atas Konten)" },
    { value: "ARTICLE_MIDDLE", label: "Artikel (Tengah Konten)" },
    { value: "ARTICLE_INLINE_1", label: "Inline Artikel 1" },
    { value: "ARTICLE_INLINE_2", label: "Inline Artikel 2" },
    { value: "ARTICLE_INLINE_3", label: "Inline Artikel 3" },
    { value: "FOOTER", label: "Footer (Bawah)" },
  ];

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

    const finalPosition = isCustomPosition ? customPosition : position;

    try {
      const res = await fetch("/api/ads", {
        method: "POST",
        body: JSON.stringify({
          name,
          type,
          position: finalPosition,
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
        alert("Iklan berhasil dibuat!");
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

  return (
    <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)] flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-[var(--fg-secondary)]" />
          Buat Iklan Baru
        </h1>
        <p className="text-[var(--fg-secondary)] text-sm mt-1">Pasang banner promosi atau kode iklan eksternal (AdSense) dengan tampilan yang rapi.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--bg-surface)] p-5 md:p-6 rounded-xl border border-[var(--border)] shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        <div className="bg-[var(--bg-base)] p-4 rounded-xl border border-[var(--border)] h-full flex flex-col xl:min-h-[430px]">
          <h2 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center text-xs">1</span>
            Informasi Utama
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 content-start">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1.5">Nama Kampanye Iklan</label>
              <input
                type="text"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg h-10 px-3 text-sm outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                placeholder="Contoh: Promo Ramadhan 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1.5">Tipe Iklan</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("IMAGE")}
                  className={`py-2.5 px-3 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 hover:-translate-y-0.5 ${
                    type === "IMAGE"
                      ? "bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] shadow-sm"
                      : "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--fg-secondary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  <ImageIcon size={16} />
                  <span className="font-medium">Gambar / Banner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType("SCRIPT")}
                  className={`py-2.5 px-3 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30 hover:-translate-y-0.5 ${
                    type === "SCRIPT"
                      ? "bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)] shadow-sm"
                      : "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--fg-secondary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent)]/40"
                  }`}
                >
                  <Code size={16} />
                  <span className="font-medium">Script (Google AdSense)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1.5">Status</label>
              <label className="flex items-center gap-2 cursor-pointer h-10">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <span className="text-sm text-[var(--fg-primary)]">{isActive ? "Tayang (Aktif)" : "Disembunyikan (Draft)"}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-base)] p-4 rounded-xl border border-[var(--border)] h-full flex flex-col xl:min-h-[430px]">
          <h2 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center text-xs">2</span>
            Konten Iklan
          </h2>

          <div key={type} style={{ animation: "adsTypeSwitchIn 220ms ease-out" }}>
          {type === "IMAGE" ? (
            <div className="space-y-4 flex-1">
              <div>
                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Upload Banner</label>
                {!previewImage ? (
                  <div
                    onClick={() => {
                      setShowMediaModal(true);
                      fetchMedia();
                    }}
                    className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 h-64 text-center cursor-pointer hover:bg-[var(--bg-elevated)] transition group flex flex-col justify-center"
                  >
                    <div className="bg-[var(--accent-subtle)] text-[var(--accent)] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                      <Upload size={20} />
                    </div>
                    <p className="text-sm font-medium text-[var(--fg-primary)]">Klik untuk pilih gambar</p>
                    <p className="text-xs text-[var(--fg-secondary)] mt-1">Mendukung JPG, PNG, WEBP</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative w-full h-64 bg-[var(--bg-elevated)] rounded-xl overflow-hidden border border-[var(--border)]">
                      <Image src={previewImage} alt="Preview" fill className="object-contain" />
                      <button
                        type="button"
                        onClick={() => {
                          setMediaId("");
                          setPreviewImage("");
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Terpilih</div>
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
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1.5">Link URL (Opsional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--fg-secondary)]">
                    <LinkIcon size={16} />
                  </div>
                  <input
                    type="url"
                    className="w-full pl-10 h-10 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-sm outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                    placeholder="https://website-tujuan.com/promo"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="min-h-[320px] flex flex-col">
              <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1.5">Kode Script (HTML/JS)</label>
              <textarea
                className="w-full h-64 border border-[var(--border)] p-3 rounded-lg outline-none font-mono text-sm bg-[var(--bg-elevated)] text-[var(--fg-primary)] focus:border-[var(--accent)] resize-none"
                placeholder={'<script async src="..."></script>'}
                value={scriptCode}
                onChange={(e) => setScriptCode(e.target.value)}
              ></textarea>
              <p className="text-xs text-[var(--fg-secondary)] mt-2">Pastikan kode yang Anda masukkan aman dan valid.</p>
            </div>
          )}
          </div>
        </div>

        <div className="bg-[var(--bg-base)] p-4 rounded-xl border border-[var(--border)] xl:col-span-2">
          <h2 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--accent-subtle)] text-[var(--accent)] flex items-center justify-center text-xs">3</span>
            Posisi & Penjadwalan
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Di mana iklan ini muncul?</label>
              {!isCustomPosition ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {PREDEFINED_POSITIONS.map((pos) => (
                    <div
                      key={pos.value}
                      onClick={() => setPosition(pos.value)}
                      className={`cursor-pointer border p-3 rounded-lg text-sm flex items-center gap-2 transition ${
                        position === pos.value
                          ? "bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent)]"
                          : "hover:bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--fg-primary)]"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${position === pos.value ? "border-[var(--accent)]" : "border-[var(--fg-secondary)]"}`}>
                        {position === pos.value && <div className="w-2 h-2 bg-[var(--accent)] rounded-full"></div>}
                      </div>
                      <span>{pos.label}</span>
                    </div>
                  ))}
                  <div
                    onClick={() => setIsCustomPosition(true)}
                    className="cursor-pointer border border-dashed border-[var(--border)] p-3 rounded-lg text-sm flex items-center justify-center text-[var(--fg-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--accent)] transition"
                  >
                    + Posisi Custom
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--accent-subtle)] p-4 rounded-lg border border-[var(--border)]">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[var(--fg-primary)]">Nama Posisi Custom</label>
                    <button type="button" onClick={() => setIsCustomPosition(false)} className="text-xs text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] underline">
                      Kembali ke Pilihan Standar
                    </button>
                  </div>
                  <input
                    type="text"
                    className="w-full h-10 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 text-sm outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                    placeholder="Contoh: HOMEPAGE_1, SPECIAL_EVENT"
                    value={customPosition}
                    onChange={(e) => setCustomPosition(e.target.value.toUpperCase())}
                  />
                  <p className="text-xs text-[var(--fg-secondary)] mt-2">
                    Gunakan kode <code>[iklan:{customPosition || "NAMA"}]</code> di artikel, atau masukkan kode <code>{customPosition || "NAMA"}</code> di Homepage Builder.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1">Mulai Tayang (Opsional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--fg-secondary)]">
                    <Calendar size={16} />
                  </div>
                  <input
                    type="date"
                    className="w-full pl-10 h-10 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg outline-none text-sm text-[var(--fg-primary)] focus:border-[var(--accent)]"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--fg-primary)] block mb-1">Selesai Tayang (Opsional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--fg-secondary)]">
                    <Calendar size={16} />
                  </div>
                  <input
                    type="date"
                    className="w-full pl-10 h-10 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg outline-none text-sm text-[var(--fg-primary)] focus:border-[var(--accent)]"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
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
                          return (
                            item.name.toLowerCase().includes(q) ||
                            item.slug.toLowerCase().includes(q)
                          );
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
                          return (
                            item.name.toLowerCase().includes(q) ||
                            item.slug.toLowerCase().includes(q)
                          );
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
                          return (
                            item.name.toLowerCase().includes(q) ||
                            item.slug.toLowerCase().includes(q)
                          );
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
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)] xl:col-span-2">
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">
            Batal
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary flex items-center gap-2 disabled:opacity-60">
            {loading ? "Menyimpan..." : (
              <>
                <Check size={18} />
                Simpan Iklan
              </>
            )}
          </button>
        </div>
        </div>
      </form>

      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[var(--bg-surface)] rounded-2xl w-full max-w-5xl max-h-[84vh] flex flex-col shadow-2xl border border-[var(--border)]">
            <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-base)]">
              <h3 className="text-base font-bold text-[var(--fg-primary)]">Pilih Media</h3>
              <button onClick={() => setShowMediaModal(false)} className="text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]">
                <X size={22} />
              </button>
            </div>

            <div className="flex border-b border-[var(--border)]">
              <button
                onClick={() => setActiveTab("library")}
                className={`flex-1 py-3 font-semibold text-sm transition ${
                  activeTab === "library"
                    ? "text-[var(--accent)] border-b-2 border-[var(--accent)] bg-[var(--accent-subtle)]"
                    : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] bg-[var(--bg-base)]"
                }`}
              >
                Galeri Saya
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 py-3 font-semibold text-sm transition ${
                  activeTab === "upload"
                    ? "text-[var(--accent)] border-b-2 border-[var(--accent)] bg-[var(--accent-subtle)]"
                    : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] bg-[var(--bg-base)]"
                }`}
              >
                Upload Baru
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-base)]">
              {activeTab === "library" ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaList.map((media) => (
                    <div
                      key={media.id}
                      onClick={() => handleSelectMedia(media)}
                      className="aspect-square relative rounded-lg overflow-hidden cursor-pointer border border-[var(--border)] hover:ring-2 hover:ring-[var(--accent)] group bg-[var(--bg-surface)]"
                    >
                      <Image src={media.fileUrl} alt={media.fileName} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                    </div>
                  ))}
                  {mediaList.length === 0 && (
                    <div className="col-span-full text-center py-10 text-[var(--fg-secondary)]">Belum ada gambar. Silakan upload dulu.</div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--border)] rounded-xl bg-[var(--bg-surface)]">
                  {uploading ? (
                    <p className="text-[var(--accent)] font-medium animate-pulse">Sedang mengupload...</p>
                  ) : (
                    <>
                      <Upload size={44} className="text-[var(--fg-secondary)] mb-4" />
                      <label className="btn btn-primary cursor-pointer">
                        Pilih File dari Komputer
                        <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                      </label>
                      <p className="text-xs text-[var(--fg-secondary)] mt-2">Maksimal 2MB (JPG, PNG)</p>
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
