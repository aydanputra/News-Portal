import { getYouTubeThumbnailUrl } from "@/lib/utils";

export const toPx = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return `${Number(value)}px`;
  return undefined;
};

export const toFontWeight = (value: unknown, fallback: string) => {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && value.trim() !== "") return value;
  return fallback;
};

export const parseAspectRatio = (value: unknown, fallback = "16 / 9") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (/^\d+\s*\/\s*\d+$/.test(trimmed)) return trimmed.replace(/\s*/g, " ").replace("/", " / ").trim();
  if (/^\d+\s*:\s*\d+$/.test(trimmed)) return trimmed.replace(/\s*/g, " ").replace(":", " / ").trim();
  return fallback;
};

export const getPostImageUrl = (item: any): string | undefined => {
  if (!item) return undefined;
  const candidates = [
    item.image,
    item.thumbnail,
    item.coverImage,
    item.featuredImage,
    item.featured_image,
    item.featuredImage?.fileUrl,
    item.featuredImage?.url,
    item.media?.url,
    item.media?.fileUrl
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() !== "") {
      const trimmed = candidate.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) return trimmed;
      return `/${trimmed.replace(/^\/+/, "")}`;
    }
  }
  if (item.type === "VIDEO" && typeof item.videoUrl === "string") {
    const thumbnail = getYouTubeThumbnailUrl(item.videoUrl, "hqdefault");
    if (thumbnail) return thumbnail;
  }
  return undefined;
};

export const getFirstImageFromContent = (html: unknown): string | undefined => {
  if (typeof html !== "string" || html.trim() === "") return undefined;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  const src = match?.[1]?.trim();
  if (!src) return undefined;
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src;
  return `/${src.replace(/^\/+/, "")}`;
};

export const getAuthorImageUrl = (author: any): string | undefined => {
  if (!author) return undefined;
  const candidates = [author.image, author.avatar, author.avatarUrl, author.photo, author.profileImage, author.imageUrl, author.banner];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() !== "") {
      const trimmed = candidate.trim();
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) return trimmed;
      return `/${trimmed.replace(/^\/+/, "")}`;
    }
  }
  return undefined;
};

export const toPxValue = (value: unknown): string | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return `${Number(value)}px`;
  return undefined;
};

export const normalizeImageUrl = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) return trimmed;
  return `/${trimmed.replace(/^\/+/, "")}`;
};

export const getAllImagesFromContent = (html: unknown): string[] => {
  if (typeof html !== "string" || html.trim() === "") return [];
  const matches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
  return matches.map((m) => normalizeImageUrl(m[1])).filter((src): src is string => Boolean(src));
};
