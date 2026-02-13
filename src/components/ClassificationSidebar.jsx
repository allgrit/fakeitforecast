export function ClassificationSidebar({ loading, data }) {
  if (loading) {
    return <aside className="skeleton sidebar-skeleton" data-testid="sidebar-skeleton" />
  }

  const classes = data?.classes ?? []

  return (
    <aside className="classification-sidebar">
      <h2>Классы</h2>
      {classes.length ? (
        <ul>
          {classes.map((item) => (
            <li key={item.code}>
              <strong>{item.code}</strong> — {item.label}
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">Нет данных классификации</p>
      )}
    </aside>
  )
}
