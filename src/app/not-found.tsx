
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mt-4">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-600 mt-2 mb-8 max-w-md">
        Maaf, halaman atau berita yang Anda cari mungkin sudah dihapus atau tidak tersedia.
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
