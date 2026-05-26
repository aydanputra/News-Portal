"use client";

import React from "react";
import Link from "next/link";

interface SidebarWidgetProps {
  block: {
    id: string;
    config?: {
      title?: string;
      widgetType?: string; // 'category_list' | 'popular_posts' | 'ad_slot'
      adCode?: string;
      limit?: number;
      // Style props
      boxColor?: string;
      boxBorderRadius?: string;
      blockTitleColor?: string;
      blockTitleFontSize?: number;
      blockTitleLineHeight?: number;
      blockTitleBorderColor?: string;
      titleColor?: string;
      titleFontSize?: number;
      titleLineHeight?: number;
      metaColor?: string;
      metaFontSize?: number;
    };
  };
  posts?: any[];
  categories?: any[];
  customTitle?: string;
  accentColor?: string;
}

export default function SidebarWidget({ block, posts, categories, customTitle, accentColor }: SidebarWidgetProps) {
  const { config } = block;
  const title = customTitle || config?.title || "Widget Sidebar";
  const widgetType = config?.widgetType || "popular_posts"; // Default popular
  const limit = config?.limit || 5;
  const effectiveAccent = accentColor || 'var(--accent)';
  const showTitle = (config as any)?.showTitle !== false;

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
      marginBottom: '1.5rem',
      position: 'relative' as const
  };

  const renderContent = () => {
    switch (widgetType) {
      case "category_list":
        if (!categories || categories.length === 0) return <p className="text-[var(--fg-muted)] text-sm">Tidak ada kategori.</p>;
        return (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link 
                    href={`/${cat.slug}`} 
                    className="flex items-center justify-between transition-colors group"
                    style={{ color: 'var(--fg-secondary)' }}
                >
                  <span className="group-hover:text-[var(--accent)] transition-colors">{cat.name}</span>
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full transition-colors"
                    style={{ 
                        backgroundColor: 'var(--bg-subtle)',
                        color: 'var(--fg-muted)'
                    }}
                  >
                      {cat._count?.posts || 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        );

      case "ad_slot":
        return (
            <div 
                className="rounded flex items-center justify-center min-h-[250px] text-sm border"
                style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border)',
                    color: 'var(--fg-muted)'
                }}
            >
                {config?.adCode ? (
                    <div dangerouslySetInnerHTML={{ __html: config.adCode }} />
                ) : (
                    <span>Iklan (Space Iklan)</span>
                )}
            </div>
        );

      case "popular_posts":
      default:
        if (!posts || posts.length === 0) return <p className="text-[var(--fg-muted)] text-sm">Belum ada berita populer.</p>;
        
        return (
          <div className="space-y-4">
            {posts.slice(0, limit).map((post, index) => {
               const postLink = post.category ? `/${post.category.slug}/${post.slug}` : `/post/${post.slug}`;
               return (
                  <article key={post.id} className="flex gap-3 group">
                    <span 
                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center font-bold text-xs rounded-full transition-colors group-hover:text-white"
                        style={{
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--fg-muted)'
                        }}
                    >
                        {index + 1}
                    </span>
                    {/* Inject hover style for this specific element since we can't easily use group-hover with dynamic var in style prop */}
                    <style jsx>{`
                        .group:hover span {
                            background-color: var(--accent) !important;
                            color: #ffffff !important;
                        }
                    `}</style>
                    <div className="flex-grow">
                        <h4 
                            className="font-medium text-sm transition-colors line-clamp-2 leading-snug mb-1 group-hover:text-[var(--home-hover-color)]"
                            style={{
                                color: config?.titleColor || 'var(--home-title-color)',
                                fontSize: config?.titleFontSize ? `${config.titleFontSize}px` : '0.875rem',
                                lineHeight: config?.titleLineHeight || 1.4
                            }}
                        >
                            <Link href={postLink}>
                                {post.title}
                            </Link>
                        </h4>
                        <div 
                            className="flex items-center gap-2 text-[10px]"
                            style={{ 
                                color: config?.metaColor || 'var(--home-meta-color)',
                                fontSize: config?.metaFontSize ? `${config.metaFontSize}px` : '0.75rem'
                            }}
                        >
                            {post.category && (
                                <Link 
                                    href={`/${post.category.slug}`} 
                                    className="hover:underline"
                                    style={{ color: 'var(--accent)' }}
                                >
                                    {post.category.name}
                                </Link>
                            )}
                            <span>•</span>
                            <time>{new Date(post.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</time>
                        </div>
                    </div>
                  </article>
               );
            })}
          </div>
        );
    }
  };

  return (
    <div className="mb-6" style={containerStyle}>
      {showTitle && (
        <h3 style={titleStyle}>
            {title}
        </h3>
      )}
      {renderContent()}
    </div>
  );
}
