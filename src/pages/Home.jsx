import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'

/* ─────────────────────────────────────────────
   MINI DEMO COMPONENTS
───────────────────────────────────────────── */
const atsKeywords = [
  { word: 'cross-functional collaboration', found: false },
  { word: 'territory management', found: false },
  { word: 'CRM software', found: true },
  { word: 'client retention', found: true },
  { word: 'quota attainment', found: false },
]

function MiniATSCard() {
  return (
    <div className="rounded-xl p-4 space-y-1.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Keyword Gap · Regional Sales Manager</span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>41% match</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full w-[41%] rounded-full" style={{ background: 'linear-gradient(90deg, #EF4444, #F97316)' }} />
      </div>
      {atsKeywords.map(k => (
        <div key={k.word} className="flex items-center justify-between py-1 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{k.word}</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={k.found
            ? { background: 'rgba(0,255,136,0.12)', color: '#00FF88' }
            : { background: 'rgba(255,68,68,0.12)', color: '#FF6B6B' }}>
            {k.found ? '✓ found' : '✗ missing'}
          </span>
        </div>
      ))}
    </div>
  )
}

function MiniBulletCard() {
  const [after, setAfter] = useState(false)
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-1 rounded-lg p-0.5 mb-3 w-fit" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <button onClick={() => setAfter(false)} className="text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all"
          style={!after ? { background: '#1E1E2E', color: 'rgba(255,255,255,0.9)' } : { color: 'rgba(255,255,255,0.3)' }}>Before</button>
        <button onClick={() => setAfter(true)} className="text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all"
          style={after ? { background: '#1E1E2E', color: 'rgba(255,255,255,0.9)' } : { color: 'rgba(255,255,255,0.3)' }}>After</button>
      </div>
      <div className="rounded-lg p-3 transition-all" style={after
        ? { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }
        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs leading-relaxed" style={{ color: after ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)' }}>
          {after
            ? '"Managed 12-person customer service team across 3 locations, reducing complaint resolution time by 34% and increasing satisfaction scores from 72% to 91%."'
            : '"Responsible for managing the customer service team and handling complaints."'}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        {[{ l: 'Impact', b: '0', a: '4' }, { l: 'Metrics', b: '0', a: '3' }, { l: 'ATS', b: '31%', a: '92%' }].map(s => (
          <div key={s.l} className="rounded-lg p-1.5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm font-bold" style={{ color: after ? '#F5C842' : 'rgba(255,255,255,0.25)' }}>{after ? s.a : s.b}</p>
            <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniCoverCard() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const go = () => { if (done || loading) return; setLoading(true); setTimeout(() => { setLoading(false); setDone(true) }, 1400) }
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="min-h-[96px] mb-3">
        {!done && !loading && (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Click to generate a sample cover letter</p>
          </div>
        )}
        {loading && (
          <div className="space-y-2 py-2">
            {[75, 100, 88, 60].map((w, i) => (
              <div key={i} className="h-2 rounded-full animate-pulse" style={{ width: `${w}%`, background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))', animationDelay: `${i * 80}ms` }} />
            ))}
            <p className="text-[10px] flex items-center gap-1 mt-1" style={{ color: '#3B82F6' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-ping inline-block" style={{ background: '#3B82F6' }} />Writing…
            </p>
          </div>
        )}
        {done && (
          <div className="text-xs leading-relaxed space-y-1.5">
            <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>Dear Hiring Manager,</p>
            <p style={{ color: 'rgba(255,255,255,0.45)' }} className="line-clamp-3">
              I am writing to express my interest in the Marketing Coordinator position at Horizon Brands. With three years of experience developing multi-channel campaigns that consistently delivered above-target engagement…
            </p>
            <p className="text-[10px] font-medium" style={{ color: '#3B82F6' }}>Continue reading →</p>
          </div>
        )}
      </div>
      <button onClick={go} disabled={loading || done}
        className="w-full py-2 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 disabled:cursor-default"
        style={done
          ? { background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }
          : { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: '#fff' }}>
        {done ? '✦ Cover letter ready — review and download' : loading ? 'Writing…' : '✦ Generate sample cover letter'}
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────────── */
function StarRating() {
  return (
    <span className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="#F5C842">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  )
}

const LinkedInIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const testimonials = [
  {
    outcome: 'Got 3 callbacks the week after using Shortlistr.',
    quote: 'Applied to the same companies twice — completely different results. The ATS score jumped from 41 to 88 after one optimization.',
    name: 'Marcus T.',
    role: 'Software Engineer',
    result: '41 → 88 ATS Score',
  },
  {
    outcome: 'Had a recruiter call me the morning after I used it.',
    quote: "Spent 3 months applying with the same resume. Used Shortlistr once and heard back the next day. I wish I'd found it sooner.",
    name: 'Sarah K.',
    role: 'Operations Analyst · Austin, TX',
    result: 'Interview in 9 days',
  },
  {
    outcome: '4 offers in 30 days.',
    quote: 'The cover letter alone is worth the price. It pulled specific details from my resume and the JD that I never would have thought to include.',
    name: 'James R.',
    role: 'Account Executive · New York, NY',
    result: '4 offers in 30 days',
  },
]

const valueItems = [
  { label: 'ATS Resume Scanner', desc: 'See your exact score', value: '$29 value' },
  { label: 'AI Resume Rewriter', desc: 'Keyword-optimized in 90 seconds', value: '$49 value' },
  { label: 'Cover Letter Generator', desc: 'Tailored to every job posting', value: '$19 value' },
  { label: 'Before/After Scorecard', desc: 'Shareable PNG of your improvement', value: '$9 value' },
  { label: 'Rejection Reason Report', desc: 'Exactly why ATS rejected you', value: '$19 value' },
]

const faqs = [
  {
    q: 'Do I need a credit card to try it?',
    a: "No. Your first ATS scan is completely free. No card, no commitment. You see your score before you decide to pay anything.",
  },
  {
    q: 'How is this different from free resume checkers?',
    a: "Free tools tell you what's wrong. Shortlistr fixes it — rewriting your resume with the right keywords, restructuring sections ATS can't read, and generating a cover letter tailored to the specific job. It's the difference between a diagnosis and a cure.",
  },
  {
    q: 'How fast will I see results?',
    a: 'Optimization takes under 90 seconds. Most users report their first interview request within 1–2 weeks of using a Shortlistr-optimized resume. Results depend on your field, experience level, and how many applications you send.',
  },
  {
    q: "Will my resume still sound like me?",
    a: 'Yes. The AI rewrites for ATS optimization while keeping your voice, your experience, and your achievements. You review everything before downloading — nothing goes out without your approval.',
  },
  {
    q: "What's the difference between Monthly ($10) and Lifetime ($149)?",
    a: "Same features, same unlimited access. Monthly is $10/mo and you can cancel anytime. Lifetime is a one-time $149 payment — use it forever with no recurring charges. If you plan to use Shortlistr for more than 15 months, Lifetime saves you money.",
  },
  {
    q: 'Can I cancel my monthly plan anytime?',
    a: 'Yes — cancel in one click from your Settings page. No phone calls, no retention emails, no hoops. You keep Pro access through the end of your current billing period.',
  },
]

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function Home() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    const isPro = profile?.tier === 'pro'
    if (isPro) navigate('/dashboard', { replace: true })
    else navigate('/pricing', { replace: true })
  }, [user, profile, navigate])

  const ctaHref = '/auth?mode=signup'

  return (
    <Layout>
      <Helmet>
        <title>ShortListr — AI Resume Optimizer | Beat ATS & Get More Interviews</title>
        <meta name="description" content="Your resume is getting deleted before a human ever sees it. ShortListr uses AI to optimize your resume for ATS in 90 seconds. Free to start — no credit card required." />
        <link rel="canonical" href="https://shortlistr.us/" />
        <meta property="og:url" content="https://shortlistr.us/" />
        <meta property="og:title" content="ShortListr — AI Resume Optimizer | Beat ATS & Get More Interviews" />
        <meta property="og:description" content="Your resume is getting deleted before a human ever sees it. Fix it in 90 seconds with ShortListr's AI-powered ATS optimizer." />
      </Helmet>
      {/* ── Sticky mobile CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-4 pb-4 pt-3"
        style={{ background: 'linear-gradient(to top, #0A0A0F 60%, transparent)', pointerEvents: 'none' }}>
        <Link to={ctaHref} className="block" style={{ pointerEvents: 'auto' }}>
          <button className="w-full py-4 rounded-2xl font-black text-base tracking-tight transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 8px 32px rgba(245,200,66,0.35)' }}>
            Get my ATS score free →
          </button>
        </Link>
      </div>

      <div style={{ background: '#0A0A0F' }}>

        {/* ── 1. HERO ── */}
        <section className="relative overflow-hidden">
          {/* Grid dots */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)' }} />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-10 sm:pb-14 text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: 'rgba(255,255,255,0.7)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3B82F6' }} />
              2,400+ resumes scanned — avg. score lift +34 pts
            </div>

            {/* H1 */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight max-w-3xl mx-auto mb-6">
              Your resume is getting deleted before a human ever sees it.{' '}
              <span style={{ background: 'linear-gradient(135deg, #F5C842 0%, #fde68a 50%, #F5C842 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Fix it in 90 seconds.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Shortlistr scans your resume against ATS systems, shows you exactly why you're getting rejected, and rewrites it to get callbacks. $10/month. Cancel anytime.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <Link to={ctaHref}>
                <button className="px-8 py-4 rounded-2xl font-black text-base transition-all hover:scale-105 active:scale-100"
                  style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 8px 32px rgba(245,200,66,0.35)' }}>
                  Scan my resume free →
                </button>
              </Link>
              <Link to="/features">
                <button className="px-8 py-4 rounded-2xl font-semibold text-sm transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', background: 'transparent' }}>
                  See how it works
                </button>
              </Link>
            </div>

            {/* Trust line */}
            <p className="text-xs mb-10" style={{ color: 'rgba(255,255,255,0.3)' }}>
              No credit card required &nbsp;·&nbsp; Takes 90 seconds &nbsp;·&nbsp; Score goes up or it's free
            </p>

            {/* ── STAT STRIP ── */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              {[
                { value: '2,400+', label: 'Resumes scanned' },
                { value: '+34 pts', label: 'Avg. score lift' },
                { value: '< 90s', label: 'Time to optimize' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-white font-black text-sm">{s.value}</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Social proof avatars */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex -space-x-2">
                {['M', 'S', 'J', 'A', 'R'].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ borderColor: '#0A0A0F', background: ['#3B82F6', '#8B5CF6', '#10B981', '#F5C842', '#EF4444'][i] }}>
                    {l}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <StarRating />
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Trusted by 2,400+ job seekers</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. BEFORE / AFTER ── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3B82F6' }}>Real example</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">What one optimization actually does</h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Same resume. Same person. Same experience.</p>
            </div>

            {/* Score cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl p-5 sm:p-6 text-center" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Before Shortlistr</p>
                <p className="text-5xl sm:text-6xl font-black mb-1" style={{ color: '#EF4444' }}>41</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>/ 100 ATS Score</p>
                <p className="text-[10px] mt-2 px-2 py-0.5 rounded-full inline-block" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>Filtered by ATS</p>
              </div>
              <div className="rounded-2xl p-5 sm:p-6 text-center" style={{ background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.2)' }}>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>After Shortlistr</p>
                <p className="text-5xl sm:text-6xl font-black mb-1" style={{ color: '#00FF88' }}>88</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>/ 100 ATS Score</p>
                <p className="text-[10px] mt-2 px-2 py-0.5 rounded-full inline-block" style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88' }}>Passes ATS ✓</p>
              </div>
            </div>

            {/* What changed */}
            <div className="rounded-2xl p-5 sm:p-6" style={{ background: '#13131A', border: '1px solid rgba(245,200,66,0.2)', boxShadow: '0 0 40px rgba(245,200,66,0.04)' }}>
              <p className="text-sm font-semibold mb-4 text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>Here's what changed:</p>
              <div className="space-y-3">
                {[
                  'Missing: "cross-functional collaboration" — appears 4× in job description, added to experience section',
                  'Section header "Work History" not ATS-recognized — renamed to "Professional Experience"',
                  'No quantified achievements detected — 3 impact metrics added to bullet points',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(245,200,66,0.04)', border: '1px solid rgba(245,200,66,0.1)' }}>
                    <span className="text-sm font-bold shrink-0 mt-0.5" style={{ color: '#F5C842' }}>→</span>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>+47 point improvement. First optimization. 90 seconds.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. SOCIAL PROOF ── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3B82F6' }}>Real results</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white">They were getting ignored. Now they're getting hired.</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t) => (
                <figure key={t.name} className="rounded-2xl p-6 flex flex-col"
                  style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <StarRating />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,255,136,0.1)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.2)' }}>{t.result}</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-2 leading-snug">{t.outcome}</p>
                  <blockquote className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'rgba(255,255,255,0.55)' }}>"{t.quote}"</blockquote>
                  <figcaption>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.role}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. HOW IT WORKS ── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3B82F6' }}>How it works</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                From rejected resume to interview request —
                <span style={{ color: 'rgba(255,255,255,0.4)' }}> in three steps.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
              {[
                { step: '01', title: 'Paste your resume', desc: 'Drop in your existing resume text. Any format works.', demo: <MiniATSCard /> },
                { step: '02', title: 'AI rewrites your bullets', desc: 'Keywords added, sections restructured, metrics surfaced.', demo: <MiniBulletCard /> },
                { step: '03', title: 'Cover letter in 30 seconds', desc: 'Tailored to the exact job description. Ready to send.', demo: <MiniCoverCard /> },
              ].map((s) => (
                <div key={s.step} className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div>
                    <span className="text-4xl font-black" style={{ color: 'rgba(255,255,255,0.07)' }}>{s.step}</span>
                    <h3 className="text-white font-bold text-base mt-1 mb-1">{s.title}</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.desc}</p>
                  </div>
                  {s.demo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. VALUE STACK ── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3B82F6' }}>The value equation</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Everything you get for $10/month</h2>
              <p className="text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>Five tools that would cost you $125/month separately — bundled for less than a Spotify subscription.</p>
            </div>
            <div className="rounded-2xl overflow-hidden mb-5" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {valueItems.map((item, i) => (
                <div key={item.label} className="flex items-center justify-between px-5 py-4"
                  style={{ background: i % 2 === 0 ? '#13131A' : 'rgba(255,255,255,0.02)', borderBottom: i < valueItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.desc}</p>
                  </div>
                  <span className="text-sm font-bold shrink-0" style={{ color: '#00FF88' }}>{item.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-5"
                style={{ background: 'linear-gradient(135deg, rgba(245,200,66,0.08), rgba(245,200,66,0.04))', borderTop: '1px solid rgba(245,200,66,0.2)' }}>
                <div>
                  <p className="text-white font-black text-lg">Total value</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>If you bought each tool separately</p>
                </div>
                <div className="text-right">
                  <p className="text-sm line-through mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>$125/month</p>
                  <p className="text-white font-black text-2xl">$10<span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>/mo</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. GUARANTEE ── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="rounded-2xl p-8 sm:p-10 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0f1a0d 0%, #13131A 50%, #0a0f1a 100%)', border: '1px solid rgba(0,255,136,0.2)' }}>
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.07) 0%, transparent 70%)' }} />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
                  style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)' }}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#00FF88" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#00FF88' }}>The Shortlistr Guarantee</p>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">
                  Your score goes up. Guaranteed.
                </h2>
                <p className="text-sm leading-relaxed mb-6 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  If your ATS score doesn't improve after using Shortlistr, email us and we'll refund your first month instantly. No questions. No forms. One email.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {['No questions asked', '30-day window', 'Instant refund'].map((item, i) => (
                    <span key={item} className="flex items-center gap-1.5">
                      {i > 0 && <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>}
                      <span style={{ color: '#00FF88' }}>✓</span> {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. PRICING TEASER ── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#F5C842' }}>Pricing</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">One price. Everything included.</h2>
              <p className="text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>No tiers. No paywalled features. No gotchas.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* Monthly */}
              <div className="rounded-2xl p-6 flex flex-col" style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Pro Monthly</p>
                <div className="mb-1">
                  <span className="text-4xl font-black text-white">$10</span>
                  <span className="text-sm ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>/month</span>
                </div>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Cancel anytime. No contracts.</p>
                <Link to={ctaHref} className="mt-auto">
                  <button className="w-full py-3 rounded-xl font-bold text-sm transition-all"
                    style={{ border: '1px solid rgba(245,200,66,0.35)', color: '#F5C842', background: 'rgba(245,200,66,0.05)' }}>
                    Start free — $10/mo
                  </button>
                </Link>
              </div>
              {/* Lifetime */}
              <div className="rounded-2xl p-6 flex flex-col relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #1a1408 0%, #13131A 100%)', border: '1px solid rgba(245,200,66,0.3)' }}>
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: '#F5C842', color: '#0A0A0F' }}>Best Value</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#F5C842' }}>Pro Lifetime</p>
                <div className="mb-0.5">
                  <span className="text-4xl font-black text-white">$149</span>
                  <span className="text-sm ml-1" style={{ color: 'rgba(255,255,255,0.35)' }}>once</span>
                </div>
                <p className="text-sm font-semibold mb-4" style={{ color: '#00FF88' }}>Pay once. Use forever.</p>
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>No subscriptions, no renewals.</p>
                <Link to={ctaHref} className="mt-auto">
                  <button className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}>
                    Get Lifetime Access — $149
                  </button>
                </Link>
              </div>
            </div>
            <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              First scan free. No card required. 30-day money-back guarantee on both plans.
            </p>
          </div>
        </section>

        {/* ── 8. FAQ ── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3B82F6' }}>FAQ</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Every question you have, answered.</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── 9. BOTTOM CTA ── */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
              Still applying with the same resume?
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Every day you wait is another application the ATS deletes.
            </p>
            <Link to={ctaHref}>
              <button className="px-10 py-5 rounded-2xl font-black text-lg transition-all hover:scale-105 active:scale-100 mb-4"
                style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 12px 40px rgba(245,200,66,0.35)' }}>
                Get my ATS score now — it's free →
              </button>
            </Link>
            <p className="text-xs mb-10" style={{ color: 'rgba(255,255,255,0.25)' }}>
              No credit card required · Takes 90 seconds · $10/mo after free scan
            </p>
            <div className="pt-8 flex items-center justify-center gap-2 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>
              <span>Shortlistr.us — Built for job seekers who are done being ignored.</span>
              <span>·</span>
              <a href="https://www.linkedin.com/in/isaac-christensen-18ba0a3b7" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-white/50">
                <LinkedInIcon />
                LinkedIn
              </a>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  )
}

/* ─────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={open}>
        <span className="text-sm font-semibold text-white pr-4">{q}</span>
        <svg className="w-4 h-4 shrink-0 transition-transform" style={{ color: 'rgba(255,255,255,0.4)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
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
