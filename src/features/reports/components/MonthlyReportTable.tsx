import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { calculateIMT, classifyIMT, classifyTekananDarah } from '@/utils/kesehatan'
import { formatTimeWib } from '@/utils/dateTime'
import type { ReportImmunisasi, ReportPemeriksaanItem } from '../types/reportPemeriksaan'

interface MonthlyReportTableProps {
  kategori: string
  data: ReportPemeriksaanItem[]
  isLoading: boolean
}

export function MonthlyReportTable({ kategori, data, isLoading }: MonthlyReportTableProps) {
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
      </>
    )

    const visitHeader = <TableHead>Tgl & Jam Kunjungan</TableHead>

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
            <TableHead>Berat Badan (kg)</TableHead>
            <TableHead>Tinggi Badan (cm)</TableHead>
            <TableHead>IMT</TableHead>
            <TableHead>LILA (cm)</TableHead>
            <TableHead>Status KEK</TableHead>
            <TableHead>Lingkar Perut (cm)</TableHead>
            <TableHead>Anak Ke-</TableHead>
            <TableHead>Kadar Hb</TableHead>
            <TableHead>Status Anemia</TableHead>
            <TableHead>Berat Janin</TableHead>
            <TableHead>Rokok</TableHead>
            <TableHead>KIE</TableHead>
            <TableHead>TTD</TableHead>
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
            <TableHead>IMT</TableHead>
            <TableHead>Status IMT</TableHead>
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
            <TableHead>IMT</TableHead>
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

    const visitDate = item.tanggal_kunjungan ? new Date(item.tanggal_kunjungan).toLocaleDateString('id-ID') : '-'
    const visitTime = formatTimeWib(item.created_at)
    const tglJamKunjungan = `${visitDate} ${visitTime}`

    const commonDemographicsCells = (
      <>
        <TableCell>{(warga as any).posyandu?.nama || '-'}</TableCell>
        <TableCell>{warga.nik || '-'}</TableCell>
        <TableCell>{warga.nomor || '-'}</TableCell>
        <TableCell>{`${warga.tempat_lahir || '-'}, ${warga.tanggal_lahir ? new Date(warga.tanggal_lahir).toLocaleDateString('id-ID') : '-'}`}</TableCell>
        <TableCell>{warga.alamat || '-'}</TableCell>
        <TableCell>{warga.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</TableCell>
      </>
    )

    const visitCell = <TableCell>{tglJamKunjungan}</TableCell>

    switch (kategori) {
      case 'baduta':
      case 'balita': {
        const namaIbu = item.nama_ibu || '-'
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
            <TableCell>{item.asi_eksklusif ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.fasilitasi_bantuan_sosial ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.catatan || '-'}</TableCell>
            <TableCell>{(warga.riwayat_imunisasi || []).map((i: ReportImmunisasi) => i.jenis_vaksin).join(', ') || '-'}</TableCell>
          </>
        )
      }
      case 'bumil':
        let skek = 'Normal';
        let skekc = 'green' as 'green' | 'orange' | 'red';
        if (item.lingkar_lengan_atas && Number(item.lingkar_lengan_atas) < 23.5) {
          skek = 'Risiko KEK';
          skekc = 'red';
        } else if (!item.lingkar_lengan_atas) {
          skek = '-';
        }

        let san = 'Normal';
        let sanc = 'green' as 'green' | 'orange' | 'red';
        if (item.kadar_hemoglobin && Number(item.kadar_hemoglobin) > 0) {
          const hb = Number(item.kadar_hemoglobin);
          if (hb < 8) { san = 'Anemia Berat'; sanc = 'red'; }
          else if (hb < 11) { san = 'Anemia Ringan'; sanc = 'orange'; }
        } else {
          san = '-';
        }

        return (
          <>
            {visitCell}
            <TableCell className="font-medium">{warga.nama}</TableCell>
            {commonDemographicsCells}
            <TableCell>{item.usia_kehamilan_minggu || '-'}</TableCell>
            <TableCell>{item.bb || '-'}</TableCell>
            <TableCell>{item.tb || '-'}</TableCell>
            <TableCell>
              {(() => {
                const imt = calculateIMT(item.bb ? Number(item.bb) : null, item.tb ? Number(item.tb) : null);
                return imt !== null ? `${imt.toFixed(1)} (${classifyIMT(imt)})` : '-';
              })()}
            </TableCell>
            <TableCell>{item.lingkar_lengan_atas || '-'}</TableCell>
            <TableCell>{renderBadge(skek, skekc)}</TableCell>
            <TableCell>{item.lingkar_perut || '-'}</TableCell>
            <TableCell>{item.jumlah_anak || '-'}</TableCell>
            <TableCell>{(item.kadar_hemoglobin && Number(item.kadar_hemoglobin) > 0) ? item.kadar_hemoglobin : '-'}</TableCell>
            <TableCell>{renderBadge(san, sanc)}</TableCell>
            <TableCell>{item.berat_janin || '-'}</TableCell>
            <TableCell>{item.terpapar_rokok ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.kie ? 'Ya' : 'Tidak'}</TableCell>
            <TableCell>{item.suplemen_tambah_darah ? 'Ya' : 'Tidak'}</TableCell>
          </>
        )
      case 'pasca_persalinan':
        let tdStatusP = classifyTekananDarah(item.tekanan_darah_sistolik, item.tekanan_darah_diastolik);
        let tdColorP = 'green' as 'green' | 'orange' | 'red';
        if (tdStatusP === 'Prahipertensi') tdColorP = 'orange';
        if (tdStatusP === 'Hipertensi') tdColorP = 'red';
        if (!item.tekanan_darah_sistolik) tdStatusP = '-';

        let imtVal = calculateIMT(item.bb ? Number(item.bb) : null, item.tb ? Number(item.tb) : null);
        let imtClass = imtVal ? classifyIMT(imtVal) : '-';
        let imtColor = 'green' as 'green' | 'orange' | 'red';
        if (imtClass === 'Kurus') imtColor = 'red';
        if (imtClass === 'Gemuk' || imtClass === 'Obesitas') imtColor = 'orange';

        return (
          <>
            {visitCell}
            <TableCell className="font-medium">{warga.nama}</TableCell>
            {commonDemographicsCells}
            <TableCell>{warga.tempat_persalinan || '-'}</TableCell>
            <TableCell>{item.tanggal_persalinan ? new Date(item.tanggal_persalinan).toLocaleDateString('id-ID') : '-'}</TableCell>
            <TableCell>{(item.tekanan_darah_sistolik && item.tekanan_darah_diastolik) ? `${item.tekanan_darah_sistolik}/${item.tekanan_darah_diastolik}` : '-'}</TableCell>
            <TableCell>{renderBadge(tdStatusP, tdColorP)}</TableCell>
            <TableCell>{imtVal ? imtVal.toFixed(1) : '-'}</TableCell>
            <TableCell>{renderBadge(imtClass, imtColor)}</TableCell>
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
            <TableCell>
              {(() => {
                const imt = calculateIMT(item.bb ? Number(item.bb) : null, item.tb ? Number(item.tb) : null);
                return imt !== null ? `${imt.toFixed(1)} (${classifyIMT(imt)})` : '-';
              })()}
            </TableCell>
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

  return (
    <div className="max-w-full overflow-hidden rounded-md border">
      <Table className="min-w-max text-xs sm:text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">No</TableHead>
            {renderHeaders()}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, idx) => (
            <TableRow key={item.id}>
              <TableCell>{idx + 1}</TableCell>
              {renderCells(item)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
