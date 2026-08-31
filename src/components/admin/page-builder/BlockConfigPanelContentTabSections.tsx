import { Copy } from "lucide-react";
import type { ReactNode } from "react";
import type {
  BlockConfigPanelCoreContentProps,
} from "./BlockConfigPanelSharedTypes";

type GenericNewsContentProps = Pick<
  BlockConfigPanelCoreContentProps,
  "getConfigString" | "updateChildConfig"
> & {
  effectiveChildType: string;
  renderSharedSourceFilterFields: () => ReactNode;
};

export function BlockConfigPanelGenericNewsContentSection({
  effectiveChildType,
  getConfigString,
  updateChildConfig,
  renderSharedSourceFilterFields,
}: GenericNewsContentProps) {
  return (
    <>
      <div>
        <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Kategori</label>
        <div className="flex p-1 bg-[var(--bg-base)] rounded-lg border border-[var(--border)] mb-3">
          <button
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("filterType", "category") === "category" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"}`}
            onClick={() => updateChildConfig("filterType", "category")}
          >
            Kategori
          </button>
          <button
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("filterType", "category") === "tag" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"}`}
            onClick={() => updateChildConfig("filterType", "tag")}
          >
            Tag
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {renderSharedSourceFilterFields()}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Urutan Berita</label>
        <select
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
          value={getConfigString("sortOrder", "latest")}
          onChange={(e) => updateChildConfig("sortOrder", e.target.value)}
        >
          <option value="latest">Terbaru (Latest)</option>
          <option value="oldest">Terlama (Oldest)</option>
          <option value="popular">Terpopuler (Popular)</option>
          <option value="random">Acak (Random)</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--fg-secondary)] block mb-1.5">Jml Berita</label>
        <select
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2.5 text-sm text-[var(--fg-primary)] focus:ring-2 focus:ring-[color:var(--accent)/0.2] focus:border-[var(--accent)] outline-none transition-all hover:bg-[var(--bg-base)]"
          value={getConfigString("limit", effectiveChildType === "news_headline_big" ? "1" : "6")}
          onChange={(e) => updateChildConfig("limit", parseInt(e.target.value, 10))}
          disabled={effectiveChildType === "news_headline_big"}
        >
          {effectiveChildType === "news_headline_big" ? (
            <option value={1}>1 (Fixed)</option>
          ) : (
            <>
              <option value={3}>3 Items</option>
              <option value={4}>4 Items</option>
              <option value={5}>5 Items</option>
              <option value={6}>6 Items</option>
              <option value={8}>8 Items</option>
              <option value={9}>9 Items</option>
              <option value={10}>10 Items</option>
              <option value={12}>12 Items</option>
              <option value={15}>15 Items</option>
              <option value={20}>20 Items</option>
            </>
          )}
        </select>
      </div>
    </>
  );
}

type RelatedPostsContentProps = Pick<
  BlockConfigPanelCoreContentProps,
  "deviceLabel" | "getConfigString" | "getConfigForApply" | "applyToAllDevices" | "updateChildResponsiveConfig"
>;

function renderPostBuilderContentCollapseSection(options: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const { title, children, defaultOpen = false } = options;

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
      </summary>
      <div className="mt-2.5 space-y-2.5">{children}</div>
    </details>
  );
}

export function BlockConfigPanelRelatedPostsContentSection({
  deviceLabel,
  getConfigString,
  getConfigForApply,
  applyToAllDevices,
  updateChildResponsiveConfig,
}: RelatedPostsContentProps) {
  return (
    <details className="post-builder-panel-card bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm mb-6">
      <summary className="flex cursor-pointer list-none items-center justify-between border-b border-[var(--border)] pb-2 text-sm font-bold text-[var(--fg-primary)]">
        <span className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[var(--accent)] rounded-full"></div>
          Artikel Terkait
          <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-subtle)] border border-[var(--border)] px-2 py-0.5 rounded-md">
            {deviceLabel}
          </span>
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const filterType = getConfigForApply("filterType");
            const limit = getConfigForApply("limit");
            if (filterType !== undefined) applyToAllDevices("filterType", filterType);
            if (limit !== undefined) applyToAllDevices("limit", limit);
          }}
          className="text-[10px] text-[var(--accent)] hover:text-[var(--accent)] flex items-center gap-1 bg-[var(--accent-subtle)] px-2 py-1 rounded border border-[var(--border)] transition-colors"
          title="Terapkan pengaturan artikel terkait ke semua device"
        >
          <Copy size={10} /> Semua
        </button>
      </summary>

      <div className="mt-3 space-y-3">
        {renderPostBuilderContentCollapseSection({
          title: "Sumber Konten",
          children: (
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Filter Berdasarkan</label>
              <div className="flex p-1 bg-[var(--bg-base)] rounded-lg border border-[var(--border)]">
                <button
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("filterType", "category") === "category" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"}`}
                  onClick={() => updateChildResponsiveConfig("filterType", "category")}
                >
                  Kategori
                </button>
                <button
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${getConfigString("filterType", "category") === "tag" ? "bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm border border-[var(--border)]" : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]"}`}
                  onClick={() => updateChildResponsiveConfig("filterType", "tag")}
                >
                  Tag
                </button>
              </div>
            </div>
          ),
        })}

        {renderPostBuilderContentCollapseSection({
          title: "Jumlah Artikel",
          children: (
            <div>
              <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Jumlah Artikel</label>
              <select
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-2 text-xs outline-none h-9 text-[var(--fg-primary)] focus:border-[var(--accent)]"
                value={getConfigString("limit", "3")}
                onChange={(e) => updateChildResponsiveConfig("limit", parseInt(e.target.value, 10))}
              >
                <option value={2}>2 Artikel</option>
                <option value={3}>3 Artikel</option>
                <option value={4}>4 Artikel</option>
                <option value={6}>6 Artikel</option>
                <option value={8}>8 Artikel</option>
                <option value={9}>9 Artikel</option>
                <option value={12}>12 Artikel</option>
              </select>
            </div>
          ),
        })}
      </div>
    </details>
  );
}
