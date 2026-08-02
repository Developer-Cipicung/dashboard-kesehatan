import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LayoutDashboard, Users, MapPin, LogOut, Menu, X, ClipboardList, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!user || (user as any).role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
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
        <Button variant="ghost" size="icon" aria-label="Tutup Menu" className="md:hidden text-white hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
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
    <div className="flex min-h-[100dvh] w-full bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col sticky top-0 h-[100dvh]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 transform transition-transform duration-200 ease-in-out md:hidden flex flex-col',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (Admin) */}
        <header className="md:hidden flex items-center p-4 border-b bg-white sticky top-0 z-40">
          <Button variant="ghost" size="icon" aria-label="Buka Menu" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-4 text-lg font-bold">Admin Cipicung</span>
        </header>

        <div className="flex-1 p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
