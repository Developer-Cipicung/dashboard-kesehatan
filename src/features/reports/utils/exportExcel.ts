import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { Warga } from '@/features/warga/services/wargaService'
import { formatTimeWib } from '@/utils/dateTime'
import { formatDateID } from '@/utils/dateFormatter'
import { calculateHpl } from '../../warga/components/PatientTable'
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
        'Tanggal Lahir': formatDateID(warga.tanggal_lahir),
        Alamat: `${warga.alamat} RT ${warga.rt} RW ${warga.rw}`,
        BPJS: warga.memiliki_bpjs ? 'Ya' : 'Tidak',
        Kategori: warga.kategori,
        'Status Pernikahan': warga.status_pernikahan,
      }
    }

    const item = rawItem as ReportPemeriksaanItem
    const warga = item.warga || {}
    const isUnexamined = item.is_belum_diperiksa === true

    let ageText = '-'
    if (warga.tanggal_lahir) {
      const refDate = item.tanggal_kunjungan ? new Date(item.tanggal_kunjungan) : new Date()
      if (kategoriFilter === 'baduta' || kategoriFilter === 'balita') {
        const ageMonths = Math.floor((refDate.getTime() - new Date(warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
        ageText = `${ageMonths} bln`
      } else {
        const ageYears = Math.floor((refDate.getTime() - new Date(warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        ageText = `${ageYears} thn`
      }
    }

    const visitDate = formatDateID(item.tanggal_kunjungan)
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
      'Tanggal Lahir': formatDateID(warga.tanggal_lahir),
      Alamat: warga.alamat || '-',
      'Jenis Kelamin': warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      BPJS: warga.memiliki_bpjs ? 'Ya' : 'Tidak',
    }
    
    const formatBool = (val: any) => isUnexamined ? '-' : (val ? 'Ya' : 'Tidak')

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
          'ASI Eksklusif': formatBool(item.asi_eksklusif),
          'Bansos': formatBool(item.fasilitasi_bantuan_sosial),
          'Catatan': item.catatan || '-',
          'Imunisasi': isUnexamined ? '-' : ((warga.riwayat_imunisasi || []).map((i: ReportImmunisasi) => i.jenis_vaksin).join(', ') || '-'),
        }
      }
      case 'bumil': {
        let lilaText = '-'
        if (!isUnexamined && item.lingkar_lengan_atas) {
          const lila = Number(item.lingkar_lengan_atas)
          lilaText = `${lila} (${lila < 23.5 ? 'KEK' : 'Normal'})`
        }

        let hbText = '-'
        if (!isUnexamined && item.kadar_hemoglobin && Number(item.kadar_hemoglobin) > 0) {
          const hb = Number(item.kadar_hemoglobin)
          let status = 'Normal'
          if (hb < 8) status = 'Berat'
          else if (hb < 11) status = 'Ringan'
          hbText = `${hb} (${status})`
        }

        return {
          ...baseData,
          'Usia Kehamilan (Minggu)': item.usia_kehamilan_minggu || '-',
          'HPHT': formatDateID(warga.hpht),
          'HPL': formatDateID(warga.htp || calculateHpl(warga.hpht)),
          'Berat Badan (kg)': item.bb || '-',
          'Tinggi Badan (cm)': item.tb || '-',
          'Tekanan Darah': (item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-',
          'Risiko PE': isUnexamined ? '-' : (item.status_risiko_pe || 'Risiko Rendah'),
          'LILA (cm)': item.lingkar_lengan_atas || '-',
          'Lingkar Perut (cm)': item.lingkar_perut || '-',
          'Tinggi Fundus (cm)': (item as any).tinggi_fundus || '-',
          'Riwayat Penyakit': (item as any).riwayat_penyakit || '-',
          'Anak Ke-': item.jumlah_anak || '-',
          'Kadar Hb': (item.kadar_hemoglobin && Number(item.kadar_hemoglobin) > 0) ? item.kadar_hemoglobin : '-',
          'Berat Janin': item.berat_janin || '-',
          'Rokok': formatBool(item.terpapar_rokok),
          'KIE': formatBool(item.kie),
          'TTD': formatBool(item.suplemen_tambah_darah),
          'Risiko KEK': lilaText,
          'Risiko Anemia': hbText,
        }
      }
      case 'pasca_persalinan':
        return {
          ...baseData,
          'Tempat Persalinan': warga.tempat_persalinan || '-',
          'Tanggal Persalinan': formatDateID(item.tanggal_persalinan),
          'Tekanan Darah': (item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-',
          'Kondisi Ibu': item.kondisi_ibu || '-',
          'Tinggi Bayi': item.tinggi_badan_bayi || '-',
          'Berat Bayi': item.berat_badan_bayi || '-',
          'KIE': formatBool(item.kie),
          'Rujukan': formatBool(item.fasilitasi_rujukan),
          'Bansos': formatBool(item.fasilitasi_bantuan_sosial),
          'Catatan': item.catatan || '-',
        }
      case 'lansia':
        return {
          ...baseData,
          'Umur (Tahun)': ageText,
          'Berat Badan (kg)': item.bb || '-',
          'Tinggi Badan (cm)': item.tb || '-',
          'Tekanan Darah': (item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-',
          'Gula Darah (mg/dL)': item.gula_darah_sewaktu || '-',
          'Kolesterol (mg/dL)': item.kolesterol || '-',
          'Asam Urat (mg/dL)': item.asam_urat || '-',
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
