import {
  BlockConfigPanelSharedCategoryTextSectionProps,
  BlockConfigPanelSharedExcerptTextSectionProps,
  BlockConfigPanelSharedMetaTextSectionProps,
  BlockConfigPanelSharedTitleTextSectionProps,
} from "./BlockConfigPanelSharedTypes";

export function BlockConfigPanelSharedCategoryTextSection({
  textDefault,
  backgroundDefault,
  showMarginBottom = true,
  child,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  getConfigBool,
  getConfigString,
  getConfigValue,
  updateChildResponsiveConfig,
  updateChildConfig,
  renderHeroTextSection,
  ColorPicker,
}: BlockConfigPanelSharedCategoryTextSectionProps) {
  return renderHeroTextSection(
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
        <ColorPicker
          label="Teks"
          configKey="categoryLabelTextColor"
          globalDefault={textDefault}
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
          globalDefault={backgroundDefault}
          triggerClassName={heroColorTriggerClass}
          swatchClassName={heroColorSwatchClass}
          inputClassName={heroColorInputClass}
          child={child}
          getConfigValue={getConfigValue}
          updateChildResponsiveConfig={updateChildResponsiveConfig}
          updateChildConfig={updateChildConfig}
        />
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Padding X</label>
          <input
            type="number"
            className={heroControlClass}
            value={getConfigString("categoryLabelPaddingX")}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              updateChildResponsiveConfig("categoryLabelPaddingX", isNaN(val) ? undefined : val);
            }}
          />
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Padding Y</label>
          <input
            type="number"
            className={heroControlClass}
            value={getConfigString("categoryLabelPaddingY")}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              updateChildResponsiveConfig("categoryLabelPaddingY", isNaN(val) ? undefined : val);
            }}
          />
        </div>
        {showMarginBottom && (
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jarak Bawah</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("categoryLabelMarginBottom")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("categoryLabelMarginBottom", isNaN(val) ? undefined : val);
              }}
            />
          </div>
        )}
        <div className="col-span-2">
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
            <option value="2xl">2XL</option>
            <option value="full">Pill</option>
          </select>
        </div>
      </div>
    </>,
  );
}

export function BlockConfigPanelSharedTitleTextSection({
  colorKey,
  hoverColorKey,
  fontSizeKey,
  lineHeightKey,
  fontWeightKey,
  marginBottomKey,
  colorDefault,
  hoverColorDefault,
  fontWeightDefault,
  child,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  getConfigString,
  getConfigValue,
  updateChildResponsiveConfig,
  updateChildConfig,
  renderHeroTextSection,
  ColorPicker,
}: BlockConfigPanelSharedTitleTextSectionProps) {
  return renderHeroTextSection(
    "Judul",
    <div className="grid grid-cols-2 gap-2">
      <ColorPicker
        label="Teks"
        configKey={colorKey}
        globalDefault={colorDefault}
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
        configKey={hoverColorKey}
        globalDefault={hoverColorDefault}
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
          value={getConfigString(fontSizeKey)}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            updateChildResponsiveConfig(fontSizeKey, isNaN(val) ? undefined : val);
          }}
        />
      </div>
      <div>
        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Baris</label>
        <input
          type="number"
          step="0.1"
          className={heroControlClass}
          value={getConfigString(lineHeightKey)}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            updateChildResponsiveConfig(lineHeightKey, isNaN(val) ? undefined : val);
          }}
        />
      </div>
      <div>
        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
        <select
          className={heroControlClass}
          value={getConfigString(fontWeightKey) || fontWeightDefault}
          onChange={(e) => updateChildResponsiveConfig(fontWeightKey, e.target.value)}
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
          value={getConfigString(marginBottomKey)}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            updateChildResponsiveConfig(marginBottomKey, isNaN(val) ? undefined : val);
          }}
        />
      </div>
    </div>,
  );
}

export function BlockConfigPanelSharedMetaTextSection({
  child,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalMetaTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  updateChildResponsiveConfig,
  updateChildConfig,
  renderHeroTextSection,
  ColorPicker,
}: BlockConfigPanelSharedMetaTextSectionProps) {
  return renderHeroTextSection(
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
            value={getConfigString("metaFontWeight") || "500"}
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
  );
}

export function BlockConfigPanelSharedExcerptTextSection({
  child,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalExcerptTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  updateChildResponsiveConfig,
  updateChildConfig,
  renderHeroTextSection,
  ColorPicker,
}: BlockConfigPanelSharedExcerptTextSectionProps) {
  return renderHeroTextSection(
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
            value={getConfigString("excerptLength")}
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
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
          <select
            className={heroControlClass}
            value={getConfigString("excerptFontWeight") || "400"}
            onChange={(e) => updateChildResponsiveConfig("excerptFontWeight", e.target.value)}
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
  );
}
