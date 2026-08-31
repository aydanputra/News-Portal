import { Copy } from "lucide-react";
import type {
  BlockConfigPanelHeroLayoutSectionProps,
  BlockConfigPanelHeroTextSettingsSectionProps,
} from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

export function BlockConfigPanelHeroLayoutSection({
  isClassicHeroWidget,
  heroControlClass,
  getConfigString,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
}: BlockConfigPanelHeroLayoutSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Pengaturan Media"
      onCopy={() => {
        const imageHeight = getConfigForApply("imageHeight");
        const cpTop = getConfigForApply("contentPaddingTop");
        const cpRight = getConfigForApply("contentPaddingRight");
        const cpBottom = getConfigForApply("contentPaddingBottom");
        const cpLeft = getConfigForApply("contentPaddingLeft");
        if (imageHeight !== undefined) applyToAllDevices("imageHeight", imageHeight);
        if (cpTop !== undefined) applyToAllDevices("contentPaddingTop", cpTop);
        if (cpRight !== undefined) applyToAllDevices("contentPaddingRight", cpRight);
        if (cpBottom !== undefined) applyToAllDevices("contentPaddingBottom", cpBottom);
        if (cpLeft !== undefined) applyToAllDevices("contentPaddingLeft", cpLeft);
      }}
      copyTitle="Terapkan layout Hero ke semua device"
    >
      <div className="grid grid-cols-2 gap-2">
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
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Rasio</label>
          <select
            className={heroControlClass}
            value={getConfigString("imageRatio", "auto")}
            onChange={(e) => updateChildConfig("imageRatio", e.target.value)}
          >
            <option value="auto">Auto / Ikuti Tinggi</option>
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            <option value="3:2">3:2</option>
            <option value="21:9">21:9</option>
          </select>
        </div>
      </div>
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelHeroTextSettingsSection({
  isClassicHeroWidget,
  globalAccentTone,
  globalNewsTitleColor,
  globalHoverColor,
  getConfigForApply,
  applyToAllDevices,
  renderSharedCategoryTextSection,
  renderSharedTitleTextSection,
  renderSharedMetaTextSection,
  renderSharedExcerptTextSection,
}: BlockConfigPanelHeroTextSettingsSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Pengaturan Teks"
      onCopy={() => {
        [
          "showCategory",
          "categoryLabelFontSize",
          "categoryLabelTextColor",
          "categoryLabelBgColor",
          "categoryLabelPaddingX",
          "categoryLabelPaddingY",
          "categoryLabelMarginBottom",
          "categoryLabelBorderRadius",
          "newsTitleFontSize",
          "newsTitleLineHeight",
          "newsTitleFontWeight",
          "newsTitleColor",
          "newsTitleHoverColor",
          "newsTitleMarginBottom",
          "showMetaInfo",
          "showAuthor",
          "showDate",
          "metaFontSize",
          "metaFontWeight",
          "metaColor",
          "metaMarginBottom",
          "showExcerpt",
          "excerptFontSize",
          "excerptLineHeight",
          "excerptFontWeight",
          "excerptColor",
        ].forEach((key) => {
          const value = getConfigForApply(key);
          if (value !== undefined) applyToAllDevices(key, value);
        });
      }}
      copyTitle="Terapkan pengaturan teks Hero ke semua device"
    >
      {renderSharedCategoryTextSection({
        textDefault: "#ffffff",
        backgroundDefault: globalAccentTone,
      })}

      {renderSharedTitleTextSection({
        colorKey: "newsTitleColor",
        hoverColorKey: "newsTitleHoverColor",
        fontSizeKey: "newsTitleFontSize",
        lineHeightKey: "newsTitleLineHeight",
        fontWeightKey: "newsTitleFontWeight",
        marginBottomKey: "newsTitleMarginBottom",
        colorDefault: globalNewsTitleColor,
        hoverColorDefault: globalHoverColor,
        fontWeightDefault: "700",
      })}

      {renderSharedMetaTextSection()}

      {renderSharedExcerptTextSection()}
    </BlockConfigPanelCollapseCard>
  );
}
