import React from 'react'

const ABC_ORDER = ['A', 'B', 'C']
const XYZ_ORDER = ['X', 'Y', 'Z']

const COMBINATION_STYLE = {
  AX: { color: '#155eef', marker: 'circle' },
  AY: { color: '#175cd3', marker: 'square' },
  AZ: { color: '#1849a9', marker: 'triangle' },
  BX: { color: '#12b76a', marker: 'circle' },
  BY: { color: '#039855', marker: 'square' },
  BZ: { color: '#027a48', marker: 'triangle' },
  CX: { color: '#f79009', marker: 'circle' },
  CY: { color: '#dc6803', marker: 'square' },
  CZ: { color: '#b54708', marker: 'triangle' }
}

const CHART_WIDTH = 560
const CHART_HEIGHT = 380
const PADDING = 40
const PLOT_WIDTH = CHART_WIDTH - PADDING * 2
const PLOT_HEIGHT = CHART_HEIGHT - PADDING * 2
const TABLE_PAGE_SIZE = 10

const clamp = (value) => Math.min(100, Math.max(0, Number(value) || 0))
const toChartX = (value) => PADDING + (clamp(value) / 100) * PLOT_WIDTH
const toChartY = (value) => CHART_HEIGHT - PADDING - (clamp(value) / 100) * PLOT_HEIGHT

function drawMarker(shape, x, y, color) {
  if (shape === 'square') {
    return <rect x={x - 6} y={y - 6} width={12} height={12} rx={2} fill={color} />
  }

  if (shape === 'triangle') {
    const points = `${x},${y - 7} ${x - 7},${y + 6} ${x + 7},${y + 6}`
    return <polygon points={points} fill={color} />
  }

  return <circle cx={x} cy={y} r={6} fill={color} />
}

function sortRows(rows, sortConfig) {
  const sorted = [...rows]
  sorted.sort((left, right) => {
    const leftValue = left[sortConfig.key]
    const rightValue = right[sortConfig.key]

    if (leftValue < rightValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }

    if (leftValue > rightValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }

    return 0
  })

  return sorted
}

function buildTreemapNodes(rows, level, parent) {
  if (level === 'warehouse') {
    const byWarehouse = rows.reduce((accumulator, row) => {
      const warehouse = row.warehouse ?? 'Не указан'
      accumulator[warehouse] = (accumulator[warehouse] ?? 0) + (Number(row.volume) || 0)
      return accumulator
    }, {})

    return Object.entries(byWarehouse).map(([name, value]) => ({ id: `warehouse-${name}`, name, value, level, parent }))
  }

  const byGroup = rows.reduce((accumulator, row) => {
    const group = row.group ?? 'Прочее'
    accumulator[group] = (accumulator[group] ?? 0) + (Number(row.volume) || 0)
    return accumulator
  }, {})

  return Object.entries(byGroup).map(([name, value]) => ({ id: `group-${name}`, name, value, level, parent }))
}

