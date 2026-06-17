# TEMPLATE_ENGINE_SPEC.md

**Nama Produk Resmi:** 4Pix Studio  
**Nama Pendek:** 4Pix  
**Dokumen:** Template Engine Specification  
**Versi:** 1.0 Rebrand  
**Tanggal:** 17 Juni 2026  
**Status:** Locked untuk MVP v1 awal

---

## 1. Tujuan Dokumen

Dokumen ini mendefinisikan sistem template 4Pix Studio.

Template 4Pix Studio bukan hanya gambar jas/dasi. Template harus menjadi paket asset yang memiliki:

- layer visual,
- overlay liveview,
- metadata posisi,
- anchor wajah/leher/bahu,
- aturan render,
- aturan export,
- validasi asset.

Tujuannya agar hasil pas foto lebih konsisten, natural, dan dapat dikembangkan tanpa hardcode di aplikasi.

---

## 2. Konsep Utama

4Pix Studio menggunakan template untuk dua kebutuhan utama:

1. **Liveview Overlay**  
   Membantu user memposisikan wajah, kepala, leher, dan bahu sebelum capture.

2. **Final Compositing**  
   Menggabungkan subjek hasil remove background dengan background warna dan layer jas/dasi.

Karena itu, satu template idealnya memiliki asset untuk liveview dan asset untuk final render.

---

## 3. Prinsip Template Engine

1. **Template-aware**  
   Engine membaca metadata, bukan menebak posisi dari gambar saja.

2. **Coordinate-based**  
   Semua posisi penting disimpan dalam koordinat canvas template.

3. **Layered rendering**  
   Hasil akhir disusun dari background, subjek, dan layer template.

4. **Manual adjustment support**  
   Template memberi posisi awal, user tetap bisa mengubah posisi.

5. **Reusable**  
   Template baru dapat ditambahkan sebagai folder asset + JSON tanpa mengubah kode utama.

6. **Strict validation**  
   Template JSON dan file asset harus divalidasi sebelum digunakan.

7. **Liveview-first**  
   Template harus membantu positioning sebelum capture, bukan hanya render setelah foto jadi.

---

## 4. Struktur Folder Template

Struktur template MVP:

```text
templates/
└── jas_hitam_dasi_01/
    ├── template.json
    ├── thumbnail.png
    ├── overlay-guide.png
    ├── overlay-preview.png
    ├── layer-back.png
    └── layer-front.png
```

### 4.1 template.json

Metadata utama template.

### 4.2 thumbnail.png

Gambar kecil untuk daftar pilihan template.

### 4.3 overlay-guide.png

Panduan transparan untuk liveview. Biasanya berisi:

- garis kepala,
- garis mata,
- garis dagu,
- center line,
- area bahu,
- batas crop.

### 4.4 overlay-preview.png

Template transparan untuk liveview. Biasanya berupa jas/dasi dengan opacity/alpha yang disiapkan agar user bisa melihat perkiraan hasil.

### 4.5 layer-back.png

Layer template di belakang subjek jika dibutuhkan.

Contoh:

- bagian kerah belakang,
- efek bayangan belakang,
- elemen pakaian yang harus berada di bawah leher/subjek.

### 4.6 layer-front.png

Layer template di depan subjek.

Contoh:

- jas,
- kemeja,
- dasi,
- kerah depan,
- masker/penutup area leher agar compositing natural.

Catatan: untuk template sederhana, `layer-back.png` boleh berupa PNG transparan kosong atau optional sesuai validator.

---

## 5. Coordinate System

Semua koordinat template menggunakan canvas final template.

Contoh canvas MVP:

```json
{
  "width": 900,
  "height": 1200
}
```

Coordinate origin:

```text
(0,0) berada di kiri atas canvas.
X bertambah ke kanan.
Y bertambah ke bawah.
```

Semua asset layer harus memiliki ukuran canvas yang sama dengan metadata `canvas.width` dan `canvas.height`, kecuali thumbnail.

---

