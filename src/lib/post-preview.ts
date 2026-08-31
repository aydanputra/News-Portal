type PublicPostCategoryLike = {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
};

type PublicPostAuthorLike = {
  name?: unknown;
  fullName?: unknown;
  avatar?: unknown;
  avatarUrl?: unknown;
  image?: unknown;
  banner?: unknown;
};

type PublicPostLike = {
  excerpt?: unknown;
  content?: unknown;
  image?: unknown;
  category?: PublicPostCategoryLike | null | unknown;
  author?: PublicPostAuthorLike | null | unknown;
  featuredImage?: {
    fileUrl?: unknown;
  } | null;
  [key: string]: unknown;
};

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, num) => String.fromCharCode(Number.parseInt(num, 10)));
}

function stripHtml(input: string) {
  return decodeHtmlEntities(input)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|tr|td|th)>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getFirstImageFromHtml(input: string) {
  const match = input.match(/<img[^>]+src=["']([^"']+)["']/i);
  return typeof match?.[1] === "string" ? match[1].trim() : "";
}

function asNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : "";
}

export function toPublicPostPreview<T extends PublicPostLike>(post: T): T {
  const rawContent = asNonEmptyString(post.content);
  const rawExcerpt = asNonEmptyString(post.excerpt);
  const category =
    post.category && typeof post.category === "object"
      ? (post.category as PublicPostCategoryLike)
      : null;
  const author =
    post.author && typeof post.author === "object"
      ? (post.author as PublicPostAuthorLike)
      : null;
  const featuredImageUrl =
    post.featuredImage && typeof post.featuredImage === "object"
      ? asNonEmptyString(post.featuredImage.fileUrl)
      : "";

  const normalizedExcerpt = stripHtml(rawExcerpt || rawContent);
  const derivedImage = asNonEmptyString(post.image) || featuredImageUrl || getFirstImageFromHtml(rawContent);

  const nextPost = {
    ...post,
    excerpt: normalizedExcerpt || null,
    image: derivedImage || null,
    category: category
      ? {
          id: category.id,
          name: category.name,
          slug: category.slug,
        }
      : post.category,
    author: author
      ? {
          name: author.name,
          fullName: author.fullName,
          avatar: author.avatar,
          avatarUrl: author.avatarUrl,
          image: author.image,
          banner: author.banner,
        }
      : post.author,
    featuredImage:
      post.featuredImage && typeof post.featuredImage === "object"
        ? {
            fileUrl: post.featuredImage.fileUrl,
          }
        : post.featuredImage,
  } as T & { content?: unknown };

  if ("content" in nextPost) {
    delete nextPost.content;
  }
  if ("updatedAt" in nextPost) {
    delete nextPost.updatedAt;
  }
  if ("views" in nextPost) {
    delete nextPost.views;
  }
  if ("tags" in nextPost) {
    delete nextPost.tags;
  }

  return nextPost as T;
}

export function toPublicPostPreviewList<T extends PublicPostLike>(posts: T[] | null | undefined): T[] {
  if (!Array.isArray(posts) || posts.length === 0) return [];
  return posts.map((post) => toPublicPostPreview(post));
}
