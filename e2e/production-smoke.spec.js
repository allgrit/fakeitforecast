import { test, expect } from '@playwright/test'

test('production build renders analysis shell and is not blank @smoke @production', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Анализ ABC/XYZ' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Запустить анализ' })).toBeVisible()
})
