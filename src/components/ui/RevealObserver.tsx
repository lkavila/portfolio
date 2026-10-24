'use client'

import { useEffect } from 'react'
import { usePathname } from '@/i18n/navigation'

// Marca con data-revealed cada [data-reveal] que entra en pantalla; el CSS hace
// la transición. Un solo observador para todo el sitio en vez de una isla por bloque.
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const pending = document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')
    if (!('IntersectionObserver' in window)) {
      pending.forEach((el) => el.setAttribute('data-revealed', ''))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-revealed', '')
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    )
    pending.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [pathname])

  return null
}
