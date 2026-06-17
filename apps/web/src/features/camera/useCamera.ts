import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CameraDeviceInfo, CameraStatus } from './cameraTypes'

const hasCameraSupport = () =>
  typeof navigator !== 'undefined' &&
  Boolean(navigator.mediaDevices?.getUserMedia)

const stopMediaStream = (mediaStream: MediaStream | null) => {
  mediaStream?.getTracks().forEach((track) => track.stop())
}

const getCameraErrorMessage = (error: unknown) => {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'Izin kamera ditolak. Izinkan akses kamera di browser, lalu coba lagi.'
    }

    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return 'Kamera tidak ditemukan. Sambungkan kamera atau gunakan mode upload foto di slice berikutnya.'
    }

    if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return 'Kamera tidak bisa dibuka. Kemungkinan sedang dipakai aplikasi lain.'
    }

    if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
      return 'Kamera yang dipilih tidak mendukung konfigurasi yang diminta.'
    }

    if (error.name === 'SecurityError') {
      return 'Akses kamera diblokir oleh browser. Gunakan localhost atau koneksi aman.'
    }
  }

  return 'Kamera gagal dibuka. Periksa izin browser dan perangkat kamera.'
}

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [devices, setDevices] = useState<CameraDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const supportsCamera = useMemo(() => hasCameraSupport(), [])

  const loadDevices = useCallback(async () => {
    if (!supportsCamera || !navigator.mediaDevices?.enumerateDevices) {
      setDevices([])
      return []
    }

    const mediaDevices = await navigator.mediaDevices.enumerateDevices()
    const cameraDevices = mediaDevices
      .filter((device) => device.kind === 'videoinput')
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Kamera ${index + 1}`,
        kind: 'videoinput' as const,
      }))

    setDevices(cameraDevices)

    if (!selectedDeviceId && cameraDevices[0]?.deviceId) {
      setSelectedDeviceId(cameraDevices[0].deviceId)
    }

    return cameraDevices
  }, [selectedDeviceId, supportsCamera])

  const stopCamera = useCallback(() => {
    stopMediaStream(stream)
    setStream(null)

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }

    setStatus('stopped')
  }, [stream])

  const startCamera = useCallback(
    async (deviceId?: string) => {
      if (!supportsCamera) {
        setStatus('error')
        setErrorMessage('Browser ini belum mendukung akses kamera via MediaDevices/getUserMedia.')
        return
      }

      setStatus('requesting')
      setErrorMessage(null)

      try {
        stopMediaStream(stream)

        const targetDeviceId = deviceId || selectedDeviceId
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: targetDeviceId
            ? {
                deviceId: { exact: targetDeviceId },
              }
            : {
                width: { ideal: 1280 },
                height: { ideal: 960 },
                facingMode: 'user',
              },
        }

        const nextStream = await navigator.mediaDevices.getUserMedia(constraints)
        setStream(nextStream)

        if (videoRef.current) {
          videoRef.current.srcObject = nextStream
          await videoRef.current.play().catch(() => undefined)
        }

        setStatus('active')
        await loadDevices()
      } catch (error) {
        stopMediaStream(stream)
        setStream(null)

        if (videoRef.current) {
          videoRef.current.srcObject = null
        }

        setStatus('error')
        setErrorMessage(getCameraErrorMessage(error))
      }
    },
    [loadDevices, selectedDeviceId, stream, supportsCamera],
  )

  const switchCamera = useCallback(
    async (deviceId: string) => {
      setSelectedDeviceId(deviceId)

      if (status === 'active' || status === 'requesting') {
        await startCamera(deviceId)
      }
    },
    [startCamera, status],
  )

  useEffect(() => {
    void loadDevices().catch(() => undefined)
  }, [loadDevices])

  useEffect(() => {
    return () => {
      stopMediaStream(stream)
    }
  }, [stream])

  return {
    videoRef,
    devices,
    selectedDeviceId,
    status,
    errorMessage,
    supportsCamera,
    startCamera,
    stopCamera,
    switchCamera,
  }
}
