const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export function resolveApiAssetUrl(pathOrUrl: string): string {
  if (/^(https?:|data:|blob:)/i.test(pathOrUrl)) {
    return pathOrUrl
  }

  if (!pathOrUrl.startsWith('/')) {
    return pathOrUrl
  }

  if (!apiBaseUrl) {
    return pathOrUrl
  }

  return `${apiBaseUrl}${pathOrUrl}`
}
