import { useState } from 'react'
import { isBalitaByBirthDate, isBadutaByBirthDate } from '@/utils/age'

import { useAuthStore } from '@/stores/authStore'
import { useGetPendataanStatus, useGetPendataanSummary, useSubmitPendataan, useBatalkanPendataan } from '../hooks/usePendataanBulanan'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle2, Lock, XCircle } from 'lucide-react'
import { formatDateTimeWib } from '@/utils/dateTime'

type SummaryCategory = 'baduta' | 'balita' | 'bumil' | 'pasca_persalinan' | 'lansia' | 'warga_baru'

interface SummaryRow {
  id: string
  nama: string
  tanggal?: string
  created_at?: string
  tanggal_daftar?: string
  bb?: number
  tb?: number
  tanggal_lahir?: string
  usia_kehamilan_minggu?: number
  lingkar_lengan_atas?: number
  td_sistolik?: number
  td_diastolik?: number
  gula_darah_sewaktu?: number
  nik?: string
  jenis_kelamin?: string
}

export function VerifikasiPendataanPage() {
  const { selectedPosyanduId } = useAuthStore()
  
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const { data: statusData, isLoading: isLoadingStatus } = useGetPendataanStatus(currentMonth, currentYear, selectedPosyanduId || undefined)
  const { data: summaryData, isLoading: isLoadingSummary, error, refetch } = useGetPendataanSummary(currentMonth, currentYear, selectedPosyanduId || undefined)
  const { mutate: submitPendataan, isPending: isSubmitting } = useSubmitPendataan()
  const { mutate: batalkanPendataan, isPending: isBataling } = useBatalkanPendataan()

  const [tanggalPelaksanaan, setTanggalPelaksanaan] = useState(new Date().toISOString().split('T')[0])

  const isLoading = isLoadingStatus || isLoadingSummary
  const isLocked = statusData?.status === 'selesai'

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error || !summaryData) {
    return (
      <ErrorState
        title="Gagal memuat ringkasan"
        message="Terjadi kesalahan saat mengambil riwayat pendataan bulan ini."
        onRetry={() => refetch()}
      />
    )
  }

  const handleLock = () => {
    if (!tanggalPelaksanaan || !statusData?.id) return
    submitPendataan(
      { id: statusData.id, tanggal_pelaksanaan: new Date(tanggalPelaksanaan).toISOString() },
      { onSuccess: () => {} },
    )
  }

  const getInputTime = (category: SummaryCategory, item: SummaryRow) => {
    if (category === 'warga_baru') return formatDateTimeWib(item.tanggal_daftar)
    return formatDateTimeWib(item.created_at)
  }

  const renderTable = (title: string, category: SummaryCategory, data: SummaryRow[]) => {
    if (data.length === 0) return null

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">{title} <span className="text-sm font-normal text-slate-500 ml-2">({data.length} data)</span></h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No</TableHead>
                <TableHead>Nama Warga</TableHead>
                {(category === 'balita' || category === 'baduta') && (
                  <>
                    <TableHead>BB (kg)</TableHead>
                    <TableHead>TB (cm)</TableHead>
                  </>
                )}
                {category === 'bumil' && (
                  <>
                    <TableHead>Usia Kehamilan</TableHead>
                    <TableHead>BB (kg)</TableHead>
                    <TableHead>LILA (cm)</TableHead>
                  </>
                )}
                {category === 'pasca_persalinan' && (
                  <>
                    <TableHead>Tensi (mmHg)</TableHead>
                  </>
                )}
                {category === 'lansia' && (
                  <>
                    <TableHead>Tensi (mmHg)</TableHead>
                    <TableHead>BB (kg)</TableHead>
                    <TableHead>Gula Darah</TableHead>
                  </>
                )}
                {category === 'warga_baru' && (
                  <>
                    <TableHead>NIK</TableHead>
                    <TableHead>L/P</TableHead>
                  </>
                )}
                <TableHead className="text-right">Waktu Input</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  {(category === 'balita' || category === 'baduta') && (
                    <>
                      <TableCell>{item.bb} kg</TableCell>
                      <TableCell>{item.tb} cm</TableCell>
                    </>
                  )}
                  {category === 'bumil' && (
                    <>
                      <TableCell>{item.usia_kehamilan_minggu} mgg</TableCell>
                      <TableCell>{item.bb}</TableCell>
                      <TableCell>{item.lingkar_lengan_atas}</TableCell>
                    </>
                  )}
                  {category === 'pasca_persalinan' && (
                    <>
                      <TableCell>{item.td_sistolik}/{item.td_diastolik}</TableCell>
                    </>
                  )}
                  {category === 'lansia' && (
                    <>
                      <TableCell>{item.td_sistolik}/{item.td_diastolik}</TableCell>
                      <TableCell>{item.bb}</TableCell>
                      <TableCell>{item.gula_darah_sewaktu}</TableCell>
                    </>
                  )}
                  {category === 'warga_baru' && (
                    <>
                      <TableCell>{item.nik}</TableCell>
                      <TableCell>{item.jenis_kelamin}</TableCell>
                    </>
                  )}
                  <TableCell className="text-right text-slate-500 text-sm">{getInputTime(category, item)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const totalData = summaryData.balita.length + summaryData.bumil.length + summaryData.pasca_persalinan.length + summaryData.lansia.length + summaryData.warga_baru.length

  return (
    <div className="flex flex-col space-y-6 pb-20 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Verifikasi Pendataan</h1>
          <p className="text-sm text-slate-500">Bulan {currentMonth} Tahun {currentYear}</p>
        </div>
      </div>

      {isLocked ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-emerald-800">Pendataan Selesai</h2>
          <p className="text-emerald-600 max-w-md">
            Data posyandu untuk bulan ini telah berhasil dikunci dan direkapitulasi. Anda dapat melihat laporannya di menu Laporan.
          </p>
          <button
            className="mt-2 flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
            disabled={isBataling}
            onClick={() => {
              if (window.confirm('Batalkan verifikasi pendataan ini? Status akan kembali ke Draft dan data bisa diubah kembali.')) {
                if (statusData?.id) batalkanPendataan(statusData.id)
              }
            }}
          >
            <XCircle className="w-4 h-4" />
            {isBataling ? 'Membatalkan...' : 'Batalkan Verifikasi'}
          </button>
        </div>
      ) : (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-start md:items-center gap-4 flex-col md:flex-row justify-between border-b pb-6 mb-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" /> Kunci Pendataan
              </h2>
              <p className="text-sm text-slate-500">
                Tentukan tanggal pelaksanaan Posyandu. Semua data {totalData} riwayat pemeriksaan di bawah ini akan diubah tanggalnya sesuai dengan hari H pelaksanaan dan kemudian dikunci secara permanen.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 w-full">
              <Label htmlFor="tanggal_pelaksanaan">Tanggal Pelaksanaan Posyandu</Label>
              <Input
                id="tanggal_pelaksanaan"
                type="date"
                value={tanggalPelaksanaan}
                onChange={(e) => setTanggalPelaksanaan(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary-dark w-full md:w-auto"
              onClick={handleLock}
              disabled={isSubmitting || !tanggalPelaksanaan || totalData === 0}
            >
              {isSubmitting ? 'Mengunci...' : 'Ya, Kunci Sekarang'}
            </Button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Rincian Data Tersimpan Bulan Ini</h2>
        {totalData === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500">Belum ada riwayat kesehatan atau warga baru yang ditambahkan bulan ini.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h3 className="text-md font-semibold text-slate-600 mb-3 border-b pb-2">Pendaftaran Warga Baru</h3>
              {summaryData.warga_baru.length > 0 ? (
                renderTable('Warga Baru Didaftarkan', 'warga_baru', summaryData.warga_baru)
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm">Tidak ada warga baru yang didaftarkan bulan ini.</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="text-md font-semibold text-slate-600 mb-3 border-b pb-2">Riwayat Pemeriksaan Ditambahkan</h3>
              {(summaryData.balita.length > 0 || summaryData.bumil.length > 0 || summaryData.pasca_persalinan.length > 0 || summaryData.lansia.length > 0) ? (
                <>
                  {renderTable('Baduta', 'baduta', summaryData.balita.filter(b => isBadutaByBirthDate(b.tanggal_lahir, b.tanggal)))}
                  {renderTable('Balita', 'balita', summaryData.balita.filter(b => isBalitaByBirthDate(b.tanggal_lahir, b.tanggal)))}
                  {renderTable('Ibu Hamil', 'bumil', summaryData.bumil)}
                  {renderTable('Ibu Pasca Persalinan', 'pasca_persalinan', summaryData.pasca_persalinan)}
                  {renderTable('Lansia', 'lansia', summaryData.lansia)}
                </>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm">Tidak ada pemeriksaan warga yang ditambahkan bulan ini.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
