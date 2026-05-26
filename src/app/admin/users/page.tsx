"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Edit2, UserX, UserCheck, AlertTriangle } from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; userId: string; userName: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: search
      });
      
      const res = await fetch(`/api/users?${params.toString()}`);
      
      if (res.status === 403) {
          setToast({ message: "Anda tidak memiliki akses (Admin Only)", type: "error" });
          return;
      }
      
      const data = await res.json();
      
      if (res.ok) {
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        setToast({ message: data.error || "Gagal memuat pengguna", type: "error" });
      }
    } catch (error) {
      console.error("Fetch error", error);
      setToast({ message: "Terjadi kesalahan sistem", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleDelete = async () => {
      if (!deleteModal) return;
      
      try {
          const res = await fetch(`/api/users/${deleteModal.userId}`, {
              method: "DELETE"
          });
          
          if (res.ok) {
              setToast({ message: "User berhasil dihapus (suspended)", type: "success" });
              fetchUsers();
          } else {
              const data = await res.json();
              setToast({ message: data.error || "Gagal menghapus user", type: "error" });
          }
      } catch {
          setToast({ message: "Error saat menghapus user", type: "error" });
      } finally {
          setDeleteModal(null);
      }
  };

  return (
    <div className="p-6 md:p-8 bg-[var(--bg-base)] min-h-screen pb-24 md:pb-8 max-w-[1600px] mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in-down ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-4 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--fg-primary)]">Manajemen Pengguna</h1>
          <p className="text-[var(--fg-secondary)] mt-1">Kelola akses dan role pengguna sistem</p>
        </div>
        <Link 
          href="/admin/users/new" 
          className="btn btn-primary"
        >
          <Plus size={20} />
          Tambah User
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="relative flex-1 md:w-96">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
          <input 
            type="text"
            placeholder="Cari nama atau email..."
            className="input input-search w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--bg-surface)] border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                <th className="px-4 md:px-6 py-3">Pengguna</th>
                <th className="px-4 md:px-6 py-3">Peran</th>
                <th className="px-4 md:px-6 py-3">Status</th>
                <th className="px-4 md:px-6 py-3">Bergabung</th>
                <th className="px-4 md:px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 md:px-6 py-12 text-center text-[var(--fg-muted)]">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Memuat data...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 md:px-6 py-12 text-center text-[var(--fg-muted)]">
                    Tidak ada user ditemukan
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--bg-surface)] transition-colors">
                    <td className="px-4 md:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[var(--fg-primary)]">{user.name}</div>
                          <div className="text-sm text-[var(--fg-muted)]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        user.role === "SUPER_ADMIN" ? "bg-purple-100 text-purple-800" :
                        user.role === "ADMIN" ? "bg-blue-100 text-blue-800" :
                        user.role === "EDITOR" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        user.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                      }`}>
                        {user.status === "ACTIVE" ? <UserCheck size={12} /> : <UserX size={12} />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 text-sm text-[var(--fg-muted)]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 md:px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/admin/users/${user.id}/edit`}
                          className="p-2 text-[var(--fg-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
                          title="Edit User"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, userId: user.id, userName: user.name })}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-4 md:px-6 py-4 border-t border-[var(--border)] flex justify-between items-center bg-[var(--bg-surface)]">
           <button 
             onClick={() => setPage(p => Math.max(1, p - 1))}
             disabled={page === 1}
             className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm disabled:opacity-50 hover:bg-[var(--bg-base)] transition-colors"
           >
             Previous
           </button>
           <span className="text-sm text-[var(--fg-secondary)]">
             Page {page} of {totalPages}
           </span>
           <button 
             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
             disabled={page === totalPages}
             className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm disabled:opacity-50 hover:bg-[var(--bg-base)] transition-colors"
           >
             Next
           </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-xl font-bold text-center mb-2 text-[var(--fg-primary)]">Konfirmasi Hapus</h3>
            <p className="text-[var(--fg-secondary)] text-center mb-6">
              Apakah Anda yakin ingin menonaktifkan user <strong>{deleteModal.userName}</strong>? 
              Akses mereka akan dicabut segera.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2 btn btn-ghost"
              >
                Batal
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Ya, Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
