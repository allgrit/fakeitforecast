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

export function AnalysisWorkspace({ loading, data, thresholds }) {
  const [activePoint, setActivePoint] = React.useState(null)

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
    const group = `${row.abc}${row.xyz}`
    const style = COMBINATION_STYLE[group] || COMBINATION_STYLE.CZ

    return {
      ...row,
      id: `${row.sku}-${index}`,
      group,
      style,
      x: clamp(row.x ?? row.xValue),
      y: clamp(row.y ?? row.yValue)
    }
  })

  return (
    <main className="analysis-workspace">
      <h2>Результаты ABC-XYZ</h2>
      {rows.length ? (
        <>
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
                  <div>Группа: {activePoint.group}</div>
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
        </>
      ) : (
        <p className="empty-state">Нет данных для отображения</p>
      )}
    </main>
  )
}
