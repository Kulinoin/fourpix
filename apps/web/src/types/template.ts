export type TemplateCanvas = {
  width: number
  height: number
  ratio: string
}

export type FaceGuide = {
  centerX: number
  headTopY: number
  eyeY: number
  chinY: number
  safeHeadWidth: number
  safeHeadHeight: number
}

export type NeckAnchor = {
  x: number
  y: number
}

export type ShoulderGuide = {
  leftX: number
  rightX: number
  y: number
}

export type SubjectInitialTransform = {
  x: number
  y: number
  scale: number
  rotation: number
}

export type AdjustmentLimits = {
  minScale: number
  maxScale: number
  minRotation: number
  maxRotation: number
  maxTranslateX: number
  maxTranslateY: number
}

export type TemplateSummary = {
  id: string
  name: string
  category: string
  thumbnailUrl: string
  overlayGuideUrl: string
  overlayPreviewUrl: string
  canvas: TemplateCanvas
  faceGuide: FaceGuide
  neckAnchor: NeckAnchor
  shoulderGuide: ShoulderGuide
  subjectInitialTransform: SubjectInitialTransform
  adjustmentLimits: AdjustmentLimits
  exportProfiles: string[]
}
