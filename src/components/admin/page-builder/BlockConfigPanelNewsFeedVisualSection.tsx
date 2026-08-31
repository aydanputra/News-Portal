import { Copy } from "lucide-react";
import type { ReactNode } from "react";
import type { ConfigValue } from "@/lib/page-builder-config";
import type { Block } from "./types";
import type {
  BlockConfigPanelColorPickerRenderer,
  BlockConfigPanelSharedCategoryTextOptions,
  BlockConfigPanelSharedTitleTextOptions,
} from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

type BlockConfigPanelNewsFeedVisualSectionProps = {
  child: Block;
  effectiveChildType: string;
  isNewsListWidget: boolean;
  isGridColumnsWidget: boolean;
  isNewsGridWidget: boolean;
  isGridSliderWidget: boolean;
  heroControlClass: string;
  heroColorTriggerClass: string;
  heroColorSwatchClass: string;
  heroColorInputClass: string;
  globalWidgetTitleColor: string;
  globalAccentTone: string;
  globalNewsTitleColor: string;
  globalHoverColor: string;
  getConfigBool: (key: string, fallback?: boolean) => boolean;
  getConfigString: (key: string, fallback?: string) => string;
  getConfigValue: (child: Block, key: string) => unknown;
  getConfigForApply: (key: string) => ConfigValue | undefined;
  applyToAllDevices: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
  updateChildConfig: (key: string, value: ConfigValue) => void;
  renderHeroTextSection: (title: string, content: ReactNode) => ReactNode;
  renderSharedCategoryTextSection: (options: BlockConfigPanelSharedCategoryTextOptions) => ReactNode;
  renderSharedTitleTextSection: (options: BlockConfigPanelSharedTitleTextOptions) => ReactNode;
  renderSharedMetaTextSection: () => ReactNode;
  renderSharedExcerptTextSection: () => ReactNode;
  ColorPicker: BlockConfigPanelColorPickerRenderer;
};

