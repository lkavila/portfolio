import { describe, expect, it } from 'vitest'
import en from '../../messages/en.json'
import es from '../../messages/es.json'

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  )
}

describe('messages', () => {
  it('es y en tienen exactamente las mismas claves', () => {
    expect(keys(en).sort()).toEqual(keys(es).sort())
  })

  it('ningún texto está vacío', () => {
    for (const [name, messages] of Object.entries({ es, en })) {
      const empty = keys(messages).filter((k) => {
        const value = k.split('.').reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], messages)
        return typeof value !== 'string' || value.trim() === ''
      })
      expect(empty, `${name}.json`).toEqual([])
    }
  })
})
