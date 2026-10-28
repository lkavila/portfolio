import { getLocale, getTranslations } from 'next-intl/server'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { getProfile } from '@/content'
import { getCvHref } from '@/lib/cv'

export const heroId = 'inicio'

// Hero con gradiente estático (la aurora animada es de la fase 2, D4).
// Revisión de diseño 1A: en ~60% de la pantalla dice quién eres (nombre y
// posicionamiento), lo prueba con 3 cifras y deja el CV a un clic; el primer
// trabajo asoma debajo. El título es el elemento LCP: nunca se anima.
export async function Hero() {
  const locale = await getLocale()
  const t = await getTranslations()
  const profile = getProfile(locale)
  const linkProps = { newTabLabel: t('common.opensInNewTab'), pendingText: t('common.pending') }

  return (
    <header id={heroId} className="relative grid min-h-[62svh] place-items-center overflow-hidden text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-45 blur-[90px]"
        style={{ background: 'conic-gradient(from 200deg at 50% 60%, #1e3a8a, #6d28d9, #0ea5a4, #1e3a8a)' }}
      />
      <div className="relative max-w-4xl px-6 pt-16 pb-12">
        <h1 className="text-5xl leading-none font-bold tracking-[-0.04em] text-balance sm:text-7xl">{profile.name}</h1>
        <p className="mt-4 text-sm font-semibold tracking-wide text-muted uppercase">{profile.role}</p>
        {profile.headline && (
          <p className="mx-auto mt-5 max-w-2xl text-lg text-balance text-strong sm:text-xl">{profile.headline}</p>
        )}
        {profile.metrics.length > 0 && (
          <dl className="mx-auto mt-8 grid max-w-3xl grid-cols-3 gap-3 sm:gap-6">
            {profile.metrics.map((m) => (
              <div key={m.label} className="flex flex-col-reverse gap-1">
                <dt className="text-xs text-muted sm:text-sm">{m.label}</dt>
                <dd className="text-xl font-bold tracking-tight whitespace-nowrap tabular-nums sm:text-3xl">{m.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <ExternalLink href={getCvHref(locale)} {...linkProps} variant="primary" external={false} download>
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
    </header>
  )
}
