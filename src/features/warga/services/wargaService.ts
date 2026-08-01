import { api } from '@/services/api'

export interface Warga {
  id: string
  nik: string
  no_kk: string
  nama: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: 'L' | 'P'
  alamat: string
  rt: string
  rw: string
  kelurahan: string
  kecamatan: string
  kabupaten: string
  provinsi: string
  golongan_darah?: string
  nomor?: string
  pekerjaan?: string
  pendidikan?: string
  status_pernikahan: 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati'
  kategori: string
  status_kehamilan?: 'HAMIL' | 'PASCA_PERSALINAN' | 'TIDAK_HAMIL'
  tempat_persalinan?: string
  penggunaan_kontrasepsi?: string
  nama_ayah?: string
  nama_ibu?: string
  ibu_id?: string
  ibu?: Partial<Warga>
  hpht?: string
  htp?: string
  posyandu_id?: string
  created_at: string
  updated_at: string
  pemeriksaan_balita_baduta?: Array<any>
  pemeriksaan_bumil?: Array<any>
  pemeriksaan_pasca_persalinan?: Array<any>
  pemeriksaan_lansia?: Array<any>
  riwayat_imunisasi?: Array<any>
}

export interface WargaListResponse {
  success: boolean
  message: string
  data: {
    data: Warga[]
    metadata: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

export interface WargaResponse {
  success: boolean
  message: string
  data: Warga
}

export interface GetWargaParams {
  page?: number
  limit?: number
  search?: string
  jenis_kelamin?: 'L' | 'P'
  posyanduId?: string
  kategori?: string
}

export interface AddWargaPayload {
  nik: string
  nomor: string
  nama: string
  tanggal_lahir: string
  jenis_kelamin: 'L' | 'P'
  kategori: string
  status_kehamilan?: 'HAMIL' | 'PASCA_PERSALINAN' | 'TIDAK_HAMIL'
  tempat_lahir?: string
  alamat?: string
  tempat_persalinan?: string
  penggunaan_kontrasepsi?: string
  nama_ayah?: string
  nama_ibu?: string
  ibu_id?: string
  jumlah_anak?: number
  hpht?: string
  htp?: string
  posyandu_id?: string
}

export const wargaService = {
  getWargaList: async (params?: GetWargaParams) => {
    const response = await api.get<WargaListResponse>('/warga', { params })
    return response.data.data
  },
  getWargaById: async (id: string, posyanduId?: string) => {
    const response = await api.get<WargaResponse>(`/warga/${id}`, { params: { posyanduId } })
    return response.data.data
  },
  addWarga: async (payload: AddWargaPayload) => {
    const response = await api.post<WargaResponse>('/warga', payload)
    return response.data.data
  },
  addWargaBulk: async (payloadList: Partial<AddWargaPayload>[]) => {
    const response = await api.post<{success: boolean; message: string; data: { count: number; message: string }}>('/warga/bulk', payloadList)
    return response.data
  },
  updateWarga: async (id: string, payload: Partial<AddWargaPayload>) => {
    const response = await api.put<WargaResponse>(`/warga/${id}`, payload)
    return response.data.data
  },
  deleteWarga: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/warga/${id}`)
    return response.data
  },
  tandaiBersalin: async (id: string, payload: { tanggal_persalinan: string; tempat_persalinan?: string; nama_bayi?: string; jenis_kelamin_bayi: 'L' | 'P'; nama_ayah?: string }) => {
    const response = await api.post<{ success: boolean; message: string; data: any }>(`/warga/${id}/bersalin`, payload)
    return response.data
  }
}
