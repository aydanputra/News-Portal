"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Zap, Newspaper, Tags, Settings, Image as ImageIcon, Megaphone, Palette, ChevronDown, ChevronRight, Users, LogOut, User, HelpCircle, Wrench, FileText, BarChart3 } from "lucide-react";

import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(true);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const initials = useMemo(() => {
    const name = userName || "Admin User";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] || "A";
    const second = parts[1]?.[0] || "D";
    return (first + second).toUpperCase();
  }, [userName]);

  const effectiveRole = userRole || "WRITER";
  const canSeeUsers = effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
  const canSeeSettings = effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
  const canSeeAds = effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
  const canSeeAppearance = effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
  const canSeeTools = effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
  const canSeePages = effectiveRole !== "WRITER";
  const canSeeCategories = effectiveRole !== "WRITER";
  const canSeeAnalytics = effectiveRole !== "WRITER";
  const roleLabel =
    effectiveRole === "SUPER_ADMIN"
      ? "Super Admin"
      : effectiveRole === "ADMIN"
        ? "Admin"
        : effectiveRole === "EDITOR"
          ? "Editor"
          : "Penulis";

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!active || !data) return;
        setUserName(data.name || null);
        setUserRole(data.role || null);
        
        // Also fetch profile detail to get avatar if not in auth/me
        // Assuming auth/me might just return session info
        fetch("/api/profile")
            .then(r => (r.ok ? r.json() : null))
            .then(profile => {
                if (active && profile?.avatar) {
                    setUserAvatar(profile.avatar);
                }
            })
            .catch(() => {});
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/admin/settings")) {
      setIsSettingsOpen(true);
    }
  }, [pathname]);

  const rawTab = searchParams.get("tab");
  const settingsTab = pathname === "/admin/settings" 
    ? (rawTab === "insert-code" || rawTab === "notifications" ? rawTab : "general") 
    : "general";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <aside className="w-[var(--sidebar-width)] bg-[var(--bg-elevated)] border-r border-[var(--border)] hidden md:flex flex-col flex-shrink-0 z-[100] h-full fixed left-0 top-0 bottom-0">
      <div className="p-6 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
             <Zap size={20} className="text-black" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-[var(--fg-primary)]">Panel CMS</h1>
            <p className="text-xs text-[var(--fg-muted)]">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        <NavItem href="/admin/dashboard" icon={<Zap size={20} />} label="Dasbor" active={pathname === "/admin/dashboard"} />
        <NavItem href="/admin/posts" icon={<Newspaper size={20} />} label="Berita" active={pathname.startsWith("/admin/posts")} />
        {canSeeAnalytics && (
          <NavItem href="/admin/analytics" icon={<BarChart3 size={20} />} label="Laporan & Analytics" active={pathname.startsWith("/admin/analytics")} />
        )}
        {canSeePages && (
          <NavItem href="/admin/pages" icon={<FileText size={20} />} label="Halaman Statis" active={pathname.startsWith("/admin/pages")} />
        )}
        {canSeeCategories && (
          <NavItem href="/admin/categories" icon={<Tags size={20} />} label="Kategori" active={pathname.startsWith("/admin/categories")} />
        )}
        <NavItem href="/admin/media" icon={<ImageIcon size={20} />} label="Media" active={pathname.startsWith("/admin/media")} />
        {canSeeAds && (
          <NavItem href="/admin/ads" icon={<Megaphone size={20} />} label="Iklan & Banner" active={pathname.startsWith("/admin/ads")} />
        )}
        {canSeeUsers && (
          <NavItem href="/admin/users" icon={<Users size={20} />} label="Pengguna" active={pathname.startsWith("/admin/users")} />
        )}
        
        {canSeeAppearance && (
          <div className="mx-3 mt-1">
            <button 
                onClick={() => setIsAppearanceOpen(!isAppearanceOpen)}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium rounded-lg transition-colors ${pathname.startsWith("/admin/appearance") || pathname === "/admin/homepage" ? "text-[var(--accent)] bg-[var(--accent-subtle)]" : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"}`}
            >
                <div className="flex items-center gap-3.5">
                    <Palette size={20} />
                    <span>Tampilan</span>
                </div>
                {isAppearanceOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {isAppearanceOpen && (
                <div className="mt-1 space-y-1">
                    <NavItem href="/admin/appearance/global-styles" label="Pengaturan Global" active={pathname === "/admin/appearance/global-styles"} size="sm" />
                    <NavItem href="/admin/appearance/header" label="Header" active={pathname === "/admin/appearance/header"} size="sm" />
                    <NavItem href="/admin/homepage" label="Pembangun Beranda" active={pathname === "/admin/homepage"} size="sm" />
                    <NavItem href="/admin/appearance/post" label="Pembangun Postingan" active={pathname === "/admin/appearance/post"} size="sm" />
                    <NavItem href="/admin/appearance/archive" label="Pembangun Arsip" active={pathname === "/admin/appearance/archive"} size="sm" />
                    <NavItem href="/admin/appearance/footer" label="Kaki Halaman" active={pathname === "/admin/appearance/footer"} size="sm" />
                </div>
            )}
          </div>
        )}

        {canSeeTools && (
          <div className="mx-3 mt-1">
            <button 
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium rounded-lg transition-colors ${pathname.startsWith("/admin/tools") ? "text-[var(--accent)] bg-[var(--accent-subtle)]" : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"}`}
            >
                <div className="flex items-center gap-3.5">
                    <Wrench size={20} />
                    <span>Alat</span>
                </div>
                {isToolsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            
            {isToolsOpen && (
                <div className="mt-1 space-y-1">
                    <NavItem href="/admin/tools/import" label="Import WordPress" active={pathname === "/admin/tools/import"} size="sm" />
                    <NavItem href="/admin/tools/print" label="Print Artikel" active={pathname === "/admin/tools/print"} size="sm" />
                </div>
            )}
          </div>
        )}

        {canSeeSettings && (
          <div className="mx-3 mt-1">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium rounded-lg transition-colors ${pathname.startsWith("/admin/settings") ? "text-[var(--accent)] bg-[var(--accent-subtle)]" : "text-[var(--fg-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"}`}
            >
              <div className="flex items-center gap-3.5">
                <Settings size={20} />
                <span>Pengaturan</span>
              </div>
              {isSettingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {isSettingsOpen && (
              <div className="mt-1 space-y-1">
                <NavItem href="/admin/settings" label="Umum" active={pathname === "/admin/settings" && settingsTab === "general"} size="sm" />
                <NavItem href="/admin/settings?tab=notifications" label="Notifikasi" active={pathname === "/admin/settings" && settingsTab === "notifications"} size="sm" />
                <NavItem href="/admin/settings?tab=insert-code" label="Insert Code" active={pathname === "/admin/settings" && settingsTab === "insert-code"} size="sm" />
                <NavItem href="/admin/settings/menus" label="Menu" active={pathname === "/admin/settings/menus"} size="sm" />
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-[var(--border)] relative">
        {isUserMenuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="p-1">
              <Link href="/admin/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--fg-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors">
                <User size={16} className="text-[var(--fg-muted)]" />
                <span>Profile Saya</span>
              </Link>
              {canSeeSettings && (
                <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--fg-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors">
                  <Settings size={16} className="text-[var(--fg-muted)]" />
                  <span>Pengaturan</span>
                </Link>
              )}
              <Link href="/admin/help" className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--fg-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors">
                <HelpCircle size={16} className="text-[var(--fg-muted)]" />
                <span>Bantuan</span>
              </Link>
            </div>
            <div className="border-t border-[var(--border)] p-1">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-left"
              >
                <LogOut size={16} />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="w-full flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-base)] transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center text-black font-bold text-sm flex-shrink-0 relative overflow-hidden">
              {userAvatar ? (
                  <Image 
                      src={userAvatar} 
                      alt={userName || "User"} 
                      fill 
                      className="object-cover" 
                  />
              ) : (
                  initials
              )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate text-[var(--fg-primary)]">{userName ?? "Admin User"}</div>
            <div className="text-xs text-[var(--accent)] truncate">{userRole ?? "Administrator"}</div>
          </div>
          <div className="text-[var(--fg-muted)]">
            {isUserMenuOpen ? <ChevronDown size={16} className="rotate-180 transition-transform" /> : <ChevronDown size={16} className="transition-transform" />}
          </div>
        </button>
      </div>
    </aside>
  );
}

function NavItem({ href, icon, label, active, size = "md" }: { href: string; icon?: React.ReactNode; label: string; active?: boolean; size?: "sm" | "md" }) {
  // Logic for submenu items (size="sm") vs main items
  if (size === "sm") {
      return (
        <Link 
          href={href} 
          className={`flex items-center gap-3 px-5 py-2.5 mx-3 text-sm font-medium rounded-lg transition-colors ${active ? "text-[var(--accent)] bg-[var(--accent-subtle)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]"}`}
        >
          <span className="w-5 flex justify-center"><span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span></span>
          <span>{label}</span>
        </Link>
      );
  }

  return (
    <Link 
      href={href} 
      className={`nav-item ${active ? 'active' : ''}`}
    >
      {icon && icon}
      <span>{label}</span>
    </Link>
  );
}
