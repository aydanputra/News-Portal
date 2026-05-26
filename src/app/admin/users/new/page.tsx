"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, User, Mail, Lock, CheckCircle, AlertCircle, AtSign, AlignLeft, Send } from "lucide-react";
import Link from "next/link";

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentRole, setCurrentRole] = useState<string>("");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState("WRITER");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active) return;
        setCurrentRole(data?.role || "");
      })
      .catch(() => {
        if (!active) return;
        setCurrentRole("");
      });
    return () => {
      active = false;
    };
  }, []);

  const roles = useMemo(() => {
    const base = ["WRITER", "EDITOR", "ADMIN"];
    if (currentRole === "SUPER_ADMIN") base.push("SUPER_ADMIN");
    return base;
  }, [currentRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (passwordConfirm && password !== passwordConfirm) {
        setError("Konfirmasi password tidak sama");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, username, telegramChatId, bio }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/users");
        router.refresh();
      } else {
        setError(data.error || "Gagal membuat user");
      }
    } catch {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-[var(--fg-primary)]">Tambah Pengguna Baru</h1>
          <p className="text-[var(--fg-muted)] text-sm">Buat akun baru untuk tim redaksi dan atur hak aksesnya</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-0 overflow-hidden space-y-0 border-[var(--border)] shadow-xl shadow-black/5">
        {error && (
          <div className="m-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-3 border border-red-100 dark:border-red-900/30">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="p-6 md:p-10 space-y-12">
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
                    style={{ paddingLeft: "52px" }}
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
                    style={{ paddingLeft: "52px" }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username_unik (opsional)"
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
                    style={{ paddingLeft: "52px" }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider ml-1">Telegram Chat ID</label>
                <div className="relative group">
                  <Send className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                  <input
                    type="text"
                    className="input w-full h-12 bg-[var(--bg-base)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ paddingLeft: "52px" }}
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="Contoh: 123456789 (opsional)"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider ml-1">Bio / Deskripsi Penulis</label>
                <div className="relative group">
                  <AlignLeft className="absolute left-4 top-4 text-[var(--fg-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                  <textarea
                    className="input w-full min-h-[120px] py-4 bg-[var(--bg-base)] border-[var(--border)] focus:border-[var(--accent)] leading-relaxed"
                    style={{ paddingLeft: "52px" }}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tulis biografi singkat penulis untuk ditampilkan pada profil publik... (opsional)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
              <div className="p-2 bg-[var(--accent-subtle)] text-[var(--accent)] rounded-lg">
                <Lock size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[var(--fg-primary)]">
                Role & Hak Akses
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {roles.map((r) => (
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
                    <span className={`text-sm font-black tracking-widest ${role === r ? "text-[var(--accent)]" : "text-[var(--fg-primary)]"}`}>
                      {r}
                    </span>
                    {role === r && (
                      <div className="bg-[var(--accent)] text-white rounded-full p-1 shadow-sm">
                        <CheckCircle size={14} />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed font-medium">
                    {r === "WRITER" && "Akses terbatas pada penulisan dan pengelolaan artikel pribadi."}
                    {r === "EDITOR" && "Memiliki wewenang untuk meninjau, mengedit, dan menerbitkan konten tim."}
                    {r === "ADMIN" && "Akses penuh ke konfigurasi sistem, manajemen user, dan data portal."}
                    {r === "SUPER_ADMIN" && "Akses tertinggi untuk pengelolaan sistem, keamanan, dan kontrol penuh."}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
              <div className="p-2 bg-[var(--accent-subtle)] text-[var(--accent)] rounded-lg">
                <Lock size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[var(--fg-primary)]">
                Keamanan Akun
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="input w-full h-12 bg-[var(--bg-base)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ paddingLeft: "52px" }}
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-[var(--fg-muted)] mt-2 ml-1 italic">Gunakan kombinasi huruf, angka, dan simbol untuk keamanan.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider ml-1">Konfirmasi Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="input w-full h-12 bg-[var(--bg-base)] border-[var(--border)] focus:border-[var(--accent)]"
                    style={{ paddingLeft: "52px" }}
                    placeholder="Ulangi password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

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
            Simpan User
          </button>
        </div>
      </form>
    </div>
  );
}
