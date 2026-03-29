import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  optimizeResume,
  generateCoverLetter,
  analyzeRejectionReasons,
  detectAtsSystem,
  generateJobMatches,
  predictInterviewQuestions,
} from '../lib/ai'
import ResumePreview from '../components/ui/ResumePreview'
import { supabase } from '../lib/supabase'
import html2canvas from 'html2canvas'

const getPdfUtils = () => import('../lib/pdfUtils')

// ─── Sub-components ────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 160, animate = true }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const color = score >= 70 ? '#00FF88' : score >= 50 ? '#F59E0B' : '#FF4444'
  const offset = circ - (score / 100) * circ

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={animate ? circ : offset}
          transform="rotate(-90 50 50)"
          style={animate ? {
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)',
            strokeDashoffset: offset,
          } : { strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-white animate-scoreCount" style={{ fontSize: size * 0.28 }}>{score}</span>
        <span className="text-white/40 font-medium" style={{ fontSize: size * 0.1 }}>SCORE</span>
      </div>
    </div>
  )
}

const STEPS = [
  'Reading your resume',
  'Analyzing job requirements',
  'Detecting ATS system',
  'Generating rejection analysis',
  'Predicting interview questions',
  'Finalizing results',
]

function MultiStepLoader({ currentStep }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-full max-w-xs space-y-3">
        {STEPS.map((step, i) => {
          const done = i < currentStep
          const active = i === currentStep
          return (
            <div key={step} className={`flex items-center gap-3 transition-all duration-300 ${
              done ? 'opacity-50' : active ? 'opacity-100' : 'opacity-20'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                done
                  ? 'bg-neon-400 step-complete'
                  : active
                  ? 'border-2 border-gold-500 bg-gold-500/10'
                  : 'border-2 border-white/20'
              }`}>
                {done && (
                  <svg className="w-3 h-3 text-midnight" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {active && <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />}
              </div>
              <span className={`text-sm font-medium ${active ? 'text-gold-500' : 'text-white/60'}`}>{step}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AtsDetectorBanner({ detection, loading }) {
  if (loading) {
    return (
      <div className="card-dark p-4 flex items-center gap-3">
        <div className="skeleton w-8 h-8 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-3 w-48 rounded" />
          <div className="skeleton h-2.5 w-64 rounded" />
        </div>
      </div>
    )
  }
  if (!detection) return null

  const CONFIDENCE_COLORS = { High: 'text-neon-400', Medium: 'text-gold-500', Low: 'text-white/50' }
  const primary = detection.primary

  return (
    <div className="card-dark p-4 border-t-2 border-gold-500/40">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white text-sm font-semibold">
              We detected this company likely uses{' '}
              <span className="text-gold-500">{primary?.name}</span>
            </p>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${CONFIDENCE_COLORS[detection.confidence] ?? 'text-white/40'}`}>
              {detection.confidence} confidence
            </span>
          </div>
          {detection.secondary && (
            <p className="text-white/40 text-xs mt-0.5">
              Also possible: <span className="text-white/60">{detection.secondary.name}</span>
            </p>
          )}
          {primary?.tips?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {primary.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-white/55">
                  <span className="text-gold-500 mt-0.5 shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

const SEVERITY_STYLES = {
  Critical: { border: 'border-l-crimson-400', badge: 'bg-crimson-400/15 text-crimson-400 border border-crimson-400/30' },
  Major:    { border: 'border-l-amber-500',   badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
  Minor:    { border: 'border-l-gold-500',    badge: 'bg-gold-500/15 text-gold-500 border border-gold-500/30' },
}

function RejectionReasonsTab({ reasons, stage, isPro, loading }) {
  if (!isPro) {
    return (
      <div className="relative">
        <div className="blur-gate space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="card-dark p-4 border-l-4 border-l-crimson-400">
              <div className="flex items-center gap-2 mb-2">
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
              <div className="skeleton h-3 w-full rounded mb-1" />
              <div className="skeleton h-3 w-4/5 rounded" />
            </div>
          ))}
        </div>
        <div className="paywall-overlay absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-crimson-400/10 border border-crimson-400/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-crimson-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-base mb-1">Unlock your rejection reasons</p>
            <p className="text-white/50 text-sm max-w-xs">Upgrade to Pro to see exactly why you're not getting callbacks</p>
          </div>
          <Link to="/pricing" className="px-5 py-2.5 rounded-xl bg-gold-500 text-midnight font-bold text-sm hover:bg-gold-400 transition-colors">
            Unlock with Pro
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="card-dark p-4">
            <div className="skeleton h-3 w-48 rounded mb-2" />
            <div className="skeleton h-2.5 w-full rounded mb-1" />
            <div className="skeleton h-2.5 w-3/4 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!reasons) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-12 h-12 rounded-2xl bg-crimson-400/10 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-crimson-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-white/50 text-sm">Scan a job description to see why you're getting rejected</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className={`text-sm font-medium px-3 py-2 rounded-xl ${
        stage === 'ats'
          ? 'bg-crimson-400/10 text-crimson-400 border border-crimson-400/20'
          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      }`}>
        {stage === 'ats'
          ? '⚠ You are likely being rejected at the ATS stage before a human ever sees your resume'
          : '👤 You are making it past ATS but being rejected at the human review stage'}
      </div>
      {reasons?.map((r, i) => {
        const s = SEVERITY_STYLES[r.severity] ?? SEVERITY_STYLES.Minor
        return (
          <div key={i} className={`card-dark p-4 border-l-4 ${s.border}`}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <p className="text-white font-semibold text-sm">{r.title}</p>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.badge}`}>
                {r.severity}
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-2">{r.explanation}</p>
            <div className="flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 text-neon-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-neon-400 text-xs">{r.fix}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function InterviewPrepTab({ questions, loading, isPro }) {
  const [expanded, setExpanded] = useState({})
  const [mockMode, setMockMode] = useState(false)
  const [mockIdx, setMockIdx] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)

  if (!isPro) {
    return (
      <div className="relative">
        <div className="blur-gate space-y-3">
          {[0,1,2].map(i => <div key={i} className="card-dark h-20 rounded-xl" />)}
        </div>
        <div className="paywall-overlay absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-electric-500/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-electric-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-base mb-1">Unlock Interview Prep</p>
            <p className="text-white/50 text-sm max-w-xs">Get 8 predicted interview questions with STAR answer frameworks</p>
          </div>
          <Link to="/pricing" className="px-5 py-2.5 rounded-xl bg-gold-500 text-midnight font-bold text-sm hover:bg-gold-400 transition-colors">
            Unlock with Pro
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[0,1,2,3].map(i => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}
      </div>
    )
  }

  if (!questions?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-12 h-12 rounded-2xl bg-electric-500/10 flex items-center justify-center mb-3 animate-pulse">
          <svg className="w-6 h-6 text-electric-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <p className="text-white/50 text-sm">Scan a job description to unlock your predicted interview questions</p>
      </div>
    )
  }

  const CATEGORY_COLORS = {
    Behavioral: 'bg-electric-500/15 text-electric-400 border-electric-500/30',
    Technical:  'bg-neon-400/15 text-neon-400 border-neon-400/30',
    Situational:'bg-gold-500/15 text-gold-500 border-gold-500/30',
    'Culture Fit': 'bg-violet-500/15 text-violet-400 border-violet-500/30',
  }

  if (mockMode) {
    const q = questions[mockIdx]
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-sm">{mockIdx + 1} / {questions.length}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[q.category] ?? CATEGORY_COLORS.Behavioral}`}>
              {q.category}
            </span>
          </div>
          <button onClick={() => { setMockMode(false); setAnswer(''); setFeedback(null) }} className="text-white/40 hover:text-white text-xs">
            Exit mock
          </button>
        </div>
        <div className="card-dark p-4">
          <p className="text-white font-semibold text-base leading-relaxed">{q.question}</p>
          <p className="text-white/40 text-xs mt-2">{q.why_asked}</p>
        </div>
        <textarea
          rows={6}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Type your answer here…"
          className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white/80 placeholder-white/25 text-sm resize-none focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
        />
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFeedback({ score: 78, note: 'Good structure. Add more specific metrics to the result section of your STAR answer.' })
            }}
            disabled={!answer.trim()}
            className="flex-1 py-2.5 rounded-xl bg-gold-500 text-midnight font-bold text-sm hover:bg-gold-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Get Feedback
          </button>
          {mockIdx < questions.length - 1 && (
            <button onClick={() => { setMockIdx(i => i + 1); setAnswer(''); setFeedback(null) }} className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 text-sm hover:border-white/20 hover:text-white transition-all">
              Next →
            </button>
          )}
        </div>
        {feedback && (
          <div className="card-dark p-4 border-t-2 border-gold-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gold-500 font-bold text-lg">{feedback.score}/100</span>
              <span className="text-white/40 text-xs">answer quality</span>
            </div>
            <p className="text-white/70 text-sm">{feedback.note}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => { setMockMode(true); setMockIdx(0) }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gold-500/30 bg-gold-500/8 text-gold-500 text-sm font-semibold hover:bg-gold-500/15 transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Start Mock Interview
      </button>
      {questions.map((q, i) => (
        <div key={i} className="card-dark overflow-hidden">
          <button
            className="w-full text-left p-4 flex items-start gap-3"
            onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
          >
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-0.5 shrink-0 ${CATEGORY_COLORS[q.category] ?? CATEGORY_COLORS.Behavioral}`}>
              {q.category}
            </span>
            <p className="text-white/85 text-sm font-medium leading-snug flex-1">{q.question}</p>
            <svg className={`w-4 h-4 text-white/30 shrink-0 mt-0.5 transition-transform ${expanded[i] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded[i] && (
            <div className="px-4 pb-4 border-t border-white/5 pt-3">
              <p className="text-white/40 text-xs mb-3">{q.why_asked}</p>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">STAR Framework</p>
              <ul className="space-y-2">
                {q.answer_framework?.map((bullet, bi) => (
                  <li key={bi} className="flex items-start gap-2 text-xs text-white/65">
                    <span className="text-gold-500 mt-0.5 shrink-0">→</span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function LibraryTab({ user }) {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('saved_resumes')
      .select('id, title, ats_score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error) setResumes(data ?? [])
        setLoading(false)
      })
  }, [user])

  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const scoreColor = (s) => s >= 70 ? '#00FF88' : s >= 50 ? '#F59E0B' : '#FF4444'

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl">
            <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-2.5 w-1/4 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!resumes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
        <p className="text-white/40 text-sm">No saved resumes yet — run a scan to save one</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-white/5">
      {resumes.map(r => (
        <div key={r.id} className="flex items-center gap-3 py-3 px-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs border"
            style={r.ats_score !== null ? {
              background: `${scoreColor(r.ats_score)}10`,
              borderColor: `${scoreColor(r.ats_score)}25`,
              color: scoreColor(r.ats_score),
            } : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
          >
            {r.ats_score !== null ? r.ats_score : '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-sm font-medium truncate">{r.title || 'Optimized Resume'}</p>
            <p className="text-white/30 text-xs mt-0.5">{formatDate(r.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function JobMatchesTab({ matches, loading, resumeText, onPreFill }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[0,1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-xl" />)}
      </div>
    )
  }
  if (!matches?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center mb-3 animate-pulse">
          <svg className="w-6 h-6 text-gold-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7" />
          </svg>
        </div>
        <p className="text-white/50 text-sm">Upload your resume to discover which roles you're best positioned for</p>
      </div>
    )
  }
  const SENIORITY_COLORS = {
    Entry: 'bg-electric-500/15 text-electric-400',
    Mid: 'bg-neon-400/15 text-neon-400',
    Senior: 'bg-gold-500/15 text-gold-500',
    Lead: 'bg-violet-500/15 text-violet-400',
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {matches.map((m, i) => (
        <div key={i} className="card-dark p-4 flex flex-col hover:border-gold-500/20 transition-colors">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-white font-semibold text-sm leading-snug">{m.title}</p>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${SENIORITY_COLORS[m.seniority] ?? SENIORITY_COLORS.Mid}`}>
              {m.seniority}
            </span>
          </div>
          <p className="text-white/40 text-xs mb-2">{m.company_archetype}</p>
          <p className="text-white/65 text-xs leading-relaxed mb-3 flex-1">{m.fit_reason}</p>
          <div className="flex items-center justify-between mb-3">
            <span className="text-neon-400 text-sm font-bold">
              ${(m.salary_min / 1000).toFixed(0)}k–${(m.salary_max / 1000).toFixed(0)}k
            </span>
            <div className="flex items-center gap-1">
              <span className="text-white/30 text-xs">{m.match_score}% match</span>
              <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-neon-400 rounded-full" style={{ width: `${m.match_score}%` }} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {m.key_matches?.map(kw => (
              <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50">{kw}</span>
            ))}
          </div>
          <button
            onClick={() => onPreFill(m.title, m.company_archetype)}
            className="w-full py-2 rounded-lg border border-gold-500/20 bg-gold-500/5 text-gold-500 text-xs font-semibold hover:bg-gold-500/15 transition-colors"
          >
            Optimize for this role →
          </button>
        </div>
      ))}
    </div>
  )
}

function TransformationCard({ beforeScore, afterScore, resumeName, cardRef }) {
  if (beforeScore === null || afterScore === null) return null
  const diff = afterScore - beforeScore
  return (
    <div
      ref={cardRef}
      className="rounded-2xl overflow-hidden border border-gold-500/20"
      style={{ background: 'linear-gradient(135deg, #0f0f18 0%, #1a1408 50%, #0f0f18 100%)' }}
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-midnight" viewBox="0 0 24 24" fill="currentColor"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <span className="text-gold-500 text-xs font-bold uppercase tracking-wider">Transformation</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="text-center flex-1">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">Before</p>
            <p className="text-crimson-400 font-black" style={{ fontSize: 56, lineHeight: 1 }}>{beforeScore}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-8 h-8 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-neon-400 text-sm font-bold">+{diff}</span>
          </div>
          <div className="text-center flex-1">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">After</p>
            <p className="text-neon-400 font-black" style={{ fontSize: 56, lineHeight: 1 }}>{afterScore}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/8 text-center">
          <p className="text-white/30 text-[10px]">shortlistr.us · Hiring Probability Score</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function Optimizer() {
  const { user, profile, canOptimize, optimizationsRemaining } = useAuth()
  const { success, error: toastError, warn } = useToast()
  const { search } = useLocation()
  const isPro = profile?.tier === 'pro'

  // Inputs
  const [resumeMode, setResumeMode] = useState('upload')
  const [resumeText, setResumeText] = useState('')
  const [pdfName, setPdfName] = useState(null)
  const [pdfParsing, setPdfParsing] = useState(false)
  const [pdfError, setPdfError] = useState(null)
  const fileInputRef = useRef(null)
  const [jobMode, setJobMode] = useState('url')
  const [jobUrl, setJobUrl] = useState('')
  const [jobText, setJobText] = useState('')
  const [fetchingJob, setFetchingJob] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [dragging, setDragging] = useState(false)

  // Scan state
  const [scanning, setScanning] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [scanError, setScanError] = useState(null)

  // Results
  const [resultData, setResultData] = useState(null)
  const [atsScore, setAtsScore] = useState(null)
  const [beforeScore, setBeforeScore] = useState(null)
  const [rejectionData, setRejectionData] = useState(null)
  const [atsDetection, setAtsDetection] = useState(null)
  const [jobMatches, setJobMatches] = useState(null)
  const [interviewQuestions, setInterviewQuestions] = useState(null)
  const [loadingRejection, setLoadingRejection] = useState(false)
  const [loadingAts, setLoadingAts] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [loadingInterview, setLoadingInterview] = useState(false)

  // Tabs — initialise from ?tab= URL param (e.g. sidebar links)
  const [activeTab, setActiveTab] = useState(() => {
    const t = new URLSearchParams(search).get('tab')
    return ['matches', 'interview', 'rejection', 'library'].includes(t) ? t : 'resume'
  })

  // Cover letter
  const [coverText, setCoverText] = useState('')
  const [generatingCover, setGeneratingCover] = useState(false)
  const [coverCopied, setCoverCopied] = useState(false)

  // Transformation card share
  const transformCardRef = useRef(null)

  // ── PDF ─────────────────────────────────────────────────────────────────────
  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') { setPdfError('Please upload a valid PDF.'); return }
    setPdfError(null); setPdfParsing(true); setPdfName(file.name)
    try {
      const { extractTextFromPDF } = await getPdfUtils()
      setResumeText(await extractTextFromPDF(file))
    } catch { setPdfError('Could not parse PDF. Try pasting text instead.') }
    finally { setPdfParsing(false) }
  }
  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]) }

  // ── Job URL ──────────────────────────────────────────────────────────────────
  const handleFetchJob = async () => {
    if (!jobUrl.trim()) return
    setFetchError(null); setFetchingJob(true)
    try {
      const { fetchJobDescriptionFromURL } = await getPdfUtils()
      setJobText(await fetchJobDescriptionFromURL(jobUrl.trim()))
      setJobMode('paste')
    } catch { setFetchError('Could not fetch that URL. Paste the text directly.') }
    finally { setFetchingJob(false) }
  }

  // ── Main scan ────────────────────────────────────────────────────────────────
  const handleScan = async () => {
    if (!resumeText.trim() || !jobText.trim()) return
    if (resumeText.length > 15000) { setScanError('Resume text too long. Trim to under 15,000 characters.'); return }

    setScanError(null); setScanning(true); setScanStep(0)
    setRejectionData(null); setAtsDetection(null); setInterviewQuestions(null)
    setBeforeScore(atsScore) // store previous for transformation card

    try {
      // Step 0: reading resume (immediate)
      setScanStep(1) // analyzing

      // Step 1: optimize resume + detect ATS in parallel
      const [optimizeRes, atsRes] = await Promise.allSettled([
        optimizeResume(resumeText, jobText),
        detectAtsSystem(jobText),
      ])

      setScanStep(2)
      if (optimizeRes.status === 'fulfilled') {
        const { result, atsScore: score } = optimizeRes.value
        setResultData(result)
        setAtsScore(score)
        // auto-save
        const title = result?.experience?.[0]
          ? `${result.experience[0].title} — ${result.experience[0].company}`
          : result?.name ?? 'Optimized Resume'
        supabase.from('saved_resumes').insert({ user_id: user?.id, title, resume_data: result, ats_score: score })
          .then(({ error }) => { if (error) console.error('Auto-save failed:', error.message) })
      } else {
        throw new Error(optimizeRes.reason?.message ?? 'Optimization failed')
      }

      if (atsRes.status === 'fulfilled') setAtsDetection(atsRes.value)

      setScanStep(3) // rejection analysis
      setActiveTab('resume')
      success('Your resume has been optimized!')

      // Run post-scan analysis in background (non-blocking)
      if (isPro) {
        setLoadingRejection(true)
        analyzeRejectionReasons(resumeText, jobText, atsScore).then(r => setRejectionData(r)).catch(e => {
          toastError('Rejection analysis temporarily unavailable')
        }).finally(() => setLoadingRejection(false))

        setScanStep(4) // interview questions
        setLoadingInterview(true)
        predictInterviewQuestions(resumeText, jobText).then(r => setInterviewQuestions(r?.questions ?? [])).catch(e => {
          toastError('Interview prep temporarily unavailable')
        }).finally(() => setLoadingInterview(false))
      }

      setScanStep(5)
    } catch (err) {
      setScanError(err.message ?? 'Something went wrong. Please try again.')
      toastError(err.message ?? 'Analysis failed')
    } finally {
      setScanning(false)
    }
  }

  // ── Job matches (loaded on tab click) ───────────────────────────────────────
  const handleLoadMatches = useCallback(async () => {
    if (!resumeText.trim() || jobMatches || loadingMatches) return
    setLoadingMatches(true)
    try {
      const r = await generateJobMatches(resumeText)
      setJobMatches(r?.matches ?? [])
    } catch (e) {
      toastError('Job matching temporarily unavailable — please try again')
    } finally {
      setLoadingMatches(false)
    }
  }, [resumeText, jobMatches, loadingMatches, toastError])

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    if (tab === 'matches' && !jobMatches && !loadingMatches) handleLoadMatches()
  }

  // ── Pre-fill for job matches "Optimize for role" ────────────────────────────
  const handlePreFillRole = (title, archetype) => {
    const generated = `We are looking for a ${title} to join our ${archetype} team. The ideal candidate will have relevant experience and skills in this domain. You will be responsible for driving results in your area of expertise.`
    setJobText(generated)
    setJobMode('paste')
    setActiveTab('resume')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Cover letter ─────────────────────────────────────────────────────────────
  const handleGenerateCover = async () => {
    if (!resumeText.trim() || !jobText.trim()) return
    setGeneratingCover(true)
    try {
      const text = await generateCoverLetter(resumeText, jobText)
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      setCoverText(`${today}\n\n${text}`)
    } catch (e) { toastError(e.message ?? 'Something went wrong') }
    finally { setGeneratingCover(false) }
  }

  // ── Share card ───────────────────────────────────────────────────────────────
  const handleShareCard = async () => {
    if (!transformCardRef.current) return
    try {
      const canvas = await html2canvas(transformCardRef.current, { scale: 2, backgroundColor: null })
      const link = document.createElement('a')
      link.download = 'shortlistr-transformation.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      success('Transformation card downloaded!')
    } catch { toastError('Could not generate image') }
  }

  const hasJobContent = jobText.trim().length > 0
  const canSubmit = canOptimize && resumeText.trim() && hasJobContent && !scanning

  const hasScan = !!resultData
  const TABS = [
    { id: 'resume',    label: 'Optimized Resume', disabled: false },
    { id: 'rejection', label: 'Rejection Reasons', proOnly: true, disabled: !hasScan },
    { id: 'interview', label: 'Interview Prep',    proOnly: true, disabled: !hasScan },
    { id: 'matches',   label: 'Job Matches',       disabled: !hasScan },
    { id: 'library',   label: 'Library',           disabled: false },
  ]

  return (
    <AppShell>
      <div className="min-h-screen" style={{ background: '#0A0A0F' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Make Recruiters Stop Scrolling</h1>
            <p className="text-white/40 text-sm">Upload your resume and paste a job description to see your Hiring Probability Score.</p>
          </div>

          {/* Limit warning */}
          {!canOptimize && !isPro && (
            <div className="mb-6 card-dark p-5 border-crimson-400/30 text-center">
              <p className="text-white font-bold mb-1">You've used all 3 free scans this month</p>
              <p className="text-white/50 text-sm mb-4">Upgrade to Pro for unlimited scans + all premium features</p>
              <Link to="/pricing" className="inline-block px-5 py-2.5 rounded-xl bg-gold-500 text-midnight font-bold text-sm hover:bg-gold-400 transition-colors">
                Upgrade to Pro
              </Link>
            </div>
          )}

          <div className={`grid grid-cols-1 lg:grid-cols-5 gap-6 ${!canOptimize && !isPro ? 'opacity-40 pointer-events-none select-none' : ''}`}>

            {/* ── LEFT: Inputs (2 cols) ─────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Resume input */}
              <div className="card-dark p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white/70 text-sm font-semibold">Your Resume</label>
                  <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5">
                    {['upload', 'paste'].map(m => (
                      <button key={m} onClick={() => setResumeMode(m)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all capitalize ${resumeMode === m ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
                        {m === 'upload' ? 'Upload PDF' : 'Paste Text'}
                      </button>
                    ))}
                  </div>
                </div>
                {resumeMode === 'upload' ? (
                  <div>
                    <div
                      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl px-4 py-8 text-center cursor-pointer transition-all ${
                        dragging ? 'border-gold-500 bg-gold-500/5' : pdfName ? 'border-neon-400/40 bg-neon-400/5' : 'border-white/10 hover:border-white/25 hover:bg-white/3'
                      }`}
                    >
                      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                      {pdfParsing ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-white/40 text-xs">Extracting…</p>
                        </div>
                      ) : pdfName ? (
                        <div className="flex flex-col items-center gap-1">
                          <svg className="w-8 h-8 text-neon-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <p className="text-white text-sm font-medium">{pdfName}</p>
                          <p className="text-neon-400 text-xs">{resumeText.length.toLocaleString()} chars</p>
                          <button onClick={e => { e.stopPropagation(); setPdfName(null); setResumeText('') }} className="text-xs text-white/30 hover:text-white/60 mt-1">Remove</button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                          <p className="text-white/50 text-sm">Drop PDF here or click to browse</p>
                        </div>
                      )}
                    </div>
                    {pdfError && <p className="text-crimson-400 text-xs mt-1.5">{pdfError}</p>}
                  </div>
                ) : (
                  <textarea rows={10} value={resumeText} onChange={e => setResumeText(e.target.value)}
                    placeholder="Paste your full resume text here…"
                    className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 text-sm resize-none focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/15 transition-colors" />
                )}
              </div>

              {/* Job description */}
              <div className="card-dark p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white/70 text-sm font-semibold">Job Description</label>
                  <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5">
                    {[['url','Paste Link'],['paste','Paste Text']].map(([m, l]) => (
                      <button key={m} onClick={() => setJobMode(m)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${jobMode === m ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {jobMode === 'url' ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="url" value={jobUrl} onChange={e => setJobUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleFetchJob()}
                        placeholder="https://jobs.company.com/role"
                        className="flex-1 bg-white/3 border border-white/8 rounded-xl px-4 py-2.5 text-white/80 placeholder-white/20 text-sm focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/15 transition-colors" />
                      <button onClick={handleFetchJob} disabled={!jobUrl.trim() || fetchingJob}
                        className="px-4 py-2.5 bg-white/8 hover:bg-white/15 disabled:opacity-30 text-white text-sm rounded-xl border border-white/10 transition-colors whitespace-nowrap">
                        {fetchingJob ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Fetching</span> : 'Fetch'}
                      </button>
                    </div>
                    {fetchError && <p className="text-crimson-400 text-xs">{fetchError}</p>}
                  </div>
                ) : (
                  <textarea rows={7} value={jobText} onChange={e => setJobText(e.target.value)}
                    placeholder="Paste the full job description here…"
                    className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white/80 placeholder-white/20 text-sm resize-none focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/15 transition-colors" />
                )}
              </div>

              {/* Scan button */}
              <button
                onClick={handleScan}
                disabled={!canSubmit}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed gold-glow"
                style={{ background: canSubmit ? 'linear-gradient(135deg, #F5C842, #d4a017)' : '#1a1a2e', color: canSubmit ? '#0A0A0F' : 'rgba(255,255,255,0.3)' }}
              >
                {scanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
                    Analyzing…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    See Why You're Getting Rejected
                  </span>
                )}
              </button>
              {scanError && <p className="text-crimson-400 text-xs text-center mt-1">{scanError}</p>}

              {/* Score ring + ATS detector (shows after scan) */}
              {atsScore !== null && !scanning && (
                <div className="space-y-3">
                  <div className="card-dark p-5 flex flex-col items-center">
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Hiring Probability Score</p>
                    <ScoreRing score={atsScore} size={140} />
                    {beforeScore !== null && beforeScore !== atsScore && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <span className="text-white/30 text-xs line-through">{beforeScore}</span>
                        <span className="text-neon-400 text-xs font-bold">+{atsScore - beforeScore} improvement</span>
                      </div>
                    )}
                  </div>
                  <AtsDetectorBanner detection={atsDetection} loading={loadingAts} />
                </div>
              )}

              {/* Transformation card */}
              {beforeScore !== null && atsScore !== null && beforeScore !== atsScore && (
                <div className="space-y-2">
                  <TransformationCard beforeScore={beforeScore} afterScore={atsScore} cardRef={transformCardRef} />
                  <button
                    onClick={handleShareCard}
                    className="w-full py-2.5 rounded-xl border border-gold-500/20 bg-gold-500/5 text-gold-500 text-sm font-semibold hover:bg-gold-500/15 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Share Your Results
                  </button>
                </div>
              )}
            </div>

            {/* ── RIGHT: Results (3 cols) ───────────────────────────────── */}
            <div className="lg:col-span-3">
              {scanning ? (
                <div className="card-dark min-h-[520px]">
                  <MultiStepLoader currentStep={scanStep} />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Tabs — always visible */}
                  <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                    {TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => !tab.disabled && handleTabClick(tab.id)}
                        disabled={tab.disabled}
                        className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                          tab.disabled
                            ? 'text-white/15 cursor-not-allowed'
                            : activeTab === tab.id
                            ? 'bg-gold-500/12 text-gold-500 border border-gold-500/20'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                        }`}
                      >
                        {tab.label}
                        {tab.proOnly && !isPro && !tab.disabled && (
                          <svg className="w-3 h-3 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab panels */}
                  <div className="card-dark p-4 min-h-[500px]">
                    {activeTab === 'library' ? (
                      <LibraryTab user={user} />
                    ) : !resultData ? (
                      <div className="min-h-[460px] flex flex-col items-center justify-center text-center px-8 py-12">
                        <div className="w-16 h-16 rounded-2xl border border-white/8 bg-white/3 flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.25">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                        </div>
                        <p className="text-white/50 font-medium mb-2">Your results will appear here</p>
                        <p className="text-white/25 text-sm max-w-xs leading-relaxed">
                          Upload your resume, add a job description, and hit scan to get your Hiring Probability Score with AI-powered insights.
                        </p>
                      </div>
                    ) : (
                      <>
                        {activeTab === 'resume' && (
                          <div className="space-y-4">
                            <ResumePreview data={resultData} atsScore={atsScore} />
                            {isPro && (
                              <div className="border-t border-white/8 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-white font-semibold text-sm">Cover Letter</h3>
                                  <div className="flex gap-2">
                                    {coverText && (
                                      <button
                                        onClick={() => { navigator.clipboard.writeText(coverText); setCoverCopied(true); setTimeout(() => setCoverCopied(false), 2000) }}
                                        className="px-3 py-1.5 text-xs text-white/60 border border-white/10 rounded-lg hover:border-white/20 hover:text-white transition-all"
                                      >
                                        {coverCopied ? 'Copied!' : 'Copy'}
                                      </button>
                                    )}
                                    <button onClick={handleGenerateCover} disabled={generatingCover}
                                      className="px-3 py-1.5 text-xs bg-electric-500/15 text-electric-400 border border-electric-500/20 rounded-lg hover:bg-electric-500/25 transition-all disabled:opacity-40">
                                      {generatingCover ? 'Writing…' : coverText ? 'Regenerate' : 'Generate Cover Letter'}
                                    </button>
                                  </div>
                                </div>
                                {coverText && (
                                  <textarea value={coverText} onChange={e => setCoverText(e.target.value)} rows={8}
                                    className="w-full bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-white/70 text-sm resize-none focus:outline-none focus:border-electric-500/30 transition-colors" />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {activeTab === 'rejection' && (
                          <RejectionReasonsTab
                            reasons={rejectionData?.reasons}
                            stage={rejectionData?.stage}
                            isPro={isPro}
                            loading={loadingRejection}
                          />
                        )}
                        {activeTab === 'interview' && (
                          <InterviewPrepTab
                            questions={interviewQuestions}
                            loading={loadingInterview}
                            isPro={isPro}
                          />
                        )}
                        {activeTab === 'matches' && (
                          <JobMatchesTab
                            matches={jobMatches}
                            loading={loadingMatches}
                            resumeText={resumeText}
                            onPreFill={handlePreFillRole}
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
