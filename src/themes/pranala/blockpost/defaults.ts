type BuilderBlock = {
  id: string;
  type: string;
  title: string;
  order: number;
  isVisible: boolean;
  placement?: string;
  config?: Record<string, unknown>;
};

export const DEFAULT_PRANALA_POST_BLOCKS: BuilderBlock[] = [
  {
    id: "section_post_main_1",
    type: "section",
    title: "Post Header",
    order: 1,
    isVisible: true,
    placement: "main",
    config: {
      layout: "100",
      children: [
        { id: "post_breadcrumb_1", type: "post_breadcrumb", title: "Breadcrumb", order: 1, isVisible: true, config: { columnIndex: 0, showPostTitle: true, showHomeIcon: false, breadcrumbAlign: "left", breadcrumbDesign: "minimal", separatorType: "slash", useBox: false } },
        { id: "post_title_1", type: "post_title", title: "Judul Artikel", order: 2, isVisible: true, config: { columnIndex: 0, fontSize: 32, fontWeight: "bold", textAlign: "left", lineHeight: 1.15, useBox: false } },
        { id: "post_subtitle_1", type: "post_subtitle", title: "Subjudul", order: 3, isVisible: true, config: { columnIndex: 0, fontSize: 18, fontWeight: "normal", textAlign: "left", lineHeight: 1.6, isItalic: false, useBox: false } },
        { id: "post_meta_1", type: "post_meta", title: "Meta Artikel", order: 4, isVisible: true, config: { columnIndex: 0, showAuthor: true, showAuthorAvatar: true, showDate: true, showCategory: true, metaDesign: "minimal", textAlign: "left", fontSize: 14, fontWeight: "normal", lineHeight: 1.4, useBox: false } },
      ],
    },
  },
  {
    id: "section_post_main_2",
    type: "section",
    title: "Post Content",
    order: 2,
    isVisible: true,
    placement: "main",
    config: {
      layout: "66-33",
      children: [
        { id: "post_featured_image_1", type: "post_featured_image", title: "Featured Image", order: 1, isVisible: true, config: { columnIndex: 0, aspectRatio: "16/9", imageFit: "cover", imagePosition: "center", imageBorderRadius: 12, imageMinHeight: 320, showImageCaption: false, useBox: false } },
        { id: "post_content_1", type: "post_content", title: "Konten Artikel", order: 2, isVisible: true, config: { columnIndex: 0, fontSize: 18, fontWeight: "normal", textAlign: "left", lineHeight: 1.7, useBox: false } },
        { id: "post_tags_1", type: "post_tags", title: "Tag Artikel", order: 3, isVisible: true, config: { columnIndex: 0, useBox: false, showTagLabel: true, tagLabelText: "Tag Terkait :", tagLabelFontSize: 12, tagLabelFontWeight: "600", tagLabelColor: "#374151", tagDesign: "cloud", textAlign: "left", tagFontSize: 12, tagBorderRadius: "default", tagGapX: 8, tagGapY: 8, tagPaddingX: 12, tagPaddingY: 4, tagTextColor: "#374151", tagBackgroundColor: "#F3F4F6", tagBorderColor: "#E5E7EB", tagHoverBackgroundColor: "#2563EB", tagHoverTextColor: "#FFFFFF", tagHoverBorderColor: "#2563EB" } },
        { id: "post_share_1", type: "post_share", title: "Tombol Share", order: 4, isVisible: true, config: { columnIndex: 0, align: "left", showShareLabel: true, shareLabelText: "Bagikan :", shareLabelPosition: "inline", shareLabelFontSize: 14, shareLabelFontWeight: "600", shareLabelColor: "#111827", shareContentMode: "icon_text", iconOnlyShape: "square", shareShowContainerBorder: true, shareSize: "md", shareRadius: "global", shareGap: 8, showFacebook: true, showTwitter: true, showWhatsapp: true, showTelegram: false, showLinkedIn: false, showEmail: false, showCopyLink: true } },
        { id: "sidebar_widget_post_1", type: "sidebar_widget", title: "Popular Posts", order: 1, isVisible: true, config: { columnIndex: 1, widgetType: "popular_posts", limit: 5 } },
      ],
    },
  },
  {
    id: "section_post_main_3",
    type: "section",
    title: "Post Bottom",
    order: 3,
    isVisible: true,
    placement: "main",
    config: {
      layout: "100",
      children: [
        { id: "post_author_box_1", type: "post_author_box", title: "Author Box", order: 1, isVisible: true, config: { columnIndex: 0, showAuthorLabel: true, authorLabelText: "Penulis", showAuthorAvatar: true, showAuthorBio: true, authorDesign: "minimal", authorAlign: "left", avatarSize: 56, avatarRadius: 999, labelColor: "#94a3b8", nameColor: "#111827", bioColor: "#6b7280", boxColor: "#ffffff", boxBorderRadius: "xl", useBox: false } },
        { id: "post_navigation_1", type: "post_navigation", title: "Navigasi Post", order: 2, isVisible: true, config: { columnIndex: 0, navigationDesign: "card", showNavLabel: true, showNavThumbnail: true, showNavArrow: true, showNavBorder: true, textAlign: "left", titleColor: "#111827", titleHoverColor: "#f97316", titleFontSize: 18, titleLineHeight: 1.4, titleFontWeight: "700", navBorderColor: "#d1d5db", navBorderWidth: 1, useBox: false } },
        { id: "post_related_posts_1", type: "post_related_posts", title: "Berita Terkait", order: 3, isVisible: true, config: { columnIndex: 0, filterType: "category", limit: 3, layout: "grid", relatedDesign: "card", relatedColumns: 3, showRelatedThumbnail: true, showRelatedMeta: true, showRelatedExcerpt: true, showRelatedCategory: true, showRelatedDate: true, titleColor: "#111827", titleHoverColor: "#2563EB", titleFontSize: 16, titleLineHeight: 1.45, titleFontWeight: "700", relatedMetaColor: "#6b7280", relatedExcerptColor: "#4b5563", relatedCardColor: "#FFFFFF", relatedBorderColor: "#D1D5DB", excerptLength: 90, thumbnailRatio: "16/10", useBox: false } },
        { id: "post_comments_1", type: "post_comments", title: "Komentar", order: 4, isVisible: true, config: { columnIndex: 0, provider: "internal", showCommentCount: true, showCommentForm: true, showCommentDate: true, showWebsiteField: true, allowReplies: true, commentSort: "oldest", initialCommentsLimit: 3, loadMoreStep: 3, commentFormTitle: "Tinggalkan Komentar", submitButtonText: "Kirim Komentar", loadMoreButtonText: "Muat lebih banyak", emptyCommentsText: "Belum ada komentar. Jadilah yang pertama mengirim komentar.", commentPlaceholder: "Tulis komentar Anda di sini..." } },
      ],
    },
  },
];
