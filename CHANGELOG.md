# Changelog

Semua perubahan penting pada CMS ini dicatat di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/), dan versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## [1.0.1] - 2026-09-09

### Perbaikan
- Konsistensi tipografi: seluruh widget (Homepage, Post, Archive, Header, Footer) kini mengikuti pengaturan Tipografi Global.
- Font picker widget kini memiliki 3 tingkatan: fallback Tipografi Global, Tipografi Halaman (Homepage/Single Post), dan pemilihan font langsung di pengaturan widget.

## [1.0.0] - 2026-09-08

### Ditambahkan
- Autentikasi dua faktor (2FA) opt-in untuk akun admin.
- Monitoring produktivitas penulis + filter rentang tanggal pada berita populer.
- Pencatatan versi & tanggal rilis di dashboard dan Pengaturan → Status Sistem.

### Keamanan
- Kebijakan sandi yang lebih ketat.
- Hardening middleware autentikasi & otorisasi.
- Rate limiting, pencabutan token JWT (revocation), allowlist CORS, dan security headers.
- Validasi upload, cookie CSRF, mitigasi SSRF, dan salt kunci AI.

### Performa
- Self-host font Poppins, defer GA4, dan stabilisasi CLS hero/iklan.
- Lazy-load gambar artikel, batch view counter, serta cache settings/analytics.
- Optimasi next/image untuk artikel dan cache immutable untuk `/uploads`.

### Perbaikan
- Lockfile cross-platform (Linux sharp/swc) agar `npm ci` dan build VPS berhasil.
- Regenerasi `package-lock.json` agar dependensi lengkap untuk `npm ci`.

## [0.1.0] - 2026-05-27

- Rilis awal CMS (baseline produksi).
