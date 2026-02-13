import { describe, expect, it } from 'vitest'
import { resolveDeployBase } from './deployBase'

describe('resolveDeployBase', () => {
  it('returns root base while running in dev mode', () => {
    expect(resolveDeployBase({ command: 'serve', githubRepository: 'allgrit/fakeitforecast' })).toBe('/')
  })

  it('uses repository name from GITHUB_REPOSITORY in build mode', () => {
    expect(resolveDeployBase({ command: 'build', githubRepository: 'allgrit/fakeitforecast' })).toBe('/fakeitforecast/')
  })

  it('falls back to default github pages repository name when env is unavailable', () => {
    expect(resolveDeployBase({ command: 'build', githubRepository: '' })).toBe('/fakeitforecast/')
  })

  it('returns root when build mode has no repository and fallback disabled', () => {
    expect(resolveDeployBase({ command: 'build', githubRepository: '', defaultRepo: '' })).toBe('/')
  })
})
