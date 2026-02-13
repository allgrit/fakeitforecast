import { describe, expect, it } from 'vitest'
import { filterTree, isSelectableNode } from './treeSearch'

const tree = [
  {
    id: 'group-1',
    name: 'Молочная продукция',
    type: 'group',
    children: [
      {
        id: 'sub-1',
        name: 'Молоко',
        type: 'subgroup',
        children: [{ id: 'prod-1', name: 'Молоко 3.2% 1л', type: 'product' }]
      }
    ]
  },
  { id: 'group-2', name: 'Бакалея', type: 'group', children: [] }
]

describe('treeSearch', () => {
  it('returns original tree when query is empty', () => {
    expect(filterTree(tree, '   ')).toEqual(tree)
  })

  it('keeps parent branches for matched descendants', () => {
    const result = filterTree(tree, '3.2%')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('group-1')
    expect(result[0].children[0].id).toBe('sub-1')
    expect(result[0].children[0].children[0].id).toBe('prod-1')
  })

  it('matches query case-insensitively', () => {
    const result = filterTree(tree, 'БАКАЛЕЯ')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('group-2')
  })

  it('checks selectable node types', () => {
    expect(isSelectableNode({ type: 'all' })).toBe(true)
    expect(isSelectableNode({ type: 'group' })).toBe(true)
    expect(isSelectableNode({ type: 'subgroup' })).toBe(true)
    expect(isSelectableNode({ type: 'product' })).toBe(false)
  })
})
