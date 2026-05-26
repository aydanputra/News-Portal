type ChildConfig = Record<string, unknown>;

const HOMEPAGE_NEWS_TYPES = new Set([
  "news_grid",
  "news_list",
  "news_slider",
  "news_list_highlight",
  "news_bullet_list",
  "news_headline_big",
  "news_hero_split_4",
  "news_hero_slider",
  "news_grid_slider"
]);

const HOMEPAGE_SECTION_CONFIG: ChildConfig = {
  layout: "100",
  containerWidth: "full",
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  children: []
};

const HOMEPAGE_NEWS_HEADLINE_BIG_CONFIG: ChildConfig = {
  imageHeight: 440,
  tabletImageHeight: 380,
  mobileImageHeight: 270,
  titleFontSize: 50,
  tabletTitleFontSize: 38,
  mobileTitleFontSize: 30,
  titleLineHeight: 1.12,
  tabletTitleLineHeight: 1.14,
  mobileTitleLineHeight: 1.16,
  titleFontWeight: "extrabold",
  tabletTitleFontWeight: "extrabold",
  mobileTitleFontWeight: "bold",
  titleMarginTop: 18,
  tabletTitleMarginTop: 16,
  mobileTitleMarginTop: 14,
  titleMarginBottom: 12,
  tabletTitleMarginBottom: 11,
  mobileTitleMarginBottom: 10,
  titleColor: "#e10600",
  titleHoverColor: "#b00000",
  metaFontSize: 14,
  tabletMetaFontSize: 13,
  mobileMetaFontSize: 12,
  metaMarginBottom: 16,
  tabletMetaMarginBottom: 14,
  mobileMetaMarginBottom: 12,
  excerptFontSize: 18,
  tabletExcerptFontSize: 17,
  mobileExcerptFontSize: 16,
  excerptLineHeight: 1.65,
  excerptMarginBottom: 20,
  tabletExcerptMarginBottom: 18,
  mobileExcerptMarginBottom: 16,
  categoryLabelColor: "#ffffff",
  categoryLabelBgColor: "var(--accent)",
  excerptLength: 220
};

const HOMEPAGE_NEWS_GRID_CONFIG: ChildConfig = {
  gridColumns: 3,
  tabletGridColumns: 2,
  mobileGridColumns: 1,
  gridGapX: 4,
  gridGapY: 4,
  imageHeight: 190,
  tabletImageHeight: 170,
  mobileImageHeight: 160,
  gridBoxBorderRadius: "default",
  showExcerpt: true,
  excerptLength: 90,
  titleFontSize: 18,
  tabletTitleFontSize: 17,
  mobileTitleFontSize: 16,
  titleLineHeight: 1.35,
  metaFontSize: 11,
  tabletMetaFontSize: 11,
  mobileMetaFontSize: 10,
  categoryLabelColor: "#ffffff",
  categoryLabelBgColor: "var(--accent)"
};

const HOMEPAGE_NEWS_BULLET_LIST_CONFIG: ChildConfig = {
  columnCount: 2,
  offset: 0,
  showTitle: false
};

const HOMEPAGE_HERO_SPLIT_4_CONFIG: ChildConfig = {
  limit: 5,
  offset: 0,
  miniCount: 4,
  miniColumns: 4,
  tabletMiniColumns: 2,
  mobileMiniColumns: 1,
  showMiniImage: true,
  showMetaInfo: true,
  showHeroMetaInfo: true,
  showMiniMetaInfo: true,
  showAuthor: true,
  showHeroAuthor: true,
  showMiniAuthor: true,
  showExcerpt: true,
  showHeroExcerpt: true,
  showMiniExcerpt: false,
  excerptLength: 120,
  heroExcerptLength: 120,
  heroExcerptFontSize: 14,
  heroExcerptLineHeight: 1.6,
  miniExcerptLength: 70,
  miniExcerptFontSize: 12,
  miniExcerptLineHeight: 1.5,
  showCategory: true,
  showHeroCategory: true,
  heroCategoryLabelFontSize: 10,
  showMiniCategory: true,
  miniCategoryLabelFontSize: 9,
  showDate: true,
  showHeroDate: true,
  showMiniDate: true,
  miniMetaFontSize: 11,
  miniTitleLineHeight: 1.3,
  miniTitleFontWeight: "bold",
  imageHeight: 360,
  tabletImageHeight: 300,
  mobileImageHeight: 240
};

