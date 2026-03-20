import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/ui/Logo'

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const GitHubIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
)

/* ── Password strength ───────────────────────────────────────── */
const checks = [
  { id: 'len',     label: 'At least 8 characters',      test: p => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter',        test: p => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter',        test: p => /[a-z]/.test(p) },
  { id: 'number',  label: 'One number',                  test: p => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#$…)', test: p => /[^A-Za-z0-9]/.test(p) },
]

function getStrength(password) {
  const passed = checks.filter(c => c.test(password)).length
  if (!password) return null
  if (passed <= 1) return { score: 1, label: 'Very weak',  color: '#ef4444', track: 'bg-red-500' }
  if (passed === 2) return { score: 2, label: 'Weak',       color: '#f97316', track: 'bg-orange-500' }
  if (passed === 3) return { score: 3, label: 'Fair',       color: '#eab308', track: 'bg-yellow-500' }
  if (passed === 4) return { score: 4, label: 'Good',       color: '#22c55e', track: 'bg-green-500' }
  return               { score: 5, label: 'Strong',      color: '#10b981', track: 'bg-emerald-500' }
}

function PasswordStrength({ password }) {
  const strength = getStrength(password)
  if (!password) return null

  return (
    <div style={{ animation: 'authSlideIn 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
      {/* Segmented bar */}
      <div className="flex gap-1 mt-2 mb-3">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${strength.score >= i ? strength.track : ''}`}
              style={{ width: strength.score >= i ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Label */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-semibold transition-colors duration-300" style={{ color: strength.color }}>
          {strength.label}
        </span>
        <span className="text-[10px] text-slate-400">{strength.score}/5</span>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => {
          const passed = c.test(password)
          return (
            <div key={c.id} className={`flex items-center gap-1.5 text-[11px] transition-colors duration-200 ${passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${passed ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`}>
                {passed && (
                  <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {c.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Stagger-animated form child ─────────────────────────────── */
function FadeItem({ children, index, entering }) {
  return (
    <div style={entering ? {
      animation: `authSlideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both`,
      animationDelay: `${index * 55}ms`,
    } : {}}>
      {children}
    </div>
  )
}

/* ── Left panel floating cards ───────────────────────────────── */
function FloatingCards() {
  return (
    <div className="w-full max-w-sm mx-auto mt-8 mb-6 space-y-3">
      <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-2xl"
        style={{ animation: 'floatA 7s ease-in-out infinite', willChange: 'transform' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/60 text-[10px] uppercase tracking-wider">ATS Match Score</p>
            <p className="text-white font-bold text-2xl leading-none mt-0.5">94<span className="text-white/50 text-sm font-normal">%</span></p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-400/20 border border-green-400/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-[94%] bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
        </div>
        <p className="text-white/40 text-[10px] mt-2">Marketing Manager · Apex Corp</p>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 shadow-2xl ml-4"
        style={{ animation: 'floatB 8s ease-in-out infinite', animationDelay: '1.2s', willChange: 'transform' }}>
        <p className="text-white/50 text-[9px] uppercase tracking-wider mb-1.5">AI Bullet Rewrite</p>
        <p className="text-white/90 text-[11px] font-medium leading-relaxed">
          "Increased regional revenue by 34% YoY by restructuring a 12-person sales team and implementing a new CRM workflow."
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[9px] bg-electric-500/20 text-electric-400 border border-electric-500/30 px-1.5 py-0.5 rounded-full font-medium">+34% impact</span>
          <span className="text-[9px] bg-violet-500/20 text-violet-400 border border-violet-500/30 px-1.5 py-0.5 rounded-full font-medium">ATS ready</span>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 shadow-2xl mr-4 flex items-center gap-3"
        style={{ animation: 'floatC 9s ease-in-out infinite', animationDelay: '2.5s', willChange: 'transform' }}>
        <div className="w-9 h-9 rounded-xl bg-electric-500/30 border border-electric-500/40 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-electric-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-white text-xs font-semibold">Interview request received</p>
          <p className="text-white/50 text-[10px]">Horizon Brands · 2 min ago</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-green-400 rounded-full shrink-0 animate-pulse" />
      </div>
    </div>
  )
}

export default function Auth() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  const [displayMode, setDisplayMode] = useState(initialMode)
  const [phase, setPhase] = useState('idle')   // 'idle' | 'out' | 'in'
  const [animKey, setAnimKey] = useState(0)     // bumping this remounts form content → restarts stagger

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)
  const [focusedField, setFocusedField] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const { signIn, signUp, signInWithProvider, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    const ageMs = Date.now() - new Date(user.created_at).getTime()
    const isNewAccount = ageMs < 5 * 60 * 1000
    const hasOnboarded = localStorage.getItem(`sl_onboarded_${user.id}`)
    if (isNewAccount && !hasOnboarded) {
      navigate('/welcome', { replace: true })
    } else {
      if (!hasOnboarded) localStorage.setItem(`sl_onboarded_${user.id}`, '1')
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const switchMode = () => {
    if (phase !== 'idle') return
    setPhase('out')
    setMessage(null)
    setTimeout(() => {
      setDisplayMode(m => m === 'signin' ? 'signup' : 'signin')
      setAnimKey(k => k + 1)
      setPhase('in')
      setTimeout(() => setPhase('idle'), 600)
    }, 220)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      if (displayMode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const strength = getStrength(password)
        if (!strength || strength.score < 3) {
          throw new Error('Please choose a stronger password before continuing.')
        }
        const { data, error } = await signUp(email, password)
        if (error) throw error
        if (!data.session) {
          setMessage({ type: 'info', text: 'Account created! Check your email for the confirmation link.' })
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleSocial = async (providerId) => {
    setSocialLoading(providerId)
    const { error } = await signInWithProvider(providerId)
    if (error) {
      setMessage({ type: 'error', text: error.message })
      setSocialLoading(null)
    }
  }

  const isSignup = displayMode === 'signup'

  // Outer wrapper animation state
  const outerStyle = phase === 'out'
    ? { opacity: 0, transform: 'translateY(-12px)', transition: 'opacity 0.2s ease, transform 0.2s ease' }
    : { opacity: 1, transform: 'translateY(0)', transition: 'opacity 0.3s ease, transform 0.3s ease' }

  return (
    <>
      <style>{`
        @keyframes floatA {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          40% { transform: translateY(-9px) rotate(0.4deg); }
          70% { transform: translateY(-4px) rotate(-0.3deg); }
        }
        @keyframes floatB {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          35% { transform: translateY(-7px) rotate(-0.4deg); }
          65% { transform: translateY(-11px) rotate(0.4deg); }
        }
        @keyframes floatC {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes authSlideIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blobShift {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(30px,-20px) scale(1.15); }
        }
      `}</style>

      <div className="min-h-screen flex">

        {/* ══ LEFT PANEL ══════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">

          {/* Background layers — cross-fade between signin (blue) and signup (violet) */}
          <div className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: isSignup ? 0 : 1, background: 'linear-gradient(140deg, #060d1f 0%, #0d1f3c 45%, #0f0d28 100%)' }} />
          <div className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: isSignup ? 1 : 0, background: 'linear-gradient(140deg, #08051e 0%, #120d38 45%, #1a0830 100%)' }} />

          {/* Grid dots */}
          <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.055)_1px,transparent_0)] [background-size:30px_30px]" />

          {/* Glow blob — sign-in (blue) */}
          <div className="absolute top-1/4 left-1/4 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none transition-opacity duration-700"
            style={{ opacity: isSignup ? 0 : 1, background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)', animation: 'blobShift 12s ease-in-out infinite' }} />
          <div className="absolute bottom-1/4 right-4 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-opacity duration-700"
            style={{ opacity: isSignup ? 0 : 1, background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', animation: 'blobShift 15s ease-in-out infinite reverse' }} />

          {/* Glow blob — sign-up (violet) */}
          <div className="absolute top-1/4 right-1/4 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none transition-opacity duration-700"
            style={{ opacity: isSignup ? 1 : 0, background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', animation: 'blobShift 11s ease-in-out infinite' }} />
          <div className="absolute bottom-1/3 left-4 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-opacity duration-700"
            style={{ opacity: isSignup ? 1 : 0, background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)', animation: 'blobShift 14s ease-in-out infinite reverse' }} />

          {/* Logo */}
          <Link to="/" className="relative flex items-center gap-2.5 w-fit z-10">
            <Logo size={32} />
            <span className="text-white font-bold text-lg tracking-tight">ShortListr</span>
          </Link>

          {/* Center text — two layers cross-fading */}
          <div className="relative flex-1 flex flex-col justify-center -mt-8 z-10">
            <div className="relative">

              {/* Sign-in text */}
              <div className="transition-all duration-500"
                style={{ opacity: isSignup ? 0 : 1, transform: isSignup ? 'translateY(-10px)' : 'translateY(0)', position: isSignup ? 'absolute' : 'relative', pointerEvents: isSignup ? 'none' : 'auto', top: 0 }}>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-4">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                  Welcome back
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold text-white leading-tight mt-4 mb-4">
                  Good to see<br />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">you again</span>
                </h2>
                <p className="text-white/50 text-base leading-relaxed max-w-xs">
                  Your saved resume versions are waiting. Continue optimizing for new roles.
                </p>
              </div>

              {/* Sign-up text */}
              <div className="transition-all duration-500"
                style={{ opacity: isSignup ? 1 : 0, transform: isSignup ? 'translateY(0)' : 'translateY(10px)', position: isSignup ? 'relative' : 'absolute', pointerEvents: isSignup ? 'auto' : 'none', top: 0 }}>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full mb-4">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                  Free to start
                </span>
                <h2 className="text-2xl sm:text-4xl font-bold text-white leading-tight mt-4 mb-4">
                  Your resume,<br />
                  <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">optimized in 60s</span>
                </h2>
                <p className="text-white/50 text-base leading-relaxed max-w-xs">
                  Paste your resume and a job description. AI analyzes the gap and rewrites your content for that specific role.
                </p>
              </div>
            </div>

            <FloatingCards />

            {/* Stats */}
            <div className="relative flex items-center gap-8 mt-2">
              {[
                { value: '10K+', label: 'Resumes optimized' },
                { value: '4',    label: 'AI-powered tools' },
                { value: '60s',  label: 'Avg. optimization' },
              ].map((s, i) => (
                <div key={s.label} className="relative">
                  {i > 0 && <div className="absolute -left-4 top-1 bottom-1 w-px bg-white/10" />}
                  <p className="text-white font-bold text-xl">{s.value}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="relative z-10 border-t border-white/10 pt-6">
            <p className="text-white/40 text-xs leading-relaxed">
              All output is AI-generated. Review everything before submitting. Results are not guaranteed.
            </p>
          </div>
        </div>

        {/* ══ RIGHT PANEL ═════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col bg-white dark:bg-navy-900 transition-colors duration-700">

          {/* Top bar with back link */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <Link to="/" className="lg:hidden flex items-center gap-2">
              <Logo size={28} />
              <span className="text-slate-900 dark:text-white font-bold">ShortListr</span>
            </Link>
            <div className="hidden lg:block" />
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 py-10">
            <div className="w-full max-w-[400px]">

              {/* ── Toggle — spring sliding pill ── */}
              <div className="relative flex bg-slate-100 dark:bg-navy-800 rounded-2xl p-1 mb-8">
                {/* Sliding pill */}
                <div
                  className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-white dark:bg-navy-700 shadow-sm transition-all duration-[380ms]"
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transform: isSignup ? 'translateX(calc(100% + 8px))' : 'translateX(0)',
                  }}
                />
                <button
                  onClick={() => isSignup && switchMode()}
                  className={`relative flex-1 py-2.5 rounded-xl text-sm font-semibold z-10 transition-colors duration-300 ${
                    !isSignup ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => !isSignup && switchMode()}
                  className={`relative flex-1 py-2.5 rounded-xl text-sm font-semibold z-10 transition-colors duration-300 ${
                    isSignup ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* ── Animated form wrapper ── */}
              <div style={outerStyle}>

                {/* Stagger-animated content — remounts on every switch via animKey */}
                <div key={animKey}>

                  <FadeItem index={0} entering={phase === 'in'}>
                    <div className="mb-7">
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {isSignup ? 'Create your account' : 'Welcome back'}
                      </h1>
                      <p className="text-slate-400 dark:text-slate-500 text-sm">
                        {isSignup
                          ? 'Start optimizing your resume for free — no credit card needed.'
                          : 'Sign in to continue to your dashboard.'}
                      </p>
                    </div>
                  </FadeItem>

                  <FadeItem index={1} entering={phase === 'in'}>
                    <div className="space-y-2.5 mb-6">
                      <button
                        onClick={() => handleSocial('google')}
                        disabled={!!socialLoading}
                        className="w-full flex items-center justify-center gap-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 text-sm font-medium transition-all hover:shadow-sm"
                      >
                        {socialLoading === 'google'
                          ? <span className="w-5 h-5 border-2 border-slate-300 dark:border-white/20 border-t-electric-500 rounded-full animate-spin" />
                          : <GoogleIcon />}
                        Continue with Google
                      </button>
                      <button
                        onClick={() => handleSocial('github')}
                        disabled={!!socialLoading}
                        className="w-full flex items-center justify-center gap-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 text-sm font-medium transition-all hover:shadow-sm"
                      >
                        {socialLoading === 'github'
                          ? <span className="w-5 h-5 border-2 border-slate-300 dark:border-white/20 border-t-electric-500 rounded-full animate-spin" />
                          : <GitHubIcon />}
                        Continue with GitHub
                      </button>
                    </div>
                  </FadeItem>

                  <FadeItem index={2} entering={phase === 'in'}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                      <span className="text-slate-400 dark:text-slate-600 text-xs font-medium">or with email</span>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-white/10" />
                    </div>
                  </FadeItem>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <FadeItem index={3} entering={phase === 'in'}>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="you@example.com"
                          className={`w-full bg-slate-50 dark:bg-navy-800 border rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all text-sm ${
                            focusedField === 'email'
                              ? 'border-electric-500 ring-2 ring-electric-500/15 scale-[1.01]'
                              : 'border-slate-200 dark:border-white/10'
                          }`}
                        />
                      </div>
                    </FadeItem>

                    <FadeItem index={4} entering={phase === 'in'}>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            placeholder="••••••••"
                            className={`w-full bg-slate-50 dark:bg-navy-800 border rounded-xl px-4 py-3 pr-11 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none transition-all text-sm ${
                              focusedField === 'password'
                                ? 'border-electric-500 ring-2 ring-electric-500/15 scale-[1.01]'
                                : 'border-slate-200 dark:border-white/10'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          >
                            {showPassword ? (
                              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {isSignup && <PasswordStrength password={password} />}
                      </div>
                    </FadeItem>

                    {message && (
                      <FadeItem index={5} entering>
                        <div className={`text-sm rounded-xl px-4 py-3 border ${
                          message.type === 'error'
                            ? 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-400/10 dark:border-red-400/20'
                            : 'text-blue-600 bg-blue-50 border-blue-200 dark:text-electric-300 dark:bg-electric-500/10 dark:border-electric-500/20'
                        }`}>
                          {message.text}
                        </div>
                      </FadeItem>
                    )}

                    <FadeItem index={5} entering={phase === 'in'}>
                      <button
                        type="submit"
                        disabled={loading}
                        className={`w-full relative overflow-hidden text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-1 ${
                          isSignup
                            ? 'bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-400 hover:to-pink-400 shadow-violet-500/25 hover:shadow-violet-500/40'
                            : 'bg-gradient-to-r from-electric-500 to-blue-600 hover:from-electric-400 hover:to-blue-500 shadow-electric-500/25 hover:shadow-electric-500/40'
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Please wait…
                          </span>
                        ) : isSignup ? 'Create Free Account' : 'Sign In'}
                      </button>
                    </FadeItem>
                  </form>

                  {isSignup && (
                    <FadeItem index={6} entering={phase === 'in'}>
                      <p className="text-center text-slate-400 dark:text-slate-600 text-xs mt-5 leading-relaxed">
                        By signing up you agree to our{' '}
                        <Link to="/terms" className="text-electric-500 hover:underline">Terms</Link>{' '}and{' '}
                        <Link to="/privacy" className="text-electric-500 hover:underline">Privacy Policy</Link>.
                      </p>
                    </FadeItem>
                  )}

                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  )
}
