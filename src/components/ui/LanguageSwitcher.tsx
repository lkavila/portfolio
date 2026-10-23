'use client'

import type { Locale } from 'next-intl'
import { useLocale } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { sectionIds } from '@/i18n/sections'
import { useActiveSection } from '@/lib/active-section'

type Props = {
  label: string
  names: Record<Locale, string>
}

// Enlaces a la misma página en cada idioma. Conserva la sección actual
// traduciendo su ancla (#proyectos ↔ #projects). Sin JS, lleva al inicio.
export function LanguageSwitcher({ label, names }: Props) {
  const current = useLocale()
  const pathname = usePathname()
  const section = useActiveSection()

  return (
    <nav aria-label={label} className="flex gap-1 text-sm">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          locale={locale}
          href={{ pathname, hash: section ? sectionIds[locale][section] : undefined }}
          hrefLang={locale}
          lang={locale}
          aria-current={locale === current ? 'page' : undefined}
          className="rounded px-2 py-1 uppercase aria-[current=page]:font-semibold aria-[current=page]:underline"
        >
          <span aria-hidden="true">{locale}</span>
          <span className="sr-only">{names[locale]}</span>
        </Link>
      ))}
    </nav>
  )
}
