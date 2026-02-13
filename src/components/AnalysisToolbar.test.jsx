import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AnalysisToolbar } from './AnalysisToolbar'

const baseFilters = {
  warehouseId: 'wh-1',
  periodFrom: '2024-01-01',
  periodTo: '2024-01-31',
  selectedNodeId: 'node-1',
  stepDays: 7,
  dataMode: 'forecast',
  viewType: 'table',
  groupMode: 'by-subgroups',
  thresholds: { a: 80, b: 50, c: 20 },
  analysisTypes: { abc: true, xyz: false, xyzWithoutZeros: false, fmr: false },
  flags: {
    excludeNewItems: false,
    clearSalesHistoryFromPromotions: false,
    aggregateByWarehouses: false,
    includeDeficit: false
  }
}

function renderToolbar(overrides = {}) {
  const props = {
    analysisId: 'AN-1',
    loading: false,
    data: { name: 'Демо анализ' },
    filters: baseFilters,
    onChange: vi.fn(),
    onRunAnalysis: vi.fn(),
    onSaveAnalysis: vi.fn(),
    onResetFilters: vi.fn(),
    onOpenServiceLevelModal: vi.fn(),
    onOpenAnalysisParametersModal: vi.fn(),
    runLoading: false,
    saveLoading: false,
    controlsLocked: false,
    ...overrides
  }

  render(<AnalysisToolbar {...props} />)
  return props
}

describe('AnalysisToolbar', () => {
  it('renders skeleton while loading', () => {
    renderToolbar({ loading: true })

    expect(screen.getByTestId('toolbar-skeleton')).toBeInTheDocument()
  })

  it('changes filter values and triggers actions', () => {
    const props = renderToolbar()

    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2024-02-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2024-02-29' } })
    fireEvent.change(screen.getByLabelText('Шаг (дням)'), { target: { value: '14' } })
    fireEvent.change(screen.getByLabelText('Вид'), { target: { value: 'chart' } })
    fireEvent.click(screen.getByLabelText('Факт/Прогноз'))
    fireEvent.click(screen.getByLabelText('не анализировать новые товары'))
    fireEvent.click(screen.getByLabelText('очищать историю продаж от акций'))
    fireEvent.click(screen.getByLabelText('суммарно по складам'))
    fireEvent.click(screen.getByLabelText('учитывать дефицит'))
    fireEvent.change(screen.getByRole('combobox', { name: 'Режим анализа по группе' }), { target: { value: 'selected-subgroups' } })

    fireEvent.click(screen.getByRole('button', { name: 'Провести анализ по группе' }))
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))
    fireEvent.click(screen.getByRole('button', { name: 'Убрать все фильтры' }))
    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    fireEvent.click(screen.getByRole('button', { name: 'Параметры анализа' }))

    expect(props.onChange).toHaveBeenCalledWith({ periodFrom: '2024-02-01' })
    expect(props.onChange).toHaveBeenCalledWith({ periodTo: '2024-02-29' })
    expect(props.onChange).toHaveBeenCalledWith({ stepDays: 14 })
    expect(props.onChange).toHaveBeenCalledWith({ viewType: 'chart' })
    expect(props.onRunAnalysis).toHaveBeenCalledWith('by-subgroups')
    expect(props.onSaveAnalysis).toHaveBeenCalled()
    expect(props.onResetFilters).toHaveBeenCalled()
    expect(props.onOpenServiceLevelModal).toHaveBeenCalled()
    expect(props.onOpenAnalysisParametersModal).toHaveBeenCalled()
  })

  it('blocks group run when required fields or thresholds are invalid', () => {
    renderToolbar({
      filters: {
        ...baseFilters,
        warehouseId: '',
        thresholds: { a: 10, b: 50, c: 20 },
        analysisTypes: { abc: false, xyz: false, xyzWithoutZeros: false, fmr: false }
      }
    })

    expect(screen.getByRole('button', { name: 'Провести анализ по группе' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Режим анализа по группе' })).toBeDisabled()
  })

  it('disables controls when locked and save button when saving', () => {
    renderToolbar({ controlsLocked: true, saveLoading: true })

    expect(screen.getByLabelText('От')).toBeDisabled()
    expect(screen.getByLabelText('До')).toBeDisabled()
    expect(screen.getByLabelText('Шаг (дням)')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Параметры анализа' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Провести анализ по группе' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeDisabled()
  })
})
