# PRD — Perbaikan Keamanan & Performa News Portal

> Dokumen ini adalah satu-satunya acuan bagi AI agent / engineer saat mengerjakan perbaikan.
> Status: **DRAFT untuk review — belum boleh dieksekusi**.

---

## 1. Ringkasan & Tujuan

Project `news-portal` sudah **aktif di produksi (VPS)**. Hasil quality-control audit menemukan sejumlah celah keamanan, kendala performa, dan masalah kualitas kode.

Tujuan PRD ini:

1. Menjabarkan **persis apa yang harus diperbaiki**, kenapa, dan bagaimana mengukurnya.
2. Memastikan **setiap perbaikan aman di-deploy sebagai update**, tanpa mengganggu website yang sedang berjalan.
3. Memberi **kriteria selesai (Definition of Done)** yang jelas agar tidak ada pekerjaan yang "halu" atau menyimpang dari kebutuhan.

---

## 2. Kendala Wajib (Constraints) — BACA DULU SEBELUM KERJA

Ini kendala yang **tidak boleh dilanggar** oleh AI agent:

- **C1. Tidak boleh down.** Website aktif di VPS. Tidak boleh ada window down lebih dari beberapa detik saat deploy.
- **C2. Backward compatible.** Perubahan API/admin harus tetap bekerja dengan data dan perilaku yang sudah ada. Jangan ubah kontrak data yang dipakai frontend publik.
- **C3. Migrasi DB harus aditif (additive) & aman.** Tidak boleh ada migrasi yang menghapus kolom/tabel atau mengubah tipe data secara destruktif. Gunakan `prisma migrate deploy`, **bukan** `prisma migrate dev`, di server.
- **C4. Backup sebelum migrasi.** Wajib backup database sebelum `migrate deploy`.
- **C5. `.env` tidak boleh diubah isinya** tanpa persetujuan eksplisit pemilik.
- **C6. Jangan hapus/mengganti aset lama** (`public/uploads`, tema yang masih dipakai) saat perbaikan.
- **C7. Setiap perubahan berisiko tinggi harus bisa di-rollback cepat** (lihat §7).

---

## 3. Prinsip Deployment Aman (Non-Functional)

1. **Zero-downtime**: deploy via `npm run build` lalu `pm2 reload news-portal-core` (reload, bukan `restart`/`delete`).
2. **Rollback**: simpan artefak build `.next` sebelumnya (atau git tag) sehingga bisa `pm2 reload` ke build lama dalam hitungan menit.
3. **Cache invalidation**: setelah deploy, panggil endpoint `/api/revalidate` (atau `revalidateTag` yang relevan) agar cache ISR tidak menyajikan data lama yang tidak konsisten.
4. **Feature flag** untuk perubahan perilaku yang berisiko (sanitasi konten, guard SSRF) agar bisa dimatikan cepat tanpa redeploy jika terjadi regresi.
5. **Staging**: uji di lingkungan lokal (`.env` + Docker Postgres port 5433) sebelum deploy ke VPS.

---

## 4. Ruang Lingkup

### In-Scope
- Semua item pada §5 (Kelompok A–D).

### Out-of-Scope (jangan dikerjakan)
- Redesign UI/UX, perubahan tema, fitur baru.
- Migrasi besar-besaran penggantian `any` di seluruh 166 file (hanya file yang disebut di §5).
- Refactor arsitektur menyeluruh.
- Penggantian ORM / framework.

---

## 5. Requirement Detail

Prioritas: **P0** (kritis, segera), **P1** (penting), **P2** (perbaikan bertahap).

---

### Kelompok A — Keamanan Kritis (P0)

#### A1. Sanitasi konten di tema Pranala (XSS)
- **File**: `src/themes/pranala/components/PranalaPostContent.tsx` (sekitar baris 924).
- **Masalah**: `parse(content, options)` tanpa `sanitizeContent` → potensi XSS dari konten import WordPress / editor.
- **Requirement**:
  1. Import `sanitizeContent` dari `@/lib/sanitizer`.
  2. Sanitasi `content` menjadi `safeContent` sebelum `parse`.
  3. Gunakan `safeContent` di semua titik (termasuk deteksi embed di `useEffect`).
- **Acceptance Criteria**:
  - Post berisi `<script>` / `onerror=` / `javascript:` ter-strip.
  - Iframe YouTube/Vimeo, gambar, tabel, embed sosial tetap tampil normal.
  - **Tidak ada regresi** render post yang sudah terbit (spot-check 5–10 artikel lama).
