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
    sessionStorage.setItem(PAYWALL_SESSION_KEY, '1')
    setShowPaywall(false)
  }

  const handleUpgrade = async () => {
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
  const firstName = profile?.username || user?.email?.split('@')[0] || ''

  return (
    <Layout>
      {showPaywall && <Paywall onDismiss={handleDismiss} />}

      {/* ── Hero welcome banner ──────────────────────────────────────── */}
      <div data-reveal="fade" className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 dark:from-black dark:via-navy-950 dark:to-black border-b border-white/5">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl orb-drift pointer-events-none" />
        <div className="absolute -bottom-16 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl orb-drift2 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              {profile && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                  isPro
                    ? 'bg-electric-500/20 border border-electric-500/40 text-electric-400'
                    : 'bg-white/10 border border-white/20 text-slate-300'
                }`}>
                  {isPro ? (
                    <>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      Pro Plan
                    </>
                  ) : (
                    <><span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Free Plan</>
                  )}
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">
                Welcome back{firstName ? `, ${firstName}` : ''}!
              </h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>

            <div className="flex gap-3">
              {canOptimize ? (
                <Link to="/optimize">
                  <Button>
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    New Optimization
                  </Button>
                </Link>
              ) : (
                <Button disabled>
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  New Optimization
                </Button>
              )}
              <Link to="/library">
                <button className="px-4 py-2 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm font-medium transition-all hover:bg-white/5">
                  My Library
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 dark:bg-navy-900/60 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

          {/* ── Stats row ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

            {/* Optimizations usage card */}
            <div data-reveal data-delay="1" className="stagger-item bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover-lift" style={{ animationDelay: '0ms' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-500/15 to-violet-500/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-electric-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">This Month</span>
              </div>
              {isPro ? (
                <>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Unlimited</p>
                  <p className="text-xs text-slate-400">Optimizations available</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {usedThisMonth}
                    <span className="text-slate-400 text-base font-normal"> / {FREE_LIMIT}</span>
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    {optimizationsRemaining === 0
                      ? 'Limit reached · resets next month'
                      : `${optimizationsRemaining} optimization${optimizationsRemaining !== 1 ? 's' : ''} remaining`}
                  </p>
                  <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bar-fill ${
                        optimizationsRemaining === 0
                          ? 'bg-gradient-to-r from-red-500 to-rose-400'
                          : 'bg-gradient-to-r from-electric-500 to-violet-500'
                      }`}
                      style={{ width: `${(usedThisMonth / FREE_LIMIT) * 100}%` }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Plan card */}
            <div data-reveal data-delay="2" className="stagger-item bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover-lift" style={{ animationDelay: '60ms' }}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isPro
                    ? 'bg-gradient-to-br from-electric-500/20 to-violet-500/20'
                    : 'bg-slate-100 dark:bg-white/10'
                }`}>
                  <svg className={`w-5 h-5 ${isPro ? 'text-electric-500' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.745 3.745 0 013.296-1.043A3.745 3.745 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.745 3.745 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Plan</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{isPro ? 'Pro' : 'Free'}</p>
              <p className="text-xs text-slate-400">{isPro ? '$10 / month · All features unlocked' : '3 optimizations per month'}</p>
              {isPro && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-electric-600 dark:text-electric-400 bg-electric-500/8 dark:bg-electric-500/10 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-electric-500 animate-pulse" />
                  Active
                </div>
              )}
            </div>

            {/* Library card */}
            <div data-reveal data-delay="3" className="stagger-item bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover-lift" style={{ animationDelay: '120ms' }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/15 to-pink-500/15 flex items-center justify-center">
                  <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Library</span>
              </div>
              {loadingResumes ? (
                <div className="h-8 w-16 bg-slate-100 dark:bg-white/10 rounded-lg animate-pulse" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {recentResumes.length === 5 ? '5+' : recentResumes.length}
                  </p>
                  <p className="text-xs text-slate-400">Saved resume{recentResumes.length !== 1 ? 's' : ''}</p>
                </>
              )}
              {recentResumes.length > 0 && (
                <Link to="/library" className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline">
                  View library →
                </Link>
              )}
            </div>
          </div>

          {/* ── Upgrade banner (free users only) ──────────────────────── */}
          {!isPro && profile && (
            <div
              data-reveal="scale"
              className="stagger-item mb-8 relative overflow-hidden rounded-2xl border border-glow"
              style={{
                animationDelay: '180ms',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(139,92,246,0.07) 50%, rgba(59,130,246,0.07) 100%)'
              }}
            >
              {/* Dot grid */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.2) 1px, transparent 0)', backgroundSize: '24px 24px' }}
              />
              <div className="relative p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-500 to-violet-500 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">Upgrade to Pro</p>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                      Unlock unlimited optimizations and all premium features.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['Unlimited Optimizations', 'AI Bullet Rewriting', 'Cover Letters', 'Version History'].map(f => (
                        <span key={f} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
                    {upgradeError && <p className="text-red-500 dark:text-red-400 text-xs">{upgradeError}</p>}
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">$10</span>
                      <span className="text-slate-400 text-sm">/month</span>
                    </div>
                    <Button onClick={handleUpgrade} disabled={upgrading}>
                      {upgrading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Redirecting…
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                          Upgrade to Pro
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Recent Resumes card ────────────────────────────────────── */}
          <div data-reveal className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-500/15 to-violet-500/15 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-electric-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Resumes</h2>
              </div>
              {recentResumes.length > 0 && (
                <Link to="/library" className="text-xs text-electric-600 dark:text-electric-400 hover:underline font-semibold">
                  View all →
                </Link>
              )}
            </div>

            {loadingResumes ? (
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-xl animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-100 dark:bg-white/10 rounded animate-pulse w-1/2" />
                      <div className="h-2.5 bg-slate-100 dark:bg-white/10 rounded animate-pulse w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentResumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-14 h-14 bg-gradient-to-br from-electric-500/10 to-violet-500/10 rounded-2xl flex items-center justify-center mb-4 float">
                  <svg className="w-7 h-7 text-electric-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">No optimizations yet</h3>
                <p className="text-slate-400 text-sm max-w-xs mb-6 leading-relaxed">
                  Upload your resume and a job description to get a tailored, ATS-ready resume in under 60 seconds.
                </p>
                {canOptimize ? (
                  <Link to="/optimize"><Button>Start a New Optimization</Button></Link>
                ) : (
                  <Button disabled>No Optimizations Remaining</Button>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {recentResumes.map((r, i) => (
                    <Link
                      key={r.id}
                      to="/library"
                      style={{ animationDelay: `${i * 50}ms` }}
                      className="stagger-item flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                    >
                      {/* ATS score square */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs ${
                        r.ats_score === null
                          ? 'bg-slate-100 dark:bg-white/10 text-slate-400'
                          : r.ats_score >= 85
                          ? 'bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400'
                          : r.ats_score >= 70
                          ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400'
                      }`}>
                        {r.ats_score !== null ? r.ats_score : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {r.title || 'Optimized Resume'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-400">{formatDate(r.created_at)}</p>
                          {r.ats_score !== null && (
                            <span className={`text-[10px] font-bold ${
                              r.ats_score >= 85
                                ? 'text-green-600 dark:text-green-400'
                                : r.ats_score >= 70
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              ATS {r.ats_score}%
                            </span>
                          )}
                        </div>
                      </div>

                      <svg className="w-4 h-4 text-slate-300 group-hover:text-electric-500 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>

                {/* Footer CTA */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10">
                  {canOptimize ? (
                    <Link to="/optimize">
                      <button className="w-full flex items-center justify-center gap-2 py-1.5 text-sm font-semibold text-electric-600 dark:text-electric-400 hover:text-electric-700 dark:hover:text-electric-300 transition-colors group">
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Optimization
                      </button>
                    </Link>
                  ) : (
                    <p className="text-center text-xs text-slate-400 py-1">Upgrade to Pro for more optimizations</p>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </Layout>
  )
}
