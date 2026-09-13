# Panduan Selaraskan Perbaikan ke Web Lama (news-portal)

Dokumen ini adalah instruksi teknis untuk **AI agent** yang akan menyelaraskan perbaikan
keamanan/performa/kualitas dari project `Pro Kutim` ke project lama
**`D:\Portal News\news-portal`** (repo `https://github.com/aydanputra/News-Portal.git`, `name: news-portal`).

Semua perubahan di bawah **sudah diverifikasi** dengan membandingkan dua source tree secara langsung
(hash SHA256 per file + `git diff --no-index`) pada tanggal pengerjaan. Diff yang ditulis di sini
adalah diff nyata, bukan rekaan.

---

## 0. Ringkasan Audit: Apa yang Sudah Ada vs yang Perlu Dikerjakan

Perbandingan `src/` web lama vs `src/` Pro Kutim menghasilkan:

**Hanya 10 file BEDA**, **1 file perlu ditambah**, **2 file perlu dihapus**.
Sisanya (termasuk `src/lib/ssrf.ts`, `env.ts`, `logger.ts`, `api-error.ts`, `api-guards.ts`,
`block-utils.ts`, `view-batcher.ts`, `ai-key-crypto.ts`, `auth-cookie.ts`, `instrumentation.ts`,
`prisma/schema.prisma`, `next.config.ts`, `sitemap.ts`, `lib/prisma.ts`, `components/PostContent.tsx`,
`lib/settings.ts`, seluruh route dashboard admin, `Sidebar/AdminHeader/NotificationBell`) sudah **SAMA**
= **JANGAN disentuh**.

> **PENTING untuk AI agent:** jangan melakukan refactor besar. Cukup kerjakan 11 item di §3.
> Jika sebuah file tidak disebut di §3, jangan diubah.

### File yang HARUS diubah (10)
| # | File |
|---|------|
| K1 | `src/middleware.ts` |
| K2 | `src/app/[slug]/page.tsx` |
| K3 | `src/app/[slug]/[postSlug]/page.tsx` |
| K4 | `src/app/api/watermark-image/route.ts` |
| K5 | `src/app/api/users/[id]/route.ts` |
| K6 | `src/app/api/media/upload/route.ts` |
| K7 | `src/app/api/admin/import/wordpress/route.ts` |
| K8 | `src/app/api/admin/import/media/route.ts` |
| K9 | `src/lib/env.ts` |
| K10 | `src/app/api/notifications/unread-count/route.ts` |

### File yang HARUS dihapus (2)
| # | File | Alasan |
|---|------|--------|
| K11 | `src/app/loading.tsx` | Penyebab bug **soft-404 / soft-redirect** (lihat §3.K11) |
| K12 | `src/app/api/redirects/resolve/route.ts` | Endpoint HTTP yang tidak dipakai lagi setelah K1 |

### File yang HARUS ditambah (1)
| # | File | Isi |
|---|------|-----|
| K11b | `src/app/admin/loading.tsx` | Spinner pengganti (hanya untuk area admin) |

---

## 1. Prasyarat & Aturan Wajib

1. **Backup dulu.** Sebelum menyentuh kode:
   ```bash
   cd "D:\Portal News\news-portal"
   git status            # pastikan kondisi working tree diketahui
   git stash list        # kalau ada perubahan lokal, komit dulu ke branch kerja
   git checkout -b fix/align-pro-kutim
   ```
2. **Jangan ubah `.env`** milik web lama. Khususnya jangan timpa `MASTER_KEY`, `CRON_SECRET`,
   `DATABASE_URL`, `JWT_SECRET`.
3. **Jangan ubah `prisma/schema.prisma`.** Field `hitCount`, `lastHitAt`, dan index yang dibutuhkan
   sudah identik dengan Pro Kutim. **Tidak ada migrasi DB pada panduan ini.**
4. **Migrasi harus aditif & nol downtime.** Tidak ada perubahan destruktif di sini.
5. Jangan menyalin file utuh dari Pro Kutim ke web lama — proyek berbeda (nama situs, tema, branding).
   Terapkan **hanya hunk diff** di §3.
6. Gate wajib setelah setiap blok perubahan:
   ```bash
   npx tsc --noEmit
   ```

