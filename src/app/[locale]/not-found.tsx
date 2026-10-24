import { locale as rootLocale } from 'next/root-params'
import { hasLocale } from 'next-intl'
import { NotFoundContent } from '@/components/sections/NotFoundContent'
import { routing } from '@/i18n/routing'

// notFound() dentro de un idioma válido (ej. /es/proyectos/no-existe).
export default async function NotFound() {
  const locale = await rootLocale()
  return <NotFoundContent primary={hasLocale(routing.locales, locale) ? locale : undefined} />
}
