'use client'

import { type MouseEvent, type ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Ruta anterior dentro del sitio. document.referrer no sirve: no cambia en las
// navegaciones del lado del cliente.
let previousPath: string | undefined
let currentPath: string | undefined

/** Se monta una vez en el layout y registra cada cambio de ruta. */
export function PathTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (pathname === currentPath) return
    previousPath = currentPath
    currentPath = pathname
  }, [pathname])
  return null
}

type Props = { href: string; children: ReactNode }

// "Volver a proyectos": si se llegó desde la página de inicio, vuelve atrás en el
// historial para restaurar el filtro (?filtro=) y la posición. Si se abrió el
// caso de estudio directo (o sin JS), navega al ancla de proyectos.
export function BackLink({ href, children }: Props) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (previousPath && previousPath === new URL(href, location.href).pathname) {
      event.preventDefault()
      history.back()
    }
  }

  return (
    <a href={href} onClick={onClick} className="flex min-h-11 items-center text-sm font-semibold text-muted hover:text-fg">
      {children}
    </a>
  )
}
