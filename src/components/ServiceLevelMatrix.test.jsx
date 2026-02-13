import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ServiceLevelMatrix } from './ServiceLevelMatrix'

const baseProps = {
  serviceLevels: {
    AA: 90,
    AB: 90,
    AC: 90,
    BA: 90,
    BB: 90,
    BC: 90,
    CA: 90,
    CB: 90,
    CC: 90
  },
  onServiceLevelsChange: vi.fn(),
  scopeType: 'groups',
  onScopeTypeChange: vi.fn(),
  scopeOptions: [
    { id: 'grp-1', label: 'Группа 1' },
    { id: 'grp-2', label: 'Группа 2' }
  ],
  selectedScopeIds: [],
  onSelectedScopeIdsChange: vi.fn(),
  applyLoading: false,
  onApply: vi.fn()
}

describe('ServiceLevelMatrix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders 9 cells and triggers apply buttons', () => {
    render(<ServiceLevelMatrix {...baseProps} />)

    expect(screen.getAllByLabelText(/Уровень сервиса/)).toHaveLength(9)
    fireEvent.click(screen.getByRole('button', { name: 'Применить для всех' }))
    expect(baseProps.onApply).toHaveBeenCalledWith(true)
  })

  it('changes scope type and selected ids', () => {
    render(<ServiceLevelMatrix {...baseProps} />)

    fireEvent.click(screen.getByRole('radio', { name: 'Склады' }))
    expect(baseProps.onScopeTypeChange).toHaveBeenCalledWith('warehouses')

    const scopeSelect = screen.getByLabelText('Выбранный scope')
    Array.from(scopeSelect.options).forEach((option) => {
      option.selected = option.value === 'grp-1'
    })
    fireEvent.change(scopeSelect)
    expect(baseProps.onSelectedScopeIdsChange).toHaveBeenCalledWith(['grp-1'])
  })
})
