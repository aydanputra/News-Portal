"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Cog, FileText, Image as ImageIcon, Plus, Tags, User } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active) return;
        setRole(data?.role || null);
      })
      .catch(() => {
        if (!active) return;
        setRole(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const effectiveRole = role || "WRITER";
  const showSettings = effectiveRole === "ADMIN" || effectiveRole === "SUPER_ADMIN";
  const showCategories = effectiveRole === "EDITOR";

  return (
    <div className="bottom-nav hide-desktop">
      <div className="flex justify-around items-center h-full max-w-md mx-auto relative px-2">
        {/* Dashboard (icon standard) */}
        <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Dasbor" active={pathname === "/admin/dashboard"} />
        {/* Artikel */}
        <NavItem href="/admin/posts" icon={<FileText size={20} />} label="Artikel" active={pathname.startsWith("/admin/posts") && pathname !== "/admin/posts/new"} />
        
        {/* FAB Create */}
        <div className="relative -top-6">
            <Link 
                href="/admin/posts/new"
                className="flex items-center justify-center w-14 h-14 bg-[var(--accent)] rounded-full text-black shadow-lg shadow-amber-500/30 hover:bg-[var(--accent-hover)] hover:scale-105 transition-all active:scale-95 border-4 border-[var(--bg-base)]"
            >
                <Plus size={28} />
            </Link>
        </div>
        
        {/* Image */}
        <NavItem href="/admin/media" icon={<ImageIcon size={20} />} label="Gambar" active={pathname.startsWith("/admin/media")} />
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
      className={`flex flex-col items-center justify-center py-1 px-2 min-w-[64px] rounded-lg transition-colors ${active ? "text-[var(--accent)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"}`}
    >
      <div className={`mb-1 transition-transform ${active ? "-translate-y-1" : ""}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold leading-none ${active ? "opacity-100" : "opacity-70"}`}>{label}</span>
    </Link>
  );
}
