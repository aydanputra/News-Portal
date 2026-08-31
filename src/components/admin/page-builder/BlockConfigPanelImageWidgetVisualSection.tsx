import type { ReactNode } from "react";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

type SelectOption = {
  value: string;
  label: string;
};

type BlockConfigPanelImageWidgetVisualSectionProps = {
  TextField: (props: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
  }) => ReactNode;
  SelectField: (props: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    options: SelectOption[];
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
};

const OBJECT_FIT_OPTIONS: SelectOption[] = [
  { value: "contain", label: "Contain" },
  { value: "cover", label: "Cover" },
  { value: "fill", label: "Fill" },
];

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

export function BlockConfigPanelImageWidgetVisualSection({
  TextField,
  SelectField,
  ToggleField,
  controlClassName,
  getConfigString,
  getConfigBool,
  updateChildConfig,
}: BlockConfigPanelImageWidgetVisualSectionProps) {
  return (
    <div className="space-y-4">
      <BlockConfigPanelCollapseCard title="Pengaturan Gaya">
        <CollapsibleSection title="Ukuran & Bingkai">
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {TextField({
                label: "Lebar",
                value: getConfigString("imageWidth", ""),
                onChange: (value) => updateChildConfig("imageWidth", value),
                className: controlClassName,
              })}
              {TextField({
                label: "Tinggi",
                value: getConfigString("imageHeight", ""),
                onChange: (value) => updateChildConfig("imageHeight", value),
                className: controlClassName,
              })}
            </div>
            {SelectField({
              label: "Mode",
              value: getConfigString("objectFit", "contain"),
              onChange: (value) => updateChildConfig("objectFit", value),
              className: controlClassName,
              options: OBJECT_FIT_OPTIONS,
            })}
            {TextField({
              label: "Radius",
              value: getConfigString("borderRadius", ""),
              onChange: (value) => updateChildConfig("borderRadius", value),
              className: controlClassName,
              placeholder: "Mis. 16px",
            })}
            {ToggleField({
              label: "Bayangan",
              checked: getConfigBool("showShadow", false),
              onChange: (value) => updateChildConfig("showShadow", value),
            })}
          </div>
        </CollapsibleSection>
      </BlockConfigPanelCollapseCard>
    </div>
  );
}
