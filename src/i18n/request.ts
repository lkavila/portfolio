import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { locale as rootLocale } from 'next/root-params'
import { routing } from './routing'

// El idioma sale del segmento [locale] vía next/root-params, así las páginas
// siguen siendo estáticas sin llamar a setRequestLocale en cada una.
export default getRequestConfig(async ({ locale: override }) => {
  const requested = override ?? (await rootLocale())
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  }
})
