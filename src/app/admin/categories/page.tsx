
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, ChevronRight, Folder, Search } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  postsCount?: number;
  children?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "with_children" | "no_children">("all");
  const [sortBy, setSortBy] = useState<"name_asc" | "posts_desc">("name_asc");

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Gagal memuat kategori" }));
        throw new Error(err?.error || "Gagal memuat kategori");
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Data kategori tidak valid");
      }
      setCategories(data);
    } catch (err) {
      console.error(err);
      setToast({ message: "Gagal memuat kategori", type: "error" });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  function handleAdd(parent: string = "") {
    setEditingId(null);
    setName("");
    setParentId(parent);
    setShowForm(true);
  }

  function handleEdit(cat: Category, parent: string = "") {
    setEditingId(cat.id);
    setName(cat.name);
    setParentId(parent);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin hapus kategori ini? Pastikan tidak ada sub-kategori atau berita terkait.")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (res.ok) {
        setToast({ message: "Kategori berhasil dihapus", type: "success" });
        fetchCategories();
      } else {
        setToast({ message: data.error, type: "error" });
      }
    } catch {
      setToast({ message: "Error jaringan", type: "error" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId }),
      });
      const data = await res.json();

      if (res.ok) {
        setToast({ message: editingId ? "Kategori diupdate" : "Kategori dibuat", type: "success" });
        setShowForm(false);
        fetchCategories();
      } else {
        setToast({ message: data.error, type: "error" });
      }
    } catch {
      setToast({ message: "Error jaringan", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  const normalizedParents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (cat: Category) =>
      cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q);

    let parents = categories.map((p) => {
      const children = p.children || [];
      const matchedChildren = q ? children.filter(matches) : children;
      const includeParent =
        q ? matches(p) || matchedChildren.length > 0 : true;

      return includeParent
        ? {
            ...p,
            visibleChildren: q ? matchedChildren : children,
          }
        : null;
    }).filter(Boolean) as Array<Category & { visibleChildren: Category[] }>;

    // Filter by type
    if (filterType === "with_children") {
      parents = parents.filter((p) => (p.visibleChildren || []).length > 0);
    } else if (filterType === "no_children") {
      parents = parents.filter((p) => (p.visibleChildren || []).length === 0);
    }

    // Sort
    parents.sort((a, b) => {
      if (sortBy === "posts_desc") {
        const av = a.postsCount || 0;
        const bv = b.postsCount || 0;
        if (bv !== av) return bv - av;
      }
      return a.name.localeCompare(b.name, "id");
    });

    // Sort children (by name)
    parents = parents.map((p) => ({
      ...p,
      visibleChildren: (p.visibleChildren || []).slice().sort((a, b) => a.name.localeCompare(b.name, "id")),
    }));

    return parents;
  }, [categories, query, filterType, sortBy]);

  const isSearching = query.trim().length > 0;

  const tableRows = useMemo(() => {
    type Row =
      | { kind: "parent"; key: string; parent: Category & { visibleChildren?: Category[] }; hasChildren: boolean }
      | { kind: "child"; key: string; parentId: string; child: Category };

    const rows: Row[] = [];
    normalizedParents.forEach((p: any) => {
      const children: Category[] = p.visibleChildren || [];
      const hasChildren = children.length > 0;
      rows.push({ kind: "parent", key: `p-${p.id}`, parent: p, hasChildren });
      if (hasChildren && (!collapsed[p.id] || isSearching)) {
        children.forEach((c) => rows.push({ kind: "child", key: `c-${p.id}-${c.id}`, parentId: p.id, child: c }));
      }
    });
    return rows;
  }, [normalizedParents, collapsed, isSearching]);

  return (
    <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8 max-w-[1600px] mx-auto relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white font-medium animate-fade-in-down ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-8 text-[var(--fg-muted)]">Memuat Kategori...</div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)]">Manajemen Kategori</h1>
        <button 
          onClick={() => handleAdd()} 
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Kategori Baru</span>
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-3 md:items-center w-full md:justify-between mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau slug..."
            className="input input-search"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:items-center flex-1">
          <select
            className="input flex-1 min-w-[12rem]"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">Semua Kategori</option>
            <option value="with_children">Memiliki Sub</option>
            <option value="no_children">Tanpa Sub</option>
          </select>
          <select
            className="input flex-1 min-w-[12rem]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="name_asc">Urut Nama (A-Z)</option>
            <option value="posts_desc">Urut Berita (Terbanyak)</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {normalizedParents.length === 0 ? (
          <div className="p-12 text-center text-[var(--fg-muted)]">Belum ada kategori.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
                  <th className="px-4 md:px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">Nama</th>
                  <th className="px-4 md:px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">Slug</th>
                  <th className="px-4 md:px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)] w-24">Berita</th>
                  <th className="px-4 md:px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)] text-right w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {tableRows.map((row) => {
                  if (row.kind === "parent") {
                    const parent = row.parent;
                    const hasChildren = row.hasChildren;
                    return (
                      <tr key={row.key} className="bg-[var(--bg-elevated)]">
                        <td className="px-4 md:px-6 py-3">
                          <div className="flex items-center gap-3">
                            {hasChildren ? (
                              <button
                                onClick={() => setCollapsed(prev => ({ ...prev, [parent.id]: !prev[parent.id] }))}
                                className="p-1 rounded hover:bg-[var(--bg-surface)]"
                                aria-label="Toggle sub-kategori"
                                title={collapsed[parent.id] ? 'Buka' : 'Tutup'}
                              >
                                <ChevronRight className={`text-[var(--fg-muted)] transition-transform ${(!collapsed[parent.id] || isSearching) ? 'rotate-90' : ''}`} size={18} />
                              </button>
                            ) : (
                              <span className="inline-block w-7" />
                            )}
                            <Folder className="text-[var(--fg-secondary)]" size={20} />
                            <span className="font-bold text-[var(--fg-primary)]">{parent.name}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3">
                          <span className="text-xs text-[var(--fg-muted)] bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border)]">/{parent.slug}</span>
                        </td>
                        <td className="px-4 md:px-6 py-3">
                          <span className="badge">{parent.postsCount ?? 0}</span>
                        </td>
                        <td className="px-4 md:px-6 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleAdd(parent.id)}
                              className="p-2 text-[var(--accent)] hover:bg-[var(--bg-surface)] rounded text-xs font-bold uppercase tracking-wide flex items-center"
                              title="Tambah Sub-Kategori"
                            >
                              <Plus size={14} className="mr-1" /> Sub
                            </button>
                            <button 
                              onClick={() => handleEdit(parent)}
                              className="p-2 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] rounded"
                              title="Ubah"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(parent.id)}
                              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  // child row
                  const child = row.child;
                  return (
                    <tr key={row.key} className="bg-[var(--bg-elevated)]">
                      <td className="px-4 md:px-6 py-2">
                        <div className="pl-9 flex items-center gap-3">
                          <ChevronRight className="text-[var(--fg-muted)] rotate-90" size={16} />
                          <span className="text-[var(--fg-primary)] font-medium">{child.name}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-2">
                        <span className="text-xs text-[var(--fg-muted)]">/{child.slug}</span>
                      </td>
                      <td className="px-4 md:px-6 py-2">
                        <span className="badge">{child.postsCount ?? 0}</span>
                      </td>
                      <td className="px-4 md:px-6 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(child, row.parentId)}
                            className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] rounded"
                            title="Ubah"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(child.id)}
                            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-down">
            <h2 className="text-xl font-bold mb-4 text-[var(--fg-primary)]">
              {editingId ? "Edit Kategori" : "Kategori Baru"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Kategori</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Induk Kategori (Parent)</label>
                <select 
                  value={parentId} 
                  onChange={(e) => setParentId(e.target.value)}
                  className="input"
                >
                  <option value="">-- Tidak Ada (Kategori Utama) --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} disabled={cat.id === editingId}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[var(--fg-muted)] mt-1">
                  Pilih kategori utama jika ini adalah sub-kategori.
                </p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-ghost"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
