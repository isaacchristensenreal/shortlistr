import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, ChevronDown, ShieldCheck, Zap, ArrowRight, Users,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { startCheckout } from '../lib/stripe'

const EASE_OUT = [0.23, 1, 0.32, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE_OUT } },
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const valueStack = [
  { label: 'Unlimited client workspaces',  desc: 'Named, organized — one per client',               value: '$19/mo' },
  { label: 'ATS scanning per resume',       desc: 'Score vs. any job description, instant',           value: '$39/mo' },
  { label: 'AI resume rewriting',           desc: 'Keyword-optimized bullets in 90 seconds',          value: '$49/mo' },
  { label: 'Cover letter generation',       desc: 'Tailored to every job posting',                    value: '$19/mo' },
  { label: 'Before/after scorecards',       desc: 'Client-ready export with improvement stats',       value: '$9/mo'  },
  { label: 'LinkedIn profile optimizer',    desc: 'Headline, summary, and keyword pass',              value: '$15/mo' },
]

const proFeatures = [
  'Unlimited client workspaces',
  'Unlimited ATS resume scans',
  'AI resume rewriting & optimization',
  'Cover letter generation per job posting',
  'Before / after client scorecards',
  'LinkedIn profile optimizer',
  'Priority support',
]

const faqs = [
  {
    q: 'How many clients can I add?',
    a: 'Unlimited. There are no per-client fees, no seat limits, and no tiers based on how many workspaces you create. One flat price covers your entire practice.',
  },
  {
    q: 'Can my clients see their own workspace?',
    a: "You control that. You can work entirely on your end — clients never see the tool — or you can share specific exports (scorecards, rewritten resumes) with them directly. There's no client-facing login required.",
  },
  {
    q: 'Is the $99/mo per client or per practice?',
    a: 'Per practice. One subscription covers everything — every client workspace, every resume scan, every cover letter, every scorecard. You pay once, use it for every client you have.',
  },
  {
    q: "What if a client's resume score doesn't improve?",
    a: "That's covered by our guarantee. If any client's ATS score doesn't improve after using Shortlistr, email us within 30 days and we'll refund your next month immediately. No forms. No questions.",
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel in one click from your account page. No cancellation fees, no emails to send, no hoops. You keep access through the end of your billing period.',
  },
]

