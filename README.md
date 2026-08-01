# Posyandu Digital Dashboard (Frontend)

Dashboard interaktif untuk Sistem Dashboard Kesehatan Cipicung. Proyek ini dibangun menggunakan **React**, **TypeScript**, dan **Vite**, serta dirancang dengan pendekatan **Mobile-First UX** untuk memudahkan kader di lapangan dalam melakukan pencatatan dan pelaporan secara digital.

## 📑 Daftar Isi (Quick Contents)
- [Teknologi (Tech Stack)](#-teknologi-tech-stack)
- [Quick Start](#-quick-start)
- [Commands](#-commands)
- [Architecture & Struktur Proyek](#-architecture--struktur-proyek)
- [Deployment (Vercel)](#-deployment-vercel)
- [Fitur Utama (Highlight)](#-fitur-utama-highlight)

## 🛠 Teknologi (Tech Stack)

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **State Management**: Zustand (Global Auth State)
- **Data Fetching & Caching**: React Query (`@tanstack/react-query`)
- **HTTP Client**: Axios

## 🚀 Quick Start

1. Clone repositori ini.
2. Pindah ke direktori frontend:
   ```bash
   cd kesehatan-dashboard
   ```
3. Install dependensi:
   ```bash
   npm install
   ```
4. Sesuaikan variabel di dalam `.env`:
   ```bash
   cp .env.example .env
   # Set VITE_API_URL=http://localhost:3000/api/v1
   ```
5. Jalankan server:
   ```bash
   npm run dev
   ```

## 💻 Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Menjalankan development server menggunakan Vite |
| `npm run build` | Melakukan compile aplikasi React ke *static bundle* untuk production |
| `npm run lint` | Menjalankan ESLint untuk memeriksa *coding standards* |
| `npm run preview` | Menjalankan *local server* untuk menguji hasil *build production* (`dist/`) |

## 🏗 Architecture & Struktur Proyek

Proyek ini mengadopsi pola **Feature-Based Structure** dan **Component-Driven Design** agar lebih modular dan mudah dirawat:

- `/src/features` — Modularisasi logika bisnis dan UI per ranah domain (warga, pemeriksaan, pendataan, dashboard).
- `/src/components` — Komponen UI re-usable (Atomic Design, sebagian besar berbasis shadcn/ui).
- `/src/layouts` — Pembungkus halaman dan navigasi utama (Sidebar, Header, SpeedDial).
- `/src/stores` — Global state management (Zustand untuk otentikasi, filter, dll).
- `/src/services` — Isolasi logika integrasi API eksternal (menggunakan Axios).
- `/src/routes` — Konfigurasi *routing* statis & dinamis via React Router.

## ☁️ Deployment (Vercel)

Dashboard ini dirancang optimal untuk di-deploy ke Vercel sebagai *Single-Page Application* (SPA).

### Konfigurasi Deploy
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Wajib memasang variabel `VITE_API_URL` yang diarahkan ke URL backend *production* Anda.

*Catatan*: File `vercel.json` telah ditambahkan di *root directory* untuk secara otomatis me-*rewrite* semua request yang masuk ke `/index.html` (SPA fallback), memastikan URL dinamis (seperti `/warga/123` atau `/login`) tidak memunculkan halaman *404 Not Found* ketika di-*refresh*.

## 🌟 Fitur Utama (Highlight)

- **One-Stop Action Center**: Kader dapat mencari pasien secara global (NAMA/NIK) dari halaman *Dashboard* utama dan langsung menekan tombol penambahan catatan yang memicu *form pop-up* terintegrasi tanpa perlu memuat ulang laman.
- **Buku Register Cerdas & Aman (*Read-only Table*)**: Tabel daftar pasien sengaja dikunci dari interaksi ketik (*read-only*) guna menghindari kesalahan ketik tak disengaja (*typo*) yang rentan terjadi ketika sedang *scrolling* di layar *smartphone*.
- **Mobile-Responsive UI**: Keseluruhan antarmuka dari *Sidebar* hingga form observasi telah disesuaikan tata letaknya agar responsif pada semua ukuran layar.
