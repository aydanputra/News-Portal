import { getPostImageWatermarkConfig, type WatermarkPosition } from "@/lib/post-image-watermark";

function getAlignment(position: WatermarkPosition) {
  switch (position) {
    case "top":
      return { justifyContent: "center", alignItems: "flex-start" } as const;
    case "bottom":
      return { justifyContent: "center", alignItems: "flex-end" } as const;
    case "left":
      return { justifyContent: "flex-start", alignItems: "center" } as const;
    case "right":
      return { justifyContent: "flex-end", alignItems: "center" } as const;
    default:
      return { justifyContent: "center", alignItems: "center" } as const;
  }
}

export default function PostImageWatermark({
  setting,
  enabled = true,
}: {
  setting?: any;
  enabled?: boolean;
}) {
  if (!enabled) return null;
  const watermark = getPostImageWatermarkConfig(setting);
  if (!watermark) return null;

  const alignment = getAlignment(watermark.position);

  return (
    <div
      className="pointer-events-none absolute inset-0 select-none"
      aria-hidden="true"
      style={{
        display: "flex",
        ...alignment,
        paddingTop: `${watermark.paddingTop}px`,
        paddingRight: `${watermark.paddingRight}px`,
        paddingBottom: `${watermark.paddingBottom}px`,
        paddingLeft: `${watermark.paddingLeft}px`,
      }}
    >
      <img
        src={watermark.imageUrl}
        alt=""
        className="block h-auto max-w-full object-contain"
        style={{
          width: `${watermark.size}%`,
          opacity: watermark.opacity / 100,
        }}
      />
    </div>
  );
}
