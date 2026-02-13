import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AnalysisWorkspace } from './AnalysisWorkspace'

const data = {
  results: [
    { sku: 'SKU-001', abc: 'A', xyz: 'X', x: 90, y: 82, warehouse: 'MSK', group: 'Молочная продукция', volume: 220 },
    { sku: 'SKU-002', abc: 'C', xyz: 'Z', x: 15, y: 22, warehouse: 'SPB', group: 'Бакалея', volume: 120 }
  ]
}

describe('AnalysisWorkspace views', () => {
  it('renders 9 combinations in legend and threshold lines on chart view', () => {
    const { container } = render(
      <AnalysisWorkspace
        loading={false}
        data={data}
        thresholds={{ a: 80, b: 50, c: 20 }}
        viewType="chart"
        onViewChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Легенда комбинаций ABC XYZ').querySelectorAll('.legend-item')).toHaveLength(9)
    expect(container.querySelectorAll('line')).toHaveLength(6)
  })

  it('shows tooltip for hovered point with sku, values and group', () => {
    render(
      <AnalysisWorkspace
        loading={false}
        data={data}
        thresholds={{ a: 80, b: 50, c: 20 }}
        viewType="chart"
        onViewChange={vi.fn()}
      />
    )

    fireEvent.mouseEnter(screen.getByTestId('scatter-point-SKU-001-0'))

    expect(screen.getByRole('status')).toHaveTextContent('SKU-001')
    expect(screen.getByRole('status')).toHaveTextContent('X: 90')
    expect(screen.getByRole('status')).toHaveTextContent('Y: 82')
    expect(screen.getByRole('status')).toHaveTextContent('Группа: AX')
  })

  it('supports map drill-down and tooltip with share/volume', () => {
    render(
      <AnalysisWorkspace
        loading={false}
        data={data}
        thresholds={{ a: 80, b: 50, c: 20 }}
        viewType="map"
        onViewChange={vi.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'MSK 220' }))
    expect(screen.getByText(/MSK/)).toBeInTheDocument()
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Молочная продукция 220' }))
    expect(screen.getByRole('status')).toHaveTextContent('Объем: 220')
    expect(screen.getByRole('status')).toHaveTextContent('Доля: 100.0%')
  })

  it('matches visual snapshot of scatter chart', () => {
    const { container } = render(
      <AnalysisWorkspace
        loading={false}
        data={data}
        thresholds={{ a: 75, b: 45, c: 15 }}
        viewType="chart"
        onViewChange={vi.fn()}
      />
    )

    expect(container.querySelector('.scatter-wrap')).toMatchSnapshot()
  })

  it('matches visual snapshot of map view', () => {
    const { container } = render(
      <AnalysisWorkspace
        loading={false}
        data={data}
        thresholds={{ a: 75, b: 45, c: 15 }}
        viewType="map"
        onViewChange={vi.fn()}
      />
    )

    expect(container.querySelector('.treemap')).toMatchSnapshot()
  })

  it('matches visual snapshot of modal layers (chart + map tooltips)', () => {
    const chart = render(
      <AnalysisWorkspace
        loading={false}
        data={data}
        thresholds={{ a: 75, b: 45, c: 15 }}
        viewType="chart"
        onViewChange={vi.fn()}
      />
    )
    fireEvent.mouseEnter(screen.getByTestId('scatter-point-SKU-001-0'))
    expect(chart.container.querySelector('.chart-tooltip')).toMatchSnapshot('chart-tooltip-layer')

    chart.unmount()

    const map = render(
      <AnalysisWorkspace
        loading={false}
        data={data}
        thresholds={{ a: 75, b: 45, c: 15 }}
        viewType="map"
        onViewChange={vi.fn()}
      />
    )
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'MSK 220' }))
    expect(map.container.querySelector('.map-tooltip')).toMatchSnapshot('map-tooltip-layer')
  })
})