- **Dampak produksi**: hanya mengubah cara render konten; harus diverifikasi tidak merusak konten lama.

#### A2. Amankan `/api/watermark-image` (SSRF + local file read)
- **File**: `src/app/api/watermark-image/route.ts`.
- **Masalah**: endpoint publik bisa membaca file lokal `public/*` dan fetch URL internal (metadata, intranet).
- **Requirement**:
  1. Batasi pembacaan file lokal hanya ke prefix `uploads/` (pertahankan blok `..`).
  2. Tolak URL eksternal dengan host = IP privat/loopback/link-local (10/8, 172.16/12, 192.168/16, 169.254/16, 127/8, `::1`, `fc00::/7`, `fe80::/10`, multicast).
  3. Resolusi DNS hostname dan tolak bila ada A/AAAA privat.
  4. `fetch` dengan `redirect: "manual"` (tidak ikuti redirect) untuk mencegah bypass SSRF.
- **Acceptance Criteria**:
  - `?src=http://169.254.169.254/...` dan `?src=http://127.0.0.1/...` ditolak.
  - Gambar watermark normal dari `uploads/` dan domain publik tetap berfungsi.
- **Dampak produksi**: gambar ber-watermark pada artikel harus tetap tampil.

#### A3. Cegah privilege escalation role
- **File**: `src/app/api/users/[id]/route.ts` (baris 99–101).
- **Masalah**: `ADMIN` bisa set role user lain ke `SUPER_ADMIN`.
- **Requirement**:
  1. Jika `role === "SUPER_ADMIN"` dan `currentUser.role !== "SUPER_ADMIN"` → tolak 403.
  2. (Opsional) hanya `SUPER_ADMIN` yang boleh mengubah role siapa pun.
- **Acceptance Criteria**:
  - Login `ADMIN`, PUT role `SUPER_ADMIN` ke user lain → 403.
  - `SUPER_ADMIN` tetap bisa menetapkan role.
- **Dampak produksi**: tidak memengaruhi frontend publik; hanya panel admin.

#### A4. Hentikan kebocoran secret di GET `/api/settings`
- **File**: `src/app/api/settings/route.ts` (baris 239–247) + `src/app/admin/settings/page.tsx` (baris 145–155, 268–276).
- **Masalah**: `notificationTelegramBotToken`, `notificationSmtpPass` (dan `notificationTelegramChatId` jika dianggap sensitif) dikirim plaintext ke client admin.
- **Catatan**: endpoint `/api/public/settings` **sudah aman** (pakai `stripSecrets`), jangan disentuh.
- **Requirement**:
  1. Ganti nilai plaintext dengan flag boolean, mis. `notificationTelegramBotTokenConfigured`, `notificationSmtpPassConfigured`.
  2. UI admin: tampilkan status "sudah dikonfigurasi"; input kosong = "biarkan kosong jika tidak diubah". Hanya kirim nilai baru bila diisi.
- **Acceptance Criteria**:
  - Response GET settings tidak lagi memuat token/password plaintext.
  - Alur simpan notifikasi (Telegram & SMTP) tetap berfungsi penuh.
- **Dampak produksi**: wajib backward compatible dengan panel admin saat deploy bersamaan.

#### A5. Filter status non-publish di GET publik `/api/posts/[id]`
- **File**: `src/app/api/posts/[id]/route.ts` (baris 67–75).
- **Masalah**: GET tanpa autentikasi mengembalikan post berstatus apa pun (DRAFT/SCHEDULED/ARCHIVED/REJECTED).
- **Requirement**:
  1. Tanpa token valid → tambah filter `status: "PUBLISHED"` (+ `publishedAt` tidak null bila relevan).
  2. Dengan token role berwenang → tetap bisa akses penuh.
- **Acceptance Criteria**:
  - GET post `DRAFT` tanpa login → 404/403.
  - Admin login tetap bisa akses.
- **Dampak produksi**: memastikan tidak ada kebocoran konten belum terbit.

---

### Kelompok B — Keamanan Prioritas Sedang (P1)

