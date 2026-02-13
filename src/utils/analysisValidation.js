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
