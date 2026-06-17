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
