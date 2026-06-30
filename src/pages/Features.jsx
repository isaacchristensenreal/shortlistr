import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, Sparkles, FileText, ShieldCheck,
  ArrowRight, Download,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'

const EASE_OUT = [0.23, 1, 0.32, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
}

/* ─── Browser Chrome Wrapper ─────────────────────────────────────────────── */
function BrowserWindow({ children, url = 'app.shortlistr.us/optimize' }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#fafbfc', borderBottom: '1px solid #e5e7eb' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(239,68,68,0.4)' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(245,158,11,0.4)' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(34,197,94,0.4)' }} />
        </div>
        <div className="flex-1 rounded-md px-3 py-1 flex items-center gap-2" style={{ background: '#f1f5f9' }}>
          <span className="text-[11px] font-mono truncate" style={{ color: '#94a3b8' }}>{url}</span>
        </div>
      </div>
      <div style={{ background: '#ffffff' }}>
        {children}
      </div>
    </div>
  )
}

/* ─── ATS Scanner Mockup ─────────────────────────────────────────────────── */
const keywords = [
  { word: 'cross-functional collaboration', match: false, weight: 'high' },
  { word: 'TypeScript',                     match: true,  weight: 'high' },
  { word: 'Kubernetes',                     match: false, weight: 'high' },
  { word: 'CI/CD pipelines',               match: false, weight: 'med'  },
  { word: 'REST APIs',                      match: true,  weight: 'med'  },
  { word: 'system design',                  match: true,  weight: 'low'  },
]

function ATSMockup() {
  const [active, setActive] = useState(null)
  const found = keywords.filter(k => k.match).length
  const score = Math.round((found / keywords.length) * 100)

  return (
    <BrowserWindow url="app.shortlistr.us/clients/james-r · ATS Scanner">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: '#94a3b8' }}>ATS Match Score</p>
            <p className="text-2xl font-black" style={{ color: '#0a0b0d' }}>{score}<span className="text-base font-medium" style={{ color: '#94a3b8' }}>%</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] mb-0.5" style={{ color: '#94a3b8' }}>Client: James R. · Senior Engineer</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>Needs improvement</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(0,0,0,0.06)' }}>
          <div className="h-full rounded-full" style={{ width: `${score}%`, background: 'linear-gradient(90deg, #ef4444, #f97316)' }} />
        </div>
        <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: '#94a3b8' }}>Keywords from job description</p>
        <div className="space-y-1.5">
          {keywords.map(k => (
            <button key={k.word} onClick={() => setActive(active === k.word ? null : k.word)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
              style={active === k.word
                ? { background: '#eff6ff', border: '1px solid #bfdbfe' }
                : { background: '#f8fafc', border: '1px solid transparent' }}>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: k.weight === 'high' ? '#ef4444' : k.weight === 'med' ? '#f59e0b' : '#cbd5e1' }} />
                <span style={{ color: '#374151' }}>{k.word}</span>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={k.match
                  ? { background: '#dcfce7', color: '#166534' }
                  : { background: '#fee2e2', color: '#dc2626' }}>
                {k.match ? '✓ found' : '✗ missing'}
              </span>
            </button>
          ))}
        </div>
        {active && !keywords.find(k => k.word === active)?.match && (
          <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8' }}>
            <span className="font-semibold">Fix:</span> Add "{active}" to their experience or skills section
          </div>
        )}
      </div>
    </BrowserWindow>
  )
}

