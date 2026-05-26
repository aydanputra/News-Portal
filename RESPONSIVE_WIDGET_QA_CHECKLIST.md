# Responsive Widget QA Checklist

## Persiapan
- Buka `/admin/homepage`
- Pilih tema `pranala`
- Siapkan 1 section berisi widget: Hero Slider, Hero Split 4, News Grid, News Grid Slider, News List, Headline Big, Sidebar Widget
- Pastikan setiap widget memiliki data post yang tampil

## Skenario Umum (Ulangi per widget)
- Set nilai Desktop untuk toggle: Category, Meta, Author, Date, Excerpt
- Pindah ke Tablet tanpa isi override, pastikan mengikuti Desktop
- Pindah ke Mobile tanpa isi override, pastikan mengikuti Desktop
- Isi override khusus Tablet, pastikan hanya Tablet yang berubah
- Isi override khusus Mobile, pastikan hanya Mobile yang berubah
- Kembali ke Desktop, pastikan nilai Desktop tidak ikut berubah

## Warna & Tipografi Kategori
- Uji `categoryLabelColor` berbeda antar device
- Uji `categoryLabelBgColor` berbeda antar device
- Uji `categoryLabelFontSize` berbeda antar device
- Uji `categoryLabelBorderRadius` berbeda antar device
- Uji fallback legacy key: `categoryTextColor` dan `categoryBgColor` tetap terbaca

## Meta & Excerpt
- Uji `metaColor`, `metaFontSize` per device
- Uji `excerptColor`, `excerptFontSize`, `excerptLineHeight` per device
- Uji `showExcerpt` per device (true/false campuran antar device)
- Uji `showMetaInfo` per device (true/false campuran antar device)

## Validasi Widget Kritis
- Hero Slider: toggle Category/Meta/Author/Date/Excerpt konsisten
- Hero Split 4: toggle hero dan mini (Category/Meta/Author/Date/Excerpt) konsisten
- News Grid: toggle Category/Meta/Author/Date/Excerpt konsisten
- News Grid Slider: toggle Category/Meta/Author/Date/Excerpt konsisten
- News List: toggle Category/Meta/Author/Date konsisten
- Headline Big: `showMetaInfo` dan `showMeta` legacy sama-sama terbaca
- Sidebar Widget: Thumbnail/Category/Meta/Author/Date konsisten

## Verifikasi Akhir
- Simpan konfigurasi
- Refresh halaman admin, pastikan nilai tetap konsisten
- Cek frontend di viewport Desktop/Tablet/Mobile
- Pastikan tidak ada label device yang salah di panel admin
