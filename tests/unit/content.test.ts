import { execFile } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import sharp from 'sharp'
import { afterAll, describe, expect, it } from 'vitest'
import { findMissingLocales, findPending } from '../../src/content/config'

// Cada caso escribe un fixture en tests/.tmp/<nombre> y corre la CLI real de
// Velite con las mismas reglas que el sitio (src/content/config.ts).
// Va dentro del repo para que la config compilada resuelva node_modules.

const root = resolve(__dirname, '../..')
const tmp = join(root, 'tests/.tmp')
const velite = join(root, 'node_modules/velite/bin/velite.js')
const run = promisify(execFile)

type Files = Record<string, string | Buffer>

const validProject = (lang: 'es' | 'en', extra = '') => `---
title: Proyecto ${lang}
summary: Resumen ${lang}
kind: academic
date: 2025-03
github: https://github.com/kener/proyecto
images:
  - src: ./demo/cover.png
    alt: Portada ${lang}
${extra}---
Cuerpo ${lang}
`

async function validFiles(): Promise<Files> {
  return {
    'profile.yaml': `name: Kener
role: { es: Desarrollador, en: Developer }
github: https://github.com/kener
`,
    'experience.yaml': `- company: ACME
  role: { es: Desarrollador, en: Developer }
  start: 2023-01
  end: present
  summary: { es: Resumen, en: Summary }
`,
    'education.yaml': `- institution: Universidad
  degree: { es: Ingeniería, en: Engineering }
  start: 2017-02
  end: 2022-12
`,
    'certifications.yaml': `- name: Cert
  issuer: Emisor
  date: 2024-05
  verifyUrl: https://example.com/verify/1
`,
    'projects/demo.es.mdx': validProject('es'),
    'projects/demo.en.mdx': validProject('en'),
    'projects/demo/cover.png': await sharp({
      create: { width: 16, height: 9, channels: 3, background: '#000' }
    })
      .png()
      .toBuffer()
  }
}

async function build(name: string, files: Files) {
  const dir = join(tmp, name)
  await rm(dir, { recursive: true, force: true })
  for (const [path, content] of Object.entries(files)) {
    const file = join(dir, 'content', path)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, content)
  }
  await writeFile(
    join(dir, 'velite.config.ts'),
    `import { createContentConfig } from '../../../src/content/config'\n` +
      `export default createContentConfig({ root: 'content', output: '.' })\n`
  )
  try {
    const { stdout, stderr } = await run(process.execPath, [velite, 'build', '--strict'], { cwd: dir })
    return { ok: true, output: stdout + stderr, dir }
  } catch (error) {
    const { stdout = '', stderr = '' } = error as { stdout?: string; stderr?: string }
    return { ok: false, output: stdout + stderr, dir }
  }
}

afterAll(() => rm(tmp, { recursive: true, force: true }))

