import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Ganti spasi dengan -
    .replace(/[^\w\-]+/g, "") // Hapus karakter aneh
    .replace(/\-\-+/g, "-"); // Hapus - ganda
}

export function getYouTubeVideoId(url: string): string | null {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  const videoId = match && match[2] && match[2].length === 11 ? match[2] : null;
  return videoId;
}

export function getYouTubeThumbnailUrl(url: string, quality: "hqdefault" | "mqdefault" | "sddefault" | "maxresdefault" = "hqdefault"): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = getYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getSafePostImage(post: any) {
  if (!post) return null;

  // 1. Prioritize Scalar Image (Thumbnail/Override)
  // This is critical for Infographics where 'image' is the square thumbnail
  // and 'featuredImage' is the tall vertical infographic.
  if (post.image) {
      // Handle YouTube maxresdefault.jpg (often 404) -> Fallback to hqdefault.jpg
      if (post.image.includes('maxresdefault.jpg')) {
          return post.image.replace('maxresdefault.jpg', 'hqdefault.jpg');
      }
      return post.image;
  }

  // 2. Fallback to Relation (Main Media)
  if (post.featuredImage && post.featuredImage.fileUrl) {
      return post.featuredImage.fileUrl;
  }

  // 3. If no image but Video Type -> Auto-fetch thumbnail from videoUrl
  if (post.type === "VIDEO" && post.videoUrl) {
      const thumbnail = getYouTubeThumbnailUrl(post.videoUrl, "hqdefault");
      if (thumbnail) return thumbnail;
  }

  return null;
}