#### B1. Validasi upload file
- **File**: `src/app/api/media/upload/route.ts`, `src/app/api/upload/route.ts`, `src/lib/storage.ts`.
- **Requirement**: whitelist ekstensi + magic bytes server-side; batas ukuran; jangan fallback ke file asli saat proses image gagal; validasi `key` terhadap path traversal di `storage.upload`.
- **Acceptance**: file berbahaya (ekstensi/tipe tak diizinkan) ditolak; upload gambar normal tetap jalan.

#### B2. CSRF & cookie flags
- **File**: `src/app/api/auth/login/route.ts` (baris 59–65).
- **Requirement**: cookie `__Host-` prefix + `sameSite: "strict"` untuk admin, `secure` di produksi, tambah CSRF token untuk endpoint state-changing.
- **Acceptance**: session admin aman dari CSRF; login/logout tetap normal.

#### B3. Token revocation / cek status DB
- **File**: `src/lib/auth.ts` (baris 27–39), `src/lib/server-auth.ts` (baris 20).
- **Requirement**: `requireUser`/`requireAdmin` cek `status === "ACTIVE"` **dan** `deletedAt === null`; pindahkan route yang masih `verifyToken` manual ke helper ini.
- **Acceptance**: user di-suspend/hapus tidak bisa akses walau token belum expired.

#### B4. Hash password import WordPress
- **File**: `src/app/api/admin/import/wordpress/route.ts` (baris 294, 349).
- **Requirement**: gunakan `hashPassword` dari `@/lib/auth` untuk user hasil import; jangan simpan plaintext.
- **Acceptance**: user import bisa login dengan password yang di-set saat import.

#### B5. SSRF di import media
- **File**: `src/app/api/admin/import/media/route.ts` (baris 151–184).
- **Requirement**: terapkan guard SSRF yang sama dengan A2 + batas ukuran file.
- **Acceptance**: import gambar dari URL publik tetap jalan; URL internal ditolak.

#### B6. Salt acak untuk enkripsi AI key
- **File**: `src/app/api/settings/route.ts` (baris 14–16).
- **Requirement**: simpan salt acak per record (prepend ke ciphertext), bukan konstanta `"news-portal-ai-openai"`. Pertahankan kompatibilitas dekripsi data lama (fallback baca format lama).
- **Acceptance**: AI key terenkripsi dengan salt unik; data lama tetap bisa didekripsi.

---

### Kelompok C — Performa & Optimasi (P0/P1)

#### C1. Hilangkan fetch redirect resolver di middleware (P0)
- **File**: `src/middleware.ts` (baris 33–61).
- **Masalah**: fetch internal sync + query DB per request publik → latensi semua halaman.
- **Requirement**:
  1. Jangan fetch per request di middleware. Muat aturan redirect via `unstable_cache`/edge cache.
  2. Atau batasi matcher ke path yang benar-benar punya pola redirect.
  3. Pertahankan fungsi redirect publik tetap bekerja.
- **Acceptance**: TTFB halaman publik turun; redirect rules tetap aktif.
- **Dampak produksi**: perubahan kritis pada hot path → butuh staging + rollback plan.

#### C2. Cache `getSettings()` + hilangkan duplikasi query (P0)
- **File**: `src/lib/settings.ts` (baris 161–184), `src/app/layout.tsx` (baris 152, 182).
- **Requirement**: bungkus `getSettings()` dengan `unstable_cache`/`cache()`; panggil sekali dan share antara `generateMetadata` dan render.
- **Acceptance**: jumlah query `setting` per render turun dari 2 menjadi 1 (atau 0 via cache).

#### C3. Optimasi gambar konten post (P1)
- **File**: `src/components/PostContent.tsx` (baris 381), `src/lib/content-images.ts` (baris 13).
- **Requirement**: render gambar konten via `next/image`/optimizer atau `loading="lazy"` + `srcset`. Pastikan tidak konflik dengan sanitizer.
- **Acceptance**: ukuran transfer gambar konten turun; tampilan tetap benar.

#### C4. Composite index DB (P1)
- **File**: `prisma/schema.prisma` (baris 149–154).
- **Requirement**: tambah index komposit `[status, publishedAt]`, `[categoryId, status, publishedAt]`, index `views` untuk sort populer.
- **Acceptance**: query list/sort `views` memakai index (cek `EXPLAIN`).
- **Dampak produksi**: index pada tabel besar bisa mengunci — buat via `CREATE INDEX CONCURRENTLY` di luar transaksi migrasi, atau jalankan saat trafik rendah.

