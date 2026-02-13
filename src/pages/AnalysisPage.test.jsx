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
    expect(screen.getAllByLabelText('Склады')[0]).toBeInTheDocument()
    expect(screen.getByText('Все товары')).toBeInTheDocument()
    expect(screen.getByText('Результаты ABC-XYZ')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Уровень сервиса 1 года' })).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Уровень сервиса/)).toHaveLength(9)
  })

  it('disables run button when thresholds are invalid', () => {
    renderPage()

    const runButton = screen.getByRole('button', { name: 'Провести анализ по группе' })
    fireEvent.change(screen.getAllByLabelText('Склады')[0], { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Все товары' }))

    expect(runButton).toBeEnabled()

    fireEvent.change(screen.getByLabelText(/Граница A/), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText(/Граница B/), { target: { value: '20' } })

    expect(screen.getAllByText('Границы должны быть по убыванию: A ≥ B ≥ C')).toHaveLength(3)
    expect(runButton).toBeDisabled()
  })

  it('syncs Вид select with workspace tabs', () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    renderPage()

    const viewSelect = screen.getByLabelText('Вид')
    expect(viewSelect).toHaveValue('table')

    fireEvent.click(screen.getByRole('tab', { name: 'График' }))
    expect(viewSelect).toHaveValue('chart')

    fireEvent.click(screen.getByRole('tab', { name: 'Карта' }))
    expect(viewSelect).toHaveValue('map')

    fireEvent.change(viewSelect, { target: { value: 'table' } })
    expect(screen.getByRole('tab', { name: 'Таблица' })).toHaveAttribute('aria-selected', 'true')

    expect(fetchMock).toHaveBeenCalledWith(
      '/telemetry',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('sends changed parameters to POST /analysis/run', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.change(screen.getAllByLabelText('Склады')[0], { target: { value: 'msk' } })
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

    await waitFor(() =>
      expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/run')).toHaveLength(1)
    )
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
        analysisTypes: ['abc', 'xyz'],
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

    expect(fetchMock.mock.calls.some(([url]) => url === '/telemetry')).toBe(true)
  })

  it('runs analysis with only ABC type selected', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.change(screen.getAllByLabelText('Склады')[0], { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Все товары' }))

    fireEvent.click(screen.getByRole('checkbox', { name: 'XYZ' }))

    fireEvent.click(screen.getByRole('button', { name: 'Провести анализ по группе' }))

    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/run')).toHaveLength(1))
    const runPayload = JSON.parse(fetchMock.mock.calls.find(([url]) => url === '/analysis/run')[1].body)
    expect(runPayload.analysisTypes).toEqual(['abc'])
  })

  it('serializes XYZ без нулей и FMR in run payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.change(screen.getAllByLabelText('Склады')[0], { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Все товары' }))

    fireEvent.click(screen.getByRole('checkbox', { name: 'ABC' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'XYZ' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'XYZ без нулей' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'FMR' }))

    fireEvent.click(screen.getByRole('button', { name: 'Провести анализ по группе' }))

    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/run')).toHaveLength(1))
    const runPayload = JSON.parse(fetchMock.mock.calls.find(([url]) => url === '/analysis/run')[1].body)
    expect(runPayload.analysisTypes).toEqual(['xyzWithoutZeros', 'fmr'])
  })

  it('disables run button and shows validation if all analysis types are disabled', () => {
    renderPage()

    const runButton = screen.getByRole('button', { name: 'Провести анализ по группе' })

    fireEvent.click(screen.getByRole('checkbox', { name: 'ABC' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'XYZ' }))

    expect(runButton).toBeDisabled()
    expect(screen.getByText('Выберите минимум один тип анализа')).toBeInTheDocument()
  })

  it('shows api error messages with readable text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: vi.fn().mockResolvedValue({ message: 'Некорректный набор фильтров' })
    })
    vi.stubGlobal('fetch', fetchMock)

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Применить для всех' }))

    await waitFor(() => {
      expect(
        screen.getByText('Запрос отклонен бизнес-правилами. Измените параметры и повторите. (Некорректный набор фильтров)')
      ).toBeInTheDocument()
    })
  })

  it('validates service level inputs and disables apply buttons when invalid', () => {
    renderPage()

    const applyAllButton = screen.getByRole('button', { name: 'Применить для всех' })
    const applyScopeButton = screen.getByRole('button', { name: 'Применить по выбранному scope' })

    expect(applyAllButton).toBeEnabled()
    expect(applyScopeButton).toBeDisabled()

    fireEvent.change(screen.getByLabelText('Уровень сервиса AA'), { target: { value: '120' } })

    expect(screen.getByText('Допустимый диапазон 0–100')).toBeInTheDocument()
    expect(applyAllButton).toBeDisabled()
    expect(applyScopeButton).toBeDisabled()
  })

  it('sends POST /analysis/service-level/apply for apply-all and scoped apply', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Применить для всех' }))

    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/service-level/apply')).toHaveLength(1))
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/analysis/service-level/apply',
      expect.objectContaining({ method: 'POST' })
    )

    fireEvent.click(screen.getByRole('radio', { name: 'Склады' }))
    const scopeSelect = screen.getByLabelText('Выбранный scope')
    Array.from(scopeSelect.options).forEach((option) => {
      option.selected = option.value === 'msk' || option.value === 'spb'
    })
    fireEvent.change(scopeSelect)
    fireEvent.change(screen.getByLabelText('Уровень сервиса AA'), { target: { value: '88' } })
    fireEvent.click(screen.getByRole('button', { name: 'Применить по выбранному scope' }))

    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/service-level/apply')).toHaveLength(2))

    const scopedCall = fetchMock.mock.calls.findLast(([url]) => url === '/analysis/service-level/apply')
    const scopedPayload = JSON.parse(scopedCall[1].body)
    expect(scopedPayload).toMatchObject({
      analysisId: 'abc-xyz',
      applyToAll: false,
      scope: { type: 'warehouses', ids: ['msk', 'spb'] }
    })
    expect(scopedPayload.cells).toHaveLength(9)
    expect(scopedPayload.cells.find((cell) => cell.combo === 'AA')).toEqual({ combo: 'AA', serviceLevel: 88 })
  })

  it('saves current analysis slice and resets all filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.change(screen.getAllByLabelText('Склады')[0], { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'не анализировать новые товары' }))
    fireEvent.change(screen.getByLabelText('Уровень сервиса AA'), { target: { value: '88' } })

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/save')).toHaveLength(1))
    const savePayload = JSON.parse(fetchMock.mock.calls.find(([url]) => url === '/analysis/save')[1].body)
    expect(savePayload.filters.warehouseId).toBe('msk')
    expect(savePayload.serviceLevels.AA).toBe('88')

    fireEvent.click(screen.getByRole('button', { name: 'Убрать все фильтры' }))

    expect(screen.getAllByLabelText('Склады')[0]).toHaveValue('')
    expect(screen.getByLabelText('От')).toHaveValue('')
    expect(screen.getByLabelText('До')).toHaveValue('')
    expect(screen.getByRole('checkbox', { name: 'не анализировать новые товары' })).not.toBeChecked()
    expect(screen.getByLabelText('Уровень сервиса AA')).toHaveValue(95)
    expect(screen.getByLabelText('Поиск')).toHaveValue('')
  })
})
