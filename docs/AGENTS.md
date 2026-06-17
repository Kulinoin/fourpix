# AGENTS.md

**Nama Produk Resmi:** 4Pix Studio  
**Nama Pendek:** 4Pix  
**Slug Teknis:** fourpix  
**Dokumen:** Instruksi Kerja untuk Codex / AI Coding Agent  
**Versi:** 1.0 Rebrand  
**Tanggal:** 17 Juni 2026  
**Status:** Locked untuk pola kerja awal MVP

---

## 1. Tujuan Dokumen

Dokumen ini adalah aturan kerja untuk Codex atau AI coding agent saat mengerjakan project **4Pix Studio**.

Codex wajib mengikuti dokumen ini agar implementasi tetap:

1. sesuai arah MVP,
2. tidak melebar,
3. tidak memakai asumsi sembarangan,
4. bisa divalidasi per slice,
5. memiliki archive/snapshot setelah validasi PASS dan sebelum commit/push,
6. aman untuk dilanjutkan atau di-rollback,
7. konsisten dengan rebrand 4Pix Studio.

---

## 2. Konteks Project

4Pix Studio adalah aplikasi pas foto lokal dengan core utama:

```text
Live Camera Preview
→ Overlay Guide / Template Transparan
→ Capture Foto
→ Local Background Removal
→ Template Compositing Jas/Dasi
→ Manual Adjustment Ringan
→ Export Pas Foto JPG/PNG
```

Fungsi utama 4Pix Studio bukan sekadar upload foto dan remove background, tetapi **liveview kamera dengan overlay template/guide** agar posisi wajah, kepala, leher, dan bahu lebih presisi sebelum foto diambil.

---

## 3. Rebrand Lock

Project ini sudah rebrand dan nama resminya sekarang 4Pix Studio.

Aturan wajib:

```text
Nama produk resmi : 4Pix Studio
Nama pendek       : 4Pix
Cara baca         : Four Pix
Slug teknis       : fourpix
Tagline           : Bikin Pas Foto Lebih Apik
```

Dilarang memakai nama lama di kode/dokumen baru:

```text
nama lama project
variasi kapitalisasi nama lama
slug lama project
prefix lama project
```

Jika ditemukan sisa nama lama, lakukan salah satu:

1. Bersihkan jika masih dalam scope slice.
2. Laporkan sebagai rebrand debt jika di luar scope.

Untuk folder, repo, package, env prefix, atau slug, gunakan:

```text
fourpix
```

Jangan memakai package/folder utama yang diawali angka jika tooling tidak mendukung.

---

## 4. Dokumen Wajib Dibaca Sebelum Coding

Sebelum menulis atau mengubah kode, Codex wajib membaca dokumen berikut:

```text
docs/PROJECT_BRIEF_4PIX.md
docs/PRD_4PIX_MVP_v1.md
docs/STACK_LOCK_4PIX.md
docs/TEMPLATE_ENGINE_SPEC.md
docs/WORKFLOW_PEMBANGUNAN_4PIX.md
AGENTS.md
```

Jika lokasi dokumen berbeda, cari di folder project. Jangan membuat ulang dokumen tanpa instruksi.

---

## 5. Prinsip Utama Kerja Codex

### 5.1 Jangan Menggunakan Asumsi Tanpa Data

Codex tidak boleh mengarang kondisi project.

Sebelum patch, cek dulu:

1. struktur folder aktual,
2. isi file terkait,
3. package/version aktual,
4. command yang tersedia,
5. error aktual jika ada.

Gunakan command inspeksi yang aman.

Contoh:

```bash
pwd
find . -maxdepth 3 -type f | sort | sed 's#^./##' | head -200
ls -la
```

---

### 5.2 Kerjakan Per Slice

Codex wajib bekerja dengan pendekatan **vertical slice**.

Satu slice harus punya:

1. target jelas,
2. scope jelas,
3. non-scope jelas,
4. file yang diubah jelas,
5. validasi jelas,
6. archive setelah validasi PASS,
7. commit/push hanya setelah user menyetujui.

Jangan mengerjakan banyak slice sekaligus.

---

### 5.3 MVP Dulu, Jangan Melebar

Untuk MVP, fokus hanya pada:

1. live camera preview,
2. overlay guide,
3. overlay template transparan,
4. capture,
5. upload photo alternatif,
6. remove background lokal,
7. template compositing jas/dasi,
8. manual adjustment ringan,
9. background color,
10. export JPG/PNG.

Jangan mengerjakan fitur non-MVP seperti login, payment, database kompleks, template marketplace, direct print, AI beautify, mobile native, atau desktop packaging kecuali user eksplisit meminta.

---

## 6. Stack Lock

Codex wajib mengikuti stack yang dikunci di `STACK_LOCK_4PIX.md`.

Ringkasan:

```text
Frontend        : React + Vite + TypeScript
Camera Access   : Browser MediaDevices/getUserMedia
Backend Lokal   : Python FastAPI
Image Processing: Pillow, OpenCV optional jika benar-benar perlu
Remove BG       : rembg + ONNX Runtime CPU
Template Data   : JSON
Storage MVP     : Local filesystem
Database        : Tidak dipakai di MVP
Cloud Processing: Tidak dipakai / forbidden untuk MVP
```

Dilarang mengganti stack tanpa:

1. bukti masalah teknis,
2. alasan jelas,
3. dampak ke dokumen,
4. persetujuan user.

---

## 7. Aturan Template Engine

Template tidak boleh di-hardcode di UI atau backend.

Template wajib dibaca dari struktur folder:

```text
templates/{template_id}/template.json
```

Setiap template minimal memiliki konsep:

