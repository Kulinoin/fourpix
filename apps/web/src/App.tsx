import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'

type WorkMode = 'live' | 'upload'
type OverlayMode = 'guide' | 'template' | 'none'
type CameraStatus = 'idle' | 'starting' | 'active' | 'error'
type LoadingAction =
  | null
  | 'templates'
  | 'camera'
  | 'capture'
  | 'upload'
  | 'remove'
  | 'compose'
  | 'export'

type TemplateSummary = {
  id: string
  name: string
  category?: string
  thumbnailUrl?: string
  overlayGuideUrl?: string
  overlayPreviewUrl?: string
  assets?: {
    thumbnail?: string
    thumbnailUrl?: string
    overlayGuide?: string
    overlayGuideUrl?: string
    overlayPreview?: string
    overlayPreviewUrl?: string
  }
}

type ExportProfile = {
  id: string
  name: string
  widthPx: number
  heightPx: number
  ratio: string
}

type Transform = {
  x: number
  y: number
  scale: number
  rotation: number
}

const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://127.0.0.1:8404'
).replace(/\/+$/, '')

const DEFAULT_EXPORT_PROFILES: ExportProfile[] = [
  { id: '3x4', name: 'Pas Foto 3x4', widthPx: 900, heightPx: 1200, ratio: '3:4' },
  { id: '4x6', name: 'Pas Foto 4x6', widthPx: 1200, heightPx: 1800, ratio: '2:3' },
]

const BACKGROUND_PRESETS = [
  { id: 'red', name: 'Merah', value: '#E53935' },
  { id: 'blue', name: 'Biru', value: '#1565C0' },
  { id: 'white', name: 'Putih', value: '#FFFFFF' },
  { id: 'gray', name: 'Abu muda', value: '#E5E7EB' },
]

const manualValidationItems = [
  'Buka backend di http://127.0.0.1:8404 dan frontend di http://127.0.0.1:5174.',
  'Pilih template, buka Live Camera Mode, lalu pastikan overlay guide/template tampil.',
  'Capture foto dari kamera atau gunakan Upload Photo Mode sebagai fallback.',
  'Klik Remove Background Lokal dan pastikan preview transparan muncul.',
  'Ubah background warna, geser X/Y, zoom, rotate, lalu pastikan preview final berubah.',
  'Export JPG dan PNG untuk profile 3x4 dan 4x6, lalu buka file hasil export.',
]

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

async function readApiError(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = await response.json().catch(() => null)
    if (typeof body?.detail === 'string') return body.detail
    if (Array.isArray(body?.detail)) return JSON.stringify(body.detail)
  }

  const text = await response.text().catch(() => '')
  return text.trim() || `Request gagal dengan status ${response.status}.`
}

function isAbsoluteUrl(url: string): boolean {
  return /^(https?:|blob:|data:)/i.test(url)
}

function resolveTemplateAssetUrl(template: TemplateSummary | null, assetUrl?: string): string | null {
  if (!template || !assetUrl) return null
  if (isAbsoluteUrl(assetUrl)) return assetUrl
  if (assetUrl.startsWith('/')) return `${API_BASE_URL}${assetUrl}`
  return `${API_BASE_URL}/templates/${template.id}/${assetUrl}`
}

function getTemplateThumbnail(template: TemplateSummary): string | null {
  return resolveTemplateAssetUrl(
    template,
    template.thumbnailUrl ?? template.assets?.thumbnailUrl ?? template.assets?.thumbnail,
  )
}

function getOverlayAsset(template: TemplateSummary | null, overlayMode: OverlayMode): string | null {
  if (!template || overlayMode === 'none') return null

  if (overlayMode === 'guide') {
    return resolveTemplateAssetUrl(
      template,
      template.overlayGuideUrl ?? template.assets?.overlayGuideUrl ?? template.assets?.overlayGuide,
    )
  }

  return resolveTemplateAssetUrl(
    template,
    template.overlayPreviewUrl ?? template.assets?.overlayPreviewUrl ?? template.assets?.overlayPreview,
  )
}

function extractFilename(response: Response, fallback: string): string {
  const directHeader = response.headers.get('X-4Pix-Filename')
  if (directHeader) return directHeader

  const disposition = response.headers.get('content-disposition') ?? ''
  const match = disposition.match(/filename="?([^";]+)"?/i)

  return match?.[1] ?? fallback
}

function cameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return 'Izin kamera ditolak. Aktifkan permission kamera di browser, atau gunakan Upload Photo Mode.'
    }

    if (error.name === 'NotFoundError') {
      return 'Kamera tidak ditemukan. Sambungkan kamera, cek driver, atau gunakan Upload Photo Mode.'
    }

    if (error.name === 'NotReadableError') {
      return 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi kamera lain lalu coba restart kamera.'
    }

    if (error.name === 'OverconstrainedError') {
      return 'Kamera tidak cocok dengan pengaturan yang diminta. Coba pilih kamera lain.'
    }
  }

  return error instanceof Error ? error.message : 'Kamera gagal dibuka.'
}

function validateImageFile(file: File): string | null {
  const isValidImage = ['image/jpeg', 'image/png'].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name)

  if (!isValidImage) {
    return 'File tidak valid. Gunakan JPG atau PNG.'
  }

  if (file.size > 12 * 1024 * 1024) {
    return 'Ukuran file terlalu besar. Maksimal 12 MB untuk MVP.'
  }

  return null
}

function downloadBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 800)
}

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const objectUrlsRef = useRef<Set<string>>(new Set())
  const composeRequestRef = useRef(0)

  const [screen, setScreen] = useState<'start' | 'studio'>('start')
  const [workMode, setWorkMode] = useState<WorkMode>('live')
  const [templates, setTemplates] = useState<TemplateSummary[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [templateError, setTemplateError] = useState<string | null>(null)

  const [exportProfiles, setExportProfiles] = useState<ExportProfile[]>(DEFAULT_EXPORT_PROFILES)
  const [exportProfileId, setExportProfileId] = useState(DEFAULT_EXPORT_PROFILES[0].id)

  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle')
  const [cameraError, setCameraError] = useState<string | null>(null)

  const [overlayMode, setOverlayMode] = useState<OverlayMode>('guide')
  const [overlayAssetError, setOverlayAssetError] = useState<string | null>(null)

  const [inputBlob, setInputBlob] = useState<Blob | null>(null)
  const [inputUrl, setInputUrl] = useState<string | null>(null)
  const [inputName, setInputName] = useState('Belum ada foto')

  const [subjectBlob, setSubjectBlob] = useState<Blob | null>(null)
  const [subjectUrl, setSubjectUrl] = useState<string | null>(null)

  const [finalBlob, setFinalBlob] = useState<Blob | null>(null)
  const [finalUrl, setFinalUrl] = useState<string | null>(null)

  const [backgroundColor, setBackgroundColor] = useState(BACKGROUND_PRESETS[0].value)
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1, rotation: 0 })

  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null)
  const [appError, setAppError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0] ?? null,
    [selectedTemplateId, templates],
  )

  const overlayAssetUrl = getOverlayAsset(selectedTemplate, overlayMode)
  const showGeneratedGuide = overlayMode === 'guide' && (!overlayAssetUrl || Boolean(overlayAssetError))
  const isBusy = loadingAction !== null

  const makeObjectUrl = useCallback((blob: Blob): string => {
    const objectUrl = URL.createObjectURL(blob)
    objectUrlsRef.current.add(objectUrl)
    return objectUrl
  }, [])

  const revokeObjectUrl = useCallback((objectUrl: string | null) => {
    if (!objectUrl) return
    URL.revokeObjectURL(objectUrl)
    objectUrlsRef.current.delete(objectUrl)
  }, [])

  const replaceObjectUrl = useCallback(
    (setter: Dispatch<SetStateAction<string | null>>, blob: Blob | null) => {
      const nextUrl = blob ? makeObjectUrl(blob) : null
      setter((currentUrl) => {
        revokeObjectUrl(currentUrl)
        return nextUrl
      })
    },
    [makeObjectUrl, revokeObjectUrl],
  )

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      objectUrlsRef.current.forEach((objectUrl) => URL.revokeObjectURL(objectUrl))
      objectUrlsRef.current.clear()
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadBootstrapData() {
      setLoadingAction('templates')
      setTemplateError(null)

      try {
        const templateResponse = await fetch(apiUrl('/templates'))
        if (!templateResponse.ok) throw new Error(await readApiError(templateResponse))

        const templatePayload = (await templateResponse.json()) as TemplateSummary[]
        if (!Array.isArray(templatePayload)) {
          throw new Error('Response template registry tidak valid.')
        }

        if (!isMounted) return

        setTemplates(templatePayload)
        setSelectedTemplateId((current) => current || templatePayload[0]?.id || '')
      } catch (error) {
        if (!isMounted) return
        setTemplateError(
          error instanceof Error
            ? error.message
            : 'Template registry belum bisa dibaca. Pastikan backend 4Pix aktif.',
        )
      }

      try {
        const exportResponse = await fetch(apiUrl('/export/profiles'))
        if (!exportResponse.ok) throw new Error(await readApiError(exportResponse))

        const exportPayload = (await exportResponse.json()) as { profiles?: ExportProfile[] }
        if (Array.isArray(exportPayload.profiles) && exportPayload.profiles.length > 0 && isMounted) {
          setExportProfiles(exportPayload.profiles)
          setExportProfileId((current) => current || exportPayload.profiles?.[0]?.id || DEFAULT_EXPORT_PROFILES[0].id)
        }
      } catch {
        if (isMounted) {
          setExportProfiles(DEFAULT_EXPORT_PROFILES)
        }
      } finally {
        if (isMounted) {
          setLoadingAction((current) => (current === 'templates' ? null : current))
        }
      }
    }

    void loadBootstrapData()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setOverlayAssetError(null)
  }, [overlayMode, selectedTemplate?.id])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setCameraStatus('idle')
  }, [])

  const startCamera = useCallback(
    async (deviceId?: string) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus('error')
        setCameraError('Browser ini belum mendukung akses kamera. Gunakan browser modern atau Upload Photo Mode.')
        return
      }

      setLoadingAction('camera')
      setCameraStatus('starting')
      setCameraError(null)
      setAppError(null)
      stopCamera()

      try {
        const videoConstraints: MediaTrackConstraints = deviceId
          ? {
              deviceId: { exact: deviceId },
              width: { ideal: 1080 },
              height: { ideal: 1440 },
              aspectRatio: { ideal: 0.75 },
            }
          : {
              facingMode: 'user',
              width: { ideal: 1080 },
              height: { ideal: 1440 },
              aspectRatio: { ideal: 0.75 },
            }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        })

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        const activeDeviceId = stream.getVideoTracks()[0]?.getSettings().deviceId ?? ''
        if (activeDeviceId) setSelectedDeviceId(activeDeviceId)

        const devices = await navigator.mediaDevices.enumerateDevices()
        setCameraDevices(devices.filter((device) => device.kind === 'videoinput'))
        setCameraStatus('active')
        setSuccessMessage('Kamera aktif. Posisikan wajah mengikuti overlay sebelum capture.')
      } catch (error) {
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setCameraStatus('error')
        setCameraError(cameraErrorMessage(error))
      } finally {
        setLoadingAction((current) => (current === 'camera' ? null : current))
      }
    },
    [stopCamera],
  )

  const resetOutput = useCallback(() => {
    setSubjectBlob(null)
    replaceObjectUrl(setSubjectUrl, null)
    setFinalBlob(null)
    replaceObjectUrl(setFinalUrl, null)
  }, [replaceObjectUrl])

  const setInputImage = useCallback(
    (blob: Blob, name: string) => {
      setInputBlob(blob)
      replaceObjectUrl(setInputUrl, blob)
      setInputName(name)
      resetOutput()
      setAppError(null)
      setSuccessMessage('Input foto siap diproses.')
    },
    [replaceObjectUrl, resetOutput],
  )

  const handleCapture = useCallback(async () => {
    const video = videoRef.current

    if (!video || cameraStatus !== 'active') {
      setAppError('Liveview kamera belum aktif. Nyalakan kamera dulu sebelum capture.')
      return
    }

    if (!video.videoWidth || !video.videoHeight) {
      setAppError('Liveview belum siap dibaca. Coba tunggu sebentar lalu capture ulang.')
      return
    }

    setLoadingAction('capture')
    setAppError(null)
    setSuccessMessage(null)

    try {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas browser tidak tersedia.')

      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((nextBlob) => {
          if (nextBlob) resolve(nextBlob)
          else reject(new Error('Capture kamera gagal dibuat.'))
        }, 'image/png')
      })

      setInputImage(blob, 'fourpix-camera-capture.png')
    } catch (error) {
      setAppError(error instanceof Error ? error.message : 'Capture kamera gagal.')
    } finally {
      setLoadingAction((current) => (current === 'capture' ? null : current))
    }
  }, [cameraStatus, setInputImage])

  const handleUploadChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null
      event.target.value = ''

      if (!file) return

      const validationError = validateImageFile(file)
      if (validationError) {
        setAppError(validationError)
        return
      }

      setLoadingAction('upload')
      setAppError(null)
      setSuccessMessage(null)

      try {
        setInputImage(file, file.name)
      } catch (error) {
        setAppError(error instanceof Error ? error.message : 'Upload foto gagal dibaca.')
      } finally {
        setLoadingAction((current) => (current === 'upload' ? null : current))
      }
    },
    [setInputImage],
  )

  const runRemoveBackground = useCallback(async () => {
    if (!inputBlob) {
      setAppError('Belum ada foto input. Capture dari kamera atau upload JPG/PNG dulu.')
      return
    }

    setLoadingAction('remove')
    setAppError(null)
    setSuccessMessage(null)
    setFinalBlob(null)
    replaceObjectUrl(setFinalUrl, null)

    try {
      const formData = new FormData()
      formData.append('file', inputBlob, inputName || 'fourpix-input.png')

      const response = await fetch(apiUrl('/process/remove-background'), {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(await readApiError(response))
      }

      const outputBlob = await response.blob()
      setSubjectBlob(outputBlob)
      replaceObjectUrl(setSubjectUrl, outputBlob)
      setSuccessMessage('Background berhasil dihapus secara lokal. Preview final akan dibuat otomatis.')
    } catch (error) {
      setAppError(error instanceof Error ? error.message : 'Remove background gagal diproses.')
    } finally {
      setLoadingAction((current) => (current === 'remove' ? null : current))
    }
  }, [inputBlob, inputName, replaceObjectUrl])

  const composePreview = useCallback(
    async (overrideSubjectBlob?: Blob) => {
      const sourceBlob = overrideSubjectBlob ?? subjectBlob

      if (!sourceBlob) {
        setAppError('PNG transparan belum tersedia. Jalankan remove background dulu.')
        return
      }

      if (!selectedTemplate) {
        setAppError('Template belum dipilih.')
        return
      }

      const requestId = composeRequestRef.current + 1
      composeRequestRef.current = requestId

      setLoadingAction('compose')
      setAppError(null)

      try {
        const formData = new FormData()
        formData.append('subject', sourceBlob, 'fourpix-subject.png')
        formData.append('template_id', selectedTemplate.id)
        formData.append('background_color', backgroundColor)
        formData.append('transform', JSON.stringify(transform))

        const response = await fetch(apiUrl('/process/compose'), {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(await readApiError(response))
        }

        const outputBlob = await response.blob()

        if (composeRequestRef.current === requestId) {
          setFinalBlob(outputBlob)
          replaceObjectUrl(setFinalUrl, outputBlob)
          setSuccessMessage('Preview final sudah diperbarui.')
        }
      } catch (error) {
        if (composeRequestRef.current === requestId) {
          setAppError(error instanceof Error ? error.message : 'Compositing template gagal.')
        }
      } finally {
        if (composeRequestRef.current === requestId) {
          setLoadingAction((current) => (current === 'compose' ? null : current))
        }
      }
    },
    [backgroundColor, replaceObjectUrl, selectedTemplate, subjectBlob, transform],
  )

  useEffect(() => {
    if (!subjectBlob || !selectedTemplate) return

    const timer = window.setTimeout(() => {
      void composePreview(subjectBlob)
    }, 380)

    return () => window.clearTimeout(timer)
  }, [backgroundColor, composePreview, selectedTemplate, subjectBlob, transform.rotation, transform.scale, transform.x, transform.y])

  const handleExport = useCallback(
    async (format: 'jpg' | 'png') => {
      if (!finalBlob) {
        setAppError('Preview final belum tersedia. Jalankan remove background dan compose dulu.')
        return
      }

      setLoadingAction('export')
      setAppError(null)
      setSuccessMessage(null)

      try {
        const formData = new FormData()
        formData.append('image', finalBlob, 'fourpix-final-preview.png')
        formData.append('profile_id', exportProfileId)
        formData.append('format', format)

        const response = await fetch(apiUrl('/export'), {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(await readApiError(response))
        }

        const exportedBlob = await response.blob()
        const filename = extractFilename(response, `fourpix-${exportProfileId}.${format}`)

        downloadBlob(exportedBlob, filename)
        setSuccessMessage(`Export ${format.toUpperCase()} berhasil: ${filename}`)
      } catch (error) {
        setAppError(error instanceof Error ? error.message : 'Export gagal diproses.')
      } finally {
        setLoadingAction((current) => (current === 'export' ? null : current))
      }
    },
    [exportProfileId, finalBlob],
  )

  const resetAdjustment = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1, rotation: 0 })
  }, [])

  const clearInput = useCallback(() => {
    setInputBlob(null)
    replaceObjectUrl(setInputUrl, null)
    setInputName('Belum ada foto')
    resetOutput()
    setAppError(null)
    setSuccessMessage('Input dibersihkan.')
  }, [replaceObjectUrl, resetOutput])

  const openStudio = (nextMode: WorkMode) => {
    setWorkMode(nextMode)
    setScreen('studio')
    setAppError(null)
    setSuccessMessage(null)
  }

  return (
    <main className="fourpix-shell">
      <section className="hero-card">
        <div className="brand-lockup">
          <span className="brand-mark">4P</span>
          <div>
            <p className="eyebrow">4Pix Studio</p>
            <h1>Bikin Pas Foto Lebih Apik</h1>
          </div>
        </div>

        <p className="hero-copy">
          MVP lokal untuk live camera overlay, capture/upload, remove background lokal, compositing template,
          adjustment ringan, dan export JPG/PNG.
        </p>

        <div className="status-row">
          <span>Backend: {API_BASE_URL}</span>
          <span>{templates.length} template terbaca</span>
          <span>Local-first</span>
        </div>
      </section>

      {screen === 'start' ? (
        <section className="mode-grid" aria-label="Pilih mode kerja">
          <article className="mode-card mode-card--primary">
            <p className="eyebrow">Mode utama</p>
            <h2>Live Camera Mode</h2>
            <p>
              Buka kamera, posisikan wajah dengan overlay guide/template transparan, lalu capture untuk diproses.
            </p>
            <button type="button" onClick={() => openStudio('live')}>
              Mulai Live Camera
            </button>
          </article>

          <article className="mode-card">
            <p className="eyebrow">Fallback</p>
            <h2>Upload Photo Mode</h2>
            <p>
              Gunakan file JPG/PNG jika kamera belum tersedia, permission ditolak, atau pelanggan sudah membawa foto.
            </p>
            <button type="button" onClick={() => openStudio('upload')}>
              Upload Foto
            </button>
          </article>
        </section>
      ) : (
        <section className="studio-layout">
          <aside className="panel template-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Template</p>
                <h2>Pilih jas/dasi</h2>
              </div>
              <button className="ghost-button" type="button" onClick={() => setScreen('start')}>
                Start
              </button>
            </div>

            {templateError ? <p className="message message--error">{templateError}</p> : null}

            {loadingAction === 'templates' ? <p className="message">Memuat template...</p> : null}

            {!templateError && loadingAction !== 'templates' && templates.length === 0 ? (
              <p className="message message--warning">Belum ada template valid dari backend.</p>
            ) : null}

            <div className="template-list">
              {templates.map((template) => {
                const thumbnailUrl = getTemplateThumbnail(template)
                const isSelected = selectedTemplate?.id === template.id

                return (
                  <button
                    key={template.id}
                    type="button"
                    className={`template-card ${isSelected ? 'template-card--active' : ''}`}
                    onClick={() => setSelectedTemplateId(template.id)}
                  >
                    <span className="template-thumb">
                      {thumbnailUrl ? <img src={thumbnailUrl} alt="" /> : <span>4Pix</span>}
                    </span>
                    <span className="template-card__body">
                      <strong>{template.name}</strong>
                      <small>{template.category ?? template.id}</small>
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          <section className="panel capture-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">{workMode === 'live' ? 'Live Camera' : 'Upload Photo'}</p>
                <h2>{workMode === 'live' ? 'Ambil foto dengan overlay' : 'Upload foto alternatif'}</h2>
              </div>

              <div className="segmented-control" role="group" aria-label="Mode input">
                <button
                  type="button"
                  className={workMode === 'live' ? 'active' : ''}
                  onClick={() => setWorkMode('live')}
                >
                  Live
                </button>
                <button
                  type="button"
                  className={workMode === 'upload' ? 'active' : ''}
                  onClick={() => {
                    stopCamera()
                    setWorkMode('upload')
                  }}
                >
                  Upload
                </button>
              </div>
            </div>

            {workMode === 'live' ? (
              <>
                <div className="camera-stage">
                  <video ref={videoRef} className="camera-video" playsInline muted autoPlay />

                  {cameraStatus !== 'active' ? (
                    <div className="stage-empty">
                      <strong>
                        {cameraStatus === 'starting'
                          ? 'Menyalakan kamera...'
                          : cameraStatus === 'error'
                            ? 'Kamera belum aktif'
                            : 'Liveview standby'}
                      </strong>
                      <span>Klik Nyalakan Kamera untuk mulai.</span>
                    </div>
                  ) : null}

                  {overlayMode !== 'none' && overlayAssetUrl && !overlayAssetError ? (
                    <img
                      className={`overlay-image overlay-image--${overlayMode}`}
                      src={overlayAssetUrl}
                      alt=""
                      onError={() =>
                        setOverlayAssetError(
                          overlayMode === 'guide'
                            ? 'Overlay guide asset gagal dimuat. Fallback guide aktif.'
                            : 'Overlay template asset gagal dimuat. Cek template asset.',
                        )
                      }
                    />
                  ) : null}

                  {showGeneratedGuide ? (
                    <div className="generated-guide" aria-hidden="true">
                      <span className="guide-line guide-line--center" />
                      <span className="guide-line guide-line--eye" />
                      <span className="guide-line guide-line--chin" />
                      <span className="guide-oval" />
                      <span className="guide-shoulder" />
                    </div>
                  ) : null}
                </div>

                <div className="control-grid">
                  <label>
                    Kamera
                    <select
                      value={selectedDeviceId}
                      onChange={(event) => {
                        const deviceId = event.target.value
                        setSelectedDeviceId(deviceId)
                        void startCamera(deviceId || undefined)
                      }}
                    >
                      <option value="">Default browser camera</option>
                      {cameraDevices.map((device, index) => (
                        <option key={device.deviceId || index} value={device.deviceId}>
                          {device.label || `Kamera ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Overlay
                    <select value={overlayMode} onChange={(event) => setOverlayMode(event.target.value as OverlayMode)}>
                      <option value="guide">Guide Overlay</option>
                      <option value="template">Template Transparan</option>
                      <option value="none">Tanpa Overlay</option>
                    </select>
                  </label>
                </div>

                <div className="button-row">
                  <button type="button" onClick={() => void startCamera(selectedDeviceId || undefined)} disabled={isBusy}>
                    {loadingAction === 'camera' ? 'Menyalakan...' : 'Nyalakan Kamera'}
                  </button>
                  <button type="button" onClick={() => void handleCapture()} disabled={cameraStatus !== 'active' || isBusy}>
                    {loadingAction === 'capture' ? 'Capture...' : 'Capture Foto'}
                  </button>
                  <button type="button" className="ghost-button" onClick={stopCamera}>
                    Stop Kamera
                  </button>
                </div>

                <p className={`camera-status camera-status--${cameraStatus}`}>
                  Status kamera: <strong>{cameraStatus}</strong>
                </p>

                {cameraError ? <p className="message message--error">{cameraError}</p> : null}
                {overlayAssetError ? <p className="message message--warning">{overlayAssetError}</p> : null}
              </>
            ) : (
              <div className="upload-dropzone">
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(event) => void handleUploadChange(event)}
                  hidden
                />

                <p className="eyebrow">JPG / PNG · max 12 MB</p>
                <h3>Upload foto pelanggan</h3>
                <p>Mode ini jadi fallback kalau kamera gagal, permission ditolak, atau foto sudah tersedia.</p>

                <button type="button" onClick={() => uploadInputRef.current?.click()} disabled={isBusy}>
                  {loadingAction === 'upload' ? 'Membaca file...' : 'Pilih Foto'}
                </button>
              </div>
            )}

            <div className="input-preview">
              <div>
                <p className="eyebrow">Input</p>
                <h3>{inputName}</h3>
              </div>
              {inputUrl ? <img src={inputUrl} alt="Preview input foto" /> : <p className="empty-box">Belum ada foto.</p>}
              {inputBlob ? (
                <button type="button" className="ghost-button" onClick={clearInput}>
                  Bersihkan input
                </button>
              ) : null}
            </div>
          </section>

          <section className="panel process-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Processing</p>
                <h2>Remove BG → Compose → Export</h2>
              </div>
            </div>

            <div className="button-row">
              <button type="button" onClick={() => void runRemoveBackground()} disabled={!inputBlob || isBusy}>
                {loadingAction === 'remove' ? 'Memproses lokal...' : 'Remove Background Lokal'}
              </button>
              <button type="button" onClick={() => void composePreview()} disabled={!subjectBlob || !selectedTemplate || isBusy}>
                {loadingAction === 'compose' ? 'Membuat preview...' : 'Refresh Preview'}
              </button>
            </div>

            <div className="preview-grid">
              <article>
                <p className="eyebrow">PNG transparan</p>
                {subjectUrl ? (
                  <img className="checkerboard" src={subjectUrl} alt="Preview PNG transparan" />
                ) : (
                  <p className="empty-box">Belum diproses.</p>
                )}
              </article>

              <article>
                <p className="eyebrow">Preview final</p>
                {finalUrl ? (
                  <img src={finalUrl} alt="Preview final pas foto" />
                ) : (
                  <p className="empty-box">Preview final akan muncul setelah remove background.</p>
                )}
              </article>
            </div>

            <div className="editor-card">
              <div>
                <p className="eyebrow">Background</p>
                <div className="color-row">
                  {BACKGROUND_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={backgroundColor.toLowerCase() === preset.value.toLowerCase() ? 'color-chip active' : 'color-chip'}
                      style={{ backgroundColor: preset.value }}
                      onClick={() => setBackgroundColor(preset.value)}
                      title={preset.name}
                      aria-label={preset.name}
                    />
                  ))}
                  <label className="custom-color">
                    Custom
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(event) => setBackgroundColor(event.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="adjustment-grid">
                <label>
                  Geser X
                  <input
                    type="range"
                    min="-220"
                    max="220"
                    step="1"
                    value={transform.x}
                    onChange={(event) => setTransform((current) => ({ ...current, x: Number(event.target.value) }))}
                  />
                  <span>{transform.x}px</span>
                </label>

                <label>
                  Geser Y
                  <input
                    type="range"
                    min="-260"
                    max="260"
                    step="1"
                    value={transform.y}
                    onChange={(event) => setTransform((current) => ({ ...current, y: Number(event.target.value) }))}
                  />
                  <span>{transform.y}px</span>
                </label>

                <label>
                  Zoom
                  <input
                    type="range"
                    min="0.75"
                    max="1.35"
                    step="0.01"
                    value={transform.scale}
                    onChange={(event) => setTransform((current) => ({ ...current, scale: Number(event.target.value) }))}
                  />
                  <span>{transform.scale.toFixed(2)}×</span>
                </label>

                <label>
                  Rotate
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="0.5"
                    value={transform.rotation}
                    onChange={(event) => setTransform((current) => ({ ...current, rotation: Number(event.target.value) }))}
                  />
                  <span>{transform.rotation}°</span>
                </label>
              </div>

              <button type="button" className="ghost-button" onClick={resetAdjustment}>
                Reset Adjustment
              </button>
            </div>

            <div className="export-card">
              <div className="control-grid">
                <label>
                  Ukuran export
                  <select value={exportProfileId} onChange={(event) => setExportProfileId(event.target.value)}>
                    {exportProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name} · {profile.widthPx}×{profile.heightPx}px
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="button-row">
                <button type="button" onClick={() => void handleExport('jpg')} disabled={!finalBlob || isBusy}>
                  {loadingAction === 'export' ? 'Exporting...' : 'Export JPG'}
                </button>
                <button type="button" onClick={() => void handleExport('png')} disabled={!finalBlob || isBusy}>
                  {loadingAction === 'export' ? 'Exporting...' : 'Export PNG'}
                </button>
              </div>

              {!finalBlob ? <p className="message">Export aktif setelah preview final tersedia.</p> : null}
            </div>

            {appError ? <p className="message message--error">{appError}</p> : null}
            {successMessage ? <p className="message message--success">{successMessage}</p> : null}
          </section>

          <section className="panel validation-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Manual Validation</p>
                <h2>Checklist demo MVP</h2>
              </div>
            </div>

            <ol>
              {manualValidationItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
        </section>
      )}
    </main>
  )
}

export default App
