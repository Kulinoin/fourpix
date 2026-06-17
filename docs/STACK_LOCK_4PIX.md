# STACK_LOCK_4PIX.md

**Nama Produk Resmi:** 4Pix Studio  
**Nama Pendek:** 4Pix  
**Dokumen:** Stack Lock  
**Versi:** 1.0 Rebrand  
**Tanggal:** 17 Juni 2026  
**Status:** Locked untuk MVP v1 awal

---

## 1. Tujuan Dokumen

Dokumen ini mengunci stack teknologi 4Pix Studio MVP agar pengembangan tidak berubah-ubah tanpa alasan kuat.

Codex/AI coding agent wajib mengikuti dokumen ini ketika membuat atau mengubah kode.

---

## 2. Prinsip Stack

Stack 4Pix Studio dipilih dengan prinsip:

1. **Cepat dibuat.**
2. **Cocok untuk image processing lokal.**
3. **Bisa akses kamera.**
4. **Tidak bergantung cloud untuk proses foto.**
5. **Mudah dikembangkan bertahap.**
6. **Tidak terlalu berat untuk MVP.**
7. **Tetap memungkinkan packaging desktop di masa depan.**

---

## 3. Stack Summary Locked

```text
Frontend        : React + Vite + TypeScript
Camera Access   : Browser MediaDevices/getUserMedia
Backend Lokal   : Python FastAPI
Image Processing: Pillow
Optional CV      : OpenCV, hanya jika benar-benar perlu
Remove BG       : rembg + ONNX Runtime CPU
Template Data   : JSON
Storage MVP     : Local filesystem
Database        : Tidak dipakai di MVP
Desktop Package : Ditunda; Tauri sebagai kandidat lanjutan
Cloud Processing: Dilarang untuk MVP
```

---

## 4. Naming Lock

Nama produk dan teknis:

```text
Nama resmi       : 4Pix Studio
Nama pendek      : 4Pix
Cara baca        : Four Pix
Slug teknis      : fourpix
Folder/repo      : fourpix
Dokumen prefix   : 4PIX / FOURPIX sesuai konteks
```

Aturan:

1. UI boleh memakai `4Pix Studio` atau `4Pix`.
2. Folder/repo/package gunakan `fourpix`.
3. Jangan gunakan nama lama untuk file, UI, package, komentar, atau dokumen baru.
4. Jika ada sisa nama lama, anggap sebagai tech debt rebrand dan bersihkan dalam slice terkait.

---

## 5. Frontend Stack

### 5.1 Locked Choice

```text
React + Vite + TypeScript
```

### 5.2 Alasan

React + Vite cocok untuk MVP karena:

- cepat untuk prototyping UI,
- mudah mengelola komponen camera/overlay/editor,
- Vite ringan untuk development,
- TypeScript membantu menjaga struktur data template,
- mudah berkomunikasi dengan backend lokal.

### 5.3 Tugas Frontend

Frontend bertanggung jawab untuk:

1. Menampilkan home/start screen.
2. Menampilkan template selection.
3. Mengakses kamera via browser API.
4. Menampilkan live camera preview.
5. Menampilkan overlay guide/template transparan.
6. Melakukan capture frame dari video.
7. Mengirim image ke backend.
8. Menampilkan preview hasil remove background/compositing.
9. Menyediakan manual adjustment.
10. Menyediakan pilihan background color.
11. Memicu export/download.
12. Menampilkan error/loading state.

### 5.4 Struktur Frontend Direkomendasikan

```text
apps/web/src/
├── app/
├── components/
├── features/
│   ├── camera/
│   ├── templates/
│   ├── overlay/
│   ├── editor/
│   └── export/
├── lib/
├── types/
└── main.tsx
```

### 5.5 Library UI

Untuk MVP, UI library belum dikunci.

Aturan:

- Boleh memakai CSS biasa, Tailwind, atau komponen custom jika project owner setuju.
- Jangan menambahkan UI library besar tanpa alasan jelas.
- Prioritas adalah fungsi berjalan dulu, bukan UI mewah.

---

## 6. Camera Access

### 6.1 Locked Choice

```text
Browser MediaDevices/getUserMedia
```

### 6.2 Alasan

Akses kamera dari browser cocok untuk MVP karena:

- langsung didukung web app,
- bisa dipakai di local dev server,
- mudah digabung dengan canvas capture,
- tidak perlu native camera SDK di MVP.

### 6.3 Requirement

Frontend harus mendukung:

1. Request permission kamera.
2. List camera devices jika memungkinkan.
3. Pilih camera device.
4. Start/stop camera stream.
5. Capture frame ke canvas.
6. Error handling permission denied/not found.

### 6.4 Non-Scope

Tidak memakai:

- DSLR tethering langsung,
- Canon SDK,
- native camera SDK,
- gPhoto2,
- mobile native camera.

Fitur kamera profesional bisa dipertimbangkan setelah MVP.

---

## 7. Backend Stack

### 7.1 Locked Choice

```text
Python FastAPI
```

### 7.2 Alasan

FastAPI cocok sebagai backend lokal karena:

- ringan,
- cepat dibuat,
- cocok untuk API berbasis type hints,
- mudah menerima upload file,
- mudah terhubung dengan library Python image processing,
- cocok untuk proses lokal tanpa cloud.

### 7.3 Tugas Backend

Backend bertanggung jawab untuk:

1. Health check.
2. Listing template.
3. Validasi template.
4. Validasi file image.
5. Remove background lokal.
6. Compositing template.
7. Export JPG/PNG.
8. Temporary file handling.
9. Error response yang jelas.

