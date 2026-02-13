import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ClassificationSidebar } from './ClassificationSidebar'
import { analysisDatasetMap } from '../data/datasets'

const data = analysisDatasetMap['abc-xyz']

describe('ClassificationSidebar', () => {
  it('selects a tree node', () => {
    const onChange = vi.fn()
    render(
      <ClassificationSidebar
        loading={false}
        data={data}
        filters={{ classificationKind: '', warehouseId: '', selectedNodeId: '' }}
        onChange={onChange}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Молочная продукция' }))

    expect(onChange).toHaveBeenCalledWith({ selectedNodeId: 'grp-dairy' })
  })

  it('highlights search match in tree', () => {
    render(
      <ClassificationSidebar
        loading={false}
        data={data}
        filters={{ classificationKind: '', warehouseId: '', selectedNodeId: '' }}
        onChange={() => {}}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Найти группу или товар'), {
      target: { value: 'Молоч' }
    })

    expect(screen.getByText('Молоч', { selector: 'mark' })).toBeInTheDocument()
  })
})