/* ─── FAQ Accordion ──────────────────────────────────────────────────────── */

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors"
        style={{ background: open ? '#fafbfc' : '#ffffff' }}
        aria-expanded={open}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = '#fafbfc' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = '#ffffff' }}
      >
        <span className="text-sm font-semibold pr-4" style={{ color: '#0a0b0d' }}>{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="shrink-0"
        >
          <ChevronDown size={16} style={{ color: '#94a3b8' }} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 pb-5" style={{ borderTop: '1px solid #e5e7eb' }}>
              <p className="text-sm leading-relaxed pt-4" style={{ color: '#475569' }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function Pricing() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isPro = profile?.tier === 'pro'
  const [loading, setLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)

  const handleCheckout = async () => {
    if (!user) { navigate('/auth?mode=signup'); return }
    if (isPro) { navigate('/dashboard'); return }
    setLoading(true)
    setCheckoutError(null)
    try {
      await startCheckout(user.id, user.email, 'monthly')
    } catch {
      setCheckoutError('Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Layout>
      <Helmet>
        <title>ShortListr Pricing — $99/month for Career Coaches</title>
        <meta name="description" content="ShortListr for Coaches is $99/month. Unlimited clients, ATS scanning, AI resume rewriting, cover letter generation, and before/after scorecards. One price. Everything included." />
        <link rel="canonical" href="https://shortlistr.us/pricing" />
        <meta property="og:url" content="https://shortlistr.us/pricing" />
        <meta property="og:title" content="ShortListr Pricing — $99/month for Career Coaches" />
        <meta property="og:description" content="One workspace for every client. Unlimited ATS scans, AI rewrites, cover letters, and scorecards — $99/month per practice." />
      </Helmet>

      <div style={{ background: '#ffffff' }}>

        {/* ── HERO ── */}
        <section style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs font-semibold"
                style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#3b82f6' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#3b82f6' }} />
                14-day free trial. No credit card required.
              </div>
              <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight leading-tight" style={{ color: '#0a0b0d' }}>
                One price. Every tool.<br />Unlimited clients.
              </h1>
              <p className="text-lg max-w-xl mx-auto" style={{ color: '#475569' }}>
                No tiers, no per-client fees, no paywalled features. $99/month runs your entire practice.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── VALUE STACK ── */}
        <section style={{ background: '#fafbfc', borderBottom: '1px solid #e5e7eb' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3b82f6' }}>The value equation</p>
              <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: '#0a0b0d' }}>Here's what $99/month actually gets you:</h2>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}>
              <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid #e5e7eb' }}>
                {valueStack.map((item, i) => (
                  <motion.div
                    key={item.label}
                    variants={staggerItem}
                    className="flex items-center justify-between px-5 py-4"
                    style={{
                      background: i % 2 === 0 ? '#ffffff' : '#fafbfc',
                      borderBottom: i < valueStack.length - 1 ? '1px solid #e5e7eb' : 'none',
                    }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#0a0b0d' }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{item.desc}</p>
                    </div>
                    <span className="text-sm line-through shrink-0 ml-4" style={{ color: '#cbd5e1' }}>{item.value}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div
                variants={staggerItem}
                className="rounded-2xl p-5 text-center"
                style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
              >
                <p className="text-lg font-black mb-0.5" style={{ color: '#0a0b0d' }}>
                  Everything above: <span style={{ color: '#3b82f6' }}>$99/month</span>
                </p>
                <p className="text-sm" style={{ color: '#64748b' }}>Per practice. Unlimited clients. Cancel anytime.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── PRICING CARD ── */}
        <section style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
          <div className="max-w-lg mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-wider"
                style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}
              >
                <Users size={12} />
                Shortlistr for Coaches
              </div>
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: '#0a0b0d' }}>One plan. Everything included.</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } }}
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ scale: 1.02, boxShadow: '0 20px 48px rgba(59,130,246,0.12)' }}
              transition={{ duration: 0.2 }}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: '#ffffff',
                border: '1px solid #bfdbfe',
                boxShadow: '0 4px 24px rgba(59,130,246,0.08)',
              }}
            >
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />

              <div className="p-8">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-black" style={{ color: '#0a0b0d' }}>$99</span>
                  <span className="text-lg font-medium" style={{ color: '#94a3b8' }}>/month</span>
                </div>
                <p className="text-sm mb-6" style={{ color: '#64748b' }}>
                  Per practice — unlimited clients included
                </p>

                <ul className="space-y-3 mb-8">
                  {proFeatures.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: '#374151' }}>
                      <Check size={15} className="shrink-0" style={{ color: '#3b82f6' }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {checkoutError && (
                  <p className="text-xs text-center mb-3" style={{ color: '#dc2626' }}>{checkoutError}</p>
                )}

                <motion.button
                  onClick={handleCheckout}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.14 }}
                  className="w-full py-4 rounded-xl font-bold text-base disabled:opacity-50 flex items-center justify-center gap-2 btn-shimmer"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', boxShadow: '0 4px 20px rgba(59,130,246,0.28)' }}
                >
                  {loading ? (
                    <>
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        style={{ display: 'block', width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#ffffff' }} />
                      Redirecting…
                    </>
                  ) : (
                    <>
                      {isPro ? 'You\'re on Pro ✓' : !user ? 'Start your practice' : 'Upgrade your practice'}
                      {!isPro && <ArrowRight size={16} />}
                    </>
                  )}
                </motion.button>

                <p className="text-center text-xs mt-3" style={{ color: '#94a3b8' }}>
                  14-day free trial · Cancel anytime · No setup fees
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── GUARANTEE ── */}
        <section style={{ background: '#fafbfc', borderBottom: '1px solid #e5e7eb' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #eff6ff 100%)',
                border: '2px solid #86efac',
              }}
            >
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(5,150,105,0.06) 0%, transparent 65%)' }} />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                  style={{ background: '#ecfdf5', border: '1px solid #86efac' }}>
                  <ShieldCheck size={32} style={{ color: '#059669' }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#059669' }}>Zero-risk guarantee</p>
                <h2 className="text-3xl sm:text-4xl font-black mb-5 leading-tight" style={{ color: '#0a0b0d' }}>
                  Your client's score goes up.<br />Or it's free.
                </h2>
                <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: '#475569' }}>
                  If any client's ATS score doesn't improve after using Shortlistr, email us within 30 days and we'll refund your next month immediately. One email. No forms. No questions.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold">
                  {['No questions asked', '30-day window', 'Instant refund', 'One email to claim'].map(item => (
                    <span key={item} className="flex items-center gap-1.5" style={{ color: '#374151' }}>
                      <Check size={14} style={{ color: '#059669' }} /> {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3b82f6' }}>FAQ</p>
              <h2 className="text-2xl sm:text-3xl font-black" style={{ color: '#0a0b0d' }}>Questions coaches usually ask.</h2>
            </motion.div>
            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} className="space-y-3">
              {faqs.map(faq => (
                <motion.div key={faq.q} variants={staggerItem}>
                  <FAQItem q={faq.q} a={faq.a} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-4xl font-black mb-3 leading-tight" style={{ color: '#0a0b0d' }}>
                Your clients already expect<br />a modern practice.
              </h2>
              <p className="text-base mb-8 max-w-md mx-auto" style={{ color: '#475569' }}>
                14-day free trial. See it work on a real client resume before you pay a cent.
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className="inline-block mb-3">
                <Link
                  to="/auth?mode=signup"
                  className="flex items-center gap-2.5 px-10 py-5 rounded-2xl font-black text-lg btn-shimmer"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', boxShadow: '0 12px 40px rgba(59,130,246,0.28)' }}
                >
                  Start your practice
                  <ArrowRight size={20} />
                </Link>
              </motion.div>
              <p className="text-xs" style={{ color: '#64748b' }}>
                No credit card required · 30-day money-back guarantee
              </p>
            </motion.div>
          </div>
        </section>

      </div>
    </Layout>
  )
}
