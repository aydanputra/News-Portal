import type {
  BlockConfigPanelSearchableMultiSelectRenderer,
  BlockConfigPanelSlugSelectionListOptions,
} from "./BlockConfigPanelSharedTypes";

type BlockConfigPanelSlugSelectionListProps =
  BlockConfigPanelSlugSelectionListOptions & {
    renderSearchableMultiSelect: BlockConfigPanelSearchableMultiSelectRenderer;
  };

export function BlockConfigPanelSlugSelectionList({
  label,
  selectedSlugs,
  onChange,
  emptyStateLabel: _emptyStateLabel,
  helperText,
  selectedLabel: _selectedLabel,
  emptyDataText,
  items,
  renderSearchableMultiSelect,
}: BlockConfigPanelSlugSelectionListProps) {
  return renderSearchableMultiSelect({
    label,
    selectedSlugs,
    onChange,
    emptyStateLabel: _emptyStateLabel,
    helperText,
    selectedLabel: _selectedLabel,
    emptyDataText,
    items,
  });
}
