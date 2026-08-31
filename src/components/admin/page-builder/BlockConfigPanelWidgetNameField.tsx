import type { BlockConfigPanelWidgetNameFieldProps } from "./BlockConfigPanelSharedTypes";

export function BlockConfigPanelWidgetNameField({
  child,
  isPostBuilder,
  showInPostBuilder = false,
  isReferenceStyleWidget,
  controlClassName,
  showTitle,
  onUpdateTitle,
}: BlockConfigPanelWidgetNameFieldProps) {
  if ((isPostBuilder && !showInPostBuilder) || child.type === "post_title" || child.type === "post_author_box") {
    return null;
  }

  const ignoreFrontendTitleVisibility =
    child.type === "archive_header" ||
    child.type === "archive_pagination" ||
    child.type === "archive_empty_state" ||
    child.type.startsWith("header_") ||
    child.type.startsWith("footer_");
  const shouldDimAdminTitle = !isReferenceStyleWidget && !ignoreFrontendTitleVisibility && !showTitle;

  return (
    <div className={`${isReferenceStyleWidget ? "bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border)] shadow-sm" : ""}`}>
      <label className="text-[10px] text-[var(--fg-secondary)] block mb-1 font-medium">Judul Widget</label>
      <input
        type="text"
        value={child.title}
        onChange={(e) => onUpdateTitle(e.target.value)}
        className={`${isReferenceStyleWidget ? `${controlClassName} font-semibold` : "w-full font-bold p-2 text-[var(--fg-primary)] bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg focus:border-[var(--accent)] focus:bg-[var(--bg-base)] focus:outline-none transition-all text-sm"} ${shouldDimAdminTitle ? "opacity-50" : ""}`}
      />
      {shouldDimAdminTitle && (
        <p className="text-[10px] text-[var(--fg-muted)] mt-1 italic">
          Judul ini hanya tampil di Admin.
        </p>
      )}
    </div>
  );
}
