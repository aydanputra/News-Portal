"use client";

import { useCallback, useEffect, useState } from "react";
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

function SettingsSection({
  title,
  description,
  className = "",
  bodyClassName = "",
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-sm ${className}`}>
      <div className="border-b border-[var(--border)] px-5 py-3.5">
        <h2 className="text-base font-bold text-[var(--fg-primary)]">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{description}</p> : null}
      </div>
      <div className={`px-5 py-4 md:px-6 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "general";
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  // const [primaryColor, setPrimaryColor] = useState("#2563eb"); // Removed
  const [activeTheme, setActiveTheme] = useState("classic");
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

  const [systemLoading, setSystemLoading] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [systemVersion, setSystemVersion] = useState<{
    channel?: "stable" | "beta";
    source?: "feed" | "github" | "none";
    feedUrlUsed?: string | null;
    currentVersion: string;
    latestVersion: string | null;
    updateAvailable: boolean;
    changelogUrl: string | null;
    releasedAt: string | null;
  } | null>(null);
  const [systemTools, setSystemTools] = useState<{
    source?: "super_admin" | "default";
    host?: string;
    enabledToolGroups: Array<{ id: string; label: string }>;
    toolVisibility: Record<string, boolean>;
    canManage: boolean;
    allTools: Array<{ id: string; label: string; description?: string }>;
  } | null>(null);
  const [systemToolDraft, setSystemToolDraft] = useState<Record<string, boolean>>({});
  const [systemToolsSaving, setSystemToolsSaving] = useState(false);
  const [systemToolsMessage, setSystemToolsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSiteName(data.siteName || "");
        setSiteDescription(data.siteDescription || "");
        setLogoUrl(data.logoUrl || "");
        setFaviconUrl(data.faviconUrl || "");
        // setPrimaryColor(data.primaryColor || "#2563eb");
        setActiveTheme(data.activeTheme || "classic");
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

  const loadSystemStatus = useCallback(async () => {
    setSystemLoading(true);
    setSystemError(null);
    try {
      const [versionRes, toolsRes] = await Promise.all([
        fetch("/api/admin/version", { cache: "no-store" }),
        fetch("/api/admin/tools/enabled", { cache: "no-store" }),
      ]);

      const versionJson = await versionRes.json().catch(() => null);
      const toolsJson = await toolsRes.json().catch(() => null);

      let nextError: string | null = null;
      if (!versionRes.ok) {
        nextError = versionJson?.error || "Gagal memuat status versi";
      } else {
        setSystemVersion({
          channel: versionJson?.channel === "beta" || versionJson?.channel === "stable" ? versionJson.channel : undefined,
          source: versionJson?.source === "feed" || versionJson?.source === "github" || versionJson?.source === "none" ? versionJson.source : undefined,
          feedUrlUsed: typeof versionJson?.feedUrlUsed === "string" ? versionJson.feedUrlUsed : null,
          currentVersion: String(versionJson?.currentVersion || "unknown"),
          latestVersion: typeof versionJson?.latestVersion === "string" ? versionJson.latestVersion : null,
          updateAvailable: Boolean(versionJson?.updateAvailable),
          changelogUrl: typeof versionJson?.changelogUrl === "string" ? versionJson.changelogUrl : null,
          releasedAt: typeof versionJson?.releasedAt === "string" ? versionJson.releasedAt : null,
        });
      }

      if (!toolsRes.ok) {
        nextError = nextError || toolsJson?.error || "Gagal memuat status tools";
      } else {
        const toolVisibility =
          toolsJson?.toolVisibility && typeof toolsJson.toolVisibility === "object"
            ? Object.fromEntries(Object.entries(toolsJson.toolVisibility).map(([key, value]) => [key, Boolean(value)]))
            : {};
        setSystemTools({
          source: toolsJson?.source === "super_admin" || toolsJson?.source === "default" ? toolsJson.source : undefined,
          host: typeof toolsJson?.host === "string" ? toolsJson.host : undefined,
          enabledToolGroups: Array.isArray(toolsJson?.enabledToolGroups)
            ? toolsJson.enabledToolGroups.map((item: any) => ({
                id: String(item?.id || ""),
                label: String(item?.label || item?.id || ""),
              }))
            : [],
          toolVisibility,
          canManage: Boolean(toolsJson?.canManage),
          allTools: Array.isArray(toolsJson?.allTools)
            ? toolsJson.allTools.map((item: any) => ({
                id: String(item?.id || ""),
                label: String(item?.label || item?.id || ""),
                description: typeof item?.description === "string" ? item.description : undefined,
              }))
            : [],
        });
        setSystemToolDraft(toolVisibility);
      }
      setSystemError(nextError);
    } catch {
      setSystemError("Gagal memuat status sistem");
    } finally {
      setSystemLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "system") return;
    loadSystemStatus();
  }, [activeTab, loadSystemStatus]);

  const saveSystemTools = useCallback(async () => {
    setSystemToolsSaving(true);
    setSystemToolsMessage(null);
    try {
      const res = await fetch("/api/admin/tools/enabled", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolVisibility: systemToolDraft }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setSystemToolsMessage({ type: "error", text: json?.error || "Gagal menyimpan visibilitas tools" });
        return;
      }
      setSystemToolsMessage({ type: "success", text: "Visibilitas tools disimpan" });
      await loadSystemStatus();
    } catch {
      setSystemToolsMessage({ type: "error", text: "Gagal menyimpan visibilitas tools" });
    } finally {
      setSystemToolsSaving(false);
    }
  }, [loadSystemStatus, systemToolDraft]);

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

      if (activeTab === "insert-code") {
        payload.insertCodeHead = insertCodeHead;
        payload.insertCodeBody = insertCodeBody;
        payload.insertCodeFooter = insertCodeFooter;
      }

      if (aiApiKeyClear) {
        payload.aiOpenAiApiKey = "";
      } else if (aiApiKeyInput.trim()) {
        payload.aiOpenAiApiKey = aiApiKeyInput.trim();
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setToast({ message: "Pengaturan disimpan!", type: "success" });
        setAiApiKeyInput("");
        setAiApiKeyClear(false);
        fetch("/api/admin/settings")
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
    <div className="relative mx-auto min-h-screen max-w-[1560px] bg-[var(--bg-base)] px-4 pb-24 pt-4 md:px-6 md:pb-10 md:pt-6 admin-form">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white font-medium animate-fade-in-down ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
        </div>
      )}
      <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-4 shadow-sm md:px-6">
        <h1 className="font-display text-2xl font-bold text-[var(--fg-primary)] md:text-[30px]">Pengaturan Website</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-5 shadow-sm md:p-6">
        {activeTab === "system" ? (
          <>
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-[var(--fg-primary)] mb-1">Status Sistem</h2>
                  <p className="text-sm text-[var(--fg-muted)]">
                    Informasi versi CMS, status update, dan tools yang aktif pada instance website ini.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadSystemStatus}
                  disabled={systemLoading}
                  className="btn btn-secondary"
                >
                  {systemLoading ? "Memuat..." : "Muat Ulang"}
                </button>
              </div>
            </div>

            {systemError && (
              <div className="rounded-xl px-4 py-3 text-sm font-semibold bg-red-50 text-red-700 border border-red-200">
                {systemError}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="card p-5">
                <div className="font-bold text-[var(--fg-primary)]">Versi CMS</div>
                <div className="mt-3 text-sm text-[var(--fg-muted)] space-y-1">
                  <div>
                    <span className="font-semibold text-[var(--fg-secondary)]">Channel:</span>{" "}
                    <span className="font-bold text-[var(--fg-primary)]">{systemVersion?.channel || "stable"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--fg-secondary)]">Sumber update:</span>{" "}
                    <span className="font-bold text-[var(--fg-primary)]">
                      {systemVersion?.source === "feed" ? "UPDATE_FEED_URL" : systemVersion?.source === "github" ? "GitHub Releases" : "Tidak ada"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--fg-secondary)]">Versi saat ini:</span>{" "}
                    <span className="font-bold text-[var(--fg-primary)]">{systemVersion?.currentVersion || "unknown"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--fg-secondary)]">Versi terbaru:</span>{" "}
                    <span className="font-bold text-[var(--fg-primary)]">{systemVersion?.latestVersion || "-"}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[var(--fg-secondary)]">Status:</span>{" "}
                    {systemVersion?.updateAvailable ? (
                      <span className="font-bold text-[var(--accent)]">Update tersedia</span>
                    ) : (
                      <span className="font-bold text-emerald-700">Terbaru</span>
                    )}
                  </div>
                  {systemVersion?.changelogUrl ? (
                    <div className="pt-2">
                      <a
                        href={systemVersion.changelogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)] font-bold hover:underline"
                      >
                        Lihat rilis
                      </a>
                    </div>
                  ) : null}
                  {systemVersion?.feedUrlUsed ? (
                    <div className="pt-2 text-xs text-[var(--fg-muted)] break-all">
                      Feed: {systemVersion.feedUrlUsed}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="card p-5">
                <div className="font-bold text-[var(--fg-primary)]">Tools Aktif</div>
                <div className="mt-3 text-sm text-[var(--fg-muted)] space-y-2">
                  <div>
                    <span className="font-semibold text-[var(--fg-secondary)]">Kontrol aktif:</span>{" "}
                    <span className="font-bold text-[var(--fg-primary)]">
                      {systemTools?.source === "super_admin" ? "Checkbox Super Admin" : "Default Semua Aktif"}
                    </span>
                  </div>
                  {systemTools?.host ? (
                    <div>
                      <span className="font-semibold text-[var(--fg-secondary)]">Host terdeteksi:</span>{" "}
                      <span className="font-bold text-[var(--fg-primary)]">{systemTools.host}</span>
                    </div>
                  ) : null}
                  <div>
                    <span className="font-semibold text-[var(--fg-secondary)]">Tools aktif:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(systemTools?.enabledToolGroups || []).length ? (
                        (systemTools?.enabledToolGroups || []).map((tool) => (
                          <span key={tool.id} className="px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--fg-primary)] font-semibold text-xs">
                            {tool.label}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--fg-muted)]">Tidak ada</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="font-bold text-[var(--fg-primary)]">Visibilitas Tools Admin</div>
                  <div className="mt-1 text-sm text-[var(--fg-muted)]">
                    Saat ini tools dikelola dalam 3 grup. Import Tools mencakup Import WordPress, Generate Media, dan Generate Excerpts.
                  </div>
                </div>
                {systemTools?.canManage ? (
                  <button type="button" onClick={saveSystemTools} disabled={systemToolsSaving} className="btn btn-primary">
                    {systemToolsSaving ? "Menyimpan..." : "Simpan Visibilitas"}
                  </button>
                ) : null}
              </div>

              {systemToolsMessage && (
                <div
                  className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
                    systemToolsMessage.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {systemToolsMessage.text}
                </div>
              )}

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-2">
                {(systemTools?.allTools || []).map((tool) => (
                  <label
                    key={tool.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
                      systemTools?.canManage ? "cursor-pointer" : ""
                    } border-[var(--border)] bg-[var(--bg-surface)]`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--fg-primary)]">{tool.label}</div>
                      <div className="mt-1 text-xs text-[var(--fg-muted)]">{tool.description || tool.id}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(systemToolDraft[tool.id])}
                      disabled={!systemTools?.canManage || systemToolsSaving}
                      onChange={(e) =>
                        setSystemToolDraft((prev) => ({
                          ...prev,
                          [tool.id]: e.target.checked,
                        }))
                      }
                    />
                  </label>
                ))}
              </div>

              {!systemTools?.canManage ? (
                <div className="mt-4 text-xs text-[var(--fg-muted)]">
                  Hanya super admin yang dapat mengubah visibilitas tool.
                </div>
              ) : null}
            </div>
          </>
        ) : activeTab === "insert-code" ? (
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
            <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
              <SettingsSection
                title="Informasi Dasar"
                className="h-full"
              >
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="mb-1 block font-medium text-[var(--fg-primary)]">Nama Situs</label>
                    <input
                      type="text"
                      className="input w-full"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block font-medium text-[var(--fg-primary)]">Deskripsi Situs</label>
                    <textarea
                      className="input min-h-[132px] w-full resize-y rounded-xl leading-6"
                      value={siteDescription}
                      onChange={(e) => setSiteDescription(e.target.value)}
                      placeholder="Contoh: Portal berita digital yang cepat, ringkas, dan enak dibaca."
                      rows={4}
                    />
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection
                title="Aset Brand"
                className="h-full"
                bodyClassName="h-full"
              >
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 md:grid-cols-[176px_minmax(0,1fr)] md:items-center">
                    {logoUrl ? (
                      <div className="flex h-24 w-44 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
                        <Image
                          src={logoUrl}
                          alt="Logo"
                          width={176}
                          height={96}
                          className="max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMediaModalTarget("logo")}
                        className="flex h-24 w-44 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] text-[var(--fg-muted)] transition hover:bg-[var(--bg-elevated)]"
                      >
                        <ImageIcon size={20} className="mb-1" />
                        <span className="text-xs font-medium">Pilih Logo</span>
                      </button>
                    )}

                    <div className="flex min-w-0 flex-col justify-center gap-2">
                      <div className="text-sm font-semibold text-[var(--fg-primary)]">Logo Website</div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setMediaModalTarget("logo")}
                          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm font-semibold text-[var(--fg-primary)] transition hover:bg-white"
                        >
                          {logoUrl ? "Ganti Logo" : "Pilih Logo"}
                        </button>
                        {logoUrl ? (
                          <button
                            type="button"
                            onClick={() => setLogoUrl("")}
                            className="h-9 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Hapus
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 md:grid-cols-[96px_minmax(0,1fr)] md:items-center">
                    {faviconUrl ? (
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
                        <Image
                          src={faviconUrl}
                          alt="Favicon"
                          width={72}
                          height={72}
                          className="max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMediaModalTarget("favicon")}
                        className="flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] text-[var(--fg-muted)] transition hover:bg-[var(--bg-elevated)]"
                      >
                        <ImageIcon size={20} className="mb-1" />
                        <span className="text-xs font-medium">Pilih</span>
                      </button>
                    )}

                    <div className="flex min-w-0 flex-col justify-center gap-2">
                      <div className="text-sm font-semibold text-[var(--fg-primary)]">Favicon Website</div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setMediaModalTarget("favicon")}
                          className="h-9 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm font-semibold text-[var(--fg-primary)] transition hover:bg-white"
                        >
                          {faviconUrl ? "Ganti Favicon" : "Pilih Favicon"}
                        </button>
                        {faviconUrl ? (
                          <button
                            type="button"
                            onClick={() => setFaviconUrl("")}
                            className="h-9 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Hapus
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </SettingsSection>
            </div>

            <SettingsSection
              title="Tema Website"
              description="Pilih tampilan tema berdasarkan preview beranda utama masing-masing tema."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {themeOptions.map((theme) => (
                  <button
                    type="button"
                    key={theme.id}
                    className={`flex h-full flex-col overflow-hidden rounded-2xl border-2 text-left transition-all ${
                      activeTheme === theme.id
                        ? "border-[var(--accent)] bg-[var(--accent-subtle)] shadow-[0_0_0_1px_var(--accent-subtle)]"
                        : "border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent)] hover:bg-[var(--bg-surface)]"
                    }`}
                    onClick={() => setActiveTheme(theme.id)}
                  >
                    <div className="relative aspect-square w-full overflow-hidden border-b border-[var(--border)] bg-[var(--bg-surface)]">
                      <div
                        className="absolute left-0 top-0 h-[1320px] w-[1280px] origin-top-left pointer-events-none"
                        style={{ transform: "scale(0.35)" }}
                      >
                        <iframe
                          src={`/preview/theme/${theme.id}`}
                          title={`Preview tema ${theme.label}`}
                          className="h-full w-full border-0 bg-white"
                          loading="lazy"
                          tabIndex={-1}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/10" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85">
                          Preview Beranda Tema
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-[var(--fg-primary)]">{theme.label}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            activeTheme === theme.id
                              ? "bg-[var(--accent)] text-white"
                              : "border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--fg-muted)]"
                          }`}
                        >
                          {activeTheme === theme.id ? "Aktif" : "Pilih"}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-[var(--fg-muted)]">{theme.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </SettingsSection>
          </>
        )}

        {activeTab !== "system" && (
          <div className="border-t border-[var(--border)] pt-4">
            <button type="submit" disabled={loading} className="btn btn-primary h-11 w-full rounded-xl">
              {loading ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        )}
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
