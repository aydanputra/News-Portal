"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Eye, FileText, RefreshCw, TrendingUp } from "lucide-react";

type TrendGranularity = "day" | "week" | "month" | "year";

type LeaderItem = {
  id: string;
  name: string;
  views: number;
  totalViews: number;
  posts: number;
};

type AnalyticsResponse = {
  generatedAt: string;
  trackingMode: "realtime";
  range: {
    days: number;
    start: string;
    end: string;
  };
  summary: {
    totalViewsAllTime: number;
    viewsToday: number;
    viewsLast7Days: number;
    viewsLast30Days: number;
    viewsInRange: number;
    publishedPosts: number;
    avgViewsPerPost: number;
  };
  top: {
    authors: LeaderItem[];
    editors: LeaderItem[];
    categories: LeaderItem[];
    topics: LeaderItem[];
  };
  trend: Array<{
    day: string;
    views: number;
  }>;
  topPosts: Array<{
    id: string;
    title: string;
    slug: string;
    publishedAt: string | null;
    categoryName: string | null;
    categorySlug: string | null;
    totalViews: number;
    periodViews: number;
    todayViews: number;
  }>;
  topPages: Array<{
    id: string;
    pageType: string;
    path: string;
    title: string;
    totalViews: number;
    periodViews: number;
    todayViews: number;
  }>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(Number.isFinite(value) ? value : 0);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDay(value: Date) {
  return value.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function formatMonth(value: Date) {
  return value.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

function formatRangeLabel(days: number) {
  if (days === 1) return "Hari Ini";
  if (days === 365) return "1 Tahun";
  return `${days} Hari`;
}

function normalizePublicPath(path: string | null | undefined) {
  const value = String(path || "").trim();
  if (!value) return "/";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfWeek(date: Date) {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

function SectionCard({
  title,
  description,
  action,
  children,
  stackHeaderOnMobile = true,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  stackHeaderOnMobile?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
      <div className="border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
        <div
          className={`flex gap-3 ${stackHeaderOnMobile ? "flex-col sm:flex-row sm:items-end" : "flex-row items-center justify-between"} sm:justify-between`}
        >
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-[var(--fg-primary)]">{title}</h2>
            {description ? <p className="mt-1 text-xs leading-5 text-[var(--fg-muted)] sm:text-sm">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--fg-muted)]">{label}</div>
          <div className="mt-2 text-[26px] font-black leading-none text-[var(--fg-primary)]">{formatNumber(value)}</div>
        </div>
        <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-surface)] text-[var(--accent)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  className,
  compact = false,
  centered = false,
}: {
  label: string;
  value: string;
  className?: string;
  compact?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={`min-w-0 overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 ${
        centered ? "text-center" : ""
      } ${className || ""}`}
    >
      <div
        className={`break-words font-bold uppercase text-[var(--fg-muted)] ${
          compact ? "text-[10px] leading-[1.35] tracking-[0.12em]" : "text-[11px] leading-4 tracking-[0.18em]"
        }`}
      >
        {label}
      </div>
      <div className={`mt-1 break-words font-black text-[var(--fg-primary)] ${compact ? "text-base" : "text-lg"}`}>{value}</div>
    </div>
  );
}

function ListCard({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: Array<{ id: string; title: string; views: number; href?: string; meta?: string }>;
}) {
  return (
    <SectionCard title={title} description={description}>
      <div className="space-y-0">
        {items.length === 0 ? (
          <div className="text-sm text-[var(--fg-muted)]">Belum ada data.</div>
        ) : (
          <>
            <div className="grid grid-cols-[34px_minmax(0,1fr)_72px] items-center gap-2 rounded-t-[14px] border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fg-muted)] md:grid-cols-[52px_minmax(0,1fr)_110px] md:gap-3 md:px-4 md:py-3 md:text-[11px] md:tracking-[0.16em]">
              <div>NO</div>
              <div>Keterangan</div>
              <div className="text-right">Jumlah View</div>
            </div>
            {items.slice(0, 10).map((item, index) => {
              const rowClassName =
                "grid grid-cols-[34px_minmax(0,1fr)_72px] items-center gap-2 border-x border-b border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-2.5 md:grid-cols-[52px_minmax(0,1fr)_110px] md:gap-3 md:px-4 md:py-3";
              const numberBadge = (
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bg-surface)] text-[11px] font-black text-[var(--fg-primary)] md:h-8 md:w-8 md:rounded-xl md:text-xs">
                  {index + 1}
                </div>
              );
              const detail = (
                <div className="min-w-0">
                  <div className="line-clamp-1 text-[13px] font-bold leading-5 text-[var(--fg-primary)] transition-colors group-hover:text-[var(--accent)] md:text-sm md:leading-6">
                    {item.title}
                  </div>
                </div>
              );
              const views = <div className="text-right text-[12px] font-black text-[var(--fg-primary)] md:text-sm">{formatNumber(item.views)}</div>;

              if (!item.href) {
                return (
                  <div key={item.id} className={rowClassName}>
                    {numberBadge}
                    {detail}
                    {views}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`${rowClassName} group transition-colors hover:bg-[var(--bg-surface)]`}
                >
                  {numberBadge}
                  {detail}
                  {views}
                </Link>
              );
            })}
          </>
        )}
      </div>
    </SectionCard>
  );
}

function LeaderboardList({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: LeaderItem[];
}) {
  return (
    <SectionCard title={title} description={description}>
      <div className="space-y-0">
        {items.length === 0 ? (
          <div className="text-sm text-[var(--fg-muted)]">Belum ada data.</div>
        ) : (
          <>
            <div className="grid grid-cols-[34px_minmax(0,1fr)_72px] items-center gap-2 rounded-t-[14px] border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fg-muted)] md:grid-cols-[52px_minmax(0,1fr)_96px] md:gap-3 md:px-4 md:py-3 md:text-[11px] md:tracking-[0.16em]">
              <div>NO</div>
              <div>Keterangan</div>
              <div className="text-right">View</div>
            </div>
            {items.slice(0, 5).map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[34px_minmax(0,1fr)_72px] items-center gap-2 border-x border-b border-[var(--border)] bg-[var(--bg-elevated)] px-2.5 py-2.5 md:grid-cols-[52px_minmax(0,1fr)_96px] md:gap-3 md:px-4 md:py-3"
              >
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bg-surface)] text-[11px] font-black text-[var(--fg-primary)] md:h-8 md:w-8 md:rounded-xl md:text-xs">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="line-clamp-1 text-[13px] font-bold leading-5 text-[var(--fg-primary)] md:text-sm md:leading-6">{item.name}</div>
                </div>
                <div className="text-right text-[12px] font-black text-[var(--fg-primary)] md:text-sm">{formatNumber(item.views)}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </SectionCard>
  );
}

export default function AdminAnalyticsPage() {
  const [selectedDays, setSelectedDays] = useState<1 | 7 | 30 | 365>(7);
  const [granularity, setGranularity] = useState<TrendGranularity>("day");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (background = false) => {
      if (background) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await fetch(`/api/analytics/overview?days=${selectedDays}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || "Gagal memuat analytics");
        }
        setData(json);
        setError(null);
      } catch (err: any) {
        setError(err?.message || "Gagal memuat analytics");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedDays],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void load(true);
    }, 20000);
    return () => window.clearInterval(timer);
  }, [load]);

  const groupedTrend = useMemo(() => {
    const trend = data?.trend || [];
    const map = new Map<
      string,
      {
        key: string;
        label: string;
        fullLabel: string;
        views: number;
        start: Date;
      }
    >();

    for (const item of trend) {
      const date = new Date(`${item.day}T00:00:00`);
      if (Number.isNaN(date.getTime())) continue;

      let bucketStart = date;
      let key = item.day;
      let label = formatShortDay(date);
      let fullLabel = label;

      if (granularity === "week") {
        bucketStart = startOfWeek(date);
        const bucketEnd = endOfWeek(date);
        key = `week-${bucketStart.toISOString().slice(0, 10)}`;
        label = `${String(bucketStart.getDate()).padStart(2, "0")}-${String(bucketEnd.getDate()).padStart(2, "0")} ${bucketStart.toLocaleDateString("id-ID", { month: "short" })}`;
        fullLabel = `${formatShortDay(bucketStart)} - ${formatShortDay(bucketEnd)}`;
      } else if (granularity === "month") {
        bucketStart = startOfMonth(date);
        key = `month-${bucketStart.getFullYear()}-${bucketStart.getMonth() + 1}`;
        label = bucketStart.toLocaleDateString("id-ID", { month: "short" });
        fullLabel = formatMonth(bucketStart);
      } else if (granularity === "year") {
        bucketStart = startOfYear(date);
        key = `year-${bucketStart.getFullYear()}`;
        label = bucketStart.getFullYear().toString();
        fullLabel = `${bucketStart.getFullYear()}`;
      }

      const current = map.get(key) || {
        key,
        label,
        fullLabel,
        views: 0,
        start: bucketStart,
      };
      current.views += item.views;
      map.set(key, current);
    }

    const rows = [...map.values()].sort((a, b) => a.start.getTime() - b.start.getTime());
    const maxViews = rows.reduce((max, item) => Math.max(max, item.views), 0) || 1;

    return rows.map((item) => ({
      ...item,
      height: `${Math.max((item.views / maxViews) * 100, item.views > 0 ? 8 : 2)}%`,
    }));
  }, [data?.trend, granularity]);

  const chartMetaLabel = useMemo(() => {
    if (granularity === "day") return "Harian";
    if (granularity === "week") return "Mingguan";
    if (granularity === "month") return "Bulanan";
    return "Tahunan";
  }, [granularity]);

  const mobileTrendRows = useMemo(() => groupedTrend.slice(-8), [groupedTrend]);

  const mobileTrendMax = useMemo(() => {
    return mobileTrendRows.reduce((max, item) => Math.max(max, item.views), 0) || 1;
  }, [mobileTrendRows]);

  const mobileTrendAverage = useMemo(() => {
    if (mobileTrendRows.length === 0) return 0;
    const total = mobileTrendRows.reduce((sum, item) => sum + item.views, 0);
    return Math.round(total / mobileTrendRows.length);
  }, [mobileTrendRows]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[var(--bg-base)]">
        <div className="flex flex-col items-center gap-3 text-[var(--fg-muted)]">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <div className="text-sm font-medium">Memuat laporan realtime...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] p-4 md:p-6">
        <div className="rounded-[24px] border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
          <div className="text-base font-bold">Laporan gagal dimuat</div>
          <div className="mt-2 text-sm">{error || "Data analytics belum tersedia."}</div>
          <button type="button" onClick={() => void load(false)} className="btn btn-ghost mt-4 px-3 py-2 text-sm font-bold">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] p-3 pb-24 sm:p-4 md:p-6 md:pb-8 lg:p-8">
      <div className="mx-auto w-full max-w-[1360px] space-y-3.5">
        <section className="relative rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5">
          <button
            type="button"
            onClick={() => void load(true)}
            aria-label="Refresh laporan"
            className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--fg-primary)] shadow-sm md:hidden"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--fg-muted)]">
                <Activity className="h-3.5 w-3.5 text-[var(--accent)]" />
                Realtime Analytics
              </div>
              <h1 className="mt-3 text-[28px] font-black leading-tight text-[var(--fg-primary)]">Laporan & Analytics</h1>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--fg-muted)]">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2">
                  Terakhir diperbarui: <span className="font-bold text-[var(--fg-primary)]">{formatDateTime(data.generatedAt)}</span>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2">
                  Range aktif: <span className="font-bold text-[var(--fg-primary)]">{formatRangeLabel(selectedDays)}</span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[360px] lg:shrink-0">
              <button
                type="button"
                onClick={() => void load(true)}
                className="btn btn-ghost mt-3 !hidden w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] md:!inline-flex"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh Sekarang
              </button>

              <div className="mt-3 overflow-x-auto">
                <div className="flex min-w-max items-center justify-center gap-2 lg:justify-center">
                {[1, 7, 30, 365].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setSelectedDays(days as 1 | 7 | 30 | 365)}
                    className={`rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                      selectedDays === days
                        ? "bg-[var(--accent)] text-black"
                        : "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:bg-[var(--bg-base)]"
                    }`}
                  >
                    {formatRangeLabel(days)}
                  </button>
                ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="View Hari Ini" value={data.summary.viewsToday} icon={<Activity className="h-4 w-4" />} />
          <KpiCard label="View 7 Hari" value={data.summary.viewsLast7Days} icon={<TrendingUp className="h-4 w-4" />} />
          <KpiCard label="Total Semua View" value={data.summary.totalViewsAllTime} icon={<Eye className="h-4 w-4" />} />
          <KpiCard label="Artikel Terbit" value={data.summary.publishedPosts} icon={<FileText className="h-4 w-4" />} />
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.55fr)_300px]">
          <SectionCard
            title="Trend View"
            stackHeaderOnMobile={false}
            action={
              <div className="rounded-2xl bg-[var(--bg-surface)] p-1">
                <div className="grid grid-cols-4 gap-1 sm:flex sm:flex-wrap">
                {[
                  ["day", "Hr"],
                  ["week", "Mg"],
                  ["month", "Bl"],
                  ["year", "Th"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGranularity(value as TrendGranularity)}
                    className={`rounded-xl px-3 py-2 text-[11px] font-bold transition-colors ${
                      granularity === value
                        ? "bg-[var(--accent)] text-black"
                        : "bg-transparent text-[var(--fg-muted)] hover:bg-[var(--bg-base)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
                </div>
              </div>
            }
          >
            <div className="mb-4 hidden gap-3 sm:grid sm:grid-cols-3">
              <SummaryItem label="Mode Chart" value={chartMetaLabel} />
              <SummaryItem label="View Periode" value={formatNumber(data.summary.viewsInRange)} />
              <SummaryItem label="Rata-rata / Artikel" value={formatNumber(data.summary.avgViewsPerPost)} />
            </div>

            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-3 sm:p-4">
              <div className="sm:hidden">
                {mobileTrendRows.length === 0 ? (
                  <div className="flex h-[220px] items-center justify-center text-sm text-[var(--fg-muted)]">
                    Belum ada view realtime pada periode ini.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <div className="flex h-[250px] min-w-[320px] items-end gap-3 border-b border-[var(--border)] px-1 pb-2">
                      {mobileTrendRows.map((bar) => {
                        const height = `${Math.max((bar.views / mobileTrendMax) * 100, bar.views > 0 ? 10 : 3)}%`;
                        return (
                          <div key={bar.key} className="flex h-full min-w-[38px] flex-1 flex-col justify-end gap-3">
                            <div className="flex flex-1 items-end">
                              <div className="w-full rounded-t-[10px] bg-[var(--accent)] shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)]" style={{ height }} />
                            </div>
                            <div className="line-clamp-1 text-center text-[10px] font-medium leading-4 text-[var(--fg-muted)]">
                              {bar.label}
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <SummaryItem
                        label="Total Rentang"
                        value={formatNumber(data.summary.viewsInRange)}
                        className="bg-white"
                        compact
                        centered
                      />
                      <SummaryItem
                        label="Rata Periode"
                        value={formatNumber(mobileTrendAverage)}
                        className="bg-white"
                        compact
                        centered
                      />
                      <SummaryItem
                        label="Rata Artikel"
                        value={formatNumber(data.summary.avgViewsPerPost)}
                        className="bg-white"
                        compact
                        centered
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="hidden overflow-x-auto sm:block">
                {groupedTrend.length === 0 ? (
                  <div className="flex h-[260px] items-center justify-center text-sm text-[var(--fg-muted)]">
                    Belum ada view realtime pada periode ini.
                  </div>
                ) : (
                  <div className="flex h-[300px] min-w-[640px] items-end gap-3">
                    {groupedTrend.map((bar) => (
                      <div key={bar.key} className="flex h-full min-w-[44px] flex-1 flex-col justify-end gap-2">
                        <div className="flex flex-1 items-end">
                          <div className="w-full rounded-t-[10px] bg-[var(--accent)]" style={{ height: bar.height }} />
                        </div>
                        <div className="line-clamp-2 text-center text-[11px] font-medium leading-4 text-[var(--fg-muted)]">{bar.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <div className="hidden gap-3 xl:grid">
            <SectionCard title="Ringkasan Cepat">
              <div className="grid gap-3">
                <SummaryItem label="Range Aktif" value={formatNumber(data.summary.viewsInRange)} />
                <SummaryItem label="View 30 Hari" value={formatNumber(data.summary.viewsLast30Days)} />
                <SummaryItem label="Tracking" value="Realtime aktif" />
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          <ListCard
            title="Artikel Teratas"
            items={data.topPosts.map((post) => ({
              id: post.id,
              title: post.title,
              views: post.periodViews,
              href: post.slug ? `/${post.categorySlug || "berita"}/${post.slug}` : undefined,
            }))}
          />

          <ListCard
            title="Halaman Publik Teratas"
            items={data.topPages.map((page) => ({
              id: page.id,
              title: page.title,
              views: page.periodViews,
              href: normalizePublicPath(page.path),
            }))}
          />
        </div>

        <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-4">
          <LeaderboardList title="Top Penulis" items={data.top.authors} />
          <LeaderboardList title="Top Editor" items={data.top.editors} />
          <LeaderboardList title="Top Kategori" items={data.top.categories} />
          <LeaderboardList title="Top Topik" items={data.top.topics} />
        </div>
      </div>
    </div>
  );
}
