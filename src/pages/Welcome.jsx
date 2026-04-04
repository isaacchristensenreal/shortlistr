import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { startCheckout } from '../lib/stripe'
import Logo from '../components/ui/Logo'

const TOTAL_STEPS = 7

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-500 ${
            i < step
              ? 'bg-gradient-to-r from-electric-500 to-violet-500'
              : i === step
              ? 'bg-electric-500/40'
              : 'bg-slate-200 dark:bg-white/10'
          } ${i < step || i === step ? 'w-8' : 'w-4'}`}
        />
      ))}
    </div>
  )
}

function StepWrapper({ children, visible }) {
  return (
    <div
      className={`transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none absolute'
      }`}
    >
      {children}
    </div>
  )
}

function OptionCard({ icon, title, subtitle, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 group ${
        selected
          ? 'border-electric-500 bg-electric-500/5 dark:bg-electric-500/10 shadow-md shadow-electric-500/10'
          : 'border-slate-200 dark:border-white/10 bg-white dark:bg-navy-800 hover:border-electric-500/40 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
          selected
            ? 'bg-gradient-to-br from-electric-500 to-violet-500 text-white'
            : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:bg-electric-500/10 group-hover:text-electric-500'
        }`}>
          {icon}
        </div>
        <div>
          <p className={`text-sm font-semibold transition-colors ${selected ? 'text-electric-600 dark:text-electric-400' : 'text-slate-800 dark:text-slate-200'}`}>{title}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="ml-auto shrink-0">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            selected ? 'border-electric-500 bg-electric-500' : 'border-slate-300 dark:border-white/20'
          }`}>
            {selected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

export default function Welcome() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isPro = profile?.tier === 'pro'

  const [step, setStep] = useState(0)
  const [situation, setSituation] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const [timeline, setTimeline] = useState(null)
  const [upgrading, setUpgrading] = useState(null) // 'monthly' | 'lifetime' | null
  const [upgradeError, setUpgradeError] = useState(null)

  const firstName = user?.email?.split('@')[0] ?? 'there'

  const finish = () => {
    localStorage.setItem(`sl_onboarded_${user.id}`, '1')
    navigate('/dashboard', { replace: true })
  }

  const handleUpgrade = async (billing) => {
    setUpgrading(billing)
    setUpgradeError(null)
    try {
      await startCheckout(user?.id, user?.email, billing)
    } catch {
      setUpgradeError('Could not start checkout. Please try again.')
      setUpgrading(null)
    }
  }

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1))

  const situations = [
    {
      id: 'active',
      title: 'Actively applying right now',
      subtitle: 'Sending applications, need results fast',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      id: 'preparing',
      title: 'Preparing to apply soon',
      subtitle: 'Getting ready, want to start strong',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      id: 'laid-off',
      title: 'Recently laid off',
      subtitle: 'Need to land something quickly',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      id: 'exploring',
      title: 'Exploring better opportunities',
      subtitle: 'Employed but open to something great',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" /></svg>,
    },
  ]

  const challenges = [
    {
      id: 'no-response',
      title: 'Sending applications but hearing nothing back',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
    },
    {
      id: 'ats',
      title: "Not sure if my resume passes ATS filters",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    },
    {
      id: 'bullets',
      title: "My bullets sound generic and weak",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    },
    {
      id: 'cover',
      title: "Cover letters take too long to write",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      id: 'tailor',
      title: "Tailoring my resume for each job is exhausting",
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
  ]

  const timelines = [
    { id: 'new', title: 'Just getting started', subtitle: 'Starting fresh' },
    { id: '1-3mo', title: '1 – 3 months', subtitle: 'Some momentum, need more traction' },
    { id: '3-6mo', title: '3 – 6 months', subtitle: 'Feeling the pressure' },
    { id: '6mo+', title: '6+ months', subtitle: 'Need results now' },
  ]

  const roleChips = ['Sales', 'Marketing', 'Engineering', 'Finance', 'Operations', 'Product', 'Design', 'HR', 'Accounting', 'Healthcare']

  const painMap = {
    'no-response': 'ShortListr scans the job description and shows you exactly which keywords are missing from your resume so you can see and address the gap.',
    'ats': 'ShortListr runs your resume through keyword analysis against any job description and returns a match score so you know where you stand.',
    'bullets': 'ShortListr rewrites your bullets using the STAR method with action verbs and metrics. You see the before and after and decide what to keep.',
    'cover': 'ShortListr generates a cover letter draft from your resume and the job description in under 30 seconds. Edit it before you send.',
    'tailor': 'ShortListr rewrites your resume to align with a specific job description in under 60 seconds. All output is AI-generated — review before submitting.',
  }

  const situationMap = {
    'active': "Here's what ShortListr does: it analyzes each job description and rewrites your resume to align with it. What you do with that output is up to you.",
    'preparing': "Good time to see how the tool works. Paste any job description and your resume and ShortListr will show you the keyword gaps and rewrite your bullets.",
    'laid-off': "ShortListr can help you quickly tailor your resume to different job descriptions. The output is AI-generated — always review it before submitting.",
    'exploring': "ShortListr lets you see how your current resume aligns with roles you're interested in, without committing to a full application.",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-navy-900 dark:via-navy-900 dark:to-navy-800 flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-slate-900 dark:text-white font-bold text-base">ShortListr</span>
        </div>
        {step > 0 && step < 6 && (
          <ProgressBar step={step} />
        )}
        {step > 0 && step < 6 && (
          <button
            onClick={finish}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Skip
          </button>
        )}
        {(step === 0 || step >= 6) && <div className="w-16" />}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg relative">

          {/* ── STEP 0: Welcome ── */}
          {step === 0 && (
            <StepWrapper visible>
              <div className="text-center">
                <div className="relative inline-block mb-8">
                  <Logo size={96} />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white dark:border-navy-900 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                  Welcome to ShortListr
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-2">
                  Hey <span className="text-slate-700 dark:text-slate-300 font-semibold">{firstName}</span>, we're glad you're here.
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
                  Let's take 60 seconds to personalize your experience. Your resume game is about to change.
                </p>

                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <button
                    onClick={next}
                    className="w-full bg-gradient-to-r from-electric-500 to-violet-500 hover:from-electric-400 hover:to-violet-400 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-electric-500/30 text-base"
                  >
                    Let's get started
                  </button>
                  <button
                    onClick={finish}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm transition-colors py-1"
                  >
                    Skip setup and go to dashboard
                  </button>
                </div>

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-6 mt-10 pt-8 border-t border-slate-200 dark:border-white/10">
                  {[
                    { value: '10K+', label: 'Resumes optimized' },
                    { value: '3×', label: 'More callbacks' },
                    { value: '< 60s', label: 'Per optimization' },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
                      <p className="text-xs text-slate-400">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </StepWrapper>
          )}

          {/* ── STEP 1: Situation ── */}
          {step === 1 && (
            <StepWrapper visible>
              <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/30">
                <div className="mb-7">
                  <p className="text-xs font-semibold text-electric-500 uppercase tracking-wider mb-2">Step 1 of 5</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">What best describes your situation?</h2>
                  <p className="text-slate-400 text-sm">We'll personalize ShortListr based on where you're at.</p>
                </div>
                <div className="space-y-3 mb-7">
                  {situations.map(s => (
                    <OptionCard
                      key={s.id}
                      icon={s.icon}
                      title={s.title}
                      subtitle={s.subtitle}
                      selected={situation === s.id}
                      onClick={() => setSituation(s.id)}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  disabled={!situation}
                  className="w-full bg-gradient-to-r from-electric-500 to-violet-500 hover:from-electric-400 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-electric-500/20 text-sm"
                >
                  Continue
                </button>
              </div>
            </StepWrapper>
          )}

          {/* ── STEP 2: Challenge ── */}
          {step === 2 && (
            <StepWrapper visible>
              <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/30">
                <div className="mb-7">
                  <p className="text-xs font-semibold text-electric-500 uppercase tracking-wider mb-2">Step 2 of 5</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">What's been your biggest challenge?</h2>
                  <p className="text-slate-400 text-sm">Be honest — this helps us focus on what matters most for you.</p>
                </div>
                <div className="space-y-3 mb-7">
                  {challenges.map(c => (
                    <OptionCard
                      key={c.id}
                      icon={c.icon}
                      title={c.title}
                      selected={challenge === c.id}
                      onClick={() => setChallenge(c.id)}
                    />
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={next}
                    disabled={!challenge}
                    className="flex-1 bg-gradient-to-r from-electric-500 to-violet-500 hover:from-electric-400 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-electric-500/20 text-sm"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* ── STEP 3: Target Role ── */}
          {step === 3 && (
            <StepWrapper visible>
              <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/30">
                <div className="mb-7">
                  <p className="text-xs font-semibold text-electric-500 uppercase tracking-wider mb-2">Step 3 of 5</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">What roles are you going after?</h2>
                  <p className="text-slate-400 text-sm">We'll tailor your keyword suggestions to match your industry.</p>
                </div>
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  placeholder="e.g. Marketing Manager, Sales Rep, Software Engineer…"
                  className="w-full bg-slate-50 dark:bg-navy-700 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-electric-500 focus:ring-1 focus:ring-electric-500/30 transition-colors text-sm mb-4"
                />
                <div className="flex flex-wrap gap-2 mb-7">
                  {roleChips.map(chip => (
                    <button
                      key={chip}
                      onClick={() => setTargetRole(chip)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                        targetRole === chip
                          ? 'bg-electric-500/10 border-electric-500/50 text-electric-600 dark:text-electric-400'
                          : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-electric-500/30 hover:text-electric-500'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={next}
                    className="flex-1 bg-gradient-to-r from-electric-500 to-violet-500 hover:from-electric-400 hover:to-violet-400 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-electric-500/20 text-sm"
                  >
                    {targetRole.trim() ? 'Continue' : 'Skip this step'}
                  </button>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* ── STEP 4: Timeline ── */}
          {step === 4 && (
            <StepWrapper visible>
              <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/30">
                <div className="mb-7">
                  <p className="text-xs font-semibold text-electric-500 uppercase tracking-wider mb-2">Step 4 of 5</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">How long have you been searching?</h2>
                  <p className="text-slate-400 text-sm">No judgment — just helps us understand your urgency.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-7">
                  {timelines.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTimeline(t.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        timeline === t.id
                          ? 'border-electric-500 bg-electric-500/5 dark:bg-electric-500/10'
                          : 'border-slate-200 dark:border-white/10 hover:border-electric-500/30'
                      }`}
                    >
                      <p className={`text-sm font-bold mb-0.5 ${timeline === t.id ? 'text-electric-600 dark:text-electric-400' : 'text-slate-800 dark:text-slate-200'}`}>{t.title}</p>
                      <p className="text-xs text-slate-400">{t.subtitle}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={next}
                    disabled={!timeline}
                    className="flex-1 bg-gradient-to-r from-electric-500 to-violet-500 hover:from-electric-400 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-electric-500/20 text-sm"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </StepWrapper>
          )}

          {/* ── STEP 5: Personalized Summary ── */}
          {step === 5 && (
            <StepWrapper visible>
              <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/30">
                <div className="mb-7 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-400/30">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-electric-500 uppercase tracking-wider mb-2">Step 5 of 5 — Your game plan</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">You're set up for success</h2>
                  <p className="text-slate-400 text-sm">
                    {situation ? situationMap[situation] : "Let's get your resume working for you."}
                  </p>
                </div>

                <div className="space-y-3 mb-7">
                  {/* Personalized pain point fix */}
                  {challenge && (
                    <div className="flex items-start gap-3 p-4 bg-electric-500/5 border border-electric-500/20 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-electric-500 flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{painMap[challenge]}</p>
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {targetRole
                        ? `Every optimization is tuned for ${targetRole} roles — keywords, tone, and bullet structure matched to what recruiters in your field expect.`
                        : 'Every optimization is tuned to the specific job description — keywords, tone, and bullet structure matched to exactly what recruiters want.'}
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      {timeline === '6mo+' || timeline === '3-6mo'
                        ? "You've been at this a while — let's reset your approach with a resume that's impossible to ignore."
                        : "You'll get your ATS score, optimized bullets, and a beautiful downloadable resume in under 60 seconds."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={next}
                  className="w-full bg-gradient-to-r from-electric-500 to-violet-500 hover:from-electric-400 hover:to-violet-400 text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-electric-500/20 text-sm"
                >
                  See what's included →
                </button>
              </div>
            </StepWrapper>
          )}

          {/* ── STEP 6: Paywall ── */}
          {step === 6 && (
            <StepWrapper visible>
              <div className="text-center mb-6">
                <p className="text-xs font-semibold text-electric-500 uppercase tracking-wider mb-2">One last thing</p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Unlock your full toolkit</h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  Choose monthly flexibility or own it forever. Both plans include everything.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

                {/* Monthly */}
                <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col">
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1">Monthly</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">$29</span>
                    <span className="text-slate-400 text-sm">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {['Unlimited optimizations', 'Full ATS keyword matching', 'AI bullet rewriting', 'Cover letter generation', 'Unlimited library', 'Cancel anytime'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                        <span className="text-electric-500 shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  {upgradeError && <p className="text-red-500 text-xs text-center mb-2">{upgradeError}</p>}
                  {isPro ? (
                    <button onClick={finish} className="w-full py-3 rounded-xl border border-electric-500 text-electric-600 dark:text-electric-400 text-sm font-semibold transition-colors">
                      You're on Pro — Go to Dashboard
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade('monthly')}
                      disabled={!!upgrading}
                      className="w-full py-3 rounded-xl border border-electric-500 text-electric-600 dark:text-electric-400 text-sm font-semibold hover:bg-electric-500/5 transition-colors disabled:opacity-50"
                    >
                      {upgrading === 'monthly' ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-electric-500/40 border-t-electric-500 rounded-full animate-spin" />
                          Redirecting…
                        </span>
                      ) : 'Start Monthly — $29/mo'}
                    </button>
                  )}
                </div>

                {/* Lifetime */}
                <div className="bg-gradient-to-b from-electric-500/10 to-violet-500/5 border-2 border-electric-500/50 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-electric-500 to-violet-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                    Best value
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1">Lifetime</h3>
                  <div className="flex items-baseline gap-1 mb-0.5">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">$149</span>
                    <span className="text-slate-400 text-sm">once</span>
                  </div>
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-4">Pay once, own forever — save 57%</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {['Everything in Monthly', 'Pay once — no renewals', 'All future updates included', 'Unlimited library', 'Priority support', 'Lifetime access'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                        <span className="text-electric-500 shrink-0 font-bold">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  {upgradeError && <p className="text-red-500 text-xs text-center mb-2">{upgradeError}</p>}
                  {isPro ? (
                    <button onClick={finish} className="w-full py-3 rounded-xl bg-gradient-to-r from-electric-500 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-electric-500/25 transition-all">
                      You're on Pro — Go to Dashboard
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade('lifetime')}
                      disabled={!!upgrading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-electric-500 to-violet-500 hover:from-electric-400 hover:to-violet-400 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-electric-500/25 transition-all"
                    >
                      {upgrading === 'lifetime' ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Redirecting…
                        </span>
                      ) : 'Get Lifetime — $149 once'}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-center text-xs text-slate-400">
                30-day money-back guarantee · No hidden fees · Secure checkout via Stripe
              </p>
            </StepWrapper>
          )}

        </div>
      </div>
    </div>
  )
}
