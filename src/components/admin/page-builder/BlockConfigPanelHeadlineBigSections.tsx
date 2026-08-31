import { Copy } from "lucide-react";
import type {
  BlockConfigPanelHeadlineBigAdvancedSectionProps,
  BlockConfigPanelHeadlineBigContentSectionProps,
  BlockConfigPanelHeadlineBigStyleSectionProps,
} from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

export function BlockConfigPanelHeadlineBigContentSection({
  heroTextControlClass,
  heroControlClass,
  getConfigString,
  updateChildConfig,
  renderSharedSourceFilterFields,
}: BlockConfigPanelHeadlineBigContentSectionProps) {
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

export function BlockConfigPanelHeadlineBigStyleSection({
  child,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalWidgetTitleColor,
  globalAccentTone,
  globalNewsTitleColor,
  globalHoverColor,
  globalSurfaceTone,
  globalBorderTone,
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
}: BlockConfigPanelHeadlineBigStyleSectionProps) {
  return (
    <>
      <BlockConfigPanelCollapseCard
        title="Pengaturan Media"
        onCopy={() => {
          const imageHeight = getConfigForApply("imageHeight");
          if (imageHeight !== undefined) applyToAllDevices("imageHeight", imageHeight);
        }}
        copyTitle="Terapkan pengaturan media ke semua device"
      >
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi</label>
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
      </BlockConfigPanelCollapseCard>

      <BlockConfigPanelCollapseCard
        title="Pengaturan Teks"
        onCopy={() => {
          [
            "showTitle",
            "blockTitleFontSize",
            "blockTitleColor",
            "blockTitleBorderColor",
            "showCategory",
            "categoryLabelFontSize",
            "categoryLabelTextColor",
            "categoryLabelBgColor",
            "categoryLabelPaddingX",
            "categoryLabelPaddingY",
            "categoryLabelBorderRadius",
            "titleColor",
            "titleHoverColor",
            "titleFontSize",
            "titleLineHeight",
            "titleFontWeight",
            "titleMarginBottom",
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
            "excerptMarginBottom",
          ].forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value);
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
          textDefault: "#ffffff",
          backgroundDefault: globalAccentTone,
          showMarginBottom: false,
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

      <BlockConfigPanelCollapseCard
        title="Pengaturan Tombol"
        onCopy={() => {
          [
            "showReadMore",
            "readMoreText",
            "readMoreFontSize",
            "readMorePaddingX",
            "readMorePaddingY",
            "readMoreTextColor",
            "readMoreHoverTextColor",
            "readMoreBgColor",
            "readMoreHoverBgColor",
            "readMoreBorderColor",
            "readMoreHoverBorderColor",
            "readMoreBorderRadius",
          ].forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value);
          });
        }}
        copyTitle="Terapkan pengaturan Read More ke semua device"
      >
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--fg-secondary)]">Tampil</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={getConfigBool("showReadMore", true)}
                onChange={(e) => updateChildResponsiveConfig("showReadMore", e.target.checked)}
              />
              <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
            </label>
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Teks Tombol</label>
            <input
              type="text"
              className={heroControlClass}
              value={getConfigString("readMoreText", "READ MORE")}
              onChange={(e) => updateChildResponsiveConfig("readMoreText", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
              <input
                type="number"
                className={heroControlClass}
                value={getConfigString("readMoreFontSize")}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateChildResponsiveConfig("readMoreFontSize", isNaN(val) ? undefined : val);
                }}
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Radius</label>
              <input
                type="number"
                className={heroControlClass}
                value={getConfigString("readMoreBorderRadius")}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateChildResponsiveConfig("readMoreBorderRadius", isNaN(val) ? undefined : val);
                }}
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Padding X</label>
              <input
                type="number"
                className={heroControlClass}
                value={getConfigString("readMorePaddingX")}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateChildResponsiveConfig("readMorePaddingX", isNaN(val) ? undefined : val);
                }}
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Padding Y</label>
              <input
                type="number"
                className={heroControlClass}
                value={getConfigString("readMorePaddingY")}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateChildResponsiveConfig("readMorePaddingY", isNaN(val) ? undefined : val);
                }}
              />
            </div>
            <ColorPicker
              label="Teks"
              configKey="readMoreTextColor"
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
              label="Teks Sorot"
              configKey="readMoreHoverTextColor"
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
              label="Latar"
              configKey="readMoreBgColor"
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
              label="Latar Sorot"
              configKey="readMoreHoverBgColor"
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
              label="Garis"
              configKey="readMoreBorderColor"
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
              label="Garis Sorot"
              configKey="readMoreHoverBorderColor"
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
        </div>
      </BlockConfigPanelCollapseCard>
    </>
  );
}

export function BlockConfigPanelHeadlineBigAdvancedSection({
  renderSharedVisibilitySettings,
  renderSharedBoxBackgroundSettings,
  renderSharedWidgetSpacingSettings,
}: BlockConfigPanelHeadlineBigAdvancedSectionProps) {
  return (
    <div className="space-y-4">
      {renderSharedVisibilitySettings()}
      {renderSharedBoxBackgroundSettings("Terapkan background Headline Big ke semua device")}
      {renderSharedWidgetSpacingSettings("Terapkan margin dan padding Headline Big ke semua device")}
    </div>
  );
}
