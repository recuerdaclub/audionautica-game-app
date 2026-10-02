import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Press_Start_2P, VT323 } from 'next/font/google'
import './globals.css'

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
})

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-terminal',
})

export const metadata: Metadata = {
  title: 'AUDIONÁUTICA // 8 CIRCUITOS',
  description:
    'Consola de navegación para audionautas. Lanza conceptos al azar por los 8 circuitos de conciencia.',
  generator: 'v0.app',
  icons: {
    icon: '/audionautica-mark-mask.png',
    apple: '/audionautica-mark-mask.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#02160a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`dark ${pressStart.variable} ${vt323.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background antialiased" suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
