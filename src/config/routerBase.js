export function getRouterBasename(baseUrl) {
  if (!baseUrl || baseUrl === '/') {
    return undefined
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}
