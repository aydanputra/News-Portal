import pkg from "../../package.json";

// Sumber tunggal versi CMS dari package.json. Bisa dioverride di runtime
// lewat env APP_VERSION / NEXT_PUBLIC_APP_VERSION bila diperlukan.
export const APP_VERSION: string = pkg.version;

// Tanggal rilis versi saat ini. Selaraskan dengan entri teratas di CHANGELOG.md.
export const APP_RELEASED_AT: string = "2026-09-13";

// Ringkasan catatan rilis terbaru (selaras dengan CHANGELOG.md) untuk ditampilkan
// di dashboard dan Pengaturan → Status Sistem.
export interface ReleaseNote {
  version: string;
  date: string;
  notes: string[];
}

export const APP_CHANGELOG: ReleaseNote[] = [
  {
    version: "1.0.11",
    date: "2026-09-13",
    notes: [
      "Widget Gambar: tampilkan gambar link eksternal (tambah referrerPolicy no-referrer)",
      "Widget Gambar: hilangkan ruang kosong atas-bawah saat object-fit contain tanpa tinggi eksplisit",
    ],
  },
  {
    version: "1.0.10",
    date: "2026-09-13",
    notes: [
      "Mode gelap admin: aktifkan darkMode \"class\" agar varian dark: mengikuti kelas .dark",
      "Perbaiki warna status/badge/alert yang tetap terang (tidak terbaca) di Pengaturan saat mode gelap",
    ],
  },
  {
    version: "1.0.9",
    date: "2026-09-12",
    notes: [
      "Halaman statis: judul & konten terbaca jelas di mode gelap",
      "Widget grid (News Grid, Grid Slider, Arsip): background konten mengisi penuh kartu, hilangkan bidang gelap di bawah judul",
      "Background konten grid: bagian atas tetap kotak, bagian bawah mengikuti border radius global",
    ],
  },
  {
    version: "1.0.8",
    date: "2026-09-12",
    notes: [
      "Tipografi halaman Arsip (kategori/tag/pencarian) kini mengikuti Tipografi Homepage, fallback ke Global",
      "Perbaiki nilai tipografi tersimpan tertimpa theme config lama sehingga perubahan teks tidak tampil",
      "Hero slider hasil pencarian menampilkan berita hasil pencarian terkait",
      "Modal pencarian: posisi di tengah layar desktop, dapat di-scroll di mobile",
      "Header halaman Arsip terbaca jelas di mode gelap",
    ],
  },
  {
    version: "1.0.7",
    date: "2026-09-10",
    notes: [
      "Perbaiki dropdown tipe font kembali ke Inter (Default) setelah simpan",
      "Denormalisasi font self-hosted di API admin agar menampilkan nama font mentah",
    ],
  },
  {
    version: "1.0.6",
    date: "2026-09-10",
    notes: [
      "Perbaiki preview media baru tidak muncul (404) hingga menunggu rebuild",
      "Serve /uploads/* lewat route dinamis agar file runtime langsung tersedia",
      "404 media tidak lagi di-cache (no-store) dan tidak menetap lama di CDN",
    ],
  },
  {
    version: "1.0.5",
    date: "2026-09-09",
    notes: [
      "Merriweather self-hosted, hentikan request remote Merriweather",
      "Petakan font self-hosted ke CSS variable di semua renderer",
      "Kurangi preload font tak terpakai (Poppins/Sora)",
      "HeroSlider deteksi device via useEffect (kurangi render delay)",
    ],
  },
  {
    version: "1.0.4",
    date: "2026-09-09",
    notes: [
      "Logo header diprioritaskan (priority + fetchPriority high) agar FCP/LCP lebih cepat",
      "Hentikan duplikasi request font Poppins/Inter/Sora yang sudah self-hosted",
    ],
  },
  {
    version: "1.0.3",
    date: "2026-09-09",
    notes: [
      "Stabil CLS Hero/HeroSlider via CSS variable responsif",
      "Stabil CLS slot iklan (reserve tinggi minimum)",
      "Font Google remote dimuat async agar FCP lebih cepat",
      "Gambar /uploads diserve statis langsung (LCP lebih cepat)",
    ],
  },
  {
    version: "1.0.2",
    date: "2026-09-09",
    notes: [
      "Perbaiki Font Size widget post_content (Konten Artikel) tidak berubah dari Tipografi Single Post global maupun pengaturan widget langsung",
      "Hapus nilai bawaan fontSize:18 yang tersisa di preset & blok lama",
      "Wariskan font-size & line-height ke paragraf/daftar/kutipan konten artikel",
    ],
  },
  {
    version: "1.0.1",
    date: "2026-09-09",
    notes: [
      "Konsistensi tipografi semua widget (Homepage, Post, Archive, Header, Footer) mengikuti tipografi global",
      "Font picker widget 3 tingkatan: fallback tipografi global, tipografi halaman, dan pilih font langsung",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-09-08",
    notes: [
      "2FA opt-in untuk admin",
      "Monitoring produktivitas penulis + filter rentang tanggal",
      "Hardening keamanan (sandi, rate limiting, CORS, security headers)",
      "Optimasi performa mobile (font, gambar, CLS)",
      "Pencatatan versi & tanggal update",
    ],
  },
];
