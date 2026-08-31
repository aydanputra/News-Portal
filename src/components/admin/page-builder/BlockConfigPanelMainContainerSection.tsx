import { Copy } from "lucide-react";
import type { BlockConfigPanelMainContainerSectionProps } from "./BlockConfigPanelSharedTypes";

export function BlockConfigPanelMainContainerSection({
  child,
  deviceLabel,
  isClassicHeroWidget,
  isBulletListWidget,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalSurfaceTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
  openMediaLibraryForKey,
}: BlockConfigPanelMainContainerSectionProps) {
  return (
    <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
      <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2 mb-4 flex items-center gap-2">
        <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
        Wadah Utama (Container Widget)
      </h4>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-[var(--fg-primary)] block">
            Margin & Padding - {deviceLabel}
          </label>
          <button
            onClick={() => {
              ["Top", "Right", "Bottom", "Left"].forEach((side) => {
                const margin = getConfigForApply(`margin${side}`);
                const padding = getConfigForApply(`padding${side}`);
                if (margin !== undefined) applyToAllDevices(`margin${side}`, margin);
                if (padding !== undefined) applyToAllDevices(`padding${side}`, padding);
              });
            }}
            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
            title="Terapkan margin & padding ke semua device"
          >
            <Copy size={10} />
            {!isClassicHeroWidget && "Semua"}
          </button>
        </div>

        <div className="mb-3">
          <label className="text-[10px] text-[var(--fg-primary)] block mb-1">
            Margin (Top, Right, Bottom, Left) - {deviceLabel}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {["Top", "Right", "Bottom", "Left"].map((side) => (
              <input
                key={side}
                type="number"
                placeholder={side}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                value={getConfigString(`margin${side}`)}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateChildResponsiveConfig(`margin${side}`, isNaN(val) ? undefined : val);
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-[var(--fg-primary)] block mb-1">
            Padding (Top, Right, Bottom, Left) - {deviceLabel}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {["Top", "Right", "Bottom", "Left"].map((side) => (
              <input
                key={side}
                type="number"
                placeholder={side}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-1.5 text-[10px] focus:border-[var(--accent)] outline-none text-center text-[var(--fg-primary)]"
                value={getConfigString(`padding${side}`)}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateChildResponsiveConfig(`padding${side}`, isNaN(val) ? undefined : val);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-[var(--fg-primary)] block">
            {isClassicHeroWidget ? "Latar" : `Latar & Warna - ${deviceLabel}`}
          </label>
          <button
            onClick={() => {
              if (isBulletListWidget || isClassicHeroWidget) {
                const useBox = getConfigForApply("useBox");
                const boxColor = getConfigForApply("boxColor");
                if (useBox !== undefined) applyToAllDevices("useBox", useBox);
                if (boxColor !== undefined) applyToAllDevices("boxColor", boxColor);
                if (isBulletListWidget) {
                  const boxRadius = getConfigForApply("boxBorderRadius");
                  if (boxRadius !== undefined) applyToAllDevices("boxBorderRadius", boxRadius);
                }
                return;
              }

              const bgColor = getConfigForApply("backgroundColor");
              const bgImage = getConfigForApply("backgroundImage");
              const bgRepeat = getConfigForApply("backgroundRepeat");
              const bgSize = getConfigForApply("backgroundSize");
              const bgPosition = getConfigForApply("backgroundPosition");
              const borderRadius = getConfigForApply("borderRadius");
              const borderColor = getConfigForApply("borderColor");
              const borderWidth = getConfigForApply("borderWidth");
              const borderStyle = getConfigForApply("borderStyle");

              if (bgColor !== undefined) applyToAllDevices("backgroundColor", bgColor);
              if (bgImage !== undefined) applyToAllDevices("backgroundImage", bgImage);
              if (bgRepeat !== undefined) applyToAllDevices("backgroundRepeat", bgRepeat);
              if (bgSize !== undefined) applyToAllDevices("backgroundSize", bgSize);
              if (bgPosition !== undefined) applyToAllDevices("backgroundPosition", bgPosition);
              if (borderRadius !== undefined) applyToAllDevices("borderRadius", borderRadius);
              if (borderColor !== undefined) applyToAllDevices("borderColor", borderColor);
              if (borderWidth !== undefined) applyToAllDevices("borderWidth", borderWidth);
              if (borderStyle !== undefined) applyToAllDevices("borderStyle", borderStyle);
            }}
            className={`text-[10px] flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
              isClassicHeroWidget
                ? "text-[var(--fg-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-base)]"
                : "text-[var(--accent)] hover:text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)]"
            }`}
            aria-label="Terapkan ke semua device"
            title="Terapkan latar & garis ke semua device"
          >
            <Copy size={10} />
            {!isClassicHeroWidget && "Semua"}
          </button>
        </div>

        {isBulletListWidget || isClassicHeroWidget ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[var(--fg-primary)]">
                {isClassicHeroWidget ? "Aktifkan" : `Aktifkan Latar - ${deviceLabel}`}
              </span>
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
              <div className={`grid gap-3 ${isBulletListWidget ? "grid-cols-2" : "grid-cols-1"}`}>
                <ColorPicker
                  label={isClassicHeroWidget ? "Warna" : "Warna Latar"}
                  configKey="boxColor"
                  globalDefault={globalSurfaceTone}
                  triggerClassName={isClassicHeroWidget ? heroColorTriggerClass : undefined}
                  swatchClassName={isClassicHeroWidget ? heroColorSwatchClass : undefined}
                  inputClassName={isClassicHeroWidget ? heroColorInputClass : undefined}
                  child={child}
                  getConfigValue={getConfigValue}
                  updateChildResponsiveConfig={updateChildResponsiveConfig}
                  updateChildConfig={updateChildConfig}
                />
                {isBulletListWidget && (
                  <div>
                    <label className="text-[10px] text-[var(--fg-muted)] block mb-1">
                      Radius - {deviceLabel}
                    </label>
                    <select
                      className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none text-[var(--fg-primary)]"
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
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <ColorPicker
                label="Latar"
                configKey="backgroundColor"
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <ColorPicker
                label="Warna Garis"
                configKey="borderColor"
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
            </div>

            <div className="mb-4 space-y-2">
              <label className="text-[10px] text-[var(--fg-muted)] block">
                Gambar Latar - {deviceLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://..."
                  className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs outline-none focus:border-[var(--accent)] text-[var(--fg-primary)]"
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
              {getConfigString("backgroundImage") && (
                <div className="grid grid-cols-3 gap-2">
                  <select
                    className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1.5 text-[10px] text-[var(--fg-primary)] outline-none"
                    value={getConfigString("backgroundSize", "cover")}
                    onChange={(e) => updateChildResponsiveConfig("backgroundSize", e.target.value)}
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="auto">Auto</option>
                  </select>
                  <select
                    className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1.5 text-[10px] text-[var(--fg-primary)] outline-none"
                    value={getConfigString("backgroundRepeat", "no-repeat")}
                    onChange={(e) => updateChildResponsiveConfig("backgroundRepeat", e.target.value)}
                  >
                    <option value="no-repeat">No Repeat</option>
                    <option value="repeat">Repeat</option>
                  </select>
                  <select
                    className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-1.5 text-[10px] text-[var(--fg-primary)] outline-none"
                    value={getConfigString("backgroundPosition", "center")}
                    onChange={(e) => updateChildResponsiveConfig("backgroundPosition", e.target.value)}
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[var(--fg-muted)] block mb-1">
                  Radius (px) - {deviceLabel}
                </label>
                <input
                  type="number"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none text-[var(--fg-primary)]"
                  value={getConfigString("borderRadius")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("borderRadius", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-muted)] block mb-1">
                  Ketebalan Garis (px) - {deviceLabel}
                </label>
                <input
                  type="number"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none text-[var(--fg-primary)]"
                  value={getConfigString("borderWidth")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("borderWidth", isNaN(val) ? undefined : val);
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-[var(--fg-primary)] block">
            Posisi Vertikal Widget - {deviceLabel}
          </label>
          <button
            onClick={() => {
              const verticalAlign = getConfigForApply("verticalAlign");
              if (verticalAlign !== undefined) applyToAllDevices("verticalAlign", verticalAlign);
            }}
            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
            title="Terapkan posisi vertikal ke semua device"
          >
            <Copy size={10} /> Semua
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "top", label: "Atas" },
            { key: "center", label: "Tengah" },
            { key: "bottom", label: "Bawah" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => updateChildResponsiveConfig("verticalAlign", item.key)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                getConfigString("verticalAlign", "center") === item.key
                  ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-[var(--fg-primary)] block">
            Tata letak Konten - {deviceLabel}
          </label>
          <button
            onClick={() => {
              const textAlign = getConfigForApply("textAlign");
              if (textAlign !== undefined) applyToAllDevices("textAlign", textAlign);
            }}
            className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
            title="Terapkan tata letak konten ke semua device"
          >
            <Copy size={10} /> Semua
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "left", label: "Kiri" },
            { key: "center", label: "Tengah" },
            { key: "right", label: "Kanan" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => updateChildResponsiveConfig("textAlign", item.key)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                getConfigString("textAlign", "left") === item.key
                  ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
