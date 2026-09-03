# PRD — Perbaikan Performa Dashboard Admin

> Dokumen ini adalah **satu-satunya acuan** bagi AI agent / engineer saat mengerjakan perbaikan performa dashboard admin.
> Status: **DRAFT untuk review — belum boleh dieksekusi (jangan ngoding dulu)**.
> Cakupan: **hanya dashboard admin** (`/admin/*`). Jangan menyentuh frontend publik / tema / fitur lain.

---

## 1. Ringkasan & Tujuan

Hampir seluruh halaman dashboard admin terasa lambat saat diakses. Audit menemukan penyebab utamanya **bukan satu query berat**, melainkan **banyak query DB yang tumpang tindih + banyak request client-side paralel** yang semuanya memanggil `requireUser()`.

Tujuan PRD ini:

1. Menetapkan **daftar perbaikan yang pasti** (file + baris + langkah) agar AI agent tidak "halu".
2. Menetapkan **kriteria selesai (Definition of Done)** yang terukur.
3. Menjaga perbaikan **tidak mengubah perilaku** dashboard dan **tidak menyentuh frontend publik**.

---

## 2. Hasil Audit (Akar Masalah — Acuan Tunggal)

Ini temuan yang wajib diperbaiki. AI agent **tidak boleh** mencari-cari penyebab lain di luar daftar ini kecuali diminta.

| ID | Akar masalah | Lokasi |
|---|---|---|
| R1 | Duplikasi query user: `requireUser()` dipanggil di layout + page + tiap API route, masing-masing `prisma.user.findUnique` | `src/lib/server-auth.ts`, `src/app/admin/layout.tsx`, `src/app/admin/dashboard/page.tsx` |
| R2 | Tiga request client-side paralel di semua halaman admin: `tools/enabled`, `version`, `notifications/unread-count` | `Sidebar.tsx`, `AdminHeader.tsx`, `NotificationBell.tsx` |
| R3 | Dashboard jalan 8 query Prisma (6 `count` + 2 `findMany`) | `src/lib/admin/dashboard-data.ts` |
| R4 | Index DB hilang: `Notification` tanpa index `userId`/`read`; `Media` tanpa index `createdAt` | `prisma/schema.prisma` |
| R5 | Prisma logging `query` aktif di development | `src/lib/prisma.ts` |
| R6 | Endpoint `version` & `tools/enabled` `force-dynamic` + `cache: no-store` | `src/app/api/admin/version/route.ts`, `src/app/api/admin/tools/enabled/route.ts` |

**Bukan penyebab (jangan disentuh):** middleware untuk `/admin/*` hanya cek cookie token tanpa query DB, jadi bukan sumber lambat. Fetch internal `/api/redirects/resolve` di middleware hanya untuk GET publik non-admin — di luar scope dokumen ini.

---

## 3. Kendala Wajib (Constraints)

- **C1. Backward compatible.** Perubahan tidak boleh mengubah kontrak data / perilaku dashboard yang ada.
- **C2. Migrasi DB aditif saja.** Hanya tambah index. Jangan drop/rename/ubah tipe. Gunakan `prisma migrate dev` di lokal, `prisma migrate deploy` di server.
- **C3. Jangan sentuh frontend publik / tema / fitur lain.** Scope hanya `/admin/*` dan file helper yang jelas dipakai dashboard.
- **C4. Jangan ubah `.env`.**
- **C5. Setiap item bisa diverifikasi independen** (query count / TTFB / `EXPLAIN`).

---

## 4. Ruang Lingkup

### In-Scope
- Item R1–R6 pada §5.

### Out-of-Scope (jangan dikerjakan)
- Redesign UI/UX dashboard.
- Refactor arsitektur / ganti ORM / ganti framework.
- Optimasi frontend publik, analytics endpoint publik, sitemap, gambar konten.
- Item keamanan / kualitas kode dari PRD sebelumnya (sudah ada dokumen terpisah).

---

## 5. Requirement Detail

Prioritas: **P0** (dampak luas, kerjakan dulu), **P1** (penting), **P2** (opsional/bertahap).

---

### P0-1. Dedup `requireUser()` dengan `React.cache()` — [R1]

- **File**: `src/lib/server-auth.ts`.
- **Masalah**: `requireUser()` tidak di-cache per-request. Dipanggil layout (`layout.tsx` baris 49) + page (`dashboard/page.tsx` baris 10) dalam satu render → 2 query `user.findUnique`. API route yang dipanggil browser tetap query sendiri (request HTTP terpisah, tidak bisa dedup lintas-request).
- **Requirement**:
  1. Bungkus logika `requireUser` dengan `React.cache()` sehingga dalam **satu render tree** query user hanya dijalankan sekali.
  2. `requireAdmin()` tetap memanggil `requireUser()` (jadi ikut ter-dedup).
  3. Jangan ubah return type / perilaku `null` untuk user tidak valid.
