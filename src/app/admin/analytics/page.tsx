"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, CalendarRange, ChevronDown, Eye, FileText, RefreshCw, TrendingUp } from "lucide-react";

type TrendGranularity = "day" | "week" | "month" | "year";

type ProductivityRange = "day" | "week" | "month";

type ProductivityMonthly = {
  articles: number;
  views: number;
};

type ProductivityAuthor = {
  id: string;
  name: string;
  articles: number;
  views: number;
  monthly: Record<string, ProductivityMonthly>;
};

type ProductivityMonth = {
  key: string;
  label: string;
};

type ProductivityWriter = {
  id: string;
  name: string;
};

type ProductivitySeriesItem = {
  key: string;
  label: string;
  articles: number;
  views: number;
};

type ProductivityResponse = {
  start: string;
  end: string;
  totalArticles: number;
  totalViews: number;
  months: ProductivityMonth[];
  authors: ProductivityAuthor[];
  writers: ProductivityWriter[];
  series?: ProductivitySeriesItem[];
};

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

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number.isFinite(value) ? value : 0);
}

const MONTH_OPTIONS = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

function buildYearOptions(count = 6) {
  const current = new Date().getFullYear();
  const options: { value: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const year = current - i;
    options.push({ value: String(year), label: String(year) });
  }
  return options;
}

function formatTrendDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "-";
  const startStr = s.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const endStr = e.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  return `${startStr} - ${endStr}`;
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

