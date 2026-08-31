import type { ReactNode } from "react";
import type { ConfigValue } from "@/lib/page-builder-config";
import type { Block } from "./types";
import type {
  BlockConfigPanelColorPickerRenderer,
  BlockConfigPanelSharedAdvancedProps,
  BlockConfigPanelSharedCategoryTextOptions,
  SharedPanelOptions,
  BlockConfigPanelSharedTitleTextOptions,
  BlockConfigPanelSurfaceVisualProps,
} from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

type ArchiveVisualProps = Pick<
  BlockConfigPanelSurfaceVisualProps,
  | "child"
  | "heroControlClass"
  | "heroColorTriggerClass"
  | "heroColorSwatchClass"
  | "heroColorInputClass"
  | "globalWidgetTitleColor"
  | "globalAccentTone"
  | "globalNewsTitleColor"
  | "globalHoverColor"
  | "globalMetaTone"
  | "globalExcerptTone"
  | "globalBorderTone"
  | "getConfigBool"
  | "getConfigString"
  | "getConfigValue"
  | "updateChildResponsiveConfig"
  | "updateChildConfig"
  | "renderHeroTextSection"
> & {
  archiveHeaderTitleSizeDefault: string;
  archiveHeaderTitleWeightDefault: string;
  archiveHeaderDescriptionSizeDefault: string;
  archiveHeaderDescriptionWeightDefault: string;
  archiveHeaderMetaSizeDefault: string;
  archiveHeaderMetaWeightDefault: string;
  renderSharedCategoryTextSection: (options: BlockConfigPanelSharedCategoryTextOptions) => ReactNode;
  renderSharedTitleTextSection: (options: BlockConfigPanelSharedTitleTextOptions) => ReactNode;
  renderSharedMetaTextSection: () => ReactNode;
  renderSharedExcerptTextSection: () => ReactNode;
  renderSharedContentAlignmentSettings: (options: string | SharedPanelOptions) => ReactNode;
  ColorPicker: BlockConfigPanelColorPickerRenderer;
};

type ArchiveAdvancedProps = BlockConfigPanelSharedAdvancedProps & {
  childType: string;
};

const ARCHIVE_WIDGET_TYPES = new Set([
  "archive_header",
  "archive_post_list",
  "archive_pagination",
  "archive_empty_state",
]);

const ARCHIVE_SHARED_VISUAL_WIDGET_TYPES = new Set([
  "news_grid",
  "news_hero_slider",
  "sidebar_widget",
  "tag_cloud",
  "ad_banner",
]);

function isArchiveWidgetWithDedicatedSections(type: string) {
  return ARCHIVE_WIDGET_TYPES.has(type);
}

function isArchiveWidgetWithSharedVisualSections(type: string) {
  return ARCHIVE_SHARED_VISUAL_WIDGET_TYPES.has(type);
}

function ArchiveSectionGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <BlockConfigPanelCollapseCard title={title}>
      {children}
    </BlockConfigPanelCollapseCard>
  );
}

function NumberField({
  label,
  value,
  onChange,
  className,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: number | undefined) => void;
  className: string;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        className={className}
        value={value}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          onChange(Number.isFinite(parsed) ? parsed : undefined);
        }}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  className,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">{label}</label>
      <input
        type="text"
        className={className}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  className,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">{label}</label>
      <textarea
        rows={rows}
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-[10px] text-[var(--fg-secondary)]">{label}</span>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  className,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
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

