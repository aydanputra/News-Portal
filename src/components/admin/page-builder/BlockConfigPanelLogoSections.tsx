import type { ReactNode } from "react";
import type { ConfigValue } from "@/lib/page-builder-config";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  className: string;
  containerClassName?: string;
};

type NumberFieldProps = {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  className: string;
  step?: string;
  containerClassName?: string;
};

type LogoSourceSectionProps = {
  controlClassName: string;
  getConfigString: (key: string, fallback?: string) => string;
  updateChildConfig: (key: string, value: ConfigValue) => void;
  openMediaLibraryForKey: (key: string) => void;
  emptyStateCopy?: string;
};

type LogoSettingsSectionProps = {
  controlClassName: string;
  getConfigString: (key: string, fallback?: string) => string;
  updateChildResponsiveConfig: (key: string, value: ConfigValue) => void;
};

const normalizePreviewUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
};

function TextField({ label, value, onChange, className, containerClassName }: TextFieldProps) {
  return (
    <div className={containerClassName}>
      <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">{label}</label>
      <input type="text" className={className} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function NumberField({ label, value, onChange, className, step, containerClassName }: NumberFieldProps) {
  return (
    <div className={containerClassName}>
      <label className="mb-1 block text-[10px] font-medium text-[var(--fg-secondary)]">{label}</label>
      <input type="number" step={step} className={className} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function LogoPreviewCard({
  label,
  previewUrl,
  darkMode = false,
}: {
  label: string;
  previewUrl: string;
  darkMode?: boolean;
}) {
  const hasPreview = previewUrl !== "";

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-medium text-[var(--fg-secondary)]">{label}</div>
      <div className={`overflow-hidden rounded-xl border border-[var(--border)] ${darkMode ? "bg-neutral-400" : "bg-[var(--bg-elevated)]"}`}>
        {hasPreview ? (
          <div
            className="aspect-[16/9] w-full bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${previewUrl}")` }}
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center text-[10px] text-[var(--fg-muted)]">
            Belum ada gambar
          </div>
        )}
      </div>
    </div>
  );
}

export function renderLogoSourceSection({
  controlClassName,
  getConfigString,
  updateChildConfig,
  openMediaLibraryForKey,
  emptyStateCopy = "Jika URL kosong, widget akan memakai logo situs global.",
}: LogoSourceSectionProps): ReactNode {
  const lightLogo = getConfigString("logoUrl", "");
  const darkLogo = getConfigString("logoUrlDark", "");
  const lightPreviewUrl = normalizePreviewUrl(lightLogo);
  const darkPreviewUrl = normalizePreviewUrl(darkLogo);

  return (
    <BlockConfigPanelCollapseCard title="Sumber Gambar">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <LogoPreviewCard label="Preview Terang" previewUrl={lightPreviewUrl} />
            <TextField
              label="Logo Terang"
              value={lightLogo}
              onChange={(value) => updateChildConfig("logoUrl", value)}
              className={controlClassName}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openMediaLibraryForKey("logoUrl")}
                className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                Media Library
              </button>
              {lightLogo && (
                <button
                  type="button"
                  onClick={() => updateChildConfig("logoUrl", "")}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs font-semibold text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <LogoPreviewCard label="Preview Gelap" previewUrl={darkPreviewUrl} darkMode />
            <TextField
              label="Logo Gelap"
              value={darkLogo}
              onChange={(value) => updateChildConfig("logoUrlDark", value)}
              className={controlClassName}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openMediaLibraryForKey("logoUrlDark")}
                className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs font-semibold text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]"
              >
                Media Gelap
              </button>
              {darkLogo && (
                <button
                  type="button"
                  onClick={() => updateChildConfig("logoUrlDark", "")}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs font-semibold text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-[var(--fg-muted)]">{emptyStateCopy}</p>
    </BlockConfigPanelCollapseCard>
  );
}

export function renderLogoSettingsSection({
  controlClassName,
  getConfigString,
  updateChildResponsiveConfig,
}: LogoSettingsSectionProps): ReactNode {
  return (
    <BlockConfigPanelCollapseCard title="Pengaturan Logo">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NumberField
          label="Tinggi"
          value={getConfigString("logoHeight", "")}
          onChange={(value) => updateChildResponsiveConfig("logoHeight", value === "" ? undefined : value)}
          className={controlClassName}
        />
        <NumberField
          label="Lebar Maks"
          value={getConfigString("logoMaxWidth", "")}
          onChange={(value) => updateChildResponsiveConfig("logoMaxWidth", value === "" ? undefined : value)}
          className={controlClassName}
        />
        <NumberField
          label="Ukuran Teks"
          value={getConfigString("logoTextSize", "")}
          onChange={(value) => updateChildResponsiveConfig("logoTextSize", value === "" ? undefined : value)}
          className={controlClassName}
          containerClassName="sm:col-span-2"
        />
      </div>
    </BlockConfigPanelCollapseCard>
  );
}
