import { getLocale, getTranslations } from 'next-intl/server'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { getProfile } from '@/content'

// Contacto por enlaces: la fase 1 no tiene backend, así que no hay formulario (D5).
export async function SiteFooter() {
  const locale = await getLocale()
  const t = await getTranslations()
  const profile = getProfile(locale)
  const linkProps = { newTabLabel: t('common.opensInNewTab'), pendingText: t('common.pending') }

  return (
    <footer className="px-6 pt-28 pb-20 text-center text-subtle">
      <h2 className="text-sm font-semibold text-muted">{t('footer.contact')}</h2>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <ExternalLink href={profile.email && `mailto:${profile.email}`} {...linkProps} external={false}>
          {t('footer.email')}
        </ExternalLink>
        <ExternalLink href={profile.linkedin} {...linkProps}>
          {t('hero.linkedin')}
        </ExternalLink>
        <ExternalLink href={profile.github} {...linkProps}>
          {t('hero.github')}
        </ExternalLink>
      </div>
      <p className="mt-8 text-[13px]">{profile.name}</p>
    </footer>
  )
}
