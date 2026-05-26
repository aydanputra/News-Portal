
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Upload, Trash2, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface Media {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  size: number;
  _count?: { posts: number };
}

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type MediaTypeFilter = "all" | "image" | "document" | "pdf";

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, totalPages: 1 });

  const [type, setType] = useState<MediaTypeFilter>("all");
  const [month, setMonth] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [debouncedQ, setDebouncedQ] = useState<string>("");

  const [pageInput, setPageInput] = useState<string>("1");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activePicker, setActivePicker] = useState<null | "type" | "month">(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
    setPageInput("1");
    return () => clearTimeout(t);
  }, [q]);

  const fetchMedia = useCallback(
    async (
      overrides?: Partial<{
        page: number;
        limit: number;
        append: boolean;
      }>
    ) => {
      const append = overrides?.append ?? false;
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);
        const page = overrides?.page ?? pagination.page;
        const limit = overrides?.limit ?? pagination.limit;

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (type !== "all") params.set("type", type);
        if (month) params.set("month", month);
        if (debouncedQ) params.set("q", debouncedQ);

        const res = await fetch(`/api/media?${params.toString()}`);
        const data = await res.json();
        setMediaList((prev) => (append ? [...prev, ...(data.data || [])] : data.data || []));
        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            page: data.pagination.page ?? prev.page,
            limit: data.pagination.limit ?? prev.limit,
            total: data.pagination.total ?? prev.total,
            totalPages: data.pagination.totalPages ?? prev.totalPages,
          }));
          setPageInput(String(data.pagination.page ?? page));
        } else {
          setPageInput(String(page));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [debouncedQ, month, pagination.limit, pagination.page, type]
  );

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  function monthOptions() {
    const fmt = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" });
    const options: { value: string; label: string }[] = [];
    const base = new Date();
    base.setDate(1);
    for (let i = 0; i < 24; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      options.push({ value: `${y}-${m}`, label: fmt.format(d) });
    }
    return options;
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
        setToast({ message: "Gambar berhasil diupload", type: "success" });
        setPagination((prev) => ({ ...prev, page: 1 }));
        setPageInput("1");
        fetchMedia({ page: 1 });
      } else {
        setToast({ message: data.error, type: "error" });
      }
    } catch {
      setToast({ message: "Gagal upload", type: "error" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin hapus gambar ini?")) return;

    try {
      const res = await fetch(`/api/media?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        setToast({ message: "Gambar dihapus", type: "success" });
        setSelectedMedia(null);
        const isAccumulated = mediaList.length > pagination.limit && pagination.page > 1;
        if (isAccumulated) {
          setPagination((prev) => ({ ...prev, page: 1 }));
          setPageInput("1");
          fetchMedia({ page: 1 });
          return;
        }
        if (mediaList.length === 1 && pagination.page > 1) {
          const prevPage = pagination.page - 1;
          setPagination((prev) => ({ ...prev, page: prevPage }));
          setPageInput(String(prevPage));
          fetchMedia({ page: prevPage });
        } else {
          fetchMedia();
        }
      } else {
        setToast({ message: data.error, type: "error" });
      }
    } catch {
      setToast({ message: "Gagal menghapus", type: "error" });
    }
  }

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  const isAccumulated = mediaList.length > pagination.limit && pagination.page > 1;
  const startIndex = pagination.total === 0 ? 0 : isAccumulated ? 1 : (pagination.page - 1) * pagination.limit + 1;
  const endIndex = pagination.total === 0 ? 0 : isAccumulated ? mediaList.length : (pagination.page - 1) * pagination.limit + mediaList.length;
  const filterFieldClass =
    "h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--fg-primary)] text-sm focus:outline-none focus:border-[var(--accent)]";
  const mobileFieldClass =
    "h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-[var(--fg-primary)] text-base focus:outline-none focus:border-[var(--accent)]";

  const typeOptions: { value: MediaTypeFilter; label: string }[] = [
    { value: "all", label: "Semua Media" },
    { value: "image", label: "Gambar" },
    { value: "pdf", label: "PDF" },
    { value: "document", label: "Dokumen (non-gambar)" },
  ];
  const monthOptionsList = monthOptions();
  const monthLabel = month ? monthOptionsList.find((m) => m.value === month)?.label || month : "Semua Tanggal";
  const typeLabel = typeOptions.find((t) => t.value === type)?.label || "Semua Media";

  return (
    <div className="p-4 md:p-8 bg-[var(--bg-base)] min-h-screen pb-[calc(64px+env(safe-area-inset-bottom)+24px)] md:pb-8 max-w-[1600px] mx-auto w-full flex flex-col relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white font-medium animate-fade-in-down ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)] flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-[var(--fg-secondary)]" /> Pustaka Media
        </h1>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id="upload-btn"
            disabled={uploading}
          />
          <label
            htmlFor="upload-btn"
            className={`btn btn-primary cursor-pointer w-full sm:w-auto justify-center h-11 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            <span>{uploading ? "Mengupload..." : "Upload Gambar"}</span>
          </label>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="card p-3 md:p-4 flex-1 flex flex-col min-h-0">
        <div className="mb-3 pb-3 md:mb-4 md:pb-4 border-b border-[var(--border)]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] -mx-1 px-3 py-3 md:mx-0 md:p-3">
            <div className="hidden md:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full lg:w-auto">
                <select
                  value={type}
                  onChange={(e) => {
                    const next = e.target.value as MediaTypeFilter;
                    setType(next);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                    setPageInput("1");
                  }}
                  className={`${filterFieldClass} w-full sm:w-[220px]`}
                >
                  <option value="all">Semua Media</option>
                  <option value="image">Gambar</option>
                  <option value="pdf">PDF</option>
                  <option value="document">Dokumen (non-gambar)</option>
                </select>

                <select
                  value={month}
                  onChange={(e) => {
                    const next = e.target.value;
                    setMonth(next);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                    setPageInput("1");
                  }}
                  className={`${filterFieldClass} w-full sm:w-[220px]`}
                >
                  <option value="">Semua Tanggal</option>
                  {monthOptionsList.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <form
                className="flex items-center gap-2 w-full lg:w-auto"
                onSubmit={(e) => {
                  e.preventDefault();
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  setPageInput("1");
                  setDebouncedQ(q.trim());
                }}
              >
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className={`${filterFieldClass} w-full lg:w-[320px]`}
                  placeholder="Cari media..."
                />
                <button type="submit" className="btn btn-secondary text-sm h-10 px-4 whitespace-nowrap">
                  Cari
                </button>
              </form>
            </div>

            <div className="md:hidden flex flex-col gap-2">
              <div className="flex items-stretch gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className={`${mobileFieldClass} flex-1`}
                  placeholder="Cari media..."
                />
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(true)}
                  className="h-12 px-4 rounded-xl bg-[var(--accent)] text-white font-semibold shadow-lg shadow-amber-500/25 w-[96px]"
                >
                  Filter
                </button>
              </div>
              <div className="text-sm text-[var(--fg-muted)]">
                <span className="font-semibold text-[var(--fg-secondary)]">{typeLabel}</span>
                {month ? (
                  <span>
                    {" "}
                    · <span className="font-semibold text-[var(--fg-secondary)]">{monthLabel}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[var(--fg-muted)]">
              <Loader2 className="animate-spin mr-2" /> Memuat...
            </div>
          ) : mediaList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--fg-muted)]">
              <ImageIcon size={48} className="mb-2 opacity-40" />
              <p>Belum ada gambar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaList.map((media) => (
                <div
                  key={media.id}
                  onClick={() => setSelectedMedia(media)}
                  className={`relative group aspect-square rounded-lg overflow-hidden cursor-pointer border transition ${
                    selectedMedia?.id === media.id
                      ? "border-[var(--accent)] ring-2 ring-[color:var(--accent)/0.3]"
                      : "border-[var(--border)] hover:border-[color:var(--fg-muted)/0.3]"
                  }`}
                >
                  <Image
                    src={media.fileUrl}
                    alt={media.fileName}
                    fill
                    className="object-cover bg-[var(--bg-surface)]"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && (
          <div className="mt-3 pt-3 md:mt-4 md:pt-4 border-t border-[var(--border)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-[var(--fg-muted)] sm:text-sm text-center sm:text-left">
                {pagination.total > 0 ? (
                  <span>
                    Menampilkan <span className="font-semibold text-[var(--fg-secondary)]">{startIndex}</span>–
                    <span className="font-semibold text-[var(--fg-secondary)]">{endIndex}</span> dari{" "}
                    <span className="font-semibold text-[var(--fg-secondary)]">{pagination.total}</span>
                  </span>
                ) : (
                  <span>Tidak ada media</span>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-2">
                <span className="text-xs text-[var(--fg-muted)] sm:text-sm whitespace-nowrap">Tampilkan</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => {
                    const nextLimit = parseInt(e.target.value, 10);
                    setPagination((prev) => ({ ...prev, page: 1, limit: nextLimit }));
                    setPageInput("1");
                  }}
                  className={`${filterFieldClass} w-[150px] sm:w-[160px]`}
                >
                  <option value={25}>25 / halaman</option>
                  <option value={50}>50 / halaman</option>
                  <option value={75}>75 / halaman</option>
                  <option value={100}>100 / halaman</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <>
          <div className="md:hidden mt-3 pt-3 border-t border-[var(--border)]">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3">
              <button
                type="button"
                className={`btn btn-secondary w-full text-sm px-4 py-3 ${pagination.page >= pagination.totalPages || loadingMore ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => {
                  fetchMedia({ page: pagination.page + 1, append: true });
                }}
              >
                {loadingMore ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} /> Memuat...
                  </span>
                ) : (
                  "Muat Lebih Banyak"
                )}
              </button>
            </div>
          </div>

          <div className="hidden md:block mt-3 pt-3 md:mt-4 md:pt-4 border-t border-[var(--border)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2">
                <button
                  type="button"
                  className={`btn btn-secondary text-sm px-3 py-2 w-full ${pagination.page <= 1 ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => {
                    setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }));
                  }}
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  className={`btn btn-secondary text-sm px-3 py-2 w-full ${pagination.page >= pagination.totalPages ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => {
                    setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }));
                  }}
                >
                  Berikutnya
                </button>
              </div>

              <form
                className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-sm"
                onSubmit={(e) => {
                  e.preventDefault();
                  const nextPage = Math.min(
                    pagination.totalPages,
                    Math.max(1, parseInt(pageInput || "1", 10) || 1)
                  );
                  setPagination((prev) => ({ ...prev, page: nextPage }));
                }}
              >
                <span className="text-[var(--fg-muted)] whitespace-nowrap">Halaman</span>
                <input
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  className={`${filterFieldClass} w-[84px] text-center`}
                  inputMode="numeric"
                />
                <span className="text-[var(--fg-muted)] whitespace-nowrap">dari {pagination.totalPages}</span>
                <button type="submit" className="btn btn-secondary text-sm px-3 py-2">
                  Lompat
                </button>
              </form>
            </div>
          </div>
          </>
        )}
      </div>

      {/* Modal Detail */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4" onClick={() => setSelectedMedia(null)}>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
            {/* Left: Preview */}
            <div className="w-full md:w-2/3 bg-[var(--bg-surface)] flex items-center justify-center p-4 md:p-8 relative">
              <div className="relative w-full h-[42vh] md:h-full">
                <Image
                  src={selectedMedia.fileUrl}
                  alt={selectedMedia.fileName}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/3 p-4 md:p-6 flex flex-col bg-[var(--bg-elevated)] border-t md:border-t-0 md:border-l border-[var(--border)]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-[var(--fg-primary)] text-lg truncate pr-4" title={selectedMedia.fileName}>
                  {selectedMedia.fileName}
                </h3>
                <button onClick={() => setSelectedMedia(null)} className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)]">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-sm text-[var(--fg-secondary)] flex-1">
                <div>
                  <span className="font-semibold block text-[var(--fg-primary)]">Tipe File</span>
                  {selectedMedia.fileType}
                </div>
                <div>
                  <span className="font-semibold block text-[var(--fg-primary)]">Ukuran</span>
                  {formatBytes(selectedMedia.size)}
                </div>
                <div>
                  <span className="font-semibold block text-[var(--fg-primary)]">URL</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <input 
                      readOnly 
                      value={selectedMedia.fileUrl} 
                      className="input text-xs truncate"
                    />
                  </div>
                </div>
                <div>
                  <span className="font-semibold block text-[var(--fg-primary)]">Penggunaan</span>
                  {selectedMedia._count?.posts || 0} Berita
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => handleDelete(selectedMedia.id)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                >
                  <Trash2 size={16} />
                  <span>Hapus Permanen</span>
                </button>
                <p className="text-xs text-center text-[var(--fg-muted)] mt-2">
                  Hanya bisa dihapus jika tidak digunakan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFilterOpen && (
        <div className="fixed inset-0" style={{ zIndex: 80 }} onClick={() => { setIsFilterOpen(false); setActivePicker(null); }}>
          <div className="absolute inset-x-0 top-0 bg-black/50" style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }} />
          <div
            className="absolute inset-x-0 bg-[var(--bg-elevated)] rounded-t-2xl border-t border-[var(--border)] p-4 overflow-y-auto"
            style={{
              bottom: 0,
              paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 20px)",
              maxHeight: "80vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-[var(--fg-primary)]">Filter</h3>
              <button type="button" onClick={() => { setIsFilterOpen(false); setActivePicker(null); }} className="btn btn-ghost p-2">
                Tutup
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--fg-secondary)] mb-2">Jenis Media</label>
                <button
                  type="button"
                  onClick={() => setActivePicker("type")}
                  className={`${mobileFieldClass} w-full flex items-center justify-between`}
                >
                  <span className="truncate">{typeLabel}</span>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[var(--fg-muted)]">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--fg-secondary)] mb-2">Tanggal</label>
                <button
                  type="button"
                  onClick={() => setActivePicker("month")}
                  className={`${mobileFieldClass} w-full flex items-center justify-between`}
                >
                  <span className="truncate">{monthLabel}</span>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[var(--fg-muted)]">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFilterOpen && activePicker && (
        <div className="fixed inset-0" style={{ zIndex: 81 }} onClick={() => setActivePicker(null)}>
          <div className="absolute inset-x-0 top-0 bg-black/50" style={{ bottom: "calc(64px + env(safe-area-inset-bottom))" }} />
          <div
            className="absolute inset-x-0 bg-[var(--bg-elevated)] rounded-t-2xl border-t border-[var(--border)] p-4 overflow-y-auto"
            style={{
              bottom: 0,
              paddingBottom: "calc(64px + env(safe-area-inset-bottom) + 20px)",
              maxHeight: "80vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-lg text-[var(--fg-primary)]">
                {activePicker === "type" ? "Pilih Jenis Media" : "Pilih Tanggal"}
              </h3>
              <button type="button" onClick={() => setActivePicker(null)} className="btn btn-ghost p-2">
                Tutup
              </button>
            </div>

            <div className="space-y-2">
              {(activePicker === "type"
                ? typeOptions.map((t) => ({ value: t.value, label: t.label }))
                : [{ value: "", label: "Semua Tanggal" }, ...monthOptionsList.map((m) => ({ value: m.value, label: m.label }))]
              ).map((opt) => {
                const isActive = activePicker === "type" ? opt.value === type : opt.value === month;
                return (
                  <button
                    key={opt.value || "__all__"}
                    type="button"
                    onClick={() => {
                      if (activePicker === "type") setType(opt.value as MediaTypeFilter);
                      else setMonth(opt.value);
                      setPagination((prev) => ({ ...prev, page: 1 }));
                      setPageInput("1");
                      setActivePicker(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors text-base ${
                      isActive
                        ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--fg-primary)]"
                        : "border-[var(--border)] bg-[var(--bg-base)] text-[var(--fg-primary)]"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isActive && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--accent)]">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
