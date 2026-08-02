import { useState, useEffect, lazy, Suspense, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats'
import { useNavigate } from 'react-router-dom'
import {
  useGetPendataanGlobalStatus,
  useGetAdminStatusPendataan,
} from '@/features/pendataan/hooks/usePendataanBulanan'

// Lazy load ExportActions to prevent loading heavy jsPDF & exceljs on page load
const ExportActions = lazy(() =>
  import('../components/ExportActions').then((m) => ({
    default: m.ExportActions,
  }))
)
import { MonthlyReportTable } from '../components/MonthlyReportTable'
import { useGetPemeriksaanList } from '@/features/pemeriksaan/hooks/usePemeriksaan'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useGetWargaList } from '@/features/warga/hooks/useWarga'
import { isBadutaByBirthDate, isBalitaByBirthDate } from '@/utils/age'
import {
  classifyTekananDarah
} from '@/utils/kesehatan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Filter, RotateCcw, Search } from 'lucide-react'
import { ReportFilterSidebar } from '../components/ReportFilterSidebar'
import { CategorySummaryCards } from '../components/CategorySummaryCards'

export function ReportPage() {
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const saved = localStorage.getItem('rekapitulasi_bulan')
    return saved ? parseInt(saved) : new Date().getMonth() + 1
  })
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const saved = localStorage.getItem('rekapitulasi_tahun')
    return saved ? parseInt(saved) : new Date().getFullYear()
  })

  useEffect(() => {
    localStorage.setItem('rekapitulasi_bulan', selectedMonth.toString())
    localStorage.setItem('rekapitulasi_tahun', selectedYear.toString())
  }, [selectedMonth, selectedYear])

  const [posyanduFilter, setPosyanduFilter] = useState<'my' | 'all'>(
    () =>
      (localStorage.getItem('rekapitulasi_posyandu') as 'my' | 'all') || 'my'
  )
  const [kategoriFilter, setKategoriFilter] = useState<string>(
    () => localStorage.getItem('rekapitulasi_kategori') || 'bumil'
  )
  const [subFilters, setSubFilters] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(
        `rekapitulasi_filters_${localStorage.getItem('rekapitulasi_kategori') || 'bumil'}`
      )
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [searchQuery, setSearchQuery] = useState(
    () => localStorage.getItem('rekapitulasi_search') || ''
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const posyanduIdParam = posyanduFilter === 'all' ? 'all' : undefined

  useEffect(() => {
    localStorage.setItem(
      `rekapitulasi_filters_${kategoriFilter}`,
      JSON.stringify(subFilters)
    )
  }, [subFilters, kategoriFilter])

  useEffect(() => {
    localStorage.setItem('rekapitulasi_posyandu', posyanduFilter)
  }, [posyanduFilter])

  useEffect(() => {
    localStorage.setItem('rekapitulasi_search', searchQuery)
  }, [searchQuery])

  // Reload subFilters when kategoriFilter changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        `rekapitulasi_filters_${kategoriFilter}`
      )
      setSubFilters(saved ? JSON.parse(saved) : {})
    } catch {
      setSubFilters({})
    }
  }, [kategoriFilter])

  // Fetch Dashboard Stats for numbers
  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useDashboardStats(posyanduIdParam)

  // Fetch Pendataan Status for completion state
  const { isLoading: isStatusLoading } = useGetPendataanGlobalStatus(
    selectedMonth,
    selectedYear
  )

  // Fetch all posyandus status if filter is 'all'
  const { data: allPosyanduData } = useGetAdminStatusPendataan(
    selectedYear,
    posyanduFilter === 'all'
  )

  // Fetch Pemeriksaan List for the selected category, month, and year (limit 1000 for full month stats)
  const { data: pemeriksaanData, isLoading: isPemeriksaanLoading } =
    useGetPemeriksaanList(kategoriFilter, {
      bulan: selectedMonth,
      tahun: selectedYear,
      limit: 1000,
      posyanduId: posyanduIdParam,
    })

  // Fetch Warga List to identify "Belum Diperiksa"
  const fetchWargaKategori = kategoriFilter === 'baduta' ? 'balita' : (kategoriFilter === 'pasca_persalinan' || kategoriFilter === 'pasca-persalinan' ? 'pasca_persalinan' : kategoriFilter)
  const { data: wargaDataList, isLoading: isWargaLoading } = useGetWargaList(
    {
      kategori: fetchWargaKategori,
      posyanduId: posyanduIdParam,
      limit: 10000,
    },
    { enabled: subFilters.status_periksa === 'belum' }
  )

  // Compute baduta vs balita filter dynamically
  let filteredPemeriksaanList = (() => {
    const list = pemeriksaanData?.data || []
    let baseList = list;

    if (subFilters.status_periksa === 'belum') {
      const wargaList = wargaDataList?.data || []
      const examinedWargaIds = new Set(list.map((p: any) => p.warga_id))
      const unexaminedWarga = wargaList.filter((w: any) => !examinedWargaIds.has(w.id))
      
      baseList = unexaminedWarga.map((w: any) => ({
        id: `fake-${w.id}`,
        warga_id: w.id,
        warga: w,
        is_belum_diperiksa: true,
      })) as any[]
    }

    if (kategoriFilter === 'baduta') {
      return baseList.filter((item: any) => {
        if (!item.warga?.tanggal_lahir) return false
        const tglKunjungan =
          item.tanggal_kunjungan || item.tanggal_pemeriksaan || new Date()
        return isBadutaByBirthDate(item.warga.tanggal_lahir, tglKunjungan)
      })
    } else if (kategoriFilter === 'balita') {
      return list.filter((item: any) => {
        if (!item.warga?.tanggal_lahir) return false
        const tglKunjungan =
          item.tanggal_kunjungan || item.tanggal_pemeriksaan || new Date()
        return isBalitaByBirthDate(item.warga.tanggal_lahir, tglKunjungan)
      })
    }
    return baseList
  })()

  // Apply Sub Filters and Search Query
  filteredPemeriksaanList = filteredPemeriksaanList.filter((item: any) => {
    let passed = true

      // Bumil
      if (kategoriFilter === 'bumil') {
        if (subFilters.trimester) {
          const mgg = item.usia_kehamilan_minggu || 0
          if (subFilters.trimester === '1' && mgg > 13) passed = false
          if (subFilters.trimester === '2' && (mgg <= 13 || mgg > 27))
            passed = false
          if (subFilters.trimester === '3' && mgg <= 27) passed = false
        }
        if (subFilters.anemia) {
          const hbRaw = item.kadar_hemoglobin ? Number(item.kadar_hemoglobin) : 0
          const hb = (hbRaw > 0) ? hbRaw : 999
          if (subFilters.anemia === 'normal' && hb < 11) passed = false
          if (subFilters.anemia === 'ringan' && (hb >= 11 || hb < 8))
            passed = false
          if (subFilters.anemia === 'berat' && hb >= 8) passed = false
        }
        if (subFilters.kek) {
          const lila = item.lingkar_lengan_atas
            ? Number(item.lingkar_lengan_atas)
            : 999
          if (subFilters.kek === 'kek' && lila >= 23.5) passed = false
          if (subFilters.kek === 'normal' && lila < 23.5) passed = false
        }
        if (subFilters.kie) {
          if (subFilters.kie === 'ya' && !item.kie) passed = false
          if (subFilters.kie === 'tidak' && item.kie) passed = false
        }

      }

      // Pasca / Lansia
      if (kategoriFilter.startsWith('pasca') || kategoriFilter === 'lansia') {

        if (subFilters.tensi) {
          const tensi = classifyTekananDarah(
            item.tekanan_darah_sistolik,
            item.tekanan_darah_diastolik
          ).toLowerCase()
          if (tensi !== subFilters.tensi) passed = false
        }
        if (subFilters.kie && kategoriFilter.startsWith('pasca')) {
          if (subFilters.kie === 'ya' && !item.kie) passed = false
          if (subFilters.kie === 'tidak' && item.kie) passed = false
        }
        if (kategoriFilter === 'lansia') {
          if (subFilters.gula_darah) {
            const val = item.gula_darah_sewaktu
              ? parseFloat(item.gula_darah_sewaktu)
              : null
            if (val !== null && !isNaN(val)) {
              const isTinggi = val >= 200
              if (subFilters.gula_darah === 'tinggi' && !isTinggi)
                passed = false
              if (subFilters.gula_darah === 'normal' && isTinggi) passed = false
            } else {
              passed = false
            }
          }
          if (subFilters.kolesterol) {
            const val = item.kolesterol ? parseFloat(item.kolesterol) : null
            if (val !== null && !isNaN(val)) {
              const isTinggi = val >= 200 // >= 200 means Batas Tinggi or Tinggi
              if (subFilters.kolesterol === 'tinggi' && !isTinggi)
                passed = false
              if (subFilters.kolesterol === 'normal' && isTinggi) passed = false
            } else {
              passed = false
            }
          }
          if (subFilters.asam_urat) {
            const val = item.asam_urat ? parseFloat(item.asam_urat) : null
            if (val !== null && !isNaN(val)) {
              const jk = item.warga?.jenis_kelamin || 'P'
              const maxNormal = jk === 'L' ? 7.0 : 6.0
              const isTinggi = val > maxNormal
              if (subFilters.asam_urat === 'tinggi' && !isTinggi) passed = false
              if (subFilters.asam_urat === 'normal' && isTinggi) passed = false
            } else {
              passed = false
            }
          }
        }
      }

      // Balita / Baduta
      if (kategoriFilter === 'balita' || kategoriFilter === 'baduta') {
        if (subFilters.gizi) {
          const g = item.status_gizi?.kategori_bb_tb?.toLowerCase() || ''
          if (subFilters.gizi === 'baik' && !g.includes('baik')) passed = false
          if (
            subFilters.gizi === 'kurang' &&
            !g.includes('kurang') &&
            !g.includes('buruk')
          )
            passed = false
          if (
            subFilters.gizi === 'lebih' &&
            !g.includes('lebih') &&
            !g.includes('overweight') &&
            !g.includes('obesitas')
          )
            passed = false
        }
        if (subFilters.tinggi) {
          const t = item.status_gizi?.kategori_tb_u?.toLowerCase() || ''
          if (subFilters.tinggi === 'normal' && !t.includes('normal'))
            passed = false
          if (subFilters.tinggi === 'pendek' && !t.includes('pendek'))
            passed = false
          if (subFilters.tinggi === 'tinggi' && !t.includes('tinggi'))
            passed = false
        }
        if (subFilters.berat) {
          const b = item.status_gizi?.kategori_bb_u?.toLowerCase() || ''
          if (subFilters.berat === 'normal' && !b.includes('normal'))
            passed = false
          if (subFilters.berat === 'kurang' && !b.includes('kurang'))
            passed = false
          if (
            subFilters.berat === 'lebih' &&
            !b.includes('lebih') &&
            !b.includes('risiko')
          )
            passed = false
        }
        if (subFilters.imunisasi) {
          const imunisasiList = item.warga?.riwayat_imunisasi || []
          const hasVaksin = imunisasiList.some(
            (i: any) =>
              i.jenis_vaksin?.toUpperCase() ===
              subFilters.imunisasi?.toUpperCase()
          )
          if (!hasVaksin) passed = false
        }
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        const nama = (item.warga?.nama || '').toLowerCase()
        const nik = (item.warga?.nik || '').toLowerCase()
        const hp = (item.warga?.nomor || '').toLowerCase()
        if (
          !nama.includes(query) &&
          !nik.includes(query) &&
          !hp.includes(query)
        ) {
          passed = false
        }
      }

      return passed
    })

  const activeFilterBadges = useMemo(() => {
    const badges: { label: string; value: string }[] = []
    if (searchQuery.trim() !== '') {
      badges.push({ label: 'Pencarian', value: searchQuery })
    }
    for (const [key, val] of Object.entries(subFilters)) {
      if (val) {
        badges.push({ label: key.replace(/_/g, ' ').toUpperCase(), value: val.toUpperCase() })
      }
    }
    return badges
  }, [searchQuery, subFilters])

  if (isDashboardLoading || isStatusLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Laporan Posyandu</h2>
        <SkeletonCard />
      </div>
    )
  }

  if (dashboardError) {
    return (
      <ErrorState
        title="Gagal memuat ringkasan laporan"
        message="Terjadi kesalahan saat memuat data laporan dari server."
        onRetry={() => window.location.reload()}
      />
    )
  }

  // Format statuses from dashboard object or global status API
  const statuses = []
  if (dashboard?.pendataan) {
    for (const [key, value] of Object.entries(dashboard.pendataan)) {
      statuses.push({ kategori: key, status: value as 'draft' | 'selesai' })
    }
  }

  return (
    <div className="max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Laporan & Rekapitulasi
          </h2>
          {/* <p className="mt-1 text-sm leading-snug text-muted-foreground">Menampilkan data pemeriksaan terbaru dan ekspor laporan berdasarkan filter aktif.</p> */}
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-md border bg-slate-100 p-1 sm:flex sm:items-center sm:space-x-2 sm:gap-0 sm:shrink-0">
          <button
            onClick={() => setPosyanduFilter('my')}
            className={`rounded-sm px-2 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
              posyanduFilter === 'my'
                ? 'bg-green-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Posyandu Saya
          </button>
          <button
            onClick={() => setPosyanduFilter('all')}
            className={`rounded-sm px-2 py-1.5 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
              posyanduFilter === 'all'
                ? 'bg-green-600 text-white shadow'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Posyandu
          </button>
        </div>
      </div>

      <CategorySummaryCards
        kategori={kategoriFilter}
        data={filteredPemeriksaanList}
      />

      <div className="rounded-xl border border-slate-200 bg-card p-3 shadow-sm sm:p-5 lg:p-6">
        {/* Top Controls Row */}
        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[auto_12rem_minmax(0,1fr)_auto] lg:gap-3">
          
          <div className="flex items-center gap-1.5 sm:col-span-2 lg:col-span-1">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 sm:h-10 lg:w-32"
            >
              {Array.from({ length: 12 }).map((_, i) => {
                const d = new Date(2026, i, 1);
                return <option key={i} value={i + 1}>{d.toLocaleString('id-ID', { month: 'long' })}</option>
              })}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="h-9 w-20 rounded-md border border-slate-300 bg-white px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 sm:h-10"
            >
              {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <select
            value={kategoriFilter}
            onChange={(e) => {
              const val = e.target.value
              setKategoriFilter(val)
              localStorage.setItem('rekapitulasi_kategori', val)
              try {
                const savedFilters = localStorage.getItem(
                  `rekapitulasi_filters_${val}`
                )
                setSubFilters(savedFilters ? JSON.parse(savedFilters) : {})
              } catch {
                setSubFilters({})
              }
            }}
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 sm:h-10"
          >
            <option value="bumil">Ibu Hamil</option>
            <option value="pasca_persalinan">Ibu Pasca Persalinan</option>
            <option value="baduta">Baduta</option>
            <option value="balita">Balita</option>
            <option value="lansia">Lansia</option>
          </select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari nama / NIK / No. HP"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full pl-9 text-sm sm:h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1 lg:flex">
            <Button
              variant="outline"
              className="h-9 px-2 text-xs text-green-700 border-green-200 hover:bg-green-50 sm:h-10 sm:px-4 sm:text-sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Filter className="mr-1.5 h-4 w-4 sm:mr-2" />
              Filter Data
            </Button>
            <Button
              variant="ghost"
              className="h-9 px-2 text-xs text-slate-600 hover:bg-slate-100 sm:h-10 sm:px-4 sm:text-sm"
              onClick={() => {
                setSubFilters({})
                setSearchQuery('')
              }}
            >
              <RotateCcw className="mr-1.5 h-4 w-4 sm:mr-2" />
              Reset Filter
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterBadges.length > 0 && (
          <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-emerald-900">
                Filter aktif
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeFilterBadges.map((filter) => (
                  <Badge
                    key={`${filter.label}-${filter.value}`}
                    variant="outline"
                    className="border-emerald-200 bg-white px-2 py-0.5 text-[11px] text-emerald-800"
                  >
                    {filter.label}: {filter.value}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Export Row */}
        <div className="mb-5 flex flex-col gap-3 border-y py-3 sm:py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 sm:text-base">
              Export & Cetak Laporan
            </h3>
            <p className="text-xs text-slate-500 sm:text-sm">
              Unduh atau cetak hasil sesuai filter aktif.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <Button
              variant="outline"
              className="w-full gap-1.5 text-xs sm:w-auto sm:gap-2 sm:text-sm"
              onClick={() =>
                navigate(
                  `/laporan/cetak?kategori=${kategoriFilter}&bulan=${selectedMonth}&tahun=${selectedYear}${posyanduFilter === 'all' ? '&posyanduId=all' : ''}`
                )
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-printer"
              >
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                <rect x="6" y="14" width="12" height="8" rx="1" />
              </svg>
              <span className="hidden sm:inline">Cetak Visum</span>
              <span className="sm:hidden">Visum</span>
            </Button>

            <Suspense
              fallback={
                <div className="h-8 w-full animate-pulse rounded-md bg-slate-100 sm:h-10 sm:w-32"></div>
              }
            >
              <ExportActions
                isLoading={isPemeriksaanLoading}
                kategoriFilter={kategoriFilter}
                posyanduIdParam={posyanduIdParam}
                bulan={selectedMonth}
                tahun={selectedYear}
              />
            </Suspense>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
            Hasil Data{' '}
            {kategoriFilter
              .replace('_', ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </h3>

          <MonthlyReportTable
            kategori={kategoriFilter}
            data={filteredPemeriksaanList}
            isLoading={isPemeriksaanLoading || isWargaLoading}
          />
        </div>
      </div>

      <ReportFilterSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        kategori={kategoriFilter}
        subFilters={subFilters}
        setSubFilters={setSubFilters}
      />

      {posyanduFilter === 'all' && allPosyanduData && (
        <div className="mt-4 rounded-lg border bg-card p-3 sm:mt-6 sm:p-5 lg:p-6">
          <h3 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
            Status Pendataan Posyandu (Bulan Ini)
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3">
            {allPosyanduData.map((posyandu) => {
              const currentMonthStatus =
                posyandu.status.find((s) => s.bulan === selectedMonth)?.status ||
                'draft'
              return (
                <div
                  key={posyandu.id}
                  className="flex items-center justify-between gap-2 rounded-md border bg-slate-50/50 p-3"
                >
                  <div className="min-w-0 truncate text-sm font-medium">
                    {posyandu.nama}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      currentMonthStatus === 'selesai'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {currentMonthStatus === 'selesai' ? 'Selesai' : 'Draft'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
