import type {
  BlockConfigPanelHeroSplit4AdvancedSectionProps,
  BlockConfigPanelHeroSplit4ContentSectionProps,
} from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

export function BlockConfigPanelHeroSplit4ContentSection({
  heroTextControlClass,
  heroControlClass,
  getConfigString,
  updateChildConfig,
  updateChildResponsiveConfig,
  renderSharedSourceFilterFields,
}: BlockConfigPanelHeroSplit4ContentSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Pengaturan Konten"
      badge={
        <span className="text-[10px] font-semibold text-[var(--fg-secondary)] bg-[var(--bg-base)] border border-[var(--border)] px-2 py-1 rounded-md">
          1 Hero + 4 Mini
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Sumber</label>
          <div className="flex p-1 bg-[var(--bg-base)] rounded-lg border border-[var(--border)]">
            <button
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
                getConfigString("filterType", "category") === "category"
                  ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
              }`}
              onClick={() => updateChildConfig("filterType", "category")}
            >
              Kategori
            </button>
            <button
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
                getConfigString("filterType", "category") === "tag"
                  ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]"
                  : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
              }`}
              onClick={() => updateChildConfig("filterType", "tag")}
            >
              Tag
            </button>
          </div>
        </div>
        {renderSharedSourceFilterFields()}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Urutan</label>
          <select
            className={heroTextControlClass}
            value={getConfigString("sortOrder", "latest")}
            onChange={(e) => updateChildConfig("sortOrder", e.target.value)}
          >
            <option value="latest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="popular">Terpopuler</option>
            <option value="random">Acak</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jumlah Berita</label>
          <select
            className={heroControlClass}
            value={getConfigString("limit", "5")}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              updateChildResponsiveConfig("limit", isNaN(val) ? undefined : Math.max(1, Math.min(5, val)));
            }}
          >
            <option value={1}>1 Berita</option>
            <option value={2}>2 Berita</option>
            <option value={3}>3 Berita</option>
            <option value={4}>4 Berita</option>
            <option value={5}>5 Berita</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Offset</label>
          <input
            type="number"
            min={0}
            className={heroControlClass}
            value={getConfigString("offset", "0")}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              updateChildConfig("offset", isNaN(val) ? undefined : Math.max(0, val));
            }}
          />
        </div>
      </div>
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelHeroSplit4AdvancedSection({
  renderSharedVisibilitySettings,
  renderSharedBoxBackgroundSettings,
  renderSharedWidgetSpacingSettings,
}: BlockConfigPanelHeroSplit4AdvancedSectionProps) {
  return (
    <div className="space-y-4">
      {renderSharedVisibilitySettings()}
      {renderSharedBoxBackgroundSettings("Terapkan background Hero + 4 Mini ke semua device")}
      {renderSharedWidgetSpacingSettings("Terapkan margin dan padding Hero + 4 Mini ke semua device")}
    </div>
  );
}
