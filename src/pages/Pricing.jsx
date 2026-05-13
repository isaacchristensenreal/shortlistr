import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, Check, ChevronDown, ShieldCheck, Zap, ArrowRight,
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

/* ─── Shared Components ──────────────────────────────────────────────────── */

function StarRating() {
  return (
    <span className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={13} fill="#F5C842" style={{ color: '#F5C842' }} />
      ))}
    </span>
  )
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const valueStack = [
  { label: 'ATS Resume Scanner',       desc: 'See your exact score vs. any job description',  value: '$10/mo' },
  { label: 'AI Resume Rewriter',        desc: 'Keyword-optimized in 90 seconds',                value: '$49/mo' },
  { label: 'Cover Letter Generator',    desc: 'Tailored to every job posting',                  value: '$19/mo' },
  { label: 'Before/After Scorecard',    desc: 'Shareable PNG of your improvement',              value: '$9/mo'  },
  { label: 'Rejection Reason Report',   desc: 'Exactly why ATS rejected you',                   value: '$19/mo' },
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
    a: "No. Your first ATS scan is completely free. No card, no commitment. You see your score and what's wrong before you decide to pay anything.",
  },
  {
    q: "What if it doesn't work for me?",
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
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-white pr-4">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="shrink-0"
        >
          <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
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
            <div className="px-6 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-sm leading-relaxed pt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Pricing Card ───────────────────────────────────────────────────────── */

function PricingCard({ billing, title, price, priceSuffix, tagline, sub, features, ctaText, ctaStyle, badge, checkColor, loading, disabled, onCheckout, error }) {
  return (
    <motion.div
      variants={staggerItem}
      className="rounded-2xl p-6 flex flex-col relative overflow-hidden"
      style={badge
        ? { background: 'linear-gradient(160deg, #1a1408 0%, #13131A 60%)', border: '1px solid rgba(245,200,66,0.3)' }
        : { background: '#13131A', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {badge && (
        <div className="absolute top-4 right-4">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: '#F5C842', color: '#0A0A0F' }}>{badge}</span>
        </div>
      )}
      <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: badge ? '#F5C842' : 'rgba(255,255,255,0.4)' }}>
        {title}
      </p>
      <div className="mb-0.5">
        <span className="text-5xl font-black text-white">{price}</span>
        <span className="text-sm ml-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{priceSuffix}</span>
      </div>
      {tagline && <p className="text-sm font-semibold mb-1" style={{ color: '#00FF88' }}>{tagline}</p>}
      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>
      <ul className="space-y-2.5 mb-8 flex-1">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            <Check size={15} className="shrink-0" style={{ color: checkColor }} />
            {f}
          </li>
        ))}
      </ul>
      {error && <p className="text-xs text-center mb-3" style={{ color: '#FF4444' }}>{error}</p>}
      <motion.button
        onClick={onCheckout}
        disabled={disabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.14 }}
        className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
        style={ctaStyle}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'block', width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: 'rgba(0,0,0,0.8)' }} />
            Redirecting…
          </span>
        ) : ctaText}
      </motion.button>
      <p className="text-[11px] text-center mt-2.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
        {billing === 'monthly' ? 'First scan is always free. No card required.' : 'One payment. No expiry. Yours forever.'}
      </p>
    </motion.div>
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

  return (
    <Layout>
      <Helmet>
        <title>ShortListr Pricing — $10/month for Unlimited AI Resume Optimization</title>
        <meta name="description" content="ShortListr Pro is $10/month or $149 once for lifetime access. Unlimited ATS resume optimization, AI bullet rewrites, cover letter generation, and more. Less than a Spotify subscription." />
        <link rel="canonical" href="https://shortlistr.us/pricing" />
        <meta property="og:url" content="https://shortlistr.us/pricing" />
        <meta property="og:title" content="ShortListr Pricing — $10/month for Unlimited AI Resume Optimization" />
        <meta property="og:description" content="Unlimited ATS optimization, AI bullet rewrites, and cover letter generation for $10/month. Or pay once with lifetime access for $149." />
      </Helmet>

      <div style={{ background: '#0A0A0F' }}>

        {/* ── HERO ── */}
        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
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
            </motion.div>
          </div>
        </section>

        {/* ── VALUE STACK ── */}
        <section style={{ background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3B82F6' }}>The value equation</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Here's what $10/month actually gets you:</h2>
            </motion.div>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              <div className="rounded-2xl overflow-hidden mb-4" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                {valueStack.map((item, i) => (
                  <motion.div
                    key={item.label}
                    variants={staggerItem}
                    className="flex items-center justify-between px-5 py-4"
                    style={{
                      background: i % 2 === 0 ? '#13131A' : 'rgba(255,255,255,0.02)',
                      borderBottom: i < valueStack.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.desc}</p>
                    </div>
                    <span className="text-sm line-through shrink-0 ml-4" style={{ color: 'rgba(255,255,255,0.25)' }}>{item.value}</span>
                  </motion.div>
                ))}
              </div>
              <motion.div
                variants={staggerItem}
                className="rounded-2xl p-5 text-center"
                style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.08), rgba(245,200,66,0.04))', border: '1px solid rgba(245,200,66,0.2)' }}
              >
                <p className="text-lg font-black text-white mb-0.5">Everything above: <span style={{ color: '#F5C842' }}>$10/month</span></p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>That's less than a Spotify subscription.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── PRICING CARDS ── */}
        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#F5C842' }}>Choose your plan</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Same features. Both options.</h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5"
            >
              <PricingCard
                billing="monthly"
                title="Shortlistr Pro — Monthly"
                price="$10"
                priceSuffix="/month"
                sub="Cancel anytime. No contracts. No hidden fees."
                features={proFeatures}
                checkColor="#00FF88"
                ctaText={isPro ? 'You\'re on Pro ✓' : !user ? 'Start free — upgrade when ready' : 'Upgrade to Pro — $10/mo'}
                ctaStyle={{ border: '1px solid rgba(245,200,66,0.4)', color: '#F5C842', background: 'rgba(245,200,66,0.05)' }}
                loading={loading === 'monthly'}
                disabled={!!loading || isPro}
                onCheckout={() => handleCheckout('monthly')}
                error={checkoutError}
              />
              <PricingCard
                billing="lifetime"
                title="Shortlistr Pro — Lifetime"
                price="$149"
                priceSuffix="once"
                tagline="Pay once. Use forever. Save 57%."
                sub="No subscriptions, no renewals, no surprises."
                features={proFeatures}
                checkColor="#F5C842"
                badge="Best Value"
                ctaText={isPro ? 'You\'re on Pro ✓' : 'Get Lifetime Access — $149'}
                ctaStyle={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 4px 20px rgba(245,200,66,0.2)' }}
                loading={loading === 'lifetime'}
                disabled={!!loading || isPro}
                onCheckout={() => handleCheckout('lifetime')}
                error={checkoutError}
              />
            </motion.div>

            {/* Testimonials */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8"
            >
              {testimonials.map(t => (
                <motion.figure
                  key={t.name}
                  variants={staggerItem}
                  className="rounded-2xl p-5"
                  style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <StarRating />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.2)' }}>{t.result}</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{t.outcome}</p>
                  <blockquote className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>"{t.quote}"</blockquote>
                  <figcaption className="text-xs font-semibold text-white">
                    {t.name} <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>— {t.role}</span>
                  </figcaption>
                </motion.figure>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── GUARANTEE ── */}
        <section style={{ background: 'rgba(255,255,255,0.015)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #0c1a0b 0%, #13131A 50%, #0a0f1a 100%)',
                border: '2px solid rgba(0,255,136,0.25)',
                boxShadow: '0 0 60px rgba(0,255,136,0.05)',
              }}
            >
              <div className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.08) 0%, transparent 65%)' }} />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                  style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)' }}>
                  <ShieldCheck size={32} style={{ color: '#00FF88' }} />
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
                      <Check size={14} style={{ color: '#00FF88' }} /> {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3B82F6' }}>FAQ</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Questions you probably have.</h2>
            </motion.div>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className="space-y-3"
            >
              {faqs.map(faq => (
                <motion.div key={faq.q} variants={staggerItem}>
                  <FAQItem q={faq.q} a={faq.a} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 leading-tight">
                Less than a coffee a week<br />to stop getting rejected.
              </h2>
              <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Your first scan is free. See your score before you pay a cent.
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className="inline-block mb-3">
                <Link
                  to="/auth?mode=signup"
                  className="flex items-center gap-2.5 px-10 py-5 rounded-2xl font-black text-lg"
                  style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 12px 40px rgba(245,200,66,0.35)' }}
                >
                  Get started free
                  <ArrowRight size={20} />
                </Link>
              </motion.div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                No credit card required · 30-day money-back guarantee
              </p>
            </motion.div>
          </div>
        </section>

      </div>
    </Layout>
  )
}
