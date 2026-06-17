import { resolveApiAssetUrl } from '../../lib/apiBaseUrl'
import type { OverlayMode, OverlayTemplateAssetSource } from './overlayTypes'

type CameraOverlayProps = {
  mode: OverlayMode
  template: OverlayTemplateAssetSource
}

export function CameraOverlay({ mode, template }: CameraOverlayProps) {
  const overlayUrl =
    mode === 'guide' ? template.overlayGuideUrl : template.overlayPreviewUrl

  const overlayLabel =
    mode === 'guide'
      ? `Guide overlay ${template.name}`
      : `Template overlay ${template.name}`

  if (!overlayUrl) {
    return (
      <div className="camera-overlay camera-overlay--empty" aria-hidden="true">
        <div className="camera-overlay__empty-note">
          Asset overlay belum tersedia
        </div>
      </div>
    )
  }

  const resolvedOverlayUrl = resolveApiAssetUrl(overlayUrl)

  return (
    <div className="camera-overlay" aria-hidden="true">
      <img
        className={[
          'camera-overlay__image',
          mode === 'guide'
            ? 'camera-overlay__image--guide'
            : 'camera-overlay__image--template',
        ].join(' ')}
        src={resolvedOverlayUrl}
        alt={overlayLabel}
        draggable={false}
        onError={(event) => {
          event.currentTarget.style.display = 'none'
          console.warn(`Overlay asset gagal dimuat: ${resolvedOverlayUrl}`)
        }}
      />
    </div>
  )
}
