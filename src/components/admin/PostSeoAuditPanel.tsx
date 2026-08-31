"use client";

import { runSeoAudit, type SeoAuditResult } from "@/lib/seo-audit";

type PostSeoAuditPanelProps = {
  title: string;
  slug: string;
  subtitle: string;
  content: string;
  metaTitle: string;
  metaDesc: string;
  focusKeyword: string;
  canonicalUrl: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  categoryIds: string[];
  tags: string[];
};

function getScoreTone(score: number): string {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  return "text-rose-600";
}

function getBadgeTone(result: SeoAuditResult): string {
  if (result.score >= 85 && result.errorCount === 0) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (result.score >= 70) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-rose-200 bg-rose-50 text-rose-700";
}

function getIssueTone(severity: SeoAuditResult["issues"][number]["severity"]): string {
  if (severity === "good") return "border-emerald-200 bg-emerald-50/70 text-emerald-800";
  if (severity === "warning") return "border-amber-200 bg-amber-50/70 text-amber-800";
  return "border-rose-200 bg-rose-50/70 text-rose-800";
}

export default function PostSeoAuditPanel(props: PostSeoAuditPanelProps) {
  const audit = runSeoAudit(props);
  const visibleIssues = audit.issues.filter((issue) => issue.severity !== "good");
  const summaryIssues = visibleIssues.length > 0 ? visibleIssues : audit.issues.slice(0, 3);

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[var(--fg-primary)] mb-1">SEO Auditor</h3>
          <p className="text-xs text-[var(--fg-muted)]">
            Audit ini mengecek kesiapan artikel sebelum dipublish.
          </p>
        </div>
        <div className={`text-right ${getScoreTone(audit.score)}`}>
          <div className="text-2xl font-bold leading-none">{audit.score}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wide">/ 100</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getBadgeTone(audit)}`}>
          {audit.statusLabel}
        </span>
        <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs text-[var(--fg-secondary)]">
          Keyword: {audit.checks.focusKeyword || "-"}
        </span>
        <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs text-[var(--fg-secondary)]">
          {audit.checks.wordCount} kata
        </span>
        <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-xs text-[var(--fg-secondary)]">
          {audit.checks.internalLinkCount} internal link
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2">
          <div className="text-[var(--fg-muted)]">Error</div>
          <div className="mt-1 font-semibold text-[var(--fg-primary)]">{audit.errorCount}</div>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2">
          <div className="text-[var(--fg-muted)]">Warning</div>
          <div className="mt-1 font-semibold text-[var(--fg-primary)]">{audit.warningCount}</div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {summaryIssues.map((issue) => (
          <div key={issue.id} className={`rounded-lg border px-3 py-2 ${getIssueTone(issue.severity)}`}>
            <div className="text-xs font-semibold">{issue.label}</div>
            <div className="mt-1 text-xs leading-5">{issue.message}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[11px] text-[var(--fg-muted)]">
        Slug otomatis: <span className="font-medium text-[var(--fg-secondary)]">/{audit.checks.slug || "judul-berita"}</span>
      </div>

      <div className="mt-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-[11px] text-[var(--fg-muted)]">
        Canonical: <span className="font-medium text-[var(--fg-secondary)] break-all">{audit.checks.canonicalUrl || "otomatis mengikuti URL artikel"}</span>
      </div>
    </div>
  );
}
