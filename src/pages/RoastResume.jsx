import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { roastResume } from '../lib/ai'
import { startCheckout } from '../lib/stripe'

const ROAST_KEY = (uid) => `sl_roast_${uid}`

function ScoreRing({ score }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const color = score >= 70 ? '#00FF88' : score >= 50 ? '#F59E0B' : '#FF4444'
  const offset = circ - (score / 100) * circ
  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width={140} height={140} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          transform="rotate(-90 50 50)"
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-white" style={{ fontSize: 32, color }}>{score}</span>
        <span className="text-white/40 font-medium text-xs">ATS SCORE</span>
      </div>
    </div>
  )
}

export default function RoastResume() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isPro = profile?.tier === 'pro'

  const [resumeText, setResumeText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [alreadyUsed, setAlreadyUsed] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    if (isPro) { navigate('/optimize', { replace: true }); return }
    if (user) {
      const stored = localStorage.getItem(ROAST_KEY(user.id))
      if (stored) {
        try { setResult(JSON.parse(stored)); setAlreadyUsed(true) } catch { /* ignore */ }
      }
    }
  }, [isPro, user, navigate])

  const handleRoast = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      setError('Please paste at least 50 characters of your resume.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const data = await roastResume(resumeText)
      localStorage.setItem(ROAST_KEY(user.id), JSON.stringify(data))
      setResult(data)
      setAlreadyUsed(true)
    } catch (e) {
      setError(e?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      await startCheckout(user?.id, user?.email, 'monthly', window.location.href)
    } catch {
      setUpgrading(false)
    }
  }

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-bold"
              style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#FF4444' }}>
              🔥 Free Resume Roast
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Why Isn't Your Resume Working?</h1>
            <p className="text-white/40 text-sm max-w-md mx-auto">Paste your resume. Get the brutal truth about why it's not getting you hired — and your real ATS score.</p>
          </div>

          {result ? (
            /* ── Results ── */
            <div className="space-y-4">
              {/* Score + verdict */}
              <div className="rounded-2xl p-6 border flex flex-col sm:flex-row items-center gap-6"
                style={{ background: '#13131A', borderColor: '#1E1E2E' }}>
                <ScoreRing score={result.ats_score} />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">The Verdict</p>
                  <p className="text-white font-semibold text-base leading-relaxed">{result.verdict}</p>
                </div>
              </div>

              {/* Roast items */}
              <div className="rounded-2xl border overflow-hidden" style={{ background: '#13131A', borderColor: '#1E1E2E' }}>
                <div className="px-5 py-3 border-b border-white/5">
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">What's Killing Your Chances</p>
                </div>
                <div className="divide-y divide-white/5">
                  {result.roast.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-4">
                      <span className="text-sm mt-0.5 shrink-0" style={{ color: '#FF4444' }}>✗</span>
                      <p className="text-white/70 text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="rounded-2xl p-6 border relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #1a1408 0%, #13131A 100%)', borderColor: 'rgba(245,200,66,0.2)' }}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative">
                  <p className="text-gold-500 font-bold text-sm mb-1">Fix All of This With ShortListr Pro</p>
                  <p className="text-white/40 text-sm mb-4">
                    AI rewrites your resume, injects the right keywords, and gets your ATS score above 90 — in under 90 seconds.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Unlimited Resume Scans', 'ATS Keyword Injection', 'AI Bullet Rewriting', 'Cover Letter Generator', 'Interview Prep'].map(f => (
                      <span key={f} className="text-[11px] font-semibold px-2.5 py-1 rounded-full border text-white/50 border-white/10">✓ {f}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleUpgrade}
                      disabled={upgrading}
                      className="px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}
                    >
                      {upgrading ? 'Redirecting…' : 'Fix My Resume — $10/mo'}
                    </button>
                    <span className="text-white/25 text-xs">Cancel anytime</span>
                  </div>
                </div>
              </div>

              {alreadyUsed && !result.fromFresh && (
                <p className="text-center text-white/20 text-xs">This is your one free roast. Upgrade to unlock full optimization.</p>
              )}
            </div>
          ) : (
            /* ── Input form ── */
            <div className="space-y-4">
              {alreadyUsed ? (
                /* Already used — show locked state */
                <div className="rounded-2xl p-8 border text-center"
                  style={{ background: '#13131A', borderColor: '#1E1E2E' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.15)' }}>
                    <svg className="w-6 h-6 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <p className="text-white font-semibold mb-1">You've used your free roast</p>
                  <p className="text-white/35 text-sm mb-5">Upgrade to Pro to optimize your resume and actually fix the problems we found.</p>
                  <button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="px-6 py-3 rounded-xl font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}
                  >
                    {upgrading ? 'Redirecting…' : 'Upgrade to Pro — $10/mo'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border overflow-hidden" style={{ background: '#13131A', borderColor: '#1E1E2E' }}>
                    <textarea
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                      placeholder="Paste your resume text here..."
                      rows={14}
                      className="w-full bg-transparent text-white/80 text-sm p-5 resize-none focus:outline-none placeholder-white/15 leading-relaxed"
                    />
                    <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-white/20 text-xs">{resumeText.length.toLocaleString()} chars</span>
                      <span className="text-white/20 text-xs">1 free roast remaining</span>
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm px-1" style={{ color: '#FF4444' }}>{error}</p>
                  )}

                  <button
                    onClick={handleRoast}
                    disabled={loading || resumeText.trim().length < 50}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #FF4444, #d4a017)', color: '#fff' }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing your resume…
                      </span>
                    ) : '🔥 Roast My Resume'}
                  </button>

                  <p className="text-center text-white/20 text-xs">No optimization. Just the brutal truth about why it isn't working.</p>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </AppShell>
  )
}
