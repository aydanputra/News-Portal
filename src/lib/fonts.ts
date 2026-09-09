import { Inter, Poppins, Sora, Merriweather } from 'next/font/google'

// Self-hosting fonts via next/font eliminates the render-blocking Google
// Fonts request and the FOUT/CLS caused by loading them late in ThemeProvider.
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
  // Poppins bukan font aktif di tema pranala. Jangan dipreload agar tidak
  // bersaing dengan font/ gambar LCP; tetap tersedia kalau dipilih nanti.
  preload: false,
})

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
  preload: false,
})

export const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
  display: 'swap',
})
