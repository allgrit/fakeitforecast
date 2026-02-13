import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { AnalysisToolbar } from '../components/AnalysisToolbar'
import { AnalysisWorkspace } from '../components/AnalysisWorkspace'
import { ClassificationSidebar } from '../components/ClassificationSidebar'
import { mockAnalysisData } from '../data/mockAnalysisData'

const FEATURE_USE_MOCKS = import.meta.env.VITE_USE_MOCK_ANALYSIS === 'true'
const FEATURE_LOADING = import.meta.env.VITE_SHOW_ANALYSIS_LOADING === 'true'

export function AnalysisPage() {
  const { analysisId } = useParams()

  const analysisData = useMemo(() => {
    if (!FEATURE_USE_MOCKS || !analysisId) {
      return null
    }

    return mockAnalysisData[analysisId] || null
  }, [analysisId])

  return (
    <div className="analysis-page" data-testid="analysis-page">
      <AnalysisToolbar analysisId={analysisId} loading={FEATURE_LOADING} data={analysisData} />
      <div className="analysis-body">
        <ClassificationSidebar loading={FEATURE_LOADING} data={analysisData} />
        <AnalysisWorkspace loading={FEATURE_LOADING} data={analysisData} />
      </div>
    </div>
  )
}