---

## 2. Konteks Teknis (kenapa perubahan ini)

- **Soft-404 / soft-redirect**: `src/app/loading.tsx` di level root membuat Suspense boundary.
  Next.js 15 langsung mengirim shell HTML dengan **HTTP 200** sebelum `permanentRedirect()` /
  `notFound()` selesai. Akibatnya redirect jadi `200` + digest RSC `NEXT_REDIRECT;...`, dan
  halaman tidak ada jadi **soft-404 (status 200)** — buruk untuk SEO & monitoring.
- **Middleware HTTP call per request**: middleware lama melakukan `fetch()` ke
  `/api/redirects/resolve` untuk **setiap** GET publik. Ini menambah latensi + risiko SSRF internal
  dan memanggil runtime middleware (Edge) untuk kerja yang tidak perlu.
- **Cache tag tidak cocok**: di web lama `src/app/[slug]/page.tsx` memakai tag `"redirects"`,
  sedangkan API admin memanggil `revalidateTag("redirect-rule")`. Karena beda nama,
  **mengubah/menghapus aturan redirect tidak menginvalidasi cache** (harus menunggu `revalidate: 300`).

---

## 3. Daftar Perubahan (terapkan berurutan)

### K1 — `src/middleware.ts`: hapus fetch redirect resolver

**Masalah:** setiap GET publik memicu HTTP call internal ke `/api/redirects/resolve`.

**Aksi:** hapus seluruh blok `if (request.method === "GET" && ...)` beserta import
`isBypassedRedirectPath, normalizeRedirectPath`, ganti dengan komentar penanda.

**Diff (old → new):**

```diff
--- a/src/middleware.ts
+++ b/src/middleware.ts
@@ -1,9 +1,8 @@
 import { NextResponse } from "next/server";
 import type { NextRequest } from "next/server";
-import { isBypassedRedirectPath, normalizeRedirectPath } from "@/lib/redirects";
 import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
 
 function isStateChanging(method: string): boolean {
   return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
 }
@@ -68,42 +67,15 @@ export async function middleware(request: NextRequest) {
   // 2. Jika user sudah login tapi mau buka halaman login lagi
   if (pathname.startsWith("/admin/login") && token) {
     // Arahkan langsung ke dashboard
     return NextResponse.redirect(new URL("/admin/dashboard", request.url));
   }
 
-  if (
-    request.method === "GET" &&
-    !pathname.startsWith("/admin") &&
-    !isBypassedRedirectPath(pathname)
-  ) {
-    try {
-      const resolvedPath = normalizeRedirectPath(`${pathname}${request.nextUrl.search || ""}`);
-      const internalPort = process.env.PORT || "3000";
-      const resolveUrl = new URL("/api/redirects/resolve", `http://127.0.0.1:${internalPort}`);
-      resolveUrl.searchParams.set("path", resolvedPath);
-      const response = await fetch(resolveUrl, {
-        headers: { "x-middleware-request": "1" },
-        cache: "no-store",
-      });
-
-      if (response.ok) {
-        const json = await response.json().catch(() => null);
-        if (json?.found && typeof json.location === "string" && json.location.trim() !== "") {
-          const targetUrl = new URL(json.location, request.url);
-          if (!targetUrl.search && request.nextUrl.search) {
-            targetUrl.search = request.nextUrl.search;
-          }
-          return NextResponse.redirect(targetUrl, Number(json.statusCode) || 301);
-        }
-      }
-    } catch {
-      // Abaikan error redirect resolver agar request publik tetap lanjut normal.
-    }
-  }
-
+  // Resolusi redirect (redirectRule) tidak lagi di middleware.
+  // Dilakukan di layer server component ([slug] & [slug]/[postSlug]) memakai
+  // unstable_cache + tag "redirect-rule" agar tidak ada HTTP call per request.
   return NextResponse.next({
     request: {
       headers: requestHeaders,
     },
   });
 }
