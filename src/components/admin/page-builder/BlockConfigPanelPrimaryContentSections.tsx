import { Copy } from "lucide-react";
import type {
  BlockConfigPanelBulletListContentSectionProps,
  BlockConfigPanelBulletListSourceSectionProps,
  BlockConfigPanelHeroContentSectionProps,
  BlockConfigPanelNewsFeedSourceSectionProps,
} from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

export function BlockConfigPanelBulletListContentSection({
  child,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalAccentTone,
  globalNewsTitleColor,
  globalHoverColor,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  renderHeroTextSection,
  ColorPicker,
}: BlockConfigPanelBulletListContentSectionProps) {
  return (
    <>
      <BlockConfigPanelCollapseCard
        title="Tata Letak Grid"
        onCopy={() => {
          const columnCount = getConfigForApply("columnCount");
          const listGap = getConfigForApply("listGap");
          if (columnCount !== undefined) applyToAllDevices("columnCount", columnCount);
          if (listGap !== undefined) applyToAllDevices("listGap", listGap);
        }}
        copyTitle="Terapkan layout Bullet List ke semua device"
      >
        <div className="space-y-2.5">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jumlah Kolom</label>
            <select
              className={heroControlClass}
              value={getConfigString("columnCount", "2")}
              onChange={(e) => updateChildResponsiveConfig("columnCount", parseInt(e.target.value, 10))}
            >
              <option value={1}>1 Kolom</option>
              <option value={2}>2 Kolom</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jarak Baris</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("listGap", "14")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("listGap", isNaN(val) ? undefined : val);
              }}
            />
          </div>
        </div>
      </BlockConfigPanelCollapseCard>

      <BlockConfigPanelCollapseCard
        title="Pengaturan Teks"
        onCopy={() => {
          const titleColor = getConfigForApply("titleColor");
          const titleHoverColor = getConfigForApply("titleHoverColor");
          const titleSize = getConfigForApply("titleFontSize");
          const titleLh = getConfigForApply("titleLineHeight");
          const titleFw = getConfigForApply("titleFontWeight");
          const titleMb = getConfigForApply("titleMarginBottom");
          const bulletColor = getConfigForApply("bulletColor");
          const bulletSize = getConfigForApply("bulletSize");
          if (titleColor !== undefined) applyToAllDevices("titleColor", titleColor);
          if (titleHoverColor !== undefined) applyToAllDevices("titleHoverColor", titleHoverColor);
          if (titleSize !== undefined) applyToAllDevices("titleFontSize", titleSize);
          if (titleLh !== undefined) applyToAllDevices("titleLineHeight", titleLh);
          if (titleFw !== undefined) applyToAllDevices("titleFontWeight", titleFw);
          if (titleMb !== undefined) applyToAllDevices("titleMarginBottom", titleMb);
          if (bulletColor !== undefined) applyToAllDevices("bulletColor", bulletColor);
          if (bulletSize !== undefined) applyToAllDevices("bulletSize", bulletSize);
        }}
        copyTitle="Terapkan tipografi Bullet List ke semua device"
      >

        {renderHeroTextSection(
          "Judul",
          <>
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker
                label="Warna"
                configKey="titleColor"
                globalDefault={globalNewsTitleColor}
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <ColorPicker
                label="Sorot"
                configKey="titleHoverColor"
                globalDefault={globalHoverColor}
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
                <input
                  type="number"
                  className={heroControlClass}
                  value={getConfigString("titleFontSize")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("titleFontSize", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Baris</label>
                <input
                  type="number"
                  step="0.1"
                  className={heroControlClass}
                  value={getConfigString("titleLineHeight")}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateChildResponsiveConfig("titleLineHeight", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
                <select
                  className={heroControlClass}
                  value={getConfigString("titleFontWeight", "700")}
                  onChange={(e) => updateChildResponsiveConfig("titleFontWeight", e.target.value)}
                >
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi Bold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra Bold (800)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jarak Bawah</label>
                <input
                  type="number"
                  className={heroControlClass}
                  value={getConfigString("titleMarginBottom")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("titleMarginBottom", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
            </div>
          </>,
        )}

        {renderHeroTextSection(
          "Bullet",
          <div className="grid grid-cols-2 gap-2">
            <ColorPicker
              label="Warna"
              configKey="bulletColor"
              globalDefault={globalAccentTone}
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
              <input
                type="number"
                className={heroControlClass}
                value={getConfigString("bulletSize")}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateChildResponsiveConfig("bulletSize", isNaN(val) ? undefined : val);
                }}
              />
            </div>
          </div>,
        )}
      </BlockConfigPanelCollapseCard>
    </>
  );
}

export function BlockConfigPanelBulletListSourceSection({
  heroTextControlClass,
  heroControlClass,
  getConfigString,
  updateChildConfig,
  updateChildResponsiveConfig,
  renderSharedSourceFilterFields,
}: BlockConfigPanelBulletListSourceSectionProps) {
  return (
    <BlockConfigPanelCollapseCard title="Pengaturan Konten">
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
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jumlah Item</label>
          <select
            className={heroTextControlClass}
            value={getConfigString("limit", "6")}
            onChange={(e) => updateChildResponsiveConfig("limit", parseInt(e.target.value, 10))}
          >
            <option value={3}>3 Item</option>
            <option value={4}>4 Item</option>
            <option value={5}>5 Item</option>
            <option value={6}>6 Item</option>
            <option value={8}>8 Item</option>
            <option value={9}>9 Item</option>
            <option value={10}>10 Item</option>
            <option value={12}>12 Item</option>
            <option value={15}>15 Item</option>
            <option value={20}>20 Item</option>
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

export function BlockConfigPanelNewsFeedSourceSection({
  heroTextControlClass,
  heroControlClass,
  getConfigString,
  updateChildConfig,
  updateChildResponsiveConfig,
  renderSharedSourceFilterFields,
  isNewsListWidget,
  sectionTitle = "Konten",
  paginationSectionTitle = "Pagination",
}: BlockConfigPanelNewsFeedSourceSectionProps) {
  return (
    <>
      <BlockConfigPanelCollapseCard title={sectionTitle}>
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
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jumlah Item</label>
            <select
              className={heroTextControlClass}
              value={getConfigString("limit", "6")}
              onChange={(e) => updateChildResponsiveConfig("limit", parseInt(e.target.value, 10))}
            >
              <option value={3}>3 Item</option>
              <option value={4}>4 Item</option>
              <option value={5}>5 Item</option>
              <option value={6}>6 Item</option>
              <option value={8}>8 Item</option>
              <option value={9}>9 Item</option>
              <option value={10}>10 Item</option>
              <option value={12}>12 Item</option>
              <option value={15}>15 Item</option>
              <option value={20}>20 Item</option>
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

      {isNewsListWidget && (
        <BlockConfigPanelCollapseCard title={paginationSectionTitle}>
          <div className="space-y-2.5">
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Mode</label>
              <select
                className={heroControlClass}
                value={getConfigString("paginationStyle", "none")}
                onChange={(e) => updateChildConfig("paginationStyle", e.target.value)}
              >
                <option value="none">Tanpa Pagination</option>
                <option value="load_more">Muat Lebih</option>
                <option value="next_prev">Prev / Next</option>
                <option value="auto_load">Auto Load</option>
              </select>
            </div>
            {getConfigString("paginationStyle", "none") === "load_more" && (
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Teks Tombol</label>
                <input
                  type="text"
                  className={heroControlClass}
                  value={getConfigString("loadMoreText", "Muat Lebih")}
                  onChange={(e) => updateChildResponsiveConfig("loadMoreText", e.target.value)}
                />
              </div>
            )}
          </div>
        </BlockConfigPanelCollapseCard>
      )}
    </>
  );
}

export function BlockConfigPanelHeroContentSection({
  heroTextControlClass,
  heroControlClass,
  getConfigString,
  updateChildConfig,
  updateChildResponsiveConfig,
  renderSharedSourceFilterFields,
}: BlockConfigPanelHeroContentSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Pengaturan Konten"
      badge={
        <span className="text-[10px] font-semibold text-[var(--fg-secondary)] bg-[var(--bg-base)] border border-[var(--border)] px-2 py-1 rounded-md">
          1 Berita
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
            value={getConfigString("limit", "1")}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              updateChildResponsiveConfig("limit", isNaN(val) ? undefined : val);
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
