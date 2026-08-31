type GalleryItemInput =
  | string
  | {
      id?: unknown;
      url?: unknown;
      caption?: unknown;
    };

type NormalizePostTypeMediaInput = {
  type: unknown;
  videoUrl?: unknown;
  gallery?: unknown;
};

export type NormalizedGalleryItem = {
  url: string;
  caption: string;
};

function normalizeMediaUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed.replace(/^\/+/, "")}`;
}

export function normalizeGalleryItems(gallery: unknown): NormalizedGalleryItem[] {
  if (!Array.isArray(gallery)) return [];

  const normalized = gallery
    .map((item): NormalizedGalleryItem | null => {
      if (typeof item === "string") {
        const url = item.trim();
        return url ? { url, caption: "" } : null;
      }

      if (!item || typeof item !== "object") return null;

      const entry = item as Exclude<GalleryItemInput, string>;
      const url = typeof entry.url === "string" ? entry.url.trim() : "";
      if (!url) return null;

      return {
        url,
        caption: typeof entry.caption === "string" ? entry.caption.trim() : "",
      };
    })
    .filter((item): item is NormalizedGalleryItem => Boolean(item));

  return normalized.filter(
    (item, index, array) => array.findIndex((entry) => entry.url === item.url) === index
  );
}

export function resolveInfographicHeaderImageUrl(post: unknown): string | undefined {
  if (!post || typeof post !== "object") return undefined;

  const entry = post as {
    featuredImage?: unknown;
    featured_image?: unknown;
    media?: unknown;
  };

  const featuredImage =
    entry.featuredImage && typeof entry.featuredImage === "object"
      ? (entry.featuredImage as { fileUrl?: unknown; url?: unknown })
      : undefined;
  const media =
    entry.media && typeof entry.media === "object"
      ? (entry.media as { fileUrl?: unknown; url?: unknown })
      : undefined;

  const candidates = [
    featuredImage?.fileUrl,
    featuredImage?.url,
    entry.featured_image,
    typeof entry.featuredImage === "string" ? entry.featuredImage : undefined,
    media?.fileUrl,
    media?.url,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeMediaUrl(candidate);
    if (normalized) return normalized;
  }

  return undefined;
}

export function normalizePostTypeMedia({
  type,
  videoUrl,
  gallery,
}: NormalizePostTypeMediaInput): {
  videoUrl: string | null;
  gallery: NormalizedGalleryItem[] | null;
} {
  const normalizedType = String(type || "").toUpperCase();
  const normalizedVideoUrl =
    normalizedType === "VIDEO" && typeof videoUrl === "string" && videoUrl.trim() !== ""
      ? videoUrl.trim()
      : null;
  const normalizedGallery =
    normalizedType === "GALLERY" ? normalizeGalleryItems(gallery) : null;

  return {
    videoUrl: normalizedVideoUrl,
    gallery: normalizedGallery,
  };
}
