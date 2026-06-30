import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#fafbfc' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(59,130,246,0.3)', borderTopColor: '#3b82f6' }} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  // Send accounts that have never finished onboarding to the welcome
  // sequence — runs exactly once, ever, per account (profiles.onboarded),
  // not a per-device localStorage flag. Premium accounts always skip it,
  // even if onboarded somehow wasn't recorded (e.g. they paid mid-wizard).
  const needsOnboarding = !profile.onboarded && profile.tier !== 'pro'
  if (needsOnboarding && pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />
  }

  return children
}
