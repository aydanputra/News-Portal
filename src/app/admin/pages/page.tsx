"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, ExternalLink, FileText, Search } from "lucide-react";

interface Page {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  updatedAt: string;
}

export default function PagesAdmin() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/pages");
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data halaman", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus halaman ini?")) return;

    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPages(pages.filter((p) => p.id !== id));
      } else {
        alert("Gagal menghapus halaman");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus");
    }
  };

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        ) : filteredPages.length === 0 ? (
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
                        {filteredPages.map((page) => (
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
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                        page.published 
                                        ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" 
                                        : "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                            page.published ? "bg-green-500" : "bg-gray-500"
                                        }`}></span>
                                        {page.published ? "Published" : "Draft"}
                                    </span>
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
    </div>
  );
}
