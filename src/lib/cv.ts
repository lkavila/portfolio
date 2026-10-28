import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Locale } from 'next-intl'

/**
 * D6: los PDFs del CV se publican a mano en public/cv/. Devuelve la ruta si el
 * archivo existe; si no, undefined (el botón queda "pendiente" en dev/preview y
 * oculto en producción). Se evalúa en el build: las páginas son estáticas.
 */
export function getCvHref(locale: Locale) {
  const path = `/cv/kener-avila-${locale}.pdf`
  return existsSync(join(process.cwd(), 'public', path)) ? path : undefined
}
