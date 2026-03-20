import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Paywall from '../components/ui/Paywall'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import { startCheckout } from '../lib/stripe'
import { supabase } from '../lib/supabase'

const FREE_LIMIT = 3 // must match FREE_MONTHLY_LIMIT in AuthContext
const PAYWALL_SESSION_KEY = 'rf_paywall_dismissed'

export default function Dashboard() {
  const { user, profile, optimizationsRemaining } = useAuth()
  const isPro = profile?.tier === 'pro'
  const [showPaywall, setShowPaywall] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState(null)

  useEffect(() => {
    if (profile && !isPro) {
      const dismissed = sessionStorage.getItem(PAYWALL_SESSION_KEY)
      if (!dismissed) setShowPaywall(true)
    }
  }, [profile, isPro])

  const handleDismiss = () => {
    // Mark paywall dismissed for this session so it doesn't reappear
    sessionStorage.setItem(PAYWALL_SESSION_KEY, '1')
    setShowPaywall(false)
  }

  const handleUpgrade = async () => {
    // Initiate Stripe Checkout — redirects browser to Stripe's hosted page
    setUpgrading(true)
    setUpgradeError(null)
    try {
      await startCheckout(user?.id, user?.email)
    } catch (err) {
      setUpgradeError('Could not start checkout. Please try again.')
      setUpgrading(false)
    }
  }

  const usedThisMonth = profile
    ? Math.min(FREE_LIMIT, FREE_LIMIT - optimizationsRemaining)
    : 0

  // Whether the user can navigate to the optimizer
  const canOptimize = isPro || optimizationsRemaining > 0

  const [recentResumes, setRecentResumes] = useState([])
  const [loadingResumes, setLoadingResumes] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('saved_resumes')
      .select('id, title, ats_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (!error) setRecentResumes(data ?? [])
        setLoadingResumes(false)
      })
  }, [user])

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <Layout>
      {showPaywall && <Paywall onDismiss={handleDismiss} />}

      <div className="bg-white dark:bg-navy-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">

          <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Signed in as <span className="text-slate-700 dark:text-slate-300">{user?.email}</span>
              </p>
            </div>
            {profile && (
              <div className={`px-4 py-2 rounded-xl border text-sm font-semibold ${
                isPro
                  ? 'bg-electric-500/10 border-electric-500/40 text-electric-600 dark:text-electric-400'
                  : 'bg-slate-100 border-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-400'
              }`}>
                {isPro ? '⚡ Pro Plan' : 'Free Plan'}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div className="stagger-item hover-lift bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-6" style={{ animationDelay: '0ms' }}>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Optimizations this month</p>
              {isPro ? (
                <p className="text-3xl font-bold text-slate-900 dark:text-white">Unlimited</p>
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                    {usedThisMonth}
                    <span className="text-slate-400 text-xl font-normal"> / {FREE_LIMIT}</span>
                  </p>
                  <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bar-fill ${optimizationsRemaining === 0 ? 'bg-red-500' : 'bg-gradient-to-r from-electric-500 to-violet-500'}`}
                      style={{ width: `${(usedThisMonth / FREE_LIMIT) * 100}%` }}
                    />
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    {optimizationsRemaining === 0 ? 'Limit reached — resets next month' : `${optimizationsRemaining} remaining`}
                  </p>
                </>
              )}
            </div>

            <div className="stagger-item hover-lift bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-6" style={{ animationDelay: '60ms' }}>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Current plan</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{isPro ? 'Pro' : 'Free'}</p>
              <p className="text-slate-400 text-xs">{isPro ? '$10 / month · All features included' : '3 optimizations / month'}</p>
            </div>

            <div className="stagger-item hover-lift bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between" style={{ animationDelay: '120ms' }}>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Quick action</p>
                <p className="text-slate-900 dark:text-white font-medium text-sm mb-1">Ready to apply?</p>
                <p className="text-slate-400 text-xs">Tailor your resume to a new job in minutes.</p>
              </div>
              {/* Only wrap in Link when user can actually optimize — prevents dead navigation */}
              {canOptimize ? (
                <Link to="/optimize" className="mt-4">
                  <Button size="sm" className="w-full">New Optimization</Button>
                </Link>
              ) : (
                <Button size="sm" disabled className="w-full mt-4">New Optimization</Button>
              )}
            </div>
          </div>

          {/* Upgrade banner — triggers Stripe Checkout directly, not a link to /pricing */}
          {!isPro && profile && (
            <div className="stagger-item border-glow bg-gradient-to-r from-electric-500/10 to-violet-500/10 border border-electric-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10" style={{ animationDelay: '180ms' }}>
              <div>
                <p className="text-slate-900 dark:text-white font-semibold mb-1">Unlock unlimited optimizations with Pro</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm">AI bullet rewriting, cover letter generation, full version history — $10/month.</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {upgradeError && (
                  <p className="text-red-500 dark:text-red-400 text-xs">{upgradeError}</p>
                )}
                <Button onClick={handleUpgrade} disabled={upgrading}>
                  {upgrading ? 'Redirecting…' : 'Upgrade to Pro'}
                </Button>
              </div>
            </div>
          )}

          {/* Recent resumes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Resumes</h2>
              {recentResumes.length > 0 && (
                <Link to="/library" className="text-sm text-electric-600 dark:text-electric-400 hover:underline font-medium">View all</Link>
              )}
            </div>

            {loadingResumes ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 dark:bg-navy-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : recentResumes.length === 0 ? (
              <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-14 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-electric-500/10 to-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-electric-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No optimizations yet
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-7">
                  Upload your resume and a job description to get a tailored, ATS-ready resume in under 60 seconds.
                </p>
                {canOptimize ? (
                  <Link to="/optimize">
                    <Button size="lg">Start a New Optimization</Button>
                  </Link>
                ) : (
                  <Button size="lg" disabled>No Optimizations Remaining</Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {recentResumes.map(r => (
                  <Link
                    key={r.id}
                    to="/library"
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl hover:border-electric-500/30 hover:shadow-sm transition-all group card-hover"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-500/20 to-violet-500/20 flex items-center justify-center shrink-0 group-hover:from-electric-500/30 group-hover:to-violet-500/30 transition-all duration-300 group-hover:scale-110">
                        <svg className="w-4 h-4 text-electric-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{r.title || 'Optimized Resume'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(r.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {r.ats_score !== null && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          r.ats_score >= 85 ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                          : r.ats_score >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                          {r.ats_score}% ATS
                        </span>
                      )}
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-electric-500 transition-all group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
                <div className="pt-1">
                  {canOptimize ? (
                    <Link to="/optimize">
                      <Button variant="secondary" className="w-full">New Optimization</Button>
                    </Link>
                  ) : (
                    <Button variant="secondary" disabled className="w-full">No Optimizations Remaining</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
