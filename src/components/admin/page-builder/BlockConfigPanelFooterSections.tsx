import type { ReactNode } from "react";
import type { ConfigValue } from "@/lib/page-builder-config";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { Block } from "./types";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";
import { renderLogoSettingsSection, renderLogoSourceSection } from "./BlockConfigPanelLogoSections";

const FOOTER_WIDGET_TYPES = new Set([
  "footer_logo",
  "footer_menu",
  "footer_text",
  "footer_social",
  "footer_categories",
  "footer_custom_links",
  "footer_copyright",
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

type FooterPanelBaseProps = {
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

type FooterVisualProps = FooterPanelBaseProps & {
  globalWidgetTitleColor: string;
  globalAccentTone: string;
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

type FooterAdvancedProps = {
  childType: string;
  renderSharedVisibilitySettings: () => ReactNode;
  renderSharedBoxBackgroundSettings: (copyTitle: string) => ReactNode;
  renderSharedWidgetSpacingSettings: (copyTitle: string) => ReactNode;
};

type LinkItem = {
  label: string;
  url: string;
  openInNewTab?: boolean;
};

function ToggleRow({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (nextValue: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
      <div>
        <div className="text-xs font-medium text-[var(--fg-primary)]">{label}</div>
        {description ? <div className="mt-0.5 text-[10px] text-[var(--fg-muted)]">{description}</div> : null}
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className="h-5 w-9 rounded-full border border-[var(--border)] bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-[var(--border)] after:bg-[var(--bg-base)] after:transition-all after:content-['']"></div>
      </label>
    </div>
  );
}

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

function getFooterLinks(raw: unknown): LinkItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => ({
    label: typeof item?.label === "string" ? item.label : "",
    url: typeof item?.url === "string" ? item.url : "",
    openInNewTab: !!item?.openInNewTab,
  }));
}

export function isFooterWidgetType(type: string): boolean {
  return FOOTER_WIDGET_TYPES.has(String(type || ""));
}

export function renderFooterVisualSections({
  child,
  controlClassName,
  colorTriggerClassName,
  colorSwatchClassName,
  colorInputClassName,
  getConfigBool,
  getConfigString,
  getConfigValue,
  updateChildConfig,
  updateChildResponsiveConfig,
  ColorPicker,
  globalWidgetTitleColor,
  globalAccentTone,
  globalMetaTone,
  globalHoverColor,
  openMediaLibraryForKey,
  renderSharedContentAlignmentSettings,
}: FooterVisualProps): ReactNode {
  if (!isFooterWidgetType(child.type)) return null;

  const alignmentSection = renderSharedContentAlignmentSettings({
    copyTitle: "Terapkan tata letak footer ke semua device",
    sectionTitle: "Tata Letak Konten",
    textAlignLabel: "Tata Letak Konten",
    verticalAlignLabel: "Posisi Vertikal Widget",
    alignKey: "textAlign",
    alignDefault: "left",
    showVerticalAlign: true,
  });

  if (child.type === "footer_logo") {
    return (
      <>
        {renderLogoSourceSection({
          controlClassName,
          getConfigString,
          updateChildConfig,
          openMediaLibraryForKey,
        })}
        {renderLogoSettingsSection({
          controlClassName,
          getConfigString,
          updateChildResponsiveConfig,
        })}
        {alignmentSection}
      </>
    );
  }

  if (child.type === "footer_menu") {
    return (
      <>
        <BlockConfigPanelCollapseCard title="Sumber Menu">
          <p className="text-xs text-[var(--fg-secondary)]">Widget ini otomatis mengambil menu dari lokasi `FOOTER`.</p>
          <p className="text-[10px] text-[var(--fg-muted)]">Ubah isi menu dari pengaturan menu situs, bukan dari modal widget.</p>
        </BlockConfigPanelCollapseCard>

        <BlockConfigPanelCollapseCard title="Pengaturan Widget">
          <div className="space-y-3">
            <ToggleRow
              label="Tampilkan Judul Widget"
              checked={getConfigBool("showTitle", true)}
              onChange={(nextValue) => updateChildConfig("showTitle", nextValue)}
            />
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-3 text-[10px] text-[var(--fg-muted)]">
              Tipografi dan warna daftar menu masih mengikuti gaya footer tema aktif.
            </div>
          </div>
        </BlockConfigPanelCollapseCard>

        {alignmentSection}
      </>
    );
  }

  if (child.type === "footer_text") {
    const footerTextContent = getConfigString("html", getConfigString("text", ""));

    return (
      <>
        <BlockConfigPanelCollapseCard title="Pengaturan Konten">
          <div className="space-y-3">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)] p-3">
              <RichTextEditor
                label="Teks"
                value={footerTextContent}
                onChange={(value) => {
                  updateChildConfig("html", value);
                  updateChildConfig("text", value);
                }}
                placeholder="Tulis alamat, kontak, deskripsi singkat, atau info footer lainnya"
                toolbarMode="full"
                editorMinHeight="220px"
                containerClassName="[&_.quill-wrapper]:rounded-xl [&_.quill-wrapper]:border-[var(--border)] [&_.quill-wrapper]:bg-[var(--bg-elevated)] [&_.quill-wrapper]:focus-within:ring-2 [&_.quill-wrapper]:focus-within:ring-[color:var(--accent)/0.2] [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-b-[var(--border)] [&_.ql-toolbar]:bg-[var(--bg-surface)] [&_.ql-container]:text-[var(--fg-primary)] [&_.ql-editor]:px-3 [&_.ql-editor]:py-3 [&_.ql-editor]:text-sm [&_.ql-editor]:leading-6 [&_.ql-editor.ql-blank::before]:text-[var(--fg-muted)] [&_.ql-snow_.ql-stroke]:stroke-[var(--fg-secondary)] [&_.ql-snow_.ql-fill]:fill-[var(--fg-secondary)] [&_label]:mb-2 [&_label]:block [&_label]:text-[10px] [&_label]:font-medium [&_label]:text-[var(--fg-secondary)]"
              />
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-[10px] text-[var(--fg-muted)]">
              Mendukung heading, daftar, warna, alignment, tautan, gambar, dan video. Warna teks utama, tipografi, dan posisi widget tetap diatur dari section di bawahnya.
            </div>
          </div>
        </BlockConfigPanelCollapseCard>

        <BlockConfigPanelCollapseCard title="Pengaturan Teks">
          <details className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-2.5">
            <summary className="cursor-pointer text-xs font-medium text-[var(--fg-primary)]">Judul Widget</summary>
            <div className="mt-2.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--fg-secondary)]">Tampil</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={getConfigBool("showTitle", true)}
                    onChange={(e) => updateChildConfig("showTitle", e.target.checked)}
                  />
                  <div className="h-5 w-9 rounded-full border border-[var(--border)] bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-[var(--border)] after:bg-[var(--bg-base)] after:transition-all after:content-['']"></div>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="Ukuran"
                  value={getConfigString("blockTitleFontSize", "")}
                  onChange={(value) => updateChildResponsiveConfig("blockTitleFontSize", value === "" ? undefined : value)}
                  className={controlClassName}
                />
                <ColorPicker
                  label="Teks"
                  configKey="blockTitleColor"
                  globalDefault={globalWidgetTitleColor}
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
                  configKey="blockTitleBorderColor"
                  globalDefault={globalAccentTone}
                  containerClassName="col-span-2"
                  triggerClassName={colorTriggerClassName}
                  swatchClassName={colorSwatchClassName}
                  inputClassName={colorInputClassName}
                  child={child}
                  getConfigValue={getConfigValue}
                  updateChildResponsiveConfig={updateChildResponsiveConfig}
                  updateChildConfig={updateChildConfig}
                />
              </div>
            </div>
          </details>

          <details className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-2.5">
            <summary className="cursor-pointer text-xs font-medium text-[var(--fg-primary)]">Konten Teks</summary>
            <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ColorPicker
                label="Teks"
                configKey="textColor"
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
                label="Ukuran"
                value={getConfigString("textFontSize", "")}
                onChange={(value) => updateChildResponsiveConfig("textFontSize", value === "" ? undefined : value)}
                className={controlClassName}
              />
              <NumberField
                label="Tinggi Baris"
                value={getConfigString("textLineHeight", "")}
                onChange={(value) => updateChildResponsiveConfig("textLineHeight", value === "" ? undefined : value)}
                className={controlClassName}
                step="0.1"
              />
              <div>
                <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Ketebalan</label>
                <select
                  className={controlClassName}
                  value={getConfigString("textFontWeight", "400")}
                  onChange={(e) => updateChildResponsiveConfig("textFontWeight", e.target.value)}
                >
                  {WEIGHT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </details>
        </BlockConfigPanelCollapseCard>

        {alignmentSection}
      </>
    );
  }

  if (child.type === "footer_social") {
    return (
      <>
        <BlockConfigPanelCollapseCard title="Link Sosial">
          <div className="grid grid-cols-1 gap-3">
            {[
              ["Facebook", "facebook"],
              ["Twitter", "twitter"],
              ["Instagram", "instagram"],
              ["Youtube", "youtube"],
              ["Linkedin", "linkedin"],
              ["TikTok", "tiktok"],
            ].map(([label, key]) => (
              <TextField
                key={key}
                label={label}
                value={getConfigString(key, "")}
                onChange={(value) => updateChildConfig(key, value)}
                className={controlClassName}
              />
            ))}
          </div>
        </BlockConfigPanelCollapseCard>

        <BlockConfigPanelCollapseCard title="Perilaku Tautan">
          <div className="space-y-3">
            <ToggleRow
              label="Buka Tab Baru"
              checked={getConfigBool("openInNewTab", true)}
              onChange={(nextValue) => updateChildConfig("openInNewTab", nextValue)}
            />
            <ToggleRow
              label="Nofollow Eksternal"
              checked={getConfigBool("nofollowExternal", false)}
              onChange={(nextValue) => updateChildConfig("nofollowExternal", nextValue)}
            />
          </div>
        </BlockConfigPanelCollapseCard>

        <BlockConfigPanelCollapseCard title="Pengaturan Ikon">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Tata Letak</label>
              <select
                className={controlClassName}
                value={getConfigString("socialLayout", "horizontal")}
                onChange={(e) => updateChildConfig("socialLayout", e.target.value)}
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertikal</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Varian</label>
              <select
                className={controlClassName}
                value={getConfigString("socialVariant", "theme")}
                onChange={(e) => updateChildConfig("socialVariant", e.target.value)}
              >
                <option value="theme">Tema</option>
                <option value="plain">Plain</option>
                <option value="button">Button</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Radius</label>
              <select
                className={controlClassName}
                value={getConfigString("socialRadius", "full")}
                onChange={(e) => updateChildConfig("socialRadius", e.target.value)}
              >
                <option value="none">Kotak</option>
                <option value="md">Sedang</option>
                <option value="full">Pill</option>
              </select>
            </div>
            <NumberField
              label="Gap"
              value={getConfigString("socialGap", "")}
              onChange={(value) => updateChildResponsiveConfig("socialGap", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <NumberField
              label="Ukuran Ikon"
              value={getConfigString("socialIconSize", "")}
              onChange={(value) => updateChildResponsiveConfig("socialIconSize", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <NumberField
              label="Padding"
              value={getConfigString("socialPadding", "")}
              onChange={(value) => updateChildResponsiveConfig("socialPadding", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <ColorPicker
              label="Ikon"
              configKey="socialIconColor"
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
              label="Ikon Sorot"
              configKey="socialIconHoverColor"
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
              configKey="socialBgColor"
              globalDefault="transparent"
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Latar Sorot"
              configKey="socialBgHoverColor"
              globalDefault={globalHoverColor}
              triggerClassName={colorTriggerClassName}
              swatchClassName={colorSwatchClassName}
              inputClassName={colorInputClassName}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
          </div>
        </BlockConfigPanelCollapseCard>

        {alignmentSection}
      </>
    );
  }

  if (child.type === "footer_categories") {
    return (
      <>
        <BlockConfigPanelCollapseCard title="Sumber Konten">
          <div>
            <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Jumlah Item</label>
            <select
              className={controlClassName}
              value={getConfigString("limit", "10")}
              onChange={(e) => updateChildConfig("limit", parseInt(e.target.value, 10))}
            >
              <option value="5">5 Item</option>
              <option value="8">8 Item</option>
              <option value="10">10 Item</option>
              <option value="15">15 Item</option>
              <option value="20">20 Item</option>
            </select>
          </div>
          <p className="text-[10px] text-[var(--fg-muted)]">Daftar kategori diambil otomatis dari data kategori situs.</p>
        </BlockConfigPanelCollapseCard>

        <BlockConfigPanelCollapseCard title="Pengaturan Widget">
          <div className="space-y-3">
            <ToggleRow
              label="Tampilkan Judul Widget"
              checked={getConfigBool("showTitle", true)}
              onChange={(nextValue) => updateChildConfig("showTitle", nextValue)}
            />
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-3 text-[10px] text-[var(--fg-muted)]">
              Tipografi dan warna daftar kategori masih mengikuti gaya footer tema aktif.
            </div>
          </div>
        </BlockConfigPanelCollapseCard>

        {alignmentSection}
      </>
    );
  }

  if (child.type === "footer_custom_links") {
    const links = getFooterLinks(getConfigValue(child, "links"));
    const updateLinks = (nextLinks: LinkItem[]) => updateChildConfig("links", nextLinks);

    return (
      <>
        <BlockConfigPanelCollapseCard title="Daftar Link">
          <div className="space-y-3">
            {links.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-base)] px-3 py-3 text-xs text-[var(--fg-secondary)]">
                Belum ada link. Tambahkan item baru di bawah.
              </div>
            ) : null}
            {links.map((item, index) => (
              <div key={`${index}_${item.label}`} className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField
                    label="Label"
                    value={item.label}
                    onChange={(value) => {
                      const next = [...links];
                      next[index] = { ...next[index], label: value };
                      updateLinks(next);
                    }}
                    className={controlClassName}
                  />
                  <TextField
                    label="URL"
                    value={item.url}
                    onChange={(value) => {
                      const next = [...links];
                      next[index] = { ...next[index], url: value };
                      updateLinks(next);
                    }}
                    className={controlClassName}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <ToggleRow
                    label="Buka Tab Baru"
                    checked={!!item.openInNewTab}
                    onChange={(nextValue) => {
                      const next = [...links];
                      next[index] = { ...next[index], openInNewTab: nextValue };
                      updateLinks(next);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => updateLinks(links.filter((_, currentIndex) => currentIndex !== index))}
                    className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-medium text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateLinks([...links, { label: "", url: "", openInNewTab: false }])}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs font-medium text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]"
            >
              Tambah Link
            </button>
          </div>
        </BlockConfigPanelCollapseCard>

        <BlockConfigPanelCollapseCard title="Pengaturan Tautan">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Tata Letak</label>
              <select
                className={controlClassName}
                value={getConfigString("linkLayout", "vertical")}
                onChange={(e) => updateChildConfig("linkLayout", e.target.value)}
              >
                <option value="vertical">Vertikal</option>
                <option value="horizontal">Horizontal</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Underline</label>
              <select
                className={controlClassName}
                value={getConfigString("linkUnderline", "hover")}
                onChange={(e) => updateChildConfig("linkUnderline", e.target.value)}
              >
                <option value="hover">Saat Sorot</option>
                <option value="always">Selalu</option>
                <option value="none">Tidak</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Pemisah</label>
              <select
                className={controlClassName}
                value={getConfigString("linkDivider", "strip")}
                onChange={(e) => updateChildConfig("linkDivider", e.target.value)}
              >
                <option value="strip">Strip</option>
                <option value="line">Line</option>
                <option value="round">Round</option>
              </select>
            </div>
            <div className="sm:pt-5">
              <ToggleRow
                label="Bullet"
                checked={getConfigBool("showBullets", false)}
                onChange={(nextValue) => updateChildConfig("showBullets", nextValue)}
              />
            </div>
            <ColorPicker
              label="Teks"
              configKey="linkColor"
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
              configKey="linkHoverColor"
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
              value={getConfigString("linkFontSize", "")}
              onChange={(value) => updateChildResponsiveConfig("linkFontSize", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <div>
              <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Ketebalan</label>
              <select
                className={controlClassName}
                value={getConfigString("linkFontWeight", "400")}
                onChange={(e) => updateChildResponsiveConfig("linkFontWeight", e.target.value)}
              >
                {WEIGHT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <NumberField
              label="Gap Vertikal"
              value={getConfigString("linkGapVertical", "")}
              onChange={(value) => updateChildResponsiveConfig("linkGapVertical", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <NumberField
              label="Gap Horizontal"
              value={getConfigString("linkGapHorizontal", "")}
              onChange={(value) => updateChildResponsiveConfig("linkGapHorizontal", value === "" ? undefined : value)}
              className={controlClassName}
            />
          </div>
        </BlockConfigPanelCollapseCard>

        <BlockConfigPanelCollapseCard title="Perilaku Tautan">
          <ToggleRow
            label="Nofollow Eksternal"
            checked={getConfigBool("nofollowExternal", false)}
            onChange={(nextValue) => updateChildConfig("nofollowExternal", nextValue)}
          />
        </BlockConfigPanelCollapseCard>

        {alignmentSection}
      </>
    );
  }

  if (child.type === "footer_copyright") {
    return (
      <>
        <BlockConfigPanelCollapseCard title="Pengaturan Konten">
          <div>
            <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Teks</label>
            <textarea
              rows={5}
              className={`${controlClassName} h-auto min-h-[120px] py-2`}
              value={getConfigString("text", "")}
              onChange={(e) => updateChildConfig("text", e.target.value)}
            />
          </div>
          <p className="text-[10px] text-[var(--fg-muted)]">Placeholder yang didukung: `{'{year}'}` dan `{'{siteName}'}`.</p>
        </BlockConfigPanelCollapseCard>

        <BlockConfigPanelCollapseCard title="Pengaturan Teks">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ColorPicker
              label="Teks"
              configKey="textColor"
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
              label="Ukuran"
              value={getConfigString("textFontSize", "")}
              onChange={(value) => updateChildResponsiveConfig("textFontSize", value === "" ? undefined : value)}
              className={controlClassName}
            />
            <NumberField
              label="Tinggi Baris"
              value={getConfigString("textLineHeight", "")}
              onChange={(value) => updateChildResponsiveConfig("textLineHeight", value === "" ? undefined : value)}
              className={controlClassName}
              step="0.1"
            />
            <div>
              <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">Ketebalan</label>
              <select
                className={controlClassName}
                value={getConfigString("textFontWeight", "400")}
                onChange={(e) => updateChildResponsiveConfig("textFontWeight", e.target.value)}
              >
                {WEIGHT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </BlockConfigPanelCollapseCard>

        {alignmentSection}
      </>
    );
  }

  return alignmentSection;
}

export function renderFooterAdvancedSections({
  childType,
  renderSharedVisibilitySettings,
  renderSharedBoxBackgroundSettings,
  renderSharedWidgetSpacingSettings,
}: FooterAdvancedProps): ReactNode {
  if (!isFooterWidgetType(childType)) return null;

  return (
    <div className="space-y-4">
      {renderSharedVisibilitySettings()}
      {renderSharedBoxBackgroundSettings("Terapkan latar footer ke semua device")}
      {renderSharedWidgetSpacingSettings("Terapkan spacing footer ke semua device")}
    </div>
  );
}
