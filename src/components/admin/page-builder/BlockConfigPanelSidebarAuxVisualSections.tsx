import type { ReactNode } from "react";
import type { ConfigValue } from "@/lib/page-builder-config";
import type {
  BlockConfigPanelSharedCategoryTextOptions,
  BlockConfigPanelSurfaceVisualProps,
} from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

type SidebarVisualProps = BlockConfigPanelSurfaceVisualProps & {
  isSidebarPostListType: boolean;
  renderSharedCategoryTextSection: (options: BlockConfigPanelSharedCategoryTextOptions) => ReactNode;
};

export function BlockConfigPanelSidebarWidgetVisualSection({
  child,
  isSidebarPostListType,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalWidgetTitleColor,
  globalAccentTone,
  globalNewsTitleColor,
  globalHoverColor,
  globalMetaTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  renderHeroTextSection,
  renderSharedCategoryTextSection,
  ColorPicker,
}: SidebarVisualProps) {
  return (
    <>
      {isSidebarPostListType && (
        <BlockConfigPanelCollapseCard
          title="Pengaturan Thumbnail"
          onCopy={() => {
            ["showThumbnail", "imageWidth", "imageHeight", "imageBorderRadius"].forEach((key) => {
              const value = getConfigForApply(key);
              if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
            });
          }}
          copyTitle="Terapkan pengaturan thumbnail ke semua device"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--fg-secondary)]">Tampil</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={getConfigBool("showThumbnail", true)}
                  onChange={(e) => updateChildResponsiveConfig("showThumbnail", e.target.checked)}
                />
                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Lebar</label>
                <input
                  type="number"
                  className={heroControlClass}
                  value={getConfigString("imageWidth")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("imageWidth", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi</label>
                <input
                  type="number"
                  className={heroControlClass}
                  value={getConfigString("imageHeight")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("imageHeight", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Radius</label>
                <select
                  className={heroControlClass}
                  value={getConfigString("imageBorderRadius", "global")}
                  onChange={(e) => updateChildResponsiveConfig("imageBorderRadius", e.target.value)}
                >
                  <option value="global">Global</option>
                  <option value="none">Kotak</option>
                  <option value="sm">Kecil</option>
                  <option value="md">Sedang</option>
                  <option value="lg">Besar</option>
                  <option value="xl">XL</option>
                  <option value="full">Full</option>
                </select>
              </div>
            </div>
          </div>
        </BlockConfigPanelCollapseCard>
      )}

      <BlockConfigPanelCollapseCard
        title="Pengaturan Teks"
        onCopy={() => {
          [
            "showTitle",
            "blockTitleFontSize",
            "blockTitleColor",
            "blockTitleBorderColor",
            ...(isSidebarPostListType
              ? [
                  "rankNumberFontSize",
                  "rankNumberFontWeight",
                  "rankNumberColor",
                  "rankNumberBgColor",
                  "rankNumberBorderRadius",
                  "showCategory",
                  "categoryLabelFontSize",
                  "categoryLabelTextColor",
                  "categoryLabelBgColor",
                  "categoryLabelPaddingX",
                  "categoryLabelPaddingY",
                  "categoryLabelMarginBottom",
                  "categoryLabelBorderRadius",
                  "titleColor",
                  "titleHoverColor",
                  "titleFontSize",
                  "titleLineHeight",
                  "titleFontWeight",
                  "showMetaInfo",
                  "showAuthor",
                  "showDate",
                  "metaFontSize",
                  "metaFontWeight",
                  "metaColor",
                  "metaMarginBottom",
                ]
              : []),
          ].forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
        }}
        copyTitle="Terapkan pengaturan teks Sidebar Widget ke semua device"
      >

        {renderHeroTextSection(
          "Judul Widget",
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--fg-secondary)]">Tampil</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={getConfigBool("showTitle", true)}
                  onChange={(e) => updateChildConfig("showTitle", e.target.checked)}
                />
                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
                <input
                  type="number"
                  className={heroControlClass}
                  value={getConfigString("blockTitleFontSize")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("blockTitleFontSize", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <ColorPicker
                label="Teks"
                configKey="blockTitleColor"
                globalDefault={globalWidgetTitleColor}
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <ColorPicker
                label="Garis"
                configKey="blockTitleBorderColor"
                globalDefault={globalAccentTone}
                containerClassName="col-span-2"
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
            </div>
          </>,
        )}

        {isSidebarPostListType &&
          renderHeroTextSection(
            "Ranking",
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
                <input
                  type="number"
                  className={heroControlClass}
                  value={getConfigString("rankNumberFontSize")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("rankNumberFontSize", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
                <select
                  className={heroControlClass}
                  value={getConfigString("rankNumberFontWeight", "extrabold")}
                  onChange={(e) => updateChildResponsiveConfig("rankNumberFontWeight", e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="normal">Normal</option>
                  <option value="medium">Medium</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                  <option value="extrabold">Extra Bold</option>
                </select>
              </div>
              <ColorPicker
                label="Teks"
                configKey="rankNumberColor"
                globalDefault={globalMetaTone}
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <ColorPicker
                label="BG"
                configKey="rankNumberBgColor"
                globalDefault={globalAccentTone}
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
            </div>,
          )}

        {isSidebarPostListType &&
          renderSharedCategoryTextSection({
            textDefault: globalAccentTone,
            backgroundDefault: "transparent",
          })}

        {isSidebarPostListType &&
          renderHeroTextSection(
            "Judul",
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker
                label="Teks"
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
              <div className="col-span-2">
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
            </div>,
          )}

        {isSidebarPostListType &&
          renderHeroTextSection(
            "Meta",
            <>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    checked={getConfigBool("showMetaInfo", true)}
                    onChange={(e) => updateChildResponsiveConfig("showMetaInfo", e.target.checked)}
                  />
                  <span className="text-[10px] text-[var(--fg-secondary)]">Tampil</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    checked={getConfigBool("showAuthor", true)}
                    onChange={(e) => updateChildResponsiveConfig("showAuthor", e.target.checked)}
                  />
                  <span className="text-[10px] text-[var(--fg-secondary)]">Penulis</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                    checked={getConfigBool("showDate", true)}
                    onChange={(e) => updateChildResponsiveConfig("showDate", e.target.checked)}
                  />
                  <span className="text-[10px] text-[var(--fg-secondary)]">Tanggal</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
                  <input
                    type="number"
                    className={heroControlClass}
                    value={getConfigString("metaFontSize")}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      updateChildResponsiveConfig("metaFontSize", isNaN(val) ? undefined : val);
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
                  <select
                    className={heroControlClass}
                    value={getConfigString("metaFontWeight", "500")}
                    onChange={(e) => updateChildResponsiveConfig("metaFontWeight", e.target.value)}
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semi Bold (600)</option>
                    <option value="700">Bold (700)</option>
                  </select>
                </div>
                <ColorPicker
                  label="Warna"
                  configKey="metaColor"
                  globalDefault={globalMetaTone}
                  triggerClassName={heroColorTriggerClass}
                  swatchClassName={heroColorSwatchClass}
                  inputClassName={heroColorInputClass}
                  child={child}
                  getConfigValue={getConfigValue}
                  updateChildResponsiveConfig={updateChildResponsiveConfig}
                  updateChildConfig={updateChildConfig}
                />
                <div>
                  <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jarak Bawah</label>
                  <input
                    type="number"
                    className={heroControlClass}
                    value={getConfigString("metaMarginBottom")}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      updateChildResponsiveConfig("metaMarginBottom", isNaN(val) ? undefined : val);
                    }}
                  />
                </div>
              </div>
            </>,
          )}
      </BlockConfigPanelCollapseCard>

      {isSidebarPostListType && (
        <BlockConfigPanelCollapseCard
          title="Tata Letak Konten"
          onCopy={() => {
            const value = getConfigForApply("sidebarContentAlign");
            if (value !== undefined) applyToAllDevices("sidebarContentAlign", value as ConfigValue);
          }}
          copyTitle="Terapkan tata letak konten Sidebar Widget ke semua device"
        >
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "left", label: "Kiri" },
              { key: "center", label: "Tengah" },
              { key: "right", label: "Kanan" },
            ].map((item) => {
              const isActive = getConfigString("sidebarContentAlign", "left") === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => updateChildResponsiveConfig("sidebarContentAlign", item.key)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-medium transition-colors ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--bg-base)] text-[var(--fg-primary)] hover:border-[var(--accent)]"
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </BlockConfigPanelCollapseCard>
      )}
    </>
  );
}

export function BlockConfigPanelTagCloudVisualSection({
  child,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalWidgetTitleColor,
  globalAccentTone,
  globalSurfaceTone,
  globalBorderTone,
  globalExcerptTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  renderHeroTextSection,
  ColorPicker,
}: BlockConfigPanelSurfaceVisualProps) {
  return (
    <>
      <BlockConfigPanelCollapseCard
        title="Pengaturan Teks"
        onCopy={() => {
          ["showTitle", "blockTitleFontSize", "blockTitleColor", "blockTitleBorderColor", "blockTitleMarginBottom", "blockTitlePaddingBottom"].forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
        }}
        copyTitle="Terapkan pengaturan teks Tag Cloud ke semua device"
      >

        {renderHeroTextSection(
          "Judul Widget",
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--fg-secondary)]">Tampil</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={getConfigBool("showTitle", true)}
                  onChange={(e) => updateChildConfig("showTitle", e.target.checked)}
                />
                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
                <input
                  type="number"
                  className={heroControlClass}
                  value={getConfigString("blockTitleFontSize")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("blockTitleFontSize", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jarak Bawah</label>
                <input
                  type="number"
                  className={heroControlClass}
                  value={getConfigString("blockTitleMarginBottom")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("blockTitleMarginBottom", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Padding Bawah</label>
                <input
                  type="number"
                  className={heroControlClass}
                  value={getConfigString("blockTitlePaddingBottom")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("blockTitlePaddingBottom", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <ColorPicker
                label="Teks"
                configKey="blockTitleColor"
                globalDefault={globalWidgetTitleColor}
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <ColorPicker
                label="Garis"
                configKey="blockTitleBorderColor"
                globalDefault={globalAccentTone}
                containerClassName="col-span-2"
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
            </div>
          </>,
        )}
      </BlockConfigPanelCollapseCard>

      <BlockConfigPanelCollapseCard
        title="Layout Tag"
        onCopy={() => {
          ["tagFontSize", "tagBorderRadius", "tagGapX", "tagGapY", "tagPaddingX", "tagPaddingY"].forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
        }}
        copyTitle="Terapkan layout tag ke semua device"
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran Teks</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("tagFontSize", "12")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("tagFontSize", isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Radius</label>
            <select
              className={heroControlClass}
              value={getConfigString("tagBorderRadius", "md")}
              onChange={(e) => updateChildResponsiveConfig("tagBorderRadius", e.target.value)}
            >
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="full">Full</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Gap Horizontal</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("tagGapX", "2")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("tagGapX", isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Gap Vertikal</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("tagGapY", "2")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("tagGapY", isNaN(val) ? undefined : val);
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Kiri & Kanan</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("tagPaddingX", "12")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("tagPaddingX", isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Atas & Bawah</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("tagPaddingY", "4")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("tagPaddingY", isNaN(val) ? undefined : val);
              }}
            />
          </div>
        </div>
      </BlockConfigPanelCollapseCard>

      <BlockConfigPanelCollapseCard
        title="Warna Tag"
        onCopy={() => {
          ["tagTextColor", "tagBackgroundColor", "tagBorderColor", "tagHoverBackgroundColor", "tagHoverTextColor", "tagHoverBorderColor"].forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
        }}
        copyTitle="Terapkan warna tag ke semua device"
      >
        <div className="grid grid-cols-2 gap-4">
          <ColorPicker
            label="Teks Normal"
            configKey="tagTextColor"
            globalDefault={globalExcerptTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Teks Sorot"
            configKey="tagHoverTextColor"
            globalDefault="#ffffff"
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Latar Normal"
            configKey="tagBackgroundColor"
            globalDefault={globalSurfaceTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Latar Sorot"
            configKey="tagHoverBackgroundColor"
            globalDefault={globalAccentTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Garis Normal"
            configKey="tagBorderColor"
            globalDefault={globalBorderTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Garis Sorot"
            configKey="tagHoverBorderColor"
            globalDefault={globalAccentTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
        </div>
      </BlockConfigPanelCollapseCard>
    </>
  );
}

export function BlockConfigPanelAdBannerVisualSection({
  child,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalSurfaceTone,
  globalBorderTone,
  globalMetaTone,
  globalExcerptTone,
  getConfigBool,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelSurfaceVisualProps) {
  return (
    <>
      {!getConfigBool("hideWhenEmpty", false) && (
        <BlockConfigPanelCollapseCard
          title="Placeholder"
          onCopy={() => {
            ["emptyStateBgColor", "emptyStateBorderColor", "emptyStateTextColor", "emptyStateSubtextColor"].forEach((key) => {
              const value = getConfigForApply(key);
              if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
            });
          }}
          copyTitle="Terapkan pengaturan placeholder ke semua device"
        >
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker
              label="Latar"
              configKey="emptyStateBgColor"
              globalDefault={globalSurfaceTone}
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Garis"
              configKey="emptyStateBorderColor"
              globalDefault={globalBorderTone}
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Teks Utama"
              configKey="emptyStateTextColor"
              globalDefault={globalExcerptTone}
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Teks Keterangan"
              configKey="emptyStateSubtextColor"
              globalDefault={globalMetaTone}
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
          </div>
        </BlockConfigPanelCollapseCard>
      )}
    </>
  );
}
