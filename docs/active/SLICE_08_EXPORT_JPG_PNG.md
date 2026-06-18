# Slice 08 — Export JPG/PNG

## Status

Implemented pending validation.

## Target

Menambahkan kemampuan export hasil final compositing ke format JPG dan PNG.

## Scope

- Backend endpoint `GET /export/profiles`.
- Backend endpoint `POST /export`.
- Export profile MVP:
  - `3x4` → 900×1200 px.
  - `4x6` → 1200×1800 px.
- Format export:
  - JPG.
  - PNG.
- Nama file default memakai prefix `fourpix-*`.
- Frontend control untuk memilih ukuran dan download JPG/PNG.
- Automated test backend untuk service dan route export.

## Non-Scope

- Direct print.
- Batch export.
- Layout cetak 4R/A4.
- DPI/cetak presisi final.
- Penyimpanan riwayat export ke database.

## Implementasi

Backend mengekspor image final yang dikirim frontend. Image akan disesuaikan ke profile ukuran menggunakan center crop/fit agar output tepat sesuai ukuran profile.

JPG akan di-flatten ke background putih jika input masih memiliki alpha channel. PNG tetap mempertahankan alpha channel jika ada.

Frontend mengambil preview compositing yang sedang tampil, mengirimkannya ke endpoint `/export`, lalu memicu download file dari response backend.

## Acceptance Criteria

- User dapat export JPG.
- User dapat export PNG.
- Ukuran `3x4` menghasilkan 900×1200 px.
- Ukuran `4x6` menghasilkan 1200×1800 px.
- Filename default memakai prefix `fourpix-`.
- Export hanya aktif setelah preview final/compositing tersedia.
- Validasi backend dan frontend PASS.
- Archive dibuat setelah validasi PASS dan sebelum commit/push.

## Manual Validation Checklist

- [ ] Jalankan backend di `http://127.0.0.1:8404`.
- [ ] Jalankan frontend di `http://127.0.0.1:5174`.
- [ ] Capture/upload foto.
- [ ] Remove background.
- [ ] Compose template.
- [ ] Ubah manual adjustment.
- [ ] Export PNG 3x4.
- [ ] Export JPG 3x4.
- [ ] Export PNG 4x6.
- [ ] Export JPG 4x6.
- [ ] Buka file hasil export di image viewer.
- [ ] Pastikan ukuran pixel sesuai profile.
