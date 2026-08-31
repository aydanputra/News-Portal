"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cog, FileText, Plus, Tags, User, BarChart3, Save } from "lucide-react";
import { useAdminSession } from "@/components/admin/AdminSessionContext";

export default function BottomNav({ roleOverride }: { roleOverride?: string | null }) {
  const pathname = usePathname();
  const { user } = useAdminSession();
  const effectiveRole = roleOverride || user?.role || "WRITER";
  const showSettings = effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
  const showCategories = effectiveRole === "EDITOR";
  const showAnalytics = effectiveRole === "EDITOR" || effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
  const isPostEditorPage = pathname === "/admin/posts/new" || /^\/admin\/posts\/[^/]+\/edit$/.test(pathname);
  const submitLabel = pathname === "/admin/posts/new" ? "Simpan atau publish berita" : "Simpan perubahan berita";

  return (
    <div className="bottom-nav hide-desktop">
      <div className="mx-auto grid h-full max-w-lg grid-cols-5 items-end gap-1 px-2 pb-[max(6px,env(safe-area-inset-bottom))] pt-2">
        <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dasbor" active={pathname === "/admin/dashboard"} />
        <NavItem href="/admin/posts" icon={<FileText size={20} />} label="Artikel" active={pathname.startsWith("/admin/posts") && pathname !== "/admin/posts/new"} />

        <div className="relative flex items-start justify-center">
          {isPostEditorPage ? (
            <button
              type="submit"
              form="post-editor-form"
              aria-label={submitLabel}
              title={submitLabel}
              className="flex h-14 w-14 -translate-y-5 items-center justify-center rounded-full border-4 border-[var(--bg-base)] bg-[var(--accent)] text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:bg-[var(--accent-hover)] active:scale-95"
            >
              <Save size={24} />
            </button>
          ) : (
            <Link
              href="/admin/posts/new"
              aria-label="Tulis berita baru"
              className="flex h-14 w-14 -translate-y-5 items-center justify-center rounded-full border-4 border-[var(--bg-base)] bg-[var(--accent)] text-black shadow-lg shadow-amber-500/30 transition-all hover:scale-105 hover:bg-[var(--accent-hover)] active:scale-95"
            >
              <Plus size={28} />
            </Link>
          )}
        </div>

        {showAnalytics ? (
          <NavItem href="/admin/analytics" icon={<BarChart3 size={20} />} label="Laporan" active={pathname.startsWith("/admin/analytics")} />
        ) : (
          <div aria-hidden="true" />
        )}
        {showSettings ? (
          <NavItem href="/admin/settings" icon={<Cog size={20} />} label="Pengaturan" active={pathname === "/admin/settings"} />
        ) : showCategories ? (
          <NavItem href="/admin/categories" icon={<Tags size={20} />} label="Kategori" active={pathname.startsWith("/admin/categories")} />
        ) : (
          <NavItem href="/admin/profile" icon={<User size={20} />} label="Profil" active={pathname.startsWith("/admin/profile")} />
        )}
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-center transition-colors ${
        active ? "bg-[var(--bg-surface)] text-[var(--accent)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
      }`}
    >
      <div className={`transition-transform ${active ? "-translate-y-0.5" : ""}`}>{icon}</div>
      <span className={`text-[10px] font-bold leading-none ${active ? "opacity-100" : "opacity-80"}`}>{label}</span>
    </Link>
  );
}
