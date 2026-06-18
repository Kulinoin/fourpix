import { type ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  captureVideoFrame,
  createPhotoInputFromFile,
  revokePhotoInput,
  type PhotoInput,
} from "../capture/captureImage";
import { PhotoInputPreview } from "../capture/PhotoInputPreview";
import { removeBackground } from "../../lib/backgroundRemovalApi";

const API_BASE_URL =

  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://127.0.0.1:8404";

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


function FourpixSlice05Panel() {
  const [sourceBlob, setSourceBlob] = useState<Blob | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [sourceUrl, resultUrl]);

  const onUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) return;

    const isValidImage =
      ["image/jpeg", "image/png"].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);

    if (!isValidImage) {
      setError("File tidak valid. Gunakan JPG atau PNG.");
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setError("Ukuran file terlalu besar. Maksimal 12 MB untuk MVP.");
      return;
    }

    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);

    setSourceBlob(file);
    setSourceUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setError("");
  };

  const onProcess = async () => {
    if (!sourceBlob) {
      setError("Upload foto dulu sebelum remove background.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const outputBlob = await removeBackground(sourceBlob, "fourpix-upload.png");
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(outputBlob));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove background gagal.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="fourpix-slice05-panel">
      <div className="fourpix-slice05-note">
        Standar capture disarankan: background putih atau terang bersih, pencahayaan rata, dan hindari backlight.
      </div>

      <div className="fourpix-slice05-actions">
        <label className="fourpix-slice05-upload">
          Upload JPG/PNG
          <input type="file" accept="image/png,image/jpeg" onChange={onUpload} />
        </label>

        <button type="button" onClick={onProcess} disabled={!sourceBlob || isProcessing}>
          {isProcessing ? "Memproses lokal..." : "Remove Background Lokal"}
        </button>
      </div>

      {error ? <p className="fourpix-slice05-error">{error}</p> : null}

      <div className="fourpix-slice05-preview-grid">
        <div className="fourpix-slice05-preview">
          <strong>Input</strong>
          {sourceUrl ? <img src={sourceUrl} alt="Input foto" /> : <span>Belum ada foto</span>}
        </div>

        <div className="fourpix-slice05-preview fourpix-slice05-transparent">
          <strong>PNG Transparan</strong>
          {resultUrl ? <img src={resultUrl} alt="Hasil remove background" /> : <span>Belum diproses</span>}
        </div>
      </div>
    </section>
  );
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

  const activeTemplate = useMemo(
    () => selectedTemplate ?? template ?? null,
    [selectedTemplate, template],
  );

  const handleBack = onBack ?? onBackToTemplates ?? onBackToTemplateSelect ?? onBackToHome;

  const overlayAssetSource = getOverlayAssetSource(activeTemplate, overlayMode);
  const overlayImageUrl = resolveTemplateAssetUrl(activeTemplate, overlayAssetSource ?? undefined);
  const shouldShowGeneratedGuide =
    overlayMode === "guide" && (!overlayImageUrl || Boolean(overlayAssetError));

  const canCapture = cameraStatus === "active" && !isCapturing;

  const emitPhotoInput = useCallback(
    (nextPhotoInput: PhotoInput) => {
      onPhotoReady?.(nextPhotoInput);
      onPhotoInputReady?.(nextPhotoInput);
    },
    [onPhotoInputReady, onPhotoReady],
  );

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

      if (nextPhotoInput) {
        emitPhotoInput(nextPhotoInput);
      }
    },
    [emitPhotoInput],
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
    const videoDevices = mediaDevices.filter(
      (device) => device.kind === "videoinput",
    );

    setDevices(videoDevices);

    if (!selectedDeviceId) {
      const firstDeviceId = videoDevices.find((device) => device.deviceId)
        ?.deviceId;

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

        const activeDeviceId =
          stream.getVideoTracks()[0]?.getSettings().deviceId ?? "";

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
    return () => {
      revokePhotoInput(currentPhotoInputRef.current);
    };
  }, []);

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

  return (
    <main className="slice04-camera">
      <header className="slice04-topbar">
        <div className="slice04-titleblock">
          <span className="slice04-kicker">4Pix Studio</span>
          <h1>Capture & Upload Photo</h1>
          <p>
            Ambil foto dari live camera atau upload JPG/PNG sebagai input awal
            sebelum remove background.
          </p>
        </div>

        <div className="slice04-topbar-actions">
          {activeTemplate ? (
            <span className="slice04-template-pill">{activeTemplate.name}</span>
          ) : (
            <span className="slice04-template-pill slice04-template-pill-muted">
              Template belum dipilih
            </span>
          )}

          {handleBack ? (
            <button type="button" className="slice04-secondary-button" onClick={handleBack}>
              Kembali
            </button>
          ) : null}
        </div>
      </header>

      <section className="slice04-layout">
        <div className="slice04-live-card">
          <div className="slice04-live-header">
            <div>
              <span className="slice04-kicker">Live Camera</span>
              <h2>Posisikan wajah sesuai overlay</h2>
            </div>

            <span className={`slice04-live-status slice04-live-status-${cameraStatus}`}>
              {cameraStatus === "active"
                ? "Kamera aktif"
                : cameraStatus === "starting"
                  ? "Menyalakan kamera"
                  : cameraStatus === "error"
                    ? "Kamera error"
                    : "Kamera standby"}
            </span>
          </div>

          <div className="slice04-stage">
            <video
              ref={videoRef}
              className="slice04-video"
              autoPlay
              muted
              playsInline
            />

            {cameraStatus !== "active" ? (
              <div className="slice04-stage-placeholder">
                {cameraStatus === "starting"
                  ? "Menyiapkan liveview kamera..."
                  : "Liveview belum aktif"}
              </div>
            ) : null}

            {overlayMode !== "none" && overlayImageUrl && !overlayAssetError ? (
              <img
                className="slice04-overlay-image"
                src={overlayImageUrl}
                alt={
                  overlayMode === "guide"
                    ? "Overlay guide pas foto"
                    : "Overlay preview template"
                }
                draggable={false}
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
              <div className="slice04-generated-guide" aria-hidden="true">
                <span className="slice04-guide-line slice04-guide-line-vertical" />
                <span className="slice04-guide-oval" />
                <span className="slice04-guide-line slice04-guide-line-eye" />
                <span className="slice04-guide-line slice04-guide-line-chin" />
                <span className="slice04-guide-line slice04-guide-line-shoulder" />
              </div>
            ) : null}

            {overlayMode === "template" && overlayAssetError ? (
              <div className="slice04-overlay-warning">
                {overlayAssetError}
              </div>
            ) : null}
          </div>

          {cameraError ? (
            <div className="slice04-error-box">{cameraError}</div>
          ) : null}

          {overlayMode === "guide" && overlayAssetError ? (
            <div className="slice04-info-box">{overlayAssetError}</div>
          ) : null}

          <div className="slice04-controls">
            <button
              type="button"
              className="slice04-primary-button"
              disabled={!canCapture}
              onClick={() => void handleCapture()}
            >
              {isCapturing ? "Mengambil foto..." : "Capture Foto"}
            </button>

            <button
              type="button"
              className="slice04-secondary-button"
              onClick={() => void startCamera(selectedDeviceId || undefined)}
            >
              Restart Kamera
            </button>

            <button type="button" className="slice04-secondary-button" onClick={stopCamera}>
              Stop Kamera
            </button>
          </div>

          <div className="slice04-field-grid">
            <label className="slice04-field">
              <span>Kamera</span>
              <select
                value={selectedDeviceId}
                onChange={(event) => setSelectedDeviceId(event.target.value)}
              >
                {devices.length === 0 ? (
                  <option value="">Default browser camera</option>
                ) : (
                  devices.map((device, index) => (
                    <option
                      key={device.deviceId || `camera-${index}`}
                      value={device.deviceId}
                    >
                      {device.label || `Kamera ${index + 1}`}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="slice04-field">
              <span>Overlay</span>
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
        </div>

        <aside className="slice04-input-panel">
          <div className="slice04-upload-card">
            <span className="slice04-kicker">Upload Photo Mode</span>
            <h2>Upload foto alternatif</h2>
            <p>
              Gunakan mode ini kalau kamera belum tersedia atau pelanggan sudah
              membawa file foto.
            </p>

            <input
              ref={uploadInputRef}
              className="slice04-upload-input"
              type="file"
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              onChange={(event) => void handleUploadChange(event)}
              disabled={isUploading}
            />

            <button
              type="button"
              className="slice04-upload-dropzone"
              onClick={() => uploadInputRef.current?.click()}
              disabled={isUploading}
            >
              <strong>{isUploading ? "Membaca file..." : "Pilih JPG/PNG"}</strong>
              <span>Maksimal 10 MB. File non-image akan ditolak.</span>
            </button>
          </div>

          {inputError ? <div className="slice04-error-box">{inputError}</div> : null}

          <PhotoInputPreview
            photoInput={photoInput}
            onClear={() => replacePhotoInput(null)}
          />

          <div className="slice04-scope-note">
            <strong>Scope Slice 04</strong>
            <span>
              Capture dan upload hanya membuat preview input. Remove background,
              compositing, adjustment, dan export dikerjakan di slice berikutnya.
            </span>
          </div>
        </aside>
            <FourpixSlice05Panel />
</section>
    </main>
  );
}

export default CameraMode;
