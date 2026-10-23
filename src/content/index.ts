import type { Locale } from 'next-intl'
import { certifications, education, experience, projects } from '#site/content'

// Acceso al contenido ya validado por Velite: elige el idioma y ordena.
// Las secciones de la página leen solo de aquí.

type Dated = { start?: string; end?: string; date?: string }

/** Más reciente primero: "present" va arriba, luego por fecha de fin y de inicio. */
export function compareByRecency(a: Dated, b: Dated): number {
  const end = (x: Dated) => (x.end === 'present' ? '9999-99' : (x.end ?? x.date ?? ''))
  return end(b).localeCompare(end(a)) || (b.start ?? '').localeCompare(a.start ?? '')
}

export function getExperience(locale: Locale) {
  return experience
    .map((item) => ({
      ...item,
      role: item.role[locale],
      location: item.location?.[locale],
      summary: item.summary[locale],
      highlights: item.highlights[locale]
    }))
    .sort(compareByRecency)
}

export function getEducation(locale: Locale) {
  return education
    .map((item) => ({ ...item, degree: item.degree[locale], description: item.description?.[locale] }))
    .sort(compareByRecency)
}

/** Certificaciones agrupadas por emisor; grupos y certificados del más reciente al más antiguo. */
export function getCertificationsByIssuer() {
  const groups = new Map<string, typeof certifications>()
  for (const cert of [...certifications].sort(compareByRecency)) {
    groups.set(cert.issuer, [...(groups.get(cert.issuer) ?? []), cert])
  }
  return [...groups].map(([issuer, items]) => ({ issuer, items }))
}

export function getProjects(locale: Locale) {
  return projects
    .filter((p) => p.locale === locale)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || compareByRecency(a, b))
}

export function getProject(locale: Locale, slug: string) {
  return projects.find((p) => p.locale === locale && p.slug === slug)
}

export type Project = (typeof projects)[number]
