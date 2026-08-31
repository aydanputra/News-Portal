"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, ExternalLink, FileText, Search } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Page {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  updatedAt: string;
}

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function PagesAdmin() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));
      if (debouncedSearch) params.set("q", debouncedSearch);
      const res = await fetch(`/api/pages?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPages(Array.isArray(data?.data) ? data.data : []);
        if (data?.pagination) {
          setPagination((prev) => ({
            ...prev,
            page: data.pagination.page ?? prev.page,
            limit: data.pagination.limit ?? prev.limit,
            total: data.pagination.total ?? prev.total,
            totalPages: data.pagination.totalPages ?? prev.totalPages,
          }));
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data halaman", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.limit, pagination.page]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  const deletePage = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus halaman ini?")) return;

    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (pages.length === 1 && pagination.page > 1) {
          setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        } else {
          fetchPages();
        }
      } else {
        alert("Gagal menghapus halaman");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg-primary)]">Halaman Statis</h1>
          <p className="text-[var(--fg-secondary)] mt-1">Kelola halaman statis seperti Tentang Kami, Kontak, dll.</p>
        </div>
        <Link 
          href="/admin/pages/create" 
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Buat Halaman
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="mb-6">
        <div className="relative max-w-md">
            <input 
                type="text" 
                placeholder="Cari halaman..." 
                className="input w-full !pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] pointer-events-none" />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        {loading ? (
            <div className="p-12 text-center text-[var(--fg-secondary)]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                Memuat data...
            </div>
        ) : pages.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-[var(--bg-base)] rounded-full flex items-center justify-center mb-4">
                    <FileText size={32} className="text-[var(--fg-muted)]" />
                </div>
                <h3 className="text-lg font-medium text-[var(--fg-primary)] mb-2">
                    {searchTerm ? "Halaman tidak ditemukan" : "Belum ada halaman"}
                </h3>
                <p className="text-[var(--fg-secondary)] mb-6 max-w-sm">
                    {searchTerm ? "Coba kata kunci pencarian lain." : "Mulai dengan membuat halaman statis pertama Anda untuk website ini."}
                </p>
                {!searchTerm && (
                    <Link href="/admin/pages/create" className="btn btn-outline">
                        Buat Halaman Pertama
                    </Link>
                )}
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--bg-base)] border-b border-[var(--border)] text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">
                            <th className="px-6 py-4">Judul Halaman</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Terakhir Update</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {pages.map((page) => (
                            <tr key={page.id} className="hover:bg-[var(--bg-base)] transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-[var(--fg-primary)] text-base mb-1">{page.title}</span>
                                        <span className="text-xs text-[var(--fg-muted)] font-mono flex items-center gap-1">
                                            /{page.slug}
                                            <a 
                                                href={`/${page.slug}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-500"
                                            >
                                                <ExternalLink size={10} />
                                            </a>
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={page.published ? "PUBLISHED" : "DRAFT"} published={page.published} />
                                </td>
                                <td className="px-6 py-4 text-sm text-[var(--fg-secondary)]">
                                    {new Date(page.updatedAt).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link 
                                            href={`/admin/pages/${page.id}`}
                                            className="p-2 text-[var(--fg-secondary)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit size={18} />
                                        </Link>
                                        <button 
                                            onClick={() => deletePage(page.id)}
                                            className="p-2 text-[var(--fg-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {!loading && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--fg-secondary)]">
          <div>
            Menampilkan {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} halaman
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-outline"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              Sebelumnya
            </button>
            <span className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
              {pagination.page}/{pagination.totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
