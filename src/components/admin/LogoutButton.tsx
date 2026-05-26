
"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      // Panggil API Logout (untuk hapus cookie httpOnly di server)
      await fetch("/api/auth/logout", { method: "POST" });
      
      // Hapus cookie client-side jika ada (opsional)
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

      // Redirect ke login
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  }

  return (
    <button 
      onClick={handleLogout}
      className="w-full flex items-center space-x-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
    >
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  );
}
