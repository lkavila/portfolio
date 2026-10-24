import { expect, test } from '@playwright/test'

// Solo tiene sentido contra un build hecho con VERCEL_ENV=production:
//   VERCEL_ENV=production npm run build && VERCEL_ENV=production npm run e2e -- production
// En dev/preview los campos reservados vacíos sí muestran "pendiente".
test.skip(process.env.VERCEL_ENV !== 'production', 'requiere un build con VERCEL_ENV=production')

for (const [locale, word] of [
  ['es', 'pendiente'],
  ['en', 'pending']
]) {
  test(`/${locale} no muestra "${word}" en producción`, async ({ page }) => {
    await page.goto(`/${locale}`)
    await expect(page.locator('body')).not.toContainText(new RegExp(word, 'i'))
    await expect(page.locator('.slot-pending')).toHaveCount(0)
  })
}
