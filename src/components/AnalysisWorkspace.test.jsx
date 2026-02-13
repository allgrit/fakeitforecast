import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AnalysisWorkspace } from './AnalysisWorkspace'

const data = {
  results: [
    { sku: 'SKU-001', abc: 'A', xyz: 'X', x: 90, y: 82 },
    { sku: 'SKU-002', abc: 'C', xyz: 'Z', x: 15, y: 22 }
  ]
}

describe('AnalysisWorkspace scatter', () => {
  it('renders 9 combinations in legend and threshold lines on both axes', () => {
    const { container } = render(<AnalysisWorkspace loading={false} data={data} thresholds={{ a: 80, b: 50, c: 20 }} />)

    expect(screen.getByLabelText('Легенда комбинаций ABC XYZ').querySelectorAll('.legend-item')).toHaveLength(9)
    expect(container.querySelectorAll('line')).toHaveLength(6)
  })

  it('shows tooltip for hovered point with sku, values and group', () => {
    render(<AnalysisWorkspace loading={false} data={data} thresholds={{ a: 80, b: 50, c: 20 }} />)

    fireEvent.mouseEnter(screen.getByTestId('scatter-point-SKU-001-0'))

    expect(screen.getByRole('status')).toHaveTextContent('SKU-001')
    expect(screen.getByRole('status')).toHaveTextContent('X: 90')
    expect(screen.getByRole('status')).toHaveTextContent('Y: 82')
    expect(screen.getByRole('status')).toHaveTextContent('Группа: AX')
  })

  it('matches visual snapshot of scatter chart', () => {
    const { container } = render(<AnalysisWorkspace loading={false} data={data} thresholds={{ a: 75, b: 45, c: 15 }} />)

    expect(container.querySelector('.scatter-wrap')).toMatchSnapshot()
  })
})
