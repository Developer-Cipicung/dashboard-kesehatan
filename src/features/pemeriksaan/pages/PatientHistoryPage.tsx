import { useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useGetWargaById, useDeleteWarga } from '@/features/warga/hooks/useWarga'
import { useGetHistory, useDeletePemeriksaan } from '../hooks/usePemeriksaan'
import { useGetPendataanStatus } from '@/features/pendataan/hooks/usePendataanBulanan'
import { useAuthStore } from '@/stores/authStore'
import { PatientProfileCard } from '../components/PatientProfileCard'
import { HistoryTimeline } from '../components/HistoryTimeline'
import { MonthlyRecordForm } from '../components/MonthlyRecordForm'
import { ImunisasiCell } from '@/features/warga/components/ImunisasiCell'
import { KMSChart } from '@/features/public/components/KMSChart'
import { BumilChart } from '@/features/public/components/BumilChart'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog'
import { Pemeriksaan } from '../services/pemeriksaanService'

export function PatientHistoryPage() {
  const { kategori, id } = useParams<{ kategori: string; id: string }>()
  const navigate = useNavigate()
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Pemeriksaan | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmDeleteWarga, setConfirmDeleteWarga] = useState(false)

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const { selectedPosyanduId, posyandu, user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const [searchParams] = useSearchParams()
  const queryPosyanduId = searchParams.get('posyanduId')
  const activePosyanduId = isAdmin ? (queryPosyanduId || undefined) : (selectedPosyanduId || undefined)

  // Queries
  const { data: warga, isLoading: isWargaLoading, error: wargaError } = useGetWargaById(id!, activePosyanduId)
  const { data: history, isLoading: isHistoryLoading, error: historyError } = useGetHistory(kategori!, id!, activePosyanduId)
  const { data: pendataanStatus, isLoading: isStatusLoading } = useGetPendataanStatus(currentMonth, currentYear, activePosyanduId)

  const { mutate: deletePemeriksaan, isPending: isDeleting } = useDeletePemeriksaan(activePosyanduId)
  const { mutate: deleteWarga, isPending: isDeletingWarga } = useDeleteWarga(activePosyanduId)

  const isLocked = pendataanStatus?.status === 'selesai'
  const isReadOnly = isAdmin ? false : (posyandu?.id !== selectedPosyanduId)

  const handleEdit = (record: Pemeriksaan) => {
    setEditingRecord(record)
    setIsFormOpen(true)
  }

  const handleAdd = () => {
    setEditingRecord(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open)
    if (!open) {
      setTimeout(() => setEditingRecord(null), 200)
    }
  }

  const handleDelete = (recordId: string) => {
    setConfirmDeleteId(recordId)
  }

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deletePemeriksaan(
        { kategori: kategori!, id: confirmDeleteId },
        {
          onSettled: () => {
            setConfirmDeleteId(null)
          }
        }
      )
    }
  }

  const handleConfirmDeleteWarga = () => {
    deleteWarga(id!, {
      onSuccess: () => {
        if (isAdmin) {
          navigate(`/admin/warga/${kategori?.replace('_', '-')}`)
        } else {
          navigate(`/${kategori?.replace('_', '-')}`)
        }
      }
    })
  }

  if (isWargaLoading || isHistoryLoading || isStatusLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (wargaError || historyError || !warga) {
    return (
      <ErrorState
        title="Gagal memuat detail pasien"
        message="Pasien tidak ditemukan atau terjadi kesalahan jaringan."
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="h-8 pl-0 text-xs sm:h-9 sm:text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div className="flex items-center gap-3 ml-auto">
          {isLocked && (
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
              Pendataan Sudah Terkunci
            </div>
          )}
          {isReadOnly && !isLocked && (
            <div className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-semibold">
              Mode Baca Saja (Beda Posyandu)
            </div>
          )}
          {!isReadOnly && (
            <Button variant="destructive" onClick={() => setConfirmDeleteWarga(true)} className="h-8 text-xs sm:h-9 sm:text-sm px-3 shadow-sm">
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Hapus Pasien
            </Button>
          )}
        </div>
      </div>

      <PatientProfileCard warga={warga} kategori={kategori} />

      {(kategori === 'balita' || kategori === 'baduta') && (
        <>
          <div className="bg-white p-5 rounded-xl border border-slate-200 mt-6 shadow-sm">
            <h3 className="text-lg font-bold mb-3">Kelola Imunisasi</h3>
            <div className="max-w-md">
              <ImunisasiCell wargaId={id!} disabled={isReadOnly} />
            </div>
          </div>
          
          <div className="mt-6">
            <KMSChart warga={warga} />
          </div>
        </>
      )}

      {kategori === 'bumil' && (
        <div className="mt-6">
          <BumilChart warga={warga} />
        </div>
      )}

      <div className="mt-6 mb-3 flex items-center justify-between gap-3 sm:mt-8 sm:mb-4">
        <h3 className="text-lg font-bold sm:text-xl">Riwayat Pemeriksaan</h3>
        {!isLocked && !isReadOnly && (
          <Button onClick={handleAdd} className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
            <Plus className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
            Tambah Riwayat
          </Button>
        )}
      </div>

      <HistoryTimeline
        history={history || []}
        warga={warga}
        kategori={kategori!}
        isLocked={isReadOnly}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <MonthlyRecordForm
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        kategori={kategori!}
        wargaId={id!}
        wargaPosyanduId={activePosyanduId}
        initialData={editingRecord}
        previousRecord={history?.[0]}
        defaultTanggalPersalinan={warga.pemeriksaan_pasca_persalinan?.[0]?.tanggal_persalinan}
      />

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Riwayat Pemeriksaan"
        description="Apakah Anda yakin ingin menghapus riwayat pemeriksaan ini? Data yang dihapus tidak dapat dikembalikan."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        variant="destructive"
      />

      <ConfirmDialog
        open={confirmDeleteWarga}
        onOpenChange={setConfirmDeleteWarga}
        title="Hapus Pasien"
        description={`Apakah Anda yakin ingin menghapus pasien ${warga.nama}? Semua riwayat pemeriksaan untuk pasien ini akan ikut terhapus secara permanen.`}
        onConfirm={handleConfirmDeleteWarga}
        isLoading={isDeletingWarga}
        variant="destructive"
      />
    </div>
  )
}
