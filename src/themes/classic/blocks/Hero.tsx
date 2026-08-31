"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  block: any;
  posts: any[];
  accentColor?: string;
}

const resolveRadiusValue = (value: unknown, fallback: string) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value < 0) return fallback;
    return `${value}px`;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    const lower = trimmed.toLowerCase();
    if (lower === "global" || lower === "default") return fallback;
    if (lower === "none") return "0";
    if (lower === "sm") return "0.125rem";
    if (lower === "md") return "0.375rem";
    if (lower === "lg") return "0.5rem";
    if (lower === "xl") return "0.75rem";
    if (lower === "2xl") return "1rem";
    if (lower === "full") return "9999px";
    if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
    return trimmed;
  }
  return fallback;
};

const toCssImage = (value: unknown) => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return `url("${trimmed.replace(/["\\]/g, "\\$&")}")`;
};

export default function Hero({ block, posts, accentColor }: HeroProps) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  useEffect(() => {
    const updateDevice = () => {
      if (window.innerWidth < 768) {
        setDevice("mobile");
        return;
      }
      if (window.innerWidth < 1024) {
        setDevice("tablet");
        return;
      }
      setDevice("desktop");
    };

    updateDevice();
    window.addEventListener("resize", updateDevice);
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  // Fallback to global var if prop is missing
  const effectiveAccent = accentColor || 'var(--accent)';
  const config = block?.config || {};
  
  // Inject local variable to ensure it overrides global scope
  const rootStyle = {
      '--accent': effectiveAccent
  } as React.CSSProperties;

  const useBoxDesktop = config.useBox === true;
  const useBoxTablet = (config.tabletUseBox ?? config.useBox) === true;
  const useBoxMobile = (config.mobileUseBox ?? config.useBox) === true;

  const boxColorDesktop = typeof config.boxColor === "string" && config.boxColor.trim() !== "" ? config.boxColor : "transparent";
  const boxColorTablet = typeof config.tabletBoxColor === "string" && config.tabletBoxColor.trim() !== "" ? config.tabletBoxColor : boxColorDesktop;
  const boxColorMobile = typeof config.mobileBoxColor === "string" && config.mobileBoxColor.trim() !== "" ? config.mobileBoxColor : boxColorDesktop;

  const boxBgDesktop = toCssImage(config.backgroundImage);
  const boxBgTablet = toCssImage(config.tabletBackgroundImage) || boxBgDesktop;
  const boxBgMobile = toCssImage(config.mobileBackgroundImage) || boxBgDesktop;

  const boxBgSizeDesktop = typeof config.backgroundSize === "string" && config.backgroundSize.trim() !== "" ? config.backgroundSize : "cover";
  const boxBgSizeTablet = typeof config.tabletBackgroundSize === "string" && config.tabletBackgroundSize.trim() !== "" ? config.tabletBackgroundSize : boxBgSizeDesktop;
  const boxBgSizeMobile = typeof config.mobileBackgroundSize === "string" && config.mobileBackgroundSize.trim() !== "" ? config.mobileBackgroundSize : boxBgSizeDesktop;

  const boxBgPositionDesktop = typeof config.backgroundPosition === "string" && config.backgroundPosition.trim() !== "" ? config.backgroundPosition : "center";
  const boxBgPositionTablet = typeof config.tabletBackgroundPosition === "string" && config.tabletBackgroundPosition.trim() !== "" ? config.tabletBackgroundPosition : boxBgPositionDesktop;
  const boxBgPositionMobile = typeof config.mobileBackgroundPosition === "string" && config.mobileBackgroundPosition.trim() !== "" ? config.mobileBackgroundPosition : boxBgPositionDesktop;

  const boxBgRepeatDesktop = typeof config.backgroundRepeat === "string" && config.backgroundRepeat.trim() !== "" ? config.backgroundRepeat : "no-repeat";
  const boxBgRepeatTablet = typeof config.tabletBackgroundRepeat === "string" && config.tabletBackgroundRepeat.trim() !== "" ? config.tabletBackgroundRepeat : boxBgRepeatDesktop;
  const boxBgRepeatMobile = typeof config.mobileBackgroundRepeat === "string" && config.mobileBackgroundRepeat.trim() !== "" ? config.mobileBackgroundRepeat : boxBgRepeatDesktop;

  const boxBgAttachmentDesktop = typeof config.backgroundAttachment === "string" && config.backgroundAttachment.trim() !== "" ? config.backgroundAttachment : "scroll";
  const boxBgAttachmentTablet = typeof config.tabletBackgroundAttachment === "string" && config.tabletBackgroundAttachment.trim() !== "" ? config.tabletBackgroundAttachment : boxBgAttachmentDesktop;
  const boxBgAttachmentMobile = typeof config.mobileBackgroundAttachment === "string" && config.mobileBackgroundAttachment.trim() !== "" ? config.mobileBackgroundAttachment : boxBgAttachmentDesktop;

  const boxOverlayDesktop = typeof config.backgroundOverlayColor === "string" && config.backgroundOverlayColor.trim() !== "" ? config.backgroundOverlayColor : "transparent";
  const boxOverlayTablet = typeof config.tabletBackgroundOverlayColor === "string" && config.tabletBackgroundOverlayColor.trim() !== "" ? config.tabletBackgroundOverlayColor : boxOverlayDesktop;
  const boxOverlayMobile = typeof config.mobileBackgroundOverlayColor === "string" && config.mobileBackgroundOverlayColor.trim() !== "" ? config.mobileBackgroundOverlayColor : boxOverlayDesktop;

  const boxOverlayOpacityDesktop = Math.min(100, Math.max(0, Number(config.backgroundOverlayOpacity ?? 45) || 0));
  const boxOverlayOpacityTablet = Math.min(100, Math.max(0, Number(config.tabletBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));
  const boxOverlayOpacityMobile = Math.min(100, Math.max(0, Number(config.mobileBackgroundOverlayOpacity ?? boxOverlayOpacityDesktop) || 0));

  const boxRadiusDesktop = resolveRadiusValue(config.boxBorderRadius, "0.75rem");
  const boxRadiusTablet = resolveRadiusValue(config.tabletBoxBorderRadius ?? config.boxBorderRadius, boxRadiusDesktop);
  const boxRadiusMobile = resolveRadiusValue(config.mobileBoxBorderRadius ?? config.boxBorderRadius, boxRadiusDesktop);

  const boxPtBase = config.boxPaddingTop !== undefined ? `${config.boxPaddingTop}px` : "0px";
  const boxPrBase = config.boxPaddingRight !== undefined ? `${config.boxPaddingRight}px` : "0px";
  const boxPbBase = config.boxPaddingBottom !== undefined ? `${config.boxPaddingBottom}px` : "0px";
  const boxPlBase = config.boxPaddingLeft !== undefined ? `${config.boxPaddingLeft}px` : "0px";
  const boxPtMobile = config.mobileBoxPaddingTop !== undefined ? `${config.mobileBoxPaddingTop}px` : boxPtBase;
  const boxPrMobile = config.mobileBoxPaddingRight !== undefined ? `${config.mobileBoxPaddingRight}px` : boxPrBase;
  const boxPbMobile = config.mobileBoxPaddingBottom !== undefined ? `${config.mobileBoxPaddingBottom}px` : boxPbBase;
  const boxPlMobile = config.mobileBoxPaddingLeft !== undefined ? `${config.mobileBoxPaddingLeft}px` : boxPlBase;
  const boxPtTablet = config.tabletBoxPaddingTop !== undefined ? `${config.tabletBoxPaddingTop}px` : boxPtBase;
  const boxPrTablet = config.tabletBoxPaddingRight !== undefined ? `${config.tabletBoxPaddingRight}px` : boxPrBase;
  const boxPbTablet = config.tabletBoxPaddingBottom !== undefined ? `${config.tabletBoxPaddingBottom}px` : boxPbBase;
  const boxPlTablet = config.tabletBoxPaddingLeft !== undefined ? `${config.tabletBoxPaddingLeft}px` : boxPlBase;
  const boxPtDesktop = boxPtBase;
  const boxPrDesktop = boxPrBase;
  const boxPbDesktop = boxPbBase;
  const boxPlDesktop = boxPlBase;

  const currentUseBox = device === "mobile" ? useBoxMobile : device === "tablet" ? useBoxTablet : useBoxDesktop;
  const currentBoxColor = device === "mobile" ? boxColorMobile : device === "tablet" ? boxColorTablet : boxColorDesktop;
  const currentBoxBg = device === "mobile" ? boxBgMobile : device === "tablet" ? boxBgTablet : boxBgDesktop;
  const currentBoxBgSize = device === "mobile" ? boxBgSizeMobile : device === "tablet" ? boxBgSizeTablet : boxBgSizeDesktop;
  const currentBoxBgPosition = device === "mobile" ? boxBgPositionMobile : device === "tablet" ? boxBgPositionTablet : boxBgPositionDesktop;
  const currentBoxBgRepeat = device === "mobile" ? boxBgRepeatMobile : device === "tablet" ? boxBgRepeatTablet : boxBgRepeatDesktop;
  const currentBoxBgAttachment = device === "mobile" ? boxBgAttachmentMobile : device === "tablet" ? boxBgAttachmentTablet : boxBgAttachmentDesktop;
  const currentBoxOverlay = device === "mobile" ? boxOverlayMobile : device === "tablet" ? boxOverlayTablet : boxOverlayDesktop;
  const currentBoxOverlayOpacity = device === "mobile" ? boxOverlayOpacityMobile : device === "tablet" ? boxOverlayOpacityTablet : boxOverlayOpacityDesktop;
  const currentBoxRadius = device === "mobile" ? boxRadiusMobile : device === "tablet" ? boxRadiusTablet : boxRadiusDesktop;
  const currentBoxPt = device === "mobile" ? boxPtMobile : device === "tablet" ? boxPtTablet : boxPtDesktop;
  const currentBoxPr = device === "mobile" ? boxPrMobile : device === "tablet" ? boxPrTablet : boxPrDesktop;
  const currentBoxPb = device === "mobile" ? boxPbMobile : device === "tablet" ? boxPbTablet : boxPbDesktop;
  const currentBoxPl = device === "mobile" ? boxPlMobile : device === "tablet" ? boxPlTablet : boxPlDesktop;
  const hasBoxOverlay = currentUseBox && currentBoxBg && currentBoxOverlay !== "transparent" && currentBoxOverlayOpacity > 0;

  const wrapperStyle = {
    ...rootStyle,
    backgroundColor: currentUseBox ? currentBoxColor : "transparent",
    backgroundImage: currentUseBox && currentBoxBg ? currentBoxBg : undefined,
    backgroundSize: currentUseBox && currentBoxBg ? currentBoxBgSize : undefined,
    backgroundPosition: currentUseBox && currentBoxBg ? currentBoxBgPosition : undefined,
    backgroundRepeat: currentUseBox && currentBoxBg ? currentBoxBgRepeat : undefined,
    backgroundAttachment: currentUseBox && currentBoxBg ? currentBoxBgAttachment : undefined,
    borderRadius: currentUseBox ? currentBoxRadius : undefined,
    paddingTop: currentUseBox ? currentBoxPt : undefined,
    paddingRight: currentUseBox ? currentBoxPr : undefined,
    paddingBottom: currentUseBox ? currentBoxPb : undefined,
    paddingLeft: currentUseBox ? currentBoxPl : undefined,
    overflow: currentUseBox ? "hidden" : undefined,
  } as React.CSSProperties;

  const wrapperOverlayStyle = {
    backgroundColor: currentBoxOverlay,
    opacity: currentBoxOverlayOpacity / 100,
    borderRadius: currentUseBox ? currentBoxRadius : undefined,
  } as React.CSSProperties;

  // Jika tidak ada post sama sekali
  if (!posts || posts.length === 0) {
    return (
      <div className="relative mb-8" style={wrapperStyle}>
        {hasBoxOverlay && <div className="pointer-events-none absolute inset-0 z-0" style={wrapperOverlayStyle} />}
        <div className="relative z-10 w-full h-96 bg-gray-100 flex items-center justify-center text-gray-400">
          Belum ada berita untuk ditampilkan di Hero.
        </div>
      </div>
    );
  }

  // Jika limit > 1, kita bisa buat slider atau grid.
  // Untuk Classic Theme yang diminta "standard elementor", biasanya 1 hero besar.
  // Tapi jika user minta "pilihan jumlah berita", mungkin maksudnya Grid Hero atau Slider.
  // Untuk saat ini kita buat Layout Grid Sederhana jika > 1 post.
  // 1 Post = Full Hero
  // 2 Post = 50:50 Split
  // 3 Post = 1 Besar Kiri, 2 Kecil Kanan
  
  const limitDesktop = Math.max(1, Number(block.config?.limit) || 1);
  const limitTablet = Math.max(1, Number((block.config as any)?.tabletLimit) || limitDesktop);
  const limitMobile = Math.max(1, Number((block.config as any)?.mobileLimit) || limitDesktop);
  const currentLimit = device === "mobile" ? limitMobile : device === "tablet" ? limitTablet : limitDesktop;
  const displayPosts = posts.slice(0, currentLimit);

  // --- LAYOUT 1: SINGLE HERO (Standard) ---
  if (displayPosts.length === 1) {
    const heroPost = displayPosts[0];
    const imageUrl = heroPost.image || heroPost.featuredImage?.fileUrl || '/placeholder.jpg';
    const isVideo = String((heroPost as any)?.type || "").toUpperCase() === "VIDEO";
    
    return (
      <div className="relative mb-8" style={wrapperStyle}>
        {hasBoxOverlay && <div className="pointer-events-none absolute inset-0 z-0" style={wrapperOverlayStyle} />}
        <section
          className="relative z-10 w-full h-[400px] md:h-[500px] overflow-hidden group"
          style={{ borderRadius: "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))" }}
        >
          <div className="absolute inset-0">
              <Image 
                  src={imageUrl} 
                  alt={heroPost.title} 
                  fill
                  unoptimized
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              {isVideo && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-8 w-8 translate-x-[0.5px]">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              )}
          </div>
          
          <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full md:w-2/3 text-white">
              {heroPost.category && (
                  <span 
                      className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider text-white rounded-sm"
                      style={{ backgroundColor: 'var(--accent)' }}
                  >
                      {heroPost.category.name}
                  </span>
              )}
              <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-3 drop-shadow-sm">
                  <Link 
                      href={`/${heroPost.category?.slug || 'berita'}/${heroPost.slug}`} 
                      className="transition-colors hover:text-[var(--accent)]"
                  >
                      {heroPost.title}
                  </Link>
              </h2>
              <div className="flex items-center gap-3 text-xs md:text-sm text-gray-300 font-medium">
                  {heroPost.author && <span>{heroPost.author.name}</span>}
                  <span>•</span>
                  <time>{new Date(heroPost.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
              </div>
          </div>
        </section>
      </div>
    );
  }

  // --- LAYOUT 2: GRID HERO (Multiple Posts) ---
  // Layout otomatis berdasarkan jumlah
  return (
    <div className="relative mb-8" style={wrapperStyle}>
      {hasBoxOverlay && <div className="pointer-events-none absolute inset-0 z-0" style={wrapperOverlayStyle} />}
      <div
          className={`relative z-10 grid gap-4 ${displayPosts.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-12'}`}
      >
          {displayPosts.map((post: any, index: number) => {
              // Logic Layout Grid
              // Jika 3 item: Item pertama col-span-8 (besar), sisanya col-span-4 (kecil ditumpuk?)
              // Sebenarnya layout 1 besar + 2 kecil kanan itu klasik banget.
              
              let gridClass = "col-span-12"; // Default full
              let heightClass = "h-[300px]";
              
              if (displayPosts.length === 2) {
                  gridClass = "col-span-1 md:col-span-1"; // 50:50
                  heightClass = "h-[400px]";
              } else if (displayPosts.length >= 3) {
                   // First item is big
                   if (index === 0) {
                       gridClass = "md:col-span-8 md:row-span-2";
                       heightClass = "h-[400px] md:h-[500px]";
                   } else {
                       // Other items small on right
                       gridClass = "md:col-span-4";
                       heightClass = "h-[200px] md:h-[240px]";
                   }
              }

              const imageUrl = post.image || post.featuredImage?.fileUrl || '/placeholder.jpg';
              const isVideo = String((post as any)?.type || "").toUpperCase() === "VIDEO";

              return (
                  <div
                    key={post.id}
                    className={`relative overflow-hidden group ${gridClass} ${heightClass}`}
                    style={{ borderRadius: "var(--global-image-radius, var(--home-main-box-radius, 0.75rem))" }}
                  >
                      <Image 
                          src={imageUrl} 
                          alt={post.title} 
                          fill
                          unoptimized
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      {isVideo && (
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6 translate-x-[0.5px]">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        </span>
                      )}
                      
                      <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
                          {post.category && (
                              <span 
                                  className="inline-block px-2 py-0.5 mb-2 text-[10px] font-bold uppercase tracking-wider text-white rounded-sm"
                                  style={{ backgroundColor: 'var(--accent)' }}
                              >
                                  {post.category.name}
                              </span>
                          )}
                          <h3 className={`${index === 0 && displayPosts.length >= 3 ? 'text-xl md:text-3xl' : 'text-sm md:text-lg'} font-bold leading-tight mb-1 drop-shadow-sm`}>
                              <Link 
                                  href={`/${post.category?.slug || 'berita'}/${post.slug}`} 
                                  className="transition-colors hover:text-[var(--accent)] line-clamp-2"
                              >
                                  {post.title}
                              </Link>
                          </h3>
                          {index === 0 && (
                              <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-300 mt-2">
                                  <time>{new Date(post.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                              </div>
                          )}
                      </div>
                  </div>
              );
          })}
      </div>
    </div>
  );
}
