import { describe, expect, it } from 'vitest'
import { validateDemoDataset, validateServiceLevels, validateThresholds } from './analysisValidation'

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

describe('validateDemoDataset', () => {
  const validPayload = {
    formatVersion: '2.0.0',
    meta: {
      datasetId: 'abc-xyz',
      name: 'Демо набор',
      createdAt: '2026-01-01T10:00:00.000Z'
    },
    tree: [
      {
        id: 'grp-1',
        name: 'Группа',
        type: 'group',
        children: []
      }
    ],
    analysisItems: [
      {
        sku: 'SKU-001',
        abc: 'A',
        xyz: 'X',
        x: 95,
        y: 80,
        volume: 10
      }
    ],
    serviceLevels: {
      AA: 99,
      AB: 97,
      AC: 95,
      BA: 93,
      BB: 91,
      BC: 89,
      CA: 87,
      CB: 85,
      CC: 83
    },
    filters: {
      warehouseIds: ['msk'],
      classificationKinds: ['abcxyz']
    }
  }

  it('returns valid result for a fully valid payload', () => {
    const result = validateDemoDataset(validPayload)

    expect(result.isValid).toBe(true)
    expect(result.fieldErrors).toEqual({})
    expect(result.warnings).toEqual([])
  })

  it('returns error when required section is missing', () => {
    const payload = { ...validPayload }
    delete payload.meta

    const result = validateDemoDataset(payload)

    expect(result.isValid).toBe(false)
    expect(result.fieldErrors.meta).toBe('Обязательная секция отсутствует')
  })

  it('returns detailed errors for invalid field types', () => {
    const payload = {
      ...validPayload,
      tree: [{ id: 100, name: '', type: 'invalid', children: 'oops' }],
      analysisItems: [{ sku: null, abc: 'D', xyz: 'K', x: 'bad', y: 120, volume: -1 }],
      filters: {
        warehouseIds: 'msk',
        classificationKinds: null
      }
    }

    const result = validateDemoDataset(payload)

    expect(result.isValid).toBe(false)
    expect(result.fieldErrors['tree[0].id']).toBe('Ожидается непустая строка')
    expect(result.fieldErrors['analysisItems[0].x']).toBe('Ожидается число')
    expect(result.fieldErrors['analysisItems[0].y']).toBe('Допустимый диапазон 0–100')
    expect(result.fieldErrors['filters.warehouseIds']).toBe('Ожидается массив')
  })

  it('returns version error for unsupported format', () => {
    const result = validateDemoDataset({
      ...validPayload,
      formatVersion: '9.9.9'
    })

    expect(result.isValid).toBe(false)
    expect(result.fieldErrors.formatVersion).toContain('не поддерживается')
  })

  it('returns migration warning for deprecated format', () => {
    const result = validateDemoDataset({
      ...validPayload,
      formatVersion: '1.0.0'
    })

    expect(result.isValid).toBe(true)
    expect(result.warnings[0]).toContain('устарел')
  })
})
