import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-navy-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-electric-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Redirect brand-new accounts to welcome sequence (runs once per user, per device)
  if (pathname !== '/welcome') {
    const ageMs = Date.now() - new Date(user.created_at).getTime()
    const isNewAccount = ageMs < 5 * 60 * 1000
    if (isNewAccount && !localStorage.getItem(`sl_onboarded_${user.id}`)) {
      return <Navigate to="/welcome" replace />
    }
  }

  return children
}
