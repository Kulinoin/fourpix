import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  captureVideoFrame,
  createPhotoInputFromFile,
  revokePhotoInput,
  type PhotoInput,
} from "../capture/captureImage";
import { PhotoInputPreview } from "../capture/PhotoInputPreview";
import { removeBackground } from "../../lib/backgroundRemovalApi";
import { composeTemplate, type ComposeTransform } from "../../lib/compositingApi";
import "./CameraMode.css";
import { ExportControls } from '../export/ExportControls'

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://127.0.0.1:8404";

type AdjustmentLimits = {
  minScale: number;
  maxScale: number;
  minRotation: number;
  maxRotation: number;
  maxTranslateX: number;
  maxTranslateY: number;
};

type CameraTemplate = {
  id: string;
  name: string;
  category?: string;
  overlayGuideUrl?: string;
  overlayPreviewUrl?: string;
  thumbnailUrl?: string;
  assets?: {
    overlayGuide?: string;
    overlayPreview?: string;
    overlayGuideUrl?: string;
    overlayPreviewUrl?: string;
  };
  adjustmentLimits?: Partial<AdjustmentLimits>;
};

type OverlayMode = "guide" | "template" | "none";
type CameraStatus = "idle" | "starting" | "active" | "error";

type CameraModeProps = {
  selectedTemplate?: CameraTemplate | null;
  template?: CameraTemplate | null;
  onBack?: () => void;
  onBackToTemplates?: () => void;
  onBackToTemplateSelect?: () => void;
  onBackToHome?: () => void;
  onPhotoReady?: (photoInput: PhotoInput) => void;
  onPhotoInputReady?: (photoInput: PhotoInput) => void;
};

const DEFAULT_ADJUSTMENT: ComposeTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
};

const DEFAULT_ADJUSTMENT_LIMITS: AdjustmentLimits = {
  minScale: 0.75,
  maxScale: 1.35,
  minRotation: -10,
  maxRotation: 10,
  maxTranslateX: 220,
  maxTranslateY: 260,
};

const BACKGROUND_PRESETS = [
  { label: "Merah", value: "#E53935" },
  { label: "Biru", value: "#1E40AF" },
  { label: "Putih", value: "#FFFFFF" },
  { label: "Abu", value: "#E5E7EB" },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Terjadi error yang tidak diketahui.";
}

function getCameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Izin kamera ditolak. Aktifkan permission kamera di browser atau gunakan Upload Photo.";
    }

    if (error.name === "NotFoundError") {
      return "Kamera tidak ditemukan. Sambungkan kamera atau gunakan Upload Photo.";
    }

    if (error.name === "NotReadableError") {
      return "Kamera sedang dipakai aplikasi lain. Tutup aplikasi lain lalu coba lagi.";
    }

    if (error.name === "OverconstrainedError") {
      return "Kamera tidak cocok dengan pengaturan yang diminta. Coba pilih kamera lain.";
    }
  }

  return getErrorMessage(error);
}

