import { useState } from 'react'
import type { TemplateSummary } from '../../types/templates'
import { useCamera } from './useCamera'
import { CameraOverlay, OverlayModeToggle, type OverlayMode } from '../overlay'

type CameraModeProps = {
  template: TemplateSummary
  onBack: () => void
}

const statusText = {
  idle: 'Belum aktif',
  requesting: 'Meminta izin kamera',
  active: 'Kamera aktif',
  stopped: 'Kamera dihentikan',
  error: 'Kamera error',
}

export const CameraMode = ({ template, onBack }: CameraModeProps) => {
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('guide')
  const {
    videoRef,
    devices,
    selectedDeviceId,
    status,
    errorMessage,
    supportsCamera,
    startCamera,
    stopCamera,
    switchCamera,
  } = useCamera()

  const isActive = status === 'active'
  const isBusy = status === 'requesting'

  return (
    <section className="camera-mode">
      <div className="camera-topbar">
        <button className="ghost-button" type="button" onClick={onBack}>
          ← Kembali pilih template
        </button>

        <div className={`camera-status camera-status--${status}`}>
          <span />
          {statusText[status]}
        </div>
      </div>

      <div className="camera-layout">
        <div className="camera-preview-card">
          <div className="camera-preview camera-preview--with-overlay">
            <OverlayModeToggle
              mode={overlayMode}
              onChange={setOverlayMode}
              disabled={!isActive}
            />

            <video
              ref={videoRef}
              className="camera-video"
              autoPlay
              playsInline
              muted
            />

            {isActive && <CameraOverlay mode={overlayMode} template={template} />}

            {!isActive && (
              <div className="camera-empty-state">
                <p className="camera-empty-title">Live camera belum aktif</p>
                <p>
                  Klik <strong>Start Camera</strong> untuk membuka liveview.
                  Overlay guide/template aktif setelah kamera berjalan.
                </p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="camera-error" role="alert">
              {errorMessage}
            </div>
          )}

          {!supportsCamera && (
            <div className="camera-error" role="alert">
              Browser ini belum mendukung akses kamera. Coba gunakan Chrome,
              Edge, atau browser modern lain melalui localhost.
            </div>
          )}
        </div>

        <aside className="camera-panel">
          <div className="panel-card">
            <p className="panel-eyebrow">Template aktif</p>
            <h2>{template.name}</h2>
            <p className="muted-text">
              ID: <code>{template.id}</code>
            </p>
            <p className="muted-text">
              Category: <code>{template.category}</code>
            </p>
          </div>

          <div className="panel-card">
            <p className="panel-eyebrow">Kontrol kamera</p>

            <label className="field-label" htmlFor="camera-device">
              Camera device
            </label>
            <select
              id="camera-device"
              className="camera-select"
              value={selectedDeviceId}
              disabled={devices.length === 0 || isBusy}
              onChange={(event) => {
                void switchCamera(event.target.value)
              }}
            >
              {devices.length === 0 ? (
                <option value="">Device belum terbaca</option>
              ) : (
                devices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))
              )}
            </select>

            <div className="camera-actions">
              <button
                className="primary-button"
                type="button"
                disabled={isBusy || !supportsCamera}
                onClick={() => {
                  void startCamera()
                }}
              >
                {isBusy ? 'Membuka kamera...' : 'Start Camera'}
              </button>

              <button
                className="secondary-button"
                type="button"
                disabled={!isActive}
                onClick={stopCamera}
              >
                Stop Camera
              </button>
            </div>
          </div>

          <div className="panel-card panel-card--soft">
            <p className="panel-eyebrow">Catatan Slice 02</p>
            <ul className="mini-list">
              <li>Liveview kamera aktif dari browser.</li>
              <li>Overlay guide/template tampil dari asset template.</li>
              <li>Capture foto masuk Slice 04.</li>
              <li>Proses foto tetap local-first.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}
