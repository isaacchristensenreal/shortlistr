import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useScrollReveal, useStaggerReveal } from '../hooks/useScrollReveal'

const stats = [
  { value: '< 60s', label: 'Average optimization time' },
  { value: '4', label: 'AI-powered tools' },
  { value: '100%', label: 'AI-generated — review before submitting' },
  { value: 'Free', label: 'To start, no card required' },
]

/* ── Mini ATS Demo ──────────────────────────────────────────────── */
const atsKeywords = [
  { word: 'sales targets', found: true },
  { word: 'territory management', found: false },
  { word: 'CRM software', found: false },
  { word: 'client retention', found: true },
  { word: 'quota attainment', found: false },
]

function MiniATSCard() {
  return (
    <div className="bg-slate-50 dark:bg-navy-700/60 rounded-xl p-4 space-y-1.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Keyword Gap · Regional Sales Manager</span>
        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15 px-2 py-0.5 rounded-full">58% match</span>
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-3">
        <div className="h-full w-[58%] bg-gradient-to-r from-electric-500 to-violet-500 rounded-full" />
      </div>
      {atsKeywords.map(k => (
        <div key={k.word} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
          <span className="text-xs text-slate-600 dark:text-slate-300">{k.word}</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${k.found ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
            {k.found ? '✓' : '✗ missing'}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Mini Bullet Demo ───────────────────────────────────────────── */
function MiniBulletCard() {
  const [after, setAfter] = useState(false)
  return (
    <div className="bg-slate-50 dark:bg-navy-700/60 rounded-xl p-4">
      <div className="flex items-center gap-1 bg-white dark:bg-navy-700 rounded-lg p-0.5 mb-3 w-fit">
        <button onClick={() => setAfter(false)} className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all ${!after ? 'bg-slate-100 dark:bg-navy-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400'}`}>Before</button>
        <button onClick={() => setAfter(true)} className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all ${after ? 'bg-slate-100 dark:bg-navy-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400'}`}>After</button>
      </div>
      <div className={`rounded-lg p-3 transition-all ${after ? 'bg-electric-500/10 border border-electric-500/20' : 'bg-white dark:bg-navy-700 border border-slate-200 dark:border-white/10'}`}>
        <p className={`text-xs leading-relaxed ${after ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-400 italic'}`}>
          {after
            ? '"Managed 12-person customer service team across 3 locations, reducing complaint resolution time by 34% and increasing satisfaction scores from 72% to 91%."'
            : '"Responsible for managing the customer service team and handling complaints."'}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        {[{ l: 'Impact', b: '0', a: '4' }, { l: 'Metrics', b: '0', a: '3' }, { l: 'ATS', b: '31%', a: '92%' }].map(s => (
          <div key={s.l} className="bg-white dark:bg-navy-700 rounded-lg p-1.5 text-center border border-slate-100 dark:border-white/5">
            <p className={`text-sm font-bold ${after ? 'text-electric-500' : 'text-slate-400'}`}>{after ? s.a : s.b}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Mini Cover Letter Demo ─────────────────────────────────────── */
const FULL_LETTER = `Dear Hiring Manager,

I am writing to express my interest in the Marketing Coordinator position at Horizon Brands. With three years of experience developing multi-channel campaigns that consistently delivered above-target engagement, I am confident I can drive meaningful results for your team.

In my current role at Apex Media, I managed a $120K annual ad budget, growing email open rates by 41% and reducing cost-per-lead by 28% through A/B-tested copy and segmentation strategy. I collaborated closely with the design and sales teams to produce assets that shortened the average sales cycle by two weeks.

I would love the opportunity to bring that same focus on measurable outcomes to Horizon Brands.

Sincerely,
Alex Johnson`

function MiniCoverCard() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const go = () => { if (done || loading) return; setLoading(true); setTimeout(() => { setLoading(false); setDone(true) }, 1400) }
  return (
    <div className="bg-slate-50 dark:bg-navy-700/60 rounded-xl p-4">
      <div className="min-h-[96px] mb-3">
        {!done && !loading && (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-navy-600 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 mb-2 shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p className="text-[11px] text-slate-400">Click to see a sample cover letter</p>
          </div>
        )}
        {loading && (
          <div className="space-y-2 py-2">
            {[75, 100, 88, 60].map((w, i) => (
              <div key={i} className="h-2 bg-gradient-to-r from-electric-500/30 to-violet-500/30 rounded-full animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }} />
            ))}
            <p className="text-[10px] text-electric-500 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-electric-500 rounded-full animate-ping inline-block" />Writing...
            </p>
          </div>
        )}
        {done && (
          <div className="text-xs leading-relaxed space-y-1.5">
            <p className="text-slate-800 dark:text-slate-200 font-semibold">Dear Hiring Manager,</p>
            <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
              I am writing to express my interest in the Marketing Coordinator position at Horizon Brands. With three years of experience developing multi-channel campaigns...
            </p>
            {expanded && (
              <p className="text-slate-500 dark:text-slate-400 whitespace-pre-line">{FULL_LETTER.split('\n').slice(2).join('\n')}</p>
            )}
            <button onClick={() => setExpanded(e => !e)} className="text-electric-500 text-[10px] font-medium hover:text-electric-400 transition-colors">
              {expanded ? 'Show less ↑' : 'Continue reading →'}
            </button>
          </div>
        )}
      </div>
      <button onClick={go} disabled={loading || done} className={`w-full py-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${done ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400 cursor-default' : 'bg-gradient-to-r from-electric-500 to-violet-500 text-white hover:from-electric-400 hover:to-violet-400 shadow-sm shadow-electric-500/25'}`}>
        {done ? '✦ Pro feature — upgrade to generate yours' : loading ? 'Writing...' : '✦ See sample cover letter'}
      </button>
    </div>
  )
}

/* ── Mini Version History Demo ──────────────────────────────────── */
const versions = [
  { role: 'Marketing Manager', co: 'Horizon Brands', score: 93, color: 'from-green-400 to-emerald-500' },
  { role: 'Operations Lead', co: 'Delta Logistics', score: 87, color: 'from-blue-400 to-electric-500' },
  { role: 'Account Executive', co: 'Apex Solutions', score: 91, color: 'from-violet-400 to-purple-500' },
]

function MiniVersionCard() {
  const [sel, setSel] = useState(0)
  return (
    <div className="bg-slate-50 dark:bg-navy-700/60 rounded-xl p-4 space-y-1.5">
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-2">Saved versions</p>
      {versions.map((v, i) => (
        <button key={v.co} onClick={() => setSel(i)} className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition-all text-left ${sel === i ? 'bg-white dark:bg-navy-600 shadow-sm ring-1 ring-electric-500/20' : 'hover:bg-white/60 dark:hover:bg-white/5'}`}>
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${v.color} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>{v.score}</div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{v.role}</p>
            <p className="text-[10px] text-slate-400">{v.co}</p>
          </div>
          {sel === i && <span className="ml-auto text-electric-500 text-[10px] font-semibold">Active</span>}
        </button>
      ))}
      <div className="flex gap-1.5 pt-1">
        <button className="flex-1 py-1.5 rounded-lg bg-white dark:bg-navy-600 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-electric-500/40 transition-colors">PDF</button>
        <button className="flex-1 py-1.5 rounded-lg bg-white dark:bg-navy-600 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-electric-500/40 transition-colors">DOCX</button>
      </div>
    </div>
  )
}


const LinkedInIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const featureCards = [
  {
    accentColor: 'text-electric-500',
    title: 'ATS Keyword Matching',
    description: "Scans the job description and shows which keywords are missing from your resume, ranked by relevance. You see the gap clearly and can act on it.",
    demo: <MiniATSCard />,
    tag: 'Keyword analysis',
  },
  {
    accentColor: 'text-violet-500',
    title: 'AI Bullet Rewriting',
    description: 'Rewrites your bullet points using the STAR method with action verbs and metrics. Shows the before and after so you can compare and decide what to keep.',
    demo: <MiniBulletCard />,
    tag: 'Bullet rewriting',
  },
  {
    accentColor: 'text-emerald-500',
    title: 'Cover Letter Generation',
    description: 'Generates a draft cover letter using your resume content and the job description. Fully editable — treat it as a starting point, not a final submission.',
    demo: <MiniCoverCard />,
    tag: 'Cover letter draft',
  },
  {
    accentColor: 'text-amber-500',
    title: 'Version History',
    description: 'Every optimization is automatically saved with its ATS score and date. Browse past versions and download any of them at any time.',
    demo: <MiniVersionCard />,
    tag: 'Version history',
  },
]

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For occasional job seekers.',
    features: ['3 resume optimizations / month', 'ATS keyword analysis', 'Basic bullet suggestions', 'Version history (last 3)'],
    cta: 'Get Started Free',
    ctaLink: '/auth?mode=signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$10',
    period: 'per month',
    description: 'For serious job seekers.',
    features: ['Unlimited optimizations', 'Full ATS keyword matching', 'AI bullet rewriting', 'Cover letter generation', 'Unlimited version history', 'Priority support'],
    cta: 'Start Pro',
    ctaLink: '/auth?mode=signup',
    highlight: true,
  },
]

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const statsRef = useScrollReveal()
  const featuresRef = useStaggerReveal('.reveal-child')
  const pricingRef = useStaggerReveal('.reveal-child')
  const ctaRef = useScrollReveal()

  // Signed-in users don't need to see the marketing page
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-navy-900">
        {/* Grid background */}
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.1)_1px,transparent_0)] dark:[background-image:radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.08)_1px,transparent_0)] [background-size:32px_32px]" />
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-electric-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        {/* Floating orbs */}
        <div className="orb-drift absolute top-16 left-[8%] w-64 h-64 bg-gradient-to-br from-electric-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="orb-drift2 absolute bottom-20 right-[6%] w-80 h-80 bg-gradient-to-br from-violet-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="float-slow absolute top-1/2 left-[3%] w-20 h-20 bg-electric-500/8 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-electric-500/10 border border-electric-500/30 text-electric-600 dark:text-electric-400 text-sm px-4 py-1.5 rounded-full mb-8 font-medium float hover:scale-105 transition-transform cursor-default">
            <span className="w-1.5 h-1.5 bg-electric-500 rounded-full animate-pulse" />
            AI-powered resume optimization
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-slate-900 dark:text-white leading-[1.05] tracking-tight max-w-4xl mx-auto mb-6">
            AI resume optimization{' '}
            <span className="bg-gradient-to-r from-electric-500 via-blue-500 to-violet-500 bg-clip-text text-transparent gradient-animate">
              for any job description.
            </span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
            ShortListr uses AI to rewrite your resume, match keywords from any job description,
            and generate a cover letter — all in under 60 seconds.
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xl mx-auto mb-10">
            All content is AI-generated. Review everything carefully before submitting. Results are not guaranteed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/auth?mode=signup">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="secondary">See How It Works</Button>
            </Link>
          </div>

          {/* Mockup UI card */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-300/30 dark:shadow-black/40 overflow-hidden float-b hover:shadow-electric-500/10 hover:border-electric-500/20 transition-all duration-500">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-navy-900/60">
              <div className="w-3 h-3 rounded-full bg-red-400/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-400/70" />
              <div className="flex-1 mx-4">
                <div className="bg-slate-200 dark:bg-white/10 rounded-md h-5 w-48 mx-auto" />
              </div>
            </div>
            {/* App interior */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 text-left">
              <div className="p-5 border-b sm:border-b-0 border-r-0 sm:border-r border-slate-100 dark:border-white/5">
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 font-medium uppercase tracking-wider">Your Resume</p>
                <div className="space-y-2">
                  {[80, 60, 90, 55, 70].map((w, i) => (
                    <div key={i} className="h-2 bg-slate-200 dark:bg-white/10 rounded-full" style={{ width: `${w}%` }} />
                  ))}
                  <div className="pt-2 space-y-2">
                    {[65, 85, 45].map((w, i) => (
                      <div key={i} className="h-2 bg-slate-200 dark:bg-white/10 rounded-full" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5 bg-gradient-to-br from-electric-500/5 to-violet-500/5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-electric-600 dark:text-electric-400 font-semibold uppercase tracking-wider">Optimized ✨</p>
                  <span className="text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">94% match</span>
                </div>
                <div className="space-y-2">
                  {[90, 75, 95, 70, 85].map((w, i) => (
                    <div key={i} className="h-2 bg-gradient-to-r from-electric-500/50 to-violet-500/50 rounded-full" style={{ width: `${w}%` }} />
                  ))}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {['TypeScript', 'CI/CD', 'Kubernetes'].map(k => (
                      <span key={k} className="text-[10px] bg-electric-500/15 text-electric-600 dark:text-electric-400 border border-electric-500/20 px-2 py-0.5 rounded-full">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-slate-50 dark:bg-navy-800 border-y border-slate-200 dark:border-white/10">
        <div ref={statsRef} className="reveal max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {stats.map((s, i) => (
            <div key={s.label} className={`reveal reveal-delay-${i + 1}`}>
              <p className="text-3xl font-bold bg-gradient-to-r from-electric-500 to-violet-500 bg-clip-text text-transparent mb-1">{s.value}</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Disclaimer note */}
      <div className="bg-slate-50 dark:bg-navy-800 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2.5">
          <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed">
            All output is AI-generated. Review everything for accuracy before submitting. No employment outcomes are guaranteed.{' '}
            <Link to="/disclaimer" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline underline-offset-2 transition-colors">Full disclaimer</Link>
          </p>
        </div>
      </div>

      {/* Features */}
      <section className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-24">
          <div className="text-center mb-16">
            <p className="text-electric-500 dark:text-electric-400 text-sm font-semibold uppercase tracking-wider mb-3">Four AI-powered tools</p>
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
              What{' '}
              <span className="bg-gradient-to-r from-electric-500 to-violet-500 bg-clip-text text-transparent">
                ShortListr does
              </span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
              Four AI tools that analyze your resume against a job description and rewrite it to improve keyword alignment.
            </p>
          </div>

          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {featureCards.map((f, i) => (
              <div
                key={f.title}
                className={`reveal reveal-child reveal-delay-${i + 1} group bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-electric-500/30 hover:shadow-xl hover:shadow-electric-500/5 dark:hover:border-white/20 transition-all hover:-translate-y-1`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-[11px] uppercase tracking-wider font-semibold ${f.accentColor}`}>{f.tag}</p>
                </div>
                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1.5">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-5">{f.description}</p>

                {/* Live mini demo */}
                {f.demo}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/features">
              <Button variant="secondary">See all features in detail →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-slate-50 dark:bg-navy-800/50 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Start free. Upgrade when you need more.</p>
          </div>
          <div ref={pricingRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {tiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`reveal reveal-child reveal-delay-${i + 1} rounded-2xl p-8 border flex flex-col hover:-translate-y-1 transition-all duration-300 ${
                  tier.highlight
                    ? 'bg-gradient-to-b from-electric-500/10 to-violet-500/5 border-electric-500/40 ring-1 ring-electric-500/20 dark:from-electric-500/10 dark:to-violet-500/5'
                    : 'bg-white dark:bg-navy-800 border-slate-200 dark:border-white/10'
                }`}
              >
                {tier.highlight && (
                  <span className="text-xs font-semibold text-electric-500 dark:text-electric-400 uppercase tracking-wider mb-4">Most Popular</span>
                )}
                <div className="mb-6">
                  <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{tier.price}</span>
                    <span className="text-slate-400 text-sm">/{tier.period}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{tier.description}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 text-sm">
                      <span className="text-electric-500 mt-0.5 shrink-0">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to={tier.ctaLink}>
                  <Button variant={tier.highlight ? 'primary' : 'secondary'} className="w-full" size="lg">
                    {tier.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-navy-900 via-blue-950 to-violet-950 dark:from-navy-900 dark:via-blue-950 dark:to-violet-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] [background-size:28px_28px]" />
          <div ref={ctaRef} className="reveal relative">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-5 tracking-tight">
              See what your resume looks like{' '}
              <span className="bg-gradient-to-r from-electric-400 to-violet-400 bg-clip-text text-transparent">
                optimized for a real job.
              </span>
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">
              Free to try. Paste your resume and a job description and see exactly how the AI rewrites it.
            </p>
            <Link to="/auth?mode=signup">
              <button className="bg-white text-navy-900 font-bold px-10 py-4 rounded-xl hover:bg-white/90 transition-colors text-base shadow-2xl shadow-black/20">
                Start optimizing for free →
              </button>
            </Link>
            <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-center gap-2 text-white/40 text-xs">
              <span>Built by Isaac Christensen</span>
              <span>·</span>
              <a
                href="https://www.linkedin.com/in/isaac-christensen-18ba0a3b7"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
              >
                <LinkedInIcon />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
