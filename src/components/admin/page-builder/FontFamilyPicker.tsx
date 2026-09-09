"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type FontFamilyGroup = "global" | "builder" | "direct";

export type FontFamilyOption = {
  label: string;
  value: string;
  previewFamily?: string;
  group?: FontFamilyGroup;
};

export const FONT_FAMILY_GROUP_LABELS: Record<FontFamilyGroup, string> = {
  global: "Tipografi Global (Fallback)",
  builder: "Tipografi Halaman (Standard)",
  direct: "Pilih Font Langsung",
};

export const DEFAULT_FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  // Tingkatan 1 — Fallback Tipografi Global
  { label: "Default (Inherit)", value: "", group: "global" },
  { label: "Heading Global", value: "var(--font-heading)", previewFamily: "var(--font-heading)", group: "global" },
  { label: "Body Global", value: "var(--font-body)", previewFamily: "var(--font-body)", group: "global" },

  // Tingkatan 2 — Tipografi Homepage / Single Post / Archive
  { label: "Widget Title (Homepage)", value: "var(--home-widget-title-font)", group: "builder" },
  { label: "News Title (Homepage)", value: "var(--home-news-title-font)", group: "builder" },
  { label: "Excerpt (Homepage)", value: "var(--home-excerpt-font)", group: "builder" },
  { label: "Meta (Homepage)", value: "var(--home-meta-font)", group: "builder" },
  { label: "Post Title", value: "var(--post-title-font)", group: "builder" },
  { label: "Post Subtitle", value: "var(--post-subtitle-font)", group: "builder" },
  { label: "Post Content", value: "var(--post-content-font)", group: "builder" },
  { label: "Archive Title", value: "var(--archive-title-font)", group: "builder" },
  { label: "Archive Widget Title", value: "var(--archive-widget-title-font)", group: "builder" },

  // Tingkatan 3 — Pilih Font Langsung
  { label: "Inter", value: "Inter, system-ui, sans-serif", previewFamily: "Inter, system-ui, sans-serif", group: "direct" },
  { label: "Sora", value: "Sora, system-ui, sans-serif", previewFamily: "Sora, system-ui, sans-serif", group: "direct" },
  { label: "System Sans", value: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif", group: "direct" },
  { label: "System Serif", value: "ui-serif, Georgia, Cambria, Times New Roman, Times, serif", group: "direct" },
  { label: "System Mono", value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace", group: "direct" },
  { label: "Arial", value: "Arial, sans-serif", previewFamily: "Arial, sans-serif", group: "direct" },
  { label: "Georgia", value: "Georgia, serif", previewFamily: "Georgia, serif", group: "direct" },
  { label: "Times New Roman", value: "Times New Roman, Times, serif", previewFamily: "Times New Roman, Times, serif", group: "direct" },
  { label: "Courier New", value: "Courier New, Courier, monospace", previewFamily: "Courier New, Courier, monospace", group: "direct" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif", previewFamily: "Verdana, Geneva, sans-serif", group: "direct" },
  { label: "Trebuchet MS", value: "Trebuchet MS, Arial, sans-serif", previewFamily: "Trebuchet MS, Arial, sans-serif", group: "direct" },
  { label: "Tahoma", value: "Tahoma, Verdana, sans-serif", previewFamily: "Tahoma, Verdana, sans-serif", group: "direct" },
  { label: "Roboto*", value: "Roboto, system-ui, sans-serif", previewFamily: "Roboto, system-ui, sans-serif", group: "direct" },
  { label: "Poppins*", value: "Poppins, system-ui, sans-serif", previewFamily: "Poppins, system-ui, sans-serif", group: "direct" },
  { label: "Montserrat*", value: "Montserrat, system-ui, sans-serif", previewFamily: "Montserrat, system-ui, sans-serif", group: "direct" },
  { label: "Lato*", value: "Lato, system-ui, sans-serif", previewFamily: "Lato, system-ui, sans-serif", group: "direct" },
  { label: "Open Sans*", value: "Open Sans, system-ui, sans-serif", previewFamily: "Open Sans, system-ui, sans-serif", group: "direct" },
  { label: "Nunito*", value: "Nunito, system-ui, sans-serif", previewFamily: "Nunito, system-ui, sans-serif", group: "direct" },
  { label: "Merriweather*", value: "Merriweather, ui-serif, Georgia, serif", previewFamily: "Merriweather, ui-serif, Georgia, serif", group: "direct" },
  { label: "Playfair Display*", value: "Playfair Display, ui-serif, Georgia, serif", previewFamily: "Playfair Display, ui-serif, Georgia, serif", group: "direct" },
];

export function FontFamilyPicker({
  value,
  onChange,
  options = DEFAULT_FONT_FAMILY_OPTIONS,
  buttonClassName = "w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] text-[var(--fg-primary)] flex items-center justify-between gap-3",
  panelClassName = "absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-2 shadow-xl",
}: {
  value: string;
  onChange: (value: string) => void;
  options?: FontFamilyOption[];
  buttonClassName?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const normalizedValue = typeof value === "string" ? value : "";
  const selected = useMemo(() => options.find((option) => option.value === normalizedValue) || null, [options, normalizedValue]);
  const displayLabel = selected?.label || (normalizedValue ? "Custom" : "Default");
  const previewFamily = selected?.previewFamily || selected?.value || normalizedValue || undefined;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      if (!container.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("pointerdown", handlePointerDown, true);
    }

    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={buttonClassName}
        style={{ fontFamily: previewFamily }}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={panelClassName}>
          {options.map((option, index) => {
            const isActive = option.value === normalizedValue;
            const optionFamily = option.previewFamily || option.value || undefined;
            const prevGroup = index > 0 ? options[index - 1].group : undefined;
            const showGroupHeader = !!option.group && option.group !== prevGroup;

            return (
              <div key={`${option.label}-${option.value}`}>
                {showGroupHeader && option.group ? (
                  <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                    {FONT_FAMILY_GROUP_LABELS[option.group]}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--bg-base)] text-[var(--accent)]"
                      : "text-[var(--fg-primary)] hover:bg-[var(--bg-base)]"
                  }`}
                  style={{ fontFamily: optionFamily }}
                >
                  <span className="truncate">{option.label}</span>
                  {isActive ? <Check size={16} className="shrink-0" /> : null}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
