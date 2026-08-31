import type { ReactNode } from "react";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

type BlockConfigPanelImageWidgetSectionProps = {
  TextField: (props: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
  }) => ReactNode;
  ToggleField: (props: {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
  }) => ReactNode;
  controlClassName: string;
  getConfigString: (key: string, fallback?: string) => string;
  getConfigBool: (key: string, fallback?: boolean) => boolean;
  updateChildConfig: (key: string, value: string | boolean) => void;
  openMediaLibraryForKey: (key: string) => void;
};

const normalizePreviewUrl = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
};

function CollapsibleSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] p-2.5">
      <summary className="cursor-pointer text-xs font-medium text-[var(--fg-primary)]">
        {title}
      </summary>
      <div className="mt-2.5 space-y-2.5">{children}</div>
    </details>
  );
}

export function BlockConfigPanelImageWidgetSection({
  TextField,
  ToggleField,
  controlClassName,
  getConfigString,
  getConfigBool,
  updateChildConfig,
  openMediaLibraryForKey,
}: BlockConfigPanelImageWidgetSectionProps) {
  const imageUrl = getConfigString("imageUrl", "");
  const previewUrl = normalizePreviewUrl(imageUrl);
  const hasImage = previewUrl !== "";

  return (
    <div className="space-y-4">
      <BlockConfigPanelCollapseCard title="Pengaturan Konten">
        <CollapsibleSection title="Sumber Gambar">
          <div className="space-y-2.5">
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
              {hasImage ? (
                <div
                  className="aspect-[16/9] w-full bg-contain bg-center bg-no-repeat"
                  style={{ backgroundImage: `url("${previewUrl}")` }}
                />
              ) : (
                <div className="aspect-[16/9] w-full" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openMediaLibraryForKey("imageUrl")}
                className="rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                Media Library
              </button>
              {hasImage && (
                <button
                  type="button"
                  onClick={() => updateChildConfig("imageUrl", "")}
                  className="rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2 text-xs font-semibold text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  Hapus
                </button>
              )}
            </div>
            {TextField({
              label: "URL",
              value: imageUrl,
              onChange: (value) => updateChildConfig("imageUrl", value),
              className: controlClassName,
              placeholder: "https://example.com/gambar.jpg atau /uploads/gambar.jpg",
            })}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Informasi Gambar">
          {TextField({
            label: "Alt",
            value: getConfigString("altText", ""),
            onChange: (value) => updateChildConfig("altText", value),
            className: controlClassName,
            placeholder: "Deskripsi gambar",
          })}
        </CollapsibleSection>

        <CollapsibleSection title="Tautan Gambar">
          <div className="space-y-2.5">
            {TextField({
              label: "Link",
              value: getConfigString("linkUrl", ""),
              onChange: (value) => updateChildConfig("linkUrl", value),
              className: controlClassName,
              placeholder: "https://example.com atau /halaman",
            })}
            {ToggleField({
              label: "Tab baru",
              checked: getConfigBool("openInNewTab", false),
              onChange: (value) => updateChildConfig("openInNewTab", value),
            })}
          </div>
        </CollapsibleSection>
      </BlockConfigPanelCollapseCard>
    </div>
  );
}
