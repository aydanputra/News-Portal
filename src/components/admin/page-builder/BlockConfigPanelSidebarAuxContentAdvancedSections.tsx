import { Copy } from "lucide-react";
import type { ConfigValue } from "@/lib/page-builder-config";
import type {
  BlockConfigPanelAdOption,
  BlockConfigPanelCoreContentProps,
  BlockConfigPanelSharedAdvancedProps,
} from "./BlockConfigPanelSharedTypes";
import { BlockConfigPanelCollapseCard } from "./BlockConfigPanelCollapseCard";

type SidebarWidgetContentProps = Pick<
  BlockConfigPanelCoreContentProps,
  "deviceLabel" | "controlClassName" | "getConfigString" | "updateChildConfig" | "updateChildResponsiveConfig"
> & {
  currentSidebarWidgetType: string;
  isSidebarAdSlotType: boolean;
  onSidebarWidgetTypeChange: (nextWidgetType: string) => void;
  sectionTitle?: string;
};

export function BlockConfigPanelSidebarWidgetContentSection({
  deviceLabel,
  controlClassName,
  currentSidebarWidgetType,
  isSidebarAdSlotType,
  getConfigString,
  updateChildConfig,
  updateChildResponsiveConfig,
  onSidebarWidgetTypeChange,
  sectionTitle = "Sidebar Widget",
}: SidebarWidgetContentProps) {
  return (
    <BlockConfigPanelCollapseCard
      title={sectionTitle}
      className="post-builder-panel-card mb-6"
      badge={
        <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
          {deviceLabel}
        </span>
      }
    >
      <div>
        <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Tipe Widget - {deviceLabel}</label>
        <select
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
          value={getConfigString("widgetType", "popular_posts")}
          onChange={(e) => onSidebarWidgetTypeChange(e.target.value)}
        >
          <option value="popular_posts">Berita Populer</option>
          <option value="recent_posts">Berita Terbaru</option>
          <option value="category_list">Daftar Kategori</option>
          <option value="ad_slot">Iklan / Ad Slot</option>
        </select>
      </div>

      {!isSidebarAdSlotType && (
        <div>
          <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">
            {currentSidebarWidgetType === "category_list" ? `Jumlah Kategori - ${deviceLabel}` : `Jumlah Item - ${deviceLabel}`}
          </label>
          <select
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
            value={getConfigString("limit", "5")}
            onChange={(e) => updateChildResponsiveConfig("limit", parseInt(e.target.value, 10))}
          >
            <option value={3}>3 Item</option>
            <option value={5}>5 Item</option>
            <option value={7}>7 Item</option>
            <option value={10}>10 Item</option>
          </select>
        </div>
      )}

      {currentSidebarWidgetType === "popular_posts" && (
        <div>
          <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">
            Rentang Tanggal Populer - {deviceLabel}
          </label>
          <select
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
            value={getConfigString("popularDateRange", "all")}
            onChange={(e) => updateChildConfig("popularDateRange", e.target.value)}
          >
            <option value="week">Seminggu Terakhir</option>
            <option value="month">Sebulan Terakhir</option>
            <option value="year">Setahun Terakhir</option>
            <option value="all">Sepanjang Waktu</option>
          </select>
        </div>
      )}

      {isSidebarAdSlotType && (
        <div>
          <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Kode Iklan / HTML</label>
          <textarea
            rows={6}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
            value={getConfigString("adCode")}
            onChange={(e) => updateChildConfig("adCode", e.target.value)}
            placeholder="<div>Script iklan atau HTML custom</div>"
          />
        </div>
      )}
    </BlockConfigPanelCollapseCard>
  );
}

type TagCloudContentProps = Pick<
  BlockConfigPanelCoreContentProps,
  "deviceLabel" | "controlClassName" | "getConfigString" | "getConfigForApply" | "applyToAllDevices" | "updateChildResponsiveConfig"
> & {
  sectionTitle?: string;
  applyAllTitle?: string;
};

