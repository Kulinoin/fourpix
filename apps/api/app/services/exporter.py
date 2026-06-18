from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from io import BytesIO
from typing import Literal

from PIL import Image, ImageOps, UnidentifiedImageError


ExportFormat = Literal["jpg", "png"]


@dataclass(frozen=True)
class ExportProfile:
    id: str
    name: str
    width_px: int
    height_px: int
    ratio: str


EXPORT_PROFILES: dict[str, ExportProfile] = {
    "3x4": ExportProfile(
        id="3x4",
        name="Pas Foto 3x4",
        width_px=900,
        height_px=1200,
        ratio="3:4",
    ),
    "4x6": ExportProfile(
        id="4x6",
        name="Pas Foto 4x6",
        width_px=1200,
        height_px=1800,
        ratio="2:3",
    ),
}


def list_export_profiles() -> list[dict[str, object]]:
    return [
        {
            "id": profile.id,
            "name": profile.name,
            "widthPx": profile.width_px,
            "heightPx": profile.height_px,
            "ratio": profile.ratio,
        }
        for profile in EXPORT_PROFILES.values()
    ]


def get_export_profile(profile_id: str) -> ExportProfile:
    try:
        return EXPORT_PROFILES[profile_id]
    except KeyError as exc:
        supported = ", ".join(EXPORT_PROFILES)
        raise ValueError(f"Unsupported export profile '{profile_id}'. Supported: {supported}.") from exc


def normalize_export_format(output_format: str) -> ExportFormat:
    value = output_format.strip().lower()
    if value == "jpeg":
        value = "jpg"

    if value not in {"jpg", "png"}:
        raise ValueError("Unsupported export format. Supported: jpg, png.")

    return value  # type: ignore[return-value]


def make_export_filename(profile_id: str, output_format: ExportFormat) -> str:
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    return f"fourpix-{profile_id}-{stamp}.{output_format}"


def _open_image(image_bytes: bytes) -> Image.Image:
    if not image_bytes:
        raise ValueError("Image file is empty.")

    try:
        image = Image.open(BytesIO(image_bytes))
        image.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("Uploaded file is not a valid image.") from exc

    return image


def _flatten_for_jpg(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    background = Image.new("RGBA", image.size, (255, 255, 255, 255))
    background.alpha_composite(image)
    return background.convert("RGB")


def export_image_bytes(
    image_bytes: bytes,
    *,
    profile_id: str,
    output_format: str,
) -> tuple[bytes, str, str]:
    profile = get_export_profile(profile_id)
    normalized_format = normalize_export_format(output_format)

    image = _open_image(image_bytes)

    if image.mode not in {"RGB", "RGBA"}:
        image = image.convert("RGBA")

    fitted = ImageOps.fit(
        image,
        (profile.width_px, profile.height_px),
        method=Image.Resampling.LANCZOS,
        centering=(0.5, 0.5),
    )

    buffer = BytesIO()

    if normalized_format == "png":
        if fitted.mode != "RGBA":
            fitted = fitted.convert("RGBA")
        fitted.save(buffer, format="PNG", optimize=True)
        media_type = "image/png"
    else:
        jpg_image = _flatten_for_jpg(fitted)
        jpg_image.save(buffer, format="JPEG", quality=95, optimize=True)
        media_type = "image/jpeg"

    filename = make_export_filename(profile.id, normalized_format)
    return buffer.getvalue(), media_type, filename
