import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const FREE_MONTHLY_LIMIT = 0

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error && data) setProfile(data)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signUp = (email, password) =>
    supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signInWithProvider = (provider) => {
    return supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  const signOut = () => supabase.auth.signOut()

  const isNewMonth = (profile) => {
    if (!profile || !profile.month_reset_at) return false
    const resetAt = new Date(profile.month_reset_at)
    if (isNaN(resetAt.getTime())) return false
    const now = new Date()
    return (now.getFullYear() * 12 + now.getMonth()) > (resetAt.getFullYear() * 12 + resetAt.getMonth())
  }

  // Checks whether the user is allowed to run an optimization right now
  const canOptimize = (() => {
    if (!profile) return false
    if (profile.tier === 'pro') return true
    const effectiveCount = isNewMonth(profile) ? 0 : profile.optimizations_this_month
    return effectiveCount < FREE_MONTHLY_LIMIT
  })()

  const optimizationsRemaining = (() => {
    if (!profile) return 0
    if (profile.tier === 'pro') return Infinity
    const effectiveCount = isNewMonth(profile) ? 0 : profile.optimizations_this_month
    return Math.max(0, FREE_MONTHLY_LIMIT - effectiveCount)
  })()

  // Re-fetch profile from Supabase — call this after Stripe upgrade to reflect Pro tier
  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  // Update profile fields (username, avatar_url, etc.)
  const updateProfile = useCallback(async (updates) => {
    if (!user) return { error: 'Not authenticated' }
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
    if (!error) await fetchProfile(user.id)
    return { error }
  }, [user, fetchProfile])

  // Call this after a successful optimization to increment the counter
  const incrementUsage = async () => {
    if (!user) return
    await supabase.rpc('increment_optimization_count', { user_id: user.id })
    await fetchProfile(user.id) // refresh local profile state
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      canOptimize,
      optimizationsRemaining,
      incrementUsage,
      refreshProfile,
      updateProfile,
      signUp,
      signIn,
      signInWithProvider,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
