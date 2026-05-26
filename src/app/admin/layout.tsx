"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import BottomNav from "@/components/admin/BottomNav";
import { ThemeProvider } from "@/components/admin/ThemeProvider";
import "@/styles/admin-theme.css";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove("public-dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  useEffect(() => {
    if (isLoginPage) return;
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
  }, [isLoginPage]);

  const forbiddenPrefixes = useMemo(() => {
    if (!role) return [];
    if (role === "SUPER_ADMIN") return [];
    if (role === "ADMIN") return [];
    if (role === "EDITOR") return ["/admin/users", "/admin/settings", "/admin/appearance", "/admin/homepage", "/admin/tools", "/admin/ads"];
    return ["/admin/users", "/admin/settings", "/admin/appearance", "/admin/homepage", "/admin/tools", "/admin/ads", "/admin/pages", "/admin/categories"];
  }, [role]);

  useEffect(() => {
    if (isLoginPage) return;
    if (!role) return;
    if (forbiddenPrefixes.some((p) => pathname.startsWith(p))) {
      router.replace("/admin/dashboard");
    }
  }, [forbiddenPrefixes, isLoginPage, pathname, role, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var cookieTheme = null;
                try {
                  var parts = document.cookie ? document.cookie.split(';') : [];
                  for (var i = 0; i < parts.length; i++) {
                    var p = parts[i].trim();
                    if (p.indexOf('admin-theme=') === 0) {
                      cookieTheme = decodeURIComponent(p.substring('admin-theme='.length));
                      break;
                    }
                  }
                } catch (e) {}
                var storedTheme = cookieTheme || localStorage.getItem('admin-theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `,
        }}
      />
      <ThemeProvider>
        <div className="admin-theme flex h-[100dvh] overflow-hidden" suppressHydrationWarning>
          {/* Sidebar (Desktop Only) */}
          <Sidebar />

          {/* Main Content */}
          <div className="main-shell flex-1 flex flex-col min-w-0 h-[100dvh]">
            <div className="flex-1 overflow-y-auto">
              <AdminHeader />
              <main className="pb-24 md:pb-0">
                {children}
              </main>
            </div>
          </div>

          {/* Bottom Navigation (Mobile Only) */}
          <BottomNav />
        </div>
      </ThemeProvider>
    </>
  );
}
