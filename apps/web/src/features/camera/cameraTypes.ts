export type CameraStatus = 'idle' | 'requesting' | 'active' | 'stopped' | 'error'

export type CameraDeviceInfo = {
  deviceId: string
  label: string
  kind: 'videoinput'
}
