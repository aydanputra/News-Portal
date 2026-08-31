import type { BlockConfigPanelPostBuilderExtraAdvancedProps } from "./BlockConfigPanelSharedTypes";

export function BlockConfigPanelPostBuilderExtraAdvancedSection({
  isPostBuilder,
  isPostContentWidget,
  canRenderSharedVisibilitySettings,
  postBuilderTabPanelClass,
  renderSharedVisibilitySettings,
  renderSharedBoxBackgroundSettings,
  renderSharedWidgetSpacingSettings,
}: BlockConfigPanelPostBuilderExtraAdvancedProps) {
  if (!isPostBuilder) return null;

  const backgroundOptions = isPostContentWidget
    ? {
        copyTitle: "Terapkan box Konten Artikel ke semua device",
        sectionTitle: "Box Konten Artikel",
        toggleLabel: "Aktifkan Box Artikel",
        colorLabel: "Warna Box",
        radiusLabel: "Border Radius Box",
        paddingLabel: "Padding Box Artikel",
      }
    : "Terapkan background widget Post Builder ke semua device";

  const spacingOptions = isPostContentWidget
    ? {
        copyTitle: "Terapkan spacing widget Konten Artikel ke semua device",
        sectionTitle: "Spacing Widget Artikel",
        marginLabel: "Margin Widget",
        paddingLabel: "Padding Widget",
      }
    : "Terapkan margin dan padding widget Post Builder ke semua device";

  return (
    <div className={postBuilderTabPanelClass}>
      {canRenderSharedVisibilitySettings && renderSharedVisibilitySettings()}
      {renderSharedBoxBackgroundSettings(backgroundOptions)}
      {renderSharedWidgetSpacingSettings(spacingOptions)}
    </div>
  );
}
