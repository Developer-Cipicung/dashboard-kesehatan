<div align="center">
  <img src="public/logo-cipicung.webp" alt="Logo Posyandu Digital Cipicung" width="130" />
  <h1>🏥 Sehati Dashboard (Frontend)</h1>
  <p><b>Sistem Informasi Kesehatan Digital Posyandu Cipicung</b></p>
  <p>Dashboard interaktif berbasis React 18, TypeScript, Vite & Tailwind CSS dengan pendekatan <i>Mobile-First UX</i> untuk kader kesehatan di lapangan.</p>
</div>

---

## 📑 Daftar Isi (Table of Contents)
- [Fitur-Fitur Utama (Key Features)](#-fitur-fitur-utama-key-features)
- [Teknologi & Dependensi (Tech Stack)](#-teknologi--dependensi-tech-stack)
- [Struktur Proyek (Project Architecture)](#-struktur-proyek-project-architecture)
- [Panduan Instalasi & Pengoperasian (Quick Start)](#-panduan-instalasi--pengoperasian-quick-start)
- [Perintah Tersedia (Available Scripts)](#-perintah-tersedia-available-scripts)
- [Deployment (Vercel)](#-deployment-vercel)

---

## 🌟 Fitur-Fitur Utama (Key Features)

### 1. 🔍 One-Stop Action Center & Global Search
- **Pencarian Cerdas NIK/Nama**: Debounced global search di beranda untuk menemukan data warga secara instan.
- **Kapsul Status Pemeriksaan**: Indikator visual realtime (**Selesai** / **Belum**) yang menunjukkan apakah pasien telah diperiksa di Posyandu pada bulan berjalan.
- **Quick Access Hamil Kembali**: Akses cepat bagi warga perempuan berstatus umum untuk didaftarkan kembali sebagai Ibu Hamil langsung dari hasil pencarian.

### 2. 👥 Manajemen Pasien & Siklus Kehamilan
- **Multi-Kategori Pasien**: Pencatatan terpisah sesuai standar Posyandu untuk **Balita (0-59 bulan)**, **Baduta (0-23 bulan)**, **Ibu Hamil**, **Ibu Pasca Persalinan (Nifas)**, dan **Lansia**.
- **Alur Hamil Kembali (Re-pregnancy)**: Registrasi ulang kehamilan bagi pasien lama tanpa duplikasi data NIK/warga.
- **Kalkulator HPHT & HPL**: Otomatisasi perhitungan Hari Perkiraan Lahir (+280 hari) dan urutan kehamilan (*anak ke-*).
- **Transisi Selesai Kehamilan**:
  - 👶 **Melahirkan / Bersalin**: Mengubah status ibu ke Pasca Persalinan dan mendaftarkan data bayi baru ke sistem.
  - 💔 **Keguguran / Abortus**: Mengubah status pasien ke `ABORTUS` dengan pencatatan lokasi penanganan & catatan medis.

### 3. 📋 Pencatatan Observasi & Pemeriksaan Bulanan
- **Formulir Antropometri & Kesehatan Dinamis**:
  - **Balita/Baduta**: BB, TB/PB, LK, LILA, Status Imunisasi, ASI Eksklusif, Vit A, Obat Cacing, & Perkembangan KMS.
  - **Ibu Hamil**: BB, TB, LILA, Tekanan Darah, TFU, DJJ, Hemoglobin (HB), TTD, & Imunisasi TT.
  - **Pasca Persalinan**: Tekanan Darah, Suhu, Vit A Nifas, Kontrasepsi KB, & Deteksi Komplikasi.
  - **Lansia**: Tekanan Darah, Gula Darah, Kolesterol, Asam Urat, Lingkar Perut, & Skrining PTM.
- **Riwayat & Grafik Pertumbuhan**: Timeline histori pemeriksaan lengkap dengan grafik tren pertumbuhan pasien (*recharts*).

### 4. 📊 e-PPGBM Import, Export Excel & Pelaporan
- **Import Massal e-PPGBM**: Mengunggah data warga dan rekam kesehatan dalam jumlah besar dari berkas Excel.
- **Export Laporan Excel**: Ekspor rekapitulasi data bulanan posyandu berbasis Excel (`exceljs`).
- **Mode Cetak / Print-Ready**: Halaman laporan resmi yang siap dicetak/diunduh ke format PDF.

### 5. 🛡️ Verifikasi Pendataan & Hak Akses (Multi-Role)
- **Verifikasi Pendataan Bulanan**: Dashboard verifikasi kelengkapan entri data kader per bulan.
- **Role-Based Access**: Dukungan peran **Kader Posyandu**, **Bidan Desa**, dan **Super Admin / Puskesmas**.
- **Panel Admin**: Manajemen User (kader/bidan), Manajemen Master Posyandu, dan monitoring status pendataan antar posyandu.

### 6. 🌐 Portal Publik & Akses Warga
- **Pengecekan Kartu Digital**: Layanan pencarian status kartu posyandu warga secara mandiri.
- **Panduan Kader (Tutorial Page)**: Modul petunjuk penggunaan aplikasi untuk kader di lapangan.

---

## 🛠 Teknologi & Dependensi (Tech Stack)

| Kategori | Teknologi |
| --- | --- |
| **Core Framework** | React 18, Vite |
| **Language** | TypeScript |
| **Styling & UI** | Tailwind CSS, Radix UI, shadcn/ui, Lucide Icons |
| **State & Data Fetching** | TanStack Query (React Query v5), Zustand |
| **Form Handling & Validasi** | React Hook Form, Zod, `@hookform/resolvers` |
| **Grafik & Export** | Recharts, ExcelJS |
| **HTTP Client** | Axios |
| **Notifications** | Sonner |

---

## 🏗 Struktur Proyek (Project Architecture)

Proyek ini mengadopsi struktur **Feature-Based Architecture** untuk keterbacaan dan pemeliharaan kode yang modular:

```text
src/
├── components/        # UI primitives (buttons, dialogs, inputs, forms)
├── features/          # Modular domain features
│   ├── admin/         # Manajemen User, Posyandu, & Monitoring Status
│   ├── auth/          # Halaman Login & Autentikasi
│   ├── dashboard/     # Beranda, Global Search, & Widget Statistik
│   ├── pemeriksaan/   # Form Observasi Bulanan & Timeline Riwayat
│   ├── pendataan/     # Halaman Verifikasi Pendataan Bulanan
│   ├── public/        # Cek Kartu Digital & Halaman Tutorial
│   ├── reports/       # Laporan Bulanan & Halaman Mode Cetak
│   └── warga/         # Tabel Pasien, Dialog Tambah/Edit, & Hamil Kembali
├── hooks/             # Custom React Hooks
├── layouts/           # Sidebar, Header, & Shell Layouts
├── routes/            # Konfigurasi Routing (React Router v6)
├── services/          # Client API Axios & Interceptors
├── stores/            # Zustand State (Auth, UI filters)
└── utils/             # Utility Helper (kalkulasi umur, format tanggal)
```

---

## 🚀 Panduan Instalasi & Pengoperasian (Quick Start)

### 1. Persyaratan Sistem
- Node.js v18.x atau lebih baru
- npm / pnpm / yarn

### 2. Langkah-Langkah Pengoperasian
```bash
# 1. Clone repositori
git clone https://github.com/Developer-Cipicung/dashboard-kesehatan.git

# 2. Masuk ke direktori
cd dashboard-kesehatan

# 3. Install dependensi
npm install

# 4. Buat file .env dari template
cp .env.example .env
```

Isi berkas `.env` dengan URL API Backend:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

```bash
# 5. Jalankan server lokal
npm run dev
```

---

## 💻 Perintah Tersedia (Available Scripts)

| Perintah | Deskripsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan Vite (`http://localhost:5173`) |
| `npm run build` | Menjalankan verifikasi tipe `tsc -b` dan mem-bundle aplikasi untuk produksi |
| `npm run preview` | Menjalankan server pratinjau lokal untuk menguji hasil direktori `dist/` |
| `npm run lint` | Memeriksa kepatuhan kode menggunakan ESLint |

---

## ☁️ Deployment (Vercel)

Aplikasi ini siap di-deploy secara otomatis ke **Vercel** sebagai *Single Page Application* (SPA):

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Environment Variable**: `VITE_API_URL` (diarahkan ke URL backend production).

*Catatan: Berkas `vercel.json` telah dikonfigurasi dengan SPA rewrite rule ke `/index.html` untuk mencegah error 404 ketika halaman di-refresh.*
