export type PhotoInputSource = "camera" | "upload";

export type PhotoInput = {
  id: string;
  source: PhotoInputSource;
  blob: Blob;
  objectUrl: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  createdAt: string;
};

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

type CaptureOptions = {
  mimeType?: "image/png" | "image/jpeg";
  quality?: number;
};

type ImageDimensions = {
  width: number;
  height: number;
};

function createInputId(source: PhotoInputSource): string {
  const cryptoWithRandom = globalThis.crypto as Crypto & {
    randomUUID?: () => string;
  };

  const randomPart =
    cryptoWithRandom.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `fourpix-${source}-${randomPart}`;
}

function getFileExtension(mimeType: string): "png" | "jpg" {
  return mimeType === "image/png" ? "png" : "jpg";
}

function inferMimeType(file: File): string {
  if (file.type) return file.type;

  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";

  return "application/octet-stream";
}

function readImageDimensions(objectUrl: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      reject(new Error("Gagal membaca ukuran gambar. Pastikan file JPG/PNG tidak rusak."));
    };

    image.src = objectUrl;
  });
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function isAllowedImageFile(file: File): boolean {
  const normalizedName = file.name.toLowerCase();
  const hasAllowedType = ALLOWED_IMAGE_TYPES.has(file.type);
  const hasAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.some((extension) =>
    normalizedName.endsWith(extension),
  );

  return hasAllowedType || hasAllowedExtension;
}

export async function captureVideoFrame(
  video: HTMLVideoElement,
  options: CaptureOptions = {},
): Promise<PhotoInput> {
  const width = video.videoWidth;
  const height = video.videoHeight;

  if (!width || !height) {
    throw new Error("Kamera belum siap untuk capture. Tunggu liveview tampil normal.");
  }

  const mimeType = options.mimeType ?? "image/png";
  const quality = options.quality ?? 0.95;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Browser tidak bisa membuat canvas capture.");
  }

  context.drawImage(video, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (!result) {
          reject(new Error("Capture gagal menghasilkan file gambar."));
          return;
        }

        resolve(result);
      },
      mimeType,
      quality,
    );
  });

  const objectUrl = URL.createObjectURL(blob);
  const extension = getFileExtension(blob.type || mimeType);

  return {
    id: createInputId("camera"),
    source: "camera",
    blob,
    objectUrl,
    fileName: `fourpix-capture-${new Date().toISOString().replace(/[:.]/g, "-")}.${extension}`,
    mimeType: blob.type || mimeType,
    sizeBytes: blob.size,
    width,
    height,
    createdAt: new Date().toISOString(),
  };
}

export async function createPhotoInputFromFile(file: File): Promise<PhotoInput> {
  if (!isAllowedImageFile(file)) {
    throw new Error("File harus berupa JPG atau PNG.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Ukuran file maksimal ${formatBytes(MAX_UPLOAD_BYTES)}.`);
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const dimensions = await readImageDimensions(objectUrl);

    if (!dimensions.width || !dimensions.height) {
      throw new Error("Ukuran gambar tidak valid.");
    }

    return {
      id: createInputId("upload"),
      source: "upload",
      blob: file,
      objectUrl,
      fileName: file.name || `fourpix-upload-${Date.now()}`,
      mimeType: inferMimeType(file),
      sizeBytes: file.size,
      width: dimensions.width,
      height: dimensions.height,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

export function revokePhotoInput(photoInput: PhotoInput | null): void {
  if (!photoInput) return;
  URL.revokeObjectURL(photoInput.objectUrl);
}
