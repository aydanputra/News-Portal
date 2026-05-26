import { Inter, Sora } from 'next/font/google'

// Inter for body text
export const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Sora for display/headings
export const sora = Sora({ 
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

// Combined font classes
export const fontClasses = {
  body: inter.variable,
  display: sora.variable,
  all: `${inter.variable} ${sora.variable}`
}