const HOMEPAGE_HERO_SLIDER_CONFIG: ChildConfig = {
  limit: 5,
  offset: 0,
  autoplay: false,
  autoplayMs: 5000,
  loop: true,
  showArrows: true,
  showDots: true,
  pauseOnHover: true,
  swipeEnabled: true,
  showMetaInfo: true,
  showAuthor: true,
  slideTransitionMs: 500,
  overlayOpacity: 70,
  showMiniThumbnails: false,
  thumbnailVisibleCount: 4,
  thumbnailImageHeight: 72,
  showExcerpt: true,
  excerptLength: 120,
  imageHeight: 500,
  tabletImageHeight: 420,
  mobileImageHeight: 320
};

const HOMEPAGE_NEWS_GRID_SLIDER_CONFIG: ChildConfig = {
  limit: 8,
  offset: 0,
  itemsPerView: 3,
  tabletItemsPerView: 2,
  mobileItemsPerView: 1,
  slideStep: "page",
  autoplay: false,
  autoplayMs: 5000,
  loop: true,
  showArrows: true,
  showDots: true,
  pauseOnHover: true,
  swipeEnabled: true,
  showMetaInfo: true,
  showAuthor: true,
  slideTransitionMs: 500,
  showExcerpt: true,
  excerptLength: 90,
  gridBoxBorderRadius: "default"
};

const PAGE_SECTION_CONFIG: ChildConfig = {
  layout: "100",
  containerWidth: "full",
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0
};

const buildHomepageNewsConfig = (type: string, title: string): ChildConfig => {
  const base: ChildConfig = {
    categorySlug: "all",
    limit: type === "news_headline_big" ? 1 : 6,
    offset: 0,
    title,
    blockTitleFontSize: 24,
    tabletBlockTitleFontSize: 24,
    mobileBlockTitleFontSize: 20,
    metaFontSize: 12,
    tabletMetaFontSize: 11,
    mobileMetaFontSize: 10,
    categoryFontSize: 10,
    tabletCategoryFontSize: 10,
    mobileCategoryFontSize: 9,
    imageHeight: 150,
    tabletImageHeight: 150,
    mobileImageHeight: 150,
    gridBoxBorderRadius: 0,
    listImageWidth: 100,
    tabletListImageWidth: 100,
    mobileListImageWidth: 90,
    listImageHeight: 75,
    tabletListImageHeight: 75,
    mobileListImageHeight: 65,
    listImageBorderRadius: 8,
    useBox: false,
    showTitle: !["news_headline_big", "news_bullet_list", "news_hero_split_4", "news_hero_slider"].includes(type),
    showExcerpt: type === "news_headline_big",
    showReadMore: type === "news_headline_big",
    readMoreText: "READ MORE"
  };

  if (type === "news_headline_big") return { ...base, ...HOMEPAGE_NEWS_HEADLINE_BIG_CONFIG };
  if (type === "news_bullet_list") return { ...base, ...HOMEPAGE_NEWS_BULLET_LIST_CONFIG };
  if (type === "news_grid") return { ...base, ...HOMEPAGE_NEWS_GRID_CONFIG };
  if (type === "news_hero_split_4") return { ...base, ...HOMEPAGE_HERO_SPLIT_4_CONFIG };
  if (type === "news_hero_slider") return { ...base, ...HOMEPAGE_HERO_SLIDER_CONFIG };
  if (type === "news_grid_slider") return { ...base, ...HOMEPAGE_NEWS_GRID_SLIDER_CONFIG };
  return base;
};

