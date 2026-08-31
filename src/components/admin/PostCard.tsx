import Link from "next/link";
import { Edit, ExternalLink, Eye, Trash2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import Image from "next/image";
import AdminPostShareButton from "./AdminPostShareButton";
import type { AutoShareSettings } from "@/lib/auto-share";

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
  autoShareSettings?: AutoShareSettings | null;
}

export default function PostCard({
  post,
  onDelete,
  showDelete = false,
  showActions = true,
  hoverActions = true,
  customActions,
  autoShareSettings = null,
}: PostCardProps) {
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
    <div className="card p-3.5 md:p-4 flex flex-col md:flex-row gap-3 md:items-center justify-between group hover:border-[var(--fg-muted)] transition-colors">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Thumbnail */}
        <div className="w-14 h-11 rounded-lg bg-[var(--bg-surface)] flex-shrink-0 overflow-hidden relative border border-[var(--border)] md:w-16 md:h-12">
          {thumbnail ? (
            <Image 
              src={thumbnail} 
              alt={post.title} 
              fill 
              className="object-cover"
              sizes="(max-width: 768px) 56px, 64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--fg-muted)]">
              <span className="text-[10px] font-medium">Tidak Ada Gambar</span>
            </div>
          )}
          {isVideo && (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm md:h-7 md:w-7">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5 translate-x-[0.5px] md:h-4 md:w-4">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link href={`/admin/posts/${post.id}/edit`} className="block group/link">
            <h3 className="mb-1 text-[15px] font-semibold leading-[1.25] text-[var(--fg-primary)] group-hover/link:text-[var(--accent)] transition-colors line-clamp-1 md:text-base">
              {post.title}
            </h3>
          </Link>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] leading-4 text-[var(--fg-muted)] md:text-[11px]">
              <span className="font-medium text-[var(--fg-secondary)]">{post.author.name}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--fg-muted)]"></span>
              <span>{new Date(post.publishedAt || post.updatedAt).toLocaleDateString("id-ID", {
                day: 'numeric', month: 'short'
              })}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--fg-muted)]"></span>
              <span className="flex items-center gap-1">
                <Eye className="h-2.5 w-2.5 md:h-3 md:w-3" /> {viewCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-[0.02em] text-[var(--fg-secondary)] md:text-[10px]">
              {post.category?.name}
              </span>
              <span className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[9px] font-semibold uppercase leading-none tracking-[0.02em] text-[var(--fg-secondary)] md:text-[10px]">
              {typeLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-1.5 border-t border-[var(--border)] pt-2 md:mt-0 md:justify-end md:gap-2 md:border-0 md:pt-0">
        <div className="flex items-center gap-1.5">
          <AdminPostShareButton post={post} settings={autoShareSettings} compact />
          <StatusBadge status={post.status || (post.published ? 'PUBLISHED' : 'DRAFT')} published={post.published} compact />
        </div>
        
        {showActions && (
          <div className={`flex items-center gap-0 ${hoverActions ? "md:opacity-0 md:group-hover:opacity-100" : ""} transition-opacity`}>
            {customActions}
            <Link 
              href={viewHref}
              target="_blank"
              className="rounded-lg p-1 text-[var(--fg-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent)] transition-colors md:p-1.5"
              title={isPublished ? "Lihat" : "Buka Editor"}
            >
              <ExternalLink className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </Link>
            <Link 
              href={`/admin/posts/${post.id}/edit`} 
              className="rounded-lg p-1 text-[var(--fg-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent)] transition-colors md:p-1.5"
              title="Ubah"
            >
              <Edit className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </Link>
            {showDelete && onDelete && (
              <button 
                onClick={() => onDelete(post.id)}
                className="rounded-lg p-1 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors md:p-1.5"
                title="Hapus"
              >
                <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
