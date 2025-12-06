import { Routes, Route } from 'react-router-dom'
import AdminLogin from '../pages/AdminLogin'
import AdminDashboard from '../pages/AdminDashboard'
import AdminUserDetail from '../pages/AdminUserDetail'
import ProtectedAdminRoute from '../components/ProtectedAdminRoute'
import PublicAdminRoute from '../components/PublicAdminRoute'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <PublicAdminRoute>
            <AdminLogin />
          </PublicAdminRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedAdminRoute>
            <AdminUserDetail />
          </ProtectedAdminRoute>
        }
      />
    </Routes>
  )
}

