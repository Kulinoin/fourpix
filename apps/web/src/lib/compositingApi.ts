const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8404'

export type ComposeTransform = {
  x: number
  y: number
  scale: number
  rotation: number
}

export type ComposeTemplateRequest = {
  subjectBlob: Blob
  templateId: string
  backgroundColor: string
  transform?: Partial<ComposeTransform>
}

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

async function responseMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = await response.json().catch(() => null)
    if (body?.detail) {
      return Array.isArray(body.detail) ? JSON.stringify(body.detail) : String(body.detail)
    }
  }

  return (await response.text().catch(() => '')) || `HTTP ${response.status}`
}

export async function composeTemplate(request: ComposeTemplateRequest): Promise<Blob> {
  const formData = new FormData()
  formData.append('subject', request.subjectBlob, 'fourpix-subject.png')
  formData.append('template_id', request.templateId)
  formData.append('background_color', request.backgroundColor)
  formData.append(
    'transform',
    JSON.stringify({
      x: request.transform?.x ?? 0,
      y: request.transform?.y ?? 0,
      scale: request.transform?.scale ?? 1,
      rotation: request.transform?.rotation ?? 0,
    }),
  )

  const response = await fetch(apiUrl('/process/compose'), {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(await responseMessage(response))
  }

  return response.blob()
}