export const buildHomepageChildConfig = (type: string, title: string, columnIndex: number): ChildConfig => {
  const config: ChildConfig = { columnIndex };

  if (type === "section") return { ...config, ...HOMEPAGE_SECTION_CONFIG };
  if (type === "ad_banner") return { ...config, selectedAdId: "", position: "", useBox: false, showTitle: false };
  if (HOMEPAGE_NEWS_TYPES.has(type)) return { ...config, ...buildHomepageNewsConfig(type, title) };
  if (type === "headline_2") {
    return {
      ...config,
      categorySlug: "all",
      limit: 1,
      title,
      useBox: false,
      boxBorderRadius: "xl",
      boxColor: "#ffffff",
      imageBorderRadius: "2xl",
      titleFontSize: 36,
      mobileTitleFontSize: 24,
      showExcerpt: true,
      mobileShowExcerpt: false,
      excerptLength: 150
    };
  }
  if (type === "sidebar_widget") return { ...config, widgetType: "popular_posts", limit: 5, title, useBox: false };
  if (type === "tag_cloud") return {
    ...config,
    limit: 10,
    title,
    useBox: false,
    tagFontSize: 12,
    tagBorderRadius: "default",
    tagGapX: 2,
    tagGapY: 2,
    tagPaddingX: 12,
    tagPaddingY: 4,
    tagTextColor: "#374151",
    tagBackgroundColor: "#F3F4F6",
    tagBorderColor: "#E5E7EB",
    tagHoverBackgroundColor: "#2563EB",
    tagHoverTextColor: "#FFFFFF",
    tagHoverBorderColor: "#2563EB"
  };

  return config;
};

