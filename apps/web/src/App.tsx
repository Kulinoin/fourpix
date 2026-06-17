import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { TemplateSelection } from './features/templates/TemplateSelection'
import { API_BASE_URL, fetchTemplates, toApiAssetUrl } from './features/templates/templateApi'
import type { TemplateSummary } from './types/template'

type HealthState = 'checking' | 'ok' | 'error'

function App() {
  const [healthState, setHealthState] = useState<HealthState>('checking')
  const [templates, setTemplates] = useState<TemplateSummary[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(true)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  )

  const loadHealth = useCallback(async () => {
    setHealthState('checking')

    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      setHealthState(response.ok ? 'ok' : 'error')
    } catch {
      setHealthState('error')
    }
  }, [])

  const loadTemplates = useCallback(async () => {
    setTemplatesLoading(true)
    setTemplateError(null)

    try {
      const nextTemplates = await fetchTemplates()
      setTemplates(nextTemplates)
      setSelectedTemplateId((current) => {
        if (current && nextTemplates.some((template) => template.id === current)) {
          return current
        }

        return nextTemplates[0]?.id ?? null
      })
    } catch (error) {
      setTemplateError(error instanceof Error ? error.message : 'Template registry gagal dimuat')
    } finally {
      setTemplatesLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadHealth()
    void loadTemplates()
  }, [loadHealth, loadTemplates])

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">4Pix Studio</p>
          <h1>Bikin Pas Foto Lebih Apik</h1>
          <p className="hero-copy">
            Slice 01 menyiapkan registry template berbasis folder dan metadata JSON. Template tidak di-hardcode di UI, jadi asset final nanti bisa diganti tanpa ubah logic utama.
          </p>
        </div>

        <div className="status-card">
          <span className={`status-dot status-${healthState}`} />
          <div>
            <strong>Backend lokal</strong>
            <span>
              {healthState === 'checking'
                ? 'Mengecek koneksi...'
                : healthState === 'ok'
                  ? 'Tersambung'
                  : 'Belum tersambung'}
            </span>
          </div>
        </div>
      </section>

      <TemplateSelection
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        isLoading={templatesLoading}
        error={templateError}
        onSelect={(template) => setSelectedTemplateId(template.id)}
        onRetry={loadTemplates}
      />

      <section className="panel">
        <p className="eyebrow">Template Terpilih</p>

        {selectedTemplate ? (
          <div className="selected-template">
            <img
              src={toApiAssetUrl(selectedTemplate.overlayPreviewUrl)}
              alt={`${selectedTemplate.name} overlay preview`}
              className="selected-preview"
            />

            <div>
              <h2>{selectedTemplate.name}</h2>
              <p className="muted">ID: {selectedTemplate.id}</p>
              <dl className="metadata-list">
                <div>
                  <dt>Canvas</dt>
                  <dd>
                    {selectedTemplate.canvas.width}×{selectedTemplate.canvas.height} ({selectedTemplate.canvas.ratio})
                  </dd>
                </div>
                <div>
                  <dt>Face center</dt>
                  <dd>
                    X {selectedTemplate.faceGuide.centerX}, Eye Y {selectedTemplate.faceGuide.eyeY}, Chin Y {selectedTemplate.faceGuide.chinY}
                  </dd>
                </div>
                <div>
                  <dt>Neck anchor</dt>
                  <dd>
                    X {selectedTemplate.neckAnchor.x}, Y {selectedTemplate.neckAnchor.y}
                  </dd>
                </div>
                <div>
                  <dt>Adjustment limit</dt>
                  <dd>
                    Scale {selectedTemplate.adjustmentLimits.minScale}–{selectedTemplate.adjustmentLimits.maxScale}, rotate {selectedTemplate.adjustmentLimits.minRotation}° sampai {selectedTemplate.adjustmentLimits.maxRotation}°
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <p className="muted">Pilih salah satu template untuk melanjutkan ke slice kamera/overlay berikutnya.</p>
        )}
      </section>
    </main>
  )
}

export default App
