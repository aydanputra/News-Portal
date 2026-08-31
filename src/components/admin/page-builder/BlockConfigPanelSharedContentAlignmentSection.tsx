import type { ConfigValue } from "@/lib/page-builder-config";
import type { BlockConfigPanelSharedContentAlignmentProps } from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

const TEXT_ALIGN_OPTIONS = [
  { key: "left", label: "Kiri" },
  { key: "center", label: "Tengah" },
  { key: "right", label: "Kanan" },
] as const;

const VERTICAL_ALIGN_OPTIONS = [
  { key: "top", label: "Atas" },
  { key: "center", label: "Tengah" },
  { key: "bottom", label: "Bawah" },
] as const;

export function BlockConfigPanelSharedContentAlignmentSection({
  options,
  deviceLabel,
  isPostBuilder,
  getConfigString,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
}: BlockConfigPanelSharedContentAlignmentProps) {
  const {
    copyTitle,
    sectionTitle = "Tata Letak Konten",
    textAlignLabel = "Tata Letak Konten",
    verticalAlignLabel = "Posisi Vertikal Widget",
    alignKey = "textAlign",
    alignDefault = "left",
    showVerticalAlign = true,
  } = options;

  return (
    <BlockConfigPanelCollapseCard
      title={sectionTitle}
      className={isPostBuilder ? "post-builder-panel-card" : ""}
      badge={
        <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
          {deviceLabel}
        </span>
      }
      collapsible
      defaultOpen={false}
      onCopy={() => {
        [alignKey, ...(showVerticalAlign ? ["verticalAlign"] : [])].forEach((key) => {
          const value = getConfigForApply(key);
          if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
        });
      }}
      copyTitle={copyTitle}
    >
      <div>
        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">{textAlignLabel}</label>
        <div className="grid grid-cols-3 gap-2">
          {TEXT_ALIGN_OPTIONS.map((item) => (
            <button
              key={`shared-text-align-${item.key}`}
              type="button"
              onClick={() => updateChildResponsiveConfig(alignKey, item.key)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                getConfigString(alignKey, alignDefault) === item.key
                  ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {showVerticalAlign && (
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">{verticalAlignLabel}</label>
          <div className="grid grid-cols-3 gap-2">
            {VERTICAL_ALIGN_OPTIONS.map((item) => (
              <button
                key={`shared-vertical-align-${item.key}`}
                type="button"
                onClick={() => updateChildResponsiveConfig("verticalAlign", item.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  getConfigString("verticalAlign", "center") === item.key
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </BlockConfigPanelCollapseCard>
  );
}
