import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { startCheckout } from '../lib/stripe'
import Logo from '../components/ui/Logo'

const TOTAL_STEPS = 3

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

const PRACTICE_SIZES = [
  {
    id: 'just-starting',
    title: 'Just starting out',
    subtitle: '0–1 active clients',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  },
  {
    id: 'handful',
    title: 'A handful of clients',
    subtitle: '2–5 active clients',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-7.13a4 4 0 110 8 4 4 0 010-8z" /></svg>,
  },
  {
    id: 'growing',
    title: 'Growing practice',
    subtitle: '6–15 active clients',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14" /></svg>,
  },
  {
    id: 'established',
    title: 'Established practice',
    subtitle: '16+ active clients',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2M5 21h2m4-12h4m-4 4h4m-4 4h4" /></svg>,
  },
]

export default function Welcome() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const isPro = profile?.tier === 'pro'

  const [step, setStep] = useState(0)
  // Not persisted — coaches has no practice-size field yet and this is
  // only used to tailor onboarding copy, not stored anywhere.
  const [practiceSize, setPracticeSize] = useState(null)
  const [upgrading, setUpgrading] = useState(null) // 'monthly' | null
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-navy-900 dark:via-navy-900 dark:to-navy-800 flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-slate-900 dark:text-white font-bold text-base">ShortListr</span>
        </div>
        {step > 0 && step < TOTAL_STEPS - 1 && (
          <ProgressBar step={step} />
        )}
        {step > 0 && step < TOTAL_STEPS - 1 && (
          <button
            onClick={finish}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Skip
          </button>
        )}
        {(step === 0 || step >= TOTAL_STEPS - 1) && <div className="w-16" />}
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
                  Let's take 30 seconds to set up your coaching practice.
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

          {/* ── STEP 1: Practice size ── */}
          {step === 1 && (
            <StepWrapper visible>
              <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/30">
                <div className="mb-7">
                  <p className="text-xs font-semibold text-electric-500 uppercase tracking-wider mb-2">Step 1 of 2</p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">How many clients are you coaching right now?</h2>
                  <p className="text-slate-400 text-sm">Just helps us understand your practice — you'll add clients next.</p>
                </div>
                <div className="space-y-3 mb-7">
                  {PRACTICE_SIZES.map(p => (
                    <OptionCard
                      key={p.id}
                      icon={p.icon}
                      title={p.title}
                      subtitle={p.subtitle}
                      selected={practiceSize === p.id}
                      onClick={() => setPracticeSize(p.id)}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  disabled={!practiceSize}
                  className="w-full bg-gradient-to-r from-electric-500 to-violet-500 hover:from-electric-400 hover:to-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition-all shadow-lg shadow-electric-500/20 text-sm"
                >
                  Continue
                </button>
              </div>
            </StepWrapper>
          )}

          {/* ── STEP 2: Paywall ── */}
          {step === 2 && (
            <StepWrapper visible>
              <div className="text-center mb-6">
                <p className="text-xs font-semibold text-electric-500 uppercase tracking-wider mb-2">One last thing</p>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Set up your coaching practice</h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  One plan, unlimited clients.
                </p>
              </div>

              <div className="max-w-sm mx-auto mb-6">
                <div className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col">
                  <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-1">Coach Plan</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">$99</span>
                    <span className="text-slate-400 text-sm">/month</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {['Unlimited clients', 'Full ATS keyword matching', 'AI bullet rewriting', 'Cover letter generation', 'Client resume version history', 'Cancel anytime'].map(f => (
                      <li key={f} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                        <span className="text-electric-500 shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  {upgradeError && <p className="text-red-500 text-xs text-center mb-2">{upgradeError}</p>}
                  {isPro ? (
                    <button onClick={finish} className="w-full py-3 rounded-xl bg-gradient-to-r from-electric-500 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-electric-500/25 transition-all">
                      You're all set — Go to Dashboard
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade('monthly')}
                      disabled={!!upgrading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-electric-500 to-violet-500 hover:from-electric-400 hover:to-violet-400 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-electric-500/25 transition-all"
                    >
                      {upgrading === 'monthly' ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Redirecting…
                        </span>
                      ) : 'Start — $99/mo'}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-center text-xs text-slate-400">
                30-day money-back guarantee · No hidden fees · Secure checkout via Stripe
              </p>

              {!isPro && (
                <button
                  onClick={finish}
                  className="block w-full text-center text-xs mt-4 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)' }}
                >
                  Maybe later — go to dashboard
                </button>
              )}
            </StepWrapper>
          )}

        </div>
      </div>
    </div>
  )
}
