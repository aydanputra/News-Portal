import React from "react";
import NewsList from "../blocks/NewsList";

interface ArchivePostListProps {
  block: any;
  posts: any[];
  customTitle?: string;
  accentColor?: string;
  borderRadius?: string;
  setting?: any;
}

export default function ArchivePostList({ block, posts, customTitle, accentColor, borderRadius, setting }: ArchivePostListProps) {
  const config = block?.config || {};
  const offset = Math.max(0, Number(config.offset) || 0);
  const normalizedPosts = (posts || []).slice(offset).map((post: any) => ({
    ...post,
    image: post?.image || post?.featuredImage?.fileUrl || post?.featuredImage?.url || undefined,
    authorName: typeof post?.author?.name === "string" ? post.author.name : post?.authorName,
  }));

  // Nilai per-widget dari panel selalu diutamakan; setting global arsip hanya
  // dipakai sebagai fallback ketika widget belum diatur.
  const archiveNewsTitleSize = config.titleFontSize ?? setting?.globalNewsTitleFontSize ?? "var(--archive-news-title-size, var(--home-news-title-size, 1.125rem))";
  const archiveNewsTitleWeight = config.titleFontWeight ?? setting?.globalNewsTitleFontWeight ?? "var(--archive-news-title-weight, var(--home-news-title-weight, 600))";
  const archiveNewsTitleLineHeight = config.titleLineHeight ?? setting?.globalNewsTitleLineHeight ?? "var(--archive-news-title-line-height, var(--home-news-title-line-height, 1.35))";
  const archiveMetaWeight = config.metaFontWeight ?? setting?.globalMetaFontWeight ?? "var(--home-meta-weight, 500)";
  const archiveMetaLineHeight = config.metaLineHeight ?? setting?.globalMetaLineHeight ?? "var(--home-meta-line-height, 1.4)";
  const archiveExcerptWeight = config.excerptFontWeight ?? setting?.globalExcerptFontWeight ?? "var(--home-excerpt-weight, 400)";
  const archiveExcerptLineHeight = config.excerptLineHeight ?? setting?.globalContentLineHeight ?? "var(--home-excerpt-line-height, 1.6)";

  const adaptedBlock = {
    ...block,
    config: {
      ...config,
      showTitle: false,
      showImage: config.showImage ?? true,
      showCategory: config.showCategory ?? true,
      showMetaInfo: config.showMetaInfo ?? true,
      showAuthor: config.showAuthor ?? true,
      showDate: config.showDate ?? true,
      showDivider: config.showDivider ?? true,
      paginationStyle: "none",
      imageWidth: config.imageWidth ?? 100,
      tabletImageWidth: config.tabletImageWidth ?? config.imageWidth ?? 100,
      mobileImageWidth: config.mobileImageWidth ?? config.imageWidth ?? 90,
      imageHeight: config.imageHeight ?? 75,
      tabletImageHeight: config.tabletImageHeight ?? config.imageHeight ?? 75,
      mobileImageHeight: config.mobileImageHeight ?? config.imageHeight ?? 65,
      contentPaddingTop: config.contentPaddingTop ?? 0,
      contentPaddingRight: config.contentPaddingRight ?? 0,
      contentPaddingBottom: config.contentPaddingBottom ?? 0,
      contentPaddingLeft: config.contentPaddingLeft ?? 0,
      listContentAlign: config.listContentAlign ?? config.textAlign ?? "left",
      tabletListContentAlign: config.tabletListContentAlign ?? config.tabletTextAlign ?? config.listContentAlign ?? config.textAlign ?? "left",
      mobileListContentAlign: config.mobileListContentAlign ?? config.mobileTextAlign ?? config.listContentAlign ?? config.textAlign ?? "left",
      listRightImageOnly: true,
      titleMarginBottom: config.titleMarginBottom ?? 6,
      tabletTitleMarginBottom: config.tabletTitleMarginBottom ?? config.titleMarginBottom ?? 6,
      mobileTitleMarginBottom: config.mobileTitleMarginBottom ?? config.titleMarginBottom ?? 6,
      titleFontSize: archiveNewsTitleSize,
      tabletTitleFontSize: config.tabletTitleFontSize ?? archiveNewsTitleSize,
      mobileTitleFontSize: config.mobileTitleFontSize ?? archiveNewsTitleSize,
      titleFontWeight: archiveNewsTitleWeight,
      tabletTitleFontWeight: config.tabletTitleFontWeight ?? archiveNewsTitleWeight,
      mobileTitleFontWeight: config.mobileTitleFontWeight ?? archiveNewsTitleWeight,
      titleLineHeight: archiveNewsTitleLineHeight,
      tabletTitleLineHeight: config.tabletTitleLineHeight ?? archiveNewsTitleLineHeight,
      mobileTitleLineHeight: config.mobileTitleLineHeight ?? archiveNewsTitleLineHeight,
      metaFontWeight: archiveMetaWeight,
      tabletMetaFontWeight: config.tabletMetaFontWeight ?? archiveMetaWeight,
      mobileMetaFontWeight: config.mobileMetaFontWeight ?? archiveMetaWeight,
      metaLineHeight: archiveMetaLineHeight,
      tabletMetaLineHeight: config.tabletMetaLineHeight ?? archiveMetaLineHeight,
      mobileMetaLineHeight: config.mobileMetaLineHeight ?? archiveMetaLineHeight,
      excerptFontWeight: archiveExcerptWeight,
      tabletExcerptFontWeight: config.tabletExcerptFontWeight ?? archiveExcerptWeight,
      mobileExcerptFontWeight: config.mobileExcerptFontWeight ?? archiveExcerptWeight,
      excerptLineHeight: archiveExcerptLineHeight,
      tabletExcerptLineHeight: config.tabletExcerptLineHeight ?? archiveExcerptLineHeight,
      mobileExcerptLineHeight: config.mobileExcerptLineHeight ?? archiveExcerptLineHeight,
    }
  };

  return (
    <NewsList
      block={adaptedBlock}
      posts={normalizedPosts}
      customTitle={customTitle}
      accentColor={accentColor}
      borderRadius={borderRadius}
    />
  );
}
