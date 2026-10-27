import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'

// T6 (D6): los PDFs del CV se publican a mano en public/cv/. Mientras falte
// uno, su prueba se omite y el botón del hero se ve "pendiente" (dev/preview).
for (const locale of ['es', 'en']) {
  const file = `/cv/kener-avila-${locale}.pdf`
  const exists = existsSync(join(__dirname, '../../public', file))

  test(`el CV en ${locale} se descarga como PDF desde el hero`, async ({ page, request }) => {
    test.skip(!exists, `falta public${file}`)
    await page.goto(`/${locale}`)
    await expect(page.locator(`a[href="${file}"][download]`)).toBeVisible()

    const res = await request.get(file)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('application/pdf')
  })
}
