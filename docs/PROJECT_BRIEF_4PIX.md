# PROJECT_BRIEF_4PIX.md

**Nama Produk Resmi:** 4Pix Studio  
**Nama Pendek:** 4Pix  
**Cara Baca:** Four Pix  
**Slug Teknis:** fourpix  
**Tagline:** Bikin Pas Foto Lebih Apik  
**Dokumen:** Project Brief  
**Versi:** 1.0 Rebrand  
**Tanggal:** 17 Juni 2026  
**Status:** Locked untuk fondasi MVP awal

---

## 1. Ringkasan Project

4Pix Studio adalah aplikasi pas foto lokal berbasis kamera liveview. Aplikasi ini membantu operator mengambil foto dengan posisi wajah, kepala, leher, dan bahu yang lebih presisi menggunakan overlay guide atau overlay template transparan. Setelah foto diambil, sistem memproses gambar secara lokal untuk menghapus background, memasang subjek ke template formal seperti jas/dasi, memberi background warna standar, lalu mengekspor hasil pas foto siap pakai.

Fokus 4Pix Studio bukan sekadar aplikasi remove background. Core utama produk adalah:

```text
Live Camera Preview
→ Overlay Guide / Template Transparan
→ Capture Foto
→ Remove Background Lokal
→ Template Compositing Jas/Dasi
→ Manual Adjustment Ringan
→ Export Pas Foto JPG/PNG
```

Upload photo tetap tersedia sebagai mode alternatif, tetapi identitas utama aplikasi adalah live camera dengan overlay.

---

## 2. Alasan Rebrand

Project sebelumnya memakai nama lama. Mulai dokumen ini, nama project resmi dikunci menjadi 4Pix Studio.

Keputusan rebrand:

```text
nama produk lama → 4Pix Studio
nama app lama    → 4Pix
slug lama        → fourpix
prefix lama      → FOURPIX
```

Alasan rebrand:

1. **Lebih singkat dan mudah diingat**  
   4Pix lebih ringkas dibanding nama lama.

2. **Lebih enak dibaca dan didengar**  
   Cara baca “Four Pix” terasa modern dan natural.

3. **Punya makna lokal**  
   Secara plesetan bahasa Indonesia, 4Pix dapat terdengar seperti “apik”, yang berarti bagus, rapi, atau elok.

4. **Cocok untuk pas foto**  
   Angka 4 dapat diasosiasikan dengan ukuran pas foto 4x6, empat langkah proses, atau empat komponen utama produk.

5. **Lebih fleksibel untuk branding**  
   4Pix dapat berdiri sebagai logo, sedangkan 4Pix Studio dapat dipakai sebagai nama lengkap produk.

---

## 3. Problem Statement

Pembuatan pas foto formal sering membutuhkan banyak penyesuaian manual:

- posisi wajah tidak konsisten,
- kepala terlalu besar atau terlalu kecil,
- bahu tidak sejajar,
- leher tidak pas dengan template jas/dasi,
- background perlu diganti,
- hasil tempelan jas/dasi terlihat kurang natural,
- operator harus bolak-balik edit foto secara manual.

Jika foto diambil tanpa panduan, proses editing setelah capture menjadi lebih berat. 4Pix Studio menyelesaikan masalah ini dengan memberikan panduan sejak sebelum foto diambil melalui liveview overlay.

---

## 4. Product Vision

Membuat aplikasi pas foto lokal yang cepat, rapi, dan mudah dipakai oleh operator studio kecil, photobooth, percetakan, sekolah, kantor, atau kebutuhan personal.

Visi produk:

> 4Pix Studio membantu pengguna membuat pas foto formal yang apik melalui live camera overlay, local background removal, template jas/dasi, dan export cepat.

---

## 5. Target Pengguna

### 5.1 Operator Studio / Photobooth

Pengguna yang mengambil foto pelanggan dan mengekspor hasil pas foto.

Kebutuhan utama:

- kamera liveview,
- panduan posisi wajah,
- proses cepat,
- hasil konsisten,
- export JPG/PNG,
- tidak bergantung internet.

### 5.2 Percetakan / Jasa Dokumen

Pengguna yang melayani pas foto untuk kebutuhan dokumen.

Kebutuhan utama:

- pilih template formal,
- pilih warna background,
- ukuran pas foto standar,
- hasil siap cetak.

### 5.3 Sekolah / Kantor / Event

Pengguna yang perlu membuat banyak pas foto dengan tampilan konsisten.

Untuk MVP, batch mode belum dikerjakan, tetapi arah produk harus tetap mempertimbangkan kebutuhan ini untuk versi lanjut.

---

## 6. Nilai Utama Produk

4Pix Studio harus memberikan nilai berikut:

1. **Presisi sebelum capture**  
   Overlay membantu user memposisikan wajah dan bahu sejak awal.

2. **Proses lokal**  
   Foto tidak perlu dikirim ke cloud untuk remove background.

3. **Hasil formal cepat**  
   Template jas/dasi mempercepat pembuatan pas foto formal.

4. **Tetap bisa dikontrol manual**  
   Setelah proses otomatis, user tetap bisa melakukan adjustment ringan.

5. **Siap export**  
   Hasil dapat diekspor sebagai JPG/PNG sesuai ukuran pas foto.

---

## 7. Core Concept

### 7.1 Liveview sebagai Core

Layar utama 4Pix Studio adalah kamera liveview.

Di atas liveview terdapat overlay yang membantu user mengatur posisi:

- kepala,
- wajah,
- mata,
- dagu,
- leher,
- bahu,
- batas crop.

### 7.2 Dua Mode Overlay

4Pix Studio mendukung dua mode overlay:

#### A. Guide Overlay

Overlay berupa panduan transparan, misalnya:

- garis tengah wajah,
- area kepala,
- garis mata,
- garis dagu,
- area bahu,
- batas crop pas foto.

Guide overlay cocok untuk positioning umum.

#### B. Template Overlay Transparan

Overlay berupa template jas/dasi transparan di atas liveview.

Template overlay membantu user melihat perkiraan hasil akhir sebelum capture, terutama posisi:

- leher,
- bahu,
- kemeja,
- jas,
- dasi.

### 7.3 Capture dan Processing

Setelah posisi sesuai, user klik Capture. Sistem kemudian:

1. mengambil frame kamera,
2. menghapus background secara lokal,
3. menempatkan subjek ke canvas template,
4. menerapkan background warna,
5. memasang layer template jas/dasi,
6. menampilkan preview,
7. memberi ruang manual adjustment,
8. export hasil.

---

## 8. MVP Scope

MVP 4Pix Studio mencakup:

1. Live camera preview.
2. Camera selection jika tersedia lebih dari satu kamera.
3. Overlay guide transparan.
4. Overlay template transparan.
5. Capture foto dari kamera.
6. Upload photo sebagai mode alternatif.
7. Remove background lokal.
8. Template jas/dasi berbasis asset + JSON metadata.
9. Preview compositing.
10. Manual adjustment ringan.
11. Pilihan warna background standar.
12. Export JPG/PNG.
13. Minimal ukuran export 3x4 dan 4x6.

---

## 9. Non-Scope MVP

Fitur berikut tidak masuk MVP awal:

1. Login/user account.
2. Payment/subscription.
3. Database kompleks.
4. Cloud sync.
5. Cloud background removal.
6. Template marketplace.
7. Editor template visual.
8. Batch processing banyak foto.
9. Direct print ke printer.
10. AI face beautify.
11. Auto face landmark sempurna.
12. Auto scoring posisi wajah.
13. Mobile native app.
14. Desktop packaging final.
15. Multi-cabang/studio management.

---

## 10. Branding Lock

### 10.1 Nama Resmi

```text
4Pix Studio
```

### 10.2 Nama Pendek

