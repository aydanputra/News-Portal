import type { ReactNode } from "react";
import type { ConfigValue } from "@/lib/page-builder-config";
import type { Block } from "./types";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";
import { FontFamilyPicker } from "./FontFamilyPicker";
import { renderLogoSettingsSection, renderLogoSourceSection } from "./BlockConfigPanelLogoSections";

const HEADER_WIDGET_TYPES = new Set([
  "header_logo",
  "header_menu_primary",
  "header_menu_secondary",
  "header_search",
  "header_theme_toggle",
  "header_login",
  "header_mobile_menu_toggle",
]);

const WEIGHT_OPTIONS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
];

type ColorPickerRenderer = (props: any) => ReactNode;

type HeaderPanelBaseProps = {
  child: Block;
  controlClassName: string;
  colorTriggerClassName: string;
  colorSwatchClassName: string;
  colorInputClassName: string;
  getConfigBool: (key: string, fallback?: boolean) => boolean;
  getConfigString: (key: string, fallback?: string) => string;
  getConfigValue: (child: Block, key: string) => unknown;
  updateChildConfig: (key: string, value: ConfigValue) => void;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
  ColorPicker: ColorPickerRenderer;
};

type HeaderContentProps = HeaderPanelBaseProps & {
  openMediaLibraryForKey: (key: string) => void;
};

type HeaderVisualProps = HeaderPanelBaseProps & {
  globalMetaTone: string;
  globalHoverColor: string;
  openMediaLibraryForKey: (key: string) => void;
  renderSharedContentAlignmentSettings: (options: {
    copyTitle: string;
    sectionTitle: string;
    textAlignLabel: string;
    verticalAlignLabel?: string;
    alignKey: string;
    alignDefault?: "left" | "center" | "right";
    showVerticalAlign?: boolean;
  }) => ReactNode;
};

type HeaderAdvancedProps = {
  childType: string;
  renderSharedVisibilitySettings: () => ReactNode;
  renderSharedBoxBackgroundSettings: (copyTitle: string) => ReactNode;
  renderSharedWidgetSpacingSettings: (copyTitle: string) => ReactNode;
};

