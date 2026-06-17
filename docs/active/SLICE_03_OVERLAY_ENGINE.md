# Slice 03 — Overlay Engine

## Status

Implemented locally, awaiting validation and user approval before commit/push.

## Scope

- Added reusable frontend overlay feature under `apps/web/src/features/overlay`.
- Added overlay modes:
  - `guide`
  - `template`
- Added overlay mode toggle.
- Added camera overlay renderer.
- Integrated overlay into live camera view.
- Overlay asset source comes from selected template registry data:
  - `overlayGuideUrl`
  - `overlayPreviewUrl`
- Overlay is visual-only and does not participate in raw camera capture.

## Non-Scope

- Capture implementation.
- Upload photo mode.
- Remove background.
- Final compositing.
- Manual adjustment.
- Export JPG/PNG.
- Template editor.

## Manual Browser Validation

- Open the web app.
- Select a template.
- Enter Live Camera Mode.
- Start camera.
- Confirm Guide overlay appears above liveview.
- Switch to Template overlay.
- Confirm template transparent overlay appears.
- Resize browser window.
- Confirm overlay remains aligned with liveview.
- Confirm overlay does not block camera controls.
- Confirm camera start/stop and camera selection from Slice 02 still work.

## Notes

Current overlay quality depends on template PNG assets. The engine is asset-driven, so custom overlay collections can replace placeholder assets later without changing overlay logic.

## Fix — Overlay Asset URL Resolution

Tanggal: 18 Juni 2026

Manual browser check menunjukkan overlay toggle sudah tampil, tetapi asset `overlay-guide.png` dan `overlay-preview.png` belum terlihat jelas karena URL asset dari backend masih berbentuk relatif `/templates/...`.

Frontend berjalan di Vite `127.0.0.1:5174`, sedangkan backend API menggunakan `VITE_API_BASE_URL=http://127.0.0.1:8404`.

Perubahan:
- Added `apps/web/src/lib/apiBaseUrl.ts`.
- `CameraOverlay` sekarang mengubah relative asset path `/templates/...` menjadi absolute backend URL berbasis `VITE_API_BASE_URL`.
- Temporary debug outline overlay dihapus agar tampilan kembali bersih.

Manual validation setelah fix:
- Backend harus berjalan di port 8404.
- Guide overlay harus memuat asset dari `http://127.0.0.1:8404/templates/.../overlay-guide.png`.
- Template overlay harus memuat asset dari `http://127.0.0.1:8404/templates/.../overlay-preview.png`.

## Manual Validation PASS

Tanggal: 18 Juni 2026

Hasil manual browser check:
- Guide overlay tampil di atas live camera.
- Template overlay transparan tampil di atas live camera.
- Toggle Guide/Template berjalan.
- Overlay asset berhasil dimuat dari backend lokal melalui `VITE_API_BASE_URL=http://127.0.0.1:8404`.
- Issue relative URL `/templates/...` sudah diperbaiki dengan resolver frontend.

Status manual: PASS.
