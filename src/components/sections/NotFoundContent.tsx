import type { Locale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'

// 404 en los dos idiomas: el de la página primero (o inglés si no se sabe).
export async function NotFoundContent({ primary = routing.defaultLocale }: { primary?: Locale }) {
  const order = [primary, ...routing.locales.filter((l) => l !== primary)]
  const texts = await Promise.all(
    order.map(async (locale) => ({ locale, t: await getTranslations({ locale, namespace: 'notFound' }) }))
  )

  return (
    <main id="contenido" className="mx-auto grid min-h-svh w-full max-w-xl place-content-center gap-10 px-6 py-20">
      <p aria-hidden="true" className="text-7xl font-bold tracking-[-0.04em] text-subtle">
        404
      </p>
      {texts.map(({ locale, t }, i) => (
        <section key={locale} lang={locale} className={i > 0 ? 'border-t border-line pt-8' : undefined}>
          {i === 0 ? (
            <h1 className="text-3xl font-bold tracking-[-0.03em]">{t('title')}</h1>
          ) : (
            <h2 className="text-xl font-semibold text-strong">{t('title')}</h2>
          )}
          <p className="mt-2 text-soft">{t('description')}</p>
          <a
            href={`/${locale}`}
            hrefLang={locale}
            className="mt-5 inline-flex min-h-11 items-center rounded-[10px] border border-fg bg-fg px-4 text-sm font-semibold text-bg"
          >
            {t('home')}
          </a>
        </section>
      ))}
    </main>
  )
}
