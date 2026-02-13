export function getRouterBasename(baseUrl) {
  if (!baseUrl || baseUrl === '/' || baseUrl === '.' || baseUrl === './') {
    return undefined
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export function shouldUseHashRouter(baseUrl) {
  if (baseUrl === '.' || baseUrl === './') {
    return true
  }

  return getRouterBasename(baseUrl) !== undefined
}
