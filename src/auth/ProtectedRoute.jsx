// src/auth/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return null // or a spinner
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
