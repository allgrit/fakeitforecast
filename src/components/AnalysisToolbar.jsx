import { validateThresholds } from '../utils/analysisValidation'

const GROUP_ANALYSIS_MODES = [
  { id: 'by-subgroups', label: 'по подгруппам' },
  { id: 'selected-subgroups', label: 'по выбранным подгруппам' }
]

const AXIS_PARAMETER_OPTIONS = [
  { id: 'turnover', label: 'Оборот' },
  { id: 'profit', label: 'Маржа' },
  { id: 'sales-frequency', label: 'Частота продаж' },
  { id: 'demand-variation', label: 'Вариативность спроса' }
]

export function AnalysisToolbar({
  analysisId,
  loading,
  data,
  filters,
  onChange,
  onRunAnalysis,
  onSaveAnalysis,
  onResetFilters,
  runLoading,
  saveLoading
}) {
  if (loading) {
    return <div className="skeleton toolbar-skeleton" data-testid="toolbar-skeleton" />
  }

  const thresholdValidation = validateThresholds(filters.thresholds)
  const isInvalid =
    !filters.warehouseId || !filters.periodFrom || !filters.periodTo || !filters.selectedNodeId || !thresholdValidation.isValid

  return (
    <header className="analysis-toolbar">
      <div>
        <h1>Анализ {analysisId}</h1>
        <p>{data?.name ?? 'Нет данных для этого анализа'}</p>
      </div>

      <div className="toolbar-controls">
        <label className="field-label">
          От
          <input
            type="date"
            value={filters.periodFrom}
            onChange={(event) => onChange({ periodFrom: event.target.value })}
          />
        </label>

        <label className="field-label">
          До
          <input
            type="date"
            value={filters.periodTo}
            onChange={(event) => onChange({ periodTo: event.target.value })}
          />
        </label>

        <label className="field-label">
          Шаг (дням)
          <input
            type="number"
            min="1"
            value={filters.stepDays}
            onChange={(event) => onChange({ stepDays: Number(event.target.value) || 1 })}
          />
        </label>

        <label className="field-label inline-label">
          <input
            type="checkbox"
            checked={filters.dataMode === 'fact'}
            onChange={(event) => onChange({ dataMode: event.target.checked ? 'fact' : 'forecast' })}
          />
          Факт/Прогноз
        </label>

        <label className="field-label">
          Вид
          <select value={filters.viewType} onChange={(event) => onChange({ viewType: event.target.value })}>
            <option value="table">Таблица</option>
            <option value="chart">График</option>
            <option value="map">Карта</option>
          </select>
        </label>

        <label className="field-label">
          Параметр X
          <select value={filters.axes.x} onChange={(event) => onChange({ axes: { ...filters.axes, x: event.target.value } })}>
            {AXIS_PARAMETER_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field-label">
          Параметр Y
          <select value={filters.axes.y} onChange={(event) => onChange({ axes: { ...filters.axes, y: event.target.value } })}>
            {AXIS_PARAMETER_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field-label">
          Параметр Z
          <select value={filters.axes.z} onChange={(event) => onChange({ axes: { ...filters.axes, z: event.target.value } })}>
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
            value={filters.thresholds.a}
            onChange={(event) => onChange({ thresholds: { ...filters.thresholds, a: event.target.value } })}
          />
          {thresholdValidation.fieldErrors.a && <span className="field-error">{thresholdValidation.fieldErrors.a}</span>}
        </label>

        <label className="field-label">
          Граница B
          <input
            type="number"
            min="0"
            max="100"
            value={filters.thresholds.b}
            onChange={(event) => onChange({ thresholds: { ...filters.thresholds, b: event.target.value } })}
          />
          {thresholdValidation.fieldErrors.b && <span className="field-error">{thresholdValidation.fieldErrors.b}</span>}
        </label>

        <label className="field-label">
          Граница C
          <input
            type="number"
            min="0"
            max="100"
            value={filters.thresholds.c}
            onChange={(event) => onChange({ thresholds: { ...filters.thresholds, c: event.target.value } })}
          />
          {thresholdValidation.fieldErrors.c && <span className="field-error">{thresholdValidation.fieldErrors.c}</span>}
        </label>

        <label className="field-label inline-label">
          <input
            type="checkbox"
            checked={filters.flags.excludeNewItems}
            onChange={(event) => onChange({ flags: { ...filters.flags, excludeNewItems: event.target.checked } })}
          />
          не анализировать новые товары
        </label>

        <label className="field-label inline-label">
          <input
            type="checkbox"
            checked={filters.flags.clearSalesHistoryFromPromotions}
            onChange={(event) => onChange({ flags: { ...filters.flags, clearSalesHistoryFromPromotions: event.target.checked } })}
          />
          очищать историю продаж от акций
        </label>

        <label className="field-label inline-label">
          <input
            type="checkbox"
            checked={filters.flags.aggregateByWarehouses}
            onChange={(event) => onChange({ flags: { ...filters.flags, aggregateByWarehouses: event.target.checked } })}
          />
          суммарно по складам
        </label>

        <label className="field-label inline-label">
          <input
            type="checkbox"
            checked={filters.flags.includeDeficit}
            onChange={(event) => onChange({ flags: { ...filters.flags, includeDeficit: event.target.checked } })}
          />
          учитывать дефицит
        </label>

        <div className="run-actions">
          <button type="button" disabled={isInvalid || runLoading} onClick={() => onRunAnalysis(filters.groupMode)}>
            Провести анализ по группе
          </button>
          <button type="button" disabled={saveLoading} onClick={onSaveAnalysis}>
            Сохранить
          </button>
          <button type="button" className="secondary-btn" onClick={onResetFilters}>
            Убрать все фильтры
          </button>
          <label className="field-label">
            <span className="visually-hidden">Режим анализа</span>
            <select
              aria-label="Режим анализа по группе"
              value={filters.groupMode}
              onChange={(event) => onChange({ groupMode: event.target.value })}
              disabled={isInvalid || runLoading}
            >
              {GROUP_ANALYSIS_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  )
}