- **Acceptance Criteria**:
  - Layout + page dashboard dalam satu request hanya menghasilkan **1 query** `User.findUnique` (verifikasi via Prisma query log / `EXPLAIN`/log aplikasi).
  - Perilaku redirect `/admin/login` untuk user tidak valid tidak berubah.
  - `npm run build` lolos.
- **Catatan teknis**: `React.cache()` aman di server component karena per-request. API route tetap perlu `requireUser()` sendiri (tidak bisa dibagikan lintas request).

---

### P0-2. Kurangi request client-side paralel — [R2, R6]

- **File**: `src/components/admin/Sidebar.tsx`, `src/components/admin/AdminHeader.tsx`, `src/components/admin/NotificationBell.tsx`, `src/app/api/admin/version/route.ts`, `src/app/api/admin/tools/enabled/route.ts`.
- **Masalah**: tiga endpoint di-fetch pas halaman terbuka, semuanya `force-dynamic`/`no-store` dan masing-masing query DB (`requireUser`/`requireAdmin`).
- **Requirement**:
  1. **`tools/enabled`**: beri header cache pendek (mis. `Cache-Control: private, max-age=300` atau Next `revalidate`) agar tidak re-fetch tiap navigasi; pertahankan `no-store` hanya bila benar-benar wajib real-time (seharusnya tidak).
  2. **`version`**: payload sudah di-cache in-memory 30 menit di `resolveVersionPayload`; pastikan `requireUser` di endpoint ini tidak jadi beban — tetap boleh, tapi tambahkan `Cache-Control` client-side singkat bila aman.
  3. **`unread-count`**: tetap fetch saat visible + interval 60s (jangan hapus), tapi pastikan di belakangnya ada index (lihat P0-3).
  4. Jangan ubah perilaku UI notifikasi / tool flag.
- **Acceptance Criteria**:
  - Navigasi antar halaman admin tidak lagi memicu fetch `tools/enabled` berulang (verifikasi Network tab).
  - Tool flags & indikator update version tetap tampil benar.
  - `npm run build` lolos.

---

### P0-3. Tambah index DB yang hilang — [R4]

- **File**: `prisma/schema.prisma`.
- **Masalah**: `Notification` tidak punya index `userId`/`read` → `unread-count` full scan. `Media` tidak punya index `createdAt` → halaman media sort + pagination lambat saat data besar.
- **Requirement** (aditif saja):
  1. `Notification`: tambah `@@index([userId, read])`.
  2. `Media`: tambah `@@index([createdAt])`.
- **Acceptance Criteria**:
  - Migrasi dihasilkan dan bersifat aditif (hanya `CREATE INDEX`).
  - `EXPLAIN` query `notification.count({ where: { userId, read: false } })` memakai index (tidak Seq Scan).
  - `EXPLAIN` query `media.findMany({ orderBy: { createdAt } })` memakai index.
  - `npm run build` lolos.
- **Catatan produksi**: index pada tabel besar bisa mengunci. Di server, buat lewat `CREATE INDEX CONCURRENTLY` (di luar transaksi migrasi) saat trafik rendah, atau jalankan migrasi saat trafik rendah. Jangan `prisma migrate dev` di server.

---

### P0-4. Matikan query logging Prisma di development — [R5]

- **File**: `src/lib/prisma.ts`.
- **Masalah**: `log: ["query", "error", "warn"]` saat development → tiap query dicetak, menambah overhead & kesan lambat.
- **Requirement**:
  1. Jadikan query logging opt-in via env (mis. `PRISMA_LOG_QUERY=true`), default **mati** di development.
  2. Pertahankan `["error"]` di production dan `["error","warn"]` di development.
- **Acceptance Criteria**:
  - Tanpa env flag, terminal dev tidak membanjiri log query.
  - `npm run build` lolos.

---

### P1-5. Konsolidasi query dashboard — [R3]

- **File**: `src/lib/admin/dashboard-data.ts`.
- **Masalah**: 6 `count` terpisah bisa diganti `groupBy`.
- **Requirement** (hati-hati, jangan ubah hasil):
  1. Ganti beberapa `prisma.post.count` (status DRAFT/IN_REVIEW/SCHEDULED/PUBLISHED) dengan **satu** `prisma.post.groupBy({ by: ["status"] })` yang difilter `baseWhere`.
  2. Pertahankan hasil `totalPosts`, `totalPublished`, `totalDrafts`, `totalInReview`, `totalScheduled` **identik**.
  3. Jangan ubah `recentPosts` / `inReviewPosts` / `totalPublishedToday` (tetap sendiri).
