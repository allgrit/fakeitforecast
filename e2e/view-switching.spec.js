import { expect, test } from '@playwright/test'

test('switches between Таблица, График, Карта views', async ({ page }) => {
  await page.goto('/analysis/abc-xyz')

  const viewSelect = page.getByLabel('Вид')
  await expect(viewSelect).toHaveValue('table')
  await expect(page.getByRole('columnheader', { name: 'SKU' })).toBeVisible()

  await page.getByRole('tab', { name: 'График' }).click()
  await expect(viewSelect).toHaveValue('chart')
  await expect(page.getByRole('img', { name: 'ABC XYZ scatter chart' })).toBeVisible()

  await page.getByRole('tab', { name: 'Карта' }).click()
  await expect(viewSelect).toHaveValue('map')
  await expect(page.getByLabel('Treemap по складам и группам')).toBeVisible()

  await viewSelect.selectOption('table')
  await expect(page.getByRole('tab', { name: 'Таблица' })).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByRole('columnheader', { name: 'SKU' })).toBeVisible()
})
