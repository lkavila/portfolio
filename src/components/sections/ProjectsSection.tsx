import { getLocale, getTranslations } from 'next-intl/server'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { initials, Media } from '@/components/ui/Media'
import { ProjectFilter, type ProjectKind } from '@/components/ui/ProjectFilter'
import { Section } from '@/components/ui/Section'
import { Lesson, Tags } from '@/components/ui/Tags'
import { getProjects } from '@/content'
import { Link } from '@/i18n/navigation'
import { sectionIds } from '@/i18n/sections'

export async function ProjectsSection() {
  const locale = await getLocale()
  const t = await getTranslations()
  const projects = getProjects(locale)
  if (projects.length === 0) return null

  // Un botón solo aparece si su tipo tiene al menos un proyecto.
  const kinds = (['personal', 'academic'] as const).filter((k) => projects.some((p) => p.kind === k))
  const options = [
    { value: 'all' as const, label: t('projects.all') },
    ...kinds.map((k) => ({ value: k, label: t(`projects.${k}`) }))
  ]
  const kindLabel: Record<ProjectKind, string> = {
    personal: t('projects.kindPersonal'),
    academic: t('projects.kindAcademic')
  }

  return (
    <Section id={sectionIds[locale].projects} title={t('sections.projects')} intro={t('sections.projectsIntro')}>
      <ProjectFilter label={t('projects.filterLabel')} options={options}>
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {projects.map((project) => (
            <li key={project.slug} data-kind={project.kind} data-reveal>
              <article className="flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-card">
                <Media
                  image={project.images[0]}
                  label={t('projects.image')}
                  pendingText={t('common.pending')}
                  fallback={initials(project.title)}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-video"
                />
                <div className="flex flex-1 flex-col px-5.5 pt-5 pb-6">
                  <p className="text-xs font-bold text-accent">{kindLabel[project.kind]}</p>
                  <h3 className="mt-1.5 mb-1.5 text-[22px] font-semibold tracking-[-0.02em] text-balance">
                    <Link href={`/proyectos/${project.slug}`} className="hover:underline">
                      {project.title}
                    </Link>
                  </h3>
                  <p className="line-clamp-3 text-[15px] text-soft">{project.summary}</p>
                  <Tags items={project.stack} />
                  <Lesson label={t('lesson.label')} text={project.lesson} />
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Link
                      href={`/proyectos/${project.slug}`}
                      className="rounded-lg border border-fg bg-fg px-2.5 py-1.5 text-[13px] font-semibold text-bg"
                    >
                      {t('projects.caseStudy')}
                      <span className="sr-only">: {project.title}</span>
                    </Link>
                    <ExternalLink href={project.github} newTabLabel={t('common.opensInNewTab')} pendingText={t('common.pending')}>
                      {t('projects.github')}
                    </ExternalLink>
                    <ExternalLink href={project.demo} newTabLabel={t('common.opensInNewTab')} pendingText={t('common.pending')}>
                      {t('projects.demo')}
                    </ExternalLink>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </ProjectFilter>
    </Section>
  )
}
