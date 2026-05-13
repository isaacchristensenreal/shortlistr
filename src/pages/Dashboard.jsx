import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, CheckCircle, BookOpen, TrendingUp, Flame,
  ArrowRight, Plus, Sparkles,
} from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { startCheckout } from '../lib/stripe'
import { supabase } from '../lib/supabase'

const EASE_OUT = [0.23, 1, 0.32, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE_OUT } },
}

function StatCard({ Icon, label, value, sub, accent = '#F5C842' }) {
  return (
    <motion.div
      variants={staggerItem}
      className="rounded-2xl p-5 border"
      style={{ background: '#13131A', borderColor: '#1E1E2E' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}18`, border: `1px solid ${accent}28` }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</span>
      </div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      {sub && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</p>}
    </motion.div>
  )
}

function ActionCard({ to, Icon, iconBg, iconBorder, iconColor, title, subtitle }) {
  return (
    <motion.div variants={staggerItem} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
      <Link
        to={to}
        className="group flex items-center gap-4 rounded-2xl p-5 border transition-colors hover:border-white/10"
        style={{ background: '#13131A', borderColor: '#1E1E2E' }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
          <Icon size={22} style={{ color: iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{subtitle}</p>
        </div>
        <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: 'rgba(255,255,255,0.18)' }} />
      </Link>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const isPro = profile?.tier === 'pro'
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeError, setUpgradeError] = useState(null)
  const [recentResumes, setRecentResumes] = useState([])
  const [loadingResumes, setLoadingResumes] = useState(true)

  const canOptimize = isPro
  const firstName = profile?.username || user?.email?.split('@')[0] || ''

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

  if (!profile) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 rounded-full"
            style={{ border: '2px solid rgba(245,200,66,0.15)', borderTopColor: '#F5C842' }}
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* Welcome */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              Welcome back{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>{user?.email}</p>
          </motion.div>

          {/* Stats — Pro only */}
          {isPro && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard Icon={Zap}         label="Scans"   value="∞"   sub="Unlimited · Pro plan"     accent="#F5C842" />
              <StatCard Icon={CheckCircle} label="Plan"    value="Pro" sub="All features unlocked"    accent="#00FF88" />
              <StatCard
                Icon={BookOpen}
                label="Library"
                value={loadingResumes ? '…' : recentResumes.length === 5 ? '5+' : recentResumes.length}
                sub="Saved resume versions"
                accent="#6366f1"
              />
            </motion.div>
          )}

          {/* Quick actions — Pro only */}
          {isPro && (
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <ActionCard
                to="/optimize"
                Icon={Zap}
                iconBg="rgba(245,200,66,0.1)"
                iconBorder="rgba(245,200,66,0.2)"
                iconColor="#F5C842"
                title="See Why You're Getting Rejected"
                subtitle="Upload resume + job description → get your score"
              />
              <ActionCard
                to="/optimize"
                Icon={TrendingUp}
                iconBg="rgba(59,130,246,0.1)"
                iconBorder="rgba(59,130,246,0.2)"
                iconColor="#60a5fa"
                title="Find Out Your Real Score"
                subtitle="Run a scan to see which companies would hire you"
              />
            </motion.div>
          )}

          {/* Free user — Roast CTA + Paywall */}
          {!isPro && profile && (
            <motion.div variants={stagger} initial="hidden" animate="show">

              {/* Roast CTA */}
              <motion.div variants={staggerItem} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="mb-4">
                <Link
                  to="/roast"
                  className="group flex items-center gap-4 rounded-2xl p-5 border transition-colors hover:border-red-500/20"
                  style={{ background: '#13131A', borderColor: '#1E1E2E' }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)' }}>
                    <Flame size={22} style={{ color: '#FF4444' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-semibold text-sm">Get Your Resume Roasted</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.2)' }}>FREE</span>
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Find out your real ATS score and why your resume isn't working</p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: 'rgba(255,68,68,0.3)' }} />
                </Link>
              </motion.div>

              {/* Paywall upgrade banner */}
              <motion.div
                variants={staggerItem}
                className="mb-8 rounded-2xl p-6 border relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #1a1408 0%, #13131A 100%)', borderColor: 'rgba(245,200,66,0.15)' }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(245,200,66,0.05)', filter: 'blur(48px)' }} />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={15} style={{ color: '#F5C842' }} />
                      <p className="font-bold text-sm" style={{ color: '#F5C842' }}>Unlock Everything with Pro</p>
                    </div>
                    <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Optimize your resume, get rejection analysis, interview prep, LinkedIn optimizer, and unlimited scans.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Unlimited Scans', 'Resume Optimization', 'Rejection Analysis', 'Interview Prep', 'LinkedIn Optimizer', 'Cover Letters'].map(f => (
                        <span key={f} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>✓ {f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
                    {upgradeError && <p className="text-xs" style={{ color: '#FF4444' }}>{upgradeError}</p>}
                    <div className="flex items-baseline gap-1">
                      <span className="text-white font-black text-3xl">$10</span>
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>/mo</span>
                    </div>
                    <motion.button
                      onClick={handleUpgrade}
                      disabled={upgrading}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}
                    >
                      {upgrading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 rounded-full animate-spin"
                            style={{ borderColor: 'rgba(10,10,15,0.3)', borderTopColor: '#0A0A0F' }} />
                          Redirecting…
                        </span>
                      ) : 'Upgrade to Pro'}
                    </motion.button>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Cancel anytime · No contracts</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Recent Resumes — Pro only */}
          {isPro && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.22 }}
              className="rounded-2xl overflow-hidden border"
              style={{ background: '#13131A', borderColor: '#1E1E2E' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="text-white font-semibold text-sm">Recent Resumes</h2>
                {recentResumes.length > 0 && (
                  <Link to="/library" className="text-xs font-semibold transition-colors hover:opacity-80" style={{ color: '#F5C842' }}>View all →</Link>
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
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.15)' }}>
                    <Sparkles size={22} style={{ color: 'rgba(245,200,66,0.4)' }} />
                  </div>
                  <p className="font-medium text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>No scans yet</p>
                  <p className="text-xs max-w-xs mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Upload your resume and a job description to get your Hiring Probability Score.
                  </p>
                  {canOptimize ? (
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Link to="/optimize"
                        className="px-5 py-2.5 rounded-xl font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}>
                        Start My First Scan
                      </Link>
                    </motion.div>
                  ) : (
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Upgrade to Pro to continue scanning</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="divide-y divide-white/5">
                    {recentResumes.map((r) => (
                      <Link
                        key={r.id}
                        to="/library"
                        className="flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors group"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs border"
                          style={r.ats_score !== null ? {
                            background: `${scoreColor(r.ats_score)}12`,
                            borderColor: `${scoreColor(r.ats_score)}28`,
                            color: scoreColor(r.ats_score),
                          } : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}
                        >
                          {r.ats_score !== null ? r.ats_score : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'rgba(255,255,255,0.8)' }}>{r.title || 'Optimized Resume'}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{formatDate(r.created_at)}</p>
                        </div>
                        <ArrowRight size={15} className="shrink-0 transition-transform group-hover:translate-x-0.5" style={{ color: 'rgba(255,255,255,0.15)' }} />
                      </Link>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-white/5">
                    {canOptimize ? (
                      <Link to="/optimize" className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: '#F5C842' }}>
                        <Plus size={14} />
                        New Scan
                      </Link>
                    ) : (
                      <p className="text-center text-xs py-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Upgrade to Pro for more scans</p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </AppShell>
  )
}
