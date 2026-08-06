import { useGetWargaById } from '@/features/warga/hooks/useWarga'
import { KMSChart } from '@/features/public/components/KMSChart'
import { BumilChart } from '@/features/public/components/BumilChart'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import {
  MapPin,
  Calendar,
  AlertTriangle,
  Activity,
  BarChart2,
  TrendingUp,
  Users,
  ShieldCheck,
  CheckCircle2,
  X,
  Search,
  Eye,
  PhoneCall,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  FileSpreadsheet,
  Heart,
  Baby
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, subDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

interface PatientRisti {
  id: string
  warga_id: string
  kategori: string
  nama: string
  posyandu: string
  tanggal_periksa: string
  risiko: string
}

export function TestDashboardPage() {
  const navigate = useNavigate()
  const [selectedPosyanduId, setSelectedPosyanduId] = useState<string>('ALL')
  const [tableCategoryFilter, setTableCategoryFilter] = useState<string>('Semua') // Semua, Anak, Ibu Hamil, Lansia
  const [dateFilterType, setDateFilterType] = useState<string>('3 Bulan')
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 90), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  // Drawer state for Quick Patient Inspection
  const [inspectPatient, setInspectPatient] = useState<PatientRisti | null>(null)
  const [isVerifyingOutlier, setIsVerifyingOutlier] = useState<boolean>(false)

  const handleDateFilterChange = (value: string) => {
    setDateFilterType(value)
    const today = new Date()
    
    if (value === 'Bulan Ini') {
      setStartDate(format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd'))
      setEndDate(format(new Date(today.getFullYear(), today.getMonth() + 1, 0), 'yyyy-MM-dd'))
    } else if (value === '3 Bulan') {
      setStartDate(format(subDays(today, 90), 'yyyy-MM-dd'))
      setEndDate(format(today, 'yyyy-MM-dd'))
    } else if (value === 'Tahun Ini') {
      setStartDate(format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'))
      setEndDate(format(new Date(today.getFullYear(), 11, 31), 'yyyy-MM-dd'))
    } else if (value === 'Semua Waktu') {
      setStartDate('2000-01-01')
      setEndDate(format(today, 'yyyy-MM-dd'))
    }
  }

  // 1. Fetch Posyandus
  const { data: posyandus, isLoading: isPosyanduLoading } = useQuery({
    queryKey: ['admin', 'posyandu'],
    queryFn: async () => {
      const response = await api.get('/posyandu')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

  // 2. Fetch Risti Cases
  const { data: ristiCases, isLoading: isRistiLoading, refetch: refetchRisti } = useQuery({
    queryKey: ['admin', 'risti', selectedPosyanduId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (selectedPosyanduId !== 'ALL') params.append('posyanduId', selectedPosyanduId)

      const response = await api.get(`/admin/risti?${params.toString()}`)
      return response.data.data as PatientRisti[]
    }
  })

  // 3. Fetch Indikator Medis Utama
  const { data: indikatorData, isLoading: isIndikatorLoading } = useQuery({
    queryKey: ['admin', 'indikator', selectedPosyanduId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (selectedPosyanduId !== 'ALL') params.append('posyanduId', selectedPosyanduId)

      const response = await api.get(`/admin/indikator-medis?${params.toString()}`)
      return response.data.data
    }
  })

  // 4. Fetch Dashboard Summary stats
  const { data: summaryStats } = useQuery({
    queryKey: ['dashboard', 'summary', selectedPosyanduId],
    queryFn: async () => {
      const url = selectedPosyanduId !== 'ALL' ? `/dashboard/summary?posyanduId=${selectedPosyanduId}` : '/dashboard/summary'
      const response = await api.get(url)
      return response.data.data
    }
  })

  // Calculate Anomaly / Extreme Entries (e.g. Z-Score > 5 or < -5)
  const anomalies = useMemo(() => {
    if (!ristiCases) return []
    return ristiCases.filter(item => {
      const matchZ = item.risiko.match(/\((-?\d+(\.\d+)?)\)/)
      if (matchZ) {
        const val = parseFloat(matchZ[1])
        return val > 4.5 || val < -4.5
      }
      return false
    })
  }, [ristiCases])

  // Filtered Risti Cases for Table
  const filteredRisti = useMemo(() => {
    if (!ristiCases) return []
    return ristiCases.filter((c) => {
      // Category filter
      let matchCat = true
      if (tableCategoryFilter === 'Anak') matchCat = c.kategori === 'Balita' || c.kategori === 'Baduta'
      if (tableCategoryFilter === 'Ibu Hamil') matchCat = c.kategori === 'Ibu Hamil'
      if (tableCategoryFilter === 'Lansia') matchCat = c.kategori === 'Lansia'

      // Search query
      let matchSearch = true
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase()
        matchSearch = c.nama.toLowerCase().includes(q) || c.posyandu.toLowerCase().includes(q) || c.risiko.toLowerCase().includes(q)
      }

      return matchCat && matchSearch
    })
  }, [ristiCases, tableCategoryFilter, searchQuery])

  const totalRisti = ristiCases?.length || 0
  const ristiAnak = ristiCases?.filter((c) => c.kategori === 'Balita' || c.kategori === 'Baduta').length || 0
  const ristiBumil = ristiCases?.filter((c) => c.kategori === 'Ibu Hamil').length || 0
  const ristiLansia = ristiCases?.filter((c) => c.kategori === 'Lansia').length || 0

  const selectedPosyanduName = selectedPosyanduId === 'ALL' 
    ? 'Seluruh Posyandu Desa' 
    : posyandus?.find((p: any) => p.id === selectedPosyanduId)?.nama || 'Pilih Posyandu'

  const handleVerifyOutlier = () => {
    setIsVerifyingOutlier(true)
    setTimeout(() => {
      setIsVerifyingOutlier(false)
      toast.success('Permintaan verifikasi ulang pengukuran telah dikirim ke Kader Posyandu!')
    }, 800)
  }

  if (isPosyanduLoading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <SkeletonCard />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 font-sans antialiased">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white pt-8 pb-16 px-4 sm:px-8 border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Preview UX Best-Practice Mode (Standalone Test)
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                Monitoring Executiv Kesehatan Desa
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Pantau statistik indikator medis, deteksi anomali data otomatis, dan tangani kasus pasien risiko tinggi secara cepat & tepat.
              </p>
            </div>

            {/* Controls: Focus Area & Date Picker */}
            <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-inner">
              <div className="flex items-center gap-2 pl-2 text-slate-300 text-xs font-medium">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Posyandu:</span>
              </div>
              <Select value={selectedPosyanduId} onValueChange={(val) => { if (val) setSelectedPosyanduId(val) }}>
                <SelectTrigger className="w-[180px] sm:w-[210px] bg-slate-900/80 border-slate-700 text-white font-semibold h-9 rounded-xl text-xs">
                  <SelectValue placeholder="Pilih Posyandu">{selectedPosyanduName}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-slate-800">
                  <SelectItem value="ALL" className="font-semibold text-emerald-400">Seluruh Posyandu Desa</SelectItem>
                  {posyandus?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateFilterType} onValueChange={(val) => { if (val) handleDateFilterChange(val) }}>
                <SelectTrigger className="w-[130px] sm:w-[150px] bg-slate-900/80 border-slate-700 text-white font-semibold h-9 rounded-xl text-xs">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-slate-800">
                  <SelectItem value="Bulan Ini">Bulan Ini</SelectItem>
                  <SelectItem value="3 Bulan">3 Bulan Terakhir</SelectItem>
                  <SelectItem value="Tahun Ini">Tahun Ini</SelectItem>
                  <SelectItem value="Semua Waktu">Semua Waktu</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => refetchRisti()}
                className="h-9 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Floating Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-10 space-y-8">

        {/* 1. EXECUTIVE KPI SUMMARY CARDS (Reading Flow Step 1) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Warga Didata</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800">{summaryStats?.totalWarga || 0}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Terdaftar
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Cakupan desa terjangkau aktif</p>
          </div>

          <div 
            onClick={() => setTableCategoryFilter('Semua')}
            className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all cursor-pointer group ${totalRisti > 0 ? 'ring-2 ring-rose-500/20' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Kasus Risiko Tinggi
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-600">{totalRisti}</span>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                Perlu Perhatian
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <span className="text-sky-600">Anak: {ristiAnak}</span> •
              <span className="text-fuchsia-600">Bumil: {ristiBumil}</span> •
              <span className="text-emerald-600">Lansia: {ristiLansia}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cakupan Posyandu</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-800">{posyandus?.length || 0}</span>
              <span className="text-xs font-semibold text-emerald-600">Posyandu Aktif</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Terverifikasi sistem kesehatan desa</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-5 text-white shadow-md shadow-indigo-500/10 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Executive Action
              </span>
              <p className="text-xs text-indigo-100 mt-1 font-medium leading-relaxed">
                Cetak laporan ringkas untuk rapat koordinasi desa atau puskesmas.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/admin/laporan')}
              className="mt-3 w-full bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs shadow-sm h-8 rounded-xl"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              Buka Rekap Lengkap
            </Button>
          </div>
        </div>

        {/* 2. SMART ANOMALY ALERT FEED (Highlight Input Berpotensi Salah) */}
        {anomalies.length > 0 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">Deteksi Otomatis Anomali Pengukuran ({anomalies.length} Kasus)</h4>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 rounded-full">Perlu Verifikasi</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Ditemukan nilai pengukuran z-score di luar batas wajar (misal Z &gt; ±4.5). Kemungkinan terdapat kesalahan penginputan angka BB/TB oleh Kader.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleVerifyOutlier}
              disabled={isVerifyingOutlier}
              className="border-amber-400/50 bg-white text-amber-900 hover:bg-amber-100 text-xs font-bold shrink-0 rounded-xl h-9 shadow-sm"
            >
              {isVerifyingOutlier ? 'Mengirim...' : 'Minta Kader Verifikasi Ulang'}
            </Button>
          </div>
        )}

        {/* 3. DISTRIBUSI STATUS MEDIS KESELURUHAN */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                Distribusi Indikator Medis Keseluruhan
              </h3>
              <p className="text-xs text-slate-400 font-medium">Gambaran status gizi, stunting, HB, KEK, & hipertensi warga desa</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
              Periode: {dateFilterType}
            </span>
          </div>

          {isIndikatorLoading ? (
            <div className="h-32 animate-pulse bg-slate-50 rounded-xl" />
          ) : indikatorData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Kategori Anak */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                  <Baby className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Kategori Anak</span>
                </div>
                
                {/* Stunting Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Stunting (TB/U)</span>
                    <span className="text-rose-600 font-bold">
                      {indikatorData.balita_stunting.pendek + indikatorData.balita_stunting.sangat_pendek} Terindikasi
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div style={{ width: `${(indikatorData.balita_stunting.normal / (indikatorData.balita_stunting.normal + indikatorData.balita_stunting.pendek + indikatorData.balita_stunting.sangat_pendek || 1)) * 100}%` }} className="bg-emerald-500" title="Normal" />
                    <div style={{ width: `${(indikatorData.balita_stunting.pendek / (indikatorData.balita_stunting.normal + indikatorData.balita_stunting.pendek + indikatorData.balita_stunting.sangat_pendek || 1)) * 100}%` }} className="bg-amber-400" title="Pendek" />
                    <div style={{ width: `${(indikatorData.balita_stunting.sangat_pendek / (indikatorData.balita_stunting.normal + indikatorData.balita_stunting.pendek + indikatorData.balita_stunting.sangat_pendek || 1)) * 100}%` }} className="bg-rose-600" title="Sangat Pendek" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-0.5">
                    <span className="text-emerald-700 font-semibold">Normal: {indikatorData.balita_stunting.normal}</span>
                    <span className="text-amber-700 font-semibold">Pendek: {indikatorData.balita_stunting.pendek}</span>
                    <span className="text-rose-700 font-bold">Sangat Pendek: {indikatorData.balita_stunting.sangat_pendek}</span>
                  </div>
                </div>

                {/* Gizi Progress */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Status Gizi (BB/TB)</span>
                    <span className="text-slate-700">Total: {indikatorData.balita_gizi.normal + indikatorData.balita_gizi.kurang + indikatorData.balita_gizi.buruk}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg">
                      <div className="text-xs font-bold">{indikatorData.balita_gizi.normal}</div>
                      <div className="text-[9px] font-semibold">Normal</div>
                    </div>
                    <div className="bg-amber-100 text-amber-800 p-1.5 rounded-lg">
                      <div className="text-xs font-bold">{indikatorData.balita_gizi.kurang}</div>
                      <div className="text-[9px] font-semibold">Kurang</div>
                    </div>
                    <div className="bg-rose-100 text-rose-800 p-1.5 rounded-lg">
                      <div className="text-xs font-bold">{indikatorData.balita_gizi.buruk}</div>
                      <div className="text-[9px] font-semibold">Buruk</div>
                    </div>
                    <div className="bg-indigo-100 text-indigo-800 p-1.5 rounded-lg">
                      <div className="text-xs font-bold">{indikatorData.balita_gizi.berlebih}</div>
                      <div className="text-[9px] font-semibold">Berlebih</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kategori Ibu Hamil */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                  <Heart className="w-4 h-4 text-fuchsia-600" />
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Kategori Ibu Hamil</span>
                </div>
                
                {/* Hemoglobin */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Kadar Hemoglobin (Hb)</span>
                    <span className="text-fuchsia-600 font-bold">
                      {indikatorData.bumil_hb.anemia_ringan + indikatorData.bumil_hb.anemia_berat} Anemia
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="bg-emerald-100 text-emerald-800 p-2 rounded-lg">
                      <div className="text-sm font-black">{indikatorData.bumil_hb.normal}</div>
                      <div className="text-[9px] font-bold uppercase">Normal</div>
                    </div>
                    <div className="bg-amber-100 text-amber-800 p-2 rounded-lg">
                      <div className="text-sm font-black">{indikatorData.bumil_hb.anemia_ringan}</div>
                      <div className="text-[9px] font-bold uppercase">Ringan</div>
                    </div>
                    <div className="bg-rose-100 text-rose-800 p-2 rounded-lg">
                      <div className="text-sm font-black">{indikatorData.bumil_hb.anemia_berat}</div>
                      <div className="text-[9px] font-bold uppercase">Berat</div>
                    </div>
                  </div>
                </div>

                {/* KEK LILA */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Risiko KEK (LILA &lt; 23.5 cm)</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                    <span className="font-medium text-slate-600">Kurang Energi Kronis</span>
                    <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-sm">
                      {indikatorData.bumil_lila.kek} Bumil
                    </span>
                  </div>
                </div>
              </div>

              {/* Kategori Lansia */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Kategori Lansia</span>
                </div>
                
                {/* Tensi */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Tekanan Darah (Tensi)</span>
                    <span className="text-emerald-700 font-bold">
                      {indikatorData.lansia_tensi.tinggi} Hipertensi
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="bg-emerald-100 text-emerald-800 p-2 rounded-lg">
                      <div className="text-sm font-black">{indikatorData.lansia_tensi.normal}</div>
                      <div className="text-[9px] font-bold uppercase">Normal</div>
                    </div>
                    <div className="bg-amber-100 text-amber-800 p-2 rounded-lg">
                      <div className="text-sm font-black">{indikatorData.lansia_tensi.waspada}</div>
                      <div className="text-[9px] font-bold uppercase">Waspada</div>
                    </div>
                    <div className="bg-rose-100 text-rose-800 p-2 rounded-lg">
                      <div className="text-sm font-black">{indikatorData.lansia_tensi.tinggi}</div>
                      <div className="text-[9px] font-bold uppercase">Tinggi</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* 4. HIGH-RISK PRIORITY QUEUE TABLE WITH INLINE CATEGORY TABS (Reading Flow Step 2) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          
          {/* Header Table & Inline Category Tabs */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Antrean Pasien Risiko Tinggi (Priority Action Queue)
              </h3>
              <p className="text-xs text-slate-500 font-medium">Klik nama pasien untuk melihat detail rekam medis tanpa keluar halaman</p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
              {/* Category Filter Tabs (Scrollable on mobile) */}
              <div className="flex items-center bg-slate-200/60 p-1 rounded-xl w-full sm:w-auto overflow-x-auto custom-scrollbar">
                {['Semua', 'Anak', 'Ibu Hamil', 'Lansia'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTableCategoryFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all shrink-0 ${
                      tableCategoryFilter === tab
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-auto">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari pasien..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs w-full sm:w-[200px] rounded-xl bg-white border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Table Data (Desktop View) & Mobile Cards (Mobile View) */}
          {isRistiLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Memuat data pasien risti...</div>
          ) : filteredRisti && filteredRisti.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200/70">
                    <tr>
                      <th className="px-6 py-4">Nama Pasien</th>
                      <th className="px-6 py-4">Tanggal Periksa</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Indikasi Risiko Spesifik</th>
                      <th className="px-6 py-4 text-center">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRisti.map((kasus) => (
                      <tr 
                        key={kasus.id}
                        className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                        onClick={() => setInspectPatient(kasus)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                            {kasus.nama}
                            <Eye className="w-3.5 h-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" /> {kasus.posyandu}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-semibold text-xs">
                          {format(new Date(kasus.tanggal_periksa), 'd MMM yyyy', { locale: idLocale })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide border ${
                            kasus.kategori === 'Ibu Hamil' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' :
                            kasus.kategori === 'Lansia' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-sky-50 text-sky-700 border-sky-200'
                          }`}>
                            {kasus.kategori}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {kasus.risiko ? kasus.risiko.split(', ').map((item, idx) => {
                              const isExtreme = item.includes('8.') || item.includes('-4.') || item.includes('-3.7')
                              return (
                                <span 
                                  key={idx} 
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                                    isExtreme ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-rose-50 text-rose-700 border-rose-200'
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isExtreme ? 'bg-amber-600' : 'bg-rose-500'}`}></span>
                                  {item}
                                  {isExtreme && (
                                    <span className="text-[9px] bg-amber-200 px-1 rounded ml-1" title="Potensi salah input">Cek</span>
                                  )}
                                </span>
                              )
                            }) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setInspectPatient(kasus)}
                            className="h-8 px-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl"
                          >
                            Lihat Quick-View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards Stream View (< md) */}
              <div className="block md:hidden divide-y divide-slate-100">
                {filteredRisti.map((kasus) => (
                  <div 
                    key={kasus.id} 
                    className="p-4 space-y-3 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setInspectPatient(kasus)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          {kasus.nama}
                          <Eye className="w-3.5 h-3.5 text-indigo-500" />
                        </h4>
                        <div className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {kasus.posyandu}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border shrink-0 ${
                        kasus.kategori === 'Ibu Hamil' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' :
                        kasus.kategori === 'Lansia' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {kasus.kategori}
                      </span>
                    </div>

                    {/* Risk Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {kasus.risiko ? kasus.risiko.split(', ').map((item, idx) => {
                        const isExtreme = item.includes('8.') || item.includes('-4.') || item.includes('-3.7')
                        return (
                          <span 
                            key={idx} 
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${
                              isExtreme ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isExtreme ? 'bg-amber-600' : 'bg-rose-500'}`}></span>
                            {item}
                          </span>
                        )
                      }) : '-'}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        {format(new Date(kasus.tanggal_periksa), 'd MMM yyyy', { locale: idLocale })}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          setInspectPatient(kasus)
                        }}
                      >
                        Detail Quick-View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Tidak Ada Pasien Risiko Tinggi</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Semua data pasien pada filter {tableCategoryFilter} terpantau dalam kondisi normal.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* SLIDE-OVER DRAWER (QUICK PATIENT INSPECTOR WITH LIVE CHARTS) */}
      {inspectPatient && (
        <PatientQuickInspector
          inspectPatient={inspectPatient}
          selectedPosyanduId={selectedPosyanduId}
          onClose={() => setInspectPatient(null)}
          onNavigate={() => {
            const pathCat = inspectPatient.kategori === 'Ibu Hamil' ? 'bumil' : inspectPatient.kategori.toLowerCase().replace(' ', '-')
            setInspectPatient(null)
            navigate(`/admin/warga/${pathCat}/${inspectPatient.warga_id}`)
          }}
        />
      )}
    </div>
  )
}

function getUsiaDetailed(tanggalLahirStr?: string) {
  if (!tanggalLahirStr) return '-'
  const birth = new Date(tanggalLahirStr)
  if (isNaN(birth.getTime())) return '-'
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  if (years === 0) return `${months} Bulan`
  return `${years} Thn ${months} Bln`
}

function PatientQuickInspector({ inspectPatient, selectedPosyanduId, onClose, onNavigate }: {
  inspectPatient: PatientRisti
  selectedPosyanduId: string
  onClose: () => void
  onNavigate: () => void
}) {
  const activePosyanduId = selectedPosyanduId !== 'ALL' ? selectedPosyanduId : undefined
  const { data: warga, isLoading } = useGetWargaById(inspectPatient.warga_id, activePosyanduId)

  // Lansia Tensi History Chart Data
  const lansiaChartData = useMemo(() => {
    if (!warga?.pemeriksaan_lansia) return []
    return [...warga.pemeriksaan_lansia]
      .sort((a: any, b: any) => new Date(a.tanggal_pemeriksaan).getTime() - new Date(b.tanggal_pemeriksaan).getTime())
      .map((p: any) => ({
        date: format(new Date(p.tanggal_pemeriksaan), 'd MMM yyyy', { locale: idLocale }),
        sistolik: p.tensi_sistolik ? Number(p.tensi_sistolik) : null,
        diastolik: p.tensi_diastolik ? Number(p.tensi_diastolik) : null,
        bb: p.bb ? Number(p.bb) : null,
      }))
  }, [warga])

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full sm:w-[500px] md:w-[600px] bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-y-auto">
        {/* Drawer Header (Clean Light Theme) */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Eye className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Quick-View Rekam Medis</h3>
              <p className="text-[11px] text-slate-400 font-medium">Desa Cipicung Inspection Drawer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Risk Alert */}
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 space-y-1">
            <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Indikasi Risiko Terdeteksi
            </div>
            <div className="text-sm font-extrabold text-slate-800">
              {inspectPatient.risiko}
            </div>
            <p className="text-[11px] text-slate-500 pt-0.5">
              Pemeriksaan Terakhir: {format(new Date(inspectPatient.tanggal_periksa), 'd MMMM yyyy', { locale: idLocale })}
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Memuat data rekam medis & grafik...</div>
          ) : warga ? (
            <>
              {/* Patient Complete Identity Card */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
                {/* Patient Name & Category Badges Header */}
                <div className="border-b border-slate-200/80 pb-3 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{inspectPatient.nama}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase ${
                        inspectPatient.kategori === 'Ibu Hamil' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' :
                        inspectPatient.kategori === 'Lansia' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        'bg-sky-50 text-sky-700 border-sky-200'
                      }`}>
                        {inspectPatient.kategori}
                      </span>
                      {warga.memiliki_bpjs !== undefined && (
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                          warga.memiliki_bpjs ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {warga.memiliki_bpjs ? '✓ BPJS Aktif' : 'Non BPJS'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {inspectPatient.posyandu}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">NIK</span>
                    <span className="font-bold text-slate-900 font-mono tracking-tight">{warga.nik || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">No. KK</span>
                    <span className="font-bold text-slate-900 font-mono tracking-tight">{warga.no_kk || '-'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Tempat, Tgl Lahir</span>
                    <span className="font-bold text-slate-800">
                      {warga.tempat_lahir ? `${warga.tempat_lahir}, ` : ''}
                      {warga.tanggal_lahir ? format(new Date(warga.tanggal_lahir), 'd MMM yyyy', { locale: idLocale }) : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Usia Saat Ini</span>
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                      {getUsiaDetailed(warga.tanggal_lahir)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Jenis Kelamin</span>
                    <span className="font-bold text-slate-800">
                      {warga.jenis_kelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Golongan Darah</span>
                    <span className="font-bold text-slate-800">{warga.golongan_darah || 'Belum didata'}</span>
                  </div>

                  {(warga.nama_ibu || warga.nama_ayah) && (
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Nama Orang Tua</span>
                      <span className="font-bold text-slate-800">
                        {warga.nama_ibu ? `Ibu: ${warga.nama_ibu}` : `Ayah: ${warga.nama_ayah}`}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">No. HP / WhatsApp</span>
                    <span className="font-bold text-slate-800">{warga.nomor || '-'}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Alamat Lengkap</span>
                    <span className="font-bold text-slate-800 block leading-snug">
                      {warga.rt ? `RT ${warga.rt} / RW ${warga.rw || '-'}, ` : ''}
                      {warga.alamat || '-'}
                      {inspectPatient.posyandu ? ` (${inspectPatient.posyandu})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Growth / Health Chart */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Grafik Perkembangan Kesehatan Pasien</h4>
                
                {(inspectPatient.kategori === 'Balita' || inspectPatient.kategori === 'Baduta') && (
                  <KMSChart warga={warga} />
                )}

                {inspectPatient.kategori === 'Ibu Hamil' && (
                  <BumilChart warga={warga} />
                )}

                {inspectPatient.kategori === 'Lansia' && (
                  lansiaChartData.length > 0 ? (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                      <div className="text-center">
                        <h5 className="text-xs font-bold text-slate-800">Grafik Tekanan Darah (Tensi Lansia)</h5>
                        <p className="text-[10px] text-slate-400">Tekanan Sistolik & Diastolik seiring waktu (mmHg)</p>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={lansiaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <YAxis domain={[50, 200]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <Tooltip />
                            <Line type="monotone" dataKey="sistolik" stroke="#ef4444" strokeWidth={2.5} name="Sistolik" dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="diastolik" stroke="#3b82f6" strokeWidth={2.5} name="Diastolik" dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                      Riwayat grafik tensi lansia belum tersedia.
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">Detail rekam medis tidak dapat ditemukan.</div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 sticky bottom-0">
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 rounded-xl shadow-sm"
            onClick={onNavigate}
          >
            <ArrowUpRight className="w-4 h-4 mr-1.5" />
            Buka Halaman Profil Pasien Lengkap
          </Button>
          <Button
            variant="outline"
            className="w-full border-slate-300 text-slate-700 text-xs font-semibold h-9 rounded-xl"
            onClick={() => {
              toast.success(`Kontak Kader Posyandu ${inspectPatient.posyandu} telah disalin!`)
            }}
          >
            <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            Hubungi Kader Posyandu
          </Button>
        </div>
      </div>
    </div>
  )
}
