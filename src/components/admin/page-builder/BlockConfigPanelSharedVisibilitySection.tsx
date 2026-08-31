import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";
import type { BlockConfigPanelSharedVisibilityProps } from "./BlockConfigPanelSharedTypes";

const DEVICE_NAMES = ["Desktop", "Tablet", "Mobile"] as const;

export function BlockConfigPanelSharedVisibilitySection({
  isPostWidget,
  getConfigBool,
  updateChildConfig,
}: BlockConfigPanelSharedVisibilityProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Responsivitas"
      className={isPostWidget ? "post-builder-panel-card" : ""}
      collapsible
      defaultOpen={false}
    >
      <div className="grid grid-cols-3 gap-3">
        {DEVICE_NAMES.map((device) => (
          <label key={device} className="flex items-center gap-2 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
              checked={getConfigBool(`hideOn${device}`, false)}
              onChange={(e) => updateChildConfig(`hideOn${device}`, e.target.checked)}
            />
            <span className="text-[11px] font-medium text-[var(--fg-primary)]">{device}</span>
          </label>
        ))}
      </div>
    </BlockConfigPanelCollapseCard>
  );
}
