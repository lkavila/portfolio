import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Solo rutas sin prefijo de idioma ("/", "/proyectos/x"): /es y /en se sirven
  // estáticas sin pasar por aquí. También se excluyen internos y archivos con punto.
  matcher: ['/((?!(?:es|en)(?:/|$)|_next|_vercel|static/|.*\\..*).*)']
}
