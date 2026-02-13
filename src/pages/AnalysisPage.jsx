import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnalysisToolbar } from '../components/AnalysisToolbar'
import { AnalysisWorkspace } from '../components/AnalysisWorkspace'
import { ClassificationSidebar } from '../components/ClassificationSidebar'
import { mockAnalysisData } from '../data/mockAnalysisData'
import { analysisDatasetRegistry } from '../data/datasets'
import { SERVICE_LEVEL_COMBINATIONS } from '../utils/analysisValidation'
import { ServiceLevelModal } from '../components/ServiceLevelModal'
import { AnalysisParametersModal } from '../components/AnalysisParametersModal'
import { buildMockAnalysisResult } from '../utils/mockAnalysisEngine'

const FEATURE_USE_MOCKS = import.meta.env.VITE_USE_MOCK_ANALYSIS !== 'false'
const FEATURE_LOADING = import.meta.env.VITE_SHOW_ANALYSIS_LOADING === 'true'

const TELEMETRY_ENDPOINT = '/telemetry'

const initialFilters = {
  classificationKind: '',
  warehouseId: '',
  selectedNodeId: '',
  periodFrom: '',
  periodTo: '',
  stepDays: 1,
  dataMode: 'forecast',
  viewType: 'table',
  groupMode: 'by-subgroups',
  analysisTypes: {
    abc: true,
    xyz: true,
    xyzWithoutZeros: false,
    fmr: false
  },
  axes: {
    x: 'turnover',
    y: 'sales-frequency',
    z: 'demand-variation'
  },
  thresholds: {
    a: 80,
    b: 50,
    c: 20
  },
  flags: {
    excludeNewItems: false,
    clearSalesHistoryFromPromotions: false,
    aggregateByWarehouses: false,
    includeDeficit: false
  }
}

const initialServiceLevels = SERVICE_LEVEL_COMBINATIONS.reduce((acc, combination) => ({ ...acc, [combination]: 95 }), {})

const DEFAULT_ERROR_MESSAGE = 'Не удалось выполнить запрос. Попробуйте снова.'
const ERROR_MESSAGES = {
  400: 'Проверьте заполнение формы. Некоторые поля заполнены некорректно.',
  409: 'Операция не может быть выполнена из-за конфликта данных. Обновите анализ и повторите попытку.',
  422: 'Запрос отклонен бизнес-правилами. Измените параметры и повторите.'
}

async function parseApiError(response) {
  let payload = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  const detail = payload?.message || payload?.error || payload?.detail
  const statusMessage = ERROR_MESSAGES[response.status] || DEFAULT_ERROR_MESSAGE
  return detail ? `${statusMessage} (${detail})` : statusMessage
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  return response
}

function trackTelemetry(eventName, payload) {
  fetch(TELEMETRY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventName, payload, timestamp: new Date().toISOString() })
  }).catch(() => undefined)
}

