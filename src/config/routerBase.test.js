import { describe, expect, it } from 'vitest'
import { getRouterBasename, shouldUseHashRouter } from './routerBase'

describe('getRouterBasename', () => {
  it('returns undefined for root and relative base urls', () => {
    expect(getRouterBasename('/')).toBeUndefined()
    expect(getRouterBasename('')).toBeUndefined()
    expect(getRouterBasename('.')).toBeUndefined()
    expect(getRouterBasename('./')).toBeUndefined()
  })

  it('trims trailing slash for nested base url', () => {
    expect(getRouterBasename('/fakeitforecast/')).toBe('/fakeitforecast')
  })

  it('returns base as is when no trailing slash', () => {
    expect(getRouterBasename('/fakeitforecast')).toBe('/fakeitforecast')
  })
})

describe('shouldUseHashRouter', () => {
  it('returns false for root and relative-base deployments', () => {
    expect(shouldUseHashRouter('/')).toBe(false)
    expect(shouldUseHashRouter('')).toBe(false)
    expect(shouldUseHashRouter('.')).toBe(false)
    expect(shouldUseHashRouter('./')).toBe(false)
  })

  it('returns true for nested deployments like GitHub Pages project sites', () => {
    expect(shouldUseHashRouter('/fakeitforecast/')).toBe(true)
    expect(shouldUseHashRouter('/fakeitforecast')).toBe(true)
  })
})
