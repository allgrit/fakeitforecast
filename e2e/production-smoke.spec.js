import fs from 'node:fs'
import { test, expect, chromium } from '@playwright/test'

const hasChromium = fs.existsSync(chromium.executablePath())

test.skip(!hasChromium, 'Chromium browser is not installed in this environment')

test('production build renders analysis shell and is not blank @smoke @production', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Анализ (ABC\/XYZ|abc-xyz)/i })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Запустить анализ' })).toBeVisible()
})


test('shows static bootstrap page when SPA entry script is unavailable @smoke @production', async ({ page }) => {
  let blockedEntryRequests = 0
  await page.route('**/src/main.jsx', (route) => {
    if (blockedEntryRequests === 0) {
      blockedEntryRequests += 1
      return route.abort()
    }

    return route.continue()
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'FakeItForecast' })).toBeVisible()
  const demoAnalysisLink = page.getByRole('link', { name: 'Перейти к демонстрационному анализу ABC/XYZ' })
  await expect(demoAnalysisLink).toBeVisible()
  await expect(demoAnalysisLink).toHaveAttribute('href', /\/analysis\/abc-xyz$/)

  await demoAnalysisLink.click()
  await expect(page).toHaveURL(/\/analysis\/abc-xyz$/)
  await expect(page.getByRole('heading', { name: /Анализ (ABC\/XYZ|abc-xyz)/i })).toBeVisible()
})
