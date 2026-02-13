import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AnalysisPage } from './AnalysisPage'

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/analysis/abc-xyz']}>
      <Routes>
        <Route path="/analysis/:analysisId" element={<AnalysisPage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AnalysisPage smoke', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_USE_MOCK_ANALYSIS', 'true')
    vi.stubEnv('VITE_SHOW_ANALYSIS_LOADING', 'false')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('renders analysis page shell', () => {
    renderPage()

    expect(screen.getByTestId('analysis-page')).toBeInTheDocument()
    expect(screen.getByText('Анализ abc-xyz')).toBeInTheDocument()
    expect(screen.getByLabelText('Вид классификации')).toBeInTheDocument()
    expect(screen.getByLabelText('Склады')).toBeInTheDocument()
    expect(screen.getByText('Все товары')).toBeInTheDocument()
    expect(screen.getByText('Результаты ABC-XYZ')).toBeInTheDocument()
  })

  it('disables run button when thresholds are invalid', () => {
    renderPage()

    const runButton = screen.getByRole('button', { name: 'Провести анализ по группе' })
    fireEvent.change(screen.getByLabelText('Склады'), { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Все товары' }))

    expect(runButton).toBeEnabled()

    fireEvent.change(screen.getByLabelText(/Граница A/), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText(/Граница B/), { target: { value: '20' } })

    expect(screen.getAllByText('Границы должны быть по убыванию: A ≥ B ≥ C')).toHaveLength(3)
    expect(runButton).toBeDisabled()
  })

  it('sends changed parameters to POST /analysis/run', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.change(screen.getByLabelText('Склады'), { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('Вид классификации'), { target: { value: 'abcxyz' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.change(screen.getByLabelText('Шаг (дням)'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Вид'), { target: { value: 'map' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Факт/Прогноз' }))
    fireEvent.click(screen.getByRole('button', { name: 'Молочная продукция' }))
    fireEvent.change(screen.getByLabelText('Режим анализа по группе'), { target: { value: 'selected-subgroups' } })

    fireEvent.change(screen.getByLabelText('Параметр X'), { target: { value: 'profit' } })
    fireEvent.change(screen.getByLabelText('Параметр Y'), { target: { value: 'turnover' } })
    fireEvent.change(screen.getByLabelText('Параметр Z'), { target: { value: 'sales-frequency' } })

    fireEvent.change(screen.getByLabelText(/Граница A/), { target: { value: '75' } })
    fireEvent.change(screen.getByLabelText(/Граница B/), { target: { value: '45' } })
    fireEvent.change(screen.getByLabelText(/Граница C/), { target: { value: '15' } })

    fireEvent.click(screen.getByRole('checkbox', { name: 'не анализировать новые товары' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'очищать историю продаж от акций' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'суммарно по складам' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'учитывать дефицит' }))

    fireEvent.click(screen.getByRole('button', { name: 'Провести анализ по группе' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock).toHaveBeenCalledWith('/analysis/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analysisId: 'abc-xyz',
        warehouseId: 'msk',
        nodeId: 'grp-dairy',
        classificationKind: 'abcxyz',
        period: {
          from: '2025-01-01',
          to: '2025-01-15',
          stepDays: 2
        },
        dataMode: 'fact',
        view: 'map',
        groupAnalysisMode: 'selected-subgroups',
        axes: {
          x: 'profit',
          y: 'turnover',
          z: 'sales-frequency'
        },
        thresholds: {
          a: 75,
          b: 45,
          c: 15
        },
        flags: {
          includeNewItems: false,
          includePromotions: false,
          aggregateByWarehouses: true,
          includeDeficit: true
        }
      })
    })
  })
})
