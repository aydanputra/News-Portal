export type WatermarkPosition = "top" | "bottom" | "left" | "right" | "center";

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function getPostImageWatermarkConfig(setting: any) {
  const imageUrl = typeof setting?.postImageWatermarkUrl === "string" ? setting.postImageWatermarkUrl.trim() : "";
  if (!imageUrl) return null;

  const rawPosition = typeof setting?.postImageWatermarkPosition === "string" ? setting.postImageWatermarkPosition.trim().toLowerCase() : "center";
  const position: WatermarkPosition =
    rawPosition === "top" || rawPosition === "bottom" || rawPosition === "left" || rawPosition === "right"
      ? rawPosition
      : "center";

  return {
    imageUrl,
    opacity: clamp(setting?.postImageWatermarkOpacity, 0, 100, 35),
    size: clamp(setting?.postImageWatermarkSize, 5, 80, 24),
    position,
    paddingTop: clamp(setting?.postImageWatermarkPaddingTop, 0, 240, 24),
    paddingRight: clamp(setting?.postImageWatermarkPaddingRight, 0, 240, 24),
    paddingBottom: clamp(setting?.postImageWatermarkPaddingBottom, 0, 240, 24),
    paddingLeft: clamp(setting?.postImageWatermarkPaddingLeft, 0, 240, 24),
  };
}

export function buildPostWatermarkedImageUrl(imageUrl: string | undefined, setting: any, enabled: boolean): string | undefined {
  const src = typeof imageUrl === "string" ? imageUrl.trim() : "";
  if (!enabled || !src) return imageUrl;
  if (src.startsWith("/api/watermark-image?")) return src;

  const watermark = getPostImageWatermarkConfig(setting);
  if (!watermark) return imageUrl;

  const params = new URLSearchParams({
    src,
    wm: watermark.imageUrl,
    op: String(watermark.opacity),
    sz: String(watermark.size),
    pos: watermark.position,
    pt: String(watermark.paddingTop),
    pr: String(watermark.paddingRight),
    pb: String(watermark.paddingBottom),
    pl: String(watermark.paddingLeft),
  });

  return `/api/watermark-image?${params.toString()}`;
}
