# TASKS.md

# Frontend Development Tasks

Project: **Pusat Pendataan Kesehatan Posyandu Cipicung**

---

# Rules

AI wajib mengikuti aturan berikut.

- Kerjakan **SATU** task yang belum selesai.
- Jangan mengerjakan task berikutnya.
- Setelah selesai:
  - Update TASKS.md
  - Update dokumentasi terkait apabila diperlukan.
  - Berhenti.
- Jangan melakukan refactor besar di luar task yang sedang dikerjakan.
- Ikuti seluruh dokumentasi project.

---

# Progress

- Phase 1 : ✅
- Phase 2 : ✅
- Phase 3 : ✅
- Phase 4 : ✅
- Phase 5 : ✅
- Phase 6 : ✅
- Phase 7 : ✅
- Phase 8 : ✅
- Phase 9 : ✅

---

# Phase 1 — Project Foundation

- [x] Initialize React + Vite + TypeScript
- [x] Install project dependencies
- [x] Configure Tailwind CSS
- [x] Configure shadcn/ui
- [x] Configure ESLint & Prettier
- [x] Configure path aliases
- [x] Setup folder structure
- [x] Configure React Router
- [x] Configure Axios
- [x] Configure TanStack Query
- [x] Configure Zustand
- [x] Configure React Hook Form + Zod
- [x] Configure Sonner
- [x] Setup global app.css
- [x] Create base layouts

---

# Phase 2 — Reusable Components

- [x] Button
- [x] Input
- [x] NumberInput
- [x] DatePicker
- [x] Select
- [x] TextArea
- [x] FormField
- [x] Card
- [x] StatisticCard
- [x] DataTable
- [x] SearchInput
- [x] Pagination
- [x] EmptyState
- [x] ErrorState
- [x] Loading Skeleton
- [x] Confirm Dialog
- [x] Toast Integration

---

# Phase 3 — Authentication

- [x] Login Page
- [x] Auth Store
- [x] Protected Route
- [x] Login API Integration
- [x] Logout
- [x] Session Restore
- [x] Unauthorized Redirect

---

# Phase 4 — Dashboard

- [x] Dashboard Layout
- [x] Sidebar
- [x] Header
- [x] Statistic Cards
- [x] Dashboard API Integration
- [x] Dashboard Charts
- [x] Recent Activity
- [x] Responsive Dashboard

---

# Phase 5 — Patient Modules

## Shared

- [x] Shared Patient Toolbar
- [x] Shared Patient Table
- [x] Shared Patient Card (Mobile)
- [x] Add Patient Dialog
- [x] Search Patient

## Ibu Hamil

- [x] List Page
- [x] API Integration

## Pasca Persalinan

- [x] List Page
- [x] API Integration

## Calon Menikah

- [x] List Page
- [x] API Integration

## Batita

- [x] List Page
- [x] API Integration

## Balita

- [x] List Page
- [x] API Integration

## Anak Sekolah

- [x] List Page
- [x] API Integration

## Lansia

- [x] List Page
- [x] API Integration

---

# Phase 6 — Health Records

- [x] History Page
- [x] History Timeline
- [x] Monthly Record Form
- [x] Edit Record
- [x] Readonly Mode
- [x] Submit Monthly Data
- [x] Lock After Verification

---

# Phase 7 — Reports

- [x] Report Page
- [x] Monthly Summary
- [x] Export PDF
- [x] Export Excel

---

# Phase 8 — Super Admin

- [x] Admin Layout
- [x] Dashboard
- [x] CRUD Posyandu
- [x] CRUD User
- [x] Assign User to Posyandu

---

# Phase 9 — Finalization

- [x] Responsive Improvements
- [x] Accessibility Review
- [x] Loading Optimization
- [x] Error Handling Review
- [x] Performance Optimization
- [x] Documentation Review
- [x] Production Build
- [x] Final Testing

---

# Phase 10 — UI & UX Refinements (Post-Launch)

- [x] Perbaikan form: nilai string kosong (empty string) agar tidak diabaikan saat disubmit (terutama untuk form catatan).
- [x] Penyeragaman UI: ubah warna tombol "Cetak Kartu" menjadi aksen kuning dan teks putih.
- [x] Peningkatan UX: perlebar area klik opsi BPJS menggunakan `label` di Add/Edit Patient dialog.
- [x] Format Umur: penyesuaian satuan usia pasien di UI (Balita/Baduta < 60 bulan wajib `bulan`, selainnya `tahun`).
- [x] Perbaikan Bug: memastikan status tercentang BPJS tidak hilang saat form Edit Warga dibuka (sinkronisasi nilai `memiliki_bpjs` ke `reset()`).
- [x] Code Quality: pembersihan peringatan TypeScript (menghapus unused `ChangeEvent` dan memformat argument).

---

# Definition of Done

Sebuah task dianggap selesai apabila:

- Berhasil diimplementasikan.
- Tidak ada error TypeScript.
- Tidak ada error lint.
- Mengikuti seluruh dokumentasi project.
- Reusable apabila memungkinkan.
- API telah terintegrasi (jika relevan).
- Dokumentasi telah diperbarui (jika diperlukan).
- Checklist pada TASKS.md telah diperbarui.