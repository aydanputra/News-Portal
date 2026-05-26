"use client";

import { Search, LayoutDashboard, Eye } from "lucide-react";
import ThemeToggle from "@/components/admin/ThemeToggle";
import NotificationBell from "@/components/admin/NotificationBell";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] backdrop-blur-lg bg-[color:var(--bg-base)/0.8]">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-3 hide-desktop">
          <div className="w-8 h-8 rounded-md bg-[var(--accent)] flex items-center justify-center text-black">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="font-display font-bold">NewsCMS</span>
        </div>

        <div className="relative hide-mobile w-96">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
          <input 
            type="text" 
            placeholder="Cari artikel, media, pengguna..." 
            className="input input-search pr-4 py-2.5 w-full"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <NotificationBell />
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-ghost p-2"
            title="Lihat Website"
          >
            <Eye className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
