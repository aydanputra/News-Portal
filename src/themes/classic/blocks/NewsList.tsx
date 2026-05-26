// src/themes/classic/blocks/NewsList.tsx

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface NewsListProps {
  block: {
    id: string;
    config?: {
      title?: string;
      limit?: number;
      category?: string;
      showImage?: boolean;
      showExcerpt?: boolean;
      showDate?: boolean;
      // Style props
      boxColor?: string;
      boxBorderRadius?: string;
      blockTitleColor?: string;
      blockTitleFontSize?: number;
      blockTitleLineHeight?: number;
      blockTitleBorderColor?: string;
      imageWidth?: string;
      imageHeight?: string;
      imageBorderRadius?: number;
      titleColor?: string;
      titleFontSize?: number;
      titleLineHeight?: number;
      titleFontWeight?: string;
      titleMarginBottom?: number;
      metaColor?: string;
      metaFontSize?: number;
      excerptColor?: string;
    };
  };
  posts: any[];
  customTitle?: string;
  accentColor?: string;
}

export default function NewsList({ block, posts, customTitle, accentColor }: NewsListProps) {
  const { config } = block;
  // Prioritize customTitle prop, then config.title, then default
  const title = customTitle || config?.title || "Berita Terbaru";
  const showTitle = (config as any)?.showTitle !== false;
  const showImage = config?.showImage !== false; // Default true
  const showExcerpt = config?.showExcerpt !== false; // Default true, tapi cek config
  const effectiveAccent = accentColor || 'var(--accent)';
  const categorySlug = (config as any)?.categorySlug || config?.category;
  const filterType = (config as any)?.filterType || "category";
  const tagSlug = (config as any)?.tagSlug;
  const normalizeFontWeight = (value: unknown, fallback: string) => {
      if (typeof value === 'number' && Number.isFinite(value)) return String(value);
      if (typeof value !== 'string') return fallback;
      const v = value.trim().toLowerCase();
      if (!v) return fallback;
      if (/^\d{3}$/.test(v)) return v;
      const map: Record<string, string> = {
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
          extrabold: '800',
          black: '900'
      };
      return map[v] || fallback;
  };

  // Style untuk Container Widget
  const containerStyle = {
      backgroundColor: config?.boxColor || 'var(--box-bg, #ffffff)',
      borderRadius: config?.boxBorderRadius ? (config.boxBorderRadius === 'none' ? '0' : `var(--radius-${config.boxBorderRadius}, 0.75rem)`) : 'var(--box-radius, 0.75rem)',
      boxShadow: 'var(--box-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05))',
      border: 'var(--box-border, 1px solid var(--border))',
      padding: 'var(--box-padding, 1.5rem)',
      color: 'var(--fg-primary)',
      '--accent': effectiveAccent
  } as React.CSSProperties;

  // Style untuk Judul Widget
  const titleStyle = {
      color: config?.blockTitleColor || 'var(--home-title-color)',
      fontSize: config?.blockTitleFontSize ? `${config.blockTitleFontSize}px` : 'var(--home-title-size)',
      fontWeight: 'var(--home-title-weight, 700)',
      lineHeight: config?.blockTitleLineHeight || 1.4,
      borderColor: config?.blockTitleBorderColor || 'var(--accent)',
      borderBottomWidth: '2px',
      paddingBottom: '0.5rem',
      marginBottom: '1.5rem'
  };

  // Jika posts kosong
  if (!posts || posts.length === 0) {
      return (
          <div className="h-full" style={containerStyle}>
              {showTitle && <h3 style={titleStyle}>{title}</h3>}
              <p className="text-[var(--fg-muted)] text-sm">Belum ada berita di kategori ini.</p>
          </div>
      );
  }

  return (
    <div className="h-full" style={containerStyle}>
       {showTitle && (
         <h3 className="flex items-center justify-between" style={titleStyle}>
             <span>{title}</span>
             {(filterType === "tag" ? !!tagSlug : (categorySlug && categorySlug !== 'all')) && (
                 <Link 
                  href={filterType === "tag" ? `/tag/${tagSlug}` : `/category/${categorySlug}`} 
                  className="text-xs font-normal hover:underline"
                  style={{ color: 'var(--accent)' }}
                 >
                     Lihat Semua
                 </Link>
             )}
         </h3>
       )}
       
       <div className="space-y-6">
         {posts.map((post) => {
             const postLink = post.category ? `/${post.category.slug}/${post.slug}` : `/post/${post.slug}`;
             const imageUrl = post.image || post.featuredImage?.fileUrl;
             const isVideo = String((post as any)?.type || "").toUpperCase() === "VIDEO";
             
             return (
               <article key={post.id} className="flex gap-4 group">
                 {/* Thumbnail */}
                 {showImage && (
                     <Link 
                        href={postLink} 
                        className="flex-shrink-0 relative overflow-hidden bg-[var(--bg-base)]"
                        style={{
                            width: config?.imageWidth || '6rem', // 24 = 6rem
                            height: config?.imageHeight || '6rem',
                            borderRadius: config?.imageBorderRadius ? `${config.imageBorderRadius}px` : 'var(--radius-md, 0.375rem)'
                        }}
                     >
                        {imageUrl ? (
                             <Image 
                                 src={imageUrl} 
                                 alt={post.title} 
                                 fill
                                 unoptimized
                                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                             />
                        ) : (
                            <div className="w-full h-full bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--fg-muted)]">
                                <span className="text-xs">No Image</span>
                            </div>
                        )}
                        {isVideo && (
                          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5 translate-x-[0.5px]">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </span>
                          </span>
                        )}
                     </Link>
                 )}

                 <div className="flex-grow">
                     {/* Meta (Category, Date) */}
                     <div 
                        className="flex items-center gap-2 text-xs mb-1"
                        style={{ 
                            color: config?.metaColor || 'var(--home-meta-color)',
                            fontSize: config?.metaFontSize ? `${config.metaFontSize}px` : 'var(--home-meta-size, 0.75rem)'
                        }}
                     >
                         {post.category && (
                             <Link 
                                href={`/${post.category.slug}`} 
                                className="font-medium uppercase tracking-wider hover:underline"
                                style={{ color: 'var(--accent)' }}
                             >
                                 {post.category.name}
                             </Link>
                         )}
                         <span>•</span>
                         {(config?.showDate !== false) && (
                            <time>{new Date(post.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</time>
                         )}
                     </div>

                     {/* Title */}
                     <h4 
                        className="font-bold transition-colors line-clamp-2 leading-snug mb-1 group-hover:text-[var(--home-hover-color)]"
                        style={{
                            color: config?.titleColor || 'var(--home-title-color)',
                            fontSize: config?.titleFontSize ? `${config.titleFontSize}px` : '1rem', // Default base
                            lineHeight: config?.titleLineHeight || 1.4,
                            fontWeight: normalizeFontWeight(config?.titleFontWeight, '700'),
                            marginBottom: config?.titleMarginBottom ? `${config.titleMarginBottom}px` : '0.25rem'
                        }}
                     >
                         <Link href={postLink}>
                             {post.title}
                         </Link>
                     </h4>

                     {/* Excerpt */}
                     {showExcerpt && (
                         <p 
                            className="line-clamp-2"
                            style={{
                                color: config?.excerptColor || 'var(--home-excerpt-color)',
                                fontSize: '0.875rem' // text-sm
                            }}
                         >
                            {post.excerpt}
                         </p>
                     )}
                 </div>
               </article>
             );
         })}
       </div>
     </div>
  );
}
