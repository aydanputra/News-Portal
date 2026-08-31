import { Copy } from "lucide-react";
import type { ConfigValue } from "@/lib/page-builder-config";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";
import type { BlockConfigPanelHeroAdvancedProps } from "./BlockConfigPanelSharedTypes";

const SPACING_SIDES = ["Top", "Right", "Bottom", "Left"] as const;
const CONTENT_PADDING_FIELDS = [
  { key: "contentPaddingTop", label: "Padding Atas" },
  { key: "contentPaddingRight", label: "Padding Kanan" },
  { key: "contentPaddingBottom", label: "Padding Bawah" },
  { key: "contentPaddingLeft", label: "Padding Kiri" },
] as const;

export function BlockConfigPanelHeroAdvancedSection({
  deviceLabel,
  controlClassName,
  getConfigString,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  renderSharedVisibilitySettings,
  renderSharedBoxBackgroundSettings,
}: BlockConfigPanelHeroAdvancedProps) {
  const deviceBadge = (
    <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
      {deviceLabel}
    </span>
  );

  return (
    <>
      {renderSharedVisibilitySettings()}
      {renderSharedBoxBackgroundSettings("Terapkan background Hero ke semua device")}

      <BlockConfigPanelCollapseCard
        title="Spacing"
        badge={deviceBadge}
        collapsible
        defaultOpen={false}
        onCopy={() => {
          SPACING_SIDES.forEach((side) => {
            const margin = getConfigForApply(`margin${side}`);
            const padding = getConfigForApply(`padding${side}`);
            if (margin !== undefined) applyToAllDevices(`margin${side}`, margin as ConfigValue);
            if (padding !== undefined) applyToAllDevices(`padding${side}`, padding as ConfigValue);
          });
        }}
        copyTitle="Terapkan margin dan padding ke semua device"
      >
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Margin Widget</label>
            <div className="grid grid-cols-4 gap-2">
              {SPACING_SIDES.map((side) => (
                <input
                  key={`hero-margin-${side}`}
                  type="number"
                  placeholder={side}
                  className={`${controlClassName} px-0 text-center`}
                  value={getConfigString(`margin${side}`)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig(`margin${side}`, Number.isNaN(val) ? undefined : val);
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Padding Widget</label>
            <div className="grid grid-cols-4 gap-2">
              {SPACING_SIDES.map((side) => (
                <input
                  key={`hero-padding-${side}`}
                  type="number"
                  placeholder={side}
                  className={`${controlClassName} px-0 text-center`}
                  value={getConfigString(`padding${side}`)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig(`padding${side}`, Number.isNaN(val) ? undefined : val);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </BlockConfigPanelCollapseCard>

      <BlockConfigPanelCollapseCard
        title="Padding Konten"
        badge={deviceBadge}
        collapsible
        defaultOpen={false}
      >
        <div className="grid grid-cols-2 gap-2">
          {CONTENT_PADDING_FIELDS.map((item) => (
            <div key={item.key}>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">{item.label}</label>
              <input
                type="number"
                min={0}
                className={controlClassName}
                value={getConfigString(item.key)}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateChildResponsiveConfig(item.key, Number.isNaN(val) ? undefined : val);
                }}
              />
            </div>
          ))}
        </div>
      </BlockConfigPanelCollapseCard>
    </>
  );
}
