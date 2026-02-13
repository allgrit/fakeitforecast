import basicDataset from './basic.json'
import largeTreeDataset from './large-tree.json'
import missingValuesDataset from './missing-values.json'
import outliersDataset from './outliers.json'
import duplicatesAndConflictsDataset from './duplicates-and-conflicts.json'

export const analysisDatasets = [
  basicDataset,
  largeTreeDataset,
  missingValuesDataset,
  outliersDataset,
  duplicatesAndConflictsDataset
]

export const analysisDatasetMap = Object.fromEntries(analysisDatasets.map((dataset) => [dataset.id, dataset]))

export const analysisDatasetRegistry = analysisDatasets.map(({ id, meta }) => ({
  id,
  ...meta
}))
