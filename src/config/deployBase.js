const DEFAULT_GH_PAGES_REPO = 'fakeitforecast'

export function resolveDeployBase({ command, githubRepository, defaultRepo = DEFAULT_GH_PAGES_REPO } = {}) {
  if (command !== 'build') {
    return '/'
  }

  const repoFromEnv = (githubRepository || '').split('/')[1]
  const repoName = repoFromEnv || defaultRepo

  return repoName ? `/${repoName}/` : '/'
}
