import { api } from '@/services/api'

export interface DashboardStatsResponse {
  success: boolean
  message: string
  data: {
    total_warga: number
    total_balita: number
    total_bumil: number
    total_lansia: number
    warga_baru_bulan_ini: number
    jumlah_pemeriksaan: number
    pendataan: {
      balita: 'draft' | 'selesai'
      imunisasi: 'draft' | 'selesai'
      bumil: 'draft' | 'selesai'
      pasca_persalinan: 'draft' | 'selesai'
      lansia: 'draft' | 'selesai'
    }
    kategori_breakdown: {
      ibu_hamil: number
      pasca_persalinan: number
      lansia: number
      baduta: number
      balita: number
      anak_sekolah: number
    }
    kunjungan_6_bulan: Array<{
      name: string
      ibu: number
      lansia: number
      anak: number
    }>
    aktivitas_terkini: Array<{
      id: string | number
      name: string
      category: string
      date: string
      status: string
    }>
    alerts: Array<{
      id: string | number
      name: string
      category: string
      date: string
      status: string
    }>
  }
}

export const dashboardService = {
  getStats: async (posyanduId?: string) => {
    const response = await api.get<DashboardStatsResponse>('/dashboard', {
      params: { posyanduId }
    })
    return response.data.data
  },
}
