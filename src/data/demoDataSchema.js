export const DEMO_DATA_FORMAT_VERSION = '2.0.0'

export const SUPPORTED_DEMO_DATA_VERSIONS = ['1.0.0', DEMO_DATA_FORMAT_VERSION]
export const DEPRECATED_DEMO_DATA_VERSIONS = ['1.0.0']

export const TREE_NODE_TYPES = ['group', 'subgroup', 'product']
export const ANALYSIS_CLASSES = ['A', 'B', 'C', 'X', 'Y', 'Z']

export const demoDataSchema = {
  formatVersion: {
    type: 'string',
    required: true,
    enum: SUPPORTED_DEMO_DATA_VERSIONS
  },
  sections: {
    meta: {
      required: true,
      type: 'object',
      fields: {
        datasetId: { type: 'string', required: true, minLength: 1 },
        name: { type: 'string', required: true, minLength: 1 },
        createdAt: { type: 'string', required: true, format: 'date-time' }
      }
    },
    tree: {
      required: true,
      type: 'array',
      nullable: false,
      item: {
        type: 'object',
        fields: {
          id: { type: 'string', required: true, minLength: 1 },
          name: { type: 'string', required: true, minLength: 1 },
          type: { type: 'string', required: true, enum: TREE_NODE_TYPES },
          children: { type: 'array', required: false, nullable: true }
        }
      }
    },
    analysisItems: {
      required: true,
      type: 'array',
      nullable: false,
      minItems: 1,
      item: {
        type: 'object',
        fields: {
          sku: { type: 'string', required: true, minLength: 1 },
          abc: { type: 'string', required: true, enum: ANALYSIS_CLASSES.slice(0, 3) },
          xyz: { type: 'string', required: true, enum: ANALYSIS_CLASSES.slice(3) },
          x: { type: 'number', required: true, min: 0, max: 100 },
          y: { type: 'number', required: true, min: 0, max: 100 },
          volume: { type: 'number', required: true, min: 0 }
        }
      }
    },
    serviceLevels: {
      required: true,
      type: 'object',
      nullable: false,
      fields: {
        AA: { type: 'number', required: true, min: 0, max: 100 },
        AB: { type: 'number', required: true, min: 0, max: 100 },
        AC: { type: 'number', required: true, min: 0, max: 100 },
        BA: { type: 'number', required: true, min: 0, max: 100 },
        BB: { type: 'number', required: true, min: 0, max: 100 },
        BC: { type: 'number', required: true, min: 0, max: 100 },
        CA: { type: 'number', required: true, min: 0, max: 100 },
        CB: { type: 'number', required: true, min: 0, max: 100 },
        CC: { type: 'number', required: true, min: 0, max: 100 }
      }
    },
    filters: {
      required: true,
      type: 'object',
      nullable: false,
      fields: {
        warehouseIds: { type: 'array', required: true, nullable: false },
        classificationKinds: { type: 'array', required: true, nullable: false }
      }
    }
  }
}
