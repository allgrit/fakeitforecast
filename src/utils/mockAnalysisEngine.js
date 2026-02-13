function normalizeToken(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]/gi, '')
}

function getNodeById(nodes, nodeId) {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node
    }

    if (node.children?.length) {
      const nested = getNodeById(node.children, nodeId)
      if (nested) {
        return nested
      }
    }
  }

  return null
}

function collectProductIds(node) {
  if (!node) {
    return []
  }

  if (node.type === 'product') {
    return [node.id]
  }

  return (node.children ?? []).flatMap(collectProductIds)
}

function resolveAbc(xValue, thresholds) {
  if (xValue >= thresholds.a) return 'A'
  if (xValue >= thresholds.b) return 'B'
  return 'C'
}

function resolveXyz(yValue, thresholds) {
  if (yValue >= thresholds.a) return 'X'
  if (yValue >= thresholds.b) return 'Y'
  return 'Z'
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function buildMockAnalysisResult(dataset, filters) {
  if (!dataset) {
    return null
  }

  const thresholds = {
    a: toNumber(filters?.thresholds?.a, 80),
    b: toNumber(filters?.thresholds?.b, 50),
    c: toNumber(filters?.thresholds?.c, 20)
  }

  const selectedTypes = filters?.analysisTypes ?? {}
  const shouldRecalculateAbc = selectedTypes.abc !== false
  const shouldRecalculateXyz = selectedTypes.xyz !== false

  const targetWarehouse = normalizeToken(filters?.warehouseId)
  const targetNodeId = filters?.selectedNodeId
  const selectedNode = targetNodeId ? getNodeById(dataset.productTree ?? [], targetNodeId) : null
  const selectedProducts = new Set(collectProductIds(selectedNode).map(normalizeToken))
  const selectedGroupName = selectedNode?.type === 'group' ? normalizeToken(selectedNode.name) : null

  const results = (dataset.results ?? [])
    .filter((row) => {
      if (!targetWarehouse) {
        return true
      }

      return normalizeToken(row.warehouse) === targetWarehouse || normalizeToken(row.warehouse) === normalizeToken(targetWarehouse.toUpperCase())
    })
    .filter((row) => {
      if (!targetNodeId || targetNodeId === 'all-items' || !selectedNode) {
        return true
      }

      if (selectedGroupName) {
        return normalizeToken(row.group) === selectedGroupName
      }

      if (selectedProducts.size > 0) {
        return selectedProducts.has(normalizeToken(row.sku))
      }

      return true
    })
    .map((row) => {
      const xValue = toNumber(row.x ?? row.xValue)
      const yValue = toNumber(row.y ?? row.yValue)

      return {
        ...row,
        x: xValue,
        y: yValue,
        abc: shouldRecalculateAbc ? resolveAbc(xValue, thresholds) : row.abc,
        xyz: shouldRecalculateXyz ? resolveXyz(yValue, thresholds) : row.xyz
      }
    })

  return {
    ...dataset,
    results
  }
}
