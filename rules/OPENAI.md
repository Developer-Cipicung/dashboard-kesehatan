---
trigger: always_on
---

# OPENAI.md

# AI Development Guidelines

Dokumen ini merupakan aturan utama yang harus diikuti oleh AI Agent selama pengembangan Frontend Pusat Pendataan Kesehatan Posyandu Cipicung.

AI wajib membaca dokumen ini sebelum mengimplementasikan fitur apa pun.

---

# Objective

Tujuan AI adalah membantu mengembangkan frontend secara bertahap dengan tetap menjaga:

- Konsistensi
- Maintainability
- Reusability
- Scalability
- Type Safety

AI bukan hanya menghasilkan kode yang berjalan, tetapi juga kode yang mudah dipelihara.

---

# Source of Truth

AI wajib mengikuti prioritas berikut.

1. TASKS.md
2. BUSINESS_LOGIC.md
3. ARCHITECTURE.md
4. DESIGN_SYSTEM.md
5. COMPONENTS.md
6. TECH_STACK.md
7. API Documentation (Repository Backend)

Apabila terjadi konflik, gunakan urutan prioritas di atas.

---

# Development Workflow

Setiap iterasi AI harus mengikuti langkah berikut.

1. Membaca TASKS.md.
2. Mengerjakan satu task yang belum selesai.
3. Mengikuti seluruh dokumentasi proyek.
4. Menguji hasil implementasi.
5. Memperbarui dokumentasi apabila diperlukan.
6. Menandai task sebagai selesai.
7. Berhenti.

AI tidak boleh mengerjakan lebih dari satu task dalam satu iterasi kecuali diminta secara eksplisit.

---

# Documentation Rules

Apabila implementasi menyebabkan perubahan terhadap:

- Struktur folder
- Routing
- Komponen reusable
- Business Logic
- State Management
- Design System

maka AI wajib memperbarui dokumentasi yang relevan.

Dokumentasi harus selalu mencerminkan kondisi implementasi terbaru.

---

# Component Rules

Sebelum membuat component baru, AI wajib memeriksa apakah component serupa sudah tersedia.

Jika component dapat digunakan oleh minimal dua halaman, component tersebut harus dipindahkan ke folder:

```
src/components
```

AI tidak boleh membuat duplicate component.

---

# Business Logic

Business Logic tidak boleh ditempatkan pada reusable component.

Business Logic hanya boleh berada pada:

- Feature
- Hook
- Service

Reusable component hanya bertanggung jawab terhadap tampilan.

---

# API Rules

Frontend tidak boleh mengetahui struktur database.

Frontend tidak boleh membuat asumsi mengenai endpoint API.

Seluruh komunikasi harus mengikuti dokumentasi Backend API.

Semua request dilakukan melalui Service Layer.

---

# Styling Rules

Seluruh styling mengikuti:

- DESIGN_SYSTEM.md
- app.css

AI tidak boleh:

- Hardcode warna
- Hardcode shadow
- Hardcode radius
- Inline style

Gunakan design token yang tersedia.

---

# State Management Rules

AI wajib menggunakan:

- useState → Local State
- Zustand → Global UI State
- TanStack Query → Server State
- React Hook Form + Zod → Form State

Tidak boleh mencampur tanggung jawab masing-masing.

---

# Routing Rules

Seluruh routing dikelola menggunakan React Router.

AI tidak boleh membuat routing di dalam feature.

Gunakan Protected Route untuk halaman yang memerlukan autentikasi.

---

# TypeScript Rules

Project menggunakan TypeScript Strict.

AI tidak boleh:

- menggunakan `any`
- menonaktifkan type checking
- mengabaikan error TypeScript

Semua props, response, dan state harus memiliki tipe yang jelas.

---

# File Organization

AI wajib mengikuti struktur folder yang telah ditentukan.

Tidak boleh membuat folder baru tanpa alasan yang kuat.

Jika diperlukan struktur baru, dokumentasi harus diperbarui terlebih dahulu.

---

# Naming Convention

Gunakan nama yang deskriptif.

Contoh:

```
PatientTable

PatientDialog

StatisticCard

DashboardLayout
```

Hindari nama seperti:

```
Table1

ComponentBaru

NewButton

Card2
```

---

# Error Handling

AI tidak boleh menyembunyikan error dengan cara yang tidak tepat.

Gunakan:

- Error Boundary
- TanStack Query Error State
- Toast Notification

---

# Security

Frontend tidak boleh:

- Menyimpan secret.
- Menyimpan database credential.
- Melakukan autentikasi sendiri.
- Menentukan hak akses tanpa Backend.

Ikuti SECURITY.md.

---

# Code Quality

AI wajib menghasilkan kode yang:

- Modular
- Reusable
- Mudah dibaca
- Konsisten
- Mudah diuji

Prioritaskan keterbacaan dibanding solusi yang terlalu kompleks.

---

# AI Decision Rules

Apabila terdapat beberapa solusi yang sama-sama benar, AI harus memilih solusi yang:

1. Paling konsisten dengan dokumentasi proyek.
2. Menghasilkan reusable component.
3. Mengurangi duplikasi kode.
4. Paling mudah dipelihara.

---

# When in Doubt

Jika kebutuhan tidak jelas:

- Jangan membuat asumsi bisnis.
- Ikuti BUSINESS_LOGIC.md.
- Jika dokumentasi belum mencukupi, hentikan implementasi dan minta klarifikasi.

---

# Completion Checklist

Sebelum mengakhiri setiap iterasi, AI harus memastikan:

- Task selesai.
- Tidak ada error TypeScript.
- Tidak ada duplicate component.
- Tidak ada endpoint yang di-hardcode.
- Tidak ada styling yang melanggar Design System.
- Dokumentasi telah diperbarui bila diperlukan.
- TASKS.md telah diperbarui.

---

# Summary

AI adalah anggota tim pengembang.

AI wajib:

- Mengikuti dokumentasi.
- Menyelesaikan satu task per iterasi.
- Mengutamakan kualitas kode.
- Menjaga konsistensi arsitektur.
- Memperbarui dokumentasi ketika implementasi berubah.