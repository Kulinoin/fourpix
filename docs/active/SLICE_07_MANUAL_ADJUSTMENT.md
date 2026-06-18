# Slice 07 — Manual Adjustment

Tanggal: 18 Juni 2026  
Status: Done — automated validation PASS, manual browser validation PASS, archived

## Target

Memberi kontrol manual untuk hasil compositing 4Pix Studio:

- geser X,
- geser Y,
- scale/zoom,
- rotate ringan,
- reset,
- adjustment mempengaruhi preview compositing.

## Scope

- UI slider adjustment di `CameraMode`.
- Background preset/custom tetap tersedia di preview.
- Integrasi frontend ke `POST /process/compose` dengan payload `transform`.
- Preview compositing otomatis re-render saat X/Y/scale/rotation/background berubah.
- Clamp adjustment mengikuti metadata template jika tersedia, fallback ke limit MVP.
- CORS backend mengizinkan POST dari frontend local dev.
- Test backend untuk memastikan transform manual mengubah posisi subject.

## Non-Scope

- Export JPG/PNG final.
- Print layout.
- Face landmark auto alignment.
- Template editor visual.
- Batch mode.

## Acceptance Criteria

- User dapat menggeser subject pada X/Y.
- User dapat zoom in/out dengan scale.
- User dapat rotate ringan.
- User dapat reset adjustment.
- Preview compositing berubah setelah adjustment.
- Backend transform tetap dibatasi agar tidak ekstrem.
- Archive dibuat setelah validasi PASS dan sebelum commit/push.

## Manual Browser Checklist

- Buka backend `http://127.0.0.1:8404`.
- Buka frontend `http://127.0.0.1:5174`.
- Pilih template.
- Capture foto atau upload JPG/PNG.
- Klik `Process ke Preview Compositing`.
- Geser X dan pastikan preview berubah.
- Geser Y dan pastikan preview berubah.
- Ubah scale/zoom dan pastikan preview berubah.
- Ubah rotate dan pastikan preview berubah.
- Klik Reset dan pastikan nilai kembali default.
