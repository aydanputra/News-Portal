"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import PostCard from "@/components/admin/PostCard";

interface Post {
  id: string;
  title: string;
  slug?: string;
  type?: string | null;
  category: { name: string; slug?: string };
  author: { name: string };
  published: boolean;
  updatedAt: string;
  status?: string;
  publishedAt?: string | null;
}

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "review" | "trash">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [pageInput, setPageInput] = useState<string>("1");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activePicker, setActivePicker] = useState<null | "category" | "type" | "status">(null);
  const [counts, setCounts] = useState<{ all: number; published: number; draft: number; review: number; trash: number }>({
    all: 0,
    published: 0,
    draft: 0,
    review: 0,
    trash: 0,
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) {
          const flat: { id: string; name: string; slug: string }[] = [];
          data.forEach((p: any) => {
            flat.push({ id: p.id, name: p.name, slug: p.slug });
            (p.children || []).forEach((c: any) => flat.push({ id: c.id, name: c.name, slug: c.slug }));
          });
          setCategories(flat);
        }
      })
      .catch(() => {});
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));
      params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (debouncedSearch) params.set("q", debouncedSearch);

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      setPosts(data.data || []);
      if (data.pagination) {
        setPagination((prev) => ({
          ...prev,
          page: data.pagination.page ?? prev.page,
          limit: data.pagination.limit ?? prev.limit,
          total: data.pagination.total ?? prev.total,
          totalPages: data.pagination.totalPages ?? prev.totalPages,
        }));
        setPageInput(String(data.pagination.page ?? pagination.page));
      }
      if (data.counts) {
        setCounts({
          all: data.counts.all ?? 0,
          published: data.counts.published ?? 0,
          draft: data.counts.draft ?? 0,
          review: data.counts.review ?? 0,
          trash: data.counts.trash ?? 0,
        });
      }
      setSelectedPosts(new Set());
    } catch (err) {
      console.error("Gagal ambil data", err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, debouncedSearch, pagination.limit, pagination.page, statusFilter, typeFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleDelete(id: string) {
    if (!confirm("Pindahkan berita ke sampah?")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (posts.length === 1 && pagination.page > 1) {
          const prevPage = pagination.page - 1;
          setPagination((prev) => ({ ...prev, page: prevPage }));
          setPageInput(String(prevPage));
        } else {
          fetchPosts();
        }
        setSelectedPosts(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        alert("Gagal menghapus");
      }
    } catch {
      alert("Error jaringan");
    }
  }

  async function handleRestore(id: string) {
    try {
      const res = await fetch(`/api/posts/${id}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" })
      });
      
      if (res.ok) {
        fetchPosts();
        setSelectedPosts(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        alert("Gagal mengembalikan berita");
      }
    } catch {
      alert("Error jaringan");
    }
  }

  async function handleHardDelete(id: string) {
    if (!confirm("Yakin hapus permanen? Data tidak bisa dikembalikan!")) return;

    try {
      const res = await fetch(`/api/posts/${id}?hard=true`, { method: "DELETE" });
      if (res.ok) {
        if (posts.length === 1 && pagination.page > 1) {
          const prevPage = pagination.page - 1;
          setPagination((prev) => ({ ...prev, page: prevPage }));
          setPageInput(String(prevPage));
        } else {
          fetchPosts();
        }
        setSelectedPosts(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        alert("Gagal menghapus permanen");
      }
    } catch {
      alert("Error jaringan");
    }
  }

  async function handleBulkDelete() {
    if (selectedPosts.size === 0) return;
    
    const isTrash = statusFilter === "trash";
    const message = isTrash 
      ? `Yakin hapus permanen ${selectedPosts.size} berita?` 
      : `Pindahkan ${selectedPosts.size} berita ke sampah?`;

    if (!confirm(message)) return;

    try {
      // Process concurrently
      await Promise.all(Array.from(selectedPosts).map(id => {
        return fetch(`/api/posts/${id}${isTrash ? '?hard=true' : ''}`, { method: "DELETE" });
      }));
      
      fetchPosts();
      setSelectedPosts(new Set());
    } catch {
      alert("Gagal memproses beberapa item");
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 bg-[var(--bg-base)]">
        <div className="h-8 bg-[var(--bg-surface)] border border-[var(--border)] rounded w-48 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const toggleSelect = (id: string) => {
    setSelectedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPosts.size === posts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(posts.map(p => p.id)));
    }
  };

  const startIndex = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endIndex = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + posts.length;
  const fieldClass =
    "h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--bg-base)] text-[var(--fg-primary)] text-sm focus:outline-none focus:border-[var(--accent)]";
  const mobileFieldClass =
    "h-12 px-4 rounded-xl border border-[var(--border)] bg-[var(--bg-base)] text-[var(--fg-primary)] text-base focus:outline-none focus:border-[var(--accent)]";

  const typeOptions: { value: string; label: string }[] = [
    { value: "all", label: "Semua Jenis" },
    { value: "ARTICLE", label: "Artikel" },
    { value: "GALLERY", label: "Galeri" },
    { value: "VIDEO", label: "Video" },
    { value: "INFOGRAPHIC", label: "Infografik" },
  ];
  const statusOptions: { value: string; label: string }[] = [
    { value: "all", label: "Semua Status" },
    { value: "published", label: "Terbit" },
    { value: "draft", label: "Draf" },
    { value: "review", label: "Ditinjau" },
    { value: "trash", label: "Sampah" },
  ];
  const categoryOptions: { value: string; label: string }[] = [
    { value: "all", label: "Semua Kategori" },
    ...categories.map((c) => ({ value: c.slug, label: c.name })),
  ];

  const selectedCategoryLabel = categoryOptions.find((o) => o.value === categoryFilter)?.label || "Semua Kategori";
  const selectedTypeLabel = typeOptions.find((o) => o.value === typeFilter)?.label || "Semua Jenis";
  const selectedStatusLabel = statusOptions.find((o) => o.value === statusFilter)?.label || "Semua Status";

  return (
    <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)]">Artikel</h1>
          <p className="text-[var(--fg-secondary)] text-sm mt-1">Kelola konten berita Anda</p>
        </div>
        <Link 
          href="/admin/posts/new" 
          className="btn btn-primary w-full md:w-auto justify-center text-white"
        >
          <Plus size={18} />
          Buat Baru
        </Link>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 md:flex-[2]">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari artikel..."
              className="input input-search w-full"
            />
          </div>
          <div className="hidden md:flex gap-3 w-full md:w-auto">
            <select 
              className="input w-full md:w-52"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
                setPageInput("1");
              }}
            >
              <option value="all">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            <select
              className="input w-full md:w-48"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
                setPageInput("1");
              }}
            >
              <option value="all">Semua Jenis</option>
              <option value="ARTICLE">Artikel</option>
              <option value="GALLERY">Galeri</option>
              <option value="VIDEO">Video</option>
              <option value="INFOGRAPHIC">Infografik</option>
            </select>
            <select 
              className="input w-full md:w-48"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPagination((prev) => ({ ...prev, page: 1 }));
                setPageInput("1");
              }}
            >
              <option value="all">Semua Status</option>
              <option value="published">Terbit</option>
              <option value="draft">Draf</option>
              <option value="review">Ditinjau</option>
              <option value="trash">Sampah</option>
            </select>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="w-full h-11 rounded-lg bg-[var(--accent)] text-white font-bold flex items-center justify-center shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-transform"
            >
              Filter
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 pb-1 items-center justify-between">
            <div className="flex gap-2 overflow-x-auto">
                <button onClick={() => { setStatusFilter("all"); setPagination((prev) => ({ ...prev, page: 1 })); setPageInput("1"); }} className={`px-3 py-2 text-sm font-bold rounded-full whitespace-nowrap inline-flex items-center ${statusFilter==="all" ? "bg-[var(--accent)] text-white" : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface)]"}`}><span>Semua</span><span className="ml-1 opacity-90">({counts.all})</span></button>
                <button onClick={() => { setStatusFilter("published"); setPagination((prev) => ({ ...prev, page: 1 })); setPageInput("1"); }} className={`px-3 py-2 text-sm font-medium rounded-full whitespace-nowrap inline-flex items-center ${statusFilter==="published" ? "bg-[var(--accent)] text-white" : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface)]"}`}><span>Terbit</span><span className="ml-1 opacity-90">({counts.published})</span></button>
                <button onClick={() => { setStatusFilter("draft"); setPagination((prev) => ({ ...prev, page: 1 })); setPageInput("1"); }} className={`px-3 py-2 text-sm font-medium rounded-full whitespace-nowrap inline-flex items-center ${statusFilter==="draft" ? "bg-[var(--accent)] text-white" : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface)]"}`}><span>Draf</span><span className="ml-1 opacity-90">({counts.draft})</span></button>
                <button onClick={() => { setStatusFilter("review"); setPagination((prev) => ({ ...prev, page: 1 })); setPageInput("1"); }} className={`px-3 py-2 text-sm font-medium rounded-full whitespace-nowrap inline-flex items-center ${statusFilter==="review" ? "bg-[var(--accent)] text-white" : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface)]"}`}><span>Ditinjau</span><span className="ml-1 opacity-90">({counts.review})</span></button>
                <button onClick={() => { setStatusFilter("trash"); setPagination((prev) => ({ ...prev, page: 1 })); setPageInput("1"); }} className={`px-3 py-2 text-sm font-medium rounded-full whitespace-nowrap inline-flex items-center ${statusFilter==="trash" ? "bg-red-100 text-red-600 dark:bg-red-900/20" : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface)]"}`}><span>Sampah</span><span className="ml-1 opacity-90">({counts.trash})</span></button>
            </div>
            
            {/* Bulk Actions */}
            {selectedPosts.size > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 md:hidden">
                    <span className="text-sm text-[var(--fg-muted)] mr-2">{selectedPosts.size} terpilih</span>
                    <button 
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors"
                    >
                        {statusFilter === "trash" ? "Hapus Permanen" : "Pindahkan ke Sampah"}
                    </button>
                </div>
            )}
        </div>
      </div>
      
      {/* Select All Checkbox Bar */}
      {posts.length > 0 && (
          <div className={`mb-4 px-4 py-3 hidden md:flex items-center justify-between rounded-xl border transition-all duration-300 ${selectedPosts.size > 0 ? "bg-[var(--accent)] border-[var(--accent)] shadow-lg shadow-amber-500/20" : "bg-[var(--bg-surface)] border-[var(--border)]"}`}>
              <div className="flex items-center gap-3">
                <label className="relative flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={selectedPosts.size === posts.length && posts.length > 0}
                        onChange={toggleSelectAll}
                    />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedPosts.size > 0 ? "bg-white border-white text-[var(--accent)]" : "border-[var(--fg-muted)] bg-transparent"}`}>
                        <svg className={`w-3.5 h-3.5 transition-opacity ${selectedPosts.size === posts.length ? "opacity-100" : "opacity-0"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </label>
                <span className={`text-sm font-bold ${selectedPosts.size > 0 ? "text-white" : "text-[var(--fg-secondary)]"}`}>
                    {selectedPosts.size > 0 ? `${selectedPosts.size} Berita Terpilih` : "Pilih Semua Berita"}
                </span>
              </div>

              {/* Bulk Actions */}
              {selectedPosts.size > 0 && (
                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                    <button 
                        onClick={handleBulkDelete}
                        className="px-4 py-1.5 bg-white text-[var(--accent)] text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
                    >
                        {statusFilter === "trash" ? (
                            <>
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Hapus Permanen
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                Pindahkan ke Sampah
                            </>
                        )}
                    </button>
                </div>
              )}
          </div>
      )}

      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="card p-8 text-center text-[var(--fg-muted)]">
            {statusFilter === "trash" ? "Sampah kosong." : "Tidak ada artikel ditemukan."}
          </div>
        ) : (
          posts.map(post => {
            const isSelected = selectedPosts.has(post.id);
            return (
              <div key={post.id}>
                <div className="md:hidden relative">
                  <div className="absolute top-2 left-2 z-10">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={isSelected}
                        onChange={() => toggleSelect(post.id)}
                      />
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-[var(--accent)] border-[var(--accent)] text-black" : "border-[var(--border)] bg-white/95 backdrop-blur group-hover:border-[var(--accent)]"}`}>
                        <svg className={`w-4 h-4 transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </label>
                  </div>

                  <PostCard
                    post={post as any}
                    onDelete={statusFilter === "trash" ? handleHardDelete : handleDelete}
                    showDelete={true}
                    hoverActions={false}
                    customActions={statusFilter === "trash" ? (
                      <button
                        onClick={() => handleRestore(post.id)}
                        className="text-[var(--accent)] hover:text-[var(--accent)] font-bold text-xs bg-white px-3 py-1.5 rounded border border-[var(--accent)] transition-colors shadow-sm"
                      >
                        Restore
                      </button>
                    ) : undefined}
                  />
                </div>

                <div className={`hidden md:flex relative group items-center gap-4 transition-all duration-200 rounded-xl border ${isSelected ? "bg-[var(--accent-subtle)] border-[var(--accent)]" : "border-transparent hover:bg-[var(--bg-surface)]"}`}>
                  <div className="pl-4">
                    <label className="relative flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={isSelected}
                        onChange={() => toggleSelect(post.id)}
                      />
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? "bg-[var(--accent)] border-[var(--accent)] text-white" : "border-[var(--border)] bg-[var(--bg-elevated)] group-hover:border-[var(--accent)]"}`}>
                        <svg className={`w-3.5 h-3.5 transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </label>
                  </div>
                  <div className="flex-1 min-w-0 pr-2 py-2">
                    <PostCard
                      post={post as any}
                      onDelete={statusFilter === "trash" ? handleHardDelete : handleDelete}
                      showDelete={true}
                      hoverActions={false}
                      customActions={statusFilter === "trash" ? (
                        <button
                          onClick={() => handleRestore(post.id)}
                          className="text-[var(--accent)] hover:text-[var(--accent)] font-bold text-xs bg-white px-3 py-1.5 rounded border border-[var(--accent)] transition-colors shadow-sm"
                        >
                          Restore
                        </button>
                      ) : undefined}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && (
        <div className="mt-6 card p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-xs text-[var(--fg-muted)] sm:text-sm">
              {pagination.total > 0 ? (
                <span>
                  Menampilkan <span className="font-semibold text-[var(--fg-secondary)]">{startIndex}</span>–
                  <span className="font-semibold text-[var(--fg-secondary)]">{endIndex}</span> dari{" "}
                  <span className="font-semibold text-[var(--fg-secondary)]">{pagination.total}</span>
                </span>
              ) : (
                <span>Tidak ada data</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--fg-muted)] sm:text-sm">Tampilkan</span>
              <select
                value={pagination.limit}
                onChange={(e) => {
                  const nextLimit = parseInt(e.target.value, 10);
                  setPagination((prev) => ({ ...prev, page: 1, limit: nextLimit }));
                  setPageInput("1");
                }}
                className={`${fieldClass} w-[150px]`}
              >
                <option value={25}>25 / halaman</option>
                <option value={50}>50 / halaman</option>
                <option value={75}>75 / halaman</option>
                <option value={100}>100 / halaman</option>
              </select>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`btn btn-secondary text-sm px-3 py-2 ${pagination.page <= 1 ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  className={`btn btn-secondary text-sm px-3 py-2 ${pagination.page >= pagination.totalPages ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                >
                  Berikutnya
                </button>
              </div>

              <form
                className="flex items-center gap-2 text-sm"
                onSubmit={(e) => {
                  e.preventDefault();
                  const nextPage = Math.min(pagination.totalPages, Math.max(1, parseInt(pageInput || "1", 10) || 1));
                  setPagination((prev) => ({ ...prev, page: nextPage }));
                }}
              >
                <span className="text-[var(--fg-muted)]">Halaman</span>
                <input value={pageInput} onChange={(e) => setPageInput(e.target.value)} className={`${fieldClass} w-[90px]`} inputMode="numeric" />
                <span className="text-[var(--fg-muted)]">dari {pagination.totalPages}</span>
                <button type="submit" className="btn btn-secondary text-sm px-3 py-2">
                  Lompat
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {isFilterOpen && (
        <div className="fixed inset-0" style={{ zIndex: 80 }} onClick={() => setIsFilterOpen(false)}>
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
              <button type="button" onClick={() => setIsFilterOpen(false)} className="btn btn-ghost p-2">
                Tutup
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--fg-secondary)] mb-2">Kategori</label>
                <button
                  type="button"
                  onClick={() => setActivePicker("category")}
                  className={`${mobileFieldClass} w-full flex items-center justify-between`}
                >
                  <span className="truncate">{selectedCategoryLabel}</span>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[var(--fg-muted)]">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--fg-secondary)] mb-2">Jenis</label>
                <button
                  type="button"
                  onClick={() => setActivePicker("type")}
                  className={`${mobileFieldClass} w-full flex items-center justify-between`}
                >
                  <span className="truncate">{selectedTypeLabel}</span>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[var(--fg-muted)]">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--fg-secondary)] mb-2">Status</label>
                <button
                  type="button"
                  onClick={() => setActivePicker("status")}
                  className={`${mobileFieldClass} w-full flex items-center justify-between`}
                >
                  <span className="truncate">{selectedStatusLabel}</span>
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
                {activePicker === "category" ? "Pilih Kategori" : activePicker === "type" ? "Pilih Jenis" : "Pilih Status"}
              </h3>
              <button type="button" onClick={() => setActivePicker(null)} className="btn btn-ghost p-2">
                Tutup
              </button>
            </div>

            <div className="space-y-2">
              {(activePicker === "category"
                ? categoryOptions
                : activePicker === "type"
                  ? typeOptions
                  : statusOptions
              ).map((opt) => {
                const isActive =
                  (activePicker === "category" && opt.value === categoryFilter) ||
                  (activePicker === "type" && opt.value === typeFilter) ||
                  (activePicker === "status" && opt.value === statusFilter);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      if (activePicker === "category") setCategoryFilter(opt.value);
                      if (activePicker === "type") setTypeFilter(opt.value);
                      if (activePicker === "status") setStatusFilter(opt.value as any);
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
