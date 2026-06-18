from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app


def _templates_from_payload(payload: object) -> list[dict[str, object]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]

    if isinstance(payload, dict) and isinstance(payload.get("templates"), list):
        return [item for item in payload["templates"] if isinstance(item, dict)]

    return []


def test_mvp_core_endpoints_are_ready() -> None:
    client = TestClient(app)

    health = client.get("/health")
    assert health.status_code == 200

    templates_response = client.get("/templates")
    assert templates_response.status_code == 200
    templates = _templates_from_payload(templates_response.json())
    assert len(templates) >= 2

    export_profiles = client.get("/export/profiles")
    assert export_profiles.status_code == 200
    profile_ids = [profile["id"] for profile in export_profiles.json()["profiles"]]
    assert "3x4" in profile_ids
    assert "4x6" in profile_ids


def test_template_registry_output_is_frontend_safe() -> None:
    client = TestClient(app)

    response = client.get("/templates")
    assert response.status_code == 200

    templates = _templates_from_payload(response.json())
    assert templates

    for template in templates:
        assert isinstance(template.get("id"), str)
        assert isinstance(template.get("name"), str)

        for key in ("thumbnailUrl", "overlayGuideUrl", "overlayPreviewUrl"):
            value = template.get(key)
            if value is None:
                continue

            assert isinstance(value, str)
            assert not value.startswith("/mnt/")
            assert "\\" not in value
