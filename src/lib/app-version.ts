import pkg from "../../package.json";

// Sumber tunggal versi CMS dari package.json. Bisa dioverride di runtime
// lewat env APP_VERSION / NEXT_PUBLIC_APP_VERSION bila diperlukan.
export const APP_VERSION: string = pkg.version;

// Tanggal rilis versi saat ini. Selaraskan dengan entri teratas di CHANGELOG.md.
export const APP_RELEASED_AT: string = "2026-09-08";

// Ringkasan catatan rilis terbaru (selaras dengan CHANGELOG.md) untuk ditampilkan
// di dashboard dan Pengaturan → Status Sistem.
export interface ReleaseNote {
  version: string;
  date: string;
  notes: string[];
}

export const APP_CHANGELOG: ReleaseNote[] = [
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
