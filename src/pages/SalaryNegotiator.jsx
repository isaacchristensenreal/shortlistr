import { useState } from 'react'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { generateSalaryEmails } from '../lib/ai'
import { supabase } from '../lib/supabase'

const PRICE = '$4.99'

function InputField({ label, value, onChange, placeholder, type = 'text', prefix, hint, required }) {
  const [focused, setFocused] = useState(false)
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}{required && <span className="ml-1" style={{ color: '#FF4444' }}>*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full text-sm rounded-xl outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: focused ? '1px solid rgba(245,200,66,0.4)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: focused ? '0 0 0 3px rgba(245,200,66,0.06)' : 'none',
            color: 'rgba(255,255,255,0.85)',
            caretColor: '#F5C842',
            padding: prefix ? '10px 14px 10px 28px' : '10px 14px',
          }}
        />
      </div>
      {hint && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>{hint}</p>}
    </div>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
      style={copied
        ? { background: 'rgba(0,255,136,0.12)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.25)' }
        : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
      }
    >
      {copied ? (
        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Copied</>
      ) : (
        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy Email</>
      )}
    </button>
  )
}

const EMAIL_CONFIGS = {
  aggressive: {
    label: 'Aggressive',
    tagline: 'Pushes hard — anchors high, uses leverage',
    accent: '#FF4444',
    icon: '⚡',
  },
  balanced: {
    label: 'Balanced',
    tagline: 'Professional and firm — the proven approach',
    accent: '#F5C842',
    icon: '⚖',
  },
  soft: {
    label: 'Soft Ask',
    tagline: 'Polite and easy to say yes to',
    accent: '#00FF88',
    icon: '✉',
  },
}

const VERDICT_CONFIG = {
  'Below Market': { color: '#00FF88', bg: 'rgba(0,255,136,0.08)', border: 'rgba(0,255,136,0.2)', label: 'You\'re being underpaid', icon: '↑' },
  'At Market':    { color: '#F5C842', bg: 'rgba(245,200,66,0.08)', border: 'rgba(245,200,66,0.2)', label: 'You\'re near market rate', icon: '→' },
  'Above Market': { color: '#FF4444', bg: 'rgba(255,68,68,0.08)', border: 'rgba(255,68,68,0.2)', label: 'Offer is above market', icon: '↓' },
}

