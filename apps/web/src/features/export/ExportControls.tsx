import { useState } from 'react'

import {
  downloadBlob,
  exportFinalImage,
  EXPORT_PROFILES,
  type ExportFormat,
  type ExportProfileId,
} from '../../lib/exportApi'

import './ExportControls.css'

type ExportControlsProps = {
  imageUrl: string | null | undefined
  disabled?: boolean
}

export function ExportControls({ imageUrl, disabled = false }: ExportControlsProps) {
  const [profileId, setProfileId] = useState<ExportProfileId>('3x4')
  const [isExporting, setIsExporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const canExport = Boolean(imageUrl) && !disabled && !isExporting

  async function handleExport(format: ExportFormat) {
    if (!imageUrl) {
      setErrorMessage('Preview final belum tersedia untuk diexport.')
      return
    }

    setErrorMessage(null)
    setIsExporting(true)

    try {
      const sourceResponse = await fetch(imageUrl)
      if (!sourceResponse.ok) {
        throw new Error('Preview final tidak bisa dibaca.')
      }

      const imageBlob = await sourceResponse.blob()
      const exported = await exportFinalImage({
        imageBlob,
        profileId,
        format,
      })

      downloadBlob(exported.blob, exported.filename)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export gagal diproses.'
      setErrorMessage(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section className="export-controls" aria-label="Export pas foto">
      <div className="export-controls__header">
        <div>
          <p className="export-controls__eyebrow">Export</p>
          <h3>Download JPG / PNG</h3>
        </div>
        <span className="export-controls__badge">fourpix-*</span>
      </div>

      <label className="export-controls__field">
        <span>Ukuran pas foto</span>
        <select
          value={profileId}
          onChange={(event) => setProfileId(event.target.value as ExportProfileId)}
          disabled={isExporting}
        >
          {EXPORT_PROFILES.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.name} · {profile.widthPx}×{profile.heightPx}px
            </option>
          ))}
        </select>
      </label>

      <div className="export-controls__actions">
        <button type="button" onClick={() => void handleExport('jpg')} disabled={!canExport}>
          {isExporting ? 'Mengexport…' : 'Export JPG'}
        </button>
        <button type="button" onClick={() => void handleExport('png')} disabled={!canExport}>
          {isExporting ? 'Mengexport…' : 'Export PNG'}
        </button>
      </div>

      {!imageUrl ? (
        <p className="export-controls__hint">Export aktif setelah preview compositing tersedia.</p>
      ) : null}

      {errorMessage ? <p className="export-controls__error">{errorMessage}</p> : null}
    </section>
  )
}
