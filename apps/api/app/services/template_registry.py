from __future__ import annotations

import json
import os
import re
import struct
from pathlib import Path
from typing import Any

SUPPORTED_SCHEMA_VERSIONS = {"1.0"}
TEMPLATE_ID_PATTERN = re.compile(r"^[a-z0-9]+(?:_[a-z0-9]+)*$")

REQUIRED_ASSET_KEYS = {
    "thumbnail",
    "overlayGuide",
    "overlayPreview",
    "layerBack",
    "layerFront",
}

CANVAS_ASSET_KEYS = {
    "overlayGuide",
    "overlayPreview",
    "layerBack",
    "layerFront",
}


class TemplateRegistryError(Exception):
    """Base exception for template registry failures."""


class TemplateNotFoundError(TemplateRegistryError):
    """Raised when a requested template or asset cannot be found."""


def get_template_root() -> Path:
    configured = os.environ.get("FOURPIX_TEMPLATE_ROOT")
    if configured:
        return Path(configured).expanduser().resolve()

    # apps/api/app/services/template_registry.py -> project root
    return Path(__file__).resolve().parents[4] / "templates"


def read_png_dimensions(path: Path) -> tuple[int, int]:
    header = path.read_bytes()[:24]
    if len(header) < 24 or not header.startswith(b"\x89PNG\r\n\x1a\n"):
        raise TemplateRegistryError(f"Asset is not a valid PNG: {path.name}")

    width, height = struct.unpack(">II", header[16:24])
    return width, height


