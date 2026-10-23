'use client'

import { useSyncExternalStore } from 'react'
import { type SectionKey, sectionKeyFromId } from '@/i18n/sections'

// Sección visible en este momento. La escribe la barra de secciones (scrollspy)
// y la lee el selector de idioma para conservar el ancla al cambiar de idioma.
let active: SectionKey | undefined
const listeners = new Set<() => void>()

export function setActiveSection(key: SectionKey | undefined) {
  if (key === active) return
  active = key
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onHash = () => setActiveSection(sectionKeyFromId(location.hash.slice(1)))
  if (active === undefined) onHash()
  window.addEventListener('hashchange', onHash)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('hashchange', onHash)
  }
}

export function useActiveSection() {
  return useSyncExternalStore(
    subscribe,
    () => active,
    () => undefined
  )
}
