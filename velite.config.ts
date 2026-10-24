import { createContentConfig } from './src/content/config'

// Capa de contenido: lee content/ y genera datos tipados en .velite/
// (importable como #site/content) e imágenes optimizables en public/static/.
// Los esquemas y reglas viven en src/content/config.ts.
export default createContentConfig({ root: 'content', output: '.' })
