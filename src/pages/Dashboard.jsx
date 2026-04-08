import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { startCheckout } from '../lib/stripe'
import { supabase } from '../lib/supabase'

const FREE_LIMIT = 3

function StatCard({ icon, label, value, sub, accent = '#F5C842', delay = 0 }) {
  return (
    <div
      data-reveal
      className="rounded-2xl p-5 border hover-lift"
      style={{ background: '#13131A', borderColor: '#1E1E2E', animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/25">{label}</span>
      </div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      {sub && <p className="text-white/35 text-xs">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, optimizationsRemaining } = useAuth()
  const navigate = useNavigate()
  const isPro = profile?.tier === 'pro'
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState(null)
  const [recentResumes, setRecentResumes] = useState([])
  const [loadingResumes, setLoadingResumes] = useState(true)

  const canOptimize = isPro
  const firstName = profile?.username || user?.email?.split('@')[0] || ''

  // no redirect — free users stay on dashboard and see paywall

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

  const handleUpgrade = async () => {
    setUpgrading(true)
    setUpgradeError(null)
    try {
      await startCheckout(user?.id, user?.email)
    } catch {
      setUpgradeError('Could not start checkout. Please try again.')
      setUpgrading(false)
    }
  }

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const scoreColor = (s) => s >= 70 ? '#00FF88' : s >= 50 ? '#F59E0B' : '#FF4444'

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* Welcome */}
          <div data-reveal="fade" className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              Welcome back{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-white/35 text-sm">{user?.email}</p>
          </div>

          {/* Stats — Pro only */}
          {isPro && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard
                delay={0}
                label="Scans"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                value="∞"
                sub="Unlimited · Pro plan"
                accent="#F5C842"
              />
              <StatCard
                delay={60}
                label="Plan"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                value="Pro"
                sub="Pro · All features"
                accent="#00FF88"
              />
              <StatCard
                delay={120}
                label="Library"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
                value={loadingResumes ? '…' : recentResumes.length === 5 ? '5+' : recentResumes.length}
                sub="Saved resume versions"
                accent="#6366f1"
              />
            </div>
          )}

          {/* Quick actions — Pro only */}
          {isPro && (
            <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <Link
                to="/optimize"
                className="group flex items-center gap-4 rounded-2xl p-5 border transition-all hover:border-gold-500/30"
                style={{ background: '#13131A', borderColor: '#1E1E2E' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)' }}>
                  <svg className="w-6 h-6 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">See Why You're Getting Rejected</p>
                  <p className="text-white/35 text-xs mt-0.5">Upload resume + job description → get your score</p>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-gold-500 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>

              <Link
                to="/optimize?tab=matches"
                className="group flex items-center gap-4 rounded-2xl p-5 border transition-all hover:border-electric-500/30"
                style={{ background: '#13131A', borderColor: '#1E1E2E' }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <svg className="w-6 h-6 text-electric-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">Find Out Your Real Score</p>
                  <p className="text-white/35 text-xs mt-0.5">See which companies would hire you right now</p>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-electric-400 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          )}

          {/* Free user — Roast CTA + Paywall */}
          {!isPro && profile && (
            <>
              {/* Roast CTA */}
              <div data-reveal className="mb-4">
                <Link
                  to="/roast"
                  className="group flex items-center gap-4 rounded-2xl p-5 border transition-all hover:border-red-500/30"
                  style={{ background: '#13131A', borderColor: '#1E1E2E' }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl"
                    style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)' }}>
                    🔥
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-semibold text-sm">Get Your Resume Roasted</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.2)' }}>FREE</span>
                    </div>
                    <p className="text-white/35 text-xs">Find out your real ATS score and why your resume isn't working</p>
                  </div>
                  <svg className="w-4 h-4 text-white/20 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>

              {/* Paywall upgrade banner */}
              <div
                data-reveal="scale"
                className="mb-8 rounded-2xl p-6 border border-gold-500/15 relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #1a1408 0%, #13131A 100%)' }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-gold-500" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      <p className="text-gold-500 font-bold text-sm">Unlock Everything with Pro</p>
                    </div>
                    <p className="text-white/50 text-sm mb-3">Optimize your resume, get rejection analysis, interview prep, LinkedIn optimizer, and unlimited scans.</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Unlimited Scans', 'Resume Optimization', 'Rejection Analysis', 'Interview Prep', 'LinkedIn Optimizer', 'Cover Letters'].map(f => (
                        <span key={f} className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white/50 border border-white/10">✓ {f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
                    {upgradeError && <p className="text-red-400 text-xs">{upgradeError}</p>}
                    <div className="flex items-baseline gap-1">
                      <span className="text-white font-black text-3xl">$10</span>
                      <span className="text-white/30 text-sm">/mo</span>
                    </div>
                    <button
                      onClick={handleUpgrade}
                      disabled={upgrading}
                      className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}
                    >
                      {upgrading ? (
                        <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />Redirecting…</span>
                      ) : 'Upgrade to Pro'}
                    </button>
                    <span className="text-white/20 text-xs">Cancel anytime · No contracts</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Recent Resumes — Pro only */}
          {isPro && <div
            data-reveal
            className="rounded-2xl overflow-hidden border"
            style={{ background: '#13131A', borderColor: '#1E1E2E' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <h2 className="text-white font-semibold text-sm">Recent Resumes</h2>
              {recentResumes.length > 0 && (
                <Link to="/library" className="text-xs text-gold-500 hover:text-gold-400 font-semibold transition-colors">View all →</Link>
              )}
            </div>

            {loadingResumes ? (
              <div className="divide-y divide-white/5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-3 w-1/2 rounded" />
                      <div className="skeleton h-2.5 w-1/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentResumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.15)' }}>
                  <svg className="w-6 h-6 text-gold-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <p className="text-white/50 font-medium text-sm mb-1">No scans yet</p>
                <p className="text-white/25 text-xs max-w-xs mb-5 leading-relaxed">Upload your resume and a job description to get your Hiring Probability Score.</p>
                {canOptimize ? (
                  <Link to="/optimize"
                    className="px-5 py-2.5 rounded-xl font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}>
                    Start My First Scan
                  </Link>
                ) : (
                  <p className="text-white/25 text-xs">Upgrade to Pro to continue scanning</p>
                )}
              </div>
            ) : (
              <>
                <div className="divide-y divide-white/5">
                  {recentResumes.map((r, i) => (
                    <Link
                      key={r.id}
                      to="/library"
                      className="flex items-center gap-3 p-4 hover:bg-white/3 transition-colors group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs border"
                        style={r.ats_score !== null ? {
                          background: `${scoreColor(r.ats_score)}10`,
                          borderColor: `${scoreColor(r.ats_score)}25`,
                          color: scoreColor(r.ats_score),
                        } : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}
                      >
                        {r.ats_score !== null ? r.ats_score : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-sm font-medium truncate">{r.title || 'Optimized Resume'}</p>
                        <p className="text-white/30 text-xs mt-0.5">{formatDate(r.created_at)}</p>
                      </div>
                      <svg className="w-4 h-4 text-white/15 group-hover:text-gold-500 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-white/5">
                  {canOptimize ? (
                    <Link to="/optimize" className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-gold-500 hover:text-gold-400 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      New Scan
                    </Link>
                  ) : (
                    <p className="text-center text-xs text-white/25 py-1">Upgrade to Pro for more scans</p>
                  )}
                </div>
              </>
            )}
          </div>}

        </div>
      </div>
    </AppShell>
  )
}
