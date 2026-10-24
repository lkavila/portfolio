import { expect, test } from '@playwright/test'

test('un caso de estudio válido se renderiza con su idioma, canonical y hreflang', async ({ page }) => {
  const res = await page.goto('/es/proyectos/portafolio')
  expect(res?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Portafolio bilingüe')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/es\/proyectos\/portafolio$/)
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    'href',
    /\/en\/proyectos\/portafolio$/
  )
  // Cuerpo MDX
  await expect(page.getByRole('heading', { level: 2, name: 'Problema' })).toBeVisible()
})

test('el selector de idioma lleva al mismo caso de estudio', async ({ page }) => {
  await page.goto('/es/proyectos/portafolio')
  await page.getByRole('link', { name: 'English' }).click()
  await expect(page).toHaveURL(/\/en\/proyectos\/portafolio$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bilingual portfolio')
})

test('volver desde un caso de estudio restaura el filtro', async ({ page }) => {
  await page.goto('/es#proyectos')
  await page.getByRole('button', { name: 'Académicos' }).click()
  await expect(page).toHaveURL(/\?filtro=academic/)

  await page.locator('#proyectos li[data-kind="academic"]').first().getByRole('link', { name: /Ver caso de estudio/ }).click()
  await expect(page).toHaveURL(/\/es\/proyectos\/proyecto-academico$/)

  await page.getByRole('link', { name: /Volver a proyectos/ }).click()
  await expect(page).toHaveURL(/\/es\?filtro=academic/)
  await expect(page.getByRole('button', { name: 'Académicos' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#proyectos li[data-kind="personal"]')).toBeHidden()
})

test('el botón atrás del navegador también restaura el filtro', async ({ page }) => {
  await page.goto('/es?filtro=academic#proyectos')
  await page.locator('#proyectos li[data-kind="academic"]').first().getByRole('link', { name: /Ver caso de estudio/ }).click()
  await expect(page).toHaveURL(/\/proyectos\/proyecto-academico$/)
  await page.goBack()
  await expect(page).toHaveURL(/\?filtro=academic/)
  await expect(page.getByRole('button', { name: 'Académicos' })).toHaveAttribute('aria-pressed', 'true')
})

test('abierto directo, "Volver a proyectos" lleva a la sección de proyectos', async ({ page }) => {
  await page.goto('/en/proyectos/portafolio')
  await page.getByRole('link', { name: /Back to projects/ }).click()
  await expect(page).toHaveURL(/\/en#projects$/)
})

test.describe('404 bilingüe', () => {
  for (const path of ['/es/proyectos/no-existe', '/en/proyectos/nope', '/fr', '/es/nada/mas']) {
    test(`${path} responde 404 con ambos idiomas y enlace al inicio`, async ({ page }) => {
      const res = await page.goto(path)
      expect(res?.status()).toBe(404)
      await expect(page.getByText('Página no encontrada')).toBeVisible()
      await expect(page.getByText('Page not found')).toBeVisible()
      await expect(page.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/es')
      await expect(page.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/en')
    })
  }

  test('en un slug inválido el idioma de la página va primero', async ({ page }) => {
    await page.goto('/en/proyectos/nope')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found')
  })
})
