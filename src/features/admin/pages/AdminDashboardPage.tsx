import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { Link } from 'react-router-dom'
import {
  Users,
  MapPin,
  ClipboardList,
  AlertCircle,
  Calendar,
  TrendingUp,
  Activity,
  Baby,
  Heart,
  BarChart2
} from 'lucide-react'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, subDays } from 'date-fns'

const COLORS = {
  balita: '#0ea5e9', // Sky blue
  bumil: '#f43f5e',  // Rose
  lansia: '#10b981', // Emerald
  baduta: '#8b5cf6', // Violet
  other: '#94a3b8'
}


export function AdminDashboardPage() {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1 // 1-12

  const [selectedPosyanduId, setSelectedPosyanduId] = useState<string>('ALL')
  const [dateFilterType, setDateFilterType] = useState<string>('Bulan Ini')
  const [startDate, setStartDate] = useState<string>(format(new Date(currentYear, currentMonth - 1, 1), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(new Date(currentYear, currentMonth, 0), 'yyyy-MM-dd'))

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

  // 2. Fetch Users
  const { data: users, isLoading: isUserLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

  // 3. Fetch Pendataan Status
  const { data: pendataanStatus } = useQuery({
    queryKey: ['pendataan', 'admin', 'status', currentYear],
    queryFn: async () => {
      const response = await api.get('/pendataan-bulanan/admin/status', {
        params: { tahun: currentYear }
      })
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

  // 4. Fetch Dashboard Stats
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['dashboard', selectedPosyanduId],
    queryFn: async () => {
      const url = `/dashboard?posyanduId=${selectedPosyanduId.toLowerCase()}`
      const response = await api.get(url)
      return response.data.data
    }
  })

  // 5. Fetch Indikator Medis Utama (Filtered)
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

  if (isPosyanduLoading || isUserLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    )
  }

  // Calculate Metrics
  const totalPosyandu = posyandus?.length || 0
  const submittedThisMonth = Array.isArray(pendataanStatus) ? pendataanStatus.filter((p: any) => 
    p.status?.some((s: any) => s.bulan === currentMonth && s.status === 'selesai')
  ).length : 0
  const pendingThisMonth = totalPosyandu - submittedThisMonth

  const totalWarga = dashboardData?.total_warga || 0
  const br = dashboardData?.kategori_breakdown || {}

  const pieData = [
    { name: 'Balita & Baduta', value: (br.balita || 0) + (br.baduta || 0), color: COLORS.balita },
    { name: 'Ibu Hamil', value: (br.ibu_hamil || 0) + (br.pasca_persalinan || 0), color: COLORS.bumil },
    { name: 'Lansia', value: br.lansia || 0, color: COLORS.lansia },
  ].filter(d => d.value > 0)

  const selectedPosyanduName = selectedPosyanduId === 'ALL' 
    ? 'Semua Posyandu' 
    : posyandus?.find((p: any) => p.id === selectedPosyanduId)?.nama || 'Pilih Posyandu'

  return (
    <div className="flex flex-col max-w-full pb-10 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
            <Activity className="w-6 h-6 text-primary" />
            Dashboard Monitoring
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantauan Kesehatan Real-time Desa Cipicung
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
          <div className="pl-2 flex items-center text-slate-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-xs font-medium uppercase tracking-wider">Fokus Area</span>
          </div>
          <Select value={selectedPosyanduId} onValueChange={(val) => setSelectedPosyanduId(val as string)}>
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

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Warga */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-sky-50 rounded-lg text-sky-500"><Users className="w-5 h-5" /></div>
            <span className="font-semibold text-slate-700">Total Warga Terdata</span>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-slate-800">{totalWarga}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +{dashboardData?.warga_baru_bulan_ini || 24} warga bulan ini
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-4">
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Balita</div>
              <div className="font-semibold text-slate-700">{(br.balita || 0) + (br.baduta || 0)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Bumil</div>
              <div className="font-semibold text-slate-700">{br.ibu_hamil || 0}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Lansia</div>
              <div className="font-semibold text-slate-700">{br.lansia || 0}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Laporan Posyandu */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-500"><ClipboardList className="w-5 h-5" /></div>
            <span className="font-semibold text-slate-700">Kepatuhan Laporan</span>
          </div>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-bold text-slate-800">{submittedThisMonth}</span>
            <span className="text-slate-400 font-medium">/ {totalPosyandu} Posyandu</span>
          </div>
          <div className="flex gap-4 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-sm font-medium text-slate-600">{submittedThisMonth} Sudah Lapor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-sm font-medium text-slate-600">{pendingThisMonth} Belum Lapor</span>
            </div>
          </div>
        </div>

        {/* Card 3: Akun Aktif */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-violet-50 rounded-lg text-violet-500"><AlertCircle className="w-5 h-5" /></div>
            <span className="font-semibold text-slate-700">Sistem & Akses</span>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-slate-800">{users?.length || 0}</span>
            <span className="text-slate-500 text-sm font-medium">Pengguna Aktif</span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-4">
            <Link to="/admin/status-pendataan" className="text-sm font-medium text-primary hover:underline">
              Buka Status Pendataan →
            </Link>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center relative">
          <h3 className="w-full text-lg font-bold text-slate-800 mb-2">Proporsi Kategori Warga</h3>
          <p className="w-full text-xs text-slate-400 font-medium mb-6">Distribusi berdasarkan kelompok umur/kondisi</p>

          <div className="w-full h-[220px] flex items-center justify-center relative">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 text-sm">Tidak ada data warga</div>
            )}

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-medium text-slate-400 mb-1">Total</span>
              <span className="text-2xl font-bold text-slate-800">{totalWarga}</span>
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
            {pieData.map((d, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">{d.name.split(' ')[0]}</span>
                </div>
                <span className="font-semibold text-slate-800">{Math.round((d.value / totalWarga) * 100) || 0}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Area Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Tren Kunjungan Bulanan</h3>
              <p className="text-xs text-slate-400 font-medium">Data partisipasi posyandu 6 bulan terakhir</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.balita }}></span> Balita</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.bumil }}></span> Ibu Hamil</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.lansia }}></span> Lansia</div>
            </div>
          </div>

          <div className="w-full h-[250px]">
            {isDashboardLoading ? (
              <div className="w-full h-full animate-pulse bg-slate-50 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dashboardData?.kunjungan_6_bulan || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorBalita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.balita} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.balita} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBumil" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.bumil} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.bumil} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorLansia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.lansia} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.lansia} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="anak" name="Balita" stroke={COLORS.balita} strokeWidth={3} fillOpacity={1} fill="url(#colorBalita)" />
                  <Area type="monotone" dataKey="ibu" name="Ibu" stroke={COLORS.bumil} strokeWidth={3} fillOpacity={1} fill="url(#colorBumil)" />
                  <Area type="monotone" dataKey="lansia" name="Lansia" stroke={COLORS.lansia} strokeWidth={3} fillOpacity={1} fill="url(#colorLansia)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Indikator Medis Utama Section */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              Distribusi Indikator Medis Keseluruhan
            </h3>
            <p className="text-xs text-slate-400 font-medium">Gambaran status gizi, stunting, HB, KEK, & hipertensi warga desa</p>
          </div>
          
          {/* Date Filter */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <Select value={dateFilterType} onValueChange={(val) => handleDateFilterChange(val as string)}>
              <SelectTrigger className="w-[140px] border border-slate-200 focus:ring-0 bg-white font-semibold text-slate-700 h-9 rounded-lg">
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
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
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

    </div>
  )
}
