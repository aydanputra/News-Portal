"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, RefreshCw } from "lucide-react";

type AnalyticsResponse = {
  range: { days: number; start: string; end: string };
  snapshot: {
    startDay: string;
    endDay: string;
    expectedDays: number;
    availableDays: number;
    missingDays: string[];
  };
  kpis: {
    totalViews: number;
    totalPublished: number;
    avgViewsPerPost: number;
    totalComments: number;
    backlog: { draft: number; inReview: number; rejected: number; scheduled: number };
    topCategory: { id: string; name: string; viewsTotal: number } | null;
    topAuthor: { id: string; name: string; viewsTotal: number } | null;
    topEditor: { id: string; name: string; viewsTotal: number } | null;
  };
  trends: { dailyViews: { day: string; views: number }[] };
  top: {
    posts: Array<{
      id: string;
      title: string;
      publishedAt: string | null;
      viewsTotal: number;
      authorName: string | null;
      categoryName: string | null;
      editorName: string | null;
    }>;
    authors: Array<{ id: string; name: string; posts: number; viewsTotal: number }>;
    editors: Array<{
      id: string;
      name: string;
      posts: number;
      viewsTotal: number;
      avgHoursToPublish: number | null;
      avgReviewHours?: number | null;
    }>;
    categories: Array<{ id: string; name: string; posts: number; viewsTotal: number }>;
  };
  people: {
    writers: Array<{
      id: string;
      name: string;
      posts: number;
      viewsTotal: number;
      avgViewsPerPost: number;
      avgHoursToPublish: number | null;
    }>;
    editors: Array<{
      id: string;
      name: string;
      posts: number;
      viewsTotal: number;
      avgViewsPerPost: number;
      avgHoursToPublish: number | null;
      avgReviewHours: number | null;
      assignedInReview: number;
      assignedInReviewStale: number;
    }>;
  };
};

function formatNumber(n: any) {
  const x = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("id-ID").format(x);
}

