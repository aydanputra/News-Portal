import type { ReactNode } from "react";
import type { ConfigValue } from "@/lib/page-builder-config";
import type {
  BlockConfigPanelCoreVisualProps,
} from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

type HeroSplitCategoryOptions = {
  title: string;
  showKey: string;
  textKey: string;
  bgKey: string;
  sizeKey: string;
  textDefault: string;
  bgDefault: string;
};

type HeroSplitTitleOptions = {
  title: string;
  colorKey: string;
  hoverKey: string;
  sizeKey: string;
  lineHeightKey: string;
  fontWeightKey: string;
  colorDefault: string;
  hoverDefault: string;
  fontWeightDefault: string;
};

type HeroSplitMetaOptions = {
  title: string;
  showMetaKey: string;
  showAuthorKey: string;
  showDateKey: string;
  colorKey: string;
  fontSizeKey: string;
  colorDefault: string;
};

type HeroSplitExcerptOptions = {
  title: string;
  showKey: string;
  lengthKey: string;
  colorKey: string;
  fontSizeKey: string;
  lineHeightKey: string;
  colorDefault: string;
};

type SharedHeroVisualProps = BlockConfigPanelCoreVisualProps;

type BlockConfigPanelHeroSplitVisualSectionProps = SharedHeroVisualProps & {
  renderHeroSplit4CategorySection: (options: HeroSplitCategoryOptions) => ReactNode;
  renderHeroSplit4TitleSection: (options: HeroSplitTitleOptions) => ReactNode;
  renderHeroSplit4MetaSection: (options: HeroSplitMetaOptions) => ReactNode;
  renderHeroSplit4ExcerptSection: (options: HeroSplitExcerptOptions) => ReactNode;
};