export function BlockConfigPanelNewsFeedVisualSection({
  child,
  effectiveChildType,
  isNewsListWidget,
  isGridColumnsWidget,
  isNewsGridWidget,
  isGridSliderWidget,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalWidgetTitleColor,
  globalAccentTone,
  globalNewsTitleColor,
  globalHoverColor,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  renderHeroTextSection,
  renderSharedCategoryTextSection,
  renderSharedTitleTextSection,
  renderSharedMetaTextSection,
  renderSharedExcerptTextSection,
  ColorPicker,
}: BlockConfigPanelNewsFeedVisualSectionProps) {
  return (
    <>
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

      {isNewsListWidget && (
        <BlockConfigPanelCollapseCard
          title="Pengaturan Pagination"
          onCopy={() => {
            [
              "loadMorePaddingTop",
              "loadMorePaddingRight",
              "loadMorePaddingBottom",
              "loadMorePaddingLeft",
              "paginationTextColor",
              "paginationHoverTextColor",
              "paginationBgColor",
              "paginationHoverBgColor",
              "paginationBorderColor",
              "paginationHoverBorderColor",
            ].forEach((key) => {
              const value = getConfigForApply(key);
              if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
            });
          }}
          copyTitle="Terapkan style pagination Simple List ke semua device"
        >
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker
                label="Teks"
                configKey="paginationTextColor"
                globalDefault="var(--load-more-text, var(--accent))"
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <ColorPicker
                label="Teks Sorot"
                configKey="paginationHoverTextColor"
                globalDefault="var(--load-more-text-hover, #ffffff)"
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <ColorPicker
                label="Latar"
                configKey="paginationBgColor"
                globalDefault="var(--load-more-bg, var(--bg-elevated, #ffffff))"
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <ColorPicker
                label="Latar Sorot"
                configKey="paginationHoverBgColor"
                globalDefault="var(--load-more-bg-hover, var(--accent))"
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
                configKey="paginationBorderColor"
                globalDefault="var(--load-more-border, var(--border, #e5e7eb))"
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <ColorPicker
                label="Garis Sorot"
                configKey="paginationHoverBorderColor"
                globalDefault="var(--load-more-border-hover, var(--accent))"
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Padding Tombol</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: "loadMorePaddingTop", label: "Atas" },
                  { key: "loadMorePaddingRight", label: "Kanan" },
                  { key: "loadMorePaddingBottom", label: "Bawah" },
                  { key: "loadMorePaddingLeft", label: "Kiri" },
                ].map((item) => (
                  <input
                    key={item.key}
                    type="number"
                    min={0}
                    placeholder={item.label}
                    className={`${heroControlClass} px-0 text-center`}
                    value={getConfigString(item.key)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      updateChildResponsiveConfig(item.key, isNaN(val) ? undefined : val);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </BlockConfigPanelCollapseCard>
      )}

      {isGridColumnsWidget && (
        <BlockConfigPanelCollapseCard
          title="Tata Letak Grid"
          onCopy={() => {
            const layoutColumns = getConfigForApply(effectiveChildType === "news_grid_slider" ? "itemsPerView" : "gridColumns");
            if (layoutColumns !== undefined) {
              applyToAllDevices(
                effectiveChildType === "news_grid_slider" ? "itemsPerView" : "gridColumns",
                layoutColumns as ConfigValue,
              );
            }
            const gapX = getConfigForApply("gridGapX");
            if (gapX !== undefined) applyToAllDevices("gridGapX", gapX as ConfigValue);
            if (effectiveChildType === "news_grid") {
              const gapY = getConfigForApply("gridGapY");
              if (gapY !== undefined) applyToAllDevices("gridGapY", gapY as ConfigValue);
            }
          }}
          copyTitle="Terapkan layout grid ke semua device"
        >
          <div className="space-y-2.5">
            <div className={isNewsGridWidget ? "" : "grid grid-cols-2 gap-2"}>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jumlah Kolom</label>
                <select
                  className={heroControlClass}
                  value={getConfigString(isGridSliderWidget ? "itemsPerView" : "gridColumns", "3")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    const nextValue = isNaN(val) ? undefined : val;
                    if (isGridSliderWidget) {
                      updateChildResponsiveConfig("itemsPerView", nextValue);
                    } else {
                      updateChildResponsiveConfig("gridColumns", nextValue);
                    }
                  }}
                >
                  <option value={1}>1 Kolom</option>
                  <option value={2}>2 Kolom</option>
                  <option value={3}>3 Kolom</option>
                  <option value={4}>4 Kolom</option>
                </select>
              </div>
              {isGridSliderWidget && (
                <div>
                  <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jarak Antar Item</label>
                  <input
                    type="number"
                    className={heroControlClass}
                    value={getConfigString("gridGapX", "4")}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      updateChildResponsiveConfig("gridGapX", isNaN(val) ? undefined : val);
                    }}
                  />
                </div>
              )}
            </div>
            {isNewsGridWidget && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jarak Kolom</label>
                  <input
                    type="number"
                    className={heroControlClass}
                    value={getConfigString("gridGapX", "8")}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      updateChildResponsiveConfig("gridGapX", isNaN(val) ? undefined : val);
                    }}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jarak Baris</label>
                  <input
                    type="number"
                    className={heroControlClass}
                    value={getConfigString("gridGapY", "8")}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      updateChildResponsiveConfig("gridGapY", isNaN(val) ? undefined : val);
                    }}
                  />
                </div>
              </div>
            )}
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
            "titleColor",
            "titleHoverColor",
            "titleFontSize",
            "titleLineHeight",
            "titleFontWeight",
            "titleMarginBottom",
            "showCategory",
            "categoryLabelFontSize",
            "categoryLabelTextColor",
            "categoryLabelBgColor",
            "categoryLabelPaddingX",
            "categoryLabelPaddingY",
            "categoryLabelMarginBottom",
            "categoryLabelBorderRadius",
            "showMetaInfo",
            "showAuthor",
            "showDate",
            "metaFontSize",
            "metaFontWeight",
            "metaColor",
            "metaMarginBottom",
            "showExcerpt",
            "excerptLength",
            "excerptFontSize",
            "excerptLineHeight",
            "excerptFontWeight",
            "excerptColor",
          ].forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
        }}
        copyTitle="Terapkan pengaturan teks ke semua device"
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

        {renderSharedCategoryTextSection({
          textDefault: globalAccentTone,
          backgroundDefault: "transparent",
        })}

        {renderSharedTitleTextSection({
          colorKey: "titleColor",
          hoverColorKey: "titleHoverColor",
          fontSizeKey: "titleFontSize",
          lineHeightKey: "titleLineHeight",
          fontWeightKey: "titleFontWeight",
          marginBottomKey: "titleMarginBottom",
          colorDefault: globalNewsTitleColor,
          hoverColorDefault: globalHoverColor,
          fontWeightDefault: "600",
        })}

        {renderSharedMetaTextSection()}

        {renderSharedExcerptTextSection()}
      </BlockConfigPanelCollapseCard>

      {isNewsListWidget && (
        <BlockConfigPanelCollapseCard
          title="Tata Letak Konten"
          onCopy={() => {
            const value = getConfigForApply("listContentAlign");
            if (value !== undefined) applyToAllDevices("listContentAlign", value as ConfigValue);
          }}
          copyTitle="Terapkan tata letak konten Simple List ke semua device"
        >
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "left", label: "Kiri" },
              { key: "center", label: "Tengah" },
              { key: "right", label: "Kanan" },
            ].map((item) => {
              const isActive = getConfigString("listContentAlign", "left") === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => updateChildResponsiveConfig("listContentAlign", item.key)}
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
