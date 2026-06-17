# WORKFLOW_PEMBANGUNAN_4PIX.md

**Nama Produk Resmi:** 4Pix Studio  
**Nama Pendek:** 4Pix  
**Dokumen:** Workflow Pembangunan  
**Versi:** 1.0 Rebrand  
**Tanggal:** 17 Juni 2026  
**Status:** Locked untuk pola kerja MVP awal

---

## 1. Tujuan Dokumen

Dokumen ini mengatur cara pembangunan 4Pix Studio agar rapi, terukur, dan tidak melebar.

4Pix Studio dibangun dengan pendekatan **vertical slice**, yaitu setiap tahap menghasilkan bagian aplikasi yang bisa dijalankan, divalidasi, diarsipkan, dan dilanjutkan.

---

## 2. Prinsip Pembangunan

1. **MVP dulu, jangan melebar**  
   Fokus utama adalah liveview + overlay + capture + remove background + template + export.

2. **Local-first**  
   Jangan memakai cloud service untuk proses foto di MVP.

3. **Slice kecil dan selesai**  
   Jangan membuat banyak fitur setengah jadi.

4. **Validasi sebelum lanjut**  
   Setiap slice harus punya checklist validasi.

5. **Archive setelah validasi PASS**  
   Setelah validasi PASS dan sebelum commit/push, wajib buat archive/snapshot.

6. **No hardcoded demo flow**  
   Template harus dibaca dari metadata, bukan ditempel langsung di kode.

7. **Manual adjustment wajib ada**  
   Jangan bergantung pada auto placement sempurna.

8. **Error harus terlihat**  
   Kamera gagal, remove background gagal, export gagal harus punya pesan jelas.

9. **Dokumen ikut diperbarui**  
   Jika ada keputusan teknis berubah, dokumen terkait harus ikut diperbarui.

10. **Branding konsisten**  
   Gunakan 4Pix Studio / 4Pix / fourpix. Jangan memakai nama lama project.

---

## 3. Scope MVP yang Dibangun

MVP membangun:

1. Web frontend React + Vite.
2. Backend lokal FastAPI.
3. Health check.
4. Template registry JSON.
5. Live camera preview.
6. Overlay guide/template.
7. Capture kamera.
8. Upload photo mode.
9. Remove background lokal.
10. Template compositing.
11. Preview/edit.
12. Background color.
13. Export JPG/PNG.

---

## 4. Non-Scope Selama MVP

Jangan mengerjakan:

1. Login.
2. Database.
3. Payment.
4. Cloud sync.
5. Template marketplace.
6. Batch mode.
7. Direct print.
8. AI beautify.
9. Mobile native.
10. Desktop packaging.
11. Template editor visual.

---

## 5. Struktur Project Direkomendasikan

```text
fourpix/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── camera/
│   │   │   │   ├── templates/
│   │   │   │   ├── overlay/
│   │   │   │   ├── editor/
│   │   │   │   └── export/
│   │   │   ├── lib/
│   │   │   ├── types/
│   │   │   └── main.tsx
│   │   ├── public/
│   │   └── package.json
│   └── api/
│       ├── app/
│       │   ├── main.py
│       │   ├── routes/
│       │   ├── services/
│       │   │   ├── background_removal.py
│       │   │   ├── template_registry.py
│       │   │   ├── compositor.py
│       │   │   └── exporter.py
│       │   └── schemas/
│       ├── tests/
│       └── requirements.txt
├── templates/
│   ├── jas_hitam_dasi_01/
│   └── jas_hitam_tanpa_dasi_01/
├── docs/
├── exports/
├── tmp/
├── archives/
├── AGENTS.md
├── .gitignore
└── README.md
```

---

## 6. Aturan Implementasi

### 6.1 Jangan Langsung Lompat ke UI Cantik

Urutan benar:

```text
fungsi jalan
→ validasi benar
→ UI dirapikan
→ UX dipoles
```

### 6.2 Jangan Mengubah Stack Tanpa Alasan

Stack sudah dikunci di `STACK_LOCK_4PIX.md`.

Perubahan stack harus punya alasan:

- masalah teknis nyata,
- bukti error/limitasi,
- opsi pengganti,
- dampak ke dokumen,
- persetujuan user.

### 6.3 Jangan Membuat Template Hardcoded

Template harus berasal dari:

```text
templates/{template_id}/template.json
```

UI dan backend harus membaca daftar template dari registry/folder.

### 6.4 Jangan Menghapus Manual Adjustment

Walau ada auto placement, manual adjustment tetap wajib.

### 6.5 Jangan Memakai Nama Lama

Nama lama project tidak boleh muncul pada kode/dokumen baru.

