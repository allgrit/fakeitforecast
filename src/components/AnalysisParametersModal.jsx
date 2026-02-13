import { useEffect, useRef } from 'react'
import { validateThresholds } from '../utils/analysisValidation'

const AXIS_PARAMETER_OPTIONS = [
  { id: 'turnover', label: 'Оборот' },
  { id: 'profit', label: 'Маржа' },
  { id: 'sales-frequency', label: 'Частота продаж' },
  { id: 'demand-variation', label: 'Вариативность спроса' }
]

const ANALYSIS_TYPE_OPTIONS = [
  { id: 'abc', label: 'ABC' },
  { id: 'xyz', label: 'XYZ' },
  { id: 'xyzWithoutZeros', label: 'XYZ без нулей' },
  { id: 'fmr', label: 'FMR' }
]

function getFocusableElements(rootElement) {
  if (!rootElement) {
    return []
  }

  return Array.from(
    rootElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter((element) => !element.hasAttribute('disabled') && !element.getAttribute('aria-hidden'))
}

export function AnalysisParametersModal({ isOpen, draftFilters, onDraftChange, onClose, onApply }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const dialog = dialogRef.current
    const focusables = getFocusableElements(dialog)
    focusables[0]?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const tabFocusables = getFocusableElements(dialog)
      if (tabFocusables.length === 0) {
        event.preventDefault()
        return
      }

      const currentIndex = tabFocusables.indexOf(document.activeElement)

      if (event.shiftKey) {
        if (currentIndex <= 0) {
          event.preventDefault()
          tabFocusables[tabFocusables.length - 1].focus()
        }
        return
      }

      if (currentIndex === tabFocusables.length - 1) {
        event.preventDefault()
        tabFocusables[0].focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const thresholdValidation = validateThresholds(draftFilters.thresholds)
  const selectedAnalysisTypeCount = Object.values(draftFilters.analysisTypes).filter(Boolean).length
  const hasAnalysisTypeError = selectedAnalysisTypeCount === 0
  const isApplyDisabled = !thresholdValidation.isValid || hasAnalysisTypeError

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Параметры анализа"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Параметры анализа</h2>
        </div>
        <div className="service-level-body">
          <label className="field-label">
            Параметр X
            <select value={draftFilters.axes.x} onChange={(event) => onDraftChange({ axes: { ...draftFilters.axes, x: event.target.value } })}>
              {AXIS_PARAMETER_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Параметр Y
            <select value={draftFilters.axes.y} onChange={(event) => onDraftChange({ axes: { ...draftFilters.axes, y: event.target.value } })}>
              {AXIS_PARAMETER_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Параметр Z
            <select value={draftFilters.axes.z} onChange={(event) => onDraftChange({ axes: { ...draftFilters.axes, z: event.target.value } })}>
              {AXIS_PARAMETER_OPTIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field-label">
            Граница A
            <input
              type="number"
              min="0"
              max="100"
              value={draftFilters.thresholds.a}
              onChange={(event) => onDraftChange({ thresholds: { ...draftFilters.thresholds, a: event.target.value } })}
            />
            {thresholdValidation.fieldErrors.a && <span className="field-error">{thresholdValidation.fieldErrors.a}</span>}
          </label>

          <label className="field-label">
            Граница B
            <input
              type="number"
              min="0"
              max="100"
              value={draftFilters.thresholds.b}
              onChange={(event) => onDraftChange({ thresholds: { ...draftFilters.thresholds, b: event.target.value } })}
            />
            {thresholdValidation.fieldErrors.b && <span className="field-error">{thresholdValidation.fieldErrors.b}</span>}
          </label>

          <label className="field-label">
            Граница C
            <input
              type="number"
              min="0"
              max="100"
              value={draftFilters.thresholds.c}
              onChange={(event) => onDraftChange({ thresholds: { ...draftFilters.thresholds, c: event.target.value } })}
            />
            {thresholdValidation.fieldErrors.c && <span className="field-error">{thresholdValidation.fieldErrors.c}</span>}
          </label>

          <fieldset className="field-label" aria-label="Тип анализа">
            <legend>Тип анализа</legend>
            {ANALYSIS_TYPE_OPTIONS.map((analysisType) => (
              <label key={analysisType.id} className="field-label inline-label">
                <input
                  type="checkbox"
                  checked={draftFilters.analysisTypes[analysisType.id]}
                  onChange={(event) =>
                    onDraftChange({
                      analysisTypes: {
                        ...draftFilters.analysisTypes,
                        [analysisType.id]: event.target.checked
                      }
                    })
                  }
                />
                {analysisType.label}
              </label>
            ))}
            {hasAnalysisTypeError ? <span className="field-error">Выберите минимум один тип анализа</span> : null}
          </fieldset>

          <div className="service-level-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Отмена
            </button>
            <button type="button" onClick={onApply} disabled={isApplyDisabled}>
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
