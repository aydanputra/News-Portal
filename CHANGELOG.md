# Changelog

Semua perubahan penting pada CMS ini dicatat di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/), dan versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## [1.0.5] - 2026-09-09

### Performa
- `Merriweather` kini self-hosted via `next/font/google`; hentikan request remote `Merriweather` dari tema pranala (mengurangi render-blocking font).
- Petakan font self-hosted (`Inter`/`Poppins`/`Sora`/`Merriweather`) ke CSS variable `next/font` di semua renderer (heading, body, dan widget) agar glyph tetap tampil tanpa request eksternal.
- Kurangi preload font yang tidak aktif di tema (`Poppins` 7 weight dan `Sora`) agar tidak bersaing dengan gambar LCP.
- Ganti `useLayoutEffect` ke `useEffect` pada deteksi device `HeroSlider` agar tidak memblokir render pertama (menekan `elementRenderDelay`).

## [1.0.4] - 2026-09-09

### Performa
- Logo header di atas fold kini `priority` + `fetchPriority="high"` agar tidak menunda FCP/LCP.
- Hentikan request duplikat font `Poppins`/`Inter`/`Sora` yang sudah self-hosted via `next/font` (bersihkan beban remote font).

## [1.0.3] - 2026-09-09

### Performa
- Stabil CLS Hero & HeroSlider: tinggi shell kini via CSS variable responsif (`--rh-*`), bukan state JS.
- Stabil CLS slot iklan (AdBanner): reserve tinggi minimum agar slot tidak menyusut setelah fetch.
- Font Google remote dimuat async (non render-blocking) untuk mempercepat FCP.
- Hapus rewrite `/uploads` ke API agar gambar diserve statis langsung dari `public/uploads` (LCP lebih cepat).

## [1.0.2] - 2026-09-09

### Perbaikan
- Perbaiki pengaturan Font Size widget `post_content` (Konten Artikel) yang tidak berubah, baik dari Tipografi Single Post global maupun pengaturan widget langsung.
- Hapus nilai bawaan `fontSize:18` yang tersisa pada preset dan blok lama agar fallback tipografi global berfungsi.
- Normalisasi blok publik dari cache agar blok lama dengan `fontSize:18` dibersihkan.
- Wariskan `font-size` dan `line-height` ke paragraf, daftar, dan kutipan konten artikel agar ukuran font mengikuti pengaturan.

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
