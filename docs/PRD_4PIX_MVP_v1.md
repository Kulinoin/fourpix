# PRD_4PIX_MVP_v1.md

**Nama Produk Resmi:** 4Pix Studio  
**Nama Pendek:** 4Pix  
**Dokumen:** Product Requirements Document MVP  
**Versi:** 1.0 Rebrand  
**Tanggal:** 17 Juni 2026  
**Status:** Locked untuk MVP v1 awal

---

## 1. Tujuan PRD

Dokumen ini mendefinisikan kebutuhan produk untuk 4Pix Studio MVP v1.

MVP difokuskan untuk membuktikan alur utama:

```text
Live Camera
→ Overlay Guide / Template Transparan
→ Capture Foto
→ Remove Background Lokal
→ Compose ke Template Jas/Dasi
→ Manual Adjustment
→ Pilih Background
→ Export Pas Foto
```

PRD ini menjadi acuan implementasi agar pengembangan tidak melebar ke fitur yang belum diperlukan.

---

## 2. Product Goal

Membangun aplikasi pas foto lokal yang dapat membantu user mengambil foto dengan posisi wajah, kepala, leher, dan bahu lebih presisi melalui liveview overlay, lalu memproses hasilnya menjadi pas foto formal dengan template jas/dasi.

---

## 3. MVP Goal

MVP 4Pix Studio v1 harus membuktikan kemampuan inti berikut:

1. Kamera dapat dibuka dan menampilkan liveview.
2. Overlay guide/template transparan dapat tampil presisi di atas liveview.
3. Foto dapat di-capture dari kamera.
4. Foto dapat di-upload sebagai alternatif.
5. Background dapat dihapus secara lokal.
6. Hasil dapat dipasang ke template jas/dasi.
7. User dapat melakukan adjustment ringan.
8. User dapat memilih background warna standar.
9. User dapat export JPG/PNG pas foto.

---

## 4. Pengguna MVP

### 4.1 Operator

Operator adalah pengguna utama MVP.

Tugas operator:

- memilih mode kerja,
- memilih template,
- membuka kamera,
- mengarahkan subjek agar pas dengan overlay,
- mengambil foto,
- melakukan adjustment ringan,
- memilih warna background,
- export hasil.

### 4.2 Subjek Foto

Subjek foto adalah orang yang difoto.

Untuk MVP, subjek tidak memiliki role khusus. Operator memberi arahan berdasarkan liveview dan overlay.

---

## 5. Prinsip UX MVP

1. **Liveview adalah pusat aplikasi**  
   Layar utama harus menonjolkan kamera dan overlay.

2. **Cepat dari capture ke export**  
   User harus bisa menyelesaikan pas foto tanpa banyak layar rumit.

3. **Template mudah dipilih**  
   Template jas/dasi ditampilkan sebagai kartu/thumbnail.

4. **Adjustment sederhana**  
   User cukup dapat geser, zoom, rotate, reset.

5. **Hasil terlihat sebelum export**  
   Preview final wajib jelas.

6. **Local-first dan privacy-friendly**  
   Komunikasikan bahwa proses foto berlangsung lokal.

7. **Fallback selalu ada**  
   Jika kamera gagal, upload photo mode tetap bisa digunakan.

---

## 6. User Flow

### 6.1 Live Camera Flow

```text
1. User membuka 4Pix Studio.
2. User memilih Live Camera Mode.
3. User memilih template jas/dasi.
4. User memilih mode overlay:
   - Guide Overlay, atau
   - Template Overlay Transparan.
5. Sistem meminta izin kamera.
6. Liveview kamera muncul.
7. Overlay tampil di atas liveview.
8. User mengatur posisi wajah/kepala/leher/bahu sesuai overlay.
9. User klik Capture.
10. Sistem mengambil frame kamera.
11. Sistem menghapus background lokal.
12. Sistem menampilkan preview compositing.
13. User melakukan adjustment ringan jika perlu.
14. User memilih warna background.
15. User memilih ukuran export.
16. User export JPG/PNG.
```

### 6.2 Upload Photo Flow

```text
1. User membuka 4Pix Studio.
2. User memilih Upload Photo Mode.
3. User meng-upload foto.
4. User memilih template jas/dasi.
5. Sistem menghapus background lokal.
6. Sistem menampilkan preview compositing.
7. User melakukan adjustment ringan.
8. User memilih background.
9. User memilih ukuran export.
10. User export JPG/PNG.
```

---

## 7. Fitur MVP

## 7.1 Home / Start Screen

### Deskripsi

Layar awal untuk memilih mode kerja.

### Requirement

- Tampilkan nama aplikasi `4Pix Studio`.
- Tampilkan tagline `Bikin Pas Foto Lebih Apik`.
- Tampilkan dua mode:
  - Live Camera Mode.
  - Upload Photo Mode.
- Live Camera Mode harus menjadi pilihan utama secara visual.
- Tidak ada login.

### Acceptance Criteria

- User dapat masuk ke Live Camera Mode.
- User dapat masuk ke Upload Photo Mode.
- Tidak ada auth wall.
- Branding sudah memakai 4Pix Studio / 4Pix / fourpix.

