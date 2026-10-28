'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

type Props = { heroId: string; className?: string; children: ReactNode }

// Revisión de diseño 1C: el nombre y el CV aparecen en la barra fija solo cuando
// el hero ya no se ve, así la acción principal sigue a mano durante todo el scroll.
// Sin JS no hay data-shown y el CSS lo deja visible.
export function StickyIdentity({ heroId, className = '', children }: Props) {
  const [shown, setShown] = useState<boolean>()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Con cacheComponents puede haber otra página oculta en el DOM con el mismo id.
    const hero = [...document.querySelectorAll<HTMLElement>(`#${heroId}`)].find((el) => el.checkVisibility())
    if (!hero) return
    const observer = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting), { threshold: 0 })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [heroId])

  useEffect(() => {
    // inert saca los enlaces ocultos del orden de tabulación.
    ref.current?.toggleAttribute('inert', shown === false)
  }, [shown])

  return (
    <div
      ref={ref}
      data-sticky-identity=""
      data-shown={shown === undefined ? undefined : String(shown)}
      aria-hidden={shown === false ? true : undefined}
      className={className}
    >
      {children}
    </div>
  )
}
