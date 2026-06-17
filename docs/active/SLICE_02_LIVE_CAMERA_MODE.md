# Slice 02 — Live Camera Mode

Tanggal: 2026-06-17
Status: Implemented, pending manual browser validation by operator.

## Target

Membuat Live Camera Mode berjalan di frontend 4Pix Studio.

## Scope

- Request permission kamera via Browser MediaDevices/getUserMedia.
- Tampilkan live video.
- Camera device selection jika device terbaca.
- Start camera.
- Stop camera.
- Restart stream saat device diganti.
- Error handling untuk browser unsupported, permission denied, no camera, camera busy, dan constraint gagal.
- Cleanup stream saat komponen unmount / keluar mode.

## Non-Scope

- Overlay guide/template.
- Capture frame.
- Upload photo.
- Remove background.
- Template compositing.
- Manual adjustment.
- Export.

## Manual Validation Checklist

- [ ] Buka frontend di browser.
- [ ] Pilih Live Camera Mode.
- [ ] Pilih template.
- [ ] Klik Start Camera.
- [ ] Browser meminta izin kamera.
- [ ] Liveview tampil.
- [ ] Stop Camera menghentikan stream.
- [ ] Jika ada lebih dari satu kamera, select device bisa dipakai.
- [ ] Jika permission ditolak, error user-friendly tampil.

## Notes

Overlay akan dikerjakan pada Slice 03.
Capture dan upload photo akan dikerjakan pada Slice 04.

## Visual Patch

After initial implementation, the global stylesheet was corrected to match 4Pix Studio visual direction:

- photo studio / camera-tech
- slate / deep navy / cyan / electric blue
- not warm amber/orange
- not Gudange-like visual treatment

The UI visual direction is now documented in docs/active/UI_VISUAL_LOCK_4PIX.md.

## Layout Alignment Patch

A small layout alignment patch was added after manual visual review:

- camera mode content width is constrained,
- topbar status aligns with the camera layout,
- right control panel no longer feels outside the main camera workspace,
- responsive behavior remains intact.

## Clean Background Patch

Manual review found the decorative full-page grid/background lines visually distracting and potentially confusing on wider screens.

Patch applied:

- reset default Vite root layout,
- remove full-page decorative grid lines,
- keep 4Pix slate-blue-cyan visual direction,
- keep camera workspace centered and responsive,
- keep hero and cards aligned cleanly.
