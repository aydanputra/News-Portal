"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { themeOptions } from "@/lib/theme-registry";
import { ImageIcon } from "lucide-react";
import MediaLibraryModal from "../components/MediaLibraryModal";

const NOTIF_EVENTS_DEFAULT = {
  onNewPost: true,
  onPostRejected: true,
  onPostPublished: true,
  emailTargetAuthor: true,
  emailTargetEditors: true,
  emailTargetAdmins: true,
  onPerformanceReport: false,
  performanceReportAiEnabled: false,
  performanceReportAiModel: "gpt-4o-mini",
  performanceReportAiTemperature: 0.3,
  performanceReportAiMaxChars: 1200,
  performanceReportAiInstruction: "",
  performanceReportViralThreshold: 2000,
  performanceReportTopPosts: 5,
  performanceReportTopCategories: 5,
  performanceReportPeriod: "daily",
};

const AI_MODEL_PRESETS = ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1", "o4-mini", "o3-mini"];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "general";
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  // const [primaryColor, setPrimaryColor] = useState("#2563eb"); // Removed
  const [activeTheme, setActiveTheme] = useState("modern");
  const [insertCodeHead, setInsertCodeHead] = useState("");
  const [insertCodeBody, setInsertCodeBody] = useState("");
  const [insertCodeFooter, setInsertCodeFooter] = useState("");

  // Notification States
  const [notifTelegramEnabled, setNotifTelegramEnabled] = useState(false);
  const [notifTelegramBotToken, setNotifTelegramBotToken] = useState("");
  const [notifTelegramChatId, setNotifTelegramChatId] = useState("");
  const [notifEmailEnabled, setNotifEmailEnabled] = useState(false);
  const [notifEmailFrom, setNotifEmailFrom] = useState("");
  const [notifEmailTo, setNotifEmailTo] = useState("");
  const [notifSmtpHost, setNotifSmtpHost] = useState("");
  const [notifSmtpPort, setNotifSmtpPort] = useState(587);
  const [notifSmtpUser, setNotifSmtpUser] = useState("");
  const [notifSmtpPass, setNotifSmtpPass] = useState("");
  const [notifSmtpSecure, setNotifSmtpSecure] = useState(true);
  const [notifEvents, setNotifEvents] = useState(NOTIF_EVENTS_DEFAULT);
  const [aiApiKeyConfigured, setAiApiKeyConfigured] = useState(false);
  const [aiApiKeySource, setAiApiKeySource] = useState<"db" | "env" | "none">("none");
  const [aiApiKeyInput, setAiApiKeyInput] = useState("");
  const [aiApiKeyClear, setAiApiKeyClear] = useState(false);
  const [aiTestLoading, setAiTestLoading] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);
  const [reportTestLoading, setReportTestLoading] = useState(false);
  const [reportTestResult, setReportTestResult] = useState<string | null>(null);
  const [tgPersonalTestLoading, setTgPersonalTestLoading] = useState(false);
  const [tgPersonalTestResult, setTgPersonalTestResult] = useState<string | null>(null);
  const [tgGroupTestLoading, setTgGroupTestLoading] = useState(false);
  const [tgGroupTestResult, setTgGroupTestResult] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [mediaModalTarget, setMediaModalTarget] = useState<"logo" | "favicon" | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSiteName(data.siteName || "");
        setSiteDescription(data.siteDescription || "");
        setLogoUrl(data.logoUrl || "");
        setFaviconUrl(data.faviconUrl || "");
        // setPrimaryColor(data.primaryColor || "#2563eb");
        setActiveTheme(data.activeTheme || "modern");
        setInsertCodeHead(typeof data.insertCodeHead === "string" ? data.insertCodeHead : "");
        setInsertCodeBody(typeof data.insertCodeBody === "string" ? data.insertCodeBody : "");
        setInsertCodeFooter(typeof data.insertCodeFooter === "string" ? data.insertCodeFooter : "");
        
        // Notification Settings
        setNotifTelegramEnabled(data.notificationTelegramEnabled ?? false);
        setNotifTelegramBotToken(data.notificationTelegramBotToken || "");
        setNotifTelegramChatId(data.notificationTelegramChatId || "");
        setNotifEmailEnabled(data.notificationEmailEnabled ?? false);
        setNotifEmailFrom(data.notificationEmailFrom || "");
        setNotifEmailTo(data.notificationEmailTo || "");
        setNotifSmtpHost(data.notificationSmtpHost || "");
        setNotifSmtpPort(data.notificationSmtpPort || 587);
        setNotifSmtpUser(data.notificationSmtpUser || "");
        setNotifSmtpPass(data.notificationSmtpPass || "");
        setNotifSmtpSecure(data.notificationSmtpSecure ?? true);
        setNotifEvents({ ...NOTIF_EVENTS_DEFAULT, ...(data.notificationEvents || {}) });
        setAiApiKeyConfigured(Boolean(data.aiApiKeyConfigured));
        setAiApiKeySource((data.aiApiKeySource as any) || "none");
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        siteName,
        siteDescription,
        logoUrl,
        faviconUrl,
        activeTheme,
        insertCodeHead,
        insertCodeBody,
        insertCodeFooter,

        notificationTelegramEnabled: notifTelegramEnabled,
        notificationTelegramBotToken: notifTelegramBotToken,
        notificationTelegramChatId: notifTelegramChatId,
        notificationEmailEnabled: notifEmailEnabled,
        notificationEmailFrom: notifEmailFrom,
        notificationEmailTo: notifEmailTo,
        notificationSmtpHost: notifSmtpHost,
        notificationSmtpPort: notifSmtpPort,
        notificationSmtpUser: notifSmtpUser,
        notificationSmtpPass: notifSmtpPass,
        notificationSmtpSecure: notifSmtpSecure,
        notificationEvents: notifEvents,
      };

      if (aiApiKeyClear) {
        payload.aiOpenAiApiKey = "";
      } else if (aiApiKeyInput.trim()) {
        payload.aiOpenAiApiKey = aiApiKeyInput.trim();
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setToast({ message: "Pengaturan disimpan!", type: "success" });
        setAiApiKeyInput("");
        setAiApiKeyClear(false);
        fetch("/api/settings")
          .then((r) => r.json())
          .then((data) => {
            setAiApiKeyConfigured(Boolean(data.aiApiKeyConfigured));
            setAiApiKeySource((data.aiApiKeySource as any) || "none");
          })
          .catch(() => null);
      } else {
        const err = await res.json().catch(() => null);
        setToast({ message: err?.error || "Gagal menyimpan.", type: "error" });
      }
    } catch {
      setToast({ message: "Error jaringan.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8 max-w-[1600px] mx-auto relative admin-form">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white font-medium animate-fade-in-down ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}
      <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)] mb-6">Pengaturan Website</h1>

      <form onSubmit={handleSave} className="card p-6 space-y-6">
        {activeTab === "insert-code" ? (
          <>
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4">
              <h2 className="font-bold text-[var(--fg-primary)] mb-1">Insert Code</h2>
              <p className="text-sm text-[var(--fg-muted)]">
                Tempelkan kode tracking/analytics atau script kustom. Untuk Head disarankan script (inline atau external). Untuk Body/Footer boleh termasuk noscript.
              </p>
            </div>

            <div>
              <label className="block font-medium text-[var(--fg-primary)] mb-1">Head</label>
              <textarea
                className="input w-full font-mono text-xs"
                value={insertCodeHead}
                onChange={(e) => setInsertCodeHead(e.target.value)}
                rows={8}
                placeholder="<script>...</script>"
              />
            </div>

            <div>
              <label className="block font-medium text-[var(--fg-primary)] mb-1">Body</label>
              <textarea
                className="input w-full font-mono text-xs"
                value={insertCodeBody}
                onChange={(e) => setInsertCodeBody(e.target.value)}
                rows={8}
                placeholder="<noscript>...</noscript>"
              />
            </div>

            <div>
              <label className="block font-medium text-[var(--fg-primary)] mb-1">Footer</label>
              <textarea
                className="input w-full font-mono text-xs"
                value={insertCodeFooter}
                onChange={(e) => setInsertCodeFooter(e.target.value)}
                rows={8}
              />
            </div>
          </>
        ) : activeTab === "notifications" ? (
          <>
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4">
              <h2 className="font-bold text-[var(--fg-primary)] mb-1">Pengaturan Notifikasi</h2>
              <p className="text-sm text-[var(--fg-muted)]">
                Atur pengiriman update berita otomatis ke Telegram atau Email untuk tim redaksi.
              </p>
            </div>

            {/* Telegram Settings */}
            <div className="space-y-6">
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[var(--fg-primary)]">Telegram Bot</h3>
                  <p className="text-xs text-[var(--fg-muted)]">Notifikasi workflow ke Telegram (pribadi/grup sesuai aturan).</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifTelegramEnabled}
                    onChange={(e) => setNotifTelegramEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[var(--bg-surface)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </label>
              </div>

              {notifTelegramEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Bot Token</label>
                    <input
                      type="password"
                      className="input w-full"
                      value={notifTelegramBotToken}
                      onChange={(e) => setNotifTelegramBotToken(e.target.value)}
                      placeholder="123456:ABC-DEF..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Chat ID (Grup)</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={notifTelegramChatId}
                      onChange={(e) => setNotifTelegramChatId(e.target.value)}
                      placeholder="-100123456789"
                    />
                    <div className="text-[11px] text-[var(--fg-muted)] mt-1">Umumnya format supergroup: -100xxxxxxxxxx</div>
                  </div>
                </div>
              )}
            </div>

            {/* Event Settings */}
            <div className="card p-5 space-y-4">
              <div>
                <h3 className="font-bold text-[var(--fg-primary)]">Picu Notifikasi</h3>
                <p className="text-xs text-[var(--fg-muted)]">Atur kapan sistem mengirim notifikasi workflow berita.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--bg-surface)] transition">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-[var(--accent)]" 
                    checked={notifEvents.onNewPost}
                    onChange={(e) => setNotifEvents({...notifEvents, onNewPost: e.target.checked})}
                  />
                  <div className="text-sm">
                    <div className="font-bold text-[var(--fg-primary)]">Berita Baru</div>
                    <div className="text-xs text-[var(--fg-muted)]">Saat penulis kirim ke Editor</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--bg-surface)] transition">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-[var(--accent)]" 
                    checked={notifEvents.onPostPublished}
                    onChange={(e) => setNotifEvents({...notifEvents, onPostPublished: e.target.checked})}
                  />
                  <div className="text-sm">
                    <div className="font-bold text-[var(--fg-primary)]">Berita Terbit</div>
                    <div className="text-xs text-[var(--fg-muted)]">Saat berita tayang di web</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--bg-surface)] transition">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-[var(--accent)]" 
                    checked={notifEvents.onPostRejected}
                    onChange={(e) => setNotifEvents({...notifEvents, onPostRejected: e.target.checked})}
                  />
                  <div className="text-sm">
                    <div className="font-bold text-[var(--fg-primary)]">Berita Ditolak</div>
                    <div className="text-xs text-[var(--fg-muted)]">Saat Editor meminta revisi</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[var(--fg-primary)]">Laporan Performa (Grup)</h3>
                  <p className="text-xs text-[var(--fg-muted)]">
                    Ringkasan trending artikel & kategori berdasarkan kenaikan views dari snapshot.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={Boolean((notifEvents as any).onPerformanceReport)}
                    onChange={(e) => setNotifEvents({ ...(notifEvents as any), onPerformanceReport: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-[var(--bg-surface)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </label>
              </div>

              {Boolean((notifEvents as any).onPerformanceReport) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Periode</label>
                    <select
                      className="input w-full"
                      value={String((notifEvents as any).performanceReportPeriod || "daily")}
                      onChange={(e) => setNotifEvents({ ...(notifEvents as any), performanceReportPeriod: e.target.value })}
                    >
                      <option value="daily">Harian</option>
                      <option value="weekly">Mingguan</option>
                      <option value="monthly">Bulanan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Ambang Viral (views)</label>
                    <input
                      type="number"
                      className="input w-full"
                      value={Number((notifEvents as any).performanceReportViralThreshold ?? 2000)}
                      onChange={(e) =>
                        setNotifEvents({
                          ...(notifEvents as any),
                          performanceReportViralThreshold: Number.parseInt(e.target.value || "0", 10),
                        })
                      }
                      min={1}
                      placeholder="2000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Top Artikel</label>
                    <input
                      type="number"
                      className="input w-full"
                      value={Number((notifEvents as any).performanceReportTopPosts ?? 5)}
                      onChange={(e) =>
                        setNotifEvents({
                          ...(notifEvents as any),
                          performanceReportTopPosts: Number.parseInt(e.target.value || "0", 10),
                        })
                      }
                      min={1}
                      max={15}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Top Kategori</label>
                    <input
                      type="number"
                      className="input w-full"
                      value={Number((notifEvents as any).performanceReportTopCategories ?? 5)}
                      onChange={(e) =>
                        setNotifEvents({
                          ...(notifEvents as any),
                          performanceReportTopCategories: Number.parseInt(e.target.value || "0", 10),
                        })
                      }
                      min={1}
                      max={15}
                    />
                  </div>

                  <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--bg-surface)] transition md:col-span-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[var(--accent)]"
                      checked={Boolean((notifEvents as any).performanceReportAiEnabled)}
                      onChange={(e) =>
                        setNotifEvents({ ...(notifEvents as any), performanceReportAiEnabled: e.target.checked })
                      }
                    />
                    <div className="text-sm">
                      <div className="font-bold text-[var(--fg-primary)]">Aktifkan Insight AI</div>
                      <div className="text-xs text-[var(--fg-muted)]">
                        Gunakan API key dari Pengaturan (atau fallback Server ENV). Output AI hanya analisis & rekomendasi editorial.
                      </div>
                    </div>
                  </label>

                  {Boolean((notifEvents as any).performanceReportAiEnabled) && (
                    <div className="md:col-span-2 bg-[var(--bg-surface)] p-4 rounded-lg border border-[var(--border)]">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="text-sm font-bold text-[var(--fg-primary)]">AI Agent</div>
                          <div className="text-xs text-[var(--fg-muted)]">Pengaturan analisis & rekomendasi otomatis.</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                              aiApiKeyConfigured
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            }`}
                          >
                            {aiApiKeyConfigured ? "API Key Terpasang" : "API Key Belum Ada"}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 md:auto-rows-fr items-stretch">
                        <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-4 space-y-3 h-full">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-xs font-semibold text-[var(--fg-primary)]">API Key</div>
                              <div className="text-[11px] text-[var(--fg-muted)]">
                                Sumber: {aiApiKeySource === "db" ? "Pengaturan" : aiApiKeySource === "env" ? "Server ENV" : "-"}
                              </div>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-4 h-4 accent-[var(--accent)]"
                                checked={aiApiKeyClear}
                                onChange={(e) => setAiApiKeyClear(e.target.checked)}
                              />
                              <span className="text-xs font-semibold text-[var(--fg-primary)]">Hapus Key</span>
                            </label>
                          </div>

                          <input
                            type="password"
                            className="input w-full"
                            value={aiApiKeyInput}
                            onChange={(e) => setAiApiKeyInput(e.target.value)}
                            placeholder={aiApiKeyClear ? "Akan dihapus saat disimpan" : "sk-..."}
                            disabled={aiApiKeyClear}
                          />
                          <div className="text-[11px] text-[var(--fg-muted)]">
                            Key tidak ditampilkan kembali. Isi hanya jika ingin mengganti/menambahkan.
                          </div>
                        </div>

                        <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-4 space-y-3 h-full">
                          <div className="text-xs font-semibold text-[var(--fg-primary)]">Pengetesan</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <button
                              type="button"
                              className="w-full h-11 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--fg-primary)] font-semibold text-sm hover:bg-[var(--bg-elevated)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                              disabled={aiTestLoading}
                              onClick={async () => {
                                setAiTestResult(null);
                                setAiTestLoading(true);
                                try {
                                  const res = await fetch("/api/ai/test", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ mode: "ai" }),
                                  });
                                  const data = await res.json().catch(() => null);
                                  if (!res.ok) throw new Error(data?.error || "Gagal test AI");
                                  setAiTestResult(
                                    `Model: ${data?.model || "-"}\nKey: ${data?.keySource || "-"}\n\nResponse:\n${data?.content || "-"}`,
                                  );
                                } catch (e: any) {
                                  setAiTestResult(e?.message || "Gagal test AI");
                                } finally {
                                  setAiTestLoading(false);
                                }
                              }}
                            >
                              {aiTestLoading ? "Testing..." : "Test AI"}
                            </button>

                            <button
                              type="button"
                              className="w-full h-11 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--fg-primary)] font-semibold text-sm hover:bg-[var(--bg-elevated)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                              disabled={reportTestLoading}
                              onClick={async () => {
                                setReportTestResult(null);
                                setReportTestLoading(true);
                                try {
                                  const res = await fetch("/api/ai/test", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      mode: "report",
                                      period: (notifEvents as any).performanceReportPeriod || "daily",
                                    }),
                                  });
                                  const data = await res.json().catch(() => null);
                                  if (!res.ok) throw new Error(data?.error || "Gagal preview laporan");
                                  const aiUsed = data?.ai?.used ? "YA" : "TIDAK";
                                  setReportTestResult(
                                    `AI Enabled: ${data?.ai?.enabled ? "YA" : "TIDAK"}\nAI Used: ${aiUsed}\nKey: ${
                                      data?.ai?.keySource || "-"
                                    }\n\nPreview:\n${data?.previewMessage || "-"}`,
                                  );
                                } catch (e: any) {
                                  setReportTestResult(e?.message || "Gagal preview laporan");
                                } finally {
                                  setReportTestLoading(false);
                                }
                              }}
                            >
                              {reportTestLoading ? "Testing..." : "Preview Laporan"}
                            </button>

                            <button
                              type="button"
                              className="w-full h-11 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--fg-primary)] font-semibold text-sm hover:bg-[var(--bg-elevated)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                              disabled={tgPersonalTestLoading}
                              onClick={async () => {
                                setTgPersonalTestResult(null);
                                setTgPersonalTestLoading(true);
                                try {
                                  const res = await fetch("/api/ai/test", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ mode: "telegram_personal" }),
                                  });
                                  const data = await res.json().catch(() => null);
                                  if (!res.ok) {
                                    const details =
                                      data?.details ? `\n\nDetails:\n${JSON.stringify(data.details, null, 2)}` : "";
                                    const chat = data?.chatId ? `\nChat ID: ${data.chatId}` : "";
                                    throw new Error(`${data?.error || "Gagal test Telegram pribadi"}${chat}${details}`);
                                  }
                                  setTgPersonalTestResult("Berhasil. Cek Telegram pribadi Anda (DM) untuk pesan test.");
                                } catch (e: any) {
                                  setTgPersonalTestResult(e?.message || "Gagal test Telegram pribadi");
                                } finally {
                                  setTgPersonalTestLoading(false);
                                }
                              }}
                            >
                              {tgPersonalTestLoading ? "Testing..." : "Test Pribadi"}
                            </button>

                            <button
                              type="button"
                              className="w-full h-11 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--fg-primary)] font-semibold text-sm hover:bg-[var(--bg-elevated)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                              disabled={tgGroupTestLoading}
                              onClick={async () => {
                                setTgGroupTestResult(null);
                                setTgGroupTestLoading(true);
                                try {
                                  const res = await fetch("/api/ai/test", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ mode: "telegram_group" }),
                                  });
                                  const data = await res.json().catch(() => null);
                                  if (!res.ok) {
                                    const details =
                                      data?.details ? `\n\nDetails:\n${JSON.stringify(data.details, null, 2)}` : "";
                                    const chat = data?.chatId ? `\nChat ID: ${data.chatId}` : "";
                                    throw new Error(`${data?.error || "Gagal test Telegram grup"}${chat}${details}`);
                                  }
                                  setTgGroupTestResult("Berhasil. Cek grup Telegram Anda untuk pesan test.");
                                } catch (e: any) {
                                  setTgGroupTestResult(e?.message || "Gagal test Telegram grup");
                                } finally {
                                  setTgGroupTestLoading(false);
                                }
                              }}
                            >
                              {tgGroupTestLoading ? "Testing..." : "Test Grup"}
                            </button>
                          </div>
                        </div>

                        <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-4 space-y-3 h-full">
                          <div className="text-xs font-semibold text-[var(--fg-primary)]">Konfigurasi</div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-[11px] font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Model</label>
                              {(() => {
                                const currentModel = String((notifEvents as any).performanceReportAiModel || "gpt-4o-mini").trim();
                                const isPreset = AI_MODEL_PRESETS.includes(currentModel);
                                return (
                                  <div className="space-y-2">
                                    <select
                                      className="input w-full"
                                      value={isPreset ? currentModel : "__custom__"}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "__custom__") return;
                                        setNotifEvents({ ...(notifEvents as any), performanceReportAiModel: val });
                                      }}
                                    >
                                      {AI_MODEL_PRESETS.map((m) => (
                                        <option key={m} value={m}>
                                          {m}
                                        </option>
                                      ))}
                                      <option value="__custom__">Custom…</option>
                                    </select>

                                    {!isPreset && (
                                      <input
                                        type="text"
                                        className="input w-full"
                                        value={currentModel}
                                        onChange={(e) =>
                                          setNotifEvents({ ...(notifEvents as any), performanceReportAiModel: e.target.value })
                                        }
                                        placeholder="Masukkan model..."
                                      />
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Temperature</label>
                              <input
                                type="number"
                                className="input w-full"
                                value={Number((notifEvents as any).performanceReportAiTemperature ?? 0.3)}
                                onChange={(e) =>
                                  setNotifEvents({
                                    ...(notifEvents as any),
                                    performanceReportAiTemperature: Number.parseFloat(e.target.value || "0"),
                                  })
                                }
                                min={0}
                                max={1}
                                step={0.1}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Maks. Karakter</label>
                              <input
                                type="number"
                                className="input w-full"
                                value={Number((notifEvents as any).performanceReportAiMaxChars ?? 1200)}
                                onChange={(e) =>
                                  setNotifEvents({
                                    ...(notifEvents as any),
                                    performanceReportAiMaxChars: Number.parseInt(e.target.value || "0", 10),
                                  })
                                }
                                min={200}
                                max={3000}
                                step={50}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-[11px] font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Instruksi (Opsional)</label>
                              <textarea
                                className="input w-full"
                                rows={3}
                                value={String((notifEvents as any).performanceReportAiInstruction || "")}
                                onChange={(e) =>
                                  setNotifEvents({
                                    ...(notifEvents as any),
                                    performanceReportAiInstruction: e.target.value,
                                  })
                                }
                                placeholder="Contoh: Fokus pada kategori Politik & Olahraga. Beri ide judul yang SEO-friendly."
                              />
                            </div>
                          </div>
                        </div>

                        <div className="bg-[var(--bg-base)] border border-[var(--border)] rounded-lg p-4 space-y-3 h-full">
                          <div className="text-xs font-semibold text-[var(--fg-primary)]">Hasil</div>
                          {aiTestResult || reportTestResult || tgPersonalTestResult || tgGroupTestResult ? (
                            <div className="grid gap-2">
                              {aiTestResult && (
                                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3">
                                  <div className="text-[11px] font-semibold text-[var(--fg-primary)] mb-2">Test AI</div>
                                  <pre className="text-xs whitespace-pre-wrap text-[var(--fg-secondary)] max-h-40 overflow-auto">{aiTestResult}</pre>
                                </div>
                              )}
                              {reportTestResult && (
                                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3">
                                  <div className="text-[11px] font-semibold text-[var(--fg-primary)] mb-2">Preview Laporan</div>
                                  <pre className="text-xs whitespace-pre-wrap text-[var(--fg-secondary)] max-h-40 overflow-auto">{reportTestResult}</pre>
                                </div>
                              )}
                              {tgPersonalTestResult && (
                                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3">
                                  <div className="text-[11px] font-semibold text-[var(--fg-primary)] mb-2">Telegram Pribadi</div>
                                  <pre className="text-xs whitespace-pre-wrap text-[var(--fg-secondary)] max-h-40 overflow-auto">{tgPersonalTestResult}</pre>
                                </div>
                              )}
                              {tgGroupTestResult && (
                                <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-3">
                                  <div className="text-[11px] font-semibold text-[var(--fg-primary)] mb-2">Telegram Grup</div>
                                  <pre className="text-xs whitespace-pre-wrap text-[var(--fg-secondary)] max-h-40 overflow-auto">{tgGroupTestResult}</pre>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-[var(--fg-muted)]">Belum ada hasil pengetesan.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Email Settings */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[var(--fg-primary)]">Email Notification</h3>
                  <p className="text-xs text-[var(--fg-muted)]">Kirim update berita melalui email ke tim redaksi.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifEmailEnabled}
                    onChange={(e) => setNotifEmailEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[var(--bg-surface)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
                </label>
              </div>

              {notifEmailEnabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="bg-[var(--bg-base)] p-4 rounded-lg border border-[var(--border)] space-y-3">
                    <div>
                      <div className="text-sm font-bold text-[var(--fg-primary)]">Penerima Email</div>
                      <div className="text-xs text-[var(--fg-muted)]">
                        Email dikirim ke alamat email akun (email saat daftar). Anda bisa memilih target penerimanya.
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--bg-surface)] transition">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[var(--accent)]"
                          checked={Boolean((notifEvents as any).emailTargetAuthor)}
                          onChange={(e) => setNotifEvents({ ...(notifEvents as any), emailTargetAuthor: e.target.checked })}
                        />
                        <div className="text-sm">
                          <div className="font-bold text-[var(--fg-primary)]">Penulis</div>
                          <div className="text-xs text-[var(--fg-muted)]">Kirim ke email penulis</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--bg-surface)] transition">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[var(--accent)]"
                          checked={Boolean((notifEvents as any).emailTargetEditors)}
                          onChange={(e) => setNotifEvents({ ...(notifEvents as any), emailTargetEditors: e.target.checked })}
                        />
                        <div className="text-sm">
                          <div className="font-bold text-[var(--fg-primary)]">Editor</div>
                          <div className="text-xs text-[var(--fg-muted)]">Kirim ke email editor</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--bg-surface)] transition">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[var(--accent)]"
                          checked={Boolean((notifEvents as any).emailTargetAdmins)}
                          onChange={(e) => setNotifEvents({ ...(notifEvents as any), emailTargetAdmins: e.target.checked })}
                        />
                        <div className="text-sm">
                          <div className="font-bold text-[var(--fg-primary)]">Admin</div>
                          <div className="text-xs text-[var(--fg-muted)]">Kirim ke email admin</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Email Pengirim (From)</label>
                      <input
                        type="email"
                        className="input w-full"
                        value={notifEmailFrom}
                        onChange={(e) => setNotifEmailFrom(e.target.value)}
                        placeholder="noreply@portal-berita.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Email Penerima (To)</label>
                      <input
                        type="email"
                        className="input w-full"
                        value={notifEmailTo}
                        onChange={(e) => setNotifEmailTo(e.target.value)}
                        placeholder="editor@portal-berita.com"
                      />
                    </div>
                  </div>

                  <div className="bg-[var(--bg-base)] p-4 rounded-lg border border-[var(--border)] space-y-4">
                    <h4 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border)] pb-2">Konfigurasi SMTP</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">SMTP Host</label>
                        <input
                          type="text"
                          className="input w-full"
                          value={notifSmtpHost}
                          onChange={(e) => setNotifSmtpHost(e.target.value)}
                          placeholder="smtp.mailtrap.io"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">Port</label>
                        <input
                          type="number"
                          className="input w-full"
                          value={notifSmtpPort}
                          onChange={(e) => setNotifSmtpPort(parseInt(e.target.value))}
                          placeholder="587"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">SMTP User</label>
                        <input
                          type="text"
                          className="input w-full"
                          value={notifSmtpUser}
                          onChange={(e) => setNotifSmtpUser(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1 uppercase tracking-wider">SMTP Password</label>
                        <input
                          type="password"
                          className="input w-full"
                          value={notifSmtpPass}
                          onChange={(e) => setNotifSmtpPass(e.target.value)}
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-[var(--accent)]"
                        checked={notifSmtpSecure}
                        onChange={(e) => setNotifSmtpSecure(e.target.checked)}
                      />
                      <span className="text-sm text-[var(--fg-primary)] font-medium">Gunakan SSL/TLS</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            </div>
          </>
        ) : (
          <>
            {/* Nama Situs */}
            <div>
              <label className="block font-medium text-[var(--fg-primary)] mb-1">Nama Situs</label>
              <input
                type="text"
                className="input w-full"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block font-medium text-[var(--fg-primary)] mb-1">Deskripsi Situs</label>
              <textarea
                className="input w-full"
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block font-medium text-[var(--fg-primary)] mb-2">Logo Website</label>
              <div className="flex items-start gap-4">
                {logoUrl ? (
                  <div className="relative group">
                    <div className="w-40 h-20 border rounded-lg bg-[var(--bg-surface)] overflow-hidden flex items-center justify-center">
                      <Image
                        src={logoUrl}
                        alt="Logo"
                        width={160}
                        height={80}
                        className="object-contain max-h-full"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                      <button
                        type="button"
                        onClick={() => setMediaModalTarget("logo")}
                        className="text-white text-xs font-bold bg-[var(--accent)] px-3 py-1.5 rounded hover:bg-[var(--accent-hover)]"
                      >
                        Ganti Logo
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMediaModalTarget("logo")}
                    className="w-40 h-20 border-2 border-dashed border-[var(--border)] rounded-lg flex flex-col items-center justify-center text-[var(--fg-muted)] hover:bg-[var(--bg-surface)] transition"
                  >
                    <ImageIcon size={20} className="mb-1" />
                    <span className="text-xs font-medium">Pilih Logo</span>
                  </button>
                )}

                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl("")}
                    className="text-red-500 text-sm hover:underline mt-2"
                  >
                    Hapus Logo
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--fg-muted)] mt-2">Format: PNG, JPG, WEBP. Ukuran rekomendasi: 200x60px.</p>
            </div>

            {/* Favicon */}
            <div>
              <label className="block font-medium text-[var(--fg-primary)] mb-2">Favicon Website</label>
              <div className="flex items-start gap-4">
                {faviconUrl ? (
                  <div className="relative group">
                    <div className="w-20 h-20 border rounded-lg bg-[var(--bg-surface)] overflow-hidden flex items-center justify-center">
                      <Image
                        src={faviconUrl}
                        alt="Favicon"
                        width={64}
                        height={64}
                        className="object-contain max-h-full"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                      <button
                        type="button"
                        onClick={() => setMediaModalTarget("favicon")}
                        className="text-white text-xs font-bold bg-[var(--accent)] px-3 py-1.5 rounded hover:bg-[var(--accent-hover)]"
                      >
                        Ganti
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setMediaModalTarget("favicon")}
                    className="w-20 h-20 border-2 border-dashed border-[var(--border)] rounded-lg flex flex-col items-center justify-center text-[var(--fg-muted)] hover:bg-[var(--bg-surface)] transition"
                  >
                    <ImageIcon size={20} className="mb-1" />
                    <span className="text-xs font-medium">Pilih</span>
                  </button>
                )}

                {faviconUrl && (
                  <button
                    type="button"
                    onClick={() => setFaviconUrl("")}
                    className="text-red-500 text-sm hover:underline mt-2"
                  >
                    Hapus Favicon
                  </button>
                )}
              </div>
              <p className="text-xs text-[var(--fg-muted)] mt-2">Format: ICO, PNG, JPG. Ukuran rekomendasi: 32x32px atau 64x64px.</p>
            </div>

            {/* Pilihan Tema */}
            <div>
              <label className="block font-medium text-[var(--fg-primary)] mb-1">Tema Website</label>
              <p className="text-sm text-[var(--fg-muted)] mb-2">Pilih tampilan dasar website Anda.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themeOptions.map((theme) => (
                  <div
                    key={theme.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${activeTheme === theme.id ? "border-[var(--accent)] bg-[var(--accent-subtle)]" : "border-[var(--border)] hover:border-[var(--accent)]"}`}
                    onClick={() => setActiveTheme(theme.id)}
                  >
                    <div className="h-24 bg-[var(--bg-surface)] rounded mb-3 flex flex-col gap-1 p-2 overflow-hidden">
                      {theme.mockupType === "modern" ? (
                        <>
                          <div className="h-12 bg-[color:var(--fg-muted)/0.3] rounded w-full"></div>
                          <div className="flex gap-1">
                            <div className="h-8 bg-[color:var(--fg-muted)/0.2] rounded w-2/3"></div>
                            <div className="h-8 bg-[color:var(--fg-muted)/0.2] rounded w-1/3"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="h-4 bg-[color:var(--fg-muted)/0.3] rounded w-full mb-1"></div>
                          <div className="flex gap-1 h-full">
                            <div className="h-full bg-[color:var(--fg-muted)/0.2] rounded w-3/4"></div>
                            <div className="h-full bg-[color:var(--fg-muted)/0.2] rounded w-1/4"></div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--fg-primary)]">{theme.label}</span>
                      {activeTheme === theme.id && <span className="text-[var(--accent)] text-sm font-bold">✓ Aktif</span>}
                    </div>
                    <p className="text-xs text-[var(--fg-muted)] mt-1">{theme.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-[var(--border)]">
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>

      {/* Media Modal */}
      {mediaModalTarget && (
        <MediaLibraryModal 
            onSelect={(media) => {
              if (mediaModalTarget === "logo") setLogoUrl(media.fileUrl);
              if (mediaModalTarget === "favicon") setFaviconUrl(media.fileUrl);
            }}
            onClose={() => setMediaModalTarget(null)}
            selectedId={undefined}
            selectedUrl={mediaModalTarget === "logo" ? logoUrl : faviconUrl}
        />
      )}
    </div>
  );
}
