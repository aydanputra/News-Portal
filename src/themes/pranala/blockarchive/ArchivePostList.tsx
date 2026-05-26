import React from "react";
import NewsList from "../blocks/NewsList";

interface ArchivePostListProps {
  block: any;
  posts: any[];
  customTitle?: string;
  accentColor?: string;
  borderRadius?: string;
}

export default function ArchivePostList({ block, posts, customTitle, accentColor, borderRadius }: ArchivePostListProps) {
  const config = block?.config || {};
  const offset = Math.max(0, Number(config.offset) || 0);
  const normalizedPosts = (posts || []).slice(offset).map((post: any) => ({
    ...post,
    image: post?.image || post?.featuredImage?.fileUrl || post?.featuredImage?.url || undefined,
    authorName: typeof post?.author?.name === "string" ? post.author.name : post?.authorName,
  }));

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
      titleMarginBottom: config.titleMarginBottom ?? 6,
      tabletTitleMarginBottom: config.tabletTitleMarginBottom ?? config.titleMarginBottom ?? 6,
      mobileTitleMarginBottom: config.mobileTitleMarginBottom ?? config.titleMarginBottom ?? 6,
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
