"use client";

import React from "react";
import Link from "next/link";

interface TagCloudProps {
  block: {
    id: string;
    config?: {
      title?: string;
      limit?: number;
      // Style props
      boxColor?: string;
      boxBorderRadius?: string;
      blockTitleColor?: string;
      blockTitleFontSize?: number;
      blockTitleLineHeight?: number;
      blockTitleBorderColor?: string;
      tagBgColor?: string;
      tagColor?: string;
      tagHoverBgColor?: string;
      tagHoverColor?: string;
    };
  };
  posts?: any[];
  customTitle?: string;
  accentColor?: string;
}

// Helper untuk mengekstrak tags dari posts jika tidak ada data tags khusus
function getTagsFromPosts(posts: any[]) {
    // ... (kode sama)
    const tagsMap = new Map();
    posts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach((tag: any) => {
                if (!tagsMap.has(tag.slug)) {
                    tagsMap.set(tag.slug, { name: tag.name, count: 0 });
                }
                const t = tagsMap.get(tag.slug);
                if (t) t.count++;
            });
        }
    });
    return Array.from(tagsMap.values()).sort((a: any, b: any) => b.count - a.count);
}

export default function TagCloud({ block, posts, customTitle, accentColor }: TagCloudProps) {
  const { config } = block;
  const title = customTitle || config?.title || "Tag Populer";
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
      '--accent': effectiveAccent // Inject local override
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

  let tags: any[] = [];

  if (posts && posts.length > 0) {
      if ('name' in posts[0] && !('title' in posts[0])) {
          tags = posts;
      } else {
          tags = getTagsFromPosts(posts);
      }
  }

  if (tags.length === 0) {
      return (
          <div className="mb-6" style={containerStyle}>
              {showTitle && <h3 style={titleStyle}>{title}</h3>}
              <p className="text-[var(--fg-muted)] text-sm">Belum ada tag.</p>
          </div>
      );
  }

  return (
    <div className="mb-6" style={containerStyle}>
      {showTitle && (
        <h3 style={titleStyle}>
            {title}
        </h3>
      )}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link 
            key={tag.name} 
            href={`/tag/${tag.name.toLowerCase().replace(/\s+/g, '-')}`} 
            className="px-3 py-1 text-xs rounded transition-colors group"
            style={{
                backgroundColor: config?.tagBgColor || 'var(--bg-subtle)',
                color: config?.tagColor || 'var(--fg-secondary)',
            }}
          >
            #{tag.name}
          </Link>
        ))}
      </div>
      
      {/* Inject Hover Styles dynamically for this block instance if needed, or rely on global classes */}
      <style jsx>{`
        a:hover {
            background-color: ${config?.tagHoverBgColor || 'var(--accent)'} !important;
            color: ${config?.tagHoverColor || '#ffffff'} !important;
        }
      `}</style>
    </div>
  );
}
