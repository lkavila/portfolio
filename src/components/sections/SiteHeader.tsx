import { getLocale, getTranslations } from 'next-intl/server'
import { heroId } from '@/components/sections/Hero'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { SectionNav } from '@/components/ui/SectionNav'
import { StickyIdentity } from '@/components/ui/StickyIdentity'
import { getAvailableSections, getProfile } from '@/content'
import { sectionIds } from '@/i18n/sections'
import { getCvHref } from '@/lib/cv'

// Barra fija: identidad (al bajar), secciones, CV (al bajar) e idioma.
export async function SiteHeader() {
  const locale = await getLocale()
  const t = await getTranslations()
  const profile = getProfile(locale)
  const items = getAvailableSections(locale).map((key) => ({
    key,
    id: sectionIds[locale][key],
    label: t(`sections.${key}Short`)
  }))

  return (
    <div className="sticky top-0 z-50 border-y border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
        <StickyIdentity heroId={heroId} className="hidden shrink-0 md:block">
          <a
            href={`#${heroId}`}
            className="flex min-h-11 items-center px-1 text-[15px] font-bold tracking-tight hover:text-strong"
          >
            {profile.name}
            <span className="sr-only"> · {t('hero.backToTop')}</span>
          </a>
        </StickyIdentity>
        <SectionNav label={t('sections.navLabel')} items={items} />
        <StickyIdentity heroId={heroId} className="shrink-0">
          <ExternalLink
            href={getCvHref(locale)}
            newTabLabel={t('common.opensInNewTab')}
            pendingText={t('common.pending')}
            variant="primary"
            external={false}
            download
          >
            CV
          </ExternalLink>
        </StickyIdentity>
        <LanguageSwitcher
          label={t('languageSwitcher.label')}
          names={{ es: t('languageSwitcher.es'), en: t('languageSwitcher.en') }}
        />
      </div>
    </div>
  )
}
