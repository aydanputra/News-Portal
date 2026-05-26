import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import Image from "next/image";
// Dark-mode friendly table using CSS variables from admin theme

interface Post {
  id: string;
  title: string;
  status: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
  type?: string | null;
  author: {
    name: string;
  };
  category: {
    name: string;
  };
  image?: string | null;
  featuredImage?: {
    fileUrl: string;
  } | null;
  views?: number;
}

interface DashboardRecentTableProps {
  posts: Post[];
  title?: string;
  hrefAll?: string;
  labelAll?: string;
  emptyLabel?: string;
}

export default function DashboardRecentTable({
  posts,
  title = "Artikel Terbaru",
  hrefAll = "/admin/posts",
  labelAll = "Lihat Semua",
  emptyLabel = "Tidak ada artikel terbaru.",
}: DashboardRecentTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-elevated)]">
        <div>
            <h3 className="font-display text-lg font-semibold text-[var(--fg-primary)]">{title}</h3>
        </div>
        <Link href={hrefAll} className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] hover:underline decoration-[var(--accent)] underline-offset-4">
          {labelAll}
        </Link>
      </div>
      
      {/* Desktop Table Layout */}
      <div className="overflow-x-auto hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-surface)] border-b border-[var(--border)]">
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)] w-16">Media</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">Detail Artikel</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">Kategori</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">Status</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)] text-right">Tanggal</th>
              <th className="px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)] text-center pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--bg-elevated)]">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[var(--fg-muted)] italic">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              posts.map((post) => {
                const thumbnail = post.featuredImage?.fileUrl || post.image || null;
                const isVideo = String(post.type || "").toUpperCase() === "VIDEO";
                
                return (
                <tr key={post.id} className="hover:bg-[var(--bg-base)] transition-colors duration-150 group">
                  <td className="px-6 py-3.5">
                     <div className="w-10 h-10 bg-[var(--bg-surface)] rounded-md overflow-hidden relative border border-[var(--border)] shadow-sm group-hover:shadow-md transition-all duration-200">
                        {thumbnail && (
                           <Image 
                              src={thumbnail} 
                              alt="" 
                              fill 
                              className="object-cover"
                              sizes="40px"
                           />
                        )}
                        {isVideo && (
                          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-3.5 w-3.5 translate-x-[0.5px]">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </span>
                          </span>
                        )}
                     </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-0.5">
                        <Link href={`/admin/posts/${post.id}/edit`} className="font-semibold text-[var(--fg-primary)] hover:text-[var(--accent)] line-clamp-1 leading-snug text-sm transition-colors">
                          {post.title}
                        </Link>
                        <span className="text-xs text-[var(--fg-muted)] font-medium">{post.author.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-xs font-semibold text-[var(--fg-secondary)] bg-[var(--bg-surface)] px-2 py-1 rounded-md border border-[var(--border)]">
                        {post.category.name}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={post.status} published={post.published} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-xs text-[var(--fg-muted)] text-right font-medium uppercase tracking-wide tabular-nums">
                    {new Date(post.publishedAt || post.updatedAt).toLocaleDateString("id-ID", {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap text-center">
                    <Link 
                        href={`/admin/posts/${post.id}/edit`} 
                        className="p-2 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
                        title="Ubah"
                    >
                        <MoreHorizontal size={18} />
                    </Link>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout Fallback */}
       <div className="md:hidden">
            {posts.length === 0 ? (
              <div className="px-6 py-10 text-center text-[var(--fg-muted)] italic">
                {emptyLabel}
              </div>
            ) : (
              posts.map((post) => (
                  <div key={post.id} className="px-4">
                      <div className="py-3 border-b border-[var(--border)]">
                          <Link href={`/admin/posts/${post.id}/edit`} className="font-medium text-sm text-[var(--fg-primary)]">{post.title}</Link>
                      </div>
                  </div>
              ))
            )}
       </div>
    </div>
  );
}