/* ─── Bullet Rewrite Mockup ──────────────────────────────────────────────── */
function BulletMockup() {
  const [showAfter, setShowAfter] = useState(false)
  const [animating, setAnimating] = useState(false)

  const handleToggle = () => {
    setAnimating(true)
    setTimeout(() => { setShowAfter(v => !v); setAnimating(false) }, 200)
  }

  return (
    <BrowserWindow url="app.shortlistr.us/clients/sarah-k · AI Rewriter">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: '#94a3b8' }}>Experience bullet — Sarah K.</p>
          <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: '#f1f5f9' }}>
            <button onClick={() => { if (showAfter) handleToggle() }}
              className="text-[10px] px-3 py-1.5 rounded-md font-medium transition-all"
              style={!showAfter ? { background: '#ffffff', color: '#0a0b0d', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : { color: '#94a3b8' }}>
              Before
            </button>
            <button onClick={() => { if (!showAfter) handleToggle() }}
              className="text-[10px] px-3 py-1.5 rounded-md font-medium transition-all"
              style={showAfter ? { background: '#ffffff', color: '#0a0b0d', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } : { color: '#94a3b8' }}>
              After
            </button>
          </div>
        </div>
        <div className={`transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          {!showAfter ? (
            <div className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
              <p className="text-sm italic leading-relaxed" style={{ color: '#94a3b8' }}>
                "Worked on improving the checkout flow for the e-commerce platform."
              </p>
            </div>
          ) : (
            <div className="rounded-xl p-4" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <p className="text-sm leading-relaxed font-medium" style={{ color: '#0a0b0d' }}>
                "Redesigned the checkout funnel for a 2M-user e-commerce platform, reducing cart abandonment by 23% and increasing monthly revenue by $140K."
              </p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: 'Impact words', before: '0', after: '4' },
            { label: 'Metrics',      before: '0', after: '3' },
            { label: 'ATS score',    before: '31%', after: '92%' },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg p-2.5 text-center" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
              <p className="text-lg font-bold" style={{ color: showAfter ? '#3b82f6' : '#cbd5e1' }}>
                {showAfter ? stat.after : stat.before}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>{stat.label}</p>
            </div>
          ))}
        </div>
        <motion.button
          onClick={handleToggle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.13 }}
          className="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}
        >
          <Sparkles size={13} />
          {showAfter ? 'Generate another variation' : 'Rewrite with AI'}
        </motion.button>
      </div>
    </BrowserWindow>
  )
}

/* ─── Cover Letter Mockup ────────────────────────────────────────────────── */
function CoverLetterMockup() {
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)

  const handleGenerate = () => {
    if (done) return
    setGenerating(true)
    setTimeout(() => { setGenerating(false); setDone(true) }, 1800)
  }

  return (
    <BrowserWindow url="app.shortlistr.us/clients/priya-m · Cover Letter">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: '#94a3b8' }}>Cover Letter — Priya M.</p>
          {done && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
              style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>
              <Check size={10} />Ready to send
            </span>
          )}
        </div>
        <div className="rounded-xl p-4 min-h-[140px] relative" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
          {!done && !generating && (
            <div className="flex flex-col items-center justify-center h-full py-6 text-center">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: '#f1f5f9', border: '1px solid #e5e7eb' }}>
                <FileText size={18} style={{ color: '#94a3b8' }} />
              </div>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Generate a tailored cover letter for this client</p>
            </div>
          )}
          {generating && (
            <div className="space-y-2">
              {[80, 100, 95, 70, 85].map((w, i) => (
                <div key={i} className="h-2 rounded-full animate-pulse"
                  style={{ width: `${w}%`, background: 'linear-gradient(90deg, rgba(59,130,246,0.2), rgba(99,102,241,0.15))', animationDelay: `${i * 100}ms` }} />
              ))}
              <p className="text-[10px] flex items-center gap-1.5 mt-2" style={{ color: '#3b82f6' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-ping inline-block" style={{ background: '#3b82f6' }} />
                Writing cover letter…
              </p>
            </div>
          )}
          {done && (
            <div className="space-y-2 text-xs leading-relaxed">
              <p className="font-semibold" style={{ color: '#0a0b0d' }}>Dear Hiring Team,</p>
              <p style={{ color: '#475569' }}>
                I'm excited to apply for the UX Designer role at Figma. With 4+ years designing complex B2B interfaces, I'm drawn to Figma's mission to democratize…
              </p>
              <p className="font-medium cursor-pointer" style={{ color: '#3b82f6' }}>Continue reading →</p>
            </div>
          )}
        </div>
        <motion.button
          onClick={handleGenerate}
          disabled={generating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.13 }}
          className="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
          style={done
            ? { background: '#f8fafc', color: '#475569', border: '1px solid #e5e7eb' }
            : { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}
        >
          {done
            ? <><Download size={13} />Export as PDF</>
            : generating
              ? 'Writing…'
              : <><Sparkles size={13} />Generate cover letter</>}
        </motion.button>
      </div>
    </BrowserWindow>
  )
}

/* ─── Before/After Scorecard Mockup ─────────────────────────────────────── */
function ScorecardMockup() {
  return (
    <BrowserWindow url="app.shortlistr.us/clients/marcus-t · Scorecard">
      <div className="p-5">
        <p className="text-[10px] uppercase tracking-wider font-medium mb-4" style={{ color: '#94a3b8' }}>Before & After — Marcus T.</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-4 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Before</p>
            <p className="text-4xl font-black" style={{ color: '#ef4444' }}>41</p>
            <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>ATS Score</p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: '#ecfdf5', border: '1px solid #86efac' }}>
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>After</p>
            <p className="text-4xl font-black" style={{ color: '#059669' }}>88</p>
            <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>ATS Score</p>
          </div>
        </div>
        <div className="text-center p-3 rounded-xl mb-3" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <p className="text-sm font-black" style={{ color: '#0a0b0d' }}>+47 pts improvement</p>
          <p className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>After first optimization session</p>
        </div>
        <button className="w-full py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5"
          style={{ background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe' }}>
          <Download size={12} />Download scorecard PNG
        </button>
      </div>
    </BrowserWindow>
  )
}

/* ─── Outcome Callout ────────────────────────────────────────────────────── */
function OutcomeCallout({ text }) {
  return (
    <div className="mt-6 p-4 rounded-xl flex items-start gap-3"
      style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: '#3b82f6' }}>
        <Check size={11} style={{ color: '#fff' }} />
      </div>
      <p className="text-sm font-semibold" style={{ color: '#1e40af' }}>{text}</p>
    </div>
  )
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const testimonials = [
  {
    outcome: 'Onboarded 3 new clients after showing them the workspace in my discovery call.',
    quote: "Before Shortlistr I was copying feedback into Google Docs. Now I show prospects the dashboard live — they sign up on the spot.",
    name: 'Rachel D.',
    role: 'Career Coach · Chicago',
    result: '3 new clients / mo',
  },
  {
    outcome: 'Cut my resume review time by 70% without sacrificing quality.',
    quote: "I was spending 3 hours per client on rewrites. Shortlistr does the first pass in 90 seconds. I spend 20 minutes approving and personalizing.",
    name: 'Derek M.',
    role: 'Executive Career Coach',
    result: '70% time saved',
  },
]

const features = [
  {
    tag: 'Feature 1 — ATS Resume Scanner',
    headline: "Show clients exactly where their resume stands",
    problem: "Coaches struggle to explain why a resume isn't working — and clients struggle to believe it.",
    body: "Shortlistr scans every resume against the specific job description and returns an ATS score from 0–100, plus a plain-English breakdown of every keyword gap. Now you have data, not opinions — and your client has a reason to trust the fix.",
    outcome: 'Skeptical clients become believers the moment they see their own score.',
    mockup: <ATSMockup />,
    reverse: false,
  },
  {
    tag: 'Feature 2 — AI Resume Rewriter',
    headline: 'Deliver a polished resume without rewriting every bullet yourself',
    problem: "Manual line-by-line edits don't scale when you're managing 10+ clients at once.",
    body: "Shortlistr rewrites your client's bullets with optimized keywords — in their voice, based on their experience. You review, approve, and move on. What used to take 2 hours per client takes 10 minutes.",
    outcome: 'Same quality output. A fraction of your time per client.',
    mockup: <BulletMockup />,
    reverse: true,
  },
  {
    tag: 'Feature 3 — Cover Letter Generator',
    headline: 'One more deliverable that makes you look thorough',
    problem: "Most coaches skip cover letters — they're too time-consuming to do well at scale.",
    body: "Shortlistr reads the job description and writes a tailored cover letter that matches the role's language and highlights your client's relevant experience. Add it to every package without adding hours to your workload.",
    outcome: 'Clients get more. You spend nothing extra per application.',
    mockup: <CoverLetterMockup />,
    reverse: false,
  },
  {
    tag: 'Feature 4 — Before/After Scorecard',
    headline: 'Give clients proof their investment is paying off',
    problem: "Coaching is hard to quantify. Clients want to see results, not just hear about them.",
    body: "After every optimization, Shortlistr generates a before/after ATS scorecard your client can screenshot, share, or use to track progress. They see the lift. They tell their network. Measurable outcomes become your best marketing.",
    outcome: 'Quantified results that clients share with their network.',
    mockup: <ScorecardMockup />,
    reverse: true,
  },
]

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Features() {
  const { profile } = useAuth()
  const ctaHref = '/auth?mode=signup'

  return (
    <Layout>
      <Helmet>
        <title>ShortListr Features — Resume Tools for Career Coaches</title>
        <meta name="description" content="See every tool ShortListr offers career coaches: ATS keyword scoring per client, AI resume rewriting, cover letter generation, and before/after scorecards. Run your practice like a real agency." />
        <link rel="canonical" href="https://shortlistr.us/features" />
        <meta property="og:url" content="https://shortlistr.us/features" />
        <meta property="og:title" content="ShortListr Features — Resume Tools for Career Coaches" />
        <meta property="og:description" content="ATS scoring, AI rewrites, cover letters, and client scorecards in one workspace. Four tools. One practice. $99/mo." />
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full" style={{ width: 600, height: 600, top: '-20%', left: '-8%', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)' }} />
          <div className="absolute rounded-full" style={{ width: 400, height: 400, bottom: '-15%', right: '-5%', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 65%)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold"
              style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#3b82f6' }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3b82f6' }} />
              Four tools. One practice. Everything included.
            </div>
            <h1 className="text-3xl sm:text-5xl font-black mb-5 tracking-tight leading-tight" style={{ color: '#0a0b0d' }}>
              Every tool your practice needs<br />
              <span style={{ color: '#3b82f6' }}>to look like a real agency.</span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: '#475569' }}>
              ATS scoring, AI rewrites, cover letters, and client scorecards — all in one workspace. No juggling browser tabs. No losing track of which draft you sent.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className="inline-block">
              <Link
                to={ctaHref}
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-base btn-shimmer"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', boxShadow: '0 8px 32px rgba(59,130,246,0.25)' }}
              >
                Start your practice
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            <p className="text-xs mt-3" style={{ color: '#94a3b8' }}>14-day free trial · No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE SECTIONS ── */}
      {features.map((f, idx) => (
        <section key={f.tag} style={{
          background: idx % 2 === 0 ? '#ffffff' : '#fafbfc',
          borderTop: '1px solid #e5e7eb',
        }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

              {/* Text side */}
              <motion.div
                initial={{ opacity: 0, x: f.reverse ? 24 : -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className={f.reverse ? 'lg:order-2' : ''}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: '#3b82f6' }}>{f.tag}</p>
                <h2 className="text-2xl sm:text-3xl font-black mb-4 leading-tight" style={{ color: '#0a0b0d' }}>{f.headline}</h2>
                <p className="text-sm font-semibold mb-3" style={{ color: '#64748b' }}>
                  <span style={{ color: '#dc2626' }}>The problem: </span>{f.problem}
                </p>
                <p className="text-base leading-relaxed" style={{ color: '#475569' }}>{f.body}</p>
                <OutcomeCallout text={f.outcome} />
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.13 }} className="inline-block mt-5">
                  <Link
                    to={ctaHref}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold"
                    style={{ border: '1px solid #bfdbfe', color: '#3b82f6', background: '#eff6ff' }}
                  >
                    Try this free
                    <ArrowRight size={14} />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Mockup side */}
              <motion.div
                initial={{ opacity: 0, x: f.reverse ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.08 }}
                className={f.reverse ? 'lg:order-1' : ''}
              >
                {f.mockup}
              </motion.div>

            </div>
          </div>
        </section>
      ))}

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3b82f6' }}>From coaches using Shortlistr</p>
            <h2 className="text-2xl sm:text-3xl font-black" style={{ color: '#0a0b0d' }}>Results from real practices.</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((t, i) => (
              <motion.figure
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, ease: EASE_OUT, delay: i * 0.1 }}
                className="rounded-2xl p-6 flex flex-col"
                style={{ background: '#fafbfc', border: '1px solid #e5e7eb' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width="13" height="13" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #86efac' }}>{t.result}</span>
                </div>
                <p className="text-sm font-bold mb-2" style={{ color: '#0a0b0d' }}>{t.outcome}</p>
                <blockquote className="text-sm leading-relaxed flex-1 mb-5" style={{ color: '#475569' }}>"{t.quote}"</blockquote>
                <figcaption>
                  <p className="font-semibold text-sm" style={{ color: '#0a0b0d' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{t.role}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section style={{ background: '#fafbfc', borderTop: '1px solid #e5e7eb' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: '#ecfdf5', border: '1px solid #86efac' }}>
              <ShieldCheck size={24} style={{ color: '#059669' }} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#059669' }}>Backed by our guarantee</p>
            <p className="text-lg font-black mb-3" style={{ color: '#0a0b0d' }}>Every client's resume score goes up, or your money back.</p>
            <p className="text-sm" style={{ color: '#475569' }}>
              If a client's ATS score doesn't improve after optimization, email us within 30 days and we'll refund your next month. One email. No forms. No questions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderTop: '1px solid #bfdbfe' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-4xl font-black mb-4 leading-tight" style={{ color: '#0a0b0d' }}>
              See it work on your first client's resume.
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: '#475569' }}>
              Add a client, paste their resume and a target job description. Shortlistr returns an ATS score and every gap — in 90 seconds.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className="inline-block mb-3">
              <Link
                to={ctaHref}
                className="flex items-center gap-2.5 px-10 py-5 rounded-2xl font-black text-lg btn-shimmer"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#ffffff', boxShadow: '0 12px 40px rgba(59,130,246,0.28)' }}
              >
                Start your practice
                <ArrowRight size={20} />
              </Link>
            </motion.div>
            <p className="text-xs" style={{ color: '#64748b' }}>14-day free trial · No credit card required</p>
          </motion.div>
        </div>
      </section>

    </Layout>
  )
}
