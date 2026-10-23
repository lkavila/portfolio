'use client'

import { useEffect, useRef, useState } from 'react'
import { type SectionKey, sectionKeyFromId } from '@/i18n/sections'
import { setActiveSection } from '@/lib/active-section'

type Props = {
  label: string
  items: { key: SectionKey; id: string; label: string }[]
}

// Barra de secciones: anclas nativas (funcionan sin JS y agregan el ancla al
// historial) + scrollspy que marca la sección que cruza el centro de la pantalla.
export function SectionNav({ label, items }: Props) {
  const [active, setActive] = useState<SectionKey>()
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    // Con cacheComponents la página de otro idioma puede seguir en el DOM oculta:
    // solo se observan las secciones visibles.
    const sections = items
      .map((item) => ({ key: item.key, el: document.getElementById(item.id) }))
      .filter((s): s is { key: SectionKey; el: HTMLElement } => !!s.el?.checkVisibility())

    const visible = new Set<SectionKey>()
    // Mientras se desplaza hacia un ancla (al cargar con #ancla o tras un clic),
    // la barra mantiene ese destino en vez de marcar las secciones que va cruzando.
    let target: SectionKey | undefined
    let release: ReturnType<typeof setTimeout> | undefined

    const update = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      const key = target ?? (atBottom ? sections.at(-1)?.key : sections.find((s) => visible.has(s.key))?.key)
      setActive(key)
      setActiveSection(key)
    }

    const goTo = (key: SectionKey | undefined) => {
      if (!key) return
      target = key
      update()
      // scrollend libera el destino; el timeout cubre el caso en que no hay desplazamiento.
      clearTimeout(release)
      release = setTimeout(endScroll, 1200)
    }
    const endScroll = () => {
      target = undefined
      clearTimeout(release)
      update()
    }
    const onHash = () => goTo(sectionKeyFromId(location.hash.slice(1)))

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = sections.find((s) => s.el === entry.target)?.key
          if (!key) continue
          if (entry.isIntersecting) visible.add(key)
          else visible.delete(key)
        }
        update()
      },
      { rootMargin: '-50% 0px -50% 0px' }
    )
    sections.forEach((s) => observer.observe(s.el))
    onHash()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('scrollend', endScroll)
    window.addEventListener('hashchange', onHash)
    return () => {
      observer.disconnect()
      clearTimeout(release)
      window.removeEventListener('scroll', update)
      window.removeEventListener('scrollend', endScroll)
      window.removeEventListener('hashchange', onHash)
      setActiveSection(undefined)
    }
  }, [items])

  // En móvil la barra se desliza: mantiene el enlace activo a la vista.
  useEffect(() => {
    const link = listRef.current?.querySelector<HTMLElement>('[aria-current="true"]')
    const list = listRef.current
    if (!link || !list) return
    const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2
    list.scrollTo({ left, behavior: 'smooth' })
  }, [active])

  return (
    <nav aria-label={label} className="min-w-0 flex-1">
      <ul ref={listRef} className="flex gap-1 overflow-x-auto [scrollbar-width:none] sm:justify-center">
        {items.map((item) => (
          <li key={item.key} className="flex-none">
            <a
              href={`#${item.id}`}
              aria-current={item.key === active ? 'true' : undefined}
              className="flex min-h-11 items-center rounded-[10px] px-3.5 text-sm font-semibold text-muted transition-colors hover:text-fg aria-[current=true]:bg-raised aria-[current=true]:text-fg"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
