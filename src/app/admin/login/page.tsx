
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      } else {
        // Login berhasil, arahkan ke dashboard
        router.push("/admin/dashboard");
        router.refresh(); 
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-90 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        
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
            <h1 className="text-2xl font-bold text-gray-900">Selamat Datang Kembali</h1>
            <p className="text-gray-500 mt-2">Masuk untuk mengakses dashboard admin</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r mb-6 text-sm flex items-start animate-fade-in-down">
              <div className="flex-1">{error}</div>
            </div>
          )}

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

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 flex items-center justify-center space-x-1 transition-colors">
               <span>← Kembali ke Halaman Depan</span>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} News Portal CMS. All rights reserved.
        </div>
      </div>
    </div>
  );
}
