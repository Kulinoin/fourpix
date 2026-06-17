# Slice 01 — Template Registry

Status: implemented locally, pending user approval for commit/push.

## Scope

- Root `templates/` folder.
- Two MVP placeholder templates:
  - `jas_hitam_dasi_01`
  - `jas_hitam_tanpa_dasi_01`
- Template metadata JSON.
- Placeholder PNG assets:
  - `thumbnail.png`
  - `overlay-guide.png`
  - `overlay-preview.png`
  - `layer-back.png`
  - `layer-front.png`
- Backend template registry service.
- Backend `GET /templates`.
- Backend safe asset route `/templates/{template_id}/{asset_name}`.
- Frontend template selection cards.
- Selected template state in frontend.

## Non-Scope

- Live camera.
- Runtime overlay alignment.
- Capture/upload.
- Remove background.
- Compositing.
- Manual adjustment controls.
- Export.

## Notes

Placeholder assets are intentionally visible as placeholders and can be replaced later without changing registry logic.
