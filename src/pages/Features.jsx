import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

/* ─── SVG Icons ─────────────────────────────────────────────────────────── */
function IconScan() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M10 12h4M12 10v4" />
    </svg>
  )
}
function IconSparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M9.937 15.5A2 2 0 008.5 14.063l-6.135-1.582a.5.5 0 010-.962L8.5 9.936A2 2 0 009.937 8.5l1.582-6.135a.5.5 0 01.963 0L14.063 8.5A2 2 0 0015.5 9.937l6.135 1.581a.5.5 0 010 .964L15.5 14.063a2 2 0 00-1.437 1.437l-1.582 6.135a.5.5 0 01-.963 0z" />
    </svg>
  )
}
function IconDoc() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}
function IconHistory() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
function IconArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

/* ─── Browser Chrome Wrapper ─────────────────────────────────────────────── */
function BrowserWindow({ children, url = 'app.shortlistr.io/optimize', className = '' }) {
  return (
    <div className={`float-b rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-300/40 dark:shadow-black/40 ${className}`}>
      {/* Title bar */}
      <div className="bg-slate-100 dark:bg-navy-700 px-4 py-3 flex items-center gap-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white dark:bg-navy-800 rounded-md px-3 py-1 flex items-center gap-2">
          <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <span className="text-[11px] text-slate-400 font-mono truncate">{url}</span>
        </div>
      </div>
      {/* Content */}
      <div className="bg-white dark:bg-navy-800">
        {children}
      </div>
    </div>
  )
}

/* ─── ATS Keyword Mockup ─────────────────────────────────────────────────── */
const keywords = [
  { word: 'TypeScript', match: true, weight: 'high' },
  { word: 'distributed systems', match: true, weight: 'high' },
  { word: 'Kubernetes', match: false, weight: 'high' },
  { word: 'CI/CD pipelines', match: false, weight: 'med' },
  { word: 'REST APIs', match: true, weight: 'med' },
  { word: 'cross-functional', match: false, weight: 'med' },
  { word: 'system design', match: true, weight: 'low' },
  { word: 'observability', match: false, weight: 'low' },
]

