import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('static bootstrap fallback link', () => {
  it('contains a bootstrap link that is patched for GitHub Pages path fallback', () => {
    const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

    expect(indexHtml).toContain('Перейти к демонстрационному анализу ABC/XYZ')
    expect(indexHtml).toContain('data-bootstrap-analysis-link')
    expect(indexHtml).toContain("const fallbackBaseUrl = '%BASE_URL%'")
    expect(indexHtml).toContain("analysisLink.setAttribute('href', `${resolveBootstrapBaseUrl()}analysis/abc-xyz`)")
  })
})
