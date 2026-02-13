export const mockAnalysisData = {
  'abc-xyz': {
    name: 'ABC-XYZ базовый анализ',
    classificationKinds: [
      { id: 'abcxyz', label: 'ABC/XYZ' },
      { id: 'abc-fmr', label: 'ABC/FMR' }
    ],
    warehouses: [
      { id: 'msk', name: 'Основной склад МСК' },
      { id: 'spb', name: 'РЦ СПБ' }
    ],
    productTree: [
      {
        id: 'grp-dairy',
        name: 'Молочная продукция',
        type: 'group',
        children: [
          {
            id: 'sub-milk',
            name: 'Молоко',
            type: 'subgroup',
            children: [
              { id: 'sku-001', name: 'Молоко 3.2% 1л', type: 'product' },
              { id: 'sku-002', name: 'Молоко 2.5% 0.9л', type: 'product' }
            ]
          }
        ]
      },
      {
        id: 'grp-grocery',
        name: 'Бакалея',
        type: 'group',
        children: [
          {
            id: 'sub-cereals',
            name: 'Крупы',
            type: 'subgroup',
            children: [{ id: 'sku-014', name: 'Гречка ядрица 800г', type: 'product' }]
          }
        ]
      }
    ],
    results: [
      { sku: 'SKU-001', abc: 'A', xyz: 'X', x: 86, y: 83 },
      { sku: 'SKU-002', abc: 'A', xyz: 'Z', x: 79, y: 24 },
      { sku: 'SKU-014', abc: 'B', xyz: 'Y', x: 58, y: 55 },
      { sku: 'SKU-099', abc: 'C', xyz: 'X', x: 28, y: 77 }
    ]
  }
}
