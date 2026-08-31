import type { BlockConfigPanelPostContentLayoutSectionProps } from "./BlockConfigPanelSharedTypes";

export function BlockConfigPanelPostContentLayoutSection({
  child,
  isPostWidget,
  renderSharedContentAlignmentSettings,
}: BlockConfigPanelPostContentLayoutSectionProps) {
  if (!isPostWidget) return null;

  switch (child.type) {
    case "post_breadcrumb":
      return renderSharedContentAlignmentSettings({
        copyTitle: "Terapkan tata letak Breadcrumb ke semua device",
        alignKey: "breadcrumbAlign",
      });
    case "post_title":
      return renderSharedContentAlignmentSettings({
        copyTitle: "Terapkan tata letak Judul Artikel ke semua device",
        textAlignLabel: "Perataan Judul",
      });
    case "post_content":
      return renderSharedContentAlignmentSettings({
        copyTitle: "Terapkan tata letak Konten Artikel ke semua device",
        textAlignLabel: "Perataan Teks Artikel",
      });
    case "post_author_box":
      return renderSharedContentAlignmentSettings({
        copyTitle: "Terapkan tata letak konten widget Post Builder ke semua device",
        alignKey: "authorAlign",
      });
    case "post_subtitle":
    case "post_meta":
    case "post_stats":
    case "post_featured_image":
    case "post_share":
    case "post_tags":
    case "post_navigation":
    case "post_comments":
    case "post_related_posts":
      return renderSharedContentAlignmentSettings(
        "Terapkan tata letak konten widget Post Builder ke semua device",
      );
    default:
      return null;
  }
}
