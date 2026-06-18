from __future__ import annotations

from io import BytesIO

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.services.exporter import export_image_bytes, list_export_profiles


def _make_source_image() -> bytes:
    image = Image.new("RGBA", (900, 1200), (25, 90, 180, 255))
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def test_export_profiles_include_3x4_and_4x6() -> None:
    profiles = list_export_profiles()

    assert [profile["id"] for profile in profiles] == ["3x4", "4x6"]
    assert profiles[0]["widthPx"] == 900
    assert profiles[0]["heightPx"] == 1200
    assert profiles[1]["widthPx"] == 1200
    assert profiles[1]["heightPx"] == 1800


def test_export_png_3x4_has_expected_size() -> None:
    output, media_type, filename = export_image_bytes(
        _make_source_image(),
        profile_id="3x4",
        output_format="png",
    )

    assert media_type == "image/png"
    assert filename.startswith("fourpix-3x4-")
    assert filename.endswith(".png")

    image = Image.open(BytesIO(output))
    assert image.size == (900, 1200)
    assert image.format == "PNG"


def test_export_jpg_4x6_has_expected_size_and_mode() -> None:
    output, media_type, filename = export_image_bytes(
        _make_source_image(),
        profile_id="4x6",
        output_format="jpg",
    )

    assert media_type == "image/jpeg"
    assert filename.startswith("fourpix-4x6-")
    assert filename.endswith(".jpg")

    image = Image.open(BytesIO(output))
    assert image.size == (1200, 1800)
    assert image.format == "JPEG"
    assert image.mode == "RGB"


@pytest.mark.parametrize(
    ("profile_id", "output_format"),
    [
        ("2x3", "png"),
        ("3x4", "webp"),
    ],
)
def test_export_rejects_invalid_profile_or_format(profile_id: str, output_format: str) -> None:
    with pytest.raises(ValueError):
        export_image_bytes(
            _make_source_image(),
            profile_id=profile_id,
            output_format=output_format,
        )


def test_export_route_returns_downloadable_png() -> None:
    client = TestClient(app)

    response = client.post(
        "/export",
        files={"image": ("preview.png", _make_source_image(), "image/png")},
        data={"profile_id": "3x4", "format": "png"},
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/png")
    assert "fourpix-3x4-" in response.headers["content-disposition"]

    exported = Image.open(BytesIO(response.content))
    assert exported.size == (900, 1200)


def test_export_route_lists_profiles() -> None:
    client = TestClient(app)

    response = client.get("/export/profiles")

    assert response.status_code == 200
    assert response.json()["profiles"][0]["id"] == "3x4"
    assert response.json()["profiles"][1]["id"] == "4x6"
