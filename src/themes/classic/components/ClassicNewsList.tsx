
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string;
    image?: string;
    featuredImage: any; // Bisa string (legacy) atau object { fileUrl: string }
    category: { name: string; slug: string };
    author: { name: string };
}

interface ClassicNewsListProps {
    block: any;
    posts: Post[];
}

export default function ClassicNewsList({ block, posts }: ClassicNewsListProps) {
    return (
        <div className="mb-8">
            {block.title && (
                <h3 className="text-2xl font-serif font-bold border-b-2 border-gray-800 pb-2 mb-6">
                    {block.title}
                </h3>
            )}
            
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.id} className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-200 last:border-0">
            <div className="md:w-1/3">
              <Link href={`/${post.category?.slug || 'berita'}/${post.slug}`} className="block relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 group">
                <Image
                  src={post.featuredImage?.fileUrl || post.image || "https://placehold.co/400x300"}
                  alt={post.title}
                  fill
                  quality={90}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {String((post as any)?.type || "").toUpperCase() === "VIDEO" && (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-6 w-6 translate-x-[0.5px]">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  </span>
                )}
              </Link>
            </div>
            <div className="md:w-2/3 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 uppercase font-semibold tracking-wider">
                <Link href={`/${post.category?.slug || 'berita'}`} className="text-red-600 hover:text-red-700 transition-colors">
                  {post.category?.name}
                </Link>
                <span>/</span>
                <span>{new Date(post.publishedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 leading-tight font-serif text-gray-900 group">
                <Link href={`/${post.category?.slug || 'berita'}/${post.slug}`} className="group-hover:text-red-600 transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-gray-600 line-clamp-2 mb-4 font-serif leading-relaxed">
                {post.excerpt}
              </p>
              <div className="mt-auto">
                <Link href={`/${post.category?.slug || 'berita'}/${post.slug}`} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-900 hover:text-red-600 transition-colors border-b-2 border-red-600 pb-0.5">
                  Baca Selengkapnya
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
        </div>
    );
}
