type BlockConfigPanelGenericWidgetSettingsProps = {
  supportsTitleToggle: boolean;
  canRenderResponsiveVisibilitySettings: boolean;
  getConfigBool: (key: string, fallback?: boolean) => boolean;
  updateChildConfig: (key: string, value: boolean) => void;
};

export function BlockConfigPanelGenericWidgetSettings({
  supportsTitleToggle,
  canRenderResponsiveVisibilitySettings,
  getConfigBool,
  updateChildConfig,
}: BlockConfigPanelGenericWidgetSettingsProps) {
  return (
    <div className="pt-4 border-t border-[var(--border)]">
      {supportsTitleToggle && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
          <label className="text-xs font-medium text-[var(--fg-primary)] block">Tampilkan Judul Widget</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={getConfigBool("showTitle", true)}
              onChange={(e) => updateChildConfig("showTitle", e.target.checked)}
            />
            <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
        </div>
      )}

      {canRenderResponsiveVisibilitySettings && (
        <div className="mb-5">
          <label className="text-xs font-bold text-[var(--fg-primary)] block mb-2">Responsivitas (Sembunyikan di:)</label>
          <div className="flex flex-col gap-2">
            {["Desktop", "Tablet", "Mobile"].map((device) => (
              <label key={device} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  checked={getConfigBool(`hideOn${device}`, false)}
                  onChange={(e) => updateChildConfig(`hideOn${device}`, e.target.checked)}
                />
                <span className="text-sm text-[var(--fg-primary)]">{device}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
