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

const buildVisiblePages = (currentPage: number, totalPages: number, start: number, end: number) => {
  const items: Array<number | "ellipsis-start" | "ellipsis-end"> = [];

  if (start > 1) {
    items.push(1);
  }

  if (start > 2) {
    items.push("ellipsis-start");
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (end < totalPages - 1) {
    items.push("ellipsis-end");
  }

  if (end < totalPages) {
    items.push(totalPages);
  }

  if (items.length === 0) {
    items.push(currentPage);
  }

  return items;
};

const buildCompactPages = (currentPage: number, totalPages: number, maxVisible: number) => {
  const safeMax = Math.max(1, maxVisible);
  if (totalPages <= safeMax) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const half = Math.floor(safeMax / 2);
  let start = currentPage - half;
  let end = start + safeMax - 1;

  if (start < 1) {
    start = 1;
    end = safeMax;
  }

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - safeMax + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const buildMobileVisibleItems = (currentPage: number, totalPages: number) => {
  const compactPages = buildCompactPages(currentPage, totalPages, 3);
  const items: Array<number | "ellipsis-end"> = [...compactPages];

  if (totalPages > 3 && compactPages[compactPages.length - 1] !== totalPages) {
    if (compactPages[compactPages.length - 1] !== totalPages - 1) {
      items.push("ellipsis-end");
    }
    items.push(totalPages);
  }

  return items;
};

export default function ArchivePagination({ block, currentPage, totalPages, basePath }: ArchivePaginationProps) {
  const config = block?.config || {};
  const maxVisible = Math.max(3, Math.min(9, Number(config.maxVisiblePages) || 5));
  const showPrevNext = config.showPrevNext !== false;
  const showPaginationBox = config.showPaginationBox !== false;
  const prevLabel = typeof config.prevLabel === "string" && config.prevLabel.trim() ? config.prevLabel.trim() : "Sebelumnya";
  const nextLabel = typeof config.nextLabel === "string" && config.nextLabel.trim() ? config.nextLabel.trim() : "Berikutnya";
  const textColorDesktop = typeof config.textColor === "string" && config.textColor.trim() ? config.textColor : "var(--fg-primary, var(--home-widget-title-color, var(--heading-color, #111827)))";
  const textColorTablet = typeof config.tabletTextColor === "string" && config.tabletTextColor.trim() ? config.tabletTextColor : textColorDesktop;
  const textColorMobile = typeof config.mobileTextColor === "string" && config.mobileTextColor.trim() ? config.mobileTextColor : textColorDesktop;
  const activeBgColorDesktop = typeof config.activeBgColor === "string" && config.activeBgColor.trim() ? config.activeBgColor : "var(--accent, #2563eb)";
  const activeBgColorTablet = typeof config.tabletActiveBgColor === "string" && config.tabletActiveBgColor.trim() ? config.tabletActiveBgColor : activeBgColorDesktop;
  const activeBgColorMobile = typeof config.mobileActiveBgColor === "string" && config.mobileActiveBgColor.trim() ? config.mobileActiveBgColor : activeBgColorDesktop;
  const activeTextColorDesktop = typeof config.activeTextColor === "string" && config.activeTextColor.trim() ? config.activeTextColor : "#ffffff";
  const activeTextColorTablet = typeof config.tabletActiveTextColor === "string" && config.tabletActiveTextColor.trim() ? config.tabletActiveTextColor : activeTextColorDesktop;
  const activeTextColorMobile = typeof config.mobileActiveTextColor === "string" && config.mobileActiveTextColor.trim() ? config.mobileActiveTextColor : activeTextColorDesktop;

  if (totalPages <= 1) return null;

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  const visiblePages = buildVisiblePages(currentPage, totalPages, start, end);
  const mobileVisibleItems = buildMobileVisibleItems(currentPage, totalPages);

  const navButtonClass =
    "inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--home-main-box-radius,0.75rem)] border text-sm font-semibold transition-all duration-200 md:size-10";
  const secondaryButtonStyle = {
    color: "var(--archive-pagination-text-color)",
    backgroundColor: "var(--archive-pagination-surface)",
    borderColor: "var(--archive-pagination-border)",
  } as const;

  const ArrowLeftIcon = () => (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path
        d="M11.5 5.5L7 10l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const ArrowRightIcon = () => (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <path
        d="M8.5 5.5L13 10l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div
      className="archive-pagination-block w-full pt-3"
      style={{
        "--archive-pagination-text-color-mobile": textColorMobile,
        "--archive-pagination-text-color-tablet": textColorTablet,
        "--archive-pagination-text-color-desktop": textColorDesktop,
        "--archive-pagination-active-bg-mobile": activeBgColorMobile,
        "--archive-pagination-active-bg-tablet": activeBgColorTablet,
        "--archive-pagination-active-bg-desktop": activeBgColorDesktop,
        "--archive-pagination-active-text-mobile": activeTextColorMobile,
        "--archive-pagination-active-text-tablet": activeTextColorTablet,
        "--archive-pagination-active-text-desktop": activeTextColorDesktop,
        "--archive-pagination-surface": "var(--bg-elevated, #ffffff)",
        "--archive-pagination-soft-surface": "var(--bg-surface, #f9fafb)",
        "--archive-pagination-border": "var(--border, #e5e7eb)",
        "--archive-pagination-muted": "var(--fg-muted, #6b7280)",
        "--archive-pagination-active-shadow": "0 10px 25px -18px color-mix(in srgb, var(--archive-pagination-active-bg) 55%, transparent)",
      } as React.CSSProperties}
    >
      <nav
        className={`mx-auto flex w-full max-w-full flex-nowrap items-center justify-center gap-1 rounded-[calc(var(--home-main-box-radius,0.75rem)+0.2rem)] p-1 md:gap-2 md:p-2.5 ${
          showPaginationBox
            ? "border bg-[var(--archive-pagination-soft-surface)] shadow-sm"
            : "border border-transparent bg-transparent shadow-none"
        }`}
        style={showPaginationBox ? { borderColor: "var(--archive-pagination-border)" } : undefined}
        aria-label="Pagination"
      >
          {showPrevNext && currentPage > 1 && (
            <Link
              href={buildPageHref(basePath, currentPage - 1)}
              className={`${navButtonClass} hover:-translate-y-px hover:shadow-sm lg:min-w-[7.25rem]`}
              style={secondaryButtonStyle}
              aria-label={prevLabel}
              title={prevLabel}
            >
              <span className="lg:hidden">
                <ArrowLeftIcon />
              </span>
              <span className="hidden lg:inline">{prevLabel}</span>
            </Link>
          )}

          {mobileVisibleItems.map((item, index) => {
            if (item === "ellipsis-end") {
              return (
                <span
                  key={`mobile-ellipsis-${index}`}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--home-main-box-radius,0.75rem)] border bg-[var(--archive-pagination-surface)] text-sm font-semibold md:hidden"
                  style={{ borderColor: "var(--archive-pagination-border)", color: "var(--archive-pagination-muted)" }}
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const isActive = item === currentPage;
            return (
              <Link
                key={`mobile-${item}`}
                href={buildPageHref(basePath, item)}
                aria-current={isActive ? "page" : undefined}
                className={`${navButtonClass} hover:-translate-y-px hover:shadow-sm md:hidden`}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--archive-pagination-active-bg)",
                        color: "var(--archive-pagination-active-text)",
                        borderColor: "var(--archive-pagination-active-bg)",
                        boxShadow: "var(--archive-pagination-active-shadow)",
                      }
                    : secondaryButtonStyle
                }
              >
                {item}
              </Link>
            );
          })}

          {visiblePages.map((item, index) => {
            if (item === "ellipsis-start" || item === "ellipsis-end") {
              return (
                <span
                  key={`${item}-${index}`}
                  className="hidden md:inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--home-main-box-radius,0.75rem)] border bg-[var(--archive-pagination-surface)] text-sm font-semibold"
                  style={{ borderColor: "var(--archive-pagination-border)", color: "var(--archive-pagination-muted)" }}
                  aria-hidden="true"
                >
                  ...
                </span>
              );
            }

            const isActive = item === currentPage;
            return (
              <Link
                key={item}
                href={buildPageHref(basePath, item)}
                aria-current={isActive ? "page" : undefined}
                className={`${navButtonClass} hidden hover:-translate-y-px hover:shadow-sm md:inline-flex`}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--archive-pagination-active-bg)",
                        color: "var(--archive-pagination-active-text)",
                        borderColor: "var(--archive-pagination-active-bg)",
                        boxShadow: "var(--archive-pagination-active-shadow)",
                      }
                    : secondaryButtonStyle
                }
              >
                {item}
              </Link>
            );
          })}

          {showPrevNext && currentPage < totalPages && (
            <Link
              href={buildPageHref(basePath, currentPage + 1)}
              className={`${navButtonClass} hover:-translate-y-px hover:shadow-sm lg:min-w-[7.25rem]`}
              style={secondaryButtonStyle}
              aria-label={nextLabel}
              title={nextLabel}
            >
              <span className="lg:hidden">
                <ArrowRightIcon />
              </span>
              <span className="hidden lg:inline">{nextLabel}</span>
            </Link>
          )}
      </nav>
    </div>
  );
}
