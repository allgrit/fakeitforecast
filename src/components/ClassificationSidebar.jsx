import { useMemo, useState } from 'react'
import { filterTree, isSelectableNode } from '../utils/treeSearch'

function HighlightedText({ text, query }) {
  if (!query.trim()) {
    return text
  }

  const normalizedText = text.toLowerCase()
  const normalizedQuery = query.toLowerCase().trim()
  const matchIndex = normalizedText.indexOf(normalizedQuery)

  if (matchIndex === -1) {
    return text
  }

  return (
    <>
      {text.slice(0, matchIndex)}
      <mark>{text.slice(matchIndex, matchIndex + normalizedQuery.length)}</mark>
      {text.slice(matchIndex + normalizedQuery.length)}
    </>
  )
}

function TreeNode({ node, depth, expandedIds, onToggle, selectedNodeId, onSelect, searchQuery }) {
  const hasChildren = node.children?.length > 0
  const expanded = expandedIds.has(node.id)
  const selectable = isSelectableNode(node)

  return (
    <li>
      <div className="tree-node" style={{ paddingLeft: `${depth * 12}px` }}>
        {hasChildren ? (
          <button
            type="button"
            className="toggle-btn"
            onClick={() => onToggle(node.id)}
            aria-label={expanded ? `Свернуть ${node.name}` : `Раскрыть ${node.name}`}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className="toggle-placeholder" />
        )}

        <button
          type="button"
          className={`node-btn ${selectedNodeId === node.id ? 'selected' : ''}`}
          onClick={() => selectable && onSelect(node)}
          disabled={!selectable}
          aria-selected={selectedNodeId === node.id}
        >
          <HighlightedText text={node.name} query={searchQuery} />
          {!selectable && <span className="node-meta"> (товар)</span>}
        </button>
      </div>

      {hasChildren && expanded && (
        <ul>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              selectedNodeId={selectedNodeId}
              onSelect={onSelect}
              searchQuery={searchQuery}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function ClassificationSidebar({ loading, data }) {
  const [classificationKind, setClassificationKind] = useState('')
  const [warehouse, setWarehouse] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNodeId, setSelectedNodeId] = useState('all-items')
  const [expandedIds, setExpandedIds] = useState(() => new Set(['all-items']))

  if (loading) {
    return <aside className="skeleton sidebar-skeleton" data-testid="sidebar-skeleton" />
  }

  const classificationKinds = data?.classificationKinds ?? []
  const warehouses = data?.warehouses ?? []
  const productTree = data?.productTree ?? []

  const treeWithRoot = useMemo(
    () => [
      {
        id: 'all-items',
        name: 'Все товары',
        type: 'all',
        children: productTree
      }
    ],
    [productTree]
  )

  const filteredTree = useMemo(() => filterTree(treeWithRoot, searchQuery), [treeWithRoot, searchQuery])

  const toggleNode = (nodeId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }

  return (
    <aside className="classification-sidebar">
      <h2>Классификация</h2>

      <label className="field-label">
        Вид классификации
        <select value={classificationKind} onChange={(event) => setClassificationKind(event.target.value)}>
          <option value="">Не выбрано</option>
          {classificationKinds.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        Склады
        <select value={warehouse} onChange={(event) => setWarehouse(event.target.value)}>
          <option value="">Все склады</option>
          {warehouses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        Поиск
        <input
          type="search"
          placeholder="Найти группу или товар"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </label>

      {filteredTree.length ? (
        <ul className="product-tree">
          {filteredTree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              expandedIds={expandedIds}
              onToggle={toggleNode}
              selectedNodeId={selectedNodeId}
              onSelect={(selectedNode) => {
                setSelectedNodeId(selectedNode.id)
                setExpandedIds((prev) => new Set(prev).add(selectedNode.id))
              }}
              searchQuery={searchQuery}
            />
          ))}
        </ul>
      ) : (
        <p className="empty-state">Ничего не найдено</p>
      )}
    </aside>
  )
}
