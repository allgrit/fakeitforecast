import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnalysisToolbar } from '../components/AnalysisToolbar'
import { AnalysisWorkspace } from '../components/AnalysisWorkspace'
import { ClassificationSidebar } from '../components/ClassificationSidebar'
import { mockAnalysisData } from '../data/mockAnalysisData'
import { SERVICE_LEVEL_COMBINATIONS } from '../utils/analysisValidation'
import { ServiceLevelMatrix } from '../components/ServiceLevelMatrix'

const FEATURE_USE_MOCKS = import.meta.env.VITE_USE_MOCK_ANALYSIS !== 'false'
const FEATURE_LOADING = import.meta.env.VITE_SHOW_ANALYSIS_LOADING === 'true'

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

export function AnalysisPage() {
  const { analysisId } = useParams()
  const [filters, setFilters] = useState(initialFilters)
  const [runLoading, setRunLoading] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
  const [scopeType, setScopeType] = useState('groups')
  const [selectedScopeIds, setSelectedScopeIds] = useState([])
  const [serviceLevels, setServiceLevels] = useState(
    SERVICE_LEVEL_COMBINATIONS.reduce((acc, combination) => ({ ...acc, [combination]: 95 }), {})
  )

  const analysisData = useMemo(() => {
    if (!FEATURE_USE_MOCKS || !analysisId) {
      return null
    }

    return mockAnalysisData[analysisId] || null
  }, [analysisId])

  const updateFilters = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const scopeOptions = useMemo(() => {
    if (scopeType === 'warehouses') {
      return (analysisData?.warehouses ?? []).map((warehouse) => ({ id: warehouse.id, label: warehouse.name }))
    }

    const uniqueGroups = [...new Set((analysisData?.results ?? []).map((row) => row.group).filter(Boolean))]
    return uniqueGroups.map((group) => ({ id: group, label: group }))
  }, [analysisData, scopeType])

  const applyServiceLevels = async (applyToAll) => {
    const payload = {
      analysisId,
      applyToAll,
      scope: applyToAll
        ? null
        : {
            type: scopeType,
            ids: selectedScopeIds
          },
      cells: SERVICE_LEVEL_COMBINATIONS.map((combo) => ({
        combo,
        serviceLevel: Number(serviceLevels[combo])
      }))
    }

    setApplyLoading(true)
    try {
      await fetch('/analysis/service-level/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } finally {
      setApplyLoading(false)
    }
  }

  const runAnalysis = async (groupMode) => {
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

    setRunLoading(true)
    try {
      await fetch('/analysis/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } finally {
      setRunLoading(false)
    }
  }

  return (
    <div className="analysis-page" data-testid="analysis-page">
      <AnalysisToolbar
        analysisId={analysisId}
        loading={FEATURE_LOADING}
        data={analysisData}
        filters={filters}
        onChange={updateFilters}
        onRunAnalysis={runAnalysis}
        runLoading={runLoading}
      />
      <div className="analysis-body">
        <ClassificationSidebar loading={FEATURE_LOADING} data={analysisData} filters={filters} onChange={updateFilters} />
        <div className="analysis-content">
          <ServiceLevelMatrix
            serviceLevels={serviceLevels}
            onServiceLevelsChange={setServiceLevels}
            scopeType={scopeType}
            onScopeTypeChange={(nextType) => {
              setScopeType(nextType)
              setSelectedScopeIds([])
            }}
            scopeOptions={scopeOptions}
            selectedScopeIds={selectedScopeIds}
            onSelectedScopeIdsChange={setSelectedScopeIds}
            applyLoading={applyLoading}
            onApply={applyServiceLevels}
          />
          <AnalysisWorkspace
            loading={FEATURE_LOADING}
            data={analysisData}
            thresholds={filters.thresholds}
            viewType={filters.viewType}
            onViewChange={(viewType) => updateFilters({ viewType })}
          />
        </div>
      </div>
    </div>
  )
}
