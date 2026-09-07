import { Poppins } from 'next/font/google'

// Poppins is the theme's primary font. Self-hosting it via next/font
// eliminates the render-blocking Google Fonts request and the FOUT/CLS
// caused by loading it late in ThemeProvider.
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})
