import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { SpeedDialNavigation } from '@/components/navigation/SpeedDialNavigation'

export default function DashboardLayout() {
  const user = useAuthStore((state) => state.user)
  const userRole = typeof user?.role === 'string' ? user.role : undefined

  if (userRole === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block flex-shrink-0 h-[100dvh] overflow-y-auto border-r border-slate-200">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-y-auto relative">
        <div className="sticky top-0 z-40 w-full">
          <Header />
        </div>
        <main className="flex-1 p-4 pb-28 md:p-6 md:pb-6 lg:p-8">
          <Outlet />
          <SpeedDialNavigation />
        </main>
      </div>
    </div>
  )
}