import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Emphasize } from '../../src/components/ui/Emphasize'

const strong = (text: string) =>
  [...renderToStaticMarkup(Emphasize({ text }) as never).matchAll(/<strong[^>]*>([^<]*)<\/strong>/g)].map((m) => m[1])

describe('Emphasize', () => {
  it('resalta cifras con su unidad en español e inglés', () => {
    expect(strong('Bajó de 4 horas a 30 minutos, con un 50 % menos de costo')).toEqual(['4 horas', '30 minutos', '50 %'])
    expect(strong('at about 90,000 daily transactions, under 100 ms')).toEqual(['90,000', '100 ms'])
    expect(strong('unas ~90.000 transacciones')).toEqual(['~90.000'])
  })

  it('deja intacto un texto sin cifras', () => {
    expect(strong('Lideré la integración de streaming en vivo')).toEqual([])
  })
})
