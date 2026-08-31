import type { ReactNode } from "react";
import { Copy } from "lucide-react";
import type { ConfigValue } from "@/lib/page-builder-config";
import type { Block } from "./types";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";
import type {
  BlockConfigPanelColorPickerRenderer,
  BlockConfigPanelCoreVisualProps,
  BlockConfigPanelSurfaceVisualProps,
} from "./BlockConfigPanelSharedTypes";

type BlockConfigPanelPostVisualSharedProps = Pick<
  BlockConfigPanelCoreVisualProps,
  | "child"
  | "getConfigBool"
  | "getConfigString"
  | "getConfigValue"
  | "getConfigForApply"
  | "applyToAllDevices"
  | "updateChildResponsiveConfig"
  | "updateChildConfig"
  | "ColorPicker"
> & {
  deviceLabel: string;
};

type BlockConfigPanelPostVisualControlProps = Pick<
  BlockConfigPanelCoreVisualProps,
  | "heroControlClass"
  | "heroColorTriggerClass"
  | "heroColorSwatchClass"
  | "heroColorInputClass"
>;

type BlockConfigPanelPostVisualToneProps = Pick<
  BlockConfigPanelSurfaceVisualProps,
  "globalSurfaceTone" | "globalBorderTone"
> &
  Pick<
    BlockConfigPanelCoreVisualProps,
    | "globalAccentTone"
    | "globalMetaTone"
    | "globalNewsTitleColor"
    | "globalHoverColor"
    | "globalWidgetTitleColor"
    | "globalExcerptTone"
  > & {
    globalPostLinkTone: string;
  };

type BlockConfigPanelPostMetaVisibilityProps = {
  isPostMetaAuthorVisible: boolean;
};

type BlockConfigPanelPostTypographyStateProps = {
  isPostMetaWidget: boolean;
  isPostContentWidget: boolean;
  isPostTypographyWithLineHeight: boolean;
  postTypographyDefaultColor: string;
  postTypographySectionTitle: string;
};

type BlockConfigPanelPostContentBorderStateProps = {
  isPostContentBorderEnabled: boolean;
};

type BlockConfigPanelPostMetaVisualSectionProps = BlockConfigPanelPostVisualSharedProps &
  BlockConfigPanelPostMetaVisibilityProps;

type BlockConfigPanelPostStatsVisualSectionProps = BlockConfigPanelPostVisualSharedProps;

type BlockConfigPanelPostShareVisualSectionProps = BlockConfigPanelPostVisualSharedProps &
  Pick<BlockConfigPanelPostVisualControlProps, "heroControlClass" | "heroColorTriggerClass">;

type BlockConfigPanelPostSurfaceTextVisualSectionProps = BlockConfigPanelPostVisualSharedProps &
  BlockConfigPanelPostVisualControlProps &
  Pick<
    BlockConfigPanelPostVisualToneProps,
    "globalSurfaceTone" | "globalMetaTone" | "globalWidgetTitleColor" | "globalExcerptTone"
  >;

type BlockConfigPanelPostCommentsVisualSectionProps = BlockConfigPanelPostVisualSharedProps &
  Pick<
    BlockConfigPanelPostVisualToneProps,
    | "globalSurfaceTone"
    | "globalBorderTone"
    | "globalAccentTone"
    | "globalMetaTone"
    | "globalPostLinkTone"
    | "globalWidgetTitleColor"
    | "globalExcerptTone"
  >;

type BlockConfigPanelPostCommentsBehaviorSectionProps = Pick<
  BlockConfigPanelPostVisualSharedProps,
  | "deviceLabel"
  | "getConfigBool"
  | "getConfigString"
  | "getConfigForApply"
  | "applyToAllDevices"
  | "updateChildResponsiveConfig"
> &
  Pick<BlockConfigPanelPostVisualControlProps, "heroControlClass">;

type BlockConfigPanelPostRelatedPostsVisualSectionProps = BlockConfigPanelPostVisualSharedProps &
  Pick<
    BlockConfigPanelPostVisualControlProps,
    "heroControlClass" | "heroColorTriggerClass" | "heroColorSwatchClass" | "heroColorInputClass"
  > &
  Pick<
    BlockConfigPanelPostVisualToneProps,
    | "globalSurfaceTone"
    | "globalBorderTone"
    | "globalAccentTone"
    | "globalMetaTone"
    | "globalNewsTitleColor"
    | "globalWidgetTitleColor"
    | "globalHoverColor"
    | "globalExcerptTone"
  >;

type BlockConfigPanelPostNavigationVisualSectionProps = BlockConfigPanelPostVisualSharedProps &
  BlockConfigPanelPostVisualControlProps &
  Pick<
    BlockConfigPanelPostVisualToneProps,
    "globalBorderTone" | "globalNewsTitleColor" | "globalHoverColor"
  >;

type BlockConfigPanelPostTypographyVisualSectionProps = BlockConfigPanelPostVisualSharedProps &
  BlockConfigPanelPostVisualControlProps &
  BlockConfigPanelPostTypographyStateProps;

type BlockConfigPanelPostContentBorderVisualSectionProps = BlockConfigPanelPostVisualSharedProps &
  BlockConfigPanelPostVisualControlProps &
  BlockConfigPanelPostContentBorderStateProps &
  Pick<BlockConfigPanelPostVisualToneProps, "globalBorderTone">;

function renderPostBuilderSectionHeading(title: string) {
  return (
    <div className="border-b border-[var(--border)] pb-2">
      <h5 className="text-xs font-semibold text-[var(--fg-primary)]">{title}</h5>
    </div>
  );
}

function renderPostBuilderCollapseSection(options: {
  title: string;
  children: ReactNode;
  onCopy?: () => void;
  defaultOpen?: boolean;
}) {
  const { title, children, onCopy, defaultOpen = false } = options;

  return (
    <details className="group mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-2.5 first:mt-0" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-medium text-[var(--fg-primary)]">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className="mt-[1px] inline-block h-0 w-0 shrink-0 border-y-[4px] border-y-transparent border-l-[6px] border-l-current text-[var(--fg-primary)] transition-transform group-open:rotate-90"
            aria-hidden="true"
          />
          <span className="truncate">{title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {onCopy ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onCopy();
              }}
              className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
              title={`Terapkan ${title.toLowerCase()} ke semua device`}
            >
              <Copy size={10} /> Semua
            </button>
          ) : null}
        </span>
      </summary>
      <div className="mt-2.5 space-y-2.5">{children}</div>
    </details>
  );
}

function renderPostBuilderDeviceBadge(deviceLabel: string) {
  return (
    <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
      {deviceLabel}
    </span>
  );
}

