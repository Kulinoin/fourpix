# Slice 05 — Local Background Removal

Status: implemented, pending manual browser validation.

## Target

Menghapus background secara lokal dari foto input.

## Scope

- Backend endpoint POST /process/remove-background.
- Integrasi rembg + ONNX Runtime CPU melalui dependency rembg[cpu].
- Validasi JPG/PNG.
- Batas ukuran file 12 MB.
- Output PNG transparan.
- UI frontend untuk upload foto, proses remove background, loading, error, preview input, dan preview PNG transparan.
- Proses lokal, tanpa cloud background removal.

## Non-Scope

- Template compositing.
- Background color final.
- Manual adjustment final.
- Export JPG/PNG final.
- Training/fine-tuning model AI.
- Cloud processing.

## Capture Guideline Awal

Untuk hasil remove background yang lebih stabil, standar capture 4Pix diarahkan ke:

- background putih atau terang bersih,
- pencahayaan rata,
- tidak backlight,
- tidak ada bayangan keras di belakang kepala, rambut, leher, dan bahu,
- jarak subjek ke background cukup,
- posisi kepala/bahu tetap mengikuti overlay.

## Endpoint

POST /process/remove-background

Content-Type: multipart/form-data

Field: file

Output: image/png transparan

## Catatan Model

rembg memakai model ONNX lokal. Proses nyata pertama dapat membutuhkan model tersedia/cache lokal lebih dulu. Setelah dependency dan model tersedia, proses foto berjalan lokal tanpa cloud background removal.

## Validasi

- Backend tests PASS.
- Frontend build PASS.
- Endpoint reachable.
- Archive dibuat setelah validasi PASS.
