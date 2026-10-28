import { getLocale, getTranslations } from 'next-intl/server'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { initials, Media } from '@/components/ui/Media'
import { Section } from '@/components/ui/Section'
import { Lesson, Tags } from '@/components/ui/Tags'
import { getExperience } from '@/content'
import { sectionIds } from '@/i18n/sections'
import { formatRange } from '@/lib/dates'

export async function ExperienceSection() {
  const locale = await getLocale()
  const t = await getTranslations()
  const items = getExperience(locale)
  if (items.length === 0) return null

  return (
    <Section id={sectionIds[locale].experience} title={t('sections.experience')} intro={t('sections.experienceIntro')}>
      <ol className="mt-12 space-y-16">
        {items.map((item) => (
          <li key={`${item.company}-${item.start}`} data-reveal>
            <article className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10">
              <div>
                <p className="text-sm text-accent">
                  {formatRange(item.start, item.end, locale, t('common.present'))} · {item.company}
                  {item.location && ` · ${item.location}`}
                </p>
                <h3 className="mt-1.5 text-2xl font-semibold tracking-[-0.02em] text-balance">{item.role}</h3>
                <p className="mt-2 text-soft">{item.summary}</p>
                {item.highlights.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-soft marker:text-subtle">
                    {item.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
                <Tags items={item.stack} />
                <Lesson label={t('lesson.label')} text={item.lesson} />
                {item.url && (
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    <ExternalLink href={item.url} newTabLabel={t('common.opensInNewTab')} pendingText={t('common.pending')}>
                      {t('experience.companySite')}
                    </ExternalLink>
                  </div>
                )}
              </div>
              <Media
                image={item.image && { src: item.image.src, alt: item.image.alt[locale] }}
                label={t('experience.image')}
                pendingText={t('common.pending')}
                fallback={initials(item.company)}
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-video rounded-3xl"
              />
            </article>
          </li>
        ))}
      </ol>
    </Section>
  )
}
