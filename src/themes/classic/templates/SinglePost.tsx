import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import PostContent from "@/components/PostContent";
import { getYouTubeEmbedUrl } from "@/lib/utils";

interface SinglePostProps {
  post: any;
  setting?: any;
  categories: any[];
  footerConfig?: any;
  menusByLocation?: any;
}

export default function ClassicSinglePost({ post, setting, categories, footerConfig, menusByLocation }: SinglePostProps) {
  const siteName = setting?.siteName || "Portal Berita";
  
  if (!post) return <div className="p-10 text-center">Post not found</div>;

  const isInfographicPost = String(post?.type || "").toUpperCase() === "INFOGRAPHIC";
  const imageUrl = isInfographicPost ? (post.featuredImage?.fileUrl || post.image) : (post.image || post.featuredImage?.fileUrl);
  const videoEmbedSrc = post?.type === "VIDEO" && typeof post?.videoUrl === "string" ? getYouTubeEmbedUrl(post.videoUrl) : null;

  // Container Logic
  const containerMode = setting?.postContainerWidth || 'boxed';
  const customWidth = setting?.postCustomContainerWidth || '1250';
  const containerClass = containerMode === 'full' ? 'w-full px-4' : 'container mx-auto px-4';
  const containerStyle = containerMode === 'full' ? {} : { maxWidth: containerMode === 'custom' ? `${customWidth}px` : '1250px' };

  // const backgroundColor = setting?.globalBackgroundColor || setting?.backgroundColor || "#ffffff"; // Handled by ThemeProvider

  return (
    <div className="public-theme min-h-screen flex flex-col font-sans text-gray-900">
      <Header siteName={siteName} logoUrl={setting?.logoUrl} categories={categories} />
      
      <main className={`flex-grow ${containerClass} pt-0 pb-12`} style={containerStyle}>
        <article>
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            {post.category && (
                <Link href={`/kategori/${post.category.slug}`} className="hover:text-blue-600">
                    {post.category.name}
                </Link>
            )}
            <span>/</span>
            <span className="text-gray-900 truncate max-w-[200px]">{post.title}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 text-gray-900">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
             {post.author && (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                        {post.author.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{post.author.name}</span>
                </div>
             )}
             <span>•</span>
             <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
             </time>
             <span>•</span>
             <a
               href={`/print/${post?.category?.slug || "berita"}/${post?.slug || ""}`}
               target="_blank"
               rel="noreferrer"
               className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
             >
               Print
             </a>
          </div>

          {/* Featured Image */}
          {videoEmbedSrc ? (
            <div className="relative w-full aspect-video mb-10 rounded-xl overflow-hidden shadow-sm bg-black">
              <iframe
                src={videoEmbedSrc}
                title={post.title || "Video"}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : imageUrl ? (
            <div className="relative w-full aspect-video mb-10 rounded-xl overflow-hidden shadow-sm">
               <Image 
                 src={imageUrl} 
                 alt={post.title} 
                 fill 
                 quality={90}
                 className="object-cover"
                 priority
                 sizes="(max-width: 768px) 100vw, 1250px"
               />
               {post.featuredImage?.caption && (
                   <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 text-center">
                       {post.featuredImage.caption}
                   </div>
               )}
            </div>
          ) : null}

          {/* Content */}
          <PostContent content={post.content} />
          
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Topik Terkait</h3>
                  <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag: any) => (
                          <Link 
                            key={tag.id} 
                            href={`/tag/${tag.slug}`}
                            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                              #{tag.name}
                          </Link>
                      ))}
                  </div>
              </div>
          )}
        </article>
      </main>

      <Footer siteName={siteName} logoUrl={setting?.logoUrl} categories={categories} footerConfig={footerConfig} menusByLocation={menusByLocation} />
    </div>
  );
}
