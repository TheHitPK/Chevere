import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import React from 'react'
import { CartProvider } from '@/components/store/cart'
import { Footer } from '@/components/store/Footer'
import { Header } from '@/components/store/Header'
import { Intro } from '@/components/store/Intro'
import { introScript, momentoScript, movimientoScript, themeScript } from '@/lib/scripts'
import { getAjustes } from '@/lib/store'
import './globals.css'

// Fuentes servidas desde el propio sitio (sin peticiones a terceros, mejor LCP)
const manrope = localFont({ src: '../../fonts/manrope.woff2', variable: '--font-manrope', weight: '200 800', display: 'swap' })
const bricolage = localFont({ src: '../../fonts/bricolage.woff2', variable: '--font-bricolage', weight: '200 800', display: 'swap' })

const SITE = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Chévere · Ropa, calzado y accesorios en 360°', template: '%s · Chévere' },
  description: 'Moda para damas, caballeros y niños. Mira cada prenda en 360° antes de comprar. Enviamos a toda Venezuela desde Maracaibo.',
  openGraph: { siteName: 'Chévere', locale: 'es_VE', type: 'website', images: [{ url: '/brand/og-chevere.jpg', width: 1200, height: 630, alt: 'Chévere: ropa, calzado y accesorios en 360°' }] },
  twitter: { card: 'summary_large_image', images: ['/brand/og-chevere.jpg'] },
}

export const viewport: Viewport = { themeColor: '#7a0047' }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const ajustes = await getAjustes()
  return (
    <html lang="es" className={`${manrope.variable} ${bricolage.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript + momentoScript + movimientoScript + introScript }} />
      </head>
      <body className="min-h-dvh">
        <Intro />
        <link rel="preload" as="image" href="/intro/intro-poster.webp" />
        <CartProvider catalogo={ajustes.catalogo}>
          <Header />
          <main id="contenido">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
