export function filterTree(nodes, query) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return nodes
  }

  return nodes
    .map((node) => {
      const children = node.children ? filterTree(node.children, query) : []
      const matched = node.name.toLowerCase().includes(normalizedQuery)

      if (!matched && children.length === 0) {
        return null
      }

      return {
        ...node,
        children
      }
    })
    .filter(Boolean)
}

export function isSelectableNode(node) {
  return ['all', 'group', 'subgroup'].includes(node.type)
}
