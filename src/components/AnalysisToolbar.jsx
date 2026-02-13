export function AnalysisToolbar({ analysisId, loading, data }) {
  if (loading) {
    return <div className="skeleton toolbar-skeleton" data-testid="toolbar-skeleton" />
  }

  return (
    <header className="analysis-toolbar">
      <div>
        <h1>Анализ {analysisId}</h1>
        <p>{data?.name ?? 'Нет данных для этого анализа'}</p>
      </div>
      <button type="button">Запустить анализ</button>
    </header>
  )
}
