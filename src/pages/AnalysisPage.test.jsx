import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AnalysisPage } from './AnalysisPage'

function renderPage(analysisId = 'abc-xyz') {
  render(
    <MemoryRouter initialEntries={[`/analysis/${analysisId}`]}>
      <Routes>
        <Route path="/analysis/:analysisId" element={<AnalysisPage />} />
      </Routes>
    </MemoryRouter>
  )
}

function getApiCalls(fetchMock, path) {
  return fetchMock.mock.calls.filter(([url]) => url === `/api/v1${path}`)
}

function expectVersionHeader(request) {
  expect(request.headers).toMatchObject({
    'Content-Type': 'application/json',
    'X-API-Version': '1'
  })
}

describe('AnalysisPage API contract', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_USE_MOCK_ANALYSIS', 'true')
    vi.stubEnv('VITE_SHOW_ANALYSIS_LOADING', 'false')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('runs analysis via /api/v1 with required version header and valid scope schema', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.change(screen.getAllByLabelText('Склады')[0], { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Все товары' }))
    fireEvent.change(screen.getByLabelText('Режим анализа по группе'), { target: { value: 'selected-subgroups' } })

    fireEvent.click(screen.getByRole('button', { name: 'Провести анализ по группе' }))

    await waitFor(() => expect(getApiCalls(fetchMock, '/analysis/run')).toHaveLength(1))
    const [, request] = getApiCalls(fetchMock, '/analysis/run')[0]

    expectVersionHeader(request)
    const payload = JSON.parse(request.body)

    expect(payload).toEqual({
      warehouseId: 'msk',
      classificationKind: '',
      period: { from: '2025-01-01', to: '2025-01-15', stepDays: 1 },
      analysisTypes: ['abc', 'xyz'],
      dataMode: 'FORECAST',
      viewType: 'TABLE',
      scope: {
        mode: 'SELECTED_SUBGROUPS',
        groupId: 'all-items',
        subgroupIds: []
      },
      axes: { x: 'turnover', y: 'sales-frequency', z: 'demand-variation' },
      thresholds: { a: 80, b: 50, c: 20 },
      flags: {
        includeNewItems: true,
        includePromotions: true,
        aggregateByWarehouses: false,
        includeDeficit: false
      }
    })
  })

  it('shows contract validation message for 400 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ message: 'scope.mode is required' })
    })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    fireEvent.click(screen.getByRole('button', { name: 'Применить для всех' }))

    await waitFor(() => {
      expect(
        screen.getByText('Проверьте заполнение формы. Некоторые поля заполнены некорректно. (scope.mode is required)')
      ).toBeInTheDocument()
    })
  })

  it('shows contract validation message for 422 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: vi.fn().mockResolvedValue({ message: 'thresholds.a must be >= thresholds.b' })
    })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    fireEvent.click(screen.getByRole('button', { name: 'Применить для всех' }))

    await waitFor(() => {
      expect(
        screen.getByText('Запрос отклонен бизнес-правилами. Измените параметры и повторите. (thresholds.a must be >= thresholds.b)')
      ).toBeInTheDocument()
    })
  })


  it('sends selected scope in scoped service level apply payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Склады' }))
    const scopeSelect = screen.getByLabelText('Выбранный scope')
    Array.from(scopeSelect.options).forEach((option) => {
      option.selected = option.value === 'msk'
    })
    fireEvent.change(scopeSelect)
    fireEvent.click(screen.getByRole('button', { name: 'Применить по выбранному scope' }))

    await waitFor(() => expect(getApiCalls(fetchMock, '/analysis/service-level/apply')).toHaveLength(1))
    const [, applyRequest] = getApiCalls(fetchMock, '/analysis/service-level/apply')[0]
    const applyPayload = JSON.parse(applyRequest.body)

    expect(applyPayload).toMatchObject({
      analysisId: 'abc-xyz',
      applyToAll: false,
      scopeType: 'warehouses',
      selectedScopeIds: ['msk']
    })
  })

  it('sends applyServiceLevels and saveAnalysisSlice to /api/v1 with version header and OpenAPI-shaped payload', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    fireEvent.change(screen.getAllByLabelText('Склады')[0], { target: { value: 'msk' } })
    fireEvent.change(screen.getByLabelText('От'), { target: { value: '2025-01-01' } })
    fireEvent.change(screen.getByLabelText('До'), { target: { value: '2025-01-15' } })
    fireEvent.click(screen.getByRole('button', { name: 'Все товары' }))

    fireEvent.click(screen.getByRole('button', { name: 'Уровни сервиса' }))
    fireEvent.change(screen.getByLabelText('Уровень сервиса AA'), { target: { value: '88' } })
    fireEvent.click(screen.getByRole('button', { name: 'Применить для всех' }))

    await waitFor(() => expect(getApiCalls(fetchMock, '/analysis/service-level/apply')).toHaveLength(1))
    const [, applyRequest] = getApiCalls(fetchMock, '/analysis/service-level/apply')[0]
    expectVersionHeader(applyRequest)
    const applyPayload = JSON.parse(applyRequest.body)
    expect(applyPayload.analysisId).toBe('abc-xyz')
    expect(applyPayload.applyToAll).toBe(true)
    expect(applyPayload.scopeType).toBeUndefined()
    expect(applyPayload.selectedScopeIds).toBeUndefined()
    expect(applyPayload.cells).toHaveLength(9)
    expect(applyPayload.cells.find((cell) => cell.combo === 'AA')).toEqual({ combo: 'AA', serviceLevel: 88 })

    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => expect(getApiCalls(fetchMock, '/analysis/save')).toHaveLength(1))
    const [, saveRequest] = getApiCalls(fetchMock, '/analysis/save')[0]
    expectVersionHeader(saveRequest)
    const savePayload = JSON.parse(saveRequest.body)

    expect(savePayload).toEqual({
      analysisId: 'abc-xyz',
      name: 'analysis-abc-xyz',
      configuration: {
        warehouseId: 'msk',
        classificationKind: '',
        period: { from: '2025-01-01', to: '2025-01-15', stepDays: 1 },
        analysisTypes: ['abc', 'xyz'],
        dataMode: 'FORECAST',
        viewType: 'TABLE',
        scope: {
          mode: 'SUBGROUPS',
          groupId: 'all-items'
        },
        axes: { x: 'turnover', y: 'sales-frequency', z: 'demand-variation' },
        thresholds: { a: 80, b: 50, c: 20 },
        flags: {
          includeNewItems: true,
          includePromotions: true,
          aggregateByWarehouses: false,
          includeDeficit: false
        }
      }
    })
  })
})
