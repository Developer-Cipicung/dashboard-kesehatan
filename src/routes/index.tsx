import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import AdminLayout from '../layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { SkeletonCard } from '@/components/feedback/LoadingSkeleton'

const Loadable = (Component: any) => (props: any) => (
  <Suspense fallback={<SkeletonCard />}>
    <Component {...props} />
  </Suspense>
)

const LoginPage = Loadable(lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage }))))
const DashboardPage = Loadable(lazy(() => import('@/features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage }))))
const SharedPatientList = Loadable(lazy(() => import('@/features/warga/components/SharedPatientList').then(m => ({ default: m.SharedPatientList }))))
const PatientHistoryPage = Loadable(lazy(() => import('@/features/pemeriksaan/pages/PatientHistoryPage').then(m => ({ default: m.PatientHistoryPage }))))
const ReportPage = Loadable(lazy(() => import('@/features/reports/pages/ReportPage').then(m => ({ default: m.ReportPage }))))
const PrintReportPage = Loadable(lazy(() => import('@/features/reports/pages/PrintReportPage').then(m => ({ default: m.PrintReportPage }))))
const AdminDashboardPage = Loadable(lazy(() => import('@/features/admin/pages/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage }))))
const AdminReportPage = Loadable(lazy(() => import('@/features/admin/pages/AdminReportPage').then(m => ({ default: m.AdminReportPage }))))
const PosyanduManagementPage = Loadable(lazy(() => import('@/features/admin/pages/PosyanduManagementPage').then(m => ({ default: m.PosyanduManagementPage }))))
const UserManagementPage = Loadable(lazy(() => import('@/features/admin/pages/UserManagementPage').then(m => ({ default: m.UserManagementPage }))))


const AdminStatusPendataanPage = Loadable(lazy(() => import('@/features/admin/pages/AdminStatusPendataanPage').then(m => ({ default: m.AdminStatusPendataanPage }))))
const VerifikasiPendataanPage = Loadable(lazy(() => import('@/features/pendataan/pages/VerifikasiPendataanPage').then(m => ({ default: m.VerifikasiPendataanPage }))))
const CekKartuPage = Loadable(lazy(() => import('@/features/public/pages/CekKartuPage').then(m => ({ default: m.CekKartuPage }))))
const PrintKartuPage = Loadable(lazy(() => import('@/features/public/components/PrintKartuPage').then(m => ({ default: m.PrintKartuPage }))))

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'bumil',
            element: <SharedPatientList title="Ibu Hamil" kategori="bumil" />,
          },
          {
            path: 'pasca-persalinan',
            element: <SharedPatientList title="Pasca Persalinan" kategori="pasca_persalinan" />,
          },
          {
            path: 'baduta',
            element: <SharedPatientList title="Baduta" kategori="baduta" />,
          },
          {
            path: 'balita',
            element: <SharedPatientList title="Balita" kategori="balita" />,
          },
          {
            path: 'lansia',
            element: <SharedPatientList title="Lansia" kategori="lansia" />,
          },
          {
            path: 'laporan',
            element: <ReportPage />,
          },
          {
            path: 'verifikasi-pendataan',
            element: <VerifikasiPendataanPage />,
          },
          {
            path: 'status-pendataan',
            element: <AdminStatusPendataanPage />,
          },
          {
            path: ':kategori/:id',
            element: <PatientHistoryPage />,
          },
        ],
      },
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />,
          },
          {
            path: 'laporan',
            element: <AdminReportPage />,
          },
          {
            path: 'status-pendataan',
            element: <AdminStatusPendataanPage />,
          },
          {
            path: 'posyandu',
            element: <PosyanduManagementPage />,
          },
          {
            path: 'users',
            element: <UserManagementPage />,
          },
        ],
      },
      {
        path: '/warga/:id/kartu',
        element: <PrintKartuPage />,
      },
      {
        path: '/laporan/cetak',
        element: <PrintReportPage />,
      },
    ],
  },
  {
    path: '/cek-kartu',
    element: <CekKartuPage />,
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
