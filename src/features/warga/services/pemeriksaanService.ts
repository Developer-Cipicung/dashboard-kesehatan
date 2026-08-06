import { api } from '@/services/api'

// ---- Bumil ----
export interface CreateBumilPayload {
  warga_id: string
  tanggal_kunjungan: string // YYYY-MM-DD
  bb: number
  tb: number
  lingkar_perut: number
  lingkar_lengan_atas: number
  tinggi_fundus?: number
  tekanan_darah_sistolik?: number
  tekanan_darah_diastolik?: number
  usia_kehamilan_minggu: number
  jumlah_anak?: number
  riwayat_penyakit?: string
  kadar_hemoglobin?: number
  berat_janin?: number
  terpapar_rokok?: boolean
  kie?: boolean
  suplemen_tambah_darah?: boolean
  tanggal_kunjungan_berikut?: string
  catatan?: string
  status_risiko_pe?: string
}

// ---- Lansia ----
export interface CreateLansiaPayload {
  warga_id: string
  tanggal_kunjungan: string
  bb: number
  tb: number
  tekanan_darah_sistolik: number
  tekanan_darah_diastolik: number
  gula_darah_sewaktu: number
  catatan?: string
}

// ---- Pasca Persalinan ----
export interface CreatePascaPayload {
  warga_id: string
  tanggal_kunjungan: string
  tanggal_persalinan: string
  bb: number
  tekanan_darah_sistolik?: number
  tekanan_darah_diastolik?: number
  suhu_tubuh?: number
  kondisi_ibu?: string
  tinggi_badan_bayi?: number
  berat_badan_bayi?: number
  kie?: boolean
  fasilitasi_rujukan?: boolean
  fasilitasi_bantuan_sosial?: boolean
  tanggal_kunjungan_berikut?: string
  catatan?: string
}

// ---- Balita / Baduta ----
export interface CreateBalitaPayload {
  warga_id: string
  tanggal_kunjungan: string
  bb: number
  tb: number
  lingkar_kepala: number
  lingkar_lengan_atas: number
  nama_ayah?: string
  nama_ibu?: string
  kondisi?: string
  asi_eksklusif?: boolean
  fasilitasi_bantuan_sosial?: boolean
  tanggal_kunjungan_berikut?: string
  catatan?: string
}

export const pemeriksaanService = {
  createBumil: async (payload: CreateBumilPayload) => {
    const res = await api.post('/bumil', payload)
    return res.data
  },
  createLansia: async (payload: CreateLansiaPayload) => {
    const res = await api.post('/lansia', payload)
    return res.data
  },
  createPasca: async (payload: CreatePascaPayload) => {
    const res = await api.post('/pasca-persalinan', payload)
    return res.data
  },
  createBalita: async (payload: CreateBalitaPayload) => {
    const res = await api.post('/balita', payload)
    return res.data
  },
}
