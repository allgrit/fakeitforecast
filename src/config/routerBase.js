export function getRouterBasename(baseUrl) {
  if (!baseUrl || baseUrl === '/' || baseUrl === '.' || baseUrl === './') {
    return undefined
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export function shouldUseHashRouter(baseUrl) {
  return Boolean(baseUrl && baseUrl !== '/')
}
