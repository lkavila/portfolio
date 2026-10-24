import type { ReactNode } from 'react'
import { showPending } from '@/lib/env'

type Props = {
  href?: string
  children: ReactNode
  /** Texto accesible "(se abre en otra pestaña)". */
  newTabLabel: string
  pendingText: string
  variant?: 'chip' | 'button' | 'primary'
  /** false para enlaces del mismo sitio (ej. el PDF del CV). */
  external?: boolean
  download?: boolean
}

const styles = {
  chip: 'rounded-lg border border-line-strong px-2.5 py-1.5 text-[13px] text-strong hover:border-muted',
  button:
    'inline-flex min-h-11 items-center rounded-[10px] border border-line-strong bg-card/60 px-4 text-sm font-semibold hover:border-muted',
  primary:
    'inline-flex min-h-11 items-center rounded-[10px] border border-fg bg-fg px-4 text-sm font-semibold text-bg hover:bg-strong'
}

// Enlace de un campo reservado: si falta la URL, "pendiente" en dev/preview y nada en producción.
export function ExternalLink({ href, children, newTabLabel, pendingText, variant = 'chip', external = true, download }: Props) {
  const className = styles[variant]

  if (!href) {
    if (!showPending) return null
    return (
      <span className={`${className} border-dashed border-slot! bg-transparent! text-subtle!`}>
        {children} · {pendingText}
      </span>
    )
  }

  if (!external) {
    return (
      <a href={href} download={download} className={className}>
        {children}
      </a>
    )
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> {newTabLabel}</span>
    </a>
  )
}
