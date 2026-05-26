"use client";

import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import Link from "next/link";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Poll for unread count every 30s
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCount = async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      // Update UI optimistically
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
        await fetch("/api/notifications/mark-read", {
          method: "POST",
          body: JSON.stringify({ id: "all" }),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      } catch (err) {
        console.error(err);
      }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="btn btn-ghost p-2 relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[var(--bg-base)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[var(--bg-elevated)] rounded-xl shadow-lg border border-[var(--border)] z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-surface)]">
              <h3 className="font-bold text-[var(--fg-primary)]">Notifikasi</h3>
              {unreadCount > 0 && (
                <button 
                    onClick={markAllRead}
                    className="text-xs text-[var(--accent)] hover:underline font-medium"
                >
                    Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-[var(--fg-muted)] text-sm">Memuat...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-[var(--fg-muted)] text-sm">Tidak ada notifikasi baru</div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-[var(--bg-surface)] transition-colors relative group ${!notif.read ? "bg-[var(--accent-subtle)]" : ""}`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!notif.read ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
                        <div className="flex-1">
                          <Link 
                            href={notif.link || "#"} 
                            onClick={() => !notif.read && markAsRead(notif.id)}
                            className="block"
                          >
                            <h4 className={`text-sm ${!notif.read ? "font-bold text-[var(--fg-primary)]" : "font-medium text-[var(--fg-secondary)]"}`}>{notif.title}</h4>
                            <p className="text-xs text-[var(--fg-muted)] mt-1 line-clamp-2">{notif.message}</p>
                            <span className="text-[10px] text-[var(--fg-muted)] mt-2 block">
                              {new Date(notif.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </Link>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="opacity-0 group-hover:opacity-100 text-[var(--fg-muted)] hover:text-[var(--accent)] transition-all p-1"
                            title="Tandai sudah dibaca"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