#### C5. Kurangi beban query dashboard analytics (P1)
- **File**: `src/app/api/analytics/overview/route.ts` (baris 93–258).
- **Requirement**: kurangi 15 query → agregasi lebih sedikit / `unstable_cache` interval / materialized view.
- **Acceptance**: waktu respons dashboard turun; data tetap akurat per interval.

#### C6. Kurangi write view tracking (P1)
- **File**: `src/app/api/track-view/route.ts` (baris 44–92), `src/app/api/track-public-page-view/route.ts` (baris 57–97).
- **Requirement**: batch/queue atau increment periodik untuk hindari 2–3 write per request.
- **Acceptance**: jumlah write DB per halaman turun; hitungan tayang tetap konsisten.

#### C7. Tinjau `minimumCacheTTL` 1 tahun (P2)
- **File**: `next.config.ts` (baris 13).
- **Requirement**: pastikan URL gambar selalu UUID baru saat konten diganti; turunkan TTL bila perlu.
- **Acceptance**: gambar yang diganti tidak menyajikan versi lama.

#### C8. Perjelas `sitemap.ts` force-dynamic vs cache (P2)
- **File**: `src/app/sitemap.ts` (baris 5, 14).
- **Requirement**: pilih satu strategi (cache atau real-time), hapus kontradiksi.
- **Acceptance**: perilaku sitemap konsisten.

#### C9. Prisma pooling (P2)
- **File**: `src/lib/prisma.ts` (baris 10–14).
- **Requirement**: set `connection_limit`/`pool_timeout` eksplisit; pertimbangkan PgBouncer.
- **Acceptance**: tidak ada "too many connections" saat trafik tinggi.

---

### Kelompok D — Kualitas Kode & Arsitektur (P1/P2)

#### D1. Reduksi `any` (P1)
- **File**: `src/app/api/posts/route.ts`, `src/app/api/settings/route.ts`, `src/app/[slug]/[postSlug]/page.tsx`.
- **Requirement**: ganti `any`/`as any`/`@ts-ignore` dengan tipe spesifik pada file yang disebut (bertahap, tanpa mengubah perilaku).

#### D2. Ekstrak helper duplikat (P1)
- **Requirement**: buat `src/lib/block-utils.ts` untuk `isVisible`, `getOrder`, `getChildren`, `getResponsiveValue`, dll.; gunakan di semua pemakai.

#### D3. Deduplikasi `globalStyles` di settings (P1)
- **File**: `src/app/api/settings/route.ts`.
- **Requirement**: ekstrak jadi satu builder `buildGlobalStyles(setting)`.

#### D4. Central env validation (P1)
- **Requirement**: skema env (Zod) divalidasi saat startup; hapus `as string` pada `MASTER_KEY` dan fallback `"dummy"` S3.

#### D5. Error handling terstruktur (P2)
- **Requirement**: standarkan response error; jangan kembalikan `error.message` mentah; kirim error ke Sentry.

#### D6. Structured logging (P2)
- **Requirement**: ganti `console.*` dengan logger ber-level + correlation ID; tambah Sentry capture di API route.

#### D7. Bersihkan `.tmp_*` (P2)
- **Requirement**: hapus file temp di root; tambah pola `.tmp_*` ke `.gitignore`.

---

## 6. Urutan Eksekusi yang Disarankan

1. **P0 Keamanan** (A1–A5).
2. **P0 Performa** (C1, C2).
3. **P1 Keamanan + Performa** (B1–B6, C3–C6).
4. **P1 Kualitas** (D1–D4).
5. **P2** (C7–C9, D5–D7).

Setiap batch selesai → lakukan verifikasi & deploy bertahap (jangan semua sekaligus).

---

## 7. Strategi Deployment (Zero-Downtime) — WAJIB DIPATUHI

### 7.1 Sebelum Deploy
1. Backup database: `pg_dump` ke file ber-timestamp.
2. Pastikan `git status` bersih; buat tag release (mis. `release-fix-v0.1.1`).
3. Uji di staging/lokal (`npm run build` + smoke test).

### 7.2 Saat Deploy
1. Build di server: `npm run build` (akan `prisma generate`).
2. Terapkan migrasi (aditif saja): `prisma migrate deploy`.
3. Reload PM2 tanpa down: `pm2 reload news-portal-core`.
4. Invalidasi cache ISR (revalidateTag / `/api/revalidate`).

