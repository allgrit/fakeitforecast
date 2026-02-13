import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AnalysisPage } from './AnalysisPage'
import { analysisDatasetMap, analysisDatasetRegistry } from '../data/datasets'
import { mockAnalysisData } from '../data/mockAnalysisData'

function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

function renderPage(analysisId = 'abc-xyz') {
  render(
    <MemoryRouter initialEntries={[`/analysis/${analysisId}`]}>
      <Routes>
        <Route path="/analysis/:analysisId" element={<AnalysisPage />} />
      </Routes>
    </MemoryRouter>
  )
}

const smokeDatasetIds = analysisDatasetRegistry
  .filter((dataset) => dataset.id !== 'large-tree')
  .slice(0, 3)
  .map((dataset) => dataset.id)

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
    expect(screen.queryByRole('heading', { name: 'Уровень сервиса 1 года' })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Уровень сервиса AA')).not.toBeInTheDocument()
  })

  it.each(smokeDatasetIds)('renders shell with dataset from registry: %s', (analysisId) => {
    renderPage(analysisId)

    expect(screen.getByTestId('analysis-page')).toBeInTheDocument()
    expect(screen.getByText(`Анализ ${analysisId}`)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Результаты ABC-XYZ' })).toBeInTheDocument()
  })

  it('opens and closes analysis parameters modal', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Параметры анализа' }))
    expect(screen.getByRole('dialog', { name: 'Параметры анализа' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))
    expect(screen.queryByRole('dialog', { name: 'Параметры анализа' })).not.toBeInTheDocument()
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


  it('does not change /analysis/run payload after cancelling analysis parameters modal', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.change(screen.getAllByLabelText('Склады')[0], { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Все товары' }))

    fireEvent.click(screen.getByRole('button', { name: 'Параметры анализа' }))
    fireEvent.change(screen.getByLabelText('Параметр X'), { target: { value: 'profit' } })
    fireEvent.change(screen.getByLabelText('Параметр Y'), { target: { value: 'turnover' } })
    fireEvent.change(screen.getByLabelText('Параметр Z'), { target: { value: 'sales-frequency' } })
    fireEvent.change(screen.getByLabelText(/Граница A/), { target: { value: '70' } })
    fireEvent.change(screen.getByLabelText(/Граница B/), { target: { value: '40' } })
    fireEvent.change(screen.getByLabelText(/Граница C/), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))

    fireEvent.click(screen.getByRole('button', { name: 'Провести анализ по группе' }))

    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/run')).toHaveLength(1))
    const runPayload = JSON.parse(fetchMock.mock.calls.find(([url]) => url === '/analysis/run')[1].body)
    expect(runPayload.axes).toEqual({ x: 'turnover', y: 'sales-frequency', z: 'demand-variation' })
    expect(runPayload.thresholds).toEqual({ a: 80, b: 50, c: 20 })
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

    fireEvent.click(screen.getByRole('button', { name: 'Параметры анализа' }))
    fireEvent.change(screen.getByLabelText('Параметр X'), { target: { value: 'profit' } })
    fireEvent.change(screen.getByLabelText('Параметр Y'), { target: { value: 'turnover' } })
    fireEvent.change(screen.getByLabelText('Параметр Z'), { target: { value: 'sales-frequency' } })

    fireEvent.change(screen.getByLabelText(/Граница A/), { target: { value: '75' } })
    fireEvent.change(screen.getByLabelText(/Граница B/), { target: { value: '45' } })
    fireEvent.change(screen.getByLabelText(/Граница C/), { target: { value: '15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Применить' }))

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

    fireEvent.click(screen.getByRole('button', { name: 'Параметры анализа' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'XYZ' }))
    fireEvent.click(screen.getByRole('button', { name: 'Применить' }))

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

    fireEvent.click(screen.getByRole('button', { name: 'Параметры анализа' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'ABC' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'XYZ' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'XYZ без нулей' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'FMR' }))
    fireEvent.click(screen.getByRole('button', { name: 'Применить' }))

    fireEvent.click(screen.getByRole('button', { name: 'Провести анализ по группе' }))

    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/run')).toHaveLength(1))
    const runPayload = JSON.parse(fetchMock.mock.calls.find(([url]) => url === '/analysis/run')[1].body)
    expect(runPayload.analysisTypes).toEqual(['xyzWithoutZeros', 'fmr'])
  })

  it('blocks apply button when analysis parameters are invalid', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Параметры анализа' }))
    fireEvent.change(screen.getByLabelText(/Граница A/), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText(/Граница B/), { target: { value: '20' } })

    expect(screen.getAllByText('Границы должны быть по убыванию: A ≥ B ≥ C')).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Применить' })).toBeDisabled()
  })

  it('shows api error messages with readable text', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: vi.fn().mockResolvedValue({ message: 'Некорректный набор фильтров' })
    })
    vi.stubGlobal('fetch', fetchMock)

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    fireEvent.click(screen.getByRole('button', { name: 'Применить для всех' }))

    await waitFor(() => {
      expect(
        screen.getByText('Запрос отклонен бизнес-правилами. Измените параметры и повторите. (Некорректный набор фильтров)')
      ).toBeInTheDocument()
    })
  })

  it('validates service level inputs and disables apply buttons when invalid', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))

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

    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    fireEvent.click(screen.getByRole('button', { name: 'Применить для всех' }))

    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/service-level/apply')).toHaveLength(1))
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/analysis/service-level/apply',
      expect.objectContaining({ method: 'POST' })
    )

    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
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


  it('does not send request when modal changes are cancelled', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    fireEvent.change(screen.getByLabelText('Уровень сервиса AA'), { target: { value: '77' } })
    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))

    expect(screen.queryByRole('dialog', { name: 'Настройка уровней сервиса' })).not.toBeInTheDocument()
    expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/service-level/apply')).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    expect(screen.getByLabelText('Уровень сервиса AA')).toHaveValue(95)
  })

  it('discards draft changes on Escape close', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    fireEvent.change(screen.getByLabelText('Уровень сервиса AA'), { target: { value: '81' } })

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog', { name: 'Настройка уровней сервиса' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    expect(screen.getByLabelText('Уровень сервиса AA')).toHaveValue(95)
  })

  it('saves current analysis slice and resets all filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.change(screen.getAllByLabelText('Склады')[0], { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'не анализировать новые товары' }))
    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    fireEvent.change(screen.getByLabelText('Уровень сервиса AA'), { target: { value: '88' } })
    fireEvent.click(screen.getByRole('button', { name: 'Применить для всех' }))
    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/service-level/apply')).toHaveLength(1))

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
    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    expect(screen.getByLabelText('Уровень сервиса AA')).toHaveValue(95)
    expect(screen.getByLabelText('Поиск')).toHaveValue('')
  })
  it('locks critical controls and shows loading indicator while run is pending', async () => {
    const runRequest = deferred()
    const fetchMock = vi.fn((url) => {
      if (url === '/analysis/run') {
        return runRequest.promise
      }

      return Promise.resolve({ ok: true, json: vi.fn().mockResolvedValue({}) })
    })

    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.change(screen.getAllByLabelText('Склады')[0], { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Все товары' }))

    fireEvent.click(screen.getByRole('button', { name: 'Провести анализ по группе' }))

    expect(await screen.findByRole('status')).toHaveTextContent('Запуск анализа...')
    expect(screen.getByLabelText('От')).toBeDisabled()
    expect(screen.getByLabelText('До')).toBeDisabled()
    expect(screen.getByLabelText('Шаг (дням)')).toBeDisabled()
    expect(screen.getByLabelText('Режим анализа по группе')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Параметры анализа' })).toBeDisabled()
    expect(screen.getByLabelText('Поиск')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Все товары' })).toBeDisabled()

    runRequest.resolve({ ok: true })
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  })

  it('shows stable error state with retry and keeps filters after run failure', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: vi.fn().mockResolvedValue({ message: 'Ошибка запуска' })
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(analysisDatasetMap['abc-xyz']) })
    vi.stubGlobal('fetch', fetchMock)

    renderPage()

    fireEvent.change(screen.getAllByLabelText('Склады')[0], { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Все товары' }))

    fireEvent.click(screen.getByRole('button', { name: 'Провести анализ по группе' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ошибка запуска')
    expect(screen.getByRole('button', { name: 'Повторить запуск' })).toBeEnabled()
    expect(screen.getAllByLabelText('Склады')[0]).toHaveValue('msk')
    expect(screen.getByLabelText('От')).toHaveValue('2025-01-01')
    expect(screen.getByLabelText('До')).toHaveValue('2025-01-15')

    fireEvent.click(screen.getByRole('button', { name: 'Повторить запуск' }))

    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/run')).toHaveLength(2))
  })

  it('refreshes workspace data after successful run without page reload', async () => {
    const initialDataset = mockAnalysisData['abc-xyz']
    mockAnalysisData['abc-xyz'] = {
      ...initialDataset,
      results: [{ sku: 'OLD-SKU-1', abc: 'A', xyz: 'X', x: 90, y: 80, group: 'G1', volume: 5, warehouse: 'msk' }]
    }

    const fetchMock = vi.fn((url) => {
      if (url === '/analysis/run') {
        mockAnalysisData['abc-xyz'] = {
          ...initialDataset,
          results: [{ sku: 'NEW-SKU-1', abc: 'A', xyz: 'X', x: 90, y: 80, group: 'G1', volume: 5, warehouse: 'msk' }]
        }
        return Promise.resolve({ ok: true })
      }

      return Promise.resolve({ ok: true })
    })
    vi.stubGlobal('fetch', fetchMock)

    renderPage()

    await screen.findByText('OLD-SKU-1')

    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.change(screen.getAllByLabelText('Склады')[0], { target: { value: 'msk' } })
    fireEvent.click(screen.getByRole('button', { name: 'Все товары' }))

    fireEvent.click(screen.getByRole('button', { name: 'Провести анализ по группе' }))

    await waitFor(() => expect(fetchMock.mock.calls.filter(([url]) => url === '/analysis/run')).toHaveLength(1))
    expect(screen.getByText('NEW-SKU-1')).toBeInTheDocument()
    expect(screen.queryByText('OLD-SKU-1')).not.toBeInTheDocument()

    mockAnalysisData['abc-xyz'] = initialDataset
  })

})