- **Acceptance Criteria**:
  - Angka di dashboard sebelum vs sesudah **identik** (spot-check 3 role: ADMIN, EDITOR, WRITER).
  - Jumlah query Prisma di dashboard turun.
  - `npm run build` lolos.

---

### P2-6. (Opsional) Percepat halaman media — [R4 lanjutan]

- **File**: `src/app/api/media/route.ts`.
- **Masalah**: `include: { _count: { select: { posts: true } } }` per baris menambah beban.
- **Requirement**: hanya jika dibutuhkan setelah P0-3 diukur. Tidak wajib. Jangan kerjakan tanpa pengukuran.

---

## 6. Urutan Eksekusi yang Disarankan

1. **P0-4** (paling aman, hilangkan noise log agar pengukuran akurat).
2. **P0-1** (dedup `requireUser`) → dampak luas, risiko kecil.
3. **P0-3** (index DB) → hilangkan full scan.
4. **P0-2** (cache request client-side).
5. **P1-5** (konsolidasi query dashboard) → hanya setelah item lain selesai dan terukur.

Setiap item selesai → ukur dulu (§8) sebelum lanjut ke item berikutnya. Jangan kerjakan semua sekaligus.

---

## 7. Definisi Selesai (Definition of Done)

Per item dianggap **selesai** bila:

1. Acceptance criteria item tersebut lulus.
2. `npm run lint` dan `npm run build` sukses tanpa error baru.
3. Migrasi DB (jika ada) aditif dan `migrate deploy` sukses.
4. Perilaku dashboard tidak berubah (smoke test: login, dashboard, posts, media, users, tools).
5. Tidak menyentuh frontend publik / tema / fitur lain.

---

## 8. Cara Mengukur (Wajib)

Sebelum dan sesudah tiap perbaikan, catat:

- **Jumlah query Prisma** per load halaman (aktifkan sementara query log / gunakan log aplikasi).
- **TTFB / waktu respons** halaman dashboard (Network tab atau `curl -w "%{time_total}"`).
- **`EXPLAIN ANALYZE`** untuk query yang menyentuh index baru (`Notification`, `Media`).

Tulis hasil pengukuran di bawah saat eksekusi (jangan dikosongkan).

| Item | Sebelum | Sesudah | Catatan |
|---|---|---|---|
| P0-1 dedup user | 2 query `User.findUnique` per SSR dashboard | 1 query | dedup via `React.cache()` (layout + page satu render) |
| P0-3 index Notification | Seq Scan pada `Notification` | Index Only Scan `Notification_userId_read_idx` (Index Cond `userId`+`read`) | index terpasang & terkonfirmasi via `EXPLAIN` |
| P0-3 index Media | sort/Seq Scan saat `ORDER BY createdAt` | Index Scan Backward `Media_createdAt_idx` | index terpasang & terkonfirmasi via `EXPLAIN` |
| P0-2 cache request | fetch `tools/enabled` & `version` tiap navigasi | `Cache-Control: private, max-age=300` (cache browser 5 menit) | `no-store` di Sidebar dihapus |
| P1-5 konsolidasi dashboard | 6 `count` + 2 `findMany` = 8 query | 1 `groupBy` + 1 `count` + 2 `findMany` = 4 query | hasil angka identik |

> **Catatan pengukuran**: DB lokal saat ini **kosong** (`Post`, `Notification`, `Media` = 0 baris, `User` = 1). Karena itu pengukuran **waktu (ms)** tidak bermakna — tidak ada data untuk di-scan. Pengukuran di atas berupa **jumlah query (deterministik dari kode)** dan **rencana query (`EXPLAIN`)**. Waktu TTFB aktual perlu diukur ulang saat DB sudah terisi data nyata.

---

## 9. Keputusan & Asumsi

- AI agent **hanya boleh** mengerjakan item pada §5, sesuai urutan §6.
- Jika menemukan masalah di luar daftar §5 → **laporkan dulu**, jangan langsung dikerjakan.
- Asumsi: dashboard diakses mayoritas role ADMIN/SUPER_ADMIN; pengukuran difokuskan pada role tersebut.

---

*Dokumen ini final setelah disetujui pemilik. Sebelum disetujui, AI agent hanya boleh menyusun langkah detail, tidak boleh mengeksekusi perubahan kode.*
