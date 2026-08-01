import { useDashboardStats } from '../hooks/useDashboardStats'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useAuthStore } from '@/stores/authStore'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Link } from 'react-router-dom'
import {
  Baby,
  HeartPulse,
  PersonStanding,
  Activity,
  FileBarChart,
  ClipboardList,
  CheckSquare,
} from 'lucide-react'
import { GlobalPatientSearch } from '../components/GlobalPatientSearch'

export function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboardStats()
  const user = useAuthStore((state) => state.user)
  const posyandu = useAuthStore((state) => state.posyandu)

  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Gagal memuat dashboard"
        message="Terjadi kesalahan saat mengambil data ringkasan."
        onRetry={() => refetch()}
      />
    )
  }

  const { kategori_breakdown, kunjungan_6_bulan, pendataan } = data

  const userName = typeof user?.nama === 'string' ? user.nama : 'Petugas'
  const isPendataanSelesai =
    pendataan &&
    Object.values(pendataan).every((status) => status === 'selesai')
  const navigationCards = [
    {
      label: 'Balita',
      subtitle: `${kategori_breakdown.balita} Terdaftar`,
      path: '/balita',
      icon: Baby,
      iconWrap: 'bg-blue-50 text-blue-600',
      hover: 'hover:border-blue-500',
    },
    {
      label: 'Baduta',
      subtitle: `${kategori_breakdown.baduta} Terdaftar`,
      path: '/baduta',
      icon: Baby,
      iconWrap: 'bg-sky-50 text-sky-600',
      hover: 'hover:border-sky-500',
    },
    {
      label: 'Ibu Hamil',
      subtitle: `${kategori_breakdown.ibu_hamil} Terdaftar`,
      path: '/bumil',
      icon: HeartPulse,
      iconWrap: 'bg-pink-50 text-pink-600',
      hover: 'hover:border-pink-500',
    },
    {
      label: 'Pasca Salin',
      subtitle: `${kategori_breakdown.pasca_persalinan} Terdaftar`,
      path: '/pasca-persalinan',
      icon: Activity,
      iconWrap: 'bg-rose-50 text-rose-600',
      hover: 'hover:border-rose-500',
    },
    {
      label: 'Lansia',
      subtitle: `${kategori_breakdown.lansia} Terdaftar`,
      path: '/lansia',
      icon: PersonStanding,
      iconWrap: 'bg-amber-50 text-amber-600',
      hover: 'hover:border-amber-500',
    },
    {
      label: 'Rekapitulasi Bulanan',
      subtitle: 'Lihat Ringkasan',
      path: '/laporan',
      icon: FileBarChart,
      iconWrap: 'bg-indigo-50 text-indigo-600',
      hover: 'hover:border-indigo-500',
    },
    {
      label: 'Status Pendataan',
      subtitle: 'Lihat Progress',
      path: '/status-pendataan',
      icon: ClipboardList,
      iconWrap: 'bg-emerald-50 text-emerald-600',
      hover: 'hover:border-emerald-500',
    },
    {
      label: 'Verifikasi Pendataan',
      subtitle: 'Kunci Data',
      path: '/verifikasi-pendataan',
      icon: CheckSquare,
      iconWrap: 'bg-lime-50 text-lime-700',
      hover: 'hover:border-primary',
    },
  ]

  return (
    <div className="flex flex-col max-w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-800 leading-tight">
            Selamat Datang, {userName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{currentDate}</p>
        </div>
        {!isPendataanSelesai ? (
          <Link
            to="/verifikasi-pendataan"
            className="bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30 rounded-xl px-6 py-4 flex items-center gap-3 transition-all duration-200"
          >
            <div className="bg-white/20 p-2 rounded-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white">
                Selesai Pendataan Bulan Ini
              </span>
              <span className="text-xs text-white/80">
                Kunci data & verifikasi riwayat
              </span>
            </div>
          </Link>
        ) : (
          <Link
            to="/verifikasi-pendataan"
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 rounded-xl px-6 py-4 flex items-center gap-3 transition-all duration-200"
          >
            <div className="bg-white/20 p-2 rounded-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">Pendataan Selesai</span>
              <span className="text-xs text-white/80">
                Lihat rekapitulasi terkunci
              </span>
            </div>
          </Link>
        )}
      </div>

      <GlobalPatientSearch />

      <h2 className="text-xl font-bold text-slate-800 mb-4">Navigasi Utama</h2>
      <div className="grid grid-cols-2 gap-3 mb-8 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {navigationCards.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`group min-h-[138px] bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col items-center justify-center text-center hover:shadow-md ${item.hover} transition-all duration-200 sm:p-5`}
          >
            <div
              className={`w-12 h-12 ${item.iconWrap} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}
            >
              <item.icon className="w-6 h-6" />
            </div>
            <span className="font-semibold text-slate-700 mb-1 leading-tight">
              {item.label}
            </span>
            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full leading-tight">
              {item.subtitle}
            </span>
          </Link>
        ))}
      </div>

      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6">
          <h3 className="text-sm font-bold text-slate-700 mb-6">
            Pemeriksaan 6 Bulan Terakhir
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={kunjungan_6_bulan}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={12}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  iconType="square"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                />
                <Bar
                  dataKey="ibu"
                  name="Ibu-ibu"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="lansia"
                  name="Lansia"
                  fill="var(--color-primary-light)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="anak"
                  name="Anak-anak"
                  fill="var(--color-accent)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