```text
template.png          → tidak dipakai sebagai standar MVP jika layer split digunakan
overlay-guide.png     → panduan liveview
overlay-preview.png   → template transparan untuk liveview
layer-back.png        → layer belakang subjek
layer-front.png       → layer depan subjek
template.json         → metadata posisi/canvas/anchor
```

Jika asset final belum tersedia pada slice awal, gunakan placeholder yang jelas dan tercatat, bukan dummy tersembunyi di kode.

---

## 8. Workflow Wajib

Codex wajib mengikuti urutan:

```text
1. Baca dokumen terkait.
2. Inspect project aktual.
3. Tentukan scope slice.
4. Implementasi perubahan.
5. Jalankan validasi.
6. Jika validasi PASS, buat archive/snapshot.
7. Stage file secara eksplisit.
8. Commit hanya jika user menyetujui.
9. Push hanya jika user menyetujui.
10. Laporkan hasil.
```

Urutan yang tidak boleh dibalik:

```text
Validasi PASS
→ Archive/Snapshot
→ Stage eksplisit
→ Commit
→ Push
```

Archive wajib dibuat **setelah validasi PASS** dan **sebelum commit/push**.

---

## 9. Aturan Implementasi

### 9.1 Dilarang `git add .`

Jangan memakai:

```bash
git add .
```

Gunakan explicit staging sesuai file/folder yang benar-benar diubah.

Contoh:

```bash
git add apps/web/src/features/camera apps/api/app/routes docs/active/PROGRESS.md
```

---

### 9.2 Jangan Commit Sebelum Validasi PASS

Commit hanya boleh dibuat setelah:

1. implementasi selesai dalam scope slice,
2. validasi PASS,
3. archive/snapshot dibuat,
4. user menyetujui commit/push.

---

### 9.3 Jangan Push Tanpa Persetujuan User

Codex tidak boleh langsung push kecuali user sudah memberi instruksi eksplisit.

Pola kerja default:

```text
Implementasi + validasi
→ archive/snapshot setelah validasi PASS
→ laporkan hasil validasi dan lokasi archive
→ tunggu approval user
→ commit
→ push jika disetujui
```

Jika user sudah memberi instruksi “validasi pass lalu commit/push”, tetap pastikan archive dibuat setelah validasi PASS dan sebelum commit.

---

## 10. Aturan Archive / Snapshot

### 10.1 Kapan Archive Dibuat

Archive wajib dibuat setelah semua validasi slice PASS.

Jangan membuat archive sebelum validasi selesai, karena archive harus merepresentasikan state yang sudah layak disimpan.

### 10.2 Lokasi

```text
archives/
```

### 10.3 Format Nama

```text
YYYY-MM-DD_HHMMSS_slice-XX_nama-slice.zip
```

Contoh:

```text
2026-06-17_142530_slice-02_live-camera-mode.zip
```

### 10.4 Exclude dari Archive

Jangan masukkan:

```text
.git/
node_modules/
.venv/
__pycache__/
dist/
build/
tmp/
exports/ jika berisi foto user asli
```

### 10.5 Archive Gagal

Jika archive gagal:

1. Jangan commit.
2. Jangan push.
3. Laporkan error.
4. Perbaiki masalah archive.
5. Ulangi archive.

---

## 11. Validasi

### 11.1 Frontend

Gunakan command aktual dari `package.json`.

Biasanya:

```bash
npm run lint
npm run build
```

### 11.2 Backend

Gunakan command aktual project.

Biasanya:

```bash
pytest
```

Jika test belum ada, lakukan startup/import check dan endpoint health.

### 11.3 Manual Validation

Untuk fitur kamera/overlay, validasi manual wajib dilakukan atau minimal dilaporkan jika tidak bisa dilakukan di environment agent.

Checklist:

```text
[ ] Kamera aktif.
[ ] Liveview tampil.
[ ] Overlay tampil.
[ ] Capture menghasilkan image.
[ ] Upload alternatif berjalan.
[ ] Remove background lokal berjalan.
[ ] Compose/export berjalan.
```

Jika tidak bisa validasi kamera karena environment headless, laporkan keterbatasan dengan jujur dan pastikan kode memiliki fallback/error handling.

---

## 12. Rebrand Validation

Setelah rebrand atau sebelum MVP final, jalankan pencarian nama lama:

```bash
Gunakan pencarian teks project untuk memastikan variasi nama lama tidak muncul lagi.
Exclude folder `.git`, `node_modules`, `.venv`, dan `archives`.
```

Jika masih ada nama lama:

- hapus jika tidak perlu,
- atau jelaskan kenapa masih ada.

---

## 13. Larangan Khusus

Codex dilarang:

1. Mengubah stack tanpa persetujuan.
2. Menambahkan cloud processing foto.
3. Menambahkan login/payment/database pada MVP.
4. Menghapus manual adjustment.
5. Meng-hardcode template di UI/backend.
6. Commit sebelum validasi PASS.
7. Commit sebelum archive dibuat.
8. Push tanpa persetujuan user.
9. Memakai `git add .`.
10. Menggunakan nama lama project untuk pekerjaan baru.

---

## 14. Format Laporan ke User

Setelah mengerjakan slice, laporkan:

```text
Slice:
Scope:
File changed:
Validation:
Archive:
Commit status:
Push status:
Notes / next step:
```

Jika ada validasi yang tidak bisa dijalankan, tulis jelas alasannya.

---

## 15. Prinsip Akhir

Codex harus menjaga project tetap:

```text
simple,
local-first,
MVP-focused,
template-aware,
validated,
archived,
explicitly staged,
user-approved before commit/push.
```