function formatDateTime(value: any) {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatHours(value: any) {
  const x = typeof value === "number" && Number.isFinite(value) ? value : null;
  if (x === null) return "-";
  if (x < 1) return `${Math.round(x * 60)} mnt`;
  return `${Math.round(x)} jam`;
}

export default function AdminAnalyticsPage() {
  const [mode, setMode] = useState<"preset" | "custom">("preset");
  const [presetDays, setPresetDays] = useState<7 | 30>(30);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshotRunning, setSnapshotRunning] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  const toDateOnly = (d: Date) => {
    const x = new Date(d);
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const day = String(x.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    const today = new Date();
    setEndDate(toDateOnly(today));
    setStartDate(toDateOnly(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (presetDays - 1))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetDays]);

  const maxTrend = useMemo(() => {
    const values = (data?.trends?.dailyViews || []).map((d) => d.views);
    const max = values.length ? Math.max(...values) : 0;
    return max > 0 ? max : 1;
  }, [data?.trends?.dailyViews]);

  const load = async () => {
    setLoading(true);
    setError(null);
    setSnapshotError(null);
    try {
      const query =
        mode === "custom" && startDate && endDate
          ? `start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`
          : `days=${presetDays}`;
      const res = await fetch(`/api/analytics/overview?${query}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Gagal memuat analytics");
        setData(null);
      } else {
        setData(json);
      }
    } catch {
      setError("Gagal memuat analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const runSnapshot = async () => {
    setSnapshotRunning(true);
    setSnapshotError(null);
    try {
      const res = await fetch("/api/analytics/snapshot/run", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setSnapshotError(json?.error || "Gagal menjalankan snapshot");
      } else {
        await load();
      }
    } catch {
      setSnapshotError("Gagal menjalankan snapshot");
    } finally {
      setSnapshotRunning(false);
    }
  };

  useEffect(() => {
    if (mode === "preset") {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, presetDays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-3 text-[var(--fg-muted)]">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium">Memuat analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen">
        <div className="card p-6 border border-red-200 bg-red-50 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen">Gagal memuat data.</div>;
  }

  const k = data.kpis;
  const missingDays = Array.isArray(data.snapshot?.missingDays) ? data.snapshot.missingDays : [];

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[var(--accent)]" />
            Laporan & Analytics
          </h1>
          <p className="text-[var(--fg-secondary)] mt-1 font-medium">
            Periode: {new Date(data.range.start).toLocaleDateString("id-ID")} – {new Date(data.range.end).toLocaleDateString("id-ID")} ({data.range.days} hari)
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl p-1 flex">
            <button
              type="button"
              onClick={() => {
                setMode("preset");
                setPresetDays(7);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                mode === "preset" && presetDays === 7
                  ? "bg-[var(--accent)] text-black"
                  : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              7 Hari
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("preset");
                setPresetDays(30);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                mode === "preset" && presetDays === 30
                  ? "bg-[var(--accent)] text-black"
                  : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface)]"
              }`}
            >
              30 Hari
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-2">
            <div className="text-xs font-bold text-[var(--fg-muted)]">Custom</div>
            <input
              type="date"
              className="bg-transparent text-sm text-[var(--fg-primary)] outline-none"
              value={startDate}
              onChange={(e) => {
                setMode("custom");
                setStartDate(e.target.value);
              }}
            />
            <span className="text-[var(--fg-muted)] text-sm">–</span>
            <input
              type="date"
              className="bg-transparent text-sm text-[var(--fg-primary)] outline-none"
              value={endDate}
              onChange={(e) => {
                setMode("custom");
                setEndDate(e.target.value);
              }}
            />
            <button type="button" onClick={load} className="btn btn-ghost px-3 py-1.5 text-xs font-bold">
              Terapkan
            </button>
          </div>

          <button type="button" onClick={load} className="btn btn-ghost p-2" title="Refresh">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {(missingDays.length > 0 || snapshotError) && (
        <div className="card p-4 mb-6 border border-amber-200 bg-amber-50 text-amber-900">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-sm font-semibold">
              {snapshotError
                ? snapshotError
                : `Data snapshot belum lengkap (${data.snapshot.availableDays}/${data.snapshot.expectedDays} hari). Grafik & ranking bisa belum akurat.`}
            </div>
            <button type="button" onClick={runSnapshot} disabled={snapshotRunning} className="btn btn-ghost">
              {snapshotRunning ? "Menjalankan Snapshot..." : "Ambil Snapshot Hari Ini"}
            </button>
          </div>
          {missingDays.length > 0 && (
            <div className="text-xs mt-2 opacity-80">
              Hari snapshot hilang: {missingDays.slice(0, 8).join(", ")}
              {missingDays.length > 8 ? ` (+${missingDays.length - 8} lainnya)` : ""}
            </div>
          )}
        </div>
      )}

      <div className="md:hidden card p-4 mb-6">
        <div className="text-xs font-bold text-[var(--fg-muted)] mb-2">Custom Periode</div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="input flex-1 text-sm"
            value={startDate}
            onChange={(e) => {
              setMode("custom");
              setStartDate(e.target.value);
            }}
          />
          <input
            type="date"
            className="input flex-1 text-sm"
            value={endDate}
            onChange={(e) => {
              setMode("custom");
              setEndDate(e.target.value);
            }}
          />
        </div>
        <button type="button" onClick={load} className="btn btn-primary w-full mt-3">
          Terapkan
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">Total Views</div>
          <div className="mt-2 text-2xl font-black text-[var(--fg-primary)]">{formatNumber(k.totalViews)}</div>
          <div className="mt-2 text-xs text-[var(--fg-muted)]">Periode {data.range.days} hari</div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">Artikel Terbit</div>
          <div className="mt-2 text-2xl font-black text-[var(--fg-primary)]">{formatNumber(k.totalPublished)}</div>
          <div className="mt-2 text-xs text-[var(--fg-muted)]">Periode {data.range.days} hari</div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">Rata-rata Views</div>
          <div className="mt-2 text-2xl font-black text-[var(--fg-primary)]">{formatNumber(k.avgViewsPerPost)}</div>
          <div className="mt-2 text-xs text-[var(--fg-muted)]">Per artikel terbit</div>
        </div>
        <div className="card p-5">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">Komentar</div>
          <div className="mt-2 text-2xl font-black text-[var(--fg-primary)]">{formatNumber(k.totalComments)}</div>
          <div className="mt-2 text-xs text-[var(--fg-muted)]">Periode {data.range.days} hari</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-black text-[var(--fg-primary)]">Trend Views Harian</div>
              <div className="text-xs text-[var(--fg-muted)]">Kenaikan views per hari (berdasarkan snapshot)</div>
            </div>
            <div className="text-xs text-[var(--fg-muted)]">{formatNumber(k.totalViews)} views</div>
          </div>

          <div className="h-24 flex items-end gap-1">
            {data.trends.dailyViews.map((d) => {
              const h = Math.max(2, Math.round((d.views / maxTrend) * 96));
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-[var(--accent)]/80 rounded-t" style={{ height: `${h}px` }} />
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-[var(--fg-muted)]">
            <span>{data.trends.dailyViews[0]?.day || ""}</span>
            <span>{data.trends.dailyViews[data.trends.dailyViews.length - 1]?.day || ""}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6">
            <div className="text-sm font-black text-[var(--fg-primary)] mb-3">Ringkasan Leader</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">Top Kategori</span>
                <span className="font-bold text-[var(--fg-primary)]">{k.topCategory?.name || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">Top Penulis</span>
                <span className="font-bold text-[var(--fg-primary)]">{k.topAuthor?.name || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--fg-muted)]">Top Editor</span>
                <span className="font-bold text-[var(--fg-primary)]">{k.topEditor?.name || "-"}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="text-sm font-black text-[var(--fg-primary)] mb-3">Backlog Editorial</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3">
                <div className="text-xs text-[var(--fg-muted)] font-bold">DRAFT</div>
                <div className="text-lg font-black text-[var(--fg-primary)]">{formatNumber(k.backlog.draft)}</div>
              </div>
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3">
                <div className="text-xs text-[var(--fg-muted)] font-bold">IN_REVIEW</div>
                <div className="text-lg font-black text-[var(--fg-primary)]">{formatNumber(k.backlog.inReview)}</div>
              </div>
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3">
                <div className="text-xs text-[var(--fg-muted)] font-bold">REJECTED</div>
                <div className="text-lg font-black text-[var(--fg-primary)]">{formatNumber(k.backlog.rejected)}</div>
              </div>
              <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3">
                <div className="text-xs text-[var(--fg-muted)] font-bold">SCHEDULED</div>
                <div className="text-lg font-black text-[var(--fg-primary)]">{formatNumber(k.backlog.scheduled)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
            <div className="font-display text-lg font-bold text-[var(--fg-primary)]">Top Artikel</div>
            <div className="text-xs text-[var(--fg-muted)]">Diurutkan berdasarkan kenaikan views pada periode</div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {data.top.posts.length === 0 ? (
              <div className="p-6 text-sm text-[var(--fg-muted)]">Belum ada data artikel terbit di periode ini.</div>
            ) : (
              data.top.posts.map((p) => (
                <div key={p.id} className="p-5 hover:bg-[var(--bg-surface)] transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link href={`/admin/posts/${p.id}/edit`} className="font-bold text-[var(--fg-primary)] hover:text-[var(--accent)] line-clamp-1">
                        {p.title}
                      </Link>
                      <div className="text-xs text-[var(--fg-muted)] mt-1">
                        {p.categoryName || "-"} • {p.authorName || "-"} {p.editorName ? `• Editor: ${p.editorName}` : ""} • {formatDateTime(p.publishedAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-[var(--fg-primary)]">{formatNumber(p.viewsTotal)}</div>
                      <div className="text-[10px] text-[var(--fg-muted)]">views (periode)</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
              <div className="font-display text-lg font-bold text-[var(--fg-primary)]">Top Penulis</div>
              <div className="text-xs text-[var(--fg-muted)]">Berdasarkan kenaikan views pada periode</div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {data.top.authors.length === 0 ? (
                <div className="p-6 text-sm text-[var(--fg-muted)]">Belum ada data.</div>
              ) : (
                data.top.authors.map((a) => (
                  <div key={a.id} className="p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--fg-primary)] truncate">{a.name}</div>
                      <div className="text-xs text-[var(--fg-muted)]">{formatNumber(a.posts)} artikel terbit</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-[var(--fg-primary)]">{formatNumber(a.viewsTotal)}</div>
                      <div className="text-[10px] text-[var(--fg-muted)]">views (periode)</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
              <div className="font-display text-lg font-bold text-[var(--fg-primary)]">Top Editor</div>
              <div className="text-xs text-[var(--fg-muted)]">Berdasarkan kenaikan views artikel yang dipublish pada periode</div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {data.top.editors.length === 0 ? (
                <div className="p-6 text-sm text-[var(--fg-muted)]">Belum ada data.</div>
              ) : (
                data.top.editors.map((e) => (
                  <div key={e.id} className="p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--fg-primary)] truncate">{e.name}</div>
                      <div className="text-xs text-[var(--fg-muted)]">
                        {formatNumber(e.posts)} publish{typeof e.avgHoursToPublish === "number" && Number.isFinite(e.avgHoursToPublish) ? ` • Avg ${Math.round(e.avgHoursToPublish)} jam` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-[var(--fg-primary)]">{formatNumber(e.viewsTotal)}</div>
                      <div className="text-[10px] text-[var(--fg-muted)]">views (periode)</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
              <div className="font-display text-lg font-bold text-[var(--fg-primary)]">Top Kategori</div>
              <div className="text-xs text-[var(--fg-muted)]">Berdasarkan kenaikan views pada periode</div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {data.top.categories.length === 0 ? (
                <div className="p-6 text-sm text-[var(--fg-muted)]">Belum ada data.</div>
              ) : (
                data.top.categories.map((c) => (
                  <div key={c.id} className="p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--fg-primary)] truncate">{c.name}</div>
                      <div className="text-xs text-[var(--fg-muted)]">{formatNumber(c.posts)} artikel terbit</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-[var(--fg-primary)]">{formatNumber(c.viewsTotal)}</div>
                      <div className="text-[10px] text-[var(--fg-muted)]">views (periode)</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
            <div className="font-display text-lg font-bold text-[var(--fg-primary)]">Performa Penulis</div>
            <div className="text-xs text-[var(--fg-muted)]">Berdasarkan artikel terbit pada periode ini</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
                <tr className="text-left text-[var(--fg-muted)]">
                  <th className="px-6 py-3 font-bold">Penulis</th>
                  <th className="px-4 py-3 font-bold">Artikel</th>
                  <th className="px-4 py-3 font-bold">Views</th>
                  <th className="px-4 py-3 font-bold">Avg/Artikel</th>
                  <th className="px-4 py-3 font-bold">Dibuat→Terbit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(data.people?.writers || []).length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-[var(--fg-muted)]" colSpan={5}>
                      Belum ada data penulis di periode ini.
                    </td>
                  </tr>
                ) : (
                  data.people.writers.map((w) => (
                    <tr key={w.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                      <td className="px-6 py-4 font-bold text-[var(--fg-primary)]">{w.name}</td>
                      <td className="px-4 py-4 text-[var(--fg-secondary)]">{formatNumber(w.posts)}</td>
                      <td className="px-4 py-4 text-[var(--fg-secondary)]">{formatNumber(w.viewsTotal)}</td>
                      <td className="px-4 py-4 text-[var(--fg-secondary)]">{formatNumber(w.avgViewsPerPost)}</td>
                      <td className="px-4 py-4 text-[var(--fg-secondary)]">{formatHours(w.avgHoursToPublish)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
            <div className="font-display text-lg font-bold text-[var(--fg-primary)]">Performa Editor</div>
            <div className="text-xs text-[var(--fg-muted)]">Plus backlog assignment (IN_REVIEW) saat ini</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
                <tr className="text-left text-[var(--fg-muted)]">
                  <th className="px-6 py-3 font-bold">Editor</th>
                  <th className="px-4 py-3 font-bold">Publish</th>
                  <th className="px-4 py-3 font-bold">Views</th>
                  <th className="px-4 py-3 font-bold">Avg/Publish</th>
                  <th className="px-4 py-3 font-bold">Review SLA</th>
                  <th className="px-4 py-3 font-bold">Dibuat→Terbit</th>
                  <th className="px-4 py-3 font-bold">Assigned</th>
                  <th className="px-4 py-3 font-bold">&gt;24j</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(data.people?.editors || []).length === 0 ? (
                  <tr>
                    <td className="px-6 py-6 text-[var(--fg-muted)]" colSpan={8}>
                      Belum ada data editor di periode ini.
                    </td>
                  </tr>
                ) : (
                  data.people.editors.map((e) => (
                    <tr key={e.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                      <td className="px-6 py-4 font-bold text-[var(--fg-primary)]">{e.name}</td>
                      <td className="px-4 py-4 text-[var(--fg-secondary)]">{formatNumber(e.posts)}</td>
                      <td className="px-4 py-4 text-[var(--fg-secondary)]">{formatNumber(e.viewsTotal)}</td>
                      <td className="px-4 py-4 text-[var(--fg-secondary)]">{formatNumber(e.avgViewsPerPost)}</td>
                      <td className="px-4 py-4 text-[var(--fg-secondary)]">{formatHours(e.avgReviewHours)}</td>
                      <td className="px-4 py-4 text-[var(--fg-secondary)]">{formatHours(e.avgHoursToPublish)}</td>
                      <td className="px-4 py-4 text-[var(--fg-secondary)]">{formatNumber(e.assignedInReview)}</td>
                      <td className="px-4 py-4 text-[var(--fg-secondary)]">{formatNumber(e.assignedInReviewStale)}</td>
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
