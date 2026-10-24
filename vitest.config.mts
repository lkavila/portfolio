import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '#site/content': fileURLToPath(new URL('./.velite', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    // Las pruebas de contenido corren velite build sobre fixtures: pueden tardar.
    testTimeout: 30_000
  }
})
