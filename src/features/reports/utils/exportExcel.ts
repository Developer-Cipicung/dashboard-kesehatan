import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { Warga } from '@/features/warga/services/wargaService'
import { formatTimeWib } from '@/utils/dateTime'
import type { ReportImmunisasi, ReportPemeriksaanItem } from '../types/reportPemeriksaan'

export async function exportWargaToExcel(wargaList: Warga[], filename: string = 'Laporan_Warga.xlsx', pemeriksaanList: ReportPemeriksaanItem[] = [], kategoriFilter: string = '') {
  // Use pemeriksaanList if provided, otherwise fallback to wargaList
  const usePemeriksaan = pemeriksaanList && pemeriksaanList.length > 0
  
  const dataToExport = usePemeriksaan ? pemeriksaanList : wargaList

  if (!dataToExport || dataToExport.length === 0) {
    throw new Error('Data laporan kosong.')
  }

  // Format data for Excel dynamically based on category
  const formattedData = dataToExport.map((rawItem, index) => {
    if (!usePemeriksaan) {
      // Basic Warga Export
      const warga = rawItem as Warga
      return {
        No: index + 1,
        NIK: warga.nik,
        'No KK': warga.no_kk,
        Nama: warga.nama,
        'Jenis Kelamin': warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        'Tempat Lahir': warga.tempat_lahir,
        'Tanggal Lahir': new Date(warga.tanggal_lahir).toLocaleDateString('id-ID'),
        Alamat: `${warga.alamat} RT ${warga.rt} RW ${warga.rw}`,
        Kategori: warga.kategori,
        'Status Pernikahan': warga.status_pernikahan,
      }
    }

    const item = rawItem as ReportPemeriksaanItem
    const warga = item.warga || {}
    let ageText = '-'
    if (warga.tanggal_lahir && item.tanggal_kunjungan) {
      if (kategoriFilter === 'baduta' || kategoriFilter === 'balita') {
        const ageMonths = Math.floor((new Date(item.tanggal_kunjungan).getTime() - new Date(warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
        ageText = `${ageMonths} bln`
      } else {
        const ageYears = Math.floor((new Date(item.tanggal_kunjungan).getTime() - new Date(warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        ageText = `${ageYears} thn`
      }
    }

    const visitDate = item.tanggal_kunjungan ? new Date(item.tanggal_kunjungan).toLocaleDateString('id-ID') : '-'
    const visitTime = formatTimeWib(item.created_at)

    const visitData = {
      'Tgl Kunjungan': visitDate,
      'Jam Kunjungan': visitTime,
    }

    const baseData = {
      No: index + 1,
      ...visitData,
      Posyandu: (warga as any).posyandu?.nama || '-',
      Nama: warga.nama || '-',
      NIK: warga.nik || '-',
      'No. HP': warga.nomor || '-',
      'Tempat Lahir': warga.tempat_lahir || '-',
      'Tanggal Lahir': warga.tanggal_lahir ? new Date(warga.tanggal_lahir).toLocaleDateString('id-ID') : '-',
      Alamat: warga.alamat || '-',
      'Jenis Kelamin': warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'
    }

    switch (kategoriFilter) {
      case 'baduta':
      case 'balita': {
        const namaIbu = item.nama_ibu || '-'
        return {
          ...baseData,
          'Umur (Bulan)': ageText,
          'Nama Ibu': namaIbu,
          'Kontrasepsi Ibu': warga.penggunaan_kontrasepsi || '-',
          'Berat Badan (kg)': item.bb || '-',
          'Tinggi Badan (cm)': item.tb || '-',
          'Lingkar Kepala (cm)': item.lingkar_kepala || '-',
          'Status Gizi (BB/TB)': item.status_gizi?.kategori_bb_tb || '-',
          'Status Berat (BB/U)': item.status_gizi?.kategori_bb_u || '-',
          'Status Tinggi (TB/U)': item.status_gizi?.kategori_tb_u || '-',
          'ASI Eksklusif': item.asi_eksklusif ? 'Ya' : 'Tidak',
          'Bansos': item.fasilitasi_bantuan_sosial ? 'Ya' : 'Tidak',
          'Catatan': item.catatan || '-',
          'Imunisasi': (warga.riwayat_imunisasi || []).map((i: ReportImmunisasi) => i.jenis_vaksin).join(', ') || '-',
        }
      }
      case 'bumil':
        return {
          ...baseData,
          'Usia Kehamilan (Minggu)': item.usia_kehamilan_minggu || '-',
          'Berat Badan (kg)': item.bb || '-',
          'Tinggi Badan (cm)': item.tb || '-',
          'LILA (cm)': item.lingkar_lengan_atas || '-',
          'Lingkar Perut (cm)': item.lingkar_perut || '-',
          'Anak Ke-': item.jumlah_anak || '-',
          'Kadar Hb': (item.kadar_hemoglobin && Number(item.kadar_hemoglobin) > 0) ? item.kadar_hemoglobin : '-',
          'Berat Janin': item.berat_janin || '-',
          'Rokok': item.terpapar_rokok ? 'Ya' : 'Tidak',
          'KIE': item.kie ? 'Ya' : 'Tidak',
          'TTD': item.suplemen_tambah_darah ? 'Ya' : 'Tidak',
        }
      case 'pasca_persalinan':
        return {
          ...baseData,
          'Tempat Persalinan': warga.tempat_persalinan || '-',
          'Tanggal Persalinan': item.tanggal_persalinan ? new Date(item.tanggal_persalinan).toLocaleDateString('id-ID') : '-',
          'Tekanan Darah': (item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-',
          'Kondisi Ibu': item.kondisi_ibu || '-',
          'Tinggi Bayi': item.tinggi_badan_bayi || '-',
          'Berat Bayi': item.berat_badan_bayi || '-',
          'KIE': item.kie ? 'Ya' : 'Tidak',
          'Rujukan': item.fasilitasi_rujukan ? 'Ya' : 'Tidak',
          'Bansos': item.fasilitasi_bantuan_sosial ? 'Ya' : 'Tidak',
          'Catatan': item.catatan || '-',
        }
      case 'lansia':
        return {
          ...baseData,
          'Umur (Tahun)': ageText,
          'Berat Badan (kg)': item.bb || '-',
          'Tekanan Darah': (item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-',
          'Gula Darah (mg/dL)': item.gula_darah_sewaktu || '-',
          'Catatan': item.catatan || '-',
        }
      default:
        return { ...baseData, Data: 'N/A' }
    }
  })
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Data Laporan')

  if (formattedData.length > 0) {
    // Generate columns based on the keys of the first row
    const columns = Object.keys(formattedData[0]).map(key => ({
      header: key,
      key: key,
      width: 20
    }))
    worksheet.columns = columns
    
    // Add data
    worksheet.addRows(formattedData)
    
    // Format headers to be bold
    worksheet.getRow(1).font = { bold: true }
  }

  // Export
  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), filename)
}
