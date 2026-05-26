"use client";

import Link from "next/link";
import Image from "next/image";

interface HeroProps {
  block: any;
  posts: any[];
  accentColor?: string;
}

export default function Hero({ block, posts, accentColor }: HeroProps) {
  // Fallback to global var if prop is missing
  const effectiveAccent = accentColor || 'var(--accent)';
  
  // Inject local variable to ensure it overrides global scope
  const rootStyle = {
      '--accent': effectiveAccent
  } as React.CSSProperties;

  // Jika tidak ada post sama sekali
  if (!posts || posts.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 flex items-center justify-center text-gray-400">
        Belum ada berita untuk ditampilkan di Hero.
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
  
  const limit = block.config?.limit || 1;
  const displayPosts = posts.slice(0, limit);

  // --- LAYOUT 1: SINGLE HERO (Standard) ---
  if (displayPosts.length === 1) {
    const heroPost = displayPosts[0];
    const imageUrl = heroPost.image || heroPost.featuredImage?.fileUrl || '/placeholder.jpg';
    const isVideo = String((heroPost as any)?.type || "").toUpperCase() === "VIDEO";
    
    return (
      <section 
        className="relative w-full h-[400px] md:h-[500px] overflow-hidden mb-8 rounded-xl group"
        style={rootStyle}
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
    );
  }

  // --- LAYOUT 2: GRID HERO (Multiple Posts) ---
  // Layout otomatis berdasarkan jumlah
  return (
    <div 
        className={`grid gap-4 mb-8 ${displayPosts.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-12'}`}
        style={rootStyle}
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
                <div key={post.id} className={`relative overflow-hidden rounded-xl group ${gridClass} ${heightClass}`}>
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
  );
}