export function BlockConfigPanelTagCloudContentSection({
  deviceLabel,
  controlClassName,
  getConfigString,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
  sectionTitle = "Pengaturan Tag Cloud",
  applyAllTitle = "Terapkan jumlah tag ke semua device",
}: TagCloudContentProps) {
  return (
    <BlockConfigPanelCollapseCard
      title={sectionTitle}
      className="post-builder-panel-card"
      badge={
        <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
          {deviceLabel}
        </span>
      }
      onCopy={() => {
        const limit = getConfigForApply("limit");
        if (limit !== undefined) applyToAllDevices("limit", limit as ConfigValue);
      }}
      copyTitle={applyAllTitle}
    >
      <div>
        <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jumlah Tag</label>
        <select
          className={controlClassName}
          value={getConfigString("limit", "10")}
          onChange={(e) => updateChildResponsiveConfig("limit", parseInt(e.target.value, 10))}
        >
          <option value={5}>5 Tag</option>
          <option value={8}>8 Tag</option>
          <option value={10}>10 Tag</option>
          <option value={15}>15 Tag</option>
          <option value={20}>20 Tag</option>
        </select>
      </div>
    </BlockConfigPanelCollapseCard>
  );
}

type AdBannerContentProps = Pick<
  BlockConfigPanelCoreContentProps,
  "controlClassName" | "getConfigString"
> & {
  availableAds: BlockConfigPanelAdOption[];
  loadingAds: boolean;
  hideWhenEmpty: boolean;
  onSelectAd: (selectedId: string) => void;
  onToggleHideWhenEmpty: (nextValue: boolean) => void;
  sourceSectionTitle?: string;
  emptyStateSectionTitle?: string;
};

export function BlockConfigPanelAdBannerContentSection({
  controlClassName,
  getConfigString,
  availableAds,
  loadingAds,
  hideWhenEmpty,
  onSelectAd,
  onToggleHideWhenEmpty,
  sourceSectionTitle = "Sumber Iklan",
  emptyStateSectionTitle = "Perilaku Kosong",
}: AdBannerContentProps) {
  return (
    <>
      <BlockConfigPanelCollapseCard title={sourceSectionTitle}>
        <div>
          <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Pilih Iklan</label>
          <select
            value={getConfigString("selectedAdId", "")}
            onChange={(e) => onSelectAd(e.target.value)}
            className={controlClassName}
          >
            <option value="">{loadingAds ? "Memuat daftar iklan..." : "Pilih iklan dari daftar"}</option>
            {availableAds.map((ad) => (
              <option key={ad.id} value={ad.id}>
                {ad.name}
                {ad.position ? ` - ${ad.position}` : ""}
                {ad.isActive === false ? " (Nonaktif)" : ""}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-[var(--fg-muted)] mt-1">
            Daftar ini mengambil iklan yang sudah kamu buat di menu Manajemen Iklan.
          </p>
        </div>
      </BlockConfigPanelCollapseCard>

      <BlockConfigPanelCollapseCard title={emptyStateSectionTitle}>
        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2">
          <div>
            <label className="text-[11px] font-medium text-[var(--fg-primary)] block">Sembunyikan Bila Kosong</label>
            <p className="text-[10px] text-[var(--fg-muted)] mt-0.5">Jika tidak ada iklan, widget tidak ditampilkan di frontend.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={hideWhenEmpty}
              onChange={(e) => onToggleHideWhenEmpty(e.target.checked)}
            />
            <div className="w-9 h-5 bg-[var(--bg-base)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[color:var(--accent)/0.2] rounded-full peer border border-[var(--border)] peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
        </div>
      </BlockConfigPanelCollapseCard>
    </>
  );
}

type BasicAdvancedSectionProps = BlockConfigPanelSharedAdvancedProps & {
  backgroundCopyTitle: string;
  spacingCopyTitle: string;
};

export function BlockConfigPanelBasicAdvancedSection({
  backgroundCopyTitle,
  spacingCopyTitle,
  renderSharedVisibilitySettings,
  renderSharedBoxBackgroundSettings,
  renderSharedWidgetSpacingSettings,
}: BasicAdvancedSectionProps) {
  return (
    <div className="space-y-4">
      {renderSharedVisibilitySettings()}
      {renderSharedBoxBackgroundSettings(backgroundCopyTitle)}
      {renderSharedWidgetSpacingSettings(spacingCopyTitle)}
    </div>
  );
}
