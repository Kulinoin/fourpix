# Slice 06 — Template Compositing

Tanggal: 18 Juni 2026  
Status: Implemented, waiting validation/commit approval

## Target

Menggabungkan hasil subject transparan dari remove background dengan background warna dan layer template jas/dasi.

## Scope

- Backend service compositing berbasis Pillow.
- Endpoint POST /process/compose.
- Render order sesuai Template Engine Spec.
- Background color preset dan custom sederhana.
- Initial transform dari metadata template.
- Frontend helper untuk request compositing.
- Test backend untuk render order dan validasi template id.
- Archive dibuat setelah validasi PASS.

## Non-scope

- Manual adjustment UI detail.
- Export JPG/PNG final.
- Print layout.
- Face landmark auto alignment.
- Template editor visual.

## Endpoint

POST /process/compose

Form data:

- subject: PNG/JPG subject transparan.
- template_id: id template dari registry.
- background_color: hex color, contoh #E53935.
- transform: JSON string berisi x, y, scale, rotation.

Response:

- image/png.

## Render Order

1. Background color.
2. Layer back template.
3. Subject transparent PNG.
4. Layer front template.

## Validation Checklist

- [x] Backend compositor service dibuat.
- [x] Compose route dibuat.
- [x] Frontend helper compose dibuat.
- [x] Backend test untuk render order.
- [ ] Manual browser validation: capture/upload → remove background → compose preview.