describe('velite build', () => {
  it.concurrent('carga un fixture válido con slug, idioma e imagen procesada', async () => {
    const result = await build('valid', await validFiles())
    expect(result.ok, result.output).toBe(true)

    const projects = JSON.parse(await readFile(join(result.dir, '.velite/projects.json'), 'utf8'))
    expect(projects.map((p: { slug: string; locale: string }) => `${p.slug}.${p.locale}`).sort()).toEqual([
      'demo.en',
      'demo.es'
    ])
    expect(projects[0].images[0].src).toMatchObject({ width: 16, height: 9, blurDataURL: expect.any(String) })
    expect(result.output).toContain('projects/demo: demo')
  })

  it.concurrent('falla si falta una traducción en YAML, con archivo y campo', async () => {
    const files = await validFiles()
    files['experience.yaml'] = String(files['experience.yaml']).replace(', en: Developer', '')
    const result = await build('missing-yaml-translation', files)
    expect(result.ok).toBe(false)
    expect(result.output).toContain('experience.yaml')
    expect(result.output).toContain('[0].role.en')
  })

  it.concurrent('falla si un proyecto no tiene su versión en inglés', async () => {
    const files = await validFiles()
    delete files['projects/demo.en.mdx']
    const result = await build('missing-mdx-locale', files)
    expect(result.ok).toBe(false)
    expect(result.output).toContain('projects/demo.en.mdx falta')
  })

  it.concurrent('falla si una imagen no existe', async () => {
    const files = await validFiles()
    files['projects/demo.es.mdx'] = validProject('es').replace('./demo/cover.png', './demo/nope.png')
    const result = await build('missing-image', files)
    expect(result.ok).toBe(false)
    expect(result.output).toContain('projects/demo.es.mdx')
    expect(result.output).toContain('images.[0].src')
  })

  it.concurrent('falla si falta el alt de una imagen', async () => {
    const files = await validFiles()
    files['projects/demo.en.mdx'] = validProject('en').replace('    alt: Portada en\n', '')
    const result = await build('missing-alt', files)
    expect(result.ok).toBe(false)
    expect(result.output).toContain('images.[0].alt')
  })

  it.concurrent('falla con URLs mal formadas o que no son http(s)', async () => {
    const files = await validFiles()
    files['projects/demo.es.mdx'] = validProject('es').replace('https://github.com/kener/proyecto', 'github.com/x')
    files['certifications.yaml'] = String(files['certifications.yaml']).replace(
      'https://example.com/verify/1',
      'javascript:alert(1)'
    )
    const result = await build('bad-urls', files)
    expect(result.ok).toBe(false)
    expect(result.output).toMatch(/projects[\\/]demo\.es\.mdx[\s\S]*github/)
    expect(result.output).toMatch(/certifications\.yaml[\s\S]*\[0\]\.verifyUrl/)
  })

  it.concurrent('falla con un slug con tildes o mayúsculas', async () => {
    const files = await validFiles()
    files['projects/canción.es.mdx'] = validProject('es')
    files['projects/canción.en.mdx'] = validProject('en')
    const result = await build('bad-slug', files)
    expect(result.ok).toBe(false)
    expect(result.output).toContain('canción.es.mdx')
    expect(result.output).toMatch(/el archivo debe llamarse[^\n]*path/)
  })

  it.concurrent('falla con fechas que no son YYYY-MM o con fin antes del inicio', async () => {
    const files = await validFiles()
    files['education.yaml'] = String(files['education.yaml'])
      .replace('start: 2017-02', 'start: 2017-2')
      .replace('end: 2022-12', 'end: 2016-01')
    files['experience.yaml'] = String(files['experience.yaml']).replace('end: present', 'end: 2022-01')
    const result = await build('bad-dates', files)
    expect(result.ok).toBe(false)
    expect(result.output).toMatch(/education\.yaml[\s\S]*usa el formato YYYY-MM[^\n]*\[0\]\.start/)
    expect(result.output).toMatch(/experience\.yaml[\s\S]*end no puede ser anterior a start[^\n]*\[0\]\.end/)
  })

  it.concurrent('acepta años sueltos entre comillas y explica el error si faltan las comillas', async () => {
    const files = await validFiles()
    files['education.yaml'] = String(files['education.yaml'])
      .replace('start: 2017-02', "start: '2017'")
      .replace('end: 2022-12', "end: '2022'")
    const ok = await build('year-only', files)
    expect(ok.ok, ok.output).toBe(true)

    files['education.yaml'] = String(files['education.yaml']).replace("start: '2017'", 'start: 2017')
    const bad = await build('year-unquoted', files)
    expect(bad.ok).toBe(false)
    expect(bad.output).toMatch(/entre comillas[^\n]*\[0\]\.start/)
  })
})

describe('reglas entre documentos', () => {
  const project = (slug: string, locale: string, extra: object = {}) => ({ slug, locale, images: [], ...extra })

  it('findMissingLocales lista el archivo que falta en cada idioma', () => {
    expect(findMissingLocales([project('a', 'es'), project('a', 'en'), project('b', 'en')])).toEqual([
      'projects/b.es.mdx falta (existe en en)'
    ])
  })

  it('findPending lista campos reservados vacíos una sola vez por proyecto', () => {
    const pending = findPending({
      profile: { github: 'https://x' },
      experience: [{ company: 'ACME' }, { company: 'Con imagen', image: {} }],
      education: [{ institution: 'Universidad' }],
      certifications: [{ name: 'Sin enlace' }, { name: 'Con archivo', file: '/static/c.pdf' }],
      projects: [project('a', 'es', { github: 'https://x' }), project('a', 'en', { github: 'https://x' })]
    })
    expect(pending).toEqual([
      'profile: linkedin, email',
      'experience/ACME: image',
      'education/Universidad: image',
      'projects/a: images, demo',
      'certifications/Sin enlace: verifyUrl o file'
    ])
  })
})

describe('compareByRecency', () => {
  it('ordena "present" primero, luego por fin y por inicio', async () => {
    // index.ts importa #site/content; solo se usa la función pura.
    const { compareByRecency } = await import('../../src/content/index')
    const items = [
      { id: 'viejo', start: '2018-01', end: '2019-06' },
      { id: 'actual', start: '2023-01', end: 'present' },
      { id: 'reciente-corto', start: '2022-06', end: '2022-12' },
      { id: 'reciente-largo', start: '2020-01', end: '2022-12' },
      { id: 'cert', date: '2021-03' }
    ]
    expect(items.sort(compareByRecency).map((i) => i.id)).toEqual([
      'actual',
      'reciente-corto',
      'reciente-largo',
      'cert',
      'viejo'
    ])
  })
})
