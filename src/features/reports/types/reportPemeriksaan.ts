import type { Warga } from '@/features/warga/services/wargaService'

export interface ReportImmunisasi {
  jenis_vaksin?: string
}

export type ReportWarga = Partial<Warga> & {
  riwayat_imunisasi?: ReportImmunisasi[]
}

export interface ReportPemeriksaanItem {
  id?: string
  warga?: ReportWarga
  tanggal_kunjungan?: string
  created_at?: string
  nama_ibu?: string
  bb?: string | number
  tb?: string | number
  lingkar_kepala?: string | number
  kondisi?: string
  asi_eksklusif?: boolean
  fasilitasi_bantuan_sosial?: boolean
  catatan?: string
  usia_kehamilan_minggu?: string | number
  lingkar_lengan_atas?: string | number
  lingkar_perut?: string | number
  jumlah_anak?: string | number
  kadar_hemoglobin?: string | number
  berat_janin?: string | number
  terpapar_rokok?: boolean
  kie?: boolean
  suplemen_tambah_darah?: boolean
  tanggal_persalinan?: string
  tekanan_darah_sistolik?: string | number
  tekanan_darah_diastolik?: string | number
  kondisi_ibu?: string
  tinggi_badan_bayi?: string | number
  berat_badan_bayi?: string | number
  fasilitasi_rujukan?: boolean
  gula_darah_sewaktu?: string | number
  kolesterol?: string | number
  asam_urat?: string | number
  status_gizi?: {
    kategori_bb_tb?: string
    kategori_bb_u?: string
    kategori_tb_u?: string
  }
  status_risiko_pe?: string
  is_belum_diperiksa?: boolean
}
