
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Megaphone, Code } from "lucide-react";

interface Ad {
  id: string;
  name: string;
  type: "IMAGE" | "SCRIPT";
  position: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  media?: { fileUrl: string };
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  async function fetchAds() {
    try {
      const res = await fetch("/api/ads");
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      }
    } catch {
      console.error("Gagal load ads");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin hapus iklan ini?")) return;

    try {
      await fetch(`/api/ads/${id}`, { method: "DELETE" });
      fetchAds();
    } catch {
      alert("Gagal hapus");
    }
  }

  return (
    <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)] flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[var(--fg-secondary)]" />
            Manajemen Iklan
          </h1>
          <p className="text-[var(--fg-secondary)] text-sm mt-1">Atur banner dan script iklan website.</p>
        </div>
        <Link 
          href="/admin/ads/new" 
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Buat Iklan Baru</span>
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[860px]">
          <thead>
            <tr className="bg-[var(--bg-surface)] border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              <th className="px-4 md:px-6 py-3">Nama Iklan</th>
              <th className="px-4 md:px-6 py-3">Tipe</th>
              <th className="px-4 md:px-6 py-3">Posisi</th>
              <th className="px-4 md:px-6 py-3">Jadwal</th>
              <th className="px-4 md:px-6 py-3">Status</th>
              <th className="px-4 md:px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
                <tr><td colSpan={6} className="px-4 md:px-6 py-8 text-center text-[var(--fg-muted)]">Memuat...</td></tr>
            ) : ads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 md:px-6 py-12 text-center text-[var(--fg-muted)]">
                  <div className="flex flex-col items-center">
                    <Megaphone size={48} className="mb-2 opacity-20" />
                    <p className="mb-2">Belum ada iklan.</p>
                    <Link href="/admin/ads/new" className="text-[var(--accent)] hover:underline">
                      Buat sekarang
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              ads.map((ad) => (
                <tr key={ad.id} className="hover:bg-[var(--bg-elevated)] transition-colors text-sm">
                  <td className="px-4 md:px-6 py-3">
                    <div className="flex items-center space-x-3">
                        {ad.type === "IMAGE" && ad.media ? (
                            <div className="w-10 h-10 relative rounded bg-[var(--bg-surface)] overflow-hidden border border-[var(--border)]">
                                <Image src={ad.media.fileUrl} alt={ad.name} fill unoptimized className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded bg-[var(--bg-surface)] flex items-center justify-center text-[var(--fg-muted)] border border-[var(--border)]">
                                <Code size={16} />
                            </div>
                        )}
                        <span className="font-medium text-[var(--fg-primary)]">{ad.name}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${ad.type === "IMAGE" ? "bg-[var(--accent-subtle)] text-[var(--accent)] border-[var(--accent)]/30" : "bg-[var(--bg-elevated)] text-[var(--fg-secondary)] border-[var(--border)]"}`}>
                        {ad.type === "IMAGE" ? "GAMBAR" : "SCRIPT"}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 text-[var(--fg-secondary)]">{ad.position}</td>
                  <td className="px-4 md:px-6 py-3 text-[var(--fg-muted)] text-xs">
                    {ad.startDate ? new Date(ad.startDate).toLocaleDateString("id-ID") : "∞"} 
                    {" - "} 
                    {ad.endDate ? new Date(ad.endDate).toLocaleDateString("id-ID") : "∞"}
                  </td>
                  <td className="px-4 md:px-6 py-3">
                    {ad.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--bg-elevated)] text-[var(--fg-secondary)] border border-[var(--border)]">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-4 md:px-6 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link 
                        href={`/admin/ads/${ad.id}/edit`}
                        className="p-2 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] rounded transition"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(ad.id)}
                        className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
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
  );
}
