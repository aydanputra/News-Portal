"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Image as ImageIcon, List, FileText, Users, Megaphone, Palette, Wrench } from "lucide-react";
import DashboardStats from "@/components/admin/dashboard/DashboardStats";
import DashboardRecentTable from "@/components/admin/dashboard/DashboardRecentTable";

interface DashboardData {
  role: "WRITER" | "EDITOR" | "ADMIN" | "SUPER_ADMIN" | string;
  stats: {
    totalPosts: number;
    totalPublished: number;
    totalDrafts: number;
    totalInReview: number;
    totalScheduled: number;
    totalPublishedToday: number;
  };
  recentPosts: any[];
  inReviewPosts: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/dashboard");

        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }

        const json = await res.json().catch(() => null);
        if (!res.ok) {
          const message = typeof json?.error === "string" && json.error.trim() !== "" ? json.error : "Gagal memuat data dasbor.";
          throw new Error(message);
        }

        const looksLikeDashboard = json && typeof json === "object" && json.stats && typeof json.stats.totalPosts === "number";
        if (!looksLikeDashboard) throw new Error("Data dasbor tidak valid.");

        if (!cancelled) {
          setData(json as DashboardData);
          setError(null);
          setLoading(false);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Gagal memuat data dasbor.";
        console.error("Gagal load dashboard", e);
        if (!cancelled) {
          setError(message);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-3 text-[var(--fg-muted)]">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Memuat dasbor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[var(--bg-base)] min-h-screen">
        <div className="text-red-600 font-semibold">Gagal memuat data.</div>
        <div className="text-[var(--fg-muted)] mt-2 text-sm">{error}</div>
        <button
          className="btn btn-primary mt-4"
          onClick={() => window.location.reload()}
        >
          Muat ulang
        </button>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-red-600 bg-[var(--bg-base)] min-h-screen">Gagal memuat data.</div>;

  const role = data.role || "WRITER";
  const canSeeUsers = role === "ADMIN" || role === "SUPER_ADMIN";
  const canSeeAds = role === "ADMIN" || role === "SUPER_ADMIN";
  const canSeePages = role !== "WRITER";
  const canSeeCategories = role !== "WRITER";
  const canSeeAppearanceAndTools = role === "SUPER_ADMIN";

  const headerTitle =
    role === "SUPER_ADMIN"
      ? "Dasbor Super Admin"
      : role === "ADMIN"
        ? "Dasbor Admin"
        : role === "EDITOR"
          ? "Dasbor Editor"
          : "Dasbor Penulis";
  const headerSubtitle =
    role === "SUPER_ADMIN"
      ? "Akses penuh sistem dan ringkasan operasional."
      : role === "ADMIN"
        ? "Ringkasan operasional dan aktivitas editorial."
        : role === "EDITOR"
          ? "Fokus pada antrian review dan publikasi."
          : "Fokus pada artikel yang Anda tulis.";

  const statsLabels =
    role === "WRITER"
      ? {
          totalPosts: "Artikel Saya",
          totalPublished: "Terbit",
          totalDrafts: "Draf",
          totalInReview: "Menunggu Review",
          publishedSubValue: "Artikel tayang",
          draftSubValue: "Belum dikirim",
          inReviewSubValue: "Sedang ditinjau",
        }
      : role === "EDITOR"
        ? {
            totalPosts: "Total Artikel",
            totalPublished: "Terbit",
            totalDrafts: "Draf",
            totalInReview: "Perlu Review",
            inReviewSubValue: "Antrian editorial",
          }
        : undefined;

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)]">
          {headerTitle}
        </h1>
        <p className="text-[var(--fg-secondary)] mt-1 font-medium">
          {headerSubtitle}
        </p>
      </div>

      {/* Stats Grid */}
      <DashboardStats stats={data.stats} labels={statsLabels} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Recent Activity - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {(role === "EDITOR" || role === "ADMIN" || role === "SUPER_ADMIN") && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
                <div>
                  <h3 className="font-display text-lg font-semibold text-[var(--fg-primary)]">Antrian Review</h3>
                </div>
                <Link href="/admin/posts" className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] hover:underline decoration-[var(--accent)] underline-offset-4">
                  Buka Artikel
                </Link>
              </div>
              <div className="divide-y divide-[var(--border)] bg-[var(--bg-elevated)]">
                {data.inReviewPosts.length === 0 ? (
                  <div className="px-6 py-10 text-center text-[var(--fg-muted)] italic">Tidak ada artikel menunggu review.</div>
                ) : (
                  data.inReviewPosts.map((post: any) => (
                    <div key={post.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[var(--bg-base)] transition-colors">
                      <div className="min-w-0">
                        <Link href={`/admin/posts/${post.id}/edit`} className="font-semibold text-[var(--fg-primary)] hover:text-[var(--accent)] line-clamp-1 transition-colors">
                          {post.title}
                        </Link>
                        <div className="text-xs text-[var(--fg-muted)] mt-0.5">{post?.author?.name ? `Penulis: ${post.author.name}` : ""}</div>
                      </div>
                      <Link href={`/admin/posts/${post.id}/edit`} className="btn btn-ghost px-3 py-2 text-xs font-bold">
                        Review
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <DashboardRecentTable
            posts={data.recentPosts}
            title={role === "WRITER" ? "Artikel Saya Terbaru" : "Artikel Terbaru"}
            hrefAll="/admin/posts"
            labelAll="Lihat Semua"
            emptyLabel={role === "WRITER" ? "Belum ada artikel." : "Tidak ada artikel terbaru."}
          />
        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-display font-bold text-lg mb-4 text-[var(--fg-primary)]">
            Aksi Cepat
            </h3>
            <div className="space-y-3">
              <Link 
                href="/admin/posts/new" 
                className="btn btn-primary w-full justify-start py-3"
              >
                <Plus size={18} />
              Tulis Artikel Baru
              </Link>
              <Link 
                href="/admin/media" 
                className="btn btn-ghost w-full justify-start py-3"
              >
                <ImageIcon size={18} />
              Unggah Media
              </Link>
              {canSeeCategories && (
                <Link 
                  href="/admin/categories" 
                  className="btn btn-ghost w-full justify-start py-3"
                >
                  <List size={18} />
                Kelola Kategori
                </Link>
              )}
              {canSeePages && (
                <Link 
                  href="/admin/pages" 
                  className="btn btn-ghost w-full justify-start py-3"
                >
                  <FileText size={18} />
                Kelola Halaman
                </Link>
              )}
              {canSeeUsers && (
                <Link 
                  href="/admin/users" 
                  className="btn btn-ghost w-full justify-start py-3"
                >
                  <Users size={18} />
                Kelola Pengguna
                </Link>
              )}
              {canSeeAds && (
                <Link 
                  href="/admin/ads" 
                  className="btn btn-ghost w-full justify-start py-3"
                >
                  <Megaphone size={18} />
                Kelola Iklan
                </Link>
              )}
              {canSeeAppearanceAndTools && (
                <>
                  <Link 
                    href="/admin/appearance/global-styles" 
                    className="btn btn-ghost w-full justify-start py-3"
                  >
                    <Palette size={18} />
                  Atur Tampilan
                  </Link>
                  <Link 
                    href="/admin/tools/import" 
                    className="btn btn-ghost w-full justify-start py-3"
                  >
                    <Wrench size={18} />
                  Alat Import
                  </Link>
                </>
              )}
            </div>
          </div>

          {(role === "ADMIN" || role === "SUPER_ADMIN") ? (
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg mb-4 text-[var(--fg-primary)]">
              Status Sistem
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--fg-secondary)]">Status Server</span>
                <span className="badge bg-emerald-500/10 text-emerald-500">Aktif</span>
                </div>
                <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--fg-secondary)]">Basis Data</span>
                <span className="badge bg-emerald-500/10 text-emerald-500">Terhubung</span>
                </div>
                <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--fg-secondary)]">Versi</span>
                  <span className="text-xs font-mono text-[var(--fg-muted)]">v1.2.0</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6">
              <h3 className="font-display font-bold text-lg mb-4 text-[var(--fg-primary)]">
              Akses Anda
              </h3>
              <div className="space-y-3 text-sm text-[var(--fg-secondary)]">
                <div className="flex items-center justify-between">
                  <span>Peran</span>
                  <span className="badge bg-amber-500/10 text-[var(--accent)]">{role === "WRITER" ? "PENULIS" : "EDITOR"}</span>
                </div>
                <div className="text-xs text-[var(--fg-muted)]">
                  {role === "EDITOR"
                    ? "Anda dapat mereview dan mengelola konten, tanpa akses pengaturan sistem."
                    : "Anda dapat menulis dan mengelola artikel Anda sendiri."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
