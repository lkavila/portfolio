import { defineRouting } from 'next-intl/routing'

// D7 (R-LOC): "/" manda al idioma del navegador; si no es español, inglés.
// La elección manual se recuerda un año en la cookie NEXT_LOCALE.
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'en',
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
  // hreflang se publica en el <head> de cada página (generateMetadata),
  // no como encabezado Link, porque el proxy solo corre en rutas sin idioma.
  alternateLinks: false
})
