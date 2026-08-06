import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { formatDateID } from '@/utils/dateFormatter'
import { classifyTekananDarah } from '@/utils/kesehatan'
import { calculateHpl } from '../../warga/components/PatientTable'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import type { ReportImmunisasi, ReportPemeriksaanItem } from '../types/reportPemeriksaan'

interface MonthlyReportTableProps {
  kategori: string
  data: ReportPemeriksaanItem[]
  isLoading: boolean
}

export function MonthlyReportTable({ kategori, data, isLoading }: MonthlyReportTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    setCurrentPage(1)
  }, [kategori, data])

  if (isLoading) {
    return <SkeletonCard />
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border bg-slate-50 p-6 text-center text-sm text-slate-500 sm:p-8">
        <p>Belum ada data pemeriksaan untuk kategori ini pada bulan ini.</p>
      </div>
    )
  }

  const renderBadge = (text: string | null, color: 'green' | 'orange' | 'red' | 'blue' = 'green') => {
    if (!text) return '-';
    const colors = {
      green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      orange: 'bg-amber-50 text-amber-700 border-amber-200',
      red: 'bg-rose-50 text-rose-700 border-rose-200',
      blue: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return <span className={`inline-block whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase sm:px-2 ${colors[color]}`}>{text}</span>;
  }

  const renderHeaders = () => {
    const commonDemographicsHeaders = (
      <>
        <TableHead>Posyandu</TableHead>
        <TableHead>NIK</TableHead>
        <TableHead>No. HP</TableHead>
        <TableHead>Tempat, Tgl Lahir</TableHead>
        <TableHead>Alamat</TableHead>
        <TableHead>Jenis Kelamin</TableHead>
        <TableHead>BPJS</TableHead>
      </>
    )

    const visitHeader = <TableHead>Tanggal Kunjungan</TableHead>

    switch (kategori) {
      case 'baduta':
      case 'balita':
        return (
          <>
            {visitHeader}
            <TableHead>Nama Balita</TableHead>
            {commonDemographicsHeaders}
            <TableHead>Umur (Bulan)</TableHead>
            <TableHead>Nama Ibu</TableHead>
            <TableHead>Kontrasepsi Ibu</TableHead>
            <TableHead>Berat Badan (kg)</TableHead>
            <TableHead>Tinggi Badan (cm)</TableHead>
            <TableHead>Lingkar Kepala (cm)</TableHead>
            <TableHead>Status Gizi (BB/TB)</TableHead>
            <TableHead>Status Berat (BB/U)</TableHead>
            <TableHead>Status Tinggi (TB/U)</TableHead>
            <TableHead>Kondisi</TableHead>
            <TableHead>ASI Eksklusif</TableHead>
            <TableHead>Bansos</TableHead>
            <TableHead>Catatan</TableHead>
            <TableHead>Imunisasi</TableHead>
          </>
        )
      case 'bumil':
        return (
          <>
            {visitHeader}
            <TableHead>Nama Ibu Hamil</TableHead>
            {commonDemographicsHeaders}
            <TableHead>Usia Kehamilan (Minggu)</TableHead>
            <TableHead>HPHT</TableHead>
            <TableHead>HPL</TableHead>
            <TableHead>Berat Badan (kg)</TableHead>
            <TableHead>Tinggi Badan (cm)</TableHead>
            <TableHead>Tekanan Darah</TableHead>
            <TableHead>Status TD</TableHead>
            <TableHead>LILA (cm)</TableHead>
            <TableHead>Lingkar Perut (cm)</TableHead>
            <TableHead>Tinggi Fundus (cm)</TableHead>
            <TableHead>Riwayat Penyakit</TableHead>
            <TableHead>Anak Ke-</TableHead>
            <TableHead>Kadar Hb</TableHead>
            <TableHead>Berat Janin</TableHead>
            <TableHead>Rokok</TableHead>
            <TableHead>KIE</TableHead>
            <TableHead>TTD</TableHead>
            <TableHead>Risiko KEK</TableHead>
            <TableHead>Risiko Anemia</TableHead>
          </>
        )
      case 'pasca_persalinan':
        return (
          <>
            {visitHeader}
            <TableHead>Nama Ibu</TableHead>
            {commonDemographicsHeaders}
            <TableHead>Tempat Persalinan</TableHead>
            <TableHead>Tanggal Persalinan</TableHead>
            <TableHead>Tekanan Darah</TableHead>
            <TableHead>Status TD</TableHead>

            <TableHead>Kondisi Ibu</TableHead>
            <TableHead>Tinggi Bayi</TableHead>
            <TableHead>Berat Bayi</TableHead>
            <TableHead>KIE</TableHead>
            <TableHead>Rujukan</TableHead>
            <TableHead>Bansos</TableHead>
            <TableHead>Catatan</TableHead>
          </>
        )
      case 'lansia':
        return (
          <>
            {visitHeader}
            <TableHead>Nama Lansia</TableHead>
            {commonDemographicsHeaders}
            <TableHead>Umur (Tahun)</TableHead>
            <TableHead>Tinggi Badan (cm)</TableHead>
            <TableHead>Berat Badan (kg)</TableHead>

            <TableHead>Tekanan Darah</TableHead>
            <TableHead>Status TD</TableHead>
            <TableHead>Gula Darah (mg/dL)</TableHead>
            <TableHead>Status Gula Darah</TableHead>
            <TableHead>Kolesterol (mg/dL)</TableHead>
            <TableHead>Status Kolesterol</TableHead>
            <TableHead>Asam Urat (mg/dL)</TableHead>
            <TableHead>Status Asam Urat</TableHead>
            <TableHead>Catatan</TableHead>
          </>
        )
      default:
        return (
          <>
            {visitHeader}
            <TableHead>Nama Warga</TableHead>
          </>
        )
    }
  }

  const renderCells = (item: ReportPemeriksaanItem) => {
    const warga = item.warga || {}
    
    // Calculate Age
    let ageText = '-'
    if (warga.tanggal_lahir && item.tanggal_kunjungan) {
      if (kategori === 'baduta' || kategori === 'balita') {
        const ageMonths = Math.floor((new Date(item.tanggal_kunjungan).getTime() - new Date(warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
        ageText = `${ageMonths} bln`
      } else {
        const ageYears = Math.floor((new Date(item.tanggal_kunjungan).getTime() - new Date(warga.tanggal_lahir).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        ageText = `${ageYears} thn`
      }
    }

    const visitDate = formatDateID(item.tanggal_kunjungan)
    const visitCell = <TableCell>{visitDate}</TableCell>

    const commonDemographicsCells = (
      <>
        <TableCell>{(warga as any).posyandu?.nama || '-'}</TableCell>
        <TableCell>{warga.nik || '-'}</TableCell>
        <TableCell>{warga.nomor || '-'}</TableCell>
        <TableCell>{`${warga.tempat_lahir || '-'}, ${formatDateID(warga.tanggal_lahir)}`}</TableCell>
        <TableCell>
          {warga.alamat || '-'}
          {(warga.rt || warga.rw) ? `, RT ${warga.rt || '-'} RW ${warga.rw || '-'}` : ''}
        </TableCell>
        <TableCell>{warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</TableCell>
        <TableCell>{warga.memiliki_bpjs ? 'Ya' : 'Tidak'}</TableCell>
      </>
    )


    switch (kategori) {
      case 'baduta':
      case 'balita': {
        const namaIbu = item.warga?.ibu?.nama || item.warga?.nama_ibu || item.nama_ibu || '-'
        let sg = item.status_gizi?.kategori_bb_tb || '-';
        let sc = 'green' as 'green' | 'orange' | 'red';
        if (sg.toLowerCase().includes('kurang') || sg.toLowerCase().includes('buruk')) sc = 'red';
        else if (sg.toLowerCase().includes('lebih') || sg.toLowerCase().includes('obesitas') || sg.toLowerCase().includes('overweight')) sc = 'orange';
        
        let sbb = item.status_gizi?.kategori_bb_u || '-';
        let sbbc = 'green' as 'green' | 'orange' | 'red';
        if (sbb.toLowerCase().includes('kurang')) sbbc = 'red';
        else if (sbb.toLowerCase().includes('lebih') || sbb.toLowerCase().includes('risiko')) sbbc = 'orange';

        let stb = item.status_gizi?.kategori_tb_u || '-';
        let stbc = 'green' as 'green' | 'orange' | 'red' | 'blue';
        if (stb.toLowerCase().includes('pendek')) stbc = 'red';
        else if (stb.toLowerCase().includes('tinggi')) stbc = 'blue';

        return (
          <>
            {visitCell}
            <TableCell className="font-medium">{warga.nama}</TableCell>
            {commonDemographicsCells}
            <TableCell>{ageText}</TableCell>
            <TableCell>{namaIbu}</TableCell>
            <TableCell>{warga.penggunaan_kontrasepsi || '-'}</TableCell>
            <TableCell>{item.bb || '-'}</TableCell>
            <TableCell>{item.tb || '-'}</TableCell>
            <TableCell>{item.lingkar_kepala || '-'}</TableCell>
            <TableCell>{renderBadge(sg, sc)}</TableCell>
            <TableCell>{renderBadge(sbb, sbbc)}</TableCell>
            <TableCell>{renderBadge(stb, stbc)}</TableCell>
            <TableCell>{item.kondisi || '-'}</TableCell>
            <TableCell>{item.is_belum_diperiksa ? '-' : (item.asi_eksklusif ? 'Ya' : 'Tidak')}</TableCell>
            <TableCell>{item.is_belum_diperiksa ? '-' : (item.fasilitasi_bantuan_sosial ? 'Ya' : 'Tidak')}</TableCell>
            <TableCell>{item.catatan || '-'}</TableCell>
            <TableCell>{(warga.riwayat_imunisasi || []).map((i: ReportImmunisasi) => i.jenis_vaksin).join(', ') || '-'}</TableCell>
          </>
        )
      }
      case 'bumil':
        const isUnexaminedBumil = item.is_belum_diperiksa === true;
        let skekText = '-';
        if (!isUnexaminedBumil && item.lingkar_lengan_atas) {
          const lila = Number(item.lingkar_lengan_atas);
          skekText = `${lila} (${lila < 23.5 ? 'KEK' : 'Normal'})`;
        }

        let sanText = '-';
        if (!isUnexaminedBumil && item.kadar_hemoglobin && Number(item.kadar_hemoglobin) > 0) {
          const hb = Number(item.kadar_hemoglobin);
          let status = 'Normal';
          if (hb < 8) status = 'Berat';
          else if (hb < 11) status = 'Ringan';
          sanText = `${hb} (${status})`;
        }
        
        const formatBoolBumil = (val: any) => isUnexaminedBumil ? '-' : (val ? 'Ya' : 'Tidak');

        let tdStatusB = classifyTekananDarah(item.tekanan_darah_sistolik, item.tekanan_darah_diastolik);
        let tdColorB = 'green' as 'green' | 'orange' | 'red';
        if (tdStatusB.toLowerCase().includes('rendah') || tdStatusB.toLowerCase().includes('hipertensi')) tdColorB = 'red';
        else if (tdStatusB.toLowerCase().includes('pra')) tdColorB = 'orange';
        if (!item.tekanan_darah_sistolik) tdStatusB = '-';

        return (
          <>
            {visitCell}
            <TableCell className="font-medium">{warga.nama}</TableCell>
            {commonDemographicsCells}
            <TableCell>{item.usia_kehamilan_minggu || '-'}</TableCell>
            <TableCell>{formatDateID(warga.hpht)}</TableCell>
            <TableCell>{formatDateID(warga.htp || calculateHpl(warga.hpht))}</TableCell>
            <TableCell>{item.bb || '-'}</TableCell>
            <TableCell>{item.tb || '-'}</TableCell>
            <TableCell>{(item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-'}</TableCell>
            <TableCell>{renderBadge(tdStatusB, tdColorB)}</TableCell>
            <TableCell>{item.lingkar_lengan_atas || '-'}</TableCell>
            <TableCell>{item.lingkar_perut || '-'}</TableCell>
            <TableCell>{(item as any).tinggi_fundus || '-'}</TableCell>
            <TableCell>{(item as any).riwayat_penyakit || '-'}</TableCell>
            <TableCell>{item.jumlah_anak || '-'}</TableCell>
            <TableCell>{(item.kadar_hemoglobin && Number(item.kadar_hemoglobin) > 0) ? item.kadar_hemoglobin : '-'}</TableCell>
            <TableCell>{item.berat_janin || '-'}</TableCell>
            <TableCell>{formatBoolBumil(item.terpapar_rokok)}</TableCell>
            <TableCell>{formatBoolBumil(item.kie)}</TableCell>
            <TableCell>{formatBoolBumil(item.suplemen_tambah_darah)}</TableCell>
            <TableCell>{skekText}</TableCell>
            <TableCell>{sanText}</TableCell>
          </>
        )
      case 'pasca_persalinan':
        let tdStatusP = classifyTekananDarah(item.tekanan_darah_sistolik, item.tekanan_darah_diastolik);
        let tdColorP = 'green' as 'green' | 'orange' | 'red';
        if (tdStatusP === 'Prahipertensi') tdColorP = 'orange';
        if (tdStatusP === 'Hipertensi') tdColorP = 'red';
        if (!item.tekanan_darah_sistolik) tdStatusP = '-';



        return (
          <>
            {visitCell}
            <TableCell className="font-medium">{warga.nama}</TableCell>
            {commonDemographicsCells}
            <TableCell>{warga.tempat_persalinan || '-'}</TableCell>
            <TableCell>{formatDateID(item.tanggal_persalinan)}</TableCell>
            <TableCell>{(item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-'}</TableCell>
            <TableCell>{renderBadge(tdStatusP, tdColorP)}</TableCell>

            <TableCell>{item.kondisi_ibu || '-'}</TableCell>
            <TableCell>{item.tinggi_badan_bayi || '-'}</TableCell>
            <TableCell>{item.berat_badan_bayi || '-'}</TableCell>
            <TableCell>{item.kie ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.fasilitasi_rujukan ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.fasilitasi_bantuan_sosial ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.catatan || '-'}</TableCell>
          </>
        )
      case 'lansia':
        let tdStatus = classifyTekananDarah(item.tekanan_darah_sistolik, item.tekanan_darah_diastolik);
        let tdColor = 'green' as 'green' | 'orange' | 'red';
        if (tdStatus === 'Prahipertensi') tdColor = 'orange';
        if (tdStatus === 'Hipertensi') tdColor = 'red';
        if (!item.tekanan_darah_sistolik) tdStatus = '-';

        let gdStatus = '-';
        let gdColor = 'green' as 'green' | 'orange' | 'red';
        if (item.gula_darah_sewaktu) {
          if (Number(item.gula_darah_sewaktu) > 200) { gdStatus = 'Tinggi'; gdColor = 'red'; }
          else { gdStatus = 'Normal'; }
        }

        let kolStatus = '-';
        let kolColor = 'green' as 'green' | 'orange' | 'red';
        if (item.kolesterol) {
          if (Number(item.kolesterol) > 200) { kolStatus = 'Tinggi'; kolColor = 'red'; }
          else { kolStatus = 'Normal'; }
        }

        let auStatus = '-';
        let auColor = 'green' as 'green' | 'orange' | 'red';
        if (item.asam_urat) {
          if (Number(item.asam_urat) > 7) { auStatus = 'Tinggi'; auColor = 'red'; }
          else { auStatus = 'Normal'; }
        }

        return (
          <>
            {visitCell}
            <TableCell className="font-medium">{warga.nama}</TableCell>
            {commonDemographicsCells}
            <TableCell>{ageText}</TableCell>
            <TableCell>{item.tb || '-'}</TableCell>
            <TableCell>{item.bb || '-'}</TableCell>

            <TableCell>{(item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-'}</TableCell>
            <TableCell>{renderBadge(tdStatus, tdColor)}</TableCell>
            <TableCell>{item.gula_darah_sewaktu || '-'}</TableCell>
            <TableCell>{renderBadge(gdStatus, gdColor)}</TableCell>
            <TableCell>{item.kolesterol || '-'}</TableCell>
            <TableCell>{renderBadge(kolStatus, kolColor)}</TableCell>
            <TableCell>{item.asam_urat || '-'}</TableCell>
            <TableCell>{renderBadge(auStatus, auColor)}</TableCell>
            <TableCell>{item.catatan || '-'}</TableCell>
          </>
        )
      default:
        return (
          <>
            {visitCell}
            <TableCell className="font-medium">{warga.nama}</TableCell>
          </>
        )
    }
  }

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <div className="space-y-4">
      <div className="max-w-full overflow-hidden rounded-md border">
        <Table className="min-w-max text-xs sm:text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No</TableHead>
              {renderHeaders()}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, idx) => (
              <TableRow key={item.id}>
                <TableCell>{startIndex + idx + 1}</TableCell>
                {renderCells(item)}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-b-md">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Menampilkan <span className="font-medium">{startIndex + 1}</span> hingga <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, data.length)}</span> dari <span className="font-medium">{data.length}</span> hasil
              </p>
            </div>
            <div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  <div className="flex items-center px-4 text-sm font-medium text-slate-700">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
