export type OverlayMode = 'guide' | 'template'

export type OverlayTemplateAssetSource = {
  id?: string
  name: string
  overlayGuideUrl?: string | null
  overlayPreviewUrl?: string | null
}
