import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AnalysisPage } from './AnalysisPage'

describe('AnalysisPage smoke', () => {
  it('renders analysis page shell', () => {
    render(
      <MemoryRouter initialEntries={['/analysis/abc-xyz']}>
        <Routes>
          <Route path="/analysis/:analysisId" element={<AnalysisPage />} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByTestId('analysis-page')).toBeInTheDocument()
    expect(screen.getByText('Анализ abc-xyz')).toBeInTheDocument()
    expect(screen.getByText('Нет данных классификации')).toBeInTheDocument()
    expect(screen.getByText('Нет данных для отображения')).toBeInTheDocument()
  })
})
