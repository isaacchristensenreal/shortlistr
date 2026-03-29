import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { startCheckout } from '../lib/stripe'

const FREE_FEATURES = [
  { label: '3 scans per month', yes: true },
  { label: 'ATS keyword analysis', yes: true },
  { label: 'Hiring Probability Score', yes: true },
  { label: 'Optimized resume download', yes: true },
  { label: 'Rejection reason analysis', yes: false },
  { label: 'Interview question predictor', yes: false },
  { label: 'ATS company detector', yes: false },
  { label: 'Cover letter generator', yes: false },
  { label: 'LinkedIn profile optimizer', yes: false },
  { label: 'Job match recommendations', yes: false },
]

const PRO_FEATURES = [
  { label: 'Unlimited scans', yes: true },
  { label: 'ATS keyword analysis', yes: true },
  { label: 'Hiring Probability Score', yes: true },
  { label: 'Optimized resume download', yes: true },
  { label: 'Rejection reason analysis', yes: true, highlight: true },
  { label: 'Interview question predictor', yes: true, highlight: true },
  { label: 'ATS company detector', yes: true, highlight: true },
  { label: 'Cover letter generator', yes: true, highlight: true },
  { label: 'LinkedIn profile optimizer', yes: true, highlight: true },
  { label: 'Job match recommendations', yes: true, highlight: true },
]

const SALARY_FEATURES = [
  { label: '3 email styles (Aggressive, Balanced, Soft)', yes: true },
  { label: 'Market rate analysis', yes: true },
  { label: 'Personalized to your situation', yes: true },
  { label: 'Unlimited regenerations', yes: true },
  { label: 'Permanently unlocked on your account', yes: true },
]

const FAQS = [
  { q: 'Can I cancel Pro anytime?', a: 'Yes. Cancel from Settings at any time. You keep Pro access through the end of your billing period.' },
  { q: 'What counts as one scan?', a: 'Each time you submit a resume + job description pair for AI analysis, that counts as one scan.' },
  { q: 'Is the salary negotiator a separate purchase?', a: 'Yes — it\'s a one-time $4.99 add-on that permanently unlocks on your account, separate from the Pro subscription.' },
  { q: 'Is my resume data private?', a: 'Your resumes are stored securely and are never shared with third parties or used to train AI models.' },
  { q: 'Do I need Pro to use the salary negotiator?', a: 'No — the salary negotiator is a standalone add-on available to any user regardless of plan.' },
]

