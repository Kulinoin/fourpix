# 4Pix Studio

**4Pix Studio** adalah aplikasi pas foto lokal berbasis live camera overlay.

Tagline: **Bikin Pas Foto Lebih Apik**

Core MVP:

```text
Live Camera Preview
→ Overlay Guide / Template Transparan
→ Capture / Upload Foto
→ Local Background Removal
→ Template Compositing Jas/Dasi
→ Manual Adjustment Ringan
→ Export Pas Foto JPG/PNG
```

## Port Lokal

- Backend API: http://127.0.0.1:8404
- Frontend Web: http://127.0.0.1:5174

Port ini dipilih agar tidak konflik dengan aplikasi lain di PC lokal.

## Menjalankan Backend

Dari WSL:

```bash
cd /mnt/d/kulino/fourpix/apps/api
source .venv/bin/activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8404 --reload
```

Health check:

```bash
curl http://127.0.0.1:8404/health
```

Endpoint penting:

```text
GET  /health
GET  /templates
POST /process/remove-background
POST /process/compose
GET  /export/profiles
POST /export
```

## Menjalankan Frontend

Dari WSL terminal baru:

```bash
cd /mnt/d/kulino/fourpix/apps/web
npm run dev
```

Buka browser:

```text
http://127.0.0.1:5174
```

Jika perlu override API URL:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8404 npm run dev
```

## Validasi Otomatis

Backend:

```bash
cd /mnt/d/kulino/fourpix/apps/api
source .venv/bin/activate
python -m pytest -q
```

Frontend:

```bash
cd /mnt/d/kulino/fourpix/apps/web
npm run lint
npm run build
```

## Checklist Manual MVP

```text
[ ] Backend aktif di http://127.0.0.1:8404.
[ ] Frontend aktif di http://127.0.0.1:5174.
[ ] Template tampil minimal 2 pilihan.
[ ] Live Camera Mode dapat membuka kamera.
[ ] Guide overlay tampil.
[ ] Template overlay transparan tampil.
[ ] Capture kamera menghasilkan preview input.
[ ] Upload Photo Mode menerima JPG/PNG.
[ ] File non-image ditolak.
[ ] Remove Background Lokal menghasilkan PNG transparan.
[ ] Compose preview menampilkan background + subjek + template.
[ ] Geser X/Y mengubah preview final.
[ ] Zoom/scale mengubah preview final.
[ ] Rotate mengubah preview final.
[ ] Reset adjustment berjalan.
[ ] Background merah/biru/putih/abu/custom mempengaruhi preview.
[ ] Export JPG profile 3x4 berhasil.
[ ] Export PNG profile 3x4 berhasil.
[ ] Export JPG profile 4x6 berhasil.
[ ] Export PNG profile 4x6 berhasil.
[ ] File export dapat dibuka di image viewer umum.
[ ] Tidak ada cloud processing foto.
```

## Catatan Privacy MVP

- Foto diproses lokal di backend FastAPI.
- Tidak ada database untuk MVP.
- Tidak ada cloud remove background.
- Export dibuat hanya saat user menekan tombol export.
