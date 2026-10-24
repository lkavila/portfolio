'use client'

import { type ReactNode, useEffect, useState } from 'react'

export type ProjectKind = 'personal' | 'academic'
type Filter = 'all' | ProjectKind

type Props = {
  label: string
  options: { value: Filter; label: string }[]
  children: ReactNode
}

const param = 'filtro'

function readFilter(options: Props['options']): Filter {
  const value = new URLSearchParams(window.location.search).get(param)
  return options.find((o) => o.value === value)?.value ?? 'all'
}

// Filtro Todos/Personales/Académicos. Las tarjetas llegan renderizadas desde el
// servidor; aquí solo se marca el contenedor y CSS oculta las demás. El filtro
// vive en ?filtro= (replaceState) para restaurarse al volver de un caso de estudio.
// Sin JS no se muestran los botones y se ven todos los proyectos.
export function ProjectFilter({ label, options, children }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    // Leer la URL solo en el cliente mantiene la página estática.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilter(readFilter(options))
  }, [options])

  const choose = (value: Filter) => {
    setFilter(value)
    const url = new URL(window.location.href)
    if (value === 'all') url.searchParams.delete(param)
    else url.searchParams.set(param, value)
    window.history.replaceState(window.history.state, '', url)
  }

  return (
    <>
      {options.length > 2 && (
        <div role="group" aria-label={label} data-requires-js className="mt-7 mb-6 flex flex-wrap gap-1.5">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => choose(option.value)}
              className="min-h-11 rounded-[10px] border border-line-strong px-3.5 text-[13px] font-semibold text-muted hover:text-fg aria-pressed:border-fg aria-pressed:bg-fg aria-pressed:text-bg"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      <div data-filter={filter}>{children}</div>
    </>
  )
}
