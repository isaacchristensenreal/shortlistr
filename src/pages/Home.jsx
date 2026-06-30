import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, useInView } from 'framer-motion'
import {
  CheckCircle, ArrowRight, Users, BarChart3,
  Zap, Sparkles, TrendingUp,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'

// ─── Animation variants ──────────────────────────────────────────────────────

const EASE_OUT = [0.23, 1, 0.32, 1]

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
}

// ─── Hero dashboard mockup ────────────────────────────────────────────────────

const MOCK_CLIENTS = [
  { name: 'Sarah K.',   role: 'Product Manager',   score: 89, delta: '+41', status: 'Sent' },
  { name: 'Marcus T.',  role: 'Software Engineer',  score: 76, delta: '+28', status: 'In review' },
  { name: 'Priya M.',   role: 'UX Designer',        score: 61, delta: '+19', status: 'Draft' },
  { name: 'James R.',   role: 'Data Analyst',       score: 94, delta: '+52', status: 'Sent' },
]

function ScoreBadge({ score }) {
  const color = score >= 80 ? '#059669' : score >= 60 ? '#d97706' : '#dc2626'
  const bg    = score >= 80 ? '#ecfdf5' : score >= 60 ? '#fffbeb' : '#fef2f2'
  return (
    <span
      className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full"
      style={{ color, background: bg }}
    >
      {score}
    </span>
  )
}

