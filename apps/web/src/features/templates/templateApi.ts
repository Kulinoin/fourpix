import type { TemplateSummary } from '../../types/template'

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8000'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  DEFAULT_API_BASE_URL
).replace(/\/$/, '')

export function toApiAssetUrl(assetUrl: string): string {
  if (assetUrl.startsWith('http://') || assetUrl.startsWith('https://')) {
    return assetUrl
  }

  return `${API_BASE_URL}${assetUrl}`
}

export async function fetchTemplates(): Promise<TemplateSummary[]> {
  const response = await fetch(`${API_BASE_URL}/templates`)

  if (!response.ok) {
    throw new Error(`Template registry gagal dimuat (${response.status})`)
  }

  const data: unknown = await response.json()

  if (!Array.isArray(data)) {
    throw new Error('Template registry mengembalikan format yang tidak valid')
  }

  return data as TemplateSummary[]
}
