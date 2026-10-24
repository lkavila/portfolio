import { getLocale, getTranslations } from 'next-intl/server'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { SectionNav } from '@/components/ui/SectionNav'
import { getAvailableSections } from '@/content'
import { sectionIds } from '@/i18n/sections'

// Barra fija con las secciones y el selector de idioma.
export async function SiteHeader() {
  const locale = await getLocale()
  const t = await getTranslations()
  const items = getAvailableSections(locale).map((key) => ({
    key,
    id: sectionIds[locale][key],
    label: t(`sections.${key}Short`)
  }))

  return (
    <div className="sticky top-0 z-50 border-y border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
        <SectionNav label={t('sections.navLabel')} items={items} />
        <LanguageSwitcher
          label={t('languageSwitcher.label')}
          names={{ es: t('languageSwitcher.es'), en: t('languageSwitcher.en') }}
        />
      </div>
    </div>
  )
}
