import Link from "next/link";
import React from "react";

interface ArchivePaginationProps {
  block: any;
  currentPage: number;
  totalPages: number;
  basePath: string;
}

const buildPageHref = (basePath: string, page: number) => {
  if (page <= 1) return basePath;
  const separator = basePath.includes("?") ? "&" : "?";
  return `${basePath}${separator}page=${page}`;
};

export default function ArchivePagination({ block, currentPage, totalPages, basePath }: ArchivePaginationProps) {
  const config = block?.config || {};
  const maxVisible = Math.max(3, Math.min(9, Number(config.maxVisiblePages) || 5));
  const showPrevNext = config.showPrevNext !== false;
  const prevLabel = typeof config.prevLabel === "string" && config.prevLabel.trim() ? config.prevLabel.trim() : "Sebelumnya";
  const nextLabel = typeof config.nextLabel === "string" && config.nextLabel.trim() ? config.nextLabel.trim() : "Berikutnya";
  const textColor = typeof config.textColor === "string" && config.textColor.trim() ? config.textColor : "var(--home-widget-title-color, var(--heading-color, #111827))";
  const activeBgColor = typeof config.activeBgColor === "string" && config.activeBgColor.trim() ? config.activeBgColor : "var(--accent, #2563eb)";
  const activeTextColor = typeof config.activeTextColor === "string" && config.activeTextColor.trim() ? config.activeTextColor : "#ffffff";

  if (totalPages <= 1) return null;

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  const pages = [];
  for (let page = start; page <= end; page += 1) pages.push(page);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-2" aria-label="Pagination">
      {showPrevNext && currentPage > 1 && (
        <Link
          href={buildPageHref(basePath, currentPage - 1)}
          className="px-4 py-2 rounded-[var(--home-main-box-radius,0.75rem)] border border-[var(--border,#e5e7eb)] bg-white text-sm font-semibold hover:border-[var(--accent,#2563eb)]"
          style={{ color: textColor }}
        >
          {prevLabel}
        </Link>
      )}
      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <Link
            key={page}
            href={buildPageHref(basePath, page)}
            aria-current={isActive ? "page" : undefined}
            className={`min-w-10 px-3 py-2 text-sm font-semibold rounded-[var(--home-main-box-radius,0.75rem)] border transition-colors ${
              isActive
                ? "border-[var(--accent,#2563eb)]"
                : "border-[var(--border,#e5e7eb)] bg-white hover:border-[var(--accent,#2563eb)]"
            }`}
            style={isActive ? { backgroundColor: activeBgColor, color: activeTextColor } : { color: textColor }}
          >
            {page}
          </Link>
        );
      })}
      {showPrevNext && currentPage < totalPages && (
        <Link
          href={buildPageHref(basePath, currentPage + 1)}
          className="px-4 py-2 rounded-[var(--home-main-box-radius,0.75rem)] border border-[var(--border,#e5e7eb)] bg-white text-sm font-semibold hover:border-[var(--accent,#2563eb)]"
          style={{ color: textColor }}
        >
          {nextLabel}
        </Link>
      )}
    </nav>
  );
}
