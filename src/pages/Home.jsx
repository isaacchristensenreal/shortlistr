import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, useInView, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion'
import * as Tooltip from '@radix-ui/react-tooltip'
import {
  CheckCircle, ArrowRight, Upload, Zap, Shield, Star,
  Sparkles, FileText, Target, MessageSquare, DollarSign,
  Brain, TrendingUp, ChevronDown,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { scoreResumePreview, extractTextFromImage } from '../lib/ai'
import { extractTextFromPDF } from '../lib/pdfUtils'

// ─── Animation variants ──────────────────────────────────────────────────────

const EASE_OUT = [0.23, 1, 0.32, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
}

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: EASE_OUT } },
}

// ─── Score counter ────────────────────────────────────────────────────────────

function AnimatedScore({ value, color = '#F5C842', size = 120, trigger = true }) {
  const count     = useMotionValue(0)
  const rounded   = useTransform(count, Math.round)
  const r         = 42
  const circ      = 2 * Math.PI * r
  const dashOffset = useTransform(count, v => circ - (v / 100) * circ)

  useEffect(() => {
    if (!trigger) return
    const ctrl = animate(count, value, { duration: 1.8, ease: 'easeOut', delay: 0.3 })
    return () => ctrl.stop()
  }, [trigger, count, value])

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
        <motion.circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="font-black" style={{ fontSize: size * 0.26, color, lineHeight: 1 }}>
          {rounded}
        </motion.span>
        <span style={{ fontSize: size * 0.095, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.05em' }}>
          SCORE
        </span>
      </div>
    </div>
  )
}

// ─── Hero demo card ───────────────────────────────────────────────────────────

const DEMO_KEYWORDS = [
  { word: 'React',          found: true  },
  { word: 'TypeScript',     found: true  },
  { word: 'Node.js',        found: true  },
  { word: 'Docker',         found: false },
  { word: 'AWS',            found: false },
  { word: 'CI/CD',          found: true  },
]

function HeroDemoCard() {
  const ref     = useRef(null)
  const inView  = useInView(ref, { once: true, margin: '-60px' })
  const [phase, setPhase] = useState('before') // 'before' | 'after'

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setPhase('after'), 2400)
    return () => clearTimeout(t)
  }, [inView])

  const score      = phase === 'after' ? 89 : 34
  const scoreColor = phase === 'after' ? '#00FF88' : '#FF4444'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.2 }}
      className="relative"
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: phase === 'after'
            ? 'radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.12) 0%, transparent 65%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(245,200,66,0.10) 0%, transparent 65%)',
          transition: 'background 0.8s ease',
          filter: 'blur(20px)',
          transform: 'translateY(-8px)',
        }}
      />

      <div
        className="relative rounded-2xl p-5 sm:p-6"
        style={{
          background: '#13131A',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,200,66,0.12)', border: '1px solid rgba(245,200,66,0.2)' }}>
              <Zap size={14} style={{ color: '#F5C842' }} />
            </div>
            <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>ATS Analysis</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={phase === 'after'
                ? { background: 'rgba(0,255,136,0.12)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.2)' }
                : { background: 'rgba(255,68,68,0.12)', color: '#FF6B6B', border: '1px solid rgba(255,68,68,0.2)' }}
            >
              {phase === 'after' ? '✓ Optimized' : 'Needs Work'}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Score ring + breakdown */}
        <div className="flex items-center gap-6 mb-5">
          <AnimatedScore value={score} color={scoreColor} size={110} trigger={inView} key={phase} />
          <div className="flex-1 space-y-2.5">
            {[
              { label: 'Keywords',  pct: phase === 'after' ? 91 : 28, color: phase === 'after' ? '#00FF88' : '#FF4444' },
              { label: 'Format',    pct: phase === 'after' ? 95 : 72, color: phase === 'after' ? '#00FF88' : '#F59E0B' },
              { label: 'Relevance', pct: phase === 'after' ? 82 : 18, color: phase === 'after' ? '#00FF88' : '#FF4444' },
            ].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
                  <span className="text-[11px] font-bold" style={{ color }}>{pct}%</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.0, ease: EASE_OUT, delay: 0.5 }}
                    key={`${label}-${phase}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Job Keywords
          </p>
          <motion.div
            className="flex flex-wrap gap-1.5"
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
          >
            {DEMO_KEYWORDS.map(k => (
              <motion.span
                key={k.word}
                variants={staggerItem}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={k.found
                  ? { background: 'rgba(0,255,136,0.1)', color: '#00FF88',  border: '1px solid rgba(0,255,136,0.2)' }
                  : { background: 'rgba(255,68,68,0.1)',  color: '#FF6B6B', border: '1px solid rgba(255,68,68,0.2)' }}
              >
                {k.found
                  ? <CheckCircle size={9} />
                  : <span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', border: '1.5px solid #FF6B6B' }} />}
                {k.word}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* Phase label */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={phase}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] text-center font-medium"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              {phase === 'before'
                ? 'Typical resume before ShortListr…'
                : '✓ After ShortListr optimization'}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Free score preview (lead magnet) ─────────────────────────────────────────

function FreeScoreSection() {
  const { user }         = useAuth()
  const navigate         = useNavigate()
  const ref              = useRef(null)
  const inView           = useInView(ref, { once: true, margin: '-80px' })
  const fileInputRef     = useRef(null)

  const [resumeText, setResumeText]   = useState('')
  const [fileName,   setFileName]     = useState('')
  const [loading,    setLoading]      = useState(false)
  const [result,     setResult]       = useState(null)
  const [error,      setError]        = useState(null)
  const [dragOver,   setDragOver]     = useState(false)

  const processFile = useCallback(async (file) => {
    setError(null)
    setResult(null)
    setFileName(file.name)
    try {
      let text = ''
      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file)
      } else if (file.type.startsWith('image/')) {
        text = await extractTextFromImage(file)
      } else {
        text = await file.text()
      }
      setResumeText(text)
    } catch {
      setError('Could not read that file. Try a PDF or paste your resume text below.')
    }
  }, [])

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleScore = async () => {
    if (!resumeText.trim()) { setError('Please upload or paste your resume first.'); return }
    setLoading(true)
    setError(null)
    try {
      const data = await scoreResumePreview(resumeText)
      setResult(data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = result
    ? result.displayScore >= 70 ? '#00FF88' : result.displayScore >= 50 ? '#F59E0B' : '#FF4444'
    : '#F5C842'

  return (
    <section
      ref={ref}
      className="py-24 px-4"
      style={{ background: 'linear-gradient(180deg, #0A0A0F 0%, #0D0D1A 100%)' }}
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={staggerContainer}
          className="text-center mb-10"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(0,255,136,0.08)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.18)' }}>
            <Sparkles size={12} />
            Free ATS Score — No signup required
          </motion.div>
          <motion.h2 variants={staggerItem} className="text-3xl sm:text-4xl font-black text-white mb-3">
            See Your Score in 30 Seconds
          </motion.h2>
          <motion.p variants={staggerItem} className="text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Upload your resume and get an instant ATS score. No account needed.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.2 }}
          className="rounded-2xl p-6 sm:p-8"
          style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
        >
          {!result ? (
            <>
              {/* Drop zone */}
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className="flex flex-col items-center justify-center gap-3 rounded-xl p-8 cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${dragOver ? 'rgba(245,200,66,0.5)' : 'rgba(255,255,255,0.12)'}`,
                  background: dragOver ? 'rgba(245,200,66,0.04)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,image/*" className="sr-only" onChange={handleFile} />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)' }}>
                  <Upload size={22} style={{ color: '#F5C842' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: fileName ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)' }}>
                    {fileName || 'Drop your resume here'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    PDF, Word, or image — or paste below
                  </p>
                </div>
              </label>

              {/* Paste fallback */}
              <div className="mt-3">
                <textarea
                  value={resumeText}
                  onChange={e => { setResumeText(e.target.value); setFileName('') }}
                  placeholder="…or paste your resume text here"
                  rows={4}
                  className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.75)',
                    caretColor: '#F5C842',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(245,200,66,0.35)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>

              {error && (
                <p className="mt-2 text-xs text-center" style={{ color: '#FF6B6B' }}>{error}</p>
              )}

              <motion.button
                onClick={handleScore}
                disabled={loading || !resumeText.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="mt-4 w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 btn-shimmer"
                style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F' }}
              >
                {loading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 rounded-full"
                      style={{ border: '2px solid rgba(10,10,15,0.3)', borderTopColor: '#0A0A0F' }}
                    />
                    Analyzing your resume…
                  </>
                ) : (
                  <>
                    <Zap size={15} />
                    Get My Free Score
                    <ArrowRight size={15} />
                  </>
                )}
              </motion.button>
              <p className="text-center text-xs mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                No account required · Results in under 30 seconds
              </p>
            </>
          ) : (
            /* Result state */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <AnimatedScore value={result.displayScore} color={scoreColor} size={130} trigger />
              </div>

              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <h3 className="text-lg font-bold text-white mb-1 cursor-help inline-flex items-center gap-1.5">
                    Your ATS Score
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>?</span>
                  </h3>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="rounded-lg px-3 py-2 text-xs max-w-xs"
                    style={{ background: '#1E1E2E', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 9999 }}
                    sideOffset={6}
                  >
                    ATS (Applicant Tracking System) is software used by 99% of Fortune 500 companies to filter resumes before a human ever sees them. A score below 70 often means automatic rejection.
                    <Tooltip.Arrow style={{ fill: '#1E1E2E' }} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>

              <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {result.displayScore >= 70
                  ? 'Strong score. Pro optimization could push you past 90.'
                  : result.displayScore >= 50
                  ? 'Average score. Recruiters are likely passing on your resume.'
                  : 'Low score. Most ATS systems are filtering you out automatically.'}
              </p>

              {result.issues?.length > 0 && (
                <div className="text-left mb-6 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Issues Found</p>
                  {result.issues.slice(0, 3).map((issue, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      <span className="mt-0.5 shrink-0" style={{ color: '#FF6B6B' }}>✕</span>
                      {issue}
                    </div>
                  ))}
                  {result.issues.length > 3 && (
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      +{result.issues.length - 3} more issues — unlock with Pro
                    </p>
                  )}
                </div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
                <Link
                  to={user ? '/optimize' : '/auth?mode=signup'}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 btn-shimmer"
                  style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', display: 'flex' }}
                >
                  Fix These Issues with Pro
                  <ArrowRight size={15} />
                </Link>
              </motion.div>

              <button
                onClick={() => { setResult(null); setResumeText(''); setFileName('') }}
                className="mt-3 text-xs transition-colors"
                style={{ color: 'rgba(255,255,255,0.25)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
              >
                Try another resume
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Features ────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Zap,
    color: '#F5C842',
    title: 'ATS Score Analyzer',
    desc: 'See your exact keyword match percentage before you click Apply. Know exactly where you stand.',
  },
  {
    icon: FileText,
    color: '#3B82F6',
    title: 'AI Resume Optimizer',
    desc: 'Rewrites your bullets with the exact keywords ATS systems look for. Tailored to every job description.',
  },
  {
    icon: Brain,
    color: '#8B5CF6',
    title: 'Rejection Analysis',
    desc: 'Find out exactly why your resume isn\'t getting callbacks. Not vague feedback — specific, actionable fixes.',
  },
  {
    icon: MessageSquare,
    color: '#00FF88',
    title: 'Cover Letter Generator',
    desc: 'Tailored cover letters in 30 seconds. Sounds like you, hits every keyword, impresses every recruiter.',
  },
  {
    icon: TrendingUp,
    color: '#06B6D4',
    title: 'LinkedIn Optimizer',
    desc: 'Recruiter searches rank you higher when your LinkedIn matches your target role. We write that profile.',
  },
  {
    icon: DollarSign,
    color: '#F97316',
    title: 'Salary Negotiator',
    desc: 'Know your market value and get the exact scripts to negotiate a higher offer — proven email templates included.',
  },
]

function FeaturesSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(245,200,66,0.08)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.18)' }}>
            <Sparkles size={12} />
            Full Feature Suite
          </motion.div>
          <motion.h2 variants={staggerItem} className="text-4xl sm:text-5xl font-black text-white mb-4">
            Everything you need to<br className="hidden sm:block" /> land the job
          </motion.h2>
          <motion.p variants={staggerItem} className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
            One subscription. Every tool. From ATS optimization to salary negotiation — ShortListr covers the entire job search.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={staggerItem}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-6"
              style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${f.color}14`, border: `1px solid ${f.color}28` }}
              >
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.desc}</p>
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
    icon: Upload,
    title: 'Upload Your Resume',
    desc: 'Drop in your PDF or paste your text. We extract everything automatically.',
  },
  {
    n: '02',
    icon: Target,
    title: 'Paste the Job Description',
    desc: 'Add any job posting URL or paste the full description — we do the keyword analysis.',
  },
  {
    n: '03',
    icon: Zap,
    title: 'Get Your Optimized Resume',
    desc: 'In 90 seconds you get a fully rewritten resume, ATS score, and rejection analysis.',
  },
]

function HowItWorksSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-24 px-4" style={{ background: '#0D0D14' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={staggerContainer}
        >
          <motion.h2 variants={staggerItem} className="text-4xl sm:text-5xl font-black text-white mb-4">
            From rejected to shortlisted<br className="hidden sm:block" /> in 90 seconds
          </motion.h2>
          <motion.p variants={staggerItem} className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Three steps. No fluff.
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
              className="relative rounded-2xl p-7"
              style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.2)' }}
                >
                  <s.icon size={22} style={{ color: '#F5C842' }} />
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-widest" style={{ color: 'rgba(245,200,66,0.5)' }}>STEP {s.n}</span>
                  <h3 className="text-base font-bold text-white mt-0.5 mb-2">{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.desc}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="hidden md:block absolute top-1/2 -right-3 z-10 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: '#0D0D14', border: '1px solid rgba(255,255,255,0.1)', transform: 'translateY(-50%)' }}
                >
                  <ArrowRight size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
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

const PRO_FEATURES = [
  'Unlimited ATS resume scans',
  'AI resume rewriting & optimization',
  'Cover letter generation',
  'Rejection reason analysis',
  'Before / after scorecard',
  'LinkedIn profile optimizer',
  'Salary negotiation email scripts',
  'Interview question predictor',
  'Priority support',
]

function PricingSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <section ref={ref} className="py-24 px-4" id="pricing">
      <div className="max-w-lg mx-auto">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(245,200,66,0.08)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.18)' }}>
            <Zap size={12} />
            Simple Pricing
          </motion.div>
          <motion.h2 variants={staggerItem} className="text-4xl sm:text-5xl font-black text-white mb-4">
            One price.<br />Everything included.
          </motion.h2>
          <motion.p variants={staggerItem} className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
            No tiers, no surprises, no annual lock-in.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.15 }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #1a1408 0%, #13131A 60%)',
            border: '1px solid rgba(245,200,66,0.2)',
            boxShadow: '0 0 80px rgba(245,200,66,0.07), 0 32px 64px rgba(0,0,0,0.5)',
          }}
        >
          {/* Top gradient bar */}
          <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #F5C842, transparent)' }} />

          <div className="p-8">
            {/* Price */}
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-black text-white">$10</span>
              <span className="text-lg font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>/month</span>
            </div>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Or <span style={{ color: '#F5C842', fontWeight: 700 }}>$149 once</span> for lifetime access — save 57%
            </p>

            {/* Features list */}
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <CheckCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#F5C842' }} />
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={() => navigate(user ? '/pricing' : '/auth?mode=signup')}
              className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 btn-shimmer"
              style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 4px 24px rgba(245,200,66,0.3)' }}
            >
              {user ? 'Upgrade to Pro' : 'Start Free Trial'}
              <ArrowRight size={16} />
            </motion.button>

            <p className="text-center text-xs mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Cancel anytime · No contracts · 7-day money-back guarantee
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Testimonials ────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: 'I went from a 31 ATS score to 89 in five minutes. Had four interview requests the following week. This thing is insane.',
    name: 'Sarah K.',
    role: 'Software Engineer',
    score: { before: 31, after: 89 },
  },
  {
    quote: 'Applied for 4 months with zero responses. Used ShortListr once, rewrote my resume, and got 3 callbacks in 5 days.',
    name: 'Marcus T.',
    role: 'Product Manager',
    score: { before: 22, after: 84 },
  },
  {
    quote: 'The rejection analysis showed me exactly what was wrong. Nobody else tells you this. It\'s like having a recruiter friend.',
    name: 'Priya M.',
    role: 'UX Designer',
    score: { before: 41, after: 91 },
  },
]

function TestimonialsSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-24 px-4" style={{ background: '#0D0D14' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={staggerContainer}
        >
          <motion.h2 variants={staggerItem} className="text-4xl sm:text-5xl font-black text-white mb-4">
            Real results, real people
          </motion.h2>
          <motion.p variants={staggerItem} className="text-lg" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Join thousands of job seekers who got past the ATS and into the room.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={staggerItem}
              whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: '#13131A', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#F5C842" style={{ color: '#F5C842' }} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                "{t.quote}"
              </p>

              {/* Author + score badge */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Score</p>
                  <p className="text-xs font-bold">
                    <span style={{ color: '#FF6B6B' }}>{t.score.before}</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)' }}> → </span>
                    <span style={{ color: '#00FF88' }}>{t.score.after}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
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
    <section ref={ref} className="py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(245,200,66,0.08)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.18)' }}>
            <Sparkles size={12} />
            Start today for free
          </motion.div>
          <motion.h2 variants={staggerItem} className="text-4xl sm:text-6xl font-black text-white mb-5 leading-tight">
            Stop getting filtered out.<br />
            <span style={{ color: '#F5C842' }}>Start getting interviews.</span>
          </motion.h2>
          <motion.p variants={staggerItem} className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Your first ATS score is free. No credit card. No commitment.
            See exactly what's stopping you before you pay a cent.
          </motion.p>
          <motion.div variants={staggerItem}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }} className="inline-block">
              <Link
                to={user ? '/optimize' : '/auth?mode=signup'}
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base btn-shimmer"
                style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 8px 32px rgba(245,200,66,0.35)' }}
              >
                {user ? 'Go to Dashboard' : 'Analyze My Resume Free'}
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Trusted by 12,000+ job seekers · 4.9/5 rating
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
  const navigate   = useNavigate()
  const heroRef    = useRef(null)
  const heroInView = useInView(heroRef, { once: true })

  return (
    <Layout>
      <Helmet>
        <title>ShortListr — AI Resume Optimizer That Beats ATS Filters</title>
        <meta name="description" content="73% of resumes never reach a human. ShortListr scores, rewrites, and optimizes your resume to beat ATS filters in 90 seconds. Try free — no account required." />
        <link rel="canonical" href="https://www.shortlistr.us/" />
      </Helmet>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center' }}
      >
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="orb-drift absolute rounded-full" style={{ width: 600, height: 600, top: '-20%', left: '-10%', background: 'radial-gradient(circle, rgba(245,200,66,0.06) 0%, transparent 65%)' }} />
          <div className="orb-drift2 absolute rounded-full" style={{ width: 500, height: 500, bottom: '-15%', right: '-5%', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — copy */}
            <motion.div
              initial="hidden"
              animate={heroInView ? 'show' : 'hidden'}
              variants={staggerContainer}
            >
              {/* Badge */}
              <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(245,200,66,0.08)', color: '#F5C842', border: '1px solid rgba(245,200,66,0.18)' }}>
                <Sparkles size={12} />
                AI-Powered Resume Intelligence
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={staggerItem} className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-black text-white leading-tight mb-5">
                Stop Getting<br />
                <span style={{ color: '#F5C842' }}>Rejected.</span><br />
                Start Getting<br />
                Interviews.
              </motion.h1>

              {/* Subheadline */}
              <motion.p variants={staggerItem} className="text-lg sm:text-xl mb-8 max-w-lg" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                73% of resumes are filtered out before a human ever sees them. ShortListr beats every ATS filter and rewrites your resume in 90 seconds.
              </motion.p>

              {/* CTA row */}
              <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
                  <Link
                    to={user ? '/optimize' : '/auth?mode=signup'}
                    className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl font-bold text-base btn-shimmer"
                    style={{ background: 'linear-gradient(135deg, #F5C842, #d4a017)', color: '#0A0A0F', boxShadow: '0 8px 32px rgba(245,200,66,0.3)' }}
                  >
                    {user ? 'Go to Dashboard' : 'Analyze My Resume Free'}
                    <ArrowRight size={18} />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
                  <Link
                    to="/features"
                    className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl font-semibold text-sm transition-colors"
                    style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  >
                    See all features
                    <ChevronDown size={14} />
                  </Link>
                </motion.div>
              </motion.div>

              {/* Trust signals */}
              <motion.p variants={staggerItem} className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                No credit card required · 60-second setup · Cancel anytime
              </motion.p>
            </motion.div>

            {/* Right — demo card */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="w-full max-w-sm">
                <HeroDemoCard />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2"
          style={{ x: '-50%' }}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={20} style={{ color: 'rgba(255,255,255,0.2)' }} />
        </motion.div>
      </section>

      {/* ── Social proof strip ─────────────────────────────────────────────── */}
      <SocialProofStrip />

      {/* ── Free score section ─────────────────────────────────────────────── */}
      <FreeScoreSection />

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <FeaturesSection />

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <HowItWorksSection />

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <FinalCTA />
    </Layout>
  )
}

// ─── Social proof strip ───────────────────────────────────────────────────────

const STATS = [
  { value: 12847, label: 'Resumes Analyzed', suffix: '+' },
  { value: 73,    label: 'Avg Score Increase', suffix: '%' },
  { value: 4.9,   label: 'User Rating', suffix: '★' },
]

function StatCounter({ value, suffix, isFloat = false }) {
  const count   = useMotionValue(0)
  const rounded = isFloat
    ? useTransform(count, v => v.toFixed(1))
    : useTransform(count, Math.round)
  const ref     = useRef(null)
  const inView  = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const ctrl = animate(count, value, { duration: 1.6, ease: 'easeOut', delay: 0.1 })
    return () => ctrl.stop()
  }, [inView, count, value])

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>{suffix}
    </span>
  )
}

function SocialProofStrip() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div
      ref={ref}
      style={{ background: '#0D0D14', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 sm:divide-x"
          style={{ '--tw-divide-opacity': 1 }}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={staggerItem}
              className="flex flex-col items-center text-center sm:px-8"
            >
              <span
                className="text-3xl sm:text-4xl font-black mb-1"
                style={{ color: '#F5C842' }}
              >
                <StatCounter
                  value={s.value}
                  suffix={s.suffix}
                  isFloat={s.value === 4.9}
                />
              </span>
              <span className="text-xs uppercase tracking-widest font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
