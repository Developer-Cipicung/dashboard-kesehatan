import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LayoutDashboard, Users, MapPin, LogOut, Menu, X, ClipboardList, BarChart2, Heart, Baby, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Header } from './Header'
import { AdminSpeedDialNavigation } from '@/components/navigation/AdminSpeedDialNavigation'

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Ibu-ibu': true,
    'Anak-anak': true
  })

  if (!user || (user as any).role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const toggleSection = (name: string) => {
    setOpenSections(prev => ({ ...prev, [name]: !prev[name] }))
  }

  interface SubNavItem {
    name: string
    path: string
  }

  interface NavItem {
    name: string
    path?: string
    icon?: any
    isHeader?: boolean
    subItems?: SubNavItem[]
  }

  const navigation: NavItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'KATEGORI PASIEN', isHeader: true },
    {
      name: 'Ibu-ibu',
      icon: Heart,
      subItems: [
        { name: 'Ibu Hamil', path: '/admin/warga/bumil' },
        { name: 'Ibu Pasca Persalinan', path: '/admin/warga/pasca-persalinan' },
      ],
    },
    { name: 'Lansia', path: '/admin/warga/lansia', icon: Users },
    {
      name: 'Anak-anak',
      icon: Baby,
      subItems: [
        { name: 'Baduta', path: '/admin/warga/baduta' },
        { name: 'Balita', path: '/admin/warga/balita' },
      ],
    },
    { name: 'ADMINISTRASI', isHeader: true },
    { name: 'Rekapitulasi Bulanan', icon: BarChart2, path: '/admin/laporan' },
    { name: 'Status Pendataan', icon: ClipboardList, path: '/admin/status-pendataan' },
    { name: 'Data Posyandu', icon: MapPin, path: '/admin/posyandu' },
    { name: 'Manajemen User', icon: Users, path: '/admin/users' },
  ]

  const SidebarContent = () => (
    <>
      <div className="flex h-[72px] items-center px-6 border-b border-slate-800 gap-3">
        <div className="bg-white rounded-full p-2 flex items-center justify-center shrink-0">
          <img src='/logo-cipicung.webp' alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-white tracking-tight leading-none flex items-center">
            Cipicung <span className="text-[10px] font-bold uppercase ml-2 px-1.5 py-0.5 bg-red-500 text-white rounded">Admin</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          if (item.isHeader) {
            return (
              <div key={item.name} className="px-3 pt-5 pb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {item.name}
              </div>
            )
          }

          if (item.subItems) {
            const isOpen = openSections[item.name]
            const hasActiveSub = item.subItems.some(sub => location.pathname === sub.path)
            
            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => toggleSection(item.name)}
                  className={`w-full group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    hasActiveSub && !isOpen
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />}
                    {item.name}
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                  )}
                </button>
                {isOpen && (
                  <div className="space-y-1 pl-10 mt-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path
                      return (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isSubActive
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path || item.name}
              to={item.path || '#'}
              className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {Icon && <Icon className="mr-3 h-5 w-5 flex-shrink-0" />}
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-4">
          <p className="text-sm font-medium text-white truncate">{(user as any).nama || 'Admin'}</p>
          <p className="text-xs text-slate-400 truncate">{(user as any).email}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
      </div>
    </>
  )

  return (
    <div className="flex h-[100dvh] w-full bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block flex-shrink-0 h-[100dvh] overflow-y-auto w-64 bg-slate-900 text-slate-100 flex-col">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-y-auto relative">
        <div className="sticky top-0 z-40 w-full md:hidden">
          <Header />
        </div>
        <main className="flex-1 p-4 pb-28 md:p-8 md:pb-8">
          <Outlet />
          <AdminSpeedDialNavigation />
        </main>
      </div>
    </div>
  )
}
