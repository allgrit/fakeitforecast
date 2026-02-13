import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ClassificationSidebar } from './ClassificationSidebar'

const data = {
  classificationKinds: [{ id: 'abcxyz', label: 'ABC/XYZ' }],
  warehouses: [{ id: 'all', name: 'Все склады' }],
  productTree: [
    {
      id: 'grp-1',
      name: 'Молочная продукция',
      type: 'group',
      children: [
        {
          id: 'sub-1',
          name: 'Молоко',
          type: 'subgroup',
          children: [{ id: 'sku-1', name: 'Молоко 3.2%', type: 'product' }]
        }
      ]
    }
  ]
}

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

    expect(onChange).toHaveBeenCalledWith({ selectedNodeId: 'grp-1' })
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