export const buildPageChildConfig = (type: string, title: string, columnIndex: number): ChildConfig => {
  const config: ChildConfig = { columnIndex };

  if (type === "ad_banner") return { ...config, selectedAdId: "", position: "", useBox: false, showTitle: false };
  if (type === "news_grid" || type === "news_list" || type === "news_slider" || type === "news_list_highlight") {
    return { ...config, categorySlug: "all", limit: 6, title, useBox: false };
  }
  if (type === "headline_2") {
    return {
      ...config,
      categorySlug: "all",
      limit: 1,
      title,
      useBox: false,
      boxBorderRadius: "xl",
      boxColor: "#ffffff",
      imageBorderRadius: "2xl",
      titleFontSize: 36,
      mobileTitleFontSize: 24,
      showExcerpt: true,
      mobileShowExcerpt: false,
      excerptLength: 150
    };
  }
  if (type === "sidebar_widget") return { ...config, widgetType: "popular_posts", limit: 5, title, useBox: false };
  if (type === "tag_cloud") return {
    ...config,
    limit: 10,
    title,
    useBox: false,
    tagFontSize: 12,
    tagBorderRadius: "default",
    tagGapX: 2,
    tagGapY: 2,
    tagPaddingX: 12,
    tagPaddingY: 4,
    tagTextColor: "#374151",
    tagBackgroundColor: "#F3F4F6",
    tagBorderColor: "#E5E7EB",
    tagHoverBackgroundColor: "#2563EB",
    tagHoverTextColor: "#FFFFFF",
    tagHoverBorderColor: "#2563EB"
  };
  if (type === "section") return { ...config, ...PAGE_SECTION_CONFIG };
  if (type === "post_title") return { ...config, fontSize: 32, fontWeight: "bold", textAlign: "left", lineHeight: 1.15, useBox: false };
  if (type === "post_subtitle") return { ...config, fontSize: 18, fontWeight: "normal", textAlign: "left", lineHeight: 1.6, isItalic: false, useBox: false };
  if (type === "post_content") return { ...config, fontSize: 18, fontWeight: "normal", textAlign: "left", lineHeight: 1.7, useBox: false };
  if (type === "post_meta") return {
    ...config,
    showAuthor: true,
    showAuthorAvatar: true,
    showDate: true,
    showCategory: true,
    metaDesign: "minimal",
    textAlign: "left",
    fontSize: 14,
    fontWeight: "normal",
    lineHeight: 1.4,
    useBox: false
  };
  if (type === "post_breadcrumb") return {
    ...config,
    showPostTitle: true,
    showHomeIcon: false,
    breadcrumbAlign: "left",
    breadcrumbDesign: "minimal",
    separatorType: "slash",
    useBox: false
  };
  if (type === "post_featured_image") return {
    ...config,
    aspectRatio: "16/9",
    imageFit: "cover",
    imagePosition: "center",
    imageBorderRadius: 12,
    imageMinHeight: 320,
    showImageCaption: false,
    useBox: false
  };
  if (type === "post_share") return { ...config, showFacebook: true, showTwitter: true, showWhatsapp: true };
  if (type === "post_tags") return {
    ...config,
    useBox: false,
    showTagLabel: true,
    tagLabelText: "Tag Terkait :",
    tagLabelFontSize: 12,
    tagLabelFontWeight: "600",
    tagLabelColor: "#374151",
    tagDesign: "cloud",
    textAlign: "left",
    tagFontSize: 12,
    tagBorderRadius: "default",
    tagGapX: 8,
    tagGapY: 8,
    tagPaddingX: 12,
    tagPaddingY: 4,
    tagTextColor: "#374151",
    tagBackgroundColor: "#F3F4F6",
    tagBorderColor: "#E5E7EB",
    tagHoverBackgroundColor: "#2563EB",
    tagHoverTextColor: "#FFFFFF",
    tagHoverBorderColor: "#2563EB"
  };
  if (type === "post_navigation") return {
    ...config,
    navigationDesign: "card",
    showNavLabel: true,
    showNavThumbnail: true,
    showNavArrow: true,
    showNavBorder: true,
    textAlign: "left",
    titleColor: "#111827",
    titleHoverColor: "#f97316",
    titleFontSize: 18,
    titleLineHeight: 1.4,
    titleFontWeight: "700",
    navBorderColor: "#d1d5db",
    navBorderWidth: 1,
    useBox: false
  };
  if (type === "post_author_box") return {
    ...config,
    authorSource: "author",
    showAuthorLabel: true,
    authorLabelText: "Penulis",
    showAuthorAvatar: true,
    showAuthorBio: true,
    authorDesign: "minimal",
    authorAlign: "left",
    avatarSize: 56,
    avatarRadius: 999,
    labelColor: "#94a3b8",
    nameColor: "#111827",
    bioColor: "#6b7280",
    boxColor: "#ffffff",
    boxBorderRadius: "xl",
    useBox: false
  };
  if (type === "post_stats") return {
    ...config,
    showViews: true,
    showComments: true,
    useBox: false
  };
  if (type === "post_related_posts") return {
    ...config,
    filterType: "category",
    limit: 3,
    layout: "grid",
    relatedDesign: "card",
    relatedColumns: 3,
    showRelatedThumbnail: true,
    showRelatedMeta: true,
    showRelatedExcerpt: true,
    showRelatedCategory: true,
    showRelatedDate: true,
    titleColor: "#111827",
    titleHoverColor: "#2563EB",
    titleFontSize: 16,
    titleLineHeight: 1.45,
    titleFontWeight: "700",
    relatedMetaColor: "#6b7280",
    relatedExcerptColor: "#4b5563",
    relatedCardColor: "#FFFFFF",
    relatedBorderColor: "#D1D5DB",
    excerptLength: 90,
    thumbnailRatio: "16/10",
    useBox: false
  };
  if (type === "post_comments") return {
    ...config,
    provider: "internal",
    showCommentCount: true,
    showCommentForm: true,
    showCommentDate: true,
    showWebsiteField: true,
    allowReplies: true,
    commentSort: "oldest",
    initialCommentsLimit: 3,
    loadMoreStep: 3,
    commentFormTitle: "Tinggalkan Komentar",
    submitButtonText: "Kirim Komentar",
    loadMoreButtonText: "Muat lebih banyak",
    emptyCommentsText: "Belum ada komentar. Jadilah yang pertama mengirim komentar.",
    commentPlaceholder: "Tulis komentar Anda di sini..."
  };

  return config;
};

