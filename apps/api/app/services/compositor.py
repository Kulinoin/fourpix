from __future__ import annotations

import json
import os
import re
from io import BytesIO
from pathlib import Path
from typing import Any

from PIL import Image, ImageColor, ImageOps, UnidentifiedImageError

_TEMPLATE_ID_RE = re.compile(r"^[a-z0-9]+(?:_[a-z0-9]+)*$")

try:
    _LANCZOS = Image.Resampling.LANCZOS
    _BICUBIC = Image.Resampling.BICUBIC
except AttributeError:  # pragma: no cover
    _LANCZOS = Image.LANCZOS
    _BICUBIC = Image.BICUBIC


class TemplateCompositionError(ValueError):
    pass


class TemplateNotFoundError(FileNotFoundError):
    pass


def _project_root() -> Path:
    return Path(__file__).resolve().parents[4]


def _templates_root() -> Path:
    configured = os.getenv("FOURPIX_TEMPLATES_DIR")
    if configured:
        return Path(configured).resolve()
    return _project_root() / "templates"


def _safe_template_dir(template_id: str) -> Path:
    if not template_id or not _TEMPLATE_ID_RE.fullmatch(template_id):
        raise TemplateCompositionError("Template id tidak valid.")

    root = _templates_root().resolve()
    template_dir = (root / template_id).resolve()

    if root not in template_dir.parents and template_dir != root:
        raise TemplateCompositionError("Template path tidak aman.")

    if not template_dir.is_dir():
        raise TemplateNotFoundError(f"Template '{template_id}' tidak ditemukan.")

    return template_dir


def _load_template_metadata(template_id: str) -> tuple[Path, dict[str, Any]]:
    template_dir = _safe_template_dir(template_id)
    metadata_path = template_dir / "template.json"

    if not metadata_path.is_file():
        raise TemplateCompositionError("template.json tidak ditemukan.")

    try:
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise TemplateCompositionError("template.json tidak valid.") from exc

    if metadata.get("id") and metadata["id"] != template_id:
        raise TemplateCompositionError("Template id tidak sesuai folder.")

    return template_dir, metadata


def _positive_int(value: Any, field_name: str) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError) as exc:
        raise TemplateCompositionError(f"{field_name} harus berupa angka.") from exc

    if parsed <= 0:
        raise TemplateCompositionError(f"{field_name} harus lebih dari 0.")

    return parsed


def _canvas_size(metadata: dict[str, Any]) -> tuple[int, int]:
    canvas = metadata.get("canvas")
    if not isinstance(canvas, dict):
        raise TemplateCompositionError("Metadata canvas tidak valid.")

    return (
        _positive_int(canvas.get("width"), "canvas.width"),
        _positive_int(canvas.get("height"), "canvas.height"),
    )


def _asset_path(
    template_dir: Path,
    metadata: dict[str, Any],
    asset_key: str,
    *,
    required: bool,
) -> Path | None:
    assets = metadata.get("assets")
    if not isinstance(assets, dict):
        raise TemplateCompositionError("Metadata assets tidak valid.")

    asset_name = assets.get(asset_key)
    if not asset_name:
        if required:
            raise TemplateCompositionError(f"Asset {asset_key} wajib ada.")
        return None

    asset_path = (template_dir / str(asset_name)).resolve()

    if template_dir.resolve() not in asset_path.parents and asset_path != template_dir.resolve():
        raise TemplateCompositionError(f"Asset {asset_key} memiliki path tidak aman.")

    if not asset_path.is_file():
        if required:
            raise TemplateCompositionError(f"Asset {asset_key} tidak ditemukan.")
        return None

    return asset_path


def _load_layer(
    template_dir: Path,
    metadata: dict[str, Any],
    asset_key: str,
    canvas_size: tuple[int, int],
    *,
    required: bool,
) -> Image.Image | None:
    path = _asset_path(template_dir, metadata, asset_key, required=required)
    if path is None:
        return None

    try:
        layer = Image.open(path).convert("RGBA")
    except UnidentifiedImageError as exc:
        raise TemplateCompositionError(f"Asset {asset_key} bukan image valid.") from exc

    if layer.size != canvas_size:
        raise TemplateCompositionError(
            f"Ukuran {asset_key} harus sama dengan canvas template "
            f"({canvas_size[0]}x{canvas_size[1]})."
        )

    return layer


def _background_rgba(background_color: str) -> tuple[int, int, int, int]:
    color = (background_color or "").strip()
    if not color:
        raise TemplateCompositionError("Background color wajib diisi.")

    try:
        parsed = ImageColor.getrgb(color)
    except ValueError as exc:
        raise TemplateCompositionError("Background color harus format valid, contoh #E53935.") from exc

    if len(parsed) == 4:
        return parsed

    red, green, blue = parsed
    return red, green, blue, 255