function Check() {
  return (
    <svg className="w-4 h-4 text-neon-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function X() {
  return (
    <svg className="w-4 h-4 text-white/20 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function Pricing() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isPro = profile?.tier === 'pro'
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)

  useEffect(() => {
    if (isPro) navigate('/dashboard', { replace: true })
  }, [isPro, navigate])

  const handleProCTA = async () => {
    if (!user) { navigate('/auth?mode=signup'); return }
    if (isPro) { navigate('/dashboard'); return }
    setLoading(true)
    setCheckoutError(null)
    try {
      await startCheckout(user.id, user.email)
    } catch {
      setCheckoutError('Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  const freeCTA = !user
    ? { label: 'Get Started Free', action: () => navigate('/auth?mode=signup') }
    : { label: 'Go to Dashboard', action: () => navigate('/dashboard') }

  return (
    <Layout>
      <div style={{ background: '#0A0A0F' }} className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">

          {/* Hero */}
          <div className="text-center mb-14">
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              Stop Getting Rejected.<br />
              <span style={{ background: 'linear-gradient(135deg, #F5C842, #fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Start Getting Interviews.
              </span>
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Start free. Upgrade when you're ready for the full job search intelligence platform.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 max-w-5xl mx-auto">

            {/* Free */}
            <div className="rounded-2xl p-6 flex flex-col border" style={{ background: '#13131A', borderColor: '#1E1E2E' }}>
              <div className="mb-5">
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Free</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-white font-black text-4xl">$0</span>
                  <span className="text-white/30 text-sm">/forever</span>
                </div>
                <p className="text-white/40 text-sm">For occasional job seekers</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {FREE_FEATURES.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    {f.yes ? <Check /> : <X />}
                    <span className={`text-sm ${f.yes ? 'text-white/70' : 'text-white/25 line-through'}`}>{f.label}</span>
                  </li>
                ))}
              </ul>
              <button onClick={freeCTA.action}
                className="w-full py-3 rounded-xl border border-white/10 text-white/60 font-semibold text-sm hover:border-white/20 hover:text-white/80 transition-all">
                {freeCTA.label}
              </button>
            </div>

            {/* Pro — featured */}
            <div className="rounded-2xl p-6 flex flex-col relative overflow-hidden border border-gold-500/30"
              style={{ background: 'linear-gradient(160deg, #1a1408 0%, #13131A 60%, #0f0f18 100%)' }}>
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold-500 text-midnight">Most Popular</span>
              </div>
              <div className="mb-5">
                <p className="text-gold-500 text-xs font-bold uppercase tracking-wider mb-2">Pro</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-white font-black text-4xl">$10</span>
                  <span className="text-white/30 text-sm">/month</span>
                </div>
                <p className="text-white/40 text-sm">For active job seekers</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {PRO_FEATURES.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    <Check />
                    <span className={`text-sm ${f.highlight ? 'text-gold-500 font-medium' : 'text-white/70'}`}>{f.label}</span>
                  </li>
                ))}
              </ul>
              {checkoutError && <p className="text-crimson-400 text-xs text-center mb-3">{checkoutError}</p>}
              <button onClick={handleProCTA} disabled={loading || isPro}
                className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />Redirecting…</span>
                ) : isPro ? 'You\'re on Pro ✓' : !user ? 'Start Pro — $10/mo' : 'Upgrade to Pro — $10/mo'}
              </button>
            </div>

            {/* Salary Add-on */}
            <div className="rounded-2xl p-6 flex flex-col border" style={{ background: '#13131A', borderColor: '#1E1E2E' }}>
              <div className="mb-5">
                <p className="text-electric-400 text-xs font-bold uppercase tracking-wider mb-2">Salary Add-On</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-white font-black text-4xl">$4.99</span>
                  <span className="text-white/30 text-sm">one-time</span>
                </div>
                <p className="text-white/40 text-sm">Permanently unlocked</p>
              </div>
              <ul className="space-y-2.5 mb-8 flex-1">
                {SALARY_FEATURES.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5">
                    <Check />
                    <span className="text-white/70 text-sm">{f.label}</span>
                  </li>
                ))}
              </ul>
              {user ? (
                <Link to="/salary-negotiator"
                  className="w-full py-3 rounded-xl border border-electric-500/30 bg-electric-500/8 text-electric-400 font-semibold text-sm text-center hover:bg-electric-500/15 transition-all block">
                  Get Salary Tool →
                </Link>
              ) : (
                <button onClick={() => navigate('/auth?mode=signup')}
                  className="w-full py-3 rounded-xl border border-electric-500/30 bg-electric-500/8 text-electric-400 font-semibold text-sm hover:bg-electric-500/15 transition-all">
                  Get Started Free First
                </button>
              )}
            </div>
          </div>

          {/* Testimonial */}
          <div className="max-w-2xl mx-auto mb-14">
            <div className="rounded-2xl p-7 border border-gold-500/15 text-center relative"
              style={{ background: 'linear-gradient(160deg, #1a1408 0%, #13131A 100%)' }}>
              <div className="flex justify-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-gold-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-white/80 text-lg font-medium leading-relaxed mb-4">
                "I went from zero callbacks to three interviews in two weeks after fixing the issues Shortlistr found. The rejection reason analysis showed me exactly what was wrong with my resume — things I never would have caught on my own."
              </blockquote>
              <div>
                <p className="text-white font-semibold text-sm">Marcus T.</p>
                <p className="text-white/40 text-xs">Product Manager · Chicago, IL</p>
              </div>
            </div>
          </div>

          {/* Money-back guarantee */}
          <div className="flex justify-center mb-14">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-neon-400/20 bg-neon-400/5">
              <svg className="w-6 h-6 text-neon-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-white font-semibold text-sm">30-day money-back guarantee</p>
                <p className="text-white/40 text-xs">If you don't see the value, we'll refund you. No questions asked.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently asked questions</h2>
            <div className="space-y-3">
              {FAQS.map(faq => (
                <div key={faq.q} className="rounded-2xl p-5 border" style={{ background: '#13131A', borderColor: '#1E1E2E' }}>
                  <h3 className="text-white font-semibold text-sm mb-1.5">{faq.q}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
