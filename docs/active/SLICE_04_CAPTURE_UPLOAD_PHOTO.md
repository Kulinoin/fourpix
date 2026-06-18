# Slice 04 — Capture & Upload Photo

## Target

Mendukung input foto dari dua sumber:

1. Capture frame dari live camera.
2. Upload file JPG/PNG sebagai alternatif.

Slice ini menyiapkan foto input untuk Slice 05 Local Background Removal.

## Scope

- Capture frame video ke canvas.
- Convert hasil capture menjadi PNG Blob/Object URL.
- Upload JPG/PNG.
- Validasi tipe file upload.
- Validasi ukuran file upload maksimal 10 MB.
- Preview input photo.
- Metadata dasar input: source, filename, mime type, size, width, height.
- Error handling untuk capture/upload.

## Non-Scope

- Remove background.
- Template compositing.
- Manual adjustment final.
- Background color final.
- Export JPG/PNG final.
- Penyimpanan foto permanen.

## Files

- `apps/web/src/features/capture/captureImage.ts`
- `apps/web/src/features/capture/PhotoInputPreview.tsx`
- `apps/web/src/features/camera/CameraMode.tsx`
- `apps/web/src/App.css`
- `docs/active/SLICE_04_CAPTURE_UPLOAD_PHOTO.md`
- `docs/active/PROGRESS.md`

## Acceptance Criteria

- Capture menghasilkan image input.
- Upload JPG/PNG valid berjalan.
- File non-image ditolak.
- File terlalu besar ditolak.
- Preview image input tampil.
- Overlay Slice 03 tetap tersedia saat live camera.
- Archive dibuat setelah validation PASS.

## Validation

Diisi oleh script setelah validasi PASS.

## Manual Validation Fix

Manual validation first attempt found:
- Live camera PASS.
- Capture preview PASS.
- Delete preview PASS.
- Stop/restart camera PASS.
- Overlay guide/template failed to display.
- Upload JPG/PNG failed to produce preview.

Fix applied:
- Resolve relative template overlay asset URLs against local backend API base.
- Add generated guide fallback when guide asset fails.
- Add visible upload button and extension-based JPG/PNG fallback validation.

## Validation Result

Automated:
- `npm run lint --if-present` PASS.
- `npm run build` PASS.
- `python -m pytest` PASS via `apps/api/.venv/bin/python`.
- `git diff --check` PASS.

Manual:
- Browser validation confirmed PASS by local user.

Archive:
- `archives/2026-06-18_185816_slice-04_capture-upload-photo.zip`
