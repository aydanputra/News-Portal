import type { ConfigValue } from "@/lib/page-builder-config";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";
import type { BlockConfigPanelSharedWidgetSpacingProps } from "./BlockConfigPanelSharedTypes";

const SPACING_SIDES = [
  { key: "Top", label: "Atas", short: "A" },
  { key: "Right", label: "Kanan", short: "Kn" },
  { key: "Bottom", label: "Bawah", short: "B" },
  { key: "Left", label: "Kiri", short: "Kr" },
] as const;

export function BlockConfigPanelSharedWidgetSpacingSection({
  options,
  deviceLabel,
  controlClassName,
  isPostBuilder,
  getConfigString,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
}: BlockConfigPanelSharedWidgetSpacingProps) {
  const {
    copyTitle,
    sectionTitle = "Spacing",
    marginLabel = "Margin Widget",
    paddingLabel = "Padding Widget",
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
        SPACING_SIDES.forEach((side) => {
          const margin = getConfigForApply(`margin${side.key}`);
          const padding = getConfigForApply(`padding${side.key}`);
          if (margin !== undefined) applyToAllDevices(`margin${side.key}`, margin as ConfigValue);
          if (padding !== undefined) applyToAllDevices(`padding${side.key}`, padding as ConfigValue);
        });
      }}
      copyTitle={copyTitle}
    >
      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">{marginLabel}</label>
          <div className="grid grid-cols-4 gap-2">
            {SPACING_SIDES.map((side) => {
              const value = getConfigString(`margin${side.key}`);
              const displayValue = value === "0" ? "" : value;
              return (
              <div key={`shared-margin-${side.key}`} className="space-y-1">
                <div className={`relative ${controlClassName}`}>
                  <span className={`pointer-events-none absolute inset-0 z-[2] flex items-center justify-center text-center text-[10px] font-medium text-[var(--fg-secondary)] transition-opacity ${displayValue !== "" ? "opacity-0" : "opacity-40"}`}>
                    {side.label}
                  </span>
                  <input
                    type="number"
                    className="relative z-[1] h-full w-full bg-transparent px-2 text-center outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
                    value={displayValue}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      updateChildResponsiveConfig(`margin${side.key}`, Number.isNaN(val) ? undefined : val);
                    }}
                  />
                </div>
              </div>
            )})}
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">{paddingLabel}</label>
          <div className="grid grid-cols-4 gap-2">
            {SPACING_SIDES.map((side) => {
              const value = getConfigString(`padding${side.key}`);
              const displayValue = value === "0" ? "" : value;
              return (
              <div key={`shared-padding-${side.key}`} className="space-y-1">
                <div className={`relative ${controlClassName}`}>
                  <span className={`pointer-events-none absolute inset-0 z-[2] flex items-center justify-center text-center text-[10px] font-medium text-[var(--fg-secondary)] transition-opacity ${displayValue !== "" ? "opacity-0" : "opacity-40"}`}>
                    {side.label}
                  </span>
                  <input
                    type="number"
                    className="relative z-[1] h-full w-full bg-transparent px-2 text-center outline-none focus:outline-none focus:ring-0 focus-visible:outline-none"
                    value={displayValue}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      updateChildResponsiveConfig(`padding${side.key}`, Number.isNaN(val) ? undefined : val);
                    }}
                  />
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </BlockConfigPanelCollapseCard>
  );
}
