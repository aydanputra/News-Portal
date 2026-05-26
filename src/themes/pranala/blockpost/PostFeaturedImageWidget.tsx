import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { WidgetRenderContext } from "./types";
import { getAllImagesFromContent, getFirstImageFromContent, getPostImageUrl, normalizeImageUrl, parseAspectRatio, toPxValue } from "./helpers";
import { getYouTubeEmbedUrl } from "@/lib/utils";

export default function PostFeaturedImageWidget({
  post,
  setting,
  preview,
  widgetContainerStyle,
  getResponsiveConfig,
  getConfigBool,
  isPublicDarkMode
}: WidgetRenderContext) {
  const isInfographicPost = String(post?.type || "").toUpperCase() === "INFOGRAPHIC";
  const isGalleryPost = String(post?.type || "").toUpperCase() === "GALLERY";
  const featuredMainImageUrl = isInfographicPost
    ? normalizeImageUrl(post?.featuredImage?.fileUrl ?? post?.featuredImage?.url ?? post?.featuredImage ?? post?.featured_image)
    : undefined;
  const fromGalleryField = useMemo<{ src: string; caption: string }[]>(() => {
    return Array.isArray(post?.gallery)
      ? post.gallery
          .map((item: unknown) => {
            if (typeof item === "string") return { src: normalizeImageUrl(item), caption: "" };
            if (item && typeof item === "object") {
              const entry = item as { url?: unknown; caption?: unknown };
              return {
                src: normalizeImageUrl(entry.url),
                caption: typeof entry.caption === "string" ? entry.caption : "",
              };
            }
            return null;
          })
          .filter((item: { src: string | undefined; caption: string } | null): item is { src: string; caption: string } => Boolean(item?.src))
      : [];
  }, [post?.gallery]);
  const baseImageUrl = featuredMainImageUrl || getPostImageUrl(post) || getFirstImageFromContent(post?.content);
  const imageUrl = isGalleryPost && fromGalleryField.length > 0 ? fromGalleryField[0]?.src : baseImageUrl;
  const galleryItems = useMemo(() => {
    if (isGalleryPost) {
      if (fromGalleryField.length > 0) {
        return fromGalleryField.filter(
          (item: { src: string; caption: string }, index: number, array: { src: string; caption: string }[]) =>
            array.findIndex((entry: { src: string; caption: string }) => entry.src === item.src) === index
        );
      }
      const featured = normalizeImageUrl(imageUrl);
      const fromContent = getAllImagesFromContent(post?.content).map((src) => ({ src, caption: "" }));
      const merged = [
        ...(featured ? [{ src: featured, caption: typeof post?.imageCaption === "string" ? post.imageCaption.trim() : "" }] : []),
        ...fromContent,
      ];
      return merged.filter((item, index, array) => array.findIndex((entry) => entry.src === item.src) === index);
    }

    const featured = normalizeImageUrl(imageUrl);
    const fromContent = getAllImagesFromContent(post?.content).map((src) => ({ src, caption: "" }));
    const merged = [
      ...(featured ? [{ src: featured, caption: typeof post?.imageCaption === "string" ? post.imageCaption.trim() : "" }] : []),
      ...fromGalleryField,
      ...fromContent,
    ];
    return merged.filter((item, index, array) => array.findIndex((entry) => entry.src === item.src) === index);
  }, [fromGalleryField, imageUrl, isGalleryPost, post?.content, post?.imageCaption]);
  const imageGallery = useMemo(() => galleryItems.map((item) => item.src), [galleryItems]);
  const galleryLayout = String(setting?.galleryLayout || "slider");
  const galleryEnableLightbox = setting?.galleryEnableLightbox !== false;
  const galleryAutoPlay = setting?.galleryAutoPlay === true;
  const isVideoPost = String(post?.type || "").toUpperCase() === "VIDEO";
  const videoEmbedSrc = isVideoPost && typeof post?.videoUrl === "string" ? getYouTubeEmbedUrl(post.videoUrl) : null;
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const activeGalleryCaption = galleryItems[currentGalleryIndex]?.caption || "";
  useEffect(() => {
    if (currentGalleryIndex > imageGallery.length - 1) setCurrentGalleryIndex(0);
  }, [currentGalleryIndex, imageGallery.length]);
  useEffect(() => {
    if (!isGalleryPost || !galleryAutoPlay || imageGallery.length <= 1 || galleryLayout !== "slider") return;
    if (isLightboxOpen) return;
    const timer = window.setInterval(() => {
      setCurrentGalleryIndex((prev) => (prev + 1) % imageGallery.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [galleryAutoPlay, galleryLayout, imageGallery.length, isGalleryPost, isLightboxOpen]);
  useEffect(() => {
    if (!isGalleryPost || !galleryAutoPlay || imageGallery.length <= 1 || !isLightboxOpen) return;
    const timer = window.setInterval(() => {
      setCurrentGalleryIndex((prev) => (prev + 1) % imageGallery.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [galleryAutoPlay, imageGallery.length, isGalleryPost, isLightboxOpen]);
  const goPrevImage = useCallback(() => {
    if (imageGallery.length <= 1) return;
    setCurrentGalleryIndex((prev) => (prev - 1 + imageGallery.length) % imageGallery.length);
  }, [imageGallery.length]);
  const goNextImage = useCallback(() => {
    if (imageGallery.length <= 1) return;
    setCurrentGalleryIndex((prev) => (prev + 1) % imageGallery.length);
  }, [imageGallery.length]);
  const selectImage = useCallback((index: number) => {
    if (index < 0 || index >= imageGallery.length) return;
    setCurrentGalleryIndex(index);
  }, [imageGallery.length]);
  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrevImage();
      if (e.key === "ArrowRight") goNextImage();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goNextImage, goPrevImage, isLightboxOpen]);
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (imageGallery.length <= 1) return;
    setTouchStartX(e.touches[0]?.clientX ?? null);
  };
  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (imageGallery.length <= 1 || touchStartX === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) goPrevImage();
      else goNextImage();
    }
    setTouchStartX(null);
  };

  const ratio = parseAspectRatio(getResponsiveConfig("aspectRatio"), "16 / 9");
  const imageFit = String(getResponsiveConfig("imageFit") || "cover");
  const objectFit = imageFit === "contain" || imageFit === "fill" ? imageFit : "cover";
  const imagePosition = String(getResponsiveConfig("imagePosition") || "center");
  const objectPosition = imagePosition === "top" || imagePosition === "bottom" || imagePosition === "left" || imagePosition === "right" ? imagePosition : "center";
  const imageRadius = toPxValue(getResponsiveConfig("imageBorderRadius")) || "var(--home-main-box-radius, 0.75rem)";
  const minHeight = toPxValue(getResponsiveConfig("imageMinHeight")) || (preview ? "180px" : "320px");
  const showCaption = getConfigBool("showImageCaption", false);
  const captionText = typeof post?.imageCaption === "string" ? post.imageCaption.trim() : "";
  const activeImage = isLightboxOpen ? (imageGallery[currentGalleryIndex] || imageUrl) : (imageGallery[currentGalleryIndex] || imageUrl);
  if (!imageUrl && !preview && !videoEmbedSrc) return null;
  const shouldShowGalleryLayout = isGalleryPost && imageGallery.length > 1;

  return (
    <div style={widgetContainerStyle}>
      {shouldShowGalleryLayout && galleryLayout === "grid" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {galleryItems.map((item, index) => (
            <button
              key={`${item.src}-${index}`}
              type="button"
              className="relative w-full overflow-hidden bg-[var(--bg-elevated)] text-left"
              style={{ borderRadius: imageRadius, aspectRatio: ratio, minHeight }}
              onClick={() => {
                if (!galleryEnableLightbox) return;
                setCurrentGalleryIndex(index);
                setIsLightboxOpen(true);
              }}
            >
              <Image src={item.src} alt={post?.title || `Gallery Image ${index + 1}`} fill sizes="100vw" style={{ objectFit, objectPosition }} unoptimized />
              {item.caption && <div className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-xs text-white">{item.caption}</div>}
            </button>
          ))}
        </div>
      ) : shouldShowGalleryLayout && galleryLayout === "feed" ? (
        <div className="space-y-4">
          {galleryItems.map((item, index) => (
            <figure key={`${item.src}-${index}`} className="space-y-2">
              <button
                type="button"
                className="relative block w-full overflow-hidden bg-[var(--bg-elevated)]"
                style={{ borderRadius: imageRadius, aspectRatio: ratio, minHeight }}
                onClick={() => {
                  if (!galleryEnableLightbox) return;
                  setCurrentGalleryIndex(index);
                  setIsLightboxOpen(true);
                }}
              >
                <Image src={item.src} alt={post?.title || `Gallery Image ${index + 1}`} fill sizes="100vw" style={{ objectFit, objectPosition }} unoptimized />
              </button>
              {item.caption && <figcaption className="text-xs text-[var(--fg-secondary)]">{item.caption}</figcaption>}
            </figure>
          ))}
        </div>
      ) : (
        <>
          <div className="relative w-full overflow-hidden bg-[var(--bg-elevated)]" style={{ borderRadius: imageRadius, aspectRatio: ratio, minHeight }}>
            {videoEmbedSrc ? (
              <iframe
                src={videoEmbedSrc}
                title={post?.title || "Video"}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            ) : activeImage ? (
              <Image src={activeImage} alt={post?.title || "Featured Image"} fill sizes="100vw" style={{ objectFit, objectPosition }} unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm" style={{ backgroundColor: isPublicDarkMode ? "rgba(15, 23, 42, 0.58)" : "rgb(243 244 246)", color: isPublicDarkMode ? "var(--fg-secondary)" : "rgb(107 114 128)" }}>Featured Image</div>
            )}
            {!videoEmbedSrc && activeImage && galleryEnableLightbox && (
              <button type="button" onClick={() => { setCurrentGalleryIndex(currentGalleryIndex || 0); setIsLightboxOpen(true); }} className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 hover:bg-black/75 text-white px-2.5 py-1.5 text-xs">
                <Search size={14} />
                Perbesar
              </button>
            )}
          </div>
          {shouldShowGalleryLayout && imageGallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {galleryItems.map((item, index) => (
                <button
                  key={`${item.src}-thumb-${index}`}
                  type="button"
                  className={`relative h-16 w-20 flex-shrink-0 overflow-hidden border ${currentGalleryIndex === index ? "border-[var(--accent)]" : "border-[var(--border)]"}`}
                  style={{ borderRadius: "0.75rem" }}
                  onClick={() => setCurrentGalleryIndex(index)}
                >
                  <Image src={item.src} alt={`Thumbnail ${index + 1}`} fill sizes="80px" className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </>
      )}
      {showCaption && (activeGalleryCaption || captionText) && <p className="mt-2 text-xs text-[var(--fg-secondary)]">{activeGalleryCaption || captionText}</p>}
      {isLightboxOpen && activeImage && galleryEnableLightbox && typeof window !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4" onClick={() => setIsLightboxOpen(false)}>
          <button type="button" onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }} className="absolute top-4 right-4 rounded-full bg-black/70 hover:bg-black/85 text-white inline-flex items-center justify-center gap-1 px-3 py-2 text-xs border border-white/30 z-[10000]" aria-label="Tutup"><X size={18} /><span>Tutup</span></button>
          {imageGallery.length > 1 && <button type="button" onClick={(e) => { e.stopPropagation(); goPrevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/70 hover:bg-black/85 text-white inline-flex items-center justify-center z-[10000]" aria-label="Gambar sebelumnya"><ChevronLeft size={20} /></button>}
          <div className="relative w-[min(92vw,1100px)] h-[min(72vh,760px)] md:h-[min(78vh,820px)]" onClick={(e) => e.stopPropagation()} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <Image src={activeImage} alt={post?.title || "Featured Image"} fill sizes="100vw" className="object-contain" unoptimized />
          </div>
          {imageGallery.length > 1 && <button type="button" onClick={(e) => { e.stopPropagation(); goNextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/70 hover:bg-black/85 text-white inline-flex items-center justify-center z-[10000]" aria-label="Gambar selanjutnya"><ChevronRight size={20} /></button>}
          {imageGallery.length > 1 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[min(92vw,720px)] overflow-x-auto">
              <div className="flex items-center gap-2 px-1 py-1 justify-center">
                {imageGallery.map((src, idx) => (
                  <button key={`${src}-${idx}`} type="button" onClick={(e) => { e.stopPropagation(); selectImage(idx); }} className={`relative h-12 w-16 rounded overflow-hidden border transition-opacity ${idx === currentGalleryIndex ? "border-white opacity-100" : "border-white/40 opacity-75 hover:opacity-100"}`} aria-label={`Pilih gambar ${idx + 1}`}>
                    <Image src={src} alt={`Thumbnail ${idx + 1}`} fill sizes="64px" className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-black/70 text-white text-xs px-3 py-1.5">{currentGalleryIndex + 1} / {imageGallery.length}</div>
        </div>,
        document.body
      )}
    </div>
  );
}
