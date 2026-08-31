"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, Save, Send, Share2, Wrench } from "lucide-react";
import {
  AUTO_SHARE_PLATFORM_OPTIONS,
  DEFAULT_AUTO_SHARE_SETTINGS,
  hasAnyAutoShareTarget,
  type AutoShareSettings,
} from "@/lib/auto-share";

export default function AutoSharePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [settings, setSettings] = useState<AutoShareSettings>(DEFAULT_AUTO_SHARE_SETTINGS);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const enabledCount = useMemo(
    () =>
      AUTO_SHARE_PLATFORM_OPTIONS.filter((option) => Boolean(settings[option.key]))
        .length,
    [settings],
  );
  const autoTargetCount = useMemo(() => {
    let count = 0;
    if (settings.autoPublishFacebookPage && settings.facebookPageId && settings.facebookPageAccessTokenConfigured) count++;
    if (settings.autoPublishTelegramChannel && settings.telegramChannelChatId && settings.telegramBotTokenConfigured) count++;
    return count;
  }, [settings]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/tools/auto-share", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (res.status === 403) {
        setEnabled(false);
        return;
      }
      if (!res.ok) {
        throw new Error(json?.error || "Gagal memuat pengaturan Auto Share.");
      }
      setEnabled(true);
      setSettings(json?.settings || DEFAULT_AUTO_SHARE_SETTINGS);
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Gagal memuat pengaturan Auto Share." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/tools/auto-share", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || "Gagal menyimpan pengaturan Auto Share.");
      }
      setSettings(json?.settings || settings);
      setMessage({ type: "success", text: "Pengaturan Auto Share berhasil disimpan." });
    } catch (error: any) {
      setMessage({ type: "error", text: error?.message || "Gagal menyimpan pengaturan Auto Share." });
    } finally {
      setSaving(false);
    }
  };

  if (!enabled && !loading) {
    return (
      <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen">
        <div className="card p-6">
          <div className="font-display text-lg font-bold text-[var(--fg-primary)] flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Auto Share
          </div>
          <div className="mt-3 text-sm text-[var(--fg-muted)]">Fitur ini belum diaktifkan untuk website ini.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[var(--bg-base)] min-h-screen">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[var(--accent)] p-2 text-white">
            <Share2 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--fg-primary)]">Auto Share</h1>
            <p className="text-sm text-[var(--fg-muted)]">
              Fokus 3 kanal: Facebook Fanspage otomatis, Telegram Channel otomatis, lalu WhatsApp Channel manual.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => void loadData()} className="btn btn-secondary inline-flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button type="button" onClick={handleSave} disabled={saving || loading} className="btn btn-primary inline-flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </div>

      {message ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-rose-300 bg-rose-50 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      ) : null}

      {loading ? (
        <div className="card p-8 flex items-center justify-center text-[var(--fg-muted)] gap-3">
          <Loader2 size={18} className="animate-spin" />
          Memuat pengaturan Auto Share...
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="card p-5 space-y-5">
            <div>
              <div className="text-base font-bold text-[var(--fg-primary)]">Template Teks Share</div>
              <p className="mt-1 text-xs text-[var(--fg-muted)]">
                Gunakan placeholder <code>{"{title}"}</code>, <code>{"{category}"}</code>, dan <code>{"{url}"}</code>.
              </p>
            </div>

            <textarea
              className="input min-h-[120px] w-full"
              value={settings.shareTextTemplate}
              onChange={(e) => setSettings((prev) => ({ ...prev, shareTextTemplate: e.target.value }))}
              placeholder="{title}"
            />

            <div>
              <div className="mb-3 text-base font-bold text-[var(--fg-primary)]">Share Link Manual</div>
              <p className="mb-3 text-xs text-[var(--fg-muted)]">
                Manual share difokuskan ke WhatsApp Channel. Saat tombol <code>Share</code> ditekan, sistem akan menjalankan auto share yang aktif lalu membuka WhatsApp Channel manual.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {AUTO_SHARE_PLATFORM_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
                  >
                    <span className="text-sm font-medium text-[var(--fg-primary)]">{option.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[option.key])}
                      onChange={(e) => setSettings((prev) => ({ ...prev, [option.key]: e.target.checked }))}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="mb-3 flex items-center gap-2 text-base font-bold text-[var(--fg-primary)]">
                <Send size={16} />
                Auto Share Backend
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <label className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[var(--fg-primary)]">Facebook Fanspage</div>
                      <div className="mt-1 text-xs text-[var(--fg-muted)]">
                        Sekali klik <code>Share</code>, artikel dikirim otomatis ke Fanspage.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoPublishFacebookPage}
                      onChange={(e) => setSettings((prev) => ({ ...prev, autoPublishFacebookPage: e.target.checked }))}
                    />
                  </label>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[var(--fg-secondary)]">Facebook Page ID</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={settings.facebookPageId}
                        onChange={(e) => setSettings((prev) => ({ ...prev, facebookPageId: e.target.value }))}
                        placeholder="123456789012345"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[var(--fg-secondary)]">Page Access Token</label>
                      <input
                        type="password"
                        className="input w-full"
                        value={settings.facebookPageAccessToken}
                        onChange={(e) => setSettings((prev) => ({ ...prev, facebookPageAccessToken: e.target.value }))}
                        placeholder={settings.facebookPageAccessTokenConfigured ? "Token tersimpan. Isi hanya jika ingin mengganti." : "Masukkan token baru"}
                      />
                      <div className="mt-1 text-[11px] text-[var(--fg-muted)]">
                        {settings.facebookPageAccessTokenConfigured ? "Token sudah tersimpan aman di server." : "Belum ada token tersimpan."}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
                  <label className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[var(--fg-primary)]">Telegram Channel</div>
                      <div className="mt-1 text-xs text-[var(--fg-muted)]">
                        Provider resmi paling ringan untuk distribusi berita otomatis.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoPublishTelegramChannel}
                      onChange={(e) => setSettings((prev) => ({ ...prev, autoPublishTelegramChannel: e.target.checked }))}
                    />
                  </label>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[var(--fg-secondary)]">Chat ID Channel</label>
                      <input
                        type="text"
                        className="input w-full"
                        value={settings.telegramChannelChatId}
                        onChange={(e) => setSettings((prev) => ({ ...prev, telegramChannelChatId: e.target.value }))}
                        placeholder="-1001234567890"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[var(--fg-secondary)]">Bot Token</label>
                      <input
                        type="password"
                        className="input w-full"
                        value={settings.telegramBotToken}
                        onChange={(e) => setSettings((prev) => ({ ...prev, telegramBotToken: e.target.value }))}
                        placeholder={settings.telegramBotTokenConfigured ? "Token tersimpan. Isi hanya jika ingin mengganti." : "Masukkan token bot"}
                      />
                      <div className="mt-1 text-[11px] text-[var(--fg-muted)]">
                        {settings.telegramBotTokenConfigured ? "Token bot sudah tersimpan aman di server." : "Belum ada token bot tersimpan."}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold">WhatsApp Channel</div>
                      <div className="mt-1 text-xs leading-5">
                        Alur yang dipakai sekarang: setelah klik <code>Share</code>, Facebook Fanspage dan Telegram Channel dikirim otomatis dari server, lalu browser diarahkan ke proses manual share WhatsApp Channel.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="text-base font-bold text-[var(--fg-primary)]">Ringkasan</div>
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="text-sm text-[var(--fg-muted)]">Platform aktif</div>
              <div className="mt-1 text-3xl font-bold text-[var(--fg-primary)]">{enabledCount}</div>
              <div className="mt-4 text-xs leading-6 text-[var(--fg-muted)]">
                Tombol share akan muncul di halaman <code>/admin/posts</code> tepat sebelum badge status publish.
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <div className="text-sm text-[var(--fg-muted)]">Provider auto resmi siap pakai</div>
              <div className="mt-1 text-3xl font-bold text-[var(--fg-primary)]">{autoTargetCount}</div>
              <div className="mt-4 text-xs leading-6 text-[var(--fg-muted)]">
                Tombol <code>Share</code> akan memproses Facebook dan Telegram otomatis, lalu lanjut membuka WhatsApp manual.
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">Preview Template</div>
              <div className="mt-2 text-sm text-[var(--fg-primary)] whitespace-pre-wrap break-words">
                {settings.shareTextTemplate || DEFAULT_AUTO_SHARE_SETTINGS.shareTextTemplate}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-4 text-xs leading-6 text-[var(--fg-muted)]">
              Status tombol cepat:{" "}
              <span className="font-semibold text-[var(--fg-primary)]">
                {hasAnyAutoShareTarget(settings) ? "Tombol Share siap untuk Facebook + Telegram + lanjut WhatsApp" : "Lengkapi dulu target auto-share Facebook/Telegram"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