---

## 7.2 Template Selection

### Deskripsi

User memilih template formal yang akan digunakan.

### Requirement

- Tampilkan daftar template dalam bentuk kartu/thumbnail.
- Template minimal MVP:
  1. Jas Hitam + Dasi.
  2. Jas Hitam Tanpa Dasi.
- Setiap template memiliki:
  - id,
  - name,
  - category,
  - thumbnail,
  - overlay guide,
  - overlay preview,
  - final layer,
  - metadata JSON.
- Setelah template dipilih, overlay yang sesuai dimuat.

### Acceptance Criteria

- User dapat memilih template.
- Template terpilih mempengaruhi overlay liveview.
- Template terpilih digunakan saat final rendering.
- Template invalid tidak merusak aplikasi.

---

## 7.3 Live Camera Preview

### Deskripsi

Layar utama untuk melihat kamera secara langsung.

### Requirement

- Aplikasi meminta izin kamera.
- Tampilkan video liveview.
- Tampilkan status kamera aktif/tidak aktif.
- Jika lebih dari satu kamera tersedia, user dapat memilih kamera.
- Tersedia tombol Capture.
- Tersedia tombol kembali ke pemilihan template/mode.
- Aspect ratio liveview harus konsisten dengan overlay.

### Acceptance Criteria

- Kamera dapat dibuka di browser/device yang mendukung.
- Liveview tampil normal.
- Capture menghasilkan image frame.
- Jika izin kamera ditolak, aplikasi menampilkan pesan error jelas.
- Jika kamera tidak tersedia, aplikasi menyarankan Upload Photo Mode.

---

## 7.4 Overlay Engine

### Deskripsi

Overlay engine menampilkan panduan transparan di atas liveview kamera.

### Mode Overlay

1. **Guide Overlay**
   - Garis tengah wajah.
   - Area kepala.
   - Garis mata.
   - Garis dagu.
   - Area bahu.
   - Batas crop pas foto.

2. **Template Overlay Transparan**
   - Preview jas/dasi transparan.
   - Membantu melihat perkiraan posisi leher/bahu.
   - Berbasis asset dari template terpilih.

### Requirement

- Overlay tampil di atas liveview.
- User dapat mengganti mode overlay.
- Overlay mengikuti ukuran container liveview.
- Overlay tidak ikut masuk ke capture mentah kecuali secara eksplisit dibutuhkan untuk debug.
- Overlay source berasal dari template asset/metadata, bukan hardcoded.

### Acceptance Criteria

- Guide overlay dapat tampil.
- Template overlay transparan dapat tampil.
- User dapat switch antar overlay.
- Overlay tetap align saat ukuran viewport berubah.

---

## 7.5 Camera Capture

### Deskripsi

User mengambil frame dari liveview kamera.

### Requirement

- Capture frame dari video ke canvas.
- Simpan hasil capture sebagai image blob/base64 untuk dikirim ke backend.
- Tampilkan preview capture sebelum proses jika diperlukan.
- Tampilkan loading saat proses berjalan.

### Acceptance Criteria

- Klik Capture menghasilkan image.
- Image dapat diproses backend.
- Jika capture gagal, tampil error yang bisa dipahami.

---

## 7.6 Upload Photo Mode

### Deskripsi

Mode alternatif jika user sudah punya foto atau kamera tidak tersedia.

### Requirement

- User dapat upload JPG/PNG.
- Validasi file image.
- Batas ukuran file dapat ditentukan di config.
- Setelah upload, flow masuk ke processing dan editor.

### Acceptance Criteria

- JPG/PNG valid dapat diproses.
- File non-image ditolak.
- Error file terlalu besar tampil jelas.

---

## 7.7 Local Background Removal

### Deskripsi

Background foto dihapus secara lokal.

### Requirement

- Backend menerima image.
- Backend menjalankan remove background lokal.
- Hasil berupa PNG transparan.
- Proses tidak bergantung cloud.
- Tampilkan loading dan error handling.

### Acceptance Criteria

- Background dapat dihapus dari capture/upload.
- Hasil transparan dapat dipakai compositing.
- Proses tetap berjalan tanpa internet setelah dependency terpasang.
- Jika gagal, aplikasi menampilkan error dan opsi ulangi.

---

## 7.8 Template Compositing

### Deskripsi

Menggabungkan background warna, subjek transparan, dan layer template.

### Render Order MVP

```text
1. Background warna
2. Layer back template jika ada
3. Subjek hasil remove background
4. Layer front template jas/dasi
5. Optional debug guide hanya untuk development
```

### Requirement

- Backend membaca template metadata.
- Subjek ditempatkan berdasarkan initial transform.
- User adjustment diterapkan saat rendering.
- Canvas output mengikuti export profile.

### Acceptance Criteria

- Subjek dapat tampil dengan jas/dasi.
- Background warna tampil di belakang.
- Layer template tampil sesuai urutan.
- Hasil preview sesuai pilihan template.

---

## 7.9 Manual Adjustment

### Deskripsi

User menyempurnakan posisi subjek setelah proses otomatis.

### Requirement