function toLocalIsoDay(value: Date) {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysLocal(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function addMonthsLocal(value: Date, months: number) {
  const date = new Date(value);
  date.setMonth(date.getMonth() + months);
  return date;
}

function addYearsLocal(value: Date, years: number) {
  const date = new Date(value);
  date.setFullYear(date.getFullYear() + years);
  return date;
}

type DateRangePreset = {
  id: string;
  label: string;
  compute: (today: Date) => { start: Date; end: Date };
};

const DATE_RANGE_PRESETS: DateRangePreset[] = [
  { id: "today", label: "Hari ini", compute: (t) => ({ start: t, end: t }) },
  { id: "last7", label: "7 hari terakhir", compute: (t) => ({ start: addDaysLocal(t, -6), end: t }) },
  { id: "last30", label: "30 Hari Terakhir", compute: (t) => ({ start: addDaysLocal(t, -29), end: t }) },
  { id: "monthToDate", label: "Awal bulan hingga saat ini", compute: (t) => ({ start: startOfMonth(t), end: t }) },
  { id: "last12", label: "12 bulan terakhir", compute: (t) => ({ start: addMonthsLocal(t, -12), end: t }) },
  { id: "yearToDate", label: "Awal tahun hingga saat ini", compute: (t) => ({ start: startOfYear(t), end: t }) },
  { id: "last3y", label: "3 tahun terakhir", compute: (t) => ({ start: addYearsLocal(t, -3), end: t }) },
];

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
  const [rangeStart, setRangeStart] = useState<string>(() => toLocalIsoDay(addDaysLocal(new Date(), -6)));
  const [rangeEnd, setRangeEnd] = useState<string>(() => toLocalIsoDay(new Date()));
  const [rangeOpen, setRangeOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(rangeStart);
  const [draftEnd, setDraftEnd] = useState(rangeEnd);
  const [granularity, setGranularity] = useState<TrendGranularity>("day");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productivityYear, setProductivityYear] = useState<string>(() => String(new Date().getFullYear()));
  const [productivityMonth, setProductivityMonth] = useState<string>(() => String(new Date().getMonth() + 1));
  const [productivityAuthor, setProductivityAuthor] = useState<string>("");
  const [productivityRange, setProductivityRange] = useState<ProductivityRange>("day");
  const [productivity, setProductivity] = useState<ProductivityResponse | null>(null);
  const [productivityLoading, setProductivityLoading] = useState(false);

  const applyRange = useCallback((start: string, end: string) => {
    setRangeStart(start);
    setRangeEnd(end);
    setDraftStart(start);
    setDraftEnd(end);
    setRangeOpen(false);
  }, []);

  const load = useCallback(
    async (background = false) => {
      if (background) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await fetch(`/api/analytics/overview?start=${rangeStart}&end=${rangeEnd}`, {
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
    [rangeStart, rangeEnd],
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

  const loadProductivity = useCallback(async () => {
    setProductivityLoading(true);
    try {
      const params = new URLSearchParams({
        year: productivityYear,
        month: productivityMonth,
      });
      if (productivityAuthor) {
        params.set("author", productivityAuthor);
        params.set("range", productivityRange);
      }

      const res = await fetch(`/api/analytics/productivity?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Gagal memuat produktivitas");
      }
      setProductivity(json);
    } catch {
      // Biarkan data sebelumnya tetap tampil; tidak perlu banner error global.
    } finally {
      setProductivityLoading(false);
    }
  }, [productivityYear, productivityMonth, productivityAuthor, productivityRange]);

  useEffect(() => {
    void loadProductivity();
  }, [loadProductivity]);

  const topProductivityAuthors = useMemo(() => (productivity?.authors ?? []).slice(0, 10), [productivity]);
  const maxProductivityViews = useMemo(
    () => Math.max(1, ...topProductivityAuthors.map((author) => author.views)),
    [topProductivityAuthors],
  );

  const productivitySeries = useMemo(() => productivity?.series ?? [], [productivity]);
  const maxProductivitySeriesViews = useMemo(
    () => Math.max(1, ...productivitySeries.map((item) => item.views)),
    [productivitySeries],
  );

  const isSingleProductivityAuthor = productivityAuthor !== "";
  const showProductivitySeries = isSingleProductivityAuthor && productivitySeries.length > 0;
  const productivityChartMax = showProductivitySeries ? maxProductivitySeriesViews : maxProductivityViews;
  const productivityRangeLabel =
    productivityRange === "day" ? "Harian" : productivityRange === "week" ? "Mingguan" : "Bulanan";

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

  const chartMaxViews = useMemo(() => {
    return groupedTrend.reduce((max, item) => Math.max(max, item.views), 0) || 1;
  }, [groupedTrend]);

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
                  Range aktif: <span className="font-bold text-[var(--fg-primary)]">{formatTrendDateRange(data.range.start, data.range.end)}</span>
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

              <div className="relative mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setDraftStart(rangeStart);
                    setDraftEnd(rangeEnd);
                    setRangeOpen((value) => !value);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-bold text-[var(--fg-primary)] transition-colors hover:bg-[var(--bg-base)]"
                >
                  <span className="inline-flex items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-[var(--accent)]" />
                    {formatTrendDateRange(rangeStart, rangeEnd)}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[var(--fg-muted)] transition-transform ${rangeOpen ? "rotate-180" : ""}`} />
                </button>

                {rangeOpen ? (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setRangeOpen(false)} />
                    <div className="absolute right-0 top-full z-30 mt-2 w-full min-w-[300px] max-w-[360px] overflow-hidden rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[0_12px_40px_rgba(15,23,42,0.16)]">
                      <div className="border-b border-[var(--border)] px-4 py-3">
                        <div className="text-sm font-bold text-[var(--fg-primary)]">Date Range</div>
                        <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--fg-muted)]">Start and End Dates</div>
                      </div>

                      <div className="space-y-3 px-4 py-4">
                        <div className="grid grid-cols-2 gap-2">
                          <label className="block">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fg-muted)]">Dari</span>
                            <input
                              type="date"
                              value={draftStart}
                              max={draftEnd}
                              onChange={(event) => setDraftStart(event.target.value)}
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-2 text-sm font-semibold text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--fg-muted)]">ke</span>
                            <input
                              type="date"
                              value={draftEnd}
                              min={draftStart}
                              onChange={(event) => setDraftEnd(event.target.value)}
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-2 text-sm font-semibold text-[var(--fg-primary)] outline-none focus:border-[var(--accent)]"
                            />
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setRangeOpen(false)}
                            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm font-bold text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-base)]"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            disabled={!draftStart || !draftEnd || draftStart > draftEnd}
                            onClick={() => applyRange(draftStart, draftEnd)}
                            className="flex-1 rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Terapkan
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2">
                        {DATE_RANGE_PRESETS.map((preset) => {
                          const { start, end } = preset.compute(new Date());
                          const active = toLocalIsoDay(start) === rangeStart && toLocalIsoDay(end) === rangeEnd;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                const today = new Date();
                                const computed = preset.compute(today);
                                applyRange(toLocalIsoDay(computed.start), toLocalIsoDay(computed.end));
                              }}
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-semibold transition-colors ${
                                active ? "bg-[var(--bg-base)] text-[var(--accent)]" : "text-[var(--fg-primary)] hover:bg-[var(--bg-base)]"
                              }`}
                            >
                              <span>{preset.label}</span>
                              {active ? <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : null}
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
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="text-[11px] font-semibold text-[var(--fg-muted)]">
                        {formatTrendDateRange(data.range.start, data.range.end)}
                      </div>
                      <div className="text-[11px] font-bold text-[var(--fg-muted)]">Views</div>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="flex h-[250px] min-w-[320px] items-end gap-3 border-b border-[var(--border)] px-1 pb-2">
                      {mobileTrendRows.map((bar) => {
                        const height = `${Math.max((bar.views / mobileTrendMax) * 100, bar.views > 0 ? 10 : 3)}%`;
                        return (
                          <div key={bar.key} className="flex h-full min-w-[38px] flex-1 flex-col justify-end gap-3">
                            <div className="relative flex flex-1 items-end">
                              <div
                                className="w-full rounded-t-[10px] bg-[var(--accent)] shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)]"
                                style={{ height }}
                                title={`${bar.fullLabel} — ${formatNumber(bar.views)} views`}
                              >
                                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[var(--fg-muted)]">
                                  {formatCompactNumber(bar.views)}
                                </span>
                              </div>
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

              <div className="hidden sm:block">
                {groupedTrend.length === 0 ? (
                  <div className="flex h-[260px] items-center justify-center text-sm text-[var(--fg-muted)]">
                    Belum ada view realtime pada periode ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[640px]">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="text-xs font-semibold text-[var(--fg-muted)]">
                          {formatTrendDateRange(data.range.start, data.range.end)}
                        </div>
                        <div className="text-xs font-bold text-[var(--fg-muted)]">Views</div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex h-[300px] w-12 shrink-0 flex-col justify-between py-0.5 text-right text-[10px] font-semibold text-[var(--fg-muted)]">
                          <span>{formatCompactNumber(chartMaxViews)}</span>
                          <span>{formatCompactNumber(chartMaxViews / 2)}</span>
                          <span>0</span>
                        </div>
                        <div className="relative flex-1">
                          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                            <div className="border-t border-dashed border-[var(--border)]" />
                            <div className="border-t border-dashed border-[var(--border)]" />
                            <div className="border-t border-[var(--border)]" />
                          </div>
                          <div className="relative flex h-[300px] items-end gap-3">
                            {groupedTrend.map((bar) => {
                              const pct = `${Math.max((bar.views / chartMaxViews) * 100, bar.views > 0 ? 3 : 1)}%`;
                              return (
                                <div key={bar.key} className="flex h-full min-w-[44px] flex-1 flex-col justify-end gap-2">
                                  <div className="relative flex flex-1 items-end">
                                    <div
                                      className="w-full rounded-t-[10px] bg-[var(--accent)] shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)] transition-opacity hover:opacity-80"
                                      style={{ height: pct }}
                                      title={`${bar.fullLabel} — ${formatNumber(bar.views)} views`}
                                    >
                                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[var(--fg-muted)]">
                                        {formatCompactNumber(bar.views)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="line-clamp-2 text-center text-[11px] font-medium leading-4 text-[var(--fg-muted)]">{bar.label}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
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

        <SectionCard
          title="Monitoring Produktivitas Wartawan"
          description={`Rekap artikel & view per penulis · ${formatTrendDateRange(
            productivity?.start ?? data.range.start,
            productivity?.end ?? data.range.end,
          )}`}
          action={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              <div className="relative w-full sm:w-auto">
                <select
                  value={productivityYear}
                  onChange={(event) => setProductivityYear(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 pr-9 text-[12px] font-bold text-[var(--fg-primary)] outline-none transition-colors hover:border-[var(--accent)] focus:border-[var(--accent)] sm:w-auto"
                >
                  {buildYearOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              </div>

              <div className="relative w-full sm:w-auto">
                <select
                  value={productivityMonth}
                  onChange={(event) => setProductivityMonth(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 pr-9 text-[12px] font-bold text-[var(--fg-primary)] outline-none transition-colors hover:border-[var(--accent)] focus:border-[var(--accent)] sm:w-auto"
                >
                  {MONTH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              </div>

              <div className="relative w-full sm:w-auto">
                <select
                  value={productivityAuthor}
                  onChange={(event) => setProductivityAuthor(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2 pr-9 text-[12px] font-bold text-[var(--fg-primary)] outline-none transition-colors hover:border-[var(--accent)] focus:border-[var(--accent)] sm:w-auto"
                >
                  <option value="">Semua Wartawan</option>
                  {productivity?.writers.map((writer) => (
                    <option key={writer.id} value={writer.id}>
                      {writer.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-muted)]" />
              </div>
            </div>
          }
        >
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <SummaryItem label="Jumlah Penulis" value={formatNumber(productivity?.authors.length ?? 0)} />
            <SummaryItem label="Total Artikel" value={formatNumber(productivity?.totalArticles ?? 0)} />
            <SummaryItem label="Total View" value={formatNumber(productivity?.totalViews ?? 0)} />
          </div>

          {productivityLoading && !productivity ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            </div>
          ) : !productivity || productivity.authors.length === 0 ? (
            <div className="text-sm text-[var(--fg-muted)]">Belum ada data produktivitas pada rentang ini.</div>
          ) : (
            <>
              <div className="overflow-hidden rounded-[14px] border border-[var(--border)]">
                <div className="grid grid-cols-[44px_1fr_88px_96px] items-center border-b border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fg-muted)] md:grid-cols-[56px_1fr_120px_120px] md:px-4 md:text-[11px]">
                  <div>No</div>
                  <div>Penulis</div>
                  <div className="text-right">Artikel</div>
                  <div className="text-right">View</div>
                </div>
                {productivity.authors.map((author, index) => (
                  <div
                    key={author.id}
                    className="grid grid-cols-[44px_1fr_88px_96px] items-center border-b border-[var(--border)] px-3 py-2.5 last:border-b-0 md:grid-cols-[56px_1fr_120px_120px] md:px-4"
                  >
                    <div className="text-[12px] font-semibold text-[var(--fg-muted)]">{index + 1}</div>
                    <div className="truncate pr-2 text-[13px] font-bold text-[var(--fg-primary)] md:text-sm">{author.name}</div>
                    <div className="text-right text-[13px] font-bold text-[var(--fg-primary)] md:text-sm">{formatNumber(author.articles)}</div>
                    <div className="text-right text-[13px] font-semibold text-[var(--fg-muted)] md:text-sm">{formatNumber(author.views)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </SectionCard>

        <SectionCard
          title="Visualisasi Produktivitas Wartawan"
          description={
            showProductivitySeries
              ? `${productivity?.authors[0]?.name ?? "Wartawan"} · ${productivityRangeLabel}`
              : "10 penulis teratas"
          }
          action={
            productivityAuthor ? (
              <div className="rounded-2xl bg-[var(--bg-surface)] p-1">
                <div className="grid grid-cols-3 gap-1">
                  {(
                    [
                      ["day", "Harian"],
                      ["week", "Mingguan"],
                      ["month", "Bulanan"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setProductivityRange(value)}
                      className={`rounded-xl px-3 py-2 text-[11px] font-bold transition-colors ${
                        productivityRange === value
                          ? "bg-[var(--accent)] text-black"
                          : "bg-transparent text-[var(--fg-muted)] hover:bg-[var(--bg-base)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : undefined
          }
        >
          {productivityLoading && !productivity ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            </div>
          ) : !productivity || productivity.authors.length === 0 ? (
            <div className="text-sm text-[var(--fg-muted)]">Belum ada data produktivitas pada rentang ini.</div>
          ) : (
            <>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs font-semibold text-[var(--fg-muted)]">
                  {formatTrendDateRange(productivity.start, productivity.end)}
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-[var(--fg-muted)]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#fb923c]" />
                    View
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#c2410c]" />
                    Artikel
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <div className="flex gap-2">
                      <div className="flex h-[300px] w-12 shrink-0 flex-col justify-between py-0.5 text-right text-[10px] font-semibold text-[var(--fg-muted)]">
                        <span>{formatCompactNumber(productivityChartMax)}</span>
                        <span>{formatCompactNumber(productivityChartMax / 2)}</span>
                        <span>0</span>
                      </div>
                      <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                          <div className="border-t border-dashed border-[var(--border)]" />
                          <div className="border-t border-dashed border-[var(--border)]" />
                          <div className="border-t border-dashed border-[var(--border)]" />
                        </div>
                        <div className="relative flex h-[300px] items-end gap-3">
                          {showProductivitySeries
                            ? productivitySeries.map((item) => {
                                const viewsPct = Math.max((item.views / productivityChartMax) * 100, item.views > 0 ? 4 : 1);
                                const articlesRatio = item.views > 0 ? Math.min(1, item.articles / item.views) : 0;
                                const articlesPct = viewsPct * articlesRatio;
                                return (
                                  <div key={item.key} className="flex h-full min-w-[44px] flex-1 flex-col justify-end gap-2">
                                    <div className="relative flex flex-1 items-end">
                                      <div
                                        className="relative w-full rounded-t-[10px] bg-[#fb923c] shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)] transition-opacity hover:opacity-90"
                                        style={{ height: `${viewsPct}%` }}
                                        title={`${item.label} — ${formatNumber(item.articles)} artikel, ${formatNumber(item.views)} view`}
                                      >
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-[var(--fg-muted)]">
                                          {formatNumber(item.articles)} · {formatCompactNumber(item.views)}
                                        </span>
                                      </div>
                                      <div
                                        className="absolute bottom-0 left-1/2 w-[46%] -translate-x-1/2 rounded-t-[6px] bg-[#c2410c]"
                                        style={{ height: `${articlesPct}%` }}
                                      />
                                    </div>
                                    <div className="line-clamp-2 text-center text-[11px] font-medium leading-4 text-[var(--fg-muted)]">{item.label}</div>
                                  </div>
                                );
                              })
                            : topProductivityAuthors.map((author) => {
                                const viewsPct = Math.max((author.views / productivityChartMax) * 100, author.views > 0 ? 4 : 1);
                                const articlesRatio = author.views > 0 ? Math.min(1, author.articles / author.views) : 0;
                                const articlesPct = viewsPct * articlesRatio;
                                return (
                                  <div key={author.id} className="flex h-full min-w-[56px] flex-1 flex-col justify-end gap-2">
                                    <div className="relative flex flex-1 items-end">
                                      <div
                                        className="relative w-full rounded-t-[10px] bg-[#fb923c] shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)] transition-opacity hover:opacity-90"
                                        style={{ height: `${viewsPct}%` }}
                                        title={`${author.name} — ${formatNumber(author.articles)} artikel, ${formatNumber(author.views)} view`}
                                      >
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-[var(--fg-muted)]">
                                          {formatNumber(author.articles)} · {formatCompactNumber(author.views)}
                                        </span>
                                      </div>
                                      <div
                                        className="absolute bottom-0 left-1/2 w-[46%] -translate-x-1/2 rounded-t-[6px] bg-[#c2410c]"
                                        style={{ height: `${articlesPct}%` }}
                                      />
                                    </div>
                                    <div className="line-clamp-2 text-center text-[11px] font-medium leading-4 text-[var(--fg-muted)]">{author.name}</div>
                                  </div>
                                );
                              })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            </>
          )}
        </SectionCard>

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
