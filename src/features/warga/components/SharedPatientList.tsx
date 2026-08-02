import { useState, useEffect } from 'react'
import { useGetWargaList } from '../hooks/useWarga'
import { PatientToolbar } from './PatientToolbar'
import { PatientTable } from './PatientTable'
import { PatientCard } from './PatientCard'
import { AddPatientDialog } from './AddPatientDialog'
import { ImportHealthRecordModal } from '@/features/pemeriksaan/components/ImportHealthRecordModal'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useNavigate } from 'react-router-dom'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import { useAuthStore } from '@/stores/authStore'

interface SharedPatientListProps {
  title: string
  kategori: string
  posyanduIdOverride?: string
  isAdmin?: boolean
}

export function SharedPatientList({ title, kategori, posyanduIdOverride, isAdmin }: SharedPatientListProps) {
  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isImportHealthOpen, setIsImportHealthOpen] = useState(false)
  const { selectedPosyanduId, posyandu } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('rekapitulasi_kategori', kategori)
  }, [kategori])

  const activePosyanduId = isAdmin ? posyanduIdOverride : (selectedPosyanduId || undefined)
  const isReadOnly = isAdmin ? false : (posyandu?.id !== selectedPosyanduId)

  const [page, setPage] = useState(1)
  const LIMIT = 10

  const handleSearchChange = (val: string) => {
    setSearch(val)
    setPage(1) // Reset ke halaman 1 jika mencari
  }

  const { data, isLoading, error, refetch } = useGetWargaList({
    search: search.trim() || undefined,
    kategori,
    page,
    limit: LIMIT,
    posyanduId: activePosyanduId,
  })

  const paginatedWarga = data?.data || []
  const totalPatients = data?.metadata.total || 0
  const totalPages = data?.metadata.totalPages || 1

  const handleView = (id: string) => {
    navigate(`/${kategori.replace('_', '-')}/${id}`)
  }

  return (
    <div className="flex flex-col space-y-6">
      <PatientToolbar
        title={title}
        searchQuery={search}
        onSearchChange={handleSearchChange}
        totalPatients={totalPatients}
        onAddPatient={() => setIsAddOpen(true)}
        onImportHealth={() => setIsImportHealthOpen(true)}
        isReadOnly={isReadOnly}
      />

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState
          title="Gagal memuat data"
          message="Terjadi kesalahan saat mengambil daftar pasien."
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block">
            <PatientTable
              data={paginatedWarga}
              kategori={kategori}
              onView={handleView}
              isReadOnly={isReadOnly}
            />
          </div>

          {/* Mobile View */}
          <div className="block md:hidden">
            {paginatedWarga.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-card rounded-lg border">
                Tidak ada pasien ditemukan.
              </div>
            ) : (
              paginatedWarga.map((warga) => (
                <PatientCard
                  key={warga.id}
                  data={warga}
                  kategori={kategori}
                  onView={handleView}
                  isReadOnly={isReadOnly}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 pt-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  <PaginationItem>
                    <span className="text-sm font-medium mx-4">
                      Halaman {page} dari {totalPages}
                    </span>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      <AddPatientDialog
        key={kategori}
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        defaultCategory={kategori}
        onSuccess={() => setPage(1)}
      />

      <ImportHealthRecordModal
        key={`import-${kategori}`}
        open={isImportHealthOpen}
        onOpenChange={setIsImportHealthOpen}
        kategori={kategori}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