export function renderArchiveVisualSections({
  child,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalWidgetTitleColor,
  globalAccentTone,
  globalNewsTitleColor,
  globalHoverColor,
  globalMetaTone,
  globalExcerptTone,
  globalBorderTone,
  archiveHeaderTitleSizeDefault,
  archiveHeaderTitleWeightDefault,
  archiveHeaderDescriptionSizeDefault,
  archiveHeaderDescriptionWeightDefault,
  archiveHeaderMetaSizeDefault,
  archiveHeaderMetaWeightDefault,
  getConfigBool,
  getConfigString,
  getConfigValue,
  updateChildResponsiveConfig,
  updateChildConfig,
  renderHeroTextSection,
  renderSharedCategoryTextSection,
  renderSharedTitleTextSection,
  renderSharedMetaTextSection,
  renderSharedExcerptTextSection,
  renderSharedContentAlignmentSettings,
  ColorPicker,
}: ArchiveVisualProps) {
  const childType = String(child.type || "");

  if (childType === "archive_header") {
    return (
      <>
        <ArchiveSectionGroup title="Pengaturan Tata Letak">
          {renderHeroTextSection(
            "Header",
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label="Gaya Header"
                className={heroControlClass}
                value={getConfigString("headerStyle", "minimal")}
                onChange={(value) => updateChildResponsiveConfig("headerStyle", value)}
                options={[
                  { value: "minimal", label: "Minimal" },
                  { value: "card", label: "Card" },
                  { value: "spotlight", label: "Spotlight" },
                ]}
              />
              <SelectField
                label="Perataan"
                className={heroControlClass}
                value={getConfigString("textAlign", "left")}
                onChange={(value) => updateChildResponsiveConfig("textAlign", value)}
                options={[
                  { value: "left", label: "Kiri" },
                  { value: "center", label: "Tengah" },
                  { value: "right", label: "Kanan" },
                ]}
              />
              <TextField
                label="Label Meta"
                className={heroControlClass}
                value={getConfigString("eyebrowText", "Arsip")}
                onChange={(value) => updateChildConfig("eyebrowText", value)}
              />
              <div className="flex flex-wrap items-center gap-3 pt-5">
                <ToggleField
                  label="Tampilkan deskripsi"
                  checked={getConfigBool("showDescription", true)}
                  onChange={(value) => updateChildResponsiveConfig("showDescription", value)}
                />
                <ToggleField
                  label="Tampilkan jumlah artikel"
                  checked={getConfigBool("showPostCount", true)}
                  onChange={(value) => updateChildResponsiveConfig("showPostCount", value)}
                />
              </div>
            </div>,
          )}
        </ArchiveSectionGroup>

        <ArchiveSectionGroup title="Pengaturan Teks">
          {renderHeroTextSection(
            "Judul Arsip",
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker
                label="Warna Judul"
                configKey="titleColor"
                globalDefault={globalWidgetTitleColor}
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <NumberField
                label="Ukuran Judul"
                className={heroControlClass}
                value={getConfigString("titleFontSize") || archiveHeaderTitleSizeDefault}
                onChange={(value) => updateChildResponsiveConfig("titleFontSize", value)}
                min={12}
              />
              <SelectField
                label="Ketebalan"
                className={heroControlClass}
                value={getConfigString("titleFontWeight") || archiveHeaderTitleWeightDefault}
                onChange={(value) => updateChildResponsiveConfig("titleFontWeight", value)}
                options={[
                  { value: "400", label: "Normal (400)" },
                  { value: "500", label: "Medium (500)" },
                  { value: "600", label: "Semi Bold (600)" },
                  { value: "700", label: "Bold (700)" },
                  { value: "800", label: "Extra Bold (800)" },
                ]}
              />
              <TextField
                label="Font"
                className={heroControlClass}
                value={getConfigString("titleFontFamily")}
                placeholder="inherit"
                onChange={(value) => updateChildResponsiveConfig("titleFontFamily", value || undefined)}
              />
            </div>,
          )}
          {renderHeroTextSection(
            "Deskripsi",
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker
                label="Warna Deskripsi"
                configKey="descriptionColor"
                globalDefault={globalExcerptTone}
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <NumberField
                label="Ukuran Deskripsi"
                className={heroControlClass}
                value={getConfigString("descriptionFontSize") || archiveHeaderDescriptionSizeDefault}
                onChange={(value) => updateChildResponsiveConfig("descriptionFontSize", value)}
                min={10}
              />
              <SelectField
                label="Ketebalan"
                className={heroControlClass}
                value={getConfigString("descriptionFontWeight") || archiveHeaderDescriptionWeightDefault}
                onChange={(value) => updateChildResponsiveConfig("descriptionFontWeight", value)}
                options={[
                  { value: "400", label: "Normal (400)" },
                  { value: "500", label: "Medium (500)" },
                  { value: "600", label: "Semi Bold (600)" },
                ]}
              />
              <TextField
                label="Font"
                className={heroControlClass}
                value={getConfigString("descriptionFontFamily")}
                placeholder="inherit"
                onChange={(value) => updateChildResponsiveConfig("descriptionFontFamily", value || undefined)}
              />
            </div>,
          )}
          {renderHeroTextSection(
            "Meta",
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker
                label="Warna Meta"
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
              <NumberField
                label="Ukuran Meta"
                className={heroControlClass}
                value={getConfigString("metaFontSize") || archiveHeaderMetaSizeDefault}
                onChange={(value) => updateChildResponsiveConfig("metaFontSize", value)}
                min={10}
              />
              <SelectField
                label="Ketebalan"
                className={heroControlClass}
                value={getConfigString("metaFontWeight") || archiveHeaderMetaWeightDefault}
                onChange={(value) => updateChildResponsiveConfig("metaFontWeight", value)}
                options={[
                  { value: "400", label: "Normal (400)" },
                  { value: "500", label: "Medium (500)" },
                  { value: "600", label: "Semi Bold (600)" },
                ]}
              />
              <TextField
                label="Font"
                className={heroControlClass}
                value={getConfigString("metaFontFamily")}
                placeholder="inherit"
                onChange={(value) => updateChildResponsiveConfig("metaFontFamily", value || undefined)}
              />
            </div>,
          )}
        </ArchiveSectionGroup>

        <ArchiveSectionGroup title="Pengaturan Aksen & Garis">
          {renderHeroTextSection(
            "Aksen & Border",
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker
                label="Warna Aksen"
                configKey="accentColor"
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
                label="Garis Panel"
                configKey="panelBorderColor"
                globalDefault={globalBorderTone}
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
            </div>,
          )}
        </ArchiveSectionGroup>
      </>
    );
  }

  if (childType === "archive_post_list") {
    return (
      <>
        <ArchiveSectionGroup title="Pengaturan Tata Letak">
          {renderHeroTextSection(
            "Daftar Artikel",
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Jumlah Artikel"
                className={heroControlClass}
                value={getConfigString("limit", "10")}
                onChange={(value) => updateChildConfig("limit", value)}
                min={1}
                max={30}
              />
              <NumberField
                label="Offset"
                className={heroControlClass}
                value={getConfigString("offset", "0")}
                onChange={(value) => updateChildConfig("offset", value)}
                min={0}
              />
              <NumberField
                label="Panjang Excerpt"
                className={heroControlClass}
                value={getConfigString("excerptLength", "120")}
                onChange={(value) => updateChildResponsiveConfig("excerptLength", value)}
                min={0}
              />
            </div>,
          )}
          {renderHeroTextSection(
            "Elemen",
            <div className="grid grid-cols-2 gap-2">
              <ToggleField
                label="Thumbnail"
                checked={getConfigBool("showImage", true)}
                onChange={(value) => updateChildResponsiveConfig("showImage", value)}
              />
              <ToggleField
                label="Kategori"
                checked={getConfigBool("showCategory", true)}
                onChange={(value) => updateChildResponsiveConfig("showCategory", value)}
              />
              <ToggleField
                label="Meta"
                checked={getConfigBool("showMetaInfo", true)}
                onChange={(value) => updateChildResponsiveConfig("showMetaInfo", value)}
              />
              <ToggleField
                label="Penulis"
                checked={getConfigBool("showAuthor", true)}
                onChange={(value) => updateChildResponsiveConfig("showAuthor", value)}
              />
              <ToggleField
                label="Tanggal"
                checked={getConfigBool("showDate", true)}
                onChange={(value) => updateChildResponsiveConfig("showDate", value)}
              />
              <ToggleField
                label="Excerpt"
                checked={getConfigBool("showExcerpt", true)}
                onChange={(value) => updateChildResponsiveConfig("showExcerpt", value)}
              />
              <ToggleField
                label="Pembatas"
                checked={getConfigBool("showDivider", true)}
                onChange={(value) => updateChildResponsiveConfig("showDivider", value)}
              />
            </div>,
          )}
          {renderHeroTextSection(
            "Thumbnail",
            <div className="grid grid-cols-2 gap-2">
              <NumberField
                label="Lebar Thumbnail"
                className={heroControlClass}
                value={getConfigString("imageWidth", "100")}
                onChange={(value) => updateChildResponsiveConfig("imageWidth", value)}
                min={40}
              />
              <NumberField
                label="Tinggi Thumbnail"
                className={heroControlClass}
                value={getConfigString("imageHeight", "75")}
                onChange={(value) => updateChildResponsiveConfig("imageHeight", value)}
                min={40}
              />
            </div>,
          )}
        </ArchiveSectionGroup>
        <ArchiveSectionGroup title="Pengaturan Teks">
          {renderSharedCategoryTextSection({
            textDefault: globalAccentTone,
            backgroundDefault: "transparent",
            showMarginBottom: true,
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
        </ArchiveSectionGroup>
        {renderSharedContentAlignmentSettings({
          copyTitle: "Terapkan perataan konten list arsip ke semua device",
          alignKey: "listContentAlign",
          alignDefault: "left",
        })}
      </>
    );
  }

  if (childType === "archive_pagination") {
    return (
      <>
        <ArchiveSectionGroup title="Pengaturan Navigasi">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-4 space-y-4">
            <div className="border-b border-[var(--border)] pb-2">
              <h5 className="text-xs font-semibold text-[var(--fg-primary)]">Navigasi</h5>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <NumberField
                label="Jumlah Nomor Halaman"
                className={heroControlClass}
                value={getConfigString("maxVisiblePages", "5")}
                onChange={(value) => updateChildConfig("maxVisiblePages", value)}
                min={3}
                max={9}
              />
              <TextField
                label="Label Sebelumnya"
                className={heroControlClass}
                value={getConfigString("prevLabel", "Sebelumnya")}
                onChange={(value) => updateChildConfig("prevLabel", value)}
              />
              <TextField
                label="Label Berikutnya"
                className={heroControlClass}
                value={getConfigString("nextLabel", "Berikutnya")}
                onChange={(value) => updateChildConfig("nextLabel", value)}
              />
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3 md:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <ToggleField
                    label="Tampilkan tombol prev/next"
                    checked={getConfigBool("showPrevNext", true)}
                    onChange={(value) => updateChildConfig("showPrevNext", value)}
                  />
                  <ToggleField
                    label="Tampilkan border box"
                    checked={getConfigBool("showPaginationBox", true)}
                    onChange={(value) => updateChildConfig("showPaginationBox", value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </ArchiveSectionGroup>
        <ArchiveSectionGroup title="Pengaturan Warna">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-4 space-y-4">
            <div className="border-b border-[var(--border)] pb-2">
              <h5 className="text-xs font-semibold text-[var(--fg-primary)]">Warna Pagination</h5>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ColorPicker
                label="Teks"
                configKey="textColor"
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
                label="Latar Aktif"
                configKey="activeBgColor"
                globalDefault={globalAccentTone}
                triggerClassName={heroColorTriggerClass}
                swatchClassName={heroColorSwatchClass}
                inputClassName={heroColorInputClass}
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
              />
              <div className="md:col-span-2">
                <ColorPicker
                  label="Teks Aktif"
                  configKey="activeTextColor"
                  globalDefault="#ffffff"
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
          </div>
        </ArchiveSectionGroup>
      </>
    );
  }

  if (childType === "archive_empty_state") {
    return (
      <>
        {renderHeroTextSection(
          "Konten",
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="Judul Kosong"
              className={heroControlClass}
              value={getConfigString("emptyTitle", "Belum ada artikel")}
              onChange={(value) => updateChildConfig("emptyTitle", value)}
            />
            <SelectField
              label="Perataan"
              className={heroControlClass}
              value={getConfigString("textAlign", "center")}
              onChange={(value) => updateChildResponsiveConfig("textAlign", value)}
              options={[
                { value: "left", label: "Kiri" },
                { value: "center", label: "Tengah" },
                { value: "right", label: "Kanan" },
              ]}
            />
            <div className="col-span-2">
              <TextareaField
                label="Deskripsi"
                className={heroControlClass}
                value={getConfigString("emptyDescription", "Belum ada artikel yang cocok untuk arsip ini saat ini.")}
                onChange={(value) => updateChildConfig("emptyDescription", value)}
              />
            </div>
            <TextField
              label="Teks Tombol"
              className={heroControlClass}
              value={getConfigString("emptyButtonText")}
              onChange={(value) => updateChildConfig("emptyButtonText", value)}
              placeholder="Opsional"
            />
            <TextField
              label="Link Tombol"
              className={heroControlClass}
              value={getConfigString("emptyButtonHref", "/")}
              onChange={(value) => updateChildConfig("emptyButtonHref", value)}
              placeholder="/"
            />
          </div>,
        )}
        {renderHeroTextSection(
          "Warna",
          <div className="grid grid-cols-2 gap-2">
            <ColorPicker
              label="Warna Judul"
              configKey="titleColor"
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
              label="Warna Deskripsi"
              configKey="descriptionColor"
              globalDefault={globalExcerptTone}
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Latar Tombol"
              configKey="buttonBgColor"
              globalDefault={globalAccentTone}
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
          </div>,
        )}
      </>
    );
  }

  return null;
}

export function renderArchiveSharedVisualSections({
  childType,
  child,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalAccentTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  updateChildResponsiveConfig,
  updateChildConfig,
  renderHeroTextSection,
  ColorPicker,
  renderNewsFeedSourceSettings,
  renderNewsFeedStyleSettings,
  renderHeroSliderContentSettings,
  renderHeroSliderStyleSettings,
  renderSidebarWidgetContentSettings,
  renderSidebarWidgetStyleSettings,
  renderTagCloudContentSettings,
  renderTagCloudStyleSettings,
  renderAdBannerContentSettings,
  renderAdBannerStyleSettings,
}: {
  childType: string;
  child: Block;
  heroControlClass: string;
  heroColorTriggerClass: string;
  heroColorSwatchClass: string;
  heroColorInputClass: string;
  globalAccentTone: string;
  getConfigBool: (key: string, fallback?: boolean) => boolean;
  getConfigString: (key: string, fallback?: string) => string;
  getConfigValue: (child: Block, key: string) => unknown;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
  updateChildConfig: (key: string, value: ConfigValue) => void;
  renderHeroTextSection: (title: string, content: ReactNode) => ReactNode;
  ColorPicker: BlockConfigPanelColorPickerRenderer;
  renderNewsFeedSourceSettings: (options?: {
    sectionTitle?: string;
    paginationSectionTitle?: string;
  }) => ReactNode;
  renderNewsFeedStyleSettings: () => ReactNode;
  renderHeroSliderContentSettings: (options?: {
    sectionTitle?: string;
    badgeLabel?: string;
    hideSourceControls?: boolean;
    sourceInfoText?: string;
    extraSections?: ReactNode;
  }) => ReactNode;
  renderHeroSliderStyleSettings: (options?: {
    hideMediaSection?: boolean;
    hideNavigationSection?: boolean;
    hideMiniThumbnailSection?: boolean;
  }) => ReactNode;
  renderSidebarWidgetContentSettings: (options?: {
    sectionTitle?: string;
  }) => ReactNode;
  renderSidebarWidgetStyleSettings: () => ReactNode;
  renderTagCloudContentSettings: (options?: {
    sectionTitle?: string;
    applyAllTitle?: string;
  }) => ReactNode;
  renderTagCloudStyleSettings: () => ReactNode;
  renderAdBannerContentSettings: (options?: {
    sourceSectionTitle?: string;
    emptyStateSectionTitle?: string;
  }) => ReactNode;
  renderAdBannerStyleSettings: () => ReactNode;
}) {
  if (childType === "news_grid") {
    return (
      <>
        {renderNewsFeedSourceSettings({
          sectionTitle: "Konten Grid Arsip",
          paginationSectionTitle: "Pagination Grid Arsip",
        })}
        {renderNewsFeedStyleSettings()}
      </>
    );
  }

  if (childType === "news_hero_slider") {
    return (
      <>
        {renderHeroSliderContentSettings({
          sectionTitle: "Konten Hero Slider Arsip",
          badgeLabel: "",
          hideSourceControls: true,
          extraSections: (
            <>
              {renderHeroTextSection(
                "Media",
                <div className="grid grid-cols-2 gap-2">
                  <NumberField
                    label="Tinggi Slide"
                    className={heroControlClass}
                    value={getConfigString("imageHeight")}
                    onChange={(value) => updateChildResponsiveConfig("imageHeight", value)}
                    min={0}
                  />
                  <NumberField
                    label="Opacity Overlay"
                    className={heroControlClass}
                    value={getConfigString("overlayOpacity", "70")}
                    onChange={(value) =>
                      updateChildResponsiveConfig(
                        "overlayOpacity",
                        value === undefined ? undefined : Math.max(0, Math.min(100, value)),
                      )
                    }
                    min={0}
                    max={100}
                  />
                </div>,
              )}
              {renderHeroTextSection(
                "Navigasi",
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2 grid grid-cols-2 gap-2">
                    <ToggleField
                      label="Panah"
                      checked={getConfigBool("showArrows", true)}
                      onChange={(value) => updateChildConfig("showArrows", value)}
                    />
                    <ToggleField
                      label="Dots"
                      checked={getConfigBool("showDots", true)}
                      onChange={(value) => updateChildConfig("showDots", value)}
                    />
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
                </div>,
              )}
              {renderHeroTextSection(
                "Thumbnail",
                <>
                  <ToggleField
                    label="Tampilkan Thumbnail"
                    checked={getConfigBool("showMiniThumbnails", false)}
                    onChange={(value) => updateChildConfig("showMiniThumbnails", value)}
                  />
                  {getConfigBool("showMiniThumbnails", false) && (
                    <div className="grid grid-cols-2 gap-2">
                      <NumberField
                        label="Jumlah Thumbnail"
                        className={heroControlClass}
                        value={getConfigString("thumbnailVisibleCount", "4")}
                        onChange={(value) => updateChildConfig("thumbnailVisibleCount", value)}
                        min={2}
                        max={6}
                      />
                      <NumberField
                        label="Tinggi Thumbnail"
                        className={heroControlClass}
                        value={getConfigString("thumbnailImageHeight", "72")}
                        onChange={(value) => updateChildResponsiveConfig("thumbnailImageHeight", value)}
                        min={0}
                      />
                    </div>
                  )}
                </>,
              )}
            </>
          ),
        })}
        {renderHeroSliderStyleSettings({
          hideMediaSection: true,
          hideNavigationSection: true,
          hideMiniThumbnailSection: true,
        })}
      </>
    );
  }

  if (childType === "sidebar_widget") {
    return (
      <>
        {renderSidebarWidgetContentSettings({
          sectionTitle: "Sidebar Arsip",
        })}
        {renderSidebarWidgetStyleSettings()}
      </>
    );
  }

  if (childType === "tag_cloud") {
    return (
      <>
        {renderTagCloudContentSettings({
          sectionTitle: "Tag Cloud Arsip",
          applyAllTitle: "Terapkan jumlah tag cloud arsip ke semua device",
        })}
        {renderTagCloudStyleSettings()}
      </>
    );
  }

  if (childType === "ad_banner") {
    return (
      <>
        {renderAdBannerContentSettings({
          sourceSectionTitle: "Sumber Iklan Arsip",
          emptyStateSectionTitle: "Perilaku Iklan Arsip",
        })}
        {renderAdBannerStyleSettings()}
      </>
    );
  }

  return null;
}

export function renderArchiveSharedAdvancedSections({
  childType,
  renderNewsFeedAdvancedSettings,
  renderHeroSliderAdvancedSettings,
  renderSidebarWidgetAdvancedSettings,
  renderTagCloudAdvancedSettings,
  renderAdBannerAdvancedSettings,
  renderSharedVisibilitySettings,
  renderSharedBoxBackgroundSettings,
  renderSharedWidgetSpacingSettings,
}: {
  childType: string;
  renderNewsFeedAdvancedSettings: () => ReactNode;
  renderHeroSliderAdvancedSettings: () => ReactNode;
  renderSidebarWidgetAdvancedSettings: () => ReactNode;
  renderTagCloudAdvancedSettings: () => ReactNode;
  renderAdBannerAdvancedSettings: () => ReactNode;
  renderSharedVisibilitySettings: () => ReactNode;
  renderSharedBoxBackgroundSettings: (options: string) => ReactNode;
  renderSharedWidgetSpacingSettings: (options: string) => ReactNode;
}) {
  if (childType === "news_grid") {
    return (
      <div className="space-y-4">
        {renderSharedVisibilitySettings()}
        {renderSharedBoxBackgroundSettings("Terapkan background Grid News arsip ke semua device")}
        {renderSharedWidgetSpacingSettings("Terapkan margin dan padding Grid News arsip ke semua device")}
      </div>
    );
  }

  if (childType === "news_hero_slider") {
    return renderHeroSliderAdvancedSettings();
  }

  if (childType === "sidebar_widget") {
    return (
      <div className="space-y-4">
        {renderSharedVisibilitySettings()}
        {renderSharedBoxBackgroundSettings("Terapkan background Sidebar Arsip ke semua device")}
        {renderSharedWidgetSpacingSettings("Terapkan margin dan padding Sidebar Arsip ke semua device")}
      </div>
    );
  }

  if (childType === "tag_cloud") {
    return (
      <div className="space-y-4">
        {renderSharedVisibilitySettings()}
        {renderSharedBoxBackgroundSettings("Terapkan background Tag Cloud arsip ke semua device")}
        {renderSharedWidgetSpacingSettings("Terapkan margin dan padding Tag Cloud arsip ke semua device")}
      </div>
    );
  }

  if (childType === "ad_banner") {
    return (
      <div className="space-y-4">
        {renderSharedVisibilitySettings()}
        {renderSharedBoxBackgroundSettings("Terapkan background Iklan Banner arsip ke semua device")}
        {renderSharedWidgetSpacingSettings("Terapkan margin dan padding Iklan Banner arsip ke semua device")}
      </div>
    );
  }

  return null;
}

export function renderArchiveAdvancedSections({
  childType,
  renderSharedVisibilitySettings,
  renderSharedBoxBackgroundSettings,
  renderSharedWidgetSpacingSettings,
}: ArchiveAdvancedProps) {
  if (!isArchiveWidgetWithDedicatedSections(childType)) return null;

  return (
    <div className="space-y-4">
      {renderSharedVisibilitySettings()}
      {renderSharedBoxBackgroundSettings("Terapkan background widget archive ke semua device")}
      {renderSharedWidgetSpacingSettings("Terapkan margin dan padding widget archive ke semua device")}
    </div>
  );
}

export {
  isArchiveWidgetWithDedicatedSections,
  isArchiveWidgetWithSharedVisualSections,
};
