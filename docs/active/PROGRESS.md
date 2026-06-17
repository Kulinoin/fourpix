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
