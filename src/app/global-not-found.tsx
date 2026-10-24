import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { NotFoundContent } from '@/components/sections/NotFoundContent'
import './globals.css'

// Rutas que no existen o idioma inválido (/fr): no hay idioma conocido ni layout,
// así que la página es completa y muestra los dos idiomas.
const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: '404 · Kener Avila',
  robots: { index: false }
}

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body className="bg-bg font-sans text-fg">
        <NotFoundContent />
      </body>
    </html>
  )
}
