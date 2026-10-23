import { basename } from 'node:path'
import { defineCollection, defineConfig, s } from 'velite'

// Esquemas del contenido (T3). Viven aquí y no en velite.config.ts para que los
// tests construyan fixtures con exactamente las mismas reglas.

export const locales = ['es', 'en'] as const

/** Texto traducido: exige las dos claves, así una traducción faltante rompe el build. */
const localized = <T extends Parameters<typeof s.object>[0][string]>(schema: T) =>
  s.object({ es: schema, en: schema })

const text = s.string().trim().min(1)

/** Mes en formato YYYY-MM (YAML convertiría YYYY-MM-DD en Date). */
const month = s.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'usa el formato YYYY-MM')

const url = s
  .string()
  .url('URL inválida')
  .refine((value) => /^https?:\/\//.test(value), 'la URL debe empezar por http:// o https://')

const fileNamePattern = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.(es|en)$/

const experience = defineCollection({
  name: 'Experience',
  pattern: 'experience.yaml',
  schema: s
    .object({
      company: text,
      role: localized(text),
      location: localized(text).optional(),
      start: month,
      end: month.or(s.literal('present')),
      summary: localized(text),
      highlights: localized(s.array(text)).default({ es: [], en: [] }),
      stack: s.array(text).default([]),
      url: url.optional()
    })
    .refine((item) => item.end === 'present' || item.end >= item.start, {
      message: 'end no puede ser anterior a start',
      path: ['end']
    })
})

const education = defineCollection({
  name: 'Education',
  pattern: 'education.yaml',
  schema: s
    .object({
      institution: text,
      degree: localized(text),
      start: month,
      end: month.or(s.literal('present')),
      description: localized(text).optional(),
      url: url.optional()
    })
    .refine((item) => item.end === 'present' || item.end >= item.start, {
      message: 'end no puede ser anterior a start',
      path: ['end']
    })
})

const certifications = defineCollection({
  name: 'Certification',
  pattern: 'certifications.yaml',
  schema: s.object({
    // Nombre y emisor son nombres propios: no se traducen.
    name: text,
    issuer: text,
    date: month,
    verifyUrl: url.optional(),
    // Archivo con datos personales tapados; los originales viven en /private (fuera del repo).
    file: s.file().optional()
  })
})

const projects = defineCollection({
  name: 'Project',
  pattern: 'projects/*.mdx',
  schema: s
    .object({
      title: text,
      summary: text,
      kind: s.enum(['personal', 'academic']),
      date: month,
      stack: s.array(text).default([]),
      github: url.optional(),
      demo: url.optional(),
      images: s.array(s.object({ src: s.image(), alt: text })).default([]),
      featured: s.boolean().default(false),
      // Nombre de archivo: <slug>.<es|en>.mdx. Se valida aquí (y no en el transform)
      // para que el error salga junto con los demás campos inválidos.
      path: s.path().refine(
        (path) => fileNamePattern.test(basename(path)),
        'el archivo debe llamarse <slug>.es.mdx o <slug>.en.mdx, con el slug en minúsculas ASCII y guiones (sin tildes)'
      ),
      body: s.mdx()
    })
    .transform(({ path, ...data }) => {
      // Zod también corre el transform si el refine de path falló (el build ya
      // va a fallar por ese error), así que no se asume que el nombre es válido.
      const [, slug = '', locale = 'es'] = fileNamePattern.exec(basename(path)) ?? []
      return { ...data, slug, locale: locale as (typeof locales)[number] }
    })
})

export const collections = { experience, education, certifications, projects }

type Data = {
  experience: { company: string; url?: string }[]
  education: { institution: string; url?: string }[]
  certifications: { name: string; verifyUrl?: string; file?: string }[]
  projects: { slug: string; locale: string; images: unknown[]; github?: string; demo?: string }[]
}

/** Proyectos sin su par en el otro idioma. Vacío si todo está completo. */
export function findMissingLocales(projects: Data['projects']): string[] {
  const byLocale = new Map(locales.map((l) => [l, new Set(projects.filter((p) => p.locale === l).map((p) => p.slug))]))
  const slugs = new Set(projects.map((p) => p.slug))
  return [...slugs].flatMap((slug) =>
    locales
      .filter((l) => !byLocale.get(l)!.has(slug))
      .map((l) => `projects/${slug}.${l}.mdx falta (existe en ${locales.filter((o) => o !== l).join(', ')})`)
  )
}

/** Campos reservados que siguen vacíos: se muestran como "pendiente" en dev/preview. */
export function findPending(data: Data): string[] {
  const pending: string[] = []
  for (const p of data.projects.filter((p) => p.locale === 'es')) {
    const missing = [
      p.images.length === 0 && 'images',
      !p.github && 'github',
      !p.demo && 'demo'
    ].filter(Boolean)
    if (missing.length) pending.push(`projects/${p.slug}: ${missing.join(', ')}`)
  }
  for (const c of data.certifications) {
    if (!c.verifyUrl && !c.file) pending.push(`certifications/${c.name}: verifyUrl o file`)
  }
  return pending
}

export function createContentConfig({ root, output }: { root: string; output: string }) {
  return defineConfig({
    root,
    output: {
      data: `${output}/.velite`,
      assets: `${output}/public/static`,
      base: '/static/',
      name: '[name]-[hash:6].[ext]',
      clean: true
    },
    collections,
    prepare: (data) => {
      const missing = findMissingLocales(data.projects)
      if (missing.length) {
        throw new Error(`Faltan traducciones de proyectos:\n  - ${missing.join('\n  - ')}`)
      }
      const pending = findPending(data)
      if (pending.length) {
        console.log(`[content] ${pending.length} campo(s) pendiente(s):\n  - ${pending.join('\n  - ')}`)
      }
    }
  })
}
