import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Activity,
  BarChart2
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, subDays } from 'date-fns'
import { id } from 'date-fns/locale'

const COLORS = {
  balita: '#0ea5e9', // Sky blue
  bumil: '#f43f5e',  // Rose
  lansia: '#10b981', // Emerald
  baduta: '#8b5cf6', // Violet
  other: '#94a3b8'
}

const IndicatorCard = ({ title, colorClass, items }: { title: string, colorClass: string, items: { label: string, value: number, warning?: boolean, danger?: boolean }[] }) => (
  <div className={`bg-white rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden border-l-4 ${colorClass} flex flex-col h-full`}>
    <div className="px-3 py-3 border-b border-slate-50 bg-slate-50/30 shrink-0">
      <h4 className="font-bold text-slate-800 text-sm leading-tight">{title}</h4>
    </div>
    <div className="flex divide-x divide-slate-50 p-1 grow">
      {items.map((item, idx) => (
        <div key={idx} className="flex-1 px-1 py-2 flex flex-col items-center justify-start text-center">
          <span className={`text-xl sm:text-2xl font-black mb-1 leading-none ${item.danger ? 'text-rose-600' : item.warning ? 'text-amber-500' : 'text-emerald-600'}`}>
            {item.value}
          </span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-tight break-words">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
)

export function AdminReportPage() {
  const [selectedPosyanduId, setSelectedPosyanduId] = useState<string>('ALL')
  const [ristiFilter, setRistiFilter] = useState<string>('Semua') // Semua, Balita, Bumil, Lansia
  const [dateFilterType, setDateFilterType] = useState<string>('3 Bulan')
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 90), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))

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
  const { data: ristiCases, isLoading: isRistiLoading } = useQuery({
    queryKey: ['admin', 'risti', selectedPosyanduId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (selectedPosyanduId !== 'ALL') params.append('posyanduId', selectedPosyanduId)

      const response = await api.get(`/admin/risti?${params.toString()}`)
      return response.data.data
    }
  })

  // 3. Fetch Indikator Medis Utama (Filtered)
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

  if (isPosyanduLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    )
  }

  const filteredRisti = ristiCases ? ristiCases.filter((c: any) => {
    if (ristiFilter === 'Semua') return true
    if (ristiFilter === 'Anak') return c.kategori === 'Balita' || c.kategori === 'Baduta'
    if (ristiFilter === 'Ibu Hamil') return c.kategori === 'Ibu Hamil'
    if (ristiFilter === 'Lansia') return c.kategori === 'Lansia'
    return true
  }) : []

  const totalRisti = ristiCases?.length || 0
  const ristiAnak = ristiCases?.filter((c: any) => c.kategori === 'Balita' || c.kategori === 'Baduta').length || 0
  const ristiBumil = ristiCases?.filter((c: any) => c.kategori === 'Ibu Hamil').length || 0
  const ristiLansia = ristiCases?.filter((c: any) => c.kategori === 'Lansia').length || 0

  const selectedPosyanduName = selectedPosyanduId === 'ALL' 
    ? 'Semua Posyandu' 
    : posyandus?.find((p: any) => p.id === selectedPosyanduId)?.nama || 'Pilih Posyandu'

  return (
    <div className="flex flex-col max-w-full pb-10 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
            <BarChart2 className="w-6 h-6 text-primary" />
            Rekapitulasi Bulanan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Indikator kesehatan dan peringatan dini warga desa
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
          <div className="pl-2 flex items-center text-slate-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-xs font-medium uppercase tracking-wider">Fokus Area</span>
          </div>
          <Select value={selectedPosyanduId} onValueChange={setSelectedPosyanduId}>
            <SelectTrigger className="w-[200px] border-none shadow-none focus:ring-0 bg-slate-50 font-semibold text-slate-700 h-9">
              <SelectValue placeholder="Pilih Posyandu">
                {selectedPosyanduName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="font-semibold text-primary">Semua Posyandu</SelectItem>
              {posyandus?.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Peringatan Dini Pasien Risiko Tinggi
            </h3>
            <p className="text-xs text-slate-400 font-medium">Data pasien yang membutuhkan penanganan medis ekstra</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Tabs */}
            <div className="flex items-center bg-slate-100/50 p-1 rounded-lg">
              {['Semua', 'Anak', 'Ibu Hamil', 'Lansia'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setRistiFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${ristiFilter === tab
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Date Filter */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <Select value={dateFilterType} onValueChange={handleDateFilterChange}>
                <SelectTrigger className="w-[140px] border-none shadow-none focus:ring-0 bg-slate-50 font-semibold text-slate-700 h-9 rounded-lg">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="Pilih Rentang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bulan Ini">Bulan Ini</SelectItem>
                  <SelectItem value="3 Bulan">3 Bulan Terakhir</SelectItem>
                  <SelectItem value="Tahun Ini">Tahun Ini</SelectItem>
                  <SelectItem value="Semua Waktu">Semua Waktu (All-Time)</SelectItem>
                  <SelectItem value="Custom">Rentang Manual</SelectItem>
                </SelectContent>
              </Select>
              
              {dateFilterType === 'Custom' && (
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs font-medium border-none focus:ring-0 p-0 text-slate-600 w-[95px] bg-transparent"
                  />
                  <span className="text-slate-300">-</span>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs font-medium border-none focus:ring-0 p-0 text-slate-600 w-[95px] bg-transparent"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Indikator Kesehatan Utama (Sesuai Filter Tanggal) */}
        {isIndikatorLoading ? (
          <div className="p-6 border-b border-slate-100 flex gap-4">
            <div className="w-full h-[100px] animate-pulse bg-slate-50 rounded-xl" />
          </div>
        ) : indikatorData && (
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <div className="flex items-start flex-col justify-center gap-0.5 mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-800">Distribusi Status Medis Keseluruhan Pasien (Sesuai Filter Tanggal)</h3>
              </div>
            </div>
            
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Anak Group */}
              <div className="flex-[2] flex flex-col">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200">Kategori Anak</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <IndicatorCard 
                    title="Status Stunting" 
                    colorClass="border-l-sky-500" 
                    items={[
                      { label: 'Normal', value: indikatorData.balita_stunting.normal },
                      { label: 'Pendek', value: indikatorData.balita_stunting.pendek, warning: true },
                      { label: 'Sangat Pendek', value: indikatorData.balita_stunting.sangat_pendek, danger: true },
                    ]} 
                  />
                  <IndicatorCard 
                    title="Status Gizi" 
                    colorClass="border-l-indigo-500" 
                    items={[
                      { label: 'Normal', value: indikatorData.balita_gizi.normal },
                      { label: 'Kurang', value: indikatorData.balita_gizi.kurang, warning: true },
                      { label: 'Buruk', value: indikatorData.balita_gizi.buruk, danger: true },
                      { label: 'Berlebih', value: indikatorData.balita_gizi.berlebih, warning: true },
                    ]} 
                  />
                </div>
              </div>

              {/* Bumil Group */}
              <div className="flex-[2] flex flex-col">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200">Kategori Ibu Hamil</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <IndicatorCard 
                    title="Kadar Hemoglobin" 
                    colorClass="border-l-fuchsia-500" 
                    items={[
                      { label: 'Normal', value: indikatorData.bumil_hb.normal },
                      { label: 'Anemia Ringan', value: indikatorData.bumil_hb.anemia_ringan, warning: true },
                      { label: 'Anemia Berat', value: indikatorData.bumil_hb.anemia_berat, danger: true },
                    ]} 
                  />
                  <IndicatorCard 
                    title="Risiko KEK (LILA)" 
                    colorClass="border-l-rose-500" 
                    items={[
                      { label: 'Normal', value: indikatorData.bumil_lila.normal },
                      { label: 'Kekurangan Energi', value: indikatorData.bumil_lila.kek, danger: true },
                    ]} 
                  />
                </div>
              </div>

              {/* Lansia Group */}
              <div className="flex-[1] flex flex-col">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200">Kategori Lansia</h4>
                <div className="grid grid-cols-1 gap-4 flex-1">
                  <IndicatorCard 
                    title="Tekanan Darah" 
                    colorClass="border-l-emerald-500" 
                    items={[
                      { label: 'Normal', value: indikatorData.lansia_tensi.normal },
                      { label: 'Pre-Hipertensi', value: indikatorData.lansia_tensi.waspada, warning: true },
                      { label: 'Hipertensi', value: indikatorData.lansia_tensi.tinggi, danger: true },
                    ]} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risti Summary Cards */}
        {!isRistiLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pb-6 border-b border-slate-100 pt-6">
            <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-100">
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Total Kasus</div>
              <div className="text-3xl font-bold text-rose-700">{totalRisti}</div>
            </div>
            <div className="bg-sky-50/50 rounded-xl p-4 border border-sky-100">
              <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Anak</div>
              <div className="text-3xl font-bold text-sky-700">{ristiAnak}</div>
            </div>
            <div className="bg-fuchsia-50/50 rounded-xl p-4 border border-fuchsia-100">
              <div className="text-xs font-bold text-fuchsia-600 uppercase tracking-wider mb-1">Ibu Hamil</div>
              <div className="text-3xl font-bold text-fuchsia-700">{ristiBumil}</div>
            </div>
            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Lansia</div>
              <div className="text-3xl font-bold text-emerald-700">{ristiLansia}</div>
            </div>
          </div>
        )}

        <div className="p-0">
          {isRistiLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-medium text-slate-500">Menganalisis data risiko tinggi...</p>
            </div>
          ) : filteredRisti && filteredRisti.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nama Pasien</th>
                    <th className="px-6 py-4 font-semibold">Tanggal Periksa</th>
                    <th className="px-6 py-4 font-semibold">Kategori</th>
                    <th className="px-6 py-4 font-semibold">Indikasi Risiko</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRisti.map((kasus: any) => (
                    <tr key={kasus.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{kasus.nama}</div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {kasus.posyandu}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                        {format(new Date(kasus.tanggal_periksa), 'd MMM yyyy', { locale: id })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600">
                          {kasus.kategori}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          {kasus.risiko}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-3 py-1.5 bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-600 text-xs font-semibold rounded-md shadow-sm transition-all opacity-0 group-hover:opacity-100">
                          Tindak Lanjut
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Semua Pasien Terpantau Aman</h3>
              <p className="text-sm font-medium text-slate-500 max-w-md">
                Kerja bagus! Tidak ada satupun pasien dengan indikasi risiko tinggi yang tercatat pada rentang tanggal dan filter ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
