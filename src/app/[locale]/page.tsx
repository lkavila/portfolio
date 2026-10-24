import { getTranslations } from 'next-intl/server'
import { CertificationsSection } from '@/components/sections/CertificationsSection'
import { EducationSection } from '@/components/sections/EducationSection'
import { ExperienceSection } from '@/components/sections/ExperienceSection'
import { Hero } from '@/components/sections/Hero'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { SiteFooter } from '@/components/sections/SiteFooter'
import { SiteHeader } from '@/components/sections/SiteHeader'

export default async function HomePage() {
  const t = await getTranslations('common')

  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-[60] rounded-lg bg-fg px-4 py-2 font-semibold text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('skipToContent')}
      </a>
      <Hero />
      <SiteHeader />
      <main id="contenido" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 outline-none sm:px-6">
        <ExperienceSection />
        <ProjectsSection />
        <EducationSection />
        <CertificationsSection />
      </main>
      <SiteFooter />
    </>
  )
}
