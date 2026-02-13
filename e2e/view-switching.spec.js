import fs from 'node:fs'
import { test, expect, chromium } from '@playwright/test'

const hasChromium = fs.existsSync(chromium.executablePath())

test.skip(!hasChromium, 'Chromium browser is not installed in this environment')

test('switches between Таблица, График, Карта views @smoke', async ({ page }) => {
  await page.goto('/analysis/an100005')

  const viewSelect = page.getByLabel('Вид')
  await expect(viewSelect).toHaveValue('table')

  await page.getByRole('tab', { name: 'График' }).click()
  await expect(viewSelect).toHaveValue('chart')
  await expect(page.getByRole('img', { name: 'ABC XYZ scatter chart' })).toBeVisible()

  await page.getByRole('tab', { name: 'Карта' }).click()
  await expect(viewSelect).toHaveValue('map')
  await expect(page.getByLabel('Treemap по складам и группам')).toBeVisible()
})
