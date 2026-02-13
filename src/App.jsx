import { Navigate, Route, Routes } from 'react-router-dom'
import { AnalysisPage } from './pages/AnalysisPage'

export function App() {
  return (
    <Routes>
      <Route path="/analysis/:analysisId" element={<AnalysisPage />} />
      <Route path="*" element={<Navigate to="/analysis/abc-xyz" replace />} />
    </Routes>
  )
}
