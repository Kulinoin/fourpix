import { useEffect, useState } from 'react'
import './App.css'

type BackendStatus =
  | {
      state: 'checking'
      message: string
    }
  | {
      state: 'ok'
      message: string
      app: string
      slug: string
    }
  | {
      state: 'error'
      message: string
    }

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8404'

function App() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    state: 'checking',
    message: 'Mengecek koneksi backend lokal...',
  })

  useEffect(() => {
    const controller = new AbortController()

    async function checkBackendHealth() {
      try {
        const response = await fetch(apiBaseUrl + '/health', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('Backend mengembalikan HTTP ' + response.status)
        }

        const data = (await response.json()) as {
          status?: string
          app?: string
          slug?: string
        }

        if (data.status !== 'ok') {
          throw new Error('Response health backend tidak valid.')
        }

        setBackendStatus({
          state: 'ok',
          message: 'Backend lokal terhubung.',
          app: data.app ?? '4Pix Studio',
          slug: data.slug ?? 'fourpix',
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setBackendStatus({
          state: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Backend lokal belum dapat dihubungi.',
        })
      }
    }

    void checkBackendHealth()

    return () => controller.abort()
  }, [])

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-content">
          <p className="eyebrow">Local Photo Studio</p>
          <h1>4Pix Studio</h1>
          <p className="tagline">Bikin Pas Foto Lebih Apik</p>
          <p className="intro">
            Fondasi awal aplikasi pas foto lokal berbasis live camera,
            overlay guide, template compositing, dan export cepat.
          </p>

          <div className="status-card" data-state={backendStatus.state}>
            <span className="status-dot" />
            <div>
              <strong>
                {backendStatus.state === 'ok'
                  ? 'Backend OK'
                  : backendStatus.state === 'checking'
                    ? 'Checking Backend'
                    : 'Backend Error'}
              </strong>
              <p>{backendStatus.message}</p>

              {backendStatus.state === 'ok' ? (
                <small>
                  App: {backendStatus.app} · Slug: {backendStatus.slug}
                </small>
              ) : null}
            </div>
          </div>

          <div className="foundation-note">
            <h2>Slice 00 — Project Foundation</h2>
            <p>
              Frontend React/Vite dan backend FastAPI sudah siap. Fitur kamera,
              template registry, remove background, compositing, adjustment, dan
              export akan dibangun pada slice berikutnya.
            </p>
          </div>
        </div>

        <aside className="studio-panel" aria-label="4Pix Studio preview">
          <div className="camera-shell">
            <div className="camera-topbar">
              <span />
              <span />
              <span />
            </div>

            <div className="camera-frame">
              <div className="scan-line" />
              <div className="face-guide">
                <span className="guide-head" />
                <span className="guide-eye" />
                <span className="guide-chin" />
                <span className="guide-shoulder" />
              </div>
              <div className="focus-corner corner-a" />
              <div className="focus-corner corner-b" />
              <div className="focus-corner corner-c" />
              <div className="focus-corner corner-d" />
            </div>

            <div className="studio-meta">
              <span>Camera-ready foundation</span>
              <strong>Local-first</strong>
            </div>
          </div>

          <div className="feature-pills">
            <span>Live Camera</span>
            <span>Overlay Guide</span>
            <span>Local API</span>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
