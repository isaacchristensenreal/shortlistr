import { useState } from 'react'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { generateSalaryEmails } from '../lib/ai'
import { supabase } from '../lib/supabase'
import { startCheckout } from '../lib/stripe'

const PRICE = '$4.99'

function CopyButton({ text, label = 'Copy Email' }) {
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
        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>{label}</>
      )}
    </button>
  )
}

const EMAIL_STYLES = {
  aggressive: { label: 'Aggressive', desc: 'Pushes hard for your target number', color: 'border-crimson-400/30', badge: 'bg-crimson-400/15 text-crimson-400' },
  balanced:   { label: 'Balanced',   desc: 'Professional and firm',             color: 'border-gold-500/30',   badge: 'bg-gold-500/15 text-gold-500' },
  soft:       { label: 'Soft',       desc: 'Polite ask, easy for employer',     color: 'border-electric-500/30', badge: 'bg-electric-500/15 text-electric-400' },
}

export default function SalaryNegotiator() {
  const { user, profile } = useAuth()
  const { success, error: toastError } = useToast()
  const isUnlocked = profile?.salary_negotiator_unlocked === true

  // Step state
  const [step, setStep] = useState(1)

  // Form fields
  const [role, setRole] = useState('')
  const [offeredSalary, setOfferedSalary] = useState('')
  const [targetSalary, setTargetSalary] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [location, setLocation] = useState('')
  const [competingOffer, setCompetingOffer] = useState('')
  const [candidateName, setCandidateName] = useState(profile?.username || '')
  const [companyName, setCompanyName] = useState('')
  const [hiringManager, setHiringManager] = useState('')

  // Results
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // Stripe
  const [purchasing, setPurchasing] = useState(false)

  const handlePurchase = async () => {
    setPurchasing(true)
    try {
      // Create one-time payment intent for salary negotiator add-on
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          userId: user?.id,
          userEmail: user?.email,
          mode: 'salary_addon',
          priceId: import.meta.env.VITE_STRIPE_SALARY_PRICE_ID,
          successUrl: `${window.location.origin}/salary-negotiator?unlocked=1`,
        },
      })
      if (error) throw new Error(error.message)
      if (data?.url) window.location.href = data.url
    } catch (e) {
      toastError('Could not start checkout. Please try again.')
      setPurchasing(false)
    }
  }

  const handleGenerate = async () => {
    if (!role || !offeredSalary || !targetSalary) return
    setLoading(true)
    try {
      const r = await generateSalaryEmails({
        role,
        offeredSalary: Number(offeredSalary.replace(/,/g, '')),
        targetSalary: Number(targetSalary.replace(/,/g, '')),
        yearsExperience: yearsExp,
        location,
        competingOffer: competingOffer ? Number(competingOffer.replace(/,/g, '')) : null,
        candidateName,
        companyName,
        hiringManagerName: hiringManager,
      })
      setResult(r)
      setStep(2)
      success('Your negotiation emails are ready!')
    } catch (e) {
      toastError(e.message ?? 'Generation failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const canGenerate = role && offeredSalary && targetSalary && !loading

  const VERDICT_STYLES = {
    'Below Market': { color: 'text-neon-400', bg: 'bg-neon-400/10 border-neon-400/20', icon: '↑' },
    'At Market':    { color: 'text-gold-500',  bg: 'bg-gold-500/10 border-gold-500/20',  icon: '→' },
    'Above Market': { color: 'text-crimson-400', bg: 'bg-crimson-400/10 border-crimson-400/20', icon: '↓' },
  }

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Salary Negotiation Email Generator</h1>
            <p className="text-white/40 text-sm">Get three personalized negotiation emails — Aggressive, Balanced, and Soft — tailored to your exact situation.</p>
          </div>

          {/* Paywall */}
          {!isUnlocked && (
            <div className="card-dark p-6 mb-8 border-gold-500/20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-white font-bold text-xl mb-1">Salary Negotiation Add-On</h2>
              <p className="text-white/50 text-sm mb-1">One-time purchase — unlocks permanently on your account.</p>
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-gold-500 font-black text-4xl">{PRICE}</span>
                <span className="text-white/30 text-sm">one time</span>
              </div>
              <ul className="space-y-1.5 mb-6 max-w-xs mx-auto text-left">
                {[
                  '3 personalized negotiation email styles',
                  'Market rate analysis for your role + location',
                  'Unlimited regenerations',
                  'Permanently unlocked on your account',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="text-neon-400 mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="px-8 py-3 rounded-xl font-bold text-sm bg-gold-500 text-midnight hover:bg-gold-400 transition-colors disabled:opacity-50"
              >
                {purchasing ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />Redirecting…</span>
                ) : `Unlock for ${PRICE}`}
              </button>
              <p className="text-white/20 text-xs mt-3">Processed securely by Stripe</p>
            </div>
          )}

          {/* Step 1: Form */}
          <div className={!isUnlocked ? 'opacity-40 pointer-events-none select-none' : ''}>
            {step === 1 && (
              <div className="card-dark p-6 space-y-5">
                <h2 className="text-white font-semibold text-base">Step 1 — Your offer details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Your Name</label>
                    <input type="text" value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Jane Smith"
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-gold-500/40 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Role Title <span className="text-crimson-400">*</span></label>
                    <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="Senior Product Manager"
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-gold-500/40 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Company Name</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Corp"
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-gold-500/40 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Hiring Manager (optional)</label>
                    <input type="text" value={hiringManager} onChange={e => setHiringManager(e.target.value)} placeholder="Alex Johnson"
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-gold-500/40 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Offered Salary <span className="text-crimson-400">*</span></label>
                    <input type="text" value={offeredSalary} onChange={e => setOfferedSalary(e.target.value)} placeholder="95,000"
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-gold-500/40 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Your Target Salary <span className="text-crimson-400">*</span></label>
                    <input type="text" value={targetSalary} onChange={e => setTargetSalary(e.target.value)} placeholder="115,000"
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-gold-500/40 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Years of Experience</label>
                    <input type="text" value={yearsExp} onChange={e => setYearsExp(e.target.value)} placeholder="7"
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-gold-500/40 transition-colors" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="San Francisco, CA"
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-gold-500/40 transition-colors" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">Competing Offer (optional — strengthens ask)</label>
                    <input type="text" value={competingOffer} onChange={e => setCompetingOffer(e.target.value)} placeholder="110,000"
                      className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-gold-500/40 transition-colors" />
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ background: canGenerate ? 'linear-gradient(135deg, #F5C842, #d4a017)' : '#1a1a2e', color: canGenerate ? '#0A0A0F' : 'rgba(255,255,255,0.3)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
                      Generating your emails…
                    </span>
                  ) : 'Generate My Negotiation Emails →'}
                </button>
              </div>
            )}

            {/* Step 2: Results */}
            {step === 2 && result && (
              <div className="space-y-6">
                {/* Market analysis */}
                {result.market_analysis && (() => {
                  const v = VERDICT_STYLES[result.market_analysis.verdict] ?? VERDICT_STYLES['At Market']
                  return (
                    <div className={`card-dark p-5 border ${v.bg}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-2xl font-black ${v.color}`}>{v.icon}</span>
                        <div>
                          <p className={`font-bold text-sm ${v.color}`}>{result.market_analysis.verdict}</p>
                          <p className="text-white/40 text-xs">
                            Market range: ${result.market_analysis.estimated_market_range?.min?.toLocaleString()} – ${result.market_analysis.estimated_market_range?.max?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-white/60 text-sm">{result.market_analysis.explanation}</p>
                    </div>
                  )
                })()}

                {/* Emails */}
                {Object.entries(EMAIL_STYLES).map(([key, style]) => {
                  const email = result.emails?.[key]
                  if (!email) return null
                  return (
                    <div key={key} className={`card-dark p-5 border-t-2 ${style.color}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badge}`}>{style.label}</span>
                          <span className="text-white/35 text-xs">{style.desc}</span>
                        </div>
                        <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} />
                      </div>
                      <div className="card-dark p-4 bg-white/2 space-y-2">
                        <p className="text-white/50 text-xs"><span className="text-white/30 uppercase tracking-wider font-semibold">Subject:</span> {email.subject}</p>
                        <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">{email.body}</p>
                      </div>
                    </div>
                  )
                })}

                <button onClick={() => setStep(1)} className="w-full py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:border-white/20 hover:text-white/80 transition-all">
                  ← Edit Details & Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