export function BlockConfigPanelHeroSplitVisualSection({
  child: _child,
  heroControlClass,
  globalAccentTone,
  globalNewsTitleColor,
  globalHoverColor,
  globalMetaTone,
  globalExcerptTone,
  getConfigBool,
  getConfigString,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  renderHeroSplit4CategorySection,
  renderHeroSplit4TitleSection,
  renderHeroSplit4MetaSection,
  renderHeroSplit4ExcerptSection,
}: BlockConfigPanelHeroSplitVisualSectionProps) {
  return (
    <>
      <BlockConfigPanelCollapseCard
        title="Pengaturan Media"
        onCopy={() => {
          ["imageHeight", "miniColumns", "miniImageHeight", "showMiniImage"].forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
        }}
        copyTitle="Terapkan pengaturan media Hero + 4 Mini ke semua device"
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Hero</label>
            <input
              type="number"
              min={0}
              className={heroControlClass}
              value={getConfigString("imageHeight")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("imageHeight", isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Kolom Mini</label>
            <select
              className={heroControlClass}
              value={getConfigString("miniColumns", "4")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("miniColumns", isNaN(val) ? undefined : val);
              }}
            >
              <option value={1}>1 Kolom</option>
              <option value={2}>2 Kolom</option>
              <option value={3}>3 Kolom</option>
              <option value={4}>4 Kolom</option>
            </select>
          </div>
          <div className="col-span-2 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
            <div>
              <div className="text-[11px] font-medium text-[var(--fg-primary)]">Thumbnail Mini</div>
              <div className="text-[10px] text-[var(--fg-secondary)] mt-0.5">Tampilkan gambar pada kartu mini.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={getConfigBool("showMiniImage", true)}
                onChange={(e) => updateChildConfig("showMiniImage", e.target.checked)}
              />
              <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
            </label>
          </div>
          {getConfigBool("showMiniImage", true) && (
            <div className="col-span-2">
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Thumbnail Mini</label>
              <input
                type="number"
                min={0}
                className={heroControlClass}
                value={getConfigString("miniImageHeight")}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateChildResponsiveConfig("miniImageHeight", isNaN(val) ? undefined : val);
                }}
              />
            </div>
          )}
        </div>
      </BlockConfigPanelCollapseCard>

      <BlockConfigPanelCollapseCard
        title="Pengaturan Teks Hero"
        onCopy={() => {
          [
            "showHeroCategory",
            "heroCategoryLabelFontSize",
            "heroCategoryLabelColor",
            "heroCategoryLabelBgColor",
            "heroTitleColor",
            "heroTitleHoverColor",
            "leadTitleFontSize",
            "heroTitleLineHeight",
            "heroTitleFontWeight",
            "showHeroMetaInfo",
            "showHeroAuthor",
            "showHeroDate",
            "heroMetaColor",
            "heroMetaFontSize",
            "showHeroExcerpt",
            "heroExcerptLength",
            "heroExcerptColor",
            "heroExcerptFontSize",
            "heroExcerptLineHeight",
          ].forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
        }}
        copyTitle="Terapkan pengaturan teks Hero ke semua device"
      >
        {renderHeroSplit4CategorySection({
          title: "Label Kategori",
          showKey: "showHeroCategory",
          textKey: "heroCategoryLabelColor",
          bgKey: "heroCategoryLabelBgColor",
          sizeKey: "heroCategoryLabelFontSize",
          textDefault: "#ffffff",
          bgDefault: globalAccentTone,
        })}

        {renderHeroSplit4TitleSection({
          title: "Judul",
          colorKey: "heroTitleColor",
          hoverKey: "heroTitleHoverColor",
          sizeKey: "leadTitleFontSize",
          lineHeightKey: "heroTitleLineHeight",
          fontWeightKey: "heroTitleFontWeight",
          colorDefault: globalNewsTitleColor,
          hoverDefault: globalHoverColor,
          fontWeightDefault: "800",
        })}

        {renderHeroSplit4MetaSection({
          title: "Meta",
          showMetaKey: "showHeroMetaInfo",
          showAuthorKey: "showHeroAuthor",
          showDateKey: "showHeroDate",
          colorKey: "heroMetaColor",
          fontSizeKey: "heroMetaFontSize",
          colorDefault: globalMetaTone,
        })}

        {renderHeroSplit4ExcerptSection({
          title: "Excerpt",
          showKey: "showHeroExcerpt",
          lengthKey: "heroExcerptLength",
          colorKey: "heroExcerptColor",
          fontSizeKey: "heroExcerptFontSize",
          lineHeightKey: "heroExcerptLineHeight",
          colorDefault: globalExcerptTone,
        })}
      </BlockConfigPanelCollapseCard>

      <BlockConfigPanelCollapseCard
        title="Pengaturan Teks Mini"
        onCopy={() => {
          [
            "showMiniCategory",
            "miniCategoryLabelFontSize",
            "miniCategoryLabelColor",
            "miniCategoryLabelBgColor",
            "miniTitleColor",
            "miniTitleHoverColor",
            "miniTitleFontSize",
            "miniTitleLineHeight",
            "miniTitleFontWeight",
            "showMiniMetaInfo",
            "showMiniAuthor",
            "showMiniDate",
            "miniMetaColor",
            "miniMetaFontSize",
            "showMiniExcerpt",
            "miniExcerptLength",
            "miniExcerptColor",
            "miniExcerptFontSize",
            "miniExcerptLineHeight",
          ].forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
        }}
        copyTitle="Terapkan pengaturan teks mini ke semua device"
      >
        {renderHeroSplit4CategorySection({
          title: "Label Kategori",
          showKey: "showMiniCategory",
          textKey: "miniCategoryLabelColor",
          bgKey: "miniCategoryLabelBgColor",
          sizeKey: "miniCategoryLabelFontSize",
          textDefault: "#ffffff",
          bgDefault: globalAccentTone,
        })}

        {renderHeroSplit4TitleSection({
          title: "Judul",
          colorKey: "miniTitleColor",
          hoverKey: "miniTitleHoverColor",
          sizeKey: "miniTitleFontSize",
          lineHeightKey: "miniTitleLineHeight",
          fontWeightKey: "miniTitleFontWeight",
          colorDefault: globalNewsTitleColor,
          hoverDefault: globalHoverColor,
          fontWeightDefault: "700",
        })}

        {renderHeroSplit4MetaSection({
          title: "Meta",
          showMetaKey: "showMiniMetaInfo",
          showAuthorKey: "showMiniAuthor",
          showDateKey: "showMiniDate",
          colorKey: "miniMetaColor",
          fontSizeKey: "miniMetaFontSize",
          colorDefault: globalMetaTone,
        })}

        {renderHeroSplit4ExcerptSection({
          title: "Excerpt",
          showKey: "showMiniExcerpt",
          lengthKey: "miniExcerptLength",
          colorKey: "miniExcerptColor",
          fontSizeKey: "miniExcerptFontSize",
          lineHeightKey: "miniExcerptLineHeight",
          colorDefault: globalExcerptTone,
        })}
      </BlockConfigPanelCollapseCard>
    </>
  );
}

type BlockConfigPanelHeroSliderVisualSectionProps = SharedHeroVisualProps & {
  hideMediaSection?: boolean;
  hideNavigationSection?: boolean;
  hideMiniThumbnailSection?: boolean;
};