def _require_dict(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise TemplateRegistryError(f"{field} must be an object")
    return value


def _require_number(value: Any, field: str) -> int | float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise TemplateRegistryError(f"{field} must be a number")
    return value


def _require_string(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise TemplateRegistryError(f"{field} must be a non-empty string")
    return value


def _check_point(value: Any, field: str, width: int, height: int) -> None:
    point = _require_dict(value, field)
    x = _require_number(point.get("x"), f"{field}.x")
    y = _require_number(point.get("y"), f"{field}.y")

    if not 0 <= x <= width:
        raise TemplateRegistryError(f"{field}.x is outside canvas")
    if not 0 <= y <= height:
        raise TemplateRegistryError(f"{field}.y is outside canvas")


def _check_face_guide(value: Any, width: int, height: int) -> None:
    guide = _require_dict(value, "faceGuide")

    for key in ["centerX", "headTopY", "eyeY", "chinY", "safeHeadWidth", "safeHeadHeight"]:
        _require_number(guide.get(key), f"faceGuide.{key}")

    if not 0 <= guide["centerX"] <= width:
        raise TemplateRegistryError("faceGuide.centerX is outside canvas")
    for key in ["headTopY", "eyeY", "chinY"]:
        if not 0 <= guide[key] <= height:
            raise TemplateRegistryError(f"faceGuide.{key} is outside canvas")
    if guide["safeHeadWidth"] <= 0 or guide["safeHeadWidth"] > width:
        raise TemplateRegistryError("faceGuide.safeHeadWidth is invalid")
    if guide["safeHeadHeight"] <= 0 or guide["safeHeadHeight"] > height:
        raise TemplateRegistryError("faceGuide.safeHeadHeight is invalid")


def _check_shoulder_guide(value: Any, width: int, height: int) -> None:
    guide = _require_dict(value, "shoulderGuide")

    left_x = _require_number(guide.get("leftX"), "shoulderGuide.leftX")
    right_x = _require_number(guide.get("rightX"), "shoulderGuide.rightX")
    y = _require_number(guide.get("y"), "shoulderGuide.y")

    if not 0 <= left_x <= width:
        raise TemplateRegistryError("shoulderGuide.leftX is outside canvas")
    if not 0 <= right_x <= width:
        raise TemplateRegistryError("shoulderGuide.rightX is outside canvas")
    if left_x >= right_x:
        raise TemplateRegistryError("shoulderGuide.leftX must be smaller than rightX")
    if not 0 <= y <= height:
        raise TemplateRegistryError("shoulderGuide.y is outside canvas")


def _check_subject_transform(value: Any) -> None:
    transform = _require_dict(value, "subjectInitialTransform")
    for key in ["x", "y", "scale", "rotation"]:
        _require_number(transform.get(key), f"subjectInitialTransform.{key}")
    if transform["scale"] <= 0:
        raise TemplateRegistryError("subjectInitialTransform.scale must be positive")


def _check_adjustment_limits(value: Any) -> None:
    limits = _require_dict(value, "adjustmentLimits")

    min_scale = _require_number(limits.get("minScale"), "adjustmentLimits.minScale")
    max_scale = _require_number(limits.get("maxScale"), "adjustmentLimits.maxScale")
    min_rotation = _require_number(limits.get("minRotation"), "adjustmentLimits.minRotation")
    max_rotation = _require_number(limits.get("maxRotation"), "adjustmentLimits.maxRotation")
    max_translate_x = _require_number(limits.get("maxTranslateX"), "adjustmentLimits.maxTranslateX")
    max_translate_y = _require_number(limits.get("maxTranslateY"), "adjustmentLimits.maxTranslateY")

    if min_scale <= 0 or max_scale < min_scale:
        raise TemplateRegistryError("adjustmentLimits scale range is invalid")
    if max_rotation < min_rotation:
        raise TemplateRegistryError("adjustmentLimits rotation range is invalid")
    if max_translate_x < 0 or max_translate_y < 0:
        raise TemplateRegistryError("adjustmentLimits translation must be positive")


def _validate_template_folder(folder: Path) -> dict[str, Any]:
    template_json_path = folder / "template.json"
    if not template_json_path.is_file():
        raise TemplateRegistryError("template.json is missing")

    try:
        metadata = json.loads(template_json_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise TemplateRegistryError(f"template.json is invalid JSON: {exc}") from exc

    schema_version = _require_string(metadata.get("schemaVersion"), "schemaVersion")
    if schema_version not in SUPPORTED_SCHEMA_VERSIONS:
        raise TemplateRegistryError(f"Unsupported schemaVersion: {schema_version}")

    template_id = _require_string(metadata.get("id"), "id")
    if not TEMPLATE_ID_PATTERN.match(template_id):
        raise TemplateRegistryError("id must be lowercase snake_case")
    if template_id != folder.name:
        raise TemplateRegistryError("id must match template folder name")

    name = _require_string(metadata.get("name"), "name")
    category = _require_string(metadata.get("category"), "category")

    canvas = _require_dict(metadata.get("canvas"), "canvas")
    width = _require_number(canvas.get("width"), "canvas.width")
    height = _require_number(canvas.get("height"), "canvas.height")
    ratio = _require_string(canvas.get("ratio"), "canvas.ratio")

    if int(width) != width or int(height) != height:
        raise TemplateRegistryError("canvas.width and canvas.height must be integers")
    width = int(width)
    height = int(height)
    if width <= 0 or height <= 0:
        raise TemplateRegistryError("canvas dimensions must be positive")

    assets = _require_dict(metadata.get("assets"), "assets")
    missing_keys = REQUIRED_ASSET_KEYS - set(assets)
    if missing_keys:
        raise TemplateRegistryError(f"Missing asset keys: {sorted(missing_keys)}")

    for key in REQUIRED_ASSET_KEYS:
        filename = _require_string(assets.get(key), f"assets.{key}")
        if "/" in filename or "\\" in filename or ".." in filename:
            raise TemplateRegistryError(f"assets.{key} must be a simple filename")

        asset_path = folder / filename
        if not asset_path.is_file():
            raise TemplateRegistryError(f"Asset file is missing: {filename}")

        if key in CANVAS_ASSET_KEYS:
            asset_width, asset_height = read_png_dimensions(asset_path)
            if asset_width != width or asset_height != height:
                raise TemplateRegistryError(
                    f"Asset {filename} must match canvas {width}x{height}; got {asset_width}x{asset_height}"
                )

    _check_face_guide(metadata.get("faceGuide"), width, height)
    _check_point(metadata.get("neckAnchor"), "neckAnchor", width, height)
    _check_shoulder_guide(metadata.get("shoulderGuide"), width, height)
    _check_subject_transform(metadata.get("subjectInitialTransform"))
    _check_adjustment_limits(metadata.get("adjustmentLimits"))

    export_profiles = metadata.get("exportProfiles")
    if not isinstance(export_profiles, list) or not export_profiles:
        raise TemplateRegistryError("exportProfiles must be a non-empty array")
    for profile in export_profiles:
        _require_string(profile, "exportProfiles[]")

    return {
        "id": template_id,
        "name": name,
        "category": category,
        "thumbnailUrl": f"/templates/{template_id}/{assets['thumbnail']}",
        "overlayGuideUrl": f"/templates/{template_id}/{assets['overlayGuide']}",
        "overlayPreviewUrl": f"/templates/{template_id}/{assets['overlayPreview']}",
        "canvas": {
            "width": width,
            "height": height,
            "ratio": ratio,
        },
        "faceGuide": metadata["faceGuide"],
        "neckAnchor": metadata["neckAnchor"],
        "shoulderGuide": metadata["shoulderGuide"],
        "subjectInitialTransform": metadata["subjectInitialTransform"],
        "adjustmentLimits": metadata["adjustmentLimits"],
        "exportProfiles": export_profiles,
    }


def list_templates(template_root: Path | None = None) -> list[dict[str, Any]]:
    root = template_root or get_template_root()
    if not root.exists():
        return []

    templates: list[dict[str, Any]] = []
    for folder in sorted(path for path in root.iterdir() if path.is_dir()):
        try:
            templates.append(_validate_template_folder(folder))
        except TemplateRegistryError:
            # Invalid templates are intentionally skipped so the app never crashes
            # because of one broken template package.
            continue

    return templates


def get_template_asset_path(template_id: str, asset_name: str, template_root: Path | None = None) -> Path:
    if not TEMPLATE_ID_PATTERN.match(template_id):
        raise TemplateNotFoundError("Template not found")

    if "/" in asset_name or "\\" in asset_name or ".." in asset_name:
        raise TemplateNotFoundError("Template asset not found")

    root = template_root or get_template_root()
    folder = root / template_id

    try:
        summary = _validate_template_folder(folder)
    except TemplateRegistryError as exc:
        raise TemplateNotFoundError("Template not found") from exc

    allowed_asset_names = {
        Path(summary["thumbnailUrl"]).name,
        Path(summary["overlayGuideUrl"]).name,
        Path(summary["overlayPreviewUrl"]).name,
        "layer-back.png",
        "layer-front.png",
    }

    if asset_name not in allowed_asset_names:
        raise TemplateNotFoundError("Template asset not found")

    asset_path = folder / asset_name
    if not asset_path.is_file():
        raise TemplateNotFoundError("Template asset not found")

    return asset_path
