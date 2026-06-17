# 4Pix Studio

4Pix Studio adalah aplikasi pas foto lokal berbasis live camera overlay.

Tagline: Bikin Pas Foto Lebih Apik

## Slice 00 — Project Foundation

Fondasi awal project:

- Frontend: React + Vite + TypeScript
- Backend lokal: Python FastAPI
- Health endpoint: GET /health
- Frontend membaca status backend lokal
- Storage MVP: local filesystem
- Database: tidak dipakai pada MVP
- Cloud processing foto: tidak dipakai pada MVP

## Port Lokal Slice 00

- Backend API: http://127.0.0.1:8404
- Frontend Web: http://127.0.0.1:5174

Port ini dipilih agar tidak konflik dengan aplikasi lain di PC lokal.

## Menjalankan Backend

cd /mnt/d/kulino/fourpix/apps/api
source .venv/bin/activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8404 --reload

Health check:

curl http://127.0.0.1:8404/health

## Menjalankan Frontend

cd /mnt/d/kulino/fourpix/apps/web
npm run dev

Buka:

http://127.0.0.1:5174

## Validasi

Frontend:

cd /mnt/d/kulino/fourpix/apps/web
npm run lint
npm run build

Backend:

cd /mnt/d/kulino/fourpix/apps/api
source .venv/bin/activate
python -m pytest -q

## Catatan MVP

Slice 00 belum mengerjakan:

- live camera
- template registry
- overlay engine
- capture/upload
- remove background
- compositing
- manual adjustment
- export JPG/PNG

## Visual Direction

Arah visual awal 4Pix Studio adalah clean photo studio, camera tech, futuristik, slate/cyan.