function HeroDashboardMockup() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 24px 56px rgba(0,0,0,0.08), 0 4px 16px rgba(59,130,246,0.06)',
      }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: '1px solid #e5e7eb', background: '#fafbfc' }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#fca5a5' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#fde68a' }} />
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#bbf7d0' }} />
        <span className="ml-3 text-xs font-medium" style={{ color: '#94a3b8' }}>ShortListr — My Clients</span>
      </div>

      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Active clients</p>
          <p className="text-xl font-black mt-0.5" style={{ color: '#0a0b0d' }}>4 workspaces</p>
        </div>
        <div
          className="text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
          style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}
        >
          <Users size={12} />
          + Add client
        </div>
      </div>

      {/* Client rows */}
      <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
        {MOCK_CLIENTS.map((c) => (
          <div key={c.name} className="flex items-center gap-3 px-5 py-3.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: '#eff6ff', color: '#3b82f6' }}
            >
              {c.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#0a0b0d' }}>{c.name}</p>
              <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{c.role}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ScoreBadge score={c.score} />
              <span className="text-xs font-semibold" style={{ color: '#059669' }}>{c.delta}</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: c.status === 'Sent' ? '#ecfdf5' : c.status === 'In review' ? '#eff6ff' : '#f8fafc',
                  color:      c.status === 'Sent' ? '#059669' : c.status === 'In review' ? '#3b82f6' : '#64748b',
                }}
              >
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer stat */}
      <div className="px-5 py-3 flex items-center gap-4" style={{ background: '#fafbfc', borderTop: '1px solid #e5e7eb' }}>
        {[
          { label: 'Avg score', value: '80' },
          { label: 'Avg lift',  value: '+35' },
          { label: 'Sent this week', value: '2' },
        ].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-sm font-black" style={{ color: '#3b82f6' }}>{s.value}</p>
            <p className="text-[10px]" style={{ color: '#94a3b8' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Proof (before / after) ───────────────────────────────────────────────────

const PROOF_PANELS = [
  {
    before: {
      heading: 'Resumes scattered across Drive and email',
      bullets: [
        'Client files mixed with personal docs',
        'No version tracking — "which one did I send?"',
        'Manually copying ATS tips from browser tabs',
      ],
    },
    after: {
      heading: 'Every client in one clean workspace',
      bullets: [
        'Named workspaces — one per client, instant access',
        'Full revision history with timestamps',
        'ATS score and keyword gaps visible at a glance',
      ],
    },
  },
  {
    before: {
      heading: 'Hours spent manually rewriting bullets',
      bullets: [
        'Reading JDs, extracting keywords by hand',
        'Back-and-forth editing across email threads',
        'Inconsistent quality across clients',
      ],
    },
    after: {
      heading: 'ATS-optimized draft in 90 seconds',
      bullets: [
        'Drop in a job description — keywords extracted instantly',
        'AI rewrites bullets to match, you approve',
        'Consistent, professional output every time',
      ],
    },
  },
  {
    before: {
      heading: 'Sending a PDF and hoping for the best',
      bullets: [
        'No visibility into client ATS scores',
        'Clients ask "why am I not getting calls?"',
        'Hard to prove the value of your coaching',
      ],
    },
    after: {
      heading: 'Client-ready scorecard they can share',
      bullets: [
        'Before/after ATS score on every export',
        'Clients see the improvement — they refer friends',
        'Measurable outcomes that build your reputation',
      ],
    },
  },
]

function ProofSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-24 px-4" style={{ background: '#fafbfc' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={staggerContainer}
        >
          <motion.div
            variants={staggerItem}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-wider"
            style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}
          >
            <TrendingUp size={12} />
            The difference
          </motion.div>
          <motion.h2 variants={staggerItem} className="text-4xl sm:text-5xl font-black mb-4" style={{ color: '#0a0b0d' }}>
            From "let me check my Drive"<br className="hidden sm:block" /> to running a real agency
          </motion.h2>
          <motion.p variants={staggerItem} className="text-lg max-w-xl mx-auto" style={{ color: '#475569' }}>
            ShortListr replaces every scattered spreadsheet, email thread, and browser tab your practice runs on today.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {PROOF_PANELS.map((panel, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid #e5e7eb' }}
            >
              <div className="p-6" style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
                <span
                  className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full inline-block mb-3"
                  style={{ background: '#fee2e2', color: '#b91c1c' }}
                >
                  Before
                </span>
                <p className="text-sm font-semibold mb-3" style={{ color: '#0a0b0d' }}>{panel.before.heading}</p>
                <ul className="space-y-1.5">
                  {panel.before.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs" style={{ color: '#64748b' }}>
                      <span className="mt-0.5 shrink-0 font-bold" style={{ color: '#dc2626' }}>✕</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6" style={{ background: '#eff6ff' }}>
                <span
                  className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full inline-block mb-3"
                  style={{ background: '#dcfce7', color: '#166534' }}
                >
                  After
                </span>
                <p className="text-sm font-semibold mb-3" style={{ color: '#0a0b0d' }}>{panel.after.heading}</p>
                <ul className="space-y-1.5">
                  {panel.after.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs" style={{ color: '#1e40af' }}>
                      <CheckCircle size={12} className="mt-0.5 shrink-0" style={{ color: '#3b82f6' }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── How it works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    icon: Users,
    title: 'Add a client workspace',
    desc: 'Name it for the client. Every resume, job target, and score history lives in one place.',
  },
  {
    n: '02',
    icon: Zap,
    title: 'Drop in their resume — instant score',
    desc: 'Upload a PDF or paste text. ATS scan, keyword gaps, and rewritten bullets in 90 seconds.',
  },
  {
    n: '03',
    icon: BarChart3,
    title: 'Send back polished, with proof',
    desc: 'Export a before/after scorecard your client can actually read. They see the lift. They refer you.',
  },
]

function HowItWorksSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-24 px-4" style={{ background: '#ffffff' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={staggerContainer}
        >
          <motion.h2 variants={staggerItem} className="text-4xl sm:text-5xl font-black mb-4" style={{ color: '#0a0b0d' }}>
            Three steps to a practice<br className="hidden sm:block" /> you're proud of
          </motion.h2>
          <motion.p variants={staggerItem} className="text-lg" style={{ color: '#475569' }}>
            No setup complexity. No learning curve. A better workflow from day one.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              variants={staggerItem}
              whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(59,130,246,0.08)' }}
              transition={{ duration: 0.2 }}
              className="relative rounded-2xl p-7"
              style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-sm font-black"
                style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}
              >
                {s.n}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={15} style={{ color: '#3b82f6' }} />
                <h3 className="text-base font-bold" style={{ color: '#0a0b0d' }}>{s.title}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{s.desc}</p>
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:flex absolute top-1/2 -right-4 z-10 w-8 h-8 rounded-full items-center justify-center"
                  style={{ background: '#ffffff', border: '1px solid #e5e7eb', transform: 'translateY(-50%)' }}
                >
                  <ArrowRight size={13} style={{ color: '#94a3b8' }} />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

const PLAN_FEATURES = [
  'Unlimited client workspaces',
  'ATS scoring on every resume',
  'AI resume rewriting & optimization',
  'Keyword gap reports per job posting',
  'Before / after client scorecards',
  'Cover letter drafts per application',
  'LinkedIn profile optimizer',
  'Priority support',
]

function PricingSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <section ref={ref} className="py-24 px-4" id="pricing" style={{ background: '#fafbfc' }}>
      <div className="max-w-lg mx-auto">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={staggerContainer}
        >
          <motion.div
            variants={staggerItem}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-wider"
            style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}
          >
            <Zap size={12} />
            Simple Pricing
          </motion.div>
          <motion.h2 variants={staggerItem} className="text-4xl sm:text-5xl font-black mb-4" style={{ color: '#0a0b0d' }}>
            One plan.<br />Everything included.
          </motion.h2>
          <motion.p variants={staggerItem} className="text-base" style={{ color: '#475569' }}>
            No per-client fees, no seat limits, no annual lock-in.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE_OUT, delay: 0.15 } } : {}}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 48px rgba(59,130,246,0.14)' }}
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
              {PLAN_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm" style={{ color: '#374151' }}>
                  <CheckCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#3b82f6' }} />
                  {f}
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={() => navigate(user ? '/pricing' : '/auth?mode=signup')}
              className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 btn-shimmer"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', boxShadow: '0 4px 20px rgba(59,130,246,0.28)' }}
            >
              {user ? 'Upgrade Your Practice' : 'Start Your Practice'}
              <ArrowRight size={16} />
            </motion.button>

            <p className="text-center text-xs mt-3" style={{ color: '#94a3b8' }}>
              14-day free trial · Cancel anytime · No setup fees
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { user } = useAuth()

  return (
    <section
      ref={ref}
      className="py-24 px-4"
      style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={staggerContainer}
        >
          <motion.h2
            variants={staggerItem}
            className="text-4xl sm:text-6xl font-black mb-5 leading-tight"
            style={{ color: '#0a0b0d' }}
          >
            Your clients already expect<br />
            <span style={{ color: '#3b82f6' }}>a modern practice.</span>
          </motion.h2>
          <motion.p
            variants={staggerItem}
            className="text-lg mb-8 max-w-xl mx-auto"
            style={{ color: '#475569' }}
          >
            ShortListr gives you the workspace, the tools, and the credibility to run a coaching business your clients brag about.
          </motion.p>
          <motion.div variants={staggerItem}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="inline-block"
            >
              <Link
                to={user ? '/dashboard' : '/auth?mode=signup'}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base btn-shimmer"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', boxShadow: '0 8px 32px rgba(59,130,246,0.28)' }}
              >
                {user ? 'Go to Dashboard' : 'Start your practice'}
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            <p className="mt-4 text-sm" style={{ color: '#64748b' }}>
              14-day free trial · No credit card required
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { user }   = useAuth()
  const heroRef    = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <Layout>
      <Helmet>
        <title>ShortListr — Client Resume Management for Career Coaches</title>
        <meta name="description" content="ShortListr gives career coaches one workspace to manage every client's resume, ATS score, and progress. Run your practice like a real agency. $99/mo." />
        <link rel="canonical" href="https://www.shortlistr.us/" />
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ background: '#ffffff', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center' }}
      >
        {/* Subtle bg orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb-drift absolute rounded-full" style={{ width: 600, height: 600, top: '-20%', left: '-10%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)' }} />
          <div className="orb-drift2 absolute rounded-full" style={{ width: 500, height: 500, bottom: '-15%', right: '-5%', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 65%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — copy, on-load only stagger */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={staggerContainer}
            >
              <motion.div
                variants={staggerItem}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold uppercase tracking-wider"
                style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}
              >
                <Sparkles size={12} />
                For career coaches · $99/mo
              </motion.div>

              <motion.h1
                variants={staggerItem}
                className="text-5xl sm:text-6xl xl:text-7xl font-black leading-tight mb-5"
                style={{ color: '#0a0b0d' }}
              >
                Run a practice<br />
                your clients<br />
                <span style={{ color: '#3b82f6' }}>brag about.</span>
              </motion.h1>

              <motion.p
                variants={staggerItem}
                className="text-lg sm:text-xl mb-8 max-w-lg"
                style={{ color: '#475569', lineHeight: 1.65 }}
              >
                One workspace for all your clients' resumes, ATS scores, and progress — no more Google Drive folders, email chains, or manual keyword searches.
              </motion.p>

              <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
                  <Link
                    to={user ? '/dashboard' : '/auth?mode=signup'}
                    className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl font-bold text-base btn-shimmer"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', boxShadow: '0 8px 32px rgba(59,130,246,0.25)' }}
                  >
                    {user ? 'Go to Dashboard' : 'Start your practice'}
                    <ArrowRight size={18} />
                  </Link>
                </motion.div>
                <Link
                  to="#pricing"
                  className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl font-semibold text-sm transition-colors"
                  style={{ color: '#475569', border: '1px solid #e5e7eb' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#0a0b0d'; e.currentTarget.style.borderColor = '#bfdbfe' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                >
                  See pricing
                  <ArrowRight size={14} />
                </Link>
              </motion.div>

              <motion.p variants={staggerItem} className="mt-4 text-xs" style={{ color: '#94a3b8' }}>
                14-day free trial · No credit card required · Cancel anytime
              </motion.p>
            </motion.div>

            {/* Right — dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.3 }}
              className="relative flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-md">
                <HeroDashboardMockup />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <ProofSection />
      <HowItWorksSection />
      <PricingSection />
      <FinalCTA />
    </Layout>
  )
}
