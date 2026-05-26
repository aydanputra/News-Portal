import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Ambil cookie 'auth_token'
  const token = request.cookies.get("auth_token")?.value;
  
  // Halaman yang mau kita cek
  const pathname = request.nextUrl.pathname;

  // 1. Jika user mengakses halaman admin (selain login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // Jika tidak ada tiket, tendang ke login
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // 2. Jika user sudah login tapi mau buka halaman login lagi
  if (pathname.startsWith("/admin/login") && token) {
    // Arahkan langsung ke dashboard
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

// Konfigurasi: Middleware hanya aktif di path tertentu
export const config = {
  matcher: ["/admin/:path*"],
};
