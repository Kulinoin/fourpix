import type { PhotoInput } from "./captureImage";
import { formatBytes } from "./captureImage";

type PhotoInputPreviewProps = {
  photoInput: PhotoInput | null;
  onClear: () => void;
};

export function PhotoInputPreview({
  photoInput,
  onClear,
}: PhotoInputPreviewProps) {
  if (!photoInput) {
    return (
      <div className="slice04-preview-empty">
        <strong>Belum ada foto input</strong>
        <span>
          Ambil foto dari kamera atau upload JPG/PNG untuk masuk ke proses berikutnya.
        </span>
      </div>
    );
  }

  const sourceLabel =
    photoInput.source === "camera" ? "Capture Kamera" : "Upload Foto";

  return (
    <div className="slice04-preview-card">
      <div className="slice04-preview-header">
        <div>
          <span className="slice04-preview-kicker">{sourceLabel}</span>
          <strong>{photoInput.fileName}</strong>
        </div>
        <button type="button" className="slice04-link-button" onClick={onClear}>
          Hapus
        </button>
      </div>

      <div className="slice04-preview-frame">
        <img src={photoInput.objectUrl} alt="Preview input foto 4Pix" />
      </div>

      <dl className="slice04-preview-meta">
        <div>
          <dt>Ukuran</dt>
          <dd>
            {photoInput.width} × {photoInput.height}px
          </dd>
        </div>
        <div>
          <dt>Format</dt>
          <dd>{photoInput.mimeType || "image"}</dd>
        </div>
        <div>
          <dt>File</dt>
          <dd>{formatBytes(photoInput.sizeBytes)}</dd>
        </div>
      </dl>

      <div className="slice04-next-note">
        Foto input sudah siap untuk Slice 05: Local Background Removal.
      </div>
    </div>
  );
}