```text
4Pix
```

### 10.3 Cara Baca

```text
Four Pix
```

### 10.4 Slug Teknis

```text
fourpix
```

### 10.5 Tagline

```text
Bikin Pas Foto Lebih Apik
```

### 10.6 Aturan Penulisan

Benar:

```text
4Pix Studio
4Pix
fourpix
FOURPIX
```

Hindari:

```text
nama lama project
variasi kapitalisasi nama lama
slug lama project
4pix sebagai nama package yang harus valid identifier Python/JS
```

Catatan teknis: gunakan `fourpix` untuk folder/repo/package agar aman di berbagai tooling.

---

## 11. Technical Direction Ringkas

Arah stack MVP:

```text
Frontend        : React + Vite + TypeScript
Camera Access   : Browser MediaDevices/getUserMedia
Backend Lokal   : Python FastAPI
Image Processing: Pillow, OpenCV optional
Remove BG       : rembg + ONNX Runtime CPU
Template Data   : JSON
Storage MVP     : Local filesystem
Database        : Tidak dipakai di MVP
Packaging       : Web lokal dulu, desktop packaging belakangan
```

Prinsip utama:

- Local-first.
- Kamera berjalan dari browser/webview.
- Image processing dijalankan backend lokal.
- Template tidak di-hardcode.
- Manual adjustment tetap wajib.

---

## 12. Success Criteria MVP

MVP dianggap berhasil jika:

1. User dapat membuka kamera dan melihat liveview.
2. Overlay guide/template transparan tampil di atas liveview.
3. User dapat capture foto.
4. User dapat upload foto sebagai alternatif.
5. Background dapat dihapus lokal.
6. Hasil dapat dipasang ke template jas/dasi.
7. User dapat melakukan geser, zoom, rotate ringan.
8. User dapat memilih background merah/biru/putih/abu/custom.
9. User dapat export JPG/PNG ukuran 3x4 dan 4x6.
10. Seluruh alur dapat berjalan tanpa cloud processing.

---

## 13. Risiko Utama

### 13.1 Kamera Browser

Risiko:

- permission ditolak,
- kamera tidak terdeteksi,
- behavior berbeda antar browser/device.

Mitigasi:

- tampilkan error jelas,
- sediakan upload photo mode,
- prioritaskan browser modern.

### 13.2 Kualitas Remove Background

Risiko:

- rambut kurang rapi,
- warna pakaian menyatu dengan background,
- tepi subjek kurang halus.

Mitigasi:

- gunakan background capture yang kontras,
- guide operator memberi arahan,
- tambahkan manual adjustment,
- optimalkan model/processing secara bertahap.

### 13.3 Template Tidak Natural

Risiko:

- leher tidak pas,
- bahu tidak align,
- kepala terlalu besar/kecil.

Mitigasi:

- overlay sebelum capture,
- metadata anchor template,
- manual adjustment setelah capture.

---

## 14. Keputusan yang Sudah Dikunci

1. Nama resmi project adalah **4Pix Studio**.
2. Nama pendek produk adalah **4Pix**.
3. Slug teknis adalah **fourpix**.
4. Core utama adalah live camera + overlay.
5. Upload photo hanya mode alternatif.
6. Remove background harus lokal untuk MVP.
7. Template jas/dasi berbasis asset + metadata JSON.
8. Manual adjustment tetap wajib.
9. MVP tidak memakai login, payment, database, atau cloud processing.

---

## 15. Next Step

Setelah dokumen awal dikunci, langkah implementasi dimulai dari:

```text
Slice 00 — Project Foundation
Slice 01 — Template Registry
Slice 02 — Live Camera Mode
Slice 03 — Overlay Engine
Slice 04 — Capture & Upload Photo
Slice 05 — Local Background Removal
Slice 06 — Template Compositing
Slice 07 — Manual Adjustment
Slice 08 — Export JPG/PNG
Slice 09 — MVP Polish & Validation
```
