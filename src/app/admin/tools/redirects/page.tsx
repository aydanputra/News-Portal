"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Link2, Plus, RefreshCw, Save, Search, Trash2, Wrench } from "lucide-react";
import { ALL_TOOL_IDS } from "@/lib/tools";

type RedirectRow = {
  id: string;
  oldPath: string;
  newPath: string;
  statusCode: number;
  isActive: boolean;
  note: string | null;
  hitCount: number;
  lastHitAt: string | null;
  updatedAt: string;
};

const EMPTY_FORM = {
  id: "",
  oldPath: "",
  newPath: "",
  statusCode: 301,
  isActive: true,
  note: "",
};

export default function RedirectManagerPage() {
  const [toolsFlags, setToolsFlags] = useState<{ enabledTools: string[] } | null>(null);
  const [rows, setRows] = useState<RedirectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const enabledSet = useMemo(() => new Set(toolsFlags?.enabledTools || []), [toolsFlags]);
  const toolEnabled = toolsFlags == null || enabledSet.has("redirect_manager");
  const isEditing = form.id !== "";

  const loadData = useCallback(async (keyword?: string) => {
    setLoading(true);
    try {
      const [toolsRes, rowsRes] = await Promise.all([
        fetch("/api/admin/tools/enabled", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
        fetch(`/api/admin/tools/redirects?q=${encodeURIComponent(keyword || "")}`, { cache: "no-store" }).then((r) =>
          r.ok ? r.json() : { rows: [] },
        ),
      ]);

      const enabledTools = Array.isArray(toolsRes?.enabledTools) ? toolsRes.enabledTools.map((x: any) => String(x)) : ALL_TOOL_IDS;
      setToolsFlags({ enabledTools });
      setRows(Array.isArray(rowsRes?.rows) ? rowsRes.rows : []);
    } catch {
      setMessage({ type: "error", text: "Gagal memuat data Redirect Manager." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        oldPath: form.oldPath,
        newPath: form.newPath,
        statusCode: form.statusCode,
        isActive: form.isActive,
        note: form.note,
      };

      const res = await fetch(isEditing ? `/api/admin/tools/redirects/${form.id}` : "/api/admin/tools/redirects", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setMessage({ type: "error", text: json?.error || "Gagal menyimpan redirect." });
        return;
      }

      setMessage({ type: "success", text: isEditing ? "Redirect berhasil diperbarui." : "Redirect berhasil ditambahkan." });
      resetForm();
      setQuery(search.trim());
      await loadData(search.trim());
    } catch {
      setMessage({ type: "error", text: "Gagal menyimpan redirect." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus redirect ini?")) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/tools/redirects/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage({ type: "error", text: json?.error || "Gagal menghapus redirect." });
        return;
      }
      if (form.id === id) resetForm();
      setMessage({ type: "success", text: "Redirect berhasil dihapus." });
      await loadData(query);
    } catch {
      setMessage({ type: "error", text: "Gagal menghapus redirect." });
    }
  };

  if (!toolEnabled) {
    return (
      <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen">
        <div className="card p-6">
          <div className="font-display text-lg font-bold text-[var(--fg-primary)] flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Redirect Manager
          </div>
          <div className="mt-3 text-sm text-[var(--fg-muted)]">Fitur ini belum diaktifkan untuk website ini.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[var(--bg-base)] min-h-screen">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--accent)] p-2 text-white">
            <Link2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg-primary)]">Redirect Manager</h1>
            <p className="text-sm text-[var(--fg-muted)]">Kelola pengalihan URL lama ke URL baru agar migrasi tidak berakhir 404.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setQuery("");
            void loadData("");
          }}
          className="btn btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {message ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-rose-300 bg-rose-50 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-base font-bold text-[var(--fg-primary)]">{isEditing ? "Edit Redirect" : "Tambah Redirect"}</div>
              <div className="text-xs text-[var(--fg-muted)]">Gunakan path relatif seperti `/berita-lama` atau URL absolut tujuan jika perlu.</div>
            </div>
            {isEditing ? (
              <button type="button" onClick={resetForm} className="btn btn-secondary text-xs">
                <Plus size={14} className="mr-1 inline" />
                Baru
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--fg-secondary)]">URL Lama</label>
              <input
                type="text"
                className="input w-full"
                value={form.oldPath}
                onChange={(e) => setForm((prev) => ({ ...prev, oldPath: e.target.value }))}
                placeholder="/kategori-lama/judul-lama"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--fg-secondary)]">URL Tujuan</label>
              <input
                type="text"
                className="input w-full"
                value={form.newPath}
                onChange={(e) => setForm((prev) => ({ ...prev, newPath: e.target.value }))}
                placeholder="/warta/judul-baru atau https://domain.tujuan.com/..."
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--fg-secondary)]">Status Code</label>
                <select
                  className="input w-full"
                  value={form.statusCode}
                  onChange={(e) => setForm((prev) => ({ ...prev, statusCode: Number(e.target.value) }))}
                >
                  <option value={301}>301 Permanent</option>
                  <option value={302}>302 Temporary</option>
                  <option value={307}>307 Temporary</option>
                  <option value={308}>308 Permanent</option>
                </select>
              </div>
              <label className="mt-7 flex items-center gap-2 text-sm text-[var(--fg-primary)]">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Redirect aktif
              </label>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--fg-secondary)]">Catatan</label>
              <textarea
                className="input min-h-[96px] w-full"
                value={form.note}
                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                placeholder="Contoh: URL artikel lama dari website WordPress 2023"
              />
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary inline-flex items-center gap-2">
              <Save size={16} />
              {saving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Redirect"}
            </button>
          </form>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-base font-bold text-[var(--fg-primary)]">Daftar Redirect</div>
              <div className="text-xs text-[var(--fg-muted)]">Total {rows.length} rule ditampilkan.</div>
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setQuery(search.trim());
                void loadData(search.trim());
              }}
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
                <input
                  type="text"
                  className="input w-[280px] pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari path lama atau tujuan..."
                />
              </div>
              <button type="submit" className="btn btn-secondary">
                Cari
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--fg-muted)]">
                  <th className="px-3 py-2">URL Lama</th>
                  <th className="px-3 py-2">Tujuan</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Hit</th>
                  <th className="px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-[var(--fg-muted)]">
                      Memuat redirect...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-[var(--fg-muted)]">
                      Belum ada redirect manual.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--border)] align-top">
                      <td className="px-3 py-3">
                        <div className="font-medium text-[var(--fg-primary)]">{row.oldPath}</div>
                        {row.note ? <div className="mt-1 text-xs text-[var(--fg-muted)]">{row.note}</div> : null}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-start gap-2 text-[var(--fg-primary)]">
                          <ArrowRight className="mt-0.5 h-4 w-4 flex-none text-[var(--fg-muted)]" />
                          <span className="break-all">{row.newPath}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-[var(--fg-primary)]">{row.statusCode}</div>
                        <div className={`mt-1 text-xs ${row.isActive ? "text-emerald-600" : "text-amber-600"}`}>
                          {row.isActive ? "Aktif" : "Nonaktif"}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[var(--fg-primary)]">
                        <div>{row.hitCount || 0}</div>
                        <div className="mt-1 text-xs text-[var(--fg-muted)]">
                          {row.lastHitAt ? new Date(row.lastHitAt).toLocaleString("id-ID") : "-"}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary text-xs"
                            onClick={() =>
                              setForm({
                                id: row.id,
                                oldPath: row.oldPath,
                                newPath: row.newPath,
                                statusCode: row.statusCode,
                                isActive: row.isActive,
                                note: row.note || "",
                              })
                            }
                          >
                            Edit
                          </button>
                          <button type="button" className="btn btn-secondary text-xs" onClick={() => void handleDelete(row.id)}>
                            <Trash2 size={14} className="mr-1 inline" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