```

> Pertahankan guard CSRF, proteksi `/admin`, header `requestHeaders`, dan `config.matcher` yang sudah ada.
> Jangan ubah bagian lain di file ini.

---

### K2 — `src/app/[slug]/page.tsx`: tag cache + catat hit redirect

**Masalah:** tag `"redirects"` ≠ `revalidateTag("redirect-rule")` sehingga cache tidak terinvalidasi;
`hitCount`/`lastHitAt` tidak pernah diperbarui.

**Diff:**

```diff
--- a/src/app/[slug]/page.tsx
+++ b/src/app/[slug]/page.tsx
@@ -42,24 +42,35 @@ const getRedirectByPath = cache(async (path: string) => {
   const normalizedPath = normalizeRedirectPath(path);
   const cached = unstable_cache(
     async () => {
       return await prisma.redirectRule.findUnique({
         where: { oldPath: normalizedPath },
         select: {
+          id: true,
           newPath: true,
           statusCode: true,
           isActive: true,
         },
       });
     },
     [`redirect:${normalizedPath}`],
-    { tags: ["redirects"], revalidate: 300 },
+    { tags: ["redirect-rule"], revalidate: 300 },
   );
   return cached();
 });
 
+// Catat hit redirect (fire-and-forget). Di-dedupe per request via React cache().
+const recordRedirectHit = cache(async (id: string) => {
+  await prisma.redirectRule
+    .update({
+      where: { id },
+      data: { hitCount: { increment: 1 }, lastHitAt: new Date() },
+    })
+    .catch(() => null);
+});
+
 const getHeaderFooterBlocks = cache(async (activeTheme: string) => {
   const cached = unstable_cache(
     async () => {
@@ -100,12 +111,13 @@ export async function generateMetadata(
     const [redirectRule, category] = await Promise.all([
       getRedirectByPath(`/${slug}`),
       getCategoryBySlug(slug),
     ]);
 
     if (redirectRule?.isActive && redirectRule.newPath) {
+      void recordRedirectHit(redirectRule.id);
       permanentRedirect(redirectRule.newPath);
     }
 
@@ -166,12 +178,13 @@ export default async function CustomPage(props: { params: Promise<{ slug: string
   const redirectRule = await getRedirectByPath(`/${slug}`);
   if (redirectRule?.isActive && redirectRule.newPath) {
+    void recordRedirectHit(redirectRule.id);
     permanentRedirect(redirectRule.newPath);
   }
```

> `cache` dan `unstable_cache` sudah diimport di file ini. Jangan tambah import baru.

---

### K3 — `src/app/[slug]/[postSlug]/page.tsx`: fallback redirectRule + catat hit

**Masalah:** kalau post tidak ditemukan, hanya ada fallback pindah-kategori; aturan redirect
manual (`redirectRule`) belum dipertimbangkan.

**Diff:**

```diff
--- a/src/app/[slug]/[postSlug]/page.tsx
+++ b/src/app/[slug]/[postSlug]/page.tsx
@@ -11,12 +11,13 @@ import { getCachedCategories } from "@/lib/data";
 import { toPublicPostPreviewList } from "@/lib/post-preview";
+import { normalizeRedirectPath } from "@/lib/redirects";
 import { collectWidgetsRecursive, getOrder, hasId, type BuilderBlock } from "@/lib/block-utils";
@@ -169,12 +170,37 @@ const getPostRedirectTarget = cache(async (slug: string, categorySlug: string) =
   );
 
   return cached();
 });
 
+const getRedirectRuleByPath = cache(async (path: string) => {
+  const normalizedPath = normalizeRedirectPath(path);
+  const cached = unstable_cache(
+    async () => {
+      return await prisma.redirectRule.findUnique({
+        where: { oldPath: normalizedPath },
+        select: { id: true, newPath: true, statusCode: true, isActive: true },
+      });
+    },
+    [`redirect:${normalizedPath}`],
+    { tags: ["redirect-rule"], revalidate: 300 },
+  );
+  return cached();
+});
+
+// Catat hit redirect (fire-and-forget). Di-dedupe per request via React cache().
+const recordRedirectHit = cache(async (id: string) => {
+  await prisma.redirectRule
+    .update({
+      where: { id },
+      data: { hitCount: { increment: 1 }, lastHitAt: new Date() },
+    })
+    .catch(() => null);
+});
+
 const getHeaderFooterBlocks = cache(async (activeTheme: string) => {
@@ -817,12 +843,17 @@ export default async function CategoryPostPage(props: { params: Promise<{ slug:
 
   if (!post) {
     const redirectTarget = await getPostRedirectTarget(postSlug, categorySlug);
     if (redirectTarget) {
       permanentRedirect(`/${redirectTarget.categorySlug}/${redirectTarget.postSlug}`);
     }
+    const redirectRule = await getRedirectRuleByPath(`/${categorySlug}/${postSlug}`);
+    if (redirectRule?.isActive && redirectRule.newPath) {
+      void recordRedirectHit(redirectRule.id);
+      permanentRedirect(redirectRule.newPath);
+    }
     notFound();
   }
```

> Jika `normalizeRedirectPath` sudah diimport di file ini, **jangan duplikasi import**-nya.
> Pastikan `prisma` sudah tersedia di file ini (sudah dipakai oleh fungsi cache lain).

---

### K4 — `src/app/api/watermark-image/route.ts`: tutup celah SSRF via redirect

**Masalah:** `fetch(value, { redirect: "follow" })` bisa diarahkan ke host internal
(contoh `169.254.169.254` metadata cloud) walaupun host awal lolos `hostIsBlocked()`.

**Diff:**

```diff
--- a/src/app/api/watermark-image/route.ts
+++ b/src/app/api/watermark-image/route.ts
@@ -92,16 +92,23 @@ async function readInputBuffer(input: string): Promise<Buffer | null> {
 
     if (!/^https?:\/\//i.test(value)) return null;
 
     const url = new URL(value);
     if (await hostIsBlocked(url.hostname)) return null;
 
-    const response = await fetch(value, { redirect: "follow", cache: "force-cache" });
-    if (!response.ok) return null;
+    const response = await fetch(value, { redirect: "manual", cache: "force-cache" });
+    if (response.status < 200 || response.status >= 300) return null;
+
+    const location = response.headers.get("location");
+    if (location) {
+      const redirectedUrl = new URL(location, value);
+      if (await hostIsBlocked(redirectedUrl.hostname)) return null;
+      return readInputBuffer(redirectedUrl.toString());
+    }
 
-    const finalUrl = new URL(response.url);
+    const finalUrl = new URL(response.url || value);
     if (await hostIsBlocked(finalUrl.hostname)) return null;
 
     const arrayBuffer = await response.arrayBuffer();
     return Buffer.from(arrayBuffer);
   } catch {
     return null;
```

> Rekursi `readInputBuffer` mengikuti redirect secara manual, dan tiap host tujuan divalidasi ulang.
> Karena `hostIsBlocked` sudah ada di web lama, hanya hunk ini yang perlu diterapkan.

---

### K5 — `src/app/api/users/[id]/route.ts`: error handling terstruktur

**Masalah:** `catch (error: any)` + `error.message` membocorkan detail internal ke client.

**Diff:**

```diff
--- a/src/app/api/users/[id]/route.ts
+++ b/src/app/api/users/[id]/route.ts
@@ -1,12 +1,13 @@
 import { NextResponse } from "next/server";
 import { prisma } from "@/lib/prisma";
 import { requireAdmin } from "@/lib/server-auth";
 import { Role } from "@prisma/client";
 import bcrypt from "bcryptjs";
 import { validatePasswordStrength } from "@/lib/password-policy";
+import { internalError } from "@/lib/api-error";
@@ -46,15 +47,14 @@ export async function GET(
-  } catch (error: any) {
-    console.error("Get User Error:", error);
-    return NextResponse.json({ error: error.message || "Failed to fetch user" }, { status: 500 });
+  } catch (error: unknown) {
+    return internalError(error, { route: "GET /api/users/[id]" });
   }
 }
@@ -124,15 +124,14 @@ export async function PUT(
-    } catch (error) {
-      console.error("Update User Error:", error);
-      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
+    } catch (error: unknown) {
+      return internalError(error, { route: "PUT /api/users/[id]" });
     }
 }
@@ -163,11 +162,10 @@ export async function DELETE(
-    } catch (error) {
-      console.error("Delete User Error:", error);
-      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
+    } catch (error: unknown) {
+      return internalError(error, { route: "DELETE /api/users/[id]" });
     }
 }
```

> `internalError` sudah ada di `src/lib/api-error.ts` (identik dengan Pro Kutim).
> Logika A3 (tolak non-SUPER_ADMIN mengubah role SUPER_ADMIN) **sudah ada** di web lama — jangan diubah.

---

### K6 — `src/app/api/media/upload/route.ts`: error handling terstruktur

```diff
--- a/src/app/api/media/upload/route.ts
+++ b/src/app/api/media/upload/route.ts
@@ -3,12 +3,13 @@
 import { assertRateLimit } from "@/lib/api-guards";
+import { internalError } from "@/lib/api-error";
@@ -150,21 +151,19 @@ export async function POST(request: Request) {
-    } catch (dbError: any) {
-        console.error("Database save failed:", dbError);
+    } catch (dbError: unknown) {
         try {
           await storage.delete(key);
-        } catch (error) {
-          console.error("Cleanup uploaded file failed:", error);
+        } catch (cleanupError) {
+          console.error("Cleanup uploaded file failed:", cleanupError);
         }
-        return NextResponse.json({ error: "Gagal menyimpan data ke database: " + dbError.message }, { status: 500 });
+        return internalError(dbError, { route: "POST /api/media/upload", stage: "db-save" });
     }
 
-  } catch (error: any) {
-    console.error("Upload error:", error);
-    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
+  } catch (error: unknown) {
+    return internalError(error, { route: "POST /api/media/upload" });
   }
 }
```

> Validasi magic-bytes (`detectDocType`, `docMagicMatches`, batas 5MB/10MB) **sudah ada** di web lama.
> Jangan diubah.

---

### K7 — `src/app/api/admin/import/wordpress/route.ts`: hapus debug logger + password acak

**Masalah 1:** ada blok debug (`reportWpImportDebug`, `#region debug-point ...`) yang menulis ke
folder `.dbg/` dan menembak `http://127.0.0.1:7777/event` — sisa investigasi, harus dibuang.
**Masalah 2:** user dummy dibuat dengan password literal `"temp-password-change-me"` dan
`"admin-password"` → dapat ditebak.

**Diff:**

```diff
--- a/src/app/api/admin/import/wordpress/route.ts
+++ b/src/app/api/admin/import/wordpress/route.ts
@@ -1,14 +1,16 @@
 import { NextRequest, NextResponse } from "next/server";
 import { prisma } from "@/lib/prisma";
 import { parseStringPromise } from "xml2js";
 import { Role, PostStatus, PostType } from "@prisma/client";
 import fs from "fs";
 import path from "path";
-import bcrypt from "bcryptjs";
+import { randomBytes } from "crypto";
+import { hashPassword } from "@/lib/auth";
 import { assertRateLimit, isToolEnabledForRequest } from "@/lib/api-guards";
+import { internalError } from "@/lib/api-error";
 import { requireAdmin } from "@/lib/server-auth";
 import { normalizeRedirectPath } from "@/lib/redirects";
@@ -37,47 +39,12 @@ function isValidDate(value: Date) {
- // #region debug-point A...  (hapus seluruh fungsi reportWpImportDebug)
-// #endregion
-
 // Advanced WP Auto Paragraph function
@@ -115,77 +82,33 @@ export async function POST(req: NextRequest) {
-    const traceId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
     try {
         const admin = await requireAdmin();
@@ -284,14 +207,15 @@
                 if (!user) {
-                    // Create dummy user
-                    const hashedPassword = await bcrypt.hash("temp-password-change-me", 10);
+                    // Create dummy user with a random, non-guessable password.
+                    // The imported author must reset the password before signing in.
+                    const hashedPassword = await hashPassword(randomBytes(24).toString("base64url"));
@@ -338,14 +262,14 @@
-                            // Emergency fallback: Create a default admin user
-                            const hashedAdminPassword = await bcrypt.hash("admin-password", 10);
+                            // Emergency fallback: Create a default admin user with a random password.
+                            const hashedAdminPassword = await hashPassword(randomBytes(24).toString("base64url"));
@@ -561,24 +485,10 @@
-    } catch (error: any) {
-        // #region debug-point E:catch  (hapus seluruh blok)
-        // #endregion
-        console.error("Import Error:", error);
-        return NextResponse.json({ error: error.message }, { status: 500 });
+    } catch (error: unknown) {
+        return internalError(error, { route: "POST /api/admin/import/wordpress" });
     }
 }
```

**Aksi tambahan:** hapus semua `// #region debug-point ...` / `// #endregion` yang tersisa di file ini,
serta seluruh pemanggilan `reportWpImportDebug(...)` (ada di titik B, C, D, dan E).
Setelah bersih, `fs`/`path` mungkin masih dipakai bagian lain — **verifikasi dengan `npx tsc --noEmit`**
sebelum menghapus import yang jadi tidak terpakai.

> Opsional: hapus file `D:\Portal News\news-portal\.dbg\wp-import-formdata.env` dan
> folder `.dbg/` bila tidak dipakai fitur lain.

---

### K8 — `src/app/api/admin/import/media/route.ts`: error handling terstruktur

```diff
--- a/src/app/api/admin/import/media/route.ts
+++ b/src/app/api/admin/import/media/route.ts
@@ -2,12 +2,13 @@
 import { requireAdmin } from "@/lib/server-auth";
+import { internalError } from "@/lib/api-error";
 import { hostIsBlocked } from "@/lib/ssrf";
@@ -261,14 +262,14 @@ export async function GET(req: NextRequest) {
-        } catch (error: any) {
-            return NextResponse.json({ error: error.message }, { status: 500 });
+        } catch (error: unknown) {
+            return internalError(error, { route: "GET /api/admin/import/media" });
         }
@@ -383,14 +384,13 @@ export async function POST(req: NextRequest) {
-        } catch (error: any) {
-            console.error("Migration error:", error);
-            return NextResponse.json({ error: error.message }, { status: 500 });
+        } catch (error: unknown) {
+            return internalError(error, { route: "POST /api/admin/import/media", stage: "migration" });
         }
```

> Blok SSRF (`hostIsBlocked`) **sudah ada** di web lama. Jangan diubah.

---

### K9 — `src/lib/env.ts`: fail-fast variabel wajib di production

**Masalah:** `MASTER_KEY` dan `CRON_SECRET` dipakai fitur 2FA, enkripsi kunci AI, dan endpoint cron.
Tanpa keduanya, aplikasi gagal saat runtime (membingungkan) alih-alih saat startup.

**Diff (tambahkan tepat setelah blok `if (!parsed.success) { ... }`):**

```diff
--- a/src/lib/env.ts
+++ b/src/lib/env.ts
@@ -27,7 +27,18 @@ if (!parsed.success) {
   const details = parsed.error.issues
     .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
     .join("; ");
   throw new Error(`[env] Konfigurasi environment tidak valid — ${details}`);
 }
 
+// Fail-fast di production: fitur 2FA, enkripsi kunci AI, dan endpoint cron
+// bergantung pada dua variabel ini. Tanpa keduanya, aplikasi akan gagal saat
+// runtime (membingungkan) alih-alih gagal saat startup (jelas).
+if (process.env.NODE_ENV === "production") {
+  const requiredInProduction = ["MASTER_KEY", "CRON_SECRET"] as const;
+  const missing = requiredInProduction.filter((key) => !parsed.data[key]);
+  if (missing.length > 0) {
+    throw new Error(`[env] Variabel wajib di production tidak diset: ${missing.join(", ")}`);
+  }
+}
+
 export const env = parsed.data;
```

> **WAJIB**: pastikan `MASTER_KEY` dan `CRON_SECRET` benar-benar sudah diset di `.env`/environment
> produksi web lama **sebelum** deploy. Kalau tidak, aplikasi akan sengaja gagal start.

---

### K10 — `src/app/api/notifications/unread-count/route.ts`: buang `@ts-ignore`

```diff
--- a/src/app/api/notifications/unread-count/route.ts
+++ b/src/app/api/notifications/unread-count/route.ts
@@ -5,13 +5,12 @@ import { requireUser } from "@/lib/server-auth";
 export async function GET() {
   try {
     const user = await requireUser();
 
     if (!user) return NextResponse.json({ count: 0 });
 
-    // @ts-ignore
     const count = await prisma.notification.count({
       where: {
         userId: user.id,
         read: false
       }
     });
```

> Sudah diuji: setelah `@ts-ignore` dibuang, `npx tsc --noEmit` tetap lolos (directive usang).

---

### K11 — HAPUS `src/app/loading.tsx`, TAMBAH `src/app/admin/loading.tsx`

**Ini perbaikan paling penting.** Root `loading.tsx` menyebabkan soft-404 & soft-redirect.

**Aksi 1 — hapus file `D:\Portal News\news-portal\src\app\loading.tsx`:**

```tsx
// ISI LAMA YANG HARUS DIHAPUS (jangan biarkan file ini ada):
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Memuat berita...</p>
      </div>
    </div>
  );
}
```

**Aksi 2 — buat file baru `src/app/admin/loading.tsx`** (spinner tetap ada, tapi hanya di area admin
yang bukan halaman SEO):

```tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Memuat...</p>
      </div>
    </div>
  );
}
```

> **Jangan** memindahkan `loading.tsx` ke `src/app/(public)/loading.tsx` atau serupa.
> Halaman publik harus tidak punya Suspense boundary di atasnya agar redirect/404 mengembalikan
> status HTTP yang benar.

---

### K12 — HAPUS `src/app/api/redirects/resolve/route.ts`

Endpoint ini hanya dipanggil oleh middleware lama (sudah dihapus di K1). Setelah K1 diterapkan,
file ini menjadi dead code dan sekaligus permukaan serangan (endpoint internal tanpa auth).

```bash
git rm src/app/api/redirects/resolve/route.ts
```

> Sudah diverifikasi: **tidak ada** referensi lain ke `/api/redirects/resolve` di seluruh `src/`.

---

## 4. Urutan Eksekusi yang Disarankan

1. Backup & buat branch: `git checkout -b fix/align-pro-kutim`
2. K11 (hapus `app/loading.tsx` + tambah `app/admin/loading.tsx`) → `npx tsc --noEmit`
3. K1 (middleware) + K12 (hapus route resolve) → `npx tsc --noEmit`
4. K2 + K3 (tag `redirect-rule` + `recordRedirectHit`) → `npx tsc --noEmit`
5. K4 (SSRF watermark) → `npx tsc --noEmit`
6. K5, K6, K10 (error handling + `@ts-ignore`) → `npx tsc --noEmit`
7. K7, K8 (import WP/media) → `npx tsc --noEmit`
8. K9 (env fail-fast) → `npx tsc --noEmit` **dan** pastikan `MASTER_KEY`/`CRON_SECRET` ada
9. Build: `npm run build`
10. Uji manual (§5) → commit → PR → merge ke `main` → deploy

---

## 5. Verifikasi / QA (uji manual)

Jalankan server produksi di port terpisah (mis. 3200) supaya tidak bentrok dengan dev server.
**Peringatan:** jangan menjalankan `next dev` dan `next start` bersamaan pada folder `.next` yang sama —
artefak build akan rusak. Gunakan `NEXT_DIST_DIR` terpisah, atau matikan dev server dulu.

```bash
npm run build
npx next start -p 3200
```

Lalu uji (ganti `:3200` bila perlu):

| # | Perintah | Harapan |
|---|----------|---------|
| 1 | `curl -s -o NUL -w "%{http_code}" http://localhost:3200/` | `200` |
| 2 | `curl -s -o NUL -w "%{http_code}" http://localhost:3200/halaman-tidak-ada-xyz` | **`404`** (bukan 200) |
| 3 | Buat `RedirectRule` uji via admin (`oldPath=/uji-redirect-lama`, `newPath=/tentang-kami`), lalu `curl -s -D - -o NUL http://localhost:3200/uji-redirect-lama` | **`308`** + header `location: /tentang-kami` (bukan 200) |
| 4 | `curl -s -o NUL -w "%{http_code}" http://localhost:3200/admin` | `307` + `location: /admin/login` |
| 5 | `curl -s -o NUL -w "%{http_code}" "http://localhost:3200/api/watermark-image?src=http://169.254.169.254/latest/meta-data/"` | `400` (SSRF diblokir) |
| 6 | `curl -s -o NUL -w "%{http_code}" http://localhost:3200/api/settings` | `401` |
| 7 | `curl -s -o NUL -w "%{http_code}" -X POST -H "Origin: https://evil.example.com" -H "Cookie: __Host-auth_token=dummy.jwt.value" -H "Content-Type: application/json" -d "{}" http://localhost:3200/api/posts` | `403` (CSRF) |
| 8 | `curl -s "http://localhost:3200/api/public/settings"` | tidak memuat `notificationSmtpPass` / `aiApiKey` / `MASTER_KEY` |
| 9 | Ubah aturan redirect di admin, lalu ulang #3 **tanpa menunggu** | perubahan langsung berlaku (bukti tag `redirect-rule` bekerja) |

**Bukti eksperimen yang sudah dilakukan di Pro Kutim:**
- Sebelum K11: `/uji-c1-lama` → **HTTP 200** dengan digest RSC `NEXT_REDIRECT;replace;/berita-baru;308;`,
  dan URL acak → **200** (soft-404).
- Sesudah K11: `/uji-c1-lama` → **308 + Location benar**, URL acak → **404 asli**.
- Hapus data uji `RedirectRule` setelah selesai.

---

## 6. Deployment (zero-downtime)

Tidak ada perubahan schema DB pada panduan ini, jadi tidak ada migrasi.

```bash
# di server, pakai PM2 sesuai ecosystem.config.js yang sudah ada
git pull
npm ci
npm run build
pm2 reload ecosystem.config.js      # reload, bukan restart, agar zero-downtime
pm2 logs --lines 50
```

Jika web lama memakai `distDir` khusus (`.next-prod`), sesuaikan perintah build.

---

## 7. Checklist Akhir

- [ ] Branch kerja dibuat, bukan langsung di `main`
- [ ] `src/app/loading.tsx` **DIHAPUS**
- [ ] `src/app/admin/loading.tsx` **DIBUAT**
- [ ] `src/app/api/redirects/resolve/route.ts` **DIHAPUS**
- [ ] `src/middleware.ts` tanpa `fetch()` redirect resolver
- [ ] Tag cache `[slug]/page.tsx` = `"redirect-rule"` (bukan `"redirects"`)
- [ ] `recordRedirectHit` aktif di kedua file halaman
- [ ] `watermark-image` pakai `redirect: "manual"` + validasi host tujuan
- [ ] Semua `catch` di 4 file memakai `internalError` (bukan `error.message` ke client)
- [ ] `reportWpImportDebug` + seluruh `#region debug-point` terhapus
- [ ] Password dummy import = `randomBytes(24)` (bukan literal)
- [ ] `env.ts` fail-fast `MASTER_KEY`/`CRON_SECRET`; kedua var benar-benar diset di produksi
- [ ] `@ts-ignore` di `unread-count` terhapus
- [ ] `npx tsc --noEmit` → exit 0
- [ ] `npm run build` → sukses
- [ ] Uji manual §5 lolos semua
- [ ] `git status` bersih dari file `.tmp_*` yang tidak diinginkan

---

## 8. Prompt Siap Pakai untuk AI Agent

> Salin-tempel teks berikut ke AI agent yang bekerja di `D:\Portal News\news-portal`:

```
Baca file `docs/Panduan-Selaraskan-Perbaikan-ke-Web-Lama.md` (ada di root project ini;
salinan master tersimpan di `D:\Pro Kutim\docs\`) dan terapkan
perubahan K1–K12 ke project ini (news-portal) secara berurutan.

Aturan:
- Kerjakan HANYA 12 item di §3. Jangan refactor, jangan sentuh file lain.
- Jangan ubah .env, prisma/schema.prisma, atau package.json.
- Setelah setiap item, jalankan `npx tsc --noEmit` dan pastikan exit 0.
- Untuk K7, hapus seluruh blok `#region debug-point` dan semua pemanggilan
  `reportWpImportDebug`, lalu pastikan tidak ada import yang jadi menganggur.
- Setelah semua selesai, jalankan `npm run build` dan laporkan output ringkas.
- Laporkan: daftar file diubah/ditambah/dihapus, hasil `tsc --noEmit`, hasil build,
  dan item checklist §7 yang belum bisa diverifikasi otomatis.
- Jangan gunakan `git commit`/`git push` tanpa izin saya.
```
