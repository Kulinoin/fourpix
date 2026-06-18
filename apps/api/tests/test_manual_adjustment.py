from __future__ import annotations

import json
from io import BytesIO
from pathlib import Path

from PIL import Image

from app.services.compositor import compose_template_image


def _png_bytes(image: Image.Image) -> bytes:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def _write_test_template(templates_root: Path) -> str:
    template_id = "manual_adjustment_01"
    template_dir = templates_root / template_id
    template_dir.mkdir(parents=True)

    metadata = {
        "schemaVersion": "1.0",
        "id": template_id,
        "name": "Manual Adjustment Test",
        "category": "test",
        "canvas": {"width": 40, "height": 40, "ratio": "1:1"},
        "assets": {
            "thumbnail": "thumbnail.png",
            "overlayGuide": "overlay-guide.png",
            "overlayPreview": "overlay-preview.png",
            "layerBack": "layer-back.png",
            "layerFront": "layer-front.png",
        },
        "subjectInitialTransform": {"x": 0, "y": 0, "scale": 1.0, "rotation": 0},
        "adjustmentLimits": {
            "minScale": 0.75,
            "maxScale": 1.35,
            "minRotation": -10,
            "maxRotation": 10,
            "maxTranslateX": 8,
            "maxTranslateY": 8,
        },
        "exportProfiles": ["3x4"],
    }

    (template_dir / "template.json").write_text(json.dumps(metadata), encoding="utf-8")

    transparent = Image.new("RGBA", (40, 40), (0, 0, 0, 0))
    for filename in [
        "thumbnail.png",
        "overlay-guide.png",
        "overlay-preview.png",
        "layer-back.png",
        "layer-front.png",
    ]:
        transparent.save(template_dir / filename)

    return template_id


def test_manual_adjustment_x_y_changes_subject_position(tmp_path, monkeypatch):
    templates_root = tmp_path / "templates"
    template_id = _write_test_template(templates_root)
    monkeypatch.setenv("FOURPIX_TEMPLATES_DIR", str(templates_root))

    subject = Image.new("RGBA", (40, 40), (0, 0, 0, 0))
    for x in range(18, 22):
        for y in range(18, 22):
            subject.putpixel((x, y), (255, 0, 0, 255))

    output_bytes = compose_template_image(
        subject_bytes=_png_bytes(subject),
        template_id=template_id,
        background_color="#FFFFFF",
        transform={"x": 6, "y": -4, "scale": 1, "rotation": 0},
    )

    output = Image.open(BytesIO(output_bytes)).convert("RGBA")

    assert output.getpixel((20, 20)) == (255, 255, 255, 255)
    assert output.getpixel((26, 16)) == (255, 0, 0, 255)


def test_manual_adjustment_is_clamped_by_template_limits(tmp_path, monkeypatch):
    templates_root = tmp_path / "templates"
    template_id = _write_test_template(templates_root)
    monkeypatch.setenv("FOURPIX_TEMPLATES_DIR", str(templates_root))

    subject = Image.new("RGBA", (40, 40), (0, 0, 0, 0))
    subject.putpixel((20, 20), (255, 0, 0, 255))

    output_bytes = compose_template_image(
        subject_bytes=_png_bytes(subject),
        template_id=template_id,
        background_color="#FFFFFF",
        transform={"x": 999, "y": 999, "scale": 9, "rotation": 90},
    )

    output = Image.open(BytesIO(output_bytes)).convert("RGBA")

    assert output.size == (40, 40)
