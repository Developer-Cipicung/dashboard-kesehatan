import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useLoginTransitionStore } from '@/stores/loginTransitionStore'
import { WelcomeSplash } from '@/components/WelcomeSplash'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const showWelcome = useLoginTransitionStore((s) => s.showWelcome)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <>
      {showWelcome && <WelcomeSplash />}
      <Outlet />
    </>
  )
}
