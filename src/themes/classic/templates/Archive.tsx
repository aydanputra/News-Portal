import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";

interface ArchiveProps {
  title: string;
  description?: string;
  posts: any[];
  setting?: any;
  categories: any[];
  footerConfig?: any;
  menusByLocation?: any;
}

export default function ClassicArchive({ title, description, posts, setting, categories, footerConfig, menusByLocation }: ArchiveProps) {
  const siteName = setting?.siteName || "Portal Berita";

  // Global Container Logic (Fallback for non-Home/Post pages)
  const containerMode = setting?.globalContainerWidth || 'boxed';
  const customWidth = setting?.globalCustomContainerWidth || '1250';
  const containerClass = containerMode === 'full' ? 'w-full px-4' : 'container mx-auto px-4';
  const containerStyle = containerMode === 'full' ? {} : { maxWidth: containerMode === 'custom' ? `${customWidth}px` : '1250px' };

  // const backgroundColor = setting?.globalBackgroundColor || setting?.backgroundColor || "#ffffff"; // Handled by ThemeProvider

  return (
    <div className="public-theme min-h-screen flex flex-col font-sans text-gray-900">
      <Header siteName={siteName} logoUrl={setting?.logoUrl} categories={categories} />
      
      <main className={`flex-grow ${containerClass} py-12`} style={containerStyle}>
         {/* Archive Header */}
         <div className="mb-12 text-center">
             <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
             {description && <p className="text-gray-500 max-w-2xl mx-auto">{description}</p>}
         </div>

         {/* Post Grid */}
         {posts.length === 0 ? (
             <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-lg">
                 Belum ada artikel di kategori ini.
             </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {posts.map((post) => (
                     <div key={post.id} className="group">
                         {/* Thumbnail */}
                         <div className="relative w-full aspect-[4/3] mb-4 overflow-hidden rounded-lg bg-gray-100">
                             {post.image || post.featuredImage?.fileUrl ? (
                                 <Image 
                                    src={post.image || post.featuredImage?.fileUrl} 
                                    alt={post.title} 
                                    fill 
                                    quality={90}
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                 />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                             )}
                             {String((post as any)?.type || "").toUpperCase() === "VIDEO" && (
                               <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                 <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                                   <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6 translate-x-[0.5px]">
                                     <path d="M8 5v14l11-7z" />
                                   </svg>
                                 </span>
                               </span>
                             )}
                         </div>

                         {/* Content */}
                         <div className="flex flex-col">
                             {post.category && (
                                 <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                                     {post.category.name}
                                 </span>
                             )}
                             <h2 className="text-xl font-bold mb-2 leading-tight group-hover:text-blue-700 transition-colors">
                                 <Link href={`/${post.category?.slug || 'berita'}/${post.slug}`}>
                                     {post.title}
                                 </Link>
                             </h2>
                             <div className="text-sm text-gray-400 mb-3">
                                 {new Date(post.publishedAt).toLocaleDateString('id-ID', {
                                     day: 'numeric', month: 'long', year: 'numeric'
                                 })}
                             </div>
                             <p className="text-gray-600 text-sm line-clamp-3">
                                 {post.excerpt}
                             </p>
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </main>

      <Footer siteName={siteName} logoUrl={setting?.logoUrl} categories={categories} footerConfig={footerConfig} menusByLocation={menusByLocation} />
    </div>
  );
}
