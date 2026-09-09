import pkg from "../../package.json";

// Sumber tunggal versi CMS dari package.json. Bisa dioverride di runtime
// lewat env APP_VERSION / NEXT_PUBLIC_APP_VERSION bila diperlukan.
export const APP_VERSION: string = pkg.version;

// Tanggal rilis versi saat ini. Selaraskan dengan entri teratas di CHANGELOG.md.
export const APP_RELEASED_AT: string = "2026-09-09";

// Ringkasan catatan rilis terbaru (selaras dengan CHANGELOG.md) untuk ditampilkan
// di dashboard dan Pengaturan → Status Sistem.
export interface ReleaseNote {
  version: string;
  date: string;
  notes: string[];
}

export const APP_CHANGELOG: ReleaseNote[] = [
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
