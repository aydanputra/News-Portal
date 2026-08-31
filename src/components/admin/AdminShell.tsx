"use client";

import { useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import BottomNav from "@/components/admin/BottomNav";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string | null;
}) {
  useEffect(() => {
    document.documentElement.classList.remove("public-dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <div className="admin-theme flex h-[100dvh] overflow-hidden" suppressHydrationWarning>
      <Sidebar roleOverride={role} />
      <div className="main-shell flex-1 flex flex-col min-w-0 h-[100dvh]">
        <div id="admin-main-scroll-container" className="flex-1 overflow-y-auto">
          <AdminHeader />
          <main className="pb-[calc(var(--admin-bottom-nav-height,78px)+env(safe-area-inset-bottom)+20px)] md:pb-0">{children}</main>
        </div>
      </div>
      <BottomNav roleOverride={role} />
    </div>
  );
}
