# 4Pix Studio Progress

## Slice 00 — Project Foundation

Status: PASS

Validated at: 2026-06-17 23:03:50

Scope completed:

- Struktur project awal.
- Frontend React + Vite + TypeScript.
- Backend FastAPI.
- Health endpoint.
- Frontend call backend health.
- README awal.
- Folder archives.
- Visual identity awal 4Pix Studio: clean photo studio / camera tech / slate-cyan.

Non-scope, belum dikerjakan:

- Kamera.
- Template registry.
- Overlay.
- Capture/upload.
- Remove background.
- Compositing.
- Manual adjustment.
- Export.

Notes:

- Backend API berjalan di port lokal 8404 agar tidak konflik dengan aplikasi lain.
- Frontend dev server berjalan di port lokal 5174.
- Visual direction dibuat berbeda dari Gudange: lebih studio foto, teknologi, futuristik, slate/cyan.
- Pytest PASS dengan 1 warning dependency test client dari FastAPI/Starlette. Warning ini tidak blocker untuk Slice 00.

## Slice 01 — Template Registry

- Added template registry from local template folders.
- Added two placeholder MVP templates.
- Added backend `/templates` endpoint.
- Added frontend template selection and selected-template state.
- Camera/overlay runtime remains non-scope for this slice.

## 2026-06-17 — Slice 02 Live Camera Mode

- Added frontend camera module.
- Added MediaDevices/getUserMedia flow.
- Added live video preview.
- Added camera device selection.
- Added start/stop camera controls.
- Added user-friendly camera error handling.
- Added stream cleanup on exit/unmount.
- Overlay, capture, upload, processing, and export intentionally deferred to later slices.

### Slice 02 Visual Patch

- Added docs/active/UI_VISUAL_LOCK_4PIX.md.
- Replaced warm amber/orange visual direction with 4Pix slate-blue-cyan camera-tech theme.
- Removed superseded wrong-theme Slice 02 archive before creating corrected archive.

### Slice 02 Layout Alignment Patch

- Constrained camera mode width.
- Aligned camera topbar status with the main camera layout.
- Kept responsive layout behavior for smaller screens.
- Replaced previous corrected archive with a cleaner Slice 02 archive.

### Slice 02 Clean Background Patch

- Reset apps/web/src/index.css to remove default Vite layout behavior.
- Removed distracting full-page background grid lines.
- Kept slate-blue-cyan 4Pix camera-tech theme.
- Replaced previous Slice 02 archive with a final clean archive.

## Slice 03 — Overlay Engine

- Added reusable overlay engine for live camera view.
- Added guide/template overlay mode toggle.
- Integrated selected template overlay assets into camera liveview.
- Overlay source remains template registry driven, not hardcoded.
- Archive is created after validation PASS.

## Slice 03 — Overlay Asset URL Fix

- Found manual issue: overlay UI/toggle appeared, but template overlay image did not load visibly.
- Root cause: backend returned relative template asset paths `/templates/...`, while frontend runs on Vite port 5174.
- Fixed by resolving relative asset URLs against `VITE_API_BASE_URL` from `.env.local`.
- Backend local API port confirmed from env as `8404`.
- Archive must be recreated after manual overlay validation PASS.

## Slice 03 — Manual Validation PASS

- Manual browser check confirmed Guide overlay appears.
- Manual browser check confirmed Template overlay appears.
- Guide/Template toggle works.
- Overlay asset URL resolution through `VITE_API_BASE_URL` works.
- Slice 03 is ready for final archive and user-approved commit/push.

## Slice 04 — Capture & Upload Photo

Status: Implemented, pending validation result.

Scope:
- Capture frame dari live camera ke image input.
- Upload JPG/PNG alternatif.
- Validasi file upload.
- Preview input photo.
- Menyiapkan data input untuk Slice 05 Local Background Removal.

Non-scope:
- Remove background.
- Template compositing.
- Manual adjustment final.
- Export final.

Validation:
- Pending automated validation.
- Pending manual browser validation.

Archive:
- Pending.

### Slice 04 Manual Validation Fix

Manual validation first attempt was not PASS:
- Overlay guide/template did not display.
- Upload JPG/PNG did not produce preview.

Fix applied:
- Resolve overlay asset URL against backend API base.
- Add guide fallback when guide asset fails.
- Improve upload input trigger and JPG/PNG validation.

### Slice 04 Validation Result

Status: PASS implemented and validated.

Validation:
- Frontend lint/build PASS.
- Backend pytest PASS via `apps/api/.venv/bin/python`.
- Manual browser validation PASS.

Archive:
- `archives/2026-06-18_185816_slice-04_capture-upload-photo.zip`

## Slice 05 — Local Background Removal

- Added local background removal endpoint POST /process/remove-background.
- Added rembg[cpu] dependency path for local ONNX Runtime CPU processing.
- Added JPG/PNG validation and max upload size guard.
- Added frontend upload processing UI with input preview and transparent PNG preview.
- Added capture guideline: background putih/terang bersih and pencahayaan rata for more stable local AI result.
- Confirmed this slice does not implement compositing, manual adjustment, export, or model training.
- Archive must be created after validation PASS before commit/push.
