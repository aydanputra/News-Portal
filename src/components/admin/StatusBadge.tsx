export default function StatusBadge({
  status,
  published,
  compact = false,
}: {
  status: string;
  published: boolean;
  compact?: boolean;
}) {
  // Normalize status or fallback to published boolean
  let label = status;
  let colorClass = "bg-[var(--bg-surface)] text-[var(--fg-muted)] border border-[var(--border)]";

  // If status is DRAFT but published is true (legacy data), show Published
  if (published && status === 'DRAFT') {
      label = 'PUBLISHED';
  }

  switch (label) {
    case "PUBLISHED":
      label = compact ? "Terbit" : "Published";
      colorClass = "bg-emerald-500/5 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-0";
      break;
    case "DRAFT":
      label = compact ? "Draf" : "Draft";
      colorClass = "bg-gray-500/5 text-gray-800 dark:bg-zinc-500/10 dark:text-zinc-400 border-0";
      break;
    case "IN_REVIEW":
      label = compact ? "Review" : "In Review";
      colorClass = "bg-amber-500/5 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border-0";
      break;
    case "SCHEDULED":
      label = compact ? "Jadwal" : "Scheduled";
      colorClass = "bg-sky-500/5 text-sky-800 dark:bg-sky-500/10 dark:text-sky-400 border-0";
      break;
    case "REJECTED":
      label = compact ? "Tolak" : "Rejected";
      colorClass = "bg-rose-500/5 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 border-0";
      break;
    default:
      label = status;
  }

  return (
    <span
      className={`badge ${colorClass} ${
        compact ? "px-2 py-[5px] text-[9px] leading-none tracking-[0.03em]" : ""
      }`}
    >
      {label}
    </span>
  );
}