function NumberField({
  label,
  value,
  onChange,
  className,
  step,
  containerClassName,
}: {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  className: string;
  step?: string;
  containerClassName?: string;
}) {
  return (
    <div className={containerClassName}>
      <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">{label}</label>
      <input type="number" step={step} className={className} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  className,
  containerClassName,
}: {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  className: string;
  containerClassName?: string;
}) {
  return (
    <div className={containerClassName}>
      <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">{label}</label>
      <input type="text" className={className} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  className,
  options,
  containerClassName,
}: {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  className: string;
  options: Array<{ value: string; label: string }>;
  containerClassName?: string;
}) {
  return (
    <div className={containerClassName}>
      <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">{label}</label>
      <select className={className} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function isHeaderWidgetType(type: string): boolean {
  return HEADER_WIDGET_TYPES.has(String(type || ""));
}

export function renderHeaderContentSections({
  child,
  controlClassName,
  getConfigString,
  updateChildConfig,
  openMediaLibraryForKey,
}: HeaderContentProps): ReactNode {
  if (!isHeaderWidgetType(child.type)) return null;

  if (child.type === "header_logo") {
    return (
      <>
        {renderLogoSourceSection({
          controlClassName,
          getConfigString,
          updateChildConfig,
          openMediaLibraryForKey,
        })}
      </>
    );
  }

  if (child.type === "header_menu_primary" || child.type === "header_menu_secondary") {
    const menuLocation = child.type === "header_menu_primary" ? "PRIMARY" : "SECONDARY";
    return (
      <BlockConfigPanelCollapseCard title="Sumber Menu">
        <p className="text-xs text-[var(--fg-secondary)]">Widget ini otomatis mengambil menu dari lokasi `{menuLocation}`.</p>
        <p className="text-[10px] text-[var(--fg-muted)]">Ubah isi menu dari pengaturan menu situs, bukan dari modal widget.</p>
      </BlockConfigPanelCollapseCard>
    );
  }

  if (child.type === "header_search") {
    const design = getConfigString("searchDesign", "icon");
    return (
      <BlockConfigPanelCollapseCard title="Pengaturan Pencarian">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField
            label="Mode"
            value={design}
            onChange={(value) => updateChildConfig("searchDesign", value)}
            className={controlClassName}
            options={[
              { value: "icon", label: "Ikon" },
              { value: "bar", label: "Search Bar" },
            ]}
          />
          <TextField
            label="Placeholder"
            value={getConfigString("searchPlaceholder", "")}
            onChange={(value) => updateChildConfig("searchPlaceholder", value)}
            className={controlClassName}
          />
          {design === "bar" && (
            <TextField
              label="Label Tombol"
              value={getConfigString("searchButtonLabel", "")}
              onChange={(value) => updateChildConfig("searchButtonLabel", value)}
              className={controlClassName}
              containerClassName="sm:col-span-2"
            />
          )}
        </div>
      </BlockConfigPanelCollapseCard>
    );
  }

  if (child.type === "header_login") {
    return (
      <BlockConfigPanelCollapseCard title="Pengaturan Konten">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="Label Tombol"
            value={getConfigString("loginLabel", "")}
            onChange={(value) => updateChildConfig("loginLabel", value)}
            className={controlClassName}
          />
          <TextField
            label="URL Tujuan"
            value={getConfigString("loginUrl", "")}
            onChange={(value) => updateChildConfig("loginUrl", value)}
            className={controlClassName}
          />
          <div className="sm:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-3 text-[10px] text-[var(--fg-muted)]">
            Jika dikosongkan, tombol akan tetap memakai label `Masuk` dan menuju `/admin/login`.
          </div>
        </div>
      </BlockConfigPanelCollapseCard>
    );
  }

  if (child.type === "header_theme_toggle") {
    return (
      <BlockConfigPanelCollapseCard title="Pengaturan Widget">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-3 text-[10px] text-[var(--fg-muted)]">
          Widget ini menampilkan tombol ganti tema publik. Konten tidak perlu diatur manual.
        </div>
      </BlockConfigPanelCollapseCard>
    );
  }

  if (child.type === "header_mobile_menu_toggle") {
    return (
      <BlockConfigPanelCollapseCard title="Pengaturan Widget">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-3 text-[10px] text-[var(--fg-muted)]">
          Tombol ini membuka menu mobile/off-canvas dari struktur header aktif.
        </div>
      </BlockConfigPanelCollapseCard>
    );
  }

  return null;
}

export function renderHeaderVisualSections({
  child,
  controlClassName,
  colorTriggerClassName,
  colorSwatchClassName,
  colorInputClassName,
  getConfigString,
  getConfigValue,
  updateChildConfig,
  updateChildResponsiveConfig,
  ColorPicker,
  globalMetaTone,
  globalHoverColor,
  renderSharedContentAlignmentSettings,
}: HeaderVisualProps): ReactNode {
  if (!isHeaderWidgetType(child.type)) return null;

  const alignmentSection = renderSharedContentAlignmentSettings({
    copyTitle: "Terapkan tata letak header ke semua device",
    sectionTitle: "Tata Letak Konten",
    textAlignLabel: "Tata Letak Konten",
    verticalAlignLabel: "Posisi Vertikal Widget",
    alignKey: "textAlign",
    alignDefault: "left",
    showVerticalAlign: true,
  });

  if (child.type === "header_logo") {
    return (
      <>
        {renderLogoSettingsSection({
          controlClassName,
          getConfigString,
          updateChildResponsiveConfig,
        })}
        {alignmentSection}
      </>
    );
  }

  if (child.type === "header_menu_primary" || child.type === "header_menu_secondary") {
    return (
      <>
        <BlockConfigPanelCollapseCard title="Pengaturan Teks">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ColorPicker
              label="Teks"
              configKey="menuTextColor"
              globalDefault={globalMetaTone}
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Sorot"
              configKey="menuHoverTextColor"
              globalDefault={globalHoverColor}
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <NumberField
              label="Ukuran"
              value={getConfigString("menuFontSize", "")}
              onChange={(value) => updateChildResponsiveConfig("menuFontSize", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <SelectField
              label="Ketebalan"
              value={getConfigString("menuFontWeight", "500")}
              onChange={(value) => updateChildResponsiveConfig("menuFontWeight", value)}
              className={controlClassName}
              options={WEIGHT_OPTIONS}
            />
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Font</label>
              <FontFamilyPicker
                value={getConfigString("menuFontFamily", "")}
                onChange={(value) => updateChildResponsiveConfig("menuFontFamily", value || undefined)}
              />
            </div>
          </div>
        </BlockConfigPanelCollapseCard>
        {alignmentSection}
      </>
    );
  }

  if (child.type === "header_search") {
    const design = getConfigString("searchDesign", "icon");
    return (
      <>
        <BlockConfigPanelCollapseCard title="Pengaturan Pencarian">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ColorPicker
              label="Ikon"
              configKey="searchColor"
              globalDefault={globalMetaTone}
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Sorot"
              configKey="searchHoverColor"
              globalDefault={globalHoverColor}
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <NumberField
              label="Ukuran Ikon"
              value={getConfigString("searchIconSize", "")}
              onChange={(value) => updateChildResponsiveConfig("searchIconSize", value === "" ? undefined : value)}
              className={controlClassName}
            />
            {design === "bar" && (
              <>
                <ColorPicker
                  label="Input"
                  configKey="searchInputColor"
                  globalDefault={globalMetaTone}
                  triggerClassName={colorTriggerClassName}
                  swatchClassName={colorSwatchClassName}
                  inputClassName={colorInputClassName}
                  child={child}
                  getConfigValue={getConfigValue}
                  updateChildResponsiveConfig={updateChildResponsiveConfig}
                  updateChildConfig={updateChildConfig}
                />
                <ColorPicker
                  label="Latar"
                  configKey="searchBgColor"
                  triggerClassName={colorTriggerClassName}
                  swatchClassName={colorSwatchClassName}
                  inputClassName={colorInputClassName}
                  child={child}
                  getConfigValue={getConfigValue}
                  updateChildResponsiveConfig={updateChildResponsiveConfig}
                  updateChildConfig={updateChildConfig}
                />
                <ColorPicker
                  label="Garis"
                  configKey="searchBorderColor"
                  triggerClassName={colorTriggerClassName}
                  swatchClassName={colorSwatchClassName}
                  inputClassName={colorInputClassName}
                  child={child}
                  getConfigValue={getConfigValue}
                  updateChildResponsiveConfig={updateChildResponsiveConfig}
                  updateChildConfig={updateChildConfig}
                />
                <ColorPicker
                  label="Tombol Latar"
                  configKey="searchButtonBgColor"
                  triggerClassName={colorTriggerClassName}
                  swatchClassName={colorSwatchClassName}
                  inputClassName={colorInputClassName}
                  child={child}
                  getConfigValue={getConfigValue}
                  updateChildResponsiveConfig={updateChildResponsiveConfig}
                  updateChildConfig={updateChildConfig}
                />
                <ColorPicker
                  label="Tombol Teks"
                  configKey="searchButtonTextColor"
                  globalDefault={globalMetaTone}
                  triggerClassName={colorTriggerClassName}
                  swatchClassName={colorSwatchClassName}
                  inputClassName={colorInputClassName}
                  child={child}
                  getConfigValue={getConfigValue}
                  updateChildResponsiveConfig={updateChildResponsiveConfig}
                  updateChildConfig={updateChildConfig}
                />
                <NumberField
                  label="Tinggi"
                  value={getConfigString("searchHeight", "")}
                  onChange={(value) => updateChildResponsiveConfig("searchHeight", value === "" ? undefined : value)}
                  className={controlClassName}
                />
                <NumberField
                  label="Radius"
                  value={getConfigString("searchRadius", "")}
                  onChange={(value) => updateChildResponsiveConfig("searchRadius", value === "" ? undefined : value)}
                  className={controlClassName}
                />
                <NumberField
                  label="Ukuran"
                  value={getConfigString("searchFontSize", "")}
                  onChange={(value) => updateChildResponsiveConfig("searchFontSize", value === "" ? undefined : value)}
                  className={controlClassName}
                />
              </>
            )}
          </div>
        </BlockConfigPanelCollapseCard>
        {alignmentSection}
      </>
    );
  }

  if (child.type === "header_theme_toggle") {
    return (
      <>
        <BlockConfigPanelCollapseCard title="Pengaturan Ikon">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ColorPicker
              label="Teks"
              configKey="themeColor"
              globalDefault={globalMetaTone}
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Sorot"
              configKey="themeHoverColor"
              globalDefault={globalHoverColor}
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <NumberField
              label="Ukuran Ikon"
              value={getConfigString("themeIconSize", "")}
              onChange={(value) => updateChildResponsiveConfig("themeIconSize", value === "" ? undefined : value)}
              className={controlClassName}
              containerClassName="sm:col-span-2"
            />
          </div>
        </BlockConfigPanelCollapseCard>
        {alignmentSection}
      </>
    );
  }

  if (child.type === "header_mobile_menu_toggle") {
    return (
      <>
        <BlockConfigPanelCollapseCard title="Pengaturan Tombol">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ColorPicker
              label="Teks"
              configKey="mobileMenuColor"
              globalDefault={globalMetaTone}
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Sorot"
              configKey="mobileMenuHoverColor"
              globalDefault={globalHoverColor}
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <NumberField
              label="Ukuran Ikon"
              value={getConfigString("mobileMenuIconSize", "")}
              onChange={(value) => updateChildResponsiveConfig("mobileMenuIconSize", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <NumberField
              label="Padding"
              value={getConfigString("mobileMenuPadding", "")}
              onChange={(value) => updateChildResponsiveConfig("mobileMenuPadding", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <ColorPicker
              label="Latar"
              configKey="mobileMenuBgColor"
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Sorot Latar"
              configKey="mobileMenuBgHoverColor"
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <NumberField
              label="Radius"
              value={getConfigString("mobileMenuRadius", "")}
              onChange={(value) => updateChildResponsiveConfig("mobileMenuRadius", value === "" ? undefined : value)}
              className={controlClassName}
            />
          </div>
        </BlockConfigPanelCollapseCard>
        <BlockConfigPanelCollapseCard title="Teks Menu Off-Canvas">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumberField
              label="Ukuran Font"
              value={getConfigString("drawerMenuFontSize", "")}
              onChange={(value) => updateChildResponsiveConfig("drawerMenuFontSize", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <NumberField
              label="Line Height"
              value={getConfigString("drawerMenuLineHeight", "")}
              onChange={(value) => updateChildResponsiveConfig("drawerMenuLineHeight", value === "" ? undefined : value)}
              className={controlClassName}
              step="0.05"
            />
            <SelectField
              label="Ketebalan"
              value={getConfigString("drawerMenuFontWeight", "500")}
              onChange={(value) => updateChildResponsiveConfig("drawerMenuFontWeight", value)}
              className={controlClassName}
              options={WEIGHT_OPTIONS}
            />
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Font</label>
              <FontFamilyPicker
                value={getConfigString("drawerMenuFontFamily", "")}
                onChange={(value) => updateChildResponsiveConfig("drawerMenuFontFamily", value || undefined)}
              />
            </div>
          </div>
        </BlockConfigPanelCollapseCard>
        {alignmentSection}
      </>
    );
  }

  if (child.type === "header_login") {
    return (
      <>
        <BlockConfigPanelCollapseCard title="Pengaturan Tombol">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ColorPicker
              label="Teks"
              configKey="loginTextColor"
              globalDefault="#ffffff"
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Latar"
              configKey="loginBgColor"
              globalDefault="var(--accent)"
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Sorot Latar"
              configKey="loginHoverBgColor"
              globalDefault={globalHoverColor}
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <NumberField
              label="Ukuran Teks"
              value={getConfigString("loginFontSize", "")}
              onChange={(value) => updateChildResponsiveConfig("loginFontSize", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <NumberField
              label="Radius"
              value={getConfigString("loginRadius", "")}
              onChange={(value) => updateChildResponsiveConfig("loginRadius", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <NumberField
              label="Padding X"
              value={getConfigString("loginPaddingX", "")}
              onChange={(value) => updateChildResponsiveConfig("loginPaddingX", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <NumberField
              label="Padding Y"
              value={getConfigString("loginPaddingY", "")}
              onChange={(value) => updateChildResponsiveConfig("loginPaddingY", value === "" ? undefined : value)}
              className={controlClassName}
            />
          </div>
        </BlockConfigPanelCollapseCard>
        {alignmentSection}
      </>
    );
  }

  return null;
}

export function renderHeaderAdvancedSections({
  childType,
  renderSharedVisibilitySettings,
  renderSharedBoxBackgroundSettings,
  renderSharedWidgetSpacingSettings,
}: HeaderAdvancedProps): ReactNode {
  if (!isHeaderWidgetType(childType)) return null;

  return (
    <div className="space-y-4">
      {renderSharedVisibilitySettings()}
      {renderSharedBoxBackgroundSettings("Terapkan latar header ke semua device")}
      {renderSharedWidgetSpacingSettings("Terapkan spacing header ke semua device")}
    </div>
  );
}