### 7.3 Rollback
- Simpan build `.next` lama sebelum build baru (atau `git checkout` tag lama + build ulang).
- Jika regresi: `pm2 reload` ke build lama; migrasi aditif tidak perlu di-rollback (aman ditinggal).
- Jika ada migrasi yang bermasalah: gunakan `prisma migrate resolve` hanya setelah backup terverifikasi.

### 7.4 Aturan Migrasi DB (PENTING)
- **Hanya migrasi aditif**: tambah kolom/index/tabel baru. Jangan drop/rename/ubah tipe yang ada.
- Index pada tabel besar → `CREATE INDEX CONCURRENTLY` (lewat SQL manual) untuk hindari lock.
- Jangan jalankan `prisma migrate dev` di server (itu untuk development).

---

## 8. Plan Pengujian (QA)

- **Unit/regresi**: pastikan `npm run lint` dan `npm run build` lolos.
- **Keamanan**: uji setiap A-item dengan payload XSS/SSRF yang relevan (manual/otomatis).
- **Performa**: ukur TTFB dan waktu respons sebelum/sesudah untuk C1, C2, C5, C6.
- **Smoke test publik**: beranda, detail artikel (termasuk gambar + watermark + embed), kategori, sitemap, robots.
- **Smoke test admin**: login, kelola user, settings (notifikasi), media upload, import.
- **Rollback drill**: verifikasi bisa kembali ke build lama dalam < 10 menit.

---

## 9. Definition of Done (Kriteria Selesai)

Perbaikan dianggap **selesai & layak deploy** hanya bila **semua** terpenuhi:

1. Semua acceptance criteria pada §5 untuk item yang dikerjakan lulus.
2. `npm run lint` dan `npm run build` sukses tanpa error baru.
3. Migrasi DB bersifat aditif; backup tersedia; `migrate deploy` sukses.
4. Smoke test publik + admin lulus.
5. Tidak ada regresi pada konten/fitur yang sudah berjalan.
6. Deployment memakai `pm2 reload` (zero-downtime); cache ISR di-invalidasi.
7. Rencana rollback tersedia dan pernah diuji.
8. `.env` tidak berubah tanpa persetujuan pemilik.

---

## 10. Keputusan & Asumsi (SUDAH DISETUJUI)

Keputusan final dari pemilik (per tanggal review):

1. **A4 — `notificationTelegramChatId`**: dianggap sensitif → **di-mask** bersama `notificationTelegramBotToken` dan `notificationSmtpPass`. Gunakan flag `configured`; input kosong = "tidak diubah".
2. **B2 — Cookie admin**: gunakan **`sameSite: "strict"`** + **CSRF token** untuk endpoint state-changing. Validasi ulang alur login admin sebelum deploy.
3. **C4 — Index komposit**: buat dengan **`CREATE INDEX CONCURRENTLY`** (tanpa lock), dijalankan di jam trafik rendah via script/step manual, **bukan** `prisma migrate` biasa.
4. **Versi/Tag**: repo GitHub `https://github.com/aydanputra/News-Portal.git`. Hasil audit Git (per review):
   - **Belum ada tag** sama sekali → konvensi tag dimulai dari nol.
   - **Branch workflow**: `dev` → PR → `main`. Commit memakai prefix konvensional (`dev:`, `admin:`, `builder:`, `tools:`).
   - **Produksi = `main`**, HEAD lokal == `origin/main` (commit `b59f289`), working tree bersih.
   - Catatan: remote-tracking lokal `origin/main` stale (`gone`) → wajib `git fetch` sebelum tagging/deploy.
   - Konvensi tag yang disepakati: baseline `v0.1.0-prod-baseline` di commit produksi saat ini; tiap batch lolos QA → tag `v0.1.1-security`, `v0.1.2-perf`, dst. Perbaikan dikerjakan di **feature branch** off `main`, lalu PR ke `main`.

Asumsi lain yang tetap berlaku:

- **A1**: konten post lama diasumsikan sudah bersih dari tag berbahaya; tetap wajib spot-check setelah sanitasi diterapkan.
- **A4**: alur simpan notifikasi (Telegram & SMTP) harus tetap berfungsi penuh setelah masking.
- **B2**: `sameSite: "strict"` tidak boleh memutus alur login/redirect admin — masuk daftar smoke test.

---

*Dokumen ini final setelah disetujui pemilik. Sebelum disetujui, AI agent hanya boleh menyusun langkah detail, tidak boleh mengeksekusi perubahan kode.*