Jika ditemukan sisa nama lama saat implementasi, bersihkan dalam scope slice rebrand atau laporkan sebagai follow-up jika di luar scope.

---

## 7. Workflow Wajib per Slice

Setiap slice wajib mengikuti urutan ini:

```text
1. Baca dokumen terkait.
2. Inspect struktur project aktual.
3. Tentukan scope slice.
4. Implementasi perubahan.
5. Jalankan validasi.
6. Jika validasi PASS, buat archive/snapshot.
7. Stage file secara eksplisit.
8. Commit hanya jika user menyetujui.
9. Push hanya jika user menyetujui.
10. Laporkan hasil dan next step.
```

Urutan penting:

```text
Implementasi
→ Validasi PASS
→ Archive/Snapshot
→ Stage eksplisit
→ Commit
→ Push
```

Archive harus selalu dibuat **setelah validasi PASS** dan **sebelum commit/push**.

---

## 8. Aturan Archive / Snapshot

### 8.1 Tujuan

Archive dibuat agar project memiliki history lokal yang bisa digunakan untuk:

- rollback,
- audit perubahan,
- membandingkan versi,
- menyimpan kondisi valid sebelum commit/push,
- menjaga safety saat dikerjakan oleh Codex/AI agent.

### 8.2 Lokasi Archive

Archive disimpan di:

```text
archives/
```

### 8.3 Format Nama Archive

Format wajib:

```text
YYYY-MM-DD_HHMMSS_slice-XX_nama-slice.zip
```

Contoh:

```text
2026-06-17_142530_slice-02_live-camera-mode.zip
```

### 8.4 Isi Archive

Archive harus mencakup project state yang relevan setelah validasi PASS.

Default:

- source code,
- docs,
- config,
- templates placeholder/final,
- tests.

Jangan memasukkan:

- `.git/`,
- `node_modules/`,
- `.venv/`,
- `__pycache__/`,
- build output besar,
- temporary file besar,
- export foto user asli jika tidak diperlukan.

### 8.5 Contoh Command Archive

Dari root project:

```bash
mkdir -p archives
zip -r archives/2026-06-17_142530_slice-02_live-camera-mode.zip . \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.venv*" \
  -x "*__pycache__*" \
  -x "*dist*" \
  -x "*tmp*" \
  -x "*exports*"
```

Command boleh disesuaikan dengan OS/tooling, tetapi prinsipnya wajib sama.

### 8.6 Archive Gagal

Jika archive gagal dibuat:

1. Jangan commit.
2. Jangan push.
3. Laporkan error.
4. Perbaiki penyebab archive gagal.
5. Buat archive ulang.

---

## 9. Git Rules

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

### 9.2 Commit Message

Format disarankan:

```text
feat(camera): add live camera preview
fix(template): validate missing overlay asset
docs(rebrand): lock 4Pix Studio brand
```

### 9.3 Commit Hanya Setelah

Commit hanya boleh dibuat setelah:

1. scope slice selesai,
2. validasi PASS,
3. archive/snapshot dibuat,
4. user menyetujui commit.

### 9.4 Push Hanya Setelah

Push hanya boleh dilakukan jika user memberi instruksi eksplisit.

---

## 10. Validasi Umum

Validasi disesuaikan dengan slice, tetapi minimal mencakup:

### 10.1 Frontend

```bash
npm run lint
npm run build
```

Jika command belum tersedia, laporkan dan gunakan validasi alternatif yang tersedia.

### 10.2 Backend

```bash
pytest
```

Jika test belum ada, minimal jalankan import/startup check dan endpoint health.

### 10.3 Manual Check

Untuk fitur kamera dan overlay, manual check diperlukan:

- kamera aktif,
- overlay tampil,
- capture berhasil,
- hasil masuk ke proses berikutnya.

### 10.4 Rebrand Check

Untuk slice rebrand atau dokumen, cek nama lama:

```bash
Gunakan pencarian teks project untuk memastikan variasi nama lama tidak muncul lagi.
Jalankan dari root project dan exclude folder `.git`, `node_modules`, `.venv`, dan `archives`.
```

Jika masih ada nama lama, pastikan memang disengaja sebagai catatan migrasi atau sudah dibersihkan.

---

## 11. Slice Plan MVP

## Slice 00 — Project Foundation

### Target

Membuat fondasi project web + api berjalan lokal.

### Scope

- Struktur folder project `fourpix/`.
- Vite React app.
- FastAPI app.
- Health endpoint.
- Frontend call backend health.
- README awal.
- `.gitignore`.
- Folder `archives/`.

### Acceptance Criteria