function ATSMockup() {
  const [active, setActive] = useState(null)
  const found = keywords.filter(k => k.match).length
  const score = Math.round((found / keywords.length) * 100)

  return (
    <BrowserWindow url="app.shortlistr.io/optimize · ATS Analysis">
      <div className="p-5">
        {/* Score bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">ATS Match Score</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{score}<span className="text-base font-medium text-slate-400">%</span></p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-0.5">Senior Engineer · Stripe</p>
            <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">Needs improvement</span>
          </div>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-navy-700 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-electric-500 to-violet-500 bar-fill"
            style={{ width: `${score}%` }}
          />
        </div>
        {/* Keywords */}
        <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-2.5 font-medium">Keywords from job description</p>
        <div className="space-y-1.5">
          {keywords.map((k) => (
            <button
              key={k.word}
              onClick={() => setActive(active === k.word ? null : k.word)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                active === k.word
                  ? 'ring-2 ring-electric-500/50 bg-electric-500/5'
                  : 'hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  k.weight === 'high' ? 'bg-red-400' : k.weight === 'med' ? 'bg-amber-400' : 'bg-slate-300'
                }`} />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{k.word}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                k.match
                  ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                  : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
              }`}>
                {k.match ? '✓ found' : '✗ missing'}
              </span>
            </button>
          ))}
        </div>
        {active && !keywords.find(k => k.word === active)?.match && (
          <div className="mt-3 p-3 bg-electric-500/10 rounded-xl border border-electric-500/20 text-xs text-electric-600 dark:text-electric-400">
            <span className="font-semibold">Suggestion:</span> Add "{active}" to your experience section or skills list
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
    setTimeout(() => {
      setShowAfter(v => !v)
      setAnimating(false)
    }, 200)
  }

  return (
    <BrowserWindow url="app.shortlistr.io/optimize · Bullet Rewriter">
      <div className="p-5">
        {/* Toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Experience bullet</p>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-700 rounded-lg p-0.5">
            <button
              onClick={() => { if (showAfter) handleToggle() }}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                !showAfter ? 'bg-white dark:bg-navy-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >Before</button>
            <button
              onClick={() => { if (!showAfter) handleToggle() }}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                showAfter ? 'bg-white dark:bg-navy-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >After</button>
          </div>
        </div>

        {/* Bullet text */}
        <div className={`transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          {!showAfter ? (
            <div className="bg-slate-50 dark:bg-navy-700 rounded-xl p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                "Worked on improving the checkout flow for the e-commerce platform."
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-electric-500/10 to-violet-500/10 border border-electric-500/20 rounded-xl p-4">
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                "Redesigned the checkout funnel for a 2M-user e-commerce platform, reducing cart abandonment by 23% and increasing monthly revenue by $140K."
              </p>
            </div>
          )}
        </div>

        {/* Stats comparison */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: 'Impact words', before: '0', after: '4', good: true },
            { label: 'Metrics', before: '0', after: '3', good: true },
            { label: 'ATS score', before: '31%', after: '92%', good: true },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-50 dark:bg-navy-700 rounded-lg p-2.5 text-center">
              <p className={`text-lg font-bold ${showAfter ? 'text-electric-500' : 'text-slate-400'}`}>
                {showAfter ? stat.after : stat.before}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Rewrite button */}
        <button
          onClick={handleToggle}
          className="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-electric-500 to-violet-500 text-white hover:from-electric-400 hover:to-violet-400 transition-all shadow-md shadow-electric-500/25 flex items-center justify-center gap-2"
        >
          <IconSparkle />
          {showAfter ? 'Generate another variation' : 'Rewrite with AI'}
        </button>
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

  const lines = [
    { text: 'Dear Hiring Team,', delay: 0 },
    { text: "I'm excited to apply for the Senior Frontend Engineer role at Stripe. With 5+ years building high-performance React applications at scale, I'm particularly drawn to Stripe's mission of increasing the GDP of the internet.", delay: 200 },
    { text: "In my current role at Acme Corp, I led a team of 4 engineers to re-architect our payment flows, reducing transaction failure rates by 18% and improving page load time by 40% — directly comparable to the challenges outlined in your job description.", delay: 400 },
  ]

  return (
    <BrowserWindow url="app.shortlistr.io/optimize · Cover Letter">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Cover Letter Preview</p>
          {done && (
            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <IconCheck />Ready to export
            </span>
          )}
        </div>

        {/* Document */}
        <div className="bg-slate-50 dark:bg-navy-700 rounded-xl p-4 min-h-[160px] relative overflow-hidden">
          {!done && !generating && (
            <div className="flex flex-col items-center justify-center h-full py-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-navy-600 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
                <IconDoc />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Click generate to create your personalized cover letter</p>
            </div>
          )}
          {generating && (
            <div className="space-y-2">
              {[80, 100, 95, 70, 85].map((w, i) => (
                <div
                  key={i}
                  className="h-2.5 bg-gradient-to-r from-electric-500/30 to-violet-500/30 rounded-full animate-pulse"
                  style={{ width: `${w}%`, animationDelay: `${i * 100}ms` }}
                />
              ))}
              <p className="text-[10px] text-electric-500 font-medium mt-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-electric-500 rounded-full animate-ping inline-block" />
                Generating your cover letter...
              </p>
            </div>
          )}
          {done && (
            <div className="space-y-2.5 text-xs leading-relaxed">
              {lines.map((line, i) => (
                <p key={i} className={`text-slate-700 dark:text-slate-300 ${i === 0 ? 'font-semibold' : ''}`}>
                  {line.text}
                </p>
              ))}
              <p className="text-electric-500 text-[10px] font-medium cursor-pointer">Continue reading...</p>
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating}
          className={`mt-4 w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            done
              ? 'bg-slate-100 dark:bg-navy-700 text-slate-500 cursor-default'
              : 'bg-gradient-to-r from-electric-500 to-violet-500 text-white hover:from-electric-400 hover:to-violet-400 shadow-md shadow-electric-500/25'
          }`}
        >
          {done ? (
            <><IconCheck />Cover letter ready — click to export PDF</>
          ) : generating ? (
            'Writing your cover letter...'
          ) : (
            <><IconSparkle />Generate cover letter</>
          )}
        </button>
      </div>
    </BrowserWindow>
  )
}

/* ─── Version History Mockup ─────────────────────────────────────────────── */
const versions = [
  { role: 'Senior Engineer', company: 'Stripe', date: 'Today, 2:14pm', score: 94, color: 'from-green-400 to-emerald-500' },
  { role: 'Staff Engineer', company: 'Linear', date: 'Yesterday', score: 89, color: 'from-blue-400 to-electric-500' },
  { role: 'Frontend Lead', company: 'Vercel', date: '3 days ago', score: 91, color: 'from-violet-400 to-purple-500' },
  { role: 'Product Engineer', company: 'Figma', date: 'Last week', score: 86, color: 'from-amber-400 to-orange-500' },
]

function VersionMockup() {
  const [selected, setSelected] = useState(0)

  return (
    <BrowserWindow url="app.shortlistr.io/dashboard · Versions">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-full p-4 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-3">Saved versions</p>
          {versions.map((v, i) => (
            <button
              key={v.company}
              onClick={() => setSelected(i)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                selected === i
                  ? 'bg-electric-500/10 ring-1 ring-electric-500/30'
                  : 'hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              {/* Score ring */}
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                {v.score}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{v.role}</p>
                <p className="text-[10px] text-slate-400 truncate">{v.company} · {v.date}</p>
              </div>
              {selected === i && (
                <div className="shrink-0 text-electric-500">
                  <IconArrowRight />
                </div>
              )}
            </button>
          ))}
          {/* Export row */}
          <div className="pt-2 flex gap-2">
            <button className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-navy-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-600 transition-colors">
              Export PDF
            </button>
            <button className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-navy-700 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-600 transition-colors">
              Export DOCX
            </button>
          </div>
        </div>
      </div>
    </BrowserWindow>
  )
}

/* ─── Stat Pill ──────────────────────────────────────────────────────────── */
function StatPill({ value, label }) {
  return (
    <div className="hover-lift bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-center shadow-sm">
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}

/* ─── Feature Section ────────────────────────────────────────────────────── */
function FeatureSection({ tag, title, description, bullets, mockup, reverse = false, accent = 'electric' }) {
  const accentClasses = {
    electric: 'text-electric-500 dark:text-electric-400',
    violet: 'text-violet-500 dark:text-violet-400',
    emerald: 'text-emerald-500 dark:text-emerald-400',
    amber: 'text-amber-500 dark:text-amber-400',
  }
  const sectionRef = useScrollReveal()

  return (
    <div ref={sectionRef} className={`reveal grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
      <div>
        <p className={`text-sm font-semibold uppercase tracking-wider mb-3 ${accentClasses[accent]}`}>{tag}</p>
        <h2 className="text-3xl xl:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">{title}</h2>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-7 text-base">{description}</p>
        <ul className="space-y-3">
          {bullets.map(b => (
            <li key={b} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm">
              <span className="w-5 h-5 rounded-full bg-electric-500/10 text-electric-500 flex items-center justify-center shrink-0 mt-0.5">
                <IconCheck />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? 'lg:order-1' : ''}>
        {mockup}
      </div>
    </div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export default function Features() {
  const { profile } = useAuth()
  const isPro = profile?.tier === 'pro'

  return (
    <Layout>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-white/10">
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.09)_1px,transparent_0)] [background-size:28px_28px]" />
        {/* Glow blobs */}
        <div className="orb-drift absolute top-0 left-1/4 w-96 h-96 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="orb-drift2 absolute bottom-0 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-electric-500/10 border border-electric-500/30 text-electric-600 dark:text-electric-400 text-sm px-4 py-1.5 rounded-full mb-7 font-medium">
            <span className="w-1.5 h-1.5 bg-electric-500 rounded-full animate-pulse" />
            Everything included in Pro
          </div>
          <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.05]">
            Four tools for{' '}
            <span className="bg-gradient-to-r from-electric-500 via-blue-500 to-violet-500 bg-clip-text text-transparent gradient-animate">
              resume optimization
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered tools for ATS keyword matching, bullet rewriting, cover letter generation, and version management — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isPro ? (
              <Link to="/optimize">
                <Button size="lg">Go to Optimizer</Button>
              </Link>
            ) : (
              <>
                <Link to="/auth?mode=signup">
                  <Button size="lg">Start for free</Button>
                </Link>
                <Link to="/pricing" className="text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5">
                  See pricing <IconArrowRight />
                </Link>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-16">
            <StatPill value="75%" label="Resumes filtered by ATS" />
            <StatPill value="4" label="AI-powered tools" />
            <StatPill value="60s" label="Average optimization" />
          </div>
        </div>
      </section>

      {/* ── ATS Keyword Matching ── */}
      <section className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <FeatureSection
            tag="ATS Keyword Matching"
            title="See exactly which keywords your resume is missing"
            description="Over 75% of resumes are filtered by Applicant Tracking Systems before reaching a recruiter. ShortListr scans any job description and surfaces every keyword your resume is missing — ranked by importance and weighted by frequency."
            bullets={[
              'Side-by-side keyword gap analysis in seconds',
              'Keywords ranked by importance and frequency',
              'Industry-specific terminology detection',
              'One-click insertion suggestions with context',
            ]}
            mockup={<ATSMockup />}
            accent="electric"
          />
        </div>
      </section>

      {/* ── AI Bullet Rewriting ── */}
      <section className="bg-slate-50 dark:bg-navy-800/60 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <FeatureSection
            tag="AI Bullet Rewriting"
            title="Rewrite experience bullets using the STAR method"
            description="Vague bullet points are hard for both ATS and recruiters to parse. The AI rewrites your experience using the STAR method — Situation, Task, Action, Result — adding quantified context where possible based on your original content."
            bullets={[
              'STAR-method restructuring on every bullet',
              'Auto-suggests metrics, percentages, and dollar amounts',
              'Tone matched to company culture and role level',
              'Multiple rewrites to choose your favorite',
            ]}
            mockup={<BulletMockup />}
            reverse
            accent="violet"
          />
        </div>
      </section>

      {/* ── Cover Letter ── */}
      <section className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <FeatureSection
            tag="Cover Letter Generation"
            title="A tailored cover letter in 30 seconds"
            description="Stop staring at a blank page. ShortListr reads your resume and the job description together, then writes a personalized, professional cover letter that directly connects your experience to what the company is looking for."
            bullets={[
              "Pulls specific details from your actual experience",
              "Matches the job posting's tone and language",
              'Fully editable in-browser before you export',
              'Multiple style and length variations',
            ]}
            mockup={<CoverLetterMockup />}
            accent="emerald"
          />
        </div>
      </section>

      {/* ── Version History ── */}
      <section className="bg-slate-50 dark:bg-navy-800/60 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <FeatureSection
            tag="Version History"
            title="Never lose a perfectly tailored draft again"
            description="Every optimization you run is automatically saved with the job title, company, and your ATS score. Switch between versions instantly and re-use past optimizations as starting points for similar roles."
            bullets={[
              'Automatic saves on every single optimization',
              'Searchable by company name and role title',
              'ATS score tracked for every saved version',
              'Export any version as PDF or DOCX instantly',
            ]}
            mockup={<VersionMockup />}
            reverse
            accent="amber"
          />
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <p className="text-electric-500 dark:text-electric-400 text-sm font-semibold uppercase tracking-wider mb-3">Simple by design</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Three steps. Under 60 seconds.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-16 text-base">
            No tutorials, no setup, no complexity. Paste and go.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Connector lines */}
            <div className="hidden md:block absolute top-12 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px bg-gradient-to-r from-electric-500/40 to-violet-500/40" />

            {[
              {
                step: '01',
                title: 'Paste your resume',
                desc: 'Drop in your existing resume as plain text or upload a PDF. Any format works.',
                icon: <IconDoc />,
              },
              {
                step: '02',
                title: 'Add the job description',
                desc: 'Copy the job posting you want to apply for, or paste the URL.',
                icon: <IconScan />,
              },
              {
                step: '03',
                title: 'Get your optimized resume',
                desc: 'AI analyzes the gap and returns a tailored, ATS-ready resume with a match score.',
                icon: <IconSparkle />,
              },
            ].map((s, i) => (
              <div key={s.step} className="relative bg-white dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm hover:shadow-lg dark:hover:border-white/20 transition-all text-left">
                {/* Step number */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-500 to-violet-500 flex items-center justify-center text-white">
                    {s.icon}
                  </div>
                  <span className="text-3xl font-black text-slate-100 dark:text-white/10 select-none">{s.step}</span>
                </div>
                <h3 className="text-slate-900 dark:text-white font-bold text-base mb-2">{s.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section className="bg-slate-50 dark:bg-navy-800/60 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <p className="text-electric-500 dark:text-electric-400 text-sm font-semibold uppercase tracking-wider mb-3">Everything you need</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Everything included
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <IconScan />, title: 'ATS Scanner', desc: 'Instant keyword gap analysis against any job description.' },
              { icon: <IconSparkle />, title: 'AI Bullet Rewriter', desc: 'STAR-method rewrites with quantified achievements.' },
              { icon: <IconDoc />, title: 'Cover Letter AI', desc: 'Personalized letters in 30 seconds, fully editable.' },
              { icon: <IconHistory />, title: 'Version History', desc: 'Every optimized version saved and exportable.' },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M9 15l2 2 4-4" />
                  </svg>
                ),
                title: 'PDF Export',
                desc: 'Download any version as a formatted PDF or DOCX file.',
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
                title: 'Real-Time Feedback',
                desc: 'Live ATS score as you edit, updated on every change.',
              },
            ].map(item => (
              <div key={item.title} className="bg-white dark:bg-navy-800 rounded-2xl border border-slate-200 dark:border-white/10 p-5 hover:shadow-md dark:hover:border-white/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-electric-500/10 text-electric-500 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-slate-900 dark:text-white font-semibold text-sm mb-1.5">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-navy-900 to-slate-900 dark:from-navy-900 dark:via-slate-900 dark:to-navy-900">
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="absolute top-0 left-1/3 w-96 h-64 bg-electric-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-80 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
            See what your resume looks like optimized.
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Paste your resume and a job description. ShortListr shows you the keyword gaps and rewrites your content to address them.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isPro ? (
              <Link to="/optimize">
                <button className="bg-gradient-to-r from-electric-500 to-violet-500 hover:from-electric-400 hover:to-violet-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-electric-500/30 text-base">
                  Go to Optimizer
                </button>
              </Link>
            ) : (
              <>
                <Link to="/auth?mode=signup">
                  <button className="bg-gradient-to-r from-electric-500 to-violet-500 hover:from-electric-400 hover:to-violet-400 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-electric-500/30 text-base">
                    Get started free
                  </button>
                </Link>
                <Link to="/pricing">
                  <button className="border border-white/20 text-white/80 font-semibold px-8 py-3.5 rounded-xl hover:border-white/40 hover:text-white hover:bg-white/5 transition-all text-base">
                    View pricing
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

    </Layout>
  )
}
