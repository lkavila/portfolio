import { expect, test } from '@playwright/test'

// T7 (CEO D9 + Eng D3): tres encabezados de seguridad y ninguna CSP.
const expected = {
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff'
}

for (const path of ['/es', '/en/proyectos/portafolio', '/es/proyectos/no-existe', '/favicon.ico']) {
  test(`${path} envía los encabezados de seguridad y no envía CSP`, async ({ request }) => {
    const res = await request.get(path, { maxRedirects: 0 })
    const headers = res.headers()
    for (const [key, value] of Object.entries(expected)) {
      expect(headers[key], key).toBe(value)
    }
    expect(headers['content-security-policy']).toBeUndefined()
    expect(headers['x-powered-by']).toBeUndefined()
  })
}

test('la página carga sin errores de consola', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
  await page.goto('/es')
  await page.waitForLoadState('networkidle')
  expect(errors).toEqual([])
})
