import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('static bootstrap fallback link', () => {
  it('points to demo analysis route under BASE_URL prefix', () => {
    const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

    expect(indexHtml).toContain('Перейти к демонстрационному анализу ABC/XYZ')
    expect(indexHtml).toContain('href="%BASE_URL%analysis/abc-xyz"')
  })
})
