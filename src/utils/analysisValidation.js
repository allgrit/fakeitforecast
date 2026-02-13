import {
  DEPRECATED_DEMO_DATA_VERSIONS,
  SUPPORTED_DEMO_DATA_VERSIONS,
  TREE_NODE_TYPES
} from '../data/demoDataSchema'

export const THRESHOLD_RANGE = { min: 0, max: 100 }
export const SERVICE_LEVEL_RANGE = { min: 0, max: 100 }

export const SERVICE_LEVEL_COMBINATIONS = ['AA', 'AB', 'AC', 'BA', 'BB', 'BC', 'CA', 'CB', 'CC']

export function validateThresholds(thresholds) {
  const parsed = {
    a: Number(thresholds.a),
    b: Number(thresholds.b),
    c: Number(thresholds.c)
  }

  const fieldErrors = {}

  for (const [key, value] of Object.entries(parsed)) {
    if (!Number.isFinite(value)) {
      fieldErrors[key] = 'Введите число'
      continue
    }

    if (value < THRESHOLD_RANGE.min || value > THRESHOLD_RANGE.max) {
      fieldErrors[key] = `Допустимый диапазон ${THRESHOLD_RANGE.min}–${THRESHOLD_RANGE.max}`
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { isValid: false, fieldErrors }
  }

  if (!(parsed.a >= parsed.b && parsed.b >= parsed.c)) {
    return {
      isValid: false,
      fieldErrors: {
        a: 'Границы должны быть по убыванию: A ≥ B ≥ C',
        b: 'Границы должны быть по убыванию: A ≥ B ≥ C',
        c: 'Границы должны быть по убыванию: A ≥ B ≥ C'
      }
    }
  }

  return { isValid: true, fieldErrors: {} }
}

export function validateServiceLevels(cells) {
  const fieldErrors = {}

  for (const combination of SERVICE_LEVEL_COMBINATIONS) {
    const rawValue = cells?.[combination]

    if (rawValue === '' || rawValue === null || rawValue === undefined) {
      fieldErrors[combination] = 'Поле обязательно'
      continue
    }

    const parsedValue = Number(rawValue)
    if (!Number.isFinite(parsedValue)) {
      fieldErrors[combination] = 'Введите число'
      continue
    }

    if (parsedValue < SERVICE_LEVEL_RANGE.min || parsedValue > SERVICE_LEVEL_RANGE.max) {
      fieldErrors[combination] = `Допустимый диапазон ${SERVICE_LEVEL_RANGE.min}–${SERVICE_LEVEL_RANGE.max}`
    }
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors
  }
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function addError(fieldErrors, path, message) {
  fieldErrors[path] = message
}

function validateVersion(formatVersion, fieldErrors, warnings) {
  if (formatVersion === undefined || formatVersion === null || formatVersion === '') {
    addError(fieldErrors, 'formatVersion', 'Поле обязательно')
    return
  }

  if (typeof formatVersion !== 'string') {
    addError(fieldErrors, 'formatVersion', 'Ожидается строка')
    return
  }

  if (!SUPPORTED_DEMO_DATA_VERSIONS.includes(formatVersion)) {
    addError(
      fieldErrors,
      'formatVersion',
      `Версия ${formatVersion} не поддерживается. Поддерживаемые версии: ${SUPPORTED_DEMO_DATA_VERSIONS.join(', ')}`
    )
    return
  }

  if (DEPRECATED_DEMO_DATA_VERSIONS.includes(formatVersion)) {
    warnings.push(
      `Формат ${formatVersion} устарел. Рекомендуется миграция на версию ${SUPPORTED_DEMO_DATA_VERSIONS.at(-1)}.`
    )
  }
}

function validateRequiredObjectSection(payload, sectionName, fieldErrors) {
  const value = payload?.[sectionName]
  if (value === undefined || value === null) {
    addError(fieldErrors, sectionName, 'Обязательная секция отсутствует')
    return null
  }

  if (!isObject(value)) {
    addError(fieldErrors, sectionName, 'Ожидается объект')
    return null
  }

  return value
}

function validateTreeSection(tree, fieldErrors) {
  if (tree === undefined || tree === null) {
    addError(fieldErrors, 'tree', 'Обязательная секция отсутствует')
    return
  }

  if (!Array.isArray(tree)) {
    addError(fieldErrors, 'tree', 'Ожидается массив')
    return
  }

  tree.forEach((node, index) => {
    const path = `tree[${index}]`
    if (!isObject(node)) {
      addError(fieldErrors, path, 'Ожидается объект')
      return
    }

    if (typeof node.id !== 'string' || node.id.trim() === '') {
      addError(fieldErrors, `${path}.id`, 'Ожидается непустая строка')
    }

    if (typeof node.name !== 'string' || node.name.trim() === '') {
      addError(fieldErrors, `${path}.name`, 'Ожидается непустая строка')
    }

    if (!TREE_NODE_TYPES.includes(node.type)) {
      addError(fieldErrors, `${path}.type`, `Ожидается одно из значений: ${TREE_NODE_TYPES.join(', ')}`)
    }

    if (node.children !== undefined && node.children !== null && !Array.isArray(node.children)) {
      addError(fieldErrors, `${path}.children`, 'Ожидается массив или null')
    }
  })
}

function validateAnalysisItems(items, fieldErrors) {
  if (items === undefined || items === null) {
    addError(fieldErrors, 'analysisItems', 'Обязательная секция отсутствует')
    return
  }

  if (!Array.isArray(items)) {
    addError(fieldErrors, 'analysisItems', 'Ожидается массив')
    return
  }

  items.forEach((item, index) => {
    const path = `analysisItems[${index}]`
    if (!isObject(item)) {
      addError(fieldErrors, path, 'Ожидается объект')
      return
    }

    if (typeof item.sku !== 'string' || item.sku.trim() === '') {
      addError(fieldErrors, `${path}.sku`, 'Ожидается непустая строка')
    }

    if (!['A', 'B', 'C'].includes(item.abc)) {
      addError(fieldErrors, `${path}.abc`, 'Ожидается одно из значений: A, B, C')
    }

    if (!['X', 'Y', 'Z'].includes(item.xyz)) {
      addError(fieldErrors, `${path}.xyz`, 'Ожидается одно из значений: X, Y, Z')
    }

    for (const axis of ['x', 'y']) {
      if (!Number.isFinite(item[axis])) {
        addError(fieldErrors, `${path}.${axis}`, 'Ожидается число')
      } else if (item[axis] < 0 || item[axis] > 100) {
        addError(fieldErrors, `${path}.${axis}`, 'Допустимый диапазон 0–100')
      }
    }

    if (!Number.isFinite(item.volume) || item.volume < 0) {
      addError(fieldErrors, `${path}.volume`, 'Ожидается число не меньше 0')
    }
  })
}

function validateFilters(filters, fieldErrors) {
  if (filters === undefined || filters === null) {
    addError(fieldErrors, 'filters', 'Обязательная секция отсутствует')
    return
  }

  if (!isObject(filters)) {
    addError(fieldErrors, 'filters', 'Ожидается объект')
    return
  }

  for (const key of ['warehouseIds', 'classificationKinds']) {
    if (!Array.isArray(filters[key])) {
      addError(fieldErrors, `filters.${key}`, 'Ожидается массив')
    }
  }
}

export function validateDemoDataset(payload) {
  const fieldErrors = {}
  const warnings = []

  if (!isObject(payload)) {
    return {
      isValid: false,
      fieldErrors: {
        payload: 'Ожидается объект верхнего уровня'
      },
      warnings
    }
  }

  validateVersion(payload.formatVersion, fieldErrors, warnings)

  const meta = validateRequiredObjectSection(payload, 'meta', fieldErrors)

  if (meta) {
    if (typeof meta.datasetId !== 'string' || meta.datasetId.trim() === '') {
      addError(fieldErrors, 'meta.datasetId', 'Ожидается непустая строка')
    }
    if (typeof meta.name !== 'string' || meta.name.trim() === '') {
      addError(fieldErrors, 'meta.name', 'Ожидается непустая строка')
    }
    if (typeof meta.createdAt !== 'string' || Number.isNaN(Date.parse(meta.createdAt))) {
      addError(fieldErrors, 'meta.createdAt', 'Ожидается дата в ISO-формате')
    }
  }

  validateTreeSection(payload.tree, fieldErrors)
  validateAnalysisItems(payload.analysisItems, fieldErrors)

  const serviceLevels = validateRequiredObjectSection(payload, 'serviceLevels', fieldErrors)
  if (serviceLevels) {
    const result = validateServiceLevels(serviceLevels)
    for (const [key, value] of Object.entries(result.fieldErrors)) {
      addError(fieldErrors, `serviceLevels.${key}`, value)
    }
  }

  validateFilters(payload.filters, fieldErrors)

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    warnings
  }
}