export const buildArchiveChildConfig = (type: string, title: string, columnIndex: number): ChildConfig => {
  const config: ChildConfig = { columnIndex };

  if (type === "section") return { ...config, ...PAGE_SECTION_CONFIG };
  if (type === "archive_header") {
    return {
      ...config,
      headerStyle: "minimal",
      showTitle: false,
      showDescription: true,
      showPostCount: true,
      textAlign: "left",
      titleFontSize: 36,
      descriptionFontSize: 16,
      metaFontSize: 13,
      useBox: false,
    };
  }
  if (type === "archive_post_grid") {
    return {
      ...config,
      title,
      limit: 12,
      columns: 3,
      showExcerpt: true,
      showMeta: true,
      excerptLength: 110,
      useBox: false,
    };
  }
  if (type === "news_grid") {
    return {
      ...config,
      title,
      limit: 12,
      tabletLimit: 8,
      mobileLimit: 6,
      offset: 0,
      gridColumns: 3,
      tabletGridColumns: 2,
      mobileGridColumns: 1,
      gridGapX: 6,
      gridGapY: 6,
      showTitle: true,
      showCategory: true,
      showMetaInfo: true,
      showAuthor: true,
      showDate: true,
      showExcerpt: true,
      excerptLength: 120,
      imageHeight: 220,
      tabletImageHeight: 200,
      mobileImageHeight: 200,
      useBox: false,
    };
  }
  if (type === "archive_post_list") {
    return {
      ...config,
      title,
      limit: 10,
      showCategory: true,
      showMetaInfo: true,
      showAuthor: true,
      showDate: true,
      showExcerpt: true,
      showDivider: true,
      excerptLength: 140,
      imageWidth: 100,
      tabletImageWidth: 100,
      mobileImageWidth: 90,
      imageHeight: 75,
      tabletImageHeight: 75,
      mobileImageHeight: 65,
      titleMarginBottom: 6,
      metaFontSize: 12,
      tabletMetaFontSize: 11,
      mobileMetaFontSize: 10,
      useBox: false,
    };
  }
  if (type === "news_hero_slider") {
    return {
      ...config,
      title,
      limit: 5,
      tabletLimit: 4,
      mobileLimit: 3,
      offset: 0,
      showTitle: true,
      autoplay: false,
      autoplayMs: 5000,
      loop: true,
      showArrows: true,
      showDots: true,
      pauseOnHover: true,
      swipeEnabled: true,
      showMetaInfo: true,
      showAuthor: true,
      showDate: true,
      showCategory: true,
      slideTransitionMs: 500,
      overlayOpacity: 70,
      showMiniThumbnails: false,
      thumbnailVisibleCount: 4,
      thumbnailImageHeight: 72,
      showExcerpt: true,
      excerptLength: 120,
      imageHeight: 500,
      tabletImageHeight: 420,
      mobileImageHeight: 320,
      useBox: false,
    };
  }
  if (type === "archive_pagination") {
    return {
      ...config,
      showTitle: false,
      showPrevNext: true,
      prevLabel: "Sebelumnya",
      nextLabel: "Berikutnya",
      maxVisiblePages: 5,
      useBox: false,
    };
  }
  if (type === "archive_empty_state") {
    return {
      ...config,
      showTitle: false,
      emptyTitle: "Belum ada artikel",
      emptyDescription: "Belum ada artikel yang cocok untuk arsip ini saat ini.",
      emptyButtonText: "",
      emptyButtonHref: "/",
      textAlign: "center",
      useBox: false,
    };
  }
  if (type === "sidebar_widget") return { ...config, widgetType: "popular_posts", limit: 5, title, useBox: false };
  if (type === "tag_cloud") {
    return {
      ...config,
      limit: 10,
      title,
      useBox: false,
      tagFontSize: 12,
      tagBorderRadius: "default",
      tagGapX: 2,
      tagGapY: 2,
      tagPaddingX: 12,
      tagPaddingY: 4,
      tagTextColor: "#374151",
      tagBackgroundColor: "#F3F4F6",
      tagBorderColor: "#E5E7EB",
      tagHoverBackgroundColor: "#2563EB",
      tagHoverTextColor: "#FFFFFF",
      tagHoverBorderColor: "#2563EB"
    };
  }
  if (type === "ad_banner") return { ...config, selectedAdId: "", position: "", useBox: false, showTitle: false };

  return config;
};
