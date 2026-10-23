import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { getLocale, getTranslations } from 'next-intl/server'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { getProfile } from '@/content'

// Hero con gradiente estático (la aurora animada es de la fase 2, D4).
// El título es el elemento LCP: nunca se anima desde opacidad 0.
export async function Hero() {
  const locale = await getLocale()
  const t = await getTranslations()
  const profile = getProfile(locale)

  // D6: los PDFs del CV se publican a mano en public/cv/. Si aún no están, el
  // botón queda "pendiente" en dev/preview y oculto en producción.
  const cvPath = `/cv/kener-avila-${locale}.pdf`
  const cv = existsSync(join(process.cwd(), 'public', cvPath)) ? cvPath : undefined

  const linkProps = { newTabLabel: t('common.opensInNewTab'), pendingText: t('common.pending') }

  return (
    <header className="relative grid min-h-[88svh] place-items-center overflow-hidden text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-45 blur-[90px]"
        style={{ background: 'conic-gradient(from 200deg at 50% 60%, #1e3a8a, #6d28d9, #0ea5a4, #1e3a8a)' }}
      />
      <div className="relative px-6 py-20">
        <h1 className="text-5xl leading-none font-bold tracking-[-0.04em] text-balance sm:text-7xl lg:text-8xl">
          {profile.name}
        </h1>
        <p className="mt-5 text-lg text-[#b6bac8] sm:text-xl">{profile.role}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <ExternalLink href={cv} {...linkProps} variant="primary" external={false} download>
            {t('hero.cv')}
          </ExternalLink>
          <ExternalLink href={profile.github} {...linkProps} variant="button">
            {t('hero.github')}
          </ExternalLink>
          <ExternalLink href={profile.linkedin} {...linkProps} variant="button">
            {t('hero.linkedin')}
          </ExternalLink>
        </div>
      </div>
      <span aria-hidden="true" className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[13px] text-subtle">
        {t('hero.scrollHint')} ↓
      </span>
    </header>
  )
}