def _number(value: Any, default: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _clamp(value: float, minimum: float | None, maximum: float | None) -> float:
    if minimum is not None:
        value = max(minimum, value)
    if maximum is not None:
        value = min(maximum, value)
    return value


def _merged_transform(metadata: dict[str, Any], adjustment: dict[str, Any] | None) -> dict[str, float]:
    initial = metadata.get("subjectInitialTransform")
    if not isinstance(initial, dict):
        initial = {}

    adjustment = adjustment or {}

    x = _number(initial.get("x"), 0.0) + _number(adjustment.get("x"), 0.0)
    y = _number(initial.get("y"), 0.0) + _number(adjustment.get("y"), 0.0)
    scale = _number(initial.get("scale"), 1.0) * _number(adjustment.get("scale"), 1.0)
    rotation = _number(initial.get("rotation"), 0.0) + _number(adjustment.get("rotation"), 0.0)

    limits = metadata.get("adjustmentLimits")
    if isinstance(limits, dict):
        scale = _clamp(scale, _number(limits.get("minScale"), 0.05), _number(limits.get("maxScale"), 5.0))
        rotation = _clamp(
            rotation,
            _number(limits.get("minRotation"), -360.0),
            _number(limits.get("maxRotation"), 360.0),
        )
        max_translate_x = abs(_number(limits.get("maxTranslateX"), 99999.0))
        max_translate_y = abs(_number(limits.get("maxTranslateY"), 99999.0))
        x = _clamp(x, -max_translate_x, max_translate_x)
        y = _clamp(y, -max_translate_y, max_translate_y)

    if scale <= 0:
        raise TemplateCompositionError("Scale transform harus lebih dari 0.")

    return {"x": x, "y": y, "scale": scale, "rotation": rotation}


def _paste_rgba_clipped(base: Image.Image, overlay: Image.Image, x: int, y: int) -> None:
    if x >= base.width or y >= base.height or x + overlay.width <= 0 or y + overlay.height <= 0:
        return

    crop_left = max(0, -x)
    crop_top = max(0, -y)
    crop_right = min(overlay.width, base.width - x)
    crop_bottom = min(overlay.height, base.height - y)

    if crop_right <= crop_left or crop_bottom <= crop_top:
        return

    cropped = overlay.crop((crop_left, crop_top, crop_right, crop_bottom))
    base.alpha_composite(cropped, (max(0, x), max(0, y)))


def _subject_canvas(
    subject: Image.Image,
    canvas_size: tuple[int, int],
    transform: dict[str, float],
) -> Image.Image:
    canvas_width, canvas_height = canvas_size

    if subject.width <= 0 or subject.height <= 0:
        raise TemplateCompositionError("Ukuran subject tidak valid.")

    base_scale = canvas_height / subject.height
    final_scale = base_scale * transform["scale"]

    target_width = max(1, int(round(subject.width * final_scale)))
    target_height = max(1, int(round(subject.height * final_scale)))

    resized = subject.resize((target_width, target_height), _LANCZOS)

    if abs(transform["rotation"]) > 0.001:
        resized = resized.rotate(transform["rotation"], resample=_BICUBIC, expand=True)

    layer = Image.new("RGBA", canvas_size, (0, 0, 0, 0))
    x = int(round((canvas_width - resized.width) / 2 + transform["x"]))
    y = int(round((canvas_height - resized.height) / 2 + transform["y"]))
    _paste_rgba_clipped(layer, resized, x, y)
    return layer


def compose_template_image(
    *,
    subject_bytes: bytes,
    template_id: str,
    background_color: str = "#E53935",
    transform: dict[str, Any] | None = None,
) -> bytes:
    if not subject_bytes:
        raise TemplateCompositionError("Subject image kosong.")

    template_dir, metadata = _load_template_metadata(template_id)
    canvas_size = _canvas_size(metadata)

    try:
        subject = Image.open(BytesIO(subject_bytes))
        subject = ImageOps.exif_transpose(subject).convert("RGBA")
    except UnidentifiedImageError as exc:
        raise TemplateCompositionError("Subject image tidak valid.") from exc

    layer_back = _load_layer(template_dir, metadata, "layerBack", canvas_size, required=False)
    layer_front = _load_layer(template_dir, metadata, "layerFront", canvas_size, required=True)

    output = Image.new("RGBA", canvas_size, _background_rgba(background_color))

    if layer_back is not None:
        output = Image.alpha_composite(output, layer_back)

    subject_layer = _subject_canvas(subject, canvas_size, _merged_transform(metadata, transform))
    output = Image.alpha_composite(output, subject_layer)
    output = Image.alpha_composite(output, layer_front)

    buffer = BytesIO()
    output.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()
