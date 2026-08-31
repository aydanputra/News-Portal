import type { BlockConfigPanelSharedSourceFilterFieldsProps } from "./BlockConfigPanelSharedTypes";

export function BlockConfigPanelSharedSourceFilterFields({
  filterType,
  categories,
  tags,
  selectedCategoryIncludeSlugs,
  selectedCategoryExcludeSlugs,
  selectedTagIncludeSlugs,
  selectedTagExcludeSlugs,
  setSelectedCategoryIncludeSlugs,
  setSelectedCategoryExcludeSlugs,
  setSelectedTagIncludeSlugs,
  setSelectedTagExcludeSlugs,
  renderSlugSelectionList,
}: BlockConfigPanelSharedSourceFilterFieldsProps) {
  if (filterType === "tag") {
    return (
      <>
        {renderSlugSelectionList({
          label: "Tag",
          selectedSlugs: selectedTagIncludeSlugs,
          onChange: setSelectedTagIncludeSlugs,
          emptyStateLabel: "Semua",
          helperText: "Kosong = semua tag.",
          selectedLabel: "tag",
          emptyDataText: "Belum ada tag tersedia.",
          items: tags,
        })}
        {renderSlugSelectionList({
          label: "Exclude Tag",
          selectedSlugs: selectedTagExcludeSlugs,
          onChange: setSelectedTagExcludeSlugs,
          emptyStateLabel: "Reset",
          helperText: "Kosong = tidak ada tag yang dikecualikan.",
          selectedLabel: "tag",
          emptyDataText: "Belum ada tag tersedia.",
          items: tags,
        })}
        {renderSlugSelectionList({
          label: "Exclude Kategori",
          selectedSlugs: selectedCategoryExcludeSlugs,
          onChange: setSelectedCategoryExcludeSlugs,
          emptyStateLabel: "Reset",
          helperText: "Kosong = tidak ada kategori yang dikecualikan.",
          selectedLabel: "kategori",
          emptyDataText: "Belum ada kategori tersedia.",
          items: categories,
        })}
      </>
    );
  }

  return (
    <>
      {renderSlugSelectionList({
        label: "Kategori",
        selectedSlugs: selectedCategoryIncludeSlugs,
        onChange: setSelectedCategoryIncludeSlugs,
        emptyStateLabel: "Semua",
        helperText: "Kosong = semua kategori.",
        selectedLabel: "kategori",
        emptyDataText: "Belum ada kategori tersedia.",
        items: categories,
      })}
      {renderSlugSelectionList({
        label: "Exclude Kategori",
        selectedSlugs: selectedCategoryExcludeSlugs,
        onChange: setSelectedCategoryExcludeSlugs,
        emptyStateLabel: "Reset",
        helperText: "Kosong = tidak ada kategori yang dikecualikan.",
        selectedLabel: "kategori",
        emptyDataText: "Belum ada kategori tersedia.",
        items: categories,
      })}
    </>
  );
}