export function BlockConfigPanelHeroSliderVisualSection({
  child,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalAccentTone,
  globalWidgetTitleColor,
  globalNewsTitleColor,
  globalHoverColor,
  globalMetaTone,
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
  hideMediaSection = false,
  hideNavigationSection = false,
  hideMiniThumbnailSection = false,
}: BlockConfigPanelHeroSliderVisualSectionProps) {
  return (
    <>
      {!hideMediaSection && (
      <BlockConfigPanelCollapseCard
        title="Pengaturan Media"
        onCopy={() => {
          ["imageHeight", "overlayOpacity"].forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
        }}
        copyTitle="Terapkan pengaturan media Hero Slider ke semua device"
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Slide</label>
            <input
              type="number"
              min={0}
              className={heroControlClass}
              value={getConfigString("imageHeight")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("imageHeight", isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Opacity Overlay</label>
            <input
              type="number"
              min={0}
              max={100}
              className={heroControlClass}
              value={getConfigString("overlayOpacity", "70")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("overlayOpacity", isNaN(val) ? undefined : Math.max(0, Math.min(100, val)));
              }}
            />
          </div>
        </div>
      </BlockConfigPanelCollapseCard>
      )}

      {!hideNavigationSection && (
      <BlockConfigPanelCollapseCard title="Pengaturan Navigasi">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                checked={getConfigBool("showArrows", true)}
                onChange={(e) => updateChildConfig("showArrows", e.target.checked)}
              />
              <span className="text-[11px] font-medium text-[var(--fg-primary)]">Panah</span>
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                checked={getConfigBool("showDots", true)}
                onChange={(e) => updateChildConfig("showDots", e.target.checked)}
              />
              <span className="text-[11px] font-medium text-[var(--fg-primary)]">Dots</span>
            </label>
          </div>
          <ColorPicker
            label="Dot Aktif"
            configKey="dotColor"
            globalDefault={globalAccentTone}
            triggerClassName={heroColorTriggerClass}
            swatchClassName={heroColorSwatchClass}
            inputClassName={heroColorInputClass}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Dot Nonaktif"
            configKey="dotInactiveColor"
            globalDefault="color-mix(in srgb, var(--accent) 30%, transparent)"
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

      {!hideMiniThumbnailSection && (
      <BlockConfigPanelCollapseCard title="Thumbnail">
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
            <div>
              <div className="text-[11px] font-medium text-[var(--fg-primary)]">Tampilkan Thumbnail</div>
              <div className="text-[10px] text-[var(--fg-secondary)] mt-0.5">Strip thumbnail di bawah slider.</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={getConfigBool("showMiniThumbnails", false)}
                onChange={(e) => updateChildConfig("showMiniThumbnails", e.target.checked)}
              />
              <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
            </label>
          </div>
          {getConfigBool("showMiniThumbnails", false) && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jumlah Thumbnail</label>
                <select
                  className={heroControlClass}
                  value={getConfigString("thumbnailVisibleCount", "4")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildConfig("thumbnailVisibleCount", isNaN(val) ? undefined : val);
                  }}
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Thumbnail</label>
                <input
                  type="number"
                  min={0}
                  className={heroControlClass}
                  value={getConfigString("thumbnailImageHeight", "72")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("thumbnailImageHeight", isNaN(val) ? undefined : val);
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
            "blockTitleMarginBottom",
            "blockTitlePaddingBottom",
            "showCategory",
            "categoryLabelFontSize",
            "categoryLabelColor",
            "categoryLabelBgColor",
            "categoryLabelBorderRadius",
            "titleColor",
            "titleHoverColor",
            "titleFontSize",
            "titleLineHeight",
            "titleFontWeight",
            "showMetaInfo",
            "showAuthor",
            "showDate",
            "metaColor",
            "metaFontSize",
            "showExcerpt",
            "excerptLength",
            "excerptColor",
            "excerptFontSize",
            "excerptLineHeight",
          ].forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
        }}
        copyTitle="Terapkan pengaturan teks Hero Slider ke semua device"
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

        {renderHeroTextSection(
          "Label Kategori",
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--fg-secondary)]">Tampil</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={getConfigBool("showCategory", true)}
                  onChange={(e) => updateChildResponsiveConfig("showCategory", e.target.checked)}
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
                  value={getConfigString("categoryLabelFontSize")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("categoryLabelFontSize", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Radius</label>
                <select
                  className={heroControlClass}
                  value={getConfigString("categoryLabelBorderRadius", "global")}
                  onChange={(e) => updateChildResponsiveConfig("categoryLabelBorderRadius", e.target.value)}
                >
                  <option value="global">Global</option>
                  <option value="none">Kotak</option>
                  <option value="sm">Kecil</option>
                  <option value="md">Sedang</option>
                  <option value="lg">Besar</option>
                  <option value="xl">XL</option>
                  <option value="full">Pill</option>
                </select>
              </div>
              <ColorPicker
                label="Teks"
                configKey="categoryLabelColor"
                globalDefault="#ffffff"
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
                configKey="categoryLabelBgColor"
                globalDefault={globalAccentTone}
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

        {renderHeroTextSection(
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
                value={getConfigString("titleFontWeight", "600")}
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

        {renderHeroTextSection(
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
            </div>
          </>,
        )}

        {renderHeroTextSection(
          "Excerpt",
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--fg-secondary)]">Tampil</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={getConfigBool("showExcerpt", true)}
                  onChange={(e) => updateChildResponsiveConfig("showExcerpt", e.target.checked)}
                />
                <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Panjang</label>
                <input
                  type="number"
                  min={0}
                  className={heroControlClass}
                  value={getConfigString("excerptLength", "120")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildConfig("excerptLength", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
                <input
                  type="number"
                  className={heroControlClass}
                  value={getConfigString("excerptFontSize")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("excerptFontSize", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Baris</label>
                <input
                  type="number"
                  step="0.1"
                  className={heroControlClass}
                  value={getConfigString("excerptLineHeight")}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateChildResponsiveConfig("excerptLineHeight", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <ColorPicker
                label="Warna"
                configKey="excerptColor"
                globalDefault={globalExcerptTone}
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
    </>
  );
}
