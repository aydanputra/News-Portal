import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isBypassedRedirectPath, normalizeRedirectPath } from "@/lib/redirects";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

function isStateChanging(method: string): boolean {
  return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
}

// Host publik yang dipakai browser untuk mengirim request. Di belakang nginx
// pakai X-Forwarded-Host/Host (nilai domain publik), bukan nextUrl.host yang
// bisa ter-resolve ke alamat internal (127.0.0.1:PORT) dan memicu false-positive
// CSRF pada request same-origin produksi.
function getPublicHost(request: NextRequest): string | null {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) return forwardedHost.split(",")[0].trim();
  return request.headers.get("host");
}

// CSRF: tolak request state-changing lintas-origin yang membawa cookie auth.
// Defence-in-depth di atas SameSite=Strict + __Host- cookie.
function isCrossSiteForbidden(request: NextRequest): boolean {
  if (!isStateChanging(request.method)) return false;
  if (!request.cookies.get(AUTH_COOKIE_NAME)?.value) return false;

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const host = getPublicHost(request) ?? request.nextUrl.host;
      if (new URL(origin).host !== host) return true;
    } catch {
      return true;
    }
  }

  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") return true;

  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Bypass middleware for large multipart upload on WP importer route.
  // Auth is still enforced inside the route handler via requireAdmin().
  if (pathname === "/api/admin/import/wordpress") {
    return NextResponse.next();
  }

  if (isCrossSiteForbidden(request)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Ambil cookie auth
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-admin-pathname", pathname);

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

  if (
    request.method === "GET" &&
    !pathname.startsWith("/admin") &&
    !isBypassedRedirectPath(pathname)
  ) {
    try {
      const resolvedPath = normalizeRedirectPath(`${pathname}${request.nextUrl.search || ""}`);
      const internalPort = process.env.PORT || "3000";
      const resolveUrl = new URL("/api/redirects/resolve", `http://127.0.0.1:${internalPort}`);
      resolveUrl.searchParams.set("path", resolvedPath);
      const response = await fetch(resolveUrl, {
        headers: { "x-middleware-request": "1" },
        cache: "no-store",
      });

      if (response.ok) {
        const json = await response.json().catch(() => null);
        if (json?.found && typeof json.location === "string" && json.location.trim() !== "") {
          const targetUrl = new URL(json.location, request.url);
          if (!targetUrl.search && request.nextUrl.search) {
            targetUrl.search = request.nextUrl.search;
          }
          return NextResponse.redirect(targetUrl, Number(json.statusCode) || 301);
        }
      }
    } catch {
      // Abaikan error redirect resolver agar request publik tetap lanjut normal.
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Konfigurasi: Middleware hanya aktif di path tertentu
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
