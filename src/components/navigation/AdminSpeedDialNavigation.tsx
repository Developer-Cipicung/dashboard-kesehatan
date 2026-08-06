import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  Baby,
  BarChart2,
  ClipboardList,
  Grid3X3,
  HeartPulse,
  Home,
  PersonStanding,
  X,
  MapPin,
  Users,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'

const quickMenuItems = [
  { name: 'Dashboard', icon: Home, path: '/admin', color: 'text-slate-700', bg: 'bg-slate-100' },
  { name: 'Balita', icon: Baby, path: '/admin/warga/balita', color: 'text-blue-700', bg: 'bg-blue-50' },
  { name: 'Baduta', icon: Baby, path: '/admin/warga/baduta', color: 'text-sky-700', bg: 'bg-sky-50' },
  { name: 'Ibu Hamil', icon: HeartPulse, path: '/admin/warga/bumil', color: 'text-pink-700', bg: 'bg-pink-50' },
  { name: 'Pasca Salin', icon: Activity, path: '/admin/warga/pasca-persalinan', color: 'text-rose-700', bg: 'bg-rose-50' },
  { name: 'Lansia', icon: PersonStanding, path: '/admin/warga/lansia', color: 'text-amber-700', bg: 'bg-amber-50' },
  { name: 'Laporan Lengkap', icon: FileText, path: '/admin/laporan-detail', color: 'text-violet-700', bg: 'bg-violet-50' },
  { name: 'Rekap Bulanan', icon: BarChart2, path: '/admin/laporan', color: 'text-indigo-700', bg: 'bg-indigo-50' },
  { name: 'Status Pendataan', icon: ClipboardList, path: '/admin/status-pendataan', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { name: 'Data Posyandu', icon: MapPin, path: '/admin/posyandu', color: 'text-purple-700', bg: 'bg-purple-50' },
  { name: 'Manajemen User', icon: Users, path: '/admin/users', color: 'text-teal-700', bg: 'bg-teal-50' },
]

export function AdminSpeedDialNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  if (location.pathname === '/login') return null

  const handleNavigate = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl shadow-slate-900/30 transition-all duration-200 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/20 md:hidden"
          aria-label="Buka Menu Cepat"
          aria-expanded={isOpen}
        >
          <Grid3X3 className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[90] md:hidden" role="dialog" aria-modal="true" aria-labelledby="quick-menu-title">
          <button
            type="button"
            aria-label="Tutup Menu Cepat"
            className="absolute inset-0 h-full w-full bg-slate-950/55 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 z-10 max-h-[88dvh] overflow-y-auto overflow-x-hidden rounded-t-[28px] bg-white px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4 shadow-2xl">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="quick-menu-title" className="text-lg font-bold text-slate-900">
                  Menu Cepat
                </h2>
                <p className="mt-1 text-sm text-slate-500">Pilih fitur yang ingin Anda akses</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 min-[390px]:grid-cols-4">
              {quickMenuItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      'flex min-h-[92px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-3 text-center transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md',
                      isActive && 'border-slate-300 bg-white shadow-sm'
                    )}
                  >
                    <span className={cn('mb-2 flex h-10 w-10 items-center justify-center rounded-xl', item.bg)}>
                      <item.icon className={cn('h-5 w-5', item.color)} />
                    </span>
                    <span className="text-[11px] font-semibold leading-tight text-slate-700">{item.name}</span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-4 h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  )
}
