import { Copy } from "lucide-react";
import type { ConfigValue } from "@/lib/page-builder-config";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";
import type { BlockConfigPanelSharedBoxBackgroundProps } from "./BlockConfigPanelSharedTypes";

const BOX_BACKGROUND_KEYS = [
  "useBox",
  "boxColor",
  "backgroundImage",
  "backgroundSize",
  "backgroundPosition",
  "backgroundRepeat",
  "backgroundAttachment",
  "backgroundOverlayColor",
  "backgroundOverlayOpacity",
  "boxBorderRadius",
  "boxBorderWidth",
  "boxBorderStyle",
  "boxBorderColor",
  "boxPaddingTop",
  "boxPaddingRight",
  "boxPaddingBottom",
  "boxPaddingLeft",
] as const;

const BOX_PADDING_SIDES = ["Top", "Right", "Bottom", "Left"] as const;

export function BlockConfigPanelSharedBoxBackgroundSection({
  child,
  globalSurfaceTone,
  globalBorderTone,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
  options,
  deviceLabel,
  controlClassName,
  isPostBuilder,
  openMediaLibraryForKey,
}: BlockConfigPanelSharedBoxBackgroundProps) {
  const {
    copyTitle,
    sectionTitle = "Latar",
    toggleLabel = "Aktifkan",
    colorLabel = "Warna",
    radiusLabel = "Radius",
    paddingLabel = "Padding Latar",
    showBorderControls = false,
    borderColorLabel = "Warna Garis",
    borderWidthLabel = "Ketebalan Garis (px)",
    borderStyleLabel = "Gaya Garis",
  } = options;

  return (
    <BlockConfigPanelCollapseCard
      title={sectionTitle}
      className={isPostBuilder ? "post-builder-panel-card" : ""}
      badge={
        <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
          {deviceLabel}
        </span>
      }
      collapsible
      defaultOpen={false}
      onCopy={() => {
        BOX_BACKGROUND_KEYS.forEach((key) => {
          const value = getConfigForApply(key);
          if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
        });
      }}
      copyTitle={copyTitle}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[var(--fg-secondary)]">{toggleLabel}</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={getConfigBool("useBox", false)}
            onChange={(e) => updateChildResponsiveConfig("useBox", e.target.checked)}
          />
          <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
        </label>
      </div>
      {getConfigBool("useBox", false) && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <ColorPicker
            label={colorLabel}
            configKey="boxColor"
            globalDefault={globalSurfaceTone}
            triggerClassName={heroColorTriggerClass}
            swatchClassName={heroColorSwatchClass}
            inputClassName={heroColorInputClass}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">{radiusLabel}</label>
            <select
              className={controlClassName}
              value={getConfigString("boxBorderRadius", "global")}
              onChange={(e) => updateChildResponsiveConfig("boxBorderRadius", e.target.value)}
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
          {showBorderControls && (
            <>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">{borderWidthLabel}</label>
                <input
                  type="number"
                  min="0"
                  className={controlClassName}
                  value={getConfigString("boxBorderWidth", "1")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("boxBorderWidth", Number.isNaN(val) ? undefined : Math.max(0, val));
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">{borderStyleLabel}</label>
                <select
                  className={controlClassName}
                  value={getConfigString("boxBorderStyle", "solid")}
                  onChange={(e) => updateChildResponsiveConfig("boxBorderStyle", e.target.value)}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                  <option value="none">None</option>
                </select>
              </div>
              <ColorPicker
                label={borderColorLabel}
                configKey="boxBorderColor"
                globalDefault={globalBorderTone}
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
            </>
          )}
          <div className="col-span-2">
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Gambar Latar</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://..."
                className={`${controlClassName} flex-1`}
                value={getConfigString("backgroundImage")}
                onChange={(e) => updateChildResponsiveConfig("backgroundImage", e.target.value)}
              />
              <button
                type="button"
                onClick={() => openMediaLibraryForKey("backgroundImage")}
                className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90"
              >
                Pilih
              </button>
            </div>
          </div>
          {getConfigString("backgroundImage") && (
            <div className="col-span-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] p-2">
              <div className="flex items-center gap-3">
                <div className="h-14 w-20 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-surface)] shrink-0">
                  <img
                    src={getConfigString("backgroundImage")}
                    alt="Preview background"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-medium text-[var(--fg-primary)] mb-1">Preview</div>
                  <div className="text-[10px] text-[var(--fg-secondary)] truncate">
                    {getConfigString("backgroundImage")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateChildResponsiveConfig("backgroundImage", "")}
                  className="shrink-0 text-[10px] text-[var(--danger,#dc2626)] hover:opacity-80"
                >
                  Hapus
                </button>
              </div>
            </div>
          )}
          {getConfigString("backgroundImage") && (
            <div className="col-span-2 grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Size</label>
                <select
                  className={controlClassName}
                  value={getConfigString("backgroundSize", "cover")}
                  onChange={(e) => updateChildResponsiveConfig("backgroundSize", e.target.value)}
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Position</label>
                <select
                  className={controlClassName}
                  value={getConfigString("backgroundPosition", "center")}
                  onChange={(e) => updateChildResponsiveConfig("backgroundPosition", e.target.value)}
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="top left">Top Left</option>
                  <option value="top right">Top Right</option>
                  <option value="bottom left">Bottom Left</option>
                  <option value="bottom right">Bottom Right</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Repeat</label>
                <select
                  className={controlClassName}
                  value={getConfigString("backgroundRepeat", "no-repeat")}
                  onChange={(e) => updateChildResponsiveConfig("backgroundRepeat", e.target.value)}
                >
                  <option value="no-repeat">No Repeat</option>
                  <option value="repeat">Repeat</option>
                  <option value="repeat-x">Repeat X</option>
                  <option value="repeat-y">Repeat Y</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Attachment</label>
                <select
                  className={controlClassName}
                  value={getConfigString("backgroundAttachment", "scroll")}
                  onChange={(e) => updateChildResponsiveConfig("backgroundAttachment", e.target.value)}
                >
                  <option value="scroll">Scroll</option>
                  <option value="fixed">Fixed</option>
                  <option value="local">Local</option>
                </select>
              </div>
              <ColorPicker
                label="Overlay"
                configKey="backgroundOverlayColor"
                globalDefault="rgba(0,0,0,0.45)"
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Overlay Opacity</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={controlClassName}
                  value={getConfigString("backgroundOverlayOpacity", "45")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("backgroundOverlayOpacity", Number.isNaN(val) ? undefined : Math.max(0, Math.min(100, val)));
                  }}
                />
              </div>
            </div>
          )}
          <div className="col-span-2">
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">{paddingLabel}</label>
            <div className="grid grid-cols-4 gap-2">
              {BOX_PADDING_SIDES.map((side) => (
                <input
                  key={`shared-box-padding-${side}`}
                  type="number"
                  placeholder={side}
                  className={`${controlClassName} px-0 text-center`}
                  value={getConfigString(`boxPadding${side}`)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig(`boxPadding${side}`, Number.isNaN(val) ? undefined : val);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </BlockConfigPanelCollapseCard>
  );
}
