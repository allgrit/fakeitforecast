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
      { sku: 'SKU-001', abc: 'A', xyz: 'X' },
      { sku: 'SKU-014', abc: 'B', xyz: 'Y' }
    ]
  }
}
