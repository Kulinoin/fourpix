from __future__ import annotations

import json
from io import BytesIO

import pytest
from PIL import Image

from app.services.compositor import (
    TemplateCompositionError,
    TemplateNotFoundError,
    compose_template_image,
)


def _png_bytes(image: Image.Image) -> bytes:
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def test_compose_template_image_uses_expected_render_order(tmp_path, monkeypatch):
    templates_root = tmp_path / "templates"
    template_dir = templates_root / "test_template_01"
    template_dir.mkdir(parents=True)

    metadata = {
        "schemaVersion": "1.0",
        "id": "test_template_01",
        "name": "Test Template",
        "category": "test",
        "canvas": {"width": 20, "height": 20, "ratio": "1:1"},
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
            "maxTranslateX": 220,
            "maxTranslateY": 260,
        },
        "exportProfiles": ["3x4"],
    }
    (template_dir / "template.json").write_text(json.dumps(metadata), encoding="utf-8")

    transparent = Image.new("RGBA", (20, 20), (0, 0, 0, 0))
    transparent.save(template_dir / "thumbnail.png")
    transparent.save(template_dir / "overlay-guide.png")
    transparent.save(template_dir / "overlay-preview.png")

    layer_back = Image.new("RGBA", (20, 20), (0, 0, 0, 0))
    layer_back.putpixel((17, 10), (0, 255, 0, 255))
    layer_back.save(template_dir / "layer-back.png")

    layer_front = Image.new("RGBA", (20, 20), (0, 0, 0, 0))
    layer_front.putpixel((3, 10), (0, 0, 255, 255))
    layer_front.save(template_dir / "layer-front.png")

    subject = Image.new("RGBA", (20, 20), (0, 0, 0, 0))
    for x in range(0, 8):
        for y in range(0, 20):
            subject.putpixel((x, y), (255, 0, 0, 255))

    monkeypatch.setenv("FOURPIX_TEMPLATES_DIR", str(templates_root))

    output_bytes = compose_template_image(
        subject_bytes=_png_bytes(subject),
        template_id="test_template_01",
        background_color="#123456",
    )

    output = Image.open(BytesIO(output_bytes)).convert("RGBA")
    assert output.size == (20, 20)
    assert output.getpixel((12, 0)) == (18, 52, 86, 255)
    assert output.getpixel((4, 10)) == (255, 0, 0, 255)
    assert output.getpixel((17, 10)) == (0, 255, 0, 255)
    assert output.getpixel((3, 10)) == (0, 0, 255, 255)


def test_compose_template_image_rejects_missing_template(tmp_path, monkeypatch):
    monkeypatch.setenv("FOURPIX_TEMPLATES_DIR", str(tmp_path))
    subject = Image.new("RGBA", (20, 20), (255, 0, 0, 255))

    with pytest.raises(TemplateNotFoundError):
        compose_template_image(
            subject_bytes=_png_bytes(subject),
            template_id="missing_template_01",
            background_color="#ffffff",
        )


def test_compose_template_image_rejects_unsafe_template_id():
    subject = Image.new("RGBA", (20, 20), (255, 0, 0, 255))

    with pytest.raises(TemplateCompositionError):
        compose_template_image(
            subject_bytes=_png_bytes(subject),
            template_id="../bad",
            background_color="#ffffff",
        )