export default function SalaryNegotiator() {
  const { user, profile } = useAuth()
  const { success, error: toastError } = useToast()
  const isUnlocked = profile?.salary_negotiator_unlocked === true

  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [offeredSalary, setOfferedSalary] = useState('')
  const [targetSalary, setTargetSalary] = useState('')
  const [yearsExp, setYearsExp] = useState('')
  const [location, setLocation] = useState('')
  const [competingOffer, setCompetingOffer] = useState('')
  const [candidateName, setCandidateName] = useState(profile?.username || '')
  const [companyName, setCompanyName] = useState('')
  const [hiringManager, setHiringManager] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [purchasing, setPurchasing] = useState(false)
  const [activeEmail, setActiveEmail] = useState('balanced')

  const offered = Number(offeredSalary.replace(/,/g, '')) || 0
  const target = Number(targetSalary.replace(/,/g, '')) || 0
  const gap = target - offered
  const canGenerate = role && offeredSalary && targetSalary && !loading

  const handlePurchase = async () => {
    setPurchasing(true)
    try {
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
    if (!canGenerate) return
    setLoading(true)
    try {
      const r = await generateSalaryEmails({
        role,
        offeredSalary: offered,
        targetSalary: target,
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

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Hero ──────────────────────────────────────────────────── */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: 'rgba(245,200,66,0.12)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.2)' }}>
                One-Time Add-On · {PRICE}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
              Stop leaving money<br />
              <span style={{ color: '#F5C842' }}>on the table.</span>
            </h1>
            <p className="text-base max-w-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              ChatGPT gives you a generic template. This generates three ready-to-send emails
              personalized to your exact offer, role, market, and negotiating position — with a market
              rate analysis so you know exactly where you stand.
            </p>
          </div>

          {/* ── What you get (teaser cards) ────────────────────────────── */}
          {!isUnlocked && (
            <div className="grid grid-cols-3 gap-3 mb-8">
              {Object.entries(EMAIL_CONFIGS).map(([key, cfg]) => (
                <div key={key} className="rounded-xl p-4 relative overflow-hidden" style={{ background: '#13131A', border: `1px solid ${cfg.accent}20` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">{cfg.icon}</span>
                    <span className="text-xs font-bold" style={{ color: cfg.accent }}>{cfg.label}</span>
                  </div>
                  {/* Blurred fake email preview */}
                  <div className="space-y-1.5" style={{ filter: 'blur(3px)', userSelect: 'none', pointerEvents: 'none' }}>
                    <div className="h-2 rounded-full w-3/4" style={{ background: 'rgba(255,255,255,0.12)' }} />
                    <div className="h-2 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="h-2 rounded-full w-5/6" style={{ background: 'rgba(255,255,255,0.08)' }} />
                    <div className="h-2 rounded-full w-2/3" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-2 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <div className="h-2 rounded-full w-4/5" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(10,10,15,0.5)' }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={cfg.accent} strokeWidth="2" style={{ opacity: 0.6 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Paywall ───────────────────────────────────────────────── */}
          {!isUnlocked && (
            <div className="rounded-2xl p-8 mb-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #16140a 0%, #13131A 100%)', border: '1px solid rgba(245,200,66,0.2)' }}>
              {/* Subtle gold glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(245,200,66,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

              <div className="relative flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(245,200,66,0.6)' }}>Permanently unlocked on your account</p>
                  <h2 className="text-2xl font-black text-white mb-3">Salary Negotiation Emails</h2>
                  <ul className="space-y-2.5 mb-0">
                    {[
                      ['3 personalized email styles', 'Aggressive, Balanced, and Soft — pick your style'],
                      ['Market rate analysis', 'Know exactly if your offer is fair before you respond'],
                      ['Unlimited regenerations', 'Tweak inputs and regenerate as many times as you need'],
                      ['Personalized, not templated', 'Uses your name, role, company, and competing offers'],
                    ].map(([title, desc]) => (
                      <li key={title} className="flex items-start gap-3">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0" style={{ background: 'rgba(0,255,136,0.15)' }}>
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#00FF88" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white">{title}</span>
                          <span className="text-sm ml-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>— {desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="shrink-0 text-center">
                  <div className="mb-5">
                    <div className="text-5xl font-black" style={{ color: '#F5C842' }}>$4.99</div>
                    <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>one-time · no subscription</div>
                  </div>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full px-8 py-3.5 rounded-xl font-black text-sm transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 8px 32px rgba(245,200,66,0.35)' }}
                  >
                    {purchasing ? (
                      <span className="flex items-center gap-2 justify-center">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Redirecting…
                      </span>
                    ) : `Unlock for ${PRICE}`}
                  </button>
                  <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    🔒 Secured by Stripe
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Form + Results ─────────────────────────────────────────── */}
          <div className={!isUnlocked ? 'opacity-30 pointer-events-none select-none' : ''}>

            {/* Step 1 — Form */}
            {step === 1 && (
              <div>
                {/* Live gap calculation */}
                {offered > 0 && target > 0 && (
                  <div className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4 flex-wrap" style={{ background: gap > 0 ? 'rgba(0,255,136,0.06)' : 'rgba(255,68,68,0.06)', border: `1px solid ${gap > 0 ? 'rgba(0,255,136,0.15)' : 'rgba(255,68,68,0.15)'}` }}>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>You're asking for</p>
                      <p className="text-2xl font-black" style={{ color: gap > 0 ? '#00FF88' : '#FF4444' }}>
                        {gap > 0 ? '+' : ''}{gap > 0 ? `$${gap.toLocaleString()} more` : 'less than offered'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Offered</p>
                      <p className="text-lg font-bold text-white">${offered.toLocaleString()}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Target</p>
                      <p className="text-lg font-bold" style={{ color: '#F5C842' }}>${target.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl overflow-hidden" style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {/* Sections */}
                  <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>About You</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField label="Your Name" value={candidateName} onChange={setCandidateName} placeholder="Jane Smith" />
                      <InputField label="Role Title" value={role} onChange={setRole} placeholder="Senior Product Manager" required />
                    </div>
                  </div>

                  <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>The Offer</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Acme Corp" />
                      <InputField label="Hiring Manager" value={hiringManager} onChange={setHiringManager} placeholder="Alex Johnson (optional)" />
                      <InputField label="Offered Salary" value={offeredSalary} onChange={setOfferedSalary} placeholder="95,000" prefix="$" required />
                      <InputField label="Your Target Salary" value={targetSalary} onChange={setTargetSalary} placeholder="115,000" prefix="$" required />
                      <InputField label="Years of Experience" value={yearsExp} onChange={setYearsExp} placeholder="7" />
                      <InputField label="Location" value={location} onChange={setLocation} placeholder="San Francisco, CA" />
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Competing Offer</p>
                    <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.2)' }}>Having another offer dramatically strengthens your position. Leave blank if none.</p>
                    <InputField label="" value={competingOffer} onChange={setCompetingOffer} placeholder="110,000 (optional)" prefix="$" />
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="w-full mt-4 rounded-xl font-black text-sm transition-all disabled:cursor-not-allowed"
                  style={{
                    padding: '15px 24px',
                    background: canGenerate ? 'linear-gradient(135deg, #F5C842, #d4a017)' : 'rgba(255,255,255,0.04)',
                    color: canGenerate ? '#0A0A0F' : 'rgba(255,255,255,0.2)',
                    border: canGenerate ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: canGenerate ? '0 8px 32px rgba(245,200,66,0.25)' : 'none',
                    opacity: !canGenerate ? 0.5 : 1,
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Writing your emails…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Generate My Negotiation Emails
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Step 2 — Results */}
            {step === 2 && result && (
              <div className="space-y-6">

                {/* Market analysis */}
                {result.market_analysis && (() => {
                  const cfg = VERDICT_CONFIG[result.market_analysis.verdict] ?? VERDICT_CONFIG['At Market']
                  const range = result.market_analysis.estimated_market_range
                  return (
                    <div className="rounded-2xl p-6" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shrink-0" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <span className="text-base font-black" style={{ color: cfg.color }}>{result.market_analysis.verdict}</span>
                            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{cfg.label}</span>
                          </div>
                          <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{result.market_analysis.explanation}</p>
                          {range && (
                            <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                              <span>Market range:</span>
                              <span className="font-black" style={{ color: cfg.color }}>${range.min?.toLocaleString()} – ${range.max?.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Email selector tabs */}
                <div>
                  <div className="flex gap-2 mb-4">
                    {Object.entries(EMAIL_CONFIGS).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => setActiveEmail(key)}
                        className="flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all"
                        style={activeEmail === key
                          ? { background: `${cfg.accent}15`, color: cfg.accent, border: `1px solid ${cfg.accent}35` }
                          : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }
                        }
                      >
                        <span className="mr-1.5">{cfg.icon}</span>
                        <span className="hidden sm:inline">{cfg.label}</span>
                        <span className="sm:hidden">{cfg.label.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active email */}
                  {Object.entries(EMAIL_CONFIGS).map(([key, cfg]) => {
                    if (key !== activeEmail) return null
                    const email = result.emails?.[key]
                    if (!email) return null
                    return (
                      <div key={key} className="rounded-2xl overflow-hidden" style={{ background: '#13131A', border: `1px solid ${cfg.accent}20` }}>
                        {/* Email chrome */}
                        <div className="px-5 py-4 flex items-center justify-between gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Subject</p>
                            <p className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{email.subject}</p>
                          </div>
                          <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} />
                        </div>
                        {/* Email body */}
                        <div className="p-5">
                          <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>{cfg.tagline}</p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.75)' }}>{email.body}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                >
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
