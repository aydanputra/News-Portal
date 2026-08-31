import { ChevronDown, Copy } from "lucide-react";
import type { ReactNode } from "react";

type BlockConfigPanelCollapseCardProps = {
  title: string;
  children: ReactNode;
  onCopy?: () => void;
  copyTitle?: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  collapsible?: boolean;
};

export function BlockConfigPanelCollapseCard({
  title,
  children,
  onCopy,
  copyTitle,
  badge,
  defaultOpen = false,
  className = "",
  collapsible = true,
}: BlockConfigPanelCollapseCardProps) {
  if (collapsible) {
    return (
      <details
        className={`group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-sm mb-4 ${className}`.trim()}
        open={defaultOpen}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-[var(--border)] pb-2 mb-1">
          <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-[var(--fg-primary)]">
            <span className="w-1 h-4 shrink-0 rounded-full bg-[var(--accent)]"></span>
            <span className="truncate">{title}</span>
            {badge}
          </span>
          <span className="flex items-center gap-1">
            {onCopy ? (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onCopy();
                }}
                className="shrink-0 text-[10px] text-[var(--fg-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-base)] flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
                title={copyTitle ?? `Terapkan ${title.toLowerCase()} ke semua device`}
              >
                <Copy size={10} />
              </button>
            ) : null}
            <span className="text-[var(--fg-secondary)] transition-transform group-open:rotate-180">
              <ChevronDown size={14} />
            </span>
          </span>
        </summary>
        <div className="space-y-3 pt-2">{children}</div>
      </details>
    );
  }

  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 shadow-sm mb-4 ${className}`.trim()}
      data-default-open={defaultOpen ? "true" : "false"}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 mb-1">
        <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-[var(--fg-primary)]">
          <span className="w-1 h-4 shrink-0 rounded-full bg-[var(--accent)]"></span>
          <span className="truncate">{title}</span>
          {badge}
        </span>
        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 text-[10px] text-[var(--fg-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-base)] flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
            title={copyTitle ?? `Terapkan ${title.toLowerCase()} ke semua device`}
          >
            <Copy size={10} />
          </button>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
