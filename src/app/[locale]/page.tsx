import { locale as rootLocale } from 'next/root-params'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { routing } from '@/i18n/routing'
import { sectionIds, sectionKeys } from '@/i18n/sections'

// Esqueleto de la página por idioma. Hero, barra y secciones reales llegan en T4.
export default async function HomePage() {
  const locale = await rootLocale()
  if (!hasLocale(routing.locales, locale)) return null

  const t = await getTranslations()
  const ids = sectionIds[locale]

  return (
    <>
      <header className="flex items-center justify-between px-6 py-4">
        <span className="font-semibold">{t('hero.name')}</span>
        <LanguageSwitcher
          label={t('languageSwitcher.label')}
          names={{ es: t('languageSwitcher.es'), en: t('languageSwitcher.en') }}
        />
      </header>
      <main id="contenido" className="mx-auto w-full max-w-3xl px-6">
        <h1 className="py-16 text-4xl font-semibold">{t('hero.name')}</h1>
        <p className="text-lg">{t('hero.role')}</p>
        <nav aria-label={t('sections.navLabel')} className="flex flex-wrap gap-4 py-8">
          {sectionKeys.map((key) => (
            <a key={key} href={`#${ids[key]}`} className="underline">
              {t(`sections.${key}`)}
            </a>
          ))}
        </nav>
        {sectionKeys.map((key) => (
          <section key={key} id={ids[key]} className="min-h-[80vh] scroll-mt-16 py-16">
            <h2 className="text-2xl font-semibold">{t(`sections.${key}`)}</h2>
          </section>
        ))}
      </main>
    </>
  )
}
