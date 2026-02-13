import { describe, expect, it } from 'vitest'
import { validateServiceLevels, validateThresholds } from './analysisValidation'

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

describe('validateServiceLevels', () => {
  it('returns valid for all combinations in 0..100', () => {
    const result = validateServiceLevels({
      AA: 99,
      AB: 97,
      AC: 95,
      BA: 93,
      BB: 91,
      BC: 89,
      CA: 87,
      CB: 85,
      CC: 83
    })

    expect(result.isValid).toBe(true)
    expect(result.fieldErrors).toEqual({})
  })

  it('returns required/type/range errors', () => {
    const result = validateServiceLevels({
      AA: '',
      AB: 'abc',
      AC: 101,
      BA: 50,
      BB: 50,
      BC: 50,
      CA: 50,
      CB: 50,
      CC: 50
    })

    expect(result.isValid).toBe(false)
    expect(result.fieldErrors.AA).toBe('Поле обязательно')
    expect(result.fieldErrors.AB).toBe('Введите число')
    expect(result.fieldErrors.AC).toContain('0–100')
  })
})
