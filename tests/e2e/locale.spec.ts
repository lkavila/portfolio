import { expect, test } from '@playwright/test'

// D7 (R-LOC): "/" usa el idioma del navegador; la cookie de una elección manual gana.
const cases = [
  { acceptLanguage: 'es-CO,es;q=0.9', expected: '/es' },
  { acceptLanguage: 'en-US,en;q=0.9', expected: '/en' },
  { acceptLanguage: 'de-DE,de;q=0.9', expected: '/en' },
  { acceptLanguage: '', expected: '/en' },
  { acceptLanguage: ';;;basura', expected: '/en' }
]

for (const { acceptLanguage, expected } of cases) {
  test(`"/" con Accept-Language "${acceptLanguage}" va a ${expected}`, async ({ request }) => {
    const res = await request.get('/', {
      headers: { 'accept-language': acceptLanguage },
      maxRedirects: 0
    })
    expect(res.status()).toBe(307)
    expect(new URL(res.headers().location, res.url()).pathname).toBe(expected)
  })
}

test('la cookie de idioma gana sobre Accept-Language', async ({ request }) => {
  const res = await request.get('/', {
    headers: { 'accept-language': 'en-US', cookie: 'NEXT_LOCALE=es' },
    maxRedirects: 0
  })
  expect(new URL(res.headers().location, res.url()).pathname).toBe('/es')
})

test('una cookie inválida cae a inglés', async ({ request }) => {
  const res = await request.get('/', {
    headers: { 'accept-language': 'de-DE', cookie: 'NEXT_LOCALE=xx' },
    maxRedirects: 0
  })
  expect(new URL(res.headers().location, res.url()).pathname).toBe('/en')
})

test('un idioma no soportado termina en 404', async ({ request }) => {
  const res = await request.get('/fr')
  expect(res.status()).toBe(404)
})

for (const locale of ['es', 'en']) {
  test(`/${locale} publica lang, canonical y hreflang con x-default en inglés`, async ({ page }) => {
    await page.goto(`/${locale}`)
    await expect(page.locator('html')).toHaveAttribute('lang', locale)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/${locale}$`))
    for (const [hreflang, path] of [['es', '/es'], ['en', '/en'], ['x-default', '/en']]) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)).toHaveAttribute(
        'href',
        new RegExp(`${path}$`)
      )
    }
  })
}

test('el selector de idioma conserva la sección y recuerda la elección', async ({ page, context }) => {
  await page.goto('/es#proyectos')
  await page.getByRole('link', { name: 'English' }).click()
  await expect(page).toHaveURL(/\/en#projects$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')

  const cookie = (await context.cookies()).find((c) => c.name === 'NEXT_LOCALE')
  expect(cookie?.value).toBe('en')
})
