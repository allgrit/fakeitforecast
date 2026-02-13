import { describe, expect, it } from 'vitest'
import { validateThresholds } from './analysisValidation'

describe('validateThresholds', () => {
  it('returns valid for descending values within range', () => {
    const result = validateThresholds({ a: 80, b: 50, c: 20 })

    expect(result.isValid).toBe(true)
    expect(result.fieldErrors).toEqual({})
  })

  it('returns errors when threshold is outside 0-100', () => {
    const result = validateThresholds({ a: 101, b: 50, c: 20 })

    expect(result.isValid).toBe(false)
    expect(result.fieldErrors.a).toContain('0–100')
  })

  it('returns errors when thresholds are not in descending order', () => {
    const result = validateThresholds({ a: 40, b: 50, c: 20 })

    expect(result.isValid).toBe(false)
    expect(result.fieldErrors).toEqual({
      a: 'Границы должны быть по убыванию: A ≥ B ≥ C',
      b: 'Границы должны быть по убыванию: A ≥ B ≥ C',
      c: 'Границы должны быть по убыванию: A ≥ B ≥ C'
    })
  })
})
