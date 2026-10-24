import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { locale as rootLocale } from 'next/root-params'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { RevealObserver } from '@/components/ui/RevealObserver'
import { routing } from '@/i18n/routing'
import { siteUrl } from '@/lib/site'
import '../globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await rootLocale()
  const t = await getTranslations('metadata')

  return {
    metadataBase: siteUrl,
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
        'x-default': `/${routing.defaultLocale}`
      }
    }
  }
}

export default async function LocaleLayout({ children }: LayoutProps<'/[locale]'>) {
  const locale = await rootLocale()
  if (!hasLocale(routing.locales, locale)) notFound()

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      // El script de <head> agrega la clase "js" antes de hidratar.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Antes de pintar: los reveals solo ocultan contenido si hay JS. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-full flex-col bg-bg font-sans text-fg">
        {/* Los mensajes no viajan al cliente: las islas reciben sus textos por props. */}
        <NextIntlClientProvider messages={null}>
          {children}
          <RevealObserver />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
