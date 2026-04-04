import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { startCheckout } from '../lib/stripe'

/* ─── Shared Components ──────────────────────────────────────────────────── */
function StarRating() {
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="#F5C842">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const valueStack = [
  { label: 'ATS Resume Scanner', desc: 'See your exact score vs. any job description', value: '$29/mo' },
  { label: 'AI Resume Rewriter', desc: 'Keyword-optimized in 90 seconds', value: '$49/mo' },
  { label: 'Cover Letter Generator', desc: 'Tailored to every job posting', value: '$19/mo' },
  { label: 'Before/After Scorecard', desc: 'Shareable PNG of your improvement', value: '$9/mo' },
  { label: 'Rejection Reason Report', desc: 'Exactly why ATS rejected you', value: '$19/mo' },
]

const proFeatures = [
  'Unlimited ATS resume scans',
  'AI resume rewriting',
  'Cover letter generation',
  'Rejection reason reports',
  'Before/after scorecard',
  'Priority support',
]

const faqs = [
  {
    q: 'Do I need a credit card to try it?',
    a: 'No. Your first ATS scan is completely free. No card, no commitment. You see your score and what\'s wrong before you decide to pay anything.',
  },
  {
    q: 'What if it doesn\'t work for me?',
    a: "If your ATS score doesn't improve after using Shortlistr, email us within 30 days and we'll refund your first month immediately. That's our guarantee.",
  },
  {
    q: 'How is Shortlistr different from free resume checkers?',
    a: "Free tools tell you what's wrong. Shortlistr fixes it — rewriting your resume with optimized keywords, restructuring sections ATS can't read, and generating a cover letter tailored to the job. It's the difference between a diagnosis and a cure.",
  },
  {
    q: 'Will my resume still sound like me?',
    a: 'Yes. The AI rewrites for ATS optimization while keeping your voice, your experience, and your achievements. You review everything before downloading — nothing goes out without your approval.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel in one click from your account page. No cancellation fees, no emails to send, no hoops to jump through. You keep access through the end of your billing period.',
  },
]

const testimonials = [
  {
    outcome: 'Got 3 callbacks the week after using Shortlistr.',
    quote: 'Applied to the same companies twice — completely different results.',
    name: 'Marcus T.',
    role: 'Software Engineer',
    result: '41 → 88 ATS Score',
  },
  {
    outcome: 'Had a recruiter call me the morning after I used it.',
    quote: "Spent 3 months applying with the same resume. Used Shortlistr once and heard back the next day.",
    name: 'Sarah K.',
    role: 'Operations Analyst · Austin, TX',
    result: 'Interview in 9 days',
  },
]

/* ─── FAQ Accordion ──────────────────────────────────────────────────────── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={open}>
        <span className="text-sm font-semibold text-white pr-4">{q}</span>
        <svg className="w-4 h-4 shrink-0 transition-transform" style={{ color: 'rgba(255,255,255,0.4)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-sm leading-relaxed pt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{a}</p>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Pricing() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isPro = profile?.tier === 'pro'
  const [loading, setLoading] = useState(null)
  const [checkoutError, setCheckoutError] = useState(null)

  const handleCheckout = async (billing) => {
    if (!user) { navigate('/auth?mode=signup'); return }
    if (isPro && billing !== 'salary') { navigate('/dashboard'); return }
    setLoading(billing)
    setCheckoutError(null)
    try {
      await startCheckout(user.id, user.email, billing)
    } catch {
      setCheckoutError('Could not start checkout. Please try again.')
      setLoading(null)
    }
  }

  const ctaHref = '/auth?mode=signup'

  return (
    <Layout>
      <div style={{ background: '#0A0A0F' }}>

        {/* ── HERO ── */}
        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs font-semibold"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: 'rgba(255,255,255,0.7)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3B82F6' }} />
              First scan free. No credit card required.
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight leading-tight">
              One price. Everything included.<br />Cancel anytime.
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              No tiers. No paywalled features. No gotchas. $10/month gets you every tool Shortlistr has.
            </p>
          </div>
        </section>

        {/* ── VALUE STACK ── */}
        <section style={{ background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3B82F6' }}>The value equation</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Here's what $10/month actually gets you:</h2>
            </div>
            <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {valueStack.map((item, i) => (
                <div key={item.label} className="flex items-center justify-between px-5 py-4"
                  style={{
                    background: i % 2 === 0 ? '#13131A' : 'rgba(255,255,255,0.02)',
                    borderBottom: i < valueStack.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.desc}</p>
                  </div>
                  <span className="text-sm line-through shrink-0 ml-4" style={{ color: 'rgba(255,255,255,0.25)' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-5 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.08), rgba(245,200,66,0.04))', border: '1px solid rgba(245,200,66,0.2)' }}>
              <p className="text-lg font-black text-white mb-0.5">Everything above: <span style={{ color: '#F5C842' }}>$10/month</span></p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>That's less than a Spotify subscription.</p>
            </div>
          </div>
        </section>

        {/* ── PRICING CARDS ── */}
        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#F5C842' }}>Choose your plan</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Same features. Both options.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

              {/* Monthly */}
              <div className="rounded-2xl p-6 flex flex-col" style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Shortlistr Pro — Monthly</p>
                <div className="mb-1">
                  <span className="text-5xl font-black text-white">$10</span>
                  <span className="text-sm ml-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>/month</span>
                </div>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Cancel anytime. No contracts. No hidden fees.</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {proFeatures.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <span style={{ color: '#00FF88' }}><CheckIcon /></span>{f}
                    </li>
                  ))}
                </ul>
                {checkoutError && <p className="text-red-400 text-xs text-center mb-3">{checkoutError}</p>}
                <button
                  onClick={() => handleCheckout('monthly')}
                  disabled={!!loading || isPro}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  style={{ border: '1px solid rgba(245,200,66,0.4)', color: '#F5C842', background: 'rgba(245,200,66,0.05)' }}>
                  {loading === 'monthly' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
                      Redirecting…
                    </span>
                  ) : isPro ? 'You\'re on Pro ✓' : !user ? 'Start free — upgrade when ready →' : 'Upgrade to Pro — $10/mo'}
                </button>
                <p className="text-[11px] text-center mt-2.5" style={{ color: 'rgba(255,255,255,0.25)' }}>First scan is always free. No card required.</p>
              </div>

              {/* Lifetime */}
              <div className="rounded-2xl p-6 flex flex-col relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #1a1408 0%, #13131A 60%)', border: '1px solid rgba(245,200,66,0.3)' }}>
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ background: '#F5C842', color: '#0A0A0F' }}>Best Value</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#F5C842' }}>Shortlistr Pro — Lifetime</p>
                <div className="mb-0.5">
                  <span className="text-5xl font-black text-white">$149</span>
                  <span className="text-sm ml-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>once</span>
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#00FF88' }}>Pay once. Use forever. Save 57%.</p>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>No subscriptions, no renewals, no surprises.</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {proFeatures.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <span style={{ color: '#F5C842' }}><CheckIcon /></span>{f}
                    </li>
                  ))}
                </ul>
                {checkoutError && <p className="text-red-400 text-xs text-center mb-3">{checkoutError}</p>}
                <button
                  onClick={() => handleCheckout('lifetime')}
                  disabled={!!loading || isPro}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}>
                  {loading === 'lifetime' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      Redirecting…
                    </span>
                  ) : isPro ? 'You\'re on Pro ✓' : !user ? 'Get Lifetime Access — $149' : 'Get Lifetime Access — $149'}
                </button>
                <p className="text-[11px] text-center mt-2.5" style={{ color: 'rgba(255,255,255,0.25)' }}>One payment. No expiry. Yours forever.</p>
              </div>
            </div>

            {/* Testimonials — 2 condensed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {testimonials.map(t => (
                <figure key={t.name} className="rounded-2xl p-5" style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <StarRating />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.2)' }}>{t.result}</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{t.outcome}</p>
                  <blockquote className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>"{t.quote}"</blockquote>
                  <figcaption className="text-xs font-semibold text-white">{t.name} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>— {t.role}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── GUARANTEE — large, impossible to miss ── */}
        <section style={{ background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0c1a0b 0%, #13131A 50%, #0a0f1a 100%)', border: '2px solid rgba(0,255,136,0.25)', boxShadow: '0 0 60px rgba(0,255,136,0.05)' }}>
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.08) 0%, transparent 65%)' }} />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                  style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)' }}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#00FF88" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#00FF88' }}>Zero-risk guarantee</p>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-5 leading-tight">
                  Your score goes up.<br />Or it's free.
                </h2>
                <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  If your ATS score doesn't improve after using Shortlistr, email us within 30 days and we'll refund your first month immediately. One email. No forms. No questions.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold">
                  {['No questions asked', '30-day window', 'Instant refund', 'One email to claim'].map(item => (
                    <span key={item} className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <span style={{ color: '#00FF88' }}>✓</span> {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3B82F6' }}>FAQ</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Questions you probably have.</h2>
            </div>
            <div className="space-y-3">
              {faqs.map(faq => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 leading-tight">
              Less than a coffee a week<br />to stop getting rejected.
            </h2>
            <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Your first scan is free. See your score before you pay a cent.
            </p>
            <Link to={ctaHref}>
              <button className="px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-100 mb-3"
                style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 12px 40px rgba(245,200,66,0.35)' }}>
                Get started free →
              </button>
            </Link>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              No credit card required · 30-day money-back guarantee
            </p>
          </div>
        </section>

      </div>
    </Layout>
  )
}
