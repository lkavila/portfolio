import type { Locale } from 'next-intl'

// Orden de las secciones en la página y su ancla en cada idioma.
// El selector de idioma traduce el ancla para conservar la sección actual.
export const sectionKeys = ['experience', 'projects', 'education', 'certifications'] as const

export type SectionKey = (typeof sectionKeys)[number]

export const sectionIds: Record<Locale, Record<SectionKey, string>> = {
  es: {
    experience: 'experiencia',
    projects: 'proyectos',
    education: 'estudios',
    certifications: 'certificaciones'
  },
  en: {
    experience: 'experience',
    projects: 'projects',
    education: 'education',
    certifications: 'certifications'
  }
}

export function sectionKeyFromId(id: string): SectionKey | undefined {
  for (const ids of Object.values(sectionIds)) {
    const key = sectionKeys.find((k) => ids[k] === id)
    if (key) return key
  }
  return undefined
}
