# Panduan Pengembangan Tema (Theme Development)

Dokumen ini menjelaskan cara membuat dan mendaftarkan tema baru untuk News Portal ini. Sistem tema dirancang agar mirip dengan WordPress, di mana Anda bisa membuat folder tema baru dan mengaktifkannya melalui Admin Panel.

## Struktur Tema

Semua tema disimpan di dalam folder `themes/`. Setiap tema harus memiliki file utama `Home.tsx` yang berfungsi sebagai entry point halaman depan.

Contoh struktur folder:
```
/themes
  /modern/       (Tema Default)
  /classic/      (Tema Blog Klasik)
  /my-new-theme/ (Tema Baru Anda)
     Home.tsx    <-- Wajib ada
     /components <-- Opsional
     /styles     <-- Opsional
```

## Langkah Membuat Tema Baru

### 1. Buat Folder Tema
Buat folder baru di dalam `themes/`, misalnya `themes/minimalist`.

### 2. Buat File Home.tsx
Buat file `Home.tsx` di dalam folder tersebut. Anda bisa menyalin kode dari `themes/skeleton/Home.tsx` sebagai dasar.

Contoh dasar `Home.tsx`:
```tsx
import Header from "../modern/components/Header"; // Bisa reuse komponen yang ada
import Footer from "../modern/components/Footer"; 

interface HomeProps {
  data: {
    posts: any[];      // Daftar berita
    categories: any[]; // Daftar kategori
    blocks: any[];     // Konfigurasi blok homepage
    setting?: any;     // Pengaturan global (logo, nama situs)
    blockData?: Record<string, any[]>; // Data dinamis per blok
  };
}

export default function MyThemeHome({ data }: HomeProps) {
  const { posts, setting } = data;
  
  return (
    <div className="min-h-screen bg-white">
      <Header siteName={setting?.siteName} primaryColor="#000" categories={data.categories} />
      
      <main className="container mx-auto py-10">
        <h1 className="text-3xl font-bold">Tema Baru Saya</h1>
        {/* Render berita di sini */}
      </main>

      <Footer siteName={setting?.siteName} />
    </div>
  );
}
```

### 3. Daftarkan Tema
Buka file `src/lib/theme-registry.ts` dan tambahkan tema baru Anda di dua tempat:

**Bagian 1: Import & Mapping Component**
```typescript
import MinimalistHome from "@themes/minimalist/Home"; // Import file Anda

const themes: Record<string, any> = {
  modern: ModernHome,
  classic: ClassicHome,
  minimalist: MinimalistHome, // Tambahkan di sini
};
```

**Bagian 2: Metadata untuk Admin UI**
```typescript
export const themeOptions = [
  // ... tema lain
  {
    id: "minimalist", // Harus sama dengan key di mapping component
    label: "Minimalist",
    description: "Tema bersih dan sederhana.",
    mockupType: "classic" // Pilih 'modern' atau 'classic' untuk ikon preview
  }
];
```

### 4. Aktifkan Tema
1. Jalankan server development (`npm run dev`).
2. Masuk ke **Dashboard Admin > Settings**.
3. Scroll ke bagian **Tema Website**.
4. Anda akan melihat tema baru "Minimalist" muncul. Pilih dan Simpan.
5. Buka halaman depan website, tampilan akan berubah sesuai kode tema baru Anda.

## Tips Pengembangan
- Anda bisa menggunakan ulang komponen yang sudah ada di `@themes/modern/components` seperti `Header`, `Footer`, atau `AdSlot` agar tidak perlu membuat dari nol.
- Gunakan Tailwind CSS untuk styling cepat.
- Data yang diterima di props `data` sudah lengkap (posts, categories, setting), jadi Anda tinggal fokus pada layout (HTML/CSS).
