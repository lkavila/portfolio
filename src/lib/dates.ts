import type { Locale } from 'next-intl'

/** "2024-03" → "mar 2024" / "Mar 2024"; "2024" → "2024". Se calcula en el build (páginas estáticas). */
export function formatMonth(month: string, locale: Locale) {
  const [year, m] = month.split('-').map(Number)
  if (!m) return String(year)
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, m - 1)))
    .replace('.', '')
}

export function formatRange(start: string, end: string, locale: Locale, presentLabel: string) {
  return `${formatMonth(start, locale)} – ${end === 'present' ? presentLabel : formatMonth(end, locale)}`
}
