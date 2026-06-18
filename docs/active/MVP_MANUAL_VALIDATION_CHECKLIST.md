# 4Pix Studio — MVP Manual Validation Checklist

Gunakan checklist ini setelah Slice 09 validasi otomatis PASS.

## Server

```text
[ ] Backend API aktif: http://127.0.0.1:8404
[ ] Frontend Web aktif: http://127.0.0.1:5174
[ ] GET /health OK
[ ] GET /templates menampilkan minimal 2 template
```

## Live Camera Flow

```text
[ ] Buka 4Pix Studio.
[ ] Klik Live Camera Mode.
[ ] Pilih template.
[ ] Klik Nyalakan Kamera.
[ ] Browser meminta permission kamera.
[ ] Liveview tampil.
[ ] Guide Overlay tampil.
[ ] Template Transparan tampil saat dipilih.
[ ] Capture Foto menghasilkan preview input.
[ ] Jika kamera gagal, pesan error mudah dipahami.
```

## Upload Photo Flow

```text
[ ] Klik Upload Photo Mode.
[ ] Upload JPG valid.
[ ] Upload PNG valid.
[ ] File non-image ditolak.
[ ] File terlalu besar ditolak.
[ ] Preview input tampil.
```

## Processing

```text
[ ] Remove Background Lokal berhasil.
[ ] PNG transparan tampil.
[ ] Preview final compositing tampil.
[ ] Background merah tampil.
[ ] Background biru tampil.
[ ] Background putih tampil.
[ ] Background abu muda tampil.
[ ] Custom color tampil.
```

## Manual Adjustment

```text
[ ] Geser X mengubah posisi subjek.
[ ] Geser Y mengubah posisi subjek.
[ ] Zoom mengubah ukuran subjek.
[ ] Rotate mengubah kemiringan subjek.
[ ] Reset Adjustment kembali ke default.
[ ] Adjustment mempengaruhi export.
```

## Export

```text
[ ] Export JPG 3x4 berhasil.
[ ] Export PNG 3x4 berhasil.
[ ] Export JPG 4x6 berhasil.
[ ] Export PNG 4x6 berhasil.
[ ] Nama file export memakai fourpix.
[ ] File export bisa dibuka di image viewer umum.
```

## Privacy / MVP Lock

```text
[ ] Tidak ada login.
[ ] Tidak ada database.
[ ] Tidak ada cloud remove background.
[ ] Tidak ada upload foto ke cloud.
```