export function AnalysisPage() {
  const { analysisId } = useParams()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(initialFilters)
  const [runLoading, setRunLoading] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [scopeType, setScopeType] = useState('groups')
  const [selectedScopeIds, setSelectedScopeIds] = useState([])
  const [serviceLevels, setServiceLevels] = useState(initialServiceLevels)
  const [feedback, setFeedback] = useState(null)
  const [resetKey, setResetKey] = useState(0)
  const [serviceLevelModalOpen, setServiceLevelModalOpen] = useState(false)
  const [analysisParametersModalOpen, setAnalysisParametersModalOpen] = useState(false)
  const [draftScopeType, setDraftScopeType] = useState('groups')
  const [draftSelectedScopeIds, setDraftSelectedScopeIds] = useState([])
  const [draftServiceLevels, setDraftServiceLevels] = useState(initialServiceLevels)
  const [draftFilters, setDraftFilters] = useState(initialFilters)
  const [analysisResult, setAnalysisResult] = useState(null)

  const analysisData = useMemo(() => {
    if (!FEATURE_USE_MOCKS || !analysisId) {
      return null
    }

    return mockAnalysisData[analysisId] || null
  }, [analysisId])

  const effectiveData = analysisResult ?? analysisData

  useEffect(() => {
    if (!FEATURE_USE_MOCKS) {
      return
    }

    setAnalysisResult(analysisData)
  }, [analysisData])

  const updateFilters = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const scopeOptions = useMemo(() => {
    if (draftScopeType === 'warehouses') {
      return (analysisData?.warehouses ?? []).map((warehouse) => ({ id: warehouse.id, label: warehouse.name }))
    }

    const uniqueGroups = [...new Set((analysisData?.results ?? []).map((row) => row.group).filter(Boolean))]
    return uniqueGroups.map((group) => ({ id: group, label: group }))
  }, [analysisData, draftScopeType])

  const showSuccess = (message) => setFeedback({ type: 'success', message })
  const showError = (message) => setFeedback({ type: 'error', message })

  const applyServiceLevels = async (applyToAll, draftState) => {
    const nextScopeType = draftState.scopeType
    const nextSelectedScopeIds = draftState.selectedScopeIds
    const nextServiceLevels = draftState.serviceLevels

    const payload = {
      analysisId,
      applyToAll,
      scope: applyToAll
        ? null
        : {
            type: nextScopeType,
            ids: nextSelectedScopeIds
          },
      cells: SERVICE_LEVEL_COMBINATIONS.map((combo) => ({
        combo,
        serviceLevel: Number(nextServiceLevels[combo])
      }))
    }

    setApplyLoading(true)
    setFeedback(null)
    try {
      await postJson('/analysis/service-level/apply', payload)
      trackTelemetry('analysis_service_level_apply', { analysisId, applyToAll, scopeType: nextScopeType })
      setScopeType(nextScopeType)
      setSelectedScopeIds(nextSelectedScopeIds)
      setServiceLevels(nextServiceLevels)
      setServiceLevelModalOpen(false)
      showSuccess('Уровни сервиса успешно применены.')
    } catch (error) {
      showError(error.message)
    } finally {
      setApplyLoading(false)
    }
  }

  const runAnalysis = async (groupMode) => {
    const selectedAnalysisTypes = Object.entries(filters.analysisTypes)
      .filter(([, isEnabled]) => isEnabled)
      .map(([analysisType]) => analysisType)

    const payload = {
      analysisId,
      warehouseId: filters.warehouseId,
      nodeId: filters.selectedNodeId,
      classificationKind: filters.classificationKind,
      period: {
        from: filters.periodFrom,
        to: filters.periodTo,
        stepDays: filters.stepDays
      },
      dataMode: filters.dataMode,
      view: filters.viewType,
      groupAnalysisMode: groupMode,
      analysisTypes: selectedAnalysisTypes,
      axes: filters.axes,
      thresholds: {
        a: Number(filters.thresholds.a),
        b: Number(filters.thresholds.b),
        c: Number(filters.thresholds.c)
      },
      flags: {
        includeNewItems: !filters.flags.excludeNewItems,
        includePromotions: !filters.flags.clearSalesHistoryFromPromotions,
        aggregateByWarehouses: filters.flags.aggregateByWarehouses,
        includeDeficit: filters.flags.includeDeficit
      }
    }

    if (FEATURE_USE_MOCKS) {
      try {
        await postJson('/analysis/run', payload)
      } catch {
        // В mock-режиме сетевой запрос не блокирует локальный пересчет.
      }

      const mockResult = buildMockAnalysisResult(analysisData, filters)
      setAnalysisResult(mockResult)
      trackTelemetry('analysis_run_started', { analysisId, groupMode, source: 'mock' })
      showSuccess(`Анализ выполнен на демо-данных: ${mockResult?.results?.length ?? 0} строк.`)
      return
    }

    setRunLoading(true)
    setFeedback(null)
    try {
      await postJson('/analysis/run', payload)
      trackTelemetry('analysis_run_started', { analysisId, groupMode })
      showSuccess('Анализ запущен.')
    } catch (error) {
      showError(error.message)
    } finally {
      setRunLoading(false)
    }
  }

  const saveAnalysisSlice = async () => {
    const payload = {
      analysisId,
      filters,
      scope: {
        type: scopeType,
        ids: selectedScopeIds
      },
      serviceLevels
    }

    setSaveLoading(true)
    setFeedback(null)
    try {
      await postJson('/analysis/save', payload)
      showSuccess('Текущий срез анализа сохранен.')
    } catch (error) {
      showError(error.message)
    } finally {
      setSaveLoading(false)
    }
  }

  const resetAllFilters = () => {
    setFilters(initialFilters)
    setScopeType('groups')
    setSelectedScopeIds([])
    setServiceLevels(initialServiceLevels)
    setFeedback(null)
    setAnalysisResult(analysisData)
    setResetKey((prev) => prev + 1)
  }

  const openServiceLevelModal = () => {
    setDraftScopeType(scopeType)
    setDraftSelectedScopeIds(selectedScopeIds)
    setDraftServiceLevels(serviceLevels)
    setServiceLevelModalOpen(true)
  }

  const openAnalysisParametersModal = () => {
    setDraftFilters(filters)
    setAnalysisParametersModalOpen(true)
  }

  const closeAnalysisParametersModal = () => {
    setAnalysisParametersModalOpen(false)
    setDraftFilters(filters)
  }

  const applyAnalysisParameters = () => {
    setFilters(draftFilters)
    setAnalysisParametersModalOpen(false)
  }


  const handleSelectDataset = (datasetId) => {
    if (!datasetId || datasetId === analysisId) {
      return
    }

    navigate(`/analysis/${datasetId}`)
  }

  return (
    <div className="analysis-page" data-testid="analysis-page">
      {feedback ? <div className={`api-feedback ${feedback.type}`}>{feedback.message}</div> : null}
      <AnalysisToolbar
        key={`toolbar-${resetKey}`}
        analysisId={analysisId}
        loading={FEATURE_LOADING}
        data={effectiveData}
        filters={filters}
        onChange={updateFilters}
        onRunAnalysis={runAnalysis}
        onSaveAnalysis={saveAnalysisSlice}
        onResetFilters={resetAllFilters}
        onOpenServiceLevelModal={openServiceLevelModal}
        onOpenAnalysisParametersModal={openAnalysisParametersModal}
        runLoading={runLoading}
        saveLoading={saveLoading}
        demoDatasets={FEATURE_USE_MOCKS ? analysisDatasetRegistry : []}
        onSelectDataset={handleSelectDataset}
      />
      <div className="analysis-body">
        <ClassificationSidebar
          key={`sidebar-${resetKey}`}
          loading={FEATURE_LOADING}
          data={effectiveData}
          filters={filters}
          onChange={updateFilters}
        />
        <div className="analysis-content">
          <ServiceLevelModal
            isOpen={serviceLevelModalOpen}
            onClose={() => setServiceLevelModalOpen(false)}
            serviceLevels={draftServiceLevels}
            onServiceLevelsChange={setDraftServiceLevels}
            scopeType={draftScopeType}
            onScopeTypeChange={(nextType) => {
              setDraftScopeType(nextType)
              setDraftSelectedScopeIds([])
            }}
            scopeOptions={scopeOptions}
            selectedScopeIds={draftSelectedScopeIds}
            onSelectedScopeIdsChange={setDraftSelectedScopeIds}
            applyLoading={applyLoading}
            onApply={(applyToAll) =>
              applyServiceLevels(applyToAll, {
                scopeType: draftScopeType,
                selectedScopeIds: draftSelectedScopeIds,
                serviceLevels: draftServiceLevels
              })
            }
          />
          <AnalysisParametersModal
            isOpen={analysisParametersModalOpen}
            draftFilters={draftFilters}
            onDraftChange={(patch) => setDraftFilters((prev) => ({ ...prev, ...patch }))}
            onClose={closeAnalysisParametersModal}
            onApply={applyAnalysisParameters}
          />
          <AnalysisWorkspace
            key={`workspace-${resetKey}`}
            loading={FEATURE_LOADING}
            data={effectiveData}
            thresholds={filters.thresholds}
            viewType={filters.viewType}
            onViewChange={(viewType) => {
              updateFilters({ viewType })
              trackTelemetry('analysis_view_switched', { analysisId, viewType })
            }}
          />
        </div>
      </div>
    </div>
  )
}