export function AnalysisWorkspace({ loading, data, thresholds, viewType, onViewChange }) {
  const [activePoint, setActivePoint] = React.useState(null)
  const [sortConfig, setSortConfig] = React.useState({ key: 'sku', direction: 'asc' })
  const [currentPage, setCurrentPage] = React.useState(1)
  const [drillPath, setDrillPath] = React.useState([])
  const [activeTreemapNode, setActiveTreemapNode] = React.useState(null)

  React.useEffect(() => {
    setCurrentPage(1)
  }, [sortConfig, data])

  React.useEffect(() => {
    setActiveTreemapNode(null)
    setDrillPath([])
  }, [data])

  if (loading) {
    return <main className="skeleton workspace-skeleton" data-testid="workspace-skeleton" />
  }

  const rows = data?.results ?? []
  const thresholdValues = {
    a: clamp(thresholds?.a ?? 80),
    b: clamp(thresholds?.b ?? 50),
    c: clamp(thresholds?.c ?? 20)
  }

  const points = rows.map((row, index) => {
    const combination = `${row.abc}${row.xyz}`
    const style = COMBINATION_STYLE[combination] || COMBINATION_STYLE.CZ

    return {
      ...row,
      id: `${row.sku}-${index}`,
      combination,
      style,
      x: clamp(row.x ?? row.xValue),
      y: clamp(row.y ?? row.yValue)
    }
  })

  const sortedRows = sortRows(points, sortConfig)
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / TABLE_PAGE_SIZE))
  const pageStart = (currentPage - 1) * TABLE_PAGE_SIZE
  const pagedRows = sortedRows.slice(pageStart, pageStart + TABLE_PAGE_SIZE)

  const drillWarehouse = drillPath[0]
  const mapRows = drillWarehouse ? points.filter((row) => row.warehouse === drillWarehouse) : points
  const mapLevel = drillWarehouse ? 'group' : 'warehouse'
  const mapNodes = buildTreemapNodes(mapRows, mapLevel, drillWarehouse)
  const totalMapValue = mapNodes.reduce((sum, node) => sum + node.value, 0)

  const onSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const onTreemapClick = (node) => {
    if (node.level === 'warehouse') {
      setDrillPath([node.name])
      return
    }

    setActiveTreemapNode(node)
  }

  return (
    <main className="analysis-workspace">
      <div className="workspace-headline">
        <h2>Результаты ABC-XYZ</h2>
        <div className="workspace-view-switcher" role="tablist" aria-label="Переключение представления результатов">
          {[
            { id: 'table', label: 'Таблица' },
            { id: 'chart', label: 'График' },
            { id: 'map', label: 'Карта' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={viewType === item.id}
              className={viewType === item.id ? 'view-tab active' : 'view-tab'}
              onClick={() => onViewChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length ? (
        <>
          {viewType === 'chart' ? (
            <div className="scatter-layout">
              <div className="scatter-wrap">
                <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} role="img" aria-label="ABC XYZ scatter chart">
                  <rect x={PADDING} y={PADDING} width={PLOT_WIDTH} height={PLOT_HEIGHT} fill="#f8faff" stroke="#d4def0" />

                  {Object.entries(thresholdValues).map(([key, value]) => {
                    const x = toChartX(value)
                    const y = toChartY(value)
                    const label = key.toUpperCase()

                    return (
                      <g key={key}>
                        <line x1={x} y1={PADDING} x2={x} y2={CHART_HEIGHT - PADDING} stroke="#98a2b3" strokeDasharray="5 5" />
                        <line x1={PADDING} y1={y} x2={CHART_WIDTH - PADDING} y2={y} stroke="#98a2b3" strokeDasharray="5 5" />
                        <text x={x + 4} y={CHART_HEIGHT - PADDING + 16} fontSize="12" fill="#667085">X-{label}</text>
                        <text x={8} y={y - 4} fontSize="12" fill="#667085">Y-{label}</text>
                      </g>
                    )
                  })}

                  {points.map((point) => {
                    const cx = toChartX(point.x)
                    const cy = toChartY(point.y)

                    return (
                      <g
                        key={point.id}
                        className="scatter-point"
                        data-testid={`scatter-point-${point.id}`}
                        onMouseEnter={() => setActivePoint(point)}
                        onMouseLeave={() => setActivePoint((prev) => (prev?.id === point.id ? null : prev))}
                        onFocus={() => setActivePoint(point)}
                        onBlur={() => setActivePoint((prev) => (prev?.id === point.id ? null : prev))}
                        tabIndex={0}
                      >
                        {drawMarker(point.style.marker, cx, cy, point.style.color)}
                      </g>
                    )
                  })}
                </svg>

                {activePoint ? (
                  <div className="chart-tooltip" role="status">
                    <strong>{activePoint.sku}</strong>
                    <div>X: {activePoint.x}</div>
                    <div>Y: {activePoint.y}</div>
                    <div>Группа: {activePoint.combination}</div>
                  </div>
                ) : null}
              </div>

              <div className="combination-legend" aria-label="Легенда комбинаций ABC XYZ">
                {ABC_ORDER.flatMap((abc) => XYZ_ORDER.map((xyz) => `${abc}${xyz}`)).map((combo) => {
                  const style = COMBINATION_STYLE[combo]

                  return (
                    <div key={combo} className="legend-item">
                      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                        {drawMarker(style.marker, 9, 9, style.color)}
                      </svg>
                      <span>{combo}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          {viewType === 'table' ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th>
                      <button type="button" className="sort-btn" onClick={() => onSort('sku')}>SKU</button>
                    </th>
                    <th>
                      <button type="button" className="sort-btn" onClick={() => onSort('abc')}>ABC</button>
                    </th>
                    <th>
                      <button type="button" className="sort-btn" onClick={() => onSort('xyz')}>XYZ</button>
                    </th>
                    <th>
                      <button type="button" className="sort-btn" onClick={() => onSort('x')}>X</button>
                    </th>
                    <th>
                      <button type="button" className="sort-btn" onClick={() => onSort('y')}>Y</button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.sku}</td>
                      <td>{row.abc}</td>
                      <td>{row.xyz}</td>
                      <td>{row.x}</td>
                      <td>{row.y}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="table-pager">
                <button type="button" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                  Назад
                </button>
                <span>
                  Страница {currentPage} из {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Вперёд
                </button>
              </div>
            </>
          ) : null}

          {viewType === 'map' ? (
            <>
              <div className="map-breadcrumbs">
                <button type="button" onClick={() => setDrillPath([])} disabled={!drillPath.length}>Все склады</button>
                {drillPath.length ? <span> / {drillPath[0]}</span> : null}
              </div>
              <div className="treemap" aria-label="Treemap по складам и группам">
                {mapNodes.map((node) => {
                  const share = totalMapValue ? (node.value / totalMapValue) * 100 : 0

                  return (
                    <button
                      key={node.id}
                      type="button"
                      className="treemap-node"
                      style={{ width: `${Math.max(12, share)}%` }}
                      onClick={() => onTreemapClick(node)}
                      onMouseEnter={() => setActiveTreemapNode(node)}
                      onFocus={() => setActiveTreemapNode(node)}
                    >
                      <span>{node.name}</span>
                      <strong>{node.value}</strong>
                    </button>
                  )
                })}
              </div>
              {activeTreemapNode ? (
                <div className="map-tooltip" role="status">
                  <div>{activeTreemapNode.name}</div>
                  <div>Объем: {activeTreemapNode.value}</div>
                  <div>
                    Доля:{' '}
                    {totalMapValue ? ((activeTreemapNode.value / totalMapValue) * 100).toFixed(1) : '0.0'}%
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </>
      ) : (
        <p className="empty-state">Нет данных для отображения</p>
      )}
    </main>
  )
}
