import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locale as rootLocale } from 'next/root-params'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { BackLink } from '@/components/ui/BackLink'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { MdxContent } from '@/components/ui/MdxContent'
import { initials, Media } from '@/components/ui/Media'
import { Lesson, Tags } from '@/components/ui/Tags'
import { getProject, getProjects } from '@/content'
import { routing } from '@/i18n/routing'
import { sectionIds } from '@/i18n/sections'
import { formatMonth } from '@/lib/dates'

// Un slug que no está en generateStaticParams se renderiza completo antes de
// responder: así notFound() llega antes del primer byte y la respuesta es 404
// (con un fallback ya enviado, el estado quedaría en 200).
export const ensureStatic = 'navigation'

export async function generateStaticParams() {
  const locale = await rootLocale()
  if (!hasLocale(routing.locales, locale)) return []
  return getProjects(locale).map((p) => ({ slug: p.slug }))
}

async function load(params: PageProps<'/[locale]/proyectos/[slug]'>['params']) {
  const [{ slug }, locale] = await Promise.all([params, rootLocale()])
  if (!hasLocale(routing.locales, locale)) notFound()
  const project = getProject(locale, slug)
  if (!project) notFound()
  return { locale, project }
}

export async function generateMetadata({ params }: PageProps<'/[locale]/proyectos/[slug]'>): Promise<Metadata> {
  const { locale, project } = await load(params)
  const path = (l: string) => `/${l}/proyectos/${project.slug}`
  return {
    title: `${project.title} · Kener Avila`,
    description: project.summary,
    alternates: {
      canonical: path(locale),
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, path(l)])),
        'x-default': path(routing.defaultLocale)
      }
    }
  }
}

export default async function CaseStudyPage({ params }: PageProps<'/[locale]/proyectos/[slug]'>) {
  const { locale, project } = await load(params)
  const t = await getTranslations()
  const linkProps = { newTabLabel: t('common.opensInNewTab'), pendingText: t('common.pending') }
  const [cover, ...gallery] = project.images

  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-lg bg-fg px-4 py-2 font-semibold text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('common.skipToContent')}
      </a>
      <div className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-2">
          <BackLink href={`/${locale}#${sectionIds[locale].projects}`}>← {t('caseStudy.back')}</BackLink>
          <LanguageSwitcher
            label={t('languageSwitcher.label')}
            names={{ es: t('languageSwitcher.es'), en: t('languageSwitcher.en') }}
          />
        </div>
      </div>

      <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-3xl px-4 pt-14 outline-none sm:px-6">
        <article>
          <header>
            <p className="text-sm font-bold text-accent">
              {project.kind === 'personal' ? t('projects.kindPersonal') : t('projects.kindAcademic')} ·{' '}
              <time dateTime={project.date}>{formatMonth(project.date, locale)}</time>
            </p>
            <h1 className="mt-2 text-4xl leading-[1.05] font-bold tracking-[-0.035em] text-balance sm:text-5xl">
              {project.title}
            </h1>
            <p className="mt-4 text-lg text-soft">{project.summary}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ExternalLink href={project.github} {...linkProps} variant="button">
                {t('projects.github')}
              </ExternalLink>
              <ExternalLink href={project.demo} {...linkProps} variant="button">
                {t('projects.demo')}
              </ExternalLink>
            </div>
          </header>

          <Media
            image={cover}
            label={t('projects.image')}
            pendingText={t('common.pending')}
            fallback={initials(project.title)}
            sizes="(min-width: 768px) 720px, 100vw"
            className="mt-10 aspect-video rounded-3xl"
            priority
          />

          {project.stack.length > 0 && (
            <section aria-label={t('caseStudy.stack')} className="mt-8">
              <Tags items={project.stack} />
            </section>
          )}
          <Lesson label={t('lesson.label')} text={project.lesson} />

          <div className="case-prose mt-10">
            <MdxContent code={project.body} />
          </div>

          {gallery.length > 0 && (
            <section aria-label={t('caseStudy.gallery')} className="mt-12 grid gap-4 sm:grid-cols-2">
              {gallery.map((image) => (
                <Media
                  key={image.src.src}
                  image={image}
                  label={t('projects.image')}
                  pendingText={t('common.pending')}
                  fallback=""
                  sizes="(min-width: 640px) 360px, 100vw"
                  className="aspect-video rounded-2xl"
                />
              ))}
            </section>
          )}
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
