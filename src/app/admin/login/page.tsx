
"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal login");
      } else if (data.requireTwoFactor) {
        setTwoFactorStep(true);
      } else {
        // Gunakan navigasi penuh agar layout admin termuat komplet di request pertama.
        window.location.replace("/admin/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  async function handleTwoFactorSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFactorCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Kode 2FA salah");
      } else {
        window.location.replace("/admin/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Decoration */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.35),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.28),_transparent_42%),linear-gradient(135deg,_#2563eb,_#1e3a8a)]" />
        
        <div className="relative z-20 text-white p-12 max-w-lg">
          <div className="mb-8 bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <LayoutDashboard size={32} />
          </div>
          <h2 className="text-4xl font-bold mb-6">Kelola Berita dengan Mudah & Cepat</h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Platform CMS modern untuk jurnalisme digital. Pantau statistik, kelola konten, dan atur iklan dalam satu dashboard terintegrasi.
          </p>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-50 z-20" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500 rounded-full blur-3xl opacity-50 z-20" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex lg:hidden items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-4 shadow-lg shadow-blue-600/30">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{twoFactorStep ? "Verifikasi 2 Langkah" : "Selamat Datang Kembali"}</h1>
            <p className="text-gray-500 mt-2">{twoFactorStep ? "Masukkan kode dari aplikasi autentikator Anda" : "Masuk untuk mengakses dashboard admin"}</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6 text-sm flex items-start animate-fade-in-down">
              <div className="flex-1">{error}</div>
            </div>
          )}

          {twoFactorStep ? (
            <form onSubmit={handleTwoFactorSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Kode 2FA</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <ShieldCheck size={20} />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400 tracking-widest"
                    placeholder="000000"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400">Atau gunakan kode recovery bila kehilangan akses aplikasi autentikator.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/30 transition-all font-bold flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Verifikasi</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setTwoFactorStep(false); setTwoFactorCode(""); setError(""); }}
                className="w-full text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                ← Kembali
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Alamat Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700 block">Password</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-400"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/30 transition-all font-bold flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk Dashboard</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-blue-600 flex items-center justify-center space-x-1 transition-colors">
               <span>← Kembali ke Halaman Depan</span>
            </a>
          </div>
        </div>
        
        <div className="absolute bottom-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} News Portal CMS. All rights reserved.
        </div>
      </div>
    </div>
  );
}
