import { getLocale, getTranslations } from 'next-intl/server'
import { ExternalLink } from '@/components/ui/ExternalLink'
import { Section } from '@/components/ui/Section'
import { getCertificationsByIssuer } from '@/content'
import { sectionIds } from '@/i18n/sections'
import { formatMonth } from '@/lib/dates'

export async function CertificationsSection() {
  const locale = await getLocale()
  const t = await getTranslations()
  const groups = getCertificationsByIssuer()
  if (groups.length === 0) return null

  return (
    <Section
      id={sectionIds[locale].certifications}
      title={t('sections.certifications')}
      intro={t('sections.certificationsIntro')}
    >
      {groups.map(({ issuer, items }) => (
        <div key={issuer}>
          <h3 data-reveal className="mt-10 mb-3.5 text-[15px] font-bold text-strong">
            {issuer}
          </h3>
          <ul className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((cert) => (
              <li key={`${cert.name}-${cert.date}`} data-reveal>
                <article className="h-full rounded-[18px] border border-line bg-card px-4.5 pt-4 pb-5">
                  <h4 className="mb-1 text-[17px] font-semibold text-balance">{cert.name}</h4>
                  <p className="text-[13px] text-subtle">
                    <time dateTime={cert.date}>{formatMonth(cert.date, locale)}</time>
                  </p>
                  <div className="mt-3.5 flex flex-wrap gap-2">
                    {cert.verifyUrl || cert.file ? (
                      <>
                        {cert.verifyUrl && (
                          <ExternalLink href={cert.verifyUrl} newTabLabel={t('common.opensInNewTab')} pendingText={t('common.pending')}>
                            {t('certifications.verify')}
                            <span className="sr-only">: {cert.name}</span>
                          </ExternalLink>
                        )}
                        {cert.file && (
                          <ExternalLink href={cert.file} newTabLabel={t('common.opensInNewTab')} pendingText={t('common.pending')}>
                            {t('certifications.viewFile')}
                            <span className="sr-only">: {cert.name}</span>
                          </ExternalLink>
                        )}
                      </>
                    ) : (
                      <ExternalLink newTabLabel={t('common.opensInNewTab')} pendingText={t('common.pending')}>
                        {t('certifications.verifyOrFile')}
                      </ExternalLink>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Section>
  )
}
