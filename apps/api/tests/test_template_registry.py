from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.services.template_registry import list_templates

client = TestClient(app)


def test_template_registry_lists_two_valid_placeholder_templates() -> None:
    templates = list_templates()

    template_ids = {template["id"] for template in templates}

    assert "jas_hitam_dasi_01" in template_ids
    assert "jas_hitam_tanpa_dasi_01" in template_ids


def test_templates_endpoint_returns_public_urls_without_filesystem_paths() -> None:
    response = client.get("/templates")

    assert response.status_code == 200

    templates = response.json()
    assert isinstance(templates, list)
    assert len(templates) >= 2

    for template in templates:
        assert template["thumbnailUrl"].startswith("/templates/")
        assert template["overlayGuideUrl"].startswith("/templates/")
        assert template["overlayPreviewUrl"].startswith("/templates/")
        assert "/mnt/" not in template["thumbnailUrl"]
        assert ":\\" not in template["thumbnailUrl"]


def test_template_asset_endpoint_serves_thumbnail() -> None:
    response = client.get("/templates/jas_hitam_dasi_01/thumbnail.png")

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"


def test_missing_template_asset_returns_404() -> None:
    response = client.get("/templates/jas_hitam_dasi_01/not-found.png")

    assert response.status_code == 404
