import type { ReactNode } from 'react'

type Props = {
  id: string
  title: string
  intro: string
  children: ReactNode
}

// Estructura común de las 4 secciones: ancla, título e introducción.
// scroll-mt deja la sección visible bajo la barra fija al saltar a su ancla.
export function Section({ id, title, intro, children }: Props) {
  const headingId = `${id}-title`
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-20 pt-24 pb-10 sm:pt-28">
      <header data-reveal>
        <h2 id={headingId} className="text-4xl leading-[1.02] font-bold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-muted">{intro}</p>
      </header>
      {children}
    </section>
  )
}
