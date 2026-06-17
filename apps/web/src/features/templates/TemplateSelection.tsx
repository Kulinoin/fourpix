import type { TemplateSummary } from '../../types/template'
import { toApiAssetUrl } from './templateApi'

type TemplateSelectionProps = {
  templates: TemplateSummary[]
  selectedTemplateId: string | null
  isLoading: boolean
  error: string | null
  onSelect: (template: TemplateSummary) => void
  onRetry: () => void
}

export function TemplateSelection({
  templates,
  selectedTemplateId,
  isLoading,
  error,
  onSelect,
  onRetry,
}: TemplateSelectionProps) {
  if (isLoading) {
    return (
      <section className="panel">
        <p className="eyebrow">Template Registry</p>
        <h2>Memuat template...</h2>
        <p className="muted">4Pix sedang membaca folder template lokal.</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="panel panel-danger">
        <p className="eyebrow">Template Registry</p>
        <h2>Template belum bisa dimuat</h2>
        <p>{error}</p>
        <button type="button" className="button" onClick={onRetry}>
          Coba Lagi
        </button>
      </section>
    )
  }

  if (templates.length === 0) {
    return (
      <section className="panel">
        <p className="eyebrow">Template Registry</p>
        <h2>Belum ada template valid</h2>
        <p className="muted">
          Template invalid akan dilewati agar aplikasi tidak crash. Pastikan folder templates berisi template.json dan asset PNG sesuai spec.
        </p>
      </section>
    )
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Template Registry</p>
          <h2>Pilih Template Formal</h2>
        </div>
        <span className="count-pill">{templates.length} valid</span>
      </div>

      <div className="template-grid">
        {templates.map((template) => {
          const selected = selectedTemplateId === template.id

          return (
            <button
              key={template.id}
              type="button"
              className={`template-card ${selected ? 'template-card-selected' : ''}`}
              onClick={() => onSelect(template)}
            >
              <img
                src={toApiAssetUrl(template.thumbnailUrl)}
                alt={template.name}
                className="template-thumbnail"
              />

              <span className="template-name">{template.name}</span>
              <span className="template-meta">
                {template.category} · {template.canvas.width}×{template.canvas.height} · {template.canvas.ratio}
              </span>
              <span className="template-profiles">
                Export: {template.exportProfiles.join(', ')}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
