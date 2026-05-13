import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, Sparkles, FileText, Star, ShieldCheck,
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
    <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#13131A' }}>
      <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(239,68,68,0.5)' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(245,158,11,0.5)' }} />
          <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(34,197,94,0.5)' }} />
        </div>
        <div className="flex-1 rounded-md px-3 py-1 flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <span className="text-[11px] font-mono truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{url}</span>
        </div>
      </div>
      <div style={{ background: '#13131A' }}>
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
    <BrowserWindow url="app.shortlistr.us/optimize · ATS Scanner">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>ATS Match Score</p>
            <p className="text-2xl font-black text-white">{score}<span className="text-base font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>%</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Senior Engineer · Stripe</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>Needs improvement</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full" style={{ width: `${score}%`, background: 'linear-gradient(90deg, #EF4444, #F97316)' }} />
        </div>
        <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Keywords from job description</p>
        <div className="space-y-1.5">
          {keywords.map(k => (
            <button key={k.word} onClick={() => setActive(active === k.word ? null : k.word)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
              style={active === k.word ? { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' } : { background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: k.weight === 'high' ? '#EF4444' : k.weight === 'med' ? '#F59E0B' : 'rgba(255,255,255,0.2)' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>{k.word}</span>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={k.match ? { background: 'rgba(0,255,136,0.1)', color: '#00FF88' } : { background: 'rgba(239,68,68,0.1)', color: '#FF6B6B' }}>
                {k.match ? '✓ found' : '✗ missing'}
              </span>
            </button>
          ))}
        </div>
        {active && !keywords.find(k => k.word === active)?.match && (
          <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#93C5FD' }}>
            <span className="font-semibold">Fix:</span> Add "{active}" to your experience or skills section
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
    <BrowserWindow url="app.shortlistr.us/optimize · AI Rewriter">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Experience bullet</p>
          <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <button onClick={() => { if (showAfter) handleToggle() }}
              className="text-[10px] px-3 py-1.5 rounded-md font-medium transition-all"
              style={!showAfter ? { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' } : { color: 'rgba(255,255,255,0.3)' }}>
              Before
            </button>
            <button onClick={() => { if (!showAfter) handleToggle() }}
              className="text-[10px] px-3 py-1.5 rounded-md font-medium transition-all"
              style={showAfter ? { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' } : { color: 'rgba(255,255,255,0.3)' }}>
              After
            </button>
          </div>
        </div>
        <div className={`transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          {!showAfter ? (
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                "Worked on improving the checkout flow for the e-commerce platform."
              </p>
            </div>
          ) : (
            <div className="rounded-xl p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <p className="text-sm leading-relaxed font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
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
            <div key={stat.label} className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-lg font-bold" style={{ color: showAfter ? '#F5C842' : 'rgba(255,255,255,0.2)' }}>
                {showAfter ? stat.after : stat.before}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{stat.label}</p>
            </div>
          ))}
        </div>
        <motion.button
          onClick={handleToggle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.13 }}
          className="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff' }}
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
    <BrowserWindow url="app.shortlistr.us/optimize · Cover Letter">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Cover Letter Preview</p>
          {done && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
              style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.2)' }}>
              <Check size={10} />Ready to export
            </span>
          )}
        </div>
        <div className="rounded-xl p-4 min-h-[140px] relative" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {!done && !generating && (
            <div className="flex flex-col items-center justify-center h-full py-6 text-center">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <FileText size={18} style={{ color: 'rgba(255,255,255,0.35)' }} />
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Click generate to create your tailored cover letter</p>
            </div>
          )}
          {generating && (
            <div className="space-y-2">
              {[80, 100, 95, 70, 85].map((w, i) => (
                <div key={i} className="h-2 rounded-full animate-pulse"
                  style={{ width: `${w}%`, background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))', animationDelay: `${i * 100}ms` }} />
              ))}
              <p className="text-[10px] flex items-center gap-1.5 mt-2" style={{ color: '#3B82F6' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-ping inline-block" style={{ background: '#3B82F6' }} />
                Writing your cover letter…
              </p>
            </div>
          )}
          {done && (
            <div className="space-y-2 text-xs leading-relaxed">
              <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>Dear Hiring Team,</p>
              <p style={{ color: 'rgba(255,255,255,0.45)' }}>
                I'm excited to apply for the Senior Frontend Engineer role at Stripe. With 5+ years building high-performance React applications at scale, I'm particularly drawn to Stripe's mission…
              </p>
              <p className="font-medium cursor-pointer" style={{ color: '#3B82F6' }}>Continue reading →</p>
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
            ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
            : { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff' }}
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

/* ─── Rejection Report Mockup ────────────────────────────────────────────── */
function RejectionReportMockup() {
  return (
    <BrowserWindow url="app.shortlistr.us/optimize · Rejection Report">
      <div className="p-5">
        <p className="text-[10px] uppercase tracking-wider font-medium mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>Why You Were Rejected</p>
        <div className="space-y-2">
          {[
            { level: 'Critical', issue: 'Missing 6 high-priority keywords from job description', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', badge: 'rgba(239,68,68,0.12)', badgeText: '#EF4444' },
            { level: 'High',     issue: '"Results" section header not recognized by ATS parser', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)', badge: 'rgba(245,158,11,0.12)', badgeText: '#F59E0B' },
            { level: 'High',     issue: 'No quantified achievements detected in last 2 roles',  bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)', badge: 'rgba(245,158,11,0.12)', badgeText: '#F59E0B' },
            { level: 'Low',      issue: 'Education section placed below skills (suboptimal order)', bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.07)', badge: 'rgba(255,255,255,0.08)', badgeText: 'rgba(255,255,255,0.4)' },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: r.bg, border: `1px solid ${r.border}` }}>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                style={{ background: r.badge, color: r.badgeText }}>{r.level}</span>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{r.issue}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <p className="text-xs font-semibold" style={{ color: '#93C5FD' }}>Fix these 4 issues to increase your score by ~47 points.</p>
        </div>
      </div>
    </BrowserWindow>
  )
}

/* ─── Before/After Scorecard Mockup ─────────────────────────────────────── */
function ScorecardMockup() {
  return (
    <BrowserWindow url="app.shortlistr.us/optimize · Scorecard">
      <div className="p-5">
        <p className="text-[10px] uppercase tracking-wider font-medium mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Before & After</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>Before</p>
            <p className="text-4xl font-black" style={{ color: '#EF4444' }}>41</p>
            <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>ATS Score</p>
          </div>
          <div className="text-center p-4 rounded-xl" style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.2)' }}>
            <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>After</p>
            <p className="text-4xl font-black" style={{ color: '#00FF88' }}>88</p>
            <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>ATS Score</p>
          </div>
        </div>
        <div className="text-center p-3 rounded-xl mb-3" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}>
          <p className="text-sm font-black text-white">+47 pts improvement</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>After first optimization</p>
        </div>
        <button className="w-full py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5"
          style={{ background: 'rgba(245,200,66,0.1)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.2)' }}>
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
      style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: '#3B82F6' }}>
        <Check size={11} style={{ color: '#fff' }} />
      </div>
      <p className="text-sm font-semibold text-white">{text}</p>
    </div>
  )
}

/* ─── Star Rating ────────────────────────────────────────────────────────── */
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

const features = [
  {
    tag: 'Feature 1 — ATS Resume Scanner',
    headline: "Find out why you're getting rejected — in 90 seconds",
    problem: 'Most resumes are rejected before a human ever reads them.',
    body: "Shortlistr scans your resume against the exact criteria ATS systems use and gives you a score from 0–100 — plus a breakdown of every reason you're getting filtered out.",
    outcome: 'Users see their ATS score jump an average of 34 points after their first optimization.',
    mockup: <ATSMockup />,
    reverse: false,
  },
  {
    tag: 'Feature 2 — AI Resume Rewriter',
    headline: 'Your resume, rewritten to beat the algorithm',
    problem: "ATS filters on keywords. Your resume might have the right experience but the wrong words.",
    body: "Shortlistr doesn't just tell you what's missing — it rewrites your resume with the right keywords, in the right places, without making it sound like a robot wrote it. Your experience. Your voice. ATS-optimized.",
    outcome: 'Same qualifications. Better framing. More callbacks.',
    mockup: <BulletMockup />,
    reverse: true,
  },
  {
    tag: 'Feature 3 — Cover Letter Generator',
    headline: 'A cover letter tailored to every job — in seconds',
    problem: 'Generic cover letters get ignored. Tailoring every application by hand takes hours.',
    body: "Shortlistr reads the job description and writes a targeted cover letter that matches the role's language, highlights your relevant experience, and passes ATS keyword checks.",
    outcome: 'Apply faster. Stand out more. Never write from scratch again.',
    mockup: <CoverLetterMockup />,
    reverse: false,
  },
  {
    tag: 'Feature 4 — Rejection Reason Report',
    headline: "Stop guessing why you're not hearing back",
    problem: "You send applications. You hear nothing. You have no idea what's wrong.",
    body: "Shortlistr generates a plain-English report that shows you exactly which keywords you're missing, which sections are hurting you, and what to fix first. No jargon. No fluff. Just the specific things keeping you from callbacks.",
    outcome: 'Know exactly what to fix before your next application.',
    mockup: <RejectionReportMockup />,
    reverse: true,
  },
  {
    tag: 'Feature 5 — Before/After Scorecard',
    headline: 'Proof your resume actually improved',
    problem: "You changed your resume. But did it actually get better? You can't tell.",
    body: 'After optimization, Shortlistr generates a shareable scorecard showing your before and after ATS score. Screenshot it. Share it. Use it to hold yourself accountable.',
    outcome: 'See the improvement. Feel the difference.',
    mockup: <ScorecardMockup />,
    reverse: false,
  },
]

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Features() {
  const { profile } = useAuth()
  const isPro = profile?.tier === 'pro'
  const ctaHref = '/auth?mode=signup'

  return (
    <Layout>
      <Helmet>
        <title>ShortListr Features — ATS Optimizer, AI Bullet Rewriter & Cover Letter Generator</title>
        <meta name="description" content="See every tool ShortListr offers: ATS keyword scoring, AI bullet point rewriting, cover letter generation, rejection reason reports, and before/after scorecards. Beat ATS filters and get more interviews." />
        <link rel="canonical" href="https://shortlistr.us/features" />
        <meta property="og:url" content="https://shortlistr.us/features" />
        <meta property="og:title" content="ShortListr Features — ATS Optimizer, AI Bullet Rewriter & Cover Letter Generator" />
        <meta property="og:description" content="Every tool you need to stop getting rejected and start getting interviews. ATS scoring, AI rewrites, cover letters, and more." />
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: '#0A0A0F', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: 'rgba(255,255,255,0.7)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3B82F6' }} />
              Five tools. One price. Everything included.
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-5 tracking-tight leading-tight">
              Every tool you need to stop getting rejected<br />
              <span style={{ background: 'linear-gradient(135deg, #F5C842, #fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                and start getting interviews.
              </span>
            </h1>
            <p className="text-lg max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Shortlistr doesn't just show you a score. It tells you exactly what's wrong, fixes it, and gives you proof it worked.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className="inline-block">
              <Link
                to={ctaHref}
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-base"
                style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 8px 32px rgba(245,200,66,0.35)' }}
              >
                Try it free — no card required
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Takes 90 seconds</p>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE SECTIONS ── */}
      {features.map((f, idx) => (
        <section key={f.tag} style={{
          background: idx % 2 === 0 ? '#0A0A0F' : 'rgba(255,255,255,0.015)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
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
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: '#3B82F6' }}>{f.tag}</p>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">{f.headline}</h2>
                <p className="text-sm font-semibold mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: '#EF4444' }}>Problem:</span> {f.problem}
                </p>
                <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{f.body}</p>
                <OutcomeCallout text={f.outcome} />
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.13 }} className="inline-block mt-5">
                  <Link
                    to={ctaHref}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold"
                    style={{ border: '1px solid rgba(245,200,66,0.3)', color: '#F5C842', background: 'rgba(245,200,66,0.05)' }}
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
      <section style={{ background: '#0A0A0F', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3B82F6' }}>Real results</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white">They used every one of these tools.</h2>
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
                style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <StarRating />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.2)' }}>{t.result}</span>
                </div>
                <p className="text-sm font-bold text-white mb-2">{t.outcome}</p>
                <blockquote className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>"{t.quote}"</blockquote>
                <figcaption>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.role}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)' }}>
              <ShieldCheck size={24} style={{ color: '#00FF88' }} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#00FF88' }}>Backed by our guarantee</p>
            <p className="text-lg font-black text-white mb-3">Every feature is backed by our score improvement guarantee.</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Your ATS score goes up, or your first month is free. One email. No forms. No questions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section style={{ background: '#0A0A0F', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 leading-tight">
              See it work on your own resume.
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Paste your resume and a job description. Shortlistr shows you your ATS score and exactly what's wrong — free, in 90 seconds.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className="inline-block mb-3">
              <Link
                to={ctaHref}
                className="flex items-center gap-2.5 px-10 py-5 rounded-2xl font-black text-lg"
                style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 12px 40px rgba(245,200,66,0.35)' }}
              >
                Scan my resume free
                <ArrowRight size={20} />
              </Link>
            </motion.div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>No credit card required · Takes 90 seconds</p>
          </motion.div>
        </div>
      </section>

    </Layout>
  )
}
