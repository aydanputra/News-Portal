# MD Summary — Project Perbaikan Lanjutan (Next.js News Portal)

Dokumen ini adalah checklist kerja perbaikan lanjutan berdasarkan audit internal sebelum website rilis publik.  
Saya akan menandai item menjadi selesai setelah benar-benar diimplementasikan dan terverifikasi (minimal build + smoke check).

## Status Saat Ini
- Branch kerja: `dev`
- Branch release: `main`

## Phase 0 — Freeze & Safety Net
- [x] Pisahkan workflow branch `dev` (development) dan `main` (release/production).
- [ ] Rotasi semua secret yang pernah terekspos (Neon/SMTP/Telegram/JWT) lalu update ke Vercel.
- [ ] Samakan dan pastikan env production Vercel lengkap: `JWT_SECRET`, `DATABASE_URL`, `DIRECT_URL`, `CRON_SECRET`, `MASTER_KEY`.

## Phase 1 — Security Hotfix (Critical)
- [x] Implement helper auth reusable (`requireUser`, `requireAdmin`) untuk API routes.
- [x] Kunci endpoint Pages (CRUD) dengan auth + role:
  - `/api/pages`
  - `/api/pages/[id]`
- [x] Kunci endpoint revalidate (wajib secret/auth):
  - `/api/revalidate`
- [x] Split settings menjadi:
  - [x] `GET /api/public/settings` (aman untuk publik/theme)
  - [x] `GET /api/admin/settings` (lengkap, wajib admin)
  - [x] Kunci `/api/settings` agar hanya admin (menghentikan leakage ke publik).
- [x] Tutup XSS untuk Page:
  - [x] Sanitasi `page.content` saat `POST/PUT` pages (server-side).
  - [x] Defense-in-depth: pastikan render Page tidak mem-passthrough HTML mentah tanpa sanitasi.
- [x] Tambahkan rate limit minimal untuk endpoint rawan:
  - [x] `/api/auth/login`
  - [x] `/api/media/upload` dan `/api/upload`
  - [x] `/api/revalidate`

## Phase 2 — Stabilitas & Observability (High)
- [x] Rapikan error handling:
  - [x] Hilangkan `catch {}` kosong (minimal log error + context).
  - [x] Standarisasi bentuk response error API (`{ error, details? }`).
- [x] Tambahkan error monitoring (contoh: Sentry) server + client.
- [x] Hardening session/cookie:
  - [x] Set `sameSite` eksplisit pada `auth_token`.
  - [x] Pastikan logout invalidasi cookie berjalan konsisten.

## Phase 3 — Performance & Scalability (High)
- [x] Cabut `force-dynamic` / `revalidate=0` untuk halaman publik:
  - [x] Homepage → ISR (contoh 60–300 detik) + revalidate tag saat publish.
  - [x] Post page → ISR (contoh 300–900 detik) + revalidate tag saat update.
- [x] Pindahkan view counting keluar dari SSR render path:
  - [x] Endpoint `/api/track-view` (debounce + bot/prefetch filtering + rate limit).
  - [x] Update UI/client agar memanggil tracking setelah page benar-benar dilihat user.
- [x] Kurangi waterfall/N+1 pada Page Builder:
  - [x] Audit query per widget.
  - [x] Batch query & caching per tag/blok.
- [x] Optimasi arsip & search:
  - [x] Cache + parallel widget fetch untuk `/tag/[slug]`, `/kategori/[slug]`, `/search`.
  - [x] Tambah index trigram (pg_trgm) untuk mempercepat pencarian `contains/ILIKE`.

## Phase 4 — Maintainability (Medium)
- [ ] Deduplicate komponen Page Builder:
  - [ ] Satukan `src/app/admin/homepage/components/*` dan `src/components/admin/page-builder/*`.
  - [x] Dedup types (homepage → re-export ke shared).
  - [x] Dedup komponen yang identik (ColorPicker, SectionPicker, LegacyBlock) via re-export.
- [ ] Tingkatkan type-safety:
  - [x] Tambahkan validasi query param untuk endpoint publik `/api/public/posts` (Zod).
  - [ ] Kurangi `any` dan `@ts-ignore` bertahap (mulai dari request/response API).
  - [ ] Gunakan `z.infer` untuk DTO.
- [x] Repo hygiene dasar:
  - [x] Ignore `*.backup` agar dump DB tidak ikut repo.
  - [x] Bersihkan `.DS_Store` / `._*` yang sempat ikut ter-commit, dan pastikan ter-ignore.

## Phase 5 — SEO Readiness (Medium)
- [x] Tambahkan:
  - [x] `app/sitemap.ts`
  - [x] `app/robots.ts`
- [x] Tambahkan canonical URL + `metadataBase`.
- [x] Tambahkan structured data JSON-LD (Article) untuk post.

## Phase 6 — DevOps & Release (Medium)
- [x] CI minimal (GitHub Actions):
  - [x] `npm ci`
  - [x] `npm run lint`
  - [x] `npm run build`
- [ ] Migration safety:
  - [ ] Pastikan `prisma migrate deploy` konsisten di staging sebelum promote ke production.
- [ ] Backup & rollback:
  - [ ] Neon backup schedule + prosedur restore.
  - [ ] Rencana VPS: pg_dump harian + offsite + retention.

## Catatan Implementasi
- Setiap item ditandai selesai hanya setelah:
  - perubahan sudah di-push ke branch terkait,
  - deploy/staging tidak error,
  - smoke test lulus (admin login, CRUD post, load homepage & post).

