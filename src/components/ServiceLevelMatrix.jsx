import { SERVICE_LEVEL_COMBINATIONS, validateServiceLevels } from '../utils/analysisValidation'

const SCOPE_TYPES = {
  groups: 'groups',
  warehouses: 'warehouses'
}

export function ServiceLevelMatrix({
  serviceLevels,
  onServiceLevelsChange,
  scopeType,
  onScopeTypeChange,
  scopeOptions,
  selectedScopeIds,
  onSelectedScopeIdsChange,
  applyLoading,
  onApply
}) {
  const validation = validateServiceLevels(serviceLevels)
  const selectedScopeCount = selectedScopeIds.length

  const onCellChange = (combo, value) => {
    onServiceLevelsChange({ ...serviceLevels, [combo]: value })
  }

  const onScopeSelectionChange = (event) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value)
    onSelectedScopeIdsChange(values)
  }

  return (
    <section className="service-level-panel" aria-label="Установка уровня сервиса">
      <h3>Уровень сервиса 1 года</h3>

      <table className="service-level-table">
        <thead>
          <tr>
            <th>Комбинация</th>
            <th>Уровень сервиса 1 года (%)</th>
          </tr>
        </thead>
        <tbody>
          {SERVICE_LEVEL_COMBINATIONS.map((combo) => (
            <tr key={combo}>
              <td>{combo}</td>
              <td>
                <input
                  aria-label={`Уровень сервиса ${combo}`}
                  type="number"
                  min="0"
                  max="100"
                  value={serviceLevels[combo] ?? ''}
                  onChange={(event) => onCellChange(combo, event.target.value)}
                />
                {validation.fieldErrors[combo] ? <span className="field-error">{validation.fieldErrors[combo]}</span> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="service-level-actions">
        <fieldset>
          <legend>Scope применения</legend>
          <label className="inline-label">
            <input
              type="radio"
              name="apply-scope"
              value={SCOPE_TYPES.groups}
              checked={scopeType === SCOPE_TYPES.groups}
              onChange={(event) => onScopeTypeChange(event.target.value)}
            />
            Группы
          </label>
          <label className="inline-label">
            <input
              type="radio"
              name="apply-scope"
              value={SCOPE_TYPES.warehouses}
              checked={scopeType === SCOPE_TYPES.warehouses}
              onChange={(event) => onScopeTypeChange(event.target.value)}
            />
            Склады
          </label>
        </fieldset>

        <label className="field-label">
          Выбранный scope
          <select aria-label="Выбранный scope" multiple value={selectedScopeIds} onChange={onScopeSelectionChange}>
            {scopeOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <div className="run-actions">
          <button type="button" disabled={!validation.isValid || applyLoading} onClick={() => onApply(true)}>
            Применить для всех
          </button>
          <button
            type="button"
            disabled={!validation.isValid || !selectedScopeCount || applyLoading}
            onClick={() => onApply(false)}
          >
            Применить по выбранному scope
          </button>
        </div>
      </div>
    </section>
  )
}
