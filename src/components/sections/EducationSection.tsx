import { getLocale, getTranslations } from 'next-intl/server'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { initials, Media } from '@/components/ui/Media'
import { Section } from '@/components/ui/Section'
import { Lesson } from '@/components/ui/Tags'
import { getEducation } from '@/content'
import { sectionIds } from '@/i18n/sections'
import { formatRange } from '@/lib/dates'

export async function EducationSection() {
  const locale = await getLocale()
  const t = await getTranslations()
  const items = getEducation(locale)
  if (items.length === 0) return null

  return (
    <Section id={sectionIds[locale].education} title={t('sections.education')} intro={t('sections.educationIntro')}>
      {/* Línea de tiempo vertical */}
      <ol className="relative mt-10 pl-8.5 before:absolute before:top-1.5 before:bottom-1.5 before:left-[7px] before:w-0.5 before:bg-gradient-to-b before:from-accent-2 before:via-accent before:to-transparent">
        {items.map((item) => (
          <li
            key={`${item.institution}-${item.start}`}
            data-reveal
            className="relative pb-12 before:absolute before:top-1.5 before:-left-[33px] before:size-3.5 before:rounded-full before:border-2 before:border-accent-2 before:bg-bg"
          >
            <div className="grid items-start gap-6 md:grid-cols-[1fr_220px]">
              <div>
                <p className="text-sm text-accent">
                  {formatRange(item.start, item.end, locale, t('common.present'))} · {item.institution}
                </p>
                <h3 className="mt-1 mb-1.5 text-2xl font-semibold tracking-[-0.02em] text-balance">{item.degree}</h3>
                {item.description && <p className="text-soft">{item.description}</p>}
                <Lesson label={t('lesson.label')} text={item.lesson} />
                {item.url && (
                  <div className="mt-3.5">
                    <ExternalLink href={item.url} newTabLabel={t('common.opensInNewTab')} pendingText={t('common.pending')}>
                      {item.institution}
                    </ExternalLink>
                  </div>
                )}
              </div>
              <Media
                image={item.image && { src: item.image.src, alt: item.image.alt[locale] }}
                label={t('education.image')}
                pendingText={t('common.pending')}
                fallback={initials(item.institution)}
                sizes="220px"
                className="aspect-[4/3] rounded-[14px]"
              />
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
