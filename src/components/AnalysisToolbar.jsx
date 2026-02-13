const GROUP_ANALYSIS_MODES = [
  { id: 'by-subgroups', label: 'по подгруппам' },
  { id: 'selected-subgroups', label: 'по выбранным подгруппам' }
]

export function AnalysisToolbar({ analysisId, loading, data, filters, onChange, onRunAnalysis, runLoading }) {
  if (loading) {
    return <div className="skeleton toolbar-skeleton" data-testid="toolbar-skeleton" />
  }

  const isInvalid = !filters.warehouseId || !filters.periodFrom || !filters.periodTo || !filters.selectedNodeId

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

        <div className="run-actions">
          <button type="button" disabled={isInvalid || runLoading} onClick={() => onRunAnalysis(filters.groupMode)}>
            Провести анализ по группе
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
