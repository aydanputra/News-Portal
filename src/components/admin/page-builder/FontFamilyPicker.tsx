"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type FontFamilyOption = {
  label: string;
  value: string;
  previewFamily?: string;
};

export const DEFAULT_FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  { label: "Default", value: "" },
  { label: "Body (Theme)", value: "var(--font-body)", previewFamily: "var(--font-body)" },
  { label: "Display (Theme)", value: "var(--font-display)", previewFamily: "var(--font-display)" },
  { label: "Inter", value: "Inter, system-ui, sans-serif", previewFamily: "Inter, system-ui, sans-serif" },
  { label: "Sora", value: "Sora, system-ui, sans-serif", previewFamily: "Sora, system-ui, sans-serif" },
  { label: "System Sans", value: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" },
  { label: "System Serif", value: "ui-serif, Georgia, Cambria, Times New Roman, Times, serif" },
  { label: "System Mono", value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace" },
  { label: "Arial", value: "Arial, sans-serif", previewFamily: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif", previewFamily: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, Times, serif", previewFamily: "Times New Roman, Times, serif" },
  { label: "Courier New", value: "Courier New, Courier, monospace", previewFamily: "Courier New, Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif", previewFamily: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "Trebuchet MS, Arial, sans-serif", previewFamily: "Trebuchet MS, Arial, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Verdana, sans-serif", previewFamily: "Tahoma, Verdana, sans-serif" },
  { label: "Roboto*", value: "Roboto, system-ui, sans-serif", previewFamily: "Roboto, system-ui, sans-serif" },
  { label: "Poppins*", value: "Poppins, system-ui, sans-serif", previewFamily: "Poppins, system-ui, sans-serif" },
  { label: "Montserrat*", value: "Montserrat, system-ui, sans-serif", previewFamily: "Montserrat, system-ui, sans-serif" },
  { label: "Lato*", value: "Lato, system-ui, sans-serif", previewFamily: "Lato, system-ui, sans-serif" },
  { label: "Open Sans*", value: "Open Sans, system-ui, sans-serif", previewFamily: "Open Sans, system-ui, sans-serif" },
  { label: "Nunito*", value: "Nunito, system-ui, sans-serif", previewFamily: "Nunito, system-ui, sans-serif" },
  { label: "Merriweather*", value: "Merriweather, ui-serif, Georgia, serif", previewFamily: "Merriweather, ui-serif, Georgia, serif" },
  { label: "Playfair Display*", value: "Playfair Display, ui-serif, Georgia, serif", previewFamily: "Playfair Display, ui-serif, Georgia, serif" },
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
          {options.map((option) => {
            const isActive = option.value === normalizedValue;
            const optionFamily = option.previewFamily || option.value || undefined;

            return (
              <button
                key={`${option.label}-${option.value}`}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
