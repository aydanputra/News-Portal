"use client";

import { useEffect, useRef, useState } from "react";
import { Search, LayoutDashboard, Eye } from "lucide-react";
import ThemeToggle from "@/components/admin/ThemeToggle";
import NotificationBell from "@/components/admin/NotificationBell";
import { useAdminSession } from "@/components/admin/AdminSessionContext";

export default function AdminHeader() {
  const headerRef = useRef<HTMLElement | null>(null);
  const { user } = useAdminSession();
  const [updateInfo, setUpdateInfo] = useState<{
    currentVersion: string;
    latestVersion: string | null;
    updateAvailable: boolean;
    changelogUrl: string | null;
  } | null>(null);
  const canCheckUpdate = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!canCheckUpdate) return;

    let active = true;
    let idleCallbackId: number | null = null;
    let timeoutId: number | null = null;
    const loadUpdateInfo = () => {
      fetch("/api/admin/version")
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => {
          if (!active || !json) return;
          setUpdateInfo({
            currentVersion: String(json.currentVersion || "unknown"),
            latestVersion: typeof json.latestVersion === "string" ? json.latestVersion : null,
            updateAvailable: Boolean(json.updateAvailable),
            changelogUrl: typeof json.changelogUrl === "string" ? json.changelogUrl : null,
          });
        })
        .catch(() => null);
    };

    if (typeof window !== "undefined") {
      const idleWindow = window as Window &
        typeof globalThis & {
          requestIdleCallback?: (
            callback: IdleRequestCallback,
            options?: IdleRequestOptions,
          ) => number;
          cancelIdleCallback?: (handle: number) => void;
        };

      if (typeof idleWindow.requestIdleCallback === "function") {
        idleCallbackId = idleWindow.requestIdleCallback(loadUpdateInfo, { timeout: 1500 });
      } else {
        timeoutId = window.setTimeout(loadUpdateInfo, 400);
      }
    }

    return () => {
      active = false;
      if (timeoutId !== null && typeof window !== "undefined") {
        window.clearTimeout(timeoutId);
      }
      if (idleCallbackId !== null && typeof window !== "undefined") {
        const idleWindow = window as Window &
          typeof globalThis & {
            cancelIdleCallback?: (handle: number) => void;
          };
        if (typeof idleWindow.cancelIdleCallback === "function") {
          idleWindow.cancelIdleCallback(idleCallbackId);
        }
      }
    };
  }, [canCheckUpdate]);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const height = headerRef.current?.offsetHeight ?? 64;
      document.documentElement.style.setProperty("--admin-header-height", `${height}px`);
    };

    updateHeaderHeight();

    if (!headerRef.current || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeaderHeight);
      return () => {
        window.removeEventListener("resize", updateHeaderHeight);
      };
    }

    const observer = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    observer.observe(headerRef.current);
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeaderHeight);
    };
  }, [updateInfo?.updateAvailable]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-[var(--border)] backdrop-blur-lg bg-[color:var(--bg-base)/0.8]"
    >
      {updateInfo?.updateAvailable && (
        <div className="px-4 md:px-6 py-2 border-b border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[12px] text-[var(--fg-secondary)]">
              Update CMS tersedia: <span className="font-bold text-[var(--fg-primary)]">{updateInfo.latestVersion}</span>{" "}
              <span className="text-[var(--fg-muted)]">(saat ini: {updateInfo.currentVersion})</span>
            </div>
            {updateInfo.changelogUrl ? (
              <a
                href={updateInfo.changelogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-bold text-[var(--accent)] hover:underline"
              >
                Lihat Rilis
              </a>
            ) : null}
          </div>
        </div>
      )}
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
