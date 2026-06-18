from __future__ import annotations

from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.routes import process


client = TestClient(app)


def _make_png_bytes() -> bytes:
    image = Image.new("RGB", (48, 48), (240, 240, 240))
    output = BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def _fake_remove_background_bytes(image_bytes: bytes) -> bytes:
    image = Image.open(BytesIO(image_bytes)).convert("RGBA")
    image.putalpha(128)
    output = BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


def test_remove_background_endpoint_returns_transparent_png(monkeypatch):
    monkeypatch.setattr(process, "remove_background_bytes", _fake_remove_background_bytes)

    response = client.post(
        "/process/remove-background",
        files={"file": ("input.png", _make_png_bytes(), "image/png")},
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.headers["x-fourpix-processing"] == "local"

    output = Image.open(BytesIO(response.content))
    assert output.mode == "RGBA"


def test_remove_background_rejects_non_image_file():
    response = client.post(
        "/process/remove-background",
        files={"file": ("input.txt", b"not an image", "text/plain")},
    )

    assert response.status_code == 415