## 6. Template Metadata Schema MVP

Contoh `template.json`:

```json
{
  "schemaVersion": "1.0",
  "id": "jas_hitam_dasi_01",
  "name": "Jas Hitam Dasi",
  "category": "male_formal",
  "canvas": {
    "width": 900,
    "height": 1200,
    "ratio": "3:4"
  },
  "assets": {
    "thumbnail": "thumbnail.png",
    "overlayGuide": "overlay-guide.png",
    "overlayPreview": "overlay-preview.png",
    "layerBack": "layer-back.png",
    "layerFront": "layer-front.png"
  },
  "faceGuide": {
    "centerX": 450,
    "headTopY": 220,
    "eyeY": 420,
    "chinY": 610,
    "safeHeadWidth": 360,
    "safeHeadHeight": 470
  },
  "neckAnchor": {
    "x": 450,
    "y": 650
  },
  "shoulderGuide": {
    "leftX": 230,
    "rightX": 670,
    "y": 760
  },
  "subjectInitialTransform": {
    "x": 0,
    "y": 0,
    "scale": 1.0,
    "rotation": 0
  },
  "adjustmentLimits": {
    "minScale": 0.75,
    "maxScale": 1.35,
    "minRotation": -10,
    "maxRotation": 10,
    "maxTranslateX": 220,
    "maxTranslateY": 260
  },
  "exportProfiles": ["3x4", "4x6"],
  "notes": "Template formal jas hitam dengan dasi untuk MVP."
}
```

---

## 7. Field Metadata

### 7.1 schemaVersion

Versi schema template.

Tujuan:

- memudahkan migrasi template,
- menjaga compatibility,
- mencegah template lama dipakai tanpa validasi.

### 7.2 id

ID unik template.

Aturan:

- lowercase,
- snake_case,
- tanpa spasi,
- cocok dengan nama folder.

Contoh:

```text
jas_hitam_dasi_01
jas_hitam_tanpa_dasi_01
formal_wanita_01
```

### 7.3 name

Nama yang tampil di UI.

Contoh:

```text
Jas Hitam Dasi
```

### 7.4 category

Kategori template.

Contoh:

```text
male_formal
female_formal
neutral_formal
```

### 7.5 canvas

Ukuran canvas dasar template.

Semua layer final harus mengikuti ukuran ini.

### 7.6 assets

Daftar asset file yang dipakai template.

Path relatif terhadap folder template.

### 7.7 faceGuide

Koordinat panduan wajah.

Digunakan untuk:

- overlay guide,
- initial placement,
- future face alignment.

### 7.8 neckAnchor

Titik acuan leher.

Digunakan agar kepala/subjek dapat diposisikan lebih natural ke template jas/dasi.

### 7.9 shoulderGuide

Panduan bahu.

Digunakan untuk overlay liveview dan quality check manual.

### 7.10 subjectInitialTransform

Transform awal subjek setelah remove background.

Digunakan sebelum user melakukan manual adjustment.

### 7.11 adjustmentLimits

Batas manual adjustment agar user tidak membuat hasil terlalu ekstrem.

### 7.12 exportProfiles

Daftar ukuran export yang didukung template.

---

## 8. Overlay Guide

Overlay guide dapat berupa image transparan atau digambar secara dinamis dari metadata.

### 8.1 Opsi MVP

Untuk MVP, opsi paling cepat:

```text
overlay-guide.png
```

### 8.2 Isi Guide

Guide dapat berisi:

- garis vertikal tengah,
- oval kepala,
- garis mata,
- garis dagu,
- garis bahu,
- batas aman crop.

### 8.3 Aturan

- Guide harus transparan.
- Guide harus memiliki rasio/canvas sesuai template.
- Guide harus mudah dilihat di atas liveview.
- Guide tidak boleh masuk ke hasil export final.

---

## 9. Overlay Preview Template

Overlay preview adalah template jas/dasi transparan untuk liveview.

### 9.1 Tujuan

Membantu operator melihat kira-kira hasil akhir sebelum capture.

