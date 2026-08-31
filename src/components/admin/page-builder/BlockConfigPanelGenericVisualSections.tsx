import { Copy } from "lucide-react";
import type { ConfigValue } from "@/lib/page-builder-config";
import type { BlockConfigPanelSurfaceVisualProps } from "./BlockConfigPanelSharedTypes";

type BlockConfigPanelGenericNewsVisualProps = Pick<
  BlockConfigPanelSurfaceVisualProps,
  | "child"
  | "globalSurfaceTone"
  | "globalNewsTitleColor"
  | "globalMetaTone"
  | "globalExcerptTone"
  | "getConfigBool"
  | "getConfigString"
  | "getConfigValue"
  | "getConfigForApply"
  | "applyToAllDevices"
  | "updateChildResponsiveConfig"
  | "updateChildConfig"
  | "ColorPicker"
>;

export function BlockConfigPanelGenericBackgroundVisualSection({
  child,
  globalSurfaceTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelGenericNewsVisualProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Latar</label>
        <button
          onClick={() => {
            const useBox = getConfigForApply("useBox");
            const boxColor = getConfigForApply("boxColor");
            const boxRadius = getConfigForApply("boxBorderRadius");
            if (useBox !== undefined) applyToAllDevices("useBox", useBox as ConfigValue);
            if (boxColor !== undefined) applyToAllDevices("boxColor", boxColor as ConfigValue);
            if (boxRadius !== undefined) applyToAllDevices("boxBorderRadius", boxRadius as ConfigValue);
          }}
          className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
          title="Terapkan pengaturan ini ke semua device"
        >
          <Copy size={10} /> Semua
        </button>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-[var(--fg-primary)]">Aktifkan Latar</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={getConfigBool("useBox")}
            onChange={(e) => updateChildResponsiveConfig("useBox", e.target.checked)}
          />
          <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
        </label>
      </div>
      {getConfigBool("useBox") && (
        <div className="grid grid-cols-2 gap-2 bg-[var(--bg-base)] p-2 rounded-lg border border-[var(--border)]">
          <ColorPicker
            label="Warna Latar"
            configKey="boxColor"
            globalDefault={globalSurfaceTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <div>
            <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius</label>
            <select
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
              value={getConfigString("boxBorderRadius", "xl")}
              onChange={(e) => updateChildResponsiveConfig("boxBorderRadius", e.target.value)}
            >
              <option value="none">Kotak (0px)</option>
              <option value="sm">Kecil</option>
              <option value="md">Sedang</option>
              <option value="lg">Besar</option>
              <option value="xl">XL</option>
              <option value="2xl">2XL</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export function BlockConfigPanelGenericThumbnailVisualSection({
  getConfigString,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
}: BlockConfigPanelGenericNewsVisualProps) {
  return (
    <div className="mb-4 border-t border-[var(--border)] pt-3">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Thumbnail / Gambar</label>
        <button
          onClick={() => {
            const w = getConfigForApply("imageWidth");
            const h = getConfigForApply("imageHeight");
            const r = getConfigForApply("imageBorderRadius");
            if (w !== undefined) applyToAllDevices("imageWidth", w as ConfigValue);
            if (h !== undefined) applyToAllDevices("imageHeight", h as ConfigValue);
            if (r !== undefined) applyToAllDevices("imageBorderRadius", r as ConfigValue);
          }}
          className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
          title="Terapkan pengaturan ini ke semua device"
        >
          <Copy size={10} /> Semua
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Width</label>
          <input
            type="text"
            placeholder="e.g. 100% or 300px"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] focus:border-[var(--accent)] outline-none h-8 text-[var(--fg-primary)]"
            value={getConfigString("imageWidth")}
            onChange={(e) => updateChildResponsiveConfig("imageWidth", e.target.value)}
          />
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Height</label>
          <input
            type="text"
            placeholder="e.g. 200px"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] focus:border-[var(--accent)] outline-none h-8 text-[var(--fg-primary)]"
            value={getConfigString("imageHeight")}
            onChange={(e) => updateChildResponsiveConfig("imageHeight", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Radius (px)</label>
        <input
          type="number"
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] focus:border-[var(--accent)] outline-none h-8 text-[var(--fg-primary)]"
          placeholder="Default (Global)"
          value={getConfigString("imageBorderRadius")}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            updateChildResponsiveConfig("imageBorderRadius", Number.isNaN(val) ? undefined : val);
          }}
        />
      </div>
    </div>
  );
}

export function BlockConfigPanelGenericTitleVisualSection({
  child,
  globalNewsTitleColor,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelGenericNewsVisualProps) {
  return (
    <div className="mb-4 border-t border-[var(--border)] pt-3">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Judul Konten</label>
        <button
          onClick={() => {
            const titleColor = getConfigForApply("titleColor");
            const titleSize = getConfigForApply("titleFontSize");
            const titleLh = getConfigForApply("titleLineHeight");
            const titleMb = getConfigForApply("titleMarginBottom");
            if (titleColor !== undefined) applyToAllDevices("titleColor", titleColor as ConfigValue);
            if (titleSize !== undefined) applyToAllDevices("titleFontSize", titleSize as ConfigValue);
            if (titleLh !== undefined) applyToAllDevices("titleLineHeight", titleLh as ConfigValue);
            if (titleMb !== undefined) applyToAllDevices("titleMarginBottom", titleMb as ConfigValue);
          }}
          className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
          title="Terapkan pengaturan ini ke semua device"
        >
          <Copy size={10} /> Semua
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <ColorPicker
          label="Warna Judul"
          configKey="titleColor"
          globalDefault={globalNewsTitleColor}
          child={child}
          getConfigValue={getConfigValue}
          updateChildResponsiveConfig={updateChildResponsiveConfig}
          updateChildConfig={updateChildConfig}
        />
        <div>
          <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Ukuran (px)</label>
          <input
            type="number"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
            value={getConfigString("titleFontSize")}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              updateChildResponsiveConfig("titleFontSize", Number.isNaN(val) ? undefined : val);
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Tinggi Baris</label>
          <input
            type="number"
            step="0.1"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
            value={getConfigString("titleLineHeight")}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              updateChildResponsiveConfig("titleLineHeight", Number.isNaN(val) ? undefined : val);
            }}
          />
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-primary)] block mb-1 font-medium">Jarak Vertikal (Y)</label>
          <input
            type="number"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
            value={getConfigString("titleMarginBottom")}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              updateChildResponsiveConfig("titleMarginBottom", Number.isNaN(val) ? undefined : val);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function BlockConfigPanelGenericMetaVisualSection({
  child,
  globalMetaTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelGenericNewsVisualProps) {
  return (
    <div className="mb-4 border-t border-[var(--border)] pt-3">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Meta Konten</label>
        <button
          onClick={() => {
            const metaColor = getConfigForApply("metaColor");
            const metaSize = getConfigForApply("metaFontSize");
            const showMetaInfo = getConfigForApply("showMetaInfo");
            const showAuthor = getConfigForApply("showAuthor");
            const showDate = getConfigForApply("showDate");
            if (metaColor !== undefined) applyToAllDevices("metaColor", metaColor as ConfigValue);
            if (metaSize !== undefined) applyToAllDevices("metaFontSize", metaSize as ConfigValue);
            if (showMetaInfo !== undefined) applyToAllDevices("showMetaInfo", showMetaInfo as ConfigValue);
            if (showAuthor !== undefined) applyToAllDevices("showAuthor", showAuthor as ConfigValue);
            if (showDate !== undefined) applyToAllDevices("showDate", showDate as ConfigValue);
          }}
          className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
          title="Terapkan pengaturan ini ke semua device"
        >
          <Copy size={10} /> Semua
        </button>
      </div>
      <div className="mb-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            checked={getConfigBool("showMetaInfo", true)}
            onChange={(e) => updateChildResponsiveConfig("showMetaInfo", e.target.checked)}
          />
          <span className="text-[10px] text-[var(--fg-secondary)]">Tampilkan Meta</span>
        </label>
      </div>
      <div className="flex gap-4 mb-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            checked={getConfigBool("showAuthor", true)}
            onChange={(e) => updateChildResponsiveConfig("showAuthor", e.target.checked)}
            disabled={!getConfigBool("showMetaInfo", true)}
          />
          <span className="text-[10px] text-[var(--fg-secondary)]">Author</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            checked={getConfigBool("showDate", true)}
            onChange={(e) => updateChildResponsiveConfig("showDate", e.target.checked)}
            disabled={!getConfigBool("showMetaInfo", true)}
          />
          <span className="text-[10px] text-[var(--fg-secondary)]">Tanggal</span>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ColorPicker
          label="Warna Meta"
          configKey="metaColor"
          globalDefault={globalMetaTone}
          child={child}
          getConfigValue={getConfigValue}
          updateChildResponsiveConfig={updateChildResponsiveConfig}
          updateChildConfig={updateChildConfig}
        />
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran (px)</label>
          <input
            type="number"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
            value={getConfigString("metaFontSize")}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              updateChildResponsiveConfig("metaFontSize", Number.isNaN(val) ? undefined : val);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function BlockConfigPanelGenericExcerptVisualSection({
  child,
  globalExcerptTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelGenericNewsVisualProps) {
  return (
    <div className="mb-4 border-t border-[var(--border)] pt-3">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[11px] font-bold text-[var(--fg-primary)] block">Kutipan (Excerpt)</label>
        <button
          onClick={() => {
            const excerptColor = getConfigForApply("excerptColor");
            const excerptSize = getConfigForApply("excerptFontSize");
            const excerptLh = getConfigForApply("excerptLineHeight");
            const excerptLength = getConfigForApply("excerptLength");
            const showExcerpt = getConfigForApply("showExcerpt");
            if (excerptColor !== undefined) applyToAllDevices("excerptColor", excerptColor as ConfigValue);
            if (excerptSize !== undefined) applyToAllDevices("excerptFontSize", excerptSize as ConfigValue);
            if (excerptLh !== undefined) applyToAllDevices("excerptLineHeight", excerptLh as ConfigValue);
            if (excerptLength !== undefined) applyToAllDevices("excerptLength", excerptLength as ConfigValue);
            if (showExcerpt !== undefined) applyToAllDevices("showExcerpt", showExcerpt as ConfigValue);
          }}
          className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
          title="Terapkan pengaturan ini ke semua device"
        >
          <Copy size={10} /> Semua
        </button>
      </div>
      <div className="flex gap-4 mb-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
            checked={getConfigBool("showExcerpt", true)}
            onChange={(e) => updateChildResponsiveConfig("showExcerpt", e.target.checked)}
          />
          <span className="text-[10px] text-[var(--fg-secondary)]">Tampilkan Kutipan</span>
        </label>
      </div>
      <div className="mb-3">
        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Panjang Karakter</label>
        <input
          type="number"
          placeholder="Default: 200"
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
          value={getConfigString("excerptLength")}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            updateChildResponsiveConfig("excerptLength", Number.isNaN(val) ? undefined : val);
          }}
        />
        <p className="text-[9px] text-[var(--fg-muted)] mt-1">Nilai mengikuti device aktif. Gunakan tombol Semua untuk menerapkan ke semua ukuran layar.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <ColorPicker
          label="Warna Kutipan"
          configKey="excerptColor"
          globalDefault={globalExcerptTone}
          child={child}
          getConfigValue={getConfigValue}
          updateChildResponsiveConfig={updateChildResponsiveConfig}
          updateChildConfig={updateChildConfig}
        />
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran (px)</label>
          <input
            type="number"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
            value={getConfigString("excerptFontSize")}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              updateChildResponsiveConfig("excerptFontSize", Number.isNaN(val) ? undefined : val);
            }}
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Baris</label>
        <input
          type="number"
          step="0.1"
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-[10px] outline-none h-8 text-[var(--fg-primary)] focus:border-[var(--accent)]"
          value={getConfigString("excerptLineHeight")}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            updateChildResponsiveConfig("excerptLineHeight", Number.isNaN(val) ? undefined : val);
          }}
        />
      </div>
    </div>
  );
}
