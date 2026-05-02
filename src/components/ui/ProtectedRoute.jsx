import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(245,200,66,0.3)', borderTopColor: '#F5C842' }} />
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
