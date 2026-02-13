import { describe, expect, it } from 'vitest'
import { getRouterBasename } from './routerBase'

describe('getRouterBasename', () => {
  it('returns undefined for root base url', () => {
    expect(getRouterBasename('/')).toBeUndefined()
    expect(getRouterBasename('')).toBeUndefined()
  })

  it('trims trailing slash for nested base url', () => {
    expect(getRouterBasename('/fakeitforecast/')).toBe('/fakeitforecast')
  })

  it('returns base as is when no trailing slash', () => {
    expect(getRouterBasename('/fakeitforecast')).toBe('/fakeitforecast')
  })
})
