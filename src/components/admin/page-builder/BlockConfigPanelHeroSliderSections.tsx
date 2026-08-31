import { Copy } from "lucide-react";
import type {
  BlockConfigPanelHeroSliderAdvancedSectionProps,
  BlockConfigPanelHeroSliderContentSectionProps,
} from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-2.5">
      <summary className="cursor-pointer text-xs font-medium text-[var(--fg-primary)]">
        {title}
      </summary>
      <div className="mt-2.5 space-y-2.5">{children}</div>
    </details>
  );
}

export function BlockConfigPanelHeroSliderContentSection({
  heroTextControlClass,
  heroControlClass,
  getConfigString,
  updateChildConfig,
  updateChildResponsiveConfig,
  renderSharedSourceFilterFields,
  sectionTitle = "Konten",
  badgeLabel = "Slider",
  hideSourceControls = false,
  sourceInfoText = "Sumber berita mengikuti pengaturan widget.",
  extraSections,
}: BlockConfigPanelHeroSliderContentSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title={sectionTitle}
      badge={badgeLabel ? (
        <span className="text-[10px] font-semibold text-[var(--fg-secondary)] bg-[var(--bg-base)] border border-[var(--border)] px-2 py-1 rounded-md">
          {badgeLabel}
        </span>
      ) : null}
    >
      {!hideSourceControls && (
        <CollapsibleSection title="Sumber Konten">
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
        </CollapsibleSection>
      )}

      <CollapsibleSection title="Konten">
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
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jumlah Slide</label>
            <select
              className={heroControlClass}
              value={getConfigString("limit", "5")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("limit", isNaN(val) ? undefined : val);
              }}
            >
              <option value={1}>1 Slide</option>
              <option value={2}>2 Slide</option>
              <option value={3}>3 Slide</option>
              <option value={4}>4 Slide</option>
              <option value={5}>5 Slide</option>
              <option value={6}>6 Slide</option>
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
      </CollapsibleSection>
      {extraSections}
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelHeroSliderAdvancedSection({
  deviceLabel,
  heroControlClass,
  getConfigBool,
  getConfigString,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  renderSharedVisibilitySettings,
  renderSharedBoxBackgroundSettings,
  renderSharedWidgetSpacingSettings,
}: BlockConfigPanelHeroSliderAdvancedSectionProps) {
  return (
    <div className="space-y-4">
      {renderSharedVisibilitySettings()}

      <BlockConfigPanelCollapseCard title="Pengaturan Slider">
        <CollapsibleSection title="Perilaku">
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                checked={getConfigBool("autoplay", false)}
                onChange={(e) => updateChildConfig("autoplay", e.target.checked)}
              />
              <span className="text-[11px] font-medium text-[var(--fg-primary)]">Autoplay</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                checked={getConfigBool("loop", true)}
                onChange={(e) => updateChildConfig("loop", e.target.checked)}
              />
              <span className="text-[11px] font-medium text-[var(--fg-primary)]">Loop</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                checked={getConfigBool("pauseOnHover", true)}
                onChange={(e) => updateChildConfig("pauseOnHover", e.target.checked)}
              />
              <span className="text-[11px] font-medium text-[var(--fg-primary)]">Jeda Saat Sorot</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                checked={getConfigBool("swipeEnabled", true)}
                onChange={(e) => updateChildConfig("swipeEnabled", e.target.checked)}
              />
              <span className="text-[11px] font-medium text-[var(--fg-primary)]">Swipe</span>
            </label>
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Delay Autoplay</label>
              <input
                type="number"
                min={1500}
                className={heroControlClass}
                value={getConfigString("autoplayMs", "5000")}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateChildConfig("autoplayMs", isNaN(val) ? undefined : Math.max(1500, val));
                }}
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Durasi Transisi</label>
              <input
                type="number"
                min={200}
                className={heroControlClass}
                value={getConfigString("slideTransitionMs", "500")}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateChildConfig("slideTransitionMs", isNaN(val) ? undefined : Math.max(200, val));
                }}
              />
            </div>
          </div>
        </CollapsibleSection>
      </BlockConfigPanelCollapseCard>

      <BlockConfigPanelCollapseCard
        title="Padding Konten"
        badge={
          <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
            {deviceLabel}
          </span>
        }
        onCopy={() => {
          ["Top", "Right", "Bottom", "Left"].forEach((side) => {
            const value = getConfigForApply(`heroContentPadding${side}`);
            if (value !== undefined) applyToAllDevices(`heroContentPadding${side}`, value);
          });
        }}
        copyTitle="Terapkan padding konten slide ke semua device"
      >
        <CollapsibleSection title="Padding">
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "heroContentPaddingTop", label: "Atas" },
              { key: "heroContentPaddingRight", label: "Kanan" },
              { key: "heroContentPaddingBottom", label: "Bawah" },
              { key: "heroContentPaddingLeft", label: "Kiri" },
            ].map((item) => (
              <div key={item.key}>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">{item.label}</label>
                <input
                  type="number"
                  min={0}
                  className={heroControlClass}
                  value={getConfigString(item.key)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig(item.key, isNaN(val) ? undefined : val);
                  }}
                />
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </BlockConfigPanelCollapseCard>
      {renderSharedBoxBackgroundSettings("Terapkan background Hero Slider ke semua device")}
      {renderSharedWidgetSpacingSettings("Terapkan margin dan padding Hero Slider ke semua device")}
    </div>
  );
}