- Geser X/Y.
- Zoom/scale.
- Rotate kecil.
- Reset posisi.
- Preview realtime atau semi-realtime.
- Batas adjustment mengikuti metadata template jika tersedia.

### Acceptance Criteria

- User dapat menggeser subjek.
- User dapat zoom in/out.
- User dapat rotate ringan.
- User dapat reset.
- Adjustment mempengaruhi hasil export.

---

## 7.10 Background Color

### Deskripsi

User memilih warna background pas foto.

### Requirement

Preset MVP:

- merah,
- biru,
- putih,
- abu-abu muda,
- custom color sederhana.

### Acceptance Criteria

- User dapat memilih warna background.
- Warna tampil di preview.
- Warna ikut ke export.

---

## 7.11 Export

### Deskripsi

User mengekspor hasil pas foto.

### Requirement

- Format MVP:
  - JPG,
  - PNG.
- Ukuran MVP:
  - 3x4,
  - 4x6.
- Export satu foto final.
- Nama file default mengandung `4pix` atau `fourpix`.

### Acceptance Criteria

- User dapat export JPG.
- User dapat export PNG.
- Ukuran output sesuai profile.
- File dapat dibuka di image viewer umum.

---

## 8. Export Profile MVP

Contoh profile awal:

```json
{
  "profiles": [
    {
      "id": "3x4",
      "name": "Pas Foto 3x4",
      "widthPx": 900,
      "heightPx": 1200,
      "ratio": "3:4"
    },
    {
      "id": "4x6",
      "name": "Pas Foto 4x6",
      "widthPx": 1200,
      "heightPx": 1800,
      "ratio": "2:3"
    }
  ]
}
```

Catatan: ukuran pixel final dapat disesuaikan lagi setelah kebutuhan cetak/DPI dikunci.

---

## 9. Error Handling MVP

Error yang wajib ditangani:

1. Kamera tidak tersedia.
2. Izin kamera ditolak.
3. Browser tidak mendukung camera API.
4. Upload file tidak valid.
5. Remove background gagal.
6. Template asset tidak lengkap.
7. Template metadata invalid.
8. Export gagal.
9. Backend tidak aktif.

Setiap error harus memberi pesan yang dapat dipahami user, bukan stack trace mentah.

---

## 10. Performance Target MVP

Target awal:

1. UI tidak freeze saat kamera aktif.
2. Capture terasa instan.
3. Remove background boleh menampilkan loading.
4. Preview compositing tidak boleh terasa terlalu berat.
5. File sementara dibersihkan secara aman.

---

## 11. Privacy Requirement

Untuk MVP:

1. Foto diproses lokal.
2. Tidak ada upload ke cloud.
3. Tidak ada analytics yang mengirim foto.
4. Temporary file harus dikelola.
5. Export hanya dibuat ketika user meminta.

---

## 12. Non-Functional Requirement

### 12.1 Maintainability

- Struktur kode modular.
- Feature folder jelas.
- Template engine tidak hardcoded.
- Config terpisah dari logic.

### 12.2 Testability

- Backend service dapat diuji unit/integration.
- Template validation dapat diuji.
- Export/compositing dapat diuji dengan fixture.

### 12.3 Portability

- MVP berjalan sebagai web lokal.
- Packaging desktop ditunda, tetapi struktur tidak boleh menghalangi packaging masa depan.

---

## 13. Non-Scope MVP

Tidak dikerjakan di MVP:

1. Login.
2. Role/user management.
3. Payment.
4. Cloud sync.
5. Cloud AI processing.
6. Template marketplace.
7. Template editor visual.
8. Batch processing.
9. Direct print.
10. AI beautify.
11. Auto face scoring.
12. Mobile native.
13. Desktop installer final.
14. Multi-tenant/multi-cabang.

---

## 14. MVP Acceptance Checklist Global

MVP dianggap selesai jika checklist berikut PASS:

```text
[ ] Branding sudah 4Pix Studio / 4Pix / fourpix.
[ ] Live Camera Mode berjalan.
[ ] Upload Photo Mode berjalan.
[ ] Template selection berjalan.
[ ] Guide overlay berjalan.
[ ] Template overlay transparan berjalan.
[ ] Capture kamera menghasilkan image.
[ ] Remove background lokal berjalan.
[ ] Compositing jas/dasi berjalan.
[ ] Manual adjustment berjalan.
[ ] Background color berjalan.
[ ] Export JPG berjalan.
[ ] Export PNG berjalan.
[ ] Minimal profile 3x4 berjalan.
[ ] Minimal profile 4x6 berjalan.
[ ] Error kamera/upload/backend ditangani.
[ ] Tidak ada cloud processing foto.
```

---

## 15. Roadmap Setelah MVP

Setelah MVP valid, fitur lanjutan dapat dipertimbangkan:

1. Print layout 4R/A4.
2. Batch mode.
3. Better hair edge refinement.
4. Face landmark detection.
5. Auto scoring posisi wajah.
6. Template editor internal.
7. Desktop packaging.
8. Direct print.
9. Preset kebutuhan dokumen Indonesia.
10. Multi-template library.
