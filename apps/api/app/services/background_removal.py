from __future__ import annotations

import os
from io import BytesIO

from PIL import Image, ImageOps, UnidentifiedImageError


class InvalidImageError(ValueError):
    pass


class BackgroundRemovalError(RuntimeError):
    pass


_REMBG_SESSION = None


def _normalize_input_image(image_bytes: bytes) -> bytes:
    if not image_bytes:
        raise InvalidImageError("File image kosong.")

    try:
        image = Image.open(BytesIO(image_bytes))
        image.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise InvalidImageError("File bukan image valid atau rusak.") from exc

    image = ImageOps.exif_transpose(image)

    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")

    output = BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def _get_rembg_session():
    global _REMBG_SESSION

    if _REMBG_SESSION is None:
        try:
            from rembg import new_session
        except Exception as exc:
            raise BackgroundRemovalError(
                "Library rembg belum siap. Jalankan pip install -r apps/api/requirements.txt."
            ) from exc

        model_name = os.getenv("FOURPIX_REMBG_MODEL", "u2net")

        try:
            _REMBG_SESSION = new_session(model_name)
        except Exception as exc:
            raise BackgroundRemovalError(
                "Gagal menyiapkan model remove background lokal. "
                "Pastikan rembg[cpu]/onnxruntime terpasang dan model ONNX tersedia."
            ) from exc

    return _REMBG_SESSION


def _ensure_rgba_png(image_bytes: bytes) -> bytes:
    try:
        image = Image.open(BytesIO(image_bytes))
        image.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise BackgroundRemovalError("Output remove background bukan PNG valid.") from exc

    if image.mode != "RGBA":
        image = image.convert("RGBA")

    output = BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def remove_background_bytes(image_bytes: bytes) -> bytes:
    normalized_input = _normalize_input_image(image_bytes)

    try:
        from rembg import remove
    except Exception as exc:
        raise BackgroundRemovalError(
            "Library rembg belum siap. Jalankan pip install -r apps/api/requirements.txt."
        ) from exc

    session = _get_rembg_session()

    try:
        output = remove(normalized_input, session=session)
    except Exception as exc:
        raise BackgroundRemovalError("Proses remove background lokal gagal.") from exc

    return _ensure_rgba_png(output)
