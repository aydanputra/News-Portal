# Changelog

## [1.0.11] - 2026-09-13

- Widget Gambar: tampilkan gambar link eksternal (tambah `referrerPolicy="no-referrer"`).
- Widget Gambar: hilangkan ruang kosong atas-bawah saat `object-fit: contain` tanpa tinggi eksplisit.

## [1.0.10] - 2026-09-13

- Mode gelap admin: aktifkan `darkMode: "class"` agar varian `dark:` mengikuti kelas `.dark`.
- Perbaiki warna status/badge/alert yang tetap terang (tidak terbaca) di Pengaturan saat mode gelap.

## [1.0.9] - 2026-09-12

- Halaman statis: judul & konten terbaca jelas di mode gelap.
- Widget grid (News Grid, Grid Slider, Arsip): background konten mengisi penuh kartu, hilangkan bidang gelap di bawah judul.
- Background konten grid: bagian atas tetap kotak, bagian bawah mengikuti border radius global.

## [1.0.8] - 2026-09-12

- Tipografi halaman Arsip (kategori/tag/pencarian) kini mengikuti Tipografi Homepage, fallback ke Global.
- Perbaiki nilai tipografi tersimpan tertimpa theme config lama sehingga perubahan teks tidak tampil.
- Hero slider hasil pencarian menampilkan berita hasil pencarian terkait.
- Modal pencarian: posisi di tengah layar desktop, dapat di-scroll di mobile.
- Header halaman Arsip terbaca jelas di mode gelap.

## [1.0.7] - 2026-09-10

- Perbaiki dropdown tipe font kembali ke Inter (Default) setelah simpan.
- Denormalisasi font self-hosted di API admin agar menampilkan nama font mentah.

## [1.0.6] - 2026-09-10

- Perbaiki preview media baru tidak muncul (404) hingga menunggu rebuild.
- Serve `/uploads/*` lewat route dinamis agar file runtime langsung tersedia.
- 404 media tidak lagi di-cache (no-store) dan tidak menetap lama di CDN.

## [1.0.5] - 2026-09-09

- Merriweather self-hosted, hentikan request remote Merriweather.
- Petakan font self-hosted ke CSS variable di semua renderer.
- Kurangi preload font tak terpakai (Poppins/Sora).
- HeroSlider deteksi device via useEffect (kurangi render delay).

## [1.0.4] - 2026-09-09

- Logo header diprioritaskan (priority + fetchPriority high) agar FCP/LCP lebih cepat.
- Hentikan duplikasi request font Poppins/Inter/Sora yang sudah self-hosted.

## [1.0.3] - 2026-09-09

- Stabil CLS Hero/HeroSlider via CSS variable responsif.
- Stabil CLS slot iklan (reserve tinggi minimum).
- Font Google remote dimuat async agar FCP lebih cepat.
- Gambar `/uploads` diserve statis langsung (LCP lebih cepat).

## [1.0.2] - 2026-09-09

- Perbaiki Font Size widget post_content (Konten Artikel) tidak berubah dari Tipografi Single Post global maupun pengaturan widget langsung.
- Hapus nilai bawaan fontSize:18 yang tersisa di preset & blok lama.
- Wariskan font-size & line-height ke paragraf/daftar/kutipan konten artikel.

## [1.0.1] - 2026-09-09

- Konsistensi tipografi semua widget (Homepage, Post, Archive, Header, Footer) mengikuti tipografi global.
- Font picker widget 3 tingkatan: fallback tipografi global, tipografi halaman, dan pilih font langsung.

## [1.0.0] - 2026-09-08

- 2FA opt-in untuk admin.
- Monitoring produktivitas penulis + filter rentang tanggal.
- Hardening keamanan (sandi, rate limiting, CORS, security headers).
- Optimasi performa mobile (font, gambar, CLS).
- Pencatatan versi & tanggal update.
