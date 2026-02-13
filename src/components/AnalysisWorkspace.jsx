export function AnalysisWorkspace({ loading, data }) {
  if (loading) {
    return <main className="skeleton workspace-skeleton" data-testid="workspace-skeleton" />
  }

  const rows = data?.results ?? []

  return (
    <main className="analysis-workspace">
      <h2>Результаты ABC-XYZ</h2>
      {rows.length ? (
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>ABC</th>
              <th>XYZ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.sku}>
                <td>{row.sku}</td>
                <td>{row.abc}</td>
                <td>{row.xyz}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="empty-state">Нет данных для отображения</p>
      )}
    </main>
  )
}