### 7.4 Endpoint MVP

Endpoint awal:

```text
GET  /health
GET  /templates
POST /process/remove-background
POST /process/compose
POST /export
```

Endpoint boleh disesuaikan saat implementasi, tetapi fungsinya harus tetap sesuai PRD.

---

## 8. Image Processing Stack

### 8.1 Locked Choice

```text
Pillow
```

### 8.2 Optional

```text
OpenCV
```

OpenCV hanya dipakai jika benar-benar diperlukan.

### 8.3 Alasan

Pillow cukup untuk:

- membuka image,
- resize,
- crop,
- alpha compositing,
- convert format,
- export JPG/PNG,
- membuat background warna.

OpenCV dapat dipakai untuk:

- preprocessing,
- transform kompleks,
- future landmark/face workflow,
- operasi image yang tidak nyaman di Pillow.

### 8.4 Rule

Mulai dari Pillow dulu. Tambahkan OpenCV hanya setelah ada kebutuhan nyata.

---

## 9. Background Removal Stack

### 9.1 Locked Choice MVP

```text
rembg + ONNX Runtime CPU
```

### 9.2 Alasan

- Bisa berjalan lokal.
- Tidak butuh cloud untuk proses foto.
- Cocok untuk MVP background removal.
- Python-friendly.
- Dapat dipakai di backend lokal.

### 9.3 Requirement

- Input: JPG/PNG dari capture atau upload.
- Output: PNG transparan.
- Error harus ditangani.
- Tidak boleh mengirim foto ke cloud.

### 9.4 Model

Model default rembg boleh dipakai untuk MVP.

Optimasi model dapat dilakukan setelah MVP jika:

- kualitas edge rambut kurang,
- performa terlalu lambat,
- hasil tidak konsisten pada kasus pas foto.

---

## 10. Template Data Stack

### 10.1 Locked Choice

```text
JSON metadata + PNG assets
```

### 10.2 Alasan

- Mudah dibaca frontend/backend.
- Mudah ditambahkan tanpa database.
- Cocok untuk asset-based template.
- Bisa divalidasi dengan schema.

### 10.3 Struktur

```text
templates/{template_id}/
├── template.json
├── thumbnail.png
├── overlay-guide.png
├── overlay-preview.png
├── layer-back.png
└── layer-front.png
```

### 10.4 Rule

Template tidak boleh di-hardcode di UI atau backend. Semua template harus dibaca dari registry/folder.

---

## 11. Storage MVP

### 11.1 Locked Choice

```text
Local filesystem
```

### 11.2 Folder Direkomendasikan

```text
fourpix/
├── templates/
├── exports/
├── tmp/
├── archives/
└── docs/
```

### 11.3 Rule

- Temporary file harus dapat dibersihkan.
- Export disimpan hanya ketika user meminta.
- Archive/snapshot development disimpan di `archives/`.
- Jangan menyimpan foto user ke cloud.

---

## 12. Database Lock

### 12.1 Keputusan MVP

```text
Tidak memakai database untuk MVP.
```

### 12.2 Alasan

MVP belum membutuhkan:

- user account,
- order history,
- payment,
- multi-tenant,
- template marketplace.

Data template cukup dari JSON. Export cukup ke filesystem.

### 12.3 Kapan Database Dipertimbangkan

Database baru dipertimbangkan setelah MVP jika ada kebutuhan:

- riwayat order,
- daftar pelanggan,
- batch session,
- template management UI,
- multi-user,
- lisensi/pembayaran.

---

## 13. Packaging Lock

### 13.1 Keputusan MVP

```text
Web lokal dulu.
```

### 13.2 Kandidat Lanjutan

```text
Tauri
```

### 13.3 Rule

Jangan mengerjakan packaging desktop di MVP kecuali user eksplisit meminta.

Alasan:

- core flow harus stabil dulu,
- image processing harus valid dulu,
- packaging dapat menambah kompleksitas setup.

---

## 14. Dilarang untuk MVP

Codex/agent tidak boleh menambahkan tanpa instruksi eksplisit:

1. Laravel backend.
2. Database kompleks.
3. Cloud remove background.
4. Login/auth.
5. Payment.
6. Prisma/ORM.
7. Next.js jika project sudah dikunci Vite.
8. Electron/Tauri packaging final.
9. Native mobile framework.
10. Template marketplace.
11. Direct print.
12. AI beautify.
13. External analytics yang menyentuh foto.

---

## 15. Validasi Stack

Setiap slice harus memvalidasi stack sesuai konteks:

### Frontend

```bash
npm install
npm run lint
npm run build
```

Command aktual boleh menyesuaikan package.json.

### Backend

```bash
python -m venv .venv
pip install -r requirements.txt
pytest
```

Command aktual boleh menyesuaikan setup project.

### Full MVP

Minimal validasi:

```text
frontend build PASS
backend tests PASS
health endpoint PASS
template registry PASS
camera capture manual check PASS
remove background PASS
compose/export PASS
```

---

## 16. Prosedur Perubahan Stack

Jika stack perlu berubah, Codex harus:

1. Menjelaskan masalah teknis nyata.
2. Menunjukkan bukti error/limitasi.
3. Mengusulkan alternatif.
4. Menjelaskan dampak ke dokumen.
5. Meminta persetujuan user.
6. Mengubah dokumen terkait setelah disetujui.

Tanpa proses ini, stack lock tidak boleh diubah.