- Frontend dev server hidup.
- Backend dev server hidup.
- `GET /health` return ok.
- Frontend menampilkan status backend ok.
- Branding tampil sebagai 4Pix Studio.
- Validasi PASS.
- Archive dibuat sebelum commit/push.

---

## Slice 01 — Template Registry

### Target

Membuat sistem membaca template dari folder dan JSON.

### Scope

- Folder `templates/`.
- Minimal dua template dummy/placeholder.
- `template.json` schema awal.
- Backend `GET /templates`.
- Frontend template selection.

### Acceptance Criteria

- Backend bisa membaca daftar template.
- Template invalid tidak ditampilkan.
- Frontend menampilkan template thumbnail/name.
- Template terpilih tersimpan di state.
- Archive dibuat setelah validasi PASS.

---

## Slice 02 — Live Camera Mode

### Target

Membuat kamera liveview berjalan.

### Scope

- Request permission kamera.
- Tampilkan live video.
- Error permission denied.
- Select camera jika multiple device tersedia.
- Start/stop stream.

### Acceptance Criteria

- Kamera aktif di browser yang mendukung.
- User bisa melihat liveview.
- Error permission ditampilkan jelas.
- Archive dibuat setelah validasi PASS.

---

## Slice 03 — Overlay Engine

### Target

Menampilkan overlay di atas liveview.

### Scope

- Guide overlay.
- Template overlay transparan.
- Toggle overlay mode.
- Overlay align dengan liveview.

### Acceptance Criteria

- Guide overlay tampil.
- Template overlay tampil.
- Toggle mode berjalan.
- Overlay tetap align saat resize.
- Archive dibuat setelah validasi PASS.

---

## Slice 04 — Capture & Upload Photo

### Target

Mendukung capture dari kamera dan upload file.

### Scope

- Capture frame dari video ke canvas.
- Convert image untuk backend.
- Upload JPG/PNG.
- Preview image input.

### Acceptance Criteria

- Capture menghasilkan image.
- Upload valid berjalan.
- File invalid ditolak.
- Archive dibuat setelah validasi PASS.

---

## Slice 05 — Local Background Removal

### Target

Menghapus background secara lokal.

### Scope

- Endpoint remove background.
- Integrasi rembg/ONNX Runtime.
- Output PNG transparan.
- Loading/error UI.

### Acceptance Criteria

- Capture/upload dapat diproses.
- Output transparan.
- Tidak memakai cloud.
- Archive dibuat setelah validasi PASS.

---

## Slice 06 — Template Compositing

### Target

Menggabungkan subjek dengan background dan template jas/dasi.

### Scope

- Load layer template.
- Render order.
- Background color.
- Initial transform.
- Preview hasil.

### Acceptance Criteria

- Subjek tampil dengan template.
- Background warna tampil.
- Layer order benar.
- Archive dibuat setelah validasi PASS.

---

## Slice 07 — Manual Adjustment

### Target

Memberi kontrol manual untuk hasil akhir.

### Scope

- Geser X/Y.
- Scale/zoom.
- Rotate ringan.
- Reset.
- Apply ke preview/export.

### Acceptance Criteria

- Adjustment berjalan.
- Preview berubah sesuai input.
- Export mengikuti adjustment.
- Archive dibuat setelah validasi PASS.

---

## Slice 08 — Export JPG/PNG

### Target

Mengekspor hasil final.

### Scope

- Export JPG.
- Export PNG.
- Profile 3x4.
- Profile 4x6.
- Nama file default `fourpix-*`.

### Acceptance Criteria

- JPG berhasil dibuat.
- PNG berhasil dibuat.
- Ukuran sesuai profile.
- Archive dibuat setelah validasi PASS.

---

## Slice 09 — MVP Polish & Validation

### Target

Merampungkan MVP agar bisa didemokan.

### Scope

- UX polish.
- Error messages.
- Loading states.
- Empty states.
- README run guide.
- Rebrand check.
- End-to-end manual test.

### Acceptance Criteria

- Full flow live camera selesai.
- Full flow upload selesai.
- Tidak ada nama lama project.
- Archive final MVP dibuat setelah validasi PASS.

---

## 12. Definition of Done per Slice

Satu slice dianggap selesai jika:

```text
[ ] Scope sesuai dokumen.
[ ] Non-scope tidak dikerjakan.
[ ] Kode berjalan.
[ ] Validasi PASS.
[ ] Error handling minimal ada.
[ ] Dokumen terkait diperbarui jika perlu.
[ ] Archive/snapshot dibuat setelah validasi PASS.
[ ] File staged eksplisit jika akan commit.
[ ] Commit/push hanya dilakukan jika user menyetujui.
```
