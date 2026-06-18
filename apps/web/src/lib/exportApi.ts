export type ExportFormat = 'jpg' | 'png'
export type ExportProfileId = '3x4' | '4x6'

export type ExportProfile = {
  id: ExportProfileId
  name: string
  widthPx: number
  heightPx: number
  ratio: string
}

export const EXPORT_PROFILES: ExportProfile[] = [
  {
    id: '3x4',
    name: 'Pas Foto 3x4',
    widthPx: 900,
    heightPx: 1200,
    ratio: '3:4',
  },
  {
    id: '4x6',
    name: 'Pas Foto 4x6',
    widthPx: 1200,
    heightPx: 1800,
    ratio: '2:3',
  },
]

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8404'

function getFilenameFromDisposition(disposition: string | null, fallback: string): string {
  if (!disposition) {
    return fallback
  }

  const match = disposition.match(/filename="?([^";]+)"?/i)
  return match?.[1] ?? fallback
}

export async function exportFinalImage(params: {
  imageBlob: Blob
  profileId: ExportProfileId
  format: ExportFormat
}): Promise<{ blob: Blob; filename: string }> {
  const formData = new FormData()
  formData.append('image', params.imageBlob, 'fourpix-preview.png')
  formData.append('profile_id', params.profileId)
  formData.append('format', params.format)

  const response = await fetch(`${API_BASE_URL}/export`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let message = 'Export gagal diproses.'
    try {
      const payload = (await response.json()) as { detail?: string }
      message = payload.detail ?? message
    } catch {
      // Response may be plain text/binary; keep friendly fallback.
    }
    throw new Error(message)
  }

  const blob = await response.blob()
  const fallback = `fourpix-${params.profileId}.${params.format}`
  const filename =
    response.headers.get('X-4Pix-Filename') ??
    getFilenameFromDisposition(response.headers.get('Content-Disposition'), fallback)

  return { blob, filename }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  URL.revokeObjectURL(url)
}
