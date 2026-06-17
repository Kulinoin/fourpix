import type { OverlayMode } from './overlayTypes'

type OverlayModeToggleProps = {
  mode: OverlayMode
  onChange: (mode: OverlayMode) => void
  disabled?: boolean
}

const overlayModeOptions: Array<{
  value: OverlayMode
  label: string
  description: string
}> = [
  {
    value: 'guide',
    label: 'Guide',
    description: 'Panduan kepala, wajah, dagu, dan bahu.',
  },
  {
    value: 'template',
    label: 'Template',
    description: 'Preview jas/dasi transparan dari template.',
  },
]

export function OverlayModeToggle({
  mode,
  onChange,
  disabled = false,
}: OverlayModeToggleProps) {
  return (
    <div className="overlay-mode-toggle" aria-label="Pilih mode overlay">
      <div className="overlay-mode-toggle__label">
        <span>Overlay</span>
        <small>{disabled ? 'Kamera belum aktif' : 'Tampil di atas liveview'}</small>
      </div>

      <div className="overlay-mode-toggle__buttons" role="group">
        {overlayModeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={[
              'overlay-mode-toggle__button',
              mode === option.value ? 'overlay-mode-toggle__button--active' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={mode === option.value}
            title={option.description}
            disabled={disabled}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
