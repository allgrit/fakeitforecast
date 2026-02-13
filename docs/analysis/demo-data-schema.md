# Demo dataset JSON contract

## Версия формата

- Поле: `formatVersion`.
- Поддерживаемые версии: `1.0.0`, `2.0.0`.
- Для `1.0.0` валидатор возвращает warning о миграции на `2.0.0`.

## Обязательные секции

Корневой объект должен содержать секции:

- `meta`
- `tree`
- `analysisItems`
- `serviceLevels`
- `filters`

## Ограничения полей

### `meta`

- `datasetId` — string, required, minLength: 1.
- `name` — string, required, minLength: 1.
- `createdAt` — string, required, ISO date-time.

### `tree`

- array, required, not nullable.
- Элемент массива:
  - `id` — string, required.
  - `name` — string, required.
  - `type` — enum: `group | subgroup | product`.
  - `children` — nullable array.

### `analysisItems`

- array, required, minItems: 1.
- Элемент массива:
  - `sku` — string, required.
  - `abc` — enum: `A | B | C`.
  - `xyz` — enum: `X | Y | Z`.
  - `x` — number, required, min: 0, max: 100.
  - `y` — number, required, min: 0, max: 100.
  - `volume` — number, required, min: 0.

### `serviceLevels`

- object, required.
- Обязательные numeric поля в диапазоне 0..100:
  `AA`, `AB`, `AC`, `BA`, `BB`, `BC`, `CA`, `CB`, `CC`.

### `filters`

- object, required.
- `warehouseIds` — array, required.
- `classificationKinds` — array, required.

## Пример валидного payload

```json
{
  "formatVersion": "2.0.0",
  "meta": {
    "datasetId": "abc-xyz",
    "name": "Демо набор",
    "createdAt": "2026-01-01T10:00:00.000Z"
  },
  "tree": [
    {
      "id": "grp-1",
      "name": "Группа",
      "type": "group",
      "children": []
    }
  ],
  "analysisItems": [
    {
      "sku": "SKU-001",
      "abc": "A",
      "xyz": "X",
      "x": 95,
      "y": 80,
      "volume": 10
    }
  ],
  "serviceLevels": {
    "AA": 99,
    "AB": 97,
    "AC": 95,
    "BA": 93,
    "BB": 91,
    "BC": 89,
    "CA": 87,
    "CB": 85,
    "CC": 83
  },
  "filters": {
    "warehouseIds": ["msk"],
    "classificationKinds": ["abcxyz"]
  }
}
```

## Пример невалидного payload

```json
{
  "formatVersion": "9.9.9",
  "tree": [{ "id": 1, "name": "", "type": "invalid", "children": "oops" }],
  "analysisItems": [{ "sku": null, "abc": "D", "xyz": "K", "x": "bad", "y": 120, "volume": -1 }],
  "serviceLevels": { "AA": "high" },
  "filters": { "warehouseIds": "msk", "classificationKinds": null }
}
```

Ожидаемые ошибки:

- неподдерживаемая версия `formatVersion`;
- отсутствует обязательная секция `meta`;
- неверные типы и enum в `tree`/`analysisItems`;
- неполный и некорректный `serviceLevels`;
- неверные типы в `filters`.
