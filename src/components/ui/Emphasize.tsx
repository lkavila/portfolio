import { Fragment } from 'react'

// Cifras con su unidad: "50 %", "~90.000", "100 ms", "4 horas", "30 minutes"…
const numberPattern = /(~?\d[\d.,]*(?:\s?(?:%|ms|horas?|hours?|minutos|minutes|min)\b|\s?%)?)/g

/** Resalta las cifras de una frase para que se lean al escanear (revisión de diseño 1B). */
export function Emphasize({ text }: { text: string }) {
  return text.split(numberPattern).map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-fg tabular-nums">
        {part}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  )
}
