import { defineConfig } from 'velite'

// Capa de contenido: lee content/ y genera datos tipados en .velite/.
// Las colecciones (experiencia, estudios, certificaciones, proyectos) se agregan en T3.
export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true
  },
  collections: {}
})
