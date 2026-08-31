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

  const archiveNewsTitleSize = setting?.globalNewsTitleFontSize ?? "var(--archive-news-title-size, var(--home-news-title-size, 1.125rem))";
  const archiveNewsTitleWeight = setting?.globalNewsTitleFontWeight ?? "var(--archive-news-title-weight, var(--home-news-title-weight, 600))";
  const archiveNewsTitleLineHeight = setting?.globalNewsTitleLineHeight ?? "var(--archive-news-title-line-height, var(--home-news-title-line-height, 1.35))";
  const archiveMetaWeight = setting?.globalMetaFontWeight ?? "var(--home-meta-weight, 500)";
  const archiveMetaLineHeight = setting?.globalMetaLineHeight ?? "var(--home-meta-line-height, 1.4)";
  const archiveExcerptWeight = setting?.globalExcerptFontWeight ?? "var(--home-excerpt-weight, 400)";
  const archiveExcerptLineHeight = setting?.globalContentLineHeight ?? "var(--home-excerpt-line-height, 1.6)";

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
      tabletTitleFontSize: archiveNewsTitleSize,
      mobileTitleFontSize: archiveNewsTitleSize,
      titleFontWeight: archiveNewsTitleWeight,
      tabletTitleFontWeight: archiveNewsTitleWeight,
      mobileTitleFontWeight: archiveNewsTitleWeight,
      titleLineHeight: archiveNewsTitleLineHeight,
      tabletTitleLineHeight: archiveNewsTitleLineHeight,
      mobileTitleLineHeight: archiveNewsTitleLineHeight,
      metaFontWeight: archiveMetaWeight,
      tabletMetaFontWeight: archiveMetaWeight,
      mobileMetaFontWeight: archiveMetaWeight,
      metaLineHeight: archiveMetaLineHeight,
      tabletMetaLineHeight: archiveMetaLineHeight,
      mobileMetaLineHeight: archiveMetaLineHeight,
      excerptFontWeight: archiveExcerptWeight,
      tabletExcerptFontWeight: archiveExcerptWeight,
      mobileExcerptFontWeight: archiveExcerptWeight,
      excerptLineHeight: archiveExcerptLineHeight,
      tabletExcerptLineHeight: archiveExcerptLineHeight,
      mobileExcerptLineHeight: archiveExcerptLineHeight,
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
