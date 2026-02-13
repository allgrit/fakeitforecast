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

  it('disables run button until required fields are selected', () => {
    renderPage()

    const runButton = screen.getByRole('button', { name: 'Провести анализ по группе' })
    expect(runButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Склады'), { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Все товары' }))

    expect(runButton).toBeEnabled()
  })

  it('sends expected payload to POST /analysis/run', async () => {
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
        groupAnalysisMode: 'selected-subgroups'
      })
    })
  })
})
