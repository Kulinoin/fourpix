# Slice 09 — MVP Polish & Validation

Tanggal: 18 Juni 2026  
Status: Implementasi + validasi otomatis + archive

## Target

Merampungkan MVP 4Pix Studio agar siap demo internal.

## Scope

- Polish App utama agar alur MVP lebih jelas.
- Start screen dengan mode Live Camera dan Upload Photo.
- Template selection tetap dari backend registry.
- Live camera stage dengan guide/template overlay.
- Upload JPG/PNG fallback.
- Remove background lokal.
- Compose preview otomatis setelah subject/background/adjustment berubah.
- Manual adjustment X/Y, scale, rotate, reset.
- Background preset merah, biru, putih, abu muda, dan custom.
- Export JPG/PNG untuk profile 3x4 dan 4x6.
- Error, loading, empty, dan success state.
- README run guide diperbarui.
- Backend MVP endpoint validation test ditambahkan.
- Rebrand check dijalankan.
- Archive final Slice 09 dibuat setelah validasi PASS.

## Non-Scope

- Login/auth.
- Database.
- Cloud processing.
- Payment.
- Template marketplace.
- Direct print.
- Batch processing.
- Desktop packaging.

## File Utama

- `apps/web/src/App.tsx`
- `apps/web/src/App.css`
- `apps/api/tests/test_mvp_polish_validation.py`
- `README.md`
- `docs/active/SLICE_09_MVP_POLISH_VALIDATION.md`
- `docs/active/MVP_MANUAL_VALIDATION_CHECKLIST.md`
- `docs/active/PROGRESS.md`

## Validasi Otomatis

```text
[ ] Backend pytest PASS.
[ ] Frontend lint PASS.
[ ] Frontend build PASS.
[ ] Rebrand check PASS.
[ ] Archive dibuat setelah validasi PASS.
```

## Validasi Manual

```text
[ ] Buka app.
[ ] Pilih template.
[ ] Live Camera Mode berjalan.
[ ] Overlay guide/template tampil.
[ ] Capture foto.
[ ] Upload foto.
[ ] Remove background lokal.
[ ] Preview compositing tampil.
[ ] Manual adjustment mempengaruhi preview.
[ ] Background color mempengaruhi preview.
[ ] Export JPG 3x4.
[ ] Export PNG 3x4.
[ ] Export JPG 4x6.
[ ] Export PNG 4x6.
```

## Catatan

Environment agent/headless tidak selalu bisa memvalidasi kamera fisik. Validasi kamera wajib dilakukan manual di browser lokal.