### 9.2 Aturan

- Harus transparan.
- Tidak boleh terlalu solid sampai menutup wajah/subjek.
- Harus align dengan template final.
- Berasal dari asset template.

---

## 10. Final Rendering Order

Render order MVP:

```text
1. Background color
2. Layer back template
3. Subject transparent PNG
4. Layer front template
```

Contoh:

```text
background merah
→ layer kerah belakang
→ kepala/leher/subjek
→ jas/dasi/kerah depan
```

---

## 11. Subject Transform

Subject transform terdiri dari:

```json
{
  "x": 0,
  "y": 0,
  "scale": 1.0,
  "rotation": 0
}
```

### 11.1 x/y

Perpindahan posisi subjek.

### 11.2 scale

Ukuran subjek.

### 11.3 rotation

Rotasi ringan untuk memperbaiki foto miring.

MVP hanya perlu rotasi kecil, misalnya -10 sampai 10 derajat.

---

## 12. Manual Adjustment

Manual adjustment wajib didukung karena auto placement tidak akan selalu sempurna.

MVP minimal:

1. Geser kiri/kanan.
2. Geser atas/bawah.
3. Zoom in/out.
4. Rotate ringan.
5. Reset.

Adjustment harus mempengaruhi preview dan export.

---

## 13. Export Profiles

Contoh export profile:

```json
{
  "id": "3x4",
  "name": "Pas Foto 3x4",
  "widthPx": 900,
  "heightPx": 1200,
  "ratio": "3:4"
}
```

```json
{
  "id": "4x6",
  "name": "Pas Foto 4x6",
  "widthPx": 1200,
  "heightPx": 1800,
  "ratio": "2:3"
}
```

Catatan: ukuran pixel dan DPI dapat dikunci lebih detail setelah kebutuhan cetak ditentukan.

---

## 14. Template Validation

Validator template harus memeriksa:

1. `template.json` ada.
2. JSON valid.
3. `schemaVersion` didukung.
4. `id` sesuai folder atau minimal unik.
5. `canvas.width` dan `canvas.height` valid.
6. Asset wajib tersedia.
7. Layer final sesuai ukuran canvas.
8. Koordinat berada dalam canvas.
9. Export profile valid.
10. Adjustment limit masuk akal.

Template invalid tidak boleh membuat aplikasi crash.

---

## 15. Template Registry

Backend harus membaca semua template dari folder:

```text
templates/
```

Response `GET /templates` minimal:

```json
[
  {
    "id": "jas_hitam_dasi_01",
    "name": "Jas Hitam Dasi",
    "category": "male_formal",
    "thumbnailUrl": "/templates/jas_hitam_dasi_01/thumbnail.png",
    "overlayGuideUrl": "/templates/jas_hitam_dasi_01/overlay-guide.png",
    "overlayPreviewUrl": "/templates/jas_hitam_dasi_01/overlay-preview.png"
  }
]
```

Jangan expose path filesystem absolut ke frontend.

---

## 16. Placeholder Template MVP

Jika asset final belum tersedia saat slice awal, boleh memakai placeholder dengan syarat:

1. Nama file tetap sesuai spec.
2. Placeholder jelas terlihat sebagai placeholder.
3. Tidak disembunyikan di kode.
4. Dicatat di progress/issue.
5. Nanti diganti asset final tanpa mengubah logic.

---

## 17. Naming Asset

Gunakan nama file standar:

```text
template.json
thumbnail.png
overlay-guide.png
overlay-preview.png
layer-back.png
layer-front.png
```

Jangan membuat variasi nama tanpa memperbarui spec dan validator.

---

## 18. Future Extension

Setelah MVP, template engine dapat dikembangkan dengan:

1. Face landmark anchor.
2. Auto alignment mata/dagu.
3. Hair refinement mask.
4. Multi-layer advanced clothing.
5. Template editor visual.
6. Template versioning.
7. Print layout profile.
8. Validation UI untuk pembuat template.
