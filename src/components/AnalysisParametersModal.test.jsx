import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AnalysisParametersModal } from './AnalysisParametersModal'

const draftFilters = {
  axes: { x: 'turnover', y: 'profit', z: 'sales-frequency' },
  thresholds: { a: 80, b: 50, c: 20 },
  analysisTypes: { abc: true, xyz: false, xyzWithoutZeros: false, fmr: false }
}

function renderModal(overrides = {}) {
  const props = {
    isOpen: true,
    draftFilters,
    onDraftChange: vi.fn(),
    onClose: vi.fn(),
    onApply: vi.fn(),
    ...overrides
  }

  render(<AnalysisParametersModal {...props} />)
  return props
}

describe('AnalysisParametersModal', () => {
  it('does not render when closed', () => {
    renderModal({ isOpen: false })

    expect(screen.queryByRole('dialog', { name: 'Параметры анализа' })).not.toBeInTheDocument()
  })

  it('updates axes/thresholds/types and applies when valid', () => {
    const props = renderModal()

    fireEvent.change(screen.getByLabelText('Параметр X'), { target: { value: 'demand-variation' } })
    fireEvent.change(screen.getByLabelText('Граница A'), { target: { value: '90' } })
    fireEvent.click(screen.getByLabelText('XYZ'))
    fireEvent.click(screen.getByRole('button', { name: 'Применить' }))

    expect(props.onDraftChange).toHaveBeenCalledWith({ axes: { ...draftFilters.axes, x: 'demand-variation' } })
    expect(props.onDraftChange).toHaveBeenCalledWith({ thresholds: { ...draftFilters.thresholds, a: '90' } })
    expect(props.onDraftChange).toHaveBeenCalledWith({
      analysisTypes: { ...draftFilters.analysisTypes, xyz: true }
    })
    expect(props.onApply).toHaveBeenCalled()
  })

  it('shows validation errors and disables apply for invalid values', () => {
    renderModal({
      draftFilters: {
        ...draftFilters,
        thresholds: { a: 40, b: 50, c: 20 },
        analysisTypes: { abc: false, xyz: false, xyzWithoutZeros: false, fmr: false }
      }
    })

    expect(screen.getAllByText('Границы должны быть по убыванию: A ≥ B ≥ C')).toHaveLength(3)
    expect(screen.getByText('Выберите минимум один тип анализа')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Применить' })).toBeDisabled()
  })

  it('closes on overlay, escape and cancel button', () => {
    const props = renderModal()

    fireEvent.click(screen.getByText('Параметры анализа'))
    expect(props.onClose).not.toHaveBeenCalled()

    fireEvent.click(document.querySelector('.modal-overlay'))
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))

    expect(props.onClose).toHaveBeenCalledTimes(3)
  })
})
