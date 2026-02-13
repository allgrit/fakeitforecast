import fs from 'node:fs'
import { test, expect, chromium } from '@playwright/test'

const hasChromium = fs.existsSync(chromium.executablePath())

test.skip(!hasChromium, 'Chromium browser is not installed in this environment')

test('production build renders analysis shell and is not blank @smoke @production', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Анализ ABC/XYZ' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Запустить анализ' })).toBeVisible()
})
