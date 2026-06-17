import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { CameraMode } from './features/camera/CameraMode'
import type { TemplateSummary } from './types/templates'

type ScreenMode = 'start' | 'templates' | 'camera'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

const toAssetUrl = (url: string) => {
  if (!url) {
    return ''
  }

  if (/^https?:\/\//i.test(url)) {
    return url
  }

  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

function App() {
  const [screen, setScreen] = useState<ScreenMode>('start')
  const [templates, setTemplates] = useState<TemplateSummary[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSummary | null>(null)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
  const [templateError, setTemplateError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadTemplates = async () => {
      setIsLoadingTemplates(true)
      setTemplateError(null)

      try {
        const response = await fetch(`${API_BASE_URL}/templates`)

        if (!response.ok) {
          throw new Error(`Template registry response ${response.status}`)
        }

        const data = (await response.json()) as TemplateSummary[]

        if (!isMounted) {
          return
        }

        setTemplates(data)
        setSelectedTemplate((current) => current ?? data[0] ?? null)
      } catch {
        if (!isMounted) {
          return
        }

        setTemplateError('Template registry belum bisa dibaca. Pastikan backend 4Pix aktif.')
      } finally {
        if (isMounted) {
          setIsLoadingTemplates(false)
        }
      }
    }

    void loadTemplates()

    return () => {
      isMounted = false
    }
  }, [])

  const canOpenCamera = useMemo(() => Boolean(selectedTemplate), [selectedTemplate])

  if (screen === 'camera' && selectedTemplate) {
    return (
      <main className="app-shell">
        <CameraMode
          template={selectedTemplate}
          onBack={() => {
            setScreen('templates')
          }}
        />
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">4Pix Studio</p>
          <h1>Bikin Pas Foto Lebih Apik</h1>
          <p className="hero-copy">
            Live camera preview dengan template-aware workflow. Slice 02 fokus
            membuka kamera, memilih device, dan mengelola stream secara aman.
          </p>
        </div>

        <div className="hero-badge">
          <span>Local-first MVP</span>
          <strong>fourpix</strong>
        </div>
      </section>

      {screen === 'start' && (
        <section className="mode-grid">
          <button
            className="mode-card mode-card--primary"
            type="button"
            onClick={() => {
              setScreen('templates')
            }}
          >
            <span>Mode utama</span>
            <strong>Live Camera Mode</strong>
            <small>Pilih template lalu buka liveview kamera.</small>
          </button>

          <button className="mode-card" type="button" disabled>
            <span>Mode alternatif</span>
            <strong>Upload Photo Mode</strong>
            <small>Disiapkan untuk Slice 04.</small>
          </button>
        </section>
      )}

      {screen === 'templates' && (
        <section className="template-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Template Registry</p>
              <h2>Pilih template untuk Live Camera</h2>
            </div>

            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                setScreen('start')
              }}
            >
              ← Kembali
            </button>
          </div>

          {isLoadingTemplates && <p className="info-box">Memuat template...</p>}

          {templateError && (
            <div className="error-box" role="alert">
              {templateError}
            </div>
          )}

          {!isLoadingTemplates && !templateError && templates.length === 0 && (
            <div className="error-box" role="alert">
              Belum ada template valid dari backend.
            </div>
          )}

          <div className="template-grid">
            {templates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id

              return (
                <article
                  className={`template-card ${isSelected ? 'template-card--selected' : ''}`}
                  key={template.id}
                >
                  <div className="template-thumb-wrap">
                    <img
                      className="template-thumb"
                      src={toAssetUrl(template.thumbnailUrl)}
                      alt={template.name}
                    />
                  </div>

                  <div className="template-meta">
                    <p>{template.category}</p>
                    <h3>{template.name}</h3>
                    <code>{template.id}</code>
                  </div>

                  <button
                    className={isSelected ? 'primary-button' : 'secondary-button'}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setScreen('camera')
                    }}
                  >
                    {isSelected ? 'Buka Kamera' : 'Pilih & Buka Kamera'}
                  </button>
                </article>
              )
            })}
          </div>

          <div className="sticky-action">
            <div>
              <span>Template aktif</span>
              <strong>{selectedTemplate?.name ?? 'Belum dipilih'}</strong>
            </div>

            <button
              className="primary-button"
              type="button"
              disabled={!canOpenCamera}
              onClick={() => {
                setScreen('camera')
              }}
            >
              Lanjut ke Live Camera
            </button>
          </div>
        </section>
      )}
    </main>
  )
}

export default App
