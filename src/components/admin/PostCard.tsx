import Link from "next/link";
import { Edit, ExternalLink, Eye, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  slug?: string;
  status?: string;
  published: boolean;
  publishedAt?: string | null;
  updatedAt: string;
  type?: string | null;
  author: {
    name: string;
  };
  category: {
    name: string;
    slug?: string;
  };
  image?: string | null;
  featuredImage?: {
    fileUrl: string;
  } | null;
  views?: number;
  viewsBase?: number;
}

interface PostCardProps {
  post: Post;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
  showActions?: boolean;
  hoverActions?: boolean;
  customActions?: React.ReactNode;
}

export default function PostCard({ post, onDelete, showDelete = false, showActions = true, hoverActions = true, customActions }: PostCardProps) {
  const thumbnail = post.featuredImage?.fileUrl || post.image || null;
  const viewRealCount = typeof post.views === "number" && Number.isFinite(post.views) ? post.views : 0;
  const viewBaseCount = typeof post.viewsBase === "number" && Number.isFinite(post.viewsBase) ? post.viewsBase : 0;
  const viewCount = Math.max(0, Math.floor(viewRealCount + viewBaseCount));
  const typeLabel = (post.type || "ARTICLE").toUpperCase();
  const isVideo = typeLabel === "VIDEO";
  const isPublished = (post.status || "").toUpperCase() === "PUBLISHED" || post.published;
  const categorySlug = post.category?.slug;
  const postSlug = post.slug;
  const viewHref =
    isPublished && categorySlug && postSlug ? `/${categorySlug}/${postSlug}` : `/admin/posts/${post.id}/edit`;

  return (
    <div className="card p-4 md:p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between group hover:border-[var(--fg-muted)] transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Thumbnail */}
        <div className="w-16 h-12 rounded-lg bg-[var(--bg-surface)] flex-shrink-0 overflow-hidden relative border border-[var(--border)]">
          {thumbnail ? (
            <Image 
              src={thumbnail} 
              alt={post.title} 
              fill 
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--fg-muted)]">
              <span className="text-[10px] font-medium">Tidak Ada Gambar</span>
            </div>
          )}
          {isVideo && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4 translate-x-[0.5px]">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link href={`/admin/posts/${post.id}/edit`} className="block group/link">
            <h3 className="font-semibold text-[var(--fg-primary)] group-hover/link:text-[var(--accent)] transition-colors line-clamp-1 mb-1">
              {post.title}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)] flex-wrap">
            <span className="font-medium text-[var(--fg-secondary)]">{post.author.name}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--fg-muted)]"></span>
            <span>{new Date(post.publishedAt || post.updatedAt).toLocaleDateString("id-ID", {
              day: 'numeric', month: 'short'
            })}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--fg-muted)]"></span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {viewCount}
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--fg-muted)]"></span>
            <span className="px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--fg-secondary)] font-semibold">
              {post.category?.name}
            </span>
            <span className="px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--fg-secondary)] font-semibold">
              {typeLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0 pt-3 md:pt-0 border-t border-[var(--border)] md:border-0">
        <StatusBadge status={post.status || (post.published ? 'PUBLISHED' : 'DRAFT')} published={post.published} />
        
        {showActions && (
          <div className={`flex items-center gap-1 ${hoverActions ? "md:opacity-0 md:group-hover:opacity-100" : ""} transition-opacity`}>
            {customActions}
            <Link 
              href={viewHref}
              target="_blank"
              className="p-2 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
              title={isPublished ? "Lihat" : "Buka Editor"}
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
            <Link 
              href={`/admin/posts/${post.id}/edit`} 
              className="p-2 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
              title="Ubah"
            >
              <Edit className="w-4 h-4" />
            </Link>
            {showDelete && onDelete && (
              <button 
                onClick={() => onDelete(post.id)}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