function renderPostBuilderToggleRow(options: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  const { label, checked, onChange, disabled = false } = options;

  return (
    <div className={`flex items-center justify-between gap-3 py-1.5 ${disabled ? "opacity-60" : ""}`}>
      <span className="text-[11px] font-medium text-[var(--fg-primary)]">{label}</span>
      <label className={`relative inline-flex items-center ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] peer-disabled:opacity-60 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
      </label>
    </div>
  );
}

export function BlockConfigPanelPostMetaVisualSection({
  deviceLabel,
  isPostMetaAuthorVisible,
  getConfigBool,
  getConfigString,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
}: BlockConfigPanelPostMetaVisualSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Meta Artikel"
      badge={renderPostBuilderDeviceBadge(deviceLabel)}
      copyTitle="Terapkan pengaturan meta ke semua device"
      onCopy={() => {
          const showAuthor = getConfigForApply("showAuthor");
          const showAuthorAvatar = getConfigForApply("showAuthorAvatar");
          const showDate = getConfigForApply("showDate");
          const showCategory = getConfigForApply("showCategory");
          const metaDesign = getConfigForApply("metaDesign");
          if (showAuthor !== undefined) applyToAllDevices("showAuthor", showAuthor as ConfigValue);
          if (showAuthorAvatar !== undefined) applyToAllDevices("showAuthorAvatar", showAuthorAvatar as ConfigValue);
          if (showDate !== undefined) applyToAllDevices("showDate", showDate as ConfigValue);
          if (showCategory !== undefined) applyToAllDevices("showCategory", showCategory as ConfigValue);
          if (metaDesign !== undefined) applyToAllDevices("metaDesign", metaDesign as ConfigValue);
      }}
      className="post-builder-panel-card !mb-6"
    >

      {renderPostBuilderCollapseSection({
        title: "Elemen Meta",
        children: (
          <>
        {renderPostBuilderToggleRow({
          label: "Penulis",
          checked: getConfigBool("showAuthor", true),
          onChange: (checked) => updateChildResponsiveConfig("showAuthor", checked),
        })}
        {renderPostBuilderToggleRow({
          label: "Avatar",
          checked: getConfigBool("showAuthorAvatar", true),
          onChange: (checked) => updateChildResponsiveConfig("showAuthorAvatar", checked),
          disabled: !isPostMetaAuthorVisible,
        })}
        {renderPostBuilderToggleRow({
          label: "Tanggal",
          checked: getConfigBool("showDate", true),
          onChange: (checked) => updateChildResponsiveConfig("showDate", checked),
        })}
        {renderPostBuilderToggleRow({
          label: "Kategori",
          checked: getConfigBool("showCategory", true),
          onChange: (checked) => updateChildResponsiveConfig("showCategory", checked),
        })}
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Desain Meta",
        children: (
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "minimal", label: "Minimal" },
            { key: "pill", label: "Pill" },
            { key: "boxed", label: "Boxed" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => updateChildResponsiveConfig("metaDesign", item.key)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                getConfigString("metaDesign", "minimal") === item.key
                  ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        ),
      })}
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelPostStatsVisualSection({
  deviceLabel,
  getConfigBool,
  getConfigString,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
}: BlockConfigPanelPostStatsVisualSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Statistik Artikel"
      badge={renderPostBuilderDeviceBadge(deviceLabel)}
      copyTitle="Terapkan pengaturan statistik ke semua device"
      onCopy={() => {
          const showViews = getConfigForApply("showViews");
          const showComments = getConfigForApply("showComments");
          const statsDesign = getConfigForApply("statsDesign");
          if (showViews !== undefined) applyToAllDevices("showViews", showViews as ConfigValue);
          if (showComments !== undefined) applyToAllDevices("showComments", showComments as ConfigValue);
          if (statsDesign !== undefined) applyToAllDevices("statsDesign", statsDesign as ConfigValue);
      }}
      className="post-builder-panel-card !mb-6"
    >

      {renderPostBuilderCollapseSection({
        title: "Elemen Statistik",
        children: (
          <>
        {renderPostBuilderToggleRow({
          label: "Jumlah Pembaca",
          checked: getConfigBool("showViews", true),
          onChange: (checked) => updateChildResponsiveConfig("showViews", checked),
        })}
        {renderPostBuilderToggleRow({
          label: "Jumlah Komentar",
          checked: getConfigBool("showComments", true),
          onChange: (checked) => updateChildResponsiveConfig("showComments", checked),
        })}
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Desain Statistik",
        children: (
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "minimal", label: "Minimal" },
            { key: "pill", label: "Pill" },
            { key: "boxed", label: "Boxed" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => updateChildResponsiveConfig("statsDesign", item.key)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                getConfigString("statsDesign", "minimal") === item.key
                  ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        ),
      })}
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelPostShareVisualSection({
  child,
  deviceLabel,
  heroControlClass,
  heroColorTriggerClass,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelPostShareVisualSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Tombol Share"
      badge={renderPostBuilderDeviceBadge(deviceLabel)}
      copyTitle="Terapkan tampilan tombol share ke semua device"
      onCopy={() => {
          const keys = [
            "showShareLabel",
            "shareLabelText",
            "shareSize",
            "shareGap",
            "shareRadius",
            "shareShowContainerBorder",
            "shareLabelPosition",
            "shareContentMode",
            "shareTheme",
            "shareThemeColor",
            "shareOutlineColor",
            "shareBrandColor",
            "iconOnlyShape",
            "shareIconSize",
            "shareLabelFontSize",
            "shareLabelLineHeight",
            "shareLabelFontWeight",
            "shareLabelColor",
            "showFacebook",
            "showTwitter",
            "showWhatsapp",
            "showTelegram",
            "showLinkedIn",
            "showEmail",
            "showCopyLink",
          ] as const;

          keys.forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
      }}
      className="post-builder-panel-card !mb-6"
    >

      {renderPostBuilderCollapseSection({
        title: "Label Share",
        children: (
          <>
        {renderPostBuilderToggleRow({
          label: "Tampilkan Label Share",
          checked: getConfigBool("showShareLabel", true),
          onChange: (checked) => updateChildResponsiveConfig("showShareLabel", checked),
        })}

        {getConfigBool("showShareLabel", true) && (
          <>
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Teks Label</label>
              <input
                type="text"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
                value={getConfigString("shareLabelText", "Bagikan :")}
                onChange={(e) => updateChildResponsiveConfig("shareLabelText", e.target.value)}
                placeholder="Bagikan :"
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Posisi Label</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "top", label: "Di Atas Tombol" },
                  { key: "inline", label: "Sebelum Ikon" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => updateChildResponsiveConfig("shareLabelPosition", item.key)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      getConfigString("shareLabelPosition", "inline") === item.key
                        ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran (px)</label>
                <input
                  type="number"
                  min={10}
                  className={heroControlClass}
                  value={getConfigString("shareLabelFontSize", "14")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("shareLabelFontSize", Number.isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Baris</label>
                <input
                  type="number"
                  step="0.1"
                  className={heroControlClass}
                  value={getConfigString("shareLabelLineHeight", "1.4")}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateChildResponsiveConfig("shareLabelLineHeight", Number.isNaN(val) ? undefined : val);
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
                <select
                  className={heroControlClass}
                  value={getConfigString("shareLabelFontWeight", "600")}
                  onChange={(e) => updateChildResponsiveConfig("shareLabelFontWeight", e.target.value)}
                >
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi Bold (600)</option>
                  <option value="700">Bold (700)</option>
                </select>
              </div>
              <ColorPicker
                label="Warna Label"
                configKey="shareLabelColor"
                globalDefault="#111827"
                child={child}
                getConfigValue={getConfigValue}
                updateChildResponsiveConfig={updateChildResponsiveConfig}
                updateChildConfig={updateChildConfig}
                triggerClassName={heroColorTriggerClass}
              />
            </div>
          </>
        )}
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Desain Tombol",
        children: (
          <>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tema Tombol</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "brand", label: "Full Color" },
              { key: "outline", label: "Outline" },
              { key: "minimal", label: "Minimalis" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateChildResponsiveConfig("shareTheme", item.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  getConfigString("shareTheme", "brand") === item.key
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        {getConfigString("shareTheme", "brand") === "brand" && (
          <ColorPicker
            label="Warna Full Color"
            configKey="shareBrandColor"
            globalDefault="#111827"
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            triggerClassName={heroColorTriggerClass}
          />
        )}
        {getConfigString("shareTheme", "brand") === "minimal" && (
          <ColorPicker
            label="Warna Tema"
            configKey="shareThemeColor"
            globalDefault="#111827"
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            triggerClassName={heroColorTriggerClass}
          />
        )}
        {getConfigString("shareTheme", "brand") === "outline" && (
          <ColorPicker
            label="Warna Outline"
            configKey="shareOutlineColor"
            globalDefault="#111827"
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
            triggerClassName={heroColorTriggerClass}
          />
        )}
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Mode Tombol</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "icon_text", label: "Icon + Text" },
              { key: "icon_only", label: "Icon Saja" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateChildResponsiveConfig("shareContentMode", item.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  getConfigString("shareContentMode", "icon_text") === item.key
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {getConfigString("shareContentMode", "icon_text") === "icon_only" && (
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Bentuk Icon</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "square", label: "Kotak" },
                { key: "circle", label: "Bulat" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => updateChildResponsiveConfig("iconOnlyShape", item.key)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                    getConfigString("iconOnlyShape", "square") === item.key
                      ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Ukuran Tombol",
        children: (
          <>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran Tombol</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "sm", label: "Kecil" },
              { key: "md", label: "Sedang" },
              { key: "lg", label: "Besar" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateChildResponsiveConfig("shareSize", item.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  getConfigString("shareSize", "md") === item.key
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran Icon (px)</label>
            <input
              type="number"
              min={10}
              className={heroControlClass}
              value={getConfigString("shareIconSize", getConfigString("shareContentMode", "icon_text") === "icon_only" ? "20" : "14")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("shareIconSize", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jarak Antar Tombol (px)</label>
            <input
              type="number"
              min={0}
              className={heroControlClass}
              value={getConfigString("shareGap", "8")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("shareGap", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Bentuk Sudut</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "global", label: "Global" },
              { key: "sm", label: "Kecil" },
              { key: "md", label: "Normal" },
              { key: "pill", label: "Pill" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateChildResponsiveConfig("shareRadius", item.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  getConfigString("shareRadius", "global") === item.key
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Border Kontainer",
        children: renderPostBuilderToggleRow({
          label: "Tampilkan Border Kontainer",
          checked: getConfigBool("shareShowContainerBorder", getConfigBool("shareShowBorder", true)),
          onChange: (checked) => {
            updateChildResponsiveConfig("shareShowContainerBorder", checked);
            updateChildConfig("shareShowBorder", undefined);
          },
        }),
      })}

      {renderPostBuilderCollapseSection({
        title: "Platform Aktif",
        children: (
        <div className="grid grid-cols-1 gap-2">
          {[
            { key: "showFacebook", label: "Facebook", default: true },
            { key: "showTwitter", label: "X (Twitter)", default: true },
            { key: "showWhatsapp", label: "WhatsApp", default: true },
            { key: "showTelegram", label: "Telegram", default: false },
            { key: "showLinkedIn", label: "LinkedIn", default: false },
            { key: "showEmail", label: "Email", default: false },
            { key: "showCopyLink", label: "Salin Link", default: true },
          ].map((item) => {
            const checked = getConfigBool(item.key, item.default);
            return (
              <div key={item.key}>
                {renderPostBuilderToggleRow({
                  label: item.label,
                  checked,
                  onChange: (value) => updateChildResponsiveConfig(item.key, value),
                })}
              </div>
            );
          })}
        </div>
        ),
      })}
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelPostAuthorBoxVisualSection({
  child,
  deviceLabel,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalSurfaceTone,
  globalMetaTone,
  globalWidgetTitleColor,
  globalExcerptTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelPostSurfaceTextVisualSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Box Penulis"
      badge={renderPostBuilderDeviceBadge(deviceLabel)}
      copyTitle="Terapkan pengaturan Box Penulis ke semua device"
      onCopy={() => {
          const keys = [
            "authorSource",
            "showAuthorLabel",
            "authorLabelText",
            "showAuthorAvatar",
            "showAuthorBio",
            "authorDesign",
            "useBox",
            "boxColor",
            "boxBorderRadius",
            "avatarSize",
            "avatarRadius",
            "labelColor",
            "nameColor",
            "bioColor",
          ] as const;

          keys.forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
      }}
      className="post-builder-panel-card !mb-6"
    >

      {renderPostBuilderCollapseSection({
        title: "Konten Penulis",
        children: (
          <>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Sumber Profil</label>
          <select
            className={heroControlClass}
            value={getConfigString("authorSource", "author") === "editor" ? "editor" : "author"}
            onChange={(e) => updateChildResponsiveConfig("authorSource", e.target.value === "editor" ? "editor" : "author")}
          >
            <option value="author">Penulis</option>
            <option value="editor">Editor</option>
          </select>
        </div>
        {renderPostBuilderToggleRow({
          label: "Tampilkan Label",
          checked: getConfigBool("showAuthorLabel", true),
          onChange: (checked) => updateChildResponsiveConfig("showAuthorLabel", checked),
        })}
        {getConfigBool("showAuthorLabel", true) && (
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Teks Label</label>
            <input
              type="text"
              className={heroControlClass}
              value={getConfigString("authorLabelText", "Penulis")}
              onChange={(e) => updateChildResponsiveConfig("authorLabelText", e.target.value)}
              placeholder="Penulis"
            />
          </div>
        )}
        {renderPostBuilderToggleRow({
          label: "Tampilkan Avatar",
          checked: getConfigBool("showAuthorAvatar", true),
          onChange: (checked) => updateChildResponsiveConfig("showAuthorAvatar", checked),
        })}
        {renderPostBuilderToggleRow({
          label: "Tampilkan Bio",
          checked: getConfigBool("showAuthorBio", true),
          onChange: (checked) => updateChildResponsiveConfig("showAuthorBio", checked),
        })}
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Desain Box Penulis",
        children: (
          <>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: "minimal", label: "Minimal" },
            { key: "card", label: "Card" },
            { key: "split", label: "Split" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => updateChildResponsiveConfig("authorDesign", item.key)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                getConfigString("authorDesign", "minimal") === item.key
                  ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        {renderPostBuilderToggleRow({
          label: "Aktifkan Background",
          checked: getConfigBool("useBox"),
          onChange: (checked) => updateChildResponsiveConfig("useBox", checked),
        })}
        {getConfigBool("useBox") && (
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker
              label="Warna Latar"
              configKey="boxColor"
              globalDefault={globalSurfaceTone}
              labelClassName="!text-[10px] !text-[var(--fg-secondary)] !font-medium !normal-case !tracking-normal !mb-1"
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Radius</label>
              <select
                className={heroControlClass}
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
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Avatar",
        children: (
        <div className={`grid grid-cols-2 gap-3 ${getConfigBool("showAuthorAvatar", true) ? "" : "opacity-60"}`}>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran Avatar (px)</label>
            <input
              type="number"
              min={24}
              className={heroControlClass}
              value={getConfigString("avatarSize")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("avatarSize", Number.isNaN(val) ? undefined : val);
              }}
              disabled={!getConfigBool("showAuthorAvatar", true)}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Radius Avatar (px)</label>
            <input
              type="number"
              min={0}
              className={heroControlClass}
              value={getConfigString("avatarRadius")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("avatarRadius", Number.isNaN(val) ? undefined : val);
              }}
              disabled={!getConfigBool("showAuthorAvatar", true)}
            />
          </div>
        </div>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Warna Teks",
        children: (
        <div className="grid grid-cols-2 gap-3">
            <ColorPicker
              label="Warna Label"
              configKey="labelColor"
              globalDefault={globalMetaTone}
              labelClassName="!text-[10px] !text-[var(--fg-secondary)] !font-medium !normal-case !tracking-normal !mb-1"
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Warna Nama"
              configKey="nameColor"
              globalDefault={globalWidgetTitleColor}
              labelClassName="!text-[10px] !text-[var(--fg-secondary)] !font-medium !normal-case !tracking-normal !mb-1"
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
          <div className="col-span-2">
            <ColorPicker
              label="Warna Bio"
              configKey="bioColor"
              globalDefault={globalExcerptTone}
              labelClassName="!text-[10px] !text-[var(--fg-secondary)] !font-medium !normal-case !tracking-normal !mb-1"
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
        ),
      })}
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelPostTagsVisualSection({
  child,
  deviceLabel,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalSurfaceTone,
  globalMetaTone,
  globalExcerptTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelPostSurfaceTextVisualSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Tampilan Tag Artikel"
      badge={renderPostBuilderDeviceBadge(deviceLabel)}
      copyTitle="Terapkan pengaturan Tag Artikel ke semua device"
      onCopy={() => {
          const keys = [
            "showTagLabel",
            "tagLabelText",
            "tagLabelFontSize",
            "tagLabelLineHeight",
            "tagLabelFontWeight",
            "tagLabelColor",
            "tagDesign",
            "tagFontSize",
            "tagLineHeight",
            "tagBorderRadius",
            "tagPaddingX",
            "tagPaddingY",
            "tagGapX",
            "tagGapY",
            "tagTextColor",
            "tagBackgroundColor",
            "tagBorderColor",
            "tagHoverBackgroundColor",
            "tagHoverTextColor",
            "tagHoverBorderColor",
          ] as const;

          keys.forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
      }}
      className="post-builder-panel-card !mb-6"
    >

      {renderPostBuilderCollapseSection({
        title: "Desain Tag",
        children: (
          <>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tema Tag</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "cloud", label: "Cloud" },
              { key: "soft", label: "Soft" },
              { key: "outline", label: "Outline" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateChildResponsiveConfig("tagDesign", item.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  getConfigString("tagDesign", "cloud") === item.key
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran Tag (px)</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("tagFontSize", "12")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("tagFontSize", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Baris Tag</label>
            <input
              type="number"
              step="0.1"
              className={heroControlClass}
              value={getConfigString("tagLineHeight", "1.3")}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateChildResponsiveConfig("tagLineHeight", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Bentuk Sudut</label>
            <select
              className={heroControlClass}
              value={getConfigString("tagBorderRadius", "default")}
              onChange={(e) => updateChildResponsiveConfig("tagBorderRadius", e.target.value)}
            >
              <option value="default">Global</option>
              <option value="none">Kotak</option>
              <option value="sm">Kecil</option>
              <option value="md">Sedang</option>
              <option value="lg">Besar</option>
              <option value="xl">XL</option>
              <option value="full">Pill</option>
            </select>
          </div>
        </div>
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Jarak dan Padding",
        children: (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jarak Horizontal (px)</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("tagGapX", "8")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("tagGapX", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jarak Vertikal (px)</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("tagGapY", "8")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("tagGapY", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Padding Kiri/Kanan (px)</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("tagPaddingX", "12")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("tagPaddingX", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Padding Atas/Bawah (px)</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("tagPaddingY", "4")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("tagPaddingY", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
        </div>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Warna Tag",
        children: (
          <>
        <div className="space-y-3">
          <p className="text-[11px] font-medium text-[var(--fg-primary)]">Normal</p>
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker
              label="Warna Teks"
              configKey="tagTextColor"
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
              label="Warna Latar"
              configKey="tagBackgroundColor"
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
              label="Warna Garis"
              configKey="tagBorderColor"
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
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-medium text-[var(--fg-primary)]">Sorot</p>
          <div className="grid grid-cols-2 gap-3">
            <ColorPicker
              label="Warna Latar Sorot"
              configKey="tagHoverBackgroundColor"
              globalDefault={globalMetaTone}
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Warna Teks Sorot"
              configKey="tagHoverTextColor"
              globalDefault="#FFFFFF"
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <ColorPicker
              label="Warna Garis Sorot"
              configKey="tagHoverBorderColor"
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
        </div>
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Label Tag",
        children: (
          <>
        {renderPostBuilderToggleRow({
          label: "Tampilkan Label Tag",
          checked: getConfigBool("showTagLabel", true),
          onChange: (checked) => updateChildResponsiveConfig("showTagLabel", checked),
        })}

        {getConfigBool("showTagLabel", true) && (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Teks Label</label>
              <input
                type="text"
                className={heroControlClass}
                value={getConfigString("tagLabelText", "Tag Terkait :")}
                onChange={(e) => updateChildResponsiveConfig("tagLabelText", e.target.value)}
                placeholder="Tag Terkait :"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran (px)</label>
                <input
                  type="number"
                  className={heroControlClass}
                  value={getConfigString("tagLabelFontSize", "12")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("tagLabelFontSize", Number.isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Baris</label>
                <input
                  type="number"
                  step="0.1"
                  className={heroControlClass}
                  value={getConfigString("tagLabelLineHeight", "1.4")}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateChildResponsiveConfig("tagLabelLineHeight", Number.isNaN(val) ? undefined : val);
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
                <select
                  className={heroControlClass}
                  value={getConfigString("tagLabelFontWeight", "600")}
                  onChange={(e) => updateChildResponsiveConfig("tagLabelFontWeight", e.target.value)}
                >
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi Bold (600)</option>
                  <option value="700">Bold (700)</option>
                </select>
              </div>
              <ColorPicker
                label="Warna Label"
                configKey="tagLabelColor"
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
          </div>
        )}
          </>
        ),
      })}
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelPostBreadcrumbVisualSection({
  child,
  deviceLabel,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalMetaTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelPostSurfaceTextVisualSectionProps) {
  const deviceBadge = (
    <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
      {deviceLabel}
    </span>
  );

  return (
    <>
      <BlockConfigPanelCollapseCard
        title="Elemen"
        badge={deviceBadge}
        collapsible
        defaultOpen={false}
        copyTitle="Terapkan pengaturan elemen ke semua device"
        onCopy={() => {
          const showPostTitle = getConfigForApply("showPostTitle");
          const showHomeIcon = getConfigForApply("showHomeIcon");
          if (showPostTitle !== undefined) applyToAllDevices("showPostTitle", showPostTitle as ConfigValue);
          if (showHomeIcon !== undefined) applyToAllDevices("showHomeIcon", showHomeIcon as ConfigValue);
        }}
      >
        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
          <label className="text-[11px] font-medium text-[var(--fg-primary)] block">Judul Berita</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={getConfigBool("showPostTitle", true)}
              onChange={(e) => updateChildResponsiveConfig("showPostTitle", e.target.checked)}
            />
            <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
          <label className="text-[11px] font-medium text-[var(--fg-primary)] block">Ikon Beranda</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={getConfigBool("showHomeIcon", false)}
              onChange={(e) => updateChildResponsiveConfig("showHomeIcon", e.target.checked)}
            />
            <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-[var(--bg-base)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-base)] after:border-[var(--border)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
        </div>
      </BlockConfigPanelCollapseCard>

      <BlockConfigPanelCollapseCard
        title="Desain"
        badge={deviceBadge}
        collapsible
        defaultOpen={false}
        copyTitle="Terapkan desain ke semua device"
        onCopy={() => {
          const breadcrumbDesign = getConfigForApply("breadcrumbDesign");
          const separatorType = getConfigForApply("separatorType");
          if (breadcrumbDesign !== undefined) applyToAllDevices("breadcrumbDesign", breadcrumbDesign as ConfigValue);
          if (separatorType !== undefined) applyToAllDevices("separatorType", separatorType as ConfigValue);
        }}
      >
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Gaya</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "minimal", label: "Minimal" },
              { key: "pill", label: "Pill" },
              { key: "boxed", label: "Boxed" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateChildResponsiveConfig("breadcrumbDesign", item.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  getConfigString("breadcrumbDesign", "minimal") === item.key
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Pembatas</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "slash", label: "Slash" },
              { key: "chevron", label: "Chevron" },
              { key: "line", label: "Garis Lurus" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateChildResponsiveConfig("separatorType", item.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  getConfigString("separatorType", "slash") === item.key
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </BlockConfigPanelCollapseCard>

      <BlockConfigPanelCollapseCard
        title="Pengaturan Teks"
        badge={deviceBadge}
        collapsible
        defaultOpen={false}
        copyTitle="Terapkan tipografi ke semua device"
        onCopy={() => {
          const color = getConfigForApply("color");
          const fontSize = getConfigForApply("fontSize");
          const fontWeight = getConfigForApply("fontWeight");
          const lineHeight = getConfigForApply("lineHeight");
          if (color !== undefined) applyToAllDevices("color", color as ConfigValue);
          if (fontSize !== undefined) applyToAllDevices("fontSize", fontSize as ConfigValue);
          if (fontWeight !== undefined) applyToAllDevices("fontWeight", fontWeight as ConfigValue);
          if (lineHeight !== undefined) applyToAllDevices("lineHeight", lineHeight as ConfigValue);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker
            label="Warna"
            configKey="color"
            globalDefault={globalMetaTone}
            labelClassName="!text-[10px] !text-[var(--fg-secondary)] !font-medium !normal-case !tracking-normal !mb-1"
            triggerClassName={heroColorTriggerClass}
            swatchClassName={heroColorSwatchClass}
            inputClassName={heroColorInputClass}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran (px)</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("fontSize")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("fontSize", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
            <select
              className={heroControlClass}
              value={getConfigString("fontWeight", "normal")}
              onChange={(e) => updateChildResponsiveConfig("fontWeight", e.target.value)}
            >
              <option value="100">Thin (100)</option>
              <option value="300">Light (300)</option>
              <option value="normal">Normal (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi Bold (600)</option>
              <option value="bold">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Baris</label>
            <input
              type="number"
              step="0.1"
              className={heroControlClass}
              value={getConfigString("lineHeight")}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                updateChildResponsiveConfig("lineHeight", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
        </div>
      </BlockConfigPanelCollapseCard>
    </>
  );
}

export function BlockConfigPanelPostFeaturedImageVisualSection({
  child,
  deviceLabel,
  heroControlClass,
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
}: BlockConfigPanelPostSurfaceTextVisualSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Tampilan Featured Image"
      badge={renderPostBuilderDeviceBadge(deviceLabel)}
      copyTitle="Terapkan pengaturan ini ke semua device"
      onCopy={() => {
          const keys = [
            "aspectRatio",
            "imageFit",
            "imagePosition",
            "imageBorderRadius",
            "imageMinHeight",
            "showImageCaption",
            "imageCaptionFontSize",
            "imageCaptionLineHeight",
            "imageCaptionFontWeight",
            "imageCaptionColor",
          ] as const;
          keys.forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
      }}
      className="post-builder-panel-card !mb-6"
    >

      {renderPostBuilderCollapseSection({
        title: "Rasio Gambar",
        children: (
          <>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Preset Rasio</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: "16/9", label: "16:9" },
              { key: "4/3", label: "4:3" },
              { key: "1/1", label: "1:1" },
              { key: "3/4", label: "3:4" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateChildResponsiveConfig("aspectRatio", item.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  getConfigString("aspectRatio", "16/9") === item.key
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Rasio Kustom</label>
          <input
            type="text"
            placeholder="16/9 atau 4:3"
            className={heroControlClass}
            value={getConfigString("aspectRatio", "16/9")}
            onChange={(e) => updateChildResponsiveConfig("aspectRatio", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Radius Gambar (px)</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("imageBorderRadius")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("imageBorderRadius", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Minimum (px)</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("imageMinHeight")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("imageMinHeight", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
        </div>
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Tampilan Gambar",
        children: (
          <>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Mode Isi Gambar</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "cover", label: "Cover" },
              { key: "contain", label: "Contain" },
              { key: "fill", label: "Fill" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateChildResponsiveConfig("imageFit", item.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  getConfigString("imageFit", "cover") === item.key
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Posisi Fokus</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "top", label: "Atas" },
              { key: "center", label: "Tengah" },
              { key: "bottom", label: "Bawah" },
              { key: "left", label: "Kiri" },
              { key: "right", label: "Kanan" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateChildResponsiveConfig("imagePosition", item.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  getConfigString("imagePosition", "center") === item.key
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Caption Gambar",
        children: (
          <>
        {renderPostBuilderToggleRow({
          label: "Tampilkan Caption Gambar",
          checked: getConfigBool("showImageCaption", false),
          onChange: (checked) => updateChildResponsiveConfig("showImageCaption", checked),
        })}
        {getConfigBool("showImageCaption", false) && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran (px)</label>
                <input
                  type="number"
                  className={heroControlClass}
                  value={getConfigString("imageCaptionFontSize", "12")}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateChildResponsiveConfig("imageCaptionFontSize", Number.isNaN(val) ? undefined : val);
                  }}
                />
              </div>
              <div>
                <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Baris</label>
                <input
                  type="number"
                  step="0.1"
                  className={heroControlClass}
                  value={getConfigString("imageCaptionLineHeight", "1.5")}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateChildResponsiveConfig("imageCaptionLineHeight", Number.isNaN(val) ? undefined : val);
                  }}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
              <select
                className={heroControlClass}
                value={getConfigString("imageCaptionFontWeight", "400")}
                onChange={(e) => updateChildResponsiveConfig("imageCaptionFontWeight", e.target.value)}
              >
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi Bold (600)</option>
                <option value="700">Bold (700)</option>
              </select>
            </div>
            <ColorPicker
              label="Warna Teks Caption"
              configKey="imageCaptionColor"
              globalDefault="#6B7280"
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
          </div>
        )}
          </>
        ),
      })}
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelPostCommentsVisualSection({
  child,
  deviceLabel,
  globalSurfaceTone,
  globalBorderTone,
  globalAccentTone,
  globalMetaTone,
  globalPostLinkTone,
  globalWidgetTitleColor,
  globalExcerptTone,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelPostCommentsVisualSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Komentar"
      badge={renderPostBuilderDeviceBadge(deviceLabel)}
      copyTitle="Terapkan tampilan Komentar ke semua device"
      onCopy={() => {
          const keys = [
            "commentAuthorColor",
            "commentMetaColor",
            "commentTextColor",
            "commentCardColor",
            "commentBorderColor",
            "inputBgColor",
            "inputBorderColor",
            "buttonBgColor",
            "buttonTextColor",
            "helperTextColor",
            "replyLinkColor",
          ] as const;

          keys.forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
      }}
      className="post-builder-panel-card !mb-6"
    >

      {renderPostBuilderCollapseSection({
        title: "Warna Teks",
        children: (
        <div className="grid grid-cols-2 gap-2">
          <ColorPicker
            label="Nama Komentator"
            configKey="commentAuthorColor"
            globalDefault={globalWidgetTitleColor}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Meta Komentar"
            configKey="commentMetaColor"
            globalDefault={globalMetaTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Isi Komentar"
            configKey="commentTextColor"
            globalDefault={globalExcerptTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Teks Bantu"
            configKey="helperTextColor"
            globalDefault={globalMetaTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Link Balas"
            configKey="replyLinkColor"
            globalDefault={globalPostLinkTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
        </div>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Warna Komentar",
        children: (
        <div className="grid grid-cols-2 gap-2">
          <ColorPicker
            label="Card Komentar"
            configKey="commentCardColor"
            globalDefault={globalSurfaceTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Garis Komentar"
            configKey="commentBorderColor"
            globalDefault={globalBorderTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
        </div>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Form Komentar",
        children: (
        <div className="grid grid-cols-2 gap-2">
          <ColorPicker
            label="Latar Input"
            configKey="inputBgColor"
            globalDefault={globalSurfaceTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Garis Input"
            configKey="inputBorderColor"
            globalDefault={globalBorderTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Latar Tombol"
            configKey="buttonBgColor"
            globalDefault={globalAccentTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Tombol Teks"
            configKey="buttonTextColor"
            globalDefault="#FFFFFF"
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
        </div>
        ),
      })}
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelPostCommentsBehaviorSection({
  deviceLabel,
  heroControlClass,
  getConfigBool,
  getConfigString,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
}: BlockConfigPanelPostCommentsBehaviorSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Komentar"
      badge={renderPostBuilderDeviceBadge(deviceLabel)}
      copyTitle="Terapkan pengaturan Komentar ke semua device"
      onCopy={() => {
          const keys = [
            "showCommentCount",
            "showCommentForm",
            "showCommentDate",
            "showWebsiteField",
            "allowReplies",
            "commentSort",
            "initialCommentsLimit",
            "loadMoreStep",
            "commentFormTitle",
            "submitButtonText",
            "loadMoreButtonText",
            "emptyCommentsText",
            "commentPlaceholder",
          ] as const;

          keys.forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
      }}
      className="post-builder-panel-card !mb-6"
    >

      {renderPostBuilderCollapseSection({
        title: "Elemen Komentar",
        children: (
        <div className="space-y-3">
          {([
            ["showCommentCount", "Tampilkan Jumlah Komentar", true],
            ["showCommentForm", "Tampilkan Form Komentar", true],
            ["showCommentDate", "Tampilkan Tanggal Komentar", true],
            ["showWebsiteField", "Tampilkan Field Website", true],
            ["allowReplies", "Aktifkan Balas Komentar", true],
          ] as Array<[string, string, boolean]>).map(([key, label, fallback]) => (
            <div key={key}>
              {renderPostBuilderToggleRow({
                label,
                checked: getConfigBool(key, fallback),
                onChange: (checked) => updateChildResponsiveConfig(key, checked),
              })}
            </div>
          ))}
        </div>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Daftar Komentar",
        children: (
          <>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Urutan Komentar</label>
          <select
            value={getConfigString("commentSort", "oldest")}
            onChange={(e) => updateChildResponsiveConfig("commentSort", e.target.value)}
            className={heroControlClass}
          >
            <option value="oldest">Terlama ke Terbaru</option>
            <option value="latest">Terbaru ke Terlama</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jumlah Awal</label>
            <input
              type="number"
              min={1}
              value={getConfigString("initialCommentsLimit", "3")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("initialCommentsLimit", Number.isNaN(val) ? undefined : val);
              }}
              className={heroControlClass}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Step Load More</label>
            <input
              type="number"
              min={1}
              value={getConfigString("loadMoreStep", "3")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("loadMoreStep", Number.isNaN(val) ? undefined : val);
              }}
              className={heroControlClass}
            />
          </div>
        </div>
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Form Komentar",
        children: (
          <>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Judul Form</label>
          <input
            type="text"
            value={getConfigString("commentFormTitle", "Tinggalkan Komentar")}
            onChange={(e) => updateChildResponsiveConfig("commentFormTitle", e.target.value)}
            className={heroControlClass}
          />
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Teks Tombol Submit</label>
          <input
            type="text"
            value={getConfigString("submitButtonText", "Kirim Komentar")}
            onChange={(e) => updateChildResponsiveConfig("submitButtonText", e.target.value)}
            className={heroControlClass}
          />
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Placeholder Komentar</label>
          <textarea
            rows={3}
            value={getConfigString("commentPlaceholder", "Tulis komentar Anda di sini...")}
            onChange={(e) => updateChildResponsiveConfig("commentPlaceholder", e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
          />
        </div>
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Teks Tambahan",
        children: (
          <>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Teks Tombol Load More</label>
          <input
            type="text"
            value={getConfigString("loadMoreButtonText", "Muat lebih banyak")}
            onChange={(e) => updateChildResponsiveConfig("loadMoreButtonText", e.target.value)}
            className={heroControlClass}
          />
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Pesan Saat Kosong</label>
          <textarea
            rows={3}
            value={getConfigString("emptyCommentsText", "Belum ada komentar. Jadilah yang pertama mengirim komentar.")}
            onChange={(e) => updateChildResponsiveConfig("emptyCommentsText", e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none text-[var(--fg-primary)] focus:border-[var(--accent)]"
          />
        </div>
          </>
        ),
      })}
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelPostRelatedPostsVisualSection({
  child,
  deviceLabel,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalSurfaceTone,
  globalBorderTone,
  globalAccentTone,
  globalMetaTone,
  globalNewsTitleColor,
  globalWidgetTitleColor,
  globalHoverColor,
  globalExcerptTone,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelPostRelatedPostsVisualSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Artikel Terkait"
      badge={renderPostBuilderDeviceBadge(deviceLabel)}
      copyTitle="Terapkan tampilan related post ke semua device"
      onCopy={() => {
          const keys = [
            "layout",
            "relatedDesign",
            "relatedColumns",
            "showTitle",
            "blockTitleFontSize",
            "blockTitleColor",
            "blockTitleBorderColor",
            "titleColor",
            "titleHoverColor",
            "titleFontSize",
            "titleLineHeight",
            "titleFontWeight",
            "relatedMetaColor",
            "relatedExcerptColor",
            "showRelatedThumbnail",
            "showRelatedMeta",
            "showRelatedExcerpt",
            "showRelatedCategory",
            "showRelatedDate",
            "excerptLength",
            "imageWidth",
            "imageHeight",
            "imageBorderRadius",
            "thumbnailRatio",
          ] as const;

          keys.forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
      }}
      className="post-builder-panel-card !mb-6"
    >

      {renderPostBuilderCollapseSection({
        title: "Desain Layout",
        onCopy: () => {
          const layout = getConfigForApply("layout");
          const relatedDesign = getConfigForApply("relatedDesign");
          const relatedColumns = getConfigForApply("relatedColumns");
          if (layout !== undefined) applyToAllDevices("layout", layout as ConfigValue);
          if (relatedDesign !== undefined) applyToAllDevices("relatedDesign", relatedDesign as ConfigValue);
          if (relatedColumns !== undefined) applyToAllDevices("relatedColumns", relatedColumns as ConfigValue);
        },
        children: (
          <>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Layout</label>
            <select
              className={heroControlClass}
              value={getConfigString("layout", "grid")}
              onChange={(e) => updateChildResponsiveConfig("layout", e.target.value)}
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tema Kartu</label>
            <select
              className={heroControlClass}
              value={getConfigString("relatedDesign", "card")}
              onChange={(e) => updateChildResponsiveConfig("relatedDesign", e.target.value)}
            >
              <option value="card">Card</option>
              <option value="soft">Soft</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </div>

        {getConfigString("layout", "grid") === "grid" && (
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jumlah Kolom</label>
            <select
              className={heroControlClass}
              value={getConfigString("relatedColumns", "3")}
              onChange={(e) => updateChildResponsiveConfig("relatedColumns", parseInt(e.target.value, 10))}
            >
              <option value={1}>1 Kolom</option>
              <option value={2}>2 Kolom</option>
              <option value={3}>3 Kolom</option>
              <option value={4}>4 Kolom</option>
            </select>
          </div>
        )}
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Heading Widget",
        onCopy: () => {
          const keys = [
            "showTitle",
            "blockTitleFontSize",
            "blockTitleColor",
            "blockTitleBorderColor",
          ] as const;

          keys.forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
        },
        children: (
          <>
            {renderPostBuilderToggleRow({
              label: "Tampilkan Heading",
              checked: getConfigBool("showTitle", true),
              onChange: (checked) => updateChildConfig("showTitle", checked),
            })}
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Teks Heading</label>
              <input
                type="text"
                className={heroControlClass}
                value={getConfigString("headingText", "")}
                onChange={(e) => updateChildConfig("headingText", e.target.value)}
                placeholder="Artikel Terkait"
              />
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
                    updateChildResponsiveConfig("blockTitleFontSize", Number.isNaN(val) ? undefined : val);
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
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Judul Artikel",
        onCopy: () => {
          const titleColor = getConfigForApply("titleColor");
          const titleHoverColor = getConfigForApply("titleHoverColor");
          const titleFontSize = getConfigForApply("titleFontSize");
          const titleLineHeight = getConfigForApply("titleLineHeight");
          const titleFontWeight = getConfigForApply("titleFontWeight");
          if (titleColor !== undefined) applyToAllDevices("titleColor", titleColor as ConfigValue);
          if (titleHoverColor !== undefined) applyToAllDevices("titleHoverColor", titleHoverColor as ConfigValue);
          if (titleFontSize !== undefined) applyToAllDevices("titleFontSize", titleFontSize as ConfigValue);
          if (titleLineHeight !== undefined) applyToAllDevices("titleLineHeight", titleLineHeight as ConfigValue);
          if (titleFontWeight !== undefined) applyToAllDevices("titleFontWeight", titleFontWeight as ConfigValue);
        },
        children: (
          <>
        <div className="grid grid-cols-2 gap-2">
          <ColorPicker
            label="Warna"
            configKey="titleColor"
            globalDefault={globalNewsTitleColor}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Sorot"
            configKey="titleHoverColor"
            globalDefault={globalHoverColor}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("titleFontSize")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("titleFontSize", Number.isNaN(val) ? undefined : val);
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
                updateChildResponsiveConfig("titleLineHeight", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
            <select
              className={heroControlClass}
              value={getConfigString("titleFontWeight", "700")}
              onChange={(e) => updateChildResponsiveConfig("titleFontWeight", e.target.value)}
            >
              <option value="400">Normal (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi Bold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
            </select>
          </div>
        </div>
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Elemen",
        onCopy: () => {
          const keys = [
            "showRelatedMeta",
            "showRelatedExcerpt",
            "showRelatedCategory",
            "showRelatedDate",
            "relatedMetaColor",
            "relatedExcerptColor",
            "excerptLength",
          ] as const;

          keys.forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
        },
        children: (
          <>
        <div className="grid grid-cols-2 gap-2">
          <ColorPicker
            label="Warna Meta"
            configKey="relatedMetaColor"
            globalDefault={globalMetaTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Warna Excerpt"
            configKey="relatedExcerptColor"
            globalDefault={globalExcerptTone}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Panjang Excerpt</label>
          <input
            type="number"
            min={0}
            className={heroControlClass}
            value={getConfigString("excerptLength", "90")}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              updateChildResponsiveConfig("excerptLength", Number.isNaN(val) ? undefined : val);
            }}
          />
        </div>
        {[
          ["showRelatedMeta", "Tampilkan Meta"],
          ["showRelatedExcerpt", "Excerpt"],
          ["showRelatedCategory", "Kategori"],
          ["showRelatedDate", "Tanggal"],
        ].map(([key, label]) => (
          <div key={key}>
            {renderPostBuilderToggleRow({
              label,
              checked: getConfigBool(key, true),
              onChange: (checked) => updateChildResponsiveConfig(key, checked),
            })}
          </div>
        ))}
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Thumbnail",
        onCopy: () => {
          const showRelatedThumbnail = getConfigForApply("showRelatedThumbnail");
          const imageWidth = getConfigForApply("imageWidth");
          const imageHeight = getConfigForApply("imageHeight");
          const imageBorderRadius = getConfigForApply("imageBorderRadius");
          const thumbnailRatio = getConfigForApply("thumbnailRatio");
          if (showRelatedThumbnail !== undefined) applyToAllDevices("showRelatedThumbnail", showRelatedThumbnail as ConfigValue);
          if (imageWidth !== undefined) applyToAllDevices("imageWidth", imageWidth as ConfigValue);
          if (imageHeight !== undefined) applyToAllDevices("imageHeight", imageHeight as ConfigValue);
          if (imageBorderRadius !== undefined) applyToAllDevices("imageBorderRadius", imageBorderRadius as ConfigValue);
          if (thumbnailRatio !== undefined) applyToAllDevices("thumbnailRatio", thumbnailRatio as ConfigValue);
        },
        children: (
          <>
        {renderPostBuilderToggleRow({
          label: "Tampilkan Thumbnail",
          checked: getConfigBool("showRelatedThumbnail", true),
          onChange: (checked) => updateChildResponsiveConfig("showRelatedThumbnail", checked),
        })}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Lebar Thumbnail</label>
            <input
              type="number"
              min={0}
              className={heroControlClass}
              value={(() => {
                const raw = getConfigString("imageWidth");
                const parsed = parseInt(raw, 10);
                return Number.isNaN(parsed) ? "" : String(parsed);
              })()}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("imageWidth", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Thumbnail</label>
            <input
              type="number"
              min={0}
              className={heroControlClass}
              value={(() => {
                const raw = getConfigString("imageHeight");
                const parsed = parseInt(raw, 10);
                return Number.isNaN(parsed) ? "" : String(parsed);
              })()}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("imageHeight", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Radius Thumbnail</label>
          <select
            className={heroControlClass}
            value={["global", "none", "sm", "md", "lg", "full"].includes(getConfigString("imageBorderRadius", "global")) ? getConfigString("imageBorderRadius", "global") : "custom"}
            onChange={(e) => {
              const value = e.target.value;
              updateChildResponsiveConfig("imageBorderRadius", value === "custom" ? "" : value);
            }}
          >
            <option value="global">Global</option>
            <option value="none">Kotak</option>
            <option value="sm">Kecil</option>
            <option value="md">Normal</option>
            <option value="lg">Besar</option>
            <option value="full">Bulat</option>
            <option value="custom">Kustom</option>
          </select>
        </div>
        {!["global", "none", "sm", "md", "lg", "full"].includes(getConfigString("imageBorderRadius", "global")) && (
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Radius Kustom</label>
            <input
              type="text"
              placeholder="12px, 0.75rem, 999px"
              className={heroControlClass}
              value={getConfigString("imageBorderRadius")}
              onChange={(e) => updateChildResponsiveConfig("imageBorderRadius", e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Rasio Thumbnail</label>
          <select
            className={heroControlClass}
            value={["16/10", "16/9", "4/3", "1/1"].includes(getConfigString("thumbnailRatio", "16/10")) ? getConfigString("thumbnailRatio", "16/10") : "custom"}
            onChange={(e) => {
              const value = e.target.value;
              updateChildResponsiveConfig("thumbnailRatio", value === "custom" ? "" : value);
            }}
          >
            <option value="16/10">16:10</option>
            <option value="16/9">16:9</option>
            <option value="4/3">4:3</option>
            <option value="1/1">1:1</option>
            <option value="custom">Kustom</option>
          </select>
        </div>
        {!["16/10", "16/9", "4/3", "1/1"].includes(getConfigString("thumbnailRatio", "16/10")) && (
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Rasio Kustom</label>
            <input
              type="text"
              placeholder="16/10 atau 4:3"
              className={heroControlClass}
              value={getConfigString("thumbnailRatio")}
              onChange={(e) => updateChildResponsiveConfig("thumbnailRatio", e.target.value)}
            />
          </div>
        )}
          </>
        ),
      })}
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelPostNavigationVisualSection({
  child,
  deviceLabel,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  globalBorderTone,
  globalNewsTitleColor,
  globalHoverColor,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelPostNavigationVisualSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Navigasi Post"
      badge={renderPostBuilderDeviceBadge(deviceLabel)}
      copyTitle="Terapkan pengaturan navigasi ke semua device"
      onCopy={() => {
          const keys = [
            "navigationDesign",
            "showNavLabel",
            "showNavThumbnail",
            "showNavArrow",
            "showNavBorder",
            "titleColor",
            "titleHoverColor",
            "titleFontSize",
            "titleLineHeight",
            "titleFontWeight",
            "navBorderColor",
            "navBorderWidth",
          ] as const;

          keys.forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
      }}
      className="post-builder-panel-card !mb-6"
    >

      {renderPostBuilderCollapseSection({
        title: "Desain Navigasi",
        children: (
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tema Navigasi</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "card", label: "Card" },
              { key: "soft", label: "Soft" },
              { key: "minimal", label: "Minimal" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => updateChildResponsiveConfig("navigationDesign", item.key)}
                className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                  getConfigString("navigationDesign", "card") === item.key
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Elemen Navigasi",
        children: (
          <>
        {[
          ["showNavLabel", "Tampilkan Label"],
          ["showNavThumbnail", "Tampilkan Thumbnail"],
          ["showNavArrow", "Tampilkan Tombol Arah"],
          ["showNavBorder", "Tampilkan Border Pembatas"],
        ].map(([key, label]) => (
          <div key={key}>
            {renderPostBuilderToggleRow({
              label,
              checked: getConfigBool(key, true),
              onChange: (checked) => updateChildResponsiveConfig(key, checked),
            })}
          </div>
        ))}
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Judul Artikel",
        onCopy: () => {
          const titleColor = getConfigForApply("titleColor");
          const titleHoverColor = getConfigForApply("titleHoverColor");
          const titleFontSize = getConfigForApply("titleFontSize");
          const titleLineHeight = getConfigForApply("titleLineHeight");
          const titleFontWeight = getConfigForApply("titleFontWeight");
          if (titleColor !== undefined) applyToAllDevices("titleColor", titleColor as ConfigValue);
          if (titleHoverColor !== undefined) applyToAllDevices("titleHoverColor", titleHoverColor as ConfigValue);
          if (titleFontSize !== undefined) applyToAllDevices("titleFontSize", titleFontSize as ConfigValue);
          if (titleLineHeight !== undefined) applyToAllDevices("titleLineHeight", titleLineHeight as ConfigValue);
          if (titleFontWeight !== undefined) applyToAllDevices("titleFontWeight", titleFontWeight as ConfigValue);
        },
        children: (
          <>
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker
            label="Warna Judul"
            configKey="titleColor"
            globalDefault={globalNewsTitleColor}
            labelClassName="!text-[10px] !text-[var(--fg-secondary)] !font-medium !normal-case !tracking-normal !mb-1"
            triggerClassName={heroColorTriggerClass}
            swatchClassName={heroColorSwatchClass}
            inputClassName={heroColorInputClass}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <ColorPicker
            label="Warna Sorot"
            configKey="titleHoverColor"
            globalDefault={globalHoverColor}
            labelClassName="!text-[10px] !text-[var(--fg-secondary)] !font-medium !normal-case !tracking-normal !mb-1"
            triggerClassName={heroColorTriggerClass}
            swatchClassName={heroColorSwatchClass}
            inputClassName={heroColorInputClass}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ukuran (px)</label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("titleFontSize")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("titleFontSize", Number.isNaN(val) ? undefined : val);
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
                updateChildResponsiveConfig("titleLineHeight", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
            <select
              className={heroControlClass}
              value={getConfigString("titleFontWeight", "700")}
              onChange={(e) => updateChildResponsiveConfig("titleFontWeight", e.target.value)}
            >
              <option value="400">Normal (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi Bold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
            </select>
          </div>
        </div>
          </>
        ),
      })}

      {renderPostBuilderCollapseSection({
        title: "Border Navigasi",
        onCopy: () => {
          const navBorderColor = getConfigForApply("navBorderColor");
          const navBorderWidth = getConfigForApply("navBorderWidth");
          if (navBorderColor !== undefined) applyToAllDevices("navBorderColor", navBorderColor as ConfigValue);
          if (navBorderWidth !== undefined) applyToAllDevices("navBorderWidth", navBorderWidth as ConfigValue);
        },
        children: (
        <div className={`grid grid-cols-2 gap-3 ${getConfigBool("showNavBorder", true) ? "" : "opacity-60"}`}>
          <ColorPicker
            label="Warna Garis"
            configKey="navBorderColor"
            globalDefault={globalBorderTone}
            labelClassName="!text-[10px] !text-[var(--fg-secondary)] !font-medium !normal-case !tracking-normal !mb-1"
            triggerClassName={heroColorTriggerClass}
            swatchClassName={heroColorSwatchClass}
            inputClassName={heroColorInputClass}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan Garis (px)</label>
            <input
              type="number"
              min={0}
              className={heroControlClass}
              value={getConfigString("navBorderWidth", "1")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("navBorderWidth", Number.isNaN(val) ? undefined : val);
              }}
              disabled={!getConfigBool("showNavBorder", true)}
            />
          </div>
        </div>
        ),
      })}
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelPostTypographyVisualSection({
  child,
  deviceLabel,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  isPostMetaWidget,
  isPostContentWidget,
  isPostTypographyWithLineHeight,
  postTypographyDefaultColor,
  postTypographySectionTitle,
  getConfigBool,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelPostTypographyVisualSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title={postTypographySectionTitle}
      badge={renderPostBuilderDeviceBadge(deviceLabel)}
      onCopy={() => {
            const color = getConfigForApply("color");
            const fontSize = getConfigForApply("fontSize");
            const fontWeight = getConfigForApply("fontWeight");
            const lineHeight = !isPostMetaWidget ? getConfigForApply("lineHeight") : undefined;
            const isItalic = child.type === "post_subtitle" ? getConfigForApply("isItalic") : undefined;

            if (color !== undefined) applyToAllDevices("color", color as ConfigValue);
            if (fontSize !== undefined) applyToAllDevices("fontSize", fontSize as ConfigValue);
            if (fontWeight !== undefined) applyToAllDevices("fontWeight", fontWeight as ConfigValue);
            if (lineHeight !== undefined) applyToAllDevices("lineHeight", lineHeight as ConfigValue);
            if (isItalic !== undefined) applyToAllDevices("isItalic", isItalic as ConfigValue);
      }}
      copyTitle={
        isPostMetaWidget
          ? "Terapkan tipografi Meta Artikel ke semua device"
          : isPostContentWidget
            ? "Terapkan pengaturan Konten Artikel ke semua device"
            : "Terapkan tipografi ke semua device"
      }
      className="post-builder-panel-card !mb-6"
    >

      {renderPostBuilderCollapseSection({
        title: "Pengaturan Teks",
        children: (
          <>
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker
            label={isPostContentWidget ? "Warna Teks" : "Warna"}
            configKey="color"
            globalDefault={postTypographyDefaultColor}
            labelClassName="!text-[10px] !text-[var(--fg-secondary)] !font-medium !normal-case !tracking-normal !mb-1"
            triggerClassName={heroColorTriggerClass}
            swatchClassName={heroColorSwatchClass}
            inputClassName={heroColorInputClass}
            child={child}
            getConfigValue={getConfigValue}
            updateChildResponsiveConfig={updateChildResponsiveConfig}
            updateChildConfig={updateChildConfig}
          />
          <div>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">
              {isPostContentWidget ? "Ukuran (px)" : "Ukuran (px)"}
            </label>
            <input
              type="number"
              className={heroControlClass}
              value={getConfigString("fontSize")}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                updateChildResponsiveConfig("fontSize", Number.isNaN(val) ? undefined : val);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={isPostTypographyWithLineHeight ? undefined : "col-span-2"}>
            <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan</label>
            <select
              className={heroControlClass}
              value={getConfigString("fontWeight", "normal")}
              onChange={(e) => updateChildResponsiveConfig("fontWeight", e.target.value)}
            >
              <option value="100">Thin (100)</option>
              <option value="300">Light (300)</option>
              <option value="normal">Normal (400)</option>
              <option value="500">Medium (500)</option>
              <option value="600">Semi Bold (600)</option>
              <option value="bold">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>
          {isPostTypographyWithLineHeight && (
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Tinggi Baris</label>
              <input
                type="number"
                step="0.1"
                className={heroControlClass}
                value={getConfigString("lineHeight")}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateChildResponsiveConfig("lineHeight", Number.isNaN(val) ? undefined : val);
                }}
              />
            </div>
          )}
        </div>
          </>
        ),
      })}

      {child.type === "post_subtitle" && (
        renderPostBuilderCollapseSection({
          title: "Gaya Tambahan",
          defaultOpen: false,
          children: renderPostBuilderToggleRow({
            label: "Teks Miring",
            checked: getConfigBool("isItalic", false),
            onChange: (checked) => updateChildResponsiveConfig("isItalic", checked),
          }),
        })
      )}
    </BlockConfigPanelCollapseCard>
  );
}

export function BlockConfigPanelPostContentBorderVisualSection({
  child,
  deviceLabel,
  heroControlClass,
  heroColorTriggerClass,
  heroColorSwatchClass,
  heroColorInputClass,
  isPostContentBorderEnabled,
  globalBorderTone,
  getConfigString,
  getConfigValue,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  updateChildConfig,
  ColorPicker,
}: BlockConfigPanelPostContentBorderVisualSectionProps) {
  return (
    <BlockConfigPanelCollapseCard
      title="Garis Konten Artikel"
      badge={renderPostBuilderDeviceBadge(deviceLabel)}
      copyTitle="Terapkan garis Konten Artikel ke semua device"
      onCopy={() => {
          const keys = [
            "showContentBorder",
            "boxBorderWidth",
            "boxBorderStyle",
            "boxBorderColor",
            "contentBorderPaddingTop",
            "contentBorderPaddingRight",
            "contentBorderPaddingBottom",
            "contentBorderPaddingLeft",
          ] as const;

          keys.forEach((key) => {
            const value = getConfigForApply(key);
            if (value !== undefined) applyToAllDevices(key, value as ConfigValue);
          });
      }}
      className="post-builder-panel-card !mb-6"
    >

      {renderPostBuilderCollapseSection({
        title: "Garis Konten",
        children: (
          <>
        {renderPostBuilderToggleRow({
          label: "Aktifkan Garis",
          checked: isPostContentBorderEnabled,
          onChange: (checked) => updateChildResponsiveConfig("showContentBorder", checked),
        })}

        {isPostContentBorderEnabled && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Ketebalan Garis (px)</label>
              <input
                type="number"
                min="0"
                className={heroControlClass}
                value={getConfigString("boxBorderWidth", "1")}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateChildResponsiveConfig("boxBorderWidth", Number.isNaN(val) ? undefined : Math.max(0, val));
                }}
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Gaya Garis</label>
              <select
                className={heroControlClass}
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
              label="Warna Garis"
              configKey="boxBorderColor"
              globalDefault={globalBorderTone}
              labelClassName="!text-[10px] !text-[var(--fg-secondary)] !font-medium !normal-case !tracking-normal !mb-1"
              triggerClassName={heroColorTriggerClass}
              swatchClassName={heroColorSwatchClass}
              inputClassName={heroColorInputClass}
              child={child}
              getConfigValue={getConfigValue}
              updateChildResponsiveConfig={updateChildResponsiveConfig}
              updateChildConfig={updateChildConfig}
            />
            <div className="col-span-2">
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Padding Garis (px)</label>
              <div className="grid grid-cols-4 gap-2">
                {["Top", "Right", "Bottom", "Left"].map((side) => (
                  <input
                    key={`content-border-padding-${side}`}
                    type="number"
                    placeholder={side}
                    className={`${heroControlClass} px-0 text-center`}
                    value={getConfigString(`contentBorderPadding${side}`)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      updateChildResponsiveConfig(`contentBorderPadding${side}`, Number.isNaN(val) ? undefined : Math.max(0, val));
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
          </>
        ),
      })}
    </BlockConfigPanelCollapseCard>
  );
}
