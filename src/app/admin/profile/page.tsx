"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Lock, Save, Loader2, AlertTriangle, CheckCircle, Trash2, Globe, Twitter, Facebook, Instagram, Youtube, Linkedin, Twitch, Camera, Music2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import MediaLibraryModal, { Media } from "@/app/admin/components/MediaLibraryModal";

type TabType = "profile" | "social" | "password" | "twofactor" | "delete";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  
  // Media Modal
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<"avatar" | "banner" | null>(null);

  // Feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Form States - Profile
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");

  // Form States - Password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Form States - Social
  const [socials, setSocials] = useState({
      facebook: "",
      twitter: "",
      instagram: "",
      tiktok: "",
      whatsapp: "",
      youtube: "",
      discord: "",
      telegram: "",
      pinterest: "",
      linkedin: "",
      twitch: "",
      vk: "",
      website: ""
  });

  // Form States - Delete
  const [deletePassword, setDeletePassword] = useState("");

  // Form States - 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorQr, setTwoFactorQr] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        // Init form data
        setName(data.name || "");
        setEmail(data.email || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
        setAvatar(data.avatar || "");
        setBanner(data.banner || "");
        setTelegramChatId(data.telegramChatId || "");
        setTwoFactorEnabled(Boolean(data.twoFactorEnabled));
        if (data.socialAccounts) {
            setSocials((prev) => ({ ...prev, ...data.socialAccounts }));
        }
      } else {
        setError("Gagal memuat profil");
      }
    } catch {
      setError("Terjadi kesalahan saat memuat profil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                email,
                username,
                bio,
                avatar,
                banner,
                telegramChatId
            }),
        });

        if (res.ok) {
            setSuccess("Profil berhasil diperbarui");
            fetchProfile();
        } else {
            const data = await res.json();
            setError(data.error || "Gagal update profil");
        }
    } catch {
        setError("Terjadi kesalahan sistem");
    } finally {
        setSaving(false);
    }
  };

  const handleUpdateSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                socialAccounts: socials
            }),
        });

        if (res.ok) {
            setSuccess("Social media berhasil diperbarui");
            fetchProfile();
        } else {
            const data = await res.json();
            setError(data.error || "Gagal update social media");
        }
    } catch {
        setError("Terjadi kesalahan sistem");
    } finally {
        setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
        setError("Konfirmasi password tidak cocok");
        setSaving(false);
        return;
    }

    if (password.length < 8) {
        setError("Password minimal 8 karakter");
        setSaving(false);
        return;
    }
    if (!/[a-z]/.test(password)) {
        setError("Password harus mengandung huruf kecil");
        setSaving(false);
        return;
    }
    if (!/[A-Z]/.test(password)) {
        setError("Password harus mengandung huruf besar");
        setSaving(false);
        return;
    }
    if (!/[0-9]/.test(password)) {
        setError("Password harus mengandung angka");
        setSaving(false);
        return;
    }

    try {
        const res = await fetch("/api/profile", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                password
            }),
        });

        if (res.ok) {
            setSuccess("Password berhasil diubah");
            setPassword("");
            setConfirmPassword("");
        } else {
            const data = await res.json();
            setError(data.error || "Gagal ganti password");
        }
    } catch {
        setError("Terjadi kesalahan sistem");
    } finally {
        setSaving(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!confirm("Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.")) return;
      
      setSaving(true);
      setError("");

      try {
          const res = await fetch("/api/profile", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password: deletePassword }),
          });

          if (res.ok) {
              window.location.href = "/admin/login";
          } else {
              const data = await res.json();
              setError(data.error || "Gagal menghapus akun. Periksa password Anda.");
          }
      } catch {
          setError("Terjadi kesalahan sistem");
      } finally {
          setSaving(false);
      }
  };

  const fetchTwoFactorSetup = async () => {
    setTwoFactorLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/2fa/setup");
      const data = await res.json();
      if (res.ok) {
        setTwoFactorQr(data.qrDataUrl || "");
        setTwoFactorSecret(data.secret || "");
      } else {
        setError(data.error || "Gagal memuat pengaturan 2FA");
      }
    } catch {
      setError("Terjadi kesalahan sistem");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleEnableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactorEnabled(true);
        setTwoFactorCode("");
        setTwoFactorQr("");
        setTwoFactorSecret("");
        setRecoveryCodes(data.recoveryCodes || []);
        setSuccess("2FA berhasil diaktifkan");
      } else {
        setError(data.error || "Gagal mengaktifkan 2FA");
      }
    } catch {
      setError("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  };

  const handleDisableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: twoFactorPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactorEnabled(false);
        setTwoFactorPassword("");
        setRecoveryCodes([]);
        setSuccess("2FA berhasil dinonaktifkan");
      } else {
        setError(data.error || "Gagal menonaktifkan 2FA");
      }
    } catch {
      setError("Terjadi kesalahan sistem");
    } finally {
      setSaving(false);
    }
  };

  const openMediaLibrary = (target: "avatar" | "banner") => {
    setMediaTarget(target);
    setShowMediaModal(true);
  };

  const handleMediaSelect = (media: Media) => {
      if (mediaTarget === "avatar") {
          setAvatar(media.fileUrl);
      } else if (mediaTarget === "banner") {
          setBanner(media.fileUrl);
      }
      setShowMediaModal(false);
      setMediaTarget(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  // --- Render Components ---

  const renderSidebar = () => (
      <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
              <h2 className="px-3 text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider mb-2">Settings</h2>
              <button 
                  onClick={() => { setActiveTab("profile"); setError(""); setSuccess(""); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === "profile" ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"}`}
              >
                  <User size={18} />
                  Update Profile
              </button>
              <button 
                  onClick={() => { setActiveTab("social"); setError(""); setSuccess(""); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === "social" ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"}`}
              >
                  <Globe size={18} />
                  Social Accounts
              </button>
              <button 
                  onClick={() => { setActiveTab("password"); setError(""); setSuccess(""); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === "password" ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"}`}
              >
                  <Lock size={18} />
                  Change Password
              </button>
              <button 
                  onClick={() => { setActiveTab("twofactor"); setError(""); setSuccess(""); setRecoveryCodes([]); setTwoFactorQr(""); setTwoFactorSecret(""); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === "twofactor" ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"}`}
              >
                  <ShieldCheck size={18} />
                  Two-Factor Auth
              </button>
              <button 
                  onClick={() => { setActiveTab("delete"); setError(""); setSuccess(""); }}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === "delete" ? "bg-red-600 text-white shadow-sm" : "text-red-600 hover:bg-red-50 hover:text-red-700"}`}
              >
                  <Trash2 size={18} />
                  Delete Account
              </button>
          </div>
      </div>
  );

  return (
    <div className="w-full px-6 py-6 md:p-10"> {/* Changed max-w-6xl mx-auto to w-full to match other admin pages */}
      
      {/* Media Library Modal */}
      {showMediaModal && (
          <MediaLibraryModal 
              onSelect={handleMediaSelect}
              onClose={() => setShowMediaModal(false)}
              allowedTypes="image"
          />
      )}

      <div className="flex flex-col md:flex-row gap-10">
        {renderSidebar()}

        <div className="flex-1 min-w-0">
            {/* Feedback Messages */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm border border-red-100 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg flex items-center gap-2 text-sm border border-green-100 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle size={16} />
                    {success}
                </div>
            )}

            {/* TAB: UPDATE PROFILE */}
            {activeTab === "profile" && (
                <div className="animate-in fade-in duration-300">
                    <h2 className="text-2xl font-bold text-[var(--fg-primary)] mb-6">Update Profile</h2>
                    
                    {/* Banner & Avatar Upload */}
                    <div className="relative mb-10 group">
                        <div className="h-48 w-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl overflow-hidden relative border border-[var(--border)]">
                            {banner ? (
                                <Image 
                                    src={banner} 
                                    alt="Banner" 
                                    fill
                                    className="object-cover" 
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                                    <Camera size={32} />
                                </div>
                            )}
                            <button 
                                type="button"
                                onClick={() => openMediaLibrary("banner")}
                                className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm hover:bg-black/50 rounded-lg text-white transition-colors z-10"
                                title="Change Banner"
                            >
                                <Camera size={18} />
                            </button>
                        </div>
                        <div className="absolute -bottom-10 left-8 z-20">
                            <div className="w-24 h-24 rounded-full border-4 border-[var(--bg-base)] bg-[var(--bg-elevated)] overflow-hidden relative shadow-md group/avatar">
                                {avatar ? (
                                    <Image 
                                        src={avatar} 
                                        alt="Avatar" 
                                        fill
                                        className="object-cover" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[var(--accent-subtle)] text-[var(--accent)]">
                                        <User size={32} />
                                    </div>
                                )}
                                <div 
                                    onClick={() => openMediaLibrary("avatar")}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                                    title="Change Avatar"
                                >
                                    <Camera size={20} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-[var(--fg-muted)] mb-8 ml-1">* Click on the camera icon to update images</p>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-[var(--fg-primary)] mb-2">Email (Confirmed)</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input w-full bg-[var(--bg-surface)]"
                                disabled // Usually email change requires re-verification
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[var(--fg-primary)] mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input w-full"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[var(--fg-primary)] mb-2">Username</label>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input w-full"
                                    placeholder="johndoe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[var(--fg-primary)] mb-2">About Me</label>
                            <textarea 
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="input w-full h-32 py-3"
                                placeholder="Tell us a little bit about yourself..."
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[var(--fg-primary)] mb-2">Telegram Chat ID (Private)</label>
                                <input 
                                    type="text" 
                                    value={telegramChatId}
                                    onChange={(e) => setTelegramChatId(e.target.value)}
                                    className="input w-full"
                                    placeholder="Your personal Chat ID"
                                />
                                <p className="text-[10px] text-[var(--fg-muted)] mt-1.5">Dapatkan dari @userinfobot untuk menerima notifikasi pribadi.</p>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" disabled={saving} className="btn btn-primary px-8">
                                {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB: SOCIAL ACCOUNTS */}
            {activeTab === "social" && (
                <div className="animate-in fade-in duration-300">
                    <h2 className="text-2xl font-bold text-[var(--fg-primary)] mb-6">Social Accounts</h2>
                    <form onSubmit={handleUpdateSocials} className="space-y-5">
                        {[
                            { key: 'facebook', label: 'Facebook', icon: <Facebook size={18} /> },
                            { key: 'twitter', label: 'Twitter', icon: <Twitter size={18} /> },
                            { key: 'instagram', label: 'Instagram', icon: <Instagram size={18} /> },
                            { key: 'tiktok', label: 'TikTok', icon: <Music2 size={18} /> }, // Added TikTok
                            { key: 'youtube', label: 'YouTube', icon: <Youtube size={18} /> },
                            { key: 'linkedin', label: 'LinkedIn', icon: <Linkedin size={18} /> },
                            { key: 'twitch', label: 'Twitch', icon: <Twitch size={18} /> },
                            { key: 'website', label: 'Personal Website', icon: <Globe size={18} /> }
                        ].map((item) => (
                            <div key={item.key}>
                                <label className="block text-xs font-bold text-[var(--fg-secondary)] mb-1.5 uppercase tracking-wide flex items-center gap-2">
                                    {item.icon} {item.label}
                                </label>
                                <input 
                                    type="url" 
                                    // @ts-ignore
                                    value={socials[item.key] || ""}
                                    // @ts-ignore
                                    onChange={(e) => setSocials({...socials, [item.key]: e.target.value})}
                                    className="input w-full text-sm"
                                    placeholder={`https://${item.key.toLowerCase()}.com/...`}
                                />
                            </div>
                        ))}

                        <div className="pt-6 border-t border-[var(--border)] mt-8">
                            <button type="submit" disabled={saving} className="btn btn-primary px-8">
                                {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB: CHANGE PASSWORD */}
            {activeTab === "password" && (
                <div className="animate-in fade-in duration-300 max-w-lg">
                    <h2 className="text-2xl font-bold text-[var(--fg-primary)] mb-6">Change Password</h2>
                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-[var(--fg-primary)] mb-2">New Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input w-full"
                                placeholder="Minimum 8 characters"
                                minLength={8}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[var(--fg-primary)] mb-2">Confirm Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input w-full"
                                placeholder="Repeat new password"
                            />
                        </div>

                        <div className="pt-4">
                            <button type="submit" disabled={saving} className="btn btn-primary px-8">
                                {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Change Password
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB: TWO-FACTOR AUTH */}
            {activeTab === "twofactor" && (
                <div className="animate-in fade-in duration-300 max-w-lg">
                    <h2 className="text-2xl font-bold text-[var(--fg-primary)] mb-6">Two-Factor Authentication</h2>
                    <p className="text-sm text-[var(--fg-secondary)] mb-6 leading-relaxed">
                        Tambahkan lapisan keamanan ekstra. Setelah aktif, login membutuhkan kode dari aplikasi autentikator (Google Authenticator, Authy, dll) selain password.
                    </p>

                    {twoFactorEnabled ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-xl">
                                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                                <span className="text-sm font-medium text-green-700 dark:text-green-400">2FA aktif di akun Anda.</span>
                            </div>

                            <form onSubmit={handleDisableTwoFactor} className="p-6 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-[var(--fg-primary)] mb-2">Konfirmasi Password</label>
                                    <input 
                                        type="password" 
                                        value={twoFactorPassword}
                                        onChange={(e) => setTwoFactorPassword(e.target.value)}
                                        className="input w-full"
                                        placeholder="Password Anda"
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                    Nonaktifkan 2FA
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {!twoFactorQr ? (
                                <button 
                                    type="button"
                                    onClick={fetchTwoFactorSetup}
                                    disabled={twoFactorLoading}
                                    className="px-6 py-2.5 bg-[var(--accent)] hover:opacity-90 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2"
                                >
                                    {twoFactorLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                    Mulai Pengaturan
                                </button>
                            ) : (
                                <div className="p-6 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl space-y-6">
                                    <div className="flex flex-col items-center gap-4">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={twoFactorQr} alt="QR 2FA" className="w-48 h-48 rounded-lg border border-[var(--border)]" />
                                        {twoFactorSecret && (
                                            <div className="text-center">
                                                <p className="text-xs text-[var(--fg-muted)] mb-1">Kode manual (jika QR tidak terbaca):</p>
                                                <code className="text-sm font-mono bg-[var(--bg-base)] px-3 py-1 rounded">{twoFactorSecret}</code>
                                            </div>
                                        )}
                                    </div>

                                    <form onSubmit={handleEnableTwoFactor} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-[var(--fg-primary)] mb-2">Kode 6 digit dari aplikasi</label>
                                            <input 
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="one-time-code"
                                                maxLength={6}
                                                value={twoFactorCode}
                                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                                                className="input w-full text-center tracking-[0.5em] font-mono text-lg"
                                                placeholder="000000"
                                                required
                                            />
                                        </div>
                                        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[var(--accent)] hover:opacity-90 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                            Aktifkan 2FA
                                        </button>
                                    </form>
                                </div>
                            )}

                            {recoveryCodes.length > 0 && (
                                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-2">Simpan kode pemulihan Anda</h3>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mb-4">Kode ini hanya ditampilkan sekali. Simpan di tempat aman.</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {recoveryCodes.map((code) => (
                                            <code key={code} className="text-xs font-mono bg-white/60 dark:bg-black/20 px-2 py-1.5 rounded border border-amber-200 dark:border-amber-900/30">{code}</code>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* TAB: DELETE ACCOUNT */}
            {activeTab === "delete" && (
                <div className="animate-in fade-in duration-300 max-w-xl">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Delete Account</h2>
                    <p className="text-[var(--fg-secondary)] mb-8 text-sm leading-relaxed">
                        Deleting your account is permanent and will remove all content including comments, avatars and profile settings. Are you sure you want to delete your account?
                    </p>
                    
                    <form onSubmit={handleDeleteAccount} className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-red-800 dark:text-red-400 mb-2">Enter Password to Confirm</label>
                            <input 
                                type="password" 
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="input w-full border-red-200 focus:border-red-500 focus:ring-red-200"
                                placeholder="Your password"
                                required
                            />
                        </div>

                        <div className="flex items-start gap-3">
                            <input type="checkbox" required id="confirmDelete" className="mt-1 w-4 h-4 text-red-600 rounded border-red-300 focus:ring-red-500" />
                            <label htmlFor="confirmDelete" className="text-xs text-red-700 dark:text-red-300">
                                I acknowledge that this action is irreversible and I will lose access to my account data permanently.
                            </label>
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center gap-2">
                                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                Delete Account
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