function isAbsoluteAssetUrl(url: string): boolean {
  return /^(https?:|blob:|data:)/i.test(url);
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function resolveTemplateAssetUrl(
  template: CameraTemplate | null,
  assetUrl: string | undefined,
): string | null {
  if (!assetUrl) return null;

  if (isAbsoluteAssetUrl(assetUrl)) {
    return assetUrl;
  }

  if (assetUrl.startsWith("/")) {
    return joinUrl(API_BASE_URL, assetUrl);
  }

  if (template?.id) {
    return joinUrl(API_BASE_URL, `/templates/${template.id}/${assetUrl}`);
  }

  return joinUrl(API_BASE_URL, assetUrl);
}

function getOverlayAssetSource(
  template: CameraTemplate | null,
  overlayMode: OverlayMode,
): string | null {
  if (!template || overlayMode === "none") return null;

  if (overlayMode === "guide") {
    return (
      template.overlayGuideUrl ??
      template.assets?.overlayGuideUrl ??
      template.assets?.overlayGuide ??
      null
    );
  }

  return (
    template.overlayPreviewUrl ??
    template.assets?.overlayPreviewUrl ??
    template.assets?.overlayPreview ??
    null
  );
}

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getAdjustmentLimits(template: CameraTemplate | null): AdjustmentLimits {
  const limits = template?.adjustmentLimits ?? {};

  return {
    minScale: finiteOr(limits.minScale, DEFAULT_ADJUSTMENT_LIMITS.minScale),
    maxScale: finiteOr(limits.maxScale, DEFAULT_ADJUSTMENT_LIMITS.maxScale),
    minRotation: finiteOr(limits.minRotation, DEFAULT_ADJUSTMENT_LIMITS.minRotation),
    maxRotation: finiteOr(limits.maxRotation, DEFAULT_ADJUSTMENT_LIMITS.maxRotation),
    maxTranslateX: Math.abs(
      finiteOr(limits.maxTranslateX, DEFAULT_ADJUSTMENT_LIMITS.maxTranslateX),
    ),
    maxTranslateY: Math.abs(
      finiteOr(limits.maxTranslateY, DEFAULT_ADJUSTMENT_LIMITS.maxTranslateY),
    ),
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function clampTransform(transform: ComposeTransform, limits: AdjustmentLimits): ComposeTransform {
  return {
    x: clamp(transform.x, -limits.maxTranslateX, limits.maxTranslateX),
    y: clamp(transform.y, -limits.maxTranslateY, limits.maxTranslateY),
    scale: clamp(transform.scale, limits.minScale, limits.maxScale),
    rotation: clamp(transform.rotation, limits.minRotation, limits.maxRotation),
  };
}

export function CameraMode({
  selectedTemplate,
  template,
  onBack,
  onBackToTemplates,
  onBackToTemplateSelect,
  onBackToHome,
  onPhotoReady,
  onPhotoInputReady,
}: CameraModeProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const currentPhotoInputRef = useRef<PhotoInput | null>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>("guide");
  const [overlayAssetError, setOverlayAssetError] = useState<string | null>(null);

  const [photoInput, setPhotoInput] = useState<PhotoInput | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [backgroundColor, setBackgroundColor] = useState("#E53935");
  const [adjustment, setAdjustment] = useState<ComposeTransform>(DEFAULT_ADJUSTMENT);
  const [removedSubjectBlob, setRemovedSubjectBlob] = useState<Blob | null>(null);
  const [removedSubjectUrl, setRemovedSubjectUrl] = useState<string | null>(null);
  const [compositePreviewUrl, setCompositePreviewUrl] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const activeTemplate = useMemo(
    () => selectedTemplate ?? template ?? null,
    [selectedTemplate, template],
  );

  const handleBack = onBack ?? onBackToTemplates ?? onBackToTemplateSelect ?? onBackToHome;

  const adjustmentLimits = useMemo(
    () => getAdjustmentLimits(activeTemplate),
    [activeTemplate],
  );

  const overlayAssetSource = getOverlayAssetSource(activeTemplate, overlayMode);
  const overlayImageUrl = resolveTemplateAssetUrl(activeTemplate, overlayAssetSource ?? undefined);
  const shouldShowGeneratedGuide =
    overlayMode === "guide" && (!overlayImageUrl || Boolean(overlayAssetError));
  const canCapture = cameraStatus === "active" && !isCapturing;
  const canProcess = Boolean(photoInput && activeTemplate?.id) && !isRemovingBackground;

  const emitPhotoInput = useCallback(
    (nextPhotoInput: PhotoInput) => {
      onPhotoReady?.(nextPhotoInput);
      onPhotoInputReady?.(nextPhotoInput);
    },
    [onPhotoInputReady, onPhotoReady],
  );

  const clearProcessingOutputs = useCallback(() => {
    setRemovedSubjectBlob(null);
    setRemovedSubjectUrl(null);
    setCompositePreviewUrl(null);
    setProcessingError(null);
  }, []);

  const replacePhotoInput = useCallback(
    (nextPhotoInput: PhotoInput | null) => {
      if (
        currentPhotoInputRef.current &&
        currentPhotoInputRef.current.objectUrl !== nextPhotoInput?.objectUrl
      ) {
        revokePhotoInput(currentPhotoInputRef.current);
      }

      currentPhotoInputRef.current = nextPhotoInput;
      setPhotoInput(nextPhotoInput);
      clearProcessingOutputs();
      setAdjustment(DEFAULT_ADJUSTMENT);

      if (nextPhotoInput) {
        emitPhotoInput(nextPhotoInput);
      }
    },
    [clearProcessingOutputs, emitPhotoInput],
  );

  const stopActiveStream = useCallback(() => {
    activeStreamRef.current?.getTracks().forEach((track) => track.stop());
    activeStreamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    stopActiveStream();
    setCameraStatus("idle");
  }, [stopActiveStream]);

  const loadCameraDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setDevices([]);
      return;
    }

    const mediaDevices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = mediaDevices.filter((device) => device.kind === "videoinput");
    setDevices(videoDevices);

    if (!selectedDeviceId) {
      const firstDeviceId = videoDevices.find((device) => device.deviceId)?.deviceId;
      if (firstDeviceId) {
        setSelectedDeviceId(firstDeviceId);
      }
    }
  }, [selectedDeviceId]);

  const startCamera = useCallback(
    async (deviceId?: string) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus("error");
        setCameraError(
          "Browser ini belum mendukung akses kamera. Gunakan browser modern atau Upload Photo.",
        );
        return;
      }

      setCameraStatus("starting");
      setCameraError(null);
      stopActiveStream();

      try {
        const videoConstraints: MediaTrackConstraints = deviceId
          ? {
              deviceId: { exact: deviceId },
              width: { ideal: 1080 },
              height: { ideal: 1440 },
              aspectRatio: { ideal: 0.75 },
            }
          : {
              facingMode: "user",
              width: { ideal: 1080 },
              height: { ideal: 1440 },
              aspectRatio: { ideal: 0.75 },
            };

        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });

        activeStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const activeDeviceId = stream.getVideoTracks()[0]?.getSettings().deviceId ?? "";
        if (activeDeviceId && !selectedDeviceId) {
          setSelectedDeviceId(activeDeviceId);
        }

        setCameraStatus("active");
        await loadCameraDevices();
      } catch (error) {
        stopActiveStream();
        setCameraStatus("error");
        setCameraError(getCameraErrorMessage(error));
      }
    },
    [loadCameraDevices, selectedDeviceId, stopActiveStream],
  );

  useEffect(() => {
    void startCamera(selectedDeviceId || undefined);

    return () => {
      stopActiveStream();
    };
  }, [selectedDeviceId, startCamera, stopActiveStream]);

  useEffect(() => {
    setOverlayAssetError(null);
  }, [activeTemplate?.id, overlayMode, overlayImageUrl]);

  useEffect(() => {
    setAdjustment((current) => clampTransform(current, adjustmentLimits));
  }, [
    adjustmentLimits.maxRotation,
    adjustmentLimits.maxScale,
    adjustmentLimits.maxTranslateX,
    adjustmentLimits.maxTranslateY,
    adjustmentLimits.minRotation,
    adjustmentLimits.minScale,
  ]);

  useEffect(() => {
    return () => {
      revokePhotoInput(currentPhotoInputRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (removedSubjectUrl) {
        URL.revokeObjectURL(removedSubjectUrl);
      }
    };
  }, [removedSubjectUrl]);

  useEffect(() => {
    return () => {
      if (compositePreviewUrl) {
        URL.revokeObjectURL(compositePreviewUrl);
      }
    };
  }, [compositePreviewUrl]);

  useEffect(() => {
    if (!removedSubjectBlob || !activeTemplate?.id) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setIsComposing(true);
      setProcessingError(null);

      try {
        const outputBlob = await composeTemplate({
          subjectBlob: removedSubjectBlob,
          templateId: activeTemplate.id,
          backgroundColor,
          transform: adjustment,
        });

        if (!cancelled) {
          setCompositePreviewUrl(URL.createObjectURL(outputBlob));
        }
      } catch (error) {
        if (!cancelled) {
          setProcessingError(getErrorMessage(error));
          setCompositePreviewUrl(null);
        }
      } finally {
        if (!cancelled) {
          setIsComposing(false);
        }
      }
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    activeTemplate?.id,
    adjustment.rotation,
    adjustment.scale,
    adjustment.x,
    adjustment.y,
    backgroundColor,
    removedSubjectBlob,
  ]);

  const handleCapture = useCallback(async () => {
    if (!videoRef.current) {
      setInputError("Liveview kamera belum tersedia.");
      return;
    }

    setIsCapturing(true);
    setInputError(null);

    try {
      const nextPhotoInput = await captureVideoFrame(videoRef.current, {
        mimeType: "image/png",
      });
      replacePhotoInput(nextPhotoInput);
    } catch (error) {
      setInputError(getErrorMessage(error));
    } finally {
      setIsCapturing(false);
    }
  }, [replacePhotoInput]);

  const handleUploadChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file) return;

      setIsUploading(true);
      setInputError(null);

      try {
        const nextPhotoInput = await createPhotoInputFromFile(file);
        replacePhotoInput(nextPhotoInput);
      } catch (error) {
        setInputError(getErrorMessage(error));
      } finally {
        setIsUploading(false);
      }
    },
    [replacePhotoInput],
  );

  const handleProcessPhoto = useCallback(async () => {
    if (!photoInput) {
      setProcessingError("Ambil foto atau upload JPG/PNG dulu sebelum compositing.");
      return;
    }

    if (!activeTemplate?.id) {
      setProcessingError("Template belum dipilih.");
      return;
    }

    setIsRemovingBackground(true);
    setProcessingError(null);
    setCompositePreviewUrl(null);

    try {
      const outputBlob = await removeBackground(photoInput.blob, photoInput.fileName);
      setRemovedSubjectBlob(outputBlob);
      setRemovedSubjectUrl(URL.createObjectURL(outputBlob));
    } catch (error) {
      setRemovedSubjectBlob(null);
      setRemovedSubjectUrl(null);
      setCompositePreviewUrl(null);
      setProcessingError(getErrorMessage(error));
    } finally {
      setIsRemovingBackground(false);
    }
  }, [activeTemplate?.id, photoInput]);

  const handleAdjustmentChange = useCallback(
    (key: keyof ComposeTransform, value: number) => {
      setAdjustment((current) =>
        clampTransform(
          {
            ...current,
            [key]: value,
          },
          adjustmentLimits,
        ),
      );
    },
    [adjustmentLimits],
  );

  const resetAdjustment = useCallback(() => {
    setAdjustment(DEFAULT_ADJUSTMENT);
  }, []);

  return (
    <main className="fourpix-camera-shell">
      <section className="fourpix-camera-header">
        <div>
          <p className="fourpix-kicker">4Pix Studio</p>
          <h1>Manual Adjustment Preview</h1>
          <p>
            Ambil atau upload foto, remove background lokal, lalu geser X/Y, zoom, rotate ringan,
            dan lihat preview compositing berubah otomatis.
          </p>
        </div>

        <div className="fourpix-header-actions">
          {activeTemplate ? (
            <span className="fourpix-template-pill">{activeTemplate.name}</span>
          ) : (
            <span className="fourpix-template-pill fourpix-template-pill-muted">
              Template belum dipilih
            </span>
          )}

          {handleBack ? (
            <button type="button" className="fourpix-secondary-button" onClick={handleBack}>
              Kembali
            </button>
          ) : null}
        </div>
      </section>

      <section className="fourpix-camera-grid">
        <article className="fourpix-card fourpix-live-card">
          <div className="fourpix-card-heading">
            <div>
              <p className="fourpix-section-label">Live Camera</p>
              <h2>Posisikan wajah sesuai overlay</h2>
            </div>
            <span className={`fourpix-status-pill fourpix-status-${cameraStatus}`}>
              {cameraStatus === "active"
                ? "Kamera aktif"
                : cameraStatus === "starting"
                  ? "Menyalakan kamera"
                  : cameraStatus === "error"
                    ? "Kamera error"
                    : "Kamera standby"}
            </span>
          </div>

          <div className="fourpix-live-frame">
            <video ref={videoRef} className="fourpix-live-video" playsInline muted />

            {cameraStatus !== "active" ? (
              <div className="fourpix-live-placeholder">
                {cameraStatus === "starting"
                  ? "Menyiapkan liveview kamera..."
                  : "Liveview belum aktif"}
              </div>
            ) : null}

            {overlayMode !== "none" && overlayImageUrl && !overlayAssetError ? (
              <img
                className="fourpix-overlay-image"
                src={overlayImageUrl}
                alt={
                  overlayMode === "guide"
                    ? "Overlay guide posisi wajah"
                    : "Overlay template transparan"
                }
                onError={() => {
                  setOverlayAssetError(
                    overlayMode === "guide"
                      ? "Overlay guide asset gagal dimuat, fallback guide aktif."
                      : "Overlay template asset gagal dimuat. Cek backend/template asset.",
                  );
                }}
              />
            ) : null}

            {shouldShowGeneratedGuide ? (
              <div className="fourpix-generated-guide" aria-hidden="true">
                <span className="fourpix-guide-center" />
                <span className="fourpix-guide-head" />
                <span className="fourpix-guide-eyes" />
                <span className="fourpix-guide-chin" />
                <span className="fourpix-guide-shoulder" />
              </div>
            ) : null}

            {overlayMode === "template" && overlayAssetError ? (
              <div className="fourpix-overlay-warning">{overlayAssetError}</div>
            ) : null}
          </div>

          {cameraError ? <p className="fourpix-error">{cameraError}</p> : null}
          {overlayMode === "guide" && overlayAssetError ? (
            <p className="fourpix-info">{overlayAssetError}</p>
          ) : null}

          <div className="fourpix-action-row">
            <button type="button" disabled={!canCapture} onClick={() => void handleCapture()}>
              {isCapturing ? "Mengambil foto..." : "Capture Foto"}
            </button>
            <button
              type="button"
              className="fourpix-secondary-button"
              onClick={() => void startCamera(selectedDeviceId || undefined)}
            >
              Restart Kamera
            </button>
            <button type="button" className="fourpix-secondary-button" onClick={stopCamera}>
              Stop Kamera
            </button>
          </div>

          <div className="fourpix-control-grid">
            <label>
              Kamera
              <select
                value={selectedDeviceId}
                onChange={(event) => setSelectedDeviceId(event.target.value)}
              >
                {devices.length === 0 ? (
                  <option value="">Default browser camera</option>
                ) : (
                  devices.map((device, index) => (
                    <option key={device.deviceId || index} value={device.deviceId}>
                      {device.label || `Kamera ${index + 1}`}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label>
              Overlay
              <select
                value={overlayMode}
                onChange={(event) => setOverlayMode(event.target.value as OverlayMode)}
              >
                <option value="guide">Guide Overlay</option>
                <option value="template">Template Transparan</option>
                <option value="none">Tanpa Overlay</option>
              </select>
            </label>
          </div>
        </article>

        <article className="fourpix-card">
          <div className="fourpix-card-heading">
            <div>
              <p className="fourpix-section-label">Upload Photo Mode</p>
              <h2>Input alternatif</h2>
            </div>
          </div>

          <p>
            Gunakan upload kalau kamera belum tersedia atau pelanggan sudah membawa file foto.
          </p>

          <input
            ref={uploadInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="fourpix-hidden-input"
            onChange={(event) => void handleUploadChange(event)}
            disabled={isUploading}
          />

          <div className="fourpix-action-row">
            <button
              type="button"
              className="fourpix-secondary-button"
              onClick={() => uploadInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Membaca file..." : "Pilih JPG/PNG"}
            </button>
          </div>

          {inputError ? <p className="fourpix-error">{inputError}</p> : null}

          <PhotoInputPreview photoInput={photoInput} onClear={() => replacePhotoInput(null)} />

          <button
            type="button"
            className="fourpix-process-button"
            disabled={!canProcess}
            onClick={() => void handleProcessPhoto()}
          >
            {isRemovingBackground ? "Remove background lokal..." : "Process ke Preview Compositing"}
          </button>

          {processingError ? <p className="fourpix-error">{processingError}</p> : null}
        </article>
      </section>

      <section className="fourpix-editor-grid">
        <article className="fourpix-card fourpix-adjustment-card">
          <div className="fourpix-card-heading">
            <div>
              <p className="fourpix-section-label">Slice 07</p>
              <h2>Manual Adjustment</h2>
            </div>
            <button type="button" className="fourpix-secondary-button" onClick={resetAdjustment}>
              Reset
            </button>
          </div>

          <div className="fourpix-background-picker">
            <span>Background</span>
            <div className="fourpix-preset-row">
              {BACKGROUND_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={preset.value === backgroundColor ? "fourpix-preset active" : "fourpix-preset"}
                  onClick={() => setBackgroundColor(preset.value)}
                  style={{ backgroundColor: preset.value }}
                  aria-label={`Pilih background ${preset.label}`}
                  title={preset.label}
                />
              ))}
              <label className="fourpix-color-field">
                Custom
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(event) => setBackgroundColor(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="fourpix-slider-stack">
            <label>
              <span>
                Geser X <strong>{Math.round(adjustment.x)} px</strong>
              </span>
              <input
                type="range"
                min={-adjustmentLimits.maxTranslateX}
                max={adjustmentLimits.maxTranslateX}
                step="1"
                value={adjustment.x}
                onChange={(event) => handleAdjustmentChange("x", Number(event.target.value))}
              />
            </label>

            <label>
              <span>
                Geser Y <strong>{Math.round(adjustment.y)} px</strong>
              </span>
              <input
                type="range"
                min={-adjustmentLimits.maxTranslateY}
                max={adjustmentLimits.maxTranslateY}
                step="1"
                value={adjustment.y}
                onChange={(event) => handleAdjustmentChange("y", Number(event.target.value))}
              />
            </label>

            <label>
              <span>
                Scale / Zoom <strong>{adjustment.scale.toFixed(2)}×</strong>
              </span>
              <input
                type="range"
                min={adjustmentLimits.minScale}
                max={adjustmentLimits.maxScale}
                step="0.01"
                value={adjustment.scale}
                onChange={(event) => handleAdjustmentChange("scale", Number(event.target.value))}
              />
            </label>

            <label>
              <span>
                Rotate <strong>{adjustment.rotation.toFixed(0)}°</strong>
              </span>
              <input
                type="range"
                min={adjustmentLimits.minRotation}
                max={adjustmentLimits.maxRotation}
                step="1"
                value={adjustment.rotation}
                onChange={(event) => handleAdjustmentChange("rotation", Number(event.target.value))}
              />
            </label>
          </div>

          <div className="fourpix-transform-readout">
            <code>
              x={Math.round(adjustment.x)} y={Math.round(adjustment.y)} scale=
              {adjustment.scale.toFixed(2)} rotate={adjustment.rotation.toFixed(0)}°
            </code>
          </div>
        </article>

        <article className="fourpix-card">
          <div className="fourpix-card-heading">
            <div>
              <p className="fourpix-section-label">Preview Compositing</p>
              <h2>Hasil akhir sementara</h2>
            </div>
            {isComposing ? <span className="fourpix-status-pill fourpix-status-starting">Rendering...</span> : null}
          </div>

          <div className="fourpix-preview-grid">
            <div className="fourpix-preview-box fourpix-transparent-preview">
              <strong>PNG transparan</strong>
              {removedSubjectUrl ? (
                <img src={removedSubjectUrl} alt="Subject setelah remove background" />
              ) : (
                <span>Belum diproses</span>
              )}
            </div>

            <div className="fourpix-preview-box">
              <strong>Composited preview</strong>
              {compositePreviewUrl ? (
                <img src={compositePreviewUrl} alt="Preview compositing 4Pix Studio" />
              ) : (
                <span>Preview muncul setelah proses compositing</span>
              )}
            </div>
          </div>

          <p className="fourpix-info">
            Adjustment X/Y, scale, rotate, reset, dan background color akan memicu ulang preview
            compositing. Export final tetap masuk Slice 08.
          </p>
        </article>
      </section>
    
      <ExportControls imageUrl={compositePreviewUrl} disabled={!compositePreviewUrl} />
</main>
  );
}

export default CameraMode;
