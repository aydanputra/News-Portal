import dynamic from 'next/dynamic';

// Konfigurasi Tema Aktif
// Di masa depan, nilai ini bisa diambil dari Environment Variable (.env)
const ACTIVE_THEME = process.env.NEXT_PUBLIC_ACTIVE_THEME || 'classic';

// Dynamic Import agar hanya memuat kode tema yang aktif
// Ini mencegah "Bloat" di mana kode dari 30 tema lain ikut ter-bundle
const ClassicHome = dynamic(() => import('@themes/classic/templates/Homepage'), { 
  loading: () => null 
});

const SkeletonHome = dynamic(() => import('@themes/skeleton/Home'), { 
  loading: () => null 
});

const PranalaHome = dynamic(() => import('@themes/pranala/templates/Homepage'), { 
  loading: () => null 
});

// Mapping Komponen
// Kunci: nama tema di database (string)
// Nilai: Komponen React
const themes: Record<string, any> = {
  classic: ClassicHome,
  skeleton: SkeletonHome,
  pranala: PranalaHome,
};

export function getThemeComponent(themeName: string) {
  // 1. Prioritaskan tema yang diset di database (Runtime Config)
  if (themes[themeName]) {
    return themes[themeName];
  }
  
  // 2. Fallback ke tema default environment (Build Config)
  if (themes[ACTIVE_THEME]) {
    return themes[ACTIVE_THEME];
  }

  // 3. Fallback terakhir
  return themes.classic;
}

// Metadata Tema (Client-Side Usage untuk Admin UI)
export const themeOptions = [
  {
    id: "classic",
    label: "Classic Standard",
    description: "Tema standar yang bersih dan modular.",
    mockupType: "classic"
  },
  {
    id: "skeleton",
    label: "Skeleton Starter",
    description: "Tema dasar minimalis untuk pengembangan.",
    mockupType: "modern" // Skeleton usually simpler
  },
  {
    id: "pranala",
    label: "Pranala News",
    description: "Tema kustom modern dengan gaya minimalis.",
    mockupType: "modern"
  },
];
