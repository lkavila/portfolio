import { expect, type Page, test } from '@playwright/test'

const nav = (page: Page) => page.getByRole('navigation', { name: 'Secciones' })

async function sectionTopBelowNav(page: Page, id: string) {
  return page.evaluate((id) => {
    const bar = document.querySelector('nav[aria-label="Secciones"]')!.closest('.sticky')!
    return document.getElementById(id)!.getBoundingClientRect().top >= bar.getBoundingClientRect().bottom - 1
  }, id)
}

test.describe('barra de secciones', () => {
  test('un clic lleva a la sección, la marca activa y agrega el ancla', async ({ page }) => {
    await page.goto('/es')
    await nav(page).getByRole('link', { name: 'Estudios' }).click()
    await expect(page).toHaveURL(/\/es#estudios$/)
    await expect(page.locator('#estudios')).toBeInViewport()
    await expect(nav(page).getByRole('link', { name: 'Estudios' })).toHaveAttribute('aria-current', 'true')
  })

  test('un ancla directa aterriza en la sección sin quedar tapada por la barra', async ({ page }) => {
    await page.goto('/es#certificaciones')
    await expect(page.locator('#certificaciones')).toBeInViewport()
    expect(await sectionTopBelowNav(page, 'certificaciones')).toBe(true)
  })

  test('se puede usar con teclado (Tab + Enter)', async ({ page }) => {
    await page.goto('/es')
    const link = nav(page).getByRole('link', { name: 'Proyectos' })
    for (let i = 0; i < 20 && !(await link.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press('Tab')
    }
    await expect(link).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/#proyectos$/)
  })

  test('al bajar se marca la sección correcta y al final la última', async ({ page }) => {
    await page.goto('/en')
    const sections = page.getByRole('navigation', { name: 'Sections' })
    await page.locator('#projects').evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await expect(sections.getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'true')
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect(sections.getByRole('link', { name: 'Certifications' })).toHaveAttribute('aria-current', 'true')
  })
})

test.describe('filtro de proyectos', () => {
  const cards = (page: Page) => page.locator('#proyectos li[data-kind]')

  test('Académicos muestra solo esos y guarda ?filtro=', async ({ page }) => {
    await page.goto('/es')
    const total = await cards(page).count()
    await page.getByRole('group', { name: 'Filtrar proyectos' }).getByRole('button', { name: 'Académicos' }).click()
    await expect(page).toHaveURL(/\?filtro=academic/)
    const visible = cards(page).filter({ visible: true })
    await expect(visible.first()).toBeVisible()
    for (const kind of await visible.evaluateAll((els) => els.map((el) => el.getAttribute('data-kind')))) {
      expect(kind).toBe('academic')
    }
    expect(await visible.count()).toBeLessThan(total)
  })

  test('el filtro se restaura desde la URL', async ({ page }) => {
    await page.goto('/es?filtro=personal#proyectos')
    await expect(page.getByRole('button', { name: 'Personales' })).toHaveAttribute('aria-pressed', 'true')
    for (const kind of await cards(page)
      .filter({ visible: true })
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-kind')))) {
      expect(kind).toBe('personal')
    }
  })
})

test.describe('sin JS', () => {
  test.use({ javaScriptEnabled: false })

  test('todo el contenido se ve, las anclas funcionan y no hay filtro', async ({ page }) => {
    await page.goto('/es#proyectos')
    for (const id of ['experiencia', 'proyectos', 'estudios', 'certificaciones']) {
      await expect(page.locator(`#${id} h2`)).toBeVisible()
    }
    const hidden = await page
      .locator('[data-reveal]')
      .evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity !== '1').length)
    expect(hidden).toBe(0)
    await expect(page.getByRole('group', { name: 'Filtrar proyectos' })).toBeHidden()
    await expect(page.locator('#proyectos li[data-kind]').filter({ visible: false })).toHaveCount(0)
    await expect(page.locator('#proyectos')).toBeInViewport()
  })
})

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' })

  test('los reveals no animan ni ocultan contenido', async ({ page }) => {
    await page.goto('/es')
    const animated = await page.locator('[data-reveal]').evaluateAll((els) =>
      els.filter((el) => {
        const style = getComputedStyle(el)
        return style.opacity !== '1' || style.transitionDuration.split(',').some((d) => parseFloat(d) > 0)
      }).length
    )
    expect(animated).toBe(0)
  })
})

test('el título del hero (LCP) es visible sin esperar animaciones', async ({ page }) => {
  await page.goto('/es')
  const h1 = page.getByRole('heading', { level: 1 })
  await expect(h1).toBeVisible()
  expect(await h1.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
})

test('los enlaces externos abren en otra pestaña con rel seguro', async ({ page }) => {
  await page.goto('/es')
  const rels = await page
    .locator('a[target="_blank"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('rel')))
  expect(rels.length).toBeGreaterThan(0)
  for (const rel of rels) expect(rel).toBe('noopener noreferrer')
})

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 }
]) {
  test(`sin scroll horizontal a ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    for (const path of ['/es', '/en/proyectos/portafolio']) {
      await page.goto(path)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      expect(overflow, path).toBeLessThanOrEqual(0)
    }
  })
}

test('en escritorio la columna de texto de cada trabajo es más ancha que su imagen', async ({ page }) => {
  // Regresión: con texto largo, la imagen 16:9 se estiraba al alto de la fila y
  // se ensanchaba hasta aplastar el texto.
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/es')
  const columns = await page
    .locator('#experiencia article')
    .evaluateAll((articles) => articles.map((a) => [...a.children].map((c) => Math.round(c.getBoundingClientRect().width))))
  expect(columns.length).toBeGreaterThan(1)
  for (const [text, media] of columns) expect(text).toBeGreaterThan(media)
})
