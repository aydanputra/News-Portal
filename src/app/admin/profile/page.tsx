"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Lock, Save, Loader2, AlertTriangle, CheckCircle, Trash2, Globe, Twitter, Facebook, Instagram, Youtube, Linkedin, Twitch, Camera, Music2 } from "lucide-react";
import Image from "next/image";
import MediaLibraryModal, { Media } from "@/app/admin/components/MediaLibraryModal";

type TabType = "profile" | "social" | "password" | "delete";

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
