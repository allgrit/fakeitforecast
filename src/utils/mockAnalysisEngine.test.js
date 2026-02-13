import { describe, expect, it } from 'vitest'
import { buildMockAnalysisResult } from './mockAnalysisEngine'
import basicDataset from '../data/datasets/basic.json'

describe('buildMockAnalysisResult', () => {
  it('filters demo data by warehouse and selected group', () => {
    const result = buildMockAnalysisResult(basicDataset, {
      warehouseId: 'msk',
      selectedNodeId: 'grp-dairy',
      thresholds: { a: 80, b: 50, c: 20 },
      analysisTypes: { abc: true, xyz: true }
    })

    expect(result.results.length).toBeGreaterThan(0)
    expect(result.results.every((row) => row.warehouse === 'MSK')).toBe(true)
    expect(result.results.every((row) => row.group === 'Молочная продукция')).toBe(true)
  })

  it('recalculates ABC/XYZ classes from thresholds', () => {
    const result = buildMockAnalysisResult(basicDataset, {
      warehouseId: '',
      selectedNodeId: '',
      thresholds: { a: 90, b: 60, c: 10 },
      analysisTypes: { abc: true, xyz: true }
    })

    const sku001 = result.results.find((row) => row.sku === 'SKU-001')
    expect(sku001).toBeTruthy()
    expect(sku001.abc).toBe('B')
    expect(sku001.xyz).toBe('Y')
  })
})
