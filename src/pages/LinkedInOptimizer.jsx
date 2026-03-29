import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { optimizeLinkedIn } from '../lib/ai'

function DiffView({ original, optimized }) {
  if (!original && !optimized) return null
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="card-dark p-4">
        <p className="text-crimson-400 text-[10px] font-bold uppercase tracking-wider mb-2">Before</p>
        <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap">{original || '(empty)'}</p>
      </div>
      <div className="card-dark p-4 border-neon-400/20">
        <p className="text-neon-400 text-[10px] font-bold uppercase tracking-wider mb-2">After</p>
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{optimized}</p>
      </div>
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
        copied
          ? 'bg-neon-400/15 text-neon-400 border-neon-400/30'
          : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/80'
      }`}
    >
      {copied ? (
        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied</>
      ) : (
        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy Optimized</>
      )}
    </button>
  )
}

function ScoreBadge({ score }) {
  const color = score >= 70 ? '#00FF88' : score >= 50 ? '#F59E0B' : '#FF4444'
  return (
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 relative">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 94.2} 94.2`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white font-black text-lg leading-none">{score}</span>
        </div>
      </div>
      <p className="text-white/40 text-[10px] mt-1 font-semibold uppercase tracking-wider">LinkedIn Score</p>
    </div>
  )
}

export default function LinkedInOptimizer() {
  const { profile } = useAuth()
  const { success, error: toastError } = useToast()
  const isPro = profile?.tier === 'pro'

  const [headline, setHeadline] = useState('')
  const [about, setAbout] = useState('')
  const [exp1, setExp1] = useState('')
  const [exp2, setExp2] = useState('')
  const [exp3, setExp3] = useState('')

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleOptimize = async () => {
    if (!headline.trim() && !about.trim()) return
    setLoading(true)
    try {
      const experience = [exp1, exp2, exp3].filter(Boolean)
      const r = await optimizeLinkedIn(headline, about, experience)
      setResult(r)
      success('LinkedIn profile optimized!')
    } catch (e) {
      toastError(e.message ?? 'Optimization failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = (headline.trim() || about.trim()) && !loading

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-500 border border-gold-500/20">Pro Feature</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">LinkedIn Profile Optimizer</h1>
            <p className="text-white/40 text-sm max-w-xl">Make your profile discoverable to recruiters searching in your field. LinkedIn has its own search algorithm — keyword placement matters.</p>
          </div>

          {!isPro ? (
            <div className="card-dark p-8 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-white font-bold text-xl mb-2">Unlock LinkedIn Optimizer</h2>
              <p className="text-white/50 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                Get your LinkedIn discoverability score, keyword-optimized headline and about section, and the top 5 keywords recruiters search for in your field.
              </p>
              <Link to="/pricing" className="inline-block px-6 py-3 rounded-xl bg-gold-500 text-midnight font-bold text-sm hover:bg-gold-400 transition-colors">
                Upgrade to Pro
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

              {/* Left: inputs */}
              <div className="lg:col-span-2 space-y-4">
                <div className="card-dark p-4">
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Current Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Software Engineer at Acme | React, Node.js"
                    className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/15 transition-colors"
                  />
                </div>

                <div className="card-dark p-4">
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-2">Current About Section</label>
                  <textarea
                    rows={7}
                    value={about}
                    onChange={e => setAbout(e.target.value)}
                    placeholder="Paste your current LinkedIn about section here…"
                    className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 text-sm resize-none focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/15 transition-colors"
                  />
                </div>

                <div className="card-dark p-4">
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider block mb-3">Top 3 Job Descriptions (optional)</label>
                  <div className="space-y-2">
                    {[[exp1, setExp1, 'Most recent role'],[exp2, setExp2, 'Previous role'],[exp3, setExp3, 'Earlier role']].map(([val, setter, placeholder], i) => (
                      <textarea key={i} rows={3} value={val} onChange={e => setter(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 text-xs resize-none focus:outline-none focus:border-gold-500/40 transition-colors" />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleOptimize}
                  disabled={!canSubmit}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: canSubmit ? 'linear-gradient(135deg, #F5C842, #d4a017)' : '#1a1a2e', color: canSubmit ? '#0A0A0F' : 'rgba(255,255,255,0.3)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
                      Optimizing…
                    </span>
                  ) : 'Optimize My LinkedIn Profile'}
                </button>
              </div>

              {/* Right: results */}
              <div className="lg:col-span-3">
                {loading && (
                  <div className="card-dark p-8 flex flex-col items-center justify-center min-h-80 gap-4">
                    <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white/50 text-sm">Analyzing your LinkedIn profile…</p>
                  </div>
                )}

                {!loading && !result && (
                  <div className="card-dark min-h-80 flex flex-col items-center justify-center text-center px-8">
                    <svg className="w-12 h-12 text-white/10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.25">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.25" fill="none" />
                    </svg>
                    <p className="text-white/40 text-sm">Your optimized LinkedIn profile will appear here</p>
                  </div>
                )}

                {!loading && result && (
                  <div className="space-y-6">
                    {/* Score + missing keywords */}
                    <div className="card-dark p-5">
                      <div className="flex items-start gap-6">
                        <ScoreBadge score={result.linkedin_score} />
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm mb-1">Current Discoverability</p>
                          <p className="text-white/40 text-xs mb-3">Before optimization</p>
                          <div>
                            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Missing Keywords</p>
                            <div className="flex flex-wrap gap-1.5">
                              {result.missing_keywords?.map(kw => (
                                <span key={kw} className="text-xs px-2.5 py-1 rounded-full bg-crimson-400/10 text-crimson-400 border border-crimson-400/20">{kw}</span>
                              ))}
                            </div>
                            {result.keyword_sources && (
                              <p className="text-white/30 text-xs mt-2 leading-relaxed">{result.keyword_sources}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Headline */}
                    <div className="card-dark p-5 border-t-2 border-gold-500/30">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-sm">Headline</h3>
                        {result.headline?.optimized && <CopyButton text={result.headline.optimized} />}
                      </div>
                      <DiffView original={result.headline?.original} optimized={result.headline?.optimized} />
                      {result.headline?.changes?.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {result.headline.changes.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-white/45">
                              <span className="text-gold-500 mt-0.5 shrink-0">→</span>{c}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* About */}
                    <div className="card-dark p-5 border-t-2 border-electric-500/30">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-sm">About Section</h3>
                        {result.about?.optimized && <CopyButton text={result.about.optimized} />}
                      </div>
                      <DiffView original={result.about?.original} optimized={result.about?.optimized} />
                      {result.about?.changes?.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {result.about.changes.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-white/45">
                              <span className="text-electric-400 mt-0.5 shrink-0">→</span>{c}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Experience entries */}
                    {result.experience?.map((e, i) => (
                      <div key={i} className="card-dark p-5 border-t-2 border-neon-400/20">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold text-sm">Job Description {i + 1}</h3>
                          {e.optimized && <CopyButton text={e.optimized} />}
                        </div>
                        <DiffView original={e.original} optimized={e.optimized} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
