import { api } from '@/services/api'

export interface Pemeriksaan {
  id: string
  warga_id: string
  posyandu_id: string
  kader_id: string
  tanggal_pemeriksaan: string
  berat_badan?: number
  tinggi_badan?: number
  lingkar_kepala?: number
  lingkar_lengan?: number
  tekanan_darah?: string
  catatan?: string
  created_at: string
  updated_at: string
}

export interface HistoryResponse {
  success: boolean
  message: string
  data: Pemeriksaan[]
}

export interface ListResponse {
  success: boolean
  message: string
  data: {
    data: (Pemeriksaan & { warga: any })[]
    metadata: any
  }
}

export interface PemeriksaanResponse {
  success: boolean
  message: string
  data: Pemeriksaan
}

const getActualEndpoint = (kategori: string) => {
  const endpoint = kategori.replace('_', '-')
  if (endpoint === 'baduta' || endpoint === 'balita') return 'balita'
  if (endpoint === 'ibu-hamil' || endpoint === 'bumil') return 'bumil'
  return endpoint
}

export const pemeriksaanService = {
  getAll: async (kategori: string, params: { bulan?: number; tahun?: number; startDate?: string; endDate?: string; limit?: number; page?: number; posyanduId?: string }) => {
    const actualEndpoint = getActualEndpoint(kategori)
    const response = await api.get<ListResponse>(`/${actualEndpoint}`, { params })
    return response.data.data
  },
  getHistory: async (kategori: string, wargaId: string, posyanduId?: string) => {
    const actualEndpoint = getActualEndpoint(kategori)
    const response = await api.get<HistoryResponse>(`/${actualEndpoint}/${wargaId}/history`, { params: { posyanduId } })
    return response.data.data
  },
  getById: async (kategori: string, id: string, posyanduId?: string) => {
    const actualEndpoint = getActualEndpoint(kategori)
    const response = await api.get<PemeriksaanResponse>(`/${actualEndpoint}/${id}`, { params: { posyanduId } })
    return response.data.data
  },
  create: async (kategori: string, payload: Partial<Pemeriksaan>, posyanduId?: string) => {
    const actualEndpoint = getActualEndpoint(kategori)
    const response = await api.post<PemeriksaanResponse>(`/${actualEndpoint}`, payload, { params: { posyanduId } })
    return response.data.data
  },
  bulkCreate: async (kategori: string, payload: Partial<Pemeriksaan>[], posyanduId?: string) => {
    const actualEndpoint = getActualEndpoint(kategori)
    const response = await api.post(`/${actualEndpoint}/bulk-pemeriksaan`, payload, { params: { posyanduId } })
    return response.data
  },
  calculateZscore: async (payload: any) => {
    const response = await api.post(`/balita/calculate-zscore`, payload)
    return response.data.data
  },
  update: async (kategori: string, id: string, payload: Partial<Pemeriksaan>, posyanduId?: string) => {
    const actualEndpoint = getActualEndpoint(kategori)
    const response = await api.put<PemeriksaanResponse>(`/${actualEndpoint}/${id}`, payload, { params: { posyanduId } })
    return response.data.data
  },
  delete: async (kategori: string, id: string, posyanduId?: string) => {
    const actualEndpoint = getActualEndpoint(kategori)
    const response = await api.delete(`/${actualEndpoint}/${id}`, { params: { posyanduId } })
    return response.data
  },
}
