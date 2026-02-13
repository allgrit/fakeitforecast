import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ServiceLevelModal } from './ServiceLevelModal'

const modalProps = {
  isOpen: true,
  onClose: vi.fn(),
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
  scopeOptions: [{ id: 'grp-1', label: 'Группа 1' }],
  selectedScopeIds: [],
  onSelectedScopeIdsChange: vi.fn(),
  applyLoading: false,
  onApply: vi.fn()
}

function renderModal(overrides = {}) {
  const props = { ...modalProps, ...overrides }
  render(<ServiceLevelModal {...props} />)
  return props
}

describe('ServiceLevelModal', () => {
  it('does not render when closed', () => {
    renderModal({ isOpen: false })

    expect(screen.queryByRole('dialog', { name: 'Настройка уровней сервиса' })).not.toBeInTheDocument()
  })

  it('renders matrix content', () => {
    renderModal()

    expect(screen.getByRole('dialog', { name: 'Настройка уровней сервиса' })).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Уровень сервиса/)).toHaveLength(9)
  })

  it('closes using escape, overlay and cancel button', () => {
    const props = renderModal()

    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(document.querySelector('.modal-overlay'))
    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))

    expect(props.onClose).toHaveBeenCalledTimes(3)
  })
})
