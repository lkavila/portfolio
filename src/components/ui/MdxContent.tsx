import type { ComponentProps, ComponentType, ReactNode } from 'react'
import * as runtime from 'react/jsx-runtime'

type Components = Record<string, ComponentType<Record<string, unknown>>>

type MdxRender = (props: { components?: Components }) => ReactNode

// Velite compila el MDX a código de función en el build; aquí se evalúa en el
// servidor (la página es estática). El MDX lo escribe solo Kener en el repo.
function getMdxRender(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default as MdxRender
}

function Anchor({ href = '', ...props }: ComponentProps<'a'>) {
  if (/^https?:\/\//.test(href)) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
  }
  return <a href={href} {...props} />
}

const components = { a: Anchor } as Components

export function MdxContent({ code }: { code: string }) {
  // El contenido MDX compilado es una función pura sin hooks: se llama directo
  // en vez de crear un componente nuevo en cada render.
  return getMdxRender(code)({ components })
}
