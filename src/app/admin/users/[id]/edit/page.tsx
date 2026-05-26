"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, User, Mail, Lock, CheckCircle, AlertCircle, AtSign, AlignLeft, Send } from "lucide-react";
import Link from "next/link";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [role, setRole] = useState("WRITER");
  const [status, setStatus] = useState("ACTIVE");
  const [password, setPassword] = useState(""); // Optional update

  useEffect(() => {
      const fetchUser = async () => {
          try {
              const res = await fetch(`/api/users/${id}`);
              const data = await res.json();

              if (!res.ok) {
                throw new Error(data.error || `Error ${res.status}: Gagal mengambil data user`);
              }
              
              setName(data.name || "");
              setEmail(data.email || "");
              setUsername(data.username || "");
              setBio(data.bio || "");
              setTelegramChatId(data.telegramChatId || "");
              setRole(data.role);
              setStatus(data.status);
          } catch (err: any) {
              console.error("Fetch User Error:", err);
              setError(err.message || "User tidak ditemukan atau terjadi kesalahan server");
          } finally {
              setFetching(false);
          }
      };
      fetchUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: any = { 
        name, 
        email, 
        role, 
        status,
        username,
        bio,
        telegramChatId
      };
      if (password && password.length >= 8) {
          payload.password = password;
      }

      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/users");
        router.refresh();
      } else {
        setError(data.error || "Gagal update user");
      }
    } catch {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
      return (
          <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
          </div>
      );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8">
      <div className="mb-8 flex items-center gap-4">
        <Link 
          href="/admin/users" 
          className="p-2 hover:bg-[var(--bg-surface)] rounded-lg text-[var(--fg-muted)] transition-colors border border-transparent hover:border-[var(--border)]"
        >
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg-primary)]">Edit Pengguna</h1>
          <p className="text-[var(--fg-muted)] text-sm">Perbarui informasi profil dan hak akses pengguna</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-0 overflow-hidden space-y-0 border-[var(--border)] shadow-xl shadow-black/5">
        {error && (
          <div className="m-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-3 border border-red-100 dark:border-red-900/30">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Header Section: Account Status */}
        <div className={`p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
            status === 'ACTIVE' ? 'bg-green-50/30 dark:bg-green-900/5' : 'bg-red-50/30 dark:bg-red-900/5'
        }`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${status === 'ACTIVE' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                  <User size={24} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--fg-muted)] mb-1">Status Keanggotaan</div>
                  <div className={`text-lg font-black flex items-center gap-2 ${status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {status === 'ACTIVE' ? 'Aktif' : 'Ditangguhkan'}
                  </div>
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">Ubah Status</label>
                <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="input min-w-[200px] bg-[var(--bg-base)] font-bold text-sm h-11 border-[var(--border)]"
                >
                    <option value="ACTIVE">Aktif (Normal)</option>
                    <option value="SUSPENDED">Tangguhkan Akun</option>
                </select>
            </div>
        </div>

        <div className="p-6 md:p-10 space-y-12">
          {/* Section 1: Identitas */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
              <div className="p-2 bg-[var(--accent-subtle)] text-[var(--accent)] rounded-lg">
                <User size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[var(--fg-primary)]">
                Identitas Pengguna
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider ml-1">Nama Lengkap</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                    <input
                      type="text"
                      required
                      className="input w-full h-12 bg-[var(--bg-base)] border-[var(--border)] focus:border-[var(--accent)]"
                      style={{ paddingLeft: '52px' }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider ml-1">Username</label>
                  <div className="relative group">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                    <input
                      type="text"
                      className="input w-full h-12 bg-[var(--bg-base)] border-[var(--border)] focus:border-[var(--accent)]"
                      style={{ paddingLeft: '52px' }}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username_unik"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider ml-1">Alamat Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      className="input w-full h-12 bg-[var(--bg-base)] border-[var(--border)] focus:border-[var(--accent)]"
                      style={{ paddingLeft: '52px' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--fg-muted)] mt-1.5 ml-1 italic">Email digunakan sebagai identitas login pengguna.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider ml-1">Telegram Chat ID</label>
                  <div className="relative group">
                    <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                    <input
                      type="text"
                      className="input w-full h-12 bg-[var(--bg-base)] border-[var(--border)] focus:border-[var(--accent)]"
                      style={{ paddingLeft: '52px' }}
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="Contoh: 123456789"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--fg-muted)] mt-1.5 ml-1">Gunakan Chat ID pribadi untuk notifikasi langsung.</p>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider ml-1">Bio / Deskripsi Penulis</label>
                  <div className="relative group">
                    <AlignLeft className="absolute left-4 top-4 text-[var(--fg-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                    <textarea
                      className="input w-full min-h-[120px] py-4 bg-[var(--bg-base)] border-[var(--border)] focus:border-[var(--accent)] leading-relaxed"
                      style={{ paddingLeft: '52px' }}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tulis biografi singkat penulis untuk ditampilkan pada profil publik..."
                    />
                  </div>
                </div>
            </div>
          </div>

          {/* Section 2: Role Selection */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
              <div className="p-2 bg-[var(--accent-subtle)] text-[var(--accent)] rounded-lg">
                <Lock size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[var(--fg-primary)]">
                Role & Hak Akses
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {['WRITER', 'EDITOR', 'ADMIN'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative group ${
                    role === r 
                      ? "border-[var(--accent)] bg-[var(--accent-subtle)] shadow-md" 
                      : "border-[var(--border)] hover:border-[var(--fg-muted)] bg-[var(--bg-base)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-black tracking-widest ${role === r ? 'text-[var(--accent)]' : 'text-[var(--fg-primary)]'}`}>
                      {r}
                    </span>
                    {role === r && (
                      <div className="bg-[var(--accent)] text-white rounded-full p-1 shadow-sm">
                        <CheckCircle size={14} />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed font-medium">
                    {r === 'WRITER' && 'Akses terbatas pada penulisan dan pengelolaan artikel pribadi.'}
                    {r === 'EDITOR' && 'Memiliki wewenang untuk meninjau, mengedit, dan menerbitkan konten tim.'}
                    {r === 'ADMIN' && 'Akses penuh ke konfigurasi sistem, manajemen user, dan data portal.'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Password Security */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
              <div className="p-2 bg-[var(--accent-subtle)] text-[var(--accent)] rounded-lg">
                <Lock size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[var(--fg-primary)]">
                Keamanan Akun
              </h3>
            </div>
            
            <div className="max-w-md space-y-2">
              <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider ml-1">Reset Password (Opsional)</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                <input
                  type="password"
                  minLength={8}
                  className="input w-full h-12 bg-[var(--bg-base)] border-[var(--border)] focus:border-[var(--accent)]"
                  style={{ paddingLeft: '52px' }}
                  placeholder="Isi hanya jika ingin mengganti password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-[var(--fg-muted)] mt-2 ml-1 italic">Kosongkan jika tidak ada permintaan perubahan kata sandi.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-8 bg-[var(--bg-surface)] border-t border-[var(--border)] flex flex-col sm:flex-row justify-end gap-4">
          <Link
            href="/admin/users"
            className="btn h-12 px-10 border border-[var(--border)] hover:bg-[var(--bg-base)] text-[var(--fg-primary)] font-bold transition-all justify-center"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary h-12 px-10 justify-center gap-3 shadow-xl shadow-blue-500/25 font-bold transition-all active:scale-95"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
