import { createContentConfig } from './src/content/config'

// Contenido fijo para los E2E (`npm run build:e2e`): las pruebas no dependen del
// contenido real, que Kener edita libremente. Mismas reglas que velite.config.ts.
export default createContentConfig({ root: 'tests/e2e/fixtures/content', output: '.' })
